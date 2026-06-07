/**
 * CultivationPierce.test.js - 修真刺穿测试
 * V734 Iteration 27/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPierce } from '../../../systems/ai/CultivationPierce.js';

describe('CultivationPierce', () => {
    let system;
    beforeEach(() => { system = new CultivationPierce(); });

    describe('recruitPierce', () => {
        it('should recruit', () => {
            const { pierce } = system.recruitPierce({ masterId: 'm1', name: 'Sky Piercer' });
            expect(pierce.masterId).toBe('m1');
            expect(pierce.name).toBe('Sky Piercer');
        });

        it('should trigger pierceRecruited hook', () => {
            let called = false;
            system.registerHook('pierceRecruited', () => { called = true; });
            system.recruitPierce({});
            expect(called).toBe(true);
        });
    });

    describe('getPierce', () => {
        it('should return', () => {
            const { pierce } = system.recruitPierce({});
            expect(system.getPierce(pierce.pierceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPierce('ghost')).toBeNull(); });
    });

    describe('listPierces', () => {
        it('should list all', () => {
            system.recruitPierce({});
            system.recruitPierce({});
            expect(system.listPierces().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitPierce({ masterId: 'm1' });
            system.recruitPierce({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.recruitPierce({ type: 'arrow' });
            system.recruitPierce({ type: 'lance' });
            expect(system.listByType('lance').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { pierce } = system.recruitPierce({});
            system.legendPierce(pierce.pierceId);
            system.recruitPierce({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addPenetration', () => {
        it('should add', () => {
            const { pierce } = system.recruitPierce({});
            system.addPenetration(pierce.pierceId, 'armor-pierce');
            expect(pierce.penetrations.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addPenetration('ghost', 'armor-pierce');
            expect(result.error).toBe('PIERCE_NOT_FOUND');
        });

        it('should trigger penetrationAdded hook', () => {
            const { pierce } = system.recruitPierce({});
            let called = false;
            system.registerHook('penetrationAdded', () => { called = true; });
            system.addPenetration(pierce.pierceId, 'spirit-pierce');
            expect(called).toBe(true);
        });
    });

    describe('raiseSharpness', () => {
        it('should raise', () => {
            const { pierce } = system.recruitPierce({});
            system.raiseSharpness(pierce.pierceId, 10);
            expect(pierce.sharpness).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseSharpness('ghost', 5);
            expect(result.error).toBe('PIERCE_NOT_FOUND');
        });

        it('should trigger sharpnessRaised hook', () => {
            const { pierce } = system.recruitPierce({});
            let called = false;
            system.registerHook('sharpnessRaised', () => { called = true; });
            system.raiseSharpness(pierce.pierceId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPierce', () => {
        it('should level up', () => {
            const { pierce } = system.recruitPierce({});
            system.levelUpPierce(pierce.pierceId);
            expect(pierce.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpPierce('ghost');
            expect(result.error).toBe('PIERCE_NOT_FOUND');
        });

        it('should trigger pierceLeveledUp hook', () => {
            const { pierce } = system.recruitPierce({});
            let called = false;
            system.registerHook('pierceLeveledUp', () => { called = true; });
            system.levelUpPierce(pierce.pierceId);
            expect(called).toBe(true);
        });
    });

    describe('veteranPierce', () => {
        it('should veteranize', () => {
            const { pierce } = system.recruitPierce({});
            system.veteranPierce(pierce.pierceId);
            expect(pierce.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.veteranPierce('ghost');
            expect(result.error).toBe('PIERCE_NOT_FOUND');
        });
    });

    describe('legendPierce', () => {
        it('should legendize', () => {
            const { pierce } = system.recruitPierce({});
            system.legendPierce(pierce.pierceId);
            expect(pierce.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPierce('ghost');
            expect(result.error).toBe('PIERCE_NOT_FOUND');
        });

        it('should trigger pierceLegendized hook', () => {
            const { pierce } = system.recruitPierce({});
            let called = false;
            system.registerHook('pierceLegendized', () => { called = true; });
            system.legendPierce(pierce.pierceId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePierceValue', () => {
        it('should calculate', () => {
            const { pierce } = system.recruitPierce({});
            system.addPenetration(pierce.pierceId, 'p1');
            // level=1, sharpness=20, penetrations.length=1: 1*100 + 20*2 + 1*30 = 100+40+30 = 170
            expect(system.calculatePierceValue(pierce.pierceId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePierceValue('ghost')).toBe(0);
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

        it('should execute default getPierce', () => {
            const result = system.executeTool('getPierce', { pierceId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('pierceRecruited', () => count++);
            unregister();
            system.recruitPierce({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pierceRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPierce({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPierces = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPierces = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPierce({});
            const json = system.toJSON();
            expect(json.pierces.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPierce({});
            const json = system.toJSON();
            const newSys = new CultivationPierce();
            newSys.fromJSON(json);
            expect(newSys.pierces.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.pierceCount).toBe(0);
        });
    });
});
