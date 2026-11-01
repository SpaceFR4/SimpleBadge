import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    userBadges: {
        type: OptionType.STRING,
        description: "Local badge configuration (JSON)",
        default: "{}"
    },
    
    mySecret: {
        type: OptionType.STRING,
        description: "Publishing secret key",
        default: ""
    }
});
