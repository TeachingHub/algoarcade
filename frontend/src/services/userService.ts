import { deleteDoc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { User } from "firebase/auth";
import { doc } from "firebase/firestore";
import type { UserProfileData } from "@/types/user/user";



export async function createUserDocument(user: User) {
    try {//TODO : check if there could be race conditions and username and profilePic are not null
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