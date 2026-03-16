import type { ReactNode } from "react";
import styles from "@/styles/layouts/GameLayout.module.css";

import GameNotLoggedMessage from "@/components/games/shared/GameNotLoggedMessage";
import GameHeader from "@/components/games/shared/GameHeader";
import GameInstructions, { type InstructionItem } from "@/components/games/shared/GameInstructions";

export interface GameStat {
    label: string;
    value: string | number;
}

interface GameLayoutProps {
    title: string;
    badges?: string[];
    stats?: GameStat[];
    instructions?: InstructionItem[];
    controls: ReactNode;
    children: ReactNode;
    contextInfo?: {
        title: string;
        description: string;
    } | null;
}

/**
 * Pure structural layout for a game page.
 * Renders: GameHeader + canvas area + sidebar.
 *
 * Does NOT wrap in Layout (Header/Footer).
 * The parent page is responsible for wrapping in Layout.
 */
export default function GameLayout({
    title,
    badges,
    stats,
    instructions,
    controls,
    children,
    contextInfo
}: GameLayoutProps) {
    return (
        <div className={styles.gameContainer}>
            <GameNotLoggedMessage />

            <GameHeader
                title={title}
                badges={badges}
                stats={stats}
            />

            {contextInfo && (
                <div className={styles.contextBlock}>
                    <h3 className={styles.contextTitle}>{contextInfo.title}</h3>
                    <p className={styles.contextDescription}>{contextInfo.description}</p>
                </div>
            )}

            <div className={styles.content}>
                <div className={styles.mainColumn}>
                    {children}

                    {instructions && (
                        <GameInstructions instructions={instructions} />
                    )}
                </div>

                <div className={styles.sidebar}>
                    {controls}
                </div>
            </div>
        </div>
    );
}
