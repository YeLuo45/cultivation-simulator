/**
 * CombatAfterAction.js - 战斗复盘系统
 * V320 Iteration 8/9 Round 4
 */
export class CombatAfterAction {
    constructor(config = {}) {
        this.config = { maxReports: config.maxReports || 100, minReportScore: config.minReportScore || 60, ...config };
        this.reports = new Map();
        this.battles = new Map();
        this.lessons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalReports: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getReport', (ctx) => this.getReport(ctx.reportId));
        this.registerTool('listReports', () => Array.from(this.reports.values()).map(r => ({...r})));
    }

    createBattle(data) {
        const id = data.id || `btl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const battle = { battleId: id, name: data.name || 'Battle', startTime: data.startTime || Date.now(), endTime: data.endTime, status: 'in_progress', participants: data.participants || [] };
        this.battles.set(id, battle);
        return { success: true, battle };
    }

    getBattle(id) { return this.battles.get(id) ? { ...this.battles.get(id) } : null; }
    endBattle(id, endTime) {
        const battle = this.battles.get(id);
        if (!battle) return { success: false, error: 'BATTLE_NOT_FOUND' };
        battle.status = 'completed';
        battle.endTime = endTime || Date.now();
        return { success: true, battle: { ...battle } };
    }

    addLesson(data) {
        const id = data.id || `lsn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const lesson = { lessonId: id, category: data.category || 'general', content: data.content || '', importance: data.importance || 5, tags: data.tags || [] };
        this.lessons.set(id, lesson);
        this._triggerHook('lessonAdded', { lessonId: id });
        return { success: true, lesson };
    }

    getLesson(id) { return this.lessons.get(id) ? { ...this.lessons.get(id) } : null; }
    listLessons() { return Array.from(this.lessons.values()).map(l => ({ ...l })); }

    generateReport(battleId, outcomes) {
        const battle = this.battles.get(battleId);
        if (!battle) return { success: false, error: 'BATTLE_NOT_FOUND' };
        const reportId = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const score = this._calculateScore(battle, outcomes);
        const report = {
            reportId, battleId, score, outcomes: outcomes || {},
            highlights: this._extractHighlights(battle, outcomes),
            improvements: this._extractImprovements(score),
            generatedAt: Date.now()
        };
        this.reports.set(reportId, report);
        this.stats.totalReports++;
        this._triggerHook('reportGenerated', { reportId, score });
        return { success: true, report };
    }

    _calculateScore(battle, outcomes) {
        let score = 50;
        if (outcomes) {
            if (outcomes.won) score += 30;
            if (outcomes.lowCasualties) score += 10;
            if (outcomes.objectiveAchieved) score += 10;
        }
        return Math.max(0, Math.min(100, score));
    }

    _extractHighlights(battle, outcomes) {
        const highlights = [];
        if (outcomes?.won) highlights.push('Victory achieved');
        if (outcomes?.objectivesAchieved?.length) highlights.push(`${outcomes.objectivesAchieved.length} objectives completed`);
        return highlights;
    }

    _extractImprovements(score) {
        if (score >= 80) return ['Maintain current strategy'];
        if (score >= 60) return ['Improve coordination', 'Better resource management'];
        return ['Reassess tactics', 'Retrain forces', 'Review intelligence'];
    }

    getReport(id) { return this.reports.get(id) ? { ...this.reports.get(id) } : null; }
    listReports() { return Array.from(this.reports.values()).map(r => ({ ...r })); }

    applyLessonsToReport(reportId, lessonIds) {
        const report = this.reports.get(reportId);
        if (!report) return { success: false, error: 'REPORT_NOT_FOUND' };
        const lessons = lessonIds.map(id => this.lessons.get(id)).filter(Boolean);
        report.appliedLessons = lessons;
        return { success: true, report: { ...report } };
    }

    getImprovementSuggestions() {
        return [...this.lessons.values()].filter(l => l.importance >= 7).map(l => l.content);
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
        if (this.stats.totalReports < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.minReportScore = Math.max(30, this.config.minReportScore - 5);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { reports: Array.from(this.reports.entries()), battles: Array.from(this.battles.entries()), lessons: Array.from(this.lessons.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.reports) this.reports = new Map(data.reports);
        if (data.battles) this.battles = new Map(data.battles);
        if (data.lessons) this.lessons = new Map(data.lessons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, reportCount: this.reports.size, battleCount: this.battles.size, lessonCount: this.lessons.size }; }
}