import { useMemo } from 'react';
import {
    useInstanceSharing,
    type InstanceSharingAdapter,
} from '@/hooks/games/shared/useInstanceSharing';
import { getGameInstance, saveGameInstance, } from '@/services/games/PathfindingService';
import type { PathfindingInstance, Cell, } from '@/types/games/pathfinding';

interface PathfindingInstanceSharingOptions {
    onInstanceLoaded: (
        grid: Cell[][],
        author: string,
    ) => void;
    onFallback: () => void;
}

export const usePathfindingInstanceSharing = (options: PathfindingInstanceSharingOptions) => {
    const {
        onInstanceLoaded,
        onFallback,
    } = options;

    const adapter = useMemo<InstanceSharingAdapter<PathfindingInstance, PathfindingInstance>>(() => ({
        load: getGameInstance,

        save: saveGameInstance,

        hasContent: (instance) => {
            return instance.grid.length > 0;
        },

        isReady: true,

        onLoaded: (instance) => {
            onInstanceLoaded(
                instance.grid,
                instance.author || 'an anonymous adventurer'
            );
        },

        onFallback,
    }), [onFallback, onInstanceLoaded,]);

    return useInstanceSharing<PathfindingInstance, PathfindingInstance>(adapter);
};