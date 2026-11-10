import { useState, useEffect, useRef } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";
import GameLayout from "@/layouts/GameLayout";
import FlowshopBoard from "@/components/games/flowshop/FlowshopBoard";
import { useFlowshopCompetitive } from "@/hooks/games/flowshop/useFlowshopCompetitive";
import { useAuth } from "@/context/AuthContext";
import DailyChallengeControls from '../shared/DailyChallengeControls';

export default function FlowshopCompetitive() {

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
        manualOrder,
        gameResult,
        isLoading,
        hasSubmitted,
        leaderboard,
        isToday,
        notFound,
        dateLabel,
        canGoNext,
        actions
    } = useFlowshopCompetitive(user);

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
            title="FLOWSHOP SCHEDULING GAME: DAILY CHALLENGE"
            badges={["RANKED", "OPTIMIZATION"]}
            stats={[
                { label: "JOBS", value: gameState?.jobs?.length || 0 }
            ]}
            instructions={[
                { title: "Order the jobs", description: "Process the jobs in the correct order to minimize the total makespan. The order of jobs must be the same for all machines." },
                { title: "No Help, No Re-dos", description: "You cannot use algorithms. Select items, Submit and see your rank!" }
            ]}
            controls={
                    <DailyChallengeControls
                    dateLabel={dateLabel}
                    isToday={isToday}
                    canGoNext={canGoNext}
                    hasSubmitted={hasSubmitted}
                    canSubmit={manualOrder.length === gameState.jobs.length}
                    canClear={manualOrder.length > 0}
                    isAuthenticated={Boolean(user)}
                    onPreviousDay={actions.goToPrevDay}
                    onNextDay={actions.goToNextDay}
                    onSubmit={actions.submitManualOrder}
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
                ) : gameState?.jobs?.length > 0 ? (
                    <FlowshopBoard
                        width={canvasSize.width}
                        height={canvasSize.height}
                        jobs={gameState.jobs}
                        currentOrder={gameState.currentOrder}
                        selectedMode={'manual'}
                        onJobDragStart={actions.handleJobDragStart}
                        onJobDragOver={actions.handleJobDragOver}
                        onJobDrop={actions.handleJobDrop}
                        onJobDragEnd={actions.handleJobDragEnd}
                        deleteJob={() => {}} //DeleteJob can't be used un daily challenge
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
