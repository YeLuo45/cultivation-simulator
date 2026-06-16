/**
 * SectWarfare.test.js - 宗门战争测试
 * V474 Iteration 6/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectWarfare } from '../../../systems/ai/SectWarfare.js';

describe('SectWarfare', () => {
    let system;
    beforeEach(() => { system = new SectWarfare(); });

    describe('declareWar', () => {
        it('should declare', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            expect(war.sectId).toBe('s1');
            expect(war.enemySect).toBe('s2');
        });

        it('should trigger warDeclared hook', () => {
            let called = false;
            system.registerHook('warDeclared', () => { called = true; });
            system.declareWar({ sectId: 's1', enemySect: 's2' });
            expect(called).toBe(true);
        });
    });

    describe('getWar', () => {
        it('should return', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            expect(system.getWar(war.warId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWar('ghost')).toBeNull(); });
    });

    describe('listWars', () => {
        it('should list all', () => {
            system.declareWar({ sectId: 's1', enemySect: 's2' });
            expect(system.listWars().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter by sectId', () => {
            system.declareWar({ sectId: 's1', enemySect: 's2' });
            system.declareWar({ sectId: 's2', enemySect: 's3' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should filter by enemySect', () => {
            system.declareWar({ sectId: 's1', enemySect: 's2' });
            system.declareWar({ sectId: 's3', enemySect: 's4' });
            expect(system.listBySect('s2').length).toBe(1);
        });
    });

    describe('listOngoing', () => {
        it('should filter declared and ongoing', () => {
            system.declareWar({ sectId: 's1', enemySect: 's2' });
            const { war } = system.declareWar({ sectId: 's3', enemySect: 's4' });
            system.declareVictory(war.warId);
            expect(system.listOngoing().length).toBe(1);
        });
    });

    describe('sendSoldiers', () => {
        it('should send default 10', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            system.sendSoldiers(war.warId);
            expect(war.soldiers).toBe(110);
        });

        it('should send custom count', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            system.sendSoldiers(war.warId, 50);
            expect(war.soldiers).toBe(150);
        });

        it('should reject missing', () => {
            const result = system.sendSoldiers('ghost', 10);
            expect(result.error).toBe('WAR_NOT_FOUND');
        });

        it('should trigger soldiersSent hook', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            let called = false;
            system.registerHook('soldiersSent', () => { called = true; });
            system.sendSoldiers(war.warId, 20);
            expect(called).toBe(true);
        });
    });

    describe('recordBattle', () => {
        it('should record', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            system.recordBattle(war.warId, { type: 'siege', outcome: 'won' });
            expect(war.battles.length).toBe(1);
        });

        it('should set status to ongoing when first battle recorded', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            system.recordBattle(war.warId, { type: 'skirmish' });
            expect(war.status).toBe('ongoing');
        });

        it('should reject missing', () => {
            const result = system.recordBattle('ghost', { type: 'siege' });
            expect(result.error).toBe('WAR_NOT_FOUND');
        });

        it('should trigger battleRecorded hook', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            let called = false;
            system.registerHook('battleRecorded', () => { called = true; });
            system.recordBattle(war.warId, { type: 'raid' });
            expect(called).toBe(true);
        });
    });

    describe('declareVictory', () => {
        it('should set status to victorious', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            system.declareVictory(war.warId);
            expect(war.status).toBe('victorious');
        });

        it('should reject missing', () => {
            const result = system.declareVictory('ghost');
            expect(result.error).toBe('WAR_NOT_FOUND');
        });

        it('should trigger warConcluded hook', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            let called = false;
            system.registerHook('warConcluded', () => { called = true; });
            system.declareVictory(war.warId);
            expect(called).toBe(true);
        });
    });

    describe('declareDefeat', () => {
        it('should set status to defeated', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            system.declareDefeat(war.warId);
            expect(war.status).toBe('defeated');
        });

        it('should reject missing', () => {
            const result = system.declareDefeat('ghost');
            expect(result.error).toBe('WAR_NOT_FOUND');
        });

        it('should trigger warConcluded hook', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2' });
            let called = false;
            system.registerHook('warConcluded', () => { called = true; });
            system.declareDefeat(war.warId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWarStrength', () => {
        it('should calculate', () => {
            const { war } = system.declareWar({ sectId: 's1', enemySect: 's2', soldiers: 100, casualties: 20 });
            system.recordBattle(war.warId, { type: 'siege' });
            system.recordBattle(war.warId, { type: 'raid' });
            // soldiers(100)*2 + battles(2)*50 - casualties(20) = 200 + 100 - 20 = 280
            expect(system.calculateWarStrength(war.warId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWarStrength('ghost')).toBe(0);
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

        it('should execute default getWar', () => {
            const result = system.executeTool('getWar', { warId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('warDeclared', () => count++);
            unregister();
            system.declareWar({ sectId: 's1', enemySect: 's2' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('warDeclared', () => { throw new Error('x'); });
            expect(() => system.declareWar({ sectId: 's1', enemySect: 's2' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWars = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWars = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.declareWar({ sectId: 's1', enemySect: 's2' });
            const json = system.toJSON();
            expect(json.wars.length).toBe(1);
        });
        it('should deserialize', () => {
            system.declareWar({ sectId: 's1', enemySect: 's2' });
            const json = system.toJSON();
            const newSys = new SectWarfare();
            newSys.fromJSON(json);
            expect(newSys.wars.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.warCount).toBe(0);
        });
    });
});
