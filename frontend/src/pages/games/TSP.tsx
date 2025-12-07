import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from "@/layouts/Layout";
import Button from "@/components/shared/Button";
import styles from "@/styles/pages/games/TSP.module.css";
import type { Point, TSPState } from "../../types/games/tsp";
import {
    calculateTotalDistance,
    nearestNeighborTSP,
    twoOptImprovement,
    generateRandomPoints,
    getPredefinedPoints,
    getScenarioConfig,
    formatDistance,
    pathColor,
    manualPathColor,
    numberColor
} from "../../utils/tsp/tsp";
import { useAuth } from "@/context/AuthContext";

export default function TSP() {
    const { user } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

    const [state, setState] = useState<TSPState>({
        points: [],
        bestPath: [],
        currentPath: [],
        bestDistance: Infinity,
        isRunning: false,
        speed: 50
    });

    const [algorithm, setAlgorithm] = useState<'nearest' | '2opt' | 'manual'>('nearest');
    const [manualPath, setManualPath] = useState<number[]>([]);
    const [showDistance] = useState(true);
    const [animationId, setAnimationId] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [customPointCount, setCustomPointCount] = useState<number>(8);
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [scenarioInfo, setScenarioInfo] = useState<{ name: string, description: string } | null>(null);
    const [bgElements, setBgElements] = useState<any[]>([]);

    // Resize canvas on mount
    useEffect(() => {
        const handleResize = () => {
            const container = document.querySelector(`.${styles.canvasArea}`);
            if (container) {
                setCanvasSize({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial size

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize with random points
    useEffect(() => {
        if (canvasSize.width > 0 && canvasSize.height > 0 && state.points.length === 0) {
            const points = generateRandomPoints(8, canvasSize.width, canvasSize.height);
            setState(prev => ({
                ...prev,
                points,
                bestPath: [],
                currentPath: [],
                bestDistance: Infinity
            }));
        }
    }, [canvasSize]);

    // Draw on canvas
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

        // Draw background elements
        bgElements.forEach(el => {
            ctx.fillStyle = el.color;
            ctx.beginPath();
            if (el.type === 'rect') {
                ctx.fillRect(el.x, el.y, el.w, el.h);
            } else if (el.type === 'circle') {
                ctx.arc(el.x, el.y, el.r, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        // Draw best path
        if (state.bestPath.length > 1) {
            ctx.strokeStyle = pathColor; // Primary color
            ctx.lineWidth = 3;
            ctx.setLineDash([]);

            ctx.beginPath();
            for (let i = 0; i < state.bestPath.length; i++) {
                const point = state.points.find(p => p.id === state.bestPath[i]);
                if (point) {
                    if (i === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }
            // Connect back to start
            const firstPoint = state.points.find(p => p.id === state.bestPath[0]);
            if (firstPoint) {
                ctx.lineTo(firstPoint.x, firstPoint.y);
            }
            ctx.stroke();
        }

        // Draw manual path
        if (manualPath.length > 1 && algorithm === 'manual') {
            ctx.strokeStyle = manualPathColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            for (let i = 0; i < manualPath.length; i++) {
                const point = state.points.find(p => p.id === manualPath[i]);
                if (point) {
                    if (i === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }
            // If manual path is complete, connect back to start
            if (manualPath.length === state.points.length) {
                const firstPoint = state.points.find(p => p.id === manualPath[0]);
                if (firstPoint) {
                    ctx.lineTo(firstPoint.x, firstPoint.y);
                }
            }
            ctx.stroke();
        }

        // Draw points
        state.points.forEach((point, index) => {
            const isInManualPath = manualPath.includes(point.id);
            const manualIndex = manualPath.indexOf(point.id);

            // Point
            ctx.fillStyle = isInManualPath ? manualPathColor : pathColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Border
            ctx.strokeStyle = numberColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Number
            ctx.fillStyle = numberColor;
            ctx.font = 'bold 10px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (algorithm === 'manual' && isInManualPath) {
                ctx.fillText((manualIndex + 1).toString(), point.x, point.y);
            } else {
                ctx.fillText(index.toString(), point.x, point.y);
            }
        });

    }, [state, manualPath, algorithm, showDistance, canvasSize]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (algorithm !== 'manual' || state.isRunning || gameResult) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        let closestPoint: Point | null = null;
        let closestDistance = Infinity;

        state.points.forEach(point => {
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            if (distance < closestDistance && distance < 20) {
                closestDistance = distance;
                closestPoint = point;
            }
        });

        if (closestPoint && !manualPath.includes((closestPoint as Point).id)) {
            const newManualPath = [...manualPath, (closestPoint as Point).id];
            setManualPath(newManualPath);

            if (newManualPath.length === state.points.length) {
                const distance = calculateTotalDistance(state.points, newManualPath);
                setState(prev => ({
                    ...prev,
                    currentPath: newManualPath, // Show current path distance
                    bestDistance: distance // Update displayed distance
                }));
            }
        }
    };

    const handleManualSubmit = () => {
        if (manualPath.length !== state.points.length) return;

        const userDistance = calculateTotalDistance(state.points, manualPath);

        // Start 2-opt optimization ON THE USER'S PATH
        let route = [...manualPath];
        let currentDist = userDistance;

        setState(prev => ({
            ...prev,
            bestPath: route,
            bestDistance: currentDist,
            isRunning: true
        }));

        const improve = () => {
            const result = twoOptImprovement(state.points, route);
            route = result.route;
            currentDist = calculateTotalDistance(state.points, route);

            setState(prev => ({
                ...prev,
                bestPath: route
            }));

            if (result.improved) {
                const timeoutId = setTimeout(improve, 101 - state.speed);
                setAnimationId(timeoutId);
            } else {
                setState(prev => ({ ...prev, isRunning: false }));
                setAnimationId(null);

                if (currentDist < userDistance - 1) {
                    setGameResult(`YOU LOSE! 🤖\nAlgorithm found a better path (${formatDistance(currentDist)})`);
                } else {
                    setGameResult("YOU WIN! 🏆\nYour path was optimal!");
                }
            }
        };

        const timeoutId = setTimeout(improve, 500); // Small delay before starting
        setAnimationId(timeoutId);
    };

    const runAlgorithm = () => {
        if (state.isRunning) return;

        setState(prev => ({ ...prev, isRunning: true }));
        setManualPath([]); // Clear manual path when running algo

        if (algorithm === 'nearest') {
            const route = nearestNeighborTSP(state.points);
            const distance = calculateTotalDistance(state.points, route);

            setState(prev => ({
                ...prev,
                bestPath: route,
                bestDistance: distance,
                isRunning: false
            }));
        } else if (algorithm === '2opt') {
            let route = nearestNeighborTSP(state.points);
            let distance = calculateTotalDistance(state.points, route);

            setState(prev => ({
                ...prev,
                bestPath: route,
                bestDistance: distance
            }));

            const improve = () => {
                const result = twoOptImprovement(state.points, route);
                route = result.route;
                distance = calculateTotalDistance(state.points, route);

                setState(prev => ({
                    ...prev,
                    bestPath: route,
                    bestDistance: distance
                }));

                if (result.improved) {
                    const timeoutId = setTimeout(improve, 101 - state.speed);
                    setAnimationId(timeoutId);
                } else {
                    setState(prev => ({ ...prev, isRunning: false }));
                    setAnimationId(null);
                }
            };

            const timeoutId = setTimeout(improve, 101 - state.speed);
            setAnimationId(timeoutId);
        }
    };

    const stopAlgorithm = () => {
        if (animationId) {
            clearTimeout(animationId);
            setAnimationId(null);
        }
        setState(prev => ({ ...prev, isRunning: false }));
    };

    const clearAll = () => {
        stopAlgorithm();
        setState(prev => ({
            ...prev,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
        setManualPath([]);
        setGameResult(null);
        // Don't clear scenario info/bg to keep context
    };

    const generatePoints = (pattern: string, count?: number) => {
        stopAlgorithm();
        setGameResult(null);
        let points: Point[];

        if (pattern === 'random') {
            points = generateRandomPoints(count || 8, canvasSize.width, canvasSize.height);
            setScenarioInfo(null);
            setBgElements([]);
        } else {
            points = getPredefinedPoints(pattern, canvasSize.width, canvasSize.height);
            const config = getScenarioConfig(pattern, canvasSize.width, canvasSize.height);
            setScenarioInfo({ name: config.name, description: config.description });
            setBgElements(config.bgElements);
        }

        setState(prev => ({
            ...prev,
            points,
            bestPath: [],
            currentPath: [],
            bestDistance: Infinity
        }));
        setManualPath([]);
    };

    return (
        <Layout>
            <div className={styles.gameContainer}>
                {!user && (
                    <div className={styles.notification}>
                        ⚠️ Progress not saved. Log in to track your scores!
                    </div>
                )}

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>TRAVELING SALESPERSON</h1>
                        <div className={styles.badges}>
                            <span className={styles.badge}>HARD</span>
                            <span className={styles.badge}>GRAPH</span>
                        </div>
                    </div>
                    <div className={styles.stats}>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>BEST</span>
                            <span className={styles.statValue}>
                                {state.bestDistance === Infinity ? '--' : formatDistance(state.bestDistance)}
                            </span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>POINTS</span>
                            <span className={styles.statValue}>{state.points.length}</span>
                        </div>
                    </div>
                </div>

                {scenarioInfo && (
                    <div className={styles.contextBlock}>
                        <h3 className={styles.contextTitle}>{scenarioInfo.name}</h3>
                        <p className={styles.contextDescription}>{scenarioInfo.description}</p>
                    </div>
                )}

                <div className={styles.content}>
                    <div className={styles.canvasArea}>
                        <canvas
                            ref={canvasRef}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            onClick={handleCanvasClick}
                            style={{ cursor: algorithm === 'manual' ? 'crosshair' : 'default' }}
                        />
                        {algorithm === 'manual' && manualPath.length < state.points.length && !gameResult && (
                            <div className={styles.instructionOverlay}>
                                Click points to build path: {manualPath.length}/{state.points.length}
                            </div>
                        )}
                        {gameResult && (
                            <div className={styles.resultOverlay}>
                                {gameResult}
                            </div>
                        )}
                    </div>

                    <div className={styles.sidebar}>
                        <div className={styles.controlPanel}>
                            <h3>ALGORITHM</h3>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        value="nearest"
                                        checked={algorithm === 'nearest'}
                                        onChange={(e) => setAlgorithm(e.target.value as any)}
                                        disabled={state.isRunning}
                                    />
                                    Nearest Neighbor (view)
                                </label>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        value="2opt"
                                        checked={algorithm === '2opt'}
                                        onChange={(e) => setAlgorithm(e.target.value as any)}
                                        disabled={state.isRunning}
                                    />
                                    2-opt Optimization (view)
                                </label>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        value="manual"
                                        checked={algorithm === 'manual'}
                                        onChange={(e) => setAlgorithm(e.target.value as any)}
                                        disabled={state.isRunning}
                                    />
                                    Manual Mode (play!)
                                </label>
                            </div>
                        </div>

                        <div className={styles.controlPanel}>
                            <h3>CONTROLS</h3>
                            <div className={styles.actions}>
                                {algorithm !== 'manual' ? (
                                    <>
                                        {!state.isRunning ? (
                                            <Button
                                                style={["primary", "fullWidth"]}
                                                label="RUN ALGORITHM"
                                                onClick={runAlgorithm}
                                                disabled={state.points.length < 2}
                                            />
                                        ) : (
                                            <Button
                                                style={["secondary", "fullWidth"]}
                                                label="STOP"
                                                onClick={stopAlgorithm}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <Button
                                        style={["primary", "fullWidth"]}
                                        label="SUBMIT"
                                        onClick={handleManualSubmit}
                                        disabled={manualPath.length !== state.points.length || !!gameResult}
                                    />
                                )}
                                <Button
                                    style={["secondary", "fullWidth"]}
                                    label="RESET PATH"
                                    onClick={clearAll}
                                />
                            </div>
                        </div>

                        <div className={styles.controlPanel}>
                            <h3>GENERATE</h3>
                            <div className={styles.scenarioSelector}>
                                <select
                                    className={styles.selectInput}
                                    onChange={(e) => {
                                        if (e.target.value) generatePoints(e.target.value);
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select Scenario...</option>

                                    <optgroup label="Challenges (Randomized)">
                                        <option value="supermarket">🛒 Supermarket Run</option>
                                        <option value="grid">🍕 Pizza Delivery</option>
                                        <option value="islands">🏝️ Island Hopping</option>
                                        <option value="corners">🔳 Four Corners</option>
                                    </optgroup>

                                    <optgroup label="Pattern Recognition">
                                        <option value="star">⭐ Hidden Shapes</option>
                                        <option value="constellation">✨ Broken Constellation</option>
                                    </optgroup>

                                    <optgroup label="Real World">
                                        <option value="europe">🌍 Europe Map</option>
                                    </optgroup>
                                </select>

                                <div className={styles.customGenRow}>
                                    <input
                                        type="number"
                                        min="5"
                                        max="50"
                                        value={customPointCount}
                                        onChange={(e) => setCustomPointCount(Math.min(50, Math.max(5, parseInt(e.target.value) || 5)))}
                                        className={styles.numberInput}
                                    />
                                    <Button
                                        style={["secondary", "fullWidth"]}
                                        label="GENERATE RANDOM"
                                        onClick={() => generatePoints('random', customPointCount)}
                                    />
                                </div>
                            </div>
                        </div>

                        {algorithm !== 'manual' && (
                            <div className={styles.controlPanel}>
                                <h3>SPEED: {state.speed}%</h3>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={state.speed}
                                    onChange={(e) => setState(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
                                    disabled={state.isRunning}
                                    className={styles.slider}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}