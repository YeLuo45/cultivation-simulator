/**
 * OceanCultivation.test.js - 海洋修真系统测试
 * V465 Iteration 12/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OceanCultivation } from '../../../systems/ai/OceanCultivation.js';

describe('OceanCultivation', () => {
    let system;
    beforeEach(() => { system = new OceanCultivation(); });

    describe('enterZone', () => {
        it('should create zone', () => {
            const { zone } = system.enterZone({ cultivatorId: 'c1' });
            expect(zone.cultivatorId).toBe('c1');
        });

        it('should initialize base depth', () => {
            const { zone } = system.enterZone({});
            expect(zone.depth).toBe(100);
        });

        it('should trigger zoneEntered hook', () => {
            let called = false;
            system.registerHook('zoneEntered', () => { called = true; });
            system.enterZone({});
            expect(called).toBe(true);
        });
    });

    describe('getZone', () => {
        it('should return zone', () => {
            const { zone } = system.enterZone({});
            expect(system.getZone(zone.zoneId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getZone('ghost')).toBeNull(); });
    });

    describe('listZones', () => {
        it('should list all', () => {
            system.enterZone({});
            system.enterZone({});
            expect(system.listZones().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listZones().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.enterZone({ cultivatorId: 'c1' });
            system.enterZone({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should exclude tranquil zones', () => {
            const { zone: z1 } = system.enterZone({});
            const { zone: z2 } = system.enterZone({});
            z2.status = 'tranquil';
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('diveDeeper', () => {
        it('should increase depth', () => {
            const { zone } = system.enterZone({});
            system.diveDeeper(zone.zoneId, 50);
            expect(zone.depth).toBe(150);
        });

        it('should use default amount', () => {
            const { zone } = system.enterZone({});
            system.diveDeeper(zone.zoneId);
            expect(zone.depth).toBe(110);
        });

        it('should reject missing', () => {
            const result = system.diveDeeper('ghost', 10);
            expect(result.error).toBe('ZONE_NOT_FOUND');
        });

        it('should trigger zoneDived hook', () => {
            const { zone } = system.enterZone({});
            let called = false;
            system.registerHook('zoneDived', () => { called = true; });
            system.diveDeeper(zone.zoneId, 10);
            expect(called).toBe(true);
        });
    });

    describe('catchCreature', () => {
        it('should add creature', () => {
            const { zone } = system.enterZone({});
            system.catchCreature(zone.zoneId, { name: 'fish' });
            expect(zone.creatures.length).toBe(1);
        });

        it('should reject missing zone', () => {
            const result = system.catchCreature('ghost', { name: 'shark' });
            expect(result.error).toBe('ZONE_NOT_FOUND');
        });

        it('should trigger creatureCaught hook', () => {
            const { zone } = system.enterZone({});
            let called = false;
            system.registerHook('creatureCaught', () => { called = true; });
            system.catchCreature(zone.zoneId, { name: 'eel' });
            expect(called).toBe(true);
        });
    });

    describe('collectPearl', () => {
        it('should add pearl', () => {
            const { zone } = system.enterZone({});
            system.collectPearl(zone.zoneId, { size: 'large' });
            expect(zone.pearls.length).toBe(1);
        });

        it('should reject missing zone', () => {
            const result = system.collectPearl('ghost', {});
            expect(result.error).toBe('ZONE_NOT_FOUND');
        });

        it('should trigger pearlCollected hook', () => {
            const { zone } = system.enterZone({});
            let called = false;
            system.registerHook('pearlCollected', () => { called = true; });
            system.collectPearl(zone.zoneId, {});
            expect(called).toBe(true);
        });
    });

    describe('calmZone', () => {
        it('should set status to calm', () => {
            const { zone } = system.enterZone({});
            zone.status = 'turbulent';
            system.calmZone(zone.zoneId);
            expect(zone.status).toBe('calm');
        });

        it('should reject missing', () => {
            const result = system.calmZone('ghost');
            expect(result.error).toBe('ZONE_NOT_FOUND');
        });

        it('should trigger zoneCalmed hook', () => {
            const { zone } = system.enterZone({});
            let called = false;
            system.registerHook('zoneCalmed', () => { called = true; });
            system.calmZone(zone.zoneId);
            expect(called).toBe(true);
        });
    });

    describe('calculateOceanPower', () => {
        it('should calculate with formula', () => {
            const { zone } = system.enterZone({});
            zone.depth = 100;
            zone.creatures = [{}, {}, {}];
            zone.pearls = [{}, {}];
            expect(system.calculateOceanPower(zone.zoneId)).toBe(100 * 2 + 3 * 3 + 2 * 5);
        });

        it('should return 0 for missing zone', () => {
            expect(system.calculateOceanPower('ghost')).toBe(0);
        });

        it('should return 0 for empty zone', () => {
            const { zone } = system.enterZone({});
            zone.depth = 0;
            expect(system.calculateOceanPower(zone.zoneId)).toBe(0);
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

        it('should execute default getZone', () => {
            const result = system.executeTool('getZone', { zoneId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('zoneEntered', () => count++);
            unregister();
            system.enterZone({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('zoneEntered', () => { throw new Error('x'); });
            expect(() => system.enterZone({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient zones', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when enough zones', () => {
            system.stats.totalZones = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalZones = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.enterZone({});
            const json = system.toJSON();
            expect(json.zones.length).toBe(1);
        });
        it('should deserialize', () => {
            system.enterZone({});
            const json = system.toJSON();
            const newSys = new OceanCultivation();
            newSys.fromJSON(json);
            expect(newSys.zones.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.zoneCount).toBe(0);
        });
    });
});
