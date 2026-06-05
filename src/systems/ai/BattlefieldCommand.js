/**
 * BattlefieldCommand.js - 战场指挥系统
 * V319 Iteration 7/9 Round 4
 */
export class BattlefieldCommand {
    constructor(config = {}) {
        this.config = { maxCommands: config.maxCommands || 100, baseCommandPower: config.baseCommandPower || 10, ...config };
        this.commands = new Map();
        this.orders = new Map();
        this.commanders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCommands: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('issueOrder', (ctx) => this.issueOrder(ctx.commanderId, ctx.orderType, ctx.targetId));
        this.registerTool('getCommander', (ctx) => this.getCommander(ctx.commanderId));
    }

    registerCommander(data) {
        const id = data.id || `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const commander = { commanderId: id, name: data.name || 'Unnamed', leadership: data.leadership || 50, experience: 0, rank: data.rank || 'sergeant' };
        this.commanders.set(id, commander);
        return { success: true, commander };
    }

    getCommander(id) { return this.commanders.get(id) ? { ...this.commanders.get(id) } : null; }
    listCommanders() { return Array.from(this.commanders.values()).map(c => ({ ...c })); }

    issueOrder(commanderId, orderType, targetId) {
        const commander = this.commanders.get(commanderId);
        if (!commander) return { success: false, error: 'COMMANDER_NOT_FOUND' };
        const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const order = { orderId, commanderId, type: orderType, targetId, status: 'issued', issuedAt: Date.now(), power: this.config.baseCommandPower * (commander.leadership / 50) };
        this.orders.set(orderId, order);
        commander.experience++;
        this.stats.totalCommands++;
        this._triggerHook('orderIssued', { orderId, type: orderType });
        return { success: true, order };
    }

    getOrder(id) { return this.orders.get(id) ? { ...this.orders.get(id) } : null; }
    listOrders() { return Array.from(this.orders.values()).map(o => ({ ...o })); }

    completeOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
        if (order.status === 'completed') return { success: false, error: 'ALREADY_COMPLETED' };
        order.status = 'completed';
        order.completedAt = Date.now();
        this._triggerHook('orderCompleted', { orderId });
        return { success: true };
    }

    failOrder(orderId, reason = 'unknown') {
        const order = this.orders.get(orderId);
        if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
        order.status = 'failed';
        order.failureReason = reason;
        return { success: true };
    }

    calculateCommandPower(commanderId) {
        const commander = this.commanders.get(commanderId);
        if (!commander) return { success: false, error: 'COMMANDER_NOT_FOUND' };
        const power = this.config.baseCommandPower * (commander.leadership / 50) * (1 + commander.experience * 0.01);
        return { success: true, power };
    }

    promoteCommander(commanderId) {
        const commander = this.commanders.get(commanderId);
        if (!commander) return { success: false, error: 'COMMANDER_NOT_FOUND' };
        const ranks = ['sergeant', 'captain', 'major', 'colonel', 'general'];
        const idx = ranks.indexOf(commander.rank);
        if (idx < ranks.length - 1) commander.rank = ranks[idx + 1];
        else return { success: false, error: 'MAX_RANK' };
        this._triggerHook('commanderPromoted', { commanderId, newRank: commander.rank });
        return { success: true, rank: commander.rank };
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
        if (this.stats.totalCommands < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseCommandPower = Math.min(50, this.config.baseCommandPower + 5);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { commands: Array.from(this.commands.entries()), orders: Array.from(this.orders.entries()), commanders: Array.from(this.commanders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.commands) this.commands = new Map(data.commands);
        if (data.orders) this.orders = new Map(data.orders);
        if (data.commanders) this.commanders = new Map(data.commanders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, commanderCount: this.commanders.size, orderCount: this.orders.size }; }
}