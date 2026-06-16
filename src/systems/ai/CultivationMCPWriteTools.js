/**
 * CultivationMCPWriteTools.js - 修真 MCP 写入工具集
 * V863 P-20260613-002 Iteration 5/30 Round 35 - Direction F: Write Tools
 *
 * 提供 5 类写入操作：cultivation / trade / battle / inventory / sect
 * - 核心 API: registerAll / processCultivation / executeTrade / simulateBattle / addInventory / updateSect
 * - 数据结构: { name, handler, schema, permission, requiresAuth, transaction }
 * - 配置: WRITE_TOOLS
 */

import { CultivationMCPServer } from './CultivationMCPServer.js';
import { ParamSpec } from './CultivationMCPSchema.js';

export const WRITE_TOOLS = {
    'cultivation.process': {
        description: '触发一次修炼动作',
        permission: 'write',
        requiresAuth: true,
        transactional: true,
    },
    'trade.execute': {
        description: '执行一次交易',
        permission: 'write',
        requiresAuth: true,
        transactional: true,
    },
    'battle.simulate': {
        description: '模拟一次战斗',
        permission: 'write',
        requiresAuth: true,
        transactional: false,
    },
    'inventory.add': {
        description: '添加物品到背包',
        permission: 'write',
        requiresAuth: true,
        transactional: true,
    },
    'sect.update': {
        description: '更新宗门信息',
        permission: 'write',
        requiresAuth: true,
        transactional: true,
    },
};

/**
 * Transaction - 事务封装（带回滚）
 */
class Transaction {
    constructor(id) {
        this.id = id || `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        this.operations = [];
        this.rollbackOps = [];
        this.committed = false;
        this.rolledBack = false;
        this.createdAt = Date.now();
    }
    add(op, rollback) {
        this.operations.push(op);
        this.rollbackOps.push(rollback);
    }
    async commit() {
        const results = [];
        for (let i = 0; i < this.operations.length; i++) {
            try {
                const r = await this.operations[i]();
                results.push({ success: true, result: r });
            } catch (e) {
                // 回滚
                for (let j = i - 1; j >= 0; j--) {
                    try { await this.rollbackOps[j](); } catch (re) {}
                }
                this.rolledBack = true;
                return { success: false, error: e.message, rolledBack: true };
            }
        }
        this.committed = true;
        return { success: true, results };
    }
}

/**
 * WriteToolset - 写入工具集合
 */
export class WriteToolset {
    constructor({ dataStore = null, history = null } = {}) {
        this.dataStore = dataStore || {
            players: new Map(),
            inventory: new Map(),
            transactions: new Map(),
            battleLog: new Map(),
            trades: new Map(),
        };
        this.history = history || [];
        this.stats = {
            totalWrites: 0,
            successfulWrites: 0,
            failedWrites: 0,
            transactionsRolledBack: 0,
            battlesSimulated: 0,
        };
        this.eventLog = [];
    }

    registerAll(server) {
        this._registerCultivationProcess(server);
        this._registerTradeExecute(server);
        this._registerBattleSimulate(server);
        this._registerInventoryAdd(server);
        this._registerSectUpdate(server);
        return { success: true, tools: Object.keys(WRITE_TOOLS) };
    }

    _recordHistory(tool, params, result) {
        this.history.push({ tool, params, result, timestamp: Date.now() });
        while (this.history.length > 1000) this.history.shift();
    }

    _logEvent(event, data) {
        this.eventLog.push({ event, data, timestamp: Date.now() });
        if (this.eventLog.length > 500) this.eventLog.shift();
    }

    _registerCultivationProcess(server) {
        const handler = async ({ playerId, duration = 1000, technique = 'basic' } = {}) => {
            if (!playerId) return { error: 'MISSING_PLAYER_ID' };
            this.stats.totalWrites++;
            const tx = new Transaction(`cultivation_${playerId}_${Date.now()}`);

            // 获取玩家
            const player = this.dataStore.players.get(playerId);
            if (!player) { this.stats.failedWrites++; return { error: 'PLAYER_NOT_FOUND' }; }

            // 事务：增加灵气
            const previousQi = player.qi || 0;
            const qiGain = Math.floor(duration / 10) * (technique === 'advanced' ? 2 : 1);
            tx.add(
                async () => { player.qi = previousQi + qiGain; return { qiGain, totalQi: player.qi }; },
                async () => { player.qi = previousQi; }
            );

            // 事务：记录修炼次数
            const previousCultivationCount = player.cultivationCount || 0;
            tx.add(
                async () => { player.cultivationCount = previousCultivationCount + 1; return { count: player.cultivationCount }; },
                async () => { player.cultivationCount = previousCultivationCount; }
            );

            const result = await tx.commit();
            if (result.success) {
                this.stats.successfulWrites++;
                const r = { playerId, qiGain, totalQi: player.qi, cultivationCount: player.cultivationCount, technique, duration, transactionId: tx.id };
                this._recordHistory('cultivation.process', { playerId, duration, technique }, r);
                this._logEvent('cultivation', r);
                return r;
            } else {
                this.stats.transactionsRolledBack++;
                this.stats.failedWrites++;
                return { error: 'TRANSACTION_FAILED', reason: result.error };
            }
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('cultivation.process', handler, { description: WRITE_TOOLS['cultivation.process'].description, permission: 'write' });
        }
        return handler;
    }

    _registerTradeExecute(server) {
        const handler = async ({ playerId, itemId, quantity = 1, action = 'buy', pricePerUnit } = {}) => {
            if (!playerId || !itemId) return { error: 'MISSING_PARAMS' };
            this.stats.totalWrites++;
            const tx = new Transaction(`trade_${playerId}_${Date.now()}`);

            const player = this.dataStore.players.get(playerId);
            if (!player) { this.stats.failedWrites++; return { error: 'PLAYER_NOT_FOUND' }; }

            const totalCost = (pricePerUnit || 100) * quantity;
            const previousGold = player.gold || 0;
            const previousItems = (player.items || []).slice();

            if (action === 'buy' && previousGold < totalCost) {
                this.stats.failedWrites++;
                return { error: 'INSUFFICIENT_GOLD', required: totalCost, available: previousGold };
            }

            tx.add(
                async () => {
                    player.gold = action === 'buy' ? previousGold - totalCost : previousGold + totalCost;
                    if (!player.items) player.items = [];
                    if (action === 'buy') {
                        for (let i = 0; i < quantity; i++) player.items.push({ itemId, acquiredAt: Date.now() });
                    } else {
                        let removed = 0;
                        player.items = player.items.filter(it => { if (it.itemId === itemId && removed < quantity) { removed++; return false; } return true; });
                    }
                    return { newGold: player.gold, newItemCount: player.items.length };
                },
                async () => { player.gold = previousGold; player.items = previousItems; }
            );

            const result = await tx.commit();
            if (result.success) {
                this.stats.successfulWrites++;
                this.dataStore.trades.set(`trade_${tx.id}`, { playerId, itemId, quantity, action, totalCost, at: Date.now() });
                const r = { playerId, itemId, quantity, action, totalCost, newGold: player.gold, transactionId: tx.id };
                this._recordHistory('trade.execute', { playerId, itemId, quantity, action, pricePerUnit }, r);
                this._logEvent('trade', r);
                return r;
            } else {
                this.stats.transactionsRolledBack++;
                this.stats.failedWrites++;
                return { error: 'TRANSACTION_FAILED', reason: result.error };
            }
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('trade.execute', handler, { description: WRITE_TOOLS['trade.execute'].description, permission: 'write' });
        }
        return handler;
    }

    _registerBattleSimulate(server) {
        const handler = async ({ attackerId, defenderId, skill = 'basic' } = {}) => {
            if (!attackerId || !defenderId) return { error: 'MISSING_PARAMS' };
            this.stats.totalWrites++;
            this.stats.battlesSimulated++;
            const attackerPower = 100 + Math.floor(Math.random() * 200);
            const defenderDefense = 80 + Math.floor(Math.random() * 200);
            const damage = Math.max(0, attackerPower - defenderDefense + (skill === 'advanced' ? 50 : 0));
            const winner = damage > 50 ? attackerId : defenderId;
            const battle = { battleId: `battle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, attackerId, defenderId, skill, attackerPower, defenderDefense, damage, winner, simulatedAt: Date.now() };
            this.dataStore.battleLog.set(battle.battleId, battle);
            this.stats.successfulWrites++;
            this._recordHistory('battle.simulate', { attackerId, defenderId, skill }, battle);
            this._logEvent('battle', battle);
            return battle;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('battle.simulate', handler, { description: WRITE_TOOLS['battle.simulate'].description, permission: 'write' });
        }
        return handler;
    }

    _registerInventoryAdd(server) {
        const handler = async ({ playerId, itemId, quantity = 1, metadata = {} } = {}) => {
            if (!playerId || !itemId) return { error: 'MISSING_PARAMS' };
            this.stats.totalWrites++;
            const tx = new Transaction(`inv_add_${playerId}_${Date.now()}`);

            if (!this.dataStore.inventory.has(playerId)) this.dataStore.inventory.set(playerId, []);
            const inventory = this.dataStore.inventory.get(playerId);
            const previousSize = inventory.length;
            const addedItems = [];

            tx.add(
                async () => {
                    for (let i = 0; i < quantity; i++) {
                        const item = { itemId, acquiredAt: Date.now(), ...metadata };
                        inventory.push(item);
                        addedItems.push(item);
                    }
                    return { added: quantity, newSize: inventory.length };
                },
                async () => { for (const item of addedItems) { const idx = inventory.indexOf(item); if (idx >= 0) inventory.splice(idx, 1); } }
            );

            const result = await tx.commit();
            if (result.success) {
                this.stats.successfulWrites++;
                const r = { playerId, itemId, quantity, newSize: inventory.length };
                this._recordHistory('inventory.add', { playerId, itemId, quantity, metadata }, r);
                this._logEvent('inventory_add', r);
                return r;
            } else {
                this.stats.transactionsRolledBack++;
                this.stats.failedWrites++;
                return { error: 'TRANSACTION_FAILED' };
            }
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('inventory.add', handler, { description: WRITE_TOOLS['inventory.add'].description, permission: 'write' });
        }
        return handler;
    }

    _registerSectUpdate(server) {
        const handler = async ({ sectId, updates = {} } = {}) => {
            if (!sectId) return { error: 'MISSING_SECT_ID' };
            this.stats.totalWrites++;
            const tx = new Transaction(`sect_update_${sectId}_${Date.now()}`);

            if (!this.dataStore.players.has(`sect_${sectId}`)) this.dataStore.players.set(`sect_${sectId}`, { sectId, members: [], reputation: 0 });
            const sect = this.dataStore.players.get(`sect_${sectId}`);
            const previousState = { ...sect };

            tx.add(
                async () => {
                    for (const [k, v] of Object.entries(updates)) sect[k] = v;
                    return { updated: Object.keys(updates), sect };
                },
                async () => { Object.assign(sect, previousState); }
            );

            const result = await tx.commit();
            if (result.success) {
                this.stats.successfulWrites++;
                const r = { sectId, updated: Object.keys(updates), newState: sect };
                this._recordHistory('sect.update', { sectId, updates }, r);
                this._logEvent('sect_update', r);
                return r;
            } else {
                this.stats.transactionsRolledBack++;
                this.stats.failedWrites++;
                return { error: 'TRANSACTION_FAILED' };
            }
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('sect.update', handler, { description: WRITE_TOOLS['sect.update'].description, permission: 'write' });
        }
        return handler;
    }

    seedTestData() {
        this.dataStore.players.set('p_001', { playerId: 'p_001', name: '李青云', qi: 100, gold: 1000, items: [] });
        this.dataStore.players.set('sect_s_qingyun', { sectId: 's_qingyun', name: '青云宗', reputation: 800, members: [] });
        return { success: true };
    }

    getStats() { return { ...this.stats, historyLength: this.history.length, eventLogLength: this.eventLog.length }; }
    clearHistory() { this.history = []; this.eventLog = []; return { success: true }; }
    toJSON() { return { stats: this.stats, history: this.history.slice(-50), eventLog: this.eventLog.slice(-50) }; }
    fromJSON(data) {
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        return { success: true };
    }
}

export default WriteToolset;
