import { useState } from "react";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import styles from "@/styles/components/games/tsp/TSPControls.module.css";


interface InstanceSharingControlsProps {
    onShare: () => Promise<string | null>;
    disabled?: boolean;
}

export default function InstanceSharingControls({
    onShare,
    disabled = false
}: InstanceSharingControlsProps) {

    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShareClick = async () => {
        setIsSharing(true);
        const url = await onShare();
        if (url) {
            setShareUrl(url);
            setCopied(false);
        }
        setIsSharing(false);
    };

    const handleCopy = async () => {
        if (shareUrl) {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
        <div className={styles.controlPanel}> 
                <h3>SHARE CHALLENGE</h3>
                <Button
                    style={["primary", "fullWidth"]}
                    label={isSharing ? "GENERATING..." : "SHARE INSTANCE"}
                    onClick={handleShareClick}
                    disabled={isSharing || disabled}
                />
            </div>

            <Modal
                isOpen={!!shareUrl}
                title="READY TO SHARE"
                message="Send this link to challenge your friends to beat the AI on your custom game."
                confirmLabel={copied ? "COPIED!" : "COPY LINK"}
                cancelLabel="CLOSE"
                onConfirm={handleCopy}
                onCancel={() => setShareUrl(null)}
            >
                <div className={styles.shareUrlBox}>
                    {shareUrl}
                </div>
            </Modal>
        </>
    )
}