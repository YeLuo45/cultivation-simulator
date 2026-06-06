/**
 * CultivationNovel.js - 修真小说
 * V422 Iteration 14/15 Round 14 - Cultivation Novel
 *
 * 融合6大设计系统:
 * - generic-agent: 小说自循环
 * - chatdev: 小说角色协调
 * - nanobot: 小说mesh
 * - claude-code: 小说分析工具
 * - thunderbolt: 小说持久化
 * - ruflo: 小说Hook
 */

export class CultivationNovel {
    constructor(config = {}) {
        this.config = { maxNovels: config.maxNovels || 100, baseWordCount: config.baseWordCount || 0, ...config };
        this.novels = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalNovels: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getNovel', (ctx) => this.getNovel(ctx.novelId));
        this.registerTool('writeNovel', (ctx) => this.writeNovel(ctx));
    }

    writeNovel(data) {
        const id = data.id || `nvl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const novel = {
            novelId: id,
            title: data.title,
            author: data.author,
            chapters: data.chapters || [],
            wordCount: data.wordCount !== undefined ? data.wordCount : this.config.baseWordCount,
            ratings: data.ratings || [],
            status: data.status || 'ongoing',
            createdAt: Date.now()
        };
        this.novels.set(id, novel);
        this.stats.totalNovels++;
        this._triggerHook('novelWritten', { novelId: id, title: novel.title });
        return { success: true, novel };
    }

    getNovel(id) { return this.novels.get(id) ? { ...this.novels.get(id) } : null; }
    listNovels() { return Array.from(this.novels.values()).map(n => ({ ...n })); }
    listByStatus(status) { return Array.from(this.novels.values()).filter(n => n.status === status).map(n => ({ ...n })); }
    listByAuthor(author) { return Array.from(this.novels.values()).filter(n => n.author === author).map(n => ({ ...n })); }

    addChapter(novelId, title, wordCount = 1000) {
        const novel = this.novels.get(novelId);
        if (!novel) return { success: false, error: 'NOVEL_NOT_FOUND' };
        novel.chapters.push({ title, wordCount, addedAt: Date.now() });
        novel.wordCount += wordCount;
        this._triggerHook('chapterAdded', { novelId, title, wordCount });
        return { success: true, chapter: { title, wordCount }, totalChapters: novel.chapters.length, totalWords: novel.wordCount };
    }

    addRating(novelId, score = 5) {
        const novel = this.novels.get(novelId);
        if (!novel) return { success: false, error: 'NOVEL_NOT_FOUND' };
        novel.ratings.push(score);
        this._triggerHook('ratingAdded', { novelId, score, totalRatings: novel.ratings.length });
        return { success: true, score, totalRatings: novel.ratings.length };
    }

    completeNovel(novelId) {
        const novel = this.novels.get(novelId);
        if (!novel) return { success: false, error: 'NOVEL_NOT_FOUND' };
        novel.status = 'completed';
        this._triggerHook('novelCompleted', { novelId });
        return { success: true, status: novel.status };
    }

    calculateAverageRating(novelId) {
        const novel = this.novels.get(novelId);
        if (!novel) return 0;
        if (!novel.ratings || novel.ratings.length === 0) return 0;
        const sum = novel.ratings.reduce((acc, r) => acc + r, 0);
        return sum / novel.ratings.length;
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
        if (this.stats.totalNovels < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxNovels += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { novels: Array.from(this.novels.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.novels) this.novels = new Map(data.novels);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, novelCount: this.novels.size }; }
}
