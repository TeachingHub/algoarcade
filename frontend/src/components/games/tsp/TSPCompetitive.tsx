import { useState, useEffect, useRef } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";
import GameLayout from "@/layouts/GameLayout";
import TSPCanvas from "@/components/games/tsp/TSPCanvas";
import { useTSPCompetitive } from "@/hooks/games/useTSPCompetitive";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/shared/Button";
import { formatDistance } from "@/utils/tsp";

export default function TSPCompetitive() {
    // UI State for resizing
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
        handleResize(); // Initial measurement

        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                    <h3 className={styles.sectionTitle}>DAILY CHALLENGE</h3>

                    <div className={styles.buttonGroup}>
                        <Button
                            style={["primary", "fullWidth"]}
                            label={hasSubmitted ? "ALREADY SUBMITTED" : "SUBMIT SCORE"}
                            onClick={actions.submitManualPath}
                            disabled={hasSubmitted || manualPath.length !== (gameState?.points?.length || 0)}
                        />
                        <Button
                            style={["secondary", "fullWidth"]}
                            label="CLEAR PATH"
                            onClick={actions.clearAll}
                            disabled={hasSubmitted || manualPath.length === 0}
                        />
                    </div>

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
                                        <div className={styles.leaderboardDistance}>{formatDistance(entry.distance)}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.emptyLeaderboard}>Be the first to submit a score today!</p>
                    )}

                </div>
            }
        >
            <div ref={canvasAreaRef} className={styles.canvasArea}>
                {gameState?.points?.length > 0 ? (
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
                {!hasSubmitted && manualPath.length < (gameState?.points?.length || 0) && (
                    <div className={styles.instructionOverlay}>
                        Connect all points: {manualPath.length}/{(gameState?.points?.length || 0)}
                    </div>
                )}
                {gameResult && (
                    <div className={styles.resultOverlay}>
                        {gameResult}
                    </div>
                )}
            </div>
        </GameLayout>
    );
}
