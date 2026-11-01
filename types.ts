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
