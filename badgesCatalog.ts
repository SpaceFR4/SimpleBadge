import { BadgeDefinition } from "./types";

const BASE = "https://cdn.jsdelivr.net/gh/merlinfuchs/discord-badges/SVG";
const MEZO = "https://cdn.jsdelivr.net/gh/mezotv/discord-badges@main/assets";

export const BADGES_CATALOG: BadgeDefinition[] = [
    {
        id: "nitro",
        name: "Discord Nitro",
        description: "Discord Nitro subscriber",
        category: "nitro",
        iconSrc: `${BASE}/nitro.svg`,
        infoLabel: "Nitro"
    },
    {
        id: "nitro_basic",
        name: "Discord Nitro Basic",
        description: "Discord Nitro Basic subscriber",
        category: "nitro",
        iconSrc: `${MEZO}/discord-nitro-basic.svg`,
        infoLabel: "Nitro"
    },
    {
        id: "boost_lvl1",
        name: "Server Booster (1 month)",
        description: "Has been boosting the server for 1 month",
        category: "boost",
        iconSrc: `${BASE}/boosting_1_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "boost_lvl2",
        name: "Server Booster (2 months)",
        description: "Has been boosting the server for 2 months",
        category: "boost",
        iconSrc: `${BASE}/boosting_2_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "boost_lvl3",
        name: "Server Booster (3 months)",
        description: "Has been boosting the server for 3 months",
        category: "boost",
        iconSrc: `${BASE}/boosting_3_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "boost_lvl4",
        name: "Server Booster (6 months)",
        description: "Has been boosting the server for 6 months",
        category: "boost",
        iconSrc: `${BASE}/boosting_6_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "boost_lvl5",
        name: "Server Booster (9 months)",
        description: "Has been boosting the server for 9 months",
        category: "boost",
        iconSrc: `${BASE}/boosting_9_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "boost_lvl6",
        name: "Server Booster (12 months)",
        description: "Has been boosting the server for 12 months",
        category: "boost",
        iconSrc: `${BASE}/boosting_12_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "boost_lvl7",
        name: "Server Booster (15 months)",
        description: "Has been boosting the server for 15 months",
        category: "boost",
        iconSrc: `${BASE}/boosting_15_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "boost_lvl8",
        name: "Server Booster (18 months)",
        description: "Has been boosting the server for 18 months",
        category: "boost",
        iconSrc: `${BASE}/boosting_18_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "boost_lvl9",
        name: "Server Booster (24 months)",
        description: "Has been boosting the server for 24 months",
        category: "boost",
        iconSrc: `${BASE}/boosting_24_months.svg`,
        infoLabel: "Server Booster"
    },
    {
        id: "discord_staff",
        name: "Discord Staff",
        description: "Discord employee",
        category: "staff",
        iconSrc: `${BASE}/staff.svg`,
        infoLabel: "Staff"
    },
    {
        id: "discord_partner",
        name: "Partnered Server Owner",
        description: "Owner of a Discord partnered server",
        category: "staff",
        iconSrc: `${BASE}/partnered_server_owner.svg`,
        infoLabel: "Partner"
    },
    {
        id: "discord_certified_moderator",
        name: "Discord Certified Moderator",
        description: "Alumni of the Discord Moderator Program",
        category: "staff",
        iconSrc: `${BASE}/certified_moderator.svg`,
        infoLabel: "Moderator"
    },
    {
        id: "hypesquad_events",
        name: "HypeSquad Events",
        description: "HypeSquad events coordinator",
        category: "hypesquad",
        iconSrc: `${BASE}/hypesquad_events.svg`,
        infoLabel: "HypeSquad"
    },
    {
        id: "hypesquad_bravery",
        name: "HypeSquad Bravery",
        description: "Member of House Bravery",
        category: "hypesquad",
        iconSrc: `${BASE}/hypesquad_bravery.svg`,
        infoLabel: "HypeSquad"
    },
    {
        id: "hypesquad_brilliance",
        name: "HypeSquad Brilliance",
        description: "Member of House Brilliance",
        category: "hypesquad",
        iconSrc: `${BASE}/hypesquad_brilliance.svg`,
        infoLabel: "HypeSquad"
    },
    {
        id: "hypesquad_balance",
        name: "HypeSquad Balance",
        description: "Member of House Balance",
        category: "hypesquad",
        iconSrc: `${BASE}/hypesquad_balance.svg`,
        infoLabel: "HypeSquad"
    },
    {
        id: "bug_hunter_lvl1",
        name: "Discord Bug Hunter (Level 1)",
        description: "Discord Bug Hunter",
        category: "special",
        iconSrc: `${BASE}/bug_hunter_level_1.svg`,
        infoLabel: "Bug Hunter"
    },
    {
        id: "bug_hunter_lvl2",
        name: "Discord Bug Hunter (Level 2)",
        description: "Discord Bug Hunter Gold",
        category: "special",
        iconSrc: `${BASE}/bug_hunter_level_2.svg`,
        infoLabel: "Bug Hunter"
    },
    {
        id: "active_developer",
        name: "Active Developer",
        description: "Active Developer",
        category: "devs",
        iconSrc: `${BASE}/active_developer.svg`,
        infoLabel: "Developer"
    },
    {
        id: "early_verified_bot_dev",
        name: "Early Verified Bot Developer",
        description: "Early Verified Bot Developer",
        category: "devs",
        iconSrc: `${BASE}/early_verified_developer.svg`,
        infoLabel: "Developer"
    },
    {
        id: "supports_commands",
        name: "Supports Commands",
        description: "Supports slash commands",
        category: "devs",
        iconSrc: `${MEZO}/supports-commands.svg`,
        infoLabel: "Bot"
    },
    {
        id: "automod",
        name: "Uses AutoMod",
        description: "Protects the server with AutoMod",
        category: "devs",
        iconSrc: `${MEZO}/automod.svg`,
        infoLabel: "AutoMod"
    },
    {
        id: "bot_badge",
        name: "Verified Bot",
        description: "Verified application and bot",
        category: "devs",
        iconSrc: "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png",
        infoLabel: "Bot"
    },
    {
        id: "early_supporter",
        name: "Early Supporter",
        description: "Early Supporter",
        category: "special",
        iconSrc: `${BASE}/early_supporter.svg`,
        infoLabel: "Supporter"
    },
    {
        id: "quest_completed",
        name: "Quest Completed",
        description: "Completed a Discord quest",
        category: "special",
        iconSrc: `${MEZO}/quest.png`,
        infoLabel: "Quest"
    }
];

export const CATEGORY_LABELS: Record<string, string> = {
    all: "All badges",
    nitro: "Nitro",
    boost: "Server Boosts",
    staff: "Staff & Partners",
    hypesquad: "HypeSquad",
    devs: "Developers & Bots",
    special: "Special & Achievements",
    custom: "Custom"
};