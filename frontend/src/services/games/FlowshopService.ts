import type { FlowshopInstance, Job } from "@/types/games/flowshop";

import * as gameService from "@services/games/gameService";

const COLLECTION_NAME = "flowshop_instances";
const DAILY_COLLECTION_NAME = "flowshop_daily_challenges";
const LEADERBOARD_COLLECTION_NAME = "flowshop_leaderboards";

function encodeFlowshopInstance(instance: FlowshopInstance): string {
    // 1. Extract author
    const { author } = instance;
    // 2. Map jobs to [id, name, operationTimes, icon] tuples to save space (removing keys "id", "name", "operationTimes, icon")
    const jobsArray = instance.jobs.map(job => [job.id, job.name, job.operationsTimes, job.icon ?? null]);

    // 3. Serialize to JSON string: [author, [[id,name,operationsTimes,icon]]]
    return JSON.stringify([author, jobsArray]);
}

function decodeFlowshopInstance(encodedData: string): FlowshopInstance {
    try {
        const parsed = JSON.parse(encodedData);
        // Expecting [author, jobsArray]
        if (!Array.isArray(parsed) || parsed.length !== 2) {
            throw new Error("Invalid encoded data format");
        }

        const [author, jobsArray] = parsed;

        // Reconstruct Jobs objects
        const jobs: Job[] = (jobsArray as [
            number,
            string,
            number[],
            string | null,
        ][]).map(job => ({
            id: job[0],
            name: job[1],
            operationsTimes: job[2],
            icon: job[3] ?? undefined
        }));

        return {
            author,
            jobs
        };
    } catch (error) {
        console.error("Error decoding Flowshop instance:", error);
        throw new Error("Failed to parse game data");
    }
}

export async function saveGameInstance(instanceData: FlowshopInstance): Promise<string> {
    return gameService.saveGameInstance(
        COLLECTION_NAME,
        instanceData,
        encodeFlowshopInstance
    );
}

export async function getGameInstance(instanceId: string): Promise<FlowshopInstance | null> {
    return gameService.getGameInstance(
        COLLECTION_NAME,
        instanceId,
        decodeFlowshopInstance
    );
} 


// --- DAILY CHALLENGE ---

export async function getDailyChallenge(dateString: string): Promise<FlowshopInstance | null> {
    return gameService.getDailyChallenge(
        DAILY_COLLECTION_NAME,
        dateString,
        decodeFlowshopInstance
    );
}

export async function createDailyChallenge(dateString: string, instanceData: FlowshopInstance): Promise<void> {
    return gameService.createDailyChallenge(
        DAILY_COLLECTION_NAME,
        dateString,
        instanceData,
        encodeFlowshopInstance
    );
}

export interface FlowshopLeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL: string;
    score: number;
    selectedOrder: number[];
    timestamp: any;
    time_ms?: number | null;
}

export async function saveDailyScore(dateString: string, score: FlowshopLeaderboardEntry): Promise<void> {
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

export async function getDailyLeaderboard(dateString: string): Promise<FlowshopLeaderboardEntry[]> {
    return gameService.getDailyLeaderboard<FlowshopLeaderboardEntry> ({
        collectionName: LEADERBOARD_COLLECTION_NAME,
        dateString,
        scoreDirection: "asc"
    });
}