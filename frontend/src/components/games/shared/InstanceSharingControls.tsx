import { useState } from "react";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import styles from "@/styles/components/games/tsp/TSPControls.module.css";


interface InstanceSharingControlsProps {
    onShare: () => Promise<string | null>;
    onPublish: (data: {title: string;}) => Promise<string | null>;
    disabled?: boolean;
    canPublish?: boolean;
}

export default function InstanceSharingControls({
    onShare,
    onPublish,
    disabled = false,
    canPublish
}: InstanceSharingControlsProps) {

    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishTitle, setPublishTitle] = useState("");
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);


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
                <div className={styles.actions}>
                    <Button
                        style={["primary", "fullWidth"]}
                        label={isSharing ? "GENERATING..." : "SHARE INSTANCE"}
                        onClick={handleShareClick}
                        disabled={isSharing || disabled}
                    />
                    <Button
                        style={["secondary", "fullWidth"]}
                        label={"PUBLISH INSTANCE"}
                        onClick={() => setIsPublishModalOpen(true)}
                        disabled={!canPublish || disabled}
                    />
                </div>
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

            <Modal
                isOpen={isPublishModalOpen}
                title="PUBLISH INSTANCE"
                message="Make this challenge available to all users."
                confirmLabel="PUBLISH"
                cancelLabel="CANCEL"
                onConfirm={async () => {
                    const url = await onPublish({
                        title: publishTitle.trim()
                    });

                    if (url) {
                        setIsPublishModalOpen(false);
                        setPublishTitle("");
                        setPublishedUrl(url);
                    }
                }}
                onCancel={() => setIsPublishModalOpen(false)}
            >
                <div className={styles.publishForm}>
                    <label>
                        TITLE
                        <input
                            value={publishTitle}
                            maxLength={100}
                            onChange={(event) => setPublishTitle(event.target.value)}
                            className={styles.textInput}
                        />
                    </label>
                </div>
            </Modal>
        </>
    )
}