import styles from "@/styles/components/shared/Divider.module.css";


interface DividerProps {
    size?: "small" | "medium" | "large" | "xlarge";
    thickness?: "thin" | "medium" | "thick";
}

export default function Divider({ size = "medium", thickness = "medium" }: DividerProps) {
    return <hr className={`${styles.divider} ${styles[size]} ${styles[thickness]}`} />;
}