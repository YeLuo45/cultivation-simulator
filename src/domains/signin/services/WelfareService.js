/**
 * WelfareService - 福利服务 (V164)
 * 处理游戏中各种福利的领取
 */
import { Welfare } from '../entities/Welfare.js';

export class WelfareService {
    constructor(gameStateAccessor) {
        this.getGameState = gameStateAccessor;
    }

    /**
     * 初始化福利状态
     */
    _initWelfareState() {
        const gs = this.getGameState();
        if (!gs.welfareV3) {
            gs.welfareV3 = {
                welfares: [
                    { id: 'welfare_daily_login', name: '每日登录礼包', description: '每日登录游戏即可领取', cost: 0, reward: '灵石x20', claimed: false, claimable: true },
                    { id: 'welfare_level_up', name: '升级礼包', description: '每次境界突破可领取', cost: 0, reward: '灵气x100', claimed: false, claimable: false, requires: 'cultivation_advance' },
                    { id: 'welfare_first_charge', name: '首充礼包', description: '首次充值任意金额', cost: 0, reward: '限定外观x1', claimed: false, claimable: false, requires: 'first_recharge' },
                    { id: 'welfare_vip_daily', name: 'VIP每日礼包', description: 'VIP用户每日可领', cost: 0, reward: '灵石x50', claimed: false, claimable: false, requires: 'vip_level_1' },
                    { id: 'welfare_share', name: '分享礼包', description: '分享游戏给好友', cost: 0, reward: '灵石x30', claimed: false, claimable: true, requires: 'share' },
                    { id: 'welfare_invite', name: '邀请礼包', description: '成功邀请1位好友', cost: 0, reward: '灵气x500', claimed: false, claimable: false, requires: 'invite_friend' }
                ]
            };
        }
        return gs.welfareV3;
    }

    /**
     * 获取福利列表
     */
    list() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const welfareV3 = this._initWelfareState();
            const claimable = welfareV3.welfares.filter(w => {
                if (w.claimed) return false;
                if (!w.claimable) return false;
                return true;
            });
            return {
                success: true,
                welfares: welfareV3.welfares.map(w => ({
                    id: w.id,
                    name: w.name,
                    description: w.description,
                    cost: w.cost,
                    reward: w.reward,
                    claimed: w.claimed,
                    claimable: w.claimable
                })),
                claimableCount: claimable.length,
                message: '共有' + welfareV3.welfares.length + '项福利，其中' + claimable.length + '项可领取'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 领取福利
     * @param {string} welfareId - 福利ID
     */
    claim(welfareId) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!welfareId) return { error: '请指定福利ID' };
            const welfareV3 = this._initWelfareState();
            const welfare = welfareV3.welfares.find(w => w.id === welfareId);
            if (!welfare) return { error: '福利不存在' };
            if (welfare.claimed) return { error: '该福利已领取' };
            if (!welfare.claimable) return { error: '该福利暂不可领取，请满足条件后再试' };
            welfare.claimed = true;
            return {
                success: true,
                welfareId: welfareId,
                reward: welfare.reward,
                message: '领取成功！获得' + welfare.reward
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 更新福利可领取状态
     * @param {string} welfareId - 福利ID
     * @param {boolean} claimable - 是否可领取
     */
    updateClaimable(welfareId, claimable) {
        const welfareV3 = this._initWelfareState();
        const welfare = welfareV3.welfares.find(w => w.id === welfareId);
        if (welfare) {
            welfare.claimable = claimable;
        }
        return this;
    }

    /**
     * 重置每日福利状态
     */
    resetDaily() {
        const welfareV3 = this._initWelfareState();
        welfareV3.welfares.forEach(w => {
            if (w.requires === 'daily') {
                w.claimed = false;
                w.claimable = true;
            }
        });
        return this;
    }
}