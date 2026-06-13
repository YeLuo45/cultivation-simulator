/**
 * 宗门管理系统
 * chatdev角色专业化 + 多agent协调
 * 宗门成员分工协作，资源分配，技术传承
 */

import { MultiRealmPipelineService } from '../../cultivation/services/MultiRealmPipelineService.js';

// 宗门职位等级
export const SECT_ROLES = {
    MASTER: 'sect_master',        // 掌门
    ELDER: 'elder',              // 长老
    INNER_DISCIPLE: 'inner',     // 内门弟子
    OUTER_DISCIPLE: 'outer',     // 外门弟子
    NEWCOMER: 'newcomer'         // 新入门
};

// 宗门职位权限
const ROLE_PERMISSIONS = {
    sect_master: { recruit: true, expel: true, assign: true, withdraw: true, tech: true },
    elder: { recruit: true, expel: false, assign: true, withdraw: true, tech: true },
    inner: { recruit: false, expel: false, assign: false, withdraw: true, tech: true },
    outer: { recruit: false, expel: false, assign: false, withdraw: false, tech: false },
    newcomer: { recruit: false, expel: false, assign: false, withdraw: false, tech: false }
};

// 职位升级要求
const ROLE_UPGRADE = {
    elder: { level: 5, contribution: 1000, tenure_days: 30 },
    inner: { level: 3, contribution: 500, tenure_days: 14 },
    outer: { level: 1, contribution: 100, tenure_days: 7 }
};

// 宗门技术类型
const TECH_TYPES = {
    CULTIVATION: 'cultivation',     // 修炼技法
    COMBAT: 'combat',               // 战斗技法
    ALCHEMY: 'alchemy',            // 炼丹术
    FORMATION: 'formation'          // 阵法
};

export class SectManagementService {
    constructor(gameState) {
        this.gameState = gameState;
        this.sectState = gameState.sect || this.initSectState();
        this.pipeline = new MultiRealmPipelineService(gameState);
    }

    initSectState() {
        const state = {
            name: '未命名宗门',
            level: 1,
            reputation: 0,
            spiritStones: 100,
            resources: {
                pills: 10,
                manuals: 5,
                formationFlags: 3
            },
            members: {},  // memberId -> { name, role, level, contribution, joinedAt, skills: [] }
            techniques: {},  // techId -> { name, type, level, owner, unlockedBy: [] }
            missions: [],    // active missions
            history: [],
            maxMembers: 10
        };
        this.gameState.sect = state;
        return state;
    }

    init(gameState) {
        this.sectState = gameState.sect || this.initSectState();
        this.pipeline.init(gameState);
        return this;
    }

    // ========== 成员管理 ==========

    /**
     * 招募成员
     */
    recruitMember(name, role = SECT_ROLES.NEWCOMER) {
        if (!this.canRecruit()) {
            return { success: false, error: '无权招募或已达成员上限' };
        }
        if (this.sectState.members[name]) {
            return { success: false, error: `成员 ${name} 已存在` };
        }

        const member = {
            name,
            role,
            level: 1,
            contribution: 0,
            joinedAt: Date.now(),
            skills: [],
            assignedRealm: null,
            lastActive: Date.now()
        };

        this.sectState.members[name] = member;
        this.addHistory('recruit', `${name} 加入宗门，职位: ${role}`);

        return {
            success: true,
            member,
            memberCount: Object.keys(this.sectState.members).length
        };
    }

    /**
     * 开除成员
     */
    expelMember(name, reason = '') {
        if (!this.canExpel()) {
            return { success: false, error: '无权开除成员' };
        }
        if (!this.sectState.members[name]) {
            return { success: false, error: `成员 ${name} 不存在` };
        }
        if (name === this.getSectMaster()) {
            return { success: false, error: '不能开除掌门' };
        }

        const member = this.sectState.members[name];
        delete this.sectState.members[name];
        this.addHistory('expel', `${name} 被开除出宗门，原因: ${reason}`);

        return { success: true, expelled: member };
    }

    /**
     * 任命职位
     */
    assignRole(name, newRole) {
        if (!this.canAssign()) {
            return { success: false, error: '无权任命职位' };
        }
        if (!this.sectState.members[name]) {
            return { success: false, error: `成员 ${name} 不存在` };
        }
        if (!Object.values(SECT_ROLES).includes(newRole)) {
            return { success: false, error: `无效职位: ${newRole}` };
        }

        const member = this.sectState.members[name];
        const oldRole = member.role;
        member.role = newRole;
        this.addHistory('assign', `${name} 从 ${oldRole} 升任为 ${newRole}`);

        return { success: true, member };
    }

    /**
     * 检查成员是否可以升级职位
     */
    checkPromotion(name) {
        const member = this.sectState.members[name];
        if (!member) return { eligible: false, error: '成员不存在' };

        const currentRole = member.role;
        let nextRole = null;

        if (currentRole === SECT_ROLES.NEWCOMER) nextRole = SECT_ROLES.OUTER_DISCIPLE;
        else if (currentRole === SECT_ROLES.OUTER_DISCIPLE) nextRole = SECT_ROLES.INNER_DISCIPLE;
        else if (currentRole === SECT_ROLES.INNER_DISCIPLE) nextRole = SECT_ROLES.ELDER;
        else if (currentRole === SECT_ROLES.ELDER) nextRole = SECT_ROLES.MASTER;

        if (!nextRole) return { eligible: false, message: '已达最高职位' };

        const requirements = ROLE_UPGRADE[nextRole === SECT_ROLES.INNER_DISCIPLE ? 'inner' : nextRole === SECT_ROLES.ELDER ? 'elder' : 'outer'];
        if (!requirements) return { eligible: false, message: '无需升级' };

        const tenureDays = (Date.now() - member.joinedAt) / (1000 * 60 * 60 * 24);
        const eligible = member.level >= requirements.level &&
                        member.contribution >= requirements.contribution &&
                        tenureDays >= requirements.tenure_days;

        return {
            eligible,
            nextRole,
            currentLevel: member.level,
            requiredLevel: requirements.level,
            currentContribution: member.contribution,
            requiredContribution: requirements.contribution,
            tenureDays: Math.floor(tenureDays),
            requiredTenure: requirements.tenure_days
        };
    }

    // ========== 资源管理 ==========

    /**
     * 贡献资源
     */
    contributeResource(name, resourceType, amount) {
        const member = this.sectState.members[name];
        if (!member) return { success: false, error: '成员不存在' };

        if (resourceType === 'spiritStones') {
            if (this.gameState.inventory?.spiritStones < amount) {
                return { success: false, error: '灵石不足' };
            }
            this.sectState.spiritStones += amount;
            this.gameState.inventory.spiritStones -= amount;
        } else if (resourceType === 'pills') {
            if ((this.gameState.inventory?.pills || 0) < amount) {
                return { success: false, error: '丹药不足' };
            }
            this.sectState.resources.pills += amount;
            this.gameState.inventory.pills -= amount;
        }

        // 贡献值 = 灵石 * 1 + 丹药 * 10
        const contribution = resourceType === 'pills' ? amount * 10 : amount;
        member.contribution += contribution;

        this.addHistory('contribute', `${name} 贡献 ${amount} ${resourceType}，获得 ${contribution} 贡献点`);

        return {
            success: true,
            contribution,
            totalContribution: member.contribution
        };
    }

    /**
     * 提取资源
     */
    withdrawResource(name, resourceType, amount) {
        if (!this.canWithdraw()) {
            return { success: false, error: '无权提取资源' };
        }

        if (resourceType === 'spiritStones') {
            if (this.sectState.spiritStones < amount) {
                return { success: false, error: '宗门灵石不足' };
            }
            this.sectState.spiritStones -= amount;
            this.gameState.inventory.spiritStones = (this.gameState.inventory.spiritStones || 0) + amount;
        } else if (resourceType === 'pills') {
            if (this.sectState.resources.pills < amount) {
                return { success: false, error: '宗门丹药不足' };
            }
            this.sectState.resources.pills -= amount;
            this.gameState.inventory.pills = (this.gameState.inventory.pills || 0) + amount;
        }

        const member = this.sectState.members[name];
        if (member) {
            member.contribution -= Math.floor(amount * 0.5); // 提取扣贡献
        }

        this.addHistory('withdraw', `${name} 提取 ${amount} ${resourceType}`);

        return { success: true, remaining: resourceType === 'spiritStones' ? this.sectState.spiritStones : this.sectState.resources.pills };
    }

    /**
     * 分配修炼任务
     */
    assignCultivationTask(memberName, realm) {
        const member = this.sectState.members[memberName];
        if (!member) return { success: false, error: '成员不存在' };
        if (!ROLE_PERMISSIONS[member.role]?.assign) {
            return { success: false, error: '该职位无权分配任务' };
        }

        member.assignedRealm = realm;
        return { success: true, member };
    }

    // ========== 技术传承 ==========

    /**
     * 创建宗门秘术
     */
    createTechnique(name, type, level = 1, ownerName) {
        if (!this.canTech()) {
            return { success: false, error: '无权创建技术' };
        }

        const techId = `tech_${Date.now()}`;
        this.sectState.techniques[techId] = {
            name,
            type,
            level,
            owner: ownerName,
            unlockedBy: [ownerName],
            createdAt: Date.now()
        };

        this.addHistory('tech_create', `${ownerName} 创建了宗门秘术《${name}》`);

        return { success: true, technique: this.sectState.techniques[techId] };
    }

    /**
     * 学习技术
     */
    learnTechnique(memberName, techId) {
        const member = this.sectState.members[memberName];
        const tech = this.sectState.techniques[techId];

        if (!member) return { success: false, error: '成员不存在' };
        if (!tech) return { success: false, error: '秘术不存在' };
        if (member.skills.includes(techId)) {
            return { success: false, error: '已学会此术' };
        }
        if (member.level < tech.level) {
            return { success: false, error: `需要境界等级 ${tech.level} 才能学习` };
        }

        member.skills.push(techId);
        if (!tech.unlockedBy.includes(memberName)) {
            tech.unlockedBy.push(memberName);
        }

        this.addHistory('learn_tech', `${memberName} 学会了《${tech.name}》`);

        return { success: true, technique: tech };
    }

    /**
     * 传授技术给其他成员
     */
    teachTechnique(teacherName, studentName, techId) {
        const teacher = this.sectState.members[teacherName];
        const student = this.sectState.members[studentName];
        const tech = this.sectState.techniques[techId];

        if (!teacher) return { success: false, error: '教师不存在' };
        if (!student) return { success: false, error: '学员不存在' };
        if (!tech) return { success: false, error: '秘术不存在' };
        if (!teacher.skills.includes(techId)) {
            return { success: false, error: '教师未学会此术' };
        }
        if (teacher.role === SECT_ROLES.NEWCOMER || teacher.role === SECT_ROLES.OUTER_DISCIPLE) {
            return { success: false, error: '职位太低无法传授' };
        }

        return this.learnTechnique(studentName, techId);
    }

    // ========== 宗门任务 ==========

    /**
     * 发布任务
     */
    publishMission(title, description, reward, difficulty = 'normal') {
        const mission = {
            id: `mission_${Date.now()}`,
            title,
            description,
            reward,
            difficulty,
            status: 'active',
            assignedTo: null,
            completedAt: null
        };
        this.sectState.missions.push(mission);
        this.addHistory('mission', `新任务: ${title}`);
        return { success: true, mission };
    }

    /**
     * 接受任务
     */
    acceptMission(memberName, missionId) {
        const member = this.sectState.members[memberName];
        const mission = this.sectState.missions.find(m => m.id === missionId);

        if (!member) return { success: false, error: '成员不存在' };
        if (!mission) return { success: false, error: '任务不存在' };
        if (mission.status !== 'active') return { success: false, error: '任务不可接受' };
        if (mission.assignedTo) return { success: false, error: '任务已被接受' };

        mission.assignedTo = memberName;
        return { success: true, mission };
    }

    /**
     * 完成任务
     */
    completeMission(memberName, missionId) {
        const mission = this.sectState.missions.find(m => m.id === missionId);

        if (!mission) return { success: false, error: '任务不存在' };
        if (mission.assignedTo !== memberName) return { success: false, error: '任务未分配给您' };
        if (mission.status !== 'active') return { success: false, error: '任务已结束' };

        mission.status = 'completed';
        mission.completedAt = Date.now();

        const member = this.sectState.members[memberName];
        if (member) {
            member.contribution += mission.reward;
        }

        this.addHistory('mission_complete', `${memberName} 完成了任务《${mission.title}》，获得 ${mission.reward} 贡献点`);

        return { success: true, reward: mission.reward };
    }

    // ========== 权限辅助 ==========

    getSectMaster() {
        for (const [name, member] of Object.entries(this.sectState.members)) {
            if (member.role === SECT_ROLES.MASTER) return name;
        }
        return null;
    }

    canRecruit() { return true; }  // 简化: 任何人都可招募
    canExpel() { return true; }
    canAssign() { return true; }
    canWithdraw() { return true; }
    canTech() { return true; }

    addHistory(type, message) {
        this.sectState.history.push({
            type,
            message,
            timestamp: Date.now()
        });
        if (this.sectState.history.length > 100) {
            this.sectState.history.shift();
        }
    }

    // ========== MCP工具 ==========

    mcpRecruitMember({ name, role }) {
        return this.recruitMember(name, role);
    }

    mcpExpelMember({ name, reason }) {
        return this.expelMember(name, reason);
    }

    mcpAssignRole({ name, role }) {
        return this.assignRole(name, role);
    }

    mcpCheckPromotion({ name }) {
        return this.checkPromotion(name);
    }

    mcpContribute({ name, resourceType, amount }) {
        return this.contributeResource(name, resourceType, amount);
    }

    mcpWithdraw({ name, resourceType, amount }) {
        return this.withdrawResource(name, resourceType, amount);
    }

    mcpGetSectStatus() {
        return {
            success: true,
            sect: {
                name: this.sectState.name,
                level: this.sectState.level,
                reputation: this.sectState.reputation,
                spiritStones: this.sectState.spiritStones,
                resources: this.sectState.resources,
                memberCount: Object.keys(this.sectState.members).length,
                maxMembers: this.sectState.maxMembers,
                techniqueCount: Object.keys(this.sectState.techniques).length,
                activeMissions: this.sectState.missions.filter(m => m.status === 'active').length
            },
            members: Object.entries(this.sectState.members).map(([name, m]) => ({
                name,
                role: m.role,
                level: m.level,
                contribution: m.contribution,
                skills: m.skills.length
            }))
        };
    }

    mcpCreateTechnique({ name, type, level, ownerName }) {
        return this.createTechnique(name, type, level, ownerName);
    }

    mcpLearnTechnique({ memberName, techId }) {
        return this.learnTechnique(memberName, techId);
    }

    mcpPublishMission({ title, description, reward, difficulty }) {
        return this.publishMission(title, description, reward, difficulty);
    }

    mcpAcceptMission({ memberName, missionId }) {
        return this.acceptMission(memberName, missionId);
    }

    mcpCompleteMission({ memberName, missionId }) {
        return this.completeMission(memberName, missionId);
    }
}

export { SectManagementService as default };
