/**
 * SigninModule - 签到模块导出 (V164)
 * 整合签到和福利相关实体和服务
 */
export { SigninRecord, SigninReward } from './entities/SigninRecord.js';
export { Welfare } from './entities/Welfare.js';
export { SigninService } from './services/SigninService.js';
export { WelfareService } from './services/WelfareService.js';

/**
 * 创建签到服务的工厂函数
 * @param {Function} gameStateAccessor - 获取游戏状态的函数
 */
export function createSigninService(gameStateAccessor) {
    return new SigninService(gameStateAccessor);
}

/**
 * 创建福利服务的工厂函数
 * @param {Function} gameStateAccessor - 获取游戏状态的函数
 */
export function createWelfareService(gameStateAccessor) {
    return new WelfareService(gameStateAccessor);
}