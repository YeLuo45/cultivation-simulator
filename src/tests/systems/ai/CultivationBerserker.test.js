/**
 * CultivationBerserker.test.js - 修真狂战士测试
 * V609 Iteration 12/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBerserker } from '../../../systems/ai/CultivationBerserker.js';

describe('CultivationBerserker', () => {
    let system;
    beforeEach(() => { system = new CultivationBerserker(); });

    describe('recruitBerserker', () => {
        it('should recruit', () => {
            const { berserker } = system.recruitBerserker({ handlerId: 'h1', name: 'Brute', type: 'axe' });
            expect(berserker.handlerId).toBe('h1');
            expect(berserker.name).toBe('Brute');
            expect(berserker.type).toBe('axe');
            expect(berserker.rage).toBe(10);
            expect(berserker.level).toBe(1);
            expect(berserker.status).toBe('calm');
            expect(berserker.frenzies).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { berserker } = system.recruitBerserker({});
            expect(berserker.berserkerId).toBeDefined();
            expect(typeof berserker.berserkerId).toBe('string');
        });

        it('should use default name', () => {
            const { berserker } = system.recruitBerserker({});
            expect(berserker.name).toBe('Anonymous Berserker');
        });

        it('should use default type axe', () => {
            const { berserker } = system.recruitBerserker({});
            expect(berserker.type).toBe('axe');
        });

        it('should support dual type', () => {
            const { berserker } = system.recruitBerserker({ type: 'dual' });
            expect(berserker.type).toBe('dual');
        });

        it('should support bare type', () => {
            const { berserker } = system.recruitBerserker({ type: 'bare' });
            expect(berserker.type).toBe('bare');
        });

        it('should trigger berserkerRecruited hook', () => {
            let called = false;
            system.registerHook('berserkerRecruited', () => { called = true; });
            system.recruitBerserker({});
            expect(called).toBe(true);
        });
    });

    describe('getBerserker', () => {
        it('should return', () => {
            const { berserker } = system.recruitBerserker({});
            expect(system.getBerserker(berserker.berserkerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBerserker('ghost')).toBeNull(); });
    });

    describe('listBerserkers', () => {
        it('should list all', () => {
            system.recruitBerserker({});
            system.recruitBerserker({});
            expect(system.listBerserkers().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listBerserkers().length).toBe(0);
        });
    });

    describe('listByHandler', () => {
        it('should filter', () => {
            system.recruitBerserker({ handlerId: 'h1' });
            system.recruitBerserker({ handlerId: 'h2' });
            expect(system.listByHandler('h1').length).toBe(1);
        });

        it('should return empty for unknown handler', () => {
            system.recruitBerserker({ handlerId: 'h1' });
            expect(system.listByHandler('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { berserker } = system.recruitBerserker({});
            system.legendBerserker(berserker.berserkerId);
            system.recruitBerserker({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitBerserker({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addFrenzy', () => {
        it('should add frenzy', () => {
            const { berserker } = system.recruitBerserker({});
            system.addFrenzy(berserker.berserkerId, 'Blood Rage');
            expect(berserker.frenzies).toContain('Blood Rage');
            expect(berserker.frenzies.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addFrenzy('ghost', 'Rage');
            expect(result.error).toBe('BERSERKER_NOT_FOUND');
        });

        it('should promote to furious at 3 frenzies', () => {
            const { berserker } = system.recruitBerserker({});
            system.addFrenzy(berserker.berserkerId, 'A');
            system.addFrenzy(berserker.berserkerId, 'B');
            system.addFrenzy(berserker.berserkerId, 'C');
            expect(berserker.status).toBe('furious');
        });

        it('should not promote to furious below 3 frenzies', () => {
            const { berserker } = system.recruitBerserker({});
            system.addFrenzy(berserker.berserkerId, 'A');
            system.addFrenzy(berserker.berserkerId, 'B');
            expect(berserker.status).toBe('calm');
        });

        it('should trigger frenzyAdded hook', () => {
            const { berserker } = system.recruitBerserker({});
            let called = false;
            system.registerHook('frenzyAdded', () => { called = true; });
            system.addFrenzy(berserker.berserkerId, 'Rage');
            expect(called).toBe(true);
        });
    });

    describe('buildRage', () => {
        it('should build rage with amount', () => {
            const { berserker } = system.recruitBerserker({});
            system.buildRage(berserker.berserkerId, 15);
            expect(berserker.rage).toBe(25);
        });

        it('should build rage with default', () => {
            const { berserker } = system.recruitBerserker({});
            system.buildRage(berserker.berserkerId);
            expect(berserker.rage).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.buildRage('ghost', 10);
            expect(result.error).toBe('BERSERKER_NOT_FOUND');
        });

        it('should trigger rageBuilt hook', () => {
            const { berserker } = system.recruitBerserker({});
            let called = false;
            system.registerHook('rageBuilt', () => { called = true; });
            system.buildRage(berserker.berserkerId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBerserker', () => {
        it('should level up', () => {
            const { berserker } = system.recruitBerserker({});
            system.levelUpBerserker(berserker.berserkerId);
            expect(berserker.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { berserker } = system.recruitBerserker({});
            system.levelUpBerserker(berserker.berserkerId);
            system.levelUpBerserker(berserker.berserkerId);
            system.levelUpBerserker(berserker.berserkerId);
            expect(berserker.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpBerserker('ghost');
            expect(result.error).toBe('BERSERKER_NOT_FOUND');
        });

        it('should trigger berserkerLeveledUp hook', () => {
            const { berserker } = system.recruitBerserker({});
            let called = false;
            system.registerHook('berserkerLeveledUp', () => { called = true; });
            system.levelUpBerserker(berserker.berserkerId);
            expect(called).toBe(true);
        });
    });

    describe('legendBerserker', () => {
        it('should legendize', () => {
            const { berserker } = system.recruitBerserker({});
            system.legendBerserker(berserker.berserkerId);
            expect(berserker.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBerserker('ghost');
            expect(result.error).toBe('BERSERKER_NOT_FOUND');
        });

        it('should trigger berserkerLegendized hook', () => {
            const { berserker } = system.recruitBerserker({});
            let called = false;
            system.registerHook('berserkerLegendized', () => { called = true; });
            system.legendBerserker(berserker.berserkerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBerserkerValue', () => {
        it('should calculate', () => {
            const { berserker } = system.recruitBerserker({});
            system.levelUpBerserker(berserker.berserkerId);
            system.buildRage(berserker.berserkerId, 5);
            system.addFrenzy(berserker.berserkerId, 'Axe Fury');
            // level=2, rage=15, frenzies.length=1 => 2*100 + 15*2 + 1*30 = 200+30+30 = 260
            expect(system.calculateBerserkerValue(berserker.berserkerId)).toBe(260);
        });

        it('should calculate base value', () => {
            const { berserker } = system.recruitBerserker({});
            // level=1, rage=10, frenzies.length=0 => 1*100 + 10*2 + 0*30 = 100+20+0 = 120
            expect(system.calculateBerserkerValue(berserker.berserkerId)).toBe(120);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBerserkerValue('ghost')).toBe(0);
        });
    });

    describe('listFurious', () => {
        it('should filter furious', () => {
            const { berserker } = system.recruitBerserker({});
            system.addFrenzy(berserker.berserkerId, 'A');
            system.addFrenzy(berserker.berserkerId, 'B');
            system.addFrenzy(berserker.berserkerId, 'C');
            system.recruitBerserker({});
            expect(system.listFurious().length).toBe(1);
        });

        it('should return empty when none furious', () => {
            system.recruitBerserker({});
            expect(system.listFurious().length).toBe(0);
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

        it('should execute default getBerserker', () => {
            const result = system.executeTool('getBerserker', { berserkerId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitBerserker', () => {
            const result = system.executeTool('recruitBerserker', { name: 'Test' });
            expect(result.success).toBe(true);
            expect(result.result.berserker.name).toBe('Test');
        });

        it('should include default tools in listTools', () => {
            const tools = system.listTools();
            expect(tools).toContain('getBerserker');
            expect(tools).toContain('recruitBerserker');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('berserkerRecruited', () => count++);
            unregister();
            system.recruitBerserker({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('berserkerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBerserker({})).not.toThrow();
        });

        it('should not throw on unregistered event trigger', () => {
            expect(() => system._triggerHook('nonExistentEvent', {})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBerserkers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalBerserkers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBerserker({});
            const json = system.toJSON();
            expect(json.berserkers.length).toBe(1);
            expect(json.stats).toBeDefined();
            expect(json.config).toBeDefined();
        });
        it('should deserialize', () => {
            system.recruitBerserker({});
            const json = system.toJSON();
            const newSys = new CultivationBerserker();
            newSys.fromJSON(json);
            expect(newSys.berserkers.size).toBe(1);
        });

        it('should handle partial fromJSON', () => {
            const newSys = new CultivationBerserker();
            newSys.fromJSON({});
            expect(newSys.berserkers.size).toBe(0);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.berserkerCount).toBe(0);
            expect(stats.totalBerserkers).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });

        it('should update stats after recruiting', () => {
            system.recruitBerserker({});
            const stats = system.getStats();
            expect(stats.berserkerCount).toBe(1);
            expect(stats.totalBerserkers).toBe(1);
        });
    });

    describe('Config', () => {
        it('should accept custom config', () => {
            const customSys = new CultivationBerserker({ maxBerserkers: 100, baseRage: 25 });
            expect(customSys.config.maxBerserkers).toBe(100);
            expect(customSys.config.baseRage).toBe(25);
        });

        it('should use custom baseRage in recruit', () => {
            const customSys = new CultivationBerserker({ baseRage: 50 });
            const { berserker } = customSys.recruitBerserker({});
            expect(berserker.rage).toBe(50);
        });

        it('should use custom data.rage when provided', () => {
            const { berserker } = system.recruitBerserker({ rage: 99 });
            expect(berserker.rage).toBe(99);
        });
    });
});
