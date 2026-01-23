export interface ScenarioConfig {
    name: string;
    description: string;
}

export const getScenarioConfig = (pattern: string): ScenarioConfig => {
    switch (pattern) {
        case 'supermarket': {
            return {
                name: "Supermarket Run",
                description: "Don't zigzag! Plan a smooth route through the aisles.",
            };
        }
        case 'star':
            return {
                name: "Connect the Dots",
                description: "Can you find the hidden shape?",
            };
        case 'grid':
            return {
                name: "Pizza Delivery",
                description: "Plan by zones to avoid backtracking.",
            };
        case 'islands':
            return {
                name: "Island Hopping",
                description: "Choose the right bridges between clusters.",
            };
        case 'constellation':
            return {
                name: "Broken Constellation",
                description: "Efficiency doesn't care about pretty shapes.",
            };
        case 'corners':
            return {
                name: "Four Corners",
                description: "Visit the center, then do a big loop for the corners.",
            };
        case 'europe':
            return {
                name: "Europe Map",
                description: "Visit major European cities efficiently. A classic TSP challenge!",
            };
        default:
            return { name: "", description: "" };
    }
};
