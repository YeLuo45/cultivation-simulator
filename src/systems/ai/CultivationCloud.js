/**
 * CultivationCloud.js - 修真云
 * V806 Iteration 9/30 Round 32
 */
export class CultivationCloud {
    constructor(config = {}) {
        this.config = { maxClouds: config.maxClouds || 20, baseVolume: config.baseVolume || 20, ...config };
        this.clouds = new Map();
        this.shapeLogs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecruited: 0, totalShapes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCloud', (ctx) => this.getCloud(ctx.cloudId));
        this.registerTool('recruitCloud', (ctx) => this.recruitCloud(ctx));
    }

    recruitCloud(data = {}) {
        if (this.clouds.size >= this.config.maxClouds) {
            return { success: false, error: 'MAX_CLOUDS_REACHED' };
        }
        const id = data.cloudId || `cld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const validTypes = ['cumulus', 'stratus', 'celestial'];
        const type = validTypes.includes(data.type) ? data.type : 'cumulus';
        const cloud = {
            cloudId: id,
            masterId: data.masterId || null,
            name: data.name || 'Anonymous Cloud',
            type,
            volume: data.volume || this.config.baseVolume,
            shapes: [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.clouds.set(id, cloud);
        this.stats.totalRecruited++;
        this._triggerHook('cloudRecruited', { cloudId: id, masterId: cloud.masterId, type });
        return { success: true, cloud };
    }

    getCloud(id) { return this.clouds.get(id) ? { ...this.clouds.get(id), shapes: [...this.clouds.get(id).shapes] } : null; }

    listClouds() { return Array.from(this.clouds.values()).map(c => ({ ...c, shapes: [...c.shapes] })); }

    listByMaster(masterId) { return Array.from(this.clouds.values()).filter(c => c.masterId === masterId).map(c => ({ ...c, shapes: [...c.shapes] })); }

    listLegendary() { return Array.from(this.clouds.values()).filter(c => c.status === 'legendary').map(c => ({ ...c, shapes: [...c.shapes] })); }

    addShape(cloudId, shape) {
        const cloud = this.clouds.get(cloudId);
        if (!cloud) return { success: false, error: 'CLOUD_NOT_FOUND' };
        const shapeData = {
            shapeId: shape.shapeId || `shp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            form: shape.form || 'amorphous',
            density: shape.density || 5,
            addedAt: Date.now()
        };
        cloud.shapes.push(shapeData);
        this.stats.totalShapes++;
        this._triggerHook('shapeAdded', { cloudId, shapeId: shapeData.shapeId, form: shapeData.form });
        return { success: true, shape: shapeData };
    }

    raiseVolume(cloudId, amount = 5) {
        const cloud = this.clouds.get(cloudId);
        if (!cloud) return { success: false, error: 'CLOUD_NOT_FOUND' };
        cloud.volume += amount;
        this._triggerHook('volumeRaised', { cloudId, newVolume: cloud.volume, amount });
        return { success: true, newVolume: cloud.volume };
    }

    levelUpCloud(cloudId) {
        const cloud = this.clouds.get(cloudId);
        if (!cloud) return { success: false, error: 'CLOUD_NOT_FOUND' };
        cloud.level++;
        if (cloud.level >= 10) cloud.status = 'veteran';
        this._triggerHook('cloudLeveledUp', { cloudId, newLevel: cloud.level });
        return { success: true, newLevel: cloud.level };
    }

    legendCloud(cloudId) {
        const cloud = this.clouds.get(cloudId);
        if (!cloud) return { success: false, error: 'CLOUD_NOT_FOUND' };
        cloud.status = 'legendary';
        this._triggerHook('cloudLegendized', { cloudId, name: cloud.name });
        return { success: true, status: cloud.status };
    }

    calculateCloudValue(cloudId) {
        const cloud = this.clouds.get(cloudId);
        if (!cloud) return 0;
        return cloud.level * 100 + cloud.volume * 2 + cloud.shapes.length * 30;
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
        if (this.stats.totalRecruited < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseVolume += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { clouds: Array.from(this.clouds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.clouds) this.clouds = new Map(data.clouds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cloudCount: this.clouds.size, legendaryCount: this.listLegendary().length }; }
}
