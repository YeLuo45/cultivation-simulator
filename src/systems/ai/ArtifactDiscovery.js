/**
 * ArtifactDiscovery.js - 法宝发现系统
 * V333 Iteration 3/9 Round 6
 */
export class ArtifactDiscovery {
    constructor(config = {}) {
        this.config = { maxArtifacts: config.maxArtifacts || 200, ...config };
        this.artifacts = new Map();
        this.discoveries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArtifacts: 0, totalIdentified: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const types = [
            { typeId: 'sword', name: 'Sword', basePower: 10 },
            { typeId: 'staff', name: 'Staff', basePower: 12 },
            { typeId: 'shield', name: 'Shield', basePower: 8 },
            { typeId: 'ring', name: 'Ring', basePower: 5 },
            { typeId: 'tome', name: 'Tome', basePower: 15 }
        ];
        for (const t of types) this.config.types = [...(this.config.types || []), t];
    }

    _registerDefaultTools() {
        this.registerTool('getArtifact', (ctx) => this.getArtifact(ctx.artifactId));
        this.registerTool('listArtifacts', () => Array.from(this.artifacts.values()).map(a => ({...a})));
    }

    discoverArtifact(data) {
        const id = data.id || `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const types = this.config.types || [];
        const type = types[Math.floor(Math.random() * types.length)] || { typeId: 'unknown', name: 'Unknown', basePower: 10 };
        const power = type.basePower * (Math.random() * 9 + 1);
        const artifact = {
            artifactId: id, typeId: type.typeId, name: data.name || type.name,
            power: Math.floor(power), discoveredAt: Date.now(), identified: false
        };
        this.artifacts.set(id, artifact);
        this.stats.totalArtifacts++;
        this._triggerHook('artifactDiscovered', { artifactId: id });
        return { success: true, artifact };
    }

    getArtifact(id) { return this.artifacts.get(id) ? { ...this.artifacts.get(id) } : null; }
    listArtifacts() { return Array.from(this.artifacts.values()).map(a => ({ ...a })); }
    listByType(typeId) { return Array.from(this.artifacts.values()).filter(a => a.typeId === typeId).map(a => ({ ...a })); }

    identifyArtifact(artifactId) {
        const artifact = this.artifacts.get(artifactId);
        if (!artifact) return { success: false, error: 'ARTIFACT_NOT_FOUND' };
        if (artifact.identified) return { success: false, error: 'ALREADY_IDENTIFIED' };
        artifact.identified = true;
        artifact.identifiedAt = Date.now();
        this.stats.totalIdentified++;
        this._triggerHook('artifactIdentified', { artifactId });
        return { success: true, artifact: { ...artifact } };
    }

    discardArtifact(artifactId) {
        if (!this.artifacts.has(artifactId)) return { success: false, error: 'ARTIFACT_NOT_FOUND' };
        this.artifacts.delete(artifactId);
        this._triggerHook('artifactDiscarded', { artifactId });
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
        if (this.stats.totalArtifacts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxArtifacts += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { artifacts: Array.from(this.artifacts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.artifacts) this.artifacts = new Map(data.artifacts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, artifactCount: this.artifacts.size }; }
}