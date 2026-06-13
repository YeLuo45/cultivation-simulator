/**
 * CultivationEmblem.test.js - 修真徽章系统测试
 * V764 Iteration 27/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEmblem } from '../../../systems/ai/CultivationEmblem.js';

describe('CultivationEmblem', () => {
    let system;
    beforeEach(() => { system = new CultivationEmblem(); });

    describe('recruitEmblem', () => {
        it('should recruit emblem', () => {
            const { emblem } = system.recruitEmblem({ masterId: 'm1', name: 'Dragon Emblem', type: 'gold' });
            expect(emblem.masterId).toBe('m1');
            expect(emblem.name).toBe('Dragon Emblem');
            expect(emblem.type).toBe('gold');
        });

        it('should default type to gold', () => {
            const { emblem } = system.recruitEmblem({});
            expect(emblem.type).toBe('gold');
        });

        it('should default name to Unnamed Emblem', () => {
            const { emblem } = system.recruitEmblem({});
            expect(emblem.name).toBe('Unnamed Emblem');
        });

        it('should default prestige to basePrestige', () => {
            const { emblem } = system.recruitEmblem({});
            expect(emblem.prestige).toBe(20);
        });

        it('should start at level 1', () => {
            const { emblem } = system.recruitEmblem({});
            expect(emblem.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { emblem } = system.recruitEmblem({});
            expect(emblem.status).toBe('novice');
        });

        it('should start with empty decorations', () => {
            const { emblem } = system.recruitEmblem({});
            expect(emblem.decorations).toEqual([]);
        });

        it('should generate emblemId', () => {
            const { emblem } = system.recruitEmblem({});
            expect(emblem.emblemId).toBeDefined();
            expect(typeof emblem.emblemId).toBe('string');
        });

        it('should accept custom emblemId', () => {
            const { emblem } = system.recruitEmblem({ emblemId: 'my-emblem' });
            expect(emblem.emblemId).toBe('my-emblem');
        });

        it('should support all types', () => {
            const { emblem: e1 } = system.recruitEmblem({ type: 'gold' });
            const { emblem: e2 } = system.recruitEmblem({ type: 'silver' });
            const { emblem: e3 } = system.recruitEmblem({ type: 'divine' });
            expect(e1.type).toBe('gold');
            expect(e2.type).toBe('silver');
            expect(e3.type).toBe('divine');
        });

        it('should trigger emblemRecruited hook', () => {
            let called = false;
            system.registerHook('emblemRecruited', () => { called = true; });
            system.recruitEmblem({});
            expect(called).toBe(true);
        });

        it('should accept custom prestige and decorations', () => {
            const { emblem } = system.recruitEmblem({ prestige: 99, decorations: ['crown', 'sigil'] });
            expect(emblem.prestige).toBe(99);
            expect(emblem.decorations).toEqual(['crown', 'sigil']);
        });
    });

    describe('getEmblem', () => {
        it('should return emblem', () => {
            const { emblem } = system.recruitEmblem({});
            expect(system.getEmblem(emblem.emblemId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEmblem('ghost')).toBeNull(); });
        it('should return copy not reference', () => {
            const { emblem } = system.recruitEmblem({});
            const fetched = system.getEmblem(emblem.emblemId);
            expect(fetched).not.toBe(emblem);
        });
    });

    describe('listEmblems', () => {
        it('should list all', () => {
            system.recruitEmblem({});
            system.recruitEmblem({});
            expect(system.listEmblems().length).toBe(2);
        });

        it('should return empty when no emblems', () => {
            expect(system.listEmblems().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitEmblem({ masterId: 'm1' });
            system.recruitEmblem({ masterId: 'm2' });
            system.recruitEmblem({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitEmblem({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { emblem: e1 } = system.recruitEmblem({});
            const { emblem: e2 } = system.recruitEmblem({});
            system.legendEmblem(e1.emblemId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].emblemId).toBe(e1.emblemId);
        });

        it('should return empty when none legendary', () => {
            system.recruitEmblem({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addDecoration', () => {
        it('should add decoration', () => {
            const { emblem } = system.recruitEmblem({});
            system.addDecoration(emblem.emblemId, 'phoenix-feather');
            expect(emblem.decorations).toContain('phoenix-feather');
            expect(emblem.decorations.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addDecoration('ghost', 'crown');
            expect(result.error).toBe('EMBLEM_NOT_FOUND');
        });

        it('should trigger decorationAdded hook', () => {
            const { emblem } = system.recruitEmblem({});
            let called = false;
            system.registerHook('decorationAdded', () => { called = true; });
            system.addDecoration(emblem.emblemId, 'crown');
            expect(called).toBe(true);
        });

        it('should add multiple decorations', () => {
            const { emblem } = system.recruitEmblem({});
            system.addDecoration(emblem.emblemId, 'crown');
            system.addDecoration(emblem.emblemId, 'sigil');
            expect(emblem.decorations.length).toBe(2);
        });
    });

    describe('raisePrestige', () => {
        it('should raise prestige', () => {
            const { emblem } = system.recruitEmblem({});
            system.raisePrestige(emblem.emblemId, 10);
            expect(emblem.prestige).toBe(30);
        });

        it('should default amount to 5', () => {
            const { emblem } = system.recruitEmblem({});
            system.raisePrestige(emblem.emblemId);
            expect(emblem.prestige).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raisePrestige('ghost', 10);
            expect(result.error).toBe('EMBLEM_NOT_FOUND');
        });

        it('should trigger prestigeRaised hook', () => {
            const { emblem } = system.recruitEmblem({});
            let called = false;
            system.registerHook('prestigeRaised', () => { called = true; });
            system.raisePrestige(emblem.emblemId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEmblem', () => {
        it('should level up', () => {
            const { emblem } = system.recruitEmblem({});
            system.levelUpEmblem(emblem.emblemId);
            expect(emblem.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpEmblem('ghost');
            expect(result.error).toBe('EMBLEM_NOT_FOUND');
        });

        it('should trigger emblemLeveledUp hook', () => {
            const { emblem } = system.recruitEmblem({});
            let called = false;
            system.registerHook('emblemLeveledUp', () => { called = true; });
            system.levelUpEmblem(emblem.emblemId);
            expect(called).toBe(true);
        });
    });

    describe('legendEmblem', () => {
        it('should set status to legendary', () => {
            const { emblem } = system.recruitEmblem({});
            system.legendEmblem(emblem.emblemId);
            expect(emblem.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendEmblem('ghost');
            expect(result.error).toBe('EMBLEM_NOT_FOUND');
        });

        it('should trigger emblemLegendized hook', () => {
            const { emblem } = system.recruitEmblem({});
            let called = false;
            system.registerHook('emblemLegendized', () => { called = true; });
            system.legendEmblem(emblem.emblemId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitEmblem({ type: 'gold' });
            system.recruitEmblem({ type: 'silver' });
            system.recruitEmblem({ type: 'divine' });
            expect(system.listByType('silver').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitEmblem({ type: 'gold' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran emblems', () => {
            system.recruitEmblem({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateEmblemValue', () => {
        it('should calculate for default emblem', () => {
            const { emblem } = system.recruitEmblem({});
            // level 1 * 100 + prestige 20 * 2 + 0 decorations * 30 = 100 + 40 + 0 = 140
            expect(system.calculateEmblemValue(emblem.emblemId)).toBe(140);
        });

        it('should incorporate level, prestige, and decorations', () => {
            const { emblem } = system.recruitEmblem({});
            system.levelUpEmblem(emblem.emblemId); // level 2
            system.raisePrestige(emblem.emblemId, 10); // prestige 30
            system.addDecoration(emblem.emblemId, 'crown'); // 1 decoration
            system.addDecoration(emblem.emblemId, 'sigil'); // 2 decorations
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateEmblemValue(emblem.emblemId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEmblemValue('ghost')).toBe(0);
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

        it('should execute default getEmblem', () => {
            const result = system.executeTool('getEmblem', { emblemId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('emblemRecruited', () => count++);
            unregister();
            system.recruitEmblem({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('emblemRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitEmblem({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEmblems = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEmblems = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitEmblem({});
            const json = system.toJSON();
            expect(json.emblems.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitEmblem({});
            const json = system.toJSON();
            const newSys = new CultivationEmblem();
            newSys.fromJSON(json);
            expect(newSys.emblems.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.emblemCount).toBe(0);
        });
    });
});
