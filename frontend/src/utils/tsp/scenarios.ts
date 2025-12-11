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
