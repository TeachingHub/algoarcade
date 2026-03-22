import { collection, doc, getDoc, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { UserProfileData } from "@/types/user/user";

/**
 * Fetch all users
 */
export async function getAllUsers(): Promise<(UserProfileData & { id: string })[]> {
    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as UserProfileData),
        }));
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

/**
 * Promote user to admin
 */
export async function promoteToAdmin(userId: string): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        role: "ADMIN"
    });
}

/**
 * Demote user from admin to regular user
 */
export async function demoteFromAdmin(userId: string): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        role: "USER"
    });
}

/**
 * Game Visibility Config type
 */
export interface GameVisibilityConfig {
    tsp: boolean;
    pathfinding: boolean;
    [key: string]: boolean;
}

/**
 * Get game visibility config
 */
export async function getGameConfig(): Promise<GameVisibilityConfig> {
    try {
        const configRef = doc(db, "config", "games");
        const snapshot = await getDoc(configRef);

        if (snapshot.exists()) {
            return snapshot.data() as GameVisibilityConfig;
        } else {
            // Default config if it doesn't exist
            const defaultConfig: GameVisibilityConfig = { tsp: true, pathfinding: true };
            await setDoc(configRef, defaultConfig);
            return defaultConfig;
        }
    } catch (error) {
        console.error("Error fetching game config:", error);
        return { tsp: true, pathfinding: true };
    }
}

/**
 * Update game visibility config
 */
export async function updateGameVisibility(gameId: string, isVisible: boolean): Promise<void> {
    const configRef = doc(db, "config", "games");
    await updateDoc(configRef, {
        [gameId]: isVisible
    });
}
