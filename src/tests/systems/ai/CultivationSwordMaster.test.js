/**
 * CultivationSwordMaster.test.js - 修真剑圣测试
 * V633 Iteration 16/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSwordMaster } from '../../../systems/ai/CultivationSwordMaster.js';

describe('CultivationSwordMaster', () => {
    let system;
    beforeEach(() => { system = new CultivationSwordMaster(); });

    describe('recruitSwordMaster', () => {
        it('should recruit', () => {
            const { master } = system.recruitSwordMaster({ name: 'LiXiao', mentorId: 'm1' });
            expect(master.name).toBe('LiXiao');
            expect(master.mentorId).toBe('m1');
        });

        it('should set default values', () => {
            const { master } = system.recruitSwordMaster({});
            expect(master.type).toBe('dual');
            expect(master.swordAura).toBe(20);
            expect(master.level).toBe(1);
            expect(master.status).toBe('novice');
            expect(master.swords).toEqual([]);
        });

        it('should accept custom type and swords', () => {
            const { master } = system.recruitSwordMaster({ type: 'heavenly', swords: ['s1', 's2'] });
            expect(master.type).toBe('heavenly');
            expect(master.swords.length).toBe(2);
        });

        it('should trigger swordMasterRecruited hook', () => {
            let called = false;
            system.registerHook('swordMasterRecruited', () => { called = true; });
            system.recruitSwordMaster({});
            expect(called).toBe(true);
        });
    });

    describe('getSwordMaster', () => {
        it('should return', () => {
            const { master } = system.recruitSwordMaster({});
            expect(system.getSwordMaster(master.masterId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSwordMaster('ghost')).toBeNull(); });
    });

    describe('listSwordMasters', () => {
        it('should list all', () => {
            system.recruitSwordMaster({});
            system.recruitSwordMaster({});
            expect(system.listSwordMasters().length).toBe(2);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitSwordMaster({ mentorId: 'm1' });
            system.recruitSwordMaster({ mentorId: 'm2' });
            system.recruitSwordMaster({ mentorId: 'm1' });
            expect(system.listByMentor('m1').length).toBe(2);
        });

        it('should return empty for unknown mentor', () => {
            system.recruitSwordMaster({ mentorId: 'm1' });
            expect(system.listByMentor('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter only legendary', () => {
            const { master: m1 } = system.recruitSwordMaster({});
            const { master: m2 } = system.recruitSwordMaster({});
            system.legendSwordMaster(m1.masterId);
            const result = system.listLegendary();
            expect(result.length).toBe(1);
            expect(result[0].masterId).toBe(m1.masterId);
        });
    });

    describe('addSword', () => {
        it('should add a sword', () => {
            const { master } = system.recruitSwordMaster({});
            system.addSword(master.masterId, 'jian-zhanba');
            expect(master.swords.length).toBe(1);
            expect(master.swords[0]).toBe('jian-zhanba');
        });

        it('should add multiple swords', () => {
            const { master } = system.recruitSwordMaster({});
            system.addSword(master.masterId, 's1');
            system.addSword(master.masterId, 's2');
            expect(master.swords.length).toBe(2);
        });

        it('should reject missing master', () => {
            const result = system.addSword('ghost', 's1');
            expect(result.error).toBe('SWORDMASTER_NOT_FOUND');
        });

        it('should trigger swordAdded hook', () => {
            const { master } = system.recruitSwordMaster({});
            let called = false;
            system.registerHook('swordAdded', () => { called = true; });
            system.addSword(master.masterId, 's1');
            expect(called).toBe(true);
        });
    });

    describe('intensifyAura', () => {
        it('should intensify by default amount', () => {
            const { master } = system.recruitSwordMaster({});
            system.intensifyAura(master.masterId);
            expect(master.swordAura).toBe(25);
        });

        it('should intensify by custom amount', () => {
            const { master } = system.recruitSwordMaster({});
            system.intensifyAura(master.masterId, 50);
            expect(master.swordAura).toBe(70);
        });

        it('should reject missing master', () => {
            const result = system.intensifyAura('ghost', 5);
            expect(result.error).toBe('SWORDMASTER_NOT_FOUND');
        });

        it('should trigger auraIntensified hook', () => {
            const { master } = system.recruitSwordMaster({});
            let called = false;
            system.registerHook('auraIntensified', () => { called = true; });
            system.intensifyAura(master.masterId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSwordMaster', () => {
        it('should level up', () => {
            const { master } = system.recruitSwordMaster({});
            system.levelUpSwordMaster(master.masterId);
            expect(master.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { master } = system.recruitSwordMaster({});
            system.levelUpSwordMaster(master.masterId);
            system.levelUpSwordMaster(master.masterId);
            system.levelUpSwordMaster(master.masterId);
            expect(master.level).toBe(4);
        });

        it('should reject missing master', () => {
            const result = system.levelUpSwordMaster('ghost');
            expect(result.error).toBe('SWORDMASTER_NOT_FOUND');
        });

        it('should trigger swordMasterLeveledUp hook', () => {
            const { master } = system.recruitSwordMaster({});
            let called = false;
            system.registerHook('swordMasterLeveledUp', () => { called = true; });
            system.levelUpSwordMaster(master.masterId);
            expect(called).toBe(true);
        });
    });

    describe('legendSwordMaster', () => {
        it('should legendize', () => {
            const { master } = system.recruitSwordMaster({});
            system.legendSwordMaster(master.masterId);
            expect(master.status).toBe('legendary');
        });

        it('should reject missing master', () => {
            const result = system.legendSwordMaster('ghost');
            expect(result.error).toBe('SWORDMASTER_NOT_FOUND');
        });

        it('should trigger swordMasterLegendized hook', () => {
            const { master } = system.recruitSwordMaster({});
            let called = false;
            system.registerHook('swordMasterLegendized', () => { called = true; });
            system.legendSwordMaster(master.masterId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSwordMasterValue', () => {
        it('should calculate value', () => {
            const { master } = system.recruitSwordMaster({});
            system.levelUpSwordMaster(master.masterId); // level 2
            system.intensifyAura(master.masterId, 10); // swordAura 30
            system.addSword(master.masterId, 's1'); // swords.length 1
            // value = 2 * 100 + 30 * 2 + 1 * 30 = 200 + 60 + 30 = 290
            expect(system.calculateSwordMasterValue(master.masterId)).toBe(290);
        });

        it('should calculate value with zero', () => {
            const { master } = system.recruitSwordMaster({});
            // level 1, swordAura 20, swords 0 => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateSwordMasterValue(master.masterId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSwordMasterValue('ghost')).toBe(0);
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

        it('should execute default getSwordMaster', () => {
            const result = system.executeTool('getSwordMaster', { masterId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('swordMasterRecruited', () => count++);
            unregister();
            system.recruitSwordMaster({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('swordMasterRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSwordMaster({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSwordMasters = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSwordMasters = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSwordMaster({});
            const json = system.toJSON();
            expect(json.swordmasters.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSwordMaster({});
            const json = system.toJSON();
            const newSys = new CultivationSwordMaster();
            newSys.fromJSON(json);
            expect(newSys.swordmasters.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.swordMasterCount).toBe(0);
        });
    });
});
