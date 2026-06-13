/**
 * AlchemyCore.js - 炼丹核心管理系统
 * V322 Iteration 1/9 Round 5 - Pill Alchemy Core
 *
 * 融合6大设计系统:
 * - generic-agent: 炼丹自进化
 * - chatdev: 炼丹角色协调
 * - nanobot: 灵药mesh网络
 * - claude-code: 炼丹分析工具
 * - thunderbolt: 炼丹状态持久化
 * - ruflo: 炼丹Hook事件
 */

export class AlchemyCore {
    constructor(config = {}) {
        this.config = {
            maxPillTypes: config.maxPillTypes || 100,
            baseSuccessRate: config.baseSuccessRate || 0.7,
            maxIngredientsPerPill: config.maxIngredientsPerPill || 5,
            ...config
        };
        this.pills = new Map();
        this.pillTypes = new Map();
        this.brewingSessions = new Map();
        this.alchemists = new Map();
        this.ingredients = new Map();
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPills: 0, totalSessions: 0, totalSuccess: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const pillTypes = [
            { typeId: 'qi_recovery', name: 'Qi Recovery Pill', grade: 1, effect: { qi: 100 } },
            { typeId: 'healing', name: 'Healing Pill', grade: 1, effect: { hp: 50 } },
            { typeId: 'breakthrough', name: 'Breakthrough Pill', grade: 3, effect: { exp: 200 } },
            { typeId: 'longevity', name: 'Longevity Pill', grade: 5, effect: { lifespan: 10 } }
        ];
        for (const t of pillTypes) this.pillTypes.set(t.typeId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getPill', (ctx) => this.getPill(ctx.pillId));
        this.registerTool('listPills', () => Array.from(this.pills.values()).map(p => ({...p})));
        this.registerTool('getPillType', (ctx) => this.getPillType(ctx.typeId));
    }

    addIngredient(matId, amount) {
        this.ingredients.set(matId, (this.ingredients.get(matId) || 0) + amount);
        this._triggerHook('ingredientAdded', { matId, amount });
        return { success: true, total: this.ingredients.get(matId) };
    }

    getIngredient(matId) { return this.ingredients.get(matId) || 0; }
    listIngredients() { return Array.from(this.ingredients.entries()).map(([k, v]) => ({ id: k, amount: v })); }

    registerPillType(data) {
        const id = data.id || `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const type = {
            typeId: id, name: data.name || 'Unnamed Pill',
            grade: data.grade || 1, effect: data.effect || {},
            recipe: data.recipe || {}, successRate: data.successRate || this.config.baseSuccessRate
        };
        this.pillTypes.set(id, type);
        this._triggerHook('pillTypeRegistered', { typeId: id });
        return { success: true, type };
    }

    getPillType(id) { return this.pillTypes.get(id) ? { ...this.pillTypes.get(id) } : null; }
    listPillTypes() { return Array.from(this.pillTypes.values()).map(t => ({ ...t })); }

    registerAlchemist(data) {
        const id = data.id || `alc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const alchemist = {
            alchemistId: id, name: data.name || 'Unnamed',
            skill: data.skill || 1, experience: 0, level: 1
        };
        this.alchemists.set(id, alchemist);
        return { success: true, alchemist };
    }

    getAlchemist(id) { return this.alchemists.get(id) ? { ...this.alchemists.get(id) } : null; }
    listAlchemists() { return Array.from(this.alchemists.values()).map(a => ({ ...a })); }

    startBrewing(alchemistId, pillTypeId) {
        const alchemist = this.alchemists.get(alchemistId);
        if (!alchemist) return { success: false, error: 'ALCHEMIST_NOT_FOUND' };
        const pillType = this.pillTypes.get(pillTypeId);
        if (!pillType) return { success: false, error: 'PILL_TYPE_NOT_FOUND' };
        // Check ingredients
        const recipe = pillType.recipe || {};
        for (const [mat, cost] of Object.entries(recipe)) {
            if (this.getIngredient(mat) < cost) {
                return { success: false, error: 'INSUFFICIENT_INGREDIENTS', missing: mat };
            }
        }
        // Deduct ingredients
        for (const [mat, cost] of Object.entries(recipe)) {
            this.ingredients.set(mat, this.ingredients.get(mat) - cost);
        }
        const sessionId = `brw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const session = {
            sessionId, alchemistId, pillTypeId,
            status: 'in_progress', progress: 0, quality: 0,
            startedAt: Date.now()
        };
        this.brewingSessions.set(sessionId, session);
        this.stats.totalSessions++;
        this._triggerHook('brewingStarted', { sessionId, pillTypeId });
        return { success: true, session };
    }

    advanceBrewing(sessionId, effort = 10) {
        const session = this.brewingSessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'in_progress') return { success: false, error: 'SESSION_INACTIVE' };
        session.progress += effort;
        if (session.progress >= 100) return this.completeBrewing(sessionId);
        return { success: true, session: { ...session } };
    }

    completeBrewing(sessionId) {
        const session = this.brewingSessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'in_progress') return { success: false, error: 'SESSION_INACTIVE' };
        const pillType = this.pillTypes.get(session.pillTypeId);
        const alchemist = this.alchemists.get(session.alchemistId);
        // Calculate success
        const skillBonus = (alchemist?.skill || 1) * 0.05;
        const finalRate = Math.min(1, (pillType?.successRate || this.config.baseSuccessRate) + skillBonus);
        const success = Math.random() < finalRate;
        if (success) {
            const pillId = `pil_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const pill = {
                pillId, typeId: session.pillTypeId, name: pillType.name,
                grade: pillType.grade, effect: pillType.effect,
                quality: 50 + Math.random() * 50, alchemistId: session.alchemistId,
                brewedAt: Date.now()
            };
            this.pills.set(pillId, pill);
            this.stats.totalPills++;
            this.stats.totalSuccess++;
            if (alchemist) {
                alchemist.experience += 10;
                alchemist.level = 1 + Math.floor(alchemist.experience / 100);
            }
            session.status = 'completed';
            session.resultPillId = pillId;
            this._triggerHook('brewingCompleted', { sessionId, pillId, success: true });
            return { success: true, pill, success: true };
        } else {
            session.status = 'failed';
            if (alchemist) alchemist.experience += 2;
            this._triggerHook('brewingFailed', { sessionId, success: false });
            return { success: false, error: 'BREWING_FAILED', success: false };
        }
    }

    getPill(id) { return this.pills.get(id) ? { ...this.pills.get(id) } : null; }
    listPills() { return Array.from(this.pills.values()).map(p => ({ ...p })); }

    consumePill(pillId, cultivatorId) {
        const pill = this.pills.get(pillId);
        if (!pill) return { success: false, error: 'PILL_NOT_FOUND' };
        this.pills.delete(pillId);
        this._triggerHook('pillConsumed', { pillId, cultivatorId });
        return { success: true, effect: pill.effect, pill };
    }

    addMeshNode(nodeId) {
        const node = { nodeId, connections: new Set(), pills: new Set() };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshNodes(a, b) {
        const na = this.meshNodes.get(a);
        const nb = this.meshNodes.get(b);
        if (!na || !nb) return { success: false, error: 'NODE_NOT_FOUND' };
        na.connections.add(b);
        nb.connections.add(a);
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
        if (this.stats.totalSessions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseSuccessRate = Math.min(0.95, this.config.baseSuccessRate + 0.05);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            pills: Array.from(this.pills.entries()),
            pillTypes: Array.from(this.pillTypes.entries()),
            brewingSessions: Array.from(this.brewingSessions.entries()),
            alchemists: Array.from(this.alchemists.entries()),
            ingredients: Array.from(this.ingredients.entries()),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats, config: this.config
        };
    }
    fromJSON(data) {
        if (data.pills) this.pills = new Map(data.pills);
        if (data.pillTypes) this.pillTypes = new Map(data.pillTypes);
        if (data.brewingSessions) this.brewingSessions = new Map(data.brewingSessions);
        if (data.alchemists) this.alchemists = new Map(data.alchemists);
        if (data.ingredients) this.ingredients = new Map(data.ingredients);
        if (data.meshNodes) {
            this.meshNodes = new Map(data.meshNodes.map(([k, v]) => [k, { ...v, connections: new Set(v.connections || []), pills: new Set(v.pills || []) }]));
        }
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() {
        return { ...this.stats, pillCount: this.pills.size, typeCount: this.pillTypes.size, alchemistCount: this.alchemists.size };
    }
}