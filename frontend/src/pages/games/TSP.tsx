import { useState, useEffect } from 'react';
import Layout from "@/layouts/Layout";
import Button from "@/components/shared/Button";
import styles from "@/styles/pages/games/GameLayout.module.css";
import { useAuth } from "@/context/AuthContext";
import { formatDistance } from "@/utils/tsp";

// Shared Components
import GameHeader from "@/components/games/shared/GameHeader";
import GameInstructions from "@/components/games/shared/GameInstructions";

// Game Specific Components
import TSPCanvas from "@/components/games/tsp/TSPCanvas";
import TSPControls from "@/components/games/tsp/TSPControls";

// Hook
import { useTSPGame } from "@/hooks/games/useTSPGame";
import { TriangleAlertIcon } from 'lucide-react';

export default function TSP() {
    const { user } = useAuth();

    // UI State for resizing
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

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
    } = useTSPGame(canvasSize);

    // Responsive Canvas
    useEffect(() => {
        const handleResize = () => {
            const container = document.querySelector(`.${styles.canvasArea}`);
            if (container) {
                setCanvasSize({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial measurement

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Layout noHeader noFooter>
            <div className={styles.gameContainer}>
                {!user && (
                    <div className={styles.notification}>
                        <TriangleAlertIcon size={20} /> Progress not saved. Log in to track your scores! <Button style={["link"]} to="/login">Log in</Button> or <Button style={["link"]} to="/register">Register</Button>
                    </div>
                )}

                <GameHeader
                    title="TRAVELING SALESPERSON"
                    badges={["HARD", "GRAPH"]}
                    stats={[
                        { label: "BEST", value: gameState.bestDistance === Infinity ? '--' : formatDistance(gameState.bestDistance) },
                        { label: "POINTS", value: gameState.points.length }
                    ]}
                />

                {scenarioInfo && (
                    <div className={styles.contextBlock}>
                        <h3 className={styles.contextTitle}>{scenarioInfo.name}</h3>
                        <p className={styles.contextDescription}>{scenarioInfo.description}</p>
                    </div>
                )}

                <div className={styles.content}>
                    <div className={styles.mainColumn}>
                        <div className={styles.canvasArea}>
                            <TSPCanvas
                                width={canvasSize.width}
                                height={canvasSize.height}
                                points={gameState.points}
                                bestPath={gameState.bestPath}
                                manualPath={manualPath}
                                algorithm={algorithm}
                                onPointClick={actions.handlePointClick}
                                gameResult={gameResult}
                            />

                            {/* Overlays */}
                            {algorithm === 'manual' && manualPath.length < gameState.points.length && !gameResult && (
                                <div className={styles.instructionOverlay}>
                                    Click points to build path: {manualPath.length}/{gameState.points.length}
                                </div>
                            )}
                            {gameResult && (
                                <div className={styles.resultOverlay}>
                                    {gameResult}
                                </div>
                            )}
                        </div>

                        <GameInstructions
                            instructions={[
                                { title: "1. Choose a Mode", description: "Select a scenario from the dropdown or generate a random instance." },
                                { title: "2. Connect the Dots", description: "In Manual Mode, click points to form a path. Try to find the shortest route without crossing lines!" },
                                { title: "3. Beat the AI", description: "Submit your path and see if the 2-opt algorithm can improve it. If it can't, you win!" }
                            ]}
                        />
                    </div>

                    <div className={styles.sidebar}>
                        <TSPControls
                            algorithm={algorithm}
                            setAlgorithm={setAlgorithm}
                            isRunning={gameState.isRunning}
                            pointsCount={gameState.points.length}
                            manualPathLength={manualPath.length}
                            gameResult={gameResult}
                            speed={gameState.speed}
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
                    </div>
                </div>
            </div>
        </Layout>
    );
}