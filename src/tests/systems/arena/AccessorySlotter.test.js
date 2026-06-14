import { describe, it, expect, beforeEach } from 'vitest';
import { AccessorySlotter, ACCESSORY_SLOTS } from '../../../systems/arena/AccessorySlotter.js';

describe('AccessorySlotter', () => {
    let a;
    beforeEach(() => { a = new AccessorySlotter(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('create', () => { expect(a.create('Power Ring', 'ring1', { atk: 5 })).not.toBeNull(); });
    it('create rejects missing', () => { expect(a.create('', 'ring1')).toBeNull(); expect(a.create('A', 'invalid')).toBeNull(); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll and listBySlot', () => { a.create('A', 'ring1'); a.create('B', 'amulet'); expect(a.listAll().length).toBe(2); expect(a.listBySlot('ring1').length).toBe(1); });
    it('listUnequipped', () => { a.create('A', 'ring1'); expect(a.listUnequipped().length).toBe(1); });
    it('equip and unequip', () => { const x = a.create('A', 'ring1'); a.equip('p1', x.id); expect(a.unequip('p1', x.id)).toBe(true); });
    it('equip returns false for unknown', () => { expect(a.equip('ghost', 'a')).toBe(false); });
    it('getEquipped and hasEmptySlot and totalSlots', () => { const x = a.create('A', 'ring1'); a.equip('p1', x.id); expect(a.getEquipped('p1').ring1).toBe(x.id); expect(a.hasEmptySlot('p1')).toBe(true); expect(a.totalSlots('p1')).toBe(1); });
    it('isEquipped', () => { const x = a.create('A', 'ring1'); a.equip('p1', x.id); expect(a.isEquipped('p1', x.id)).toBe(true); });
    it('stat', () => { const x = a.create('A', 'ring1', { atk: 5 }); a.equip('p1', x.id); expect(a.stat('p1', 'atk')).toBe(5); });
    it('allStats', () => { const x = a.create('A', 'ring1', { atk: 5, def: 2 }); a.equip('p1', x.id); expect(a.allStats('p1').atk).toBe(5); });
    it('report aggregates', () => { a.create('A', 'ring1'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.create('A', 'ring1'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes ACCESSORY_SLOTS', () => { expect(ACCESSORY_SLOTS).toContain('ring1'); });
});
