/**
 * InnerDemon.js - 心魔系统
 * V401 Iteration 8/15 Round 13
 *
 * Manages inner demons that manifest during cultivation.
 * Demons have: demonId, cultivatorId, name, level, type, strength,
 *              manifestation, status (dormant/awakened/banished)
 */
export class InnerDemon {
    constructor(config = {}) {
        this.config = {
            maxDemons: config.maxDemons || 50,
            baseStrength: config.baseStrength || 20,
            baseLevel: config.baseLevel || 1,
            ...config,
        };
        this.demons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDemons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDemon', (ctx) => this.getDemon(ctx.demonId));
        this.registerTool('spawnDemon', (ctx) => this.spawnDemon(ctx));
    }

    spawnDemon(data = {}) {
        const id = data.demonId || `dem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const demon = {
            demonId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || `Demon-${id.slice(-5)}`,
            level: data.level || this.config.baseLevel,
            type: data.type || 'greed',
            strength: data.strength || this.config.baseStrength,
            manifestation: data.manifestation || 'whisper',
            status: data.status || 'dormant',
            createdAt: Date.now(),
        };
        this.demons.set(id, demon);
        this.stats.totalDemons++;
        this._triggerHook('demonSpawned', { demonId: id });
        return { success: true, demon };
    }

    getDemon(id) {
        return this.demons.get(id) ? { ...this.demons.get(id) } : null;
    }

    listDemons() {
        return Array.from(this.demons.values()).map(d => ({ ...d }));
    }

    listByCultivator(cultivatorId) {
        return Array.from(this.demons.values())
            .filter(d => d.cultivatorId === cultivatorId)
            .map(d => ({ ...d }));
    }

    listByType(type) {
        return Array.from(this.demons.values())
            .filter(d => d.type === type)
            .map(d => ({ ...d }));
    }

    listByLevel(min) {
        return Array.from(this.demons.values())
            .filter(d => d.level >= min)
            .map(d => ({ ...d }));
    }

    awakenDemon(demonId) {
        const demon = this.demons.get(demonId);
        if (!demon) return { success: false, error: 'DEMON_NOT_FOUND' };
        demon.status = 'awakened';
        this._triggerHook('demonAwakened', { demonId });
        return { success: true, demon: { ...demon } };
    }

    strengthenDemon(demonId, amount = 5) {
        const demon = this.demons.get(demonId);
        if (!demon) return { success: false, error: 'DEMON_NOT_FOUND' };
        demon.strength += amount;
        demon.level = Math.max(this.config.baseLevel, Math.floor(demon.strength / this.config.baseStrength));
        this._triggerHook('demonStrengthened', { demonId, newStrength: demon.strength });
        return { success: true, demon: { ...demon } };
    }

    banishDemon(demonId) {
        const demon = this.demons.get(demonId);
        if (!demon) return { success: false, error: 'DEMON_NOT_FOUND' };
        if (demon.strength <= this.config.baseStrength) {
            demon.status = 'banished';
            this._triggerHook('demonBanished', { demonId });
            return { success: true, demon: { ...demon } };
        }
        return { success: false, error: 'TOO_STRONG_TO_BANISH', strength: demon.strength };
    }

    calculateThreat(demonId) {
        const demon = this.demons.get(demonId);
        if (!demon) return 0;
        return demon.level * demon.strength;
    }

    registerTool(name, handler) {
        this.tools.set(name, { name, handler });
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            return { success: true, result: tool.handler(context || {}) };
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
        if (this.stats.totalDemons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDemons += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            demons: Array.from(this.demons.entries()),
            stats: this.stats,
            config: this.config,
        };
    }

    fromJSON(data) {
        if (data.demons) this.demons = new Map(data.demons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, demonCount: this.demons.size };
    }
}
