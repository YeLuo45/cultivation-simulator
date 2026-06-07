/**
 * CultivationTone.test.js - 修真音色系统测试
 * V790 Iteration 23/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTone } from '../../../systems/ai/CultivationTone.js';

describe('CultivationTone', () => {
    let system;
    beforeEach(() => { system = new CultivationTone(); });

    describe('recruitTone', () => {
        it('should recruit a tone', () => {
            const { tone } = system.recruitTone({ masterId: 'm1', name: 'Morning Bell' });
            expect(tone.masterId).toBe('m1');
            expect(tone.name).toBe('Morning Bell');
        });

        it('should set defaults', () => {
            const { tone } = system.recruitTone({});
            expect(tone.type).toBe('warm');
            expect(tone.warmth).toBe(20);
            expect(tone.level).toBe(1);
            expect(tone.status).toBe('novice');
            expect(tone.harmonics).toEqual([]);
        });

        it('should accept custom values', () => {
            const { tone } = system.recruitTone({ type: 'cold', warmth: 80, level: 5, status: 'veteran', harmonics: ['A', 'B'] });
            expect(tone.type).toBe('cold');
            expect(tone.warmth).toBe(80);
            expect(tone.level).toBe(5);
            expect(tone.status).toBe('veteran');
            expect(tone.harmonics.length).toBe(2);
        });

        it('should trigger toneRecruited hook', () => {
            let called = false;
            system.registerHook('toneRecruited', () => { called = true; });
            system.recruitTone({});
            expect(called).toBe(true);
        });

        it('should increment totalTones', () => {
            system.recruitTone({});
            system.recruitTone({});
            expect(system.stats.totalTones).toBe(2);
        });
    });

    describe('getTone', () => {
        it('should return tone', () => {
            const { tone } = system.recruitTone({});
            expect(system.getTone(tone.toneId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getTone('ghost')).toBeNull();
        });
    });

    describe('listTones', () => {
        it('should list all', () => {
            system.recruitTone({});
            system.recruitTone({});
            expect(system.listTones().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listTones().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitTone({ masterId: 'm1' });
            system.recruitTone({ masterId: 'm2' });
            system.recruitTone({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitTone({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { tone: t1 } = system.recruitTone({});
            const { tone: t2 } = system.recruitTone({});
            system.legendTone(t2.toneId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].toneId).toBe(t2.toneId);
        });
    });

    describe('addHarmonic', () => {
        it('should add harmonic', () => {
            const { tone } = system.recruitTone({});
            system.addHarmonic(tone.toneId, 'Crescendo');
            expect(tone.harmonics).toContain('Crescendo');
        });

        it('should reject missing tone', () => {
            const result = system.addHarmonic('ghost', 'x');
            expect(result.error).toBe('TONE_NOT_FOUND');
        });

        it('should trigger harmonicAdded hook', () => {
            const { tone } = system.recruitTone({});
            let called = false;
            system.registerHook('harmonicAdded', () => { called = true; });
            system.addHarmonic(tone.toneId, 'Resonance');
            expect(called).toBe(true);
        });
    });

    describe('raiseWarmth', () => {
        it('should raise warmth by default', () => {
            const { tone } = system.recruitTone({});
            system.raiseWarmth(tone.toneId);
            expect(tone.warmth).toBe(25);
        });

        it('should raise warmth by custom amount', () => {
            const { tone } = system.recruitTone({});
            system.raiseWarmth(tone.toneId, 50);
            expect(tone.warmth).toBe(70);
        });

        it('should reject missing tone', () => {
            const result = system.raiseWarmth('ghost', 10);
            expect(result.error).toBe('TONE_NOT_FOUND');
        });

        it('should trigger warmthRaised hook', () => {
            const { tone } = system.recruitTone({});
            let called = false;
            system.registerHook('warmthRaised', () => { called = true; });
            system.raiseWarmth(tone.toneId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTone', () => {
        it('should level up', () => {
            const { tone } = system.recruitTone({});
            system.levelUpTone(tone.toneId);
            expect(tone.level).toBe(2);
        });

        it('should reject missing tone', () => {
            const result = system.levelUpTone('ghost');
            expect(result.error).toBe('TONE_NOT_FOUND');
        });

        it('should trigger toneLeveledUp hook', () => {
            const { tone } = system.recruitTone({});
            let called = false;
            system.registerHook('toneLeveledUp', () => { called = true; });
            system.levelUpTone(tone.toneId);
            expect(called).toBe(true);
        });
    });

    describe('legendTone', () => {
        it('should set status to legendary', () => {
            const { tone } = system.recruitTone({});
            system.legendTone(tone.toneId);
            expect(tone.status).toBe('legendary');
        });

        it('should reject missing tone', () => {
            const result = system.legendTone('ghost');
            expect(result.error).toBe('TONE_NOT_FOUND');
        });

        it('should trigger toneLegendized hook', () => {
            const { tone } = system.recruitTone({});
            let called = false;
            system.registerHook('toneLegendized', () => { called = true; });
            system.legendTone(tone.toneId);
            expect(called).toBe(true);
        });
    });

    describe('calculateToneValue', () => {
        it('should calculate value', () => {
            const { tone } = system.recruitTone({ level: 3, warmth: 50, harmonics: ['A', 'B'] });
            // 3*100 + 50*2 + 2*30 = 300 + 100 + 60 = 460
            expect(system.calculateToneValue(tone.toneId)).toBe(460);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateToneValue('ghost')).toBe(0);
        });

        it('should reflect state changes', () => {
            const { tone } = system.recruitTone({});
            system.addHarmonic(tone.toneId, 'X');
            system.raiseWarmth(tone.toneId, 10);
            system.levelUpTone(tone.toneId);
            // 2*100 + 30*2 + 1*30 = 200 + 60 + 30 = 290
            expect(system.calculateToneValue(tone.toneId)).toBe(290);
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

        it('should have default tools', () => {
            expect(system.listTools()).toContain('getTone');
            expect(system.listTools()).toContain('recruitTone');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('toneRecruited', () => count++);
            unregister();
            system.recruitTone({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('toneRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTone({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalTones = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalTones = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTone({});
            const json = system.toJSON();
            expect(json.tones.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitTone({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationTone();
            newSys.fromJSON(json);
            expect(newSys.tones.size).toBe(1);
            expect(newSys.listByMaster('m1').length).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.toneCount).toBe(0);
        });
    });
});
