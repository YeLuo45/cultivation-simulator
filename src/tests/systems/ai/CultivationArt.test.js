/**
 * CultivationArt.test.js - 修真艺术测试
 * V697 Iteration 20/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationArt } from '../../../systems/ai/CultivationArt.js';

describe('CultivationArt', () => {
    let system;
    beforeEach(() => { system = new CultivationArt(); });

    describe('recruitArt', () => {
        it('should recruit', () => {
            const { art } = system.recruitArt({ masterId: 'm1' });
            expect(art.masterId).toBe('m1');
        });

        it('should default name', () => {
            const { art } = system.recruitArt({});
            expect(art.name).toBe('Untitled Art');
        });

        it('should default type to sword', () => {
            const { art } = system.recruitArt({});
            expect(art.type).toBe('sword');
        });

        it('should default inspiration to baseInspiration', () => {
            const { art } = system.recruitArt({});
            expect(art.inspiration).toBe(20);
        });

        it('should default status to novice', () => {
            const { art } = system.recruitArt({});
            expect(art.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { art } = system.recruitArt({});
            expect(art.level).toBe(1);
        });

        it('should default works to empty array', () => {
            const { art } = system.recruitArt({});
            expect(art.works).toEqual([]);
        });

        it('should accept paint type', () => {
            const { art } = system.recruitArt({ type: 'paint' });
            expect(art.type).toBe('paint');
        });

        it('should accept calligraphy type', () => {
            const { art } = system.recruitArt({ type: 'calligraphy' });
            expect(art.type).toBe('calligraphy');
        });

        it('should accept custom name', () => {
            const { art } = system.recruitArt({ name: 'Sword of Heaven' });
            expect(art.name).toBe('Sword of Heaven');
        });

        it('should accept custom inspiration', () => {
            const { art } = system.recruitArt({ inspiration: 80 });
            expect(art.inspiration).toBe(80);
        });

        it('should accept custom id', () => {
            const { art } = system.recruitArt({ id: 'custom123' });
            expect(art.artId).toBe('custom123');
        });

        it('should trigger artRecruited hook', () => {
            let called = false;
            system.registerHook('artRecruited', () => { called = true; });
            system.recruitArt({});
            expect(called).toBe(true);
        });
    });

    describe('getArt', () => {
        it('should return', () => {
            const { art } = system.recruitArt({});
            expect(system.getArt(art.artId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getArt('ghost')).toBeNull(); });
    });

    describe('listArts', () => {
        it('should list all', () => {
            system.recruitArt({});
            system.recruitArt({});
            expect(system.listArts().length).toBe(2);
        });

        it('should return empty when no arts', () => {
            expect(system.listArts().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitArt({ masterId: 'm1' });
            system.recruitArt({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitArt({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { art: a1 } = system.recruitArt({});
            system.recruitArt({});
            system.legendArt(a1.artId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitArt({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addWork', () => {
        it('should add a work', () => {
            const { art } = system.recruitArt({});
            system.addWork(art.artId, 'Masterpiece #1');
            expect(art.works.length).toBe(1);
        });

        it('should add multiple works', () => {
            const { art } = system.recruitArt({});
            system.addWork(art.artId, 'work1');
            system.addWork(art.artId, 'work2');
            expect(art.works.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addWork('ghost', 'w');
            expect(result.error).toBe('ART_NOT_FOUND');
        });

        it('should trigger workAdded hook', () => {
            const { art } = system.recruitArt({});
            let called = false;
            system.registerHook('workAdded', () => { called = true; });
            system.addWork(art.artId, 'w');
            expect(called).toBe(true);
        });
    });

    describe('raiseInspiration', () => {
        it('should raise', () => {
            const { art } = system.recruitArt({});
            system.raiseInspiration(art.artId, 10);
            expect(art.inspiration).toBe(30);
        });

        it('should default amount to 5', () => {
            const { art } = system.recruitArt({});
            system.raiseInspiration(art.artId);
            expect(art.inspiration).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseInspiration('ghost', 5);
            expect(result.error).toBe('ART_NOT_FOUND');
        });

        it('should trigger inspirationRaised hook', () => {
            const { art } = system.recruitArt({});
            let called = false;
            system.registerHook('inspirationRaised', () => { called = true; });
            system.raiseInspiration(art.artId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpArt', () => {
        it('should level up', () => {
            const { art } = system.recruitArt({});
            system.levelUpArt(art.artId);
            expect(art.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { art } = system.recruitArt({});
            system.levelUpArt(art.artId);
            system.levelUpArt(art.artId);
            expect(art.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpArt('ghost');
            expect(result.error).toBe('ART_NOT_FOUND');
        });

        it('should trigger artLeveledUp hook', () => {
            const { art } = system.recruitArt({});
            let called = false;
            system.registerHook('artLeveledUp', () => { called = true; });
            system.levelUpArt(art.artId);
            expect(called).toBe(true);
        });
    });

    describe('legendArt', () => {
        it('should set status to legendary', () => {
            const { art } = system.recruitArt({});
            system.legendArt(art.artId);
            expect(art.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendArt('ghost');
            expect(result.error).toBe('ART_NOT_FOUND');
        });

        it('should trigger artLegendized hook', () => {
            const { art } = system.recruitArt({});
            let called = false;
            system.registerHook('artLegendized', () => { called = true; });
            system.legendArt(art.artId);
            expect(called).toBe(true);
        });
    });

    describe('calculateArtValue', () => {
        it('should calculate with default values', () => {
            const { art } = system.recruitArt({});
            // level=1, inspiration=20, works=[] => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateArtValue(art.artId)).toBe(140);
        });

        it('should calculate with works', () => {
            const { art } = system.recruitArt({});
            system.addWork(art.artId, 'w1');
            system.addWork(art.artId, 'w2');
            // level=1, inspiration=20, works=2 => 100 + 40 + 60 = 200
            expect(system.calculateArtValue(art.artId)).toBe(200);
        });

        it('should calculate with level', () => {
            const { art } = system.recruitArt({});
            system.levelUpArt(art.artId);
            // level=2, inspiration=20, works=0 => 200 + 40 + 0 = 240
            expect(system.calculateArtValue(art.artId)).toBe(240);
        });

        it('should calculate with inspiration', () => {
            const { art } = system.recruitArt({});
            system.raiseInspiration(art.artId, 30);
            // level=1, inspiration=50, works=0 => 100 + 100 + 0 = 200
            expect(system.calculateArtValue(art.artId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateArtValue('ghost')).toBe(0);
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

        it('should execute default getArt', () => {
            const result = system.executeTool('getArt', { artId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitArt', () => {
            const result = system.executeTool('recruitArt', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('artRecruited', () => count++);
            unregister();
            system.recruitArt({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('artRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitArt({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalArts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalArts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitArt({});
            const json = system.toJSON();
            expect(json.arts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitArt({});
            const json = system.toJSON();
            const newSys = new CultivationArt();
            newSys.fromJSON(json);
            expect(newSys.arts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.artCount).toBe(0);
        });
    });
});
