/**
 * SoulArts.test.js - 灵魂术测试
 * V420 Iteration 12/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SoulArts } from '../../../systems/ai/SoulArts.js';

describe('SoulArts', () => {
    let system;
    beforeEach(() => { system = new SoulArts(); });

    describe('learnArt', () => {
        it('should learn an art', () => {
            const { art } = system.learnArt({ name: 'Soul Crush', type: 'attack', element: 'shadow' });
            expect(art.name).toBe('Soul Crush');
            expect(art.type).toBe('attack');
            expect(art.element).toBe('shadow');
        });

        it('should set default values', () => {
            const { art } = system.learnArt({});
            expect(art.name).toBe('Soul Art');
            expect(art.type).toBe('attack');
            expect(art.soulPower).toBe(30);
            expect(art.targetType).toBe('single');
            expect(art.element).toBe('none');
            expect(art.mastery).toBe(0);
            expect(art.status).toBe('learned');
        });

        it('should trigger artLearned hook', () => {
            let called = false;
            system.registerHook('artLearned', () => { called = true; });
            system.learnArt({});
            expect(called).toBe(true);
        });
    });

    describe('getArt', () => {
        it('should return art', () => {
            const { art } = system.learnArt({});
            expect(system.getArt(art.artId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getArt('ghost')).toBeNull();
        });
    });

    describe('listArts', () => {
        it('should list all', () => {
            system.learnArt({});
            system.learnArt({});
            expect(system.listArts().length).toBe(2);
        });

        it('should return empty list', () => {
            expect(system.listArts().length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.learnArt({ type: 'attack' });
            system.learnArt({ type: 'defense' });
            system.learnArt({ type: 'attack' });
            expect(system.listByType('attack').length).toBe(2);
            expect(system.listByType('defense').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.learnArt({ type: 'attack' });
            expect(system.listByType('heal').length).toBe(0);
        });
    });

    describe('listByElement', () => {
        it('should filter by element', () => {
            system.learnArt({ element: 'shadow' });
            system.learnArt({ element: 'light' });
            expect(system.listByElement('shadow').length).toBe(1);
            expect(system.listByElement('light').length).toBe(1);
        });
    });

    describe('practiceArt', () => {
        it('should practice art with default amount', () => {
            const { art } = system.learnArt({});
            system.practiceArt(art.artId);
            expect(art.mastery).toBe(5);
        });

        it('should practice with custom amount', () => {
            const { art } = system.learnArt({});
            system.practiceArt(art.artId, 20);
            expect(art.mastery).toBe(20);
        });

        it('should reject missing art', () => {
            const result = system.practiceArt('ghost', 5);
            expect(result.error).toBe('ART_NOT_FOUND');
        });

        it('should trigger artPracticed hook', () => {
            const { art } = system.learnArt({});
            let called = false;
            system.registerHook('artPracticed', () => { called = true; });
            system.practiceArt(art.artId, 5);
            expect(called).toBe(true);
        });
    });

    describe('upgradeArt', () => {
        it('should upgrade art', () => {
            const { art } = system.learnArt({ soulPower: 50 });
            system.upgradeArt(art.artId);
            expect(art.soulPower).toBe(60);
            expect(art.status).toBe('upgraded');
        });

        it('should reject missing art', () => {
            const result = system.upgradeArt('ghost');
            expect(result.error).toBe('ART_NOT_FOUND');
        });

        it('should trigger artUpgraded hook', () => {
            const { art } = system.learnArt({});
            let called = false;
            system.registerHook('artUpgraded', () => { called = true; });
            system.upgradeArt(art.artId);
            expect(called).toBe(true);
        });
    });

    describe('castArt', () => {
        it('should cast art and change status', () => {
            const { art } = system.learnArt({});
            system.castArt(art.artId);
            expect(art.status).toBe('casted');
        });

        it('should reject missing art', () => {
            const result = system.castArt('ghost');
            expect(result.error).toBe('ART_NOT_FOUND');
        });

        it('should trigger artCast hook', () => {
            const { art } = system.learnArt({});
            let called = false;
            system.registerHook('artCast', () => { called = true; });
            system.castArt(art.artId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSoulPower', () => {
        it('should calculate soul power', () => {
            const { art } = system.learnArt({ soulPower: 100, element: 'fire' });
            // 100 * (1 + 0/100) + 'fire'.length = 100 + 4 = 104
            expect(system.calculateSoulPower(art.artId)).toBe(104);
        });

        it('should factor in mastery', () => {
            const { art } = system.learnArt({ soulPower: 100, element: 'fire' });
            system.practiceArt(art.artId, 50);
            // 100 * (1 + 50/100) + 4 = 150 + 4 = 154
            expect(system.calculateSoulPower(art.artId)).toBe(154);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSoulPower('ghost')).toBe(0);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default learnArt tool', () => {
            const result = system.executeTool('learnArt', { name: 'ToolSoul' });
            expect(result.success).toBe(true);
            expect(result.result.art.name).toBe('ToolSoul');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('artLearned', () => count++);
            unregister();
            system.learnArt({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('artLearned', () => { throw new Error('x'); });
            expect(() => system.learnArt({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient arts', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when threshold met', () => {
            system.stats.totalArts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            system.stats.totalArts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.learnArt({ name: 'PersistSoul' });
            const json = system.toJSON();
            expect(json.arts.length).toBe(1);
        });

        it('should deserialize', () => {
            system.learnArt({ name: 'PersistSoul' });
            const json = system.toJSON();
            const newSys = new SoulArts();
            newSys.fromJSON(json);
            expect(newSys.arts.size).toBe(1);
            expect(newSys.stats.totalArts).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.artCount).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
