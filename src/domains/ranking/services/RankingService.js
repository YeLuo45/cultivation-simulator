/**
 * RankingService - 排行榜服务 (V204)
 * 处理各种排行榜的查询和刷新
 */
import { Ranking, RankingType } from '../entities/Ranking.js';

export class RankingService {
    constructor(gameStateAccessor) {
        this.getGameState = gameStateAccessor;
    }

    /**
     * 初始化排行榜状态
     */
    _initRankingState() {
        const gs = this.getGameState();
        if (!gs.ranking) {
            gs.ranking = {
                rankings: {
                    power: [],
                    level: [],
                    spiritStone: [],
                    arena: [],
                    sect: []
                },
                lastRefresh: null,
                refreshCost: 100
            };
        }
        return gs.ranking;
    }

    /**
     * 获取排行榜列表
     * @param {string} type - 排行榜类型：power/level/spiritStone/arena/sect
     */
    list(type) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const ranking = this._initRankingState();
            const rankingTypes = ['power', 'level', 'spiritStone', 'arena', 'sect'];
            if (type && !rankingTypes.includes(type)) {
                return { error: '无效的排行榜类型: ' + type };
            }
            if (type) {
                const list = ranking.rankings[type] || [];
                return {
                    success: true,
                    type: type,
                    rankings: list.slice(0, 100),
                    message: type + '排行榜共' + list.length + '项'
                };
            }
            return {
                success: true,
                rankings: {
                    power: ranking.rankings.power.slice(0, 100),
                    level: ranking.rankings.level.slice(0, 100),
                    spiritStone: ranking.rankings.spiritStone.slice(0, 100),
                    arena: ranking.rankings.arena.slice(0, 100),
                    sect: ranking.rankings.sect.slice(0, 100)
                },
                message: '排行榜类型: power/level/spiritStone/arena/sect'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 查看排行详情
     * @param {string} type - 排行榜类型
     * @param {number} rank - 排名
     */
    detail(type, rank) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!type || rank === undefined) return { error: '请指定排行榜类型和排名' };
            const ranking = this._initRankingState();
            const rankingTypes = ['power', 'level', 'spiritStone', 'arena', 'sect'];
            if (!rankingTypes.includes(type)) {
                return { error: '无效的排行榜类型: ' + type };
            }
            const list = ranking.rankings[type] || [];
            if (rank < 1 || rank > list.length) {
                return { error: '排名无效: ' + rank };
            }
            const entry = list[rank - 1];
            return {
                success: true,
                type: type,
                rank: rank,
                player: entry,
                message: '第' + rank + '名: ' + (entry ? entry.name : '空位')
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 刷新排行数据
     */
    refresh() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const ranking = this._initRankingState();
            if ((gs.spiritStones || 0) < ranking.refreshCost) {
                return { error: '灵石不足，需要' + ranking.refreshCost + '灵石' };
            }
            gs.spiritStones -= ranking.refreshCost;
            const mockPlayers = [
                { id: 'player_1', name: '天玄子', power: 50000, level: 50, spiritStone: 100000, arena: 1, sect: '天玄宗' },
                { id: 'player_2', name: '紫霄真人', power: 45000, level: 48, spiritStone: 80000, arena: 2, sect: '紫霄宫' },
                { id: 'player_3', name: '青冥剑客', power: 40000, level: 45, spiritStone: 60000, arena: 3, sect: '青冥派' },
                { id: 'player_4', name: '火凤仙子', power: 35000, level: 43, spiritStone: 50000, arena: 4, sect: '火凤阁' },
                { id: 'player_5', name: '玄武真君', power: 30000, level: 40, spiritStone: 40000, arena: 5, sect: '玄武殿' },
                { id: 'player_6', name: '白虎战魂', power: 25000, level: 38, spiritStone: 30000, arena: 6, sect: '白虎帮' },
                { id: 'player_7', name: '朱雀神焰', power: 20000, level: 35, spiritStone: 20000, arena: 7, sect: '朱雀堂' },
                { id: 'player_8', name: '青龙守护', power: 15000, level: 32, spiritStone: 15000, arena: 8, sect: '青龙会' },
                { id: 'player_9', name: '麒麟血脉', power: 10000, level: 28, spiritStone: 10000, arena: 9, sect: '麒麟谷' },
                { id: 'player_10', name: '鲲鹏展翅', power: 8000, level: 25, spiritStone: 8000, arena: 10, sect: '鲲鹏庄' }
            ];
            const currentPlayer = {
                id: gs.playerId || 'player_current',
                name: gs.playerName || '测试修士',
                power: gs.combatPower || 5000,
                level: gs.level || 10,
                spiritStone: gs.spiritStones || 50000,
                arena: 0,
                sect: gs.sectName || '无'
            };
            ranking.rankings.power = [...mockPlayers, currentPlayer].sort((a, b) => b.power - a.power);
            ranking.rankings.level = [...mockPlayers, currentPlayer].sort((a, b) => b.level - a.level);
            ranking.rankings.spiritStone = [...mockPlayers, currentPlayer].sort((a, b) => b.spiritStone - a.spiritStone);
            ranking.rankings.arena = [...mockPlayers, currentPlayer].sort((a, b) => (a.arena || 999) - (b.arena || 999));
            ranking.rankings.sect = [...mockPlayers, currentPlayer].sort((a, b) => (a.sect || '').localeCompare(b.sect || ''));
            ranking.lastRefresh = new Date().toISOString();
            return {
                success: true,
                lastRefresh: ranking.lastRefresh,
                message: '排行榜刷新成功，消耗' + ranking.refreshCost + '灵石'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取玩家当前排名
     * @param {string} type - 排行榜类型
     */
    getPlayerRank(type) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const ranking = this._initRankingState();
            const list = ranking.rankings[type] || [];
            const playerId = gs.playerId || 'player_current';
            const index = list.findIndex(p => p.id === playerId);
            if (index === -1) return { success: true, rank: 0, message: '未上榜' };
            return { success: true, rank: index + 1, message: '当前排名: ' + (index + 1) };
        } catch (e) { return { error: e.message }; }
    }
}