/**
 * Serendipity Entity - 奇遇实体
 * 修炼游戏中的奇遇事件定义
 */

class Serendipity {
    constructor(config) {
        this.id = config.id || Date.now().toString();
        this.type = config.type || 'positive'; // positive/negative/neutral
        this.icon = config.icon || '✨';
        this.minRealm = config.minRealm || 0; // 最低境界要求
        this.condition = config.condition || null; // 触发条件函数
        this.effect = config.effect || null; // 效果函数
        this.name = config.name || '未知奇遇';
        this.description = config.description || '';
    }

    /**
     * 检查奇遇是否可以触发
     */
    canTrigger(gameState) {
        // 检查境界要求
        if (gameState.realm < this.minRealm) {
            return { can: false, reason: '境界不足' };
        }

        // 检查条件函数
        if (this.condition && typeof this.condition === 'function') {
            if (!this.condition(gameState)) {
                return { can: false, reason: '触发条件不满足' };
            }
        }

        return { can: true };
    }

    /**
     * 执行奇遇效果
     */
    execute(gameState) {
        if (!this.effect || typeof this.effect !== 'function') {
            return { success: false, reason: '奇遇效果未定义' };
        }

        try {
            const result = this.effect(gameState);
            return { success: true, result };
        } catch (e) {
            return { success: false, reason: e.message };
        }
    }

    /**
     * 获取奇遇类型名称
     */
    getTypeName() {
        const names = {
            'positive': '吉',
            'negative': '凶',
            'neutral': '平'
        };
        return names[this.type] || '未知';
    }

    /**
     * 获取奇遇类型颜色
     */
    getTypeColor() {
        const colors = {
            'positive': '#00b894',
            'negative': '#d63031',
            'neutral': '#636e72'
        };
        return colors[this.type] || '#636e72';
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            id: this.id,
            type: this.type,
            icon: this.icon,
            minRealm: this.minRealm,
            name: this.name,
            description: this.description
        };
    }
}

/**
 * SerendipityNode - 奇遇DAG节点
 */
class SerendipityNode {
    constructor(id, config) {
        this.id = id;
        this.type = config.type || 'event'; // 'event' | 'choice' | 'reward' | 'gate'
        this.name = config.name || id;
        this.description = config.description || '';
        this.weight = config.weight || 1.0;
        this.prerequisites = config.prerequisites || [];
        this.effects = config.effects || {};
        this.probability = config.probability || 1.0;
        this.icon = config.icon || '✨';
        this.realmRequirement = config.realmRequirement || 0;
        this.status = 'locked'; // 'locked' | 'ready' | 'triggered' | 'completed'
        this.triggerCount = 0;
        this.maxTriggers = config.maxTriggers || Infinity;
    }

    canTrigger(playerState) {
        if (this.status !== 'ready') return false;
        if (this.triggerCount >= this.maxTriggers) return false;
        if (playerState.realm < this.realmRequirement) return false;
        return Math.random() < this.probability;
    }

    serialize() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            description: this.description,
            weight: this.weight,
            prerequisites: this.prerequisites,
            effects: this.effects,
            probability: this.probability,
            icon: this.icon,
            realmRequirement: this.realmRequirement,
            status: this.status,
            triggerCount: this.triggerCount,
            maxTriggers: this.maxTriggers
        };
    }
}

/**
 * SuperNode - 复合节点
 */
class SuperNode {
    constructor(id, nodes) {
        this.id = id;
        this.nodes = nodes;
        this.status = 'idle';
        this.currentNodeIndex = 0;
    }

    get currentNode() {
        return this.nodes[this.currentNodeIndex] || null;
    }

    advance() {
        this.currentNodeIndex++;
        if (this.currentNodeIndex >= this.nodes.length) {
            this.status = 'completed';
        }
    }

    get totalWeight() {
        return this.nodes.reduce((sum, n) => sum + n.weight, 0);
    }
}

// 预定义奇遇事件
const SERENDIPITY_EVENTS = {
    // 正面奇遇
    '古修士传承': {
        type: 'positive',
        icon: '📜',
        minRealm: 2,
        effect: (state) => {
            const rewards = [
                { type: 'spiritStones', value: Math.floor(1000 + Math.random() * 2000) },
                { type: 'technique', value: 1 }
            ];
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            if (reward.type === 'spiritStones') {
                state.spiritStones += reward.value;
                return { title: '古修士传承', text: `获得前辈遗留的 ${reward.value} 灵石！`, effects: [{ type: '灵石', value: reward.value, positive: true }] };
            } else {
                return { title: '古修士传承', text: '获得高阶功法传承！', effects: [{ type: '功法', value: 1, positive: true }] };
            }
        }
    },
    '秘境入口': {
        type: 'positive',
        icon: '🌀',
        minRealm: 0,
        effect: (state) => {
            state.currentEvent = { type: '秘境入口', inProgress: true };
            return { title: '秘境入口', text: '发现一处神秘秘境入口，进入可能获得稀有奖励！', effects: [], showRealmBattle: true };
        }
    },
    '神兽认主': {
        type: 'positive',
        icon: '🦅',
        minRealm: 3,
        effect: (state) => {
            const bonuses = [
                { type: 'attack', value: 0.1 },
                { type: 'defense', value: 0.1 },
                { type: 'cultivate_speed', value: 0.05 }
            ];
            const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
            state.activeEffects[bonus.type] += bonus.value;
            return { title: '神兽认主', text: `神兽与你结缘，${bonus.type === 'attack' ? '攻击' : bonus.type === 'defense' ? '防御' : '修炼速度'}+${Math.round(bonus.value * 100)}%！`, effects: [{ type: bonus.type === 'attack' ? '攻击' : bonus.type === 'defense' ? '防御' : '修炼速度', value: Math.round(bonus.value * 100) + '%', positive: true }] };
        }
    },
    '仙人指路': {
        type: 'positive',
        icon: '🧙',
        minRealm: 0,
        effect: (state) => {
            state.serendipity.serendipityBoostEndDay = state.days + 3;
            state.activeEffects.serendipity_boost = 0.15;
            return { title: '仙人指路', text: '仙人指点，突破成功率+30%，持续3天！', effects: [{ type: '突破成功率', value: '+30%', positive: true }] };
        }
    },
    '灵根觉醒': {
        type: 'positive',
        icon: '✨',
        minRealm: 0,
        effect: (state) => {
            const gain = Math.floor(5 + Math.random() * 10);
            state.activeEffects.cultivate_speed += gain / 1000;
            return { title: '灵根觉醒', text: `灵根资质提升，修炼速度+${gain}%！`, effects: [{ type: '修炼速度', value: gain + '%', positive: true }] };
        }
    },
    '顿悟': {
        type: 'positive',
        icon: '💡',
        minRealm: 0,
        effect: (state) => {
            state.spiritStones += 10000;
            return { title: '顿悟', text: '修炼中顿悟，获得10000灵石！', effects: [{ type: '灵石', value: 10000, positive: true }] };
        }
    },
    // 负面奇遇
    '心魔入侵': {
        type: 'negative',
        icon: '👹',
        minRealm: 3,
        effect: (state) => {
            const loss = Math.floor(state.spiritStones * 0.3);
            state.spiritStones -= loss;
            state.serendipity.luckStatus = 'unlucky';
            state.serendipity.luckEndDay = state.days + 3;
            return { title: '心魔入侵', text: `心魔入侵，损失 ${loss} 灵石，运气-，持续3天！`, effects: [{ type: '灵石', value: -loss, positive: false }] };
        }
    },
    '仇家追杀': {
        type: 'negative',
        icon: '⚔️',
        minRealm: 0,
        condition: (state) => state.combat && state.combat.losses > 0,
        effect: (state) => {
            const loss = Math.floor(state.spiritStones * 0.5);
            state.spiritStones -= loss;
            return { title: '仇家追杀', text: `旧日仇家找上门来，损失 ${loss} 灵石！`, effects: [{ type: '灵石', value: -loss, positive: false }] };
        }
    },
    '魔器诱惑': {
        type: 'negative',
        icon: '🗡️',
        minRealm: 0,
        effect: (state) => {
            state.serendipity.currentEvent = { type: '魔器诱惑', inProgress: true };
            return { title: '魔器诱惑', text: '发现一把散发魔气的武器，装备后每回合扣血！', effects: [], showChoice: true };
        }
    },
    '走火入魔': {
        type: 'negative',
        icon: '💀',
        minRealm: 0,
        condition: (state) => state.cultivationProgress > 1000,
        effect: (state) => {
            if (state.realm > 0) state.realm--;
            state.cultivationProgress = 0;
            state.serendipity.luckStatus = 'unlucky';
            state.serendipity.luckEndDay = state.days + 3;
            return { title: '走火入魔', text: '修炼过度，走火入魔！境界-1，强制休息！', effects: [{ type: '境界', value: -1, positive: false }] };
        }
    },
    '妖兽袭击': {
        type: 'negative',
        icon: '🐺',
        minRealm: 0,
        effect: (state) => {
            state.currentEvent = { type: '妖兽袭击', inProgress: true };
            return { title: '妖兽袭击', text: '遭遇妖兽袭击！', effects: [], showRealmBattle: true, isNegative: true };
        }
    },
    // 中性奇遇
    '乞丐讨缘': {
        type: 'neutral',
        icon: '🙏',
        minRealm: 0,
        effect: (state) => {
            state.serendipity.currentEvent = { type: '乞丐讨缘', inProgress: true, choices: ['施舍100灵石', '不给'] };
            return { title: '乞丐讨缘', text: '路遇乞丐向你讨缘，你会怎么做？', effects: [] };
        }
    },
    '商人交易': {
        type: 'neutral',
        icon: '💰',
        minRealm: 0,
        effect: (state) => {
            const items = ['聚灵丹', '心魔丹', '金髓丹'];
            const item = items[Math.floor(Math.random() * items.length)];
            const cost = Math.floor(100 + Math.random() * 200);
            if (state.spiritStones >= cost) {
                state.spiritStones -= cost;
                addItemToInventory(item, 1);
                return { title: '商人交易', text: `花费 ${cost} 灵石购买了 ${item}！`, effects: [{ type: '灵石', value: -cost, positive: false }, { type: item, value: 1, positive: true }] };
            } else {
                return { title: '商人交易', text: '灵石不足，无法交易！', effects: [] };
            }
        }
    },
    '散修求助': {
        type: 'neutral',
        icon: '👤',
        minRealm: 0,
        effect: (state) => {
            state.serendipity.currentEvent = { type: '散修求助', inProgress: true, choices: ['帮助', '不帮'] };
            return { title: '散修求助', text: '一位散修请求你帮忙，你会帮助吗？', effects: [] };
        }
    }
};

// 奇遇符咒
const SERENDIPITY_TALISMANS = {
    '祥云符': { type: 'consumable', effect: { type: 'serendipity_boost', value: 0.1 }, duration: 1, price: 2000, desc: '奇遇概率+10%，持续1天', icon: '☁️' },
    '避厄符': { type: 'consumable', effect: { type: 'immune_negative', value: 1 }, duration: 1, price: 1500, desc: '免疫下次负面奇遇', icon: '🛡️' },
    '探路符': { type: 'consumable', effect: { type: 'force_realm', value: 1 }, duration: 0, price: 3000, desc: '指定触发"秘境入口"奇遇', icon: '📜' },
    '还童丹': { type: 'consumable', effect: { type: 'convert_demon', value: 1 }, duration: 0, price: 5000, desc: '将魔器转换为正常法宝', icon: '💊' }
};

// 导出
export { Serendipity, SerendipityNode, SuperNode, SERENDIPITY_EVENTS, SERENDIPITY_TALISMANS };