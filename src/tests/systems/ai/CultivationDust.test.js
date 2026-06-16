/**
 * CultivationDust.test.js - 修真尘测试
 * V847 Iteration 20/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDust } from '../../../systems/ai/CultivationDust.js';

describe('CultivationDust', () => {
    let system;
    beforeEach(() => { system = new CultivationDust(); });

    describe('recruitDust', () => {
        it('should create a dust', () => {
            const { dust } = system.recruitDust({ name: 'Cosmic Dust' });
            expect(dust.name).toBe('Cosmic Dust');
        });

        it('should default type to cosmic', () => {
            const { dust } = system.recruitDust({});
            expect(dust.type).toBe('cosmic');
        });

        it('should default lightness to baseLightness (20)', () => {
            const { dust } = system.recruitDust({});
            expect(dust.lightness).toBe(20);
        });

        it('should default status to novice', () => {
            const { dust } = system.recruitDust({});
            expect(dust.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { dust } = system.recruitDust({});
            expect(dust.level).toBe(1);
        });

        it('should default motes to empty array', () => {
            const { dust } = system.recruitDust({});
            expect(dust.motes).toEqual([]);
        });

        it('should trigger dustRecruited hook', () => {
            let called = false;
            system.registerHook('dustRecruited', () => { called = true; });
            system.recruitDust({});
            expect(called).toBe(true);
        });

        it('should increment totalDusts stat', () => {
            system.recruitDust({});
            expect(system.stats.totalDusts).toBe(1);
        });

        it('should accept custom type desert', () => {
            const { dust } = system.recruitDust({ type: 'desert' });
            expect(dust.type).toBe('desert');
        });

        it('should accept custom type divine', () => {
            const { dust } = system.recruitDust({ type: 'divine' });
            expect(dust.type).toBe('divine');
        });

        it('should accept custom masterId', () => {
            const { dust } = system.recruitDust({ masterId: 'master-1' });
            expect(dust.masterId).toBe('master-1');
        });
    });

    describe('getDust', () => {
        it('should return dust by id', () => {
            const { dust } = system.recruitDust({});
            expect(system.getDust(dust.dustId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDust('ghost')).toBeNull(); });
    });

    describe('listDusts', () => {
        it('should list all dusts', () => {
            system.recruitDust({});
            system.recruitDust({});
            expect(system.listDusts().length).toBe(2);
        });
        it('should return empty list when no dusts', () => {
            expect(system.listDusts().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitDust({ masterId: 'm1' });
            system.recruitDust({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary dusts', () => {
            system.recruitDust({});
            const { dust } = system.recruitDust({});
            system.legendDust(dust.dustId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none are legendary', () => {
            system.recruitDust({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addMote', () => {
        it('should add a mote to the array', () => {
            const { dust } = system.recruitDust({});
            system.addMote(dust.dustId, 'stardust-mote');
            expect(dust.motes.length).toBe(1);
            expect(dust.motes[0]).toBe('stardust-mote');
        });

        it('should reject missing dust', () => {
            const result = system.addMote('ghost', 'mote');
            expect(result.error).toBe('DUST_NOT_FOUND');
        });

        it('should trigger moteAdded hook', () => {
            const { dust } = system.recruitDust({});
            let called = false;
            system.registerHook('moteAdded', () => { called = true; });
            system.addMote(dust.dustId, 'sun-mote');
            expect(called).toBe(true);
        });
    });

    describe('raiseLightness', () => {
        it('should raise lightness by default 5', () => {
            const { dust } = system.recruitDust({});
            system.raiseLightness(dust.dustId);
            expect(dust.lightness).toBe(25);
        });

        it('should raise lightness by custom amount', () => {
            const { dust } = system.recruitDust({});
            system.raiseLightness(dust.dustId, 10);
            expect(dust.lightness).toBe(30);
        });

        it('should reject missing dust', () => {
            const result = system.raiseLightness('ghost', 5);
            expect(result.error).toBe('DUST_NOT_FOUND');
        });

        it('should trigger lightnessRaised hook', () => {
            const { dust } = system.recruitDust({});
            let called = false;
            system.registerHook('lightnessRaised', () => { called = true; });
            system.raiseLightness(dust.dustId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDust', () => {
        it('should increment level', () => {
            const { dust } = system.recruitDust({});
            system.levelUpDust(dust.dustId);
            expect(dust.level).toBe(2);
        });

        it('should reject missing dust', () => {
            const result = system.levelUpDust('ghost');
            expect(result.error).toBe('DUST_NOT_FOUND');
        });

        it('should trigger dustLeveledUp hook', () => {
            const { dust } = system.recruitDust({});
            let called = false;
            system.registerHook('dustLeveledUp', () => { called = true; });
            system.levelUpDust(dust.dustId);
            expect(called).toBe(true);
        });
    });

    describe('legendDust', () => {
        it('should set status to legendary', () => {
            const { dust } = system.recruitDust({});
            system.legendDust(dust.dustId);
            expect(dust.status).toBe('legendary');
        });

        it('should reject missing dust', () => {
            const result = system.legendDust('ghost');
            expect(result.error).toBe('DUST_NOT_FOUND');
        });

        it('should trigger dustLegendized hook', () => {
            const { dust } = system.recruitDust({});
            let called = false;
            system.registerHook('dustLegendized', () => { called = true; });
            system.legendDust(dust.dustId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDustValue', () => {
        it('should calculate value: level*100 + lightness*2 + motes.length*30', () => {
            const { dust } = system.recruitDust({});
            dust.level = 2;
            dust.lightness = 30;
            dust.motes = ['a', 'b'];
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateDustValue(dust.dustId)).toBe(320);
        });

        it('should return 0 for missing dust', () => {
            expect(system.calculateDustValue('ghost')).toBe(0);
        });

        it('should calculate correctly with default values', () => {
            const { dust } = system.recruitDust({});
            // 1*100 + 20*2 + 0*30 = 100 + 40 + 0 = 140
            expect(system.calculateDustValue(dust.dustId)).toBe(140);
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

        it('should execute default getDust tool', () => {
            const result = system.executeTool('getDust', { dustId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dustRecruited', () => count++);
            unregister();
            system.recruitDust({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dustRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDust({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient dusts', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalDusts >= 5', () => {
            system.stats.totalDusts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDusts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitDust({});
            const json = system.toJSON();
            expect(json.dusts.length).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitDust({});
            const json = system.toJSON();
            const newSys = new CultivationDust();
            newSys.fromJSON(json);
            expect(newSys.dusts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with dustCount', () => {
            const stats = system.getStats();
            expect(stats.dustCount).toBe(0);
        });
    });
});
