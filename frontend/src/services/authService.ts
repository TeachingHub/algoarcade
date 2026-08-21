import { createUserWithEmailAndPassword, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, updatePassword, updateProfile, type User } from "firebase/auth";
import { auth } from "@/firebase/config";
import { createUserDocument, deleteUserDocument, getUserDocument, updateUserDocument } from "./userService";

export const loginUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user document exists in Firestore
        const userDoc = await getUserDocument(user);

        // If not, create it
        if (!userDoc) {
            await createUserDocument(user);
        }

        return user;
    } catch (error: any) {
        // Safari/iOS and strict browser settings may block popups.
        if (error?.code === "auth/popup-blocked") {
            await signInWithRedirect(auth, provider);
            return null;
        }

        throw error;
    }
};

export const logoutUser = async () => {
    return await signOut(auth);
};

export const registerUser = async (email: string, password: string, username: string) => {
    let user: User | null = null;
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        // Set avatar
        const defaultAvatar = "/avatars/avatar1.webp";

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

export const deleteUserAccount = async (password?: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("No user logged in");

    // Check if the user is authenticated with Google
    const isGoogleAuth = user.providerData.some(
        (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
    );

    if (isGoogleAuth) {
        // Re-authenticate with Google Popup
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
    } else {
        // Assume Email/Password auth
        if (!password) throw new Error("Missing password for re-authentication");

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
    }

    // Delete user data from Firestore
    await deleteUserDocument(user);

    // Delete user from Auth
    await user.delete();
};


export const updateUserProfile = async (user: User, data: { username?: string; photoURL?: string }) => {
    try {
        const updates: { displayName?: string; photoURL?: string } = {};
        const docUpdates: { username?: string; profilePic?: string } = {};

        if (data.username) {
            updates.displayName = data.username;
            docUpdates.username = data.username;
        }

        if (data.photoURL) {
            updates.photoURL = data.photoURL;
            docUpdates.profilePic = data.photoURL;
        }

        // Update profile in Firebase Auth
        await updateProfile(user, updates);

        // Update document in Firestore
        await updateUserDocument(user.uid, docUpdates);

        return user;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const changePassword = async (currentPassword: string,newPassword: string) => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("There is no authenticated user");
  }

  const isGoogleUser = user.providerData.some(
        (provider) => provider.providerId === "google.com"
    );

    if (isGoogleUser) {
        throw new Error("GoogleUserChangePassword");
    }

  const credential = EmailAuthProvider.credential(user.email,currentPassword);

  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};


export const recoverPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
};