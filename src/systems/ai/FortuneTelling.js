/**
 * FortuneTelling.js - 卜卦
 * V429 Iteration 6/15 Round 15 - Fortune Telling
 *
 * 融合6大设计系统:
 * - generic-agent: 卜卦自循环
 * - chatdev: 卜卦角色协调
 * - nanobot: 卜卦mesh
 * - claude-code: 卜卦分析工具
 * - thunderbolt: 卜卦持久化
 * - ruflo: 卜卦Hook
 */

export class FortuneTelling {
    constructor(config = {}) {
        this.config = { maxReadings: config.maxReadings || 100, baseAccuracy: config.baseAccuracy || 50, ...config };
        this.readings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalReadings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getReading', (ctx) => this.getReading(ctx.readingId));
        this.registerTool('performReading', (ctx) => this.performReading(ctx));
    }

    performReading(data) {
        const id = data.id || `ftn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const reading = {
            readingId: id,
            inquirerId: data.inquirerId,
            question: data.question || '',
            hexagram: data.hexagram || null,
            lines: data.lines || [],
            interpretation: data.interpretation || '',
            accuracy: data.accuracy !== undefined ? data.accuracy : this.config.baseAccuracy,
            status: data.status || 'pending',
            createdAt: Date.now()
        };
        this.readings.set(id, reading);
        this.stats.totalReadings++;
        this._triggerHook('readingPerformed', { readingId: id });
        return { success: true, reading };
    }

    getReading(id) { return this.readings.get(id) ? { ...this.readings.get(id) } : null; }
    listReadings() { return Array.from(this.readings.values()).map(r => ({ ...r })); }
    listByInquirer(inquirerId) { return Array.from(this.readings.values()).filter(r => r.inquirerId === inquirerId).map(r => ({ ...r })); }
    listAccurate(threshold = 70) { return Array.from(this.readings.values()).filter(r => r.accuracy >= threshold).map(r => ({ ...r })); }

    castHexagram(readingId, hexagram) {
        const reading = this.readings.get(readingId);
        if (!reading) return { success: false, error: 'READING_NOT_FOUND' };
        reading.hexagram = hexagram;
        reading.status = 'hexagram_cast';
        this._triggerHook('hexagramCast', { readingId, hexagram });
        return { success: true };
    }

    divineLine(readingId, line) {
        const reading = this.readings.get(readingId);
        if (!reading) return { success: false, error: 'READING_NOT_FOUND' };
        reading.lines.push(line);
        this._triggerHook('lineDrawn', { readingId, line });
        return { success: true };
    }

    interpretDivination(readingId, interpretation) {
        const reading = this.readings.get(readingId);
        if (!reading) return { success: false, error: 'READING_NOT_FOUND' };
        reading.interpretation = interpretation;
        reading.status = 'interpreted';
        reading.accuracy = this.calculateAccuracy(readingId);
        this._triggerHook('divinationInterpreted', { readingId, interpretation });
        return { success: true };
    }

    calculateAccuracy(readingId) {
        const reading = this.readings.get(readingId);
        if (!reading) return 0;
        return reading.lines.length * 10 + reading.interpretation.length;
    }

    listAccurateDefault() { return this.listAccurate(70); }

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
