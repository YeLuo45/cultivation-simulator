/**
 * CultivationFederation.test.js - 修真联邦系统测试
 * V556 Iteration 19/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFederation } from '../../../systems/ai/CultivationFederation.js';

describe('CultivationFederation', () => {
    let system;
    beforeEach(() => { system = new CultivationFederation(); });

    describe('openFederation', () => {
        it('should open', () => {
            const { federation } = system.openFederation({ founderId: 'f1', name: '天机联邦' });
            expect(federation.founderId).toBe('f1');
            expect(federation.name).toBe('天机联邦');
        });

        it('should default members to empty array', () => {
            const { federation } = system.openFederation({});
            expect(federation.members).toEqual([]);
        });

        it('should set status to forming', () => {
            const { federation } = system.openFederation({});
            expect(federation.status).toBe('forming');
        });

        it('should default power from config', () => {
            const { federation } = system.openFederation({});
            expect(federation.power).toBe(20);
        });

        it('should accept custom power', () => {
            const { federation } = system.openFederation({ power: 80 });
            expect(federation.power).toBe(80);
        });

        it('should generate federationId', () => {
            const { federation } = system.openFederation({});
            expect(federation.federationId).toBeTruthy();
        });

        it('should accept custom members', () => {
            const { federation } = system.openFederation({ members: ['m1', 'm2', 'm3'] });
            expect(federation.members.length).toBe(3);
        });

        it('should default type to alliance', () => {
            const { federation } = system.openFederation({});
            expect(federation.type).toBe('alliance');
        });

        it('should accept custom type noble', () => {
            const { federation } = system.openFederation({ type: 'noble' });
            expect(federation.type).toBe('noble');
        });

        it('should accept custom type republic', () => {
            const { federation } = system.openFederation({ type: 'republic' });
            expect(federation.type).toBe('republic');
        });

        it('should default level to 1', () => {
            const { federation } = system.openFederation({});
            expect(federation.level).toBe(1);
        });

        it('should trigger federationOpened hook', () => {
            let called = false;
            system.registerHook('federationOpened', () => { called = true; });
            system.openFederation({});
            expect(called).toBe(true);
        });
    });

    describe('getFederation', () => {
        it('should return federation', () => {
            const { federation } = system.openFederation({});
            expect(system.getFederation(federation.federationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFederation('ghost')).toBeNull(); });
    });

    describe('listFederations', () => {
        it('should list all', () => {
            system.openFederation({});
            system.openFederation({});
            system.openFederation({});
            expect(system.listFederations().length).toBe(3);
        });

        it('should return empty initially', () => {
            expect(system.listFederations().length).toBe(0);
        });
    });

    describe('listByFounder', () => {
        it('should filter by founder', () => {
            system.openFederation({ founderId: 'f1' });
            system.openFederation({ founderId: 'f2' });
            system.openFederation({ founderId: 'f1' });
            expect(system.listByFounder('f1').length).toBe(2);
        });

        it('should return empty for unknown founder', () => {
            system.openFederation({});
            expect(system.listByFounder('ghost').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should filter stable status', () => {
            const { federation: f1 } = system.openFederation({ members: ['m1'] });
            const { federation: f2 } = system.openFederation({});
            system.increasePower(f1.federationId, 5); // f1 becomes stable
            f2.status = 'forming';
            expect(system.listStable().length).toBe(1);
        });

        it('should include eternal status', () => {
            const { federation } = system.openFederation({ members: ['m1'] });
            system.increasePower(federation.federationId, 5);
            system.eternizeFederation(federation.federationId);
            expect(system.listStable().length).toBe(1);
        });

        it('should return empty when no stable', () => {
            system.openFederation({});
            expect(system.listStable().length).toBe(0);
        });
    });

    describe('addMember', () => {
        it('should add member to members array', () => {
            const { federation } = system.openFederation({});
            system.addMember(federation.federationId, 'm1');
            expect(federation.members.length).toBe(1);
            expect(federation.members[0]).toBe('m1');
        });

        it('should add multiple members', () => {
            const { federation } = system.openFederation({});
            system.addMember(federation.federationId, 'm1');
            system.addMember(federation.federationId, 'm2');
            system.addMember(federation.federationId, 'm3');
            expect(federation.members.length).toBe(3);
        });

        it('should reject missing federation', () => {
            const result = system.addMember('ghost', 'm1');
            expect(result.error).toBe('FEDERATION_NOT_FOUND');
        });

        it('should trigger memberAdded hook', () => {
            const { federation } = system.openFederation({});
            let called = false;
            system.registerHook('memberAdded', () => { called = true; });
            system.addMember(federation.federationId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('increasePower', () => {
        it('should increase power by amount', () => {
            const { federation } = system.openFederation({});
            system.increasePower(federation.federationId, 30);
            expect(federation.power).toBe(50);
        });

        it('should use default amount of 5', () => {
            const { federation } = system.openFederation({});
            system.increasePower(federation.federationId);
            expect(federation.power).toBe(25);
        });

        it('should set status to stable when members exist', () => {
            const { federation } = system.openFederation({ members: ['m1'] });
            system.increasePower(federation.federationId, 5);
            expect(federation.status).toBe('stable');
        });

        it('should not change status if no members', () => {
            const { federation } = system.openFederation({});
            system.increasePower(federation.federationId, 5);
            expect(federation.status).toBe('forming');
        });

        it('should reject missing federation', () => {
            const result = system.increasePower('ghost', 10);
            expect(result.error).toBe('FEDERATION_NOT_FOUND');
        });

        it('should trigger powerIncreased hook', () => {
            const { federation } = system.openFederation({});
            let called = false;
            system.registerHook('powerIncreased', () => { called = true; });
            system.increasePower(federation.federationId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFederation', () => {
        it('should increment level by 1', () => {
            const { federation } = system.openFederation({});
            system.levelUpFederation(federation.federationId);
            expect(federation.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { federation } = system.openFederation({});
            system.levelUpFederation(federation.federationId);
            system.levelUpFederation(federation.federationId);
            system.levelUpFederation(federation.federationId);
            expect(federation.level).toBe(4);
        });

        it('should reject missing federation', () => {
            const result = system.levelUpFederation('ghost');
            expect(result.error).toBe('FEDERATION_NOT_FOUND');
        });

        it('should trigger federationLeveledUp hook', () => {
            const { federation } = system.openFederation({});
            let called = false;
            system.registerHook('federationLeveledUp', () => { called = true; });
            system.levelUpFederation(federation.federationId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeFederation', () => {
        it('should set status to eternal', () => {
            const { federation } = system.openFederation({});
            system.eternizeFederation(federation.federationId);
            expect(federation.status).toBe('eternal');
        });

        it('should reject missing federation', () => {
            const result = system.eternizeFederation('ghost');
            expect(result.error).toBe('FEDERATION_NOT_FOUND');
        });

        it('should trigger federationEternalized hook', () => {
            const { federation } = system.openFederation({});
            let called = false;
            system.registerHook('federationEternalized', () => { called = true; });
            system.eternizeFederation(federation.federationId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFederationPower', () => {
        it('should calculate power = level * 100 + power * 2 + members.length * 30', () => {
            const { federation } = system.openFederation({ power: 20, members: ['m1', 'm2'] });
            system.levelUpFederation(federation.federationId); // level=2
            // 2 * 100 + 20 * 2 + 2 * 30 = 200 + 40 + 60 = 300
            expect(system.calculateFederationPower(federation.federationId)).toBe(300);
        });

        it('should calculate with no members', () => {
            const { federation } = system.openFederation({ power: 20 });
            // 1 * 100 + 20 * 2 + 0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateFederationPower(federation.federationId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFederationPower('ghost')).toBe(0);
        });

        it('should increase power when members added', () => {
            const { federation } = system.openFederation({ power: 20 });
            const before = system.calculateFederationPower(federation.federationId);
            system.addMember(federation.federationId, 'm1');
            const after = system.calculateFederationPower(federation.federationId);
            expect(after - before).toBe(30);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getFederation', () => {
            const result = system.executeTool('getFederation', { federationId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle missing context gracefully', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('federationOpened', () => count++);
            unregister();
            system.openFederation({});
            expect(count).toBe(0);
        });

        it('should handle unregister when handler not in array', () => {
            const handler = () => {};
            const unregister = system.registerHook('federationOpened', handler);
            // Manually remove handler to force idx === -1 branch
            system.hooks.get('federationOpened').splice(0, 1);
            expect(() => unregister()).not.toThrow();
        });

        it('should handle unregister when event map entry missing', () => {
            const handler = () => {};
            const unregister = system.registerHook('federationOpened', handler);
            // Remove the event entry entirely
            system.hooks.delete('federationOpened');
            expect(() => unregister()).not.toThrow();
        });

        it('should handle errors silently', () => {
            system.registerHook('federationOpened', () => { throw new Error('x'); });
            expect(() => system.openFederation({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFederations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFederations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openFederation({});
            const json = system.toJSON();
            expect(json.federations.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openFederation({});
            const json = system.toJSON();
            const newSys = new CultivationFederation();
            newSys.fromJSON(json);
            expect(newSys.federations.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.federationCount).toBe(0);
        });
    });
});
