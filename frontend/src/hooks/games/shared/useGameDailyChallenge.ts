import { useCallback, useEffect, useState } from 'react';

type UseDailyChallengeOptions<TSource, TResult> = {
    selectedDate: string;
    getChallenge: (date: string) => Promise<TSource | null>;
    transform?: (challenge: TSource) => TResult;
    enabled?: boolean;
};

const identity = <T>(value: T): T => value;

export const useDailyChallenge = <TSource, TResult = TSource>({
    selectedDate,
    getChallenge,
    transform = identity as (value: TSource) => TResult,
    enabled = true
}: UseDailyChallengeOptions<TSource, TResult>) => {
    const [instance, setInstance] = useState<TResult | null>(null);
    const [isLoading, setIsLoading] = useState(enabled);
    const [notFound, setNotFound] = useState(false);
    const [loadedDate, setLoadedDate] = useState<string | null>(null);

    const loadChallenge = useCallback(async (dateStr: string) => {
        setIsLoading(true);
        setNotFound(false);
        setInstance(null);
        setLoadedDate(null);

        try {
            const loaded = await getChallenge(dateStr);

            if (loaded) {
                setInstance(transform(loaded));
                setLoadedDate(dateStr);
            } else {
                setNotFound(true);
            }
            if (!loaded) {
                setNotFound(true);
                return;
            }
        } catch (error) {
            console.error('Error loading daily challenge:', error);
            setNotFound(true);
        } finally {
            setIsLoading(false);
        }
    }, [getChallenge, transform]);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        void loadChallenge(selectedDate);
    }, [enabled, selectedDate, loadChallenge]);

    const reload = useCallback(() => {
        if (!enabled) return;

        void loadChallenge(selectedDate);
    }, [enabled, loadChallenge, selectedDate]);

    return {
        instance,
        isLoading,
        notFound,
        loadedDate,
        reload
    };
};