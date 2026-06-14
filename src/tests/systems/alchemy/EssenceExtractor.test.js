import { describe, it, expect, beforeEach } from 'vitest';
import { EssenceExtractor, ESSENCE_TYPES } from '../../../systems/alchemy/EssenceExtractor.js';

describe('EssenceExtractor', () => {
    let e;
    beforeEach(() => { e = new EssenceExtractor(); });
    it('initializes with defaults', () => { expect(e.stats.total).toBe(0); });
    it('extract', () => { expect(e.extract('source1', 'qi', 95, 10)).not.toBeNull(); });
    it('extract rejects missing', () => { expect(e.extract('', 'qi')).toBeNull(); });
    it('extract rejects invalid type', () => { expect(e.extract('a', 'invalid')).toBeNull(); });
    it('extract rejects non-positive amount', () => { expect(e.extract('a', 'qi', 95, 0)).toBeNull(); });
    it('extract result is pure for high purity', () => { const x = e.extract('a', 'qi', 95); expect(x.result).toBe('pure'); });
    it('extract result is diluted', () => { const x = e.extract('a', 'qi', 70); expect(x.result).toBe('diluted'); });
    it('extract result is contaminated', () => { const x = e.extract('a', 'qi', 40); expect(x.result).toBe('contaminated'); });
    it('extract result is failed', () => { const x = e.extract('a', 'qi', 10); expect(x.result).toBe('failed'); });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByResult and listBySource', () => {
        e.extract('s1', 'qi', 95);
        e.extract('s1', 'soul', 50);
        e.extract('s2', 'qi', 90);
        expect(e.listAll().length).toBe(3);
        expect(e.listByType('qi').length).toBe(2);
        expect(e.listByResult('pure').length).toBe(2);
        expect(e.listBySource('s1').length).toBe(2);
    });
    it('totalAmount', () => { e.extract('a', 'qi', 95, 10); e.extract('a', 'qi', 90, 5); expect(e.totalAmount('qi')).toBe(15); });
    it('isPure and isContaminated and isFailed', () => {
        const a = e.extract('a', 'qi', 95);
        const b = e.extract('a', 'qi', 40);
        const c = e.extract('a', 'qi', 10);
        expect(e.isPure(a.id)).toBe(true);
        expect(e.isContaminated(b.id)).toBe(true);
        expect(e.isFailed(c.id)).toBe(true);
    });
    it('averagePurity', () => { e.extract('a', 'qi', 80); e.extract('a', 'qi', 60); expect(e.averagePurity()).toBe(70); });
    it('pureCount and pureRatio', () => { e.extract('a', 'qi', 95); e.extract('a', 'qi', 10); expect(e.pureCount()).toBe(1); expect(e.pureRatio()).toBe(0.5); });
    it('bestExtraction', () => { e.extract('a', 'qi', 80); e.extract('a', 'qi', 95); expect(e.bestExtraction('qi').purity).toBe(95); });
    it('bestExtraction null for no data', () => { expect(e.bestExtraction('qi')).toBeNull(); });
    it('report aggregates', () => { e.extract('a', 'qi', 95); expect(e.report().total).toBe(1); });
    it('reset clears', () => { e.extract('a', 'qi', 95); e.reset(); expect(e.stats.total).toBe(0); });
    it('exposes ESSENCE_TYPES', () => { expect(ESSENCE_TYPES).toContain('qi'); });
});
