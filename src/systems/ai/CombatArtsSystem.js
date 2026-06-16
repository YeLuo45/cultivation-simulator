/**
 * CombatArtsSystem.js - 战斗技艺集成系统核心
 * V298 Iteration 4/9 - Combat Arts Integration
 * 
 * 源自6大设计系统融合:
 * - generic-agent: 战斗AI自进化 (learnFromCombat)
 * - chatdev: 战斗角色专业化和战术配合
 * - nanobot: 战斗状态mesh网络同步
 * - claude-code: 战斗工具系统 (combat techniques)
 * - thunderbolt: 战斗状态离线持久化
 * - ruflo: 战斗事件hook系统
 */

export class CombatArtsSystem {
    constructor(config = {}) {
        // Combat techniques registry
        this.techniques = new Map();
        
        // Active combat sessions
        this.combatSessions = new Map();
        
        // Combo tracking
        this.comboState = new Map();
        
        // Cooldown management
        this.cooldowns = new Map();
        
        // Hook system for combat events
        this.hooks = {};
        
        // AI learning data
        this.aiLearningData = new Map();
        
        // Mesh network for combat state sync
        this.meshNetwork = config.meshNetwork || null;
        
        // Role specialization config
        this.roleConfig = config.roleConfig || {
            attacker: { damageBonus: 1.2, defenseBonus: 0.8 },
            defender: { damageBonus: 0.8, defenseBonus: 1.2 },
            support: { damageBonus: 0.9, healBonus: 1.3 },
            balanced: { damageBonus: 1.0, defenseBonus: 1.0 }
        };
        
        // System config
        this.config = {
            maxTechniques: config.maxTechniques || 50,
            maxCombo: config.maxCombo || 10,
            comboWindowMs: config.comboWindowMs || 2000,
            cooldownPrecision: config.cooldownPrecision || 100,
            autoSave: config.autoSave !== false,
            evolutionEnabled: config.evolutionEnabled !== false,
            learningRate: config.learningRate || 0.1,
        };
        
        this._registerDefaultHooks();
        this._registerDefaultTechniques();
    }
    
    // ========== 战斗技艺注册和学习系统 ==========
    
    /**
     * Register a new combat technique
     */
    registerTechnique(techniqueId, techniqueData) {
        if (this.techniques.size >= this.config.maxTechniques) {
            return { success: false, error: 'MAX_TECHNIQUES_REACHED' };
        }
        
        if (this.techniques.has(techniqueId)) {
            return { success: false, error: 'TECHNIQUE_EXISTS' };
        }
        
        const technique = {
            techniqueId,
            name: techniqueData.name || techniqueId,
            type: techniqueData.type || 'attack', // attack, defense, support, ultimate
            damage: techniqueData.damage || 0,
            defense: techniqueData.defense || 0,
            heal: techniqueData.heal || 0,
            cooldown: techniqueData.cooldown || 0,
            energyCost: techniqueData.energyCost || 0,
            comboBonus: techniqueData.comboBonus || 0,
            requiredLevel: techniqueData.requiredLevel || 1,
            roleBonus: techniqueData.roleBonus || null,
            attributes: techniqueData.attributes || {},
            mastered: false,
            learnCount: 0,
            lastUsed: null,
            createdAt: Date.now(),
        };
        
        this.techniques.set(techniqueId, technique);
        this._triggerHook('techniqueRegistered', { techniqueId, name: technique.name });
        
        return { success: true, technique };
    }
    
    /**
     * Learn a combat technique
     */
    learnTechnique(techniqueId, entityId = 'player') {
        const technique = this.techniques.get(techniqueId);
        if (!technique) {
            return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        }
        
        if (!this.aiLearningData.has(entityId)) {
            this.aiLearningData.set(entityId, {
                learnedTechniques: new Set(),
                combatHistory: [],
                winRate: 0.5,
                averageDamage: 0,
                preferredRole: 'balanced',
                evolutionLevel: 0,
            });
        }
        
        const entityData = this.aiLearningData.get(entityId);
        if (entityData.learnedTechniques.has(techniqueId)) {
            return { success: false, error: 'TECHNIQUE_ALREADY_LEARNED' };
        }
        
        entityData.learnedTechniques.add(techniqueId);
        technique.learnCount++;
        technique.mastered = technique.learnCount >= 5;
        
        this._triggerHook('techniqueLearned', { techniqueId, entityId, mastered: technique.mastered });
        this._triggerHook('skillLearned', { sectId: entityId, skill: techniqueId });
        
        return { 
            success: true, 
            technique: technique.name,
            mastered: technique.mastered,
            learnProgress: technique.learnCount
        };
    }
    
    /**
     * Get technique by ID
     */
    getTechnique(techniqueId) {
        return this.techniques.get(techniqueId) || null;
    }
    
    /**
     * Get all techniques
     */
    getAllTechniques() {
        return Array.from(this.techniques.values());
    }
    
    /**
     * Get techniques by type
     */
    getTechniquesByType(type) {
        return Array.from(this.techniques.values()).filter(t => t.type === type);
    }
    
    // ========== 战斗动作执行和冷却管理 ==========
    
    /**
     * Execute a combat action
     */
    executeAction(sessionId, actionType, techniqueId, actorId, targetId) {
        const session = this.combatSessions.get(sessionId);
        if (!session) {
            return { success: false, error: 'COMBAT_SESSION_NOT_FOUND' };
        }
        
        const technique = this.techniques.get(techniqueId);
        if (!technique) {
            return { success: false, error: 'TECHNIQUE_NOT_FOUND' };
        }
        
        // Check cooldown
        const cooldownKey = `${sessionId}:${techniqueId}`;
        if (this._isOnCooldown(cooldownKey)) {
            return { success: false, error: 'TECHNIQUE_ON_COOLDOWN', remainingCooldown: this._getCooldownRemaining(cooldownKey) };
        }
        
        // Check energy
        if (session.energy < technique.energyCost) {
            return { success: false, error: 'INSUFFICIENT_ENERGY' };
        }
        
        // Execute the action
        const result = this._calculateActionResult(session, actionType, technique, actorId, targetId);
        
        // Apply cooldown
        if (technique.cooldown > 0) {
            this.cooldowns.set(cooldownKey, Date.now() + technique.cooldown * 1000);
        }
        
        // Update session
        session.energy = Math.max(0, session.energy - technique.energyCost);
        session.lastAction = { type: actionType, techniqueId, timestamp: Date.now() };
        session.actionHistory.push(result);
        
        // Trigger hooks
        this._triggerHook('actionExecuted', { sessionId, actionType, techniqueId, actorId, result });
        
        return { success: true, result };
    }
    
    /**
     * Check if cooldown is active
     */
    _isOnCooldown(cooldownKey) {
        const cooldownEnd = this.cooldowns.get(cooldownKey);
        if (!cooldownEnd) return false;
        if (Date.now() >= cooldownEnd) {
            this.cooldowns.delete(cooldownKey);
            return false;
        }
        return true;
    }
    
    /**
     * Get remaining cooldown
     */
    _getCooldownRemaining(cooldownKey) {
        const cooldownEnd = this.cooldowns.get(cooldownKey);
        if (!cooldownEnd) return 0;
        return Math.max(0, cooldownEnd - Date.now());
    }
    
    // ========== 战斗伤害计算和属性加成 ==========
    
    /**
     * Calculate action result
     */
    _calculateActionResult(session, actionType, technique, actorId, targetId) {
        const actor = session.actors.get(actorId);
        const target = session.actors.get(targetId);
        
        if (!actor || !target) {
            return { success: false, error: 'INVALID_ACTOR_TARGET' };
        }
        
        let damage = 0;
        let heal = 0;
        let defenseValue = 0;
        const effects = [];
        const isCrit = Math.random() < (actor.critRate || 0.1);
        
        switch (actionType) {
            case 'attack':
                damage = this._calculateDamage(actor, target, technique);
                if (isCrit) {
                    damage = Math.floor(damage * 1.5);
                    effects.push({ type: 'critical', value: damage });
                }
                break;
                
            case 'defend':
                defenseValue = this._calculateDefense(actor, technique);
                effects.push({ type: 'defense', value: defenseValue });
                break;
                
            case 'heal':
                heal = this._calculateHeal(actor, technique);
                effects.push({ type: 'heal', value: heal });
                break;
                
            case 'ultimate':
                damage = this._calculateUltimateDamage(actor, target, technique);
                effects.push({ type: 'ultimate', value: damage });
                break;
        }
        
        // Apply combo bonus
        const comboResult = this._updateCombo(session.id, actorId, technique);
        if (comboResult.comboCount > 1) {
            const comboMultiplier = 1 + (comboResult.comboCount - 1) * 0.1;
            damage = Math.floor(damage * comboMultiplier);
            effects.push({ type: 'combo', count: comboResult.comboCount, multiplier: comboMultiplier });
        }
        
        // Apply role specialization bonus
        const roleBonus = this._getRoleBonus(actor.role, actionType);
        damage = Math.floor(damage * roleBonus.damageBonus);
        defenseValue = Math.floor(defenseValue * roleBonus.defenseBonus);
        
        return {
            actorId,
            targetId,
            actionType,
            techniqueId: technique.techniqueId,
            damage,
            heal,
            defenseValue,
            isCrit,
            effects,
            comboCount: comboResult.comboCount,
            timestamp: Date.now(),
        };
    }
    
    /**
     * Calculate damage with all bonuses
     */
    _calculateDamage(actor, target, technique) {
        let baseDamage = technique.damage || actor.attack || 50;
        
        // Technique multiplier
        baseDamage = Math.floor(baseDamage * (technique.attributes.damageMultiplier || 1));
        
        // Actor attack bonus
        if (actor.attackPercent) {
            baseDamage = Math.floor(baseDamage * actor.attackPercent);
        }
        
        // Technique advantage (rock-paper-scissors style)
        if (technique.attributes.advantageAgainst) {
            if (target.technique && technique.attributes.advantageAgainst === target.technique) {
                baseDamage = Math.floor(baseDamage * 1.5);
            }
        }
        
        // Defense reduction
        const effectiveDefense = target.defense * (target.defensePercent || 1);
        baseDamage = Math.max(1, baseDamage - effectiveDefense);
        
        return baseDamage;
    }
    
    /**
     * Calculate defense value
     */
    _calculateDefense(actor, technique) {
        let defense = technique.defense || actor.defense || 20;
        if (actor.defensePercent) {
            defense = Math.floor(defense * actor.defensePercent);
        }
        return defense;
    }
    
    /**
     * Calculate heal amount
     */
    _calculateHeal(actor, technique) {
        let heal = technique.heal || 0;
        if (actor.qiRegenBonus) {
            heal = Math.floor(heal * (1 + actor.qiRegenBonus));
        }
        return heal;
    }
    
    /**
     * Calculate ultimate damage
     */
    _calculateUltimateDamage(actor, target, technique) {
        let damage = technique.damage * 2;
        damage = this._calculateDamage(actor, target, technique);
        return Math.floor(damage * 2);
    }
    
    // ========== 战斗combo连击系统 ==========
    
    /**
     * Update combo state after action
     */
    _updateCombo(sessionId, actorId, technique) {
        const comboKey = `${sessionId}:${actorId}`;
        
        if (!this.comboState.has(comboKey)) {
            this.comboState.set(comboKey, {
                count: 0,
                lastTechnique: null,
                startTime: Date.now(),
                techniques: [],
            });
        }
        
        const combo = this.comboState.get(comboKey);
        const now = Date.now();
        
        // Check if combo window has expired
        if (now - combo.startTime > this.config.comboWindowMs) {
            combo.count = 0;
            combo.startTime = now;
            combo.techniques = [];
        }
        
        // Check if same technique (continue combo)
        if (combo.lastTechnique !== technique.techniqueId) {
            combo.count++;
            combo.lastTechnique = technique.techniqueId;
            combo.techniques.push(technique.techniqueId);
            combo.startTime = now;
        }
        
        // Cap combo at max
        combo.count = Math.min(combo.count, this.config.maxCombo);
        
        // Apply combo bonus to technique
        const comboBonus = technique.comboBonus || 0;
        if (comboBonus > 0 && combo.count > 1) {
            // Combo bonus is applied in damage calculation
        }
        
        return {
            comboCount: combo.count,
            comboBonus: combo.count > 1 ? comboBonus : 0,
        };
    }
    
    /**
     * Get current combo state
     */
    getComboState(sessionId, actorId) {
        const comboKey = `${sessionId}:${actorId}`;
        return this.comboState.get(comboKey) || null;
    }
    
    /**
     * Reset combo
     */
    resetCombo(sessionId, actorId) {
        const comboKey = `${sessionId}:${actorId}`;
        this.comboState.delete(comboKey);
        return { success: true };
    }
    
    // ========== 战斗AI自进化 (generic-agent) ==========
    
    /**
     * Learn from combat experience
     */
    learnFromCombat(entityId, combatResult) {
        if (!this.config.evolutionEnabled) {
            return { success: false, error: 'EVOLUTION_DISABLED' };
        }
        
        if (!this.aiLearningData.has(entityId)) {
            this.aiLearningData.set(entityId, {
                learnedTechniques: new Set(),
                combatHistory: [],
                winRate: 0.5,
                averageDamage: 0,
                preferredRole: 'balanced',
                evolutionLevel: 0,
            });
        }
        
        const data = this.aiLearningData.get(entityId);
        
        // Record combat result
        data.combatHistory.push({
            result: combatResult.result, // 'win' | 'lose' | 'draw'
            damageDealt: combatResult.damageDealt || 0,
            damageTaken: combatResult.damageTaken || 0,
            techniquesUsed: combatResult.techniquesUsed || [],
            duration: combatResult.duration || 0,
            timestamp: Date.now(),
        });
        
        // Keep history bounded
        if (data.combatHistory.length > 100) {
            data.combatHistory = data.combatHistory.slice(-100);
        }
        
        // Update win rate
        const wins = data.combatHistory.filter(h => h.result === 'win').length;
        data.winRate = wins / data.combatHistory.length;
        
        // Update average damage
        const totalDamage = data.combatHistory.reduce((sum, h) => sum + (h.damageDealt || 0), 0);
        data.averageDamage = totalDamage / data.combatHistory.length;
        
        // Determine preferred role based on combat style
        const aggressiveActions = data.combatHistory.filter(h => 
            h.techniquesUsed && h.techniquesUsed.some(t => {
                const tech = this.techniques.get(t);
                return tech && tech.type === 'attack';
            })
        ).length;
        
        const supportActions = data.combatHistory.filter(h =>
            h.techniquesUsed && h.techniquesUsed.some(t => {
                const tech = this.techniques.get(t);
                return tech && tech.type === 'support';
            })
        ).length;
        
        if (aggressiveActions > supportActions * 2) {
            data.preferredRole = 'attacker';
        } else if (supportActions > aggressiveActions) {
            data.preferredRole = 'support';
        } else {
            data.preferredRole = 'balanced';
        }
        
        // Evolution check
        const evolutionPoints = this._calculateEvolutionPoints(data);
        let evolved = false;
        
        if (evolutionPoints >= 50 && data.evolutionLevel < 3) {
            data.evolutionLevel++;
            evolved = true;
            this._triggerHook('aiEvolved', { entityId, newLevel: data.evolutionLevel });
        }
        
        this._triggerHook('combatLearned', { entityId, combatResult, evolutionPoints });
        
        return {
            success: true,
            evolutionPoints,
            evolved,
            newLevel: data.evolutionLevel,
            winRate: data.winRate,
            averageDamage: data.averageDamage,
        };
    }
    
    /**
     * Calculate evolution points for AI
     */
    _calculateEvolutionPoints(data) {
        let points = 0;
        
        // Combat effectiveness (30%)
        points += data.winRate * 30;
        
        // Damage efficiency (30%)
        const maxPossibleDamage = 10000;
        points += Math.min((data.averageDamage / maxPossibleDamage) * 30, 30);
        
        // Technique diversity (20%)
        const uniqueTechniques = new Set();
        data.combatHistory.forEach(h => {
            (h.techniquesUsed || []).forEach(t => uniqueTechniques.add(t));
        });
        points += Math.min(uniqueTechniques.size * 2, 20);
        
        // Combat frequency (20%)
        points += Math.min(data.combatHistory.length * 0.2, 20);
        
        return Math.min(points, 100);
    }
    
    /**
     * Get AI learning data for entity
     */
    getAILearningData(entityId) {
        return this.aiLearningData.get(entityId) || null;
    }
    
    // ========== 战斗角色专业化 (chatdev) ==========
    
    /**
     * Set entity role
     */
    setEntityRole(entityId, role) {
        if (!this.roleConfig[role]) {
            return { success: false, error: 'INVALID_ROLE' };
        }
        
        const session = this._getSessionForEntity(entityId);
        if (session) {
            const actor = session.actors.get(entityId);
            if (actor) {
                actor.role = role;
                return { success: true, role };
            }
        }
        
        return { success: false, error: 'ENTITY_NOT_IN_COMBAT' };
    }
    
    /**
     * Get role bonus for action type
     */
    _getRoleBonus(role, actionType) {
        const config = this.roleConfig[role] || this.roleConfig.balanced;
        
        switch (actionType) {
            case 'attack':
            case 'ultimate':
                return { damageBonus: config.damageBonus || 1.0, defenseBonus: 1.0 };
            case 'defend':
                return { damageBonus: 1.0, defenseBonus: config.defenseBonus || 1.0 };
            case 'heal':
                return { damageBonus: 1.0, defenseBonus: 1.0, healBonus: config.healBonus || 1.0 };
            default:
                return { damageBonus: 1.0, defenseBonus: 1.0 };
        }
    }
    
    // ========== Mesh网络同步 (nanobot) ==========
    
    /**
     * Sync combat state to mesh network
     */
    syncToMesh(sessionId) {
        if (!this.meshNetwork) {
            return { success: false, error: 'MESH_NOT_AVAILABLE' };
        }
        
        const session = this.combatSessions.get(sessionId);
        if (!session) {
            return { success: false, error: 'COMBAT_SESSION_NOT_FOUND' };
        }
        
        const meshData = {
            sessionId,
            actors: Array.from(session.actors.entries()),
            energy: session.energy,
            round: session.round,
            actionHistory: session.actionHistory.slice(-10),
            timestamp: Date.now(),
        };
        
        this.meshNetwork.broadcast('combat_sync', meshData);
        
        return { success: true, syncedAt: meshData.timestamp };
    }
    
    /**
     * Handle incoming mesh sync
     */
    handleMeshSync(data) {
        const session = this.combatSessions.get(data.sessionId);
        if (!session) return;
        
        // Update session state from mesh data
        session.actors = new Map(data.actors);
        session.energy = data.energy;
        session.round = data.round;
        
        this._triggerHook('meshSyncReceived', { sessionId: data.sessionId, timestamp: data.timestamp });
    }
    
    // ========== 战斗会话管理 ==========
    
    /**
     * Create a combat session
     */
    createCombatSession(sessionId, actors, config = {}) {
        if (this.combatSessions.has(sessionId)) {
            return { success: false, error: 'SESSION_EXISTS' };
        }
        
        const session = {
            id: sessionId,
            actors: new Map(actors.map(a => [a.id, { ...a }])),
            energy: config.initialEnergy || 100,
            maxEnergy: config.maxEnergy || 100,
            round: 0,
            startTime: Date.now(),
            endTime: null,
            result: null,
            actionHistory: [],
            lastAction: null,
            config: {
                timeout: config.timeout || 300000, // 5 minutes
                maxRounds: config.maxRounds || 100,
                ...config,
            },
        };
        
        this.combatSessions.set(sessionId, session);
        this._triggerHook('sessionCreated', { sessionId, actorCount: actors.length });
        
        return { success: true, session };
    }
    
    /**
     * Get combat session
     */
    getCombatSession(sessionId) {
        return this.combatSessions.get(sessionId) || null;
    }
    
    /**
     * End combat session
     */
    endCombatSession(sessionId, result) {
        const session = this.combatSessions.get(sessionId);
        if (!session) {
            return { success: false, error: 'COMBAT_SESSION_NOT_FOUND' };
        }
        
        session.endTime = Date.now();
        session.result = result;
        
        this._triggerHook('sessionEnded', { sessionId, result, duration: session.endTime - session.startTime });
        
        return { success: true, result };
    }
    
    /**
     * Get session for entity helper
     */
    _getSessionForEntity(entityId) {
        for (const session of this.combatSessions.values()) {
            if (session.actors.has(entityId)) {
                return session;
            }
        }
        return null;
    }
    
    // ========== Hook 系统 (ruflo) ==========
    
    /**
     * Register default hooks
     */
    _registerDefaultHooks() {
        const defaultHooks = [
            'techniqueRegistered',
            'techniqueLearned',
            'techniqueUsed',
            'skillLearned',
            'actionExecuted',
            'comboStarted',
            'comboEnded',
            'comboBroken',
            'aiEvolved',
            'combatLearned',
            'meshSyncReceived',
            'sessionCreated',
            'sessionEnded',
        ];
        
        for (const hook of defaultHooks) {
            this.hooks[hook] = [];
        }
    }
    
    /**
     * Register a hook
     */
    registerHook(event, callback) {
        if (!this.hooks[event]) {
            this.hooks[event] = [];
        }
        this.hooks[event].push(callback);
        
        // Return unregister function
        return () => {
            this.hooks[event] = this.hooks[event].filter(cb => cb !== callback);
        };
    }
    
    /**
     * Trigger hook
     */
    _triggerHook(event, data) {
        if (!this.hooks[event]) return;
        for (const callback of this.hooks[event]) {
            try {
                callback(data);
            } catch (e) {
                // Silently ignore hook errors
            }
        }
    }
    
    // ========== 默认战斗技艺 ==========
    
    /**
     * Register default techniques
     */
    _registerDefaultTechniques() {
        const defaults = [
            { techniqueId: 'basic_strike', name: '基础打击', type: 'attack', damage: 50, cooldown: 0, energyCost: 0 },
            { techniqueId: 'power_slash', name: '强力斩击', type: 'attack', damage: 80, cooldown: 3, energyCost: 10 },
            { techniqueId: 'defensive_stance', name: '防御姿态', type: 'defense', defense: 30, cooldown: 2, energyCost: 5 },
            { techniqueId: 'healing_light', name: '治愈之光', type: 'support', heal: 100, cooldown: 5, energyCost: 20 },
            { techniqueId: 'ultimate_fury', name: '终极狂暴', type: 'ultimate', damage: 200, cooldown: 10, energyCost: 50 },
            { techniqueId: 'flame_strike', name: '火焰打击', type: 'attack', damage: 70, cooldown: 3, energyCost: 15, attributes: { element: 'fire' } },
            { techniqueId: 'ice_shield', name: '寒冰护盾', type: 'defense', defense: 50, cooldown: 4, energyCost: 20 },
            { techniqueId: 'lightning_bolt', name: '闪电一击', type: 'attack', damage: 100, cooldown: 4, energyCost: 25 },
            { techniqueId: 'counter_stance', name: '反击姿态', type: 'defense', defense: 40, cooldown: 3, energyCost: 10, comboBonus: 10 },
            { techniqueId: 'combo_finisher', name: '连击终结', type: 'attack', damage: 150, cooldown: 5, energyCost: 30, comboBonus: 20 },
        ];
        
        for (const tech of defaults) {
            this.registerTechnique(tech.techniqueId, tech);
        }
    }
    
    // ========== 数据持久化 (thunderbolt) ==========
    
    /**
     * Serialize system state
     */
    toJSON() {
        const techniquesData = {};
        for (const [id, tech] of this.techniques) {
            techniquesData[id] = { ...tech };
        }
        
        const aiData = {};
        for (const [entityId, data] of this.aiLearningData) {
            aiData[entityId] = {
                ...data,
                learnedTechniques: Array.from(data.learnedTechniques),
                combatHistory: data.combatHistory.slice(-50),
            };
        }
        
        const sessionsData = {};
        for (const [id, session] of this.combatSessions) {
            sessionsData[id] = {
                ...session,
                actors: Array.from(session.actors.entries()),
            };
        }
        
        return {
            techniques: techniquesData,
            aiLearningData: aiData,
            combatSessions: sessionsData,
            config: this.config,
            cooldowns: Array.from(this.cooldowns.entries()),
        };
    }
    
    /**
     * Deserialize system state
     */
    fromJSON(data) {
        this.techniques.clear();
        for (const [id, techData] of Object.entries(data.techniques || {})) {
            this.techniques.set(id, techData);
        }
        
        this.aiLearningData.clear();
        for (const [entityId, aiData] of Object.entries(data.aiLearningData || {})) {
            this.aiLearningData.set(entityId, {
                ...aiData,
                learnedTechniques: new Set(aiData.learnedTechniques || []),
            });
        }
        
        this.combatSessions.clear();
        for (const [id, sessionData] of Object.entries(data.combatSessions || {})) {
            this.combatSessions.set(id, {
                ...sessionData,
                actors: new Map(sessionData.actors || []),
            });
        }
        
        this.config = data.config || this.config;
        this.cooldowns = new Map(data.cooldowns || []);
    }
    
    // ========== 状态查询 ==========
    
    /**
     * Get system overview
     */
    getOverview() {
        let totalSessions = 0;
        let activeSessions = 0;
        
        for (const session of this.combatSessions.values()) {
            totalSessions++;
            if (!session.endTime) activeSessions++;
        }
        
        return {
            totalTechniques: this.techniques.size,
            totalSessions,
            activeSessions,
            totalEntities: this.aiLearningData.size,
            evolutionEnabled: this.config.evolutionEnabled,
        };
    }
    
    /**
     * Get technique details
     */
    getTechniqueDetails(techniqueId) {
        const technique = this.techniques.get(techniqueId);
        if (!technique) return null;
        
        return {
            ...technique,
            usageCount: this.combatSessions.size > 0 ? 
                Array.from(this.combatSessions.values())
                    .reduce((sum, s) => sum + s.actionHistory.filter(a => a.techniqueId === techniqueId).length, 0) : 0,
        };
    }
    
    /**
     * Get cooldown status for session
     */
    getCooldownStatus(sessionId) {
        const session = this.combatSessions.get(sessionId);
        if (!session) return null;
        
        const status = {};
        for (const [techId, technique] of this.techniques) {
            const key = `${sessionId}:${techId}`;
            const remaining = this._getCooldownRemaining(key);
            if (remaining > 0) {
                status[techId] = remaining;
            }
        }
        
        return status;
    }
}