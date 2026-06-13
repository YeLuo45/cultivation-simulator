/**
 * CultivationArtifactInventory.js - 修真法器仓库系统
 * V938 P-20260613-112 Iteration 21/30 Round 36
 *
 * 法器仓库系统：收纳/分类/排序/取出
 * - 核心 API: storeArtifact / retrieveArtifact / listByCategory / sortByAttribute / transferArtifact
 * - 数据结构: { id, artifactName, category, quality, level, attributes, storedAt, owner }
 * - 配置: ARTIFACT_CATEGORIES (10), QUALITY_LEVELS (5), MAX_INVENTORY_SIZE (200), ATTRIBUTE_KEYS (5)
 */

export const ARTIFACT_CATEGORIES = {
    sword: { name: '飞剑', maxLevel: 100, primaryAttr: 'atk' },
    blade: { name: '宝刀', maxLevel: 100, primaryAttr: 'atk' },
    staff: { name: '法杖', maxLevel: 100, primaryAttr: 'mp' },
    fan: { name: '宝扇', maxLevel: 100, primaryAttr: 'spd' },
    bead: { name: '宝珠', maxLevel: 100, primaryAttr: 'mp' },
    gourd: { name: '葫芦', maxLevel: 100, primaryAttr: 'hp' },
    mirror: { name: '宝镜', maxLevel: 100, primaryAttr: 'def' },
    seal: { name: '法印', maxLevel: 100, primaryAttr: 'def' },
    banner: { name: '令旗', maxLevel: 100, primaryAttr: 'atk' },
    ring: { name: '灵戒', maxLevel: 100, primaryAttr: 'hp' },
};
export const ARTIFACT_CATEGORY_KEYS = Object.keys(ARTIFACT_CATEGORIES);
export const ARTIFACT_CATEGORY_COUNT = 10;

export const QUALITY_LEVELS = {
    common: { rank: 1, multiplier: 1.0 },
    rare: { rank: 2, multiplier: 1.5 },
    epic: { rank: 3, multiplier: 2.5 },
    legendary: { rank: 4, multiplier: 4.0 },
    divine: { rank: 5, multiplier: 7.0 },
};
export const QUALITY_LEVEL_KEYS = Object.keys(QUALITY_LEVELS);
export const QUALITY_LEVEL_COUNT = 5;

export const ATTRIBUTE_KEYS = ['atk', 'def', 'hp', 'mp', 'spd'];
export const ATTRIBUTE_KEY_COUNT = 5;

export const DEFAULT_MAX_INVENTORY_SIZE = 200;
export const DEFAULT_LEVEL = 1;
export const DEFAULT_OWNER = 'sect_master';

export const INVALID_ARTIFACT = 'INVALID_ARTIFACT';
export const INVALID_CATEGORY = 'INVALID_CATEGORY';
export const INVALID_QUALITY = 'INVALID_QUALITY';
export const INVENTORY_FULL = 'INVENTORY_FULL';
export const DUPLICATE_ID = 'DUPLICATE_ID';
export const ARTIFACT_NOT_FOUND = 'ARTIFACT_NOT_FOUND';
export const NOT_OWNER = 'NOT_OWNER';
export const INVALID_OWNER = 'INVALID_OWNER';
export const INVALID_ATTRIBUTE = 'INVALID_ATTRIBUTE';
export const INVALID_ORDER = 'INVALID_ORDER';
export const INVALID_DATA = 'INVALID_DATA';
export const INVALID_TOOL_NAME = 'INVALID_TOOL_NAME';
export const INVALID_HANDLER = 'INVALID_HANDLER';
export const UNKNOWN_TOOL = 'UNKNOWN_TOOL';
export const TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR';
export const INVALID_EVENT_NAME = 'INVALID_EVENT_NAME';
export const EVENT_NOT_REGISTERED = 'EVENT_NOT_REGISTERED';
export const HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND';
export const TRANSFER_TARGET_FULL = 'TRANSFER_TARGET_FULL';

const VALID_ORDERS = ['asc', 'desc'];

export class CultivationArtifactInventory {
    constructor(config = {}) {
        this.config = {
            maxInventorySize: config.maxInventorySize !== undefined ? config.maxInventorySize : DEFAULT_MAX_INVENTORY_SIZE,
            defaultOwner: config.defaultOwner !== undefined ? config.defaultOwner : DEFAULT_OWNER,
            defaultLevel: config.defaultLevel !== undefined ? config.defaultLevel : DEFAULT_LEVEL,
            autoGenerateId: config.autoGenerateId !== undefined ? config.autoGenerateId : true,
            ...config,
        };
        this.artifacts = new Map();
        this.ownerIndex = new Map();
        this.categoryIndex = new Map();
        this.qualityIndex = new Map();
        this.transferLog = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalStored: 0,
            totalRetrieved: 0,
            totalTransferred: 0,
            totalSorted: 0,
            evolutionCount: 0,
            byCategory: {
                sword: 0, blade: 0, staff: 0, fan: 0, bead: 0,
                gourd: 0, mirror: 0, seal: 0, banner: 0, ring: 0,
            },
            byQuality: {
                common: 0, rare: 0, epic: 0, legendary: 0, divine: 0,
            },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArtifact', (ctx) => this.getArtifact(ctx.artifactId));
        this.registerTool('listByCategory', (ctx) => this.listByCategory(ctx.category));
        this.registerTool('listByQuality', (ctx) => this.listByQuality(ctx.quality));
        this.registerTool('listByOwner', (ctx) => this.listByOwner(ctx.owner));
        this.registerTool('sortByAttribute', (ctx) => this.sortByAttribute(ctx.attribute, ctx.order));
    }

    _genId() {
        return `artifact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _ensureOwnerIndex(owner) {
        if (!this.ownerIndex.has(owner)) {
            this.ownerIndex.set(owner, []);
        }
        return this.ownerIndex.get(owner);
    }

    _ensureCategoryIndex(category) {
        if (!this.categoryIndex.has(category)) {
            this.categoryIndex.set(category, []);
        }
        return this.categoryIndex.get(category);
    }

    _ensureQualityIndex(quality) {
        if (!this.qualityIndex.has(quality)) {
            this.qualityIndex.set(quality, []);
        }
        return this.qualityIndex.get(quality);
    }

    _cloneArtifact(artifact) {
        return {
            ...artifact,
            attributes: artifact.attributes ? { ...artifact.attributes } : {},
        };
    }

    _normalizeAttributes(attrs) {
        const out = {};
        for (const key of ATTRIBUTE_KEYS) {
            out[key] = attrs && attrs[key] !== undefined ? attrs[key] : 0;
        }
        return out;
    }

    _isValidArtifact(obj) {
        if (!obj || typeof obj !== 'object') return false;
        if (typeof obj.artifactName !== 'string' || obj.artifactName.length === 0) return false;
        return true;
    }

    storeArtifact(artifact) {
        if (!this._isValidArtifact(artifact)) {
            return { success: false, error: INVALID_ARTIFACT };
        }
        const category = artifact.category;
        if (!ARTIFACT_CATEGORIES[category]) {
            return { success: false, error: INVALID_CATEGORY };
        }
        const quality = artifact.quality;
        if (!QUALITY_LEVELS[quality]) {
            return { success: false, error: INVALID_QUALITY };
        }
        const owner = artifact.owner !== undefined ? artifact.owner : this.config.defaultOwner;
        if (typeof owner !== 'string' || owner.length === 0) {
            return { success: false, error: INVALID_OWNER };
        }
        if (this.artifacts.size >= this.config.maxInventorySize) {
            return { success: false, error: INVENTORY_FULL };
        }

        const id = (artifact.id !== undefined && artifact.id !== null && artifact.id !== '')
            ? artifact.id
            : (this.config.autoGenerateId ? this._genId() : null);
        if (!id) {
            return { success: false, error: INVALID_ARTIFACT };
        }
        if (this.artifacts.has(id)) {
            return { success: false, error: DUPLICATE_ID };
        }

        const level = artifact.level !== undefined ? artifact.level : this.config.defaultLevel;
        const storedAt = Date.now();
        const attributes = this._normalizeAttributes(artifact.attributes);

        const stored = {
            id,
            artifactName: artifact.artifactName,
            category,
            quality,
            level,
            attributes,
            storedAt,
            owner,
        };

        this.artifacts.set(id, stored);
        this._ensureOwnerIndex(owner).push(id);
        this._ensureCategoryIndex(category).push(id);
        this._ensureQualityIndex(quality).push(id);

        this.stats.totalStored += 1;
        this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
        this.stats.byQuality[quality] = (this.stats.byQuality[quality] || 0) + 1;

        this._triggerHook('onStore', { artifact: this._cloneArtifact(stored) });
        return { success: true, artifact: this._cloneArtifact(stored) };
    }

    retrieveArtifact(artifactId, requester) {
        if (typeof artifactId !== 'string' || artifactId.length === 0) {
            return { success: false, error: INVALID_ARTIFACT };
        }
        if (typeof requester !== 'string' || requester.length === 0) {
            return { success: false, error: INVALID_OWNER };
        }
        if (!this.artifacts.has(artifactId)) {
            return { success: false, error: ARTIFACT_NOT_FOUND };
        }
        const artifact = this.artifacts.get(artifactId);
        if (artifact.owner !== requester) {
            return { success: false, error: NOT_OWNER };
        }

        this.artifacts.delete(artifactId);
        const ownerList = this.ownerIndex.get(artifact.owner);
        if (ownerList) {
            const idx = ownerList.indexOf(artifactId);
            if (idx !== -1) ownerList.splice(idx, 1);
        }
        const catList = this.categoryIndex.get(artifact.category);
        if (catList) {
            const idx = catList.indexOf(artifactId);
            if (idx !== -1) catList.splice(idx, 1);
        }
        const qualList = this.qualityIndex.get(artifact.quality);
        if (qualList) {
            const idx = qualList.indexOf(artifactId);
            if (idx !== -1) qualList.splice(idx, 1);
        }

        this.stats.totalRetrieved += 1;
        this._triggerHook('onRetrieve', { artifact: this._cloneArtifact(artifact), requester });
        return { success: true, artifact: this._cloneArtifact(artifact) };
    }

    listByCategory(category) {
        if (!ARTIFACT_CATEGORIES[category]) return [];
        const ids = this.categoryIndex.get(category) || [];
        return ids
            .map(id => this.artifacts.get(id))
            .filter(a => a !== undefined)
            .map(a => this._cloneArtifact(a));
    }

    listByQuality(quality) {
        if (!QUALITY_LEVELS[quality]) return [];
        const ids = this.qualityIndex.get(quality) || [];
        return ids
            .map(id => this.artifacts.get(id))
            .filter(a => a !== undefined)
            .map(a => this._cloneArtifact(a));
    }

    listByOwner(owner) {
        if (typeof owner !== 'string' || owner.length === 0) return [];
        const ids = this.ownerIndex.get(owner) || [];
        return ids
            .map(id => this.artifacts.get(id))
            .filter(a => a !== undefined)
            .map(a => this._cloneArtifact(a));
    }

    sortByAttribute(attribute, order) {
        if (!ATTRIBUTE_KEYS.includes(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        const normalizedOrder = (order !== undefined && order !== null) ? order : 'asc';
        if (!VALID_ORDERS.includes(normalizedOrder)) {
            return { success: false, error: INVALID_ORDER };
        }

        const all = Array.from(this.artifacts.values()).map(a => this._cloneArtifact(a));
        const dir = normalizedOrder === 'desc' ? -1 : 1;
        all.sort((a, b) => {
            const av = a.attributes[attribute] !== undefined ? a.attributes[attribute] : 0;
            const bv = b.attributes[attribute] !== undefined ? b.attributes[attribute] : 0;
            if (av === bv) return 0;
            return av < bv ? -1 * dir : 1 * dir;
        });
        this.stats.totalSorted += 1;
        this._triggerHook('onSort', { attribute, order: normalizedOrder, count: all.length });
        return { success: true, artifacts: all, order: normalizedOrder };
    }

    transferArtifact(fromOwner, toOwner, artifactId) {
        if (typeof fromOwner !== 'string' || fromOwner.length === 0) {
            return { success: false, error: INVALID_OWNER };
        }
        if (typeof toOwner !== 'string' || toOwner.length === 0) {
            return { success: false, error: INVALID_OWNER };
        }
        if (typeof artifactId !== 'string' || artifactId.length === 0) {
            return { success: false, error: INVALID_ARTIFACT };
        }
        if (!this.artifacts.has(artifactId)) {
            return { success: false, error: ARTIFACT_NOT_FOUND };
        }
        const artifact = this.artifacts.get(artifactId);
        if (artifact.owner !== fromOwner) {
            return { success: false, error: NOT_OWNER };
        }
        const targetList = this._ensureOwnerIndex(toOwner);
        if (toOwner !== fromOwner && targetList.length >= this.config.maxInventorySize) {
            return { success: false, error: TRANSFER_TARGET_FULL };
        }

        const fromList = this.ownerIndex.get(fromOwner);
        if (fromList) {
            const idx = fromList.indexOf(artifactId);
            if (idx !== -1) fromList.splice(idx, 1);
        }
        if (toOwner !== fromOwner) {
            targetList.push(artifactId);
        }
        artifact.owner = toOwner;
        artifact.storedAt = Date.now();

        this.transferLog.push({
            artifactId,
            fromOwner,
            toOwner,
            transferredAt: artifact.storedAt,
        });

        this.stats.totalTransferred += 1;
        this._triggerHook('onTransfer', { artifactId, fromOwner, toOwner });
        return { success: true, artifact: this._cloneArtifact(artifact) };
    }

    getArtifact(artifactId) {
        if (typeof artifactId !== 'string' || artifactId.length === 0) return null;
        if (!this.artifacts.has(artifactId)) return null;
        return this._cloneArtifact(this.artifacts.get(artifactId));
    }

    updateArtifact(artifactId, updates) {
        if (typeof artifactId !== 'string' || artifactId.length === 0) {
            return { success: false, error: INVALID_ARTIFACT };
        }
        if (!updates || typeof updates !== 'object') {
            return { success: false, error: INVALID_DATA };
        }
        if (!this.artifacts.has(artifactId)) {
            return { success: false, error: ARTIFACT_NOT_FOUND };
        }
        const artifact = this.artifacts.get(artifactId);

        if (updates.artifactName !== undefined) {
            if (typeof updates.artifactName !== 'string' || updates.artifactName.length === 0) {
                return { success: false, error: INVALID_ARTIFACT };
            }
            artifact.artifactName = updates.artifactName;
        }
        if (updates.category !== undefined) {
            if (!ARTIFACT_CATEGORIES[updates.category]) {
                return { success: false, error: INVALID_CATEGORY };
            }
            const catList = this.categoryIndex.get(artifact.category);
            if (catList) {
                const idx = catList.indexOf(artifactId);
                if (idx !== -1) catList.splice(idx, 1);
            }
            this._ensureCategoryIndex(updates.category).push(artifactId);
            this.stats.byCategory[artifact.category] = Math.max(0, (this.stats.byCategory[artifact.category] || 0) - 1);
            this.stats.byCategory[updates.category] = (this.stats.byCategory[updates.category] || 0) + 1;
            artifact.category = updates.category;
        }
        if (updates.quality !== undefined) {
            if (!QUALITY_LEVELS[updates.quality]) {
                return { success: false, error: INVALID_QUALITY };
            }
            const qualList = this.qualityIndex.get(artifact.quality);
            if (qualList) {
                const idx = qualList.indexOf(artifactId);
                if (idx !== -1) qualList.splice(idx, 1);
            }
            this._ensureQualityIndex(updates.quality).push(artifactId);
            this.stats.byQuality[artifact.quality] = Math.max(0, (this.stats.byQuality[artifact.quality] || 0) - 1);
            this.stats.byQuality[updates.quality] = (this.stats.byQuality[updates.quality] || 0) + 1;
            artifact.quality = updates.quality;
        }
        if (updates.level !== undefined) {
            artifact.level = updates.level;
        }
        if (updates.attributes !== undefined) {
            artifact.attributes = this._normalizeAttributes(updates.attributes);
        }

        this._triggerHook('onUpdate', { artifact: this._cloneArtifact(artifact) });
        return { success: true, artifact: this._cloneArtifact(artifact) };
    }

    deleteArtifact(artifactId) {
        if (typeof artifactId !== 'string' || artifactId.length === 0) {
            return { success: false, error: INVALID_ARTIFACT };
        }
        if (!this.artifacts.has(artifactId)) {
            return { success: false, error: ARTIFACT_NOT_FOUND };
        }
        const artifact = this.artifacts.get(artifactId);
        this.artifacts.delete(artifactId);

        const ownerList = this.ownerIndex.get(artifact.owner);
        if (ownerList) {
            const idx = ownerList.indexOf(artifactId);
            if (idx !== -1) ownerList.splice(idx, 1);
        }
        const catList = this.categoryIndex.get(artifact.category);
        if (catList) {
            const idx = catList.indexOf(artifactId);
            if (idx !== -1) catList.splice(idx, 1);
        }
        const qualList = this.qualityIndex.get(artifact.quality);
        if (qualList) {
            const idx = qualList.indexOf(artifactId);
            if (idx !== -1) qualList.splice(idx, 1);
        }

        this.stats.byCategory[artifact.category] = Math.max(0, (this.stats.byCategory[artifact.category] || 0) - 1);
        this.stats.byQuality[artifact.quality] = Math.max(0, (this.stats.byQuality[artifact.quality] || 0) - 1);

        return { success: true };
    }

    searchArtifacts(query) {
        if (!query || typeof query !== 'object') return [];
        const term = (query.name && typeof query.name === 'string') ? query.name.toLowerCase() : null;
        const minQualityRank = (query.minQualityRank !== undefined && QUALITY_LEVELS[query.minQualityRank])
            ? QUALITY_LEVELS[query.minQualityRank].rank : 0;
        const category = (query.category && ARTIFACT_CATEGORIES[query.category]) ? query.category : null;
        const minLevel = (query.minLevel !== undefined && typeof query.minLevel === 'number') ? query.minLevel : null;

        return Array.from(this.artifacts.values())
            .filter(a => {
                if (term && !a.artifactName.toLowerCase().includes(term)) return false;
                if (category && a.category !== category) return false;
                if (minLevel !== null && a.level < minLevel) return false;
                if (minQualityRank > 0) {
                    const r = QUALITY_LEVELS[a.quality] ? QUALITY_LEVELS[a.quality].rank : 0;
                    if (r < minQualityRank) return false;
                }
                return true;
            })
            .map(a => this._cloneArtifact(a));
    }

    listAll() {
        return Array.from(this.artifacts.values()).map(a => this._cloneArtifact(a));
    }

    listCategories() {
        return [...ARTIFACT_CATEGORY_KEYS];
    }

    listQualities() {
        return [...QUALITY_LEVEL_KEYS];
    }

    listOwners() {
        return Array.from(this.ownerIndex.keys());
    }

    getTransferLog() {
        return this.transferLog.map(t => ({ ...t }));
    }

    getInventoryStats() {
        const byCategory = {};
        for (const k of ARTIFACT_CATEGORY_KEYS) byCategory[k] = 0;
        for (const a of this.artifacts.values()) {
            byCategory[a.category] = (byCategory[a.category] || 0) + 1;
        }
        const byQuality = {};
        for (const k of QUALITY_LEVEL_KEYS) byQuality[k] = 0;
        for (const a of this.artifacts.values()) {
            byQuality[a.quality] = (byQuality[a.quality] || 0) + 1;
        }
        const byOwner = {};
        for (const a of this.artifacts.values()) {
            byOwner[a.owner] = (byOwner[a.owner] || 0) + 1;
        }
        return {
            totalArtifacts: this.artifacts.size,
            maxCapacity: this.config.maxInventorySize,
            capacityUsed: this.artifacts.size / Math.max(1, this.config.maxInventorySize),
            totalOwners: this.ownerIndex.size,
            byCategory,
            byQuality,
            byOwner,
            totalTransfers: this.transferLog.length,
        };
    }

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: INVALID_TOOL_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_HANDLER };
        }
        this.tools.set(name, handler);
        return { success: true };
    }

    executeTool(name, context) {
        if (!this.tools.has(name)) {
            return { success: false, error: UNKNOWN_TOOL };
        }
        const handler = this.tools.get(name);
        const ctx = (context !== undefined && context !== null) ? context : {};
        try {
            const result = handler(ctx);
            return { success: true, result };
        } catch (e) {
            return { success: false, error: TOOL_EXECUTION_ERROR, message: e.message };
        }
    }

    registerHook(event, handler) {
        if (typeof event !== 'string' || event.length === 0) {
            return { success: false, error: INVALID_EVENT_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_HANDLER };
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
                // silent
            }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: EVENT_NOT_REGISTERED };
        const handlers = this.hooks.get(event);
        const idx = handlers.indexOf(handler);
        if (idx === -1) return { success: false, error: HANDLER_NOT_FOUND };
        handlers.splice(idx, 1);
        return { success: true };
    }

    toJSON() {
        return {
            config: { ...this.config },
            artifacts: Array.from(this.artifacts.entries()),
            ownerIndex: Array.from(this.ownerIndex.entries()),
            categoryIndex: Array.from(this.categoryIndex.entries()),
            qualityIndex: Array.from(this.qualityIndex.entries()),
            transferLog: this.transferLog.map(t => ({ ...t })),
            stats: { ...this.stats },
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: INVALID_DATA };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.artifacts && Array.isArray(data.artifacts)) {
            this.artifacts = new Map(data.artifacts);
        }
        if (data.ownerIndex && Array.isArray(data.ownerIndex)) {
            this.ownerIndex = new Map(data.ownerIndex);
        }
        if (data.categoryIndex && Array.isArray(data.categoryIndex)) {
            this.categoryIndex = new Map(data.categoryIndex);
        }
        if (data.qualityIndex && Array.isArray(data.qualityIndex)) {
            this.qualityIndex = new Map(data.qualityIndex);
        }
        if (data.transferLog && Array.isArray(data.transferLog)) {
            this.transferLog = data.transferLog.map(t => ({ ...t }));
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalArtifacts: this.artifacts.size,
            totalOwners: this.ownerIndex.size,
            totalTransferLog: this.transferLog.length,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.artifacts.clear();
        this.ownerIndex.clear();
        this.categoryIndex.clear();
        this.qualityIndex.clear();
        this.transferLog = [];
        this.hooks.clear();
        this.stats = {
            totalStored: 0,
            totalRetrieved: 0,
            totalTransferred: 0,
            totalSorted: 0,
            evolutionCount: 0,
            byCategory: {
                sword: 0, blade: 0, staff: 0, fan: 0, bead: 0,
                gourd: 0, mirror: 0, seal: 0, banner: 0, ring: 0,
            },
            byQuality: {
                common: 0, rare: 0, epic: 0, legendary: 0, divine: 0,
            },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}