import { useState, useEffect, useRef, useCallback } from 'react';
import type { Point, TSPState } from "@/types/games/tsp";
import {
    calculateTotalDistance,
    nearestNeighborTSP,
    twoOptImprovement,
    generateRandomPoints,
    getPredefinedPoints,
    getScenarioConfig,
    formatDistance
} from "@/utils/tsp";
import { useSearchParams } from 'react-router';
import { getGameInstance, saveGameInstance } from '@/services/games/TSPService';

export const useTSPSandbox = (canvasSize: { width: number, height: number }) => {
    const [gameState, setGameState] = useState<TSPState>({
        points: [],
        bestPath: [],
        currentPath: [],
        bestDistance: Infinity,
        isRunning: false,
        speed: 50
    });

    const [algorithm, setAlgorithmState] = useState<'nearest' | '2opt' | 'manual' | 'builder'>('nearest');
    const [manualPath, setManualPath] = useState<number[]>([]);
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [scenarioInfo, setScenarioInfo] = useState<{ name: string, description: string } | null>(null);
    const [customPointCount, setCustomPointCount] = useState<number>(8);

    // Use ReturnType<typeof setTimeout> to handle both Node and Browser environments safely
    const animationIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load game instance
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false)

    const stopAlgorithm = useCallback(() => {
        if (animationIdRef.current) {
            clearTimeout(animationIdRef.current);
            animationIdRef.current = null;
        }
        setGameState(prev => ({ ...prev, isRunning: false }));
    }, []);

    const setAlgorithm = useCallback((algo: 'nearest' | '2opt' | 'manual' | 'builder') => {
        // If we are leaving builder mode, validate points
        if (algorithm === 'builder' && algo !== 'builder') {
            if (gameState.points.length < 5 || gameState.points.length > 50) {
                // Not a valid graph, don't allow switching or warn.
                // For better UX, let's just generate a new random scenario of default size
                // We'll call generateScenario directly inside here or just reset state
                const numPoints = customPointCount;
                const w = canvasSize.width || 800;
                const h = canvasSize.height || 500;
                const newPoints = generateRandomPoints(numPoints, w, h);

                setGameState(prev => ({
                    ...prev,
                    points: newPoints,
                    bestPath: [],
                    currentPath: [],
                    bestDistance: Infinity
                }));
                setScenarioInfo({
                    name: "Random Path",
                    description: "Auto-generated after invalid builder state."
                });
            }
        }

        setAlgorithmState(algo);
        if (gameState.isRunning) stopAlgorithm();
        setManualPath([]);
        setGameResult(null);
        setGameState(prev => ({
            ...prev,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
    }, [algorithm, gameState.isRunning, gameState.points.length, stopAlgorithm, canvasSize, customPointCount]);

    const generateScenario = useCallback((pattern: string, count?: number) => {
        stopAlgorithm();
        setGameResult(null);
        setManualPath([]);

        let points: Point[] = [];
        let newScenarioInfo = null;

        if (pattern === 'random') {
            const numPoints = count || customPointCount;
            // Use defaults if canvas is 0 (shouldn't happen due to useEffect but safe guard)
            const w = canvasSize.width || 800;
            const h = canvasSize.height || 500;
            points = generateRandomPoints(numPoints, w, h);
            newScenarioInfo = {
                name: "Random Path",
                description: "Chaos theory in action! Can you find order in this randomness?"
            };
        } else {
            const w = canvasSize.width || 800;
            const h = canvasSize.height || 500;
            points = getPredefinedPoints(pattern, w, h);
            const config = getScenarioConfig(pattern);
            newScenarioInfo = { name: config.name, description: config.description };
        }

        setScenarioInfo(newScenarioInfo);
        setGameState(prev => ({
            ...prev,
            points,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity,
            isRunning: false
        }));
    }, [canvasSize, customPointCount, stopAlgorithm]);

    const runAlgorithm = useCallback(() => {
        if (gameState.isRunning) return;

        setGameState(prev => ({ ...prev, isRunning: true }));
        setManualPath([]); // Clear manual path when running algo

        if (algorithm === 'nearest') {
            const route = nearestNeighborTSP(gameState.points);
            const distance = calculateTotalDistance(gameState.points, route);
            setGameState(prev => ({
                ...prev,
                bestPath: route,
                bestDistance: distance,
                isRunning: false
            }));
        } else if (algorithm === '2opt') {
            const initialRoute = nearestNeighborTSP(gameState.points);
            let currentRoute = initialRoute;
            let currentDistance = calculateTotalDistance(gameState.points, currentRoute);

            setGameState(prev => ({
                ...prev,
                bestPath: currentRoute,
                bestDistance: currentDistance
            }));

            const getDelay = (s: number) => {
                // Non-linear delay:
                // Speed 100 -> 0ms
                // Speed 50 -> ~375ms
                // Speed 1 -> ~1500ms
                return Math.floor(1500 * Math.pow(1 - (s / 100), 2));
            };

            const improve = () => {
                const result = twoOptImprovement(gameState.points, currentRoute);
                currentRoute = result.route;
                currentDistance = calculateTotalDistance(gameState.points, currentRoute);

                setGameState(prev => ({
                    ...prev,
                    bestPath: currentRoute,
                    bestDistance: currentDistance
                }));

                if (result.improved) {
                    animationIdRef.current = setTimeout(improve, getDelay(gameState.speed ?? 50));
                } else {
                    setGameState(prev => ({ ...prev, isRunning: false }));
                    animationIdRef.current = null;
                }
            };

            // Start the recursive timeout loop
            animationIdRef.current = setTimeout(improve, getDelay(gameState.speed ?? 50));
        }
    }, [algorithm, gameState.points, gameState.isRunning, gameState.speed]);

    const handlePointClick = useCallback((pointId: number) => {
        if (algorithm !== 'manual' || gameState.isRunning || gameResult) return;

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
    }, [algorithm, gameState.isRunning, gameResult, manualPath, gameState.points]);

    const submitManualPath = useCallback(() => {
        if (manualPath.length !== gameState.points.length) return;

        const userDistance = calculateTotalDistance(gameState.points, manualPath);

        let route = [...manualPath];
        let currentDist = userDistance;

        setGameState(prev => ({
            ...prev,
            bestPath: route,
            bestDistance: currentDist,
            isRunning: true
        }));

        const improve = () => {
            const result = twoOptImprovement(gameState.points, route);
            route = result.route;
            currentDist = calculateTotalDistance(gameState.points, route);

            setGameState(prev => ({
                ...prev,
                bestPath: route
            }));


            const getDelay = (s: number) => Math.floor(1500 * Math.pow(1 - (s / 100), 2));

            if (result.improved) {
                animationIdRef.current = setTimeout(improve, getDelay(gameState.speed ?? 50));
            } else {
                setGameState(prev => ({ ...prev, isRunning: false }));
                animationIdRef.current = null;

                if (currentDist < userDistance - 1) { // -1 for floating point tolerance
                    setGameResult(`YOU LOSE! 🤖\nAlgorithm found a better path (${formatDistance(currentDist)})`);
                } else {
                    setGameResult("YOU WIN! 🏆\nYour path was optimal!");
                }
            }
        };

        animationIdRef.current = setTimeout(improve, 500);
    }, [manualPath, gameState.points, gameState.speed]);

    const clearAll = useCallback(() => {
        stopAlgorithm();
        setGameState(prev => ({
            ...prev,
            points: algorithm === 'builder' ? [] : prev.points,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
        setManualPath([]);
        setGameResult(null);
    }, [stopAlgorithm, algorithm]);

    const addPoint = useCallback((x: number, y: number) => {
        if (algorithm !== 'builder' || gameState.isRunning) return;

        setGameState(prev => {
            // Check if point is too close to existing points (e.g. within 20px)
            const minDistance = 20;
            const isTooClose = prev.points.some(p => {
                const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
                return dist < minDistance;
            });

            if (isTooClose) return prev;

            const newPoint: Point = {
                id: prev.points.length > 0 ? Math.max(...prev.points.map(p => p.id)) + 1 : 0,
                x,
                y
            };
            return {
                ...prev,
                points: [...prev.points, newPoint],
                bestPath: [],
                currentPath: [],
                bestDistance: Infinity
            };
        });
        setManualPath([]);
        setGameResult(null);
    }, [algorithm, gameState.isRunning]);

    const shareInstance = useCallback(async (authorName: string) => {
        if (gameState.points.length === 0) return false;

        try {
            const id = await saveGameInstance({
                points: gameState.points,
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
    }, [gameState.points, setSearchParams]);

    const setSpeed = useCallback((speed: number) => {
        setGameState(prev => ({ ...prev, speed }));
    }, []);

    // Initialize with random points when canvas size is available
    // useEffect(() => {
    //     if (canvasSize.width > 0 && canvasSize.height > 0 && gameState.points.length === 0) {
    //         generateScenario('random');
    //     }
    // }, [canvasSize.width, canvasSize.height, gameState.points.length, generateScenario]);

    // Validate Firestore ID (alphanumeric and exactly 20 chars)
    const isValidId = (id: string) => /^[a-zA-Z0-9]{20}$/.test(id);

    useEffect(() => {
        const instanceId = searchParams.get('instance');

        if (gameState.points.length > 0) return;

        const initGame = async () => {
            if (instanceId) {
                // If invalid format, clean URL
                if (!isValidId(instanceId)) {
                    console.warn("Invalid instance ID format");
                    setSearchParams(prev => {
                        const newParams = new URLSearchParams(prev);
                        newParams.delete('instance');
                        return newParams;
                    });
                    generateScenario('random');
                    return;
                }

                setIsLoading(true);
                try {
                    const instance = await getGameInstance(instanceId);
                    if (instance) {
                        setGameState(prev => ({
                            ...prev,
                            points: instance.points,
                            bestPath: [],
                            currentPath: [],
                            bestDistance: Infinity,
                            isRunning: false
                        }));
                        setScenarioInfo({
                            name: "Shared Challenge",
                            description: `Created by ${instance.author || 'an anonymous traveler'}`
                        });
                    } else {
                        // Not Found: Clean URL
                        console.warn("Instance not found");
                        setSearchParams(prev => {
                            const newParams = new URLSearchParams(prev);
                            newParams.delete('instance');
                            return newParams;
                        });
                        generateScenario('random');
                    }
                } catch (e) {
                    // Error: Clean URL
                    console.error("Error loading instance", e);
                    setSearchParams(prev => {
                        const newParams = new URLSearchParams(prev);
                        newParams.delete('instance');
                        return newParams;
                    });
                    generateScenario('random');
                } finally {
                    setIsLoading(false);
                }
            } else if (canvasSize.width > 0 && canvasSize.height > 0) {
                generateScenario('random');
            }
        };

        initGame();
    }, [canvasSize.width, canvasSize.height, searchParams]);



    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationIdRef.current) clearTimeout(animationIdRef.current);
        };
    }, []);

    return {
        gameState,
        algorithm,
        setAlgorithm,
        manualPath,
        gameResult,
        scenarioInfo,
        customPointCount,
        setCustomPointCount,
        isLoading,
        actions: {
            generateScenario,
            runAlgorithm,
            stopAlgorithm,
            handlePointClick,
            addPoint,
            submitManualPath,
            clearAll,
            setSpeed,
            shareInstance
        }
    };
};
