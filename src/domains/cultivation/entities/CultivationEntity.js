/**
 * CultivationEntity.js - 修炼实体
 * 管理修炼相关的状态数据
 */

/**
 * 修炼实体类
 * 包含境界、修炼进度、天劫等
 */
class CultivationEntity {
    constructor(data = {}) {
        // 境界
        this.realm = data.realm || 0;          // 0=炼气, 1=筑基, 2=金丹, 3=元婴, 4=化神, 5=飞升
        this.stage = data.stage || 0;          // 0=初期, 1=中期, 2=后期
        
        // 修炼进度
        this.cultivationProgress = data.cultivationProgress || 0;  // 当前进度
        this.maxCultivationProgress = data.maxCultivationProgress || 100;  // 最大进度
        this.cultivationXP = data.cultivationXP || 0;  // 修炼经验
        
        // 灵气/灵力
        this.spiritEnergy = data.spiritEnergy || 0;   // 当前灵力
        this.maxSpiritEnergy = data.maxSpiritEnergy || 100;  // 最大灵力
        this.qi = data.qi || 0;                       // 灵气
        
        // 天劫
        this.tribulation = data.tribulation || {
            active: false,
            targetRealm: null,
            realmName: '',
            phase: 'idle',  // idle, lightning, demon, complete
            strikesTotal: 0,
            strikesCurrent: 0,
            damageAccumulated: 0,
            resistedAccumulated: 0,
            success: null
        };
        
        // 天劫记录
        this.tribulationRecord = data.tribulationRecord || [];
        
        // 祝福
        this.blessings = data.blessings || [];
        
        // 修炼加成
        this.cultivationSpeed = data.cultivationSpeed || 1.0;  // 修炼速度倍率
        this.breakthroughBonus = data.breakthroughBonus || 0;  // 突破加成
        
        // 修炼状态
        this.isMeditating = data.isMeditating || false;
        this.lastMeditationTime = data.lastMeditationTime || null;
    }

    /**
     * 获取当前境界名称
     */
    getRealmName() {
        const REALMS = ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'];
        return REALMS[this.realm] || '凡人';
    }

    /**
     * 获取当前小境界名称
     */
    getStageName() {
        const STAGES = ['初期', '中期', '后期'];
        return STAGES[this.stage] || '初期';
    }

    /**
     * 获取完整境界名称
     */
    getFullRealmName() {
        return `${this.getRealmName()}${this.getStageName()}`;
    }

    /**
     * 获取境界倍率
     */
    getRealmMultiplier() {
        const multipliers = [1.0, 1.5, 2.0, 3.0, 5.0];
        return multipliers[this.realm] || 1.0;
    }

    /**
     * 是否可以突破
     */
    canBreakthrough() {
        return this.cultivationProgress >= this.maxCultivationProgress && this.realm < 5;
    }

    /**
     * 是否正在进行天劫
     */
    isInTribulation() {
        return this.tribulation && this.tribulation.active;
    }

    /**
     * 获取修炼进度百分比
     */
    getProgressPercentage() {
        return (this.cultivationProgress / this.maxCultivationProgress * 100).toFixed(1);
    }

    /**
     * 天劫抗性率
     */
    getResistanceRate() {
        if (!this.tribulation || this.tribulation.strikesCurrent === 0) {
            return '0%';
        }
        const rate = this.tribulation.resistedAccumulated / this.tribulation.strikesCurrent;
        return (rate * 100).toFixed(1) + '%';
    }

    /**
     * 获取天劫进度
     */
    getTribulationProgress() {
        if (!this.tribulation || !this.tribulation.active) {
            return null;
        }
        return {
            targetRealm: this.tribulation.targetRealm,
            realmName: this.tribulation.realmName,
            phase: this.tribulation.phase,
            progress: `${this.tribulation.strikesCurrent}/${this.tribulation.strikesTotal}`,
            percentage: ((this.tribulation.strikesCurrent / this.tribulation.strikesTotal) * 100).toFixed(1) + '%',
            resistanceRate: this.getResistanceRate(),
            damageAccumulated: this.tribulation.damageAccumulated,
            success: this.tribulation.success
        };
    }

    /**
     * 获取修炼摘要
     */
    getSummary() {
        return {
            realm: this.realm,
            realmName: this.getRealmName(),
            stage: this.stage,
            stageName: this.getStageName(),
            fullRealmName: this.getFullRealmName(),
            cultivationProgress: this.cultivationProgress,
            maxCultivationProgress: this.maxCultivationProgress,
            progressPercentage: this.getProgressPercentage(),
            spiritEnergy: this.spiritEnergy,
            maxSpiritEnergy: this.maxSpiritEnergy,
            qi: this.qi,
            cultivationXP: this.cultivationXP,
            realmMultiplier: this.getRealmMultiplier(),
            cultivationSpeed: this.cultivationSpeed,
            breakthroughBonus: this.breakthroughBonus,
            isMeditating: this.isMeditating,
            isInTribulation: this.isInTribulation(),
            tribulationProgress: this.getTribulationProgress(),
            canBreakthrough: this.canBreakthrough(),
            blessings: this.blessings,
            tribulationRecord: this.tribulationRecord
        };
    }

    /**
     * 序列化 (用于保存)
     */
    serialize() {
        return {
            realm: this.realm,
            stage: this.stage,
            cultivationProgress: this.cultivationProgress,
            maxCultivationProgress: this.maxCultivationProgress,
            cultivationXP: this.cultivationXP,
            spiritEnergy: this.spiritEnergy,
            maxSpiritEnergy: this.maxSpiritEnergy,
            qi: this.qi,
            tribulation: this.tribulation,
            tribulationRecord: this.tribulationRecord,
            blessings: this.blessings,
            cultivationSpeed: this.cultivationSpeed,
            breakthroughBonus: this.breakthroughBonus,
            isMeditating: this.isMeditating,
            lastMeditationTime: this.lastMeditationTime
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CultivationEntity };
}