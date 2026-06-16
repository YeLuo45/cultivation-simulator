import { describe, it, expect, beforeEach } from 'vitest';
import { ArtifactForge, ARTIFACT_TYPES } from '../../../systems/shenzhu/ArtifactForge.js';

describe('ArtifactForge', () => {
    let f;
    beforeEach(() => { f = new ArtifactForge(); });
    it('initializes with defaults', () => { expect(f.stats.total).toBe(0); });
    it('forge', () => { expect(f.forge('A', 'sword')).not.toBeNull(); });
    it('forge rejects missing', () => { expect(f.forge('', 'sword')).toBeNull(); });
    it('forge normalizes invalid type', () => { const x = f.forge('A', 'invalid'); expect(x.type).toBe('sword'); });
    it('forge normalizes invalid rarity', () => { const x = f.forge('A', 'sword', 'invalid'); expect(x.rarity).toBe('common'); });
    it('get returns null for unknown', () => { expect(f.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByRarity and listDivine', () => {
        f.forge('A', 'sword', 'common', 1, 'p1');
        f.forge('B', 'staff', 'divine', 100);
        expect(f.listAll().length).toBe(2);
        expect(f.listByOwner('p1').length).toBe(1);
        expect(f.listByType('sword').length).toBe(1);
        expect(f.listByRarity('divine').length).toBe(1);
        expect(f.listDivine().length).toBe(1);
    });
    it('setPower', () => { const x = f.forge('A', 'sword'); f.setPower(x.id, 100); expect(f.powerOf(x.id)).toBe(100); });
    it('setPower clamps', () => { const x = f.forge('A', 'sword'); f.setPower(x.id, -1); expect(f.powerOf(x.id)).toBe(0); });
    it('setPower returns false for unknown', () => { expect(f.setPower('ghost', 100)).toBe(false); });
    it('setOwner', () => { const x = f.forge('A', 'sword'); expect(f.setOwner(x.id, 'B')).toBe(true); });
    it('setOwner returns false for unknown', () => { expect(f.setOwner('ghost', 'B')).toBe(false); });
    it('isDivine and isChaos', () => { const x = f.forge('A', 'sword', 'chaos'); expect(f.isDivine(x.id)).toBe(true); expect(f.isChaos(x.id)).toBe(true); });
    it('isDivine for unknown', () => { expect(f.isDivine('ghost')).toBe(false); });
    it('powerOf and typeOf and rarityOf and ownerOf for unknown', () => { expect(f.powerOf('ghost')).toBe(0); expect(f.typeOf('ghost')).toBeNull(); expect(f.rarityOf('ghost')).toBeNull(); expect(f.ownerOf('ghost')).toBeNull(); });
    it('averagePower', () => { f.forge('A', 'sword', 'common', 50); expect(f.averagePower()).toBe(50); });
    it('bestPower', () => { f.forge('A', 'sword', 'common', 50); expect(f.bestPower().power).toBe(50); });
    it('bestPower null for empty', () => { expect(f.bestPower()).toBeNull(); });
    it('ownerCount', () => { f.forge('A', 'sword', 'common', 1, 'p1'); expect(f.ownerCount('p1')).toBe(1); });
    it('ownerCount for unknown', () => { expect(f.ownerCount('ghost')).toBe(0); });
    it('countByRarity', () => { f.forge('A', 'sword', 'legendary'); expect(f.countByRarity().legendary).toBe(1); });
    it('report aggregates', () => { f.forge('A', 'sword'); expect(f.report().total).toBe(1); });
    it('reset clears', () => { f.forge('A', 'sword'); f.reset(); expect(f.stats.total).toBe(0); });
    it('exposes ARTIFACT_TYPES', () => { expect(ARTIFACT_TYPES).toContain('sword'); });
});
