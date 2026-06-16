/**
 * CultivationTwilight.test.js - 修真暮光系统测试
 * V817 Iteration 20/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTwilight } from '../../../systems/ai/CultivationTwilight.js';

describe('CultivationTwilight', () => {
    let system;
    beforeEach(() => { system = new CultivationTwilight(); });

    describe('recruitTwilight', () => {
        it('should recruit', () => {
            const { twilight } = system.recruitTwilight({ masterId: 'm1', name: 'Dusklight' });
            expect(twilight.masterId).toBe('m1');
            expect(twilight.name).toBe('Dusklight');
        });

        it('should default name to Unnamed Twilight', () => {
            const { twilight } = system.recruitTwilight({});
            expect(twilight.name).toBe('Unnamed Twilight');
        });

        it('should default type to civil', () => {
            const { twilight } = system.recruitTwilight({});
            expect(twilight.type).toBe('civil');
        });

        it('should initialize level 1', () => {
            const { twilight } = system.recruitTwilight({});
            expect(twilight.level).toBe(1);
        });

        it('should initialize status novice', () => {
            const { twilight } = system.recruitTwilight({});
            expect(twilight.status).toBe('novice');
        });

        it('should trigger twilightRecruited hook', () => {
            let called = false;
            system.registerHook('twilightRecruited', () => { called = true; });
            system.recruitTwilight({});
            expect(called).toBe(true);
        });
    });

    describe('getTwilight', () => {
        it('should return', () => {
            const { twilight } = system.recruitTwilight({});
            expect(system.getTwilight(twilight.twilightId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTwilight('ghost')).toBeNull(); });
    });

    describe('listTwilights', () => {
        it('should list all', () => {
            system.recruitTwilight({});
            expect(system.listTwilights().length).toBe(1);
        });

        it('should be empty initially', () => {
            expect(system.listTwilights().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitTwilight({ masterId: 'm1' });
            system.recruitTwilight({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitTwilight({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list legendary twilights', () => {
            const { twilight: t1 } = system.recruitTwilight({});
            const { twilight: t2 } = system.recruitTwilight({});
            const { twilight: t3 } = system.recruitTwilight({});
            t1.status = 'legendary';
            t3.status = 'legendary';
            expect(system.listLegendary().length).toBe(2);
        });

        it('should return empty when no legendary', () => {
            system.recruitTwilight({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addOmen', () => {
        it('should add omen', () => {
            const { twilight } = system.recruitTwilight({});
            system.addOmen(twilight.twilightId, 'omen-1');
            expect(twilight.omens).toContain('omen-1');
        });

        it('should reject missing', () => {
            const result = system.addOmen('ghost', 'o');
            expect(result.error).toBe('TWILIGHT_NOT_FOUND');
        });

        it('should trigger omenAdded hook', () => {
            const { twilight } = system.recruitTwilight({});
            let called = false;
            system.registerHook('omenAdded', () => { called = true; });
            system.addOmen(twilight.twilightId, 'omen');
            expect(called).toBe(true);
        });
    });

    describe('raiseMystery', () => {
        it('should raise mystery by 5 default', () => {
            const { twilight } = system.recruitTwilight({});
            system.raiseMystery(twilight.twilightId);
            expect(twilight.mystery).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { twilight } = system.recruitTwilight({});
            system.raiseMystery(twilight.twilightId, 30);
            expect(twilight.mystery).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseMystery('ghost', 10);
            expect(result.error).toBe('TWILIGHT_NOT_FOUND');
        });

        it('should trigger mysteryRaised hook', () => {
            const { twilight } = system.recruitTwilight({});
            let called = false;
            system.registerHook('mysteryRaised', () => { called = true; });
            system.raiseMystery(twilight.twilightId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTwilight', () => {
        it('should level up', () => {
            const { twilight } = system.recruitTwilight({});
            system.levelUpTwilight(twilight.twilightId);
            expect(twilight.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTwilight('ghost');
            expect(result.error).toBe('TWILIGHT_NOT_FOUND');
        });

        it('should trigger twilightLeveledUp hook', () => {
            const { twilight } = system.recruitTwilight({});
            let called = false;
            system.registerHook('twilightLeveledUp', () => { called = true; });
            system.levelUpTwilight(twilight.twilightId);
            expect(called).toBe(true);
        });
    });

    describe('legendTwilight', () => {
        it('should set status legendary', () => {
            const { twilight } = system.recruitTwilight({});
            system.legendTwilight(twilight.twilightId);
            expect(twilight.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendTwilight('ghost');
            expect(result.error).toBe('TWILIGHT_NOT_FOUND');
        });

        it('should trigger twilightLegendized hook', () => {
            const { twilight } = system.recruitTwilight({});
            let called = false;
            system.registerHook('twilightLegendized', () => { called = true; });
            system.legendTwilight(twilight.twilightId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTwilightValue', () => {
        it('should calculate', () => {
            const { twilight } = system.recruitTwilight({});
            system.levelUpTwilight(twilight.twilightId);
            system.addOmen(twilight.twilightId, 'a');
            system.addOmen(twilight.twilightId, 'b');
            // level=2 => 200, mystery=20 => 40, omens=2 => 60, total=300
            expect(system.calculateTwilightValue(twilight.twilightId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTwilightValue('ghost')).toBe(0);
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

        it('should execute default getTwilight', () => {
            const result = system.executeTool('getTwilight', { twilightId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitTwilight', () => {
            const result = system.executeTool('recruitTwilight', { masterId: 'mX' });
            expect(result.success).toBe(true);
            expect(result.result.twilight.masterId).toBe('mX');
        });

        it('should execute tool with undefined context', () => {
            system.registerTool('nocontext', () => 'no-ctx');
            const result = system.executeTool('nocontext');
            expect(result.result).toBe('no-ctx');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('twilightRecruited', () => count++);
            unregister();
            system.recruitTwilight({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('twilightRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTwilight({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTwilights = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxTwilights).toBe(50);
        });
        it('should not double evolve', () => {
            system.stats.totalTwilights = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTwilight({});
            const json = system.toJSON();
            expect(json.twilights.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTwilight({});
            const json = system.toJSON();
            const newSys = new CultivationTwilight();
            newSys.fromJSON(json);
            expect(newSys.twilights.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.twilightCount).toBe(0);
            expect(stats.totalTwilights).toBe(0);
        });
    });
});
