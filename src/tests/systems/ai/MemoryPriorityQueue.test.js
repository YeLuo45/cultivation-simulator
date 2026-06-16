/**
 * MemoryPriorityQueue.test.js - 记忆优先级队列测试
 * V289 Iteration 4/9 - NPC Memory Consolidation Scheduler
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryPriorityQueue } from '../../../systems/ai/MemoryPriorityQueue.js';

describe('MemoryPriorityQueue', () => {
    let queue;

    beforeEach(() => {
        queue = new MemoryPriorityQueue();
    });

    afterEach(() => {
        queue.clear();
    });

    describe('constructor', () => {
        it('should create empty queue', () => {
            expect(queue.size()).toBe(0);
            expect(queue.isEmpty()).toBe(true);
        });

        it('should accept custom comparator', () => {
            const customQueue = new MemoryPriorityQueue((a, b) => b.priority - a.priority);
            customQueue.enqueue('item1', 1);
            customQueue.enqueue('item2', 2);
            expect(customQueue.peek()).toBe('item2');
        });
    });

    describe('enqueue', () => {
        it('should enqueue single item', () => {
            const result = queue.enqueue('test_item', 5);
            expect(result.success).toBe(true);
            expect(result.length).toBe(1);
            expect(queue.size()).toBe(1);
        });

        it('should return correct position', () => {
            queue.enqueue('a', 1);
            queue.enqueue('b', 2);
            queue.enqueue('c', 3);
            expect(queue.peek()).toBe('c'); // highest priority
        });

        it('should use default priority 0', () => {
            queue.enqueue('item');
            expect(queue.size()).toBe(1);
        });

        it('should handle negative priority', () => {
            queue.enqueue('low', -5);
            queue.enqueue('high', 10);
            expect(queue.peek()).toBe('high');
        });

        it('should maintain order for same priority by timestamp', () => {
            const item1 = queue.enqueue('first', 5);
            // Small delay to ensure different timestamps
            const item2 = queue.enqueue('second', 5);
            expect(queue.dequeue()).toBe('first');
            expect(queue.dequeue()).toBe('second');
        });
    });

    describe('dequeue', () => {
        it('should dequeue highest priority item', () => {
            queue.enqueue('low', 1);
            queue.enqueue('medium', 5);
            queue.enqueue('high', 10);
            expect(queue.dequeue()).toBe('high');
            expect(queue.dequeue()).toBe('medium');
            expect(queue.dequeue()).toBe('low');
        });

        it('should return null for empty queue', () => {
            expect(queue.dequeue()).toBe(null);
        });

        it('should decrease size after dequeue', () => {
            queue.enqueue('item1', 1);
            queue.enqueue('item2', 2);
            queue.dequeue();
            expect(queue.size()).toBe(1);
        });

        it('should return items in correct order after multiple enqueues', () => {
            queue.enqueue('a', 3);
            queue.enqueue('b', 1);
            queue.enqueue('c', 2);
            queue.enqueue('d', 4);
            expect(queue.dequeue()).toBe('d');
            expect(queue.dequeue()).toBe('a');
            expect(queue.dequeue()).toBe('c');
            expect(queue.dequeue()).toBe('b');
        });
    });

    describe('peek', () => {
        it('should return highest priority without removing', () => {
            queue.enqueue('low', 1);
            queue.enqueue('high', 10);
            expect(queue.peek()).toBe('high');
            expect(queue.size()).toBe(2);
        });

        it('should return null for empty queue', () => {
            expect(queue.peek()).toBe(null);
        });
    });

    describe('peekEntry', () => {
        it('should return entry with metadata', () => {
            queue.enqueue('test', 5);
            const entry = queue.peekEntry();
            expect(entry.item).toBe('test');
            expect(entry.priority).toBe(5);
            expect(entry.timestamp).toBeDefined();
        });

        it('should return null for empty queue', () => {
            expect(queue.peekEntry()).toBe(null);
        });
    });

    describe('clear', () => {
        it('should clear all items', () => {
            queue.enqueue('item1', 1);
            queue.enqueue('item2', 2);
            queue.clear();
            expect(queue.size()).toBe(0);
            expect(queue.isEmpty()).toBe(true);
        });
    });

    describe('size', () => {
        it('should return correct size', () => {
            expect(queue.size()).toBe(0);
            queue.enqueue('a', 1);
            queue.enqueue('b', 2);
            expect(queue.size()).toBe(2);
        });
    });

    describe('isEmpty', () => {
        it('should return true for empty queue', () => {
            expect(queue.isEmpty()).toBe(true);
        });

        it('should return false for non-empty queue', () => {
            queue.enqueue('item', 1);
            expect(queue.isEmpty()).toBe(false);
        });
    });

    describe('removeWhere', () => {
        it('should remove first matching item', () => {
            queue.enqueue('apple', 1);
            queue.enqueue('banana', 2);
            queue.enqueue('apple', 3);
            const removed = queue.removeWhere(item => item === 'apple');
            expect(removed).toBe('apple');
            expect(queue.size()).toBe(2);
        });

        it('should return null if no match', () => {
            queue.enqueue('apple', 1);
            expect(queue.removeWhere(item => item === 'orange')).toBe(null);
        });
    });

    describe('getByPriority', () => {
        it('should return all items with given priority', () => {
            queue.enqueue('a', 5);
            queue.enqueue('b', 3);
            queue.enqueue('c', 5);
            const items = queue.getByPriority(5);
            expect(items).toContain('a');
            expect(items).toContain('c');
            expect(items).not.toContain('b');
        });
    });

    describe('updatePriority', () => {
        it('should update priority and re-sort', () => {
            queue.enqueue('low', 1);
            queue.enqueue('high', 10);
            queue.updatePriority(item => item === 'low', 20);
            expect(queue.dequeue()).toBe('low');
            expect(queue.dequeue()).toBe('high');
        });

        it('should return false if item not found', () => {
            queue.enqueue('item', 5);
            expect(queue.updatePriority(item => item === 'nonexistent', 10)).toBe(false);
        });
    });

    describe('enqueueBatch', () => {
        it('should enqueue array of items', () => {
            queue.enqueueBatch([['a', 1], ['b', 2], ['c', 3]]);
            expect(queue.size()).toBe(3);
        });

        it('should handle object format', () => {
            queue.enqueueBatch([{ item: 'a', priority: 1 }, { item: 'b', priority: 2 }]);
            expect(queue.size()).toBe(2);
        });
    });

    describe('toArray', () => {
        it('should return copy of queue', () => {
            queue.enqueue('a', 1);
            queue.enqueue('b', 2);
            const arr = queue.toArray();
            expect(arr.length).toBe(2);
            expect(arr[0].item).toBe('b'); // highest priority first
        });
    });

    describe('getStats', () => {
        it('should return zeros for empty queue', () => {
            const stats = queue.getStats();
            expect(stats.size).toBe(0);
            expect(stats.minPriority).toBe(0);
            expect(stats.maxPriority).toBe(0);
            expect(stats.avgPriority).toBe(0);
        });

        it('should calculate correct stats', () => {
            queue.enqueue('a', 1);
            queue.enqueue('b', 3);
            queue.enqueue('c', 5);
            const stats = queue.getStats();
            expect(stats.size).toBe(3);
            expect(stats.minPriority).toBe(1);
            expect(stats.maxPriority).toBe(5);
            expect(stats.avgPriority).toBe(3);
        });
    });
});