/**
 * CultivationDreamMythologyArchive.js - 修真神话典籍
 * V877 P-20260613-020 Iteration 20/30 Round 34
 *
 * 修真梦境系统：记录与解锁修真神话传说
 * - 核心 API: addMyth / queryArchive / unlockLegend
 * - 数据结构: { id, dreamId, mythType, title, content, unlocked }
 * - 配置: MYTH_TYPES, ARCHIVE_SECTIONS, LEGEND_TIERS
 */

export const MYTH_TYPES = ['creation', 'destruction', 'transformation'];
export const MYTH_TYPE_COUNT = 3;

export const ARCHIVE_SECTIONS = [
    '开天辟地',
    '洪荒纪元',
    '封神榜',
    '六道轮回',
    '飞升仙界',
];
export const ARCHIVE_SECTION_COUNT = 5;

export const LEGEND_TIERS = [
    { tier: 'mortal', name: '凡尘', unlockScore: 0.0 },
    { tier: 'earth', name: '地仙', unlockScore: 0.3 },
    { tier: 'heaven', name: '天仙', unlockScore: 0.6 },
    { tier: 'immortal', name: '真仙', unlockScore: 0.9 },
];
export const LEGEND_TIER_COUNT = 4;

export const DEFAULT_MAX_MYTHS = 200;
export const MAX_UNLOCKS_PER_ARCHIVE = 10;

export const MYTH_TYPE_NOT_FOUND = 'MYTH_TYPE_NOT_FOUND';
export const MYTH_NOT_FOUND = 'MYTH_NOT_FOUND';
export const INVALID_INPUT = 'INVALID_INPUT';
export const ALREADY_UNLOCKED = 'ALREADY_UNLOCKED';

export class CultivationDreamMythologyArchive {
    constructor(config = {}) {
        this.config = {
            maxMyths: config.maxMyths !== undefined ? config.maxMyths : DEFAULT_MAX_MYTHS,
            maxUnlocksPerArchive: config.maxUnlocksPerArchive !== undefined ? config.maxUnlocksPerArchive : MAX_UNLOCKS_PER_ARCHIVE,
            autoUnlock: config.autoUnlock !== undefined ? config.autoUnlock : false,
            ...config,
        };
        this.myths = new Map();
        this.dreamMyths = new Map();
        this.unlocked = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalAdded: 0,
            totalQueried: 0,
            totalUnlocked: 0,
            byType: { creation: 0, destruction: 0, transformation: 0 },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMyth', (ctx) => this.getMyth(ctx.mythId));
        this.registerTool('listBySection', (ctx) => this.listBySection(ctx.section));
        this.registerTool('listUnlocked', () => this.listUnlockedMyths());
    }

    _genId() {
        return `myth_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _isValidMythType(mythType) {
        return typeof mythType === 'string' && MYTH_TYPES.includes(mythType);
    }

    _sectionForType(mythType) {
        if (mythType === 'creation') return ARCHIVE_SECTIONS[0];
        if (mythType === 'destruction') return ARCHIVE_SECTIONS[1];
        if (mythType === 'transformation') return ARCHIVE_SECTIONS[2];
        return ARCHIVE_SECTIONS[3];
    }

    _titleForType(mythType, idx) {
        const prefix = mythType === 'creation' ? '创世' : mythType === 'destruction' ? '灭世' : '化世';
        return `${prefix}神话#${idx}`;
    }

    _contentForType(mythType) {
        if (mythType === 'creation') return '盘古开天辟地，阴阳初分，万物始生。';
        if (mythType === 'destruction') return '天崩地裂，劫火焚尽九洲，众生轮回。';
        if (mythType === 'transformation') return '凤凰涅槃，浴火重生，化茧成蝶。';
        return '传说道法自然，万象更新。';
    }

    _tierForScore(score) {
        let chosen = LEGEND_TIERS[0].tier;
        for (const t of LEGEND_TIERS) {
            if (score >= t.unlockScore) chosen = t.tier;
        }
        return chosen;
    }

    addMyth(dreamId, mythType) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: INVALID_INPUT };
        }
        if (!this._isValidMythType(mythType)) {
            return { success: false, error: MYTH_TYPE_NOT_FOUND };
        }
        const id = this._genId();
        const idx = (this.stats.byType[mythType] || 0) + 1;
        const myth = {
            id,
            dreamId,
            mythType,
            title: this._titleForType(mythType, idx),
            content: this._contentForType(mythType),
            section: this._sectionForType(mythType),
            tier: 'mortal',
            unlocked: false,
            unlockedAt: null,
            addedAt: Date.now(),
        };
        this.myths.set(id, myth);
        if (!this.dreamMyths.has(dreamId)) this.dreamMyths.set(dreamId, []);
        this.dreamMyths.get(dreamId).push(id);

        const list = this.dreamMyths.get(dreamId);
        if (list.length > this.config.maxUnlocksPerArchive) {
            const removed = list.shift();
            if (removed && this.myths.has(removed)) this.myths.delete(removed);
        }

        this.stats.totalAdded += 1;
        this.stats.byType[mythType] = (this.stats.byType[mythType] || 0) + 1;
        this._triggerHook('onAdded', { myth });
        if (this.config.autoUnlock) {
            this.unlockLegend(id, 0.95);
        }
        return { success: true, myth: this.getMyth(id) };
    }

    queryArchive(query) {
        if (!query || typeof query !== 'object') return { success: false, error: INVALID_INPUT };
        let results = Array.from(this.myths.values());
        if (typeof query.dreamId === 'string') {
            results = results.filter(m => m.dreamId === query.dreamId);
        }
        if (typeof query.mythType === 'string' && this._isValidMythType(query.mythType)) {
            results = results.filter(m => m.mythType === query.mythType);
        }
        if (typeof query.section === 'string') {
            results = results.filter(m => m.section === query.section);
        }
        if (typeof query.tier === 'string') {
            results = results.filter(m => m.tier === query.tier);
        }
        if (query.unlocked === true) {
            results = results.filter(m => m.unlocked);
        } else if (query.unlocked === false) {
            results = results.filter(m => !m.unlocked);
        }
        this.stats.totalQueried += 1;
        this._triggerHook('onQueried', { count: results.length });
        return { success: true, results: results.map(m => ({ ...m })) };
    }

    unlockLegend(mythId, score) {
        if (typeof mythId !== 'string' || mythId.length === 0) {
            return { success: false, error: INVALID_INPUT };
        }
        if (!this.myths.has(mythId)) {
            return { success: false, error: MYTH_NOT_FOUND };
        }
        const m = this.myths.get(mythId);
        if (m.unlocked) {
            return { success: false, error: ALREADY_UNLOCKED };
        }
        const s = Math.max(0, Math.min(1, score !== undefined ? score : 0));
        m.unlocked = true;
        m.unlockedAt = Date.now();
        m.tier = this._tierForScore(s);
        if (!this.unlocked.has(m.dreamId)) this.unlocked.set(m.dreamId, []);
        this.unlocked.get(m.dreamId).push(mythId);
        this.stats.totalUnlocked += 1;
        this._triggerHook('onUnlocked', { mythId, tier: m.tier });
        return { success: true, tier: m.tier, unlockedAt: m.unlockedAt };
    }

    getMyth(mythId) {
        if (!this.myths.has(mythId)) return null;
        return { ...this.myths.get(mythId) };
    }

    listBySection(section) {
        if (typeof section !== 'string' || !ARCHIVE_SECTIONS.includes(section)) return [];
        return Array.from(this.myths.values()).filter(m => m.section === section).map(m => ({ ...m }));
    }

    listUnlockedMyths() {
        return Array.from(this.myths.values()).filter(m => m.unlocked).map(m => ({ ...m }));
    }

    listByDream(dreamId) {
        if (!this.dreamMyths.has(dreamId)) return [];
        const ids = this.dreamMyths.get(dreamId);
        return ids.map(id => this.myths.get(id)).filter(m => m !== undefined).map(m => ({ ...m }));
    }

    listByType(mythType) {
        if (!this._isValidMythType(mythType)) return [];
        return Array.from(this.myths.values()).filter(m => m.mythType === mythType).map(m => ({ ...m }));
    }

    deleteMyth(mythId) {
        if (!this.myths.has(mythId)) return { success: false, error: MYTH_NOT_FOUND };
        const m = this.myths.get(mythId);
        if (this.dreamMyths.has(m.dreamId)) {
            const list = this.dreamMyths.get(m.dreamId);
            const idx = list.indexOf(mythId);
            if (idx !== -1) list.splice(idx, 1);
        }
        this.myths.delete(mythId);
        return { success: true };
    }

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) return { success: false, error: INVALID_INPUT };
        if (typeof handler !== 'function') return { success: false, error: INVALID_INPUT };
        this.tools.set(name, handler);
        return { success: true };
    }

    executeTool(name, context) {
        if (!this.tools.has(name)) return { success: false, error: 'UNKNOWN_TOOL' };
        const handler = this.tools.get(name);
        const ctx = (context !== undefined && context !== null) ? context : {};
        try {
            const result = handler(ctx);
            return { success: true, result };
        } catch (e) {
            return { success: false, error: 'TOOL_EXECUTION_ERROR', message: e.message };
        }
    }

    registerHook(event, handler) {
        if (typeof event !== 'string' || event.length === 0) return { success: false, error: INVALID_INPUT };
        if (typeof handler !== 'function') return { success: false, error: INVALID_INPUT };
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return { success: true };
    }

    _triggerHook(event, data) {
        if (!this.hooks.has(event)) return;
        for (const h of this.hooks.get(event)) {
            try { h(data); } catch (e) { /* silent */ }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: 'EVENT_NOT_FOUND' };
        const arr = this.hooks.get(event);
        const idx = arr.indexOf(handler);
        if (idx === -1) return { success: false, error: 'HANDLER_NOT_FOUND' };
        arr.splice(idx, 1);
        return { success: true };
    }

    toJSON() {
        return {
            config: this.config,
            myths: Array.from(this.myths.entries()),
            dreamMyths: Array.from(this.dreamMyths.entries()),
            stats: this.stats,
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: INVALID_INPUT };
        if (data.config) this.config = { ...this.config, ...data.config };
        if (data.myths && Array.isArray(data.myths)) this.myths = new Map(data.myths);
        if (data.dreamMyths && Array.isArray(data.dreamMyths)) this.dreamMyths = new Map(data.dreamMyths);
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, totalTracked: this.myths.size };
    }

    reset() {
        this.myths.clear();
        this.dreamMyths.clear();
        this.unlocked.clear();
        this.hooks.clear();
        this.stats = {
            totalAdded: 0, totalQueried: 0, totalUnlocked: 0,
            byType: { creation: 0, destruction: 0, transformation: 0 },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}
