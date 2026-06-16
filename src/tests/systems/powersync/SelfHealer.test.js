/**
 * SelfHealer.test.js - 自愈器测试
 * V1185 Round 45 Iter 29/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    SelfHealer,
    HEALTH_STATES,
} from '../../../systems/powersync/SelfHealer.js';

describe('SelfHealer', () => {
    let h;
    beforeEach(() => { h = new SelfHealer({ maxRetries: 3, backoffMs: 1 }); });

    describe('exports', () => {
        it('HEALTH_STATES includes healthy/degraded/failed', () => {
            expect(HEALTH_STATES).toContain('healthy');
            expect(HEALTH_STATES).toContain('degraded');
            expect(HEALTH_STATES).toContain('failed');
        });
    });

    describe('constructor', () => {
        it('starts healthy', () => {
            expect(h.health.status).toBe('healthy');
            expect(h.health.score).toBe(1);
        });
        it('accepts config', () => {
            const x = new SelfHealer({ maxRetries: 5, backoffMs: 10 });
            expect(x.config.maxRetries).toBe(5);
            expect(x.config.backoffMs).toBe(10);
        });
        it('starts with empty state', () => {
            expect(h.checkpoints.size).toBe(0);
            expect(h.recoveries.size).toBe(0);
            expect(h.attempts.length).toBe(0);
        });
    });

    describe('detectAnomaly', () => {
        it('returns 0 for normal metrics', () => {
            const score = h.detectAnomaly({ errorRate: 0.01, latencyMs: 50 });
            expect(score).toBe(0);
            expect(h.health.status).toBe('healthy');
        });
        it('high errorRate pushes score', () => {
            const score = h.detectAnomaly({ errorRate: 0.8 });
            expect(score).toBeGreaterThan(0.3);
        });
        it('high latency contributes', () => {
            const score = h.detectAnomaly({ latencyMs: 6000 });
            expect(score).toBeGreaterThan(0);
        });
        it('high queueDepth contributes', () => {
            const score = h.detectAnomaly({ queueDepth: 2000 });
            expect(score).toBeGreaterThan(0);
        });
        it('zero throughput + error adds score', () => {
            const score = h.detectAnomaly({ throughput: 0, errorRate: 0.6 });
            expect(score).toBeGreaterThan(0.3);
        });
        it('zero throughput + tiny error does not add score', () => {
            const score = h.detectAnomaly({ throughput: 0, errorRate: 0.01 });
            expect(score).toBe(0);
        });
        it('high memory contributes', () => {
            const score = h.detectAnomaly({ memoryPct: 0.99 });
            expect(score).toBeGreaterThan(0);
        });
        it('caps score at 1', () => {
            const score = h.detectAnomaly({ errorRate: 1, latencyMs: 10000, queueDepth: 9999, memoryPct: 1, throughput: 0 });
            expect(score).toBe(1);
        });
        it('returns 0 for non-object', () => {
            expect(h.detectAnomaly(null)).toBe(0);
            expect(h.detectAnomaly('x')).toBe(0);
        });
        it('updates health to failed when high', () => {
            h.detectAnomaly({ errorRate: 1, latencyMs: 10000, queueDepth: 9999 });
            expect(h.health.status).toBe('failed');
        });
        it('updates health to degraded when mid', () => {
            h.detectAnomaly({ errorRate: 0.4, latencyMs: 2000 });
            expect(h.health.status).toBe('degraded');
        });
        it('increments stats.detections', () => {
            h.detectAnomaly({ errorRate: 0.1 });
            h.detectAnomaly({ errorRate: 0.2 });
            expect(h.stats.detections).toBe(2);
        });
        it('emits anomalyDetected event', () => {
            let captured = null;
            h.registerHook('anomalyDetected', (e) => { captured = e; });
            h.detectAnomaly({ errorRate: 0.5 });
            expect(captured).toBeTruthy();
            expect(captured.score).toBeGreaterThan(0);
        });
    });

    describe('registerRecovery', () => {
        it('valid', () => {
            expect(h.registerRecovery('timeout', async () => true)).toBe(true);
            expect(h.recoveries.size).toBe(1);
        });
        it('rejects non-function', () => {
            expect(h.registerRecovery('x', null)).toBe(false);
            expect(h.registerRecovery('x', 'fn')).toBe(false);
        });
        it('rejects empty type', () => {
            expect(h.registerRecovery('', async () => true)).toBe(false);
        });
        it('unregisterRecovery', () => {
            h.registerRecovery('a', async () => true);
            expect(h.unregisterRecovery('a')).toBe(true);
            expect(h.recoveries.size).toBe(0);
        });
        it('hasRecovery', () => {
            h.registerRecovery('a', async () => true);
            expect(h.hasRecovery('a')).toBe(true);
            expect(h.hasRecovery('b')).toBe(false);
        });
        it('listRecoveryTypes', () => {
            h.registerRecovery('a', async () => true);
            h.registerRecovery('b', async () => true);
            expect(h.listRecoveryTypes().length).toBe(2);
        });
    });

    describe('attemptRecovery', () => {
        it('success first try', async () => {
            h.registerRecovery('restart', async () => true);
            const r = await h.attemptRecovery('restart', {});
            expect(r.ok).toBe(true);
            expect(r.attempts).toBe(1);
            expect(h.stats.recoveries).toBe(1);
        });
        it('failure no handler', async () => {
            const r = await h.attemptRecovery('zzz', {});
            expect(r.ok).toBe(false);
            expect(r.error).toBe('no_handler');
            expect(h.stats.failures).toBe(1);
        });
        it('retries on failure then succeeds', async () => {
            let count = 0;
            h.registerRecovery('flaky', async () => { count++; if (count < 3) return false; return true; });
            const r = await h.attemptRecovery('flaky', {});
            expect(r.ok).toBe(true);
            expect(r.attempts).toBe(3);
        });
        it('retries on throw then succeeds', async () => {
            let count = 0;
            h.registerRecovery('throws', async () => { count++; if (count < 2) throw new Error('boom'); return true; });
            const r = await h.attemptRecovery('throws', {});
            expect(r.ok).toBe(true);
            expect(r.attempts).toBe(2);
        });
        it('exhausts retries', async () => {
            h.registerRecovery('always_fail', async () => false);
            const r = await h.attemptRecovery('always_fail', {});
            expect(r.ok).toBe(false);
            expect(r.attempts).toBe(3);
            expect(h.stats.failures).toBe(1);
        });
        it('passes context to handler', async () => {
            let captured = null;
            h.registerRecovery('with_ctx', async (ctx) => { captured = ctx; return true; });
            await h.attemptRecovery('with_ctx', { x: 1 });
            expect(captured.x).toBe(1);
        });
        it('records attempt history', async () => {
            h.registerRecovery('a', async () => true);
            await h.attemptRecovery('a', {});
            expect(h.attempts.length).toBe(1);
            expect(h.attempts[0].ok).toBe(true);
        });
    });

    describe('checkpoints', () => {
        it('saveCheckpoint valid', () => {
            expect(h.saveCheckpoint('cp1', { data: 1 })).toBe(true);
            expect(h.checkpoints.size).toBe(1);
        });
        it('saveCheckpoint rejects empty id', () => {
            expect(h.saveCheckpoint('', { data: 1 })).toBe(false);
        });
        it('saveCheckpoint deep copies', () => {
            const state = { items: [1, 2] };
            h.saveCheckpoint('cp', state);
            state.items.push(99);
            const restored = h.rollback('cp');
            expect(restored.items.length).toBe(2);
        });
        it('rollback returns deep copy', () => {
            h.saveCheckpoint('cp', { x: 5 });
            const r = h.rollback('cp');
            r.x = 999;
            const r2 = h.rollback('cp');
            expect(r2.x).toBe(5);
        });
        it('rollback unknown returns null', () => {
            expect(h.rollback('zzz')).toBeNull();
        });
        it('listCheckpoints', () => {
            h.saveCheckpoint('a', {});
            h.saveCheckpoint('b', {});
            const list = h.listCheckpoints();
            expect(list.length).toBe(2);
            expect(list).toContain('a');
            expect(list).toContain('b');
        });
        it('hasCheckpoint', () => {
            h.saveCheckpoint('a', {});
            expect(h.hasCheckpoint('a')).toBe(true);
            expect(h.hasCheckpoint('b')).toBe(false);
        });
        it('deleteCheckpoint', () => {
            h.saveCheckpoint('a', {});
            expect(h.deleteCheckpoint('a')).toBe(true);
            expect(h.checkpoints.size).toBe(0);
        });
        it('deleteCheckpoint missing', () => {
            expect(h.deleteCheckpoint('zzz')).toBe(false);
        });
        it('rollback increments stats', () => {
            h.saveCheckpoint('a', { x: 1 });
            h.rollback('a');
            expect(h.stats.rollbacks).toBe(1);
        });
        it('getCheckpointCount', () => {
            h.saveCheckpoint('a', {});
            h.saveCheckpoint('b', {});
            expect(h.getCheckpointCount()).toBe(2);
        });
    });

    describe('queries', () => {
        it('getAttempts', async () => {
            h.registerRecovery('a', async () => true);
            await h.attemptRecovery('a', {});
            expect(h.getAttempts().length).toBe(1);
        });
        it('getAnomalies', () => {
            h.detectAnomaly({ errorRate: 0.5 });
            expect(h.getAnomalies().length).toBe(1);
        });
        it('getHealth returns copy', () => {
            const x = h.getHealth();
            x.status = 'failed';
            expect(h.health.status).toBe('healthy');
        });
    });

    describe('config setters', () => {
        it('setMaxRetries valid', () => {
            expect(h.setMaxRetries(5)).toBe(true);
            expect(h.config.maxRetries).toBe(5);
        });
        it('setMaxRetries invalid', () => {
            expect(h.setMaxRetries(-1)).toBe(false);
        });
        it('setBackoffMs valid', () => {
            expect(h.setBackoffMs(50)).toBe(true);
        });
        it('setBackoffMs invalid', () => {
            expect(h.setBackoffMs(-1)).toBe(false);
        });
    });

    describe('getStats', () => {
        it('returns aggregate', () => {
            h.saveCheckpoint('a', {});
            const s = h.getStats();
            expect(s.health.status).toBe('healthy');
            expect(s.checkpoints).toBe(1);
        });
    });

    describe('reset', () => {
        it('clears all state', () => {
            h.saveCheckpoint('a', {});
            h.detectAnomaly({ errorRate: 0.9 });
            h.reset();
            expect(h.checkpoints.size).toBe(0);
            expect(h.anomalies.length).toBe(0);
            expect(h.health.status).toBe('healthy');
        });
    });

    describe('hooks', () => {
        it('hook errors swallowed', () => {
            h.registerHook('anomalyDetected', () => { throw new Error('x'); });
            expect(() => h.detectAnomaly({ errorRate: 0.5 })).not.toThrow();
        });
    });
});
