import { describe, it, expect, beforeEach } from 'vitest';
import { SynergyDetector, SYNERGY_LEVELS } from '../../../systems/alchemy/SynergyDetector.js';

describe('SynergyDetector', () => {
    let s;
    beforeEach(() => { s = new SynergyDetector(); });
    it('initializes with defaults', () => { expect(s.stats.total).toBe(0); });
    it('registerSynergy', () => { expect(s.registerSynergy('h1', 'h2', 'strong')).toBe(true); });
    it('registerSynergy rejects invalid', () => { expect(s.registerSynergy('h1', 'h2', 'invalid')).toBe(false); });
    it('pairLevel', () => { s.registerSynergy('h1', 'h2', 'strong'); expect(s.pairLevel('h2', 'h1')).toBe('strong'); });
    it('pairLevel none', () => { expect(s.pairLevel('a', 'b')).toBe('none'); });
    it('detect', () => { expect(s.detect(['h1', 'h2'])).not.toBeNull(); });
    it('detect rejects non-array', () => { expect(s.detect('not array')).toBeNull(); });
    it('detect empty array', () => { const x = s.detect([]); expect(x.level).toBe('none'); });
    it('detect strong', () => { s.registerSynergy('h1', 'h2', 'strong'); const x = s.detect(['h1', 'h2']); expect(x.level).toBe('strong'); });
    it('detect perfect', () => { s.registerSynergy('h1', 'h2', 'perfect'); const x = s.detect(['h1', 'h2']); expect(x.level).toBe('perfect'); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll and listByLevel', () => { s.detect(['h1']); expect(s.listAll().length).toBe(1); });
    it('listByLevel', () => { s.registerSynergy('h1', 'h2', 'perfect'); const x = s.detect(['h1', 'h2']); expect(s.listByLevel('perfect').length).toBe(1); });
    it('isPerfect and isStrong', () => { s.registerSynergy('h1', 'h2', 'perfect'); const x = s.detect(['h1', 'h2']); expect(s.isPerfect(x.id)).toBe(true); expect(s.isStrong(x.id)).toBe(true); });
    it('isPerfect false for non-perfect', () => { const x = s.detect(['h1']); expect(s.isPerfect(x.id)).toBe(false); });
    it('perfectRatio', () => { s.registerSynergy('h1', 'h2', 'perfect'); s.detect(['h1', 'h2']); s.detect(['h3']); expect(s.perfectRatio()).toBe(0.5); });
    it('averageScore', () => { s.registerSynergy('h1', 'h2', 'strong'); s.detect(['h1', 'h2']); expect(s.averageScore()).toBe(3); });
    it('best', () => { s.registerSynergy('h1', 'h2', 'perfect'); s.detect(['h1', 'h2']); expect(s.best().score).toBe(5); });
    it('best for empty', () => { expect(s.best()).toBeNull(); });
    it('report aggregates', () => { s.detect(['h1']); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.detect(['h1']); s.reset(); expect(s.stats.total).toBe(0); });
    it('exposes SYNERGY_LEVELS', () => { expect(SYNERGY_LEVELS).toContain('strong'); });
});
