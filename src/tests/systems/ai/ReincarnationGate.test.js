/**
 * ReincarnationGate.test.js - 轮回之门测试
 * V373 Iteration 7/9 Round 10 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ReincarnationGate } from '../../../systems/ai/ReincarnationGate.js';

describe('ReincarnationGate', () => {
    let system;
    beforeEach(() => { system = new ReincarnationGate(); });

    describe('createGate', () => {
        it('should create', () => {
            const { gate } = system.createGate({ name: 'G1' });
            expect(gate.name).toBe('G1');
        });

        it('should trigger gateCreated hook', () => {
            let called = false;
            system.registerHook('gateCreated', () => { called = true; });
            system.createGate({});
            expect(called).toBe(true);
        });
    });

    describe('getGate', () => {
        it('should return', () => {
            const { gate } = system.createGate({});
            expect(system.getGate(gate.gateId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGate('ghost')).toBeNull(); });
    });

    describe('listGates', () => {
        it('should list all', () => {
            system.createGate({});
            expect(system.listGates().length).toBe(1);
        });
    });

    describe('listByRealm', () => {
        it('should filter', () => {
            system.createGate({ realm: 'immortal' });
            system.createGate({ realm: 'mortal' });
            expect(system.listByRealm('immortal').length).toBe(1);
        });
    });

    describe('openGate', () => {
        it('should open', () => {
            const { gate } = system.createGate({});
            const result = system.openGate(gate.gateId);
            expect(gate.openings).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.openGate('ghost');
            expect(result.error).toBe('GATE_NOT_FOUND');
        });

        it('should trigger gateOpened hook', () => {
            const { gate } = system.createGate({});
            let called = false;
            system.registerHook('gateOpened', () => { called = true; });
            system.openGate(gate.gateId);
            expect(called).toBe(true);
        });
    });

    describe('closeGate', () => {
        it('should close', () => {
            const { gate } = system.createGate({});
            const result = system.closeGate(gate.gateId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.closeGate('ghost');
            expect(result.error).toBe('GATE_NOT_FOUND');
        });

        it('should trigger gateClosed hook', () => {
            const { gate } = system.createGate({});
            let called = false;
            system.registerHook('gateClosed', () => { called = true; });
            system.closeGate(gate.gateId);
            expect(called).toBe(true);
        });
    });

    describe('destroyGate', () => {
        it('should destroy', () => {
            const { gate } = system.createGate({});
            const result = system.destroyGate(gate.gateId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.destroyGate('ghost');
            expect(result.error).toBe('GATE_NOT_FOUND');
        });

        it('should trigger gateDestroyed hook', () => {
            const { gate } = system.createGate({});
            let called = false;
            system.registerHook('gateDestroyed', () => { called = true; });
            system.destroyGate(gate.gateId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalOpenings', () => {
        it('should calculate', () => {
            const { gate: g1 } = system.createGate({});
            const { gate: g2 } = system.createGate({});
            system.openGate(g1.gateId);
            system.openGate(g1.gateId);
            system.openGate(g2.gateId);
            expect(system.calculateTotalOpenings()).toBe(3);
        });
    });

    describe('listOpenGates', () => {
        it('should filter', () => {
            const { gate: g1 } = system.createGate({});
            system.createGate({});
            system.openGate(g1.gateId);
            expect(system.listOpenGates().length).toBe(1);
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
            const unregister = system.registerHook('gateCreated', () => count++);
            unregister();
            system.createGate({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('gateCreated', () => { throw new Error('x'); });
            expect(() => system.createGate({})).not.toThrow();
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
            system.createGate({});
            const json = system.toJSON();
            expect(json.gates.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createGate({});
            const json = system.toJSON();
            const newSys = new ReincarnationGate();
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