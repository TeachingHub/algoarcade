import { useState, useEffect } from 'react';
import Layout from "@/layouts/Layout";
import Button from "@/components/shared/Button";
import styles from "@/styles/pages/games/TSP.module.css";
import { useAuth } from "@/context/AuthContext";

// Modular Components
import TSPCanvas from "@/components/games/tsp/TSPCanvas";
import TSPControls from "@/components/games/tsp/TSPControls";
import TSPHeader from "@/components/games/tsp/TSPHeader";
import TSPInstructions from "@/components/games/tsp/TSPInstructions";

// Hook
import { useTSPGame } from "@/hooks/games/useTSPGame";

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
        bgElements,
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
                        ⚠️ Progress not saved. Log in to track your scores! <Button style={["link"]} to="/login">Log in</Button> or <Button style={["link"]} to="/register">Register</Button>
                    </div>
                )}

                <TSPHeader gameState={gameState} />

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
                                bgElements={bgElements}
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

                        <TSPInstructions />
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
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}