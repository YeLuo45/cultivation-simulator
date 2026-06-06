/**
 * DesertCultivation.test.js - 沙漠求生系统测试
 * V466 Iteration 13/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DesertCultivation } from '../../../systems/ai/DesertCultivation.js';

describe('DesertCultivation', () => {
    let system;
    beforeEach(() => { system = new DesertCultivation(); });

    describe('discoverOasis', () => {
        it('should create', () => {
            const { oasis } = system.discoverOasis({ explorerId: 'e1' });
            expect(oasis.explorerId).toBe('e1');
        });

        it('should set base water', () => {
            const { oasis } = system.discoverOasis({});
            expect(oasis.water).toBe(30);
        });

        it('should set peaceful status', () => {
            const { oasis } = system.discoverOasis({});
            expect(oasis.status).toBe('peaceful');
        });

        it('should trigger oasisDiscovered hook', () => {
            let called = false;
            system.registerHook('oasisDiscovered', () => { called = true; });
            system.discoverOasis({});
            expect(called).toBe(true);
        });
    });

    describe('getOasis', () => {
        it('should return', () => {
            const { oasis } = system.discoverOasis({});
            expect(system.getOasis(oasis.oasisId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getOasis('ghost')).toBeNull(); });
    });

    describe('listOases', () => {
        it('should list all', () => {
            system.discoverOasis({});
            system.discoverOasis({});
            expect(system.listOases().length).toBe(2);
        });
    });

    describe('listByExplorer', () => {
        it('should filter', () => {
            system.discoverOasis({ explorerId: 'e1' });
            system.discoverOasis({ explorerId: 'e2' });
            expect(system.listByExplorer('e1').length).toBe(1);
        });
    });

    describe('listDangerous', () => {
        it('should filter dangerous', () => {
            const { oasis } = system.discoverOasis({});
            system.endureSandstorm(oasis.oasisId);
            expect(system.listDangerous().length).toBe(1);
        });

        it('should not include peaceful', () => {
            system.discoverOasis({});
            expect(system.listDangerous().length).toBe(0);
        });
    });

    describe('listAbandoned', () => {
        it('should filter abandoned', () => {
            const { oasis } = system.discoverOasis({});
            oasis.status = 'abandoned';
            expect(system.listAbandoned().length).toBe(1);
        });
    });

    describe('listPeaceful', () => {
        it('should filter peaceful', () => {
            system.discoverOasis({});
            expect(system.listPeaceful().length).toBe(1);
        });
    });

    describe('gatherWater', () => {
        it('should gather', () => {
            const { oasis } = system.discoverOasis({});
            system.gatherWater(oasis.oasisId, 10);
            expect(oasis.water).toBe(40);
        });

        it('should use default amount', () => {
            const { oasis } = system.discoverOasis({});
            system.gatherWater(oasis.oasisId);
            expect(oasis.water).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.gatherWater('ghost', 10);
            expect(result.error).toBe('OASIS_NOT_FOUND');
        });

        it('should trigger waterGathered hook', () => {
            const { oasis } = system.discoverOasis({});
            let called = false;
            system.registerHook('waterGathered', () => { called = true; });
            system.gatherWater(oasis.oasisId, 10);
            expect(called).toBe(true);
        });
    });

    describe('endureSandstorm', () => {
        it('should set status to dangerous', () => {
            const { oasis } = system.discoverOasis({});
            system.endureSandstorm(oasis.oasisId);
            expect(oasis.status).toBe('dangerous');
        });

        it('should increment sandstorms', () => {
            const { oasis } = system.discoverOasis({});
            system.endureSandstorm(oasis.oasisId);
            expect(oasis.sandstorms).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.endureSandstorm('ghost');
            expect(result.error).toBe('OASIS_NOT_FOUND');
        });

        it('should trigger sandstormEndured hook', () => {
            const { oasis } = system.discoverOasis({});
            let called = false;
            system.registerHook('sandstormEndured', () => { called = true; });
            system.endureSandstorm(oasis.oasisId);
            expect(called).toBe(true);
        });
    });

    describe('exploreRuin', () => {
        it('should add ruin', () => {
            const { oasis } = system.discoverOasis({});
            system.exploreRuin(oasis.oasisId, 'Temple of Sand');
            expect(oasis.ruins).toContain('Temple of Sand');
        });

        it('should reject missing', () => {
            const result = system.exploreRuin('ghost', 'ruin');
            expect(result.error).toBe('OASIS_NOT_FOUND');
        });

        it('should trigger ruinExplored hook', () => {
            const { oasis } = system.discoverOasis({});
            let called = false;
            system.registerHook('ruinExplored', () => { called = true; });
            system.exploreRuin(oasis.oasisId, 'ruin');
            expect(called).toBe(true);
        });
    });

    describe('findRelic', () => {
        it('should add relic', () => {
            const { oasis } = system.discoverOasis({});
            system.findRelic(oasis.oasisId, 'Ancient Amulet');
            expect(oasis.relics).toContain('Ancient Amulet');
        });

        it('should reject missing', () => {
            const result = system.findRelic('ghost', 'relic');
            expect(result.error).toBe('OASIS_NOT_FOUND');
        });
    });

    describe('calculateSurvivalPower', () => {
        it('should calculate', () => {
            const { oasis } = system.discoverOasis({});
            // water=30 -> 60, ruins=[], relics=[]
            expect(system.calculateSurvivalPower(oasis.oasisId)).toBe(60);
        });

        it('should include ruins and relics', () => {
            const { oasis } = system.discoverOasis({});
            system.exploreRuin(oasis.oasisId, 'r1');
            system.exploreRuin(oasis.oasisId, 'r2');
            system.findRelic(oasis.oasisId, 'rel1');
            // 30*2 + 2*5 + 1*10 = 60 + 10 + 10 = 80
            expect(system.calculateSurvivalPower(oasis.oasisId)).toBe(80);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSurvivalPower('ghost')).toBe(0);
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

        it('should execute default getOasis', () => {
            const result = system.executeTool('getOasis', { oasisId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('oasisDiscovered', () => count++);
            unregister();
            system.discoverOasis({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('oasisDiscovered', () => { throw new Error('x'); });
            expect(() => system.discoverOasis({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalOases = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalOases = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.discoverOasis({});
            const json = system.toJSON();
            expect(json.oases.length).toBe(1);
        });
        it('should deserialize', () => {
            system.discoverOasis({});
            const json = system.toJSON();
            const newSys = new DesertCultivation();
            newSys.fromJSON(json);
            expect(newSys.oases.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.oasisCount).toBe(0);
        });
    });
});
