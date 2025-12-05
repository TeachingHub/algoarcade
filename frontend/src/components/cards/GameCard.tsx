import styles from "@/styles/components/cards/GameCard.module.css";
import Button from "@/components/shared/Button";

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
    onClick 
}: GameCardProps) {
    
    const getDifficultyColor = (diff: string) => {
        switch(diff) {
            case 'EASY': return styles.easy;
            case 'MEDIUM': return styles.medium;
            case 'HARD': return styles.hard;
            default: return '';
        }
    };

    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.imagePlaceholder}>
                <span className={styles.icon}>🎮</span>
            </div>
            
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.tags}>
                        {tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                    </div>
                    <span className={`${styles.difficulty} ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                    </span>
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