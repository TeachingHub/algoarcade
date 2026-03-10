import { useState, useEffect, useCallback } from 'react';
import type { TSPInstance } from '@/types/games/tsp';
import { generateRandomPoints } from '@/utils/tsp';
import { getDailyChallenge, createDailyChallenge } from '@/services/games/TSPService';

/**
 * Handles loading (or creating) the daily TSP challenge from Firestore.
 *
 * Supports navigating to past days for practice mode.
 * Only creates new challenges for today's date.
 */

const DAILY_POINT_COUNT = 15;

/** Returns a date as YYYY-MM-DD in UTC */
export const getDateString = (date: Date): string => {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

/** Returns today's date as YYYY-MM-DD in UTC */
export const getTodayDateString = (): string => getDateString(new Date());

/** Format a UTC date string for display: "4 Mar 2026" (shown in local locale) */
export const formatDateLabel = (dateStr: string): string => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

/** Get the previous day's date string (UTC) */
const getPrevDay = (dateStr: string): string => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() - 1);
    return getDateString(date);
};

/** Get the next day's date string (UTC) */
const getNextDay = (dateStr: string): string => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + 1);
    return getDateString(date);
};

export const useTSPDailyChallenge = (canvasSize: { width: number; height: number }) => {
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [instance, setInstance] = useState<TSPInstance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const isToday = selectedDate === getTodayDateString();

    const loadChallenge = useCallback(async (dateStr: string) => {
        setIsLoading(true);
        setNotFound(false);
        setInstance(null);

        try {
            let loaded = await getDailyChallenge(dateStr);

            if (!loaded && dateStr === getTodayDateString()) {
                // First player of the day generates the challenge
                const w = canvasSize.width > 0 ? canvasSize.width : 800;
                const h = canvasSize.height > 0 ? canvasSize.height : 500;
                const newPoints = generateRandomPoints(DAILY_POINT_COUNT, w, h);

                loaded = { points: newPoints, author: "system" };
                await createDailyChallenge(dateStr, loaded);
            }

            if (loaded) {
                setInstance(loaded);
            } else {
                setNotFound(true);
            }
        } catch (error) {
            console.error("Error loading daily challenge:", error);
            setNotFound(true);
        } finally {
            setIsLoading(false);
        }
    }, [canvasSize]);

    // Auto-load when canvas is ready or date changes
    useEffect(() => {
        if (canvasSize.width > 0 && canvasSize.height > 0) {
            loadChallenge(selectedDate);
        }
    }, [canvasSize.width, canvasSize.height, selectedDate, loadChallenge]);

    // ─── Date navigation ─────────────────────────────────────────

    const goToPrevDay = useCallback(() => {
        setSelectedDate(prev => getPrevDay(prev));
    }, []);

    const goToNextDay = useCallback(() => {
        setSelectedDate(prev => {
            const next = getNextDay(prev);
            // Can't go to the future
            if (next > getTodayDateString()) return prev;
            return next;
        });
    }, []);

    const goToToday = useCallback(() => {
        setSelectedDate(getTodayDateString());
    }, []);

    const canGoNext = getNextDay(selectedDate) <= getTodayDateString();

    return {
        instance,
        isLoading,
        isToday,
        notFound,
        selectedDate,
        canGoNext,
        dateLabel: formatDateLabel(selectedDate),
        reload: () => loadChallenge(selectedDate),
        goToPrevDay,
        goToNextDay,
        goToToday,
    };
};
