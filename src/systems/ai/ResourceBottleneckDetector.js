/**
 * ResourceBottleneckDetector.js - 资源瓶颈检测器
 * V955 P-20260614-008 Iteration 8/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (nanobot bottleneck analysis):
 * - 追踪玩家资源 (qi/lingshi/pills/etc) 消耗/获取
 * - 检测资源瓶颈 (consumption > acquisition)
 * - 标记 critical 资源
 * - 预测资源耗尽
 */

export const RESOURCE_TYPES = ['qi', 'lingshi', 'pills', 'spirit_stone', 'mana', 'stamina'];
export const BOTTLENECK_RATIO = 1.2;
export const CRITICAL_THRESHOLD = 0.2;
export const DEFAULT_MAX_RECORDS = 500;

export class ResourceBottleneckDetector {
    constructor(config = {}) {
        this.config = {
            bottleneckRatio: config.bottleneckRatio !== undefined ? config.bottleneckRatio : BOTTLENECK_RATIO,
            criticalThreshold: config.criticalThreshold !== undefined ? config.criticalThreshold : CRITICAL_THRESHOLD,
            maxRecords: config.maxRecords !== undefined ? config.maxRecords : DEFAULT_MAX_RECORDS,
            ...config,
        };
        this.flows = new Map();        // flowId -> { playerId, resourceType, amount, direction, ts }
        this.playerFlows = new Map();  // playerId -> Map<resourceType, flowId[]>
        this.bottlenecks = new Map();  // bottleneckId -> bottleneck
        this.hooks = new Map();
        this.stats = { totalFlows: 0, totalBottlenecks: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _newId() { return `flo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

    recordFlow(playerId, resourceType, amount, direction) {
        if (!playerId || !RESOURCE_TYPES.includes(resourceType)) return null;
        if (typeof amount !== 'number' || amount < 0) return null;
        if (direction !== 'in' && direction !== 'out') return null;
        const id = this._newId();
        const flow = { id, playerId, resourceType, amount, direction, ts: Date.now() };
        this.flows.set(id, flow);
        if (!this.playerFlows.has(playerId)) this.playerFlows.set(playerId, new Map());
        const pmap = this.playerFlows.get(playerId);
        if (!pmap.has(resourceType)) pmap.set(resourceType, []);
        pmap.get(resourceType).push(id);
        if (pmap.get(resourceType).length > this.config.maxRecords) pmap.get(resourceType).shift();
        this.stats.totalFlows++;
        this._checkBottleneck(playerId, resourceType);
        this._emit('flowRecorded', flow);
        return flow;
    }

    _checkBottleneck(playerId, resourceType) {
        const list = this._flowsFor(playerId, resourceType);
        if (list.length < 3) return null;
        const totalIn = list.filter(f => f.direction === 'in').reduce((s, f) => s + f.amount, 0);
        const totalOut = list.filter(f => f.direction === 'out').reduce((s, f) => s + f.amount, 0);
        if (totalIn === 0) return null;
        const ratio = totalOut / totalIn;
        if (ratio < this.config.bottleneckRatio) return null;
        const netBalance = totalIn - totalOut;
        const isCritical = netBalance < totalIn * this.config.criticalThreshold;
        const id = `bnk_${playerId}_${resourceType}`;
        const bottleneck = {
            id, playerId, resourceType,
            consumption: totalOut, acquisition: totalIn, ratio,
            netBalance, isCritical,
            detectedAt: Date.now(),
        };
        this.bottlenecks.set(id, bottleneck);
        this.stats.totalBottlenecks++;
        this._emit('bottleneckDetected', bottleneck);
        return bottleneck;
    }

    _flowsFor(playerId, resourceType) {
        const pmap = this.playerFlows.get(playerId);
        if (!pmap) return [];
        const ids = pmap.get(resourceType) || [];
        return ids.map(id => this.flows.get(id)).filter(Boolean);
    }

    getBottleneck(bottleneckId) { return this.bottlenecks.get(bottleneckId) || null; }

    listBottlenecks(playerId = null) {
        const all = [...this.bottlenecks.values()];
        if (playerId) return all.filter(b => b.playerId === playerId);
        return all;
    }

    netBalance(playerId, resourceType) {
        const list = this._flowsFor(playerId, resourceType);
        const totalIn = list.filter(f => f.direction === 'in').reduce((s, f) => s + f.amount, 0);
        const totalOut = list.filter(f => f.direction === 'out').reduce((s, f) => s + f.amount, 0);
        return totalIn - totalOut;
    }

    predictExhaustion(playerId, resourceType) {
        const list = this._flowsFor(playerId, resourceType);
        if (list.length < 2) return null;
        const recent = list.slice(-5);
        const avgOut = recent.filter(f => f.direction === 'out').reduce((s, f) => s + f.amount, 0) / recent.length;
        const net = this.netBalance(playerId, resourceType);
        if (avgOut <= 0) return null;
        const cyclesToZero = Math.max(0, net) / avgOut;
        return { cyclesToZero, currentBalance: net, avgOutflow: avgOut };
    }

    criticalResources(playerId) {
        return this.listBottlenecks(playerId).filter(b => b.isCritical).map(b => b.resourceType);
    }

    report(playerId) {
        const balances = {};
        for (const r of RESOURCE_TYPES) {
            const flows = this._flowsFor(playerId, r);
            const inAmt = flows.filter(f => f.direction === 'in').reduce((s, f) => s + f.amount, 0);
            const outAmt = flows.filter(f => f.direction === 'out').reduce((s, f) => s + f.amount, 0);
            balances[r] = { in: inAmt, out: outAmt, net: inAmt - outAmt };
        }
        return {
            playerId,
            balances,
            bottlenecks: this.listBottlenecks(playerId).length,
            criticalResources: this.criticalResources(playerId),
        };
    }

    reset() {
        this.flows.clear();
        this.playerFlows.clear();
        this.bottlenecks.clear();
        this.stats = { totalFlows: 0, totalBottlenecks: 0 };
    }
}
