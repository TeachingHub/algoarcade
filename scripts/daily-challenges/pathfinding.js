const ROWS = 21;
const COLS = 41;
const DENSITY = 0.3;

const DIRECTIONS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];

function randomPosition() {
    return { row: Math.floor(Math.random() * ROWS), col: Math.floor(Math.random() * COLS)};
}

function generateStartAndEnd() {
    const start = randomPosition();
    let end = randomPosition();

    while (end.row === start.row && end.col === start.col) {
        end = randomPosition();
    }

    return { start, end };
}

function createEmptyGrid(start, end) {
    const grid = [];

    for (let row = 0; row < ROWS; row++) {
        const gridRow = [];

        for (let col = 0; col < COLS; col++) {
            gridRow.push("empty");
        }

        grid.push(gridRow);
    }

    grid[start.row][start.col] = "start";
    grid[end.row][end.col] = "end";

    return grid;
}

function isInsideGrid(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function isSolvable(grid, start, end) {
    const queue = [start];
    const visited = new Set([start.row * COLS + start.col]);

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.row === end.row && current.col === end.col) {
            return true;
        }

        for (const [rowOffset, colOffset] of DIRECTIONS) {
            const row = current.row + rowOffset;
            const col = current.col + colOffset;
            const key = row * COLS + col;

            if (
                isInsideGrid(row, col) &&
                !visited.has(key) &&
                grid[row][col] !== "wall"
            ) {
                visited.add(key);
                queue.push({ row, col });
            }
        }
    }

    return false;
}

function generateRandomWalls() {
    while (true) {
        const { start, end } = generateStartAndEnd();
        const grid = createEmptyGrid(start, end);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (grid[row][col] === "empty" && Math.random() < DENSITY) {
                    grid[row][col] = "wall";
                }
            }
        }

        if (isSolvable(grid, start, end)) {
            return grid;
        }
    }
}

function encodePathfindingInstance(author, grid) {
    return JSON.stringify([author, grid]);
}

function generate({ author = "system" } = {}) {
    const grid = generateRandomWalls();
    const data = encodePathfindingInstance(author, grid);

    return { data };
}

module.exports = {
    game: "pathfinding",
    collection: "pathfinding_daily_challenges",
    generate
};