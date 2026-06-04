/**
 * CombatSimulationEngine.js - 战斗仿真引擎
 * V317 Iteration 5/9 Round 4
 */
export class CombatSimulationEngine {
    constructor(config = {}) {
        this.config = { maxSimulations: config.maxSimulations || 100, baseCritRate: config.baseCritRate || 0.1, ...config };
        this.simulations = new Map();
        this.results = new Map();
        this.fighters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSimulations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('runSimulation', (ctx) => this.runSimulation(ctx.fighterA, ctx.fighterB));
        this.registerTool('getFighter', (ctx) => this.getFighter(ctx.fighterId));
    }

    registerFighter(data) {
        const id = data.id || `fgt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fighter = { fighterId: id, name: data.name || 'Unnamed', hp: data.hp || 100, attack: data.attack || 10, defense: data.defense || 5, speed: data.speed || 1, critRate: data.critRate || this.config.baseCritRate };
        this.fighters.set(id, fighter);
        return { success: true, fighter };
    }

    getFighter(id) { return this.fighters.get(id) ? { ...this.fighters.get(id) } : null; }
    listFighters() { return Array.from(this.fighters.values()).map(f => ({ ...f })); }

    runSimulation(fighterAId, fighterBId) {
        const a = this.fighters.get(fighterAId);
        const b = this.fighters.get(fighterBId);
        if (!a || !b) return { success: false, error: 'FIGHTER_NOT_FOUND' };
        const simId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sim = this._simulate(a, b);
        const result = { simId, fighterAId, fighterBId, ...sim, timestamp: Date.now() };
        this.simulations.set(simId, result);
        this.stats.totalSimulations++;
        this._triggerHook('simulationCompleted', result);
        return { success: true, result };
    }

    _simulate(a, b) {
        const log = [];
        let aHp = a.hp, bHp = b.hp;
        let round = 0;
        const maxRounds = 100;
        while (aHp > 0 && bHp > 0 && round < maxRounds) {
            round++;
            // A attacks B
            const isCritA = Math.random() < a.critRate;
            const damageA = Math.max(1, a.attack - b.defense) * (isCritA ? 2 : 1);
            bHp -= damageA;
            log.push({ round, attacker: a.fighterId, target: b.fighterId, damage: damageA, crit: isCritA, targetHp: Math.max(0, bHp) });
            if (bHp <= 0) break;
            // B attacks A
            const isCritB = Math.random() < b.critRate;
            const damageB = Math.max(1, b.attack - a.defense) * (isCritB ? 2 : 1);
            aHp -= damageB;
            log.push({ round, attacker: b.fighterId, target: a.fighterId, damage: damageB, crit: isCritB, targetHp: Math.max(0, aHp) });
        }
        return {
            winner: aHp > 0 ? a.fighterId : b.fighterId,
            rounds: round,
            aHpRemaining: Math.max(0, aHp),
            bHpRemaining: Math.max(0, bHp),
            log
        };
    }

    getSimulation(simId) { return this.simulations.get(simId) ? { ...this.simulations.get(simId) } : null; }
    listSimulations() { return Array.from(this.simulations.values()).map(s => ({ ...s })); }

    calculateWinRate(fighterAId, fighterBId, iterations = 100) {
        const a = this.fighters.get(fighterAId);
        const b = this.fighters.get(fighterBId);
        if (!a || !b) return { success: false, error: 'FIGHTER_NOT_FOUND' };
        let aWins = 0;
        for (let i = 0; i < iterations; i++) {
            const result = this._simulate(a, b);
            if (result.winner === a.fighterId) aWins++;
        }
        return { success: true, winRate: aWins / iterations, sample: iterations };
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
        if (this.stats.totalSimulations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseCritRate = Math.min(0.5, this.config.baseCritRate + 0.05);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { fighters: Array.from(this.fighters.entries()), simulations: Array.from(this.simulations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.fighters) this.fighters = new Map(data.fighters);
        if (data.simulations) this.simulations = new Map(data.simulations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, fighterCount: this.fighters.size, simulationCount: this.simulations.size }; }
}