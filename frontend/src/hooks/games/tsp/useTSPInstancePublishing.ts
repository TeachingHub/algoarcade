import { useMemo } from "react";
import {
    useInstancePublishing,
    type InstancePublishingAdapter,
} from "@/hooks/games/shared/useInstancePublishing";
import {
    getDecodedPublishedInstance,
    publishInstance,
} from "@/services/games/TSPService";
import type { TSPInstance } from "@/types/games/tsp";

interface TSPInstancePublishingOptions {
    onInstanceLoaded: (instance: TSPInstance) => void;
}

export function useTSPInstancePublishing({
    onInstanceLoaded,
}: TSPInstancePublishingOptions) {
    const adapter = useMemo<InstancePublishingAdapter<TSPInstance>>(() => ({
            publish: publishInstance,

            load: getDecodedPublishedInstance,

            hasContent: (instance) =>
                instance.points.length > 0,

            buildUrl: (publicationId) =>
                `${window.location.origin}/games/tsp?publication=${publicationId}`,

            onLoaded: onInstanceLoaded,

            isReady: true,
        }), [onInstanceLoaded]
    );

    return useInstancePublishing(adapter);
}