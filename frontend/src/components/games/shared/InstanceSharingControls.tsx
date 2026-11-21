import { useState, useEffect } from "react";
import {useSearchParams} from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Heart } from "lucide-react";
import {getPublishedInstance, togglePublishedInstanceLike} from "@services/games/gameService"
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

    const [likes, setLikes] = useState<string[]>([]);
    const [isLiking, setIsLiking] = useState(false);

    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    
    const publicationId = searchParams.get("publication");

    useEffect(() => {
        if (!publicationId) return;

        void getPublishedInstance(publicationId).then((instance) => {
            if (instance) setLikes(instance.likes);
        });
    }, [publicationId]);


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

    const handleLike = async () => {
        if (!user || !publicationId || isLiking) return;

        setIsLiking(true);

        try {
            const liked = await togglePublishedInstanceLike(publicationId, user.uid);
            setLikes((currentLikes) => liked
                ? [...currentLikes, user.uid]
                : currentLikes.filter((userId) => userId !== user.uid)
            );
        } catch (error) {
            console.error("Error toggling like: ", error);
        } finally {
            setIsLiking(false);
        }
    }

    const hasLiked = !!user && likes.includes(user.uid);

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

                {publicationId && (
                    <button
                        type="button"
                        className={`${styles.likeButton} ${
                            hasLiked ? styles.likeButtonLiked : ""
                        }`}
                        onClick={() => void handleLike()}
                        disabled={!user || isLiking}
                        aria-label={hasLiked ? "Remove like" : "Like"}
                        title={`${likes.length} likes`}
                    >
                        <Heart
                            size={22}
                            fill={hasLiked ? "currentColor" : "none"}
                        />
                        <span className={styles.likeCount}>{likes.length}</span>
                    </button>
                )}
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