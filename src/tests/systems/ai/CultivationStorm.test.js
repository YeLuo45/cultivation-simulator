/**
 * CultivationStorm.test.js - 修真暴系统测试
 * V808 Iteration 11/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationStorm } from '../../../systems/ai/CultivationStorm.js';

describe('CultivationStorm', () => {
    let system;
    beforeEach(() => { system = new CultivationStorm(); });

    describe('recruitStorm', () => {
        it('should recruit', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1', name: 'Thunder Storm' });
            expect(storm.masterId).toBe('m1');
            expect(storm.name).toBe('Thunder Storm');
        });

        it('should use default name', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            expect(storm.name).toBe('Unnamed Storm');
        });

        it('should use base intensity default', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            expect(storm.intensity).toBe(20);
        });

        it('should accept custom type', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1', type: 'cosmic' });
            expect(storm.type).toBe('cosmic');
        });

        it('should default status to novice', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            expect(storm.status).toBe('novice');
        });

        it('should trigger stormRecruited hook', () => {
            let called = false;
            system.registerHook('stormRecruited', () => { called = true; });
            system.recruitStorm({});
            expect(called).toBe(true);
        });
    });

    describe('getStorm', () => {
        it('should return storm', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            expect(system.getStorm(storm.stormId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStorm('ghost')).toBeNull(); });
    });

    describe('listStorms', () => {
        it('should list all', () => {
            system.recruitStorm({ masterId: 'm1' });
            system.recruitStorm({ masterId: 'm2' });
            expect(system.listStorms().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitStorm({ masterId: 'm1' });
            system.recruitStorm({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitStorm({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            system.legendStorm(storm.stormId);
            system.recruitStorm({ masterId: 'm2' });
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitStorm({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStrike', () => {
        it('should add strike', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            system.addStrike(storm.stormId, { power: 100 });
            expect(storm.strikes.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addStrike('ghost', { power: 100 });
            expect(result.error).toBe('STORM_NOT_FOUND');
        });

        it('should trigger strikeAdded hook', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            let called = false;
            system.registerHook('strikeAdded', () => { called = true; });
            system.addStrike(storm.stormId, { power: 100 });
            expect(called).toBe(true);
        });
    });

    describe('raiseIntensity', () => {
        it('should raise by default amount', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            system.raiseIntensity(storm.stormId);
            expect(storm.intensity).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            system.raiseIntensity(storm.stormId, 15);
            expect(storm.intensity).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.raiseIntensity('ghost', 5);
            expect(result.error).toBe('STORM_NOT_FOUND');
        });

        it('should trigger intensityRaised hook', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            let called = false;
            system.registerHook('intensityRaised', () => { called = true; });
            system.raiseIntensity(storm.stormId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpStorm', () => {
        it('should level up', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            system.levelUpStorm(storm.stormId);
            expect(storm.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpStorm('ghost');
            expect(result.error).toBe('STORM_NOT_FOUND');
        });

        it('should trigger stormLeveledUp hook', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            let called = false;
            system.registerHook('stormLeveledUp', () => { called = true; });
            system.levelUpStorm(storm.stormId);
            expect(called).toBe(true);
        });
    });

    describe('legendStorm', () => {
        it('should mark as legendary', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            system.legendStorm(storm.stormId);
            expect(storm.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendStorm('ghost');
            expect(result.error).toBe('STORM_NOT_FOUND');
        });

        it('should trigger stormLegendized hook', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            let called = false;
            system.registerHook('stormLegendized', () => { called = true; });
            system.legendStorm(storm.stormId);
            expect(called).toBe(true);
        });
    });

    describe('calculateStormValue', () => {
        it('should calculate', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            // level=1*100 + intensity=20*2 + strikes=0*30 = 100+40+0 = 140
            expect(system.calculateStormValue(storm.stormId)).toBe(140);
        });

        it('should account for strikes', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            system.addStrike(storm.stormId, { power: 50 });
            system.addStrike(storm.stormId, { power: 60 });
            // 100 + 40 + 60 = 200
            expect(system.calculateStormValue(storm.stormId)).toBe(200);
        });

        it('should account for level', () => {
            const { storm } = system.recruitStorm({ masterId: 'm1' });
            system.levelUpStorm(storm.stormId);
            // 200 + 40 + 0 = 240
            expect(system.calculateStormValue(storm.stormId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateStormValue('ghost')).toBe(0);
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

        it('should execute default getStorm', () => {
            const result = system.executeTool('getStorm', { stormId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('stormRecruited', () => count++);
            unregister();
            system.recruitStorm({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('stormRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitStorm({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalStorms = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStorms = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitStorm({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.storms.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitStorm({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationStorm();
            newSys.fromJSON(json);
            expect(newSys.storms.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.stormCount).toBe(0);
        });
    });
});
