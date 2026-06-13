/**
 * SerendipityService.js - 仙缘奇遇+随机事件
 * V258: 仙缘奇遇+随机事件
 */

export const EVENT_RARITIES = { 凡品: 1, 珍品: 2, 极品: 3, 天赐: 4 };
export const EVENT_TYPES = ['奇遇', '遗迹', '前辈遗泽', '妖兽巢穴', '秘境入口', '天降异宝'];

let _instance = null;

export function createSerendipityService(gameState) {
  if (_instance) return _instance;
  _instance = new SerendipityService(gameState);
  return _instance;
}

class SerendipityService {
  constructor(gameState) {
    this.gameState = gameState;
    this._ensure();
  }

  _ensure() {
    if (!this.gameState.serendipity) {
      this.gameState.serendipity = {
        eventHistory: [],
        choices: {},
        cooldowns: {},
        luckModifier: 0
      };
    }
  }

  /**
   * 触发仙缘事件
   */
  triggerEvent() {
    const player = this.gameState.player;
    if (!player) return { success: false, message: '玩家数据不存在' };

    const luck = (player.luck || 0) + this.gameState.serendipity.luckModifier;
    const triggerChance = 0.1 + luck * 0.01;

    if (Math.random() > triggerChance) {
      return { success: false, message: '今日无缘，静待明日' };
    }

    const rarityRoll = Math.random();
    let rarity;
    if (rarityRoll < 0.05) rarity = '天赐';
    else if (rarityRoll < 0.20) rarity = '极品';
    else if (rarityRoll < 0.50) rarity = '珍品';
    else rarity = '凡品';

    const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const event = this._generateEvent(type, rarity);
    event.id = `evt_${Date.now()}`;
    event.triggeredAt = Date.now();

    this.gameState.serendipity.eventHistory.push(event);

    return {
      success: true,
      event,
      message: `触发${rarity}级${type}：「${event.name}」`
    };
  }

  _generateEvent(type, rarity) {
    const templates = {
      '奇遇': {
        '天赐': { name: '洞天福地', desc: '发现一处隐秘洞天，获得前辈传承', rewards: { exp: 50000, spiritStones: 10000 } },
        '极品': { name: '古修遗府', desc: '发现古修遗留宝物', rewards: { exp: 10000, spiritStones: 3000 } },
        '珍品': { name: '灵泉眼', desc: '发现灵泉，修为大进', rewards: { exp: 3000, spiritStones: 1000 } },
        '凡品': { name: '山中老药', desc: '发现一株灵草', rewards: { exp: 500, spiritStones: 200 } }
      },
      '遗迹': {
        '天赐': { name: '上古仙人墓', desc: '发现上古仙人墓葬，获得仙人传承', rewards: { exp: 100000, spiritStones: 50000 } },
        '极品': { name: '先秦炼器坊', desc: '发现先秦炼器坊，获得宝器', rewards: { exp: 20000, spiritStones: 8000 } },
        '珍品': { name: '古修士闭关所', desc: '发现古修士闭关所', rewards: { exp: 5000, spiritStones: 2000 } },
        '凡品': { name: '废弃矿脉', desc: '发现废弃矿脉残余', rewards: { exp: 1000, spiritStones: 500 } }
      },
      '前辈遗泽': {
        '天赐': { name: '大能灌顶', desc: '得到大能灌顶，修为暴涨', rewards: { exp: 200000, realmBreak: true } },
        '极品': { name: '前辈点化', desc: '前辈梦中点化', rewards: { exp: 30000, cultivationSpeed: 0.5 } },
        '珍品': { name: '遗留功法', desc: '获得遗留功法残卷', rewards: { exp: 8000, spiritStones: 1000 } },
        '凡品': { name: '前辈留言', desc: '石碑上刻着前辈留言', rewards: { exp: 500 } }
      },
      '妖兽巢穴': {
        '天赐': { name: '神兽幼崽', desc: '发现神兽幼崽巢穴，获得神兽认主', rewards: { beastId: 'god_beast', beastName: '神兽幼崽' } },
        '极品': { name: '妖兽内丹', desc: '击败妖兽获得内丹', rewards: { exp: 15000, spiritStones: 5000 } },
        '珍品': { name: '妖兽材料', desc: '收集到珍贵妖兽材料', rewards: { exp: 3000, spiritStones: 1000 } },
        '凡品': { name: '妖兽蛋', desc: '捡到一枚妖兽蛋', rewards: { exp: 500, beastEgg: true } }
      },
      '秘境入口': {
        '天赐': { name: '太虚幻境', desc: '进入太虚幻境历练', rewards: { exp: 80000, luck: 10 } },
        '极品': { name: '五行秘境', desc: '发现五行秘境', rewards: { exp: 20000, spiritStones: 3000 } },
        '珍品': { name: '迷雾山谷', desc: '进入迷雾山谷探索', rewards: { exp: 4000, spiritStones: 800 } },
        '凡品': { name: '隐蔽山洞', desc: '发现隐蔽山洞', rewards: { exp: 600, spiritStones: 100 } }
      },
      '天降异宝': {
        '天赐': { name: '先天灵宝', desc: '天降先天灵宝', rewards: { treasure: '先天灵宝', power: 1000 } },
        '极品': { name: '九天雷劫锻', desc: '雷劫锻造仙器', rewards: { treasure: '仙器', power: 500 } },
        '珍品': { name: '陨铁碎片', desc: '获得珍稀陨铁', rewards: { spiritStones: 2000, exp: 2000 } },
        '凡品': { name: '天火残渣', desc: '收集到天火残渣', rewards: { spiritStones: 300, exp: 300 } }
      }
    };

    return { type, rarity, ...templates[type][rarity] };
  }

  /**
   * 处理事件选择
   */
  makeChoice(eventId, choiceIndex) {
    const event = this.gameState.serendipity.eventHistory.find(e => e.id === eventId);
    if (!event) return { success: false, message: '事件不存在' };
    if (this.gameState.serendipity.choices[eventId] !== undefined) {
      return { success: false, message: '已做出选择' };
    }

    const choices = event.choices || [{ index: 0, effect: 'normal' }];
    if (choiceIndex < 0 || choiceIndex >= choices.length) {
      return { success: false, message: '无效选择' };
    }

    this.gameState.serendipity.choices[eventId] = choiceIndex;
    const effect = choices[choiceIndex].effect;
    const player = this.gameState.player;

    switch (effect) {
      case 'good':
        player.exp = (player.exp || 0) + (event.rewards?.exp || 0);
        player.spiritStones = (player.spiritStones || 0) + (event.rewards?.spiritStones || 0);
        break;
      case 'bad':
        player.exp = Math.max(0, (player.exp || 0) - 100);
        break;
      case 'great':
        player.exp = (player.exp || 0) + (event.rewards?.exp || 0) * 2;
        player.spiritStones = (player.spiritStones || 0) + (event.rewards?.spiritStones || 0) * 2;
        break;
    }

    return { success: true, effect, message: `选择了${effect}结果` };
  }

  /**
   * 增加幸运值
   */
  addLuckModifier(amount) {
    this.gameState.serendipity.luckModifier += amount;
    return { success: true, newModifier: this.gameState.serendipity.luckModifier };
  }

  /**
   * 获取历史事件
   */
  getEventHistory(limit = 20) {
    return {
      success: true,
      history: this.gameState.serendipity.eventHistory.slice(-limit)
    };
  }
}

export const SERENDIPITY_TOOLS = [
  { name: 'serendipity.trigger', description: '触发仙缘事件', params: [] },
  { name: 'serendipity.choice', description: '事件选择', params: ['eventId', 'choiceIndex'] },
  { name: 'serendipity.addLuck', description: '增加幸运', params: ['amount'] },
  { name: 'serendipity.history', description: '事件历史', params: ['limit'] }
];