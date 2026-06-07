/**
 * CultivationDemon.test.js - 修真妖系统测试
 * V672 Iteration 25/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDemon } from '../../../systems/ai/CultivationDemon.js';

describe('CultivationDemon', () => {
    let system;
    beforeEach(() => { system = new CultivationDemon(); });

    describe('recruitDemon', () => {
        it('should recruit', () => {
            const { demon } = system.recruitDemon({ parentId: 'p1', name: 'ShadowWorm' });
            expect(demon.parentId).toBe('p1');
            expect(demon.name).toBe('ShadowWorm');
        });

        it('should use default type and malevolence', () => {
            const { demon } = system.recruitDemon({});
            expect(demon.type).toBe('beast');
            expect(demon.malevolence).toBe(20);
        });

        it('should accept custom type beast', () => {
            const { demon } = system.recruitDemon({ type: 'beast' });
            expect(demon.type).toBe('beast');
        });

        it('should accept custom type serpent', () => {
            const { demon } = system.recruitDemon({ type: 'serpent' });
            expect(demon.type).toBe('serpent');
        });

        it('should accept custom type bird', () => {
            const { demon } = system.recruitDemon({ type: 'bird' });
            expect(demon.type).toBe('bird');
        });

        it('should reject when max reached', () => {
            const small = new CultivationDemon({ maxDemons: 1 });
            small.recruitDemon({});
            const result = small.recruitDemon({});
            expect(result.error).toBe('MAX_DEMONS_REACHED');
        });

        it('should trigger demonRecruited hook', () => {
            let called = false;
            system.registerHook('demonRecruited', () => { called = true; });
            system.recruitDemon({});
            expect(called).toBe(true);
        });

        it('should set initial status to novice', () => {
            const { demon } = system.recruitDemon({});
            expect(demon.status).toBe('novice');
            expect(demon.level).toBe(1);
        });

        it('should accept custom malevolence including 0', () => {
            const { demon } = system.recruitDemon({ malevolence: 0 });
            expect(demon.malevolence).toBe(0);
        });

        it('should accept custom parent and rituals', () => {
            const { demon } = system.recruitDemon({ parentId: 'pr42', rituals: [{ name: 'initial' }] });
            expect(demon.parentId).toBe('pr42');
            expect(demon.rituals.length).toBe(1);
        });

        it('should accept custom demonId', () => {
            const { demon } = system.recruitDemon({ demonId: 'custom_dmn_1' });
            expect(demon.demonId).toBe('custom_dmn_1');
        });
    });

    describe('getDemon', () => {
        it('should return', () => {
            const { demon } = system.recruitDemon({});
            expect(system.getDemon(demon.demonId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDemon('ghost')).toBeNull(); });
        it('should return a copy not the original reference', () => {
            const { demon } = system.recruitDemon({});
            const fetched = system.getDemon(demon.demonId);
            expect(fetched).not.toBe(demon);
        });
    });

    describe('listDemons', () => {
        it('should list all', () => {
            system.recruitDemon({});
            system.recruitDemon({});
            expect(system.listDemons().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listDemons().length).toBe(0);
        });
    });

    describe('listByParent', () => {
        it('should filter', () => {
            system.recruitDemon({ parentId: 'p1' });
            system.recruitDemon({ parentId: 'p2' });
            expect(system.listByParent('p1').length).toBe(1);
        });
        it('should return empty for unknown parent', () => {
            system.recruitDemon({ parentId: 'p1' });
            expect(system.listByParent('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { demon: d1 } = system.recruitDemon({});
            const { demon: d2 } = system.recruitDemon({});
            system.legendDemon(d1.demonId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].demonId).toBe(d1.demonId);
        });
    });

    describe('addRitual', () => {
        it('should add ritual', () => {
            const { demon } = system.recruitDemon({});
            system.addRitual(demon.demonId, { name: 'RitualOfDoom' });
            expect(demon.rituals.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addRitual('ghost', {});
            expect(result.error).toBe('DEMON_NOT_FOUND');
        });

        it('should trigger ritualAdded hook', () => {
            const { demon } = system.recruitDemon({});
            let called = false;
            system.registerHook('ritualAdded', () => { called = true; });
            system.addRitual(demon.demonId, { name: 'Decay' });
            expect(called).toBe(true);
        });
    });

    describe('raiseMalevolence', () => {
        it('should raise malevolence', () => {
            const { demon } = system.recruitDemon({});
            system.raiseMalevolence(demon.demonId, 10);
            expect(demon.malevolence).toBe(30);
        });

        it('should use default amount', () => {
            const { demon } = system.recruitDemon({});
            system.raiseMalevolence(demon.demonId);
            expect(demon.malevolence).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseMalevolence('ghost', 5);
            expect(result.error).toBe('DEMON_NOT_FOUND');
        });

        it('should trigger malevolenceRaised hook', () => {
            const { demon } = system.recruitDemon({});
            let called = false;
            system.registerHook('malevolenceRaised', () => { called = true; });
            system.raiseMalevolence(demon.demonId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDemon', () => {
        it('should level up', () => {
            const { demon } = system.recruitDemon({});
            system.levelUpDemon(demon.demonId);
            expect(demon.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDemon('ghost');
            expect(result.error).toBe('DEMON_NOT_FOUND');
        });

        it('should trigger demonLeveledUp hook', () => {
            const { demon } = system.recruitDemon({});
            let called = false;
            system.registerHook('demonLeveledUp', () => { called = true; });
            system.levelUpDemon(demon.demonId);
            expect(called).toBe(true);
        });
    });

    describe('legendDemon', () => {
        it('should legendize', () => {
            const { demon } = system.recruitDemon({});
            system.legendDemon(demon.demonId);
            expect(demon.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDemon('ghost');
            expect(result.error).toBe('DEMON_NOT_FOUND');
        });

        it('should trigger demonLegendized hook', () => {
            const { demon } = system.recruitDemon({});
            let called = false;
            system.registerHook('demonLegendized', () => { called = true; });
            system.legendDemon(demon.demonId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDemonValue', () => {
        it('should calculate', () => {
            const { demon } = system.recruitDemon({});
            system.levelUpDemon(demon.demonId);
            system.raiseMalevolence(demon.demonId, 5);
            system.addRitual(demon.demonId, { name: 'ritual' });
            const value = system.calculateDemonValue(demon.demonId);
            expect(value).toBe(2 * 100 + 25 * 2 + 1 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDemonValue('ghost')).toBe(0);
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

        it('should execute tool with undefined context', () => {
            system.registerTool('nocontext', (ctx) => ctx);
            const result = system.executeTool('nocontext');
            expect(result.success).toBe(true);
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

        it('should execute default getDemon', () => {
            const result = system.executeTool('getDemon', { demonId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitDemon via tool', () => {
            const result = system.executeTool('recruitDemon', { name: 'ToolRecruited' });
            expect(result.result.success).toBe(true);
            expect(result.result.demon.name).toBe('ToolRecruited');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('demonRecruited', () => count++);
            unregister();
            system.recruitDemon({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('demonRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDemon({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDemons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDemons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDemon({});
            const json = system.toJSON();
            expect(json.demons.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDemon({});
            const json = system.toJSON();
            const newSys = new CultivationDemon();
            newSys.fromJSON(json);
            expect(newSys.demons.size).toBe(1);
        });
        it('should deserialize empty data', () => {
            const newSys = new CultivationDemon();
            const result = newSys.fromJSON({});
            expect(result.success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.demonCount).toBe(0);
        });
    });
});
