import { useEffect, useState } from "react";
import { getAllPosts, deletePost, togglePostPublished } from "@/services/blogService";
import { seedBlogPosts } from "@/utils/seedBlogPosts";
import type { BlogPost } from "@/types/blog/post";
import styles from "@/styles/pages/admin/AdminDashboard.module.css";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import Badge from "@/components/shared/Badge";
import Modal from "@/components/shared/Modal";
import CreatePostForm from "./CreatePostForm";

export default function AdminPostsTab() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const loadPosts = async () => {
        setLoading(true);
        const data = await getAllPosts();
        setPosts(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleSeedPosts = async () => {
        setIsSeeding(true);
        try {
            await seedBlogPosts();
            await loadPosts();
        } catch (error) {
            console.error("Error seeding posts:", error);
        } finally {
            setIsSeeding(false);
        }
    };

    const handleToggleVisibility = async (postId: string, currentStatus: boolean) => {
        try {
            await togglePostPublished(postId, currentStatus);
            setPosts((prev) => 
                prev.map((post) => 
                    post.id === postId ? { ...post, published: !currentStatus } : post
                )
            );
        } catch (error) {
            console.error("Error toggling post visibility:", error);
        }
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        setIsDeleting(postToDelete.id);
        
        try {
            await deletePost(postToDelete.id);
            setPosts((prev) => prev.filter((post) => post.id !== postToDelete.id));
        } catch (error) {
            console.error("Error deleting post:", error);
        } finally {
            setIsDeleting(null);
            setPostToDelete(null);
        }
    };

    if (loading) return <Loader />;

    if (showCreateForm || editingPost) {
        return (
            <CreatePostForm
                postToEdit={editingPost || undefined}
                onPostCreated={() => {
                    setShowCreateForm(false);
                    setEditingPost(null);
                    loadPosts();
                }}
                onCancel={() => {
                    setShowCreateForm(false);
                    setEditingPost(null);
                }}
            />
        );
    }

    return (
        <div className={styles.content}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{'>'} BLOG POSTS</h2>
                <div className={styles.actions}>
                    <Button
                        style={["primary"]}
                        label="+ NEW POST"
                        onClick={() => setShowCreateForm(true)}
                    />
                    {posts.length === 0 && (
                        <Button 
                            style={["secondary"]} 
                            label={isSeeding ? "SEEDING..." : "SEED INITIAL POSTS"} 
                            onClick={handleSeedPosts} 
                            disabled={isSeeding} 
                        />
                    )}
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Slug</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className={styles.emptyState}>NO POSTS FOUND — Create one or seed initial posts.</div>
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id}>
                                    <td>
                                        <strong>{post.title}</strong>
                                    </td>
                                    <td>
                                        <span style={{ opacity: 0.6 }}>/blog/{post.slug}</span>
                                    </td>
                                    <td>
                                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td>
                                        <Badge 
                                            label={post.published ? "PUBLISHED" : "DRAFT"} 
                                            style={[post.published ? "primary" : "secondary"]} 
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Button 
                                                style={[post.published ? "secondary" : "primary"]}
                                                label={post.published ? "HIDE" : "PUBLISH"}
                                                onClick={() => handleToggleVisibility(post.id, post.published)}
                                            />
                                            <Button 
                                                style={["primary"]}
                                                label="EDIT"
                                                onClick={() => setEditingPost(post)}
                                            />
                                            <Button 
                                                style={["danger"]}
                                                label={isDeleting === post.id ? "..." : "DELETE"}
                                                onClick={() => setPostToDelete(post)}
                                                disabled={isDeleting === post.id}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={!!postToDelete}
                title="DELETE POST"
                message={`Are you sure you want to delete "${postToDelete?.title}"? This cannot be undone.`}
                confirmLabel="DELETE"
                cancelLabel="CANCEL"
                onConfirm={confirmDelete}
                onCancel={() => setPostToDelete(null)}
                isDestructive
            />
        </div>
    );
}
