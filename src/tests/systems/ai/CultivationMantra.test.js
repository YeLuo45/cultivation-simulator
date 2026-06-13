/**
 * CultivationMantra.test.js - 道真言系统测试
 * V533 Iteration 15/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMantra } from '../../../systems/ai/CultivationMantra.js';

describe('CultivationMantra', () => {
    let system;
    beforeEach(() => { system = new CultivationMantra(); });

    describe('chantMantra', () => {
        it('should chant mantra', () => {
            const { mantra } = system.chantMantra({ cultivatorId: 'c1', name: 'Heart Sutra' });
            expect(mantra.cultivatorId).toBe('c1');
            expect(mantra.name).toBe('Heart Sutra');
        });

        it('should default to silent status', () => {
            const { mantra } = system.chantMantra({});
            expect(mantra.status).toBe('silent');
        });

        it('should default type to truth', () => {
            const { mantra } = system.chantMantra({});
            expect(mantra.type).toBe('truth');
        });

        it('should default resonance to baseResonance', () => {
            const { mantra } = system.chantMantra({});
            expect(mantra.resonance).toBe(20);
        });

        it('should start at level 1', () => {
            const { mantra } = system.chantMantra({});
            expect(mantra.level).toBe(1);
        });

        it('should start with empty syllables', () => {
            const { mantra } = system.chantMantra({});
            expect(mantra.syllables).toEqual([]);
        });

        it('should generate mantraId', () => {
            const { mantra } = system.chantMantra({});
            expect(mantra.mantraId).toBeDefined();
            expect(typeof mantra.mantraId).toBe('string');
        });

        it('should accept custom mantraId', () => {
            const { mantra } = system.chantMantra({ mantraId: 'my-mantra' });
            expect(mantra.mantraId).toBe('my-mantra');
        });

        it('should trigger mantraChanted hook', () => {
            let called = false;
            system.registerHook('mantraChanted', () => { called = true; });
            system.chantMantra({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { mantra: m1 } = system.chantMantra({ type: 'truth' });
            const { mantra: m2 } = system.chantMantra({ type: 'void' });
            const { mantra: m3 } = system.chantMantra({ type: 'emptiness' });
            expect(m1.type).toBe('truth');
            expect(m2.type).toBe('void');
            expect(m3.type).toBe('emptiness');
        });
    });

    describe('getMantra', () => {
        it('should return mantra', () => {
            const { mantra } = system.chantMantra({});
            expect(system.getMantra(mantra.mantraId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMantra('ghost')).toBeNull(); });
    });

    describe('listMantras', () => {
        it('should list all', () => {
            system.chantMantra({});
            system.chantMantra({});
            expect(system.listMantras().length).toBe(2);
        });

        it('should return empty when no mantras', () => {
            expect(system.listMantras().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.chantMantra({ cultivatorId: 'c1' });
            system.chantMantra({ cultivatorId: 'c2' });
            system.chantMantra({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
        });

        it('should return empty for unknown cultivator', () => {
            system.chantMantra({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listResonating', () => {
        it('should filter resonating only', () => {
            const { mantra: m1 } = system.chantMantra({});
            const { mantra: m2 } = system.chantMantra({});
            system.resonateMantra(m1.mantraId);
            const resonating = system.listResonating();
            expect(resonating.length).toBe(1);
            expect(resonating[0].mantraId).toBe(m1.mantraId);
            expect(m2.status).toBe('silent');
        });

        it('should return empty when none resonating', () => {
            system.chantMantra({});
            expect(system.listResonating().length).toBe(0);
        });
    });

    describe('addSyllable', () => {
        it('should add syllable', () => {
            const { mantra } = system.chantMantra({});
            system.addSyllable(mantra.mantraId, 'om');
            expect(mantra.syllables).toContain('om');
        });

        it('should accumulate syllables', () => {
            const { mantra } = system.chantMantra({});
            system.addSyllable(mantra.mantraId, 's1');
            system.addSyllable(mantra.mantraId, 's2');
            system.addSyllable(mantra.mantraId, 's3');
            expect(mantra.syllables.length).toBe(3);
        });

        it('should reject missing mantra', () => {
            const result = system.addSyllable('ghost', 's');
            expect(result.error).toBe('MANTRA_NOT_FOUND');
        });

        it('should trigger syllableAdded hook', () => {
            const { mantra } = system.chantMantra({});
            let called = false;
            system.registerHook('syllableAdded', () => { called = true; });
            system.addSyllable(mantra.mantraId, 's');
            expect(called).toBe(true);
        });
    });

    describe('increaseResonance', () => {
        it('should increase resonance by default', () => {
            const { mantra } = system.chantMantra({});
            system.increaseResonance(mantra.mantraId);
            expect(mantra.resonance).toBe(25);
        });

        it('should increase resonance by custom amount', () => {
            const { mantra } = system.chantMantra({});
            system.increaseResonance(mantra.mantraId, 100);
            expect(mantra.resonance).toBe(120);
        });

        it('should reject missing mantra', () => {
            const result = system.increaseResonance('ghost');
            expect(result.error).toBe('MANTRA_NOT_FOUND');
        });

        it('should trigger resonanceIncreased hook', () => {
            const { mantra } = system.chantMantra({});
            let called = false;
            system.registerHook('resonanceIncreased', () => { called = true; });
            system.increaseResonance(mantra.mantraId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMantra', () => {
        it('should level up', () => {
            const { mantra } = system.chantMantra({});
            system.levelUpMantra(mantra.mantraId);
            expect(mantra.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { mantra } = system.chantMantra({});
            system.levelUpMantra(mantra.mantraId);
            system.levelUpMantra(mantra.mantraId);
            system.levelUpMantra(mantra.mantraId);
            expect(mantra.level).toBe(4);
        });

        it('should reject missing mantra', () => {
            const result = system.levelUpMantra('ghost');
            expect(result.error).toBe('MANTRA_NOT_FOUND');
        });

        it('should trigger mantraLeveledUp hook', () => {
            const { mantra } = system.chantMantra({});
            let called = false;
            system.registerHook('mantraLeveledUp', () => { called = true; });
            system.levelUpMantra(mantra.mantraId);
            expect(called).toBe(true);
        });
    });

    describe('resonateMantra', () => {
        it('should resonate mantra', () => {
            const { mantra } = system.chantMantra({});
            system.resonateMantra(mantra.mantraId);
            expect(mantra.status).toBe('resonating');
        });

        it('should reject missing mantra', () => {
            const result = system.resonateMantra('ghost');
            expect(result.error).toBe('MANTRA_NOT_FOUND');
        });

        it('should trigger mantraResonated hook', () => {
            const { mantra } = system.chantMantra({});
            let called = false;
            system.registerHook('mantraResonated', () => { called = true; });
            system.resonateMantra(mantra.mantraId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMantraPower', () => {
        it('should calculate base power', () => {
            const { mantra } = system.chantMantra({});
            // level=1, resonance=20, syllables=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateMantraPower(mantra.mantraId)).toBe(140);
        });

        it('should include syllables in power', () => {
            const { mantra } = system.chantMantra({});
            system.addSyllable(mantra.mantraId, 's1');
            system.addSyllable(mantra.mantraId, 's2');
            // level=1, resonance=20, syllables=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateMantraPower(mantra.mantraId)).toBe(200);
        });

        it('should scale with level', () => {
            const { mantra } = system.chantMantra({});
            system.levelUpMantra(mantra.mantraId);
            system.levelUpMantra(mantra.mantraId);
            // level=3, resonance=20, syllables=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateMantraPower(mantra.mantraId)).toBe(340);
        });

        it('should scale with resonance', () => {
            const { mantra } = system.chantMantra({});
            system.increaseResonance(mantra.mantraId, 100);
            // level=1, resonance=120, syllables=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateMantraPower(mantra.mantraId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMantraPower('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
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
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mantraChanted', () => count++);
            unregister();
            system.chantMantra({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mantraChanted', () => { throw new Error('x'); });
            expect(() => system.chantMantra({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMantras = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMantras = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.chantMantra({});
            const json = system.toJSON();
            expect(json.mantras.length).toBe(1);
        });
        it('should deserialize', () => {
            system.chantMantra({});
            const json = system.toJSON();
            const newSys = new CultivationMantra();
            newSys.fromJSON(json);
            expect(newSys.mantras.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mantraCount).toBe(0);
        });
    });
});
