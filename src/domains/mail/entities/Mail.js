/**
 * Mail Entity - 邮件实体 (V163)
 * 代表游戏中的邮件对象
 */
export class Mail {
    constructor({
        id,
        from,
        fromId,
        to,
        toId,
        title,
        content,
        timestamp,
        read = false,
        hasAttachment = false,
        attachments = []
    }) {
        this.id = id;
        this.from = from;
        this.fromId = fromId;
        this.to = to;
        this.toId = toId;
        this.title = title;
        this.content = content;
        this.timestamp = timestamp || Date.now();
        this.read = read;
        this.hasAttachment = hasAttachment;
        this.attachments = attachments;
    }

    /**
     * 标记邮件为已读
     */
    markAsRead() {
        this.read = true;
        return this;
    }

    /**
     * 检查邮件是否过期
     * @param {number} expireDays - 过期天数
     */
    isExpired(expireDays = 30) {
        const expireTime = expireDays * 24 * 60 * 60 * 1000;
        return Date.now() - this.timestamp > expireTime;
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            from: this.from,
            fromId: this.fromId,
            to: this.to,
            toId: this.toId,
            title: this.title,
            content: this.content,
            timestamp: this.timestamp,
            read: this.read,
            hasAttachment: this.hasAttachment,
            attachments: this.attachments
        };
    }

    /**
     * 从游戏状态数据创建Mail实例
     * @param {Object} data - 游戏状态中的邮件数据
     */
    static fromGameState(data) {
        return new Mail({
            id: data.id,
            from: data.from,
            fromId: data.fromId,
            to: data.to,
            toId: data.toId,
            title: data.title,
            content: data.content,
            timestamp: data.timestamp,
            read: data.read || false,
            hasAttachment: data.hasAttachment || false,
            attachments: data.attachments || []
        });
    }
}

/**
 * SentMail - 已发送邮件实体
 */
export class SentMail {
    constructor({
        id,
        to,
        toId,
        title,
        content,
        timestamp,
        cost = 10
    }) {
        this.id = id;
        this.to = to;
        this.toId = toId;
        this.title = title;
        this.content = content;
        this.timestamp = timestamp || Date.now();
        this.cost = cost;
    }

    toJSON() {
        return {
            id: this.id,
            to: this.to,
            toId: this.toId,
            title: this.title,
            content: this.content,
            timestamp: this.timestamp,
            cost: this.cost
        };
    }

    static fromGameState(data) {
        return new SentMail({
            id: data.id,
            to: data.to,
            toId: data.toId,
            title: data.title,
            content: data.content,
            timestamp: data.timestamp,
            cost: data.cost || 10
        });
    }
}