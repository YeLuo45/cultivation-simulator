/**
 * CultivationElectromancer.test.js - 修真雷电师测试
 * V630 Iteration 13/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationElectromancer } from '../../../systems/ai/CultivationElectromancer.js';

describe('CultivationElectromancer', () => {
    let system;
    beforeEach(() => { system = new CultivationElectromancer(); });

    describe('recruitElectromancer', () => {
        it('should recruit', () => {
            const { electromancer } = system.recruitElectromancer({ mentorId: 'm1', name: 'Zap' });
            expect(electromancer.mentorId).toBe('m1');
            expect(electromancer.name).toBe('Zap');
        });

        it('should default to baseVoltage', () => {
            const { electromancer } = system.recruitElectromancer({});
            expect(electromancer.voltage).toBe(20);
        });

        it('should default name to Anonymous', () => {
            const { electromancer } = system.recruitElectromancer({});
            expect(electromancer.name).toBe('Anonymous');
        });

        it('should default type to lightning', () => {
            const { electromancer } = system.recruitElectromancer({});
            expect(electromancer.type).toBe('lightning');
        });

        it('should default status to novice', () => {
            const { electromancer } = system.recruitElectromancer({});
            expect(electromancer.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { electromancer } = system.recruitElectromancer({});
            expect(electromancer.level).toBe(1);
        });

        it('should accept custom type and voltage', () => {
            const { electromancer } = system.recruitElectromancer({ type: 'thunder', voltage: 100 });
            expect(electromancer.type).toBe('thunder');
            expect(electromancer.voltage).toBe(100);
        });

        it('should generate id when not provided', () => {
            const { electromancer } = system.recruitElectromancer({});
            expect(electromancer.electromancerId).toBeTruthy();
        });

        it('should use provided id', () => {
            const { electromancer } = system.recruitElectromancer({ id: 'e_custom' });
            expect(electromancer.electromancerId).toBe('e_custom');
        });

        it('should trigger electromancerRecruited hook', () => {
            let called = false;
            system.registerHook('electromancerRecruited', () => { called = true; });
            system.recruitElectromancer({});
            expect(called).toBe(true);
        });

        it('should increment stats', () => {
            system.recruitElectromancer({});
            expect(system.stats.totalElectromancers).toBe(1);
        });
    });

    describe('getElectromancer', () => {
        it('should return electromancer', () => {
            const { electromancer } = system.recruitElectromancer({});
            expect(system.getElectromancer(electromancer.electromancerId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getElectromancer('ghost')).toBeNull();
        });
    });

    describe('listElectromancers', () => {
        it('should list all', () => {
            system.recruitElectromancer({});
            expect(system.listElectromancers().length).toBe(1);
        });

        it('should return empty when none', () => {
            expect(system.listElectromancers().length).toBe(0);
        });
    });

    describe('listByMentor', () => {
        it('should filter by mentor', () => {
            system.recruitElectromancer({ mentorId: 'm1' });
            system.recruitElectromancer({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });

        it('should return empty for unknown mentor', () => {
            system.recruitElectromancer({ mentorId: 'm1' });
            expect(system.listByMentor('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.legendElectromancer(electromancer.electromancerId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should not include novices', () => {
            system.recruitElectromancer({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStorm', () => {
        it('should add storm', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.addStorm(electromancer.electromancerId, 'thunderclap');
            expect(electromancer.storms).toContain('thunderclap');
        });

        it('should reject missing', () => {
            const result = system.addStorm('ghost', 'x');
            expect(result.error).toBe('ELECTROMANCER_NOT_FOUND');
        });

        it('should trigger stormAdded hook', () => {
            const { electromancer } = system.recruitElectromancer({});
            let called = false;
            system.registerHook('stormAdded', () => { called = true; });
            system.addStorm(electromancer.electromancerId, 'tempest');
            expect(called).toBe(true);
        });

        it('should add multiple storms', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.addStorm(electromancer.electromancerId, 's1');
            system.addStorm(electromancer.electromancerId, 's2');
            expect(electromancer.storms.length).toBe(2);
        });
    });

    describe('increaseVoltage', () => {
        it('should increase by default', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.increaseVoltage(electromancer.electromancerId);
            expect(electromancer.voltage).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.increaseVoltage(electromancer.electromancerId, 50);
            expect(electromancer.voltage).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.increaseVoltage('ghost', 10);
            expect(result.error).toBe('ELECTROMANCER_NOT_FOUND');
        });

        it('should trigger voltageIncreased hook', () => {
            const { electromancer } = system.recruitElectromancer({});
            let called = false;
            system.registerHook('voltageIncreased', () => { called = true; });
            system.increaseVoltage(electromancer.electromancerId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpElectromancer', () => {
        it('should level up', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.levelUpElectromancer(electromancer.electromancerId);
            expect(electromancer.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpElectromancer('ghost');
            expect(result.error).toBe('ELECTROMANCER_NOT_FOUND');
        });

        it('should promote to veteran at level 5', () => {
            const { electromancer } = system.recruitElectromancer({});
            for (let i = 0; i < 4; i++) system.levelUpElectromancer(electromancer.electromancerId);
            expect(electromancer.status).toBe('veteran');
        });

        it('should stay novice before level 5', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.levelUpElectromancer(electromancer.electromancerId);
            expect(electromancer.status).toBe('novice');
        });

        it('should trigger electromancerLeveledUp hook', () => {
            const { electromancer } = system.recruitElectromancer({});
            let called = false;
            system.registerHook('electromancerLeveledUp', () => { called = true; });
            system.levelUpElectromancer(electromancer.electromancerId);
            expect(called).toBe(true);
        });
    });

    describe('legendElectromancer', () => {
        it('should set status to legendary', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.legendElectromancer(electromancer.electromancerId);
            expect(electromancer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendElectromancer('ghost');
            expect(result.error).toBe('ELECTROMANCER_NOT_FOUND');
        });

        it('should trigger electromancerLegendized hook', () => {
            const { electromancer } = system.recruitElectromancer({});
            let called = false;
            system.registerHook('electromancerLegendized', () => { called = true; });
            system.legendElectromancer(electromancer.electromancerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateElectromancerValue', () => {
        it('should calculate value', () => {
            const { electromancer } = system.recruitElectromancer({});
            // level=1, voltage=20, storms=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateElectromancerValue(electromancer.electromancerId)).toBe(140);
        });

        it('should include storms', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.addStorm(electromancer.electromancerId, 's1');
            // 1*100 + 20*2 + 1*30 = 170
            expect(system.calculateElectromancerValue(electromancer.electromancerId)).toBe(170);
        });

        it('should reflect level', () => {
            const { electromancer } = system.recruitElectromancer({});
            system.levelUpElectromancer(electromancer.electromancerId);
            // 2*100 + 20*2 + 0*30 = 240
            expect(system.calculateElectromancerValue(electromancer.electromancerId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateElectromancerValue('ghost')).toBe(0);
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
            expect(system.listTools()).toContain('getElectromancer');
            expect(system.listTools()).toContain('recruitElectromancer');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('electromancerRecruited', () => count++);
            unregister();
            system.recruitElectromancer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('electromancerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitElectromancer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalElectromancers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalElectromancers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitElectromancer({});
            const json = system.toJSON();
            expect(json.electromancers.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitElectromancer({});
            const json = system.toJSON();
            const newSys = new CultivationElectromancer();
            newSys.fromJSON(json);
            expect(newSys.electromancers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.electromancerCount).toBe(0);
        });

        it('should reflect count after recruit', () => {
            system.recruitElectromancer({});
            expect(system.getStats().electromancerCount).toBe(1);
        });
    });
});
