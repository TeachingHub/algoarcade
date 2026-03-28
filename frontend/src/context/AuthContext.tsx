import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { auth, configError } from "../firebase/config";
import type { UserProfileData } from "@/types/user/user";
import { createUserDocument, getUserDocument } from "../services/userService";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/localStorageUtils";
import { loginUser, registerUser, loginWithGoogle as loginWithGoogleService } from "@/services/authService";
import ErrorFallback from "@/components/shared/ErrorFallback";

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
    const [authError, setAuthError] = useState<Error | null>(null);

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
        if (!user) return;

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
        // Don't try to initialize auth if Firebase config is invalid
        if (configError) {
            setAuthError(configError);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(
            auth,
            async (currentUser) => {
                setUser(currentUser);

                if (currentUser) {
                    try {
                        let profile = await getUserDocument(currentUser);

                        // Redirect-based Google login may reach here before profile is created.
                        if (!profile) {
                            await createUserDocument(currentUser);
                            profile = await getUserDocument(currentUser);
                        }

                        setUserProfile(profile);
                    } catch (e) {
                        console.error("Error fetching user profile:", e);
                    }
                } else {
                    setUserProfile(null);
                    localStorage.removeItem("user");
                    localStorage.removeItem("userProfile");
                }

                setLoading(false);
            },
            (error) => {
                // Firebase auth failed (bad config, network, etc.)
                console.error("Firebase auth error:", error);
                setAuthError(error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Show styled error if Firebase auth initialization failed
    if (authError) {
        return (
            <ErrorFallback
                error={authError}
                fullPage
                title="> AUTH_INIT_FAILED_"
                description="Could not connect to the authentication service. Check your Firebase configuration and network connection."
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, login, register, loginWithGoogle, refreshUserProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};