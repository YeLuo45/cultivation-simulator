/**
 * AnnounceService - 公告服务 (V163)
 * 处理系统公告的查看和管理
 */
import { Announcement } from '../entities/Announcement.js';

export class AnnounceService {
    constructor(gameStateAccessor) {
        this.getGameState = gameStateAccessor;
    }

    /**
     * 初始化公告状态
     */
    _initAnnounceState() {
        const gs = this.getGameState();
        if (!gs.announceV3) {
            gs.announceV3 = {
                announcements: [
                    { id: 'ann_v3_001', title: '欢迎来到修仙世界v3', content: '各位修士，欢迎踏入修仙之路！邮件系统和公告系统已全面升级。', timestamp: Date.now() - 86400000, priority: 'high', expiresAt: null },
                    { id: 'ann_v3_002', title: '新版本更新公告', content: 'V163版本已更新，新增邮件系统v3和公告系统v3，详情请查看游戏内说明。', timestamp: Date.now() - 172800000, priority: 'medium', expiresAt: null },
                    { id: 'ann_v3_003', title: '限时活动开启', content: '灵石副本双倍掉落活动进行中，修士们请抓紧时间！', timestamp: Date.now() - 259200000, priority: 'high', expiresAt: Date.now() + 604800000 },
                    { id: 'ann_v3_004', title: '系统维护通知', content: '系统将于明日凌晨进行维护，请提前做好准备。', timestamp: Date.now() - 432000000, priority: 'low', expiresAt: Date.now() + 86400000 }
                ],
                viewed: []
            };
        }
        return gs.announceV3;
    }

    /**
     * 获取公告列表
     */
    list() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const announceV3 = this._initAnnounceState();
            const now = Date.now();
            const activeAnnouncements = announceV3.announcements.filter(a => !a.expiresAt || a.expiresAt > now);
            return {
                success: true,
                announcements: activeAnnouncements.map(a => ({
                    id: a.id,
                    title: a.title,
                    timestamp: a.timestamp,
                    priority: a.priority,
                    expiresAt: a.expiresAt
                })),
                total: activeAnnouncements.length,
                message: '共' + activeAnnouncements.length + '条公告'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 查看公告详情
     * @param {string} announceId - 公告ID
     */
    view(announceId) {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            if (!announceId) return { error: '请指定公告ID' };
            const announceV3 = this._initAnnounceState();
            const announcement = announceV3.announcements.find(a => a.id === announceId);
            if (!announcement) return { error: '公告不存在' };
            if (announcement.expiresAt && announcement.expiresAt <= Date.now()) return { error: '公告已过期' };
            if (!announceV3.viewed.includes(announceId)) {
                announceV3.viewed.push(announceId);
            }
            return {
                success: true,
                id: announcement.id,
                title: announcement.title,
                content: announcement.content,
                timestamp: announcement.timestamp,
                priority: announcement.priority,
                expiresAt: announcement.expiresAt,
                message: '公告读取成功'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取所有公告（包含已过期）
     */
    listAll() {
        try {
            const gs = this.getGameState();
            if (!gs) return { error: 'Game state not initialized' };
            const announceV3 = this._initAnnounceState();
            return {
                success: true,
                announcements: announceV3.announcements.map(a => ({
                    id: a.id,
                    title: a.title,
                    content: a.content,
                    timestamp: a.timestamp,
                    priority: a.priority,
                    expiresAt: a.expiresAt,
                    expired: a.expiresAt && a.expiresAt <= Date.now()
                })),
                total: announceV3.announcements.length,
                message: '共' + announceV3.announcements.length + '条公告'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 检查是否有未读的高优先级公告
     */
    hasUnreadHighPriority() {
        try {
            const announceV3 = this._initAnnounceState();
            return announceV3.announcements.some(a => {
                if (a.priority !== 'high') return false;
                if (a.expiresAt && a.expiresAt <= Date.now()) return false;
                return !announceV3.viewed.includes(a.id);
            });
        } catch (e) { return false; }
    }
}