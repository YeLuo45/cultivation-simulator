/**
 * SpiritWeaponForge.js - 灵器锻造系统
 * V316 Iteration 4/9 Round 4
 */
export class SpiritWeaponForge {
    constructor(config = {}) {
        this.config = { maxWeapons: config.maxWeapons || 100, baseForgeTime: config.baseForgeTime || 1000, ...config };
        this.weapons = new Map();
        this.recipes = new Map();
        this.forgeJobs = new Map();
        this.materials = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalForged: 0, totalRecipes: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const recipes = [
            { recipeId: 'iron_sword', name: 'Iron Sword', materialCost: { iron: 5 }, power: 10 },
            { recipeId: 'jade_blade', name: 'Jade Blade', materialCost: { jade: 3, iron: 2 }, power: 25 },
            { recipeId: 'spirit_saber', name: 'Spirit Saber', materialCost: { spirit_stone: 5, jade: 5 }, power: 50 }
        ];
        for (const r of recipes) this.recipes.set(r.recipeId, r);
    }

    _registerDefaultTools() {
        this.registerTool('getWeapon', (ctx) => this.getWeapon(ctx.weaponId));
        this.registerTool('getRecipe', (ctx) => this.getRecipe(ctx.recipeId));
    }

    addMaterial(matId, amount) {
        this.materials.set(matId, (this.materials.get(matId) || 0) + amount);
        this._triggerHook('materialAdded', { matId, amount });
        return { success: true, total: this.materials.get(matId) };
    }

    getMaterial(matId) { return this.materials.get(matId) || 0; }

    registerRecipe(data) {
        const id = data.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const recipe = { recipeId: id, name: data.name || 'Unnamed', materialCost: data.materialCost || {}, power: data.power || 10 };
        this.recipes.set(id, recipe);
        this.stats.totalRecipes++;
        this._triggerHook('recipeAdded', { recipeId: id });
        return { success: true, recipe };
    }

    getRecipe(id) { return this.recipes.get(id) ? { ...this.recipes.get(id) } : null; }
    listRecipes() { return Array.from(this.recipes.values()).map(r => ({ ...r })); }

    startForge(recipeId, crafterId) {
        const recipe = this.recipes.get(recipeId);
        if (!recipe) return { success: false, error: 'RECIPE_NOT_FOUND' };
        for (const [mat, cost] of Object.entries(recipe.materialCost)) {
            if (this.getMaterial(mat) < cost) return { success: false, error: 'INSUFFICIENT_MATERIALS', missing: mat };
        }
        for (const [mat, cost] of Object.entries(recipe.materialCost)) {
            this.materials.set(mat, this.materials.get(mat) - cost);
        }
        const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const job = { jobId, recipeId, crafterId, status: 'in_progress', startedAt: Date.now(), progress: 0 };
        this.forgeJobs.set(jobId, job);
        this._triggerHook('forgeStarted', { jobId, recipeId });
        return { success: true, job };
    }

    advanceForge(jobId, effort = 10) {
        const job = this.forgeJobs.get(jobId);
        if (!job) return { success: false, error: 'JOB_NOT_FOUND' };
        if (job.status !== 'in_progress') return { success: false, error: 'JOB_INACTIVE' };
        job.progress += effort;
        if (job.progress >= 100) return this.completeForge(jobId);
        return { success: true, job: { ...job } };
    }

    completeForge(jobId) {
        const job = this.forgeJobs.get(jobId);
        if (!job) return { success: false, error: 'JOB_NOT_FOUND' };
        if (job.status !== 'in_progress') return { success: false, error: 'JOB_INACTIVE' };
        const recipe = this.recipes.get(job.recipeId);
        const weaponId = `wpn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const weapon = { weaponId, name: recipe.name, power: recipe.power, crafterId: job.crafterId, forgedAt: Date.now() };
        this.weapons.set(weaponId, weapon);
        job.status = 'completed';
        job.completedAt = Date.now();
        this.stats.totalForged++;
        this._triggerHook('forgeCompleted', { jobId, weaponId });
        return { success: true, weapon };
    }

    getWeapon(id) { return this.weapons.get(id) ? { ...this.weapons.get(id) } : null; }
    listWeapons() { return Array.from(this.weapons.values()).map(w => ({ ...w })); }

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
        if (this.stats.totalForged < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseForgeTime = Math.max(100, this.config.baseForgeTime - 100);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { weapons: Array.from(this.weapons.entries()), recipes: Array.from(this.recipes.entries()), forgeJobs: Array.from(this.forgeJobs.entries()), materials: Array.from(this.materials.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.weapons) this.weapons = new Map(data.weapons);
        if (data.recipes) this.recipes = new Map(data.recipes);
        if (data.forgeJobs) this.forgeJobs = new Map(data.forgeJobs);
        if (data.materials) this.materials = new Map(data.materials);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, weaponCount: this.weapons.size, recipeCount: this.recipes.size, jobCount: this.forgeJobs.size }; }
}