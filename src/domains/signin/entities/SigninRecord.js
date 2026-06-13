/**
 * SigninRecord Entity - 签到记录实体 (V164)
 * 代表玩家的每日签到记录
 */
export class SigninRecord {
    constructor({
        date,
        rewarded = false,
        makeup = false,
        timestamp = Date.now()
    }) {
        this.date = date;
        this.rewarded = rewarded;
        this.makeup = makeup;
        this.timestamp = timestamp;
    }

    /**
     * 标记奖励已领取
     */
    markRewarded() {
        this.rewarded = true;
        return this;
    }

    /**
     * 是否为补签
     */
    isMakeup() {
        return this.makeup;
    }

    /**
     * 获取日期字符串
     */
    getDateString() {
        return new Date(this.date).toISOString().split('T')[0];
    }

    toJSON() {
        return {
            date: this.date,
            rewarded: this.rewarded,
            makeup: this.makeup,
            timestamp: this.timestamp
        };
    }

    static fromGameState(data) {
        return new SigninRecord({
            date: data.date,
            rewarded: data.rewarded || false,
            makeup: data.makeup || false,
            timestamp: data.timestamp || Date.now()
        });
    }
}

/**
 * SigninReward - 签到奖励配置
 */
export class SigninReward {
    constructor({ day, name, reward, claimed = false }) {
        this.day = day;
        this.name = name;
        this.reward = reward;
        this.claimed = claimed;
    }

    /**
     * 领取奖励
     */
    claim() {
        if (this.claimed) return false;
        this.claimed = true;
        return true;
    }

    toJSON() {
        return {
            day: this.day,
            name: this.name,
            reward: this.reward,
            claimed: this.claimed
        };
    }
}