/**
 * DefenseResolver.js - 防御解析器
 * V1015 P-20260614-175 Round 39 Iter 8/30
 */
export const DEFENSE_TYPES = ['block', 'parry', 'dodge', 'shield', 'counter'];
export const DEFAULT_BLOCK_REDUCTION = 0.5;

export class DefenseResolver {
    constructor(config = {}) {
        this.config = { blockReduction: config.blockReduction || DEFAULT_BLOCK_REDUCTION, ...config };
        this.defenses = new Map();   // playerId -> { def, agi, blockChance, parryChance, dodgeChance, shield, counterChance }
        this.attacks = new Map();    // playerId -> { hits, blocks, parries, dodges, shields, counters, missed }
        this.hooks = new Map();
        this.stats = { totalResolved: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    setDefense(id, stats) {
        if (!id) return false;
        this.defenses.set(id, { def: 0, agi: 0, blockChance: 0, parryChance: 0, dodgeChance: 0, shield: 0, counterChance: 0, ...stats });
        if (!this.attacks.has(id)) this.attacks.set(id, { hits: 0, blocks: 0, parries: 0, dodges: 0, shields: 0, counters: 0, missed: 0 });
        return true;
    }
    get(id) { return this.defenses.get(id) || null; }

    resolve(attackerId, defenderId, baseDamage, attackType = 'physical') {
        this.stats.totalResolved++;
        const def = this.defenses.get(defenderId);
        if (!def) return { damage: baseDamage, type: attackType, defense: 'none' };
        const result = { damage: baseDamage, type: attackType, defense: 'none' };
        if (Math.random() < def.dodgeChance) { result.defense = 'dodge'; result.damage = 0; result.dodged = true; this._record(defenderId, 'dodges'); }
        else if (Math.random() < def.blockChance) { result.defense = 'block'; result.damage = Math.floor(baseDamage * (1 - this.config.blockReduction)); result.blocked = true; this._record(defenderId, 'blocks'); }
        else if (Math.random() < def.parryChance) { result.defense = 'parry'; result.damage = Math.floor(baseDamage * 0.3); this._record(defenderId, 'parries'); }
        else if (def.shield > 0) { result.defense = 'shield'; result.damage = Math.max(0, baseDamage - def.shield); this._record(defenderId, 'shields'); }
        else if (Math.random() < def.counterChance) { result.defense = 'counter'; result.counter = true; this._record(defenderId, 'counters'); }
        else { result.defense = 'hit'; this._record(defenderId, 'hits'); }
        this._emit('resolved', { attackerId, defenderId, ...result });
        return result;
    }
    _record(playerId, type) {
        const a = this.attacks.get(playerId);
        if (!a) return;
        a[type] = (a[type] || 0) + 1;
    }

    stats_(playerId) { return this.attacks.get(playerId) || null; }
    blockRate(playerId) {
        const a = this.attacks.get(playerId);
        if (!a) return 0;
        const total = a.hits + a.blocks + a.parries + a.dodges + a.shields + a.counters;
        if (total === 0) return 0;
        return a.blocks / total;
    }
    dodgeRate(playerId) {
        const a = this.attacks.get(playerId);
        if (!a) return 0;
        const total = a.hits + a.blocks + a.parries + a.dodges + a.shields + a.counters;
        if (total === 0) return 0;
        return a.dodges / total;
    }
    totalDefended(playerId) {
        const a = this.attacks.get(playerId);
        if (!a) return 0;
        return a.blocks + a.parries + a.dodges + a.shields + a.counters;
    }
    defenseRate(playerId) {
        const a = this.attacks.get(playerId);
        if (!a) return 0;
        const total = a.hits + a.blocks + a.parries + a.dodges + a.shields + a.counters;
        if (total === 0) return 0;
        return this.totalDefended(playerId) / total;
    }
    isEffective(playerId) { return this.defenseRate(playerId) > 0.3; }
    report() { return { totalResolved: this.stats.totalResolved, totalTracked: this.defenses.size }; }
    reset() { this.defenses.clear(); this.attacks.clear(); this.stats = { totalResolved: 0 }; }
}
