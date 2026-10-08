import { useCallback } from 'react';
import type { KnapsackItem } from '@/types/games/knapsack';

/**
 * Handles builder mode for the Knapsack game — creating items manually.
 * 
 * Manages:
 * - Adding items
 * - Deleting items
 * - Unique ID generation for new items
 * - Change maximum weight of knapsack
 */


export const useKnapsackBuilder = () => {

    const addItem = useCallback((
        name: string,
        value: number,
        weight: number,
        icon: string,
        currentItems: KnapsackItem[]
    ): KnapsackItem[] | null => {
        // Check limit
        if (currentItems.length >= 10) return null;

        if (value <= 0 || weight <= 0) return null;

        const newItem: KnapsackItem = {
            id: currentItems.length > 0 ? Math.max(...currentItems.map(item => item.id)) + 1 : 0,
            name: name,
            value: value,
            weight: weight,
            icon: icon
        };

        return [...currentItems, newItem];
    }, []);

    const deleteItem = useCallback((id: number, currentItems: KnapsackItem[]): KnapsackItem[] | null => {
        if (currentItems.length === 0) return null;

        return currentItems.filter(item => item.id !== id);
    }, []);

    const setMaxWeight = useCallback((maxWeight: number) => {
        return maxWeight > 0 ? maxWeight : null;
    }, []);

    /** Returns true if the current builder state has a valid number of items and valid maxWeight value */
    const isValidBuilderState = useCallback((itemCount: number, newMaxWeight: number): boolean => {
        return itemCount >= 3 && itemCount <= 50 && newMaxWeight > 0;
    }, []);

    return {
        addItem,
        deleteItem,
        setMaxWeight,
        isValidBuilderState
    };
};
