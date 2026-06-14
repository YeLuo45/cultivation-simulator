import { describe, it, expect, beforeEach } from 'vitest';
import { InkRefinery, INK_TYPES } from '../../../systems/fulu/InkRefinery.js';

describe('InkRefinery', () => {
    let i;
    beforeEach(() => { i = new InkRefinery(); });
    it('initializes with defaults', () => { expect(i.stats.total).toBe(0); });
    it('refine', () => { expect(i.refine('cinnabar')).not.toBeNull(); });
    it('refine normalizes invalid type', () => { const x = i.refine('invalid'); expect(x.type).toBe('cinnabar'); });
    it('refine normalizes invalid grade', () => { const x = i.refine('cinnabar', 'invalid'); expect(x.grade).toBe('normal'); });
    it('get returns null for unknown', () => { expect(i.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByGrade and listTranscendent', () => {
        i.refine('cinnabar', 'normal', 1, 0, 'p1');
        i.refine('gold', 'transcendent', 50, 100, 'p1');
        i.refine('jade', 'transcendent', 50);
        expect(i.listAll().length).toBe(3);
        expect(i.listByOwner('p1').length).toBe(2);
        expect(i.listByType('cinnabar').length).toBe(1);
        expect(i.listByGrade('transcendent').length).toBe(2);
        expect(i.listTranscendent().length).toBe(2);
    });
    it('setPotency', () => { const x = i.refine('cinnabar'); i.setPotency(x.id, 100); expect(i.potencyOf(x.id)).toBe(100); });
    it('setPotency clamps', () => { const x = i.refine('cinnabar'); i.setPotency(x.id, -5); expect(i.potencyOf(x.id)).toBe(0); });
    it('setPotency returns false for unknown', () => { expect(i.setPotency('ghost', 100)).toBe(false); });
    it('setMana and setGrade', () => { const x = i.refine('cinnabar'); i.setMana(x.id, 50); i.setGrade(x.id, 'pure'); expect(x.mana).toBe(50); expect(x.grade).toBe('pure'); });
    it('setGrade rejects invalid', () => { const x = i.refine('cinnabar'); expect(i.setGrade(x.id, 'invalid')).toBe(false); });
    it('setMana and setGrade return false for unknown', () => { expect(i.setMana('ghost', 50)).toBe(false); expect(i.setGrade('ghost', 'pure')).toBe(false); });
    it('isTranscendent and isPure', () => { const x = i.refine('cinnabar', 'transcendent'); expect(i.isTranscendent(x.id)).toBe(true); expect(i.isPure(x.id)).toBe(true); });
    it('isTranscendent for unknown', () => { expect(i.isTranscendent('ghost')).toBe(false); });
    it('potencyOf and manaOf and typeOf and gradeOf for unknown', () => { expect(i.potencyOf('ghost')).toBe(0); expect(i.manaOf('ghost')).toBe(0); expect(i.typeOf('ghost')).toBeNull(); expect(i.gradeOf('ghost')).toBeNull(); });
    it('averagePotency', () => { i.refine('cinnabar', 'normal', 5); expect(i.averagePotency()).toBe(5); });
    it('ownerCount and bestPotency', () => { i.refine('cinnabar', 'normal', 1, 0, 'p1'); expect(i.ownerCount('p1')).toBe(1); expect(i.bestPotency()).not.toBeNull(); });
    it('ownerCount for unknown', () => { expect(i.ownerCount('ghost')).toBe(0); });
    it('bestPotency null for empty', () => { expect(i.bestPotency()).toBeNull(); });
    it('countByType', () => { i.refine('cinnabar'); expect(i.countByType().cinnabar).toBe(1); });
    it('report aggregates', () => { i.refine('cinnabar'); expect(i.report().total).toBe(1); });
    it('reset clears', () => { i.refine('cinnabar'); i.reset(); expect(i.stats.total).toBe(0); });
    it('exposes INK_TYPES', () => { expect(INK_TYPES).toContain('cinnabar'); });
});
