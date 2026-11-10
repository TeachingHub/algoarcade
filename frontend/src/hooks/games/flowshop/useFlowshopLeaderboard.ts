import { serverTimestamp } from 'firebase/firestore';
import { saveDailyScore, getDailyLeaderboard, hasUserSubmitted } from '@/services/games/FlowshopService';
import type { FlowshopLeaderboardEntry } from '@/services/games/FlowshopService';
import { useDailyLeaderboard } from '../shared/useDailyLeaderboard';

export const useFlowshopLeaderboard = () => {
    return useDailyLeaderboard<
        FlowshopLeaderboardEntry,
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
                selectedOrder: selection,
                timestamp: serverTimestamp(),
                time_ms: timeMs ?? null
            });
        },

        getScoreMessage: (score, timeMs) => {
            const timeText = timeMs != null
                ? `Your time: ${Math.round(timeMs / 1000)}s`
                : '';

            return `Submitted! Your score: ${Math.round(score)}. ${timeText}`;
        }
    });
};