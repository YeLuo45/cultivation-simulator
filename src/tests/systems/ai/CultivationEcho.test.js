/**
 * CultivationEcho.test.js - 修真回声测试
 * V772 Iteration 5/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEcho } from '../../../systems/ai/CultivationEcho.js';

describe('CultivationEcho', () => {
    let system;
    beforeEach(() => { system = new CultivationEcho(); });

    describe('recruitEcho', () => {
        it('should recruit', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1', name: 'Echo1', type: 'mountain' });
            expect(echo.masterId).toBe('m1');
            expect(echo.name).toBe('Echo1');
            expect(echo.type).toBe('mountain');
        });

        it('should default name to unnamed', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            expect(echo.name).toBe('unnamed');
        });

        it('should default type to mountain', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            expect(echo.type).toBe('mountain');
        });

        it('should default reverberation to baseReverberation', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            expect(echo.reverberation).toBe(20);
        });

        it('should set level to 1 and status to novice', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            expect(echo.level).toBe(1);
            expect(echo.status).toBe('novice');
        });

        it('should init empty reflections', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            expect(echo.reflections).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            expect(echo.echoId).toBeTruthy();
        });

        it('should respect provided id', () => {
            const { echo } = system.recruitEcho({ id: 'custom-ech', masterId: 'm1' });
            expect(echo.echoId).toBe('custom-ech');
        });

        it('should accept custom reflections', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1', reflections: ['r1', 'r2'] });
            expect(echo.reflections.length).toBe(2);
        });

        it('should accept custom reverberation', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1', reverberation: 99 });
            expect(echo.reverberation).toBe(99);
        });

        it('should accept cave type', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1', type: 'cave' });
            expect(echo.type).toBe('cave');
        });

        it('should accept cosmic type', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1', type: 'cosmic' });
            expect(echo.type).toBe('cosmic');
        });

        it('should increment totalEchoes', () => {
            system.recruitEcho({ masterId: 'm1' });
            expect(system.stats.totalEchoes).toBe(1);
        });

        it('should trigger echoRecruited hook', () => {
            let called = false;
            system.registerHook('echoRecruited', () => { called = true; });
            system.recruitEcho({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getEcho', () => {
        it('should return echo', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            expect(system.getEcho(echo.echoId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEcho('ghost')).toBeNull(); });
    });

    describe('listEchoes', () => {
        it('should list all', () => {
            system.recruitEcho({ masterId: 'm1' });
            system.recruitEcho({ masterId: 'm2' });
            expect(system.listEchoes().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listEchoes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitEcho({ masterId: 'm1' });
            system.recruitEcho({ masterId: 'm2' });
            system.recruitEcho({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitEcho({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { echo: e1 } = system.recruitEcho({ masterId: 'm1' });
            system.recruitEcho({ masterId: 'm1' });
            system.legendEcho(e1.echoId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitEcho({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addReflection', () => {
        it('should add reflection', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.addReflection(echo.echoId, 'r1');
            expect(echo.reflections.length).toBe(1);
            expect(echo.reflections[0]).toBe('r1');
        });

        it('should reject missing echo', () => {
            const result = system.addReflection('ghost', 'r1');
            expect(result.error).toBe('ECHO_NOT_FOUND');
        });

        it('should promote to veteran at 3 reflections', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.addReflection(echo.echoId, 'r1');
            system.addReflection(echo.echoId, 'r2');
            system.addReflection(echo.echoId, 'r3');
            expect(echo.status).toBe('veteran');
        });

        it('should not promote past veteran', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.legendEcho(echo.echoId);
            system.addReflection(echo.echoId, 'r1');
            system.addReflection(echo.echoId, 'r2');
            system.addReflection(echo.echoId, 'r3');
            expect(echo.status).toBe('legendary');
        });

        it('should trigger reflectionAdded hook', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            let called = false;
            system.registerHook('reflectionAdded', () => { called = true; });
            system.addReflection(echo.echoId, 'r1');
            expect(called).toBe(true);
        });
    });

    describe('raiseReverberation', () => {
        it('should raise by default 5', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.raiseReverberation(echo.echoId);
            expect(echo.reverberation).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.raiseReverberation(echo.echoId, 50);
            expect(echo.reverberation).toBe(70);
        });

        it('should reject missing echo', () => {
            const result = system.raiseReverberation('ghost', 5);
            expect(result.error).toBe('ECHO_NOT_FOUND');
        });

        it('should trigger reverberationRaised hook', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            let called = false;
            system.registerHook('reverberationRaised', () => { called = true; });
            system.raiseReverberation(echo.echoId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEcho', () => {
        it('should level up', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.levelUpEcho(echo.echoId);
            expect(echo.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.levelUpEcho(echo.echoId);
            system.levelUpEcho(echo.echoId);
            system.levelUpEcho(echo.echoId);
            expect(echo.level).toBe(4);
        });

        it('should reject missing echo', () => {
            const result = system.levelUpEcho('ghost');
            expect(result.error).toBe('ECHO_NOT_FOUND');
        });

        it('should trigger echoLeveledUp hook', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            let called = false;
            system.registerHook('echoLeveledUp', () => { called = true; });
            system.levelUpEcho(echo.echoId);
            expect(called).toBe(true);
        });
    });

    describe('legendEcho', () => {
        it('should set status to legendary', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.legendEcho(echo.echoId);
            expect(echo.status).toBe('legendary');
        });

        it('should reject missing echo', () => {
            const result = system.legendEcho('ghost');
            expect(result.error).toBe('ECHO_NOT_FOUND');
        });

        it('should trigger echoLegendized hook', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            let called = false;
            system.registerHook('echoLegendized', () => { called = true; });
            system.legendEcho(echo.echoId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEchoValue', () => {
        it('should calculate base value', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            // level=1, reverberation=20, reflections=0 -> 100 + 40 + 0 = 140
            expect(system.calculateEchoValue(echo.echoId)).toBe(140);
        });

        it('should factor in level', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.levelUpEcho(echo.echoId);
            system.levelUpEcho(echo.echoId);
            // level=3, reverberation=20, reflections=0 -> 300 + 40 + 0 = 340
            expect(system.calculateEchoValue(echo.echoId)).toBe(340);
        });

        it('should factor in reflections', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.addReflection(echo.echoId, 'r1');
            system.addReflection(echo.echoId, 'r2');
            // level=1, reverberation=20, reflections=2 -> 100 + 40 + 60 = 200
            expect(system.calculateEchoValue(echo.echoId)).toBe(200);
        });

        it('should factor in reverberation', () => {
            const { echo } = system.recruitEcho({ masterId: 'm1' });
            system.raiseReverberation(echo.echoId, 30);
            // level=1, reverberation=50, reflections=0 -> 100 + 100 + 0 = 200
            expect(system.calculateEchoValue(echo.echoId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEchoValue('ghost')).toBe(0);
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

        it('should execute default getEcho', () => {
            const result = system.executeTool('getEcho', { echoId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute tool with no context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
        });

        it('should execute default recruitEcho tool', () => {
            const result = system.executeTool('recruitEcho', { masterId: 'm1' });
            expect(result.success).toBe(true);
            expect(result.result.echo.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('echoRecruited', () => count++);
            unregister();
            system.recruitEcho({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('echoRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitEcho({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEchoes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalEchoes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitEcho({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.echoes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitEcho({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationEcho();
            newSys.fromJSON(json);
            expect(newSys.echoes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.echoCount).toBe(0);
            expect(stats.totalEchoes).toBe(0);
        });
    });

    describe('config defaults', () => {
        it('should accept custom config', () => {
            const sys = new CultivationEcho({ maxEchoes: 50, baseReverberation: 10 });
            expect(sys.config.maxEchoes).toBe(50);
            expect(sys.config.baseReverberation).toBe(10);
        });
    });
});
