/**
 * CultivationOracle.test.js - 修真神谕系统测试
 * V650 Iteration 3/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationOracle } from '../../../systems/ai/CultivationOracle.js';

describe('CultivationOracle', () => {
    let system;
    beforeEach(() => { system = new CultivationOracle(); });

    describe('recruitOracle', () => {
        it('should create oracle', () => {
            const { oracle } = system.recruitOracle({ prophetId: 'p1', name: 'Sage 1' });
            expect(oracle.prophetId).toBe('p1');
            expect(oracle.name).toBe('Sage 1');
        });

        it('should use default type', () => {
            const { oracle } = system.recruitOracle({ prophetId: 'p1' });
            expect(oracle.type).toBe('divine');
        });

        it('should use provided type', () => {
            const { oracle } = system.recruitOracle({ prophetId: 'p1', type: 'celestial' });
            expect(oracle.type).toBe('celestial');
        });

        it('should use baseProphecy by default', () => {
            const { oracle } = system.recruitOracle({ prophetId: 'p1' });
            expect(oracle.prophecy).toBe(20);
        });

        it('should accept custom prophecy', () => {
            const { oracle } = system.recruitOracle({ prophetId: 'p1', prophecy: 100 });
            expect(oracle.prophecy).toBe(100);
        });

        it('should start at level 1', () => {
            const { oracle } = system.recruitOracle({ prophetId: 'p1' });
            expect(oracle.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { oracle } = system.recruitOracle({ prophetId: 'p1' });
            expect(oracle.status).toBe('novice');
        });

        it('should trigger oracleRecruited hook', () => {
            let called = false;
            system.registerHook('oracleRecruited', () => { called = true; });
            system.recruitOracle({});
            expect(called).toBe(true);
        });

        it('should increment totalOracles stat', () => {
            system.recruitOracle({});
            expect(system.stats.totalOracles).toBe(1);
        });
    });

    describe('getOracle', () => {
        it('should return oracle', () => {
            const { oracle } = system.recruitOracle({});
            expect(system.getOracle(oracle.oracleId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getOracle('ghost')).toBeNull();
        });

        it('should return a copy', () => {
            const { oracle } = system.recruitOracle({});
            const got = system.getOracle(oracle.oracleId);
            got.prophecy = 999;
            expect(system.oracles.get(oracle.oracleId).prophecy).not.toBe(999);
        });
    });

    describe('listOracles', () => {
        it('should list all', () => {
            system.recruitOracle({});
            system.recruitOracle({});
            expect(system.listOracles().length).toBe(2);
        });

        it('should return empty array initially', () => {
            expect(system.listOracles().length).toBe(0);
        });
    });

    describe('listByProphet', () => {
        it('should filter by prophet', () => {
            system.recruitOracle({ prophetId: 'p1' });
            system.recruitOracle({ prophetId: 'p2' });
            expect(system.listByProphet('p1').length).toBe(1);
        });

        it('should return empty for unknown prophet', () => {
            system.recruitOracle({ prophetId: 'p1' });
            expect(system.listByProphet('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { oracle: o1 } = system.recruitOracle({});
            const { oracle: o2 } = system.recruitOracle({});
            system.legendOracle(o2.oracleId);
            const legends = system.listLegendary();
            expect(legends.length).toBe(1);
            expect(legends[0].oracleId).toBe(o2.oracleId);
        });

        it('should return empty when none legendary', () => {
            system.recruitOracle({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addOracle', () => {
        it('should add to oracles array', () => {
            const { oracle } = system.recruitOracle({});
            system.addOracle(oracle.oracleId, { omen: 'fire' });
            expect(system.oracles.get(oracle.oracleId).oracles.length).toBe(1);
        });

        it('should reject missing oracle', () => {
            const result = system.addOracle('ghost', { omen: 'fire' });
            expect(result.error).toBe('ORACLE_NOT_FOUND');
        });

        it('should trigger oracleAdded hook', () => {
            const { oracle } = system.recruitOracle({});
            let called = false;
            system.registerHook('oracleAdded', () => { called = true; });
            system.addOracle(oracle.oracleId, { omen: 'water' });
            expect(called).toBe(true);
        });
    });

    describe('deepenProphecy', () => {
        it('should deepen by default amount', () => {
            const { oracle } = system.recruitOracle({});
            system.deepenProphecy(oracle.oracleId);
            expect(system.oracles.get(oracle.oracleId).prophecy).toBe(25);
        });

        it('should deepen by custom amount', () => {
            const { oracle } = system.recruitOracle({});
            system.deepenProphecy(oracle.oracleId, 50);
            expect(system.oracles.get(oracle.oracleId).prophecy).toBe(70);
        });

        it('should reject missing oracle', () => {
            const result = system.deepenProphecy('ghost', 5);
            expect(result.error).toBe('ORACLE_NOT_FOUND');
        });

        it('should trigger prophecyDeepened hook', () => {
            const { oracle } = system.recruitOracle({});
            let called = false;
            system.registerHook('prophecyDeepened', () => { called = true; });
            system.deepenProphecy(oracle.oracleId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpOracle', () => {
        it('should increment level', () => {
            const { oracle } = system.recruitOracle({});
            system.levelUpOracle(oracle.oracleId);
            expect(system.oracles.get(oracle.oracleId).level).toBe(2);
        });

        it('should reject missing oracle', () => {
            const result = system.levelUpOracle('ghost');
            expect(result.error).toBe('ORACLE_NOT_FOUND');
        });

        it('should trigger oracleLeveledUp hook', () => {
            const { oracle } = system.recruitOracle({});
            let called = false;
            system.registerHook('oracleLeveledUp', () => { called = true; });
            system.levelUpOracle(oracle.oracleId);
            expect(called).toBe(true);
        });
    });

    describe('legendOracle', () => {
        it('should set status to legendary', () => {
            const { oracle } = system.recruitOracle({});
            system.legendOracle(oracle.oracleId);
            expect(system.oracles.get(oracle.oracleId).status).toBe('legendary');
        });

        it('should reject missing oracle', () => {
            const result = system.legendOracle('ghost');
            expect(result.error).toBe('ORACLE_NOT_FOUND');
        });

        it('should trigger oracleLegendized hook', () => {
            const { oracle } = system.recruitOracle({});
            let called = false;
            system.registerHook('oracleLegendized', () => { called = true; });
            system.legendOracle(oracle.oracleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateOracleValue', () => {
        it('should calculate value', () => {
            const { oracle } = system.recruitOracle({ prophecy: 50 });
            system.addOracle(oracle.oracleId, { omen: 'a' });
            system.addOracle(oracle.oracleId, { omen: 'b' });
            // level 1 * 100 + 50 * 2 + 2 * 30 = 100 + 100 + 60 = 260
            expect(system.calculateOracleValue(oracle.oracleId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateOracleValue('ghost')).toBe(0);
        });

        it('should include level in value', () => {
            const { oracle } = system.recruitOracle({});
            system.levelUpOracle(oracle.oracleId);
            system.levelUpOracle(oracle.oracleId);
            // level 3 * 100 + 20 * 2 + 0 * 30 = 300 + 40 = 340
            expect(system.calculateOracleValue(oracle.oracleId)).toBe(340);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getOracle tool', () => {
            const result = system.executeTool('getOracle', { oracleId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitOracle tool', () => {
            const result = system.executeTool('recruitOracle', { prophetId: 'p1' });
            expect(result.success).toBe(true);
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('oracleRecruited', () => count++);
            unregister();
            system.recruitOracle({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('oracleRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitOracle({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when threshold met', () => {
            system.stats.totalOracles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxOracles).toBe(50);
        });

        it('should not double evolve', () => {
            system.stats.totalOracles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitOracle({});
            const json = system.toJSON();
            expect(json.oracles.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitOracle({});
            const json = system.toJSON();
            const newSys = new CultivationOracle();
            newSys.fromJSON(json);
            expect(newSys.oracles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with oracleCount', () => {
            const stats = system.getStats();
            expect(stats.oracleCount).toBe(0);
            expect(stats.totalOracles).toBe(0);
        });
    });
});
