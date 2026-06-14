import { describe, it, expect, beforeEach } from 'vitest';
import { FactionDynamics, FACTION_STATUS } from '../../../systems/council/FactionDynamics.js';

describe('FactionDynamics', () => {
    let f;
    beforeEach(() => { f = new FactionDynamics(); });
    it('initializes with defaults', () => { expect(f.stats.total).toBe(0); });
    it('create forms faction', () => { expect(f.create('F1', 'peaceful', 'm1')).not.toBeNull(); });
    it('create rejects missing', () => { expect(f.create('', 'i', 'm1')).toBeNull(); });
    it('get returns null for unknown', () => { expect(f.get('ghost')).toBeNull(); });
    it('listAll', () => { f.create('F1'); expect(f.listAll().length).toBe(1); });
    it('listByStatus', () => { f.create('F1'); expect(f.listByStatus('forming').length).toBe(1); });
    it('activate', () => { const x = f.create('F1'); expect(f.activate(x.id)).toBe(true); });
    it('activate fails for non-forming', () => { const x = f.create('F1'); f.activate(x.id); expect(f.activate(x.id)).toBe(false); });
    it('dissolve', () => { const x = f.create('F1'); expect(f.dissolve(x.id)).toBe(true); });
    it('dissolve returns false for unknown', () => { expect(f.dissolve('ghost')).toBe(false); });
    it('merge', () => {
        const a = f.create('F1');
        const b = f.create('F2');
        expect(f.merge(a.id, b.id)).toBe(true);
    });
    it('merge fails for unknown', () => {
        const a = f.create('F1');
        expect(f.merge(a.id, 'ghost')).toBe(false);
    });
    it('setRival', () => {
        const a = f.create('F1');
        const b = f.create('F2');
        expect(f.setRival(a.id, b.id)).toBe(true);
    });
    it('clearRival', () => {
        const a = f.create('F1');
        const b = f.create('F2');
        f.setRival(a.id, b.id);
        expect(f.clearRival(a.id)).toBe(true);
    });
    it('join and leave', () => {
        const x = f.create('F1', 'i', 'm1');
        expect(f.join(x.id, 'm2')).toBe(true);
    });
    it('leave removes membership', () => {
        const x = f.create('F1', 'i', 'm1');
        f.leave('m1');
        expect(f.factionOf('m1')).toBeNull();
    });
    it('factionOf for unknown returns null', () => { expect(f.factionOf('ghost')).toBeNull(); });
    it('isInFaction', () => {
        f.create('F1', 'i', 'm1');
        expect(f.isInFaction('m1')).toBe(true);
    });
    it('membersOf and sizeOf', () => {
        const x = f.create('F1', 'i', 'm1');
        f.join(x.id, 'm2');
        expect(f.membersOf(x.id).length).toBe(2);
        expect(f.sizeOf(x.id)).toBe(2);
    });
    it('rivalOf and areRivals', () => {
        const a = f.create('F1');
        const b = f.create('F2');
        f.setRival(a.id, b.id);
        expect(f.areRivals(a.id, b.id)).toBe(true);
    });
    it('report aggregates', () => { f.create('F1'); expect(f.report().total).toBe(1); });
    it('reset clears', () => { f.create('F1'); f.reset(); expect(f.stats.total).toBe(0); });
    it('exposes FACTION_STATUS', () => { expect(FACTION_STATUS).toContain('active'); });
});
