import { describe, it, expect, beforeEach } from 'vitest';
import { SymbolDesigner, SYMBOL_CATEGORIES } from '../../../systems/fulu/SymbolDesigner.js';

describe('SymbolDesigner', () => {
    let s;
    beforeEach(() => { s = new SymbolDesigner(); });
    it('initializes with defaults', () => { expect(s.stats.total).toBe(0); });
    it('design', () => { expect(s.design('A', 'offensive')).not.toBeNull(); });
    it('design rejects missing', () => { expect(s.design('', 'offensive')).toBeNull(); });
    it('design normalizes invalid category', () => { const x = s.design('A', 'invalid'); expect(x.category).toBe('utility'); });
    it('design normalizes invalid rarity', () => { const x = s.design('A', 'offensive', 1, 'invalid'); expect(x.rarity).toBe('common'); });
    it('get returns null for unknown', () => { expect(s.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByCategory and listByRarity and listMythic', () => {
        s.design('A', 'offensive', 1, 'common', 'p1');
        s.design('B', 'healing', 5, 'mythic');
        expect(s.listAll().length).toBe(2);
        expect(s.listByOwner('p1').length).toBe(1);
        expect(s.listByCategory('offensive').length).toBe(1);
        expect(s.listByRarity('mythic').length).toBe(1);
        expect(s.listMythic().length).toBe(1);
    });
    it('setComplexity', () => { const x = s.design('A', 'offensive'); s.setComplexity(x.id, 10); expect(s.complexityOf(x.id)).toBe(10); });
    it('setComplexity clamps', () => { const x = s.design('A', 'offensive'); s.setComplexity(x.id, -5); expect(s.complexityOf(x.id)).toBe(0); });
    it('setComplexity returns false for unknown', () => { expect(s.setComplexity('ghost', 10)).toBe(false); });
    it('setRarity and setOwner', () => { const x = s.design('A', 'offensive'); s.setRarity(x.id, 'mythic'); s.setOwner(x.id, 'p2'); expect(x.rarity).toBe('mythic'); expect(x.owner).toBe('p2'); });
    it('setRarity rejects invalid', () => { const x = s.design('A', 'offensive'); expect(s.setRarity(x.id, 'invalid')).toBe(false); });
    it('setRarity/Owner return false for unknown', () => { expect(s.setRarity('ghost', 'mythic')).toBe(false); expect(s.setOwner('ghost', 'p2')).toBe(false); });
    it('isMythic', () => { const x = s.design('A', 'offensive', 1, 'mythic'); expect(s.isMythic(x.id)).toBe(true); });
    it('isMythic for unknown', () => { expect(s.isMythic('ghost')).toBe(false); });
    it('complexityOf and rarityOf and categoryOf and ownerOf for unknown', () => { expect(s.complexityOf('ghost')).toBe(0); expect(s.rarityOf('ghost')).toBeNull(); expect(s.categoryOf('ghost')).toBeNull(); expect(s.ownerOf('ghost')).toBeNull(); });
    it('averageComplexity', () => { s.design('A', 'offensive', 5); expect(s.averageComplexity()).toBe(5); });
    it('ownerCount and bestComplexity', () => { s.design('A', 'offensive', 1, 'common', 'p1'); expect(s.ownerCount('p1')).toBe(1); expect(s.bestComplexity()).not.toBeNull(); });
    it('ownerCount for unknown', () => { expect(s.ownerCount('ghost')).toBe(0); });
    it('bestComplexity null for empty', () => { expect(s.bestComplexity()).toBeNull(); });
    it('countByCategory', () => { s.design('A', 'offensive'); expect(s.countByCategory().offensive).toBe(1); });
    it('report aggregates', () => { s.design('A', 'offensive'); expect(s.report().total).toBe(1); });
    it('reset clears', () => { s.design('A', 'offensive'); s.reset(); expect(s.stats.total).toBe(0); });
    it('exposes SYMBOL_CATEGORIES', () => { expect(SYMBOL_CATEGORIES).toContain('offensive'); });
});
