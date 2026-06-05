/**
 * ReputationSystem.test.js - 声望系统测试
 * V344 Iteration 5/9 Round 7 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ReputationSystem } from '../../../systems/ai/ReputationSystem.js';

describe('ReputationSystem', () => {
    let system;
    beforeEach(() => { system = new ReputationSystem(); });

    describe('registerFaction', () => {
        it('should register', () => {
            const { faction } = system.registerFaction({ name: 'F1' });
            expect(faction.name).toBe('F1');
        });
    });

    describe('getFaction', () => {
        it('should return', () => {
            const { faction } = system.registerFaction({});
            expect(system.getFaction(faction.factionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFaction('ghost')).toBeNull(); });
    });

    describe('listFactions', () => {
        it('should list all', () => {
            system.registerFaction({});
            expect(system.listFactions().length).toBe(1);
        });
    });

    describe('registerCultivator', () => {
        it('should register', () => {
            const { cultivator } = system.registerCultivator({ name: 'C1' });
            expect(cultivator.name).toBe('C1');
        });

        it('should start as novice', () => {
            const { cultivator } = system.registerCultivator({});
            expect(cultivator.rank).toBe('novice');
        });

        it('should add to faction', () => {
            const { faction } = system.registerFaction({});
            const { cultivator } = system.registerCultivator({ factionId: faction.factionId });
            expect(cultivator.factionId).toBe(faction.factionId);
        });
    });

    describe('getCultivator', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getCultivator(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivator('ghost')).toBeNull(); });
    });

    describe('listCultivators', () => {
        it('should list all', () => {
            system.registerCultivator({});
            expect(system.listCultivators().length).toBe(1);
        });
    });

    describe('listByFaction', () => {
        it('should filter', () => {
            const { faction } = system.registerFaction({});
            system.registerCultivator({ factionId: faction.factionId });
            system.registerCultivator({});
            expect(system.listByFaction(faction.factionId).length).toBe(1);
        });
    });

    describe('addReputation', () => {
        it('should add', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.addReputation(cultivator.cultivatorId, 50, 'helped villager');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.addReputation('ghost', 50, 'x');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should cap at maxReputation', () => {
            const { cultivator } = system.registerCultivator({ reputation: 9999 });
            system.addReputation(cultivator.cultivatorId, 9999, 'x');
            expect(cultivator.reputation).toBe(10000);
        });

        it('should floor at 0', () => {
            const { cultivator } = system.registerCultivator({});
            system.addReputation(cultivator.cultivatorId, -100, 'x');
            expect(cultivator.reputation).toBe(0);
        });

        it('should update rank to notable at 100', () => {
            const { cultivator } = system.registerCultivator({});
            system.addReputation(cultivator.cultivatorId, 100, 'x');
            expect(cultivator.rank).toBe('notable');
        });

        it('should update rank to master at 4000', () => {
            const { cultivator } = system.registerCultivator({});
            system.addReputation(cultivator.cultivatorId, 4000, 'x');
            expect(cultivator.rank).toBe('master');
        });

        it('should trigger reputationChanged hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('reputationChanged', () => { called = true; });
            system.addReputation(cultivator.cultivatorId, 50, 'x');
            expect(called).toBe(true);
        });
    });

    describe('getEvents', () => {
        it('should filter', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.addReputation(c1.cultivatorId, 50, 'x');
            system.addReputation(c2.cultivatorId, 50, 'y');
            expect(system.getEvents(c1.cultivatorId).length).toBe(1);
        });
    });

    describe('joinFaction', () => {
        it('should join', () => {
            const { cultivator } = system.registerCultivator({});
            const { faction } = system.registerFaction({});
            const result = system.joinFaction(cultivator.cultivatorId, faction.factionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing cultivator', () => {
            const { faction } = system.registerFaction({});
            const result = system.joinFaction('ghost', faction.factionId);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject missing faction', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.joinFaction(cultivator.cultivatorId, 'ghost');
            expect(result.error).toBe('FACTION_NOT_FOUND');
        });

        it('should trigger factionJoined hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { faction } = system.registerFaction({});
            let called = false;
            system.registerHook('factionJoined', () => { called = true; });
            system.joinFaction(cultivator.cultivatorId, faction.factionId);
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

        it('should execute default getCultivator', () => {
            const result = system.executeTool('getCultivator', { cultivatorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('reputationChanged', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.addReputation(cultivator.cultivatorId, 50, 'x');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('reputationChanged', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.addReputation(cultivator.cultivatorId, 50, 'x')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEvents = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEvents = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            const newSys = new ReputationSystem();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(0);
        });
    });
});