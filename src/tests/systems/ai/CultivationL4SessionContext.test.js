/**
 * CultivationL4SessionContext.test.js - L4 会话上下文测试
 * V908 P-20260613-082 Iteration 21/30 Round 35
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationL4SessionContext,
    MAX_CONTEXT_KEYS,
    DEFAULT_TTL,
    SESSION_STATES,
    SESSION_STATE_ACTIVE,
    SESSION_STATE_ENDED,
    SESSION_STATE_COUNT,
    CONTEXT_TYPES,
    CONTEXT_TYPE_KEYS,
    CONTEXT_TYPE_COUNT,
    DEFAULT_MAX_SESSIONS_PER_PLAYER,
    MAX_ACTIVE_SESSIONS_PER_PLAYER,
    ERROR_CODES,
} from '../../../systems/ai/CultivationL4SessionContext.js';

describe('CultivationL4SessionContext', () => {
    let system;
    beforeEach(() => {
        system = new CultivationL4SessionContext();
    });

    describe('constructor', () => {
        it('should initialize with default config', () => {
            expect(system.config.maxContextKeys).toBe(MAX_CONTEXT_KEYS);
            expect(system.config.maxSessionsPerPlayer).toBe(DEFAULT_MAX_SESSIONS_PER_PLAYER);
            expect(system.config.maxActiveSessionsPerPlayer).toBe(MAX_ACTIVE_SESSIONS_PER_PLAYER);
            expect(system.config.defaultTtl).toBe(DEFAULT_TTL);
            expect(system.config.autoExpire).toBe(false);
        });
        it('should accept custom config', () => {
            const s = new CultivationL4SessionContext({
                maxContextKeys: 5,
                maxSessionsPerPlayer: 10,
                autoExpire: true,
            });
            expect(s.config.maxContextKeys).toBe(5);
            expect(s.config.maxSessionsPerPlayer).toBe(10);
            expect(s.config.autoExpire).toBe(true);
        });
        it('should handle config=0 numeric fields', () => {
            const s = new CultivationL4SessionContext({
                maxContextKeys: 0,
                maxSessionsPerPlayer: 0,
                maxActiveSessionsPerPlayer: 0,
                defaultTtl: 0,
            });
            expect(s.config.maxContextKeys).toBe(0);
            expect(s.config.maxSessionsPerPlayer).toBe(0);
            expect(s.config.maxActiveSessionsPerPlayer).toBe(0);
            expect(s.config.defaultTtl).toBe(0);
        });
        it('should initialize empty maps', () => {
            expect(system.sessions.size).toBe(0);
            expect(system.playerSessions.size).toBe(0);
            expect(system.activeSessions.size).toBe(0);
        });
        it('should initialize stats', () => {
            expect(system.stats.totalBegun).toBe(0);
            expect(system.stats.totalEnded).toBe(0);
            expect(system.stats.totalContextUpdates).toBe(0);
            expect(system.stats.byState.active).toBe(0);
            expect(system.stats.byState.ended).toBe(0);
        });
        it('should register default tools', () => {
            expect(system.tools.has('getSession')).toBe(true);
            expect(system.tools.has('listByPlayer')).toBe(true);
            expect(system.tools.has('listActiveSessions')).toBe(true);
            expect(system.tools.has('listEndedSessions')).toBe(true);
            expect(system.tools.has('getSessionStats')).toBe(true);
        });
    });

    describe('beginSession', () => {
        it('should begin a session', () => {
            const result = system.beginSession('player_1', 'sess_1');
            expect(result.success).toBe(true);
            expect(result.session.playerId).toBe('player_1');
            expect(result.session.sessionId).toBe('sess_1');
            expect(result.session.state).toBe('active');
            expect(result.session.context).toEqual({});
            expect(result.session.endedAt).toBe(null);
            expect(result.session.duration).toBe(0);
            expect(typeof result.session.id).toBe('string');
            expect(typeof result.session.startedAt).toBe('number');
        });
        it('should reject empty playerId', () => {
            const result = system.beginSession('', 'sess_1');
            expect(result.success).toBe(false);
            expect(result.error).toBe(ERROR_CODES.INVALID_PLAYER_ID);
        });
        it('should reject non-string playerId', () => {
            const result = system.beginSession(null, 'sess_1');
            expect(result.success).toBe(false);
            expect(result.error).toBe(ERROR_CODES.INVALID_PLAYER_ID);
        });
        it('should reject empty sessionId', () => {
            const result = system.beginSession('p1', '');
            expect(result.success).toBe(false);
            expect(result.error).toBe(ERROR_CODES.INVALID_SESSION_ID);
        });
        it('should reject non-string sessionId', () => {
            const result = system.beginSession('p1', 42);
            expect(result.success).toBe(false);
            expect(result.error).toBe(ERROR_CODES.INVALID_SESSION_ID);
        });
        it('should reject duplicate sessionId', () => {
            system.beginSession('p1', 'sess_1');
            const result = system.beginSession('p1', 'sess_1');
            expect(result.error).toBe(ERROR_CODES.SESSION_ALREADY_ACTIVE);
        });
        it('should reject too many active sessions', () => {
            const s = new CultivationL4SessionContext({ maxActiveSessionsPerPlayer: 2 });
            s.beginSession('p1', 's1');
            s.beginSession('p1', 's2');
            const result = s.beginSession('p1', 's3');
            expect(result.error).toBe(ERROR_CODES.TOO_MANY_ACTIVE_SESSIONS);
        });
        it('should reject unknown contextType', () => {
            const result = system.beginSession('p1', 's1', { contextType: 'unknown_type' });
            expect(result.success).toBe(false);
            expect(result.error).toBe(ERROR_CODES.UNKNOWN_CONTEXT_TYPE);
        });
        it('should accept all 5 context types', () => {
            const s = new CultivationL4SessionContext({ maxActiveSessionsPerPlayer: 10 });
            for (const type of CONTEXT_TYPE_KEYS) {
                const result = s.beginSession('p1', `s_${type}`, { contextType: type });
                expect(result.success).toBe(true);
                expect(result.session.contextType).toBe(type);
            }
        });
        it('should accept custom ttl', () => {
            const result = system.beginSession('p1', 's1', { ttl: 1000 });
            expect(result.session.ttl).toBe(1000);
        });
        it('should accept ttl=0', () => {
            const result = system.beginSession('p1', 's1', { ttl: 0 });
            expect(result.session.ttl).toBe(0);
        });
        it('should track player sessions', () => {
            system.beginSession('p1', 's1');
            system.beginSession('p1', 's2');
            expect(system.playerSessions.get('p1').length).toBe(2);
        });
        it('should trim old sessions when exceeding max', () => {
            const s = new CultivationL4SessionContext({ maxSessionsPerPlayer: 2 });
            s.beginSession('p1', 's1');
            s.beginSession('p1', 's2');
            s.beginSession('p1', 's3');
            expect(s.sessions.size).toBe(2);
            expect(s.playerSessions.get('p1').length).toBe(2);
        });
        it('should update stats', () => {
            system.beginSession('p1', 's1');
            expect(system.stats.totalBegun).toBe(1);
            expect(system.stats.byState.active).toBe(1);
            expect(system.stats.byContextType.state).toBe(1);
        });
        it('should trim active sessions on overflow', () => {
            const s = new CultivationL4SessionContext({
                maxSessionsPerPlayer: 1,
                maxActiveSessionsPerPlayer: 5,
            });
            const { session: s1 } = s.beginSession('p1', 'sess_a');
            s.beginSession('p1', 'sess_b');
            expect(s.activeSessions.has(s1.id)).toBe(false);
        });
    });

    describe('updateContext', () => {
        it('should update context with a new key', () => {
            const { session } = system.beginSession('p1', 's1');
            const result = system.updateContext(session.id, 'lang', 'zh');
            expect(result.success).toBe(true);
            expect(result.session.context.lang).toBe('zh');
        });
        it('should accumulate multiple keys', () => {
            const { session } = system.beginSession('p1', 's1');
            system.updateContext(session.id, 'a', 1);
            system.updateContext(session.id, 'b', 2);
            system.updateContext(session.id, 'c', 3);
            const fresh = system.getSession(session.id);
            expect(fresh.context.a).toBe(1);
            expect(fresh.context.b).toBe(2);
            expect(fresh.context.c).toBe(3);
        });
        it('should overwrite existing key', () => {
            const { session } = system.beginSession('p1', 's1');
            system.updateContext(session.id, 'lang', 'zh');
            system.updateContext(session.id, 'lang', 'en');
            const fresh = system.getSession(session.id);
            expect(fresh.context.lang).toBe('en');
        });
        it('should update updateCount and stats', () => {
            const { session } = system.beginSession('p1', 's1');
            system.updateContext(session.id, 'a', 1);
            system.updateContext(session.id, 'b', 2);
            expect(system.stats.totalContextUpdates).toBe(2);
            const fresh = system.getSession(session.id);
            expect(fresh.updateCount).toBe(2);
        });
        it('should reject unknown sessionInternalId', () => {
            const result = system.updateContext('unknown_id', 'k', 'v');
            expect(result.error).toBe(ERROR_CODES.SESSION_NOT_FOUND);
        });
        it('should reject invalid key (empty string)', () => {
            const { session } = system.beginSession('p1', 's1');
            const result = system.updateContext(session.id, '', 'v');
            expect(result.error).toBe(ERROR_CODES.INVALID_KEY);
        });
        it('should reject invalid key (non-string)', () => {
            const { session } = system.beginSession('p1', 's1');
            const result = system.updateContext(session.id, 42, 'v');
            expect(result.error).toBe(ERROR_CODES.INVALID_KEY);
        });
        it('should reject when MAX_CONTEXT_KEYS exceeded', () => {
            const s = new CultivationL4SessionContext({ maxContextKeys: 2 });
            const { session } = s.beginSession('p1', 's1');
            s.updateContext(session.id, 'a', 1);
            s.updateContext(session.id, 'b', 2);
            const result = s.updateContext(session.id, 'c', 3);
            expect(result.error).toBe(ERROR_CODES.MAX_CONTEXT_KEYS_EXCEEDED);
        });
        it('should NOT exceed when overwriting existing key', () => {
            const s = new CultivationL4SessionContext({ maxContextKeys: 1 });
            const { session } = s.beginSession('p1', 's1');
            s.updateContext(session.id, 'a', 1);
            const result = s.updateContext(session.id, 'a', 2);
            expect(result.success).toBe(true);
            expect(s.getSession(session.id).context.a).toBe(2);
        });
        it('should reject when session already ended', () => {
            const { session } = system.beginSession('p1', 's1');
            system.endSession(session.id);
            const result = system.updateContext(session.id, 'k', 'v');
            expect(result.error).toBe(ERROR_CODES.SESSION_ALREADY_ENDED);
        });
    });

    describe('endSession', () => {
        it('should end an active session', () => {
            const { session } = system.beginSession('p1', 's1');
            const result = system.endSession(session.id);
            expect(result.success).toBe(true);
            expect(result.session.state).toBe('ended');
            expect(result.session.endedAt).not.toBe(null);
            expect(result.session.duration).toBeGreaterThanOrEqual(0);
        });
        it('should reject unknown sessionInternalId', () => {
            const result = system.endSession('unknown');
            expect(result.error).toBe(ERROR_CODES.SESSION_NOT_FOUND);
        });
        it('should reject double end', () => {
            const { session } = system.beginSession('p1', 's1');
            system.endSession(session.id);
            const result = system.endSession(session.id);
            expect(result.error).toBe(ERROR_CODES.SESSION_ALREADY_ENDED);
        });
        it('should remove from activeSessions on end', () => {
            const { session } = system.beginSession('p1', 's1');
            expect(system.activeSessions.has(session.id)).toBe(true);
            system.endSession(session.id);
            expect(system.activeSessions.has(session.id)).toBe(false);
        });
        it('should update stats', () => {
            const { session } = system.beginSession('p1', 's1');
            system.endSession(session.id);
            expect(system.stats.totalEnded).toBe(1);
            expect(system.stats.byState.ended).toBe(1);
        });
    });

    describe('getSession', () => {
        it('should return session by id', () => {
            const { session } = system.beginSession('p1', 's1');
            const fetched = system.getSession(session.id);
            expect(fetched.id).toBe(session.id);
        });
        it('should return null for unknown id', () => {
            expect(system.getSession('unknown')).toBe(null);
        });
        it('should return clone with context copy', () => {
            const { session } = system.beginSession('p1', 's1');
            system.updateContext(session.id, 'k', 'v');
            const fetched = system.getSession(session.id);
            fetched.context.k = 'mutated';
            expect(system.getSession(session.id).context.k).toBe('v');
        });
    });

    describe('getSessionBySessionId', () => {
        it('should find session by sessionId', () => {
            system.beginSession('p1', 'my_session');
            const result = system.getSessionBySessionId('my_session');
            expect(result).not.toBe(null);
            expect(result.sessionId).toBe('my_session');
        });
        it('should return null when sessionId not found', () => {
            expect(system.getSessionBySessionId('nope')).toBe(null);
        });
        it('should return clone with context copy', () => {
            system.beginSession('p1', 'my_session');
            const result = system.getSessionBySessionId('my_session');
            result.context.injected = true;
            expect(system.getSessionBySessionId('my_session').context.injected).toBeUndefined();
        });
    });

    describe('listByPlayer', () => {
        it('should return empty for unknown player', () => {
            expect(system.listByPlayer('unknown')).toEqual([]);
        });
        it('should list all player sessions', () => {
            system.beginSession('p1', 's1');
            system.beginSession('p1', 's2');
            expect(system.listByPlayer('p1').length).toBe(2);
        });
        it('should separate sessions by player', () => {
            system.beginSession('p1', 's1');
            system.beginSession('p2', 's2');
            expect(system.listByPlayer('p1').length).toBe(1);
            expect(system.listByPlayer('p2').length).toBe(1);
        });
    });

    describe('listActiveSessions', () => {
        it('should list active sessions only', () => {
            const { session } = system.beginSession('p1', 's1');
            system.beginSession('p2', 's2');
            system.endSession(session.id);
            expect(system.listActiveSessions().length).toBe(1);
        });
        it('should return empty when no active sessions', () => {
            expect(system.listActiveSessions()).toEqual([]);
        });
        it('should return cloned contexts', () => {
            const { session } = system.beginSession('p1', 's1');
            system.updateContext(session.id, 'k', 'v');
            const active = system.listActiveSessions();
            active[0].context.k = 'mutated';
            expect(system.getSession(session.id).context.k).toBe('v');
        });
    });

    describe('listEndedSessions', () => {
        it('should list ended sessions only', () => {
            const { session: s1 } = system.beginSession('p1', 's1');
            system.beginSession('p2', 's2');
            system.endSession(s1.id);
            expect(system.listEndedSessions().length).toBe(1);
        });
        it('should return empty when no ended sessions', () => {
            expect(system.listEndedSessions()).toEqual([]);
        });
    });

    describe('getSessionStats', () => {
        it('should return zero stats for unknown player', () => {
            const stats = system.getSessionStats('unknown');
            expect(stats.totalSessions).toBe(0);
            expect(stats.totalContextKeys).toBe(0);
            expect(stats.activeCount).toBe(0);
            expect(stats.endedCount).toBe(0);
        });
        it('should calculate avgDuration for ended sessions', () => {
            const { session } = system.beginSession('p1', 's1');
            system.endSession(session.id);
            const stats = system.getSessionStats('p1');
            expect(stats.endedCount).toBe(1);
            expect(stats.avgDuration).toBeGreaterThanOrEqual(0);
        });
        it('should track active count', () => {
            system.beginSession('p1', 's1');
            system.beginSession('p1', 's2');
            const stats = system.getSessionStats('p1');
            expect(stats.activeCount).toBe(2);
        });
        it('should track totalContextKeys across sessions', () => {
            const { session } = system.beginSession('p1', 's1');
            system.updateContext(session.id, 'a', 1);
            system.updateContext(session.id, 'b', 2);
            const stats = system.getSessionStats('p1');
            expect(stats.totalContextKeys).toBe(2);
        });
        it('should compute contextTypeDistribution', () => {
            system.beginSession('p1', 's1', { contextType: 'memory' });
            system.beginSession('p1', 's2', { contextType: 'state' });
            const stats = system.getSessionStats('p1');
            expect(stats.contextTypeDistribution.memory).toBe(1);
            expect(stats.contextTypeDistribution.state).toBe(1);
        });
    });

    describe('deleteSession', () => {
        it('should delete a session', () => {
            const { session } = system.beginSession('p1', 's1');
            const result = system.deleteSession(session.id);
            expect(result.success).toBe(true);
            expect(system.sessions.has(session.id)).toBe(false);
        });
        it('should reject unknown sessionInternalId', () => {
            expect(system.deleteSession('unknown').error).toBe(ERROR_CODES.SESSION_NOT_FOUND);
        });
        it('should remove from playerSessions list', () => {
            const { session } = system.beginSession('p1', 's1');
            system.deleteSession(session.id);
            expect(system.playerSessions.get('p1')).toEqual([]);
        });
        it('should remove from activeSessions', () => {
            const { session } = system.beginSession('p1', 's1');
            system.deleteSession(session.id);
            expect(system.activeSessions.has(session.id)).toBe(false);
        });
    });

    describe('expireOldSessions', () => {
        it('should expire sessions older than ttl', () => {
            const { session } = system.beginSession('p1', 's1', { ttl: 100 });
            const result = system.expireOldSessions(session.startedAt + 200);
            expect(result.expiredCount).toBe(1);
            expect(system.getSession(session.id).state).toBe('ended');
        });
        it('should NOT expire sessions within ttl', () => {
            const { session } = system.beginSession('p1', 's1', { ttl: 10000 });
            const result = system.expireOldSessions(session.startedAt + 100);
            expect(result.expiredCount).toBe(0);
            expect(system.getSession(session.id).state).toBe('active');
        });
        it('should trigger onSessionExpire hook', () => {
            let called = false;
            system.registerHook('onSessionExpire', () => { called = true; });
            const { session } = system.beginSession('p1', 's1', { ttl: 50 });
            system.expireOldSessions(session.startedAt + 200);
            expect(called).toBe(true);
        });
        it('should update stats on expire', () => {
            const { session } = system.beginSession('p1', 's1', { ttl: 50 });
            system.expireOldSessions(session.startedAt + 200);
            expect(system.stats.totalEnded).toBe(1);
            expect(system.stats.byState.ended).toBe(1);
        });
    });

    describe('registerTool + executeTool', () => {
        it('should register custom tool', () => {
            const result = system.registerTool('myTool', () => 42);
            expect(result.success).toBe(true);
            expect(system.tools.has('myTool')).toBe(true);
        });
        it('should reject invalid tool name', () => {
            expect(system.registerTool('', () => {}).error).toBe('INVALID_TOOL_NAME');
        });
        it('should reject invalid handler', () => {
            expect(system.registerTool('t', null).error).toBe('INVALID_HANDLER');
        });
        it('should execute registered tool', () => {
            system.registerTool('get42', () => 42);
            const result = system.executeTool('get42');
            expect(result.result).toBe(42);
        });
        it('should pass context to tool', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo', { x: 1 });
            expect(result.result.x).toBe(1);
        });
        it('should handle missing-context (default {} branch)', () => {
            system.registerTool('echoAll', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('echoAll');
            expect(result.result).toBe(0);
        });
        it('should handle null context', () => {
            system.registerTool('echoAll2', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('echoAll2', null);
            expect(result.result).toBe(0);
        });
        it('should return UNKNOWN_TOOL for missing tool', () => {
            expect(system.executeTool('nonexistent').error).toBe('UNKNOWN_TOOL');
        });
        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TOOL_EXECUTION_ERROR');
        });
        it('should call built-in getSession via tool', () => {
            const { session } = system.beginSession('p1', 's1');
            const result = system.executeTool('getSession', { sessionInternalId: session.id });
            expect(result.result.id).toBe(session.id);
        });
        it('should call listActiveSessions via tool', () => {
            system.beginSession('p1', 's1');
            const result = system.executeTool('listActiveSessions');
            expect(result.result.length).toBe(1);
        });
        it('should call listEndedSessions via tool', () => {
            const { session } = system.beginSession('p1', 's1');
            system.endSession(session.id);
            const result = system.executeTool('listEndedSessions');
            expect(result.result.length).toBe(1);
        });
        it('should call getSessionStats via tool', () => {
            system.beginSession('p1', 's1');
            const result = system.executeTool('getSessionStats', { playerId: 'p1' });
            expect(result.result.playerId).toBe('p1');
        });
        it('should call listByPlayer via tool', () => {
            system.beginSession('p1', 's1');
            const result = system.executeTool('listByPlayer', { playerId: 'p1' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('registerHook + triggerHook', () => {
        it('should register hook', () => {
            const result = system.registerHook('onTest', () => {});
            expect(result.success).toBe(true);
        });
        it('should reject invalid event name', () => {
            expect(system.registerHook('', () => {}).error).toBe('INVALID_EVENT_NAME');
        });
        it('should reject invalid handler', () => {
            expect(system.registerHook('onTest', null).error).toBe('INVALID_HANDLER');
        });
        it('should trigger hook on beginSession', () => {
            let called = false;
            system.registerHook('onSessionBegin', () => { called = true; });
            system.beginSession('p1', 's1');
            expect(called).toBe(true);
        });
        it('should trigger hook on endSession', () => {
            let called = false;
            system.registerHook('onSessionEnd', () => { called = true; });
            const { session } = system.beginSession('p1', 's1');
            system.endSession(session.id);
            expect(called).toBe(true);
        });
        it('should trigger hook on updateContext', () => {
            let called = false;
            system.registerHook('onContextUpdate', () => { called = true; });
            const { session } = system.beginSession('p1', 's1');
            system.updateContext(session.id, 'k', 'v');
            expect(called).toBe(true);
        });
        it('should handle hook errors silently', () => {
            system.registerHook('onSessionBegin', () => { throw new Error('hook-fail'); });
            expect(() => system.beginSession('p1', 's1')).not.toThrow();
        });
        it('should support multiple handlers per event', () => {
            let count = 0;
            system.registerHook('onSessionBegin', () => { count++; });
            system.registerHook('onSessionBegin', () => { count++; });
            system.beginSession('p1', 's1');
            expect(count).toBe(2);
        });
        it('should unregister hook', () => {
            const handler = () => {};
            system.registerHook('onTest', handler);
            const result = system.unregisterHook('onTest', handler);
            expect(result.success).toBe(true);
        });
        it('should return error when unregistering missing event', () => {
            expect(system.unregisterHook('nonexistent', () => {}).error).toBe('EVENT_NOT_FOUND');
        });
        it('should return error when unregistering missing handler', () => {
            system.registerHook('onTest', () => {});
            expect(system.unregisterHook('onTest', () => {}).error).toBe('HANDLER_NOT_FOUND');
        });
    });

    describe('toJSON + fromJSON', () => {
        it('should serialize state', () => {
            system.beginSession('p1', 's1');
            const json = system.toJSON();
            expect(json.sessions.length).toBe(1);
        });
        it('should deserialize state', () => {
            system.beginSession('p1', 's1');
            const json = system.toJSON();
            const s2 = new CultivationL4SessionContext();
            const result = s2.fromJSON(json);
            expect(result.success).toBe(true);
            expect(s2.sessions.size).toBe(1);
        });
        it('should reject invalid data', () => {
            expect(system.fromJSON(null).error).toBe('INVALID_DATA');
        });
        it('should restore active sessions on fromJSON', () => {
            system.beginSession('p1', 's1');
            const json = system.toJSON();
            const s2 = new CultivationL4SessionContext();
            s2.fromJSON(json);
            expect(s2.activeSessions.size).toBe(1);
        });
        it('should restore ended sessions only in sessions map', () => {
            const { session } = system.beginSession('p1', 's1');
            system.endSession(session.id);
            const json = system.toJSON();
            const s2 = new CultivationL4SessionContext();
            s2.fromJSON(json);
            expect(s2.activeSessions.size).toBe(0);
            expect(s2.sessions.size).toBe(1);
        });
        it('should handle partial config update', () => {
            const s = new CultivationL4SessionContext();
            s.fromJSON({ config: { maxContextKeys: 99 } });
            expect(s.config.maxContextKeys).toBe(99);
        });
        it('should merge stats', () => {
            const s = new CultivationL4SessionContext();
            s.fromJSON({ stats: { totalBegun: 42 } });
            expect(s.stats.totalBegun).toBe(42);
        });
    });

    describe('getStats', () => {
        it('should return stats snapshot', () => {
            const stats = system.getStats();
            expect(stats.totalSessions).toBe(0);
            expect(stats.activeSessions).toBe(0);
        });
        it('should reflect sessions count', () => {
            system.beginSession('p1', 's1');
            system.beginSession('p2', 's2');
            expect(system.getStats().totalSessions).toBe(2);
        });
    });

    describe('autoEvolve + reset', () => {
        it('should increment evolutionCount', () => {
            system.autoEvolve();
            expect(system.stats.evolutionCount).toBe(1);
        });
        it('should reset all state', () => {
            system.beginSession('p1', 's1');
            system.autoEvolve();
            system.reset();
            expect(system.sessions.size).toBe(0);
            expect(system.stats.evolutionCount).toBe(0);
        });
        it('should re-register default tools after reset', () => {
            system.reset();
            expect(system.tools.has('getSession')).toBe(true);
        });
    });

    describe('CONTEXT_TYPES export', () => {
        it('should have 5 context types', () => {
            expect(Object.keys(CONTEXT_TYPES).length).toBe(CONTEXT_TYPE_COUNT);
            expect(CONTEXT_TYPE_KEYS.length).toBe(5);
        });
        it('should have valid config for each type', () => {
            for (const [key, value] of Object.entries(CONTEXT_TYPES)) {
                expect(value.name).toBeDefined();
                expect(value.maxSize).toBeGreaterThan(0);
            }
        });
    });

    describe('SESSION_STATES exports', () => {
        it('should have 2 states', () => {
            expect(SESSION_STATES.length).toBe(SESSION_STATE_COUNT);
        });
        it('should contain active and ended', () => {
            expect(SESSION_STATES).toContain(SESSION_STATE_ACTIVE);
            expect(SESSION_STATES).toContain(SESSION_STATE_ENDED);
        });
    });

    describe('edge cases', () => {
        it('should handle multiple ends for same player', () => {
            const r1 = system.beginSession('p1', 's1');
            const r2 = system.beginSession('p1', 's2');
            system.endSession(r1.session.id);
            system.endSession(r2.session.id);
            expect(system.stats.totalEnded).toBe(2);
        });
        it('should keep session in playerSessions even after end', () => {
            const { session } = system.beginSession('p1', 's1');
            system.endSession(session.id);
            expect(system.playerSessions.get('p1')).toContain(session.id);
        });
        it('should handle contextType=0 default correctly', () => {
            const s = new CultivationL4SessionContext({ defaultTtl: 0 });
            const result = s.beginSession('p1', 's1');
            expect(result.session.ttl).toBe(0);
        });
        it('should preserve stats on fromJSON when not provided', () => {
            const s = new CultivationL4SessionContext();
            s.autoEvolve();
            s.fromJSON({});
            expect(s.stats.evolutionCount).toBe(1);
        });
        it('should not throw when _triggerHook with no event', () => {
            expect(() => system._triggerHook('never_registered', {})).not.toThrow();
        });
        it('should handle _validateSessionId for non-string types', () => {
            expect(system._validateSessionId(undefined)).toBe(false);
            expect(system._validateSessionId(null)).toBe(false);
            expect(system._validateSessionId(123)).toBe(false);
            expect(system._validateSessionId('valid')).toBe(true);
        });
        it('should handle _validatePlayerId for non-string types', () => {
            expect(system._validatePlayerId(undefined)).toBe(false);
            expect(system._validatePlayerId(null)).toBe(false);
            expect(system._validatePlayerId(123)).toBe(false);
            expect(system._validatePlayerId('valid')).toBe(true);
        });
        it('should handle expireOldSessions with no active sessions', () => {
            const result = system.expireOldSessions();
            expect(result.expiredCount).toBe(0);
        });
        it('should handle autoEvolve with multiple calls', () => {
            system.autoEvolve();
            system.autoEvolve();
            system.autoEvolve();
            expect(system.stats.evolutionCount).toBe(3);
        });
        it('should preserve contextTypeDistribution for known types', () => {
            const { session } = system.beginSession('p1', 's1', { contextType: 'intent' });
            system.endSession(session.id);
            const stats = system.getSessionStats('p1');
            expect(stats.contextTypeDistribution.intent).toBe(1);
        });
    });
});
