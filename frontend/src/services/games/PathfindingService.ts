import type { PathfindingInstance, Cell } from "@/types/games/pathfinding";
import { createCell } from "@/utils/pathfinding";

import * as gameService from "@services/games/gameService";

const COLLECTION_NAME = "pathfinding_instances";
const DAILY_COLLECTION_NAME = "pathfinding_daily_challenges";
const LEADERBOARD_COLLECTION_NAME = "pathfinding_leaderboards";

type EncodedPathfindingCell = 'empty' | 'wall' | 'start' | 'end';

function encodePathfindingInstance(instance: PathfindingInstance): string {
    // 1. Extract author
    const { author } = instance;
    // 2. Map cells
    const gridCellsArray: EncodedPathfindingCell[][]  = instance.grid.map(row =>
        row.map(cell => {
            if (cell.type !== 'wall' && cell.type !== 'start' && cell.type !== 'end') return 'empty'
            else return cell.type;
        }));
    // 3. Serialize to JSON string: [author, [[celltype]]]
    return JSON.stringify([author, gridCellsArray]);
}

function decodePathfindingInstance(encodedData: string): PathfindingInstance {
    try {
        const parsed: unknown = JSON.parse(encodedData);
        // Expecting [author, gridCellsArray]
        if (!Array.isArray(parsed) || parsed.length !== 2) {
            throw new Error("Invalid encoded data format");
        }

        const [author, gridCellsArray] = parsed;

        if (typeof author !== 'string' || !Array.isArray(gridCellsArray)) {
            throw new Error('Invalid Pathfinding instance data')
        }

        // Reconstruct Cells objects
        const grid: Cell[][] = gridCellsArray.map((row, rowIndex) => {
            if (!Array.isArray(row)) throw new Error('Invalid grid row');
            return row.map((cellType, colIndex) => {
                return createCell(rowIndex, colIndex, cellType);
            });
        });
        return { author, grid };
    } catch (error) {
        console.error("Error decoding Pathfinding instance:", error);
        throw new Error("Failed to parse game data");
    }
}

export async function saveGameInstance(instanceData: PathfindingInstance): Promise<string> {
    return gameService.saveGameInstance(
        COLLECTION_NAME,
        instanceData,
        encodePathfindingInstance
    );
}

export async function getGameInstance(instanceId: string): Promise<PathfindingInstance | null> {
    return gameService.getGameInstance(
        COLLECTION_NAME,
        instanceId,
        decodePathfindingInstance
    );
} 


// --- DAILY CHALLENGE ---

export async function getDailyChallenge(dateString: string): Promise<PathfindingInstance | null> {
    return gameService.getDailyChallenge(
        DAILY_COLLECTION_NAME,
        dateString,
        decodePathfindingInstance
    );
}

export async function createDailyChallenge(dateString: string, instanceData: PathfindingInstance): Promise<void> {
    return gameService.createDailyChallenge(
        DAILY_COLLECTION_NAME,
        dateString,
        instanceData,
        encodePathfindingInstance
    );
}

export interface PathfindingLeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL: string;
    score: number;
    manualPath: { row: number; col: number }[];
    timestamp: any;
    time_ms?: number | null;
}

export async function saveDailyScore(dateString: string, score: PathfindingLeaderboardEntry): Promise<void> {
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

export async function getDailyLeaderboard(dateString: string): Promise<PathfindingLeaderboardEntry[]> {
    return gameService.getDailyLeaderboard<PathfindingLeaderboardEntry> ({
        collectionName: LEADERBOARD_COLLECTION_NAME,
        dateString,
        scoreDirection: "asc"
    });
}