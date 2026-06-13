/**
 * SectDoctrine.js - 宗门教义
 * V484 Iteration 1/15 Round 19
 */

export class SectDoctrine {
    constructor(config = {}) {
        this.config = { maxDoctrines: config.maxDoctrines || 100, basePrinciples: config.basePrinciples || 1, ...config };
        this.doctrines = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDoctrines: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDoctrine', (ctx) => this.getDoctrine(ctx.doctrineId));
        this.registerTool('revealDoctrine', (ctx) => this.revealDoctrine(ctx));
    }

    revealDoctrine(data) {
        const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const doctrine = {
            doctrineId: id,
            sectId: data.sectId,
            name: data.name,
            type: data.type || 'core',
            principles: data.principles || [this._generateDefaultPrinciple()],
            followers: data.followers || 0,
            status: data.status || 'revealed',
            createdAt: Date.now()
        };
        this.doctrines.set(id, doctrine);
        this.stats.totalDoctrines++;
        this._triggerHook('doctrineRevealed', { doctrineId: id });
        return { success: true, doctrine };
    }

    _generateDefaultPrinciple() {
        const defaults = [
            '道法自然',
            '天人合一',
            '无为而无不为',
            '上善若水',
            '以德服人'
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }

    getDoctrine(id) { return this.doctrines.get(id) ? { ...this.doctrines.get(id) } : null; }
    listDoctrines() { return Array.from(this.doctrines.values()).map(d => ({ ...d })); }
    listBySect(sectId) { return Array.from(this.doctrines.values()).filter(d => d.sectId === sectId).map(d => ({ ...d })); }
    listByType(type) { return Array.from(this.doctrines.values()).filter(d => d.type === type).map(d => ({ ...d })); }

    addPrinciple(doctrineId, principle) {
        const doctrine = this.doctrines.get(doctrineId);
        if (!doctrine) return { success: false, error: 'DOCTRINE_NOT_FOUND' };
        doctrine.principles.push(principle);
        this._triggerHook('principleAdded', { doctrineId, principle });
        return { success: true };
    }

    gainFollower(doctrineId, member) {
        const doctrine = this.doctrines.get(doctrineId);
        if (!doctrine) return { success: false, error: 'DOCTRINE_NOT_FOUND' };
        doctrine.followers++;
        this._triggerHook('followerGained', { doctrineId, member, total: doctrine.followers });
        return { success: true };
    }

    sealDoctrine(doctrineId) {
        const doctrine = this.doctrines.get(doctrineId);
        if (!doctrine) return { success: false, error: 'DOCTRINE_NOT_FOUND' };
        doctrine.status = 'sealed';
        this._triggerHook('doctrineSealed', { doctrineId });
        return { success: true };
    }

    calculateDoctrinePower(doctrineId) {
        const doctrine = this.doctrines.get(doctrineId);
        if (!doctrine) return 0;
        return doctrine.principles.length * 10 + doctrine.followers * 5;
    }

    listSealed() { return Array.from(this.doctrines.values()).filter(d => d.status === 'sealed').map(d => ({ ...d })); }

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
        if (this.stats.totalDoctrines < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDoctrines += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { doctrines: Array.from(this.doctrines.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.doctrines) this.doctrines = new Map(data.doctrines);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, doctrineCount: this.doctrines.size }; }
}
