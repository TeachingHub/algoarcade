import { useState, useCallback } from 'react';
import type { KnapsackInstance } from "@/types/games/knapsack";
import { generateRandomGame } from "@/utils/knapsack/";

/**
 * Handles scenario generation and selection for the Knapsack game.
 * 
 * Manages:
 * - Random item generation with custom count, minWeight and maxWeight
 * - Scenario metadata (name + description)
 */

export interface ScenarioInfo {
    name: string;
    description: string;
}

export const useKnapsackScenarios = () => {
    const [scenarioInfo, setScenarioInfo] = useState<ScenarioInfo | null>(null);
    const [customItemsCount, setCustomItemsCount] = useState<number>(5);
    const [customItemsMinWeight, setCustomItemsMinWeight] = useState<number>(20);
    const [customItemsMaxWeight, setCustomItemsMaxWeight] = useState<number>(150);

    const generateScenario = useCallback((
        count?: number,
        minWeight?: number,
        maxWeight?: number,
    ): KnapsackInstance => {

        let instance: KnapsackInstance;
        let newScenarioInfo: ScenarioInfo;

        const numItems = count || customItemsCount;
        const minItemWeight = minWeight || customItemsMinWeight;
        const maxItemWieght = maxWeight || customItemsMaxWeight;
        instance = generateRandomGame(numItems, minItemWeight, maxItemWieght);
        newScenarioInfo = {
            name: "Knapsack game",
            description: "Select the best items to miximize your profit without exceeding the weight limit"
        };

        setScenarioInfo(newScenarioInfo);
        return instance;
    }, [customItemsCount]);

    /** Generate a fallback random scenario (used when builder has invalid items count) */
    const generateFallback = useCallback((): KnapsackInstance => {
        setScenarioInfo({
            name: "Knapsack game",
            description: "Auto-generated after invalid builder state."
        });
        return generateRandomGame(5, 20, 150);
    }, []);

    return {
        scenarioInfo,
        setScenarioInfo,
        customItemsCount,
        setCustomItemsCount,
        generateScenario,
        generateFallback,
        customItemsMinWeight,
        setCustomItemsMinWeight,
        customItemsMaxWeight,
        setCustomItemsMaxWeight,
    };
};
