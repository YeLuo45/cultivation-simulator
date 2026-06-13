/**
 * CultivationVision.test.js - 修真幻象系统测试
 * V769 Iteration 2/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationVision } from '../../../systems/ai/CultivationVision.js';

describe('CultivationVision', () => {
    let system;
    beforeEach(() => { system = new CultivationVision(); });

    describe('recruitVision', () => {
        it('should recruit', () => {
            const { vision } = system.recruitVision({ masterId: 'm1', name: 'Oracle' });
            expect(vision.masterId).toBe('m1');
            expect(vision.name).toBe('Oracle');
        });

        it('should default type to divine', () => {
            const { vision } = system.recruitVision({});
            expect(vision.type).toBe('divine');
        });

        it('should default clarity to baseClarity', () => {
            const { vision } = system.recruitVision({});
            expect(vision.clarity).toBe(20);
        });

        it('should default fragments to empty', () => {
            const { vision } = system.recruitVision({});
            expect(vision.fragments).toEqual([]);
        });

        it('should default level to 1 and status to novice', () => {
            const { vision } = system.recruitVision({});
            expect(vision.level).toBe(1);
            expect(vision.status).toBe('novice');
        });

        it('should accept custom visionId', () => {
            const { vision } = system.recruitVision({ visionId: 'my-vis' });
            expect(vision.visionId).toBe('my-vis');
        });

        it('should accept type/fragments overrides', () => {
            const { vision } = system.recruitVision({ type: 'true', fragments: [{ f: 1 }] });
            expect(vision.type).toBe('true');
            expect(vision.fragments.length).toBe(1);
        });

        it('should accept custom clarity', () => {
            const { vision } = system.recruitVision({ clarity: 77 });
            expect(vision.clarity).toBe(77);
        });

        it('should increment totalVisions stat', () => {
            system.recruitVision({});
            system.recruitVision({});
            expect(system.stats.totalVisions).toBe(2);
        });

        it('should return success true', () => {
            const result = system.recruitVision({});
            expect(result.success).toBe(true);
        });

        it('should trigger visionRecruited hook', () => {
            let called = false;
            system.registerHook('visionRecruited', () => { called = true; });
            system.recruitVision({});
            expect(called).toBe(true);
        });
    });

    describe('getVision', () => {
        it('should return', () => {
            const { vision } = system.recruitVision({});
            expect(system.getVision(vision.visionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVision('ghost')).toBeNull(); });
    });

    describe('listVisions', () => {
        it('should list all', () => {
            system.recruitVision({});
            system.recruitVision({});
            expect(system.listVisions().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listVisions()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitVision({ masterId: 'm1' });
            system.recruitVision({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitVision({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { vision: v1 } = system.recruitVision({});
            const { vision: v2 } = system.recruitVision({});
            system.legendVision(v1.visionId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitVision({});
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addFragment', () => {
        it('should add', () => {
            const { vision } = system.recruitVision({});
            system.addFragment(vision.visionId, { text: 'echo' });
            expect(vision.fragments.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addFragment('ghost', {});
            expect(result.error).toBe('VISION_NOT_FOUND');
        });

        it('should trigger fragmentAdded hook', () => {
            const { vision } = system.recruitVision({});
            let called = false;
            system.registerHook('fragmentAdded', () => { called = true; });
            system.addFragment(vision.visionId, {});
            expect(called).toBe(true);
        });
    });

    describe('raiseClarity', () => {
        it('should raise', () => {
            const { vision } = system.recruitVision({});
            system.raiseClarity(vision.visionId, 10);
            expect(vision.clarity).toBe(30);
        });

        it('should default amount to 5', () => {
            const { vision } = system.recruitVision({});
            system.raiseClarity(vision.visionId);
            expect(vision.clarity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseClarity('ghost', 10);
            expect(result.error).toBe('VISION_NOT_FOUND');
        });

        it('should trigger clarityRaised hook', () => {
            const { vision } = system.recruitVision({});
            let called = false;
            system.registerHook('clarityRaised', () => { called = true; });
            system.raiseClarity(vision.visionId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpVision', () => {
        it('should level up', () => {
            const { vision } = system.recruitVision({});
            system.levelUpVision(vision.visionId);
            expect(vision.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpVision('ghost');
            expect(result.error).toBe('VISION_NOT_FOUND');
        });

        it('should trigger visionLeveledUp hook', () => {
            const { vision } = system.recruitVision({});
            let called = false;
            system.registerHook('visionLeveledUp', () => { called = true; });
            system.levelUpVision(vision.visionId);
            expect(called).toBe(true);
        });
    });

    describe('legendVision', () => {
        it('should legendize', () => {
            const { vision } = system.recruitVision({});
            system.legendVision(vision.visionId);
            expect(vision.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendVision('ghost');
            expect(result.error).toBe('VISION_NOT_FOUND');
        });

        it('should trigger visionLegendized hook', () => {
            const { vision } = system.recruitVision({});
            let called = false;
            system.registerHook('visionLegendized', () => { called = true; });
            system.legendVision(vision.visionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVisionValue', () => {
        it('should calculate', () => {
            const { vision } = system.recruitVision({});
            system.addFragment(vision.visionId, { v: 1 });
            system.addFragment(vision.visionId, { v: 2 });
            // level 1 * 100 + clarity 20 * 2 + 2 fragments * 30 = 100 + 40 + 60 = 200
            expect(system.calculateVisionValue(vision.visionId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateVisionValue('ghost')).toBe(0);
        });

        it('should reflect level up', () => {
            const { vision } = system.recruitVision({});
            system.levelUpVision(vision.visionId);
            // level 2 * 100 + clarity 20 * 2 + 0 * 30 = 240
            expect(system.calculateVisionValue(vision.visionId)).toBe(240);
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

        it('should execute default getVision', () => {
            const result = system.executeTool('getVision', { visionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('visionRecruited', () => count++);
            unregister();
            system.recruitVision({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('visionRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitVision({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalVisions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalVisions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitVision({});
            const json = system.toJSON();
            expect(json.visions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitVision({});
            const json = system.toJSON();
            const newSys = new CultivationVision();
            newSys.fromJSON(json);
            expect(newSys.visions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.visionCount).toBe(0);
        });

        it('should reflect visionCount after recruits', () => {
            system.recruitVision({});
            system.recruitVision({});
            expect(system.getStats().visionCount).toBe(2);
        });
    });
});
