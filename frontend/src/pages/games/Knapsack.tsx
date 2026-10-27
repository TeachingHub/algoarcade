import { useState } from 'react';
import Layout from '@/layouts/Layout';
import GameTabs from '@/components/games/shared/GameTabs';
import KnapsackSandbox from '@/components/games/knapsack/KnapsackSandbox';
import KnapsackCompetitive from '@/components/games/knapsack/KnapsackCompetitive';
import GlobalLeaderboard from '@/components/games/shared/GlobalLeaderboard';
import { GameTimerProvider } from "@/context/GameTimerContext";

const Knapsack_TABS = [
    { key: 'sandbox', label: 'SANDBOX' },
    { key: 'competitive', label: 'DAILY CHALLENGE' },
    { key: 'leaderboard', label: 'GLOBAL LEADERBOARD' },
];

export default function KnapsackPage() {
    const [mode, setMode] = useState('sandbox');

    return (
        <GameTimerProvider>
            <Layout noFooter noPadding>
                <GameTabs
                    gameName="Knapsack"
                    tabs={Knapsack_TABS}
                    activeTab={mode}
                    onTabChange={setMode}
                />

                {mode === 'sandbox' && <KnapsackSandbox />}
                {mode === 'competitive' && <KnapsackCompetitive />}
                {mode === 'leaderboard' && <GlobalLeaderboard game="knapsack" />}
            </Layout>
        </GameTimerProvider>
    );
}
