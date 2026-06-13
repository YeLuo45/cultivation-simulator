/**
 * Item Entity - 物品实体
 * 修炼游戏中的物品基础定义
 */

class Item {
    constructor(config) {
        this.id = config.id || Date.now().toString();
        this.name = config.name || '未知物品';
        this.type = config.type || 'material'; // material/pill/treasure/technique/currency
        this.quantity = config.quantity || 1;
        this.quality = config.quality || 'common'; // common/rare/precious/legendary/ultimate
        this.effect = config.effect || {};
        this.desc = config.desc || '';
        this.icon = config.icon || '📦';
        this.price = config.price || 10;
        this.stackable = config.stackable !== undefined ? config.stackable : true;
        this星级 = config.星级 || 1;
        this.grade = config.grade; // for techniques
        this.level = config.level; // for techniques
        this.maxLevel = config.maxLevel; // for techniques
    }

    /**
     * 检查物品是否可堆叠
     */
    canStackWith(other) {
        return this.stackable && this.name === other.name && this.type === other.type;
    }

    /**
     * 获取物品品质颜色
     */
    getQualityColor() {
        const colors = {
            'common': '#aaaaaa',
            'rare': '#00b894',
            'precious': '#6c5ce7',
            'legendary': '#fd79a8',
            'ultimate': '#fdcb6e'
        };
        return colors[this.quality] || colors.common;
    }

    /**
     * 获取物品出售价格
     */
    getSellPrice() {
        const basePrices = {
            'common': 10,
            'rare': 50,
            'precious': 200,
            'legendary': 1000,
            'ultimate': 5000
        };
        return basePrices[this.quality] || 10;
    }

    /**
     * 使用物品
     */
    use(gameState) {
        switch (this.type) {
            case 'pill':
                return this.usePill(gameState);
            case 'treasure':
                return this.equip(gameState);
            default:
                return { success: false, reason: '此物品无法使用' };
        }
    }

    /**
     * 使用丹药
     */
    usePill(gameState) {
        if (this.type !== 'pill') {
            return { success: false, reason: '不是丹药类型' };
        }
        
        if (!this.effect || !this.effect.type) {
            return { success: false, reason: '丹药效果配置错误' };
        }

        switch (this.effect.type) {
            case 'qi':
                gameState.qi = Math.min(gameState.maxQi, gameState.qi + this.effect.value);
                break;
            case 'mindset':
                gameState.mindset = Math.min(100, gameState.mindset + this.effect.value);
                break;
            case 'breakthrough_boost':
            case 'cultivate_speed':
            case '渡劫_mindset_protect':
                gameState.activeEffects[this.effect.type] += this.effect.value;
                break;
            default:
                return { success: false, reason: '未知的丹药效果类型' };
        }

        return { success: true, effect: this.effect };
    }

    /**
     * 装备宝物
     */
    equip(gameState) {
        if (this.type !== 'treasure') {
            return { success: false, reason: '不是宝物类型' };
        }

        // 查找空槽位
        const emptySlot = gameState.equippedTreasures?.findIndex(t => t === null);
        if (emptySlot === -1) {
            return { success: false, reason: '装备栏已满' };
        }

        // 装备到槽位
        gameState.equippedTreasures[emptySlot] = {
            name: this.name,
            type: this.type,
            quality: this.quality,
            effect: this.effect,
            desc: this.desc,
            icon: this.icon,
            star: this.星级
        };

        return { success: true, slot: emptySlot };
    }

    /**
     * 序列化物品数据
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            quantity: this.quantity,
            quality: this.quality,
            effect: this.effect,
            desc: this.desc,
            icon: this.icon,
            price: this.price,
            stackable: this.stackable,
            star: this.星级,
            grade: this.grade,
            level: this.level,
            maxLevel: this.maxLevel
        };
    }

    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
        return new Item(data);
    }
}

// 物品类型常量
const ITEM_TYPES = {
    MATERIAL: 'material',
    PILL: 'pill',
    TREASURE: 'treasure',
    TECHNIQUE: 'technique',
    CURRENCY: 'currency',
    ACCESSORY: 'accessory'
};

// 品质等级常量
const ITEM_QUALITIES = {
    COMMON: 'common',
    RARE: 'rare',
    PRECIOUS: 'precious',
    LEGENDARY: 'legendary',
    ULTIMATE: 'ultimate'
};

// 导出
export { Item, ITEM_TYPES, ITEM_QUALITIES };