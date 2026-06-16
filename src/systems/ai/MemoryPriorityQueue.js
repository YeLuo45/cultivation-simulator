/**
 * MemoryPriorityQueue - 基于优先级的记忆队列
 * V289 Iteration 4/9 - NPC Memory Consolidation Scheduler
 *
 * 核心机制:
 *   - 按优先级排序的记忆队列
 *   - 优先级相同时按时间戳排序
 *   - 支持入队/出队/查看/清空操作
 *
 * 设计来源: thunderbolt offline-first scheduler
 */

export class MemoryPriorityQueue {
    /**
     * @param {Function} comparator - 自定义比较函数 (a, b) => number
     *                               默认: 优先级高的在前，优先级相同时间早的在前
     */
    constructor(comparator = null) {
        this.queue = []; // [{ item, priority, timestamp }]
        this._comparator = comparator || MemoryPriorityQueue._defaultComparator;
    }

    /**
     * 默认比较函数: 优先级高的在前，优先级相同时间早的在前
     * @param {Object} a - { item, priority, timestamp }
     * @param {Object} b - { item, priority, timestamp }
     * @returns {number}
     */
    static _defaultComparator(a, b) {
        // 优先级高的在前 (priority 数值大的优先)
        if (a.priority !== b.priority) {
            return b.priority - a.priority;
        }
        // 优先级相同，时间早的在前
        return a.timestamp - b.timestamp;
    }

    /**
     * 入队
     * @param {*} item - 数据项
     * @param {number} priority - 优先级 (数值越大优先级越高)
     * @returns {Object} 入队结果 { success, position, length }
     */
    enqueue(item, priority = 0) {
        const timestamp = Date.now();
        const entry = { item, priority, timestamp };
        
        // 找到正确的插入位置 (保持队列有序)
        let inserted = false;
        for (let i = 0; i < this.queue.length; i++) {
            if (this._comparator(entry, this.queue[i]) < 0) {
                this.queue.splice(i, 0, entry);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            this.queue.push(entry);
        }
        
        return {
            success: true,
            position: this.queue.indexOf(entry),
            length: this.queue.length
        };
    }

    /**
     * 出队 - 移除并返回最高优先级的项
     * @returns {*} 数据项，未找到返回 null
     */
    dequeue() {
        if (this.queue.length === 0) {
            return null;
        }
        return this.queue.shift().item;
    }

    /**
     * 查看但不移除 - 返回最高优先级的项
     * @returns {*} 数据项，未找到返回 null
     */
    peek() {
        if (this.queue.length === 0) {
            return null;
        }
        return this.queue[0].item;
    }

    /**
     * 查看队首元素详情（包含 priority 和 timestamp）
     * @returns {Object|null} { item, priority, timestamp } 或 null
     */
    peekEntry() {
        if (this.queue.length === 0) {
            return null;
        }
        return { ...this.queue[0] };
    }

    /**
     * 清空队列
     */
    clear() {
        this.queue = [];
    }

    /**
     * 获取队列长度
     * @returns {number}
     */
    size() {
        return this.queue.length;
    }

    /**
     * 检查队列是否为空
     * @returns {boolean}
     */
    isEmpty() {
        return this.queue.length === 0;
    }

    /**
     * 根据条件查找并移除第一个匹配的项
     * @param {Function} predicate - (item) => boolean
     * @returns {*} 被移除的项，未找到返回 null
     */
    removeWhere(predicate) {
        const index = this.queue.findIndex(entry => predicate(entry.item));
        if (index === -1) {
            return null;
        }
        return this.queue.splice(index, 1)[0].item;
    }

    /**
     * 获取指定优先级的所有项
     * @param {number} priority - 优先级
     * @returns {Array} 匹配项列表
     */
    getByPriority(priority) {
        return this.queue
            .filter(entry => entry.priority === priority)
            .map(entry => entry.item);
    }

    /**
     * 更新指定项的优先级
     * @param {Function} predicate - (item) => boolean
     * @param {number} newPriority - 新优先级
     * @returns {boolean} 是否更新成功
     */
    updatePriority(predicate, newPriority) {
        const index = this.queue.findIndex(entry => predicate(entry.item));
        if (index === -1) {
            return false;
        }
        this.queue[index].priority = newPriority;
        // 重新排序
        this.queue.sort(this._comparator);
        return true;
    }

    /**
     * 批量入队
     * @param {Array} items - [(item, priority), ...]
     * @returns {number} 入队后队列长度
     */
    enqueueBatch(items) {
        for (const itemData of items) {
            if (Array.isArray(itemData)) {
                this.enqueue(itemData[0], itemData[1]);
            } else {
                this.enqueue(itemData.item ?? itemData, itemData.priority ?? 0);
            }
        }
        return this.queue.length;
    }

    /**
     * 将队列转换为数组
     * @returns {Array} 队列副本
     */
    toArray() {
        return this.queue.map(entry => ({ ...entry }));
    }

    /**
     * 获取队列统计信息
     * @returns {Object} { size, minPriority, maxPriority, avgPriority }
     */
    getStats() {
        if (this.queue.length === 0) {
            return { size: 0, minPriority: 0, maxPriority: 0, avgPriority: 0 };
        }
        const priorities = this.queue.map(e => e.priority);
        return {
            size: this.queue.length,
            minPriority: Math.min(...priorities),
            maxPriority: Math.max(...priorities),
            avgPriority: priorities.reduce((a, b) => a + b, 0) / priorities.length
        };
    }
}

export default MemoryPriorityQueue;