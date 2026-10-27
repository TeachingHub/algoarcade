import type { KnapsackInstance, KnapsackItem } from "@/types/games/knapsack";

import * as gameService from "@services/games/gameService";

const COLLECTION_NAME = "knapsack_instances";
const DAILY_COLLECTION_NAME = "knapsack_daily_challenges";
const LEADERBOARD_COLLECTION_NAME = "knapsack_leaderboards";

function encodeKnapsackInstance(instance: KnapsackInstance): string {
    // 1. Extract author
    const { author } = instance;
    // 2. Map points to [id, x, y] tuples to save space (removing keys "id", "x", "y")
    const itemsArray = instance.items.map(item => [item.id, item.name, item.value, item.weight, item.icon ?? null]);
    // 3. Extract maxWeight
    const { maxWeight} = instance;
    // 4. Extract knapsackType
    const { knapsackType } = instance;

    // 4. Serialize to JSON string: [author, [[id,name,value,weight,icon], maxWeight]]
    return JSON.stringify([author, itemsArray, maxWeight, knapsackType]);
}

function decodeKnapsackInstance(encodedData: string): KnapsackInstance {
    try {
        const parsed = JSON.parse(encodedData);
        // Expecting [author, itemsArray, maxWeight, knapsackType]
        if (!Array.isArray(parsed) || parsed.length !== 4) {
            throw new Error("Invalid encoded data format");
        }

        const [author, itemsArray, maxWeight, knapsackType] = parsed;

        // Reconstruct Items objects
        const items: KnapsackItem[] = (itemsArray as [
            number,
            string,
            number,
            number,
            string | null,
            'fractional' | 'binary',
        ][]).map(item => ({
            id: item[0],
            name: item[1],
            value: item[2],
            weight: item[3],
            icon: item[4] ?? undefined
        }));

        return {
            author,
            items,
            maxWeight,
            knapsackType
        };
    } catch (error) {
        console.error("Error decoding Knapsack instance:", error);
        throw new Error("Failed to parse game data");
    }
}

export async function saveGameInstance(instanceData: KnapsackInstance): Promise<string> {
    return gameService.saveGameInstance(
        COLLECTION_NAME,
        instanceData,
        encodeKnapsackInstance
    );
}

export async function getGameInstance(instanceId: string): Promise<KnapsackInstance | null> {
    return gameService.getGameInstance(
        COLLECTION_NAME,
        instanceId,
        decodeKnapsackInstance
    );
} 


// --- DAILY CHALLENGE ---

export async function getDailyChallenge(dateString: string): Promise<KnapsackInstance | null> {
    return gameService.getDailyChallenge(
        DAILY_COLLECTION_NAME,
        dateString,
        decodeKnapsackInstance
    );
}

export async function createDailyChallenge(dateString: string, instanceData: KnapsackInstance): Promise<void> {
    return gameService.createDailyChallenge(
        DAILY_COLLECTION_NAME,
        dateString,
        instanceData,
        encodeKnapsackInstance
    );
}

export interface KnapsackLeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL: string;
    score: number;
    selectedItems: number[];
    timestamp: any;
    time_ms?: number | null;
}

export async function saveDailyScore(dateString: string, score: KnapsackLeaderboardEntry): Promise<void> {
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

export async function getDailyLeaderboard(dateString: string): Promise<KnapsackLeaderboardEntry[]> {
    return gameService.getDailyLeaderboard<KnapsackLeaderboardEntry> ({
        collectionName: LEADERBOARD_COLLECTION_NAME,
        dateString,
        socreDirection: "desc"
    });
}