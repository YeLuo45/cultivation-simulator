/**
 * ReplicationLog.test.js - 复制日志测试
 * V1165 Round 44 Iter 8/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ReplicationLog, NODE_STATES } from '../../../systems/powersync/ReplicationLog.js';

describe('ReplicationLog', () => {
    let log;
    beforeEach(() => { log = new ReplicationLog({ defaultTimeoutMs: 5000 }); });

    describe('exports', () => {
        it('should export NODE_STATES', () => {
            expect(NODE_STATES).toContain('active');
            expect(NODE_STATES).toContain('idle');
            expect(NODE_STATES).toContain('lagging');
            expect(NODE_STATES).toContain('dead');
        });
    });

    describe('constructor', () => {
        it('should initialize empty', () => {
            expect(log.nodes.size).toBe(0);
            expect(log.stats.registered).toBe(0);
        });
        it('should accept defaultTimeoutMs', () => {
            expect(log.config.defaultTimeoutMs).toBe(5000);
        });
    });

    describe('registerNode', () => {
        it('should register a new node', () => {
            const n = log.registerNode('n1', { region: 'us' });
            expect(n.id).toBe('n1');
            expect(n.meta.region).toBe('us');
            expect(n.state).toBe('active');
        });
        it('should refresh existing node', () => {
            log.registerNode('n1', { region: 'us' });
            const n = log.registerNode('n1', { region: 'eu' });
            expect(n.meta.region).toBe('eu');
        });
        it('should reject invalid id', () => {
            expect(log.registerNode(null)).toBeNull();
            expect(log.registerNode('')).toBeNull();
            expect(log.registerNode(123)).toBeNull();
        });
        it('should set lastHeartbeat on register', () => {
            const before = Date.now();
            const n = log.registerNode('n1');
            expect(n.lastHeartbeat).toBeGreaterThanOrEqual(before);
        });
    });

    describe('heartbeat', () => {
        it('should update lastHeartbeat', async () => {
            log.registerNode('n1');
            const initial = log.get('n1').lastHeartbeat;
            await new Promise(r => setTimeout(r, 10));
            log.heartbeat('n1');
            expect(log.get('n1').lastHeartbeat).toBeGreaterThan(initial);
        });
        it('should return false for unknown id', () => {
            expect(log.heartbeat('nope')).toBe(false);
        });
        it('should reactivate from non-active state', () => {
            log.registerNode('n1');
            log.setState('n1', 'dead');
            log.heartbeat('n1');
            expect(log.get('n1').state).toBe('active');
        });
        it('should accept custom ts', () => {
            log.registerNode('n1');
            log.heartbeat('n1', 12345);
            expect(log.get('n1').lastHeartbeat).toBe(12345);
        });
        it('should track heartbeats stat', () => {
            log.registerNode('n1');
            log.heartbeat('n1');
            log.heartbeat('n1');
            expect(log.stats.heartbeats).toBe(2);
        });
    });

    describe('getLag', () => {
        it('should compute now - lastHeartbeat', async () => {
            log.registerNode('n1');
            await new Promise(r => setTimeout(r, 30));
            const lag = log.getLag('n1');
            expect(lag).toBeGreaterThanOrEqual(25);
        });
        it('should return -1 for unknown id', () => {
            expect(log.getLag('nope')).toBe(-1);
        });
        it('should use provided now', () => {
            log.registerNode('n1');
            log.heartbeat('n1', 1000);
            expect(log.getLag('n1', 2000)).toBe(1000);
        });
    });

    describe('isAlive', () => {
        it('should be true for fresh node', () => {
            log.registerNode('n1');
            expect(log.isAlive('n1')).toBe(true);
        });
        it('should be false for stale node', () => {
            log.registerNode('n1');
            const now = Date.now() + 6000; // 6s in future relative to default 5s timeout
            expect(log.isAlive('n1', 5000, now)).toBe(false);
        });
        it('should be false for unknown id', () => {
            expect(log.isAlive('nope')).toBe(false);
        });
        it('should respect custom timeoutMs', () => {
            log.registerNode('n1');
            const future = Date.now() + 200;
            expect(log.isAlive('n1', 100, future)).toBe(false);
        });
    });

    describe('listOnline', () => {
        it('should filter by heartbeat recency', () => {
            log.registerNode('a');
            log.heartbeat('a', 1000);
            log.registerNode('b');
            log.heartbeat('b', Date.now());
            const now = Date.now();
            // at now, b is online (lag ~0), a is dead (lag=now-1000)
            const online = log.listOnline(5000, now);
            expect(online.length).toBe(1);
            expect(online[0].id).toBe('b');
        });
        it('should return empty when no nodes', () => {
            expect(log.listOnline().length).toBe(0);
        });
    });

    describe('state changes', () => {
        it('markDead should set state', () => {
            log.registerNode('n1');
            log.markDead('n1');
            expect(log.get('n1').state).toBe('dead');
        });
        it('markDead returns false for unknown', () => {
            expect(log.markDead('nope')).toBe(false);
        });
        it('setState with valid state', () => {
            log.registerNode('n1');
            expect(log.setState('n1', 'idle')).toBe(true);
            expect(log.get('n1').state).toBe('idle');
        });
        it('setState with invalid state', () => {
            log.registerNode('n1');
            expect(log.setState('n1', 'bogus')).toBe(false);
        });
        it('listByState filters', () => {
            log.registerNode('a');
            log.registerNode('b');
            log.markDead('a');
            const dead = log.listByState('dead');
            expect(dead.length).toBe(1);
        });
        it('listByState invalid', () => {
            expect(log.listByState('bogus').length).toBe(0);
        });
    });

    describe('queries', () => {
        it('listNodes returns all', () => {
            log.registerNode('a');
            log.registerNode('b');
            expect(log.listNodes().length).toBe(2);
        });
        it('remove deletes node', () => {
            log.registerNode('a');
            expect(log.remove('a')).toBe(true);
            expect(log.get('a')).toBeNull();
        });
    });

    describe('stats', () => {
        it('getStats counts by state', () => {
            log.registerNode('a');
            log.registerNode('b');
            log.markDead('a');
            const s = log.getStats();
            expect(s.total).toBe(2);
            expect(s.byState.dead).toBe(1);
            expect(s.byState.active).toBe(1);
        });
    });

    describe('hooks', () => {
        it('should emit registered', () => {
            let fired = false;
            log.registerHook('registered', () => { fired = true; });
            log.registerNode('n1');
            expect(fired).toBe(true);
        });
        it('should emit heartbeat', () => {
            let captured = null;
            log.registerHook('heartbeat', (p) => { captured = p; });
            log.registerNode('n1');
            log.heartbeat('n1');
            expect(captured.id).toBe('n1');
        });
        it('should emit dead', () => {
            let fired = false;
            log.registerHook('dead', () => { fired = true; });
            log.registerNode('n1');
            log.markDead('n1');
            expect(fired).toBe(true);
        });
        it('should handle hook errors silently', () => {
            log.registerHook('registered', () => { throw new Error('boom'); });
            expect(() => log.registerNode('n1')).not.toThrow();
        });
    });
});
