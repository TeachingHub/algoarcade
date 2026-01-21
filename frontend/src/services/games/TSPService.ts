import { db } from "@/firebase/config";
import type { TSPInstance } from "@/types/games/tsp";
import { addDoc, serverTimestamp, collection, doc, getDoc } from "firebase/firestore";


const COLLECTION_NAME = "tsp_instances";

export async function saveGameInstance(instanceData: TSPInstance): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...instanceData,
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
            return docSnap.data() as TSPInstance;
        } else {
            return null;
        }

    } catch (error) {
        console.error("Error fetching game instance:", error)
        throw new Error("Failed to load game instance")
    }
}