import { useRef, useCallback } from 'react';
import type { Cell } from '@/types/games/pathfinding';
import { ROWS, COLS } from '@/utils/pathfinding';
import styles from '@/styles/components/games/pathfinding/PathfindingGrid.module.css';

interface PathfindingGridProps {
    grid: Cell[][];
    manualPath: { row: number; col: number }[];
    algoComparisonPath: { row: number; col: number }[] | null;
    isRunning: boolean;
    onCellClick: (row: number, col: number) => void;
    onCellDrag: (row: number, col: number) => void;
    onDragEnd: () => void;
}

export default function PathfindingGrid({
    grid,
    manualPath,
    algoComparisonPath,
    onCellClick,
    onCellDrag,
    onDragEnd,
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
        onDragEnd();
    }, [onDragEnd]);

    // Build lookup sets for fast rendering
    const manualPathSet = new Set(manualPath.map(p => p.row * COLS + p.col));
    const algoPathSet = algoComparisonPath
        ? new Set(algoComparisonPath.map(p => p.row * COLS + p.col))
        : null;

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
                        const key = r * COLS + c;
                        const isManual = manualPathSet.has(key);
                        const isAlgoOverlay = algoPathSet?.has(key) ?? false;

                        let cellClass = styles.cell;

                        if (cell.type === 'start') cellClass += ` ${styles.start}`;
                        else if (cell.type === 'end') cellClass += ` ${styles.end}`;
                        else if (cell.type === 'wall') cellClass += ` ${styles.wall}`;
                        else if (cell.type === 'path' && isAlgoOverlay) cellClass += ` ${styles.pathOverlap}`;
                        else if (cell.type === 'path') cellClass += ` ${styles.path}`;
                        else if (isAlgoOverlay) cellClass += ` ${styles.algoPath}`;
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
