import { useMemo } from 'react';
import {
    useInstanceSharing,
    type InstanceSharingAdapter,
} from '@/hooks/shared/useInstanceSharing';
import {
    getGameInstance,
    saveGameInstance,
} from '@/services/games/KnapsackService';
import type {
    KnapsackInstance,
    KnapsackItem,
} from '@/types/games/knapsack';

interface KnapsackInstanceSharingOptions {
    onInstanceLoaded: (
        items: KnapsackItem[],
        maxWeight: number,
        author: string
    ) => void;
    onFallback: () => void;
}

export const useKnapsackInstanceSharing = (
    options: KnapsackInstanceSharingOptions
) => {
    const {
        onInstanceLoaded,
        onFallback,
    } = options;

    const adapter = useMemo<
        InstanceSharingAdapter<KnapsackInstance, KnapsackInstance>
    >(() => ({
        load: getGameInstance,

        save: saveGameInstance,

        hasContent: (instance) => {
            return instance.items.length > 0;
        },

        /*
         * Knapsack no depende de un canvas que tenga que medirse
         * antes de crear la instancia.
         */
        isReady: true,

        onLoaded: (instance) => {
            onInstanceLoaded(
                instance.items,
                instance.maxWeight,
                instance.author || 'an anonymous adventurer'
            );
        },

        onFallback,
    }), [
        onFallback,
        onInstanceLoaded,
    ]);

    return useInstanceSharing<KnapsackInstance, KnapsackInstance>(adapter);
};