import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import type { UserProfileData } from "@/types/user/user";
import { getUserDocument } from "../services/userService";

interface AuthContextType {
    user: User | null; 
    userProfile: UserProfileData | null; 
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);

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
        <AuthContext.Provider value={{ user, userProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};