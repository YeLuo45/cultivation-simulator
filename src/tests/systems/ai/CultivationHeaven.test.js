/**
 * CultivationHeaven.test.js - 修真天界测试
 * V680 Iteration 3/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHeaven } from '../../../systems/ai/CultivationHeaven.js';

describe('CultivationHeaven', () => {
    let system;
    beforeEach(() => { system = new CultivationHeaven(); });

    describe('recruitHeaven', () => {
        it('should recruit a heaven', () => {
            const { heaven } = system.recruitHeaven({ masterId: 'm1', name: 'Jade Heaven', type: 'third' });
            expect(heaven.masterId).toBe('m1');
            expect(heaven.name).toBe('Jade Heaven');
            expect(heaven.type).toBe('third');
            expect(heaven.status).toBe('novice');
            expect(heaven.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { heaven } = system.recruitHeaven({});
            expect(heaven.name).toBe('Unnamed Heaven');
            expect(heaven.type).toBe('first');
            expect(heaven.divinity).toBe(20);
            expect(heaven.mandates).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { heaven } = system.recruitHeaven({});
            expect(heaven.heavenId).toBeTruthy();
            expect(typeof heaven.heavenId).toBe('string');
        });

        it('should use provided heavenId', () => {
            const { heaven } = system.recruitHeaven({ heavenId: 'custom-heaven-1' });
            expect(heaven.heavenId).toBe('custom-heaven-1');
        });

        it('should trigger heavenRecruited hook', () => {
            let called = false;
            system.registerHook('heavenRecruited', () => { called = true; });
            system.recruitHeaven({});
            expect(called).toBe(true);
        });

        it('should increment totalHeavens stat', () => {
            expect(system.stats.totalHeavens).toBe(0);
            system.recruitHeaven({});
            expect(system.stats.totalHeavens).toBe(1);
            system.recruitHeaven({});
            expect(system.stats.totalHeavens).toBe(2);
        });

        it('should honor custom config baseDivinity', () => {
            const custom = new CultivationHeaven({ baseDivinity: 50 });
            const { heaven } = custom.recruitHeaven({});
            expect(heaven.divinity).toBe(50);
        });
    });

    describe('getHeaven', () => {
        it('should return a heaven', () => {
            const { heaven } = system.recruitHeaven({});
            expect(system.getHeaven(heaven.heavenId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getHeaven('ghost')).toBeNull();
        });
    });

    describe('listHeavens', () => {
        it('should list all', () => {
            system.recruitHeaven({});
            system.recruitHeaven({});
            expect(system.listHeavens().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listHeavens().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitHeaven({ masterId: 'm1' });
            system.recruitHeaven({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitHeaven({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { heaven: h1 } = system.recruitHeaven({});
            system.recruitHeaven({});
            system.legendHeaven(h1.heavenId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitHeaven({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addMandate', () => {
        it('should add mandate', () => {
            const { heaven } = system.recruitHeaven({});
            system.addMandate(heaven.heavenId, 'rule-the-skies');
            expect(heaven.mandates.length).toBe(1);
            expect(heaven.mandates[0]).toBe('rule-the-skies');
        });

        it('should reject missing', () => {
            const result = system.addMandate('ghost', 'x');
            expect(result.error).toBe('HEAVEN_NOT_FOUND');
        });

        it('should trigger mandateAdded hook', () => {
            const { heaven } = system.recruitHeaven({});
            let called = false;
            system.registerHook('mandateAdded', () => { called = true; });
            system.addMandate(heaven.heavenId, 'celestial-mandate');
            expect(called).toBe(true);
        });
    });

    describe('raiseDivinity', () => {
        it('should raise divinity', () => {
            const { heaven } = system.recruitHeaven({});
            system.raiseDivinity(heaven.heavenId, 10);
            expect(heaven.divinity).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { heaven } = system.recruitHeaven({});
            system.raiseDivinity(heaven.heavenId);
            expect(heaven.divinity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDivinity('ghost', 5);
            expect(result.error).toBe('HEAVEN_NOT_FOUND');
        });

        it('should trigger divinityRaised hook', () => {
            const { heaven } = system.recruitHeaven({});
            let called = false;
            system.registerHook('divinityRaised', () => { called = true; });
            system.raiseDivinity(heaven.heavenId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHeaven', () => {
        it('should level up', () => {
            const { heaven } = system.recruitHeaven({});
            system.levelUpHeaven(heaven.heavenId);
            expect(heaven.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpHeaven('ghost');
            expect(result.error).toBe('HEAVEN_NOT_FOUND');
        });

        it('should trigger heavenLeveledUp hook', () => {
            const { heaven } = system.recruitHeaven({});
            let called = false;
            system.registerHook('heavenLeveledUp', () => { called = true; });
            system.levelUpHeaven(heaven.heavenId);
            expect(called).toBe(true);
        });
    });

    describe('legendHeaven', () => {
        it('should set status to legendary', () => {
            const { heaven } = system.recruitHeaven({});
            system.legendHeaven(heaven.heavenId);
            expect(heaven.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHeaven('ghost');
            expect(result.error).toBe('HEAVEN_NOT_FOUND');
        });

        it('should trigger heavenLegendized hook', () => {
            const { heaven } = system.recruitHeaven({});
            let called = false;
            system.registerHook('heavenLegendized', () => { called = true; });
            system.legendHeaven(heaven.heavenId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHeavenValue', () => {
        it('should calculate value', () => {
            const { heaven } = system.recruitHeaven({});
            system.addMandate(heaven.heavenId, 'mandate-1');
            // level=1, divinity=20 (default baseDivinity), mandates=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateHeavenValue(heaven.heavenId)).toBe(170);
        });

        it('should reflect level and divinity changes', () => {
            const { heaven } = system.recruitHeaven({});
            system.levelUpHeaven(heaven.heavenId);
            system.raiseDivinity(heaven.heavenId, 10);
            // level=2, divinity=30, mandates=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateHeavenValue(heaven.heavenId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHeavenValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getHeaven', () => {
            const result = system.executeTool('getHeaven', { heavenId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitHeaven', () => {
            const result = system.executeTool('recruitHeaven', { name: 'ToolHeaven' });
            expect(result.success).toBe(true);
            expect(result.result.heaven.name).toBe('ToolHeaven');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('heavenRecruited', () => count++);
            unregister();
            system.recruitHeaven({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('heavenRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHeaven({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHeavens = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalHeavens = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHeaven({});
            const json = system.toJSON();
            expect(json.heavens.length).toBe(1);
            expect(json.stats.totalHeavens).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHeaven({});
            const json = system.toJSON();
            const newSys = new CultivationHeaven();
            newSys.fromJSON(json);
            expect(newSys.heavens.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.heavenCount).toBe(0);
            expect(stats.totalHeavens).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
