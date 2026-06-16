/**
 * CultivationPaladin.test.js - 修真圣骑士测试
 * V607 Iteration 10/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPaladin } from '../../../systems/ai/CultivationPaladin.js';

describe('CultivationPaladin', () => {
    let system;
    beforeEach(() => { system = new CultivationPaladin(); });

    describe('recruitPaladin', () => {
        it('should recruit', () => {
            const { paladin } = system.recruitPaladin({ leaderId: 'l1', name: 'Sir Galahad', type: 'holy' });
            expect(paladin.leaderId).toBe('l1');
            expect(paladin.name).toBe('Sir Galahad');
            expect(paladin.type).toBe('holy');
            expect(paladin.faith).toBe(20);
            expect(paladin.level).toBe(1);
            expect(paladin.status).toBe('novice');
            expect(paladin.blessings).toEqual([]);
        });

        it('should use defaults when not provided', () => {
            const { paladin } = system.recruitPaladin({});
            expect(paladin.name).toBe('Anonymous Paladin');
            expect(paladin.type).toBe('light');
        });

        it('should use provided faith', () => {
            const { paladin } = system.recruitPaladin({ faith: 80 });
            expect(paladin.faith).toBe(80);
        });

        it('should use provided blessings', () => {
            const { paladin } = system.recruitPaladin({ blessings: ['Divine Light'] });
            expect(paladin.blessings).toEqual(['Divine Light']);
        });

        it('should trigger paladinRecruited hook', () => {
            let called = false;
            system.registerHook('paladinRecruited', () => { called = true; });
            system.recruitPaladin({});
            expect(called).toBe(true);
        });

        it('should increment totalPaladins stat', () => {
            system.recruitPaladin({});
            system.recruitPaladin({});
            expect(system.stats.totalPaladins).toBe(2);
        });
    });

    describe('getPaladin', () => {
        it('should return', () => {
            const { paladin } = system.recruitPaladin({});
            expect(system.getPaladin(paladin.paladinId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPaladin('ghost')).toBeNull(); });
        it('should return a copy (not internal reference)', () => {
            const { paladin } = system.recruitPaladin({});
            const retrieved = system.getPaladin(paladin.paladinId);
            retrieved.name = 'Modified';
            expect(system.paladins.get(paladin.paladinId).name).toBe('Anonymous Paladin');
        });
    });

    describe('listPaladins', () => {
        it('should list all', () => {
            system.recruitPaladin({});
            system.recruitPaladin({});
            expect(system.listPaladins().length).toBe(2);
        });
        it('should return empty array when no paladins', () => {
            expect(system.listPaladins()).toEqual([]);
        });
    });

    describe('listByLeader', () => {
        it('should filter', () => {
            system.recruitPaladin({ leaderId: 'l1' });
            system.recruitPaladin({ leaderId: 'l2' });
            expect(system.listByLeader('l1').length).toBe(1);
        });
        it('should return empty for unknown leader', () => {
            system.recruitPaladin({ leaderId: 'l1' });
            expect(system.listByLeader('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { paladin } = system.recruitPaladin({});
            system.legendPaladin(paladin.paladinId);
            system.recruitPaladin({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addBlessing', () => {
        it('should add blessing', () => {
            const { paladin } = system.recruitPaladin({});
            system.addBlessing(paladin.paladinId, 'Holy Light');
            expect(paladin.blessings).toContain('Holy Light');
            expect(paladin.blessings.length).toBe(1);
        });

        it('should add multiple blessings', () => {
            const { paladin } = system.recruitPaladin({});
            system.addBlessing(paladin.paladinId, 'Divine Shield');
            system.addBlessing(paladin.paladinId, 'Sacred Flame');
            expect(paladin.blessings.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addBlessing('ghost', 'Grace');
            expect(result.error).toBe('PALADIN_NOT_FOUND');
        });

        it('should trigger blessingAdded hook', () => {
            const { paladin } = system.recruitPaladin({});
            let called = false;
            system.registerHook('blessingAdded', () => { called = true; });
            system.addBlessing(paladin.paladinId, 'Aura');
            expect(called).toBe(true);
        });
    });

    describe('increaseFaith', () => {
        it('should raise with amount', () => {
            const { paladin } = system.recruitPaladin({});
            system.increaseFaith(paladin.paladinId, 15);
            expect(paladin.faith).toBe(35);
        });

        it('should raise with default amount', () => {
            const { paladin } = system.recruitPaladin({});
            system.increaseFaith(paladin.paladinId);
            expect(paladin.faith).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseFaith('ghost', 10);
            expect(result.error).toBe('PALADIN_NOT_FOUND');
        });

        it('should trigger faithIncreased hook', () => {
            const { paladin } = system.recruitPaladin({});
            let called = false;
            system.registerHook('faithIncreased', () => { called = true; });
            system.increaseFaith(paladin.paladinId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPaladin', () => {
        it('should level up', () => {
            const { paladin } = system.recruitPaladin({});
            system.levelUpPaladin(paladin.paladinId);
            expect(paladin.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { paladin } = system.recruitPaladin({});
            for (let i = 0; i < 4; i++) system.levelUpPaladin(paladin.paladinId);
            expect(paladin.level).toBe(5);
            expect(paladin.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpPaladin('ghost');
            expect(result.error).toBe('PALADIN_NOT_FOUND');
        });

        it('should trigger paladinLeveledUp hook', () => {
            const { paladin } = system.recruitPaladin({});
            let called = false;
            system.registerHook('paladinLeveledUp', () => { called = true; });
            system.levelUpPaladin(paladin.paladinId);
            expect(called).toBe(true);
        });
    });

    describe('legendPaladin', () => {
        it('should legendize', () => {
            const { paladin } = system.recruitPaladin({});
            system.legendPaladin(paladin.paladinId);
            expect(paladin.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPaladin('ghost');
            expect(result.error).toBe('PALADIN_NOT_FOUND');
        });

        it('should trigger paladinLegendized hook', () => {
            const { paladin } = system.recruitPaladin({});
            let called = false;
            system.registerHook('paladinLegendized', () => { called = true; });
            system.legendPaladin(paladin.paladinId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePaladinValue', () => {
        it('should calculate', () => {
            const { paladin } = system.recruitPaladin({});
            system.levelUpPaladin(paladin.paladinId);
            system.increaseFaith(paladin.paladinId, 5);
            system.addBlessing(paladin.paladinId, 'Holy Light');
            // level=2, faith=25, blessings.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculatePaladinValue(paladin.paladinId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePaladinValue('ghost')).toBe(0);
        });

        it('should return base value for new paladin', () => {
            const { paladin } = system.recruitPaladin({});
            // level=1, faith=20, blessings.length=0 => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculatePaladinValue(paladin.paladinId)).toBe(140);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { paladin } = system.recruitPaladin({});
            for (let i = 0; i < 4; i++) system.levelUpPaladin(paladin.paladinId);
            system.recruitPaladin({});
            expect(system.listVeterans().length).toBe(1);
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

        it('should execute default getPaladin', () => {
            const result = system.executeTool('getPaladin', { paladinId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('paladinRecruited', () => count++);
            unregister();
            system.recruitPaladin({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('paladinRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPaladin({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPaladins = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPaladins = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPaladin({});
            const json = system.toJSON();
            expect(json.paladins.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPaladin({});
            const json = system.toJSON();
            const newSys = new CultivationPaladin();
            newSys.fromJSON(json);
            expect(newSys.paladins.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.paladinCount).toBe(0);
        });
    });
});
