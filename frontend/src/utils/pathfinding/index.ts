import type { Cell, CellType, AlgorithmType } from '@/types/games/pathfinding';

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

// ─── Neighbors ───────────────────────────────────────────────────

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function getNeighborCoords(row: number, col: number): { row: number; col: number }[] {
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

function manhattan(ar: number, ac: number, br: number, bc: number): number {
    return Math.abs(ar - br) + Math.abs(ac - bc);
}

// ─── Step Types ──────────────────────────────────────────────────

export type SolveStep =
    | { type: 'visit'; row: number; col: number }
    | { type: 'path'; cells: { row: number; col: number }[] }
    | { type: 'done'; found: boolean; visitedCount: number; pathLength: number };

// ─── Path Reconstruction ─────────────────────────────────────────

function reconstructPath(grid: Cell[][], endRow: number, endCol: number): { row: number; col: number }[] {
    const path: { row: number; col: number }[] = [];
    let cur: { row: number; col: number } | null = { row: endRow, col: endCol };
    while (cur) {
        path.unshift(cur);
        cur = grid[cur.row][cur.col].parent;
    }
    return path;
}

// ─── A* Search ───────────────────────────────────────────────────

export function* astar(gridInput: Cell[][]): Generator<SolveStep> {
    const grid = resetGridForSolve(gridInput);
    const startR = DEFAULT_START.row, startC = DEFAULT_START.col;
    const endR = DEFAULT_END.row, endC = DEFAULT_END.col;

    if (grid[startR][startC].type !== 'start' || grid[endR][endC].type !== 'end') {
        yield { type: 'done', found: false, visitedCount: 0, pathLength: 0 };
        return;
    }

    // Open set as array (sorted by f). For simplicity, not using a heap.
    const open: { row: number; col: number }[] = [{ row: startR, col: startC }];
    const closed = new Set<number>();
    grid[startR][startC].g = 0;
    grid[startR][startC].h = manhattan(startR, startC, endR, endC);
    grid[startR][startC].f = grid[startR][startC].h;
    let visitedCount = 0;

    while (open.length > 0) {
        open.sort((a, b) => grid[a.row][a.col].f - grid[b.row][b.col].f || grid[a.row][a.col].h - grid[b.row][b.col].h);
        const cur = open.shift()!;
        const key = cur.row * COLS + cur.col;

        if (closed.has(key)) continue;
        closed.add(key);

        const cell = grid[cur.row][cur.col];
        if (cell.type !== 'start' && cell.type !== 'end') {
            visitedCount++;
            yield { type: 'visit', row: cur.row, col: cur.col };
        }

        if (cur.row === endR && cur.col === endC) {
            const path = reconstructPath(grid, endR, endC);
            yield { type: 'path', cells: path };
            yield { type: 'done', found: true, visitedCount, pathLength: path.length };
            return;
        }

        for (const nb of getNeighborCoords(cur.row, cur.col)) {
            if (closed.has(nb.row * COLS + nb.col)) continue;
            if (grid[nb.row][nb.col].type === 'wall') continue;

            const tentativeG = cell.g + 1;
            if (tentativeG < grid[nb.row][nb.col].g) {
                grid[nb.row][nb.col].g = tentativeG;
                grid[nb.row][nb.col].h = manhattan(nb.row, nb.col, endR, endC);
                grid[nb.row][nb.col].f = tentativeG + grid[nb.row][nb.col].h;
                grid[nb.row][nb.col].parent = { row: cur.row, col: cur.col };
                open.push(nb);
            }
        }
    }

    yield { type: 'done', found: false, visitedCount, pathLength: 0 };
}

// ─── Dijkstra ────────────────────────────────────────────────────

export function* dijkstra(gridInput: Cell[][]): Generator<SolveStep> {
    const grid = resetGridForSolve(gridInput);
    const startR = DEFAULT_START.row, startC = DEFAULT_START.col;
    const endR = DEFAULT_END.row, endC = DEFAULT_END.col;

    const open: { row: number; col: number }[] = [{ row: startR, col: startC }];
    const closed = new Set<number>();
    grid[startR][startC].g = 0;
    grid[startR][startC].f = 0;
    let visitedCount = 0;

    while (open.length > 0) {
        open.sort((a, b) => grid[a.row][a.col].g - grid[b.row][b.col].g);
        const cur = open.shift()!;
        const key = cur.row * COLS + cur.col;

        if (closed.has(key)) continue;
        closed.add(key);

        const cell = grid[cur.row][cur.col];
        if (cell.type !== 'start' && cell.type !== 'end') {
            visitedCount++;
            yield { type: 'visit', row: cur.row, col: cur.col };
        }

        if (cur.row === endR && cur.col === endC) {
            const path = reconstructPath(grid, endR, endC);
            yield { type: 'path', cells: path };
            yield { type: 'done', found: true, visitedCount, pathLength: path.length };
            return;
        }

        for (const nb of getNeighborCoords(cur.row, cur.col)) {
            if (closed.has(nb.row * COLS + nb.col)) continue;
            if (grid[nb.row][nb.col].type === 'wall') continue;

            const tentativeG = cell.g + 1;
            if (tentativeG < grid[nb.row][nb.col].g) {
                grid[nb.row][nb.col].g = tentativeG;
                grid[nb.row][nb.col].f = tentativeG;
                grid[nb.row][nb.col].parent = { row: cur.row, col: cur.col };
                open.push(nb);
            }
        }
    }

    yield { type: 'done', found: false, visitedCount, pathLength: 0 };
}

// ─── BFS ─────────────────────────────────────────────────────────

export function* bfs(gridInput: Cell[][]): Generator<SolveStep> {
    const grid = resetGridForSolve(gridInput);
    const startR = DEFAULT_START.row, startC = DEFAULT_START.col;
    const endR = DEFAULT_END.row, endC = DEFAULT_END.col;

    const queue: { row: number; col: number }[] = [{ row: startR, col: startC }];
    const visited = new Set<number>([startR * COLS + startC]);
    let visitedCount = 0;

    while (queue.length > 0) {
        const cur = queue.shift()!;
        const cell = grid[cur.row][cur.col];

        if (cell.type !== 'start' && cell.type !== 'end') {
            visitedCount++;
            yield { type: 'visit', row: cur.row, col: cur.col };
        }

        if (cur.row === endR && cur.col === endC) {
            const path = reconstructPath(grid, endR, endC);
            yield { type: 'path', cells: path };
            yield { type: 'done', found: true, visitedCount, pathLength: path.length };
            return;
        }

        for (const nb of getNeighborCoords(cur.row, cur.col)) {
            const key = nb.row * COLS + nb.col;
            if (visited.has(key)) continue;
            if (grid[nb.row][nb.col].type === 'wall') continue;

            visited.add(key);
            grid[nb.row][nb.col].parent = { row: cur.row, col: cur.col };
            queue.push(nb);
        }
    }

    yield { type: 'done', found: false, visitedCount, pathLength: 0 };
}

// ─── DFS ─────────────────────────────────────────────────────────

export function* dfs(gridInput: Cell[][]): Generator<SolveStep> {
    const grid = resetGridForSolve(gridInput);
    const startR = DEFAULT_START.row, startC = DEFAULT_START.col;
    const endR = DEFAULT_END.row, endC = DEFAULT_END.col;

    const stack: { row: number; col: number }[] = [{ row: startR, col: startC }];
    const visited = new Set<number>([startR * COLS + startC]);
    let visitedCount = 0;

    while (stack.length > 0) {
        const cur = stack.pop()!;
        const cell = grid[cur.row][cur.col];

        if (cell.type !== 'start' && cell.type !== 'end') {
            visitedCount++;
            yield { type: 'visit', row: cur.row, col: cur.col };
        }

        if (cur.row === endR && cur.col === endC) {
            const path = reconstructPath(grid, endR, endC);
            yield { type: 'path', cells: path };
            yield { type: 'done', found: true, visitedCount, pathLength: path.length };
            return;
        }

        for (const nb of getNeighborCoords(cur.row, cur.col)) {
            const key = nb.row * COLS + nb.col;
            if (visited.has(key)) continue;
            if (grid[nb.row][nb.col].type === 'wall') continue;

            visited.add(key);
            grid[nb.row][nb.col].parent = { row: cur.row, col: cur.col };
            stack.push(nb);
        }
    }

    yield { type: 'done', found: false, visitedCount, pathLength: 0 };
}

// ─── Algorithm Dispatcher ────────────────────────────────────────

export function getAlgorithm(type: AlgorithmType): (grid: Cell[][]) => Generator<SolveStep> {
    switch (type) {
        case 'astar': return astar;
        case 'dijkstra': return dijkstra;
        case 'bfs': return bfs;
        case 'dfs': return dfs;
    }
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
    const startR = DEFAULT_START.row, startC = DEFAULT_START.col;
    const endR = DEFAULT_END.row, endC = DEFAULT_END.col;

    const queue = [{ row: startR, col: startC }];
    const visited = new Set<number>([startR * COLS + startC]);

    while (queue.length > 0) {
        const cur = queue.shift()!;
        if (cur.row === endR && cur.col === endC) return true;

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

// ─── Manual Path Validation ──────────────────────────────────────

/** Checks that a user-drawn path is continuous, doesn't cross walls, starts at start and ends at end */
export function isValidManualPath(grid: Cell[][], path: { row: number; col: number }[]): boolean {
    if (path.length < 2) return false;

    const s = path[0];
    const e = path[path.length - 1];
    if (s.row !== DEFAULT_START.row || s.col !== DEFAULT_START.col) return false;
    if (e.row !== DEFAULT_END.row || e.col !== DEFAULT_END.col) return false;

    for (let i = 1; i < path.length; i++) {
        const dr = Math.abs(path[i].row - path[i - 1].row);
        const dc = Math.abs(path[i].col - path[i - 1].col);
        if (dr + dc !== 1) return false;
        if (grid[path[i].row][path[i].col].type === 'wall') return false;
    }

    return true;
}
