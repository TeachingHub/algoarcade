import { useState, useEffect, useRef } from 'react';
import styles from "@/styles/pages/games/TSP.module.css";
import { CircleStar, Bot } from 'lucide-react';

import { useAuth } from "@/context/AuthContext";

// Shared Components
import GameLayout from "@/layouts/GameLayout";
import Modal from "@/components/shared/Modal";

// Game Specific Components
import FlowshopSandboxControls from "@/components/games/flowshop/FlowshopSandboxControls";
import FlowshopBoard from './FlowshopBoard';

// Hook
import { useFlowshopSandbox } from "@/hooks/games/flowshop/useFlowshopSandbox";

import { formatTotalMakespan } from '@/utils/flowshop';


export default function FlowshopSandbox() {
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
        gameResult,
        scenarioInfo,
        customJobsCount,
        setCustomJobsCount,
        customOperationsMinDuration,
        setCustomOperationsMinDuration,
        customOperationsMaxDuration,
        setCustomOperationsMaxDuration,
        pendingModeSwitch,
        confirmModeSwitch,
        cancelModeSwitch,
        actions
    } = useFlowshopSandbox();

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
            title="FLOWSHOP GAME: SANDBOX"
            badges={["HARD", "FLOWSHOP"]}
            stats={[
                { label: "SCORE", value: gameState.bestMakespan === Infinity ? '--' : formatTotalMakespan(gameState.bestMakespan) },
                { label: "JOBS", value: gameState.jobs.length}
            ]}
            instructions={[
                {title: "1. Create an instace", description: "Create your own game with BUILDER or generate one randomly with RANDOM." },
                { title: "2. Minimize the makespan", description: "Process the jobs in the correct order to minimize the total makespan. The order of jobs must be the same for all machines." },
                { title: "3. Beat the AI", description: "Submit your ordered jobs and see if the flowshop's brute force algorithm can improve it. If it can't, you win!" }
            ]}
            contextInfo={scenarioInfo ? {
                title: scenarioInfo.name,
                description: scenarioInfo.description
            } : null}
            controls={
                <FlowshopSandboxControls
                    selectedMode={algorithm}
                    setSelectedMode={setMode}
                    isRunning={gameState.isRunning}
                    jobsCount={gameState.jobs.length}
                    gameResult={gameResult}
                    customNumberJobs={customJobsCount}
                    setCustomNumberJobs={setCustomJobsCount}
                    customOperationsMinDuration={customOperationsMinDuration}
                    setCustomOperationsMinDuration={setCustomOperationsMinDuration}
                    customOperationsMaxDuration={customOperationsMaxDuration}
                    setCustomOperationsMaxDuration={setCustomOperationsMaxDuration}
                    addJob={actions.addJob}
                    onRun={actions.runAlgorithm}
                    onStop={actions.stopAlgorithm}
                    onSubmit={actions.submitManualOrder}
                    onReset={actions.clearAll}
                    onGenerate={actions.generateScenario}
                    onShare={() => actions.shareInstance(user?.displayName || "")}
                />
            }
        >
            <div ref={canvasAreaRef} className={styles.canvasArea}>

                <FlowshopBoard
                    width={canvasSize.width}
                    height={canvasSize.height}
                    jobs={gameState.jobs}
                    currentOrder={gameState.currentOrder}
                    selectedMode={algorithm}
                    onJobDragStart={actions.handleJobDragStart}
                    onJobDragOver={actions.handleJobDragOver}
                    onJobDrop={actions.handleJobDrop}
                    onJobDragEnd={actions.handleJobDragEnd}
                    deleteJob={actions.deleteJob}
                />

                {/* Overlays */} 
                {algorithm === 'builder' && gameState.jobs.length < 3 && !gameResult && (
                    <div className={styles.instructionOverlay}>
                        <div>Add jobs to the game: Create at least 3 jobs, or your instance will be reset.</div>
                    </div>
                )}
                {algorithm === 'builder' && gameState.jobs.length > 8 && !gameResult && (
                    <div className={styles.instructionOverlay}>
                        <div>Don't create more than 8 jobs, or your instance will be reset.</div>
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
                                <span className={styles.resultScoreValue}>{formatTotalMakespan(gameResult.userScore)}</span>
                            </div>
                            <div className={styles.resultVs}>VS</div>
                            <div className={styles.resultScore}>
                                <span className={styles.resultScoreLabel}>ALGORITHM</span>
                                <span className={styles.resultScoreValue}>{formatTotalMakespan(gameResult.algoScore)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={pendingModeSwitch !== null}
                title="Leave Builder Mode?"
                message={`You have ${gameState.jobs.length} job${gameState.jobs.length !== 1 ? 's' : ''}, but builder mode requires between 3 and 8. Leaving will generate a random instance instead.`}
                confirmLabel="Leave"
                cancelLabel="Stay"
                onConfirm={confirmModeSwitch}
                onCancel={cancelModeSwitch}
                isDestructive
            />
        </GameLayout>
    );
}