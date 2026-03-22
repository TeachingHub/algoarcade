import type { AlgorithmType } from '@/types/games/pathfinding';
import type { InteractionMode } from '@/hooks/games/usePathfinding';
import Button from '@/components/shared/Button';
import styles from '@/styles/pages/games/Pathfinding.module.css';
import { Pencil, Eraser, Gamepad2, Eye } from 'lucide-react';

interface PathfindingControlsProps {
    algorithm: AlgorithmType;
    setAlgorithm: (algo: AlgorithmType) => void;
    comparisonAlgorithm: AlgorithmType;
    setComparisonAlgorithm: (algo: AlgorithmType) => void;
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

const modes = [
    { key: 'visualize' as const, category: 'WATCH', categoryClass: 'categoryVisualize', icon: <Eye size={18} />, label: 'VISUALIZE', description: 'Watch algorithm' },
    { key: 'manual' as const, category: 'PLAY', categoryClass: 'categoryPlay', icon: <Gamepad2 size={18} />, label: 'SOLVE MANUALLY', description: 'Draw path' },
    { key: 'wall' as const, category: 'BUILD', categoryClass: 'categoryBuild', icon: <Pencil size={18} />, label: 'DRAW WALLS', description: 'Click & drag' },
    { key: 'erase' as const, category: 'BUILD', categoryClass: 'categoryBuild', icon: <Eraser size={18} />, label: 'ERASE', description: 'Remove walls' },
];

export default function PathfindingControls({
    algorithm,
    setAlgorithm,
    comparisonAlgorithm,
    setComparisonAlgorithm,
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
                <div className={styles.modeGrid2x2}>
                    {modes.map((m) => (
                        <button
                            key={m.key}
                            className={`${styles.modeButton} ${mode === m.key ? `${styles.modeButtonActive} ${styles[m.categoryClass]}` : ''}`}
                            onClick={() => setMode(m.key)}
                            disabled={isRunning}
                        >
                            <span className={`${styles.modeBadge} ${styles[m.categoryClass]}`}>{m.category}</span>
                            <div className={styles.modeIconLabel}>
                                {m.icon}
                                <span className={styles.modeLabel}>{m.label}</span>
                            </div>
                            <span className={styles.modeDescription}>{m.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Algorithm (visualize mode) ───────────────── */}
            {mode === 'visualize' && (
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
                            <span className={styles.speedLabel}>Speed: {speed}</span>
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
                            <Button style={["primary", "fullWidth"]} label="VISUALIZE" onClick={onRun} />
                        )}
                    </div>
                </div>
            )}

            {/* ── Manual Solve ─────────────────────────────── */}
            {mode === 'manual' && (
                <div className={styles.controlPanel}>
                    <h3>MANUAL SOLVE</h3>
                    <div className={styles.actions}>
                        <p className={styles.manualHint}>
                            Click or <strong>drag</strong> cells from <strong>start</strong> to <strong>end</strong> to draw your path. Click the previous cell to undo.
                        </p>
                        <p className={styles.manualCount}>Steps: {manualPathLength}</p>

                        <div className={styles.setting}>
                            <span className={styles.speedLabel}>Compare against:</span>
                            <select
                                className={styles.selectInput}
                                value={comparisonAlgorithm}
                                onChange={e => setComparisonAlgorithm(e.target.value as AlgorithmType)}
                                disabled={isSolved}
                            >
                                {ALGORITHMS.map(a => (
                                    <option key={a.value} value={a.value}>{a.label}</option>
                                ))}
                            </select>
                        </div>

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
                    <Button style={["danger", "fullWidth"]} label="CLEAR PATH" onClick={onClearVisualization} disabled={isRunning} />
                    <Button style={["danger", "fullWidth"]} label="CLEAR BOARD" onClick={onClearBoard} disabled={isRunning} />
                </div>
            </div>
        </>
    );
}
