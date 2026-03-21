import styles from "@/styles/components/cards/BlogPostCard.module.css";
import Badge from "@/components/shared/Badge";
import { Clock } from "lucide-react";

interface BlogPostCardProps {
    title: string;
    excerpt: string;
    date: string;
    tags: string[];
    coverImage?: string;
    readTimeMin: number;
    onClick: () => void;
}

export default function BlogPostCard({
    title,
    excerpt,
    date,
    tags,
    coverImage,
    readTimeMin,
    onClick,
}: BlogPostCardProps) {
    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.imagePlaceholder}>
                {coverImage ? (
                    <img src={coverImage} alt={title} className={styles.coverImage} />
                ) : (
                    <span className={styles.icon}>📝</span>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.meta}>
                    <span className={styles.date}>{date}</span>
                    <div className={styles.tags}>
                        {tags.map((tag) => (
                            <Badge style={["secondary"]} key={tag} label={tag} />
                        ))}
                    </div>
                </div>

                <h3 className={styles.title}>{title}</h3>
                <p className={styles.excerpt}>{excerpt}</p>

                <div className={styles.footer}>
                    <span className={styles.readMore}>{'>'} READ MORE_</span>
                    <span className={styles.readTime}>
                        <Clock size={12} />
                        {readTimeMin} MIN
                    </span>
                </div>
            </div>
        </div>
    );
}
