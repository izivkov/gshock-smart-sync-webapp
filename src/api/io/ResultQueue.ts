import { progressEvents } from "@api/ProgressEvents";

class ResultQueue {
    private keyedResultMap: Map<string, Function>;

    constructor() {
        this.keyedResultMap = new Map();
    }

    enqueue(element: { key: string, result: Function }) {
        this.keyedResultMap.set(element.key.toUpperCase(), element.result);
    }

    dequeue(_key: string): Function | null {
        if (this.keyedResultMap.size === 0) {
            progressEvents.onNext("ApiError");
            return null;
        } else {
            const key = _key.toUpperCase();
            const value = this.keyedResultMap.get(key);
            this.keyedResultMap.delete(key);
            return value || null;
        }
    }

    isEmpty(): boolean {
        return this.keyedResultMap.size === 0;
    }

    size(): number {
        return this.keyedResultMap.size;
    }

    clear() {
        this.keyedResultMap.clear();
    }
}

export const resultQueue = new ResultQueue();
