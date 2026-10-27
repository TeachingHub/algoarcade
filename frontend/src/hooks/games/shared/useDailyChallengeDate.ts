import { useState, useCallback } from 'react';

/**
 * Supports navigating to past days for practice mode.
 */

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

export const useDailyChallengeDate = () => {
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());

    const isToday = selectedDate === getTodayDateString();

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
        isToday,
        selectedDate,
        canGoNext,
        dateLabel: formatDateLabel(selectedDate),
        goToPrevDay,
        goToNextDay,
        goToToday,
    };
};
