import styles from "@/styles/components/games/shared/GameInstructions.module.css";



export interface InstructionItem {
    title: string;
    description: string;
}

interface GameInstructionsProps {
    title?: string;
    instructions: InstructionItem[];
}

export default function GameInstructions({
    title = "HOW TO PLAY",
    instructions
}: GameInstructionsProps) {
    return (
        <div className={styles.instructionsBlock}>
            <h3>{title}</h3>
            <div className={styles.instructionGrid}>
                {instructions.map((item, index) => (
                    <div key={index} className={styles.instructionItem}>
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
