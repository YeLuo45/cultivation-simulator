/**
 * CultivationSeer.test.js - 修真先知系统测试
 * V649 Iteration 2/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSeer } from '../../../systems/ai/CultivationSeer.js';

describe('CultivationSeer', () => {
    let system;
    beforeEach(() => { system = new CultivationSeer(); });

    describe('recruitSeer', () => {
        it('should recruit', () => {
            const { seer } = system.recruitSeer({ mentorId: 'm1', name: 'Sage' });
            expect(seer.mentorId).toBe('m1');
            expect(seer.name).toBe('Sage');
        });

        it('should default type to present', () => {
            const { seer } = system.recruitSeer({});
            expect(seer.type).toBe('present');
        });

        it('should trigger seerRecruited hook', () => {
            let called = false;
            system.registerHook('seerRecruited', () => { called = true; });
            system.recruitSeer({});
            expect(called).toBe(true);
        });
    });

    describe('getSeer', () => {
        it('should return', () => {
            const { seer } = system.recruitSeer({});
            expect(system.getSeer(seer.seerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSeer('ghost')).toBeNull(); });
    });

    describe('listSeers', () => {
        it('should list all', () => {
            system.recruitSeer({});
            system.recruitSeer({});
            expect(system.listSeers().length).toBe(2);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitSeer({ mentorId: 'm1' });
            system.recruitSeer({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { seer: s1 } = system.recruitSeer({});
            const { seer: s2 } = system.recruitSeer({});
            system.legendSeer(s1.seerId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addVision', () => {
        it('should add', () => {
            const { seer } = system.recruitSeer({});
            system.addVision(seer.seerId, { title: 'Future Glimpse' });
            expect(seer.visions.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addVision('ghost', {});
            expect(result.error).toBe('SEER_NOT_FOUND');
        });

        it('should trigger visionAdded hook', () => {
            const { seer } = system.recruitSeer({});
            let called = false;
            system.registerHook('visionAdded', () => { called = true; });
            system.addVision(seer.seerId, {});
            expect(called).toBe(true);
        });
    });

    describe('sharpenForesight', () => {
        it('should sharpen', () => {
            const { seer } = system.recruitSeer({});
            system.sharpenForesight(seer.seerId, 10);
            expect(seer.foresight).toBe(30);
        });

        it('should default amount to 5', () => {
            const { seer } = system.recruitSeer({});
            system.sharpenForesight(seer.seerId);
            expect(seer.foresight).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.sharpenForesight('ghost', 10);
            expect(result.error).toBe('SEER_NOT_FOUND');
        });

        it('should trigger foresightSharpened hook', () => {
            const { seer } = system.recruitSeer({});
            let called = false;
            system.registerHook('foresightSharpened', () => { called = true; });
            system.sharpenForesight(seer.seerId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSeer', () => {
        it('should level up', () => {
            const { seer } = system.recruitSeer({});
            system.levelUpSeer(seer.seerId);
            expect(seer.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSeer('ghost');
            expect(result.error).toBe('SEER_NOT_FOUND');
        });

        it('should trigger seerLeveledUp hook', () => {
            const { seer } = system.recruitSeer({});
            let called = false;
            system.registerHook('seerLeveledUp', () => { called = true; });
            system.levelUpSeer(seer.seerId);
            expect(called).toBe(true);
        });
    });

    describe('legendSeer', () => {
        it('should legendize', () => {
            const { seer } = system.recruitSeer({});
            system.legendSeer(seer.seerId);
            expect(seer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSeer('ghost');
            expect(result.error).toBe('SEER_NOT_FOUND');
        });

        it('should trigger seerLegendized hook', () => {
            const { seer } = system.recruitSeer({});
            let called = false;
            system.registerHook('seerLegendized', () => { called = true; });
            system.legendSeer(seer.seerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSeerValue', () => {
        it('should calculate', () => {
            const { seer } = system.recruitSeer({});
            system.addVision(seer.seerId, { v: 1 });
            system.addVision(seer.seerId, { v: 2 });
            // level 1 * 100 + foresight 20 * 2 + 2 visions * 30 = 100 + 40 + 60 = 200
            expect(system.calculateSeerValue(seer.seerId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSeerValue('ghost')).toBe(0);
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

        it('should execute default getSeer', () => {
            const result = system.executeTool('getSeer', { seerId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('seerRecruited', () => count++);
            unregister();
            system.recruitSeer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('seerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSeer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSeers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSeers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSeer({});
            const json = system.toJSON();
            expect(json.seers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSeer({});
            const json = system.toJSON();
            const newSys = new CultivationSeer();
            newSys.fromJSON(json);
            expect(newSys.seers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.seerCount).toBe(0);
        });
    });
});
