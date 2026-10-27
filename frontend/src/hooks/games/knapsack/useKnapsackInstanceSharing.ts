import { useMemo } from 'react';
import {
    useInstanceSharing,
    type InstanceSharingAdapter,
} from '@/hooks/games/shared/useInstanceSharing';
import { getGameInstance, saveGameInstance, } from '@/services/games/KnapsackService';
import type { KnapsackInstance, KnapsackItem, } from '@/types/games/knapsack';

interface KnapsackInstanceSharingOptions {
    onInstanceLoaded: (
        items: KnapsackItem[],
        maxWeight: number,
        author: string,
        knapsackType: 'fractional' | 'binary',
    ) => void;
    onFallback: () => void;
}

export const useKnapsackInstanceSharing = (options: KnapsackInstanceSharingOptions) => {
    const {
        onInstanceLoaded,
        onFallback,
    } = options;

    const adapter = useMemo<InstanceSharingAdapter<KnapsackInstance, KnapsackInstance>>(() => ({
        load: getGameInstance,

        save: saveGameInstance,

        hasContent: (instance) => {
            return instance.items.length > 0;
        },

        isReady: true,

        onLoaded: (instance) => {
            onInstanceLoaded(
                instance.items,
                instance.maxWeight,
                instance.author || 'an anonymous adventurer',
                instance.knapsackType
            );
        },

        onFallback,
    }), [onFallback, onInstanceLoaded,]);

    return useInstanceSharing<KnapsackInstance, KnapsackInstance>(adapter);
};