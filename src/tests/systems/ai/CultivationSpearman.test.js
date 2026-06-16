/**
 * CultivationSpearman.test.js - 修真枪兵测试
 * V619 Iteration 2/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSpearman } from '../../../systems/ai/CultivationSpearman.js';

describe('CultivationSpearman', () => {
    let system;
    beforeEach(() => { system = new CultivationSpearman(); });

    describe('recruitSpearman', () => {
        it('should recruit', () => {
            const { spearman } = system.recruitSpearman({ commanderId: 'c1', name: 'Zhuge' });
            expect(spearman.commanderId).toBe('c1');
            expect(spearman.name).toBe('Zhuge');
        });

        it('should default type to lance', () => {
            const { spearman } = system.recruitSpearman({});
            expect(spearman.type).toBe('lance');
        });

        it('should default precision to basePrecision', () => {
            const { spearman } = system.recruitSpearman({});
            expect(spearman.precision).toBe(20);
        });

        it('should initialize with novice status and level 1', () => {
            const { spearman } = system.recruitSpearman({});
            expect(spearman.status).toBe('novice');
            expect(spearman.level).toBe(1);
        });

        it('should initialize with empty spears array', () => {
            const { spearman } = system.recruitSpearman({});
            expect(spearman.spears).toEqual([]);
        });

        it('should trigger spearmanRecruited hook', () => {
            let called = false;
            system.registerHook('spearmanRecruited', () => { called = true; });
            system.recruitSpearman({});
            expect(called).toBe(true);
        });

        it('should accept custom spear input', () => {
            const { spearman } = system.recruitSpearman({ spears: ['dragon', 'phoenix'] });
            expect(spearman.spears).toEqual(['dragon', 'phoenix']);
        });

        it('should support all three types', () => {
            const types = ['lance', 'pike', 'javelin'];
            for (const t of types) {
                const { spearman } = system.recruitSpearman({ type: t });
                expect(spearman.type).toBe(t);
            }
        });
    });

    describe('getSpearman', () => {
        it('should return', () => {
            const { spearman } = system.recruitSpearman({});
            expect(system.getSpearman(spearman.spearmanId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSpearman('ghost')).toBeNull(); });
    });

    describe('listSpearmen', () => {
        it('should list all', () => {
            system.recruitSpearman({});
            system.recruitSpearman({});
            expect(system.listSpearmen().length).toBe(2);
        });

        it('should return empty array when no spearmen', () => {
            expect(system.listSpearmen().length).toBe(0);
        });
    });

    describe('listByCommander', () => {
        it('should filter', () => {
            system.recruitSpearman({ commanderId: 'c1' });
            system.recruitSpearman({ commanderId: 'c2' });
            expect(system.listByCommander('c1').length).toBe(1);
        });

        it('should return empty for unknown commander', () => {
            system.recruitSpearman({ commanderId: 'c1' });
            expect(system.listByCommander('ghost').length).toBe(0);
        });

        it('should return multiple spearmen for same commander', () => {
            system.recruitSpearman({ commanderId: 'c1' });
            system.recruitSpearman({ commanderId: 'c1' });
            system.recruitSpearman({ commanderId: 'c2' });
            expect(system.listByCommander('c1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary spearmen', () => {
            const { spearman: a1 } = system.recruitSpearman({});
            system.recruitSpearman({});
            system.legendSpearman(a1.spearmanId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendaries', () => {
            system.recruitSpearman({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSpear', () => {
        it('should add spear', () => {
            const { spearman } = system.recruitSpearman({});
            system.addSpear(spearman.spearmanId, 'dragon');
            expect(spearman.spears).toContain('dragon');
        });

        it('should add multiple spears', () => {
            const { spearman } = system.recruitSpearman({});
            system.addSpear(spearman.spearmanId, 'dragon');
            system.addSpear(spearman.spearmanId, 'phoenix');
            expect(spearman.spears.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSpear('ghost', 'dragon');
            expect(result.error).toBe('SPEARMAN_NOT_FOUND');
        });

        it('should trigger spearAdded hook', () => {
            const { spearman } = system.recruitSpearman({});
            let called = false;
            system.registerHook('spearAdded', () => { called = true; });
            system.addSpear(spearman.spearmanId, 'dragon');
            expect(called).toBe(true);
        });
    });

    describe('improvePrecision', () => {
        it('should improve precision with default amount', () => {
            const { spearman } = system.recruitSpearman({});
            system.improvePrecision(spearman.spearmanId);
            expect(spearman.precision).toBe(25);
        });

        it('should improve precision with custom amount', () => {
            const { spearman } = system.recruitSpearman({});
            system.improvePrecision(spearman.spearmanId, 10);
            expect(spearman.precision).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.improvePrecision('ghost', 10);
            expect(result.error).toBe('SPEARMAN_NOT_FOUND');
        });

        it('should trigger precisionImproved hook', () => {
            const { spearman } = system.recruitSpearman({});
            let called = false;
            system.registerHook('precisionImproved', () => { called = true; });
            system.improvePrecision(spearman.spearmanId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSpearman', () => {
        it('should level up', () => {
            const { spearman } = system.recruitSpearman({});
            system.levelUpSpearman(spearman.spearmanId);
            expect(spearman.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { spearman } = system.recruitSpearman({});
            system.levelUpSpearman(spearman.spearmanId);
            system.levelUpSpearman(spearman.spearmanId);
            expect(spearman.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpSpearman('ghost');
            expect(result.error).toBe('SPEARMAN_NOT_FOUND');
        });

        it('should trigger spearmanLeveledUp hook', () => {
            const { spearman } = system.recruitSpearman({});
            let called = false;
            system.registerHook('spearmanLeveledUp', () => { called = true; });
            system.levelUpSpearman(spearman.spearmanId);
            expect(called).toBe(true);
        });
    });

    describe('legendSpearman', () => {
        it('should set status to legendary', () => {
            const { spearman } = system.recruitSpearman({});
            system.legendSpearman(spearman.spearmanId);
            expect(spearman.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSpearman('ghost');
            expect(result.error).toBe('SPEARMAN_NOT_FOUND');
        });

        it('should trigger spearmanLegendized hook', () => {
            const { spearman } = system.recruitSpearman({});
            let called = false;
            system.registerHook('spearmanLegendized', () => { called = true; });
            system.legendSpearman(spearman.spearmanId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSpearmanValue', () => {
        it('should calculate base value', () => {
            const { spearman } = system.recruitSpearman({});
            // level(1)*100 + precision(20)*2 + spears(0)*30 = 100 + 40 + 0 = 140
            expect(system.calculateSpearmanValue(spearman.spearmanId)).toBe(140);
        });

        it('should include spear value', () => {
            const { spearman } = system.recruitSpearman({ spears: ['a', 'b', 'c'] });
            // level(1)*100 + precision(20)*2 + spears(3)*30 = 100 + 40 + 90 = 230
            expect(system.calculateSpearmanValue(spearman.spearmanId)).toBe(230);
        });

        it('should include level in value', () => {
            const { spearman } = system.recruitSpearman({});
            system.levelUpSpearman(spearman.spearmanId);
            // level(2)*100 + precision(20)*2 + spears(0)*30 = 200 + 40 + 0 = 240
            expect(system.calculateSpearmanValue(spearman.spearmanId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSpearmanValue('ghost')).toBe(0);
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

        it('should execute default getSpearman', () => {
            const result = system.executeTool('getSpearman', { spearmanId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitSpearman', () => {
            const result = system.executeTool('recruitSpearman', { name: 'Test' });
            expect(result.success).toBe(true);
            expect(result.result.spearman.name).toBe('Test');
        });

        it('should default context to empty object', () => {
            system.registerTool('noctx', () => 'ok');
            const result = system.executeTool('noctx');
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('spearmanRecruited', () => count++);
            unregister();
            system.recruitSpearman({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('spearmanRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSpearman({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSpearmen = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSpearmen = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSpearman({});
            const json = system.toJSON();
            expect(json.spearmen.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSpearman({});
            const json = system.toJSON();
            const newSys = new CultivationSpearman();
            newSys.fromJSON(json);
            expect(newSys.spearmen.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.spearmanCount).toBe(0);
        });

        it('should reflect added spearmen', () => {
            system.recruitSpearman({});
            const stats = system.getStats();
            expect(stats.spearmanCount).toBe(1);
        });
    });
});
