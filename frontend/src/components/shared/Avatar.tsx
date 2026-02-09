
import styles from '@/styles/components/shared/Avatar.module.css';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    fallback?: string;
    size?: "small" | "medium" | "large" | "xlarge";
    className?: string;
    onClick?: () => void;
}

export default function Avatar({
    src,
    alt = "Avatar",
    fallback,
    size = "medium",
    className = "",
    onClick
}: AvatarProps) {

    // Get initials for fallback
    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name.slice(0, 2).toUpperCase();
    };



    return (
        <div
            className={`${styles.container} ${styles[size]} ${className}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {src ? (
                <>
                    <img
                        src={src}
                        alt={alt}
                        className={styles.image}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            // Show fallback sibling
                            const sibling = e.currentTarget.nextElementSibling;
                            if (sibling) (sibling as HTMLElement).style.display = 'flex';
                        }}
                    />
                    <span
                        className={styles.fallback}
                        style={{ display: 'none' }}
                    >
                        {getInitials(fallback)}
                    </span>
                </>
            ) : (
                <span className={styles.fallback}>
                    {getInitials(fallback)}
                </span>
            )}
        </div>
    );
}
