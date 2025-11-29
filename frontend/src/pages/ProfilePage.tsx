import Layout from "../layouts/Layout";
import { useAuth } from "../context/AuthContext";
import Button from "@/components/shared/Button";
import { useNavigate } from "react-router";
import styles from "@/styles/pages/Profile.module.css";
import { deleteUserAccount, logoutUser } from "@/services/authService";
import Divider from "@/components/shared/Divider";
import Modal from "@/components/shared/Modal";
import { useState } from "react";

export default function ProfilePage() {
    const { user, userProfile } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        try {
            await deleteUserAccount(confirmPassword);
            navigate("/"); 
        } catch (error: any) {
            console.error("Error deleting account:", error);
            if (error.code === 'auth/wrong-password') {
                alert("Incorrect password.");
            } else {
                alert("Failed to delete account: " + error.message);
            }
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setConfirmPassword("");
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
                                onClick={() => setIsDeleteModalOpen(true)}
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
            
            <Modal
                isOpen={isDeleteModalOpen}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteAccount}
                onCancel={() => closeDeleteModal()}
                isDestructive
            >
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </Modal>
        </Layout>
    );
}
