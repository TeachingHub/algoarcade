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

export const dynamicKnapsack = (items: KnapsackItem[], maxWeight: number): KnapsackSolution => {
    if (items.length === 0 || maxWeight <= 0) {
        return {items: [], solutionValue: 0};
    }

    const n = items.length;

    const dp: number[][] = Array.from(
        { length: n + 1 },
        () => Array(maxWeight + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {
        const item = items[i - 1];

        for (let w = 0; w <= maxWeight; w++) {
            // Not include the item
            dp[i][w] = dp[i - 1][w];

            //Include the item
            if (item.weight <= w) {
                dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - item.weight] + item.value);
            }
        }
    }

    const solutionItemsIds: number[] = [];
    let w = maxWeight;

    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            const item = items[i - 1];

            solutionItemsIds.push(item.id);
            w -= item.weight;
        }
    }

    solutionItemsIds.reverse();

    return {
        items: solutionItemsIds,
        solutionValue: dp[n][maxWeight]
    }
};

export const backtrackingKnapsack = (items: KnapsackItem[], maxWeight: number): KnapsackSolution => {
    if (items.length === 0 || maxWeight <= 0) {
        return {items: [], solutionValue: 0};
    }

    let bestValue = 0;
    let bestItemsIds: number[] = [];

    const currentItemsIds: number[] = [];

    const backtrack = (index: number, currentWeight: number, currentValue: number): void => {
        // Base case: all items have been considered
        if (index === items.length) {
            if (currentValue > bestValue) {
                bestValue = currentValue;
                bestItemsIds = [...currentItemsIds];
            }
            return;
        }

        const item = items[index];

        // Option 1: include the item if it fits
        if (currentWeight + item.weight <= maxWeight) {
            currentItemsIds.push(item.id);

            backtrack(index + 1, currentWeight + item.weight, currentValue + item.value);

            // Undo the choice
            currentItemsIds.pop();
        }

        // Option 2: Not include the item
        backtrack(index + 1, currentWeight, currentValue);

    };

    backtrack(0, 0, 0);

    return {
        items: bestItemsIds,
        solutionValue: bestValue
    };
    
};

export const binaryKnapsack = (items: KnapsackItem[], maxWeight: number): KnapsackSolution => {
    if (items.length === 0 || maxWeight <= 0) {
        return {items: [], solutionValue: 0};
    }

    const n = items.length;

    const dpCost = n * maxWeight;

    let backtrackingCost = n < 53 ? 2 ** (n + 1) - 1 : Number.MAX_SAFE_INTEGER;

    if (dpCost <= backtrackingCost) {
        return dynamicKnapsack(items, maxWeight);
    } else {
        return backtrackingKnapsack(items, maxWeight);
    }
}