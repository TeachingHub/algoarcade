import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import type { PublicationMetadata } from "@/types/publishedInstance";

const FIRESTORE_ID_REGEX = /^[a-zA-Z0-9]{20}$/;

export interface InstancePublishingAdapter<TInstance> {
    publish: (
        instance: TInstance,
        metadata: PublicationMetadata
    ) => Promise<string>;

    load: (publicationId: string) => Promise<TInstance | null>;

    hasContent: (instance: TInstance) => boolean;

    buildUrl: (publicationId: string) => string;

    onLoaded: (instance: TInstance) => void;

    isReady?: boolean;
}

function isValidFirestoreId(id: string): boolean {
    return FIRESTORE_ID_REGEX.test(id);
}

export function useInstancePublishing<TInstance>(adapter: InstancePublishingAdapter<TInstance>) {
    const [searchParams] = useSearchParams();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (hasInitialized) return;

        const publicationId = searchParams.get("publication");

        if (!publicationId && adapter.isReady === false) return;

        let cancelled = false;

        const initializePublication = async () => {
            if (!publicationId) {
                if (!cancelled) {
                    setHasInitialized(true);
                }
                return;
            }

            if (!isValidFirestoreId(publicationId)) {
                console.warn("Invalid publication ID format");

                if (!cancelled) {
                    setHasInitialized(true);
                }
                return;
            }

            setIsLoading(true);

            try {
                const instance = await adapter.load(publicationId);

                if (cancelled) return;

                if (instance) {
                    adapter.onLoaded(instance);
                } else {
                    console.warn("Published instance not found");
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Error loading published instance:",
                        error
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setHasInitialized(true);
                }
            }
        };

        void initializePublication();

        return () => {
            cancelled = true;
        };
    }, [
        adapter,
        adapter.isReady,
        adapter.load,
        adapter.onLoaded,
        hasInitialized,
        searchParams,
    ]);

    const publishInstance = useCallback(
        async (
            instance: TInstance,
            metadata: PublicationMetadata
        ): Promise<string | null> => {
            if (!adapter.hasContent(instance)) return null;

            if (!metadata.title.trim()) return null;

            setIsPublishing(true);

            try {
                const publicationId = await adapter.publish(instance, metadata);

                return adapter.buildUrl(publicationId);
            } catch (error) {
                console.error("Error publishing instance:", error);
                return null;
            } finally {
                setIsPublishing(false);
            }
        }, [adapter]
    );

    return {
        isLoading,
        isPublishing,
        publishInstance,
    };
}