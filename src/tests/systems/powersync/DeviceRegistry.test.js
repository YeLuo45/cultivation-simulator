/**
 * DeviceRegistry.test.js - 设备注册表测试
 * V1166 Round 44 Iter 9/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { DeviceRegistry, DEVICE_TYPES, CAPABILITY_GROUPS } from '../../../systems/powersync/DeviceRegistry.js';

describe('DeviceRegistry', () => {
    let reg;
    beforeEach(() => { reg = new DeviceRegistry({ onlineTimeoutMs: 5000 }); });

    describe('exports', () => {
        it('should export DEVICE_TYPES', () => {
            expect(DEVICE_TYPES).toContain('mobile');
            expect(DEVICE_TYPES).toContain('desktop');
            expect(DEVICE_TYPES).toContain('server');
        });
        it('should export CAPABILITY_GROUPS', () => {
            expect(CAPABILITY_GROUPS).toContain('storage');
            expect(CAPABILITY_GROUPS).toContain('network');
        });
    });

    describe('constructor', () => {
        it('should initialize empty', () => {
            expect(reg.devices.size).toBe(0);
        });
        it('should accept onlineTimeoutMs', () => {
            expect(reg.config.onlineTimeoutMs).toBe(5000);
        });
    });

    describe('register', () => {
        it('should register a new device', () => {
            const ok = reg.register({ id: 'd1', type: 'mobile', name: 'Phone', capabilities: ['storage'] });
            expect(ok).toBe(true);
            expect(reg.devices.size).toBe(1);
        });
        it('should reject duplicate id', () => {
            reg.register({ id: 'd1', type: 'mobile' });
            const ok = reg.register({ id: 'd1', type: 'mobile' });
            expect(ok).toBe(false);
            expect(reg.stats.duplicates).toBe(1);
        });
        it('should reject invalid id', () => {
            expect(reg.register({ id: '', type: 'mobile' })).toBe(false);
            expect(reg.register({ type: 'mobile' })).toBe(false);
            expect(reg.register(null)).toBe(false);
        });
        it('should default type to web', () => {
            reg.register({ id: 'd1', type: 'mystery' });
            expect(reg.get('d1').type).toBe('web');
        });
        it('should default name to id', () => {
            reg.register({ id: 'd1', type: 'mobile' });
            expect(reg.get('d1').name).toBe('d1');
        });
        it('should default capabilities to []', () => {
            reg.register({ id: 'd1', type: 'mobile' });
            expect(reg.get('d1').capabilities.length).toBe(0);
        });
        it('should copy capabilities array', () => {
            reg.register({ id: 'd1', type: 'mobile', capabilities: ['a', 'b'] });
            const caps = reg.get('d1').capabilities;
            caps.push('c');
            expect(reg.get('d1').capabilities.length).toBe(2);
        });
    });

    describe('heartbeat', () => {
        it('should update lastSeen', async () => {
            reg.register({ id: 'd1', type: 'mobile' });
            const initial = reg.get('d1').lastSeen;
            await new Promise(r => setTimeout(r, 10));
            reg.heartbeat('d1');
            expect(reg.get('d1').lastSeen).toBeGreaterThan(initial);
        });
        it('should return false for unknown', () => {
            expect(reg.heartbeat('nope')).toBe(false);
        });
        it('should accept custom ts', () => {
            reg.register({ id: 'd1', type: 'mobile' });
            reg.heartbeat('d1', 5000);
            expect(reg.get('d1').lastSeen).toBe(5000);
        });
    });

    describe('capabilities', () => {
        beforeEach(() => {
            reg.register({ id: 'd1', type: 'mobile', capabilities: ['a'] });
        });
        it('updateCapabilities replaces list', () => {
            expect(reg.updateCapabilities('d1', ['x', 'y'])).toBe(true);
            expect(reg.get('d1').capabilities).toEqual(['x', 'y']);
        });
        it('updateCapabilities rejects non-array', () => {
            expect(reg.updateCapabilities('d1', 'string')).toBe(false);
        });
        it('updateCapabilities returns false for unknown', () => {
            expect(reg.updateCapabilities('nope', ['x'])).toBe(false);
        });
        it('addCapability adds new', () => {
            expect(reg.addCapability('d1', 'b')).toBe(true);
            expect(reg.get('d1').capabilities).toContain('b');
        });
        it('addCapability ignores duplicate', () => {
            expect(reg.addCapability('d1', 'a')).toBe(false);
        });
        it('addCapability invalid cap', () => {
            expect(reg.addCapability('d1', '')).toBe(false);
            expect(reg.addCapability('d1', null)).toBe(false);
        });
        it('addCapability for unknown id', () => {
            expect(reg.addCapability('nope', 'a')).toBe(false);
        });
        it('removeCapability removes existing', () => {
            expect(reg.removeCapability('d1', 'a')).toBe(true);
            expect(reg.get('d1').capabilities.length).toBe(0);
        });
        it('removeCapability returns false for missing', () => {
            expect(reg.removeCapability('d1', 'z')).toBe(false);
        });
        it('removeCapability returns false for unknown id', () => {
            expect(reg.removeCapability('nope', 'a')).toBe(false);
        });
    });

    describe('deregister', () => {
        it('should remove device', () => {
            reg.register({ id: 'd1', type: 'mobile' });
            expect(reg.deregister('d1')).toBe(true);
            expect(reg.get('d1')).toBeNull();
        });
        it('should return false for unknown', () => {
            expect(reg.deregister('nope')).toBe(false);
        });
        it('should track deregistered stat', () => {
            reg.register({ id: 'd1', type: 'mobile' });
            reg.deregister('d1');
            expect(reg.stats.deregistered).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            reg.register({ id: 'a', type: 'mobile' });
            reg.register({ id: 'b', type: 'desktop' });
            reg.register({ id: 'c', type: 'mobile' });
            expect(reg.listByType('mobile').length).toBe(2);
            expect(reg.listByType('desktop').length).toBe(1);
        });
        it('should return empty for unknown type', () => {
            expect(reg.listByType('bogus').length).toBe(0);
        });
    });

    describe('listWithCapability', () => {
        it('should filter by capability', () => {
            reg.register({ id: 'a', type: 'mobile', capabilities: ['storage'] });
            reg.register({ id: 'b', type: 'mobile', capabilities: ['network'] });
            expect(reg.listWithCapability('storage').length).toBe(1);
        });
    });

    describe('online status', () => {
        it('listOnline filters by timeout', () => {
            reg.register({ id: 'a', type: 'mobile' });
            reg.heartbeat('a', 1000);
            reg.register({ id: 'b', type: 'mobile' });
            reg.heartbeat('b', Date.now());
            const online = reg.listOnline(5000, Date.now());
            expect(online.length).toBe(1);
        });
        it('isOnline true for fresh', () => {
            reg.register({ id: 'd1', type: 'mobile' });
            expect(reg.isOnline('d1')).toBe(true);
        });
        it('isOnline false for stale', () => {
            reg.register({ id: 'd1', type: 'mobile' });
            const future = Date.now() + 10000;
            expect(reg.isOnline('d1', 5000, future)).toBe(false);
        });
        it('isOnline false for unknown', () => {
            expect(reg.isOnline('nope')).toBe(false);
        });
    });

    describe('stats', () => {
        it('getStats counts by type', () => {
            reg.register({ id: 'a', type: 'mobile' });
            reg.register({ id: 'b', type: 'mobile' });
            reg.register({ id: 'c', type: 'desktop' });
            const s = reg.getStats();
            expect(s.total).toBe(3);
            expect(s.byType.mobile).toBe(2);
            expect(s.byType.desktop).toBe(1);
        });
    });

    describe('hooks', () => {
        it('should emit registered', () => {
            let captured = null;
            reg.registerHook('registered', (p) => { captured = p; });
            reg.register({ id: 'd1', type: 'mobile' });
            expect(captured.id).toBe('d1');
        });
        it('should emit deregistered', () => {
            let fired = false;
            reg.registerHook('deregistered', () => { fired = true; });
            reg.register({ id: 'd1', type: 'mobile' });
            reg.deregister('d1');
            expect(fired).toBe(true);
        });
        it('should emit duplicate', () => {
            let fired = false;
            reg.registerHook('duplicate', () => { fired = true; });
            reg.register({ id: 'd1', type: 'mobile' });
            reg.register({ id: 'd1', type: 'mobile' });
            expect(fired).toBe(true);
        });
        it('should handle hook errors silently', () => {
            reg.registerHook('registered', () => { throw new Error('boom'); });
            expect(() => reg.register({ id: 'd1', type: 'mobile' })).not.toThrow();
        });
    });
});
