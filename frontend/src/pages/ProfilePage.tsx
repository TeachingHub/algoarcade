import Layout from "../layouts/Layout";
import { useAuth } from "../context/AuthContext";
import Avatar from "@/components/shared/Avatar";
import Button from "@/components/shared/Button";
import { useNavigate } from "react-router";
import styles from "@/styles/pages/Profile.module.css";
import { deleteUserAccount, logoutUser } from "@/services/authService";
import Divider from "@/components/shared/Divider";
import Modal from "@/components/shared/Modal";
import { useState } from "react";
import Input from "@/components/shared/Input";
import Loader from "@/components/shared/Loader";
import { CircleStar } from "lucide-react";

function getCSSVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function ProfilePage() {
    const { user, userProfile, loading } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const isGoogleAuth = user?.providerData.some(
        (provider) => provider.providerId === "google.com"
    );

    const handleDeleteAccount = async () => {
        if (!user) return;
        try {
            await deleteUserAccount(confirmPassword);
            navigate("/");
        } catch (error: any) {
            console.error("Error deleting account:", error);
            if (error.code === 'auth/invalid-credential') {
                setDeleteError("Incorrect password.");
            } else if (error.code === 'auth/missing-password') {
                setDeleteError("Please enter your password to confirm.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                setDeleteError("Re-authentication cancelled.");
            } else {
                setDeleteError("Failed to delete account: " + error.message);
            }
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setConfirmPassword("");
        setDeleteError(null);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Avatar
                        src={user?.photoURL}
                        fallback={user?.displayName || "Player 1"}
                        size="xxlarge"
                    />

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
                <div className={styles.statsGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>EMAIL:</span>
                        <span className={styles.value}>{user?.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>ROLE:</span>
                        <span className={styles.value}>{userProfile?.role}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>MEMBER SINCE:</span>
                        <span className={styles.value}>
                            {userProfile?.createdAt?.toDate().toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <Divider size="xlarge" thickness="medium" />
                <div className={styles.medalsSection}>
                    <h2 className={styles.medalsSectionTitle}>TSP MEDALS</h2>
                    <div className={styles.medalsGrid}>
                        <div className={styles.medalCard}>
                            <CircleStar size={28} color={getCSSVar('--medal-gold')} />
                            <span className={styles.medalCount}>{userProfile?.tspMedals?.gold ?? 0}</span>
                            <span className={styles.medalLabel}>GOLD</span>
                        </div>
                        <div className={styles.medalCard}>
                            <CircleStar size={28} color={getCSSVar('--medal-silver')} />
                            <span className={styles.medalCount}>{userProfile?.tspMedals?.silver ?? 0}</span>
                            <span className={styles.medalLabel}>SILVER</span>
                        </div>
                        <div className={styles.medalCard}>
                            <CircleStar size={28} color={getCSSVar('--medal-bronze')} />
                            <span className={styles.medalCount}>{userProfile?.tspMedals?.bronze ?? 0}</span>
                            <span className={styles.medalLabel}>BRONZE</span>
                        </div>
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
                message={
                    isGoogleAuth
                        ? "Are you sure you want to delete your account? You will be asked to sign in with Google again to confirm."
                        : "Are you sure you want to delete your account? This action cannot be undone."
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteAccount}
                onCancel={() => closeDeleteModal()}
                isDestructive
                error={deleteError}
            >

                {!isGoogleAuth && (
                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                )}

            </Modal>
        </Layout>
    );
}
