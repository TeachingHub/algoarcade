export interface Point {
    id: number;
    x: number;
    y: number;
}

export interface TSPState {
    points: Point[];
    bestPath: number[]; // Array of point IDs
    currentPath: number[];
    bestDistance: number;
    isRunning: boolean;
    speed: number;
}
