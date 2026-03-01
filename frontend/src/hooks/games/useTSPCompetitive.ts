import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { TSPState } from "@/types/games/tsp";
import { calculateTotalDistance, generateRandomPoints } from "@/utils/tsp";
import { getDailyChallenge, createDailyChallenge, saveDailyScore, getDailyLeaderboard } from '@/services/games/TSPService';
import type { TSPLeaderboardEntry } from '@/services/games/TSPService';

export const useTSPCompetitive = (canvasSize: { width: number, height: number }, user: User | null) => {
    const [gameState, setGameState] = useState<TSPState>({
        points: [],
        bestPath: [],
        currentPath: [],
        bestDistance: Infinity,
        isRunning: false
    });

    const [manualPath, setManualPath] = useState<number[]>([]);
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [leaderboard, setLeaderboard] = useState<TSPLeaderboardEntry[]>([]);

    // Get today's date string YYYY-MM-DD
    const getTodayDateString = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    const loadDailyChallenge = useCallback(async () => {
        setIsLoading(true);
        const dateStr = getTodayDateString();
        try {
            let instance = await getDailyChallenge(dateStr);
            if (!instance) {
                // Generate a consistent random instance for the day (if someone is the first)
                // For simplicity, we just generate standard random points.
                // Ideally this would be done on a backend with a cron job, but doing it on first client load works.
                const w = canvasSize.width > 0 ? canvasSize.width : 800;
                const h = canvasSize.height > 0 ? canvasSize.height : 500;
                const newPoints = generateRandomPoints(15, w, h); // e.g., 15 points

                instance = {
                    points: newPoints,
                    author: "system"
                };

                // Try caching it in DB for others
                await createDailyChallenge(dateStr, instance);
            }

            setGameState(prev => ({
                ...prev,
                points: instance!.points,
                bestPath: [],
                currentPath: [],
                bestDistance: Infinity,
                isRunning: false
            }));

            // Fetch leaderboard
            const board = await getDailyLeaderboard(dateStr);
            setLeaderboard(board);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [canvasSize]);

    // Initialize daily challenge
    useEffect(() => {
        if (canvasSize.width > 0 && canvasSize.height > 0 && gameState.points.length === 0) {
            loadDailyChallenge();
        }
    }, [canvasSize.width, canvasSize.height, gameState.points.length, loadDailyChallenge]);

    const handlePointClick = useCallback((pointId: number) => {
        if (hasSubmitted || gameResult) return;

        if (!manualPath.includes(pointId)) {
            const newManualPath = [...manualPath, pointId];
            setManualPath(newManualPath);

            if (newManualPath.length === gameState.points.length) {
                const distance = calculateTotalDistance(gameState.points, newManualPath);
                setGameState(prev => ({
                    ...prev,
                    currentPath: newManualPath,
                    bestDistance: distance
                }));
            }
        }
    }, [hasSubmitted, gameResult, manualPath, gameState.points]);

    const submitManualPath = useCallback(async () => {
        if (manualPath.length !== gameState.points.length || hasSubmitted) return;

        const distance = calculateTotalDistance(gameState.points, manualPath);

        setGameState(prev => ({
            ...prev,
            bestPath: manualPath,
            bestDistance: distance
        }));

        setHasSubmitted(true);

        if (user) {
            setIsLoading(true);
            try {
                const dateStr = getTodayDateString();
                await saveDailyScore(dateStr, {
                    userId: user.uid,
                    displayName: user.displayName || "Anonymous",
                    photoURL: user.photoURL || "",
                    distance: distance,
                    path: manualPath,
                    timestamp: new Date()
                });
                // Refresh leaderboard
                const board = await getDailyLeaderboard(dateStr);
                setLeaderboard(board);
                setGameResult(`Submitted! Your distance: ${Math.round(distance)}`);
            } catch (e) {
                console.error(e);
                setGameResult("Error submitting score");
            } finally {
                setIsLoading(false);
            }
        } else {
            setGameResult(`Finished! Distance: ${Math.round(distance)}. Login to save your score!`);
        }

    }, [manualPath, gameState.points, hasSubmitted, user]);

    const clearAll = useCallback(() => {
        if (hasSubmitted) return; // competitive: no undo after submit!
        setGameState(prev => ({
            ...prev,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
        setManualPath([]);
    }, [hasSubmitted]);

    return {
        gameState,
        manualPath,
        gameResult,
        isLoading,
        hasSubmitted,
        leaderboard,
        actions: {
            handlePointClick,
            submitManualPath,
            clearAll,
            reloadLeaderboard: loadDailyChallenge
        }
    };
};
