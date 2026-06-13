/**
 * SigninService - 签到服务 (V164)
 * 处理每日签到和连续签到奖励
 */
import { SigninRecord, SigninReward } from '../entities/SigninRecord.js';

export class SigninService {
    constructor(gameStateAccessor) {
        this.getGameState = gameStateAccessor;
    }

    /**
     * 初始化签到状态
     */
    _initSigninState() {
        const gs = this.getGameState();
        if (!gs.signinV3) {
            gs.signinV3 = {
                records: [],
                todaySigned: false,
                totalDays: 0,
                streakDays: 0,
                lastSignDate: null,
                makeupUsed: false,
                rewards: [
                    { day: 1, name: '第1天奖励', reward: '灵气x100', claimed: false },
                    { day: 2, name: '第2天奖励', reward: '灵石x50', claimed: false },
                    { day: 3, name: '第3天奖励', reward: '灵气x200', claimed: false },
                    { day: 4, name: '第4天奖励', reward: '灵石x100', claimed: false },
                    { day: 5, name: '第5天奖励', reward: '灵气x500', claimed: false },
                    { day: 6, name: '第6天奖励', reward: '灵石x200', claimed: false },
                    { day: 7, name: '第7天奖励', reward: '稀有丹药x1', claimed: false }
                ]
            };
        }
        return gs.signinV3;
    }

    /**
     * 获取签到列表
     */
    list() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const signinV3 = this._initSigninState();
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            const monthRecords = signinV3.records.filter(r => r.date >= firstDayOfMonth);
            const canMakeup = !signinV3.makeupUsed && signinV3.records.length > 0;
            return {
                success: true,
                todaySigned: signinV3.todaySigned,
                totalDays: signinV3.totalDays,
                streakDays: signinV3.streakDays,
                monthRecords: monthRecords,
                rewards: signinV3.rewards.map(r => ({ day: r.day, name: r.name, reward: r.reward, claimed: r.claimed })),
                canMakeup: canMakeup,
                message: '本月已签到' + monthRecords.length + '天，连续签到' + signinV3.streakDays + '天'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 执行签到
     */
    checkin() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const signinV3 = this._initSigninState();
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            if (signinV3.todaySigned) return { error: '今日已签到，请勿重复签到' };
            const yesterday = today - 86400000;
            const lastSignDate = signinV3.lastSignDate;
            if (lastSignDate === yesterday) {
                signinV3.streakDays++;
            } else if (lastSignDate !== today) {
                signinV3.streakDays = 1;
            }
            signinV3.records.push({ date: today, rewarded: false, makeup: false });
            signinV3.todaySigned = true;
            signinV3.totalDays++;
            signinV3.lastSignDate = today;
            const streakBonus = signinV3.streakDays > 1 ? '+' + (signinV3.streakDays - 1) * 10 + '%连续签到加成' : '';
            return {
                success: true,
                streakDays: signinV3.streakDays,
                totalDays: signinV3.totalDays,
                streakBonus: streakBonus,
                message: '签到成功！已连续签到' + signinV3.streakDays + '天' + (streakBonus ? '，' + streakBonus : '')
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 领取签到奖励
     * @param {number} day - 奖励天数(1-7)
     */
    reward(day) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!day || day < 1 || day > 7) return { error: '奖励天数必须为1-7' };
            const signinV3 = this._initSigninState();
            const reward = signinV3.rewards.find(r => r.day === day);
            if (!reward) return { error: '奖励不存在' };
            if (reward.claimed) return { error: '该奖励已领取' };
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            const monthSignins = signinV3.records.filter(r => r.date >= firstDayOfMonth && r.date <= today).length;
            if (monthSignins < day) return { error: '本月签到天数不足，无法领取第' + day + '天奖励' };
            reward.claimed = true;
            const record = signinV3.records.find(r => r.date === today || r.date >= firstDayOfMonth);
            if (record) record.rewarded = true;
            return {
                success: true,
                day: day,
                reward: reward.reward,
                message: '领取成功！获得' + reward.reward
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 补签
     */
    makeup() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const signinV3 = this._initSigninState();
            if (signinV3.makeupUsed) return { error: '今日已使用补签机会，请明天再来' };
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const yesterday = today - 86400000;
            const alreadySigned = signinV3.records.some(r => r.date === yesterday);
            if (alreadySigned) return { error: '昨天已签到，无需补签' };
            const cost = 50;
            if (gs.spiritStones < cost) return { error: '灵石不足，补签需要' + cost + '灵石' };
            gs.spiritStones -= cost;
            signinV3.records.push({ date: yesterday, rewarded: false, makeup: true });
            signinV3.makeupUsed = true;
            return {
                success: true,
                cost: cost,
                remainingSpiritStones: gs.spiritStones,
                message: '补签成功！消耗' + cost + '灵石'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 重置每日签到状态
     */
    resetDaily() {
        const signinV3 = this._initSigninState();
        signinV3.todaySigned = false;
        signinV3.makeupUsed = false;
        return this;
    }
}