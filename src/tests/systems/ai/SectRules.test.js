/**
 * SectRules.test.js - 宗规戒律测试
 * V481 Iteration 13/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectRules } from '../../../systems/ai/SectRules.js';

describe('SectRules', () => {
    let system;
    beforeEach(() => { system = new SectRules(); });

    describe('enactRule', () => {
        it('should enact a rule', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'No Murder', severity: 3 });
            expect(rule.sectId).toBe('s1');
            expect(rule.name).toBe('No Murder');
            expect(rule.severity).toBe(3);
            expect(rule.status).toBe('active');
            expect(Array.isArray(rule.violations)).toBe(true);
            expect(Array.isArray(rule.punishments)).toBe(true);
        });

        it('should use default baseSeverity', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'Rule' });
            expect(rule.severity).toBe(1);
        });

        it('should auto-generate ruleId', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            expect(rule.ruleId).toMatch(/^rule_/);
        });

        it('should use provided ruleId', () => {
            const { rule } = system.enactRule({ ruleId: 'custom_id', sectId: 's1', name: 'A' });
            expect(rule.ruleId).toBe('custom_id');
        });

        it('should trigger ruleEnacted hook', () => {
            let called = false;
            system.registerHook('ruleEnacted', () => { called = true; });
            system.enactRule({ sectId: 's1', name: 'A' });
            expect(called).toBe(true);
        });
    });

    describe('getRule', () => {
        it('should return a rule', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            expect(system.getRule(rule.ruleId)).not.toBeNull();
            expect(system.getRule(rule.ruleId).name).toBe('A');
        });

        it('should return null for missing', () => {
            expect(system.getRule('ghost')).toBeNull();
        });
    });

    describe('listRules', () => {
        it('should list all rules', () => {
            system.enactRule({ sectId: 's1', name: 'A' });
            system.enactRule({ sectId: 's2', name: 'B' });
            expect(system.listRules().length).toBe(2);
        });

        it('should return empty array initially', () => {
            expect(system.listRules().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.enactRule({ sectId: 's1', name: 'A' });
            system.enactRule({ sectId: 's2', name: 'B' });
            system.enactRule({ sectId: 's1', name: 'C' });
            expect(system.listBySect('s1').length).toBe(2);
            expect(system.listBySect('s2').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.enactRule({ sectId: 's1', name: 'A' });
            expect(system.listBySect('unknown').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should only include active rules', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            system.enactRule({ sectId: 's1', name: 'B' });
            system.revokeRule(rule.ruleId);
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].name).toBe('B');
        });

        it('should return empty when none active', () => {
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('recordViolation', () => {
        it('should record a violation', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            const result = system.recordViolation(rule.ruleId, 'member1');
            expect(result.success).toBe(true);
            expect(rule.violations.length).toBe(1);
            expect(rule.violations[0].member).toBe('member1');
        });

        it('should record multiple violations', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            system.recordViolation(rule.ruleId, 'm1');
            system.recordViolation(rule.ruleId, 'm2');
            expect(rule.violations.length).toBe(2);
        });

        it('should reject missing rule', () => {
            const result = system.recordViolation('ghost', 'm1');
            expect(result.error).toBe('RULE_NOT_FOUND');
        });

        it('should trigger violationRecorded hook', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            let called = false;
            system.registerHook('violationRecorded', () => { called = true; });
            system.recordViolation(rule.ruleId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('addPunishment', () => {
        it('should add a punishment', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            const result = system.addPunishment(rule.ruleId, 'expulsion');
            expect(result.success).toBe(true);
            expect(rule.punishments).toContain('expulsion');
        });

        it('should add multiple punishments', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            system.addPunishment(rule.ruleId, 'fine');
            system.addPunishment(rule.ruleId, 'imprisonment');
            expect(rule.punishments.length).toBe(2);
        });

        it('should reject missing rule', () => {
            const result = system.addPunishment('ghost', 'fine');
            expect(result.error).toBe('RULE_NOT_FOUND');
        });

        it('should trigger punishmentAdded hook', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            let received;
            system.registerHook('punishmentAdded', (d) => { received = d; });
            system.addPunishment(rule.ruleId, 'fine');
            expect(received.punishment).toBe('fine');
        });
    });

    describe('revokeRule', () => {
        it('should revoke a rule', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            const result = system.revokeRule(rule.ruleId);
            expect(result.success).toBe(true);
            expect(rule.status).toBe('inactive');
        });

        it('should reject missing rule', () => {
            const result = system.revokeRule('ghost');
            expect(result.error).toBe('RULE_NOT_FOUND');
        });

        it('should trigger ruleRevoked hook', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A' });
            let called = false;
            system.registerHook('ruleRevoked', () => { called = true; });
            system.revokeRule(rule.ruleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRuleSeverity', () => {
        it('should calculate base severity', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A', severity: 2 });
            expect(system.calculateRuleSeverity(rule.ruleId)).toBe(20);
        });

        it('should include violations', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A', severity: 2 });
            system.recordViolation(rule.ruleId, 'm1');
            system.recordViolation(rule.ruleId, 'm2');
            expect(system.calculateRuleSeverity(rule.ruleId)).toBe(30);
        });

        it('should include punishments', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A', severity: 1 });
            system.addPunishment(rule.ruleId, 'fine');
            expect(system.calculateRuleSeverity(rule.ruleId)).toBe(13);
        });

        it('should combine all factors', () => {
            const { rule } = system.enactRule({ sectId: 's1', name: 'A', severity: 3 });
            system.recordViolation(rule.ruleId, 'm1');
            system.addPunishment(rule.ruleId, 'fine');
            system.addPunishment(rule.ruleId, 'imprisonment');
            // 3*10 + 1*5 + 2*3 = 30 + 5 + 6 = 41
            expect(system.calculateRuleSeverity(rule.ruleId)).toBe(41);
        });

        it('should return 0 for missing rule', () => {
            expect(system.calculateRuleSeverity('ghost')).toBe(0);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getRule tool', () => {
            const result = system.executeTool('getRule', { ruleId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default enactRule tool', () => {
            const result = system.executeTool('enactRule', { sectId: 's1', name: 'ToolRule' });
            expect(result.success).toBe(true);
            expect(result.result.rule.name).toBe('ToolRule');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ruleEnacted', () => count++);
            unregister();
            system.enactRule({ sectId: 's1', name: 'A' });
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('ruleEnacted', () => { throw new Error('x'); });
            expect(() => system.enactRule({ sectId: 's1', name: 'A' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient rules', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when enough rules', () => {
            system.stats.totalRules = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxRules).toBe(130);
        });

        it('should not double evolve', () => {
            system.stats.totalRules = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.enactRule({ sectId: 's1', name: 'A' });
            const json = system.toJSON();
            expect(json.rules.length).toBe(1);
            expect(json.stats.totalRules).toBe(1);
        });

        it('should deserialize from JSON', () => {
            system.enactRule({ sectId: 's1', name: 'A' });
            const json = system.toJSON();
            const newSys = new SectRules();
            newSys.fromJSON(json);
            expect(newSys.rules.size).toBe(1);
            expect(newSys.stats.totalRules).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with ruleCount', () => {
            system.enactRule({ sectId: 's1', name: 'A' });
            const stats = system.getStats();
            expect(stats.ruleCount).toBe(1);
            expect(stats.totalRules).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });

        it('should start with zero rules', () => {
            const stats = system.getStats();
            expect(stats.ruleCount).toBe(0);
        });
    });
});
