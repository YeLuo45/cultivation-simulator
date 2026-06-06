/**
 * CultivationSkill.js - 道术系统
 * V531 Iteration 13/20 Round 21 - Cultivation Skill
 */

export class CultivationSkill {
    constructor(config = {}) {
        this.config = { maxSkills: config.maxSkills || 100, basePower: config.basePower || 20, ...config };
        this.skills = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSkills: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSkill', (ctx) => this.getSkill(ctx.skillId));
        this.registerTool('castSkill', (ctx) => this.castSkill(ctx));
    }

    castSkill(data) {
        const id = data.skillId || `skl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const skill = {
            skillId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Skill',
            type: data.type || 'attack',
            power: data.power || this.config.basePower,
            effects: data.effects || [],
            level: 1,
            status: 'initiated',
            createdAt: Date.now()
        };
        this.skills.set(id, skill);
        this.stats.totalSkills++;
        this._triggerHook('skillCast', { skillId: id });
        return { success: true, skill };
    }

    getSkill(id) { return this.skills.get(id) ? { ...this.skills.get(id) } : null; }
    listSkills() { return Array.from(this.skills.values()).map(s => ({ ...s })); }
    listByCultivator(cultivatorId) { return Array.from(this.skills.values()).filter(s => s.cultivatorId === cultivatorId).map(s => ({ ...s })); }
    listMastered() { return Array.from(this.skills.values()).filter(s => s.status === 'mastered').map(s => ({ ...s })); }

    addEffect(skillId, effect) {
        const skill = this.skills.get(skillId);
        if (!skill) return { success: false, error: 'SKILL_NOT_FOUND' };
        skill.effects.push(effect);
        this._triggerHook('effectAdded', { skillId, effect });
        return { success: true, skill: { ...skill } };
    }

    increasePower(skillId, amount = 5) {
        const skill = this.skills.get(skillId);
        if (!skill) return { success: false, error: 'SKILL_NOT_FOUND' };
        skill.power += amount;
        this._triggerHook('powerIncreased', { skillId, newPower: skill.power });
        return { success: true };
    }

    levelUpSkill(skillId) {
        const skill = this.skills.get(skillId);
        if (!skill) return { success: false, error: 'SKILL_NOT_FOUND' };
        skill.level++;
        this._triggerHook('skillLeveledUp', { skillId, newLevel: skill.level });
        return { success: true };
    }

    masterSkill(skillId) {
        const skill = this.skills.get(skillId);
        if (!skill) return { success: false, error: 'SKILL_NOT_FOUND' };
        skill.status = 'mastered';
        this._triggerHook('skillMastered', { skillId });
        return { success: true };
    }

    calculateSkillPower(skillId) {
        const skill = this.skills.get(skillId);
        if (!skill) return 0;
        return skill.level * 100 + skill.power * 2 + skill.effects.length * 30;
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
        if (this.stats.totalSkills < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSkills += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { skills: Array.from(this.skills.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.skills) this.skills = new Map(data.skills);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, skillCount: this.skills.size }; }
}
