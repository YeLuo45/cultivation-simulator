/**
 * CultivationGate.test.js - 修真闸系统测试
 * V754 Iteration 17/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGate } from '../../../systems/ai/CultivationGate.js';

describe('CultivationGate', () => {
    let system;
    beforeEach(() => { system = new CultivationGate(); });

    describe('recruitGate', () => {
        it('should recruit gate', () => {
            const { gate } = system.recruitGate({ masterId: 'm1', name: 'Heavenly Gate', type: 'celestial' });
            expect(gate.masterId).toBe('m1');
            expect(gate.name).toBe('Heavenly Gate');
            expect(gate.type).toBe('celestial');
        });

        it('should default type to small', () => {
            const { gate } = system.recruitGate({});
            expect(gate.type).toBe('small');
        });

        it('should default name to Unnamed Gate', () => {
            const { gate } = system.recruitGate({});
            expect(gate.name).toBe('Unnamed Gate');
        });

        it('should default authority to baseAuthority', () => {
            const { gate } = system.recruitGate({});
            expect(gate.authority).toBe(20);
        });

        it('should start at level 1', () => {
            const { gate } = system.recruitGate({});
            expect(gate.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { gate } = system.recruitGate({});
            expect(gate.status).toBe('novice');
        });

        it('should start with empty bars', () => {
            const { gate } = system.recruitGate({});
            expect(gate.bars).toEqual([]);
        });

        it('should generate gateId', () => {
            const { gate } = system.recruitGate({});
            expect(gate.gateId).toBeDefined();
            expect(typeof gate.gateId).toBe('string');
        });

        it('should accept custom gateId', () => {
            const { gate } = system.recruitGate({ gateId: 'my-gate' });
            expect(gate.gateId).toBe('my-gate');
        });

        it('should support all types', () => {
            const { gate: g1 } = system.recruitGate({ type: 'small' });
            const { gate: g2 } = system.recruitGate({ type: 'grand' });
            const { gate: g3 } = system.recruitGate({ type: 'celestial' });
            expect(g1.type).toBe('small');
            expect(g2.type).toBe('grand');
            expect(g3.type).toBe('celestial');
        });

        it('should trigger gateRecruited hook', () => {
            let called = false;
            system.registerHook('gateRecruited', () => { called = true; });
            system.recruitGate({});
            expect(called).toBe(true);
        });
    });

    describe('getGate', () => {
        it('should return gate', () => {
            const { gate } = system.recruitGate({});
            expect(system.getGate(gate.gateId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGate('ghost')).toBeNull(); });
    });

    describe('listGates', () => {
        it('should list all', () => {
            system.recruitGate({});
            system.recruitGate({});
            expect(system.listGates().length).toBe(2);
        });

        it('should return empty when no gates', () => {
            expect(system.listGates().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitGate({ masterId: 'm1' });
            system.recruitGate({ masterId: 'm2' });
            system.recruitGate({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitGate({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { gate: g1 } = system.recruitGate({});
            const { gate: g2 } = system.recruitGate({});
            system.legendGate(g1.gateId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].gateId).toBe(g1.gateId);
        });

        it('should return empty when none legendary', () => {
            system.recruitGate({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addBar', () => {
        it('should add bar', () => {
            const { gate } = system.recruitGate({});
            system.addBar(gate.gateId, 'iron-bar');
            expect(gate.bars).toContain('iron-bar');
            expect(gate.bars.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addBar('ghost', 'bar');
            expect(result.error).toBe('GATE_NOT_FOUND');
        });

        it('should trigger barAdded hook', () => {
            const { gate } = system.recruitGate({});
            let called = false;
            system.registerHook('barAdded', () => { called = true; });
            system.addBar(gate.gateId, 'bar');
            expect(called).toBe(true);
        });

        it('should add multiple bars', () => {
            const { gate } = system.recruitGate({});
            system.addBar(gate.gateId, 'bar1');
            system.addBar(gate.gateId, 'bar2');
            expect(gate.bars.length).toBe(2);
        });
    });

    describe('raiseAuthority', () => {
        it('should raise authority', () => {
            const { gate } = system.recruitGate({});
            system.raiseAuthority(gate.gateId, 10);
            expect(gate.authority).toBe(30);
        });

        it('should default amount to 5', () => {
            const { gate } = system.recruitGate({});
            system.raiseAuthority(gate.gateId);
            expect(gate.authority).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseAuthority('ghost', 10);
            expect(result.error).toBe('GATE_NOT_FOUND');
        });

        it('should trigger authorityRaised hook', () => {
            const { gate } = system.recruitGate({});
            let called = false;
            system.registerHook('authorityRaised', () => { called = true; });
            system.raiseAuthority(gate.gateId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGate', () => {
        it('should level up', () => {
            const { gate } = system.recruitGate({});
            system.levelUpGate(gate.gateId);
            expect(gate.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpGate('ghost');
            expect(result.error).toBe('GATE_NOT_FOUND');
        });

        it('should trigger gateLeveledUp hook', () => {
            const { gate } = system.recruitGate({});
            let called = false;
            system.registerHook('gateLeveledUp', () => { called = true; });
            system.levelUpGate(gate.gateId);
            expect(called).toBe(true);
        });
    });

    describe('legendGate', () => {
        it('should set status to legendary', () => {
            const { gate } = system.recruitGate({});
            system.legendGate(gate.gateId);
            expect(gate.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendGate('ghost');
            expect(result.error).toBe('GATE_NOT_FOUND');
        });

        it('should trigger gateLegendized hook', () => {
            const { gate } = system.recruitGate({});
            let called = false;
            system.registerHook('gateLegendized', () => { called = true; });
            system.legendGate(gate.gateId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitGate({ type: 'small' });
            system.recruitGate({ type: 'grand' });
            system.recruitGate({ type: 'celestial' });
            expect(system.listByType('grand').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitGate({ type: 'small' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran gates', () => {
            system.recruitGate({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateGateValue', () => {
        it('should calculate for default gate', () => {
            const { gate } = system.recruitGate({});
            // level 1 * 100 + authority 20 * 2 + 0 bars * 30 = 100 + 40 + 0 = 140
            expect(system.calculateGateValue(gate.gateId)).toBe(140);
        });

        it('should incorporate level, authority, and bars', () => {
            const { gate } = system.recruitGate({});
            system.levelUpGate(gate.gateId); // level 2
            system.raiseAuthority(gate.gateId, 10); // authority 30
            system.addBar(gate.gateId, 'bar1'); // 1 bar
            system.addBar(gate.gateId, 'bar2'); // 2 bars
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateGateValue(gate.gateId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGateValue('ghost')).toBe(0);
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

        it('should execute default getGate', () => {
            const result = system.executeTool('getGate', { gateId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('gateRecruited', () => count++);
            unregister();
            system.recruitGate({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('gateRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGate({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGates = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGates = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitGate({});
            const json = system.toJSON();
            expect(json.gates.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitGate({});
            const json = system.toJSON();
            const newSys = new CultivationGate();
            newSys.fromJSON(json);
            expect(newSys.gates.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.gateCount).toBe(0);
        });
    });
});
