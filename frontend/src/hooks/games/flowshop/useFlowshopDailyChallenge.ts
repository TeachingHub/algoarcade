import type { FlowshopInstance } from '@/types/games/flowshop';
import { getDailyChallenge } from '@/services/games/FlowshopService';
import { useDailyChallenge } from '../shared/useGameDailyChallenge';

export const useFlowshopDailyChallenge = (selectedDate: string) => {
    return useDailyChallenge<FlowshopInstance>({
        selectedDate,
        getChallenge: getDailyChallenge
    });
};