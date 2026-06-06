/**
 * CultivationVillage.test.js - 修真村系统测试
 * V591 Iteration 14/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationVillage } from '../../../systems/ai/CultivationVillage.js';

describe('CultivationVillage', () => {
    let system;
    beforeEach(() => { system = new CultivationVillage(); });

    describe('foundVillage', () => {
        it('should create', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'SpringValley' });
            expect(village.chiefId).toBe('ch1');
            expect(village.name).toBe('SpringValley');
        });

        it('should default to farming type', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            expect(village.type).toBe('farming');
        });

        it('should default to base harmony', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            expect(village.harmony).toBe(20);
        });

        it('should default to humble status', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            expect(village.status).toBe('humble');
        });

        it('should default level 1', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            expect(village.level).toBe(1);
        });

        it('should trigger villageFounded hook', () => {
            let called = false;
            system.registerHook('villageFounded', () => { called = true; });
            system.foundVillage({ chiefId: 'ch1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getVillage', () => {
        it('should return', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            expect(system.getVillage(village.villageId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVillage('ghost')).toBeNull(); });
    });

    describe('listVillages', () => {
        it('should list all', () => {
            system.foundVillage({ chiefId: 'ch1', name: 'A' });
            system.foundVillage({ chiefId: 'ch2', name: 'B' });
            expect(system.listVillages().length).toBe(2);
        });
    });

    describe('listByChief', () => {
        it('should filter', () => {
            system.foundVillage({ chiefId: 'ch1', name: 'A' });
            system.foundVillage({ chiefId: 'ch2', name: 'B' });
            expect(system.listByChief('ch1').length).toBe(1);
        });
    });

    describe('listEternal', () => {
        it('should filter eternal', () => {
            const { village: v1 } = system.foundVillage({ chiefId: 'ch1', name: 'A' });
            system.foundVillage({ chiefId: 'ch2', name: 'B' });
            system.eternalizeVillage(v1.villageId);
            expect(system.listEternal().length).toBe(1);
        });
    });

    describe('addFamily', () => {
        it('should add family', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            system.addFamily(village.villageId, { name: 'Li' });
            expect(village.families.length).toBe(1);
        });

        it('should reject missing village', () => {
            const result = system.addFamily('ghost', { name: 'X' });
            expect(result.error).toBe('VILLAGE_NOT_FOUND');
        });

        it('should trigger familyAdded hook', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            let called = false;
            system.registerHook('familyAdded', () => { called = true; });
            system.addFamily(village.villageId, { name: 'Li' });
            expect(called).toBe(true);
        });
    });

    describe('increaseHarmony', () => {
        it('should increase', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            system.increaseHarmony(village.villageId, 10);
            expect(village.harmony).toBe(30);
        });

        it('should default amount to 5', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            system.increaseHarmony(village.villageId);
            expect(village.harmony).toBe(25);
        });

        it('should reject missing village', () => {
            const result = system.increaseHarmony('ghost', 10);
            expect(result.error).toBe('VILLAGE_NOT_FOUND');
        });

        it('should trigger harmonyIncreased hook', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            let called = false;
            system.registerHook('harmonyIncreased', () => { called = true; });
            system.increaseHarmony(village.villageId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpVillage', () => {
        it('should level up', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            system.levelUpVillage(village.villageId);
            expect(village.level).toBe(2);
        });

        it('should reject missing village', () => {
            const result = system.levelUpVillage('ghost');
            expect(result.error).toBe('VILLAGE_NOT_FOUND');
        });

        it('should trigger villageLeveledUp hook', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            let called = false;
            system.registerHook('villageLeveledUp', () => { called = true; });
            system.levelUpVillage(village.villageId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeVillage', () => {
        it('should set status to eternal', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            system.eternalizeVillage(village.villageId);
            expect(village.status).toBe('eternal');
        });

        it('should reject missing village', () => {
            const result = system.eternalizeVillage('ghost');
            expect(result.error).toBe('VILLAGE_NOT_FOUND');
        });

        it('should trigger villageEternalized hook', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            let called = false;
            system.registerHook('villageEternalized', () => { called = true; });
            system.eternalizeVillage(village.villageId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVillageValue', () => {
        it('should calculate', () => {
            const { village } = system.foundVillage({ chiefId: 'ch1', name: 'X' });
            system.addFamily(village.villageId, { name: 'Li' });
            system.increaseHarmony(village.villageId, 10);
            // level=1, harmony=30, families=1: 1*100 + 30*2 + 1*30 = 100 + 60 + 30 = 190
            expect(system.calculateVillageValue(village.villageId)).toBe(190);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateVillageValue('ghost')).toBe(0);
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

        it('should execute default getVillage', () => {
            const result = system.executeTool('getVillage', { villageId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('villageFounded', () => count++);
            unregister();
            system.foundVillage({ chiefId: 'ch1', name: 'X' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('villageFounded', () => { throw new Error('x'); });
            expect(() => system.foundVillage({ chiefId: 'ch1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalVillages = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalVillages = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.foundVillage({ chiefId: 'ch1', name: 'X' });
            const json = system.toJSON();
            expect(json.villages.length).toBe(1);
        });
        it('should deserialize', () => {
            system.foundVillage({ chiefId: 'ch1', name: 'X' });
            const json = system.toJSON();
            const newSys = new CultivationVillage();
            newSys.fromJSON(json);
            expect(newSys.villages.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.villageCount).toBe(0);
        });
    });
});
