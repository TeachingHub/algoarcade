import styles from "@/styles/pages/games/Pathfinding.module.css";
import GameLayout from "@/layouts/GameLayout";

import PathfindingGrid from "@/components/games/pathfinding/PathfindingGrid";
import PathfindingControls from "@/components/games/pathfinding/PathfindingControls";
import { usePathfinding } from "@/hooks/games/usePathfinding";

export default function Pathfinding() {
    const {
        state,
        algorithm,
        setAlgorithm,
        mode,
        setMode,
        manualPath,
        resultMessage,
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
                { title: "1. Build the Board", description: "Draw walls by clicking and dragging, or generate a random maze." },
                { title: "2. Choose a Method", description: "Select an algorithm to visualize, or switch to Manual mode to solve it yourself." },
                { title: "3. Find the Path", description: "Watch the algorithm explore (blue) and trace the shortest path (yellow), or draw your own route from start to end!" }
            ]}
            controls={
                <PathfindingControls
                    algorithm={algorithm}
                    setAlgorithm={setAlgorithm}
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
                    isRunning={state.isRunning}
                    onCellClick={actions.handleCellInteraction}
                    onCellDrag={actions.handleCellDrag}
                />

                {mode === 'manual' && manualPath.length === 0 && !state.isSolved && (
                    <div className={styles.instructionOverlay}>
                        Click the green start cell to begin your path
                    </div>
                )}

                {resultMessage && (
                    <div className={styles.resultOverlay}>
                        {resultMessage}
                    </div>
                )}
            </div>
        </GameLayout>
    );
}