/**
 * CorpseRefining.test.js - 炼尸系统测试
 * V451 Iteration 13/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CorpseRefining } from '../../../systems/ai/CorpseRefining.js';

describe('CorpseRefining', () => {
    let system;
    beforeEach(() => { system = new CorpseRefining(); });

    describe('collectCorpse', () => {
        it('should collect a corpse', () => {
            const { corpse } = system.collectCorpse({ refinerId: 'r1', name: 'Zombie', origin: 'graveyard' });
            expect(corpse.name).toBe('Zombie');
            expect(corpse.refinerId).toBe('r1');
        });

        it('should set default name and origin', () => {
            const { corpse } = system.collectCorpse({});
            expect(corpse.name).toBe('Unnamed Corpse');
            expect(corpse.origin).toBe('unknown');
        });

        it('should use baseFerocity default', () => {
            const { corpse } = system.collectCorpse({});
            expect(corpse.ferocity).toBe(20);
        });

        it('should use default durability 50', () => {
            const { corpse } = system.collectCorpse({});
            expect(corpse.durability).toBe(50);
        });

        it('should start with status raw', () => {
            const { corpse } = system.collectCorpse({});
            expect(corpse.status).toBe('raw');
        });

        it('should start with empty bodyParts', () => {
            const { corpse } = system.collectCorpse({});
            expect(corpse.bodyParts).toEqual([]);
        });

        it('should trigger corpseCollected hook', () => {
            let called = false;
            system.registerHook('corpseCollected', () => { called = true; });
            system.collectCorpse({});
            expect(called).toBe(true);
        });

        it('should reject when max reached', () => {
            const small = new CorpseRefining({ maxCorpses: 2 });
            small.collectCorpse({});
            small.collectCorpse({});
            const result = small.collectCorpse({});
            expect(result.error).toBe('MAX_CORPSES_REACHED');
        });
    });

    describe('getCorpse', () => {
        it('should return a corpse', () => {
            const { corpse } = system.collectCorpse({});
            expect(system.getCorpse(corpse.corpseId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getCorpse('ghost')).toBeNull();
        });
    });

    describe('listCorpses', () => {
        it('should list all', () => {
            system.collectCorpse({});
            system.collectCorpse({});
            expect(system.listCorpses().length).toBe(2);
        });
    });

    describe('listByRefiner', () => {
        it('should filter by refinerId', () => {
            system.collectCorpse({ refinerId: 'r1' });
            system.collectCorpse({ refinerId: 'r2' });
            expect(system.listByRefiner('r1').length).toBe(1);
        });
    });

    describe('listByOrigin', () => {
        it('should filter by origin', () => {
            system.collectCorpse({ origin: 'graveyard' });
            system.collectCorpse({ origin: 'battlefield' });
            expect(system.listByOrigin('graveyard').length).toBe(1);
        });
    });

    describe('refineCorpse', () => {
        it('should increase durability', () => {
            const { corpse } = system.collectCorpse({});
            system.refineCorpse(corpse.corpseId, 10);
            expect(corpse.durability).toBe(60);
        });

        it('should use default amount 5', () => {
            const { corpse } = system.collectCorpse({});
            system.refineCorpse(corpse.corpseId);
            expect(corpse.durability).toBe(55);
        });

        it('should change status to refined at 100 durability', () => {
            const { corpse } = system.collectCorpse({ durability: 95 });
            system.refineCorpse(corpse.corpseId, 10);
            expect(corpse.status).toBe('refined');
        });

        it('should not downgrade status once refined', () => {
            const { corpse } = system.collectCorpse({ durability: 100 });
            corpse.status = 'refined';
            system.refineCorpse(corpse.corpseId, 5);
            expect(corpse.status).toBe('refined');
        });

        it('should reject missing corpse', () => {
            const result = system.refineCorpse('ghost', 5);
            expect(result.error).toBe('CORPSE_NOT_FOUND');
        });

        it('should trigger corpseRefined hook', () => {
            const { corpse } = system.collectCorpse({});
            let called = false;
            system.registerHook('corpseRefined', () => { called = true; });
            system.refineCorpse(corpse.corpseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('increaseFerocity', () => {
        it('should increase ferocity', () => {
            const { corpse } = system.collectCorpse({});
            system.increaseFerocity(corpse.corpseId, 10);
            expect(corpse.ferocity).toBe(30);
        });

        it('should use default amount 2', () => {
            const { corpse } = system.collectCorpse({});
            system.increaseFerocity(corpse.corpseId);
            expect(corpse.ferocity).toBe(22);
        });

        it('should reject missing corpse', () => {
            const result = system.increaseFerocity('ghost', 5);
            expect(result.error).toBe('CORPSE_NOT_FOUND');
        });

        it('should trigger ferocityIncreased hook', () => {
            const { corpse } = system.collectCorpse({});
            let called = false;
            system.registerHook('ferocityIncreased', () => { called = true; });
            system.increaseFerocity(corpse.corpseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addPart', () => {
        it('should add a body part', () => {
            const { corpse } = system.collectCorpse({});
            system.addPart(corpse.corpseId, 'left_arm');
            expect(corpse.bodyParts).toContain('left_arm');
        });

        it('should add multiple parts', () => {
            const { corpse } = system.collectCorpse({});
            system.addPart(corpse.corpseId, 'arm');
            system.addPart(corpse.corpseId, 'leg');
            expect(corpse.bodyParts.length).toBe(2);
        });

        it('should reject missing corpse', () => {
            const result = system.addPart('ghost', 'arm');
            expect(result.error).toBe('CORPSE_NOT_FOUND');
        });
    });

    describe('animateCorpse', () => {
        it('should set status to animated', () => {
            const { corpse } = system.collectCorpse({});
            system.animateCorpse(corpse.corpseId);
            expect(corpse.status).toBe('animated');
        });

        it('should reject missing corpse', () => {
            const result = system.animateCorpse('ghost');
            expect(result.error).toBe('CORPSE_NOT_FOUND');
        });

        it('should trigger corpseAnimated hook', () => {
            const { corpse } = system.collectCorpse({});
            let called = false;
            system.registerHook('corpseAnimated', () => { called = true; });
            system.animateCorpse(corpse.corpseId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCorpsePower', () => {
        it('should calculate power with no parts', () => {
            const { corpse } = system.collectCorpse({ ferocity: 50, durability: 100 });
            // 50 * (100/100) + 0 * 5 = 50
            expect(system.calculateCorpsePower(corpse.corpseId)).toBeCloseTo(50, 5);
        });

        it('should calculate power with body parts', () => {
            const { corpse } = system.collectCorpse({ ferocity: 30, durability: 50 });
            system.addPart(corpse.corpseId, 'arm');
            system.addPart(corpse.corpseId, 'leg');
            // 30 * (50/100) + 2 * 5 = 15 + 10 = 25
            expect(system.calculateCorpsePower(corpse.corpseId)).toBeCloseTo(25, 5);
        });

        it('should return 0 for missing corpse', () => {
            expect(system.calculateCorpsePower('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default collectCorpse tool', () => {
            const result = system.executeTool('collectCorpse', { name: 'Toolz', origin: 'test' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('corpseCollected', () => count++);
            unregister();
            system.collectCorpse({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('corpseCollected', () => { throw new Error('x'); });
            expect(() => system.collectCorpse({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient corpses', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when threshold met', () => {
            system.stats.totalCorpses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalCorpses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.collectCorpse({});
            const json = system.toJSON();
            expect(json.corpses.length).toBe(1);
        });

        it('should deserialize', () => {
            system.collectCorpse({});
            const json = system.toJSON();
            const newSys = new CorpseRefining();
            newSys.fromJSON(json);
            expect(newSys.corpses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.corpseCount).toBe(0);
        });
    });
});
