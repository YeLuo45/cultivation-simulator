/**
 * SaveManager.js - 持久化保存系统
 * 自动保存逻辑 | 云端保存(GitHub Gist) | 保存压缩 | 保存历史
 */

// ===== CONFIG =====
const SAVE_CONFIG = {
    storageKey: 'cultivationSave',
    autoSaveKey: 'cultivation_sim_autosave',
    cloudTokenKey: 'cultivationCloudToken',
    cloudGistIdKey: 'cultivationCloudGistId',
    cloudAutoSaveKey: 'cultivationCloudAutoSave',
    cloudUrl: 'https://api.github.com/gists',
    maxSaveHistory: 5,
    compressionThreshold: 1024 * 1024, // 1MB
    autoSaveInterval: 60000 // 60秒
};

let _autoSaveTimer = null;

/**
 * 主保存函数 - 保存到localStorage
 */
function saveGame() {
    try {
        const data = JSON.stringify(gameState);
        
        // 压缩检查
        if (data.length > SAVE_CONFIG.compressionThreshold) {
            console.warn(`存档大小: ${(data.length / 1024).toFixed(1)}KB, 建议清理`);
        }
        
        localStorage.setItem(SAVE_CONFIG.storageKey, data);
        
        // 更新自动存档
        updateAutoSave();
        
        return { success: true, size: data.length };
    } catch (e) {
        console.error('保存失败:', e);
        return { error: e.message };
    }
}

/**
 * 更新自动存档 - 带历史记录
 */
function updateAutoSave() {
    try {
        if (!gameState.saveSlots) gameState.saveSlots = {};
        
        // 创建自动存档快照
        const autoSnapshot = {
            timestamp: Date.now(),
            realm: gameState.realm,
            stage: gameState.stage,
            spiritStones: gameState.spiritStones,
            days: gameState.days,
            level: gameState.level
        };
        
        gameState.saveSlots.auto = autoSnapshot;
        
        // 保存带完整数据的自动存档
        localStorage.setItem(SAVE_CONFIG.autoSaveKey, JSON.stringify(gameState));
        
        // 管理保存历史
        maintainSaveHistory();
        
    } catch (e) {
        console.error('自动存档更新失败:', e);
    }
}

/**
 * 维护保存历史 - 保留最近N个版本
 */
function maintainSaveHistory() {
    const historyKey = 'cultivation_save_history';
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // 添加当前存档到历史
    history.unshift({
        timestamp: Date.now(),
        realm: gameState.realm,
        days: gameState.days,
        spiritStones: gameState.spiritStones
    });
    
    // 限制历史数量
    if (history.length > SAVE_CONFIG.maxSaveHistory) {
        history = history.slice(0, SAVE_CONFIG.maxSaveHistory);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
}

/**
 * 获取保存历史
 */
function getSaveHistory() {
    const historyKey = 'cultivation_save_history';
    return JSON.parse(localStorage.getItem(historyKey) || '[]');
}

/**
 * 从历史存档恢复
 */
function restoreFromHistory(index) {
    const history = getSaveHistory();
    if (index < 0 || index >= history.length) {
        return { error: 'Invalid history index' };
    }
    
    // 使用自动存档作为完整备份
    const autoSave = localStorage.getItem(SAVE_CONFIG.autoSaveKey);
    if (!autoSave) {
        return { error: 'No auto save found' };
    }
    
    try {
        const data = JSON.parse(autoSave);
        return { success: true, data, info: history[index] };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * 手动保存 - 带UI反馈
 */
function doSaveGame() {
    try {
        const result = saveGame();
        if (result.success) {
            addLog('good', '📁 存档成功', `游戏已保存 (${(result.size / 1024).toFixed(1)}KB)`);
        } else {
            addLog('bad', '📁 存档失败', result.error);
        }
        return result;
    } catch (e) {
        addLog('bad', '📁 存档失败', e.message);
        return { error: e.message };
    }
}

/**
 * 显示存档管理UI
 */
function showSaveLoadModal() {
    const saved = localStorage.getItem(SAVE_CONFIG.storageKey);
    let saveInfo = '未找到存档';
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            saveInfo = `第 ${data.days || 0} 天 | ${data.realm || 1} 重天`;
        } catch (e) {
            saveInfo = '存档损坏';
        }
    }
    
    let html = '<div style="padding:16px;background:#1a1a2e;border-radius:8px;min-width:280px;">';
    html += '<div style="margin-bottom:16px;text-align:center;">';
    html += '<b style="color:#ffd700;font-size:16px;">📁 存档管理</b>';
    html += `<div style="color:#888;font-size:11px;margin-top:4px;">${saveInfo}</div>`;
    html += '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';
    html += `<button onclick="doSaveGame();closeModal();" style="padding:12px;background:#2e7d32;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">💾 保存游戏</button>`;
    html += `<button onclick="doLoadGame();closeModal();" style="padding:12px;background:#1565c0;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">📂 加载存档</button>`;
    html += `<button onclick="showAutoSaveInfo()" style="padding:12px;background:#333;color:#aaa;border:1px solid #555;border-radius:6px;cursor:pointer;font-size:14px;">ℹ️ 自动存档</button>`;
    html += `<button onclick="doResetGame()" style="padding:12px;background:#c62828;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">⚠️ 重置游戏</button>`;
    html += '</div>';
    html += '<button onclick="closeModal()" style="margin-top:16px;width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>';
    html += '</div>';
    
    showModal(html);
}

/**
 * 显示自动存档信息
 */
function showAutoSaveInfo() {
    const history = getSaveHistory();
    const autoSave = localStorage.getItem(SAVE_CONFIG.autoSaveKey);
    
    let html = '<div style="padding:16px;background:#1a1a2e;border-radius:8px;min-width:280px;">';
    html += '<h3 style="color:#ffd700;">ℹ️ 自动存档</h3>';
    html += '<p>自动存档间隔: 60秒</p>';
    html += '<p>保存历史数量: ' + history.length + '/' + SAVE_CONFIG.maxSaveHistory + '</p>';
    
    if (history.length > 0) {
        html += '<h4 style="margin-top:10px;">最近存档:</h4><ul>';
        for (let i = 0; i < Math.min(3, history.length); i++) {
            const h = history[i];
            const date = new Date(h.timestamp);
            html += `<li>第${h.days}天 | ${h.realm}重天 | ${date.toLocaleString('zh-CN')}</li>`;
        }
        html += '</ul>';
    }
    
    html += '<button onclick="closeModal()" style="margin-top:12px;width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>';
    html += '</div>';
    
    showModal(html);
}

/**
 * 重置游戏
 */
function doResetGame() {
    if (!confirm('确定要重置游戏吗？所有进度将丢失！')) return;
    
    localStorage.removeItem(SAVE_CONFIG.storageKey);
    localStorage.removeItem(SAVE_CONFIG.autoSaveKey);
    localStorage.removeItem('cultivation_save_history');
    
    location.reload();
}

// ===== 云端保存 (GitHub Gist) =====

/**
 * 获取云端配置
 */
function getCloudConfig() {
    return {
        token: localStorage.getItem(SAVE_CONFIG.cloudTokenKey) || '',
        gistId: localStorage.getItem(SAVE_CONFIG.cloudGistIdKey) || '',
        autoSave: localStorage.getItem(SAVE_CONFIG.cloudAutoSaveKey) === 'true'
    };
}

/**
 * 保存云端配置
 */
function saveCloudConfig(token, gistId, autoSave) {
    localStorage.setItem(SAVE_CONFIG.cloudTokenKey, token);
    localStorage.setItem(SAVE_CONFIG.cloudGistIdKey, gistId);
    localStorage.setItem(SAVE_CONFIG.cloudAutoSaveKey, autoSave ? 'true' : 'false');
}

/**
 * 更新云端状态显示
 */
function updateCloudStatus(message, isError = false) {
    const el = document.getElementById('cloudStatus');
    if (el) {
        el.textContent = message;
        el.style.color = isError ? '#f44336' : '#4caf50';
    }
}

/**
 * 云端保存 - GitHub Gist
 */
async function cloudSave() {
    const config = getCloudConfig();
    if (!config.token) {
        updateCloudStatus('请先填写 GitHub Token', true);
        return { error: 'No token' };
    }

    updateCloudStatus('正在保存到云端...');

    const saveData = {
        description: `修仙模拟器存档 - 第${gameState.days}天`,
        public: false,
        files: {
            'cultivation-save.json': {
                content: JSON.stringify(gameState)
            }
        }
    };

    try {
        let url = SAVE_CONFIG.cloudUrl;
        let method = 'POST';

        if (config.gistId) {
            url = `${SAVE_CONFIG.cloudUrl}/${config.gistId}`;
            method = 'PATCH';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(saveData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        const newGistId = result.id;

        // 保存新的 Gist ID
        saveCloudConfig(config.token, newGistId, config.autoSave);

        // 更新 UI 中的 Gist ID 字段
        const gistIdInput = document.getElementById('cloudGistId');
        if (gistIdInput) gistIdInput.value = newGistId;

        updateCloudStatus(`☁️ 云端存档成功！Gist ID: ${newGistId}`);
        addLog('good', '☁️ 云端存档', `存档已保存到云端 (第${gameState.days}天)`);

        // 同时保存到本地
        saveGame();

        return { success: true, gistId: newGistId };

    } catch (e) {
        updateCloudStatus(`云端保存失败: ${e.message}`, true);
        addLog('bad', '☁️ 云端存档失败', e.message);
        return { error: e.message };
    }
}

/**
 * 自动云端存档 - 每天结束时调用
 */
async function autoCloudSave() {
    const config = getCloudConfig();
    if (!config.autoSave || !config.token) return;

    try {
        await cloudSave();
    } catch (e) {
        console.log('自动云端存档失败:', e.message);
    }
}

// ===== 压缩与导出 =====

/**
 * 导出存档为JSON字符串
 */
function exportSaveData() {
    try {
        const data = JSON.stringify(gameState, null, 2);
        return { success: true, data };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * 从JSON字符串导入存档
 */
function importSaveData(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        
        // 基础验证
        if (!parsed.realm || !parsed.days) {
            return { error: 'Invalid save data format' };
        }
        
        // 应用存档
        gameState = { ...gameState, ...parsed };
        saveGame();
        
        return { success: true, imported: parsed.days + '天存档' };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * 压缩存档数据 - 移除临时字段
 */
function compressSaveData(data) {
    const compressed = { ...data };
    
    // 移除临时UI状态
    delete compressed.uiState;
    delete compressed.modalOpen;
    delete compressed.currentTab;
    
    // 移除空数组
    if (compressed.combatLog && compressed.combatLog.length > 100) {
        compressed.combatLog = compressed.combatLog.slice(-100);
    }
    
    return compressed;
}

// ===== MCP工具接口 =====

/**
 * MCP保存同步
 */
function mcpSaveSync() {
    try {
        if (!gameState.saveSlots) gameState.saveSlots = {};
        gameState.saveSlots.auto = { timestamp: Date.now(), realm: gameState.realm, stage: gameState.stage, spiritStones: gameState.spiritStones };
        localStorage.setItem(SAVE_CONFIG.autoSaveKey, JSON.stringify(gameState));
        return { success: true, slot: 'auto', synced: Date.now() };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * MCP保存备份
 */
function mcpSaveBackup() {
    try {
        if (!gameState.saveSlots) gameState.saveSlots = {};
        const name = 'backup_' + Date.now();
        gameState.saveSlots[name] = JSON.parse(JSON.stringify(gameState));
        return { success: true, slot: name, timestamp: Date.now() };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * MCP获取存档槽位
 */
function mcpSaveSlots() {
    try {
        const slots = gameState.saveSlots || {};
        const auto = localStorage.getItem(SAVE_CONFIG.autoSaveKey);
        return {
            slots: Object.keys(slots),
            autoExists: !!auto,
            count: Object.keys(slots).length + (auto ? 1 : 0)
        };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * MCP删除存档槽位
 */
function mcpSaveDelete(slot) {
    try {
        if (!gameState.saveSlots) return { error: 'No save slots exist' };
        if (slot === 'auto') localStorage.removeItem(SAVE_CONFIG.autoSaveKey);
        if (gameState.saveSlots[slot]) delete gameState.saveSlots[slot];
        return { success: true, deleted: slot };
    } catch (e) {
        return { error: e.message };
    }
}

// 导出模块
export { 
    saveGame, doSaveGame, showSaveLoadModal, showAutoSaveInfo, doResetGame,
    cloudSave, autoCloudSave, getCloudConfig, saveCloudConfig, updateCloudStatus,
    exportSaveData, importSaveData, compressSaveData,
    mcpSaveSync, mcpSaveBackup, mcpSaveSlots, mcpSaveDelete,
    getSaveHistory, restoreFromHistory
};