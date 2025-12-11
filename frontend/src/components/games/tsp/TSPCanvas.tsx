import { useRef, useEffect } from 'react';
import type { Point } from "@/types/games/tsp";
import { pathColor, manualPathColor, numberColor } from "@/utils/tsp/tsp";

interface TSPCanvasProps {
    width: number;
    height: number;
    points: Point[];
    bestPath: number[];
    manualPath: number[];
    bgElements: any[];
    algorithm: string;
    onPointClick: (id: number) => void;
    gameResult: string | null;
}

export default function TSPCanvas({
    width,
    height,
    points,
    bestPath,
    manualPath,
    bgElements,
    algorithm,
    onPointClick,
}: TSPCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Background Elements
        bgElements.forEach(el => {
            ctx.fillStyle = el.color;
            ctx.beginPath();
            if (el.type === 'rect') {
                ctx.fillRect(el.x, el.y, el.w, el.h);
            } else if (el.type === 'circle') {
                ctx.arc(el.x, el.y, el.r, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        // Loop closure for drawing paths
        const drawPathLine = (pathIndices: number[], color: string, isDashed: boolean) => {
            if (pathIndices.length < 2) return;

            ctx.strokeStyle = color;
            ctx.lineWidth = isDashed ? 2 : 3;
            ctx.setLineDash(isDashed ? [5, 5] : []);

            ctx.beginPath();
            for (let i = 0; i < pathIndices.length; i++) {
                const point = points.find(p => p.id === pathIndices[i]);
                if (point) {
                    if (i === 0) ctx.moveTo(point.x, point.y);
                    else ctx.lineTo(point.x, point.y);
                }
            }

            // Connect back to start if complete
            if (pathIndices.length === points.length) {
                const firstPoint = points.find(p => p.id === pathIndices[0]);
                if (firstPoint) ctx.lineTo(firstPoint.x, firstPoint.y);
            }

            ctx.stroke();
        };

        // 2. Draw Best Path (Algorithm Result)
        if (bestPath.length > 1) {
            drawPathLine(bestPath, pathColor, false);
        }

        // 3. Draw Manual Path
        if (manualPath.length > 1 && algorithm === 'manual') {
            drawPathLine(manualPath, manualPathColor, true);
        }

        // 4. Draw Points
        points.forEach((point, index) => {
            const isInManualPath = manualPath.includes(point.id);
            const manualIndex = manualPath.indexOf(point.id);

            // Point fill
            ctx.fillStyle = isInManualPath ? manualPathColor : pathColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Border
            ctx.strokeStyle = numberColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Number Label
            ctx.fillStyle = numberColor;
            ctx.font = 'bold 10px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (algorithm === 'manual' && isInManualPath) {
                ctx.fillText((manualIndex + 1).toString(), point.x, point.y);
            } else {
                ctx.fillText(index.toString(), point.x, point.y);
            }
        });
    };

    useEffect(() => {
        draw();
    }, [width, height, points, bestPath, manualPath, bgElements, algorithm]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        // Simple hit detection
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find closest point
        let closestId = -1;
        let closestDistance = Infinity;

        points.forEach(point => {
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            if (distance < closestDistance) {
                closestDistance = distance;
                closestId = point.id;
            }
        });

        // Hit threshold (20px radius)
        if (closestDistance < 20 && closestId !== -1) {
            onPointClick(closestId);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={handleCanvasClick}
            style={{
                cursor: algorithm === 'manual' ? 'crosshair' : 'default',
                display: 'block' // Ensure it behaves well in container
            }}
        />
    );
}
