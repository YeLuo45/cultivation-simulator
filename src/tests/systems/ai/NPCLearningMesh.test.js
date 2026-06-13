/**
 * NPCLearningMesh.test.js - NPC 协作学习网络测试
 * V282 Iteration 6/9 - NPC Collaborative Learning Mesh
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NPCLearningMesh } from '../../../systems/ai/NPCLearningMesh.js';
import { SkillRegistry } from '../../../systems/ai/SkillRegistry.js';

describe('NPCLearningMesh', () => {
    let mesh;

    beforeEach(() => {
        mesh = new NPCLearningMesh();
    });

    // ==================== 注册/注销测试 ====================

    describe('register() - 注册 NPC', () => {
        it('应该成功注册新 NPC', () => {
            const result = mesh.register('npc_001');

            expect(result.success).toBe(true);
            expect(result.npcId).toBe('npc_001');
            expect(result.peers).toBe(0);
        });

        it('应该拒绝无效 npcId', () => {
            const result = mesh.register(null);
            expect(result.success).toBe(false);
        });

        it('应该拒绝重复注册', () => {
            mesh.register('npc_001');
            const result = mesh.register('npc_001');

            expect(result.success).toBe(false);
            expect(result.reason).toContain('already registered');
        });
    });

    describe('unregister() - 注销 NPC', () => {
        it('应该成功注销已注册 NPC', () => {
            mesh.register('npc_001');
            const result = mesh.unregister('npc_001');

            expect(result.success).toBe(true);
            expect(result.removed).toBe('npc_001');
        });

        it('应该从对等列表中移除', () => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.connect('npc_001', 'npc_002');

            mesh.unregister('npc_001');

            const peers = mesh.getPeers('npc_002');
            expect(peers.peers).not.toContain('npc_001');
        });

        it('应该拒绝注销未注册 NPC', () => {
            const result = mesh.unregister('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    describe('isRegistered() - 检查注册状态', () => {
        it('应该返回 true 对于已注册 NPC', () => {
            mesh.register('npc_001');
            expect(mesh.isRegistered('npc_001')).toBe(true);
        });

        it('应该返回 false 对于未注册 NPC', () => {
            expect(mesh.isRegistered('nonexistent')).toBe(false);
        });
    });

    // ==================== 连接/断开测试 ====================

    describe('connect() - 连接 NPC', () => {
        it('应该成功建立对等连接', () => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            const result = mesh.connect('npc_001', 'npc_002');

            expect(result.success).toBe(true);
            expect(result.peer1).toBe('npc_001');
            expect(result.peer2).toBe('npc_002');
        });

        it('应该双向建立连接', () => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.connect('npc_001', 'npc_002');

            expect(mesh.getPeers('npc_001').peers).toContain('npc_002');
            expect(mesh.getPeers('npc_002').peers).toContain('npc_001');
        });

        it('应该拒绝连接自己', () => {
            mesh.register('npc_001');
            const result = mesh.connect('npc_001', 'npc_001');

            expect(result.success).toBe(false);
        });

        it('应该拒绝连接未注册 NPC', () => {
            mesh.register('npc_001');
            const result = mesh.connect('npc_001', 'nonexistent');

            expect(result.success).toBe(false);
        });
    });

    describe('disconnect() - 断开连接', () => {
        it('应该成功断开连接', () => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.connect('npc_001', 'npc_002');

            const result = mesh.disconnect('npc_001', 'npc_002');

            expect(result.success).toBe(true);
        });

        it('应该双向断开', () => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.connect('npc_001', 'npc_002');
            mesh.disconnect('npc_001', 'npc_002');

            expect(mesh.getPeers('npc_001').peers).not.toContain('npc_002');
            expect(mesh.getPeers('npc_002').peers).not.toContain('npc_001');
        });
    });

    describe('getPeers() - 获取对等列表', () => {
        it('应该返回 NPC 的对等列表', () => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.register('npc_003');
            mesh.connect('npc_001', 'npc_002');
            mesh.connect('npc_001', 'npc_003');

            const peers = mesh.getPeers('npc_001');

            expect(peers.success).toBe(true);
            expect(peers.peers).toContain('npc_002');
            expect(peers.peers).toContain('npc_003');
            expect(peers.peerCount).toBe(2);
        });

        it('应该拒绝未注册 NPC', () => {
            const result = mesh.getPeers('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    // ==================== 广播测试 ====================

    describe('broadcast() - 广播技能', () => {
        beforeEach(() => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.register('npc_003');
            mesh.connect('npc_001', 'npc_002');
            mesh.connect('npc_001', 'npc_003');
        });

        it('应该成功广播技能给所有对等方', () => {
            const skill = { id: 'fireball', pattern: 'fire attack', owner: 'npc_001' };
            const result = mesh.broadcast('npc_001', skill);

            expect(result.success).toBe(true);
            expect(result.broadcastCount).toBe(2);
        });

        it('应该注册技能到全局注册表', () => {
            const skill = { id: 'fireball', pattern: 'fire attack' };
            mesh.broadcast('npc_001', skill);

            expect(mesh.skillRegistry.has('fireball')).toBe(true);
        });

        it('应该拒绝未注册广播者', () => {
            const skill = { id: 'fireball', pattern: 'fire attack' };
            const result = mesh.broadcast('nonexistent', skill);

            expect(result.success).toBe(false);
        });

        it('应该拒绝无效技能格式', () => {
            const result = mesh.broadcast('npc_001', { id: 'fireball' }); // missing pattern

            expect(result.success).toBe(false);
        });
    });

    describe('querySharedSkills() - 查询共享技能', () => {
        beforeEach(() => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.connect('npc_001', 'npc_002');
        });

        it('应该返回空数组当无共享技能', () => {
            const result = mesh.querySharedSkills('npc_002');

            expect(result.success).toBe(true);
            expect(result.skills).toEqual([]);
        });

        it('应该返回广播的共享技能', () => {
            mesh.broadcast('npc_001', { id: 'fireball', pattern: 'fire attack' });

            const result = mesh.querySharedSkills('npc_002');

            expect(result.success).toBe(true);
            expect(result.skills.length).toBe(1);
            expect(result.skills[0].id).toBe('fireball');
            expect(result.skills[0].sharedBy).toBe('npc_001');
        });

        it('应该拒绝未注册 NPC', () => {
            const result = mesh.querySharedSkills('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    // ==================== 经验融合测试 ====================

    describe('fuseExperience() - 融合经验', () => {
        beforeEach(() => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.register('npc_003');
            // npc_003 需要直接连接到 npc_001 才能收到广播并融合
            mesh.connect('npc_001', 'npc_002');
            mesh.connect('npc_001', 'npc_003');
            mesh.broadcast('npc_001', { id: 'fireball', pattern: 'fire attack', owner: 'npc_001' });
        });

        it('应该成功融合经验', () => {
            const result = mesh.fuseExperience('npc_003', 'npc_001', 'fireball');

            expect(result.success).toBe(true);
            expect(result.target).toBe('npc_003');
            expect(result.source).toBe('npc_001');
            expect(result.skillId).toBe('fireball');
        });

        it('应该拒绝未注册目标 NPC', () => {
            const result = mesh.fuseExperience('nonexistent', 'npc_001', 'fireball');
            expect(result.success).toBe(false);
        });

        it('应该拒绝未注册源 NPC', () => {
            const result = mesh.fuseExperience('npc_003', 'nonexistent', 'fireball');
            expect(result.success).toBe(false);
        });

        it('应该拒绝不存在的技能', () => {
            const result = mesh.fuseExperience('npc_003', 'npc_001', 'nonexistent');
            expect(result.success).toBe(false);
        });

        it('应该标记融合后的技能', () => {
            mesh.fuseExperience('npc_003', 'npc_001', 'fireball');

            const shared = mesh.querySharedSkills('npc_003');
            const skill = shared.skills.find(s => s.id === 'fireball');

            expect(skill.fusedAt).toBeTruthy();
        });
    });

    // ==================== 网络统计测试 ====================

    describe('getStats() - 获取网络统计', () => {
        it('应该返回正确统计', () => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.register('npc_003');
            mesh.connect('npc_001', 'npc_002');
            mesh.connect('npc_001', 'npc_003');
            mesh.broadcast('npc_001', { id: 'fireball', pattern: 'fire attack' });

            const stats = mesh.getStats();

            expect(stats.totalNPCs).toBe(3);
            expect(stats.totalPeerConnections).toBe(2);
            expect(stats.totalSharedSkills).toBe(2); // 广播给两个对等方 (npc_002, npc_003)
        });

        it('应该包含技能注册表统计', () => {
            mesh.register('npc_001');
            mesh.broadcast('npc_001', { id: 'fireball', pattern: 'fire attack' });

            const stats = mesh.getStats();
            expect(stats.registryStats).toBeTruthy();
            expect(stats.registryStats.totalSkills).toBe(1);
        });
    });

    describe('reset() - 重置网络', () => {
        it('应该清除所有数据', () => {
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.connect('npc_001', 'npc_002');
            mesh.broadcast('npc_001', { id: 'fireball', pattern: 'fire attack' });

            const result = mesh.reset();

            expect(result.success).toBe(true);
            expect(mesh.getStats().totalNPCs).toBe(0);
        });

        it('应该返回清除前的统计', () => {
            mesh.register('npc_001');
            mesh.broadcast('npc_001', { id: 'fireball', pattern: 'fire attack' });

            const result = mesh.reset();
            expect(result.cleared.totalNPCs).toBe(1);
        });
    });

    // ==================== 集成测试 ====================

    describe('集成场景', () => {
        it('应该支持多跳技能传播', () => {
            // 场景：npc_001 广播给 npc_002，npc_002 再广播给 npc_003
            mesh.register('npc_001');
            mesh.register('npc_002');
            mesh.register('npc_003');
            mesh.connect('npc_001', 'npc_002');
            mesh.connect('npc_002', 'npc_003');

            mesh.broadcast('npc_001', { id: 'ancient_technique', pattern: 'ancient wisdom' });

            // npc_002 学到了
            const npc2Skills = mesh.querySharedSkills('npc_002');
            expect(npc2Skills.skills.find(s => s.id === 'ancient_technique')).toBeTruthy();

            // npc_002 广播给 npc_003
            mesh.broadcast('npc_002', { id: 'ancient_technique', pattern: 'ancient wisdom' });

            const npc3Skills = mesh.querySharedSkills('npc_003');
            expect(npc3Skills.skills.find(s => s.id === 'ancient_technique')).toBeTruthy();
        });

        it('应该支持自定义 SkillRegistry', () => {
            const customRegistry = new SkillRegistry();
            const customMesh = new NPCLearningMesh(customRegistry);

            customMesh.register('npc_001');
            customMesh.broadcast('npc_001', { id: 'custom_skill', pattern: 'custom pattern' });

            expect(customRegistry.has('custom_skill')).toBe(true);
            expect(customMesh.skillRegistry).toBe(customRegistry);
        });
    });
});