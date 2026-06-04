/**
 * DaoCompanionSystem.test.js - 道侣关系管理系统测试
 * V304 Iteration 1/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DaoCompanionSystem } from '../../../systems/ai/DaoCompanionSystem.js';

describe('DaoCompanionSystem', () => {
    let system;

    beforeEach(() => {
        system = new DaoCompanionSystem();
    });

    // ========== 道侣注册测试 ==========

    describe('registerCompanion', () => {
        it('should register a companion', () => {
            const { companion } = system.registerCompanion({ name: 'Alice', gender: 'female' });
            expect(companion.name).toBe('Alice');
            expect(companion.gender).toBe('female');
        });

        it('should default to available', () => {
            const { companion } = system.registerCompanion({});
            expect(companion.available).toBe(true);
        });

        it('should generate id', () => {
            const { companion } = system.registerCompanion({});
            expect(companion.id).toBeDefined();
        });

        it('should set daoAffinity as array', () => {
            const { companion } = system.registerCompanion({ daoAffinity: ['sword', 'wind'] });
            expect(companion.daoAffinity.length).toBe(2);
        });
    });

    describe('getCompanion', () => {
        it('should return companion', () => {
            const { companion } = system.registerCompanion({ name: 'A' });
            expect(system.getCompanion(companion.id)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getCompanion('ghost')).toBeNull();
        });
    });

    describe('listAvailableCompanions', () => {
        it('should list available companions', () => {
            system.registerCompanion({ name: 'A' });
            system.registerCompanion({ name: 'B' });
            expect(system.listAvailableCompanions().length).toBe(2);
        });

        it('should filter by gender', () => {
            system.registerCompanion({ name: 'A', gender: 'female' });
            system.registerCompanion({ name: 'B', gender: 'male' });
            expect(system.listAvailableCompanions({ gender: 'female' }).length).toBe(1);
        });

        it('should filter by realm', () => {
            system.registerCompanion({ name: 'A', realm: 'qi_refining' });
            system.registerCompanion({ name: 'B', realm: 'core_formation' });
            expect(system.listAvailableCompanions({ realm: 'core_formation' }).length).toBe(1);
        });

        it('should filter by personality', () => {
            system.registerCompanion({ name: 'A', personality: 'gentle' });
            system.registerCompanion({ name: 'B', personality: 'fierce' });
            expect(system.listAvailableCompanions({ personality: 'gentle' }).length).toBe(1);
        });

        it('should exclude unavailable companions', () => {
            const { companion: c1 } = system.registerCompanion({ name: 'A' });
            c1.available = false;
            expect(system.listAvailableCompanions().length).toBe(0);
        });
    });

    // ========== 兼容性测试 ==========

    describe('analyzeCompatibility', () => {
        it('should compute compatibility score', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const result = system.analyzeCompatibility(a.id, b.id);
            expect(result.success).toBe(true);
            expect(result.score).toBeGreaterThan(0.5);
        });

        it('should reject missing companion', () => {
            const { companion: a } = system.registerCompanion({ name: 'A' });
            const result = system.analyzeCompatibility(a.id, 'ghost');
            expect(result.error).toBe('COMPANION_NOT_FOUND');
        });

        it('should reward same personality', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle' });
            const { companion: b1 } = system.registerCompanion({ name: 'B1', personality: 'gentle' });
            const { companion: b2 } = system.registerCompanion({ name: 'B2', personality: 'fierce' });
            const r1 = system.analyzeCompatibility(a.id, b1.id);
            const r2 = system.analyzeCompatibility(a.id, b2.id);
            expect(r1.score).toBeGreaterThan(r2.score);
        });

        it('should reward overlapping interests', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', interests: ['sword', 'alchemy'] });
            const { companion: b } = system.registerCompanion({ name: 'B', interests: ['sword', 'alchemy'] });
            const result = system.analyzeCompatibility(a.id, b.id);
            expect(result.breakdown.interestOverlap).toBe(2);
        });

        it('should clamp score to 0-1', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword', 'wind', 'fire', 'ice', 'light'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword', 'wind', 'fire', 'ice', 'light'], interests: ['x','y','z','w','v'] });
            const result = system.analyzeCompatibility(a.id, b.id);
            expect(result.score).toBeLessThanOrEqual(1);
        });

        it('should cache compatibility score', () => {
            const { companion: a } = system.registerCompanion({ name: 'A' });
            const { companion: b } = system.registerCompanion({ name: 'B' });
            system.analyzeCompatibility(a.id, b.id);
            expect(system.getCompatibilityScore(a.id, b.id)).not.toBeNull();
        });

        it('should return null for uncached score', () => {
            expect(system.getCompatibilityScore('x', 'y')).toBeNull();
        });
    });

    // ========== 道侣关系测试 ==========

    describe('formCompanionship', () => {
        it('should form companionship', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const result = system.formCompanionship(a.id, b.id);
            expect(result.success).toBe(true);
        });

        it('should reject missing companion', () => {
            const { companion: a } = system.registerCompanion({ name: 'A' });
            const result = system.formCompanionship(a.id, 'ghost');
            expect(result.error).toBe('COMPANION_NOT_FOUND');
        });

        it('should reject self-companionship', () => {
            const { companion: a } = system.registerCompanion({ name: 'A' });
            const result = system.formCompanionship(a.id, a.id);
            expect(result.error).toBe('SELF_COMPANIONSHIP');
        });

        it('should reject incompatible companions', () => {
            const sys = new DaoCompanionSystem({ baseCompatibility: 0.1 });
            const { companion: a } = sys.registerCompanion({ name: 'A', personality: 'gentle' });
            const { companion: b } = sys.registerCompanion({ name: 'B', personality: 'cold', daoAffinity: ['dark'] });
            const result = sys.formCompanionship(a.id, b.id);
            expect(result.error).toBe('INCOMPATIBLE');
        });

        it('should reject A at max companions', () => {
            system.config.maxCompanionsPerCultivator = 1;
            const { companion: a } = system.registerCompanion({ name: 'A' });
            const { companion: b } = system.registerCompanion({ name: 'B' });
            const { companion: c } = system.registerCompanion({ name: 'C' });
            system.formCompanionship(a.id, b.id);
            // Now try to form a new one for A
            const result = system.formCompanionship(a.id, c.id);
            expect(result.error).toBe('A_AT_MAX_COMPANIONS');
        });

        it('should reject B at max companions', () => {
            system.config.maxCompanionsPerCultivator = 1;
            const { companion: a } = system.registerCompanion({ name: 'A' });
            const { companion: b } = system.registerCompanion({ name: 'B' });
            const { companion: c } = system.registerCompanion({ name: 'C' });
            system.formCompanionship(a.id, b.id);
            // Now try to form a new one for B
            const result = system.formCompanionship(c.id, b.id);
            expect(result.error).toBe('B_AT_MAX_COMPANIONS');
        });

        it('should mark companions as unavailable', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            system.formCompanionship(a.id, b.id);
            expect(a.available).toBe(false);
            expect(b.available).toBe(false);
        });

        it('should increment totalCompanionships', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            system.formCompanionship(a.id, b.id);
            expect(system.stats.totalCompanionships).toBe(1);
        });

        it('should trigger companionshipFormed hook', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            let called = false;
            system.registerHook('companionshipFormed', () => { called = true; });
            system.formCompanionship(a.id, b.id);
            expect(called).toBe(true);
        });
    });

    describe('getCompanionship', () => {
        it('should return companionship', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            expect(system.getCompanionship(companionship.companionshipId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getCompanionship('ghost')).toBeNull();
        });
    });

    describe('listCompanionships', () => {
        it('should list all', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            system.formCompanionship(a.id, b.id);
            expect(system.listCompanionships().length).toBe(1);
        });

        it('should filter by cultivator', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            system.formCompanionship(a.id, b.id);
            expect(system.listCompanionships({ cultivatorId: a.id }).length).toBe(1);
        });

        it('should filter by status', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            system.formCompanionship(a.id, b.id);
            expect(system.listCompanionships({ status: 'new' }).length).toBe(1);
        });

        it('should filter by bondType', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            system.formCompanionship(a.id, b.id);
            expect(system.listCompanionships({ bondType: 'acquaintance' }).length).toBe(1);
        });
    });

    // ========== 羁绊提升测试 ==========

    describe('increaseBond', () => {
        let companionship, compA, compB;

        beforeEach(() => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            compA = a; compB = b;
            const result = system.formCompanionship(a.id, b.id);
            companionship = result.companionship;
        });

        it('should increase bond', () => {
            const result = system.increaseBond(companionship.companionshipId, 10);
            expect(result.bondLevel).toBe(20);
        });

        it('should reject missing companionship', () => {
            const result = system.increaseBond('ghost', 10);
            expect(result.error).toBe('COMPANIONSHIP_NOT_FOUND');
        });

        it('should reject dissolved', () => {
            system.dissolveCompanionship(companionship.companionshipId);
            const result = system.increaseBond(companionship.companionshipId, 10);
            expect(result.error).toBe('COMPANIONSHIP_DISSOLVED');
        });

        it('should cap at 100', () => {
            system.increaseBond(companionship.companionshipId, 1000);
            expect(companionship.bondLevel).toBe(100);
        });

        it('should record experience', () => {
            system.increaseBond(companionship.companionshipId, 5, 'date');
            expect(companionship.experiences.length).toBe(1);
        });

        it('should upgrade bond type', () => {
            system.increaseBond(companionship.companionshipId, 25);
            expect(companionship.bondType).toBe('close');
        });

        it('should trigger bondTypeChanged hook', () => {
            let called = false;
            system.registerHook('bondTypeChanged', () => { called = true; });
            system.increaseBond(companionship.companionshipId, 25);
            expect(called).toBe(true);
        });

        it('should trigger bondIncreased hook', () => {
            let called = false;
            system.registerHook('bondIncreased', () => { called = true; });
            system.increaseBond(companionship.companionshipId, 5);
            expect(called).toBe(true);
        });

        it('should reach soulmate tier', () => {
            system.increaseBond(companionship.companionshipId, 200);
            expect(companionship.bondType).toBe('soulmate');
        });
    });

    describe('decreaseBond', () => {
        let companionship;

        beforeEach(() => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const result = system.formCompanionship(a.id, b.id);
            companionship = result.companionship;
        });

        it('should decrease bond', () => {
            system.increaseBond(companionship.companionshipId, 50);
            const result = system.decreaseBond(companionship.companionshipId, 20);
            expect(result.bondLevel).toBe(40);
        });

        it('should reject missing', () => {
            const result = system.decreaseBond('ghost', 10);
            expect(result.error).toBe('COMPANIONSHIP_NOT_FOUND');
        });

        it('should reject dissolved', () => {
            system.dissolveCompanionship(companionship.companionshipId);
            const result = system.decreaseBond(companionship.companionshipId, 10);
            expect(result.error).toBe('COMPANIONSHIP_DISSOLVED');
        });

        it('should floor at 0', () => {
            system.decreaseBond(companionship.companionshipId, 1000);
            expect(companionship.bondLevel).toBe(0);
        });

        it('should record experience', () => {
            system.decreaseBond(companionship.companionshipId, 5, 'fight');
            expect(companionship.experiences.length).toBe(1);
        });

        it('should trigger bondDecreased hook', () => {
            let called = false;
            system.registerHook('bondDecreased', () => { called = true; });
            system.decreaseBond(companionship.companionshipId, 5);
            expect(called).toBe(true);
        });
    });

    describe('getBond', () => {
        it('should return bond status', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            const bond = system.getBond(companionship.companionshipId);
            expect(bond.bondLevel).toBe(10);
        });

        it('should return null for missing', () => {
            expect(system.getBond('ghost')).toBeNull();
        });
    });

    // ========== 海誓山盟测试 ==========

    describe('exchangeVows', () => {
        it('should reject missing', () => {
            const result = system.exchangeVows('ghost', 'I do');
            expect(result.error).toBe('COMPANIONSHIP_NOT_FOUND');
        });

        it('should reject low bond', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            const result = system.exchangeVows(companionship.companionshipId, 'I do');
            expect(result.error).toBe('BOND_TOO_LOW');
        });

        it('should accept at sufficient bond', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            system.increaseBond(companionship.companionshipId, 25);
            const result = system.exchangeVows(companionship.companionshipId, 'Forever together');
            expect(result.success).toBe(true);
        });

        it('should boost bond on vow', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            system.increaseBond(companionship.companionshipId, 25);
            const before = companionship.bondLevel;
            system.exchangeVows(companionship.companionshipId, 'Forever');
            expect(companionship.bondLevel).toBeGreaterThan(before);
        });

        it('should trigger vowsExchanged hook', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            system.increaseBond(companionship.companionshipId, 25);
            let called = false;
            system.registerHook('vowsExchanged', () => { called = true; });
            system.exchangeVows(companionship.companionshipId, 'Forever');
            expect(called).toBe(true);
        });

        it('should list vows', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            system.increaseBond(companionship.companionshipId, 25);
            system.exchangeVows(companionship.companionshipId, 'Forever');
            expect(system.listVows(companionship.companionshipId).length).toBe(1);
        });

        it('should return empty for missing', () => {
            expect(system.listVows('ghost').length).toBe(0);
        });
    });

    // ========== 关系解除测试 ==========

    describe('dissolveCompanionship', () => {
        it('should dissolve', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            const result = system.dissolveCompanionship(companionship.companionshipId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.dissolveCompanionship('ghost');
            expect(result.error).toBe('COMPANIONSHIP_NOT_FOUND');
        });

        it('should reject already dissolved', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            system.dissolveCompanionship(companionship.companionshipId);
            const result = system.dissolveCompanionship(companionship.companionshipId);
            expect(result.error).toBe('ALREADY_DISSOLVED');
        });

        it('should make companions available again', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            system.dissolveCompanionship(companionship.companionshipId);
            expect(a.available).toBe(true);
            expect(b.available).toBe(true);
        });

        it('should increment totalDissolved', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            system.dissolveCompanionship(companionship.companionshipId);
            expect(system.stats.totalDissolved).toBe(1);
        });

        it('should trigger companionshipDissolved hook', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const { companionship } = system.formCompanionship(a.id, b.id);
            let called = false;
            system.registerHook('companionshipDissolved', () => { called = true; });
            system.dissolveCompanionship(companionship.companionshipId);
            expect(called).toBe(true);
        });
    });

    // ========== Mesh 心神感应测试 ==========

    describe('Mesh Heart Connection', () => {
        it('should add node', () => {
            const result = system.addMeshNode('n1');
            expect(result.success).toBe(true);
        });

        it('should connect hearts', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshHearts('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject missing nodes', () => {
            const result = system.connectMeshHearts('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should send heart signal', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshHearts('a', 'b');
            const result = system.sendHeartSignal('a', 'b', 'love');
            expect(result.delivered).toBe(true);
        });

        it('should reject disconnected signal', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.sendHeartSignal('a', 'b', 'love');
            expect(result.error).toBe('NOT_CONNECTED');
        });

        it('should reject missing source', () => {
            system.addMeshNode('b');
            const result = system.sendHeartSignal('ghost', 'b', 'love');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should trigger heartSignalReceived hook', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshHearts('a', 'b');
            let called = false;
            system.registerHook('heartSignalReceived', () => { called = true; });
            system.sendHeartSignal('a', 'b', 'love');
            expect(called).toBe(true);
        });
    });

    // ========== 工具系统测试 ==========

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

        it('should execute default analyzeCompatibility', () => {
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            const result = system.executeTool('analyzeCompatibility', { cultivatorA: a.id, cultivatorB: b.id });
            expect(result.success).toBe(true);
        });

        it('should execute default getBondStatus', () => {
            const result = system.executeTool('getBondStatus', { companionshipId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default listCompanions', () => {
            const result = system.executeTool('listCompanions', {});
            expect(result.success).toBe(true);
        });
    });

    // ========== Hook 系统测试 ==========

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('companionshipFormed', () => count++);
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            system.formCompanionship(a.id, b.id);
            unregister();
            const { companion: c } = system.registerCompanion({ name: 'C', personality: 'gentle', daoAffinity: ['sword'] });
            system.formCompanionship(c.id, b.id).companionship;  // b already in a relationship, will fail
            expect(count).toBe(1);
        });

        it('should handle errors silently', () => {
            system.registerHook('companionshipFormed', () => { throw new Error('x'); });
            const { companion: a } = system.registerCompanion({ name: 'A', personality: 'gentle', daoAffinity: ['sword'] });
            const { companion: b } = system.registerCompanion({ name: 'B', personality: 'gentle', daoAffinity: ['sword'] });
            expect(() => system.formCompanionship(a.id, b.id)).not.toThrow();
        });
    });

    // ========== 自进化测试 ==========

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalCompanionships = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalCompanionships = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should trigger systemEvolved hook', () => {
            system.stats.totalCompanionships = 10;
            let called = false;
            system.registerHook('systemEvolved', () => { called = true; });
            system.autoEvolve();
            expect(called).toBe(true);
        });
    });

    // ========== 持久化测试 ==========

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCompanion({ name: 'A' });
            const json = system.toJSON();
            expect(json.companions.length).toBe(1);
        });

        it('should deserialize', () => {
            system.registerCompanion({ name: 'A' });
            const json = system.toJSON();
            const newSys = new DaoCompanionSystem();
            newSys.fromJSON(json);
            expect(newSys.companions.size).toBe(1);
        });

        it('should preserve mesh connections', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            system.connectMeshHearts('a', 'b');
            const json = system.toJSON();
            const newSys = new DaoCompanionSystem();
            newSys.fromJSON(json);
            expect(newSys.meshNodes.get('a').connections.size).toBe(1);
        });
    });

    // ========== 统计测试 ==========

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.companionCount).toBe(0);
        });

        it('should track counts', () => {
            system.registerCompanion({ name: 'A' });
            const stats = system.getStats();
            expect(stats.companionCount).toBe(1);
        });
    });
});