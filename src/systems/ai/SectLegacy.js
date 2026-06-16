/**
 * SectLegacy.js - 宗门传承
 * V471 Iteration 3/15 Round 18
 */
export class SectLegacy {
    constructor(config = {}) {
        this.config = { maxLegacies: config.maxLegacies || 50, baseGenerations: config.baseGenerations || 1, ...config };
        this.legacies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLegacies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLegacy', (ctx) => this.getLegacy(ctx.legacyId));
        this.registerTool('establishLegacy', (ctx) => this.establishLegacy(ctx));
    }

    establishLegacy(data) {
        const id = data.id || `leg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const legacy = {
            legacyId: id,
            sectId: data.sectId,
            founderId: data.founderId,
            name: data.name || 'Unnamed Legacy',
            generations: data.generations !== undefined ? data.generations : this.config.baseGenerations,
            achievements: data.achievements ? [...data.achievements] : [],
            status: data.status || 'growing',
            createdAt: Date.now()
        };
        this.legacies.set(id, legacy);
        this.stats.totalLegacies++;
        this._triggerHook('legacyEstablished', { legacyId: id });
        return { success: true, legacy };
    }

    getLegacy(id) {
        const legacy = this.legacies.get(id);
        if (!legacy) return null;
        return { ...legacy, achievements: [...legacy.achievements] };
    }

    listLegacies() { return Array.from(this.legacies.values()).map(l => ({ ...l, achievements: [...l.achievements] })); }
    listBySect(sectId) { return Array.from(this.legacies.values()).filter(l => l.sectId === sectId).map(l => ({ ...l, achievements: [...l.achievements] })); }
    listByGeneration(min) { return Array.from(this.legacies.values()).filter(l => l.generations >= min).map(l => ({ ...l, achievements: [...l.achievements] })); }

    addAchievement(legacyId, achievement) {
        const legacy = this.legacies.get(legacyId);
        if (!legacy) return { success: false, error: 'LEGACY_NOT_FOUND' };
        legacy.achievements.push(achievement);
        this._triggerHook('achievementAdded', { legacyId, achievement, totalAchievements: legacy.achievements.length });
        return { success: true };
    }

    increaseGeneration(legacyId) {
        const legacy = this.legacies.get(legacyId);
        if (!legacy) return { success: false, error: 'LEGACY_NOT_FOUND' };
        legacy.generations++;
        this._triggerHook('generationIncreased', { legacyId, newGeneration: legacy.generations });
        return { success: true };
    }

    preserveLegacy(legacyId) {
        const legacy = this.legacies.get(legacyId);
        if (!legacy) return { success: false, error: 'LEGACY_NOT_FOUND' };
        legacy.status = 'eternal';
        this._triggerHook('legacyPreserved', { legacyId });
        return { success: true };
    }

    calculateLegacyValue(legacyId) {
        const legacy = this.legacies.get(legacyId);
        if (!legacy) return 0;
        return legacy.generations * 100 + legacy.achievements.length * 50;
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
        if (this.stats.totalLegacies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLegacies += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { legacies: Array.from(this.legacies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.legacies) this.legacies = new Map(data.legacies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, legacyCount: this.legacies.size }; }
}
