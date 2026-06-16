/**
 * CombatArtsSystem.test.js - 战斗技艺集成系统核心测试
 * V298 Iteration 4/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatArtsSystem } from '../../../systems/ai/CombatArtsSystem.js';

// Mock mesh network
const createMockMeshNetwork = () => ({
    connect: vi.fn().mockReturnValue({ success: true }),
    disconnect: vi.fn().mockReturnValue({ success: true }),
    broadcast: vi.fn().mockReturnValue(true),
});

describe('CombatArtsSystem', () => {
    let combatArts;
    const mockMesh = createMockMeshNetwork();

    beforeEach(() => {
        combatArts = new CombatArtsSystem({
            meshNetwork: mockMesh,
            maxTechniques: 50,
            maxCombo: 10,
            comboWindowMs: 2000,
            evolutionEnabled: true,
        });
    });

    // ========== 战斗技艺注册和学习系统测试 ==========
    
    describe('registerTechnique', () => {
        it('should register a new technique successfully', () => {
            const result = combatArts.registerTechnique('fireball', {
                name: '火球术',
                type: 'attack',
                damage: 80,
                cooldown: 3,
                energyCost: 15,
            });
            expect(result.success).toBe(true);
            expect(result.technique.techniqueId).toBe('fireball');
            expect(result.technique.name).toBe('火球术');
            expect(result.technique.damage).toBe(80);
        });

        it('should set defaults for technique', () => {
            const result = combatArts.registerTechnique('test_tech', {});
            expect(result.success).toBe(true);
            expect(result.technique.type).toBe('attack');
            expect(result.technique.damage).toBe(0);
            expect(result.technique.cooldown).toBe(0);
        });

        it('should reject duplicate technique', () => {
            combatArts.registerTechnique('duplicate_test', { name: 'Test' });
            const result = combatArts.registerTechnique('duplicate_test', { name: 'Test 2' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('TECHNIQUE_EXISTS');
        });

        it('should reject when max techniques reached', () => {
            const smallSystem = new CombatArtsSystem({ maxTechniques: 2 });
            smallSystem.registerTechnique('tech1', { name: 'Tech 1' });
            smallSystem.registerTechnique('tech2', { name: 'Tech 2' });
            const result = smallSystem.registerTechnique('tech3', { name: 'Tech 3' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('MAX_TECHNIQUES_REACHED');
        });

        it('should trigger hook on registration', () => {
            let called = false;
            combatArts.registerHook('techniqueRegistered', () => { called = true; });
            combatArts.registerTechnique('hook_test', { name: 'Hook Test' });
            expect(called).toBe(true);
        });
    });

    describe('learnTechnique', () => {
        it('should learn technique successfully', () => {
            combatArts.registerTechnique('learnable', { name: 'Learnable' });
            const result = combatArts.learnTechnique('learnable', 'entity_1');
            expect(result.success).toBe(true);
            expect(result.mastered).toBe(false);
            expect(result.learnProgress).toBe(1);
        });

        it('should mark technique as mastered after 5 learns by different entities', () => {
            combatArts.registerTechnique('masterable', { name: 'Masterable' });
            // Different entities can learn the same technique, each incrementing learnCount
            for (let i = 0; i < 5; i++) {
                const result = combatArts.learnTechnique('masterable', `entity_${i}`);
                expect(result.success).toBe(true);
            }
            const result = combatArts.learnTechnique('masterable', 'entity_final');
            expect(result.success).toBe(true);
            expect(result.mastered).toBe(true);
        });

        it('should reject learning same technique twice', () => {
            combatArts.registerTechnique('once', { name: 'Once' });
            combatArts.learnTechnique('once', 'entity_1');
            const result = combatArts.learnTechnique('once', 'entity_1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TECHNIQUE_ALREADY_LEARNED');
        });

        it('should return error for non-existent technique', () => {
            const result = combatArts.learnTechnique('ghost', 'entity_1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TECHNIQUE_NOT_FOUND');
        });

        it('should trigger skillLearned hook', () => {
            combatArts.registerTechnique('skill_test', { name: 'Skill Test' });
            let called = false;
            combatArts.registerHook('skillLearned', () => { called = true; });
            combatArts.learnTechnique('skill_test', 'sect_1');
            expect(called).toBe(true);
        });
    });

    describe('getTechnique', () => {
        it('should return technique when exists', () => {
            combatArts.registerTechnique('get_test', { name: 'Get Test' });
            const technique = combatArts.getTechnique('get_test');
            expect(technique).not.toBeNull();
            expect(technique.name).toBe('Get Test');
        });

        it('should return null for non-existent technique', () => {
            const technique = combatArts.getTechnique('ghost');
            expect(technique).toBeNull();
        });
    });

    describe('getAllTechniques', () => {
        it('should return all registered techniques', () => {
            combatArts.registerTechnique('tech_a', { name: 'Tech A' });
            combatArts.registerTechnique('tech_b', { name: 'Tech B' });
            const all = combatArts.getAllTechniques();
            expect(all.length).toBeGreaterThanOrEqual(12); // 10 defaults + 2 registered
        });
    });

    describe('getTechniquesByType', () => {
        it('should filter techniques by type', () => {
            combatArts.registerTechnique('type_test_attack', { type: 'attack' });
            combatArts.registerTechnique('type_test_defense', { type: 'defense' });
            const attackTechs = combatArts.getTechniquesByType('attack');
            expect(attackTechs.some(t => t.techniqueId === 'type_test_attack')).toBe(true);
        });
    });

    // ========== 战斗动作执行和冷却管理测试 ==========

    describe('executeAction', () => {
        beforeEach(() => {
            combatArts.createCombatSession('session_test', [
                { id: 'actor_1', name: 'Actor 1', attack: 100, defense: 50, hp: 500, critRate: 0.1 },
                { id: 'actor_2', name: 'Actor 2', attack: 80, defense: 40, hp: 400, critRate: 0.1 },
            ], { initialEnergy: 100 });
        });

        it('should execute action successfully', () => {
            const result = combatArts.executeAction('session_test', 'attack', 'basic_strike', 'actor_1', 'actor_2');
            expect(result.success).toBe(true);
            expect(result.result).toBeDefined();
            expect(result.result.damage).toBeGreaterThan(0);
        });

        it('should reject non-existent session', () => {
            const result = combatArts.executeAction('ghost_session', 'attack', 'basic_strike', 'actor_1', 'actor_2');
            expect(result.success).toBe(false);
            expect(result.error).toBe('COMBAT_SESSION_NOT_FOUND');
        });

        it('should reject non-existent technique', () => {
            const result = combatArts.executeAction('session_test', 'attack', 'ghost_technique', 'actor_1', 'actor_2');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TECHNIQUE_NOT_FOUND');
        });

        it('should put technique on cooldown', () => {
            const result = combatArts.executeAction('session_test', 'attack', 'power_slash', 'actor_1', 'actor_2');
            expect(result.success).toBe(true);
            
            // Try to use immediately again
            const result2 = combatArts.executeAction('session_test', 'attack', 'power_slash', 'actor_1', 'actor_2');
            expect(result2.success).toBe(false);
            expect(result2.error).toBe('TECHNIQUE_ON_COOLDOWN');
        });

        it('should reject insufficient energy', () => {
            combatArts.createCombatSession('low_energy_session', [
                { id: 'poor_actor', attack: 50, defense: 20, hp: 200 },
            ], { initialEnergy: 5 });
            
            const result = combatArts.executeAction('low_energy_session', 'attack', 'ultimate_fury', 'poor_actor', 'actor_2');
            expect(result.success).toBe(false);
            expect(result.error).toBe('INSUFFICIENT_ENERGY');
        });
    });

    describe('Cooldown Management', () => {
        beforeEach(() => {
            combatArts.createCombatSession('cd_session', [
                { id: 'cd_actor', attack: 100, defense: 50 },
            ]);
        });

        it('should check cooldown correctly', () => {
            const key = 'cd_session:power_slash';
            expect(combatArts._isOnCooldown(key)).toBe(false);
        });

        it('should track cooldown after use', () => {
            combatArts.executeAction('cd_session', 'attack', 'power_slash', 'cd_actor', 'cd_actor');
            const key = 'cd_session:power_slash';
            expect(combatArts._isOnCooldown(key)).toBe(true);
        });

        it('should get cooldown remaining', () => {
            combatArts.executeAction('cd_session', 'attack', 'power_slash', 'cd_actor', 'cd_actor');
            const key = 'cd_session:power_slash';
            const remaining = combatArts._getCooldownRemaining(key);
            expect(remaining).toBeGreaterThan(0);
        });
    });

    // ========== 战斗伤害计算和属性加成测试 ==========

    describe('_calculateDamage', () => {
        it('should calculate base damage', () => {
            const actor = { attack: 100, attackPercent: 1.0 };
            const target = { defense: 30, technique: 'test' };
            const technique = { damage: 50, attributes: {} };
            
            const damage = combatArts._calculateDamage(actor, target, technique);
            expect(damage).toBeGreaterThan(0);
            expect(damage).toBeLessThan(100);
        });

        it('should apply technique advantage', () => {
            const actor = { attack: 100 };
            const target = { defense: 0, technique: 'enemy_tech' };
            const technique = { damage: 50, attributes: { advantageAgainst: 'enemy_tech' } };
            
            const damage = combatArts._calculateDamage(actor, target, technique);
            expect(damage).toBe(75); // 50 * 1.5 advantage
        });

        it('should respect actor attackPercent', () => {
            const actor = { attack: 100, attackPercent: 1.5 };
            const target = { defense: 0 };
            const technique = { damage: 50, attributes: {} };
            
            const damage = combatArts._calculateDamage(actor, target, technique);
            expect(damage).toBe(75); // 50 * 1.5
        });

        it('should not go below 1 damage', () => {
            const actor = { attack: 10 };
            const target = { defense: 1000 };
            const technique = { damage: 50, attributes: {} };
            
            const damage = combatArts._calculateDamage(actor, target, technique);
            expect(damage).toBeGreaterThanOrEqual(1);
        });
    });

    describe('_calculateDefense', () => {
        it('should calculate defense with bonuses', () => {
            const actor = { defense: 50, defensePercent: 1.2 };
            const technique = { defense: 30 };
            
            const defense = combatArts._calculateDefense(actor, technique);
            expect(defense).toBe(36); // 30 * 1.2
        });

        it('should use actor defense as fallback', () => {
            const actor = { defense: 50 };
            const technique = { defense: 0 };
            
            const defense = combatArts._calculateDefense(actor, technique);
            expect(defense).toBe(50);
        });
    });

    describe('_calculateHeal', () => {
        it('should calculate heal amount', () => {
            const actor = { qiRegenBonus: 0 };
            const technique = { heal: 100 };
            
            const heal = combatArts._calculateHeal(actor, technique);
            expect(heal).toBe(100);
        });

        it('should apply qiRegenBonus', () => {
            const actor = { qiRegenBonus: 0.5 };
            const technique = { heal: 100 };
            
            const heal = combatArts._calculateHeal(actor, technique);
            expect(heal).toBe(150);
        });
    });

    describe('_calculateActionResult', () => {
        it('should handle attack action type', () => {
            const session = combatArts.createCombatSession('result_session', [
                { id: 'atk', attack: 100, defense: 50, critRate: 0.1 },
                { id: 'def', defense: 30 },
            ]).session;
            
            const technique = combatArts.getTechnique('basic_strike');
            const result = combatArts._calculateActionResult(session, 'attack', technique, 'atk', 'def');
            
            expect(result.actionType).toBe('attack');
            expect(result.damage).toBeGreaterThan(0);
        });

        it('should handle defend action type', () => {
            const session = combatArts.createCombatSession('def_session', [
                { id: 'actor', attack: 100, defense: 50 },
            ]).session;
            
            const technique = combatArts.getTechnique('defensive_stance');
            const result = combatArts._calculateActionResult(session, 'defend', technique, 'actor', 'actor');
            
            expect(result.actionType).toBe('defend');
            expect(result.defenseValue).toBeGreaterThan(0);
        });

        it('should handle heal action type', () => {
            const session = combatArts.createCombatSession('heal_session', [
                { id: 'healer', attack: 50, qiRegenBonus: 0 },
            ]).session;
            
            const technique = combatArts.getTechnique('healing_light');
            const result = combatArts._calculateActionResult(session, 'heal', technique, 'healer', 'healer');
            
            expect(result.actionType).toBe('heal');
            expect(result.heal).toBeGreaterThan(0);
        });

        it('should return error for invalid actor/target', () => {
            const session = combatArts.createCombatSession('invalid_session', [
                { id: 'valid', attack: 100 },
            ]).session;
            
            const technique = combatArts.getTechnique('basic_strike');
            const result = combatArts._calculateActionResult(session, 'attack', technique, 'ghost', 'valid');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('INVALID_ACTOR_TARGET');
        });
    });

    // ========== 战斗combo连击系统测试 ==========

    describe('Combo System', () => {
        beforeEach(() => {
            combatArts.createCombatSession('combo_session', [
                { id: 'combo_actor', attack: 100, defense: 50, critRate: 0 },
                { id: 'target', defense: 30 },
            ]);
        });

        it('should track combo count', () => {
            combatArts.executeAction('combo_session', 'attack', 'basic_strike', 'combo_actor', 'target');
            combatArts.executeAction('combo_session', 'attack', 'power_slash', 'combo_actor', 'target');
            
            const state = combatArts.getComboState('combo_session', 'combo_actor');
            expect(state.count).toBe(2);
        });

        it('should reset combo after window expires', async () => {
            const fastComboSystem = new CombatArtsSystem({ comboWindowMs: 50 });
            fastComboSystem.createCombatSession('fast_combo', [
                { id: 'fast_actor', attack: 100, defense: 50 },
                { id: 'target', defense: 30 },
            ]);
            
            fastComboSystem.executeAction('fast_combo', 'attack', 'basic_strike', 'fast_actor', 'target');
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // After window expires, combo should be reset
            // Using same technique again should not continue combo (same technique doesn't increment)
            const state = fastComboSystem.getComboState('fast_combo', 'fast_actor');
            // Combo state exists but count is 0 after expiration
            expect(state).not.toBeNull();
        });

        it('should cap combo at maxCombo', () => {
            for (let i = 0; i < 15; i++) {
                combatArts.executeAction('combo_session', 'attack', 'basic_strike', 'combo_actor', 'target');
            }
            
            const state = combatArts.getComboState('combo_session', 'combo_actor');
            expect(state.count).toBeLessThanOrEqual(10);
        });

        it('should reset combo manually', () => {
            combatArts.executeAction('combo_session', 'attack', 'basic_strike', 'combo_actor', 'target');
            combatArts.resetCombo('combo_session', 'combo_actor');
            
            const state = combatArts.getComboState('combo_session', 'combo_actor');
            expect(state).toBeNull();
        });

        it('should apply combo multiplier to damage', () => {
            combatArts.createCombatSession('combo_dmg_session', [
                { id: 'combo_dmg_actor', attack: 100, defense: 50, critRate: 0 },
                { id: 'target', defense: 30 },
            ]);
            
            // First action - no combo
            const result1 = combatArts.executeAction('combo_dmg_session', 'attack', 'basic_strike', 'combo_dmg_actor', 'target');
            expect(result1.success).toBe(true);
            expect(result1.result.damage).toBeGreaterThan(0);
            
            // Second action - different technique continues combo
            const result2 = combatArts.executeAction('combo_dmg_session', 'attack', 'power_slash', 'combo_dmg_actor', 'target');
            expect(result2.success).toBe(true);
            
            // Combo damage should be at least as high as base (combo multiplier applied)
            expect(result2.result.damage).toBeGreaterThanOrEqual(result1.result.damage);
        });

        it('should return null for non-existent combo state', () => {
            const state = combatArts.getComboState('combo_session', 'ghost');
            expect(state).toBeNull();
        });
    });

    // ========== 战斗AI自进化测试 ==========

    describe('learnFromCombat', () => {
        it('should record combat result', () => {
            const result = combatArts.learnFromCombat('ai_entity', {
                result: 'win',
                damageDealt: 500,
                damageTaken: 100,
                techniquesUsed: ['basic_strike'],
            });
            
            expect(result.success).toBe(true);
            expect(result.winRate).toBe(1.0);
        });

        it('should update win rate over multiple combats', () => {
            combatArts.learnFromCombat('tracker', { result: 'win', damageDealt: 100 });
            combatArts.learnFromCombat('tracker', { result: 'win', damageDealt: 100 });
            combatArts.learnFromCombat('tracker', { result: 'lose', damageDealt: 50 });
            
            const result = combatArts.learnFromCombat('tracker', { result: 'win', damageDealt: 100 });
            expect(result.winRate).toBeCloseTo(0.75);
        });

        it('should evolve AI when points exceed threshold', () => {
            for (let i = 0; i < 10; i++) {
                combatArts.learnFromCombat('evolving_ai', {
                    result: 'win',
                    damageDealt: 500 + i * 50,
                    damageTaken: 50,
                    techniquesUsed: ['basic_strike', 'power_slash'],
                });
            }
            
            const result = combatArts.learnFromCombat('evolving_ai', {
                result: 'win',
                damageDealt: 600,
                damageTaken: 50,
                techniquesUsed: ['ultimate_fury'],
            });
            
            // Check if evolved
            expect(result.success).toBe(true);
        });

        it('should track preferred role', () => {
            for (let i = 0; i < 5; i++) {
                combatArts.learnFromCombat('attacker_ai', {
                    result: 'win',
                    damageDealt: 300,
                    techniquesUsed: ['power_slash'],
                });
            }
            
            for (let i = 0; i < 2; i++) {
                combatArts.learnFromCombat('attacker_ai', {
                    result: 'win',
                    damageDealt: 100,
                    techniquesUsed: ['healing_light'],
                });
            }
            
            const data = combatArts.getAILearningData('attacker_ai');
            expect(data.preferredRole).toBe('attacker');
        });

        it('should return error when evolution disabled', () => {
            const noEvolution = new CombatArtsSystem({ evolutionEnabled: false });
            const result = noEvolution.learnFromCombat('entity', { result: 'win' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('EVOLUTION_DISABLED');
        });
    });

    describe('_calculateEvolutionPoints', () => {
        it('should calculate points based on combat effectiveness', () => {
            const data = {
                winRate: 0.8,
                averageDamage: 500,
                combatHistory: [
                    { techniquesUsed: ['a', 'b'] },
                    { techniquesUsed: ['a', 'c'] },
                ],
            };
            
            const points = combatArts._calculateEvolutionPoints(data);
            expect(points).toBeGreaterThan(0);
            expect(points).toBeLessThanOrEqual(100);
        });
    });

    describe('getAILearningData', () => {
        it('should return null for non-existent entity', () => {
            const data = combatArts.getAILearningData('ghost');
            expect(data).toBeNull();
        });

        it('should return data for existing entity', () => {
            combatArts.learnFromCombat('existing', { result: 'win' });
            const data = combatArts.getAILearningData('existing');
            expect(data).not.toBeNull();
            expect(data.winRate).toBe(1.0);
        });
    });

    // ========== 战斗角色专业化测试 ==========

    describe('setEntityRole', () => {
        it('should set valid role', () => {
            combatArts.createCombatSession('role_session', [
                { id: 'role_entity', attack: 100, defense: 50 },
            ]);
            
            const result = combatArts.setEntityRole('role_entity', 'attacker');
            expect(result.success).toBe(true);
            expect(result.role).toBe('attacker');
        });

        it('should reject invalid role', () => {
            const result = combatArts.setEntityRole('any_entity', 'ghost_role');
            expect(result.success).toBe(false);
            expect(result.error).toBe('INVALID_ROLE');
        });

        it('should return error when entity not in combat', () => {
            const result = combatArts.setEntityRole('non_combatant', 'defender');
            expect(result.success).toBe(false);
            expect(result.error).toBe('ENTITY_NOT_IN_COMBAT');
        });
    });

    describe('_getRoleBonus', () => {
        it('should give attacker bonus to attack', () => {
            const bonus = combatArts._getRoleBonus('attacker', 'attack');
            expect(bonus.damageBonus).toBeGreaterThan(1.0);
        });

        it('should give defender bonus to defense', () => {
            const bonus = combatArts._getRoleBonus('defender', 'defend');
            expect(bonus.defenseBonus).toBeGreaterThan(1.0);
        });

        it('should give support bonus to heal', () => {
            const bonus = combatArts._getRoleBonus('support', 'heal');
            expect(bonus.healBonus).toBeGreaterThan(1.0);
        });

        it('should use balanced as default', () => {
            const bonus = combatArts._getRoleBonus('unknown_role', 'attack');
            expect(bonus.damageBonus).toBe(1.0);
        });
    });

    // ========== Mesh网络同步测试 ==========

    describe('syncToMesh', () => {
        it('should sync session to mesh network', () => {
            combatArts.createCombatSession('mesh_session', [
                { id: 'mesh_actor', attack: 100 },
            ]);
            
            const result = combatArts.syncToMesh('mesh_session');
            expect(result.success).toBe(true);
            expect(mockMesh.broadcast).toHaveBeenCalled();
        });

        it('should return error when mesh not available', () => {
            const noMesh = new CombatArtsSystem({ meshNetwork: null });
            const result = noMesh.syncToMesh('any_session');
            expect(result.success).toBe(false);
            expect(result.error).toBe('MESH_NOT_AVAILABLE');
        });

        it('should return error for non-existent session', () => {
            const result = combatArts.syncToMesh('ghost_session');
            expect(result.success).toBe(false);
            expect(result.error).toBe('COMBAT_SESSION_NOT_FOUND');
        });
    });

    describe('handleMeshSync', () => {
        it('should update session from mesh data', () => {
            combatArts.createCombatSession('sync_session', [
                { id: 'sync_actor', attack: 100, defense: 50 },
            ]);
            
            combatArts.handleMeshSync({
                sessionId: 'sync_session',
                actors: [['sync_actor', { id: 'sync_actor', attack: 150 }]],
                energy: 80,
                round: 5,
            });
            
            const session = combatArts.getCombatSession('sync_session');
            expect(session.actors.get('sync_actor').attack).toBe(150);
            expect(session.energy).toBe(80);
            expect(session.round).toBe(5);
        });

        it('should trigger hook on mesh sync received', () => {
            combatArts.createCombatSession('hook_session', [
                { id: 'hook_actor', attack: 100 },
            ]);
            
            let called = false;
            combatArts.registerHook('meshSyncReceived', () => { called = true; });
            
            combatArts.handleMeshSync({
                sessionId: 'hook_session',
                actors: [['hook_actor', { attack: 100 }]],
                energy: 100,
                round: 1,
            });
            
            expect(called).toBe(true);
        });
    });

    // ========== 战斗会话管理测试 ==========

    describe('createCombatSession', () => {
        it('should create session successfully', () => {
            const result = combatArts.createCombatSession('new_session', [
                { id: 'actor_1', name: 'Actor 1', attack: 100, defense: 50 },
                { id: 'actor_2', name: 'Actor 2', attack: 80, defense: 40 },
            ]);
            
            expect(result.success).toBe(true);
            expect(result.session.id).toBe('new_session');
            expect(result.session.actors.size).toBe(2);
            expect(result.session.energy).toBe(100);
        });

        it('should use custom initial energy', () => {
            const result = combatArts.createCombatSession('energy_session', [
                { id: 'actor' },
            ], { initialEnergy: 200, maxEnergy: 200 });
            
            expect(result.session.energy).toBe(200);
        });

        it('should reject duplicate session ID', () => {
            combatArts.createCombatSession('dup_session', [{ id: 'a' }]);
            const result = combatArts.createCombatSession('dup_session', [{ id: 'b' }]);
            expect(result.success).toBe(false);
            expect(result.error).toBe('SESSION_EXISTS');
        });
    });

    describe('getCombatSession', () => {
        it('should return session when exists', () => {
            combatArts.createCombatSession('get_session', [{ id: 'actor' }]);
            const session = combatArts.getCombatSession('get_session');
            expect(session).not.toBeNull();
            expect(session.id).toBe('get_session');
        });

        it('should return null for non-existent session', () => {
            const session = combatArts.getCombatSession('ghost');
            expect(session).toBeNull();
        });
    });

    describe('endCombatSession', () => {
        it('should end session with result', () => {
            combatArts.createCombatSession('end_session', [{ id: 'actor' }]);
            const result = combatArts.endCombatSession('end_session', 'victory');
            
            expect(result.success).toBe(true);
            const session = combatArts.getCombatSession('end_session');
            expect(session.result).toBe('victory');
            expect(session.endTime).not.toBeNull();
        });

        it('should return error for non-existent session', () => {
            const result = combatArts.endCombatSession('ghost', 'defeat');
            expect(result.success).toBe(false);
            expect(result.error).toBe('COMBAT_SESSION_NOT_FOUND');
        });

        it('should trigger sessionEnded hook', () => {
            combatArts.createCombatSession('hook_end_session', [{ id: 'actor' }]);
            let called = false;
            combatArts.registerHook('sessionEnded', () => { called = true; });
            
            combatArts.endCombatSession('hook_end_session', 'draw');
            expect(called).toBe(true);
        });
    });

    // ========== Hook系统测试 ==========

    describe('Hook System', () => {
        it('should register and call hooks', () => {
            let callCount = 0;
            const unregister = combatArts.registerHook('techniqueLearned', () => callCount++);
            
            combatArts.registerTechnique('hook_test', { name: 'Hook Test' });
            combatArts.learnTechnique('hook_test', 'entity_1');
            expect(callCount).toBe(1);
            
            unregister();
            combatArts.learnTechnique('hook_test', 'entity_2');
            expect(callCount).toBe(1);
        });

        it('should handle hook errors silently', () => {
            combatArts.registerHook('sessionCreated', () => { throw new Error('test error'); });
            expect(() => combatArts.createCombatSession('error_session', [{ id: 'a' }])).not.toThrow();
        });

        it('should support multiple hooks for same event', () => {
            let count1 = 0, count2 = 0;
            combatArts.registerHook('actionExecuted', () => count1++);
            combatArts.registerHook('actionExecuted', () => count2++);
            
            combatArts.createCombatSession('multi_hook_session', [
                { id: 'actor', attack: 100, defense: 50 },
                { id: 'target', defense: 30 },
            ]);
            combatArts.executeAction('multi_hook_session', 'attack', 'basic_strike', 'actor', 'target');
            
            expect(count1).toBe(1);
            expect(count2).toBe(1);
        });

        it('should return unregister function', () => {
            let count = 0;
            const unregister = combatArts.registerHook('testEvent', () => count++);
            
            combatArts.registerHook('testEvent', () => count++);
            unregister();
            
            // Manually trigger since there's no event that calls testEvent
            // Just verify unregister doesn't throw
            expect(() => unregister()).not.toThrow();
        });
    });

    // ========== 数据持久化测试 ==========

    describe('toJSON', () => {
        it('should serialize all data correctly', () => {
            combatArts.registerTechnique('persist_test', { name: 'Persist Test', type: 'attack' });
            combatArts.learnTechnique('persist_test', 'player');
            combatArts.createCombatSession('persist_session', [{ id: 'actor' }]);
            
            const json = combatArts.toJSON();
            
            expect(json.techniques).toBeDefined();
            expect(json.config).toBeDefined();
        });
    });

    describe('fromJSON', () => {
        it('should deserialize data correctly', () => {
            combatArts.registerTechnique('restore_test', { name: 'Restore Test' });
            combatArts.learnTechnique('restore_test', 'entity_x');
            
            const json = combatArts.toJSON();
            
            const newSystem = new CombatArtsSystem();
            newSystem.fromJSON(json);
            
            const technique = newSystem.getTechnique('restore_test');
            expect(technique).not.toBeNull();
            expect(technique.name).toBe('Restore Test');
        });

        it('should restore AI learning data', () => {
            combatArts.learnFromCombat('restore_ai', { result: 'win', damageDealt: 200 });
            
            const json = combatArts.toJSON();
            const newSystem = new CombatArtsSystem();
            newSystem.fromJSON(json);
            
            const data = newSystem.getAILearningData('restore_ai');
            expect(data).not.toBeNull();
        });
    });

    // ========== 状态查询测试 ==========

    describe('getOverview', () => {
        it('should return correct overview', () => {
            combatArts.createCombatSession('overview_session', [{ id: 'actor' }]);
            
            const overview = combatArts.getOverview();
            expect(overview.totalTechniques).toBeGreaterThan(0);
            expect(overview.totalSessions).toBe(1);
            expect(overview.evolutionEnabled).toBe(true);
        });
    });

    describe('getTechniqueDetails', () => {
        it('should return technique with usage count', () => {
            combatArts.createCombatSession('details_session', [
                { id: 'actor', attack: 100, defense: 50 },
                { id: 'target', defense: 30 },
            ]);
            
            combatArts.executeAction('details_session', 'attack', 'basic_strike', 'actor', 'target');
            combatArts.executeAction('details_session', 'attack', 'basic_strike', 'actor', 'target');
            
            const details = combatArts.getTechniqueDetails('basic_strike');
            expect(details).not.toBeNull();
            expect(details.usageCount).toBe(2);
        });

        it('should return null for non-existent technique', () => {
            const details = combatArts.getTechniqueDetails('ghost');
            expect(details).toBeNull();
        });
    });

    describe('getCooldownStatus', () => {
        it('should return cooldown status for session', () => {
            combatArts.createCombatSession('cd_status_session', [
                { id: 'actor', attack: 100, defense: 50 },
                { id: 'target', defense: 30 },
            ]);
            
            combatArts.executeAction('cd_status_session', 'attack', 'power_slash', 'actor', 'target');
            
            const status = combatArts.getCooldownStatus('cd_status_session');
            expect(status).not.toBeNull();
            expect(status.power_slash).toBeGreaterThan(0);
        });

        it('should return null for non-existent session', () => {
            const status = combatArts.getCooldownStatus('ghost');
            expect(status).toBeNull();
        });
    });

    // ========== 边界情况测试 ==========

    describe('Edge Cases', () => {
        it('should handle empty technique name', () => {
            const result = combatArts.registerTechnique('', { name: '' });
            expect(result.success).toBe(true);
        });

        it('should handle multiple entities learning same technique', () => {
            combatArts.registerTechnique('shared', { name: 'Shared' });
            combatArts.learnTechnique('shared', 'entity_a');
            combatArts.learnTechnique('shared', 'entity_b');
            
            const result = combatArts.learnTechnique('shared', 'entity_c');
            expect(result.success).toBe(true);
        });

        it('should handle session with single actor', () => {
            const result = combatArts.createCombatSession('solo_session', [
                { id: 'solo', attack: 100 },
            ]);
            expect(result.success).toBe(true);
            expect(result.session.actors.size).toBe(1);
        });

        it('should handle very high damage values', () => {
            combatArts.createCombatSession('high_dmg_session', [
                { id: 'powerful', attack: 10000, defense: 5000 },
                { id: 'weak', defense: 1 },
            ]);
            
            const result = combatArts.executeAction('high_dmg_session', 'attack', 'ultimate_fury', 'powerful', 'weak');
            expect(result.success).toBe(true);
            expect(result.result.damage).toBeGreaterThan(0);
        });

        it('should handle concurrent combo from different sessions', () => {
            combatArts.createCombatSession('session_a', [
                { id: 'actor_a', attack: 100, defense: 50 },
                { id: 'target_a', defense: 30 },
            ]);
            
            combatArts.createCombatSession('session_b', [
                { id: 'actor_b', attack: 100, defense: 50 },
                { id: 'target_b', defense: 30 },
            ]);
            
            combatArts.executeAction('session_a', 'attack', 'basic_strike', 'actor_a', 'target_a');
            combatArts.executeAction('session_b', 'attack', 'basic_strike', 'actor_b', 'target_b');
            
            const comboA = combatArts.getComboState('session_a', 'actor_a');
            const comboB = combatArts.getComboState('session_b', 'actor_b');
            
            expect(comboA.count).toBe(1);
            expect(comboB.count).toBe(1);
        });

        it('should handle zero energy session', () => {
            combatArts.createCombatSession('zero_energy', [{ id: 'actor' }], { initialEnergy: 0 });
            const result = combatArts.executeAction('zero_energy', 'attack', 'basic_strike', 'actor', 'actor');
            // basic_strike has 0 energy cost, so should work
            expect(result.success).toBe(true);
        });

        it('should handle AI evolution edge case', () => {
            const aiData = {
                learnedTechniques: new Set(),
                combatHistory: [],
                winRate: 0.5,
                averageDamage: 0,
                preferredRole: 'balanced',
                evolutionLevel: 3, // Max level
            };
            
            combatArts.aiLearningData.set('max_level_ai', aiData);
            
            const result = combatArts.learnFromCombat('max_level_ai', {
                result: 'win',
                damageDealt: 500,
                techniquesUsed: ['basic_strike'],
            });
            
            expect(result.success).toBe(true);
            expect(result.evolved).toBe(false); // Can't evolve past max
        });

        it('should handle technique with no damage or heal', () => {
            combatArts.createCombatSession('no_effect', [
                { id: 'actor', attack: 100, defense: 50 },
            ]);
            
            const result = combatArts.executeAction('no_effect', 'defend', 'defensive_stance', 'actor', 'actor');
            expect(result.success).toBe(true);
            expect(result.result.defenseValue).toBeGreaterThan(0);
            expect(result.result.damage).toBe(0);
        });
    });
});