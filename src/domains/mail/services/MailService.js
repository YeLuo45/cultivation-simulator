/**
 * MailService - 邮件服务 (V163)
 * 处理邮件的发送、接收、读取和管理
 */
import { Mail, SentMail } from '../entities/Mail.js';
import { Announcement } from '../entities/Announcement.js';

export class MailService {
    constructor(gameStateAccessor) {
        this.getGameState = gameStateAccessor;
    }

    /**
     * 初始化邮件状态
     */
    _initMailState() {
        const gs = this.getGameState();
        if (!gs.mailV3) {
            gs.mailV3 = {
                inbox: [
                    { id: 'mail_v3_001', from: '系统', fromId: 'system', title: '欢迎使用邮件系统v3', content: '邮件系统v3已启用，您可以发送和接收邮件了。', timestamp: Date.now() - 86400000, read: false, hasAttachment: false },
                    { id: 'mail_v3_002', from: '掌门', fromId: 'elder_001', title: '门派任务通知', content: '门派有新任务发布，请及时查看。', timestamp: Date.now() - 172800000, read: false, hasAttachment: true }
                ],
                sent: [
                    { id: 'mail_sent_v3_001', to: '道友', toId: 'fellow_001', title: '切磋邀请', content: '近日修为有所精进，想与道友切磋一番。', timestamp: Date.now() - 3600000, cost: 10 }
                ],
                nextId: 3
            };
        }
        return gs.mailV3;
    }

    /**
     * 获取邮件列表
     */
    list() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const mailV3 = this._initMailState();
            const inbox = mailV3.inbox.map(m => ({
                id: m.id,
                from: m.from,
                fromId: m.fromId,
                title: m.title,
                timestamp: m.timestamp,
                read: m.read,
                hasAttachment: m.hasAttachment
            }));
            return {
                success: true,
                inbox: inbox,
                sentCount: mailV3.sent.length,
                unreadCount: inbox.filter(m => !m.read).length,
                message: '收件箱共' + inbox.length + '封邮件，' + (inbox.length - inbox.filter(m => !m.read).length) + '封已读'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 发送邮件
     * @param {string} to - 收件人ID
     * @param {string} title - 标题
     * @param {string} content - 内容
     */
    send(to, title, content) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!to || !title || !content) return { error: '请提供收件人ID、标题和内容' };
            const cost = 10;
            if (gs.spiritStones < cost) return { error: '灵石不足，发送邮件需要' + cost + '灵石' };
            gs.spiritStones -= cost;
            const mailV3 = this._initMailState();
            const newMail = {
                id: 'mail_sent_v3_' + mailV3.nextId++,
                to: to,
                toId: to,
                title: title,
                content: content,
                timestamp: Date.now(),
                cost: cost
            };
            mailV3.sent.push(newMail);
            return {
                success: true,
                mailId: newMail.id,
                cost: cost,
                remainingSpiritStones: gs.spiritStones,
                message: '邮件发送成功，消耗' + cost + '灵石'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 读取邮件内容
     * @param {string} mailId - 邮件ID
     */
    read(mailId) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!mailId) return { error: '请指定邮件ID' };
            const mailV3 = this._initMailState();
            const mail = mailV3.inbox.find(m => m.id === mailId);
            if (!mail) return { error: '邮件不存在' };
            mail.read = true;
            return {
                success: true,
                id: mail.id,
                from: mail.from,
                fromId: mail.fromId,
                title: mail.title,
                content: mail.content,
                timestamp: mail.timestamp,
                hasAttachment: mail.hasAttachment,
                message: '邮件读取成功'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 删除邮件
     * @param {string} mailId - 邮件ID
     */
    delete(mailId) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!mailId) return { error: '请指定邮件ID' };
            const mailV3 = this._initMailState();
            const idx = mailV3.inbox.findIndex(m => m.id === mailId);
            if (idx === -1) return { error: '邮件不存在' };
            mailV3.inbox.splice(idx, 1);
            return {
                success: true,
                message: '邮件删除成功'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取已发送邮件列表
     */
    listSent() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const mailV3 = this._initMailState();
            return {
                success: true,
                sent: mailV3.sent.map(m => ({
                    id: m.id,
                    to: m.to,
                    toId: m.toId,
                    title: m.title,
                    timestamp: m.timestamp,
                    cost: m.cost
                })),
                message: '已发送' + mailV3.sent.length + '封邮件'
            };
        } catch (e) { return { error: e.message }; }
    }
}