import { useCallback, useState } from 'react';
import type { User } from 'firebase/auth';
import type { TSPState } from '@/types/games/tsp';
import { calculateTotalDistance, normalizeDistance } from '@/utils/tsp';
import { useTSPDailyChallenge } from './tsp/useTSPDailyChallenge';
import { useTSPLeaderboard } from './tsp/useTSPLeaderboard';
import { useDailyChallengeDate } from './shared/useDailyChallengeDate';
import { useGameCompetitive } from './shared/useGameCompetitive';

/**
 * Orchestrator hook for TSP Competitive (Daily Challenge) mode.
 *
 * Composes:
 *  - useTSPDailyChallenge  → loads/creates today's challenge (or past days)
 *  - useTSPLeaderboard     → leaderboard fetch & score submission
 *  - useDailyChallengeDate → change date to navigate between past days
 *
 * Owns:
 *  - Manual path building (click-to-add)
 *  - Submission flow & game result state
 *  - hasSubmitted guard (one attempt per day)
 *  - Practice mode for past challenges
 */

export const useTSPCompetitive = (canvasSize: { width: number; height: number; }, user: User | null) => {
    const [gameState, setGameState] = useState<TSPState>({
        points: [],
        bestPath: [],
        currentPath: [],
        bestDistance: Infinity,
        isRunning: false
    });

    const [manualPath, setManualPath] = useState<number[]>([]);

    const dailyDate = useDailyChallengeDate();

    const dailyChallenge = useTSPDailyChallenge(canvasSize, dailyDate.selectedDate);

    const {
        leaderboard,
        isSubmitting,
        fetchLeaderboard,
        checkSubmission,
        submitScore
    } = useTSPLeaderboard();

    const resetGame = useCallback(() => {
        if (!dailyChallenge.instance) return;

        setGameState({
            points: dailyChallenge.instance.points,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity,
            isRunning: false
        });

        setManualPath([]);
    }, [dailyChallenge.instance]);

    const game = useGameCompetitive<number[], number>({
        user,
        selectedDate: dailyDate.selectedDate,
        isToday: dailyDate.isToday,
        challengeReady:
            dailyChallenge.instance !== null &&
            dailyChallenge.loadedDate === dailyDate.selectedDate,

        resetGame,
        fetchLeaderboard,
        checkSubmission,
        submitScore,

        formatPracticeResult: (distance, elapsedMs) =>
            `Practice mode! Distance: ${Math.round(distance)}. Time: ${Math.round(elapsedMs / 1000)}s. This score won't be saved.`,

        formatAnonymousResult: (distance, elapsedMs) =>
            `Finished! Distance: ${Math.round(distance)}. Time: ${Math.round(elapsedMs / 1000)}s. Login to save your score!`
    });

    const handlePointClick = useCallback((pointId: number) => {
        if (game.hasSubmitted || game.gameResult) return;

        if (!gameState.points[pointId]) return;
        if (manualPath.includes(pointId)) return;

        const newPath = [...manualPath, pointId];

        setManualPath(newPath);

        if (newPath.length === gameState.points.length) {
            const distance = calculateTotalDistance(gameState.points, newPath);

            setGameState(prev => ({
                ...prev,
                currentPath: newPath,
                bestDistance: distance
            }));
        }

        game.startTimerIfNeeded();
    }, [game.hasSubmitted, game.gameResult, gameState.points, manualPath, user, game.startTimerIfNeeded]);

    const submitManualPath = useCallback(async () => {
        if (manualPath.length !== gameState.points.length || game.hasSubmitted) return;

        let distance = calculateTotalDistance(gameState.points, manualPath);

        distance = normalizeDistance(distance, canvasSize.width, canvasSize.height);

        setGameState(prev => ({
            ...prev,
            bestPath: manualPath,
            bestDistance: distance
        }));

        await game.submitGameScore({
            score: distance,
            selection: manualPath
        });
    }, [manualPath, gameState.points, game.hasSubmitted, canvasSize.width, canvasSize.height, game.submitGameScore]);

    const clearAll = useCallback(() => {
        if (game.hasSubmitted) return;

        setGameState(prev => ({
            ...prev,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));

        setManualPath([]);
    }, [game.hasSubmitted]);

    const isLoading = dailyChallenge.isLoading || isSubmitting;

    return {
        gameState,
        manualPath,
        gameResult: game.gameResult,
        isLoading,
        hasSubmitted: game.hasSubmitted,
        leaderboard,

        isToday: dailyDate.isToday,
        notFound: dailyChallenge.notFound,
        selectedDate: dailyDate.selectedDate,
        dateLabel: dailyDate.dateLabel,
        canGoNext: dailyDate.canGoNext,

        actions: {
            handlePointClick,
            submitManualPath,
            clearAll,
            reloadLeaderboard: dailyChallenge.reload,
            goToPrevDay: dailyDate.goToPrevDay,
            goToNextDay: dailyDate.goToNextDay,
            goToToday: dailyDate.goToToday
        }
    };
};