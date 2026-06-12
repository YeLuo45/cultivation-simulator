/**
 * CultivationDreamSwordPractice.test.js - 梦中剑道修行测试
 * V863 P-20260613-006 Iteration 6/30 Round 34
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamSwordPractice,
    SWORD_TECHNIQUES,
    TECHNIQUE_KEYS,
    COMBO_MAX,
    INTENT_LEVELS,
    INTENT_LEVEL_MAX,
    INTENT_MASTERY_THRESHOLDS,
    SWORD_PRACTICE_STATES,
} from '../../../systems/ai/CultivationDreamSwordPractice.js';

describe('CultivationDreamSwordPractice', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamSwordPractice(); });

    describe('constructor edge cases', () => {
        it('should handle explicit maxPractices=0', () => {
            const s = new CultivationDreamSwordPractice({ maxPractices: 0 });
            expect(s.config.maxPractices).toBe(0);
        });
        it('should handle explicit maxComboLength=0', () => {
            const s = new CultivationDreamSwordPractice({ maxComboLength: 0 });
            expect(s.config.maxComboLength).toBe(0);
        });
        it('should handle explicit masteryDoubleCap=0', () => {
            const s = new CultivationDreamSwordPractice({ masteryDoubleCap: 0 });
            expect(s.config.masteryDoubleCap).toBe(0);
        });
        it('should handle explicit intentBaseCost=0', () => {
            const s = new CultivationDreamSwordPractice({ intentBaseCost: 0 });
            expect(s.config.intentBaseCost).toBe(0);
        });
    });

    describe('practiceSwordForm', () => {
        it('should practice sword_rain', () => {
            const r = system.practiceSwordForm('dream_1', 'sword_rain');
            expect(r.practice.technique).toBe('sword_rain');
            expect(r.practice.techniqueName).toBe(SWORD_TECHNIQUES.sword_rain.name);
        });
        it('should practice thunder_sword', () => {
            const r = system.practiceSwordForm('dream_1', 'thunder_sword');
            expect(r.practice.technique).toBe('thunder_sword');
        });
        it('should practice void_slash', () => {
            const r = system.practiceSwordForm('dream_1', 'void_slash');
            expect(r.practice.technique).toBe('void_slash');
        });
        it('should reject unknown technique', () => {
            const r = system.practiceSwordForm('dream_1', 'unknown');
            expect(r.error).toBe('UNKNOWN_TECHNIQUE');
        });
        it('should reject non-string technique', () => {
            const r = system.practiceSwordForm('dream_1', 123);
            expect(r.error).toBe('UNKNOWN_TECHNIQUE');
        });
        it('should reject empty dreamId', () => {
            const r = system.practiceSwordForm('', 'sword_rain');
            expect(r.error).toBe('INVALID_DREAM_ID');
        });
        it('should enforce maxPractices', () => {
            const s = new CultivationDreamSwordPractice({ maxPractices: 1 });
            s.practiceSwordForm('d1', 'sword_rain');
            const r = s.practiceSwordForm('d2', 'sword_rain');
            expect(r.error).toBe('MAX_PRACTICES_REACHED');
        });
        it('should initialize with zero combo and intent', () => {
            const r = system.practiceSwordForm('d1', 'sword_rain');
            expect(r.practice.comboCount).toBe(0);
            expect(r.practice.swordIntentLevel).toBe(0);
            expect(r.practice.masteryScore).toBe(0);
        });
        it('should set state to practicing on creation', () => {
            const r = system.practiceSwordForm('d1', 'sword_rain');
            expect(r.practice.state).toBe(SWORD_PRACTICE_STATES.PRACTICING);
        });
        it('should set lastPracticeAt timestamp', () => {
            const before = Date.now();
            const r = system.practiceSwordForm('d1', 'sword_rain');
            expect(r.practice.lastPracticeAt).toBeGreaterThanOrEqual(before);
        });
        it('should trigger swordPracticed hook', () => {
            let called = false;
            system.registerHook('swordPracticed', () => { called = true; });
            system.practiceSwordForm('d1', 'sword_rain');
            expect(called).toBe(true);
        });
        it('should increment totalPractices', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            expect(system.stats.totalPractices).toBe(1);
        });
    });

    describe('getPractice', () => {
        it('should return practice copy', () => {
            const r = system.practiceSwordForm('d1', 'sword_rain');
            const got = system.getPractice(r.practice.id);
            expect(got.id).toBe(r.practice.id);
        });
        it('should return null for missing', () => {
            expect(system.getPractice('ghost')).toBeNull();
        });
    });

    describe('listPractices', () => {
        it('should list all', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            system.practiceSwordForm('d2', 'void_slash');
            expect(system.listPractices().length).toBe(2);
        });
    });

    describe('listPracticesByDream', () => {
        it('should filter by dreamId', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            system.practiceSwordForm('d2', 'sword_rain');
            system.practiceSwordForm('d1', 'thunder_sword');
            expect(system.listPracticesByDream('d1').length).toBe(2);
        });
        it('should return empty for no match', () => {
            expect(system.listPracticesByDream('none')).toEqual([]);
        });
    });

    describe('listPracticesByTechnique', () => {
        it('should filter by technique', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            system.practiceSwordForm('d2', 'sword_rain');
            system.practiceSwordForm('d3', 'void_slash');
            expect(system.listPracticesByTechnique('sword_rain').length).toBe(2);
        });
    });

    describe('listPracticesByIntent', () => {
        it('should filter by swordIntentLevel', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            system.practiceSwordForm('d2', 'sword_rain');
            expect(system.listPracticesByIntent(0).length).toBe(2);
        });
    });

    describe('listMasteredPractices', () => {
        it('should return empty when no practices mastered', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            expect(system.listMasteredPractices().length).toBe(0);
        });
    });

    describe('listPracticesByState', () => {
        it('should filter by state', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            const r = system.listPracticesByState(SWORD_PRACTICE_STATES.PRACTICING);
            expect(r.length).toBe(1);
        });
        it('should return empty for unknown state', () => {
            expect(system.listPracticesByState('unknown')).toEqual([]);
        });
    });

    describe('performCombo', () => {
        it('should reject missing practice', () => {
            const r = system.performCombo('ghost', ['sword_rain']);
            expect(r.error).toBe('PRACTICE_NOT_FOUND');
        });
        it('should reject non-array sequence', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            const r = system.performCombo(practice.id, 'sword_rain');
            expect(r.error).toBe('INVALID_SEQUENCE');
        });
        it('should reject empty sequence', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            const r = system.performCombo(practice.id, []);
            expect(r.error).toBe('INVALID_SEQUENCE');
        });
        it('should reject sequence too long', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            const longSeq = new Array(system.config.maxComboLength + 1).fill('sword_rain');
            const r = system.performCombo(practice.id, longSeq);
            expect(r.error).toBe('SEQUENCE_TOO_LONG');
        });
        it('should reject invalid technique in sequence', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            const r = system.performCombo(practice.id, ['sword_rain', 'bogus']);
            expect(r.error).toBe('INVALID_TECHNIQUE_IN_SEQUENCE');
        });
        it('should accumulate combo without capping when below max', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            const r = system.performCombo(practice.id, ['sword_rain', 'sword_rain']);
            expect(r.capped).toBe(false);
            expect(r.comboCount).toBe(2);
        });
        it('should double masteryScore when combo caps', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            // seq length 2: 4 calls = combo 8, mastery 8
            for (let i = 0; i < 4; i++) system.performCombo(practice.id, ['sword_rain', 'sword_rain']);
            // 5th call: newCombo 10, cap: mastery = 8*2 + 2*1 = 18
            const r = system.performCombo(practice.id, ['sword_rain', 'sword_rain']);
            expect(r.capped).toBe(true);
            expect(r.comboCount).toBe(COMBO_MAX);
            expect(r.masteryScore).toBe(18);
        });
        it('should keep comboCount at COMBO_MAX after cap', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            // First, get to cap: 5 calls of seq length 2
            for (let i = 0; i < 5; i++) system.performCombo(practice.id, ['sword_rain', 'sword_rain']);
            // 6th call: newCombo 12, cap: comboCount stays 10
            const r = system.performCombo(practice.id, ['sword_rain', 'sword_rain']);
            expect(r.comboCount).toBe(COMBO_MAX);
        });
        it('should set state to combo on cap (intent not changed)', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            for (let i = 0; i < 5; i++) system.performCombo(practice.id, ['sword_rain', 'sword_rain']);
            const got = system.getPractice(practice.id);
            expect(got.state).toBe(SWORD_PRACTICE_STATES.COMBO);
        });
        it('should upgrade swordIntentLevel when mastery crosses threshold', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            // void_slash mastery per move = 12/5 = 2.4
            // Call 1: seq=5, mastery=12, combo=5 (not capped, intent=0 still 0, no state change)
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            // Call 2: cap, mastery=12*2+12=36, intent=1
            const r = system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            expect(r.swordIntentLevel).toBe(1);
        });
        it('should set state to intent on intent upgrade', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            const r = system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            const got = system.getPractice(practice.id);
            expect(got.state).toBe(SWORD_PRACTICE_STATES.INTENT);
        });
        it('should set state to mastered on max intent', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            // 5 calls of seq=5 to push to mastery 372 (intent 4)
            for (let i = 0; i < 5; i++) {
                system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            }
            const got = system.getPractice(practice.id);
            expect(got.swordIntentLevel).toBe(INTENT_LEVEL_MAX);
            expect(got.state).toBe(SWORD_PRACTICE_STATES.MASTERED);
        });
        it('should respect masteryDoubleCap', () => {
            const s = new CultivationDreamSwordPractice({ masteryDoubleCap: 5 });
            const { practice } = s.practiceSwordForm('d1', 'sword_rain');
            for (let i = 0; i < 5; i++) s.performCombo(practice.id, ['sword_rain', 'sword_rain']);
            const got = s.getPractice(practice.id);
            expect(got.masteryScore).toBeLessThanOrEqual(5);
        });
        it('should update lastPracticeAt', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            const before = Date.now();
            system.performCombo(practice.id, ['sword_rain']);
            const got = system.getPractice(practice.id);
            expect(got.lastPracticeAt).toBeGreaterThanOrEqual(before);
        });
        it('should trigger comboPerformed hook', () => {
            let called = false;
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            system.registerHook('comboPerformed', () => { called = true; });
            system.performCombo(practice.id, ['sword_rain']);
            expect(called).toBe(true);
        });
        it('should increment totalCombos', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            system.performCombo(practice.id, ['sword_rain']);
            expect(system.stats.totalCombos).toBe(1);
        });
    });

    describe('manifestSwordIntent', () => {
        it('should reject missing practice', () => {
            const r = system.manifestSwordIntent('ghost');
            expect(r.error).toBe('PRACTICE_NOT_FOUND');
        });
        it('should reject insufficient intent', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            const r = system.manifestSwordIntent(practice.id);
            expect(r.error).toBe('INSUFFICIENT_INTENT');
        });
        it('should deduct intent and add mastery when intent sufficient', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            // Push to intent=1
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            const r = system.manifestSwordIntent(practice.id);
            expect(r.success).toBe(true);
            expect(r.masteryScore).toBeGreaterThan(0);
        });
        it('should handle intentBaseCost=0 (no change)', () => {
            const s = new CultivationDreamSwordPractice({ intentBaseCost: 0 });
            const { practice } = s.practiceSwordForm('d1', 'void_slash');
            // Push to intent=1
            s.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            s.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            const before = s.getPractice(practice.id);
            s.manifestSwordIntent(practice.id);
            const after = s.getPractice(practice.id);
            expect(after.swordIntentLevel).toBe(before.swordIntentLevel);
        });
        it('should restore intent level if mastery recrosses threshold', () => {
            // We want to test the "recomputed > current" branch
            // Setup: mastery just above 20, intent=1
            // After manifest: mastery slightly higher, _calcIntentLevel >= 1
            // intent = max(0, recomputed)
            const s = new CultivationDreamSwordPractice();
            const { practice } = s.practiceSwordForm('d1', 'void_slash');
            s.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            s.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            // intent=1, mastery=36
            const r = s.manifestSwordIntent(practice.id);
            expect(r.swordIntentLevel).toBeGreaterThanOrEqual(1);
        });
        it('should set state to mastered when intent reaches max via manifest', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            // Push to intent=4
            for (let i = 0; i < 4; i++) {
                system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            }
            // mastery=180, intent=3
            // Bump to intent 4 first
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            // Now intent=4 (mastery=372), state=MASTERED
            // manifest again: intent=3, mastery=375, _calcIntentLevel(375)=4, intent=max(3,4)=4
            const r = system.manifestSwordIntent(practice.id);
            const got = system.getPractice(practice.id);
            expect(got.state).toBe(SWORD_PRACTICE_STATES.MASTERED);
        });
        it('should set state to intent when intent > 0 after manifest', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            // Push to intent=1
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            // intent=1, mastery=36
            const r = system.manifestSwordIntent(practice.id);
            const got = system.getPractice(practice.id);
            // intent stays 1 (mastery 39, _calcIntentLevel(39)=1)
            expect(got.state).toBe(SWORD_PRACTICE_STATES.INTENT);
        });
        it('should trigger swordIntentManifested hook', () => {
            let called = false;
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            system.registerHook('swordIntentManifested', () => { called = true; });
            system.manifestSwordIntent(practice.id);
            expect(called).toBe(true);
        });
        it('should increment totalIntentManifestations', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            system.manifestSwordIntent(practice.id);
            expect(system.stats.totalIntentManifestations).toBe(1);
        });
    });

    describe('calculateSwordPower', () => {
        it('should return 0 for missing', () => {
            expect(system.calculateSwordPower('ghost')).toBe(0);
        });
        it('should return non-zero power for existing practice', () => {
            const { practice } = system.practiceSwordForm('d1', 'sword_rain');
            const power = system.calculateSwordPower(practice.id);
            expect(power).toBeGreaterThan(0);
        });
        it('should be higher after mastery gain', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            const p1 = system.calculateSwordPower(practice.id);
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            const p2 = system.calculateSwordPower(practice.id);
            expect(p2).toBeGreaterThan(p1);
        });
    });

    describe('getDreamSwordSummary', () => {
        it('should return zeros for empty dream', () => {
            const s = system.getDreamSwordSummary('none');
            expect(s.practiceCount).toBe(0);
            expect(s.totalMastery).toBe(0);
        });
        it('should aggregate practices', () => {
            const { practice: p1 } = system.practiceSwordForm('d1', 'sword_rain');
            const { practice: p2 } = system.practiceSwordForm('d1', 'void_slash');
            system.performCombo(p1.id, ['sword_rain']);
            system.performCombo(p2.id, ['void_slash']);
            const s = system.getDreamSwordSummary('d1');
            expect(s.practiceCount).toBe(2);
            expect(s.totalCombos).toBe(2);
        });
        it('should track max intent level', () => {
            const { practice } = system.practiceSwordForm('d1', 'void_slash');
            for (let i = 0; i < 2; i++) {
                system.performCombo(practice.id, ['void_slash', 'void_slash', 'void_slash', 'void_slash', 'void_slash']);
            }
            const s = system.getDreamSwordSummary('d1');
            expect(s.maxIntentLevel).toBe(1);
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
            const tools = system.listTools();
            expect(tools.length).toBe(2);
        });
    });

    describe('registerHook', () => {
        it('should support multiple handlers', () => {
            let count = 0;
            system.registerHook('swordPracticed', () => { count++; });
            system.registerHook('swordPracticed', () => { count++; });
            system.practiceSwordForm('d1', 'sword_rain');
            expect(count).toBe(2);
        });
        it('should return unsubscribe function', () => {
            let count = 0;
            const handler = () => { count++; };
            const unsub = system.registerHook('swordPracticed', handler);
            system.practiceSwordForm('d1', 'sword_rain');
            unsub();
            system.practiceSwordForm('d2', 'sword_rain');
            expect(count).toBe(1);
        });
        it('should swallow handler exceptions', () => {
            system.registerHook('swordPracticed', () => { throw new Error('x'); });
            expect(() => system.practiceSwordForm('d1', 'sword_rain')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient practices', () => {
            expect(system.autoEvolve().evolved).toBe(false);
        });
        it('should evolve after 5 practices', () => {
            for (let i = 0; i < 5; i++) system.practiceSwordForm(`d${i}`, 'sword_rain');
            expect(system.autoEvolve().evolved).toBe(true);
        });
        it('should not evolve twice', () => {
            for (let i = 0; i < 5; i++) system.practiceSwordForm(`d${i}`, 'sword_rain');
            system.autoEvolve();
            const r = system.autoEvolve();
            expect(r.evolved).toBe(false);
            expect(r.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('toJSON / fromJSON', () => {
        it('should serialize practices', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            const json = system.toJSON();
            expect(json.practices.length).toBe(1);
        });
        it('should deserialize practices', () => {
            const s2 = new CultivationDreamSwordPractice();
            s2.practiceSwordForm('d1', 'sword_rain');
            const json = s2.toJSON();
            const s3 = new CultivationDreamSwordPractice();
            s3.fromJSON(json);
            expect(s3.practices.size).toBe(1);
        });
        it('should restore stats', () => {
            const s2 = new CultivationDreamSwordPractice();
            s2.practiceSwordForm('d1', 'sword_rain');
            const json = s2.toJSON();
            const s3 = new CultivationDreamSwordPractice();
            s3.fromJSON(json);
            expect(s3.stats.totalPractices).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should include practiceCount', () => {
            system.practiceSwordForm('d1', 'sword_rain');
            const stats = system.getStats();
            expect(stats.practiceCount).toBe(1);
        });
    });

    describe('module constants', () => {
        it('should expose TECHNIQUE_KEYS with 3 keys', () => {
            expect(TECHNIQUE_KEYS.length).toBe(3);
        });
        it('should expose INTENT_LEVELS with 5 levels', () => {
            expect(INTENT_LEVELS.length).toBe(5);
        });
        it('should expose INTENT_MASTERY_THRESHOLDS with 5 thresholds', () => {
            expect(INTENT_MASTERY_THRESHOLDS.length).toBe(5);
        });
        it('should have SWORD_TECHNIQUES entries for all keys', () => {
            for (const k of TECHNIQUE_KEYS) {
                expect(SWORD_TECHNIQUES[k]).toBeDefined();
            }
        });
    });
});
