import styles from "@/styles/components/shared/Card.module.css";
import { type ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

interface CardProps {
    title: string;
    children: ReactNode;
    icon?: ReactNode;
    className?: string;
    defaultOpen?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
}

export default function Card({ title, children, icon, className = "", defaultOpen = false, isOpen: controlledIsOpen, onToggle }: CardProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalIsOpen(!internalIsOpen);
        }
    };

    return (
        <div
            className={`${styles.card} ${isOpen ? styles.expanded : ''} ${className}`}
            onClick={handleToggle}
        >
            <div className={styles.header}>
                {icon && <div className={styles.iconWrapper}>{icon}</div>}
                <div className={styles.titleWrapper}>
                    <h3 className={styles.title}>{title}</h3>
                    <ChevronDown className={styles.chevron} size={20} />
                </div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
