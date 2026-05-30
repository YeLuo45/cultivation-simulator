/**
 * SerendipityService - 奇遇服务
 * 管理奇遇事件、触发、DAG执行等
 */

class SerendipityService {
    constructor() {
        this.dag = new SerendipityDAG();
        this.activeSuperNodes = [];
        this.pendingEvents = [];
        this.karma = { good: 0, bad: 0, neutral: 0, events: [] };
        this.fate = { traits: [], connections: [], destiny: 50 };
        this.serendipityBranch = {};
    }

    /**
     * 初始化默认奇遇
     */
    initDefaultSerendipities() {
        // 师徒链: 发现 -> 试炼 -> 评核 -> 赏赐
        this.dag.addNode('ser_discovery', {
            type: 'event', name: '奇遇发现', icon: '🔮', weight: 1.0,
            prerequisites: [], probability: 0.3,
            effects: { reputation: 5 }, realmRequirement: 1
        });
        this.dag.addNode('ser_trial', {
            type: 'choice', name: '试炼抉择', icon: '⚔️', weight: 0.8,
            prerequisites: ['ser_discovery'], probability: 0.6,
            effects: { spiritStones: 50 }, realmRequirement: 2
        });
        this.dag.addNode('ser_evaluation', {
            type: 'gate', name: '师尊评核', icon: '📜', weight: 0.5,
            prerequisites: ['ser_trial'], probability: 0.5,
            effects: { cultivationBase: 10 }, realmRequirement: 3
        });
        this.dag.addNode('ser_master_reward', {
            type: 'reward', name: '师尊赏赐', icon: '🎁', weight: 0.3,
            prerequisites: ['ser_evaluation'], probability: 0.4,
            effects: { spiritStones: 200, techniquePoints: 20 }, realmRequirement: 4
        });

        // 妖兽链: 遭遇 -> 战斗 -> 掉落
        this.dag.addNode('ser_monster_encounter', {
            type: 'event', name: '妖兽遭遇', icon: '👹', weight: 0.9,
            prerequisites: [], probability: 0.4,
            effects: {}, realmRequirement: 1
        });
        this.dag.addNode('ser_monster_battle', {
            type: 'event', name: '妖兽战斗', icon: '⚔️', weight: 0.7,
            prerequisites: ['ser_monster_encounter'], probability: 0.7,
            effects: { honor: 10 }, realmRequirement: 2
        });
        this.dag.addNode('ser_monster_drop', {
            type: 'reward', name: '妖兽掉落', icon: '💎', weight: 0.4,
            prerequisites: ['ser_monster_battle'], probability: 0.5,
            effects: { spiritStones: 100, materials: 1 }, realmRequirement: 3
        });

        // 边
        this.dag.addEdge('ser_discovery', 'ser_trial');
        this.dag.addEdge('ser_trial', 'ser_evaluation');
        this.dag.addEdge('ser_evaluation', 'ser_master_reward');
        this.dag.addEdge('ser_monster_encounter', 'ser_monster_battle');
        this.dag.addEdge('ser_monster_battle', 'ser_monster_drop');

        // 排序
        this.dag.topologicalSort();
    }

    /**
     * 扩展奇遇链
     */
    extendSerendipityChains() {
        // 宝藏发现链: 发现 -> 挖掘 -> 鉴定 -> 宝藏
        this.dag.addNode('ser_treasure_discover', {
            type: 'event', name: '秘境探宝', icon: '🗺️', weight: 0.6,
            prerequisites: [], probability: 0.3, effects: {}, realmRequirement: 3
        });
        this.dag.addNode('ser_treasure_excavate', {
            type: 'choice', name: '挖掘抉择', icon: '⛏️', weight: 0.7,
            prerequisites: ['ser_treasure_discover'], probability: 0.6, effects: {}, realmRequirement: 4
        });
        this.dag.addNode('ser_treasure_appraise', {
            type: 'gate', name: '鉴定师核', icon: '🔍', weight: 0.4,
            prerequisites: ['ser_treasure_excavate'], probability: 0.5, effects: {}, realmRequirement: 5
        });
        this.dag.addNode('ser_treasure_treasure', {
            type: 'reward', name: '稀世珍宝', icon: '💰', weight: 0.2,
            prerequisites: ['ser_treasure_appraise'], probability: 0.3, effects: { spiritStones: 500, materials: 3 }, realmRequirement: 6
        });
        this.dag.addEdge('ser_treasure_discover', 'ser_treasure_excavate');
        this.dag.addEdge('ser_treasure_excavate', 'ser_treasure_appraise');
        this.dag.addEdge('ser_treasure_appraise', 'ser_treasure_treasure');

        // 宗门政治链: 谣言 -> 调查 -> 对质 -> 忠诚
        this.dag.addNode('ser_sect_rumor', {
            type: 'event', name: '宗门流言', icon: '👂', weight: 0.5,
            prerequisites: [], probability: 0.2, effects: {}, realmRequirement: 5
        });
        this.dag.addNode('ser_sect_investigate', {
            type: 'choice', name: '调查真相', icon: '🕵️', weight: 0.6,
            prerequisites: ['ser_sect_rumor'], probability: 0.5, effects: {}, realmRequirement: 6
        });
        this.dag.addNode('ser_sect_confront', {
            type: 'gate', name: '当面对质', icon: '⚔️', weight: 0.4,
            prerequisites: ['ser_sect_investigate'], probability: 0.4, effects: {}, realmRequirement: 7
        });
        this.dag.addNode('ser_sect_loyalty', {
            type: 'reward', name: '宗门忠诚', icon: '🏛️', weight: 0.3,
            prerequisites: ['ser_sect_confront'], probability: 0.3, effects: { sectContribution: 100, reputation: 20 }, realmRequirement: 8
        });
        this.dag.addEdge('ser_sect_rumor', 'ser_sect_investigate');
        this.dag.addEdge('ser_sect_investigate', 'ser_sect_confront');
        this.dag.addEdge('ser_sect_confront', 'ser_sect_loyalty');

        // 仙人奇遇链: 显灵 -> 拜见 -> 点化 -> 传承
        this.dag.addNode('ser_immortal_vision', {
            type: 'event', name: '仙人显灵', icon: '🌟', weight: 0.3,
            prerequisites: [], probability: 0.15, effects: {}, realmRequirement: 6
        });
        this.dag.addNode('ser_immortal_approach', {
            type: 'choice', name: '拜见仙人', icon: '🙏', weight: 0.5,
            prerequisites: ['ser_immortal_vision'], probability: 0.4, effects: {}, realmRequirement: 7
        });
        this.dag.addNode('ser_immortal_enlighten', {
            type: 'gate', name: '仙人点化', icon: '✨', weight: 0.3,
            prerequisites: ['ser_immortal_approach'], probability: 0.3, effects: {}, realmRequirement: 8
        });
        this.dag.addNode('ser_immortal_technique', {
            type: 'reward', name: '传承仙法', icon: '📜', weight: 0.15,
            prerequisites: ['ser_immortal_enlighten'], probability: 0.2, effects: { techniquePoints: 50, cultivationBase: 30 }, realmRequirement: 9
        });
        this.dag.addEdge('ser_immortal_vision', 'ser_immortal_approach');
        this.dag.addEdge('ser_immortal_approach', 'ser_immortal_enlighten');
        this.dag.addEdge('ser_immortal_enlighten', 'ser_immortal_technique');

        // 排序
        this.dag.topologicalSort();
    }

    /**
     * 随机触发奇遇
     */
    triggerRandomSerendipity(playerState) {
        const ready = this.dag.getReadyNodes();
        if (ready.length === 0) return null;

        // 基于权重选择
        let totalWeight = 0;
        const candidates = [];
        for (const nodeId of ready) {
            const node = this.dag.nodes.get(nodeId);
            if (node.canTrigger(playerState)) {
                totalWeight += node.weight;
                candidates.push({ nodeId, weight: node.weight });
            }
        }
        if (candidates.length === 0) return null;

        // 加权随机选择
        let random = Math.random() * totalWeight;
        for (const { nodeId, weight } of candidates) {
            random -= weight;
            if (random <= 0) {
                return this.dag.triggerNode(nodeId);
            }
        }
        return this.dag.triggerNode(candidates[0].nodeId);
    }

    /**
     * 获取DAG状态
     */
    getDAGStatus() {
        const nodes = Array.from(this.dag.nodes.values());
        return {
            total: nodes.length,
            locked: nodes.filter(n => n.status === 'locked').length,
            ready: nodes.filter(n => n.status === 'ready').length,
            triggered: nodes.filter(n => n.status === 'triggered').length,
            completed: nodes.filter(n => n.status === 'completed').length
        };
    }

    /**
     * 使用SuperNode递归调度执行奇遇
     */
    executeSerendipityWithSuperNodes(playerState) {
        const initialNode = this.findInitialNode();
        if (!initialNode) return null;

        // Tarjan SCC检测
        const sccs = this.dag.tarjanSCC();
        const cycles = sccs.filter(scc => scc.length > 1);

        if (cycles.length === 0) {
            return this.triggerRandomSerendipity(playerState);
        }

        // 从SCC构建SuperNode
        const superNodeMap = this.buildSuperNodes(cycles);
        for (const [superId, superNode] of superNodeMap) {
            this.dag.superNodes.set(superId, superNode);
        }

        return this.executeWithSuperNodes(superNodeMap, playerState, 100);
    }

    /**
     * 查找初始节点
     */
    findInitialNode() {
        const candidates = [];
        for (const [nodeId, node] of this.dag.nodes) {
            if (node.status === 'ready' && node.prerequisites.length === 0) {
                candidates.push(nodeId);
            }
        }
        return candidates.length === 1 ? candidates[0] : (candidates[0] || null);
    }

    /**
     * 构建SuperNode
     */
    buildSuperNodes(cycles) {
        const superNodeMap = new Map();
        cycles.forEach((scc, idx) => {
            const superId = `super_${idx}`;
            const nodes = scc.map(id => this.dag.nodes.get(id)).filter(Boolean);
            superNodeMap.set(superId, new SuperNode(superId, nodes));
        });
        return superNodeMap;
    }

    /**
     * 使用SuperNode执行
     */
    executeWithSuperNodes(superNodeMap, playerState, maxIterations) {
        let iterations = 0;
        let current = this.findInitialNode();

        while (iterations < maxIterations) {
            iterations++;

            if (this.checkExitConditions(current, superNodeMap)) {
                break;
            }

            const node = this.dag.nodes.get(current);
            if (node && node.status === 'ready' && node.canTrigger(playerState)) {
                this.dag.triggerNode(current);
            }

            current = this.getNextNodeAfter(current);
        }

        return this.dag.nodes.get(current) || null;
    }

    /**
     * 检查退出条件
     */
    checkExitConditions(currentNodeId, superNodeMap) {
        const nodeEdges = this.dag.edges.filter(e => e.from === currentNodeId);
        return nodeEdges.some(e => !this.dag.superNodes.has(e.to));
    }

    /**
     * 获取下一节点
     */
    getNextNodeAfter(nodeId) {
        const outgoing = this.dag.edges.filter(e => e.from === nodeId);
        if (outgoing.length === 0) return null;
        for (const e of outgoing) {
            if (this.dag.nodes.has(e.to)) return e.to;
        }
        return null;
    }

    /**
     * 记录因果
     */
    recordKarma(action, type, amount) {
        if (action === 'record' && type) {
            this.karma[type] = (this.karma[type] || 0) + (amount || 1);
            this.karma.events.push({ type, amount: amount || 1, time: Date.now() });
            return { success: true, karma: this.karma };
        }
        return { error: 'Invalid action' };
    }

    /**
     * 查询因果
     */
    queryKarma() {
        return {
            total: this.karma.good - this.karma.bad,
            good: this.karma.good,
            bad: this.karma.bad,
            neutral: this.karma.neutral,
            events: this.karma.events.slice(-20)
        };
    }

    /**
     * 查询命运
     */
    queryFate(query) {
        if (query === 'status') {
            return {
                destiny: this.fate.destiny,
                level: this.fate.destiny > 80 ? '大吉' : this.fate.destiny > 60 ? '吉' : this.fate.destiny > 40 ? '平' : this.fate.destiny > 20 ? '凶' : '大凶'
            };
        }
        if (query === 'traits') return { traits: this.fate.traits || [] };
        if (query === 'connections') return { connections: this.fate.connections || [] };
        return { error: 'Invalid query' };
    }

    /**
     * 选择分支
     */
    selectBranch(nodeId, choice) {
        this.serendipityBranch[nodeId] = choice;
        return { success: true, nodeId, choice, effects: { branch_selected: true } };
    }

    /**
     * 获取进度
     */
    getProgress() {
        return this.getDAGStatus();
    }

    /**
     * MCP: 触发奇遇
     */
    mcpTrigger(type) {
        const TYPES = ['treasure', 'encounter', 'blessing', 'danger', 'all'];
        const t = type || 'all';
        const SERENDIPITY_POOL = [
            { type: 'treasure', name: '发现古修士洞府', karma: 10, reward: { spiritStones: 500 } },
            { type: 'encounter', name: '遇见散仙论道', karma: 15, reward: { cultivationXP: 200 } },
            { type: 'blessing', name: '天降祥瑞', karma: 20, reward: { maxSpirit: 50 } },
            { type: 'danger', name: '遭遇妖兽袭击', karma: -10, reward: { combatXP: 100 } }
        ];
        const pool = t === 'all' ? SERENDIPITY_POOL : SERENDIPITY_POOL.filter(e => e.type === t);
        if (pool.length === 0) return { error: 'No serendipity events of this type' };
        const event = pool[Math.floor(Math.random() * pool.length)];
        const eventId = 'SER_' + Date.now();
        this.karma.events.push({ eventId, type: event.type, karma: event.karma, reason: event.name, time: Date.now() });
        return { eventId, type: event.type, name: event.name, karmaDelta: event.karma, reward: event.reward };
    }

    /**
     * MCP: 更新因果
     */
    mcpKarmaUpdate(eventId, karmaDelta, reason) {
        if (karmaDelta === undefined) return { error: 'karmaDelta required' };
        this.karma.events.push({ eventId, karma: karmaDelta, reason: reason || 'serendipity', time: Date.now() });
        return { success: true, eventId, newKarma: this.karma, karmaDelta };
    }
}

// SerendipityDAG 类 (用于兼容)
class SerendipityDAG extends DAG {
    constructor() {
        super();
    }
}

// 导出单例和服务
const serendipityService = new SerendipityService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SerendipityService, serendipityService, SerendipityDAG };
}