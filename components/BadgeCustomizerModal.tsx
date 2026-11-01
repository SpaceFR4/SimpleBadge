import { Button } from "@components/Button";
import type { RenderModalProps } from "@vencord/discord-types";
import { Modal, React, useEffect, useMemo, useState, UserStore } from "@webpack/common";

import { BADGES_CATALOG, CATEGORY_LABELS } from "../badgesCatalog";
import {
    fetchRemoteBadges,
    getMyBadges,
    getRemoteDatabase,
    getSyncStatus,
    publishMyBadges,
    saveMyBadgesLocally,
    subscribe
} from "../store";
import { BadgeCategory, BadgeDefinition } from "../types";

export function BadgeCustomizerModal({ modalProps }: { modalProps: RenderModalProps; }) {
    const me = UserStore.getCurrentUser();
    const [tab, setTab] = useState<"studio" | "community" | "json">("studio");
    const [selectedBadges, setSelectedBadges] = useState<BadgeDefinition[]>(() => getMyBadges());
    const [category, setCategory] = useState<BadgeCategory>("all");
    const [search, setSearch] = useState("");
    const [communitySearch, setCommunitySearch] = useState("");
    const [status, setStatus] = useState<{ type: "success" | "error"; text: string; } | null>(null);
    const [isBusy, setIsBusy] = useState(false);

    const [customName, setCustomName] = useState("");
    const [customDesc, setCustomDesc] = useState("");
    const [customIcon, setCustomIcon] = useState("");

    const [jsonText, setJsonText] = useState(() => JSON.stringify(getMyBadges(), null, 2));

    const syncInfo = getSyncStatus();
    const remoteDb = getRemoteDatabase();

    useEffect(() => {
        return subscribe(() => { });
    }, []);

    const filteredCatalog = useMemo(() => {
        return BADGES_CATALOG.filter(badge => {
            const matchesCat = category === "all" || badge.category === category;
            const q = search.trim().toLowerCase();
            const matchesSearch = !q ||
                badge.name.toLowerCase().includes(q) ||
                badge.description.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });
    }, [category, search]);

    const isSelected = (id: string) => selectedBadges.some(b => b.id === id);

    const toggleBadge = (badge: BadgeDefinition) => {
        if (isSelected(badge.id)) {
            setSelectedBadges(prev => prev.filter(b => b.id !== badge.id));
        } else {
            setSelectedBadges(prev => [...prev, { ...badge }]);
        }
    };

    const moveBadge = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= selectedBadges.length) return;

        setSelectedBadges(prev => {
            const copy = [...prev];
            const temp = copy[index];
            copy[index] = copy[targetIndex];
            copy[targetIndex] = temp;
            return copy;
        });
    };

    const updateTooltip = (index: number, newTooltip: string) => {
        setSelectedBadges(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], description: newTooltip };
            return copy;
        });
    };

    const removeBadge = (index: number) => {
        setSelectedBadges(prev => prev.filter((_, i) => i !== index));
    };

    const addCustomBadge = () => {
        if (!customName.trim() || !customIcon.trim()) {
            setStatus({ type: "error", text: "Please enter a name and a valid icon URL." });
            return;
        }

        const newBadge: BadgeDefinition = {
            id: `custom_${Date.now()}`,
            name: customName.trim(),
            description: customDesc.trim() || customName.trim(),
            category: "custom",
            iconSrc: customIcon.trim(),
            custom: true
        };

        setSelectedBadges(prev => [...prev, newBadge]);
        setCustomName("");
        setCustomDesc("");
        setCustomIcon("");
        setStatus({ type: "success", text: "Custom badge added successfully!" });
    };

    const handleSaveLocal = () => {
        saveMyBadgesLocally(selectedBadges);
        setJsonText(JSON.stringify(selectedBadges, null, 2));
        setStatus({ type: "success", text: "Badges saved locally only! Visible only to you on this client." });
    };

    const handlePublish = async () => {
        setIsBusy(true);
        setStatus(null);
        try {
            await publishMyBadges(selectedBadges);
            setJsonText(JSON.stringify(selectedBadges, null, 2));
            setStatus({
                type: "success",
                text: "Badges successfully published! Everyone with the plugin will see your badges."
            });
        } catch (err: any) {
            setStatus({
                type: "error",
                text: err?.message || "Failed to publish"
            });
        } finally {
            setIsBusy(false);
        }
    };

    const handleApplyJson = () => {
        try {
            const parsed = JSON.parse(jsonText);
            if (!Array.isArray(parsed)) {
                throw new Error("The JSON must be a list of badges (array).");
            }
            setSelectedBadges(parsed);
            saveMyBadgesLocally(parsed);
            setStatus({ type: "success", text: "JSON configuration applied successfully!" });
            setTab("studio");
        } catch (err: any) {
            setStatus({ type: "error", text: `JSON error: ${err?.message}` });
        }
    };

    const communityList = useMemo(() => {
        const entries = Object.entries(remoteDb);
        if (!communitySearch.trim()) return entries;
        const q = communitySearch.trim().toLowerCase();
        return entries.filter(([userId, conf]) => {
            return userId.includes(q) ||
                (conf.username && conf.username.toLowerCase().includes(q)) ||
                (conf.badges && conf.badges.some(b => b.name.toLowerCase().includes(q)));
        });
    }, [remoteDb, communitySearch]);

    const avatarUrl = (me as any)?.getAvatarURL
        ? (me as any).getAvatarURL(undefined, 80)
        : (me?.avatar
            ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`
            : "https://cdn.discordapp.com/embed/avatars/0.png");
    const displayName = me?.globalName || me?.username || "Your Username";

    const meAny = me as any;
    const bannerUrl: string | null = meAny?.banner
        ? `https://cdn.discordapp.com/banners/${me.id}/${meAny.banner}.${String(meAny.banner).startsWith("a_") ? "gif" : "png"}?size=600`
        : null;
    const bannerColor: string =
        meAny?.bannerColor ||
        (typeof meAny?.accentColor === "number" ? `#${meAny.accentColor.toString(16).padStart(6, "0")}` : null) ||
        "#5865f2";

    let memberSince = "";
    try {
        if (me?.id) {
            memberSince = new Date(Number((BigInt(me.id) >> 22n) + 1420070400000n))
                .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
    } catch { }

    return (
        <Modal
            {...modalProps}
            size="lg"
            title="SimpleBadge - Customization Studio"
            subtitle="Add every Discord badge and share them live"
            actions={[
                { text: "Close", variant: "secondary", onClick: modalProps.onClose },
                { text: "Keep local", variant: "secondary", onClick: handleSaveLocal },
                {
                    text: isBusy ? "Publishing..." : "Publish for everyone",
                    variant: "primary",
                    onClick: handlePublish,
                    disabled: isBusy
                }
            ]}
        >
            <div className="sb-modal-root">
                <div className="sb-header">
                    <div className="sb-header-title-wrap">
                        <div className="sb-header-icon">🛡️</div>
                        <div>
                            <div className="sb-header-title">SimpleBadge Studio</div>
                            <div className="sb-header-subtitle">
                                {syncInfo.userCount} profile{syncInfo.userCount > 1 ? "s" : ""} live on the network
                                {syncInfo.error ? ` • ${syncInfo.error}` : ""}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={`sb-sync-pill ${syncInfo.state}`}
                        onClick={() => void fetchRemoteBadges(true)}
                        title="Click to force a sync"
                    >
                        <span className="sb-sync-dot" />
                        {syncInfo.state === "synced"
                            ? "Online"
                            : syncInfo.state === "syncing"
                                ? "Syncing..."
                                : syncInfo.state === "error"
                                    ? "Offline / Error"
                                    : "Connected"}
                    </button>
                </div>

                {status && (
                    <div className={`sb-alert ${status.type === "success" ? "sb-alert-success" : "sb-alert-error"}`}>
                        {status.type === "success" ? "✅" : "⚠️"} {status.text}
                    </div>
                )}

                <div className="sb-tabs">
                    <button
                        type="button"
                        className={`sb-tab-btn ${tab === "studio" ? "active" : ""}`}
                        onClick={() => setTab("studio")}
                    >
                        Studio ({selectedBadges.length} badge{selectedBadges.length > 1 ? "s" : ""})
                    </button>
                    <button
                        type="button"
                        className={`sb-tab-btn ${tab === "community" ? "active" : ""}`}
                        onClick={() => setTab("community")}
                    >
                        Plugin Members ({Object.keys(remoteDb).length})
                    </button>
                    <button
                        type="button"
                        className={`sb-tab-btn ${tab === "json" ? "active" : ""}`}
                        onClick={() => {
                            setJsonText(JSON.stringify(selectedBadges, null, 2));
                            setTab("json");
                        }}
                    >
                        JSON Export / Import
                    </button>
                </div>

                {tab === "studio" && (
                    <>
                        <div className="sb-profile-card">
                            <div
                                className="sb-profile-banner"
                                style={
                                    bannerUrl
                                        ? { backgroundImage: `url(${bannerUrl})`, backgroundColor: bannerColor }
                                        : { backgroundColor: bannerColor }
                                }
                            />

                            <div className="sb-profile-avatar-wrap">
                                <img className="sb-profile-avatar" src={avatarUrl} alt="Avatar" />
                                <span className="sb-profile-status" title="Do Not Disturb">
                                    <span className="sb-profile-status-minus" />
                                </span>
                            </div>

                            <div className="sb-profile-body">
                                <div className="sb-profile-display">{displayName}</div>

                                <div className="sb-profile-user-row">
                                    <span className="sb-profile-username">{me?.username}</span>
                                    <div className="sb-profile-badges">
                                        {selectedBadges.length === 0 ? (
                                            <span className="sb-preview-hint">No badge selected</span>
                                        ) : (
                                            selectedBadges.map((badge, idx) => (
                                                <img
                                                    key={`${badge.id}-${idx}`}
                                                    className="sb-badge-item-img"
                                                    src={badge.iconSrc}
                                                    title={badge.description || badge.name}
                                                    alt={badge.name}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>

                                {memberSince && (
                                    <div className="sb-profile-section">
                                        <div className="sb-profile-section-title">Member Since</div>
                                        <div className="sb-profile-section-text">{memberSince}</div>
                                    </div>
                                )}

                                <div className="sb-preview-hint">
                                    Live preview of your profile with SimpleBadge. Hover the badges to see the tooltips.
                                </div>
                            </div>
                        </div>

                        <div>
                            <input
                                className="sb-search-input"
                                placeholder="Search for a badge (Nitro, Dev, Bot, Staff, HypeSquad...)"
                                value={search}
                                onChange={e => setSearch(e.currentTarget.value)}
                            />

                            <div className="sb-categories">
                                {(Object.keys(CATEGORY_LABELS) as BadgeCategory[]).map(catKey => (
                                    <button
                                        key={catKey}
                                        type="button"
                                        className={`sb-category-pill ${category === catKey ? "active" : ""}`}
                                        onClick={() => setCategory(catKey)}
                                    >
                                        {CATEGORY_LABELS[catKey]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="sb-catalog-grid">
                            {filteredCatalog.map(badge => {
                                const active = isSelected(badge.id);
                                return (
                                    <div
                                        key={badge.id}
                                        className={`sb-catalog-card ${active ? "selected" : ""}`}
                                        onClick={() => toggleBadge(badge)}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sb-catalog-checkbox"
                                            checked={active}
                                            readOnly
                                        />
                                        <img className="sb-catalog-icon" src={badge.iconSrc} alt={badge.name} />
                                        <div className="sb-catalog-text">
                                            <span className="sb-catalog-title">{badge.name}</span>
                                            <span className="sb-catalog-desc">{badge.description}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedBadges.length > 0 && (
                            <div>
                                <div className="sb-section-title">
                                    Active Badges ({selectedBadges.length}) — Edit order and hover text
                                </div>
                                <div className="sb-active-list">
                                    {selectedBadges.map((badge, idx) => (
                                        <div key={`${badge.id}-${idx}`} className="sb-active-row">
                                            <button
                                                type="button"
                                                className="sb-active-order-btn"
                                                disabled={idx === 0}
                                                onClick={() => moveBadge(idx, "up")}
                                                title="Move up"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                type="button"
                                                className="sb-active-order-btn"
                                                disabled={idx === selectedBadges.length - 1}
                                                onClick={() => moveBadge(idx, "down")}
                                                title="Move down"
                                            >
                                                ▼
                                            </button>
                                            <img className="sb-catalog-icon" src={badge.iconSrc} alt={badge.name} />
                                            <span style={{ fontWeight: 600, fontSize: 13, minWidth: 140 }}>
                                                {badge.name}
                                            </span>
                                            <input
                                                className="sb-tooltip-input"
                                                value={badge.description}
                                                placeholder="Hover tooltip text..."
                                                onChange={e => updateTooltip(idx, e.currentTarget.value)}
                                            />
                                            <button
                                                type="button"
                                                className="sb-delete-btn"
                                                onClick={() => removeBadge(idx)}
                                                title="Delete this badge"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="sb-section-title">Add a custom badge</div>
                            <div className="sb-custom-creator">
                                <div className="sb-custom-row">
                                    <input
                                        className="sb-search-input"
                                        placeholder="Badge name (e.g. VIP Developer)"
                                        value={customName}
                                        onChange={e => setCustomName(e.currentTarget.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        className="sb-search-input"
                                        placeholder="Hover text (tooltip)"
                                        value={customDesc}
                                        onChange={e => setCustomDesc(e.currentTarget.value)}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                                <div className="sb-custom-row">
                                    <input
                                        className="sb-search-input"
                                        placeholder="Direct icon URL (PNG, SVG, GIF or https://...)"
                                        value={customIcon}
                                        onChange={e => setCustomIcon(e.currentTarget.value)}
                                        style={{ flex: 2 }}
                                    />
                                    {customIcon && (
                                        <img
                                            src={customIcon}
                                            alt="Preview"
                                            style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4 }}
                                            onError={e => { (e.target as HTMLElement).style.display = "none"; }}
                                        />
                                    )}
                                    <Button size="small" variant="primary" onClick={addCustomBadge}>
                                        Add badge
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {tab === "community" && (
                    <div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                            <input
                                className="sb-search-input"
                                placeholder="Search by username or Discord ID..."
                                value={communitySearch}
                                onChange={e => setCommunitySearch(e.currentTarget.value)}
                                style={{ flex: 1 }}
                            />
                            <Button size="small" variant="secondary" onClick={() => void fetchRemoteBadges(true)}>
                                Refresh
                            </Button>
                        </div>

                        {communityList.length === 0 ? (
                            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted, #949ba4)" }}>
                                No users found. Click "Publish for everyone" in the studio to appear here!
                            </div>
                        ) : (
                            <div className="sb-community-list">
                                {communityList.map(([userId, conf]) => {
                                    const isMe = userId === me?.id;
                                    return (
                                        <div key={userId} className="sb-community-card">
                                            <div className="sb-community-user-info">
                                                <span className="sb-community-user-name">
                                                    {conf.username || "SimpleBadge User"} {isMe && "(You)"}
                                                </span>
                                                <span className="sb-community-user-id">{userId}</span>
                                            </div>

                                            <div className="sb-preview-badges-container" style={{ flex: 1, minWidth: 100 }}>
                                                {conf.badges && conf.badges.length > 0 ? (
                                                    conf.badges.map((b, i) => (
                                                        <img
                                                            key={`${b.id}-${i}`}
                                                            className="sb-badge-item-img"
                                                            src={b.iconSrc}
                                                            title={b.description || b.name}
                                                            alt={b.name}
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="sb-preview-hint">No badges</span>
                                                )}
                                            </div>

                                            {!isMe && conf.badges && conf.badges.length > 0 && (
                                                <Button
                                                    size="small"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setSelectedBadges(JSON.parse(JSON.stringify(conf.badges)));
                                                        setTab("studio");
                                                        setStatus({
                                                            type: "success",
                                                            text: `Badges from ${conf.username || userId} loaded into your studio!`
                                                        });
                                                    }}
                                                >
                                                    Copy config
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {tab === "json" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "var(--text-muted, #949ba4)" }}>
                                Raw badge configuration in JSON format (Import / Export / Backup)
                            </span>
                            <div style={{ display: "flex", gap: 8 }}>
                                <Button
                                    size="small"
                                    variant="secondary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(jsonText);
                                        setStatus({ type: "success", text: "JSON copied to clipboard!" });
                                    }}
                                >
                                    Copy
                                </Button>
                                <Button size="small" variant="primary" onClick={handleApplyJson}>
                                    Apply JSON
                                </Button>
                            </div>
                        </div>
                        <textarea
                            className="sb-json-textarea"
                            value={jsonText}
                            onChange={e => setJsonText(e.currentTarget.value)}
                            spellCheck={false}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
}
