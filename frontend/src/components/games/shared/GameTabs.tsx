import styles from "@/styles/components/games/shared/GameTabs.module.css";

interface Tab {
    key: string;
    label: string;
}

interface GameTabsProps {
    gameName: string;
    tabs: Tab[];
    activeTab: string;
    onTabChange: (key: string) => void;
}

export default function GameTabs({ gameName, tabs, activeTab, onTabChange }: GameTabsProps) {
    return (
        <div className={styles.tabHeader}>
            <div className={styles.tabContent}>
                <span className={styles.gameName}>{gameName}</span>
                <div className={styles.tabGroup}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
