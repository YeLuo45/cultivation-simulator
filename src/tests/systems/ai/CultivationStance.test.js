/**
 * CultivationStance.test.js - 修真架势测试
 * V695 Iteration 18/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationStance } from '../../../systems/ai/CultivationStance.js';

describe('CultivationStance', () => {
    let system;
    beforeEach(() => { system = new CultivationStance(); });

    describe('recruitStance', () => {
        it('should recruit', () => {
            const { stance } = system.recruitStance({ masterId: 'm1', name: 'horse-stance', type: 'horse' });
            expect(stance.masterId).toBe('m1');
            expect(stance.name).toBe('horse-stance');
            expect(stance.type).toBe('horse');
        });

        it('should default type to horse', () => {
            const { stance } = system.recruitStance({ masterId: 'm1' });
            expect(stance.type).toBe('horse');
        });

        it('should set default stability from config', () => {
            const { stance } = system.recruitStance({ masterId: 'm1' });
            expect(stance.stability).toBe(20);
        });

        it('should initialize level 1 and status novice', () => {
            const { stance } = system.recruitStance({ masterId: 'm1' });
            expect(stance.level).toBe(1);
            expect(stance.status).toBe('novice');
        });

        it('should respect custom stability and transitions', () => {
            const { stance } = system.recruitStance({ masterId: 'm1', stability: 50, transitions: ['t1', 't2'] });
            expect(stance.stability).toBe(50);
            expect(stance.transitions.length).toBe(2);
        });

        it('should trigger stanceRecruited hook', () => {
            let called = false;
            system.registerHook('stanceRecruited', () => { called = true; });
            system.recruitStance({});
            expect(called).toBe(true);
        });
    });

    describe('getStance', () => {
        it('should return stance', () => {
            const { stance } = system.recruitStance({});
            expect(system.getStance(stance.stanceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStance('ghost')).toBeNull(); });
    });

    describe('listStances', () => {
        it('should list all', () => {
            system.recruitStance({});
            system.recruitStance({});
            expect(system.listStances().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitStance({ masterId: 'm1' });
            system.recruitStance({ masterId: 'm2' });
            system.recruitStance({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary stances', () => {
            const { stance: a } = system.recruitStance({});
            const { stance: b } = system.recruitStance({});
            system.legendStance(b.stanceId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addTransition', () => {
        it('should add transition', () => {
            const { stance } = system.recruitStance({});
            system.addTransition(stance.stanceId, 'flowing-step');
            expect(stance.transitions.length).toBe(1);
            expect(stance.transitions[0]).toBe('flowing-step');
        });

        it('should reject missing', () => {
            const result = system.addTransition('ghost', 'x');
            expect(result.error).toBe('STANCE_NOT_FOUND');
        });

        it('should trigger transitionAdded hook', () => {
            const { stance } = system.recruitStance({});
            let payload = null;
            system.registerHook('transitionAdded', (d) => { payload = d; });
            system.addTransition(stance.stanceId, 'leap');
            expect(payload.transition).toBe('leap');
        });
    });

    describe('strengthenStability', () => {
        it('should strengthen with default amount', () => {
            const { stance } = system.recruitStance({});
            system.strengthenStability(stance.stanceId);
            expect(stance.stability).toBe(25);
        });

        it('should strengthen with custom amount', () => {
            const { stance } = system.recruitStance({});
            system.strengthenStability(stance.stanceId, 10);
            expect(stance.stability).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.strengthenStability('ghost', 5);
            expect(result.error).toBe('STANCE_NOT_FOUND');
        });

        it('should trigger stabilityStrengthened hook', () => {
            const { stance } = system.recruitStance({});
            let called = false;
            system.registerHook('stabilityStrengthened', () => { called = true; });
            system.strengthenStability(stance.stanceId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpStance', () => {
        it('should level up', () => {
            const { stance } = system.recruitStance({});
            system.levelUpStance(stance.stanceId);
            expect(stance.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { stance } = system.recruitStance({});
            for (let i = 0; i < 4; i++) system.levelUpStance(stance.stanceId);
            expect(stance.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpStance('ghost');
            expect(result.error).toBe('STANCE_NOT_FOUND');
        });

        it('should trigger stanceLeveledUp hook', () => {
            const { stance } = system.recruitStance({});
            let called = false;
            system.registerHook('stanceLeveledUp', () => { called = true; });
            system.levelUpStance(stance.stanceId);
            expect(called).toBe(true);
        });
    });

    describe('legendStance', () => {
        it('should mark legendary', () => {
            const { stance } = system.recruitStance({});
            system.legendStance(stance.stanceId);
            expect(stance.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendStance('ghost');
            expect(result.error).toBe('STANCE_NOT_FOUND');
        });

        it('should trigger stanceLegendized hook', () => {
            const { stance } = system.recruitStance({});
            let called = false;
            system.registerHook('stanceLegendized', () => { called = true; });
            system.legendStance(stance.stanceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateStanceValue', () => {
        it('should calculate', () => {
            const { stance } = system.recruitStance({});
            // level=1*100 + stability=20*2 + transitions=0*30 = 140
            expect(system.calculateStanceValue(stance.stanceId)).toBe(140);
        });

        it('should incorporate level, stability, transitions', () => {
            const { stance } = system.recruitStance({});
            system.levelUpStance(stance.stanceId); // level 2
            system.strengthenStability(stance.stanceId, 5); // stability 25
            system.addTransition(stance.stanceId, 'a');
            system.addTransition(stance.stanceId, 'b');
            // 2*100 + 25*2 + 2*30 = 200 + 50 + 60 = 310
            expect(system.calculateStanceValue(stance.stanceId)).toBe(310);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateStanceValue('ghost')).toBe(0);
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

        it('should execute default getStance and recruitStance tools', () => {
            const recruit = system.executeTool('recruitStance', { masterId: 'm1' });
            expect(recruit.result.success).toBe(true);
            const get = system.executeTool('getStance', { stanceId: recruit.result.stance.stanceId });
            expect(get.result).not.toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('stanceRecruited', () => count++);
            unregister();
            system.recruitStance({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('stanceRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitStance({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalStances = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStances = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitStance({});
            const json = system.toJSON();
            expect(json.stances.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitStance({});
            const json = system.toJSON();
            const newSys = new CultivationStance();
            newSys.fromJSON(json);
            expect(newSys.stances.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.stanceCount).toBe(0);
        });
    });
});
