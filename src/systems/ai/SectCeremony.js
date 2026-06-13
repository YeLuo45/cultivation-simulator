/**
 * SectCeremony.js - 宗门仪式
 * V469 Iteration 1/15 Round 18
 */
export class SectCeremony {
    constructor(config = {}) {
        this.config = { maxCeremonies: config.maxCeremonies || 200, baseParticipants: config.baseParticipants || 5, ...config };
        this.ceremonies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCeremonies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCeremony', (ctx) => this.getCeremony(ctx.ceremonyId));
        this.registerTool('scheduleCeremony', (ctx) => this.scheduleCeremony(ctx));
    }

    scheduleCeremony(data) {
        const id = data.id || `crm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ceremony = {
            ceremonyId: id,
            sectId: data.sectId,
            name: data.name,
            type: data.type || 'initiation',
            participants: data.participants || [],
            offerings: data.offerings || [],
            status: data.status || 'planned',
            createdAt: Date.now()
        };
        this.ceremonies.set(id, ceremony);
        this.stats.totalCeremonies++;
        this._triggerHook('ceremonyScheduled', { ceremonyId: id });
        return { success: true, ceremony };
    }

    getCeremony(id) { return this.ceremonies.get(id) ? { ...this.ceremonies.get(id) } : null; }
    listCeremonies() { return Array.from(this.ceremonies.values()).map(c => ({ ...c })); }
    listBySect(sectId) { return Array.from(this.ceremonies.values()).filter(c => c.sectId === sectId).map(c => ({ ...c })); }
    listByType(type) { return Array.from(this.ceremonies.values()).filter(c => c.type === type).map(c => ({ ...c })); }

    addParticipant(ceremonyId, member) {
        const ceremony = this.ceremonies.get(ceremonyId);
        if (!ceremony) return { success: false, error: 'CEREMONY_NOT_FOUND' };
        ceremony.participants.push(member);
        this._triggerHook('participantAdded', { ceremonyId, member });
        return { success: true, count: ceremony.participants.length };
    }

    addOffering(ceremonyId, offering) {
        const ceremony = this.ceremonies.get(ceremonyId);
        if (!ceremony) return { success: false, error: 'CEREMONY_NOT_FOUND' };
        ceremony.offerings.push(offering);
        this._triggerHook('offeringAdded', { ceremonyId, offering });
        return { success: true, count: ceremony.offerings.length };
    }

    executeCeremony(ceremonyId) {
        const ceremony = this.ceremonies.get(ceremonyId);
        if (!ceremony) return { success: false, error: 'CEREMONY_NOT_FOUND' };
        ceremony.status = 'in-progress';
        this._triggerHook('ceremonyExecuted', { ceremonyId });
        return { success: true, ceremony: { ...ceremony } };
    }

    completeCeremony(ceremonyId) {
        const ceremony = this.ceremonies.get(ceremonyId);
        if (!ceremony) return { success: false, error: 'CEREMONY_NOT_FOUND' };
        ceremony.status = 'completed';
        this._triggerHook('ceremonyCompleted', { ceremonyId });
        return { success: true, ceremony: { ...ceremony } };
    }

    calculateCeremonyPower(ceremonyId) {
        const ceremony = this.ceremonies.get(ceremonyId);
        if (!ceremony) return 0;
        return ceremony.participants.length * 10 + ceremony.offerings.length * 5;
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
        if (this.stats.totalCeremonies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCeremonies += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ceremonies: Array.from(this.ceremonies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ceremonies) this.ceremonies = new Map(data.ceremonies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ceremonyCount: this.ceremonies.size }; }
}
