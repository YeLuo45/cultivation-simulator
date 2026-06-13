/**
 * ElementalStrike.test.js - 元素攻击测试
 * V363 Iteration 6/9 Round 9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalStrike } from '../../../systems/ai/ElementalStrike.js';

describe('ElementalStrike', () => {
    let system;
    beforeEach(() => { system = new ElementalStrike(); });

    describe('registerTarget', () => {
        it('should register', () => {
            const { target } = system.registerTarget({ name: 'T1' });
            expect(target.name).toBe('T1');
        });
    });

    describe('getTarget', () => {
        it('should return', () => {
            const { target } = system.registerTarget({});
            expect(system.getTarget(target.targetId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTarget('ghost')).toBeNull(); });
    });

    describe('listTargets', () => {
        it('should list all', () => {
            system.registerTarget({});
            expect(system.listTargets().length).toBe(1);
        });
    });

    describe('executeStrike', () => {
        it('should execute', () => {
            const { target } = system.registerTarget({});
            const result = system.executeStrike('fire', target.targetId, 50);
            expect(result.success).toBe(true);
        });

        it('should reject invalid element', () => {
            const { target } = system.registerTarget({});
            const result = system.executeStrike('ghost', target.targetId);
            expect(result.error).toBe('INVALID_ELEMENT');
        });

        it('should reject missing target', () => {
            const result = system.executeStrike('fire', 'ghost');
            expect(result.error).toBe('TARGET_NOT_FOUND');
        });

        it('should reduce target hp', () => {
            const { target } = system.registerTarget({ defense: 0 });
            system.executeStrike('fire', target.targetId, 50);
            expect(target.hp).toBe(50);
        });

        it('should trigger strikeExecuted hook', () => {
            const { target } = system.registerTarget({});
            let called = false;
            system.registerHook('strikeExecuted', () => { called = true; });
            system.executeStrike('fire', target.targetId, 50);
            expect(called).toBe(true);
        });
    });

    describe('getStrike', () => {
        it('should return', () => {
            const { target } = system.registerTarget({});
            const { strike } = system.executeStrike('fire', target.targetId, 50);
            expect(system.getStrike(strike.strikeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStrike('ghost')).toBeNull(); });
    });

    describe('listStrikes', () => {
        it('should list all', () => {
            const { target } = system.registerTarget({});
            system.executeStrike('fire', target.targetId, 50);
            expect(system.listStrikes().length).toBe(1);
        });
    });

    describe('listByTarget', () => {
        it('should filter', () => {
            const { target: t1 } = system.registerTarget({});
            const { target: t2 } = system.registerTarget({});
            system.executeStrike('fire', t1.targetId, 50);
            system.executeStrike('fire', t2.targetId, 50);
            expect(system.listByTarget(t1.targetId).length).toBe(1);
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            const { target } = system.registerTarget({});
            system.executeStrike('fire', target.targetId, 50);
            system.executeStrike('water', target.targetId, 50);
            expect(system.listByElement('fire').length).toBe(1);
        });
    });

    describe('calculateTotalDamage', () => {
        it('should calculate', () => {
            const { target } = system.registerTarget({ defense: 0 });
            system.executeStrike('fire', target.targetId, 50);
            expect(system.calculateTotalDamage()).toBe(50);
        });
    });

    describe('listElements', () => {
        it('should list all', () => { expect(system.listElements().length).toBe(5); });
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

        it('should execute default getStrike', () => {
            const result = system.executeTool('getStrike', { strikeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('strikeExecuted', () => count++);
            unregister();
            const { target } = system.registerTarget({});
            system.executeStrike('fire', target.targetId, 50);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('strikeExecuted', () => { throw new Error('x'); });
            const { target } = system.registerTarget({});
            expect(() => system.executeStrike('fire', target.targetId, 50)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalStrikes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStrikes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            const { target } = system.registerTarget({});
            system.executeStrike('fire', target.targetId, 50);
            const json = system.toJSON();
            expect(json.strikes.length).toBe(1);
        });
        it('should deserialize', () => {
            const { target } = system.registerTarget({});
            system.executeStrike('fire', target.targetId, 50);
            const json = system.toJSON();
            const newSys = new ElementalStrike();
            newSys.fromJSON(json);
            expect(newSys.strikes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.strikeCount).toBe(0);
        });
    });
});