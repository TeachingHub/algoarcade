import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Button from "@/components/shared/Button";
import Layout from "@/layouts/Layout";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/context/AuthContext";
import {
    getPublishedInstances,
    incrementPublishedPlayCount,
    type PublishedInstancesCursor,
    type PublishedInstancesSort
} from "@/services/games/gameService";
import type { PublishedGameType, PublishedInstance } from "@/types/publishedInstance";
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

    const [sortBy, setSortBy] = useState<PublishedInstancesSort>("newest");
    const [cursor, setCursor] = useState<PublishedInstancesCursor | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
    const requestIdRef = useRef(0);
    const [gameFilter, setGameFilter] = useState<PublishedGameType | "all">("all");
    const [likedFilter, setLikedFilter] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        let cancelled = false;
        requestIdRef.current += 1;

        const loadInstances = async () => {
            setIsLoading(true);
            setError(null);
            setIsLoadingMore(false);
            setLoadMoreError(null);
            setInstances([]);
            setCursor(null);
            setHasMore(false);

            try {
                const result = await getPublishedInstances(sortBy, gameFilter, likedFilter ? user?.uid : null);

                if (!cancelled) {
                    setInstances(result.instances);
                    setCursor(result.lastDocument);
                    setHasMore(result.hasMore);
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
    }, [sortBy, gameFilter, likedFilter]);

    const handleLoadMore = async () => {
        if (!cursor || !hasMore || isLoadingMore) return;

        const requestId = requestIdRef.current;
        setIsLoadingMore(true);
        setLoadMoreError(null);

        try {
            const result = await getPublishedInstances(sortBy, gameFilter, likedFilter ? user?.uid : null, cursor);

            if (requestId !== requestIdRef.current) return;

            setInstances((current) => [...current, ...result.instances]);
            setCursor(result.lastDocument)
            setHasMore(result.hasMore);
        } catch (loadError) {
            console.error("Error loading more published instances", loadError);
            setLoadMoreError("Could not load more published instances.");
        } finally {
            if (requestId === requestIdRef.current) setIsLoadingMore(false);
        }
    };

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

                <div className={styles.filterBar}>
                        <label className={styles.filterGroup} htmlFor="published-instance-sort">Order by
                            <select
                                id="published-instance-sort"
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value as PublishedInstancesSort)}
                            >
                                <option value="newest">Most recent</option>
                                <option value="mostPlayed">Most played</option>
                                <option value="mostLiked">Most likes</option>
                            </select>
                        </label>

                        <label className={styles.filterGroup} htmlFor="published-instance-game-filter">Filter game
                            <select
                                id="published-instance-game-filter"
                                value={gameFilter}
                                onChange={(event) => setGameFilter(event.target.value as PublishedGameType | "all")}
                            >
                                <option value="all">All games</option>
                                <option value="tsp">TSP</option>
                                <option value="pathfinding">Pathfinding</option>
                                <option value="knapsack">Knapsack</option>
                                <option value="flowshop">Flowshop</option>
                            </select>
                        </label>

                    <label className={styles.favoritesFilter}>
                        <input
                            type="checkbox"
                            checked={likedFilter}
                            onChange={(event) => setLikedFilter(event.target.checked)}
                            disabled={!user}
                        />
                        Favorites
                    </label>

                </div>

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
                                            {instance.likeCount}
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

                {!isLoading && !error && hasMore && (
                    <div className={styles.loadMoreContainer}>
                        {loadMoreError && (
                            <p className={`${styles.state} ${styles.error}`}>
                                {loadMoreError}
                            </p>
                        )}
                        <Button
                            style={["secondary"]}
                            //type="button"
                            //className={styles.loadMoreButton}
                            label={isLoadingMore ? "Loading..." : "Load more"}
                            onClick={() => void handleLoadMore()}
                            disabled={isLoadingMore}
                        />
                    </div>
                )}
            </main>
        </Layout>
    );
}