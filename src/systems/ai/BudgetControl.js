/**
 * BudgetControl.js - AI预算控制系统
 * API调用预算 | 成本优化
 */

/**
 * BudgetController - 基于Claude-Code Budget Mode
 * 全局资源管理器，控制AI API调用预算
 */
class BudgetController {
    constructor(globalBudget = 100000) {
        this.globalBudget = globalBudget;    // 全局预算（厘）
        this.usedBudget = 0;                  // 已使用预算
        this.rateLimits = new Map();          // 速率限制
        this.providerLimits = new Map();      // 各provider限制
        this.callHistory = [];                // 调用历史
        this.maxHistoryLength = 1000;
        
        // 初始化各provider限制
        this.initProviderLimits();
    }
    
    /**
     * 初始化provider限制
     */
    initProviderLimits() {
        // MiniMax限制
        this.providerLimits.set('minimax', {
            maxPerSecond: 10,
            maxPerMinute: 500,
            maxPerDay: 50000,
            costPer1KTokens: 0.1 // 厘
        });
        
        // OpenAI限制
        this.providerLimits.set('openai', {
            maxPerSecond: 5,
            maxPerMinute: 300,
            maxPerDay: 30000,
            costPer1KTokens: 0.5
        });
        
        // Anthropic限制
        this.providerLimits.set('anthropic', {
            maxPerSecond: 3,
            maxPerMinute: 100,
            maxPerDay: 10000,
            costPer1KTokens: 1.0
        });
        
        // 其他provider默认限制
        const defaultLimits = {
            maxPerSecond: 2,
            maxPerMinute: 50,
            maxPerDay: 5000,
            costPer1KTokens: 0.5
        };
        
        ['groq', 'mistral', 'deepseek', 'local'].forEach(p => {
            if (!this.providerLimits.has(p)) {
                this.providerLimits.set(p, { ...defaultLimits });
            }
        });
    }
    
    /**
     * 检查预算是否足够
     */
    checkBudget(questId, required) {
        const available = this.globalBudget - this.usedBudget;
        return {
            success: available >= required,
            available,
            required,
            shortfall: required - available
        };
    }
    
    /**
     * 分配预算
     */
    allocate(questId, amount) {
        const check = this.checkBudget(questId, amount);
        if (!check.success) {
            return {
                success: false,
                reason: 'budget_exceeded',
                available: check.available,
                required: amount
            };
        }
        
        this.usedBudget += amount;
        this.recordCall('allocate', { questId, amount });
        
        return {
            success: true,
            remaining: this.globalBudget - this.usedBudget,
            allocated: amount
        };
    }
    
    /**
     * 释放预算（任务失败/取消时）
     */
    release(questId, amount) {
        this.usedBudget = Math.max(0, this.usedBudget - amount);
        this.recordCall('release', { questId, amount });
        
        return {
            success: true,
            usedBudget: this.usedBudget,
            released: amount
        };
    }
    
    /**
     * 记录API调用
     */
    recordCall(type, data) {
        this.callHistory.push({
            type,
            timestamp: Date.now(),
            ...data
        });
        
        // 保持历史长度限制
        if (this.callHistory.length > this.maxHistoryLength) {
            this.callHistory = this.callHistory.slice(-this.maxHistoryLength);
        }
    }
    
    /**
     * 检查速率限制
     */
    checkRateLimit(entityId, maxPerSecond) {
        const key = `rate_${entityId}`;
        const now = Date.now();
        const last = this.rateLimits.get(key) || 0;
        
        if (now - last < 1000 / maxPerSecond) {
            return false;
        }
        
        this.rateLimits.set(key, now);
        return true;
    }
    
    /**
     * 检查provider速率限制
     */
    checkProviderRateLimit(provider, limitType = 'second') {
        const limits = this.providerLimits.get(provider);
        if (!limits) return true;
        
        const key = `provider_${provider}_${limitType}`;
        const now = Date.now();
        
        let windowMs;
        let maxCalls;
        
        switch (limitType) {
            case 'second':
                windowMs = 1000;
                maxCalls = limits.maxPerSecond;
                break;
            case 'minute':
                windowMs = 60000;
                maxCalls = limits.maxPerMinute;
                break;
            case 'day':
                windowMs = 86400000;
                maxCalls = limits.maxPerDay;
                break;
            default:
                return true;
        }
        
        // 获取该时间窗口内的调用次数
        const calls = this.callHistory.filter(c => {
            const age = now - c.timestamp;
            return c.provider === provider && age < windowMs;
        }).length;
        
        return calls < maxCalls;
    }
    
    /**
     * 获取provider调用统计
     */
    getProviderStats(provider) {
        const now = Date.now();
        const dayAgo = now - 86400000;
        const hourAgo = now - 3600000;
        
        const recentCalls = this.callHistory.filter(c => c.provider === provider && c.timestamp > dayAgo);
        
        return {
            provider,
            totalToday: recentCalls.length,
            last24h: recentCalls,
            lastHour: recentCalls.filter(c => c.timestamp > hourAgo).length,
            estimatedCost: this.estimateCost(provider, recentCalls.length)
        };
    }
    
    /**
     * 估算成本
     */
    estimateCost(provider, tokenCount) {
        const limits = this.providerLimits.get(provider);
        if (!limits) return 0;
        
        return (tokenCount / 1000) * limits.costPer1KTokens;
    }
    
    /**
     * 预算查询
     */
    query() {
        return {
            globalBudget: this.globalBudget,
            usedBudget: this.usedBudget,
            available: this.globalBudget - this.usedBudget,
            usagePercent: (this.usedBudget / this.globalBudget * 100).toFixed(2),
            callCount: this.callHistory.length,
            providers: Array.from(this.providerLimits.keys()).map(p => ({
                name: p,
                stats: this.getProviderStats(p)
            }))
        };
    }
    
    /**
     * 重置每日限制
     */
    resetDailyLimits() {
        // 清理旧的调用历史
        const dayAgo = Date.now() - 86400000;
        this.callHistory = this.callHistory.filter(c => c.timestamp > dayAgo);
        
        // 清理速率限制
        for (const key of this.rateLimits.keys()) {
            if (key.startsWith('provider_')) {
                this.rateLimits.delete(key);
            }
        }
    }
    
    /**
     * 成本优化建议
     */
    getOptimizationSuggestions() {
        const suggestions = [];
        const stats = this.query();
        
        // 检查使用率
        if (stats.usagePercent > 80) {
            suggestions.push({
                type: 'warning',
                message: '预算使用率超过80%，建议优化'
            });
        }
        
        // 检查高频provider
        for (const p of stats.providers) {
            if (p.stats.totalToday > p.stats.last24h * 0.9) {
                suggestions.push({
                    type: 'provider',
                    message: `${p.name} 调用接近日限额`
                });
            }
        }
        
        return suggestions;
    }
}

// 全局预算控制器实例
const budgetController = new BudgetController(100000);

/**
 * MCP工具: budget.query
 */
function mcpBudgetQuery() {
    return budgetController.query();
}

/**
 * MCP工具: budget.allocate
 */
function mcpBudgetAllocate(questId, amount) {
    return budgetController.allocate(questId, amount);
}

/**
 * MCP工具: budget.release
 */
function mcpBudgetRelease(questId, amount) {
    return budgetController.release(questId, amount);
}

/**
 * MCP工具: budget.check_provider
 */
function mcpBudgetCheckProvider(provider) {
    return {
        provider,
        second: budgetController.checkProviderRateLimit(provider, 'second'),
        minute: budgetController.checkProviderRateLimit(provider, 'minute'),
        day: budgetController.checkProviderRateLimit(provider, 'day')
    };
}

/**
 * 检查是否可以调用（预算+速率双重检查）
 */
function canMakeAPICall(provider, estimatedCost = 100) {
    // 检查预算
    const budgetCheck = budgetController.checkBudget('api_call', estimatedCost);
    if (!budgetCheck.success) {
        return { allowed: false, reason: 'budget_exceeded', ...budgetCheck };
    }
    
    // 检查速率限制
    if (!budgetController.checkProviderRateLimit(provider, 'second')) {
        return { allowed: false, reason: 'rate_limit_second' };
    }
    
    if (!budgetController.checkProviderRateLimit(provider, 'minute')) {
        return { allowed: false, reason: 'rate_limit_minute' };
    }
    
    return { allowed: true };
}

/**
 * 执行带预算控制的API调用
 */
async function executeWithBudgetControl(provider, apiCallFn, fallbackFn = null) {
    // 预估成本
    const estimatedCost = 100; // 默认100厘
    
    const canCall = canMakeAPICall(provider, estimatedCost);
    if (!canCall.allowed) {
        console.warn('API调用被阻止:', canCall.reason);
        
        if (fallbackFn) {
            return fallbackFn();
        }
        
        return {
            success: false,
            reason: canCall.reason,
            budgetState: budgetController.query()
        };
    }
    
    try {
        // 分配预算
        const allocated = budgetController.allocate('api_call', estimatedCost);
        
        // 执行调用
        const result = await apiCallFn();
        
        // 记录成功
        budgetController.recordCall('api_success', {
            provider,
            cost: estimatedCost,
            success: true
        });
        
        return {
            success: true,
            result,
            budgetUsed: estimatedCost,
            remaining: allocated.remaining
        };
        
    } catch (error) {
        // 释放预算（部分使用）
        budgetController.release('api_call', estimatedCost / 2);
        
        budgetController.recordCall('api_error', {
            provider,
            error: error.message
        });
        
        if (fallbackFn) {
            return fallbackFn();
        }
        
        throw error;
    }
}

/**
 * 获取预算仪表盘数据
 */
function getBudgetDashboard() {
    const query = budgetController.query();
    const suggestions = budgetController.getOptimizationSuggestions();
    
    return {
        summary: {
            total: query.globalBudget,
            used: query.usedBudget,
            available: query.available,
            usagePercent: query.usagePercent
        },
        providers: query.providers.map(p => ({
            name: p.name,
            callsToday: p.stats.totalToday,
            estimatedCost: p.stats.estimatedCost
        })),
        suggestions,
        history: budgetController.callHistory.slice(-100)
    };
}

/**
 * 成本监控日志
 */
function logBudgetChange(action, details) {
    const entry = {
        action,
        timestamp: Date.now(),
        ...details
    };
    
    if (typeof addLog === 'function') {
        addLog('system', '预算系统', `${action}: ${JSON.stringify(details)}`);
    }
    
    console.log('[Budget]', entry);
}

/**
 * 预算警报
 */
function triggerBudgetAlert(type, current, threshold) {
    const message = `预算警报: ${type} (${current}/${threshold})`;
    
    if (typeof addLog === 'function') {
        addLog('bad', '⚠️ 预算警报', message);
    }
    
    // 可以触发其他通知
    if (typeof window !== 'undefined' && window.Notification) {
        if (Notification.permission === 'granted') {
            new Notification('修仙模拟器 - 预算警报', { body: message });
        }
    }
    
    return { alert: true, type, current, threshold };
}

// 导出
export {
    BudgetController,
    budgetController,
    mcpBudgetQuery,
    mcpBudgetAllocate,
    mcpBudgetRelease,
    mcpBudgetCheckProvider,
    canMakeAPICall,
    executeWithBudgetControl,
    getBudgetDashboard,
    logBudgetChange,
    triggerBudgetAlert
};