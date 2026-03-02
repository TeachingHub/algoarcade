export type CellType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'path' | 'current';

export interface Cell {
    row: number;
    col: number;
    type: CellType;
    /** g-cost: distance from start */
    g: number;
    /** h-cost: heuristic distance to end */
    h: number;
    /** f-cost: g + h */
    f: number;
    parent: { row: number; col: number } | null;
}

export type AlgorithmType = 'astar' | 'dijkstra' | 'bfs' | 'dfs';

export interface PathfindingState {
    grid: Cell[][];
    isRunning: boolean;
    isSolved: boolean;
    visitedCount: number;
    pathLength: number;
    speed: number;
}
