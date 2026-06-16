/**
 * CultivationPhantasm.test.js - 修真幻影系统测试
 * V771 Iteration 4/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPhantasm } from '../../../systems/ai/CultivationPhantasm.js';

describe('CultivationPhantasm', () => {
    let system;
    beforeEach(() => { system = new CultivationPhantasm(); });

    describe('recruitPhantasm', () => {
        it('should recruit with given fields', () => {
            const { phantasm } = system.recruitPhantasm({ masterId: 'm1', name: 'Shadow Wraith', type: 'shadow' });
            expect(phantasm.masterId).toBe('m1');
            expect(phantasm.name).toBe('Shadow Wraith');
            expect(phantasm.type).toBe('shadow');
        });

        it('should default type to ghost and strength to 20', () => {
            const { phantasm } = system.recruitPhantasm({ masterId: 'm1' });
            expect(phantasm.type).toBe('ghost');
            expect(phantasm.strength).toBe(20);
            expect(phantasm.level).toBe(1);
            expect(phantasm.status).toBe('novice');
            expect(phantasm.shapes).toEqual([]);
        });

        it('should generate a phantasmId when not provided', () => {
            const { phantasm } = system.recruitPhantasm({});
            expect(phantasm.phantasmId).toBeTruthy();
            expect(typeof phantasm.phantasmId).toBe('string');
        });

        it('should trigger phantasmRecruited hook', () => {
            let called = false;
            system.registerHook('phantasmRecruited', () => { called = true; });
            system.recruitPhantasm({});
            expect(called).toBe(true);
        });

        it('should increment totalPhantasms stat', () => {
            system.recruitPhantasm({});
            system.recruitPhantasm({});
            expect(system.stats.totalPhantasms).toBe(2);
        });
    });

    describe('getPhantasm', () => {
        it('should return phantasm copy', () => {
            const { phantasm } = system.recruitPhantasm({});
            const found = system.getPhantasm(phantasm.phantasmId);
            expect(found).not.toBeNull();
            expect(found.phantasmId).toBe(phantasm.phantasmId);
        });
        it('should return null for missing', () => { expect(system.getPhantasm('ghost')).toBeNull(); });
    });

    describe('listPhantasms', () => {
        it('should list all phantasms', () => {
            system.recruitPhantasm({});
            system.recruitPhantasm({});
            system.recruitPhantasm({});
            expect(system.listPhantasms().length).toBe(3);
        });

        it('should return empty list when no phantasms', () => {
            expect(system.listPhantasms().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitPhantasm({ masterId: 'm1' });
            system.recruitPhantasm({ masterId: 'm2' });
            system.recruitPhantasm({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary phantasms', () => {
            const { phantasm: a } = system.recruitPhantasm({});
            const { phantasm: b } = system.recruitPhantasm({});
            system.legendPhantasm(a.phantasmId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].phantasmId).toBe(a.phantasmId);
            expect(b.status).toBe('novice');
        });
    });

    describe('addShape', () => {
        it('should add a shape to phantasm', () => {
            const { phantasm } = system.recruitPhantasm({});
            const result = system.addShape(phantasm.phantasmId, 'wolf');
            expect(result.success).toBe(true);
            expect(phantasm.shapes).toContain('wolf');
        });

        it('should add multiple shapes', () => {
            const { phantasm } = system.recruitPhantasm({});
            system.addShape(phantasm.phantasmId, 'wolf');
            system.addShape(phantasm.phantasmId, 'mist');
            expect(phantasm.shapes.length).toBe(2);
            expect(phantasm.shapes).toEqual(['wolf', 'mist']);
        });

        it('should reject missing phantasm', () => {
            const result = system.addShape('ghost', 'wolf');
            expect(result.error).toBe('PHANTASM_NOT_FOUND');
        });

        it('should trigger shapeAdded hook', () => {
            const { phantasm } = system.recruitPhantasm({});
            let called = false;
            system.registerHook('shapeAdded', () => { called = true; });
            system.addShape(phantasm.phantasmId, 'raven');
            expect(called).toBe(true);
        });
    });

    describe('raiseStrength', () => {
        it('should raise strength by default 5', () => {
            const { phantasm } = system.recruitPhantasm({});
            system.raiseStrength(phantasm.phantasmId);
            expect(phantasm.strength).toBe(25);
        });

        it('should raise strength by custom amount', () => {
            const { phantasm } = system.recruitPhantasm({});
            system.raiseStrength(phantasm.phantasmId, 30);
            expect(phantasm.strength).toBe(50);
        });

        it('should reject missing phantasm', () => {
            const result = system.raiseStrength('ghost', 10);
            expect(result.error).toBe('PHANTASM_NOT_FOUND');
        });

        it('should trigger strengthRaised hook', () => {
            const { phantasm } = system.recruitPhantasm({});
            let called = false;
            system.registerHook('strengthRaised', () => { called = true; });
            system.raiseStrength(phantasm.phantasmId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPhantasm', () => {
        it('should increase level by 1', () => {
            const { phantasm } = system.recruitPhantasm({});
            system.levelUpPhantasm(phantasm.phantasmId);
            expect(phantasm.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { phantasm } = system.recruitPhantasm({});
            system.levelUpPhantasm(phantasm.phantasmId);
            system.levelUpPhantasm(phantasm.phantasmId);
            system.levelUpPhantasm(phantasm.phantasmId);
            expect(phantasm.level).toBe(4);
        });

        it('should reject missing phantasm', () => {
            const result = system.levelUpPhantasm('ghost');
            expect(result.error).toBe('PHANTASM_NOT_FOUND');
        });

        it('should trigger phantasmLeveledUp hook', () => {
            const { phantasm } = system.recruitPhantasm({});
            let called = false;
            system.registerHook('phantasmLeveledUp', () => { called = true; });
            system.levelUpPhantasm(phantasm.phantasmId);
            expect(called).toBe(true);
        });
    });

    describe('legendPhantasm', () => {
        it('should set status to legendary', () => {
            const { phantasm } = system.recruitPhantasm({});
            system.legendPhantasm(phantasm.phantasmId);
            expect(phantasm.status).toBe('legendary');
        });

        it('should reject missing phantasm', () => {
            const result = system.legendPhantasm('ghost');
            expect(result.error).toBe('PHANTASM_NOT_FOUND');
        });

        it('should trigger phantasmLegendized hook', () => {
            const { phantasm } = system.recruitPhantasm({});
            let called = false;
            system.registerHook('phantasmLegendized', () => { called = true; });
            system.legendPhantasm(phantasm.phantasmId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePhantasmValue', () => {
        it('should calculate value with default stats', () => {
            const { phantasm } = system.recruitPhantasm({});
            // level=1 * 100 + strength=20 * 2 + shapes=0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculatePhantasmValue(phantasm.phantasmId)).toBe(140);
        });

        it('should calculate value with shapes and leveled up', () => {
            const { phantasm } = system.recruitPhantasm({});
            system.levelUpPhantasm(phantasm.phantasmId);
            system.levelUpPhantasm(phantasm.phantasmId);
            system.addShape(phantasm.phantasmId, 'wolf');
            system.addShape(phantasm.phantasmId, 'mist');
            system.raiseStrength(phantasm.phantasmId, 10);
            // level=3 * 100 + strength=30 * 2 + shapes=2 * 30 = 300 + 60 + 60 = 420
            expect(system.calculatePhantasmValue(phantasm.phantasmId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePhantasmValue('ghost')).toBe(0);
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

        it('should execute default getPhantasm tool', () => {
            const { phantasm } = system.recruitPhantasm({});
            const result = system.executeTool('getPhantasm', { phantasmId: phantasm.phantasmId });
            expect(result.success).toBe(true);
            expect(result.result.phantasmId).toBe(phantasm.phantasmId);
        });

        it('should execute default recruitPhantasm tool', () => {
            const result = system.executeTool('recruitPhantasm', { masterId: 'm1', name: 'X', type: 'illusion' });
            expect(result.success).toBe(true);
            expect(result.result.phantasm.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('phantasmRecruited', () => count++);
            unregister();
            system.recruitPhantasm({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('phantasmRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPhantasm({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient phantasms', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalPhantasms = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxPhantasms).toBe(35);
        });
        it('should not double evolve', () => {
            system.stats.totalPhantasms = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitPhantasm({});
            system.recruitPhantasm({});
            const json = system.toJSON();
            expect(json.phantasms.length).toBe(2);
            expect(json.stats.totalPhantasms).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitPhantasm({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationPhantasm();
            newSys.fromJSON(json);
            expect(newSys.phantasms.size).toBe(1);
            expect(newSys.stats.totalPhantasms).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitPhantasm({});
            const stats = system.getStats();
            expect(stats.phantasmCount).toBe(1);
            expect(stats.totalPhantasms).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
