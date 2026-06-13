/**
 * GoStrategy.js - 棋道
 * V427 Iteration 4/15 Round 15
 */
export class GoStrategy {
    constructor(config = {}) {
        this.config = { maxGames: config.maxGames || 100, baseBoardSize: config.baseBoardSize || 19, ...config };
        this.games = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGames: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGame', (ctx) => this.getGame(ctx.gameId));
        this.registerTool('startGame', (ctx) => this.startGame(ctx));
    }

    startGame(data) {
        const id = data.id || `go_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const game = { gameId: id, player1: data.player1, player2: data.player2, boardSize: data.boardSize || this.config.baseBoardSize, blackStones: 0, whiteStones: 0, status: 'active', strategy: data.strategy || 'balanced', position: [], startedAt: Date.now() };
        this.games.set(id, game);
        this.stats.totalGames++;
        this._triggerHook('gameStarted', { gameId: id });
        return { success: true, game };
    }

    getGame(id) { return this.games.get(id) ? { ...this.games.get(id) } : null; }
    listGames() { return Array.from(this.games.values()).map(g => ({ ...g })); }
    listByPlayer(playerId) { return Array.from(this.games.values()).filter(g => g.player1 === playerId || g.player2 === playerId).map(g => ({ ...g })); }
    listActive() { return Array.from(this.games.values()).filter(g => g.status === 'active').map(g => ({ ...g })); }
    listFinished() { return Array.from(this.games.values()).filter(g => g.status === 'finished').map(g => ({ ...g })); }

    placeStone(gameId, color, position) {
        const game = this.games.get(gameId);
        if (!game) return { success: false, error: 'GAME_NOT_FOUND' };
        if (game.status !== 'active') return { success: false, error: 'GAME_OVER' };
        if (color === 'black') game.blackStones++;
        else if (color === 'white') game.whiteStones++;
        else return { success: false, error: 'INVALID_COLOR' };
        game.position.push({ color, position });
        this._triggerHook('stonePlaced', { gameId, color, position });
        return { success: true };
    }

    employStrategy(gameId, strategy) {
        const game = this.games.get(gameId);
        if (!game) return { success: false, error: 'GAME_NOT_FOUND' };
        game.strategy = strategy;
        this._triggerHook('strategyEmployed', { gameId, strategy });
        return { success: true };
    }

    finishGame(gameId, winner) {
        const game = this.games.get(gameId);
        if (!game) return { success: false, error: 'GAME_NOT_FOUND' };
        game.status = 'finished';
        game.winner = winner;
        this._triggerHook('gameFinished', { gameId, winner });
        return { success: true };
    }

    calculateBoardStrength(gameId) {
        const game = this.games.get(gameId);
        if (!game) return 0;
        return game.blackStones * 2 + game.whiteStones + game.position.length;
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
        if (this.stats.totalGames < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGames += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { games: Array.from(this.games.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.games) this.games = new Map(data.games);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, gameCount: this.games.size }; }
}
