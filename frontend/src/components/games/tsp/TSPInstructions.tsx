import styles from "@/styles/pages/games/TSP.module.css";

export default function TSPInstructions() {
    return (
        <div className={styles.instructionsBlock}>
            <h3>HOW TO PLAY</h3>
            <div className={styles.instructionGrid}>
                <div className={styles.instructionItem}>
                    <h4>1. Choose a Mode</h4>
                    <p>Select a scenario from the dropdown or generate a random instance.</p>
                </div>
                <div className={styles.instructionItem}>
                    <h4>2. Connect the Dots</h4>
                    <p>In <strong>Manual Mode</strong>, click points to form a path. Try to find the shortest route without crossing lines!</p>
                </div>
                <div className={styles.instructionItem}>
                    <h4>3. Beat the AI</h4>
                    <p>Submit your path and see if the <strong>2-opt algorithm</strong> can improve it. If it can't, you win!</p>
                </div>
            </div>
        </div>
    );
}
