import { describe, it, expect, beforeEach } from 'vitest';
import { CrucibleForge, CRUCIBLE_STATUS } from '../../../systems/alchemy/CrucibleForge.js';

describe('CrucibleForge', () => {
    let f;
    beforeEach(() => { f = new CrucibleForge(); });
    it('initializes with defaults', () => { expect(f.stats.total).toBe(0); });
    it('create', () => { expect(f.create('My Crucible', 'copper')).not.toBeNull(); });
    it('create rejects missing', () => { expect(f.create('', 'copper')).toBeNull(); });
    it('create normalizes invalid metal', () => { const x = f.create('A', 'invalid'); expect(x.metal).toBe('copper'); });
    it('get returns null for unknown', () => { expect(f.get('ghost')).toBeNull(); });
    it('listAll and listByMetal and listByStatus', () => {
        f.create('A', 'copper');
        f.create('B', 'jade');
        expect(f.listAll().length).toBe(2);
        expect(f.listByMetal('jade').length).toBe(1);
        expect(f.listByStatus('empty').length).toBe(2);
    });
    it('load and unload', () => {
        const x = f.create('A', 'copper');
        expect(f.load(x.id, 'item1')).toBe(true);
        expect(f.unload(x.id).length).toBe(1);
    });
    it('load returns false for full', () => {
        const x = f.create('A', 'copper', 1);
        f.load(x.id, 'a');
        expect(f.load(x.id, 'b')).toBe(false);
    });
    it('load returns false for sealed', () => {
        const x = f.create('A', 'copper');
        f.load(x.id, 'a');
        f.seal(x.id);
        expect(f.load(x.id, 'b')).toBe(false);
    });
    it('load returns false for broken', () => {
        const x = f.create('A', 'copper');
        f.breakCrucible(x.id);
        expect(f.load(x.id, 'a')).toBe(false);
    });
    it('load returns false for unknown', () => { expect(f.load('ghost', 'a')).toBe(false); });
    it('unload returns null for unknown', () => { expect(f.unload('ghost')).toBeNull(); });
    it('seal and unseal', () => {
        const x = f.create('A', 'copper');
        f.load(x.id, 'a');
        expect(f.seal(x.id)).toBe(true);
        expect(f.unseal(x.id)).toBe(true);
    });
    it('seal rejects empty', () => { const x = f.create('A', 'copper'); expect(f.seal(x.id)).toBe(false); });
    it('seal returns false for unknown', () => { expect(f.seal('ghost')).toBe(false); });
    it('unseal rejects not sealed', () => { const x = f.create('A', 'copper'); expect(f.unseal(x.id)).toBe(false); });
    it('unseal returns false for unknown', () => { expect(f.unseal('ghost')).toBe(false); });
    it('forge', () => {
        const x = f.create('A', 'copper');
        f.load(x.id, 'a');
        f.seal(x.id);
        expect(f.forge(x.id)).not.toBeNull();
    });
    it('forge returns null for not sealed', () => {
        const x = f.create('A', 'copper');
        f.load(x.id, 'a');
        expect(f.forge(x.id)).toBeNull();
    });
    it('forge returns null for unknown', () => { expect(f.forge('ghost')).toBeNull(); });
    it('breakCrucible', () => { const x = f.create('A', 'copper'); expect(f.breakCrucible(x.id)).toBe(true); });
    it('breakCrucible returns false for unknown', () => { expect(f.breakCrucible('ghost')).toBe(false); });
    it('isEmpty and isReady and contentCount', () => {
        const x = f.create('A', 'copper');
        expect(f.isEmpty(x.id)).toBe(true);
        f.load(x.id, 'a');
        f.seal(x.id);
        expect(f.isReady(x.id)).toBe(true);
        expect(f.contentCount(x.id)).toBe(1);
    });
    it('isEmpty for unknown', () => { expect(f.isEmpty('ghost')).toBe(true); });
    it('report aggregates', () => { f.create('A', 'copper'); expect(f.report().total).toBe(1); });
    it('reset clears', () => { f.create('A', 'copper'); f.reset(); expect(f.stats.total).toBe(0); });
    it('exposes CRUCIBLE_STATUS', () => { expect(CRUCIBLE_STATUS).toContain('empty'); });
});
