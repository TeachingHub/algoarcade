import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { getGameInstance, saveGameInstance } from '@/services/games/TSPService';
import type { Point } from "@/types/games/tsp";

/**
 * Handles loading a shared TSP instance from a URL parameter and sharing new instances.
 * 
 * Manages:
 * - Reading `?instance=<id>` from the URL
 * - Validating the Firestore document ID format
 * - Loading the instance from Firestore
 * - Saving a new instance and copying the shareable URL to clipboard
 */

// Firestore auto-generated IDs are 20 alphanumeric chars
const isValidFirestoreId = (id: string) => /^[a-zA-Z0-9]{20}$/.test(id);

interface UseInstanceSharingOptions {
    /** Called when an instance is loaded successfully */
    onInstanceLoaded: (points: Point[], author: string) => void;
    /** Called when no instance is found or loading fails — should generate default scenario */
    onFallback: () => void;
}

export const useTSPInstanceSharing = (
    canvasSize: { width: number; height: number },
    options: UseInstanceSharingOptions
) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load instance from URL on mount
    useEffect(() => {
        if (hasInitialized) return;

        const instanceId = searchParams.get('instance');

        const initGame = async () => {
            if (instanceId) {
                if (!isValidFirestoreId(instanceId)) {
                    console.warn("Invalid instance ID format");
                    setSearchParams(prev => {
                        const newParams = new URLSearchParams(prev);
                        newParams.delete('instance');
                        return newParams;
                    });
                    options.onFallback();
                    setHasInitialized(true);
                    return;
                }

                setIsLoading(true);
                try {
                    const instance = await getGameInstance(instanceId);
                    if (instance) {
                        options.onInstanceLoaded(
                            instance.points,
                            instance.author || 'an anonymous traveler'
                        );
                    } else {
                        console.warn("Instance not found");
                        setSearchParams(prev => {
                            const newParams = new URLSearchParams(prev);
                            newParams.delete('instance');
                            return newParams;
                        });
                        options.onFallback();
                    }
                } catch (e) {
                    console.error("Error loading instance", e);
                    setSearchParams(prev => {
                        const newParams = new URLSearchParams(prev);
                        newParams.delete('instance');
                        return newParams;
                    });
                    options.onFallback();
                } finally {
                    setIsLoading(false);
                }
            } else if (canvasSize.width > 0 && canvasSize.height > 0) {
                options.onFallback();
            }
            setHasInitialized(true);
        };

        initGame();
    }, [canvasSize.width, canvasSize.height, hasInitialized]);

    // Share current instance
    const shareInstance = useCallback(async (points: Point[], authorName: string): Promise<boolean> => {
        if (points.length === 0) return false;

        try {
            const id = await saveGameInstance({
                points,
                author: authorName
            });

            setSearchParams(prev => {
                prev.set('instance', id);
                return prev;
            });

            const url = `${window.location.origin}${window.location.pathname}?instance=${id}`;
            await navigator.clipboard.writeText(url);

            return true;
        } catch (e) {
            console.error("Error sharing:", e);
            return false;
        }
    }, [setSearchParams]);

    return {
        isLoading,
        shareInstance,
    };
};
