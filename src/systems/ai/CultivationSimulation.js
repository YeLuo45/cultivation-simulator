/**
 * CultivationSimulation.js - 修真模拟
 * V577 Iteration 20/20 FINAL Round 23
 */
export class CultivationSimulation {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxScenarios: config.maxScenarios || 100, baseReality: config.baseReality || 50, ...config };
        this.scenarios = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalScenarios: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getScenario', (ctx) => this.getScenario(ctx.scenarioId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.scenarioId));
    }

    createScenario(data) {
        const id = data.id || `csim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const scenario = { scenarioId: id, name: data.name || 'Unnamed Scenario', simulator: data.simulator || 'unknown', type: data.type || 'virtual', reality: data.reality || this.config.baseReality, agents: data.agents || 1, level: data.level || 1, status: 'pending', createdAt: Date.now(), lastRefresh: Date.now() };
        this.scenarios.set(id, scenario);
        this.metrics.set(id, { stability: 50, complexity: 60, fidelity: 75 });
        this.stats.totalScenarios++;
        this._triggerHook('scenarioCreated', { scenarioId: id });
        return { success: true, scenario };
    }

    getScenario(id) { return this.scenarios.get(id) ? { ...this.scenarios.get(id) } : null; }
    listScenarios() { return Array.from(this.scenarios.values()).map(s => ({ ...s })); }
    listBySimulator(simulator) { return Array.from(this.scenarios.values()).filter(s => s.simulator === simulator).map(s => ({ ...s })); }
    listByType(type) { return Array.from(this.scenarios.values()).filter(s => s.type === type).map(s => ({ ...s })); }
    listByReality(min) { return Array.from(this.scenarios.values()).filter(s => s.reality >= min).map(s => ({ ...s })); }
    listTop(n = 10) { return [...this.listScenarios()].sort((a, b) => b.reality - a.reality).slice(0, n); }

    setMetrics(scenarioId, metrics) {
        const current = this.metrics.get(scenarioId);
        if (!current) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        this.metrics.set(scenarioId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(scenarioId) { return this.metrics.get(scenarioId) ? { ...this.metrics.get(scenarioId) } : null; }

    refreshScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        scenario.lastRefresh = Date.now();
        this._triggerHook('scenarioRefreshed', { scenarioId });
        return { success: true };
    }

    gainReality(scenarioId, amount = 10) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        scenario.reality += amount;
        this._triggerHook('realityGained', { scenarioId });
        return { success: true };
    }

    spawnAgent(scenarioId, amount = 5) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        scenario.agents += amount;
        this._triggerHook('agentSpawned', { scenarioId });
        return { success: true };
    }

    promoteScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        scenario.level++;
        this._triggerHook('scenarioPromoted', { scenarioId });
        return { success: true };
    }

    changeType(scenarioId, newType) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        scenario.type = newType;
        this._triggerHook('typeChanged', { scenarioId });
        return { success: true };
    }

    startScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        scenario.status = 'running';
        this._triggerHook('scenarioStarted', { scenarioId });
        return { success: true };
    }

    stopScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        scenario.status = 'stopped';
        this._triggerHook('scenarioStopped', { scenarioId });
        return { success: true };
    }

    calculateSimulationValue(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) return 0;
        return scenario.level * 100 + scenario.reality * 2 + scenario.agents * 10;
    }

    deleteScenario(scenarioId) {
        if (!this.scenarios.has(scenarioId)) return { success: false, error: 'SCENARIO_NOT_FOUND' };
        this.scenarios.delete(scenarioId);
        this.metrics.delete(scenarioId);
        this._triggerHook('scenarioDeleted', { scenarioId });
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

    autoEvolve() {
        if (this.stats.totalScenarios < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { scenarios: Array.from(this.scenarios.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.scenarios) this.scenarios = new Map(data.scenarios);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, scenarioCount: this.scenarios.size }; }
}