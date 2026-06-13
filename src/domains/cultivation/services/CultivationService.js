/**
 * CultivationService.js - 修炼服务
 * 提供修炼相关操作：meditate, breakthrough, tribulation 等
 */

import { CultivationEntity } from '../entities/CultivationEntity.js';
import { SpiritRootEntity, TIER_BONUSES } from '../entities/SpiritRootEntity.js';

/**
 * 天劫配置
 */
const TRIBULATIONS = {
    'breakthrough_2': { type: 'thunder', desc: '筑基天劫', damage: 30 },
    'breakthrough_3': { type: 'thunder', desc: '金丹天劫', damage: 50 },
    'breakthrough_4': { type: 'thunder', desc: '元婴天劫', damage: 80 },
    'breakthrough_5': { type: 'thunder', desc: '化神天劫', damage: 120 },
    'breakthrough_6': { type: 'all', desc: '飞升天劫', damage: 200 },
    'demon': { type: 'demon', desc: '心魔劫', damage: 40 }
};

/**
 * 祝福类型
 */
const BLESSING_TYPES = {
    strength: { name: '天雷淬体', effect: { attack: 10 } },
    defense: { name: '金刚护体', effect: { defense: 10 } },
    speed: { name: '风灵祝福', effect: { speed: 15 } },
    spirit: { name: '凝神诀', effect: { spiritEnergy: 20 } },
    luck: { name: '鸿运当头', effect: { luck: 10 } }
};

/**
 * 修炼服务类
 */
class CultivationService {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * 获取修炼实体
     */
    getCultivationEntity() {
        return new CultivationEntity({
            realm: this.gameState.realm,
            stage: this.gameState.stage,
            cultivationProgress: this.gameState.cultivationProgress,
            maxCultivationProgress: this.gameState.maxCultivationProgress,
            cultivationXP: this.gameState.cultivationXP,
            spiritEnergy: this.gameState.spiritEnergy,
            maxSpiritEnergy: this.gameState.maxSpiritEnergy,
            qi: this.gameState.qi,
            tribulation: this.gameState.tribulation,
            tribulationRecord: this.gameState.tribulationRecord,
            blessings: this.gameState.blessings,
            cultivationSpeed: this.gameState.cultivationSpeed,
            breakthroughBonus: this.gameState.breakthroughBonus,
            isMeditating: this.gameState.isMeditating,
            lastMeditationTime: this.gameState.lastMeditationTime
        });
    }

    /**
     * 获取灵根实体
     */
    getSpiritRootEntity() {
        return new SpiritRootEntity(this.gameState.spiritRoot || { type: 'wood', tier: 1 });
    }

    /**
     * 开始修炼/冥想
     */
    meditate(amount = 10) {
        this.gameState.isMeditating = true;
        this.gameState.lastMeditationTime = Date.now();
        
        // 计算灵气获得量 (受灵根和境界加成影响)
        const spiritRoot = this.getSpiritRootEntity();
        const spiritBonus = 1 + (spiritRoot.getBonuses().cultivationSpeed || 0) / 100;
        const realmMultiplier = this.gameState.realmBonus || 1;
        const gained = Math.floor(amount * spiritBonus * realmMultiplier);
        
        // 增加修炼进度
        this.gameState.cultivationProgress = (this.gameState.cultivationProgress || 0) + gained;
        
        // 增加灵力
        this.gameState.spiritEnergy = Math.min(
            (this.gameState.spiritEnergy || 0) + gained,
            this.gameState.maxSpiritEnergy || 100
        );
        
        // 检查是否达到突破条件
        const maxProgress = this.gameState.maxRealmProgress || 100;
        if (this.gameState.cultivationProgress >= maxProgress) {
            this.gameState.cultivationProgress = maxProgress;
        }
        
        return {
            success: true,
            action: 'meditate',
            spiritGained: gained,
            cultivationProgress: this.gameState.cultivationProgress,
            spiritEnergy: this.gameState.spiritEnergy,
            canBreakthrough: this.gameState.cultivationProgress >= maxProgress
        };
    }

    /**
     * 尝试突破
     */
    breakthrough() {
        const realm = this.gameState.realm || 0;
        const maxRealm = 5;
        
        // 检查是否可以突破
        const maxProgress = this.gameState.maxRealmProgress || 100;
        if (this.gameState.cultivationProgress < maxProgress) {
            return {
                success: false,
                action: 'breakthrough',
                reason: '修炼进度不足，无法突破',
                cultivationProgress: this.gameState.cultivationProgress,
                required: maxProgress
            };
        }
        
        if (realm >= maxRealm) {
            return {
                success: false,
                action: 'breakthrough',
                reason: '已达最高境界，无法继续突破'
            };
        }
        
        // 开始天劫
        const targetRealm = realm + 1;
        const REALMS = ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'];
        const realmName = REALMS[targetRealm];
        
        // 天劫雷数 = 目标境界 * 3
        const strikesTotal = targetRealm * 3;
        
        this.gameState.tribulation = {
            active: true,
            targetRealm: targetRealm,
            realmName: realmName,
            phase: 'lightning',
            strikesTotal: strikesTotal,
            strikesCurrent: 0,
            damageAccumulated: 0,
            resistedAccumulated: 0,
            success: null
        };
        
        return {
            success: true,
            action: 'breakthrough',
            started: true,
            targetRealm: targetRealm,
            realmName: realmName,
            strikesTotal: strikesTotal,
            message: `天劫降临，${realmName}雷劫开始！`
        };
    }

    /**
     * 执行天劫 (自动突破)
     */
    executeTribulation() {
        if (!this.gameState.tribulation || !this.gameState.tribulation.active) {
            return { success: false, error: 'No active tribulation' };
        }
        
        // 计算抗性率
        const t = this.gameState.tribulation;
        const resistRate = t.strikesCurrent > 0 ? t.resistedAccumulated / t.strikesCurrent : 0;
        const success = resistRate >= 0.5;
        
        t.phase = 'complete';
        t.active = false;
        t.success = success;
        
        if (success) {
            // 突破成功
            this.gameState.realm = t.targetRealm;
            this.gameState.cultivationProgress = 0;
            this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + t.targetRealm * 500;
            
            // 记录天劫
            this.gameState.tribulationRecord = this.gameState.tribulationRecord || [];
            this.gameState.tribulationRecord.push({
                realm: t.targetRealm,
                success: true,
                timestamp: Date.now()
            });
            
            return {
                success: true,
                action: 'tribulation',
                result: 'success',
                newRealm: this.gameState.realm,
                realmName: t.realmName,
                resistRate: (resistRate * 100).toFixed(1) + '%'
            };
        } else {
            // 突破失败
            return {
                success: true,
                action: 'tribulation',
                result: 'failed',
                resistRate: (resistRate * 100).toFixed(1) + '%',
                message: '天劫抵抗失败，需要更强的实力'
            };
        }
    }

    /**
     * 记录天劫闪电
     */
    tribulationLightning(damage, resisted = false) {
        if (!this.gameState.tribulation || !this.gameState.tribulation.active) {
            return { error: 'No active tribulation' };
        }
        
        const t = this.gameState.tribulation;
        t.strikesCurrent++;
        t.damageAccumulated += resisted ? 0 : damage;
        t.resistedAccumulated += resisted ? 1 : 0;
        
        const tribulationComplete = t.strikesCurrent >= t.strikesTotal;
        let success = null;
        
        if (tribulationComplete) {
            const resistRate = t.resistedAccumulated / t.strikesCurrent;
            success = resistRate >= 0.5;
            t.success = success;
            t.phase = 'complete';
            t.active = false;
            
            if (success) {
                this.gameState.realm = t.targetRealm;
                this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + t.targetRealm * 500;
                this.gameState.tribulationRecord = this.gameState.tribulationRecord || [];
                this.gameState.tribulationRecord.push({
                    realm: t.targetRealm,
                    success: true,
                    timestamp: Date.now()
                });
            }
        }
        
        return {
            strikeNumber: t.strikesCurrent,
            damage: damage,
            resisted: resisted,
            progress: `${t.strikesCurrent}/${t.strikesTotal}`,
            damageAccumulated: t.damageAccumulated,
            tribulationComplete: tribulationComplete,
            success: success,
            newRealm: success ? this.gameState.realm : null
        };
    }

    /**
     * 开始天劫 (MCP接口)
     */
    startTribulation(targetRealm = null) {
        const currentRealm = this.gameState.realm || 0;
        const target = targetRealm || currentRealm + 1;
        
        if (target <= currentRealm) {
            return { success: false, error: 'Target realm must be higher than current' };
        }
        
        if (target > 5) {
            return { success: false, error: 'Invalid realm' };
        }
        
        const REALMS = ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'];
        const realmName = REALMS[target];
        const strikesTotal = target * 3;
        
        this.gameState.tribulation = {
            active: true,
            targetRealm: target,
            realmName: realmName,
            phase: 'lightning',
            strikesTotal: strikesTotal,
            strikesCurrent: 0,
            damageAccumulated: 0,
            resistedAccumulated: 0,
            success: null
        };
        
        return {
            success: true,
            targetRealm: target,
            realmName: realmName,
            strikesTotal: strikesTotal,
            message: `${realmName}天劫开始，共${strikesTotal}道雷劫`
        };
    }

    /**
     * 获取天劫进度
     */
    getTribulationProgress() {
        const t = this.gameState.tribulation;
        if (!t || !t.active) {
            return { error: 'No active tribulation' };
        }
        
        const progress = ((t.strikesCurrent / t.strikesTotal) * 100).toFixed(1);
        const resistRate = t.strikesCurrent > 0 ? (t.resistedAccumulated / t.strikesCurrent * 100).toFixed(1) : '0.0';
        
        return {
            targetRealm: t.targetRealm,
            realmName: t.realmName,
            phase: t.phase,
            progress: `${t.strikesCurrent}/${t.strikesTotal}`,
            percentage: progress + '%',
            resistanceRate: resistRate + '%',
            damageAccumulated: t.damageAccumulated,
            resistedCount: t.resistedAccumulated
        };
    }

    /**
     * 获得祝福
     */
    receiveBlessing(type = 'random') {
        const types = Object.keys(BLESSING_TYPES);
        
        if (type === 'random') {
            type = types[Math.floor(Math.random() * types.length)];
        }
        
        if (!BLESSING_TYPES[type]) {
            return { error: 'Invalid blessing type' };
        }
        
        const blessingInfo = BLESSING_TYPES[type];
        
        // 检查是否已有相同类型祝福
        if (this.gameState.blessings && this.gameState.blessings.some(b => b.type === type)) {
            return { error: 'Already have this blessing type' };
        }
        
        this.gameState.blessings = this.gameState.blessings || [];
        this.gameState.blessings.push({
            type: type,
            name: blessingInfo.name,
            effect: blessingInfo.effect,
            timestamp: Date.now()
        });
        
        return {
            success: true,
            blessing: {
                type: type,
                name: blessingInfo.name,
                effect: blessingInfo.effect
            }
        };
    }

    /**
     * 获取祝福列表
     */
    getBlessings() {
        return {
            total: (this.gameState.blessings || []).length,
            blessings: this.gameState.blessings || []
        };
    }

    /**
     * 灵根进化
     */
    evolveSpiritRoot(rootType = 'all') {
        const gs = this.gameState;
        gs.spiritRoot = gs.spiritRoot || { type: 'wood', tier: 1 };
        
        const currentTier = gs.spiritRoot.tier || 1;
        if (currentTier >= 5) {
            return { error: 'Spirit root already at max tier' };
        }
        
        const cost = currentTier * 500;
        if ((gs.spiritStones || 0) < cost) {
            return { success: false, error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
        }
        
        gs.spiritStones -= cost;
        gs.spiritRoot.tier = currentTier + 1;
        
        const TIER_MAP = { 1: '凡品', 2: '良品', 3: '上品', 4: '极品', 5: '天品' };
        
        return {
            success: true,
            newTier: gs.spiritRoot.tier,
            tierName: TIER_MAP[gs.spiritRoot.tier],
            cost: cost
        };
    }

    /**
     * 查询灵根
     */
    querySpiritRoot(detail = false) {
        const gs = this.gameState;
        gs.spiritRoot = gs.spiritRoot || { type: 'wood', tier: 1 };
        
        const TIER_MAP = { 1: '凡品', 2: '良品', 3: '上品', 4: '极品', 5: '天品' };
        const tier = gs.spiritRoot.tier || 1;
        
        const result = {
            type: gs.spiritRoot.type,
            tier: tier,
            tierName: TIER_MAP[tier]
        };
        
        if (detail) {
            result.attributes = TIER_BONUSES[tier] || {};
            result.evolveCost = tier * 500;
            result.isMaxTier = tier >= 5;
        }
        
        return result;
    }

    /**
     * 修炼推进 (MCP接口)
     */
    advance(action) {
        switch (action) {
            case 'meditate':
                return this.meditate();
            case 'breakthrough':
                return this.breakthrough();
            case 'tribulation':
                return {
                    action: 'tribulation',
                    success: true,
                    message: 'Tribulation lightning struck'
                };
            default:
                return { error: `Unknown cultivation action: ${action}` };
        }
    }

    /**
     * 获取修炼状态摘要
     */
    getSummary() {
        const cultivation = this.getCultivationEntity();
        const spiritRoot = this.getSpiritRootEntity();
        
        return {
            cultivation: cultivation.getSummary(),
            spiritRoot: spiritRoot.getSummary(),
            tribulation: this.getTribulationProgress(),
            blessings: this.getBlessings()
        };
    }
}

export { CultivationService, TRIBULATIONS, BLESSING_TYPES };