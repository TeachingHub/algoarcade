// Resolve CSS custom properties at runtime for canvas drawing
function getCSSVar(name: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export const pathColor = getCSSVar('--primary', '#fdd505');
export const manualPathColor = getCSSVar('--accent', '#00a9b3');
export const numberColor = getCSSVar('--primary-foreground', '#00082b');
