/**
 * CultivationSmash.test.js - 修真重击测试
 * V733 Iteration 26/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSmash } from '../../../systems/ai/CultivationSmash.js';

describe('CultivationSmash', () => {
    let system;
    beforeEach(() => { system = new CultivationSmash(); });

    describe('recruitSmash', () => {
        it('should create a smash', () => {
            const { smash } = system.recruitSmash({ name: 'Heavenly Strike' });
            expect(smash.name).toBe('Heavenly Strike');
        });

        it('should default type to ground', () => {
            const { smash } = system.recruitSmash({});
            expect(smash.type).toBe('ground');
        });

        it('should default force to baseForce (20)', () => {
            const { smash } = system.recruitSmash({});
            expect(smash.force).toBe(20);
        });

        it('should default impacts to empty array', () => {
            const { smash } = system.recruitSmash({});
            expect(smash.impacts).toEqual([]);
        });

        it('should default level to 1', () => {
            const { smash } = system.recruitSmash({});
            expect(smash.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { smash } = system.recruitSmash({});
            expect(smash.status).toBe('novice');
        });

        it('should default masterId to unknown', () => {
            const { smash } = system.recruitSmash({});
            expect(smash.masterId).toBe('unknown');
        });

        it('should trigger smashRecruited hook', () => {
            let called = false;
            system.registerHook('smashRecruited', () => { called = true; });
            system.recruitSmash({});
            expect(called).toBe(true);
        });

        it('should increment totalSmashes stat', () => {
            system.recruitSmash({});
            expect(system.stats.totalSmashes).toBe(1);
        });
    });

    describe('getSmash', () => {
        it('should return smash by id', () => {
            const { smash } = system.recruitSmash({});
            expect(system.getSmash(smash.smashId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSmash('ghost')).toBeNull(); });
    });

    describe('listSmashes', () => {
        it('should list all smashes', () => {
            system.recruitSmash({});
            system.recruitSmash({});
            expect(system.listSmashes().length).toBe(2);
        });
        it('should return empty list when no smashes', () => {
            expect(system.listSmashes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitSmash({ masterId: 'm1' });
            system.recruitSmash({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitSmash({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary smashes', () => {
            system.recruitSmash({});
            const { smash } = system.recruitSmash({});
            system.legendSmash(smash.smashId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none are legendary', () => {
            system.recruitSmash({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addImpact', () => {
        it('should add an impact to the array', () => {
            const { smash } = system.recruitSmash({});
            system.addImpact(smash.smashId, 'crater');
            expect(smash.impacts.length).toBe(1);
            expect(smash.impacts[0]).toBe('crater');
        });

        it('should add multiple impacts', () => {
            const { smash } = system.recruitSmash({});
            system.addImpact(smash.smashId, 'a');
            system.addImpact(smash.smashId, 'b');
            expect(smash.impacts.length).toBe(2);
        });

        it('should reject missing smash', () => {
            const result = system.addImpact('ghost', 'impact');
            expect(result.error).toBe('SMASH_NOT_FOUND');
        });

        it('should trigger impactAdded hook', () => {
            const { smash } = system.recruitSmash({});
            let called = false;
            system.registerHook('impactAdded', () => { called = true; });
            system.addImpact(smash.smashId, 'shockwave');
            expect(called).toBe(true);
        });
    });

    describe('raiseForce', () => {
        it('should raise force by default 5', () => {
            const { smash } = system.recruitSmash({});
            system.raiseForce(smash.smashId);
            expect(smash.force).toBe(25);
        });

        it('should raise force by custom amount', () => {
            const { smash } = system.recruitSmash({});
            system.raiseForce(smash.smashId, 10);
            expect(smash.force).toBe(30);
        });

        it('should reject missing smash', () => {
            const result = system.raiseForce('ghost', 5);
            expect(result.error).toBe('SMASH_NOT_FOUND');
        });

        it('should trigger forceRaised hook', () => {
            const { smash } = system.recruitSmash({});
            let called = false;
            system.registerHook('forceRaised', () => { called = true; });
            system.raiseForce(smash.smashId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSmash', () => {
        it('should increment level', () => {
            const { smash } = system.recruitSmash({});
            system.levelUpSmash(smash.smashId);
            expect(smash.level).toBe(2);
        });

        it('should reject missing smash', () => {
            const result = system.levelUpSmash('ghost');
            expect(result.error).toBe('SMASH_NOT_FOUND');
        });

        it('should trigger smashLeveledUp hook', () => {
            const { smash } = system.recruitSmash({});
            let called = false;
            system.registerHook('smashLeveledUp', () => { called = true; });
            system.levelUpSmash(smash.smashId);
            expect(called).toBe(true);
        });
    });

    describe('legendSmash', () => {
        it('should set status to legendary', () => {
            const { smash } = system.recruitSmash({});
            system.legendSmash(smash.smashId);
            expect(smash.status).toBe('legendary');
        });

        it('should reject missing smash', () => {
            const result = system.legendSmash('ghost');
            expect(result.error).toBe('SMASH_NOT_FOUND');
        });

        it('should trigger smashLegendized hook', () => {
            const { smash } = system.recruitSmash({});
            let called = false;
            system.registerHook('smashLegendized', () => { called = true; });
            system.legendSmash(smash.smashId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSmashValue', () => {
        it('should calculate value: level*100 + force*2 + impacts.length*30', () => {
            const { smash } = system.recruitSmash({});
            smash.level = 2;
            smash.force = 30;
            smash.impacts = ['a', 'b'];
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateSmashValue(smash.smashId)).toBe(320);
        });

        it('should return 0 for missing smash', () => {
            expect(system.calculateSmashValue('ghost')).toBe(0);
        });

        it('should calculate correctly with default values', () => {
            const { smash } = system.recruitSmash({});
            // 1*100 + 20*2 + 0*30 = 100 + 40 + 0 = 140
            expect(system.calculateSmashValue(smash.smashId)).toBe(140);
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

        it('should execute default getSmash tool', () => {
            const result = system.executeTool('getSmash', { smashId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('smashRecruited', () => count++);
            unregister();
            system.recruitSmash({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('smashRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSmash({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient smashes', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalSmashes >= 5', () => {
            system.stats.totalSmashes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSmashes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitSmash({});
            const json = system.toJSON();
            expect(json.smashes.length).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitSmash({});
            const json = system.toJSON();
            const newSys = new CultivationSmash();
            newSys.fromJSON(json);
            expect(newSys.smashes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with smashCount', () => {
            const stats = system.getStats();
            expect(stats.smashCount).toBe(0);
        });

        it('should reflect smashCount after recruitment', () => {
            system.recruitSmash({});
            system.recruitSmash({});
            expect(system.getStats().smashCount).toBe(2);
        });
    });
});
