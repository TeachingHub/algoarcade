import styles from "@/styles/pages/games/TSP.module.css";
import Button from "@/components/shared/Button";
import Badge from "@/components/shared/Badge";
import { formatDistance } from "@/utils/tsp/tsp";
import type { TSPState } from "@/types/games/tsp";

interface TSPHeaderProps {
    gameState: TSPState;
}

export default function TSPHeader({ gameState }: TSPHeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.headerLeftText}>
                    <Button style={["link"]} to="/games" >{"<"}</Button>
                    <h1 className={styles.title}> TRAVELING SALESPERSON</h1>
                </div>
                <div className={styles.badges}>
                    <Badge style={["secondary"]} label="HARD" />
                    <Badge style={["secondary"]} label="GRAPH" />
                </div>
            </div>
            <div className={styles.stats}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>BEST</span>
                    <span className={styles.statValue}>
                        {gameState.bestDistance === Infinity ? '--' : formatDistance(gameState.bestDistance)}
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>POINTS</span>
                    <span className={styles.statValue}>{gameState.points.length}</span>
                </div>
            </div>
        </div>
    );
}
