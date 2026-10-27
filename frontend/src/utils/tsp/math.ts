import type { Point } from "@/types/games/tsp";

export const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const calculateTotalDistance = (points: Point[], path: number[]): number => {
    if (path.length < 2) return 0;

    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = points.find(p => p.id === path[i]);
        const p2 = points.find(p => p.id === path[i + 1]);
        if (p1 && p2) {
            distance += calculateDistance(p1, p2);
        }
    }

    // Add distance back to start if path is complete
    if (path.length === points.length) {
        const last = points.find(p => p.id === path[path.length - 1]);
        const first = points.find(p => p.id === path[0]);
        if (last && first) {
            distance += calculateDistance(last, first);
        }
    }

    return distance;
};

export const formatDistance = (distance: number): string => {
    return Math.round(distance).toString();
};


export const STANDARD_CANVAS = { width: 800, height: 500} as const;

/**
 * Normalizes a distance to the standard canvas size.
 * This ensures fair scoring regardless of the actual canvas size (desktop vs mobile).
 * Formula: distance * (diagonalStandard / diagonalActual)
 */

export const normalizeDistance = (distance: number, actualWidth: number, actualHeight: number): number => {
    const actualDiagonal = Math.sqrt(actualHeight ** 2 + actualWidth ** 2);
    if (actualDiagonal === 0) {
        return distance;
    }

    const standardDiagonal = Math.sqrt(STANDARD_CANVAS.width ** 2 + STANDARD_CANVAS.height ** 2);

    return distance * (standardDiagonal / actualDiagonal);
};