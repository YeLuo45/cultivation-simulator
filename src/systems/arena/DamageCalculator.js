/**
 * DamageCalculator.js - 伤害计算器
 * V1014 P-20260614-174 Round 39 Iter 7/30
 */
export const DAMAGE_TYPES = ['physical', 'magical', 'true'];
export const CRIT_MULTIPLIER = 1.5;

export class DamageCalculator {
    constructor(config = {}) {
        this.config = { critMultiplier: config.critMultiplier || CRIT_MULTIPLIER, ...config };
        this.attacker = new Map();   // id -> { atk, str, int, crit, critDmg, pierce, hp }
        this.defender = new Map();   // id -> { def, agi, dodge, block, hp, maxHp, resist }
        this.hooks = new Map();
        this.stats = { totalCalcs: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    setAttacker(id, stats) {
        if (!id || !stats) return false;
        this.attacker.set(id, stats);
        return true;
    }
    setDefender(id, stats) {
        if (!id || !stats) return false;
        this.defender.set(id, stats);
        return true;
    }
    getAttacker(id) { return this.attacker.get(id) || null; }
    getDefender(id) { return this.defender.get(id) || null; }

    calculate(attackerId, defenderId, baseDamage, type = 'physical') {
        this.stats.totalCalcs++;
        const atk = this.attacker.get(attackerId) || { atk: 0, str: 0, int: 0, crit: 0, critDmg: 1.5, pierce: 0 };
        const def = this.defender.get(defenderId) || { def: 0, agi: 0, dodge: 0, block: 0, resist: 0 };
        if (!DAMAGE_TYPES.includes(type)) type = 'physical';
        let dmg = baseDamage;
        if (type === 'physical') dmg += atk.str * 0.5 - def.def * 0.3;
        else if (type === 'magical') dmg += atk.int * 0.5 - def.resist * 0.3;
        let isCrit = Math.random() < (atk.crit || 0);
        if (isCrit) dmg *= atk.critDmg || this.config.critMultiplier;
        if (def.dodge > 0 && Math.random() < def.dodge) return { damage: 0, type, dodged: true, crit: false };
        if (def.block > 0 && Math.random() < def.block) dmg *= 0.5;
        if (atk.pierce) def.resist = Math.max(0, def.resist - atk.pierce);
        dmg = Math.max(0, Math.floor(dmg));
        this._emit('calculated', { attackerId, defenderId, damage: dmg, type, crit: isCrit });
        return { damage: dmg, type, crit: isCrit, dodged: false };
    }

    isLethal(damage, defenderId) {
        const def = this.defender.get(defenderId);
        if (!def) return false;
        return damage >= def.hp;
    }
    remainingHp(defenderId, damage) {
        const def = this.defender.get(defenderId);
        if (!def) return 0;
        return Math.max(0, def.hp - damage);
    }
    percentDamage(damage, defenderId) {
        const def = this.defender.get(defenderId);
        if (!def || def.maxHp === 0) return 0;
        return Math.min(1, damage / def.maxHp);
    }
    expectedDps(attackerId, defenderId, baseDamage, type, attacksPerSec = 1) {
        const r = this.calculate(attackerId, defenderId, baseDamage, type);
        return r.damage * attacksPerSec;
    }
    critChance(attackerId) { return this.attacker.get(attackerId)?.crit || 0; }
    effectiveDef(defenderId, type) {
        const def = this.defender.get(defenderId);
        if (!def) return 0;
        return type === 'physical' ? def.def : def.resist;
    }
    report() { return { totalCalcs: this.stats.totalCalcs }; }
    reset() { this.attacker.clear(); this.defender.clear(); this.stats = { totalCalcs: 0 }; }
}
