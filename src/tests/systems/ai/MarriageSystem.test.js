/**
 * MarriageSystem.test.js - 双修婚姻系统测试
 * V436 Iteration 13/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MarriageSystem } from '../../../systems/ai/MarriageSystem.js';

describe('MarriageSystem', () => {
    let system;
    beforeEach(() => { system = new MarriageSystem(); });

    describe('proposeMarriage', () => {
        it('should propose', () => {
            const { marriage } = system.proposeMarriage({ partner1: 'p1', partner2: 'p2' });
            expect(marriage.partner1).toBe('p1');
            expect(marriage.partner2).toBe('p2');
        });

        it('should default dao to sword', () => {
            const { marriage } = system.proposeMarriage({});
            expect(marriage.dao).toBe('sword');
        });

        it('should set status to proposed', () => {
            const { marriage } = system.proposeMarriage({});
            expect(marriage.status).toBe('proposed');
        });

        it('should default bondStrength from config', () => {
            const { marriage } = system.proposeMarriage({});
            expect(marriage.bondStrength).toBe(10);
        });

        it('should trigger marriageProposed hook', () => {
            let called = false;
            system.registerHook('marriageProposed', () => { called = true; });
            system.proposeMarriage({});
            expect(called).toBe(true);
        });
    });

    describe('getMarriage', () => {
        it('should return', () => {
            const { marriage } = system.proposeMarriage({});
            expect(system.getMarriage(marriage.marriageId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMarriage('ghost')).toBeNull(); });
    });

    describe('listMarriages', () => {
        it('should list all', () => {
            system.proposeMarriage({});
            expect(system.listMarriages().length).toBe(1);
        });

        it('should return empty initially', () => {
            expect(system.listMarriages().length).toBe(0);
        });
    });

    describe('listByPartner', () => {
        it('should filter by partner1', () => {
            system.proposeMarriage({ partner1: 'p1', partner2: 'p2' });
            system.proposeMarriage({ partner1: 'p3', partner2: 'p4' });
            expect(system.listByPartner('p1').length).toBe(1);
        });

        it('should filter by partner2', () => {
            system.proposeMarriage({ partner1: 'p1', partner2: 'p2' });
            system.proposeMarriage({ partner1: 'p3', partner2: 'p4' });
            expect(system.listByPartner('p2').length).toBe(1);
        });

        it('should return empty for unknown partner', () => {
            system.proposeMarriage({});
            expect(system.listByPartner('ghost').length).toBe(0);
        });
    });

    describe('listBonded', () => {
        it('should filter bonded', () => {
            const { marriage: m1 } = system.proposeMarriage({});
            system.proposeMarriage({});
            system.dualCultivate(m1.marriageId);
            expect(system.listBonded().length).toBe(1);
        });
    });

    describe('increaseResonance', () => {
        it('should increase resonance', () => {
            const { marriage } = system.proposeMarriage({});
            system.increaseResonance(marriage.marriageId, 15);
            expect(marriage.resonance).toBe(15);
        });

        it('should use default amount of 5', () => {
            const { marriage } = system.proposeMarriage({});
            system.increaseResonance(marriage.marriageId);
            expect(marriage.resonance).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.increaseResonance('ghost', 10);
            expect(result.error).toBe('MARRIAGE_NOT_FOUND');
        });

        it('should trigger resonanceIncreased hook', () => {
            const { marriage } = system.proposeMarriage({});
            let called = false;
            system.registerHook('resonanceIncreased', () => { called = true; });
            system.increaseResonance(marriage.marriageId, 10);
            expect(called).toBe(true);
        });
    });

    describe('dualCultivate', () => {
        it('should increase bondStrength', () => {
            const { marriage } = system.proposeMarriage({});
            system.dualCultivate(marriage.marriageId, 20);
            expect(marriage.bondStrength).toBe(30);
        });

        it('should use default amount of 10', () => {
            const { marriage } = system.proposeMarriage({});
            system.dualCultivate(marriage.marriageId);
            expect(marriage.bondStrength).toBe(20);
        });

        it('should transition status from proposed to bonded', () => {
            const { marriage } = system.proposeMarriage({});
            system.dualCultivate(marriage.marriageId);
            expect(marriage.status).toBe('bonded');
        });

        it('should not change status if already bonded', () => {
            const { marriage } = system.proposeMarriage({});
            system.dualCultivate(marriage.marriageId);
            system.dualCultivate(marriage.marriageId);
            expect(marriage.status).toBe('bonded');
        });

        it('should reject missing', () => {
            const result = system.dualCultivate('ghost', 10);
            expect(result.error).toBe('MARRIAGE_NOT_FOUND');
        });

        it('should trigger dualCultivationPerformed hook', () => {
            const { marriage } = system.proposeMarriage({});
            let called = false;
            system.registerHook('dualCultivationPerformed', () => { called = true; });
            system.dualCultivate(marriage.marriageId, 10);
            expect(called).toBe(true);
        });
    });

    describe('severMarriage', () => {
        it('should set status to severed', () => {
            const { marriage } = system.proposeMarriage({});
            system.severMarriage(marriage.marriageId);
            expect(marriage.status).toBe('severed');
        });

        it('should reject missing', () => {
            const result = system.severMarriage('ghost');
            expect(result.error).toBe('MARRIAGE_NOT_FOUND');
        });

        it('should trigger marriageSevered hook', () => {
            const { marriage } = system.proposeMarriage({});
            let called = false;
            system.registerHook('marriageSevered', () => { called = true; });
            system.severMarriage(marriage.marriageId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHarmonicPower', () => {
        it('should calculate', () => {
            const { marriage } = system.proposeMarriage({ dao: 'sword' });
            // bondStrength=10, resonance=0, dao.length=5 (sword)
            // = 10 * (1 + 0/100) + 5 = 15
            expect(system.calculateHarmonicPower(marriage.marriageId)).toBe(15);
        });

        it('should factor in resonance', () => {
            const { marriage } = system.proposeMarriage({ dao: 'sword' });
            system.increaseResonance(marriage.marriageId, 100);
            // bondStrength=10, resonance=100, dao.length=5
            // = 10 * (1 + 100/100) + 5 = 25
            expect(system.calculateHarmonicPower(marriage.marriageId)).toBe(25);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHarmonicPower('ghost')).toBe(0);
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

        it('should execute default getMarriage', () => {
            const result = system.executeTool('getMarriage', { marriageId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('marriageProposed', () => count++);
            unregister();
            system.proposeMarriage({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('marriageProposed', () => { throw new Error('x'); });
            expect(() => system.proposeMarriage({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMarriages = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMarriages = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.proposeMarriage({});
            const json = system.toJSON();
            expect(json.marriages.length).toBe(1);
        });
        it('should deserialize', () => {
            system.proposeMarriage({});
            const json = system.toJSON();
            const newSys = new MarriageSystem();
            newSys.fromJSON(json);
            expect(newSys.marriages.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.marriageCount).toBe(0);
        });
    });
});
