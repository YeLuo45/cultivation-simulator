/**
 * Announcement Entity - 公告实体 (V163)
 * 代表游戏中的系统公告
 */
export class Announcement {
    constructor({
        id,
        title,
        content,
        timestamp,
        priority = 'medium',
        expiresAt = null,
        author = '系统'
    }) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.timestamp = timestamp || Date.now();
        this.priority = priority; // 'high', 'medium', 'low'
        this.expiresAt = expiresAt;
        this.author = author;
    }

    /**
     * 检查公告是否已过期
     */
    isExpired() {
        if (!this.expiresAt) return false;
        return Date.now() > this.expiresAt;
    }

    /**
     * 获取优先级权重
     */
    getPriorityWeight() {
        const weights = { high: 3, medium: 2, low: 1 };
        return weights[this.priority] || 2;
    }

    /**
     * 标记为已查看
     */
    markAsViewed(viewedList) {
        if (!viewedList.includes(this.id)) {
            viewedList.push(this.id);
        }
        return this;
    }

    /**
     * 是否已查看过
     */
    hasBeenViewed(viewedList) {
        return viewedList.includes(this.id);
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            timestamp: this.timestamp,
            priority: this.priority,
            expiresAt: this.expiresAt,
            author: this.author
        };
    }

    static fromGameState(data) {
        return new Announcement({
            id: data.id,
            title: data.title,
            content: data.content,
            timestamp: data.timestamp,
            priority: data.priority || 'medium',
            expiresAt: data.expiresAt,
            author: data.author || '系统'
        });
    }
}