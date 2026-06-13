/**
 * GravityControl.js - 重力掌控
 * V431 Iteration 8/15 Round 15 - Gravity Control
 *
 * 融合6大设计系统:
 * - generic-agent: 重力掌控自循环
 * - chatdev: 重力掌控角色协调
 * - nanobot: 重力掌控mesh
 * - claude-code: 重力掌控分析工具
 * - thunderbolt: 重力掌控持久化
 * - ruflo: 重力掌控Hook
 */

export class GravityControl {
    constructor(config = {}) {
        this.config = { maxFields: config.maxFields || 100, baseStrength: config.baseStrength || 10, ...config };
        this.fields = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFields: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getField', (ctx) => this.getField(ctx.fieldId));
        this.registerTool('createField', (ctx) => this.createField(ctx));
    }

    createField(data) {
        const id = data.id || `grv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const field = {
            fieldId: id,
            controllerId: data.controllerId,
            name: data.name || 'Gravity Field',
            strength: data.strength !== undefined ? data.strength : this.config.baseStrength,
            range: data.range || 5,
            mass: data.mass || 10,
            direction: data.direction || 'down',
            status: data.status || 'passive',
            createdAt: Date.now()
        };
        this.fields.set(id, field);
        this.stats.totalFields++;
        this._triggerHook('fieldCreated', { fieldId: id });
        return { success: true, field };
    }

    getField(id) { return this.fields.get(id) ? { ...this.fields.get(id) } : null; }
    listFields() { return Array.from(this.fields.values()).map(f => ({ ...f })); }
    listByController(controllerId) { return Array.from(this.fields.values()).filter(f => f.controllerId === controllerId).map(f => ({ ...f })); }
    listActive() { return Array.from(this.fields.values()).filter(f => f.status === 'active' || f.status === 'crushing').map(f => ({ ...f })); }

    increaseStrength(fieldId, amount = 5) {
        const field = this.fields.get(fieldId);
        if (!field) return { success: false, error: 'FIELD_NOT_FOUND' };
        field.strength += amount;
        this._triggerHook('strengthIncreased', { fieldId, newStrength: field.strength });
        return { success: true };
    }

    expandRange(fieldId, amount = 2) {
        const field = this.fields.get(fieldId);
        if (!field) return { success: false, error: 'FIELD_NOT_FOUND' };
        field.range += amount;
        this._triggerHook('rangeExpanded', { fieldId, newRange: field.range });
        return { success: true };
    }

    reverseGravity(fieldId) {
        const field = this.fields.get(fieldId);
        if (!field) return { success: false, error: 'FIELD_NOT_FOUND' };
        field.direction = field.direction === 'down' ? 'up' : 'down';
        this._triggerHook('gravityReversed', { fieldId, newDirection: field.direction });
        return { success: true };
    }

    deactivateField(fieldId) {
        const field = this.fields.get(fieldId);
        if (!field) return { success: false, error: 'FIELD_NOT_FOUND' };
        field.status = 'passive';
        this._triggerHook('fieldDeactivated', { fieldId });
        return { success: true };
    }

    calculateGravityForce(fieldId) {
        const field = this.fields.get(fieldId);
        if (!field) return 0;
        return field.strength * (1 + field.range / 10) + field.mass;
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
        if (this.stats.totalFields < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFields += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { fields: Array.from(this.fields.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.fields) this.fields = new Map(data.fields);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, fieldCount: this.fields.size }; }
}
