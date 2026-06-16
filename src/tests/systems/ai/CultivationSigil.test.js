/**
 * CultivationSigil.test.js - 修真印记系统测试
 * V759 Iteration 22/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSigil } from '../../../systems/ai/CultivationSigil.js';

describe('CultivationSigil', () => {
    let system;
    beforeEach(() => { system = new CultivationSigil(); });

    describe('recruitSigil', () => {
        it('should recruit sigil', () => {
            const { sigil } = system.recruitSigil({ masterId: 'm1', name: 'Dragon Sigil', type: 'ancestral' });
            expect(sigil.masterId).toBe('m1');
            expect(sigil.name).toBe('Dragon Sigil');
            expect(sigil.type).toBe('ancestral');
        });

        it('should default type to personal', () => {
            const { sigil } = system.recruitSigil({});
            expect(sigil.type).toBe('personal');
        });

        it('should default name to Unnamed Sigil', () => {
            const { sigil } = system.recruitSigil({});
            expect(sigil.name).toBe('Unnamed Sigil');
        });

        it('should default strength to baseStrength', () => {
            const { sigil } = system.recruitSigil({});
            expect(sigil.strength).toBe(20);
        });

        it('should start at level 1', () => {
            const { sigil } = system.recruitSigil({});
            expect(sigil.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { sigil } = system.recruitSigil({});
            expect(sigil.status).toBe('novice');
        });

        it('should start with empty marks', () => {
            const { sigil } = system.recruitSigil({});
            expect(sigil.marks).toEqual([]);
        });

        it('should generate sigilId', () => {
            const { sigil } = system.recruitSigil({});
            expect(sigil.sigilId).toBeDefined();
            expect(typeof sigil.sigilId).toBe('string');
        });

        it('should accept custom sigilId', () => {
            const { sigil } = system.recruitSigil({ sigilId: 'my-sigil' });
            expect(sigil.sigilId).toBe('my-sigil');
        });

        it('should support all types', () => {
            const { sigil: s1 } = system.recruitSigil({ type: 'personal' });
            const { sigil: s2 } = system.recruitSigil({ type: 'ancestral' });
            const { sigil: s3 } = system.recruitSigil({ type: 'divine' });
            expect(s1.type).toBe('personal');
            expect(s2.type).toBe('ancestral');
            expect(s3.type).toBe('divine');
        });

        it('should trigger sigilRecruited hook', () => {
            let called = false;
            system.registerHook('sigilRecruited', () => { called = true; });
            system.recruitSigil({});
            expect(called).toBe(true);
        });
    });

    describe('getSigil', () => {
        it('should return sigil', () => {
            const { sigil } = system.recruitSigil({});
            expect(system.getSigil(sigil.sigilId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSigil('ghost')).toBeNull(); });
    });

    describe('listSigils', () => {
        it('should list all', () => {
            system.recruitSigil({});
            system.recruitSigil({});
            expect(system.listSigils().length).toBe(2);
        });

        it('should return empty when no sigils', () => {
            expect(system.listSigils().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSigil({ masterId: 'm1' });
            system.recruitSigil({ masterId: 'm2' });
            system.recruitSigil({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitSigil({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { sigil: s1 } = system.recruitSigil({});
            const { sigil: s2 } = system.recruitSigil({});
            system.legendSigil(s1.sigilId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].sigilId).toBe(s1.sigilId);
        });

        it('should return empty when none legendary', () => {
            system.recruitSigil({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addMark', () => {
        it('should add mark', () => {
            const { sigil } = system.recruitSigil({});
            system.addMark(sigil.sigilId, 'flame-mark');
            expect(sigil.marks).toContain('flame-mark');
            expect(sigil.marks.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addMark('ghost', 'mark');
            expect(result.error).toBe('SIGIL_NOT_FOUND');
        });

        it('should trigger markAdded hook', () => {
            const { sigil } = system.recruitSigil({});
            let called = false;
            system.registerHook('markAdded', () => { called = true; });
            system.addMark(sigil.sigilId, 'mark');
            expect(called).toBe(true);
        });

        it('should add multiple marks', () => {
            const { sigil } = system.recruitSigil({});
            system.addMark(sigil.sigilId, 'mark1');
            system.addMark(sigil.sigilId, 'mark2');
            expect(sigil.marks.length).toBe(2);
        });
    });

    describe('raiseStrength', () => {
        it('should raise strength', () => {
            const { sigil } = system.recruitSigil({});
            system.raiseStrength(sigil.sigilId, 10);
            expect(sigil.strength).toBe(30);
        });

        it('should default amount to 5', () => {
            const { sigil } = system.recruitSigil({});
            system.raiseStrength(sigil.sigilId);
            expect(sigil.strength).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseStrength('ghost', 10);
            expect(result.error).toBe('SIGIL_NOT_FOUND');
        });

        it('should trigger strengthRaised hook', () => {
            const { sigil } = system.recruitSigil({});
            let called = false;
            system.registerHook('strengthRaised', () => { called = true; });
            system.raiseStrength(sigil.sigilId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSigil', () => {
        it('should level up', () => {
            const { sigil } = system.recruitSigil({});
            system.levelUpSigil(sigil.sigilId);
            expect(sigil.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSigil('ghost');
            expect(result.error).toBe('SIGIL_NOT_FOUND');
        });

        it('should trigger sigilLeveledUp hook', () => {
            const { sigil } = system.recruitSigil({});
            let called = false;
            system.registerHook('sigilLeveledUp', () => { called = true; });
            system.levelUpSigil(sigil.sigilId);
            expect(called).toBe(true);
        });
    });

    describe('legendSigil', () => {
        it('should set status to legendary', () => {
            const { sigil } = system.recruitSigil({});
            system.legendSigil(sigil.sigilId);
            expect(sigil.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSigil('ghost');
            expect(result.error).toBe('SIGIL_NOT_FOUND');
        });

        it('should trigger sigilLegendized hook', () => {
            const { sigil } = system.recruitSigil({});
            let called = false;
            system.registerHook('sigilLegendized', () => { called = true; });
            system.legendSigil(sigil.sigilId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitSigil({ type: 'personal' });
            system.recruitSigil({ type: 'ancestral' });
            system.recruitSigil({ type: 'divine' });
            expect(system.listByType('ancestral').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitSigil({ type: 'personal' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran sigils', () => {
            system.recruitSigil({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateSigilValue', () => {
        it('should calculate for default sigil', () => {
            const { sigil } = system.recruitSigil({});
            // level 1 * 100 + strength 20 * 2 + 0 marks * 30 = 100 + 40 + 0 = 140
            expect(system.calculateSigilValue(sigil.sigilId)).toBe(140);
        });

        it('should incorporate level, strength, and marks', () => {
            const { sigil } = system.recruitSigil({});
            system.levelUpSigil(sigil.sigilId); // level 2
            system.raiseStrength(sigil.sigilId, 10); // strength 30
            system.addMark(sigil.sigilId, 'mark1'); // 1 mark
            system.addMark(sigil.sigilId, 'mark2'); // 2 marks
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateSigilValue(sigil.sigilId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSigilValue('ghost')).toBe(0);
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

        it('should execute default getSigil', () => {
            const result = system.executeTool('getSigil', { sigilId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sigilRecruited', () => count++);
            unregister();
            system.recruitSigil({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sigilRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSigil({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSigils = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSigils = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSigil({});
            const json = system.toJSON();
            expect(json.sigils.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSigil({});
            const json = system.toJSON();
            const newSys = new CultivationSigil();
            newSys.fromJSON(json);
            expect(newSys.sigils.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sigilCount).toBe(0);
        });
    });
});
