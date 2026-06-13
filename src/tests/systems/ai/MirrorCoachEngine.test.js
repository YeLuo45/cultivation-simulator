/**
 * MirrorCoachEngine.test.js - V968 Iter 21/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { MirrorCoachEngine, COACHING_STYLES, COACHING_TRIGGERS } from '../../../systems/ai/MirrorCoachEngine.js';

describe('MirrorCoachEngine', () => {
    let c;
    beforeEach(() => { c = new MirrorCoachEngine(); });

    it('initializes with defaults', () => { expect(c.stats.totalAdvice).toBe(0); });

    it('setStyle and getStyle', () => {
        c.setStyle('p1', 'analytical');
        expect(c.getStyle('p1')).toBe('analytical');
    });

    it('setStyle rejects invalid', () => { expect(c.setStyle('p1', 'invalid')).toBe(false); });

    it('getStyle for unknown returns supportive', () => { expect(c.getStyle('p1')).toBe('supportive'); });

    it('provideAdvice returns entry', () => {
        const e = c.provideAdvice('p1', 'stuck');
        expect(e).not.toBeNull();
        expect(c.stats.totalAdvice).toBe(1);
    });

    it('provideAdvice rejects invalid trigger', () => { expect(c.provideAdvice('p1', 'invalid')).toBeNull(); });

    it('listAdvice and recentAdvice', () => {
        c.provideAdvice('p1', 'stuck');
        c.provideAdvice('p1', 'failing');
        expect(c.listAdvice('p1').length).toBe(2);
        expect(c.recentAdvice('p1', 1).length).toBe(1);
    });

    it('isActionable detects advice', () => {
        expect(c.isActionable('建议尝试不同策略')).toBe(true);
        expect(c.isActionable('加油')).toBe(false);
    });

    it('record tracks user response', () => {
        c.record('p1', 'advice', true);
        c.record('p1', 'advice2', false);
        expect(c.acceptanceRate('p1')).toBe(0.5);
    });

    it('acceptanceRate for empty returns 0', () => { expect(c.acceptanceRate('p1')).toBe(0); });

    it('caps advice history at 100', () => {
        for (let i = 0; i < 150; i++) c.provideAdvice('p1', 'stuck');
        expect(c.listAdvice('p1').length).toBe(100);
    });

    it('triggers adviceProvided hook', () => {
        let called = false;
        c.registerHook('adviceProvided', () => { called = true; });
        c.provideAdvice('p1', 'stuck');
        expect(called).toBe(true);
    });

    it('report aggregates', () => {
        c.provideAdvice('p1', 'stuck');
        const r = c.report('p1');
        expect(r.totalAdvice).toBe(1);
    });

    it('reset clears', () => {
        c.provideAdvice('p1', 'stuck');
        c.reset();
        expect(c.stats.totalAdvice).toBe(0);
    });

    it('exposes COACHING_STYLES and COACHING_TRIGGERS', () => {
        expect(COACHING_STYLES).toContain('supportive');
        expect(COACHING_TRIGGERS).toContain('stuck');
    });

    it('covers all coaching styles', () => {
        for (const style of COACHING_STYLES) {
            c.setStyle('p1', style);
            const e = c.provideAdvice('p1', 'stuck');
            expect(e.style).toBe(style);
        }
    });

    it('covers all coaching triggers', () => {
        for (const t of COACHING_TRIGGERS) {
            expect(c.provideAdvice('p1', t)).not.toBeNull();
        }
    });
});
