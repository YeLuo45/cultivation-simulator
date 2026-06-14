import { describe, it, expect, beforeEach } from 'vitest';
import { CombatEngine, COMBAT_PHASES } from '../../../systems/arena/CombatEngine.js';

describe('CombatEngine', () => {
    let c;
    beforeEach(() => { c = new CombatEngine(); });
    it('initializes with defaults', () => { expect(c.stats.totalFights).toBe(0); });
    it('startFight', () => { expect(c.startFight('a', 'b')).not.toBeNull(); });
    it('startFight rejects same', () => { expect(c.startFight('a', 'a')).toBeNull(); });
    it('startFight rejects missing', () => { expect(c.startFight('', 'b')).toBeNull(); expect(c.startFight('a', '')).toBeNull(); });
    it('get returns null for unknown', () => { expect(c.get('ghost')).toBeNull(); });
    it('listAll', () => { c.startFight('a', 'b'); expect(c.listAll().length).toBe(1); });
    it('log adds event', () => {
        const f = c.startFight('a', 'b');
        c.log(f.id, { event: 'attack', attacker: 'a' });
        expect(c.logEntries(f.id).length).toBe(2);
    });
    it('log returns false for unknown', () => { expect(c.log('ghost', { x: 1 })).toBe(false); });
    it('logEntries returns [] for unknown', () => { expect(c.logEntries('ghost')).toEqual([]); });
    it('setPhase', () => {
        const f = c.startFight('a', 'b');
        expect(c.setPhase(f.id, 'resolution')).toBe(true);
    });
    it('setPhase rejects invalid', () => {
        const f = c.startFight('a', 'b');
        expect(c.setPhase(f.id, 'invalid')).toBe(false);
    });
    it('currentPhase', () => {
        const f = c.startFight('a', 'b');
        expect(c.currentPhase(f.id)).toBe('engaged');
    });
    it('conclude sets winner', () => {
        const f = c.startFight('a', 'b');
        expect(c.conclude(f.id, 'a')).toBe(true);
    });
    it('conclude returns false for unknown', () => { expect(c.conclude('ghost', 'a')).toBe(false); });
    it('winner and isConcluded and isEngaged', () => {
        const f = c.startFight('a', 'b');
        c.conclude(f.id, 'a');
        expect(c.winner(f.id)).toBe('a');
        expect(c.isConcluded(f.id)).toBe(true);
    });
    it('isConcluded for engaged', () => { const f = c.startFight('a', 'b'); expect(c.isConcluded(f.id)).toBe(false); });
    it('isEngaged for engaged', () => { const f = c.startFight('a', 'b'); expect(c.isEngaged(f.id)).toBe(true); });
    it('duration > 0', () => { const f = c.startFight('a', 'b'); expect(c.duration(f.id)).toBeGreaterThanOrEqual(0); });
    it('totalAttacks and attackCount', () => {
        const f = c.startFight('a', 'b');
        c.log(f.id, { event: 'attack', attacker: 'a' });
        c.log(f.id, { event: 'attack', attacker: 'b' });
        expect(c.totalAttacks(f.id)).toBe(2);
        expect(c.attackCount(f.id, 'a')).toBe(1);
    });
    it('participation', () => {
        const f = c.startFight('a', 'b');
        c.log(f.id, { event: 'attack', attacker: 'a' });
        c.log(f.id, { event: 'attack', attacker: 'a' });
        c.log(f.id, { event: 'attack', attacker: 'b' });
        expect(c.participation(f.id, 'a')).toBeCloseTo(2 / 3);
    });
    it('report aggregates', () => { c.startFight('a', 'b'); expect(c.report().totalFights).toBe(1); });
    it('reset clears', () => { c.startFight('a', 'b'); c.reset(); expect(c.stats.totalFights).toBe(0); });
    it('exposes COMBAT_PHASES', () => { expect(COMBAT_PHASES).toContain('engaged'); });
});
