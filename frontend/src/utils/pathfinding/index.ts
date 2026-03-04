import type { Cell, CellType } from '@/types/games/pathfinding';

// ─── Grid Constants ──────────────────────────────────────────────

export const ROWS = 21;
export const COLS = 41;
export const DEFAULT_START = { row: 10, col: 5 };
export const DEFAULT_END = { row: 10, col: 35 };

// ─── Grid Helpers ────────────────────────────────────────────────

export function createCell(row: number, col: number, type: CellType): Cell {
    return { row, col, type, g: Infinity, h: 0, f: Infinity, parent: null };
}

export function createEmptyGrid(): Cell[][] {
    const grid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < COLS; c++) {
            row.push(createCell(r, c, 'empty'));
        }
        grid.push(row);
    }
    grid[DEFAULT_START.row][DEFAULT_START.col].type = 'start';
    grid[DEFAULT_END.row][DEFAULT_END.col].type = 'end';
    return grid;
}

/** Keep walls, start, end — clear visited/path/current states and reset A* metadata */
export function resetGridForSolve(grid: Cell[][]): Cell[][] {
    return grid.map(row =>
        row.map(cell => ({
            ...cell,
            type: (cell.type === 'visited' || cell.type === 'path' || cell.type === 'current')
                ? 'empty' : cell.type,
            g: Infinity,
            h: 0,
            f: Infinity,
            parent: null,
        }))
    );
}

// ─── Cell Lookup ─────────────────────────────────────────────────

/** Find the position of a cell with the given type */
export function findCellOfType(grid: Cell[][], type: CellType): { row: number; col: number } | null {
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].type === type) return { row: r, col: c };
        }
    }
    return null;
}

export function findStart(grid: Cell[][]): { row: number; col: number } | null {
    return findCellOfType(grid, 'start');
}

export function findEnd(grid: Cell[][]): { row: number; col: number } | null {
    return findCellOfType(grid, 'end');
}

// ─── Neighbors ───────────────────────────────────────────────────

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export function getNeighborCoords(row: number, col: number): { row: number; col: number }[] {
    const out: { row: number; col: number }[] = [];
    for (const [dr, dc] of DIRS) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            out.push({ row: nr, col: nc });
        }
    }
    return out;
}

// ─── Heuristic ───────────────────────────────────────────────────

export function manhattan(ar: number, ac: number, br: number, bc: number): number {
    return Math.abs(ar - br) + Math.abs(ac - bc);
}

// ─── Step Types ──────────────────────────────────────────────────

export type SolveStep =
    | { type: 'visit'; row: number; col: number }
    | { type: 'path'; cells: { row: number; col: number }[] }
    | { type: 'done'; found: boolean; visitedCount: number; pathLength: number };

// ─── Path Reconstruction ─────────────────────────────────────────

export function reconstructPath(grid: Cell[][], endRow: number, endCol: number): { row: number; col: number }[] {
    const path: { row: number; col: number }[] = [];
    let cur: { row: number; col: number } | null = { row: endRow, col: endCol };
    while (cur) {
        path.unshift(cur);
        cur = grid[cur.row][cur.col].parent;
    }
    return path;
}

// ─── Maze Generation (Recursive Backtracking) ────────────────────

export function generateMaze(): Cell[][] {
    const grid = createEmptyGrid();

    // Fill everything with walls
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            grid[r][c].type = 'wall';
        }
    }

    // Carve passages from odd-indexed cells
    const carved = new Set<number>();

    function carve(r: number, c: number) {
        carved.add(r * COLS + c);
        grid[r][c].type = 'empty';

        const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]].sort(() => Math.random() - 0.5);

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !carved.has(nr * COLS + nc)) {
                // Carve the wall between current and neighbor
                grid[r + dr / 2][c + dc / 2].type = 'empty';
                carve(nr, nc);
            }
        }
    }

    carve(1, 1);

    // Place start and end
    grid[DEFAULT_START.row][DEFAULT_START.col].type = 'start';
    grid[DEFAULT_END.row][DEFAULT_END.col].type = 'end';

    // Ensure start and end are reachable (clear a neighbor if fully walled)
    for (const pos of [DEFAULT_START, DEFAULT_END]) {
        let hasOpen = false;
        for (const [dr, dc] of DIRS) {
            const nr = pos.row + dr;
            const nc = pos.col + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                const t = grid[nr][nc].type;
                if (t !== 'wall') { hasOpen = true; break; }
            }
        }
        if (!hasOpen) {
            const nc = pos.col + 1 < COLS ? pos.col + 1 : pos.col - 1;
            grid[pos.row][nc].type = 'empty';
        }
    }

    return grid;
}

// ─── Random Walls (with solvability check) ───────────────────────

export function generateRandomWalls(density: number = 0.3): Cell[][] {
    for (let attempt = 0; attempt < 50; attempt++) {
        const grid = createEmptyGrid();

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].type === 'empty' && Math.random() < density) {
                    grid[r][c].type = 'wall';
                }
            }
        }

        if (isSolvable(grid)) return grid;
    }

    return createEmptyGrid();
}

/** Quick BFS to verify start can reach end */
function isSolvable(grid: Cell[][]): boolean {
    const s = findStart(grid);
    const e = findEnd(grid);
    if (!s || !e) return false;

    const queue = [{ row: s.row, col: s.col }];
    const visited = new Set<number>([s.row * COLS + s.col]);

    while (queue.length > 0) {
        const cur = queue.shift()!;
        if (cur.row === e.row && cur.col === e.col) return true;

        for (const [dr, dc] of DIRS) {
            const nr = cur.row + dr;
            const nc = cur.col + dc;
            const key = nr * COLS + nc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(key) && grid[nr][nc].type !== 'wall') {
                visited.add(key);
                queue.push({ row: nr, col: nc });
            }
        }
    }

    return false;
}
