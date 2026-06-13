/**
 * DAG Entity - 有向无环图实体
 * 用于奇遇事件的图谱管理和执行
 */

class DAG {
    constructor() {
        this.nodes = new Map();
        this.superNodes = new Map();
        this.edges = [];
        this.executionOrder = [];
        this.sccs = [];
    }

    /**
     * 添加节点
     */
    addNode(nodeId, config) {
        const node = new SerendipityNode(nodeId, config);
        this.nodes.set(nodeId, node);
        return node;
    }

    /**
     * 添加边
     */
    addEdge(fromId, toId) {
        this.edges.push({ from: fromId, to: toId });
        const toNode = this.nodes.get(toId);
        const fromNode = this.nodes.get(fromId);
        if (toNode && fromNode && !toNode.prerequisites.includes(fromId)) {
            toNode.prerequisites.push(fromId);
        }
    }

    /**
     * 拓扑排序 (Kahn算法)
     */
    topologicalSort() {
        const inDegree = new Map();
        const adjacency = new Map();

        // 初始化
        for (const [nodeId] of this.nodes) {
            inDegree.set(nodeId, 0);
            adjacency.set(nodeId, []);
        }
        for (const [nodeId] of this.superNodes) {
            inDegree.set(nodeId, 0);
            adjacency.set(nodeId, []);
        }

        // 构建图
        for (const { from, to } of this.edges) {
            adjacency.get(from)?.push(to);
            inDegree.set(to, (inDegree.get(to) || 0) + 1);
        }

        // Kahn算法
        const queue = [];
        for (const [nodeId, degree] of inDegree) {
            if (degree === 0) queue.push(nodeId);
        }

        const sorted = [];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            sorted.push(nodeId);
            for (const neighbor of adjacency.get(nodeId) || []) {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }

        this.executionOrder = sorted;
        return sorted;
    }

    /**
     * Tarjan SCC算法
     */
    tarjanSCC() {
        let index = 0;
        const stack = [];
        const onStack = new Map();
        const indices = new Map();
        const lowlinks = new Map();
        const sccs = [];

        const strongConnect = (nodeId) => {
            indices.set(nodeId, index);
            lowlinks.set(nodeId, index);
            index++;
            stack.push(nodeId);
            onStack.set(nodeId, true);

            for (const { to } of this.edges) {
                if (!indices.has(to)) {
                    strongConnect(to);
                    lowlinks.set(nodeId, Math.min(lowlinks.get(nodeId), lowlinks.get(to)));
                } else if (onStack.get(to)) {
                    lowlinks.set(nodeId, Math.min(lowlinks.get(nodeId), indices.get(to)));
                }
            }

            if (lowlinks.get(nodeId) === indices.get(nodeId)) {
                const scc = [];
                let w;
                do {
                    w = stack.pop();
                    onStack.set(w, false);
                    scc.push(w);
                } while (w !== nodeId);
                sccs.push(scc);
            }
        };

        for (const [nodeId] of this.nodes) {
            if (!indices.has(nodeId)) {
                strongConnect(nodeId);
            }
        }

        this.sccs = sccs;
        return sccs;
    }

    /**
     * 获取就绪节点
     */
    getReadyNodes() {
        const ready = [];
        for (const [nodeId, node] of this.nodes) {
            if (node.status !== 'locked') continue;
            const prereqs = node.prerequisites || [];
            const allMet = prereqs.every(p => {
                const n = this.nodes.get(p);
                return n && n.status === 'completed';
            });
            if (allMet) {
                node.status = 'ready';
                ready.push(nodeId);
            }
        }
        return ready;
    }

    /**
     * 触发节点
     */
    triggerNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node || node.status !== 'ready') return null;
        node.status = 'triggered';
        node.triggerCount++;
        return node;
    }

    /**
     * 完成节点
     */
    completeNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node) node.status = 'completed';
    }

    /**
     * 获取节点
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    /**
     * 获取所有节点
     */
    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    /**
     * 获取所有边
     */
    getAllEdges() {
        return this.edges;
    }

    /**
     * 获取节点出度
     */
    getOutDegree(nodeId) {
        return this.edges.filter(e => e.from === nodeId).length;
    }

    /**
     * 获取节点入度
     */
    getInDegree(nodeId) {
        return this.edges.filter(e => e.to === nodeId).length;
    }

    /**
     * 获取节点的后继节点
     */
    getSuccessors(nodeId) {
        return this.edges
            .filter(e => e.from === nodeId)
            .map(e => this.nodes.get(e.to))
            .filter(Boolean);
    }

    /**
     * 获取节点的前置节点
     */
    getPredecessors(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return [];
        return node.prerequisites
            .map(p => this.nodes.get(p))
            .filter(Boolean);
    }

    /**
     * 获取DAG状态统计
     */
    getStatus() {
        const nodes = Array.from(this.nodes.values());
        return {
            total: nodes.length,
            locked: nodes.filter(n => n.status === 'locked').length,
            ready: nodes.filter(n => n.status === 'ready').length,
            triggered: nodes.filter(n => n.status === 'triggered').length,
            completed: nodes.filter(n => n.status === 'completed').length
        };
    }

    /**
     * 重置DAG
     */
    reset() {
        for (const [nodeId, node] of this.nodes) {
            node.status = 'locked';
            node.triggerCount = 0;
        }
        this.superNodes.clear();
        this.executionOrder = [];
        this.sccs = [];
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            nodes: Array.from(this.nodes.entries()).map(([id, node]) => [id, node.serialize()]),
            edges: this.edges,
            executionOrder: this.executionOrder
        };
    }

    /**
     * 从序列化数据恢复
     */
    static deserialize(data) {
        const dag = new DAG();
        if (data.nodes) {
            for (const [id, nodeData] of data.nodes) {
                const node = new SerendipityNode(id, nodeData);
                dag.nodes.set(id, node);
            }
        }
        if (data.edges) {
            dag.edges = data.edges;
        }
        if (data.executionOrder) {
            dag.executionOrder = data.executionOrder;
        }
        return dag;
    }
}

// 导出
export { DAG };