/**
 * CultivationMarble.test.js - 修真大理石系统测试
 * V840 Iteration 13/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMarble } from '../../../systems/ai/CultivationMarble.js';

describe('CultivationMarble', () => {
    let system;
    beforeEach(() => { system = new CultivationMarble(); });

    describe('recruitMarble', () => {
        it('should create', () => {
            const { marble } = system.recruitMarble({ masterId: 'm1', name: 'White Vein' });
            expect(marble.masterId).toBe('m1');
            expect(marble.name).toBe('White Vein');
        });

        it('should default type to carrara', () => {
            const { marble } = system.recruitMarble({});
            expect(marble.type).toBe('carrara');
        });

        it('should default status to novice', () => {
            const { marble } = system.recruitMarble({});
            expect(marble.status).toBe('novice');
        });

        it('should use baseSmoothness default', () => {
            const { marble } = system.recruitMarble({});
            expect(marble.smoothness).toBe(20);
        });

        it('should accept custom id', () => {
            const { marble } = system.recruitMarble({ marbleId: 'custom-id' });
            expect(marble.marbleId).toBe('custom-id');
        });

        it('should trigger marbleRecruited hook', () => {
            let called = false;
            system.registerHook('marbleRecruited', () => { called = true; });
            system.recruitMarble({});
            expect(called).toBe(true);
        });

        it('should accept calacatta type', () => {
            const { marble } = system.recruitMarble({ type: 'calacatta' });
            expect(marble.type).toBe('calacatta');
        });

        it('should accept divine type', () => {
            const { marble } = system.recruitMarble({ type: 'divine' });
            expect(marble.type).toBe('divine');
        });
    });

    describe('getMarble', () => {
        it('should return', () => {
            const { marble } = system.recruitMarble({});
            expect(system.getMarble(marble.marbleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMarble('ghost')).toBeNull(); });
    });

    describe('listMarbles', () => {
        it('should list all', () => {
            system.recruitMarble({});
            system.recruitMarble({});
            expect(system.listMarbles().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listMarbles().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitMarble({ masterId: 'm1' });
            system.recruitMarble({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { marble: m1 } = system.recruitMarble({});
            const { marble: m2 } = system.recruitMarble({});
            system.legendMarble(m2.marbleId);
            expect(system.listLegendary().length).toBe(1);
            expect(m1.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitMarble({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addVein', () => {
        it('should add vein', () => {
            const { marble } = system.recruitMarble({});
            system.addVein(marble.marbleId, 'gold-vein-1');
            expect(marble.veins).toContain('gold-vein-1');
        });

        it('should reject missing', () => {
            const result = system.addVein('ghost', 'vein');
            expect(result.error).toBe('MARBLE_NOT_FOUND');
        });

        it('should trigger veinAdded hook', () => {
            const { marble } = system.recruitMarble({});
            let called = false;
            system.registerHook('veinAdded', () => { called = true; });
            system.addVein(marble.marbleId, 'silver-vein');
            expect(called).toBe(true);
        });
    });

    describe('raiseSmoothness', () => {
        it('should raise smoothness', () => {
            const { marble } = system.recruitMarble({});
            system.raiseSmoothness(marble.marbleId, 10);
            expect(marble.smoothness).toBe(30);
        });

        it('should default amount to 5', () => {
            const { marble } = system.recruitMarble({});
            system.raiseSmoothness(marble.marbleId);
            expect(marble.smoothness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseSmoothness('ghost', 5);
            expect(result.error).toBe('MARBLE_NOT_FOUND');
        });

        it('should trigger smoothnessRaised hook', () => {
            const { marble } = system.recruitMarble({});
            let called = false;
            system.registerHook('smoothnessRaised', () => { called = true; });
            system.raiseSmoothness(marble.marbleId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMarble', () => {
        it('should level up', () => {
            const { marble } = system.recruitMarble({});
            system.levelUpMarble(marble.marbleId);
            expect(marble.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpMarble('ghost');
            expect(result.error).toBe('MARBLE_NOT_FOUND');
        });

        it('should trigger marbleLeveledUp hook', () => {
            const { marble } = system.recruitMarble({});
            let called = false;
            system.registerHook('marbleLeveledUp', () => { called = true; });
            system.levelUpMarble(marble.marbleId);
            expect(called).toBe(true);
        });
    });

    describe('legendMarble', () => {
        it('should legendize', () => {
            const { marble } = system.recruitMarble({});
            system.legendMarble(marble.marbleId);
            expect(marble.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMarble('ghost');
            expect(result.error).toBe('MARBLE_NOT_FOUND');
        });

        it('should trigger marbleLegendized hook', () => {
            const { marble } = system.recruitMarble({});
            let called = false;
            system.registerHook('marbleLegendized', () => { called = true; });
            system.legendMarble(marble.marbleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMarbleValue', () => {
        it('should calculate', () => {
            const { marble } = system.recruitMarble({});
            // level=1 * 100 + smoothness=20 * 2 + veins=0 * 30 = 140
            expect(system.calculateMarbleValue(marble.marbleId)).toBe(140);
        });

        it('should factor in veins', () => {
            const { marble } = system.recruitMarble({});
            system.addVein(marble.marbleId, 'v1');
            system.addVein(marble.marbleId, 'v2');
            // level=1 * 100 + smoothness=20 * 2 + veins=2 * 30 = 200
            expect(system.calculateMarbleValue(marble.marbleId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMarbleValue('ghost')).toBe(0);
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

        it('should execute default getMarble', () => {
            const result = system.executeTool('getMarble', { marbleId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('marbleRecruited', () => count++);
            unregister();
            system.recruitMarble({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('marbleRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMarble({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMarbles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMarbles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMarble({});
            const json = system.toJSON();
            expect(json.marbles.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMarble({});
            const json = system.toJSON();
            const newSys = new CultivationMarble();
            newSys.fromJSON(json);
            expect(newSys.marbles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.marbleCount).toBe(0);
        });
    });
});
