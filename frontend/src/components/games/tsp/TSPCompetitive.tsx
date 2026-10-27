import { useState, useEffect, useRef } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";
import GameLayout from "@/layouts/GameLayout";
import TSPCanvas from "@/components/games/tsp/TSPCanvas";
import { useTSPCompetitive } from "@/hooks/games/useTSPCompetitive";
import { useAuth } from "@/context/AuthContext";
import { formatDistance } from "@/utils/tsp";
import DailyChallengeControls from '../shared/DailyChallengeControls';

export default function TSPCompetitive() {
    const [canvasSize, setCanvasSize] = useState(() => {
        if (typeof window !== 'undefined') {
            const w = window.innerWidth;
            return {
                width: w < 768 ? Math.max(w - 40, 300) : 800,
                height: w < 768 ? 300 : 500
            };
        }
        return { width: 800, height: 500 };
    });
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
            title="TRAVELING SALESPERSON: DAILY CHALLENGE"
            badges={["RANKED", "GRAPH"]}
            stats={[
                { label: "POINTS", value: gameState?.points?.length || 0 }
            ]}
            instructions={[
                { title: "Connect the Dots", description: "Find the shortest possible cycle that visits every point exactly once." },
                { title: "No Help, No Re-dos", description: "You cannot preview paths or use algorithms. Connect, Submit and see your rank!" }
            ]}
            controls={
                    <DailyChallengeControls
                    dateLabel={dateLabel}
                    isToday={isToday}
                    canGoNext={canGoNext}
                    hasSubmitted={hasSubmitted}
                    canSubmit={isPathComplete}
                    canClear={manualPath.length > 0}
                    isAuthenticated={Boolean(user)}
                    onPreviousDay={actions.goToPrevDay}
                    onNextDay={actions.goToNextDay}
                    onSubmit={actions.submitManualPath}
                    onClear={actions.clearAll}
                    leaderboard={leaderboard}
                    currentUserId={user?.uid}
                    isLoading={isLoading}
                    formatScore={formatDistance}
                />
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
