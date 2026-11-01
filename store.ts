import { UserStore } from "@webpack/common";

import { settings } from "./settings";
import {
    BadgeDefinition,
    compareVersions,
    DEFAULT_API_URL,
    PLUGIN_VERSION,
    RemoteDatabase,
    REPO_URL,
    SyncState,
    SyncStatusInfo,
    UpdateInfo
} from "./types";

declare const VencordNative: any;

let remoteDatabase: RemoteDatabase = {};
let syncState: SyncState = "idle";
let syncError = "";
let lastSyncTime = 0;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let startTimer: ReturnType<typeof setTimeout> | null = null;
let updateTimer: ReturnType<typeof setTimeout> | null = null;

let latestUpdate: UpdateInfo | null = null;
let acknowledgedVersion = "";
let updateListener: ((info: UpdateInfo) => void) | null = null;

const listeners = new Set<() => void>();

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emit() {
    for (const listener of listeners) {
        try {
            listener();
        } catch {}
    }
}

export function getSyncStatus(): SyncStatusInfo {
    return {
        state: syncState,
        userCount: Object.keys(remoteDatabase).length,
        lastSyncTime,
        error: syncError || undefined
    };
}

export function getRemoteDatabase(): RemoteDatabase {
    return remoteDatabase;
}

export function getCleanApiUrl(): string {
    return DEFAULT_API_URL.trim().replace(/\/+$/, "");
}

export function generateSecret(): string {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

export function ensureSecret(): string {
    try {
        if (!settings.store.mySecret || settings.store.mySecret.trim().length < 16) {
            settings.store.mySecret = generateSecret();
        }
        return settings.store.mySecret.trim();
    } catch {
        return generateSecret();
    }
}

export function parseLocalDatabase(): RemoteDatabase {
    try {
        const raw = settings.store.userBadges;
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null) return {};
        return parsed as RemoteDatabase;
    } catch {
        return {};
    }
}

export function saveLocalDatabase(db: RemoteDatabase) {
    try {
        settings.store.userBadges = JSON.stringify(db);
        emit();
    } catch {}
}

export function getMyBadges(): BadgeDefinition[] {
    const me = UserStore.getCurrentUser();
    if (!me) return [];

    const localDb = parseLocalDatabase();
    if (localDb[me.id]?.badges) {
        return localDb[me.id].badges;
    }

    if (remoteDatabase[me.id]?.badges) {
        return remoteDatabase[me.id].badges;
    }

    return [];
}

export function saveMyBadgesLocally(badges: BadgeDefinition[]) {
    const me = UserStore.getCurrentUser();
    if (!me) return;

    const localDb = parseLocalDatabase();
    localDb[me.id] = {
        badges,
        username: me.username,
        updatedAt: Date.now(),
        localOnly: true
    };
    saveLocalDatabase(localDb);
    emit();
}

export function getBadgesForUser(userId: string): BadgeDefinition[] {
    if (!userId) return [];

    const localDb = parseLocalDatabase();
    if (localDb[userId]?.badges) {
        return localDb[userId].badges;
    }

    if (remoteDatabase[userId]?.badges) {
        return remoteDatabase[userId].badges;
    }

    return [];
}

async function safeFetch(url: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeout);
        const text = await res.text();
        let data = null;
        try {
            data = JSON.parse(text);
        } catch {}
        return { ok: res.ok, status: res.status, data };
    } catch (err: any) {
        try {
            const Native = (typeof VencordNative !== "undefined" && (VencordNative as any)?.pluginHelpers?.SimpleBadge) as any;
            if (Native?.nativeFetch) {
                const res = await Native.nativeFetch(url, options);
                let data = null;
                try {
                    data = JSON.parse(res.text);
                } catch {}
                return { ok: res.ok, status: res.status, data };
            }
        } catch {}
        return { ok: false, status: 0, data: null, error: err?.message || "Failed to fetch" };
    }
}

export async function fetchRemoteBadges(force = false): Promise<void> {
    const apiUrl = getCleanApiUrl();
    if (!apiUrl) return;

    syncState = "syncing";
    emit();

    try {
        const res = await safeFetch(`${apiUrl}/badges?t=${Date.now()}${force ? "&force=1" : ""}`);

        if (res.ok && res.data && typeof res.data === "object") {
            remoteDatabase = res.data as RemoteDatabase;
            syncState = "synced";
            syncError = "";
            lastSyncTime = Date.now();
        } else {
            syncState = "error";
            syncError = res.error || "Worker unreachable";
        }
    } catch (err: any) {
        syncState = "error";
        syncError = err?.message || "Connection failed";
    } finally {
        emit();
    }
}

export async function publishMyBadges(badges?: BadgeDefinition[]): Promise<void> {
    const me = UserStore.getCurrentUser();
    if (!me) {
        throw new Error("You are not logged in to Discord.");
    }

    const badgeList = badges ?? getMyBadges();
    saveMyBadgesLocally(badgeList);

    const apiUrl = getCleanApiUrl();
    const secret = ensureSecret();

    syncState = "syncing";
    emit();

    try {
        const payload = {
            userId: me.id,
            username: me.globalName || me.username,
            secret,
            badges: badgeList
        };

        const res = await safeFetch(`${apiUrl}/publish`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(res.data?.error || `Publish error (${res.status || "network unreachable"})`);
        }

        remoteDatabase[me.id] = {
            badges: badgeList,
            username: me.globalName || me.username,
            updatedAt: Date.now(),
            localOnly: false
        };

        syncState = "synced";
        syncError = "";
        lastSyncTime = Date.now();

        void fetchRemoteBadges(true);
    } catch (err: any) {
        syncState = "error";
        syncError = err?.message || "Error while publishing";
        throw err;
    } finally {
        emit();
    }
}

export async function unpublishMyBadges(): Promise<void> {
    const me = UserStore.getCurrentUser();
    if (!me) return;

    const apiUrl = getCleanApiUrl();
    const secret = ensureSecret();

    if (!apiUrl) return;

    try {
        await safeFetch(`${apiUrl}/unpublish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: me.id, secret })
        });
    } catch {}

    delete remoteDatabase[me.id];
    emit();
}

export function getUpdateInfo(): UpdateInfo | null {
    return latestUpdate;
}

export function setUpdateListener(listener: ((info: UpdateInfo) => void) | null) {
    updateListener = listener;
}
export function acknowledgeUpdate(version: string) {
    acknowledgedVersion = version;
}

export async function checkForUpdate(): Promise<void> {
    const apiUrl = getCleanApiUrl();
    if (!apiUrl) return;

    try {
        const res = await safeFetch(`${apiUrl}/version?t=${Date.now()}`);
        const data = res.data as any;
        if (!res.ok || !data || typeof data.version !== "string") return;

        const info: UpdateInfo = {
            version: data.version.trim(),
            changelog: Array.isArray(data.changelog)
                ? data.changelog.filter((line: unknown) => typeof line === "string").slice(0, 10)
                : [],
            url: typeof data.url === "string" ? data.url : REPO_URL
        };

        if (compareVersions(info.version, PLUGIN_VERSION) <= 0) {
            if (latestUpdate) {
                latestUpdate = null;
                emit();
            }
            return;
        }

        latestUpdate = info;
        emit();

        if (acknowledgedVersion !== info.version) {
            updateListener?.(info);
        }
    } catch {}
}

export function startPolling() {
    stopPolling();

    startTimer = setTimeout(() => void fetchRemoteBadges(), 1000);
    updateTimer = setTimeout(() => void checkForUpdate(), 5000);

    pollTimer = setInterval(() => {
        void fetchRemoteBadges();
        void checkForUpdate();
    }, 2 * 60 * 1000);
}

export function stopPolling() {
    if (startTimer) {
        clearTimeout(startTimer);
        startTimer = null;
    }
    if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = null;
    }
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}