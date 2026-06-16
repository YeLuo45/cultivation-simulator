/**
 * SectContract.test.js - 宗门契约系统测试
 * V473 Iteration 5/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectContract } from '../../../systems/ai/SectContract.js';

describe('SectContract', () => {
    let system;
    beforeEach(() => { system = new SectContract(); });

    describe('draftContract', () => {
        it('should draft', () => {
            const { contract } = system.draftContract({ sectId: 's1', party1: 'p1', party2: 'p2' });
            expect(contract.sectId).toBe('s1');
            expect(contract.party1).toBe('p1');
            expect(contract.party2).toBe('p2');
        });

        it('should default terms to empty array', () => {
            const { contract } = system.draftContract({});
            expect(contract.terms).toEqual([]);
        });

        it('should set status to draft', () => {
            const { contract } = system.draftContract({});
            expect(contract.status).toBe('draft');
        });

        it('should default duration from config', () => {
            const { contract } = system.draftContract({});
            expect(contract.duration).toBe(30);
        });

        it('should accept custom duration', () => {
            const { contract } = system.draftContract({ duration: 90 });
            expect(contract.duration).toBe(90);
        });

        it('should generate contractId', () => {
            const { contract } = system.draftContract({});
            expect(contract.contractId).toBeTruthy();
        });

        it('should accept custom terms', () => {
            const { contract } = system.draftContract({ terms: ['t1', 't2'] });
            expect(contract.terms.length).toBe(2);
        });

        it('should trigger contractDrafted hook', () => {
            let called = false;
            system.registerHook('contractDrafted', () => { called = true; });
            system.draftContract({});
            expect(called).toBe(true);
        });
    });

    describe('getContract', () => {
        it('should return contract', () => {
            const { contract } = system.draftContract({});
            expect(system.getContract(contract.contractId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getContract('ghost')).toBeNull(); });
    });

    describe('listContracts', () => {
        it('should list all', () => {
            system.draftContract({});
            system.draftContract({});
            expect(system.listContracts().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listContracts().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.draftContract({ sectId: 's1' });
            system.draftContract({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.draftContract({});
            expect(system.listBySect('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active status', () => {
            const { contract: c1 } = system.draftContract({});
            system.draftContract({});
            c1.status = 'active';
            expect(system.listActive().length).toBe(1);
        });

        it('should return empty when no active', () => {
            system.draftContract({});
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('addTerm', () => {
        it('should add term to terms array', () => {
            const { contract } = system.draftContract({});
            system.addTerm(contract.contractId, 'obey');
            expect(contract.terms.length).toBe(1);
            expect(contract.terms[0]).toBe('obey');
        });

        it('should add multiple terms', () => {
            const { contract } = system.draftContract({});
            system.addTerm(contract.contractId, 't1');
            system.addTerm(contract.contractId, 't2');
            expect(contract.terms.length).toBe(2);
        });

        it('should reject missing contract', () => {
            const result = system.addTerm('ghost', 'x');
            expect(result.error).toBe('CONTRACT_NOT_FOUND');
        });

        it('should trigger termAdded hook', () => {
            const { contract } = system.draftContract({});
            let called = false;
            system.registerHook('termAdded', () => { called = true; });
            system.addTerm(contract.contractId, 't');
            expect(called).toBe(true);
        });
    });

    describe('extendContract', () => {
        it('should extend duration by amount', () => {
            const { contract } = system.draftContract({});
            system.extendContract(contract.contractId, 20);
            expect(contract.duration).toBe(50);
        });

        it('should use default amount of 10', () => {
            const { contract } = system.draftContract({});
            system.extendContract(contract.contractId);
            expect(contract.duration).toBe(40);
        });

        it('should reject missing contract', () => {
            const result = system.extendContract('ghost', 10);
            expect(result.error).toBe('CONTRACT_NOT_FOUND');
        });

        it('should trigger contractExtended hook', () => {
            const { contract } = system.draftContract({});
            let called = false;
            system.registerHook('contractExtended', () => { called = true; });
            system.extendContract(contract.contractId, 10);
            expect(called).toBe(true);
        });
    });

    describe('fulfillContract', () => {
        it('should set status to fulfilled', () => {
            const { contract } = system.draftContract({});
            system.fulfillContract(contract.contractId);
            expect(contract.status).toBe('fulfilled');
        });

        it('should reject missing contract', () => {
            const result = system.fulfillContract('ghost');
            expect(result.error).toBe('CONTRACT_NOT_FOUND');
        });

        it('should trigger contractFulfilled hook', () => {
            const { contract } = system.draftContract({});
            let called = false;
            system.registerHook('contractFulfilled', () => { called = true; });
            system.fulfillContract(contract.contractId);
            expect(called).toBe(true);
        });
    });

    describe('breachContract', () => {
        it('should set status to breached', () => {
            const { contract } = system.draftContract({});
            system.breachContract(contract.contractId);
            expect(contract.status).toBe('breached');
        });

        it('should reject missing contract', () => {
            const result = system.breachContract('ghost');
            expect(result.error).toBe('CONTRACT_NOT_FOUND');
        });

        it('should trigger contractBreached hook', () => {
            const { contract } = system.draftContract({});
            let called = false;
            system.registerHook('contractBreached', () => { called = true; });
            system.breachContract(contract.contractId);
            expect(called).toBe(true);
        });
    });

    describe('calculateContractStrength', () => {
        it('should calculate strength = terms.length * 10 + duration', () => {
            const { contract } = system.draftContract({ duration: 50 });
            system.addTerm(contract.contractId, 't1');
            system.addTerm(contract.contractId, 't2');
            // 2 * 10 + 50 = 70
            expect(system.calculateContractStrength(contract.contractId)).toBe(70);
        });

        it('should calculate with no terms', () => {
            const { contract } = system.draftContract({ duration: 30 });
            // 0 * 10 + 30 = 30
            expect(system.calculateContractStrength(contract.contractId)).toBe(30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateContractStrength('ghost')).toBe(0);
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

        it('should execute default getContract', () => {
            const result = system.executeTool('getContract', { contractId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('contractDrafted', () => count++);
            unregister();
            system.draftContract({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('contractDrafted', () => { throw new Error('x'); });
            expect(() => system.draftContract({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalContracts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalContracts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.draftContract({});
            const json = system.toJSON();
            expect(json.contracts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.draftContract({});
            const json = system.toJSON();
            const newSys = new SectContract();
            newSys.fromJSON(json);
            expect(newSys.contracts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.contractCount).toBe(0);
        });
    });
});
