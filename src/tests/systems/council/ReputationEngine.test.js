import { describe, it, expect, beforeEach } from 'vitest';
import { ReputationEngine, REPUTATION_LEVELS } from '../../../systems/council/ReputationEngine.js';

describe('ReputationEngine', () => {
    let e;
    beforeEach(() => { e = new ReputationEngine(); });
    it('initializes with defaults', () => { expect(e.stats.changes).toBe(0); });
    it('init creates entry', () => { expect(e.init('m1', 50)).toBe(true); });
    it('init clamps score', () => { e.init('m1', 200); expect(e.get('m1')).toBe(100); });
    it('get for unknown returns 0', () => { expect(e.get('ghost')).toBe(0); });
    it('getLevel for unknown returns reviled', () => { expect(e.getLevel('ghost')).toBe('reviled'); });
    it('getLevel for high score', () => { e.init('m1', 95); expect(e.getLevel('m1')).toBe('legendary'); });
    it('getLevel mappings', () => {
        e.init('a', 10); e.init('b', 30); e.init('c', 50); e.init('d', 70); e.init('e', 90);
        expect(e.getLevel('a')).toBe('reviled');
        expect(e.getLevel('b')).toBe('distrusted');
        expect(e.getLevel('c')).toBe('neutral');
        expect(e.getLevel('d')).toBe('respected');
        expect(e.getLevel('e')).toBe('legendary');
    });
    it('add increases score', () => { expect(e.add('m1', 20)).toBe(20); });
    it('add clamps to 100', () => { e.add('m1', 200); expect(e.get('m1')).toBe(100); });
    it('add rejects invalid', () => { expect(e.add('', 10)).toBeNull(); expect(e.add('m1', 'x')).toBeNull(); });
    it('decay decreases score', () => { e.init('m1', 50); e.decay('m1'); expect(e.get('m1')).toBeLessThan(50); });
    it('decay clamps to 0', () => { e.init('m1', 0); e.decay('m1'); expect(e.get('m1')).toBe(0); });
    it('decayAll', () => {
        e.init('m1', 50);
        e.init('m2', 50);
        e.decayAll();
        expect(e.get('m1')).toBeLessThan(50);
    });
    it('topReputation and bottomReputation', () => {
        e.init('m1', 30);
        e.init('m2', 80);
        expect(e.topReputation()[0][0]).toBe('m2');
    });
    it('byLevel', () => {
        e.init('m1', 30);
        e.init('m2', 90);
        expect(e.byLevel('legendary')).toContain('m2');
    });
    it('history', () => { e.init('m1', 30); expect(e.history('m1').length).toBe(1); });
    it('report aggregates', () => { e.init('m1', 30); expect(e.report().totalTracked).toBe(1); });
    it('reset clears', () => { e.init('m1', 30); e.reset(); expect(e.reputation.size).toBe(0); });
    it('exposes REPUTATION_LEVELS', () => { expect(REPUTATION_LEVELS).toContain('revered'); });
});
