import type { KnapsackItem as KnapsackItemType } from "@/types/games/knapsack";
import KnapsackItem from "./KnapsackItem"
import styles from "@/styles/components/games/knapsack/KnapsackSandbox.module.css";

interface KnapsackBoardProps {
    width: number;
    height: number;
    items: KnapsackItemType[];
    selectedItems: number[];
    maxWeight: number;
    selectedMode: 'algorithm' | 'random' | 'manual' | 'builder';
    onItemClick: (id: number) => void;
    deleteItem: (id: number) => void;
}


export default function KnapsackBoard({
    width,
    height,
    items,
    selectedItems,
    maxWeight,
    selectedMode,
    onItemClick,
    deleteItem,
}: KnapsackBoardProps) {
    const availableItems = items.filter((item) => !selectedItems.includes(item.id));

    const selectedKnapsackItems = items.filter((item) => selectedItems.includes(item.id));
    
    return (
        <div
            className={styles.board}
            style={{ width, height }}
        >
            <section className={styles.listPanel}>
                <div className={styles.listHeader}>
                    <h3 className={styles.listTitle}>
                        Available Items
                    </h3>

                    <span className={styles.itemCount}>
                        {availableItems.length}
                    </span>
                </div>

                <div className={styles.items}>
                    {availableItems.length > 0 ? (
                        availableItems.map((item) => (
                            <KnapsackItem
                                key={item.id}
                                item={item}
                                onClick={() => onItemClick(item.id)}
                                deleteItem={() => deleteItem(item.id)}
                                selectedMode={selectedMode}
                            />
                        ))
                    ) : (
                        <p className={styles.emptyState}>
                            No available items
                        </p>
                    )}
                </div>
            </section>

            <section
                className={`${styles.listPanel} ${styles.listPanelSelected}`}
            >
                <div className={styles.listHeader}>
                    <div className={styles.knapsackTitle}>
                        <h3 className={styles.listTitle}>
                            Knapsack
                        </h3>

                        <span className={styles.capacity}>
                            MAX WEIGHT: {maxWeight}
                        </span>
                    </div>

                    <span className={styles.itemCount}>
                        {selectedKnapsackItems.length}
                    </span>
                </div>

                <div className={styles.items}>
                    {selectedKnapsackItems.length > 0 ? (
                        selectedKnapsackItems.map((item) => (
                            <KnapsackItem
                                key={item.id}
                                item={item}
                                onClick={() => onItemClick(item.id)}
                                deleteItem={() => deleteItem(item.id)}
                                selectedMode={selectedMode}
                            />
                        ))
                    ) : (
                        <p className={styles.emptyState}>
                            Select an item to add it
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}