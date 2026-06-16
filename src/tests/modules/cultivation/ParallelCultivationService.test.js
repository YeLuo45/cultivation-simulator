/**
 * 多线程并行修炼服务测试
 * V265 方向A迭代7/9: generic-agent自主目标追求+多线程并行
 * 
 * 测试覆盖率目标: ≥99%
 * 测试通过率目标: 100%
 */

// Constants
const THREAD_PRIORITY = { CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
const THREAD_STATUS = { RUNNING: 'running', SUSPENDED: 'suspended', COMPLETED: 'completed', FAILED: 'failed' };

import { ParallelCultivationService, THREAD_PRIORITY as TP, THREAD_STATUS as TS } from '../../../domains/cultivation/services/ParallelCultivationService.js';

describe('ParallelCultivationService', () => {
    let service;
    let gameState;

    beforeEach(() => {
        gameState = {
            cultivation: { level: 1, experience: 0 },
            inventory: { spiritStones: 1000 },
            energy: 100,
            parallelCultivation: null
        };
        service = new ParallelCultivationService(gameState);
        service.init(gameState);
    });

    describe('initThreadState', () => {
        test('should initialize with empty threads', () => {
            expect(service.threadState.threads).toEqual({});
            expect(service.threadState.activeCount).toBe(0);
            expect(service.threadState.maxThreads).toBe(5);
        });

        test('should have default schedule policy', () => {
            expect(service.threadState.schedulePolicy).toBe('priority');
        });
    });

    describe('createThread', () => {
        test('should create a new thread', () => {
            const result = service.createThread({
                name: '境界修炼',
                type: 'cultivation',
                priority: THREAD_PRIORITY.NORMAL,
                target: 100,
                maxDuration: 60000
            });
            expect(result.success).toBe(true);
            expect(result.thread.name).toBe('境界修炼');
            expect(result.thread.status).toBe(THREAD_STATUS.RUNNING);
            expect(service.threadState.activeCount).toBe(1);
        });

        test('should generate unique thread IDs', () => {
            const r1 = service.createThread({ name: 't1', type: 'cultivation', priority: 2, target: 100 });
            const r2 = service.createThread({ name: 't2', type: 'cultivation', priority: 2, target: 100 });
            expect(r1.thread.id).not.toBe(r2.thread.id);
        });

        test('should fail when max threads reached', () => {
            for (let i = 0; i < 5; i++) {
                service.createThread({ name: `t${i}`, type: 'cultivation', priority: 2, target: 100 });
            }
            const result = service.createThread({ name: 't6', type: 'cultivation', priority: 2, target: 100 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('最大线程数');
        });
    });

    describe('createSubGoal', () => {
        test('should create sub goal with dependency', () => {
            const parent = service.createThread({ name: '主目标', type: 'cultivation', priority: 1, target: 100 });
            const sub = service.createSubGoal(parent.thread.id, {
                name: '子目标',
                type: 'cultivation',
                priority: 2,
                target: 50
            });
            expect(sub.success).toBe(true);
            expect(sub.thread.dependencies).toContain(parent.thread.id);
        });

        test('should fail for non-existent parent', () => {
            const result = service.createSubGoal('nonexistent', { name: 'sub', type: 'cultivation', priority: 2, target: 50 });
            expect(result.success).toBe(false);
        });
    });

    describe('suspendThread', () => {
        test('should suspend running thread', () => {
            const t = service.createThread({ name: 'test', type: 'cultivation', priority: 2, target: 100 });
            const result = service.suspendThread(t.thread.id);
            expect(result.success).toBe(true);
            expect(result.thread.status).toBe(THREAD_STATUS.SUSPENDED);
            expect(service.threadState.activeCount).toBe(0);
        });

        test('should fail for non-existent thread', () => {
            const result = service.suspendThread('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    describe('resumeThread', () => {
        test('should resume suspended thread', () => {
            const t = service.createThread({ name: 'test', type: 'cultivation', priority: 2, target: 100 });
            service.suspendThread(t.thread.id);
            const result = service.resumeThread(t.thread.id);
            expect(result.success).toBe(true);
            expect(result.thread.status).toBe(THREAD_STATUS.RUNNING);
            expect(service.threadState.activeCount).toBe(1);
        });
    });

    describe('terminateThread', () => {
        test('should terminate running thread', () => {
            const t = service.createThread({ name: 'test', type: 'cultivation', priority: 2, target: 100 });
            const result = service.terminateThread(t.thread.id);
            expect(result.success).toBe(true);
            expect(result.thread.status).toBe(THREAD_STATUS.FAILED);
        });
    });

    describe('updateThread', () => {
        test('should increase progress over time', () => {
            const t = service.createThread({ name: 'test', type: 'cultivation', priority: 2, target: 1000 });
            const initial = service.threadState.threads[t.thread.id].currentProgress;
            service.updateThread(t.thread.id, 5000); // 5 seconds
            const updated = service.threadState.threads[t.thread.id].currentProgress;
            expect(updated).toBeGreaterThan(initial);
        });

        test('should complete when target reached', () => {
            const t = service.createThread({ name: 'test', type: 'cultivation', priority: 2, target: 10 });
            // Manually set low target for quick completion
            service.threadState.threads[t.thread.id].target = 1;
            const result = service.updateThread(t.thread.id, 1000);
            expect(result).not.toBeNull();
            expect(result.status).toBe(THREAD_STATUS.COMPLETED);
        });
    });

    describe('calculateProgress', () => {
        test('should apply type multiplier', () => {
            const cultivation = service.createThread({ name: 'c', type: 'cultivation', priority: 2, target: 1000 });
            const combat = service.createThread({ name: 'c', type: 'combat', priority: 2, target: 1000 });
            
            service.updateThread(cultivation.thread.id, 1000);
            service.updateThread(combat.thread.id, 1000);
            
            const cProgress = service.threadState.threads[cultivation.thread.id].currentProgress;
            const combatProgress = service.threadState.threads[combat.thread.id].currentProgress;
            // cultivation has 1.5x, combat has 1.2x
            expect(cProgress).toBeGreaterThan(combatProgress);
        });

        test('should apply priority multiplier', () => {
            const normal = service.createThread({ name: 'n', type: 'cultivation', priority: 2, target: 1000 });
            const critical = service.createThread({ name: 'c', type: 'cultivation', priority: 0, target: 1000 });
            
            service.updateThread(normal.thread.id, 1000);
            service.updateThread(critical.thread.id, 1000);
            
            const nProgress = service.threadState.threads[normal.thread.id].currentProgress;
            const cProgress = service.threadState.threads[critical.thread.id].currentProgress;
            // critical has 2.0x, normal has 1.0x
            expect(cProgress).toBeGreaterThan(nProgress);
        });
    });

    describe('scheduleAll', () => {
        test('should update all running threads', () => {
            const t1 = service.createThread({ name: 't1', type: 'cultivation', priority: 2, target: 1000 });
            const t2 = service.createThread({ name: 't2', type: 'combat', priority: 1, target: 1000 });
            
            const results = service.scheduleAll(1000);
            expect(results.length).toBe(2);
        });

        test('should prioritize critical threads', () => {
            const normal = service.createThread({ name: 'n', type: 'cultivation', priority: 2, target: 1000 });
            const critical = service.createThread({ name: 'c', type: 'cultivation', priority: 0, target: 1000 });
            
            const results = service.scheduleAll(1000);
            // Critical should be processed first (lower priority number = higher priority)
            const first = results[0];
            expect(first.threadId).toBe(critical.thread.id);
        });
    });

    describe('getThreadSummary', () => {
        test('should return correct counts', () => {
            const t1 = service.createThread({ name: 't1', type: 'cultivation', priority: 2, target: 100 });
            service.createThread({ name: 't2', type: 'combat', priority: 2, target: 100 });
            service.suspendThread(t1.thread.id);
            
            const summary = service.getThreadSummary();
            expect(summary.total).toBe(2);
            expect(summary.running).toBe(1);
            expect(summary.suspended).toBe(1);
        });
    });

    describe('setSchedulePolicy', () => {
        test('should set valid policy', () => {
            const result = service.setSchedulePolicy('round_robin');
            expect(result.success).toBe(true);
            expect(service.threadState.schedulePolicy).toBe('round_robin');
        });

        test('should reject invalid policy', () => {
            const result = service.setSchedulePolicy('invalid');
            expect(result.success).toBe(false);
        });
    });

    describe('MCP Tools', () => {
        describe('mcpCreateThread', () => {
            test('should create thread via MCP', () => {
                const result = service.mcpCreateThread({
                    name: 'MCP测试线程',
                    type: 'cultivation',
                    priority: 1,
                    target: 100,
                    maxDuration: 30000
                });
                expect(result.success).toBe(true);
                expect(result.thread.name).toBe('MCP测试线程');
            });
        });

        describe('mcpTickThreads', () => {
            test('should tick all threads', () => {
                service.createThread({ name: 't1', type: 'cultivation', priority: 2, target: 100 });
                const result = service.mcpTickThreads({ deltaTime: 1000 });
                expect(result.success).toBe(true);
                expect(result.summary.running).toBe(1);
            });
        });

        describe('mcpGetAllThreads', () => {
            test('should return all threads', () => {
                service.createThread({ name: 't1', type: 'cultivation', priority: 2, target: 100 });
                service.createThread({ name: 't2', type: 'combat', priority: 1, target: 100 });
                const result = service.mcpGetAllThreads();
                expect(result.success).toBe(true);
                expect(result.threads.length).toBe(2);
            });
        });

        describe('mcpSuspendThread', () => {
            test('should suspend via MCP', () => {
                const t = service.createThread({ name: 't', type: 'cultivation', priority: 2, target: 100 });
                const result = service.mcpSuspendThread({ threadId: t.thread.id });
                expect(result.success).toBe(true);
                expect(result.thread.status).toBe('suspended');
            });
        });

        describe('mcpResumeThread', () => {
            test('should resume via MCP', () => {
                const t = service.createThread({ name: 't', type: 'cultivation', priority: 2, target: 100 });
                service.suspendThread(t.thread.id);
                const result = service.mcpResumeThread({ threadId: t.thread.id });
                expect(result.success).toBe(true);
                expect(result.thread.status).toBe('running');
            });
        });

        describe('mcpTerminateThread', () => {
            test('should terminate via MCP', () => {
                const t = service.createThread({ name: 't', type: 'cultivation', priority: 2, target: 100 });
                const result = service.mcpTerminateThread({ threadId: t.thread.id });
                expect(result.success).toBe(true);
                expect(result.thread.status).toBe('failed');
            });
        });

        describe('mcpSetSchedulePolicy', () => {
            test('should set policy via MCP', () => {
                const result = service.mcpSetSchedulePolicy({ policy: 'resource_balanced' });
                expect(result.success).toBe(true);
                expect(result.policy).toBe('resource_balanced');
            });
        });

        describe('mcpCreateSubGoal', () => {
            test('should create sub goal via MCP', () => {
                const parent = service.createThread({ name: 'parent', type: 'cultivation', priority: 1, target: 100 });
                const result = service.mcpCreateSubGoal({
                    parentThreadId: parent.thread.id,
                    name: 'subgoal',
                    type: 'cultivation',
                    priority: 2,
                    target: 50
                });
                expect(result.success).toBe(true);
            });
        });
    });
});
