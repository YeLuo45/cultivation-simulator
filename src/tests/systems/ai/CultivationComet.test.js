/**
 * CultivationComet.test.js - 修真彗星系统测试
 * V686 Iteration 9/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationComet } from '../../../systems/ai/CultivationComet.js';

describe('CultivationComet', () => {
    let system;
    beforeEach(() => { system = new CultivationComet(); });

    describe('recruitComet', () => {
        it('should recruit', () => {
            const { comet } = system.recruitComet({ masterId: 'm1', name: 'Hale' });
            expect(comet.masterId).toBe('m1');
            expect(comet.name).toBe('Hale');
        });

        it('should default type to meteor', () => {
            const { comet } = system.recruitComet({});
            expect(comet.type).toBe('meteor');
        });

        it('should default speed to baseSpeed', () => {
            const { comet } = system.recruitComet({});
            expect(comet.speed).toBe(20);
        });

        it('should set status to novice', () => {
            const { comet } = system.recruitComet({});
            expect(comet.status).toBe('novice');
        });

        it('should increment stats', () => {
            system.recruitComet({});
            expect(system.stats.totalComets).toBe(1);
        });

        it('should trigger cometRecruited hook', () => {
            let called = false;
            system.registerHook('cometRecruited', () => { called = true; });
            system.recruitComet({});
            expect(called).toBe(true);
        });
    });

    describe('getComet', () => {
        it('should return comet', () => {
            const { comet } = system.recruitComet({});
            expect(system.getComet(comet.cometId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getComet('ghost')).toBeNull(); });
    });

    describe('listComets', () => {
        it('should list all', () => {
            system.recruitComet({});
            system.recruitComet({});
            expect(system.listComets().length).toBe(2);
        });
        it('should return empty list', () => {
            expect(system.listComets().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitComet({ masterId: 'm1' });
            system.recruitComet({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitComet({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { comet } = system.recruitComet({});
            system.legendComet(comet.cometId);
            system.recruitComet({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addTrail', () => {
        it('should add trail', () => {
            const { comet } = system.recruitComet({});
            const result = system.addTrail(comet.cometId, 'Dust Tail');
            expect(result.success).toBe(true);
            expect(comet.trails).toContain('Dust Tail');
        });

        it('should reject missing comet', () => {
            const result = system.addTrail('ghost', 'Dust Tail');
            expect(result.error).toBe('COMET_NOT_FOUND');
        });

        it('should trigger trailAdded hook', () => {
            const { comet } = system.recruitComet({});
            let called = false;
            system.registerHook('trailAdded', () => { called = true; });
            system.addTrail(comet.cometId, 'Dust Tail');
            expect(called).toBe(true);
        });
    });

    describe('raiseSpeed', () => {
        it('should raise by default 5', () => {
            const { comet } = system.recruitComet({});
            system.raiseSpeed(comet.cometId);
            expect(comet.speed).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { comet } = system.recruitComet({});
            system.raiseSpeed(comet.cometId, 10);
            expect(comet.speed).toBe(30);
        });

        it('should reject missing comet', () => {
            const result = system.raiseSpeed('ghost', 5);
            expect(result.error).toBe('COMET_NOT_FOUND');
        });

        it('should trigger speedRaised hook', () => {
            const { comet } = system.recruitComet({});
            let called = false;
            system.registerHook('speedRaised', () => { called = true; });
            system.raiseSpeed(comet.cometId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpComet', () => {
        it('should level up', () => {
            const { comet } = system.recruitComet({});
            system.levelUpComet(comet.cometId);
            expect(comet.level).toBe(2);
        });

        it('should reject missing comet', () => {
            const result = system.levelUpComet('ghost');
            expect(result.error).toBe('COMET_NOT_FOUND');
        });

        it('should trigger cometLeveledUp hook', () => {
            const { comet } = system.recruitComet({});
            let called = false;
            system.registerHook('cometLeveledUp', () => { called = true; });
            system.levelUpComet(comet.cometId);
            expect(called).toBe(true);
        });
    });

    describe('legendComet', () => {
        it('should set status to legendary', () => {
            const { comet } = system.recruitComet({});
            system.legendComet(comet.cometId);
            expect(comet.status).toBe('legendary');
        });

        it('should reject missing comet', () => {
            const result = system.legendComet('ghost');
            expect(result.error).toBe('COMET_NOT_FOUND');
        });

        it('should trigger cometLegendized hook', () => {
            const { comet } = system.recruitComet({});
            let called = false;
            system.registerHook('cometLegendized', () => { called = true; });
            system.legendComet(comet.cometId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCometValue', () => {
        it('should calculate value', () => {
            const { comet } = system.recruitComet({});
            system.levelUpComet(comet.cometId); // level 2
            system.addTrail(comet.cometId, 'A');
            system.addTrail(comet.cometId, 'B');
            // level=2, speed=20, trails=2 -> 2*100 + 20*2 + 2*30 = 200+40+60 = 300
            expect(system.calculateCometValue(comet.cometId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCometValue('ghost')).toBe(0);
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

        it('should execute default getComet', () => {
            const result = system.executeTool('getComet', { cometId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cometRecruited', () => count++);
            unregister();
            system.recruitComet({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cometRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitComet({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalComets = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalComets = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitComet({});
            const json = system.toJSON();
            expect(json.comets.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitComet({});
            const json = system.toJSON();
            const newSys = new CultivationComet();
            newSys.fromJSON(json);
            expect(newSys.comets.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cometCount).toBe(0);
        });
    });
});
