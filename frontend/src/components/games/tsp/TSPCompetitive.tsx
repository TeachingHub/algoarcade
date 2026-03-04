import { useState, useEffect, useRef } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";
import GameLayout from "@/layouts/GameLayout";
import TSPCanvas from "@/components/games/tsp/TSPCanvas";
import { useTSPCompetitive } from "@/hooks/games/useTSPCompetitive";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/shared/Button";
import { formatDistance } from "@/utils/tsp";
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Format a Firestore Timestamp or Date to HH:MM */
function formatTime(timestamp: unknown): string {
    if (!timestamp) return '';
    const date = typeof (timestamp as any)?.toDate === 'function'
        ? (timestamp as any).toDate()
        : new Date(timestamp as string | number);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TSPCompetitive() {
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
    const canvasAreaRef = useRef<HTMLDivElement>(null);

    const { user } = useAuth();

    const {
        gameState,
        manualPath,
        gameResult,
        isLoading,
        hasSubmitted,
        leaderboard,
        isToday,
        notFound,
        dateLabel,
        canGoNext,
        actions
    } = useTSPCompetitive(canvasSize, user);

    // Responsive Canvas
    useEffect(() => {
        const handleResize = () => {
            if (canvasAreaRef.current) {
                setCanvasSize({
                    width: canvasAreaRef.current.clientWidth,
                    height: canvasAreaRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isPathComplete = manualPath.length === (gameState?.points?.length || 0);

    return (
        <GameLayout
            title="DAILY CHALLENGE: COMPETITIVE"
            badges={["RANKED", "GRAPH"]}
            stats={[
                { label: "POINTS", value: gameState?.points?.length || 0 }
            ]}
            instructions={[
                { title: "Connect the Dots", description: "Find the shortest possible cycle that visits every point exactly once." },
                { title: "No Help, No Re-dos", description: "You cannot preview paths or use algorithms. Connect, Submit and see your rank!" }
            ]}
            controls={
                <div className={styles.competitiveControls}>
                    {/* ── Date Navigation ──────────────────────── */}
                    <div className={styles.dateNav}>
                        <button
                            className={styles.dateNavButton}
                            onClick={actions.goToPrevDay}
                            aria-label="Previous day"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className={styles.dateNavCenter}>
                            <span className={styles.dateNavLabel}>{dateLabel}</span>
                            <span className={`${styles.dateNavBadge} ${isToday ? styles.dateNavBadgeLive : styles.dateNavBadgePractice}`}>
                                {isToday ? '● LIVE' : 'PRACTICE'}
                            </span>
                        </div>
                        <button
                            className={styles.dateNavButton}
                            onClick={actions.goToNextDay}
                            disabled={!canGoNext}
                            aria-label="Next day"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <h3 className={styles.sectionTitle}>
                        {isToday ? 'DAILY CHALLENGE' : 'PRACTICE MODE'}
                    </h3>

                    {user ? (
                        <div className={styles.buttonGroup}>
                            <Button
                                style={["primary", "fullWidth"]}
                                label={hasSubmitted ? "ALREADY SUBMITTED" : (isToday ? "SUBMIT SCORE" : "SUBMIT (PRACTICE)")}
                                onClick={actions.submitManualPath}
                                disabled={hasSubmitted || !isPathComplete}
                            />
                            <Button
                                style={["secondary", "fullWidth"]}
                                label="CLEAR PATH"
                                onClick={actions.clearAll}
                                disabled={hasSubmitted || manualPath.length === 0}
                            />
                        </div>
                    ) : (
                        <div className={styles.buttonGroup}>
                            <p className={styles.loginPrompt}>
                                Log in to submit your score and compete on the leaderboard!
                            </p>
                            <Button
                                style={["primary", "fullWidth"]}
                                label="LOG IN"
                                to="/login"
                            />
                            <Button
                                style={["secondary", "fullWidth"]}
                                label="REGISTER"
                                to="/register"
                            />
                        </div>
                    )}

                    <h3 className={styles.leaderboardTitle}>LEADERBOARD</h3>
                    {isLoading && leaderboard.length === 0 ? (
                        <p className={styles.loadingText}>Loading...</p>
                    ) : leaderboard.length > 0 ? (
                        <ul className={styles.leaderboardList}>
                            {leaderboard.map((entry, idx) => (
                                <li key={entry.userId} className={`${styles.leaderboardItem} ${entry.userId === user?.uid ? styles.leaderboardItemActive : styles.leaderboardItemInactive}`}>
                                    <span className={styles.leaderboardRank}>{idx + 1}.</span>
                                    {entry.photoURL ? (
                                        <img src={entry.photoURL} alt={entry.displayName} className={styles.leaderboardAvatar} />
                                    ) : (
                                        <div className={styles.leaderboardAvatarPlaceholder}>
                                            {entry.displayName.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className={styles.leaderboardInfo}>
                                        <div className={styles.leaderboardName}>{entry.displayName}</div>
                                        <div className={styles.leaderboardDistance}>
                                            {formatDistance(entry.distance)}
                                            {entry.timestamp && (
                                                <span className={styles.leaderboardTime}> · {formatTime(entry.timestamp)}</span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.emptyLeaderboard}>
                            {isToday ? 'Be the first to submit a score today!' : 'No scores for this day.'}
                        </p>
                    )}

                </div>
            }
        >
            <div ref={canvasAreaRef} className={styles.canvasArea}>
                {notFound ? (
                    <div className={styles.notFoundMessage}>
                        No challenge available for this day.
                    </div>
                ) : gameState?.points?.length > 0 ? (
                    <TSPCanvas
                        width={canvasSize.width}
                        height={canvasSize.height}
                        points={gameState.points}
                        bestPath={gameState.bestPath}
                        manualPath={manualPath}
                        algorithm="manual"
                        onPointClick={actions.handlePointClick}
                        gameResult={null}
                    />
                ) : (
                    <div className={styles.loadingContainer}>
                        Loading Daily Challenge...
                    </div>
                )}

                {/* Overlays */}
                {!hasSubmitted && !notFound && manualPath.length < (gameState?.points?.length || 0) && (
                    <div className={styles.instructionOverlay}>
                        Connect all points: {manualPath.length}/{(gameState?.points?.length || 0)}
                    </div>
                )}
                {gameResult && (
                    <div className={styles.resultOverlay}>
                        <div className={styles.resultTitle}>
                            {gameResult}
                        </div>
                    </div>
                )}
            </div>
        </GameLayout>
    );
}
