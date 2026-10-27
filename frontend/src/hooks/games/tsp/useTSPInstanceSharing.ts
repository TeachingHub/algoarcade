import { useMemo } from 'react';
import {
    useInstanceSharing,
    type InstanceSharingAdapter,
} from '@/hooks/games/shared/useInstanceSharing';
import { getGameInstance, saveGameInstance, } from '@/services/games/TSPService';
import type { Point, TSPInstance, } from '@/types/games/tsp';

interface TSPInstanceSharingOptions {
    onInstanceLoaded: (points: Point[], author: string) => void;
    onFallback: () => void;
}

export const useTSPInstanceSharing = (
    canvasSize: { width: number; height: number },
    options: TSPInstanceSharingOptions
) => {
    const {
        onInstanceLoaded,
        onFallback,
    } = options;

    const adapter = useMemo<InstanceSharingAdapter<TSPInstance, TSPInstance>>(() => ({
        load: getGameInstance,

        save: saveGameInstance,

        hasContent: (instance) => {
            return instance.points.length > 0;
        },

        isReady: canvasSize.width > 0 && canvasSize.height > 0,

        onLoaded: (instance) => {
            onInstanceLoaded(
                instance.points,
                instance.author || 'an anonymous traveler'
            );
        },

        onFallback,
    }), [canvasSize.width, canvasSize.height, onFallback, onInstanceLoaded,]);

    return useInstanceSharing<TSPInstance, TSPInstance>(adapter);
};