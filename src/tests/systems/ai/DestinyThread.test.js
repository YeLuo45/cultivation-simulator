/**
 * DestinyThread.test.js - 命运之线测试
 * V372 Iteration 6/9 Round 10 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DestinyThread } from '../../../systems/ai/DestinyThread.js';

describe('DestinyThread', () => {
    let system;
    beforeEach(() => { system = new DestinyThread(); });

    describe('createThread', () => {
        it('should create', () => {
            const { thread } = system.createThread({ name: 'T1' });
            expect(thread.destiny).toBe('unknown');
        });

        it('should trigger threadCreated hook', () => {
            let called = false;
            system.registerHook('threadCreated', () => { called = true; });
            system.createThread({});
            expect(called).toBe(true);
        });
    });

    describe('getThread', () => {
        it('should return', () => {
            const { thread } = system.createThread({});
            expect(system.getThread(thread.threadId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getThread('ghost')).toBeNull(); });
    });

    describe('listThreads', () => {
        it('should list all', () => {
            system.createThread({});
            expect(system.listThreads().length).toBe(1);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.createThread({ ownerId: 'o1' });
            system.createThread({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });
    });

    describe('listByDestiny', () => {
        it('should filter', () => {
            system.createThread({ destiny: 'immortal' });
            system.createThread({ destiny: 'mortal' });
            expect(system.listByDestiny('immortal').length).toBe(1);
        });
    });

    describe('connectThreads', () => {
        it('should connect', () => {
            const { thread: t1 } = system.createThread({});
            const { thread: t2 } = system.createThread({});
            const result = system.connectThreads(t1.threadId, t2.threadId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const { thread } = system.createThread({});
            const result = system.connectThreads('ghost', thread.threadId);
            expect(result.error).toBe('THREAD_NOT_FOUND');
        });

        it('should trigger threadsConnected hook', () => {
            const { thread: t1 } = system.createThread({});
            const { thread: t2 } = system.createThread({});
            let called = false;
            system.registerHook('threadsConnected', () => { called = true; });
            system.connectThreads(t1.threadId, t2.threadId);
            expect(called).toBe(true);
        });
    });

    describe('disconnectThreads', () => {
        it('should disconnect', () => {
            const { thread: t1 } = system.createThread({});
            const { thread: t2 } = system.createThread({});
            const { connection } = system.connectThreads(t1.threadId, t2.threadId);
            const result = system.disconnectThreads(connection.connectionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.disconnectThreads('ghost');
            expect(result.error).toBe('CONNECTION_NOT_FOUND');
        });

        it('should trigger threadsDisconnected hook', () => {
            const { thread: t1 } = system.createThread({});
            const { thread: t2 } = system.createThread({});
            const { connection } = system.connectThreads(t1.threadId, t2.threadId);
            let called = false;
            system.registerHook('threadsDisconnected', () => { called = true; });
            system.disconnectThreads(connection.connectionId);
            expect(called).toBe(true);
        });
    });

    describe('strengthenThread', () => {
        it('should strengthen', () => {
            const { thread } = system.createThread({ strength: 1 });
            system.strengthenThread(thread.threadId, 2);
            expect(thread.strength).toBe(3);
        });

        it('should cap at 10', () => {
            const { thread } = system.createThread({ strength: 9 });
            system.strengthenThread(thread.threadId, 5);
            expect(thread.strength).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.strengthenThread('ghost', 1);
            expect(result.error).toBe('THREAD_NOT_FOUND');
        });

        it('should trigger threadStrengthened hook', () => {
            const { thread } = system.createThread({});
            let called = false;
            system.registerHook('threadStrengthened', () => { called = true; });
            system.strengthenThread(thread.threadId, 1);
            expect(called).toBe(true);
        });
    });

    describe('weakenThread', () => {
        it('should weaken', () => {
            const { thread } = system.createThread({ strength: 5 });
            system.weakenThread(thread.threadId, 2);
            expect(thread.strength).toBe(3);
        });

        it('should floor at 0', () => {
            const { thread } = system.createThread({ strength: 1 });
            system.weakenThread(thread.threadId, 5);
            expect(thread.strength).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.weakenThread('ghost', 1);
            expect(result.error).toBe('THREAD_NOT_FOUND');
        });

        it('should trigger threadWeakened hook', () => {
            const { thread } = system.createThread({});
            let called = false;
            system.registerHook('threadWeakened', () => { called = true; });
            system.weakenThread(thread.threadId, 1);
            expect(called).toBe(true);
        });
    });

    describe('getConnection', () => {
        it('should return', () => {
            const { thread: t1 } = system.createThread({});
            const { thread: t2 } = system.createThread({});
            const { connection } = system.connectThreads(t1.threadId, t2.threadId);
            expect(system.getConnection(connection.connectionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getConnection('ghost')).toBeNull(); });
    });

    describe('listConnections', () => {
        it('should list all', () => {
            const { thread: t1 } = system.createThread({});
            const { thread: t2 } = system.createThread({});
            system.connectThreads(t1.threadId, t2.threadId);
            expect(system.listConnections().length).toBe(1);
        });
    });

    describe('listConnectionsByThread', () => {
        it('should filter', () => {
            const { thread: t1 } = system.createThread({});
            const { thread: t2 } = system.createThread({});
            const { thread: t3 } = system.createThread({});
            system.connectThreads(t1.threadId, t2.threadId);
            system.connectThreads(t1.threadId, t3.threadId);
            expect(system.listConnectionsByThread(t1.threadId).length).toBe(2);
        });
    });

    describe('findShortestPath', () => {
        it('should find direct', () => {
            const { thread: t1 } = system.createThread({});
            const { thread: t2 } = system.createThread({});
            system.connectThreads(t1.threadId, t2.threadId);
            const path = system.findShortestPath(t1.threadId, t2.threadId);
            expect(path.length).toBe(2);
        });

        it('should return null for missing', () => {
            expect(system.findShortestPath('ghost', 't2')).toBeNull();
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getThread', () => {
            const result = system.executeTool('getThread', { threadId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('threadCreated', () => count++);
            unregister();
            system.createThread({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('threadCreated', () => { throw new Error('x'); });
            expect(() => system.createThread({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalThreads = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalThreads = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createThread({});
            const json = system.toJSON();
            expect(json.threads.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createThread({});
            const json = system.toJSON();
            const newSys = new DestinyThread();
            newSys.fromJSON(json);
            expect(newSys.threads.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.threadCount).toBe(0);
        });
    });
});