import { useRef, useEffect, useCallback } from 'react';

/**
 * Manages the animation lifecycle (setTimeout-based loops) for TSP algorithm visualization.
 * 
 * Provides a speed ref that always holds the latest value (avoiding stale closures),
 * a delay calculator, and start/stop controls for the animation loop.
 */

type AnimationTimeoutId = ReturnType<typeof setTimeout>;

// Non-linear delay mapping: Speed 100 → 0ms, Speed 50 → ~375ms, Speed 1 → ~1500ms
const getDelay = (speed: number) => Math.floor(1500 * Math.pow(1 - (speed / 100), 2));

export const useTSPAnimation = (initialSpeed: number = 50) => {
    const animationIdRef = useRef<AnimationTimeoutId | null>(null);
    const speedRef = useRef(initialSpeed);

    const stop = useCallback(() => {
        if (animationIdRef.current) {
            clearTimeout(animationIdRef.current);
            animationIdRef.current = null;
        }
    }, []);

    const scheduleNext = useCallback((callback: () => void) => {
        animationIdRef.current = setTimeout(callback, getDelay(speedRef.current));
    }, []);

    const scheduleWithDelay = useCallback((callback: () => void, delayMs: number) => {
        animationIdRef.current = setTimeout(callback, delayMs);
    }, []);

    const setSpeed = useCallback((speed: number) => {
        speedRef.current = speed;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationIdRef.current) clearTimeout(animationIdRef.current);
        };
    }, []);

    return {
        stop,
        scheduleNext,
        scheduleWithDelay,
        setSpeed,
        speedRef,
    };
};
