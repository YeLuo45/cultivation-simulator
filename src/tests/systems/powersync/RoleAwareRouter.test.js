/**
 * RoleAwareRouter.test.js - 角色路由测试
 * V1181 Round 44 Iter 24/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    RoleAwareRouter,
    ROLES,
    ROLE_HIERARCHY,
} from '../../../systems/powersync/RoleAwareRouter.js';

describe('RoleAwareRouter', () => {
    let r;
    beforeEach(() => { r = new RoleAwareRouter(); });

    describe('exports', () => {
        it('ROLES includes read/write/admin', () => {
            expect(ROLES).toContain('read');
            expect(ROLES).toContain('write');
            expect(ROLES).toContain('admin');
        });
        it('ROLE_HIERARCHY ordered', () => {
            expect(ROLE_HIERARCHY.read).toBe(0);
            expect(ROLE_HIERARCHY.write).toBeGreaterThan(ROLE_HIERARCHY.read);
            expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.write);
        });
    });

    describe('constructor', () => {
        it('initializes route buckets', () => {
            expect(r.routes.size).toBe(3);
            for (const role of ROLES) expect(r.routes.get(role).size).toBe(0);
        });
        it('starts with no audit', () => {
            expect(r.getAuditLog().length).toBe(0);
        });
    });

    describe('register / unregister', () => {
        it('register valid', () => {
            expect(r.register('read', '/foo', () => 'x')).toBe(true);
            expect(r.hasRoute('read', '/foo')).toBe(true);
        });
        it('register invalid role', () => {
            expect(r.register('xx', '/foo', () => 'x')).toBe(false);
        });
        it('register invalid path', () => {
            expect(r.register('read', '', () => 'x')).toBe(false);
        });
        it('register invalid handler', () => {
            expect(r.register('read', '/foo', 'not-fn')).toBe(false);
        });
        it('unregister removes', () => {
            r.register('read', '/foo', () => 'x');
            expect(r.unregister('read', '/foo')).toBe(true);
            expect(r.hasRoute('read', '/foo')).toBe(false);
        });
        it('unregister non-existent', () => {
            expect(r.unregister('read', '/foo')).toBe(false);
        });
        it('listRoutes returns all roles', () => {
            r.register('read', '/a', () => 1);
            r.register('write', '/b', () => 2);
            const all = r.listRoutes();
            expect(all.read).toContain('/a');
            expect(all.write).toContain('/b');
        });
        it('listRoutes filters by role', () => {
            r.register('read', '/a', () => 1);
            expect(r.listRoutes('read')).toEqual(['/a']);
        });
    });

    describe('canAccess', () => {
        it('read can access read', () => {
            r.register('read', '/a', () => 1);
            expect(r.canAccess('read', '/a')).toBe(true);
        });
        it('write can access write', () => {
            r.register('write', '/b', () => 1);
            expect(r.canAccess('write', '/b')).toBe(true);
        });
        it('admin can access everything', () => {
            r.register('read', '/a', () => 1);
            r.register('write', '/b', () => 1);
            expect(r.canAccess('admin', '/a')).toBe(true);
            expect(r.canAccess('admin', '/b')).toBe(true);
            expect(r.canAccess('admin', '/anything')).toBe(true);
        });
        it('read cannot access write', () => {
            r.register('write', '/b', () => 1);
            expect(r.canAccess('read', '/b')).toBe(false);
        });
        it('write can access read paths', () => {
            r.register('read', '/a', () => 1);
            expect(r.canAccess('write', '/a')).toBe(true);
        });
        it('write cannot access admin paths', () => {
            r.register('admin', '/x', () => 1);
            expect(r.canAccess('write', '/x')).toBe(false);
        });
        it('rejects unknown role', () => {
            expect(r.canAccess('xx', '/a')).toBe(false);
        });
    });

    describe('route', () => {
        it('routes read request', () => {
            r.register('read', '/foo', (p) => `read:${p}`);
            const res = r.route({ role: 'read', path: '/foo', payload: 'x' });
            expect(res.allowed).toBe(true);
            expect(res.result).toBe('read:x');
        });
        it('routes write request', () => {
            r.register('write', '/bar', (p) => `w:${p}`);
            const res = r.route({ role: 'write', path: '/bar', payload: 'q' });
            expect(res.allowed).toBe(true);
            expect(res.result).toBe('w:q');
        });
        it('admin can hit any registered path', () => {
            r.register('read', '/foo', () => 'r');
            r.register('write', '/bar', () => 'w');
            expect(r.route({ role: 'admin', path: '/foo', payload: null }).allowed).toBe(true);
            expect(r.route({ role: 'admin', path: '/bar', payload: null }).allowed).toBe(true);
        });
        it('write falls through to read handler', () => {
            r.register('read', '/r', (p) => `R(${p})`);
            const res = r.route({ role: 'write', path: '/r', payload: 'p' });
            expect(res.allowed).toBe(true);
            expect(res.resolvedRole).toBe('read');
        });
        it('denies unregistered path', () => {
            const res = r.route({ role: 'read', path: '/nope', payload: null });
            expect(res.allowed).toBe(false);
        });
        it('denies invalid role', () => {
            const res = r.route({ role: 'xx', path: '/foo', payload: null });
            expect(res.allowed).toBe(false);
        });
        it('denies invalid path', () => {
            const res = r.route({ role: 'read', path: '', payload: null });
            expect(res.allowed).toBe(false);
        });
        it('handles handler errors', () => {
            r.register('read', '/boom', () => { throw new Error('nope'); });
            const res = r.route({ role: 'read', path: '/boom', payload: null });
            expect(res.allowed).toBe(false);
            expect(res.reason).toBe('handler_error');
        });
        it('increments stats', () => {
            r.register('read', '/foo', () => 'x');
            r.route({ role: 'read', path: '/foo', payload: null });
            r.route({ role: 'read', path: '/nope', payload: null });
            const s = r.getStats();
            expect(s.requests).toBe(2);
            expect(s.allowed).toBe(1);
            expect(s.denied).toBe(1);
        });
    });

    describe('audit', () => {
        it('logs allowed requests', () => {
            r.register('read', '/foo', () => 'x');
            r.route({ role: 'read', path: '/foo', payload: null });
            const log = r.getAuditLog();
            expect(log.length).toBe(1);
            expect(log[0].allowed).toBe(true);
        });
        it('logs denied requests', () => {
            r.route({ role: 'read', path: '/nope', payload: null });
            const log = r.getAuditLog();
            expect(log[0].allowed).toBe(false);
        });
        it('auditHook called on route', () => {
            let captured = null;
            r.setAuditHook((e) => { captured = e; });
            r.register('read', '/foo', () => 'x');
            r.route({ role: 'read', path: '/foo', payload: null });
            expect(captured.allowed).toBe(true);
        });
        it('auditHook called on deny', () => {
            let captured = null;
            r.setAuditHook((e) => { captured = e; });
            r.route({ role: 'read', path: '/nope', payload: null });
            expect(captured.allowed).toBe(false);
        });
        it('hook errors swallowed', () => {
            r.setAuditHook(() => { throw new Error('x'); });
            r.register('read', '/foo', () => 'x');
            expect(() => r.route({ role: 'read', path: '/foo', payload: null })).not.toThrow();
        });
        it('clearAudit empties', () => {
            r.register('read', '/foo', () => 'x');
            r.route({ role: 'read', path: '/foo', payload: null });
            const n = r.clearAudit();
            expect(n).toBe(1);
            expect(r.getAuditLog().length).toBe(0);
        });
    });

    describe('hooks / interceptors', () => {
        it('beforeHook transforms request', () => {
            r.register('read', '/foo', (p) => p);
            r.setBeforeHook((req) => ({ ...req, path: '/foo' }));
            const res = r.route({ role: 'read', path: '/wrong', payload: 'p' });
            expect(res.allowed).toBe(true);
        });
        it('afterHook transforms result', () => {
            r.register('read', '/foo', () => 'a');
            r.setAfterHook((res) => res + '!');
            const res = r.route({ role: 'read', path: '/foo', payload: null });
            expect(res.result).toBe('a!');
        });
    });

    describe('deny', () => {
        it('deny returns entry', () => {
            const e = r.deny({ role: 'read', path: '/x' }, 'test');
            expect(e.allowed).toBe(false);
            expect(e.reason).toBe('test');
        });
        it('deny default reason', () => {
            const e = r.deny({});
            expect(e.reason).toBe('denied');
        });
    });

    describe('clear / stats', () => {
        it('clear resets', () => {
            r.register('read', '/foo', () => 'x');
            r.route({ role: 'read', path: '/foo', payload: null });
            r.clear();
            expect(r.getStats().auditLog).toBe(0);
            expect(r.hasRoute('read', '/foo')).toBe(false);
        });
        it('getStats includes route count', () => {
            r.register('read', '/a', () => 1);
            r.register('write', '/b', () => 1);
            const s = r.getStats();
            expect(s.routes).toBe(2);
        });
    });

    describe('hooks (event-style)', () => {
        it('emits routed', () => {
            let captured = null;
            r.registerHook('routed', (e) => { captured = e; });
            r.register('read', '/foo', () => 'x');
            r.route({ role: 'read', path: '/foo', payload: null });
            expect(captured.allowed).toBe(true);
        });
        it('emits denied', () => {
            let captured = null;
            r.registerHook('denied', (e) => { captured = e; });
            r.route({ role: 'read', path: '/nope', payload: null });
            expect(captured.allowed).toBe(false);
        });
        it('emits registered', () => {
            let n = 0;
            r.registerHook('registered', () => n++);
            r.register('read', '/foo', () => 'x');
            expect(n).toBe(1);
        });
    });
});
