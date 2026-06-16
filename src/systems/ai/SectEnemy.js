/**
 * SectEnemy.js - 宗门宿敌
 * V496 Iteration 13/15 Round 19 - Sect Enemy
 *
 * 融合6大设计系统:
 * - generic-agent: 宿敌自循环
 * - chatdev: 宿敌角色协调
 * - nanobot: 宿敌mesh
 * - claude-code: 宿敌分析工具
 * - thunderbolt: 宿敌持久化
 * - ruflo: 宿敌Hook
 */

export class SectEnemy {
    constructor(config = {}) {
        this.config = { maxEnemies: config.maxEnemies || 50, baseGrudge: config.baseGrudge || 10, ...config };
        this.enemies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEnemies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEnemy', (ctx) => this.getEnemy(ctx.enemyId));
        this.registerTool('declareEnemy', (ctx) => this.declareEnemy(ctx));
    }

    declareEnemy(data) {
        const id = data.enemyId || data.id || `enm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const enemy = {
            enemyId: id,
            sectId: data.sectId,
            foe: data.foe,
            grudge: data.grudge != null ? data.grudge : this.config.baseGrudge,
            battles: data.battles || [],
            status: data.status || 'tense',
            declaredAt: Date.now()
        };
        this.enemies.set(id, enemy);
        this.stats.totalEnemies++;
        this._triggerHook('enemyDeclared', { enemyId: id });
        return { success: true, enemy };
    }

    getEnemy(id) { return this.enemies.get(id) ? { ...this.enemies.get(id) } : null; }
    listEnemies() { return Array.from(this.enemies.values()).map(e => ({ ...e })); }
    listBySect(sect) { return Array.from(this.enemies.values()).filter(e => e.sectId === sect || e.foe === sect).map(e => ({ ...e })); }
    listTense() { return Array.from(this.enemies.values()).filter(e => e.status === 'tense' || e.status === 'escalating').map(e => ({ ...e })); }

    deepenGrudge(enemyId, amount = 5) {
        const enemy = this.enemies.get(enemyId);
        if (!enemy) return { success: false, error: 'ENEMY_NOT_FOUND' };
        enemy.grudge += amount;
        this._triggerHook('grudgeDeepened', { enemyId, amount, newGrudge: enemy.grudge });
        return { success: true };
    }

    recordBattle(enemyId, battle) {
        const enemy = this.enemies.get(enemyId);
        if (!enemy) return { success: false, error: 'ENEMY_NOT_FOUND' };
        enemy.battles.push(battle);
        if (enemy.status === 'tense') enemy.status = 'escalating';
        this._triggerHook('battleRecorded', { enemyId, battle });
        return { success: true };
    }

    makePeace(enemyId) {
        const enemy = this.enemies.get(enemyId);
        if (!enemy) return { success: false, error: 'ENEMY_NOT_FOUND' };
        enemy.status = 'peacemaking';
        this._triggerHook('peaceMade', { enemyId });
        return { success: true };
    }

    calculateEnemyThreat(enemyId) {
        const enemy = this.enemies.get(enemyId);
        if (!enemy) return 0;
        return enemy.grudge * 10 + enemy.battles.length * 50;
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
        if (this.stats.totalEnemies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEnemies += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { enemies: Array.from(this.enemies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.enemies) this.enemies = new Map(data.enemies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, enemyCount: this.enemies.size }; }
}
