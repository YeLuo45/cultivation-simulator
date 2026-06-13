/**
 * MedicineMixing.js - 药剂调配系统
 * V505 Iteration 7/20 Round 20
 */
export class MedicineMixing {
    constructor(config = {}) {
        this.config = { maxMedicines: config.maxMedicines || 200, baseEfficacy: config.baseEfficacy || 15, ...config };
        this.medicines = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMedicines: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMedicine', (ctx) => this.getMedicine(ctx.medicineId));
        this.registerTool('mixMedicine', (ctx) => this.mixMedicine(ctx));
    }

    mixMedicine(data) {
        const id = data.id || `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const medicine = { medicineId: id, mixerId: data.mixerId, name: data.name || 'Mystic Tonic', type: data.type || 'tonic', efficacy: data.efficacy || this.config.baseEfficacy, components: data.components || [], status: 'mixed', mixedAt: Date.now() };
        this.medicines.set(id, medicine);
        this.stats.totalMedicines++;
        this._triggerHook('medicineMixed', { medicineId: id });
        return { success: true, medicine };
    }

    getMedicine(id) { return this.medicines.get(id) ? { ...this.medicines.get(id) } : null; }
    listMedicines() { return Array.from(this.medicines.values()).map(m => ({ ...m })); }
    listByMixer(mixerId) { return Array.from(this.medicines.values()).filter(m => m.mixerId === mixerId).map(m => ({ ...m })); }
    listConcentrated() { return Array.from(this.medicines.values()).filter(m => m.status === 'concentrated').map(m => ({ ...m })); }

    addComponent(medicineId, component) {
        const medicine = this.medicines.get(medicineId);
        if (!medicine) return { success: false, error: 'MEDICINE_NOT_FOUND' };
        medicine.components.push(component);
        this._triggerHook('componentAdded', { medicineId, component });
        return { success: true };
    }

    increaseEfficacy(medicineId, amount = 5) {
        const medicine = this.medicines.get(medicineId);
        if (!medicine) return { success: false, error: 'MEDICINE_NOT_FOUND' };
        medicine.efficacy += amount;
        this._triggerHook('efficacyIncreased', { medicineId, newEfficacy: medicine.efficacy });
        return { success: true };
    }

    concentrateMedicine(medicineId) {
        const medicine = this.medicines.get(medicineId);
        if (!medicine) return { success: false, error: 'MEDICINE_NOT_FOUND' };
        medicine.status = 'concentrated';
        this._triggerHook('medicineConcentrated', { medicineId });
        return { success: true };
    }

    calculateMedicinePower(medicineId) {
        const medicine = this.medicines.get(medicineId);
        if (!medicine) return 0;
        return medicine.efficacy * 10 + medicine.components.length * 5;
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
        if (this.stats.totalMedicines < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMedicines += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { medicines: Array.from(this.medicines.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.medicines) this.medicines = new Map(data.medicines);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, medicineCount: this.medicines.size }; }
}
