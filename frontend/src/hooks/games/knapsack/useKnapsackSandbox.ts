import { useCallback, useMemo, useState } from 'react';
import { useKnapsackAlgorithms } from './useKnapsackAlgorithms';
import { useKnapsackScenarios } from './useKnapsackScenarios';
import { useKnapsackBuilder } from './useKnapsackBuilder';
import { useKnapsackInstanceSharing } from './useKnapsackInstanceSharing';

/**
 * Orchestrator hook for Knapsack Sandbox mode.
 * 
 * Composes four sub-hooks:
 *  - useKnapsackAlgorithms    → game state, algorithm execution, manual selection
 *  - useKnapsackScenarios     → scenario generation & metadata
 *  - useKnapsackBuilder       → builder mode
 *  - useKnapsackInstanceSharing → URL instance loading & sharing
 */

export const useKnapsackSandbox = () => {
    const algorithms = useKnapsackAlgorithms();
    const scenarios = useKnapsackScenarios();
    const builder = useKnapsackBuilder();

    // --- Builder exit warning ---
    const [pendingModeSwitch, setPendingModeSwitch] = useState<'algorithm' | 'random' | 'manual' | 'builder' | null>(null);

    // --- Scenario generation (wraps scenarios + algorithms) ---

    const generateScenario = useCallback((count?: number, minWeight?: number, maxWeight?: number) => {
        algorithms.actions.stopAlgorithm();
        algorithms.resetSelection();

        const knapsackInstance = scenarios.generateScenario(count, minWeight, maxWeight);
        algorithms.setKnapsackInstance(knapsackInstance.items, knapsackInstance.maxWeight);
    }, [algorithms, scenarios]);

    // --- Algorithm switching (validates builder state before leaving) ---

    const setMode = useCallback((algo: 'algorithm' | 'random' | 'manual' | 'builder') => {
        // If leaving builder mode with invalid item count or invalid maxWeight value, show warning
        if (algorithms.algorithm === 'builder' && algo !== 'builder') {
            if (!builder.isValidBuilderState(algorithms.gameState.items.length, algorithms.gameState.maxWeight)) { //Cambiar esto cuando esté hecho el builder
                setPendingModeSwitch(algo);
                return;
            }
        }
        algorithms.setAlgorithm(algo);
    }, [algorithms, builder]);

    const confirmModeSwitch = useCallback(() => {
        if (!pendingModeSwitch) return;
        const knapsackInstance = scenarios.generateFallback();
        algorithms.setKnapsackInstance(knapsackInstance.items, knapsackInstance.maxWeight);
        algorithms.setAlgorithm(pendingModeSwitch);
        setPendingModeSwitch(null);
    }, [pendingModeSwitch, algorithms, scenarios]);

    const cancelModeSwitch = useCallback(() => {
        setPendingModeSwitch(null);
    }, []);

    // --- Builder mode (wraps builder + algorithms) ---

    const addItem = useCallback((name: string, value: number, weight: number, icon: string) => {
        if (algorithms.algorithm !== 'builder' || algorithms.gameState.isRunning) return;

        const newItems = builder.addItem(name, value, weight, icon, algorithms.gameState.items);
        if (newItems) {
            algorithms.setItems(newItems);
        }
    }, [algorithms, builder]);

    const deleteItem = useCallback((id: number) => {
        if (algorithms.algorithm !== 'builder' || algorithms.gameState.isRunning) return;

        const newItems = builder.deleteItem(id, algorithms.gameState.items);
        if (newItems) {
            algorithms.setItems(newItems);
        }
    }, [algorithms, builder]);

    const setMaxWeight = useCallback((maxWeight: number) => {
        if (algorithms.algorithm !== 'builder' || algorithms.gameState.isRunning) return;

        const newMaxWeight = builder.setMaxWeight(maxWeight);
        if (newMaxWeight) {
            algorithms.setMaxWeight(newMaxWeight);
        }
    }, [algorithms, builder]);

    // --- Instance sharing (wraps sharing + algorithms + scenarios) ---

    const { isLoading, shareInstance: shareInstanceRaw } = useKnapsackInstanceSharing( {
            onInstanceLoaded: useCallback((items, maxWeight, author) => {
                algorithms.setItems(items);
                algorithms.setMaxWeight(maxWeight);
                scenarios.setScenarioInfo({
                    name: "Shared Challenge",
                    description: `Created by ${author}`
                });
            }, [algorithms, scenarios]),

            onFallback: useCallback(() => {
                const knapsackInstance = scenarios.generateScenario();
                algorithms.setItems(knapsackInstance.items);
                algorithms.setMaxWeight(knapsackInstance.maxWeight)
            }, [algorithms, scenarios]),
        }
    );

    const shareInstance = useCallback(async (authorName: string) => {
        return shareInstanceRaw(algorithms.gameState.items, algorithms.gameState.maxWeight, authorName);
    }, [shareInstanceRaw, algorithms.gameState.items, algorithms.gameState.maxWeight]);

    // --- Compose the public API  ---

    const actions = useMemo(() => ({
        generateScenario,
        runAlgorithm: algorithms.actions.runAlgorithm,
        stopAlgorithm: algorithms.actions.stopAlgorithm,
        handleItemClick: algorithms.actions.handleItemClick,
        addItem,
        deleteItem,
        setMaxWeight,
        submitManualSelection: algorithms.actions.submitManualSelection,
        clearAll: algorithms.actions.clearAll,
        setSpeed: algorithms.actions.setSpeed,
        shareInstance,
    }), [
        generateScenario,
        algorithms.actions,
        addItem,
        shareInstance,
    ]);

    return {
        gameState: algorithms.gameState,
        algorithm: algorithms.algorithm,
        setMode,
        manualSelection: algorithms.manualSelection,
        gameResult: algorithms.gameResult,
        scenarioInfo: scenarios.scenarioInfo,
        customItemsCount: scenarios.customItemsCount,
        setCustomItemsCount: scenarios.setCustomItemsCount,
        customItemsMinWeight: scenarios.customItemsMinWeight,
        setCustomItemsMinWeight: scenarios.setCustomItemsMinWeight,
        customItemsMaxWeight: scenarios.customItemsMaxWeight,
        setCustomItemsMaxWeight: scenarios.setCustomItemsMaxWeight,
        isLoading,
        pendingModeSwitch,
        confirmModeSwitch,
        cancelModeSwitch,
        actions,
    };
};
