import styles from "@/styles/pages/games/TSP.module.css";
import GameLayout from "@/layouts/GameLayout";
import PathfindingGrid from "@/components/games/pathfinding/PathfindingGrid";
import { usePathfindingCompetitive } from "@/hooks/games/pathfinding/usePathfindingCompetitive";
import { useAuth } from "@/context/AuthContext";
import DailyChallengeControls from '../shared/DailyChallengeControls';

export default function PathfindingCompetitive() {

    const { user } = useAuth();

    const {
        gameState,
        manualPath,
        canSubmit,
        gameResult,
        isLoading,
        hasSubmitted,
        leaderboard,
        isToday,
        notFound,
        dateLabel,
        canGoNext,
        actions
    } = usePathfindingCompetitive(user);

    return (
        <GameLayout
            title="PATHFINDING GAME: DAILY CHALLENGE"
            badges={["RANKED", "GRAPH"]}
            stats={[
                { label: "PATH", value: gameState.pathLength || '--' }
            ]}
            instructions={[
                { title: "Escape from the maze", description: "Find the shortest path to the exit." },
                { title: "No Help, No Re-dos", description: "You cannot use algorithms. Draw tour path, Submit and see your rank!" }
            ]}
            controls={
                    <DailyChallengeControls
                    dateLabel={dateLabel}
                    isToday={isToday}
                    canGoNext={canGoNext}
                    hasSubmitted={hasSubmitted}
                    canSubmit={canSubmit}
                    canClear={gameState.pathLength > 0}
                    isAuthenticated={Boolean(user)}
                    onPreviousDay={actions.goToPrevDay}
                    onNextDay={actions.goToNextDay}
                    onSubmit={actions.submitManualPath}
                    onClear={actions.clearAll}
                    leaderboard={leaderboard}
                    currentUserId={user?.uid}
                    isLoading={isLoading}
                />
            }
        >
            <div className={styles.canvasArea}>
                {notFound ? (
                    <div className={styles.notFoundMessage}>
                        No challenge available for this day.
                    </div>
                ) : gameState?.grid?.length > 0 ? (
                    
                    <PathfindingGrid
                        grid={gameState.grid}
                        manualPath={manualPath}
                        isRunning={gameState.isRunning}
                        onCellClick={actions.handleCellInteraction}
                        onCellDrag={actions.handleCellDrag}
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
