/**
 * FormationBreaking.test.js - 破阵系统测试
 * V414 Iteration 6/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormationBreaking } from '../../../systems/ai/FormationBreaking.js';

describe('FormationBreaking', () => {
    let system;
    beforeEach(() => { system = new FormationBreaking(); });

    describe('startBreaking', () => {
        it('should start', () => {
            const { breaking } = system.startBreaking({ cultivatorId: 'c1', formationId: 'f1' });
            expect(breaking.cultivatorId).toBe('c1');
            expect(breaking.formationId).toBe('f1');
        });

        it('should default difficulty to baseDifficulty', () => {
            const { breaking } = system.startBreaking({});
            expect(breaking.difficulty).toBe(100);
        });

        it('should set status to attempted', () => {
            const { breaking } = system.startBreaking({});
            expect(breaking.status).toBe('attempted');
        });

        it('should initialize progress 0 and attempts 0', () => {
            const { breaking } = system.startBreaking({});
            expect(breaking.progress).toBe(0);
            expect(breaking.attempts).toBe(0);
        });

        it('should trigger breakingStarted hook', () => {
            let called = false;
            system.registerHook('breakingStarted', () => { called = true; });
            system.startBreaking({});
            expect(called).toBe(true);
        });
    });

    describe('getBreaking', () => {
        it('should return', () => {
            const { breaking } = system.startBreaking({});
            expect(system.getBreaking(breaking.breakingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBreaking('ghost')).toBeNull(); });
    });

    describe('listBreakings', () => {
        it('should list all', () => {
            system.startBreaking({});
            expect(system.listBreakings().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.startBreaking({ cultivatorId: 'c1' });
            system.startBreaking({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter by attempted', () => {
            system.startBreaking({});
            system.startBreaking({});
            expect(system.listByStatus('attempted').length).toBe(2);
        });
        it('should filter by broken', () => {
            const { breaking } = system.startBreaking({ difficulty: 50 });
            breaking.progress = 50;
            breaking.status = 'broken';
            expect(system.listByStatus('broken').length).toBe(1);
        });
    });

    describe('listByFormation', () => {
        it('should filter', () => {
            system.startBreaking({ formationId: 'f1' });
            system.startBreaking({ formationId: 'f2' });
            expect(system.listByFormation('f1').length).toBe(1);
        });
    });

    describe('analyzeBreaking', () => {
        it('should analyze', () => {
            const { breaking } = system.startBreaking({});
            system.analyzeBreaking(breaking.breakingId, 20);
            expect(breaking.progress).toBe(20);
        });

        it('should increment attempts', () => {
            const { breaking } = system.startBreaking({});
            system.analyzeBreaking(breaking.breakingId, 10);
            expect(breaking.attempts).toBe(1);
        });

        it('should default amount to 10', () => {
            const { breaking } = system.startBreaking({});
            system.analyzeBreaking(breaking.breakingId);
            expect(breaking.progress).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.analyzeBreaking('ghost', 10);
            expect(result.error).toBe('BREAKING_NOT_FOUND');
        });

        it('should trigger breakingAnalyzed hook', () => {
            const { breaking } = system.startBreaking({});
            let called = false;
            system.registerHook('breakingAnalyzed', () => { called = true; });
            system.analyzeBreaking(breaking.breakingId, 10);
            expect(called).toBe(true);
        });
    });

    describe('completeBreaking', () => {
        it('should complete success path', () => {
            const { breaking } = system.startBreaking({ difficulty: 50 });
            breaking.progress = 50;
            const result = system.completeBreaking(breaking.breakingId);
            expect(result.status).toBe('broken');
            expect(breaking.status).toBe('broken');
        });

        it('should complete fail path', () => {
            const { breaking } = system.startBreaking({ difficulty: 100 });
            breaking.progress = 30;
            const result = system.completeBreaking(breaking.breakingId);
            expect(result.status).toBe('failed');
            expect(breaking.status).toBe('failed');
        });

        it('should reject missing', () => {
            const result = system.completeBreaking('ghost');
            expect(result.error).toBe('BREAKING_NOT_FOUND');
        });

        it('should trigger breakingCompleted hook on success', () => {
            const { breaking } = system.startBreaking({ difficulty: 50 });
            breaking.progress = 50;
            let called = false;
            system.registerHook('breakingCompleted', () => { called = true; });
            system.completeBreaking(breaking.breakingId);
            expect(called).toBe(true);
        });

        it('should trigger breakingFailed hook on fail', () => {
            const { breaking } = system.startBreaking({ difficulty: 100 });
            breaking.progress = 30;
            let called = false;
            system.registerHook('breakingFailed', () => { called = true; });
            system.completeBreaking(breaking.breakingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateProgressRate', () => {
        it('should calculate', () => {
            const { breaking } = system.startBreaking({ difficulty: 100 });
            breaking.progress = 50;
            expect(system.calculateProgressRate(breaking.breakingId)).toBe(0.5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateProgressRate('ghost')).toBe(0);
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

        it('should execute default getBreaking', () => {
            const result = system.executeTool('getBreaking', { breakingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('breakingStarted', () => count++);
            unregister();
            system.startBreaking({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('breakingStarted', () => { throw new Error('x'); });
            expect(() => system.startBreaking({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBreakings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBreakings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startBreaking({});
            const json = system.toJSON();
            expect(json.breakings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startBreaking({});
            const json = system.toJSON();
            const newSys = new FormationBreaking();
            newSys.fromJSON(json);
            expect(newSys.breakings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.breakingCount).toBe(0);
        });
    });
});
