import { useGameTimer } from "@/hooks/useGameTimer";

function fmt(ms: number) {
    const s = Math.floor(ms / 1000);
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
}

export default function GameTimer() {
    const { elapsedMs} = useGameTimer();
    return (
        <div className="game-timer">
            <span>{fmt(elapsedMs)}</span>
        </div>
    );
}