/**
 * EvolutionTrigger 单元测试
 * V281 Iteration 5/9 - Self-Evolution Trigger & Learning Policy
 * 
 * 测试策略: 验证自动进化触发器的条件注册、检查和触发机制
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EvolutionTrigger } from '../../../systems/ai/EvolutionTrigger.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { IEREngine } from '../../../systems/ai/IEREngine.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';

describe('EvolutionTrigger', () => {
    let evolutionTrigger;
    let experienceTracker;
    let ierEngine;
    let skillCrystallization;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker(100);
        skillCrystallization = new SkillCrystallization();
        skillCrystallization.setExperienceTracker(experienceTracker);
        ierEngine = new IEREngine(experienceTracker, skillCrystallization);
        evolutionTrigger = new EvolutionTrigger(experienceTracker, ierEngine, skillCrystallization);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('应该使用提供的ExperienceTracker、IEREngine和SkillCrystallization创建实例', () => {
            expect(evolutionTrigger.experienceTracker).toBe(experienceTracker);
            expect(evolutionTrigger.ierEngine).toBe(ierEngine);
            expect(evolutionTrigger.skillCrystallization).toBe(skillCrystallization);
        });

        it('应该初始化triggers Map为空', () => {
            expect(evolutionTrigger.triggers).toBeInstanceOf(Map);
            expect(evolutionTrigger.triggers.size).toBe(0);
        });

        it('应该初始化triggerHistory Map为空', () => {
            expect(evolutionTrigger.triggerHistory).toBeInstanceOf(Map);
            expect(evolutionTrigger.triggerHistory.size).toBe(0);
        });

        it('应该设置默认cooldown为60000ms', () => {
            expect(evolutionTrigger.cooldown).toBe(60000);
        });

        it('应该初始化内置条件', () => {
            expect(evolutionTrigger.builtInConditions).toBeInstanceOf(Map);
            expect(evolutionTrigger.builtInConditions.size).toBeGreaterThan(0);
        });
    });

    describe('CONDITIONS 静态属性', () => {
        it('应该包含预定义的条件类型', () => {
            expect(EvolutionTrigger.CONDITIONS.HIGH_FAILURE_RATE).toBe('HIGH_FAILURE_RATE');
            expect(EvolutionTrigger.CONDITIONS.LEARNING_PLATEAU).toBe('LEARNING_PLATEAU');
            expect(EvolutionTrigger.CONDITIONS.SKILL_MATURE).toBe('SKILL_MATURE');
            expect(EvolutionTrigger.CONDITIONS.LOW_ADAPTATION).toBe('LOW_ADAPTATION');
            expect(EvolutionTrigger.CONDITIONS.HIGH_INTERACTION_COUNT).toBe('HIGH_INTERACTION_COUNT');
            expect(EvolutionTrigger.CONDITIONS.SKILL_UNUSED).toBe('SKILL_UNUSED');
            expect(EvolutionTrigger.CONDITIONS.HAS_SUGGESTIONS).toBe('HAS_SUGGESTIONS');
            expect(EvolutionTrigger.CONDITIONS.CONSECUTIVE_SUCCESS).toBe('CONSECUTIVE_SUCCESS');
        });
    });

    describe('registerTrigger', () => {
        it('应该成功注册内置条件触发器', () => {
            const result = evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            
            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.conditionId).toBe('HIGH_FAILURE_RATE');
        });

        it('应该拒绝未知条件ID', () => {
            const result = evolutionTrigger.registerTrigger('npc_001', 'UNKNOWN_CONDITION', async () => {});
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Unknown condition');
        });

        it('应该接受自定义条件对象', () => {
            const customCondition = evolutionTrigger.createCondition(
                'CUSTOM', 'Custom Condition', () => true
            );
            
            const result = evolutionTrigger.registerTrigger('npc_001', customCondition, async () => {});
            
            expect(result.success).toBe(true);
            expect(result.conditionId).toBe('CUSTOM');
        });

        it('应该拒绝无效条件类型', () => {
            const result = evolutionTrigger.registerTrigger('npc_001', 123, async () => {});
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Invalid condition');
        });

        it('应该拒绝无效动作类型', () => {
            const result = evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', 'not_a_function');
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Invalid action');
        });

        it('应该允许同一NPC注册多个触发器', () => {
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            evolutionTrigger.registerTrigger('npc_001', 'LOW_ADAPTATION', async () => {});
            
            const triggers = evolutionTrigger.getRegisteredTriggers('npc_001');
            
            expect(triggers.length).toBe(2);
        });
    });

    describe('registerBuiltInTrigger', () => {
        it('应该成功注册内置触发器', () => {
            const result = evolutionTrigger.registerBuiltInTrigger('npc_001', 'HIGH_FAILURE_RATE');
            
            expect(result.success).toBe(true);
            expect(result.conditionId).toBe('HIGH_FAILURE_RATE');
        });

        it('应该为内置触发器分配正确的动作', () => {
            evolutionTrigger.registerBuiltInTrigger('npc_001', 'HIGH_FAILURE_RATE');
            
            const triggers = evolutionTrigger.getRegisteredTriggers('npc_001');
            
            expect(triggers[0].actionId).toBeDefined();
        });
    });

    describe('checkAndTrigger', () => {
        it('应该返回no_triggers_registered当没有触发器时', async () => {
            const result = await evolutionTrigger.checkAndTrigger('npc_unknown');
            
            expect(result.triggered).toBe(false);
            expect(result.reason).toBe('no_triggers_registered');
        });

        it('当冷却时间未过时应返回cooldown_active', async () => {
            evolutionTrigger.setCooldown(100000); // 100秒冷却
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            
            // 手动设置上次触发时间
            evolutionTrigger.lastTriggerTime.set('npc_001', Date.now());
            
            const result = await evolutionTrigger.checkAndTrigger('npc_001');
            
            expect(result.triggered).toBe(false);
            expect(result.reason).toBe('cooldown_active');
        });

        it('当HIGH_FAILURE_RATE条件满足时应触发', async () => {
            // 注册触发器
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {
                return { success: true, action: 'refine' };
            });
            
            // 添加3次失败交互触发HIGH_FAILURE_RATE
            for (let i = 0; i < 3; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
                await ierEngine.refine('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
            }
            
            const result = await evolutionTrigger.checkAndTrigger('npc_001');
            
            expect(result.triggered).toBe(true);
            expect(result.conditions).toContain('HIGH_FAILURE_RATE');
        });

        it('当条件不满足时不应触发', async () => {
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            
            // 只添加1次失败，不满足HIGH_FAILURE_RATE条件
            experienceTracker.track('npc_001', {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'Here you go',
                outcome: { success: true, satisfaction: 0.8 }
            });
            
            const result = await evolutionTrigger.checkAndTrigger('npc_001');
            
            expect(result.triggered).toBe(false);
        });

        it('应该记录触发历史', async () => {
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            
            // 触发条件
            for (let i = 0; i < 3; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
                await ierEngine.refine('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
            }
            
            await evolutionTrigger.checkAndTrigger('npc_001');
            
            const history = evolutionTrigger.getTriggerHistory('npc_001');
            
            expect(history.length).toBeGreaterThan(0);
            expect(history[0].conditions).toContain('HIGH_FAILURE_RATE');
        });
    });

    describe('clearTriggers', () => {
        it('应该清除指定NPC的所有触发器', () => {
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            evolutionTrigger.registerTrigger('npc_001', 'LOW_ADAPTATION', async () => {});
            
            const result = evolutionTrigger.clearTriggers('npc_001');
            
            expect(result.success).toBe(true);
            expect(result.cleared).toBe(true);
            expect(evolutionTrigger.getRegisteredTriggers('npc_001').length).toBe(0);
        });

        it('对不存在的NPC应返回cleared=false', () => {
            const result = evolutionTrigger.clearTriggers('npc_unknown');
            
            expect(result.success).toBe(true);
            expect(result.cleared).toBe(false);
        });
    });

    describe('getRegisteredTriggers', () => {
        it('应该返回NPC的注册触发器列表', () => {
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            evolutionTrigger.registerTrigger('npc_001', 'LOW_ADAPTATION', async () => {});
            
            const triggers = evolutionTrigger.getRegisteredTriggers('npc_001');
            
            expect(triggers.length).toBe(2);
            expect(triggers[0].conditionId).toBeDefined();
            expect(triggers[0].actionId).toBeDefined();
        });

        it('对不存在的NPC应返回空数组', () => {
            const triggers = evolutionTrigger.getRegisteredTriggers('npc_unknown');
            
            expect(triggers).toEqual([]);
        });
    });

    describe('getTriggerHistory', () => {
        it('应该返回NPC的触发历史', async () => {
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            
            // 触发
            for (let i = 0; i < 3; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
                await ierEngine.refine('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
            }
            
            await evolutionTrigger.checkAndTrigger('npc_001');
            
            const history = evolutionTrigger.getTriggerHistory('npc_001');
            
            expect(history.length).toBeGreaterThan(0);
        });

        it('应该支持limit参数', async () => {
            evolutionTrigger.registerTrigger('npc_001', 'HIGH_FAILURE_RATE', async () => {});
            
            // 多次触发
            for (let i = 0; i < 3; i++) {
                experienceTracker.track('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
                await ierEngine.refine('npc_001', {
                    type: 'trade',
                    playerAction: 'buy sword',
                    npcResponse: 'No sword',
                    outcome: { success: false, satisfaction: 0.2 }
                });
                
                evolutionTrigger.lastTriggerTime.set('npc_001', 0); // 绕过冷却
                await evolutionTrigger.checkAndTrigger('npc_001');
            }
            
            const history = evolutionTrigger.getTriggerHistory('npc_001', 2);
            
            expect(history.length).toBeLessThanOrEqual(2);
        });
    });

    describe('setCooldown', () => {
        it('应该正确设置冷却时间', () => {
            evolutionTrigger.setCooldown(5000);
            
            expect(evolutionTrigger.cooldown).toBe(5000);
        });
    });

    describe('createCondition', () => {
        it('应该创建自定义条件', () => {
            const condition = evolutionTrigger.createCondition(
                'TEST_COND', 'Test Condition', () => true
            );
            
            expect(condition.id).toBe('TEST_COND');
            expect(condition.name).toBe('Test Condition');
            expect(typeof condition.evaluator).toBe('function');
        });

        it('自定义条件应该能够正确评估', () => {
            const condition = evolutionTrigger.createCondition(
                'TEST_COND', 'Test Condition', () => true
            );
            
            const result = condition.evaluate(experienceTracker, ierEngine, skillCrystallization, 'npc_001');
            
            expect(result).toBe(true);
        });
    });

    describe('createAction', () => {
        it('应该创建自定义动作', async () => {
            const action = evolutionTrigger.createAction(
                'TEST_ACT', 'Test Action', async () => ({ success: true })
            );
            
            expect(action.id).toBe('TEST_ACT');
            expect(action.name).toBe('Test Action');
            expect(typeof action.handler).toBe('function');
            
            const result = await action.execute('npc_001', {});
            
            expect(result.success).toBe(true);
        });
    });

    describe('getAvailableConditions', () => {
        it('应该返回所有可用的内置条件ID', () => {
            const conditions = evolutionTrigger.getAvailableConditions();
            
            expect(Array.isArray(conditions)).toBe(true);
            expect(conditions.length).toBeGreaterThan(0);
            expect(conditions).toContain('HIGH_FAILURE_RATE');
            expect(conditions).toContain('LEARNING_PLATEAU');
            expect(conditions).toContain('SKILL_MATURE');
        });
    });

    describe('内置条件评估', () => {
        describe('LOW_ADAPTATION', () => {
            it('当适配度分数<0.3时应评估为true', async () => {
                evolutionTrigger.registerTrigger('npc_001', 'LOW_ADAPTATION', async () => {});
                
                // 添加大量低满意度交互
                for (let i = 0; i < 30; i++) {
                    experienceTracker.track('npc_001', {
                        type: 'trade',
                        playerAction: 'buy sword',
                        npcResponse: 'No sword',
                        outcome: { success: false, satisfaction: 0.1 }
                    });
                }
                
                const result = await evolutionTrigger.checkAndTrigger('npc_001');
                
                expect(result.triggered).toBe(true);
                expect(result.conditions).toContain('LOW_ADAPTATION');
            });
        });

        describe('CONSECUTIVE_SUCCESS', () => {
            it('当连续成功>=5时应评估为true', async () => {
                evolutionTrigger.registerTrigger('npc_001', 'CONSECUTIVE_SUCCESS', async () => {});
                
                // 添加连续5次成功交互
                for (let i = 0; i < 5; i++) {
                    experienceTracker.track('npc_001', {
                        type: 'trade',
                        playerAction: 'buy sword',
                        npcResponse: 'Here you go',
                        outcome: { success: true, satisfaction: 0.9 }
                    });
                }
                
                const result = await evolutionTrigger.checkAndTrigger('npc_001');
                
                expect(result.triggered).toBe(true);
                expect(result.conditions).toContain('CONSECUTIVE_SUCCESS');
            });
        });
    });
});