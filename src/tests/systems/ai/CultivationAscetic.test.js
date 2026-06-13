/**
 * CultivationAscetic.test.js - 修真苦修测试
 * V656 Iteration 9/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAscetic } from '../../../systems/ai/CultivationAscetic.js';

describe('CultivationAscetic', () => {
    let system;
    beforeEach(() => { system = new CultivationAscetic(); });

    describe('recruitAscetic', () => {
        it('should recruit', () => {
            const { ascetic } = system.recruitAscetic({ abbotId: 'a1', name: 'Ming', type: 'fasting' });
            expect(ascetic.abbotId).toBe('a1');
            expect(ascetic.name).toBe('Ming');
            expect(ascetic.type).toBe('fasting');
            expect(ascetic.purity).toBe(20);
            expect(ascetic.level).toBe(1);
            expect(ascetic.status).toBe('novice');
            expect(ascetic.practices).toEqual([]);
        });

        it('should recruit with silence type', () => {
            const { ascetic } = system.recruitAscetic({ abbotId: 'a1', name: 'Silent', type: 'silence' });
            expect(ascetic.type).toBe('silence');
        });

        it('should recruit with mortification type', () => {
            const { ascetic } = system.recruitAscetic({ abbotId: 'a1', name: 'Pain', type: 'mortification' });
            expect(ascetic.type).toBe('mortification');
        });

        it('should recruit with provided asceticId', () => {
            const { ascetic } = system.recruitAscetic({ asceticId: 'custom-asc-1' });
            expect(ascetic.asceticId).toBe('custom-asc-1');
        });

        it('should trigger asceticRecruited hook', () => {
            let called = false;
            system.registerHook('asceticRecruited', () => { called = true; });
            system.recruitAscetic({});
            expect(called).toBe(true);
        });

        it('should increment stats', () => {
            system.recruitAscetic({});
            expect(system.stats.totalAscetics).toBe(1);
        });
    });

    describe('getAscetic', () => {
        it('should return', () => {
            const { ascetic } = system.recruitAscetic({});
            expect(system.getAscetic(ascetic.asceticId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAscetic('ghost')).toBeNull(); });
    });

    describe('listAscetics', () => {
        it('should list all', () => {
            system.recruitAscetic({});
            system.recruitAscetic({});
            expect(system.listAscetics().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listAscetics().length).toBe(0);
        });
    });

    describe('listByAbbot', () => {
        it('should filter', () => {
            system.recruitAscetic({ abbotId: 'a1' });
            system.recruitAscetic({ abbotId: 'a2' });
            expect(system.listByAbbot('a1').length).toBe(1);
        });

        it('should return empty for unknown abbot', () => {
            system.recruitAscetic({ abbotId: 'a1' });
            expect(system.listByAbbot('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { ascetic } = system.recruitAscetic({});
            system.legendAscetic(ascetic.asceticId);
            system.recruitAscetic({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitAscetic({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPractice', () => {
        it('should add practice', () => {
            const { ascetic } = system.recruitAscetic({});
            system.addPractice(ascetic.asceticId, 'Cold Water Bath');
            expect(ascetic.practices).toContain('Cold Water Bath');
            expect(ascetic.practices.length).toBe(1);
        });

        it('should add multiple practices', () => {
            const { ascetic } = system.recruitAscetic({});
            system.addPractice(ascetic.asceticId, 'Fasting');
            system.addPractice(ascetic.asceticId, 'Meditation');
            expect(ascetic.practices.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addPractice('ghost', 'Fasting');
            expect(result.error).toBe('ASCETIC_NOT_FOUND');
        });

        it('should trigger practiceAdded hook', () => {
            const { ascetic } = system.recruitAscetic({});
            let called = false;
            system.registerHook('practiceAdded', () => { called = true; });
            system.addPractice(ascetic.asceticId, 'Sleep on Stone');
            expect(called).toBe(true);
        });
    });

    describe('deepenPurity', () => {
        it('should deepen with amount', () => {
            const { ascetic } = system.recruitAscetic({});
            system.deepenPurity(ascetic.asceticId, 10);
            expect(ascetic.purity).toBe(30);
        });

        it('should deepen with default', () => {
            const { ascetic } = system.recruitAscetic({});
            system.deepenPurity(ascetic.asceticId);
            expect(ascetic.purity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenPurity('ghost', 10);
            expect(result.error).toBe('ASCETIC_NOT_FOUND');
        });

        it('should trigger purityDeepened hook', () => {
            const { ascetic } = system.recruitAscetic({});
            let called = false;
            system.registerHook('purityDeepened', () => { called = true; });
            system.deepenPurity(ascetic.asceticId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAscetic', () => {
        it('should level up', () => {
            const { ascetic } = system.recruitAscetic({});
            system.levelUpAscetic(ascetic.asceticId);
            expect(ascetic.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { ascetic } = system.recruitAscetic({});
            for (let i = 0; i < 4; i++) system.levelUpAscetic(ascetic.asceticId);
            expect(ascetic.level).toBe(5);
            expect(ascetic.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpAscetic('ghost');
            expect(result.error).toBe('ASCETIC_NOT_FOUND');
        });

        it('should trigger asceticLeveledUp hook', () => {
            const { ascetic } = system.recruitAscetic({});
            let called = false;
            system.registerHook('asceticLeveledUp', () => { called = true; });
            system.levelUpAscetic(ascetic.asceticId);
            expect(called).toBe(true);
        });
    });

    describe('legendAscetic', () => {
        it('should legendize', () => {
            const { ascetic } = system.recruitAscetic({});
            system.legendAscetic(ascetic.asceticId);
            expect(ascetic.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAscetic('ghost');
            expect(result.error).toBe('ASCETIC_NOT_FOUND');
        });

        it('should trigger asceticLegendized hook', () => {
            const { ascetic } = system.recruitAscetic({});
            let called = false;
            system.registerHook('asceticLegendized', () => { called = true; });
            system.legendAscetic(ascetic.asceticId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAsceticValue', () => {
        it('should calculate', () => {
            const { ascetic } = system.recruitAscetic({});
            system.levelUpAscetic(ascetic.asceticId);
            system.deepenPurity(ascetic.asceticId, 5);
            system.addPractice(ascetic.asceticId, 'Cold Bath');
            // level=2, purity=25, practices.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateAsceticValue(ascetic.asceticId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAsceticValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { ascetic } = system.recruitAscetic({});
            for (let i = 0; i < 4; i++) system.levelUpAscetic(ascetic.asceticId);
            system.recruitAscetic({});
            expect(system.listVeterans().length).toBe(1);
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

        it('should execute default getAscetic', () => {
            const result = system.executeTool('getAscetic', { asceticId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('asceticRecruited', () => count++);
            unregister();
            system.recruitAscetic({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('asceticRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAscetic({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAscetics = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAscetics = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAscetic({});
            const json = system.toJSON();
            expect(json.ascetics.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAscetic({});
            const json = system.toJSON();
            const newSys = new CultivationAscetic();
            newSys.fromJSON(json);
            expect(newSys.ascetics.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.asceticCount).toBe(0);
        });
    });
});
