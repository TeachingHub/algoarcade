import { useState } from 'react';
import Layout from '@/layouts/Layout';
import GameTabs from '@/components/games/shared/GameTabs';
import PathfindingSandbox from '@/components/games/pathfinding/PathfindingSandbox';
import PathfindingCompetitive from '@/components/games/pathfinding/PathfindingCompetitive';
import GlobalLeaderboard from '@/components/games/shared/GlobalLeaderboard';
import { GameTimerProvider } from "@/context/GameTimerContext";

const Pathfinding_TABS = [
    { key: 'sandbox', label: 'SANDBOX' },
    { key: 'competitive', label: 'DAILY CHALLENGE' },
    { key: 'leaderboard', label: 'GLOBAL LEADERBOARD' },
];

export default function PathfindingkPage() {
    const [mode, setMode] = useState('sandbox');

    return (
        <GameTimerProvider>
            <Layout noFooter noPadding>
                <GameTabs
                    gameName="Pathfinding"
                    tabs={Pathfinding_TABS}
                    activeTab={mode}
                    onTabChange={setMode}
                />

                {mode === 'sandbox' && <PathfindingSandbox />}
                {mode === 'competitive' && <PathfindingCompetitive />}
                {mode === 'leaderboard' && <GlobalLeaderboard game="pathfinding" />}
            </Layout>
        </GameTimerProvider>
    );
}
