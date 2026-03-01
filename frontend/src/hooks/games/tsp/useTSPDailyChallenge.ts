import { useState, useEffect, useCallback } from 'react';
import type { TSPInstance } from '@/types/games/tsp';
import { generateRandomPoints } from '@/utils/tsp';
import { getDailyChallenge, createDailyChallenge } from '@/services/games/TSPService';

/**
 * Handles loading (or creating) the daily TSP challenge from Firestore.
 *
 * On mount (when canvas is ready), it:
 *  1. Checks Firestore for today's challenge
 *  2. If none exists, generates one and persists it for other players
 *  3. Exposes the loaded instance and loading state
 */

const DAILY_POINT_COUNT = 15;

/** Returns today's date as YYYY-MM-DD */
export const getTodayDateString = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export const useTSPDailyChallenge = (canvasSize: { width: number; height: number }) => {
    const [instance, setInstance] = useState<TSPInstance | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadChallenge = useCallback(async () => {
        setIsLoading(true);
        const dateStr = getTodayDateString();

        try {
            let loaded = await getDailyChallenge(dateStr);

            if (!loaded) {
                // First player of the day generates the challenge
                const w = canvasSize.width > 0 ? canvasSize.width : 800;
                const h = canvasSize.height > 0 ? canvasSize.height : 500;
                const newPoints = generateRandomPoints(DAILY_POINT_COUNT, w, h);

                loaded = { points: newPoints, author: "system" };

                // Persist for other players
                await createDailyChallenge(dateStr, loaded);
            }

            setInstance(loaded);
        } catch (error) {
            console.error("Error loading daily challenge:", error);
        } finally {
            setIsLoading(false);
        }
    }, [canvasSize]);

    // Auto-load when canvas is ready and no instance exists yet
    useEffect(() => {
        if (canvasSize.width > 0 && canvasSize.height > 0 && !instance) {
            loadChallenge();
        }
    }, [canvasSize.width, canvasSize.height, instance, loadChallenge]);

    return {
        instance,
        isLoading,
        reload: loadChallenge,
    };
};
