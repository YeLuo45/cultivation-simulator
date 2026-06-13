/**
 * CultivationInsignia.test.js - 修真纹章系统测试
 * V766 Iteration 29/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationInsignia } from '../../../systems/ai/CultivationInsignia.js';

describe('CultivationInsignia', () => {
    let system;
    beforeEach(() => { system = new CultivationInsignia(); });

    describe('recruitInsignia', () => {
        it('should recruit insignia', () => {
            const { insignia } = system.recruitInsignia({ masterId: 'm1', name: 'Dragon Insignia', type: 'gold' });
            expect(insignia.masterId).toBe('m1');
            expect(insignia.name).toBe('Dragon Insignia');
            expect(insignia.type).toBe('gold');
        });

        it('should default type to gold', () => {
            const { insignia } = system.recruitInsignia({});
            expect(insignia.type).toBe('gold');
        });

        it('should default name to Unnamed Insignia', () => {
            const { insignia } = system.recruitInsignia({});
            expect(insignia.name).toBe('Unnamed Insignia');
        });

        it('should default honor to baseHonor', () => {
            const { insignia } = system.recruitInsignia({});
            expect(insignia.honor).toBe(20);
        });

        it('should start at level 1', () => {
            const { insignia } = system.recruitInsignia({});
            expect(insignia.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { insignia } = system.recruitInsignia({});
            expect(insignia.status).toBe('novice');
        });

        it('should start with empty sigils', () => {
            const { insignia } = system.recruitInsignia({});
            expect(insignia.sigils).toEqual([]);
        });

        it('should generate insigniaId', () => {
            const { insignia } = system.recruitInsignia({});
            expect(insignia.insigniaId).toBeDefined();
            expect(typeof insignia.insigniaId).toBe('string');
        });

        it('should accept custom insigniaId', () => {
            const { insignia } = system.recruitInsignia({ insigniaId: 'my-insignia' });
            expect(insignia.insigniaId).toBe('my-insignia');
        });

        it('should support all types', () => {
            const { insignia: i1 } = system.recruitInsignia({ type: 'gold' });
            const { insignia: i2 } = system.recruitInsignia({ type: 'silver' });
            const { insignia: i3 } = system.recruitInsignia({ type: 'celestial' });
            expect(i1.type).toBe('gold');
            expect(i2.type).toBe('silver');
            expect(i3.type).toBe('celestial');
        });

        it('should trigger insigniaRecruited hook', () => {
            let called = false;
            system.registerHook('insigniaRecruited', () => { called = true; });
            system.recruitInsignia({});
            expect(called).toBe(true);
        });

        it('should accept custom honor and sigils', () => {
            const { insignia } = system.recruitInsignia({ honor: 99, sigils: ['dragon', 'tiger'] });
            expect(insignia.honor).toBe(99);
            expect(insignia.sigils).toEqual(['dragon', 'tiger']);
        });
    });

    describe('getInsignia', () => {
        it('should return insignia', () => {
            const { insignia } = system.recruitInsignia({});
            expect(system.getInsignia(insignia.insigniaId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getInsignia('ghost')).toBeNull(); });
        it('should return copy not reference', () => {
            const { insignia } = system.recruitInsignia({});
            const fetched = system.getInsignia(insignia.insigniaId);
            expect(fetched).not.toBe(insignia);
        });
    });

    describe('listInsignias', () => {
        it('should list all', () => {
            system.recruitInsignia({});
            system.recruitInsignia({});
            expect(system.listInsignias().length).toBe(2);
        });

        it('should return empty when no insignias', () => {
            expect(system.listInsignias().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitInsignia({ masterId: 'm1' });
            system.recruitInsignia({ masterId: 'm2' });
            system.recruitInsignia({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitInsignia({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { insignia: e1 } = system.recruitInsignia({});
            const { insignia: e2 } = system.recruitInsignia({});
            system.legendInsignia(e1.insigniaId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].insigniaId).toBe(e1.insigniaId);
        });

        it('should return empty when none legendary', () => {
            system.recruitInsignia({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSigil', () => {
        it('should add sigil', () => {
            const { insignia } = system.recruitInsignia({});
            system.addSigil(insignia.insigniaId, 'dragon-sigil');
            expect(insignia.sigils).toContain('dragon-sigil');
            expect(insignia.sigils.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addSigil('ghost', 'sigil');
            expect(result.error).toBe('INSIGNIA_NOT_FOUND');
        });

        it('should trigger sigilAdded hook', () => {
            const { insignia } = system.recruitInsignia({});
            let called = false;
            system.registerHook('sigilAdded', () => { called = true; });
            system.addSigil(insignia.insigniaId, 'sigil');
            expect(called).toBe(true);
        });

        it('should add multiple sigils', () => {
            const { insignia } = system.recruitInsignia({});
            system.addSigil(insignia.insigniaId, 'sigil-a');
            system.addSigil(insignia.insigniaId, 'sigil-b');
            expect(insignia.sigils.length).toBe(2);
        });
    });

    describe('raiseHonor', () => {
        it('should raise honor', () => {
            const { insignia } = system.recruitInsignia({});
            system.raiseHonor(insignia.insigniaId, 10);
            expect(insignia.honor).toBe(30);
        });

        it('should default amount to 5', () => {
            const { insignia } = system.recruitInsignia({});
            system.raiseHonor(insignia.insigniaId);
            expect(insignia.honor).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseHonor('ghost', 10);
            expect(result.error).toBe('INSIGNIA_NOT_FOUND');
        });

        it('should trigger honorRaised hook', () => {
            const { insignia } = system.recruitInsignia({});
            let called = false;
            system.registerHook('honorRaised', () => { called = true; });
            system.raiseHonor(insignia.insigniaId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpInsignia', () => {
        it('should level up', () => {
            const { insignia } = system.recruitInsignia({});
            system.levelUpInsignia(insignia.insigniaId);
            expect(insignia.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpInsignia('ghost');
            expect(result.error).toBe('INSIGNIA_NOT_FOUND');
        });

        it('should trigger insigniaLeveledUp hook', () => {
            const { insignia } = system.recruitInsignia({});
            let called = false;
            system.registerHook('insigniaLeveledUp', () => { called = true; });
            system.levelUpInsignia(insignia.insigniaId);
            expect(called).toBe(true);
        });
    });

    describe('legendInsignia', () => {
        it('should set status to legendary', () => {
            const { insignia } = system.recruitInsignia({});
            system.legendInsignia(insignia.insigniaId);
            expect(insignia.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendInsignia('ghost');
            expect(result.error).toBe('INSIGNIA_NOT_FOUND');
        });

        it('should trigger insigniaLegendized hook', () => {
            const { insignia } = system.recruitInsignia({});
            let called = false;
            system.registerHook('insigniaLegendized', () => { called = true; });
            system.legendInsignia(insignia.insigniaId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitInsignia({ type: 'gold' });
            system.recruitInsignia({ type: 'silver' });
            system.recruitInsignia({ type: 'celestial' });
            expect(system.listByType('silver').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitInsignia({ type: 'gold' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran insignias', () => {
            system.recruitInsignia({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateInsigniaValue', () => {
        it('should calculate for default insignia', () => {
            const { insignia } = system.recruitInsignia({});
            // level 1 * 100 + honor 20 * 2 + 0 sigils * 30 = 100 + 40 + 0 = 140
            expect(system.calculateInsigniaValue(insignia.insigniaId)).toBe(140);
        });

        it('should incorporate level, honor, and sigils', () => {
            const { insignia } = system.recruitInsignia({});
            system.levelUpInsignia(insignia.insigniaId); // level 2
            system.raiseHonor(insignia.insigniaId, 10); // honor 30
            system.addSigil(insignia.insigniaId, 'sigil-a'); // 1 sigil
            system.addSigil(insignia.insigniaId, 'sigil-b'); // 2 sigils
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateInsigniaValue(insignia.insigniaId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateInsigniaValue('ghost')).toBe(0);
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

        it('should execute default getInsignia', () => {
            const result = system.executeTool('getInsignia', { insigniaId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('insigniaRecruited', () => count++);
            unregister();
            system.recruitInsignia({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('insigniaRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitInsignia({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalInsignias = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalInsignias = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitInsignia({});
            const json = system.toJSON();
            expect(json.insignias.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitInsignia({});
            const json = system.toJSON();
            const newSys = new CultivationInsignia();
            newSys.fromJSON(json);
            expect(newSys.insignias.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.insigniaCount).toBe(0);
        });
    });
});
