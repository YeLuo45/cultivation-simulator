/**
 * RankingModule - 排行榜模块导出 (V204)
 * 整合排行榜和竞技场相关实体和服务
 */
export { Ranking, RankingType, RankingReward } from './entities/Ranking.js';
export { Arena, ArenaChallenge, ArenaRewardTier } from './entities/Arena.js';
export { RankingService } from './services/RankingService.js';
export { ArenaService } from './services/ArenaService.js';

/**
 * 创建排行榜服务的工厂函数
 * @param {Function} gameStateAccessor - 获取游戏状态的函数
 */
export function createRankingService(gameStateAccessor) {
    return new RankingService(gameStateAccessor);
}

/**
 * 创建竞技场服务的工厂函数
 * @param {Function} gameStateAccessor - 获取游戏状态的函数
 */
export function createArenaService(gameStateAccessor) {
    return new ArenaService(gameStateAccessor);
}