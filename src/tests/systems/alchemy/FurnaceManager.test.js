import { describe, it, expect, beforeEach } from 'vitest';
import { FurnaceManager, FURNACE_STATUS } from '../../../systems/alchemy/FurnaceManager.js';

describe('FurnaceManager', () => {
    let m;
    beforeEach(() => { m = new FurnaceManager(); });
    it('initializes with defaults', () => { expect(m.stats.total).toBe(0); });
    it('addFurnace', () => { expect(m.addFurnace('My Furnace', 'basic')).not.toBeNull(); });
    it('addFurnace rejects missing', () => { expect(m.addFurnace('', 'basic')).toBeNull(); });
    it('addFurnace normalizes invalid type', () => { const x = m.addFurnace('A', 'invalid'); expect(x.type).toBe('basic'); });
    it('addFurnace sets max temp by type', () => {
        expect(m.addFurnace('A', 'divine').maxTemp).toBe(1600);
        expect(m.addFurnace('B', 'basic').maxTemp).toBe(100);
    });
    it('get returns null for unknown', () => { expect(m.get('ghost')).toBeNull(); });
    it('listAll and listByStatus and listByType', () => {
        m.addFurnace('A', 'basic');
        m.addFurnace('B', 'gold');
        expect(m.listAll().length).toBe(2);
        expect(m.listByType('gold').length).toBe(1);
        expect(m.listByStatus('idle').length).toBe(2);
    });
    it('listAvailable', () => { m.addFurnace('A', 'basic'); expect(m.listAvailable().length).toBe(1); });
    it('setStatus', () => { const x = m.addFurnace('A', 'basic'); expect(m.setStatus(x.id, 'heating')).toBe(true); });
    it('setStatus rejects invalid', () => { const x = m.addFurnace('A', 'basic'); expect(m.setStatus(x.id, 'invalid')).toBe(false); });
    it('setStatus returns false for unknown', () => { expect(m.setStatus('ghost', 'heating')).toBe(false); });
    it('setDurability', () => { const x = m.addFurnace('A', 'basic'); m.setDurability(x.id, 50); expect(m.get(x.id).durability).toBe(50); });
    it('setDurability clamps', () => { const x = m.addFurnace('A', 'basic'); m.setDurability(x.id, 200); expect(m.get(x.id).durability).toBe(100); });
    it('setDurability returns false for unknown', () => { expect(m.setDurability('ghost', 50)).toBe(false); });
    it('damage', () => { const x = m.addFurnace('A', 'basic'); expect(m.damage(x.id, 50)).toBe(true); });
    it('damage sets maintenance when broken', () => { const x = m.addFurnace('A', 'basic'); m.damage(x.id, 100); expect(m.get(x.id).status).toBe('maintenance'); });
    it('damage returns false for unknown', () => { expect(m.damage('ghost', 10)).toBe(false); });
    it('repair', () => { const x = m.addFurnace('A', 'basic'); m.damage(x.id, 50); m.repair(x.id, 30); expect(m.get(x.id).durability).toBe(80); });
    it('repair sets idle', () => { const x = m.addFurnace('A', 'basic'); m.damage(x.id, 100); m.repair(x.id, 30); expect(m.get(x.id).status).toBe('idle'); });
    it('repair returns false for unknown', () => { expect(m.repair('ghost', 10)).toBe(false); });
    it('isUsable and isBroken', () => { const x = m.addFurnace('A', 'basic'); expect(m.isUsable(x.id)).toBe(true); m.damage(x.id, 100); expect(m.isBroken(x.id)).toBe(true); });
    it('isUsable for unknown', () => { expect(m.isUsable('ghost')).toBe(false); });
    it('averageDurability', () => { m.addFurnace('A', 'basic'); expect(m.averageDurability()).toBe(100); });
    it('best', () => { m.addFurnace('A', 'basic'); expect(m.best().name).toBe('A'); });
    it('best for empty', () => { expect(m.best()).toBeNull(); });
    it('report aggregates', () => { m.addFurnace('A', 'basic'); expect(m.report().total).toBe(1); });
    it('reset clears', () => { m.addFurnace('A', 'basic'); m.reset(); expect(m.stats.total).toBe(0); });
    it('exposes FURNACE_STATUS', () => { expect(FURNACE_STATUS).toContain('idle'); });
});
