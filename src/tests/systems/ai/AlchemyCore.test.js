/**
 * AlchemyCore.test.js - 炼丹核心管理系统测试
 * V322 Iteration 1/9 Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AlchemyCore } from '../../../systems/ai/AlchemyCore.js';

describe('AlchemyCore', () => {
    let system;
    beforeEach(() => { system = new AlchemyCore(); });

    describe('Default Pill Types', () => {
        it('should have default types', () => { expect(system.pillTypes.size).toBe(4); });
        it('should contain qi_recovery', () => { expect(system.getPillType('qi_recovery')).not.toBeNull(); });
    });

    describe('Ingredients', () => {
        it('should add', () => {
            const result = system.addIngredient('herb', 10);
            expect(result.total).toBe(10);
        });

        it('should get', () => {
            system.addIngredient('herb', 5);
            expect(system.getIngredient('herb')).toBe(5);
        });

        it('should return 0 for missing', () => { expect(system.getIngredient('ghost')).toBe(0); });

        it('should list all', () => {
            system.addIngredient('herb', 5);
            expect(system.listIngredients().length).toBe(1);
        });

        it('should trigger ingredientAdded hook', () => {
            let called = false;
            system.registerHook('ingredientAdded', () => { called = true; });
            system.addIngredient('herb', 1);
            expect(called).toBe(true);
        });
    });

    describe('registerPillType', () => {
        it('should register', () => {
            const { type } = system.registerPillType({ name: 'Custom' });
            expect(type.name).toBe('Custom');
        });

        it('should default grade to 1', () => {
            const { type } = system.registerPillType({});
            expect(type.grade).toBe(1);
        });

        it('should trigger pillTypeRegistered hook', () => {
            let called = false;
            system.registerHook('pillTypeRegistered', () => { called = true; });
            system.registerPillType({});
            expect(called).toBe(true);
        });
    });

    describe('getPillType', () => {
        it('should return', () => { expect(system.getPillType('qi_recovery')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getPillType('ghost')).toBeNull(); });
    });

    describe('listPillTypes', () => {
        it('should list all', () => { expect(system.listPillTypes().length).toBe(4); });
    });

    describe('registerAlchemist', () => {
        it('should register', () => {
            const { alchemist } = system.registerAlchemist({ name: 'A1' });
            expect(alchemist.name).toBe('A1');
        });

        it('should default skill to 1', () => {
            const { alchemist } = system.registerAlchemist({});
            expect(alchemist.skill).toBe(1);
        });
    });

    describe('getAlchemist', () => {
        it('should return', () => {
            const { alchemist } = system.registerAlchemist({});
            expect(system.getAlchemist(alchemist.alchemistId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAlchemist('ghost')).toBeNull(); });
    });

    describe('listAlchemists', () => {
        it('should list all', () => {
            system.registerAlchemist({});
            expect(system.listAlchemists().length).toBe(1);
        });
    });

    describe('startBrewing', () => {
        it('should start', () => {
            const { alchemist } = system.registerAlchemist({});
            const result = system.startBrewing(alchemist.alchemistId, 'qi_recovery');
            expect(result.success).toBe(true);
        });

        it('should reject missing alchemist', () => {
            const result = system.startBrewing('ghost', 'qi_recovery');
            expect(result.error).toBe('ALCHEMIST_NOT_FOUND');
        });

        it('should reject missing pill type', () => {
            const { alchemist } = system.registerAlchemist({});
            const result = system.startBrewing(alchemist.alchemistId, 'ghost');
            expect(result.error).toBe('PILL_TYPE_NOT_FOUND');
        });

        it('should reject insufficient ingredients', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').recipe = { herb: 5 };
            const { alchemist } = sys.registerAlchemist({});
            const result = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            expect(result.error).toBe('INSUFFICIENT_INGREDIENTS');
        });

        it('should deduct ingredients', () => {
            system.addIngredient('herb', 5);
            system.pillTypes.get('qi_recovery').recipe = { herb: 2 };
            const { alchemist } = system.registerAlchemist({});
            system.startBrewing(alchemist.alchemistId, 'qi_recovery');
            expect(system.getIngredient('herb')).toBe(3);
        });

        it('should trigger brewingStarted hook', () => {
            const { alchemist } = system.registerAlchemist({});
            let called = false;
            system.registerHook('brewingStarted', () => { called = true; });
            system.startBrewing(alchemist.alchemistId, 'qi_recovery');
            expect(called).toBe(true);
        });

        it('should increment totalSessions', () => {
            const { alchemist } = system.registerAlchemist({});
            system.startBrewing(alchemist.alchemistId, 'qi_recovery');
            expect(system.stats.totalSessions).toBe(1);
        });
    });

    describe('advanceBrewing', () => {
        it('should advance', () => {
            const { alchemist } = system.registerAlchemist({});
            const { session } = system.startBrewing(alchemist.alchemistId, 'qi_recovery');
            const result = system.advanceBrewing(session.sessionId, 10);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.advanceBrewing('ghost', 10);
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { alchemist } = system.registerAlchemist({});
            const { session } = system.startBrewing(alchemist.alchemistId, 'qi_recovery');
            session.status = 'completed';
            const result = system.advanceBrewing(session.sessionId, 10);
            expect(result.error).toBe('SESSION_INACTIVE');
        });
    });

    describe('completeBrewing', () => {
        it('should attempt to complete', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0; // Force success
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            const result = sys.completeBrewing(session.sessionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.completeBrewing('ghost');
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { alchemist } = system.registerAlchemist({});
            const { session } = system.startBrewing(alchemist.alchemistId, 'qi_recovery');
            session.status = 'completed';
            const result = system.completeBrewing(session.sessionId);
            expect(result.error).toBe('SESSION_INACTIVE');
        });

        it('should create pill on success', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0;
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            sys.completeBrewing(session.sessionId);
            expect(sys.pills.size).toBe(1);
        });

        it('should increment totalPills on success', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0;
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            sys.completeBrewing(session.sessionId);
            expect(sys.stats.totalPills).toBe(1);
        });

        it('should trigger brewingCompleted hook on success', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0;
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            let called = false;
            sys.registerHook('brewingCompleted', () => { called = true; });
            sys.completeBrewing(session.sessionId);
            expect(called).toBe(true);
        });

        it('should trigger brewingFailed hook on failure', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = -10; // Force failure
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            let called = false;
            sys.registerHook('brewingFailed', () => { called = true; });
            sys.completeBrewing(session.sessionId);
            expect(called).toBe(true);
        });
    });

    describe('getPill', () => {
        it('should return', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0;
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            const { pill } = sys.completeBrewing(session.sessionId);
            expect(sys.getPill(pill.pillId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getPill('ghost')).toBeNull(); });
    });

    describe('listPills', () => {
        it('should list all', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0;
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            sys.completeBrewing(session.sessionId);
            expect(sys.listPills().length).toBe(1);
        });
    });

    describe('consumePill', () => {
        it('should consume', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0;
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            const { pill } = sys.completeBrewing(session.sessionId);
            const result = sys.consumePill(pill.pillId, 'c1');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.consumePill('ghost', 'c1');
            expect(result.error).toBe('PILL_NOT_FOUND');
        });

        it('should remove from pills', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0;
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            const { pill } = sys.completeBrewing(session.sessionId);
            sys.consumePill(pill.pillId, 'c1');
            expect(sys.pills.size).toBe(0);
        });

        it('should trigger pillConsumed hook', () => {
            const sys = new AlchemyCore();
            sys.pillTypes.get('qi_recovery').successRate = 1.0;
            const { alchemist } = sys.registerAlchemist({});
            const { session } = sys.startBrewing(alchemist.alchemistId, 'qi_recovery');
            const { pill } = sys.completeBrewing(session.sessionId);
            let called = false;
            sys.registerHook('pillConsumed', () => { called = true; });
            sys.consumePill(pill.pillId, 'c1');
            expect(called).toBe(true);
        });
    });

    describe('Mesh Network', () => {
        it('should add node', () => {
            const result = system.addMeshNode('n1');
            expect(result.success).toBe(true);
        });

        it('should connect nodes', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshNodes('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject missing nodes', () => {
            const result = system.connectMeshNodes('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
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

        it('should execute default getPill', () => {
            const result = system.executeTool('getPill', { pillId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default listPills', () => {
            const result = system.executeTool('listPills', {});
            expect(result.result.length).toBe(0);
        });

        it('should execute default getPillType', () => {
            const result = system.executeTool('getPillType', { typeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('brewingStarted', () => count++);
            unregister();
            const { alchemist } = system.registerAlchemist({});
            system.startBrewing(alchemist.alchemistId, 'qi_recovery');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('brewingStarted', () => { throw new Error('x'); });
            const { alchemist } = system.registerAlchemist({});
            expect(() => system.startBrewing(alchemist.alchemistId, 'qi_recovery')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSessions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSessions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addIngredient('herb', 10);
            const json = system.toJSON();
            expect(json.ingredients.length).toBe(1);
        });
        it('should deserialize', () => {
            system.addIngredient('herb', 10);
            const json = system.toJSON();
            const newSys = new AlchemyCore();
            newSys.fromJSON(json);
            expect(newSys.getIngredient('herb')).toBe(10);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.typeCount).toBe(4);
        });
    });
});