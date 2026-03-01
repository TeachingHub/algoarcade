import { useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { saveDailyScore, getDailyLeaderboard } from '@/services/games/TSPService';
import type { TSPLeaderboardEntry } from '@/services/games/TSPService';
import { getTodayDateString } from './useTSPDailyChallenge';

/**
 * Manages the daily leaderboard: fetching scores and submitting new ones.
 *
 * Separated from the game logic so that leaderboard concerns (loading,
 * refreshing, score persistence) don't clutter the gameplay hook.
 */

export const useTSPLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState<TSPLeaderboardEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLeaderboard = useCallback(async () => {
        const dateStr = getTodayDateString();
        const board = await getDailyLeaderboard(dateStr);
        setLeaderboard(board);
    }, []);

    /**
     * Submits the user's score and refreshes the leaderboard.
     * Returns the result message to display.
     */
    const submitScore = useCallback(async (
        user: User,
        distance: number,
        path: number[]
    ): Promise<string> => {
        setIsSubmitting(true);
        try {
            const dateStr = getTodayDateString();
            await saveDailyScore(dateStr, {
                userId: user.uid,
                displayName: user.displayName || "Anonymous",
                photoURL: user.photoURL || "",
                distance,
                path,
                timestamp: new Date()
            });

            // Refresh leaderboard after submission
            const board = await getDailyLeaderboard(dateStr);
            setLeaderboard(board);

            return `Submitted! Your distance: ${Math.round(distance)}`;
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
        submitScore,
    };
};
