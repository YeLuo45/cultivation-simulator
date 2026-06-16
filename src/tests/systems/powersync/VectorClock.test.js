/**
 * VectorClock.test.js - 向量时钟测试
 * V1160 Round 44 Iter 3/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VectorClock, COMPARE } from '../../../systems/powersync/VectorClock.js';

describe('VectorClock', () => {
    let vc;
    beforeEach(() => { vc = new VectorClock({ deviceId: 'a' }); });

    describe('exports', () => {
        it('should export COMPARE constants', () => {
            expect(COMPARE.LESS).toBe(-1);
            expect(COMPARE.EQUAL).toBe(0);
            expect(COMPARE.GREATER).toBe(1);
            expect(COMPARE.CONCURRENT).toBe(2);
        });
    });

    describe('constructor', () => {
        it('should initialize with own device tick 0', () => {
            expect(vc.get('a')).toBe(0);
        });
        it('should accept custom deviceId', () => {
            const v = new VectorClock({ deviceId: 'b' });
            expect(v.get('b')).toBe(0);
        });
    });

    describe('tick', () => {
        it('should increment own device by 1', () => {
            const t = vc.tick();
            expect(t).toBe(1);
            expect(vc.get('a')).toBe(1);
        });
        it('should track multiple devices', () => {
            vc.tick('a');
            vc.tick('b');
            vc.tick('b');
            expect(vc.get('a')).toBe(1);
            expect(vc.get('b')).toBe(2);
        });
        it('should emit tick hook', () => {
            let captured = null;
            vc.registerHook('tick', (p) => { captured = p; });
            vc.tick('a');
            expect(captured.deviceId).toBe('a');
            expect(captured.value).toBe(1);
        });
    });

    describe('merge', () => {
        it('should take max of overlapping devices', () => {
            const a = new VectorClock({ deviceId: 'a' });
            const b = new VectorClock({ deviceId: 'b' });
            a.tick('a'); a.tick('a'); a.tick('a');
            b.tick('b'); b.tick('b');
            a.merge(b);
            expect(a.get('a')).toBe(3);
            expect(a.get('b')).toBe(2);
        });
        it('should be a no-op when other is empty', () => {
            vc.tick('a');
            const before = vc.get('a');
            const empty = new VectorClock({ deviceId: 'x' });
            vc.merge(empty);
            expect(vc.get('a')).toBe(before);
        });
        it('should handle null other', () => {
            vc.tick('a');
            expect(() => vc.merge(null)).not.toThrow();
        });
        it('should return self for chaining', () => {
            const b = new VectorClock({ deviceId: 'b' });
            expect(vc.merge(b)).toBe(vc);
        });
        it('should emit merged hook', () => {
            let fired = false;
            vc.registerHook('merged', () => { fired = true; });
            const b = new VectorClock({ deviceId: 'b' });
            b.tick('b');
            vc.merge(b);
            expect(fired).toBe(true);
        });
    });

    describe('compare', () => {
        it('should return EQUAL for identical clocks', () => {
            const a = new VectorClock({ deviceId: 'a' });
            const b = new VectorClock({ deviceId: 'b' });
            a.tick('a');
            b.tick('a'); // different deviceId but a's tick
            expect(a.compare(b)).toBe(COMPARE.EQUAL);
        });
        it('should return GREATER when this is ahead', () => {
            const a = new VectorClock({ deviceId: 'a' });
            const b = new VectorClock({ deviceId: 'a' });
            a.tick('a');
            expect(a.compare(b)).toBe(COMPARE.GREATER);
        });
        it('should return LESS when this is behind', () => {
            const a = new VectorClock({ deviceId: 'a' });
            const b = new VectorClock({ deviceId: 'a' });
            b.tick('a');
            expect(a.compare(b)).toBe(COMPARE.LESS);
        });
        it('should return CONCURRENT for branching', () => {
            const a = new VectorClock({ deviceId: 'a' });
            const b = new VectorClock({ deviceId: 'b' });
            a.tick('a');
            b.tick('b');
            expect(a.compare(b)).toBe(COMPARE.CONCURRENT);
        });
        it('should return CONCURRENT for null other', () => {
            expect(vc.compare(null)).toBe(COMPARE.CONCURRENT);
        });
    });

    describe('convenience helpers', () => {
        it('isHappensBefore/After/Concurrent/Equal', () => {
            const a = new VectorClock({ deviceId: 'a' });
            const b = new VectorClock({ deviceId: 'a' });
            a.tick('a');
            expect(b.isHappensBefore(a)).toBe(true);
            expect(a.isHappensAfter(b)).toBe(true);
            expect(a.isEqual(a.clone())).toBe(true);
        });
        it('isConcurrent true for diverged clocks', () => {
            const a = new VectorClock({ deviceId: 'a' });
            const b = new VectorClock({ deviceId: 'b' });
            a.tick('a');
            b.tick('b');
            expect(a.isConcurrent(b)).toBe(true);
        });
    });

    describe('clone', () => {
        it('should deep-copy the clock', () => {
            vc.tick('a'); vc.tick('a');
            const c = vc.clone();
            c.tick('a');
            expect(vc.get('a')).toBe(2);
            expect(c.get('a')).toBe(3);
        });
    });

    describe('serialize/deserialize', () => {
        it('should round-trip the clock', () => {
            vc.tick('a'); vc.tick('a');
            vc.tick('b');
            const json = vc.serialize();
            const restored = VectorClock.deserialize(json);
            expect(restored.get('a')).toBe(2);
            expect(restored.get('b')).toBe(1);
        });
        it('should preserve deviceId in serialization', () => {
            const json = vc.serialize();
            const restored = VectorClock.deserialize(json);
            expect(restored.config.deviceId).toBe('a');
        });
        it('should accept object form for deserialize', () => {
            const restored = VectorClock.deserialize({ deviceId: 'x', clock: { x: 5 } });
            expect(restored.get('x')).toBe(5);
        });
    });

    describe('queries', () => {
        it('listAll should return all device ticks', () => {
            vc.tick('a');
            vc.tick('b');
            const all = vc.listAll();
            expect(all.a).toBe(1);
            expect(all.b).toBe(1);
        });
        it('getStats includes device count', () => {
            vc.tick('a');
            const s = vc.getStats();
            expect(s.devices).toBe(1);
            expect(s.ticks).toBe(1);
        });
    });

    describe('hooks', () => {
        it('should handle hook errors silently', () => {
            vc.registerHook('tick', () => { throw new Error('boom'); });
            expect(() => vc.tick('a')).not.toThrow();
        });
        it('should support multiple tick listeners', () => {
            let count = 0;
            vc.registerHook('tick', () => count++);
            vc.registerHook('tick', () => count++);
            vc.tick('a');
            expect(count).toBe(2);
        });
        it('should not throw when merging self', () => {
            vc.tick('a');
            expect(() => vc.merge(vc)).not.toThrow();
        });
        it('get on unknown device returns 0', () => {
            expect(vc.get('unknown_device')).toBe(0);
        });
        it('should support null vector in deserialize gracefully', () => {
            const restored = VectorClock.deserialize('{"deviceId":"x","clock":null}');
            expect(restored.get('x')).toBe(0);
        });
        it('clone preserves deviceId', () => {
            const c = vc.clone();
            expect(c.config.deviceId).toBe('a');
        });
        it('should increment comparisons stat', () => {
            const b = new VectorClock({ deviceId: 'b' });
            vc.compare(b);
            vc.compare(b);
            expect(vc.stats.comparisons).toBe(2);
        });
    });
});
