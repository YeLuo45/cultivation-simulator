/**
 * SectAlliance.test.js - 宗门联盟系统测试
 * V495 Iteration 12/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectAlliance } from '../../../systems/ai/SectAlliance.js';

describe('SectAlliance', () => {
    let system;
    beforeEach(() => { system = new SectAlliance(); });

    describe('formAlliance', () => {
        it('should form', () => {
            const { alliance } = system.formAlliance({ leader: 's1', ally: 's2' });
            expect(alliance.leader).toBe('s1');
            expect(alliance.ally).toBe('s2');
        });

        it('should default bonds to empty array', () => {
            const { alliance } = system.formAlliance({});
            expect(alliance.bonds).toEqual([]);
        });

        it('should set status to forming', () => {
            const { alliance } = system.formAlliance({});
            expect(alliance.status).toBe('forming');
        });

        it('should default strength from config', () => {
            const { alliance } = system.formAlliance({});
            expect(alliance.strength).toBe(10);
        });

        it('should accept custom strength', () => {
            const { alliance } = system.formAlliance({ strength: 50 });
            expect(alliance.strength).toBe(50);
        });

        it('should generate allianceId', () => {
            const { alliance } = system.formAlliance({});
            expect(alliance.allianceId).toBeTruthy();
        });

        it('should accept custom bonds', () => {
            const { alliance } = system.formAlliance({ bonds: ['b1', 'b2'] });
            expect(alliance.bonds.length).toBe(2);
        });

        it('should trigger allianceFormed hook', () => {
            let called = false;
            system.registerHook('allianceFormed', () => { called = true; });
            system.formAlliance({});
            expect(called).toBe(true);
        });
    });

    describe('getAlliance', () => {
        it('should return alliance', () => {
            const { alliance } = system.formAlliance({});
            expect(system.getAlliance(alliance.allianceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAlliance('ghost')).toBeNull(); });
    });

    describe('listAlliances', () => {
        it('should list all', () => {
            system.formAlliance({});
            system.formAlliance({});
            expect(system.listAlliances().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listAlliances().length).toBe(0);
        });
    });

    describe('listByLeader', () => {
        it('should filter by leader', () => {
            system.formAlliance({ leader: 's1' });
            system.formAlliance({ leader: 's2' });
            expect(system.listByLeader('s1').length).toBe(1);
        });

        it('should return empty for unknown leader', () => {
            system.formAlliance({});
            expect(system.listByLeader('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active status', () => {
            const { alliance: a1 } = system.formAlliance({});
            system.formAlliance({});
            a1.status = 'active';
            expect(system.listActive().length).toBe(1);
        });

        it('should return empty when no active', () => {
            system.formAlliance({});
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('strengthenAlliance', () => {
        it('should increase strength by amount', () => {
            const { alliance } = system.formAlliance({});
            system.strengthenAlliance(alliance.allianceId, 20);
            expect(alliance.strength).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { alliance } = system.formAlliance({});
            system.strengthenAlliance(alliance.allianceId);
            expect(alliance.strength).toBe(15);
        });

        it('should set status to active after strengthening', () => {
            const { alliance } = system.formAlliance({});
            system.strengthenAlliance(alliance.allianceId, 5);
            expect(alliance.status).toBe('active');
        });

        it('should reject missing alliance', () => {
            const result = system.strengthenAlliance('ghost', 10);
            expect(result.error).toBe('ALLIANCE_NOT_FOUND');
        });

        it('should trigger allianceStrengthened hook', () => {
            const { alliance } = system.formAlliance({});
            let called = false;
            system.registerHook('allianceStrengthened', () => { called = true; });
            system.strengthenAlliance(alliance.allianceId, 10);
            expect(called).toBe(true);
        });
    });

    describe('addBond', () => {
        it('should add bond to bonds array', () => {
            const { alliance } = system.formAlliance({});
            system.addBond(alliance.allianceId, 'trust');
            expect(alliance.bonds.length).toBe(1);
            expect(alliance.bonds[0]).toBe('trust');
        });

        it('should add multiple bonds', () => {
            const { alliance } = system.formAlliance({});
            system.addBond(alliance.allianceId, 'b1');
            system.addBond(alliance.allianceId, 'b2');
            expect(alliance.bonds.length).toBe(2);
        });

        it('should reject missing alliance', () => {
            const result = system.addBond('ghost', 'x');
            expect(result.error).toBe('ALLIANCE_NOT_FOUND');
        });

        it('should trigger bondAdded hook', () => {
            const { alliance } = system.formAlliance({});
            let called = false;
            system.registerHook('bondAdded', () => { called = true; });
            system.addBond(alliance.allianceId, 't');
            expect(called).toBe(true);
        });
    });

    describe('dissolveAlliance', () => {
        it('should set status to dissolved', () => {
            const { alliance } = system.formAlliance({});
            system.dissolveAlliance(alliance.allianceId);
            expect(alliance.status).toBe('dissolved');
        });

        it('should reject missing alliance', () => {
            const result = system.dissolveAlliance('ghost');
            expect(result.error).toBe('ALLIANCE_NOT_FOUND');
        });

        it('should trigger allianceDissolved hook', () => {
            const { alliance } = system.formAlliance({});
            let called = false;
            system.registerHook('allianceDissolved', () => { called = true; });
            system.dissolveAlliance(alliance.allianceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAllianceValue', () => {
        it('should calculate value = strength * 10 + bonds.length * 20', () => {
            const { alliance } = system.formAlliance({ strength: 10 });
            system.addBond(alliance.allianceId, 'b1');
            system.addBond(alliance.allianceId, 'b2');
            // 10 * 10 + 2 * 20 = 140
            expect(system.calculateAllianceValue(alliance.allianceId)).toBe(140);
        });

        it('should calculate with no bonds', () => {
            const { alliance } = system.formAlliance({ strength: 20 });
            // 20 * 10 + 0 * 20 = 200
            expect(system.calculateAllianceValue(alliance.allianceId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAllianceValue('ghost')).toBe(0);
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

        it('should execute default getAlliance', () => {
            const result = system.executeTool('getAlliance', { allianceId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('allianceFormed', () => count++);
            unregister();
            system.formAlliance({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('allianceFormed', () => { throw new Error('x'); });
            expect(() => system.formAlliance({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAlliances = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAlliances = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.formAlliance({});
            const json = system.toJSON();
            expect(json.alliances.length).toBe(1);
        });
        it('should deserialize', () => {
            system.formAlliance({});
            const json = system.toJSON();
            const newSys = new SectAlliance();
            newSys.fromJSON(json);
            expect(newSys.alliances.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.allianceCount).toBe(0);
        });
    });
});
