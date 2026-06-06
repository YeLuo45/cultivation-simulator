/**
 * CultivationWarrior.js - 修真战士
 * V598 Iteration 1/20 Round 25
 */
export class CultivationWarrior {
    constructor(config = {}) {
        this.config = { maxWarriors: config.maxWarriors || 50, baseStrength: config.baseStrength || 20, ...config };
        this.warriors = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWarriors: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWarrior', (ctx) => this.getWarrior(ctx.warriorId));
        this.registerTool('recruitWarrior', (ctx) => this.recruitWarrior(ctx));
    }

    recruitWarrior(data) {
        const id = data.warriorId || `wrr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const warrior = {
            warriorId: id,
            mentorId: data.mentorId,
            name: data.name || 'Anonymous Warrior',
            type: data.type || 'sword',
            strength: data.strength || this.config.baseStrength,
            weapons: data.weapons || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.warriors.set(id, warrior);
        this.stats.totalWarriors++;
        this._triggerHook('warriorRecruited', { warriorId: id });
        return { success: true, warrior };
    }

    getWarrior(id) { return this.warriors.get(id) ? { ...this.warriors.get(id) } : null; }
    listWarriors() { return Array.from(this.warriors.values()).map(w => ({ ...w })); }
    listByMentor(mentorId) { return Array.from(this.warriors.values()).filter(w => w.mentorId === mentorId).map(w => ({ ...w })); }
    listLegendary() { return Array.from(this.warriors.values()).filter(w => w.status === 'legendary').map(w => ({ ...w })); }

    addWeapon(warriorId, weapon) {
        const warrior = this.warriors.get(warriorId);
        if (!warrior) return { success: false, error: 'WARRIOR_NOT_FOUND' };
        warrior.weapons.push(weapon);
        this._triggerHook('weaponAdded', { warriorId, weapon });
        return { success: true };
    }

    trainStrength(warriorId, amount = 5) {
        const warrior = this.warriors.get(warriorId);
        if (!warrior) return { success: false, error: 'WARRIOR_NOT_FOUND' };
        warrior.strength += amount;
        this._triggerHook('strengthTrained', { warriorId, newStrength: warrior.strength });
        return { success: true };
    }

    levelUpWarrior(warriorId) {
        const warrior = this.warriors.get(warriorId);
        if (!warrior) return { success: false, error: 'WARRIOR_NOT_FOUND' };
        warrior.level++;
        if (warrior.level >= 5 && warrior.status === 'novice') {
            warrior.status = 'veteran';
        }
        this._triggerHook('warriorLeveledUp', { warriorId, newLevel: warrior.level });
        return { success: true };
    }

    legendWarrior(warriorId) {
        const warrior = this.warriors.get(warriorId);
        if (!warrior) return { success: false, error: 'WARRIOR_NOT_FOUND' };
        warrior.status = 'legendary';
        this._triggerHook('warriorLegendized', { warriorId });
        return { success: true };
    }

    calculateWarriorValue(warriorId) {
        const warrior = this.warriors.get(warriorId);
        if (!warrior) return 0;
        return warrior.level * 100 + warrior.strength * 2 + warrior.weapons.length * 30;
    }

    listVeterans() { return Array.from(this.warriors.values()).filter(w => w.status === 'veteran').map(w => ({ ...w })); }

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
        if (this.stats.totalWarriors < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWarriors += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { warriors: Array.from(this.warriors.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.warriors) this.warriors = new Map(data.warriors);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, warriorCount: this.warriors.size }; }
}
