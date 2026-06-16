import { describe, it, expect, beforeEach } from 'vitest';
import { DecreesAnnouncer, DECREE_TYPES } from '../../../systems/council/DecreesAnnouncer.js';

describe('DecreesAnnouncer', () => {
    let a;
    beforeEach(() => { a = new DecreesAnnouncer(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('issue creates decree', () => {
        const x = a.issue('Title', 'sect', 'content');
        expect(x).not.toBeNull();
    });
    it('issue rejects missing fields', () => {
        expect(a.issue('', 'sect', 'c')).toBeNull();
        expect(a.issue('t', '', 'c')).toBeNull();
    });
    it('issue normalizes invalid type', () => {
        const x = a.issue('t', 'invalid', 'c');
        expect(x.type).toBe('sect');
    });
    it('issue normalizes invalid format', () => {
        const x = a.issue('t', 'sect', 'c', 'invalid');
        expect(x.format).toBe('scroll');
    });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll', () => { a.issue('t', 'sect', 'c'); expect(a.listAll().length).toBe(1); });
    it('listByType', () => {
        a.issue('t1', 'royal', 'c');
        a.issue('t2', 'sect', 'c');
        expect(a.listByType('royal').length).toBe(1);
    });
    it('listForRecipient', () => {
        a.issue('t', 'sect', 'c', 'scroll', ['m1']);
        expect(a.listForRecipient('m1').length).toBe(1);
    });
    it('markRead and isReadBy', () => {
        const x = a.issue('t', 'sect', 'c');
        a.markRead(x.id, 'm1');
        expect(a.isReadBy(x.id, 'm1')).toBe(true);
    });
    it('isReadBy false for unknown', () => { expect(a.isReadBy('ghost', 'm1')).toBe(false); });
    it('readRatio', () => {
        const x = a.issue('t', 'sect', 'c', 'scroll', ['m1', 'm2']);
        a.markRead(x.id, 'm1');
        expect(a.readRatio(x.id)).toBe(0.5);
    });
    it('revoke and archive', () => {
        const x = a.issue('t', 'sect', 'c');
        expect(a.revoke(x.id, 'test')).toBe(true);
        expect(a.archive(x.id)).toBe(true);
    });
    it('revoke returns false for unknown', () => { expect(a.revoke('ghost')).toBe(false); });
    it('searchByTitle', () => {
        a.issue('First Title', 'sect', 'c');
        a.issue('Second Title', 'sect', 'c');
        expect(a.searchByTitle('First').length).toBe(1);
    });
    it('recent', () => {
        a.issue('t1', 'sect', 'c');
        a.issue('t2', 'sect', 'c');
        expect(a.recent().length).toBe(2);
    });
    it('report aggregates', () => { a.issue('t', 'sect', 'c'); expect(a.report().total).toBe(1); });
    it('reset clears', () => { a.issue('t', 'sect', 'c'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes DECREE_TYPES', () => { expect(DECREE_TYPES).toContain('sect'); });
});
