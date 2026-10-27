const tspGenerator = require("./tsp");
const knapsackGenerator = require("./knapsack");

const dailyChallengeGenerators = [
    tspGenerator,
    knapsackGenerator,
];

module.exports = {
    dailyChallengeGenerators
};