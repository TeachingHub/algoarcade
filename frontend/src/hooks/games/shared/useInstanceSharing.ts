import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

const FIRESTORE_ID_REGEX = /^[a-zA-Z0-9]{20}$/;

export interface InstanceSharingAdapter<TInstance, TPayload> {
    load: (instanceId: string) => Promise<TInstance | null>;
    save: (payload: TPayload) => Promise<string>;
    hasContent: (payload: TPayload) => boolean;

    onLoaded: (instance: TInstance) => void;

    onFallback: () => void;

    isReady?: boolean;
}

function isValidFirestoreId(id: string): boolean {
    return FIRESTORE_ID_REGEX.test(id);
}

function removeInstanceParam(
    setSearchParams: ReturnType<typeof useSearchParams>[1]
): void {
    setSearchParams((previousParams) => {
        const nextParams = new URLSearchParams(previousParams);
        nextParams.delete('instance');
        return nextParams;
    });
}

function buildShareUrl(instanceId: string): string {
    return `${window.location.origin}${window.location.pathname}?instance=${instanceId}`;
}

export function useInstanceSharing<TInstance, TPayload>(
    adapter: InstanceSharingAdapter<TInstance, TPayload>
) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (hasInitialized) return;

        const instanceId = searchParams.get('instance');

        if (!instanceId && adapter.isReady === false) {
            return;
        }

        let cancelled = false;

        const initializeGame = async () => {
            if (!instanceId) {
                adapter.onFallback();

                if (!cancelled) {
                    setHasInitialized(true);
                }

                return;
            }

            if (!isValidFirestoreId(instanceId)) {
                console.warn('Invalid instance ID format');

                removeInstanceParam(setSearchParams);
                adapter.onFallback();

                if (!cancelled) {
                    setHasInitialized(true);
                }

                return;
            }

            setIsLoading(true);

            try {
                const instance = await adapter.load(instanceId);

                if (cancelled) return;

                if (instance) {
                    adapter.onLoaded(instance);
                } else {
                    console.warn('Instance not found');

                    removeInstanceParam(setSearchParams);
                    adapter.onFallback();
                }
            } catch (error) {
                if (cancelled) return;

                console.error('Error loading shared instance:', error);

                removeInstanceParam(setSearchParams);
                adapter.onFallback();
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setHasInitialized(true);
                }
            }
        };

        void initializeGame();

        return () => {
            cancelled = true;
        };
    }, [
        adapter,
        adapter.isReady,
        adapter.onFallback,
        adapter.onLoaded,
        adapter.load,
        hasInitialized,
        searchParams,
        setSearchParams,
    ]);

    const shareInstance = useCallback(
        async (payload: TPayload): Promise<string | null> => {
            if (!adapter.hasContent(payload)) {
                return null;
            }

            try {
                const instanceId = await adapter.save(payload);

                setSearchParams((previousParams) => {
                    const nextParams = new URLSearchParams(previousParams);
                    nextParams.set('instance', instanceId);
                    return nextParams;
                });

                return buildShareUrl(instanceId);
            } catch (error) {
                console.error('Error sharing instance:', error);
                return null;
            }
        },
        [adapter, setSearchParams]
    );

    return {
        isLoading,
        shareInstance,
    };
}