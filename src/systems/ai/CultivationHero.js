/**
 * CultivationHero.js - 修真英雄
 * V661 Iteration 14/30 Round 27
 */
export class CultivationHero {
    constructor(config = {}) {
        this.config = { maxHeroes: config.maxHeroes || 20, baseCourage: config.baseCourage || 20, ...config };
        this.heroes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHeroes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHero', (ctx) => this.getHero(ctx.heroId));
        this.registerTool('recruitHero', (ctx) => this.recruitHero(ctx));
    }

    recruitHero(data) {
        const id = data.heroId || `hro_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hero = {
            heroId: id,
            masterId: data.masterId,
            name: data.name || 'Anonymous Hero',
            type: data.type || 'warrior',
            courage: data.courage || this.config.baseCourage,
            quests: data.quests || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.heroes.set(id, hero);
        this.stats.totalHeroes++;
        this._triggerHook('heroRecruited', { heroId: id });
        return { success: true, hero };
    }

    getHero(id) { return this.heroes.get(id) ? { ...this.heroes.get(id) } : null; }
    listHeroes() { return Array.from(this.heroes.values()).map(h => ({ ...h })); }
    listByMaster(masterId) { return Array.from(this.heroes.values()).filter(h => h.masterId === masterId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.heroes.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addQuest(heroId, quest) {
        const hero = this.heroes.get(heroId);
        if (!hero) return { success: false, error: 'HERO_NOT_FOUND' };
        hero.quests.push(quest);
        this._triggerHook('questAdded', { heroId, quest });
        return { success: true };
    }

    raiseCourage(heroId, amount = 5) {
        const hero = this.heroes.get(heroId);
        if (!hero) return { success: false, error: 'HERO_NOT_FOUND' };
        hero.courage += amount;
        this._triggerHook('courageRaised', { heroId, newCourage: hero.courage });
        return { success: true };
    }

    levelUpHero(heroId) {
        const hero = this.heroes.get(heroId);
        if (!hero) return { success: false, error: 'HERO_NOT_FOUND' };
        hero.level++;
        if (hero.level >= 5 && hero.status === 'novice') {
            hero.status = 'veteran';
        }
        this._triggerHook('heroLeveledUp', { heroId, newLevel: hero.level });
        return { success: true };
    }

    legendHero(heroId) {
        const hero = this.heroes.get(heroId);
        if (!hero) return { success: false, error: 'HERO_NOT_FOUND' };
        hero.status = 'legendary';
        this._triggerHook('heroLegendized', { heroId });
        return { success: true };
    }

    calculateHeroValue(heroId) {
        const hero = this.heroes.get(heroId);
        if (!hero) return 0;
        return hero.level * 100 + hero.courage * 2 + hero.quests.length * 30;
    }

    listVeterans() { return Array.from(this.heroes.values()).filter(h => h.status === 'veteran').map(h => ({ ...h })); }

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
        if (this.stats.totalHeroes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHeroes += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { heroes: Array.from(this.heroes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.heroes) this.heroes = new Map(data.heroes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, heroCount: this.heroes.size }; }
}
