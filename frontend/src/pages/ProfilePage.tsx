import Layout from "../layouts/Layout";
import { useAuth } from "../context/AuthContext";
import Button from "@/components/shared/Button";
import { useNavigate } from "react-router";
import styles from "@/styles/pages/Profile.module.css";
import { logoutUser } from "@/services/authService";
import Divider from "@/components/shared/Divider";

export default function ProfilePage() {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
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
                <Divider size="xlarge" thickness="medium" />
                <div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>ID:</span>
                        <span className={styles.value}>{user?.uid}</span>
                    </div>
                    <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}>
                        <span className={styles.label}>EMAIL:</span>
                        <span className={styles.value}>{user?.email}</span>
                    </div>
                    <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}>
                        <span className={styles.label}>ROLE:</span>
                        <span className={styles.value}>{userProfile?.role}</span>
                    </div>
                    <div className={styles.infoItem} style={{ marginTop: '0.5rem' }}>
                        <span className={styles.label}>MEMBER SINCE:</span>
                        <span className={styles.value}>
                            {userProfile?.createdAt?.toDate().toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <Divider size="xlarge" thickness="medium" />
                <Button
                    style={["secondary"]}
                    label="LOGOUT"
                    onClick={handleLogout}
                />
            </div>
        </Layout>
    );
}
