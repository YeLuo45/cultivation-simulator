/**
 * MindReading.js - 读心
 * V419 Iteration 11/15 Round 14 - Mind Reading
 *
 * 融合6大设计系统:
 * - generic-agent: 读心自循环
 * - chatdev: 读心角色协调
 * - nanobot: 读心mesh
 * - claude-code: 读心分析工具
 * - thunderbolt: 读心持久化
 * - ruflo: 读心Hook
 */

export class MindReading {
    constructor(config = {}) {
        this.config = { maxReadings: config.maxReadings || 100, baseDepth: config.baseDepth || 10, ...config };
        this.readings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalReadings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getReading', (ctx) => this.getReading(ctx.readingId));
        this.registerTool('startReading', (ctx) => this.startReading(ctx));
    }

    startReading(data) {
        const id = data.id || `rdg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const reading = {
            readingId: id,
            readerId: data.readerId,
            targetId: data.targetId,
            depth: data.depth !== undefined ? data.depth : this.config.baseDepth,
            thoughts: data.thoughts || [],
            emotions: data.emotions || [],
            secrets: data.secrets || [],
            status: data.status || 'active',
            createdAt: Date.now()
        };
        this.readings.set(id, reading);
        this.stats.totalReadings++;
        this._triggerHook('readingStarted', { readingId: id });
        return { success: true, reading };
    }

    getReading(id) { return this.readings.get(id) ? { ...this.readings.get(id) } : null; }
    listReadings() { return Array.from(this.readings.values()).map(r => ({ ...r })); }
    listByReader(readerId) { return Array.from(this.readings.values()).filter(r => r.readerId === readerId).map(r => ({ ...r })); }
    listByTarget(targetId) { return Array.from(this.readings.values()).filter(r => r.targetId === targetId).map(r => ({ ...r })); }

    digDeeper(readingId, amount = 5) {
        const reading = this.readings.get(readingId);
        if (!reading) return { success: false, error: 'READING_NOT_FOUND' };
        reading.depth += amount;
        this._triggerHook('readingDeepened', { readingId, newDepth: reading.depth });
        return { success: true };
    }

    extractThought(readingId, thought) {
        const reading = this.readings.get(readingId);
        if (!reading) return { success: false, error: 'READING_NOT_FOUND' };
        reading.thoughts.push(thought);
        this._triggerHook('thoughtExtracted', { readingId, thought });
        return { success: true };
    }

    readEmotion(readingId, emotion) {
        const reading = this.readings.get(readingId);
        if (!reading) return { success: false, error: 'READING_NOT_FOUND' };
        reading.emotions.push(emotion);
        this._triggerHook('emotionRead', { readingId, emotion });
        return { success: true };
    }

    calculateInsight(readingId) {
        const reading = this.readings.get(readingId);
        if (!reading) return 0;
        return reading.depth * 2 + reading.thoughts.length * 5 + reading.emotions.length * 3 + reading.secrets.length * 10;
    }

    listDeep() { return Array.from(this.readings.values()).filter(r => r.depth >= 20).map(r => ({ ...r })); }

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
        if (this.stats.totalReadings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxReadings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { readings: Array.from(this.readings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.readings) this.readings = new Map(data.readings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, readingCount: this.readings.size }; }
}
