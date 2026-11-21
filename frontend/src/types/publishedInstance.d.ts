export type PublishedGameType = "tsp" | "knapsack" | "pathfinding" | "flowshop";

export interface PublicationMetadata {
    title: string;
    creatorId: string;
    creatorName: string;
}

export interface PublishedInstance {
    id: string;
    data: string;

    createdAt: unknown;
    creatorId: string;
    creatorName: string;

    title: string;
    gameType: "tsp" | "knapsack" | "pathfinding" | "flowshop";

    likes: string[];
    playCount: number;
}