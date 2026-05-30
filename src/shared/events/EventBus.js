// 事件总线 - 领域间通信中枢
class EventBus {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistory = 100;
    }

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消订阅的函数
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    /**
     * 取消订阅
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
    }

    /**
     * 发布事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(cb => cb(data));
        this.eventHistory.push({ event, data, timestamp: Date.now() });
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }
    }

    /**
     * 获取历史事件
     * @param {string} event - 事件名称（可选）
     * @returns {Array} 历史事件列表
     */
    getHistory(event) {
        if (event) {
            return this.eventHistory.filter(e => e.event === event);
        }
        return [...this.eventHistory];
    }

    /**
     * 清空所有监听器
     */
    clear() {
        this.listeners.clear();
        this.eventHistory = [];
    }

    /**
     * 清空特定事件的所有监听器
     * @param {string} event - 事件名称
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

// 单例实例
export const eventBus = new EventBus();
export default EventBus;