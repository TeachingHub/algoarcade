import { useState, useEffect, useRef } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";
import { CircleStar, Bot } from 'lucide-react';

import { useAuth } from "@/context/AuthContext";

// Shared Components
import GameLayout from "@/layouts/GameLayout";
import Modal from "@/components/shared/Modal";

// Game Specific Components
import KnapsackSandboxControls from "@/components/games/knapsack/KnapsackSandboxControls";
import KnapsackBoard from './KnapsackBoard';

// Hook
import { useKnapsackSandbox } from "@/hooks/games/knapsack/useKnapsackSandbox";
import { formatTotalValue } from '@/utils/knapsack';


export default function KnapsackSandbox() {
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

    // Game Logic Hook
    const {
        gameState,
        algorithm,
        setMode,
        manualSelection,
        gameResult,
        scenarioInfo,
        customItemsCount,
        setCustomItemsCount,
        customItemsMinWeight,
        setCustomItemsMinWeight,
        customItemsMaxWeight,
        setCustomItemsMaxWeight,
        pendingModeSwitch,
        confirmModeSwitch,
        cancelModeSwitch,
        actions
    } = useKnapsackSandbox();

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
            title="KNAPSACK GAME: SANDBOX"
            badges={["HARD", "KNAPSACK"]}
            stats={[
                { label: "SCORE", value: gameState.bestValue === Infinity ? '--' : formatTotalValue(gameState.bestValue) },
                { label: "ITEMS", value: gameState.items.length}
            ]}
            instructions={[
                {title: "1. Choose a Mode", description: "Create your own game with BUILDER or generate one randomly with RANDOM." },
                { title: "2. Maximize the value of your knapsack", description: "Select the best items to maximize your value while staying within the knapsack's maximum weight limit. The last item you select will be divided if its weight exceeds the knapsack's capacity." },
                { title: "3. Beat the AI", description: "Submit your selection and see if the knapsack's greedy algorithm can improve it. If it can't, you win!" }
            ]}
            contextInfo={scenarioInfo ? {
                title: scenarioInfo.name,
                description: scenarioInfo.description
            } : null}
            controls={
                <KnapsackSandboxControls
                    selectedMode={algorithm}
                    setSelectedMode={setMode}
                    isRunning={gameState.isRunning}
                    itemsCount={gameState.items.length}
                    manualSelectionLength={manualSelection.length}
                    gameResult={gameResult}
                    customNumberItems={customItemsCount}
                    setCustomNumberItems={setCustomItemsCount}
                    customItemsMinWeight={customItemsMinWeight}
                    setCustomItemsMinWeight={setCustomItemsMinWeight}
                    customItemsMaxWeight={customItemsMaxWeight}
                    setCustomItemsMaxWeight={setCustomItemsMaxWeight}
                    addItem={actions.addItem}
                    setMaxWeight={actions.setMaxWeight}
                    onRun={actions.runAlgorithm}
                    onStop={actions.stopAlgorithm}
                    onSubmit={actions.submitManualSelection}
                    onReset={actions.clearAll}
                    onGenerate={actions.generateScenario}
                    onShare={() => actions.shareInstance(user?.displayName || "")}
                />
            }
        >
            <div ref={canvasAreaRef} className={styles.canvasArea}>

                <KnapsackBoard
                    width={canvasSize.width}
                    height={canvasSize.height}
                    items={gameState.items}
                    selectedItems={gameState.currentSelection}
                    maxWeight={gameState.maxWeight}
                    onItemClick={actions.handleItemClick}
                    deleteItem={actions.deleteItem}
                    selectedMode={algorithm}
                />

                {/* Overlays */} 
                {algorithm === 'manual' && gameState.freeWeight > 0 && !gameResult && (
                    <div className={styles.instructionOverlay}>
                        Click items to add them to the knapsack: {gameState.maxWeight - gameState.freeWeight}/{gameState.maxWeight}
                    </div>
                )}
                {algorithm === 'builder' && gameState.items.length < 3 && !gameResult && (
                    <div className={styles.instructionOverlay}>
                        <div>Add items to the game: Create at least 3 items, or your instance will be reset.</div>
                    </div>
                )}
                {gameResult && (
                    <div className={styles.resultOverlay}>
                        <div className={styles.resultIcon}>
                            {gameResult.won
                                ? <CircleStar size={32} color="var(--primary)" />
                                : <Bot size={32} color="var(--destructive)" />
                            }
                        </div>
                        <div className={styles.resultTitle}>
                            {gameResult.won ? 'YOU WIN!' : 'YOU LOSE!'}
                        </div>
                        <div className={styles.resultScores}>
                            <div className={styles.resultScore}>
                                <span className={styles.resultScoreLabel}>YOUR SCORE</span>
                                <span className={styles.resultScoreValue}>{formatTotalValue(gameResult.userScore)}</span>
                            </div>
                            <div className={styles.resultVs}>VS</div>
                            <div className={styles.resultScore}>
                                <span className={styles.resultScoreLabel}>ALGORITHM</span>
                                <span className={styles.resultScoreValue}>{formatTotalValue(gameResult.algoScore)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={pendingModeSwitch !== null}
                title="Leave Builder Mode?"
                message={`You have ${gameState.items.length} item${gameState.items.length !== 1 ? 's' : ''}, but builder mode requires between 3 and 50. Leaving will generate a random instance instead.`}
                confirmLabel="Leave"
                cancelLabel="Stay"
                onConfirm={confirmModeSwitch}
                onCancel={cancelModeSwitch}
                isDestructive
            />
        </GameLayout>
    );
}