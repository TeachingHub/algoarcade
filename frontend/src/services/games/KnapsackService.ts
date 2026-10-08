import { db } from "@/firebase/config";
import type { KnapsackInstance, KnapsackItem } from "@/types/games/knapsack";
//import { addDoc, serverTimestamp, collection, doc, getDoc, setDoc, query, orderBy, limit, getDocs } from "firebase/firestore"; // Daily challenge not implemented yet
import { addDoc, serverTimestamp, collection, doc, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "knapsack_instances";
//const DAILY_COLLECTION_NAME = "knapsack_daily_challenges"; // Daily challenge not implemented yet

function encodeKnapsackInstance(instance: KnapsackInstance): string {
    // 1. Extract author
    const { author } = instance;
    // 2. Map points to [id, x, y] tuples to save space (removing keys "id", "x", "y")
    const itemsArray = instance.items.map(item => [item.id, item.name, item.value, item.weight, item.icon ?? null]);
    // 3. Extract maxWeight
    const { maxWeight} = instance;

    // 4. Serialize to JSON string: [author, [[id,name,value,weight,icon], maxWeight]]
    return JSON.stringify([author, itemsArray, maxWeight]);
}

function decodeKnapsackInstance(encodedData: string): KnapsackInstance {
    try {
        const parsed = JSON.parse(encodedData);
        // Expecting [author, itemsArray, maxWeight]
        if (!Array.isArray(parsed) || parsed.length !== 3) {
            throw new Error("Invalid encoded data format");
        }

        const [author, itemsArray, maxWeight] = parsed;

        // Reconstruct Items objects
        const items: KnapsackItem[] = (itemsArray as [
            number,
            string,
            number,
            number,
            string | null
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
            maxWeight
        };
    } catch (error) {
        console.error("Error decoding Knapsack instance:", error);
        throw new Error("Failed to parse game data");
    }
}

export async function saveGameInstance(instanceData: KnapsackInstance): Promise<string> {
    try {
        const encoded = encodeKnapsackInstance(instanceData);

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


export async function getGameInstance(instanceId: string): Promise<KnapsackInstance | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, instanceId);
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data();
            // Check if we have the new 'data' string field
            if (typeof docData.data === 'string') {
                return decodeKnapsackInstance(docData.data);
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

// Daily challenge not implemented yet
