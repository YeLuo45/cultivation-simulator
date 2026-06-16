/**
 * CultivationForm.js - 修真招式
 * V694 Iteration 17/30 Round 28 - Cultivation Form
 */
export class CultivationForm {
    constructor(config = {}) {
        this.config = { maxForms: config.maxForms || 50, baseFlow: config.baseFlow || 20, ...config };
        this.forms = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalForms: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getForm', (ctx) => this.getForm(ctx.formId));
        this.registerTool('recruitForm', (ctx) => this.recruitForm(ctx));
    }

    recruitForm(data) {
        const id = data.id || `cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const form = {
            formId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-form',
            type: data.type || 'offense',
            flow: data.flow || this.config.baseFlow,
            strikes: data.strikes || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.forms.set(id, form);
        this.stats.totalForms++;
        this._triggerHook('formRecruited', { formId: id });
        return { success: true, form };
    }

    getForm(id) { return this.forms.get(id) ? { ...this.forms.get(id) } : null; }
    listForms() { return Array.from(this.forms.values()).map(f => ({ ...f })); }
    listByMaster(masterId) { return Array.from(this.forms.values()).filter(f => f.masterId === masterId).map(f => ({ ...f })); }
    listLegendary() { return Array.from(this.forms.values()).filter(f => f.status === 'legendary').map(f => ({ ...f })); }

    addStrike(formId, strike) {
        const form = this.forms.get(formId);
        if (!form) return { success: false, error: 'FORM_NOT_FOUND' };
        form.strikes.push(strike);
        this._triggerHook('strikeAdded', { formId, strike });
        return { success: true };
    }

    smoothFlow(formId, amount = 5) {
        const form = this.forms.get(formId);
        if (!form) return { success: false, error: 'FORM_NOT_FOUND' };
        form.flow += amount;
        this._triggerHook('flowSmoothed', { formId, newFlow: form.flow });
        return { success: true };
    }

    levelUpForm(formId) {
        const form = this.forms.get(formId);
        if (!form) return { success: false, error: 'FORM_NOT_FOUND' };
        form.level++;
        this._triggerHook('formLeveledUp', { formId, newLevel: form.level });
        return { success: true };
    }

    legendForm(formId) {
        const form = this.forms.get(formId);
        if (!form) return { success: false, error: 'FORM_NOT_FOUND' };
        form.status = 'legendary';
        this._triggerHook('formLegendized', { formId });
        return { success: true };
    }

    calculateFormValue(formId) {
        const form = this.forms.get(formId);
        if (!form) return 0;
        return form.level * 100 + form.flow * 2 + form.strikes.length * 30;
    }

    listVeteran() { return Array.from(this.forms.values()).filter(f => f.status === 'veteran').map(f => ({ ...f })); }

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
        if (this.stats.totalForms < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxForms += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { forms: Array.from(this.forms.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.forms) this.forms = new Map(data.forms);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, formCount: this.forms.size }; }
}
