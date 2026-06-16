import { describe, it, expect, beforeEach } from 'vitest';
import { IngredientCatalog, INGREDIENT_TYPES } from '../../../systems/alchemy/IngredientCatalog.js';

describe('IngredientCatalog', () => {
    let c;
    beforeEach(() => { c = new IngredientCatalog(); });
    it('initializes with defaults', () => { expect(c.stats.total).toBe(0); });
    it('add ingredient', () => { expect(c.add('Spirit Herb', 'herb', 'common', 10, 5, 100)).not.toBeNull(); });
    it('add rejects missing name', () => { expect(c.add('', 'herb')).toBeNull(); });
    it('add normalizes invalid type', () => { const x = c.add('A', 'invalid'); expect(x.type).toBe('herb'); });
    it('add normalizes invalid rarity', () => { const x = c.add('A', 'herb', 'invalid'); expect(x.rarity).toBe('common'); });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByRarity', () => {
        c.add('A', 'herb', 'common');
        c.add('B', 'mineral', 'rare');
        expect(c.listAll().length).toBe(2);
        expect(c.listByType('herb').length).toBe(1);
        expect(c.listByRarity('rare').length).toBe(1);
    });
    it('searchByName', () => { c.add('Spirit Herb', 'herb'); expect(c.searchByName('spirit').length).toBe(1); });
    it('setStock', () => { const x = c.add('A', 'herb'); c.setStock(x.id, 500); expect(c.get(x.id).stock).toBe(500); });
    it('setStock clamps', () => { const x = c.add('A', 'herb'); c.setStock(x.id, -100); expect(c.get(x.id).stock).toBe(0); });
    it('setStock returns false for unknown', () => { expect(c.setStock('ghost', 100)).toBe(false); });
    it('consume', () => { const x = c.add('A', 'herb', 'common', 10, 5, 100); expect(c.consume(x.id, 10)).toBe(true); });
    it('consume returns false for insufficient', () => { const x = c.add('A', 'herb', 'common', 10, 5, 5); expect(c.consume(x.id, 10)).toBe(false); });
    it('consume returns false for unknown', () => { expect(c.consume('ghost', 1)).toBe(false); });
    it('restock', () => { const x = c.add('A', 'herb', 'common', 10, 5, 50); expect(c.restock(x.id, 50)).toBe(true); });
    it('restock returns false for unknown', () => { expect(c.restock('ghost', 1)).toBe(false); });
    it('hasStock', () => { const x = c.add('A', 'herb', 'common', 10, 5, 100); expect(c.hasStock(x.id, 50)).toBe(true); });
    it('hasStock for unknown', () => { expect(c.hasStock('ghost')).toBe(false); });
    it('totalValue and totalQi', () => { c.add('A', 'herb', 'common', 10, 5, 100); expect(c.totalValue()).toBe(500); expect(c.totalQi()).toBe(1000); });
    it('setPrice', () => { const x = c.add('A', 'herb'); c.setPrice(x.id, 100); expect(c.get(x.id).price).toBe(100); });
    it('setPrice returns false for unknown', () => { expect(c.setPrice('ghost', 100)).toBe(false); });
    it('report aggregates', () => { c.add('A', 'herb'); expect(c.report().total).toBe(1); });
    it('reset clears', () => { c.add('A', 'herb'); c.reset(); expect(c.stats.total).toBe(0); });
    it('exposes INGREDIENT_TYPES', () => { expect(INGREDIENT_TYPES).toContain('herb'); });
});
