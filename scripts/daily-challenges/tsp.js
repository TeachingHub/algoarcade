const DAILY_POINT_COUNT = 15;
const MARGIN = 0.05; // 5% margin from edges (normalized 0-1 coordinates)

function generateNormalizedRandomPoints(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        points.push({
            id: i,
            // Normalized coordinates between MARGIN and (1 - MARGIN)
            x: MARGIN + Math.random() * (1 - 2 * MARGIN),
            y: MARGIN + Math.random() * (1 - 2 * MARGIN),
        });
    }
    return points;
}


function encodeTSPInstance(author, points) {
    const pointsArray = points.map((p) => [p.id, p.x, p.y]);
    return JSON.stringify([author, pointsArray]);
}

function generate({ author = "system"} = {}) {
    const points = generateNormalizedRandomPoints(DAILY_POINT_COUNT);
    const data = encodeTSPInstance(author, points);

    return { data };
}

module.exports = {
    game: "tsp",
    collection: "tsp_daily_challenges",
    generate
};