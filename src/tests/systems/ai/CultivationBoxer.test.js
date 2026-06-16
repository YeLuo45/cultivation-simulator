/**
 * CultivationBoxer.test.js - 修真拳师测试
 * V618 Iteration 1/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBoxer } from '../../../systems/ai/CultivationBoxer.js';

describe('CultivationBoxer', () => {
    let system;
    beforeEach(() => { system = new CultivationBoxer(); });

    describe('recruitBoxer', () => {
        it('should recruit', () => {
            const { boxer } = system.recruitBoxer({ trainerId: 't1', name: 'Bao', type: 'claw' });
            expect(boxer.trainerId).toBe('t1');
            expect(boxer.name).toBe('Bao');
            expect(boxer.type).toBe('claw');
            expect(boxer.power).toBe(20);
            expect(boxer.level).toBe(1);
            expect(boxer.status).toBe('novice');
            expect(boxer.techniques).toEqual([]);
        });

        it('should generate boxerId when missing', () => {
            const { boxer } = system.recruitBoxer({});
            expect(boxer.boxerId).toBeTruthy();
            expect(typeof boxer.boxerId).toBe('string');
        });

        it('should use provided boxerId', () => {
            const { boxer } = system.recruitBoxer({ boxerId: 'custom_id' });
            expect(boxer.boxerId).toBe('custom_id');
        });

        it('should trigger boxerRecruited hook', () => {
            let called = false;
            system.registerHook('boxerRecruited', () => { called = true; });
            system.recruitBoxer({});
            expect(called).toBe(true);
        });

        it('should increment totalBoxers stat', () => {
            expect(system.stats.totalBoxers).toBe(0);
            system.recruitBoxer({});
            system.recruitBoxer({});
            expect(system.stats.totalBoxers).toBe(2);
        });
    });

    describe('getBoxer', () => {
        it('should return', () => {
            const { boxer } = system.recruitBoxer({});
            expect(system.getBoxer(boxer.boxerId)).not.toBeNull();
            expect(system.getBoxer(boxer.boxerId).boxerId).toBe(boxer.boxerId);
        });
        it('should return null for missing', () => { expect(system.getBoxer('ghost')).toBeNull(); });
    });

    describe('listBoxers', () => {
        it('should list all', () => {
            system.recruitBoxer({});
            system.recruitBoxer({});
            expect(system.listBoxers().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listBoxers().length).toBe(0);
        });
    });

    describe('listByTrainer', () => {
        it('should filter', () => {
            system.recruitBoxer({ trainerId: 't1' });
            system.recruitBoxer({ trainerId: 't2' });
            expect(system.listByTrainer('t1').length).toBe(1);
            expect(system.listByTrainer('t2').length).toBe(1);
        });

        it('should return empty for unknown trainer', () => {
            system.recruitBoxer({ trainerId: 't1' });
            expect(system.listByTrainer('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { boxer } = system.recruitBoxer({});
            system.legendBoxer(boxer.boxerId);
            system.recruitBoxer({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendaries', () => {
            system.recruitBoxer({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTechnique', () => {
        it('should add technique', () => {
            const { boxer } = system.recruitBoxer({});
            system.addTechnique(boxer.boxerId, 'Iron Fist');
            expect(boxer.techniques).toContain('Iron Fist');
            expect(boxer.techniques.length).toBe(1);
        });

        it('should add multiple techniques', () => {
            const { boxer } = system.recruitBoxer({});
            system.addTechnique(boxer.boxerId, 'Iron Fist');
            system.addTechnique(boxer.boxerId, 'Dragon Palm');
            expect(boxer.techniques.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addTechnique('ghost', 'Hammer Strike');
            expect(result.error).toBe('BOXER_NOT_FOUND');
        });

        it('should trigger techniqueAdded hook', () => {
            const { boxer } = system.recruitBoxer({});
            let called = false;
            system.registerHook('techniqueAdded', () => { called = true; });
            system.addTechnique(boxer.boxerId, 'Tiger Claw');
            expect(called).toBe(true);
        });
    });

    describe('buildPower', () => {
        it('should build power with amount', () => {
            const { boxer } = system.recruitBoxer({});
            system.buildPower(boxer.boxerId, 10);
            expect(boxer.power).toBe(30);
        });

        it('should build power with default', () => {
            const { boxer } = system.recruitBoxer({});
            system.buildPower(boxer.boxerId);
            expect(boxer.power).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.buildPower('ghost', 10);
            expect(result.error).toBe('BOXER_NOT_FOUND');
        });

        it('should trigger powerBuilt hook', () => {
            const { boxer } = system.recruitBoxer({});
            let called = false;
            system.registerHook('powerBuilt', () => { called = true; });
            system.buildPower(boxer.boxerId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBoxer', () => {
        it('should level up', () => {
            const { boxer } = system.recruitBoxer({});
            system.levelUpBoxer(boxer.boxerId);
            expect(boxer.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { boxer } = system.recruitBoxer({});
            for (let i = 0; i < 4; i++) system.levelUpBoxer(boxer.boxerId);
            expect(boxer.level).toBe(5);
            expect(boxer.status).toBe('veteran');
        });

        it('should not downgrade status on subsequent level up', () => {
            const { boxer } = system.recruitBoxer({});
            for (let i = 0; i < 6; i++) system.levelUpBoxer(boxer.boxerId);
            expect(boxer.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpBoxer('ghost');
            expect(result.error).toBe('BOXER_NOT_FOUND');
        });

        it('should trigger boxerLeveledUp hook', () => {
            const { boxer } = system.recruitBoxer({});
            let called = false;
            system.registerHook('boxerLeveledUp', () => { called = true; });
            system.levelUpBoxer(boxer.boxerId);
            expect(called).toBe(true);
        });
    });

    describe('legendBoxer', () => {
        it('should legendize', () => {
            const { boxer } = system.recruitBoxer({});
            system.legendBoxer(boxer.boxerId);
            expect(boxer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBoxer('ghost');
            expect(result.error).toBe('BOXER_NOT_FOUND');
        });

        it('should trigger boxerLegendized hook', () => {
            const { boxer } = system.recruitBoxer({});
            let called = false;
            system.registerHook('boxerLegendized', () => { called = true; });
            system.legendBoxer(boxer.boxerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBoxerValue', () => {
        it('should calculate', () => {
            const { boxer } = system.recruitBoxer({});
            system.levelUpBoxer(boxer.boxerId);
            system.buildPower(boxer.boxerId, 5);
            system.addTechnique(boxer.boxerId, 'Iron Fist');
            // level=2, power=25, techniques.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateBoxerValue(boxer.boxerId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBoxerValue('ghost')).toBe(0);
        });

        it('should calculate default value', () => {
            const { boxer } = system.recruitBoxer({});
            // level=1, power=20, techniques.length=0 => 1*100 + 20*2 + 0*30 = 100+40+0 = 140
            expect(system.calculateBoxerValue(boxer.boxerId)).toBe(140);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { boxer } = system.recruitBoxer({});
            for (let i = 0; i < 4; i++) system.levelUpBoxer(boxer.boxerId);
            system.recruitBoxer({});
            expect(system.listVeterans().length).toBe(1);
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

        it('should execute default getBoxer', () => {
            const result = system.executeTool('getBoxer', { boxerId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('boxerRecruited', () => count++);
            unregister();
            system.recruitBoxer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('boxerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBoxer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBoxers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBoxers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBoxer({});
            const json = system.toJSON();
            expect(json.boxers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBoxer({});
            const json = system.toJSON();
            const newSys = new CultivationBoxer();
            newSys.fromJSON(json);
            expect(newSys.boxers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.boxerCount).toBe(0);
        });
    });
});
