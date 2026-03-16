import { collection, deleteDoc, getDoc, getDocs, orderBy, limit, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { User } from "firebase/auth";
import { doc } from "firebase/firestore";
import type { UserProfileData } from "@/types/user/user";



export async function createUserDocument(user: User) {
    try {
        await setDoc(doc(db, "users", user.uid), {
            username: user.displayName,
            email: user.email,
            role: "USER",
            profilePic: user.photoURL,
            createdAt: new Date()
        });
    } catch (error) {
        console.error("Error writing document:", error);
    }
}

export async function getUserDocument(user: User) {
    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfileData;
        } else {
            console.error("User document not found in Firestore");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

export async function deleteUserDocument(user: User) {
    try {
        await deleteDoc(doc(db, "users", user.uid));
    } catch (error) {
        console.error("Error deleting document:", error);
    }
}


export async function updateUserDocument(uid: string, data: { username?: string; profilePic?: string }) {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating document:", error);
        throw error;
    }
}

export interface GlobalLeaderboardEntry {
    uid: string;
    username: string;
    profilePic: string;
    gold: number;
    silver: number;
    bronze: number;
    totalMedals: number;
}

export async function getGlobalLeaderboard(topN: number = 20): Promise<GlobalLeaderboardEntry[]> {
    try {
        const usersRef = collection(db, "users");
        const q = query(
            usersRef,
            where("tspMedals.gold", ">=", 0),
            orderBy("tspMedals.gold", "desc"),
            limit(topN * 2)
        );

        const snapshot = await getDocs(q);
        const entries: GlobalLeaderboardEntry[] = [];

        snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserProfileData;
            const medals = data.tspMedals;
            if (!medals || (medals.gold + medals.silver + medals.bronze === 0)) return;

            entries.push({
                uid: docSnap.id,
                username: data.username || "Anonymous",
                profilePic: data.profilePic || "",
                gold: medals.gold,
                silver: medals.silver,
                bronze: medals.bronze,
                totalMedals: medals.gold + medals.silver + medals.bronze,
            });
        });

        // Sort: gold first, then silver, then bronze
        entries.sort((a, b) => {
            if (a.gold !== b.gold) return b.gold - a.gold;
            if (a.silver !== b.silver) return b.silver - a.silver;
            return b.bronze - a.bronze;
        });

        return entries.slice(0, topN);
    } catch (error) {
        console.error("Error fetching global leaderboard:", error);
        return [];
    }
}