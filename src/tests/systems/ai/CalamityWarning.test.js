/**
 * CalamityWarning.test.js - 灾难预警测试
 * V387 Iteration 3/9 Round 12 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CalamityWarning } from '../../../systems/ai/CalamityWarning.js';

describe('CalamityWarning', () => {
    let system;
    beforeEach(() => { system = new CalamityWarning(); });

    describe('issueWarning', () => {
        it('should issue', () => {
            const { warning } = system.issueWarning({ level: 'red', targetRegion: 'east' });
            expect(warning.level).toBe('red');
        });

        it('should trigger warningIssued hook', () => {
            let called = false;
            system.registerHook('warningIssued', () => { called = true; });
            system.issueWarning({});
            expect(called).toBe(true);
        });
    });

    describe('getWarning', () => {
        it('should return', () => {
            const { warning } = system.issueWarning({});
            expect(system.getWarning(warning.warningId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWarning('ghost')).toBeNull(); });
    });

    describe('listWarnings', () => {
        it('should list all', () => {
            system.issueWarning({});
            expect(system.listWarnings().length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter', () => {
            const { warning } = system.issueWarning({});
            warning.status = 'cancelled';
            system.issueWarning({});
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('listByLevel', () => {
        it('should filter', () => {
            system.issueWarning({ level: 'yellow' });
            system.issueWarning({ level: 'red' });
            expect(system.listByLevel('red').length).toBe(1);
        });
    });

    describe('listByRegion', () => {
        it('should filter', () => {
            system.issueWarning({ targetRegion: 'east' });
            system.issueWarning({ targetRegion: 'west' });
            expect(system.listByRegion('east').length).toBe(1);
        });
    });

    describe('escalateLevel', () => {
        it('should escalate', () => {
            const { warning } = system.issueWarning({ level: 'yellow' });
            system.escalateLevel(warning.warningId);
            expect(warning.level).toBe('orange');
        });

        it('should cap at black', () => {
            const { warning } = system.issueWarning({ level: 'black' });
            system.escalateLevel(warning.warningId);
            expect(warning.level).toBe('black');
        });

        it('should reject missing', () => {
            const result = system.escalateLevel('ghost');
            expect(result.error).toBe('WARNING_NOT_FOUND');
        });

        it('should trigger warningEscalated hook', () => {
            const { warning } = system.issueWarning({ level: 'yellow' });
            let called = false;
            system.registerHook('warningEscalated', () => { called = true; });
            system.escalateLevel(warning.warningId);
            expect(called).toBe(true);
        });
    });

    describe('cancelWarning', () => {
        it('should cancel', () => {
            const { warning } = system.issueWarning({});
            system.cancelWarning(warning.warningId);
            expect(warning.status).toBe('cancelled');
        });

        it('should reject missing', () => {
            const result = system.cancelWarning('ghost');
            expect(result.error).toBe('WARNING_NOT_FOUND');
        });

        it('should trigger warningCancelled hook', () => {
            const { warning } = system.issueWarning({});
            let called = false;
            system.registerHook('warningCancelled', () => { called = true; });
            system.cancelWarning(warning.warningId);
            expect(called).toBe(true);
        });
    });

    describe('purgeExpired', () => {
        it('should purge', () => {
            const { warning } = system.issueWarning({});
            warning.expiresAt = Date.now() - 1000;
            const result = system.purgeExpired();
            expect(result.purged).toBe(1);
        });

        it('should not purge valid', () => {
            system.issueWarning({});
            const result = system.purgeExpired();
            expect(result.purged).toBe(0);
        });
    });

    describe('countByLevel', () => {
        it('should count', () => {
            system.issueWarning({ level: 'yellow' });
            system.issueWarning({ level: 'red' });
            const counts = system.countByLevel();
            expect(counts.yellow).toBe(1);
            expect(counts.red).toBe(1);
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

        it('should execute default getWarning', () => {
            const result = system.executeTool('getWarning', { warningId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('warningIssued', () => count++);
            unregister();
            system.issueWarning({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('warningIssued', () => { throw new Error('x'); });
            expect(() => system.issueWarning({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWarnings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWarnings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.issueWarning({});
            const json = system.toJSON();
            expect(json.warnings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.issueWarning({});
            const json = system.toJSON();
            const newSys = new CalamityWarning();
            newSys.fromJSON(json);
            expect(newSys.warnings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.warningCount).toBe(0);
        });
    });
});