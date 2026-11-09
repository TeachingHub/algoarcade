import type { Job, FlowshopSolution } from "@/types/games/flowshop";
import { calculateSolutionMakespan } from "./math";

// Brute force algorithm, (best algorithm for small number of jobs (<= 8))
export const flowshopAlgorithm = (jobs: Job[]): FlowshopSolution => {
    if (jobs.length === 0) return { orderedJobs: [], solutionMakespan: 0};
    
    let bestOrder: number[] = [];
    let bestMakespan = Infinity;

    const evaluateOrder = (order: number[]) => {
        const makespan = calculateSolutionMakespan(jobs, order);

        if (makespan < bestMakespan) {
            bestMakespan = makespan;
            bestOrder = [...order];
        }
    };

    const generatePermutations = (remainingJobsIds: number[], currentOrder: number[]) => {
        if (remainingJobsIds.length === 0) {
            evaluateOrder(currentOrder);
            return;
        }

        for (let index = 0; index < remainingJobsIds.length; index++) {
            const jobId = remainingJobsIds[index];

            generatePermutations([...remainingJobsIds.slice(0, index), ...remainingJobsIds.slice(index + 1)], [...currentOrder, jobId]);
        }
    };

    generatePermutations(jobs.map(job => job.id), []);

    return { orderedJobs: bestOrder, solutionMakespan: bestMakespan};
};
