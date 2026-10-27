import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { KnapsackState } from "@/types/games/knapsack";
import { calculateSolutionValue } from "@/utils/knapsack"
import { useKnapsackDailyChallenge } from './useKnapsackDailyChallenge';
import { useKnapsackLeaderboard } from './/useKnapsackLeaderboard';
import { useGameTimer } from "@/hooks/useGameTimer";
import { useDailyChallengeDate } from '../shared/useDailyChallengeDate';

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
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hasTimerStarted, setHasTimerStarted] = useState(false);
    const [knapsackType, setKnapsackType] = useState<'fractional' | 'binary'>('fractional');

    // --- Sub-hooks ---
    const dailyDate = useDailyChallengeDate();
    const dailyChallenge = useKnapsackDailyChallenge(dailyDate.selectedDate);
    const { leaderboard, isSubmitting, fetchLeaderboard, checkSubmission, submitScore } = useKnapsackLeaderboard();
    const { start, pause, reset, elapsedMs } = useGameTimer();

    // --- Sync daily challenge instance into game state ---
    useEffect(() => {
        if (!dailyChallenge.instance || dailyChallenge.loadedDate !== dailyDate.selectedDate) {return};

        setKnapsackType(dailyChallenge.instance.knapsackType);

        setGameState(prev => ({
            ...prev,
            items: dailyChallenge.instance!.items,
            maxWeight: dailyChallenge.instance!.maxWeight,
            freeWeight: dailyChallenge.instance!.maxWeight,
            bestSolution: [],
            currentSelection: [],
            bestValue: 0,
            isRunning: false
        }));
        // Reset play state when navigating dates
        setManualSelection([]);
        setGameResult(null);
        setHasSubmitted(false);
        // Fetch leaderboard for this date
        fetchLeaderboard(dailyDate.selectedDate);
        // Reset timer
        reset();
        // Check if user already submitted for this date
        if (user) {
            checkSubmission(user.uid, dailyDate.selectedDate).then(alreadySubmitted => {
                if (alreadySubmitted) {
                    setHasSubmitted(true);
                    setGameResult('You already submitted your score for this day!');
                }
            });
        }
        
    }, [dailyChallenge.instance, dailyDate.selectedDate, fetchLeaderboard, checkSubmission, user]);

    // --- Manual items selection ---

    const handleItemClick = useCallback((itemId: number) => {
        if (hasSubmitted || gameResult) return;

        if (!manualSelection.includes(itemId)) {
            if (gameState.freeWeight > 0 && (knapsackType === 'fractional' || gameState.freeWeight >= gameState.items[itemId].weight)) {
                const newManualSelection = [...manualSelection, itemId];
                setManualSelection(newManualSelection);
                const solutionValue = calculateSolutionValue(gameState.items, newManualSelection, gameState.maxWeight);
                
                setGameState(prev => ({
                    ...prev,
                    currentSelection: newManualSelection,
                    freeWeight: gameState.freeWeight - gameState.items[itemId].weight,
                    bestValue: solutionValue
                }));
            }
        } else {
            const newManualSelection = manualSelection.filter(id => id !== itemId);
            setManualSelection(newManualSelection);
            const solutionValue = calculateSolutionValue(gameState.items, newManualSelection, gameState.maxWeight);
                
            setGameState(prev => ({
                    ...prev,
                    currentSelection: newManualSelection,
                    freeWeight: gameState.freeWeight + gameState.items[itemId].weight,
                    bestValue: solutionValue
                }));
        }
        
        // Start timer
        if (!hasTimerStarted) {
            setHasTimerStarted(true);
            start();
        }
    }, [hasSubmitted, hasTimerStarted, gameResult, manualSelection, gameState.items,, gameState.maxWeight, user, start]);

    // --- Submission ---

    const submitManualSelection = useCallback(async () => {
        if (manualSelection.length === 0 || hasSubmitted) return;

        // Stop timer
        pause();

        let score = calculateSolutionValue(gameState.items, manualSelection, gameState.maxWeight);
        
        setGameState(prev => ({
            ...prev,
            bestSolution: manualSelection,
            bestValue: score
        }));

        setHasSubmitted(true);

        // Practice mode: past challenges don't save scores
        if (!dailyDate.isToday) {
            setGameResult(`Practice mode! Score: ${Math.round(score)}. Time: ${Math.round(elapsedMs / 1000)}s. This score won't be saved.`);
            return;
        }

        if (user) {
            const resultMessage = await submitScore(user, score, manualSelection, dailyDate.selectedDate, elapsedMs);
            setGameResult(resultMessage);
        } else {
            setGameResult(`Finished! Score: ${Math.round(score)}. Time: ${Math.round(elapsedMs / 1000)}s. Login to save your score!`);
        }
    }, [manualSelection, gameState.items, gameState.maxWeight, hasSubmitted, user, submitScore, dailyDate.isToday, dailyDate.selectedDate, pause, elapsedMs]);

    // --- Clear path ---

    const clearAll = useCallback(() => {
        if (hasSubmitted) return;
        setGameState(prev => ({
            ...prev,
            bestSolution: [],
            currentSelection: [],
            freeWeight: gameState.maxWeight,
            bestValue: -1
        }));
        setManualSelection([]);
    }, [hasSubmitted]);

    // --- Derived loading state ---
    const isLoading = dailyChallenge.isLoading || isSubmitting;

    return {
        gameState,
        manualSelection,
        gameResult,
        isLoading,
        hasSubmitted,
        leaderboard,
        // Date navigation
        isToday: dailyDate.isToday,
        notFound: dailyChallenge.notFound,
        selectedDate: dailyDate.selectedDate,
        dateLabel: dailyDate.dateLabel,
        canGoNext: dailyDate.canGoNext,
        actions: {
            handleItemClick,
            submitManualSelection,
            clearAll,
            reloadLeaderboard: dailyChallenge.reload,
            goToPrevDay: dailyDate.goToPrevDay,
            goToNextDay: dailyDate.goToNextDay,
            goToToday: dailyDate.goToToday,
        }
    };
};
