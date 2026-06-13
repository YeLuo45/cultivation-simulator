/**
 * MailModule - 邮件模块导出 (V163)
 * 整合邮件和公告相关实体和服务
 */
export { Mail, SentMail } from './entities/Mail.js';
export { Announcement } from './entities/Announcement.js';
export { MailService } from './services/MailService.js';
export { AnnounceService } from './services/AnnounceService.js';

/**
 * 创建邮件服务的工厂函数
 * @param {Function} gameStateAccessor - 获取游戏状态的函数
 */
export function createMailService(gameStateAccessor) {
    return new MailService(gameStateAccessor);
}

/**
 * 创建公告服务的工厂函数
 * @param {Function} gameStateAccessor - 获取游戏状态的函数
 */
export function createAnnounceService(gameStateAccessor) {
    return new AnnounceService(gameStateAccessor);
}