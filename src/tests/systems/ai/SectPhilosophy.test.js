/**
 * SectPhilosophy.test.js - 宗门哲学测试
 * V485 Iteration 2/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectPhilosophy } from '../../../systems/ai/SectPhilosophy.js';

describe('SectPhilosophy', () => {
    let system;
    beforeEach(() => { system = new SectPhilosophy(); });

    describe('formulatePhilosophy', () => {
        it('should formulate', () => {
            const { philosophy } = system.formulatePhilosophy({ sectId: 's1', name: 'Way of Balance' });
            expect(philosophy.sectId).toBe('s1');
            expect(philosophy.name).toBe('Way of Balance');
            expect(philosophy.type).toBe('balance');
            expect(philosophy.wisdom).toBe(10);
            expect(philosophy.status).toBe('emerging');
            expect(philosophy.adherents).toEqual([]);
        });

        it('should use provided type and wisdom', () => {
            const { philosophy } = system.formulatePhilosophy({ sectId: 's1', type: 'yin', wisdom: 50, status: 'dominant' });
            expect(philosophy.type).toBe('yin');
            expect(philosophy.wisdom).toBe(50);
            expect(philosophy.status).toBe('dominant');
        });

        it('should trigger philosophyFormulated hook', () => {
            let called = false;
            system.registerHook('philosophyFormulated', () => { called = true; });
            system.formulatePhilosophy({});
            expect(called).toBe(true);
        });
    });

    describe('getPhilosophy', () => {
        it('should return', () => {
            const { philosophy } = system.formulatePhilosophy({});
            expect(system.getPhilosophy(philosophy.philosophyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPhilosophy('ghost')).toBeNull(); });
    });

    describe('listPhilosophies', () => {
        it('should list all', () => {
            system.formulatePhilosophy({});
            system.formulatePhilosophy({});
            expect(system.listPhilosophies().length).toBe(2);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.formulatePhilosophy({ sectId: 's1' });
            system.formulatePhilosophy({ sectId: 's2' });
            system.formulatePhilosophy({ sectId: 's1' });
            expect(system.listBySect('s1').length).toBe(2);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.formulatePhilosophy({ type: 'yin' });
            system.formulatePhilosophy({ type: 'yang' });
            system.formulatePhilosophy({ type: 'yin' });
            expect(system.listByType('yin').length).toBe(2);
        });
    });

    describe('addWisdom', () => {
        it('should add wisdom', () => {
            const { philosophy } = system.formulatePhilosophy({});
            system.addWisdom(philosophy.philosophyId, 15);
            expect(philosophy.wisdom).toBe(25);
        });

        it('should use default insight', () => {
            const { philosophy } = system.formulatePhilosophy({});
            system.addWisdom(philosophy.philosophyId);
            expect(philosophy.wisdom).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.addWisdom('ghost', 5);
            expect(result.error).toBe('PHILOSOPHY_NOT_FOUND');
        });

        it('should trigger wisdomAdded hook', () => {
            const { philosophy } = system.formulatePhilosophy({});
            let called = false;
            system.registerHook('wisdomAdded', () => { called = true; });
            system.addWisdom(philosophy.philosophyId, 5);
            expect(called).toBe(true);
        });
    });

    describe('gainAdherent', () => {
        it('should add adherent', () => {
            const { philosophy } = system.formulatePhilosophy({});
            system.gainAdherent(philosophy.philosophyId, 'member1');
            expect(philosophy.adherents).toContain('member1');
            expect(philosophy.adherents.length).toBe(1);
        });

        it('should add multiple adherents', () => {
            const { philosophy } = system.formulatePhilosophy({});
            system.gainAdherent(philosophy.philosophyId, 'm1');
            system.gainAdherent(philosophy.philosophyId, 'm2');
            expect(philosophy.adherents.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.gainAdherent('ghost', 'm1');
            expect(result.error).toBe('PHILOSOPHY_NOT_FOUND');
        });

        it('should trigger adherentGained hook', () => {
            const { philosophy } = system.formulatePhilosophy({});
            let called = false;
            system.registerHook('adherentGained', () => { called = true; });
            system.gainAdherent(philosophy.philosophyId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('elevatePhilosophy', () => {
        it('should elevate to eternal', () => {
            const { philosophy } = system.formulatePhilosophy({});
            system.elevatePhilosophy(philosophy.philosophyId);
            expect(philosophy.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.elevatePhilosophy('ghost');
            expect(result.error).toBe('PHILOSOPHY_NOT_FOUND');
        });

        it('should trigger philosophyElevated hook', () => {
            const { philosophy } = system.formulatePhilosophy({});
            let called = false;
            system.registerHook('philosophyElevated', () => { called = true; });
            system.elevatePhilosophy(philosophy.philosophyId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePhilosophyValue', () => {
        it('should calculate', () => {
            const { philosophy } = system.formulatePhilosophy({});
            system.addWisdom(philosophy.philosophyId, 5);  // wisdom = 15
            system.gainAdherent(philosophy.philosophyId, 'm1');
            system.gainAdherent(philosophy.philosophyId, 'm2');  // adherents.length = 2
            // value = 15 * 10 + 2 * 5 = 150 + 10 = 160
            expect(system.calculatePhilosophyValue(philosophy.philosophyId)).toBe(160);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePhilosophyValue('ghost')).toBe(0);
        });
    });

    describe('listEternal', () => {
        it('should filter', () => {
            const { philosophy: p1 } = system.formulatePhilosophy({});
            const { philosophy: p2 } = system.formulatePhilosophy({});
            system.elevatePhilosophy(p1.philosophyId);
            expect(system.listEternal().length).toBe(1);
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

        it('should execute default getPhilosophy', () => {
            const result = system.executeTool('getPhilosophy', { philosophyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('philosophyFormulated', () => count++);
            unregister();
            system.formulatePhilosophy({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('philosophyFormulated', () => { throw new Error('x'); });
            expect(() => system.formulatePhilosophy({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPhilosophies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPhilosophies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.formulatePhilosophy({});
            const json = system.toJSON();
            expect(json.philosophies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.formulatePhilosophy({});
            const json = system.toJSON();
            const newSys = new SectPhilosophy();
            newSys.fromJSON(json);
            expect(newSys.philosophies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.philosophyCount).toBe(0);
        });
    });
});
