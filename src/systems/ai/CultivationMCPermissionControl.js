/**
 * CultivationMCPermissionControl.js - 修真 MCP 三档鉴权系统
 * V865 P-20260613-002 Iteration 7/30 Round 35 - Direction F: PermissionControl
 *
 * 三档权限（read/write/admin）+ 角色继承 + 令牌签发
 * - 核心 API: issueToken / check / revoke / listTokens / assignRole
 * - 数据结构: { callerId, roles, tokens, permissions, auditLog }
 * - 配置: PERMISSION_LEVELS, DEFAULT_ROLES
 */

export const PERMISSION_LEVELS = {
    READ: 1,
    WRITE: 2,
    ADMIN: 3,
};

export const PERMISSION_NAMES = {
    1: 'read',
    2: 'write',
    3: 'admin',
};

export const DEFAULT_ROLES = {
    guest: { permissions: ['read'], inherits: [] },
    player: { permissions: ['read', 'write'], inherits: ['guest'] },
    moderator: { permissions: ['read', 'write', 'moderate'], inherits: ['player'] },
    admin: { permissions: ['read', 'write', 'admin', 'moderate'], inherits: ['moderator'] },
    owner: { permissions: ['*'], inherits: ['admin'] },
};

/**
 * Token - 认证令牌
 */
class Token {
    constructor({ callerId, tokenId, permissions, expiresAt, metadata = {} }) {
        this.tokenId = tokenId || `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        this.callerId = callerId;
        this.permissions = permissions;
        this.expiresAt = expiresAt || (Date.now() + 3600_000);
        this.metadata = metadata;
        this.createdAt = Date.now();
        this.lastUsedAt = null;
        this.useCount = 0;
        this.revoked = false;
    }

    isExpired() { return Date.now() > this.expiresAt; }
    hasPermission(perm) {
        if (this.revoked || this.isExpired()) return false;
        if (this.permissions.includes('*')) return true;
        return this.permissions.includes(perm);
    }
    use() { this.lastUsedAt = Date.now(); this.useCount++; }
    revoke() { this.revoked = true; }
}

/**
 * PermissionControl - 鉴权控制器
 */
export class PermissionControl {
    constructor(config = {}) {
        this.config = {
            defaultExpirationMs: config.defaultExpirationMs || 3600_000,
            enableRoleInheritance: config.enableRoleInheritance !== false,
            maxTokensPerCaller: config.maxTokensPerCaller || 10,
            ...config,
        };
        /** @type {Map<string, {permissions: string[], roles: string[], metadata: Object}>} */
        this.callers = new Map();
        /** @type {Map<string, Token>} */
        this.tokens = new Map();
        /** @type {Map<string, string[]>} */
        this.roleDefinitions = new Map();
        this.auditLog = [];
        this.stats = {
            totalChecks: 0,
            allowed: 0,
            denied: 0,
            tokensIssued: 0,
            tokensRevoked: 0,
            tokensExpired: 0,
        };
        this._loadDefaultRoles();
    }

    _loadDefaultRoles() {
        for (const [name, def] of Object.entries(DEFAULT_ROLES)) {
            this.roleDefinitions.set(name, def.permissions);
        }
    }

    defineRole(name, permissions, inherits = []) {
        this.roleDefinitions.set(name, permissions);
        for (const parent of inherits) {
            if (!this.roleDefinitions.has(parent)) {
                this.roleDefinitions.set(parent, []);
            }
        }
        return { success: true, name, permissions };
    }

    _expandRolePermissions(roleName, visited = new Set()) {
        if (visited.has(roleName)) return [];
        visited.add(roleName);
        const def = this.roleDefinitions.get(roleName);
        if (!def) return [];
        let perms = [...def];
        for (const [name, d] of this.roleDefinitions) {
            if (d.inherits && d.inherits.includes(roleName)) {
                perms = [...perms, ...this._expandRolePermissions(name, visited)];
            }
        }
        return [...new Set(perms)];
    }

    assignRole(callerId, roleName, metadata = {}) {
        if (!this.callers.has(callerId)) {
            this.callers.set(callerId, { permissions: [], roles: [], metadata: {} });
        }
        const caller = this.callers.get(callerId);
        if (!caller.roles.includes(roleName)) caller.roles.push(roleName);
        const expanded = this._expandRolePermissions(roleName);
        caller.permissions = [...new Set([...caller.permissions, ...expanded])];
        caller.metadata = { ...caller.metadata, ...metadata };
        return { success: true, callerId, role: roleName, permissions: caller.permissions };
    }

    revokeRole(callerId, roleName) {
        const caller = this.callers.get(callerId);
        if (!caller) return { success: false, error: 'CALLER_NOT_FOUND' };
        caller.roles = caller.roles.filter(r => r !== roleName);
        // 重新计算 permissions
        let perms = [];
        for (const r of caller.roles) perms = [...perms, ...this._expandRolePermissions(r)];
        caller.permissions = [...new Set(perms)];
        return { success: true, callerId, remainingRoles: caller.roles, permissions: caller.permissions };
    }

    grantDirectPermission(callerId, permission) {
        if (!this.callers.has(callerId)) {
            this.callers.set(callerId, { permissions: [], roles: [], metadata: {} });
        }
        const caller = this.callers.get(callerId);
        if (!caller.permissions.includes(permission)) caller.permissions.push(permission);
        return { success: true, callerId, permission, totalPermissions: caller.permissions.length };
    }

    revokeDirectPermission(callerId, permission) {
        const caller = this.callers.get(callerId);
        if (!caller) return { success: false, error: 'CALLER_NOT_FOUND' };
        caller.permissions = caller.permissions.filter(p => p !== permission);
        return { success: true, callerId, permission, totalPermissions: caller.permissions.length };
    }

    issueToken(callerId, options = {}) {
        const caller = this.callers.get(callerId);
        if (!caller) return { success: false, error: 'CALLER_NOT_FOUND' };
        const existingTokens = Array.from(this.tokens.values()).filter(t => t.callerId === callerId && !t.revoked && !t.isExpired());
        if (existingTokens.length >= this.config.maxTokensPerCaller) {
            return { success: false, error: 'TOO_MANY_TOKENS', limit: this.config.maxTokensPerCaller };
        }
        const expiresAt = options.expiresAt || (Date.now() + (options.durationMs || this.config.defaultExpirationMs));
        const token = new Token({ callerId, permissions: caller.permissions, expiresAt, metadata: options.metadata || {} });
        this.tokens.set(token.tokenId, token);
        this.stats.tokensIssued++;
        return { success: true, tokenId: token.tokenId, expiresAt, permissions: token.permissions };
    }

    check(callerId, requiredPermission) {
        this.stats.totalChecks++;
        const caller = this.callers.get(callerId);
        if (!caller) {
            this.stats.denied++;
            this._audit(callerId, requiredPermission, false, 'CALLER_NOT_FOUND');
            return { allowed: false, reason: 'CALLER_NOT_FOUND' };
        }
        const hasPermission = caller.permissions.includes('*') || caller.permissions.includes(requiredPermission);
        if (hasPermission) {
            this.stats.allowed++;
            this._audit(callerId, requiredPermission, true, 'OK');
            return { allowed: true, callerId, permission: requiredPermission };
        }
        this.stats.denied++;
        this._audit(callerId, requiredPermission, false, 'INSUFFICIENT_PERMISSION');
        return { allowed: false, reason: 'INSUFFICIENT_PERMISSION', callerPermissions: caller.permissions };
    }

    checkToken(tokenId, requiredPermission) {
        this.stats.totalChecks++;
        const token = this.tokens.get(tokenId);
        if (!token) { this.stats.denied++; return { allowed: false, reason: 'TOKEN_NOT_FOUND' }; }
        if (token.revoked) { this.stats.denied++; return { allowed: false, reason: 'TOKEN_REVOKED' }; }
        if (token.isExpired()) { this.stats.denied++; this.stats.tokensExpired++; return { allowed: false, reason: 'TOKEN_EXPIRED' }; }
        token.use();
        const hasPermission = token.hasPermission(requiredPermission);
        if (hasPermission) { this.stats.allowed++; return { allowed: true, tokenId, callerId: token.callerId }; }
        this.stats.denied++; return { allowed: false, reason: 'INSUFFICIENT_PERMISSION' };
    }

    revokeToken(tokenId) {
        const token = this.tokens.get(tokenId);
        if (!token) return { success: false, error: 'TOKEN_NOT_FOUND' };
        token.revoke();
        this.stats.tokensRevoked++;
        return { success: true, tokenId };
    }

    revokeAllTokensForCaller(callerId) {
        let count = 0;
        for (const token of this.tokens.values()) {
            if (token.callerId === callerId) { token.revoke(); count++; }
        }
        this.stats.tokensRevoked += count;
        return { success: true, revoked: count };
    }

    getCaller(callerId) {
        const c = this.callers.get(callerId);
        return c ? { callerId, ...c } : null;
    }
    listCallers() { return Array.from(this.callers.keys()); }
    listRoles() { return Array.from(this.roleDefinitions.keys()); }
    listTokens(callerId = null) {
        const all = Array.from(this.tokens.values());
        const filtered = callerId ? all.filter(t => t.callerId === callerId) : all;
        return filtered.map(t => ({ tokenId: t.tokenId, callerId: t.callerId, revoked: t.revoked, expired: t.isExpired(), useCount: t.useCount, permissions: t.permissions, expiresAt: t.expiresAt }));
    }

    _audit(callerId, permission, allowed, reason) {
        this.auditLog.push({ callerId, permission, allowed, reason, timestamp: Date.now() });
        if (this.auditLog.length > 1000) this.auditLog.shift();
    }
    getAuditLog() { return [...this.auditLog]; }
    clearAuditLog() { this.auditLog = []; return { success: true }; }

    getStats() {
        return {
            ...this.stats,
            callerCount: this.callers.size,
            roleCount: this.roleDefinitions.size,
            tokenCount: this.tokens.size,
            activeTokens: Array.from(this.tokens.values()).filter(t => !t.revoked && !t.isExpired()).length,
        };
    }

    toJSON() { return { config: this.config, callers: Array.from(this.callers.entries()), roles: Array.from(this.roleDefinitions.entries()), tokens: this.listTokens(), stats: this.stats }; }
    fromJSON(data) {
        if (data.callers) this.callers = new Map(data.callers);
        if (data.roles) this.roleDefinitions = new Map(data.roles);
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        return { success: true };
    }
}

export default PermissionControl;
