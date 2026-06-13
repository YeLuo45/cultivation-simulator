/**
 * TacticalCoordination.js - 战术协调系统
 * V314 Iteration 2/9 Round 4 - Tactical Coordination
 */
export class TacticalCoordination {
    constructor(config = {}) {
        this.config = {
            maxTacticsPerBattle: config.maxTacticsPerBattle || 10,
            coordinationBonus: config.coordinationBonus || 0.15,
            ...config
        };
        this.tactics = new Map();
        this.battles = new Map();
        this.teams = new Map();
        this.coordinationLog = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTactics: 0, totalBattles: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const defaults = [
            { tacticId: 'flank', name: 'Flank Attack', category: 'offense', power: 30 },
            { tacticId: 'ambush', name: 'Ambush', category: 'offense', power: 50 },
            { tacticId: 'retreat', name: 'Tactical Retreat', category: 'defense', power: 20 },
            { tacticId: 'siege', name: 'Siege', category: 'offense', power: 80 },
            { tacticId: 'defend', name: 'Defend', category: 'defense', power: 25 }
        ];
        for (const t of defaults) this.tactics.set(t.tacticId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getTactic', (ctx) => this.getTactic(ctx.tacticId));
        this.registerTool('executeTactic', (ctx) => this.executeTactic(ctx.battleId, ctx.tacticId, ctx.teamId));
    }

    registerTactic(data) {
        const id = data.id || `tac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tactic = { tacticId: id, name: data.name || 'Unnamed', category: data.category || 'general', power: data.power || 10 };
        this.tactics.set(id, tactic);
        this.stats.totalTactics++;
        this._triggerHook('tacticRegistered', { tacticId: id });
        return { success: true, tactic };
    }

    getTactic(id) { const t = this.tactics.get(id); return t ? { ...t } : null; }
    listTactics(filter = {}) {
        let all = Array.from(this.tactics.values());
        if (filter.category) all = all.filter(t => t.category === filter.category);
        return all.map(t => ({ ...t }));
    }

    createBattle(data) {
        const id = data.id || `btl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const battle = { battleId: id, name: data.name || 'Battle', teams: [], status: 'active', createdAt: Date.now(), tactics: [] };
        this.battles.set(id, battle);
        this.stats.totalBattles++;
        this._triggerHook('battleCreated', { battleId: id });
        return { success: true, battle };
    }

    getBattle(id) { const b = this.battles.get(id); return b ? { ...b } : null; }

    addTeamToBattle(battleId, teamId) {
        const battle = this.battles.get(battleId);
        if (!battle) return { success: false, error: 'BATTLE_NOT_FOUND' };
        if (!battle.teams.includes(teamId)) battle.teams.push(teamId);
        if (!this.teams.has(teamId)) this.teams.set(teamId, { teamId, members: [], coordination: 0.5 });
        return { success: true, battle: { ...battle } };
    }

    addMemberToTeam(teamId, memberId) {
        const team = this.teams.get(teamId);
        if (!team) return { success: false, error: 'TEAM_NOT_FOUND' };
        if (!team.members.includes(memberId)) team.members.push(memberId);
        return { success: true, team: { ...team } };
    }

    calculateCoordination(teamId) {
        const team = this.teams.get(teamId);
        if (!team) return { success: false, error: 'TEAM_NOT_FOUND' };
        const base = team.members.length > 0 ? Math.min(1, team.members.length * 0.1) : 0;
        const bonus = this.config.coordinationBonus * team.members.length;
        team.coordination = Math.min(1, base + bonus);
        return { success: true, coordination: team.coordination };
    }

    executeTactic(battleId, tacticId, teamId) {
        const battle = this.battles.get(battleId);
        if (!battle) return { success: false, error: 'BATTLE_NOT_FOUND' };
        if (battle.status !== 'active') return { success: false, error: 'BATTLE_INACTIVE' };
        const tactic = this.tactics.get(tacticId);
        if (!tactic) return { success: false, error: 'TACTIC_NOT_FOUND' };
        const team = this.teams.get(teamId);
        if (!team) return { success: false, error: 'TEAM_NOT_FOUND' };
        const effectivePower = tactic.power * team.coordination;
        const event = { battleId, tacticId, teamId, effectivePower, timestamp: Date.now() };
        battle.tactics.push(event);
        this.coordinationLog.push(event);
        this._triggerHook('tacticExecuted', event);
        return { success: true, event };
    }

    endBattle(battleId) {
        const battle = this.battles.get(battleId);
        if (!battle) return { success: false, error: 'BATTLE_NOT_FOUND' };
        if (battle.status !== 'active') return { success: false, error: 'BATTLE_INACTIVE' };
        battle.status = 'ended';
        battle.endedAt = Date.now();
        this._triggerHook('battleEnded', { battleId });
        return { success: true, battle: { ...battle } };
    }

    getCoordinationLog() { return [...this.coordinationLog]; }

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
        if (this.stats.totalBattles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.coordinationBonus = Math.min(0.5, this.config.coordinationBonus + 0.05);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            tactics: Array.from(this.tactics.entries()),
            battles: Array.from(this.battles.entries()),
            teams: Array.from(this.teams.entries()),
            coordinationLog: this.coordinationLog,
            stats: this.stats, config: this.config
        };
    }
    fromJSON(data) {
        if (data.tactics) this.tactics = new Map(data.tactics);
        if (data.battles) this.battles = new Map(data.battles);
        if (data.teams) this.teams = new Map(data.teams);
        if (data.coordinationLog) this.coordinationLog = data.coordinationLog;
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tacticCount: this.tactics.size, battleCount: this.battles.size, teamCount: this.teams.size }; }
}