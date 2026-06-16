import { describe, it, expect, beforeEach } from 'vitest';
import { FormationRegistry, FORMATION_TYPES } from '../../../systems/shenzhu/FormationRegistry.js';

describe('FormationRegistry', () => {
    let r;
    beforeEach(() => { r = new FormationRegistry(); });
    it('initializes with defaults', () => { expect(r.stats.total).toBe(0); });
    it('register', () => { expect(r.register('A', 'defense')).not.toBeNull(); });
    it('register rejects missing', () => { expect(r.register('', 'defense')).toBeNull(); });
    it('register normalizes invalid type', () => { const x = r.register('A', 'invalid'); expect(x.type).toBe('defense'); });
    it('register normalizes invalid rarity', () => { const x = r.register('A', 'defense', 'invalid'); expect(x.rarity).toBe('common'); });
    it('get returns null for unknown', () => { expect(r.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByRarity and listDivine', () => {
        r.register('A', 'defense', 'common', 1, 'p1');
        r.register('B', 'attack', 'divine', 100);
        expect(r.listAll().length).toBe(2);
        expect(r.listByOwner('p1').length).toBe(1);
        expect(r.listByType('defense').length).toBe(1);
        expect(r.listByRarity('divine').length).toBe(1);
        expect(r.listDivine().length).toBe(1);
    });
    it('setPower', () => { const x = r.register('A', 'defense'); r.setPower(x.id, 50); expect(r.powerOf(x.id)).toBe(50); });
    it('setPower clamps', () => { const x = r.register('A', 'defense'); r.setPower(x.id, -5); expect(r.powerOf(x.id)).toBe(0); });
    it('setPower returns false for unknown', () => { expect(r.setPower('ghost', 50)).toBe(false); });
    it('setOwner', () => { const x = r.register('A', 'defense'); expect(r.setOwner(x.id, 'B')).toBe(true); });
    it('setOwner returns false for unknown', () => { expect(r.setOwner('ghost', 'B')).toBe(false); });
    it('isDivine', () => { const x = r.register('A', 'defense', 'divine'); expect(r.isDivine(x.id)).toBe(true); });
    it('isDivine for unknown', () => { expect(r.isDivine('ghost')).toBe(false); });
    it('powerOf and typeOf and rarityOf and ownerOf for unknown', () => { expect(r.powerOf('ghost')).toBe(0); expect(r.typeOf('ghost')).toBeNull(); expect(r.rarityOf('ghost')).toBeNull(); expect(r.ownerOf('ghost')).toBeNull(); });
    it('averagePower', () => { r.register('A', 'defense', 'common', 50); expect(r.averagePower()).toBe(50); });
    it('bestPower', () => { r.register('A', 'defense', 'common', 50); expect(r.bestPower().power).toBe(50); });
    it('bestPower null for empty', () => { expect(r.bestPower()).toBeNull(); });
    it('ownerCount', () => { r.register('A', 'defense', 'common', 1, 'p1'); expect(r.ownerCount('p1')).toBe(1); });
    it('ownerCount for unknown', () => { expect(r.ownerCount('ghost')).toBe(0); });
    it('countByType', () => { r.register('A', 'defense'); expect(r.countByType().defense).toBe(1); });
    it('report aggregates', () => { r.register('A', 'defense'); expect(r.report().total).toBe(1); });
    it('reset clears', () => { r.register('A', 'defense'); r.reset(); expect(r.stats.total).toBe(0); });
    it('exposes FORMATION_TYPES', () => { expect(FORMATION_TYPES).toContain('defense'); });
});
