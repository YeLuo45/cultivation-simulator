/**
 * HeavenResponse.test.js - 天道感应测试
 * V392 Iteration 8/9 Round 12 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HeavenResponse } from '../../../systems/ai/HeavenResponse.js';

describe('HeavenResponse', () => {
    let system;
    beforeEach(() => { system = new HeavenResponse(); });

    describe('recordResponse', () => {
        it('should record', () => {
            const { response } = system.recordResponse({ cultivatorId: 'c1' });
            expect(response.cultivatorId).toBe('c1');
        });

        it('should update favor', () => {
            system.recordResponse({ cultivatorId: 'c1', favorDelta: 10 });
            expect(system.getFavor('c1')).toBe(10);
        });

        it('should trigger responseRecorded hook', () => {
            let called = false;
            system.registerHook('responseRecorded', () => { called = true; });
            system.recordResponse({});
            expect(called).toBe(true);
        });
    });

    describe('getResponse', () => {
        it('should return', () => {
            const { response } = system.recordResponse({});
            expect(system.getResponse(response.responseId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getResponse('ghost')).toBeNull(); });
    });

    describe('listResponses', () => {
        it('should list all', () => {
            system.recordResponse({});
            expect(system.listResponses().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.recordResponse({ cultivatorId: 'c1' });
            system.recordResponse({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.recordResponse({ type: 'blessing' });
            system.recordResponse({ type: 'curse' });
            expect(system.listByType('blessing').length).toBe(1);
        });
    });

    describe('getFavor', () => {
        it('should return 0 for missing', () => {
            expect(system.getFavor('ghost')).toBe(0);
        });
    });

    describe('listTopFavored', () => {
        it('should rank', () => {
            system.recordResponse({ cultivatorId: 'c1', favorDelta: 10 });
            system.recordResponse({ cultivatorId: 'c2', favorDelta: 50 });
            const top = system.listTopFavored(2);
            expect(top[0].cultivatorId).toBe('c2');
        });
    });

    describe('bestowBlessing', () => {
        it('should add positive favor', () => {
            system.bestowBlessing('c1', 20);
            expect(system.getFavor('c1')).toBe(20);
        });
    });

    describe('bestowCurse', () => {
        it('should add negative favor', () => {
            system.bestowCurse('c1', 20);
            expect(system.getFavor('c1')).toBe(-20);
        });
    });

    describe('calculateTotalFavor', () => {
        it('should calculate', () => {
            system.recordResponse({ cultivatorId: 'c1', favorDelta: 10 });
            system.recordResponse({ cultivatorId: 'c2', favorDelta: 20 });
            expect(system.calculateTotalFavor()).toBe(30);
        });
    });

    describe('calculateAverageFavor', () => {
        it('should calculate', () => {
            system.recordResponse({ cultivatorId: 'c1', favorDelta: 10 });
            system.recordResponse({ cultivatorId: 'c2', favorDelta: 20 });
            expect(system.calculateAverageFavor()).toBe(15);
        });

        it('should return 0 for empty', () => {
            expect(system.calculateAverageFavor()).toBe(0);
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

        it('should execute default getResponse', () => {
            const result = system.executeTool('getResponse', { responseId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('responseRecorded', () => count++);
            unregister();
            system.recordResponse({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('responseRecorded', () => { throw new Error('x'); });
            expect(() => system.recordResponse({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalResponses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalResponses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recordResponse({});
            const json = system.toJSON();
            expect(json.responses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recordResponse({});
            const json = system.toJSON();
            const newSys = new HeavenResponse();
            newSys.fromJSON(json);
            expect(newSys.responses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.responseCount).toBe(0);
        });
    });
});