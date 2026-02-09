import { useState } from 'react';
import Layout from "@/layouts/Layout";
import styles from "@/styles/pages/games/GameLayout.module.css";
import GameHeader from "@/components/games/shared/GameHeader";
import GameInstructions, { type InstructionItem } from "@/components/games/shared/GameInstructions";
import Button from "@/components/shared/Button";

export default function Pathfinding() {
    // Placeholder state
    const [stats] = useState([
        { label: "NODES", value: "0" },
        { label: "COST", value: "--" }
    ]);

    const instructions: InstructionItem[] = [
        { title: "1. Draw Walls", description: "Click and drag on the grid to create obstacles." },
        { title: "2. Set Points", description: "Move the Source (Green) and Destination (Red) nodes." },
        { title: "3. Visualize", description: "Select an algorithm and watch it find the shortest path!" }
    ];

    return (
        <Layout noHeader noFooter>
            <div className={styles.gameContainer}>
                <GameHeader
                    title="PATHFINDING"
                    badges={["MEDIUM", "GRID"]}
                    stats={stats}
                />

                <div className={styles.content}>
                    <div className={styles.mainColumn}>
                        {/* Placeholder for the Grid/Canvas */}
                        <div className={styles.canvasArea} style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Grid Visualization Component Coming Soon</span>
                        </div>

                        <GameInstructions instructions={instructions} />
                    </div>

                    <div className={styles.sidebar}>
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
                    </div>
                </div>
            </div>
        </Layout>
    );
}