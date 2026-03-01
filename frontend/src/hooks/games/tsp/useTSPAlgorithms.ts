import { useState, useCallback } from 'react';
import type { Point, TSPState } from "@/types/games/tsp";
import {
    calculateTotalDistance,
    nearestNeighborTSP,
    twoOptImprovement,
} from "@/utils/tsp";
import { useTSPAnimation } from './useTSPAnimation';

/**
 * Handles TSP algorithm execution (Nearest Neighbor, 2-Opt) and manual path submission.
 * 
 * Manages:
 * - Running nearest neighbor instantly
 * - Running 2-opt with step-by-step animation
 * - Manual path building (click-to-add) and submission against 2-opt
 * - Animation speed control
 */

export type AlgorithmMode = 'nearest' | '2opt' | 'manual' | 'builder';

export interface SandboxResult {
    won: boolean;
    userDistance: number;
    algoDistance: number;
}

export const useTSPAlgorithms = () => {
    const [gameState, setGameState] = useState<TSPState>({
        points: [],
        bestPath: [],
        currentPath: [],
        bestDistance: Infinity,
        isRunning: false,
        speed: 50
    });

    const [algorithm, setAlgorithmState] = useState<AlgorithmMode>('nearest');
    const [manualPath, setManualPath] = useState<number[]>([]);
    const [gameResult, setGameResult] = useState<SandboxResult | null>(null);

    const animation = useTSPAnimation(gameState.speed ?? 50);

    // --- State setters exposed for external use (scenario loading, builder, etc.) ---

    const setPoints = useCallback((points: Point[]) => {
        setGameState(prev => ({
            ...prev,
            points,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity,
            isRunning: false
        }));
    }, []);

    const resetPaths = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
        setManualPath([]);
        setGameResult(null);
    }, []);

    // --- Algorithm switching ---

    const setAlgorithm = useCallback((algo: AlgorithmMode) => {
        setAlgorithmState(algo);
        if (gameState.isRunning) {
            animation.stop();
            setGameState(prev => ({ ...prev, isRunning: false }));
        }
        setManualPath([]);
        setGameResult(null);
        setGameState(prev => ({
            ...prev,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
    }, [gameState.isRunning, animation]);

    // --- Stop ---

    const stopAlgorithm = useCallback(() => {
        animation.stop();
        setGameState(prev => ({ ...prev, isRunning: false }));
    }, [animation]);

    // --- Run ---

    const runAlgorithm = useCallback(() => {
        if (gameState.isRunning) return;

        setGameState(prev => ({ ...prev, isRunning: true }));
        setManualPath([]);

        if (algorithm === 'nearest') {
            const route = nearestNeighborTSP(gameState.points);
            const distance = calculateTotalDistance(gameState.points, route);
            setGameState(prev => ({
                ...prev,
                bestPath: route,
                bestDistance: distance,
                isRunning: false
            }));
        } else if (algorithm === '2opt') {
            const initialRoute = nearestNeighborTSP(gameState.points);
            let currentRoute = initialRoute;
            let currentDistance = calculateTotalDistance(gameState.points, currentRoute);

            setGameState(prev => ({
                ...prev,
                bestPath: currentRoute,
                bestDistance: currentDistance
            }));

            const improve = () => {
                const result = twoOptImprovement(gameState.points, currentRoute);
                currentRoute = result.route;
                currentDistance = calculateTotalDistance(gameState.points, currentRoute);

                setGameState(prev => ({
                    ...prev,
                    bestPath: currentRoute,
                    bestDistance: currentDistance
                }));

                if (result.improved) {
                    animation.scheduleNext(improve);
                } else {
                    setGameState(prev => ({ ...prev, isRunning: false }));
                }
            };

            animation.scheduleNext(improve);
        }
    }, [algorithm, gameState.points, gameState.isRunning, animation]);

    // --- Manual path ---

    const handlePointClick = useCallback((pointId: number) => {
        if (algorithm !== 'manual' || gameState.isRunning || gameResult) return;

        if (!manualPath.includes(pointId)) {
            const newManualPath = [...manualPath, pointId];
            setManualPath(newManualPath);

            if (newManualPath.length === gameState.points.length) {
                const distance = calculateTotalDistance(gameState.points, newManualPath);
                setGameState(prev => ({
                    ...prev,
                    currentPath: newManualPath,
                    bestDistance: distance
                }));
            }
        }
    }, [algorithm, gameState.isRunning, gameResult, manualPath, gameState.points]);

    const submitManualPath = useCallback(() => {
        if (manualPath.length !== gameState.points.length) return;

        const userDistance = calculateTotalDistance(gameState.points, manualPath);

        let route = [...manualPath];
        let currentDist = userDistance;

        setGameState(prev => ({
            ...prev,
            bestPath: route,
            bestDistance: currentDist,
            isRunning: true
        }));

        const improve = () => {
            const result = twoOptImprovement(gameState.points, route);
            route = result.route;
            currentDist = calculateTotalDistance(gameState.points, route);

            setGameState(prev => ({
                ...prev,
                bestPath: route
            }));

            if (result.improved) {
                animation.scheduleNext(improve);
            } else {
                setGameState(prev => ({ ...prev, isRunning: false }));

                const won = currentDist >= userDistance - 1; // -1 for floating point tolerance
                setGameResult({
                    won,
                    userDistance,
                    algoDistance: currentDist
                });
            }
        };

        animation.scheduleWithDelay(improve, 500);
    }, [manualPath, gameState.points, animation]);

    // --- Clear ---

    const clearAll = useCallback(() => {
        animation.stop();
        setGameState(prev => ({
            ...prev,
            points: algorithm === 'builder' ? [] : prev.points,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
        setManualPath([]);
        setGameResult(null);
    }, [animation, algorithm]);

    // --- Speed ---

    const setSpeed = useCallback((speed: number) => {
        animation.setSpeed(speed);
        setGameState(prev => ({ ...prev, speed }));
    }, [animation]);

    return {
        gameState,
        algorithm,
        manualPath,
        gameResult,
        setAlgorithm,
        setPoints,
        resetPaths,
        setGameState,
        actions: {
            runAlgorithm,
            stopAlgorithm,
            handlePointClick,
            submitManualPath,
            clearAll,
            setSpeed,
        }
    };
};
