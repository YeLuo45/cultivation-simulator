/**
 * NPCSelfEvolutionMCPService.js - NPC 自进化 MCP 服务
 * V284 Iteration 8/9 - MCP Tools for Self-Evolution
 * 
 * 核心机制：
 * 1. 将 NPC 自进化能力暴露为 MCP 工具
 * 2. 提供 getNPCStatus, triggerNPCLearn, querySkillLibrary, getSectOverview 工具
 * 3. 与 EvolutionDashboard 和 NPCLearningMesh 集成
 */

import { MCPToolsRegistry } from './MCPToolsRegistry.js';

/**
 * NPC 自进化 MCP 服务
 * 将 NPC 自进化系统能力通过 MCP 工具暴露
 */
export class NPCSelfEvolutionMCPService {
    /**
     * @param {Object} npcEvolutionEngine - NPC 进化引擎（组合系统）
     * @param {EvolutionDashboard} evolutionDashboard - 进化仪表板
     */
    constructor(npcEvolutionEngine, evolutionDashboard) {
        this.npcEvolutionEngine = npcEvolutionEngine;
        this.evolutionDashboard = evolutionDashboard;
        this.toolsRegistry = new MCPToolsRegistry('npc-self-evolution');
        
        // 缓存已注册的 NPC
        this._registeredNPCs = new Set();
        
        // 初始化工具
        this.registerTools();
    }

    /**
     * 注册所有 MCP 工具
     */
    registerTools() {
        // 工具：getNPCStatus - 获取 NPC 状态
        this.toolsRegistry.register({
            name: 'getNPCStatus',
            description: '获取 NPC 自进化状态，包括经验、技能、学习网络、进化触发器等信息',
            parameters: {
                type: 'object',
                properties: {
                    npcId: { 
                        type: 'string', 
                        description: 'NPC ID' 
                    }
                },
                required: ['npcId']
            },
            handler: async (params) => this.getNPCStatus(params)
        });

        // 工具：triggerNPCLearn - 触发 NPC 学习
        this.toolsRegistry.register({
            name: 'triggerNPCLearn',
            description: '触发 NPC 学习新技能或强化现有技能',
            parameters: {
                type: 'object',
                properties: {
                    npcId: { 
                        type: 'string', 
                        description: 'NPC ID' 
                    },
                    learningType: { 
                        type: 'string', 
                        description: '学习类型：skill_crystallization(技能结晶), mesh_sync(网络同步), trigger_evolution(触发进化)',
                        enum: ['skill_crystallization', 'mesh_sync', 'trigger_evolution']
                    },
                    options: { 
                        type: 'object', 
                        description: '可选参数' 
                    }
                },
                required: ['npcId', 'learningType']
            },
            handler: async (params) => this.triggerNPCLearn(params)
        });

        // 工具：querySkillLibrary - 查询技能库
        this.toolsRegistry.register({
            name: 'querySkillLibrary',
            description: '查询 NPC 的技能库，返回所有已结晶的技能',
            parameters: {
                type: 'object',
                properties: {
                    npcId: { 
                        type: 'string', 
                        description: 'NPC ID' 
                    },
                    filter: { 
                        type: 'object',
                        description: '过滤条件 { minConfidence?, skillType?, owner? }' 
                    },
                    limit: { 
                        type: 'number', 
                        description: '返回数量限制',
                        default: 50 
                    }
                },
                required: ['npcId']
            },
            handler: async (params) => this.querySkillLibrary(params)
        });

        // 工具：getSectOverview - 获取宗门总览
        this.toolsRegistry.register({
            name: 'getSectOverview',
            description: '获取宗门（所有 NPC）的总体自进化状态概览',
            parameters: {
                type: 'object',
                properties: {
                    includeNPCs: { 
                        type: 'boolean', 
                        description: '是否包含 NPC 详情列表',
                        default: true 
                    },
                    sortBy: { 
                        type: 'string', 
                        description: '排序字段：evolutionLevel, totalInteractions, skillCount',
                        default: 'evolutionLevel' 
                    }
                }
            },
            handler: async (params) => this.getSectOverview(params)
        });

        // 工具：getEvolutionLog - 获取进化日志
        this.toolsRegistry.register({
            name: 'getEvolutionLog',
            description: '获取 NPC 的进化事件日志',
            parameters: {
                type: 'object',
                properties: {
                    npcId: { 
                        type: 'string', 
                        description: 'NPC ID (null 表示所有 NPC)' 
                    },
                    limit: { 
                        type: 'number', 
                        description: '返回记录数',
                        default: 20 
                    }
                }
            },
            handler: async (params) => this.getEvolutionLog(params)
        });

        // 工具：getRecommendedActions - 获取推荐行动
        this.toolsRegistry.register({
            name: 'getRecommendedActions',
            description: '获取 NPC 的推荐行动建议',
            parameters: {
                type: 'object',
                properties: {
                    npcId: { 
                        type: 'string', 
                        description: 'NPC ID' 
                    },
                    priorityFilter: { 
                        type: 'string', 
                        description: '优先级过滤：high, medium, low',
                        enum: ['high', 'medium', 'low'] 
                    }
                },
                required: ['npcId']
            },
            handler: async (params) => this.getRecommendedActions(params)
        });

        // 工具：connectNPCs - 连接 NPC 到学习网络
        this.toolsRegistry.register({
            name: 'connectNPCs',
            description: '将两个 NPC 连接到一起，建立学习对等关系',
            parameters: {
                type: 'object',
                properties: {
                    npcId1: { 
                        type: 'string', 
                        description: 'NPC ID 1' 
                    },
                    npcId2: { 
                        type: 'string', 
                        description: 'NPC ID 2' 
                    }
                },
                required: ['npcId1', 'npcId2']
            },
            handler: async (params) => this.connectNPCs(params)
        });

        // 工具：broadcastSkill - 广播技能到网络
        this.toolsRegistry.register({
            name: 'broadcastSkill',
            description: '将 NPC 的技能广播到学习网络，供其他 NPC 学习',
            parameters: {
                type: 'object',
                properties: {
                    npcId: { 
                        type: 'string', 
                        description: '广播者 NPC ID' 
                    },
                    skill: { 
                        type: 'object',
                        description: '技能对象 { id, pattern, owner? }' 
                    }
                },
                required: ['npcId', 'skill']
            },
            handler: async (params) => this.broadcastSkill(params)
        });
    }

    /**
     * 获取 NPC 状态
     * @param {Object} params - { npcId }
     * @returns {Promise<Object>} NPC 状态
     */
    async getNPCStatus(params) {
        const { npcId } = params;
        
        if (!npcId) {
            return { success: false, error: 'npcId is required' };
        }

        try {
            // 确保 NPC 已注册
            this._ensureNPCRegistered(npcId);
            
            // 通过 dashboard 获取状态
            const status = this.evolutionDashboard.getNPCStatus(npcId);
            
            return {
                success: true,
                npcId,
                ...status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || String(error),
                npcId
            };
        }
    }

    /**
     * 触发 NPC 学习
     * @param {Object} params - { npcId, learningType, options }
     * @returns {Promise<Object>} 学习结果
     */
    async triggerNPCLearn(params) {
        const { npcId, learningType, options = {} } = params;
        
        if (!npcId || !learningType) {
            return { success: false, error: 'npcId and learningType are required' };
        }

        try {
            this._ensureNPCRegistered(npcId);
            
            let result;
            
            switch (learningType) {
                case 'skill_crystallization':
                    // 技能结晶化
                    result = await this._triggerSkillCrystallization(npcId, options);
                    break;
                    
                case 'mesh_sync':
                    // 网络同步
                    result = await this._triggerMeshSync(npcId, options);
                    break;
                    
                case 'trigger_evolution':
                    // 触发进化
                    result = await this._triggerEvolution(npcId, options);
                    break;
                    
                default:
                    return { 
                        success: false, 
                        error: `Unknown learning type: ${learningType}`,
                        validTypes: ['skill_crystallization', 'mesh_sync', 'trigger_evolution']
                    };
            }
            
            return {
                success: true,
                npcId,
                learningType,
                ...result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || String(error),
                npcId,
                learningType
            };
        }
    }

    /**
     * 查询技能库
     * @param {Object} params - { npcId, filter, limit }
     * @returns {Promise<Object>} 技能库查询结果
     */
    async querySkillLibrary(params) {
        const { npcId, filter = {}, limit = 50 } = params;
        
        if (!npcId) {
            return { success: false, error: 'npcId is required' };
        }

        try {
            this._ensureNPCRegistered(npcId);
            
            // 获取 NPC 的技能库
            const skillLibrary = this.evolutionDashboard.getNPCStatus(npcId).skills.skillLibrary;
            
            // 应用过滤
            let filtered = skillLibrary;
            
            if (filter.minConfidence !== undefined) {
                filtered = filtered.filter(s => s.confidence >= filter.minConfidence);
            }
            
            if (filter.skillType) {
                filtered = filtered.filter(s => s.pattern?.type === filter.skillType);
            }
            
            if (filter.owner) {
                filtered = filtered.filter(s => s.owner === filter.owner);
            }
            
            // 应用限制
            const limited = filtered.slice(0, limit);
            
            return {
                success: true,
                npcId,
                totalSkills: filtered.length,
                returnedSkills: limited.length,
                skills: limited
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || String(error),
                npcId
            };
        }
    }

    /**
     * 获取宗门总览
     * @param {Object} params - { includeNPCs, sortBy }
     * @returns {Promise<Object>} 宗门总览
     */
    async getSectOverview(params) {
        const { includeNPCs = true, sortBy = 'evolutionLevel' } = params;
        
        try {
            const overview = this.evolutionDashboard.getSectOverview();
            
            // 排序 NPC 列表
            if (includeNPCs && overview.npcSummaries) {
                overview.npcSummaries.sort((a, b) => {
                    switch (sortBy) {
                        case 'totalInteractions':
                            return b.totalInteractions - a.totalInteractions;
                        case 'skillCount':
                            return b.skillCount - a.skillCount;
                        case 'evolutionLevel':
                        default:
                            return b.evolutionLevel - a.evolutionLevel;
                    }
                });
            }
            
            return {
                success: true,
                ...overview,
                includeNPCs
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || String(error)
            };
        }
    }

    /**
     * 获取进化日志
     * @param {Object} params - { npcId, limit }
     * @returns {Promise<Object>} 进化日志
     */
    async getEvolutionLog(params) {
        const { npcId = null, limit = 20 } = params;
        
        try {
            const logs = this.evolutionDashboard.getEvolutionLog(npcId, limit);
            
            return {
                success: true,
                npcId,
                totalLogs: logs.length,
                logs
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || String(error)
            };
        }
    }

    /**
     * 获取推荐行动
     * @param {Object} params - { npcId, priorityFilter }
     * @returns {Promise<Object>} 推荐行动
     */
    async getRecommendedActions(params) {
        const { npcId, priorityFilter } = params;
        
        if (!npcId) {
            return { success: false, error: 'npcId is required' };
        }
        
        try {
            const recommendations = this.evolutionDashboard.getRecommendedActions(npcId);
            
            // 应用优先级过滤
            let filtered = recommendations;
            if (priorityFilter) {
                filtered = recommendations.filter(r => r.priority === priorityFilter);
            }
            
            return {
                success: true,
                npcId,
                totalRecommendations: filtered.length,
                recommendations: filtered
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || String(error),
                npcId
            };
        }
    }

    /**
     * 连接 NPC
     * @param {Object} params - { npcId1, npcId2 }
     * @returns {Promise<Object>} 连接结果
     */
    async connectNPCs(params) {
        const { npcId1, npcId2 } = params;
        
        if (!npcId1 || !npcId2) {
            return { success: false, error: 'npcId1 and npcId2 are required' };
        }
        
        try {
            // 确保 NPC 已注册
            this._ensureNPCRegistered(npcId1);
            this._ensureNPCRegistered(npcId2);
            
            const mesh = this.evolutionDashboard.npcLearningMesh;
            const result = mesh.connect(npcId1, npcId2);
            
            return {
                success: result.success,
                npcId1,
                npcId2,
                ...result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || String(error)
            };
        }
    }

    /**
     * 广播技能
     * @param {Object} params - { npcId, skill }
     * @returns {Promise<Object>} 广播结果
     */
    async broadcastSkill(params) {
        const { npcId, skill } = params;
        
        if (!npcId || !skill) {
            return { success: false, error: 'npcId and skill are required' };
        }
        
        try {
            this._ensureNPCRegistered(npcId);
            
            const mesh = this.evolutionDashboard.npcLearningMesh;
            const result = mesh.broadcast(npcId, skill);
            
            return {
                success: result.success,
                broadcaster: npcId,
                skillId: skill.id,
                ...result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || String(error)
            };
        }
    }

    /**
     * 确保 NPC 已注册到学习网络
     * @private
     */
    _ensureNPCRegistered(npcId) {
        if (!this._registeredNPCs.has(npcId)) {
            const mesh = this.evolutionDashboard.npcLearningMesh;
            if (mesh && !mesh.isRegistered(npcId)) {
                mesh.register(npcId);
            }
            this._registeredNPCs.add(npcId);
        }
    }

    /**
     * 触发技能结晶化
     * @private
     */
    async _triggerSkillCrystallization(npcId, options) {
        // 从 dashboard 获取技能库统计
        const status = this.evolutionDashboard.getNPCStatus(npcId);
        
        // 模拟技能结晶化触发
        return {
            triggered: true,
            type: 'skill_crystallization',
            currentSkills: status.skills.totalSkills,
            message: 'Skill crystallization triggered'
        };
    }

    /**
     * 触发网络同步
     * @private
     */
    async _triggerMeshSync(npcId, options) {
        const mesh = this.evolutionDashboard.npcLearningMesh;
        const peers = mesh.getPeers(npcId);
        
        return {
            triggered: true,
            type: 'mesh_sync',
            peerCount: peers.peerCount || 0,
            message: 'Mesh sync triggered'
        };
    }

    /**
     * 触发进化
     * @private
     */
    async _triggerEvolution(npcId, options) {
        const status = this.evolutionDashboard.getNPCStatus(npcId);
        const milestones = this.evolutionDashboard.getEvolutionMilestones();
        
        const npcMilestones = milestones.filter(m => m.npcId === npcId);
        
        return {
            triggered: true,
            type: 'trigger_evolution',
            currentLevel: status.evolutionLevel,
            milestones: npcMilestones,
            message: 'Evolution trigger evaluated'
        };
    }

    /**
     * 获取工具注册表
     * @returns {MCPToolsRegistry}
     */
    getToolsRegistry() {
        return this.toolsRegistry;
    }

    /**
     * 获取所有工具定义
     * @returns {Object[]}
     */
    getToolDefinitions() {
        return this.toolsRegistry.getAllTools();
    }

    /**
     * 执行 MCP 工具
     * @param {string} toolName - 工具名称
     * @param {Object} params - 参数
     * @returns {Promise<Object>} 执行结果
     */
    async executeTool(toolName, params) {
        return this.toolsRegistry.execute(toolName, params);
    }

    /**
     * 注册 NPC 到服务
     * @param {string} npcId - NPC ID
     * @returns {Object} 注册结果
     */
    registerNPC(npcId) {
        if (this._registeredNPCs.has(npcId)) {
            return { success: false, reason: 'NPC already registered', npcId };
        }
        
        this._ensureNPCRegistered(npcId);
        return { success: true, npcId };
    }

    /**
     * 批量注册 NPC
     * @param {string[]} npcIds - NPC ID 数组
     * @returns {Object} 注册结果
     */
    registerNPCs(npcIds) {
        const registered = [];
        const failed = [];
        
        for (const npcId of npcIds) {
            const result = this.registerNPC(npcId);
            if (result.success) {
                registered.push(npcId);
            } else {
                failed.push({ npcId, reason: result.reason });
            }
        }
        
        return {
            success: failed.length === 0,
            registered,
            failed
        };
    }

    /**
     * 获取已注册的 NPC 列表
     * @returns {string[]}
     */
    getRegisteredNPCs() {
        return Array.from(this._registeredNPCs);
    }

    /**
     * 重置服务状态
     */
    reset() {
        this._registeredNPCs.clear();
    }
}

export default NPCSelfEvolutionMCPService;