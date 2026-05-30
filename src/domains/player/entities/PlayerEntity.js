/**
 * PlayerEntity.js - 玩家实体
 * 包含玩家的核心属性：spiritStones, qi, realm, stage 等
 */

// 游戏配置常量 (从 game.js 提取)
const REALMS = ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'];
const STAGES = ['初期', '中期', '后期'];
const STAGE_NAMES = ['凡人', '修士', '真人', '天君', '大能'];

/**
 * 玩家实体类
 * 管理玩家的核心状态数据
 */
class PlayerEntity {
    constructor(data = {}) {
        // 基础资源
        this.spiritStones = data.spiritStones || 0;  // 灵石
        this.qi = data.qi || 0;                       // 灵气
        this.spiritEnergy = data.spiritEnergy || 0;   // 灵力
        this.maxSpiritEnergy = data.maxSpiritEnergy || 100;  // 最大灵力
        this.cultivationProgress = data.cultivationProgress || 0;  // 修炼进度
        this.cultivationXP = data.cultivationXP || 0;  // 修炼经验
        
        // 境界信息
        this.realm = data.realm || 0;   // 境界等级 (0=炼气, 1=筑基, ...)
        this.stage = data.stage || 0;    // 小境界 (0=初期, 1=中期, 2=后期)
        
        // 等级和进度
        this.level = data.level || 1;
        this.xp = data.xp || 0;
        
        // 进阶/突破进度
        this.realmProgress = data.realmProgress || 0;  // 境界进度
        this.maxRealmProgress = data.maxRealmProgress || 100;  // 最大境界进度
        
        // 境界加成
        this.realmBonus = data.realmBonus || 0;
        
        // 额外属性
        this.karmaPoints = data.karmaPoints || 0;
        this.reputation = data.reputation || 0;
        
        // 装备数据
        this.equipment = data.equipment || {};
        
        // 背包物品
        this.items = data.items || [];
        
        // 天赋系统
        this.talent = data.talent || 'normal';
        this.talentLevel = data.talentLevel || 1;
        
        // 灵根
        this.spiritRoot = data.spiritRoot || { type: 'wood', tier: 1 };
        
        // 元神
        this.soul = data.soul || { power: 0, clarity: 0 };
        
        // 战斗属性
        this.combatStats = data.combatStats || { wins: 0, losses: 0 };
        
        // 天劫记录
        this.tribulationRecord = data.tribulationRecord || [];
        
        // 祝福系统
        this.blessings = data.blessings || [];
    }

    /**
     * 获取当前境界名称
     */
    getRealmName() {
        return REALMS[this.realm] || '凡人';
    }

    /**
     * 获取当前小境界名称
     */
    getStageName() {
        return STAGES[this.stage] || '初期';
    }

    /**
     * 获取境界名称 (完整)
     */
    getFullRealmName() {
        return `${this.getRealmName()}${this.getStageName()}`;
    }

    /**
     * 获取境界倍率 (境界越高，奖励加成越多)
     */
    getRealmMultiplier() {
        const multipliers = [1.0, 1.5, 2.0, 3.0, 5.0];
        return multipliers[this.realm] || 1.0;
    }

    /**
     * 是否达到最高境界
     */
    isMaxRealm() {
        return this.realm >= REALMS.length - 1;
    }

    /**
     * 检查是否可以突破
     */
    canBreakthrough() {
        return this.cultivationProgress >= this.maxRealmProgress && !this.isMaxRealm();
    }

    /**
     * 获取玩家摘要信息
     */
    getSummary() {
        return {
            realm: this.realm,
            realmName: this.getRealmName(),
            stage: this.stage,
            stageName: this.getStageName(),
            fullRealmName: this.getFullRealmName(),
            level: this.level,
            spiritStones: this.spiritStones,
            qi: this.qi,
            spiritEnergy: this.spiritEnergy,
            maxSpiritEnergy: this.maxSpiritEnergy,
            cultivationProgress: this.cultivationProgress,
            cultivationXP: this.cultivationXP,
            realmMultiplier: this.getRealmMultiplier(),
            talent: this.talent,
            spiritRoot: this.spiritRoot,
            isMaxRealm: this.isMaxRealm(),
            canBreakthrough: this.canBreakthrough()
        };
    }

    /**
     * 序列化 (用于保存)
     */
    serialize() {
        return {
            spiritStones: this.spiritStones,
            qi: this.qi,
            spiritEnergy: this.spiritEnergy,
            maxSpiritEnergy: this.maxSpiritEnergy,
            cultivationProgress: this.cultivationProgress,
            cultivationXP: this.cultivationXP,
            realm: this.realm,
            stage: this.stage,
            level: this.level,
            xp: this.xp,
            realmProgress: this.realmProgress,
            maxRealmProgress: this.maxRealmProgress,
            realmBonus: this.realmBonus,
            karmaPoints: this.karmaPoints,
            reputation: this.reputation,
            equipment: this.equipment,
            items: this.items,
            talent: this.talent,
            talentLevel: this.talentLevel,
            spiritRoot: this.spiritRoot,
            soul: this.soul,
            combatStats: this.combatStats,
            tribulationRecord: this.tribulationRecord,
            blessings: this.blessings
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlayerEntity, REALMS, STAGES, STAGE_NAMES };
}