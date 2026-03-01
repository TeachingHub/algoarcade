import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorFallback from "./ErrorFallback";

interface ErrorBoundaryProps {
    children: ReactNode;
    /** If true, renders the full-page error variant (for root boundary) */
    fullPage?: boolean;
    /** Optional custom fallback component override */
    fallback?: ReactNode;
    /** Optional callback when an error is caught (for logging, analytics, etc.) */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * React Error Boundary — catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI instead of a white screen.
 *
 * Usage:
 *
 * ```tsx
 * // Around the entire app (full-page fallback):
 * <ErrorBoundary fullPage>
 *     <App />
 * </ErrorBoundary>
 *
 * // Around a specific section (inline fallback):
 * <ErrorBoundary>
 *     <GameComponent />
 * </ErrorBoundary>
 * ```
 *
 * Note: Error boundaries only catch errors during rendering, in lifecycle
 * methods, and in constructors. They do NOT catch errors inside event
 * handlers or async code — use try/catch for those.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error("[ErrorBoundary] Uncaught error:", error);
        console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);

        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback override
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorFallback
                    error={this.state.error}
                    onRetry={this.handleRetry}
                    fullPage={this.props.fullPage}
                />
            );
        }

        return this.props.children;
    }
}
