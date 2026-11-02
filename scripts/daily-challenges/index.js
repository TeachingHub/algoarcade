const tspGenerator = require("./tsp");
const knapsackGenerator = require("./knapsack");
const pathfindingGenerator = require("./pathfinding");

const dailyChallengeGenerators = [
    tspGenerator,
    knapsackGenerator,
    pathfindingGenerator,
];

module.exports = {
    dailyChallengeGenerators
};