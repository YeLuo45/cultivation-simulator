/**
 * CultivationDwarf.js - 修真矮人系统
 * V675 Iteration 28/30 Round 27 - Cultivation Dwarf
 */

export class CultivationDwarf {
    constructor(config = {}) {
        this.config = { maxDwarves: config.maxDwarves || 30, baseStamina: config.baseStamina || 20, ...config };
        this.dwarves = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDwarves: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDwarf', (ctx) => this.getDwarf(ctx.dwarfId));
        this.registerTool('recruitDwarf', (ctx) => this.recruitDwarf(ctx));
    }

    recruitDwarf(data) {
        const id = data.dwarfId || `dwf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dwarf = {
            dwarfId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Dwarf',
            type: data.type || 'mountain',
            stamina: data.stamina || this.config.baseStamina,
            crafts: data.crafts || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.dwarves.set(id, dwarf);
        this.stats.totalDwarves++;
        this._triggerHook('dwarfRecruited', { dwarfId: id });
        return { success: true, dwarf };
    }

    getDwarf(id) { return this.dwarves.get(id) ? { ...this.dwarves.get(id) } : null; }
    listDwarves() { return Array.from(this.dwarves.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.dwarves.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.dwarves.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addCraft(dwarfId, craft) {
        const dwarf = this.dwarves.get(dwarfId);
        if (!dwarf) return { success: false, error: 'DWARF_NOT_FOUND' };
        dwarf.crafts.push(craft);
        this._triggerHook('craftAdded', { dwarfId, craft });
        return { success: true, dwarf: { ...dwarf } };
    }

    raiseStamina(dwarfId, amount = 5) {
        const dwarf = this.dwarves.get(dwarfId);
        if (!dwarf) return { success: false, error: 'DWARF_NOT_FOUND' };
        dwarf.stamina += amount;
        this._triggerHook('staminaRaised', { dwarfId, newStamina: dwarf.stamina });
        return { success: true };
    }

    levelUpDwarf(dwarfId) {
        const dwarf = this.dwarves.get(dwarfId);
        if (!dwarf) return { success: false, error: 'DWARF_NOT_FOUND' };
        dwarf.level++;
        this._triggerHook('dwarfLeveledUp', { dwarfId, newLevel: dwarf.level });
        return { success: true };
    }

    legendDwarf(dwarfId) {
        const dwarf = this.dwarves.get(dwarfId);
        if (!dwarf) return { success: false, error: 'DWARF_NOT_FOUND' };
        dwarf.status = 'legendary';
        this._triggerHook('dwarfLegendized', { dwarfId });
        return { success: true };
    }

    calculateDwarfValue(dwarfId) {
        const dwarf = this.dwarves.get(dwarfId);
        if (!dwarf) return 0;
        return dwarf.level * 100 + dwarf.stamina * 2 + dwarf.crafts.length * 30;
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
        if (this.stats.totalDwarves < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDwarves += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dwarves: Array.from(this.dwarves.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dwarves) this.dwarves = new Map(data.dwarves);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dwarfCount: this.dwarves.size }; }
}
