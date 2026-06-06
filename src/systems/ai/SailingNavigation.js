/**
 * SailingNavigation.js - 航海导航
 * V454 Iteration 1/15 Round 17 - Sailing Navigation
 *
 * 航海导航系统: 管理修士的航海规划、航行推进、招募船员、捕获风力、停靠码头。
 */

export class SailingNavigation {
    constructor(config = {}) {
        this.config = { maxVoyages: config.maxVoyages || 100, baseWind: config.baseWind || 10, ...config };
        this.voyages = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVoyages: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVoyage', (ctx) => this.getVoyage(ctx.voyageId));
        this.registerTool('launchVoyage', (ctx) => this.launchVoyage(ctx));
    }

    launchVoyage(data) {
        const id = data.id || `vyg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const voyage = {
            voyageId: id,
            sailorId: data.sailorId,
            name: data.name || 'Unnamed Voyage',
            origin: data.origin || 'Unknown Port',
            destination: data.destination || 'Unknown Island',
            distance: data.distance || 1000,
            wind: data.wind || this.config.baseWind,
            crew: data.crew || 10,
            status: 'preparing',
            createdAt: Date.now()
        };
        this.voyages.set(id, voyage);
        this.stats.totalVoyages++;
        this._triggerHook('voyageLaunched', { voyageId: id });
        return { success: true, voyage };
    }

    getVoyage(id) { return this.voyages.get(id) ? { ...this.voyages.get(id) } : null; }
    listVoyages() { return Array.from(this.voyages.values()).map(v => ({ ...v })); }
    listBySailor(sailorId) { return Array.from(this.voyages.values()).filter(v => v.sailorId === sailorId).map(v => ({ ...v })); }
    listSailing() { return Array.from(this.voyages.values()).filter(v => v.status === 'sailing').map(v => ({ ...v })); }

    sailForward(voyageId, amount = 10) {
        const voyage = this.voyages.get(voyageId);
        if (!voyage) return { success: false, error: 'VOYAGE_NOT_FOUND' };
        if (voyage.status === 'preparing') voyage.status = 'sailing';
        voyage.distance = Math.max(0, voyage.distance - amount);
        if (voyage.distance === 0 && voyage.status !== 'docked') {
            voyage.status = 'docked';
        }
        this._triggerHook('voyageSailed', { voyageId, remainingDistance: voyage.distance });
        return { success: true, voyage: { ...voyage } };
    }

    catchWind(voyageId, amount = 5) {
        const voyage = this.voyages.get(voyageId);
        if (!voyage) return { success: false, error: 'VOYAGE_NOT_FOUND' };
        voyage.wind += amount;
        this._triggerHook('windCaught', { voyageId, newWind: voyage.wind });
        return { success: true };
    }

    recruitCrew(voyageId, count = 3) {
        const voyage = this.voyages.get(voyageId);
        if (!voyage) return { success: false, error: 'VOYAGE_NOT_FOUND' };
        voyage.crew += count;
        this._triggerHook('crewRecruited', { voyageId, newCrew: voyage.crew });
        return { success: true };
    }

    dockVoyage(voyageId) {
        const voyage = this.voyages.get(voyageId);
        if (!voyage) return { success: false, error: 'VOYAGE_NOT_FOUND' };
        voyage.status = 'docked';
        voyage.distance = 0;
        this._triggerHook('voyageDocked', { voyageId });
        return { success: true, voyage: { ...voyage } };
    }

    calculateVoyageSpeed(voyageId) {
        const voyage = this.voyages.get(voyageId);
        if (!voyage) return 0;
        return voyage.wind * (1 + voyage.crew / 100) / Math.max(1, voyage.distance / 100);
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
        if (this.stats.totalVoyages < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxVoyages += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { voyages: Array.from(this.voyages.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.voyages) this.voyages = new Map(data.voyages);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, voyageCount: this.voyages.size }; }
}
