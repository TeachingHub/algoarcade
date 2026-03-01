import { useState, useEffect, useRef } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";

import { useAuth } from "@/context/AuthContext";
import { formatDistance } from "@/utils/tsp";

// Shared Components
import GameLayout from "@/layouts/GameLayout";


// Game Specific Components
import TSPCanvas from "@/components/games/tsp/TSPCanvas";
import TSPSandboxControls from "@/components/games/tsp/TSPSandboxControls";

// Hook
import { useTSPSandbox } from "@/hooks/games/useTSPSandbox";

export default function TSPSandbox() {
    const { user } = useAuth();

    // UI State for resizing
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
    const canvasAreaRef = useRef<HTMLDivElement>(null);

    // Game Logic Hook
    const {
        gameState,
        algorithm,
        setAlgorithm,
        manualPath,
        gameResult,
        scenarioInfo,
        customPointCount,
        setCustomPointCount,
        actions
    } = useTSPSandbox(canvasSize);

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
            title="TRAVELING SALESPERSON: SANDBOX"
            badges={["HARD", "GRAPH"]}
            stats={[
                { label: "BEST", value: gameState.bestDistance === Infinity ? '--' : formatDistance(gameState.bestDistance) },
                { label: "POINTS", value: gameState.points.length }
            ]}
            instructions={[
                { title: "1. Choose a Mode", description: "Select a scenario from the dropdown or generate a random instance." },
                { title: "2. Connect the Dots", description: "In Manual Mode, click points to form a path. Try to find the shortest route without crossing lines!" },
                { title: "3. Beat the AI", description: "Submit your path and see if the 2-opt algorithm can improve it. If it can't, you win!" }
            ]}
            contextInfo={scenarioInfo ? {
                title: scenarioInfo.name,
                description: scenarioInfo.description
            } : null}
            controls={
                <TSPSandboxControls
                    algorithm={algorithm}
                    setAlgorithm={setAlgorithm}
                    isRunning={gameState.isRunning}
                    pointsCount={gameState.points.length}
                    manualPathLength={manualPath.length}
                    gameResult={gameResult}
                    speed={gameState.speed ?? 50}
                    setSpeed={actions.setSpeed}
                    customPointCount={customPointCount}
                    setCustomPointCount={setCustomPointCount}
                    onRun={actions.runAlgorithm}
                    onStop={actions.stopAlgorithm}
                    onSubmit={actions.submitManualPath}
                    onReset={actions.clearAll}
                    onGenerate={actions.generateScenario}
                    onShare={() => actions.shareInstance(user?.displayName || "")}
                />
            }
        >
            <div ref={canvasAreaRef} className={styles.canvasArea}>
                <TSPCanvas
                    width={canvasSize.width}
                    height={canvasSize.height}
                    points={gameState.points}
                    bestPath={gameState.bestPath}
                    manualPath={manualPath}
                    algorithm={algorithm}
                    onPointClick={actions.handlePointClick}
                    onCanvasClick={actions.addPoint}
                    gameResult={gameResult}
                />

                {/* Overlays */}
                {algorithm === 'manual' && manualPath.length < gameState.points.length && !gameResult && (
                    <div className={styles.instructionOverlay}>
                        Click points to build path: {manualPath.length}/{gameState.points.length}
                    </div>
                )}
                {algorithm === 'builder' && !gameResult && (
                    <div className={styles.instructionOverlay}>
                        <div>Click canvas to add points: {gameState.points.length}</div>
                        <div style={{ fontSize: '0.8em', marginTop: '4px', opacity: 0.8 }}>
                            Create between 5 and 50 points, or your instance will be reset.
                        </div>
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