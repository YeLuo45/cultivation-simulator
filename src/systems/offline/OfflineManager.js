/**
 * OfflineManager.js - 离线管理系统
 * 离线收益计算 | 离线挂机 | 能量同步
 */

// ===== 配置 =====
const OFFLINE_CONFIG = {
    maxOfflineHours: 24,
    offlineEfficiency: 0.8,
    earningsThreshold: 1000,
    autoSuspendDays: 7,
    snapshotInterval: 60000 // 1分钟保存一次快照
};

const IDLE_TASKS = {
    'qi_cultivation': {
        name: '灵气修炼',
        baseReward: 10,
        unit: '灵气/小时',
        duration: 24,
        realmScale: true
    },
    'stone_gathering': {
        name: '灵石采集',
        baseReward: 50,
        unit: '灵石/小时',
        duration: 24,
        realmScale: true
    },
    'pill_refining': {
        name: '丹药炼制',
        baseReward: 1,
        unit: '丹药/小时',
        duration: 12,
        requires: 'alchemy'
    },
    'technique_study': {
        name: '功法领悟',
        baseReward: 5,
        unit: '熟练度/小时',
        duration: 48,
        realmScale: true
    },
    'secret_explore': {
        name: '秘境探索',
        baseReward: 100,
        unit: '探索积分/小时',
        duration: 6,
        tokenCost: 1,
        realmScale: true
    }
};

// ===== 核心类 =====

/**
 * SyncState: 追踪Worker和Main之间的同步状态
 */
class SyncState {
    constructor() {
        this.pendingWrites = [];      // 未持久化的写入
        this.lastSyncedAt = 0;        // 上次同步时间戳
        this.syncVersion = 0;          // 单调版本计数器
        this.dirtyFields = new Set();  // 自上次同步后修改的字段
    }
    
    markDirty(field) {
        this.dirtyFields.add(field);
        this.syncVersion++;
    }
    
    clearDirty() {
        this.dirtyFields.clear();
    }
}

/**
 * OfflineSnapshot: 捕获游戏状态用于离线计算
 */
class OfflineSnapshot {
    constructor(gameState, timestamp) {
        this.timestamp = timestamp;
        this.realm = gameState.realm;
        this.cultivation = { ...gameState.cultivation };
        this.spiritStones = gameState.spiritStones;
        this.level = gameState.level;
        this.idleTasks = gameState.idleTasks ? gameState.idleTasks.map(t => ({ ...t })) : [];
        this.offlineEfficiency = gameState.offlineEfficiency || OFFLINE_CONFIG.offlineEfficiency;
        this.activeEffects = gameState.activeEffects || [];
    }
    
    toJSON() {
        return {
            timestamp: this.timestamp,
            realm: this.realm,
            cultivation: this.cultivation,
            spiritStones: this.spiritStones,
            level: this.level,
            idleTasks: this.idleTasks,
            offlineEfficiency: this.offlineEfficiency,
            activeEffects: this.activeEffects
        };
    }
}

/**
 * PowerSync: 同步引擎，支持冲突解决
 */
class PowerSync {
    constructor() {
        this.syncState = new SyncState();
        this.workerChannel = null; // SharedWorker端口
        this.mainThread = null;    // 主线程localStorage
        this.lastSnapshot = null;
        this.conflictLog = [];
    }
    
    /**
     * 离线前捕获快照
     */
    captureSnapshot(gameState) {
        this.lastSnapshot = new OfflineSnapshot(gameState, Date.now());
        return this.lastSnapshot;
    }
    
    /**
     * 从快照恢复，计算离线收益
     */
    restoreFromSnapshot(snapshot, gameState) {
        const now = Date.now();
        const offlineSeconds = (now - snapshot.timestamp) / 1000;
        const offlineHours = offlineSeconds / 3600;
        const cappedHours = Math.min(offlineHours, OFFLINE_CONFIG.maxOfflineHours);
        
        // 计算离线收益
        let totalEarnings = 0;
        for (const task of snapshot.idleTasks) {
            if (task.status === 'active') {
                const taskDuration = (task.endTime - task.startTime) / 1000;
                if (taskDuration > 0) {
                    const completedUnits = Math.floor(cappedHours * 3600 / taskDuration);
                    const efficiency = snapshot.offlineEfficiency || OFFLINE_CONFIG.offlineEfficiency;
                    const taskEarnings = efficiency * completedUnits * (task.baseEarnings || 10);
                    totalEarnings += taskEarnings;
                }
            }
        }
        
        // 应用离线收益到游戏状态
        gameState.spiritStones += Math.floor(totalEarnings);
        gameState.offlineEarnings = Math.floor(totalEarnings);
        gameState.lastActiveTime = snapshot.timestamp;
        
        // 同步worker状态
        this.syncWorkerState(gameState);
        
        return {
            offlineSeconds,
            offlineEarnings: Math.floor(totalEarnings),
            offlineHours: cappedHours
        };
    }
    
    /**
     * 同步到worker (SharedWorker路径)
     */
    syncWorkerState(gameState) {
        this.syncState.lastSyncedAt = Date.now();
        this.syncState.clearDirty();
    }
    
    /**
     * 同步到主线程 (localStorage路径)
     */
    syncMainState(gameState) {
        this.syncState.markDirty('gameState');
        this.syncWorkerState(gameState);
    }
    
    /**
     * 检查是否需要同步
     */
    needsSync() {
        return this.syncState.dirtyFields.size > 0;
    }
    
    /**
     * 解决worker和主线程之间的冲突
     */
    resolveConflict(workerState, mainState) {
        // 使用主线程作为真相来源，但合并worker的更改
        const merged = { ...mainState };
        for (const field of this.syncState.dirtyFields) {
            if (workerState[field] !== undefined) {
                merged[field] = workerState[field];
            }
        }
        this.conflictLog.push({
            timestamp: Date.now(),
            worker: workerState,
            main: mainState,
            resolved: merged
        });
        return merged;
    }
    
    /**
     * 获取同步状态
     */
    getSyncStatus() {
        return {
            dirtyFields: Array.from(this.syncState.dirtyFields),
            lastSyncedAt: this.syncState.lastSyncedAt,
            syncVersion: this.syncState.syncVersion,
            pendingWrites: this.syncState.pendingWrites.length,
            conflicts: this.conflictLog.length
        };
    }
}

// 全局实例
const powerSync = new PowerSync();

// ===== 离线任务管理 =====

/**
 * 添加空闲任务
 */
function addIdleTask(taskId, config) {
    if (!gameState.idleTasks) {
        gameState.idleTasks = [];
    }
    
    const taskDef = IDLE_TASKS[taskId];
    if (!taskDef) return { error: 'Unknown task type' };
    
    // 检查是否有前置要求
    if (taskDef.requires) {
        const hasRequired = checkTaskRequirement(taskDef.requires);
        if (!hasRequired) {
            return { error: `Requires: ${taskDef.requires}` };
        }
    }
    
    // 检查并发数限制
    const activeCount = gameState.idleTasks.filter(t => t.status === 'active').length;
    if (activeCount >= OFFLINE_CONFIG.maxConcurrentTasks) {
        return { error: 'Max concurrent tasks reached' };
    }
    
    // 计算境界缩放
    const realmScale = taskDef.realmScale ? Math.pow(1.5, gameState.realm - 1) : 1;
    
    const task = {
        id: taskId,
        name: taskDef.name,
        status: 'active',
        startTime: Date.now(),
        endTime: Date.now() + (taskDef.duration * 3600 * 1000),
        baseEarnings: taskDef.baseReward * realmScale,
        unit: taskDef.unit,
        duration: taskDef.duration,
        tokenCost: taskDef.tokenCost || 0,
        realmScale: taskDef.realmScale
    };
    
    gameState.idleTasks.push(task);
    
    // 保存快照
    powerSync.captureSnapshot(gameState);
    
    return { success: true, task };
}

/**
 * 检查任务前置要求
 */
function checkTaskRequirement(requirement) {
    switch (requirement) {
        case 'alchemy':
            return gameState.sect && gameState.sect.buildings && gameState.sect.buildings.alchemy;
        default:
            return true;
    }
}

/**
 * 更新空闲任务进度
 */
function updateIdleTasks() {
    if (!gameState.idleTasks) return;
    
    const now = Date.now();
    let hasChanges = false;
    
    for (const task of gameState.idleTasks) {
        if (task.status === 'active' && now >= task.endTime) {
            // 任务完成
            task.status = 'completed';
            task.completedAt = now;
            hasChanges = true;
            
            // 发放奖励
            const earnings = task.baseEarnings * (task.realmScale ? Math.pow(1.5, gameState.realm - 1) : 1);
            gameState.spiritStones += Math.floor(earnings);
            
            addLog('good', '挂机完成', `${task.name}完成，获得${Math.floor(earnings)}${task.unit}`);
        }
    }
    
    // 清理已完成超过24小时的任务
    const cutoff = now - (24 * 3600 * 1000);
    gameState.idleTasks = gameState.idleTasks.filter(t =>
        t.status === 'active' || (t.completedAt && t.completedAt > cutoff)
    );
    
    if (hasChanges) {
        saveGame();
    }
}

/**
 * 获取活跃的挂机任务
 */
function getActiveIdleTasks() {
    if (!gameState.idleTasks) return [];
    return gameState.idleTasks.filter(t => t.status === 'active');
}

/**
 * 取消挂机任务
 */
function cancelIdleTask(taskIndex) {
    if (!gameState.idleTasks || !gameState.idleTasks[taskIndex]) {
        return { error: 'Task not found' };
    }
    
    gameState.idleTasks[taskIndex].status = 'cancelled';
    gameState.idleTasks[taskIndex].cancelledAt = Date.now();
    
    saveGame();
    return { success: true };
}

// ===== 离线收益计算 =====

/**
 * 计算离线收益
 */
function calculateOfflineEarnings() {
    const snapshot = powerSync.lastSnapshot;
    if (!snapshot) return { offlineEarnings: 0, offlineSeconds: 0 };
    
    const now = Date.now();
    const offlineSeconds = (now - snapshot.timestamp) / 1000;
    const offlineHours = offlineSeconds / 3600;
    const cappedHours = Math.min(offlineHours, OFFLINE_CONFIG.maxOfflineHours);
    
    let totalEarnings = 0;
    const taskBreakdown = [];
    
    for (const task of snapshot.idleTasks) {
        if (task.status === 'active') {
            const taskDuration = (task.endTime - task.startTime) / 1000;
            if (taskDuration > 0) {
                const completedUnits = Math.floor(cappedHours * 3600 / taskDuration);
                const efficiency = snapshot.offlineEfficiency || OFFLINE_CONFIG.offlineEfficiency;
                const taskEarnings = efficiency * completedUnits * (task.baseEarnings || 10);
                totalEarnings += taskEarnings;
                
                taskBreakdown.push({
                    name: task.name,
                    completedUnits,
                    earnings: Math.floor(taskEarnings)
                });
            }
        }
    }
    
    return {
        offlineSeconds,
        offlineHours: cappedHours,
        offlineEarnings: Math.floor(totalEarnings),
        taskBreakdown
    };
}

/**
 * 处理玩家返回时的离线收益
 */
function processReturnFromOffline() {
    if (!powerSync.lastSnapshot) {
        return null; // 没有离线快照
    }
    
    const result = powerSync.restoreFromSnapshot(powerSync.lastSnapshot, gameState);
    
    // 显示离线收益
    if (result.offlineEarnings > 0) {
        addLog('good', '离线收益', `离线${result.offlineHours.toFixed(1)}小时，获得${result.offlineEarnings}灵石`);
        
        // 重置快照
        powerSync.captureSnapshot(gameState);
    }
    
    return result;
}

/**
 * 捕获当前状态为快照
 */
function captureOfflineSnapshot() {
    return powerSync.captureSnapshot(gameState);
}

// ===== 能量同步 =====

/**
 * 同步能量状态
 */
function syncEnergyState() {
    const status = powerSync.getSyncStatus();
    
    // 如果有待同步的更改，保存到localStorage
    if (powerSync.needsSync()) {
        saveGame();
        powerSync.syncWorkerState(gameState);
    }
    
    return status;
}

/**
 * 验证能量同步状态
 */
function validateEnergySync() {
    const status = powerSync.getSyncStatus();
    
    const issues = [];
    
    if (status.conflicts > 0) {
        issues.push(`${status.conflicts}个冲突待解决`);
    }
    
    if (status.pendingWrites > 10) {
        issues.push(`${status.pendingWrites}个待写入操作`);
    }
    
    return {
        valid: issues.length === 0,
        issues,
        status
    };
}

// ===== 自动挂机系统 =====

/**
 * 检查是否应该自动挂机
 */
function shouldAutoIdle() {
    // 检查是否超过指定天数未上线
    if (!gameState.lastActiveTime) return false;
    
    const daysSinceActive = (Date.now() - gameState.lastActiveTime) / (24 * 3600 * 1000);
    return daysSinceActive >= OFFLINE_CONFIG.autoSuspendDays;
}

/**
 * 启动自动挂机
 */
function startAutoIdle() {
    if (!shouldAutoIdle()) return;
    
    // 检查是否有活跃任务
    const activeTasks = getActiveIdleTasks();
    if (activeTasks.length > 0) return;
    
    // 自动添加基础挂机任务
    const result = addIdleTask('qi_cultivation', {});
    if (result.success) {
        addLog('system', '自动挂机', '检测到长期未上线，已自动开始灵气修炼');
    }
}

/**
 * 停止自动挂机
 */
function stopAutoIdle() {
    // 标记所有活跃任务为暂停
    if (gameState.idleTasks) {
        for (const task of gameState.idleTasks) {
            if (task.status === 'active') {
                task.status = 'paused';
                task.pausedAt = Date.now();
            }
        }
    }
}

// ===== MCP工具接口 =====

/**
 * MCP: 获取离线状态
 */
function mcpOfflineStatus() {
    const activeTasks = getActiveIdleTasks();
    const earnings = calculateOfflineEarnings();
    const syncStatus = powerSync.getSyncStatus();
    
    return {
        activeTaskCount: activeTasks.length,
        totalEarnings: earnings.offlineEarnings,
        lastSnapshot: powerSync.lastSnapshot?.timestamp || null,
        syncStatus,
        config: OFFLINE_CONFIG
    };
}

/**
 * MCP: 添加挂机任务
 */
function mcpIdleAdd(taskId, options = {}) {
    const result = addIdleTask(taskId, options);
    
    if (result.success) {
        // 更新快照
        powerSync.captureSnapshot(gameState);
    }
    
    return result;
}

/**
 * MCP: 获取挂机任务列表
 */
function mcpIdleList() {
    const tasks = gameState.idleTasks || [];
    return {
        tasks: tasks.map(t => ({
            id: t.id,
            name: t.name,
            status: t.status,
            earnings: t.baseEarnings,
            unit: t.unit,
            endTime: t.endTime
        })),
        activeCount: tasks.filter(t => t.status === 'active').length,
        maxConcurrent: OFFLINE_CONFIG.maxConcurrentTasks
    };
}

// ===== UI 函数 =====

/**
 * 打开离线挂机面板
 */
function openOfflinePanel() {
    const earnings = calculateOfflineEarnings();
    const activeTasks = getActiveIdleTasks();
    
    let html = '<div style="padding:16px;background:#1a1a2e;border-radius:8px;min-width:320px;">';
    html += '<h3 style="color:#ffd700;">⏰ 离线挂机</h3>';
    
    // 当前收益
    html += '<div style="margin:10px 0;padding:10px;background:#2a2a4a;border-radius:6px;">';
    html += `<p>离线收益: <b style="color:#4caf50;">${earnings.offlineEarnings}</b> 灵石</p>`;
    html += `<p>离线时长: <b>${earnings.offlineHours?.toFixed(1) || 0}</b> 小时</p>`;
    html += '</div>';
    
    // 活跃任务
    html += '<h4>活跃任务</h4>';
    if (activeTasks.length === 0) {
        html += '<p style="color:#888;">暂无活跃任务</p>';
    } else {
        html += '<ul>';
        for (const task of activeTasks) {
            const remaining = Math.max(0, task.endTime - Date.now());
            const remainingHours = (remaining / 3600000).toFixed(1);
            html += `<li>${task.name} - 剩余${remainingHours}小时</li>`;
        }
        html += '</ul>';
    }
    
    // 效率设置
    html += '<div style="margin-top:15px;">';
    html += `<p>离线效率: <b>${(OFFLINE_CONFIG.offlineEfficiency * 100).toFixed(0)}%</b></p>`;
    html += '</div>';
    
    html += '<button onclick="closeModal()" style="margin-top:15px;width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>';
    html += '</div>';
    
    showModal(html);
}

/**
 * 渲染挂机任务选项
 */
function renderIdleTaskOptions() {
    let html = '<div style="padding:15px;">';
    html += '<h3>选择挂机任务</h3>';
    html += '<div style="display:grid;gap:10px;">';
    
    for (const [taskId, task] of Object.entries(IDLE_TASKS)) {
        html += `<button onclick="addIdleTask('${taskId}')" style="padding:12px;background:#2a2a4a;color:white;border:1px solid #555;border-radius:6px;cursor:pointer;text-align:left;">
            <b>${task.name}</b><br>
            <small>奖励: ${task.baseReward}${task.unit}</small>
        </button>`;
    }
    
    html += '</div></div>';
    return html;
}

// 导出模块
export {
    OFFLINE_CONFIG,
    IDLE_TASKS,
    SyncState,
    OfflineSnapshot,
    PowerSync,
    powerSync,
    addIdleTask,
    updateIdleTasks,
    getActiveIdleTasks,
    cancelIdleTask,
    calculateOfflineEarnings,
    processReturnFromOffline,
    captureOfflineSnapshot,
    syncEnergyState,
    validateEnergySync,
    shouldAutoIdle,
    startAutoIdle,
    stopAutoIdle,
    openOfflinePanel,
    renderIdleTaskOptions,
    mcpOfflineStatus,
    mcpIdleAdd,
    mcpIdleList
};