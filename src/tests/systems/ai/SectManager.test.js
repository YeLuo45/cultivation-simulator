/**
 * SectManager.test.js - 宗门管理系统核心测试
 * V295 Iteration 1/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SectManager } from '../../../systems/ai/SectManager.js';

// Mock mesh network
const createMockMeshNetwork = () => ({
    connect: vi.fn().mockReturnValue({ success: true }),
    disconnect: vi.fn().mockReturnValue({ success: true }),
    broadcast: vi.fn().mockReturnValue(true),
});

// Mock budget controller
const createMockBudgetController = () => ({
    canSpend: vi.fn((sectId, amount) => amount <= 1000),
    getBalance: vi.fn((sectId) => 10000),
});

describe('SectManager', () => {
    let sectManager;
    const mockMesh = createMockMeshNetwork();
    const mockBudget = createMockBudgetController();

    beforeEach(() => {
        sectManager = new SectManager({
            maxSects: 5,
            maxMembersPerSect: 50,
            evolutionEnabled: true,
            meshNetwork: mockMesh,
        });
    });

    // ========== 宗门创建测试 ==========
    
    describe('createSect', () => {
        it('should create a new sect successfully', () => {
            const result = sectManager.createSect('sect_1', 'Spirit Valley');
            expect(result.success).toBe(true);
            expect(result.sect.sectId).toBe('sect_1');
            expect(result.sect.name).toBe('Spirit Valley');
            expect(result.sect.level).toBe(1);
        });

        it('should set default resources on creation', () => {
            const result = sectManager.createSect('sect_2', 'Dragon Sect');
            expect(result.sect.resources.spiritStones).toBe(100);
            expect(result.sect.resources.herbs).toBe(50);
            expect(result.sect.resources.talismans).toBe(20);
        });

        it('should reject duplicate sectId', () => {
            sectManager.createSect('sect_1', 'First Sect');
            const result = sectManager.createSect('sect_1', 'Second Sect');
            expect(result.success).toBe(false);
            expect(result.error).toBe('SECT_EXISTS');
        });

        it('should reject when max sects reached', () => {
            for (let i = 0; i < 5; i++) {
                sectManager.createSect(`sect_${i}`, `Sect ${i}`);
            }
            const result = sectManager.createSect('sect_extra', 'Extra Sect');
            expect(result.success).toBe(false);
            expect(result.error).toBe('MAX_SECTS_REACHED');
        });

        it('should use custom config when provided', () => {
            const result = sectManager.createSect('sect_custom', 'Custom Sect', {
                level: 3,
                spiritStones: 500,
                reputation: 100,
            });
            expect(result.sect.level).toBe(3);
            expect(result.sect.resources.spiritStones).toBe(500);
            expect(result.sect.reputation).toBe(100);
        });

        it('should register hook on creation', () => {
            const hookCall = { count: 0 };
            sectManager.registerHook('sectCreated', () => hookCall.count++);
            sectManager.createSect('sect_1', 'Test Sect');
            expect(hookCall.count).toBe(1);
        });
    });

    // ========== 宗门查询测试 ==========
    
    describe('getSect', () => {
        it('should return sect when exists', () => {
            sectManager.createSect('sect_1', 'Spirit Sect');
            const sect = sectManager.getSect('sect_1');
            expect(sect).not.toBeNull();
            expect(sect.name).toBe('Spirit Sect');
        });

        it('should return null when not exists', () => {
            const sect = sectManager.getSect('non_existent');
            expect(sect).toBeNull();
        });
    });

    // ========== 宗门删除测试 ==========
    
    describe('deleteSect', () => {
        it('should delete existing sect', () => {
            sectManager.createSect('sect_1', 'ToDelete');
            const result = sectManager.deleteSect('sect_1');
            expect(result.success).toBe(true);
            expect(sectManager.getSect('sect_1')).toBeNull();
        });

        it('should clear activeSectId if deleted', () => {
            sectManager.createSect('sect_1', 'Active Sect');
            sectManager.activeSectId = 'sect_1';
            sectManager.deleteSect('sect_1');
            expect(sectManager.activeSectId).toBeNull();
        });

        it('should return error for non-existent sect', () => {
            const result = sectManager.deleteSect('ghost');
            expect(result.success).toBe(false);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });
    });

    // ========== 宗门成员管理测试 ==========
    
    describe('addMember', () => {
        it('should add member to existing sect', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.addMember('sect_1', 'member_1', { name: 'Zhang San' });
            expect(result.success).toBe(true);
            expect(result.member.name).toBe('Zhang San');
            expect(result.member.role).toBe('disciple');
        });

        it('should use default name when not provided', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.addMember('sect_1', 'member_1');
            expect(result.member.name).toBe('member_1');
        });

        it('should reject duplicate member', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'member_1');
            const result = sectManager.addMember('sect_1', 'member_1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('MEMBER_EXISTS');
        });

        it('should reject when max members reached', () => {
            sectManager = new SectManager({ maxMembersPerSect: 2 });
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'm1');
            sectManager.addMember('sect_1', 'm2');
            const result = sectManager.addMember('sect_1', 'm3');
            expect(result.success).toBe(false);
            expect(result.error).toBe('MAX_MEMBERS_REACHED');
        });

        it('should reject for non-existent sect', () => {
            const result = sectManager.addMember('ghost', 'member_1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should set custom attributes', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.addMember('sect_1', 'member_1', {
                attributes: { spiritRoot: 8.5, comprehension: 7.2 },
            });
            expect(result.member.attributes.spiritRoot).toBe(8.5);
            expect(result.member.attributes.comprehension).toBe(7.2);
        });

        it('should trigger memberAdded hook', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            let called = false;
            sectManager.registerHook('memberAdded', () => { called = true; });
            sectManager.addMember('sect_1', 'member_1');
            expect(called).toBe(true);
        });
    });

    describe('removeMember', () => {
        it('should remove existing member', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'member_1');
            const result = sectManager.removeMember('sect_1', 'member_1');
            expect(result.success).toBe(true);
        });

        it('should return error for non-existent member', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.removeMember('sect_1', 'ghost');
            expect(result.success).toBe(false);
            expect(result.error).toBe('MEMBER_NOT_FOUND');
        });

        it('should return error for non-existent sect', () => {
            const result = sectManager.removeMember('ghost', 'member');
            expect(result.success).toBe(false);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });
    });

    describe('getMember', () => {
        it('should return member when exists', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'member_1', { name: 'Li Si' });
            const member = sectManager.getMember('sect_1', 'member_1');
            expect(member).not.toBeNull();
            expect(member.name).toBe('Li Si');
        });

        it('should return null for non-existent sect', () => {
            const member = sectManager.getMember('ghost', 'member');
            expect(member).toBeNull();
        });

        it('should return null for non-existent member', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const member = sectManager.getMember('sect_1', 'ghost');
            expect(member).toBeNull();
        });
    });

    describe('updateMemberRole', () => {
        it('should update role successfully', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'member_1');
            const result = sectManager.updateMemberRole('sect_1', 'member_1', 'elder');
            expect(result.success).toBe(true);
            expect(result.member.role).toBe('elder');
        });

        it('should give contribution points on promotion', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'member_1');
            sectManager.updateMemberRole('sect_1', 'member_1', 'elder');
            expect(sectManager.getMember('sect_1', 'member_1').contributions).toBeGreaterThan(0);
        });

        it('should trigger hook on role change', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'member_1');
            let hookData = null;
            sectManager.registerHook('memberRoleChanged', (data) => { hookData = data; });
            sectManager.updateMemberRole('sect_1', 'member_1', 'elder');
            expect(hookData.oldRole).toBe('disciple');
            expect(hookData.newRole).toBe('elder');
        });
    });

    // ========== 资源管理测试 ==========
    
    describe('updateResources', () => {
        it('should add resources successfully', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.updateResources('sect_1', { spiritStones: 50 });
            expect(result.success).toBe(true);
            expect(result.resources.spiritStones).toBe(150);
        });

        it('should subtract resources', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.updateResources('sect_1', { spiritStones: -30 });
            expect(result.resources.spiritStones).toBe(70);
        });

        it('should not go below zero', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.updateResources('sect_1', { spiritStones: -200 });
            expect(sectManager.getResources('sect_1').spiritStones).toBe(0);
        });

        it('should ignore unknown resources', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.updateResources('sect_1', { gold: 100 });
            expect(result.success).toBe(true);
        });

        it('should return error for non-existent sect', () => {
            const result = sectManager.updateResources('ghost', { spiritStones: 10 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });
    });

    describe('getResources', () => {
        it('should return resources copy', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const resources = sectManager.getResources('sect_1');
            expect(resources.spiritStones).toBe(100);
            expect(resources.herbs).toBe(50);
        });

        it('should return null for non-existent sect', () => {
            const resources = sectManager.getResources('ghost');
            expect(resources).toBeNull();
        });
    });

    // ========== 进化系统测试 ==========
    
    describe('evolveSect', () => {
        it('should evolve sect when points exceed threshold', () => {
            sectManager = new SectManager({ evolutionThreshold: 0.2 });
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'm1');
            sectManager.addMember('sect_1', 'm2');
            sectManager.addMember('sect_1', 'm3');
            sectManager.learnSkill('sect_1', 'fireball');
            sectManager.learnSkill('sect_1', 'iceShield');
            
            const result = sectManager.evolveSect('sect_1');
            expect(result.success).toBe(true);
            expect(result.evolved).toBe(true);
            expect(result.level).toBe(2);
        });

        it('should not evolve when points below threshold', () => {
            sectManager.createSect('sect_1', 'New Sect');
            const result = sectManager.evolveSect('sect_1');
            expect(result.success).toBe(true);
            expect(result.evolved).toBe(false);
        });

        it('should return error for non-existent sect', () => {
            const result = sectManager.evolveSect('ghost');
            expect(result.success).toBe(false);
            expect(result.error).toBe('SECT_NOT_FOUND');
        });

        it('should return error when evolution disabled', () => {
            sectManager = new SectManager({ evolutionEnabled: false });
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.evolveSect('sect_1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('EVOLUTION_DISABLED');
        });

        it('should cap evolution points at 100', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            for (let i = 0; i < 10; i++) {
                sectManager.addMember(`sect_1`, `m${i}`);
            }
            const result = sectManager.evolveSect('sect_1');
            expect(result.evolutionPoints).toBeLessThanOrEqual(100);
        });
    });

    // ========== Hook 系统测试 ==========
    
    describe('Hook System', () => {
        it('should register and call hooks', () => {
            let callCount = 0;
            const unregister = sectManager.registerHook('resourcesUpdated', () => callCount++);
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.updateResources('sect_1', { spiritStones: 10 });
            expect(callCount).toBe(1);
            unregister();
            sectManager.updateResources('sect_1', { spiritStones: 10 });
            expect(callCount).toBe(1);
        });

        it('should handle hook errors silently', () => {
            sectManager.registerHook('sectCreated', () => { throw new Error('test error'); });
            expect(() => sectManager.createSect('sect_1', 'Test Sect')).not.toThrow();
        });

        it('should support multiple hooks for same event', () => {
            let count1 = 0, count2 = 0;
            sectManager.registerHook('memberAdded', () => count1++);
            sectManager.registerHook('memberAdded', () => count2++);
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'm1');
            expect(count1).toBe(1);
            expect(count2).toBe(1);
        });
    });

    // ========== Mesh 网络测试 ==========
    
    describe('Mesh Network', () => {
        it('should connect two sects via mesh', () => {
            sectManager.createSect('sect_1', 'First');
            sectManager.createSect('sect_2', 'Second');
            const result = sectManager.connectMesh('sect_1', 'sect_2');
            expect(result.success).toBe(true);
            expect(result.connections).toContain('sect_2');
        });

        it('should return error when mesh not available', () => {
            sectManager = new SectManager({ meshNetwork: null });
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.connectMesh('sect_1', 'sect_2');
            expect(result.success).toBe(false);
            expect(result.error).toBe('MESH_NOT_AVAILABLE');
        });

        it('should get mesh connections', () => {
            sectManager.createSect('sect_1', 'First');
            sectManager.createSect('sect_2', 'Second');
            sectManager.connectMesh('sect_1', 'sect_2');
            const connections = sectManager.getMeshConnections('sect_1');
            expect(connections).toContain('sect_2');
        });

        it('should return null for non-existent sect mesh', () => {
            const connections = sectManager.getMeshConnections('ghost');
            expect(connections).toBeNull();
        });
    });

    // ========== 技能系统测试 ==========
    
    describe('learnSkill', () => {
        it('should learn new skill', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.learnSkill('sect_1', 'fireball');
            expect(result.success).toBe(true);
            expect(result.skills).toContain('fireball');
        });

        it('should reject duplicate skill', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.learnSkill('sect_1', 'fireball');
            const result = sectManager.learnSkill('sect_1', 'fireball');
            expect(result.success).toBe(false);
            expect(result.error).toBe('SKILL_EXISTS');
        });

        it('should trigger skillLearned hook', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            let called = false;
            sectManager.registerHook('skillLearned', () => { called = true; });
            sectManager.learnSkill('sect_1', 'fireball');
            expect(called).toBe(true);
        });
    });

    // ========== 预算控制测试 ==========
    
    describe('Budget Control', () => {
        it('should set budget controller', () => {
            sectManager.setBudgetController(mockBudget);
            expect(sectManager.budgetController).toBe(mockBudget);
        });

        it('should check budget via controller', () => {
            sectManager.setBudgetController(mockBudget);
            sectManager.createSect('sect_1', 'Test Sect');
            const canSpend = sectManager.checkBudget('sect_1', 500);
            expect(canSpend).toBe(true);
        });

        it('should block spending over budget', () => {
            sectManager.setBudgetController(mockBudget);
            sectManager.createSect('sect_1', 'Test Sect');
            mockBudget.canSpend.mockReturnValueOnce(false);
            const canSpend = sectManager.checkBudget('sect_1', 2000);
            expect(canSpend).toBe(false);
        });
    });

    // ========== 状态查询测试 ==========
    
    describe('getSectOverview', () => {
        it('should return correct overview', () => {
            sectManager.createSect('sect_1', 'Sect 1');
            sectManager.createSect('sect_2', 'Sect 2');
            sectManager.addMember('sect_1', 'm1');
            sectManager.addMember('sect_1', 'm2');
            sectManager.addMember('sect_2', 'm3');
            
            const overview = sectManager.getSectOverview();
            expect(overview.totalSects).toBe(2);
            expect(overview.totalMembers).toBe(3);
            expect(overview.evolutionEnabled).toBe(true);
        });
    });

    describe('getSectDetails', () => {
        it('should return full sect details', () => {
            sectManager.createSect('sect_1', 'Spirit Valley');
            sectManager.addMember('sect_1', 'm1', { name: 'Zhang' });
            sectManager.learnSkill('sect_1', 'fireball');
            
            const details = sectManager.getSectDetails('sect_1');
            expect(details.sectId).toBe('sect_1');
            expect(details.name).toBe('Spirit Valley');
            expect(details.memberCount).toBe(1);
            expect(details.skills).toContain('fireball');
            expect(details.level).toBe(1);
        });

        it('should return null for non-existent sect', () => {
            const details = sectManager.getSectDetails('ghost');
            expect(details).toBeNull();
        });
    });

    // ========== 数据持久化测试 ==========
    
    describe('Data Persistence', () => {
        it('should serialize to JSON correctly', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'm1');
            sectManager.learnSkill('sect_1', 'fireball');
            
            const json = sectManager.toJSON();
            expect(json.sects.sect_1).toBeDefined();
            expect(json.sects.sect_1.name).toBe('Test Sect');
            expect(Array.isArray(json.sects.sect_1.members)).toBe(true);
        });

        it('should deserialize from JSON correctly', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            sectManager.addMember('sect_1', 'm1');
            
            const json = sectManager.toJSON();
            
            const newManager = new SectManager();
            newManager.fromJSON(json);
            
            const sect = newManager.getSect('sect_1');
            expect(sect).not.toBeNull();
            expect(sect.name).toBe('Test Sect');
            expect(sect.members.has('m1')).toBe(true);
        });

        it('should preserve config on deserialize', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const json = sectManager.toJSON();
            
            const newManager = new SectManager({ maxSects: 1 });
            newManager.fromJSON(json);
            
            expect(newManager.config.maxSects).toBe(5);
        });
    });

    // ========== 边界情况测试 ==========
    
    describe('Edge Cases', () => {
        it('should handle empty sect name', () => {
            const result = sectManager.createSect('sect_empty', '');
            expect(result.success).toBe(true);
            expect(result.sect.name).toBe('');
        });

        it('should handle member with all roles', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const roles = ['disciple', 'elder', 'master'];
            for (const role of roles) {
                const result = sectManager.addMember(`sect_1`, `m_${role}`, { role });
                expect(result.success).toBe(true);
            }
        });

        it('should handle resource update with mixed positive/negative', () => {
            sectManager.createSect('sect_1', 'Test Sect');
            const result = sectManager.updateResources('sect_1', {
                spiritStones: 50,
                herbs: -10,
                talismans: 5,
            });
            expect(result.success).toBe(true);
            expect(result.resources.spiritStones).toBe(150);
            expect(result.resources.herbs).toBe(40);
            expect(result.resources.talismans).toBe(25);
        });

        it('should handle evolution with no members', () => {
            sectManager.createSect('sect_1', 'Lonely Sect');
            const result = sectManager.evolveSect('sect_1');
            expect(result.success).toBe(true);
            expect(result.evolved).toBe(false);
        });

        it('should return empty mesh for sect with no connections', () => {
            sectManager.createSect('sect_1', 'Isolated Sect');
            const connections = sectManager.getMeshConnections('sect_1');
            expect(Array.isArray(connections)).toBe(true);
            expect(connections.length).toBe(0);
        });

        it('should handle hook unregister edge case', () => {
            const unregister = sectManager.registerHook('sectCreated', () => {});
            unregister();
            expect(() => sectManager.createSect('sect_1', 'Test Sect')).not.toThrow();
        });
    });
});