/**
 * Welfare Entity - 福利实体 (V164)
 * 代表游戏中的各种福利
 */
export class Welfare {
    constructor({
        id,
        name,
        description,
        cost = 0,
        reward,
        claimed = false,
        claimable = false,
        requires = null,
        icon = 'gift'
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.reward = reward;
        this.claimed = claimed;
        this.claimable = claimable;
        this.requires = requires;
        this.icon = icon;
    }

    /**
     * 领取福利
     */
    claim() {
        if (this.claimed) return { success: false, error: '该福利已领取' };
        if (!this.claimable) return { success: false, error: '该福利暂不可领取' };
        this.claimed = true;
        return { success: true, reward: this.reward };
    }

    /**
     * 设置为可领取状态
     */
    setClaimable(claimable) {
        this.claimable = claimable;
        return this;
    }

    /**
     * 是否满足领取条件
     */
    meetsRequirement(playerState) {
        if (!this.requires) return true;
        const req = this.requires;
        switch (req) {
            case 'cultivation_advance':
                return playerState.realmProgress >= 1;
            case 'first_recharge':
                return playerState.hasRecharged;
            case 'vip_level_1':
                return playerState.vipLevel >= 1;
            case 'share':
                return playerState.hasShared;
            case 'invite_friend':
                return playerState.invitedFriends >= 1;
            default:
                return true;
        }
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            cost: this.cost,
            reward: this.reward,
            claimed: this.claimed,
            claimable: this.claimable,
            requires: this.requires
        };
    }

    static fromGameState(data) {
        return new Welfare({
            id: data.id,
            name: data.name,
            description: data.description,
            cost: data.cost || 0,
            reward: data.reward,
            claimed: data.claimed || false,
            claimable: data.claimable || false,
            requires: data.requires || null
        });
    }
}