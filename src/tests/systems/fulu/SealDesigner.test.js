import { describe, it, expect, beforeEach } from 'vitest';
import { SealDesigner, SEAL_TYPES } from '../../../systems/fulu/SealDesigner.js';

describe('SealDesigner', () => {
    let d;
    beforeEach(() => { d = new SealDesigner(); });
    it('initializes with defaults', () => { expect(d.stats.total).toBe(0); });
    it('design', () => { expect(d.design('A', 'binding')).not.toBeNull(); });
    it('design rejects missing', () => { expect(d.design('', 'binding')).toBeNull(); });
    it('design normalizes invalid type', () => { const x = d.design('A', 'invalid'); expect(x.type).toBe('binding'); });
    it('design normalizes invalid level', () => { const x = d.design('A', 'binding', 'invalid'); expect(x.level).toBe('low'); });
    it('get returns null for unknown', () => { expect(d.get('ghost')).toBeNull(); });
    it('listAll and listByOwner and listByType and listByLevel and listUltimate', () => {
        d.design('A', 'binding', 'low', 1, 'p1');
        d.design('B', 'sealing', 'ultimate', 100);
        expect(d.listAll().length).toBe(2);
        expect(d.listByOwner('p1').length).toBe(1);
        expect(d.listByType('binding').length).toBe(1);
        expect(d.listByLevel('ultimate').length).toBe(1);
        expect(d.listUltimate().length).toBe(1);
    });
    it('setLevel and setPower and setOwner', () => { const x = d.design('A', 'binding'); d.setLevel(x.id, 'top'); d.setPower(x.id, 50); d.setOwner(x.id, 'p2'); expect(x.level).toBe('top'); expect(x.power).toBe(50); expect(x.owner).toBe('p2'); });
    it('setLevel rejects invalid', () => { const x = d.design('A', 'binding'); expect(d.setLevel(x.id, 'invalid')).toBe(false); });
    it('setLevel/Power/Owner return false for unknown', () => { expect(d.setLevel('ghost', 'top')).toBe(false); expect(d.setPower('ghost', 50)).toBe(false); expect(d.setOwner('ghost', 'p2')).toBe(false); });
    it('isUltimate and isTop', () => { const x = d.design('A', 'binding', 'ultimate'); expect(d.isUltimate(x.id)).toBe(true); expect(d.isTop(x.id)).toBe(true); const y = d.design('B', 'sealing', 'top'); expect(d.isTop(y.id)).toBe(true); expect(d.isUltimate(y.id)).toBe(false); });
    it('isUltimate for unknown', () => { expect(d.isUltimate('ghost')).toBe(false); });
    it('powerOf and levelOf and typeOf and ownerOf for unknown', () => { expect(d.powerOf('ghost')).toBe(0); expect(d.levelOf('ghost')).toBeNull(); expect(d.typeOf('ghost')).toBeNull(); expect(d.ownerOf('ghost')).toBeNull(); });
    it('averagePower', () => { d.design('A', 'binding', 'low', 50); expect(d.averagePower()).toBe(50); });
    it('ownerCount and bestPower', () => { d.design('A', 'binding', 'low', 1, 'p1'); expect(d.ownerCount('p1')).toBe(1); expect(d.bestPower()).not.toBeNull(); });
    it('ownerCount for unknown', () => { expect(d.ownerCount('ghost')).toBe(0); });
    it('bestPower null for empty', () => { expect(d.bestPower()).toBeNull(); });
    it('countByType', () => { d.design('A', 'binding'); expect(d.countByType().binding).toBe(1); });
    it('report aggregates', () => { d.design('A', 'binding'); expect(d.report().total).toBe(1); });
    it('reset clears', () => { d.design('A', 'binding'); d.reset(); expect(d.stats.total).toBe(0); });
    it('exposes SEAL_TYPES', () => { expect(SEAL_TYPES).toContain('binding'); });
});
