/**
 * CultivationRebirth.test.js - 修真轮回测试
 * V597 Iteration 20/20 FINAL Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRebirth } from '../../../systems/ai/CultivationRebirth.js';

describe('CultivationRebirth', () => {
    let system;
    beforeEach(() => { system = new CultivationRebirth(); });

    describe('startCycle', () => {
        it('should create', () => {
            const { cycle } = system.startCycle({ name: 'First Cycle' });
            expect(cycle.name).toBe('First Cycle');
        });

        it('should set initial memories', () => {
            const { cycle } = system.startCycle({});
            expect(system.getMemories(cycle.cycleId)).not.toBeNull();
        });

        it('should trigger cycleStarted hook', () => {
            let called = false;
            system.registerHook('cycleStarted', () => { called = true; });
            system.startCycle({});
            expect(called).toBe(true);
        });
    });

    describe('getCycle', () => {
        it('should return', () => {
            const { cycle } = system.startCycle({});
            expect(system.getCycle(cycle.cycleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCycle('ghost')).toBeNull(); });
    });

    describe('listCycles', () => {
        it('should list all', () => {
            system.startCycle({});
            expect(system.listCycles().length).toBe(1);
        });
    });

    describe('listBySoul', () => {
        it('should filter', () => {
            system.startCycle({ soulId: 's1' });
            system.startCycle({ soulId: 's2' });
            expect(system.listBySoul('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.startCycle({ type: 'natural' });
            system.startCycle({ type: 'tragic' });
            expect(system.listByType('natural').length).toBe(1);
        });
    });

    describe('listByMemory', () => {
        it('should filter', () => {
            system.startCycle({});
            system.startCycle({ memory: 200 });
            expect(system.listByMemory(100).length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.startCycle({});
            system.startCycle({});
            expect(system.listTop(2).length).toBe(2);
        });
    });

    describe('setMemories', () => {
        it('should set', () => {
            const { cycle } = system.startCycle({});
            const result = system.setMemories(cycle.cycleId, { identity: 90 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMemories('ghost', {});
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });
    });

    describe('getMemories', () => {
        it('should return', () => {
            const { cycle } = system.startCycle({});
            expect(system.getMemories(cycle.cycleId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMemories('ghost')).toBeNull();
        });
    });

    describe('refreshCycle', () => {
        it('should refresh', () => {
            const { cycle } = system.startCycle({});
            const result = system.refreshCycle(cycle.cycleId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshCycle('ghost');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger cycleRefreshed hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('cycleRefreshed', () => { called = true; });
            system.refreshCycle(cycle.cycleId);
            expect(called).toBe(true);
        });
    });

    describe('deepenMemory', () => {
        it('should deepen', () => {
            const { cycle } = system.startCycle({});
            system.deepenMemory(cycle.cycleId, 50);
            expect(cycle.memory).toBe(80);
        });

        it('should reject missing', () => {
            const result = system.deepenMemory('ghost', 5);
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger memoryDeepened hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('memoryDeepened', () => { called = true; });
            system.deepenMemory(cycle.cycleId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addLesson', () => {
        it('should add', () => {
            const { cycle } = system.startCycle({});
            system.addLesson(cycle.cycleId, 'love');
            expect(cycle.lessons.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addLesson('ghost', 'love');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger lessonAdded hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('lessonAdded', () => { called = true; });
            system.addLesson(cycle.cycleId, 'love');
            expect(called).toBe(true);
        });
    });

    describe('promoteCycle', () => {
        it('should promote', () => {
            const { cycle } = system.startCycle({});
            system.promoteCycle(cycle.cycleId);
            expect(cycle.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteCycle('ghost');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger cyclePromoted hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('cyclePromoted', () => { called = true; });
            system.promoteCycle(cycle.cycleId);
            expect(called).toBe(true);
        });
    });

    describe('reincarnate', () => {
        it('should reincarnate', () => {
            const { cycle } = system.startCycle({});
            system.reincarnate(cycle.cycleId);
            expect(cycle.status).toBe('reincarnated');
        });

        it('should reject missing', () => {
            const result = system.reincarnate('ghost');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger cycleReincarnated hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('cycleReincarnated', () => { called = true; });
            system.reincarnate(cycle.cycleId);
            expect(called).toBe(true);
        });
    });

    describe('ascendCycle', () => {
        it('should ascend', () => {
            const { cycle } = system.startCycle({});
            system.ascendCycle(cycle.cycleId);
            expect(cycle.status).toBe('ascended');
        });

        it('should reject missing', () => {
            const result = system.ascendCycle('ghost');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger cycleAscended hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('cycleAscended', () => { called = true; });
            system.ascendCycle(cycle.cycleId);
            expect(called).toBe(true);
        });
    });

    describe('mergeCycle', () => {
        it('should merge', () => {
            const { cycle } = system.startCycle({});
            system.mergeCycle(cycle.cycleId);
            expect(cycle.status).toBe('merged');
        });

        it('should reject missing', () => {
            const result = system.mergeCycle('ghost');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger cycleMerged hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('cycleMerged', () => { called = true; });
            system.mergeCycle(cycle.cycleId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { cycle } = system.startCycle({});
            system.changeType(cycle.cycleId, 'tragic');
            expect(cycle.type).toBe('tragic');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'tragic');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should should trigger typeChanged hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(cycle.cycleId, 'natural');
            expect(called).toBe(true);
        });
    });

    describe('calculateRebirthValue', () => {
        it('should calculate', () => {
            const { cycle } = system.startCycle({});
            expect(system.calculateRebirthValue(cycle.cycleId)).toBe(160);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRebirthValue('ghost')).toBe(0);
        });
    });

    describe('deleteCycle', () => {
        it('should delete', () => {
            const { cycle } = system.startCycle({});
            const result = system.deleteCycle(cycle.cycleId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteCycle('ghost');
            expect(result.error).toBe('CYCLE_NOT_FOUND');
        });

        it('should trigger cycleDeleted hook', () => {
            const { cycle } = system.startCycle({});
            let called = false;
            system.registerHook('cycleDeleted', () => { called = true; });
            system.deleteCycle(cycle.cycleId);
            expect(called).toBe(true);
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

        it('should execute default getCycle', () => {
            const result = system.executeTool('getCycle', { cycleId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cycleStarted', () => count++);
            unregister();
            system.startCycle({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cycleStarted', () => { throw new Error('x'); });
            expect(() => system.startCycle({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCycles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCycles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startCycle({});
            const json = system.toJSON();
            expect(json.cycles.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startCycle({});
            const json = system.toJSON();
            const newSys = new CultivationRebirth();
            newSys.fromJSON(json);
            expect(newSys.cycles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cycleCount).toBe(0);
        });
    });
});