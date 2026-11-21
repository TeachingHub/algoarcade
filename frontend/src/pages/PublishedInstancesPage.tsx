import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/layouts/Layout";
import Loader from "@/components/shared/Loader";
import {
    getPublishedInstances,
    incrementPublishedPlayCount,
} from "@/services/games/gameService";
import type { PublishedInstance } from "@/types/publishedInstance";
import styles from "@/styles/pages/PublishedInstances.module.css"

function getGamePath(gameType: PublishedInstance["gameType"]): string {
    return `/games/${gameType}`;
}

function formatGameType(gameType: PublishedInstance["gameType"]): string {
    return gameType.toUpperCase();
}

export default function PublishedInstancesPage() {
    const navigate = useNavigate();

    const [instances, setInstances] = useState<PublishedInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openingId, setOpeningId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadInstances = async () => {
            try {
                const result = await getPublishedInstances();

                if (!cancelled) {
                    setInstances(result);
                }
            } catch (loadError) {
                console.error("Error loading published instances:", loadError);

                if (!cancelled) {
                    setError("Could not load published instances.");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void loadInstances();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleOpen = async (instance: PublishedInstance) => {
        if (openingId !== null) return;

        setOpeningId(instance.id);

        try {
            await incrementPublishedPlayCount(instance.id);

            navigate(
                `${getGamePath(instance.gameType)}?publication=${instance.id}`
            );
        } catch (openError) {
            console.error("Error opening published instance:", openError);
            setOpeningId(null);
        }
    };

    return (
        <Layout>
            <main className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Community challenges</h1>
                    <p className={styles.subtitle}>Play challenges created by other players</p>
                </header>

                {isLoading && <Loader fullScreen={false} />}

                {!isLoading && error && (
                    <p className={`${styles.state} ${styles.error}`}>{error}</p>
                )}

                {!isLoading && !error && instances.length === 0 && (
                    <p className={styles.state}>No published instances yet.</p>
                )}

                {!isLoading && !error && instances.length > 0 && (
                    <div className={styles.grid}>
                        {instances.map((instance) => (
                            <button
                                key={instance.id}
                                type="button"
                                className={styles.card}
                                onClick={() => void handleOpen(instance)}
                                disabled={openingId !== null}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.gameBadge}>
                                        {formatGameType(instance.gameType)}
                                    </span>
                                </div>

                                <h2 className={styles.instanceTitle}>{instance.title}</h2>

                                <p className={styles.creator}>
                                    Created by{" "}
                                    <span className={styles.creatorName}>
                                        {instance.creatorName}
                                    </span>
                                </p>

                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>
                                            Likes
                                        </span>
                                        <span className={styles.statValue}>
                                            {instance.likes.length}
                                        </span>
                                    </div>

                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>
                                            Played
                                        </span>
                                        <span className={styles.statValue}>
                                            {instance.playCount ?? 0}
                                        </span>
                                    </div>
                                </div>

                            </button>
                        ))}
                    </div>
                )}
            </main>
        </Layout>
    );
}