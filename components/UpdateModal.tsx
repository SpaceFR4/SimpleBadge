import type { RenderModalProps } from "@vencord/discord-types";
import { Modal, React } from "@webpack/common";

import { acknowledgeUpdate } from "../store";
import { PLUGIN_VERSION, REPO_URL, UpdateInfo } from "../types";

declare const VencordNative: any;

function openRepository(url: string) {
    // Only ever open GitHub links, whatever the worker sends back.
    const target = /^https:\/\/github\.com\//.test(url) ? url : REPO_URL;

    try {
        if (typeof VencordNative !== "undefined" && VencordNative?.native?.openExternal) {
            void VencordNative.native.openExternal(target);
            return;
        }
    } catch { }

    window.open(target, "_blank");
}

export function UpdateModal({ modalProps, info }: { modalProps: RenderModalProps; info: UpdateInfo; }) {
    const onOk = () => {
        acknowledgeUpdate(info.version);
        openRepository(info.url);
        modalProps.onClose();
    };

    return (
        <Modal
            {...modalProps}
            size="md"
            title="SimpleBadge - Update available"
            subtitle={`v${PLUGIN_VERSION} → v${info.version}`}
            actions={[
                { text: "OK", variant: "primary", onClick: onOk }
            ]}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    padding: 16,
                    fontSize: 14,
                    lineHeight: 1.45,
                    color: "var(--text-normal, #dbdee1)"
                }}
            >
                <div>
                    A new version of SimpleBadge is available. Click <b>OK</b> to open the GitHub repository,
                    then update the plugin:
                </div>

                <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                    <li>Run <code>git pull</code> in <code>Vencord/src/userplugins/SimpleBadge</code></li>
                    <li>Run <code>pnpm build</code> in the Vencord folder</li>
                    <li>Restart Discord completely</li>
                </ol>

                {info.changelog.length > 0 && (
                    <div
                        style={{
                            background: "var(--background-secondary, #2b2d31)",
                            border: "1px solid var(--background-tertiary, #1e1f22)",
                            borderRadius: 8,
                            padding: "10px 14px"
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                color: "var(--header-secondary, #b5bac1)",
                                marginBottom: 6
                            }}
                        >
                            What's new in v{info.version}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {info.changelog.map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Modal>
    );
}