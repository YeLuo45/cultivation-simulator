import { describe, it, expect, beforeEach } from 'vitest';
import { ArenaSelector, ARENA_TYPES } from '../../../systems/arena/ArenaSelector.js';

describe('ArenaSelector', () => {
    let a;
    beforeEach(() => { a = new ArenaSelector(); });
    it('initializes with defaults', () => { expect(a.stats.total).toBe(0); });
    it('addArena creates arena', () => { expect(a.addArena('Colosseum', 'plain')).not.toBeNull(); });
    it('addArena rejects missing', () => { expect(a.addArena('', 'plain')).toBeNull(); });
    it('addArena rejects invalid type', () => { expect(a.addArena('A', 'invalid')).toBeNull(); });
    it('get returns null for unknown', () => { expect(a.get('ghost')).toBeNull(); });
    it('listAll', () => { a.addArena('A1', 'plain'); expect(a.listAll().length).toBe(1); });
    it('listByType', () => {
        a.addArena('A1', 'plain');
        a.addArena('A2', 'forest');
        expect(a.listByType('forest').length).toBe(1);
    });
    it('listByStatus', () => {
        a.addArena('A1', 'plain');
        expect(a.listByStatus('available').length).toBe(1);
    });
    it('setStatus rejects invalid', () => { expect(a.setStatus('ghost', 'occupied')).toBe(false); expect(a.addArena('A', 'plain') && a.setStatus(a.listAll()[0].id, 'invalid')).toBe(false); });
    it('setStatus changes', () => {
        const x = a.addArena('A', 'plain');
        expect(a.setStatus(x.id, 'maintenance')).toBe(true);
    });
    it('setBonus', () => {
        const x = a.addArena('A', 'plain');
        expect(a.setBonus(x.id, 'fire', 10)).toBe(true);
    });
    it('setBonus returns false for unknown', () => { expect(a.setBonus('ghost', 'fire', 10)).toBe(false); });
    it('book arena', () => {
        const x = a.addArena('A', 'plain');
        expect(a.book(x.id, 'm1')).toBe(true);
    });
    it('book rejects occupied', () => {
        const x = a.addArena('A', 'plain');
        a.book(x.id, 'm1');
        expect(a.book(x.id, 'm2')).toBe(false);
    });
    it('book returns false for unknown', () => { expect(a.book('ghost', 'm1')).toBe(false); });
    it('release arena', () => {
        const x = a.addArena('A', 'plain');
        a.book(x.id, 'm1');
        expect(a.release(x.id, 'm1')).toBe(true);
    });
    it('bookingHistory and isBooked', () => {
        const x = a.addArena('A', 'plain');
        a.book(x.id, 'm1');
        expect(a.bookingHistory(x.id).length).toBe(1);
        expect(a.isBooked(x.id)).toBe(true);
    });
    it('select with type', () => {
        a.addArena('A1', 'plain');
        a.addArena('A2', 'forest');
        expect(a.select({ type: 'forest' }).type).toBe('forest');
    });
    it('select without type', () => {
        a.addArena('A1', 'plain');
        expect(a.select()).not.toBeNull();
    });
    it('select with no available', () => { expect(a.select()).toBeNull(); });
    it('isElementStrong', () => {
        const x = a.addArena('A', 'volcano');
        expect(a.isElementStrong(x.id, 'fire')).toBe(true);
    });
    it('isElementStrong false for low bonus', () => {
        const x = a.addArena('A', 'plain');
        expect(a.isElementStrong(x.id, 'fire')).toBe(false);
    });
    it('countByType', () => {
        a.addArena('A1', 'plain');
        a.addArena('A2', 'plain');
        expect(a.countByType().plain).toBe(2);
    });
    it('report aggregates', () => { a.addArena('A', 'plain'); expect(a.report_().total).toBe(1); });
    it('reset clears', () => { a.addArena('A', 'plain'); a.reset(); expect(a.stats.total).toBe(0); });
    it('exposes ARENA_TYPES', () => { expect(ARENA_TYPES).toContain('plain'); });
});
