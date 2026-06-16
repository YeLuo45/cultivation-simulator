/**
 * AuditLog.test.js - 审计日志测试
 * V1176 Round 44 Iter 19/30
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLog, AUDIT_ORDERS } from '../../../systems/powersync/AuditLog.js';

describe('AuditLog', () => {
    let al;
    beforeEach(() => { al = new AuditLog({ maxSize: 100 }); });

    describe('exports', () => {
        it('should export AUDIT_ORDERS', () => {
            expect(AUDIT_ORDERS).toContain('asc');
            expect(AUDIT_ORDERS).toContain('desc');
        });
    });

    describe('constructor', () => {
        it('should default maxSize 10000', () => {
            const x = new AuditLog();
            expect(x.maxSize).toBe(10000);
        });
        it('should accept custom maxSize', () => {
            expect(al.maxSize).toBe(100);
        });
        it('should start empty', () => {
            expect(al.size).toBe(0);
        });
    });

    describe('append', () => {
        it('should append and return id', () => {
            const id = al.append('login', 'alice', 'session:1');
            expect(typeof id).toBe('string');
            expect(al.size).toBe(1);
        });
        it('should store entry with ts', () => {
            const id = al.append('login', 'alice', 'session:1', { ip: '127.0.0.1' });
            const e = al.getById(id);
            expect(e.action).toBe('login');
            expect(e.actor).toBe('alice');
            expect(e.target).toBe('session:1');
            expect(e.meta.ip).toBe('127.0.0.1');
            expect(typeof e.ts).toBe('number');
        });
        it('should coerce actor/target to string', () => {
            const id = al.append('act', 42, 99);
            const e = al.getById(id);
            expect(e.actor).toBe('42');
            expect(e.target).toBe('99');
        });
        it('should clone meta to prevent mutation', () => {
            const meta = { tag: 'a' };
            const id = al.append('act', 'a', 'b', meta);
            meta.tag = 'changed';
            expect(al.getById(id).meta.tag).toBe('a');
        });
        it('should default meta to {}', () => {
            const id = al.append('act', 'a', 'b');
            expect(al.getById(id).meta).toEqual({});
        });
        it('should throw on empty action', () => {
            expect(() => al.append('', 'a', 'b')).toThrow();
        });
        it('should throw on non-string action', () => {
            expect(() => al.append(null, 'a', 'b')).toThrow();
        });
        it('should increment appended stat', () => {
            al.append('a', 'x', 'y');
            al.append('b', 'x', 'y');
            expect(al.stats.appended).toBe(2);
        });
    });

    describe('rolling window', () => {
        it('should drop oldest when exceeding maxSize', () => {
            const small = new AuditLog({ maxSize: 3 });
            const id1 = small.append('a', 'x', 'y');
            small.append('b', 'x', 'y');
            small.append('c', 'x', 'y');
            small.append('d', 'x', 'y');
            expect(small.size).toBe(3);
            expect(small.getById(id1)).toBeNull();
        });
        it('should track dropped stat', () => {
            const small = new AuditLog({ maxSize: 2 });
            small.append('a', 'x', 'y');
            small.append('b', 'x', 'y');
            small.append('c', 'x', 'y');
            expect(small.stats.dropped).toBe(1);
        });
        it('should keep newest after rolling', () => {
            const small = new AuditLog({ maxSize: 2 });
            small.append('first', 'x', 'y');
            const lastId = small.append('last', 'x', 'y');
            small.append('extra', 'x', 'y');
            expect(small.getById(lastId).action).toBe('last');
        });
    });

    describe('query', () => {
        beforeEach(() => {
            al.append('login', 'alice', 'session:1');
            al.append('login', 'bob', 'session:2');
            al.append('logout', 'alice', 'session:1');
        });
        it('should return all when no filter', () => {
            expect(al.query().length).toBe(3);
        });
        it('should filter by actor', () => {
            const r = al.query({ actor: 'alice' });
            expect(r.length).toBe(2);
        });
        it('should filter by target', () => {
            const r = al.query({ target: 'session:1' });
            expect(r.length).toBe(2);
        });
        it('should filter by action', () => {
            const r = al.query({ action: 'login' });
            expect(r.length).toBe(2);
        });
        it('should filter by combined actor+action', () => {
            const r = al.query({ actor: 'alice', action: 'login' });
            expect(r.length).toBe(1);
        });
        it('should filter by since', () => {
            const before = al.list({ limit: 1, order: 'asc' })[0];
            const r = al.query({ since: before.ts });
            expect(r.length).toBe(3);
        });
        it('should filter by until', () => {
            const last = al.list({ limit: 1, order: 'desc' })[0];
            const r = al.query({ until: last.ts });
            expect(r.length).toBe(3);
        });
        it('should return empty for no match', () => {
            expect(al.query({ actor: 'nobody' }).length).toBe(0);
        });
        it('should increment queried stat', () => {
            al.query({ actor: 'alice' });
            expect(al.stats.queried).toBe(1);
        });
    });

    describe('getById', () => {
        it('should return entry by id', () => {
            const id = al.append('a', 'x', 'y');
            expect(al.getById(id).action).toBe('a');
        });
        it('should return null for unknown', () => {
            expect(al.getById('nope')).toBeNull();
        });
    });

    describe('list', () => {
        beforeEach(() => {
            al.append('a', 'x', 'y');
            al.append('b', 'x', 'y');
            al.append('c', 'x', 'y');
        });
        it('should return up to limit', () => {
            expect(al.list({ limit: 2 }).length).toBe(2);
        });
        it('should support offset', () => {
            const r1 = al.list({ limit: 1, offset: 0 });
            const r2 = al.list({ limit: 1, offset: 1 });
            expect(r1[0].action).not.toBe(r2[0].action);
        });
        it('should return in desc order by default', () => {
            const r = al.list();
            expect(r[0].action).toBe('c');
            expect(r[2].action).toBe('a');
        });
        it('should support asc order', () => {
            const r = al.list({ order: 'asc' });
            expect(r[0].action).toBe('a');
            expect(r[2].action).toBe('c');
        });
        it('should throw on invalid order', () => {
            expect(() => al.list({ order: 'sideways' })).toThrow();
        });
        it('should default limit 100', () => {
            const big = new AuditLog({ maxSize: 200 });
            for (let i = 0; i < 150; i++) big.append('a', 'x', 'y');
            expect(big.list().length).toBe(100);
        });
    });

    describe('size', () => {
        it('should grow with appends', () => {
            al.append('a', 'x', 'y');
            al.append('b', 'x', 'y');
            expect(al.size).toBe(2);
        });
        it('should reset to 0 after clear', () => {
            al.append('a', 'x', 'y');
            al.clear();
            expect(al.size).toBe(0);
        });
    });

    describe('clear', () => {
        it('should clear all entries', () => {
            al.append('a', 'x', 'y');
            al.append('b', 'x', 'y');
            al.clear();
            expect(al.size).toBe(0);
        });
        it('should return count cleared', () => {
            al.append('a', 'x', 'y');
            al.append('b', 'x', 'y');
            expect(al.clear()).toBe(2);
        });
    });

    describe('hooks', () => {
        it('should emit appended', () => {
            let captured = null;
            al.registerHook('appended', (e) => { captured = e; });
            al.append('a', 'x', 'y');
            expect(captured.action).toBe('a');
        });
        it('should emit queried', () => {
            let captured = null;
            al.registerHook('queried', (e) => { captured = e; });
            al.append('a', 'x', 'y');
            al.query({ actor: 'x' });
            expect(captured.count).toBe(1);
        });
        it('should emit cleared', () => {
            let captured = null;
            al.registerHook('cleared', (e) => { captured = e; });
            al.append('a', 'x', 'y');
            al.clear();
            expect(captured.count).toBe(1);
        });
        it('should swallow hook errors', () => {
            al.registerHook('appended', () => { throw new Error('x'); });
            expect(() => al.append('a', 'x', 'y')).not.toThrow();
        });
    });

    describe('getStats', () => {
        it('should include all counters', () => {
            al.append('a', 'x', 'y');
            al.query();
            const s = al.getStats();
            expect(s.appended).toBe(1);
            expect(s.queried).toBe(1);
            expect(s.size).toBe(1);
            expect(s.maxSize).toBe(100);
        });
    });
});
