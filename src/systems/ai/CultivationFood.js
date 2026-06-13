/**
 * CultivationFood.js - 修真食
 * V563 Iteration 6/20 Round 23 - Cultivation Food
 *
 * 融合6大设计系统:
 * - generic-agent: 食单自循环
 * - chatdev: 厨师角色协调
 * - nanobot: 食材mesh
 * - claude-code: 食单分析工具
 * - thunderbolt: 食单持久化
 * - ruflo: 食单Hook
 */

export class CultivationFood {
    constructor(config = {}) {
        this.config = { maxFoods: config.maxFoods || 100, baseTaste: config.baseTaste || 20, ...config };
        this.foods = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFoods: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFood', (ctx) => this.getFood(ctx.foodId));
        this.registerTool('cookFood', (ctx) => this.cookFood(ctx));
    }

    cookFood(data) {
        const id = data.id || `fod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const food = {
            foodId: id,
            chefId: data.chefId,
            name: data.name,
            type: data.type || 'immortal',
            taste: data.taste || this.config.baseTaste,
            ingredients: data.ingredients || [],
            level: 1,
            status: 'raw',
            createdAt: Date.now()
        };
        this.foods.set(id, food);
        this.stats.totalFoods++;
        this._triggerHook('foodCooked', { foodId: id });
        return { success: true, food };
    }

    getFood(id) { return this.foods.get(id) ? { ...this.foods.get(id) } : null; }
    listFoods() { return Array.from(this.foods.values()).map(f => ({ ...f })); }
    listByChef(chefId) { return Array.from(this.foods.values()).filter(f => f.chefId === chefId).map(f => ({ ...f })); }
    listCelestial() { return Array.from(this.foods.values()).filter(f => f.status === 'celestial').map(f => ({ ...f })); }

    addIngredient(foodId, ingredient) {
        const food = this.foods.get(foodId);
        if (!food) return { success: false, error: 'FOOD_NOT_FOUND' };
        food.ingredients.push(ingredient);
        if (food.status === 'raw') food.status = 'cooked';
        this._triggerHook('ingredientAdded', { foodId, ingredient, ingredientCount: food.ingredients.length });
        return { success: true };
    }

    increaseTaste(foodId, amount = 5) {
        const food = this.foods.get(foodId);
        if (!food) return { success: false, error: 'FOOD_NOT_FOUND' };
        food.taste += amount;
        this._triggerHook('tasteIncreased', { foodId, newTaste: food.taste });
        return { success: true };
    }

    levelUpFood(foodId) {
        const food = this.foods.get(foodId);
        if (!food) return { success: false, error: 'FOOD_NOT_FOUND' };
        food.level++;
        this._triggerHook('foodLeveledUp', { foodId, newLevel: food.level });
        return { success: true };
    }

    celestialFood(foodId) {
        const food = this.foods.get(foodId);
        if (!food) return { success: false, error: 'FOOD_NOT_FOUND' };
        food.status = 'celestial';
        this._triggerHook('foodCelestialized', { foodId });
        return { success: true };
    }

    calculateFoodValue(foodId) {
        const food = this.foods.get(foodId);
        if (!food) return 0;
        return food.level * 100 + food.taste * 2 + food.ingredients.length * 30;
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
        if (this.stats.totalFoods < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFoods += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { foods: Array.from(this.foods.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.foods) this.foods = new Map(data.foods);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, foodCount: this.foods.size }; }
}
