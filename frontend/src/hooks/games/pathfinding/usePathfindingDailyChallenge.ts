import type { PathfindingInstance } from '@/types/games/pathfinding';
import { getDailyChallenge } from '@/services/games/PathfindingService';
import { useDailyChallenge } from '../shared/useGameDailyChallenge';

export const usePathfindingDailyChallenge = (selectedDate: string) => {
    return useDailyChallenge<PathfindingInstance>({
        selectedDate,
        getChallenge: getDailyChallenge
    });
};