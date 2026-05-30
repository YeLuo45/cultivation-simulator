/**
 * DAGExecutor - DAG执行器
 * 负责执行奇遇DAG中的各种操作
 */

class DAGExecutor {
    constructor() {
        this.currentNode = null;
        this.executionContext = null;
        this.listeners = [];
    }

    /**
     * 初始化执行器
     */
    init(gameState) {
        this.executionContext = {
            gameState,
            variables: {},
            stack: [],
            depth: 0
        };
        return this;
    }

    /**
     * 设置当前节点
     */
    setCurrentNode(nodeId, dag) {
        this.currentNode = nodeId;
        this.executionContext.nodeId = nodeId;
        this.executionContext.node = dag?.nodes?.get(nodeId);
        return this;
    }

    /**
     * 执行节点效果
     */
    executeNodeEffects(nodeId, dag) {
        const node = dag?.nodes?.get(nodeId);
        if (!node) return { success: false, reason: 'Node not found' };

        const context = this.executionContext;
        context.currentNodeId = nodeId;
        context.nodeEffects = node.effects || {};

        // 执行效果
        const results = [];
        for (const [effectType, effectValue] of Object.entries(node.effects)) {
            const result = this.applyEffect(effectType, effectValue, context);
            results.push(result);
        }

        return { success: true, results, nodeId };
    }

    /**
     * 应用效果
     */
    applyEffect(effectType, effectValue, context) {
        const state = context.gameState;
        
        switch (effectType) {
            case 'spiritStones':
                state.spiritStones = (state.spiritStones || 0) + effectValue;
                return { effect: 'spiritStones', delta: effectValue, newValue: state.spiritStones };
            
            case 'reputation':
                state.reputation = (state.reputation || 0) + effectValue;
                return { effect: 'reputation', delta: effectValue, newValue: state.reputation };
            
            case 'cultivationBase':
                state.cultivationProgress = (state.cultivationProgress || 0) + effectValue * 10;
                return { effect: 'cultivationProgress', delta: effectValue * 10, newValue: state.cultivationProgress };
            
            case 'techniquePoints':
                state.techniquePoints = (state.techniquePoints || 0) + effectValue;
                return { effect: 'techniquePoints', delta: effectValue, newValue: state.techniquePoints };
            
            case 'materials':
                if (!state.inventory) state.inventory = [];
                // 添加材料到背包
                return { effect: 'materials', added: effectValue };
            
            case 'honor':
                state.honor = (state.honor || 0) + effectValue;
                return { effect: 'honor', delta: effectValue, newValue: state.honor };
            
            case 'sectContribution':
                if (state.sect) {
                    state.sect.contribution = (state.sect.contribution || 0) + effectValue;
                }
                return { effect: 'sectContribution', delta: effectValue };
            
            default:
                return { effect: effectType, value: effectValue, applied: false };
        }
    }

    /**
     * 执行条件检查
     */
    checkCondition(condition, context) {
        if (typeof condition === 'function') {
            return condition(context.gameState);
        }
        if (typeof condition === 'string') {
            return this.evaluateCondition(condition, context);
        }
        return true;
    }

    /**
     * 评估条件表达式
     */
    evaluateCondition(condStr, context) {
        try {
            // 安全解析简单条件
            const state = context.gameState;
            const conditions = {
                'realm >= 1': state.realm >= 1,
                'realm >= 2': state.realm >= 2,
                'realm >= 3': state.realm >= 3,
                'realm >= 4': state.realm >= 4,
                'realm >= 5': state.realm >= 5,
                'spiritStones >= 100': state.spiritStones >= 100,
                'spiritStones >= 1000': state.spiritStones >= 1000,
                'mindset >= 50': state.mindset >= 50,
                'inventory.length > 0': (state.inventory?.length || 0) > 0
            };
            return conditions[condStr] || true;
        } catch (e) {
            return true;
        }
    }

    /**
     * 执行节点选择
     */
    executeChoice(choiceId, dag) {
        const node = dag?.nodes?.get(this.currentNode);
        if (!node || node.type !== 'choice') {
            return { success: false, reason: 'Current node is not a choice node' };
        }

        const choice = node.choices?.[choiceId];
        if (!choice) {
            return { success: false, reason: 'Invalid choice' };
        }

        // 记录选择
        context.selectedChoice = choiceId;
        
        // 应用选择效果
        if (choice.effects) {
            for (const [effectType, effectValue] of Object.entries(choice.effects)) {
                this.applyEffect(effectType, effectValue, this.executionContext);
            }
        }

        // 完成当前节点
        dag?.completeNode(this.currentNode);

        // 返回下一节点
        const nextNodes = dag?.getSuccessors(this.currentNode);
        return {
            success: true,
            choice: choiceId,
            nextNodes: nextNodes?.map(n => n.id) || []
        };
    }

    /**
     * 处理分支
     */
    handleBranch(nodeId, choice, serendipityBranch) {
        serendipityBranch[nodeId] = choice;
        return { success: true, nodeId, choice, effects: { branch_selected: true } };
    }

    /**
     * 获取执行进度
     */
    getProgress(dag) {
        if (!dag) return { total: 0, triggered: 0, completed: 0 };
        const nodes = Array.from(dag.nodes?.values() || []);
        let triggered = 0, completed = 0;
        for (const node of nodes) {
            if (node.status === 'triggered') triggered++;
            if (node.status === 'completed') completed++;
        }
        return {
            totalNodes: dag.nodes?.size || 0,
            triggered,
            completed,
            nodeIds: Array.from(dag.nodes?.keys() || [])
        };
    }

    /**
     * 触发随机奇遇
     */
    triggerRandomEvent(type) {
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
        return {
            eventId: 'SER_' + Date.now(),
            type: event.type,
            name: event.name,
            karmaDelta: event.karma,
            reward: event.reward
        };
    }

    /**
     * 重置执行器
     */
    reset() {
        this.currentNode = null;
        this.executionContext = null;
        this.listeners = [];
        return this;
    }

    /**
     * 添加监听器
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * 移除监听器
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * 触发事件
     */
    emit(event, data) {
        for (const listener of this.listeners) {
            try {
                listener(event, data);
            } catch (e) {
                console.error('Listener error:', e);
            }
        }
    }
}

// 导出单例
const dagExecutor = new DAGExecutor();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DAGExecutor, dagExecutor };
}