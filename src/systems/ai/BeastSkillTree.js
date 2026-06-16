/**
 * BeastSkillTree.js - 灵兽技能树
 * V329 Iteration 8/9 Round 5
 */
export class BeastSkillTree {
    constructor(config = {}) {
        this.config = { maxSkills: config.maxSkills || 200, skillPointPerLevel: config.skillPointPerLevel || 1, ...config };
        this.skills = new Map();
        this.skillTrees = new Map();
        this.allocatedPoints = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSkills: 0, totalUnlocked: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const skills = [
            { skillId: 'basic_bite', name: 'Basic Bite', cost: 1, power: 5, tier: 1, requires: [] },
            { skillId: 'fire_breath', name: 'Fire Breath', cost: 3, power: 30, tier: 2, requires: ['basic_bite'] },
            { skillId: 'dragon_roar', name: 'Dragon Roar', cost: 5, power: 100, tier: 3, requires: ['fire_breath'] },
            { skillId: 'wing_slash', name: 'Wing Slash', cost: 2, power: 15, tier: 1, requires: [] },
            { skillId: 'tornado', name: 'Tornado', cost: 4, power: 60, tier: 2, requires: ['wing_slash'] }
        ];
        for (const s of skills) this.skills.set(s.skillId, s);
    }

    _registerDefaultTools() {
        this.registerTool('getSkill', (ctx) => this.getSkill(ctx.skillId));
        this.registerTool('listSkills', () => Array.from(this.skills.values()).map(s => ({...s})));
    }

    getSkill(id) { return this.skills.get(id) ? { ...this.skills.get(id) } : null; }
    listSkills() { return Array.from(this.skills.values()).map(s => ({ ...s })); }
    getSkillsByTier(tier) { return Array.from(this.skills.values()).filter(s => s.tier === tier).map(s => ({ ...s })); }

    addSkillPoints(beastId, amount) {
        this.allocatedPoints.set(beastId, (this.allocatedPoints.get(beastId) || 0) + amount);
        this._triggerHook('skillPointsAdded', { beastId, amount });
        return { success: true, total: this.allocatedPoints.get(beastId) };
    }

    getAvailablePoints(beastId) { return this.allocatedPoints.get(beastId) || 0; }

    unlockSkill(beastId, skillId) {
        const skill = this.skills.get(skillId);
        if (!skill) return { success: false, error: 'SKILL_NOT_FOUND' };
        const points = this.getAvailablePoints(beastId);
        if (points < skill.cost) return { success: false, error: 'INSUFFICIENT_POINTS' };
        for (const req of skill.requires) {
            if (!this.hasSkill(beastId, req)) return { success: false, error: 'MISSING_PREREQUISITE', missing: req };
        }
        this.allocatedPoints.set(beastId, points - skill.cost);
        if (!this.skillTrees.has(beastId)) this.skillTrees.set(beastId, []);
        this.skillTrees.get(beastId).push(skillId);
        this.stats.totalUnlocked++;
        this._triggerHook('skillUnlocked', { beastId, skillId });
        return { success: true, skill: { ...skill } };
    }

    hasSkill(beastId, skillId) {
        const skills = this.skillTrees.get(beastId) || [];
        return skills.includes(skillId);
    }

    getBeastSkills(beastId) { return (this.skillTrees.get(beastId) || []).map(id => this.skills.get(id)).filter(Boolean).map(s => ({ ...s })); }

    calculateBeastPower(beastId) {
        const skills = this.getBeastSkills(beastId);
        return skills.reduce((sum, s) => sum + s.power, 0);
    }

    lockSkill(beastId, skillId) {
        const skills = this.skillTrees.get(beastId);
        if (!skills) return { success: false, error: 'BEAST_NOT_FOUND' };
        const idx = skills.indexOf(skillId);
        if (idx < 0) return { success: false, error: 'SKILL_NOT_UNLOCKED' };
        skills.splice(idx, 1);
        return { success: true };
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
        if (this.stats.totalUnlocked < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.skillPointPerLevel++;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { skills: Array.from(this.skills.entries()), skillTrees: Array.from(this.skillTrees.entries()), allocatedPoints: Array.from(this.allocatedPoints.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.skills) this.skills = new Map(data.skills);
        if (data.skillTrees) this.skillTrees = new Map(data.skillTrees);
        if (data.allocatedPoints) this.allocatedPoints = new Map(data.allocatedPoints);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, skillCount: this.skills.size, treeCount: this.skillTrees.size }; }
}