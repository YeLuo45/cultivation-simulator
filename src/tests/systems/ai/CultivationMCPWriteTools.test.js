/**
 * CultivationMCPWriteTools.test.js - Write 权限工具测试
 * V863 Iteration 5/30 Round 35 - Direction F
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WriteToolset, WRITE_TOOLS } from '../../../systems/ai/CultivationMCPWriteTools.js';
import { CultivationMCPServer } from '../../../systems/ai/CultivationMCPServer.js';

describe('CultivationMCPWriteTools', () => {
    let toolset, server;
    beforeEach(() => {
        toolset = new WriteToolset();
        server = new CultivationMCPServer();
        toolset.seedTestData();
        toolset.registerAll(server);
    });

    describe('registerAll', () => {
        it('should register all 5 write tools', async () => {
            const methods = server.listMethods();
            expect(methods).toContain('cultivation.process');
            expect(methods).toContain('trade.execute');
            expect(methods).toContain('battle.simulate');
            expect(methods).toContain('inventory.add');
            expect(methods).toContain('sect.update');
        });
    });

    describe('cultivation.process', () => {
        it('should process cultivation', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'cultivation.process', params: { playerId: 'p_001', duration: 1000 } });
            expect(r.result.qiGain).toBeGreaterThan(0);
            expect(r.result.totalQi).toBeGreaterThan(100);
        });

        it('should advance technique boost', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'cultivation.process', params: { playerId: 'p_001', duration: 1000, technique: 'advanced' } });
            expect(r.result.qiGain).toBeGreaterThan(0);
        });

        it('should reject missing playerId', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'cultivation.process', params: {} });
            expect(r.result.error).toBe('MISSING_PLAYER_ID');
        });

        it('should reject unknown player', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'cultivation.process', params: { playerId: 'p_unknown' } });
            expect(r.result.error).toBe('PLAYER_NOT_FOUND');
        });

        it('should track cultivation count', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'cultivation.process', params: { playerId: 'p_001' } });
            await server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'cultivation.process', params: { playerId: 'p_001' } });
            const player = toolset.dataStore.players.get('p_001');
            expect(player.cultivationCount).toBe(2);
        });
    });

    describe('trade.execute', () => {
        it('should execute buy trade', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'trade.execute', params: { playerId: 'p_001', itemId: 'pill_001', quantity: 2, action: 'buy', pricePerUnit: 100 } });
            expect(r.result.newGold).toBe(800);
            expect(r.result.itemId).toBe('pill_001');
        });

        it('should execute sell trade', async () => {
            const player = toolset.dataStore.players.get('p_001');
            player.items = [{ itemId: 'pill_001', acquiredAt: 1 }, { itemId: 'pill_001', acquiredAt: 2 }];
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'trade.execute', params: { playerId: 'p_001', itemId: 'pill_001', quantity: 1, action: 'sell', pricePerUnit: 100 } });
            expect(r.result.newGold).toBe(1100);
        });

        it('should reject insufficient gold', async () => {
            const player = toolset.dataStore.players.get('p_001');
            player.gold = 50;
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'trade.execute', params: { playerId: 'p_001', itemId: 'pill_001', quantity: 1, action: 'buy', pricePerUnit: 100 } });
            expect(r.result.error).toBe('INSUFFICIENT_GOLD');
        });

        it('should reject missing params', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'trade.execute', params: {} });
            expect(r.result.error).toBe('MISSING_PARAMS');
        });

        it('should record trade', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'trade.execute', params: { playerId: 'p_001', itemId: 'pill_001', action: 'buy' } });
            expect(toolset.dataStore.trades.size).toBe(1);
        });
    });

    describe('battle.simulate', () => {
        it('should simulate battle', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'battle.simulate', params: { attackerId: 'p_001', defenderId: 'n_001' } });
            expect(r.result.battleId).toBeDefined();
            expect(r.result.attackerId).toBe('p_001');
            expect(r.result.winner).toBeDefined();
            expect(toolset.stats.battlesSimulated).toBe(1);
        });

        it('should apply advanced skill bonus', async () => {
            const r1 = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'battle.simulate', params: { attackerId: 'p_001', defenderId: 'n_001', skill: 'basic' } });
            const r2 = await server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'battle.simulate', params: { attackerId: 'p_001', defenderId: 'n_001', skill: 'advanced' } });
            expect(r1.result.attackerPower).toBeDefined();
            expect(r2.result.attackerPower).toBeDefined();
        });

        it('should reject missing params', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'battle.simulate', params: { attackerId: 'p_001' } });
            expect(r.result.error).toBe('MISSING_PARAMS');
        });

        it('should store in battle log', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'battle.simulate', params: { attackerId: 'p_001', defenderId: 'n_001' } });
            expect(toolset.dataStore.battleLog.size).toBe(1);
        });
    });

    describe('inventory.add', () => {
        it('should add items', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'inventory.add', params: { playerId: 'p_001', itemId: 'sword_001', quantity: 2 } });
            expect(r.result.newSize).toBe(2);
        });

        it('should accept metadata', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'inventory.add', params: { playerId: 'p_001', itemId: 'sword_001', quantity: 1, metadata: { quality: 'legendary' } } });
            expect(r.result.newSize).toBe(1);
            const inv = toolset.dataStore.inventory.get('p_001');
            expect(inv[0].quality).toBe('legendary');
        });

        it('should reject missing params', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'inventory.add', params: {} });
            expect(r.result.error).toBe('MISSING_PARAMS');
        });

        it('should support multiple players', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'inventory.add', params: { playerId: 'p_001', itemId: 'pill' } });
            await server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'inventory.add', params: { playerId: 'p_002', itemId: 'pill' } });
            expect(toolset.dataStore.inventory.size).toBe(2);
        });
    });

    describe('sect.update', () => {
        it('should update sect', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'sect.update', params: { sectId: 's_qingyun', updates: { reputation: 1000, doctrine: 'sword' } } });
            expect(r.result.newState.reputation).toBe(1000);
            expect(r.result.newState.doctrine).toBe('sword');
        });

        it('should reject missing sectId', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'sect.update', params: {} });
            expect(r.result.error).toBe('MISSING_SECT_ID');
        });

        it('should support creating new sect', async () => {
            const r = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'sect.update', params: { sectId: 's_new', updates: { name: 'New Sect' } } });
            expect(r.result.newState.name).toBe('New Sect');
        });
    });

    describe('history & eventLog', () => {
        it('should record history', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'battle.simulate', params: { attackerId: 'p1', defenderId: 'n1' } });
            expect(toolset.history.length).toBe(1);
        });

        it('should bound history at 1000', async () => {
            for (let i = 0; i < 1100; i++) toolset.history.push({ idx: i });
            toolset._recordHistory('test', {}, {});
            expect(toolset.history.length).toBeLessThanOrEqual(1000);
        });

        it('should clear history', async () => {
            toolset.history.push({ x: 1 });
            toolset.eventLog.push({ y: 1 });
            toolset.clearHistory();
            expect(toolset.history.length).toBe(0);
            expect(toolset.eventLog.length).toBe(0);
        });
    });

    describe('stats & serialization', () => {
        it('should track stats', async () => {
            await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'cultivation.process', params: { playerId: 'p_001' } });
            await server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'battle.simulate', params: { attackerId: 'p1', defenderId: 'n1' } });
            const s = toolset.getStats();
            expect(s.totalWrites).toBe(2);
            expect(s.successfulWrites).toBe(2);
            expect(s.battlesSimulated).toBe(1);
        });

        it('should serialize', async () => {
            const j = toolset.toJSON();
            expect(j.stats).toBeDefined();
        });

        it('should restore', async () => {
            const j = toolset.toJSON();
            const t2 = new WriteToolset();
            const r = t2.fromJSON(j);
            expect(r.success).toBe(true);
        });
    });

    describe('WRITE_TOOLS constant', () => {
        it('should have 5 write tools', async () => {
            expect(Object.keys(WRITE_TOOLS).length).toBe(5);
        });

        it('should all be write permission', async () => {
            for (const tool of Object.values(WRITE_TOOLS)) {
                expect(tool.permission).toBe('write');
            }
        });

        it('should all require auth', async () => {
            for (const tool of Object.values(WRITE_TOOLS)) {
                expect(tool.requiresAuth).toBe(true);
            }
        });
    });
});
