import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, type User } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";

export const loginUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
    return await signOut(auth);
};

export const registerUser = async (email:string, password:string, username:string) => {
    let user: User | null = null;
    try{
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        // Set avatar
        const defaultAvatar = "/avatar.png";
        
        // Update user profile
        await updateProfile(user, { 
            displayName: username, 
            photoURL: defaultAvatar 
        });  

        // Create user in Firestore
        await setDoc(doc(db, "users", user.uid), {
            username,
            email,
            role: "USER",
            profilePic: defaultAvatar,
            createdAt: new Date()
        });

        return user;
    }
    catch (error) {
        if (user) {
            try {
                await user.delete();
            } catch (deleteError) {
                console.error("Error doing rollback:", deleteError);
            }
        }
        throw error; // throw error to be handled by the component
    }
}