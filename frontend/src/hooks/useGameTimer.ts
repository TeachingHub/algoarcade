import { useContext } from "react";
import GameTimerContext from "@/context/GameTimerContext";

export function useGameTimer() {
    const ctx = useContext(GameTimerContext);
    if (!ctx) throw new Error("useGameTimer must be used inside GameTimerProvider");
    return ctx;
}