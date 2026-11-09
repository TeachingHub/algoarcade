import { useMemo } from 'react';
import {
    useInstanceSharing,
    type InstanceSharingAdapter,
} from '@/hooks/games/shared/useInstanceSharing';
import { getGameInstance, saveGameInstance, } from '@/services/games/FlowshopService';
import type { FlowshopInstance, Job, } from '@/types/games/flowshop';

interface FlowshopInstanceSharingOptions {
    onInstanceLoaded: (
        jobs: Job[],
        author: string,
    ) => void;
    onFallback: () => void;
}

export const useFlowshopInstanceSharing = (options: FlowshopInstanceSharingOptions) => {
    const {
        onInstanceLoaded,
        onFallback,
    } = options;

    const adapter = useMemo<InstanceSharingAdapter<FlowshopInstance, FlowshopInstance>>(() => ({
        load: getGameInstance,

        save: saveGameInstance,

        hasContent: (instance) => {
            return instance.jobs.length > 0;
        },

        isReady: true,

        onLoaded: (instance) => {
            onInstanceLoaded(
                instance.jobs,
                instance.author || 'an anonymous adventurer'
            );
        },

        onFallback,
    }), [onFallback, onInstanceLoaded,]);

    return useInstanceSharing<FlowshopInstance, FlowshopInstance>(adapter);
};