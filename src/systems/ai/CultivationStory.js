/**
 * CultivationStory.js - 修真故事系统
 * V570 Iteration 13/20 Round 23
 */
export class CultivationStory {
    constructor(config = {}) {
        this.config = { maxStories: config.maxStories || 100, basePlot: config.basePlot || 20, ...config };
        this.stories = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStories: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStory', (ctx) => this.getStory(ctx.storyId));
        this.registerTool('writeStory', (ctx) => this.writeStory(ctx));
    }

    writeStory(data) {
        if (this.stories.size >= this.config.maxStories) return { success: false, error: 'STORAGE_FULL' };
        const id = data.storyId || `sty_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const story = {
            storyId: id,
            authorId: data.authorId || 'unknown',
            name: data.name || 'Untitled Story',
            type: data.type || 'folk',
            plot: data.plot !== undefined ? data.plot : this.config.basePlot,
            chapters: Array.isArray(data.chapters) ? [...data.chapters] : [],
            level: data.level || 1,
            status: data.status || 'draft',
            createdAt: Date.now()
        };
        this.stories.set(id, story);
        this.stats.totalStories++;
        this._triggerHook('storyWritten', { storyId: id });
        return { success: true, story };
    }

    getStory(id) { return this.stories.get(id) ? { ...this.stories.get(id) } : null; }
    listStories() { return Array.from(this.stories.values()).map(s => ({ ...s })); }
    listByAuthor(authorId) { return Array.from(this.stories.values()).filter(s => s.authorId === authorId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.stories.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addChapter(storyId, chapter) {
        const story = this.stories.get(storyId);
        if (!story) return { success: false, error: 'STORY_NOT_FOUND' };
        story.chapters.push(chapter);
        this._triggerHook('chapterAdded', { storyId, chapterCount: story.chapters.length });
        return { success: true };
    }

    deepenPlot(storyId, amount = 5) {
        const story = this.stories.get(storyId);
        if (!story) return { success: false, error: 'STORY_NOT_FOUND' };
        story.plot += amount;
        this._triggerHook('plotDeepened', { storyId, newPlot: story.plot });
        return { success: true };
    }

    levelUpStory(storyId) {
        const story = this.stories.get(storyId);
        if (!story) return { success: false, error: 'STORY_NOT_FOUND' };
        story.level++;
        this._triggerHook('storyLeveledUp', { storyId, newLevel: story.level });
        return { success: true };
    }

    legendStory(storyId) {
        const story = this.stories.get(storyId);
        if (!story) return { success: false, error: 'STORY_NOT_FOUND' };
        story.status = 'legendary';
        this._triggerHook('storyLegendized', { storyId });
        return { success: true };
    }

    calculateStoryValue(storyId) {
        const story = this.stories.get(storyId);
        if (!story) return 0;
        return story.level * 100 + story.plot * 2 + story.chapters.length * 30;
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
        if (this.stats.totalStories < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxStories += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { stories: Array.from(this.stories.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.stories) this.stories = new Map(data.stories);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, storyCount: this.stories.size }; }
}
