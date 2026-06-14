import { describe, it, expect, beforeEach } from 'vitest';
import { BreakthroughCatalyst, CATALYST_TYPES } from '../../../systems/arena/BreakthroughCatalyst.js';

describe('BreakthroughCatalyst', () => {
    let c;
    beforeEach(() => { c = new BreakthroughCatalyst(); });
    it('initializes with defaults', () => { expect(c.stats.total).toBe(0); });
    it('create', () => { expect(c.create('pill', 'common', 10)).not.toBeNull(); });
    it('create rejects invalid type', () => { expect(c.create('invalid', 'common', 10)).toBeNull(); });
    it('create normalizes invalid rarity', () => { const x = c.create('pill', 'invalid', 10); expect(x.rarity).toBe('common'); });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('listAll and listByType and listByRarity', () => { c.create('pill', 'common', 10); c.create('tribulation', 'rare', 10); expect(c.listAll().length).toBe(2); expect(c.listByType('pill').length).toBe(1); expect(c.listByRarity('rare').length).toBe(1); });
    it('listOwned and listUnused', () => { const x = c.create('pill', 'common', 10); c.setOwner(x.id, 'p1'); expect(c.listOwned('p1').length).toBe(1); expect(c.listUnused().length).toBe(1); });
    it('setOwner', () => { const x = c.create('pill', 'common', 10); expect(c.setOwner(x.id, 'p1')).toBe(true); });
    it('setOwner returns false for unknown', () => { expect(c.setOwner('ghost', 'p1')).toBe(false); });
    it('use', () => { const x = c.create('pill', 'common', 10); c.setOwner(x.id, 'p1'); expect(c.use(x.id)).not.toBeNull(); });
    it('use returns null for used', () => { const x = c.create('pill', 'common', 10); c.use(x.id); expect(c.use(x.id)).toBeNull(); });
    it('use returns null for unknown', () => { expect(c.use('ghost')).toBeNull(); });
    it('totalBoostFor', () => { const x = c.create('pill', 'legendary', 100); c.setOwner(x.id, 'p1'); c.use(x.id); expect(c.totalBoostFor('p1')).toBe(500); });
    it('bestForType', () => { const x = c.create('pill', 'rare', 100); c.setOwner(x.id, 'p1'); expect(c.bestForType('p1', 'pill').id).toBe(x.id); });
    it('bestForType null', () => { expect(c.bestForType('ghost', 'pill')).toBeNull(); });
    it('hasUnused and unusedCount', () => { const x = c.create('pill', 'common', 10); c.setOwner(x.id, 'p1'); expect(c.hasUnused('p1')).toBe(true); expect(c.unusedCount('p1')).toBe(1); });
    it('history_', () => { const x = c.create('pill', 'common', 10); c.setOwner(x.id, 'p1'); c.use(x.id); expect(c.history_('p1').length).toBe(1); });
    it('isUsable', () => { const x = c.create('pill', 'common', 10); expect(c.isUsable(x.id)).toBe(true); c.use(x.id); expect(c.isUsable(x.id)).toBe(false); });
    it('isUsable for unknown', () => { expect(c.isUsable('ghost')).toBe(false); });
    it('report aggregates', () => { c.create('pill', 'common', 10); expect(c.report().total).toBe(1); });
    it('reset clears', () => { c.create('pill', 'common', 10); c.reset(); expect(c.stats.total).toBe(0); });
    it('exposes CATALYST_TYPES', () => { expect(CATALYST_TYPES).toContain('pill'); });
});
