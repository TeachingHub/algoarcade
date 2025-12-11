import type { Point } from "@/types/games/tsp";
import { calculateDistance } from "./math";

export const nearestNeighborTSP = (points: Point[]): number[] => {
    if (points.length === 0) return [];

    const unvisited = new Set(points.map(p => p.id));
    const path: number[] = [];

    // Start with first point
    let currentId = points[0].id;
    path.push(currentId);
    unvisited.delete(currentId);

    while (unvisited.size > 0) {
        const currentPoint = points.find(p => p.id === currentId)!;
        let nearestId = -1;
        let minDistance = Infinity;

        for (const id of unvisited) {
            const point = points.find(p => p.id === id)!;
            const dist = calculateDistance(currentPoint, point);
            if (dist < minDistance) {
                minDistance = dist;
                nearestId = id;
            }
        }

        currentId = nearestId;
        path.push(currentId);
        unvisited.delete(currentId);
    }

    return path;
};

export const twoOptImprovement = (points: Point[], currentRoute: number[]): { route: number[], improved: boolean } => {
    const newRoute = [...currentRoute];
    const n = newRoute.length;

    // Simple 2-opt swap
    // Try to swap edges (i, i+1) and (j, j+1)
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 2; j < n; j++) {
            // Skip if edge connects last and first point (handled by loop wrap-around logic usually, but here simplified)
            if (j === n - 1 && i === 0) continue;

            // Calculate distance change
            const p1 = points.find(p => p.id === newRoute[i])!;
            const p2 = points.find(p => p.id === newRoute[i + 1])!;
            const p3 = points.find(p => p.id === newRoute[j])!;
            const p4 = points.find(p => p.id === newRoute[(j + 1) % n])!; // Wrap around for last edge

            const currentDist = calculateDistance(p1, p2) + calculateDistance(p3, p4);
            const newDist = calculateDistance(p1, p3) + calculateDistance(p2, p4);

            if (newDist < currentDist) {
                // Perform swap: reverse segment between i+1 and j
                const segment = newRoute.slice(i + 1, j + 1).reverse();
                newRoute.splice(i + 1, segment.length, ...segment);
                return { route: newRoute, improved: true }; // Return immediately for animation steps
            }
        }
    }

    return { route: newRoute, improved: false };
};
