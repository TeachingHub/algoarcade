import { db } from "@/firebase/config";
import type { TSPInstance, Point } from "@/types/games/tsp";
import { addDoc, serverTimestamp, collection, doc, getDoc } from "firebase/firestore";


const COLLECTION_NAME = "tsp_instances";

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