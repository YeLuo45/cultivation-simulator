/**
 * PlayerService.js - 玩家服务
 * 提供玩家相关操作：addSpiritStones, addQi, getPlayerInfo 等
 */

const { PlayerEntity, REALMS, STAGES } = require('./entities/PlayerEntity');

/**
 * 玩家服务类
 * 处理玩家相关的业务逻辑
 */
class PlayerService {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * 获取游戏状态的玩家实体
     */
    getPlayerEntity() {
        return new PlayerEntity({
            spiritStones: this.gameState.spiritStones,
            qi: this.gameState.qi,
            spiritEnergy: this.gameState.spiritEnergy,
            maxSpiritEnergy: this.gameState.maxSpiritEnergy,
            cultivationProgress: this.gameState.cultivationProgress,
            cultivationXP: this.gameState.cultivationXP,
            realm: this.gameState.realm,
            stage: this.gameState.stage,
            level: this.gameState.level,
            xp: this.gameState.xp,
            realmProgress: this.gameState.realmProgress,
            maxRealmProgress: this.gameState.maxRealmProgress,
            realmBonus: this.gameState.realmBonus,
            karmaPoints: this.gameState.karmaPoints,
            reputation: this.gameState.reputation,
            equipment: this.gameState.equipment,
            items: this.gameState.items,
            talent: this.gameState.talent,
            talentLevel: this.gameState.talentLevel,
            spiritRoot: this.gameState.spiritRoot,
            soul: this.gameState.soul,
            combatStats: this.gameState.combatStats,
            tribulationRecord: this.gameState.tribulationRecord,
            blessings: this.gameState.blessings
        });
    }

    /**
     * 增加灵石
     */
    addSpiritStones(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        this.gameState.spiritStones = (this.gameState.spiritStones || 0) + amount;
        return {
            success: true,
            added: amount,
            total: this.gameState.spiritStones
        };
    }

    /**
     * 消耗灵石
     */
    spendSpiritStones(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        const current = this.gameState.spiritStones || 0;
        if (current < amount) {
            return { success: false, error: 'Not enough spirit stones', required: amount, available: current };
        }
        this.gameState.spiritStones = current - amount;
        return {
            success: true,
            spent: amount,
            remaining: this.gameState.spiritStones
        };
    }

    /**
     * 增加灵气
     */
    addQi(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        this.gameState.qi = (this.gameState.qi || 0) + amount;
        return {
            success: true,
            added: amount,
            total: this.gameState.qi
        };
    }

    /**
     * 消耗灵气
     */
    spendQi(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        const current = this.gameState.qi || 0;
        if (current < amount) {
            return { success: false, error: 'Not enough qi', required: amount, available: current };
        }
        this.gameState.qi = current - amount;
        return {
            success: true,
            spent: amount,
            remaining: this.gameState.qi
        };
    }

    /**
     * 增加修炼进度
     */
    addCultivationProgress(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        this.gameState.cultivationProgress = (this.gameState.cultivationProgress || 0) + amount;
        return {
            success: true,
            added: amount,
            total: this.gameState.cultivationProgress
        };
    }

    /**
     * 增加修炼经验
     */
    addCultivationXP(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + amount;
        return {
            success: true,
            added: amount,
            total: this.gameState.cultivationXP
        };
    }

    /**
     * 获取玩家信息
     */
    getPlayerInfo() {
        const player = this.getPlayerEntity();
        return player.getSummary();
    }

    /**
     * 获取玩家状态摘要
     */
    getStateSummary() {
        return {
            realm: this.gameState.realm,
            stage: this.gameState.stage,
            spiritStones: this.gameState.spiritStones || 0,
            qi: this.gameState.qi || 0,
            spiritEnergy: this.gameState.spiritEnergy || 0,
            maxSpiritEnergy: this.gameState.maxSpiritEnergy || 100,
            cultivationProgress: this.gameState.cultivationProgress || 0,
            maxRealmProgress: this.gameState.maxRealmProgress || 100,
            level: this.gameState.level || 1,
            xp: this.gameState.xp || 0,
            combatStats: this.gameState.combatStats || { wins: 0, losses: 0 },
            items: this.gameState.items || [],
            equipment: this.gameState.equipment || {}
        };
    }

    /**
     * 提升境界
     */
    advanceRealm() {
        const currentRealm = this.gameState.realm || 0;
        const maxRealm = REALMS.length - 1;
        
        if (currentRealm >= maxRealm) {
            return { success: false, error: 'Already at max realm' };
        }
        
        this.gameState.realm = currentRealm + 1;
        this.gameState.cultivationProgress = 0;
        
        // 境界提升后给予奖励
        const bonus = 5 * (this.gameState.realm + 1);
        this.gameState.level = (this.gameState.level || 1) + bonus;
        
        return {
            success: true,
            newRealm: this.gameState.realm,
            realmName: REALMS[this.gameState.realm],
            levelGained: bonus,
            newLevel: this.gameState.level
        };
    }

    /**
     * 提升小境界
     */
    advanceStage() {
        const currentStage = this.gameState.stage || 0;
        
        if (currentStage >= STAGES.length - 1) {
            return { success: false, error: 'Already at max stage' };
        }
        
        this.gameState.stage = currentStage + 1;
        
        return {
            success: true,
            newStage: this.gameState.stage,
            stageName: STAGES[this.gameState.stage]
        };
    }

    /**
     * 提升等级
     */
    addLevel(amount = 1) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        this.gameState.level = (this.gameState.level || 1) + amount;
        return {
            success: true,
            added: amount,
            newLevel: this.gameState.level
        };
    }

    /**
     * 增加声望
     */
    addReputation(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        this.gameState.reputation = (this.gameState.reputation || 0) + amount;
        return {
            success: true,
            added: amount,
            total: this.gameState.reputation
        };
    }

    /**
     * 增加 karma 点数
     */
    addKarmaPoints(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        this.gameState.karmaPoints = (this.gameState.karmaPoints || 0) + amount;
        return {
            success: true,
            added: amount,
            total: this.gameState.karmaPoints
        };
    }

    /**
     * 添加物品到背包
     */
    addItem(item) {
        if (!item || !item.id) {
            return { success: false, error: 'Invalid item' };
        }
        this.gameState.items = this.gameState.items || [];
        this.gameState.items.push({ ...item, id: item.id + '_' + Date.now() });
        return {
            success: true,
            totalItems: this.gameState.items.length
        };
    }

    /**
     * 移除物品
     */
    removeItem(itemId, quantity = 1) {
        const items = this.gameState.items || [];
        let removed = 0;
        
        for (let i = items.length - 1; i >= 0 && removed < quantity; i--) {
            if (items[i].id === itemId) {
                items.splice(i, 1);
                removed++;
            }
        }
        
        return {
            success: removed > 0,
            removed,
            remaining: items.length
        };
    }

    /**
     * 获取物品数量
     */
    getItemCount(itemId) {
        const items = this.gameState.items || [];
        return items.filter(item => item.id === itemId).length;
    }

    /**
     * 更新装备栏
     */
    setEquipment(slot, equipment) {
        this.gameState.equipment = this.gameState.equipment || {};
        this.gameState.equipment[slot] = equipment;
        return {
            success: true,
            slot,
            equipment
        };
    }

    /**
     * 获取装备栏
     */
    getEquipment(slot = null) {
        const equipment = this.gameState.equipment || {};
        if (slot) {
            return equipment[slot] || null;
        }
        return equipment;
    }

    /**
     * 增加战斗胜利
     */
    addWin() {
        this.gameState.combatStats = this.gameState.combatStats || { wins: 0, losses: 0 };
        this.gameState.combatStats.wins++;
        return { success: true, wins: this.gameState.combatStats.wins };
    }

    /**
     * 增加战斗失败
     */
    addLoss() {
        this.gameState.combatStats = this.gameState.combatStats || { wins: 0, losses: 0 };
        this.gameState.combatStats.losses++;
        return { success: true, losses: this.gameState.combatStats.losses };
    }

    /**
     * 重置玩家状态
     */
    reset() {
        this.gameState.spiritStones = 0;
        this.gameState.qi = 0;
        this.gameState.spiritEnergy = 0;
        this.gameState.maxSpiritEnergy = 100;
        this.gameState.cultivationProgress = 0;
        this.gameState.cultivationXP = 0;
        this.gameState.realm = 0;
        this.gameState.stage = 0;
        this.gameState.level = 1;
        this.gameState.xp = 0;
        this.gameState.realmProgress = 0;
        this.gameState.maxRealmProgress = 100;
        this.gameState.realmBonus = 0;
        this.gameState.karmaPoints = 0;
        this.gameState.reputation = 0;
        this.gameState.equipment = {};
        this.gameState.items = [];
        this.gameState.combatStats = { wins: 0, losses: 0 };
        this.gameState.tribulationRecord = [];
        this.gameState.blessings = [];
        return { success: true };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlayerService };
}