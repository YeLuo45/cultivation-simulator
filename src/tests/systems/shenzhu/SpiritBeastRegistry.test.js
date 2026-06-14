import { describe, it, expect, beforeEach } from 'vitest';
import { SpiritBeastRegistry, BEAST_TYPES } from '../../../systems/shenzhu/SpiritBeastRegistry.js';

describe('SpiritBeastRegistry', () => {
    let r;
    beforeEach(() => { r = new SpiritBeastRegistry(); });
    it('initializes with defaults', () => { expect(r.stats.total).toBe(0); });
    it('register', () => { expect(r.register('A', 'dragon')).not.toBeNull(); });
    it('register rejects missing', () => { expect(r.register('', 'dragon')).toBeNull(); });
    it('register normalizes invalid type', () => { const x = r.register('A', 'invalid'); expect(x.type).toBe('wolf'); });
    it('register normalizes invalid rarity', () => { const x = r.register('A', 'dragon', 'invalid'); expect(x.rarity).toBe('common'); });
    it('get returns null for unknown', () => { expect(r.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByRarity and listDivine', () => {
        r.register('A', 'dragon', 'common', 1, 'p1');
        r.register('B', 'phoenix', 'divine', 5);
        expect(r.listAll().length).toBe(2);
        expect(r.listByOwner('p1').length).toBe(1);
        expect(r.listByType('dragon').length).toBe(1);
        expect(r.listByRarity('divine').length).toBe(1);
        expect(r.listDivine().length).toBe(1);
    });
    it('setLevel', () => { const x = r.register('A', 'dragon'); r.setLevel(x.id, 10); expect(r.levelOf(x.id)).toBe(10); });
    it('setLevel clamps to 1', () => { const x = r.register('A', 'dragon'); r.setLevel(x.id, 0); expect(r.levelOf(x.id)).toBe(1); });
    it('setLevel returns false for unknown', () => { expect(r.setLevel('ghost', 10)).toBe(false); });
    it('setOwner', () => { const x = r.register('A', 'dragon'); expect(r.setOwner(x.id, 'B')).toBe(true); });
    it('setOwner returns false for unknown', () => { expect(r.setOwner('ghost', 'B')).toBe(false); });
    it('isDivine and isPrimordial', () => { const x = r.register('A', 'dragon', 'primordial'); expect(r.isDivine(x.id)).toBe(true); expect(r.isPrimordial(x.id)).toBe(true); });
    it('isDivine for unknown', () => { expect(r.isDivine('ghost')).toBe(false); });
    it('levelOf and rarityOf and typeOf and ownerOf for unknown', () => { expect(r.levelOf('ghost')).toBe(0); expect(r.rarityOf('ghost')).toBeNull(); expect(r.typeOf('ghost')).toBeNull(); expect(r.ownerOf('ghost')).toBeNull(); });
    it('averageLevel', () => { r.register('A', 'dragon', 'common', 5); expect(r.averageLevel()).toBe(5); });
    it('bestLevel', () => { r.register('A', 'dragon', 'common', 5); expect(r.bestLevel().level).toBe(5); });
    it('bestLevel null for empty', () => { expect(r.bestLevel()).toBeNull(); });
    it('ownerCount', () => { r.register('A', 'dragon', 'common', 1, 'p1'); expect(r.ownerCount('p1')).toBe(1); });
    it('ownerCount for unknown', () => { expect(r.ownerCount('ghost')).toBe(0); });
    it('countByType', () => { r.register('A', 'dragon'); expect(r.countByType().dragon).toBe(1); });
    it('report aggregates', () => { r.register('A', 'dragon'); expect(r.report().total).toBe(1); });
    it('reset clears', () => { r.register('A', 'dragon'); r.reset(); expect(r.stats.total).toBe(0); });
    it('exposes BEAST_TYPES', () => { expect(BEAST_TYPES).toContain('dragon'); });
});
