import { useState } from "react";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import styles from "@/styles/components/games/tsp/TSPControls.module.css";
import { Eye, RefreshCw, Gamepad2, Hammer } from "lucide-react";
import { itemCategories } from "@/utils/knapsack/items";


interface KnapsackControlsProps {
    selectedMode: 'algorithm' | 'random' | 'manual' | 'builder';
    setSelectedMode: (mode: 'algorithm' | 'random' | 'manual' | 'builder') => void;
    isRunning: boolean;
    itemsCount: number;
    manualSelectionLength: number
    gameResult: unknown;
    customNumberItems: number;
    setCustomNumberItems: (count: number) => void;
    customItemsMinWeight: number;
    setCustomItemsMinWeight: (count: number) => void;
    customItemsMaxWeight: number;
    setCustomItemsMaxWeight: (count: number) => void;
    addItem: (name: string, value: number, weight: number, icon: string) => void
    setMaxWeight: (maxWeight: number) => void

    // Actions
    onRun: () => void;
    onStop: () => void;
    onSubmit: () => void;
    onReset: () => void;
    onGenerate: (count?: number, minWeight?: number, maxWeight?: number) => void;
    onShare: () => Promise<string | null>;
}

export default function KnapsackControls({
    selectedMode,
    setSelectedMode,
    isRunning,
    itemsCount,
    manualSelectionLength,
    gameResult,
    customNumberItems,
    setCustomNumberItems,
    customItemsMinWeight,
    setCustomItemsMinWeight,
    customItemsMaxWeight,
    setCustomItemsMaxWeight,
    addItem,
    setMaxWeight,
    onRun,
    onStop,
    onSubmit,
    onReset,
    onGenerate,
    onShare
}: KnapsackControlsProps) {

    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [newItemIcon, setNewItemIcon] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemValue, setNewItemValue] = useState<number>(1);
    const [newItemWeight, setNewItemWeight] = useState<number>(1);
    const [newKnapsackWeight, setNewKnapsackWeight] = useState<number>(1);

    const handleShareClick = async () => {
        setIsSharing(true);
        const url = await onShare();
        if (url) {
            setShareUrl(url);
            setCopied(false);
        }
        setIsSharing(false);
    };

    const handleCopy = async () => {
        if (shareUrl) {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const modes = [
        { key: 'algorithm' as const, category: 'VISUALIZE', categoryClass: styles.categoryVisualize, icon: <Eye size={18} />, label: 'SOLUTION', description: 'See solution' },
        { key: 'random' as const, category: 'GENERATE', categoryClass: styles.categoryVisualize, icon: <RefreshCw size={18} />, label: 'RANDOM', description: 'New game' },
        { key: 'manual' as const, category: 'PLAY', categoryClass: styles.categoryPlay, icon: <Gamepad2 size={18} />, label: 'MANUAL', description: 'Solve yourself' },
        { key: 'builder' as const, category: 'CREATE', categoryClass: styles.categoryCreate, icon: <Hammer size={18} />, label: 'BUILDER', description: 'Create items' },
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

            <div className={styles.controlPanel}>
                <h3>CONTROLS</h3>
                <div className={styles.actions}>
                    {selectedMode === 'builder' ? (
                        <Button
                            style={["primary", "fullWidth"]}
                            label="CLEAR ITEMS"
                            onClick={onReset}
                        />
                    ) : selectedMode !== 'manual' ? (
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
                            disabled={manualSelectionLength < 1 || !!gameResult}
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

            {(selectedMode === 'builder') && (
                <div className={styles.controlPanel}>
                    <h3>BUILDER</h3>
                    <div className={`${styles.setting} ${styles.settingSpaced}`}>
                        <div>
                            <span className={`${styles.statLabel} ${styles.sectionLabel}`}>ICON</span>
                            <div className={styles.scenarioSelector}>
                                <select
                                    className={styles.selectInput}
                                    onChange={(e) => setNewItemIcon(e.target.value)}
                                    value={newItemIcon}
                                >
                                    <option value="" disabled>Select Icon...</option>

                                    {Object.entries(itemCategories).map(([category, items]) => (
                                        <optgroup key={category} label={category}>
                                            {items.map((item) => (
                                                <option key={item.name} value={item.icon}>
                                                    {item.icon} {item.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}

                                </select>
                            </div>

                            <span className={`${styles.statLabel} ${styles.sectionLabel}`}>NAME</span>
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className={styles.textInput}
                            />

                            <div className={styles.valueWeightRow}>
                                <div>
                                    <span className={`${styles.statLabel} ${styles.sectionLabel}`}>VALUE</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newItemValue}
                                        onChange={(e) => setNewItemValue(parseInt(e.target.value))}
                                        className={styles.numberInput}
                                    />
                                </div>
                                <div>
                                    <span className={`${styles.statLabel} ${styles.sectionLabel}`}>WEIGHT</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newItemWeight}
                                        onChange={(e) => setNewItemWeight(parseInt(e.target.value))}
                                        className={styles.numberInput}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button
                                style={["secondary"]}
                                label="Add Item"
                                onClick={() => addItem(newItemName, newItemValue, newItemWeight, newItemIcon)}
                            />
                    </div>
                    <div className={`${styles.setting} ${styles.settingSpaced}`}>
                    <span className={`${styles.statLabel} ${styles.sectionLabel}`}>CHANGE KNAPSACK WEIGHT</span>
                    <div className={styles.customGenRow}>
                        <input
                            type="number"
                            min="1"
                            value={newKnapsackWeight}
                            onChange={(e) => setNewKnapsackWeight(parseInt(e.target.value))}
                            className={styles.numberInput}
                        />
                        <Button
                            style={["secondary"]}
                            label="Change Weight"
                            onClick={() => setMaxWeight(newKnapsackWeight)}
                        />
                    </div>
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
                        <span className={`${styles.statLabel} ${styles.sectionLabel}`}>NUMBER OF ITEMS</span>
                        <div className={styles.customGenRow}>
                            <input
                                type="number"
                                min="3"
                                max="50"
                                value={customNumberItems}
                                onChange={(e) => setCustomNumberItems(Math.min(50, parseInt(e.target.value)))}
                                className={styles.numberInput}
                            />
                        </div>
                        <span className={`${styles.statLabel} ${styles.sectionLabel}`}>MINIMUM ITEM WEIGHT</span>
                        <div className={styles.customGenRow}>
                            <input
                                type="number"
                                min="1"
                                max="500"
                                value={customItemsMinWeight}
                                onChange={(e) => setCustomItemsMinWeight(parseInt(e.target.value))}
                                className={styles.numberInput}
                            />
                        </div>
                        <span className={`${styles.statLabel} ${styles.sectionLabel}`}>MAXIMUM ITEM WEIGHT</span>
                        <div className={styles.customGenRow}>
                            <input
                                type="number"
                                min="1"
                                max="2000"
                                value={customItemsMaxWeight}
                                onChange={(e) => setCustomItemsMaxWeight(parseInt(e.target.value))}
                                className={styles.numberInput}
                            />
                        </div>
                        <Button
                                style={["secondary"]}
                                label="Go!"
                                onClick={() => onGenerate(customNumberItems, customItemsMinWeight, customItemsMaxWeight)}
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

            <div className={styles.controlPanel}> 
                <h3>SHARE CHALLENGE</h3>
                <Button
                    style={["primary", "fullWidth"]}
                    label={isSharing ? "GENERATING..." : "SHARE INSTANCE"}
                    onClick={handleShareClick}
                    disabled={isSharing || itemsCount === 0}
                />
            </div>

            <Modal
                isOpen={!!shareUrl}
                title="READY TO SHARE"
                message="Send this link to challenge your friends to beat the AI on your custom game."
                confirmLabel={copied ? "COPIED!" : "COPY LINK"}
                cancelLabel="CLOSE"
                onConfirm={handleCopy}
                onCancel={() => setShareUrl(null)}
            >
                <div className={styles.shareUrlBox}>
                    {shareUrl}
                </div>
            </Modal>
        </>
    );
}
