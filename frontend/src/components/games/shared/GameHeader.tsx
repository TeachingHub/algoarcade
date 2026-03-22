import styles from "@/styles/components/games/shared/GameHeader.module.css";

import Badge from "@/components/shared/Badge";
import { Home, ChevronRight } from "lucide-react";
import { Link } from "react-router";

interface GameStat {
    label: string;
    value: string | number;
}

interface GameHeaderProps {
    title: string;
    badges?: string[];
    stats?: GameStat[];
    backLink?: string;
}

export default function GameHeader({
    title,
    badges = [],
    stats = [],
    backLink = "/games"
}: GameHeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <nav className={styles.breadcrumbs}>
                    <Link to="/" className={styles.breadcrumbLink}>
                        <Home size={13} />
                        <span>HOME</span>
                    </Link>
                    <ChevronRight size={12} className={styles.breadcrumbSeparator} />
                    <Link to={backLink} className={styles.breadcrumbLink}>
                        GAMES
                    </Link>
                    <ChevronRight size={12} className={styles.breadcrumbSeparator} />
                    <span className={`${styles.breadcrumbLink} ${styles.breadcrumbCurrent}`}>
                        {title.split(':')[0]}
                    </span>
                </nav>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>{title}</h1>
                    {badges.length > 0 && (
                        <div className={styles.badges}>
                            {badges.map((badge, index) => (
                                <Badge key={index} style={["secondary"]} label={badge} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {stats.length > 0 && (
                <div className={styles.stats}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statBox}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <span className={styles.statValue}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
