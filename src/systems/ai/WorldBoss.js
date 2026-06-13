/**
 * WorldBoss.js - 世界Boss
 * V390 Iteration 6/9 Round 12
 */
export class WorldBoss {
    constructor(config = {}) {
        this.config = { maxBosses: config.maxBosses || 20, baseHealth: config.baseHealth || 10000, ...config };
        this.bosses = new Map();
        this.attempts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBosses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBoss', (ctx) => this.getBoss(ctx.bossId));
        this.registerTool('spawnBoss', (ctx) => this.spawnBoss(ctx));
    }

    spawnBoss(data) {
        const id = data.id || `boss_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const boss = { bossId: id, name: data.name || 'World Boss', level: data.level || 50, health: data.health || this.config.baseHealth, maxHealth: data.health || this.config.baseHealth, status: 'alive', spawnedAt: Date.now() };
        this.bosses.set(id, boss);
        this.stats.totalBosses++;
        this._triggerHook('bossSpawned', { bossId: id });
        return { success: true, boss };
    }

    getBoss(id) { return this.bosses.get(id) ? { ...this.bosses.get(id) } : null; }
    listBosses() { return Array.from(this.bosses.values()).map(b => ({ ...b })); }
    listAlive() { return Array.from(this.bosses.values()).filter(b => b.status === 'alive').map(b => ({ ...b })); }
    listByLevel(min) { return Array.from(this.bosses.values()).filter(b => b.level >= min).map(b => ({ ...b })); }

    attackBoss(bossId, cultivatorId, damage) {
        const boss = this.bosses.get(bossId);
        if (!boss) return { success: false, error: 'BOSS_NOT_FOUND' };
        if (boss.status !== 'alive') return { success: false, error: 'BOSS_DEFEATED' };
        boss.health = Math.max(0, boss.health - damage);
        const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const attempt = { attemptId: id, bossId, cultivatorId, damage, attackedAt: Date.now() };
        this.attempts.set(id, attempt);
        this._triggerHook('bossAttacked', { bossId, cultivatorId, damage });
        if (boss.health === 0) {
            boss.status = 'defeated';
            boss.defeatedAt = Date.now();
            this._triggerHook('bossDefeated', { bossId, cultivatorId });
        }
        return { success: true, attempt };
    }

    getAttempt(id) { return this.attempts.get(id) ? { ...this.attempts.get(id) } : null; }
    listAttempts() { return Array.from(this.attempts.values()).map(a => ({ ...a })); }
    listAttemptsByBoss(bossId) { return Array.from(this.attempts.values()).filter(a => a.bossId === bossId).map(a => ({ ...a })); }
    listAttemptsByCultivator(cultivatorId) { return Array.from(this.attempts.values()).filter(a => a.cultivatorId === cultivatorId).map(a => ({ ...a })); }

    calculateHealthPercent(bossId) {
        const boss = this.bosses.get(bossId);
        if (!boss) return null;
        return boss.health / boss.maxHealth;
    }

    countAlive() { return Array.from(this.bosses.values()).filter(b => b.status === 'alive').length; }
    countDefeated() { return Array.from(this.bosses.values()).filter(b => b.status === 'defeated').length; }

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
        if (this.stats.totalBosses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBosses += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bosses: Array.from(this.bosses.entries()), attempts: Array.from(this.attempts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bosses) this.bosses = new Map(data.bosses);
        if (data.attempts) this.attempts = new Map(data.attempts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bossCount: this.bosses.size }; }
}