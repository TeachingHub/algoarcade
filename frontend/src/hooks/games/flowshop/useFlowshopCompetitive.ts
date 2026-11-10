import { useCallback, useState } from 'react';
import type { DragEvent } from 'react';
import type { User } from 'firebase/auth';
import type { FlowshopState } from '@/types/games/flowshop';
import { calculateSolutionMakespan } from '@/utils/flowshop';
import { useFlowshopDailyChallenge } from './useFlowshopDailyChallenge';
import { useFlowshopLeaderboard } from './useFlowshopLeaderboard';
import { useDailyChallengeDate } from '../shared/useDailyChallengeDate';
import { useGameCompetitive } from '../shared/useGameCompetitive';

/**
 * Orchestrator hook for Flowshop Competitive (Daily Challenge) mode.
 *
 * Composes:
 *  - useFlowshopDailyChallenge  → loads/creates today's challenge (or past days)
 *  - useFlowshopLeaderboard     → leaderboard fetch & score submission
 *  - useDailyChallengeDate → change date to navigate between past days
 *
 * Owns:
 *  - Manual order building (move jobs)
 *  - Submission flow & game result state
 *  - hasSubmitted guard (one attempt per day)
 *  - Practice mode for past challenges
 */

export const useFlowshopCompetitive = (user: User | null) => {
    const [gameState, setGameState] = useState<FlowshopState>({
        jobs: [],
        bestSolution: [],
        currentOrder: [],
        bestMakespan: 0,
        isRunning: false
    });

    const [manualOrder, setManualOrder] = useState<number[]>([]);
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);

    const dailyDate = useDailyChallengeDate();

    const dailyChallenge = useFlowshopDailyChallenge(dailyDate.selectedDate);

    const {
        leaderboard,
        isSubmitting,
        fetchLeaderboard,
        checkSubmission,
        submitScore
    } = useFlowshopLeaderboard();

    const resetGame = useCallback(() => {
        if (!dailyChallenge.instance) return;

        const challenge = dailyChallenge.instance;

        const initialOrder = challenge.jobs.map(job => job.id);

        setGameState({
            jobs: challenge.jobs,
            bestSolution: [],
            currentOrder: initialOrder,
            bestMakespan: Infinity,
            isRunning: false
        });

        setManualOrder(initialOrder);
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

    const handleJobDragStart = useCallback((jobId: number) => {
            if (game.gameResult) return;
    
            setDraggedJobId(jobId);

            game.startTimerIfNeeded();
        }, [game.gameResult, game.startTimerIfNeeded]);
    
        const handleJobDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
        }, []);
    
        const handleJobDrop = useCallback((targetJobId: number) => {
            if (draggedJobId === null || draggedJobId === targetJobId || game.gameResult) {
                return;
            }
    
            const draggedIndex = manualOrder.indexOf(draggedJobId);
            const targetIndex = manualOrder.indexOf(targetJobId);
    
            if (draggedIndex === -1 || targetIndex === -1) {
                setDraggedJobId(null);
                return;
            };
    
            const newOrder = [...manualOrder];
    
            newOrder.splice(draggedIndex, 1);
            newOrder.splice(targetIndex, 0, draggedJobId);
    
            setManualOrder(newOrder);
    
            setGameState(prev => ({
                ...prev,
                currentOrder: newOrder
            }));
    
            setDraggedJobId(null);
        }, [draggedJobId, manualOrder, game.gameResult]);
    
        const handleJobDragEnd = useCallback(() => {
            setDraggedJobId(null);
        }, []);

    const submitManualOrder = useCallback(async () => {
        if (manualOrder.length === gameState.jobs.length || game.hasSubmitted) {return;}

        const score = calculateSolutionMakespan(gameState.jobs, manualOrder);

        setGameState(prev => ({
            ...prev,
            bestSolution: manualOrder,
            bestMakespan: score
        }));

        await game.submitGameScore({
            score,
            selection: manualOrder
        });
    }, [manualOrder, game.hasSubmitted, gameState.jobs, game.submitGameScore]);

    const clearAll = useCallback(() => {
        if (game.hasSubmitted) return;

        const initialOrder = gameState.jobs.map(job => job.id);

        setGameState(prev => ({
            ...prev,
            bestSolution: [],
            currentSelection: initialOrder,
            bestMakespan: Infinity
        }));

        setManualOrder(initialOrder);
    }, [game.hasSubmitted]);

    const isLoading = dailyChallenge.isLoading || isSubmitting;

    return {
        gameState,
        manualOrder,
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
            handleJobDragStart,
            handleJobDragOver,
            handleJobDrop,
            handleJobDragEnd,
            submitManualOrder,
            clearAll,
            reloadLeaderboard: dailyChallenge.reload,
            goToPrevDay: dailyDate.goToPrevDay,
            goToNextDay: dailyDate.goToNextDay,
            goToToday: dailyDate.goToToday
        }
    };
};