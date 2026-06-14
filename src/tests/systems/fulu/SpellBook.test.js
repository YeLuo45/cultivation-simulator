import { describe, it, expect, beforeEach } from 'vitest';
import { SpellBook, SPELL_TYPES } from '../../../systems/fulu/SpellBook.js';

describe('SpellBook', () => {
    let b;
    beforeEach(() => { b = new SpellBook(); });
    it('initializes with defaults', () => { expect(b.stats.total).toBe(0); });
    it('addSpell', () => { expect(b.addSpell('A', 'fire')).not.toBeNull(); });
    it('addSpell rejects missing', () => { expect(b.addSpell('', 'fire')).toBeNull(); });
    it('addSpell normalizes invalid type', () => { const x = b.addSpell('A', 'invalid'); expect(x.type).toBe('fire'); });
    it('addSpell normalizes invalid tier', () => { const x = b.addSpell('A', 'fire', 'invalid'); expect(x.tier).toBe('cantrip'); });
    it('get returns null for unknown', () => { expect(b.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByTier and listFifthTier', () => {
        b.addSpell('A', 'fire', 'cantrip', 5, 'p1');
        b.addSpell('B', 'healing', 'fifth', 100);
        expect(b.listAll().length).toBe(2);
        expect(b.listByOwner('p1').length).toBe(1);
        expect(b.listByType('fire').length).toBe(1);
        expect(b.listByTier('fifth').length).toBe(1);
        expect(b.listFifthTier().length).toBe(1);
    });
    it('setTier and setMana and setOwner', () => { const x = b.addSpell('A', 'fire'); b.setTier(x.id, 'fifth'); b.setMana(x.id, 50); b.setOwner(x.id, 'p2'); expect(x.tier).toBe('fifth'); expect(x.mana).toBe(50); expect(x.owner).toBe('p2'); });
    it('setTier rejects invalid', () => { const x = b.addSpell('A', 'fire'); expect(b.setTier(x.id, 'invalid')).toBe(false); });
    it('setTier/Mana/Owner return false for unknown', () => { expect(b.setTier('ghost', 'fifth')).toBe(false); expect(b.setMana('ghost', 50)).toBe(false); expect(b.setOwner('ghost', 'p2')).toBe(false); });
    it('isFifthTier', () => { const x = b.addSpell('A', 'fire', 'fifth'); expect(b.isFifthTier(x.id)).toBe(true); });
    it('isFifthTier for unknown', () => { expect(b.isFifthTier('ghost')).toBe(false); });
    it('manaOf and typeOf and tierOf and ownerOf for unknown', () => { expect(b.manaOf('ghost')).toBe(0); expect(b.typeOf('ghost')).toBeNull(); expect(b.tierOf('ghost')).toBeNull(); expect(b.ownerOf('ghost')).toBeNull(); });
    it('tierIndex', () => { const x = b.addSpell('A', 'fire', 'third'); expect(b.tierIndex(x.id)).toBe(3); });
    it('tierIndex for unknown', () => { expect(b.tierIndex('ghost')).toBe(-1); });
    it('averageMana', () => { b.addSpell('A', 'fire', 'cantrip', 50); expect(b.averageMana()).toBe(50); });
    it('ownerCount and bestMana', () => { b.addSpell('A', 'fire', 'cantrip', 5, 'p1'); expect(b.ownerCount('p1')).toBe(1); expect(b.bestMana()).not.toBeNull(); });
    it('ownerCount for unknown', () => { expect(b.ownerCount('ghost')).toBe(0); });
    it('bestMana null for empty', () => { expect(b.bestMana()).toBeNull(); });
    it('countByType', () => { b.addSpell('A', 'fire'); expect(b.countByType().fire).toBe(1); });
    it('report aggregates', () => { b.addSpell('A', 'fire'); expect(b.report().total).toBe(1); });
    it('reset clears', () => { b.addSpell('A', 'fire'); b.reset(); expect(b.stats.total).toBe(0); });
    it('exposes SPELL_TYPES', () => { expect(SPELL_TYPES).toContain('fire'); });
});
