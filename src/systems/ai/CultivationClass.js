/**
 * CultivationClass.js - 修真阶级系统
 * V551 Iteration 14/20 Round 22
 */
export class CultivationClass {
    constructor(config = {}) {
        this.config = { maxClasses: config.maxClasses || 50, baseReputation: config.baseReputation || 20, ...config };
        this.classes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalClasses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getClass', (ctx) => this.getClass(ctx.classId));
        this.registerTool('openClass', (ctx) => this.openClass(ctx));
    }

    openClass(data) {
        if (this.classes.size >= this.config.maxClasses) return { success: false, error: 'MAX_CLASSES_REACHED' };
        const id = data.classId || `cls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cls = { classId: id, ownerId: data.ownerId, name: data.name || 'Unnamed Class', type: data.type || 'worker', reputation: data.reputation != null ? data.reputation : this.config.baseReputation, deeds: data.deeds || [], level: 1, status: 'forming', createdAt: Date.now() };
        this.classes.set(id, cls);
        this.stats.totalClasses++;
        this._triggerHook('classOpened', { classId: id, ownerId: cls.ownerId });
        return { success: true, class: cls };
    }

    getClass(id) { return this.classes.get(id) ? { ...this.classes.get(id), deeds: [...this.classes.get(id).deeds] } : null; }
    listClasses() { return Array.from(this.classes.values()).map(c => ({ ...c, deeds: [...c.deeds] })); }
    listByOwner(ownerId) { return Array.from(this.classes.values()).filter(c => c.ownerId === ownerId).map(c => ({ ...c, deeds: [...c.deeds] })); }
    listEstablished() { return Array.from(this.classes.values()).filter(c => c.status === 'established' || c.status === 'renowned').map(c => ({ ...c, deeds: [...c.deeds] })); }

    addDeed(classId, deed) {
        const cls = this.classes.get(classId);
        if (!cls) return { success: false, error: 'CLASS_NOT_FOUND' };
        cls.deeds.push(deed);
        this._triggerHook('deedAdded', { classId, deed, totalDeeds: cls.deeds.length });
        return { success: true };
    }

    increaseReputation(classId, amount = 5) {
        const cls = this.classes.get(classId);
        if (!cls) return { success: false, error: 'CLASS_NOT_FOUND' };
        cls.reputation += amount;
        this._triggerHook('reputationIncreased', { classId, newReputation: cls.reputation });
        return { success: true };
    }

    levelUpClass(classId) {
        const cls = this.classes.get(classId);
        if (!cls) return { success: false, error: 'CLASS_NOT_FOUND' };
        cls.level++;
        this._triggerHook('classLeveledUp', { classId, newLevel: cls.level });
        return { success: true };
    }

    establishClass(classId) {
        const cls = this.classes.get(classId);
        if (!cls) return { success: false, error: 'CLASS_NOT_FOUND' };
        cls.status = 'established';
        this._triggerHook('classEstablished', { classId, status: cls.status });
        return { success: true };
    }

    calculateClassValue(classId) {
        const cls = this.classes.get(classId);
        if (!cls) return 0;
        return cls.level * 100 + cls.reputation * 2 + cls.deeds.length * 30;
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
        if (this.stats.totalClasses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxClasses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { classes: Array.from(this.classes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.classes) this.classes = new Map(data.classes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, classCount: this.classes.size }; }
}
