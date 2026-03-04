import styles from "@/styles/pages/games/Pathfinding.module.css";
import GameLayout from "@/layouts/GameLayout";
import { CircleStar, Bot } from 'lucide-react';

import PathfindingGrid from "@/components/games/pathfinding/PathfindingGrid";
import PathfindingControls from "@/components/games/pathfinding/PathfindingControls";
import { usePathfinding } from "@/hooks/games/usePathfinding";

export default function Pathfinding() {
    const {
        state,
        algorithm,
        setAlgorithm,
        comparisonAlgorithm,
        setComparisonAlgorithm,
        mode,
        setMode,
        manualPath,
        algoComparisonPath,
        resultMessage,
        gameResult,
        actions,
    } = usePathfinding();

    return (
        <GameLayout
            title="PATHFINDING"
            badges={["MEDIUM", "GRID"]}
            stats={[
                { label: "VISITED", value: state.visitedCount },
                { label: "PATH", value: state.pathLength || '--' },
            ]}
            instructions={[
                { title: "1. Build the Board", description: "Draw walls by clicking and dragging, or generate a random maze. Drag the start/end cells to reposition them." },
                { title: "2. Choose a Method", description: "Select an algorithm to visualize, or switch to Manual mode to solve it yourself." },
                { title: "3. Find the Path", description: "Watch the algorithm explore and trace the shortest path, or draw your own route and compare against the machine!" }
            ]}
            controls={
                <PathfindingControls
                    algorithm={algorithm}
                    setAlgorithm={setAlgorithm}
                    comparisonAlgorithm={comparisonAlgorithm}
                    setComparisonAlgorithm={setComparisonAlgorithm}
                    mode={mode}
                    setMode={setMode}
                    isRunning={state.isRunning}
                    isSolved={state.isSolved}
                    speed={state.speed}
                    manualPathLength={manualPath.length}
                    onRun={actions.runAlgorithm}
                    onStop={actions.stopAlgorithm}
                    onSubmitManual={actions.submitManualPath}
                    onClearBoard={actions.clearBoard}
                    onClearVisualization={actions.clearVisualization}
                    onGenMaze={actions.genMaze}
                    onGenRandom={actions.genRandom}
                    onSetSpeed={actions.setSpeed}
                />
            }
        >
            <div className={styles.canvasArea}>
                <PathfindingGrid
                    grid={state.grid}
                    manualPath={manualPath}
                    algoComparisonPath={algoComparisonPath}
                    isRunning={state.isRunning}
                    onCellClick={actions.handleCellInteraction}
                    onCellDrag={actions.handleCellDrag}
                    onDragEnd={actions.handleDragEnd}
                />

                {mode === 'manual' && manualPath.length === 0 && !state.isSolved && (
                    <div className={styles.instructionOverlay}>
                        Click the green start cell to begin your path — drag to draw!
                    </div>
                )}

                {resultMessage && !gameResult && (
                    <div className={styles.resultOverlay}>
                        {resultMessage}
                    </div>
                )}

                {gameResult && (
                    <div className={styles.resultOverlay}>
                        <div className={styles.resultIcon}>
                            {gameResult.won
                                ? <CircleStar size={28} color="var(--primary)" />
                                : <Bot size={28} color="var(--destructive)" />
                            }
                        </div>
                        <div className={styles.resultTitle}>
                            {gameResult.won ? 'YOU WIN!' : 'YOU LOSE!'}
                        </div>
                        <div className={styles.resultScores}>
                            <div className={styles.resultScore}>
                                <span className={styles.resultScoreLabel}>YOUR PATH</span>
                                <span className={styles.resultScoreValue}>{gameResult.userSteps} steps</span>
                            </div>
                            <div className={styles.resultVs}>VS</div>
                            <div className={styles.resultScore}>
                                <span className={styles.resultScoreLabel}>{gameResult.algoName}</span>
                                <span className={styles.resultScoreValue}>{gameResult.algoSteps} steps</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </GameLayout>
    );
}