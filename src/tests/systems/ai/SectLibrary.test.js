/**
 * SectLibrary.test.js - 宗门典籍测试
 * V479 Iteration 11/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectLibrary } from '../../../systems/ai/SectLibrary.js';

describe('SectLibrary', () => {
    let system;
    beforeEach(() => { system = new SectLibrary(); });

    describe('archiveScroll', () => {
        it('should archive', () => {
            const { scroll } = system.archiveScroll({ name: 'Tome of Fire', sectId: 's1' });
            expect(scroll.name).toBe('Tome of Fire');
        });

        it('should trigger scrollArchived hook', () => {
            let called = false;
            system.registerHook('scrollArchived', () => { called = true; });
            system.archiveScroll({});
            expect(called).toBe(true);
        });
    });

    describe('getScroll', () => {
        it('should return', () => {
            const { scroll } = system.archiveScroll({});
            expect(system.getScroll(scroll.scrollId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getScroll('ghost')).toBeNull(); });
    });

    describe('listScrolls', () => {
        it('should list all', () => {
            system.archiveScroll({});
            expect(system.listScrolls().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.archiveScroll({ sectId: 's1' });
            system.archiveScroll({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.archiveScroll({ type: 'technique' });
            system.archiveScroll({ type: 'scripture' });
            expect(system.listByType('technique').length).toBe(1);
        });
    });

    describe('readScroll', () => {
        it('should read', () => {
            const { scroll } = system.archiveScroll({});
            system.readScroll(scroll.scrollId, 10);
            expect(scroll.mastery).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.readScroll('ghost', 10);
            expect(result.error).toBe('SCROLL_NOT_FOUND');
        });

        it('should trigger scrollRead hook', () => {
            const { scroll } = system.archiveScroll({});
            let called = false;
            system.registerHook('scrollRead', () => { called = true; });
            system.readScroll(scroll.scrollId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpScroll', () => {
        it('should level up', () => {
            const { scroll } = system.archiveScroll({});
            system.levelUpScroll(scroll.scrollId);
            expect(scroll.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpScroll('ghost');
            expect(result.error).toBe('SCROLL_NOT_FOUND');
        });

        it('should trigger scrollLeveled hook', () => {
            const { scroll } = system.archiveScroll({});
            let called = false;
            system.registerHook('scrollLeveled', () => { called = true; });
            system.levelUpScroll(scroll.scrollId);
            expect(called).toBe(true);
        });
    });

    describe('sealScroll', () => {
        it('should seal', () => {
            const { scroll } = system.archiveScroll({});
            system.sealScroll(scroll.scrollId);
            expect(scroll.status).toBe('sealed');
        });

        it('should reject missing', () => {
            const result = system.sealScroll('ghost');
            expect(result.error).toBe('SCROLL_NOT_FOUND');
        });

        it('should trigger scrollSealed hook', () => {
            const { scroll } = system.archiveScroll({});
            let called = false;
            system.registerHook('scrollSealed', () => { called = true; });
            system.sealScroll(scroll.scrollId);
            expect(called).toBe(true);
        });
    });

    describe('masterScroll', () => {
        it('should master', () => {
            const { scroll } = system.archiveScroll({});
            system.masterScroll(scroll.scrollId);
            expect(scroll.status).toBe('mastered');
        });

        it('should reject missing', () => {
            const result = system.masterScroll('ghost');
            expect(result.error).toBe('SCROLL_NOT_FOUND');
        });

        it('should trigger scrollMastered hook', () => {
            const { scroll } = system.archiveScroll({});
            let called = false;
            system.registerHook('scrollMastered', () => { called = true; });
            system.masterScroll(scroll.scrollId);
            expect(called).toBe(true);
        });
    });

    describe('calculateKnowledgeValue', () => {
        it('should calculate', () => {
            const { scroll } = system.archiveScroll({});
            system.readScroll(scroll.scrollId, 25);
            system.levelUpScroll(scroll.scrollId);
            expect(system.calculateKnowledgeValue(scroll.scrollId)).toBe(225);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateKnowledgeValue('ghost')).toBe(0);
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

        it('should execute default getScroll', () => {
            const result = system.executeTool('getScroll', { scrollId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('scrollArchived', () => count++);
            unregister();
            system.archiveScroll({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('scrollArchived', () => { throw new Error('x'); });
            expect(() => system.archiveScroll({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalScrolls = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalScrolls = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.archiveScroll({});
            const json = system.toJSON();
            expect(json.scrolls.length).toBe(1);
        });
        it('should deserialize', () => {
            system.archiveScroll({});
            const json = system.toJSON();
            const newSys = new SectLibrary();
            newSys.fromJSON(json);
            expect(newSys.scrolls.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.scrollCount).toBe(0);
        });
    });
});
