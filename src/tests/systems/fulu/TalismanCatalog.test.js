import { describe, it, expect, beforeEach } from 'vitest';
import { TalismanCatalog, CATALOG_KINDS } from '../../../systems/fulu/TalismanCatalog.js';

describe('TalismanCatalog', () => {
    let c;
    beforeEach(() => { c = new TalismanCatalog(); });
    it('initializes with defaults', () => { expect(c.stats.total).toBe(0); });
    it('addEntry', () => { expect(c.addEntry('A1', 'combat')).not.toBeNull(); });
    it('addEntry rejects missing', () => { expect(c.addEntry('', 'combat')).toBeNull(); });
    it('addEntry normalizes invalid kind', () => { const x = c.addEntry('A1', 'invalid'); expect(x.kind).toBe('combat'); });
    it('addEntry normalizes invalid status', () => { const x = c.addEntry('A1', 'combat', 'common', 1, 'invalid'); expect(x.status).toBe('active'); });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('listAll and listByKind and listByStatus and listBySchool and listLegendary', () => {
        c.addEntry('A1', 'combat', 'common', 1);
        c.addEntry('B1', 'ritual', 'immortal', 100, 'legendary');
        expect(c.listAll().length).toBe(2);
        expect(c.listByKind('combat').length).toBe(1);
        expect(c.listByStatus('legendary').length).toBe(1);
        expect(c.listBySchool('common').length).toBe(1);
        expect(c.listLegendary().length).toBe(1);
    });
    it('setPower', () => { const x = c.addEntry('A1', 'combat'); c.setPower(x.id, 100); expect(c.powerOf(x.id)).toBe(100); });
    it('setPower clamps', () => { const x = c.addEntry('A1', 'combat'); c.setPower(x.id, -5); expect(c.powerOf(x.id)).toBe(0); });
    it('setPower returns false for unknown', () => { expect(c.setPower('ghost', 100)).toBe(false); });
    it('setStatus', () => { const x = c.addEntry('A1', 'combat'); c.setStatus(x.id, 'legendary'); expect(x.status).toBe('legendary'); });
    it('setStatus rejects invalid', () => { const x = c.addEntry('A1', 'combat'); expect(c.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(c.setStatus('ghost', 'legendary')).toBe(false); });
    it('isLegendary', () => { const x = c.addEntry('A1', 'combat', 'immortal', 1, 'legendary'); expect(c.isLegendary(x.id)).toBe(true); });
    it('isLegendary for unknown', () => { expect(c.isLegendary('ghost')).toBe(false); });
    it('powerOf and kindOf and schoolOf for unknown', () => { expect(c.powerOf('ghost')).toBe(0); expect(c.kindOf('ghost')).toBeNull(); expect(c.schoolOf('ghost')).toBeNull(); });
    it('averagePower', () => { c.addEntry('A1', 'combat', 'common', 50); expect(c.averagePower()).toBe(50); });
    it('bestPower', () => { c.addEntry('A1', 'combat', 'common', 50); c.addEntry('B1', 'combat', 'common', 100); expect(c.bestPower().power).toBe(100); });
    it('bestPower null for empty', () => { expect(c.bestPower()).toBeNull(); });
    it('countByKind', () => { c.addEntry('A1', 'combat'); expect(c.countByKind().combat).toBe(1); });
    it('report aggregates', () => { c.addEntry('A1', 'combat'); expect(c.report().total).toBe(1); });
    it('reset clears', () => { c.addEntry('A1', 'combat'); c.reset(); expect(c.stats.total).toBe(0); });
    it('exposes CATALOG_KINDS', () => { expect(CATALOG_KINDS).toContain('combat'); });
});
