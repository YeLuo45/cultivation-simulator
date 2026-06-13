/**
 * TreasureMapSystem.js - 藏宝图系统
 * V331 Iteration 1/9 Round 6 - Treasure Map System
 *
 * 融合6大设计系统:
 * - generic-agent: 藏宝图自进化 (richer over time)
 * - chatdev: 探险角色协调
 * - nanobot: 藏宝线索mesh
 * - claude-code: 藏宝分析工具
 * - thunderbolt: 藏宝图状态持久化
 * - ruflo: 藏宝Hook事件
 */

export class TreasureMapSystem {
    constructor(config = {}) {
        this.config = {
            maxMaps: config.maxMaps || 100,
            baseRarity: config.baseRarity || 'common',
            ...config
        };
        this.maps = new Map();
        this.clues = new Map();
        this.discoveries = new Map();
        this.explorers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMaps: 0, totalDiscovered: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
        for (const r of rarities) this.config[`${r}Chance`] = this.config[`${r}Chance`] || (r === 'common' ? 0.5 : r === 'rare' ? 0.3 : r === 'epic' ? 0.15 : r === 'legendary' ? 0.04 : 0.01);
    }

    _registerDefaultTools() {
        this.registerTool('getMap', (ctx) => this.getMap(ctx.mapId));
        this.registerTool('listMaps', () => Array.from(this.maps.values()).map(m => ({...m})));
        this.registerTool('getClue', (ctx) => this.getClue(ctx.clueId));
    }

    registerExplorer(data) {
        const id = data.id || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const explorer = { explorerId: id, name: data.name || 'Unnamed', luck: data.luck || 0.5, experience: 0, level: 1 };
        this.explorers.set(id, explorer);
        return { success: true, explorer };
    }

    getExplorer(id) { return this.explorers.get(id) ? { ...this.explorers.get(id) } : null; }
    listExplorers() { return Array.from(this.explorers.values()).map(e => ({ ...e })); }

    generateMap(data) {
        const id = data.id || `map_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rarity = this._rollRarity();
        const map = {
            mapId: id,
            name: data.name || `Map ${Date.now()}`,
            rarity,
            region: data.region || 'unknown',
            clues: [],
            treasures: [],
            createdBy: data.createdBy || 'system',
            createdAt: Date.now(),
            discovered: false
        };
        this.maps.set(id, map);
        this.stats.totalMaps++;
        this._triggerHook('mapGenerated', { mapId: id, rarity });
        return { success: true, map };
    }

    _rollRarity() {
        const r = Math.random();
        let cumulative = 0;
        const order = ['common', 'rare', 'epic', 'legendary', 'mythic'];
        for (const rarity of order) {
            cumulative += this.config[`${rarity}Chance`] || 0;
            if (r < cumulative) return rarity;
        }
        return 'common';
    }

    getMap(id) { return this.maps.get(id) ? { ...this.maps.get(id) } : null; }
    listMaps() { return Array.from(this.maps.values()).map(m => ({ ...m })); }
    listMapsByRarity(rarity) { return Array.from(this.maps.values()).filter(m => m.rarity === rarity).map(m => ({ ...m })); }

    addClue(mapId, clueData) {
        const map = this.maps.get(mapId);
        if (!map) return { success: false, error: 'MAP_NOT_FOUND' };
        const clueId = `cl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const clue = {
            clueId, mapId,
            text: clueData.text || 'mysterious hint',
            difficulty: clueData.difficulty || 1,
            region: clueData.region || map.region,
            addedAt: Date.now()
        };
        this.clues.set(clueId, clue);
        map.clues.push(clueId);
        this._triggerHook('clueAdded', { mapId, clueId });
        return { success: true, clue };
    }

    getClue(id) { return this.clues.get(id) ? { ...this.clues.get(id) } : null; }
    listClues(mapId) {
        if (mapId) return Array.from(this.clues.values()).filter(c => c.mapId === mapId).map(c => ({ ...c }));
        return Array.from(this.clues.values()).map(c => ({ ...c }));
    }

    discoverTreasure(mapId, explorerId) {
        const map = this.maps.get(mapId);
        if (!map) return { success: false, error: 'MAP_NOT_FOUND' };
        const explorer = this.explorers.get(explorerId);
        if (!explorer) return { success: false, error: 'EXPLORER_NOT_FOUND' };
        if (map.discovered) return { success: false, error: 'ALREADY_DISCOVERED' };
        map.discovered = true;
        const discoveryId = `disc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const treasureCount = Math.floor(Math.random() * (this._rarityBonus(map.rarity) + 1)) + 1;
        const discovery = {
            discoveryId, mapId, explorerId,
            treasures: Array.from({ length: treasureCount }, (_, i) => ({
                index: i, value: Math.floor(Math.random() * 100 * this._rarityBonus(map.rarity)) + 10
            })),
            discoveredAt: Date.now()
        };
        this.discoveries.set(discoveryId, discovery);
        this.stats.totalDiscovered++;
        explorer.experience += 50;
        explorer.level = 1 + Math.floor(explorer.experience / 100);
        this._triggerHook('treasureDiscovered', { mapId, discoveryId, treasureCount });
        return { success: true, discovery };
    }

    _rarityBonus(rarity) {
        const bonuses = { common: 1, rare: 2, epic: 4, legendary: 8, mythic: 16 };
        return bonuses[rarity] || 1;
    }

    getDiscovery(id) { return this.discoveries.get(id) ? { ...this.discoveries.get(id) } : null; }
    listDiscoveries() { return Array.from(this.discoveries.values()).map(d => ({ ...d })); }
    listDiscoveriesByExplorer(explorerId) {
        return Array.from(this.discoveries.values()).filter(d => d.explorerId === explorerId).map(d => ({ ...d }));
    }

    deleteMap(mapId) {
        if (!this.maps.has(mapId)) return { success: false, error: 'MAP_NOT_FOUND' };
        this.maps.delete(mapId);
        for (const [cid, c] of this.clues) {
            if (c.mapId === mapId) this.clues.delete(cid);
        }
        this._triggerHook('mapDeleted', { mapId });
        return { success: true };
    }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalMaps < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        for (const rarity of ['rare', 'epic', 'legendary', 'mythic']) {
            this.config[`${rarity}Chance`] = (this.config[`${rarity}Chance`] || 0) + 0.05;
        }
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            maps: Array.from(this.maps.entries()),
            clues: Array.from(this.clues.entries()),
            discoveries: Array.from(this.discoveries.entries()),
            explorers: Array.from(this.explorers.entries()),
            stats: this.stats, config: this.config
        };
    }
    fromJSON(data) {
        if (data.maps) this.maps = new Map(data.maps);
        if (data.clues) this.clues = new Map(data.clues);
        if (data.discoveries) this.discoveries = new Map(data.discoveries);
        if (data.explorers) this.explorers = new Map(data.explorers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() {
        return { ...this.stats, mapCount: this.maps.size, clueCount: this.clues.size, discoveryCount: this.discoveries.size };
    }
}