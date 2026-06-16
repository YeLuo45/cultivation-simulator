/**
 * MasteryMetric.test.js - 掌握度指标测试
 * V1187 Round 45 Iter 31/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    MasteryMetric,
    TIERS,
    TIER_COLORS,
    GRADE_THRESHOLDS,
} from '../../../systems/powersync/MasteryMetric.js';

describe('MasteryMetric', () => {
    let m;
    beforeEach(() => { m = new MasteryMetric(); });

    describe('exports', () => {
        it('TIERS contains 4 tiers', () => {
            expect(TIERS.length).toBe(4);
            expect(TIERS).toContain('common');
            expect(TIERS).toContain('rare');
            expect(TIERS).toContain('epic');
            expect(TIERS).toContain('legendary');
        });
        it('TIER_COLORS has color for each tier', () => {
            for (const t of TIERS) expect(TIER_COLORS[t]).toMatch(/^#[0-9a-f]{6}$/i);
        });
        it('GRADE_THRESHOLDS has ascending thresholds', () => {
            expect(GRADE_THRESHOLDS.legendary).toBeGreaterThan(GRADE_THRESHOLDS.epic);
            expect(GRADE_THRESHOLDS.epic).toBeGreaterThan(GRADE_THRESHOLDS.rare);
            expect(GRADE_THRESHOLDS.rare).toBeGreaterThan(GRADE_THRESHOLDS.common);
        });
    });

    describe('constructor', () => {
        it('default weights', () => {
            const w = m.getWeights();
            expect(w.density).toBeCloseTo(0.4, 5);
            expect(w.coherence).toBeCloseTo(0.3, 5);
            expect(w.resonance).toBeCloseTo(0.3, 5);
        });
        it('accepts custom weights', () => {
            const x = new MasteryMetric({ weights: { density: 0.5, coherence: 0.3, resonance: 0.2 } });
            const w = x.getWeights();
            expect(w.density).toBeCloseTo(0.5, 5);
        });
        it('starts with empty reports', () => {
            expect(m.reports.length).toBe(0);
            expect(m.stats.calculated).toBe(0);
        });
    });

    describe('calculate', () => {
        it('zero all = 0', () => {
            expect(m.calculate({ density: 0, coherence: 0, resonance: 0 })).toBe(0);
        });
        it('one all = 1', () => {
            expect(m.calculate({ density: 1, coherence: 1, resonance: 1 })).toBe(1);
        });
        it('weighted correctly with default', () => {
            // 0.4*1 + 0.3*0 + 0.3*0 = 0.4
            expect(m.calculate({ density: 1, coherence: 0, resonance: 0 })).toBeCloseTo(0.4, 5);
        });
        it('weighted correctly for coherence', () => {
            // 0.3*1 = 0.3
            expect(m.calculate({ density: 0, coherence: 1, resonance: 0 })).toBeCloseTo(0.3, 5);
        });
        it('weighted correctly for resonance', () => {
            expect(m.calculate({ density: 0, coherence: 0, resonance: 1 })).toBeCloseTo(0.3, 5);
        });
        it('mid values', () => {
            // 0.4*0.5 + 0.3*0.5 + 0.3*0.5 = 0.5
            expect(m.calculate({ density: 0.5, coherence: 0.5, resonance: 0.5 })).toBeCloseTo(0.5, 5);
        });
        it('returns 0 for null', () => {
            expect(m.calculate(null)).toBe(0);
        });
        it('returns 0 for non-object', () => {
            expect(m.calculate('x')).toBe(0);
        });
        it('clamps out-of-range', () => {
            expect(m.calculate({ density: 2, coherence: 2, resonance: 2 })).toBe(1);
            expect(m.calculate({ density: -1, coherence: -1, resonance: -1 })).toBe(0);
        });
        it('increments stats.calculated', () => {
            m.calculate({ density: 0.5, coherence: 0.5, resonance: 0.5 });
            expect(m.stats.calculated).toBe(1);
        });
        it('emits calculated event', () => {
            let captured = null;
            m.registerHook('calculated', (e) => { captured = e; });
            m.calculate({ density: 0.5, coherence: 0.5, resonance: 0.5 });
            expect(captured.score).toBeCloseTo(0.5, 5);
        });
    });

    describe('setWeights', () => {
        it('updates weights', () => {
            expect(m.setWeights({ density: 0.5, coherence: 0.3, resonance: 0.2 })).toBe(true);
            const w = m.getWeights();
            expect(w.density).toBeCloseTo(0.5, 5);
        });
        it('auto-normalizes when not summing to 1', () => {
            m.setWeights({ density: 2, coherence: 1, resonance: 1 });
            const w = m.getWeights();
            expect(w.density + w.coherence + w.resonance).toBeCloseTo(1, 5);
        });
        it('rejects non-object', () => {
            expect(m.setWeights(null)).toBe(false);
            expect(m.setWeights('x')).toBe(false);
        });
        it('rejects negative weight', () => {
            expect(m.setWeights({ density: -0.1 })).toBe(false);
        });
        it('rejects non-numeric weight', () => {
            expect(m.setWeights({ density: 'x' })).toBe(false);
        });
        it('rejects NaN/Infinity', () => {
            expect(m.setWeights({ density: NaN })).toBe(false);
            expect(m.setWeights({ density: Infinity })).toBe(false);
        });
        it('getWeights returns copy', () => {
            const w = m.getWeights();
            w.density = 99;
            expect(m.getWeights().density).toBeCloseTo(0.4, 5);
        });
    });

    describe('normalize', () => {
        it('clamps high', () => {
            expect(m.normalize(5)).toBe(1);
        });
        it('clamps low', () => {
            expect(m.normalize(-1)).toBe(0);
        });
        it('passes through mid', () => {
            expect(m.normalize(0.5)).toBe(0.5);
        });
        it('handles NaN', () => {
            expect(m.normalize(NaN)).toBe(0);
        });
        it('handles non-number', () => {
            expect(m.normalize('x')).toBe(0);
            expect(m.normalize(null)).toBe(0);
        });
    });

    describe('grade', () => {
        it('common for low', () => {
            expect(m.grade(0)).toBe('common');
            expect(m.grade(0.3)).toBe('common');
            expect(m.grade(0.399)).toBe('common');
        });
        it('rare at 0.4', () => {
            expect(m.grade(0.4)).toBe('rare');
            expect(m.grade(0.5)).toBe('rare');
            expect(m.grade(0.599)).toBe('rare');
        });
        it('epic at 0.6', () => {
            expect(m.grade(0.6)).toBe('epic');
            expect(m.grade(0.7)).toBe('epic');
            expect(m.grade(0.799)).toBe('epic');
        });
        it('legendary at 0.8', () => {
            expect(m.grade(0.8)).toBe('legendary');
            expect(m.grade(0.9)).toBe('legendary');
            expect(m.grade(1)).toBe('legendary');
        });
        it('clamps input', () => {
            expect(m.grade(1.5)).toBe('legendary');
            expect(m.grade(-0.5)).toBe('common');
        });
    });

    describe('getTier', () => {
        it('returns tier and color', () => {
            const t = m.getTier(0.85);
            expect(t.tier).toBe('legendary');
            expect(t.color).toBe(TIER_COLORS.legendary);
        });
        it('common at low', () => {
            const t = m.getTier(0.1);
            expect(t.tier).toBe('common');
            expect(t.color).toBe(TIER_COLORS.common);
        });
        it('rare mid-low', () => {
            const t = m.getTier(0.5);
            expect(t.tier).toBe('rare');
        });
        it('epic mid-high', () => {
            const t = m.getTier(0.7);
            expect(t.tier).toBe('epic');
        });
        it('getAllTiers returns array', () => {
            const all = m.getAllTiers();
            expect(all.length).toBe(4);
            expect(all[0]).toHaveProperty('color');
        });
    });

    describe('getMasteryReport', () => {
        it('returns composite', () => {
            const r = m.getMasteryReport({ density: 0.9, coherence: 0.9, resonance: 0.9 });
            expect(r.score).toBeCloseTo(0.9, 5);
            expect(r.grade).toBe('legendary');
            expect(r.tier).toHaveProperty('color');
            expect(r.recommendations).toBeInstanceOf(Array);
            expect(r.weights).toHaveProperty('density');
            expect(r.ts).toBeGreaterThan(0);
        });
        it('low score → overhaul_needed', () => {
            const r = m.getMasteryReport({ density: 0.1, coherence: 0.1, resonance: 0.1 });
            expect(r.grade).toBe('common');
            expect(r.recommendations.some((x) => x.kind === 'overhaul_needed')).toBe(true);
        });
        it('high score → maintain_excellence', () => {
            const r = m.getMasteryReport({ density: 0.9, coherence: 0.9, resonance: 0.9 });
            expect(r.recommendations.some((x) => x.kind === 'maintain_excellence')).toBe(true);
        });
        it('low density → expand_modules', () => {
            const r = m.getMasteryReport({ density: 0.1, coherence: 0.9, resonance: 0.9 });
            expect(r.recommendations.some((x) => x.kind === 'expand_modules')).toBe(true);
        });
        it('low coherence → improve_integration', () => {
            const r = m.getMasteryReport({ density: 0.9, coherence: 0.1, resonance: 0.9 });
            expect(r.recommendations.some((x) => x.kind === 'improve_integration')).toBe(true);
        });
        it('low resonance → boost_effectiveness', () => {
            const r = m.getMasteryReport({ density: 0.9, coherence: 0.9, resonance: 0.1 });
            expect(r.recommendations.some((x) => x.kind === 'boost_effectiveness')).toBe(true);
        });
        it('always has weakest_dimension', () => {
            const r = m.getMasteryReport({ density: 0.9, coherence: 0.5, resonance: 0.1 });
            expect(r.recommendations.some((x) => x.kind === 'weakest_dimension')).toBe(true);
        });
        it('weakest dimension is correct', () => {
            const r = m.getMasteryReport({ density: 0.9, coherence: 0.5, resonance: 0.1 });
            const w = r.recommendations.find((x) => x.kind === 'weakest_dimension');
            expect(w.target).toBe('resonance');
        });
        it('appends to reports', () => {
            m.getMasteryReport({ density: 0.5, coherence: 0.5, resonance: 0.5 });
            expect(m.reports.length).toBe(1);
            expect(m.stats.reports).toBe(1);
        });
        it('emits reported event', () => {
            let captured = null;
            m.registerHook('reported', (e) => { captured = e; });
            m.getMasteryReport({ density: 0.5, coherence: 0.5, resonance: 0.5 });
            expect(captured.score).toBeCloseTo(0.5, 5);
        });
        it('listReports returns copy', () => {
            m.getMasteryReport({ density: 0.5, coherence: 0.5, resonance: 0.5 });
            const list = m.listReports();
            list.length = 0;
            expect(m.reports.length).toBe(1);
        });
    });

    describe('getStats', () => {
        it('returns aggregate', () => {
            m.calculate({ density: 0.5, coherence: 0.5, resonance: 0.5 });
            m.getMasteryReport({ density: 0.5, coherence: 0.5, resonance: 0.5 });
            const s = m.getStats();
            // getMasteryReport also calls calculate internally → 2
            expect(s.calculated).toBe(2);
            expect(s.reports).toBe(1);
            expect(s.weights.density).toBeCloseTo(0.4, 5);
        });
    });

    describe('reset', () => {
        it('clears reports', () => {
            m.getMasteryReport({ density: 0.5, coherence: 0.5, resonance: 0.5 });
            m.reset();
            expect(m.reports.length).toBe(0);
            expect(m.stats.reports).toBe(0);
        });
    });

    describe('hooks', () => {
        it('hook errors swallowed', () => {
            m.registerHook('calculated', () => { throw new Error('x'); });
            expect(() => m.calculate({ density: 0.5, coherence: 0.5, resonance: 0.5 })).not.toThrow();
        });
    });
});
