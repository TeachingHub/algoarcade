import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import type { UserProfileData } from "@/types/user/user";
import { getUserDocument } from "../services/userService";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/localStorageUtils";
import { loginUser, registerUser, loginWithGoogle as loginWithGoogleService } from "@/services/authService";

interface AuthContextType {
    user: User | null;
    userProfile: UserProfileData | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    login: () => Promise.resolve(),
    register: () => Promise.resolve(),
    loginWithGoogle: () => Promise.resolve(),
    refreshUserProfile: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const localStorageUser = getFromLocalStorage<User>("user");
    const localStorageUserProfile = getFromLocalStorage<UserProfileData>("userProfile");
    const [user, setUser] = useState<User | null>(localStorageUser);
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(localStorageUserProfile);
    const [loading, setLoading] = useState(true);

    const login = async (email: string, password: string) => {
        const { user } = await loginUser(email, password);
        const userProfile = await getUserDocument(user);
        saveToLocalStorage<User>("user", user);
        saveToLocalStorage<UserProfileData | null>("userProfile", userProfile);
        setUser(user);
        setUserProfile(userProfile);
    };

    const register = async (email: string, password: string, username: string) => {
        const user = await registerUser(email, password, username);
        const userProfile = await getUserDocument(user);
        saveToLocalStorage<User>("user", user);
        saveToLocalStorage<UserProfileData | null>("userProfile", userProfile);
        setUser(user);
        setUserProfile(userProfile);
    };

    const loginWithGoogle = async () => {
        const user = await loginWithGoogleService();
        const userProfile = await getUserDocument(user);
        saveToLocalStorage<User>("user", user);
        saveToLocalStorage<UserProfileData | null>("userProfile", userProfile);
        setUser(user);
        setUserProfile(userProfile);
    };

    const refreshUserProfile = async () => {
        if (user) {
            const updatedProfile = await getUserDocument(user);
            saveToLocalStorage<UserProfileData | null>("userProfile", updatedProfile);
            setUserProfile(updatedProfile);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                setUserProfile(await getUserDocument(currentUser));
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, login, register, loginWithGoogle, refreshUserProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};