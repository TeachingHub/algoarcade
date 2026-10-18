import { useState, useCallback } from 'react';
import type { KnapsackItem, KnapsackState } from "@/types/games/knapsack"
import {
    calculateSolutionValue,
    binaryKnapsack,
    greedyKnapsack,
} from "@/utils/knapsack";

/**
 * Handles Knapsack algorithm execution and manual selection submission.
 * 
 * Manages:
 * - Running greedy knapsack algorithm instantly
 * - Manual solution building and submission against algorithm
 */

export type AlgorithmMode = 'algorithm' | 'random' | 'manual' | 'builder';
export type KnapsackTypeMode = 'fractional' | 'binary';

export interface SandboxResult {
    won: boolean;
    userScore: number;
    algoScore: number;
}

export const useKnapsackAlgorithms = () => {
    const [gameState, setGameState] = useState<KnapsackState>({
        items: [],
        maxWeight: 0,
        freeWeight: 0,
        bestSolution: [],
        currentSelection: [],
        bestValue: -1,
        isRunning: false,
    });

    const [algorithm, setAlgorithmState] = useState<AlgorithmMode>('manual');
    const [KnapsackType, setKnapsackTypeState] = useState<KnapsackTypeMode>('fractional');
    const [manualSelection, setManualSelection] = useState<number[]>([]);
    const [gameResult, setGameResult] = useState<SandboxResult | null>(null);

    // --- State setters exposed for external use (scenario loading, builder, etc.) ---

    const setItems = useCallback((items: KnapsackItem[]) => {
        setGameState(prev => ({
            ...prev,
            items: items,
            freeWeight: gameState.maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: -1,
            isRunning: false
        }));
    }, []);

    const setMaxWeight = useCallback((maxWeight: number) => {
        setGameState(prev => ({
            ...prev,
            maxWeight: maxWeight,
            freeWeight: maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: -1,
            isRunning: false
        }));
    }, []);

    const setKnapsackInstance = useCallback((items: KnapsackItem[], maxWeight: number) => {
        setGameState(prev => ({
            ...prev,
            items: items,
            maxWeight: maxWeight,
            freeWeight: maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: -1,
            isRunning: false
        }));
    }, []);

    const setFreeWeight = useCallback((freeWeight: number) => {
        setGameState(prev => ({
            ...prev,
            freeWeight: freeWeight,
        }));
    }, []);

    const resetSelection = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            freeWeight: gameState.maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: -1
        }));
        setManualSelection([]);
        setGameResult(null);
    }, []);

    // --- Mode switching ---

    const setAlgorithm = useCallback((mode: AlgorithmMode) => {
        setAlgorithmState(mode);
        if (gameState.isRunning) {
            setGameState(prev => ({ ...prev, isRunning: false }));
        }
        setManualSelection([]);
        setGameResult(null);
        setGameState(prev => ({
            ...prev,
            freeWeight: prev.maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: -1
        }));
    }, [gameState.isRunning]);

    const setKnapsackType = useCallback((mode: KnapsackTypeMode) => {
        setKnapsackTypeState(mode);
        if (gameState.isRunning) {
            setGameState(prev => ({ ...prev, isRunning: false }));
        }
        setManualSelection([]);
        setGameResult(null);
        setGameState(prev => ({
            ...prev,
            freeWeight: prev.maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: -1
        }));
    }, [gameState.isRunning]);

    // --- Stop ---

    const stopAlgorithm = useCallback(() => {
        setGameState(prev => ({ ...prev, isRunning: false }));
    }, []);

    // --- Run ---

    const runAlgorithm = useCallback(() => {
        if (gameState.isRunning) return;

        setGameState(prev => ({ ...prev, isRunning: true }));
        setManualSelection([]);

        const solution = KnapsackType === 'fractional'
            ? greedyKnapsack(gameState.items, gameState.maxWeight)
            : binaryKnapsack(gameState.items, gameState.maxWeight);

        setGameState(prev => ({
            ...prev,
            bestSolution: solution.items,
            bestValue: solution.solutionValue,
            currentSelection: solution.items,
            isRunning: false
        }));
    }, [algorithm, gameState.items, gameState.maxWeight, gameState.isRunning]);

    // --- Manual selection ---

    const handleItemClick = useCallback((itemId: number) => {
        if (algorithm !== 'manual' || gameState.isRunning || gameResult) return;

        if (!manualSelection.includes(itemId)) { //Click in a not selected item
            if (gameState.freeWeight > 0 && (KnapsackType === 'fractional' || gameState.freeWeight >= gameState.items[itemId].weight)) {
                const newManualSelection = [...manualSelection, itemId]; //Add the item to the end of selection (last item will be the one that gets divided in fractional mode)
                setManualSelection(newManualSelection);
                setFreeWeight(gameState.freeWeight - gameState.items[itemId].weight);

                const solutionValue = calculateSolutionValue(gameState.items, newManualSelection, gameState.maxWeight);
                setGameState(prev => ({
                    ...prev,
                    currentSelection: newManualSelection,
                    bestValue: solutionValue
                }));
            }
        } else { //Click in a selected item
            const newManualSelection = manualSelection.filter(id => id !== itemId);
            setManualSelection(newManualSelection);
            setFreeWeight(gameState.freeWeight + gameState.items[itemId].weight);

            const solutionValue = calculateSolutionValue(gameState.items, newManualSelection, gameState.maxWeight);
                setGameState(prev => ({
                    ...prev,
                    currentSelection: newManualSelection,
                    bestValue: solutionValue
                }));
        }
    }, [algorithm, gameState.isRunning, gameResult, manualSelection, gameState.items]);

    const submitManualSelection = useCallback(() => {
        if (manualSelection.length === 0) return;

        const userScore = calculateSolutionValue(gameState.items, manualSelection, gameState.maxWeight);
        
        let solution = [...manualSelection]; 
        let currentValue = userScore;

        setGameState(prev => ({
            ...prev,
            bestSolution: solution,
            bestValue: currentValue,
            isRunning: false
        }));

        const algorithmSolution = KnapsackType === 'fractional'
            ? greedyKnapsack(gameState.items, gameState.maxWeight)
            : binaryKnapsack(gameState.items, gameState.maxWeight);

        const algoScore = algorithmSolution.solutionValue

        const won = userScore >= algoScore;

        setGameResult({
            won,
            userScore,
            algoScore
        })

    }, [manualSelection, gameState.items]);

    // --- Clear ---

    const clearAll = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            items: algorithm === 'builder' ? [] : prev.items,
            freeWeight: gameState.maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: -1
        }));
        setManualSelection([]);
        setGameResult(null);
    }, [algorithm]);

    return {
        gameState,
        algorithm,
        KnapsackType,
        manualSelection,
        gameResult,
        setItems,
        setMaxWeight,
        setKnapsackInstance,
        setAlgorithm,
        setKnapsackType,
        resetSelection,
        setGameState,
        actions: {
            runAlgorithm,
            stopAlgorithm,
            handleItemClick,
            submitManualSelection,
            clearAll,
        }
    };
};
