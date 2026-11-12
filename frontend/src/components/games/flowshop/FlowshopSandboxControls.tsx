import { useState } from "react";
import Button from "@/components/shared/Button";
import styles from "@/styles/components/games/tsp/TSPControls.module.css";
import { Eye, RefreshCw, Gamepad2, Hammer } from "lucide-react";
import { exampleJobs, exampleMachines } from "@/utils/flowshop";
import InstanceSharingControls from "../shared/InstanceSharingControls";


interface FlowshopControlsProps {
    selectedMode: 'algorithm' | 'random' | 'manual' | 'builder';
    setSelectedMode: (mode: 'algorithm' | 'random' | 'manual' | 'builder') => void;
    isRunning: boolean;
    jobsCount: number;
    gameResult: unknown;
    customNumberJobs: number;
    setCustomNumberJobs: (count: number) => void;
    customOperationsMinDuration: number;
    setCustomOperationsMinDuration: (count: number) => void;
    customOperationsMaxDuration: number;
    setCustomOperationsMaxDuration: (count: number) => void;
    addJob: (name: string, operations: number[], icon: string) => void;

    // Actions
    onRun: () => void;
    onStop: () => void;
    onSubmit: () => void;
    onReset: () => void;
    onGenerate: (count?: number, minDuration?: number, maxDuration?: number) => void;
    onShare: () => Promise<string | null>;
}

export default function FlowshopControls({
    selectedMode,
    setSelectedMode,
    isRunning,
    jobsCount,
    gameResult,
    customNumberJobs,
    setCustomNumberJobs,
    customOperationsMinDuration,
    setCustomOperationsMinDuration,
    customOperationsMaxDuration,
    setCustomOperationsMaxDuration,
    addJob,
    onRun,
    onStop,
    onSubmit,
    onReset,
    onGenerate,
    onShare
}: FlowshopControlsProps) {

    const [isCustom, setIsCustom] = useState(false);
    const [newJobIcon, setNewJobIcon] = useState("");
    const [newJobName, setNewJobName] = useState("");
    const [newJobOperations, setNewJobOperations] = useState<number[]>([]);

    const modes = [
        { key: 'algorithm' as const, category: 'VISUALIZE', categoryClass: styles.categoryVisualize, icon: <Eye size={18} />, label: 'SOLUTION', description: 'See solution' },
        { key: 'random' as const, category: 'GENERATE', categoryClass: styles.categoryVisualize, icon: <RefreshCw size={18} />, label: 'RANDOM', description: 'New game' },
        { key: 'manual' as const, category: 'PLAY', categoryClass: styles.categoryPlay, icon: <Gamepad2 size={18} />, label: 'MANUAL', description: 'Solve yourself' },
        { key: 'builder' as const, category: 'CREATE', categoryClass: styles.categoryCreate, icon: <Hammer size={18} />, label: 'BUILDER', description: 'Create jobs' },
    ];

    return (
        <>
            <div className={styles.controlPanel}>
                <h3>MODE</h3>
                <div className={styles.modeGrid2x2}>
                    {modes.map((mode) => (
                        <button
                            key={mode.key}
                            className={`${styles.modeButton} ${selectedMode === mode.key ? `${styles.modeButtonActive} ${mode.categoryClass}` : ''}`}
                            onClick={() => setSelectedMode(mode.key)}
                            disabled={isRunning}
                        >
                            <span className={`${styles.modeBadge} ${mode.categoryClass}`}>{mode.category}</span>
                            <div className={styles.modeIconLabel}>
                                {mode.icon}
                                <span className={styles.modeLabel}>{mode.label}</span>
                            </div>
                            <span className={styles.modeDescription}>{mode.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {selectedMode !== 'random' && (
                <div className={styles.controlPanel}>
                    <h3>CONTROLS</h3>
                    <div className={styles.actions}>
                        {selectedMode === 'builder' ? (
                            <Button
                                style={["primary", "fullWidth"]}
                                label="CLEAR JOBS"
                                onClick={onReset}
                            />
                        ) : selectedMode === 'algorithm' ? (
                            <>
                                {!isRunning ? (
                                    <Button
                                        style={["primary", "fullWidth"]}
                                        label="RUN ALGORITHM"
                                        onClick={onRun}
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
                                disabled={!!gameResult}
                            />
                        )}

                        {selectedMode !== 'builder' && (
                            <Button
                                style={["secondary", "fullWidth"]}
                                label="RESET SOLUTION"
                                onClick={onReset}
                            />
                        )}
                    </div>
                </div> 
            )}

            {(selectedMode === 'builder') && (
                <div className={styles.controlPanel}>
                    <h3>BUILDER</h3>
                    <div className={`${styles.setting} ${styles.settingSpaced}`}>
                        <div>
                            <span className={`${styles.statLabel} ${styles.sectionLabel}`}>ICON</span>
                            <div className={styles.scenarioSelector}>
                                <select
                                    className={styles.selectInput}
                                    onChange={(e) => setNewJobIcon(e.target.value)}
                                    value={newJobIcon}
                                >
                                    <option value="" disabled>Select Icon...</option>

                                    {exampleJobs.map((job) => (
                                        <option key={job.name} value={job.icon}>
                                            {job.icon} {job.name}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            <span className={`${styles.statLabel} ${styles.sectionLabel}`}>NAME</span>
                            <input
                                type="text"
                                value={newJobName}
                                onChange={(e) => setNewJobName(e.target.value)}
                                className={styles.textInput}
                            />
                            
                            <div className={styles.valueWeightRow}>
                                {exampleMachines.map((machine, index) => (
                                    <div key={index}>
                                        <span className={`${styles.statLabel} ${styles.sectionLabel}`}>
                                            {machine.name} time
                                        </span>

                                        <input
                                            type="number"
                                            min="1"
                                            value={newJobOperations[index] ?? ""}
                                            onChange={(e) => {
                                                const newOperations = [...newJobOperations];
                                                newOperations[index] = (parseInt(e.target.value));
                                                setNewJobOperations(newOperations);
                                            }}
                                            className={styles.numberInput}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button
                                style={["secondary"]}
                                label="Add Job"
                                onClick={() => addJob(newJobName, newJobOperations, newJobIcon)}
                                disabled={!newJobName || newJobOperations.length !== exampleMachines.length || newJobOperations.some(value => value == null || isNaN(value) || value < 1)}
                            />
                    </div>
                </div>
            )}

            {(selectedMode === 'random') && (
                <div className={styles.controlPanel}>
                    <h3>START TRAINING!</h3>

                    <div className={styles.setting}>
                        <span className={`${styles.statLabel} ${styles.sectionLabel}`}>GENERATE RANDOM INSTANCE</span>
                        <label><input className={styles.customCheckbox} type="checkbox" checked={isCustom} onChange={(e) => setIsCustom(e.target.checked)}/>Custom</label>
                    </div>

                    {isCustom && (
                    <div className={`${styles.setting} ${styles.settingSpaced}`}>
                        <span className={`${styles.statLabel} ${styles.sectionLabel}`}>NUMBER OF JOBS</span>
                        <div className={styles.customGenRow}>
                            <input
                                type="number"
                                min="3"
                                max="8"
                                value={customNumberJobs}
                                onChange={(e) => setCustomNumberJobs(Math.min(8, parseInt(e.target.value)))}
                                className={styles.numberInput}
                            />
                        </div>
                        <span className={`${styles.statLabel} ${styles.sectionLabel}`}>MINIMUM OPERATION DURATION</span>
                        <div className={styles.customGenRow}>
                            <input
                                type="number"
                                min="1"
                                max="500"
                                value={customOperationsMinDuration}
                                onChange={(e) => setCustomOperationsMinDuration(parseInt(e.target.value))}
                                className={styles.numberInput}
                            />
                        </div>
                        <span className={`${styles.statLabel} ${styles.sectionLabel}`}>MAXIMUM OPERATION DURATION</span>
                        <div className={styles.customGenRow}>
                            <input
                                type="number"
                                min="1"
                                max="2000"
                                value={customOperationsMaxDuration}
                                onChange={(e) => setCustomOperationsMaxDuration(parseInt(e.target.value))}
                                className={styles.numberInput}
                            />
                        </div>
                        <Button
                                style={["secondary"]}
                                label="Go!"
                                onClick={() => onGenerate(customNumberJobs, customOperationsMinDuration, customOperationsMaxDuration)}
                            />
                    </div>
                    )}

                    {!isCustom && (
                        <Button
                                style={["secondary"]}
                                label="Go!"
                                onClick={() => onGenerate()}
                            />
                    )}
                </div>
            )}

            <InstanceSharingControls
                onShare={onShare}
                disabled={jobsCount === 0}
            />
        </>
    );
}
