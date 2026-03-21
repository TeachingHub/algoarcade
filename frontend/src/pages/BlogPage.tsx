import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/layouts/Layout";
import BlogPostCard from "@/components/cards/BlogPostCard";
import Loader from "@/components/shared/Loader";
import { getPublishedPosts, formatDate, estimateReadTime } from "@/services/blogService";
import type { BlogPost } from "@/types/blog/post";
import styles from "@/styles/pages/Blog.module.css";
import { BookOpen } from "lucide-react";

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            const data = await getPublishedPosts();
            setPosts(data);
            setLoading(false);
        }
        fetchPosts();
    }, []);

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>BLOG</h1>
                    <p className={styles.subtitle}>{'>'} Deep dives into algorithms_</p>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Loader />
                        <span className={styles.loadingText}>LOADING POSTS...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <BookOpen size={48} className={styles.emptyIcon} />
                        <h2 className={styles.emptyTitle}>NO POSTS YET</h2>
                        <p className={styles.emptyDescription}>
                            Blog posts about algorithms and game mechanics will appear here soon. Stay tuned!
                        </p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {posts.map((post) => (
                            <BlogPostCard
                                key={post.id}
                                title={post.title}
                                excerpt={post.excerpt}
                                date={formatDate(post.createdAt)}
                                tags={post.tags}
                                coverImage={post.coverImage}
                                readTimeMin={estimateReadTime(post.content)}
                                onClick={() => navigate(`/blog/${post.slug}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
