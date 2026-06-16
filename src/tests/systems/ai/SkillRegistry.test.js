/**
 * SkillRegistry.test.js - 技能注册表测试
 * V282 Iteration 6/9 - NPC Collaborative Learning Mesh
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SkillRegistry } from '../../../systems/ai/SkillRegistry.js';

describe('SkillRegistry', () => {
    let registry;

    beforeEach(() => {
        registry = new SkillRegistry();
    });

    // ==================== 注册测试 ====================

    describe('register() - 注册技能', () => {
        it('应该成功注册一个新技能', () => {
            const skill = { id: 'skill_1', pattern: 'fireball', owner: 'wizard_001' };
            const result = registry.register(skill);

            expect(result.success).toBe(true);
            expect(result.skill.id).toBe('skill_1');
            expect(result.skill.pattern).toBe('fireball');
            expect(result.skill.owner).toBe('wizard_001');
            expect(result.skill.usage).toBe(0);
            expect(result.skill.confidence).toBe(0.5);
        });

        it('应该拒绝缺少 id 的技能', () => {
            const skill = { pattern: 'fireball' };
            const result = registry.register(skill);

            expect(result.success).toBe(false);
            expect(result.reason).toContain('id');
        });

        it('应该拒绝缺少 pattern 的技能', () => {
            const skill = { id: 'skill_1' };
            const result = registry.register(skill);

            expect(result.success).toBe(false);
            expect(result.reason).toContain('pattern');
        });

        it('应该拒绝重复注册的技能', () => {
            const skill = { id: 'skill_1', pattern: 'fireball' };
            registry.register(skill);
            const result = registry.register(skill);

            expect(result.success).toBe(false);
            expect(result.reason).toContain('already registered');
        });

        it('应该使用默认置信度', () => {
            const skill = { id: 'skill_1', pattern: 'fireball' };
            registry.register(skill);

            const retrieved = registry.get('skill_1');
            expect(retrieved.confidence).toBe(0.5);
        });

        it('应该接受自定义置信度', () => {
            const skill = { id: 'skill_1', pattern: 'fireball', confidence: 0.8 };
            registry.register(skill);

            const retrieved = registry.get('skill_1');
            expect(retrieved.confidence).toBe(0.8);
        });
    });

    // ==================== 获取测试 ====================

    describe('get() - 获取技能', () => {
        it('应该返回已注册技能', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            const skill = registry.get('skill_1');

            expect(skill).toBeTruthy();
            expect(skill.id).toBe('skill_1');
        });

        it('应该返回 null 对于未注册技能', () => {
            const skill = registry.get('nonexistent');
            expect(skill).toBeNull();
        });
    });

    describe('has() - 检查技能存在', () => {
        it('应该返回 true 对于已注册技能', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            expect(registry.has('skill_1')).toBe(true);
        });

        it('应该返回 false 对于未注册技能', () => {
            expect(registry.has('nonexistent')).toBe(false);
        });
    });

    // ==================== 模式匹配测试 ====================

    describe('findByPattern() - 模式匹配', () => {
        beforeEach(() => {
            registry.register({ id: 'skill_1', pattern: 'fireball attack' });
            registry.register({ id: 'skill_2', pattern: 'ice shield' });
            registry.register({ id: 'skill_3', pattern: 'fire resistance' });
            registry.register({ id: 'skill_4', pattern: 'lightning bolt' });
        });

        it('应该找到匹配模式的技能', () => {
            const results = registry.findByPattern('fire');
            expect(results.length).toBe(2);
            expect(results.map(s => s.id).sort()).toEqual(['skill_1', 'skill_3']);
        });

        it('应该返回空数组对于无匹配', () => {
            const results = registry.findByPattern('water');
            expect(results.length).toBe(0);
        });

        it('应该大小写不敏感', () => {
            const results = registry.findByPattern('FIRE');
            expect(results.length).toBe(2);
        });

        it('应该返回所有技能当模式为空', () => {
            const results = registry.findByPattern('');
            expect(results.length).toBe(4);
        });
    });

    // ==================== 查询测试 ====================

    describe('getAll() - 获取所有技能', () => {
        it('应该返回所有已注册技能', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.register({ id: 'skill_2', pattern: 'ice shield' });

            const skills = registry.getAll();
            expect(skills.length).toBe(2);
        });

        it('应该返回空数组当无注册技能', () => {
            const skills = registry.getAll();
            expect(skills.length).toBe(0);
        });
    });

    describe('size() - 获取技能数量', () => {
        it('应该返回注册技能数量', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.register({ id: 'skill_2', pattern: 'ice shield' });
            expect(registry.size()).toBe(2);
        });

        it('应该返回 0 当无注册技能', () => {
            expect(registry.size()).toBe(0);
        });
    });

    // ==================== 更新测试 ====================

    describe('updateUsage() - 更新使用次数', () => {
        it('应该增加使用次数', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.updateUsage('skill_1', 5);

            const skill = registry.get('skill_1');
            expect(skill.usage).toBe(5);
        });

        it('应该默认增加 1', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.updateUsage('skill_1');

            const skill = registry.get('skill_1');
            expect(skill.usage).toBe(1);
        });

        it('应该拒绝未注册技能', () => {
            const result = registry.updateUsage('nonexistent');
            expect(result.success).toBe(false);
        });

        it('应该累加使用次数', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.updateUsage('skill_1', 3);
            registry.updateUsage('skill_1', 2);

            const skill = registry.get('skill_1');
            expect(skill.usage).toBe(5);
        });
    });

    describe('updateConfidence() - 更新置信度', () => {
        it('应该更新置信度', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.updateConfidence('skill_1', 0.9);

            const skill = registry.get('skill_1');
            expect(skill.confidence).toBe(0.9);
        });

        it('应该限制置信度在 0-1 范围', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.updateConfidence('skill_1', 1.5);

            const skill = registry.get('skill_1');
            expect(skill.confidence).toBe(1);
        });

        it('应该拒绝负值', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.updateConfidence('skill_1', -0.5);

            const skill = registry.get('skill_1');
            expect(skill.confidence).toBe(0);
        });

        it('应该拒绝未注册技能', () => {
            const result = registry.updateConfidence('nonexistent', 0.8);
            expect(result.success).toBe(false);
        });
    });

    // ==================== 删除测试 ====================

    describe('unregister() - 删除技能', () => {
        it('应该成功删除已注册技能', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            const result = registry.unregister('skill_1');

            expect(result.success).toBe(true);
            expect(registry.has('skill_1')).toBe(false);
        });

        it('应该返回删除的技能信息', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            const result = registry.unregister('skill_1');

            expect(result.removed.id).toBe('skill_1');
        });

        it('应该拒绝删除未注册技能', () => {
            const result = registry.unregister('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    describe('clear() - 清空注册表', () => {
        it('应该清空所有技能', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.register({ id: 'skill_2', pattern: 'ice shield' });
            registry.clear();

            expect(registry.size()).toBe(0);
        });

        it('应该返回清空的数量', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            registry.register({ id: 'skill_2', pattern: 'ice shield' });
            const result = registry.clear();

            expect(result.cleared).toBe(2);
        });
    });

    // ==================== 统计测试 ====================

    describe('getStats() - 获取统计信息', () => {
        it('应该返回正确统计', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball', owner: 'wizard', usage: 10, confidence: 0.9 });
            registry.register({ id: 'skill_2', pattern: 'ice shield', owner: 'mage', usage: 5, confidence: 0.7 });
            registry.register({ id: 'skill_3', pattern: 'lightning', owner: 'wizard', usage: 8, confidence: 0.8 });

            const stats = registry.getStats();

            expect(stats.totalSkills).toBe(3);
            expect(stats.totalUsage).toBe(23);
            expect(stats.avgConfidence).toBe(0.8);
        });

        it('应该包含所有者分布', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball', owner: 'wizard' });
            registry.register({ id: 'skill_2', pattern: 'ice shield', owner: 'wizard' });

            const stats = registry.getStats();
            expect(stats.byOwner.get('wizard')).toBe(2);
        });
    });

    describe('getMostUsed() - 获取最高使用技能', () => {
        it('应该返回使用次数最高的技能', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball', usage: 5 });
            registry.register({ id: 'skill_2', pattern: 'ice shield', usage: 10 });
            registry.register({ id: 'skill_3', pattern: 'lightning', usage: 3 });

            const results = registry.getMostUsed(2);
            expect(results.length).toBe(2);
            expect(results[0].id).toBe('skill_2');
            expect(results[1].id).toBe('skill_1');
        });
    });

    describe('getMostConfident() - 获取最高置信度技能', () => {
        it('应该返回置信度最高的技能', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball', confidence: 0.5 });
            registry.register({ id: 'skill_2', pattern: 'ice shield', confidence: 0.9 });
            registry.register({ id: 'skill_3', pattern: 'lightning', confidence: 0.7 });

            const results = registry.getMostConfident(2);
            expect(results.length).toBe(2);
            expect(results[0].id).toBe('skill_2');
            expect(results[1].id).toBe('skill_3');
        });
    });

    // ==================== 时间戳测试 ====================

    describe('时间戳追踪', () => {
        it('应该记录创建时间', () => {
            const before = Date.now();
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            const after = Date.now();

            const skill = registry.get('skill_1');
            expect(skill.createdAt).toBeGreaterThanOrEqual(before);
            expect(skill.createdAt).toBeLessThanOrEqual(after);
        });

        it('应该更新 updatedAt 当修改技能', () => {
            registry.register({ id: 'skill_1', pattern: 'fireball' });
            const original = registry.get('skill_1').updatedAt;

            // 等待一小段时间
            registry.updateUsage('skill_1');

            const updated = registry.get('skill_1').updatedAt;
            expect(updated).toBeGreaterThanOrEqual(original);
        });
    });
});