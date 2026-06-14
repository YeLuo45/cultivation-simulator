import { describe, it, expect, beforeEach } from 'vitest';
import { ArmorSetManager, ARMOR_SLOTS } from '../../../systems/arena/ArmorSetManager.js';

describe('ArmorSetManager', () => {
    let a;
    beforeEach(() => { a = new ArmorSetManager(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('createPiece', () => { expect(a.createPiece('Iron Helm', 'head', 'set1')).not.toBeNull(); });
    it('createPiece rejects missing', () => { expect(a.createPiece('', 'head')).toBeNull(); expect(a.createPiece('A', 'invalid')).toBeNull(); });
    it('createPiece normalizes invalid rarity', () => { const x = a.createPiece('A', 'head', null, 'invalid'); expect(x.rarity).toBe('common'); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listBySlot and listBySet and listUnset', () => {
        a.createPiece('A', 'head', 's1');
        a.createPiece('B', 'chest', null);
        expect(a.listAll().length).toBe(2);
        expect(a.listBySlot('head').length).toBe(1);
        expect(a.listBySet('s1').length).toBe(1);
        expect(a.listUnset().length).toBe(1);
    });
    it('equip and unequip', () => { const x = a.createPiece('A', 'head'); a.equip('p1', x.id); expect(a.unequip('p1', 'head')).toBe(true); });
    it('equip returns false for unknown', () => { expect(a.equip('ghost', 'p1')).toBe(false); });
    it('getEquipped and pieceInSlot', () => { const x = a.createPiece('A', 'head'); a.equip('p1', x.id); expect(a.getEquipped('p1').head).toBe(x.id); expect(a.pieceInSlot('p1', 'head').name).toBe('A'); });
    it('isEquipped', () => { const x = a.createPiece('A', 'head'); a.equip('p1', x.id); expect(a.isEquipped('p1', x.id)).toBe(true); });
    it('totalDef', () => { const x = a.createPiece('A', 'head', null, 'common', 10); a.equip('p1', x.id); expect(a.totalDef('p1')).toBe(10); });
    it('totalDef for no equipment', () => { expect(a.totalDef('p1')).toBe(0); });
    it('filledSlots', () => { const x = a.createPiece('A', 'head'); a.equip('p1', x.id); expect(a.filledSlots('p1')).toBe(1); });
    it('hasFullSet', () => {
        const h = a.createPiece('H', 'head', 's1');
        const c = a.createPiece('C', 'chest', 's1');
        a.equip('p1', h.id);
        a.equip('p1', c.id);
        expect(a.hasFullSet('p1', 's1')).toBe(true);
    });
    it('hasFullSet false for partial', () => {
        a.createPiece('H', 'head', 's1');
        expect(a.hasFullSet('p1', 's1')).toBe(false);
    });
    it('setPiecesEquipped', () => { const x = a.createPiece('A', 'head', 's1'); a.equip('p1', x.id); expect(a.setPiecesEquipped('p1', 's1')).toBe(1); });
    it('report aggregates', () => { a.createPiece('A', 'head'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.createPiece('A', 'head'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes ARMOR_SLOTS', () => { expect(ARMOR_SLOTS).toContain('head'); });
});
