/**
 * CultivationMurmur.test.js - 修真呢喃系统测试
 * V774 Iteration 7/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMurmur } from '../../../systems/ai/CultivationMurmur.js';

describe('CultivationMurmur', () => {
    let system;
    beforeEach(() => { system = new CultivationMurmur(); });

    describe('recruitMurmur', () => {
        it('should recruit with given fields', () => {
            const { murmur } = system.recruitMurmur({ masterId: 'm1', name: 'Quiet Murmur', type: 'spirit' });
            expect(murmur.masterId).toBe('m1');
            expect(murmur.name).toBe('Quiet Murmur');
            expect(murmur.type).toBe('spirit');
        });

        it('should default type to gentle and quietness to 20', () => {
            const { murmur } = system.recruitMurmur({ masterId: 'm1' });
            expect(murmur.type).toBe('gentle');
            expect(murmur.quietness).toBe(20);
            expect(murmur.level).toBe(1);
            expect(murmur.status).toBe('novice');
            expect(murmur.echoes).toEqual([]);
        });

        it('should generate a murmurId when not provided', () => {
            const { murmur } = system.recruitMurmur({});
            expect(murmur.murmurId).toBeTruthy();
            expect(typeof murmur.murmurId).toBe('string');
        });

        it('should accept provided murmurId', () => {
            const { murmur } = system.recruitMurmur({ murmurId: 'custom-id-774' });
            expect(murmur.murmurId).toBe('custom-id-774');
        });

        it('should increment totalMurmurs stat', () => {
            system.recruitMurmur({});
            system.recruitMurmur({});
            expect(system.stats.totalMurmurs).toBe(2);
        });

        it('should trigger murmurRecruited hook', () => {
            let called = false;
            system.registerHook('murmurRecruited', () => { called = true; });
            system.recruitMurmur({});
            expect(called).toBe(true);
        });
    });

    describe('getMurmur', () => {
        it('should return murmur copy', () => {
            const { murmur } = system.recruitMurmur({});
            const found = system.getMurmur(murmur.murmurId);
            expect(found).not.toBeNull();
            expect(found.murmurId).toBe(murmur.murmurId);
        });
        it('should return null for missing', () => { expect(system.getMurmur('ghost')).toBeNull(); });
    });

    describe('listMurmurs', () => {
        it('should list all murmurs', () => {
            system.recruitMurmur({});
            system.recruitMurmur({});
            system.recruitMurmur({});
            expect(system.listMurmurs().length).toBe(3);
        });

        it('should return empty list when no murmurs', () => {
            expect(system.listMurmurs().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitMurmur({ masterId: 'm1' });
            system.recruitMurmur({ masterId: 'm2' });
            system.recruitMurmur({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary murmurs', () => {
            const { murmur: a } = system.recruitMurmur({});
            const { murmur: b } = system.recruitMurmur({});
            system.legendMurmur(a.murmurId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].murmurId).toBe(a.murmurId);
            expect(b.status).toBe('novice');
        });

        it('should return empty list when no legendary', () => {
            system.recruitMurmur({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addEcho', () => {
        it('should add an echo to murmur', () => {
            const { murmur } = system.recruitMurmur({});
            const result = system.addEcho(murmur.murmurId, 'resonance_1');
            expect(result.success).toBe(true);
            expect(murmur.echoes).toContain('resonance_1');
        });

        it('should add multiple echoes', () => {
            const { murmur } = system.recruitMurmur({});
            system.addEcho(murmur.murmurId, 'echo_1');
            system.addEcho(murmur.murmurId, 'echo_2');
            expect(murmur.echoes.length).toBe(2);
        });

        it('should reject missing murmur', () => {
            const result = system.addEcho('ghost', 'echo');
            expect(result.error).toBe('MURMUR_NOT_FOUND');
        });

        it('should trigger echoAdded hook', () => {
            const { murmur } = system.recruitMurmur({});
            let called = false;
            system.registerHook('echoAdded', () => { called = true; });
            system.addEcho(murmur.murmurId, 'echo');
            expect(called).toBe(true);
        });
    });

    describe('raiseQuietness', () => {
        it('should raise quietness by default 5', () => {
            const { murmur } = system.recruitMurmur({});
            system.raiseQuietness(murmur.murmurId);
            expect(murmur.quietness).toBe(25);
        });

        it('should raise quietness by custom amount', () => {
            const { murmur } = system.recruitMurmur({});
            system.raiseQuietness(murmur.murmurId, 30);
            expect(murmur.quietness).toBe(50);
        });

        it('should reject missing murmur', () => {
            const result = system.raiseQuietness('ghost', 10);
            expect(result.error).toBe('MURMUR_NOT_FOUND');
        });

        it('should trigger quietnessRaised hook', () => {
            const { murmur } = system.recruitMurmur({});
            let called = false;
            system.registerHook('quietnessRaised', () => { called = true; });
            system.raiseQuietness(murmur.murmurId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMurmur', () => {
        it('should increase level by 1', () => {
            const { murmur } = system.recruitMurmur({});
            system.levelUpMurmur(murmur.murmurId);
            expect(murmur.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { murmur } = system.recruitMurmur({});
            system.levelUpMurmur(murmur.murmurId);
            system.levelUpMurmur(murmur.murmurId);
            system.levelUpMurmur(murmur.murmurId);
            expect(murmur.level).toBe(4);
        });

        it('should reject missing murmur', () => {
            const result = system.levelUpMurmur('ghost');
            expect(result.error).toBe('MURMUR_NOT_FOUND');
        });

        it('should trigger murmurLeveledUp hook', () => {
            const { murmur } = system.recruitMurmur({});
            let called = false;
            system.registerHook('murmurLeveledUp', () => { called = true; });
            system.levelUpMurmur(murmur.murmurId);
            expect(called).toBe(true);
        });
    });

    describe('legendMurmur', () => {
        it('should set status to legendary', () => {
            const { murmur } = system.recruitMurmur({});
            system.legendMurmur(murmur.murmurId);
            expect(murmur.status).toBe('legendary');
        });

        it('should reject missing murmur', () => {
            const result = system.legendMurmur('ghost');
            expect(result.error).toBe('MURMUR_NOT_FOUND');
        });

        it('should trigger murmurLegendized hook', () => {
            const { murmur } = system.recruitMurmur({});
            let called = false;
            system.registerHook('murmurLegendized', () => { called = true; });
            system.legendMurmur(murmur.murmurId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMurmurValue', () => {
        it('should calculate value with default stats', () => {
            const { murmur } = system.recruitMurmur({});
            // level=1 * 100 + quietness=20 * 2 + echoes=0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateMurmurValue(murmur.murmurId)).toBe(140);
        });

        it('should calculate value with echoes and leveled up', () => {
            const { murmur } = system.recruitMurmur({});
            system.levelUpMurmur(murmur.murmurId);
            system.levelUpMurmur(murmur.murmurId);
            system.addEcho(murmur.murmurId, 'echo_1');
            system.addEcho(murmur.murmurId, 'echo_2');
            // level=3 * 100 + quietness=20 * 2 + echoes=2 * 30 = 300 + 40 + 60 = 400
            expect(system.calculateMurmurValue(murmur.murmurId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMurmurValue('ghost')).toBe(0);
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

        it('should execute default getMurmur tool', () => {
            const { murmur } = system.recruitMurmur({});
            const result = system.executeTool('getMurmur', { murmurId: murmur.murmurId });
            expect(result.success).toBe(true);
            expect(result.result.murmurId).toBe(murmur.murmurId);
        });

        it('should execute default recruitMurmur tool', () => {
            const result = system.executeTool('recruitMurmur', { masterId: 'm1', name: 'X', type: 'quiet' });
            expect(result.success).toBe(true);
            expect(result.result.murmur.masterId).toBe('m1');
        });

        it('should handle null context', () => {
            system.registerTool('ctxTest', (ctx) => ctx);
            const result = system.executeTool('ctxTest');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('murmurRecruited', () => count++);
            unregister();
            system.recruitMurmur({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('murmurRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMurmur({})).not.toThrow();
        });

        it('should handle unregister for missing event', () => {
            const unregister = system.registerHook('nonexistent', () => {});
            unregister();
            expect(true).toBe(true);
        });

        it('should handle double unregister', () => {
            let count = 0;
            const unregister = system.registerHook('murmurRecruited', () => count++);
            unregister();
            unregister();
            system.recruitMurmur({});
            expect(count).toBe(0);
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient murmurs', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalMurmurs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxMurmurs).toBe(40);
        });
        it('should not double evolve', () => {
            system.stats.totalMurmurs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitMurmur({});
            system.recruitMurmur({});
            const json = system.toJSON();
            expect(json.murmurs.length).toBe(2);
            expect(json.stats.totalMurmurs).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitMurmur({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationMurmur();
            newSys.fromJSON(json);
            expect(newSys.murmurs.size).toBe(1);
            expect(newSys.stats.totalMurmurs).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitMurmur({});
            const stats = system.getStats();
            expect(stats.murmurCount).toBe(1);
            expect(stats.totalMurmurs).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });

    describe('Constructor', () => {
        it('should accept custom config', () => {
            const custom = new CultivationMurmur({ maxMurmurs: 50, baseQuietness: 30 });
            expect(custom.config.maxMurmurs).toBe(50);
            expect(custom.config.baseQuietness).toBe(30);
        });
    });
});
