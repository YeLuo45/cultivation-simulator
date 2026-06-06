/**
 * CultivationSamurai.test.js - 修真武士测试
 * V617 Iteration 20/20 FINAL Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSamurai } from '../../../systems/ai/CultivationSamurai.js';

describe('CultivationSamurai', () => {
    let system;
    beforeEach(() => { system = new CultivationSamurai(); });

    describe('recruitSamurai', () => {
        it('should create', () => {
            const { samurai } = system.recruitSamurai({ name: 'Miyamoto' });
            expect(samurai.name).toBe('Miyamoto');
        });

        it('should set initial metrics', () => {
            const { samurai } = system.recruitSamurai({});
            expect(system.getMetrics(samurai.samuraiId)).not.toBeNull();
        });

        it('should trigger samuraiRecruited hook', () => {
            let called = false;
            system.registerHook('samuraiRecruited', () => { called = true; });
            system.recruitSamurai({});
            expect(called).toBe(true);
        });
    });

    describe('getSamurai', () => {
        it('should return', () => {
            const { samurai } = system.recruitSamurai({});
            expect(system.getSamurai(samurai.samuraiId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSamurai('ghost')).toBeNull(); });
    });

    describe('listSamurais', () => {
        it('should list all', () => {
            system.recruitSamurai({});
            expect(system.listSamurais().length).toBe(1);
        });
    });

    describe('listBySensei', () => {
        it('should filter', () => {
            system.recruitSamurai({ senseiId: 's1' });
            system.recruitSamurai({ senseiId: 's2' });
            expect(system.listBySensei('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.recruitSamurai({ type: 'katana' });
            system.recruitSamurai({ type: 'spear' });
            expect(system.listByType('katana').length).toBe(1);
        });
    });

    describe('listByHonor', () => {
        it('should filter', () => {
            system.recruitSamurai({});
            system.recruitSamurai({ honor: 200 });
            expect(system.listByHonor(100).length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.recruitSamurai({});
            system.recruitSamurai({});
            expect(system.listTop(2).length).toBe(2);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { samurai } = system.recruitSamurai({});
            const result = system.setMetrics(samurai.samuraiId, { honor: 90 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { samurai } = system.recruitSamurai({});
            expect(system.getMetrics(samurai.samuraiId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshSamurai', () => {
        it('should refresh', () => {
            const { samurai } = system.recruitSamurai({});
            const result = system.refreshSamurai(samurai.samuraiId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshSamurai('ghost');
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger samuraiRefreshed hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('samuraiRefreshed', () => { called = true; });
            system.refreshSamurai(samurai.samuraiId);
            expect(called).toBe(true);
        });
    });

    describe('gainHonor', () => {
        it('should gain', () => {
            const { samurai } = system.recruitSamurai({});
            system.gainHonor(samurai.samuraiId, 50);
            expect(samurai.honor).toBe(80);
        });

        it('should reject missing', () => {
            const result = system.gainHonor('ghost', 5);
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger honorGained hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('honorGained', () => { called = true; });
            system.gainHonor(samurai.samuraiId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addTechnique', () => {
        it('should add', () => {
            const { samurai } = system.recruitSamurai({});
            system.addTechnique(samurai.samuraiId, 'iaijutsu');
            expect(samurai.techniques.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addTechnique('ghost', 'iaijutsu');
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger techniqueAdded hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('techniqueAdded', () => { called = true; });
            system.addTechnique(samurai.samuraiId, 'iaijutsu');
            expect(called).toBe(true);
        });
    });

    describe('promoteSamurai', () => {
        it('should promote', () => {
            const { samurai } = system.recruitSamurai({});
            system.promoteSamurai(samurai.samuraiId);
            expect(samurai.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteSamurai('ghost');
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger samuraiPromoted hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('samuraiPromoted', () => { called = true; });
            system.promoteSamurai(samurai.samuraiId);
            expect(called).toBe(true);
        });
    });

    describe('trainSamurai', () => {
        it('should train', () => {
            const { samurai } = system.recruitSamurai({});
            system.trainSamurai(samurai.samuraiId);
            expect(samurai.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.trainSamurai('ghost');
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger samuraiTrained hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('samuraiTrained', () => { called = true; });
            system.trainSamurai(samurai.samuraiId);
            expect(called).toBe(true);
        });
    });

    describe('duelSamurai', () => {
        it('should duel', () => {
            const { samurai } = system.recruitSamurai({});
            system.duelSamurai(samurai.samuraiId);
            expect(samurai.status).toBe('dueling');
        });

        it('should reject missing', () => {
            const result = system.duelSamurai('ghost');
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger samuraiDueling hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('samuraiDueling', () => { called = true; });
            system.duelSamurai(samurai.samuraiId);
            expect(called).toBe(true);
        });
    });

    describe('legendSamurai', () => {
        it('should legend', () => {
            const { samurai } = system.recruitSamurai({});
            system.legendSamurai(samurai.samuraiId);
            expect(samurai.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSamurai('ghost');
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger samuraiLegendized hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('samuraiLegendized', () => { called = true; });
            system.legendSamurai(samurai.samuraiId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { samurai } = system.recruitSamurai({});
            system.changeType(samurai.samuraiId, 'spear');
            expect(samurai.type).toBe('spear');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'spear');
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(samurai.samuraiId, 'naginata');
            expect(called).toBe(true);
        });
    });

    describe('calculateSamuraiValue', () => {
        it('should calculate', () => {
            const { samurai } = system.recruitSamurai({});
            expect(system.calculateSamuraiValue(samurai.samuraiId)).toBe(160);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSamuraiValue('ghost')).toBe(0);
        });
    });

    describe('deleteSamurai', () => {
        it('should delete', () => {
            const { samurai } = system.recruitSamurai({});
            const result = system.deleteSamurai(samurai.samuraiId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteSamurai('ghost');
            expect(result.error).toBe('SAMURAI_NOT_FOUND');
        });

        it('should trigger samuraiDeleted hook', () => {
            const { samurai } = system.recruitSamurai({});
            let called = false;
            system.registerHook('samuraiDeleted', () => { called = true; });
            system.deleteSamurai(samurai.samuraiId);
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

        it('should execute default getSamurai', () => {
            const result = system.executeTool('getSamurai', { samuraiId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('samuraiRecruited', () => count++);
            unregister();
            system.recruitSamurai({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('samuraiRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSamurai({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSamurais = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSamurais = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSamurai({});
            const json = system.toJSON();
            expect(json.samurais.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSamurai({});
            const json = system.toJSON();
            const newSys = new CultivationSamurai();
            newSys.fromJSON(json);
            expect(newSys.samurais.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.samuraiCount).toBe(0);
        });
    });
});