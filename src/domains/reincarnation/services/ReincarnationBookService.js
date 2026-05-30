/**
 * ReincarnationBookService - 轮回簿天道记录服务
 * V226: Direction M续 - 轮回簿天道记录系统
 * 
 * 功能：
 * - 轮回簿：查看转世历史完整记录
 * - 因果行为追踪：记录善恶行为、查询因果状态
 * - 天道法则记录：记录飞升历史、天道功德
 * - 天道赐福：获得天道奖励
 * - 历史导出：导出轮回历史
 */

class ReincarnationBookService {
    constructor() {
        this.gameState = null;
        this.karmaRecords = [];      // 因果行为记录
        this.tiandaoRecords = [];    // 天道记录
        this.blessings = [];         // 天道赐福记录
    }

    /**
     * 初始化轮回簿系统
     */
    init(gameState) {
        this.gameState = gameState;
        
        // 总是重建reincarnationBook，确保干净的数组
        gameState.reincarnationBook = {
            karmaRecords: [],
            tiandaoRecords: [],
            tiandaoMerit: 0,
            blessings: [],
            reincarnationHistory: []
        };
        
        // 同步历史记录
        if (gameState.reincarnation?.pastLives) {
            gameState.reincarnationBook.reincarnationHistory = gameState.reincarnation.pastLives;
        }
        
        this.karmaRecords = gameState.reincarnationBook.karmaRecords;
        this.tiandaoRecords = gameState.reincarnationBook.tiandaoRecords;
        this.blessings = gameState.reincarnationBook.blessings;
        
        return gameState;
    }

    /**
     * 获取轮回簿统计
     */
    getBookStats() {
        const book = this.gameState?.reincarnationBook || {};
        const reincarnation = this.gameState?.reincarnation || {};
        
        return {
            totalKarmaRecords: book.karmaRecords?.length || 0,
            totalTiandaoRecords: book.tiandaoRecords?.length || 0,
            tiandaoMerit: book.tiandaoMerit || 0,
            blessingsCount: book.blessings?.length || 0,
            reincarnationTimes: reincarnation.times || 0,
            netKarma: (reincarnation.karmaGood || 0) - (reincarnation.karmaBad || 0),
            karmaGood: reincarnation.karmaGood || 0,
            karmaBad: reincarnation.karmaBad || 0,
            pastLivesCount: reincarnation.pastLives?.length || 0
        };
    }

    // ===== MCP工具实现 =====

    /**
     * MCP: reincarnation.book.list
     * 查看转世历史（轮回簿）
     */
    mcpBookList(params = {}) {
        const limit = params?.limit || 20;
        const offset = params?.offset || 0;
        const filter = params?.filter || 'all'; // all/good/bad

        const history = this.gameState?.reincarnation?.pastLives || [];
        
        let filtered = history;
        if (filter === 'good') {
            filtered = history.filter(h => (h.karmaBalance || 0) >= 0);
        } else if (filter === 'bad') {
            filtered = history.filter(h => (h.karmaBalance || 0) < 0);
        }

        const paginated = filtered.slice(offset, offset + limit);
        
        return {
            success: true,
            total: filtered.length,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
            records: paginated.map(record => ({
                ...record,
                realmName: this.getRealmName(record.realmAtDeath),
                karmaEvaluation: this.evaluateKarma(record.karmaBalance),
                ageDesc: record.ageAtDeath ? `享年${record.ageAtDeath}岁` : '年龄未知'
            })),
            message: `轮回簿共 ${filtered.length} 条记录`
        };
    }

    /**
     * MCP: reincarnation.karma.record
     * 记录因果行为
     */
    mcpKarmaRecord(params = {}) {
        const { type, action, amount, description } = params;
        
        if (!type || !action) {
            return { 
                success: false, 
                reason: '缺少必要参数：type（行为类型）和 action（善恶）' 
            };
        }

        const karmaAmount = Math.abs(amount || 1);
        const isGood = action === 'good';
        const adjustedAmount = isGood ? karmaAmount : -karmaAmount;

        // 记录到因果行为历史
        const record = {
            id: `karma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type,                        // 行为类型
            action: action,                     // good/bad
            amount: adjustedAmount,
            description: description || this.getDefaultKarmaDesc(type, action),
            timestamp: Date.now(),
            day: this.gameState?.days || 0
        };

        this.karmaRecords.push(record);
        
        // 同步到 gameState（karmaRecords已经是引用，不需要再次push）
        if (this.gameState?.reincarnationBook) {
            // karmaRecords是reincarnationBook.karmaRecords的引用，已经同步
        }

        // 更新总因果
        const reincarnation = this.gameState?.reincarnation;
        if (reincarnation) {
            if (isGood) {
                reincarnation.karmaGood = (reincarnation.karmaGood || 0) + karmaAmount;
            } else {
                reincarnation.karmaBad = (reincarnation.karmaBad || 0) + karmaAmount;
            }
        }

        return {
            success: true,
            record: record,
            karmaChange: adjustedAmount,
            currentKarma: {
                good: reincarnation?.karmaGood || 0,
                bad: reincarnation?.karmaBad || 0,
                net: (reincarnation?.karmaGood || 0) - (reincarnation?.karmaBad || 0)
            },
            message: `因果记录：${record.description} (${isGood ? '+' : '-'}${karmaAmount})`
        };
    }

    /**
     * MCP: reincarnation.karma.query
     * 查询当前因果状态
     */
    mcpKarmaQuery(params = {}) {
        const reincarnation = this.gameState?.reincarnation || {};
        const karmaGood = reincarnation.karmaGood || 0;
        const karmaBad = reincarnation.karmaBad || 0;
        const netKarma = karmaGood - karmaBad;

        // 获取最近的行为记录
        const recentRecords = (this.karmaRecords || []).slice(-10);
        
        // 计算因果评价
        const evaluation = this.evaluateOverallKarma(netKarma);
        
        // 获取因果等级
        const karmaLevel = this.getKarmaLevel(netKarma);

        return {
            success: true,
            karma: {
                good: karmaGood,
                bad: karmaBad,
                net: netKarma,
                level: karmaLevel,
                evaluation: evaluation
            },
            recentRecords: recentRecords.map(r => ({
                type: r.type,
                action: r.action,
                amount: r.amount,
                description: r.description,
                timestamp: r.timestamp
            })),
            impact: {
                reincarnationBonus: this.calculateKarmaBonus(netKarma),
                tribulationModifier: this.calculateTribulationModifier(netKarma),
                serendipityChance: this.calculateSerendipityChance(netKarma)
            },
            message: `当前因果：${evaluation} (${netKarma})`
        };
    }

    /**
     * MCP: reincarnation.tiandao.record
     * 记录天道功德
     */
    mcpTiandaoRecord(params = {}) {
        const { eventType, merit, description } = params;
        
        if (!eventType) {
            return { success: false, reason: '缺少 eventType 参数' };
        }

        const meritValue = Math.abs(merit || 0);
        
        // 记录天道事件
        const record = {
            id: `tiandao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            eventType: eventType,
            merit: meritValue,
            description: description || this.getDefaultTiandaoDesc(eventType),
            timestamp: Date.now(),
            day: this.gameState?.days || 0,
            realm: this.gameState?.realm || 0
        };

        this.tiandaoRecords.push(record);
        
        // 同步到 gameState（tiandaoRecords已经是引用，不需要再次push）
        if (this.gameState?.reincarnationBook) {
            // tiandaoRecords是reincarnationBook.tiandaoRecords的引用，已经同步
            this.gameState.reincarnationBook.tiandaoMerit = 
                (this.gameState.reincarnationBook.tiandaoMerit || 0) + meritValue;
        }

        return {
            success: true,
            record: record,
            totalMerit: this.gameState?.reincarnationBook?.tiandaoMerit || 0,
            message: `天道记录：${record.description} (+${meritValue}功德)`
        };
    }

    /**
     * MCP: reincarnation.tiandao.bless
     * 天道赐福（获得奖励）
     */
    mcpTiandaoBless(params = {}) {
        const { level, reason } = params;
        const merit = this.gameState?.reincarnationBook?.tiandaoMerit || 0;
        
        // 根据功德值决定赐福等级
        const blessLevel = level || this.determineBlessLevel(merit);
        
        // 赐福配置
        const blessConfig = {
            'SSS': { meritRequired: 1000, effects: ['天选之资', '悟性+50%', '修炼速度+30%', '奇遇+20%'] },
            'SS': { meritRequired: 500, effects: ['天命之人', '悟性+30%', '修炼速度+20%'] },
            'S': { meritRequired: 200, effects: ['福缘深厚', '悟性+20%', '修炼速度+10%'] },
            'A': { meritRequired: 100, effects: ['吉星高照', '悟性+10%'] },
            'B': { meritRequired: 50, effects: ['小有福缘'] },
            'C': { meritRequired: 0, effects: ['普通'] }
        };

        const config = blessConfig[blessLevel] || blessConfig['C'];
        
        if (merit < config.meritRequired) {
            return {
                success: false,
                reason: `功德不足，需要 ${config.meritRequired} 点，当前 ${merit} 点`,
                currentMerit: merit,
                requiredMerit: config.meritRequired
            };
        }

        // 创建赐福记录
        const blessing = {
            id: `bless_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            level: blessLevel,
            effects: config.effects,
            reason: reason || '天道路径上的善行',
            timestamp: Date.now(),
            day: this.gameState?.days || 0,
            meritCost: config.meritRequired
        };

        this.blessings.push(blessing);
        
        // 同步到 gameState（blessings已经是引用，不需要再次push）
        if (this.gameState?.reincarnationBook) {
            // blessings是reincarnationBook.blessings的引用，已经同步
            this.gameState.reincarnationBook.tiandaoMerit -= config.meritRequired;
        }

        // 应用赐福效果
        this.applyBlessingEffects(blessing);

        return {
            success: true,
            blessing: blessing,
            remainingMerit: this.gameState?.reincarnationBook?.tiandaoMerit || 0,
            message: `天道赐福「${blessLevel}级」：${config.effects.join('、')}`
        };
    }

    /**
     * MCP: reincarnation.history.export
     * 导出轮回历史
     */
    mcpHistoryExport(params = {}) {
        const format = params?.format || 'json';
        const includeDetails = params?.includeDetails !== false;
        
        const reincarnation = this.gameState?.reincarnation || {};
        const book = this.gameState?.reincarnationBook || {};
        
        const exportData = {
            meta: {
                exportTime: new Date().toISOString(),
                gameVersion: this.gameState?.gameVersion || 'V226',
                playerName: this.gameState?.player?.name || '修士'
            },
            summary: {
                reincarnationTimes: reincarnation.times || 0,
                totalKarma: (reincarnation.karmaGood || 0) - (reincarnation.karmaBad || 0),
                karmaGood: reincarnation.karmaGood || 0,
                karmaBad: reincarnation.karmaBad || 0,
                tiandaoMerit: book.tiandaoMerit || 0,
                pastLivesCount: reincarnation.pastLives?.length || 0
            },
            reincarnationHistory: reincarnation.pastLives || [],
            karmaRecords: includeDetails ? (book.karmaRecords || []) : [],
            tiandaoRecords: includeDetails ? (book.tiandaoRecords || []) : [],
            blessings: includeDetails ? (book.blessings || []) : []
        };

        if (format === 'json') {
            return {
                success: true,
                data: exportData,
                dataSize: JSON.stringify(exportData).length,
                message: `轮回历史导出成功，共 ${reincarnation.pastLives?.length || 0} 条转世记录`
            };
        } else if (format === 'text') {
            const textReport = this.generateTextReport(exportData);
            return {
                success: true,
                data: textReport,
                message: '文本格式轮回历史'
            };
        }

        return {
            success: false,
            reason: `不支持的格式：${format}`
        };
    }

    // ===== 辅助方法 =====

    /**
     * 获取境界名称
     */
    getRealmName(realm) {
        // 与main.js中的境界定义保持一致
        const realms = ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'];
        return realms[realm] || '未知';
    }

    /**
     * 评估单次因果
     */
    evaluateKarma(karmaBalance) {
        if (karmaBalance >= 500) return '大善';
        if (karmaBalance >= 100) return '善';
        if (karmaBalance >= 0) return '平';
        if (karmaBalance >= -100) return '恶';
        return '大恶';
    }

    /**
     * 评估整体因果
     */
    evaluateOverallKarma(netKarma) {
        if (netKarma >= 1000) return '功德圆满';
        if (netKarma >= 500) return '功德深厚';
        if (netKarma >= 100) return '小有功德';
        if (netKarma >= 0) return '无功无过';
        if (netKarma >= -100) return '有些孽债';
        if (netKarma >= -500) return '罪孽深重';
        return '恶贯满盈';
    }

    /**
     * 获取因果等级
     */
    getKarmaLevel(netKarma) {
        if (netKarma >= 1000) return 'SS';
        if (netKarma >= 500) return 'S';
        if (netKarma >= 200) return 'A';
        if (netKarma >= 50) return 'B';
        if (netKarma >= 0) return 'C';
        return 'D';
    }

    /**
     * 获取因果行为默认描述
     */
    getDefaultKarmaDesc(type, action) {
        const goodDesc = {
            'rescue': '救助生灵',
            'charity': '施舍助人',
            'honest': '诚实守信',
            'medicine': '行医救人',
            'protect': '保护弱者'
        };
        const badDesc = {
            'kill': '杀害生灵',
            'steal': '偷盗抢劫',
            'lie': '欺骗谎言',
            'harm': '伤害他人',
            'betray': '背信弃义'
        };
        
        const desc = action === 'good' ? goodDesc : badDesc;
        return desc[type] || (action === 'good' ? '善行' : '恶行');
    }

    /**
     * 获取天道事件默认描述
     */
    getDefaultTiandaoDesc(eventType) {
        const tiandaoEvents = {
            'breakthrough': '突破境界',
            'fly': '飞升',
            'tribulation': '渡劫成功',
            'merit': '积累功德',
            'serendipity': '奇遇',
            'alchemy': '炼丹成功'
        };
        return tiandaoEvents[eventType] || '天道运行';
    }

    /**
     * 计算因果加成
     */
    calculateKarmaBonus(netKarma) {
        if (netKarma >= 1000) return { type: 'cultivationSpeed', value: 0.3 };
        if (netKarma >= 500) return { type: 'cultivationSpeed', value: 0.2 };
        if (netKarma >= 100) return { type: 'cultivationSpeed', value: 0.1 };
        return { type: 'cultivationSpeed', value: 0 };
    }

    /**
     * 计算天劫难度修正
     */
    calculateTribulationModifier(netKarma) {
        // 功德越高，天劫难度越低
        if (netKarma >= 1000) return -0.3;
        if (netKarma >= 500) return -0.2;
        if (netKarma >= 100) return -0.1;
        if (netKarma < 0) return Math.min(0.5, Math.abs(netKarma) / 1000);
        return 0;
    }

    /**
     * 计算奇遇概率
     */
    calculateSerendipityChance(netKarma) {
        if (netKarma >= 500) return 0.1;
        if (netKarma >= 100) return 0.05;
        return 0;
    }

    /**
     * 确定赐福等级
     */
    determineBlessLevel(merit) {
        if (merit >= 1000) return 'SSS';
        if (merit >= 500) return 'SS';
        if (merit >= 200) return 'S';
        if (merit >= 100) return 'A';
        if (merit >= 50) return 'B';
        return 'C';
    }

    /**
     * 应用赐福效果
     */
    applyBlessingEffects(blessing) {
        // 这里可以添加具体的游戏效果应用逻辑
        // 例如修改 activeEffects、给予物品等
        return blessing;
    }

    /**
     * 生成文本报告
     */
    generateTextReport(data) {
        const lines = [
            '========== 轮回簿天道记录 ==========',
            `导出时间：${data.meta.exportTime}`,
            `玩家：${data.meta.playerName}`,
            `版本：${data.meta.gameVersion}`,
            '',
            '---------- 转世统计 ----------',
            `轮回数：${data.summary.reincarnationTimes}`,
            `因果值：${data.summary.totalKarma} (善${data.summary.karmaGood} / 恶${data.summary.karmaBad})`,
            `天道功德：${data.summary.tiandaoMerit}`,
            '',
            '---------- 转世历史 ----------'
        ];

        for (const life of (data.reincarnationHistory || [])) {
            lines.push(`第${life.times || '?'}世：境界${this.getRealmName(life.realmAtDeath)}，因果${life.karmaBalance || 0}，${life.causeOfDeath || '死因不明'}`);
        }

        lines.push('');
        lines.push('================================');

        return lines.join('\n');
    }
}

// 导出单例和类
export const reincarnationBookService = new ReincarnationBookService();
export { ReincarnationBookService };
export default ReincarnationBookService;