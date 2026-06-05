/**
 * CultivationArt.test.js - 功法系统测试
 * V398 Iteration 5/15 Round 13 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationArt } from '../../../systems/ai/CultivationArt.js';

describe('CultivationArt', () => {
    let system;
    beforeEach(() => { system = new CultivationArt(); });

    describe('createArt', () => {
        it('should create', () => {
            const { art } = system.createArt({ name: 'A1' });
            expect(art.name).toBe('A1');
        });

        it('should trigger artCreated hook', () => {
            let called = false;
            system.registerHook('artCreated', () => { called = true; });
            system.createArt({});
            expect(called).toBe(true);
        });
    });

    describe('getArt', () => {
        it('should return', () => {
            const { art } = system.createArt({});
            expect(system.getArt(art.artId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getArt('ghost')).toBeNull(); });
    });

    describe('listArts', () => {
        it('should list all', () => {
            system.createArt({});
            expect(system.listArts().length).toBe(1);
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            system.createArt({ element: 'fire' });
            system.createArt({ element: 'water' });
            expect(system.listByElement('fire').length).toBe(1);
        });
    });

    describe('listByGrade', () => {
        it('should filter', () => {
            system.createArt({ grade: 'common' });
            system.createArt({ grade: 'rare' });
            expect(system.listByGrade('rare').length).toBe(1);
        });
    });

    describe('practice', () => {
        it('should practice', () => {
            const { art } = system.createArt({});
            system.practice(art.artId, 'c1', 5);
            expect(art.mastery).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.practice('ghost', 'c1', 5);
            expect(result.error).toBe('ART_NOT_FOUND');
        });

        it('should trigger artPracticed hook', () => {
            const { art } = system.createArt({});
            let called = false;
            system.registerHook('artPracticed', () => { called = true; });
            system.practice(art.artId, 'c1', 5);
            expect(called).toBe(true);
        });
    });

    describe('getPractice', () => {
        it('should return', () => {
            const { art } = system.createArt({});
            system.practice(art.artId, 'c1', 5);
            const practices = system.listPractices();
            expect(system.getPractice(practices[0].practiceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPractice('ghost')).toBeNull(); });
    });

    describe('listPractices', () => {
        it('should list all', () => {
            const { art } = system.createArt({});
            system.practice(art.artId, 'c1', 5);
            expect(system.listPractices().length).toBe(1);
        });
    });

    describe('listPracticesByArt', () => {
        it('should filter', () => {
            const { art: a1 } = system.createArt({});
            const { art: a2 } = system.createArt({});
            system.practice(a1.artId, 'c1', 5);
            system.practice(a2.artId, 'c1', 5);
            expect(system.listPracticesByArt(a1.artId).length).toBe(1);
        });
    });

    describe('listPracticesByCultivator', () => {
        it('should filter', () => {
            const { art } = system.createArt({});
            system.practice(art.artId, 'c1', 5);
            system.practice(art.artId, 'c2', 5);
            expect(system.listPracticesByCultivator('c1').length).toBe(1);
        });
    });

    describe('calculatePower', () => {
        it('should calculate', () => {
            const { art } = system.createArt({});
            system.practice(art.artId, 'c1', 5);
            expect(system.calculatePower(art.artId)).toBe(20);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePower('ghost')).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should filter', () => {
            const { art: a1 } = system.createArt({});
            const { art: a2 } = system.createArt({});
            system.practice(a1.artId, 'c1', 60);
            system.practice(a2.artId, 'c1', 10);
            expect(system.listMastered(50).length).toBe(1);
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
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('artCreated', () => count++);
            unregister();
            system.createArt({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('artCreated', () => { throw new Error('x'); });
            expect(() => system.createArt({})).not.toThrow();
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
            system.createArt({});
            const json = system.toJSON();
            expect(json.arts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createArt({});
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