/**
 * CultivationDreamSpiritRootAwakening.test.js - 梦中灵根觉醒测试
 * V866 P-20260613-009 Iteration 9/30 Round 34
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamSpiritRootAwakening,
    SPIRIT_ROOT_TYPES,
    ROOT_TYPE_KEYS,
    QUALITY_GRADES,
    QUALITY_GRADE_MAX,
    STABILITY_THRESHOLDS,
    STABILITY_STABLE_THRESHOLD,
    STABILITY_INCREMENT,
    ROOT_STATES,
} from '../../../systems/ai/CultivationDreamSpiritRootAwakening.js';

describe('CultivationDreamSpiritRootAwakening', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamSpiritRootAwakening(); });

    describe('constructor edge cases', () => {
        it('should handle explicit maxRoots=0', () => {
            const s = new CultivationDreamSpiritRootAwakening({ maxRoots: 0 });
            expect(s.config.maxRoots).toBe(0);
        });
        it('should handle explicit stabilityIncrement=0', () => {
            const s = new CultivationDreamSpiritRootAwakening({ stabilityIncrement: 0 });
            expect(s.config.stabilityIncrement).toBe(0);
        });
        it('should handle explicit stabilityStableThreshold=0', () => {
            const s = new CultivationDreamSpiritRootAwakening({ stabilityStableThreshold: 0 });
            expect(s.config.stabilityStableThreshold).toBe(0);
        });
        it('should handle explicit stabilityCap=0', () => {
            const s = new CultivationDreamSpiritRootAwakening({ stabilityCap: 0 });
            expect(s.config.stabilityCap).toBe(0);
        });
    });

    describe('awakenSpiritRoot', () => {
        it('should awaken metal root', () => {
            const r = system.awakenSpiritRoot('d1', 'metal');
            expect(r.root.rootType).toBe('metal');
            expect(r.root.qualityGrade).toBe(1);
            expect(r.root.qualityName).toBe('common');
        });
        it('should awaken wood root', () => {
            const r = system.awakenSpiritRoot('d1', 'wood');
            expect(r.root.qualityGrade).toBe(2);
            expect(r.root.qualityName).toBe('rare');
        });
        it('should awaken water root', () => {
            const r = system.awakenSpiritRoot('d1', 'water');
            expect(r.root.qualityGrade).toBe(3);
            expect(r.root.qualityName).toBe('spiritual');
        });
        it('should awaken fire root', () => {
            const r = system.awakenSpiritRoot('d1', 'fire');
            expect(r.root.qualityGrade).toBe(4);
            expect(r.root.qualityName).toBe('immortal');
        });
        it('should awaken earth root', () => {
            const r = system.awakenSpiritRoot('d1', 'earth');
            expect(r.root.qualityGrade).toBe(0);
            expect(r.root.qualityName).toBe('mortal');
        });
        it('should reject unknown rootType', () => {
            const r = system.awakenSpiritRoot('d1', 'unknown');
            expect(r.error).toBe('UNKNOWN_ROOT_TYPE');
        });
        it('should reject non-string rootType', () => {
            const r = system.awakenSpiritRoot('d1', 123);
            expect(r.error).toBe('UNKNOWN_ROOT_TYPE');
        });
        it('should reject empty dreamId', () => {
            const r = system.awakenSpiritRoot('', 'metal');
            expect(r.error).toBe('INVALID_DREAM_ID');
        });
        it('should enforce maxRoots', () => {
            const s = new CultivationDreamSpiritRootAwakening({ maxRoots: 1 });
            s.awakenSpiritRoot('d1', 'metal');
            const r = s.awakenSpiritRoot('d2', 'metal');
            expect(r.error).toBe('MAX_ROOTS_REACHED');
        });
        it('should initialize stabilityScore=0', () => {
            const r = system.awakenSpiritRoot('d1', 'metal');
            expect(r.root.stabilityScore).toBe(0);
            expect(r.root.stabilizedAt).toBeNull();
        });
        it('should set state to awakened', () => {
            const r = system.awakenSpiritRoot('d1', 'metal');
            expect(r.root.state).toBe(ROOT_STATES.AWAKENED);
        });
        it('should set awakenedAt timestamp', () => {
            const before = Date.now();
            const r = system.awakenSpiritRoot('d1', 'metal');
            expect(r.root.awakenedAt).toBeGreaterThanOrEqual(before);
        });
        it('should set element from typeDef', () => {
            const r = system.awakenSpiritRoot('d1', 'fire');
            expect(r.root.element).toBe('火');
        });
        it('should trigger rootAwakened hook', () => {
            let called = false;
            system.registerHook('rootAwakened', () => { called = true; });
            system.awakenSpiritRoot('d1', 'metal');
            expect(called).toBe(true);
        });
        it('should increment totalAwakens', () => {
            system.awakenSpiritRoot('d1', 'metal');
            expect(system.stats.totalAwakens).toBe(1);
        });
    });

    describe('getRoot', () => {
        it('should return root copy', () => {
            const r = system.awakenSpiritRoot('d1', 'metal');
            const got = system.getRoot(r.root.id);
            expect(got.id).toBe(r.root.id);
        });
        it('should return null for missing', () => {
            expect(system.getRoot('ghost')).toBeNull();
        });
    });

    describe('listRoots', () => {
        it('should list all', () => {
            system.awakenSpiritRoot('d1', 'metal');
            system.awakenSpiritRoot('d2', 'wood');
            expect(system.listRoots().length).toBe(2);
        });
    });

    describe('listRootsByDream', () => {
        it('should filter by dreamId', () => {
            system.awakenSpiritRoot('d1', 'metal');
            system.awakenSpiritRoot('d2', 'metal');
            system.awakenSpiritRoot('d1', 'fire');
            expect(system.listRootsByDream('d1').length).toBe(2);
        });
        it('should return empty for no match', () => {
            expect(system.listRootsByDream('none')).toEqual([]);
        });
    });

    describe('listRootsByType', () => {
        it('should filter by rootType', () => {
            system.awakenSpiritRoot('d1', 'metal');
            system.awakenSpiritRoot('d2', 'metal');
            system.awakenSpiritRoot('d3', 'wood');
            expect(system.listRootsByType('metal').length).toBe(2);
        });
    });

    describe('listRootsByQuality', () => {
        it('should filter by qualityGrade', () => {
            system.awakenSpiritRoot('d1', 'metal'); // grade 1
            system.awakenSpiritRoot('d2', 'wood');  // grade 2
            system.awakenSpiritRoot('d3', 'earth'); // grade 0
            expect(system.listRootsByQuality(1).length).toBe(1);
        });
    });

    describe('listRootsByState', () => {
        it('should filter by state', () => {
            system.awakenSpiritRoot('d1', 'metal');
            const r = system.listRootsByState(ROOT_STATES.AWAKENED);
            expect(r.length).toBe(1);
        });
        it('should return empty for unknown state', () => {
            expect(system.listRootsByState('unknown')).toEqual([]);
        });
    });

    describe('listStableRoots', () => {
        it('should return empty when none stable', () => {
            system.awakenSpiritRoot('d1', 'metal');
            expect(system.listStableRoots().length).toBe(0);
        });
    });

    describe('testRootQuality', () => {
        it('should reject missing root', () => {
            const r = system.testRootQuality('ghost');
            expect(r.error).toBe('ROOT_NOT_FOUND');
        });
        it('should test metal root (baseQuality 1)', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            const r = system.testRootQuality(root.id);
            // baseTest=1*20=20, stabilityBonus=0
            expect(r.testValue).toBe(20);
        });
        it('should test wood root (baseQuality 2)', () => {
            const { root } = system.awakenSpiritRoot('d1', 'wood');
            const r = system.testRootQuality(root.id);
            // baseTest=2*20=40
            expect(r.testValue).toBe(40);
        });
        it('should test fire root (baseQuality 4)', () => {
            const { root } = system.awakenSpiritRoot('d1', 'fire');
            const r = system.testRootQuality(root.id);
            // baseTest=4*20=80
            expect(r.testValue).toBe(80);
        });
        it('should include stability bonus', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            // stabilize to add 30 score
            system.stabilizeRoot(root.id);
            const r = system.testRootQuality(root.id);
            // baseTest=20, bonus=floor(30/4)=7
            expect(r.testValue).toBe(27);
        });
        it('should return qualityGrade and name', () => {
            const { root } = system.awakenSpiritRoot('d1', 'wood');
            const r = system.testRootQuality(root.id);
            expect(r.qualityGrade).toBe(2);
            expect(r.qualityName).toBe('rare');
        });
        it('should trigger rootTested hook', () => {
            let called = false;
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            system.registerHook('rootTested', () => { called = true; });
            system.testRootQuality(root.id);
            expect(called).toBe(true);
        });
        it('should increment totalTests', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            system.testRootQuality(root.id);
            expect(system.stats.totalTests).toBe(1);
        });
    });

    describe('stabilizeRoot', () => {
        it('should reject missing root', () => {
            const r = system.stabilizeRoot('ghost');
            expect(r.error).toBe('ROOT_NOT_FOUND');
        });
        it('should set state to stabilizing when below threshold', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            const r = system.stabilizeRoot(root.id);
            expect(r.stabilityScore).toBe(STABILITY_INCREMENT);
            expect(r.state).toBe(ROOT_STATES.STABILIZING);
            expect(r.stable).toBe(false);
        });
        it('should set state to stable when reaching threshold', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            // 4 calls × 30 = 120, threshold 100
            for (let i = 0; i < 4; i++) system.stabilizeRoot(root.id);
            const got = system.getRoot(root.id);
            expect(got.state).toBe(ROOT_STATES.STABLE);
            expect(got.stabilityScore).toBeGreaterThanOrEqual(STABILITY_STABLE_THRESHOLD);
        });
        it('should set stabilizedAt when stable', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            for (let i = 0; i < 4; i++) system.stabilizeRoot(root.id);
            const got = system.getRoot(root.id);
            expect(got.stabilizedAt).not.toBeNull();
        });
        it('should reject stabilization on already stable root', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            for (let i = 0; i < 4; i++) system.stabilizeRoot(root.id);
            const r = system.stabilizeRoot(root.id);
            expect(r.error).toBe('ALREADY_STABLE');
        });
        it('should respect stabilityStableThreshold=0', () => {
            const s = new CultivationDreamSpiritRootAwakening({ stabilityStableThreshold: 0 });
            const { root } = s.awakenSpiritRoot('d1', 'metal');
            const r = s.stabilizeRoot(root.id);
            expect(r.state).toBe(ROOT_STATES.STABLE);
        });
        it('should respect stabilityCap', () => {
            const s = new CultivationDreamSpiritRootAwakening({ stabilityCap: 30 });
            const { root } = s.awakenSpiritRoot('d1', 'metal');
            for (let i = 0; i < 5; i++) s.stabilizeRoot(root.id);
            const got = s.getRoot(root.id);
            expect(got.stabilityScore).toBeLessThanOrEqual(30);
        });
        it('should respect stabilityIncrement=0', () => {
            const s = new CultivationDreamSpiritRootAwakening({ stabilityIncrement: 0 });
            const { root } = s.awakenSpiritRoot('d1', 'metal');
            const r = s.stabilizeRoot(root.id);
            expect(r.stabilityScore).toBe(0);
        });
        it('should trigger rootStabilized hook', () => {
            let called = false;
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            system.registerHook('rootStabilized', () => { called = true; });
            system.stabilizeRoot(root.id);
            expect(called).toBe(true);
        });
        it('should increment totalStabilizations', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            system.stabilizeRoot(root.id);
            expect(system.stats.totalStabilizations).toBe(1);
        });
    });

    describe('calculateRootPower', () => {
        it('should return 0 for missing', () => {
            expect(system.calculateRootPower('ghost')).toBe(0);
        });
        it('should return base power for awakened root', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            // qualityComponent=1*50=50, stability=0, element=1*10=10 → 60
            expect(system.calculateRootPower(root.id)).toBe(60);
        });
        it('should increase with quality', () => {
            const { root: r1 } = system.awakenSpiritRoot('d1', 'metal'); // grade 1
            const { root: r2 } = system.awakenSpiritRoot('d1', 'fire');  // grade 4
            expect(system.calculateRootPower(r2.id)).toBeGreaterThan(system.calculateRootPower(r1.id));
        });
        it('should increase with stability', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            const p1 = system.calculateRootPower(root.id);
            system.stabilizeRoot(root.id);
            const p2 = system.calculateRootPower(root.id);
            expect(p2).toBeGreaterThan(p1);
        });
    });

    describe('getDreamRootSummary', () => {
        it('should return zeros for empty dream', () => {
            const s = system.getDreamRootSummary('none');
            expect(s.rootCount).toBe(0);
            expect(s.totalStability).toBe(0);
        });
        it('should aggregate roots', () => {
            const { root: r1 } = system.awakenSpiritRoot('d1', 'metal');
            system.awakenSpiritRoot('d1', 'wood');
            system.stabilizeRoot(r1.id);
            const s = system.getDreamRootSummary('d1');
            expect(s.rootCount).toBe(2);
            expect(s.totalStability).toBe(30);
        });
        it('should count stable roots', () => {
            const { root } = system.awakenSpiritRoot('d1', 'metal');
            for (let i = 0; i < 4; i++) system.stabilizeRoot(root.id);
            const s = system.getDreamRootSummary('d1');
            expect(s.stableCount).toBe(1);
        });
        it('should track max quality grade', () => {
            system.awakenSpiritRoot('d1', 'earth'); // grade 0
            system.awakenSpiritRoot('d1', 'fire');  // grade 4
            const s = system.getDreamRootSummary('d1');
            expect(s.maxQuality).toBe('immortal');
        });
    });

    describe('registerTool / executeTool', () => {
        it('should register and execute', () => {
            system.registerTool('custom', () => 'ok');
            const r = system.executeTool('custom', {});
            expect(r.success).toBe(true);
            expect(r.result).toBe('ok');
        });
        it('should use empty object when context is undefined', () => {
            system.registerTool('custom', (ctx) => ctx);
            const r = system.executeTool('custom', undefined);
            expect(r.success).toBe(true);
            expect(r.result).toEqual({});
        });
        it('should use empty object when context is null', () => {
            system.registerTool('custom', (ctx) => ctx);
            const r = system.executeTool('custom', null);
            expect(r.success).toBe(true);
            expect(r.result).toEqual({});
        });
        it('should return error for unknown tool', () => {
            const r = system.executeTool('nope', {});
            expect(r.error).toBe('TOOL_NOT_FOUND');
        });
        it('should catch handler errors', () => {
            system.registerTool('boom', () => { throw new Error('x'); });
            const r = system.executeTool('boom', {});
            expect(r.error).toBe('x');
        });
    });

    describe('listTools', () => {
        it('should return default tool names', () => {
            expect(system.listTools().length).toBe(2);
        });
    });

    describe('registerHook', () => {
        it('should support multiple handlers', () => {
            let count = 0;
            system.registerHook('rootAwakened', () => { count++; });
            system.registerHook('rootAwakened', () => { count++; });
            system.awakenSpiritRoot('d1', 'metal');
            expect(count).toBe(2);
        });
        it('should return unsubscribe function', () => {
            let count = 0;
            const handler = () => { count++; };
            const unsub = system.registerHook('rootAwakened', handler);
            system.awakenSpiritRoot('d1', 'metal');
            unsub();
            system.awakenSpiritRoot('d2', 'metal');
            expect(count).toBe(1);
        });
        it('should swallow handler exceptions', () => {
            system.registerHook('rootAwakened', () => { throw new Error('x'); });
            expect(() => system.awakenSpiritRoot('d1', 'metal')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient awakens', () => {
            expect(system.autoEvolve().evolved).toBe(false);
        });
        it('should evolve after 5 awakens', () => {
            for (let i = 0; i < 5; i++) system.awakenSpiritRoot(`d${i}`, 'metal');
            expect(system.autoEvolve().evolved).toBe(true);
        });
        it('should not evolve twice', () => {
            for (let i = 0; i < 5; i++) system.awakenSpiritRoot(`d${i}`, 'metal');
            system.autoEvolve();
            const r = system.autoEvolve();
            expect(r.evolved).toBe(false);
            expect(r.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('toJSON / fromJSON', () => {
        it('should serialize roots', () => {
            system.awakenSpiritRoot('d1', 'metal');
            const json = system.toJSON();
            expect(json.roots.length).toBe(1);
        });
        it('should deserialize roots', () => {
            const s2 = new CultivationDreamSpiritRootAwakening();
            s2.awakenSpiritRoot('d1', 'metal');
            const json = s2.toJSON();
            const s3 = new CultivationDreamSpiritRootAwakening();
            s3.fromJSON(json);
            expect(s3.roots.size).toBe(1);
        });
        it('should restore stats', () => {
            const s2 = new CultivationDreamSpiritRootAwakening();
            s2.awakenSpiritRoot('d1', 'metal');
            const json = s2.toJSON();
            const s3 = new CultivationDreamSpiritRootAwakening();
            s3.fromJSON(json);
            expect(s3.stats.totalAwakens).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should include rootCount', () => {
            system.awakenSpiritRoot('d1', 'metal');
            const stats = system.getStats();
            expect(stats.rootCount).toBe(1);
        });
    });

    describe('module constants', () => {
        it('should expose ROOT_TYPE_KEYS with 5 keys', () => {
            expect(ROOT_TYPE_KEYS.length).toBe(5);
        });
        it('should expose QUALITY_GRADES with 5 entries', () => {
            expect(QUALITY_GRADES.length).toBe(5);
        });
        it('should expose STABILITY_THRESHOLDS with 5 entries', () => {
            expect(STABILITY_THRESHOLDS.length).toBe(5);
        });
        it('should have SPIRIT_ROOT_TYPES entries for all keys', () => {
            for (const k of ROOT_TYPE_KEYS) {
                expect(SPIRIT_ROOT_TYPES[k]).toBeDefined();
            }
        });
    });
});
