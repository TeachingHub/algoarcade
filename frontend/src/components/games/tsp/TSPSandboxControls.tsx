import { useState } from "react";
import Button from "@/components/shared/Button";
import styles from "@/styles/components/games/tsp/TSPControls.module.css";
import { Eye, RefreshCw, Gamepad2, Hammer } from "lucide-react";


interface TSPControlsProps {
    algorithm: 'nearest' | '2opt' | 'manual' | 'builder';
    setAlgorithm: (algo: 'nearest' | '2opt' | 'manual' | 'builder') => void;
    isRunning: boolean;
    pointsCount: number;
    manualPathLength: number;
    gameResult: unknown;
    speed: number;
    setSpeed: (speed: number) => void;
    customPointCount: number;
    setCustomPointCount: (count: number) => void;

    // Actions
    onRun: () => void;
    onStop: () => void;
    onSubmit: () => void;
    onReset: () => void;
    onGenerate: (pattern: string, count?: number) => void;
    onShare: () => Promise<boolean>;
}

export default function TSPControls({
    algorithm,
    setAlgorithm,
    isRunning,
    pointsCount,
    manualPathLength,
    gameResult,
    speed,
    setSpeed,
    customPointCount,
    setCustomPointCount,
    onRun,
    onStop,
    onSubmit,
    onReset,
    onGenerate,
    onShare
}: TSPControlsProps) {

    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

    const handleShare = async () => {
        const success = await onShare();
        if (success) {
            setCopyFeedback("Copied!");
            setTimeout(() => setCopyFeedback(null), 2000);
        } else {
            setCopyFeedback("Failed");
            setTimeout(() => setCopyFeedback(null), 2000);
        }
    };

    const modes = [
        { key: 'nearest' as const, icon: <Eye size={18} />, label: 'NEAREST', description: 'Neighbor' },
        { key: '2opt' as const, icon: <RefreshCw size={18} />, label: '2-OPT', description: 'Optimization' },
        { key: 'manual' as const, icon: <Gamepad2 size={18} />, label: 'MANUAL', description: 'Play Mode' },
        { key: 'builder' as const, icon: <Hammer size={18} />, label: 'BUILDER', description: 'Create Mode' },
    ];

    return (
        <>
            <div className={styles.controlPanel}>
                <h3>MODE</h3>
                <div className={styles.modeGrid}>
                    {modes.map((mode) => (
                        <button
                            key={mode.key}
                            className={`${styles.modeButton} ${algorithm === mode.key ? styles.modeButtonActive : ''}`}
                            onClick={() => setAlgorithm(mode.key)}
                            disabled={isRunning}
                        >
                            {mode.icon}
                            <span className={styles.modeLabel}>{mode.label}</span>
                            <span className={styles.modeDescription}>{mode.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.controlPanel}>
                <h3>CONTROLS</h3>
                <div className={styles.actions}>
                    {algorithm === 'builder' ? (
                        <Button
                            style={["primary", "fullWidth"]}
                            label="CLEAR POINTS"
                            onClick={onReset}
                        />
                    ) : algorithm !== 'manual' ? (
                        <>
                            {!isRunning ? (
                                <Button
                                    style={["primary", "fullWidth"]}
                                    label="RUN ALGORITHM"
                                    onClick={onRun}
                                    disabled={pointsCount < 2}
                                />
                            ) : (
                                <Button
                                    style={["secondary", "fullWidth"]}
                                    label="STOP"
                                    onClick={onStop}
                                />
                            )}
                        </>
                    ) : (
                        <Button
                            style={["primary", "fullWidth"]}
                            label="SUBMIT"
                            onClick={onSubmit}
                            disabled={manualPathLength !== pointsCount || !!gameResult}
                        />
                    )}

                    {algorithm !== 'builder' && (
                        <Button
                            style={["secondary", "fullWidth"]}
                            label="RESET PATH"
                            onClick={onReset}
                        />
                    )}
                </div>
            </div>

            <div className={styles.controlPanel}>
                <h3>START TRAINING!</h3>

                <div className={styles.setting}>
                    <span className={styles.statLabel} style={{ marginBottom: '5px' }}>CHOOSE A MODE</span>
                    <div className={styles.scenarioSelector}>
                        <select
                            className={styles.selectInput}
                            onChange={(e) => {
                                if (e.target.value) onGenerate(e.target.value);
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Select Scenario...</option>

                            <optgroup label="Challenges (Randomized)">
                                <option value="supermarket">🛒 Supermarket Run</option>
                                <option value="grid">🍕 Pizza Delivery</option>
                                <option value="islands">🏝️ Island Hopping</option>
                                <option value="corners">🔳 Four Corners</option>
                            </optgroup>

                            <optgroup label="Pattern Recognition">
                                <option value="star">⭐ Hidden Shapes</option>
                                <option value="constellation">✨ Broken Constellation</option>
                            </optgroup>

                            <optgroup label="Real World">
                                <option value="europe">🌍 Europe Map</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                <div className={styles.setting} style={{ marginTop: '15px' }}>
                    <span className={styles.statLabel} style={{ marginBottom: '5px' }}>GENERATE RANDOM INSTANCE</span>
                    <div className={styles.customGenRow}>
                        <input
                            type="number"
                            min="5"
                            max="50"
                            value={customPointCount}
                            onChange={(e) => setCustomPointCount(Math.min(50, Math.max(5, parseInt(e.target.value) || 5)))}
                            className={styles.numberInput}
                        />
                        <Button
                            style={["secondary", "fullWidth"]}
                            label="Go!"
                            onClick={() => onGenerate('random', customPointCount)}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.controlPanel}>
                <h3>SHARE CHALLENGE</h3>
                <Button
                    style={["primary", "fullWidth"]}
                    label={copyFeedback || "COPY LINK"}
                    onClick={handleShare}
                />
            </div>

            {(algorithm !== 'manual' && algorithm !== 'builder') && (
                <div className={styles.controlPanel}>
                    <h3>SPEED: {speed}%</h3>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={speed}
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        disabled={isRunning}
                        className={styles.slider}
                    />
                </div>
            )}
        </>
    );
}
