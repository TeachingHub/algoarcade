import { useState } from 'react';
import styles from "@/styles/pages/games/Pathfinding.module.css";

import Button from "@/components/shared/Button";
import GameLayout from "@/layouts/GameLayout";


export default function Pathfinding() {
    // Placeholder state
    const [stats] = useState([
        { label: "NODES", value: "0" },
        { label: "COST", value: "--" }
    ]);

    return (
        <GameLayout
            title="PATHFINDING"
            badges={["MEDIUM", "GRID"]}
            stats={stats}
            instructions={[
                { title: "1. Draw Walls", description: "Click and drag on the grid to create obstacles." },
                { title: "2. Set Points", description: "Move the Source (Green) and Destination (Red) nodes." },
                { title: "3. Visualize", description: "Select an algorithm and watch it find the shortest path!" }
            ]}
            controls={
                <div className={styles.controlPanel}>
                    <h3>CONTROLS</h3>
                    <div className={styles.actions}>
                        {/* Placeholder controls */}
                        <div className={styles.setting}>
                            <label className={styles.radioLabel}>Algorithm</label>
                            <select className={styles.selectInput}>
                                <option>Dijkstra</option>
                                <option>A* Search</option>
                                <option>BFS</option>
                                <option>DFS</option>
                            </select>
                        </div>
                        <Button style={["primary"]}>Start</Button>
                        <Button style={["danger"]}>Clear Board</Button>
                    </div>
                </div>
            }
        >
            <div className={styles.canvasArea} style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Grid Visualization Component Coming Soon</span>
            </div>
        </GameLayout>
    );
}