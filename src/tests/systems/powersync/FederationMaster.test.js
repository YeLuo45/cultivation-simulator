/**
 * FederationMaster.test.js - Federation 总控测试
 * V1186 Round 45 Iter 30/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    FederationMaster,
    FEDERATION_PHASES,
    PHASE_TRANSITIONS,
} from '../../../systems/powersync/FederationMaster.js';

describe('FederationMaster', () => {
    let m;
    const fakeEngines = {
        deltaSync:    { sync() { return 'delta'; }, shutdown() { this._down = true; } },
        changeLog:    { changeLog() { return 'changelog'; } },
        vectorClock:  { tick() { return 1; } },
    };

    beforeEach(() => { m = new FederationMaster({ engines: fakeEngines }); });

    describe('exports', () => {
        it('FEDERATION_PHASES contains 5 phases', () => {
            expect(FEDERATION_PHASES.length).toBe(5);
            expect(FEDERATION_PHASES).toContain('init');
            expect(FEDERATION_PHASES).toContain('syncing');
            expect(FEDERATION_PHASES).toContain('stable');
            expect(FEDERATION_PHASES).toContain('draining');
            expect(FEDERATION_PHASES).toContain('shutdown');
        });
        it('PHASE_TRANSITIONS defines allowed moves', () => {
            expect(PHASE_TRANSITIONS.init).toContain('syncing');
            expect(PHASE_TRANSITIONS.shutdown.length).toBe(0);
        });
    });

    describe('constructor', () => {
        it('accepts default engines', () => {
            expect(m.engineCount()).toBe(3);
            expect(m.hasEngine('deltaSync')).toBe(true);
        });
        it('works with empty config', () => {
            const x = new FederationMaster();
            expect(x.engineCount()).toBe(0);
        });
        it('starts in init phase', () => {
            expect(m.getPhase()).toBe('init');
        });
        it('accepts custom config', () => {
            const x = new FederationMaster({ autoStart: false, maxDispatchHistory: 10 });
            expect(x.config.autoStart).toBe(false);
            expect(x.config.maxDispatchHistory).toBe(10);
        });
    });

    describe('engine registry', () => {
        it('registerEngine new', () => {
            expect(m.registerEngine('new', { foo() {} })).toBe(true);
            expect(m.engineCount()).toBe(4);
        });
        it('registerEngine replaces existing', () => {
            const v1 = { tick() { return 1; } };
            const v2 = { tick() { return 2; } };
            m.registerEngine('vc', v1);
            m.registerEngine('vc', v2);
            expect(m.getEngine('vc')).toBe(v2);
        });
        it('rejects empty name', () => {
            expect(m.registerEngine('', { x() {} })).toBe(false);
        });
        it('rejects null instance', () => {
            expect(m.registerEngine('x', null)).toBe(false);
        });
        it('unregisterEngine', () => {
            expect(m.unregisterEngine('deltaSync')).toBe(true);
            expect(m.hasEngine('deltaSync')).toBe(false);
        });
        it('unregisterEngine missing', () => {
            expect(m.unregisterEngine('zzz')).toBe(false);
        });
        it('hasEngine', () => {
            expect(m.hasEngine('deltaSync')).toBe(true);
            expect(m.hasEngine('zzz')).toBe(false);
        });
        it('listEngines', () => {
            const list = m.listEngines();
            expect(list.length).toBe(3);
            expect(list).toContain('deltaSync');
        });
        it('registerEngines batch', () => {
            const n = m.registerEngines({ a: {}, b: {}, c: {} });
            expect(n).toBe(3);
            expect(m.engineCount()).toBe(6);
        });
        it('registerEngines non-object returns 0', () => {
            expect(m.registerEngines(null)).toBe(0);
            expect(m.registerEngines('x')).toBe(0);
        });
    });

    describe('command registry', () => {
        it('registerCommand', () => {
            expect(m.registerCommand('reboot', () => 'rebooted')).toBe(true);
            expect(m.hasCommand('reboot')).toBe(true);
        });
        it('rejects non-function', () => {
            expect(m.registerCommand('x', null)).toBe(false);
            expect(m.registerCommand('x', 'fn')).toBe(false);
        });
        it('unregisterCommand', () => {
            m.registerCommand('x', () => {});
            expect(m.unregisterCommand('x')).toBe(true);
        });
        it('listCommands', () => {
            m.registerCommand('a', () => {});
            m.registerCommand('b', () => {});
            expect(m.listCommands().length).toBe(2);
        });
    });

    describe('dispatch', () => {
        it('routes to registered command', () => {
            m.registerCommand('ping', () => 'pong');
            const r = m.dispatch('ping', { x: 1 });
            expect(r.ok).toBe(true);
            expect(r.result).toBe('pong');
            expect(r.target).toBe('command');
        });
        it('falls back to engine method', () => {
            const r = m.dispatch('changeLog', null);
            expect(r.ok).toBe(true);
            expect(r.result).toBe('changelog');
            expect(r.target).toBe('engine');
        });
        it('no handler returns error', () => {
            const r = m.dispatch('unknown_cmd', null);
            expect(r.ok).toBe(false);
            expect(r.error).toBe('no_handler');
        });
        it('no command returns error', () => {
            const r = m.dispatch('', null);
            expect(r.ok).toBe(false);
        });
        it('command throws caught', () => {
            m.registerCommand('boom', () => { throw new Error('crash'); });
            const r = m.dispatch('boom', null);
            expect(r.ok).toBe(false);
            expect(r.error).toBe('crash');
        });
        it('engine method throws caught', () => {
            m.registerEngine('bad', { bad() { throw new Error('e'); } });
            const r = m.dispatch('bad', null);
            expect(r.ok).toBe(false);
        });
        it('records dispatch history', () => {
            m.registerCommand('a', () => 'ok');
            m.dispatch('a', null);
            m.dispatch('a', null);
            expect(m.dispatches.length).toBe(2);
        });
        it('passes payload to handler', () => {
            let captured = null;
            m.registerCommand('echo', (p) => { captured = p; return 'ok'; });
            m.dispatch('echo', { v: 42 });
            expect(captured.v).toBe(42);
        });
        it('increments stats.dispatched and errors', () => {
            m.registerCommand('ok', () => 'ok');
            m.dispatch('ok', null);
            m.dispatch('zzz', null);
            expect(m.stats.dispatched).toBe(2);
            expect(m.stats.errors).toBe(1);
        });
    });

    describe('phase state machine', () => {
        it('init → syncing allowed', () => {
            expect(m.setPhase('syncing')).toBe(true);
            expect(m.getPhase()).toBe('syncing');
        });
        it('init → stable NOT allowed', () => {
            expect(m.setPhase('stable')).toBe(false);
        });
        it('syncing → stable allowed', () => {
            m.setPhase('syncing');
            expect(m.setPhase('stable')).toBe(true);
        });
        it('stable → draining allowed', () => {
            m.setPhase('syncing');
            m.setPhase('stable');
            expect(m.setPhase('draining')).toBe(true);
        });
        it('draining → shutdown allowed', () => {
            m.setPhase('syncing');
            m.setPhase('draining');
            expect(m.setPhase('shutdown')).toBe(true);
        });
        it('shutdown → anything NOT allowed', () => {
            m.setPhase('shutdown');
            expect(m.setPhase('init')).toBe(false);
            expect(m.setPhase('syncing')).toBe(false);
        });
        it('rejects unknown phase', () => {
            expect(m.setPhase('xxx')).toBe(false);
        });
        it('idempotent same phase', () => {
            expect(m.setPhase('init')).toBe(true);
        });
        it('canTransitionTo', () => {
            expect(m.canTransitionTo('syncing')).toBe(true);
            expect(m.canTransitionTo('stable')).toBe(false);
        });
        it('emits phaseChanged', () => {
            let captured = null;
            m.registerHook('phaseChanged', (e) => { captured = e; });
            m.setPhase('syncing');
            expect(captured.prev).toBe('init');
            expect(captured.phase).toBe('syncing');
        });
    });

    describe('getStatus', () => {
        it('returns full status', () => {
            const s = m.getStatus();
            expect(s.phase).toBe('init');
            expect(s.engines.deltaSync).toBe('ok');
            expect(s.registered).toBe(3);
        });
        it('engine with getStatus uses it', () => {
            m.registerEngine('withStatus', { getStatus: () => 'busy' });
            const s = m.getStatus();
            expect(s.engines.withStatus).toBe('busy');
        });
        it('nullish engine not in getEngine returns null', () => {
            expect(m.getEngine('nullish')).toBeNull();
            expect(m.hasEngine('nullish')).toBe(false);
        });
        it('rejects null instance at register time', () => {
            expect(m.registerEngine('bad', null)).toBe(false);
            expect(m.hasEngine('bad')).toBe(false);
        });
        it('throwing getStatus marked down', () => {
            m.registerEngine('bad', { getStatus: () => { throw new Error('x'); } });
            const s = m.getStatus();
            expect(s.engines.bad).toBe('down');
        });
    });

    describe('shutdown', () => {
        it('calls shutdown on engines that support it', () => {
            const r = m.shutdown();
            expect(r.ok).toBe(true);
            expect(r.shutOk).toContain('deltaSync');
        });
        it('moves to shutdown phase', () => {
            m.shutdown();
            expect(m.getPhase()).toBe('shutdown');
        });
        it('emits shutdown event', () => {
            let captured = null;
            m.registerHook('shutdown', (e) => { captured = e; });
            m.shutdown();
            expect(captured.prev).toBe('init');
        });
        it('skips engines without shutdown method', () => {
            m.registerEngine('noop', { tick() {} });
            const r = m.shutdown();
            expect(r.shutOk).not.toContain('noop');
        });
        it('swallows shutdown errors', () => {
            m.registerEngine('crash', { shutdown() { throw new Error('x'); } });
            expect(() => m.shutdown()).not.toThrow();
        });
    });

    describe('queries', () => {
        it('getDispatches returns copy', () => {
            m.registerCommand('a', () => 'ok');
            m.dispatch('a', null);
            const d = m.getDispatches();
            d.length = 0;
            expect(m.dispatches.length).toBe(1);
        });
        it('getStats aggregate', () => {
            m.registerCommand('a', () => 'ok');
            m.dispatch('a', null);
            const s = m.getStats();
            expect(s.engines).toBe(3);
            expect(s.commands).toBe(1);
            expect(s.phase).toBe('init');
        });
    });

    describe('reset', () => {
        it('clears state', () => {
            m.registerCommand('a', () => {});
            m.dispatch('a', null);
            m.reset();
            expect(m.engines.size).toBe(0);
            expect(m.commands.size).toBe(0);
            expect(m.dispatches.length).toBe(0);
            expect(m.getPhase()).toBe('init');
        });
    });

    describe('hooks', () => {
        it('hook errors swallowed', () => {
            m.registerHook('dispatched', () => { throw new Error('x'); });
            m.registerCommand('a', () => 'ok');
            expect(() => m.dispatch('a', null)).not.toThrow();
        });
    });
});
