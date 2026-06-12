/**
 * CultivationDreamSpiritRootAwakening.js - 梦中灵根觉醒
 * V866 P-20260613-009 Iteration 9/30 Round 34
 *
 * 修真梦境系统：梦境内觉醒灵根
 * - 核心 API: awakenSpiritRoot / testRootQuality / stabilizeRoot
 * - 数据结构: { id, dreamId, rootType, qualityGrade, stabilityScore, awakenedAt, stabilizedAt }
 * - 配置: SPIRIT_ROOT_TYPES (5), QUALITY_GRADES (5 grades), STABILITY_THRESHOLDS
 */

export const SPIRIT_ROOT_TYPES = {
    metal: {
        name: '金灵根',
        baseQuality: 1,
        element: '金',
        description: '金属性，刚毅决断',
    },
    wood: {
        name: '木灵根',
        baseQuality: 2,
        element: '木',
        description: '木属性，生生不息',
    },
    water: {
        name: '水灵根',
        baseQuality: 3,
        element: '水',
        description: '水属性，柔顺包容',
    },
    fire: {
        name: '火灵根',
        baseQuality: 4,
        element: '火',
        description: '火属性，炽热刚烈',
    },
    earth: {
        name: '土灵根',
        baseQuality: 0,
        element: '土',
        description: '土属性，厚德载物',
    },
};

export const ROOT_TYPE_KEYS = ['metal', 'wood', 'water', 'fire', 'earth'];

export const QUALITY_GRADES = ['mortal', 'common', 'rare', 'spiritual', 'immortal'];

export const QUALITY_GRADE_MAX = 4;

export const STABILITY_THRESHOLDS = [0, 25, 50, 75, 100];

export const STABILITY_STABLE_THRESHOLD = 100;

export const STABILITY_INCREMENT = 30;

export const ROOT_STATES = {
    AWAKENED: 'awakened',
    STABILIZING: 'stabilizing',
    STABLE: 'stable',
};

export class CultivationDreamSpiritRootAwakening {
    constructor(config = {}) {
        this.config = {
            maxRoots: config.maxRoots !== undefined ? config.maxRoots : 50,
            stabilityIncrement: config.stabilityIncrement !== undefined ? config.stabilityIncrement : STABILITY_INCREMENT,
            stabilityStableThreshold: config.stabilityStableThreshold !== undefined ? config.stabilityStableThreshold : STABILITY_STABLE_THRESHOLD,
            stabilityCap: config.stabilityCap !== undefined ? config.stabilityCap : 1000,
            ...config,
        };
        this.roots = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAwakens: 0, totalStabilizations: 0, totalTests: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRoot', (ctx) => this.getRoot(ctx.rootId));
        this.registerTool('listRootsByDream', (ctx) => this.listRootsByDream(ctx.dreamId));
    }

    _genId() {
        return `root_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _isValidRootType(rootType) {
        return typeof rootType === 'string' && ROOT_TYPE_KEYS.includes(rootType);
    }

    awakenSpiritRoot(dreamId, rootType) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: 'INVALID_DREAM_ID' };
        }
        if (!this._isValidRootType(rootType)) {
            return { success: false, error: 'UNKNOWN_ROOT_TYPE' };
        }
        if (this.roots.size >= this.config.maxRoots) {
            return { success: false, error: 'MAX_ROOTS_REACHED' };
        }
        const id = this._genId();
        const typeDef = SPIRIT_ROOT_TYPES[rootType];
        const root = {
            id,
            dreamId,
            rootType,
            rootName: typeDef.name,
            element: typeDef.element,
            qualityGrade: typeDef.baseQuality,
            qualityName: QUALITY_GRADES[typeDef.baseQuality],
            stabilityScore: 0,
            awakenedAt: Date.now(),
            stabilizedAt: null,
            state: ROOT_STATES.AWAKENED,
        };
        this.roots.set(id, root);
        this.stats.totalAwakens++;
        this._triggerHook('rootAwakened', { rootId: id, dreamId, rootType });
        return { success: true, root };
    }

    getRoot(id) {
        const r = this.roots.get(id);
        return r ? { ...r } : null;
    }

    listRoots() {
        return Array.from(this.roots.values()).map(r => ({ ...r }));
    }

    listRootsByDream(dreamId) {
        return Array.from(this.roots.values())
            .filter(r => r.dreamId === dreamId)
            .map(r => ({ ...r }));
    }

    listRootsByType(rootType) {
        return Array.from(this.roots.values())
            .filter(r => r.rootType === rootType)
            .map(r => ({ ...r }));
    }

    listRootsByQuality(grade) {
        return Array.from(this.roots.values())
            .filter(r => r.qualityGrade === grade)
            .map(r => ({ ...r }));
    }

    listRootsByState(state) {
        return Array.from(this.roots.values())
            .filter(r => r.state === state)
            .map(r => ({ ...r }));
    }

    listStableRoots() {
        return Array.from(this.roots.values())
            .filter(r => r.state === ROOT_STATES.STABLE)
            .map(r => ({ ...r }));
    }

    testRootQuality(rootId) {
        const r = this.roots.get(rootId);
        if (!r) return { success: false, error: 'ROOT_NOT_FOUND' };
        const typeDef = SPIRIT_ROOT_TYPES[r.rootType];
        const baseTest = typeDef.baseQuality * 20;
        const stabilityBonus = Math.floor(r.stabilityScore / 4);
        const testValue = baseTest + stabilityBonus;
        this.stats.totalTests++;
        this._triggerHook('rootTested', { rootId, testValue });
        return {
            success: true,
            qualityGrade: r.qualityGrade,
            qualityName: r.qualityName,
            testValue,
        };
    }

    stabilizeRoot(rootId) {
        const r = this.roots.get(rootId);
        if (!r) return { success: false, error: 'ROOT_NOT_FOUND' };
        if (r.state === ROOT_STATES.STABLE) {
            return { success: false, error: 'ALREADY_STABLE' };
        }
        const prevState = r.state;
        r.stabilityScore = Math.min(this.config.stabilityCap, r.stabilityScore + this.config.stabilityIncrement);
        if (r.stabilityScore >= this.config.stabilityStableThreshold) {
            r.state = ROOT_STATES.STABLE;
            r.stabilizedAt = Date.now();
        } else {
            r.state = ROOT_STATES.STABILIZING;
        }
        this.stats.totalStabilizations++;
        this._triggerHook('rootStabilized', {
            rootId,
            stabilityScore: r.stabilityScore,
            stateChanged: prevState !== r.state,
            newState: r.state,
        });
        return {
            success: true,
            stabilityScore: r.stabilityScore,
            state: r.state,
            stable: r.state === ROOT_STATES.STABLE,
        };
    }

    calculateRootPower(rootId) {
        const r = this.roots.get(rootId);
        if (!r) return 0;
        const typeDef = SPIRIT_ROOT_TYPES[r.rootType];
        const qualityComponent = r.qualityGrade * 50;
        const stabilityComponent = Math.floor(r.stabilityScore / 2);
        const elementComponent = typeDef.baseQuality * 10;
        return qualityComponent + stabilityComponent + elementComponent;
    }

    getDreamRootSummary(dreamId) {
        const rs = this.listRootsByDream(dreamId);
        if (rs.length === 0) {
            return {
                dreamId,
                rootCount: 0,
                totalStability: 0,
                stableCount: 0,
                maxQuality: QUALITY_GRADES[0],
            };
        }
        const totalStability = rs.reduce((s, r) => s + r.stabilityScore, 0);
        const stableCount = rs.filter(r => r.state === ROOT_STATES.STABLE).length;
        let maxQuality = 0;
        for (const r of rs) {
            if (r.qualityGrade > maxQuality) maxQuality = r.qualityGrade;
        }
        return {
            dreamId,
            rootCount: rs.length,
            totalStability,
            stableCount,
            maxQuality: QUALITY_GRADES[maxQuality],
        };
    }

    registerTool(name, handler) {
        this.tools.set(name, { name, handler });
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            return {
                success: true,
                result: tool.handler(context !== undefined && context !== null ? context : {}),
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    listTools() {
        return Array.from(this.tools.keys());
    }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => {
            const arr = this.hooks.get(event);
            if (arr) {
                const idx = arr.indexOf(handler);
                if (idx >= 0) arr.splice(idx, 1);
            }
        };
    }

    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) {
            try { h(data); } catch (e) { /* swallow */ }
        }
    }

    autoEvolve() {
        if (this.stats.totalAwakens < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            roots: Array.from(this.roots.entries()),
            stats: { ...this.stats },
            config: { ...this.config },
        };
    }

    fromJSON(data) {
        if (data.roots) this.roots = new Map(data.roots);
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, rootCount: this.roots.size };
    }
}
