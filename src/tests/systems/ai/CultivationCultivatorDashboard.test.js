/**
 * CultivationCultivatorDashboard.test.js - 修真者仪表盘测试
 * V647 Iteration 30/30 FINAL Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCultivatorDashboard } from '../../../systems/ai/CultivationCultivatorDashboard.js';

describe('CultivationCultivatorDashboard', () => {
    let system;
    beforeEach(() => { system = new CultivationCultivatorDashboard(); });

    describe('recruitCultivator', () => {
        it('should create', () => {
            const { cultivator } = system.recruitCultivator({ name: 'Han' });
            expect(cultivator.name).toBe('Han');
        });

        it('should set initial metrics', () => {
            const { cultivator } = system.recruitCultivator({});
            expect(system.getMetrics(cultivator.cultivatorId)).not.toBeNull();
        });

        it('should trigger cultivatorRecruited hook', () => {
            let called = false;
            system.registerHook('cultivatorRecruited', () => { called = true; });
            system.recruitCultivator({});
            expect(called).toBe(true);
        });
    });

    describe('getCultivator', () => {
        it('should return', () => {
            const { cultivator } = system.recruitCultivator({});
            expect(system.getCultivator(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivator('ghost')).toBeNull(); });
    });

    describe('listCultivators', () => {
        it('should list all', () => {
            system.recruitCultivator({});
            expect(system.listCultivators().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.recruitCultivator({ type: 'sword' });
            system.recruitCultivator({ type: 'magic' });
            expect(system.listByType('sword').length).toBe(1);
        });
    });

    describe('listByElder', () => {
        it('should filter', () => {
            system.recruitCultivator({ elderId: 'e1' });
            system.recruitCultivator({ elderId: 'e2' });
            expect(system.listByElder('e1').length).toBe(1);
        });
    });

    describe('listByLevel', () => {
        it('should filter', () => {
            system.recruitCultivator({});
            system.recruitCultivator({});
            expect(system.listByLevel(1).length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.recruitCultivator({});
            system.recruitCultivator({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.recruitCultivator({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { cultivator } = system.recruitCultivator({});
            const result = system.setMetrics(cultivator.cultivatorId, { qi: 99 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { cultivator } = system.recruitCultivator({});
            expect(system.getMetrics(cultivator.cultivatorId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshCultivator', () => {
        it('should refresh', () => {
            const { cultivator } = system.recruitCultivator({});
            const result = system.refreshCultivator(cultivator.cultivatorId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshCultivator('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger cultivatorRefreshed hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('cultivatorRefreshed', () => { called = true; });
            system.refreshCultivator(cultivator.cultivatorId);
            expect(called).toBe(true);
        });
    });

    describe('gainQi', () => {
        it('should gain', () => {
            const { cultivator } = system.recruitCultivator({});
            system.gainQi(cultivator.cultivatorId, 50);
            expect(cultivator.qi).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.gainQi('ghost', 5);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger qiGained hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('qiGained', () => { called = true; });
            system.gainQi(cultivator.cultivatorId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addRealm', () => {
        it('should add', () => {
            const { cultivator } = system.recruitCultivator({});
            system.addRealm(cultivator.cultivatorId, 'qi-refining');
            expect(cultivator.realms.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addRealm('ghost', 'realm');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger realmAdded hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('realmAdded', () => { called = true; });
            system.addRealm(cultivator.cultivatorId, 'foundation');
            expect(called).toBe(true);
        });
    });

    describe('promoteCultivator', () => {
        it('should promote', () => {
            const { cultivator } = system.recruitCultivator({});
            system.promoteCultivator(cultivator.cultivatorId);
            expect(cultivator.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteCultivator('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger cultivatorPromoted hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('cultivatorPromoted', () => { called = true; });
            system.promoteCultivator(cultivator.cultivatorId);
            expect(called).toBe(true);
        });
    });

    describe('trainCultivator', () => {
        it('should train', () => {
            const { cultivator } = system.recruitCultivator({});
            system.trainCultivator(cultivator.cultivatorId);
            expect(cultivator.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.trainCultivator('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger cultivatorTrained hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('cultivatorTrained', () => { called = true; });
            system.trainCultivator(cultivator.cultivatorId);
            expect(called).toBe(true);
        });
    });

    describe('tribulateCultivator', () => {
        it('should tribulate', () => {
            const { cultivator } = system.recruitCultivator({});
            system.tribulateCultivator(cultivator.cultivatorId);
            expect(cultivator.status).toBe('tribulating');
        });

        it('should reject missing', () => {
            const result = system.tribulateCultivator('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger cultivatorTribulating hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('cultivatorTribulating', () => { called = true; });
            system.tribulateCultivator(cultivator.cultivatorId);
            expect(called).toBe(true);
        });
    });

    describe('legendCultivator', () => {
        it('should legend', () => {
            const { cultivator } = system.recruitCultivator({});
            system.legendCultivator(cultivator.cultivatorId);
            expect(cultivator.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCultivator('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger cultivatorLegendized hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('cultivatorLegendized', () => { called = true; });
            system.legendCultivator(cultivator.cultivatorId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { cultivator } = system.recruitCultivator({});
            system.changeType(cultivator.cultivatorId, 'magic');
            expect(cultivator.type).toBe('magic');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'magic');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(cultivator.cultivatorId, 'sword');
            expect(called).toBe(true);
        });
    });

    describe('calculateCultivatorValue', () => {
        it('should calculate', () => {
            const { cultivator } = system.recruitCultivator({});
            expect(system.calculateCultivatorValue(cultivator.cultivatorId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCultivatorValue('ghost')).toBe(0);
        });
    });

    describe('deleteCultivator', () => {
        it('should delete', () => {
            const { cultivator } = system.recruitCultivator({});
            const result = system.deleteCultivator(cultivator.cultivatorId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteCultivator('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger cultivatorDeleted hook', () => {
            const { cultivator } = system.recruitCultivator({});
            let called = false;
            system.registerHook('cultivatorDeleted', () => { called = true; });
            system.deleteCultivator(cultivator.cultivatorId);
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

        it('should execute default listByType', () => {
            system.recruitCultivator({ type: 'sword' });
            const result = system.executeTool('listByType', { type: 'sword' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cultivatorRecruited', () => count++);
            unregister();
            system.recruitCultivator({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cultivatorRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCultivator({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCultivators = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCultivators = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCultivator({});
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCultivator({});
            const json = system.toJSON();
            const newSys = new CultivationCultivatorDashboard();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(0);
        });
    });
});