import type { AlgorithmType } from '@/types/games/pathfinding';
import type { InteractionMode } from '@/hooks/games/usePathfinding';
import Button from '@/components/shared/Button';
import styles from '@/styles/pages/games/Pathfinding.module.css';

interface PathfindingControlsProps {
    algorithm: AlgorithmType;
    setAlgorithm: (algo: AlgorithmType) => void;
    mode: InteractionMode;
    setMode: (mode: InteractionMode) => void;
    isRunning: boolean;
    isSolved: boolean;
    speed: number;
    manualPathLength: number;
    onRun: () => void;
    onStop: () => void;
    onSubmitManual: () => void;
    onClearBoard: () => void;
    onClearVisualization: () => void;
    onGenMaze: () => void;
    onGenRandom: () => void;
    onSetSpeed: (speed: number) => void;
}

const ALGORITHMS: { value: AlgorithmType; label: string }[] = [
    { value: 'astar', label: 'A* Search' },
    { value: 'dijkstra', label: 'Dijkstra' },
    { value: 'bfs', label: 'BFS' },
    { value: 'dfs', label: 'DFS' },
];

const MODES: { value: InteractionMode; label: string; desc: string }[] = [
    { value: 'wall', label: 'Draw Walls', desc: 'click & drag' },
    { value: 'erase', label: 'Erase', desc: 'remove walls' },
    { value: 'manual', label: 'Solve Manually', desc: 'draw path' },
];

export default function PathfindingControls({
    algorithm,
    setAlgorithm,
    mode,
    setMode,
    isRunning,
    isSolved,
    speed,
    manualPathLength,
    onRun,
    onStop,
    onSubmitManual,
    onClearBoard,
    onClearVisualization,
    onGenMaze,
    onGenRandom,
    onSetSpeed,
}: PathfindingControlsProps) {
    return (
        <>
            {/* ── Mode ────────────────────────────────────── */}
            <div className={styles.controlPanel}>
                <h3>MODE</h3>
                <div className={styles.actions}>
                    {MODES.map(m => (
                        <label key={m.value} className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="mode"
                                checked={mode === m.value}
                                onChange={() => setMode(m.value)}
                                disabled={isRunning}
                            />
                            {m.label}
                            <span className={styles.modeDesc}>({m.desc})</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* ── Algorithm ───────────────────────────────── */}
            {mode !== 'manual' && (
                <div className={styles.controlPanel}>
                    <h3>ALGORITHM</h3>
                    <div className={styles.actions}>
                        <div className={styles.setting}>
                            <select
                                className={styles.selectInput}
                                value={algorithm}
                                onChange={e => setAlgorithm(e.target.value as AlgorithmType)}
                                disabled={isRunning}
                            >
                                {ALGORITHMS.map(a => (
                                    <option key={a.value} value={a.value}>{a.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.setting}>
                            <label className={styles.radioLabel}>
                                Speed: {speed}
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={100}
                                value={speed}
                                onChange={e => onSetSpeed(Number(e.target.value))}
                                className={styles.speedSlider}
                            />
                        </div>

                        {isRunning ? (
                            <Button style={["danger", "fullWidth"]} label="STOP" onClick={onStop} />
                        ) : (
                            <Button style={["primary", "fullWidth"]} label="VISUALIZE" onClick={onRun} disabled={isSolved} />
                        )}
                    </div>
                </div>
            )}

            {/* ── Manual Submit ────────────────────────────── */}
            {mode === 'manual' && (
                <div className={styles.controlPanel}>
                    <h3>MANUAL SOLVE</h3>
                    <div className={styles.actions}>
                        <p className={styles.manualHint}>
                            Click cells from <strong>start</strong> to <strong>end</strong> to draw your path. Click the previous cell to undo.
                        </p>
                        <p className={styles.manualCount}>Steps: {manualPathLength}</p>
                        <Button
                            style={["primary", "fullWidth"]}
                            label="SUBMIT PATH"
                            onClick={onSubmitManual}
                            disabled={manualPathLength < 2 || isSolved}
                        />
                    </div>
                </div>
            )}

            {/* ── Generate ────────────────────────────────── */}
            <div className={styles.controlPanel}>
                <h3>GENERATE</h3>
                <div className={styles.actions}>
                    <Button style={["secondary", "fullWidth"]} label="RANDOM MAZE" onClick={onGenMaze} disabled={isRunning} />
                    <Button style={["secondary", "fullWidth"]} label="RANDOM WALLS" onClick={onGenRandom} disabled={isRunning} />
                </div>
            </div>

            {/* ── Clear ───────────────────────────────────── */}
            <div className={styles.controlPanel}>
                <h3>CLEAR</h3>
                <div className={styles.actions}>
                    <Button style={["danger", "fullWidth"]} label="CLEAR VISUALIZATION" onClick={onClearVisualization} disabled={isRunning} />
                    <Button style={["danger", "fullWidth"]} label="CLEAR BOARD" onClick={onClearBoard} disabled={isRunning} />
                </div>
            </div>
        </>
    );
}
