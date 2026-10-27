import { serverTimestamp } from 'firebase/firestore';
import { saveDailyScore, getDailyLeaderboard, hasUserSubmitted } from '@/services/games/TSPService';
import type { TSPLeaderboardEntry } from '@/services/games/TSPService';
import { useDailyLeaderboard } from '../shared/useDailyLeaderboard';

export const useTSPLeaderboard = () => {
    return useDailyLeaderboard<
        TSPLeaderboardEntry,
        number[]
    >({
        getLeaderboard: getDailyLeaderboard,
        hasUserSubmitted,

        saveScore: async ({
            user,
            score,
            selection,
            dateStr,
            timeMs
        }) => {
            await saveDailyScore(dateStr, {
                userId: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                score,
                path: selection,
                timestamp: serverTimestamp(),
                time_ms: timeMs ?? null
            });
        },

        getScoreMessage: (score, timeMs) => {
            const timeText = timeMs != null
                ? `Your time: ${Math.round(timeMs / 1000)}s`
                : '';

            return `Submitted! Your distance: ${Math.round(score)}. ${timeText}`;
        }
    });
};