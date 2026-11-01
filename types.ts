export type BadgeCategory =
    | "all"
    | "nitro"
    | "boost"
    | "staff"
    | "hypesquad"
    | "devs"
    | "special"
    | "custom";

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    category: Exclude<BadgeCategory, "all">;
    iconSrc: string;
    link?: string;
    infoLabel?: string;
    detail?: string;
    custom?: boolean;
}

export interface UserBadgeConfig {
    badges: BadgeDefinition[];
    username?: string;
    updatedAt?: number;
    localOnly?: boolean;
}

export type RemoteDatabase = Record<string, UserBadgeConfig>;

export type SyncState = "idle" | "syncing" | "synced" | "error";

export interface SyncStatusInfo {
    state: SyncState;
    userCount: number;
    lastSyncTime: number;
    error?: string;
}

export const DEFAULT_API_URL = "https://simplebadge-api.kefoxx-fortnite.workers.dev";

export const PLUGIN_VERSION = "1.0.0";

export const REPO_URL = "https://github.com/SpaceFR4/SimpleBadge";

export interface UpdateInfo {
    version: string;
    changelog: string[];
    url: string;
}

/** Returns 1 if a > b, -1 if a < b, 0 if equal (e.g. "1.10.0" > "1.9.2"). */
export function compareVersions(a: string, b: string): number {
    const clean = (v: string) => String(v).trim().replace(/^v/i, "").split(".").map(n => parseInt(n, 10) || 0);
    const pa = clean(a);
    const pb = clean(b);
    const len = Math.max(pa.length, pb.length);

    for (let i = 0; i < len; i++) {
        const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (diff !== 0) return diff > 0 ? 1 : -1;
    }
    return 0;
}