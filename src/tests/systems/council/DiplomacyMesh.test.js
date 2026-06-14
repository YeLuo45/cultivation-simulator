import { describe, it, expect, beforeEach } from 'vitest';
import { DiplomacyMesh, RELATION_STATUS } from '../../../systems/council/DiplomacyMesh.js';

describe('DiplomacyMesh', () => {
    let m;
    beforeEach(() => { m = new DiplomacyMesh(); });
    it('initializes with defaults', () => { expect(m.stats.relations).toBe(0); });
    it('addSect', () => { expect(m.addSect('s1', 'Sect1')).toBe(true); });
    it('addSect rejects missing', () => { expect(m.addSect('', 'n')).toBe(false); });
    it('getSect for unknown returns null', () => { expect(m.getSect('ghost')).toBeNull(); });
    it('listSects', () => { m.addSect('s1', 'S1'); expect(m.listSects().length).toBe(1); });
    it('setRelation', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        expect(m.setRelation('s1', 's2', 'friendly')).toBe(true);
    });
    it('setRelation rejects invalid', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        expect(m.setRelation('s1', 's2', 'invalid')).toBe(false);
    });
    it('setRelation rejects unknown sect', () => { expect(m.setRelation('ghost', 's2', 'friendly')).toBe(false); });
    it('getRelation', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        m.setRelation('s1', 's2', 'allied');
        expect(m.getRelation('s1', 's2').status).toBe('allied');
    });
    it('statusOf default neutral', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        expect(m.statusOf('s1', 's2')).toBe('neutral');
    });
    it('isAllied/isHostile/isFriendly', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        m.setRelation('s1', 's2', 'allied');
        expect(m.isAllied('s1', 's2')).toBe(true);
    });
    it('isHostile', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        m.setRelation('s1', 's2', 'hostile');
        expect(m.isHostile('s1', 's2')).toBe(true);
    });
    it('isFriendly for friendly', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        m.setRelation('s1', 's2', 'friendly');
        expect(m.isFriendly('s1', 's2')).toBe(true);
    });
    it('alliesOf and enemiesOf', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        m.addSect('s3', 'S3');
        m.setRelation('s1', 's2', 'allied');
        m.setRelation('s1', 's3', 'hostile');
        expect(m.alliesOf('s1')).toContain('s2');
        expect(m.enemiesOf('s1')).toContain('s3');
    });
    it('distance same is 0', () => {
        m.addSect('s1', 'S1');
        expect(m.distance('s1', 's1')).toBe(0);
    });
    it('distance disconnected is -1', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        expect(m.distance('s1', 's2')).toBe(-1);
    });
    it('distance via friend', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        m.addSect('s3', 'S3');
        m.setRelation('s1', 's2', 'friendly');
        m.setRelation('s2', 's3', 'allied');
        expect(m.distance('s1', 's3')).toBe(2);
    });
    it('historyOf', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        m.setRelation('s1', 's2', 'allied');
        expect(m.historyOf('s1', 's2').length).toBe(1);
    });
    it('listAll', () => {
        m.addSect('s1', 'S1');
        m.addSect('s2', 'S2');
        m.setRelation('s1', 's2', 'friendly');
        expect(m.listAll().length).toBe(1);
    });
    it('report aggregates', () => { m.addSect('s1', 'S1'); expect(m.report().totalSects).toBe(1); });
    it('reset clears', () => { m.addSect('s1', 'S1'); m.reset(); expect(m.sects.size).toBe(0); });
    it('exposes RELATION_STATUS', () => { expect(RELATION_STATUS).toContain('allied'); });
});
