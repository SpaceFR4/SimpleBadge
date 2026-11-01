import "./styles.css";

import { addProfileBadge, BadgePosition, BadgeRarity, ProfileBadge, removeProfileBadge } from "@api/Badges";
import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { showNotification } from "@api/Notifications";
import { Button } from "@components/Button";
import definePlugin from "@utils/types";
import { Menu, openModal, React, useEffect, useState, UserStore } from "@webpack/common";

import { BadgeCustomizerModal } from "./components/BadgeCustomizerModal";
import { settings } from "./settings";
import {
    ensureSecret,
    fetchRemoteBadges,
    getBadgesForUser,
    getMyBadges,
    getSyncStatus,
    publishMyBadges,
    startPolling,
    stopPolling,
    subscribe
} from "./store";

const SIMPLE_BADGE_PROVIDER_ID = "simple-badge-provider";

export function openBadgeStudio() {
    openModal(modalProps => (
        <BadgeCustomizerModal modalProps={modalProps} />
    ));
}

const simpleBadgeProvider: ProfileBadge = {
    id: SIMPLE_BADGE_PROVIDER_ID,
    position: BadgePosition.START,
    getBadges({ userId }) {
        try {
            const userBadges = getBadgesForUser(userId);
            if (!userBadges || userBadges.length === 0) return [];

            return userBadges.map((badge, idx) => ({
                id: `sb-${userId}-${badge.id}-${idx}`,
                key: badge.name,
                description: badge.description || badge.name,
                iconSrc: badge.iconSrc,
                link: badge.link,
                name: badge.name,
                detail: badge.description,
                infoLabel: badge.infoLabel || "SimpleBadge",
                rarity: BadgeRarity.RARE
            }));
        } catch {
            return [];
        }
    }
};

function SettingsPanel() {
    const [, setTick] = useState(0);
    useEffect(() => subscribe(() => setTick(t => t + 1)), []);

    const myBadges = getMyBadges();
    const sync = getSyncStatus();
    const statusState = sync.state === "synced" ? "good" : sync.state === "syncing" ? "waiting" : "bad";
    const statusText = statusState === "good" ? "Online" : statusState === "waiting" ? "Syncing…" : "Offline";

    return (
        <div className="md-card">
            <div className="md-head">
                <div className="md-head-text">
                    <div className="md-head-title">Badge Creator</div>
                    <div className="md-head-line">
                        {sync.userCount} user profile{sync.userCount === 1 ? "" : "s"} live on the network
                    </div>
                </div>
                <span className={`md-status md-status-${statusState}`}>
                    <span className="md-status-dot" />
                    {statusText}
                </span>
            </div>

            <p className="md-copy">
                Voice Radar-style visual studio. Create custom animated badges, gradient colors, aura glow and glowing username styles shared across all plugin users.
            </p>

            <div className="md-preview-badges">
                {myBadges.length > 0 ? (
                    myBadges.map((b, i) => (
                        <span key={`${b.id}-${i}`} className="md-pill-badge">
                            {b.iconSrc ? <img src={b.iconSrc} alt="" /> : <span>✨</span>}
                            <span>{b.name}</span>
                        </span>
                    ))
                ) : (
                    <span className="md-pill-badge">
                        <span>NO BADGE</span>
                    </span>
                )}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <Button size="small" variant="primary" onClick={openBadgeStudio}>
                    Open Badge Creator
                </Button>
                <Button
                    size="small"
                    variant="secondary"
                    onClick={async () => {
                        try {
                            await publishMyBadges();
                            showNotification({
                                title: "Badge Creator",
                                body: "Style successfully published"
                            });
                        } catch (err: any) {
                            showNotification({
                                title: "Badge Creator",
                                body: err?.message || "Failed to publish"
                            });
                        }
                    }}
                >
                    Publish
                </Button>
                <Button size="small" variant="secondary" onClick={() => void fetchRemoteBadges(true)}>
                    Refresh
                </Button>
            </div>
        </div>
    );
}

const UserContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: { user: any; }) => {
    const me = UserStore.getCurrentUser();
    if (!user || (user.id !== me?.id && !user.isCurrentUser)) return;

    const item = (
        <Menu.MenuItem
            id="vc-simple-badge-studio"
            label="Badge Studio"
            action={openBadgeStudio}
        />
    );

    if (Array.isArray(children)) {
        const last = children[children.length - 1];
        if (last && Array.isArray(last.props?.children)) {
            last.props.children.push(item);
        } else {
            children.push(item);
        }
    }
};

export default definePlugin({
    name: "SimpleBadge",
    description: "Add every Discord badge (Nitro, Dev, Bot, Booster, Staff...)",
    authors: [{ name: "Space", id: 1013772504675922041n }],
    settings,
    settingsAboutComponent: () => <SettingsPanel />,
    toolboxActions: {
        "Badge Creator": openBadgeStudio,
        "Sync badges": () => void fetchRemoteBadges(true)
    },
    commands: [
        {
            name: "simplebadge",
            description: "Open the SimpleBadge badge studio",
            execute: () => {
                openBadgeStudio();
            }
        }
    ],
    contextMenus: {
        "user-context": UserContextMenuPatch,
        "user-profile-actions": UserContextMenuPatch
    },

    start() {
        try {
            ensureSecret();
        } catch { }
        try {
            addProfileBadge(simpleBadgeProvider);
        } catch { }
        try {
            startPolling();
        } catch { }
    },

    stop() {
        try {
            stopPolling();
        } catch { }
        try {
            removeProfileBadge(simpleBadgeProvider);
        } catch { }
    }
});
