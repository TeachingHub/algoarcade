import { useState } from 'react';
import Layout from '@/layouts/Layout';
import GameTabs from '@/components/games/shared/GameTabs';
import FlowshopSandbox from '@/components/games/flowshop/FlowshopSandbox';
import FlowshopCompetitive from '@/components/games/flowshop/FlowshopCompetitive';
import GlobalLeaderboard from '@/components/games/shared/GlobalLeaderboard';
import { GameTimerProvider } from "@/context/GameTimerContext";

const Flowshop_TABS = [
    { key: 'sandbox', label: 'SANDBOX' },
    { key: 'competitive', label: 'DAILY CHALLENGE' },
    { key: 'leaderboard', label: 'GLOBAL LEADERBOARD' },
];

export default function FlowshopPage() {
    const [mode, setMode] = useState('sandbox');

    return (
        <GameTimerProvider>
            <Layout noFooter noPadding>
                <GameTabs
                    gameName="Flowshop"
                    tabs={Flowshop_TABS}
                    activeTab={mode}
                    onTabChange={setMode}
                />

                {mode === 'sandbox' && <FlowshopSandbox />}
                {mode === 'competitive' && <FlowshopCompetitive />}
                {mode === 'leaderboard' && <GlobalLeaderboard game="flowshop" />}
            </Layout>
        </GameTimerProvider>
    );
}
