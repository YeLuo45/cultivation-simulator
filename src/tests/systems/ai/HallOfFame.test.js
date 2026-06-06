/**
 * HallOfFame.test.js - 名人堂系统测试
 * V463 Iteration 10/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HallOfFame } from '../../../systems/ai/HallOfFame.js';

describe('HallOfFame', () => {
    let system;
    beforeEach(() => { system = new HallOfFame(); });

    describe('constructor', () => {
        it('should initialize with defaults', () => {
            expect(system.config.maxLegends).toBe(200);
            expect(system.config.baseFame).toBe(100);
        });

        it('should accept custom config', () => {
            const s = new HallOfFame({ maxLegends: 50, baseFame: 500 });
            expect(s.config.maxLegends).toBe(50);
            expect(s.config.baseFame).toBe(500);
        });

        it('should initialize stats', () => {
            expect(system.stats.totalLegends).toBe(0);
            expect(system.stats.evolutionCount).toBe(0);
        });

        it('should start with empty legends', () => {
            expect(system.legends.size).toBe(0);
        });
    });

    describe('registerLegend', () => {
        it('should register', () => {
            const { legend } = system.registerLegend({ cultivatorId: 'c1', name: 'Xiao Ming' });
            expect(legend.cultivatorId).toBe('c1');
            expect(legend.name).toBe('Xiao Ming');
        });

        it('should set defaults', () => {
            const { legend } = system.registerLegend({ cultivatorId: 'c1' });
            expect(legend.fame).toBe(100);
            expect(legend.achievements).toEqual([]);
            expect(legend.yearsActive).toBe(0);
            expect(legend.status).toBe('rising');
        });

        it('should accept custom fame', () => {
            const { legend } = system.registerLegend({ cultivatorId: 'c1', fame: 500 });
            expect(legend.fame).toBe(500);
        });

        it('should accept custom yearsActive', () => {
            const { legend } = system.registerLegend({ cultivatorId: 'c1', yearsActive: 20 });
            expect(legend.yearsActive).toBe(20);
        });

        it('should accept custom id', () => {
            const { legend } = system.registerLegend({ id: 'leg_custom', cultivatorId: 'c1' });
            expect(legend.legendId).toBe('leg_custom');
        });

        it('should trigger legendRegistered hook', () => {
            let called = false;
            system.registerHook('legendRegistered', () => { called = true; });
            system.registerLegend({});
            expect(called).toBe(true);
        });

        it('should increment totalLegends', () => {
            system.registerLegend({});
            expect(system.stats.totalLegends).toBe(1);
        });
    });

    describe('getLegend', () => {
        it('should return', () => {
            const { legend } = system.registerLegend({});
            expect(system.getLegend(legend.legendId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLegend('ghost')).toBeNull(); });
    });

    describe('listLegends', () => {
        it('should list all', () => {
            system.registerLegend({});
            system.registerLegend({});
            expect(system.listLegends().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listLegends()).toEqual([]);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.registerLegend({ cultivatorId: 'c1' });
            system.registerLegend({ cultivatorId: 'c2' });
            system.registerLegend({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
        });

        it('should return empty for unknown cultivator', () => {
            system.registerLegend({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c9')).toEqual([]);
        });
    });

    describe('listTop', () => {
        it('should return top n by fame', () => {
            system.registerLegend({ cultivatorId: 'c1', fame: 500 });
            system.registerLegend({ cultivatorId: 'c2', fame: 2000 });
            system.registerLegend({ cultivatorId: 'c3', fame: 1000 });
            const top = system.listTop(2);
            expect(top.length).toBe(2);
            expect(top[0].fame).toBe(2000);
        });

        it('should use default n=10', () => {
            for (let i = 0; i < 12; i++) system.registerLegend({ fame: i * 100 });
            expect(system.listTop().length).toBe(10);
        });

        it('should return all if fewer than n', () => {
            system.registerLegend({});
            system.registerLegend({});
            expect(system.listTop(10).length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const r1 = system.registerLegend({ cultivatorId: 'c1' }).legend;
            system.registerLegend({ cultivatorId: 'c2' });
            system.gainFame(r1.legendId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.registerLegend({});
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('gainFame', () => {
        it('should gain fame', () => {
            const { legend } = system.registerLegend({});
            system.gainFame(legend.legendId, 50);
            expect(legend.fame).toBe(150);
        });

        it('should use default amount', () => {
            const { legend } = system.registerLegend({});
            system.gainFame(legend.legendId);
            expect(legend.fame).toBe(105);
        });

        it('should set status to legendary', () => {
            const { legend } = system.registerLegend({});
            system.gainFame(legend.legendId);
            expect(legend.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.gainFame('ghost', 10);
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger fameGained hook', () => {
            const { legend } = system.registerLegend({});
            let called = false;
            system.registerHook('fameGained', () => { called = true; });
            system.gainFame(legend.legendId, 10);
            expect(called).toBe(true);
        });
    });

    describe('addAchievement', () => {
        it('should add achievement', () => {
            const { legend } = system.registerLegend({});
            system.addAchievement(legend.legendId, 'immortal-killer');
            expect(legend.achievements).toContain('immortal-killer');
        });

        it('should support multiple achievements', () => {
            const { legend } = system.registerLegend({});
            system.addAchievement(legend.legendId, 'a1');
            system.addAchievement(legend.legendId, 'a2');
            expect(legend.achievements.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addAchievement('ghost', 'x');
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger achievementAdded hook', () => {
            const { legend } = system.registerLegend({});
            let called = false;
            system.registerHook('achievementAdded', () => { called = true; });
            system.addAchievement(legend.legendId, 'a1');
            expect(called).toBe(true);
        });
    });

    describe('ascendToEternal', () => {
        it('should ascend when fame >= 1000', () => {
            const { legend } = system.registerLegend({ fame: 1500 });
            system.ascendToEternal(legend.legendId);
            expect(legend.status).toBe('eternal');
        });

        it('should reject when fame < 1000', () => {
            const { legend } = system.registerLegend({ fame: 500 });
            const result = system.ascendToEternal(legend.legendId);
            expect(result.error).toBe('INSUFFICIENT_FAME');
            expect(legend.status).toBe('rising');
        });

        it('should reject missing', () => {
            const result = system.ascendToEternal('ghost');
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger legendAscended hook', () => {
            const { legend } = system.registerLegend({ fame: 1500 });
            let called = false;
            system.registerHook('legendAscended', () => { called = true; });
            system.ascendToEternal(legend.legendId);
            expect(called).toBe(true);
        });

        it('should not override eternal after gainFame', () => {
            const { legend } = system.registerLegend({ fame: 2000 });
            system.ascendToEternal(legend.legendId);
            system.gainFame(legend.legendId, 100);
            expect(legend.status).toBe('eternal');
        });
    });

    describe('calculateFameScore', () => {
        it('should calculate base score', () => {
            const { legend } = system.registerLegend({});
            expect(system.calculateFameScore(legend.legendId)).toBe(1000);
        });

        it('should add achievements weight', () => {
            const { legend } = system.registerLegend({});
            system.addAchievement(legend.legendId, 'a1');
            system.addAchievement(legend.legendId, 'a2');
            expect(system.calculateFameScore(legend.legendId)).toBe(1200);
        });

        it('should add yearsActive weight', () => {
            const { legend } = system.registerLegend({ yearsActive: 5 });
            expect(system.calculateFameScore(legend.legendId)).toBe(1250);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFameScore('ghost')).toBe(0);
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

        it('should list default tools', () => {
            const tools = system.listTools();
            expect(tools).toContain('getLegend');
            expect(tools).toContain('registerLegend');
        });

        it('should execute default getLegend', () => {
            const result = system.executeTool('getLegend', { legendId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default registerLegend', () => {
            const result = system.executeTool('registerLegend', { cultivatorId: 'c1' });
            expect(result.result.success).toBe(true);
            expect(result.result.legend.cultivatorId).toBe('c1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('legendRegistered', () => count++);
            unregister();
            system.registerLegend({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('legendRegistered', () => { throw new Error('x'); });
            expect(() => system.registerLegend({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLegends = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxLegends).toBe(230);
        });
        it('should not double evolve', () => {
            system.stats.totalLegends = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerLegend({});
            const json = system.toJSON();
            expect(json.legends.length).toBe(1);
            expect(json.stats.totalLegends).toBe(1);
        });
        it('should deserialize', () => {
            system.registerLegend({});
            const json = system.toJSON();
            const newSys = new HallOfFame();
            newSys.fromJSON(json);
            expect(newSys.legends.size).toBe(1);
        });

        it('should handle partial deserialize', () => {
            const newSys = new HallOfFame();
            newSys.fromJSON({});
            expect(newSys.legends.size).toBe(0);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.registerLegend({});
            const stats = system.getStats();
            expect(stats.legendCount).toBe(1);
            expect(stats.totalLegends).toBe(1);
        });
    });
});
