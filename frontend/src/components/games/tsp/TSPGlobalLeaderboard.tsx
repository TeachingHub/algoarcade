import { useState, useEffect } from 'react';
import { getGlobalLeaderboard, type GlobalLeaderboardEntry } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { CircleStar } from 'lucide-react';
import styles from '@/styles/components/games/tsp/TSPGlobalLeaderboard.module.css';

export default function TSPGlobalLeaderboard() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<GlobalLeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGlobalLeaderboard(20)
            .then(setEntries)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>GLOBAL LEADERBOARD</h2>
            <p className={styles.subtitle}>Medals are awarded daily to the top 3 players</p>

            {loading ? (
                <p className={styles.loading}>Loading...</p>
            ) : entries.length === 0 ? (
                <p className={styles.empty}>No medals have been awarded yet. Play the daily challenge!</p>
            ) : (
                <table className={styles.table}>
                    <thead className={styles.tableHead}>
                        <tr>
                            <th>#</th>
                            <th>PLAYER</th>
                            <th><CircleStar size={14} className={styles.medalGold} /></th>
                            <th><CircleStar size={14} className={styles.medalSilver} /></th>
                            <th><CircleStar size={14} className={styles.medalBronze} /></th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, idx) => (
                            <tr
                                key={entry.uid}
                                className={`${styles.row} ${entry.uid === user?.uid ? styles.rowHighlight : ''}`}
                            >
                                <td className={styles.rank}>{idx + 1}</td>
                                <td>
                                    <div className={styles.userCell}>
                                        {entry.profilePic ? (
                                            <img src={entry.profilePic} alt={entry.username} className={styles.avatar} />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {entry.username.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <span className={styles.username}>{entry.username}</span>
                                    </div>
                                </td>
                                <td className={`${styles.medalCell} ${entry.gold === 0 ? styles.medalZero : ''}`}>
                                    {entry.gold}
                                </td>
                                <td className={`${styles.medalCell} ${entry.silver === 0 ? styles.medalZero : ''}`}>
                                    {entry.silver}
                                </td>
                                <td className={`${styles.medalCell} ${entry.bronze === 0 ? styles.medalZero : ''}`}>
                                    {entry.bronze}
                                </td>
                                <td className={styles.totalCell}>{entry.totalMedals}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
