/**
 * SectManager.js - 宗门管理系统核心
 * V295 Iteration 1/9 - Sect Management Core
 * 
 * 源自6大设计系统融合:
 * - claude-code-design: Tool system + budget control
 * - chatdev: Role specialization
 * - nanobot: Distributed mesh communication
 * - generic-agent: Self-evolution
 * - thunderbolt: Offline-first persistence
 * - ruflo: Hook event system
 */

export class SectManager {
    constructor(config = {}) {
        this.sects = new Map();
        this.activeSectId = null;
        this.hooks = {};
        this.budgetController = null;
        this.evolutionEnabled = config.evolutionEnabled !== false;
        this.meshNetwork = config.meshNetwork || null;
        
        // 宗门配置
        this.config = {
            maxSects: config.maxSects || 10,
            maxMembersPerSect: config.maxMembersPerSect || 100,
            autoSave: config.autoSave !== false,
            evolutionThreshold: config.evolutionThreshold || 0.5,
        };
        
        // 注册默认hooks
        this._registerDefaultHooks();
    }
    
    // ========== 宗门基础操作 ==========
    
    createSect(sectId, name, sectConfig = {}) {
        if (this.sects.size >= this.config.maxSects) {
            return { success: false, error: 'MAX_SECTS_REACHED' };
        }
        if (this.sects.has(sectId)) {
            return { success: false, error: 'SECT_EXISTS' };
        }
        
        const sect = {
            sectId,
            name,
            level: sectConfig.level || 1,
            exp: sectConfig.exp || 0,
            members: new Map(),
            resources: {
                spiritStones: sectConfig.spiritStones || 100,
                herbs: sectConfig.herbs || 50,
                talismans: sectConfig.talismans || 20,
            },
            skills: [],
            territories: [],
            reputation: sectConfig.reputation || 0,
            foundedAt: sectConfig.foundedAt || Date.now(),
            lastSave: Date.now(),
            evolutionPoints: 0,
            memberRoles: sectConfig.memberRoles || ['disciple', 'elder', 'master'],
            meshConnections: [],
        };
        
        this.sects.set(sectId, sect);
        this._triggerHook('sectCreated', { sectId, name });
        return { success: true, sect };
    }
    
    getSect(sectId) {
        return this.sects.get(sectId) || null;
    }
    
    deleteSect(sectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        
        this.sects.delete(sectId);
        if (this.activeSectId === sectId) {
            this.activeSectId = null;
        }
        this._triggerHook('sectDeleted', { sectId });
        return { success: true };
    }
    
    // ========== 宗门成员管理 ==========
    
    addMember(sectId, memberId, memberData = {}) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        
        if (sect.members.size >= this.config.maxMembersPerSect) {
            return { success: false, error: 'MAX_MEMBERS_REACHED' };
        }
        if (sect.members.has(memberId)) {
            return { success: false, error: 'MEMBER_EXISTS' };
        }
        
        const member = {
            memberId,
            name: memberData.name || memberId,
            role: memberData.role || 'disciple',
            level: memberData.level || 1,
            cultivationBase: memberData.cultivationBase || 0,
            contributions: 0,
            joinedAt: Date.now(),
            skills: memberData.skills || [],
            attributes: memberData.attributes || {
                spiritRoot: Math.random() * 10,
                comprehension: Math.random() * 10,
                willpower: Math.random() * 10,
            },
            evolutionLevel: 0,
            meshLearning: false,
        };
        
        sect.members.set(memberId, member);
        this._triggerHook('memberAdded', { sectId, memberId, role: member.role });
        return { success: true, member };
    }
    
    removeMember(sectId, memberId) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        
        const member = sect.members.get(memberId);
        if (!member) return { success: false, error: 'MEMBER_NOT_FOUND' };
        
        sect.members.delete(memberId);
        this._triggerHook('memberRemoved', { sectId, memberId });
        return { success: true };
    }
    
    getMember(sectId, memberId) {
        const sect = this.sects.get(sectId);
        if (!sect) return null;
        return sect.members.get(memberId) || null;
    }
    
    updateMemberRole(sectId, memberId, newRole) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        
        const member = sect.members.get(memberId);
        if (!member) return { success: false, error: 'MEMBER_NOT_FOUND' };
        
        const oldRole = member.role;
        member.role = newRole;
        member.contributions += 5; // 晋升奖励
        this._triggerHook('memberRoleChanged', { sectId, memberId, oldRole, newRole });
        return { success: true, member };
    }
    
    // ========== 宗门资源管理 ==========
    
    updateResources(sectId, delta) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        
        for (const [resource, amount] of Object.entries(delta)) {
            if (sect.resources[resource] !== undefined) {
                sect.resources[resource] = Math.max(0, sect.resources[resource] + amount);
            }
        }
        
        sect.lastSave = Date.now();
        this._triggerHook('resourcesUpdated', { sectId, resources: sect.resources });
        return { success: true, resources: sect.resources };
    }
    
    getResources(sectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return null;
        return { ...sect.resources };
    }
    
    // ========== 宗门进化系统 (源自 generic-agent) ==========
    
    evolveSect(sectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        
        if (!this.evolutionEnabled) {
            return { success: false, error: 'EVOLUTION_DISABLED' };
        }
        
        const evolutionPoints = this._calculateEvolutionPoints(sect);
        sect.evolutionPoints = evolutionPoints;
        
        if (evolutionPoints >= this.config.evolutionThreshold * 100) {
            sect.level += 1;
            sect.exp = 0;
            this._triggerHook('sectEvolved', { sectId, newLevel: sect.level });
            return { success: true, evolved: true, level: sect.level, evolutionPoints };
        }
        
        return { success: true, evolved: false, evolutionPoints };
    }
    
    _calculateEvolutionPoints(sect) {
        let points = 0;
        
        // 成员贡献
        points += sect.members.size * 5;
        
        // 资源积累
        const totalResources = Object.values(sect.resources).reduce((a, b) => a + b, 0);
        points += Math.min(totalResources / 10, 50);
        
        // 声望
        points += sect.reputation / 10;
        
        // 领地数量
        points += sect.territories.length * 10;
        
        // 技能数量
        points += sect.skills.length * 3;
        
        return Math.min(points, 100);
    }
    
    // ========== Hook 系统 (源自 ruflo) ==========
    
    _registerDefaultHooks() {
        const defaultHooks = [
            'sectCreated', 'sectDeleted', 'memberAdded', 'memberRemoved',
            'memberRoleChanged', 'resourcesUpdated', 'sectEvolved',
            'skillLearned', 'territoryConquered', 'meshConnected',
        ];
        
        for (const hook of defaultHooks) {
            this.hooks[hook] = [];
        }
    }
    
    registerHook(event, callback) {
        if (!this.hooks[event]) {
            this.hooks[event] = [];
        }
        this.hooks[event].push(callback);
        return () => {
            this.hooks[event] = this.hooks[event].filter(cb => cb !== callback);
        };
    }
    
    _triggerHook(event, data) {
        if (!this.hooks[event]) return;
        for (const callback of this.hooks[event]) {
            try {
                callback(data);
            } catch (e) {
                // Hook error - silently ignore
            }
        }
    }
    
    // ========== Mesh 网络 (源自 nanobot) ==========
    
    connectMesh(sectId, peerSectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        
        if (!this.meshNetwork) {
            return { success: false, error: 'MESH_NOT_AVAILABLE' };
        }
        
        if (!sect.meshConnections.includes(peerSectId)) {
            sect.meshConnections.push(peerSectId);
            this._triggerHook('meshConnected', { sectId, peerSectId });
        }
        
        return { success: true, connections: sect.meshConnections };
    }
    
    getMeshConnections(sectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return null;
        return [...sect.meshConnections];
    }
    
    // ========== 宗门技能 (源自 chatdev) ==========
    
    learnSkill(sectId, skill) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        
        if (sect.skills.includes(skill)) {
            return { success: false, error: 'SKILL_EXISTS' };
        }
        
        sect.skills.push(skill);
        this._triggerHook('skillLearned', { sectId, skill });
        return { success: true, skills: sect.skills };
    }
    
    // ========== 预算控制 (源自 claude-code) ==========
    
    setBudgetController(controller) {
        this.budgetController = controller;
    }
    
    checkBudget(sectId, amount) {
        if (!this.budgetController) return true;
        
        const sect = this.sects.get(sectId);
        if (!sect) return false;
        
        return this.budgetController.canSpend(sectId, amount);
    }
    
    // ========== 状态查询 ==========
    
    getSectOverview() {
        return {
            totalSects: this.sects.size,
            activeSectId: this.activeSectId,
            totalMembers: Array.from(this.sects.values()).reduce((sum, s) => sum + s.members.size, 0),
            evolutionEnabled: this.evolutionEnabled,
        };
    }
    
    getSectDetails(sectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return null;
        
        return {
            sectId: sect.sectId,
            name: sect.name,
            level: sect.level,
            exp: sect.exp,
            memberCount: sect.members.size,
            resources: { ...sect.resources },
            skills: [...sect.skills],
            territories: [...sect.territories],
            reputation: sect.reputation,
            evolutionPoints: sect.evolutionPoints,
            meshConnections: [...sect.meshConnections],
        };
    }
    
    // ========== 数据持久化 (源自 thunderbolt) ==========
    
    toJSON() {
        const sectsData = {};
        for (const [id, sect] of this.sects) {
            sectsData[id] = {
                ...sect,
                members: Array.from(sect.members.entries()),
            };
        }
        return {
            sects: sectsData,
            activeSectId: this.activeSectId,
            config: this.config,
        };
    }
    
    fromJSON(data) {
        this.sects.clear();
        for (const [id, sectData] of Object.entries(data.sects)) {
            const sect = {
                ...sectData,
                members: new Map(sectData.members),
            };
            this.sects.set(id, sect);
        }
        this.activeSectId = data.activeSectId;
        this.config = data.config || this.config;
    }
}