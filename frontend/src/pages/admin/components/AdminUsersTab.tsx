import { useEffect, useState } from "react";
import { getAllUsers, promoteToAdmin, demoteFromAdmin } from "@/services/adminService";
import type { UserProfileData } from "@/types/user/user";
import styles from "@/styles/pages/admin/AdminDashboard.module.css";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import Badge from "@/components/shared/Badge";
import Avatar from "@/components/shared/Avatar";
import Modal from "@/components/shared/Modal";

export default function AdminUsersTab() {
    const [users, setUsers] = useState<(UserProfileData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [promoting, setPromoting] = useState<string | null>(null);
    const [demoting, setDemoting] = useState<string | null>(null);
    const [userToPromote, setUserToPromote] = useState<(UserProfileData & { id: string }) | null>(null);
    const [userToDemote, setUserToDemote] = useState<(UserProfileData & { id: string }) | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const confirmPromote = async () => {
        if (!userToPromote) return;
        setPromoting(userToPromote.id);
        
        try {
            await promoteToAdmin(userToPromote.id);
            setUsers((prev) => 
                prev.map((user) => 
                    user.id === userToPromote.id ? { ...user, role: "ADMIN" } : user
                )
            );
        } catch (error) {
            console.error("Error promoting user:", error);
        } finally {
            setPromoting(null);
            setUserToPromote(null);
        }
    };

    const confirmDemote = async () => {
        if (!userToDemote) return;
        setDemoting(userToDemote.id);
        
        try {
            await demoteFromAdmin(userToDemote.id);
            setUsers((prev) => 
                prev.map((user) => 
                    user.id === userToDemote.id ? { ...user, role: "USER" } : user
                )
            );
        } catch (error) {
            console.error("Error demoting user:", error);
        } finally {
            setDemoting(null);
            setUserToDemote(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className={styles.content}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{'>'} USERS LIST_</h2>
                <div className={styles.actions}>
                    <Badge label={`TOTAL USERS: ${users.length}`} style={["primary"]} />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.avatarColumn}>#</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className={styles.avatarColumn}>
                                    <Avatar src={user.profilePic} fallback={user.username || "?"} size="small" />
                                </td>
                                <td>
                                    <strong>{user.username}</strong>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <Badge 
                                        label={user.role} 
                                        style={[user.role === "ADMIN" ? "danger" : "secondary"]} 
                                    />
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <Button 
                                            style={["primary"]}
                                            label={promoting === user.id ? "..." : "MAKE ADMIN"}
                                            onClick={() => setUserToPromote(user)}
                                            disabled={user.role === "ADMIN" || promoting === user.id}
                                        />
                                        {user.role === "ADMIN" && (
                                            <Button 
                                                style={["danger"]}
                                                label={demoting === user.id ? "..." : "REMOVE ADMIN"}
                                                onClick={() => setUserToDemote(user)}
                                                disabled={demoting === user.id}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={!!userToPromote}
                title="PROMOTE TO ADMIN"
                message={`Are you sure you want to promote ${userToPromote?.username} (${userToPromote?.email}) to ADMIN? This will give them full access to the dashboard.`}
                confirmLabel="PROMOTE"
                cancelLabel="CANCEL"
                onConfirm={confirmPromote}
                onCancel={() => setUserToPromote(null)}
            />

            <Modal
                isOpen={!!userToDemote}
                title="REMOVE ADMIN RIGHTS"
                message={`Are you sure you want to remove ADMIN rights from ${userToDemote?.username}? They will lose access to this dashboard.`}
                confirmLabel="DEMOTE"
                cancelLabel="CANCEL"
                onConfirm={confirmDemote}
                onCancel={() => setUserToDemote(null)}
                isDestructive
            />
        </div>
    );
}
