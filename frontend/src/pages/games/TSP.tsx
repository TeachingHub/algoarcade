import { useState } from 'react';
import Layout from '@/layouts/Layout';
import GameTabs from '@/components/games/shared/GameTabs';
import TSPSandbox from '@/components/games/tsp/TSPSandbox';
import TSPCompetitive from '@/components/games/tsp/TSPCompetitive';
import TSPGlobalLeaderboard from '@/components/games/tsp/TSPGlobalLeaderboard';

const TSP_TABS = [
    { key: 'sandbox', label: 'SANDBOX' },
    { key: 'competitive', label: 'DAILY CHALLENGE' },
    { key: 'leaderboard', label: 'GLOBAL LEADERBOARD' },
];

export default function TSPPage() {
    const [mode, setMode] = useState('sandbox');

    return (
        <Layout noFooter noPadding>
            <GameTabs
                gameName="TSP"
                tabs={TSP_TABS}
                activeTab={mode}
                onTabChange={setMode}
            />

            {mode === 'sandbox' && <TSPSandbox />}
            {mode === 'competitive' && <TSPCompetitive />}
            {mode === 'leaderboard' && <TSPGlobalLeaderboard />}
        </Layout>
    );
}
