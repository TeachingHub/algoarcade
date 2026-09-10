import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { TSPState } from "@/types/games/tsp";
import { calculateTotalDistance } from "@/utils/tsp";
import { useTSPDailyChallenge, normalizeDistance } from './tsp/useTSPDailyChallenge';
import { useTSPLeaderboard } from './tsp/useTSPLeaderboard';
import { useGameTimer } from "@/hooks/useGameTimer";

/**
 * Orchestrator hook for TSP Competitive (Daily Challenge) mode.
 *
 * Composes:
 *  - useTSPDailyChallenge → loads/creates today's challenge (or past days)
 *  - useTSPLeaderboard    → leaderboard fetch & score submission
 *
 * Owns:
 *  - Manual path building (click-to-add)
 *  - Submission flow & game result state
 *  - hasSubmitted guard (one attempt per day)
 *  - Practice mode for past challenges
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
    const { leaderboard, isSubmitting, fetchLeaderboard, checkSubmission, submitScore } = useTSPLeaderboard();
    const { start, pause, reset, elapsedMs } = useGameTimer();

    // --- Sync daily challenge instance into game state ---
    useEffect(() => {
        if (dailyChallenge.instance) {
            setGameState(prev => ({
                ...prev,
                points: dailyChallenge.instance!.points,
                bestPath: [],
                currentPath: [],
                bestDistance: Infinity,
                isRunning: false
            }));
            // Reset play state when navigating dates
            setManualPath([]);
            setGameResult(null);
            setHasSubmitted(false);
            // Fetch leaderboard for this date
            fetchLeaderboard(dailyChallenge.selectedDate);
            // Reset timer
            reset();

            // Check if user already submitted for this date
            if (user) {
                checkSubmission(user.uid, dailyChallenge.selectedDate).then(alreadySubmitted => {
                    if (alreadySubmitted) {
                        setHasSubmitted(true);
                        setGameResult('You already submitted your score for this day!');
                    }
                });
            }
        }
    }, [dailyChallenge.instance, dailyChallenge.selectedDate, fetchLeaderboard, checkSubmission, user]);

    // --- Manual path building ---

    const handlePointClick = useCallback((pointId: number) => {
        if (hasSubmitted || gameResult) return;

        if (!manualPath.includes(pointId)) {
            const newManualPath = [...manualPath, pointId];

            // Block the final point for non-logged users (can't submit)
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
        
        // Start timer
        if (manualPath.length === 0) {
            start();
        }
    }, [hasSubmitted, gameResult, manualPath, gameState.points, user, start]);

    // --- Submission ---

    const submitManualPath = useCallback(async () => {
        if (manualPath.length !== gameState.points.length || hasSubmitted) return;

        // Stop timer
        pause();

        let distance = calculateTotalDistance(gameState.points, manualPath);
        
        // Normalize distance to standard canvas size (800x500) for fair scoring
        // This ensures mobile players don't get unfair advantages due to smaller canvas
        distance = normalizeDistance(distance, canvasSize.width, canvasSize.height);

        setGameState(prev => ({
            ...prev,
            bestPath: manualPath,
            bestDistance: distance
        }));

        setHasSubmitted(true);

        // Practice mode: past challenges don't save scores
        if (!dailyChallenge.isToday) {
            setGameResult(`Practice mode! Distance: ${Math.round(distance)}. Time: ${Math.round(elapsedMs / 1000)}s. This score won't be saved.`);
            return;
        }

        if (user) {
            const resultMessage = await submitScore(user, distance, manualPath, dailyChallenge.selectedDate, elapsedMs);
            setGameResult(resultMessage);
        } else {
            setGameResult(`Finished! Distance: ${Math.round(distance)}. Time: ${Math.round(elapsedMs / 1000)}s. Login to save your score!`);
        }
    }, [manualPath, gameState.points, hasSubmitted, user, submitScore, dailyChallenge.isToday, dailyChallenge.selectedDate, canvasSize, pause, elapsedMs]);

    // --- Clear path ---

    const clearAll = useCallback(() => {
        if (hasSubmitted) return;
        pause();
        reset();
        setGameState(prev => ({
            ...prev,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
        setManualPath([]);
    }, [hasSubmitted, pause, reset]);

    // --- Derived loading state ---
    const isLoading = dailyChallenge.isLoading || isSubmitting;

    return {
        gameState,
        manualPath,
        gameResult,
        isLoading,
        hasSubmitted,
        leaderboard,
        // Date navigation
        isToday: dailyChallenge.isToday,
        notFound: dailyChallenge.notFound,
        selectedDate: dailyChallenge.selectedDate,
        dateLabel: dailyChallenge.dateLabel,
        canGoNext: dailyChallenge.canGoNext,
        actions: {
            handlePointClick,
            submitManualPath,
            clearAll,
            reloadLeaderboard: dailyChallenge.reload,
            goToPrevDay: dailyChallenge.goToPrevDay,
            goToNextDay: dailyChallenge.goToNextDay,
            goToToday: dailyChallenge.goToToday,
        }
    };
};
