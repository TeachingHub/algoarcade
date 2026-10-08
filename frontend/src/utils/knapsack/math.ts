import type { KnapsackItem } from "@/types/games/knapsack";

export const calculateSolutionValue = (items: KnapsackItem[], selectedItems: number[], maxWeight: number): number => {
    let totalValue = 0;
    let freeWeight = maxWeight;
    const itemsById = new Map(items.map(item => [item.id, item]));
    for (let i = 0; i < selectedItems.length; i++) {
        const itemId = selectedItems[i];
        const item = itemsById.get(itemId);

        if (!item) {continue;}
        
        if ((i !== selectedItems.length -1)) {
            totalValue += item.value;
            freeWeight -= item.weight;
        } else {
            if (item.weight <= freeWeight) {
                totalValue += item.value;
            } else {
                const fraction = freeWeight / item.weight;
                totalValue += item.value * fraction;
            }
        }
    }
    return totalValue;
}

export const formatTotalValue = (totalValue: number): string => {
    return Math.round(totalValue).toString();
};