/**
 * EvolutionDashboard.js - NPC Self-Evolution Dashboard
 * V283 Iteration 7/9 - Self-Evolution Dashboard UI
 * 
 * 核心机制：
 * 1. 聚合 ExperienceTracker + SkillCrystallization + NPCLearningMesh + EvolutionTrigger
 * 2. 提供统一的自进化状态视图
 * 3. 支持宗门总览和NPC详情
 */

export class EvolutionDashboard {
    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器
     * @param {SkillCrystallization} skillCrystallization - 技能结晶化系统
     * @param {NPCLearningMesh} npcLearningMesh - NPC协作学习网络
     * @param {EvolutionTrigger} evolutionTrigger - 自动进化触发器
     */
    constructor(experienceTracker, skillCrystallization, npcLearningMesh, evolutionTrigger) {
        this.experienceTracker = experienceTracker;
        this.skillCrystallization = skillCrystallization;
        this.npcLearningMesh = npcLearningMesh;
        this.evolutionTrigger = evolutionTrigger;
        
        /** @type {Array<Object>} evolution event log */
        this.evolutionLog = [];
    }
    
    /**
     * 获取NPC综合状态
     * 聚合所有子系统数据，返回综合状态
     * @param {string} npcId - NPC ID
     * @returns {Object} 综合状态
     */
    getNPCStatus(npcId) {
        // 1. 获取 ExperienceTracker 状态
        const expStats = this.experienceTracker.getStats(npcId);
        const adaptationScore = this.experienceTracker.getAdaptationScore(npcId);
        const recentRecords = this.experienceTracker.getRecentRecords(npcId, 5);
        
        // 2. 获取 SkillCrystallization 状态
        const skillLibrary = this.skillCrystallization.getSkillLibrary(npcId);
        const skillStats = this.skillCrystallization.getSkillStats(npcId);
        
        // 3. 获取 NPCLearningMesh 状态
        let meshStatus = null;
        if (this.npcLearningMesh.isRegistered(npcId)) {
            const peers = this.npcLearningMesh.getPeers(npcId);
            const sharedSkills = this.npcLearningMesh.querySharedSkills(npcId);
            meshStatus = {
                peerCount: peers.peerCount,
                peers: peers.peers,
                sharedSkillsCount: sharedSkills.count,
                sharedSkills: sharedSkills.skills
            };
        }
        
        // 4. 获取 EvolutionTrigger 状态
        const registeredTriggers = this.evolutionTrigger.getRegisteredTriggers(npcId);
        const triggerHistory = this.evolutionTrigger.getTriggerHistory(npcId, 5);
        
        // 5. 计算综合评级
        const evolutionLevel = this._calculateEvolutionLevel(
            expStats, 
            skillStats, 
            meshStatus, 
            adaptationScore
        );
        
        // 6. 获取当前活跃的触发条件
        const activeConditions = this._getActiveConditions(npcId);
        
        return {
            npcId,
            evolutionLevel,
            adaptationScore,
            
            // Experience Tracker
            experience: {
                totalInteractions: expStats.totalInteractions,
                successRate: expStats.successRate,
                avgSatisfaction: expStats.avgSatisfaction,
                adaptationLevel: expStats.adaptationLevel,
                lastInteraction: expStats.lastInteraction,
                recentRecords
            },
            
            // Skill Crystallization
            skills: {
                totalSkills: skillStats.totalSkills,
                totalUses: skillStats.totalUses,
                avgConfidence: skillStats.avgConfidence,
                mostUsedSkill: skillStats.mostUsedSkill,
                skillLibrary
            },
            
            // Learning Mesh
            mesh: meshStatus,
            
            // Evolution Trigger
            evolution: {
                registeredTriggers,
                triggerHistory,
                activeConditions,
                availableConditions: this.evolutionTrigger.getAvailableConditions()
            }
        };
    }
    
    /**
     * 计算进化等级
     * @private
     */
    _calculateEvolutionLevel(expStats, skillStats, meshStatus, adaptationScore) {
        let level = 1;
        
        // 基于交互次数 (每10次+1, 最多+3)
        level += Math.min(Math.floor(expStats.totalInteractions / 10), 3);
        
        // 基于技能数量 (每个技能+0.5, 最多+2)
        level += Math.min(skillStats.totalSkills * 0.5, 2);
        
        // 基于网络连接 (每个对等+0.5, 最多+2)
        if (meshStatus) {
            level += Math.min(meshStatus.peerCount * 0.5, 2);
        }
        
        // 基于适配度 (0.5以上+1)
        if (adaptationScore >= 0.5) {
            level += 1;
        }
        
        return Math.min(Math.round(level), 10);
    }
    
    /**
     * 获取当前活跃的触发条件
     * @private
     */
    _getActiveConditions(npcId) {
        const activeConditions = [];
        const availableConditions = this.evolutionTrigger.getAvailableConditions();
        
        for (const conditionId of availableConditions) {
            // 创建一个临时触发器来检查条件
            const registered = this.evolutionTrigger.registerTrigger(
                npcId, 
                conditionId, 
                async () => ({ success: true })
            );
            
            if (registered.success) {
                // 触发并检查
                this.evolutionTrigger.clearTriggers(npcId);
                this.evolutionTrigger.registerTrigger(npcId, conditionId, async () => ({ success: true }));
            }
        }
        
        return activeConditions;
    }
    
    /**
     * 获取宗门总览：所有NPC状态统计
     * @returns {Object} 宗门总览数据
     */
    getSectOverview() {
        const allNpcIds = this.experienceTracker.getAllNpcIds();
        
        // 如果 NPCLearningMesh 已注册，也包含其 NPC
        const meshStats = this.npcLearningMesh.getStats();
        
        // 统计所有NPC
        const npcSummaries = [];
        let totalInteractions = 0;
        let totalSkills = 0;
        let totalSuccesses = 0;
        let totalFailures = 0;
        
        for (const npcId of allNpcIds) {
            const stats = this.experienceTracker.getStats(npcId);
            const skillStats = this.skillCrystallization.getSkillStats(npcId);
            
            npcSummaries.push({
                npcId,
                totalInteractions: stats.totalInteractions,
                successRate: stats.successRate,
                skillCount: skillStats.totalSkills,
                evolutionLevel: this.getNPCStatus(npcId).evolutionLevel
            });
            
            totalInteractions += stats.totalInteractions;
            totalSkills += skillStats.totalSkills;
            totalSuccesses += Math.floor(stats.totalInteractions * stats.successRate);
            totalFailures += Math.floor(stats.totalInteractions * (1 - stats.successRate));
        }
        
        // 按进化等级排序
        npcSummaries.sort((a, b) => b.evolutionLevel - a.evolutionLevel);
        
        // 整体网络状态
        const networkStatus = {
            totalNPCs: this.npcLearningMesh.mesh.size,
            totalPeerConnections: meshStats.totalPeerConnections,
            totalSharedSkills: meshStats.totalSharedSkills,
            registeredNPCs: Array.from(this.npcLearningMesh.mesh.keys())
        };
        
        return {
            sectName: 'Self-Evolution Sect',
            totalNPCs: allNpcIds.length,
            totalInteractions,
            totalSkills,
            overallSuccessRate: totalInteractions > 0 ? Math.round(totalSuccesses / totalInteractions * 100) / 100 : 0,
            npcSummaries,
            networkStatus,
            timestamp: Date.now()
        };
    }
    
    /**
     * 获取进化事件日志
     * @param {string} npcId - NPC ID (null表示所有NPC)
     * @param {number} limit - 返回最近N条记录，默认20
     * @returns {Object[]} 进化事件日志
     */
    getEvolutionLog(npcId = null, limit = 20) {
        // 从 EvolutionTrigger 获取触发历史
        const allLogs = [];
        
        if (npcId) {
            const history = this.evolutionTrigger.getTriggerHistory(npcId, limit);
            for (const entry of history) {
                allLogs.push({
                    ...entry,
                    source: 'evolutionTrigger',
                    npcId
                });
            }
            
            // 从 NPCLearningMesh 获取共享记录
            const sharedSkills = this.npcLearningMesh.querySharedSkills(npcId);
            if (sharedSkills.success && sharedSkills.skills) {
                for (const skill of sharedSkills.skills) {
                    if (skill.sharedAt) {
                        allLogs.push({
                            timestamp: skill.sharedAt,
                            type: 'skill_shared',
                            skillId: skill.id,
                            sharedBy: skill.sharedBy,
                            npcId
                        });
                    }
                }
            }
        } else {
            // 获取所有NPC的历史
            const allNpcIds = this.experienceTracker.getAllNpcIds();
            for (const id of allNpcIds) {
                const history = this.evolutionTrigger.getTriggerHistory(id, Math.ceil(limit / allNpcIds.length) || 5);
                for (const entry of history) {
                    allLogs.push({
                        ...entry,
                        source: 'evolutionTrigger',
                        npcId: id
                    });
                }
            }
        }
        
        // 添加本地记录的进化事件
        for (const entry of this.evolutionLog) {
            if (npcId === null || entry.npcId === npcId) {
                allLogs.push({
                    ...entry,
                    source: 'dashboard'
                });
            }
        }
        
        // 按时间戳排序并限制数量
        allLogs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        return allLogs.slice(0, limit);
    }
    
    /**
     * 添加进化事件到日志
     * @param {string} npcId - NPC ID
     * @param {Object} event - 事件对象
     */
    addEvolutionEvent(npcId, event) {
        this.evolutionLog.push({
            npcId,
            ...event,
            timestamp: Date.now()
        });
        
        // 保持日志在合理大小
        if (this.evolutionLog.length > 1000) {
            this.evolutionLog = this.evolutionLog.slice(-1000);
        }
    }
    
    /**
     * 获取推荐行动
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 推荐行动数组
     */
    getRecommendedActions(npcId) {
        const recommendations = [];
        const status = this.getNPCStatus(npcId);
        
        // 1. 检查是否需要结晶技能
        if (status.experience.totalInteractions >= 10 && status.skills.totalSkills === 0) {
            recommendations.push({
                priority: 'high',
                action: 'crystallize_skill',
                reason: 'NPC has 10+ interactions but no crystallized skills',
                suggestion: 'Trigger skill crystallization to固化成功行为模式'
            });
        }
        
        // 2. 检查是否需要网络连接
        if (!status.mesh || status.mesh.peerCount === 0) {
            recommendations.push({
                priority: 'medium',
                action: 'connect_mesh',
                reason: 'NPC is not connected to learning mesh',
                suggestion: 'Connect to other NPCs for shared learning'
            });
        }
        
        // 3. 检查适配度
        if (status.adaptationScore < 0.3) {
            recommendations.push({
                priority: 'high',
                action: 'improve_adaptation',
                reason: 'Adaptation score is below 0.3',
                suggestion: 'Review recent failures and apply IER suggestions'
            });
        }
        
        // 4. 检查技能使用情况
        if (status.skills.totalSkills > 0) {
            const unusedSkills = status.skills.skillLibrary.filter(s => 
                s.lastUsed === null || (Date.now() - s.lastUsed) > 10 * 60 * 1000
            );
            if (unusedSkills.length > 0) {
                recommendations.push({
                    priority: 'medium',
                    action: 'use_skills',
                    reason: `${unusedSkills.length} crystallized skills unused for >10 minutes`,
                    suggestion: 'Practice using crystallized skills in interactions'
                });
            }
        }
        
        // 5. 检查学习 plateau
        if (status.experience.totalInteractions >= 20) {
            const recentSuccessRate = status.experience.successRate;
            if (recentSuccessRate > 0.5 && recentSuccessRate < 0.8) {
                recommendations.push({
                    priority: 'medium',
                    action: 'accelerate_learning',
                    reason: 'Learning appears to be in plateau zone',
                    suggestion: 'Try new interaction strategies or broadcast skills to mesh'
                });
            }
        }
        
        // 6. 检查进化等级
        if (status.evolutionLevel >= 5 && status.mesh && status.mesh.peerCount < 3) {
            recommendations.push({
                priority: 'low',
                action: 'expand_network',
                reason: 'High evolution level but limited network connections',
                suggestion: 'Connect to more NPCs to share expertise'
            });
        }
        
        // 7. 检查连续失败
        const recentRecords = this.experienceTracker.getRecentRecords(npcId, 5);
        const recentFailures = recentRecords.filter(r => !r.outcome.success).length;
        if (recentFailures >= 3) {
            recommendations.push({
                priority: 'high',
                action: 'analyze_failures',
                reason: '3+ consecutive failures in recent interactions',
                suggestion: 'Analyze failure patterns and apply refinement'
            });
        }
        
        // 8. 技能成熟建议
        if (status.experience.totalInteractions >= 15 && status.experience.successRate >= 0.7) {
            recommendations.push({
                priority: 'low',
                action: 'broadcast_skills',
                reason: 'High success rate indicates mature behavior patterns',
                suggestion: 'Broadcast successful skills to mesh for other NPCs'
            });
        }
        
        // 按优先级排序
        recommendations.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        return recommendations;
    }
    
    /**
     * 获取所有NPC的进化里程碑
     * @returns {Object[]} 里程碑列表
     */
    getEvolutionMilestones() {
        const milestones = [];
        const allNpcIds = this.experienceTracker.getAllNpcIds();
        
        for (const npcId of allNpcIds) {
            const stats = this.experienceTracker.getStats(npcId);
            const status = this.getNPCStatus(npcId);
            
            // 检查里程碑
            if (stats.totalInteractions === 10) {
                milestones.push({
                    npcId,
                    type: 'first_crystallization',
                    description: 'First 10 interactions completed',
                    timestamp: Date.now()
                });
            }
            
            if (status.evolutionLevel === 5) {
                milestones.push({
                    npcId,
                    type: 'evolution_milestone',
                    description: 'Reached evolution level 5',
                    timestamp: Date.now()
                });
            }
            
            if (status.mesh && status.mesh.peerCount >= 3) {
                milestones.push({
                    npcId,
                    type: 'mesh_connected',
                    description: 'Connected to 3+ peers in learning mesh',
                    timestamp: Date.now()
                });
            }
        }
        
        return milestones;
    }
}

export default EvolutionDashboard;