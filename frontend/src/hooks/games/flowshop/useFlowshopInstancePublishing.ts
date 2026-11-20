import { useMemo } from "react";
import {
    useInstancePublishing,
    type InstancePublishingAdapter,
} from "@/hooks/games/shared/useInstancePublishing";
import {
    getDecodedPublishedInstance,
    publishInstance,
} from "@/services/games/FlowshopService";
import type { FlowshopInstance } from "@/types/games/flowshop";

interface FlowshopInstancePublishingOptions {
    onInstanceLoaded: (instance: FlowshopInstance) => void;
}

export function useFlowshopInstancePublishing({
    onInstanceLoaded,
}: FlowshopInstancePublishingOptions) {
    const adapter = useMemo<InstancePublishingAdapter<FlowshopInstance>>(() => ({
            publish: publishInstance,

            load: getDecodedPublishedInstance,

            hasContent: (instance) =>
                instance.jobs.length > 0,

            buildUrl: (publicationId) =>
                `${window.location.origin}/games/flowshop?publication=${publicationId}`,

            onLoaded: onInstanceLoaded,

            isReady: true,
        }), [onInstanceLoaded]
    );

    return useInstancePublishing(adapter);
}