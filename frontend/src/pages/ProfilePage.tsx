import Layout from "../layouts/Layout";
import { useAuth } from "../context/AuthContext";
import Button from "@/components/shared/Button";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import styles from "@/styles/pages/Profile.module.css";

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={user?.photoURL || "/avatar.png"}
                            alt="Profile"
                            className={styles.avatar}
                        />
                    </div>

                    <div className={styles.userInfo}>
                        <h1 className={styles.username}>{user?.displayName || "PLAYER 1"}</h1>

                        <div className={styles.actions}>
                            <Button
                                style={["primary"]}
                                label="EDIT PROFILE"
                                onClick={() => navigate("/profile/edit")}
                            />
                            <Button
                                style={["secondary"]}
                                label="DELETE ACCOUNT"
                                onClick={() => console.log("Delete account clicked")}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>ID:</span>
                        <span className={styles.value}>{user?.uid}</span>
                    </div>
                    <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}>
                        <span className={styles.label}>EMAIL:</span>
                        <span className={styles.value}>{user?.email}</span>
                    </div>
                </div>

                <div style={{ marginTop: "2rem", borderTop: "4px solid var(--input)", paddingTop: "1rem" }}>
                    <Button
                        style={["secondary"]}
                        label="LOGOUT"
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </Layout>
    );
}
