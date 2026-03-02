import { useState, useCallback, useRef } from 'react';
import type { AlgorithmType, PathfindingState } from '@/types/games/pathfinding';
import {
    createEmptyGrid,
    resetGridForSolve,
    generateMaze,
    generateRandomWalls,
    getAlgorithm,
    DEFAULT_START,
    DEFAULT_END,
    type SolveStep
} from '@/utils/pathfinding';

export type InteractionMode = 'wall' | 'erase' | 'manual';

export function usePathfinding() {
    const [state, setState] = useState<PathfindingState>({
        grid: createEmptyGrid(),
        isRunning: false,
        isSolved: false,
        visitedCount: 0,
        pathLength: 0,
        speed: 10,
    });

    const [algorithm, setAlgorithm] = useState<AlgorithmType>('astar');
    const [mode, setMode] = useState<InteractionMode>('wall');
    const [manualPath, setManualPath] = useState<{ row: number; col: number }[]>([]);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    const animationRef = useRef<number | null>(null);
    const speedRef = useRef(state.speed);
    speedRef.current = state.speed;

    // ─── Cell interaction (wall draw + manual path) ─────────────────

    const handleCellInteraction = useCallback((row: number, col: number) => {
        if (state.isRunning) return;

        const cell = state.grid[row][col];

        // ── Manual path mode ──
        if (mode === 'manual') {
            if (state.isSolved) return;
            if (cell.type === 'wall') return;

            setManualPath(prev => {
                // If path is empty, must start at start cell
                if (prev.length === 0) {
                    if (row !== DEFAULT_START.row || col !== DEFAULT_START.col) return prev;
                    return [{ row, col }];
                }

                // Allow going back one step (undo)
                if (prev.length >= 2) {
                    const prevStep = prev[prev.length - 2];
                    if (prevStep.row === row && prevStep.col === col) {
                        return prev.slice(0, -1);
                    }
                }

                // Must be adjacent to last step
                const last = prev[prev.length - 1];
                const dr = Math.abs(row - last.row);
                const dc = Math.abs(col - last.col);
                if (dr + dc !== 1) return prev;

                // Can't revisit
                if (prev.some(p => p.row === row && p.col === col)) return prev;

                return [...prev, { row, col }];
            });
            return;
        }

        // ── Wall / Erase mode — can't overwrite start or end ──
        if (cell.type === 'start' || cell.type === 'end') return;

        setState(prev => {
            const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));

            if (mode === 'wall') {
                newGrid[row][col].type = newGrid[row][col].type === 'wall' ? 'empty' : 'wall';
            } else if (mode === 'erase') {
                newGrid[row][col].type = 'empty';
            }

            return {
                ...prev,
                grid: newGrid,
                isSolved: false,
                visitedCount: 0,
                pathLength: 0,
            };
        });

        setResultMessage(null);
    }, [state.isRunning, state.grid, state.isSolved, mode]);

    // ─── Submit manual path ──────────────────────────────────────

    const submitManualPath = useCallback(() => {
        if (manualPath.length < 2) return;

        const last = manualPath[manualPath.length - 1];
        if (last.row !== DEFAULT_END.row || last.col !== DEFAULT_END.col) {
            setResultMessage("Your path must reach the destination!");
            return;
        }

        // Paint the path on the grid
        setState(prev => {
            const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
            for (const p of manualPath) {
                if (newGrid[p.row][p.col].type !== 'start' && newGrid[p.row][p.col].type !== 'end') {
                    newGrid[p.row][p.col].type = 'path';
                }
            }
            return {
                ...prev,
                grid: newGrid,
                isSolved: true,
                pathLength: manualPath.length,
            };
        });

        setResultMessage(`Path found! Length: ${manualPath.length} steps`);
    }, [manualPath]);

    // ─── Run algorithm ───────────────────────────────────────────

    const runAlgorithm = useCallback(() => {
        if (state.isRunning) return;

        // Clear previous result
        setResultMessage(null);
        setManualPath([]);

        // Reset grid visualization
        const cleanGrid = resetGridForSolve(state.grid);
        setState(prev => ({
            ...prev,
            grid: cleanGrid,
            isRunning: true,
            isSolved: false,
            visitedCount: 0,
            pathLength: 0,
        }));

        const algorithmFn = getAlgorithm(algorithm);
        const generator = algorithmFn(cleanGrid);

        // Create a mutable copy of the grid for animation
        const animGrid = cleanGrid.map(r => r.map(c => ({ ...c })));

        const step = () => {
            const result = generator.next();
            if (result.done) {
                setState(prev => ({ ...prev, isRunning: false }));
                return;
            }

            const s: SolveStep = result.value;

            if (s.type === 'visit') {
                if (animGrid[s.row][s.col].type !== 'start' && animGrid[s.row][s.col].type !== 'end') {
                    animGrid[s.row][s.col].type = 'visited';
                }
                setState(prev => ({
                    ...prev,
                    grid: animGrid.map(r => r.map(c => ({ ...c }))),
                    visitedCount: prev.visitedCount + 1,
                }));
            } else if (s.type === 'path') {
                for (const p of s.cells) {
                    if (animGrid[p.row][p.col].type !== 'start' && animGrid[p.row][p.col].type !== 'end') {
                        animGrid[p.row][p.col].type = 'path';
                    }
                }
                setState(prev => ({
                    ...prev,
                    grid: animGrid.map(r => r.map(c => ({ ...c }))),
                }));
            } else if (s.type === 'done') {
                setState(prev => ({
                    ...prev,
                    isRunning: false,
                    isSolved: true,
                    visitedCount: s.visitedCount,
                    pathLength: s.pathLength,
                }));
                if (s.found) {
                    setResultMessage(`Path found! Length: ${s.pathLength} · Visited: ${s.visitedCount} nodes`);
                } else {
                    setResultMessage("No path exists!");
                }
                return;
            }

            animationRef.current = window.setTimeout(step, Math.max(1, 101 - speedRef.current));
        };

        animationRef.current = window.setTimeout(step, 0);
    }, [state.grid, state.isRunning, algorithm]);

    // ─── Stop ────────────────────────────────────────────────────

    const stopAlgorithm = useCallback(() => {
        if (animationRef.current !== null) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
        setState(prev => ({ ...prev, isRunning: false }));
    }, []);

    // ─── Speed ───────────────────────────────────────────────────

    const setSpeed = useCallback((speed: number) => {
        speedRef.current = speed;
        setState(prev => ({ ...prev, speed }));
    }, []);

    // ─── Clear ───────────────────────────────────────────────────

    const clearBoard = useCallback(() => {
        stopAlgorithm();
        setState(prev => ({
            ...prev,
            grid: createEmptyGrid(),
            isSolved: false,
            visitedCount: 0,
            pathLength: 0,
        }));
        setManualPath([]);
        setResultMessage(null);
    }, [stopAlgorithm]);

    const clearVisualization = useCallback(() => {
        stopAlgorithm();
        setState(prev => ({
            ...prev,
            grid: resetGridForSolve(prev.grid),
            isSolved: false,
            visitedCount: 0,
            pathLength: 0,
        }));
        setManualPath([]);
        setResultMessage(null);
    }, [stopAlgorithm]);

    // ─── Generate ────────────────────────────────────────────────

    const genMaze = useCallback(() => {
        stopAlgorithm();
        setState(prev => ({
            ...prev,
            grid: generateMaze(),
            isSolved: false,
            visitedCount: 0,
            pathLength: 0,
        }));
        setManualPath([]);
        setResultMessage(null);
    }, [stopAlgorithm]);

    const genRandom = useCallback(() => {
        stopAlgorithm();
        setState(prev => ({
            ...prev,
            grid: generateRandomWalls(0.3),
            isSolved: false,
            visitedCount: 0,
            pathLength: 0,
        }));
        setManualPath([]);
        setResultMessage(null);
    }, [stopAlgorithm]);

    // ─── Batch draw (drag to draw walls) ─────────────────────────

    const handleCellDrag = useCallback((row: number, col: number) => {
        if (state.isRunning) return;
        if (mode === 'manual') return; // No drag in manual mode

        const cell = state.grid[row][col];
        if (cell.type === 'start' || cell.type === 'end') return;

        setState(prev => {
            const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
            newGrid[row][col].type = mode === 'wall' ? 'wall' : 'empty';
            return {
                ...prev,
                grid: newGrid,
                isSolved: false,
            };
        });

        setResultMessage(null);
    }, [state.isRunning, state.grid, mode]);

    return {
        state,
        algorithm,
        setAlgorithm,
        mode,
        setMode,
        manualPath,
        resultMessage,
        actions: {
            handleCellInteraction,
            handleCellDrag,
            runAlgorithm,
            stopAlgorithm,
            submitManualPath,
            clearBoard,
            clearVisualization,
            genMaze,
            genRandom,
            setSpeed,
        },
    };
}
