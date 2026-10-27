import { useState, useEffect, useRef } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";
import GameLayout from "@/layouts/GameLayout";
import KnapsackBoard from "@/components/games/knapsack/KnapsackBoard";
import { useKnapsackCompetitive } from "@/hooks/games/knapsack/useKnapsackCompetitive";
import { useAuth } from "@/context/AuthContext";
import DailyChallengeControls from '../shared/DailyChallengeControls';

export default function KnapsackCompetitive() {

    const { user } = useAuth();

    // UI State for resizing
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

    const {
        gameState,
        manualSelection,
        gameResult,
        isLoading,
        hasSubmitted,
        leaderboard,
        isToday,
        notFound,
        dateLabel,
        canGoNext,
        actions
    } = useKnapsackCompetitive(user);

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

    return (
        <GameLayout
            title="KNAPSACK GAME: DAILY CHALLENGE"
            badges={["RANKED", "OPTIMIZATION"]}
            stats={[
                { label: "ITEMS", value: gameState?.items?.length || 0 }
            ]}
            instructions={[
                { title: "Select the items", description: "Select the best items to maximize the value without exceeding the maximum weight." },
                { title: "No Help, No Re-dos", description: "You cannot use algorithms. Select items, Submit and see your rank!" }
            ]}
            controls={
                    <DailyChallengeControls
                    dateLabel={dateLabel}
                    isToday={isToday}
                    canGoNext={canGoNext}
                    hasSubmitted={hasSubmitted}
                    canSubmit={manualSelection.length > 0}
                    canClear={manualSelection.length > 0}
                    isAuthenticated={Boolean(user)}
                    onPreviousDay={actions.goToPrevDay}
                    onNextDay={actions.goToNextDay}
                    onSubmit={actions.submitManualSelection}
                    onClear={actions.clearAll}
                    leaderboard={leaderboard}
                    currentUserId={user?.uid}
                    isLoading={isLoading}
                />
            }
        >
            <div ref={canvasAreaRef} className={styles.canvasArea}>
                {notFound ? (
                    <div className={styles.notFoundMessage}>
                        No challenge available for this day.
                    </div>
                ) : gameState?.items?.length > 0 ? (
                    <KnapsackBoard
                        width={canvasSize.width}
                        height={canvasSize.height}
                        items={gameState.items}
                        selectedItems={gameState.currentSelection}
                        maxWeight={gameState.maxWeight}
                        onItemClick={actions.handleItemClick}
                        deleteItem={() => {}} //DeleteItem can't be used un daily challenge
                        selectedMode={'manual'}
                    />
                ) : (
                    <div className={styles.loadingContainer}>
                        Loading Daily Challenge...
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
