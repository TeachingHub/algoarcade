import { useState } from 'react';
import Layout from '@/layouts/Layout';
import GameTabs from '@/components/games/shared/GameTabs';
import KnapsackSandbox from '@/components/games/knapsack/KnapsackSandbox';
//import KnapsackCompetitive from '@/components/games/knapsack/KnapsackCompetitive'; //Daily challenge not implemented yet
//import KnapsackGlobalLeaderboard from '@/components/games/knapsack/KnapsackGlobalLeaderboard'; //Daily challenge not implemented yet
import { GameTimerProvider } from "@/context/GameTimerContext";

const Knapsack_TABS = [
    { key: 'sandbox', label: 'SANDBOX' },
    //{ key: 'competitive', label: 'DAILY CHALLENGE' }, //Daily challenge not implemented yet
    //{ key: 'leaderboard', label: 'GLOBAL LEADERBOARD' }, //Daily challenge not implemented yet
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
                {/*mode === 'competitive' && <KnapsackCompetitive />*/}
                {/*mode === 'leaderboard' && <KnapsackGlobalLeaderboard />*/}
            </Layout>
        </GameTimerProvider>
    );
}
