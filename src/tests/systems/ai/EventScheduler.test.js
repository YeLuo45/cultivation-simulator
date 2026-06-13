/**
 * EventScheduler.test.js - 事件调度测试
 * V389 Iteration 5/9 Round 12 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventScheduler } from '../../../systems/ai/EventScheduler.js';

describe('EventScheduler', () => {
    let system;
    beforeEach(() => { system = new EventScheduler(); });

    describe('scheduleTask', () => {
        it('should schedule', () => {
            const { task } = system.scheduleTask({ name: 'T1' });
            expect(task.name).toBe('T1');
        });

        it('should trigger taskScheduled hook', () => {
            let called = false;
            system.registerHook('taskScheduled', () => { called = true; });
            system.scheduleTask({});
            expect(called).toBe(true);
        });
    });

    describe('getTask', () => {
        it('should return', () => {
            const { task } = system.scheduleTask({});
            expect(system.getTask(task.taskId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTask('ghost')).toBeNull(); });
    });

    describe('listTasks', () => {
        it('should list all', () => {
            system.scheduleTask({});
            expect(system.listTasks().length).toBe(1);
        });
    });

    describe('listPending', () => {
        it('should filter', () => {
            const { task } = system.scheduleTask({});
            task.status = 'executed';
            system.scheduleTask({});
            expect(system.listPending().length).toBe(1);
        });
    });

    describe('listExecuted', () => {
        it('should filter', () => {
            const { task } = system.scheduleTask({});
            task.status = 'executed';
            system.scheduleTask({});
            expect(system.listExecuted().length).toBe(1);
        });
    });

    describe('listDue', () => {
        it('should find due', () => {
            system.scheduleTask({ executeAt: Date.now() - 1000 });
            system.scheduleTask({ executeAt: Date.now() + 10000 });
            expect(system.listDue().length).toBe(1);
        });
    });

    describe('executeTask', () => {
        it('should execute', () => {
            const { task } = system.scheduleTask({});
            system.executeTask(task.taskId);
            expect(task.status).toBe('executed');
        });

        it('should reject missing', () => {
            const result = system.executeTask('ghost');
            expect(result.error).toBe('TASK_NOT_FOUND');
        });

        it('should reject not pending', () => {
            const { task } = system.scheduleTask({});
            task.status = 'cancelled';
            const result = system.executeTask(task.taskId);
            expect(result.error).toBe('TASK_NOT_PENDING');
        });

        it('should trigger taskExecuted hook', () => {
            const { task } = system.scheduleTask({});
            let called = false;
            system.registerHook('taskExecuted', () => { called = true; });
            system.executeTask(task.taskId);
            expect(called).toBe(true);
        });
    });

    describe('cancelTask', () => {
        it('should cancel', () => {
            const { task } = system.scheduleTask({});
            system.cancelTask(task.taskId);
            expect(task.status).toBe('cancelled');
        });

        it('should reject missing', () => {
            const result = system.cancelTask('ghost');
            expect(result.error).toBe('TASK_NOT_FOUND');
        });

        it('should trigger taskCancelled hook', () => {
            const { task } = system.scheduleTask({});
            let called = false;
            system.registerHook('taskCancelled', () => { called = true; });
            system.cancelTask(task.taskId);
            expect(called).toBe(true);
        });
    });

    describe('executeDueTasks', () => {
        it('should execute due', () => {
            system.scheduleTask({ executeAt: Date.now() - 1000 });
            system.scheduleTask({ executeAt: Date.now() + 10000 });
            const result = system.executeDueTasks();
            expect(result.executed).toBe(1);
        });
    });

    describe('countByStatus', () => {
        it('should count', () => {
            system.scheduleTask({});
            system.scheduleTask({});
            const counts = system.countByStatus();
            expect(counts.pending).toBe(2);
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

        it('should execute default getTask', () => {
            const result = system.executeTool('getTask', { taskId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('taskScheduled', () => count++);
            unregister();
            system.scheduleTask({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('taskScheduled', () => { throw new Error('x'); });
            expect(() => system.scheduleTask({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTasks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTasks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.scheduleTask({});
            const json = system.toJSON();
            expect(json.tasks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.scheduleTask({});
            const json = system.toJSON();
            const newSys = new EventScheduler();
            newSys.fromJSON(json);
            expect(newSys.tasks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.taskCount).toBe(0);
        });
    });
});