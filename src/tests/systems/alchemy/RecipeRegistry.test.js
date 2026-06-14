import { describe, it, expect, beforeEach } from 'vitest';
import { RecipeRegistry, RECIPE_TYPES } from '../../../systems/alchemy/RecipeRegistry.js';

describe('RecipeRegistry', () => {
    let r;
    beforeEach(() => { r = new RecipeRegistry(); });
    it('initializes with defaults', () => { expect(r.stats.total).toBe(0); });
    it('addRecipe', () => { expect(r.addRecipe('Heal Pill', 'healing', ['herb1', 'herb2'])).not.toBeNull(); });
    it('addRecipe rejects missing name', () => { expect(r.addRecipe('', 'healing', [])).toBeNull(); });
    it('addRecipe rejects missing ingredients array', () => { expect(r.addRecipe('A', 'healing', 'not array')).toBeNull(); });
    it('addRecipe normalizes invalid type', () => { const x = r.addRecipe('A', 'invalid', []); expect(x.type).toBe('healing'); });
    it('addRecipe normalizes invalid rarity', () => { const x = r.addRecipe('A', 'healing', [], 1, 'invalid'); expect(x.rarity).toBe('common'); });
    it('get returns null for unknown', () => { expect(r.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByRarity', () => {
        r.addRecipe('A', 'healing', []);
        r.addRecipe('B', 'attack', [], 'pill1', 1, 'rare');
        expect(r.listAll().length).toBe(2);
        expect(r.listByType('healing').length).toBe(1);
        expect(r.listByRarity('rare').length).toBe(1);
    });
    it('searchByName', () => { r.addRecipe('Heal Pill', 'healing', []); expect(r.searchByName('heal').length).toBe(1); });
    it('hasIngredient and ingredientCount', () => { const x = r.addRecipe('A', 'healing', ['h1', 'h2']); expect(r.hasIngredient(x.id, 'h1')).toBe(true); expect(r.ingredientCount(x.id)).toBe(2); });
    it('byOutput and byDifficulty', () => {
        r.addRecipe('A', 'healing', [], 'pill1', 5);
        r.addRecipe('B', 'healing', [], 'pill2', 10);
        expect(r.byOutput('pill1').length).toBe(1);
        expect(r.byDifficulty(8).length).toBe(1);
    });
    it('byMaxDifficulty', () => { r.addRecipe('A', 'healing', [], 'p', 5); expect(r.byMaxDifficulty(10).length).toBe(1); });
    it('setDifficulty', () => { const x = r.addRecipe('A', 'healing', []); r.setDifficulty(x.id, 50); expect(r.get(x.id).difficulty).toBe(50); });
    it('setDifficulty returns false for unknown', () => { expect(r.setDifficulty('ghost', 50)).toBe(false); });
    it('setDifficulty clamps', () => { const x = r.addRecipe('A', 'healing', []); r.setDifficulty(x.id, 200); expect(r.get(x.id).difficulty).toBe(100); });
    it('countByType', () => { r.addRecipe('A', 'healing', []); expect(r.countByType().healing).toBe(1); });
    it('report aggregates', () => { r.addRecipe('A', 'healing', []); expect(r.report().total).toBe(1); });
    it('reset clears', () => { r.addRecipe('A', 'healing', []); r.reset(); expect(r.stats.total).toBe(0); });
    it('exposes RECIPE_TYPES', () => { expect(RECIPE_TYPES).toContain('healing'); });
});
