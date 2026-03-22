import styles from "@styles/components/shared/Button.module.css";
import { Link } from "react-router";

type ButtonStyle = "primary" | "secondary" | "tertiary" | "link" | "danger" | "fullWidth";

interface ButtonProps {
    style: ButtonStyle[];
    label?: string;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    to?: string;
    target?: "self" | "blank";
    rel?: string;
    ariaLabel?: string;
    disabled?: boolean;
    children?: React.ReactNode;
}

export default function Button({
    style = ["primary"],
    label,
    type = "button",
    onClick,
    to,
    target = "self",
    rel,
    ariaLabel,
    disabled = false,
    children,
}: ButtonProps) {
    
    const classNames = [
        styles.button,                   // base
        ...style.map((s) => styles[s])   // variantes: primary, secondary, etc.
    ].join(" ");

    if (to) {
        return (
            <Link
                to={to}
                target={target === "blank" ? "_blank" : "_self"}
                rel={rel}
                className={classNames}
                aria-label={ariaLabel}
            >
                {label || children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={classNames}
            aria-label={ariaLabel}
            disabled={disabled}
        >
            {label || children}
        </button>
    );
}
