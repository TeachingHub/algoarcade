import { useCallback, useMemo, useState } from 'react';
import type { KnapsackItem, KnapsackInstance } from '@/types/games/knapsack';
import type { PublicationMetadata } from '@/types/publishedInstance';

import { useKnapsackAlgorithms } from './useKnapsackAlgorithms';
import { useKnapsackScenarios } from './useKnapsackScenarios';
import { useKnapsackBuilder } from './useKnapsackBuilder';
import { useKnapsackInstanceSharing } from './useKnapsackInstanceSharing';
import { useKnapsackInstancePublishing } from './useKnapsackInstancePublishing';

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
            if (!builder.isValidBuilderState(algorithms.gameState.items.length, algorithms.gameState.maxWeight)) {
                setPendingModeSwitch(algo);
                return;
            }
        }
        algorithms.setAlgorithm(algo);
    }, [algorithms, builder]);

    const setKnapsackType = useCallback((mode: 'fractional' | 'binary') => {
        algorithms.setKnapsackType(mode);
    }, [algorithms]);

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

    const handleSharedInstanceLoaded = useCallback((items: KnapsackItem[], maxWeight: number, author: string, knapsackType: 'fractional' | 'binary') => {
            algorithms.setItems(items);
            algorithms.setMaxWeight(maxWeight);
            algorithms.setKnapsackType(knapsackType);
            
            scenarios.setScenarioInfo({
                name: "Shared Challenge",
                description: `Created by ${author}`,
            });
        },
        [algorithms, scenarios]
    );

    const handleSharingFallback = useCallback(() => {
        const knapsackInstance = scenarios.generateScenario();

        algorithms.setItems(knapsackInstance.items);
        algorithms.setMaxWeight(knapsackInstance.maxWeight);
    }, [algorithms, scenarios]);

    const {
        isLoading: isSharedInstanceLoading,
        shareInstance: shareInstanceRaw,
    } = useKnapsackInstanceSharing({
        onInstanceLoaded: handleSharedInstanceLoaded,
        onFallback: handleSharingFallback,
    });

    const shareInstance = useCallback(
        async (authorName: string) => {
            return shareInstanceRaw({
                items: algorithms.gameState.items,
                maxWeight: algorithms.gameState.maxWeight,
                author: authorName,
                knapsackType: algorithms.KnapsackType
            });
        },
        [shareInstanceRaw, algorithms.gameState.items, algorithms.gameState.maxWeight, algorithms.KnapsackType]
    );

    const handlePublishedInstanceLoaded = useCallback((instance: KnapsackInstance) => {
        algorithms.setItems(instance.items);
        algorithms.setMaxWeight(instance.maxWeight);
        algorithms.setKnapsackType(instance.knapsackType);

        scenarios.setScenarioInfo({
            name: "Published Challenge",
            description: `Created by ${instance.author}`
        });
    }, [algorithms, scenarios]);

    const {
        isLoading: isPublishedInstanceLoading,
        isPublishing,
        publishInstance: publishInstanceRaw
    } = useKnapsackInstancePublishing({
        onInstanceLoaded: handlePublishedInstanceLoaded
    });

    const publishInstance = useCallback(
        (metadata: PublicationMetadata) => {
            return publishInstanceRaw(
                {
                    items: algorithms.gameState.items,
                    maxWeight: algorithms.gameState.maxWeight,
                    author: metadata.creatorName,
                    knapsackType: algorithms.KnapsackType
                },
                metadata
            );
        }, [publishInstanceRaw, algorithms.gameState.items, algorithms.gameState.maxWeight, algorithms.KnapsackType]
    );

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
        shareInstance,
        publishInstance,
    }), [
        generateScenario,
        algorithms.actions,
        addItem,
        deleteItem,
        setMaxWeight,
        shareInstance,
        publishInstance,
    ]);

    return {
        gameState: algorithms.gameState,
        algorithm: algorithms.algorithm,
        setMode,
        knapsackType: algorithms.KnapsackType,
        setKnapsackType,
        manualSelection: algorithms.manualSelection,
        gameResult: algorithms.gameResult,
        scenarioInfo: scenarios.scenarioInfo,
        customItemsCount: scenarios.customItemsCount,
        setCustomItemsCount: scenarios.setCustomItemsCount,
        customItemsMinWeight: scenarios.customItemsMinWeight,
        setCustomItemsMinWeight: scenarios.setCustomItemsMinWeight,
        customItemsMaxWeight: scenarios.customItemsMaxWeight,
        setCustomItemsMaxWeight: scenarios.setCustomItemsMaxWeight,
        isLoading: isSharedInstanceLoading || isPublishedInstanceLoading,
        isPublishing,
        pendingModeSwitch,
        confirmModeSwitch,
        cancelModeSwitch,
        actions,
    };
};
