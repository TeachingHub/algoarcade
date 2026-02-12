import Layout from "@/layouts/Layout";
import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import styles from "@/styles/pages/Index.module.css";
import { ClipboardList, Zap, BarChart, Gamepad2 } from "lucide-react";
import { useState } from "react";

export default function Index() {
    const [activeCard, setActiveCard] = useState<number | null>(null);

    const toggleCard = (index: number) => {
        setActiveCard(activeCard === index ? null : index);
    };

    return (
        <Layout>
            <div className={styles.container}>
                <section className={styles.hero}>
                    <h1 className={styles.title}>ALGOARCADE</h1>
                    <h2 className={styles.subtitle}>{'>'} LEARN ALGORITHMS PLAYING_</h2>
                    <p className={styles.heroText}>
                        Master the most important computer science algorithms through interactive retro games. Fun + Learning = Victory.
                    </p>
                    <div className={styles.ctaButtons}>
                        <Button style={["primary"]} label="PLAY NOW" to="/games" />
                        <Button style={["secondary"]} label="READ BLOG" to="/blog" />
                    </div>
                </section>

                <section className={styles.features}>
                    <span className={styles.sectionTitle}>{'>'} INTRODUCTION TO ALGORITHMS_</span>
                    <p className={styles.sectionDescription}>
                        Algorithms are the foundation of modern programming. Here you will learn fundamental concepts while having fun with retro games.
                    </p>

                    <div className={styles.list}>
                        <Card
                            title="WHAT IS AN ALGORITHM"
                            icon={<ClipboardList />}
                            isOpen={activeCard === 0}
                            onToggle={() => toggleCard(0)}
                        >
                            An algorithm is a finite sequence of well-defined instructions that solve a problem or perform a specific task. Like a cooking recipe, but for computers.
                        </Card>

                        <Card
                            title="WHY THEY MATTER"
                            icon={<Zap />}
                            isOpen={activeCard === 1}
                            onToggle={() => toggleCard(1)}
                        >
                            Algorithms are the heart of computer science. From sorting data to finding the shortest path, efficient algorithms can make your application 1000x faster.
                        </Card>

                        <Card
                            title="ALGORITHMIC COMPLEXITY"
                            icon={<BarChart />}
                            isOpen={activeCard === 2}
                            onToggle={() => toggleCard(2)}
                        >
                            Big O notation measures how execution time grows. O(n²) vs O(n log n) can mean the difference between seconds and days for large datasets.
                        </Card>

                        <Card
                            title="LEARN BY PLAYING"
                            icon={<Gamepad2 />}
                            isOpen={activeCard === 3}
                            onToggle={() => toggleCard(3)}
                        >
                            The best way to understand algorithms is to visualize them in action. Our games let you experiment with TSP, A*, searching, and more interactively.
                        </Card>
                    </div>
                </section>
            </div>
        </Layout>
    );
}