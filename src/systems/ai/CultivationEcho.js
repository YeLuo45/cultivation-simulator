/**
 * CultivationEcho.js - 修真回声
 * V772 Iteration 5/30 Round 31
 */
export class CultivationEcho {
    constructor(config = {}) {
        this.config = { maxEchoes: config.maxEchoes || 20, baseReverberation: config.baseReverberation || 20, ...config };
        this.echoes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEchoes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEcho', (ctx) => this.getEcho(ctx.echoId));
        this.registerTool('recruitEcho', (ctx) => this.recruitEcho(ctx));
    }

    recruitEcho(data) {
        const id = data.id || `ech_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const echo = {
            echoId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed',
            type: data.type || 'mountain',
            reverberation: data.reverberation || this.config.baseReverberation,
            reflections: data.reflections || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.echoes.set(id, echo);
        this.stats.totalEchoes++;
        this._triggerHook('echoRecruited', { echoId: id });
        return { success: true, echo };
    }

    getEcho(id) { return this.echoes.get(id) ? { ...this.echoes.get(id) } : null; }
    listEchoes() { return Array.from(this.echoes.values()).map(e => ({ ...e })); }
    listByMaster(masterId) { return Array.from(this.echoes.values()).filter(e => e.masterId === masterId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.echoes.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addReflection(echoId, reflection) {
        const echo = this.echoes.get(echoId);
        if (!echo) return { success: false, error: 'ECHO_NOT_FOUND' };
        echo.reflections.push(reflection);
        if (echo.reflections.length >= 3 && echo.status === 'novice') echo.status = 'veteran';
        this._triggerHook('reflectionAdded', { echoId, reflection });
        return { success: true };
    }

    raiseReverberation(echoId, amount = 5) {
        const echo = this.echoes.get(echoId);
        if (!echo) return { success: false, error: 'ECHO_NOT_FOUND' };
        echo.reverberation += amount;
        this._triggerHook('reverberationRaised', { echoId, newReverberation: echo.reverberation });
        return { success: true };
    }

    levelUpEcho(echoId) {
        const echo = this.echoes.get(echoId);
        if (!echo) return { success: false, error: 'ECHO_NOT_FOUND' };
        echo.level++;
        this._triggerHook('echoLeveledUp', { echoId, newLevel: echo.level });
        return { success: true };
    }

    legendEcho(echoId) {
        const echo = this.echoes.get(echoId);
        if (!echo) return { success: false, error: 'ECHO_NOT_FOUND' };
        echo.status = 'legendary';
        this._triggerHook('echoLegendized', { echoId });
        return { success: true };
    }

    calculateEchoValue(echoId) {
        const echo = this.echoes.get(echoId);
        if (!echo) return 0;
        return echo.level * 100 + echo.reverberation * 2 + echo.reflections.length * 30;
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
        if (this.stats.totalEchoes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEchoes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { echoes: Array.from(this.echoes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.echoes) this.echoes = new Map(data.echoes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, echoCount: this.echoes.size }; }
}
