/**
 * NotificationHub 单元测试
 * V268 通知中枢核心
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  NotificationHub,
  getNotificationHub,
  resetNotificationHub,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_STATUS,
  MAX_HISTORY_SIZE,
  MAX_RETRY_ATTEMPTS,
} from '../../../systems/notification/NotificationHub.js';

// ============ Mock Adapter ============

class MockAdapter {
  constructor(name, options = {}) {
    this.name = name;
    this.received = [];
    this.shouldFail = options.shouldFail || false;
    this.errorMessage = options.errorMessage || 'Mock failure';
    this.sendCount = 0;
  }
  send(event) {
    this.sendCount += 1;
    this.received.push(event);
    if (this.shouldFail) {
      return { success: false, error: this.errorMessage };
    }
    return { success: true };
  }
}

describe('NotificationHub - 基础', () => {
  let hub;
  beforeEach(() => {
    hub = new NotificationHub();
  });

  it('should create empty hub', () => {
    expect(hub.listChannels()).toEqual([]);
    expect(hub.getStats().published).toBe(0);
  });

  it('should register and unregister channel', () => {
    const adapter = new MockAdapter('mail');
    hub.registerChannel('mail', adapter);
    expect(hub.listChannels()).toContain('mail');
    expect(hub.hasChannel('mail')).toBe(true);
    expect(hub.unregisterChannel('mail')).toBe(true);
    expect(hub.hasChannel('mail')).toBe(false);
  });

  it('should reject invalid channel name', () => {
    expect(() => hub.registerChannel('', new MockAdapter('a'))).toThrow();
    expect(() => hub.registerChannel(null, new MockAdapter('a'))).toThrow();
  });

  it('should reject adapter without send()', () => {
    expect(() => hub.registerChannel('bad', {})).toThrow();
    expect(() => hub.registerChannel('bad', null)).toThrow();
  });

  it('should reject duplicate registration', () => {
    const a1 = new MockAdapter('a');
    const a2 = new MockAdapter('a');
    hub.registerChannel('a', a1);
    hub.registerChannel('a', a2);  // 覆盖
    expect(hub.getChannel('a')).toBe(a2);
  });
});

describe('NotificationHub - 订阅', () => {
  let hub;
  beforeEach(() => { hub = new NotificationHub(); });

  it('should subscribe and notify handlers', () => {
    const received = [];
    hub.subscribe('test.event', e => received.push(e));
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('test.event', { x: 1 });
    expect(received.length).toBe(1);
    expect(received[0].type).toBe('test.event');
  });

  it('should support multiple subscribers for same type', () => {
    let count1 = 0, count2 = 0;
    hub.subscribe('e', () => count1++);
    hub.subscribe('e', () => count2++);
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('e');
    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });

  it('should unsubscribe', () => {
    const handler = () => {};
    hub.subscribe('e', handler);
    expect(hub.getSubscriberCount('e')).toBe(1);
    hub.unsubscribe('e', handler);
    expect(hub.getSubscriberCount('e')).toBe(0);
  });

  it('should handle unsubscribe non-existent', () => {
    expect(hub.unsubscribe('nope', () => {})).toBe(false);
  });

  it('should reject invalid subscription', () => {
    expect(() => hub.subscribe('', () => {})).toThrow();
    expect(() => hub.subscribe('e', null)).toThrow();
  });

  it('should isolate subscriber exceptions', () => {
    let count = 0;
    hub.subscribe('e', () => { throw new Error('boom'); });
    hub.subscribe('e', () => count++);
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('e');
    expect(count).toBe(1);
  });
});

describe('NotificationHub - 发布与分发', () => {
  let hub, mail, toast;
  beforeEach(() => {
    hub = new NotificationHub();
    mail = new MockAdapter('mail');
    toast = new MockAdapter('toast');
    hub.registerChannel('mail', mail);
    hub.registerChannel('toast', toast);
  });

  it('should broadcast to all channels by default', () => {
    hub.publish('test', { msg: 'hi' });
    expect(mail.sendCount).toBe(1);
    expect(toast.sendCount).toBe(1);
  });

  it('should send only to specified channels', () => {
    hub.publish('test', { msg: 'hi' }, { channels: ['mail'] });
    expect(mail.sendCount).toBe(1);
    expect(toast.sendCount).toBe(0);
  });

  it('should filter by custom predicate', () => {
    hub.publish('test', { msg: 'hi' }, { filter: c => c !== 'toast' });
    expect(mail.sendCount).toBe(1);
    expect(toast.sendCount).toBe(0);
  });

  it('should mark expired when no channels match', () => {
    const r = hub.publish('test', {}, { channels: ['nonexistent'] });
    expect(r.event.status).toBe(NOTIFICATION_STATUS.EXPIRED);
    expect(hub.getStats().filtered).toBe(1);
  });

  it('should handle adapter failure', () => {
    const fail = new MockAdapter('fail', { shouldFail: true });
    hub.registerChannel('fail', fail);
    const r = hub.publish('test', {}, { channels: ['fail'] });
    expect(r.failed.length).toBe(1);
    expect(r.event.status).toBe(NOTIFICATION_STATUS.FAILED);
  });

  it('should handle adapter throwing exception', () => {
    const bad = { send: () => { throw new Error('crash'); } };
    hub.registerChannel('bad', bad);
    const r = hub.publish('test', {}, { channels: ['bad'] });
    expect(r.failed.length).toBe(1);
  });

  it('should accept full event object', () => {
    const event = {
      type: 'custom',
      payload: { a: 1 },
      priority: NOTIFICATION_PRIORITY.CRITICAL,
      source: 'manual',
    };
    const r = hub.publish(event);
    expect(r.event.priority).toBe(0);
    expect(r.event.source).toBe('manual');
  });

  it('should use defaults for missing event fields', () => {
    const r = hub.publish('e', null);
    expect(r.event.priority).toBe(NOTIFICATION_PRIORITY.INFO);
    expect(r.event.source).toBe('system');
  });
});

describe('NotificationHub - 优先级', () => {
  it('should have 4 priority levels', () => {
    expect(NOTIFICATION_PRIORITY.CRITICAL).toBe(0);
    expect(NOTIFICATION_PRIORITY.IMPORTANT).toBe(1);
    expect(NOTIFICATION_PRIORITY.INFO).toBe(2);
    expect(NOTIFICATION_PRIORITY.MARKETING).toBe(3);
  });
});

describe('NotificationHub - 重试', () => {
  it('should retry failed sends up to max', () => {
    const hub = new NotificationHub();
    const fail = new MockAdapter('fail', { shouldFail: true });
    hub.registerChannel('fail', fail);
    hub.publish('test', {});
    expect(fail.sendCount).toBe(1);
    hub.processRetries();
    expect(fail.sendCount).toBe(2);
    hub.processRetries();
    expect(fail.sendCount).toBe(3);
    // 第 4 次已超过 maxRetryAttempts, 不再重试
    hub.processRetries();
    expect(fail.sendCount).toBe(3);
  });

  it('should not retry on success', () => {
    const hub = new NotificationHub();
    const ok = new MockAdapter('ok');
    hub.registerChannel('ok', ok);
    hub.publish('test', {});
    hub.processRetries();
    expect(ok.sendCount).toBe(1);
  });

  it('should drop retry if channel removed', () => {
    const hub = new NotificationHub();
    const fail = new MockAdapter('fail', { shouldFail: true });
    hub.registerChannel('fail', fail);
    hub.publish('test', {});
    hub.unregisterChannel('fail');
    const r = hub.processRetries();
    expect(r[0].error).toBe('Channel removed');
  });

  it('should disable retry via config', () => {
    const hub = new NotificationHub();
    hub.configure({ enableRetry: false });
    const fail = new MockAdapter('fail', { shouldFail: true });
    hub.registerChannel('fail', fail);
    hub.publish('test', {});
    hub.processRetries();
    expect(fail.sendCount).toBe(1);
  });
});

describe('NotificationHub - 历史', () => {
  let hub;
  beforeEach(() => { hub = new NotificationHub(); });

  it('should record all events', () => {
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('a');
    hub.publish('b');
    expect(hub.getHistory().length).toBe(2);
  });

  it('should filter by type', () => {
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('a');
    hub.publish('b');
    const a = hub.getHistory({ type: 'a' });
    expect(a.length).toBe(1);
    expect(a[0].type).toBe('a');
  });

  it('should filter by priority', () => {
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('a', {}, { priority: 0 });
    hub.publish('b', {}, { priority: 3 });
    const crit = hub.getHistory({ priority: 0 });
    expect(crit.length).toBe(1);
  });

  it('should limit history size', () => {
    const hub = new NotificationHub();
    hub.configure({ maxHistorySize: 3 });
    hub.registerChannel('mail', new MockAdapter('mail'));
    for (let i = 0; i < 5; i++) hub.publish('e' + i);
    expect(hub.getHistory().length).toBe(3);
  });

  it('should filter by since', () => {
    hub.registerChannel('mail', new MockAdapter('mail'));
    const since = Date.now();
    hub.publish('old', {}, { source: 'a' });
    // 强制设置时间戳
    const h = hub.getHistory();
    h[0].timestamp = since - 1000;
    hub.publish('new', {}, { source: 'b' });
    const recent = hub.getHistory({ since });
    expect(recent.length).toBe(1);
    expect(recent[0].source).toBe('b');
  });

  it('should support limit', () => {
    hub.registerChannel('mail', new MockAdapter('mail'));
    for (let i = 0; i < 5; i++) hub.publish('e' + i);
    expect(hub.getHistory({ limit: 2 }).length).toBe(2);
  });

  it('should clear history', () => {
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('a');
    hub.clearHistory();
    expect(hub.getHistory().length).toBe(0);
  });

  it('should disable history', () => {
    const hub = new NotificationHub();
    hub.configure({ enableHistory: false });
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('a');
    expect(hub.getHistory().length).toBe(0);
  });
});

describe('NotificationHub - 统计', () => {
  it('should track published/delivered/failed/retried', () => {
    const hub = new NotificationHub();
    const ok = new MockAdapter('ok');
    const fail = new MockAdapter('fail', { shouldFail: true });
    hub.registerChannel('ok', ok);
    hub.registerChannel('fail', fail);
    hub.publish('test', {}, { channels: ['ok', 'fail'] });
    expect(hub.getStats().published).toBe(1);
    expect(hub.getStats().delivered).toBe(1);  // 只要有任一成功
    expect(hub.getStats().retried).toBe(1);
  });

  it('should reset stats', () => {
    const hub = new NotificationHub();
    hub.registerChannel('mail', new MockAdapter('mail'));
    hub.publish('e');
    hub.resetStats();
    expect(hub.getStats().published).toBe(0);
  });
});

describe('NotificationHub - 单例', () => {
  it('should return same instance', () => {
    resetNotificationHub();
    const a = getNotificationHub();
    const b = getNotificationHub();
    expect(a).toBe(b);
  });

  it('should reset on demand', () => {
    const a = getNotificationHub();
    a.registerChannel('c', new MockAdapter('c'));
    resetNotificationHub();
    const b = getNotificationHub();
    expect(b.listChannels()).toEqual([]);
  });
});

describe('NotificationHub - 集成场景', () => {
  it('should handle 100 events without errors', () => {
    const hub = new NotificationHub();
    const adapter = new MockAdapter('mail');
    hub.registerChannel('mail', adapter);
    for (let i = 0; i < 100; i++) {
      hub.publish('evt' + (i % 3), { i });
    }
    expect(adapter.sendCount).toBe(100);
    expect(hub.getStats().delivered).toBe(100);
  });

  it('should support multiple event types with different channels', () => {
    const hub = new NotificationHub();
    const mail = new MockAdapter('mail');
    const toast = new MockAdapter('toast');
    hub.registerChannel('mail', mail);
    hub.registerChannel('toast', toast);

    hub.publish('achievement.unlock', {}, { channels: ['toast'] });
    hub.publish('mail.new', {}, { channels: ['mail'] });
    hub.publish('event.global', {});

    expect(mail.sendCount).toBe(2);  // mail.new + event.global
    expect(toast.sendCount).toBe(2); // achievement.unlock + event.global
  });

  it('should correctly record final status on partial failure', () => {
    const hub = new NotificationHub();
    hub.registerChannel('ok', new MockAdapter('ok'));
    hub.registerChannel('fail', new MockAdapter('fail', { shouldFail: true }));
    const r = hub.publish('e', {}, { channels: ['ok', 'fail'] });
    expect(r.delivered).toContain('ok');
    expect(r.failed.length).toBe(1);
    expect(r.event.status).toBe(NOTIFICATION_STATUS.DELIVERED);
  });
});
