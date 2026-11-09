import { useCallback } from 'react';
import type { Job } from '@/types/games/flowshop';

/**
 * Handles builder mode for the Flowshop game — creating jobs manually.
 * 
 * Manages:
 * - Adding jobs
 * - Deleting jobs
 * - Unique ID generation for new jobs
 */


export const useFlowshopBuilder = () => {

    const addJob = useCallback((
        name: string,
        operationsTimes: number[],
        icon: string,
        currentJobs: Job[]
    ): Job[] | null => {
        if (currentJobs.length >= 8) return null;

        const newJob: Job = {
            id: currentJobs.length > 0 ? Math.max(...currentJobs.map(job => job.id)) + 1 : 0,
            name: name,
            operationsTimes: operationsTimes,
            icon: icon
        };

        return [...currentJobs, newJob];
    }, []);

    const deleteJob = useCallback((id: number, currentJobs: Job[]): Job[] | null => {
        if (currentJobs.length === 0) return null;

        return currentJobs.filter(job => job.id !== id);
    }, []);

    /** Returns true if the current builder state has a valid number of jobs */
    const isValidBuilderState = useCallback((jobCount: number): boolean => {
        return jobCount >= 3 && jobCount <= 8;
    }, []);

    return {
        addJob,
        deleteJob,
        isValidBuilderState
    };
};
