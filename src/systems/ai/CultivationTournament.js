/**
 * CultivationTournament.js - 修真比武
 * V544 Iteration 7/20 Round 22
 */
export class CultivationTournament {
    constructor(config = {}) {
        this.config = { maxTournaments: config.maxTournaments || 30, baseRounds: config.baseRounds || 5, ...config };
        this.tournaments = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTournaments: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTournament', (ctx) => this.getTournament(ctx.tournamentId));
        this.registerTool('startTournament', (ctx) => this.startTournament(ctx));
    }

    startTournament(data) {
        const id = data.tournamentId || data.id || `tnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tournament = {
            tournamentId: id,
            organizerId: data.organizerId,
            name: data.name || 'Untitled Tournament',
            type: data.type || 'elimination',
            rounds: data.rounds !== undefined ? data.rounds : this.config.baseRounds,
            winners: [],
            level: 1,
            status: 'planned',
            createdAt: Date.now()
        };
        this.tournaments.set(id, tournament);
        this.stats.totalTournaments++;
        this._triggerHook('tournamentStarted', { tournamentId: id });
        return { success: true, tournament };
    }

    getTournament(tournamentId) { return this.tournaments.get(tournamentId) ? { ...this.tournaments.get(tournamentId) } : null; }
    listTournaments() { return Array.from(this.tournaments.values()).map(t => ({ ...t })); }
    listByOrganizer(organizerId) { return Array.from(this.tournaments.values()).filter(t => t.organizerId === organizerId).map(t => ({ ...t })); }
    listActive() { return Array.from(this.tournaments.values()).filter(t => t.status === 'active').map(t => ({ ...t })); }

    addWinner(tournamentId, winner) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return { success: false, error: 'TOURNAMENT_NOT_FOUND' };
        const winnerEntry = {
            winnerId: winner.winnerId || `wnr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            cultivatorId: winner.cultivatorId,
            rank: winner.rank || tournament.winners.length + 1,
            prize: winner.prize || 0,
            awardedAt: Date.now()
        };
        tournament.winners.push(winnerEntry);
        this._triggerHook('winnerAdded', { tournamentId, winnerId: winnerEntry.winnerId });
        return { success: true, winner: winnerEntry };
    }

    increaseRounds(tournamentId, amount = 5) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return { success: false, error: 'TOURNAMENT_NOT_FOUND' };
        tournament.rounds += amount;
        if (tournament.status === 'planned' && tournament.rounds > 0) tournament.status = 'active';
        this._triggerHook('roundsIncreased', { tournamentId, newRounds: tournament.rounds });
        return { success: true, newRounds: tournament.rounds };
    }

    levelUpTournament(tournamentId) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return { success: false, error: 'TOURNAMENT_NOT_FOUND' };
        tournament.level++;
        this._triggerHook('tournamentLeveledUp', { tournamentId, newLevel: tournament.level });
        return { success: true, newLevel: tournament.level };
    }

    finishTournament(tournamentId) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return { success: false, error: 'TOURNAMENT_NOT_FOUND' };
        tournament.status = 'finished';
        this._triggerHook('tournamentFinished', { tournamentId });
        return { success: true };
    }

    calculateTournamentValue(tournamentId) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return 0;
        return tournament.level * 100 + tournament.rounds * 2 + tournament.winners.length * 30;
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
        if (this.stats.totalTournaments < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTournaments += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tournaments: Array.from(this.tournaments.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tournaments) this.tournaments = new Map(data.tournaments);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tournamentCount: this.tournaments.size }; }
}
