/**
 * CultivationMCPAdminTools.js - 修真 MCP 管理员工具集
 * V864 P-20260613-002 Iteration 6/30 Round 35 - Direction F: Admin Tools
 *
 * 提供 5 类管理员操作：force / grant / reset / broadcast / debug
 * - 核心 API: registerAll / forceBreakthrough / grantSkill / resetPlayer / broadcast / debugInspect
 * - 数据结构: { name, handler, schema, permission: 'admin', requiresAuth: true, dangerous: true }
 * - 配置: ADMIN_TOOLS
 */

import { CultivationMCPServer } from './CultivationMCPServer.js';
import { ParamSpec } from './CultivationMCPSchema.js';

export const ADMIN_TOOLS = {
    'admin.force.breakthrough': {
        description: '强制玩家突破境界',
        permission: 'admin',
        requiresAuth: true,
        dangerous: true,
        rateLimit: { perMinute: 5, perHour: 20 },
    },
    'admin.grant.skill': {
        description: '授予玩家技能',
        permission: 'admin',
        requiresAuth: true,
        dangerous: true,
        rateLimit: { perMinute: 10, perHour: 50 },
    },
    'admin.reset.player': {
        description: '重置玩家数据',
        permission: 'admin',
        requiresAuth: true,
        dangerous: true,
        rateLimit: { perMinute: 1, perHour: 5 },
    },
    'admin.broadcast': {
        description: '广播系统消息给所有玩家',
        permission: 'admin',
        requiresAuth: true,
        dangerous: true,
        rateLimit: { perMinute: 5, perHour: 30 },
    },
    'admin.debug.inspect': {
        description: '调试：检查游戏内部状态',
        permission: 'admin',
        requiresAuth: true,
        dangerous: false,
        rateLimit: { perMinute: 60, perHour: 1000 },
    },
};

/**
 * RateLimiter - 速率限制器
 */
class RateLimiter {
    constructor(limits = {}) {
        this.limits = limits;
        this.history = new Map();
    }

    check(key, limitConfig) {
        if (!limitConfig) return { allowed: true };
        const now = Date.now();
        const window = this.history.get(key) || { minute: [], hour: [] };
        window.minute = window.minute.filter(t => now - t < 60_000);
        window.hour = window.hour.filter(t => now - t < 3_600_000);
        if (limitConfig.perMinute && window.minute.length >= limitConfig.perMinute) {
            return { allowed: false, reason: 'RATE_LIMIT_MINUTE', retryAfter: 60_000 - (now - window.minute[0]) };
        }
        if (limitConfig.perHour && window.hour.length >= limitConfig.perHour) {
            return { allowed: false, reason: 'RATE_LIMIT_HOUR', retryAfter: 3_600_000 - (now - window.hour[0]) };
        }
        window.minute.push(now);
        window.hour.push(now);
        this.history.set(key, window);
        return { allowed: true };
    }

    clear(key) { this.history.delete(key); }
    clearAll() { this.history.clear(); }
}

/**
 * AdminToolset - 管理员工具集合
 */
export class AdminToolset {
    constructor({ dataStore = null, auditLog = null, permissionControl = null } = {}) {
        this.dataStore = dataStore || {
            players: new Map(),
            skills: new Map(),
            broadcasts: new Map(),
            debugSnapshots: new Map(),
        };
        this.auditLog = auditLog || [];
        this.permissionControl = permissionControl; // 由 PermissionControl 模块注入
        this.rateLimiter = new RateLimiter();
        this.stats = {
            totalAdminCalls: 0,
            successfulAdminCalls: 0,
            rejectedByRateLimit: 0,
            rejectedByPermission: 0,
            dangerousOperations: 0,
            broadcastsSent: 0,
        };
    }

    registerAll(server) {
        this._registerForceBreakthrough(server);
        this._registerGrantSkill(server);
        this._registerResetPlayer(server);
        this._registerBroadcast(server);
        this._registerDebugInspect(server);
        return { success: true, tools: Object.keys(ADMIN_TOOLS) };
    }

    _audit(operation, params, result) {
        const entry = { operation, params, result, timestamp: Date.now(), auditId: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
        this.auditLog.push(entry);
        if (this.auditLog.length > 1000) this.auditLog.shift();
        return entry;
    }

    _checkRateLimit(operation, callerId, toolConfig) {
        return this.rateLimiter.check(`${operation}:${callerId}`, toolConfig.rateLimit);
    }

    _checkPermission(callerId, requiredPerm) {
        if (!this.permissionControl) return { allowed: true, reason: 'NO_CONTROL' };
        return this.permissionControl.check(callerId, requiredPerm);
    }

    _registerForceBreakthrough(server) {
        const handler = async ({ playerId, targetRealm, reason = '' } = {}) => {
            if (!playerId || !targetRealm) return { error: 'MISSING_PARAMS' };
            this.stats.totalAdminCalls++;
            this.stats.dangerousOperations++;

            const callerId = handler._callerId || 'anonymous';
            const permCheck = this._checkPermission(callerId, 'admin');
            if (!permCheck.allowed) {
                this.stats.rejectedByPermission++;
                this._audit('admin.force.breakthrough', { playerId, targetRealm, reason }, { error: 'PERMISSION_DENIED' });
                return { error: 'PERMISSION_DENIED', reason: permCheck.reason };
            }
            const rateCheck = this._checkRateLimit('admin.force.breakthrough', callerId, ADMIN_TOOLS['admin.force.breakthrough']);
            if (!rateCheck.allowed) {
                this.stats.rejectedByRateLimit++;
                this._audit('admin.force.breakthrough', { playerId, targetRealm }, { error: rateCheck.reason });
                return { error: rateCheck.reason, retryAfter: rateCheck.retryAfter };
            }

            const player = this.dataStore.players.get(playerId);
            if (!player) { this.stats.rejectedByPermission++; return { error: 'PLAYER_NOT_FOUND' }; }

            const previousRealm = player.realm || 'mortal';
            player.realm = targetRealm;
            player.breakthroughAt = Date.now();
            player.breakthroughReason = reason;

            this.stats.successfulAdminCalls++;
            const r = { playerId, previousRealm, newRealm: targetRealm, reason, forcedBy: callerId, timestamp: Date.now() };
            this._audit('admin.force.breakthrough', { playerId, targetRealm, reason }, { success: true, ...r });
            return r;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('admin.force.breakthrough', handler, { description: ADMIN_TOOLS['admin.force.breakthrough'].description, permission: 'admin' });
        }
        return handler;
    }

    _registerGrantSkill(server) {
        const handler = async ({ playerId, skillId, skillLevel = 1 } = {}) => {
            if (!playerId || !skillId) return { error: 'MISSING_PARAMS' };
            this.stats.totalAdminCalls++;
            this.stats.dangerousOperations++;

            const callerId = handler._callerId || 'anonymous';
            const permCheck = this._checkPermission(callerId, 'admin');
            if (!permCheck.allowed) {
                this.stats.rejectedByPermission++;
                return { error: 'PERMISSION_DENIED' };
            }
            const rateCheck = this._checkRateLimit('admin.grant.skill', callerId, ADMIN_TOOLS['admin.grant.skill']);
            if (!rateCheck.allowed) {
                this.stats.rejectedByRateLimit++;
                return { error: rateCheck.reason, retryAfter: rateCheck.retryAfter };
            }

            const player = this.dataStore.players.get(playerId);
            if (!player) return { error: 'PLAYER_NOT_FOUND' };
            if (!player.skills) player.skills = [];
            const existing = player.skills.find(s => s.skillId === skillId);
            if (existing) {
                existing.level = Math.max(existing.level, skillLevel);
            } else {
                player.skills.push({ skillId, level: skillLevel, grantedAt: Date.now() });
            }
            this.stats.successfulAdminCalls++;
            const r = { playerId, skillId, level: skillLevel, grantedBy: callerId, totalSkills: player.skills.length };
            this._audit('admin.grant.skill', { playerId, skillId, skillLevel }, { success: true, ...r });
            return r;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('admin.grant.skill', handler, { description: ADMIN_TOOLS['admin.grant.skill'].description, permission: 'admin' });
        }
        return handler;
    }

    _registerResetPlayer(server) {
        const handler = async ({ playerId, fields = ['all'] } = {}) => {
            if (!playerId) return { error: 'MISSING_PLAYER_ID' };
            this.stats.totalAdminCalls++;
            this.stats.dangerousOperations++;

            const callerId = handler._callerId || 'anonymous';
            const permCheck = this._checkPermission(callerId, 'admin');
            if (!permCheck.allowed) {
                this.stats.rejectedByPermission++;
                this._audit('admin.reset.player', { playerId, fields }, { error: 'PERMISSION_DENIED' });
                return { error: 'PERMISSION_DENIED' };
            }
            const rateCheck = this._checkRateLimit('admin.reset.player', callerId, ADMIN_TOOLS['admin.reset.player']);
            if (!rateCheck.allowed) {
                this.stats.rejectedByRateLimit++;
                return { error: rateCheck.reason, retryAfter: rateCheck.retryAfter };
            }

            const player = this.dataStore.players.get(playerId);
            if (!player) return { error: 'PLAYER_NOT_FOUND' };
            const previousState = JSON.parse(JSON.stringify(player));
            const resetFields = fields.includes('all') ? Object.keys(player) : fields;
            for (const field of resetFields) {
                if (field === 'playerId') continue;
                delete player[field];
            }
            this.stats.successfulAdminCalls++;
            const r = { playerId, resetFields, previousState, resetBy: callerId, timestamp: Date.now() };
            this._audit('admin.reset.player', { playerId, fields }, { success: true, ...r });
            return r;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('admin.reset.player', handler, { description: ADMIN_TOOLS['admin.reset.player'].description, permission: 'admin' });
        }
        return handler;
    }

    _registerBroadcast(server) {
        const handler = async ({ message, audience = 'all', priority = 'normal' } = {}) => {
            if (!message) return { error: 'MISSING_MESSAGE' };
            this.stats.totalAdminCalls++;
            this.stats.dangerousOperations++;

            const callerId = handler._callerId || 'anonymous';
            const permCheck = this._checkPermission(callerId, 'admin');
            if (!permCheck.allowed) {
                this.stats.rejectedByPermission++;
                return { error: 'PERMISSION_DENIED' };
            }
            const rateCheck = this._checkRateLimit('admin.broadcast', callerId, ADMIN_TOOLS['admin.broadcast']);
            if (!rateCheck.allowed) {
                this.stats.rejectedByRateLimit++;
                return { error: rateCheck.reason, retryAfter: rateCheck.retryAfter };
            }

            const broadcast = { broadcastId: `bc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, message, audience, priority, sentBy: callerId, sentAt: Date.now() };
            this.dataStore.broadcasts.set(broadcast.broadcastId, broadcast);
            this.stats.successfulAdminCalls++;
            this.stats.broadcastsSent++;
            this._audit('admin.broadcast', { message, audience, priority }, { success: true, broadcastId: broadcast.broadcastId });
            return broadcast;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('admin.broadcast', handler, { description: ADMIN_TOOLS['admin.broadcast'].description, permission: 'admin' });
        }
        return handler;
    }

    _registerDebugInspect(server) {
        const handler = async ({ path = 'root', depth = 1 } = {}) => {
            this.stats.totalAdminCalls++;
            const callerId = handler._callerId || 'anonymous';
            const permCheck = this._checkPermission(callerId, 'admin');
            if (!permCheck.allowed) {
                this.stats.rejectedByPermission++;
                return { error: 'PERMISSION_DENIED' };
            }

            const snapshot = {
                snapshotId: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                path, depth,
                timestamp: Date.now(),
                dataStoreSummary: this._summarizeDataStore(),
                stats: { ...this.stats },
                auditLogLength: this.auditLog.length,
            };
            this.dataStore.debugSnapshots.set(snapshot.snapshotId, snapshot);
            this.stats.successfulAdminCalls++;
            return snapshot;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('admin.debug.inspect', handler, { description: ADMIN_TOOLS['admin.debug.inspect'].description, permission: 'admin' });
        }
        return handler;
    }

    _summarizeDataStore() {
        const summary = {};
        for (const [k, v] of Object.entries(this.dataStore)) {
            summary[k] = v instanceof Map ? v.size : (Array.isArray(v) ? v.length : typeof v);
        }
        return summary;
    }

    setPermissionControl(pc) { this.permissionControl = pc; return { success: true }; }
    getAuditLog() { return [...this.auditLog]; }
    clearAuditLog() { this.auditLog = []; return { success: true }; }
    getStats() { return { ...this.stats, auditLogLength: this.auditLog.length, rateLimitKeys: this.rateLimiter.history.size }; }
    seedTestData() {
        this.dataStore.players.set('p_001', { playerId: 'p_001', name: '李青云', realm: '筑基', skills: [] });
        return { success: true };
    }
    toJSON() { return { stats: this.stats, auditLog: this.auditLog.slice(-50) }; }
    fromJSON(data) { if (data.stats) this.stats = { ...this.stats, ...data.stats }; return { success: true }; }
}

export default AdminToolset;
