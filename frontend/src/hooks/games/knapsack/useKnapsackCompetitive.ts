import { useCallback, useState } from 'react';
import type { User } from 'firebase/auth';
import type { KnapsackState } from '@/types/games/knapsack';
import { calculateSolutionValue } from '@/utils/knapsack';
import { useKnapsackDailyChallenge } from './useKnapsackDailyChallenge';
import { useKnapsackLeaderboard } from './useKnapsackLeaderboard';
import { useDailyChallengeDate } from '../shared/useDailyChallengeDate';
import { useGameCompetitive } from '../shared/useGameCompetitive';

/**
 * Orchestrator hook for Knapsack Competitive (Daily Challenge) mode.
 *
 * Composes:
 *  - useKnapsackDailyChallenge  → loads/creates today's challenge (or past days)
 *  - useKnapsackLeaderboard     → leaderboard fetch & score submission
 *  - useDailyChallengeDate → change date to navigate between past days
 *
 * Owns:
 *  - Manual selection building (click-to-add)
 *  - Submission flow & game result state
 *  - hasSubmitted guard (one attempt per day)
 *  - Practice mode for past challenges
 */

export const useKnapsackCompetitive = (user: User | null) => {
    const [gameState, setGameState] = useState<KnapsackState>({
        items: [],
        maxWeight: 0,
        freeWeight: 0,
        bestSolution: [],
        currentSelection: [],
        bestValue: 0,
        isRunning: false
    });

    const [manualSelection, setManualSelection] = useState<number[]>([]);
    const [knapsackType, setKnapsackType] = useState<'fractional' | 'binary'>('fractional');

    const dailyDate = useDailyChallengeDate();

    const dailyChallenge = useKnapsackDailyChallenge(dailyDate.selectedDate);

    const {
        leaderboard,
        isSubmitting,
        fetchLeaderboard,
        checkSubmission,
        submitScore
    } = useKnapsackLeaderboard();

    const resetGame = useCallback(() => {
        if (!dailyChallenge.instance) return;

        const challenge = dailyChallenge.instance;

        setKnapsackType(challenge.knapsackType);

        setGameState({
            items: challenge.items,
            maxWeight: challenge.maxWeight,
            freeWeight: challenge.maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: 0,
            isRunning: false
        });

        setManualSelection([]);
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

        formatPracticeResult: (score, elapsedMs) =>
            `Practice mode! Score: ${Math.round(score)}. Time: ${Math.round(elapsedMs / 1000)}s. This score won't be saved.`,

        formatAnonymousResult: (score, elapsedMs) =>
            `Finished! Score: ${Math.round(score)}. Time: ${Math.round(elapsedMs / 1000)}s. Login to save your score!`
    });

    const handleItemClick = useCallback((itemId: number) => {
        if (game.hasSubmitted || game.gameResult) return;

        const item = gameState.items[itemId];

        if (!item) return;

        const isSelected = manualSelection.includes(itemId);

        if (isSelected) {
            const newSelection = manualSelection.filter(id => id !== itemId);

            const solutionValue = calculateSolutionValue(gameState.items,newSelection,gameState.maxWeight);

            setManualSelection(newSelection);

            setGameState(prev => ({
                ...prev,
                currentSelection: newSelection,
                freeWeight: prev.freeWeight + item.weight,
                bestValue: solutionValue
            }));

            return;
        }

        const canAddItem = gameState.freeWeight > 0 && (knapsackType === 'fractional' || gameState.freeWeight >= item.weight);

        if (!canAddItem) return;

        const newSelection = [...manualSelection, itemId];

        const solutionValue = calculateSolutionValue(gameState.items, newSelection, gameState.maxWeight);

        setManualSelection(newSelection);

        setGameState(prev => ({
            ...prev,
            currentSelection: newSelection,
            freeWeight: prev.freeWeight - item.weight,
            bestValue: solutionValue
        }));

        game.startTimerIfNeeded();
    }, [game.hasSubmitted, game.gameResult, manualSelection, gameState.items, gameState.maxWeight, gameState.freeWeight, knapsackType, game.startTimerIfNeeded]);

    const submitManualSelection = useCallback(async () => {
        if (manualSelection.length === 0 || game.hasSubmitted) {return;}

        const score = calculateSolutionValue(gameState.items, manualSelection, gameState.maxWeight);

        setGameState(prev => ({
            ...prev,
            bestSolution: manualSelection,
            bestValue: score
        }));

        await game.submitGameScore({
            score,
            selection: manualSelection
        });
    }, [manualSelection, game.hasSubmitted, gameState.items, gameState.maxWeight, game.submitGameScore]);

    const clearAll = useCallback(() => {
        if (game.hasSubmitted) return;

        setGameState(prev => ({
            ...prev,
            bestSolution: [],
            currentSelection: [],
            freeWeight: prev.maxWeight,
            bestValue: 0
        }));

        setManualSelection([]);
    }, [game.hasSubmitted]);

    const isLoading = dailyChallenge.isLoading || isSubmitting;

    return {
        gameState,
        manualSelection,
        gameResult: game.gameResult,
        isLoading,
        hasSubmitted: game.hasSubmitted,
        leaderboard,

        isToday: dailyDate.isToday,
        notFound: dailyChallenge.notFound,
        selectedDate: dailyDate.selectedDate,
        dateLabel: dailyDate.dateLabel,
        canGoNext: dailyDate.canGoNext,
        knapsackType,

        actions: {
            handleItemClick,
            submitManualSelection,
            clearAll,
            reloadLeaderboard: dailyChallenge.reload,
            goToPrevDay: dailyDate.goToPrevDay,
            goToNextDay: dailyDate.goToNextDay,
            goToToday: dailyDate.goToToday
        }
    };
};