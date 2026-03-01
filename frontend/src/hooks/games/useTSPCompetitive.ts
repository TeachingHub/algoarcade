import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { TSPState } from "@/types/games/tsp";
import { calculateTotalDistance } from "@/utils/tsp";
import { useTSPDailyChallenge } from './tsp/useTSPDailyChallenge';
import { useTSPLeaderboard } from './tsp/useTSPLeaderboard';

/**
 * Orchestrator hook for TSP Competitive (Daily Challenge) mode.
 *
 * Composes:
 *  - useTSPDailyChallenge → loads/creates today's challenge
 *  - useTSPLeaderboard    → leaderboard fetch & score submission
 *
 * Owns:
 *  - Manual path building (click-to-add, simple enough to stay here)
 *  - Submission flow & game result state
 *  - hasSubmitted guard (one attempt per day)
 */

export const useTSPCompetitive = (canvasSize: { width: number, height: number }, user: User | null) => {
    const [gameState, setGameState] = useState<TSPState>({
        points: [],
        bestPath: [],
        currentPath: [],
        bestDistance: Infinity,
        isRunning: false
    });

    const [manualPath, setManualPath] = useState<number[]>([]);
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // --- Sub-hooks ---
    const dailyChallenge = useTSPDailyChallenge(canvasSize);
    const { leaderboard, isSubmitting, fetchLeaderboard, submitScore } = useTSPLeaderboard();

    // --- Sync daily challenge instance into game state ---
    useEffect(() => {
        if (dailyChallenge.instance && gameState.points.length === 0) {
            setGameState(prev => ({
                ...prev,
                points: dailyChallenge.instance!.points,
                bestPath: [],
                currentPath: [],
                bestDistance: Infinity,
                isRunning: false
            }));
            // Fetch leaderboard once challenge is loaded
            fetchLeaderboard();
        }
    }, [dailyChallenge.instance, gameState.points.length, fetchLeaderboard]);

    // --- Manual path building ---

    const handlePointClick = useCallback((pointId: number) => {
        if (hasSubmitted || gameResult) return;

        if (!manualPath.includes(pointId)) {
            const newManualPath = [...manualPath, pointId];

            // Block the final point for non-logged users (can't see distance / submit)
            if (!user && newManualPath.length === gameState.points.length) return;

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
    }, [hasSubmitted, gameResult, manualPath, gameState.points, user]);

    // --- Submission ---

    const submitManualPath = useCallback(async () => {
        if (manualPath.length !== gameState.points.length || hasSubmitted) return;

        const distance = calculateTotalDistance(gameState.points, manualPath);

        setGameState(prev => ({
            ...prev,
            bestPath: manualPath,
            bestDistance: distance
        }));

        setHasSubmitted(true);

        if (user) {
            const resultMessage = await submitScore(user, distance, manualPath);
            setGameResult(resultMessage);
        } else {
            setGameResult(`Finished! Distance: ${Math.round(distance)}. Login to save your score!`);
        }
    }, [manualPath, gameState.points, hasSubmitted, user, submitScore]);

    // --- Clear path ---

    const clearAll = useCallback(() => {
        if (hasSubmitted) return;
        setGameState(prev => ({
            ...prev,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
        setManualPath([]);
    }, [hasSubmitted]);

    // --- Derived loading state ---
    const isLoading = dailyChallenge.isLoading || isSubmitting;

    return {
        gameState,
        manualPath,
        gameResult,
        isLoading,
        hasSubmitted,
        leaderboard,
        actions: {
            handlePointClick,
            submitManualPath,
            clearAll,
            reloadLeaderboard: dailyChallenge.reload
        }
    };
};
