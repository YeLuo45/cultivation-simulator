/**
 * CultivationDreamMythologyArchive.test.js - 修真神话典籍测试
 * V877 P-20260613-020 Iteration 20/30 Round 34
 * 目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamMythologyArchive,
    MYTH_TYPES, MYTH_TYPE_COUNT,
    ARCHIVE_SECTIONS, ARCHIVE_SECTION_COUNT,
    LEGEND_TIERS, LEGEND_TIER_COUNT,
    DEFAULT_MAX_MYTHS, MAX_UNLOCKS_PER_ARCHIVE,
    MYTH_TYPE_NOT_FOUND, MYTH_NOT_FOUND, INVALID_INPUT, ALREADY_UNLOCKED, INSUFFICIENT_SCORE,
} from '../../../systems/ai/CultivationDreamMythologyArchive.js';

describe('CultivationDreamMythologyArchive', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamMythologyArchive(); });

    describe('constructor', () => {
        it('defaults', () => {
            expect(system.config.maxMyths).toBe(DEFAULT_MAX_MYTHS);
            expect(system.config.maxUnlocksPerArchive).toBe(MAX_UNLOCKS_PER_ARCHIVE);
            expect(system.config.autoUnlock).toBe(false);
        });
        it('custom config', () => {
            const s = new CultivationDreamMythologyArchive({ maxMyths: 10, autoUnlock: true });
            expect(s.config.maxMyths).toBe(10);
            expect(s.config.autoUnlock).toBe(true);
        });
        it('init empty', () => {
            expect(system.myths.size).toBe(0);
            expect(system.dreamMyths.size).toBe(0);
        });
        it('init stats', () => {
            expect(system.stats.totalAdded).toBe(0);
            expect(system.stats.byType.creation).toBe(0);
        });
        it('default tools', () => {
            expect(system.tools.has('getMyth')).toBe(true);
            expect(system.tools.has('listBySection')).toBe(true);
            expect(system.tools.has('listUnlocked')).toBe(true);
        });
    });

    describe('addMyth', () => {
        it('creation', () => {
            const { success, myth } = system.addMyth('d1', 'creation');
            expect(success).toBe(true);
            expect(myth.mythType).toBe('creation');
        });
        it('destruction', () => {
            const { myth } = system.addMyth('d1', 'destruction');
            expect(myth.mythType).toBe('destruction');
        });
        it('transformation', () => {
            const { myth } = system.addMyth('d1', 'transformation');
            expect(myth.mythType).toBe('transformation');
        });
        it('reject empty dreamId', () => {
            expect(system.addMyth('', 'creation').error).toBe(INVALID_INPUT);
        });
        it('reject unknown type', () => {
            expect(system.addMyth('d1', 'unknown').error).toBe(MYTH_TYPE_NOT_FOUND);
        });
        it('reject non-string type', () => {
            expect(system.addMyth('d1', 123).error).toBe(MYTH_TYPE_NOT_FOUND);
        });
        it('trim per dream', () => {
            const s = new CultivationDreamMythologyArchive({ maxUnlocksPerArchive: 2 });
            s.addMyth('d1', 'creation');
            s.addMyth('d1', 'destruction');
            s.addMyth('d1', 'transformation');
            expect(s.listByDream('d1').length).toBe(2);
        });
        it('hook onAdded', () => {
            let c = 0;
            system.registerHook('onAdded', () => { c++; });
            system.addMyth('d1', 'creation');
            expect(c).toBe(1);
        });
        it('autoUnlock', () => {
            const s = new CultivationDreamMythologyArchive({ autoUnlock: true });
            const { myth } = s.addMyth('d1', 'creation');
            const internal = s.myths.get(myth.id);
            expect(internal.unlocked).toBe(true);
        });
        it('all types trackable', () => {
            for (const t of MYTH_TYPES) {
                system.addMyth('d1', t);
            }
            expect(system.stats.byType.creation).toBe(1);
            expect(system.stats.byType.destruction).toBe(1);
            expect(system.stats.byType.transformation).toBe(1);
        });
    });

    describe('queryArchive', () => {
        beforeEach(() => {
            system.addMyth('d1', 'creation');
            system.addMyth('d1', 'destruction');
            system.addMyth('d2', 'creation');
        });
        it('by dreamId', () => {
            const r = system.queryArchive({ dreamId: 'd1' });
            expect(r.results.length).toBe(2);
        });
        it('by mythType', () => {
            const r = system.queryArchive({ mythType: 'creation' });
            expect(r.results.length).toBe(2);
        });
        it('by section', () => {
            const r = system.queryArchive({ section: ARCHIVE_SECTIONS[0] });
            expect(r.results.length).toBe(2);
        });
        it('by tier', () => {
            const r = system.queryArchive({ tier: 'mortal' });
            expect(r.results.length).toBe(3);
        });
        it('unlocked filter', () => {
            const r = system.queryArchive({ unlocked: false });
            expect(r.results.length).toBe(3);
        });
        it('unlocked=true filter', () => {
            const { myth } = system.addMyth('d1', 'creation');
            system.unlockLegend(myth.id, 0.95);
            const r = system.queryArchive({ unlocked: true });
            expect(r.results.length).toBe(1);
        });
        it('invalid query', () => {
            expect(system.queryArchive(null).error).toBe(INVALID_INPUT);
        });
        it('unknown mythType filter ignored', () => {
            const r = system.queryArchive({ mythType: 'unknown' });
            expect(r.results.length).toBe(3);
        });
        it('unknown section filter yields empty', () => {
            const r = system.queryArchive({ section: 'unknown' });
            expect(r.results.length).toBe(0);
        });
    });

    describe('unlockLegend', () => {
        it('unlock creation', () => {
            const { myth } = system.addMyth('d1', 'creation');
            const r = system.unlockLegend(myth.id, 0.95);
            expect(r.success).toBe(true);
            expect(r.tier).toBe('immortal');
        });
        it('reject empty id', () => {
            expect(system.unlockLegend('', 0.5).error).toBe(INVALID_INPUT);
        });
        it('reject missing', () => {
            expect(system.unlockLegend('ghost', 0.95).error).toBe(MYTH_NOT_FOUND);
        });
        it('reject double-unlock', () => {
            const { myth } = system.addMyth('d1', 'creation');
            system.unlockLegend(myth.id, 0.95);
            expect(system.unlockLegend(myth.id, 0.95).error).toBe(ALREADY_UNLOCKED);
        });
        it('tier selection by score', () => {
            const { myth: m1 } = system.addMyth('d1', 'creation');
            const r1 = system.unlockLegend(m1.id, 0.0);
            expect(r1.tier).toBe('mortal');
        });
        it('default score 0 is mortal (still unlocks)', () => {
            const { myth } = system.addMyth('d1', 'creation');
            const r = system.unlockLegend(myth.id);
            expect(r.success).toBe(true);
        });
        it('hook onUnlocked', () => {
            const { myth } = system.addMyth('d1', 'creation');
            let c = 0;
            system.registerHook('onUnlocked', () => { c++; });
            system.unlockLegend(myth.id, 0.95);
            expect(c).toBe(1);
        });
    });

    describe('getMyth / listByDream / listByType / listBySection / listUnlockedMyths', () => {
        beforeEach(() => {
            system.addMyth('d1', 'creation');
            system.addMyth('d1', 'destruction');
            system.addMyth('d2', 'transformation');
        });
        it('getMyth copy', () => {
            const { myth } = system.addMyth('d3', 'creation');
            const g = system.getMyth(myth.id);
            expect(g).toEqual(myth);
        });
        it('getMyth null', () => {
            expect(system.getMyth('ghost')).toBeNull();
        });
        it('listByDream', () => {
            expect(system.listByDream('d1').length).toBe(2);
        });
        it('listByDream unknown', () => {
            expect(system.listByDream('ghost')).toEqual([]);
        });
        it('listByType', () => {
            expect(system.listByType('creation').length).toBe(1);
        });
        it('listByType unknown', () => {
            expect(system.listByType('unknown')).toEqual([]);
        });
        it('listBySection', () => {
            expect(system.listBySection(ARCHIVE_SECTIONS[0]).length).toBe(1);
        });
        it('listBySection unknown', () => {
            expect(system.listBySection('unknown')).toEqual([]);
        });
        it('listUnlockedMyths empty', () => {
            expect(system.listUnlockedMyths()).toEqual([]);
        });
        it('listUnlockedMyths after unlock', () => {
            const { myth } = system.addMyth('d3', 'creation');
            system.unlockLegend(myth.id, 0.95);
            expect(system.listUnlockedMyths().length).toBe(1);
        });
    });

    describe('deleteMyth', () => {
        it('delete', () => {
            const { myth } = system.addMyth('d1', 'creation');
            expect(system.deleteMyth(myth.id).success).toBe(true);
            expect(system.getMyth(myth.id)).toBeNull();
        });
        it('reject missing', () => {
            expect(system.deleteMyth('ghost').error).toBe(MYTH_NOT_FOUND);
        });
    });

    describe('registerTool + executeTool', () => {
        it('register custom', () => {
            expect(system.registerTool('t', () => 1).success).toBe(true);
        });
        it('reject invalid name', () => {
            expect(system.registerTool('', () => {}).error).toBe(INVALID_INPUT);
        });
        it('reject invalid handler', () => {
            expect(system.registerTool('t', null).error).toBe(INVALID_INPUT);
        });
        it('execute', () => {
            system.registerTool('get42', () => 42);
            expect(system.executeTool('get42').result).toBe(42);
        });
        it('pass context', () => {
            system.registerTool('echo', (ctx) => ctx);
            expect(system.executeTool('echo', { x: 1 }).result.x).toBe(1);
        });
        it('missing context default', () => {
            system.registerTool('echoAll', (ctx) => Object.keys(ctx).length);
            expect(system.executeTool('echoAll').result).toBe(0);
        });
        it('null context', () => {
            system.registerTool('echoAll2', (ctx) => Object.keys(ctx || {}).length);
            expect(system.executeTool('echoAll2', null).result).toBe(0);
        });
        it('unknown tool', () => {
            expect(system.executeTool('nope').error).toBe('UNKNOWN_TOOL');
        });
        it('tool error', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            expect(system.executeTool('bad').error).toBe('TOOL_EXECUTION_ERROR');
        });
        it('builtin getMyth', () => {
            const { myth } = system.addMyth('d1', 'creation');
            const r = system.executeTool('getMyth', { mythId: myth.id });
            expect(r.result.id).toBe(myth.id);
        });
    });

    describe('registerHook', () => {
        it('register', () => {
            expect(system.registerHook('onX', () => {}).success).toBe(true);
        });
        it('reject invalid event', () => {
            expect(system.registerHook('', () => {}).error).toBe(INVALID_INPUT);
        });
        it('reject invalid handler', () => {
            expect(system.registerHook('onX', null).error).toBe(INVALID_INPUT);
        });
        it('multiple handlers on onAdded', () => {
            let n = 0;
            system.registerHook('onAdded', () => { n++; });
            system.registerHook('onAdded', () => { n++; });
            system.addMyth('d1', 'creation');
            expect(n).toBe(2);
        });
        it('silent hook errors', () => {
            system.registerHook('onAdded', () => { throw new Error('x'); });
            expect(() => system.addMyth('d1', 'creation')).not.toThrow();
        });
        it('unregister', () => {
            const h = () => {};
            system.registerHook('onX', h);
            expect(system.unregisterHook('onX', h).success).toBe(true);
        });
        it('unregister unknown event', () => {
            expect(system.unregisterHook('nope', () => {}).error).toBe('EVENT_NOT_FOUND');
        });
        it('unregister unknown handler', () => {
            system.registerHook('onX', () => {});
            expect(system.unregisterHook('onX', () => {}).error).toBe('HANDLER_NOT_FOUND');
        });
    });

    describe('toJSON / fromJSON', () => {
        it('roundtrip', () => {
            system.addMyth('d1', 'creation');
            const json = system.toJSON();
            const s2 = new CultivationDreamMythologyArchive();
            expect(s2.fromJSON(json).success).toBe(true);
            expect(s2.myths.size).toBe(1);
        });
        it('reject null', () => {
            expect(system.fromJSON(null).error).toBe(INVALID_INPUT);
        });
    });

    describe('getStats / reset / constants / helper', () => {
        it('stats', () => {
            expect(system.getStats().totalTracked).toBe(0);
        });
        it('reset', () => {
            system.addMyth('d1', 'creation');
            system.reset();
            expect(system.myths.size).toBe(0);
        });
        it('config constants', () => {
            expect(MYTH_TYPE_COUNT).toBe(3);
            expect(ARCHIVE_SECTION_COUNT).toBe(5);
            expect(LEGEND_TIER_COUNT).toBe(4);
        });
        it('helper _sectionForType default', () => {
            expect(system._sectionForType('unknown')).toBe(ARCHIVE_SECTIONS[3]);
        });
        it('helper _contentForType default', () => {
            expect(system._contentForType('unknown')).toBeDefined();
        });
        it('helper _titleForType transformation', () => {
            const t = system._titleForType('transformation', 1);
            expect(t).toContain('化世');
        });
    });
});
