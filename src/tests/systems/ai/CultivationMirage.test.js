/**
 * CultivationMirage.test.js - 修真海市蜃楼系统测试
 * V770 Iteration 3/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMirage } from '../../../systems/ai/CultivationMirage.js';

describe('CultivationMirage', () => {
    let system;
    beforeEach(() => { system = new CultivationMirage(); });

    describe('recruitMirage', () => {
        it('should recruit with given fields', () => {
            const { mirage } = system.recruitMirage({ masterId: 'm1', name: 'Dune Mirage', type: 'desert' });
            expect(mirage.masterId).toBe('m1');
            expect(mirage.name).toBe('Dune Mirage');
            expect(mirage.type).toBe('desert');
        });

        it('should default type to desert and depth to 20', () => {
            const { mirage } = system.recruitMirage({ masterId: 'm1' });
            expect(mirage.type).toBe('desert');
            expect(mirage.depth).toBe(20);
            expect(mirage.level).toBe(1);
            expect(mirage.status).toBe('novice');
            expect(mirage.illusions).toEqual([]);
        });

        it('should generate a mirageId when not provided', () => {
            const { mirage } = system.recruitMirage({});
            expect(mirage.mirageId).toBeTruthy();
            expect(typeof mirage.mirageId).toBe('string');
        });

        it('should trigger mirageRecruited hook', () => {
            let called = false;
            system.registerHook('mirageRecruited', () => { called = true; });
            system.recruitMirage({});
            expect(called).toBe(true);
        });
    });

    describe('getMirage', () => {
        it('should return mirage copy', () => {
            const { mirage } = system.recruitMirage({});
            const found = system.getMirage(mirage.mirageId);
            expect(found).not.toBeNull();
            expect(found.mirageId).toBe(mirage.mirageId);
        });
        it('should return null for missing', () => { expect(system.getMirage('ghost')).toBeNull(); });
    });

    describe('listMirages', () => {
        it('should list all mirages', () => {
            system.recruitMirage({});
            system.recruitMirage({});
            system.recruitMirage({});
            expect(system.listMirages().length).toBe(3);
        });

        it('should return empty list when no mirages', () => {
            expect(system.listMirages().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitMirage({ masterId: 'm1' });
            system.recruitMirage({ masterId: 'm2' });
            system.recruitMirage({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary mirages', () => {
            const { mirage: a } = system.recruitMirage({});
            const { mirage: b } = system.recruitMirage({});
            system.legendMirage(a.mirageId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].mirageId).toBe(a.mirageId);
            expect(b.status).toBe('novice');
        });

        it('should return empty list when no legendary', () => {
            system.recruitMirage({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addIllusion', () => {
        it('should add an illusion to mirage', () => {
            const { mirage } = system.recruitMirage({});
            const result = system.addIllusion(mirage.mirageId, 'palm_oasis');
            expect(result.success).toBe(true);
            expect(mirage.illusions).toContain('palm_oasis');
        });

        it('should add multiple illusions', () => {
            const { mirage } = system.recruitMirage({});
            system.addIllusion(mirage.mirageId, 'oasis');
            system.addIllusion(mirage.mirageId, 'caravan');
            expect(mirage.illusions.length).toBe(2);
        });

        it('should reject missing mirage', () => {
            const result = system.addIllusion('ghost', 'oasis');
            expect(result.error).toBe('MIRAGE_NOT_FOUND');
        });

        it('should trigger illusionAdded hook', () => {
            const { mirage } = system.recruitMirage({});
            let called = false;
            system.registerHook('illusionAdded', () => { called = true; });
            system.addIllusion(mirage.mirageId, 'oasis');
            expect(called).toBe(true);
        });
    });

    describe('raiseDepth', () => {
        it('should raise depth by default 5', () => {
            const { mirage } = system.recruitMirage({});
            system.raiseDepth(mirage.mirageId);
            expect(mirage.depth).toBe(25);
        });

        it('should raise depth by custom amount', () => {
            const { mirage } = system.recruitMirage({});
            system.raiseDepth(mirage.mirageId, 30);
            expect(mirage.depth).toBe(50);
        });

        it('should reject missing mirage', () => {
            const result = system.raiseDepth('ghost', 10);
            expect(result.error).toBe('MIRAGE_NOT_FOUND');
        });

        it('should trigger depthRaised hook', () => {
            const { mirage } = system.recruitMirage({});
            let called = false;
            system.registerHook('depthRaised', () => { called = true; });
            system.raiseDepth(mirage.mirageId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMirage', () => {
        it('should increase level by 1', () => {
            const { mirage } = system.recruitMirage({});
            system.levelUpMirage(mirage.mirageId);
            expect(mirage.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { mirage } = system.recruitMirage({});
            system.levelUpMirage(mirage.mirageId);
            system.levelUpMirage(mirage.mirageId);
            system.levelUpMirage(mirage.mirageId);
            expect(mirage.level).toBe(4);
        });

        it('should reject missing mirage', () => {
            const result = system.levelUpMirage('ghost');
            expect(result.error).toBe('MIRAGE_NOT_FOUND');
        });

        it('should trigger mirageLeveledUp hook', () => {
            const { mirage } = system.recruitMirage({});
            let called = false;
            system.registerHook('mirageLeveledUp', () => { called = true; });
            system.levelUpMirage(mirage.mirageId);
            expect(called).toBe(true);
        });
    });

    describe('legendMirage', () => {
        it('should set status to legendary', () => {
            const { mirage } = system.recruitMirage({});
            system.legendMirage(mirage.mirageId);
            expect(mirage.status).toBe('legendary');
        });

        it('should reject missing mirage', () => {
            const result = system.legendMirage('ghost');
            expect(result.error).toBe('MIRAGE_NOT_FOUND');
        });

        it('should trigger mirageLegendized hook', () => {
            const { mirage } = system.recruitMirage({});
            let called = false;
            system.registerHook('mirageLegendized', () => { called = true; });
            system.legendMirage(mirage.mirageId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMirageValue', () => {
        it('should calculate value with default stats', () => {
            const { mirage } = system.recruitMirage({});
            // level=1 * 100 + depth=20 * 2 + illusions=0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateMirageValue(mirage.mirageId)).toBe(140);
        });

        it('should calculate value with illusions and leveled up', () => {
            const { mirage } = system.recruitMirage({});
            system.levelUpMirage(mirage.mirageId);
            system.levelUpMirage(mirage.mirageId);
            system.addIllusion(mirage.mirageId, 'oasis');
            system.addIllusion(mirage.mirageId, 'caravan');
            // level=3 * 100 + depth=20 * 2 + illusions=2 * 30 = 300 + 40 + 60 = 400
            expect(system.calculateMirageValue(mirage.mirageId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMirageValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register and list tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute custom tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should execute default getMirage tool', () => {
            const { mirage } = system.recruitMirage({});
            const result = system.executeTool('getMirage', { mirageId: mirage.mirageId });
            expect(result.success).toBe(true);
            expect(result.result.mirageId).toBe(mirage.mirageId);
        });

        it('should execute default recruitMirage tool', () => {
            const result = system.executeTool('recruitMirage', { masterId: 'm1', name: 'X', type: 'ocean' });
            expect(result.success).toBe(true);
            expect(result.result.mirage.masterId).toBe('m1');
        });

        it('should handle null context', () => {
            system.registerTool('ctxTest', (ctx) => ctx);
            const result = system.executeTool('ctxTest');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mirageRecruited', () => count++);
            unregister();
            system.recruitMirage({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('mirageRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMirage({})).not.toThrow();
        });

        it('should handle unregister for missing event', () => {
            const unregister = system.registerHook('nonexistent', () => {});
            unregister();
            expect(true).toBe(true);
        });

        it('should handle double unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mirageRecruited', () => count++);
            unregister();
            unregister();
            system.recruitMirage({});
            expect(count).toBe(0);
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient mirages', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalMirages = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxMirages).toBe(40);
        });
        it('should not double evolve', () => {
            system.stats.totalMirages = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitMirage({});
            system.recruitMirage({});
            const json = system.toJSON();
            expect(json.mirages.length).toBe(2);
            expect(json.stats.totalMirages).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitMirage({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationMirage();
            newSys.fromJSON(json);
            expect(newSys.mirages.size).toBe(1);
            expect(newSys.stats.totalMirages).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitMirage({});
            const stats = system.getStats();
            expect(stats.mirageCount).toBe(1);
            expect(stats.totalMirages).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });

    describe('Constructor', () => {
        it('should accept custom config', () => {
            const custom = new CultivationMirage({ maxMirages: 50, baseDepth: 30 });
            expect(custom.config.maxMirages).toBe(50);
            expect(custom.config.baseDepth).toBe(30);
        });
    });
});
