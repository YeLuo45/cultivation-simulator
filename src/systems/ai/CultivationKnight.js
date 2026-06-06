/**
 * CultivationKnight.js - 修真骑士
 * V602 Iteration 5/20 Round 25
 */
export class CultivationKnight {
    constructor(config = {}) {
        this.config = { maxKnights: config.maxKnights || 50, baseDefense: config.baseDefense || 20, ...config };
        this.knights = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalKnights: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getKnight', (ctx) => this.getKnight(ctx.knightId));
        this.registerTool('recruitKnight', (ctx) => this.recruitKnight(ctx));
    }

    recruitKnight(data) {
        const id = data.knightId || `knt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const knight = {
            knightId: id,
            commanderId: data.commanderId,
            name: data.name || 'Anonymous Knight',
            type: data.type || 'medium',
            defense: data.defense || this.config.baseDefense,
            mounts: data.mounts || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.knights.set(id, knight);
        this.stats.totalKnights++;
        this._triggerHook('knightRecruited', { knightId: id });
        return { success: true, knight };
    }

    getKnight(id) { return this.knights.get(id) ? { ...this.knights.get(id) } : null; }
    listKnights() { return Array.from(this.knights.values()).map(k => ({ ...k })); }
    listByCommander(commanderId) { return Array.from(this.knights.values()).filter(k => k.commanderId === commanderId).map(k => ({ ...k })); }
    listLegendary() { return Array.from(this.knights.values()).filter(k => k.status === 'legendary').map(k => ({ ...k })); }

    addMount(knightId, mount) {
        const knight = this.knights.get(knightId);
        if (!knight) return { success: false, error: 'KNIGHT_NOT_FOUND' };
        knight.mounts.push(mount);
        this._triggerHook('mountAdded', { knightId, mount });
        return { success: true };
    }

    raiseDefense(knightId, amount = 5) {
        const knight = this.knights.get(knightId);
        if (!knight) return { success: false, error: 'KNIGHT_NOT_FOUND' };
        knight.defense += amount;
        this._triggerHook('defenseRaised', { knightId, newDefense: knight.defense });
        return { success: true };
    }

    levelUpKnight(knightId) {
        const knight = this.knights.get(knightId);
        if (!knight) return { success: false, error: 'KNIGHT_NOT_FOUND' };
        knight.level++;
        if (knight.level >= 5 && knight.status === 'novice') {
            knight.status = 'veteran';
        }
        this._triggerHook('knightLeveledUp', { knightId, newLevel: knight.level });
        return { success: true };
    }

    legendKnight(knightId) {
        const knight = this.knights.get(knightId);
        if (!knight) return { success: false, error: 'KNIGHT_NOT_FOUND' };
        knight.status = 'legendary';
        this._triggerHook('knightLegendized', { knightId });
        return { success: true };
    }

    calculateKnightValue(knightId) {
        const knight = this.knights.get(knightId);
        if (!knight) return 0;
        return knight.level * 100 + knight.defense * 2 + knight.mounts.length * 30;
    }

    listVeterans() { return Array.from(this.knights.values()).filter(k => k.status === 'veteran').map(k => ({ ...k })); }

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
        if (this.stats.totalKnights < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxKnights += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { knights: Array.from(this.knights.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.knights) this.knights = new Map(data.knights);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, knightCount: this.knights.size }; }
}
