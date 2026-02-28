import { useState, useEffect } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";
import GameLayout from "@/layouts/GameLayout";
import TSPCanvas from "@/components/games/tsp/TSPCanvas";
import { useTSPCompetitive } from "@/hooks/games/useTSPCompetitive";

export default function TSPCompetitive({ onChangeMode }: { onChangeMode: (mode: 'sandbox' | 'competitive') => void }) {
    // UI State for resizing
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

    // We'll scaffold this later. For now just use a placeholder
    const { gameState } = useTSPCompetitive(canvasSize);

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
                    <h3>COMPETITIVE CONTROLS</h3>
                    <p className={styles.loadingText}>Loading Daily Leaderboard soon...</p>
                    {/* Placeholder for Competitive Controls */}
                    <button
                        onClick={() => onChangeMode('sandbox')}
                        className={styles.returnButton}
                    >
                        RETURN TO SANDBOX
                    </button>
                </div>
            }
        >
            <div className={styles.canvasArea}>
                {gameState?.points?.length > 0 ? (
                    <TSPCanvas
                        width={canvasSize.width}
                        height={canvasSize.height}
                        points={gameState.points}
                        bestPath={[]}
                        manualPath={[]}
                        algorithm="manual"
                        onPointClick={() => { }}
                        gameResult={null}
                    />
                ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        Loading Daily Challenge...
                    </div>
                )}
            </div>
        </GameLayout>
    );
}
