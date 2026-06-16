/**
 * ShortcutRecorder.js - 交互捷径记录器
 * V280 Iteration 4/9 - IER Experience Refinement Engine
 * 
 * 核心机制：
 * 1. 记录常用交互捷径：频繁成功的交互路径 → 快捷方式
 * 2. 捷径可被boost提升优先级
 * 3. 支持快速查找匹配的捷径
 */

/**
 * Shortcut - 交互捷径
 */
class Shortcut {
    constructor(id, npcId, playerAction, npcResponse, successCount = 1) {
        this.id = id;
        this.npcId = npcId;
        this.playerAction = playerAction;
        this.npcResponse = npcResponse;
        this.successCount = successCount;
        this.priority = this._calculatePriority();
        this.lastUsed = null;
        this.useCount = 0;
        this.createdAt = Date.now();
    }

    _calculatePriority() {
        // 基于成功次数计算优先级
        if (this.successCount >= 10) return 'high';
        if (this.successCount >= 5) return 'medium';
        return 'low';
    }

    boost() {
        // 提升优先级
        if (this.priority === 'low') {
            this.priority = 'medium';
        } else if (this.priority === 'medium') {
            this.priority = 'high';
        }
        this.lastUsed = Date.now();
    }

    incrementSuccess() {
        this.successCount++;
        this.priority = this._calculatePriority();
    }

    toJSON() {
        return {
            id: this.id,
            npcId: this.npcId,
            playerAction: this.playerAction,
            npcResponse: this.npcResponse,
            successCount: this.successCount,
            priority: this.priority,
            lastUsed: this.lastUsed,
            useCount: this.useCount,
            createdAt: this.createdAt
        };
    }
}

/**
 * ShortcutRecorder - 交互捷径记录器
 * 
 * 记录常用交互捷径，支持快速查找和优先级管理
 */
export class ShortcutRecorder {
    constructor() {
        this.shortcuts = new Map(); // npcId -> Shortcut[]
    }

    /**
     * 记录成功路径
     * @param {string} npcId - NPC ID
     * @param {string} playerAction - 玩家动作
     * @param {string} npcResponse - NPC响应
     * @param {number} successCount - 成功次数（默认1）
     * @returns {Object} 记录结果
     */
    record(npcId, playerAction, npcResponse, successCount = 1) {
        if (!this.shortcuts.has(npcId)) {
            this.shortcuts.set(npcId, []);
        }

        const shortcuts = this.shortcuts.get(npcId);
        
        // 检查是否已存在相同路径的捷径
        const existing = shortcuts.find(s => 
            s.playerAction === playerAction && s.npcResponse === npcResponse
        );

        if (existing) {
            // 更新现有捷径的成功次数
            existing.incrementSuccess();
            return {
                success: true,
                shortcut: existing.toJSON(),
                isUpdate: true
            };
        }

        // 创建新捷径
        const shortcutId = `shortcut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const shortcut = new Shortcut(shortcutId, npcId, playerAction, npcResponse, successCount);
        shortcuts.push(shortcut);

        return {
            success: true,
            shortcut: shortcut.toJSON(),
            isUpdate: false
        };
    }

    /**
     * 获取NPC的所有捷径
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 捷径数组
     */
    getShortcuts(npcId) {
        const shortcuts = this.shortcuts.get(npcId) || [];
        // 按优先级和成功次数排序
        return shortcuts
            .map(s => s.toJSON())
            .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return b.successCount - a.successCount;
            });
    }

    /**
     * 查找匹配的捷径
     * @param {string} npcId - NPC ID
     * @param {string} playerAction - 玩家动作
     * @returns {Object|null} 匹配的捷径或null
     */
    findShortcut(npcId, playerAction) {
        const shortcuts = this.shortcuts.get(npcId) || [];
        
        // 精确匹配
        const exactMatch = shortcuts.find(s => s.playerAction === playerAction);
        if (exactMatch) {
            exactMatch.useCount++;
            exactMatch.lastUsed = Date.now();
            return exactMatch.toJSON();
        }

        // 部分匹配（包含关系）
        const partialMatches = shortcuts.filter(s => 
            s.playerAction.includes(playerAction) || playerAction.includes(s.playerAction)
        );
        
        if (partialMatches.length > 0) {
            // 返回最接近的
            const bestMatch = partialMatches.reduce((best, current) => 
                current.playerAction.length > best.playerAction.length ? current : best
            );
            bestMatch.useCount++;
            bestMatch.lastUsed = Date.now();
            return bestMatch.toJSON();
        }

        return null;
    }

    /**
     * 提升捷径优先级
     * @param {string} shortcutId - 捷径 ID
     * @returns {Object} 提升结果
     */
    boost(shortcutId) {
        for (const [npcId, shortcuts] of this.shortcuts.entries()) {
            const shortcut = shortcuts.find(s => s.id === shortcutId);
            if (shortcut) {
                shortcut.boost();
                return {
                    success: true,
                    shortcut: shortcut.toJSON()
                };
            }
        }
        
        return {
            success: false,
            reason: 'Shortcut not found'
        };
    }

    /**
     * 删除捷径
     * @param {string} npcId - NPC ID
     * @param {string} shortcutId - 捷径 ID
     * @returns {Object} 删除结果
     */
    removeShortcut(npcId, shortcutId) {
        const shortcuts = this.shortcuts.get(npcId) || [];
        const index = shortcuts.findIndex(s => s.id === shortcutId);
        
        if (index === -1) {
            return {
                success: false,
                reason: 'Shortcut not found'
            };
        }
        
        shortcuts.splice(index, 1);
        return {
            success: true,
            removed: true
        };
    }

    /**
     * 清除NPC的所有捷径
     * @param {string} npcId - NPC ID
     * @returns {Object} 清除结果
     */
    clear(npcId) {
        if (!this.shortcuts.has(npcId)) {
            return {
                success: false,
                reason: 'NPC not found'
            };
        }
        
        this.shortcuts.delete(npcId);
        return {
            success: true,
            cleared: true
        };
    }

    /**
     * 获取捷径统计
     * @param {string} npcId - NPC ID
     * @returns {Object} 统计信息
     */
    getStats(npcId) {
        const shortcuts = this.shortcuts.get(npcId) || [];
        
        if (shortcuts.length === 0) {
            return {
                totalShortcuts: 0,
                highPriority: 0,
                mediumPriority: 0,
                lowPriority: 0,
                avgSuccessCount: 0,
                mostUsed: null
            };
        }
        
        const highPriority = shortcuts.filter(s => s.priority === 'high').length;
        const mediumPriority = shortcuts.filter(s => s.priority === 'medium').length;
        const lowPriority = shortcuts.filter(s => s.priority === 'low').length;
        const avgSuccessCount = shortcuts.reduce((sum, s) => sum + s.successCount, 0) / shortcuts.length;
        
        const mostUsed = shortcuts.reduce((max, s) => 
            s.useCount > max.useCount ? s : max, shortcuts[0]
        );

        return {
            totalShortcuts: shortcuts.length,
            highPriority,
            mediumPriority,
            lowPriority,
            avgSuccessCount: Math.round(avgSuccessCount * 100) / 100,
            mostUsed: mostUsed ? mostUsed.id : null
        };
    }

    /**
     * 获取所有NPC ID列表
     * @returns {string[]} NPC ID数组
     */
    getAllNpcIds() {
        return Array.from(this.shortcuts.keys());
    }

    /**
     * 获取高优先级捷径
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 高优先级捷径数组
     */
    getHighPriorityShortcuts(npcId) {
        const shortcuts = this.shortcuts.get(npcId) || [];
        return shortcuts
            .filter(s => s.priority === 'high')
            .map(s => s.toJSON());
    }
}

export default ShortcutRecorder;