/**
 * CultivationData.js - 修真数据
 * V576 Iteration 19/20 Round 23 - Cultivation Data System
 */

export class CultivationData {
    constructor(config = {}) {
        this.config = { maxData: config.maxData || 100, baseIntegrity: config.baseIntegrity || 50, ...config };
        this.data = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalData: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getData', (ctx) => this.getData(ctx.dataId));
        this.registerTool('collectData', (ctx) => this.collectData(ctx));
    }

    collectData(data) {
        const id = data.id || `dat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const record = { dataId: id, curatorId: data.curatorId, name: data.name, type: data.type || 'training', integrity: data.integrity || this.config.baseIntegrity, records: data.records || [], level: 1, status: 'raw', createdAt: Date.now() };
        this.data.set(id, record);
        this.stats.totalData++;
        this._triggerHook('dataCollected', { dataId: id });
        return { success: true, record };
    }

    getData(id) { return this.data.get(id) ? { ...this.data.get(id) } : null; }
    listData() { return Array.from(this.data.values()).map(d => ({ ...d })); }
    listByCurator(curatorId) { return Array.from(this.data.values()).filter(d => d.curatorId === curatorId).map(d => ({ ...d })); }
    listClassified() { return Array.from(this.data.values()).filter(d => d.status === 'classified').map(d => ({ ...d })); }

    addRecord(dataId, record) {
        const d = this.data.get(dataId);
        if (!d) return { success: false, error: 'DATA_NOT_FOUND' };
        d.records.push(record);
        this._triggerHook('recordAdded', { dataId, record });
        return { success: true };
    }

    increaseIntegrity(dataId, amount = 5) {
        const d = this.data.get(dataId);
        if (!d) return { success: false, error: 'DATA_NOT_FOUND' };
        d.integrity += amount;
        this._triggerHook('integrityIncreased', { dataId, newIntegrity: d.integrity });
        return { success: true };
    }

    levelUpData(dataId) {
        const d = this.data.get(dataId);
        if (!d) return { success: false, error: 'DATA_NOT_FOUND' };
        d.level++;
        this._triggerHook('dataLeveledUp', { dataId, newLevel: d.level });
        return { success: true };
    }

    classifyData(dataId) {
        const d = this.data.get(dataId);
        if (!d) return { success: false, error: 'DATA_NOT_FOUND' };
        d.status = 'classified';
        this._triggerHook('dataClassified', { dataId });
        return { success: true };
    }

    calculateDataValue(dataId) {
        const d = this.data.get(dataId);
        if (!d) return 0;
        return d.level * 100 + d.integrity * 2 + d.records.length * 30;
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
        if (this.stats.totalData < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxData += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { data: Array.from(this.data.entries()), stats: this.stats, config: this.config }; }
    fromJSON(d) {
        if (d.data) this.data = new Map(d.data);
        if (d.stats) this.stats = d.stats;
        if (d.config) this.config = { ...this.config, ...d.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dataCount: this.data.size }; }
}
