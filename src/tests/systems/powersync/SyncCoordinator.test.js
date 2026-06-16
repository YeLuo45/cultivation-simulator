/**
 * SyncCoordinator.test.js - 同步协调 Agent 测试
 * V1178 Round 44 Iter 21/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    SyncCoordinator,
    COORDINATOR_STATES,
    LOCK_STATES,
    BARRIER_STATES,
} from '../../../systems/powersync/SyncCoordinator.js';

describe('SyncCoordinator', () => {
    let c;
    beforeEach(() => { c = new SyncCoordinator({ defaultLockTtlMs: 1000 }); });

    describe('exports', () => {
        it('should export COORDINATOR_STATES', () => {
            expect(COORDINATOR_STATES).toContain('idle');
            expect(COORDINATOR_STATES).toContain('running');
        });
        it('should export LOCK_STATES', () => {
            expect(LOCK_STATES).toContain('free');
            expect(LOCK_STATES).toContain('held');
        });
        it('should export BARRIER_STATES', () => {
            expect(BARRIER_STATES).toContain('waiting');
            expect(BARRIER_STATES).toContain('released');
        });
    });

    describe('constructor', () => {
        it('should start idle', () => {
            expect(c.state).toBe('idle');
            expect(c.getClientCount()).toBe(0);
        });
        it('should accept config', () => {
            const x = new SyncCoordinator({ defaultLockTtlMs: 2000 });
            expect(x.config.defaultLockTtlMs).toBe(2000);
        });
        it('should have empty maps', () => {
            expect(c.locks.size).toBe(0);
            expect(c.barriers.size).toBe(0);
        });
    });

    describe('clients', () => {
        it('addClient adds', () => {
            expect(c.addClient('A')).toBe(true);
            expect(c.hasClient('A')).toBe(true);
        });
        it('addClient duplicate returns false', () => {
            c.addClient('A');
            expect(c.addClient('A')).toBe(false);
        });
        it('addClient invalid', () => {
            expect(c.addClient('')).toBe(false);
            expect(c.addClient(null)).toBe(false);
        });
        it('removeClient removes', () => {
            c.addClient('A');
            expect(c.removeClient('A')).toBe(true);
            expect(c.hasClient('A')).toBe(false);
        });
        it('removeClient non-existent', () => {
            expect(c.removeClient('X')).toBe(false);
        });
        it('listClients returns array', () => {
            c.addClient('A');
            c.addClient('B');
            expect(c.listClients().sort()).toEqual(['A', 'B']);
        });
    });

    describe('acquireLock', () => {
        it('should succeed when free', () => {
            expect(c.acquireLock('res1', 'A', 5000)).toBe(true);
            expect(c.getLockHolder('res1')).toBe('A');
        });
        it('should fail when held', () => {
            c.acquireLock('res1', 'A', 5000);
            expect(c.acquireLock('res1', 'B', 5000)).toBe(false);
        });
        it('should reject invalid args', () => {
            expect(c.acquireLock('', 'A')).toBe(false);
            expect(c.acquireLock('res', '')).toBe(false);
        });
        it('should track contention stat', () => {
            c.acquireLock('r', 'A', 5000);
            c.acquireLock('r', 'B', 5000);
            expect(c.stats.locksContended).toBe(1);
        });
        it('should track acquired stat', () => {
            c.acquireLock('r', 'A', 5000);
            expect(c.stats.locksAcquired).toBe(1);
        });
    });

    describe('releaseLock', () => {
        it('should release owned', () => {
            c.acquireLock('r', 'A', 5000);
            expect(c.releaseLock('r', 'A')).toBe(true);
            expect(c.getLockHolder('r')).toBeNull();
        });
        it('should reject wrong owner', () => {
            c.acquireLock('r', 'A', 5000);
            expect(c.releaseLock('r', 'B')).toBe(false);
        });
        it('should reject unknown resource', () => {
            expect(c.releaseLock('x', 'A')).toBe(false);
        });
        it('should increment release stat', () => {
            c.acquireLock('r', 'A', 5000);
            c.releaseLock('r', 'A');
            expect(c.stats.locksReleased).toBe(1);
        });
    });

    describe('lock expiration', () => {
        it('should auto-expire on next acquire', () => {
            c.acquireLock('r', 'A', 50);
            // wait beyond TTL
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(c.acquireLock('r', 'B', 5000)).toBe(true);
                    expect(c.getLockHolder('r')).toBe('B');
                    expect(c.stats.locksExpired).toBe(1);
                    resolve();
                }, 80);
            });
        });
        it('isLocked reflects expiry', () => {
            c.acquireLock('r', 'A', 50);
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(c.isLocked('r')).toBe(false);
                    resolve();
                }, 80);
            });
        });
    });

    describe('isLocked / getLockHolder / listLocks', () => {
        it('isLocked false when not held', () => {
            expect(c.isLocked('r')).toBe(false);
        });
        it('getLockHolder null when not held', () => {
            expect(c.getLockHolder('r')).toBeNull();
        });
        it('listLocks returns array', () => {
            c.acquireLock('r1', 'A', 5000);
            c.acquireLock('r2', 'B', 5000);
            expect(c.listLocks().length).toBe(2);
        });
    });

    describe('barrier', () => {
        it('barrier creates entry', () => {
            expect(c.barrier('b1', 3)).toBe(true);
            expect(c.getBarrierProgress('b1')).toEqual({ expected: 3, arrived: 0, state: 'waiting' });
        });
        it('barrier invalid count', () => {
            expect(c.barrier('b1', 0)).toBe(false);
            expect(c.barrier('b1', -1)).toBe(false);
        });
        it('barrier invalid id', () => {
            expect(c.barrier('', 3)).toBe(false);
        });
        it('arriveAtBarrier counts', () => {
            c.barrier('b1', 2);
            const r1 = c.arriveAtBarrier('b1', 'A');
            expect(r1.ok).toBe(true);
            expect(r1.released).toBe(false);
            expect(r1.arrived).toBe(1);
        });
        it('arriveAtBarrier releases at expected count', () => {
            c.barrier('b1', 2);
            c.arriveAtBarrier('b1', 'A');
            const r2 = c.arriveAtBarrier('b1', 'B');
            expect(r2.released).toBe(true);
            expect(c.isBarrierReleased('b1')).toBe(true);
        });
        it('arriveAtBarrier unknown barrier', () => {
            expect(c.arriveAtBarrier('x', 'A').ok).toBe(false);
        });
        it('arriveAtBarrier duplicate', () => {
            c.barrier('b1', 3);
            c.arriveAtBarrier('b1', 'A');
            const r = c.arriveAtBarrier('b1', 'A');
            expect(r.ok).toBe(false);
            expect(r.reason).toBe('duplicate');
        });
        it('arriveAtBarrier rejects after release', () => {
            c.barrier('b1', 1);
            c.arriveAtBarrier('b1', 'A');
            const r = c.arriveAtBarrier('b1', 'B');
            expect(r.ok).toBe(false);
            expect(r.reason).toBe('already_released');
        });
        it('barrier created stat', () => {
            c.barrier('b1', 3);
            expect(c.stats.barriersCreated).toBe(1);
        });
        it('barrier released stat', () => {
            c.barrier('b1', 1);
            c.arriveAtBarrier('b1', 'A');
            expect(c.stats.barriersReleased).toBe(1);
        });
        it('resetBarrier resets', () => {
            c.barrier('b1', 2);
            c.arriveAtBarrier('b1', 'A');
            c.resetBarrier('b1');
            expect(c.getBarrierProgress('b1').arrived).toBe(0);
        });
        it('listBarriers returns summary', () => {
            c.barrier('b1', 2);
            c.barrier('b2', 3);
            expect(c.listBarriers().length).toBe(2);
        });
    });

    describe('electLeader', () => {
        it('returns min ID', () => {
            expect(c.electLeader(['C', 'A', 'B'])).toBe('A');
        });
        it('returns null for empty', () => {
            expect(c.electLeader([])).toBeNull();
        });
        it('handles non-array', () => {
            expect(c.electLeader(null)).toBeNull();
        });
        it('handles single candidate', () => {
            expect(c.electLeader(['X'])).toBe('X');
        });
        it('handles numeric IDs', () => {
            expect(c.electLeader([3, 1, 2])).toBe(1);
        });
        it('increments leadersElected', () => {
            c.electLeader(['A', 'B']);
            expect(c.stats.leadersElected).toBe(1);
        });
    });

    describe('removeClient cleans up', () => {
        it('releases locks held by removed client', () => {
            c.addClient('A');
            c.acquireLock('r', 'A', 5000);
            c.removeClient('A');
            expect(c.isLocked('r')).toBe(false);
        });
        it('removes from barriers', () => {
            c.addClient('A');
            c.addClient('B');
            c.barrier('b1', 2);
            c.arriveAtBarrier('b1', 'A');
            c.removeClient('A');
            expect(c.getBarrierProgress('b1').arrived).toBe(0);
        });
    });

    describe('state / clear', () => {
        it('setState valid', () => {
            expect(c.setState('running')).toBe(true);
            expect(c.getState()).toBe('running');
        });
        it('setState invalid', () => {
            expect(c.setState('xx')).toBe(false);
        });
        it('clear resets', () => {
            c.addClient('A');
            c.acquireLock('r', 'A', 5000);
            c.barrier('b1', 2);
            c.clear();
            expect(c.getClientCount()).toBe(0);
            expect(c.locks.size).toBe(0);
            expect(c.barriers.size).toBe(0);
        });
    });

    describe('stats', () => {
        it('getStats aggregates', () => {
            c.addClient('A');
            c.acquireLock('r', 'A', 5000);
            const s = c.getStats();
            expect(s.clients).toBe(1);
            expect(s.locks).toBe(1);
            expect(s.state).toBe('idle');
        });
    });

    describe('hooks', () => {
        it('emits clientAdded', () => {
            let n = 0;
            c.registerHook('clientAdded', () => n++);
            c.addClient('A');
            expect(n).toBe(1);
        });
        it('emits lockContended', () => {
            let captured = null;
            c.registerHook('lockContended', (e) => { captured = e; });
            c.acquireLock('r', 'A', 5000);
            c.acquireLock('r', 'B', 5000);
            expect(captured.requester).toBe('B');
        });
        it('emits barrierReleased', () => {
            let captured = null;
            c.registerHook('barrierReleased', (e) => { captured = e; });
            c.barrier('b1', 1);
            c.arriveAtBarrier('b1', 'A');
            expect(captured.barrierId).toBe('b1');
        });
        it('hook errors swallowed', () => {
            c.registerHook('clientAdded', () => { throw new Error('x'); });
            expect(() => c.addClient('A')).not.toThrow();
        });
    });
});
