/**
 * InscriptionCrafting.test.js - 铭文系统测试
 * V460 Iteration 7/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InscriptionCrafting } from '../../../systems/ai/InscriptionCrafting.js';

describe('InscriptionCrafting', () => {
    let system;
    beforeEach(() => { system = new InscriptionCrafting(); });

    describe('createInscription', () => {
        it('should create inscription with given fields', () => {
            const { inscription } = system.createInscription({ inscriberId: 'i1', name: 'Flame Rune', type: 'weapon' });
            expect(inscription.inscriberId).toBe('i1');
            expect(inscription.name).toBe('Flame Rune');
            expect(inscription.type).toBe('weapon');
        });

        it('should default type to weapon and sharpness to 20', () => {
            const { inscription } = system.createInscription({ inscriberId: 'i1' });
            expect(inscription.type).toBe('weapon');
            expect(inscription.sharpness).toBe(20);
            expect(inscription.durability).toBe(100);
            expect(inscription.status).toBe('draft');
            expect(inscription.runes).toEqual([]);
        });

        it('should generate an inscriptionId when not provided', () => {
            const { inscription } = system.createInscription({});
            expect(inscription.inscriptionId).toBeTruthy();
            expect(typeof inscription.inscriptionId).toBe('string');
        });

        it('should trigger inscriptionCreated hook', () => {
            let called = false;
            system.registerHook('inscriptionCreated', () => { called = true; });
            system.createInscription({});
            expect(called).toBe(true);
        });
    });

    describe('getInscription', () => {
        it('should return inscription copy', () => {
            const { inscription } = system.createInscription({});
            const found = system.getInscription(inscription.inscriptionId);
            expect(found).not.toBeNull();
            expect(found.inscriptionId).toBe(inscription.inscriptionId);
        });
        it('should return null for missing', () => { expect(system.getInscription('ghost')).toBeNull(); });
    });

    describe('listInscriptions', () => {
        it('should list all inscriptions', () => {
            system.createInscription({});
            system.createInscription({});
            system.createInscription({});
            expect(system.listInscriptions().length).toBe(3);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.createInscription({ type: 'weapon' });
            system.createInscription({ type: 'armor' });
            system.createInscription({ type: 'weapon' });
            expect(system.listByType('weapon').length).toBe(2);
            expect(system.listByType('armor').length).toBe(1);
            expect(system.listByType('treasure').length).toBe(0);
        });
    });

    describe('listByInscriber', () => {
        it('should filter by inscriber', () => {
            system.createInscription({ inscriberId: 'i1' });
            system.createInscription({ inscriberId: 'i2' });
            system.createInscription({ inscriberId: 'i1' });
            expect(system.listByInscriber('i1').length).toBe(2);
            expect(system.listByInscriber('i2').length).toBe(1);
            expect(system.listByInscriber('i3').length).toBe(0);
        });
    });

    describe('addRune', () => {
        it('should add a rune to inscription', () => {
            const { inscription } = system.createInscription({});
            const result = system.addRune(inscription.inscriptionId, 'fire_rune');
            expect(result.success).toBe(true);
            expect(inscription.runes).toContain('fire_rune');
        });

        it('should reject missing inscription', () => {
            const result = system.addRune('ghost', 'rune');
            expect(result.error).toBe('INSCRIPTION_NOT_FOUND');
        });

        it('should trigger runeAdded hook', () => {
            const { inscription } = system.createInscription({});
            let called = false;
            system.registerHook('runeAdded', () => { called = true; });
            system.addRune(inscription.inscriptionId, 'ice_rune');
            expect(called).toBe(true);
        });
    });

    describe('sharpenInscription', () => {
        it('should sharpen by default 5', () => {
            const { inscription } = system.createInscription({});
            system.sharpenInscription(inscription.inscriptionId);
            expect(inscription.sharpness).toBe(25);
        });

        it('should sharpen by custom amount', () => {
            const { inscription } = system.createInscription({});
            system.sharpenInscription(inscription.inscriptionId, 15);
            expect(inscription.sharpness).toBe(35);
        });

        it('should reject missing inscription', () => {
            const result = system.sharpenInscription('ghost', 10);
            expect(result.error).toBe('INSCRIPTION_NOT_FOUND');
        });

        it('should trigger inscriptionSharpened hook', () => {
            const { inscription } = system.createInscription({});
            let called = false;
            system.registerHook('inscriptionSharpened', () => { called = true; });
            system.sharpenInscription(inscription.inscriptionId, 5);
            expect(called).toBe(true);
        });
    });

    describe('carveInscription', () => {
        it('should set status to carved', () => {
            const { inscription } = system.createInscription({});
            system.carveInscription(inscription.inscriptionId);
            expect(inscription.status).toBe('carved');
        });

        it('should reject missing inscription', () => {
            const result = system.carveInscription('ghost');
            expect(result.error).toBe('INSCRIPTION_NOT_FOUND');
        });

        it('should trigger inscriptionCarved hook', () => {
            const { inscription } = system.createInscription({});
            let called = false;
            system.registerHook('inscriptionCarved', () => { called = true; });
            system.carveInscription(inscription.inscriptionId);
            expect(called).toBe(true);
        });
    });

    describe('etchInscription', () => {
        it('should set status to etched', () => {
            const { inscription } = system.createInscription({});
            system.etchInscription(inscription.inscriptionId);
            expect(inscription.status).toBe('etched');
        });
    });

    describe('calculateInscriptionPower', () => {
        it('should calculate power with no runes', () => {
            const { inscription } = system.createInscription({ sharpness: 30, durability: 100 });
            // 30 * (1 + 0/3) + 100/10 = 30 + 10 = 40
            expect(system.calculateInscriptionPower(inscription.inscriptionId)).toBe(40);
        });

        it('should calculate power with runes', () => {
            const { inscription } = system.createInscription({ sharpness: 30, durability: 100 });
            system.addRune(inscription.inscriptionId, 'a');
            system.addRune(inscription.inscriptionId, 'b');
            system.addRune(inscription.inscriptionId, 'c');
            // 30 * (1 + 3/3) + 100/10 = 30 * 2 + 10 = 70
            expect(system.calculateInscriptionPower(inscription.inscriptionId)).toBe(70);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateInscriptionPower('ghost')).toBe(0);
        });
    });

    describe('listCarved', () => {
        it('should list only carved inscriptions', () => {
            const { inscription: a } = system.createInscription({});
            const { inscription: b } = system.createInscription({});
            system.carveInscription(a.inscriptionId);
            expect(system.listCarved().length).toBe(1);
            expect(system.listCarved()[0].inscriptionId).toBe(a.inscriptionId);
            expect(b.status).toBe('draft');
        });
    });

    describe('Tool System', () => {
        it('should register and list tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute custom tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should execute default getInscription tool', () => {
            const { inscription } = system.createInscription({});
            const result = system.executeTool('getInscription', { inscriptionId: inscription.inscriptionId });
            expect(result.success).toBe(true);
            expect(result.result.inscriptionId).toBe(inscription.inscriptionId);
        });

        it('should execute default createInscription tool', () => {
            const result = system.executeTool('createInscription', { inscriberId: 'i1', name: 'X', type: 'armor' });
            expect(result.success).toBe(true);
            expect(result.result.inscription.inscriberId).toBe('i1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('inscriptionCreated', () => count++);
            unregister();
            system.createInscription({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('inscriptionCreated', () => { throw new Error('x'); });
            expect(() => system.createInscription({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient inscriptions', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalInscriptions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxInscriptions).toBe(240);
        });
        it('should not double evolve', () => {
            system.stats.totalInscriptions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.createInscription({});
            system.createInscription({});
            const json = system.toJSON();
            expect(json.inscriptions.length).toBe(2);
            expect(json.stats.totalInscriptions).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.createInscription({ name: 'A' });
            const json = system.toJSON();
            const newSys = new InscriptionCrafting();
            newSys.fromJSON(json);
            expect(newSys.inscriptions.size).toBe(1);
            expect(newSys.stats.totalInscriptions).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.createInscription({});
            const stats = system.getStats();
            expect(stats.inscriptionCount).toBe(1);
            expect(stats.totalInscriptions).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
