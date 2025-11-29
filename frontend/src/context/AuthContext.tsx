import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase/config";


// User defined in Firestore
export interface UserProfileData {
    username: string;
    email: string;
    role: "USER" | "ADMIN"; 
    profilePic: string;
    createdAt: any;
}

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
                // fetch user profile from Firestore
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data() as UserProfileData);
                    } else {
                            console.error("User document not found in Firestore");
                        setUserProfile(null);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUserProfile(null);
                }
            } else {
                // If no user (logout), clear the profile
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