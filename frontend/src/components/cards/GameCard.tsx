import styles from "@/styles/components/cards/GameCard.module.css";
import Button from "@/components/shared/Button";
import Badge, {type BadgeStyle } from "../shared/Badge";

interface GameCardProps {
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    tags: string[];
    onClick: () => void;
    thumbnail?: string;
}

export default function GameCard({
    title,
    description,
    difficulty,
    tags,
    onClick,
    thumbnail
}: GameCardProps) {

    const getDifficultyColor = (diff: string) : BadgeStyle => {
        switch (diff) {
            case 'EASY': return "primary";
            case 'MEDIUM': return "secondary";
            case 'HARD': return "danger";
            default: return "primary";
        }
    };

    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.imagePlaceholder}>
                {thumbnail ? (
                    <img src={thumbnail} alt={title} className={styles.thumbnailImage} />
                ) : (
                    <span className={styles.icon}>🎮</span>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.tags}>
                        {tags.map(tag => (
                            <Badge style={["secondary"]} key={tag} label={tag} />
                        ))}
                    </div>
                    <Badge style={[getDifficultyColor(difficulty)]} label={difficulty} />
                </div>

                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>

                <div className={styles.footer}>
                    <Button
                        style={["primary", "fullWidth"]}
                        label="PLAY NOW"
                        onClick={onClick}
                    />
                </div>
            </div>
        </div>
    );
}