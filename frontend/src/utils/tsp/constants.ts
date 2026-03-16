// Colors — resolved from CSS custom properties at draw time
export function getCanvasColors(element: HTMLElement) {
    const style = getComputedStyle(element);
    return {
        pathColor: style.getPropertyValue('--primary').trim(),
        manualPathColor: style.getPropertyValue('--accent').trim(),
        numberColor: style.getPropertyValue('--primary-foreground').trim(),
    };
}
