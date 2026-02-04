import React from 'react';
import styles from "@/styles/components/shared/Divider.module.css";


interface DividerProps {
    size?: "small" | "medium" | "large" | "xlarge";
    thickness?: "thin" | "medium" | "thick";
    className?: string;
    children?: React.ReactNode;
}

export default function Divider({
    size = "medium",
    thickness = "thin",
    className = "",
    children
}: DividerProps) {
    const thicknessClass = thickness === 'medium' ? styles['medium-thick'] : styles[thickness];

    return (
        <div className={`${styles.container} ${styles[size]} ${thicknessClass} ${className}`}>
            <div className={styles.line} />
            {children && (
                <>
                    <span className={styles.text}>{children}</span>
                    <div className={styles.line} />
                </>
            )}
        </div>
    );
}