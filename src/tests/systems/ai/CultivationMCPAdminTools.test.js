/**
 * CultivationMCPAdminTools.test.js - Admin 权限工具测试
 * V864 Iteration 6/30 Round 35 - Direction F
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdminToolset, ADMIN_TOOLS } from '../../../systems/ai/CultivationMCPAdminTools.js';
import { CultivationMCPServer } from '../../../systems/ai/CultivationMCPServer.js';

describe('CultivationMCPAdminTools', () => {
    let toolset, server;
    beforeEach(() => {
        toolset = new AdminToolset();
        server = new CultivationMCPServer();
        toolset.seedTestData();
        toolset.registerAll(server);
    });

    describe('registerAll', () => {
        it('should register all 5 admin tools', async () => {
            const methods = server.listMethodsByPermission('admin');
            expect(methods.length).toBeGreaterThanOrEqual(5);
        });
    });

    describe('admin.force.breakthrough', () => {
        it('should force breakthrough', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.force.breakthrough', params: { playerId: 'p_001', targetRealm: '金丹', reason: '剧情需要' } });
            expect(r.result.newRealm).toBe('金丹');
            expect(r.result.previousRealm).toBe('筑基');
        });

        it('should reject missing params', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.force.breakthrough', params: {} });
            expect(r.result.error).toBe('MISSING_PARAMS');
        });

        it('should reject unknown player', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.force.breakthrough', params: { playerId: 'p_999', targetRealm: '金丹' } });
            expect(r.result.error).toBe('PLAYER_NOT_FOUND');
        });

        it('should rate limit after 5 calls per minute', async () => {
            for (let i = 0; i < 5; i++) {
                await server.handleRequest({ jsonrpc: '2.0', id: i, method: 'admin.force.breakthrough', params: { playerId: 'p_001', targetRealm: '金丹' } });
            }
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 6, method: 'admin.force.breakthrough', params: { playerId: 'p_001', targetRealm: '元婴' } });
            expect(r.result.error).toBe('RATE_LIMIT_MINUTE');
            expect(toolset.stats.rejectedByRateLimit).toBe(1);
        });

        it('should audit log the operation', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.force.breakthrough', params: { playerId: 'p_001', targetRealm: '金丹' } });
            const log = toolset.getAuditLog();
            expect(log.length).toBe(1);
            expect(log[0].operation).toBe('admin.force.breakthrough');
        });
    });

    describe('admin.grant.skill', () => {
        it('should grant skill', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.grant.skill', params: { playerId: 'p_001', skillId: 'sword_mastery' } });
            expect(r.result.totalSkills).toBe(1);
        });

        it('should upgrade existing skill', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.grant.skill', params: { playerId: 'p_001', skillId: 'sword', skillLevel: 1 } });
            await server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'admin.grant.skill', params: { playerId: 'p_001', skillId: 'sword', skillLevel: 5 } });
            const player = toolset.dataStore.players.get('p_001');
            expect(player.skills[0].level).toBe(5);
        });

        it('should reject missing params', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.grant.skill', params: {} });
            expect(r.result.error).toBe('MISSING_PARAMS');
        });
    });

    describe('admin.reset.player', () => {
        it('should reset all fields', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.reset.player', params: { playerId: 'p_001', fields: ['all'] } });
            expect(r.result.resetFields.length).toBeGreaterThan(0);
        });

        it('should keep playerId', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.reset.player', params: { playerId: 'p_001' } });
            const player = toolset.dataStore.players.get('p_001');
            expect(player.playerId).toBe('p_001');
        });

        it('should reject missing playerId', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.reset.player', params: {} });
            expect(r.result.error).toBe('MISSING_PLAYER_ID');
        });

        it('should rate limit after 1 call per minute', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.reset.player', params: { playerId: 'p_001' } });
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'admin.reset.player', params: { playerId: 'p_001' } });
            expect(r.result.error).toBe('RATE_LIMIT_MINUTE');
        });
    });

    describe('admin.broadcast', () => {
        it('should broadcast message', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.broadcast', params: { message: '天劫将于一炷香后降临', priority: 'high' } });
            expect(r.result.broadcastId).toBeDefined();
            expect(r.result.message).toBe('天劫将于一炷香后降临');
        });

        it('should reject missing message', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.broadcast', params: {} });
            expect(r.result.error).toBe('MISSING_MESSAGE');
        });

        it('should support audience targeting', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.broadcast', params: { message: '青云宗集合', audience: 'sect:qingyun' } });
            expect(r.result.audience).toBe('sect:qingyun');
        });
    });

    describe('admin.debug.inspect', () => {
        it('should inspect data store', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.debug.inspect', params: {} });
            expect(r.result.snapshotId).toBeDefined();
            expect(r.result.dataStoreSummary).toBeDefined();
        });

        it('should not be rate limited aggressively', async () => {
            for (let i = 0; i < 50; i++) {
                await server.handleRequest({ jsonrpc: '2.0', id: i, method: 'admin.debug.inspect', params: {} });
            }
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 51, method: 'admin.debug.inspect', params: {} });
            expect(r.result.snapshotId).toBeDefined();
        });
    });

    describe('rate limiter', () => {
        it('should track per key', async () => {
            const check1 = toolset.rateLimiter.check('key1', { perMinute: 2 });
            const check2 = toolset.rateLimiter.check('key1', { perMinute: 2 });
            const check3 = toolset.rateLimiter.check('key1', { perMinute: 2 });
            expect(check1.allowed).toBe(true);
            expect(check2.allowed).toBe(true);
            expect(check3.allowed).toBe(false);
        });

        it('should allow different keys', async () => {
            toolset.rateLimiter.check('k1', { perMinute: 1 });
            const r = toolset.rateLimiter.check('k2', { perMinute: 1 });
            expect(r.allowed).toBe(true);
        });

        it('should clear specific key', async () => {
            toolset.rateLimiter.check('k1', { perMinute: 1 });
            toolset.rateLimiter.clear('k1');
            const r = toolset.rateLimiter.check('k1', { perMinute: 1 });
            expect(r.allowed).toBe(true);
        });

        it('should clear all', async () => {
            toolset.rateLimiter.check('k1', { perMinute: 1 });
            toolset.rateLimiter.clearAll();
            const r = toolset.rateLimiter.check('k1', { perMinute: 1 });
            expect(r.allowed).toBe(true);
        });
    });

    describe('audit log', () => {
        it('should bound at 1000', async () => {
            for (let i = 0; i < 1100; i++) toolset._audit('test', {}, {});
            expect(toolset.auditLog.length).toBeLessThanOrEqual(1000);
        });

        it('should clear audit log', async () => {
            toolset._audit('test', {}, {});
            toolset.clearAuditLog();
            expect(toolset.auditLog.length).toBe(0);
        });
    });

    describe('stats & serialization', () => {
        it('should track admin stats', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'admin.broadcast', params: { message: 'test' } });
            const s = toolset.getStats();
            expect(s.totalAdminCalls).toBe(1);
            expect(s.successfulAdminCalls).toBe(1);
        });

        it('should serialize', async () => {
            const j = toolset.toJSON();
            expect(j.stats).toBeDefined();
        });

        it('should restore', async () => {
            const j = toolset.toJSON();
            const t2 = new AdminToolset();
            const r = t2.fromJSON(j);
            expect(r.success).toBe(true);
        });
    });

    describe('ADMIN_TOOLS constant', () => {
        it('should have 5 admin tools', async () => {
            expect(Object.keys(ADMIN_TOOLS).length).toBe(5);
        });

        it('should all be admin permission', async () => {
            for (const tool of Object.values(ADMIN_TOOLS)) {
                expect(tool.permission).toBe('admin');
            }
        });

        it('should all require auth', async () => {
            for (const tool of Object.values(ADMIN_TOOLS)) {
                expect(tool.requiresAuth).toBe(true);
            }
        });

        it('should have rate limits', async () => {
            for (const tool of Object.values(ADMIN_TOOLS)) {
                expect(tool.rateLimit).toBeDefined();
            }
        });
    });
});
