/**
 * NPCCollaboration.js - NPC协作系统
 * MessageBus | CollaborationGraph | NPC任务管理
 */

// ===== NPC角色注册 =====

const NPC_ROLE_REGISTRY = {
    'master': {
        role: 'master',
        title: '师尊',
        skills: ['teach', 'assign_task', 'evaluate', 'reward'],
        collaborationWeight: 0.3,
        responseSpeed: 'slow'
    },
    'monster': {
        role: 'monster',
        title: '妖兽',
        skills: ['challenge', 'guard', 'drop_item'],
        collaborationWeight: 0.2,
        responseSpeed: 'fast'
    },
    'merchant': {
        role: 'merchant',
        title: '商人',
        skills: ['trade', 'appraise', 'special_goods'],
        collaborationWeight: 0.25,
        responseSpeed: 'medium'
    },
    'fellow': {
        role: 'fellow',
        title: '同道',
        skills: ['practice_together', 'share_resource', 'mutual_help'],
        collaborationWeight: 0.25,
        responseSpeed: 'medium'
    }
};

// ===== MessageBus =====

/**
 * NpcMessageBus - 异步消息路由
 * 实现nanobot-style的MessageBus，支持任务/响应/广播
 */
class NpcMessageBus {
    constructor() {
        this.messages = [];           // 待处理消息
        this.listeners = new Map();    // role -> [callback]
        this.messageId = 0;
        this.messageHistory = [];
        this.maxHistoryLength = 500;
    }
    
    /**
     * 发送消息给指定角色
     */
    send(fromRole, toRole, type, payload) {
        const msg = {
            id: ++this.messageId,
            from: fromRole,
            to: toRole,
            type, // 'task' | 'response' | 'broadcast'
            payload,
            timestamp: Date.now(),
            status: 'pending'
        };
        this.messages.push(msg);
        this.addToHistory(msg);
        return msg;
    }
    
    /**
     * 广播消息给所有角色
     */
    broadcast(fromRole, type, payload) {
        const msg = {
            id: ++this.messageId,
            from: fromRole,
            to: '*', // wildcard = all roles
            type, // 'announcement' | 'emergency' | 'opportunity'
            payload,
            timestamp: Date.now(),
            status: 'pending'
        };
        this.messages.push(msg);
        this.addToHistory(msg);
        return msg;
    }
    
    /**
     * 订阅角色消息
     */
    subscribe(role, callback) {
        if (!this.listeners.has(role)) {
            this.listeners.set(role, []);
        }
        this.listeners.get(role).push(callback);
        
        // 返回取消订阅函数
        return () => {
            const callbacks = this.listeners.get(role);
            const idx = callbacks.indexOf(callback);
            if (idx >= 0) callbacks.splice(idx, 1);
        };
    }
    
    /**
     * 分发消息给订阅者
     */
    dispatch() {
        const delivered = [];
        
        for (const msg of this.messages) {
            if (msg.status !== 'pending') continue;
            
            const listeners = this.listeners.get(msg.to) || [];
            
            for (const cb of listeners) {
                cb(msg);
                msg.status = 'delivered';
                delivered.push(msg.id);
            }
            
            // 广播消息给所有角色
            if (msg.to === '*') {
                for (const [role, cbs] of this.listeners) {
                    if (role !== msg.from) {
                        for (const cb of cbs) {
                            cb(msg);
                        }
                    }
                }
                msg.status = 'broadcast';
                delivered.push(msg.id);
            }
        }
        
        // 清理已处理的消息
        this.messages = this.messages.filter(m => m.status === 'pending');
        
        return delivered;
    }
    
    /**
     * 获取角色的消息
     */
    getMessages(role, since = 0) {
        return this.messages.filter(m =>
            (m.from === role || m.to === role || m.to === '*') && m.timestamp > since
        );
    }
    
    /**
     * 添加到历史记录
     */
    addToHistory(msg) {
        this.messageHistory.push({ ...msg });
        if (this.messageHistory.length > this.maxHistoryLength) {
            this.messageHistory = this.messageHistory.slice(-this.maxHistoryLength);
        }
    }
    
    /**
     * 获取消息历史
     */
    getHistory(role = null, limit = 100) {
        let history = this.messageHistory;
        
        if (role) {
            history = history.filter(m => m.from === role || m.to === role);
        }
        
        return history.slice(-limit);
    }
    
    /**
     * 清除消息
     */
    clearMessages() {
        this.messages = [];
    }
    
    /**
     * 获取状态
     */
    getStatus() {
        return {
            pendingMessages: this.messages.length,
            registeredListeners: this.listeners.size,
            historyLength: this.messageHistory.length
        };
    }
}

// 全局MessageBus实例
const npcMessageBus = new NpcMessageBus();

// ===== CollaborationGraph =====

/**
 * NpcCollabGraph - 任务协作图
 * 实现ChatDev风格的多角色链式协作
 */
class NpcCollabGraph {
    constructor() {
        this.nodes = new Map();           // nodeId -> {type, owner, status, prerequisites, outcomes}
        this.edges = [];                  // [{from, to, type}]
        this.activeTasks = new Map();    // taskId -> {nodeId, startTime, progress, assignedTo}
        this.taskIdCounter = 0;
    }
    
    /**
     * 添加节点
     */
    addNode(nodeId, config) {
        this.nodes.set(nodeId, {
            id: nodeId,
            type: config.type, // 'publish_task' | 'execute' | 'review' | 'reward'
            owner: config.owner,
            status: 'idle',
            prerequisites: config.prerequisites || [],
            outcomes: config.outcomes || {},
            maxProgress: config.maxProgress || 100
        });
    }
    
    /**
     * 添加边
     */
    addEdge(from, to, type = 'sequence') {
        this.edges.push({ from, to, type });
    }
    
    /**
     * 获取准备就绪的节点（所有前置条件已满足）
     */
    getReadyNodes() {
        const ready = [];
        
        for (const [nodeId, node] of this.nodes) {
            if (node.status !== 'idle') continue;
            
            const prereqs = node.prerequisites || [];
            const allMet = prereqs.every(p => {
                const n = this.nodes.get(p);
                return n && n.status === 'completed';
            });
            
            if (allMet) ready.push(nodeId);
        }
        
        return ready;
    }
    
    /**
     * 启动任务
     */
    startTask(nodeId, assignedTo) {
        const node = this.nodes.get(nodeId);
        if (!node) return null;
        
        const taskId = `task_${nodeId}_${++this.taskIdCounter}`;
        
        node.status = 'in_progress';
        this.activeTasks.set(taskId, {
            nodeId,
            assignedTo,
            startTime: Date.now(),
            progress: 0
        });
        
        return taskId;
    }
    
    /**
     * 更新任务进度
     */
    updateProgress(taskId, progress) {
        const task = this.activeTasks.get(taskId);
        if (!task) return;
        
        task.progress = Math.min(progress, 100);
        
        if (task.progress >= 100) {
            const node = this.nodes.get(task.nodeId);
            if (node) node.status = 'completed';
            task.status = 'completed';
            task.endTime = Date.now();
        }
    }
    
    /**
     * 获取链状态
     */
    getChainStatus(chainId) {
        const nodes = Array.from(this.nodes.values()).filter(n => n.type === chainId);
        
        return {
            total: nodes.length,
            completed: nodes.filter(n => n.status === 'completed').length,
            inProgress: nodes.filter(n => n.status === 'in_progress').length,
            idle: nodes.filter(n => n.status === 'idle').length
        };
    }
    
    /**
     * 获取节点详情
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }
    
    /**
     * 获取活跃任务
     */
    getActiveTasks() {
        return Array.from(this.activeTasks.entries()).map(([id, task]) => ({
            taskId: id,
            ...task
        }));
    }
    
    /**
     * 重置图
     */
    reset() {
        this.nodes.clear();
        this.edges = [];
        this.activeTasks.clear();
    }
}

// 全局协作图实例
const npcCollabGraph = new NpcCollabGraph();

// ===== NPC任务管理器 =====

/**
 * NpcTaskManager - NPC任务分配和追踪
 */
class NpcTaskManager {
    constructor() {
        this.activeTasks = new Map();
        this.taskIdCounter = 0;
        this.taskDefinitions = new Map();
    }
    
    /**
     * 分配任务
     */
    assignTask(role, type, reward, durationMs) {
        const taskId = `npc_task_${++this.taskIdCounter}`;
        
        this.activeTasks.set(taskId, {
            role,
            type,
            progress: 0,
            reward,
            deadline: Date.now() + durationMs,
            startTime: Date.now(),
            status: 'assigned'
        });
        
        return taskId;
    }
    
    /**
     * 更新进度
     */
    updateProgress(taskId, progress) {
        const task = this.activeTasks.get(taskId);
        if (task) {
            task.progress = Math.min(progress, 100);
            if (progress >= 100) {
                task.status = 'completed';
                task.completedAt = Date.now();
            }
        }
    }
    
    /**
     * 完成任务
     */
    completeTask(taskId) {
        const task = this.activeTasks.get(taskId);
        if (task) {
            task.progress = 100;
            task.status = 'completed';
            task.completedAt = Date.now();
            return task;
        }
        return null;
    }
    
    /**
     * 获取角色的活跃任务
     */
    getActiveTasks(role) {
        return Array.from(this.activeTasks.values()).filter(t =>
            t.role === role && t.status !== 'completed'
        );
    }
    
    /**
     * 获取过期任务
     */
    getExpiredTasks() {
        const now = Date.now();
        return Array.from(this.activeTasks.entries()).filter(([id, task]) =>
            task.deadline < now && task.status !== 'completed'
        ).map(([id]) => id);
    }
    
    /**
     * 清理过期任务
     */
    cleanupExpiredTasks() {
        const expired = this.getExpiredTasks();
        for (const taskId of expired) {
            const task = this.activeTasks.get(taskId);
            if (task) {
                task.status = 'expired';
                task.expiredAt = Date.now();
            }
        }
        return expired.length;
    }
}

/**
 * NpcCollaborationRewards - 协作奖励分配
 */
class NpcCollaborationRewards {
    constructor() {
        this.rewardPool = 0;
        this.distributionRules = {
            'master': { share: 0.4, bonusOn: ['teach', 'evaluate'] },
            'fellow': { share: 0.3, bonusOn: ['practice_together', 'share_resource'] },
            'merchant': { share: 0.2, bonusOn: ['trade', 'appraise'] },
            'monster': { share: 0.1, bonusOn: ['challenge', 'drop_item'] }
        };
        this.totalDistributed = 0;
    }
    
    /**
     * 添加到奖励池
     */
    addToPool(amount) {
        this.rewardPool += amount;
    }
    
    /**
     * 分配奖励
     */
    distribute(role) {
        const rule = this.distributionRules[role];
        if (!rule) return 0;
        
        const amount = Math.floor(this.rewardPool * rule.share);
        this.totalDistributed += amount;
        
        return amount;
    }
    
    /**
     * 获取剩余奖励池
     */
    getPool() {
        return this.rewardPool;
    }
    
    /**
     * 清空奖励池
     */
    clearPool() {
        this.rewardPool = 0;
    }
}

/**
 * NpcReputationSystem - NPC声望系统
 */
class NpcReputationSystem {
    constructor() {
        this.reputations = new Map();
        this.initReputations();
    }
    
    initReputations() {
        for (const [role, config] of Object.entries(NPC_ROLE_REGISTRY)) {
            this.reputations.set(role, {
                level: 1,
                exp: 0,
                totalInteractions: 0,
                lastInteraction: 0
            });
        }
    }
    
    getReputation(role) {
        return this.reputations.get(role) || { level: 0, exp: 0 };
    }
    
    addReputation(role, amount) {
        const rep = this.getReputation(role);
        rep.exp += amount;
        rep.totalInteractions++;
        rep.lastInteraction = Date.now();
        
        // 升级
        while (rep.exp >= 100) {
            rep.exp -= 100;
            rep.level++;
        }
        
        this.reputations.set(role, rep);
        return rep;
    }
    
    getReputationLevel(role) {
        return this.getReputation(role).level;
    }
}

// 全局实例
const npcReputationSystem = new NpcReputationSystem();
const npcTaskManager = new NpcTaskManager();
const npcCollabRewards = new NpcCollaborationRewards();

// ===== 计划审核门 =====

/**
 * PLAN_REVIEW_GATE - 关键决策需要玩家确认
 */
const PLAN_REVIEW_GATE = {
    gates: {
        'major_cultivation_advice': { threshold: 0.7, auto_approve: false },
        'rare_item_trade': { threshold: 0.5, auto_approve: false },
        'sect_mission': { threshold: 0.6, auto_approve: true },
        'fellow_help_request': { threshold: 0.4, auto_approve: true }
    },
    
    shouldBlock(action) {
        const gate = this.gates[action];
        if (!gate) return false;
        return !gate.auto_approve;
    },
    
    getThreshold(action) {
        return this.gates[action]?.threshold || 0.5;
    }
};

// ===== 协作房间 =====

/**
 * CollaborationRoom - 协作房间
 */
class CollaborationRoom {
    constructor(roomId, taskType) {
        this.roomId = roomId;
        this.taskType = taskType;
        this.participants = new Map(); // playerId -> {name, joinedAt, contribution}
        this.maxParticipants = 5;
        this.status = 'recruiting'; // recruiting, in_progress, completed
        this.chatLog = [];
        this.resourcePool = 0;
    }
    
    join(playerId, playerName) {
        if (this.status !== 'recruiting') {
            return { success: false, reason: 'Room not recruiting' };
        }
        
        if (this.participants.size >= this.maxParticipants) {
            return { success: false, reason: 'Room full' };
        }
        
        this.participants.set(playerId, {
            name: playerName,
            joinedAt: Date.now(),
            contribution: 0
        });
        
        this.addChatLog(playerName, 'joined the room');
        
        return { success: true, roomId: this.roomId };
    }
    
    leave(playerId) {
        const participant = this.participants.get(playerId);
        if (participant) {
            this.addChatLog(participant.name, 'left the room');
            this.participants.delete(playerId);
            return true;
        }
        return false;
    }
    
    addChatLog(playerName, message) {
        this.chatLog.push({
            playerName,
            message,
            timestamp: Date.now()
        });
    }
    
    contribute(playerId, amount) {
        const participant = this.participants.get(playerId);
        if (participant) {
            participant.contribution += amount;
            this.resourcePool += amount;
        }
    }
    
    distributeResources(perPlayer) {
        for (const [pid, session] of this.participants) {
            gameState.spiritStones += perPlayer;
            this.addChatLog(pid, `received ${perPlayer} spirit stones`);
        }
    }
    
    getParticipantCount() {
        return this.participants.size;
    }
}

/**
 * CollaborationManager - 管理所有协作房间
 */
class CollaborationManager {
    constructor() {
        this.rooms = new Map();           // roomId -> CollaborationRoom
        this.playerRooms = new Map();     // playerId -> [roomId]
        this.roomCounter = 0;
    }
    
    createRoom(taskType, maxParticipants = 5) {
        this.roomCounter++;
        const roomId = `collab_${taskType}_${this.roomCounter}`;
        const room = new CollaborationRoom(roomId, taskType);
        room.maxParticipants = maxParticipants;
        this.rooms.set(roomId, room);
        return room;
    }
    
    joinRoom(roomId, playerId, playerName) {
        const room = this.rooms.get(roomId);
        if (!room) return { success: false, reason: 'Room not found' };
        if (room.status !== 'recruiting') return { success: false, reason: 'Room not recruiting' };
        
        const result = room.join(playerId, playerName);
        if (result.success) {
            if (!this.playerRooms.has(playerId)) {
                this.playerRooms.set(playerId, []);
            }
            this.playerRooms.get(playerId).push(roomId);
        }
        return result;
    }
    
    leaveRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room) return false;
        
        const left = room.leave(playerId);
        if (left) {
            const rooms = this.playerRooms.get(playerId);
            if (rooms) {
                const idx = rooms.indexOf(roomId);
                if (idx >= 0) rooms.splice(idx, 1);
            }
        }
        return left;
    }
    
    getActiveRooms() {
        return Array.from(this.rooms.values()).filter(r => r.status === 'recruiting');
    }
    
    getRoomStatus(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;
        
        return {
            roomId: room.roomId,
            taskType: room.taskType,
            participants: room.getParticipantCount(),
            maxParticipants: room.maxParticipants,
            status: room.status
        };
    }
}

// 全局协作管理器
const collabManager = new CollaborationManager();

// ===== MCP工具接口 =====

/**
 * MCP: NPC查询
 */
function mcpNpcQuery(npcId, query) {
    const role = npcId.toLowerCase();
    const config = NPC_ROLE_REGISTRY[role];
    
    if (!config) {
        return { error: 'NPC not found' };
    }
    
    const rep = npcReputationSystem.getReputation(role);
    
    switch (query) {
        case 'info':
            return { role, ...config, reputation: rep };
        case 'memory':
            return { messages: npcMessageBus.getHistory(role, 50) };
        case 'relationship':
            return { reputation: rep, tasks: npcTaskManager.getActiveTasks(role) };
        case 'task':
            return { activeTasks: npcTaskManager.getActiveTasks(role) };
        default:
            return { error: 'Unknown query type' };
    }
}

/**
 * MCP: NPC消息
 */
function mcpNpcMessage(fromRole, toRole, type, payload) {
    return npcMessageBus.send(fromRole, toRole, type, payload);
}

/**
 * MCP: NPC协作状态
 */
function mcpNpcCollabStatus() {
    return {
        messageBus: npcMessageBus.getStatus(),
        graph: {
            nodes: npcCollabGraph.nodes.size,
            activeTasks: npcCollabGraph.getActiveTasks().length,
            readyNodes: npcCollabGraph.getReadyNodes().length
        },
        tasks: npcTaskManager.activeTasks.size,
        rewards: {
            pool: npcCollabRewards.getPool(),
            distributed: npcCollabRewards.totalDistributed
        },
        rooms: collabManager.rooms.size
    };
}

/**
 * MCP: 协作房间操作
 */
function mcpCollabCreate(taskType, maxParticipants) {
    const room = collabManager.createRoom(taskType, maxParticipants);
    return { success: true, roomId: room.roomId };
}

function mcpCollabJoin(roomId, playerId, playerName) {
    return collabManager.joinRoom(roomId, playerId, playerName);
}

function mcpCollabLeave(roomId, playerId) {
    return { success: collabManager.leaveRoom(roomId, playerId) };
}

function mcpCollabList() {
    return {
        activeRooms: collabManager.getActiveRooms().map(r => ({
            roomId: r.roomId,
            taskType: r.taskType,
            participants: r.getParticipantCount(),
            maxParticipants: r.maxParticipants
        }))
    };
}

// ===== UI 函数 =====

/**
 * 打开NPC协作面板
 */
function openNpcCollabPanel() {
    showModal('🤝 NPC协作面板', `
        <div class="npc-collab-tabs">
            <button class="tab-btn active" onclick="setNpcTab('roles')">👥 角色</button>
            <button class="tab-btn" onclick="setNpcTab('tasks')">📋 任务</button>
            <button class="tab-btn" onclick="setNpcTab('rewards')">🎁 奖励</button>
            <button class="tab-btn" onclick="setNpcTab('messages')">💬 消息</button>
        </div>
        <div id="npcCollabContent" style="padding:15px;">${renderNpcRolesTab()}</div>
    `, 600);
}

function setNpcTab(tab) {
    document.querySelectorAll('.npc-collab-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    const content = document.getElementById('npcCollabContent');
    if (!content) return;
    
    switch(tab) {
        case 'roles': content.innerHTML = renderNpcRolesTab(); break;
        case 'tasks': content.innerHTML = renderNpcTasksTab(); break;
        case 'rewards': content.innerHTML = renderNpcRewardsTab(); break;
        case 'messages': content.innerHTML = renderNpcMessagesTab(); break;
    }
}

function renderNpcRolesTab() {
    let html = '<h4>角色声望</h4><table style="width:100%;">';
    html += '<tr><th>角色</th><th>等级</th><th>经验</th><th>互动次数</th></tr>';
    
    for (const [role, data] of npcReputationSystem.reputations) {
        const config = NPC_ROLE_REGISTRY[role];
        html += `<tr>
            <td>${config?.title || role}</td>
            <td>Lv${data.level}</td>
            <td>${data.exp}/100</td>
            <td>${data.totalInteractions}</td>
        </tr>`;
    }
    
    html += '</table>';
    html += '<h4 style="margin-top:20px;">协作引擎状态</h4>';
    html += `<p>消息数: ${npcMessageBus.getStatus().pendingMessages}</p>`;
    html += `<p>活跃链: ${npcCollabGraph.getActiveTasks().length}</p>`;
    
    return html;
}

function renderNpcTasksTab() {
    const tasks = npcTaskManager.activeTasks;
    if (tasks.size === 0) return '<p>暂无活跃任务</p>';
    
    let html = '<table style="width:100%;">';
    html += '<tr><th>角色</th><th>类型</th><th>进度</th><th>截止时间</th></tr>';
    
    for (const [id, task] of tasks) {
        const remaining = Math.max(0, task.deadline - Date.now());
        const remainingMins = Math.floor(remaining / 60000);
        html += `<tr>
            <td>${task.role}</td>
            <td>${task.type}</td>
            <td>${task.progress.toFixed(0)}%</td>
            <td>${remainingMins}分钟后</td>
        </tr>`;
    }
    
    html += '</table>';
    return html;
}

function renderNpcRewardsTab() {
    let html = '<h4>奖励池</h4>';
    html += `<p>当前: <b>${npcCollabRewards.getPool()}</b> 灵石</p>`;
    html += '<h4>分配规则</h4><table style="width:100%;">';
    html += '<tr><th>角色</th><th>份额</th></tr>';
    
    for (const [role, rule] of Object.entries(npcCollabRewards.distributionRules)) {
        html += `<tr><td>${role}</td><td>${(rule.share * 100).toFixed(0)}%</td></tr>`;
    }
    
    html += '</table>';
    return html;
}

function renderNpcMessagesTab() {
    const history = npcMessageBus.getHistory(null, 20);
    
    if (history.length === 0) return '<p>暂无消息记录</p>';
    
    let html = '<table style="width:100%;">';
    html += '<tr><th>时间</th><th>发送者</th><th>类型</th><th>内容</th></tr>';
    
    for (const msg of history) {
        const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN');
        html += `<tr>
            <td>${time}</td>
            <td>${msg.from}</td>
            <td>${msg.type}</td>
            <td>${JSON.stringify(msg.payload).slice(0, 30)}...</td>
        </tr>`;
    }
    
    html += '</table>';
    return html;
}

/**
 * 打开协作面板
 */
function openCollaborationPanel() {
    const activeRooms = collabManager.getActiveRooms();
    
    let html = `<div style="padding:15px;">`;
    html += `<h3>🤝 协作大厅</h3>`;
    html += `<button onclick="createCollabRoom()" style="margin:10px;padding:10px;">创建协作房间</button>`;
    html += `<h4>可加入的房间</h4>`;
    
    if (activeRooms.length === 0) {
        html += `<p>暂无空闲房间</p>`;
    } else {
        html += `<table style="width:100%;">`;
        html += `<tr><th>任务类型</th><th>玩家数</th><th>状态</th><th>操作</th></tr>`;
        
        for (const room of activeRooms) {
            html += `<tr>
                <td>${room.taskType}</td>
                <td>${room.getParticipantCount()}/${room.maxParticipants}</td>
                <td>${room.status}</td>
                <td><button onclick="joinCollabRoom('${room.roomId}')">加入</button></td>
            </tr>`;
        }
        
        html += `</table>`;
    }
    
    html += '</div>';
    
    showModal(html);
}

function createCollabRoom() {
    const result = mcpCollabCreate('practice', 5);
    if (result.success) {
        addLog('good', '协作房间', `已创建房间: ${result.roomId}`);
        openCollaborationPanel();
    }
}

function joinCollabRoom(roomId) {
    const result = mcpCollabJoin(roomId, 'player1', gameState.name || '修士');
    if (result.success) {
        addLog('good', '加入房间', `成功加入 ${roomId}`);
    } else {
        addLog('bad', '加入失败', result.reason);
    }
}

// 导出模块
export {
    NPC_ROLE_REGISTRY,
    NpcMessageBus,
    npcMessageBus,
    NpcCollabGraph,
    npcCollabGraph,
    NpcTaskManager,
    npcTaskManager,
    NpcCollaborationRewards,
    npcCollabRewards,
    NpcReputationSystem,
    npcReputationSystem,
    PLAN_REVIEW_GATE,
    CollaborationRoom,
    CollaborationManager,
    collabManager,
    openNpcCollabPanel,
    openCollaborationPanel,
    mcpNpcQuery,
    mcpNpcMessage,
    mcpNpcCollabStatus,
    mcpCollabCreate,
    mcpCollabJoin,
    mcpCollabLeave,
    mcpCollabList
};