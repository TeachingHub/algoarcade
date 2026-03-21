import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import Layout from "@/layouts/Layout";
import Loader from "@/components/shared/Loader";
import Badge from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import { getPostBySlug, formatDate, estimateReadTime } from "@/services/blogService";
import type { BlogPost } from "@/types/blog/post";
import styles from "@/styles/pages/BlogPost.module.css";
import { ArrowLeft, Clock } from "lucide-react";

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPost() {
            if (!slug) return;
            setLoading(true);
            const data = await getPostBySlug(slug);
            setPost(data);
            setLoading(false);
        }
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <Layout>
                <div className={styles.loadingContainer}>
                    <Loader />
                    <span className={styles.loadingText}>LOADING POST...</span>
                </div>
            </Layout>
        );
    }

    if (!post) {
        return (
            <Layout>
                <div className={styles.notFound}>
                    <h2 className={styles.notFoundTitle}>{'>'} POST_NOT_FOUND</h2>
                    <p className={styles.notFoundDescription}>
                        The post you are looking for does not exist or has been removed.
                    </p>
                    <Button
                        style={["primary"]}
                        label="BACK TO BLOG"
                        onClick={() => navigate("/blog")}
                    />
                </div>
            </Layout>
        );
    }

    const readTime = estimateReadTime(post.content);

    return (
        <Layout>
            <div className={styles.container}>
                <button className={styles.backLink} onClick={() => navigate("/blog")}>
                    <ArrowLeft size={14} />
                    {'<'} BACK TO BLOG
                </button>

                {post.coverImage && (
                    <div className={styles.coverImageWrapper}>
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className={styles.coverImage}
                        />
                    </div>
                )}

                <header className={styles.articleHeader}>
                    <div className={styles.metaRow}>
                        <span className={styles.date}>{formatDate(post.createdAt, "long")}</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.readTime}>
                            <Clock size={12} />
                            {readTime} MIN READ
                        </span>
                    </div>

                    <h1 className={styles.articleTitle}>{post.title}</h1>

                    <div className={styles.tags}>
                        {post.tags.map((tag) => (
                            <Badge style={["secondary"]} key={tag} label={tag} />
                        ))}
                    </div>

                    <p className={styles.author}>
                        By <span className={styles.authorName}>{post.author}</span>
                    </p>
                </header>

                <article className={styles.articleBody}>
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </article>
            </div>
        </Layout>
    );
}
