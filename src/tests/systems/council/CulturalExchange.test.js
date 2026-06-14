import { describe, it, expect, beforeEach } from 'vitest';
import { CulturalExchange, EXCHANGE_TYPES } from '../../../systems/council/CulturalExchange.js';

describe('CulturalExchange', () => {
    let e;
    beforeEach(() => { e = new CulturalExchange(); });
    it('initializes with defaults', () => { expect(e.stats.total).toBe(0); });
    it('transfer creates flow', () => { expect(e.transfer('s1', 's2', 'technique', 'c', 5)).not.toBeNull(); });
    it('transfer rejects missing', () => { expect(e.transfer('', 's2', 'technique', 'c', 5)).toBeNull(); });
    it('transfer rejects invalid type', () => { expect(e.transfer('s1', 's2', 'invalid', 'c', 5)).toBeNull(); });
    it('transfer rejects non-positive', () => { expect(e.transfer('s1', 's2', 'technique', 'c', 0)).toBeNull(); });
    it('get returns null for unknown', () => { expect(e.get('ghost')).toBeNull(); });
    it('listAll', () => { e.transfer('s1', 's2', 'technique', 'c', 5); expect(e.listAll().length).toBe(1); });
    it('listByParty', () => {
        e.transfer('s1', 's2', 'technique', 'c', 5);
        e.transfer('s2', 's1', 'lore', 'c', 3);
        expect(e.listByParty('s1').length).toBe(2);
    });
    it('listByType', () => {
        e.transfer('s1', 's2', 'technique', 'c', 5);
        e.transfer('s1', 's2', 'lore', 'c', 3);
        expect(e.listByType('technique').length).toBe(1);
    });
    it('listFromTo', () => {
        e.transfer('s1', 's2', 'technique', 'c', 5);
        expect(e.listFromTo('s1', 's2').length).toBe(1);
    });
    it('inflow and outflow', () => {
        e.transfer('s1', 's2', 'technique', 'c', 5);
        e.transfer('s2', 's1', 'lore', 'c', 3);
        expect(e.inflow('s2')).toBe(5);
        expect(e.outflow('s2')).toBe(3);
    });
    it('netFlow', () => {
        e.transfer('s1', 's2', 'technique', 'c', 5);
        e.transfer('s2', 's1', 'lore', 'c', 3);
        expect(e.netFlow('s2')).toBe(2);
    });
    it('influenceBalance', () => {
        e.transfer('s1', 's2', 'technique', 'c', 10);
        expect(e.influenceBalance('s2')).toBe(1);
    });
    it('topInfluencers', () => {
        e.transfer('s1', 's2', 'technique', 'c', 5);
        e.transfer('s3', 's2', 'lore', 'c', 10);
        expect(e.topInfluencers()[0][0]).toBe('s2');
    });
    it('isInfluencer', () => {
        e.transfer('s1', 's2', 'technique', 'c', 100);
        expect(e.isInfluencer('s2', 50)).toBe(true);
    });
    it('cultureMix', () => {
        e.transfer('s1', 's2', 'technique', 'c', 5);
        e.transfer('s3', 's2', 'lore', 'c', 3);
        const r = e.cultureMix('s2');
        expect(r.technique).toBe(5);
    });
    it('report aggregates', () => { e.transfer('s1', 's2', 'technique', 'c', 5); expect(e.report().total).toBe(1); });
    it('reset clears', () => { e.transfer('s1', 's2', 'technique', 'c', 5); e.reset(); expect(e.stats.total).toBe(0); });
    it('exposes EXCHANGE_TYPES', () => { expect(EXCHANGE_TYPES).toContain('technique'); });
});
