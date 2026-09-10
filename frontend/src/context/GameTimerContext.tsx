import { createContext } from "react";
import type { ReactNode } from "react";
import { useTimer } from "@/hooks/useTimer";

type TimerApi = ReturnType<typeof useTimer>;
const GameTimerContext = createContext<TimerApi | null>(null);

export function GameTimerProvider({ children}: {children: ReactNode}) {
    const timer = useTimer();
    return (
        <GameTimerContext.Provider value={timer}>
            {children}
        </GameTimerContext.Provider>
    );
}

export default GameTimerContext;