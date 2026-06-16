/**
 * CultivationDharma.test.js - 修真法测试
 * V740 Iteration 3/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDharma } from '../../../systems/ai/CultivationDharma.js';

describe('CultivationDharma', () => {
    let system;
    beforeEach(() => { system = new CultivationDharma(); });

    describe('recruitDharma', () => {
        it('should recruit', () => {
            const { dharma } = system.recruitDharma({ masterId: 'm1', name: 'Righteous Path', type: 'righteous' });
            expect(dharma.masterId).toBe('m1');
            expect(dharma.name).toBe('Righteous Path');
            expect(dharma.type).toBe('righteous');
            expect(dharma.purity).toBe(20);
            expect(dharma.level).toBe(1);
            expect(dharma.status).toBe('novice');
            expect(dharma.teachings).toEqual([]);
        });

        it('should default to righteous type', () => {
            const { dharma } = system.recruitDharma({});
            expect(dharma.type).toBe('righteous');
        });

        it('should support secret and divine types', () => {
            const secret = system.recruitDharma({ type: 'secret' }).dharma;
            const divine = system.recruitDharma({ type: 'divine' }).dharma;
            expect(secret.type).toBe('secret');
            expect(divine.type).toBe('divine');
        });

        it('should generate id when not provided', () => {
            const { dharma } = system.recruitDharma({});
            expect(dharma.dharmaId).toBeTruthy();
            expect(dharma.dharmaId).toMatch(/^dhm_/);
        });

        it('should use provided dharmaId', () => {
            const { dharma } = system.recruitDharma({ dharmaId: 'custom_id' });
            expect(dharma.dharmaId).toBe('custom_id');
        });

        it('should trigger dharmaRecruited hook', () => {
            let called = false;
            system.registerHook('dharmaRecruited', () => { called = true; });
            system.recruitDharma({});
            expect(called).toBe(true);
        });
    });

    describe('getDharma', () => {
        it('should return', () => {
            const { dharma } = system.recruitDharma({});
            expect(system.getDharma(dharma.dharmaId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDharma('ghost')).toBeNull(); });
    });

    describe('listDharmas', () => {
        it('should list all', () => {
            system.recruitDharma({});
            system.recruitDharma({});
            expect(system.listDharmas().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listDharmas().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitDharma({ masterId: 'm1' });
            system.recruitDharma({ masterId: 'm2' });
            system.recruitDharma({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { dharma: d1 } = system.recruitDharma({});
            const { dharma: d2 } = system.recruitDharma({});
            system.legendDharma(d2.dharmaId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].dharmaId).toBe(d2.dharmaId);
        });

        it('should return empty when none legendary', () => {
            system.recruitDharma({});
            system.recruitDharma({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTeaching', () => {
        it('should add', () => {
            const { dharma } = system.recruitDharma({});
            system.addTeaching(dharma.dharmaId, 'Compassion');
            expect(dharma.teachings.length).toBe(1);
            expect(dharma.teachings[0]).toBe('Compassion');
        });

        it('should add multiple teachings', () => {
            const { dharma } = system.recruitDharma({});
            system.addTeaching(dharma.dharmaId, 'A');
            system.addTeaching(dharma.dharmaId, 'B');
            system.addTeaching(dharma.dharmaId, 'C');
            expect(dharma.teachings.length).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.addTeaching('ghost', 'Wisdom');
            expect(result.error).toBe('DHARMA_NOT_FOUND');
        });

        it('should trigger teachingAdded hook', () => {
            const { dharma } = system.recruitDharma({});
            let called = false;
            system.registerHook('teachingAdded', () => { called = true; });
            system.addTeaching(dharma.dharmaId, 'Lotus Sutra');
            expect(called).toBe(true);
        });
    });

    describe('raisePurity', () => {
        it('should raise with default amount', () => {
            const { dharma } = system.recruitDharma({});
            system.raisePurity(dharma.dharmaId);
            expect(dharma.purity).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { dharma } = system.recruitDharma({});
            system.raisePurity(dharma.dharmaId, 50);
            expect(dharma.purity).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.raisePurity('ghost', 10);
            expect(result.error).toBe('DHARMA_NOT_FOUND');
        });

        it('should trigger purityRaised hook', () => {
            const { dharma } = system.recruitDharma({});
            let captured = null;
            system.registerHook('purityRaised', (data) => { captured = data; });
            system.raisePurity(dharma.dharmaId, 10);
            expect(captured.amount).toBe(30);
        });
    });

    describe('levelUpDharma', () => {
        it('should level up', () => {
            const { dharma } = system.recruitDharma({});
            system.levelUpDharma(dharma.dharmaId);
            expect(dharma.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { dharma } = system.recruitDharma({});
            system.levelUpDharma(dharma.dharmaId);
            system.levelUpDharma(dharma.dharmaId);
            system.levelUpDharma(dharma.dharmaId);
            expect(dharma.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpDharma('ghost');
            expect(result.error).toBe('DHARMA_NOT_FOUND');
        });

        it('should trigger dharmaLeveledUp hook', () => {
            const { dharma } = system.recruitDharma({});
            let captured = null;
            system.registerHook('dharmaLeveledUp', (data) => { captured = data; });
            system.levelUpDharma(dharma.dharmaId);
            expect(captured.newLevel).toBe(2);
        });
    });

    describe('legendDharma', () => {
        it('should legendize', () => {
            const { dharma } = system.recruitDharma({});
            system.legendDharma(dharma.dharmaId);
            expect(dharma.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDharma('ghost');
            expect(result.error).toBe('DHARMA_NOT_FOUND');
        });

        it('should trigger dharmaLegendized hook', () => {
            const { dharma } = system.recruitDharma({});
            let called = false;
            system.registerHook('dharmaLegendized', () => { called = true; });
            system.legendDharma(dharma.dharmaId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDharmaValue', () => {
        it('should calculate base', () => {
            const { dharma } = system.recruitDharma({});
            // level 1 * 100 + purity 20 * 2 + teachings 0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateDharmaValue(dharma.dharmaId)).toBe(140);
        });

        it('should reflect teachings', () => {
            const { dharma } = system.recruitDharma({});
            system.addTeaching(dharma.dharmaId, 'A');
            system.addTeaching(dharma.dharmaId, 'B');
            // 100 + 40 + 60 = 200
            expect(system.calculateDharmaValue(dharma.dharmaId)).toBe(200);
        });

        it('should reflect level and purity', () => {
            const { dharma } = system.recruitDharma({});
            system.levelUpDharma(dharma.dharmaId);
            system.raisePurity(dharma.dharmaId, 30);
            // level 2 * 100 + purity 50 * 2 + teachings 0 * 30 = 200 + 100 + 0 = 300
            expect(system.calculateDharmaValue(dharma.dharmaId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDharmaValue('ghost')).toBe(0);
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

        it('should execute default getDharma', () => {
            const result = system.executeTool('getDharma', { dharmaId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitDharma', () => {
            const result = system.executeTool('recruitDharma', { name: 'Path' });
            expect(result.success).toBe(true);
        });

        it('should handle null context', () => {
            system.registerTool('echo', () => 'ok');
            const result = system.executeTool('echo', null);
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dharmaRecruited', () => count++);
            unregister();
            system.recruitDharma({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dharmaRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDharma({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDharmas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalDharmas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDharma({});
            const json = system.toJSON();
            expect(json.dharmas.length).toBe(1);
            expect(json.stats.totalDharmas).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDharma({});
            const json = system.toJSON();
            const newSys = new CultivationDharma();
            newSys.fromJSON(json);
            expect(newSys.dharmas.size).toBe(1);
            expect(newSys.stats.totalDharmas).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dharmaCount).toBe(0);
            expect(stats.totalDharmas).toBe(0);
        });
    });

    describe('Config', () => {
        it('should accept custom config', () => {
            const s = new CultivationDharma({ maxDharmas: 50, basePurity: 50 });
            expect(s.config.maxDharmas).toBe(50);
            expect(s.config.basePurity).toBe(50);
        });
    });
});
