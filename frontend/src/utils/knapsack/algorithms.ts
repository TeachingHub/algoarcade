import type { KnapsackItem, KnapsackSolution } from "@/types/games/knapsack";

export const greedyKnapsack = (items: KnapsackItem[], maxWeight: number): KnapsackSolution => {
    if (items.length === 0) return {items: [], lastItemFraction: 0, solutionValue: 0};

    const sortedItems = [...items].sort(
        (a, b) => (b.value/b.weight) - (a.value/a.weight)
    );

    const solutionItemsIds: number[] = [];
    let freeWeight = maxWeight;
    let fraction = 1;
    let AlgorithmSolutionValue = 0;

    for (const item of sortedItems) {
        if (freeWeight <= 0) {break;}

        if (item.weight <= freeWeight) {
            solutionItemsIds.push(item.id);
            freeWeight -= item.weight;
            AlgorithmSolutionValue += item.value;
        } else {
            fraction = freeWeight / item.weight;
            solutionItemsIds.push(item.id);
            AlgorithmSolutionValue += item.value * fraction
            break;
        }
    }

    return {items: solutionItemsIds, lastItemFraction: fraction, solutionValue: AlgorithmSolutionValue}
};