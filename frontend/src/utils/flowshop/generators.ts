import type { FlowshopInstance, Job } from "@/types/games/flowshop";
import { exampleJobs, exampleMachines } from "./jobs";


export const generateRandomGame = (numJobs: number, minOperationsDuration: number, maxOperationDuration: number): FlowshopInstance => {
    const jobs: Job[] = [];

    const defaultJobs = Object.values(exampleJobs).flat();
    const defaultMachines = Object.values(exampleMachines).flat();

    for (let i = 0; i < numJobs; i++) {
        const operations: number[] = [];

        for (let j = 0; j < defaultMachines.length; j++) {
            const duration = Math.floor(Math.random() * (maxOperationDuration - minOperationsDuration + 1) + minOperationsDuration);
            operations[j] = duration;
        }

        const randomDefaultJob = defaultJobs[Math.floor(Math.random() * defaultJobs.length)];

        const job: Job = {
            id: i,
            name: randomDefaultJob.name,
            operationsTimes: operations,
            icon: randomDefaultJob.icon
        }
        jobs.push(job);
    }

    return {
        jobs,
        author: "Random generator"
    };
}