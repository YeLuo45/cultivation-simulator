/**
 * CultivationConfucian.test.js - 修真儒者测试
 * V639 Iteration 22/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationConfucian } from '../../../systems/ai/CultivationConfucian.js';

describe('CultivationConfucian', () => {
    let system;
    beforeEach(() => { system = new CultivationConfucian(); });

    describe('recruitConfucian', () => {
        it('should recruit', () => {
            const { confucian } = system.recruitConfucian({ masterId: 'm1' });
            expect(confucian.masterId).toBe('m1');
        });

        it('should default name', () => {
            const { confucian } = system.recruitConfucian({});
            expect(confucian.name).toBe('Unnamed Confucian');
        });

        it('should default type to literary', () => {
            const { confucian } = system.recruitConfucian({});
            expect(confucian.type).toBe('literary');
        });

        it('should default virtue to baseVirtue', () => {
            const { confucian } = system.recruitConfucian({});
            expect(confucian.virtue).toBe(20);
        });

        it('should default level to 1', () => {
            const { confucian } = system.recruitConfucian({});
            expect(confucian.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { confucian } = system.recruitConfucian({});
            expect(confucian.status).toBe('novice');
        });

        it('should accept custom type ritual', () => {
            const { confucian } = system.recruitConfucian({ type: 'ritual' });
            expect(confucian.type).toBe('ritual');
        });

        it('should accept custom type martial', () => {
            const { confucian } = system.recruitConfucian({ type: 'martial' });
            expect(confucian.type).toBe('martial');
        });

        it('should accept custom name', () => {
            const { confucian } = system.recruitConfucian({ name: 'Master Kong' });
            expect(confucian.name).toBe('Master Kong');
        });

        it('should accept custom virtue', () => {
            const { confucian } = system.recruitConfucian({ virtue: 50 });
            expect(confucian.virtue).toBe(50);
        });

        it('should start with empty classics', () => {
            const { confucian } = system.recruitConfucian({});
            expect(confucian.classics).toEqual([]);
        });

        it('should trigger confucianRecruited hook', () => {
            let called = false;
            system.registerHook('confucianRecruited', () => { called = true; });
            system.recruitConfucian({});
            expect(called).toBe(true);
        });
    });

    describe('getConfucian', () => {
        it('should return', () => {
            const { confucian } = system.recruitConfucian({});
            expect(system.getConfucian(confucian.confucianId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getConfucian('ghost')).toBeNull(); });
    });

    describe('listConfucians', () => {
        it('should list all', () => {
            system.recruitConfucian({});
            system.recruitConfucian({});
            expect(system.listConfucians().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listConfucians().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitConfucian({ masterId: 'm1' });
            system.recruitConfucian({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return multiple for same master', () => {
            system.recruitConfucian({ masterId: 'm1' });
            system.recruitConfucian({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { confucian } = system.recruitConfucian({});
            system.recruitConfucian({});
            system.legendConfucian(confucian.confucianId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitConfucian({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addClassic', () => {
        it('should add classic', () => {
            const { confucian } = system.recruitConfucian({});
            system.addClassic(confucian.confucianId, 'Analects');
            expect(confucian.classics).toContain('Analects');
        });

        it('should add multiple classics', () => {
            const { confucian } = system.recruitConfucian({});
            system.addClassic(confucian.confucianId, 'Analects');
            system.addClassic(confucian.confucianId, 'Mencius');
            expect(confucian.classics.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addClassic('ghost', 'Analects');
            expect(result.error).toBe('CONFUCIAN_NOT_FOUND');
        });

        it('should trigger classicAdded hook', () => {
            const { confucian } = system.recruitConfucian({});
            let called = false;
            system.registerHook('classicAdded', () => { called = true; });
            system.addClassic(confucian.confucianId, 'Analects');
            expect(called).toBe(true);
        });
    });

    describe('buildVirtue', () => {
        it('should build virtue', () => {
            const { confucian } = system.recruitConfucian({});
            system.buildVirtue(confucian.confucianId, 10);
            expect(confucian.virtue).toBe(30);
        });

        it('should default amount to 5', () => {
            const { confucian } = system.recruitConfucian({});
            system.buildVirtue(confucian.confucianId);
            expect(confucian.virtue).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.buildVirtue('ghost', 5);
            expect(result.error).toBe('CONFUCIAN_NOT_FOUND');
        });

        it('should trigger virtueBuilt hook', () => {
            const { confucian } = system.recruitConfucian({});
            let called = false;
            system.registerHook('virtueBuilt', () => { called = true; });
            system.buildVirtue(confucian.confucianId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpConfucian', () => {
        it('should level up', () => {
            const { confucian } = system.recruitConfucian({});
            system.levelUpConfucian(confucian.confucianId);
            expect(confucian.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { confucian } = system.recruitConfucian({});
            system.levelUpConfucian(confucian.confucianId);
            system.levelUpConfucian(confucian.confucianId);
            system.levelUpConfucian(confucian.confucianId);
            expect(confucian.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpConfucian('ghost');
            expect(result.error).toBe('CONFUCIAN_NOT_FOUND');
        });
    });

    describe('legendConfucian', () => {
        it('should legendize', () => {
            const { confucian } = system.recruitConfucian({});
            system.legendConfucian(confucian.confucianId);
            expect(confucian.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendConfucian('ghost');
            expect(result.error).toBe('CONFUCIAN_NOT_FOUND');
        });

        it('should trigger confucianLegendized hook', () => {
            const { confucian } = system.recruitConfucian({});
            let called = false;
            system.registerHook('confucianLegendized', () => { called = true; });
            system.legendConfucian(confucian.confucianId);
            expect(called).toBe(true);
        });
    });

    describe('calculateConfucianValue', () => {
        it('should calculate with default values', () => {
            const { confucian } = system.recruitConfucian({});
            // level=1, virtue=20, classics=[] => 1*100 + 20*2 + 0 = 140
            expect(system.calculateConfucianValue(confucian.confucianId)).toBe(140);
        });

        it('should calculate with level up', () => {
            const { confucian } = system.recruitConfucian({});
            system.levelUpConfucian(confucian.confucianId);
            // level=2, virtue=20, classics=[] => 2*100 + 20*2 + 0 = 240
            expect(system.calculateConfucianValue(confucian.confucianId)).toBe(240);
        });

        it('should calculate with virtue built', () => {
            const { confucian } = system.recruitConfucian({});
            system.buildVirtue(confucian.confucianId, 10);
            // level=1, virtue=30, classics=[] => 1*100 + 30*2 + 0 = 160
            expect(system.calculateConfucianValue(confucian.confucianId)).toBe(160);
        });

        it('should calculate with classics', () => {
            const { confucian } = system.recruitConfucian({});
            system.addClassic(confucian.confucianId, 'Analects');
            system.addClassic(confucian.confucianId, 'Mencius');
            // level=1, virtue=20, classics=2 => 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateConfucianValue(confucian.confucianId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateConfucianValue('ghost')).toBe(0);
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

        it('should execute default getConfucian', () => {
            const result = system.executeTool('getConfucian', { confucianId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitConfucian', () => {
            const result = system.executeTool('recruitConfucian', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('confucianRecruited', () => count++);
            unregister();
            system.recruitConfucian({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('confucianRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitConfucian({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalConfucians = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalConfucians = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitConfucian({});
            const json = system.toJSON();
            expect(json.confucians.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitConfucian({});
            const json = system.toJSON();
            const newSys = new CultivationConfucian();
            newSys.fromJSON(json);
            expect(newSys.confucians.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.confucianCount).toBe(0);
        });
    });
});
