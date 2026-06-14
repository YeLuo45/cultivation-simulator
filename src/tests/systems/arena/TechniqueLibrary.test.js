import { describe, it, expect, beforeEach } from 'vitest';
import { TechniqueLibrary, TECHNIQUE_TYPES } from '../../../systems/arena/TechniqueLibrary.js';

describe('TechniqueLibrary', () => {
    let l;
    beforeEach(() => { l = new TechniqueLibrary(); });
    it('initializes with defaults', () => { expect(l.stats.total).toBe(0); });
    it('addTechnique', () => { expect(l.addTechnique('Sword Slash', 'sword', 'fire', 50, 5)).not.toBeNull(); });
    it('addTechnique rejects missing name', () => { expect(l.addTechnique('', 'sword')).toBeNull(); });
    it('addTechnique normalizes invalid type', () => { const x = l.addTechnique('T', 'invalid', 'fire'); expect(x.type).toBe('sword'); });
    it('addTechnique normalizes invalid element', () => { const x = l.addTechnique('T', 'sword', 'invalid'); expect(x.element).toBe('none'); });
    it('get returns null for unknown', () => { expect(l.get('ghost')).toBeNull(); });
    it('listAll', () => { l.addTechnique('T1', 'sword'); expect(l.listAll().length).toBe(1); });
    it('listByType and listByElement', () => {
        l.addTechnique('T1', 'sword', 'fire');
        l.addTechnique('T2', 'spear', 'water');
        expect(l.listByType('sword').length).toBe(1);
        expect(l.listByElement('fire').length).toBe(1);
    });
    it('searchByName', () => { l.addTechnique('Sword Slash', 'sword'); expect(l.searchByName('Sword').length).toBe(1); });
    it('setRequirements and meetsRequirements', () => {
        const x = l.addTechnique('T', 'sword');
        l.setRequirements(x.id, { level: 10 });
        expect(l.meetsRequirements(x.id, { level: 10 })).toBe(true);
        expect(l.meetsRequirements(x.id, { level: 5 })).toBe(false);
    });
    it('meetsRequirements for unknown', () => { expect(l.meetsRequirements('ghost', {})).toBe(false); });
    it('compatible', () => { const x = l.addTechnique('T', 'sword', 'fire'); expect(l.compatible(x.id, 'fire')).toBe(true); expect(l.compatible(x.id, 'water')).toBe(false); });
    it('compatible for none', () => { const x = l.addTechnique('T', 'sword', 'none'); expect(l.compatible(x.id, 'fire')).toBe(true); });
    it('compatible for unknown', () => { expect(l.compatible('ghost', 'fire')).toBe(false); });
    it('byPower', () => { l.addTechnique('T1', 'sword', 'fire', 50); l.addTechnique('T2', 'sword', 'fire', 100); expect(l.byPower(75).length).toBe(1); });
    it('isAffordable', () => { const x = l.addTechnique('T', 'sword', 'fire', 50, 10); expect(l.isAffordable(x.id, 20)).toBe(true); expect(l.isAffordable(x.id, 5)).toBe(false); });
    it('bestForElement', () => {
        l.addTechnique('T1', 'sword', 'fire', 50);
        l.addTechnique('T2', 'sword', 'fire', 100);
        expect(l.bestForElement('fire').power).toBe(100);
    });
    it('bestForElement null', () => { expect(l.bestForElement('fire')).toBeNull(); });
    it('report aggregates', () => { l.addTechnique('T', 'sword'); expect(l.report().total).toBe(1); });
    it('reset clears', () => { l.addTechnique('T', 'sword'); l.reset(); expect(l.stats.total).toBe(0); });
    it('exposes TECHNIQUE_TYPES', () => { expect(TECHNIQUE_TYPES).toContain('sword'); });
});
