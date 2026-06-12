/**
 * CultivationDreamFormationArt.js - 梦中阵法
 * V862 P-20260613-005 Iteration 5/30 Round 34
 *
 * 修真梦境系统：梦境内布置阵法凝神聚气
 * - 核心 API: setupFormation / placeFlag / activateFormation
 * - 数据结构: { id, dreamId, pattern, flags, energyFlow, activationProgress, formationStartedAt, formationCompletedAt }
 * - 配置: FORMATION_PATTERNS, FLAG_TYPES, ENERGY_FLOW_RATES
 */

export const FORMATION_PATTERNS = {
    bagua: {
        name: '八卦阵',
        requiredFlags: 8,
        description: '八卦八门，演化无穷',
        complexity: 0.8,
    },
    five_elements: {
        name: '五行阵',
        requiredFlags: 5,
        description: '金木水火土，相生相克',
        complexity: 0.6,
    },
    taiji: {
        name: '太极阵',
        requiredFlags: 2,
        description: '阴阳两仪，动静相合',
        complexity: 0.3,
    },
};

export const PATTERN_KEYS = ['bagua', 'five_elements', 'taiji'];

export const FLAG_TYPES = [
    'qian', 'kun', 'zhen', 'xun', 'kan', 'li', 'gen', 'dui',
];

export const FIVE_ELEMENT_FLAGS = ['metal', 'wood', 'water', 'fire', 'earth'];

export const TAIJI_FLAGS = ['yin', 'yang'];

export const ENERGY_FLOW_RATES = {
    bagua: 0.85,
    five_elements: 0.6,
    taiji: 0.35,
};

export const ACTIVATION_PROGRESS_MAX = 100;

export const ACTIVATION_PROGRESS_PER_FLAG = 12;

export const FORMATION_STATES = {
    SETUP: 'setup',
    PLACING: 'placing',
    READY: 'ready',
    ACTIVATING: 'activating',
    ACTIVATED: 'activated',
    FAILED: 'failed',
};

export class CultivationDreamFormationArt {
    constructor(config = {}) {
        this.config = {
            maxFormations: config.maxFormations !== undefined ? config.maxFormations : 50,
            maxFlagsPerFormation: config.maxFlagsPerFormation !== undefined ? config.maxFlagsPerFormation : 16,
            defaultActivationSteps: config.defaultActivationSteps !== undefined ? config.defaultActivationSteps : 10,
            activationStepProgress: config.activationStepProgress !== undefined ? config.activationStepProgress : 10,
            ...config,
        };
        this.formations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSetups: 0, totalActivations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFormation', (ctx) => this.getFormation(ctx.formationId));
        this.registerTool('listFormationsByDream', (ctx) => this.listFormationsByDream(ctx.dreamId));
    }

    _genId() {
        return `formation_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _isValidPattern(pattern) {
        return typeof pattern === 'string' && PATTERN_KEYS.includes(pattern);
    }

    _isValidFlagType(flagType) {
        return typeof flagType === 'string' && FLAG_TYPES.includes(flagType);
    }

    _isValidPosition(position) {
        return position !== null
            && typeof position === 'object'
            && typeof position.x === 'number'
            && typeof position.y === 'number';
    }

    setupFormation(dreamId, pattern) {
        if (typeof dreamId !== 'string' || dreamId.length === 0) {
            return { success: false, error: 'INVALID_DREAM_ID' };
        }
        if (!this._isValidPattern(pattern)) {
            return { success: false, error: 'UNKNOWN_PATTERN' };
        }
        if (this.formations.size >= this.config.maxFormations) {
            return { success: false, error: 'MAX_FORMATIONS_REACHED' };
        }
        const id = this._genId();
        const patternDef = FORMATION_PATTERNS[pattern];
        const formation = {
            id,
            dreamId,
            pattern,
            patternName: patternDef.name,
            flags: [],
            energyFlow: 0,
            activationProgress: 0,
            formationStartedAt: Date.now(),
            formationCompletedAt: null,
            activated: false,
            requiredFlags: patternDef.requiredFlags,
            complexity: patternDef.complexity,
            state: FORMATION_STATES.SETUP,
        };
        this.formations.set(id, formation);
        this.stats.totalSetups++;
        this._triggerHook('formationSetup', { formationId: id, dreamId, pattern });
        return { success: true, formation };
    }

    getFormation(id) {
        const f = this.formations.get(id);
        return f ? { ...f, flags: f.flags.map(fl => ({ ...fl })) } : null;
    }

    listFormations() {
        return Array.from(this.formations.values()).map(f => ({ ...f, flags: f.flags.map(fl => ({ ...fl })) }));
    }

    listFormationsByDream(dreamId) {
        return Array.from(this.formations.values())
            .filter(f => f.dreamId === dreamId)
            .map(f => ({ ...f, flags: f.flags.map(fl => ({ ...fl })) }));
    }

    listFormationsByPattern(pattern) {
        return Array.from(this.formations.values())
            .filter(f => f.pattern === pattern)
            .map(f => ({ ...f, flags: f.flags.map(fl => ({ ...fl })) }));
    }

    listActivatedFormations() {
        return Array.from(this.formations.values())
            .filter(f => f.activated)
            .map(f => ({ ...f, flags: f.flags.map(fl => ({ ...fl })) }));
    }

    listReadyFormations() {
        return Array.from(this.formations.values())
            .filter(f => f.state === FORMATION_STATES.READY)
            .map(f => ({ ...f, flags: f.flags.map(fl => ({ ...fl })) }));
    }

    listFormationsByState(state) {
        return Array.from(this.formations.values())
            .filter(f => f.state === state)
            .map(f => ({ ...f, flags: f.flags.map(fl => ({ ...fl })) }));
    }

    placeFlag(formationId, position) {
        const f = this.formations.get(formationId);
        if (!f) return { success: false, error: 'FORMATION_NOT_FOUND' };
        if (f.activated) return { success: false, error: 'ALREADY_ACTIVATED' };
        if (!this._isValidPosition(position)) {
            return { success: false, error: 'INVALID_POSITION' };
        }
        if (f.flags.length >= this.config.maxFlagsPerFormation) {
            return { success: false, error: 'MAX_FLAGS_REACHED' };
        }
        const flagType = this._isValidFlagType(position.type) ? position.type : FLAG_TYPES[0];
        const flag = {
            x: position.x,
            y: position.y,
            type: flagType,
            placedAt: Date.now(),
        };
        f.flags.push(flag);
        if (f.flags.length >= f.requiredFlags && f.state === FORMATION_STATES.SETUP) {
            f.state = FORMATION_STATES.PLACING;
        }
        if (f.flags.length === f.requiredFlags) {
            f.state = FORMATION_STATES.READY;
            f.formationCompletedAt = Date.now();
        }
        f.energyFlow = ENERGY_FLOW_RATES[f.pattern] * (f.flags.length / f.requiredFlags);
        this._triggerHook('flagPlaced', { formationId, flag, count: f.flags.length });
        return { success: true, flag, flagCount: f.flags.length, energyFlow: f.energyFlow };
    }

    activateFormation(formationId) {
        const f = this.formations.get(formationId);
        if (!f) return { success: false, error: 'FORMATION_NOT_FOUND' };
        if (f.activated) return { success: false, error: 'ALREADY_ACTIVATED' };
        if (f.flags.length < f.requiredFlags) {
            return { success: false, error: 'INCOMPLETE_FORMATION' };
        }
        f.state = FORMATION_STATES.ACTIVATING;
        // All required flags placed → immediate full activation
        f.activationProgress = ACTIVATION_PROGRESS_MAX;
        f.activated = true;
        f.state = FORMATION_STATES.ACTIVATED;
        f.formationCompletedAt = Date.now();
        f.energyFlow = ENERGY_FLOW_RATES[f.pattern];
        this.stats.totalActivations++;
        this._triggerHook('formationActivated', { formationId, energyFlow: f.energyFlow });
        return {
            success: true,
            activated: true,
            energyFlow: f.energyFlow,
            activationProgress: f.activationProgress,
        };
    }

    tickActivation(formationId) {
        const f = this.formations.get(formationId);
        if (!f) return { success: false, error: 'FORMATION_NOT_FOUND' };
        if (f.activated) return { success: false, error: 'ALREADY_ACTIVATED' };
        if (f.flags.length < f.requiredFlags) {
            return { success: false, error: 'INCOMPLETE_FORMATION' };
        }
        const before = f.activationProgress;
        f.activationProgress = Math.min(
            ACTIVATION_PROGRESS_MAX,
            f.activationProgress + this.config.activationStepProgress
        );
        if (f.activationProgress >= ACTIVATION_PROGRESS_MAX) {
            f.activated = true;
            f.state = FORMATION_STATES.ACTIVATED;
            f.formationCompletedAt = Date.now();
            f.energyFlow = ENERGY_FLOW_RATES[f.pattern];
            this.stats.totalActivations++;
            this._triggerHook('formationActivated', { formationId, energyFlow: f.energyFlow });
            return {
                success: true,
                activated: true,
                activationProgress: f.activationProgress,
                delta: f.activationProgress - before,
            };
        }
        return {
            success: true,
            activated: false,
            activationProgress: f.activationProgress,
            delta: f.activationProgress - before,
        };
    }

    failFormation(formationId) {
        const f = this.formations.get(formationId);
        if (!f) return { success: false, error: 'FORMATION_NOT_FOUND' };
        if (f.activated) return { success: false, error: 'ALREADY_ACTIVATED' };
        f.state = FORMATION_STATES.FAILED;
        f.energyFlow = 0;
        this._triggerHook('formationFailed', { formationId });
        return { success: true, state: f.state };
    }

    removeFlag(formationId, index) {
        const f = this.formations.get(formationId);
        if (!f) return { success: false, error: 'FORMATION_NOT_FOUND' };
        if (f.activated) return { success: false, error: 'ALREADY_ACTIVATED' };
        if (typeof index !== 'number' || index < 0 || index >= f.flags.length) {
            return { success: false, error: 'INVALID_INDEX' };
        }
        const removed = f.flags.splice(index, 1)[0];
        if (f.flags.length < f.requiredFlags) {
            if (f.state === FORMATION_STATES.READY) {
                f.state = FORMATION_STATES.PLACING;
                f.formationCompletedAt = null;
            }
        }
        f.energyFlow = ENERGY_FLOW_RATES[f.pattern] * (f.flags.length / f.requiredFlags);
        this._triggerHook('flagRemoved', { formationId, flag: removed });
        return { success: true, removed, flagCount: f.flags.length };
    }

    calculateFormationPower(formationId) {
        const f = this.formations.get(formationId);
        if (!f) return 0;
        const ratio = f.flags.length / f.requiredFlags;
        const complexityBase = f.complexity * 100;
        const flagBonus = complexityBase * ratio;
        const activationBonus = f.activated ? 50 : 0;
        return Math.floor(flagBonus + activationBonus + 10);
    }

    getDreamFormationSummary(dreamId) {
        const fs = this.listFormationsByDream(dreamId);
        if (fs.length === 0) {
            return { dreamId, formationCount: 0, totalFlags: 0, activated: 0, totalEnergyFlow: 0 };
        }
        const totalFlags = fs.reduce((s, f) => s + f.flags.length, 0);
        const activated = fs.filter(f => f.activated).length;
        const totalEnergyFlow = fs.reduce((s, f) => s + f.energyFlow, 0);
        return {
            dreamId,
            formationCount: fs.length,
            totalFlags,
            activated,
            totalEnergyFlow,
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
        if (this.stats.totalSetups < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            formations: Array.from(this.formations.entries()),
            stats: { ...this.stats },
            config: { ...this.config },
        };
    }

    fromJSON(data) {
        if (data.formations) this.formations = new Map(data.formations);
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, formationCount: this.formations.size };
    }
}
