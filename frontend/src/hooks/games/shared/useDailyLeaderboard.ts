import { useCallback, useState } from 'react';
import type { User } from 'firebase/auth';

type SubmitScoreArgs<TSelection> = {
    user: User;
    score: number;
    selection: TSelection;
    dateStr: string;
    timeMs?: number;
};

type UseDailyLeaderboardOptions<TEntry, TSelection> = {
    getLeaderboard: (
        dateStr: string
    ) => Promise<TEntry[]>;

    hasUserSubmitted: (
        dateStr: string,
        userId: string
    ) => Promise<boolean>;

    saveScore: (
        args: SubmitScoreArgs<TSelection>
    ) => Promise<void>;

    getScoreMessage: (
        score: number,
        timeMs?: number
    ) => string;
};

export const useDailyLeaderboard = <
    TEntry,
    TSelection
>({
    getLeaderboard,
    hasUserSubmitted,
    saveScore,
    getScoreMessage
}: UseDailyLeaderboardOptions<TEntry, TSelection>) => {
    const [leaderboard, setLeaderboard] = useState<TEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLeaderboard = useCallback(async (dateStr: string) => {
        try {
            const board = await getLeaderboard(dateStr);
            setLeaderboard(board);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLeaderboard([]);
        }
    }, [getLeaderboard]);

    const checkSubmission = useCallback(async (userId: string, dateStr: string): Promise<boolean> => {
        try {
            return await hasUserSubmitted(dateStr, userId);
        } catch (error) {
            console.error('Error checking previous submission:', error);
            return false;
        }
    }, [hasUserSubmitted]);

    const submitScore = useCallback(async (
        user: User,
        score: number,
        selection: TSelection,
        dateStr: string,
        timeMs?: number
    ): Promise<string> => {
        setIsSubmitting(true);

        try {
            await saveScore({
                user,
                score,
                selection,
                dateStr,
                timeMs
            });

            const board = await getLeaderboard(dateStr);
            setLeaderboard(board);

            return getScoreMessage(score, timeMs);
        } catch (error) {
            console.error('Error submitting score:', error);
            return 'Error submitting score';
        } finally {
            setIsSubmitting(false);
        }
    }, [getLeaderboard, saveScore, getScoreMessage]);

    return {
        leaderboard,
        isSubmitting,
        fetchLeaderboard,
        checkSubmission,
        submitScore
    };
};