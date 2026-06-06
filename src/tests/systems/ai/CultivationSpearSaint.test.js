/**
 * CultivationSpearSaint.test.js - 修真枪圣测试
 * V636 Iteration 19/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSpearSaint } from '../../../systems/ai/CultivationSpearSaint.js';

describe('CultivationSpearSaint', () => {
    let system;
    beforeEach(() => { system = new CultivationSpearSaint(); });

    describe('recruitSpearSaint', () => {
        it('should recruit', () => {
            const { spearsaint } = system.recruitSpearSaint({ mentorId: 'm1', name: 'Sage' });
            expect(spearsaint.mentorId).toBe('m1');
            expect(spearsaint.name).toBe('Sage');
        });

        it('should default type to iron', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            expect(spearsaint.type).toBe('iron');
        });

        it('should default precision to basePrecision', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            expect(spearsaint.precision).toBe(20);
        });

        it('should initialize with novice status and level 1', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            expect(spearsaint.status).toBe('novice');
            expect(spearsaint.level).toBe(1);
        });

        it('should initialize with empty spears array', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            expect(spearsaint.spears).toEqual([]);
        });

        it('should trigger spearSaintRecruited hook', () => {
            let called = false;
            system.registerHook('spearSaintRecruited', () => { called = true; });
            system.recruitSpearSaint({});
            expect(called).toBe(true);
        });

        it('should accept custom spear input', () => {
            const { spearsaint } = system.recruitSpearSaint({ spears: ['dragon', 'phoenix'] });
            expect(spearsaint.spears).toEqual(['dragon', 'phoenix']);
        });

        it('should support all three types', () => {
            const types = ['iron', 'wood', 'divine'];
            for (const t of types) {
                const { spearsaint } = system.recruitSpearSaint({ type: t });
                expect(spearsaint.type).toBe(t);
            }
        });

        it('should accept custom precision', () => {
            const { spearsaint } = system.recruitSpearSaint({ precision: 50 });
            expect(spearsaint.precision).toBe(50);
        });
    });

    describe('getSpearSaint', () => {
        it('should return', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            expect(system.getSpearSaint(spearsaint.saintId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSpearSaint('ghost')).toBeNull(); });
    });

    describe('listSpearSaints', () => {
        it('should list all', () => {
            system.recruitSpearSaint({});
            system.recruitSpearSaint({});
            expect(system.listSpearSaints().length).toBe(2);
        });

        it('should return empty array when no saints', () => {
            expect(system.listSpearSaints().length).toBe(0);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitSpearSaint({ mentorId: 'm1' });
            system.recruitSpearSaint({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });

        it('should return empty for unknown mentor', () => {
            system.recruitSpearSaint({ mentorId: 'm1' });
            expect(system.listByMentor('ghost').length).toBe(0);
        });

        it('should return multiple saints for same mentor', () => {
            system.recruitSpearSaint({ mentorId: 'm1' });
            system.recruitSpearSaint({ mentorId: 'm1' });
            system.recruitSpearSaint({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary saints', () => {
            const { spearsaint: a1 } = system.recruitSpearSaint({});
            system.recruitSpearSaint({});
            system.legendSpearSaint(a1.saintId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendaries', () => {
            system.recruitSpearSaint({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSpear', () => {
        it('should add spear', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.addSpear(spearsaint.saintId, 'dragon');
            expect(spearsaint.spears).toContain('dragon');
        });

        it('should add multiple spears', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.addSpear(spearsaint.saintId, 'dragon');
            system.addSpear(spearsaint.saintId, 'phoenix');
            expect(spearsaint.spears.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSpear('ghost', 'dragon');
            expect(result.error).toBe('SPEARSAINT_NOT_FOUND');
        });

        it('should trigger spearAdded hook', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            let called = false;
            system.registerHook('spearAdded', () => { called = true; });
            system.addSpear(spearsaint.saintId, 'dragon');
            expect(called).toBe(true);
        });
    });

    describe('sharpenPrecision', () => {
        it('should sharpen precision with default amount', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.sharpenPrecision(spearsaint.saintId);
            expect(spearsaint.precision).toBe(25);
        });

        it('should sharpen precision with custom amount', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.sharpenPrecision(spearsaint.saintId, 10);
            expect(spearsaint.precision).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.sharpenPrecision('ghost', 10);
            expect(result.error).toBe('SPEARSAINT_NOT_FOUND');
        });

        it('should trigger precisionSharpened hook', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            let called = false;
            system.registerHook('precisionSharpened', () => { called = true; });
            system.sharpenPrecision(spearsaint.saintId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSpearSaint', () => {
        it('should level up', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.levelUpSpearSaint(spearsaint.saintId);
            expect(spearsaint.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.levelUpSpearSaint(spearsaint.saintId);
            system.levelUpSpearSaint(spearsaint.saintId);
            expect(spearsaint.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpSpearSaint('ghost');
            expect(result.error).toBe('SPEARSAINT_NOT_FOUND');
        });

        it('should trigger spearSaintLeveledUp hook', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            let called = false;
            system.registerHook('spearSaintLeveledUp', () => { called = true; });
            system.levelUpSpearSaint(spearsaint.saintId);
            expect(called).toBe(true);
        });
    });

    describe('legendSpearSaint', () => {
        it('should set status to legendary', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.legendSpearSaint(spearsaint.saintId);
            expect(spearsaint.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSpearSaint('ghost');
            expect(result.error).toBe('SPEARSAINT_NOT_FOUND');
        });

        it('should trigger spearSaintLegendized hook', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            let called = false;
            system.registerHook('spearSaintLegendized', () => { called = true; });
            system.legendSpearSaint(spearsaint.saintId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSpearSaintValue', () => {
        it('should calculate base value', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            // level(1)*100 + precision(20)*2 + spears(0)*30 = 100 + 40 + 0 = 140
            expect(system.calculateSpearSaintValue(spearsaint.saintId)).toBe(140);
        });

        it('should include spear value', () => {
            const { spearsaint } = system.recruitSpearSaint({ spears: ['a', 'b', 'c'] });
            // level(1)*100 + precision(20)*2 + spears(3)*30 = 100 + 40 + 90 = 230
            expect(system.calculateSpearSaintValue(spearsaint.saintId)).toBe(230);
        });

        it('should include level in value', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.levelUpSpearSaint(spearsaint.saintId);
            // level(2)*100 + precision(20)*2 + spears(0)*30 = 200 + 40 + 0 = 240
            expect(system.calculateSpearSaintValue(spearsaint.saintId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSpearSaintValue('ghost')).toBe(0);
        });

        it('should reflect precision changes', () => {
            const { spearsaint } = system.recruitSpearSaint({});
            system.sharpenPrecision(spearsaint.saintId, 10);
            // level(1)*100 + precision(30)*2 + spears(0)*30 = 100 + 60 + 0 = 160
            expect(system.calculateSpearSaintValue(spearsaint.saintId)).toBe(160);
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

        it('should execute default getSpearSaint', () => {
            const result = system.executeTool('getSpearSaint', { spearSaintId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitSpearSaint', () => {
            const result = system.executeTool('recruitSpearSaint', { name: 'Test' });
            expect(result.success).toBe(true);
            expect(result.result.spearsaint.name).toBe('Test');
        });

        it('should default context to empty object', () => {
            system.registerTool('noctx', () => 'ok');
            const result = system.executeTool('noctx');
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('spearSaintRecruited', () => count++);
            unregister();
            system.recruitSpearSaint({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('spearSaintRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSpearSaint({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSpearSaints = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSpearSaints = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSpearSaint({});
            const json = system.toJSON();
            expect(json.spearsaints.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSpearSaint({});
            const json = system.toJSON();
            const newSys = new CultivationSpearSaint();
            newSys.fromJSON(json);
            expect(newSys.spearsaints.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.spearSaintCount).toBe(0);
        });

        it('should reflect added saints', () => {
            system.recruitSpearSaint({});
            const stats = system.getStats();
            expect(stats.spearSaintCount).toBe(1);
        });
    });
});
