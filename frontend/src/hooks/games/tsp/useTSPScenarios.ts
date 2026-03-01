import { useState, useCallback } from 'react';
import type { Point } from "@/types/games/tsp";
import {
    generateRandomPoints,
    getPredefinedPoints,
    getScenarioConfig,
} from "@/utils/tsp";

/**
 * Handles scenario generation and selection for the TSP game.
 * 
 * Manages:
 * - Random point generation with custom count
 * - Predefined scenario patterns (supermarket, star, europe, etc.)
 * - Scenario metadata (name + description)
 */

export interface ScenarioInfo {
    name: string;
    description: string;
}

export const useTSPScenarios = (canvasSize: { width: number, height: number }) => {
    const [scenarioInfo, setScenarioInfo] = useState<ScenarioInfo | null>(null);
    const [customPointCount, setCustomPointCount] = useState<number>(8);

    const generateScenario = useCallback((
        pattern: string,
        count?: number,
    ): Point[] => {
        const w = canvasSize.width || 800;
        const h = canvasSize.height || 500;

        let points: Point[];
        let newScenarioInfo: ScenarioInfo;

        if (pattern === 'random') {
            const numPoints = count || customPointCount;
            points = generateRandomPoints(numPoints, w, h);
            newScenarioInfo = {
                name: "Random Path",
                description: "Chaos theory in action! Can you find order in this randomness?"
            };
        } else {
            points = getPredefinedPoints(pattern, w, h);
            const config = getScenarioConfig(pattern);
            newScenarioInfo = { name: config.name, description: config.description };
        }

        setScenarioInfo(newScenarioInfo);
        return points;
    }, [canvasSize, customPointCount]);

    /** Generate a fallback random scenario (used when builder has invalid point count) */
    const generateFallback = useCallback((count: number): Point[] => {
        const w = canvasSize.width || 800;
        const h = canvasSize.height || 500;
        const points = generateRandomPoints(count, w, h);
        setScenarioInfo({
            name: "Random Path",
            description: "Auto-generated after invalid builder state."
        });
        return points;
    }, [canvasSize]);

    return {
        scenarioInfo,
        setScenarioInfo,
        customPointCount,
        setCustomPointCount,
        generateScenario,
        generateFallback,
    };
};
