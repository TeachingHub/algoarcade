import type { Job } from "@/types/games/flowshop";

export const calculateSolutionMakespan = (jobs: Job[], order: number[]): number => {
    if (jobs.length === 0 || order.length !== jobs.length) return Infinity;

    const jobsById = new Map(jobs.map(job => [job.id, job]));

    const orderedJobs = order.map(jobId => {
        const job = jobsById.get(jobId);

        if (!job) {
            throw new Error(`Job with id ${jobId} was not found`)
        }

        return job;
    });

    const machineCompletionTimes = Array(orderedJobs[0].operationsTimes.length).fill(0);

    for (const job of orderedJobs) {
        let previousMachineCompletion = 0;

        for (let machine = 0; machine < job.operationsTimes.length; machine++) {
            const startTime = Math.max(machineCompletionTimes[machine], previousMachineCompletion);

            const completionTime = startTime + job.operationsTimes[machine];

            machineCompletionTimes[machine] = completionTime;
            previousMachineCompletion = completionTime;
        }
    }

    return machineCompletionTimes[machineCompletionTimes.length - 1];
};

export const formatTotalMakespan = (totalMakespan: number): string => {
    return Math.round(totalMakespan).toString();
};