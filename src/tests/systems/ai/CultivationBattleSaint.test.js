/**
 * CultivationBattleSaint.test.js - 修真战圣测试
 * V637 Iteration 20/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBattleSaint } from '../../../systems/ai/CultivationBattleSaint.js';

describe('CultivationBattleSaint', () => {
    let system;
    beforeEach(() => { system = new CultivationBattleSaint(); });

    describe('recruitBattleSaint', () => {
        it('should recruit', () => {
            const { saint } = system.recruitBattleSaint({ masterId: 'm1', name: 'Bai', type: 'warrior' });
            expect(saint.masterId).toBe('m1');
            expect(saint.name).toBe('Bai');
            expect(saint.type).toBe('warrior');
            expect(saint.aura).toBe(20);
            expect(saint.level).toBe(1);
            expect(saint.status).toBe('novice');
            expect(saint.techniques).toEqual([]);
        });

        it('should trigger battleSaintRecruited hook', () => {
            let called = false;
            system.registerHook('battleSaintRecruited', () => { called = true; });
            system.recruitBattleSaint({});
            expect(called).toBe(true);
        });
    });

    describe('getBattleSaint', () => {
        it('should return', () => {
            const { saint } = system.recruitBattleSaint({});
            expect(system.getBattleSaint(saint.saintId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBattleSaint('ghost')).toBeNull(); });
    });

    describe('listBattleSaints', () => {
        it('should list all', () => {
            system.recruitBattleSaint({});
            system.recruitBattleSaint({});
            expect(system.listBattleSaints().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitBattleSaint({ masterId: 'm1' });
            system.recruitBattleSaint({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { saint } = system.recruitBattleSaint({});
            system.legendBattleSaint(saint.saintId);
            system.recruitBattleSaint({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addTechnique', () => {
        it('should add technique', () => {
            const { saint } = system.recruitBattleSaint({});
            system.addTechnique(saint.saintId, 'Dragon Palm');
            expect(saint.techniques).toContain('Dragon Palm');
            expect(saint.techniques.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addTechnique('ghost', 'Spear');
            expect(result.error).toBe('SAINT_NOT_FOUND');
        });

        it('should trigger techniqueAdded hook', () => {
            const { saint } = system.recruitBattleSaint({});
            let called = false;
            system.registerHook('techniqueAdded', () => { called = true; });
            system.addTechnique(saint.saintId, 'Axe');
            expect(called).toBe(true);
        });
    });

    describe('intensifyAura', () => {
        it('should intensify with amount', () => {
            const { saint } = system.recruitBattleSaint({});
            system.intensifyAura(saint.saintId, 10);
            expect(saint.aura).toBe(30);
        });

        it('should intensify with default', () => {
            const { saint } = system.recruitBattleSaint({});
            system.intensifyAura(saint.saintId);
            expect(saint.aura).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.intensifyAura('ghost', 10);
            expect(result.error).toBe('SAINT_NOT_FOUND');
        });

        it('should trigger auraIntensified hook', () => {
            const { saint } = system.recruitBattleSaint({});
            let called = false;
            system.registerHook('auraIntensified', () => { called = true; });
            system.intensifyAura(saint.saintId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBattleSaint', () => {
        it('should level up', () => {
            const { saint } = system.recruitBattleSaint({});
            system.levelUpBattleSaint(saint.saintId);
            expect(saint.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { saint } = system.recruitBattleSaint({});
            for (let i = 0; i < 4; i++) system.levelUpBattleSaint(saint.saintId);
            expect(saint.level).toBe(5);
            expect(saint.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpBattleSaint('ghost');
            expect(result.error).toBe('SAINT_NOT_FOUND');
        });

        it('should trigger battleSaintLeveledUp hook', () => {
            const { saint } = system.recruitBattleSaint({});
            let called = false;
            system.registerHook('battleSaintLeveledUp', () => { called = true; });
            system.levelUpBattleSaint(saint.saintId);
            expect(called).toBe(true);
        });
    });

    describe('legendBattleSaint', () => {
        it('should legendize', () => {
            const { saint } = system.recruitBattleSaint({});
            system.legendBattleSaint(saint.saintId);
            expect(saint.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBattleSaint('ghost');
            expect(result.error).toBe('SAINT_NOT_FOUND');
        });

        it('should trigger battleSaintLegendized hook', () => {
            const { saint } = system.recruitBattleSaint({});
            let called = false;
            system.registerHook('battleSaintLegendized', () => { called = true; });
            system.legendBattleSaint(saint.saintId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBattleSaintValue', () => {
        it('should calculate', () => {
            const { saint } = system.recruitBattleSaint({});
            system.levelUpBattleSaint(saint.saintId);
            system.intensifyAura(saint.saintId, 5);
            system.addTechnique(saint.saintId, 'Dragon Palm');
            // level=2, aura=25, techniques.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateBattleSaintValue(saint.saintId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBattleSaintValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { saint } = system.recruitBattleSaint({});
            for (let i = 0; i < 4; i++) system.levelUpBattleSaint(saint.saintId);
            system.recruitBattleSaint({});
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

        it('should execute default getBattleSaint', () => {
            const result = system.executeTool('getBattleSaint', { saintId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('battleSaintRecruited', () => count++);
            unregister();
            system.recruitBattleSaint({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('battleSaintRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBattleSaint({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBattleSaints = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBattleSaints = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBattleSaint({});
            const json = system.toJSON();
            expect(json.battleSaints.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBattleSaint({});
            const json = system.toJSON();
            const newSys = new CultivationBattleSaint();
            newSys.fromJSON(json);
            expect(newSys.battleSaints.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.battleSaintCount).toBe(0);
        });
    });
});
