/**
 * HookRegistry.test.js - Hook 注册表测试
 * V1173 Round 44 Iter 16/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { HookRegistry, SCOPES } from '../../../systems/powersync/HookRegistry.js';

describe('HookRegistry', () => {
    let hr;
    beforeEach(() => { hr = new HookRegistry({ defaultPriority: 5 }); });

    describe('exports', () => {
        it('should export SCOPES', () => {
            expect(SCOPES).toContain('global');
            expect(SCOPES).toContain('local');
        });
        it('should expose class', () => {
            expect(typeof HookRegistry).toBe('function');
        });
    });

    describe('constructor', () => {
        it('should default priority 10', () => {
            const x = new HookRegistry();
            expect(x.defaultPriority).toBe(10);
        });
        it('should use custom priority', () => {
            expect(hr.defaultPriority).toBe(5);
        });
        it('should start empty', () => {
            expect(hr.count()).toBe(0);
            expect(hr.count('x')).toBe(0);
        });
        it('should set stats', () => {
            expect(hr.stats.registered).toBe(0);
            expect(hr.stats.triggered).toBe(0);
        });
    });

    describe('register', () => {
        it('should add a hook and return id', () => {
            const id = hr.register('ev', () => {});
            expect(typeof id).toBe('string');
            expect(hr.count('ev')).toBe(1);
        });
        it('should increment registered stat', () => {
            hr.register('ev', () => {});
            hr.register('ev', () => {});
            expect(hr.stats.registered).toBe(2);
        });
        it('should throw on invalid event', () => {
            expect(() => hr.register('', () => {})).toThrow();
            expect(() => hr.register(null, () => {})).toThrow();
        });
        it('should throw on non-function fn', () => {
            expect(() => hr.register('ev', 'nope')).toThrow();
            expect(() => hr.register('ev', null)).toThrow();
        });
        it('should throw on invalid scope', () => {
            expect(() => hr.register('ev', () => {}, { scope: 'weird' })).toThrow();
        });
        it('should accept custom priority', () => {
            const id = hr.register('ev', () => {}, { priority: 1 });
            const list = hr.listHooks('ev');
            expect(list[0].priority).toBe(1);
        });
        it('should accept once flag', () => {
            const id = hr.register('ev', () => {}, { once: true });
            expect(hr.listHooks('ev')[0].once).toBe(true);
        });
        it('should record ts', () => {
            const id = hr.register('ev', () => {});
            expect(typeof hr.listHooks('ev')[0].ts).toBe('number');
        });
    });

    describe('on', () => {
        it('should be alias of register', () => {
            const id = hr.on('ev', () => {});
            expect(hr.count('ev')).toBe(1);
            expect(typeof id).toBe('string');
        });
    });

    describe('trigger', () => {
        it('should call fns in priority order (low first)', () => {
            const order = [];
            hr.register('ev', () => order.push(3), { priority: 30 });
            hr.register('ev', () => order.push(1), { priority: 10 });
            hr.register('ev', () => order.push(2), { priority: 20 });
            hr.trigger('ev');
            expect(order).toEqual([1, 2, 3]);
        });
        it('should return count of called fns', () => {
            hr.register('ev', () => {});
            hr.register('ev', () => {});
            expect(hr.trigger('ev')).toBe(2);
        });
        it('should return 0 when no fns', () => {
            expect(hr.trigger('nope')).toBe(0);
        });
        it('should pass payload', () => {
            let captured = null;
            hr.register('ev', (p) => { captured = p; });
            hr.trigger('ev', { x: 7 });
            expect(captured.x).toBe(7);
        });
        it('should swallow hook errors', () => {
            hr.register('ev', () => { throw new Error('x'); });
            hr.register('ev', () => {});
            expect(() => hr.trigger('ev')).not.toThrow();
            expect(hr.stats.errors).toBe(1);
        });
        it('should fire once hooks only once', () => {
            let count = 0;
            hr.register('ev', () => { count++; }, { once: true });
            hr.trigger('ev');
            hr.trigger('ev');
            hr.trigger('ev');
            expect(count).toBe(1);
            expect(hr.count('ev')).toBe(0);
        });
        it('should fire non-once hooks every trigger', () => {
            let count = 0;
            hr.register('ev', () => { count++; });
            hr.trigger('ev');
            hr.trigger('ev');
            expect(count).toBe(2);
        });
    });

    describe('scope', () => {
        it('global hooks called by default trigger', () => {
            let fired = false;
            hr.register('ev', () => { fired = true; }, { scope: 'global' });
            hr.trigger('ev', null);
            expect(fired).toBe(true);
        });
        it('local hooks NOT called by default trigger', () => {
            let fired = false;
            hr.register('ev', () => { fired = true; }, { scope: 'local' });
            hr.trigger('ev', null);
            expect(fired).toBe(false);
        });
        it('local hooks called when scope=local', () => {
            let fired = false;
            hr.register('ev', () => { fired = true; }, { scope: 'local' });
            hr.trigger('ev', null, { scope: 'local' });
            expect(fired).toBe(true);
        });
        it('mixed scope isolation', () => {
            const log = [];
            hr.register('ev', () => log.push('g'), { scope: 'global' });
            hr.register('ev', () => log.push('l'), { scope: 'local' });
            hr.trigger('ev', null);
            expect(log).toEqual(['g']);
            hr.trigger('ev', null, { scope: 'local' });
            expect(log).toEqual(['g', 'g', 'l']);
        });
    });

    describe('unregister', () => {
        it('should remove by fn', () => {
            const fn = () => {};
            hr.register('ev', fn);
            expect(hr.unregister('ev', fn)).toBe(true);
            expect(hr.count('ev')).toBe(0);
        });
        it('should remove by id', () => {
            const id = hr.register('ev', () => {});
            expect(hr.unregister('ev', id)).toBe(true);
            expect(hr.count('ev')).toBe(0);
        });
        it('should return false when nothing to remove', () => {
            expect(hr.unregister('nope', () => {})).toBe(false);
        });
        it('should not affect other fns', () => {
            const fn1 = () => {};
            const fn2 = () => {};
            hr.register('ev', fn1);
            hr.register('ev', fn2);
            hr.unregister('ev', fn1);
            expect(hr.count('ev')).toBe(1);
        });
        it('should increment removed stat', () => {
            hr.register('ev', () => {});
            hr.register('ev', () => {});
            const fn = () => {};
            hr.register('ev', fn);
            hr.unregister('ev', fn);
            expect(hr.stats.removed).toBe(1);
        });
    });

    describe('listHooks', () => {
        it('should list hooks for event sorted by priority', () => {
            hr.register('ev', () => {}, { priority: 5 });
            hr.register('ev', () => {}, { priority: 1 });
            const list = hr.listHooks('ev');
            expect(list[0].priority).toBe(1);
            expect(list[1].priority).toBe(5);
        });
        it('should return all events when called with no arg', () => {
            hr.register('a', () => {});
            hr.register('b', () => {});
            const all = hr.listHooks();
            expect(Object.keys(all).sort()).toEqual(['a', 'b']);
        });
        it('should return empty array for unknown event', () => {
            expect(hr.listHooks('nope')).toEqual([]);
        });
    });

    describe('clear', () => {
        it('should clear one event', () => {
            hr.register('a', () => {});
            hr.register('a', () => {});
            hr.register('b', () => {});
            expect(hr.clear('a')).toBe(2);
            expect(hr.count('a')).toBe(0);
            expect(hr.count('b')).toBe(1);
        });
        it('should clear all when no arg', () => {
            hr.register('a', () => {});
            hr.register('b', () => {});
            expect(hr.clear()).toBe(2);
            expect(hr.count()).toBe(0);
        });
        it('should return 0 for empty event', () => {
            expect(hr.clear('nope')).toBe(0);
        });
    });

    describe('hooks', () => {
        it('should emit registered', () => {
            let payload = null;
            hr.registerHook('registered', (p) => { payload = p; });
            hr.register('ev', () => {});
            expect(payload.event).toBe('ev');
        });
        it('should emit unregistered', () => {
            let payload = null;
            hr.registerHook('unregistered', (p) => { payload = p; });
            const fn = () => {};
            hr.register('ev', fn);
            hr.unregister('ev', fn);
            expect(payload.removed).toBe(1);
        });
        it('should emit triggered', () => {
            let payload = null;
            hr.registerHook('triggered', (p) => { payload = p; });
            hr.register('ev', () => {});
            hr.trigger('ev');
            expect(payload.count).toBe(1);
        });
        it('should swallow hook errors', () => {
            hr.registerHook('registered', () => { throw new Error('x'); });
            expect(() => hr.register('ev', () => {})).not.toThrow();
        });
    });

    describe('getStats', () => {
        it('should include counts', () => {
            hr.register('ev', () => {});
            hr.trigger('ev');
            const s = hr.getStats();
            expect(s.registered).toBe(1);
            expect(s.triggered).toBe(1);
            expect(s.events).toBe(1);
        });
    });
});
