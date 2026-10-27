import type { TSPInstance, Point } from "@/types/games/tsp";

import * as gameService from "@services/games/gameService";

const COLLECTION_NAME = "tsp_instances";
const DAILY_COLLECTION_NAME = "tsp_daily_challenges";
const LEADERBOARD_COLLECTION_NAME = "tsp_leaderboards";

function encodeTSPInstance(instance: TSPInstance): string {
    // 1. Extract author
    const { author } = instance;
    // 2. Map points to [id, x, y] tuples to save space (removing keys "id", "x", "y")
    const pointsArray = instance.points.map(p => [p.id, p.x, p.y]);

    // 3. Serialize to JSON string: [author, [[id,x,y], ...]]
    return JSON.stringify([author, pointsArray]);
}

function decodeTSPInstance(encodedData: string): TSPInstance {
    try {
        const parsed = JSON.parse(encodedData);
        // Expecting [author, pointsArray]
        if (!Array.isArray(parsed) || parsed.length !== 2) {
            throw new Error("Invalid encoded data format");
        }

        const [author, pointsArray] = parsed;

        // Reconstruct Point objects
        const points: Point[] = (pointsArray as number[][]).map(p => ({
            id: p[0],
            x: p[1],
            y: p[2]
        }));

        return {
            author,
            points
        };
    } catch (error) {
        console.error("Error decoding TSP instance:", error);
        throw new Error("Failed to parse game data");
    }
}

export async function saveGameInstance(instanceData: TSPInstance): Promise<string> {
    return gameService.saveGameInstance(
        COLLECTION_NAME,
        instanceData,
        encodeTSPInstance
    );
}

export async function getGameInstance(instanceId: string): Promise<TSPInstance | null> {
    return gameService.getGameInstance(
        COLLECTION_NAME,
        instanceId,
        decodeTSPInstance
    );
} 


// --- DAILY CHALLENGE ---

export async function getDailyChallenge(dateString: string): Promise<TSPInstance | null> {
    return gameService.getDailyChallenge(
        DAILY_COLLECTION_NAME,
        dateString,
        decodeTSPInstance
    );
}

export async function createDailyChallenge(dateString: string, instanceData: TSPInstance): Promise<void> {
    return gameService.createDailyChallenge(
        DAILY_COLLECTION_NAME,
        dateString,
        instanceData,
        encodeTSPInstance
    );
}

export interface TSPLeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL: string;
    score: number;
    path: number[];
    timestamp: any;
    time_ms?: number | null;
}

export async function saveDailyScore(dateString: string, score: TSPLeaderboardEntry): Promise<void> {
    return gameService.saveDailyScore(
        LEADERBOARD_COLLECTION_NAME,
        dateString,
        score
    );
}

export async function hasUserSubmitted(dateString: string, userId: string): Promise<boolean> {
    return gameService.hasUserSubmitted(
        LEADERBOARD_COLLECTION_NAME,
        dateString,
        userId
    );
}

export async function getDailyLeaderboard(dateString: string): Promise<TSPLeaderboardEntry[]> {
    return gameService.getDailyLeaderboard<TSPLeaderboardEntry> ({
        collectionName: LEADERBOARD_COLLECTION_NAME,
        dateString,
        socreDirection: "asc"
    });
}