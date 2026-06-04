/**
 * DiscipleCultivationSystem.js - 弟子修炼系统
 * V296 Iteration 2/9 - Disciple Cultivation System
 * 
 * 融合6大设计系统:
 * - generic-agent: Self-evolution + goal-driven
 * - chatdev: Role specialization (disciple progression paths)
 * - nanobot: Dream memory (cultivation insights)
 * - claude-code: Tool system (cultivation techniques)
 * - thunderbolt: Offline-first state
 * - ruflo: Hook event system (cultivation milestones)
 */

export class DiscipleCultivationSystem {
    constructor(config = {}) {
        this.cultivators = new Map();
        this.techniques = new Map();
        this.cultivationRealms = [
            { name: 'Qi Gathering', order: 1, expRequired: 100 },
            { name: 'Foundation Building', order: 2, expRequired: 500 },
            { name: 'Core Formation', order: 3, expRequired: 2000 },
            { name: 'Nascent Soul', order: 4, expRequired: 8000 },
            { name: 'Spirit Severance', order: 5, expRequired: 30000 },
            { name: 'Deity Transformation', order: 6, expRequired: 100000 },
            { name: 'Immortal Ascension', order: 7, expRequired: 500000 },
        ];
        this.hooks = {};
        this.autoSave = config.autoSave !== false;
        this.evolutionEnabled = config.evolutionEnabled !== false;
        
        this._registerDefaultHooks();
    }

    // ========== 修炼者注册 ==========
    
    registerCultivator(cultivatorId, cultivatorData = {}) {
        if (this.cultivators.has(cultivatorId)) {
            return { success: false, error: 'CULTIVATOR_EXISTS' };
        }
        
        const cultivator = {
            cultivatorId,
            name: cultivatorData.name || cultivatorId,
            realm: cultivatorData.realm || this.cultivationRealms[0].name,
            realmOrder: cultivatorData.realmOrder || 1,
            exp: cultivatorData.exp || 0,
            techniques: cultivatorData.techniques || [],
            attributes: cultivatorData.attributes || {
                spiritRoot: this._randomAttr(),
                comprehension: this._randomAttr(),
                willpower: this._randomAttr(),
                luck: this._randomAttr(),
            },
            cultivationSpeed: cultivatorData.cultivationSpeed || 1.0,
            insights: cultivatorData.insights || [],
            totalCultivationTime: cultivatorData.totalCultivationTime || 0,
            lastCultivateAt: cultivatorData.lastCultivateAt || Date.now(),
            milestones: cultivatorData.milestones || [],
            goalRealm: cultivatorData.goalRealm || null,
            evolutionLevel: 0,
        };
        
        this.cultivators.set(cultivatorId, cultivator);
        this._triggerHook('cultivatorRegistered', { cultivatorId, realm: cultivator.realm });
        return { success: true, cultivator };
    }
    
    _randomAttr() {
        return Math.round((Math.random() * 5 + 5) * 10) / 10;
    }
    
    getCultivator(cultivatorId) {
        return this.cultivators.get(cultivatorId) || null;
    }
    
    removeCultivator(cultivatorId) {
        if (!this.cultivators.has(cultivatorId)) {
            return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        }
        this.cultivators.delete(cultivatorId);
        this._triggerHook('cultivatorRemoved', { cultivatorId });
        return { success: true };
    }
    
    // ========== 修炼功法 ==========
    
    registerTechnique(techniqueId, techniqueData = {}) {
        if (this.techniques.has(techniqueId)) {
            return { success: false, error: 'TECHNIQUE_EXISTS' };
        }
        
        const technique = {
            techniqueId,
            name: techniqueData.name || techniqueId,
            realm: techniqueData.realm || 'Qi Gathering',
            elements: techniqueData.elements || ['wood'],
            difficulty: techniqueData.difficulty || 'beginner',
            expBonus: techniqueData.expBonus || 1.0,
            requiredAttributes: techniqueData.requiredAttributes || {},
            effects: techniqueData.effects || [],
            cooldown: techniqueData.cooldown || 0,
            learnedBy: [],
        };
        
        this.techniques.set(techniqueId, technique);
        this._triggerHook('techniqueRegistered', { techniqueId, name: technique.name });
        return { success: true, technique };
    }
    
    learnTechnique(cultivatorId, techniqueId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        
        const technique = this.techniques.get(techniqueId);
        if (!technique) return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        
        if (cultivator.techniques.includes(techniqueId)) {
            return { success: false, error: 'TECHNIQUE_ALREADY_LEARNED' };
        }
        
        // Check attribute requirements
        for (const [attr, min] of Object.entries(technique.requiredAttributes)) {
            if ((cultivator.attributes[attr] || 0) < min) {
                return { success: false, error: 'ATTRIBUTE_NOT_MET' };
            }
        }
        
        cultivator.techniques.push(techniqueId);
        technique.learnedBy.push(cultivatorId);
        this._triggerHook('techniqueLearned', { cultivatorId, techniqueId });
        return { success: true, techniques: cultivator.techniques };
    }
    
    getTechnique(techniqueId) {
        return this.techniques.get(techniqueId) || null;
    }
    
    // ========== 修炼核心 ==========
    
    cultivate(cultivatorId, amount = 10) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        
        // Calculate actual gain with speed and technique bonuses
        let gain = amount * cultivator.cultivationSpeed;
        for (const techId of cultivator.techniques) {
            const tech = this.techniques.get(techId);
            if (tech) gain *= tech.expBonus;
        }
        gain = Math.round(gain);
        
        cultivator.exp += gain;
        cultivator.totalCultivationTime += 1;
        cultivator.lastCultivateAt = Date.now();
        
        // Check for realm advancement
        const result = this._checkRealmAdvancement(cultivator);
        
        this._triggerHook('cultivated', {
            cultivatorId,
            expGained: gain,
            totalExp: cultivator.exp,
            advanced: result.advanced,
        });
        
        return {
            success: true,
            expGained: gain,
            totalExp: cultivator.exp,
            ...result,
        };
    }
    
    _checkRealmAdvancement(cultivator) {
        const currentRealmData = this.cultivationRealms.find(r => r.name === cultivator.realm);
        if (!currentRealmData) return { advanced: false };
        
        const nextRealm = this.cultivationRealms.find(r => r.order === currentRealmData.order + 1);
        if (!nextRealm) return { advanced: false }; // Already at max
        
        if (cultivator.exp >= currentRealmData.expRequired * nextRealm.order) {
            // Special milestone check for high-order advancements
            if (nextRealm.order >= 5 && !cultivator.milestones.includes('immortal_threshold')) {
                cultivator.milestones.push('immortal_threshold');
                this._triggerHook('milestoneReached', {
                    cultivatorId: cultivator.cultivatorId,
                    milestone: 'immortal_threshold',
                });
            }
            
            cultivator.realm = nextRealm.name;
            cultivator.realmOrder = nextRealm.order;
            cultivator.exp = 0;
            this._triggerHook('realmAdvanced', {
                cultivatorId: cultivator.cultivatorId,
                newRealm: nextRealm.name,
            });
            return { advanced: true, newRealm: nextRealm.name };
        }
        
        return { advanced: false };
    }
    
    // ========== 目标系统 (源自 generic-agent) ==========
    
    setGoalRealm(cultivatorId, realmName) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        
        const realmData = this.cultivationRealms.find(r => r.name === realmName);
        if (!realmData) return { success: false, error: 'REALM_NOT_FOUND' };
        
        cultivator.goalRealm = realmName;
        this._triggerHook('goalSet', { cultivatorId, goalRealm: realmName });
        return { success: true, goalRealm: realmName };
    }
    
    getProgress(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return null;
        
        const currentRealm = this.cultivationRealms.find(r => r.name === cultivator.realm);
        const nextRealm = this.cultivationRealms.find(r => r.order === (currentRealm?.order || 1) + 1);
        
        const progress = {
            cultivatorId,
            currentRealm: cultivator.realm,
            realmOrder: cultivator.realmOrder,
            exp: cultivator.exp,
            techniques: cultivator.techniques.length,
            goalRealm: cultivator.goalRealm,
            progressToGoal: null,
            evolutionLevel: cultivator.evolutionLevel,
        };
        
        if (cultivator.goalRealm && nextRealm) {
            const goalRealmData = this.cultivationRealms.find(r => r.name === cultivator.goalRealm);
            if (goalRealmData && goalRealmData.order > cultivator.realmOrder) {
                const currentProgress = (cultivator.realmOrder - (currentRealm?.order || 1)) / (goalRealmData.order - (currentRealm?.order || 1));
                progress.progressToGoal = Math.round(currentProgress * 100);
            }
        }
        
        return progress;
    }
    
    // ========== 领悟系统 (源自 nanobot dream memory) ==========
    
    addInsight(cultivatorId, insight) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        
        const insightEntry = {
            insight,
            timestamp: Date.now(),
            expBonus: Math.random() * 0.5 + 0.5,
        };
        
        cultivator.insights.push(insightEntry);
        
        // Apply insight bonus to cultivation
        cultivator.cultivationSpeed *= insightEntry.expBonus;
        
        this._triggerHook('insightGained', { cultivatorId, insight });
        return { success: true, insights: cultivator.insights };
    }
    
    // ========== Hook 系统 (源自 ruflo) ==========
    
    _registerDefaultHooks() {
        const defaultHooks = [
            'cultivatorRegistered', 'cultivatorRemoved', 'techniqueRegistered',
            'techniqueLearned', 'cultivated', 'realmAdvanced', 'goalSet',
            'insightGained', 'milestoneReached',
        ];
        for (const hook of defaultHooks) {
            this.hooks[hook] = [];
        }
    }
    
    registerHook(event, callback) {
        if (!this.hooks[event]) this.hooks[event] = [];
        this.hooks[event].push(callback);
        return () => {
            this.hooks[event] = this.hooks[event].filter(cb => cb !== callback);
        };
    }
    
    _triggerHook(event, data) {
        if (!this.hooks[event]) return;
        for (const callback of this.hooks[event]) {
            try { callback(data); } catch (e) { /* silent */ }
        }
    }
    
    // ========== 状态查询 ==========
    
    getOverview() {
        return {
            totalCultivators: this.cultivators.size,
            totalTechniques: this.techniques.size,
            averageRealmOrder: this._averageRealmOrder(),
            evolutionEnabled: this.evolutionEnabled,
        };
    }
    
    _averageRealmOrder() {
        if (this.cultivators.size === 0) return 0;
        let total = 0;
        for (const c of this.cultivators.values()) {
            total += c.realmOrder;
        }
        return Math.round(total / this.cultivators.size * 10) / 10;
    }
    
    // ========== 数据持久化 ==========
    
    toJSON() {
        return {
            cultivators: Array.from(this.cultivators.entries()),
            techniques: Array.from(this.techniques.entries()),
            config: {
                autoSave: this.autoSave,
                evolutionEnabled: this.evolutionEnabled,
            },
        };
    }
    
    fromJSON(data) {
        this.cultivators = new Map(data.cultivators || []);
        this.techniques = new Map(data.techniques || []);
        if (data.config) {
            this.autoSave = data.config.autoSave ?? this.autoSave;
            this.evolutionEnabled = data.config.evolutionEnabled ?? this.evolutionEnabled;
        }
    }
}