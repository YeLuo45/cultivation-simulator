/**
 * CultivationVillage.js - 修真村
 * V591 Iteration 14/20 Round 24
 *
 * 融合6大设计系统:
 * - generic-agent: 村庄自循环
 * - chatdev: 村庄角色协调
 * - nanobot: 村庄mesh
 * - claude-code: 村庄分析工具
 * - thunderbolt: 村庄持久化
 * - ruflo: 村庄Hook
 */

export class CultivationVillage {
    constructor(config = {}) {
        this.config = { maxVillages: config.maxVillages || 50, baseHarmony: config.baseHarmony || 20, ...config };
        this.villages = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVillages: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVillage', (ctx) => this.getVillage(ctx.villageId));
        this.registerTool('foundVillage', (ctx) => this.foundVillage(ctx));
    }

    foundVillage(data) {
        const id = data.id || `vil_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const village = {
            villageId: id,
            chiefId: data.chiefId,
            name: data.name,
            type: data.type || 'farming',
            harmony: data.harmony || this.config.baseHarmony,
            families: data.families || [],
            level: 1,
            status: 'humble',
            createdAt: Date.now()
        };
        this.villages.set(id, village);
        this.stats.totalVillages++;
        this._triggerHook('villageFounded', { villageId: id });
        return { success: true, village };
    }

    getVillage(id) { return this.villages.get(id) ? { ...this.villages.get(id) } : null; }
    listVillages() { return Array.from(this.villages.values()).map(v => ({ ...v })); }
    listByChief(chiefId) { return Array.from(this.villages.values()).filter(v => v.chiefId === chiefId).map(v => ({ ...v })); }
    listEternal() { return Array.from(this.villages.values()).filter(v => v.status === 'eternal').map(v => ({ ...v })); }

    addFamily(villageId, family) {
        const village = this.villages.get(villageId);
        if (!village) return { success: false, error: 'VILLAGE_NOT_FOUND' };
        village.families.push(family);
        this._triggerHook('familyAdded', { villageId, family });
        return { success: true };
    }

    increaseHarmony(villageId, amount = 5) {
        const village = this.villages.get(villageId);
        if (!village) return { success: false, error: 'VILLAGE_NOT_FOUND' };
        village.harmony += amount;
        this._triggerHook('harmonyIncreased', { villageId, newHarmony: village.harmony });
        return { success: true };
    }

    levelUpVillage(villageId) {
        const village = this.villages.get(villageId);
        if (!village) return { success: false, error: 'VILLAGE_NOT_FOUND' };
        village.level++;
        this._triggerHook('villageLeveledUp', { villageId, newLevel: village.level });
        return { success: true };
    }

    eternalizeVillage(villageId) {
        const village = this.villages.get(villageId);
        if (!village) return { success: false, error: 'VILLAGE_NOT_FOUND' };
        village.status = 'eternal';
        this._triggerHook('villageEternalized', { villageId });
        return { success: true };
    }

    calculateVillageValue(villageId) {
        const village = this.villages.get(villageId);
        if (!village) return 0;
        return village.level * 100 + village.harmony * 2 + village.families.length * 30;
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
        if (this.stats.totalVillages < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxVillages += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { villages: Array.from(this.villages.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.villages) this.villages = new Map(data.villages);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, villageCount: this.villages.size }; }
}
