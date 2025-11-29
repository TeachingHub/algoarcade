import styles from "@/styles/components/shared/Modal.module.css"; // Necesitarás crear este CSS
import Button from "./Button";

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
    children?: React.ReactNode;
    error?: string | null;
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isDestructive = false,
    children,
    error
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                {error ? <div className={styles.error}>{error}</div> : null}
                <div className={styles.inputContainer}>
                    {children}
                </div>
                <div className={styles.actions}>
                    <Button 
                        style={["secondary"]} 
                        label={cancelLabel} 
                        onClick={onCancel} 
                    />
                    <Button 
                        style={isDestructive ? ["danger"] : ["primary"]} 
                        label={confirmLabel} 
                        onClick={onConfirm} 
                    />
                </div>
            </div>
        </div>
    );
}