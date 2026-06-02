/**
 * NotificationHub - 通知中枢核心
 *
 * 灵感来源:
 *   - nanobot-design MessageBus: 事件总线
 *   - claude-code-design Permission Control: 统一权限管控
 *
 * 核心职责:
 *   1. 统一事件入口 (publish/subscribe)
 *   2. 适配器注册管理 (registerChannel)
 *   3. 通知分发 (dispatch)
 *   4. 历史记录 (history)
 *   5. 失败重试 (retry)
 *
 * 数据结构:
 *   NotificationEvent = {
 *     id, type, priority, payload, source, timestamp, status, attempts, lastError
 *   }
 *
 * 设计要点:
 *   - 同步分发, 适配器内部可异步
 *   - 失败事件进入 retry 队列 (最多 3 次)
 *   - 历史最多保留 1000 条
 *   - 订阅者通过 subscribe(type, handler) 注册
 */

// ============ 常量 ============

export const NOTIFICATION_PRIORITY = {
  CRITICAL: 0,  // 系统错误/强制
  IMPORTANT: 1, // 任务/活动
  INFO: 2,      // 邮件/私信
  MARKETING: 3, // 推广/广告
};

export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETRYING: 'retrying',
  EXPIRED: 'expired',
};

export const MAX_HISTORY_SIZE = 1000;
export const MAX_RETRY_ATTEMPTS = 3;

// ============ 工具函数 ============

let _idCounter = 0;
function generateId() {
  _idCounter += 1;
  return `notif_${Date.now()}_${_idCounter}`;
}

function getTimestamp() {
  return Date.now();
}

// ============ NotificationHub 类 ============

export class NotificationHub {
  constructor() {
    // 适配器注册表: { [channelName]: ChannelAdapter }
    this._channels = new Map();
    // 订阅者: { [eventType]: Set<handler> }
    this._subscribers = new Map();
    // 通知历史
    this._history = [];
    // 重试队列
    this._retryQueue = [];
    // 统计
    this._stats = {
      published: 0,
      delivered: 0,
      failed: 0,
      retried: 0,
      filtered: 0,
    };
    // 配置
    this._config = {
      maxHistorySize: MAX_HISTORY_SIZE,
      maxRetryAttempts: MAX_RETRY_ATTEMPTS,
      enableHistory: true,
      enableRetry: true,
    };
  }

  // ---------- 适配器管理 ----------

  registerChannel(name, adapter) {
    if (!name || typeof name !== 'string') {
      throw new Error('Channel name must be a non-empty string');
    }
    if (!adapter || typeof adapter.send !== 'function') {
      throw new Error('Adapter must implement send(event) method');
    }
    this._channels.set(name, adapter);
  }

  unregisterChannel(name) {
    return this._channels.delete(name);
  }

  getChannel(name) {
    return this._channels.get(name);
  }

  listChannels() {
    return Array.from(this._channels.keys());
  }

  hasChannel(name) {
    return this._channels.has(name(name, this));
  }

  // ---------- 订阅 ----------

  subscribe(eventType, handler) {
    if (!eventType || typeof eventType !== 'string') {
      throw new Error('Event type must be a non-empty string');
    }
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    if (!this._subscribers.has(eventType)) {
      this._subscribers.set(eventType, new Set());
    }
    this._subscribers.get(eventType).add(handler);
  }

  unsubscribe(eventType, handler) {
    const set = this._subscribers.get(eventType);
    if (!set) return false;
    return set.delete(handler);
  }

  getSubscriberCount(eventType) {
    const set = this._subscribers.get(eventType);
    return set ? set.size : 0;
  }

  // ---------- 发布与分发 ----------

  publish(eventOrType, payload = null, options = {}) {
    let event;
    if (typeof eventOrType === 'string') {
      event = {
        id: generateId(),
        type: eventOrType,
        payload,
        priority: options.priority ?? NOTIFICATION_PRIORITY.INFO,
        source: options.source ?? 'system',
        channels: options.channels ?? null, // null 表示广播到所有
        filter: options.filter ?? null,    // (channel) => boolean
        timestamp: getTimestamp(),
        status: NOTIFICATION_STATUS.PENDING,
        attempts: 0,
        lastError: null,
      };
    } else {
      event = {
        id: eventOrType.id ?? generateId(),
        type: eventOrType.type,
        payload: eventOrType.payload ?? null,
        priority: eventOrType.priority ?? NOTIFICATION_PRIORITY.INFO,
        source: eventOrType.source ?? 'system',
        channels: eventOrType.channels ?? null,
        filter: eventOrType.filter ?? null,
        timestamp: eventOrType.timestamp ?? getTimestamp(),
        status: NOTIFICATION_STATUS.PENDING,
        attempts: 0,
        lastError: null,
      };
    }

    this._stats.published += 1;
    return this._dispatch(event);
  }

  _dispatch(event) {
    const targetChannels = this._resolveChannels(event);
    if (targetChannels.length === 0) {
      this._stats.filtered += 1;
      event.status = NOTIFICATION_STATUS.EXPIRED;
      this._recordHistory(event);
      return { event, delivered: [], failed: [] };
    }

    const delivered = [];
    const failed = [];

    for (const channelName of targetChannels) {
      const adapter = this._channels.get(channelName);
      if (!adapter) {
        failed.push({ channel: channelName, error: 'Channel not found' });
        continue;
      }
      try {
        const result = adapter.send(event);
        if (result && result.success === false) {
          failed.push({ channel: channelName, error: result.error || 'Unknown' });
          this._maybeRetry(event, channelName, result.error || 'Unknown');
        } else {
          delivered.push(channelName);
        }
      } catch (err) {
        failed.push({ channel: channelName, error: err.message || String(err) });
        this._maybeRetry(event, channelName, err.message || String(err));
      }
    }

    if (delivered.length > 0) {
      this._stats.delivered += 1;
      event.status = NOTIFICATION_STATUS.DELIVERED;
    } else {
      this._stats.failed += 1;
      event.status = NOTIFICATION_STATUS.FAILED;
    }

    this._recordHistory(event);
    this._notifySubscribers(event);

    return { event, delivered, failed };
  }

  _resolveChannels(event) {
    if (event.channels && Array.isArray(event.channels) && event.channels.length > 0) {
      const valid = event.channels.filter(c => this._channels.has(c));
      if (event.filter) {
        return valid.filter(c => event.filter(c));
      }
      return valid;
    }
    const all = this.listChannels();
    if (event.filter) {
      return all.filter(c => event.filter(c));
    }
    return all;
  }

  _maybeRetry(event, channelName, error) {
    if (!this._config.enableRetry) return;
    event.attempts += 1;
    if (event.attempts >= this._config.maxRetryAttempts) return;
    event.status = NOTIFICATION_STATUS.RETRYING;
    event.lastError = `[${channelName}] ${error}`;
    this._stats.retried += 1;
    this._retryQueue.push({ event, channelName });
  }

  processRetries() {
    if (this._retryQueue.length === 0) return [];
    const processed = [];
    const remaining = [];
    for (const item of this._retryQueue) {
      const adapter = this._channels.get(item.channelName);
      if (!adapter) {
        processed.push({ channel: item.channelName, success: false, error: 'Channel removed' });
        continue;
      }
      try {
        const result = adapter.send(item.event);
        if (result && result.success === false) {
          this._maybeRetry(item.event, item.channelName, result.error || 'Unknown');
          if (item.event.attempts < this._config.maxRetryAttempts) {
            remaining.push(item);
          } else {
            processed.push({ channel: item.channelName, success: false, error: result.error });
          }
        } else {
          item.event.status = NOTIFICATION_STATUS.DELIVERED;
          this._recordHistory(item.event);
          processed.push({ channel: item.channelName, success: true });
        }
      } catch (err) {
        this._maybeRetry(item.event, item.channelName, err.message);
        if (item.event.attempts < this._config.maxRetryAttempts) {
          remaining.push(item);
        } else {
          processed.push({ channel: item.channelName, success: false, error: err.message });
        }
      }
    }
    this._retryQueue = remaining;
    return processed;
  }

  // ---------- 历史 ----------

  _recordHistory(event) {
    if (!this._config.enableHistory) return;
    this._history.push(event);
    if (this._history.length > this._config.maxHistorySize) {
      this._history.shift();
    }
  }

  getHistory(filter = {}) {
    let result = [...this._history];
    if (filter.type) {
      result = result.filter(e => e.type === filter.type);
    }
    if (filter.priority !== undefined) {
      result = result.filter(e => e.priority === filter.priority);
    }
    if (filter.status) {
      result = result.filter(e => e.status === filter.status);
    }
    if (filter.source) {
      result = result.filter(e => e.source === filter.source);
    }
    if (filter.since) {
      result = result.filter(e => e.timestamp >= filter.since);
    }
    if (filter.limit && result.length > filter.limit) {
      result = result.slice(-filter.limit);
    }
    return result;
  }

  clearHistory() {
    this._history = [];
  }

  // ---------- 统计 ----------

  getStats() {
    return { ...this._stats };
  }

  resetStats() {
    this._stats = {
      published: 0,
      delivered: 0,
      failed: 0,
      retried: 0,
      filtered: 0,
    };
  }

  // ---------- 配置 ----------

  configure(updates) {
    this._config = { ...this._config, ...updates };
  }

  getConfig() {
    return { ...this._config };
  }

  // ---------- 订阅者通知 ----------

  _notifySubscribers(event) {
    const handlers = this._subscribers.get(event.type);
    if (!handlers) return;
    for (const h of handlers) {
      try {
        h(event);
      } catch (e) {
        // 静默: 订阅者错误不阻断
      }
    }
  }
}

// ============ 单例工厂 ============

let _instance = null;
export function getNotificationHub() {
  if (!_instance) {
    _instance = new NotificationHub();
  }
  return _instance;
}

export function resetNotificationHub() {
  _instance = null;
}

// ============ 浏览器导出 ============

if (typeof window !== 'undefined') {
  window.NotificationHub = NotificationHub;
  window.getNotificationHub = getNotificationHub;
  window.NOTIFICATION_PRIORITY = NOTIFICATION_PRIORITY;
  window.NOTIFICATION_STATUS = NOTIFICATION_STATUS;
}
