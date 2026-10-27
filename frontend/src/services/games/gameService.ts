import { db } from "@/firebase/config";
import { addDoc, serverTimestamp, collection, doc, getDoc, setDoc, query, orderBy, limit, getDocs } from "firebase/firestore";

export interface BaseLeaderboardEntry {
    userId: string;
    score: number;
    timestamp: any;
    time_ms?: number | null;
}

export async function saveGameInstance<T>(
    collectionName: string,
    instanceData: T,
    encode: (instanceData: T) => string
): Promise<string> {
    try {
        const encoded = encode(instanceData);

        const docRef = await addDoc(collection(db, collectionName), {
            data: encoded, // Store as a single string field
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error(`Error saving game instance in ${collectionName}:`, error);
        throw new Error("Failed to save game instance");
    }
}

export async function getGameInstance<T>(
    collectionName: string,
    instanceId: string,
    decode: (encodedData: string) => T
): Promise<T | null> {
    try {
        const docRef = doc(db, collectionName, instanceId);
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data();
            if (typeof docData.data === 'string') {
                return decode(docData.data);
            }
            return null;
        } else {
            return null;
        }

    } catch (error) {
        console.error(`Error fetching game instance from ${collectionName}:`, error)
        throw new Error("Failed to load game instance")
    }
}

// --- DAILY CHALLENGE ---

export async function getDailyChallenge<T>(
    collectionName: string,
    dateString: string,
    decode: (encodedData: string) => T
): Promise<T | null> {
    try {
        const docRef = doc(db, collectionName, `daily_${dateString}`);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const docData = docSnap.data();

        if (typeof docData.data !== "string") return null;

        return decode(docData.data);
    } catch (error) {
        console.error(`Error fetching daily challenge from ${collectionName}:`, error);
        return null;
    }
}

export async function createDailyChallenge<T>(
    collectionName: string,
    dateString: string,
    instanceData: T,
    encode: (instanceData: T) => string
): Promise<void> {
    try {
        const encoded = encode(instanceData);

        const docRef = doc(db, collectionName, `daily_${dateString}`);

        await setDoc(docRef, { data: encoded, createdAt: serverTimestamp()});
    } catch (error) {
        console.error(`Error creating daily challenge in ${collectionName}:`, error);

        throw new Error("Failed to create daily challenge");
    }
}

export async function saveDailyScore<T extends BaseLeaderboardEntry>(
    collectionName: string,
    dateString: string,
    score: T
): Promise<void> {
    try {
        const leaderboardRef = collection(db, collectionName, dateString, "scores");

        await setDoc(doc(leaderboardRef, score.userId), score);
    } catch (error) {
        console.error(`Error saving daily score in ${collectionName}:`, error);

        throw new Error("Failed to save daily score");
    }
}

export async function hasUserSubmitted(
    collectionName: string,
    dateString: string,
    userId: string
): Promise<boolean> {
    try {
        const scoreRef = doc(db, collectionName, dateString, "scores", userId);

        const scoreSnap = await getDoc(scoreRef);

        return scoreSnap.exists();
    } catch (error) {
        console.error(`Error checking user submission in ${collectionName}:`, error);

        return false;
    }
}

interface GetDailyLeaderboardOptions {
    collectionName: string;
    dateString: string;
    socreDirection: "asc" | "desc";
}

export async function getDailyLeaderboard<T extends BaseLeaderboardEntry>({
    collectionName,
    dateString,
    socreDirection
}: GetDailyLeaderboardOptions): Promise<T[]> {
    try {
        const leaderboardRef = collection(db, collectionName, dateString, "scores");

        const leaderboardQuery = query(leaderboardRef, orderBy("score", socreDirection), limit(10));

        const querySnap = await getDocs(leaderboardQuery);

        const scores: T[] = [];

        querySnap.forEach((docSnap) => {
            scores.push(docSnap.data() as T);
        })

        scores.sort((a, b) => {
            if (a.score !== b.score) {
                return socreDirection === "asc" ? a.score - b.score : b.score - a.score;
            }

            const aDuration = a.time_ms ?? Infinity;
            const bDuration = b.time_ms ?? Infinity;

            if (aDuration !== bDuration) {
                return aDuration - bDuration;
            }

            return (getTimestampMilliseconds(a.timestamp) - getTimestampMilliseconds(b.timestamp));
        });

        return scores.slice(0, 5);
    } catch (error) {
        console.error(`Error fetching daily leaderboard from ${collectionName}:`, error);
        return [];
    }
}

function getTimestampMilliseconds(timestamp: any): number {
    if (!timestamp) return Infinity;
    if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
    if (timestamp._seconds) return timestamp._seconds * 1000;
    return Infinity;
};