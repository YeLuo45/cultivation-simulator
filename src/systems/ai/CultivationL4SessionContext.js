/**
 * CultivationL4SessionContext.js - L4 会话上下文
 * V908 P-20260613-082 Iteration 21/30 Round 35
 *
 * 修真 L0-L4 分层记忆框架 (generic-agent 五层记忆): L4 会话层
 * - 核心 API: beginSession / updateContext / endSession
 * - 数据结构: { id, sessionId, playerId, context: {key: value}, startedAt, endedAt, duration, state ('active'|'ended') }
 * - 配置: MAX_CONTEXT_KEYS (20), SESSION_STATES (2), DEFAULT_TTL (3600000ms), CONTEXT_TYPES (5)
 */

export const MAX_CONTEXT_KEYS = 20;
export const DEFAULT_TTL = 3600000; // 1 hour
export const SESSION_STATES = ['active', 'ended'];
export const SESSION_STATE_ACTIVE = 'active';
export const SESSION_STATE_ENDED = 'ended';
export const SESSION_STATE_COUNT = 2;

export const CONTEXT_TYPES = {
    conversation: { name: '会话文本', maxSize: 1024 },
    state: { name: '状态数据', maxSize: 256 },
    intent: { name: '意图标记', maxSize: 64 },
    memory: { name: '临时记忆', maxSize: 512 },
    metadata: { name: '元信息', maxSize: 128 },
};
export const CONTEXT_TYPE_KEYS = Object.keys(CONTEXT_TYPES);
export const CONTEXT_TYPE_COUNT = 5;

export const DEFAULT_MAX_SESSIONS_PER_PLAYER = 50;
export const MAX_ACTIVE_SESSIONS_PER_PLAYER = 3;

export const ERROR_CODES = {
    INVALID_PLAYER_ID: 'INVALID_PLAYER_ID',
    INVALID_SESSION_ID: 'INVALID_SESSION_ID',
    INVALID_KEY: 'INVALID_KEY',
    INVALID_VALUE: 'INVALID_VALUE',
    UNKNOWN_CONTEXT_TYPE: 'UNKNOWN_CONTEXT_TYPE',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    SESSION_ALREADY_ENDED: 'SESSION_ALREADY_ENDED',
    SESSION_ALREADY_ACTIVE: 'SESSION_ALREADY_ACTIVE',
    MAX_CONTEXT_KEYS_EXCEEDED: 'MAX_CONTEXT_KEYS_EXCEEDED',
    TOO_MANY_ACTIVE_SESSIONS: 'TOO_MANY_ACTIVE_SESSIONS',
};

export class CultivationL4SessionContext {
    constructor(config = {}) {
        this.config = {
            maxContextKeys: config.maxContextKeys !== undefined ? config.maxContextKeys : MAX_CONTEXT_KEYS,
            maxSessionsPerPlayer: config.maxSessionsPerPlayer !== undefined ? config.maxSessionsPerPlayer : DEFAULT_MAX_SESSIONS_PER_PLAYER,
            maxActiveSessionsPerPlayer: config.maxActiveSessionsPerPlayer !== undefined ? config.maxActiveSessionsPerPlayer : MAX_ACTIVE_SESSIONS_PER_PLAYER,
            defaultTtl: config.defaultTtl !== undefined ? config.defaultTtl : DEFAULT_TTL,
            autoExpire: config.autoExpire !== undefined ? config.autoExpire : false,
            ...config,
        };
        this.sessions = new Map();
        this.playerSessions = new Map();
        this.activeSessions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalBegun: 0,
            totalEnded: 0,
            totalContextUpdates: 0,
            evolutionCount: 0,
            byState: { active: 0, ended: 0 },
            byContextType: {
                conversation: 0,
                state: 0,
                intent: 0,
                memory: 0,
                metadata: 0,
            },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSession', (ctx) => this.getSession(ctx.sessionInternalId));
        this.registerTool('listByPlayer', (ctx) => this.listByPlayer(ctx.playerId));
        this.registerTool('listActiveSessions', () => this.listActiveSessions());
        this.registerTool('listEndedSessions', () => this.listEndedSessions());
        this.registerTool('getSessionStats', (ctx) => this.getSessionStats(ctx.playerId));
    }

    _genId() {
        return `l4ctx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _validateSessionId(sessionId) {
        return typeof sessionId === 'string' && sessionId.length > 0;
    }

    _validatePlayerId(playerId) {
        return typeof playerId === 'string' && playerId.length > 0;
    }

    _now() {
        return Date.now();
    }

    beginSession(playerId, sessionId, options = {}) {
        if (!this._validatePlayerId(playerId)) {
            return { success: false, error: ERROR_CODES.INVALID_PLAYER_ID };
        }
        if (!this._validateSessionId(sessionId)) {
            return { success: false, error: ERROR_CODES.INVALID_SESSION_ID };
        }

        // Check duplicate session id
        for (const existing of this.sessions.values()) {
            if (existing.sessionId === sessionId) {
                return { success: false, error: ERROR_CODES.SESSION_ALREADY_ACTIVE };
            }
        }

        // Check active session count per player
        const activeCount = this._countActiveByPlayer(playerId);
        if (activeCount >= this.config.maxActiveSessionsPerPlayer) {
            return { success: false, error: ERROR_CODES.TOO_MANY_ACTIVE_SESSIONS };
        }

        const id = this._genId();
        const startedAt = this._now();
        const ttl = options.ttl !== undefined ? options.ttl : this.config.defaultTtl;
        const contextType = options.contextType !== undefined ? options.contextType : 'state';
        if (!CONTEXT_TYPE_KEYS.includes(contextType)) {
            return { success: false, error: ERROR_CODES.UNKNOWN_CONTEXT_TYPE };
        }

        const session = {
            id,
            sessionId,
            playerId,
            context: {},
            startedAt,
            endedAt: null,
            duration: 0,
            state: SESSION_STATE_ACTIVE,
            contextType,
            ttl,
            updateCount: 0,
        };

        this.sessions.set(id, session);
        this.activeSessions.set(id, session);

        if (!this.playerSessions.has(playerId)) {
            this.playerSessions.set(playerId, []);
        }
        const playerList = this.playerSessions.get(playerId);
        playerList.push(id);

        // Trim player sessions if exceeding max
        if (playerList.length > this.config.maxSessionsPerPlayer) {
            const removed = playerList.shift();
            if (removed && this.sessions.has(removed)) {
                const removedSession = this.sessions.get(removed);
                if (removedSession.state === SESSION_STATE_ACTIVE) {
                    this.activeSessions.delete(removed);
                }
                this.sessions.delete(removed);
            }
        }

        this.stats.totalBegun += 1;
        this.stats.byState[SESSION_STATE_ACTIVE] += 1;
        this.stats.byContextType[contextType] = (this.stats.byContextType[contextType] || 0) + 1;

        this._triggerHook('onSessionBegin', { session });
        return { success: true, session };
    }

    updateContext(sessionInternalId, key, value) {
        if (!this.sessions.has(sessionInternalId)) {
            return { success: false, error: ERROR_CODES.SESSION_NOT_FOUND };
        }
        if (typeof key !== 'string' || key.length === 0) {
            return { success: false, error: ERROR_CODES.INVALID_KEY };
        }
        const session = this.sessions.get(sessionInternalId);
        if (session.state === SESSION_STATE_ENDED) {
            return { success: false, error: ERROR_CODES.SESSION_ALREADY_ENDED };
        }

        const existingKeys = Object.keys(session.context);
        const hasKey = existingKeys.includes(key);
        if (!hasKey && existingKeys.length >= this.config.maxContextKeys) {
            return { success: false, error: ERROR_CODES.MAX_CONTEXT_KEYS_EXCEEDED };
        }

        session.context[key] = value;
        session.updateCount += 1;
        this.stats.totalContextUpdates += 1;

        this._triggerHook('onContextUpdate', { session, key, value });
        return { success: true, session };
    }

    endSession(sessionInternalId) {
        if (!this.sessions.has(sessionInternalId)) {
            return { success: false, error: ERROR_CODES.SESSION_NOT_FOUND };
        }
        const session = this.sessions.get(sessionInternalId);
        if (session.state === SESSION_STATE_ENDED) {
            return { success: false, error: ERROR_CODES.SESSION_ALREADY_ENDED };
        }

        session.endedAt = this._now();
        session.duration = session.endedAt - session.startedAt;
        session.state = SESSION_STATE_ENDED;

        this.activeSessions.delete(sessionInternalId);
        this.stats.totalEnded += 1;
        this.stats.byState[SESSION_STATE_ENDED] += 1;

        this._triggerHook('onSessionEnd', { session });
        return { success: true, session };
    }

    getSession(sessionInternalId) {
        if (!this.sessions.has(sessionInternalId)) return null;
        const session = this.sessions.get(sessionInternalId);
        return {
            ...session,
            context: { ...session.context },
        };
    }

    getSessionBySessionId(sessionId) {
        for (const session of this.sessions.values()) {
            if (session.sessionId === sessionId) return { ...session, context: { ...session.context } };
        }
        return null;
    }

    listByPlayer(playerId) {
        if (!this.playerSessions.has(playerId)) return [];
        const ids = this.playerSessions.get(playerId);
        return ids
            .map((id) => this.sessions.get(id))
            .filter((s) => s !== undefined)
            .map((s) => ({ ...s, context: { ...s.context } }));
    }

    listActiveSessions() {
        return Array.from(this.activeSessions.values()).map((s) => ({
            ...s,
            context: { ...s.context },
        }));
    }

    listEndedSessions() {
        return Array.from(this.sessions.values())
            .filter((s) => s.state === SESSION_STATE_ENDED)
            .map((s) => ({ ...s, context: { ...s.context } }));
    }

    listActiveByPlayer(playerId) {
        return this.listActiveSessions().filter((s) => s.playerId === playerId);
    }

    _countActiveByPlayer(playerId) {
        return this.listActiveByPlayer(playerId).length;
    }

    getSessionStats(playerId) {
        const playerSessions = this.listByPlayer(playerId);
        const ended = playerSessions.filter((s) => s.state === SESSION_STATE_ENDED);
        const active = playerSessions.filter((s) => s.state === SESSION_STATE_ACTIVE);
        const totalDuration = ended.reduce((sum, s) => sum + s.duration, 0);
        const avgDuration = ended.length > 0 ? totalDuration / ended.length : 0;
        const totalContextKeys = playerSessions.reduce(
            (sum, s) => sum + Object.keys(s.context).length,
            0,
        );
        const contextTypeDistribution = {
            conversation: 0,
            state: 0,
            intent: 0,
            memory: 0,
            metadata: 0,
        };
        for (const s of playerSessions) {
            if (contextTypeDistribution[s.contextType] !== undefined) {
                contextTypeDistribution[s.contextType] += 1;
            }
        }
        return {
            playerId,
            totalSessions: playerSessions.length,
            activeCount: active.length,
            endedCount: ended.length,
            avgDuration,
            totalContextKeys,
            contextTypeDistribution,
        };
    }

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: 'INVALID_TOOL_NAME' };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: 'INVALID_HANDLER' };
        }
        this.tools.set(name, handler);
        return { success: true };
    }

    executeTool(name, context) {
        if (!this.tools.has(name)) {
            return { success: false, error: 'UNKNOWN_TOOL' };
        }
        const handler = this.tools.get(name);
        const ctx = context !== undefined && context !== null ? context : {};
        try {
            const result = handler(ctx);
            return { success: true, result };
        } catch (e) {
            return { success: false, error: 'TOOL_EXECUTION_ERROR', message: e.message };
        }
    }

    registerHook(event, handler) {
        if (typeof event !== 'string' || event.length === 0) {
            return { success: false, error: 'INVALID_EVENT_NAME' };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: 'INVALID_HANDLER' };
        }
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(handler);
        return { success: true };
    }

    _triggerHook(event, data) {
        if (!this.hooks.has(event)) return;
        for (const handler of this.hooks.get(event)) {
            try {
                handler(data);
            } catch (e) {
                // silent error handling
            }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: 'EVENT_NOT_FOUND' };
        const handlers = this.hooks.get(event);
        const idx = handlers.indexOf(handler);
        if (idx === -1) return { success: false, error: 'HANDLER_NOT_FOUND' };
        handlers.splice(idx, 1);
        return { success: true };
    }

    deleteSession(sessionInternalId) {
        if (!this.sessions.has(sessionInternalId)) {
            return { success: false, error: ERROR_CODES.SESSION_NOT_FOUND };
        }
        const session = this.sessions.get(sessionInternalId);
        const playerId = session.playerId;
        if (this.playerSessions.has(playerId)) {
            const list = this.playerSessions.get(playerId);
            const idx = list.indexOf(sessionInternalId);
            if (idx !== -1) list.splice(idx, 1);
        }
        this.activeSessions.delete(sessionInternalId);
        this.sessions.delete(sessionInternalId);
        return { success: true };
    }

    expireOldSessions(now = this._now()) {
        let expiredCount = 0;
        for (const [id, session] of this.activeSessions.entries()) {
            const age = now - session.startedAt;
            if (age > session.ttl) {
                session.endedAt = now;
                session.duration = session.endedAt - session.startedAt;
                session.state = SESSION_STATE_ENDED;
                this.activeSessions.delete(id);
                this.stats.totalEnded += 1;
                this.stats.byState[SESSION_STATE_ENDED] += 1;
                expiredCount += 1;
                this._triggerHook('onSessionExpire', { session });
            }
        }
        return { success: true, expiredCount };
    }

    toJSON() {
        return {
            config: this.config,
            sessions: Array.from(this.sessions.entries()),
            playerSessions: Array.from(this.playerSessions.entries()),
            stats: this.stats,
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: 'INVALID_DATA' };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.sessions && Array.isArray(data.sessions)) {
            this.sessions = new Map(data.sessions);
            this.activeSessions = new Map();
            for (const [id, session] of this.sessions.entries()) {
                if (session.state === SESSION_STATE_ACTIVE) {
                    this.activeSessions.set(id, session);
                }
            }
        }
        if (data.playerSessions && Array.isArray(data.playerSessions)) {
            this.playerSessions = new Map(data.playerSessions);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalSessions: this.sessions.size,
            activeSessions: this.activeSessions.size,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.sessions.clear();
        this.playerSessions.clear();
        this.activeSessions.clear();
        this.hooks.clear();
        this.stats = {
            totalBegun: 0,
            totalEnded: 0,
            totalContextUpdates: 0,
            evolutionCount: 0,
            byState: { active: 0, ended: 0 },
            byContextType: {
                conversation: 0,
                state: 0,
                intent: 0,
                memory: 0,
                metadata: 0,
            },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}
