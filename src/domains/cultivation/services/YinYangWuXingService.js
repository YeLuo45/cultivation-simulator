/**
 * YinYangWuXingService.js - 阴阳五行系统
 * V240 Direction B: 阴阳五行系统 - nanobot/ruflo
 * 
 * 提供6个MCP工具:
 * - wuxing.analyze - 分析五行属性
 * - wuxing.balance - 调和阴阳
 * - wuxing.imbue - 灌注元素
 * - wuxing.resonate - 五行共鸣
 * - wuxing.cycle - 驱动五行轮转
 * - wuxing.affinity - 提升元素亲和
 */

import { CultivationService } from './CultivationService.js';

// ===== 常量定义 =====

/**
 * 五行元素
 */
export const FIVE_ELEMENTS = {
    METAL: 'metal',   // 金
    WOOD: 'wood',     // 木
    WATER: 'water',   // 水
    FIRE: 'fire',     // 火
    EARTH: 'earth'    // 土
};

/**
 * 五行相生关系
 * 金生水→水生木→木生火→火生土→土生金
 */
export const WUXING_GENERATION = {
    [FIVE_ELEMENTS.METAL]: FIVE_ELEMENTS.WATER,
    [FIVE_ELEMENTS.WATER]: FIVE_ELEMENTS.WOOD,
    [FIVE_ELEMENTS.WOOD]: FIVE_ELEMENTS.FIRE,
    [FIVE_ELEMENTS.FIRE]: FIVE_ELEMENTS.EARTH,
    [FIVE_ELEMENTS.EARTH]: FIVE_ELEMENTS.METAL
};

/**
 * 五行相克关系
 * 金克木→木克土→土克水→水克火→火克金
 */
export const WUXING_CONQUEST = {
    [FIVE_ELEMENTS.METAL]: FIVE_ELEMENTS.WOOD,
    [FIVE_ELEMENTS.WOOD]: FIVE_ELEMENTS.EARTH,
    [FIVE_ELEMENTS.EARTH]: FIVE_ELEMENTS.WATER,
    [FIVE_ELEMENTS.WATER]: FIVE_ELEMENTS.FIRE,
    [FIVE_ELEMENTS.FIRE]: FIVE_ELEMENTS.METAL
};

/**
 * 阴阳状态
 */
export const YIN_YANG_STATES = {
    BALANCED: 'balanced',     // 平衡
    YIN_EXCESS: 'yin_excess', // 阴盛
    YANG_EXCESS: 'yang_excess', // 阳盛
    DISORDERED: 'disordered'   // 紊乱
};

/**
 * 阴阳五行系统配置
 */
export const YIN_YANG_WUXING_CONFIG = {
    // 阴阳范围
    yinYangRange: { min: 0, max: 100 },
    
    // 失衡阈值 (阴阳差值超过此值视为失衡)
    imbalanceThreshold: 30,
    
    // 五行亲和等级范围
    affinityRange: { min: 0, max: 9 },
    
    // 共鸣消耗灵力
    resonateCost: 100,
    
    // 轮转消耗灵力
    cycleCost: 150,
    
    // 灌注基础消耗
    imbueBaseCost: 50,
    
    // 调和阴阳基础消耗
    balanceBaseCost: 80
};

// ===== MCP工具定义 =====

export const YIN_YANG_WUXING_TOOLS = {
    'wuxing.analyze': {
        name: 'wuxing.analyze',
        description: '分析五行属性，返回阴阳五行状态、五行强度对比、相生相克分析',
        parameters: {
            type: 'object',
            properties: {
                detail: {
                    type: 'boolean',
                    description: '是否显示详细信息'
                }
            }
        }
    },
    'wuxing.balance': {
        name: 'wuxing.balance',
        description: '调和阴阳，平衡体内阴阳之气，修复阴阳失衡状态',
        parameters: {
            type: 'object',
            properties: {
                intensity: {
                    type: 'number',
                    description: '调和强度 (1-10)',
                    minimum: 1,
                    maximum: 10
                }
            }
        }
    },
    'wuxing.imbue': {
        name: 'wuxing.imbue',
        description: '灌注元素，将灵力转化为特定五行元素',
        parameters: {
            type: 'object',
            properties: {
                element: {
                    type: 'string',
                    enum: ['metal', 'wood', 'water', 'fire', 'earth'],
                    description: '要灌注的元素类型'
                },
                amount: {
                    type: 'number',
                    description: '灌注的量'
                }
            },
            required: ['element']
        }
    },
    'wuxing.resonate': {
        name: 'wuxing.resonate',
        description: '五行共鸣，激发五行相生链，增强修炼效率',
        parameters: {
            type: 'object',
            properties: {
                element: {
                    type: 'string',
                    enum: ['metal', 'wood', 'water', 'fire', 'earth'],
                    description: '共鸣起始元素'
                }
            },
            required: ['element']
        }
    },
    'wuxing.cycle': {
        name: 'wuxing.cycle',
        description: '驱动五行轮转，引导五行相生循环，凝聚灵气',
        parameters: {
            type: 'object',
            properties: {
                rounds: {
                    type: 'number',
                    description: '轮转周数 (1-5)',
                    minimum: 1,
                    maximum: 5
                }
            }
        }
    },
    'wuxing.affinity': {
        name: 'wuxing.affinity',
        description: '提升元素亲和，提高对特定五行元素的感应和操控能力',
        parameters: {
            type: 'object',
            properties: {
                element: {
                    type: 'string',
                    enum: ['metal', 'wood', 'water', 'fire', 'earth'],
                    description: '要提升亲和的元素'
                },
                level: {
                    type: 'number',
                    description: '提升等级数 (1-3)',
                    minimum: 1,
                    maximum: 3
                }
            },
            required: ['element']
        }
    }
};

// ===== 服务类 =====

/**
 * 阴阳五行服务类
 */
class YinYangWuXingService {
    constructor(gameState) {
        this.gameState = gameState;
        this.yinYangState = null;
    }

    /**
     * 初始化阴阳五行系统
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 初始化后的游戏状态
     */
    init(gameState) {
        if (!gameState.yinYangWuXing) {
            gameState.yinYangWuXing = {
                // 阴阳值 (0-100, 50为平衡)
                yin: 50,
                yang: 50,
                
                // 五行属性强度
                fiveElements: {
                    metal: 10,
                    wood: 10,
                    water: 10,
                    fire: 10,
                    earth: 10
                },
                
                // 五行亲和等级 (0-9)
                affinity: {
                    metal: 0,
                    wood: 0,
                    water: 0,
                    fire: 0,
                    earth: 0
                },
                
                // 五行轮转状态
                cycleState: {
                    active: false,
                    currentElement: null,
                    rounds: 0,
                    lastCycleTime: null
                },
                
                // 共鸣状态
                resonateState: {
                    active: false,
                    chain: [],
                    bonus: 0
                },
                
                // 历史记录
                history: []
            };
        }
        this.yinYangState = gameState.yinYangWuXing;
        
        // 确保spiritRoot存在
        if (!gameState.spiritRoot) {
            gameState.spiritRoot = {
                type: 'wood',
                tier: 1,
                attributes: {
                    metal: 0,
                    wood: 10,
                    fire: 0,
                    water: 0,
                    earth: 0
                }
            };
        }
        
        return gameState;
    }

    /**
     * 记录历史事件
     */
    recordHistory(action, details) {
        if (!this.yinYangState.history) {
            this.yinYangState.history = [];
        }
        this.yinYangState.history.push({
            action,
            details,
            timestamp: Date.now()
        });
        // 保持历史记录不超过50条
        if (this.yinYangState.history.length > 50) {
            this.yinYangState.history = this.yinYangState.history.slice(-50);
        }
    }

    /**
     * 获取阴阳状态
     */
    getYinYangStatus() {
        const yin = this.yinYangState.yin;
        const yang = this.yinYangState.yang;
        const diff = Math.abs(yin - yang);
        
        let state;
        if (diff <= 10) {
            state = YIN_YANG_STATES.BALANCED;
        } else if (yin > yang) {
            state = YIN_YANG_STATES.YIN_EXCESS;
        } else {
            state = YIN_YANG_STATES.YANG_EXCESS;
        }
        
        return {
            yin,
            yang,
            diff,
            state,
            stateDesc: this.getYinYangStateDesc(state)
        };
    }

    /**
     * 获取阴阳状态描述
     */
    getYinYangStateDesc(state) {
        const descMap = {
            [YIN_YANG_STATES.BALANCED]: '阴阳平衡',
            [YIN_YANG_STATES.YIN_EXCESS]: '阴盛阳衰',
            [YIN_YANG_STATES.YANG_EXCESS]: '阳盛阴衰',
            [YIN_YANG_STATES.DISORDERED]: '阴阳紊乱'
        };
        return descMap[state] || '未知状态';
    }

    /**
     * 获取五行状态
     */
    getFiveElementsStatus() {
        const elements = this.yinYangState.fiveElements;
        const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
        const avg = total / 5;
        
        // 找出最强和最弱元素
        let strongest = { element: null, value: 0 };
        let weakest = { element: null, value: Infinity };
        
        for (const [element, value] of Object.entries(elements)) {
            if (value > strongest.value) {
                strongest = { element, value };
            }
            if (value < weakest.value) {
                weakest = { element, value };
            }
        }
        
        return {
            elements,
            total,
            average: avg.toFixed(1),
            strongest,
            weakest,
            balance: this.calculateFiveElementsBalance(elements)
        };
    }

    /**
     * 计算五行平衡度
     */
    calculateFiveElementsBalance(elements) {
        const values = Object.values(elements);
        const avg = values.reduce((a, b) => a + b, 0) / 5;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / 5;
        const stdDev = Math.sqrt(variance);
        
        // 标准差越小越平衡
        if (stdDev <= 5) return 'balanced';
        if (stdDev <= 15) return 'slight_imbalance';
        if (stdDev <= 30) return 'imbalance';
        return 'severe_imbalance';
    }

    /**
     * 分析五行属性 (wuxing.analyze)
     * @param {Object} params - 参数 { detail: boolean }
     * @returns {Object} 五行分析结果
     */
    analyze(params = {}) {
        const yinYangStatus = this.getYinYangStatus();
        const fiveElementsStatus = this.getFiveElementsStatus();
        
        // 分析相生相克
        const generationAnalysis = this.analyzeGeneration(fiveElementsStatus.elements);
        const conquestAnalysis = this.analyzeConquest(fiveElementsStatus.elements);
        
        const result = {
            success: true,
            action: 'wuxing.analyze',
            yinYang: yinYangStatus,
            fiveElements: {
                status: fiveElementsStatus,
                affinity: this.yinYangState.affinity
            },
            generation: generationAnalysis,
            conquest: conquestAnalysis,
            cultivationBonus: this.calculateCultivationBonus()
        };
        
        if (params.detail) {
            result.detailedAnalysis = {
                spiritRootInfluence: this.getSpiritRootInfluence(),
                recommendedElements: this.getRecommendedElements(),
                warning: this.getWarning()
            };
        }
        
        this.recordHistory('analyze', { yinYang: yinYangStatus.state, fiveElementsBalance: fiveElementsStatus.balance });
        
        return result;
    }

    /**
     * 分析相生关系
     */
    analyzeGeneration(elements) {
        const chains = [];
        
        // 检查每个元素的相生链
        for (const [element, value] of Object.entries(elements)) {
            const generated = WUXING_GENERATION[element];
            if (generated) {
                const generatedValue = elements[generated] || 0;
                const ratio = value > 0 ? (generatedValue / value).toFixed(2) : '0';
                chains.push({
                    from: element,
                    to: generated,
                    fromValue: value,
                    toValue: generatedValue,
                    ratio,
                    healthy: ratio >= 0.5 && ratio <= 2.0
                });
            }
        }
        
        return {
            chains,
            healthyChainCount: chains.filter(c => c.healthy).length,
            totalChainCount: chains.length
        };
    }

    /**
     * 分析相克关系
     */
    analyzeConquest(elements) {
        const conflicts = [];
        
        // 检查每个元素的相克链
        for (const [element, value] of Object.entries(elements)) {
            const conquered = WUXING_CONQUEST[element];
            if (conquered) {
                const conqueredValue = elements[conquered] || 0;
                const ratio = conqueredValue > 0 ? (value / conqueredValue).toFixed(2) : 'inf';
                conflicts.push({
                    from: element,
                    to: conquered,
                    fromValue: value,
                    toValue: conqueredValue,
                    ratio,
                    overwhelming: parseFloat(ratio) > 2.0,
                    suppressed: parseFloat(ratio) < 0.5
                });
            }
        }
        
        return {
            conflicts,
            conflictCount: conflicts.filter(c => c.overwhelming || c.suppressed).length,
            totalConflictCount: conflicts.length
        };
    }

    /**
     * 计算修炼加成
     */
    calculateCultivationBonus() {
        const yinYangStatus = this.getYinYangStatus();
        const fiveElementsStatus = this.getFiveElementsStatus();
        
        let bonus = 0;
        
        // 阴阳平衡加成
        if (yinYangStatus.state === YIN_YANG_STATES.BALANCED) {
            bonus += 20;
        } else if (yinYangStatus.diff > 50) {
            bonus -= 10; // 严重失衡惩罚
        }
        
        // 五行平衡加成
        if (fiveElementsStatus.balance === 'balanced') {
            bonus += 15;
        }
        
        // 亲和力加成
        const totalAffinity = Object.values(this.yinYangState.affinity).reduce((a, b) => a + b, 0);
        bonus += totalAffinity * 2;
        
        return {
            value: bonus,
            description: bonus > 10 ? '大吉' : bonus > 0 ? '吉' : bonus > -5 ? '平' : '凶'
        };
    }

    /**
     * 获取灵根影响
     */
    getSpiritRootInfluence() {
        const spiritRoot = this.gameState.spiritRoot;
        if (!spiritRoot) return null;
        
        return {
            type: spiritRoot.type,
            tier: spiritRoot.tier,
            attributes: spiritRoot.attributes || {},
            influence: {
                element: spiritRoot.type,
                bonus: spiritRoot.tier * 5
            }
        };
    }

    /**
     * 获取推荐元素
     */
    getRecommendedElements() {
        const fiveElements = this.yinYangState.fiveElements;
        const affinity = this.yinYangState.affinity;
        
        // 基于亲和力和当前强度推荐
        const recommendations = [];
        
        for (const element of Object.keys(fiveElements)) {
            const currentStrength = fiveElements[element];
            const affinityLevel = affinity[element];
            
            if (affinityLevel >= 5) {
                recommendations.push({ element, reason: '高亲和', priority: 'high' });
            } else if (currentStrength < 15) {
                recommendations.push({ element, reason: '属性偏弱', priority: 'medium' });
            }
        }
        
        return recommendations;
    }

    /**
     * 获取警告信息
     */
    getWarning() {
        const warnings = [];
        
        const yinYangStatus = this.getYinYangStatus();
        if (yinYangStatus.diff > 40) {
            warnings.push('阴阳严重失衡，建议立即调和');
        }
        
        const fiveElementsStatus = this.getFiveElementsStatus();
        if (fiveElementsStatus.balance === 'severe_imbalance') {
            warnings.push('五行严重失衡，修炼效率大幅下降');
        }
        
        // 检查相克压制
        const conquest = this.analyzeConquest(fiveElementsStatus.elements);
        const suppressed = conquest.conflicts.filter(c => c.suppressed);
        if (suppressed.length > 0) {
            const elements = suppressed.map(c => c.to);
            warnings.push(`${elements.join(', ')}属性被严重压制`);
        }
        
        return warnings;
    }

    /**
     * 调和阴阳 (wuxing.balance)
     * @param {Object} params - 参数 { intensity: 1-10 }
     * @returns {Object} 调和结果
     */
    balance(params = {}) {
        const intensity = params.intensity || 5;
        const cost = YIN_YANG_WUXING_CONFIG.balanceBaseCost * intensity;
        
        // 检查灵力是否足够
        if ((this.gameState.spiritEnergy || 0) < cost) {
            return {
                success: false,
                error: '灵力不足，无法调和阴阳',
                required: cost,
                available: this.gameState.spiritEnergy || 0
            };
        }
        
        const yin = this.yinYangState.yin;
        const yang = this.yinYangState.yang;
        const diff = Math.abs(yin - yang);
        
        // 计算调和量
        const adjustment = Math.min(diff, intensity * 5);
        
        let newYin, newYang;
        if (yin > yang) {
            // 阴盛阳衰，减少阴增加阳
            newYin = Math.max(50, yin - adjustment / 2);
            newYang = Math.min(100, yang + adjustment / 2);
        } else {
            // 阳盛阴衰，减少阳增加阴
            newYang = Math.max(50, yang - adjustment / 2);
            newYin = Math.min(100, yin + adjustment / 2);
        }
        
        // 消耗灵力
        this.gameState.spiritEnergy -= cost;
        
        // 更新状态
        this.yinYangState.yin = Math.round(newYin);
        this.yinYangState.yang = Math.round(newYang);
        
        const newStatus = this.getYinYangStatus();
        
        this.recordHistory('balance', {
            before: { yin, yang },
            after: { yin: this.yinYangState.yin, yang: this.yinYangState.yang },
            cost
        });
        
        return {
            success: true,
            action: 'wuxing.balance',
            result: 'balance_restored',
            before: { yin, yang, diff },
            after: { 
                yin: this.yinYangState.yin, 
                yang: this.yinYangState.yang, 
                diff: Math.abs(this.yinYangState.yin - this.yinYangState.yang)
            },
            cost,
            spiritEnergy: this.gameState.spiritEnergy,
            newState: newStatus.state,
            message: this.getBalanceResultMessage(newStatus)
        };
    }

    /**
     * 获取调和结果消息
     */
    getBalanceResultMessage(status) {
        if (status.state === YIN_YANG_STATES.BALANCED) {
            return '阴阳调和完成，状态大吉';
        } else if (status.diff < 20) {
            return '阴阳趋于平衡，状态改善';
        } else {
            return '阴阳仍有一定偏差，建议继续调和';
        }
    }

    /**
     * 灌注元素 (wuxing.imbue)
     * @param {Object} params - 参数 { element, amount }
     * @returns {Object} 灌注结果
     */
    imbue(params = {}) {
        const element = params.element;
        const amount = params.amount || 10;
        
        // 验证元素
        if (!Object.values(FIVE_ELEMENTS).includes(element)) {
            return {
                success: false,
                error: '无效的元素类型',
                validElements: Object.values(FIVE_ELEMENTS)
            };
        }
        
        // 计算成本 (基于亲和力，亲和越高消耗越低)
        const affinityLevel = this.yinYangState.affinity[element] || 0;
        const costMultiplier = 1 - (affinityLevel * 0.05); // 亲和等级每级减少5%消耗
        const cost = Math.floor(YIN_YANG_WUXING_CONFIG.imbueBaseCost * amount * costMultiplier);
        
        // 检查灵力
        if ((this.gameState.spiritEnergy || 0) < cost) {
            return {
                success: false,
                error: '灵力不足',
                required: cost,
                available: this.gameState.spiritEnergy || 0
            };
        }
        
        // 消耗灵力
        this.gameState.spiritEnergy -= cost;
        
        // 增加元素强度
        const oldValue = this.yinYangState.fiveElements[element];
        this.yinYangState.fiveElements[element] = Math.min(100, oldValue + amount);
        
        // 触发相生 (如果生成元素存在)
        const generatedElement = WUXING_GENERATION[element];
        if (generatedElement && Math.random() > 0.3) { // 70%概率触发相生
            const generatedAmount = Math.floor(amount * 0.3);
            this.yinYangState.fiveElements[generatedElement] = Math.min(
                100, 
                this.yinYangState.fiveElements[generatedElement] + generatedAmount
            );
        }
        
        this.recordHistory('imbue', { element, amount, cost, generated: generatedElement ? { element: generatedElement, amount: Math.floor(amount * 0.3) } : null });
        
        return {
            success: true,
            action: 'wuxing.imbue',
            element,
            amount,
            cost,
            oldValue,
            newValue: this.yinYangState.fiveElements[element],
            affinityBonus: affinityLevel > 0 ? `亲和等级${affinityLevel}，消耗减少${affinityLevel * 5}%` : null,
            generation: generatedElement ? {
                triggered: true,
                element: generatedElement,
                amount: Math.floor(amount * 0.3)
            } : {
                triggered: false
            },
            spiritEnergy: this.gameState.spiritEnergy
        };
    }

    /**
     * 五行共鸣 (wuxing.resonate)
     * @param {Object} params - 参数 { element }
     * @returns {Object} 共鸣结果
     */
    resonate(params = {}) {
        const element = params.element;
        
        // 验证元素
        if (!Object.values(FIVE_ELEMENTS).includes(element)) {
            return {
                success: false,
                error: '无效的元素类型',
                validElements: Object.values(FIVE_ELEMENTS)
            };
        }
        
        // 检查灵力
        const cost = YIN_YANG_WUXING_CONFIG.resonateCost;
        if ((this.gameState.spiritEnergy || 0) < cost) {
            return {
                success: false,
                error: '灵力不足，无法激发共鸣',
                required: cost,
                available: this.gameState.spiritEnergy || 0
            };
        }
        
        // 计算共鸣链 (相生链)
        const chain = this.calculateResonanceChain(element);
        
        // 消耗灵力
        this.gameState.spiritEnergy -= cost;
        
        // 计算加成 (基于链上元素强度)
        let totalBonus = 0;
        for (const ele of chain) {
            const strength = this.yinYangState.fiveElements[ele];
            totalBonus += strength * (1 + this.yinYangState.affinity[ele] * 0.1);
        }
        
        const averageBonus = Math.round(totalBonus / chain.length);
        
        // 应用共鸣加成到修炼
        const cultivationBonus = Math.floor(averageBonus * 0.5);
        this.gameState.cultivationProgress = (this.gameState.cultivationProgress || 0) + cultivationBonus;
        
        // 更新共鸣状态
        this.yinYangState.resonateState = {
            active: true,
            chain,
            bonus: cultivationBonus,
            startTime: Date.now()
        };
        
        this.recordHistory('resonate', { element, chain, bonus: cultivationBonus });
        
        return {
            success: true,
            action: 'wuxing.resonate',
            element,
            chain,
            chainDescription: this.getChainDescription(chain),
            bonus: cultivationBonus,
            cost,
            spiritEnergy: this.gameState.spiritEnergy,
            cultivationProgress: this.gameState.cultivationProgress,
            message: `五行共鸣激发，${chain.join('→')}，修炼效率提升${cultivationBonus}`
        };
    }

    /**
     * 计算共鸣链
     */
    calculateResonanceChain(startElement) {
        const chain = [startElement];
        let current = startElement;
        
        // 沿着相生链前进
        for (let i = 0; i < 4; i++) {
            const next = WUXING_GENERATION[current];
            if (next && chain.length < 5) {
                chain.push(next);
                current = next;
            } else {
                break;
            }
        }
        
        return chain;
    }

    /**
     * 获取共鸣链描述
     */
    getChainDescription(chain) {
        const elementNames = {
            metal: '金',
            wood: '木',
            water: '水',
            fire: '火',
            earth: '土'
        };
        return chain.map(e => elementNames[e]).join(' → ');
    }

    /**
     * 驱动五行轮转 (wuxing.cycle)
     * @param {Object} params - 参数 { rounds: 1-5 }
     * @returns {Object} 轮转结果
     */
    cycle(params = {}) {
        const rounds = params.rounds || 1;
        
        // 验证周数
        if (rounds < 1 || rounds > 5) {
            return {
                success: false,
                error: '轮转周数必须在1-5之间'
            };
        }
        
        // 计算成本
        const cost = YIN_YANG_WUXING_CONFIG.cycleCost * rounds;
        
        // 检查灵力
        if ((this.gameState.spiritEnergy || 0) < cost) {
            return {
                success: false,
                error: '灵力不足，无法驱动轮转',
                required: cost,
                available: this.gameState.spiritEnergy || 0
            };
        }
        
        // 获取起始元素 (当前最弱元素或随机)
        const elements = this.yinYangState.fiveElements;
        let startElement = Object.entries(elements).reduce(
            (min, [ele, val]) => val < min.value ? { element: ele, value: val } : min,
            { element: 'wood', value: Infinity }
        ).element;
        
        // 执行轮转
        const cycleResults = [];
        const chain = [];
        let currentElement = startElement;
        
        for (let i = 0; i < rounds; i++) {
            const strength = elements[currentElement];
            const consumed = Math.floor(strength * 0.1);
            const generated = Math.floor(consumed * 1.5); // 相生产出更多
            
            // 消耗当前元素
            elements[currentElement] = Math.max(1, strength - consumed);
            
            // 相生到下一个元素
            const nextElement = WUXING_GENERATION[currentElement];
            if (nextElement) {
                elements[nextElement] = Math.min(100, elements[nextElement] + generated);
                chain.push({ from: currentElement, to: nextElement, consumed, generated });
            }
            
            cycleResults.push({
                round: i + 1,
                element: currentElement,
                consumed,
                generated,
                nextElement
            });
            
            currentElement = nextElement || currentElement;
        }
        
        // 消耗灵力
        this.gameState.spiritEnergy -= cost;
        
        // 计算总产出
        const totalConsumed = cycleResults.reduce((sum, r) => sum + r.consumed, 0);
        const totalGenerated = cycleResults.reduce((sum, r) => sum + r.generated, 0);
        
        // 灵气凝聚
        const qiGained = Math.floor(totalGenerated * 0.8);
        this.gameState.qi = (this.gameState.qi || 0) + qiGained;
        
        // 更新轮转状态
        this.yinYangState.cycleState = {
            active: true,
            currentElement: startElement,
            rounds,
            lastCycleTime: Date.now()
        };
        
        this.recordHistory('cycle', { startElement, rounds, qiGained, chain });
        
        return {
            success: true,
            action: 'wuxing.cycle',
            startElement,
            rounds,
            chain: chain.map(c => `${c.from}→${c.to}`),
            cycleResults,
            totalConsumed,
            totalGenerated,
            qiGained,
            cost,
            spiritEnergy: this.gameState.spiritEnergy,
            qi: this.gameState.qi,
            message: `五行轮转完成，凝聚灵气+${qiGained}`
        };
    }

    /**
     * 提升元素亲和 (wuxing.affinity)
     * @param {Object} params - 参数 { element, level }
     * @returns {Object} 亲和提升结果
     */
    affinity(params = {}) {
        const element = params.element;
        const level = params.level || 1;
        
        // 验证元素
        if (!Object.values(FIVE_ELEMENTS).includes(element)) {
            return {
                success: false,
                error: '无效的元素类型',
                validElements: Object.values(FIVE_ELEMENTS)
            };
        }
        
        // 验证等级
        if (level < 1 || level > 3) {
            return {
                success: false,
                error: '提升等级必须在1-3之间'
            };
        }
        
        const currentAffinity = this.yinYangState.affinity[element] || 0;
        
        // 检查是否已达上限
        if (currentAffinity >= YIN_YANG_WUXING_CONFIG.affinityRange.max) {
            return {
                success: false,
                error: `${element}亲和已达上限`,
                currentAffinity,
                maxAffinity: YIN_YANG_WUXING_CONFIG.affinityRange.max
            };
        }
        
        // 计算消耗 (亲和等级越高，消耗越大)
        const cost = level * 200 * (1 + currentAffinity * 0.2);
        
        // 检查灵力
        if ((this.gameState.spiritEnergy || 0) < cost) {
            return {
                success: false,
                error: '灵力不足',
                required: Math.floor(cost),
                available: this.gameState.spiritEnergy || 0
            };
        }
        
        // 检查灵石
        const stoneCost = level * 100;
        if ((this.gameState.spiritStones || 0) < stoneCost) {
            return {
                success: false,
                error: '灵石不足',
                required: stoneCost,
                available: this.gameState.spiritStones || 0
            };
        }
        
        // 消耗资源
        this.gameState.spiritEnergy -= Math.floor(cost);
        this.gameState.spiritStones -= stoneCost;
        
        // 提升亲和
        const oldAffinity = this.yinYangState.affinity[element];
        this.yinYangState.affinity[element] = Math.min(
            YIN_YANG_WUXING_CONFIG.affinityRange.max,
            currentAffinity + level
        );
        
        const newAffinity = this.yinYangState.affinity[element];
        
        this.recordHistory('affinity', { element, level, oldAffinity, newAffinity });
        
        return {
            success: true,
            action: 'wuxing.affinity',
            element,
            level,
            oldAffinity,
            newAffinity,
            spiritEnergyCost: Math.floor(cost),
            stoneCost,
            spiritStones: this.gameState.spiritStones,
            spiritEnergy: this.gameState.spiritEnergy,
            message: `${element}亲和提升至${newAffinity}级，灵力消耗${Math.floor(cost)}，灵石消耗${stoneCost}`
        };
    }

    /**
     * 获取MCP工具处理器
     * @param {Object} gameState - 游戏状态
     * @returns {Object} MCP工具处理器映射
     */
    static getMCPHandlers(gameState) {
        const service = new YinYangWuXingService(gameState);
        service.init(gameState);
        
        return {
            'wuxing.analyze': (params) => service.analyze(params || {}),
            'wuxing.balance': (params) => service.balance(params || {}),
            'wuxing.imbue': (params) => service.imbue(params || {}),
            'wuxing.resonate': (params) => service.resonate(params || {}),
            'wuxing.cycle': (params) => service.cycle(params || {}),
            'wuxing.affinity': (params) => service.affinity(params || {})
        };
    }
}

// ===== 导出 =====

export { YinYangWuXingService };
export const createYinYangWuXingService = (gameState) => new YinYangWuXingService(gameState);
export const getYinYangWuXingService = (gameState) => {
    const service = new YinYangWuXingService(gameState);
    service.init(gameState);
    return service;
};