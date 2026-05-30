/**
 * InvestmentModule - 投资模块导出 (V199/V207)
 * 整合投资和月卡相关实体和服务
 */
export { Investment, InvestmentProduct } from './entities/Investment.js';
export { MonthCard, MonthCardTier } from './entities/MonthCard.js';
export { InvestmentService, INVESTMENT_PRODUCTS } from './services/InvestmentService.js';
export { MonthCardService, MONTHCARD_CONFIG } from './services/MonthCardService.js';

/**
 * 创建投资服务的工厂函数
 * @param {Function} gameStateAccessor - 获取游戏状态的函数
 */
export function createInvestmentService(gameStateAccessor) {
    return new InvestmentService(gameStateAccessor);
}

/**
 * 创建月卡服务的工厂函数
 * @param {Function} gameStateAccessor - 获取游戏状态的函数
 */
export function createMonthCardService(gameStateAccessor) {
    return new MonthCardService(gameStateAccessor);
}