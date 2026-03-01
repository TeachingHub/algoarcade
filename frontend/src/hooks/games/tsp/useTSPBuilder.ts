import { useCallback } from 'react';
import type { Point } from "@/types/games/tsp";

/**
 * Handles builder mode for the TSP game — placing points manually on the canvas.
 * 
 * Manages:
 * - Adding points with minimum distance validation
 * - Unique ID generation for new points
 */

const MIN_POINT_DISTANCE = 20;

export const useTSPBuilder = () => {

    const addPoint = useCallback((
        x: number,
        y: number,
        currentPoints: Point[]
    ): Point[] | null => {
        // Check if too close to an existing point
        const isTooClose = currentPoints.some(p => {
            const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
            return dist < MIN_POINT_DISTANCE;
        });

        if (isTooClose) return null;

        const newPoint: Point = {
            id: currentPoints.length > 0 ? Math.max(...currentPoints.map(p => p.id)) + 1 : 0,
            x,
            y
        };

        return [...currentPoints, newPoint];
    }, []);

    /** Returns true if the current builder state has a valid number of points */
    const isValidBuilderState = useCallback((pointCount: number): boolean => {
        return pointCount >= 5 && pointCount <= 50;
    }, []);

    return {
        addPoint,
        isValidBuilderState,
    };
};
