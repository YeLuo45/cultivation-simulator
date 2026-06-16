/**
 * CultivationThunder.test.js - 修真雷系统测试
 * V810 Iteration 13/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationThunder } from '../../../systems/ai/CultivationThunder.js';

describe('CultivationThunder', () => {
    let system;
    beforeEach(() => { system = new CultivationThunder(); });

    describe('recruitThunder', () => {
        it('should recruit', () => {
            const { thunder } = system.recruitThunder({ masterId: 'm1', name: 'Roar' });
            expect(thunder.masterId).toBe('m1');
            expect(thunder.name).toBe('Roar');
        });

        it('should default to basePower', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.power).toBe(20);
        });

        it('should default name to Anonymous', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.name).toBe('Anonymous');
        });

        it('should default type to rolling', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.type).toBe('rolling');
        });

        it('should default status to novice', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.level).toBe(1);
        });

        it('should accept custom type and power', () => {
            const { thunder } = system.recruitThunder({ type: 'divine', power: 100 });
            expect(thunder.type).toBe('divine');
            expect(thunder.power).toBe(100);
        });

        it('should accept clap type', () => {
            const { thunder } = system.recruitThunder({ type: 'clap' });
            expect(thunder.type).toBe('clap');
        });

        it('should default masterId to null', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.masterId).toBeNull();
        });

        it('should generate id when not provided', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.thunderId).toBeTruthy();
        });

        it('should use provided id', () => {
            const { thunder } = system.recruitThunder({ id: 't_custom' });
            expect(thunder.thunderId).toBe('t_custom');
        });

        it('should initialize empty booms array', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.booms).toEqual([]);
        });

        it('should set createdAt timestamp', () => {
            const { thunder } = system.recruitThunder({});
            expect(thunder.createdAt).toBeGreaterThan(0);
        });

        it('should trigger thunderRecruited hook', () => {
            let called = false;
            system.registerHook('thunderRecruited', () => { called = true; });
            system.recruitThunder({});
            expect(called).toBe(true);
        });

        it('should increment stats', () => {
            system.recruitThunder({});
            expect(system.stats.totalThunders).toBe(1);
        });

        it('should return success result', () => {
            const result = system.recruitThunder({});
            expect(result.success).toBe(true);
        });
    });

    describe('getThunder', () => {
        it('should return thunder', () => {
            const { thunder } = system.recruitThunder({});
            expect(system.getThunder(thunder.thunderId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getThunder('ghost')).toBeNull();
        });

        it('should return a copy not the reference', () => {
            const { thunder } = system.recruitThunder({ name: 'Roar' });
            const fetched = system.getThunder(thunder.thunderId);
            fetched.name = 'Modified';
            expect(thunder.name).toBe('Roar');
        });
    });

    describe('listThunders', () => {
        it('should list all', () => {
            system.recruitThunder({});
            expect(system.listThunders().length).toBe(1);
        });

        it('should return empty when none', () => {
            expect(system.listThunders().length).toBe(0);
        });

        it('should list multiple', () => {
            system.recruitThunder({});
            system.recruitThunder({});
            system.recruitThunder({});
            expect(system.listThunders().length).toBe(3);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitThunder({ masterId: 'm1' });
            system.recruitThunder({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitThunder({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should return multiple for same master', () => {
            system.recruitThunder({ masterId: 'm1' });
            system.recruitThunder({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { thunder } = system.recruitThunder({});
            system.legendThunder(thunder.thunderId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should not include novices', () => {
            system.recruitThunder({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should not include veterans', () => {
            const { thunder } = system.recruitThunder({});
            for (let i = 0; i < 5; i++) system.levelUpThunder(thunder.thunderId);
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addBoom', () => {
        it('should add boom', () => {
            const { thunder } = system.recruitThunder({});
            system.addBoom(thunder.thunderId, 'thunderclap');
            expect(thunder.booms).toContain('thunderclap');
        });

        it('should reject missing', () => {
            const result = system.addBoom('ghost', 'x');
            expect(result.error).toBe('THUNDER_NOT_FOUND');
        });

        it('should trigger boomAdded hook', () => {
            const { thunder } = system.recruitThunder({});
            let called = false;
            system.registerHook('boomAdded', () => { called = true; });
            system.addBoom(thunder.thunderId, 'tempest');
            expect(called).toBe(true);
        });

        it('should add multiple booms', () => {
            const { thunder } = system.recruitThunder({});
            system.addBoom(thunder.thunderId, 'b1');
            system.addBoom(thunder.thunderId, 'b2');
            expect(thunder.booms.length).toBe(2);
        });
    });

    describe('raisePower', () => {
        it('should raise by default', () => {
            const { thunder } = system.recruitThunder({});
            system.raisePower(thunder.thunderId);
            expect(thunder.power).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { thunder } = system.recruitThunder({});
            system.raisePower(thunder.thunderId, 50);
            expect(thunder.power).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.raisePower('ghost', 10);
            expect(result.error).toBe('THUNDER_NOT_FOUND');
        });

        it('should trigger powerRaised hook', () => {
            const { thunder } = system.recruitThunder({});
            let called = false;
            system.registerHook('powerRaised', () => { called = true; });
            system.raisePower(thunder.thunderId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpThunder', () => {
        it('should level up', () => {
            const { thunder } = system.recruitThunder({});
            system.levelUpThunder(thunder.thunderId);
            expect(thunder.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpThunder('ghost');
            expect(result.error).toBe('THUNDER_NOT_FOUND');
        });

        it('should promote to veteran at level 5', () => {
            const { thunder } = system.recruitThunder({});
            for (let i = 0; i < 4; i++) system.levelUpThunder(thunder.thunderId);
            expect(thunder.status).toBe('veteran');
        });

        it('should stay novice before level 5', () => {
            const { thunder } = system.recruitThunder({});
            system.levelUpThunder(thunder.thunderId);
            expect(thunder.status).toBe('novice');
        });

        it('should trigger thunderLeveledUp hook', () => {
            const { thunder } = system.recruitThunder({});
            let called = false;
            system.registerHook('thunderLeveledUp', () => { called = true; });
            system.levelUpThunder(thunder.thunderId);
            expect(called).toBe(true);
        });
    });

    describe('legendThunder', () => {
        it('should set status to legendary', () => {
            const { thunder } = system.recruitThunder({});
            system.legendThunder(thunder.thunderId);
            expect(thunder.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendThunder('ghost');
            expect(result.error).toBe('THUNDER_NOT_FOUND');
        });

        it('should trigger thunderLegendized hook', () => {
            const { thunder } = system.recruitThunder({});
            let called = false;
            system.registerHook('thunderLegendized', () => { called = true; });
            system.legendThunder(thunder.thunderId);
            expect(called).toBe(true);
        });
    });

    describe('calculateThunderValue', () => {
        it('should calculate value', () => {
            const { thunder } = system.recruitThunder({});
            // level=1, power=20, booms=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateThunderValue(thunder.thunderId)).toBe(140);
        });

        it('should include booms', () => {
            const { thunder } = system.recruitThunder({});
            system.addBoom(thunder.thunderId, 'b1');
            // 1*100 + 20*2 + 1*30 = 170
            expect(system.calculateThunderValue(thunder.thunderId)).toBe(170);
        });

        it('should reflect level', () => {
            const { thunder } = system.recruitThunder({});
            system.levelUpThunder(thunder.thunderId);
            // 2*100 + 20*2 + 0*30 = 240
            expect(system.calculateThunderValue(thunder.thunderId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateThunderValue('ghost')).toBe(0);
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

        it('should list default tools', () => {
            expect(system.listTools()).toContain('getThunder');
            expect(system.listTools()).toContain('recruitThunder');
        });

        it('should handle null context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test', null);
            expect(result.result).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('thunderRecruited', () => count++);
            unregister();
            system.recruitThunder({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('thunderRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitThunder({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalThunders = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalThunders = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitThunder({});
            const json = system.toJSON();
            expect(json.thunders.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitThunder({});
            const json = system.toJSON();
            const newSys = new CultivationThunder();
            newSys.fromJSON(json);
            expect(newSys.thunders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.thunderCount).toBe(0);
        });
    });
});
