/**
 * CultivationLightning.test.js - 修真电系统测试
 * V809 Iteration 12/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLightning } from '../../../systems/ai/CultivationLightning.js';

describe('CultivationLightning', () => {
    let system;
    beforeEach(() => { system = new CultivationLightning(); });

    describe('recruitLightning', () => {
        it('should recruit', () => {
            const { lightning } = system.recruitLightning({ masterId: 'm1', name: 'Bolt' });
            expect(lightning.masterId).toBe('m1');
            expect(lightning.name).toBe('Bolt');
        });

        it('should default to baseVoltage', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.voltage).toBe(20);
        });

        it('should default name to Anonymous', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.name).toBe('Anonymous');
        });

        it('should default type to forked', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.type).toBe('forked');
        });

        it('should default status to novice', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.level).toBe(1);
        });

        it('should accept custom type and voltage', () => {
            const { lightning } = system.recruitLightning({ type: 'divine', voltage: 100 });
            expect(lightning.type).toBe('divine');
            expect(lightning.voltage).toBe(100);
        });

        it('should accept ball type', () => {
            const { lightning } = system.recruitLightning({ type: 'ball' });
            expect(lightning.type).toBe('ball');
        });

        it('should default masterId to null', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.masterId).toBeNull();
        });

        it('should generate id when not provided', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.lightningId).toBeTruthy();
        });

        it('should use provided id', () => {
            const { lightning } = system.recruitLightning({ id: 'l_custom' });
            expect(lightning.lightningId).toBe('l_custom');
        });

        it('should initialize empty strikes array', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.strikes).toEqual([]);
        });

        it('should set createdAt timestamp', () => {
            const { lightning } = system.recruitLightning({});
            expect(lightning.createdAt).toBeGreaterThan(0);
        });

        it('should trigger lightningRecruited hook', () => {
            let called = false;
            system.registerHook('lightningRecruited', () => { called = true; });
            system.recruitLightning({});
            expect(called).toBe(true);
        });

        it('should increment stats', () => {
            system.recruitLightning({});
            expect(system.stats.totalLightnings).toBe(1);
        });

        it('should return success result', () => {
            const result = system.recruitLightning({});
            expect(result.success).toBe(true);
        });
    });

    describe('getLightning', () => {
        it('should return lightning', () => {
            const { lightning } = system.recruitLightning({});
            expect(system.getLightning(lightning.lightningId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getLightning('ghost')).toBeNull();
        });

        it('should return a copy not the reference', () => {
            const { lightning } = system.recruitLightning({ name: 'Bolt' });
            const fetched = system.getLightning(lightning.lightningId);
            fetched.name = 'Modified';
            expect(lightning.name).toBe('Bolt');
        });
    });

    describe('listLightnings', () => {
        it('should list all', () => {
            system.recruitLightning({});
            expect(system.listLightnings().length).toBe(1);
        });

        it('should return empty when none', () => {
            expect(system.listLightnings().length).toBe(0);
        });

        it('should list multiple', () => {
            system.recruitLightning({});
            system.recruitLightning({});
            system.recruitLightning({});
            expect(system.listLightnings().length).toBe(3);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitLightning({ masterId: 'm1' });
            system.recruitLightning({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitLightning({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should return multiple for same master', () => {
            system.recruitLightning({ masterId: 'm1' });
            system.recruitLightning({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { lightning } = system.recruitLightning({});
            system.legendLightning(lightning.lightningId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should not include novices', () => {
            system.recruitLightning({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should not include veterans', () => {
            const { lightning } = system.recruitLightning({});
            for (let i = 0; i < 5; i++) system.levelUpLightning(lightning.lightningId);
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addStrike', () => {
        it('should add strike', () => {
            const { lightning } = system.recruitLightning({});
            system.addStrike(lightning.lightningId, 'thunderclap');
            expect(lightning.strikes).toContain('thunderclap');
        });

        it('should reject missing', () => {
            const result = system.addStrike('ghost', 'x');
            expect(result.error).toBe('LIGHTNING_NOT_FOUND');
        });

        it('should trigger strikeAdded hook', () => {
            const { lightning } = system.recruitLightning({});
            let called = false;
            system.registerHook('strikeAdded', () => { called = true; });
            system.addStrike(lightning.lightningId, 'tempest');
            expect(called).toBe(true);
        });

        it('should add multiple strikes', () => {
            const { lightning } = system.recruitLightning({});
            system.addStrike(lightning.lightningId, 's1');
            system.addStrike(lightning.lightningId, 's2');
            expect(lightning.strikes.length).toBe(2);
        });
    });

    describe('raiseVoltage', () => {
        it('should raise by default', () => {
            const { lightning } = system.recruitLightning({});
            system.raiseVoltage(lightning.lightningId);
            expect(lightning.voltage).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { lightning } = system.recruitLightning({});
            system.raiseVoltage(lightning.lightningId, 50);
            expect(lightning.voltage).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.raiseVoltage('ghost', 10);
            expect(result.error).toBe('LIGHTNING_NOT_FOUND');
        });

        it('should trigger voltageRaised hook', () => {
            const { lightning } = system.recruitLightning({});
            let called = false;
            system.registerHook('voltageRaised', () => { called = true; });
            system.raiseVoltage(lightning.lightningId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpLightning', () => {
        it('should level up', () => {
            const { lightning } = system.recruitLightning({});
            system.levelUpLightning(lightning.lightningId);
            expect(lightning.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpLightning('ghost');
            expect(result.error).toBe('LIGHTNING_NOT_FOUND');
        });

        it('should promote to veteran at level 5', () => {
            const { lightning } = system.recruitLightning({});
            for (let i = 0; i < 4; i++) system.levelUpLightning(lightning.lightningId);
            expect(lightning.status).toBe('veteran');
        });

        it('should stay novice before level 5', () => {
            const { lightning } = system.recruitLightning({});
            system.levelUpLightning(lightning.lightningId);
            expect(lightning.status).toBe('novice');
        });

        it('should trigger lightningLeveledUp hook', () => {
            const { lightning } = system.recruitLightning({});
            let called = false;
            system.registerHook('lightningLeveledUp', () => { called = true; });
            system.levelUpLightning(lightning.lightningId);
            expect(called).toBe(true);
        });
    });

    describe('legendLightning', () => {
        it('should set status to legendary', () => {
            const { lightning } = system.recruitLightning({});
            system.legendLightning(lightning.lightningId);
            expect(lightning.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendLightning('ghost');
            expect(result.error).toBe('LIGHTNING_NOT_FOUND');
        });

        it('should trigger lightningLegendized hook', () => {
            const { lightning } = system.recruitLightning({});
            let called = false;
            system.registerHook('lightningLegendized', () => { called = true; });
            system.legendLightning(lightning.lightningId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLightningValue', () => {
        it('should calculate value', () => {
            const { lightning } = system.recruitLightning({});
            // level=1, voltage=20, strikes=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateLightningValue(lightning.lightningId)).toBe(140);
        });

        it('should include strikes', () => {
            const { lightning } = system.recruitLightning({});
            system.addStrike(lightning.lightningId, 's1');
            // 1*100 + 20*2 + 1*30 = 170
            expect(system.calculateLightningValue(lightning.lightningId)).toBe(170);
        });

        it('should reflect level', () => {
            const { lightning } = system.recruitLightning({});
            system.levelUpLightning(lightning.lightningId);
            // 2*100 + 20*2 + 0*30 = 240
            expect(system.calculateLightningValue(lightning.lightningId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLightningValue('ghost')).toBe(0);
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
            expect(system.listTools()).toContain('getLightning');
            expect(system.listTools()).toContain('recruitLightning');
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
            const unregister = system.registerHook('lightningRecruited', () => count++);
            unregister();
            system.recruitLightning({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('lightningRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitLightning({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalLightnings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalLightnings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitLightning({});
            const json = system.toJSON();
            expect(json.lightnings.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitLightning({});
            const json = system.toJSON();
            const newSys = new CultivationLightning();
            newSys.fromJSON(json);
            expect(newSys.lightnings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.lightningCount).toBe(0);
        });
    });
});
