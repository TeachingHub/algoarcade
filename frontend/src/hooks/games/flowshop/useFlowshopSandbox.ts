import { useCallback, useMemo, useState } from 'react';
import type { Job } from '@/types/games/flowshop';

import { useFlowshopAlgorithms } from './useFlowshopAlgorithms';
import { useFlowshopScenarios } from './useFlowshopScenarios';
import { useFlowshopBuilder } from './useFlowshopBuilder';
import { useFlowshopInstanceSharing } from './useFlowshopInstanceSharing';

/**
 * Orchestrator hook for Flowshop Sandbox mode.
 * 
 * Composes four sub-hooks:
 *  - useFlowshopAlgorithms    → game state, algorithm execution, manual order
 *  - useFlowshopScenarios     → scenario generation & metadata
 *  - useFlowshopBuilder       → builder mode
 *  - useFlowshopInstanceSharing → URL instance loading & sharing
 */

export const useFlowshopSandbox = () => {
    const algorithms = useFlowshopAlgorithms();
    const scenarios = useFlowshopScenarios();
    const builder = useFlowshopBuilder();

    // --- Builder exit warning ---
    const [pendingModeSwitch, setPendingModeSwitch] = useState<'algorithm' | 'random' | 'manual' | 'builder' | null>(null);

    // --- Scenario generation (wraps scenarios + algorithms) ---

    const generateScenario = useCallback((jobsCount?: number, machinesCount?: number) => {
        algorithms.actions.stopAlgorithm();
        algorithms.resetOrder();

        const flowshopInstance = scenarios.generateScenario(jobsCount, machinesCount);
        algorithms.setFlowshopInstance(flowshopInstance.jobs);
    }, [algorithms, scenarios]);

    // --- Algorithm switching (validates builder state before leaving) ---

    const setMode = useCallback((algo: 'algorithm' | 'random' | 'manual' | 'builder') => {
        // If leaving builder mode with invalid jobs
        if (algorithms.algorithm === 'builder' && algo !== 'builder') {
            if (!builder.isValidBuilderState(algorithms.gameState.jobs.length)) {
                setPendingModeSwitch(algo);
                return;
            }
        }
        algorithms.setAlgorithm(algo);
    }, [algorithms, builder]);

    const confirmModeSwitch = useCallback(() => {
        if (!pendingModeSwitch) return;
        const flowshopInstance = scenarios.generateFallback();
        algorithms.setFlowshopInstance(flowshopInstance.jobs);
        algorithms.setAlgorithm(pendingModeSwitch);
        setPendingModeSwitch(null);
    }, [pendingModeSwitch, algorithms, scenarios]);

    const cancelModeSwitch = useCallback(() => {
        setPendingModeSwitch(null);
    }, []);

    // --- Builder mode (wraps builder + algorithms) ---

    const addJob = useCallback((name: string, operationsTimes: number[], icon: string) => {
        if (algorithms.algorithm !== 'builder' || algorithms.gameState.isRunning) return;

        const newJobs = builder.addJob(name, operationsTimes, icon, algorithms.gameState.jobs);
        if (newJobs) {
            algorithms.setJobs(newJobs);
        }
    }, [algorithms, builder]);

    const deleteJob = useCallback((id: number) => {
        if (algorithms.algorithm !== 'builder' || algorithms.gameState.isRunning) return;

        const newJobs = builder.deleteJob(id, algorithms.gameState.jobs);
        if (newJobs) {
            algorithms.setJobs(newJobs);
        }
    }, [algorithms, builder]);

    // --- Instance sharing (wraps sharing + algorithms + scenarios) ---

    const handleSharedInstanceLoaded = useCallback((jobs: Job[], author: string) => {
            algorithms.setJobs(jobs);

            scenarios.setScenarioInfo({
                name: "Shared Challenge",
                description: `Created by ${author}`,
            });
        },
        [algorithms, scenarios]
    );

    const handleSharingFallback = useCallback(() => {
        const flowshopInstance = scenarios.generateScenario();

        algorithms.setJobs(flowshopInstance.jobs);
    }, [algorithms, scenarios]);

    const {
        isLoading,
        shareInstance: shareInstanceRaw,
    } = useFlowshopInstanceSharing({
        onInstanceLoaded: handleSharedInstanceLoaded,
        onFallback: handleSharingFallback,
    });

    const shareInstance = useCallback(
        async (authorName: string) => {
            return shareInstanceRaw({
                jobs: algorithms.gameState.jobs,
                author: authorName
            });
        },
        [shareInstanceRaw, algorithms.gameState.jobs]
    );

    // --- Compose the public API  ---

    const actions = useMemo(() => ({
        generateScenario,
        runAlgorithm: algorithms.actions.runAlgorithm,
        stopAlgorithm: algorithms.actions.stopAlgorithm,
        handleJobDragStart: algorithms.actions.handleJobDragStart,
        handleJobDragOver: algorithms.actions.handleJobDragOver,
        handleJobDrop: algorithms.actions.handleJobDrop,
        handleJobDragEnd: algorithms.actions.handleJobDragEnd,
        addJob,
        deleteJob,
        submitManualOrder: algorithms.actions.submitManualOrder,
        clearAll: algorithms.actions.clearAll,
        shareInstance,
    }), [
        generateScenario,
        algorithms.actions,
        addJob,
        shareInstance,
    ]);

    return {
        gameState: algorithms.gameState,
        algorithm: algorithms.algorithm,
        setMode,
        manualOrder: algorithms.manualOrder,
        gameResult: algorithms.gameResult,
        scenarioInfo: scenarios.scenarioInfo,
        customJobsCount: scenarios.customJobsCount,
        setCustomJobsCount: scenarios.setCustomJobsCount,
        customOperationsMinDuration: scenarios.customOperationsMinDuration,
        setCustomOperationsMinDuration: scenarios.setCustomOperationsMinDuration,
        customOperationsMaxDuration: scenarios.customOperationsMaxDuration,
        setCustomOperationsMaxDuration: scenarios.setCustomOperationsMaxDuration,
        isLoading,
        pendingModeSwitch,
        confirmModeSwitch,
        cancelModeSwitch,
        actions,
    };
};
