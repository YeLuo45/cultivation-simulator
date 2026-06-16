/**
 * CultivationMCPReadTools.js - 修真 MCP 只读工具集
 * V862 P-20260613-002 Iteration 4/30 Round 35 - Direction F: Read Tools
 *
 * 提供 5 类只读查询工具：player / realm / sect / npc / market
 * - 核心 API: registerAll / queryPlayer / queryRealm / querySect / queryNPC / queryMarket
 * - 数据结构: { name, handler, schema, permission, examples }
 * - 配置: READ_TOOLS
 */

import { CultivationMCPServer } from './CultivationMCPServer.js';
import { SchemaRegistry, ParamSpec } from './CultivationMCPSchema.js';

export const READ_TOOLS = {
    'player.query': {
        description: '查询玩家基础信息',
        permission: 'read',
        examples: [{ params: { playerId: 'p_001' } }],
    },
    'realm.state': {
        description: '查询修仙境界状态',
        permission: 'read',
        examples: [{ params: { playerId: 'p_001' } }],
    },
    'sect.info': {
        description: '查询宗门信息',
        permission: 'read',
        examples: [{ params: { sectId: 's_001' } }],
    },
    'npc.list': {
        description: '列出附近 NPC',
        permission: 'read',
        examples: [{ params: { region: 'mount_tai' } }],
    },
    'market.list': {
        description: '查询市场交易品',
        permission: 'read',
        examples: [{ params: { category: 'pill', minPrice: 100 } }],
    },
};

/**
 * PlayerQueryResult - 玩家查询结果
 */
class PlayerQueryResult {
    constructor({ playerId, name, realm, qi, spiritRoot, sectId, skills, inventory, lastActive }) {
        this.playerId = playerId;
        this.name = name;
        this.realm = realm;
        this.qi = qi;
        this.spiritRoot = spiritRoot;
        this.sectId = sectId;
        this.skills = skills || [];
        this.inventory = inventory || [];
        this.lastActive = lastActive || Date.now();
    }
    toJSON() { return { ...this }; }
}

/**
 * ReadToolset - 只读工具集合
 */
export class ReadToolset {
    constructor({ dataStore = null, schemaRegistry = null } = {}) {
        this.dataStore = dataStore || this._createDefaultDataStore();
        this.schemaRegistry = schemaRegistry || new SchemaRegistry();
        this.stats = { totalQueries: 0, cacheHits: 0, cacheMisses: 0, errors: 0 };
        this.cache = new Map();
        this.cacheMaxAge = 5000;
    }

    _createDefaultDataStore() {
        return {
            players: new Map(),
            realms: new Map(),
            sects: new Map(),
            npcs: new Map(),
            market: new Map(),
        };
    }

    registerAll(server) {
        this._registerPlayerQuery(server);
        this._registerRealmState(server);
        this._registerSectInfo(server);
        this._registerNPCList(server);
        this._registerMarketList(server);
        this._registerSchemas();
        return { success: true, tools: Object.keys(READ_TOOLS) };
    }

    _registerSchemas() {
        this.schemaRegistry.register('player.query', {
            description: READ_TOOLS['player.query'].description,
            parameters: [new ParamSpec({ name: 'playerId', type: 'string', required: true, description: '玩家ID' })],
            examples: READ_TOOLS['player.query'].examples,
            permission: 'read',
        });
        this.schemaRegistry.register('realm.state', {
            description: READ_TOOLS['realm.state'].description,
            parameters: [new ParamSpec({ name: 'playerId', type: 'string', required: true, description: '玩家ID' })],
            permission: 'read',
        });
        this.schemaRegistry.register('sect.info', {
            description: READ_TOOLS['sect.info'].description,
            parameters: [new ParamSpec({ name: 'sectId', type: 'string', required: true, description: '宗门ID' })],
            permission: 'read',
        });
        this.schemaRegistry.register('npc.list', {
            description: READ_TOOLS['npc.list'].description,
            parameters: [new ParamSpec({ name: 'region', type: 'string', required: true, description: '区域' })],
            permission: 'read',
        });
        this.schemaRegistry.register('market.list', {
            description: READ_TOOLS['market.list'].description,
            parameters: [
                new ParamSpec({ name: 'category', type: 'string', required: false, description: '物品分类' }),
                new ParamSpec({ name: 'minPrice', type: 'integer', required: false, description: '最低价格' }),
            ],
            permission: 'read',
        });
    }

    _registerPlayerQuery(server) {
        const handler = ({ playerId }) => {
            if (!playerId) return { error: 'MISSING_PLAYER_ID' };
            this.stats.totalQueries++;
            const cacheKey = `player:${playerId}`;
            const cached = this._getFromCache(cacheKey);
            if (cached) return cached;
            const player = this.dataStore.players.get(playerId);
            if (!player) {
                this.stats.errors++;
                return { error: 'PLAYER_NOT_FOUND', playerId };
            }
            const result = new PlayerQueryResult(player).toJSON();
            this._putInCache(cacheKey, result);
            return result;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('player.query', handler, { description: READ_TOOLS['player.query'].description, permission: 'read' });
        }
        return handler;
    }

    _registerRealmState(server) {
        const handler = ({ playerId }) => {
            if (!playerId) return { error: 'MISSING_PLAYER_ID' };
            this.stats.totalQueries++;
            const cacheKey = `realm:${playerId}`;
            const cached = this._getFromCache(cacheKey);
            if (cached) return cached;
            const realm = this.dataStore.realms.get(playerId);
            if (!realm) {
                this.stats.errors++;
                return { error: 'REALM_NOT_FOUND', playerId };
            }
            const result = { ...realm, queriedAt: Date.now() };
            this._putInCache(cacheKey, result);
            return result;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('realm.state', handler, { description: READ_TOOLS['realm.state'].description, permission: 'read' });
        }
        return handler;
    }

    _registerSectInfo(server) {
        const handler = ({ sectId }) => {
            if (!sectId) return { error: 'MISSING_SECT_ID' };
            this.stats.totalQueries++;
            const cacheKey = `sect:${sectId}`;
            const cached = this._getFromCache(cacheKey);
            if (cached) return cached;
            const sect = this.dataStore.sects.get(sectId);
            if (!sect) {
                this.stats.errors++;
                return { error: 'SECT_NOT_FOUND', sectId };
            }
            const result = { ...sect, queriedAt: Date.now() };
            this._putInCache(cacheKey, result);
            return result;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('sect.info', handler, { description: READ_TOOLS['sect.info'].description, permission: 'read' });
        }
        return handler;
    }

    _registerNPCList(server) {
        const handler = ({ region }) => {
            if (!region) return { error: 'MISSING_REGION' };
            this.stats.totalQueries++;
            const cacheKey = `npc:${region}`;
            const cached = this._getFromCache(cacheKey);
            if (cached) return cached;
            const npcs = Array.from(this.dataStore.npcs.values()).filter(n => n.region === region);
            const result = { region, count: npcs.length, npcs: npcs.map(n => ({ npcId: n.npcId, name: n.name, faction: n.faction, attitude: n.attitude })) };
            this._putInCache(cacheKey, result);
            return result;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('npc.list', handler, { description: READ_TOOLS['npc.list'].description, permission: 'read' });
        }
        return handler;
    }

    _registerMarketList(server) {
        const handler = ({ category, minPrice = 0 } = {}) => {
            this.stats.totalQueries++;
            const cacheKey = `market:${category || 'all'}:${minPrice}`;
            const cached = this._getFromCache(cacheKey);
            if (cached) return cached;
            const items = Array.from(this.dataStore.market.values()).filter(item => {
                if (category && item.category !== category) return false;
                if (item.price < minPrice) return false;
                return true;
            });
            const result = { category: category || 'all', minPrice, count: items.length, items: items.slice(0, 50) };
            this._putInCache(cacheKey, result);
            return result;
        };
        if (server instanceof CultivationMCPServer) {
            server.registerMethod('market.list', handler, { description: READ_TOOLS['market.list'].description, permission: 'read' });
        }
        return handler;
    }

    _getFromCache(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.cacheMisses++;
            return null;
        }
        if (Date.now() - entry.timestamp > this.cacheMaxAge) {
            this.cache.delete(key);
            this.stats.cacheMisses++;
            return null;
        }
        this.stats.cacheHits++;
        return entry.value;
    }

    _putInCache(key, value) {
        this.cache.set(key, { value, timestamp: Date.now() });
    }

    clearCache() {
        this.cache.clear();
        return { success: true, cleared: true };
    }

    seedTestData() {
        this.dataStore.players.set('p_001', {
            playerId: 'p_001', name: '李青云', realm: '筑基', qi: 1200, spiritRoot: '天灵根', sectId: 's_qingyun', skills: ['御剑术', '九天神雷'], inventory: ['飞剑', '回灵丹'],
        });
        this.dataStore.realms.set('p_001', { playerId: 'p_001', level: '筑基', progress: 0.45, nextMilestone: '金丹', tribulationsCleared: 0 });
        this.dataStore.sects.set('s_qingyun', { sectId: 's_qingyun', name: '青云宗', sectMaster: '青云子', memberCount: 128, reputation: 850 });
        this.dataStore.npcs.set('n_001', { npcId: 'n_001', name: '王药师', region: 'mount_tai', faction: '青云宗', attitude: 'friendly' });
        this.dataStore.npcs.set('n_002', { npcId: 'n_002', name: '剑痴', region: 'mount_tai', faction: '游侠', attitude: 'neutral' });
        this.dataStore.market.set('m_001', { itemId: 'm_001', name: '回灵丹', category: 'pill', price: 100, stock: 50 });
        this.dataStore.market.set('m_002', { itemId: 'm_002', name: '天外陨铁', category: 'ore', price: 5000, stock: 3 });
        return { success: true };
    }

    getStats() { return { ...this.stats, cacheSize: this.cache.size, dataStoreSize: this._dataStoreTotal() }; }

    _dataStoreTotal() {
        let total = 0;
        for (const map of Object.values(this.dataStore)) total += map.size;
        return total;
    }

    toJSON() { return { stats: this.stats, cacheSize: this.cache.size, dataStoreCounts: Object.fromEntries(Object.entries(this.dataStore).map(([k, v]) => [k, v.size])) }; }
    fromJSON(data) {
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        return { success: true };
    }
}

export default ReadToolset;
