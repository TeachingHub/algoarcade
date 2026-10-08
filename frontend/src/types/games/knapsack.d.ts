export interface KnapsackItem {
    id: number;
    name: string;
    value: number;
    weight: number;
    icon?: string;
}

export interface KnapsackState {
    items: KnapsackItem[];
    maxWeight: number;
    freeWeight: number;
    bestSolution: number[]; // Array of items IDs, last one is the divided one if needed
    currentSelection: number[];
    bestValue: number;
    isRunning: boolean;
    speed?: number;
}

export interface KnapsackInstance {
    items: KnapsackItem[];
    maxWeight: number;
    author: string;
}

export interface KnapsackSolution {
    items: number[];
    lastItemFraction: number;
    solutionValue: number;
}