/**
 * CultivationSeal.test.js - 修真封印系统测试
 * V758 Iteration 21/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSeal } from '../../../systems/ai/CultivationSeal.js';

describe('CultivationSeal', () => {
    let system;
    beforeEach(() => { system = new CultivationSeal(); });

    describe('recruitSeal', () => {
        it('should recruit seal', () => {
            const { seal } = system.recruitSeal({ masterId: 'm1', name: 'Heaven Seal', type: 'sacred' });
            expect(seal.masterId).toBe('m1');
            expect(seal.name).toBe('Heaven Seal');
            expect(seal.type).toBe('sacred');
        });

        it('should default type to binding', () => {
            const { seal } = system.recruitSeal({});
            expect(seal.type).toBe('binding');
        });

        it('should default name to Unnamed Seal', () => {
            const { seal } = system.recruitSeal({});
            expect(seal.name).toBe('Unnamed Seal');
        });

        it('should default potency to basePotency', () => {
            const { seal } = system.recruitSeal({});
            expect(seal.potency).toBe(20);
        });

        it('should start at level 1', () => {
            const { seal } = system.recruitSeal({});
            expect(seal.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { seal } = system.recruitSeal({});
            expect(seal.status).toBe('novice');
        });

        it('should start with empty chains', () => {
            const { seal } = system.recruitSeal({});
            expect(seal.chains).toEqual([]);
        });

        it('should generate sealId', () => {
            const { seal } = system.recruitSeal({});
            expect(seal.sealId).toBeDefined();
            expect(typeof seal.sealId).toBe('string');
        });

        it('should accept custom sealId', () => {
            const { seal } = system.recruitSeal({ sealId: 'my-seal' });
            expect(seal.sealId).toBe('my-seal');
        });

        it('should support all types', () => {
            const { seal: s1 } = system.recruitSeal({ type: 'binding' });
            const { seal: s2 } = system.recruitSeal({ type: 'sacred' });
            const { seal: s3 } = system.recruitSeal({ type: 'cursed' });
            expect(s1.type).toBe('binding');
            expect(s2.type).toBe('sacred');
            expect(s3.type).toBe('cursed');
        });

        it('should trigger sealRecruited hook', () => {
            let called = false;
            system.registerHook('sealRecruited', () => { called = true; });
            system.recruitSeal({});
            expect(called).toBe(true);
        });
    });

    describe('getSeal', () => {
        it('should return seal', () => {
            const { seal } = system.recruitSeal({});
            expect(system.getSeal(seal.sealId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSeal('ghost')).toBeNull(); });
    });

    describe('listSeals', () => {
        it('should list all', () => {
            system.recruitSeal({});
            system.recruitSeal({});
            expect(system.listSeals().length).toBe(2);
        });

        it('should return empty when no seals', () => {
            expect(system.listSeals().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSeal({ masterId: 'm1' });
            system.recruitSeal({ masterId: 'm2' });
            system.recruitSeal({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitSeal({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { seal: s1 } = system.recruitSeal({});
            const { seal: s2 } = system.recruitSeal({});
            system.legendSeal(s1.sealId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].sealId).toBe(s1.sealId);
        });

        it('should return empty when none legendary', () => {
            system.recruitSeal({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addChain', () => {
        it('should add chain', () => {
            const { seal } = system.recruitSeal({});
            system.addChain(seal.sealId, 'dragon-chain');
            expect(seal.chains).toContain('dragon-chain');
            expect(seal.chains.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addChain('ghost', 'chain');
            expect(result.error).toBe('SEAL_NOT_FOUND');
        });

        it('should trigger chainAdded hook', () => {
            const { seal } = system.recruitSeal({});
            let called = false;
            system.registerHook('chainAdded', () => { called = true; });
            system.addChain(seal.sealId, 'chain');
            expect(called).toBe(true);
        });

        it('should add multiple chains', () => {
            const { seal } = system.recruitSeal({});
            system.addChain(seal.sealId, 'chain1');
            system.addChain(seal.sealId, 'chain2');
            expect(seal.chains.length).toBe(2);
        });
    });

    describe('raisePotency', () => {
        it('should raise potency', () => {
            const { seal } = system.recruitSeal({});
            system.raisePotency(seal.sealId, 10);
            expect(seal.potency).toBe(30);
        });

        it('should default amount to 5', () => {
            const { seal } = system.recruitSeal({});
            system.raisePotency(seal.sealId);
            expect(seal.potency).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raisePotency('ghost', 10);
            expect(result.error).toBe('SEAL_NOT_FOUND');
        });

        it('should trigger potencyRaised hook', () => {
            const { seal } = system.recruitSeal({});
            let called = false;
            system.registerHook('potencyRaised', () => { called = true; });
            system.raisePotency(seal.sealId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSeal', () => {
        it('should level up', () => {
            const { seal } = system.recruitSeal({});
            system.levelUpSeal(seal.sealId);
            expect(seal.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSeal('ghost');
            expect(result.error).toBe('SEAL_NOT_FOUND');
        });

        it('should trigger sealLeveledUp hook', () => {
            const { seal } = system.recruitSeal({});
            let called = false;
            system.registerHook('sealLeveledUp', () => { called = true; });
            system.levelUpSeal(seal.sealId);
            expect(called).toBe(true);
        });
    });

    describe('legendSeal', () => {
        it('should set status to legendary', () => {
            const { seal } = system.recruitSeal({});
            system.legendSeal(seal.sealId);
            expect(seal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSeal('ghost');
            expect(result.error).toBe('SEAL_NOT_FOUND');
        });

        it('should trigger sealLegendized hook', () => {
            const { seal } = system.recruitSeal({});
            let called = false;
            system.registerHook('sealLegendized', () => { called = true; });
            system.legendSeal(seal.sealId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitSeal({ type: 'binding' });
            system.recruitSeal({ type: 'sacred' });
            system.recruitSeal({ type: 'cursed' });
            expect(system.listByType('sacred').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitSeal({ type: 'binding' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran seals', () => {
            system.recruitSeal({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateSealValue', () => {
        it('should calculate for default seal', () => {
            const { seal } = system.recruitSeal({});
            // level 1 * 100 + potency 20 * 2 + 0 chains * 30 = 100 + 40 + 0 = 140
            expect(system.calculateSealValue(seal.sealId)).toBe(140);
        });

        it('should incorporate level, potency, and chains', () => {
            const { seal } = system.recruitSeal({});
            system.levelUpSeal(seal.sealId); // level 2
            system.raisePotency(seal.sealId, 10); // potency 30
            system.addChain(seal.sealId, 'chain1'); // 1 chain
            system.addChain(seal.sealId, 'chain2'); // 2 chains
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateSealValue(seal.sealId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSealValue('ghost')).toBe(0);
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

        it('should execute default getSeal', () => {
            const result = system.executeTool('getSeal', { sealId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sealRecruited', () => count++);
            unregister();
            system.recruitSeal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sealRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSeal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSeals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSeals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSeal({});
            const json = system.toJSON();
            expect(json.seals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSeal({});
            const json = system.toJSON();
            const newSys = new CultivationSeal();
            newSys.fromJSON(json);
            expect(newSys.seals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sealCount).toBe(0);
        });
    });
});
