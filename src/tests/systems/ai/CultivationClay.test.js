/**
 * CultivationClay.test.js - 修真黏土系统测试
 * V844 Iteration 17/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationClay } from '../../../systems/ai/CultivationClay.js';

describe('CultivationClay', () => {
    let system;
    beforeEach(() => { system = new CultivationClay(); });

    describe('recruitClay', () => {
        it('should recruit with defaults', () => {
            const { clay } = system.recruitClay({});
            expect(clay.masterId).toBe('unknown_master');
            expect(clay.name).toBe('unnamed_clay');
            expect(clay.type).toBe('earthen');
            expect(clay.plasticity).toBe(20);
            expect(clay.vessels).toEqual([]);
            expect(clay.level).toBe(1);
            expect(clay.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { clay } = system.recruitClay({
                masterId: 'm1',
                name: 'CelestialClay',
                type: 'divine',
                plasticity: 80,
                vessels: ['teapot'],
                level: 3,
                status: 'veteran'
            });
            expect(clay.masterId).toBe('m1');
            expect(clay.name).toBe('CelestialClay');
            expect(clay.type).toBe('divine');
            expect(clay.plasticity).toBe(80);
            expect(clay.vessels).toEqual(['teapot']);
            expect(clay.level).toBe(3);
            expect(clay.status).toBe('veteran');
        });

        it('should accept porcelain type', () => {
            const { clay } = system.recruitClay({ type: 'porcelain' });
            expect(clay.type).toBe('porcelain');
        });

        it('should increment totalClays', () => {
            system.recruitClay({});
            system.recruitClay({});
            expect(system.stats.totalClays).toBe(2);
        });

        it('should trigger clayRecruited hook', () => {
            let called = false;
            system.registerHook('clayRecruited', () => { called = true; });
            system.recruitClay({});
            expect(called).toBe(true);
        });
    });

    describe('getClay', () => {
        it('should return clay', () => {
            const { clay } = system.recruitClay({});
            const got = system.getClay(clay.clayId);
            expect(got).not.toBeNull();
            expect(got.clayId).toBe(clay.clayId);
        });
        it('should return null for missing', () => { expect(system.getClay('ghost')).toBeNull(); });
    });

    describe('listClays', () => {
        it('should list all', () => {
            system.recruitClay({});
            system.recruitClay({});
            system.recruitClay({});
            expect(system.listClays().length).toBe(3);
        });

        it('should return empty list when no clays', () => {
            expect(system.listClays().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitClay({ masterId: 'm1' });
            system.recruitClay({ masterId: 'm1' });
            system.recruitClay({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary clays', () => {
            const { clay: c1 } = system.recruitClay({});
            const { clay: c2 } = system.recruitClay({});
            system.legendClay(c1.clayId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].clayId).toBe(c1.clayId);
        });

        it('should return empty when none legendary', () => {
            system.recruitClay({});
            system.recruitClay({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addVessel', () => {
        it('should add vessel', () => {
            const { clay } = system.recruitClay({});
            system.addVessel(clay.clayId, 'teapot');
            expect(clay.vessels).toContain('teapot');
            expect(clay.vessels.length).toBe(1);
        });

        it('should add multiple vessels', () => {
            const { clay } = system.recruitClay({});
            system.addVessel(clay.clayId, 'teapot');
            system.addVessel(clay.clayId, 'bowl');
            expect(clay.vessels).toEqual(['teapot', 'bowl']);
        });

        it('should set status to veteran when 5+ vessels', () => {
            const { clay } = system.recruitClay({});
            system.addVessel(clay.clayId, 'a');
            system.addVessel(clay.clayId, 'b');
            system.addVessel(clay.clayId, 'c');
            system.addVessel(clay.clayId, 'd');
            expect(clay.status).toBe('novice');
            system.addVessel(clay.clayId, 'e');
            expect(clay.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addVessel('ghost', 'teapot');
            expect(result.error).toBe('CLAY_NOT_FOUND');
        });

        it('should trigger vesselAdded hook', () => {
            const { clay } = system.recruitClay({});
            let called = false;
            system.registerHook('vesselAdded', () => { called = true; });
            system.addVessel(clay.clayId, 'teapot');
            expect(called).toBe(true);
        });
    });

    describe('raisePlasticity', () => {
        it('should raise by default amount', () => {
            const { clay } = system.recruitClay({});
            system.raisePlasticity(clay.clayId);
            expect(clay.plasticity).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { clay } = system.recruitClay({});
            system.raisePlasticity(clay.clayId, 30);
            expect(clay.plasticity).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raisePlasticity('ghost', 5);
            expect(result.error).toBe('CLAY_NOT_FOUND');
        });

        it('should trigger plasticityRaised hook', () => {
            const { clay } = system.recruitClay({});
            let called = false;
            system.registerHook('plasticityRaised', () => { called = true; });
            system.raisePlasticity(clay.clayId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpClay', () => {
        it('should level up', () => {
            const { clay } = system.recruitClay({});
            system.levelUpClay(clay.clayId);
            expect(clay.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { clay } = system.recruitClay({});
            system.levelUpClay(clay.clayId);
            system.levelUpClay(clay.clayId);
            expect(clay.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpClay('ghost');
            expect(result.error).toBe('CLAY_NOT_FOUND');
        });

        it('should trigger clayLeveledUp hook', () => {
            const { clay } = system.recruitClay({});
            let called = false;
            system.registerHook('clayLeveledUp', () => { called = true; });
            system.levelUpClay(clay.clayId);
            expect(called).toBe(true);
        });
    });

    describe('legendClay', () => {
        it('should set status to legendary', () => {
            const { clay } = system.recruitClay({});
            system.legendClay(clay.clayId);
            expect(clay.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendClay('ghost');
            expect(result.error).toBe('CLAY_NOT_FOUND');
        });

        it('should trigger clayLegendized hook', () => {
            const { clay } = system.recruitClay({});
            let called = false;
            system.registerHook('clayLegendized', () => { called = true; });
            system.legendClay(clay.clayId);
            expect(called).toBe(true);
        });
    });

    describe('calculateClayValue', () => {
        it('should calculate default value', () => {
            const { clay } = system.recruitClay({});
            // level=1 * 100 + plasticity=20 * 2 + 0 * 30 = 140
            expect(system.calculateClayValue(clay.clayId)).toBe(140);
        });

        it('should add 30 per vessel', () => {
            const { clay } = system.recruitClay({});
            system.addVessel(clay.clayId, 'teapot');
            system.addVessel(clay.clayId, 'bowl');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateClayValue(clay.clayId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { clay } = system.recruitClay({});
            system.levelUpClay(clay.clayId);
            system.levelUpClay(clay.clayId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateClayValue(clay.clayId)).toBe(340);
        });

        it('should reflect plasticity in formula', () => {
            const { clay } = system.recruitClay({});
            system.raisePlasticity(clay.clayId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateClayValue(clay.clayId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateClayValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getClay', () => {
            const result = system.executeTool('getClay', { clayId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('clayRecruited', () => count++);
            unregister();
            system.recruitClay({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('clayRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitClay({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalClays = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalClays = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitClay({});
            const json = system.toJSON();
            expect(json.clays.length).toBe(1);
            expect(json.stats.totalClays).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitClay({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationClay();
            newSys.fromJSON(json);
            expect(newSys.clays.size).toBe(1);
            expect(newSys.stats.totalClays).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.clayCount).toBe(0);
            expect(stats.totalClays).toBe(0);
            system.recruitClay({});
            expect(system.getStats().clayCount).toBe(1);
        });
    });
});
