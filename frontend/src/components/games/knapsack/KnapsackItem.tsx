import type { KnapsackItem as KnapsackItemType } from "@/types/games/knapsack";
import styles from "@styles/components/games/knapsack/KnapsackSandbox.module.css"

interface KnapsackItemProps {
    item: KnapsackItemType;
    selectedMode: 'algorithm' | 'random' | 'manual' | 'builder';
    onClick: () => void;
    deleteItem: () => void;
}

export default function KnapsackItem({
    item,
    selectedMode,
    onClick,
    deleteItem
}: KnapsackItemProps) {
    return (
        <div className={styles.item}>
            <button
                type="button"
                className={styles.itemSelect}
                onClick={onClick}
                aria-label={`Select ${item.name}`}
            >
                <span className={styles.itemIcon}>
                    {item.icon}
                </span>

                <span className={styles.itemContent}>
                    <span className={styles.itemName}>
                        {item.name}
                    </span>

                    <span className={styles.itemStats}>
                        <span>
                            VALUE: {item.value}
                        </span>

                        <span>
                            WEIGHT: {item.weight}
                        </span>
                    </span>
                </span>
            </button>
            
            {selectedMode === 'builder' && (
                <button
            type="button"
            className={styles.itemDelete}
            onClick={deleteItem}
            aria-label={`Delete ${item.name}`}
            >
                🗑️
            </button>
            )}
            
        </div>
    );
}
