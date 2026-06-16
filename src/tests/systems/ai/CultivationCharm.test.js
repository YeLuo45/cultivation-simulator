/**
 * CultivationCharm.test.js - 修真符咒测试
 * V706 Iteration 29/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCharm } from '../../../systems/ai/CultivationCharm.js';

describe('CultivationCharm', () => {
    let system;
    beforeEach(() => { system = new CultivationCharm(); });

    describe('recruitCharm', () => {
        it('should recruit', () => {
            const { charm } = system.recruitCharm({ masterId: 'm1', name: 'Fire Charm', type: 'talisman' });
            expect(charm.masterId).toBe('m1');
            expect(charm.name).toBe('Fire Charm');
            expect(charm.type).toBe('talisman');
        });

        it('should default type, efficacy, level, status', () => {
            const { charm } = system.recruitCharm({ masterId: 'm1' });
            expect(charm.type).toBe('talisman');
            expect(charm.efficacy).toBe(20);
            expect(charm.level).toBe(1);
            expect(charm.status).toBe('novice');
            expect(charm.glyphs).toEqual([]);
        });

        it('should trigger charmRecruited hook', () => {
            let called = false;
            system.registerHook('charmRecruited', () => { called = true; });
            system.recruitCharm({});
            expect(called).toBe(true);
        });
    });

    describe('getCharm', () => {
        it('should return', () => {
            const { charm } = system.recruitCharm({});
            expect(system.getCharm(charm.charmId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCharm('ghost')).toBeNull(); });
    });

    describe('listCharms', () => {
        it('should list all', () => {
            system.recruitCharm({});
            system.recruitCharm({});
            expect(system.listCharms().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitCharm({ masterId: 'm1' });
            system.recruitCharm({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary', () => {
            const { charm: c1 } = system.recruitCharm({});
            const { charm: c2 } = system.recruitCharm({});
            system.legendCharm(c2.charmId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].charmId).toBe(c2.charmId);
        });
    });

    describe('addGlyph', () => {
        it('should add glyph', () => {
            const { charm } = system.recruitCharm({});
            system.addGlyph(charm.charmId, 'fire-glyph');
            expect(charm.glyphs).toContain('fire-glyph');
            expect(charm.glyphs.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addGlyph('ghost', 'g');
            expect(result.error).toBe('CHARM_NOT_FOUND');
        });

        it('should trigger glyphAdded hook', () => {
            const { charm } = system.recruitCharm({});
            let called = false;
            system.registerHook('glyphAdded', () => { called = true; });
            system.addGlyph(charm.charmId, 'g');
            expect(called).toBe(true);
        });
    });

    describe('raiseEfficacy', () => {
        it('should raise', () => {
            const { charm } = system.recruitCharm({});
            system.raiseEfficacy(charm.charmId, 10);
            expect(charm.efficacy).toBe(30);
        });

        it('should default amount to 5', () => {
            const { charm } = system.recruitCharm({});
            system.raiseEfficacy(charm.charmId);
            expect(charm.efficacy).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseEfficacy('ghost', 10);
            expect(result.error).toBe('CHARM_NOT_FOUND');
        });

        it('should trigger efficacyRaised hook', () => {
            const { charm } = system.recruitCharm({});
            let called = false;
            system.registerHook('efficacyRaised', () => { called = true; });
            system.raiseEfficacy(charm.charmId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCharm', () => {
        it('should level up', () => {
            const { charm } = system.recruitCharm({});
            system.levelUpCharm(charm.charmId);
            expect(charm.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpCharm('ghost');
            expect(result.error).toBe('CHARM_NOT_FOUND');
        });

        it('should trigger charmLeveledUp hook', () => {
            const { charm } = system.recruitCharm({});
            let called = false;
            system.registerHook('charmLeveledUp', () => { called = true; });
            system.levelUpCharm(charm.charmId);
            expect(called).toBe(true);
        });
    });

    describe('legendCharm', () => {
        it('should legendize', () => {
            const { charm } = system.recruitCharm({});
            system.legendCharm(charm.charmId);
            expect(charm.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCharm('ghost');
            expect(result.error).toBe('CHARM_NOT_FOUND');
        });

        it('should trigger charmLegendized hook', () => {
            const { charm } = system.recruitCharm({});
            let called = false;
            system.registerHook('charmLegendized', () => { called = true; });
            system.legendCharm(charm.charmId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCharmValue', () => {
        it('should calculate', () => {
            const { charm } = system.recruitCharm({});
            system.raiseEfficacy(charm.charmId, 10);
            system.addGlyph(charm.charmId, 'g1');
            system.addGlyph(charm.charmId, 'g2');
            system.levelUpCharm(charm.charmId);
            // level=2*100 + efficacy=30*2 + glyphs=2*30 = 200 + 60 + 60 = 320
            expect(system.calculateCharmValue(charm.charmId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCharmValue('ghost')).toBe(0);
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

        it('should execute default getCharm', () => {
            const result = system.executeTool('getCharm', { charmId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context', () => {
            let received = 'unset';
            system.registerTool('echo', (ctx) => { received = ctx; return 'ok'; });
            system.executeTool('echo');
            expect(received).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('charmRecruited', () => count++);
            unregister();
            system.recruitCharm({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('charmRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCharm({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCharms = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCharms = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCharm({});
            const json = system.toJSON();
            expect(json.charms.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCharm({});
            const json = system.toJSON();
            const newSys = new CultivationCharm();
            newSys.fromJSON(json);
            expect(newSys.charms.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.charmCount).toBe(0);
        });
    });
});
