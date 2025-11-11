export interface ReorderableItem {
    id: string | number;
    [key: string]: any;
}

export function reorderItems<T>(
    items: T[],
    startIndex: number,
    endIndex: number
): T[] {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    if (removed !== undefined) {
        result.splice(endIndex, 0, removed);
    }
    return result;
}
