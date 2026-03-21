import { useState } from "react";
import Layout from "@/layouts/Layout";
import styles from "@/styles/pages/admin/AdminDashboard.module.css";
import AdminPostsTab from "./components/AdminPostsTab";
import AdminUsersTab from "./components/AdminUsersTab";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>ADMIN DASHBOARD</h1>
                    <span className={styles.badge}>RESTRICTED AREA</span>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === "posts" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("posts")}
                    >
                        [ BLOG POSTS ]
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        [ MANAGE USERS ]
                    </button>
                </div>

                <div className={styles.fixedContentWrapper}>
                    {activeTab === "posts" && <AdminPostsTab />}
                    {activeTab === "users" && <AdminUsersTab />}
                </div>
            </div>
        </Layout>
    );
}
