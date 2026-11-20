import { useMemo } from "react";
import {
    useInstancePublishing,
    type InstancePublishingAdapter,
} from "@/hooks/games/shared/useInstancePublishing";
import {
    getDecodedPublishedInstance,
    publishInstance,
} from "@/services/games/PathfindingService";
import type { PathfindingInstance } from "@/types/games/pathfinding";

interface PathfindingInstancePublishingOptions {
    onInstanceLoaded: (instance: PathfindingInstance) => void;
}

export function usePathfindingInstancePublishing({
    onInstanceLoaded,
}: PathfindingInstancePublishingOptions) {
    const adapter = useMemo<InstancePublishingAdapter<PathfindingInstance>>(() => ({
            publish: publishInstance,

            load: getDecodedPublishedInstance,

            hasContent: (instance) =>
                instance.grid.length > 0,

            buildUrl: (publicationId) =>
                `${window.location.origin}/games/pathfinding?publication=${publicationId}`,

            onLoaded: onInstanceLoaded,

            isReady: true,
        }), [onInstanceLoaded]
    );

    return useInstancePublishing(adapter);
}