/**
 * Ranking Entity - 排行榜实体 (V204)
 * 代表排行榜中的玩家条目
 */
export class Ranking {
    constructor({
        id,
        name,
        power = 0,
        level = 1,
        spiritStone = 0,
        arena = 999,
        sect = '',
        realm = '炼气',
        timestamp = Date.now()
    }) {
        this.id = id;
        this.name = name;
        this.power = power;
        this.level = level;
        this.spiritStone = spiritStone;
        this.arena = arena;
        this.sect = sect;
        this.realm = realm;
        this.timestamp = timestamp;
    }

    /**
     * 获取战斗力评分
     */
    getPowerScore() {
        return this.power;
    }

    /**
     * 是否在竞技场排名中
     */
    hasArenaRank() {
        return this.arena && this.arena < 999;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            power: this.power,
            level: this.level,
            spiritStone: this.spiritStone,
            arena: this.arena,
            sect: this.sect,
            realm: this.realm,
            timestamp: this.timestamp
        };
    }

    static fromGameState(data) {
        return new Ranking({
            id: data.id,
            name: data.name,
            power: data.power || 0,
            level: data.level || 1,
            spiritStone: data.spiritStone || 0,
            arena: data.arena || 999,
            sect: data.sect || '',
            realm: data.realm || '炼气'
        });
    }
}

/**
 * RankingType - 排行榜类型枚举
 */
export const RankingType = {
    POWER: 'power',
    LEVEL: 'level',
    SPIRIT_STONE: 'spiritStone',
    ARENA: 'arena',
    SECT: 'sect'
};

/**
 * RankingReward - 排行榜奖励配置
 */
export class RankingReward {
    constructor({ minRank, maxRank, type, amount }) {
        this.minRank = minRank;
        this.maxRank = maxRank;
        this.type = type;
        this.amount = amount;
    }

    /**
     * 检查排名是否在奖励范围内
     */
    isRankInRange(rank) {
        return rank >= this.minRank && rank <= this.maxRank;
    }

    /**
     * 获取奖励类型名称
     */
    getTypeName() {
        const names = {
            legendary: '传说',
            epic: '史诗',
            rare: '稀有',
            common: '普通'
        };
        return names[this.type] || this.type;
    }
}