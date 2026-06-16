/**
 * SectReward.js - 宗门奖励系统
 * V482 Iteration 14/15 Round 18 - Sect Reward
 *
 * 融合6大设计系统:
 * - generic-agent: 奖励自循环
 * - chatdev: 奖励角色协调
 * - nanobot: 奖励mesh
 * - claude-code: 奖励分析工具
 * - thunderbolt: 奖励持久化
 * - ruflo: 奖励Hook
 */

export class SectReward {
    constructor(config = {}) {
        this.config = { maxRewards: config.maxRewards || 200, baseMerit: config.baseMerit || 10, ...config };
        this.rewards = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRewards: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getReward', (ctx) => this.getReward(ctx.rewardId));
        this.registerTool('announceReward', (ctx) => this.announceReward(ctx));
    }

    announceReward(data) {
        const id = data.id || `rwd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const reward = { rewardId: id, sectId: data.sectId, name: data.name, type: data.type || 'technique', merit: data.merit || this.config.baseMerit, recipients: data.recipients || [], status: 'announced', createdAt: Date.now() };
        this.rewards.set(id, reward);
        this.stats.totalRewards++;
        this._triggerHook('rewardAnnounced', { rewardId: id });
        return { success: true, reward };
    }

    getReward(id) { return this.rewards.get(id) ? { ...this.rewards.get(id), recipients: [...(this.rewards.get(id).recipients || [])] } : null; }
    listRewards() { return Array.from(this.rewards.values()).map(r => ({ ...r, recipients: [...(r.recipients || [])] })); }
    listBySect(sectId) { return Array.from(this.rewards.values()).filter(r => r.sectId === sectId).map(r => ({ ...r, recipients: [...(r.recipients || [])] })); }
    listClaimed() { return Array.from(this.rewards.values()).filter(r => r.status === 'claimed').map(r => ({ ...r, recipients: [...(r.recipients || [])] })); }

    addRecipient(rewardId, member) {
        const reward = this.rewards.get(rewardId);
        if (!reward) return { success: false, error: 'REWARD_NOT_FOUND' };
        if (!reward.recipients) reward.recipients = [];
        reward.recipients.push(member);
        this._triggerHook('recipientAdded', { rewardId, member });
        return { success: true };
    }

    increaseMerit(rewardId, amount = 10) {
        const reward = this.rewards.get(rewardId);
        if (!reward) return { success: false, error: 'REWARD_NOT_FOUND' };
        reward.merit += amount;
        this._triggerHook('meritIncreased', { rewardId, newMerit: reward.merit });
        return { success: true };
    }

    claimReward(rewardId) {
        const reward = this.rewards.get(rewardId);
        if (!reward) return { success: false, error: 'REWARD_NOT_FOUND' };
        reward.status = 'claimed';
        this._triggerHook('rewardClaimed', { rewardId });
        return { success: true };
    }

    expireReward(rewardId) {
        const reward = this.rewards.get(rewardId);
        if (!reward) return { success: false, error: 'REWARD_NOT_FOUND' };
        reward.status = 'expired';
        this._triggerHook('rewardExpired', { rewardId });
        return { success: true };
    }

    calculateRewardValue(rewardId) {
        const reward = this.rewards.get(rewardId);
        if (!reward) return 0;
        return reward.merit * 10 + reward.recipients.length * 5;
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
        if (this.stats.totalRewards < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRewards += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rewards: Array.from(this.rewards.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rewards) this.rewards = new Map(data.rewards);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, rewardCount: this.rewards.size }; }
}
