const tspGenerator = require("./tsp");
const knapsackGenerator = require("./knapsack");
const pathfindingGenerator = require("./pathfinding");
const flowshopGenerator = require("./flowshop");

const dailyChallengeGenerators = [
    tspGenerator,
    knapsackGenerator,
    pathfindingGenerator,
    flowshopGenerator
];

module.exports = {
    dailyChallengeGenerators
};