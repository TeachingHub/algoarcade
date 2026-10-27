import type { KnapsackInstance } from '@/types/games/knapsack';
import { getDailyChallenge } from '@/services/games/KnapsackService';
import { useDailyChallenge } from '../shared/useGameDailyChallenge';

export const useKnapsackDailyChallenge = (selectedDate: string) => {
    return useDailyChallenge<KnapsackInstance>({
        selectedDate,
        getChallenge: getDailyChallenge
    });
};