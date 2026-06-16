/**
 * CultivationMachine.js - 修真机械
 * V573 Iteration 16/20 Round 23
 */
export class CultivationMachine {
    constructor(config = {}) {
        this.config = { maxMachines: config.maxMachines || 50, basePrecision: config.basePrecision || 20, ...config };
        this.machines = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMachines: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMachine', (ctx) => this.getMachine(ctx.machineId));
        this.registerTool('buildMachine', (ctx) => this.buildMachine(ctx));
    }

    buildMachine(data) {
        const id = data.id || `mch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const machine = {
            machineId: id,
            engineerId: data.engineerId,
            name: data.name || 'Unnamed Machine',
            type: data.type || 'gear',
            precision: data.precision || this.config.basePrecision,
            components: data.components || [],
            level: data.level || 1,
            status: 'assembled',
            builtAt: Date.now()
        };
        this.machines.set(id, machine);
        this.stats.totalMachines++;
        this._triggerHook('machineBuilt', { machineId: id });
        return { success: true, machine };
    }

    getMachine(id) { return this.machines.get(id) ? { ...this.machines.get(id) } : null; }
    listMachines() { return Array.from(this.machines.values()).map(m => ({ ...m })); }
    listByEngineer(engineerId) { return Array.from(this.machines.values()).filter(m => m.engineerId === engineerId).map(m => ({ ...m })); }
    listPerfect() { return Array.from(this.machines.values()).filter(m => m.status === 'perfect').map(m => ({ ...m })); }

    addComponent(machineId, component) {
        const machine = this.machines.get(machineId);
        if (!machine) return { success: false, error: 'MACHINE_NOT_FOUND' };
        machine.components.push(component);
        if (machine.status === 'assembled') machine.status = 'operational';
        this._triggerHook('componentAdded', { machineId, component });
        return { success: true };
    }

    increasePrecision(machineId, amount = 5) {
        const machine = this.machines.get(machineId);
        if (!machine) return { success: false, error: 'MACHINE_NOT_FOUND' };
        machine.precision += amount;
        this._triggerHook('precisionIncreased', { machineId, newPrecision: machine.precision });
        return { success: true };
    }

    levelUpMachine(machineId) {
        const machine = this.machines.get(machineId);
        if (!machine) return { success: false, error: 'MACHINE_NOT_FOUND' };
        machine.level++;
        this._triggerHook('machineLeveledUp', { machineId, newLevel: machine.level });
        return { success: true };
    }

    perfectMachine(machineId) {
        const machine = this.machines.get(machineId);
        if (!machine) return { success: false, error: 'MACHINE_NOT_FOUND' };
        machine.status = 'perfect';
        this._triggerHook('machinePerfected', { machineId });
        return { success: true };
    }

    calculateMachineValue(machineId) {
        const machine = this.machines.get(machineId);
        if (!machine) return 0;
        return machine.level * 100 + machine.precision * 2 + machine.components.length * 30;
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
        if (this.stats.totalMachines < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMachines += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { machines: Array.from(this.machines.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.machines) this.machines = new Map(data.machines);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, machineCount: this.machines.size }; }
}
