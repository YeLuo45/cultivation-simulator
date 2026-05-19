// domains/cultivation/services/TribulationService.js
// Tribulation domain service - extracted from game.js
// Phase 3 DDD refactoring

import { REALM_REQUIREMENTS, CONFIG } from '../../shared/constants/cultivation.js';

/**
 * TribulationService - handles tribulation logic
 */
export class TribulationService {
  /**
   * Generate default tribulation scene description
   * @param {number} realm - Realm index
   * @param {string} tribType - Tribulation type (thunder, fire, wind, demon, all)
   * @returns {string} Scene description
   */
  getDefaultScene(realm, tribType) {
    const scenes = {
      thunder: [
        '天空骤然暗沉，乌云如墨般压下，电蛇在云层中狂舞，一道道紫色的天雷在云间酝酿，整个世界仿佛都在这股天威下颤抖。',
        '乌云翻滚如潮，雷光如网，天际被撕裂成一片紫白色的光芒海洋。你感到每一根毛发都因这股天威而颤栗。',
        '闷雷从远处滚滚而来，紫色的电弧在云层中穿梭，天劫的威压让你的呼吸都变得困难，但你的道心坚定如铁。'
      ],
      fire: [
        '虚空中燃起幽蓝色的火焰，琉璃色的火舌舔舐着你的肌肤，焚心烧魄的痛楚让你几乎站立不住，但你的意志坚不可摧。',
        '阴火从地底渗出，将周围化为一片火海。那火焰看似美丽，却蕴含着足以焚毁一切的毁灭力量，正向你的位置蔓延。',
        '天地间一片炽热，琉璃阴火在空中形成各种幻象，试图动摇你的心智。你紧守本心，任凭火焰灼烧。'
      ],
      wind: [
        '狂风骤起，飞沙走石，虚空中裂开一道道金色的裂缝。九幽阴风如刀般切割着你的身体，每一缕风都像是在刮骨伐髓。',
        '黑色的旋风从天而降，带着刺骨的寒意和毁灭的力量。风声中似乎夹杂着远古的咆哮，试图撕裂你的灵魂。',
        '狂风呼啸如鬼哭狼嚎，风刃如雨点般向你袭来。你运转灵力护体，却仍感到阵阵刺痛。'
      ],
      demon: [
        '心魔滋生，你的眼前出现无数幻象——过去的执念、内心的恐惧、隐藏的欲望，一一浮现，试图动摇你的道心。',
        '黑暗中有什么东西在窥视着你，那是来自内心深处的心魔。它化为你最熟悉的人的模样，试图诱惑你放弃抵抗。',
        '幻境丛生，你仿佛回到了过去某个难忘的时刻。但你知道这一切都是心魔的伎俩，唯有守住本心才能渡过此劫。'
      ],
      all: [
        '天地变色，五行紊乱。雷、火、风三劫同时降临，加上心魔入侵，这是飞升前最后的考验。你感到前所未有的压力。',
        '五行天劫同时爆发，天地间仿佛陷入了末世浩劫。雷电、阴火、狂风交织在一起，毁灭一切阻挡在前方的障碍。',
        '苍穹裂开，无数异象从中倾泻而下。这是化神飞升的最终劫难，成败就在此一举。你的眼中燃烧着不屈的斗志。'
      ]
    };
    const typeScenes = scenes[tribType] || scenes.thunder;
    return typeScenes[realm % typeScenes.length];
  }

  /**
   * Generate default stage event description
   * @param {number} stageNum - Stage number (0-indexed)
   * @param {string} tribType - Tribulation type
   * @returns {string} Event description
   */
  getDefaultStageEvent(stageNum, tribType) {
    const events = {
      thunder: [
        `第一道天雷从天而降，带着毁灭一切的力量！`,
        `第二道紫雷划破长空，直劈你的天灵盖！`,
        `第三道雷劫更加猛烈，电光刺得你睁不开眼！`,
        `雷云中降下第四道神雷，你全力运转护体灵光！`,
        `第五道天雷蕴含天道意志，你感到骨骼都在颤抖！`,
        `第六道雷劫中夹杂着金色电弧，威力倍增！`,
        `第七道神雷如瀑布般倾泻而下！`,
        `第八道天雷带着天道法则的压制！`,
        `最后一道金色雷劫，代表着天道对你最后的考验！`
      ],
      fire: [
        `琉璃阴火从地底涌出，包围了你的四周！`,
        `第二重火劫，火焰颜色变为深蓝，温度骤升！`,
        `第三重火海中出现了火焰幻兽！`,
        `第四重阴火开始灼烧你的经脉！`,
        `第五重火焰中蕴含着焚尽一切的力量！`,
        `第六重火浪如潮水般向你涌来！`,
        `第七重天火在你头顶凝聚成云！`,
        `第八重烈火焚身，你咬牙坚持！`,
        `最后一道琉璃圣火，考验你的极限！`
      ],
      wind: [
        `九幽阴风从虚空中生成，环绕着你！`,
        `第二重风劫，狂风开始撕扯你的身体！`,
        `第三重风刃如刀，切割着你的皮肤！`,
        `第四重风暴中夹杂着冰霜！`,
        `第五重狂风让你的灵力护罩开始龟裂！`,
        `第六重风劫带着刺骨的寒意！`,
        `第七重风暴开始影响你的心智！`,
        `第八重狂风如鬼哭狼嚎！`,
        `最后一道灭世狂风，考验你的道心！`
      ],
      demon: [
        `心魔初现，黑暗中有什么在注视着你！`,
        `第二重心魔入侵，过去执念浮现！`,
        `第三重幻境中，你看到了曾经的自己！`,
        `第四重心魔化为你最亲的人试图诱惑！`,
        `第五重幻境开始影响你的判断！`,
        `第六重心魔试图瓦解你的信念！`,
        `第七重最痛苦的回忆开始涌现！`,
        `第八重心魔试图让你放弃抵抗！`,
        `最后一道心魔，是你最深处的恐惧！`
      ],
      all: [
        `五行之力开始汇聚，天地变色！`,
        `第二重天劫降下，雷火交织！`,
        `第三重狂风加入，威力剧增！`,
        `第四重心魔开始入侵！`,
        `第五重五行紊乱，你勉力支撑！`,
        `第六重天地之力压制你！`,
        `第七重三劫齐发，危在旦夕！`,
        `第八重极限考验，道心动摇！`,
        `最后一重，五行合一，渡劫成败在此一举！`
      ]
    };
    const typeEvents = events[tribType] || events.thunder;
    return typeEvents[Math.min(stageNum, typeEvents.length - 1)];
  }

  /**
   * Execute tribulation - determine result and apply effects
   * @param {Object} gameState - Game state
   * @param {string} tribKey - Tribulation key
   * @param {Object} tribData - Tribulation data
   * @returns {Object} Result { resultType, message }
   */
  execute(gameState, tribKey, tribData) {
    // Calculate success rate
    let rate = tribData.baseRate;
    rate += (gameState.mindset / 100) * 0.2;
    if (gameState.hasTransmigrationBuff) rate += 0.1;

    const equipped = (gameState.equippedTreasures || []).filter(t => t);
    equipped.forEach(t => {
      if (t.effects) {
        t.effects.forEach(e => {
          if (e.type === '渡劫_damage_reduce') rate += e.value * 0.1;
          if (e.type === 'all_stats') rate += e.value * 0.5;
        });
      }
    });

    const preparations = gameState.tribulation?.preparations || [];
    if (preparations.includes('阵法')) rate += 0.15;
    if (preparations.includes('定神丹')) rate += 0.1;
    if (preparations.includes('祈祷')) rate += 0.1;

    if (gameState.realm === 4) rate -= 0.1;
    if (gameState.realm === 5) rate -= 0.2;

    rate = Math.min(0.95, Math.max(0.05, rate));

    const roll = Math.random();

    if (roll < rate) {
      // Success
      if (roll < rate * 0.5) {
        return { resultType: 'great_success', message: '大成功！天劫洗礼，修为突飞猛进！' };
      }
      return { resultType: 'success', message: '渡过天劫，突破成功！' };
    } else {
      // Failure
      if (roll < 0.3) {
        return { resultType: 'death', message: '渡劫失败，陨落...' };
      }
      return { resultType: 'injury', message: '渡劫失败，身受重伤...' };
    }
  }

  /**
   * Handle great success result
   * @param {Object} gameState - Game state
   * @param {string} tribKey - Tribulation key
   */
  handleGreatSuccess(gameState, tribKey) {
    // Breakthrough success
    gameState.realm++;
    gameState.stage = 0;
    gameState.cultivationProgress = 0;
    gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
    gameState.qi = Math.floor(gameState.qi * 0.5);
    gameState.mindset = Math.min(100, gameState.mindset + 20);
    gameState.hasTransmigrationBuff = false;

    // Tribulation baptism bonus
    gameState.activeEffects.attack = (gameState.activeEffects.attack || 0) + 0.1;
    gameState.activeEffects.defense = (gameState.activeEffects.defense || 0) + 0.1;

    // Record
    if (!gameState.tribulationRecord) gameState.tribulationRecord = [];
    gameState.tribulationRecord.push({
      type: tribKey,
      result: '大成功',
      day: gameState.days
    });

    gameState.tribulation.inProgress = false;

    return {
      newRealm: gameState.realm,
      message: `突破到${CONFIG.realms[gameState.realm]}期！获得天劫洗礼加成！`
    };
  }

  /**
   * Handle success result
   * @param {Object} gameState - Game state
   * @param {string} tribKey - Tribulation key
   */
  handleSuccess(gameState, tribKey) {
    // Breakthrough success
    gameState.realm++;
    gameState.stage = 0;
    gameState.cultivationProgress = 0;
    gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
    gameState.qi = Math.floor(gameState.qi * 0.3);
    gameState.mindset = Math.max(0, gameState.mindset - 5);
    gameState.hasTransmigrationBuff = false;

    // Tribulation baptism bonus (smaller)
    gameState.activeEffects.attack = (gameState.activeEffects.attack || 0) + 0.05;
    gameState.activeEffects.defense = (gameState.activeEffects.defense || 0) + 0.05;

    // Record
    if (!gameState.tribulationRecord) gameState.tribulationRecord = [];
    gameState.tribulationRecord.push({
      type: tribKey,
      result: '成功',
      day: gameState.days
    });

    gameState.tribulation.inProgress = false;

    return {
      newRealm: gameState.realm,
      message: `渡过${tribKey}，突破到${CONFIG.realms[gameState.realm]}期！`
    };
  }

  /**
   * Handle injury result
   * @param {Object} gameState - Game state
   * @param {string} tribKey - Tribulation key
   */
  handleInjury(gameState, tribKey) {
    // Failed but survived
    gameState.qi = Math.floor(gameState.qi * 0.1);
    gameState.mindset = Math.max(0, gameState.mindset - 30);

    // Record
    if (!gameState.tribulationRecord) gameState.tribulationRecord = [];
    gameState.tribulationRecord.push({
      type: tribKey,
      result: '重伤',
      day: gameState.days
    });

    gameState.tribulation.inProgress = false;

    return {
      message: `渡过${tribKey}失败，身受重伤...`
    };
  }

  /**
   * Handle death result
   * @param {Object} gameState - Game state
   * @param {string} tribKey - Tribulation key
   */
  handleDeath(gameState, tribKey) {
    // Keep 10% resources
    const keepStones = Math.floor((gameState.spiritStones || 0) * 0.1);
    const keepPills = (gameState.inventory || []).filter(item =>
      item.name === '聚灵丹'
    ).slice(0, 2);

    // Reset state
    gameState.realm = 1;
    gameState.stage = 0;
    gameState.qi = 50;
    gameState.maxQi = 100;
    gameState.spiritStones = keepStones;
    gameState.inventory = keepPills;
    gameState.mindset = 50;
    gameState.days = 1;
    gameState.cultivationProgress = 0;
    gameState.hasTransmigrationBuff = true;
    gameState.tribulation.inProgress = false;

    // Record
    if (!gameState.tribulationRecord) gameState.tribulationRecord = [];
    gameState.tribulationRecord.push({
      type: tribKey,
      result: '陨落',
      day: gameState.days
    });

    return {
      message: '渡劫失败，陨落了...但转世重修，获得转世buff！'
    };
  }
}

export const tribulationService = new TribulationService();
export default tribulationService;
