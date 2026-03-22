import { useState, useCallback, useRef } from 'react';
import type { AlgorithmType, Cell, PathfindingState } from '@/types/games/pathfinding';
import {
    createEmptyGrid,
    resetGridForSolve,
    generateMaze,
    generateRandomWalls,
    findStart,
    findEnd,
    type SolveStep,
} from '@/utils/pathfinding';
import { getAlgorithm, ALGORITHM_LABELS } from '@/utils/pathfinding/algorithms';

export type InteractionMode = 'wall' | 'erase' | 'manual' | 'visualize';

export interface PathfindingResult {
    won: boolean;
    userSteps: number;
    algoSteps: number;
    algoName: string;
}

// ─── Shared logic: extend manual path ────────────────────────────

function tryExtendManualPath(
    prev: { row: number; col: number }[],
    row: number,
    col: number,
    grid: Cell[][],
): { row: number; col: number }[] {
    // First cell must be the start
    if (prev.length === 0) {
        const start = findStart(grid);
        if (!start || row !== start.row || col !== start.col) return prev;
        return [{ row, col }];
    }

    // Undo: click on the second-to-last cell
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

    // Can't cross walls
    if (grid[row][col].type === 'wall') return prev;

    // Can't revisit
    if (prev.some(p => p.row === row && p.col === col)) return prev;

    return [...prev, { row, col }];
}

// ─── Hook ────────────────────────────────────────────────────────

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
    const [comparisonAlgorithm, setComparisonAlgorithm] = useState<AlgorithmType>('astar');
    const [mode, setMode] = useState<InteractionMode>('wall');
    const [manualPath, setManualPath] = useState<{ row: number; col: number }[]>([]);
    const [algoComparisonPath, setAlgoComparisonPath] = useState<{ row: number; col: number }[] | null>(null);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [gameResult, setGameResult] = useState<PathfindingResult | null>(null);

    const animationRef = useRef<number | null>(null);
    const speedRef = useRef(state.speed);
    const draggingSpecialRef = useRef<'start' | 'end' | null>(null);
    speedRef.current = state.speed;

    // ─── Helper to reset transient state ─────────────────────────

    const clearResults = useCallback(() => {
        setResultMessage(null);
        setGameResult(null);
        setAlgoComparisonPath(null);
    }, []);

    // ─── Cell click ──────────────────────────────────────────────

    const handleCellInteraction = useCallback((row: number, col: number) => {
        if (state.isRunning) return;

        const cell = state.grid[row][col];

        // ── Manual path mode ──
        if (mode === 'manual') {
            if (state.isSolved) return;
            if (cell.type === 'wall') return;
            setManualPath(prev => tryExtendManualPath(prev, row, col, state.grid));
            return;
        }

        // ── Start/end: begin drag ──
        if (cell.type === 'start' || cell.type === 'end') {
            draggingSpecialRef.current = cell.type;
            return;
        }

        // ── Wall / Erase mode ──
        if (mode === 'visualize') return;
        setState(prev => {
            const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
            if (mode === 'wall') {
                newGrid[row][col].type = newGrid[row][col].type === 'wall' ? 'empty' : 'wall';
            } else if (mode === 'erase') {
                newGrid[row][col].type = 'empty';
            }
            return { ...prev, grid: newGrid, isSolved: false, visitedCount: 0, pathLength: 0 };
        });

        clearResults();
    }, [state.isRunning, state.grid, state.isSolved, mode, clearResults]);

    // ─── Cell drag ───────────────────────────────────────────────

    const handleCellDrag = useCallback((row: number, col: number) => {
        if (state.isRunning) return;

        // ── Dragging start or end ──
        if (draggingSpecialRef.current) {
            setState(prev => {
                const target = prev.grid[row][col].type;
                if (target === 'wall' || target === 'start' || target === 'end') return prev;

                const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
                // Clear old position
                for (const gridRow of newGrid) {
                    for (const cell of gridRow) {
                        if (cell.type === draggingSpecialRef.current) {
                            cell.type = 'empty';
                        }
                    }
                }
                // Set new position
                newGrid[row][col].type = draggingSpecialRef.current!;
                return { ...prev, grid: newGrid, isSolved: false, visitedCount: 0, pathLength: 0 };
            });
            setManualPath([]);
            clearResults();
            return;
        }

        // ── Manual path drag ──
        if (mode === 'manual') {
            if (state.isSolved) return;
            setManualPath(prev => tryExtendManualPath(prev, row, col, state.grid));
            return;
        }

        // ── Wall / Erase drag ──
        if (mode === 'visualize') return;
        const cell = state.grid[row][col];
        if (cell.type === 'start' || cell.type === 'end') return;

        setState(prev => {
            const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
            newGrid[row][col].type = mode === 'wall' ? 'wall' : 'empty';
            return { ...prev, grid: newGrid, isSolved: false };
        });

        clearResults();
    }, [state.isRunning, state.grid, state.isSolved, mode, clearResults]);

    // ─── Drag end ────────────────────────────────────────────────

    const handleDragEnd = useCallback(() => {
        draggingSpecialRef.current = null;
    }, []);

    // ─── Submit manual path (with algorithm comparison) ──────────

    const submitManualPath = useCallback(() => {
        if (manualPath.length < 2) return;

        const end = findEnd(state.grid);
        if (!end) return;

        const last = manualPath[manualPath.length - 1];
        if (last.row !== end.row || last.col !== end.col) {
            setResultMessage("Your path must reach the destination!");
            return;
        }

        // Run selected comparison algorithm silently
        const algorithmFn = getAlgorithm(comparisonAlgorithm);
        const generator = algorithmFn(state.grid);
        let algoPathLength = 0;
        let algoPath: { row: number; col: number }[] = [];
        let step = generator.next();
        while (!step.done) {
            const s: SolveStep = step.value;
            if (s.type === 'path') {
                algoPath = s.cells;
            }
            if (s.type === 'done') {
                algoPathLength = s.pathLength;
                break;
            }
            step = generator.next();
        }

        const userSteps = manualPath.length;
        const won = algoPathLength === 0 || userSteps <= algoPathLength;

        // Paint user's path on the grid
        setState(prev => {
            const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
            for (const p of manualPath) {
                if (newGrid[p.row][p.col].type !== 'start' && newGrid[p.row][p.col].type !== 'end') {
                    newGrid[p.row][p.col].type = 'path';
                }
            }
            return { ...prev, grid: newGrid, isSolved: true, pathLength: userSteps };
        });

        // Store algo comparison path for overlay rendering
        setAlgoComparisonPath(algoPath);

        setGameResult({
            won,
            userSteps,
            algoSteps: algoPathLength,
            algoName: ALGORITHM_LABELS[comparisonAlgorithm],
        });
    }, [manualPath, state.grid, comparisonAlgorithm]);

    // ─── Run algorithm (animated) ────────────────────────────────

    const runAlgorithm = useCallback(() => {
        if (state.isRunning) return;

        setManualPath([]);
        clearResults();

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
        const animGrid = cleanGrid.map(r => r.map(c => ({ ...c })));

        const tick = () => {
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

            animationRef.current = window.setTimeout(tick, Math.max(1, 101 - speedRef.current));
        };

        animationRef.current = window.setTimeout(tick, 0);
    }, [state.grid, state.isRunning, algorithm, clearResults]);

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
        clearResults();
    }, [stopAlgorithm, clearResults]);

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
        clearResults();
    }, [stopAlgorithm, clearResults]);

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
        clearResults();
    }, [stopAlgorithm, clearResults]);

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
        clearResults();
    }, [stopAlgorithm, clearResults]);

    return {
        state,
        algorithm,
        setAlgorithm,
        comparisonAlgorithm,
        setComparisonAlgorithm,
        mode,
        setMode,
        manualPath,
        algoComparisonPath,
        resultMessage,
        gameResult,
        actions: {
            handleCellInteraction,
            handleCellDrag,
            handleDragEnd,
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
