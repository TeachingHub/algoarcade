import type { Point } from "../../types/games/tsp";

// Colors
export const pathColor = '#fdd505';
export const manualPathColor = '#00a9b3';
export const numberColor = '#00082b';



// Functions
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

export const generateRandomPoints = (count: number, width: number, height: number): Point[] => {
    const points: Point[] = [];
    const padding = 50;

    for (let i = 0; i < count; i++) {
        points.push({
            id: i,
            x: padding + Math.random() * (width - 2 * padding),
            y: padding + Math.random() * (height - 2 * padding)
        });
    }

    return points;
};

export const getPredefinedPoints = (pattern: string, width: number, height: number): Point[] => {
    const points: Point[] = [];
    const padding = 80; // Increased padding to prevent points from touching edges
    const availableWidth = width - 2 * padding;
    const availableHeight = height - 2 * padding;
    const centerX = width / 2;
    const centerY = height / 2;

    if (pattern === 'supermarket') {
        // 3 Aisles (vertical rectangles), points around them
        const aisleWidth = availableWidth / 5;

        // Generate 15 points scattered in the "walking paths"
        for (let i = 0; i < 15; i++) {
            let x;
            // Ensure points are NOT inside the shelves (roughly)
            // Aisles at: 20%, 50%, 80% width
            const col = i % 4; // 0: left, 1: mid-left, 2: mid-right, 3: right
            if (col === 0) x = padding + aisleWidth * 0.5;
            else if (col === 1) x = padding + aisleWidth * 1.5 + (Math.random() * 20 - 10);
            else if (col === 2) x = padding + aisleWidth * 2.5 + (Math.random() * 20 - 10);
            else x = padding + aisleWidth * 3.5;

            const y = padding + Math.random() * availableHeight;
            points.push({ id: i, x, y });
        }
    } else if (pattern === 'star') {
        // Star shape
        const outerRadius = Math.min(availableWidth, availableHeight) / 2.5;
        const innerRadius = outerRadius / 2.5;
        const spikes = 5;

        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (spikes * 2)) * 2 * Math.PI - Math.PI / 2;
            points.push({
                id: i,
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle)
            });
        }
        // Add a few random noise points to hide the shape slightly
        for (let i = 0; i < 5; i++) {
            points.push({
                id: 10 + i,
                x: padding + Math.random() * availableWidth,
                y: padding + Math.random() * availableHeight
            });
        }
    } else if (pattern === 'grid') {
        // Imperfect 4x4 grid
        const stepX = availableWidth / 3;
        const stepY = availableHeight / 3;
        let id = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                // Skip a few random points to make it imperfect
                if (Math.random() > 0.2 || id === 0 || id === 15) {
                    points.push({
                        id: id++,
                        x: padding + col * stepX + (Math.random() * 20 - 10),
                        y: padding + row * stepY + (Math.random() * 20 - 10)
                    });
                }
            }
        }
    } else if (pattern === 'islands') {
        // 3 clusters
        const centers = [
            { x: width * 0.25, y: height * 0.3 },
            { x: width * 0.75, y: height * 0.3 },
            { x: width * 0.5, y: height * 0.8 }
        ];

        let id = 0;
        centers.forEach(center => {
            for (let i = 0; i < 4; i++) {
                points.push({
                    id: id++,
                    x: center.x + (Math.random() * 60 - 30), // Reduced spread to keep inside
                    y: center.y + (Math.random() * 60 - 30)
                });
            }
        });
    } else if (pattern === 'europe') {
        // ... existing europe code ...
        const cities = [
            { name: "Madrid", x: 0.15, y: 0.75 },
            { name: "London", x: 0.28, y: 0.35 },
            { name: "Paris", x: 0.32, y: 0.48 },
            { name: "Berlin", x: 0.52, y: 0.38 },
            { name: "Rome", x: 0.55, y: 0.72 },
            { name: "Vienna", x: 0.60, y: 0.52 },
            { name: "Warsaw", x: 0.70, y: 0.35 },
            { name: "Moscow", x: 0.90, y: 0.25 },
            { name: "Istanbul", x: 0.85, y: 0.80 },
            { name: "Athens", x: 0.75, y: 0.85 },
            { name: "Stockholm", x: 0.58, y: 0.15 },
            { name: "Oslo", x: 0.45, y: 0.15 },
            { name: "Lisbon", x: 0.05, y: 0.78 },
            { name: "Dublin", x: 0.18, y: 0.32 },
            { name: "Amsterdam", x: 0.38, y: 0.40 }
        ];

        const citiesPadding = 40;
        const citiesAvailWidth = width - 2 * citiesPadding;
        const citiesAvailHeight = height - 2 * citiesPadding;

        cities.forEach((city, index) => {
            points.push({
                id: index,
                x: citiesPadding + city.x * citiesAvailWidth,
                y: citiesPadding + city.y * citiesAvailHeight
            });
        });
    } else if (pattern === 'constellation') {
        // Big Dipper-ish shape + noise
        const scale = Math.min(availableWidth, availableHeight) / 100;
        const stars = [
            { x: 10, y: 10 }, { x: 30, y: 15 }, { x: 45, y: 25 }, // Handle
            { x: 60, y: 40 }, { x: 80, y: 35 }, { x: 85, y: 60 }, { x: 65, y: 65 } // Bowl
        ];

        stars.forEach((s, i) => {
            points.push({
                id: i,
                x: padding + s.x * scale * 0.8,
                y: padding + s.y * scale * 0.8
            });
        });

        // Noise
        for (let i = 0; i < 5; i++) {
            points.push({
                id: 7 + i,
                x: padding + Math.random() * availableWidth,
                y: padding + Math.random() * availableHeight
            });
        }

    } else if (pattern === 'corners') {
        // Dense center + 4 corners
        // Center cluster
        for (let i = 0; i < 11; i++) {
            points.push({
                id: i,
                x: centerX + (Math.random() * 100 - 50),
                y: centerY + (Math.random() * 100 - 50)
            });
        }
        // Corners
        points.push({ id: 11, x: padding, y: padding });
        points.push({ id: 12, x: width - padding, y: padding });
        points.push({ id: 13, x: width - padding, y: height - padding });
        points.push({ id: 14, x: padding, y: height - padding });

    } else {
        // Default Europe fallback or random
        return getPredefinedPoints('supermarket', width, height);
    }

    return points;
};

export interface ScenarioConfig {
    name: string;
    description: string;
    bgElements: { type: 'rect' | 'circle', x: number, y: number, w?: number, h?: number, r?: number, color: string }[];
}

export const getScenarioConfig = (pattern: string, width: number, height: number): ScenarioConfig => {
    const padding = 50;
    const availableWidth = width - 2 * padding;
    const availableHeight = height - 2 * padding;

    switch (pattern) {
        case 'supermarket': {
            const aisleWidth = availableWidth / 5;
            const aisleHeight = availableHeight * 0.8;
            return {
                name: "Supermarket Run",
                description: "Don't zigzag! Plan a smooth route through the aisles.",
                bgElements: [
                    { type: 'rect', x: padding + aisleWidth, y: padding + availableHeight * 0.1, w: aisleWidth * 0.4, h: aisleHeight, color: '#e2e8f0' },
                    { type: 'rect', x: padding + aisleWidth * 2.2, y: padding + availableHeight * 0.1, w: aisleWidth * 0.4, h: aisleHeight, color: '#e2e8f0' },
                    { type: 'rect', x: padding + aisleWidth * 3.4, y: padding + availableHeight * 0.1, w: aisleWidth * 0.4, h: aisleHeight, color: '#e2e8f0' }
                ]
            };
        }
        case 'star':
            return {
                name: "Connect the Dots",
                description: "Can you find the hidden shape?",
                bgElements: []
            };
        case 'grid':
            return {
                name: "Pizza Delivery",
                description: "Plan by zones to avoid backtracking.",
                bgElements: [] // Could add grid lines but might be too noisy
            };
        case 'islands':
            return {
                name: "Island Hopping",
                description: "Choose the right bridges between clusters.",
                bgElements: [
                    { type: 'circle', x: width * 0.25, y: height * 0.3, r: 60, color: '#dcfce7' },
                    { type: 'circle', x: width * 0.75, y: height * 0.3, r: 60, color: '#dcfce7' },
                    { type: 'circle', x: width * 0.5, y: height * 0.8, r: 60, color: '#dcfce7' }
                ]
            };
        case 'constellation':
            return {
                name: "Broken Constellation",
                description: "Efficiency doesn't care about pretty shapes.",
                bgElements: []
            };
        case 'corners':
            return {
                name: "Four Corners",
                description: "Visit the center, then do a big loop for the corners.",
                bgElements: []
            };
        case 'europe':
            return {
                name: "Europe Map",
                description: "Visit major European cities efficiently. A classic TSP challenge!",
                bgElements: []
            };
        default:
            return { name: "", description: "", bgElements: [] };
    }
};

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
