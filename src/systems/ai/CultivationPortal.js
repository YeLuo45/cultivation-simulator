/**
 * CultivationPortal.js - 修真传送门系统
 * V757 Iteration 20/30 Round 30 - Cultivation Portal
 */

export class CultivationPortal {
    constructor(config = {}) {
        this.config = { maxPortals: config.maxPortals || 20, baseDistortion: config.baseDistortion || 20, ...config };
        this.portals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPortals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPortal', (ctx) => this.getPortal(ctx.portalId));
        this.registerTool('recruitPortal', (ctx) => this.recruitPortal(ctx));
    }

    recruitPortal(data) {
        const id = data.portalId || `ptl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const portal = {
            portalId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Portal',
            type: data.type || 'small',
            distortion: data.distortion || this.config.baseDistortion,
            coordinates: data.coordinates || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.portals.set(id, portal);
        this.stats.totalPortals++;
        this._triggerHook('portalRecruited', { portalId: id });
        return { success: true, portal };
    }

    getPortal(id) { return this.portals.get(id) ? { ...this.portals.get(id) } : null; }
    listPortals() { return Array.from(this.portals.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.portals.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.portals.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addCoordinate(portalId, coordinate) {
        const portal = this.portals.get(portalId);
        if (!portal) return { success: false, error: 'PORTAL_NOT_FOUND' };
        portal.coordinates.push(coordinate);
        this._triggerHook('coordinateAdded', { portalId, coordinate });
        return { success: true, portal: { ...portal } };
    }

    raiseDistortion(portalId, amount = 5) {
        const portal = this.portals.get(portalId);
        if (!portal) return { success: false, error: 'PORTAL_NOT_FOUND' };
        portal.distortion += amount;
        this._triggerHook('distortionRaised', { portalId, newDistortion: portal.distortion });
        return { success: true };
    }

    levelUpPortal(portalId) {
        const portal = this.portals.get(portalId);
        if (!portal) return { success: false, error: 'PORTAL_NOT_FOUND' };
        portal.level++;
        this._triggerHook('portalLeveledUp', { portalId, newLevel: portal.level });
        return { success: true };
    }

    legendPortal(portalId) {
        const portal = this.portals.get(portalId);
        if (!portal) return { success: false, error: 'PORTAL_NOT_FOUND' };
        portal.status = 'legendary';
        this._triggerHook('portalLegendized', { portalId });
        return { success: true };
    }

    calculatePortalValue(portalId) {
        const portal = this.portals.get(portalId);
        if (!portal) return 0;
        return portal.level * 100 + portal.distortion * 2 + portal.coordinates.length * 30;
    }

    listByType(type) { return Array.from(this.portals.values()).filter(p => p.type === type).map(p => ({ ...p })); }
    listVeteran() { return Array.from(this.portals.values()).filter(p => p.status === 'veteran').map(p => ({ ...p })); }

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
        if (this.stats.totalPortals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPortals += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { portals: Array.from(this.portals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.portals) this.portals = new Map(data.portals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, portalCount: this.portals.size }; }
}
