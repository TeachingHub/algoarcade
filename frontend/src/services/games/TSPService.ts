import { db } from "@/firebase/config";
import type { TSPInstance, Point } from "@/types/games/tsp";
import { addDoc, serverTimestamp, collection, doc, getDoc, setDoc, query, orderBy, limit, getDocs } from "firebase/firestore";

const COLLECTION_NAME = "tsp_instances";
const DAILY_COLLECTION_NAME = "tsp_daily_challenges";

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
    try {
        const encoded = encodeTSPInstance(instanceData);

        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            data: encoded, // Store as a single string field
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving game instance:", error);
        throw new Error("Failed to save game instance");
    }
}


export async function getGameInstance(instanceId: string): Promise<TSPInstance | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, instanceId);
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data();
            // Check if we have the new 'data' string field
            if (typeof docData.data === 'string') {
                return decodeTSPInstance(docData.data);
            }

            // Fallback: Return null or handle legacy data if needed. 
            // For now assuming we only read new format or legacy data handling is not required by prompt instructions.
            return null;
        } else {
            return null;
        }

    } catch (error) {
        console.error("Error fetching game instance:", error)
        throw new Error("Failed to load game instance")
    }
}

// --- COMPETITIVE MODE ---

export async function getDailyChallenge(dateString: string): Promise<TSPInstance | null> {
    try {
        const docRef = doc(db, DAILY_COLLECTION_NAME, `daily_${dateString}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const docData = docSnap.data();
            if (typeof docData.data === 'string') {
                return decodeTSPInstance(docData.data);
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching daily challenge:", error);
        return null;
    }
}

export async function createDailyChallenge(dateString: string, instanceData: TSPInstance): Promise<void> {
    try {
        const encoded = encodeTSPInstance(instanceData);
        const docRef = doc(db, DAILY_COLLECTION_NAME, `daily_${dateString}`);

        // We use setDoc to specify the document ID explicitly (the date string)
        await setDoc(docRef, {
            data: encoded,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating daily challenge:", error);
        throw new Error("Failed to create daily challenge");
    }
}

export interface TSPLeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL: string;
    distance: number;
    path: number[]; // Save the path they submitted just in case
    timestamp: any;
}

export async function saveDailyScore(dateString: string, score: TSPLeaderboardEntry): Promise<void> {
    try {
        const leaderboardRef = collection(db, "tsp_leaderboards", dateString, "scores");
        // We can use the user's ID as the doc ID so they only have one score per day
        await setDoc(doc(leaderboardRef, score.userId), score);
    } catch (error) {
        console.error("Error saving daily score:", error);
        throw new Error("Failed to save daily score");
    }
}

export async function hasUserSubmitted(dateString: string, userId: string): Promise<boolean> {
    try {
        const scoreRef = doc(db, "tsp_leaderboards", dateString, "scores", userId);
        const scoreSnap = await getDoc(scoreRef);
        return scoreSnap.exists();
    } catch (error) {
        console.error("Error checking user submission:", error);
        return false;
    }
}

export async function getDailyLeaderboard(dateString: string): Promise<TSPLeaderboardEntry[]> {
    try {
        const leaderboardRef = collection(db, "tsp_leaderboards", dateString, "scores");
        // Single orderBy to avoid requiring a composite index
        const q = query(leaderboardRef, orderBy("distance", "asc"), limit(10));

        const querySnapshot = await getDocs(q);
        const scores: TSPLeaderboardEntry[] = [];
        querySnapshot.forEach((doc) => {
            scores.push(doc.data() as TSPLeaderboardEntry);
        });

        // Client-side tiebreaker: same distance → earlier timestamp wins
        scores.sort((a, b) => {
            if (a.distance !== b.distance) return a.distance - b.distance;
            const getMs = (t: any): number => {
                if (!t) return Infinity;
                if (typeof t.toMillis === 'function') return t.toMillis();
                if (t.seconds) return t.seconds * 1000;
                return Infinity;
            };
            return getMs(a.timestamp) - getMs(b.timestamp);
        });

        return scores.slice(0, 5);
    } catch (error) {
        console.error("Error fetching daily leaderboard:", error);
        return [];
    }
}