/**
 * CultivationMCPReadTools.test.js - Read 权限工具测试
 * V862 Iteration 4/30 Round 35 - Direction F
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ReadToolset, READ_TOOLS } from '../../../systems/ai/CultivationMCPReadTools.js';
import { CultivationMCPServer } from '../../../systems/ai/CultivationMCPServer.js';
import { SchemaRegistry } from '../../../systems/ai/CultivationMCPSchema.js';

describe('CultivationMCPReadTools', () => {
    let toolset, server;
    beforeEach(() => {
        toolset = new ReadToolset();
        server = new CultivationMCPServer();
        toolset.seedTestData();
    });

    describe('ReadToolset construction', () => {
        it('should create with default data store', () => {
            const t = new ReadToolset();
            expect(t.dataStore.players).toBeInstanceOf(Map);
            expect(t.dataStore.realms).toBeInstanceOf(Map);
        });

        it('should accept custom data store', () => {
            const custom = { players: new Map(), realms: new Map(), sects: new Map(), npcs: new Map(), market: new Map() };
            const t = new ReadToolset({ dataStore: custom });
            expect(t.dataStore).toBe(custom);
        });

        it('should accept custom schema registry', () => {
            const reg = new SchemaRegistry();
            const t = new ReadToolset({ schemaRegistry: reg });
            expect(t.schemaRegistry).toBe(reg);
        });
    });

    describe('registerAll', () => {
        it('should register all 5 read tools', () => {
            const r = toolset.registerAll(server);
            expect(r.success).toBe(true);
            expect(r.tools.length).toBe(5);
            expect(server.listMethods()).toContain('player.query');
            expect(server.listMethods()).toContain('realm.state');
            expect(server.listMethods()).toContain('sect.info');
            expect(server.listMethods()).toContain('npc.list');
            expect(server.listMethods()).toContain('market.list');
        });

        it('should register schemas', () => {
            toolset.registerAll(server);
            expect(toolset.schemaRegistry.count()).toBeGreaterThanOrEqual(5);
        });
    });

    describe('player.query', () => {
        beforeEach(() => toolset.registerAll(server));

        it('should return player info', () => {
            const r = toolset.dataStore.players.get('p_001');
            expect(r).toBeDefined();
        });

        it('should call via JSON-RPC', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'player.query', params: { playerId: 'p_001' } });
            expect(r.result.name).toBe('李青云');
            expect(r.result.realm).toBe('筑基');
        });

        it('should reject missing playerId', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'player.query', params: {} });
            expect(r.result.error).toBe('MISSING_PLAYER_ID');
        });

        it('should return not found for unknown player', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'player.query', params: { playerId: 'p_999' } });
            expect(r.result.error).toBe('PLAYER_NOT_FOUND');
            expect(toolset.stats.errors).toBe(1);
        });

        it('should cache results', () => {
            server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'player.query', params: { playerId: 'p_001' } });
            server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'player.query', params: { playerId: 'p_001' } });
            expect(toolset.stats.cacheMisses).toBe(1);
            expect(toolset.stats.cacheHits).toBe(1);
        });
    });

    describe('realm.state', () => {
        beforeEach(() => toolset.registerAll(server));

        it('should return realm state', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'realm.state', params: { playerId: 'p_001' } });
            expect(r.result.level).toBe('筑基');
            expect(r.result.progress).toBe(0.45);
        });

        it('should reject missing playerId', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'realm.state', params: {} });
            expect(r.result.error).toBe('MISSING_PLAYER_ID');
        });

        it('should return not found', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'realm.state', params: { playerId: 'p_unknown' } });
            expect(r.result.error).toBe('REALM_NOT_FOUND');
        });
    });

    describe('sect.info', () => {
        beforeEach(() => toolset.registerAll(server));

        it('should return sect info', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'sect.info', params: { sectId: 's_qingyun' } });
            expect(r.result.name).toBe('青云宗');
            expect(r.result.memberCount).toBe(128);
        });

        it('should reject missing sectId', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'sect.info', params: {} });
            expect(r.result.error).toBe('MISSING_SECT_ID');
        });

        it('should return not found', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'sect.info', params: { sectId: 's_unknown' } });
            expect(r.result.error).toBe('SECT_NOT_FOUND');
        });
    });

    describe('npc.list', () => {
        beforeEach(() => toolset.registerAll(server));

        it('should list NPCs in region', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'npc.list', params: { region: 'mount_tai' } });
            expect(r.result.count).toBe(2);
            expect(r.result.npcs[0].name).toBe('王药师');
        });

        it('should return empty for unknown region', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'npc.list', params: { region: 'desert' } });
            expect(r.result.count).toBe(0);
        });

        it('should reject missing region', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'npc.list', params: {} });
            expect(r.result.error).toBe('MISSING_REGION');
        });
    });

    describe('market.list', () => {
        beforeEach(() => toolset.registerAll(server));

        it('should list all market items', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'market.list', params: {} });
            expect(r.result.count).toBe(2);
        });

        it('should filter by category', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'market.list', params: { category: 'pill' } });
            expect(r.result.count).toBe(1);
            expect(r.result.items[0].name).toBe('回灵丹');
        });

        it('should filter by minPrice', () => {
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'market.list', params: { minPrice: 1000 } });
            expect(r.result.count).toBe(1);
        });

        it('should limit to 50 items', () => {
            for (let i = 0; i < 60; i++) {
                toolset.dataStore.market.set(`m_${i}`, { itemId: `m_${i}`, name: `Item ${i}`, category: 'misc', price: 10, stock: 1 });
            }
            const r = server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'market.list', params: {} });
            expect(r.result.items.length).toBe(50);
        });
    });

    describe('cache', () => {
        it('should expire cache after maxAge', async () => {
            const t = new ReadToolset();
            t.cacheMaxAge = 10;
            t.seedTestData();
            t.registerAll(server);
            server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'player.query', params: { playerId: 'p_001' } });
            await new Promise(r => setTimeout(r, 20));
            server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'player.query', params: { playerId: 'p_001' } });
            expect(t.stats.cacheMisses).toBe(2);
        });

        it('should clear cache', () => {
            toolset.registerAll(server);
            server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'player.query', params: { playerId: 'p_001' } });
            const r = toolset.clearCache();
            expect(r.success).toBe(true);
            expect(toolset.cache.size).toBe(0);
        });
    });

    describe('seedTestData', () => {
        it('should seed all data stores', () => {
            const t = new ReadToolset();
            t.seedTestData();
            expect(t.dataStore.players.size).toBeGreaterThan(0);
            expect(t.dataStore.realms.size).toBeGreaterThan(0);
            expect(t.dataStore.sects.size).toBeGreaterThan(0);
            expect(t.dataStore.npcs.size).toBeGreaterThan(0);
            expect(t.dataStore.market.size).toBeGreaterThan(0);
        });
    });

    describe('stats / serialization', () => {
        it('should report stats', () => {
            const s = toolset.getStats();
            expect(s.dataStoreSize).toBeGreaterThan(0);
        });

        it('should serialize', () => {
            const j = toolset.toJSON();
            expect(j.stats).toBeDefined();
        });

        it('should restore', () => {
            const j = toolset.toJSON();
            const t2 = new ReadToolset();
            const r = t2.fromJSON(j);
            expect(r.success).toBe(true);
        });
    });

    describe('READ_TOOLS constant', () => {
        it('should have 5 read tools', () => {
            expect(Object.keys(READ_TOOLS).length).toBe(5);
        });

        it('should all be read permission', () => {
            for (const tool of Object.values(READ_TOOLS)) {
                expect(tool.permission).toBe('read');
            }
        });

        it('should all have descriptions', () => {
            for (const tool of Object.values(READ_TOOLS)) {
                expect(tool.description).toBeTruthy();
            }
        });
    });
});
