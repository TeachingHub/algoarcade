import Layout from "@/layouts/Layout";
import { useNavigate } from "react-router";
import GameCard from "@/components/cards/GameCard";
import styles from "@/styles/pages/games/Games.module.css";

export default function Games() {
  const navigate = useNavigate();

  const games = [
    {
      id: 'tsp',
      title: 'Traveling Salesperson',
      description: 'Find the shortest possible route that visits each city exactly once and returns to the origin city. A classic NP-hard problem.',
      path: '/games/tsp',
      difficulty: 'HARD' as const,
      tags: ['Graph', 'Optimization', 'NP-Hard']
    },
  ];

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
            <h1 className={styles.title}>ALGOARCADE</h1>
            <p className={styles.subtitle}>Master algorithms through play</p>
        </div>

        <div className={styles.grid}>
          {games.map((game) => (
            <GameCard
                key={game.id}
                title={game.title}
                description={game.description}
                difficulty={game.difficulty}
                tags={game.tags}
                onClick={() => navigate(game.path)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}