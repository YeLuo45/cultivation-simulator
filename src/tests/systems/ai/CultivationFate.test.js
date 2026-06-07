/**
 * CultivationFate.test.js - 修真命运测试
 * V738 Iteration 1/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFate } from '../../../systems/ai/CultivationFate.js';

describe('CultivationFate', () => {
    let system;
    beforeEach(() => { system = new CultivationFate(); });

    describe('recruitFate', () => {
        it('should recruit', () => {
            const { fate } = system.recruitFate({ masterId: 'm1', name: 'Destiny1', type: 'destined' });
            expect(fate.masterId).toBe('m1');
            expect(fate.name).toBe('Destiny1');
            expect(fate.type).toBe('destined');
        });

        it('should default name to unnamed', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            expect(fate.name).toBe('unnamed');
        });

        it('should default type to destined', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            expect(fate.type).toBe('destined');
        });

        it('should default inevitability to baseInevitability', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            expect(fate.inevitability).toBe(20);
        });

        it('should set level to 1 and status to novice', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            expect(fate.level).toBe(1);
            expect(fate.status).toBe('novice');
        });

        it('should init empty threads', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            expect(fate.threads).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            expect(fate.fateId).toBeTruthy();
        });

        it('should respect provided id', () => {
            const { fate } = system.recruitFate({ id: 'custom-fate', masterId: 'm1' });
            expect(fate.fateId).toBe('custom-fate');
        });

        it('should accept custom threads', () => {
            const { fate } = system.recruitFate({ masterId: 'm1', threads: ['t1', 't2'] });
            expect(fate.threads.length).toBe(2);
        });

        it('should accept custom inevitability', () => {
            const { fate } = system.recruitFate({ masterId: 'm1', inevitability: 99 });
            expect(fate.inevitability).toBe(99);
        });

        it('should increment totalFates', () => {
            system.recruitFate({ masterId: 'm1' });
            expect(system.stats.totalFates).toBe(1);
        });

        it('should trigger fateRecruited hook', () => {
            let called = false;
            system.registerHook('fateRecruited', () => { called = true; });
            system.recruitFate({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getFate', () => {
        it('should return fate', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            expect(system.getFate(fate.fateId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFate('ghost')).toBeNull(); });
    });

    describe('listFates', () => {
        it('should list all', () => {
            system.recruitFate({ masterId: 'm1' });
            system.recruitFate({ masterId: 'm2' });
            expect(system.listFates().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listFates().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitFate({ masterId: 'm1' });
            system.recruitFate({ masterId: 'm2' });
            system.recruitFate({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitFate({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { fate: f1 } = system.recruitFate({ masterId: 'm1' });
            system.recruitFate({ masterId: 'm1' });
            system.legendFate(f1.fateId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitFate({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addThread', () => {
        it('should add thread', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.addThread(fate.fateId, 't1');
            expect(fate.threads.length).toBe(1);
            expect(fate.threads[0]).toBe('t1');
        });

        it('should reject missing fate', () => {
            const result = system.addThread('ghost', 't1');
            expect(result.error).toBe('FATE_NOT_FOUND');
        });

        it('should promote to veteran at 3 threads', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.addThread(fate.fateId, 't1');
            system.addThread(fate.fateId, 't2');
            system.addThread(fate.fateId, 't3');
            expect(fate.status).toBe('veteran');
        });

        it('should not promote past veteran', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.legendFate(fate.fateId);
            system.addThread(fate.fateId, 't1');
            system.addThread(fate.fateId, 't2');
            system.addThread(fate.fateId, 't3');
            expect(fate.status).toBe('legendary');
        });

        it('should trigger threadAdded hook', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            let called = false;
            system.registerHook('threadAdded', () => { called = true; });
            system.addThread(fate.fateId, 't1');
            expect(called).toBe(true);
        });
    });

    describe('raiseInevitability', () => {
        it('should raise by default 5', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.raiseInevitability(fate.fateId);
            expect(fate.inevitability).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.raiseInevitability(fate.fateId, 50);
            expect(fate.inevitability).toBe(70);
        });

        it('should reject missing fate', () => {
            const result = system.raiseInevitability('ghost', 5);
            expect(result.error).toBe('FATE_NOT_FOUND');
        });

        it('should trigger inevitabilityRaised hook', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            let called = false;
            system.registerHook('inevitabilityRaised', () => { called = true; });
            system.raiseInevitability(fate.fateId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFate', () => {
        it('should level up', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.levelUpFate(fate.fateId);
            expect(fate.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.levelUpFate(fate.fateId);
            system.levelUpFate(fate.fateId);
            system.levelUpFate(fate.fateId);
            expect(fate.level).toBe(4);
        });

        it('should reject missing fate', () => {
            const result = system.levelUpFate('ghost');
            expect(result.error).toBe('FATE_NOT_FOUND');
        });

        it('should trigger fateLeveledUp hook', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            let called = false;
            system.registerHook('fateLeveledUp', () => { called = true; });
            system.levelUpFate(fate.fateId);
            expect(called).toBe(true);
        });
    });

    describe('legendFate', () => {
        it('should set status to legendary', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.legendFate(fate.fateId);
            expect(fate.status).toBe('legendary');
        });

        it('should reject missing fate', () => {
            const result = system.legendFate('ghost');
            expect(result.error).toBe('FATE_NOT_FOUND');
        });

        it('should trigger fateLegendized hook', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            let called = false;
            system.registerHook('fateLegendized', () => { called = true; });
            system.legendFate(fate.fateId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFateValue', () => {
        it('should calculate base value', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            // level=1, inevitability=20, threads=0 -> 100 + 40 + 0 = 140
            expect(system.calculateFateValue(fate.fateId)).toBe(140);
        });

        it('should factor in level', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.levelUpFate(fate.fateId);
            system.levelUpFate(fate.fateId);
            // level=3, inevitability=20, threads=0 -> 300 + 40 + 0 = 340
            expect(system.calculateFateValue(fate.fateId)).toBe(340);
        });

        it('should factor in threads', () => {
            const { fate } = system.recruitFate({ masterId: 'm1' });
            system.addThread(fate.fateId, 't1');
            system.addThread(fate.fateId, 't2');
            // level=1, inevitability=20, threads=2 -> 100 + 40 + 60 = 200
            expect(system.calculateFateValue(fate.fateId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFateValue('ghost')).toBe(0);
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

        it('should execute default getFate', () => {
            const result = system.executeTool('getFate', { fateId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('fateRecruited', () => count++);
            unregister();
            system.recruitFate({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('fateRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitFate({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFates = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalFates = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitFate({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.fates.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitFate({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationFate();
            newSys.fromJSON(json);
            expect(newSys.fates.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.fateCount).toBe(0);
            expect(stats.totalFates).toBe(0);
        });
    });

    describe('config defaults', () => {
        it('should accept custom config', () => {
            const sys = new CultivationFate({ maxFates: 50, baseInevitability: 10 });
            expect(sys.config.maxFates).toBe(50);
            expect(sys.config.baseInevitability).toBe(10);
        });
    });
});
