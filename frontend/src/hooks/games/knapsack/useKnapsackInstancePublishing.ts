import { useMemo } from "react";
import {
    useInstancePublishing,
    type InstancePublishingAdapter,
} from "@/hooks/games/shared/useInstancePublishing";
import {
    getDecodedPublishedInstance,
    publishInstance,
} from "@/services/games/KnapsackService";
import type { KnapsackInstance } from "@/types/games/knapsack";

interface KnapsackInstancePublishingOptions {
    onInstanceLoaded: (instance: KnapsackInstance) => void;
}

export function useKnapsackInstancePublishing({
    onInstanceLoaded,
}: KnapsackInstancePublishingOptions) {
    const adapter = useMemo<InstancePublishingAdapter<KnapsackInstance>>(() => ({
            publish: publishInstance,

            load: getDecodedPublishedInstance,

            hasContent: (instance) =>
                instance.items.length > 0,

            buildUrl: (publicationId) =>
                `${window.location.origin}/games/knapsack?publication=${publicationId}`,

            onLoaded: onInstanceLoaded,

            isReady: true,
        }), [onInstanceLoaded]
    );

    return useInstancePublishing(adapter);
}