/**
 * CultivationGateway.test.js - 修真门户系统测试
 * V752 Iteration 15/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGateway } from '../../../systems/ai/CultivationGateway.js';

describe('CultivationGateway', () => {
    let system;
    beforeEach(() => { system = new CultivationGateway(); });

    describe('recruitGateway', () => {
        it('should recruit gateway', () => {
            const { gateway } = system.recruitGateway({ masterId: 'm1', name: 'Celestial Gateway', type: 'divine' });
            expect(gateway.masterId).toBe('m1');
            expect(gateway.name).toBe('Celestial Gateway');
            expect(gateway.type).toBe('divine');
        });

        it('should default type to small', () => {
            const { gateway } = system.recruitGateway({});
            expect(gateway.type).toBe('small');
        });

        it('should default name to Unnamed Gateway', () => {
            const { gateway } = system.recruitGateway({});
            expect(gateway.name).toBe('Unnamed Gateway');
        });

        it('should default potency to basePotency', () => {
            const { gateway } = system.recruitGateway({});
            expect(gateway.potency).toBe(20);
        });

        it('should start at level 1', () => {
            const { gateway } = system.recruitGateway({});
            expect(gateway.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { gateway } = system.recruitGateway({});
            expect(gateway.status).toBe('novice');
        });

        it('should start with empty seals', () => {
            const { gateway } = system.recruitGateway({});
            expect(gateway.seals).toEqual([]);
        });

        it('should generate gatewayId', () => {
            const { gateway } = system.recruitGateway({});
            expect(gateway.gatewayId).toBeDefined();
            expect(typeof gateway.gatewayId).toBe('string');
        });

        it('should accept custom gatewayId', () => {
            const { gateway } = system.recruitGateway({ gatewayId: 'my-gateway' });
            expect(gateway.gatewayId).toBe('my-gateway');
        });

        it('should support all types', () => {
            const { gateway: g1 } = system.recruitGateway({ type: 'small' });
            const { gateway: g2 } = system.recruitGateway({ type: 'grand' });
            const { gateway: g3 } = system.recruitGateway({ type: 'divine' });
            expect(g1.type).toBe('small');
            expect(g2.type).toBe('grand');
            expect(g3.type).toBe('divine');
        });

        it('should trigger gatewayRecruited hook', () => {
            let called = false;
            system.registerHook('gatewayRecruited', () => { called = true; });
            system.recruitGateway({});
            expect(called).toBe(true);
        });
    });

    describe('getGateway', () => {
        it('should return gateway', () => {
            const { gateway } = system.recruitGateway({});
            expect(system.getGateway(gateway.gatewayId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGateway('ghost')).toBeNull(); });
    });

    describe('listGateways', () => {
        it('should list all', () => {
            system.recruitGateway({});
            system.recruitGateway({});
            expect(system.listGateways().length).toBe(2);
        });

        it('should return empty when no gateways', () => {
            expect(system.listGateways().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitGateway({ masterId: 'm1' });
            system.recruitGateway({ masterId: 'm2' });
            system.recruitGateway({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitGateway({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { gateway: g1 } = system.recruitGateway({});
            const { gateway: g2 } = system.recruitGateway({});
            system.legendGateway(g1.gatewayId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].gatewayId).toBe(g1.gatewayId);
        });

        it('should return empty when none legendary', () => {
            system.recruitGateway({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSeal', () => {
        it('should add seal', () => {
            const { gateway } = system.recruitGateway({});
            system.addSeal(gateway.gatewayId, 'fire-seal');
            expect(gateway.seals).toContain('fire-seal');
            expect(gateway.seals.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addSeal('ghost', 'seal');
            expect(result.error).toBe('GATEWAY_NOT_FOUND');
        });

        it('should trigger sealAdded hook', () => {
            const { gateway } = system.recruitGateway({});
            let called = false;
            system.registerHook('sealAdded', () => { called = true; });
            system.addSeal(gateway.gatewayId, 'seal');
            expect(called).toBe(true);
        });

        it('should add multiple seals', () => {
            const { gateway } = system.recruitGateway({});
            system.addSeal(gateway.gatewayId, 'seal1');
            system.addSeal(gateway.gatewayId, 'seal2');
            expect(gateway.seals.length).toBe(2);
        });
    });

    describe('raisePotency', () => {
        it('should raise potency', () => {
            const { gateway } = system.recruitGateway({});
            system.raisePotency(gateway.gatewayId, 10);
            expect(gateway.potency).toBe(30);
        });

        it('should default amount to 5', () => {
            const { gateway } = system.recruitGateway({});
            system.raisePotency(gateway.gatewayId);
            expect(gateway.potency).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raisePotency('ghost', 10);
            expect(result.error).toBe('GATEWAY_NOT_FOUND');
        });

        it('should trigger potencyRaised hook', () => {
            const { gateway } = system.recruitGateway({});
            let called = false;
            system.registerHook('potencyRaised', () => { called = true; });
            system.raisePotency(gateway.gatewayId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGateway', () => {
        it('should level up', () => {
            const { gateway } = system.recruitGateway({});
            system.levelUpGateway(gateway.gatewayId);
            expect(gateway.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpGateway('ghost');
            expect(result.error).toBe('GATEWAY_NOT_FOUND');
        });

        it('should trigger gatewayLeveledUp hook', () => {
            const { gateway } = system.recruitGateway({});
            let called = false;
            system.registerHook('gatewayLeveledUp', () => { called = true; });
            system.levelUpGateway(gateway.gatewayId);
            expect(called).toBe(true);
        });
    });

    describe('legendGateway', () => {
        it('should set status to legendary', () => {
            const { gateway } = system.recruitGateway({});
            system.legendGateway(gateway.gatewayId);
            expect(gateway.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendGateway('ghost');
            expect(result.error).toBe('GATEWAY_NOT_FOUND');
        });

        it('should trigger gatewayLegendized hook', () => {
            const { gateway } = system.recruitGateway({});
            let called = false;
            system.registerHook('gatewayLegendized', () => { called = true; });
            system.legendGateway(gateway.gatewayId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitGateway({ type: 'small' });
            system.recruitGateway({ type: 'grand' });
            system.recruitGateway({ type: 'divine' });
            expect(system.listByType('grand').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitGateway({ type: 'small' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran gateways', () => {
            system.recruitGateway({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateGatewayValue', () => {
        it('should calculate for default gateway', () => {
            const { gateway } = system.recruitGateway({});
            // level 1 * 100 + potency 20 * 2 + 0 seals * 30 = 100 + 40 + 0 = 140
            expect(system.calculateGatewayValue(gateway.gatewayId)).toBe(140);
        });

        it('should incorporate level, potency, and seals', () => {
            const { gateway } = system.recruitGateway({});
            system.levelUpGateway(gateway.gatewayId); // level 2
            system.raisePotency(gateway.gatewayId, 10); // potency 30
            system.addSeal(gateway.gatewayId, 'seal1'); // 1 seal
            system.addSeal(gateway.gatewayId, 'seal2'); // 2 seals
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateGatewayValue(gateway.gatewayId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGatewayValue('ghost')).toBe(0);
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

        it('should execute default getGateway', () => {
            const result = system.executeTool('getGateway', { gatewayId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('gatewayRecruited', () => count++);
            unregister();
            system.recruitGateway({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('gatewayRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGateway({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGateways = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGateways = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitGateway({});
            const json = system.toJSON();
            expect(json.gateways.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitGateway({});
            const json = system.toJSON();
            const newSys = new CultivationGateway();
            newSys.fromJSON(json);
            expect(newSys.gateways.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.gatewayCount).toBe(0);
        });
    });
});
