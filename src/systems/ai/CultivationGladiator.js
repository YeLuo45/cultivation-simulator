/**
 * CultivationGladiator.js - 修真角斗
 * V658 Iteration 11/30 Round 27
 */
export class CultivationGladiator {
    constructor(config = {}) {
        this.config = { maxGladiators: config.maxGladiators || 30, baseFerocity: config.baseFerocity || 20, ...config };
        this.gladiators = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGladiators: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGladiator', (ctx) => this.getGladiator(ctx.gladiatorId));
        this.registerTool('recruitGladiator', (ctx) => this.recruitGladiator(ctx));
    }

    _validType(type) {
        return ['murmillo', 'retiarius', 'secutor'].includes(type);
    }

    recruitGladiator(data = {}) {
        if (this.gladiators.size >= this.config.maxGladiators) {
            return { success: false, error: 'MAX_GLADIATORS_REACHED' };
        }
        const id = data.gladiatorId || `gld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const gladiator = {
            gladiatorId: id,
            trainerId: data.trainerId,
            name: data.name || 'Anonymous Gladiator',
            type: this._validType(data.type) ? data.type : 'murmillo',
            ferocity: data.ferocity || this.config.baseFerocity,
            weapons: data.weapons || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.gladiators.set(id, gladiator);
        this.stats.totalGladiators++;
        this._triggerHook('gladiatorRecruited', { gladiatorId: id });
        return { success: true, gladiator };
    }

    getGladiator(id) { return this.gladiators.get(id) ? { ...this.gladiators.get(id) } : null; }
    listGladiators() { return Array.from(this.gladiators.values()).map(g => ({ ...g })); }
    listByTrainer(trainerId) { return Array.from(this.gladiators.values()).filter(g => g.trainerId === trainerId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.gladiators.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }
    listVeterans() { return Array.from(this.gladiators.values()).filter(g => g.status === 'veteran').map(g => ({ ...g })); }

    addWeapon(gladiatorId, weapon) {
        const gladiator = this.gladiators.get(gladiatorId);
        if (!gladiator) return { success: false, error: 'GLADIATOR_NOT_FOUND' };
        gladiator.weapons.push(weapon);
        this._triggerHook('weaponAdded', { gladiatorId, weapon });
        return { success: true };
    }

    increaseFerocity(gladiatorId, amount = 5) {
        const gladiator = this.gladiators.get(gladiatorId);
        if (!gladiator) return { success: false, error: 'GLADIATOR_NOT_FOUND' };
        gladiator.ferocity += amount;
        this._triggerHook('ferocityIncreased', { gladiatorId, newFerocity: gladiator.ferocity });
        return { success: true };
    }

    levelUpGladiator(gladiatorId) {
        const gladiator = this.gladiators.get(gladiatorId);
        if (!gladiator) return { success: false, error: 'GLADIATOR_NOT_FOUND' };
        gladiator.level++;
        if (gladiator.level >= 5 && gladiator.status === 'novice') {
            gladiator.status = 'veteran';
        }
        this._triggerHook('gladiatorLeveledUp', { gladiatorId, newLevel: gladiator.level });
        return { success: true };
    }

    legendGladiator(gladiatorId) {
        const gladiator = this.gladiators.get(gladiatorId);
        if (!gladiator) return { success: false, error: 'GLADIATOR_NOT_FOUND' };
        gladiator.status = 'legendary';
        this._triggerHook('gladiatorLegendized', { gladiatorId });
        return { success: true };
    }

    calculateGladiatorValue(gladiatorId) {
        const gladiator = this.gladiators.get(gladiatorId);
        if (!gladiator) return 0;
        return gladiator.level * 100 + gladiator.ferocity * 2 + gladiator.weapons.length * 30;
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
        if (this.stats.totalGladiators < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGladiators += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { gladiators: Array.from(this.gladiators.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.gladiators) this.gladiators = new Map(data.gladiators);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, gladiatorCount: this.gladiators.size }; }
}
