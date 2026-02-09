import styles from "@/styles/pages/games/GameLayout.module.css";
import Button from "@/components/shared/Button";
import Badge from "@/components/shared/Badge";

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
                <div className={styles.headerLeftText}>
                    <Button style={["link"]} to={backLink} >{"<"}</Button>
                    <h1 className={styles.title}>{title}</h1>
                </div>
                {badges.length > 0 && (
                    <div className={styles.badges}>
                        {badges.map((badge, index) => (
                            <Badge key={index} style={["secondary"]} label={badge} />
                        ))}
                    </div>
                )}
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
