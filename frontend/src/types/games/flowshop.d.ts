export interface Job {
    id: number;
    name: string;
    operationsTimes: number[];
    icon?: string;
}

export interface FlowshopState {
    jobs: Job[];
    bestSolution: number[]; // Array of ordered jobs
    currentOrder: number[];
    bestMakespan: number;
    isRunning: boolean;
}

export interface FlowshopInstance {
    jobs: Job[];
    author: string;
}

export interface FlowshopSolution {
    orderedJobs: number[];
    solutionMakespan: number;
}