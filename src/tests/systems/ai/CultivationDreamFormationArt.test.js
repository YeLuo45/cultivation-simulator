/**
 * CultivationDreamFormationArt.test.js - 梦中阵法测试
 * V862 P-20260613-005 Iteration 5/30 Round 34
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamFormationArt,
    FORMATION_PATTERNS,
    PATTERN_KEYS,
    FLAG_TYPES,
    FIVE_ELEMENT_FLAGS,
    TAIJI_FLAGS,
    ENERGY_FLOW_RATES,
    ACTIVATION_PROGRESS_MAX,
    ACTIVATION_PROGRESS_PER_FLAG,
    FORMATION_STATES,
} from '../../../systems/ai/CultivationDreamFormationArt.js';

describe('CultivationDreamFormationArt', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamFormationArt(); });

    describe('constructor edge cases', () => {
        it('should handle explicit activationStepProgress=0', () => {
            const s = new CultivationDreamFormationArt({ activationStepProgress: 0 });
            expect(s.config.activationStepProgress).toBe(0);
        });
        it('should handle explicit defaultActivationSteps=0', () => {
            const s = new CultivationDreamFormationArt({ defaultActivationSteps: 0 });
            expect(s.config.defaultActivationSteps).toBe(0);
        });
        it('should handle explicit maxFormations=0', () => {
            const s = new CultivationDreamFormationArt({ maxFormations: 0 });
            expect(s.config.maxFormations).toBe(0);
        });
        it('should handle explicit maxFlagsPerFormation=0', () => {
            const s = new CultivationDreamFormationArt({ maxFlagsPerFormation: 0 });
            expect(s.config.maxFlagsPerFormation).toBe(0);
        });
    });

    describe('setupFormation', () => {
        it('should setup a bagua formation', () => {
            const { formation } = system.setupFormation('dream_1', 'bagua');
            expect(formation.pattern).toBe('bagua');
            expect(formation.dreamId).toBe('dream_1');
        });
        it('should setup a five_elements formation', () => {
            const { formation } = system.setupFormation('dream_2', 'five_elements');
            expect(formation.requiredFlags).toBe(5);
        });
        it('should setup a taiji formation', () => {
            const { formation } = system.setupFormation('dream_3', 'taiji');
            expect(formation.requiredFlags).toBe(2);
        });
        it('should initialize empty flags when setup', () => {
            const { formation } = system.setupFormation('dream_x', 'taiji');
            expect(formation.flags).toEqual([]);
        });
        it('should reject unknown pattern', () => {
            const result = system.setupFormation('dream_1', 'unknown');
            expect(result.error).toBe('UNKNOWN_PATTERN');
        });
        it('should reject empty dreamId', () => {
            const result = system.setupFormation('', 'taiji');
            expect(result.error).toBe('INVALID_DREAM_ID');
        });
        it('should enforce maxFormations', () => {
            const s = new CultivationDreamFormationArt({ maxFormations: 1 });
            s.setupFormation('d1', 'taiji');
            const result = s.setupFormation('d2', 'taiji');
            expect(result.error).toBe('MAX_FORMATIONS_REACHED');
        });
        it('should set state to setup on creation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            expect(formation.state).toBe(FORMATION_STATES.SETUP);
            expect(formation.activated).toBe(false);
            expect(formation.activationProgress).toBe(0);
            expect(formation.energyFlow).toBe(0);
        });
        it('should set formationStartedAt timestamp', () => {
            const before = Date.now();
            const { formation } = system.setupFormation('d1', 'taiji');
            expect(formation.formationStartedAt).toBeGreaterThanOrEqual(before);
        });
        it('should trigger formationSetup hook', () => {
            let called = false;
            system.registerHook('formationSetup', () => { called = true; });
            system.setupFormation('d1', 'taiji');
            expect(called).toBe(true);
        });
        it('should reject non-string pattern', () => {
            const result = system.setupFormation('d1', 123);
            expect(result.error).toBe('UNKNOWN_PATTERN');
        });
    });

    describe('getFormation', () => {
        it('should return formation copy', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            const got = system.getFormation(formation.id);
            expect(got.id).toBe(formation.id);
        });
        it('should return null for missing', () => {
            expect(system.getFormation('ghost')).toBeNull();
        });
    });

    describe('listFormations', () => {
        it('should list all', () => {
            system.setupFormation('d1', 'taiji');
            system.setupFormation('d2', 'bagua');
            expect(system.listFormations().length).toBe(2);
        });
    });

    describe('listFormationsByDream', () => {
        it('should filter by dreamId', () => {
            system.setupFormation('d1', 'taiji');
            system.setupFormation('d2', 'bagua');
            system.setupFormation('d1', 'five_elements');
            expect(system.listFormationsByDream('d1').length).toBe(2);
        });
        it('should return empty array for no match', () => {
            expect(system.listFormationsByDream('nonexistent')).toEqual([]);
        });
    });

    describe('listFormationsByPattern', () => {
        it('should filter by pattern', () => {
            system.setupFormation('d1', 'taiji');
            system.setupFormation('d2', 'bagua');
            system.setupFormation('d3', 'taiji');
            expect(system.listFormationsByPattern('taiji').length).toBe(2);
        });
    });

    describe('listActivatedFormations', () => {
        it('should return only activated', () => {
            const { formation: f1 } = system.setupFormation('d1', 'taiji');
            system.placeFlag(f1.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(f1.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(f1.id);
            system.setupFormation('d2', 'bagua');
            expect(system.listActivatedFormations().length).toBe(1);
        });
    });

    describe('listReadyFormations', () => {
        it('should return formations in ready state', () => {
            const { formation: f1 } = system.setupFormation('d1', 'taiji');
            system.placeFlag(f1.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(f1.id, { x: 1, y: 0, type: 'kun' });
            expect(system.listReadyFormations().length).toBe(1);
        });
    });

    describe('listFormationsByState', () => {
        it('should filter by state', () => {
            system.setupFormation('d1', 'taiji');
            system.setupFormation('d2', 'taiji');
            const result = system.listFormationsByState(FORMATION_STATES.SETUP);
            expect(result.length).toBe(2);
        });
        it('should return empty for unknown state', () => {
            expect(system.listFormationsByState('nonsense')).toEqual([]);
        });
    });

    describe('placeFlag', () => {
        it('should place a flag on formation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            const r = system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            expect(r.success).toBe(true);
            expect(r.flagCount).toBe(1);
        });
        it('should update energy flow as flags placed', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            const r1 = system.placeFlag(formation.id, { x: 0, y: 0, type: 'yin' });
            const r2 = system.placeFlag(formation.id, { x: 1, y: 0, type: 'yang' });
            expect(r1.energyFlow).toBeLessThan(r2.energyFlow);
        });
        it('should set state to ready when all required flags placed', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'yin' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'yang' });
            const got = system.getFormation(formation.id);
            expect(got.state).toBe(FORMATION_STATES.READY);
        });
        it('should set formationCompletedAt when ready', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'yin' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'yang' });
            const got = system.getFormation(formation.id);
            expect(got.formationCompletedAt).not.toBeNull();
        });
        it('should reject invalid position', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            const r = system.placeFlag(formation.id, { x: 'a', y: 0, type: 'qian' });
            expect(r.error).toBe('INVALID_POSITION');
        });
        it('should reject null position', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            const r = system.placeFlag(formation.id, null);
            expect(r.error).toBe('INVALID_POSITION');
        });
        it('should reject missing formation', () => {
            const r = system.placeFlag('ghost', { x: 0, y: 0, type: 'qian' });
            expect(r.error).toBe('FORMATION_NOT_FOUND');
        });
        it('should reject flag placement on activated formation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(formation.id);
            const r = system.placeFlag(formation.id, { x: 2, y: 0, type: 'zhen' });
            expect(r.error).toBe('ALREADY_ACTIVATED');
        });
        it('should enforce maxFlagsPerFormation', () => {
            const s = new CultivationDreamFormationArt({ maxFlagsPerFormation: 1 });
            const { formation } = s.setupFormation('d1', 'taiji');
            s.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            const r = s.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            expect(r.error).toBe('MAX_FLAGS_REACHED');
        });
        it('should default flag type if invalid', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            const r = system.placeFlag(formation.id, { x: 0, y: 0, type: 'bogus' });
            expect(r.success).toBe(true);
            expect(r.flag.type).toBe(FLAG_TYPES[0]);
        });
        it('should trigger flagPlaced hook', () => {
            let called = false;
            const { formation } = system.setupFormation('d1', 'taiji');
            system.registerHook('flagPlaced', () => { called = true; });
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            expect(called).toBe(true);
        });
    });

    describe('activateFormation', () => {
        it('should activate a complete formation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            const r = system.activateFormation(formation.id);
            expect(r.activated).toBe(true);
        });
        it('should set state to activated', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(formation.id);
            const got = system.getFormation(formation.id);
            expect(got.state).toBe(FORMATION_STATES.ACTIVATED);
        });
        it('should set full energy flow on activation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            const r = system.activateFormation(formation.id);
            expect(r.energyFlow).toBe(ENERGY_FLOW_RATES.taiji);
        });
        it('should reject incomplete formation', () => {
            const { formation } = system.setupFormation('d1', 'bagua');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            const r = system.activateFormation(formation.id);
            expect(r.error).toBe('INCOMPLETE_FORMATION');
        });
        it('should reject missing formation', () => {
            const r = system.activateFormation('ghost');
            expect(r.error).toBe('FORMATION_NOT_FOUND');
        });
        it('should reject double activation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(formation.id);
            const r = system.activateFormation(formation.id);
            expect(r.error).toBe('ALREADY_ACTIVATED');
        });
        it('should set activationProgress based on flag count', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            const r = system.activateFormation(formation.id);
            expect(r.activationProgress).toBe(ACTIVATION_PROGRESS_MAX);
        });
        it('should trigger formationActivated hook', () => {
            let called = false;
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.registerHook('formationActivated', () => { called = true; });
            system.activateFormation(formation.id);
            expect(called).toBe(true);
        });
        it('should increment totalActivations stat', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(formation.id);
            expect(system.stats.totalActivations).toBe(1);
        });
    });

    describe('tickActivation', () => {
        it('should reject missing formation', () => {
            const r = system.tickActivation('ghost');
            expect(r.error).toBe('FORMATION_NOT_FOUND');
        });
        it('should reject already activated', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(formation.id);
            const r = system.tickActivation(formation.id);
            expect(r.error).toBe('ALREADY_ACTIVATED');
        });
        it('should reject incomplete', () => {
            const { formation } = system.setupFormation('d1', 'bagua');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            const r = system.tickActivation(formation.id);
            expect(r.error).toBe('INCOMPLETE_FORMATION');
        });
        it('should activate when progress reaches max via tick', () => {
            const s = new CultivationDreamFormationArt({ activationStepProgress: 50 });
            const { formation } = s.setupFormation('d1', 'taiji');
            s.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            s.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            // After 2 flags, activationProgress = 24, so first tick should be partial
            const r1 = s.tickActivation(formation.id);
            expect(r1.activated).toBe(false);
            const r2 = s.tickActivation(formation.id);
            expect(r2.activated).toBe(true);
        });
        it('should update activationProgress', () => {
            const s = new CultivationDreamFormationArt({ activationStepProgress: 5 });
            const { formation } = s.setupFormation('d1', 'taiji');
            s.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            s.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            const r = s.tickActivation(formation.id);
            expect(r.activationProgress).toBeGreaterThan(0);
        });
    });

    describe('failFormation', () => {
        it('should mark formation as failed', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            const r = system.failFormation(formation.id);
            expect(r.success).toBe(true);
            const got = system.getFormation(formation.id);
            expect(got.state).toBe(FORMATION_STATES.FAILED);
        });
        it('should zero energy flow on failure', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.failFormation(formation.id);
            const got = system.getFormation(formation.id);
            expect(got.energyFlow).toBe(0);
        });
        it('should reject missing formation', () => {
            const r = system.failFormation('ghost');
            expect(r.error).toBe('FORMATION_NOT_FOUND');
        });
        it('should reject already activated', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(formation.id);
            const r = system.failFormation(formation.id);
            expect(r.error).toBe('ALREADY_ACTIVATED');
        });
    });

    describe('removeFlag', () => {
        it('should remove a flag from formation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            const r = system.removeFlag(formation.id, 0);
            expect(r.success).toBe(true);
        });
        it('should revert state to placing if below required', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.removeFlag(formation.id, 0);
            const got = system.getFormation(formation.id);
            expect(got.state).toBe(FORMATION_STATES.PLACING);
        });
        it('should clear formationCompletedAt when going below required', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.removeFlag(formation.id, 0);
            const got = system.getFormation(formation.id);
            expect(got.formationCompletedAt).toBeNull();
        });
        it('should reject missing formation', () => {
            const r = system.removeFlag('ghost', 0);
            expect(r.error).toBe('FORMATION_NOT_FOUND');
        });
        it('should reject invalid index', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            const r = system.removeFlag(formation.id, 5);
            expect(r.error).toBe('INVALID_INDEX');
        });
        it('should reject negative index', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            const r = system.removeFlag(formation.id, -1);
            expect(r.error).toBe('INVALID_INDEX');
        });
        it('should reject on activated formation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(formation.id);
            const r = system.removeFlag(formation.id, 0);
            expect(r.error).toBe('ALREADY_ACTIVATED');
        });
    });

    describe('calculateFormationPower', () => {
        it('should return 0 for missing', () => {
            expect(system.calculateFormationPower('ghost')).toBe(0);
        });
        it('should return base power for setup formation', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            const power = system.calculateFormationPower(formation.id);
            expect(power).toBeGreaterThan(0);
        });
        it('should give bonus for activated formation', () => {
            const { formation: f1 } = system.setupFormation('d1', 'taiji');
            system.placeFlag(f1.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(f1.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(f1.id);
            const { formation: f2 } = system.setupFormation('d2', 'taiji');
            const p1 = system.calculateFormationPower(f1.id);
            const p2 = system.calculateFormationPower(f2.id);
            expect(p1).toBeGreaterThan(p2);
        });
    });

    describe('getDreamFormationSummary', () => {
        it('should return zero for empty dream', () => {
            const summary = system.getDreamFormationSummary('nonexistent');
            expect(summary.formationCount).toBe(0);
            expect(summary.totalFlags).toBe(0);
        });
        it('should count formations and flags', () => {
            const { formation: f1 } = system.setupFormation('d1', 'taiji');
            const { formation: f2 } = system.setupFormation('d1', 'taiji');
            system.placeFlag(f1.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(f2.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(f2.id, { x: 1, y: 0, type: 'kun' });
            const summary = system.getDreamFormationSummary('d1');
            expect(summary.formationCount).toBe(2);
            expect(summary.totalFlags).toBe(3);
        });
        it('should count activated formations', () => {
            const { formation: f1 } = system.setupFormation('d1', 'taiji');
            const { formation: f2 } = system.setupFormation('d1', 'taiji');
            system.placeFlag(f1.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(f1.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(f1.id);
            const summary = system.getDreamFormationSummary('d1');
            expect(summary.activated).toBe(1);
        });
        it('should sum total energy flow', () => {
            const { formation } = system.setupFormation('d1', 'taiji');
            system.placeFlag(formation.id, { x: 0, y: 0, type: 'qian' });
            system.placeFlag(formation.id, { x: 1, y: 0, type: 'kun' });
            system.activateFormation(formation.id);
            const summary = system.getDreamFormationSummary('d1');
            expect(summary.totalEnergyFlow).toBeGreaterThan(0);
        });
    });

    describe('registerTool / executeTool', () => {
        it('should register and execute a tool', () => {
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
        it('should return tool names', () => {
            const tools = system.listTools();
            expect(tools.length).toBe(2);
        });
    });

    describe('registerHook', () => {
        it('should support multiple handlers', () => {
            let count = 0;
            system.registerHook('formationSetup', () => { count++; });
            system.registerHook('formationSetup', () => { count++; });
            system.setupFormation('d1', 'taiji');
            expect(count).toBe(2);
        });
        it('should return unsubscribe function', () => {
            let count = 0;
            const handler = () => { count++; };
            const unsub = system.registerHook('formationSetup', handler);
            system.setupFormation('d1', 'taiji');
            unsub();
            system.setupFormation('d2', 'taiji');
            expect(count).toBe(1);
        });
        it('should swallow handler exceptions', () => {
            system.registerHook('formationSetup', () => { throw new Error('x'); });
            expect(() => system.setupFormation('d1', 'taiji')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient setups', () => {
            const r = system.autoEvolve();
            expect(r.evolved).toBe(false);
        });
        it('should evolve after 5 setups', () => {
            for (let i = 0; i < 5; i++) system.setupFormation(`d${i}`, 'taiji');
            const r = system.autoEvolve();
            expect(r.evolved).toBe(true);
        });
        it('should not evolve twice', () => {
            for (let i = 0; i < 5; i++) system.setupFormation(`d${i}`, 'taiji');
            system.autoEvolve();
            const r = system.autoEvolve();
            expect(r.evolved).toBe(false);
            expect(r.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('toJSON / fromJSON', () => {
        it('should serialize formations', () => {
            system.setupFormation('d1', 'taiji');
            const json = system.toJSON();
            expect(json.formations.length).toBe(1);
        });
        it('should deserialize formations', () => {
            const s2 = new CultivationDreamFormationArt();
            s2.setupFormation('d1', 'taiji');
            const json = s2.toJSON();
            const s3 = new CultivationDreamFormationArt();
            s3.fromJSON(json);
            expect(s3.formations.size).toBe(1);
        });
        it('should restore stats', () => {
            const s2 = new CultivationDreamFormationArt();
            s2.setupFormation('d1', 'taiji');
            const json = s2.toJSON();
            const s3 = new CultivationDreamFormationArt();
            s3.fromJSON(json);
            expect(s3.stats.totalSetups).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should include formationCount', () => {
            system.setupFormation('d1', 'taiji');
            const stats = system.getStats();
            expect(stats.formationCount).toBe(1);
        });
    });
});
