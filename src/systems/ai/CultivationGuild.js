/**
 * CultivationGuild.js - 修真公会
 * V554 Iteration 17/20 Round 22 - Cultivation Guild
 */

export class CultivationGuild {
    constructor(config = {}) {
        this.config = { maxGuilds: config.maxGuilds || 30, baseInfluence: config.baseInfluence || 20, ...config };
        this.guilds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGuilds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGuild', (ctx) => this.getGuild(ctx.guildId));
        this.registerTool('openGuild', (ctx) => this.openGuild(ctx));
    }

    openGuild(data) {
        const id = data.guildId || `gld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const guild = {
            guildId: id,
            founderId: data.founderId,
            name: data.name || 'Unnamed Guild',
            type: data.type || 'merchant',
            influence: data.influence !== undefined ? data.influence : this.config.baseInfluence,
            members: data.members || [],
            level: data.level || 1,
            status: data.status || 'forming',
            createdAt: Date.now()
        };
        this.guilds.set(id, guild);
        this.stats.totalGuilds++;
        this._triggerHook('guildOpened', { guildId: id });
        return { success: true, guild };
    }

    getGuild(id) { return this.guilds.get(id) ? { ...this.guilds.get(id) } : null; }
    listGuilds() { return Array.from(this.guilds.values()).map(g => ({ ...g })); }
    listByFounder(founderId) { return Array.from(this.guilds.values()).filter(g => g.founderId === founderId).map(g => ({ ...g })); }
    listActive() { return Array.from(this.guilds.values()).filter(g => g.status === 'active' || g.status === 'dominant').map(g => ({ ...g })); }

    addMember(guildId, member) {
        const guild = this.guilds.get(guildId);
        if (!guild) return { success: false, error: 'GUILD_NOT_FOUND' };
        guild.members.push(member);
        this._triggerHook('memberAdded', { guildId, member });
        return { success: true };
    }

    increaseInfluence(guildId, amount = 5) {
        const guild = this.guilds.get(guildId);
        if (!guild) return { success: false, error: 'GUILD_NOT_FOUND' };
        guild.influence += amount;
        if (guild.influence >= 50 && guild.status === 'forming') guild.status = 'active';
        this._triggerHook('influenceIncreased', { guildId, amount, newInfluence: guild.influence });
        return { success: true };
    }

    levelUpGuild(guildId) {
        const guild = this.guilds.get(guildId);
        if (!guild) return { success: false, error: 'GUILD_NOT_FOUND' };
        guild.level++;
        this._triggerHook('guildLeveledUp', { guildId, newLevel: guild.level });
        return { success: true };
    }

    dominantGuild(guildId) {
        const guild = this.guilds.get(guildId);
        if (!guild) return { success: false, error: 'GUILD_NOT_FOUND' };
        guild.status = 'dominant';
        this._triggerHook('guildDominant', { guildId });
        return { success: true };
    }

    calculateGuildPower(guildId) {
        const guild = this.guilds.get(guildId);
        if (!guild) return 0;
        return guild.level * 100 + guild.influence * 2 + guild.members.length * 30;
    }

    listByType(type) { return Array.from(this.guilds.values()).filter(g => g.type === type).map(g => ({ ...g })); }
    listDominant() { return Array.from(this.guilds.values()).filter(g => g.status === 'dominant').map(g => ({ ...g })); }

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
        if (this.stats.totalGuilds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGuilds += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { guilds: Array.from(this.guilds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.guilds) this.guilds = new Map(data.guilds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, guildCount: this.guilds.size }; }
}
