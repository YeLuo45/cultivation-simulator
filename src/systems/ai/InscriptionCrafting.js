/**
 * InscriptionCrafting.js - 铭文系统
 * V460 Iteration 7/15 Round 17
 */
export class InscriptionCrafting {
    constructor(config = {}) {
        this.config = { maxInscriptions: config.maxInscriptions || 200, baseSharpness: config.baseSharpness || 20, ...config };
        this.inscriptions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalInscriptions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getInscription', (ctx) => this.getInscription(ctx.inscriptionId));
        this.registerTool('createInscription', (ctx) => this.createInscription(ctx));
    }

    createInscription(data) {
        const id = data.inscriptionId || `ins_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const inscription = {
            inscriptionId: id,
            inscriberId: data.inscriberId,
            name: data.name || 'Unnamed Inscription',
            type: data.type || 'weapon',
            runes: data.runes || [],
            sharpness: data.sharpness || this.config.baseSharpness,
            durability: data.durability || 100,
            status: 'draft',
            createdAt: Date.now()
        };
        this.inscriptions.set(id, inscription);
        this.stats.totalInscriptions++;
        this._triggerHook('inscriptionCreated', { inscriptionId: id });
        return { success: true, inscription };
    }

    getInscription(id) { return this.inscriptions.get(id) ? { ...this.inscriptions.get(id) } : null; }
    listInscriptions() { return Array.from(this.inscriptions.values()).map(i => ({ ...i })); }
    listByType(type) { return Array.from(this.inscriptions.values()).filter(i => i.type === type).map(i => ({ ...i })); }
    listByInscriber(inscriberId) { return Array.from(this.inscriptions.values()).filter(i => i.inscriberId === inscriberId).map(i => ({ ...i })); }

    addRune(inscriptionId, rune) {
        const inscription = this.inscriptions.get(inscriptionId);
        if (!inscription) return { success: false, error: 'INSCRIPTION_NOT_FOUND' };
        inscription.runes.push(rune);
        this._triggerHook('runeAdded', { inscriptionId, rune });
        return { success: true };
    }

    sharpenInscription(inscriptionId, amount = 5) {
        const inscription = this.inscriptions.get(inscriptionId);
        if (!inscription) return { success: false, error: 'INSCRIPTION_NOT_FOUND' };
        inscription.sharpness += amount;
        this._triggerHook('inscriptionSharpened', { inscriptionId, newSharpness: inscription.sharpness });
        return { success: true };
    }

    carveInscription(inscriptionId) {
        const inscription = this.inscriptions.get(inscriptionId);
        if (!inscription) return { success: false, error: 'INSCRIPTION_NOT_FOUND' };
        inscription.status = 'carved';
        this._triggerHook('inscriptionCarved', { inscriptionId });
        return { success: true };
    }

    etchInscription(inscriptionId) {
        const inscription = this.inscriptions.get(inscriptionId);
        if (!inscription) return { success: false, error: 'INSCRIPTION_NOT_FOUND' };
        inscription.status = 'etched';
        this._triggerHook('inscriptionEtched', { inscriptionId });
        return { success: true };
    }

    calculateInscriptionPower(inscriptionId) {
        const inscription = this.inscriptions.get(inscriptionId);
        if (!inscription) return 0;
        return inscription.sharpness * (1 + inscription.runes.length / 3) + inscription.durability / 10;
    }

    listCarved() { return Array.from(this.inscriptions.values()).filter(i => i.status === 'carved').map(i => ({ ...i })); }

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
        if (this.stats.totalInscriptions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxInscriptions += 40;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { inscriptions: Array.from(this.inscriptions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.inscriptions) this.inscriptions = new Map(data.inscriptions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, inscriptionCount: this.inscriptions.size }; }
}
