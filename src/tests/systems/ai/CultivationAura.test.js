/**
 * CultivationAura.test.js - 修真灵气测试
 * V707 Iteration 30/30 FINAL Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAura } from '../../../systems/ai/CultivationAura.js';

describe('CultivationAura', () => {
    let system;
    beforeEach(() => { system = new CultivationAura(); });

    describe('emitAura', () => {
        it('should emit', () => {
            const { aura } = system.emitAura({ name: 'Divine' });
            expect(aura.name).toBe('Divine');
        });
        it('should set initial metrics', () => {
            const { aura } = system.emitAura({});
            expect(system.getMetrics(aura.auraId)).not.toBeNull();
        });
        it('should trigger auraEmitted hook', () => {
            let called = false;
            system.registerHook('auraEmitted', () => { called = true; });
            system.emitAura({});
            expect(called).toBe(true);
        });
    });

    describe('getAura', () => {
        it('should return', () => {
            const { aura } = system.emitAura({});
            expect(system.getAura(aura.auraId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAura('ghost')).toBeNull(); });
    });

    describe('listAuras', () => {
        it('should list all', () => {
            system.emitAura({});
            expect(system.listAuras().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.emitAura({ type: 'spirit' });
            system.emitAura({ type: 'divine' });
            expect(system.listByType('spirit').length).toBe(1);
        });
    });

    describe('listBySource', () => {
        it('should filter', () => {
            system.emitAura({ sourceId: 's1' });
            system.emitAura({ sourceId: 's2' });
            expect(system.listBySource('s1').length).toBe(1);
        });
    });

    describe('listByLevel', () => {
        it('should filter', () => {
            system.emitAura({});
            expect(system.listByLevel(1).length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.emitAura({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.emitAura({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { aura } = system.emitAura({});
            const result = system.setMetrics(aura.auraId, { resonance: 99 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('AURA_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { aura } = system.emitAura({});
            expect(system.getMetrics(aura.auraId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshAura', () => {
        it('should refresh', () => {
            const { aura } = system.emitAura({});
            const result = system.refreshAura(aura.auraId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshAura('ghost');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger auraRefreshed hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('auraRefreshed', () => { called = true; });
            system.refreshAura(aura.auraId);
            expect(called).toBe(true);
        });
    });

    describe('amplifyResonance', () => {
        it('should amplify', () => {
            const { aura } = system.emitAura({});
            system.amplifyResonance(aura.auraId, 5);
            expect(aura.resonance).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.amplifyResonance('ghost', 5);
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger resonanceAmplified hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('resonanceAmplified', () => { called = true; });
            system.amplifyResonance(aura.auraId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addEmanation', () => {
        it('should add', () => {
            const { aura } = system.emitAura({});
            system.addEmanation(aura.auraId, 'halo');
            expect(aura.emanations.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addEmanation('ghost', 'halo');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger emanationAdded hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('emanationAdded', () => { called = true; });
            system.addEmanation(aura.auraId, 'halo');
            expect(called).toBe(true);
        });
    });

    describe('promoteAura', () => {
        it('should promote', () => {
            const { aura } = system.emitAura({});
            system.promoteAura(aura.auraId);
            expect(aura.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteAura('ghost');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger auraPromoted hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('auraPromoted', () => { called = true; });
            system.promoteAura(aura.auraId);
            expect(called).toBe(true);
        });
    });

    describe('concentrateAura', () => {
        it('should concentrate', () => {
            const { aura } = system.emitAura({});
            system.concentrateAura(aura.auraId);
            expect(aura.status).toBe('concentrated');
        });

        it('should reject missing', () => {
            const result = system.concentrateAura('ghost');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger auraConcentrated hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('auraConcentrated', () => { called = true; });
            system.concentrateAura(aura.auraId);
            expect(called).toBe(true);
        });
    });

    describe('projectAura', () => {
        it('should project', () => {
            const { aura } = system.emitAura({});
            system.projectAura(aura.auraId);
            expect(aura.status).toBe('projecting');
        });

        it('should reject missing', () => {
            const result = system.projectAura('ghost');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger auraProjected hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('auraProjected', () => { called = true; });
            system.projectAura(aura.auraId);
            expect(called).toBe(true);
        });
    });

    describe('legendAura', () => {
        it('should legend', () => {
            const { aura } = system.emitAura({});
            system.legendAura(aura.auraId);
            expect(aura.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAura('ghost');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger auraLegendized hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('auraLegendized', () => { called = true; });
            system.legendAura(aura.auraId);
            expect(called).toBe(true);
        });
    });

    describe('shiftType', () => {
        it('should shift', () => {
            const { aura } = system.emitAura({});
            system.shiftType(aura.auraId, 'divine');
            expect(aura.type).toBe('divine');
        });

        it('should reject missing', () => {
            const result = system.shiftType('ghost', 'divine');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger typeShifted hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('typeShifted', () => { called = true; });
            system.shiftType(aura.auraId, 'divine');
            expect(called).toBe(true);
        });
    });

    describe('calculateAuraValue', () => {
        it('should calculate', () => {
            const { aura } = system.emitAura({});
            expect(system.calculateAuraValue(aura.auraId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAuraValue('ghost')).toBe(0);
        });
    });

    describe('mergeAuras', () => {
        it('should merge', () => {
            const a = system.emitAura({}).aura;
            const b = system.emitAura({}).aura;
            const result = system.mergeAuras(a.auraId, b.auraId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.mergeAuras('ghost', 'ghost2');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger aurasMerged hook', () => {
            const a = system.emitAura({}).aura;
            const b = system.emitAura({}).aura;
            let called = false;
            system.registerHook('aurasMerged', () => { called = true; });
            system.mergeAuras(a.auraId, b.auraId);
            expect(called).toBe(true);
        });
    });

    describe('deleteAura', () => {
        it('should delete', () => {
            const { aura } = system.emitAura({});
            const result = system.deleteAura(aura.auraId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteAura('ghost');
            expect(result.error).toBe('AURA_NOT_FOUND');
        });

        it('should trigger auraDeleted hook', () => {
            const { aura } = system.emitAura({});
            let called = false;
            system.registerHook('auraDeleted', () => { called = true; });
            system.deleteAura(aura.auraId);
            expect(called).toBe(true);
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

        it('should execute default listByType', () => {
            system.emitAura({ type: 'spirit' });
            const result = system.executeTool('listByType', { type: 'spirit' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('auraEmitted', () => count++);
            unregister();
            system.emitAura({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('auraEmitted', () => { throw new Error('x'); });
            expect(() => system.emitAura({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAuras = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAuras = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.emitAura({});
            const json = system.toJSON();
            expect(json.auras.length).toBe(1);
        });
        it('should deserialize', () => {
            system.emitAura({});
            const json = system.toJSON();
            const newSys = new CultivationAura();
            newSys.fromJSON(json);
            expect(newSys.auras.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.auraCount).toBe(0);
        });
    });
});