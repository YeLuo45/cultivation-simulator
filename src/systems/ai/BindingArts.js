/**
 * BindingArts.js - 束缚术
 * V459 Iteration 6/15 Round 17 - Binding Arts
 */
export class BindingArts {
    constructor(config = {}) {
        this.config = { maxBindings: config.maxBindings || 100, baseStrength: config.baseStrength || 15, ...config };
        this.bindings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBindings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBinding', (ctx) => this.getBinding(ctx.bindingId));
        this.registerTool('castBinding', (ctx) => this.castBinding(ctx));
    }

    castBinding(data) {
        const id = data.id || `bnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const binding = {
            bindingId: id,
            binderId: data.binderId,
            name: data.name || 'unnamed_binding',
            type: data.type || 'rope',
            strength: data.strength || this.config.baseStrength,
            duration: data.duration || 30,
            targets: data.targets || [],
            status: 'cast',
            castAt: Date.now()
        };
        this.bindings.set(id, binding);
        this.stats.totalBindings++;
        this._triggerHook('bindingCast', { bindingId: id });
        return { success: true, binding };
    }

    getBinding(id) { return this.bindings.get(id) ? { ...this.bindings.get(id) } : null; }
    listBindings() { return Array.from(this.bindings.values()).map(b => ({ ...b })); }
    listByBinder(binderId) { return Array.from(this.bindings.values()).filter(b => b.binderId === binderId).map(b => ({ ...b })); }
    listByType(type) { return Array.from(this.bindings.values()).filter(b => b.type === type).map(b => ({ ...b })); }

    tightenBinding(bindingId, amount = 5) {
        const binding = this.bindings.get(bindingId);
        if (!binding) return { success: false, error: 'BINDING_NOT_FOUND' };
        binding.strength += amount;
        this._triggerHook('bindingTightened', { bindingId, newStrength: binding.strength });
        return { success: true };
    }

    extendBinding(bindingId, amount = 10) {
        const binding = this.bindings.get(bindingId);
        if (!binding) return { success: false, error: 'BINDING_NOT_FOUND' };
        binding.duration += amount;
        this._triggerHook('bindingExtended', { bindingId, newDuration: binding.duration });
        return { success: true };
    }

    addTarget(bindingId, target) {
        const binding = this.bindings.get(bindingId);
        if (!binding) return { success: false, error: 'BINDING_NOT_FOUND' };
        binding.targets.push(target);
        if (binding.status === 'cast') binding.status = 'active';
        return { success: true };
    }

    severBinding(bindingId) {
        const binding = this.bindings.get(bindingId);
        if (!binding) return { success: false, error: 'BINDING_NOT_FOUND' };
        binding.status = 'severed';
        this._triggerHook('bindingSevered', { bindingId });
        return { success: true };
    }

    calculateBindingPower(bindingId) {
        const binding = this.bindings.get(bindingId);
        if (!binding) return 0;
        return binding.strength * (1 + binding.duration / 100) + binding.targets.length * 3;
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
        if (this.stats.totalBindings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBindings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bindings: Array.from(this.bindings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bindings) this.bindings = new Map(data.bindings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bindingCount: this.bindings.size }; }
}
