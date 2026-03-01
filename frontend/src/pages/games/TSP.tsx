import { useState } from 'react';
import TSPSandbox from '@/components/games/tsp/TSPSandbox';
import TSPCompetitive from '@/components/games/tsp/TSPCompetitive';
import styles from '@/styles/pages/games/TSP.module.css';

export default function TSPPage() {
    const [mode, setMode] = useState<'sandbox' | 'competitive'>('sandbox');

    return (
        <div className={styles.pageWrapper}>
            {/* Simple Tab Header for Mode Switching */}
            <div className={styles.tabHeader}>
                <button
                    onClick={() => setMode('sandbox')}
                    className={`${styles.tabButton} ${mode === 'sandbox' ? styles.tabButtonActive : styles.tabButtonInactive}`}
                >
                    SANDBOX & BUILDER
                </button>
                <button
                    onClick={() => setMode('competitive')}
                    className={`${styles.tabButton} ${mode === 'competitive' ? styles.tabButtonActive : styles.tabButtonInactive}`}
                >
                    DAILY CHALLENGE
                </button>
            </div>

            {/* Mount the active mode component. React completely destroys and mounts changing the key or just conditionally rendering helps reset completely state */}
            {mode === 'sandbox' ? (
                <TSPSandbox />
            ) : (
                <TSPCompetitive />
            )}
        </div>
    );
}
