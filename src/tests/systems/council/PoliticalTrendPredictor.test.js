import { describe, it, expect, beforeEach } from 'vitest';
import { PoliticalTrendPredictor, TREND_DIRECTIONS } from '../../../systems/council/PoliticalTrendPredictor.js';

describe('PoliticalTrendPredictor', () => {
    let p;
    beforeEach(() => { p = new PoliticalTrendPredictor(); });
    it('initializes with defaults', () => { expect(p.stats.totalObservations).toBe(0); });
    it('observe adds value', () => { expect(p.observe('tax', 10)).toBe(true); });
    it('observe rejects invalid', () => { expect(p.observe('', 10)).toBe(false); expect(p.observe('tax', 'x')).toBe(false); });
    it('getHistory for unknown returns []', () => { expect(p.getHistory('ghost').length).toBe(0); });
    it('topics', () => { p.observe('tax', 10); expect(p.topics()).toContain('tax'); });
    it('trend for unknown is stable', () => { expect(p.trend('ghost')).toBe('stable'); });
    it('trend for single point is stable', () => { p.observe('tax', 10); expect(p.trend('tax')).toBe('stable'); });
    it('trend rising', () => {
        for (let i = 0; i < 5; i++) p.observe('tax', i + 1);
        expect(p.trend('tax')).toBe('rising');
    });
    it('trend declining', () => {
        for (let i = 0; i < 5; i++) p.observe('tax', 10 - i);
        expect(p.trend('tax')).toBe('declining');
    });
    it('predict for topic with history', () => {
        p.observe('tax', 5);
        p.observe('tax', 6);
        expect(p.predict('tax').direction).toBe('stable');
    });
    it('predictAll', () => {
        p.observe('tax', 5);
        p.observe('tax', 6);
        p.observe('alliance', 1);
        const r = p.predictAll();
        expect(r.tax).toBeDefined();
    });
    it('isRising/isDeclining/isVolatile/isStable', () => {
        for (let i = 0; i < 5; i++) p.observe('tax', i + 1);
        expect(p.isRising('tax')).toBe(true);
    });
    it('isVolatile', () => {
        p.observe('tax', 1);
        p.observe('tax', 100);
        p.observe('tax', 1);
        p.observe('tax', 100);
        expect(p.isVolatile('tax')).toBe(true);
    });
    it('isStable', () => {
        for (let i = 0; i < 5; i++) p.observe('tax', 5);
        expect(p.isStable('tax')).toBe(true);
    });
    it('report aggregates', () => { p.observe('tax', 5); expect(p.report().observations).toBe(1); });
    it('reset clears', () => { p.observe('tax', 5); p.reset(); expect(p.stats.totalObservations).toBe(0); });
    it('exposes TREND_DIRECTIONS', () => { expect(TREND_DIRECTIONS).toContain('rising'); });
});
