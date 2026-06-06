/**
 * CultivationBuddhist.test.js - 修真佛修测试
 * V640 Iteration 23/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBuddhist } from '../../../systems/ai/CultivationBuddhist.js';

describe('CultivationBuddhist', () => {
    let system;
    beforeEach(() => { system = new CultivationBuddhist(); });

    describe('recruitBuddhist', () => {
        it('should recruit', () => {
            const { buddhist } = system.recruitBuddhist({ abbotId: 'a1', name: 'Hui Neng', type: 'chan' });
            expect(buddhist.abbotId).toBe('a1');
            expect(buddhist.name).toBe('Hui Neng');
            expect(buddhist.type).toBe('chan');
            expect(buddhist.karma).toBe(20);
            expect(buddhist.level).toBe(1);
            expect(buddhist.status).toBe('novice');
            expect(buddhist.sutras).toEqual([]);
        });

        it('should default to chan type', () => {
            const { buddhist } = system.recruitBuddhist({});
            expect(buddhist.type).toBe('chan');
        });

        it('should support pure and vajra types', () => {
            const pure = system.recruitBuddhist({ type: 'pure' }).buddhist;
            const vajra = system.recruitBuddhist({ type: 'vajra' }).buddhist;
            expect(pure.type).toBe('pure');
            expect(vajra.type).toBe('vajra');
        });

        it('should trigger buddhistRecruited hook', () => {
            let called = false;
            system.registerHook('buddhistRecruited', () => { called = true; });
            system.recruitBuddhist({});
            expect(called).toBe(true);
        });
    });

    describe('getBuddhist', () => {
        it('should return', () => {
            const { buddhist } = system.recruitBuddhist({});
            expect(system.getBuddhist(buddhist.buddhistId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBuddhist('ghost')).toBeNull(); });
    });

    describe('listBuddhists', () => {
        it('should list all', () => {
            system.recruitBuddhist({});
            system.recruitBuddhist({});
            expect(system.listBuddhists().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listBuddhists().length).toBe(0);
        });
    });

    describe('listByAbbot', () => {
        it('should filter', () => {
            system.recruitBuddhist({ abbotId: 'a1' });
            system.recruitBuddhist({ abbotId: 'a2' });
            system.recruitBuddhist({ abbotId: 'a1' });
            expect(system.listByAbbot('a1').length).toBe(2);
            expect(system.listByAbbot('a2').length).toBe(1);
        });

        it('should return empty for unknown abbot', () => {
            expect(system.listByAbbot('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { buddhist: b1 } = system.recruitBuddhist({});
            const { buddhist: b2 } = system.recruitBuddhist({});
            system.legendBuddhist(b2.buddhistId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].buddhistId).toBe(b2.buddhistId);
        });
    });

    describe('addSutra', () => {
        it('should add', () => {
            const { buddhist } = system.recruitBuddhist({});
            system.addSutra(buddhist.buddhistId, 'Heart Sutra');
            expect(buddhist.sutras.length).toBe(1);
            expect(buddhist.sutras[0]).toBe('Heart Sutra');
        });

        it('should reject missing', () => {
            const result = system.addSutra('ghost', 'Diamond Sutra');
            expect(result.error).toBe('BUDDHIST_NOT_FOUND');
        });

        it('should trigger sutraAdded hook', () => {
            const { buddhist } = system.recruitBuddhist({});
            let called = false;
            system.registerHook('sutraAdded', () => { called = true; });
            system.addSutra(buddhist.buddhistId, 'Lotus Sutra');
            expect(called).toBe(true);
        });
    });

    describe('gainKarma', () => {
        it('should gain with default amount', () => {
            const { buddhist } = system.recruitBuddhist({});
            system.gainKarma(buddhist.buddhistId);
            expect(buddhist.karma).toBe(25);
        });

        it('should gain with custom amount', () => {
            const { buddhist } = system.recruitBuddhist({});
            system.gainKarma(buddhist.buddhistId, 50);
            expect(buddhist.karma).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.gainKarma('ghost', 10);
            expect(result.error).toBe('BUDDHIST_NOT_FOUND');
        });

        it('should trigger karmaGained hook', () => {
            const { buddhist } = system.recruitBuddhist({});
            let called = false;
            system.registerHook('karmaGained', () => { called = true; });
            system.gainKarma(buddhist.buddhistId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBuddhist', () => {
        it('should level up', () => {
            const { buddhist } = system.recruitBuddhist({});
            system.levelUpBuddhist(buddhist.buddhistId);
            expect(buddhist.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpBuddhist('ghost');
            expect(result.error).toBe('BUDDHIST_NOT_FOUND');
        });

        it('should trigger buddhistLeveledUp hook', () => {
            const { buddhist } = system.recruitBuddhist({});
            let captured = null;
            system.registerHook('buddhistLeveledUp', (data) => { captured = data; });
            system.levelUpBuddhist(buddhist.buddhistId);
            expect(captured.newLevel).toBe(2);
        });
    });

    describe('legendBuddhist', () => {
        it('should legendize', () => {
            const { buddhist } = system.recruitBuddhist({});
            system.legendBuddhist(buddhist.buddhistId);
            expect(buddhist.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBuddhist('ghost');
            expect(result.error).toBe('BUDDHIST_NOT_FOUND');
        });

        it('should trigger buddhistLegendized hook', () => {
            const { buddhist } = system.recruitBuddhist({});
            let called = false;
            system.registerHook('buddhistLegendized', () => { called = true; });
            system.legendBuddhist(buddhist.buddhistId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBuddhistValue', () => {
        it('should calculate base', () => {
            const { buddhist } = system.recruitBuddhist({});
            // level 1 * 100 + karma 20 * 2 + sutras 0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateBuddhistValue(buddhist.buddhistId)).toBe(140);
        });

        it('should reflect sutras', () => {
            const { buddhist } = system.recruitBuddhist({});
            system.addSutra(buddhist.buddhistId, 'A');
            system.addSutra(buddhist.buddhistId, 'B');
            // 100 + 40 + 60 = 200
            expect(system.calculateBuddhistValue(buddhist.buddhistId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBuddhistValue('ghost')).toBe(0);
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

        it('should execute default getBuddhist', () => {
            const result = system.executeTool('getBuddhist', { buddhistId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('buddhistRecruited', () => count++);
            unregister();
            system.recruitBuddhist({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('buddhistRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBuddhist({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBuddhists = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalBuddhists = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBuddhist({});
            const json = system.toJSON();
            expect(json.buddhists.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBuddhist({});
            const json = system.toJSON();
            const newSys = new CultivationBuddhist();
            newSys.fromJSON(json);
            expect(newSys.buddhists.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.buddhistCount).toBe(0);
            expect(stats.totalBuddhists).toBe(0);
        });
    });
});
