/**
 * FormationSynergyEngine.js - 阵法协同引擎
 * V318 Iteration 6/9 Round 4
 */
export class FormationSynergyEngine {
    constructor(config = {}) {
        this.config = { maxSynergies: config.maxSynergies || 50, baseSynergyBonus: config.baseSynergyBonus || 0.2, ...config };
        this.synergies = new Map();
        this.combinations = new Map();
        this.bonuses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSynergies: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const defaults = [
            { comboId: 'sword_array', name: 'Sword Array', formations: ['iron_sword', 'jade_blade'], bonus: { attack: 0.3 } },
            { comboId: 'fire_storm', name: 'Fire Storm', formations: ['fire_aura', 'fire_arrow'], bonus: { fireDamage: 0.5 } }
        ];
        for (const c of defaults) this.combinations.set(c.comboId, c);
    }

    _registerDefaultTools() {
        this.registerTool('getCombination', (ctx) => this.getCombination(ctx.comboId));
        this.registerTool('listCombinations', () => Array.from(this.combinations.values()).map(c => ({...c})));
    }

    registerCombination(data) {
        const id = data.id || `cmb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const combo = { comboId: id, name: data.name || 'Unnamed', formations: data.formations || [], bonus: data.bonus || {} };
        this.combinations.set(id, combo);
        this._triggerHook('combinationRegistered', { comboId: id });
        return { success: true, combo };
    }

    getCombination(id) { return this.combinations.get(id) ? { ...this.combinations.get(id) } : null; }
    listCombinations() { return Array.from(this.combinations.values()).map(c => ({ ...c })); }

    detectSynergy(activeFormationIds) {
        const detected = [];
        for (const combo of this.combinations.values()) {
            const hasAll = combo.formations.every(f => activeFormationIds.includes(f));
            if (hasAll) detected.push(combo);
        }
        return detected;
    }

    activateSynergy(comboId, activatorId) {
        const combo = this.combinations.get(comboId);
        if (!combo) return { success: false, error: 'COMBINATION_NOT_FOUND' };
        const synergyId = `syn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const synergy = { synergyId, comboId, activatorId, activatedAt: Date.now(), bonus: combo.bonus, status: 'active' };
        this.synergies.set(synergyId, synergy);
        this.stats.totalSynergies++;
        this._triggerHook('synergyActivated', { synergyId, comboId });
        return { success: true, synergy };
    }

    getSynergy(id) { return this.synergies.get(id) ? { ...this.synergies.get(id) } : null; }
    listSynergies() { return Array.from(this.synergies.values()).map(s => ({ ...s })); }

    calculateSynergyBonus(activeFormationIds) {
        const detected = this.detectSynergy(activeFormationIds);
        const totalBonus = {};
        for (const combo of detected) {
            for (const [key, value] of Object.entries(combo.bonus || {})) {
                totalBonus[key] = (totalBonus[key] || 0) + value;
            }
        }
        return { success: true, bonus: totalBonus, count: detected.length };
    }

    endSynergy(synergyId) {
        const synergy = this.synergies.get(synergyId);
        if (!synergy) return { success: false, error: 'SYNERGY_NOT_FOUND' };
        if (synergy.status !== 'active') return { success: false, error: 'SYNERGY_INACTIVE' };
        synergy.status = 'ended';
        synergy.endedAt = Date.now();
        this._triggerHook('synergyEnded', { synergyId });
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
        if (this.stats.totalSynergies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseSynergyBonus = Math.min(0.5, this.config.baseSynergyBonus + 0.05);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { synergies: Array.from(this.synergies.entries()), combinations: Array.from(this.combinations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.synergies) this.synergies = new Map(data.synergies);
        if (data.combinations) this.combinations = new Map(data.combinations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, synergyCount: this.synergies.size, combinationCount: this.combinations.size }; }
}