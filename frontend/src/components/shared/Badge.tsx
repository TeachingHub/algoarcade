import styles from "@styles/components/shared/Badge.module.css";

export type BadgeStyle = "primary" | "secondary" | "danger";

interface BadgeProps {
    style?: BadgeStyle[];
    label: string;
}

export default function Badge({
    style = ["primary"],
    label,
}: BadgeProps) {
    
    const classNames = [
        styles.badge,                   // base
        ...style.map((s) => styles[s])   // variantes: primary, secondary, etc.
    ].join(" ");

    return (
        <span
            className={classNames}
        >
            {label}
        </span>
    );
}
