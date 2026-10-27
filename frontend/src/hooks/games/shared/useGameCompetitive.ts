import { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useGameTimer } from '@/hooks/useGameTimer';

type UseGameCompetitiveOptions<TSelection, TScore> = {
    user: User | null;
    selectedDate: string;
    isToday: boolean;
    challengeReady: boolean;

    resetGame: () => void;

    fetchLeaderboard: (date: string) => Promise<void>;
    checkSubmission: (
        userId: string,
        date: string
    ) => Promise<boolean>;

    submitScore: (
        user: User,
        score: TScore,
        selection: TSelection,
        date: string,
        elapsedMs: number
    ) => Promise<string>;

    formatPracticeResult: (
        score: TScore,
        elapsedMs: number
    ) => string;

    formatAnonymousResult: (
        score: TScore,
        elapsedMs: number
    ) => string;
};

type SubmitGameScoreParams<TSelection, TScore> = {
    score: TScore;
    selection: TSelection;
};

export const useGameCompetitive = <TSelection, TScore>({
    user,
    selectedDate,
    isToday,
    challengeReady,
    resetGame,
    fetchLeaderboard,
    checkSubmission,
    submitScore,
    formatPracticeResult,
    formatAnonymousResult
}: UseGameCompetitiveOptions<TSelection, TScore>) => {
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hasTimerStarted, setHasTimerStarted] = useState(false);

    const { start, pause, reset, elapsedMs } = useGameTimer();

    useEffect(() => {
        if (!challengeReady) return;

        let cancelled = false;

        resetGame();
        setGameResult(null);
        setHasSubmitted(false);
        setHasTimerStarted(false);

        reset();
        void fetchLeaderboard(selectedDate);

        if (user) {
            void checkSubmission(user.uid, selectedDate)
                .then(alreadySubmitted => {
                    if (
                        cancelled ||
                        !alreadySubmitted
                    ) {
                        return;
                    }

                    setHasSubmitted(true);
                    setGameResult(
                        'You already submitted your score for this day!'
                    );
                });
        }

        return () => {
            cancelled = true;
        };
    }, [challengeReady, selectedDate, user, resetGame, reset, fetchLeaderboard, checkSubmission]);

    const startTimerIfNeeded = useCallback(() => {
        if (hasTimerStarted) return;

        setHasTimerStarted(true);
        start();
    }, [hasTimerStarted, start]);

    const submitGameScore = useCallback(async ({
        score,
        selection
    }: SubmitGameScoreParams<TSelection, TScore>) => {
        if (hasSubmitted) return;

        pause();
        setHasSubmitted(true);

        if (!isToday) {
            setGameResult(formatPracticeResult(score, elapsedMs));
            return;
        }

        if (!user) {
            setGameResult(formatAnonymousResult(score, elapsedMs));
            return;
        }

        const resultMessage = await submitScore(
            user,
            score,
            selection,
            selectedDate,
            elapsedMs
        );

        setGameResult(resultMessage);
    }, [hasSubmitted, pause, isToday, user, selectedDate, elapsedMs, submitScore, formatPracticeResult, formatAnonymousResult]);

    return {
        gameResult,
        hasSubmitted,
        hasTimerStarted,
        elapsedMs,
        startTimerIfNeeded,
        submitGameScore
    };
};