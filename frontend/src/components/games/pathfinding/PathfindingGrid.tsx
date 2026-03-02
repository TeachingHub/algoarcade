import { useRef, useCallback } from 'react';
import type { Cell } from '@/types/games/pathfinding';
import { ROWS, COLS, DEFAULT_START, DEFAULT_END } from '@/utils/pathfinding';
import styles from '@/styles/components/games/pathfinding/PathfindingGrid.module.css';

interface PathfindingGridProps {
    grid: Cell[][];
    manualPath: { row: number; col: number }[];
    isRunning: boolean;
    onCellClick: (row: number, col: number) => void;
    onCellDrag: (row: number, col: number) => void;
}

export default function PathfindingGrid({
    grid,
    manualPath,
    onCellClick,
    onCellDrag,
}: PathfindingGridProps) {
    const isDragging = useRef(false);

    const handleMouseDown = useCallback((row: number, col: number) => {
        isDragging.current = true;
        onCellClick(row, col);
    }, [onCellClick]);

    const handleMouseEnter = useCallback((row: number, col: number) => {
        if (isDragging.current) {
            onCellDrag(row, col);
        }
    }, [onCellDrag]);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    // Build a set for quick manual-path lookup
    const manualPathSet = new Set(manualPath.map(p => p.row * COLS + p.col));

    return (
        <div
            className={styles.gridContainer}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                className={styles.grid}
                style={{
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                }}
            >
                {grid.map((row, r) =>
                    row.map((cell, c) => {
                        const isManual = manualPathSet.has(r * COLS + c);
                        const isStart = r === DEFAULT_START.row && c === DEFAULT_START.col;
                        const isEnd = r === DEFAULT_END.row && c === DEFAULT_END.col;

                        let cellClass = styles.cell;
                        if (isStart) cellClass += ` ${styles.start}`;
                        else if (isEnd) cellClass += ` ${styles.end}`;
                        else if (cell.type === 'wall') cellClass += ` ${styles.wall}`;
                        else if (cell.type === 'path') cellClass += ` ${styles.path}`;
                        else if (isManual) cellClass += ` ${styles.manualPath}`;
                        else if (cell.type === 'visited') cellClass += ` ${styles.visited}`;

                        return (
                            <div
                                key={`${r}-${c}`}
                                className={cellClass}
                                onMouseDown={() => handleMouseDown(r, c)}
                                onMouseEnter={() => handleMouseEnter(r, c)}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}
