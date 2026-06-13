/**
 * SectJustice.test.js - 宗门审判测试
 * V472 Iteration 4/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectJustice } from '../../../systems/ai/SectJustice.js';

describe('SectJustice', () => {
    let system;
    beforeEach(() => { system = new SectJustice(); });

    describe('fileTrial', () => {
        it('should create with sectId, defendant, accuser', () => {
            const { trial } = system.fileTrial({ sectId: 's1', defendant: 'd1', accuser: 'a1' });
            expect(trial.sectId).toBe('s1');
            expect(trial.defendant).toBe('d1');
            expect(trial.accuser).toBe('a1');
        });

        it('should default status to "filed"', () => {
            const { trial } = system.fileTrial({});
            expect(trial.status).toBe('filed');
        });

        it('should default verdict to empty string', () => {
            const { trial } = system.fileTrial({});
            expect(trial.verdict).toBe('');
        });

        it('should use provided id', () => {
            const { trial } = system.fileTrial({ id: 'my_trial' });
            expect(trial.trialId).toBe('my_trial');
        });

        it('should start with baseEvidence items', () => {
            const { trial } = system.fileTrial({});
            expect(trial.evidence.length).toBe(1);
        });

        it('should use provided evidence array', () => {
            const { trial } = system.fileTrial({ evidence: ['e1', 'e2'] });
            expect(trial.evidence).toEqual(['e1', 'e2']);
        });

        it('should trigger trialFiled hook', () => {
            let called = false;
            system.registerHook('trialFiled', () => { called = true; });
            system.fileTrial({});
            expect(called).toBe(true);
        });

        it('should respect config baseEvidence', () => {
            const custom = new SectJustice({ baseEvidence: 3 });
            const { trial } = custom.fileTrial({});
            expect(trial.evidence.length).toBe(3);
        });

        it('should increment totalTrials stats', () => {
            expect(system.stats.totalTrials).toBe(0);
            system.fileTrial({});
            expect(system.stats.totalTrials).toBe(1);
        });
    });

    describe('getTrial', () => {
        it('should return trial', () => {
            const { trial } = system.fileTrial({});
            expect(system.getTrial(trial.trialId)).not.toBeNull();
        });

        it('should return a copy with evidence array', () => {
            const { trial } = system.fileTrial({});
            const got = system.getTrial(trial.trialId);
            expect(got.evidence).toEqual(['initial_evidence']);
        });

        it('should return null for missing', () => {
            expect(system.getTrial('ghost')).toBeNull();
        });
    });

    describe('listTrials', () => {
        it('should list all', () => {
            system.fileTrial({});
            system.fileTrial({});
            expect(system.listTrials().length).toBe(2);
        });

        it('should return empty when no trials', () => {
            expect(system.listTrials().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.fileTrial({ sectId: 's1' });
            system.fileTrial({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.fileTrial({ sectId: 's1' });
            expect(system.listBySect('ghost').length).toBe(0);
        });
    });

    describe('listByStatus', () => {
        it('should filter by status filed', () => {
            system.fileTrial({});
            system.fileTrial({ status: 'hearing' });
            expect(system.listByStatus('filed').length).toBe(1);
        });

        it('should filter by status hearing', () => {
            system.fileTrial({});
            system.fileTrial({ status: 'hearing' });
            expect(system.listByStatus('hearing').length).toBe(1);
        });

        it('should return empty for unknown status', () => {
            system.fileTrial({});
            expect(system.listByStatus('ghost').length).toBe(0);
        });
    });

    describe('addEvidence', () => {
        it('should add evidence to trial', () => {
            const { trial } = system.fileTrial({});
            system.addEvidence(trial.trialId, 'new_evidence');
            expect(trial.evidence).toContain('new_evidence');
        });

        it('should add multiple evidence items', () => {
            const { trial } = system.fileTrial({});
            system.addEvidence(trial.trialId, 'e1');
            system.addEvidence(trial.trialId, 'e2');
            expect(trial.evidence.length).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.addEvidence('ghost', 'e1');
            expect(result.error).toBe('TRIAL_NOT_FOUND');
        });

        it('should trigger evidenceAdded hook', () => {
            const { trial } = system.fileTrial({});
            let called = false;
            system.registerHook('evidenceAdded', () => { called = true; });
            system.addEvidence(trial.trialId, 'e1');
            expect(called).toBe(true);
        });
    });

    describe('presentVerdict', () => {
        it('should set verdict on trial', () => {
            const { trial } = system.fileTrial({});
            system.presentVerdict(trial.trialId, 'Guilty');
            expect(trial.verdict).toBe('Guilty');
        });

        it('should reject missing', () => {
            const result = system.presentVerdict('ghost', 'Guilty');
            expect(result.error).toBe('TRIAL_NOT_FOUND');
        });

        it('should trigger verdictPresented hook', () => {
            const { trial } = system.fileTrial({});
            let called = false;
            system.registerHook('verdictPresented', () => { called = true; });
            system.presentVerdict(trial.trialId, 'Guilty');
            expect(called).toBe(true);
        });
    });

    describe('settleTrial', () => {
        it('should set status to verdict', () => {
            const { trial } = system.fileTrial({});
            system.settleTrial(trial.trialId);
            expect(trial.status).toBe('verdict');
        });

        it('should reject missing', () => {
            const result = system.settleTrial('ghost');
            expect(result.error).toBe('TRIAL_NOT_FOUND');
        });

        it('should trigger trialSettled hook', () => {
            const { trial } = system.fileTrial({});
            let called = false;
            system.registerHook('trialSettled', () => { called = true; });
            system.settleTrial(trial.trialId);
            expect(called).toBe(true);
        });
    });

    describe('calculateJudgmentScore', () => {
        it('should calculate with default values', () => {
            // evidence=1 (base), verdict='' => 1*10 + 0 = 10
            const { trial } = system.fileTrial({});
            expect(system.calculateJudgmentScore(trial.trialId)).toBe(10);
        });

        it('should include evidence count', () => {
            const { trial } = system.fileTrial({});
            system.addEvidence(trial.trialId, 'e1');
            system.addEvidence(trial.trialId, 'e2');
            // evidence=3, verdict='' => 3*10 + 0 = 30
            expect(system.calculateJudgmentScore(trial.trialId)).toBe(30);
        });

        it('should include verdict length', () => {
            const { trial } = system.fileTrial({});
            system.presentVerdict(trial.trialId, 'Guilty');
            // evidence=1, verdict='Guilty' (6 chars) => 1*10 + 6 = 16
            expect(system.calculateJudgmentScore(trial.trialId)).toBe(16);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateJudgmentScore('ghost')).toBe(0);
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

        it('should execute default getTrial', () => {
            const result = system.executeTool('getTrial', { trialId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('trialFiled', () => count++);
            unregister();
            system.fileTrial({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('trialFiled', () => { throw new Error('x'); });
            expect(() => system.fileTrial({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTrials = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTrials = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.fileTrial({});
            const json = system.toJSON();
            expect(json.trials.length).toBe(1);
        });
        it('should deserialize', () => {
            system.fileTrial({});
            const json = system.toJSON();
            const newSys = new SectJustice();
            newSys.fromJSON(json);
            expect(newSys.trials.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.trialCount).toBe(0);
        });
    });
});
