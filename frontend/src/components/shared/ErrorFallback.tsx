import Button from "@/components/shared/Button";
import styles from "@/styles/components/shared/ErrorBoundary.module.css";

interface ErrorFallbackProps {
    /** The error that was caught */
    error?: Error | null;
    /** Callback to attempt recovery (re-mounts the children) */
    onRetry?: () => void;
    /** If true, renders as a full-page error (for the root boundary) */
    fullPage?: boolean;
    /** Custom title override */
    title?: string;
    /** Custom description override */
    description?: string;
}

/**
 * Fallback UI shown when an ErrorBoundary catches a crash.
 * Matches the app's retro arcade aesthetic.
 *
 * Can also be used standalone for async error states.
 */
export default function ErrorFallback({
    error,
    onRetry,
    fullPage = false,
    title = "> RUNTIME_ERROR_",
    description = "Something crashed during execution. The current node has been isolated to prevent a full system failure.",
}: ErrorFallbackProps) {
    return (
        <div className={`${styles.container} ${fullPage ? styles.fullPage : ''}`}>
            <div className={styles.icon}>💀</div>
            <h1 className={styles.errorCode}>CRASH</h1>
            <p className={styles.title}>{title}</p>

            <div className={styles.description}>
                <p>{description}</p>
            </div>

            {error && (
                <details className={styles.details}>
                    <summary style={{ cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 'var(--font-size-xxs)', marginBottom: 'var(--space-sm)' }}>
                        ERROR TRACE
                    </summary>
                    <pre className={styles.detailsText}>
                        {error.message}
                        {error.stack && `\n\n${error.stack}`}
                    </pre>
                </details>
            )}

            <div className={styles.actions}>
                {onRetry && (
                    <Button style={["primary"]} label="RETRY" onClick={onRetry} />
                )}
                <Button style={["secondary"]} label="RETURN TO ORIGIN" to="/" />
            </div>
        </div>
    );
}
