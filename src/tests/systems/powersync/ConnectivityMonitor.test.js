/**
 * ConnectivityMonitor.test.js - 网络连接监控测试
 * V1172 Round 44 Iter 15/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    ConnectivityMonitor,
    CONNECTIVITY_STATES,
    LINK_QUALITY,
} from '../../../systems/powersync/ConnectivityMonitor.js';

describe('ConnectivityMonitor', () => {
    let m;
    beforeEach(() => { m = new ConnectivityMonitor({ latencyWindow: 5, offlineTimeoutMs: 1000 }); });

    describe('exports', () => {
        it('should export CONNECTIVITY_STATES', () => {
            expect(CONNECTIVITY_STATES).toContain('online');
            expect(CONNECTIVITY_STATES).toContain('offline');
        });
        it('should export LINK_QUALITY', () => {
            expect(LINK_QUALITY).toContain('excellent');
            expect(LINK_QUALITY).toContain('poor');
        });
    });

    describe('constructor', () => {
        it('should start online', () => {
            expect(m.getState()).toBe('online');
        });
        it('should accept config', () => {
            const x = new ConnectivityMonitor({ latencyWindow: 20, offlineTimeoutMs: 100 });
            expect(x.config.latencyWindow).toBe(20);
        });
    });

    describe('setOnline', () => {
        it('should set to online', () => {
            m.setOnline(false);
            m.setOnline(true);
            expect(m.isOnline()).toBe(true);
        });
        it('should set to offline', () => {
            m.setOnline(false);
            expect(m.isOffline()).toBe(true);
        });
        it('should return false when no change', () => {
            expect(m.setOnline(true)).toBe(false);
        });
        it('should return true on change', () => {
            expect(m.setOnline(false)).toBe(true);
        });
        it('should increment transitions', () => {
            m.setOnline(false);
            m.setOnline(true);
            expect(m.stats.transitions).toBe(2);
        });
        it('should record history', () => {
            m.setOnline(false);
            expect(m.listHistory().length).toBe(1);
            expect(m.listHistory()[0].state).toBe('offline');
        });
    });

    describe('isOnline / isOffline', () => {
        it('isOnline true initially', () => {
            expect(m.isOnline()).toBe(true);
            expect(m.isOffline()).toBe(false);
        });
        it('isOffline true after setOnline(false)', () => {
            m.setOnline(false);
            expect(m.isOnline()).toBe(false);
            expect(m.isOffline()).toBe(true);
        });
    });

    describe('lastSeen', () => {
        it('should set on construction', () => {
            expect(m.getLastSeen()).toBeGreaterThan(0);
        });
        it('should update on recordLatency', () => {
            const t = Date.now() + 1000;
            m.recordLatency(10, t);
            expect(m.getLastSeen()).toBe(t);
        });
        it('should update on setOnline(true)', () => {
            m.setOnline(false);
            const t = Date.now() + 1000;
            m.setOnline(true, t);
            expect(m.getLastSeen()).toBe(t);
        });
        it('getTimeSinceLastSeen', () => {
            const t = Date.now() + 5000;
            m.recordLatency(10, t);
            expect(m.getTimeSinceLastSeen(t + 100)).toBe(100);
        });
    });

    describe('recordLatency', () => {
        it('should record valid latency', () => {
            expect(m.recordLatency(100)).toBe(true);
            expect(m.sampleCount()).toBe(1);
        });
        it('should reject negative', () => {
            expect(m.recordLatency(-1)).toBe(false);
        });
        it('should reject non-number', () => {
            expect(m.recordLatency('fast')).toBe(false);
        });
        it('should trim to window size', () => {
            for (let i = 0; i < 10; i++) m.recordLatency(i);
            expect(m.sampleCount()).toBe(5); // window=5
        });
        it('should increment samples stat', () => {
            m.recordLatency(10);
            m.recordLatency(20);
            expect(m.stats.samples).toBe(2);
        });
    });

    describe('latency stats', () => {
        it('getAvgLatency empty returns 0', () => {
            expect(m.getAvgLatency()).toBe(0);
        });
        it('getAvgLatency correct', () => {
            m.recordLatency(10);
            m.recordLatency(20);
            m.recordLatency(30);
            expect(m.getAvgLatency()).toBe(20);
        });
        it('getMinLatency', () => {
            m.recordLatency(30);
            m.recordLatency(10);
            m.recordLatency(20);
            expect(m.getMinLatency()).toBe(10);
        });
        it('getMaxLatency', () => {
            m.recordLatency(30);
            m.recordLatency(10);
            m.recordLatency(20);
            expect(m.getMaxLatency()).toBe(30);
        });
        it('getP95Latency', () => {
            for (let i = 1; i <= 20; i++) m.recordLatency(i);
            const p95 = m.getP95Latency();
            expect(p95).toBeGreaterThanOrEqual(19);
        });
        it('getJitter', () => {
            m.recordLatency(10);
            m.recordLatency(20);
            expect(m.getJitter()).toBe(5);
        });
    });

    describe('link quality', () => {
        it('excellent < 50', () => {
            m.recordLatency(20);
            expect(m.getLinkQuality()).toBe('excellent');
        });
        it('good 50-150', () => {
            m.recordLatency(100);
            expect(m.getLinkQuality()).toBe('good');
        });
        it('fair 150-500', () => {
            m.recordLatency(300);
            expect(m.getLinkQuality()).toBe('fair');
        });
        it('poor > 500', () => {
            m.recordLatency(1000);
            expect(m.getLinkQuality()).toBe('poor');
        });
        it('fair when no samples', () => {
            expect(m.getLinkQuality()).toBe('fair');
        });
    });

    describe('offline timeout', () => {
        it('isStale when too old', () => {
            const t = Date.now();
            m.recordLatency(10, t);
            expect(m.isStale(t + 2000)).toBe(true);
        });
        it('not stale when recent', () => {
            const t = Date.now();
            m.recordLatency(10, t);
            expect(m.isStale(t + 100)).toBe(false);
        });
        it('checkTimeout auto-offlines', () => {
            const t = Date.now();
            m.recordLatency(10, t);
            const changed = m.checkTimeout(t + 2000);
            expect(changed).toBe(true);
            expect(m.isOffline()).toBe(true);
        });
        it('checkTimeout no-change when not stale', () => {
            expect(m.checkTimeout()).toBe(false);
        });
    });

    describe('queries', () => {
        it('listLatencies returns copy', () => {
            m.recordLatency(10);
            const l = m.listLatencies();
            expect(l.length).toBe(1);
        });
        it('listHistory', () => {
            m.setOnline(false);
            expect(m.listHistory().length).toBe(1);
        });
        it('getLastChange', () => {
            const t = Date.now() + 5000;
            m.setOnline(false, t);
            expect(m.getLastChange()).toBe(t);
        });
        it('setLatencyWindow valid', () => {
            expect(m.setLatencyWindow(20)).toBe(true);
        });
        it('setLatencyWindow invalid', () => {
            expect(m.setLatencyWindow(0)).toBe(false);
        });
        it('setLatencyWindow trims', () => {
            for (let i = 0; i < 10; i++) m.recordLatency(i);
            m.setLatencyWindow(3);
            expect(m.sampleCount()).toBe(3);
        });
        it('setOfflineTimeoutMs valid', () => {
            expect(m.setOfflineTimeoutMs(2000)).toBe(true);
        });
        it('setOfflineTimeoutMs invalid', () => {
            expect(m.setOfflineTimeoutMs(-1)).toBe(false);
        });
        it('clear resets', () => {
            m.recordLatency(10);
            m.clear();
            expect(m.sampleCount()).toBe(0);
        });
    });

    describe('stats', () => {
        it('getStats includes latency', () => {
            m.recordLatency(10);
            m.recordLatency(20);
            const s = m.getStats();
            expect(s.avgLatency).toBe(15);
            expect(s.linkQuality).toBe('excellent');
        });
    });

    describe('hooks', () => {
        it('should emit stateChange', () => {
            let captured = null;
            m.registerHook('stateChange', (e) => { captured = e; });
            m.setOnline(false);
            expect(captured.state).toBe('offline');
        });
        it('should emit latencySample', () => {
            let captured = null;
            m.registerHook('latencySample', (e) => { captured = e; });
            m.recordLatency(42);
            expect(captured.ms).toBe(42);
        });
        it('hook errors swallowed', () => {
            m.registerHook('stateChange', () => { throw new Error('x'); });
            expect(() => m.setOnline(false)).not.toThrow();
        });
    });
});
