/**
 * CultivationDreamReincarnationVision.js - 修真轮回幻视
 * V871 Iteration 5/30 Round 34
 */
export const LIFE_STAGES = ['past', 'present', 'future'];
export const VISION_SCENES = [
    'celestial_court', 'mortal_village', 'battlefield', 'mountain_peak', 'underwater_palace',
    'burning_temple', 'starry_void', 'bamboo_forest', 'ancient_ruins', 'thunder_storm'
];
export const INTERPRETATION_DEPTH = ['surface', 'shallow', 'medium', 'deep', 'profound'];

export class CultivationDreamReincarnationVision {
    constructor(config = {}) {
        this.config = { maxVisions: config.maxVisions || 50, sceneCount: config.sceneCount || 3, ...config };
        this.visions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTriggered: 0, totalAccepted: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVision', (ctx) => this.getVision(ctx.visionId));
        this.registerTool('listByStage', (ctx) => this.listByStage(ctx.lifeStage));
    }

    triggerVision(dreamId, lifeStage) {
        if (!LIFE_STAGES.includes(lifeStage)) return { success: false, error: 'INVALID_STAGE' };
        const id = `vision_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const scenes = [];
        const used = new Set();
        for (let i = 0; i < this.config.sceneCount; i++) {
            let idx = Math.floor(Math.random() * VISION_SCENES.length);
            let attempts = 0;
            while (used.has(idx) && attempts < 20) { idx = Math.floor(Math.random() * VISION_SCENES.length); attempts++; }
            used.add(idx);
            scenes.push(VISION_SCENES[idx]);
        }
        const vision = {
            id, dreamId, lifeStage, scenes,
            interpretation: null, depth: null,
            accepted: false, triggeredAt: Date.now()
        };
        this.visions.set(id, vision);
        this.stats.totalTriggered++;
        this._triggerHook('visionTriggered', { id, dreamId, lifeStage });
        return { success: true, vision };
    }

    getVision(id) { return this.visions.get(id) ? { ...this.visions.get(id) } : null; }
    listVisions() { return Array.from(this.visions.values()).map(v => ({ ...v })); }
    listByStage(lifeStage) { return Array.from(this.visions.values()).filter(v => v.lifeStage === lifeStage).map(v => ({ ...v })); }
    listByDream(dreamId) { return Array.from(this.visions.values()).filter(v => v.dreamId === dreamId).map(v => ({ ...v })); }
    listAccepted() { return Array.from(this.visions.values()).filter(v => v.accepted).map(v => ({ ...v })); }

    interpretVision(visionId) {
        const vision = this.visions.get(visionId);
        if (!vision) return { success: false, error: 'VISION_NOT_FOUND' };
        const depthIdx = Math.min(INTERPRETATION_DEPTH.length - 1, vision.scenes.length);
        vision.depth = INTERPRETATION_DEPTH[depthIdx];
        vision.interpretation = `${vision.lifeStage} life reveals ${vision.scenes.join(', ')} at ${vision.depth} level.`;
        vision.interpretedAt = Date.now();
        this._triggerHook('visionInterpreted', { visionId, depth: vision.depth });
        return { success: true, interpretation: vision.interpretation, depth: vision.depth };
    }

    acceptVision(visionId) {
        const vision = this.visions.get(visionId);
        if (!vision) return { success: false, error: 'VISION_NOT_FOUND' };
        vision.accepted = true;
        vision.acceptedAt = Date.now();
        this.stats.totalAccepted++;
        this._triggerHook('visionAccepted', { visionId });
        return { success: true };
    }

    addScene(visionId, scene) {
        const vision = this.visions.get(visionId);
        if (!vision) return { success: false, error: 'VISION_NOT_FOUND' };
        if (!VISION_SCENES.includes(scene)) return { success: false, error: 'INVALID_SCENE' };
        if (!vision.scenes.includes(scene)) vision.scenes.push(scene);
        return { success: true };
    }

    getDepthName(scenes) {
        const count = Array.isArray(scenes) ? scenes.length : 0;
        return INTERPRETATION_DEPTH[Math.min(INTERPRETATION_DEPTH.length - 1, count)];
    }

    deleteVision(visionId) {
        if (!this.visions.has(visionId)) return { success: false, error: 'VISION_NOT_FOUND' };
        this.visions.delete(visionId);
        this._triggerHook('visionDeleted', { visionId });
        return { success: true };
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

    toJSON() { return { visions: Array.from(this.visions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.visions) this.visions = new Map(data.visions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, visionCount: this.visions.size }; }
}
