import { useState, useCallback } from 'react';
import type { DragEvent } from 'react';
import type { Job, FlowshopState } from "@/types/games/flowshop"
import { calculateSolutionMakespan, flowshopAlgorithm } from "@/utils/flowshop";

/**
 * Handles Flowshop algorithm execution and manual order submission.
 * 
 * Manages:
 * - Running brute force flowshop algorithm instantly
 * - Manual solution building and submission against algorithm
 */

export type AlgorithmMode = 'algorithm' | 'random' | 'manual' | 'builder';

export interface SandboxResult {
    won: boolean;
    userScore: number;
    algoScore: number;
}

export const useFlowshopAlgorithms = () => {
    const [gameState, setGameState] = useState<FlowshopState>({
        jobs: [],
        bestSolution: [],
        currentOrder: [],
        bestMakespan: Infinity,
        isRunning: false,
    });

    const [algorithm, setAlgorithmState] = useState<AlgorithmMode>('manual');
    const [manualOrder, setManualOrder] = useState<number[]>([]);
    const [gameResult, setGameResult] = useState<SandboxResult | null>(null);
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);

    // --- State setters exposed for external use (scenario loading, builder, etc.) ---

    const setJobs = useCallback((jobs: Job[]) => {
        const initialOrder = jobs.map(job => job.id);

        setGameState(prev => ({
            ...prev,
            jobs: jobs,
            bestSolution: [],
            currentOrder: initialOrder,
            bestMakespan: Infinity,
            isRunning: false
        }));

        setManualOrder(initialOrder);
        setGameResult(null);
    }, []);

    const setFlowshopInstance = useCallback((jobs: Job[]) => {
        const initialOrder = jobs.map(job => job.id);

        setGameState(prev => ({
            ...prev,
            jobs: jobs,
            bestSolution: [],
            currentOrder: initialOrder,
            bestMakespan: Infinity,
            isRunning: false
        }));

        setManualOrder(initialOrder);
        setGameResult(null);
    }, []);

    const resetOrder = useCallback(() => {
        const initialOrder = gameState.jobs.map(job => job.id);

        setGameState(prev => ({
            ...prev,
            bestSolution: [],
            currentOrder: initialOrder,
            bestMakespan: Infinity
        }));
        setManualOrder(initialOrder);
        setGameResult(null);
    }, []);

    // --- Mode switching ---

    const setAlgorithm = useCallback((mode: AlgorithmMode) => {
        setAlgorithmState(mode);
        if (gameState.isRunning) {
            setGameState(prev => ({ ...prev, isRunning: false }));
        }
        
        setGameState(prev => ({
            ...prev,
            bestSolution: [],
            currentOrder: prev.currentOrder,
            bestMakespan: Infinity
        }));

        setGameResult(null);
    }, [gameState.isRunning]);

    // --- Stop ---

    const stopAlgorithm = useCallback(() => {
        setGameState(prev => ({ ...prev, isRunning: false }));
    }, []);

    // --- Run ---

    const runAlgorithm = useCallback(() => {
        if (gameState.isRunning) return;

        setGameState(prev => ({ ...prev, isRunning: true }));
        setManualOrder([]);

        const solution = flowshopAlgorithm(gameState.jobs);

        setGameState(prev => ({
            ...prev,
            bestSolution: solution.orderedJobs,
            bestMakespan: solution.solutionMakespan,
            currentOrder: solution.orderedJobs,
            isRunning: false
        }));

        setManualOrder(solution.orderedJobs);
    }, [algorithm, gameState.jobs, gameState.isRunning]);

    // --- Manual selection ---

    const handleJobDragStart = useCallback((jobId: number) => {
        if (algorithm !== 'manual' || gameState.isRunning || gameResult) return;

        setDraggedJobId(jobId);
    }, [algorithm, gameState.isRunning, gameResult]);

    const handleJobDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }, []);

    const handleJobDrop = useCallback((targetJobId: number) => {
        if (draggedJobId === null || draggedJobId === targetJobId || algorithm !== 'manual' || gameState.isRunning || gameResult) {
            return;
        }

        const draggedIndex = manualOrder.indexOf(draggedJobId);
        const targetIndex = manualOrder.indexOf(targetJobId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedJobId(null);
            return;
        };

        const newOrder = [...manualOrder];

        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedJobId);

        setManualOrder(newOrder);

        setGameState(prev => ({
            ...prev,
            currentOrder: newOrder
        }));

        setDraggedJobId(null);
    }, [draggedJobId, manualOrder, algorithm, gameState.isRunning, gameResult]);

    const handleJobDragEnd = useCallback(() => {
        setDraggedJobId(null);
    }, []);

    const submitManualOrder = useCallback(() => {
        if (manualOrder.length !== gameState.jobs.length) return;

        const userScore = calculateSolutionMakespan(gameState.jobs, manualOrder);
        
        let solution = [...manualOrder]; 
        let currentMakespan = userScore;

        setGameState(prev => ({
            ...prev,
            bestSolution: solution,
            bestMakespan: currentMakespan,
            isRunning: false
        }));

        const algorithmSolution = flowshopAlgorithm(gameState.jobs);

        const algoScore = algorithmSolution.solutionMakespan

        //Wins less makespan
        const won = userScore <= algoScore;

        setGameResult({
            won,
            userScore,
            algoScore
        })

    }, [manualOrder, gameState.jobs]);

    // --- Clear ---

    const clearAll = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            jobs: algorithm === 'builder' ? [] : prev.jobs,
            bestSolution: [],
            currentOrder: algorithm === 'builder' ? [] : prev.jobs.map(job => job.id),
            bestMakespan: Infinity
        }));

        const initialOrder = gameState.jobs.map(job => job.id);
        setManualOrder(initialOrder);
        setGameResult(null);
    }, [algorithm]);

    return {
        gameState,
        algorithm,
        manualOrder,
        gameResult,
        setJobs,
        setFlowshopInstance,
        setAlgorithm,
        resetOrder,
        setGameState,
        actions: {
            runAlgorithm,
            stopAlgorithm,
            handleJobDragStart,
            handleJobDragOver,
            handleJobDrop,
            handleJobDragEnd,
            submitManualOrder,
            clearAll,
        }
    };
};
