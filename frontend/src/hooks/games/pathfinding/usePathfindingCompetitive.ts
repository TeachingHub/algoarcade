import { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import type { PathfindingState } from '@/types/games/pathfinding';
import { createEmptyGrid, tryExtendManualPath, findEnd } from '@/utils/pathfinding';
import { usePathfindingDailyChallenge } from './usePathfindingDailyChallenge';
import { usePathfindingLeaderboard } from './usePathfindingLeaderboard';
import { useDailyChallengeDate } from '../shared/useDailyChallengeDate';
import { useGameCompetitive } from '../shared/useGameCompetitive';

/**
 * Orchestrator hook for Pathfinding Competitive (Daily Challenge) mode.
 *
 * Composes:
 *  - usePathfindingDailyChallenge  → loads/creates today's challenge (or past days)
 *  - usePathfindingLeaderboard     → leaderboard fetch & score submission
 *  - useDailyChallengeDate → change date to navigate between past days
 *
 * Owns:
 *  - Manual path building
 *  - Submission flow & game result state
 *  - hasSubmitted guard (one attempt per day)
 *  - Practice mode for past challenges
 */

export const usePathfindingCompetitive = (user: User | null) => {
    const [gameState, setGameState] = useState<PathfindingState>({
        grid: createEmptyGrid(),
        isRunning: false,
        isSolved: false,
        visitedCount: 0,
        pathLength: 0,
        speed: 0
    });

    const [manualPath, setManualPath] = useState<{ row: number; col: number }[]>([]);
    const [canSubmit, setCanSubmit] = useState(false);

    const dailyDate = useDailyChallengeDate();

    const dailyChallenge = usePathfindingDailyChallenge(dailyDate.selectedDate);

    const {
        leaderboard,
        isSubmitting,
        fetchLeaderboard,
        checkSubmission,
        submitScore
    } = usePathfindingLeaderboard();

    const resetGame = useCallback(() => {
        if (!dailyChallenge.instance) return;

        const challenge = dailyChallenge.instance;

        setGameState({
            grid: challenge.grid,
            isRunning: false,
            isSolved: false,
            visitedCount: 0,
            pathLength: 0,
            speed: 0
        });

        setManualPath([]);
    }, [dailyChallenge.instance]);

    const game = useGameCompetitive<{row: number, col: number}[], number>({
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

        formatPracticeResult: (score, elapsedMs) =>
            `Practice mode! Score: ${Math.round(score)}. Time: ${Math.round(elapsedMs / 1000)}s. This score won't be saved.`,

        formatAnonymousResult: (score, elapsedMs) =>
            `Finished! Score: ${Math.round(score)}. Time: ${Math.round(elapsedMs / 1000)}s. Login to save your score!`
    });

    const handleCellInteraction = useCallback((row: number, col: number) => {
            if (gameState.isSolved) return;
            setManualPath(prev => tryExtendManualPath(prev, row, col, gameState.grid));
        }, [gameState.grid, gameState.isSolved]);

    const handleCellDrag = useCallback((row: number, col: number) => {
            if (gameState.isSolved) return;
            setManualPath(prev => tryExtendManualPath(prev, row, col, gameState.grid));
    }, [gameState.grid, gameState.isSolved]);

    useEffect(() => {
        if (gameState.isSolved || manualPath.length === 0) return;

        const end = findEnd(gameState.grid);
        const last = manualPath[manualPath.length - 1];

        if (!end || !last) return;

        const reachedEnd = last.row === end.row && last.col === end.col;

        setCanSubmit(reachedEnd);
    }, [manualPath, gameState.grid, gameState.isSolved]);

    const submitManualPath = useCallback(async () => {
        if (canSubmit || game.hasSubmitted) {return;}

        const score = manualPath.length;

        setGameState(prev => ({
            ...prev,
            isSolved: true,
            pathLength: score
        }));

        await game.submitGameScore({
            score,
            selection: manualPath
        });
    }, [manualPath, game.hasSubmitted, gameState.grid, game.submitGameScore]);

    const clearAll = useCallback(() => {
        if (game.hasSubmitted) return;

        setGameState(prev => ({
            ...prev,
            isRunning: false,
            isSolved: false,
            visitedCount: 0,
            pathLength: 0,
            speed: 0
        }));

        setManualPath([]);
        setCanSubmit(false);
    }, [game.hasSubmitted]);

    const isLoading = dailyChallenge.isLoading || isSubmitting;

    return {
        gameState,
        manualPath,
        canSubmit,
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
            handleCellInteraction,
            handleCellDrag,
            submitManualPath,
            clearAll,
            reloadLeaderboard: dailyChallenge.reload,
            goToPrevDay: dailyDate.goToPrevDay,
            goToNextDay: dailyDate.goToNextDay,
            goToToday: dailyDate.goToToday
        }
    };
};