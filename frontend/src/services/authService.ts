import { createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updateProfile, type User } from "firebase/auth";
import { auth } from "@/firebase/config";
import { createUserDocument, deleteUserDocument } from "./userService";

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
        await createUserDocument(user);    

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

export const deleteUserAccount = async (password: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("No user logged in");

    // Get user credentials
    const credential = EmailAuthProvider.credential(user.email, password);

    // Re-authenticate (This refreshes the token and allows sensitive operations)
    await reauthenticateWithCredential(user, credential);

    // Delete user data from Firestore
    await deleteUserDocument(user);
    
    // Delete user from Auth
    await user.delete();
};