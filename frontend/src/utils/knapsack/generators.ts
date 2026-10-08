import type { KnapsackInstance, KnapsackItem } from "@/types/games/knapsack";
import { itemCategories } from "./items";


export const generateRandomGame = (numItems: number, minItemsWeight: number, maxItemWieght: number): KnapsackInstance => {
    const items: KnapsackItem[] = [];
    let accumulatedWeight = 0;
    const factor = Number((Math.random() * 4 + 1).toFixed(2)); //Random factor between 1 and 5

    for (let i = 0; i < numItems; i++) {
        const weight = Math.floor(Math.random() * (maxItemWieght - minItemsWeight + 1) + minItemsWeight);
        accumulatedWeight += weight;
        const baseValue = weight * factor;
        const variation = 0.7 + Math.random() * 0.6; //Random variation +- 30%
        const value = Math.round((baseValue * variation));

        const defaultItems = Object.values(itemCategories).flat();
        const randomDefaultItem = defaultItems[Math.floor(Math.random() * defaultItems.length)];

        const item: KnapsackItem = {
            id: i,
            name: randomDefaultItem.name,
            weight,
            value,
            icon: randomDefaultItem.icon
        }
        items.push(item);
    }

    const maxWeightPercentage = 0.30 + Math.random() * 0.55;
    const maxWeight = Math.round(accumulatedWeight * maxWeightPercentage); //Max weight between 30% and 85% of all items weight

    return {
        items,
        maxWeight,
        author: "Random generator"
    };
}