import { describe, it, expect, beforeEach } from 'vitest';
import { WeaponForge, WEAPON_TYPES } from '../../../systems/arena/WeaponForge.js';

describe('WeaponForge', () => {
    let w;
    beforeEach(() => { w = new WeaponForge(); });
    it('initializes with defaults', () => { expect(w.stats.total).toBe(0); });
    it('forge creates weapon', () => { expect(w.forge('Iron Sword', 'sword', 'common', 10)).not.toBeNull(); });
    it('forge rejects missing', () => { expect(w.forge('', 'sword')).toBeNull(); });
    it('forge normalizes invalid type', () => { const x = w.forge('A', 'blade'); expect(x.type).toBe('blade'); });
    it('forge normalizes invalid quality', () => { const x = w.forge('A', 'sword', 'invalid'); expect(x.quality).toBe('common'); });
    it('forge quality mult', () => { const x = w.forge('A', 'sword', 'legendary', 10); expect(x.atk).toBe(30); });
    it('get returns null for unknown', () => { expect(w.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByQuality', () => {
        w.forge('A', 'sword', 'common');
        w.forge('B', 'blade', 'rare');
        expect(w.listAll().length).toBe(2);
        expect(w.listByType('sword').length).toBe(1);
        expect(w.listByQuality('rare').length).toBe(1);
    });
    it('listByOwner and listUnowned', () => {
        const x = w.forge('A', 'sword');
        w.setOwner(x.id, 'p1');
        expect(w.listByOwner('p1').length).toBe(1);
        expect(w.listUnowned().length).toBe(0);
    });
    it('addTrait and hasTrait', () => { const x = w.forge('A', 'sword'); w.addTrait(x.id, 'fire'); expect(w.hasTrait(x.id, 'fire')).toBe(true); });
    it('addTrait returns false for unknown', () => { expect(w.addTrait('ghost', 't')).toBe(false); });
    it('setOwner and unequip', () => { const x = w.forge('A', 'sword'); w.setOwner(x.id, 'p1'); expect(w.unequip(x.id)).toBe(true); });
    it('setOwner returns false for unknown', () => { expect(w.setOwner('ghost', 'p1')).toBe(false); });
    it('isOwned and ownerOf', () => { const x = w.forge('A', 'sword'); w.setOwner(x.id, 'p1'); expect(w.isOwned(x.id)).toBe(true); expect(w.ownerOf(x.id)).toBe('p1'); });
    it('ownerOf for unknown', () => { expect(w.ownerOf('ghost')).toBeNull(); });
    it('countByType', () => { w.forge('A', 'sword'); w.forge('B', 'sword'); expect(w.countByType().sword).toBe(2); });
    it('bestFor', () => { const a = w.forge('A', 'sword', 'common', 10); const b = w.forge('B', 'sword', 'rare', 10); w.setOwner(a.id, 'p1'); w.setOwner(b.id, 'p1'); expect(w.bestFor('p1').atk).toBe(15); });
    it('bestFor null', () => { expect(w.bestFor('ghost')).toBeNull(); });
    it('countByQuality', () => { w.forge('A', 'sword', 'rare'); expect(w.countByQuality().rare).toBe(1); });
    it('report aggregates', () => { w.forge('A', 'sword'); expect(w.report().total).toBe(1); });
    it('reset clears', () => { w.forge('A', 'sword'); w.reset(); expect(w.stats.total).toBe(0); });
    it('exposes WEAPON_TYPES', () => { expect(WEAPON_TYPES).toContain('sword'); });
});
