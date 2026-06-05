/**
 * ArtLibrary.js - 功法典籍馆
 * V399 Iteration 6/15 Round 13
 */
export class ArtLibrary {
    constructor(config = {}) {
        this.config = { maxBooks: config.maxBooks || 100, baseSlots: config.baseSlots || 50, ...config };
        this.books = new Map();
        this.collections = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBooks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBook', (ctx) => this.getBook(ctx.bookId));
        this.registerTool('addBook', (ctx) => this.addBook(ctx));
    }

    addBook(data) {
        const id = data.id || `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const book = { bookId: id, title: data.title || 'Art Scroll', artId: data.artId, element: data.element, grade: data.grade || 'common', addedAt: Date.now() };
        this.books.set(id, book);
        this.stats.totalBooks++;
        this._triggerHook('bookAdded', { bookId: id });
        return { success: true, book };
    }

    getBook(id) { return this.books.get(id) ? { ...this.books.get(id) } : null; }
    listBooks() { return Array.from(this.books.values()).map(b => ({ ...b })); }
    listByElement(element) { return Array.from(this.books.values()).filter(b => b.element === element).map(b => ({ ...b })); }
    listByGrade(grade) { return Array.from(this.books.values()).filter(b => b.grade === grade).map(b => ({ ...b })); }

    createCollection(data) {
        const id = data.id || `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const collection = { collectionId: id, name: data.name || 'Collection', bookIds: [], createdAt: Date.now() };
        this.collections.set(id, collection);
        this._triggerHook('collectionCreated', { collectionId: id });
        return { success: true, collection };
    }

    getCollection(id) { return this.collections.get(id) ? { ...this.collections.get(id) } : null; }
    listCollections() { return Array.from(this.collections.values()).map(c => ({ ...c })); }

    addToCollection(collectionId, bookId) {
        const collection = this.collections.get(collectionId);
        if (!collection) return { success: false, error: 'COLLECTION_NOT_FOUND' };
        if (!this.books.has(bookId)) return { success: false, error: 'BOOK_NOT_FOUND' };
        if (!collection.bookIds.includes(bookId)) collection.bookIds.push(bookId);
        this._triggerHook('bookAddedToCollection', { collectionId, bookId });
        return { success: true };
    }

    findBooksByArt(artId) { return Array.from(this.books.values()).filter(b => b.artId === artId).map(b => ({ ...b })); }
    findRareBooks() { return this.listByGrade('rare'); }

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
        if (this.stats.totalBooks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBooks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { books: Array.from(this.books.entries()), collections: Array.from(this.collections.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.books) this.books = new Map(data.books);
        if (data.collections) this.collections = new Map(data.collections);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bookCount: this.books.size }; }
}