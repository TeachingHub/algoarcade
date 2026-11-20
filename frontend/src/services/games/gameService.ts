import { db } from "@/firebase/config";
import { addDoc, serverTimestamp, collection, doc, getDoc, setDoc, query, orderBy, limit, getDocs, increment, updateDoc, where } from "firebase/firestore";
import type { PublicationMetadata, PublishedGameType, PublishedInstance } from "@/types/publishedInstance";

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
    scoreDirection: "asc" | "desc";
}

export async function getDailyLeaderboard<T extends BaseLeaderboardEntry>({
    collectionName,
    dateString,
    scoreDirection
}: GetDailyLeaderboardOptions): Promise<T[]> {
    try {
        const leaderboardRef = collection(db, collectionName, dateString, "scores");

        const leaderboardQuery = query(leaderboardRef, orderBy("score", scoreDirection), limit(10));

        const querySnap = await getDocs(leaderboardQuery);

        const scores: T[] = [];

        querySnap.forEach((docSnap) => {
            scores.push(docSnap.data() as T);
        })

        scores.sort((a, b) => {
            if (a.score !== b.score) {
                return scoreDirection === "asc" ? a.score - b.score : b.score - a.score;
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

// --- PUBLISH GAMES INSTANCES ---

export async function createPublishedInstance(
    encodedData: string,
    gameType: PublishedGameType,
    metadata: PublicationMetadata
): Promise<string> {
    try {
        console.log("iniciando publicacion");
        const document = await addDoc(
            collection(db, "published_instances"),
            {
                data: encodedData,
                createdAt: serverTimestamp(),
                creatorId: metadata.creatorId,
                creatorName: metadata.creatorName,
                title: metadata.title.trim(),
                gameType,
                likes: 0,
                playCount: 0,
            }
        );
        console.log(document.id);
        console.log("terminando publicacion");

        return document.id;
    } catch (error) {
        console.error("Error creating published instance:", error);
        throw new Error("Failed to publish instance");
    }
}

export async function getPublishedInstance(
    publicationId: string
): Promise<PublishedInstance | null> {
    try {
        const documentRef = doc(db, "published_instances", publicationId);

        const snapshot = await getDoc(documentRef);

        if (!snapshot.exists()) {return null;}

        return {
            id: snapshot.id,
            ...snapshot.data(),
        } as PublishedInstance;
    } catch (error) {
        console.error("Error fetching published instance:", error);
        throw new Error("Failed to load published instance");
    }
}

export async function getDecodedPublishedInstance<T>(
    publicationId: string,
    decode: (encodedData: string) => T
): Promise<T | null> {
    try {
        const documentRef = doc(db, "published_instances", publicationId);

        const snapshot = await getDoc(documentRef);

        if (!snapshot.exists()) return null;

        const documentData = snapshot.data();

        if (typeof documentData.data !== "string") return null;

        return decode(documentData.data);
    } catch (error) {
        console.error("Error fetching published instance:", error);
        throw new Error("Failed to load published instance");
    }
}

export async function getPublishedInstances(): Promise<PublishedInstance[]> {
    try {
        const publishedQuery = query(
            collection(db, "published_instances"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(publishedQuery);

        return snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
        })) as PublishedInstance[];
    } catch (error) {
        console.error("Error fetching published instances:", error);
        throw new Error("Failed to fetch published instances");
    }
}

export async function getPublishedInstancesByCreator(
    creatorId: string
): Promise<PublishedInstance[]> {
    try {
        const publishedQuery = query(
            collection(db, "published_instances"),
            where("creatorId", "==", creatorId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(publishedQuery);

        return snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
        })) as PublishedInstance[];
    } catch (error) {
        console.error("Error fetching creator publications:", error);
        throw new Error("Failed to fetch creator publications");
    }
}

export async function incrementPublishedPlayCount(publicationId: string): Promise<void> {
    await updateDoc(
        doc(db, "published_instances", publicationId),
        {playCount: increment(1),}
    );
}

export async function incrementPublishedLikes(publicationId: string): Promise<void> {
    await updateDoc(
        doc(db, "published_instances", publicationId),
        {likes: increment(1),}
    );
}