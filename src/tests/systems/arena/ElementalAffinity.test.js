import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalAffinity, ELEMENTS } from '../../../systems/arena/ElementalAffinity.js';

describe('ElementalAffinity', () => {
    let e;
    beforeEach(() => { e = new ElementalAffinity(); });
    it('initializes with defaults', () => { expect(e.stats.totalPlayers).toBe(0); });
    it('setAffinity', () => { expect(e.setAffinity('p1', 'fire', 80)).toBe(true); });
    it('setAffinity rejects invalid', () => { expect(e.setAffinity('', 'fire', 50)).toBe(false); expect(e.setAffinity('p1', 'invalid', 50)).toBe(false); });
    it('setAffinity clamps 0-100', () => { e.setAffinity('p1', 'fire', 200); expect(e.getAffinity('p1', 'fire')).toBe(100); });
    it('get returns empty', () => { expect(Object.keys(e.get('ghost')).length).toBe(0); });
    it('getAffinity for unknown', () => { expect(e.getAffinity('ghost', 'fire')).toBe(0); });
    it('primaryElement and secondaryElement', () => {
        e.setAffinity('p1', 'fire', 80);
        e.setAffinity('p1', 'water', 60);
        expect(e.primaryElement('p1')).toBe('fire');
        expect(e.secondaryElement('p1')).toBe('water');
    });
    it('primaryElement for unknown', () => { expect(e.primaryElement('ghost')).toBeNull(); });
    it('hasElement', () => { e.setAffinity('p1', 'fire', 50); expect(e.hasElement('p1', 'fire', 30)).toBe(true); expect(e.hasElement('p1', 'fire', 80)).toBe(false); });
    it('isStronger', () => { e.setAffinity('a', 'fire', 50); e.setAffinity('d', 'metal', 50); expect(e.isStronger('a', 'd')).toBe(true); });
    it('isStronger for unknown', () => { expect(e.isStronger('ghost', 'a')).toBe(false); });
    it('advantageBonus', () => { e.setAffinity('a', 'fire', 50); e.setAffinity('d', 'metal', 50); expect(e.advantageBonus('a', 'd')).toBe(1.25); });
    it('weakAgainst and strongAgainst', () => { expect(e.weakAgainst('water').length).toBeGreaterThan(0); expect(e.strongAgainst('fire')).toBe('metal'); });
    it('mastery', () => {
        e.setAffinity('p1', 'fire', 90);
        e.setAffinity('p1', 'water', 60);
        e.setAffinity('p1', 'wood', 30);
        e.setAffinity('p1', 'metal', 10);
        expect(e.mastery('p1', 'fire')).toBe('mastered');
    });
    it('distribution and totalAffinity', () => { e.setAffinity('p1', 'fire', 80); expect(e.distribution('p1').fire).toBe(80); expect(e.totalAffinity('p1')).toBe(80); });
    it('totalAffinity for unknown', () => { expect(e.totalAffinity('ghost')).toBe(0); });
    it('report aggregates', () => { e.setAffinity('p1', 'fire', 50); expect(e.report().totalPlayers).toBe(1); });
    it('reset clears', () => { e.setAffinity('p1', 'fire', 50); e.reset(); expect(e.stats.totalPlayers).toBe(0); });
    it('exposes ELEMENTS', () => { expect(ELEMENTS).toContain('fire'); });
});
