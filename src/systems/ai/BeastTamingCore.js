/**
 * BeastTamingCore.js - 灵兽驯化核心
 * V324 Iteration 3/9 Round 5
 */
export class BeastTamingCore {
    constructor(config = {}) {
        this.config = { maxBeasts: config.maxBeasts || 200, baseTameRate: config.baseTameRate || 0.5, ...config };
        this.beastTypes = new Map();
        this.beasts = new Map();
        this.tamingSessions = new Map();
        this.tamers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTamed: 0, totalSessions: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const types = [
            { typeId: 'spirit_fox', name: 'Spirit Fox', rarity: 'common', basePower: 10, element: 'fire' },
            { typeId: 'cloud_eagle', name: 'Cloud Eagle', rarity: 'common', basePower: 15, element: 'wind' },
            { typeId: 'iron_tiger', name: 'Iron Tiger', rarity: 'rare', basePower: 50, element: 'earth' },
            { typeId: 'azure_dragon', name: 'Azure Dragon', rarity: 'legendary', basePower: 200, element: 'water' },
            { typeId: 'phoenix', name: 'Phoenix', rarity: 'legendary', basePower: 250, element: 'fire' }
        ];
        for (const t of types) this.beastTypes.set(t.typeId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getBeast', (ctx) => this.getBeast(ctx.beastId));
        this.registerTool('listBeasts', () => Array.from(this.beasts.values()).map(b => ({...b})));
        this.registerTool('getBeastType', (ctx) => this.getBeastType(ctx.typeId));
    }

    registerTamer(data) {
        const id = data.id || `tmr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tamer = { tamerId: id, name: data.name || 'Unnamed', skill: data.skill || 1, tamedCount: 0 };
        this.tamers.set(id, tamer);
        return { success: true, tamer };
    }

    getTamer(id) { return this.tamers.get(id) ? { ...this.tamers.get(id) } : null; }
    listTamers() { return Array.from(this.tamers.values()).map(t => ({ ...t })); }

    getBeastType(id) { return this.beastTypes.get(id) ? { ...this.beastTypes.get(id) } : null; }
    listBeastTypes() { return Array.from(this.beastTypes.values()).map(t => ({ ...t })); }

    startTaming(tamerId, beastTypeId) {
        const tamer = this.tamers.get(tamerId);
        if (!tamer) return { success: false, error: 'TAMER_NOT_FOUND' };
        const beastType = this.beastTypes.get(beastTypeId);
        if (!beastType) return { success: false, error: 'BEAST_TYPE_NOT_FOUND' };
        const sessionId = `tmg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const session = {
            sessionId, tamerId, beastTypeId,
            status: 'in_progress', progress: 0, resistance: beastType.basePower / 10,
            startedAt: Date.now()
        };
        this.tamingSessions.set(sessionId, session);
        this.stats.totalSessions++;
        this._triggerHook('tamingStarted', { sessionId, beastTypeId });
        return { success: true, session };
    }

    advanceTaming(sessionId, effort = 10) {
        const session = this.tamingSessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'in_progress') return { success: false, error: 'SESSION_INACTIVE' };
        session.progress += effort;
        if (session.progress >= 100) return this.completeTaming(sessionId);
        return { success: true, session: { ...session } };
    }

    completeTaming(sessionId) {
        const session = this.tamingSessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'in_progress') return { success: false, error: 'SESSION_INACTIVE' };
        const tamer = this.tamers.get(session.tamerId);
        const beastType = this.beastTypes.get(session.beastTypeId);
        const skillBonus = (tamer?.skill || 1) * 0.1;
        const finalRate = Math.min(1, this.config.baseTameRate + skillBonus);
        const success = Math.random() < finalRate;
        if (success) {
            const beastId = `bst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const beast = {
                beastId, typeId: session.beastTypeId, name: beastType.name,
                rarity: beastType.rarity, power: beastType.basePower, element: beastType.element,
                loyalty: 30, level: 1, exp: 0, tamerId: session.tamerId,
                tamedAt: Date.now()
            };
            this.beasts.set(beastId, beast);
            this.stats.totalTamed++;
            if (tamer) tamer.tamedCount++;
            session.status = 'completed';
            session.resultBeastId = beastId;
            this._triggerHook('tamingCompleted', { sessionId, beastId });
            return { success: true, beast, success: true };
        } else {
            session.status = 'failed';
            this._triggerHook('tamingFailed', { sessionId });
            return { success: false, error: 'TAMING_FAILED', success: false };
        }
    }

    getBeast(id) { return this.beasts.get(id) ? { ...this.beasts.get(id) } : null; }
    listBeasts() { return Array.from(this.beasts.values()).map(b => ({ ...b })); }
    listBeastsByTamer(tamerId) {
        return Array.from(this.beasts.values()).filter(b => b.tamerId === tamerId).map(b => ({ ...b }));
    }

    feedBeast(beastId, foodAmount) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.loyalty = Math.min(100, beast.loyalty + foodAmount * 0.1);
        beast.exp += foodAmount;
        this._triggerHook('beastFed', { beastId, foodAmount });
        return { success: true, beast: { ...beast } };
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
        if (this.stats.totalSessions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseTameRate = Math.min(0.9, this.config.baseTameRate + 0.05);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { beastTypes: Array.from(this.beastTypes.entries()), beasts: Array.from(this.beasts.entries()), tamingSessions: Array.from(this.tamingSessions.entries()), tamers: Array.from(this.tamers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.beastTypes) this.beastTypes = new Map(data.beastTypes);
        if (data.beasts) this.beasts = new Map(data.beasts);
        if (data.tamingSessions) this.tamingSessions = new Map(data.tamingSessions);
        if (data.tamers) this.tamers = new Map(data.tamers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, beastCount: this.beasts.size, typeCount: this.beastTypes.size, tamerCount: this.tamers.size }; }
}