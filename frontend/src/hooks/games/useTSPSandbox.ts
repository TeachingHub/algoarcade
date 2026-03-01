import { useCallback, useMemo } from 'react';
import { useTSPAlgorithms } from './tsp/useTSPAlgorithms';
import { useTSPScenarios } from './tsp/useTSPScenarios';
import { useTSPBuilder } from './tsp/useTSPBuilder';
import { useTSPInstanceSharing } from './tsp/useTSPInstanceSharing';

/**
 * Orchestrator hook for TSP Sandbox mode.
 * 
 * Composes four sub-hooks:
 *  - useTSPAlgorithms    → game state, algorithm execution, manual path
 *  - useTSPScenarios     → scenario generation & metadata
 *  - useTSPBuilder       → builder mode point placement
 *  - useTSPInstanceSharing → URL instance loading & sharing
 * 
 * Exposes the same public API as the original monolithic hook
 * so that TSPSandbox.tsx and TSPSandboxControls.tsx require no changes.
 */

export const useTSPSandbox = (canvasSize: { width: number, height: number }) => {
    const algorithms = useTSPAlgorithms();
    const scenarios = useTSPScenarios(canvasSize);
    const builder = useTSPBuilder();

    // --- Scenario generation (wraps scenarios + algorithms) ---

    const generateScenario = useCallback((pattern: string, count?: number) => {
        algorithms.actions.stopAlgorithm();
        algorithms.resetPaths();

        const points = scenarios.generateScenario(pattern, count);
        algorithms.setPoints(points);
    }, [algorithms, scenarios]);

    // --- Algorithm switching (validates builder state before leaving) ---

    const setAlgorithm = useCallback((algo: 'nearest' | '2opt' | 'manual' | 'builder') => {
        // If leaving builder mode with invalid point count, generate fallback
        if (algorithms.algorithm === 'builder' && algo !== 'builder') {
            if (!builder.isValidBuilderState(algorithms.gameState.points.length)) {
                const points = scenarios.generateFallback(scenarios.customPointCount);
                algorithms.setPoints(points);
            }
        }
        algorithms.setAlgorithm(algo);
    }, [algorithms, builder, scenarios]);

    // --- Builder mode (wraps builder + algorithms) ---

    const addPoint = useCallback((x: number, y: number) => {
        if (algorithms.algorithm !== 'builder' || algorithms.gameState.isRunning) return;

        const newPoints = builder.addPoint(x, y, algorithms.gameState.points);
        if (newPoints) {
            algorithms.setPoints(newPoints);
        }
    }, [algorithms, builder]);

    // --- Instance sharing (wraps sharing + algorithms + scenarios) ---

    const { isLoading, shareInstance: shareInstanceRaw } = useTSPInstanceSharing(
        canvasSize,
        {
            onInstanceLoaded: useCallback((points, author) => {
                algorithms.setPoints(points);
                scenarios.setScenarioInfo({
                    name: "Shared Challenge",
                    description: `Created by ${author}`
                });
            }, [algorithms, scenarios]),

            onFallback: useCallback(() => {
                const points = scenarios.generateScenario('random');
                algorithms.setPoints(points);
            }, [algorithms, scenarios]),
        }
    );

    const shareInstance = useCallback(async (authorName: string) => {
        return shareInstanceRaw(algorithms.gameState.points, authorName);
    }, [shareInstanceRaw, algorithms.gameState.points]);

    // --- Compose the public API (same shape as the original hook) ---

    const actions = useMemo(() => ({
        generateScenario,
        runAlgorithm: algorithms.actions.runAlgorithm,
        stopAlgorithm: algorithms.actions.stopAlgorithm,
        handlePointClick: algorithms.actions.handlePointClick,
        addPoint,
        submitManualPath: algorithms.actions.submitManualPath,
        clearAll: algorithms.actions.clearAll,
        setSpeed: algorithms.actions.setSpeed,
        shareInstance,
    }), [
        generateScenario,
        algorithms.actions,
        addPoint,
        shareInstance,
    ]);

    return {
        gameState: algorithms.gameState,
        algorithm: algorithms.algorithm,
        setAlgorithm,
        manualPath: algorithms.manualPath,
        gameResult: algorithms.gameResult,
        scenarioInfo: scenarios.scenarioInfo,
        customPointCount: scenarios.customPointCount,
        setCustomPointCount: scenarios.setCustomPointCount,
        isLoading,
        actions,
    };
};
