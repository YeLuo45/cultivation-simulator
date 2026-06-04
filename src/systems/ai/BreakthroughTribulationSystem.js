/**
 * BreakthroughTribulationSystem.js - 突破天劫系统
 * V302 Iteration 8/9 - Breakthrough & Tribulation System
 * 
 * 融合6大设计系统:
 * - generic-agent: 天劫自进化 (难度随境界提升)
 * - chatdev: 多方协作应劫
 * - nanobot: mesh网络应劫协调
 * - claude-code: 工具系统 (渡劫计算)
 * - thunderbolt: 离线持久化
 * - ruflo: Hook系统 (天劫事件)
 */

export class BreakthroughTribulationSystem {
    constructor(config = {}) {
        this.config = {
            maxTribulationLevel: config.maxTribulationLevel || 9,
            baseSurvivalRate: config.baseSurvivalRate || 0.5,
            calamityDamage: config.calamityDamage || 100,
            heavenBlessingChance: config.heavenBlessingChance || 0.1,
            autoSave: config.autoSave !== false,
            ...config
        };
        
        this.realms = new Map();
        this.cultivators = new Map();
        this.tribulations = new Map();
        this.attempts = new Map();
        this.calamities = new Map();
        this.meshNodes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAttempts: 0, totalSuccess: 0, totalFailure: 0, totalCalamities: 0, evolutionCount: 0 };
        
        this._registerDefaultRealms();
        this._registerDefaultTools();
    }

    _registerDefaultRealms() {
        const defaults = [
            { realmId: 'qi_refining', name: '炼气', order: 1, expRequired: 100, tribulationLevel: 0 },
            { realmId: 'foundation_building', name: '筑基', order: 2, expRequired: 500, tribulationLevel: 1 },
            { realmId: 'core_formation', name: '金丹', order: 3, expRequired: 2000, tribulationLevel: 2 },
            { realmId: 'nascent_soul', name: '元婴', order: 4, expRequired: 10000, tribulationLevel: 3 },
            { realmId: 'soul_transformation', name: '化神', order: 5, expRequired: 50000, tribulationLevel: 4 },
            { realmId: 'void_refinement', name: '炼虚', order: 6, expRequired: 200000, tribulationLevel: 5 },
            { realmId: 'body_integration', name: '合体', order: 7, expRequired: 1000000, tribulationLevel: 6 },
            { realmId: 'mahayana', name: '大乘', order: 8, expRequired: 5000000, tribulationLevel: 7 },
            { realmId: 'tribulation_transcending', name: '渡劫', order: 9, expRequired: 25000000, tribulationLevel: 8 },
            { realmId: 'immortal_ascension', name: '飞升', order: 10, expRequired: 100000000, tribulationLevel: 9 }
        ];
        for (const r of defaults) this.realms.set(r.realmId, r);
    }

    _registerDefaultTools() {
        this.registerTool('calculateSurvivalRate', (ctx) => this.calculateSurvivalRate(ctx.cultivatorId, ctx.targetRealmId));
        this.registerTool('getTribulationStatus', (ctx) => this.getTribulation(ctx.tribulationId));
        this.registerTool('listRealms', () => Array.from(this.realms.values()));
    }

    // ========== 境界管理 ==========
    
    registerCultivator(cultivatorData) {
        const id = cultivatorData.id || `cult_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = {
            id,
            name: cultivatorData.name || 'Anonymous',
            currentRealm: cultivatorData.realm || 'qi_refining',
            exp: cultivatorData.exp || 0,
            cultivation: cultivatorData.cultivation || 10,
            karma: cultivatorData.karma || 0,
            comprehension: cultivatorData.comprehension || 1.0,
            daoHeart: cultivatorData.daoHeart || 0.5,
            tribulationsPassed: 0
        };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) {
        return this.cultivators.get(id) || null;
    }

    listCultivators() {
        return Array.from(this.cultivators.values());
    }

    getRealm(realmId) {
        return this.realms.get(realmId) || null;
    }

    listRealms() {
        return Array.from(this.realms.values()).sort((a, b) => a.order - b.order);
    }

    // ========== 渡劫系统 ==========
    
    triggerTribulation(cultivatorId, targetRealmId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const targetRealm = this.realms.get(targetRealmId);
        if (!targetRealm) return { success: false, error: 'REALM_NOT_FOUND' };
        
        const currentRealm = this.realms.get(cultivator.currentRealm);
        if (currentRealm && targetRealm.order <= currentRealm.order) {
            return { success: false, error: 'INVALID_TARGET' };
        }
        
        if (cultivator.exp < targetRealm.expRequired) {
            return { success: false, error: 'INSUFFICIENT_EXP' };
        }
        
        const tribulationId = `trib_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tribulation = {
            tribulationId,
            cultivatorId,
            targetRealmId,
            level: targetRealm.tribulationLevel,
            bolts: this._generateBolts(targetRealm.tribulationLevel),
            status: 'pending',
            startedAt: Date.now()
        };
        this.tribulations.set(tribulationId, tribulation);
        this.stats.totalAttempts++;
        this._triggerHook('tribulationStarted', { tribulationId, cultivatorId, targetRealmId });
        return { success: true, tribulation };
    }

    _generateBolts(level) {
        const boltCount = level + 3;
        const bolts = [];
        for (let i = 0; i < boltCount; i++) {
            bolts.push({
                index: i,
                power: 20 + level * 15 + Math.random() * 30,
                type: ['thunder', 'fire', 'wind', 'ice'][Math.floor(Math.random() * 4)],
                dodged: false,
                survived: false
            });
        }
        return bolts;
    }

    attemptTribulation(tribulationId, strategy = {}) {
        const tribulation = this.tribulations.get(tribulationId);
        if (!tribulation) return { success: false, error: 'TRIBULATION_NOT_FOUND' };
        if (tribulation.status !== 'pending') return { success: false, error: 'ALREADY_RESOLVED' };
        
        const cultivator = this.cultivators.get(tribulation.cultivatorId);
        const survivalRate = this.calculateSurvivalRate(tribulation.cultivatorId, tribulation.targetRealmId);
        
        let boltsSurvived = 0;
        let totalDamage = 0;
        
        for (const bolt of tribulation.bolts) {
            const dodgeSkill = (strategy.dodgeSkill || 0) + cultivator.comprehension * 0.2;
            const protection = (strategy.protection || 0) + cultivator.daoHeart * 10;
            
            if (Math.random() < dodgeSkill * 0.5) {
                bolt.dodged = true;
                bolt.survived = true;
                boltsSurvived++;
            } else if (bolt.power <= protection) {
                bolt.survived = true;
                boltsSurvived++;
            } else {
                totalDamage += bolt.power - protection;
            }
        }
        
        const survived = (boltsSurvived / tribulation.bolts.length) >= survivalRate && totalDamage < cultivator.cultivation;
        tribulation.status = survived ? 'passed' : 'failed';
        tribulation.boltsSurvived = boltsSurvived;
        tribulation.totalDamage = totalDamage;
        tribulation.completedAt = Date.now();
        
        if (survived) {
            cultivator.currentRealm = tribulation.targetRealmId;
            cultivator.exp -= this.realms.get(tribulation.targetRealmId).expRequired;
            cultivator.tribulationsPassed++;
            this.stats.totalSuccess++;
            this._triggerHook('tribulationPassed', { tribulationId, cultivatorId: cultivator.id });
        } else {
            this.stats.totalFailure++;
            this._triggerHook('tribulationFailed', { tribulationId, cultivatorId: cultivator.id });
        }
        
        return { success: true, survived, boltsSurvived, totalDamage, tribulation };
    }

    calculateSurvivalRate(cultivatorId, targetRealmId) {
        const cultivator = this.cultivators.get(cultivatorId);
        const targetRealm = this.realms.get(targetRealmId);
        if (!cultivator || !targetRealm) return 0;
        
        let rate = this.config.baseSurvivalRate;
        rate += cultivator.comprehension * 0.15;
        rate += cultivator.daoHeart * 0.1;
        rate += cultivator.karma * 0.001;
        rate -= targetRealm.tribulationLevel * 0.05;
        return Math.max(0, Math.min(1, rate));
    }

    getTribulation(tribulationId) {
        const t = this.tribulations.get(tribulationId);
        if (!t) return null;
        return { ...t };
    }

    // ========== 心魔系统 ==========
    
    spawnCalamity(cultivatorId, calamityType = 'inner_demon') {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        
        const calamityId = `cal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const calamity = {
            calamityId,
            cultivatorId,
            type: calamityType,
            severity: Math.floor(Math.random() * 10) + 1,
            resisted: false,
            spawnedAt: Date.now()
        };
        this.calamities.set(calamityId, calamity);
        this.stats.totalCalamities++;
        this._triggerHook('calamitySpawned', { calamityId, cultivatorId, type: calamityType });
        return { success: true, calamity };
    }

    resistCalamity(calamityId, daoHeartPower = 0) {
        const calamity = this.calamities.get(calamityId);
        if (!calamity) return { success: false, error: 'CALAMITY_NOT_FOUND' };
        const cultivator = this.cultivators.get(calamity.cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        
        const resistance = cultivator.daoHeart + daoHeartPower * 0.1;
        const success = resistance * 10 >= calamity.severity;
        calamity.resisted = success;
        calamity.resolvedAt = Date.now();
        
        if (success) {
            cultivator.daoHeart = Math.min(1, cultivator.daoHeart + 0.05);
            this._triggerHook('calamityResisted', { calamityId, cultivatorId: cultivator.id });
        } else {
            cultivator.daoHeart = Math.max(0, cultivator.daoHeart - 0.1);
            this._triggerHook('calamityConsumed', { calamityId, cultivatorId: cultivator.id });
        }
        return { success: true, resisted: success, calamity };
    }

    getCalamity(calamityId) {
        const c = this.calamities.get(calamityId);
        if (!c) return null;
        return { ...c };
    }

    // ========== 天道眷顾 ==========
    
    invokeHeavenBlessing(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        if (Math.random() > this.config.heavenBlessingChance) {
            return { success: false, reason: 'NO_BLESSING' };
        }
        cultivator.comprehension = Math.min(5, cultivator.comprehension + 0.1);
        cultivator.karma += 10;
        this._triggerHook('heavenBlessing', { cultivatorId });
        return { success: true, comprehension: cultivator.comprehension };
    }

    // ========== Mesh 协助 (nanobot) ==========
    
    addMeshNode(nodeId) {
        const node = { nodeId, neighbors: [], assistance: new Map(), connected: true };
        this.meshNodes.set(nodeId, node);
        return { success: true, node };
    }

    connectMeshNodes(a, b) {
        const na = this.meshNodes.get(a);
        const nb = this.meshNodes.get(b);
        if (!na || !nb) return { success: false, error: 'NODE_NOT_FOUND' };
        if (!na.neighbors.includes(b)) na.neighbors.push(b);
        if (!nb.neighbors.includes(a)) nb.neighbors.push(a);
        return { success: true };
    }

    requestAssistance(targetId, helperId, assistanceType) {
        const helper = this.cultivators.get(helperId);
        if (!helper) return { success: false, error: 'HELPER_NOT_FOUND' };
        const node = this.meshNodes.get(targetId);
        if (!node) return { success: false, error: 'NODE_NOT_FOUND' };
        
        if (!node.assistance.has(assistanceType)) {
            node.assistance.set(assistanceType, []);
        }
        node.assistance.get(assistanceType).push({ helperId, timestamp: Date.now() });
        this._triggerHook('assistanceProvided', { targetId, helperId, type: assistanceType });
        return { success: true };
    }

    // ========== 工具系统 (claude-code) ==========
    
    registerTool(name, handler) {
        this.tools.set(name, { name, handler, registeredAt: Date.now() });
    }

    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try {
            const result = tool.handler(context || {});
            return { success: true, result };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    listTools() {
        return Array.from(this.tools.keys());
    }

    // ========== Hook 系统 (ruflo) ==========
    
    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => {
            const arr = this.hooks.get(event);
            if (arr) {
                const idx = arr.indexOf(handler);
                if (idx >= 0) arr.splice(idx, 1);
            }
        };
    }

    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) {
            try { h(data); } catch (e) { /* silent */ }
        }
    }

    // ========== 自进化 (generic-agent) ==========
    
    autoEvolve() {
        if (this.stats.totalSuccess < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        
        this.config.baseSurvivalRate = Math.min(0.8, this.config.baseSurvivalRate + 0.05);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    // ========== 持久化 (thunderbolt) ==========
    
    toJSON() {
        return {
            cultivators: Array.from(this.cultivators.entries()),
            tribulations: Array.from(this.tribulations.entries()),
            calamities: Array.from(this.calamities.entries()),
            meshNodes: Array.from(this.meshNodes.entries()),
            stats: this.stats,
            config: this.config
        };
    }

    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.tribulations) this.tribulations = new Map(data.tribulations);
        if (data.calamities) this.calamities = new Map(data.calamities);
        if (data.meshNodes) {
            this.meshNodes = new Map(data.meshNodes.map(([k, v]) => [k, { ...v, assistance: new Map(v.assistance || []) }]));
        }
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            cultivatorCount: this.cultivators.size,
            tribulationCount: this.tribulations.size,
            calamityCount: this.calamities.size,
            successRate: this.stats.totalAttempts > 0 ? (this.stats.totalSuccess / this.stats.totalAttempts) : 0
        };
    }
}