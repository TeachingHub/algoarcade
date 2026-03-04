import type { Cell, AlgorithmType } from '@/types/games/pathfinding';
import {
    COLS,
    resetGridForSolve,
    getNeighborCoords,
    manhattan,
    reconstructPath,
    findStart,
    findEnd,
    type SolveStep,
} from './index';

// ─── A* Search ───────────────────────────────────────────────────

export function* astar(gridInput: Cell[][]): Generator<SolveStep> {
    const grid = resetGridForSolve(gridInput);
    const start = findStart(grid);
    const end = findEnd(grid);

    if (!start || !end) {
        yield { type: 'done', found: false, visitedCount: 0, pathLength: 0 };
        return;
    }

    const { row: startR, col: startC } = start;
    const { row: endR, col: endC } = end;

    const open: { row: number; col: number }[] = [{ row: startR, col: startC }];
    const closed = new Set<number>();
    grid[startR][startC].g = 0;
    grid[startR][startC].h = manhattan(startR, startC, endR, endC);
    grid[startR][startC].f = grid[startR][startC].h;
    let visitedCount = 0;

    while (open.length > 0) {
        open.sort((a, b) =>
            grid[a.row][a.col].f - grid[b.row][b.col].f ||
            grid[a.row][a.col].h - grid[b.row][b.col].h
        );
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
    const start = findStart(grid);
    const end = findEnd(grid);

    if (!start || !end) {
        yield { type: 'done', found: false, visitedCount: 0, pathLength: 0 };
        return;
    }

    const { row: startR, col: startC } = start;
    const { row: endR, col: endC } = end;

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
    const start = findStart(grid);
    const end = findEnd(grid);

    if (!start || !end) {
        yield { type: 'done', found: false, visitedCount: 0, pathLength: 0 };
        return;
    }

    const { row: startR, col: startC } = start;
    const { row: endR, col: endC } = end;

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
    const start = findStart(grid);
    const end = findEnd(grid);

    if (!start || !end) {
        yield { type: 'done', found: false, visitedCount: 0, pathLength: 0 };
        return;
    }

    const { row: startR, col: startC } = start;
    const { row: endR, col: endC } = end;

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

// ─── Algorithm Labels ────────────────────────────────────────────

export const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
    astar: 'A*',
    dijkstra: 'Dijkstra',
    bfs: 'BFS',
    dfs: 'DFS',
};
