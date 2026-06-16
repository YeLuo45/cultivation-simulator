import { describe, it, expect, beforeEach } from 'vitest';
import { BrushSmith, BRUSH_TYPES } from '../../../systems/fulu/BrushSmith.js';

describe('BrushSmith', () => {
    let b;
    beforeEach(() => { b = new BrushSmith(); });
    it('initializes with defaults', () => { expect(b.stats.total).toBe(0); });
    it('forge', () => { expect(b.forge('weasel_hair')).not.toBeNull(); });
    it('forge normalizes invalid type', () => { const x = b.forge('invalid'); expect(x.type).toBe('weasel_hair'); });
    it('forge normalizes invalid quality', () => { const x = b.forge('weasel_hair', 100, 100, 'invalid'); expect(x.quality).toBe('normal'); });
    it('get returns null for unknown', () => { expect(b.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByQuality', () => {
        b.forge('weasel_hair', 100, 100, 'normal', 'p1');
        b.forge('phoenix_feather', 200, 200, 'perfect');
        expect(b.listAll().length).toBe(2);
        expect(b.listByOwner('p1').length).toBe(1);
        expect(b.listByType('phoenix_feather').length).toBe(1);
        expect(b.listByQuality('perfect').length).toBe(1);
    });
    it('setDurability and setInkCapacity and setQuality', () => { const x = b.forge('weasel_hair'); b.setDurability(x.id, 50); b.setInkCapacity(x.id, 200); b.setQuality(x.id, 'fine'); expect(x.durability).toBe(50); expect(x.inkCapacity).toBe(200); expect(x.quality).toBe('fine'); });
    it('setDurability clamps', () => { const x = b.forge('weasel_hair', 100); b.setDurability(x.id, 200); expect(x.durability).toBe(100); });
    it('setDurability/Quality/Capacity return false for unknown', () => { expect(b.setDurability('ghost', 50)).toBe(false); expect(b.setInkCapacity('ghost', 200)).toBe(false); expect(b.setQuality('ghost', 'fine')).toBe(false); });
    it('use', () => { const x = b.forge('weasel_hair', 100, 100); expect(b.use(x.id, 20)).toBe(true); });
    it('use rejects insufficient', () => { const x = b.forge('weasel_hair', 100, 50); expect(b.use(x.id, 100)).toBe(false); });
    it('use returns false for unknown', () => { expect(b.use('ghost', 10)).toBe(false); });
    it('repair', () => { const x = b.forge('weasel_hair', 100, 50); b.repair(x.id, 30); expect(x.durability).toBe(80); });
    it('repair clamps', () => { const x = b.forge('weasel_hair', 100, 80); b.repair(x.id, 30); expect(x.durability).toBe(100); });
    it('repair returns false for unknown', () => { expect(b.repair('ghost', 30)).toBe(false); });
    it('isPerfect and isBroken', () => { const x = b.forge('weasel_hair', 100, 0); expect(b.isBroken(x.id)).toBe(true); const y = b.forge('weasel_hair', 100, 100, 'perfect'); expect(b.isPerfect(y.id)).toBe(true); });
    it('durabilityOf and capacityOf and qualityOf for unknown', () => { expect(b.durabilityOf('ghost')).toBe(0); expect(b.capacityOf('ghost')).toBe(0); expect(b.qualityOf('ghost')).toBeNull(); });
    it('averageDurability', () => { b.forge('weasel_hair', 100, 50); expect(b.averageDurability()).toBe(50); });
    it('ownerCount and bestDurability', () => { b.forge('weasel_hair', 100, 50, 'normal', 'p1'); expect(b.ownerCount('p1')).toBe(1); expect(b.bestDurability()).not.toBeNull(); });
    it('ownerCount for unknown', () => { expect(b.ownerCount('ghost')).toBe(0); });
    it('report aggregates', () => { b.forge('weasel_hair'); expect(b.report().total).toBe(1); });
    it('reset clears', () => { b.forge('weasel_hair'); b.reset(); expect(b.stats.total).toBe(0); });
    it('exposes BRUSH_TYPES', () => { expect(BRUSH_TYPES).toContain('weasel_hair'); });
});
