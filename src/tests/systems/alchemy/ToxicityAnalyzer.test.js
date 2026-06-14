import { describe, it, expect, beforeEach } from 'vitest';
import { ToxicityAnalyzer, TOXICITY_LEVELS } from '../../../systems/alchemy/ToxicityAnalyzer.js';

describe('ToxicityAnalyzer', () => {
    let a;
    beforeEach(() => { a = new ToxicityAnalyzer(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('analyze', () => { expect(a.analyze('item1', 50)).not.toBeNull(); });
    it('analyze rejects missing', () => { expect(a.analyze('', 50)).toBeNull(); });
    it('analyze level for low score', () => { const x = a.analyze('a', 5); expect(x.level).toBe('safe'); });
    it('analyze level mild', () => { const x = a.analyze('a', 20); expect(x.level).toBe('mild'); });
    it('analyze level moderate', () => { const x = a.analyze('a', 50); expect(x.level).toBe('moderate'); });
    it('analyze level severe', () => { const x = a.analyze('a', 70); expect(x.level).toBe('severe'); });
    it('analyze level lethal', () => { const x = a.analyze('a', 95); expect(x.level).toBe('lethal'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listForItem and listByLevel', () => {
        a.analyze('a', 95);
        a.analyze('a', 50);
        expect(a.listAll().length).toBe(2);
        expect(a.listForItem('a').length).toBe(2);
        expect(a.listByLevel('lethal').length).toBe(1);
    });
    it('isSafe and isLethal and isSevere', () => {
        const x = a.analyze('a', 5);
        expect(a.isSafe(x.id)).toBe(true);
    });
    it('isLethal true', () => { const x = a.analyze('a', 95); expect(a.isLethal(x.id)).toBe(true); });
    it('isSevere true', () => { const x = a.analyze('a', 70); expect(a.isSevere(x.id)).toBe(true); });
    it('itemLevel', () => { a.analyze('a', 95); a.analyze('a', 50); expect(a.itemLevel('a')).toBe('moderate'); });
    it('itemLevel for unknown', () => { expect(a.itemLevel('a')).toBeNull(); });
    it('itemScore', () => { a.analyze('a', 50); a.analyze('a', 60); expect(a.itemScore('a')).toBe(60); });
    it('itemScore for no analyses', () => { expect(a.itemScore('a')).toBe(0); });
    it('averageScore', () => { a.analyze('a', 50); a.analyze('b', 70); expect(a.averageScore()).toBe(60); });
    it('safeCount and safeRatio', () => { a.analyze('a', 5); a.analyze('b', 95); expect(a.safeCount()).toBe(1); expect(a.safeRatio()).toBe(0.5); });
    it('report aggregates', () => { a.analyze('a', 5); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.analyze('a', 5); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes TOXICITY_LEVELS', () => { expect(TOXICITY_LEVELS).toContain('safe'); });
});
