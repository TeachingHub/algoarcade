import { useState, useCallback } from 'react';
import type { FlowshopInstance } from "@/types/games/flowshop";
import { generateRandomGame } from "@/utils/flowshop/";

/**
 * Handles scenario generation and selection for the Flowshop game.
 * 
 * Manages:
 * - Random Job generation with custom count, minDuration and maxDuration
 * - Scenario metadata (name + description)
 */

export interface ScenarioInfo {
    name: string;
    description: string;
}

export const useFlowshopScenarios = () => {
    const [scenarioInfo, setScenarioInfo] = useState<ScenarioInfo | null>(null);
    const [customJobsCount, setCustomJobsCount] = useState<number>(5);
    const [customOperationsMinDuration, setCustomOperationsMinDuration] = useState<number>(1);
    const [customOperationsMaxDuration, setCustomOperationsMaxDuration] = useState<number>(20);

    const generateScenario = useCallback((
        count?: number,
        minDuration?: number,
        maxDuration?: number,
    ): FlowshopInstance => {

        let instance: FlowshopInstance;
        let newScenarioInfo: ScenarioInfo;

        const numJobs = count || customJobsCount;
        const minOperationDuration = minDuration || customOperationsMinDuration;
        const maxOperationDuration = maxDuration || customOperationsMaxDuration;
        instance = generateRandomGame(numJobs, minOperationDuration, maxOperationDuration);
        newScenarioInfo = {
            name: "Flowshop game",
            description: "Order the jobs to minimaze the total makespan"
        };

        setScenarioInfo(newScenarioInfo);
        return instance;
    }, [customJobsCount, customOperationsMinDuration, customOperationsMaxDuration]);

    /** Generate a fallback random scenario (used when builder has invalid jobs count) */
    const generateFallback = useCallback((): FlowshopInstance => {
        setScenarioInfo({
            name: "Flowshop game",
            description: "Auto-generated after invalid builder state."
        });
        return generateRandomGame(5, 1, 20);
    }, []);

    return {
        scenarioInfo,
        setScenarioInfo,
        customJobsCount,
        setCustomJobsCount,
        generateScenario,
        generateFallback,
        customOperationsMinDuration,
        setCustomOperationsMinDuration,
        customOperationsMaxDuration,
        setCustomOperationsMaxDuration,
    };
};