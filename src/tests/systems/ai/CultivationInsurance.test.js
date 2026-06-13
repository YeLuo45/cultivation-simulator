/**
 * CultivationInsurance.test.js - 修真保险测试
 * V542 Iteration 5/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationInsurance } from '../../../systems/ai/CultivationInsurance.js';

describe('CultivationInsurance', () => {
    let system;
    beforeEach(() => { system = new CultivationInsurance(); });

    describe('offerInsurance', () => {
        it('should offer an insurance with default values', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1', name: 'Celestial Life' });
            expect(insurance.insuranceId).toBeDefined();
            expect(insurance.insurerId).toBe('i1');
            expect(insurance.name).toBe('Celestial Life');
            expect(insurance.type).toBe('life');
            expect(insurance.coverage).toBe(100);
            expect(insurance.claims).toEqual([]);
            expect(insurance.level).toBe(1);
            expect(insurance.status).toBe('offered');
        });

        it('should accept tripping type', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1', type: 'tripping' });
            expect(insurance.type).toBe('tripping');
        });

        it('should accept treasure type', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1', type: 'treasure' });
            expect(insurance.type).toBe('treasure');
        });

        it('should respect custom coverage', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1', coverage: 500 });
            expect(insurance.coverage).toBe(500);
        });

        it('should accept custom insuranceId', () => {
            const { insurance } = system.offerInsurance({ insuranceId: 'ins_custom_1', insurerId: 'i1' });
            expect(insurance.insuranceId).toBe('ins_custom_1');
        });

        it('should increment totalInsurances', () => {
            system.offerInsurance({ insurerId: 'i1' });
            expect(system.stats.totalInsurances).toBe(1);
        });

        it('should trigger insuranceOffered hook', () => {
            let called = false;
            system.registerHook('insuranceOffered', () => { called = true; });
            system.offerInsurance({ insurerId: 'i1' });
            expect(called).toBe(true);
        });
    });

    describe('getInsurance', () => {
        it('should return insurance', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            expect(system.getInsurance(insurance.insuranceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getInsurance('ghost')).toBeNull(); });
    });

    describe('listInsurances', () => {
        it('should list all', () => {
            system.offerInsurance({ insurerId: 'i1' });
            system.offerInsurance({ insurerId: 'i2' });
            expect(system.listInsurances().length).toBe(2);
        });

        it('should return empty list when no insurances', () => {
            expect(system.listInsurances().length).toBe(0);
        });
    });

    describe('listByInsurer', () => {
        it('should filter by insurer', () => {
            system.offerInsurance({ insurerId: 'i1' });
            system.offerInsurance({ insurerId: 'i2' });
            system.offerInsurance({ insurerId: 'i1' });
            expect(system.listByInsurer('i1').length).toBe(2);
            expect(system.listByInsurer('i2').length).toBe(1);
        });

        it('should return empty for unknown insurer', () => {
            system.offerInsurance({ insurerId: 'i1' });
            expect(system.listByInsurer('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should return only active insurances', () => {
            const { insurance: i1 } = system.offerInsurance({ insurerId: 'i1' });
            system.offerInsurance({ insurerId: 'i1' });
            system.increaseCoverage(i1.insuranceId, 1000);
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].status).toBe('active');
        });
    });

    describe('addClaim', () => {
        it('should add a claim', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            const result = system.addClaim(insurance.insuranceId, { claimantId: 'c1', amount: 200 });
            expect(result.success).toBe(true);
            expect(insurance.claims.length).toBe(1);
            expect(insurance.claims[0].amount).toBe(200);
        });

        it('should use default reason', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            const { claim } = system.addClaim(insurance.insuranceId, { claimantId: 'c1', amount: 100 });
            expect(claim.reason).toBe('unspecified');
        });

        it('should accept custom reason', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            const { claim } = system.addClaim(insurance.insuranceId, { claimantId: 'c1', amount: 100, reason: 'tribulation' });
            expect(claim.reason).toBe('tribulation');
        });

        it('should accept custom claimId', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            const { claim } = system.addClaim(insurance.insuranceId, { claimId: 'clm_custom_1', claimantId: 'c1' });
            expect(claim.claimId).toBe('clm_custom_1');
        });

        it('should reject missing insurance', () => {
            const result = system.addClaim('ghost', { claimantId: 'c1' });
            expect(result.error).toBe('INSURANCE_NOT_FOUND');
        });

        it('should trigger claimAdded hook', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            let called = false;
            system.registerHook('claimAdded', () => { called = true; });
            system.addClaim(insurance.insuranceId, { claimantId: 'c1' });
            expect(called).toBe(true);
        });

        it('should increment totalClaims', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            system.addClaim(insurance.insuranceId, { claimantId: 'c1' });
            expect(system.stats.totalClaims).toBe(1);
        });
    });

    describe('increaseCoverage', () => {
        it('should increase by default amount', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            system.increaseCoverage(insurance.insuranceId);
            expect(insurance.coverage).toBe(105);
        });

        it('should increase by custom amount', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            system.increaseCoverage(insurance.insuranceId, 50);
            expect(insurance.coverage).toBe(150);
        });

        it('should reject missing insurance', () => {
            const result = system.increaseCoverage('ghost', 10);
            expect(result.error).toBe('INSURANCE_NOT_FOUND');
        });

        it('should trigger coverageIncreased hook', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            let called = false;
            system.registerHook('coverageIncreased', () => { called = true; });
            system.increaseCoverage(insurance.insuranceId, 10);
            expect(called).toBe(true);
        });

        it('should mark insurance as active at high coverage', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            system.increaseCoverage(insurance.insuranceId, 1000);
            expect(insurance.status).toBe('active');
        });
    });

    describe('levelUpInsurance', () => {
        it('should level up', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            system.levelUpInsurance(insurance.insuranceId);
            expect(insurance.level).toBe(2);
        });

        it('should reject missing insurance', () => {
            const result = system.levelUpInsurance('ghost');
            expect(result.error).toBe('INSURANCE_NOT_FOUND');
        });

        it('should trigger insuranceLeveledUp hook', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            let called = false;
            system.registerHook('insuranceLeveledUp', () => { called = true; });
            system.levelUpInsurance(insurance.insuranceId);
            expect(called).toBe(true);
        });
    });

    describe('expireInsurance', () => {
        it('should expire insurance', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            system.expireInsurance(insurance.insuranceId);
            expect(insurance.status).toBe('expired');
        });

        it('should reject missing insurance', () => {
            const result = system.expireInsurance('ghost');
            expect(result.error).toBe('INSURANCE_NOT_FOUND');
        });

        it('should trigger insuranceExpired hook', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            let called = false;
            system.registerHook('insuranceExpired', () => { called = true; });
            system.expireInsurance(insurance.insuranceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateInsuranceValue', () => {
        it('should calculate for new insurance', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            // level=1, coverage=100, claims=0 -> 100 + 200 + 0 = 300
            expect(system.calculateInsuranceValue(insurance.insuranceId)).toBe(300);
        });

        it('should factor in claims', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            system.addClaim(insurance.insuranceId, { claimantId: 'c1', amount: 100 });
            system.addClaim(insurance.insuranceId, { claimantId: 'c2', amount: 200 });
            // level=1, coverage=100, claims=2 -> 100 + 200 + 60 = 360
            expect(system.calculateInsuranceValue(insurance.insuranceId)).toBe(360);
        });

        it('should factor in level', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1' });
            system.levelUpInsurance(insurance.insuranceId);
            system.levelUpInsurance(insurance.insuranceId);
            // level=3, coverage=100, claims=0 -> 300 + 200 + 0 = 500
            expect(system.calculateInsuranceValue(insurance.insuranceId)).toBe(500);
        });

        it('should factor in coverage', () => {
            const { insurance } = system.offerInsurance({ insurerId: 'i1', coverage: 200 });
            // level=1, coverage=200, claims=0 -> 100 + 400 + 0 = 500
            expect(system.calculateInsuranceValue(insurance.insuranceId)).toBe(500);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateInsuranceValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getInsurance', () => {
            const result = system.executeTool('getInsurance', { insuranceId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle missing context with default', () => {
            system.registerTool('noctx', (ctx) => ctx);
            const result = system.executeTool('noctx');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('insuranceOffered', () => count++);
            unregister();
            system.offerInsurance({ insurerId: 'i1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('insuranceOffered', () => { throw new Error('x'); });
            expect(() => system.offerInsurance({ insurerId: 'i1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient insurances', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.offerInsurance({ insurerId: `i${i}` });
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.offerInsurance({ insurerId: `i${i}` });
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.offerInsurance({ insurerId: 'i1' });
            const json = system.toJSON();
            expect(json.insurances.length).toBe(1);
            expect(json.stats.totalInsurances).toBe(1);
        });

        it('should deserialize', () => {
            system.offerInsurance({ insurerId: 'i1' });
            const json = system.toJSON();
            const newSys = new CultivationInsurance();
            newSys.fromJSON(json);
            expect(newSys.insurances.size).toBe(1);
            expect(newSys.stats.totalInsurances).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.insuranceCount).toBe(0);
            expect(stats.totalInsurances).toBe(0);
        });

        it('should reflect added insurances', () => {
            system.offerInsurance({ insurerId: 'i1' });
            expect(system.getStats().insuranceCount).toBe(1);
        });
    });
});
