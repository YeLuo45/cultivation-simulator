/**
 * SectPhilosophy.js - 宗门哲学
 * V485 Iteration 2/15 Round 19 - Sect Philosophy
 *
 * 融合6大设计系统:
 * - generic-agent: 哲学自循环
 * - chatdev: 哲学角色协调
 * - nanobot: 哲学mesh
 * - claude-code: 哲学分析工具
 * - thunderbolt: 哲学持久化
 * - ruflo: 哲学Hook
 */

export class SectPhilosophy {
    constructor(config = {}) {
        this.config = { maxPhilosophies: config.maxPhilosophies || 50, baseWisdom: config.baseWisdom || 10, ...config };
        this.philosophies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPhilosophies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPhilosophy', (ctx) => this.getPhilosophy(ctx.philosophyId));
        this.registerTool('formulatePhilosophy', (ctx) => this.formulatePhilosophy(ctx));
    }

    formulatePhilosophy(data) {
        const id = data.id || `phi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const philosophy = {
            philosophyId: id,
            sectId: data.sectId,
            name: data.name || 'Unnamed Philosophy',
            type: data.type || 'balance',
            wisdom: data.wisdom || this.config.baseWisdom,
            adherents: data.adherents || [],
            status: data.status || 'emerging',
            createdAt: Date.now()
        };
        this.philosophies.set(id, philosophy);
        this.stats.totalPhilosophies++;
        this._triggerHook('philosophyFormulated', { philosophyId: id });
        return { success: true, philosophy };
    }

    getPhilosophy(id) { return this.philosophies.get(id) ? { ...this.philosophies.get(id) } : null; }
    listPhilosophies() { return Array.from(this.philosophies.values()).map(p => ({ ...p })); }
    listBySect(sectId) { return Array.from(this.philosophies.values()).filter(p => p.sectId === sectId).map(p => ({ ...p })); }
    listByType(type) { return Array.from(this.philosophies.values()).filter(p => p.type === type).map(p => ({ ...p })); }

    addWisdom(philosophyId, insight = 5) {
        const philosophy = this.philosophies.get(philosophyId);
        if (!philosophy) return { success: false, error: 'PHILOSOPHY_NOT_FOUND' };
        philosophy.wisdom += insight;
        this._triggerHook('wisdomAdded', { philosophyId, newWisdom: philosophy.wisdom });
        return { success: true, philosophy: { ...philosophy } };
    }

    gainAdherent(philosophyId, member) {
        const philosophy = this.philosophies.get(philosophyId);
        if (!philosophy) return { success: false, error: 'PHILOSOPHY_NOT_FOUND' };
        philosophy.adherents.push(member);
        this._triggerHook('adherentGained', { philosophyId, member });
        return { success: true, philosophy: { ...philosophy } };
    }

    elevatePhilosophy(philosophyId) {
        const philosophy = this.philosophies.get(philosophyId);
        if (!philosophy) return { success: false, error: 'PHILOSOPHY_NOT_FOUND' };
        philosophy.status = 'eternal';
        this._triggerHook('philosophyElevated', { philosophyId });
        return { success: true, philosophy: { ...philosophy } };
    }

    calculatePhilosophyValue(philosophyId) {
        const philosophy = this.philosophies.get(philosophyId);
        if (!philosophy) return 0;
        return philosophy.wisdom * 10 + philosophy.adherents.length * 5;
    }

    listEternal() { return Array.from(this.philosophies.values()).filter(p => p.status === 'eternal').map(p => ({ ...p })); }

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
        if (this.stats.totalPhilosophies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPhilosophies += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { philosophies: Array.from(this.philosophies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.philosophies) this.philosophies = new Map(data.philosophies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, philosophyCount: this.philosophies.size }; }
}
