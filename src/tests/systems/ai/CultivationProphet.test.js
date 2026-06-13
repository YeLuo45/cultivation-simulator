/**
 * CultivationProphet.test.js - 修真预言家系统测试
 * V652 Iteration 5/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationProphet } from '../../../systems/ai/CultivationProphet.js';

describe('CultivationProphet', () => {
    let system;
    beforeEach(() => { system = new CultivationProphet(); });

    describe('recruitProphet', () => {
        it('should recruit', () => {
            const { prophet } = system.recruitProphet({ elderId: 'e1', name: 'Zhenyuan' });
            expect(prophet.elderId).toBe('e1');
            expect(prophet.name).toBe('Zhenyuan');
        });

        it('should default type to divine', () => {
            const { prophet } = system.recruitProphet({});
            expect(prophet.type).toBe('divine');
        });

        it('should trigger prophetRecruited hook', () => {
            let called = false;
            system.registerHook('prophetRecruited', () => { called = true; });
            system.recruitProphet({});
            expect(called).toBe(true);
        });
    });

    describe('getProphet', () => {
        it('should return', () => {
            const { prophet } = system.recruitProphet({});
            expect(system.getProphet(prophet.prophetId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getProphet('ghost')).toBeNull(); });
    });

    describe('listProphets', () => {
        it('should list all', () => {
            system.recruitProphet({});
            system.recruitProphet({});
            expect(system.listProphets().length).toBe(2);
        });
    });

    describe('listByElder', () => {
        it('should filter', () => {
            system.recruitProphet({ elderId: 'e1' });
            system.recruitProphet({ elderId: 'e2' });
            expect(system.listByElder('e1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { prophet: p1 } = system.recruitProphet({});
            const { prophet: p2 } = system.recruitProphet({});
            system.legendProphet(p1.prophetId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addProphecy', () => {
        it('should add', () => {
            const { prophet } = system.recruitProphet({});
            system.addProphecy(prophet.prophetId, { title: 'Heaven Calamity' });
            expect(prophet.prophecies.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addProphecy('ghost', {});
            expect(result.error).toBe('PROPHET_NOT_FOUND');
        });

        it('should trigger prophecyAdded hook', () => {
            const { prophet } = system.recruitProphet({});
            let called = false;
            system.registerHook('prophecyAdded', () => { called = true; });
            system.addProphecy(prophet.prophetId, {});
            expect(called).toBe(true);
        });
    });

    describe('sharpenVision', () => {
        it('should sharpen', () => {
            const { prophet } = system.recruitProphet({});
            system.sharpenVision(prophet.prophetId, 10);
            expect(prophet.vision).toBe(30);
        });

        it('should default amount to 5', () => {
            const { prophet } = system.recruitProphet({});
            system.sharpenVision(prophet.prophetId);
            expect(prophet.vision).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.sharpenVision('ghost', 10);
            expect(result.error).toBe('PROPHET_NOT_FOUND');
        });

        it('should trigger visionSharpened hook', () => {
            const { prophet } = system.recruitProphet({});
            let called = false;
            system.registerHook('visionSharpened', () => { called = true; });
            system.sharpenVision(prophet.prophetId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpProphet', () => {
        it('should level up', () => {
            const { prophet } = system.recruitProphet({});
            system.levelUpProphet(prophet.prophetId);
            expect(prophet.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpProphet('ghost');
            expect(result.error).toBe('PROPHET_NOT_FOUND');
        });

        it('should trigger prophetLeveledUp hook', () => {
            const { prophet } = system.recruitProphet({});
            let called = false;
            system.registerHook('prophetLeveledUp', () => { called = true; });
            system.levelUpProphet(prophet.prophetId);
            expect(called).toBe(true);
        });
    });

    describe('legendProphet', () => {
        it('should legendize', () => {
            const { prophet } = system.recruitProphet({});
            system.legendProphet(prophet.prophetId);
            expect(prophet.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendProphet('ghost');
            expect(result.error).toBe('PROPHET_NOT_FOUND');
        });

        it('should trigger prophetLegendized hook', () => {
            const { prophet } = system.recruitProphet({});
            let called = false;
            system.registerHook('prophetLegendized', () => { called = true; });
            system.legendProphet(prophet.prophetId);
            expect(called).toBe(true);
        });
    });

    describe('calculateProphetValue', () => {
        it('should calculate', () => {
            const { prophet } = system.recruitProphet({});
            system.addProphecy(prophet.prophetId, { v: 1 });
            system.addProphecy(prophet.prophetId, { v: 2 });
            // level 1 * 100 + vision 20 * 2 + 2 prophecies * 30 = 100 + 40 + 60 = 200
            expect(system.calculateProphetValue(prophet.prophetId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateProphetValue('ghost')).toBe(0);
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

        it('should execute default getProphet', () => {
            const result = system.executeTool('getProphet', { prophetId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('prophetRecruited', () => count++);
            unregister();
            system.recruitProphet({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('prophetRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitProphet({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalProphets = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalProphets = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitProphet({});
            const json = system.toJSON();
            expect(json.prophets.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitProphet({});
            const json = system.toJSON();
            const newSys = new CultivationProphet();
            newSys.fromJSON(json);
            expect(newSys.prophets.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.prophetCount).toBe(0);
        });
    });
});
