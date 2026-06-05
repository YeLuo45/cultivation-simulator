/**
 * BeastGrowthEngine.js - 灵兽成长引擎
 * V325 Iteration 4/9 Round 5
 */
export class BeastGrowthEngine {
    constructor(config = {}) {
        this.config = { maxLevel: config.maxLevel || 100, baseExpRequired: config.baseExpRequired || 100, growthMultiplier: config.growthMultiplier || 1.5, ...config };
        this.beasts = new Map();
        this.growthStages = new Map();
        this.evolutionPaths = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLevelUps: 0, totalEvolutions: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const stages = [
            { stage: 'infant', minLevel: 1, maxLevel: 10 },
            { stage: 'juvenile', minLevel: 11, maxLevel: 30 },
            { stage: 'mature', minLevel: 31, maxLevel: 60 },
            { stage: 'elder', minLevel: 61, maxLevel: 90 },
            { stage: 'transcendent', minLevel: 91, maxLevel: 100 }
        ];
        for (const s of stages) this.growthStages.set(s.stage, s);
        this.evolutionPaths.set('fire', { pathId: 'fire', targetStage: 'transcendent', requiredElement: 'fire' });
        this.evolutionPaths.set('water', { pathId: 'water', targetStage: 'transcendent', requiredElement: 'water' });
    }

    _registerDefaultTools() {
        this.registerTool('getBeast', (ctx) => this.getBeast(ctx.beastId));
        this.registerTool('addExp', (ctx) => this.addExp(ctx.beastId, ctx.amount));
    }

    registerBeast(data) {
        const id = data.id || `bst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const beast = { beastId: id, level: data.level || 1, exp: data.exp || 0, element: data.element || 'neutral', stage: 'infant', power: data.power || 10 };
        this.beasts.set(id, beast);
        return { success: true, beast };
    }

    getBeast(id) { return this.beasts.get(id) ? { ...this.beasts.get(id) } : null; }
    listBeasts() { return Array.from(this.beasts.values()).map(b => ({ ...b })); }

    _expRequired(level) {
        return Math.floor(this.config.baseExpRequired * Math.pow(this.config.growthMultiplier, level - 1));
    }

    addExp(beastId, amount) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.exp += amount;
        this._triggerHook('expGained', { beastId, amount });
        return this._tryLevelUp(beast);
    }

    _tryLevelUp(beast) {
        while (beast.level < this.config.maxLevel) {
            const required = this._expRequired(beast.level);
            if (beast.exp < required) break;
            beast.exp -= required;
            beast.level++;
            beast.power = Math.floor(beast.power * 1.1);
            this._updateStage(beast);
            this.stats.totalLevelUps++;
            this._triggerHook('levelUp', { beastId: beast.beastId, newLevel: beast.level });
        }
        return { success: true, beast: { ...beast } };
    }

    _updateStage(beast) {
        for (const stage of this.growthStages.values()) {
            if (beast.level >= stage.minLevel && beast.level <= stage.maxLevel) {
                if (beast.stage !== stage.stage) {
                    const oldStage = beast.stage;
                    beast.stage = stage.stage;
                    this._triggerHook('stageChanged', { beastId: beast.beastId, oldStage, newStage: stage.stage });
                }
                return;
            }
        }
    }

    getCurrentStage(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return null;
        return beast.stage;
    }

    listStages() { return Array.from(this.growthStages.values()).map(s => ({ ...s })); }

    evolveBeast(beastId, pathId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        const path = this.evolutionPaths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        if (beast.element !== path.requiredElement) return { success: false, error: 'ELEMENT_MISMATCH' };
        if (beast.level < 90) return { success: false, error: 'INSUFFICIENT_LEVEL' };
        beast.power = Math.floor(beast.power * 2);
        beast.stage = path.targetStage;
        this.stats.totalEvolutions++;
        this._triggerHook('beastEvolved', { beastId, newPower: beast.power });
        return { success: true, beast: { ...beast } };
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
        if (this.stats.totalLevelUps < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.growthMultiplier = Math.max(1.1, this.config.growthMultiplier - 0.1);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { beasts: Array.from(this.beasts.entries()), growthStages: Array.from(this.growthStages.entries()), evolutionPaths: Array.from(this.evolutionPaths.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.beasts) this.beasts = new Map(data.beasts);
        if (data.growthStages) this.growthStages = new Map(data.growthStages);
        if (data.evolutionPaths) this.evolutionPaths = new Map(data.evolutionPaths);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, beastCount: this.beasts.size, stageCount: this.growthStages.size }; }
}