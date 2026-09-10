import { useEffect, useRef, useState, useCallback } from "react";

export function useTimer({ tick = 250 } = {}) {
    const [elapsedMs, setElapsedMs] = useState(0);
    const runningRef = useRef(false);
    const startRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    const start = useCallback(() => {
        if (runningRef.current) return;
        startRef.current = Date.now() - elapsedMs;
        runningRef.current = true;
        intervalRef.current = window.setInterval(() => {
            setElapsedMs(Date.now() - (startRef.current ?? Date.now()));
        }, tick);
    }, [elapsedMs, tick]);

    const pause = useCallback(() => {
        if (!runningRef.current) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        setElapsedMs(Date.now() - (startRef.current ?? Date.now()));
        runningRef.current = false;
        startRef.current = null;
    }, []);

    const reset = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        runningRef.current = false;
        startRef.current = null;
        setElapsedMs(0);
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return {
        elapsedMs,
        isRunning: runningRef.current,
        start,
        pause,
        reset,
    } as const;
}