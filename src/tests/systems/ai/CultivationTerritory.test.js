/**
 * CultivationTerritory.test.js - 修真领土测试
 * V586 Iteration 9/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTerritory } from '../../../systems/ai/CultivationTerritory.js';

describe('CultivationTerritory', () => {
    let system;
    beforeEach(() => { system = new CultivationTerritory(); });

    describe('claimTerritory', () => {
        it('should claim', () => {
            const { territory } = system.claimTerritory({ rulerId: 'r1', name: 'Azure Empire' });
            expect(territory.rulerId).toBe('r1');
            expect(territory.name).toBe('Azure Empire');
            expect(territory.type).toBe('kingdom');
            expect(territory.status).toBe('claimed');
            expect(territory.level).toBe(1);
            expect(territory.influence).toBe(20);
        });

        it('should accept custom type and influence', () => {
            const { territory } = system.claimTerritory({ rulerId: 'r1', type: 'empire', influence: 50 });
            expect(territory.type).toBe('empire');
            expect(territory.influence).toBe(50);
        });

        it('should trigger territoryClaimed hook', () => {
            let called = false;
            system.registerHook('territoryClaimed', () => { called = true; });
            system.claimTerritory({});
            expect(called).toBe(true);
        });
    });

    describe('getTerritory', () => {
        it('should return', () => {
            const { territory } = system.claimTerritory({});
            expect(system.getTerritory(territory.territoryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTerritory('ghost')).toBeNull(); });
    });

    describe('listTerritories', () => {
        it('should list all', () => {
            system.claimTerritory({});
            system.claimTerritory({});
            expect(system.listTerritories().length).toBe(2);
        });
    });

    describe('listByRuler', () => {
        it('should filter', () => {
            system.claimTerritory({ rulerId: 'r1' });
            system.claimTerritory({ rulerId: 'r2' });
            expect(system.listByRuler('r1').length).toBe(1);
        });
    });

    describe('listStable', () => {
        it('should filter stable and eternal', () => {
            const { territory: t1 } = system.claimTerritory({});
            const { territory: t2 } = system.claimTerritory({});
            const { territory: t3 } = system.claimTerritory({});
            system.increaseInfluence(t2.territoryId, 100);
            system.eternizeTerritory(t3.territoryId);
            const stable = system.listStable();
            expect(stable.length).toBe(2);
            expect(stable.map(t => t.territoryId)).toContain(t2.territoryId);
            expect(stable.map(t => t.territoryId)).toContain(t3.territoryId);
        });
    });

    describe('addLand', () => {
        it('should add land', () => {
            const { territory } = system.claimTerritory({});
            system.addLand(territory.territoryId, { name: 'Forest', area: 100 });
            expect(territory.lands.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addLand('ghost', {});
            expect(result.error).toBe('TERRITORY_NOT_FOUND');
        });

        it('should trigger landAdded hook', () => {
            const { territory } = system.claimTerritory({});
            let called = false;
            system.registerHook('landAdded', () => { called = true; });
            system.addLand(territory.territoryId, { name: 'Mountain' });
            expect(called).toBe(true);
        });
    });

    describe('increaseInfluence', () => {
        it('should increase', () => {
            const { territory } = system.claimTerritory({});
            system.increaseInfluence(territory.territoryId, 10);
            expect(territory.influence).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.increaseInfluence('ghost', 10);
            expect(result.error).toBe('TERRITORY_NOT_FOUND');
        });

        it('should trigger influenceIncreased hook', () => {
            const { territory } = system.claimTerritory({});
            let called = false;
            system.registerHook('influenceIncreased', () => { called = true; });
            system.increaseInfluence(territory.territoryId, 5);
            expect(called).toBe(true);
        });

        it('should become stable when influence reaches 100', () => {
            const { territory } = system.claimTerritory({});
            system.increaseInfluence(territory.territoryId, 100);
            expect(territory.status).toBe('stable');
        });

        it('should not change status when already stable', () => {
            const { territory } = system.claimTerritory({});
            system.increaseInfluence(territory.territoryId, 100);
            system.increaseInfluence(territory.territoryId, 50);
            expect(territory.status).toBe('stable');
        });
    });

    describe('levelUpTerritory', () => {
        it('should level up', () => {
            const { territory } = system.claimTerritory({});
            system.levelUpTerritory(territory.territoryId);
            expect(territory.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTerritory('ghost');
            expect(result.error).toBe('TERRITORY_NOT_FOUND');
        });

        it('should trigger territoryLeveledUp hook', () => {
            const { territory } = system.claimTerritory({});
            let called = false;
            system.registerHook('territoryLeveledUp', () => { called = true; });
            system.levelUpTerritory(territory.territoryId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeTerritory', () => {
        it('should eternize', () => {
            const { territory } = system.claimTerritory({});
            system.eternizeTerritory(territory.territoryId);
            expect(territory.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.eternizeTerritory('ghost');
            expect(result.error).toBe('TERRITORY_NOT_FOUND');
        });

        it('should trigger territoryEternalized hook', () => {
            const { territory } = system.claimTerritory({});
            let called = false;
            system.registerHook('territoryEternalized', () => { called = true; });
            system.eternizeTerritory(territory.territoryId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTerritoryValue', () => {
        it('should calculate', () => {
            const { territory } = system.claimTerritory({});
            system.addLand(territory.territoryId, { name: 'A' });
            system.addLand(territory.territoryId, { name: 'B' });
            system.levelUpTerritory(territory.territoryId);
            // level 2 *100 + influence 20*2 + lands 2*30 = 200+40+60 = 300
            expect(system.calculateTerritoryValue(territory.territoryId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTerritoryValue('ghost')).toBe(0);
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

        it('should execute default getTerritory', () => {
            const result = system.executeTool('getTerritory', { territoryId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default claimTerritory', () => {
            const result = system.executeTool('claimTerritory', { rulerId: 'r1' });
            expect(result.result.success).toBe(true);
        });

        it('should execute tool with null context', () => {
            system.registerTool('nulltest', () => 'ok');
            const result = system.executeTool('nulltest', null);
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('territoryClaimed', () => count++);
            unregister();
            system.claimTerritory({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('territoryClaimed', () => { throw new Error('x'); });
            expect(() => system.claimTerritory({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTerritories = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTerritories = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.claimTerritory({});
            const json = system.toJSON();
            expect(json.territories.length).toBe(1);
        });
        it('should deserialize', () => {
            system.claimTerritory({});
            const json = system.toJSON();
            const newSys = new CultivationTerritory();
            newSys.fromJSON(json);
            expect(newSys.territories.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.territoryCount).toBe(0);
            expect(stats.totalTerritories).toBe(0);
        });
    });
});
