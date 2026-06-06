/**
 * CultivationGrade.js - 修真品阶系统
 * V549 Iteration 12/20 Round 22
 */
export class CultivationGrade {
    constructor(config = {}) {
        this.config = { maxGrades: config.maxGrades || 50, baseQuality: config.baseQuality || 20, ...config };
        this.grades = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGrades: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGrade', (ctx) => this.getGrade(ctx.gradeId));
        this.registerTool('openGrade', (ctx) => this.openGrade(ctx));
    }

    openGrade(data) {
        if (this.grades.size >= this.config.maxGrades) return { success: false, error: 'MAX_GRADES_REACHED' };
        const id = data.gradeId || `grd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const grade = {
            gradeId: id,
            ownerId: data.ownerId,
            name: data.name || 'unnamed-grade',
            type: data.type || 'mortal',
            quality: data.quality || this.config.baseQuality,
            refinements: data.refinements || [],
            level: data.level || 1,
            status: data.status || 'rough',
            createdAt: Date.now()
        };
        this.grades.set(id, grade);
        this.stats.totalGrades++;
        this._triggerHook('gradeOpened', { gradeId: id });
        return { success: true, grade };
    }

    getGrade(id) { return this.grades.get(id) ? { ...this.grades.get(id) } : null; }
    listGrades() { return Array.from(this.grades.values()).map(g => ({ ...g })); }
    listByOwner(ownerId) { return Array.from(this.grades.values()).filter(g => g.ownerId === ownerId).map(g => ({ ...g })); }
    listRefined() { return Array.from(this.grades.values()).filter(g => g.status === 'refined' || g.status === 'masterpiece').map(g => ({ ...g })); }

    addRefinement(gradeId, refinement) {
        const grade = this.grades.get(gradeId);
        if (!grade) return { success: false, error: 'GRADE_NOT_FOUND' };
        grade.refinements.push(refinement);
        this._triggerHook('refinementAdded', { gradeId, refinement });
        return { success: true, refinements: grade.refinements.length };
    }

    increaseQuality(gradeId, amount = 5) {
        const grade = this.grades.get(gradeId);
        if (!grade) return { success: false, error: 'GRADE_NOT_FOUND' };
        grade.quality += amount;
        this._triggerHook('qualityIncreased', { gradeId, newQuality: grade.quality });
        return { success: true };
    }

    levelUpGrade(gradeId) {
        const grade = this.grades.get(gradeId);
        if (!grade) return { success: false, error: 'GRADE_NOT_FOUND' };
        grade.level++;
        this._triggerHook('gradeLeveledUp', { gradeId, newLevel: grade.level });
        return { success: true };
    }

    refineGrade(gradeId) {
        const grade = this.grades.get(gradeId);
        if (!grade) return { success: false, error: 'GRADE_NOT_FOUND' };
        grade.status = 'refined';
        this._triggerHook('gradeRefined', { gradeId });
        return { success: true };
    }

    calculateGradeValue(gradeId) {
        const grade = this.grades.get(gradeId);
        if (!grade) return 0;
        return grade.level * 100 + grade.quality * 2 + grade.refinements.length * 30;
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
        if (this.stats.totalGrades < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGrades += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { grades: Array.from(this.grades.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.grades) this.grades = new Map(data.grades);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, gradeCount: this.grades.size }; }
}
