/**
 * CultivationBeast.test.js - 修真妖兽测试
 * V677 Iteration 30/30 FINAL Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBeast } from '../../../systems/ai/CultivationBeast.js';

describe('CultivationBeast', () => {
    let system;
    beforeEach(() => { system = new CultivationBeast(); });

    describe('recruitBeast', () => {
        it('should create', () => {
            const { beast } = system.recruitBeast({ name: 'Fenrir' });
            expect(beast.name).toBe('Fenrir');
        });

        it('should set initial metrics', () => {
            const { beast } = system.recruitBeast({});
            expect(system.getMetrics(beast.beastId)).not.toBeNull();
        });

        it('should trigger beastRecruited hook', () => {
            let called = false;
            system.registerHook('beastRecruited', () => { called = true; });
            system.recruitBeast({});
            expect(called).toBe(true);
        });
    });

    describe('getBeast', () => {
        it('should return', () => {
            const { beast } = system.recruitBeast({});
            expect(system.getBeast(beast.beastId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBeast('ghost')).toBeNull(); });
    });

    describe('listBeasts', () => {
        it('should list all', () => {
            system.recruitBeast({});
            expect(system.listBeasts().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.recruitBeast({ type: 'wolf' });
            system.recruitBeast({ type: 'dragon' });
            expect(system.listByType('wolf').length).toBe(1);
        });
    });

    describe('listByTamer', () => {
        it('should filter', () => {
            system.recruitBeast({ tamerId: 't1' });
            system.recruitBeast({ tamerId: 't2' });
            expect(system.listByTamer('t1').length).toBe(1);
        });
    });

    describe('listByLevel', () => {
        it('should filter', () => {
            system.recruitBeast({});
            system.recruitBeast({});
            expect(system.listByLevel(1).length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.recruitBeast({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.recruitBeast({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { beast } = system.recruitBeast({});
            const result = system.setMetrics(beast.beastId, { wildness: 99 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { beast } = system.recruitBeast({});
            expect(system.getMetrics(beast.beastId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshBeast', () => {
        it('should refresh', () => {
            const { beast } = system.recruitBeast({});
            const result = system.refreshBeast(beast.beastId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshBeast('ghost');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger beastRefreshed hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('beastRefreshed', () => { called = true; });
            system.refreshBeast(beast.beastId);
            expect(called).toBe(true);
        });
    });

    describe('tameWildness', () => {
        it('should tame', () => {
            const { beast } = system.recruitBeast({});
            system.tameWildness(beast.beastId, 5);
            expect(beast.wildness).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.tameWildness('ghost', 5);
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger wildnessTamed hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('wildnessTamed', () => { called = true; });
            system.tameWildness(beast.beastId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addAbility', () => {
        it('should add', () => {
            const { beast } = system.recruitBeast({});
            system.addAbility(beast.beastId, 'howl');
            expect(beast.abilities.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addAbility('ghost', 'howl');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger abilityAdded hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('abilityAdded', () => { called = true; });
            system.addAbility(beast.beastId, 'howl');
            expect(called).toBe(true);
        });
    });

    describe('promoteBeast', () => {
        it('should promote', () => {
            const { beast } = system.recruitBeast({});
            system.promoteBeast(beast.beastId);
            expect(beast.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteBeast('ghost');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger beastPromoted hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('beastPromoted', () => { called = true; });
            system.promoteBeast(beast.beastId);
            expect(called).toBe(true);
        });
    });

    describe('trainBeast', () => {
        it('should train', () => {
            const { beast } = system.recruitBeast({});
            system.trainBeast(beast.beastId);
            expect(beast.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.trainBeast('ghost');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger beastTrained hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('beastTrained', () => { called = true; });
            system.trainBeast(beast.beastId);
            expect(called).toBe(true);
        });
    });

    describe('huntBeast', () => {
        it('should hunt', () => {
            const { beast } = system.recruitBeast({});
            system.huntBeast(beast.beastId);
            expect(beast.status).toBe('hunting');
        });

        it('should reject missing', () => {
            const result = system.huntBeast('ghost');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger beastHunting hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('beastHunting', () => { called = true; });
            system.huntBeast(beast.beastId);
            expect(called).toBe(true);
        });
    });

    describe('legendBeast', () => {
        it('should legend', () => {
            const { beast } = system.recruitBeast({});
            system.legendBeast(beast.beastId);
            expect(beast.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBeast('ghost');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger beastLegendized hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('beastLegendized', () => { called = true; });
            system.legendBeast(beast.beastId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { beast } = system.recruitBeast({});
            system.changeType(beast.beastId, 'phoenix');
            expect(beast.type).toBe('phoenix');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'phoenix');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(beast.beastId, 'dragon');
            expect(called).toBe(true);
        });
    });

    describe('calculateBeastValue', () => {
        it('should calculate', () => {
            const { beast } = system.recruitBeast({});
            expect(system.calculateBeastValue(beast.beastId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBeastValue('ghost')).toBe(0);
        });
    });

    describe('deleteBeast', () => {
        it('should delete', () => {
            const { beast } = system.recruitBeast({});
            const result = system.deleteBeast(beast.beastId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteBeast('ghost');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger beastDeleted hook', () => {
            const { beast } = system.recruitBeast({});
            let called = false;
            system.registerHook('beastDeleted', () => { called = true; });
            system.deleteBeast(beast.beastId);
            expect(called).toBe(true);
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

        it('should execute default listByType', () => {
            system.recruitBeast({ type: 'wolf' });
            const result = system.executeTool('listByType', { type: 'wolf' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('beastRecruited', () => count++);
            unregister();
            system.recruitBeast({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('beastRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBeast({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBeasts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBeasts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBeast({});
            const json = system.toJSON();
            expect(json.beasts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBeast({});
            const json = system.toJSON();
            const newSys = new CultivationBeast();
            newSys.fromJSON(json);
            expect(newSys.beasts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.beastCount).toBe(0);
        });
    });
});