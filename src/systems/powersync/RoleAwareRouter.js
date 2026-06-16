/**
 * RoleAwareRouter.js - 角色路由
 * V1181 Round 44 Iter 24/30 Direction A PowerSync Federation (chatdev)
 * 灵感: chatdev role-based dispatcher - read/write/admin 三级 + 权限检查 + 审计
 */

export const ROLES = ['read', 'write', 'admin'];
export const ROLE_HIERARCHY = { read: 0, write: 1, admin: 2 };

export class RoleAwareRouter {
    constructor(config = {}) {
        this.config = { defaultDeny: true, ...config };
        this.routes = new Map(); // role -> Map<path, handler>
        this.auditLog = [];
        this.auditHook = null;     // (entry) => void
        this.beforeHook = null;    // (request) => request
        this.afterHook = null;     // (result) => result
        this.hooks = new Map();
        this.stats = { requests: 0, allowed: 0, denied: 0, errors: 0 };
        // init role buckets
        for (const r of ROLES) this.routes.set(r, new Map());
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // ---- registration ----
    register(role, path, handler) {
        if (!ROLES.includes(role)) return false;
        if (typeof path !== 'string' || path.length === 0) return false;
        if (typeof handler !== 'function') return false;
        if (!this.routes.has(role)) this.routes.set(role, new Map());
        this.routes.get(role).set(path, handler);
        this._emit('registered', { role, path });
        return true;
    }
    unregister(role, path) {
        const m = this.routes.get(role);
        if (!m) return false;
        return m.delete(path);
    }
    hasRoute(role, path) {
        const m = this.routes.get(role);
        return !!(m && m.has(path));
    }
    listRoutes(role = null) {
        if (role) {
            const m = this.routes.get(role);
            return m ? Array.from(m.keys()) : [];
        }
        const all = {};
        for (const [r, m] of this.routes.entries()) all[r] = Array.from(m.keys());
        return all;
    }

    // ---- access control ----
    canAccess(role, path) {
        if (!ROLES.includes(role)) return false;
        // admin sees everything
        if (role === 'admin') return true;
        // direct hit
        const m = this.routes.get(role);
        if (m && m.has(path)) return true;
        // write can access read paths (role escalation: write > read)
        if (role === 'write' && this.routes.get('read') && this.routes.get('read').has(path)) return true;
        // admin paths not accessible to write
        return false;
    }

    // ---- routing ----
    deny(request, reason) {
        const entry = {
            request,
            allowed: false,
            reason: reason || 'denied',
            ts: Date.now(),
        };
        this.auditLog.push(entry);
        this.stats.denied++;
        if (typeof this.auditHook === 'function') {
            try { this.auditHook(entry); } catch (_) { /* ignore */ }
        }
        this._emit('denied', entry);
        return entry;
    }

    route(request) {
        this.stats.requests++;
        if (!request || typeof request !== 'object') {
            this.stats.errors++;
            return this.deny({ role: null, path: null, payload: null }, 'invalid_request');
        }
        // before hook may rewrite the request
        let req = request;
        if (typeof this.beforeHook === 'function') {
            try { req = this.beforeHook(request) || request; } catch (_) { /* ignore */ }
        }
        const { role, path, payload } = req;
        if (!ROLES.includes(role)) {
            return this.deny(req, 'invalid_role');
        }
        if (typeof path !== 'string' || path.length === 0) {
            return this.deny(req, 'invalid_path');
        }
        if (!this.canAccess(role, path)) {
            return this.deny(req, 'no_access');
        }
        // pick the actual route bucket (admin/write/read fall-through)
        const m = this.routes.get(role);
        let handler = m && m.get(path);
        let resolvedRole = role;
        if (!handler && (role === 'write' || role === 'admin') && this.routes.get('read').has(path)) {
            handler = this.routes.get('read').get(path);
            resolvedRole = 'read';
        }
        if (!handler && role === 'admin' && this.routes.get('write').has(path)) {
            handler = this.routes.get('write').get(path);
            resolvedRole = 'write';
        }
        if (!handler) {
            return this.deny(req, 'route_not_found');
        }
        // invoke
        let result;
        try {
            result = handler(payload, { role, path, resolvedRole, request: req });
        } catch (e) {
            this.stats.errors++;
            const errEntry = {
                request: req,
                allowed: false,
                reason: 'handler_error',
                error: e.message || String(e),
                ts: Date.now(),
            };
            this.auditLog.push(errEntry);
            this._emit('error', errEntry);
            return errEntry;
        }
        if (typeof this.afterHook === 'function') {
            try { result = this.afterHook(result) || result; } catch (_) { /* ignore */ }
        }
        const allowed = {
            request: req,
            allowed: true,
            result,
            resolvedRole,
            ts: Date.now(),
        };
        this.auditLog.push(allowed);
        this.stats.allowed++;
        if (typeof this.auditHook === 'function') {
            try { this.auditHook(allowed); } catch (_) { /* ignore */ }
        }
        this._emit('routed', allowed);
        return allowed;
    }

    // ---- audit / queries ----
    getAuditLog() { return this.auditLog.slice(); }
    clearAudit() {
        const n = this.auditLog.length;
        this.auditLog = [];
        return n;
    }
    setAuditHook(fn) { this.auditHook = typeof fn === 'function' ? fn : null; }
    setBeforeHook(fn) { this.beforeHook = typeof fn === 'function' ? fn : null; }
    setAfterHook(fn) { this.afterHook = typeof fn === 'function' ? fn : null; }
    getStats() {
        return {
            ...this.stats,
            routes: Array.from(this.routes.values()).reduce((s, m) => s + m.size, 0),
            auditLog: this.auditLog.length,
        };
    }
    clear() {
        for (const r of ROLES) this.routes.get(r).clear();
        this.auditLog = [];
        this.stats = { requests: 0, allowed: 0, denied: 0, errors: 0 };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.RoleAwareRouter = RoleAwareRouter;
    globalThis.ROLES = ROLES;
    globalThis.ROLE_HIERARCHY = ROLE_HIERARCHY;
}
