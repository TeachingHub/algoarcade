import { useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { saveDailyScore, getDailyLeaderboard, hasUserSubmitted } from '@/services/games/TSPService';
import type { TSPLeaderboardEntry } from '@/services/games/TSPService';

/**
 * Manages the daily leaderboard: fetching scores and submitting new ones.
 *
 * Accepts a dateString to support viewing past leaderboards.
 */

export const useTSPLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState<TSPLeaderboardEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLeaderboard = useCallback(async (dateStr: string) => {
        const board = await getDailyLeaderboard(dateStr);
        setLeaderboard(board);
    }, []);

    /**
     * Checks if the user already submitted a score for the given date.
     */
    const checkSubmission = useCallback(async (userId: string, dateStr: string): Promise<boolean> => {
        return hasUserSubmitted(dateStr, userId);
    }, []);

    /**
     * Submits the user's score and refreshes the leaderboard.
     * Returns the result message to display.
     */
    const submitScore = useCallback(async (
        user: User,
        distance: number,
        path: number[],
        dateStr: string,
        time_ms?: number,
    ): Promise<string> => {
        setIsSubmitting(true);
        try {
            await saveDailyScore(dateStr, {
                userId: user.uid,
                displayName: user.displayName || "Anonymous",
                photoURL: user.photoURL || "",
                distance,
                path,
                timestamp: serverTimestamp(),
                time_ms: time_ms ?? null
            });

            // Refresh leaderboard after submission
            const board = await getDailyLeaderboard(dateStr);
            setLeaderboard(board);

            const timeText = time_ms ? `Your time: ${Math.round(time_ms/1000)}s` : '';
            return `Submitted! Your distance: ${Math.round(distance)}. ${timeText}`;
        } catch (e) {
            console.error("Error submitting score:", e);
            return "Error submitting score";
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return {
        leaderboard,
        isSubmitting,
        fetchLeaderboard,
        checkSubmission,
        submitScore,
    };
};
