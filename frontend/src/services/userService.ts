import { deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { User } from "firebase/auth";
import { doc } from "firebase/firestore";



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

export async function deleteUserDocument(user: User) {
    try {
        await deleteDoc(doc(db, "users", user.uid));
    } catch (error) {
        console.error("Error deleting document:", error);
    }
}