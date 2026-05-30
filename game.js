/* Cultivation Simulator DDD-v1.0.0-9dffcad-2026-05-30T15-17-09-916Z */
var CultivationSimulator = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/domains/cultivation/entities/CultivationEntity.js
  var CultivationEntity_exports = {};
  __export(CultivationEntity_exports, {
    CultivationEntity: () => CultivationEntity
  });
  var CultivationEntity;
  var init_CultivationEntity = __esm({
    "src/domains/cultivation/entities/CultivationEntity.js"() {
      CultivationEntity = class {
        constructor(data = {}) {
          this.realm = data.realm || 0;
          this.stage = data.stage || 0;
          this.cultivationProgress = data.cultivationProgress || 0;
          this.maxCultivationProgress = data.maxCultivationProgress || 100;
          this.cultivationXP = data.cultivationXP || 0;
          this.spiritEnergy = data.spiritEnergy || 0;
          this.maxSpiritEnergy = data.maxSpiritEnergy || 100;
          this.qi = data.qi || 0;
          this.tribulation = data.tribulation || {
            active: false,
            targetRealm: null,
            realmName: "",
            phase: "idle",
            // idle, lightning, demon, complete
            strikesTotal: 0,
            strikesCurrent: 0,
            damageAccumulated: 0,
            resistedAccumulated: 0,
            success: null
          };
          this.tribulationRecord = data.tribulationRecord || [];
          this.blessings = data.blessings || [];
          this.cultivationSpeed = data.cultivationSpeed || 1;
          this.breakthroughBonus = data.breakthroughBonus || 0;
          this.isMeditating = data.isMeditating || false;
          this.lastMeditationTime = data.lastMeditationTime || null;
        }
        /**
         * 获取当前境界名称
         */
        getRealmName() {
          const REALMS4 = ["\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347"];
          return REALMS4[this.realm] || "\u51E1\u4EBA";
        }
        /**
         * 获取当前小境界名称
         */
        getStageName() {
          const STAGES4 = ["\u521D\u671F", "\u4E2D\u671F", "\u540E\u671F"];
          return STAGES4[this.stage] || "\u521D\u671F";
        }
        /**
         * 获取完整境界名称
         */
        getFullRealmName() {
          return `${this.getRealmName()}${this.getStageName()}`;
        }
        /**
         * 获取境界倍率
         */
        getRealmMultiplier() {
          const multipliers = [1, 1.5, 2, 3, 5];
          return multipliers[this.realm] || 1;
        }
        /**
         * 是否可以突破
         */
        canBreakthrough() {
          return this.cultivationProgress >= this.maxCultivationProgress && this.realm < 5;
        }
        /**
         * 是否正在进行天劫
         */
        isInTribulation() {
          return this.tribulation && this.tribulation.active;
        }
        /**
         * 获取修炼进度百分比
         */
        getProgressPercentage() {
          return (this.cultivationProgress / this.maxCultivationProgress * 100).toFixed(1);
        }
        /**
         * 天劫抗性率
         */
        getResistanceRate() {
          if (!this.tribulation || this.tribulation.strikesCurrent === 0) {
            return "0%";
          }
          const rate = this.tribulation.resistedAccumulated / this.tribulation.strikesCurrent;
          return (rate * 100).toFixed(1) + "%";
        }
        /**
         * 获取天劫进度
         */
        getTribulationProgress() {
          if (!this.tribulation || !this.tribulation.active) {
            return null;
          }
          return {
            targetRealm: this.tribulation.targetRealm,
            realmName: this.tribulation.realmName,
            phase: this.tribulation.phase,
            progress: `${this.tribulation.strikesCurrent}/${this.tribulation.strikesTotal}`,
            percentage: (this.tribulation.strikesCurrent / this.tribulation.strikesTotal * 100).toFixed(1) + "%",
            resistanceRate: this.getResistanceRate(),
            damageAccumulated: this.tribulation.damageAccumulated,
            success: this.tribulation.success
          };
        }
        /**
         * 获取修炼摘要
         */
        getSummary() {
          return {
            realm: this.realm,
            realmName: this.getRealmName(),
            stage: this.stage,
            stageName: this.getStageName(),
            fullRealmName: this.getFullRealmName(),
            cultivationProgress: this.cultivationProgress,
            maxCultivationProgress: this.maxCultivationProgress,
            progressPercentage: this.getProgressPercentage(),
            spiritEnergy: this.spiritEnergy,
            maxSpiritEnergy: this.maxSpiritEnergy,
            qi: this.qi,
            cultivationXP: this.cultivationXP,
            realmMultiplier: this.getRealmMultiplier(),
            cultivationSpeed: this.cultivationSpeed,
            breakthroughBonus: this.breakthroughBonus,
            isMeditating: this.isMeditating,
            isInTribulation: this.isInTribulation(),
            tribulationProgress: this.getTribulationProgress(),
            canBreakthrough: this.canBreakthrough(),
            blessings: this.blessings,
            tribulationRecord: this.tribulationRecord
          };
        }
        /**
         * 序列化 (用于保存)
         */
        serialize() {
          return {
            realm: this.realm,
            stage: this.stage,
            cultivationProgress: this.cultivationProgress,
            maxCultivationProgress: this.maxCultivationProgress,
            cultivationXP: this.cultivationXP,
            spiritEnergy: this.spiritEnergy,
            maxSpiritEnergy: this.maxSpiritEnergy,
            qi: this.qi,
            tribulation: this.tribulation,
            tribulationRecord: this.tribulationRecord,
            blessings: this.blessings,
            cultivationSpeed: this.cultivationSpeed,
            breakthroughBonus: this.breakthroughBonus,
            isMeditating: this.isMeditating,
            lastMeditationTime: this.lastMeditationTime
          };
        }
      };
    }
  });

  // src/domains/cultivation/entities/SpiritRootEntity.js
  var SpiritRootEntity_exports = {};
  __export(SpiritRootEntity_exports, {
    ROOT_TYPES: () => ROOT_TYPES,
    ROOT_TYPE_NAMES: () => ROOT_TYPE_NAMES,
    SpiritRootEntity: () => SpiritRootEntity,
    TIER_BONUSES: () => TIER_BONUSES,
    TIER_MAP: () => TIER_MAP,
    getTierName: () => getTierName
  });
  function getTierName(tier) {
    return TIER_MAP[tier] || "\u51E1\u54C1";
  }
  var TIER_MAP, ROOT_TYPES, ROOT_TYPE_NAMES, TIER_BONUSES, SpiritRootEntity;
  var init_SpiritRootEntity = __esm({
    "src/domains/cultivation/entities/SpiritRootEntity.js"() {
      TIER_MAP = {
        1: "\u51E1\u54C1",
        2: "\u826F\u54C1",
        3: "\u4E0A\u54C1",
        4: "\u6781\u54C1",
        5: "\u5929\u54C1"
      };
      ROOT_TYPES = ["metal", "wood", "water", "fire", "earth", "all"];
      ROOT_TYPE_NAMES = {
        metal: "\u91D1",
        wood: "\u6728",
        water: "\u6C34",
        fire: "\u706B",
        earth: "\u571F",
        all: "\u5168\u5C5E\u6027"
      };
      TIER_BONUSES = {
        1: {},
        // 凡品 - 无加成
        2: { cultivationSpeed: 10 },
        // 良品 - 修炼速度+10%
        3: { cultivationSpeed: 20, attack: 10 },
        // 上品 - 修炼速度+20%, 攻击+10
        4: { cultivationSpeed: 30, attack: 20, defense: 10 },
        // 极品 - 修炼速度+30%, 攻击+20, 防御+10
        5: { cultivationSpeed: 50, attack: 30, defense: 20, critRate: 15 }
        // 天品 - 修炼速度+50%, 攻击+30, 防御+20, 暴击率+15%
      };
      SpiritRootEntity = class {
        constructor(data = {}) {
          this.type = data.type || "wood";
          this.tier = data.tier || 1;
          this.evolveCount = data.evolveCount || 0;
          this.energy = data.energy || 0;
          this.maxEnergy = data.maxEnergy || 100;
          this.elementalAffinity = data.elementalAffinity || {
            metal: 0,
            wood: 0,
            water: 0,
            fire: 0,
            earth: 0
          };
          this.awakened = data.awakened || false;
          this.awakeningProgress = data.awakeningProgress || 0;
        }
        /**
         * 获取灵根类型中文名
         */
        getTypeName() {
          return ROOT_TYPE_NAMES[this.type] || "\u672A\u77E5";
        }
        /**
         * 获取灵根品级中文名
         */
        getTierName() {
          return TIER_MAP[this.tier] || "\u51E1\u54C1";
        }
        /**
         * 获取灵根完整名称
         */
        getFullName() {
          return `${this.getTierName()}${this.getTypeName()}\u7075\u6839`;
        }
        /**
         * 是否满级
         */
        isMaxTier() {
          return this.tier >= 5;
        }
        /**
         * 获取属性加成
         */
        getBonuses() {
          return TIER_BONUSES[this.tier] || {};
        }
        /**
         * 获取进化所需灵石
         */
        getEvolveCost() {
          return this.tier * 500;
        }
        /**
         * 获取进化后品级名称
         */
        getNextTierName() {
          return TIER_MAP[this.tier + 1] || "\u5DF2\u6EE1\u7EA7";
        }
        /**
         * 获取灵根能量百分比
         */
        getEnergyPercentage() {
          return (this.energy / this.maxEnergy * 100).toFixed(1);
        }
        /**
         * 获取元素亲和力摘要
         */
        getElementalAffinitySummary() {
          return { ...this.elementalAffinity };
        }
        /**
         * 获取灵根摘要
         */
        getSummary() {
          return {
            type: this.type,
            typeName: this.getTypeName(),
            tier: this.tier,
            tierName: getTierName(this.tier),
            fullName: this.getFullName(),
            isMaxTier: this.isMaxTier(),
            bonuses: this.getBonuses(),
            evolveCost: this.getEvolveCost(),
            nextTierName: this.getNextTierName(),
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            energyPercentage: this.getEnergyPercentage(),
            elementalAffinity: this.getElementalAffinitySummary(),
            awakened: this.awakened,
            awakeningProgress: this.awakeningProgress,
            evolveCount: this.evolveCount
          };
        }
        /**
         * 序列化 (用于保存)
         */
        serialize() {
          return {
            type: this.type,
            tier: this.tier,
            evolveCount: this.evolveCount,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            elementalAffinity: { ...this.elementalAffinity },
            awakened: this.awakened,
            awakeningProgress: this.awakeningProgress
          };
        }
      };
    }
  });

  // src/domains/cultivation/services/CultivationService.js
  var CultivationService_exports = {};
  __export(CultivationService_exports, {
    BLESSING_TYPES: () => BLESSING_TYPES,
    CultivationService: () => CultivationService,
    TRIBULATIONS: () => TRIBULATIONS
  });
  var TRIBULATIONS, BLESSING_TYPES, CultivationService;
  var init_CultivationService = __esm({
    "src/domains/cultivation/services/CultivationService.js"() {
      init_CultivationEntity();
      init_SpiritRootEntity();
      TRIBULATIONS = {
        "breakthrough_2": { type: "thunder", desc: "\u7B51\u57FA\u5929\u52AB", damage: 30 },
        "breakthrough_3": { type: "thunder", desc: "\u91D1\u4E39\u5929\u52AB", damage: 50 },
        "breakthrough_4": { type: "thunder", desc: "\u5143\u5A74\u5929\u52AB", damage: 80 },
        "breakthrough_5": { type: "thunder", desc: "\u5316\u795E\u5929\u52AB", damage: 120 },
        "breakthrough_6": { type: "all", desc: "\u98DE\u5347\u5929\u52AB", damage: 200 },
        "demon": { type: "demon", desc: "\u5FC3\u9B54\u52AB", damage: 40 }
      };
      BLESSING_TYPES = {
        strength: { name: "\u5929\u96F7\u6DEC\u4F53", effect: { attack: 10 } },
        defense: { name: "\u91D1\u521A\u62A4\u4F53", effect: { defense: 10 } },
        speed: { name: "\u98CE\u7075\u795D\u798F", effect: { speed: 15 } },
        spirit: { name: "\u51DD\u795E\u8BC0", effect: { spiritEnergy: 20 } },
        luck: { name: "\u9E3F\u8FD0\u5F53\u5934", effect: { luck: 10 } }
      };
      CultivationService = class {
        constructor(gameState3) {
          this.gameState = gameState3;
        }
        /**
         * 获取修炼实体
         */
        getCultivationEntity() {
          return new CultivationEntity({
            realm: this.gameState.realm,
            stage: this.gameState.stage,
            cultivationProgress: this.gameState.cultivationProgress,
            maxCultivationProgress: this.gameState.maxCultivationProgress,
            cultivationXP: this.gameState.cultivationXP,
            spiritEnergy: this.gameState.spiritEnergy,
            maxSpiritEnergy: this.gameState.maxSpiritEnergy,
            qi: this.gameState.qi,
            tribulation: this.gameState.tribulation,
            tribulationRecord: this.gameState.tribulationRecord,
            blessings: this.gameState.blessings,
            cultivationSpeed: this.gameState.cultivationSpeed,
            breakthroughBonus: this.gameState.breakthroughBonus,
            isMeditating: this.gameState.isMeditating,
            lastMeditationTime: this.gameState.lastMeditationTime
          });
        }
        /**
         * 获取灵根实体
         */
        getSpiritRootEntity() {
          return new SpiritRootEntity(this.gameState.spiritRoot || { type: "wood", tier: 1 });
        }
        /**
         * 开始修炼/冥想
         */
        meditate(amount = 10) {
          this.gameState.isMeditating = true;
          this.gameState.lastMeditationTime = Date.now();
          const spiritRoot = this.getSpiritRootEntity();
          const spiritBonus = 1 + (spiritRoot.getBonuses().cultivationSpeed || 0) / 100;
          const realmMultiplier = this.gameState.realmBonus || 1;
          const gained = Math.floor(amount * spiritBonus * realmMultiplier);
          this.gameState.cultivationProgress = (this.gameState.cultivationProgress || 0) + gained;
          this.gameState.spiritEnergy = Math.min(
            (this.gameState.spiritEnergy || 0) + gained,
            this.gameState.maxSpiritEnergy || 100
          );
          const maxProgress = this.gameState.maxRealmProgress || 100;
          if (this.gameState.cultivationProgress >= maxProgress) {
            this.gameState.cultivationProgress = maxProgress;
          }
          return {
            success: true,
            action: "meditate",
            spiritGained: gained,
            cultivationProgress: this.gameState.cultivationProgress,
            spiritEnergy: this.gameState.spiritEnergy,
            canBreakthrough: this.gameState.cultivationProgress >= maxProgress
          };
        }
        /**
         * 尝试突破
         */
        breakthrough() {
          const realm = this.gameState.realm || 0;
          const maxRealm = 5;
          const maxProgress = this.gameState.maxRealmProgress || 100;
          if (this.gameState.cultivationProgress < maxProgress) {
            return {
              success: false,
              action: "breakthrough",
              reason: "\u4FEE\u70BC\u8FDB\u5EA6\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u7A81\u7834",
              cultivationProgress: this.gameState.cultivationProgress,
              required: maxProgress
            };
          }
          if (realm >= maxRealm) {
            return {
              success: false,
              action: "breakthrough",
              reason: "\u5DF2\u8FBE\u6700\u9AD8\u5883\u754C\uFF0C\u65E0\u6CD5\u7EE7\u7EED\u7A81\u7834"
            };
          }
          const targetRealm = realm + 1;
          const REALMS4 = ["\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347"];
          const realmName = REALMS4[targetRealm];
          const strikesTotal = targetRealm * 3;
          this.gameState.tribulation = {
            active: true,
            targetRealm,
            realmName,
            phase: "lightning",
            strikesTotal,
            strikesCurrent: 0,
            damageAccumulated: 0,
            resistedAccumulated: 0,
            success: null
          };
          return {
            success: true,
            action: "breakthrough",
            started: true,
            targetRealm,
            realmName,
            strikesTotal,
            message: `\u5929\u52AB\u964D\u4E34\uFF0C${realmName}\u96F7\u52AB\u5F00\u59CB\uFF01`
          };
        }
        /**
         * 执行天劫 (自动突破)
         */
        executeTribulation() {
          if (!this.gameState.tribulation || !this.gameState.tribulation.active) {
            return { success: false, error: "No active tribulation" };
          }
          const t = this.gameState.tribulation;
          const resistRate = t.strikesCurrent > 0 ? t.resistedAccumulated / t.strikesCurrent : 0;
          const success = resistRate >= 0.5;
          t.phase = "complete";
          t.active = false;
          t.success = success;
          if (success) {
            this.gameState.realm = t.targetRealm;
            this.gameState.cultivationProgress = 0;
            this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + t.targetRealm * 500;
            this.gameState.tribulationRecord = this.gameState.tribulationRecord || [];
            this.gameState.tribulationRecord.push({
              realm: t.targetRealm,
              success: true,
              timestamp: Date.now()
            });
            return {
              success: true,
              action: "tribulation",
              result: "success",
              newRealm: this.gameState.realm,
              realmName: t.realmName,
              resistRate: (resistRate * 100).toFixed(1) + "%"
            };
          } else {
            return {
              success: true,
              action: "tribulation",
              result: "failed",
              resistRate: (resistRate * 100).toFixed(1) + "%",
              message: "\u5929\u52AB\u62B5\u6297\u5931\u8D25\uFF0C\u9700\u8981\u66F4\u5F3A\u7684\u5B9E\u529B"
            };
          }
        }
        /**
         * 记录天劫闪电
         */
        tribulationLightning(damage, resisted = false) {
          if (!this.gameState.tribulation || !this.gameState.tribulation.active) {
            return { error: "No active tribulation" };
          }
          const t = this.gameState.tribulation;
          t.strikesCurrent++;
          t.damageAccumulated += resisted ? 0 : damage;
          t.resistedAccumulated += resisted ? 1 : 0;
          const tribulationComplete = t.strikesCurrent >= t.strikesTotal;
          let success = null;
          if (tribulationComplete) {
            const resistRate = t.resistedAccumulated / t.strikesCurrent;
            success = resistRate >= 0.5;
            t.success = success;
            t.phase = "complete";
            t.active = false;
            if (success) {
              this.gameState.realm = t.targetRealm;
              this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + t.targetRealm * 500;
              this.gameState.tribulationRecord = this.gameState.tribulationRecord || [];
              this.gameState.tribulationRecord.push({
                realm: t.targetRealm,
                success: true,
                timestamp: Date.now()
              });
            }
          }
          return {
            strikeNumber: t.strikesCurrent,
            damage,
            resisted,
            progress: `${t.strikesCurrent}/${t.strikesTotal}`,
            damageAccumulated: t.damageAccumulated,
            tribulationComplete,
            success,
            newRealm: success ? this.gameState.realm : null
          };
        }
        /**
         * 开始天劫 (MCP接口)
         */
        startTribulation(targetRealm = null) {
          const currentRealm = this.gameState.realm || 0;
          const target = targetRealm || currentRealm + 1;
          if (target <= currentRealm) {
            return { success: false, error: "Target realm must be higher than current" };
          }
          if (target > 5) {
            return { success: false, error: "Invalid realm" };
          }
          const REALMS4 = ["\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347"];
          const realmName = REALMS4[target];
          const strikesTotal = target * 3;
          this.gameState.tribulation = {
            active: true,
            targetRealm: target,
            realmName,
            phase: "lightning",
            strikesTotal,
            strikesCurrent: 0,
            damageAccumulated: 0,
            resistedAccumulated: 0,
            success: null
          };
          return {
            success: true,
            targetRealm: target,
            realmName,
            strikesTotal,
            message: `${realmName}\u5929\u52AB\u5F00\u59CB\uFF0C\u5171${strikesTotal}\u9053\u96F7\u52AB`
          };
        }
        /**
         * 获取天劫进度
         */
        getTribulationProgress() {
          const t = this.gameState.tribulation;
          if (!t || !t.active) {
            return { error: "No active tribulation" };
          }
          const progress = (t.strikesCurrent / t.strikesTotal * 100).toFixed(1);
          const resistRate = t.strikesCurrent > 0 ? (t.resistedAccumulated / t.strikesCurrent * 100).toFixed(1) : "0.0";
          return {
            targetRealm: t.targetRealm,
            realmName: t.realmName,
            phase: t.phase,
            progress: `${t.strikesCurrent}/${t.strikesTotal}`,
            percentage: progress + "%",
            resistanceRate: resistRate + "%",
            damageAccumulated: t.damageAccumulated,
            resistedCount: t.resistedAccumulated
          };
        }
        /**
         * 获得祝福
         */
        receiveBlessing(type = "random") {
          const types = Object.keys(BLESSING_TYPES);
          if (type === "random") {
            type = types[Math.floor(Math.random() * types.length)];
          }
          if (!BLESSING_TYPES[type]) {
            return { error: "Invalid blessing type" };
          }
          const blessingInfo = BLESSING_TYPES[type];
          if (this.gameState.blessings && this.gameState.blessings.some((b) => b.type === type)) {
            return { error: "Already have this blessing type" };
          }
          this.gameState.blessings = this.gameState.blessings || [];
          this.gameState.blessings.push({
            type,
            name: blessingInfo.name,
            effect: blessingInfo.effect,
            timestamp: Date.now()
          });
          return {
            success: true,
            blessing: {
              type,
              name: blessingInfo.name,
              effect: blessingInfo.effect
            }
          };
        }
        /**
         * 获取祝福列表
         */
        getBlessings() {
          return {
            total: (this.gameState.blessings || []).length,
            blessings: this.gameState.blessings || []
          };
        }
        /**
         * 灵根进化
         */
        evolveSpiritRoot(rootType = "all") {
          const gs = this.gameState;
          gs.spiritRoot = gs.spiritRoot || { type: "wood", tier: 1 };
          const currentTier = gs.spiritRoot.tier || 1;
          if (currentTier >= 5) {
            return { error: "Spirit root already at max tier" };
          }
          const cost = currentTier * 500;
          if ((gs.spiritStones || 0) < cost) {
            return { success: false, error: "Not enough spirit stones", required: cost, available: gs.spiritStones };
          }
          gs.spiritStones -= cost;
          gs.spiritRoot.tier = currentTier + 1;
          const TIER_MAP3 = { 1: "\u51E1\u54C1", 2: "\u826F\u54C1", 3: "\u4E0A\u54C1", 4: "\u6781\u54C1", 5: "\u5929\u54C1" };
          return {
            success: true,
            newTier: gs.spiritRoot.tier,
            tierName: TIER_MAP3[gs.spiritRoot.tier],
            cost
          };
        }
        /**
         * 查询灵根
         */
        querySpiritRoot(detail = false) {
          const gs = this.gameState;
          gs.spiritRoot = gs.spiritRoot || { type: "wood", tier: 1 };
          const TIER_MAP3 = { 1: "\u51E1\u54C1", 2: "\u826F\u54C1", 3: "\u4E0A\u54C1", 4: "\u6781\u54C1", 5: "\u5929\u54C1" };
          const tier = gs.spiritRoot.tier || 1;
          const result = {
            type: gs.spiritRoot.type,
            tier,
            tierName: TIER_MAP3[tier]
          };
          if (detail) {
            result.attributes = TIER_BONUSES[tier] || {};
            result.evolveCost = tier * 500;
            result.isMaxTier = tier >= 5;
          }
          return result;
        }
        /**
         * 修炼推进 (MCP接口)
         */
        advance(action) {
          switch (action) {
            case "meditate":
              return this.meditate();
            case "breakthrough":
              return this.breakthrough();
            case "tribulation":
              return {
                action: "tribulation",
                success: true,
                message: "Tribulation lightning struck"
              };
            default:
              return { error: `Unknown cultivation action: ${action}` };
          }
        }
        /**
         * 获取修炼状态摘要
         */
        getSummary() {
          const cultivation = this.getCultivationEntity();
          const spiritRoot = this.getSpiritRootEntity();
          return {
            cultivation: cultivation.getSummary(),
            spiritRoot: spiritRoot.getSummary(),
            tribulation: this.getTribulationProgress(),
            blessings: this.getBlessings()
          };
        }
      };
    }
  });

  // src/domains/player/entities/PlayerEntity.js
  var PlayerEntity_exports = {};
  __export(PlayerEntity_exports, {
    PlayerEntity: () => PlayerEntity,
    REALMS: () => REALMS,
    STAGES: () => STAGES,
    STAGE_NAMES: () => STAGE_NAMES
  });
  var REALMS, STAGES, STAGE_NAMES, PlayerEntity;
  var init_PlayerEntity = __esm({
    "src/domains/player/entities/PlayerEntity.js"() {
      REALMS = ["\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347"];
      STAGES = ["\u521D\u671F", "\u4E2D\u671F", "\u540E\u671F"];
      STAGE_NAMES = ["\u51E1\u4EBA", "\u4FEE\u58EB", "\u771F\u4EBA", "\u5929\u541B", "\u5927\u80FD"];
      PlayerEntity = class {
        constructor(data = {}) {
          this.spiritStones = data.spiritStones || 0;
          this.qi = data.qi || 0;
          this.spiritEnergy = data.spiritEnergy || 0;
          this.maxSpiritEnergy = data.maxSpiritEnergy || 100;
          this.cultivationProgress = data.cultivationProgress || 0;
          this.cultivationXP = data.cultivationXP || 0;
          this.realm = data.realm || 0;
          this.stage = data.stage || 0;
          this.level = data.level || 1;
          this.xp = data.xp || 0;
          this.realmProgress = data.realmProgress || 0;
          this.maxRealmProgress = data.maxRealmProgress || 100;
          this.realmBonus = data.realmBonus || 0;
          this.karmaPoints = data.karmaPoints || 0;
          this.reputation = data.reputation || 0;
          this.equipment = data.equipment || {};
          this.items = data.items || [];
          this.talent = data.talent || "normal";
          this.talentLevel = data.talentLevel || 1;
          this.spiritRoot = data.spiritRoot || { type: "wood", tier: 1 };
          this.soul = data.soul || { power: 0, clarity: 0 };
          this.combatStats = data.combatStats || { wins: 0, losses: 0 };
          this.tribulationRecord = data.tribulationRecord || [];
          this.blessings = data.blessings || [];
        }
        /**
         * 获取当前境界名称
         */
        getRealmName() {
          return REALMS[this.realm] || "\u51E1\u4EBA";
        }
        /**
         * 获取当前小境界名称
         */
        getStageName() {
          return STAGES[this.stage] || "\u521D\u671F";
        }
        /**
         * 获取境界名称 (完整)
         */
        getFullRealmName() {
          return `${this.getRealmName()}${this.getStageName()}`;
        }
        /**
         * 获取境界倍率 (境界越高，奖励加成越多)
         */
        getRealmMultiplier() {
          const multipliers = [1, 1.5, 2, 3, 5];
          return multipliers[this.realm] || 1;
        }
        /**
         * 是否达到最高境界
         */
        isMaxRealm() {
          return this.realm >= REALMS.length - 1;
        }
        /**
         * 检查是否可以突破
         */
        canBreakthrough() {
          return this.cultivationProgress >= this.maxRealmProgress && !this.isMaxRealm();
        }
        /**
         * 获取玩家摘要信息
         */
        getSummary() {
          return {
            realm: this.realm,
            realmName: this.getRealmName(),
            stage: this.stage,
            stageName: this.getStageName(),
            fullRealmName: this.getFullRealmName(),
            level: this.level,
            spiritStones: this.spiritStones,
            qi: this.qi,
            spiritEnergy: this.spiritEnergy,
            maxSpiritEnergy: this.maxSpiritEnergy,
            cultivationProgress: this.cultivationProgress,
            cultivationXP: this.cultivationXP,
            realmMultiplier: this.getRealmMultiplier(),
            talent: this.talent,
            spiritRoot: this.spiritRoot,
            isMaxRealm: this.isMaxRealm(),
            canBreakthrough: this.canBreakthrough()
          };
        }
        /**
         * 序列化 (用于保存)
         */
        serialize() {
          return {
            spiritStones: this.spiritStones,
            qi: this.qi,
            spiritEnergy: this.spiritEnergy,
            maxSpiritEnergy: this.maxSpiritEnergy,
            cultivationProgress: this.cultivationProgress,
            cultivationXP: this.cultivationXP,
            realm: this.realm,
            stage: this.stage,
            level: this.level,
            xp: this.xp,
            realmProgress: this.realmProgress,
            maxRealmProgress: this.maxRealmProgress,
            realmBonus: this.realmBonus,
            karmaPoints: this.karmaPoints,
            reputation: this.reputation,
            equipment: this.equipment,
            items: this.items,
            talent: this.talent,
            talentLevel: this.talentLevel,
            spiritRoot: this.spiritRoot,
            soul: this.soul,
            combatStats: this.combatStats,
            tribulationRecord: this.tribulationRecord,
            blessings: this.blessings
          };
        }
      };
    }
  });

  // src/domains/player/services/PlayerService.js
  var PlayerService_exports = {};
  __export(PlayerService_exports, {
    PlayerService: () => PlayerService
  });
  var PlayerEntity2, REALMS2, STAGES2, PlayerService;
  var init_PlayerService = __esm({
    "src/domains/player/services/PlayerService.js"() {
      ({ PlayerEntity: PlayerEntity2, REALMS: REALMS2, STAGES: STAGES2 } = (init_PlayerEntity(), __toCommonJS(PlayerEntity_exports)));
      PlayerService = class {
        constructor(gameState3) {
          this.gameState = gameState3;
        }
        /**
         * 获取游戏状态的玩家实体
         */
        getPlayerEntity() {
          return new PlayerEntity2({
            spiritStones: this.gameState.spiritStones,
            qi: this.gameState.qi,
            spiritEnergy: this.gameState.spiritEnergy,
            maxSpiritEnergy: this.gameState.maxSpiritEnergy,
            cultivationProgress: this.gameState.cultivationProgress,
            cultivationXP: this.gameState.cultivationXP,
            realm: this.gameState.realm,
            stage: this.gameState.stage,
            level: this.gameState.level,
            xp: this.gameState.xp,
            realmProgress: this.gameState.realmProgress,
            maxRealmProgress: this.gameState.maxRealmProgress,
            realmBonus: this.gameState.realmBonus,
            karmaPoints: this.gameState.karmaPoints,
            reputation: this.gameState.reputation,
            equipment: this.gameState.equipment,
            items: this.gameState.items,
            talent: this.gameState.talent,
            talentLevel: this.gameState.talentLevel,
            spiritRoot: this.gameState.spiritRoot,
            soul: this.gameState.soul,
            combatStats: this.gameState.combatStats,
            tribulationRecord: this.gameState.tribulationRecord,
            blessings: this.gameState.blessings
          });
        }
        /**
         * 增加灵石
         */
        addSpiritStones(amount) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          this.gameState.spiritStones = (this.gameState.spiritStones || 0) + amount;
          return {
            success: true,
            added: amount,
            total: this.gameState.spiritStones
          };
        }
        /**
         * 消耗灵石
         */
        spendSpiritStones(amount) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          const current = this.gameState.spiritStones || 0;
          if (current < amount) {
            return { success: false, error: "Not enough spirit stones", required: amount, available: current };
          }
          this.gameState.spiritStones = current - amount;
          return {
            success: true,
            spent: amount,
            remaining: this.gameState.spiritStones
          };
        }
        /**
         * 增加灵气
         */
        addQi(amount) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          this.gameState.qi = (this.gameState.qi || 0) + amount;
          return {
            success: true,
            added: amount,
            total: this.gameState.qi
          };
        }
        /**
         * 消耗灵气
         */
        spendQi(amount) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          const current = this.gameState.qi || 0;
          if (current < amount) {
            return { success: false, error: "Not enough qi", required: amount, available: current };
          }
          this.gameState.qi = current - amount;
          return {
            success: true,
            spent: amount,
            remaining: this.gameState.qi
          };
        }
        /**
         * 增加修炼进度
         */
        addCultivationProgress(amount) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          this.gameState.cultivationProgress = (this.gameState.cultivationProgress || 0) + amount;
          return {
            success: true,
            added: amount,
            total: this.gameState.cultivationProgress
          };
        }
        /**
         * 增加修炼经验
         */
        addCultivationXP(amount) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + amount;
          return {
            success: true,
            added: amount,
            total: this.gameState.cultivationXP
          };
        }
        /**
         * 获取玩家信息
         */
        getPlayerInfo() {
          const player = this.getPlayerEntity();
          return player.getSummary();
        }
        /**
         * 获取玩家状态摘要
         */
        getStateSummary() {
          return {
            realm: this.gameState.realm,
            stage: this.gameState.stage,
            spiritStones: this.gameState.spiritStones || 0,
            qi: this.gameState.qi || 0,
            spiritEnergy: this.gameState.spiritEnergy || 0,
            maxSpiritEnergy: this.gameState.maxSpiritEnergy || 100,
            cultivationProgress: this.gameState.cultivationProgress || 0,
            maxRealmProgress: this.gameState.maxRealmProgress || 100,
            level: this.gameState.level || 1,
            xp: this.gameState.xp || 0,
            combatStats: this.gameState.combatStats || { wins: 0, losses: 0 },
            items: this.gameState.items || [],
            equipment: this.gameState.equipment || {}
          };
        }
        /**
         * 提升境界
         */
        advanceRealm() {
          const currentRealm = this.gameState.realm || 0;
          const maxRealm = REALMS2.length - 1;
          if (currentRealm >= maxRealm) {
            return { success: false, error: "Already at max realm" };
          }
          this.gameState.realm = currentRealm + 1;
          this.gameState.cultivationProgress = 0;
          const bonus = 5 * (this.gameState.realm + 1);
          this.gameState.level = (this.gameState.level || 1) + bonus;
          return {
            success: true,
            newRealm: this.gameState.realm,
            realmName: REALMS2[this.gameState.realm],
            levelGained: bonus,
            newLevel: this.gameState.level
          };
        }
        /**
         * 提升小境界
         */
        advanceStage() {
          const currentStage = this.gameState.stage || 0;
          if (currentStage >= STAGES2.length - 1) {
            return { success: false, error: "Already at max stage" };
          }
          this.gameState.stage = currentStage + 1;
          return {
            success: true,
            newStage: this.gameState.stage,
            stageName: STAGES2[this.gameState.stage]
          };
        }
        /**
         * 提升等级
         */
        addLevel(amount = 1) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          this.gameState.level = (this.gameState.level || 1) + amount;
          return {
            success: true,
            added: amount,
            newLevel: this.gameState.level
          };
        }
        /**
         * 增加声望
         */
        addReputation(amount) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          this.gameState.reputation = (this.gameState.reputation || 0) + amount;
          return {
            success: true,
            added: amount,
            total: this.gameState.reputation
          };
        }
        /**
         * 增加 karma 点数
         */
        addKarmaPoints(amount) {
          if (typeof amount !== "number" || amount <= 0) {
            return { success: false, error: "Invalid amount" };
          }
          this.gameState.karmaPoints = (this.gameState.karmaPoints || 0) + amount;
          return {
            success: true,
            added: amount,
            total: this.gameState.karmaPoints
          };
        }
        /**
         * 添加物品到背包
         */
        addItem(item) {
          if (!item || !item.id) {
            return { success: false, error: "Invalid item" };
          }
          this.gameState.items = this.gameState.items || [];
          this.gameState.items.push({ ...item, id: item.id + "_" + Date.now() });
          return {
            success: true,
            totalItems: this.gameState.items.length
          };
        }
        /**
         * 移除物品
         */
        removeItem(itemId, quantity = 1) {
          const items = this.gameState.items || [];
          let removed = 0;
          for (let i = items.length - 1; i >= 0 && removed < quantity; i--) {
            if (items[i].id === itemId) {
              items.splice(i, 1);
              removed++;
            }
          }
          return {
            success: removed > 0,
            removed,
            remaining: items.length
          };
        }
        /**
         * 获取物品数量
         */
        getItemCount(itemId) {
          const items = this.gameState.items || [];
          return items.filter((item) => item.id === itemId).length;
        }
        /**
         * 更新装备栏
         */
        setEquipment(slot, equipment) {
          this.gameState.equipment = this.gameState.equipment || {};
          this.gameState.equipment[slot] = equipment;
          return {
            success: true,
            slot,
            equipment
          };
        }
        /**
         * 获取装备栏
         */
        getEquipment(slot = null) {
          const equipment = this.gameState.equipment || {};
          if (slot) {
            return equipment[slot] || null;
          }
          return equipment;
        }
        /**
         * 增加战斗胜利
         */
        addWin() {
          this.gameState.combatStats = this.gameState.combatStats || { wins: 0, losses: 0 };
          this.gameState.combatStats.wins++;
          return { success: true, wins: this.gameState.combatStats.wins };
        }
        /**
         * 增加战斗失败
         */
        addLoss() {
          this.gameState.combatStats = this.gameState.combatStats || { wins: 0, losses: 0 };
          this.gameState.combatStats.losses++;
          return { success: true, losses: this.gameState.combatStats.losses };
        }
        /**
         * 重置玩家状态
         */
        reset() {
          this.gameState.spiritStones = 0;
          this.gameState.qi = 0;
          this.gameState.spiritEnergy = 0;
          this.gameState.maxSpiritEnergy = 100;
          this.gameState.cultivationProgress = 0;
          this.gameState.cultivationXP = 0;
          this.gameState.realm = 0;
          this.gameState.stage = 0;
          this.gameState.level = 1;
          this.gameState.xp = 0;
          this.gameState.realmProgress = 0;
          this.gameState.maxRealmProgress = 100;
          this.gameState.realmBonus = 0;
          this.gameState.karmaPoints = 0;
          this.gameState.reputation = 0;
          this.gameState.equipment = {};
          this.gameState.items = [];
          this.gameState.combatStats = { wins: 0, losses: 0 };
          this.gameState.tribulationRecord = [];
          this.gameState.blessings = [];
          return { success: true };
        }
      };
    }
  });

  // src/domains/achievement/entities/Achievement.js
  var Achievement_exports = {};
  __export(Achievement_exports, {
    ACHIEVEMENT_CATEGORY_NAMES: () => ACHIEVEMENT_CATEGORY_NAMES,
    ACHIEVEMENT_POOL: () => ACHIEVEMENT_POOL,
    Achievement: () => Achievement,
    AchievementCategory: () => AchievementCategory,
    AchievementRequirementType: () => AchievementRequirementType,
    AchievementRewardType: () => AchievementRewardType
  });
  var AchievementCategory, AchievementRequirementType, AchievementRewardType, Achievement, ACHIEVEMENT_POOL, ACHIEVEMENT_CATEGORY_NAMES;
  var init_Achievement = __esm({
    "src/domains/achievement/entities/Achievement.js"() {
      AchievementCategory = {
        BEGINNER: "beginner",
        // 入门
        REALM: "realm",
        // 境界
        RESOURCE: "resource",
        // 资源
        BATTLE: "battle",
        // 战斗
        QUEST: "quest",
        // 任务
        ACTIVITY: "activity",
        // 活动
        SOCIAL: "social",
        // 社交
        COLLECTION: "collection"
        // 收集
      };
      AchievementRequirementType = {
        LOGIN: "login",
        // 登录次数
        REALM: "realm",
        // 境界等级
        SPIRIT: "spirit",
        // 灵气数量
        STONE: "stone",
        // 灵石数量
        BATTLE: "battle",
        // 战斗次数
        QUEST: "quest",
        // 任务完成数
        SIGNIN: "signin",
        // 签到天数
        PET: "pet",
        // 宠物相关
        ITEM: "item",
        // 物品相关
        EXPLORE: "explore"
        // 探险相关
      };
      AchievementRewardType = {
        SPIRIT_STONE: "spiritStone",
        REPUTATION: "reputation",
        ITEM: "item",
        TITLE: "title",
        BADGE: "badge",
        SPIRIT: "spirit",
        EXP: "exp"
      };
      Achievement = class _Achievement {
        constructor(data = {}) {
          this.id = data.id || "";
          this.name = data.name || "\u6210\u5C31";
          this.description = data.description || "";
          this.category = data.category || AchievementCategory.BEGINNER;
          this.requirement = data.requirement || { type: AchievementRequirementType.LOGIN, count: 1 };
          this.progress = data.progress || 0;
          this.targetValue = this.requirement.count || this.requirement.amount || this.requirement.level || 1;
          this.completed = data.completed || false;
          this.completedAt = data.completedAt || null;
          this.rewardClaimed = data.rewardClaimed || false;
          this.reward = data.reward || { type: AchievementRewardType.SPIRIT_STONE, amount: 100 };
          this.hidden = data.hidden || false;
          this.icon = data.icon || "trophy";
          this.sortOrder = data.sortOrder || 0;
        }
        /**
         * 更新进度
         */
        updateProgress(value) {
          this.progress = value;
          if (this.progress >= this.targetValue && !this.completed) {
            this.completed = true;
            this.completedAt = (/* @__PURE__ */ new Date()).toISOString();
            return { leveledUp: true, completed: true };
          }
          return { leveledUp: false, completed: false };
        }
        /**
         * 检查是否可领取奖励
         */
        canClaimReward() {
          return this.completed && !this.rewardClaimed;
        }
        /**
         * 领取奖励
         */
        claimReward() {
          if (!this.canClaimReward()) {
            return { success: false, message: "\u5956\u52B1\u4E0D\u53EF\u9886\u53D6" };
          }
          this.rewardClaimed = true;
          return {
            success: true,
            reward: this.reward,
            message: "\u9886\u53D6\u5956\u52B1\u6210\u529F"
          };
        }
        /**
         * 获取进度百分比
         */
        getProgressPercent() {
          if (this.completed) return 100;
          return Math.min(100, Math.floor(this.progress / this.targetValue * 100));
        }
        /**
         * 转换为JSON对象
         */
        toJSON() {
          return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            requirement: this.requirement,
            progress: this.progress,
            targetValue: this.targetValue,
            completed: this.completed,
            completedAt: this.completedAt,
            rewardClaimed: this.rewardClaimed,
            reward: this.reward,
            hidden: this.hidden,
            icon: this.icon,
            sortOrder: this.sortOrder
          };
        }
        /**
         * 从JSON创建实例
         */
        static fromJSON(json) {
          return new _Achievement(json);
        }
      };
      ACHIEVEMENT_POOL = [
        // 入门成就
        { id: "ach_first_login", name: "\u521D\u5165\u4ED9\u9014", description: "\u9996\u6B21\u767B\u5F55\u6E38\u620F", category: AchievementCategory.BEGINNER, requirement: { type: AchievementRequirementType.LOGIN, count: 1 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 100 } },
        { id: "ach_login_7", name: "\u8FDE\u7EED\u767B\u5F55", description: "\u7D2F\u8BA1\u767B\u5F557\u5929", category: AchievementCategory.BEGINNER, requirement: { type: AchievementRequirementType.LOGIN, count: 7 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 200 } },
        { id: "ach_login_30", name: "\u7B7E\u5230\u4E4B\u661F", description: "\u7D2F\u8BA1\u7B7E\u523030\u5929", category: AchievementCategory.BEGINNER, requirement: { type: AchievementRequirementType.SIGNIN, days: 30 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 1e3 } },
        // 境界成就
        { id: "ach_realm_qi", name: "\u70BC\u6C14\u521D\u671F", description: "\u5883\u754C\u8FBE\u5230\u70BC\u6C14\u521D\u671F", category: AchievementCategory.REALM, requirement: { type: AchievementRequirementType.REALM, level: 1 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 200 } },
        { id: "ach_realm_zhu", name: "\u7B51\u57FA\u6210\u529F", description: "\u5883\u754C\u8FBE\u5230\u7B51\u57FA", category: AchievementCategory.REALM, requirement: { type: AchievementRequirementType.REALM, level: 2 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 500 } },
        { id: "ach_realm_jin", name: "\u91D1\u4E39\u5927\u9053", description: "\u5883\u754C\u8FBE\u5230\u91D1\u4E39", category: AchievementCategory.REALM, requirement: { type: AchievementRequirementType.REALM, level: 3 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 1e3 } },
        { id: "ach_realm_yuan", name: "\u5143\u5A74\u7A81\u7834", description: "\u5883\u754C\u8FBE\u5230\u5143\u5A74", category: AchievementCategory.REALM, requirement: { type: AchievementRequirementType.REALM, level: 4 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 2e3 } },
        // 资源成就
        { id: "ach_spirit_1000", name: "\u7075\u6C14\u5145\u88D5", description: "\u7D2F\u8BA1\u83B7\u5F971000\u7075\u6C14", category: AchievementCategory.RESOURCE, requirement: { type: AchievementRequirementType.SPIRIT, amount: 1e3 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 300 } },
        { id: "ach_stone_5000", name: "\u5BCC\u7532\u4E00\u65B9", description: "\u7D2F\u8BA1\u83B7\u5F975000\u7075\u77F3", category: AchievementCategory.RESOURCE, requirement: { type: AchievementRequirementType.STONE, amount: 5e3 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 500 } },
        { id: "ach_stone_50000", name: "\u8170\u7F20\u4E07\u8D2F", description: "\u7D2F\u8BA1\u83B7\u5F9750000\u7075\u77F3", category: AchievementCategory.RESOURCE, requirement: { type: AchievementRequirementType.STONE, amount: 5e4 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 2e3 } },
        // 战斗成就
        { id: "ach_battle_10", name: "\u521D\u8BD5\u950B\u8292", description: "\u5B8C\u621010\u6B21\u6218\u6597", category: AchievementCategory.BATTLE, requirement: { type: AchievementRequirementType.BATTLE, count: 10 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 200 } },
        { id: "ach_battle_50", name: "\u6218\u6597\u8FBE\u4EBA", description: "\u5B8C\u621050\u6B21\u6218\u6597", category: AchievementCategory.BATTLE, requirement: { type: AchievementRequirementType.BATTLE, count: 50 }, reward: { type: AchievementRewardType.REPUTATION, amount: 50 } },
        { id: "ach_battle_100", name: "\u767E\u6218\u767E\u80DC", description: "\u5B8C\u6210100\u6B21\u6218\u6597", category: AchievementCategory.BATTLE, requirement: { type: AchievementRequirementType.BATTLE, count: 100 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 1e3 } },
        // 任务成就
        { id: "ach_quest_5", name: "\u4EFB\u52A1\u8FBE\u4EBA", description: "\u5B8C\u62105\u4E2A\u4EFB\u52A1", category: AchievementCategory.QUEST, requirement: { type: AchievementRequirementType.QUEST, count: 5 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 300 } },
        { id: "ach_quest_20", name: "\u4EFB\u52A1\u5927\u5E08", description: "\u5B8C\u621020\u4E2A\u4EFB\u52A1", category: AchievementCategory.QUEST, requirement: { type: AchievementRequirementType.QUEST, count: 20 }, reward: { type: AchievementRewardType.SPIRIT_STONE, amount: 800 } }
      ];
      ACHIEVEMENT_CATEGORY_NAMES = {
        [AchievementCategory.BEGINNER]: "\u5165\u95E8",
        [AchievementCategory.REALM]: "\u5883\u754C",
        [AchievementCategory.RESOURCE]: "\u8D44\u6E90",
        [AchievementCategory.BATTLE]: "\u6218\u6597",
        [AchievementCategory.QUEST]: "\u4EFB\u52A1",
        [AchievementCategory.ACTIVITY]: "\u6D3B\u52A8",
        [AchievementCategory.SOCIAL]: "\u793E\u4EA4",
        [AchievementCategory.COLLECTION]: "\u6536\u96C6"
      };
    }
  });

  // src/domains/achievement/entities/Badge.js
  var Badge_exports = {};
  __export(Badge_exports, {
    BADGE_EFFECT_TYPES: () => BADGE_EFFECT_TYPES,
    BADGE_POOL: () => BADGE_POOL,
    Badge: () => Badge,
    BadgeRarity: () => BadgeRarity,
    BadgeType: () => BadgeType,
    MAX_EQUIPPED_BADGES: () => MAX_EQUIPPED_BADGES,
    RARITY_COLORS: () => RARITY_COLORS,
    RARITY_NAMES: () => RARITY_NAMES,
    RARITY_ORDER: () => RARITY_ORDER
  });
  var BadgeRarity, RARITY_COLORS, RARITY_NAMES, BadgeType, MAX_EQUIPPED_BADGES, Badge, BADGE_POOL, BADGE_EFFECT_TYPES, RARITY_ORDER;
  var init_Badge = __esm({
    "src/domains/achievement/entities/Badge.js"() {
      BadgeRarity = {
        COMMON: "common",
        // 普通
        UNCOMMON: "uncommon",
        // 不普通
        RARE: "rare",
        // 稀有
        EPIC: "epic",
        // 史诗
        LEGENDARY: "legendary",
        // 传说
        MYTHIC: "mythic"
        // 神级
      };
      RARITY_COLORS = {
        common: "#999999",
        uncommon: "#00ff00",
        rare: "#0066ff",
        epic: "#ff00ff",
        legendary: "#ff8800",
        mythic: "#ffff00"
      };
      RARITY_NAMES = {
        common: "\u666E\u901A",
        uncommon: "\u4E0D\u666E\u901A",
        rare: "\u7A00\u6709",
        epic: "\u53F2\u8BD7",
        legendary: "\u4F20\u8BF4",
        mythic: "\u795E\u7EA7"
      };
      BadgeType = {
        ACHIEVEMENT: "achievement",
        // 成就徽章
        RANK: "rank",
        // 等级徽章
        SPECIAL: "special",
        // 特殊徽章
        SEASON: "season",
        // 赛季徽章
        EVENT: "event"
        // 活动徽章
      };
      MAX_EQUIPPED_BADGES = 3;
      Badge = class _Badge {
        constructor(data = {}) {
          this.id = data.id || "";
          this.name = data.name || "\u5FBD\u7AE0";
          this.description = data.description || "";
          this.type = data.type || BadgeType.ACHIEVEMENT;
          this.rarity = data.rarity || BadgeRarity.COMMON;
          this.color = data.color || RARITY_COLORS[this.rarity] || RARITY_COLORS.common;
          this.effect = data.effect || "";
          this.effectType = data.effectType || "stat_bonus";
          this.effectValue = data.effectValue || 0;
          this.obtained = data.obtained || false;
          this.equipped = data.equipped || false;
          this.obtainedAt = data.obtainedAt || null;
          this.icon = data.icon || "badge";
          this.source = data.source || "";
          this.sourceType = data.sourceType || "achievement";
          this.stats = data.stats || {};
          this.sortOrder = data.sortOrder || 0;
        }
        /**
         * 获取稀有度显示名称
         */
        getRarityName() {
          return RARITY_NAMES[this.rarity] || "\u666E\u901A";
        }
        /**
         * 检查是否可以装备
         */
        canEquip() {
          return this.obtained && !this.equipped;
        }
        /**
         * 检查是否可以卸下
         */
        canUnequip() {
          return this.equipped;
        }
        /**
         * 装备徽章
         */
        equip() {
          if (!this.obtained) {
            return { success: false, message: "\u5FBD\u7AE0\u672A\u83B7\u53D6\uFF0C\u65E0\u6CD5\u88C5\u5907" };
          }
          if (this.equipped) {
            return { success: false, message: "\u5FBD\u7AE0\u5DF2\u88C5\u5907" };
          }
          this.equipped = true;
          return { success: true, message: "\u88C5\u5907\u6210\u529F" };
        }
        /**
         * 卸下徽章
         */
        unequip() {
          if (!this.equipped) {
            return { success: false, message: "\u5FBD\u7AE0\u672A\u88C5\u5907\uFF0C\u65E0\u6CD5\u5378\u4E0B" };
          }
          this.equipped = false;
          return { success: true, message: "\u5378\u4E0B\u6210\u529F" };
        }
        /**
         * 获取装备加成
         */
        getEquippedBonus() {
          if (!this.equipped) return null;
          return {
            effect: this.effect,
            effectType: this.effectType,
            effectValue: this.effectValue,
            stats: this.stats
          };
        }
        /**
         * 转换为JSON对象
         */
        toJSON() {
          return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            rarity: this.rarity,
            color: this.color,
            effect: this.effect,
            effectType: this.effectType,
            effectValue: this.effectValue,
            obtained: this.obtained,
            equipped: this.equipped,
            obtainedAt: this.obtainedAt,
            icon: this.icon,
            source: this.source,
            sourceType: this.sourceType,
            stats: this.stats,
            sortOrder: this.sortOrder
          };
        }
        /**
         * 从JSON创建实例
         */
        static fromJSON(json) {
          return new _Badge(json);
        }
      };
      BADGE_POOL = [
        // 普通徽章
        { id: "badge_first_login", name: "\u521D\u5165\u4ED9\u9014", description: "\u9996\u6B21\u767B\u5F55\u6E38\u620F", rarity: BadgeRarity.COMMON, effect: "\u767B\u5F55\u7075\u77F3+10", effectType: "spirit_bonus", effectValue: 10 },
        { id: "badge_realm_qi", name: "\u70BC\u6C14\u671F\u4FEE\u58EB", description: "\u5883\u754C\u8FBE\u5230\u70BC\u6C14\u671F", rarity: BadgeRarity.COMMON, effect: "\u7075\u6C14\u83B7\u53D6+5%", effectType: "spirit_rate", effectValue: 0.05 },
        // 稀有徽章
        { id: "badge_realm_zhu", name: "\u7B51\u57FA\u671F\u4FEE\u58EB", description: "\u5883\u754C\u8FBE\u5230\u7B51\u57FA\u671F", rarity: BadgeRarity.RARE, effect: "\u7075\u77F3\u83B7\u53D6+5%", effectType: "stone_rate", effectValue: 0.05 },
        { id: "badge_realm_jin", name: "\u91D1\u4E39\u671F\u4FEE\u58EB", description: "\u5883\u754C\u8FBE\u5230\u91D1\u4E39\u671F", rarity: BadgeRarity.RARE, effect: "\u6218\u6597\u5C5E\u6027+10%", effectType: "battle_stat", effectValue: 0.1 },
        { id: "badge_battle_master", name: "\u6218\u6597\u8FBE\u4EBA", description: "\u5B8C\u6210100\u6B21\u6218\u6597", rarity: BadgeRarity.RARE, effect: "\u66B4\u51FB\u7387+5%", effectType: "crit_rate", effectValue: 0.05 },
        { id: "badge_quest_master", name: "\u4EFB\u52A1\u8FBE\u4EBA", description: "\u5B8C\u621050\u4E2A\u4EFB\u52A1", rarity: BadgeRarity.RARE, effect: "\u4EFB\u52A1\u5956\u52B1+10%", effectType: "quest_reward", effectValue: 0.1 },
        { id: "badge_spirit_rich", name: "\u7075\u6C14\u5145\u88D5", description: "\u7D2F\u8BA1\u83B7\u5F971000\u7075\u6C14", rarity: BadgeRarity.RARE, effect: "\u7075\u6C14\u4E0A\u9650+100", effectType: "spirit_cap", effectValue: 100 },
        { id: "badge_wealth", name: "\u5BCC\u7532\u4E00\u65B9", description: "\u7D2F\u8BA1\u83B7\u5F9710000\u7075\u77F3", rarity: BadgeRarity.RARE, effect: "\u5546\u5E97\u6298\u6263+5%", effectType: "shop_discount", effectValue: 0.05 },
        // 史诗徽章
        { id: "badge_realm_yuan", name: "\u5143\u5A74\u671F\u4FEE\u58EB", description: "\u5883\u754C\u8FBE\u5230\u5143\u5A74\u671F", rarity: BadgeRarity.EPIC, effect: "\u4FEE\u70BC\u901F\u5EA6+15%", effectType: "cultivation_speed", effectValue: 0.15 },
        { id: "badge_signin_30", name: "\u7B7E\u5230\u4E4B\u661F", description: "\u7D2F\u8BA1\u7B7E\u523030\u5929", rarity: BadgeRarity.EPIC, effect: "\u6BCF\u65E5\u767B\u5F55\u5956\u52B1\u7FFB\u500D", effectType: "login_double", effectValue: 2 },
        { id: "badge_rare_collector", name: "\u7A00\u6709\u6536\u85CF\u5BB6", description: "\u6536\u96C65\u4E2A\u7A00\u6709\u5FBD\u7AE0", rarity: BadgeRarity.EPIC, effect: "\u7A00\u6709\u5956\u52B1+20%", effectType: "rare_bonus", effectValue: 0.2 },
        // 传说徽章
        { id: "badge_legend", name: "\u4F20\u8BF4\u4FEE\u58EB", description: "\u7D2F\u8BA1\u83B7\u5F9750000\u7075\u77F3", rarity: BadgeRarity.LEGENDARY, effect: "\u5168\u4F53\u5C5E\u6027+20%", effectType: "all_stat", effectValue: 0.2 },
        { id: "badge_arena_king", name: "\u7ADE\u6280\u4E4B\u738B", description: "\u7ADE\u6280\u573A\u6392\u540D\u7B2C\u4E00", rarity: BadgeRarity.LEGENDARY, effect: "PVP\u4F24\u5BB3+30%", effectType: "pvp_damage", effectValue: 0.3 },
        { id: "badge_pet_master", name: "\u9A6D\u517D\u5927\u5E08", description: "\u6536\u96C6\u5168\u90E8\u5BA0\u7269\u7C7B\u578B", rarity: BadgeRarity.LEGENDARY, effect: "\u5BA0\u7269\u5C5E\u6027+25%", effectType: "pet_stat", effectValue: 0.25 },
        // 神级徽章
        { id: "badge_divine_cultivator", name: "\u98DE\u5347\u6210\u4ED9", description: "\u5883\u754C\u8FBE\u5230\u98DE\u5347", rarity: BadgeRarity.MYTHIC, effect: "\u5168\u90E8\u5C5E\u6027+50%", effectType: "all_stat", effectValue: 0.5 },
        { id: "badge_immortal", name: "\u4E0D\u673D\u8005", description: "\u8FDE\u7EED\u767B\u5F55100\u5929", rarity: BadgeRarity.MYTHIC, effect: "\u79BB\u7EBF\u6536\u76CA+100%", effectType: "offline_income", effectValue: 1 }
      ];
      BADGE_EFFECT_TYPES = {
        STAT_BONUS: "stat_bonus",
        SPIRIT_BONUS: "spirit_bonus",
        SPIRIT_RATE: "spirit_rate",
        STONE_RATE: "stone_rate",
        BATTLE_STAT: "battle_stat",
        CRIT_RATE: "crit_rate",
        QUEST_REWARD: "quest_reward",
        SPIRIT_CAP: "spirit_cap",
        SHOP_DISCOUNT: "shop_discount",
        CULTIVATION_SPEED: "cultivation_speed",
        LOGIN_DOUBLE: "login_double",
        RARE_BONUS: "rare_bonus",
        PVP_DAMAGE: "pvp_damage",
        PET_STAT: "pet_stat",
        ALL_STAT: "all_stat",
        OFFLINE_INCOME: "offline_income"
      };
      RARITY_ORDER = {
        common: 1,
        uncommon: 2,
        rare: 3,
        epic: 4,
        legendary: 5,
        mythic: 6
      };
    }
  });

  // src/domains/pet/entities/Pet.js
  var Pet_exports = {};
  __export(Pet_exports, {
    EvolutionStages: () => EvolutionStages,
    PET_RARITY: () => PET_RARITY,
    PET_SPECIES_CONFIG: () => PET_SPECIES_CONFIG,
    PET_TYPES: () => PET_TYPES,
    Pet: () => Pet,
    PetAttributes: () => PetAttributes,
    PetBattleStats: () => PetBattleStats,
    PetForms: () => PetForms,
    RARITY_COLORS: () => RARITY_COLORS2,
    RARITY_POWER_MULT: () => RARITY_POWER_MULT
  });
  var PetAttributes, PetBattleStats, EvolutionStages, PetForms, Pet, PET_TYPES, PET_RARITY, RARITY_COLORS2, RARITY_POWER_MULT, PET_SPECIES_CONFIG;
  var init_Pet = __esm({
    "src/domains/pet/entities/Pet.js"() {
      PetAttributes = {
        id: "",
        // 唯一标识
        name: "",
        // 名称
        species: "",
        // 种类
        level: 1,
        // 等级
        experience: 0,
        // 经验值
        loyalty: 50,
        // 忠诚度
        health: 100,
        // 生命值
        energy: 100,
        // 能量值
        hunger: 0,
        // 饥饿度
        happiness: 100,
        // 快乐度
        active: true,
        // 是否活跃
        capturedAt: null,
        // 捕捉时间
        lastFed: null,
        // 最后喂食时间
        lastPlayed: null
        // 最后互动时间
      };
      PetBattleStats = {
        attack: 10,
        // 攻击力
        defense: 5,
        // 防御力
        speed: 10,
        // 速度
        critRate: 0.05,
        // 暴击率
        critDamage: 1.5,
        // 暴击伤害
        accuracy: 0.9,
        // 命中率
        dodge: 0.1
        // 闪避率
      };
      EvolutionStages = {
        INFANT: 1,
        // 幼生期
        MATURE: 2,
        // 成熟期
        ANCIENT: 3,
        // 远古期
        DIVINE: 4
        // 神化期
      };
      PetForms = {
        CHILD: "child",
        // 幼体
        ADULT: "adult",
        // 成体
        MUTANT: "mutant",
        // 变异体
        DIVINE: "divine"
        // 神体
      };
      Pet = class _Pet {
        constructor(data = {}) {
          this.id = data.id || `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          this.name = data.name || "\u7075\u5BA0";
          this.species = data.species || "\u672A\u77E5";
          this.type = data.type || "normal";
          this.level = data.level || 1;
          this.experience = data.experience || 0;
          this.maxExperience = this.calcMaxExperience();
          this.health = data.health || 100;
          this.maxHealth = data.maxHealth || 100;
          this.energy = data.energy || 100;
          this.maxEnergy = data.maxEnergy || 100;
          this.hunger = data.hunger || 0;
          this.happiness = data.happiness || 100;
          this.loyalty = data.loyalty || 50;
          this.intimacy = data.intimacy || 0;
          this.affinity = data.affinity || 0;
          this.evolutionStage = data.evolutionStage || EvolutionStages.INFANT;
          this.evolveStage = data.evolveStage || 1;
          this.form = data.form || PetForms.CHILD;
          this.attack = data.attack || PetBattleStats.attack;
          this.defense = data.defense || PetBattleStats.defense;
          this.speed = data.speed || PetBattleStats.speed;
          this.power = data.power || 10;
          this.potential = data.potential || Math.floor(Math.random() * 30) + 70;
          this.skills = data.skills || [];
          this.maxSkills = 4;
          this.active = data.active !== void 0 ? data.active : true;
          this.equipped = data.equipped || false;
          this.favorite = data.favorite || false;
          this.capturedAt = data.capturedAt || Date.now();
          this.lastFed = data.lastFed || null;
          this.lastPlayed = data.lastPlayed || null;
          this.lastTrained = data.lastTrained || null;
          this.captureCost = data.captureCost || 0;
          this.rarity = data.rarity || "common";
          this.color = data.color || "#999999";
        }
        /**
         * 计算升级所需最大经验值
         */
        calcMaxExperience() {
          return Math.floor(100 * Math.pow(1.5, this.level - 1));
        }
        /**
         * 添加经验值
         */
        addExperience(exp) {
          this.experience += exp;
          let levelsGained = 0;
          while (this.experience >= this.maxExperience) {
            this.experience -= this.maxExperience;
            this.levelUp();
            levelsGained++;
          }
          this.maxExperience = this.calcMaxExperience();
          return levelsGained;
        }
        /**
         * 升级
         */
        levelUp() {
          this.level++;
          this.maxHealth += 5;
          this.health = Math.min(this.health + 5, this.maxHealth);
          this.attack += 2;
          this.defense += 1;
          this.speed += 1;
        }
        /**
         * 喂食
         */
        feed(foodType = "normal") {
          const FOOD_BONUS = {
            normal: 5,
            basic: 5,
            premium: 15,
            super: 50
          };
          const FOOD_HUNGER_REDUCTION = {
            normal: 10,
            basic: 10,
            premium: 20,
            super: 40
          };
          const bonus = FOOD_BONUS[foodType] || 5;
          this.affinity = (this.affinity || 0) + bonus;
          this.intimacy = Math.min(100, (this.intimacy || 0) + bonus);
          this.hunger = Math.max(0, this.hunger - (FOOD_HUNGER_REDUCTION[foodType] || 10));
          this.lastFed = Date.now();
          return {
            affinityGain: bonus,
            hungerReduction: FOOD_HUNGER_REDUCTION[foodType] || 10
          };
        }
        /**
         * 互动/玩耍
         */
        play() {
          this.happiness = Math.min(100, this.happiness + 10);
          this.loyalty = Math.min(100, this.loyalty + 2);
          this.intimacy = Math.min(100, (this.intimacy || 0) + 3);
          this.energy = Math.max(0, this.energy - 5);
          this.lastPlayed = Date.now();
        }
        /**
         * 训练
         */
        train() {
          if (this.energy < 20) {
            return { success: false, message: "\u80FD\u91CF\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u8BAD\u7EC3" };
          }
          this.energy -= 20;
          this.experience += 10;
          this.attack += 1;
          this.loyalty = Math.min(100, this.loyalty + 1);
          this.lastTrained = Date.now();
          return { success: true, experienceGained: 10 };
        }
        /**
         * 学习技能
         */
        learnSkill(skillId, skillLevel = 1) {
          if (this.skills.length >= this.maxSkills) {
            return { success: false, message: "\u6280\u80FD\u680F\u5DF2\u6EE1\uFF0C\u6700\u591A" + this.maxSkills + "\u4E2A\u6280\u80FD" };
          }
          if (this.skills.some((s) => s.id === skillId)) {
            return { success: false, message: "\u5DF2\u5B66\u4F1A\u8BE5\u6280\u80FD" };
          }
          this.skills.push({
            id: skillId,
            level: skillLevel,
            learnedAt: Date.now()
          });
          return { success: true, skill: this.skills[this.skills.length - 1] };
        }
        /**
         * 升级技能
         */
        upgradeSkill(skillId) {
          const skill = this.skills.find((s) => s.id === skillId);
          if (!skill) {
            return { success: false, message: "\u6280\u80FD\u4E0D\u5B58\u5728" };
          }
          skill.level = (skill.level || 1) + 1;
          return { success: true, skill };
        }
        /**
         * 遗忘技能
         */
        forgetSkill(skillId) {
          const idx = this.skills.findIndex((s) => s.id === skillId);
          if (idx === -1) {
            return { success: false, message: "\u6280\u80FD\u4E0D\u5B58\u5728" };
          }
          this.skills.splice(idx, 1);
          return { success: true, remaining: this.skills.length };
        }
        /**
         * 检查是否可以进化
         */
        canEvolve(targetStage = null) {
          const nextStage = targetStage || this.evolutionStage + 1;
          if (this.evolutionStage >= 3) {
            return { canEvolve: false, reason: "\u5DF2\u8FBE\u6700\u9AD8\u8FDB\u5316\u9636\u6BB5" };
          }
          const levelRequired = 5;
          if (this.level < levelRequired) {
            return { canEvolve: false, reason: "\u7B49\u7EA7\u4E0D\u8DB3\uFF0C\u9700\u8981" + levelRequired + "\u7EA7", levelRequired, currentLevel: this.level };
          }
          const INTIMACY_REQUIRED = { 2: 30, 3: 60, 4: 90 };
          const requiredIntimacy = INTIMACY_REQUIRED[nextStage] || 30;
          if ((this.intimacy || 0) < requiredIntimacy) {
            return { canEvolve: false, reason: "\u4EB2\u5BC6\u5EA6\u4E0D\u8DB3", requiredIntimacy, currentIntimacy: this.intimacy };
          }
          return { canEvolve: true };
        }
        /**
         * 进化
         */
        evolve(targetStage = null) {
          const check = this.canEvolve(targetStage);
          if (!check.canEvolve) {
            return { success: false, ...check };
          }
          const oldLevel = this.level;
          const oldStage = this.evolutionStage;
          const oldForm = this.form;
          this.level += 2;
          this.evolutionStage += 1;
          this.evolveStage = (this.evolveStage || 1) + 1;
          const FORM_ORDER = [PetForms.CHILD, PetForms.ADULT, PetForms.MUTANT, PetForms.DIVINE];
          const currentIdx = FORM_ORDER.indexOf(this.form);
          const targetIdx = Math.min(currentIdx + 1, FORM_ORDER.length - 1);
          this.form = FORM_ORDER[targetIdx];
          this.attack = Math.floor(this.attack * 1.3);
          this.defense = Math.floor(this.defense * 1.3);
          this.speed = Math.floor(this.speed * 1.3);
          return {
            success: true,
            oldLevel,
            newLevel: this.level,
            oldStage,
            newStage: this.evolutionStage,
            oldForm,
            newForm: this.form,
            statsUpgrade: {
              attack: this.attack,
              defense: this.defense,
              speed: this.speed
            }
          };
        }
        /**
         * 设置是否活跃
         */
        setActive(isActive) {
          this.active = isActive;
          if (!isActive) {
            this.releasedAt = Date.now();
          }
        }
        /**
         * 获取战斗力评估
         */
        getBattlePower() {
          const basePower = this.attack * 1.2 + this.defense * 0.8 + this.speed * 0.5;
          const levelBonus = this.level * 5;
          const skillBonus = this.skills.reduce((sum, s) => sum + (s.level || 1) * 10, 0);
          const loyaltyBonus = this.loyalty > 80 ? 1.2 : this.loyalty > 50 ? 1 : 0.8;
          return Math.floor((basePower + levelBonus + skillBonus) * loyaltyBonus);
        }
        /**
         * 转换为JSON对象
         */
        toJSON() {
          return {
            id: this.id,
            name: this.name,
            species: this.species,
            type: this.type,
            level: this.level,
            experience: this.experience,
            maxExperience: this.maxExperience,
            health: this.health,
            maxHealth: this.maxHealth,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            hunger: this.hunger,
            happiness: this.happiness,
            loyalty: this.loyalty,
            intimacy: this.intimacy,
            affinity: this.affinity,
            evolutionStage: this.evolutionStage,
            evolveStage: this.evolveStage,
            form: this.form,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            power: this.power,
            potential: this.potential,
            skills: this.skills,
            active: this.active,
            equipped: this.equipped,
            favorite: this.favorite,
            capturedAt: this.capturedAt,
            lastFed: this.lastFed,
            lastPlayed: this.lastPlayed,
            lastTrained: this.lastTrained,
            captureCost: this.captureCost,
            rarity: this.rarity,
            color: this.color
          };
        }
        /**
         * 从JSON创建实例
         */
        static fromJSON(json) {
          return new _Pet(json);
        }
      };
      PET_TYPES = {
        WOLF: "wolf",
        TIGER: "tiger",
        FOX: "fox",
        DRAGON: "dragon",
        PHOENIX: "phoenix",
        TURTLE: "turtle",
        SPIRIT_FOX: "spirit_fox",
        MYSTIC_BIRD: "mystic_bird"
      };
      PET_RARITY = {
        COMMON: "common",
        UNCOMMON: "uncommon",
        RARE: "rare",
        EPIC: "epic",
        LEGENDARY: "legendary",
        MYTHIC: "mythic"
      };
      RARITY_COLORS2 = {
        common: "#999999",
        uncommon: "#00ff00",
        rare: "#0066ff",
        epic: "#ff00ff",
        legendary: "#ff8800",
        mythic: "#ffff00"
      };
      RARITY_POWER_MULT = {
        common: 1,
        uncommon: 1.2,
        rare: 1.5,
        epic: 2,
        legendary: 3,
        mythic: 5
      };
      PET_SPECIES_CONFIG = {
        "\u7075\u72D0": { attack: 12, defense: 8, speed: 15, rarity: "rare" },
        "\u7384\u9F9F": { attack: 8, defense: 15, speed: 6, rarity: "uncommon" },
        "\u706B\u9E64": { attack: 15, defense: 6, speed: 12, rarity: "rare" },
        "\u7389\u5154": { attack: 10, defense: 10, speed: 10, rarity: "common" },
        "\u94F6\u72FC": { attack: 14, defense: 10, speed: 12, rarity: "epic" },
        "\u9752\u86C7": { attack: 16, defense: 5, speed: 14, rarity: "epic" },
        "\u767D\u864E": { attack: 18, defense: 12, speed: 10, rarity: "legendary" },
        "\u91D1\u9E4F": { attack: 20, defense: 8, speed: 18, rarity: "mythic" }
      };
    }
  });

  // src/systems/ai/NPCCollaboration.js
  var NPC_ROLE_REGISTRY, NpcMessageBus, npcMessageBus, NpcCollabGraph, npcCollabGraph, NpcTaskManager, NpcCollaborationRewards, NpcReputationSystem, npcReputationSystem, npcTaskManager, npcCollabRewards, CollaborationRoom, CollaborationManager, collabManager;
  var init_NPCCollaboration = __esm({
    "src/systems/ai/NPCCollaboration.js"() {
      NPC_ROLE_REGISTRY = {
        "master": {
          role: "master",
          title: "\u5E08\u5C0A",
          skills: ["teach", "assign_task", "evaluate", "reward"],
          collaborationWeight: 0.3,
          responseSpeed: "slow"
        },
        "monster": {
          role: "monster",
          title: "\u5996\u517D",
          skills: ["challenge", "guard", "drop_item"],
          collaborationWeight: 0.2,
          responseSpeed: "fast"
        },
        "merchant": {
          role: "merchant",
          title: "\u5546\u4EBA",
          skills: ["trade", "appraise", "special_goods"],
          collaborationWeight: 0.25,
          responseSpeed: "medium"
        },
        "fellow": {
          role: "fellow",
          title: "\u540C\u9053",
          skills: ["practice_together", "share_resource", "mutual_help"],
          collaborationWeight: 0.25,
          responseSpeed: "medium"
        }
      };
      NpcMessageBus = class {
        constructor() {
          this.messages = [];
          this.listeners = /* @__PURE__ */ new Map();
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
            type,
            // 'task' | 'response' | 'broadcast'
            payload,
            timestamp: Date.now(),
            status: "pending"
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
            to: "*",
            // wildcard = all roles
            type,
            // 'announcement' | 'emergency' | 'opportunity'
            payload,
            timestamp: Date.now(),
            status: "pending"
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
            if (msg.status !== "pending") continue;
            const listeners = this.listeners.get(msg.to) || [];
            for (const cb of listeners) {
              cb(msg);
              msg.status = "delivered";
              delivered.push(msg.id);
            }
            if (msg.to === "*") {
              for (const [role, cbs] of this.listeners) {
                if (role !== msg.from) {
                  for (const cb of cbs) {
                    cb(msg);
                  }
                }
              }
              msg.status = "broadcast";
              delivered.push(msg.id);
            }
          }
          this.messages = this.messages.filter((m) => m.status === "pending");
          return delivered;
        }
        /**
         * 获取角色的消息
         */
        getMessages(role, since = 0) {
          return this.messages.filter(
            (m) => (m.from === role || m.to === role || m.to === "*") && m.timestamp > since
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
            history = history.filter((m) => m.from === role || m.to === role);
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
      };
      npcMessageBus = new NpcMessageBus();
      NpcCollabGraph = class {
        constructor() {
          this.nodes = /* @__PURE__ */ new Map();
          this.edges = [];
          this.activeTasks = /* @__PURE__ */ new Map();
          this.taskIdCounter = 0;
        }
        /**
         * 添加节点
         */
        addNode(nodeId, config) {
          this.nodes.set(nodeId, {
            id: nodeId,
            type: config.type,
            // 'publish_task' | 'execute' | 'review' | 'reward'
            owner: config.owner,
            status: "idle",
            prerequisites: config.prerequisites || [],
            outcomes: config.outcomes || {},
            maxProgress: config.maxProgress || 100
          });
        }
        /**
         * 添加边
         */
        addEdge(from, to, type = "sequence") {
          this.edges.push({ from, to, type });
        }
        /**
         * 获取准备就绪的节点（所有前置条件已满足）
         */
        getReadyNodes() {
          const ready = [];
          for (const [nodeId, node] of this.nodes) {
            if (node.status !== "idle") continue;
            const prereqs = node.prerequisites || [];
            const allMet = prereqs.every((p) => {
              const n = this.nodes.get(p);
              return n && n.status === "completed";
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
          node.status = "in_progress";
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
            if (node) node.status = "completed";
            task.status = "completed";
            task.endTime = Date.now();
          }
        }
        /**
         * 获取链状态
         */
        getChainStatus(chainId) {
          const nodes = Array.from(this.nodes.values()).filter((n) => n.type === chainId);
          return {
            total: nodes.length,
            completed: nodes.filter((n) => n.status === "completed").length,
            inProgress: nodes.filter((n) => n.status === "in_progress").length,
            idle: nodes.filter((n) => n.status === "idle").length
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
      };
      npcCollabGraph = new NpcCollabGraph();
      NpcTaskManager = class {
        constructor() {
          this.activeTasks = /* @__PURE__ */ new Map();
          this.taskIdCounter = 0;
          this.taskDefinitions = /* @__PURE__ */ new Map();
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
            status: "assigned"
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
              task.status = "completed";
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
            task.status = "completed";
            task.completedAt = Date.now();
            return task;
          }
          return null;
        }
        /**
         * 获取角色的活跃任务
         */
        getActiveTasks(role) {
          return Array.from(this.activeTasks.values()).filter(
            (t) => t.role === role && t.status !== "completed"
          );
        }
        /**
         * 获取过期任务
         */
        getExpiredTasks() {
          const now = Date.now();
          return Array.from(this.activeTasks.entries()).filter(
            ([id, task]) => task.deadline < now && task.status !== "completed"
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
              task.status = "expired";
              task.expiredAt = Date.now();
            }
          }
          return expired.length;
        }
      };
      NpcCollaborationRewards = class {
        constructor() {
          this.rewardPool = 0;
          this.distributionRules = {
            "master": { share: 0.4, bonusOn: ["teach", "evaluate"] },
            "fellow": { share: 0.3, bonusOn: ["practice_together", "share_resource"] },
            "merchant": { share: 0.2, bonusOn: ["trade", "appraise"] },
            "monster": { share: 0.1, bonusOn: ["challenge", "drop_item"] }
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
      };
      NpcReputationSystem = class {
        constructor() {
          this.reputations = /* @__PURE__ */ new Map();
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
      };
      npcReputationSystem = new NpcReputationSystem();
      npcTaskManager = new NpcTaskManager();
      npcCollabRewards = new NpcCollaborationRewards();
      CollaborationRoom = class {
        constructor(roomId, taskType) {
          this.roomId = roomId;
          this.taskType = taskType;
          this.participants = /* @__PURE__ */ new Map();
          this.maxParticipants = 5;
          this.status = "recruiting";
          this.chatLog = [];
          this.resourcePool = 0;
        }
        join(playerId, playerName) {
          if (this.status !== "recruiting") {
            return { success: false, reason: "Room not recruiting" };
          }
          if (this.participants.size >= this.maxParticipants) {
            return { success: false, reason: "Room full" };
          }
          this.participants.set(playerId, {
            name: playerName,
            joinedAt: Date.now(),
            contribution: 0
          });
          this.addChatLog(playerName, "joined the room");
          return { success: true, roomId: this.roomId };
        }
        leave(playerId) {
          const participant = this.participants.get(playerId);
          if (participant) {
            this.addChatLog(participant.name, "left the room");
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
      };
      CollaborationManager = class {
        constructor() {
          this.rooms = /* @__PURE__ */ new Map();
          this.playerRooms = /* @__PURE__ */ new Map();
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
          if (!room) return { success: false, reason: "Room not found" };
          if (room.status !== "recruiting") return { success: false, reason: "Room not recruiting" };
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
          return Array.from(this.rooms.values()).filter((r) => r.status === "recruiting");
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
      };
      collabManager = new CollaborationManager();
    }
  });

  // src/systems/event/RealmEventBus.js
  var RealmEventBus_exports = {};
  __export(RealmEventBus_exports, {
    EVENT_BUS_TOOLS: () => EVENT_BUS_TOOLS,
    EVENT_CONFIG: () => EVENT_CONFIG,
    EVENT_PRIORITIES: () => EVENT_PRIORITIES,
    REALM_EVENT_TYPES: () => REALM_EVENT_TYPES,
    RealmEvent: () => RealmEvent,
    RealmEventBus: () => RealmEventBus,
    SubscriberEntry: () => SubscriberEntry,
    default: () => RealmEventBus_default,
    mcpCascadeTrigger: () => mcpCascadeTrigger,
    mcpHistory: () => mcpHistory,
    mcpPublish: () => mcpPublish,
    mcpSubscribe: () => mcpSubscribe,
    mcpSubscriberList: () => mcpSubscriberList,
    mcpUnsubscribe: () => mcpUnsubscribe,
    realmEventBus: () => realmEventBus
  });
  function mcpPublish(params = {}) {
    const { type, data = {}, source, target, priority } = params;
    if (!type) {
      return { success: false, error: "Event type is required" };
    }
    const result = realmEventBus.publish(type, data, {
      source: source || "mcp",
      target,
      priority: priority || "medium"
    });
    return {
      success: true,
      eventId: result.eventId,
      type: result.type,
      timestamp: result.timestamp,
      matchedCount: result.matchedCount
    };
  }
  function mcpSubscribe(params = {}) {
    const { pattern, subscriberId = "mcp", priority = "medium" } = params;
    if (!pattern) {
      return { success: false, error: "Event pattern is required" };
    }
    const callback = (event2) => {
      return { received: true, eventId: event2.id, type: event2.type };
    };
    const result = realmEventBus.subscribe(pattern, callback, {
      subscriberId,
      priority
    });
    return {
      success: result.success,
      subscriberId: result.subscriberId,
      pattern: result.pattern
    };
  }
  function mcpUnsubscribe(params = {}) {
    const { subscriberId } = params;
    if (!subscriberId) {
      return { success: false, error: "Subscriber ID is required" };
    }
    const result = realmEventBus.unsubscribe(subscriberId);
    return result;
  }
  function mcpHistory(params = {}) {
    const { eventType, source, since, limit } = params;
    const history = realmEventBus.history({
      eventType,
      source,
      since: since || 0,
      limit: limit || 100
    });
    return {
      success: true,
      count: history.length,
      events: history.map((e) => ({
        id: e.id,
        type: e.type,
        source: e.source,
        target: e.target,
        timestamp: e.timestamp,
        priority: e.priority,
        data: e.data
      }))
    };
  }
  function mcpCascadeTrigger(params = {}) {
    const { initialEvent, followUpEvents = [], maxDepth } = params;
    if (!initialEvent || !initialEvent.type) {
      return { success: false, error: "Initial event with type is required" };
    }
    const result = realmEventBus.triggerCascade(initialEvent, {
      maxDepth: maxDepth || EVENT_CONFIG.cascadeDepthLimit,
      followUpEvents
    });
    return result;
  }
  function mcpSubscriberList(params = {}) {
    const { pattern, subscriberId } = params;
    const subscribers = realmEventBus.listSubscribers({
      pattern: pattern || null,
      subscriberId: subscriberId || null
    });
    return {
      success: true,
      count: subscribers.length,
      subscribers
    };
  }
  var EVENT_CONFIG, EVENT_PRIORITIES, REALM_EVENT_TYPES, RealmEvent, SubscriberEntry, RealmEventBus, realmEventBus, EVENT_BUS_TOOLS, RealmEventBus_default;
  var init_RealmEventBus = __esm({
    "src/systems/event/RealmEventBus.js"() {
      init_NPCCollaboration();
      EVENT_CONFIG = {
        maxHistoryLength: 1e3,
        maxSubscribersPerEvent: 100,
        cascadeDepthLimit: 5,
        defaultPriority: "medium"
      };
      EVENT_PRIORITIES = {
        high: 3,
        medium: 2,
        low: 1
      };
      REALM_EVENT_TYPES = {
        // 玩家事件
        PLAYER_CULTIVATION_BREAKTHROUGH: "player.cultivation.breakthrough",
        PLAYER_LEVEL_UP: "player.level.up",
        PLAYER_QUESTS_COMPLETE: "player.quest.complete",
        // NPC事件
        NPC_INTERACT: "npc.interact",
        NPC_SPAWN: "npc.spawn",
        NPC_DEFEAT: "npc.defeat",
        // 仙界事件
        REALM_QUAKE: "realm.quake",
        REALM_TRIBULATION: "realm.tribulation",
        REALM_BLESSING: "realm.blessing",
        // 宗门事件
        SECT_WAR: "sect.war",
        SECT_JOIN: "sect.join",
        SECT_TASK: "sect.task",
        // 宝藏事件
        TREASURE_DISCOVERED: "treasure.discovered",
        TREASURE_OPENED: "treasure.opened",
        // 系统事件
        SYSTEM_INIT: "system.init",
        SYSTEM_SAVE: "system.save",
        SYSTEM_LOAD: "system.load"
      };
      RealmEvent = class {
        constructor(type, data = {}, options = {}) {
          this.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          this.type = type;
          this.source = options.source || "system";
          this.target = options.target || null;
          this.timestamp = options.timestamp || Date.now();
          this.data = data;
          this.priority = options.priority || EVENT_CONFIG.defaultPriority;
          this.cascadeLevel = options.cascadeLevel || 0;
          this.processed = false;
        }
        /**
         * 获取优先级数值
         */
        getPriorityValue() {
          return EVENT_PRIORITIES[this.priority] || EVENT_PRIORITIES.medium;
        }
      };
      SubscriberEntry = class {
        constructor(pattern, callback, options = {}) {
          this.id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          this.pattern = pattern;
          this.callback = callback;
          this.priority = options.priority || EVENT_PRIORITIES.medium;
          this.subscriberId = options.subscriberId || "anonymous";
          this.active = true;
          this.matchCount = 0;
          this.createdAt = Date.now();
        }
        /**
         * 获取优先级数值
         */
        getPriorityValue() {
          return this.priority;
        }
      };
      RealmEventBus = class {
        constructor() {
          this.subscribers = /* @__PURE__ */ new Map();
          this.eventHistory = [];
          this.subscriberStats = /* @__PURE__ */ new Map();
          this.cascadeTracking = /* @__PURE__ */ new Set();
          this.eventIdCounter = 0;
          this.listenerCount = 0;
        }
        /**
         * 创建事件
         */
        createEvent(type, data = {}, options = {}) {
          return new RealmEvent(type, data, options);
        }
        /**
         * 发布事件
         */
        publish(type, data = {}, options = {}) {
          const event2 = this.createEvent(type, data, options);
          this.eventHistory.push(event2);
          if (this.eventHistory.length > EVENT_CONFIG.maxHistoryLength) {
            this.eventHistory = this.eventHistory.slice(-EVENT_CONFIG.maxHistoryLength);
          }
          const matchedSubscribers = this.getMatchedSubscribers(type);
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          matchedSubscribers.sort((a, b) => {
            const aVal = priorityOrder[a.getPriorityValue()] || 2;
            const bVal = priorityOrder[b.getPriorityValue()] || 2;
            return bVal - aVal;
          });
          const results = [];
          for (const subscriber of matchedSubscribers) {
            if (subscriber.active) {
              try {
                const result = subscriber.callback(event2);
                subscriber.matchCount++;
                results.push({
                  subscriberId: subscriber.subscriberId,
                  success: true,
                  result
                });
              } catch (e) {
                results.push({
                  subscriberId: subscriber.subscriberId,
                  success: false,
                  error: e.message
                });
              }
            }
          }
          return {
            success: true,
            eventId: event2.id,
            type: event2.type,
            timestamp: event2.timestamp,
            matchedCount: matchedSubscribers.length,
            results
          };
        }
        /**
         * 订阅事件
         */
        subscribe(pattern, callback, options = {}) {
          const subscriber = new SubscriberEntry(pattern, callback, options);
          if (!this.subscribers.has(pattern)) {
            this.subscribers.set(pattern, []);
          }
          const subs = this.subscribers.get(pattern);
          if (subs.length >= EVENT_CONFIG.maxSubscribersPerEvent) {
            return {
              success: false,
              error: "Max subscribers reached for this pattern",
              subscriberId: null
            };
          }
          subs.push(subscriber);
          this.listenerCount++;
          const stats = this.subscriberStats.get(subscriber.subscriberId) || {
            activeSubscriptions: 0,
            totalMatches: 0
          };
          stats.activeSubscriptions++;
          this.subscriberStats.set(subscriber.subscriberId, stats);
          return {
            success: true,
            subscriberId: subscriber.id,
            pattern: subscriber.pattern
          };
        }
        /**
         * 取消订阅
         */
        unsubscribe(subscriberId) {
          let found = false;
          for (const [pattern, subs] of this.subscribers) {
            const index = subs.findIndex((s) => s.id === subscriberId);
            if (index >= 0) {
              const sub = subs[index];
              sub.active = false;
              subs.splice(index, 1);
              this.listenerCount--;
              found = true;
              const stats = this.subscriberStats.get(sub.subscriberId);
              if (stats) {
                stats.activeSubscriptions--;
              }
              break;
            }
          }
          return { success: found };
        }
        /**
         * 取消订阅指定模式和订阅者ID
         */
        unsubscribeByPattern(pattern, subscriberId) {
          const subs = this.subscribers.get(pattern);
          if (!subs) return { success: false };
          const index = subs.findIndex(
            (s) => s.id === subscriberId || s.subscriberId === subscriberId
          );
          if (index >= 0) {
            const sub = subs[index];
            sub.active = false;
            subs.splice(index, 1);
            this.listenerCount--;
            const stats = this.subscriberStats.get(sub.subscriberId);
            if (stats) {
              stats.activeSubscriptions--;
            }
            return { success: true };
          }
          return { success: false };
        }
        /**
         * 获取事件历史
         */
        history(options = {}) {
          const {
            eventType = null,
            source = null,
            since = 0,
            limit = 100
          } = options;
          let filtered = this.eventHistory;
          if (eventType) {
            filtered = filtered.filter((e) => e.type === eventType);
          }
          if (source) {
            filtered = filtered.filter((e) => e.source === source);
          }
          if (since > 0) {
            filtered = filtered.filter((e) => e.timestamp >= since);
          }
          return filtered.slice(-limit);
        }
        /**
         * 获取订阅者列表
         */
        listSubscribers(options = {}) {
          const { pattern = null, subscriberId = null } = options;
          const allSubscribers = [];
          for (const [pat, subs] of this.subscribers) {
            for (const sub of subs) {
              if (!sub.active) continue;
              if (pattern && !this.matchPattern(pat, pattern)) continue;
              if (subscriberId && sub.subscriberId !== subscriberId) continue;
              allSubscribers.push({
                id: sub.id,
                pattern: sub.pattern,
                subscriberId: sub.subscriberId,
                priority: sub.priority,
                matchCount: sub.matchCount,
                active: sub.active,
                createdAt: sub.createdAt
              });
            }
          }
          return allSubscribers;
        }
        /**
         * 触发事件级联
         * 用于手动触发事件链式反应
         */
        triggerCascade(initialEvent, cascadeConfig = {}) {
          const {
            maxDepth = EVENT_CONFIG.cascadeDepthLimit,
            followUpEvents = []
          } = cascadeConfig;
          if (this.cascadeTracking.has(initialEvent.type)) {
            return {
              success: false,
              error: "Circular cascade detected",
              eventType: initialEvent.type
            };
          }
          const event2 = this.createEvent(initialEvent.type, initialEvent.data || {}, {
            source: initialEvent.source || "cascade",
            cascadeLevel: 0
          });
          this.cascadeTracking.add(event2.type);
          const cascadeResults = [];
          try {
            const initialResult = this.publish(event2.type, event2.data, {
              source: event2.source,
              cascadeLevel: 0
            });
            cascadeResults.push({
              level: 0,
              eventType: event2.type,
              result: initialResult
            });
            let currentLevel = 0;
            let pendingEvents = [...followUpEvents];
            while (pendingEvents.length > 0 && currentLevel < maxDepth) {
              currentLevel++;
              const nextEvent = pendingEvents.shift();
              const result = this.publish(nextEvent.type, nextEvent.data || {}, {
                source: "cascade",
                cascadeLevel: currentLevel
              });
              cascadeResults.push({
                level: currentLevel,
                eventType: nextEvent.type,
                result
              });
            }
          } finally {
            this.cascadeTracking.delete(event2.type);
          }
          return {
            success: true,
            cascadeResults,
            totalEvents: cascadeResults.length
          };
        }
        /**
         * 匹配事件类型模式
         */
        matchPattern(eventType, pattern) {
          if (eventType === pattern) return true;
          const regex = new RegExp(
            "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
          );
          return regex.test(eventType);
        }
        /**
         * 获取匹配的订阅者
         */
        getMatchedSubscribers(eventType) {
          const matched = /* @__PURE__ */ new Map();
          for (const [pattern, subs] of this.subscribers) {
            if (this.matchPattern(eventType, pattern)) {
              for (const sub of subs) {
                if (sub.active && !matched.has(sub.id)) {
                  matched.set(sub.id, sub);
                }
              }
            }
          }
          return Array.from(matched.values());
        }
        /**
         * 获取统计信息
         */
        getStats() {
          return {
            totalEvents: this.eventHistory.length,
            totalSubscribers: this.listenerCount,
            uniquePatterns: this.subscribers.size,
            subscriberStats: Object.fromEntries(this.subscriberStats),
            cascadeTracking: Array.from(this.cascadeTracking)
          };
        }
        /**
         * 清除历史
         */
        clearHistory() {
          this.eventHistory = [];
          return { success: true };
        }
        /**
         * 重置
         */
        reset() {
          this.subscribers.clear();
          this.eventHistory = [];
          this.subscriberStats.clear();
          this.cascadeTracking.clear();
          this.listenerCount = 0;
          return { success: true };
        }
      };
      realmEventBus = new RealmEventBus();
      EVENT_BUS_TOOLS = {
        "event.bus.publish": {
          name: "event.bus.publish",
          description: "Publish an event to the realm event bus",
          inputSchema: {
            type: "object",
            properties: {
              type: { type: "string", description: "Event type (e.g., player.cultivation.breakthrough)" },
              data: { type: "object", description: "Event data payload" },
              source: { type: "string", description: "Event source (default: mcp)" },
              target: { type: "string", description: "Event target (optional)" },
              priority: { type: "string", enum: ["high", "medium", "low"], description: "Event priority" }
            },
            required: ["type"]
          }
        },
        "event.bus.subscribe": {
          name: "event.bus.subscribe",
          description: "Subscribe to events matching a pattern (supports glob: player.*, *.breakthrough)",
          inputSchema: {
            type: "object",
            properties: {
              pattern: { type: "string", description: "Event pattern (glob supported: player.*, npc.interact)" },
              subscriberId: { type: "string", description: "Subscriber identifier (default: mcp)" },
              priority: { type: "string", enum: ["high", "medium", "low"], description: "Callback priority" }
            },
            required: ["pattern"]
          }
        },
        "event.bus.unsubscribe": {
          name: "event.bus.unsubscribe",
          description: "Unsubscribe from an event",
          inputSchema: {
            type: "object",
            properties: {
              subscriberId: { type: "string", description: "Subscriber ID to remove" }
            },
            required: ["subscriberId"]
          }
        },
        "event.bus.history": {
          name: "event.bus.history",
          description: "View event history",
          inputSchema: {
            type: "object",
            properties: {
              eventType: { type: "string", description: "Filter by event type" },
              source: { type: "string", description: "Filter by source" },
              since: { type: "number", description: "Filter events since timestamp" },
              limit: { type: "number", description: "Max events to return (default: 100)" }
            }
          }
        },
        "event.cascade.trigger": {
          name: "event.cascade.trigger",
          description: "Manually trigger a cascade of events",
          inputSchema: {
            type: "object",
            properties: {
              initialEvent: {
                type: "object",
                description: "Initial event to trigger",
                properties: {
                  type: { type: "string" },
                  data: { type: "object" },
                  source: { type: "string" }
                },
                required: ["type"]
              },
              followUpEvents: {
                type: "array",
                description: "Array of follow-up events to trigger in order"
              },
              maxDepth: { type: "number", description: "Maximum cascade depth" }
            },
            required: ["initialEvent"]
          }
        },
        "event.subscriber.list": {
          name: "event.subscriber.list",
          description: "List all event subscribers",
          inputSchema: {
            type: "object",
            properties: {
              pattern: { type: "string", description: "Filter by pattern" },
              subscriberId: { type: "string", description: "Filter by subscriber ID" }
            }
          }
        }
      };
      RealmEventBus_default = realmEventBus;
    }
  });

  // src/main.js
  var main_exports = {};
  __export(main_exports, {
    CONFIG: () => CONFIG2,
    GAME_LOOP_CONFIG: () => GAME_LOOP_CONFIG,
    addLog: () => addLog2,
    advanceDay: () => advanceDay,
    autoSave: () => autoSave,
    clearEvents: () => clearEvents,
    clearLogs: () => clearLogs,
    doLoadGame: () => doLoadGame,
    doLoadGameWithFeedback: () => doLoadGameWithFeedback,
    doResetGame: () => doResetGame,
    doSaveGame: () => doSaveGame,
    doSaveGameWithFeedback: () => doSaveGameWithFeedback,
    domainModules: () => domainModules,
    gameLoop: () => gameLoop,
    getDomainModule: () => getDomainModule,
    getGameState: () => getGameState,
    getGameStateField: () => getGameStateField,
    getGameStats: () => getGameStats,
    getLogs: () => getLogs,
    getPlayerInfo: () => getPlayerInfo,
    getRealmInfo: () => getRealmInfo,
    getSaveHistory: () => getSaveHistory,
    init: () => init,
    loadGame: () => loadGame,
    mcpRegistry: () => mcpRegistry,
    processEventQueue: () => processEventQueue,
    processOfflineEarnings: () => processOfflineEarnings,
    registerMCPTools: () => registerMCPTools,
    saveAndExit: () => saveAndExit,
    saveGame: () => saveGame2,
    scheduleEvent: () => scheduleEvent,
    setGameStateField: () => setGameStateField,
    showSaveLoadModal: () => showSaveLoadModal,
    startGameLoop: () => startGameLoop,
    startNewGame: () => startNewGame,
    stopGameLoop: () => stopGameLoop,
    updateDisplay: () => updateDisplay2
  });

  // src/config/constants.js
  var CONFIG2 = {
    realms: ["\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347"],
    stages: ["\u521D\u671F", "\u4E2D\u671F", "\u540E\u671F"],
    stageNames: ["\u51E1\u4EBA", "\u4FEE\u58EB", "\u771F\u4EBA", "\u5929\u541B", "\u5927\u80FD"],
    apiUrl: "https://api.minimaxi.com/v1/chat/completions",
    storageKey: "cultivationSave",
    apiConfigKey: "cultivationApiConfig",
    miniMaxConfigKey: "cultivationMiniMaxConfig",
    // 云端存档配置
    cloudSaveEnabled: false,
    cloudSaveUrl: "https://api.github.com/gists",
    cloudSaveGistId: "",
    cloudSaveToken: ""
  };

  // src/domains/cultivation/CultivationModule.js
  var { CultivationEntity: CultivationEntity2 } = (init_CultivationEntity(), __toCommonJS(CultivationEntity_exports));
  var { SpiritRootEntity: SpiritRootEntity2, TIER_MAP: TIER_MAP2, ROOT_TYPES: ROOT_TYPES2, ROOT_TYPE_NAMES: ROOT_TYPE_NAMES2, TIER_BONUSES: TIER_BONUSES2 } = (init_SpiritRootEntity(), __toCommonJS(SpiritRootEntity_exports));
  var { CultivationService: CultivationService2, TRIBULATIONS: TRIBULATIONS2, BLESSING_TYPES: BLESSING_TYPES2 } = (init_CultivationService(), __toCommonJS(CultivationService_exports));
  function createCultivationModule(gameState3) {
    const cultivationService = new CultivationService2(gameState3);
    return {
      // 实体
      CultivationEntity: CultivationEntity2,
      SpiritRootEntity: SpiritRootEntity2,
      TIER_MAP: TIER_MAP2,
      ROOT_TYPES: ROOT_TYPES2,
      ROOT_TYPE_NAMES: ROOT_TYPE_NAMES2,
      TIER_BONUSES: TIER_BONUSES2,
      // 服务
      cultivationService,
      // 配置
      TRIBULATIONS: TRIBULATIONS2,
      BLESSING_TYPES: BLESSING_TYPES2,
      // 便捷方法 - 修炼
      meditate: (amount) => cultivationService.meditate(amount),
      breakthrough: () => cultivationService.breakthrough(),
      executeTribulation: () => cultivationService.executeTribulation(),
      tribulationLightning: (damage, resisted) => cultivationService.tribulationLightning(damage, resisted),
      startTribulation: (targetRealm) => cultivationService.startTribulation(targetRealm),
      getTribulationProgress: () => cultivationService.getTribulationProgress(),
      advance: (action) => cultivationService.advance(action),
      // 便捷方法 - 祝福
      receiveBlessing: (type) => cultivationService.receiveBlessing(type),
      getBlessings: () => cultivationService.getBlessings(),
      // 便捷方法 - 灵根
      evolveSpiritRoot: (rootType) => cultivationService.evolveSpiritRoot(rootType),
      querySpiritRoot: (detail) => cultivationService.querySpiritRoot(detail),
      // 便捷方法 - 状态
      getSummary: () => cultivationService.getSummary(),
      getCultivationEntity: () => cultivationService.getCultivationEntity(),
      getSpiritRootEntity: () => cultivationService.getSpiritRootEntity()
    };
  }

  // src/domains/player/PlayerModule.js
  var { PlayerEntity: PlayerEntity3, REALMS: REALMS3, STAGES: STAGES3, STAGE_NAMES: STAGE_NAMES2 } = (init_PlayerEntity(), __toCommonJS(PlayerEntity_exports));
  var { PlayerService: PlayerService2 } = (init_PlayerService(), __toCommonJS(PlayerService_exports));
  function createPlayerModule(gameState3) {
    const playerService = new PlayerService2(gameState3);
    return {
      // 实体
      PlayerEntity: PlayerEntity3,
      REALMS: REALMS3,
      STAGES: STAGES3,
      STAGE_NAMES: STAGE_NAMES2,
      // 服务
      playerService,
      // 便捷方法
      getPlayerInfo: () => playerService.getPlayerInfo(),
      addSpiritStones: (amount) => playerService.addSpiritStones(amount),
      spendSpiritStones: (amount) => playerService.spendSpiritStones(amount),
      addQi: (amount) => playerService.addQi(amount),
      spendQi: (amount) => playerService.spendQi(amount),
      advanceRealm: () => playerService.advanceRealm(),
      advanceStage: () => playerService.advanceStage(),
      addLevel: (amount) => playerService.addLevel(amount),
      addReputation: (amount) => playerService.addReputation(amount),
      addKarmaPoints: (amount) => playerService.addKarmaPoints(amount),
      addCultivationProgress: (amount) => playerService.addCultivationProgress(amount),
      addCultivationXP: (amount) => playerService.addCultivationXP(amount),
      addItem: (item) => playerService.addItem(item),
      removeItem: (itemId, quantity) => playerService.removeItem(itemId, quantity),
      setEquipment: (slot, equipment) => playerService.setEquipment(slot, equipment),
      getEquipment: (slot) => playerService.getEquipment(slot),
      addWin: () => playerService.addWin(),
      addLoss: () => playerService.addLoss(),
      reset: () => playerService.reset(),
      getStateSummary: () => playerService.getStateSummary(),
      // 获取玩家实体
      getPlayerEntity: () => playerService.getPlayerEntity()
    };
  }

  // src/domains/achievement/AchievementModule.js
  init_Achievement();
  init_Badge();

  // src/domains/achievement/services/AchievementService.js
  var { Achievement: Achievement2, AchievementCategory: AchievementCategory2, AchievementRequirementType: AchievementRequirementType2, ACHIEVEMENT_POOL: ACHIEVEMENT_POOL2 } = (init_Achievement(), __toCommonJS(Achievement_exports));
  var AchievementService = class {
    constructor(gameState3) {
      this.gs = gameState3;
    }
    /**
     * 初始化成就状态 (V114基础版)
     */
    _initAchievementState() {
      if (!this.gs.achievement) {
        this.gs.achievement = {
          unlocked: [],
          rewardsClaimed: [],
          achievementPool: [...ACHIEVEMENT_POOL2]
        };
      }
      return this.gs.achievement;
    }
    /**
     * 初始化成就状态V2 (V155)
     */
    _initAchievementStateV2() {
      if (!this.gs.achievementV2) {
        this.gs.achievementV2 = {
          achievements: [...ACHIEVEMENT_POOL2].map((a) => ({ ...a, progress: 0, completed: false, completedAt: null, rewardClaimed: false })),
          totalAchievements: 0,
          completedCount: 0
        };
        this.gs.achievementV2.totalAchievements = this.gs.achievementV2.achievements.length;
      }
      return this.gs.achievementV2;
    }
    /**
     * 初始化成就状态V3 (V165)
     */
    _initAchievementStateV3() {
      if (!this.gs.achievementV3) {
        this.gs.achievementV3 = {
          achievements: [...ACHIEVEMENT_POOL2].map((a) => ({
            ...a,
            progress: 0,
            completed: false,
            completedAt: null,
            reward: a.reward || { type: "spiritStone", amount: 100 }
          })),
          totalAchievements: 0,
          completedCount: 0
        };
        this.gs.achievementV3.totalAchievements = this.gs.achievementV3.achievements.length;
      }
      return this.gs.achievementV3;
    }
    /**
     * 初始化成就状态V6 (V195)
     */
    _initAchievementStateV6() {
      if (!this.gs.achievementV6) {
        this.gs.achievementV6 = {
          achievements: [
            { id: "ach_first_login_v6", name: "\u521D\u5165\u4ED9\u9014v6", description: "\u9996\u6B21\u767B\u5F55\u6E38\u620F", category: "beginner", requirement: { type: "login", count: 1 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 100 } },
            { id: "ach_realm_qi_v6", name: "\u70BC\u6C14\u521D\u671Fv6", description: "\u5883\u754C\u8FBE\u5230\u70BC\u6C14\u521D\u671F", category: "realm", requirement: { type: "realm", level: 1 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 200 } },
            { id: "ach_realm_zhu_v6", name: "\u7B51\u57FA\u6210\u529Fv6", description: "\u5883\u754C\u8FBE\u5230\u7B51\u57FA", category: "realm", requirement: { type: "realm", level: 2 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 500 } },
            { id: "ach_realm_jin_v6", name: "\u91D1\u4E39\u5927\u9053v6", description: "\u5883\u754C\u8FBE\u5230\u91D1\u4E39", category: "realm", requirement: { type: "realm", level: 3 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 1e3 } },
            { id: "ach_realm_yuan_v6", name: "\u5143\u5A74\u7A81\u7834v6", description: "\u5883\u754C\u8FBE\u5230\u5143\u5A74", category: "realm", requirement: { type: "realm", level: 4 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 2e3 } },
            { id: "ach_spirit_1000_v6", name: "\u7075\u6C14\u5145\u88D5v6", description: "\u7D2F\u8BA1\u83B7\u5F971000\u7075\u6C14", category: "resource", requirement: { type: "spirit", amount: 1e3 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 300 } },
            { id: "ach_stone_5000_v6", name: "\u5BCC\u7532\u4E00\u65B9v6", description: "\u7D2F\u8BA1\u83B7\u5F975000\u7075\u77F3", category: "resource", requirement: { type: "stone", amount: 5e3 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 500 } },
            { id: "ach_stone_50000_v6", name: "\u8170\u7F20\u4E07\u8D2Fv6", description: "\u7D2F\u8BA1\u83B7\u5F9750000\u7075\u77F3", category: "resource", requirement: { type: "stone", amount: 5e4 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 2e3 } },
            { id: "ach_battle_10_v6", name: "\u521D\u8BD5\u950B\u8292v6", description: "\u5B8C\u621010\u6B21\u6218\u6597", category: "battle", requirement: { type: "battle", count: 10 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 200 } },
            { id: "ach_battle_50_v6", name: "\u6218\u6597\u8FBE\u4EBAv6", description: "\u5B8C\u621050\u6B21\u6218\u6597", category: "battle", requirement: { type: "battle", count: 50 }, progress: 0, completed: false, completedAt: null, reward: { type: "reputation", amount: 50 } },
            { id: "ach_battle_100_v6", name: "\u767E\u6218\u767E\u80DCv6", description: "\u5B8C\u6210100\u6B21\u6218\u6597", category: "battle", requirement: { type: "battle", count: 100 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 1e3 } },
            { id: "ach_quest_5_v6", name: "\u4EFB\u52A1\u8FBE\u4EBAv6", description: "\u5B8C\u62105\u4E2A\u4EFB\u52A1", category: "quest", requirement: { type: "quest", count: 5 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 300 } },
            { id: "ach_quest_20_v6", name: "\u4EFB\u52A1\u5927\u5E08v6", description: "\u5B8C\u621020\u4E2A\u4EFB\u52A1", category: "quest", requirement: { type: "quest", count: 20 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 800 } },
            { id: "ach_signin_7_v6", name: "\u8FDE\u7EED\u7B7E\u5230v6", description: "\u7D2F\u8BA1\u7B7E\u52307\u5929", category: "activity", requirement: { type: "signin", days: 7 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 200 } },
            { id: "ach_signin_30_v6", name: "\u7B7E\u5230\u4E4B\u661Fv6", description: "\u7D2F\u8BA1\u7B7E\u523030\u5929", category: "activity", requirement: { type: "signin", days: 30 }, progress: 0, completed: false, completedAt: null, reward: { type: "spiritStone", amount: 1e3 } }
          ],
          totalAchievements: 0,
          completedCount: 0
        };
        this.gs.achievementV6.totalAchievements = this.gs.achievementV6.achievements.length;
      }
      return this.gs.achievementV6;
    }
    /**
     * 获取成就列表 (V114/V124基础版)
     */
    mcpAchievementList() {
      try {
        const achievement = this._initAchievementState();
        return {
          success: true,
          achievements: achievement.achievementPool,
          total: achievement.achievementPool.length,
          unlocked: achievement.unlocked.length
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 领取成就奖励 (V114/V124基础版)
     */
    mcpAchievementClaim(achievementId) {
      try {
        const achievement = this._initAchievementState();
        const idx = achievement.unlocked.indexOf(achievementId);
        if (idx === -1) return { error: "\u6210\u5C31\u672A\u89E3\u9501" };
        if (achievement.rewardsClaimed.includes(achievementId)) return { error: "\u5956\u52B1\u5DF2\u9886\u53D6" };
        const ach = achievement.achievementPool.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        achievement.rewardsClaimed.push(achievementId);
        return { success: true, achievementId, reward: ach.reward };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取成就列表 (V137/V155/V165)
     */
    mcpAchievementListV2() {
      try {
        const achV2 = this._initAchievementStateV2();
        return {
          success: true,
          achievements: achV2.achievements,
          totalAchievements: achV2.totalAchievements,
          completedCount: achV2.completedCount
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 查看成就详情 (V155)
     */
    mcpAchievementViewV2(achievementId) {
      try {
        const achV2 = this._initAchievementStateV2();
        const ach = achV2.achievements.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        return { success: true, achievement: ach };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 解锁成就 (V155)
     */
    mcpAchievementUnlockV2(achievementId) {
      try {
        const achV2 = this._initAchievementStateV2();
        const ach = achV2.achievements.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        if (ach.completed) return { error: "\u6210\u5C31\u5DF2\u5B8C\u6210" };
        ach.completed = true;
        ach.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        achV2.completedCount = achV2.achievements.filter((a) => a.completed).length;
        return { success: true, achievementId, message: "\u6210\u5C31\u89E3\u9501: " + ach.name };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取成就列表 (V165)
     */
    mcpAchievementListV3() {
      try {
        const achV3 = this._initAchievementStateV3();
        return {
          success: true,
          achievements: achV3.achievements.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            category: a.category,
            progress: a.progress,
            completed: a.completed,
            reward: a.reward
          })),
          totalAchievements: achV3.totalAchievements,
          completedCount: achV3.completedCount
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 查看成就详情 (V165)
     */
    mcpAchievementViewV3(achievementId) {
      try {
        const achV3 = this._initAchievementStateV3();
        const ach = achV3.achievements.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        return { success: true, achievement: ach };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 解锁成就 (V165)
     */
    mcpAchievementUnlockV3(achievementId) {
      try {
        const achV3 = this._initAchievementStateV3();
        if (!achievementId) {
          let unlockedAny = false;
          for (const ach2 of achV3.achievements) {
            if (ach2.completed) continue;
            let progress = 0;
            switch (ach2.requirement.type) {
              case "login":
                progress = this.gs.loginCount || 1;
                break;
              case "realm":
                progress = this.gs.realmIndex || 0;
                break;
              case "spirit":
                progress = this.gs.totalSpirit || 0;
                break;
              case "stone":
                progress = this.gs.totalSpiritStones || 0;
                break;
              case "battle":
                progress = this.gs.battleCount || 0;
                break;
              case "quest":
                progress = this.gs.questCount || 0;
                break;
              case "signin":
                progress = this.gs.signinV6 ? this.gs.signinV6.totalCheckins : 0;
                break;
            }
            ach2.progress = progress;
            if (progress >= (ach2.requirement.count || ach2.requirement.amount || ach2.requirement.level || 1)) {
              ach2.completed = true;
              ach2.completedAt = (/* @__PURE__ */ new Date()).toISOString();
              unlockedAny = true;
            }
          }
          achV3.completedCount = achV3.achievements.filter((a) => a.completed).length;
          return { success: true, unlockedAny, completedCount: achV3.completedCount };
        }
        const ach = achV3.achievements.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        if (ach.completed) return { error: "\u6210\u5C31\u5DF2\u5B8C\u6210\uFF0C\u65E0\u9700\u91CD\u590D\u89E3\u9501" };
        ach.completed = true;
        ach.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        achV3.completedCount = achV3.achievements.filter((a) => a.completed).length;
        return { success: true, achievementId, completedCount: achV3.completedCount };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 领取成就奖励 (V165)
     */
    mcpAchievementRewardV3(achievementId) {
      try {
        const achV3 = this._initAchievementStateV3();
        if (!achievementId) return { error: "\u8BF7\u6307\u5B9A\u6210\u5C31ID" };
        const ach = achV3.achievements.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        if (!ach.completed) return { error: "\u6210\u5C31\u672A\u5B8C\u6210\uFF0C\u65E0\u6CD5\u9886\u53D6\u5956\u52B1" };
        if (ach.rewardClaimed) return { error: "\u5956\u52B1\u5DF2\u9886\u53D6" };
        let rewardMessage = "";
        switch (ach.reward.type) {
          case "spiritStone":
            this.gs.spiritStones = (this.gs.spiritStones || 0) + ach.reward.amount;
            rewardMessage = "\u7075\u77F3x" + ach.reward.amount;
            break;
          case "reputation":
            this.gs.reputation = (this.gs.reputation || 0) + ach.reward.amount;
            rewardMessage = "\u58F0\u671Bx" + ach.reward.amount;
            break;
        }
        ach.rewardClaimed = true;
        return { success: true, achievementId, reward: ach.reward, rewardMessage };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取成就列表 (V195/V203)
     */
    mcpAchievementListV6(category = "all") {
      try {
        const achV6 = this._initAchievementStateV6();
        let achievements = achV6.achievements;
        if (category && category !== "all") {
          achievements = achievements.filter((a) => a.category === category);
        }
        const completedCount = achV6.achievements.filter((a) => a.completed).length;
        return {
          success: true,
          achievements: achievements.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            category: a.category,
            requirement: a.requirement,
            progress: a.progress,
            completed: a.completed,
            completedAt: a.completedAt,
            reward: a.reward
          })),
          totalAchievements: achV6.totalAchievements,
          completedCount
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 查看成就详情 (V195/V203)
     */
    mcpAchievementViewV6(achievementId) {
      try {
        const achV6 = this._initAchievementStateV6();
        if (!achievementId) return { error: "\u8BF7\u6307\u5B9A\u6210\u5C31ID" };
        const ach = achV6.achievements.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        return { success: true, achievement: ach };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 解锁成就 (V195/V203)
     */
    mcpAchievementUnlockV6(achievementId) {
      try {
        const achV6 = this._initAchievementStateV6();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        if (!achievementId) {
          let unlockedAny = false;
          for (const ach2 of achV6.achievements) {
            if (ach2.completed) continue;
            let progress = 0;
            switch (ach2.requirement.type) {
              case "login":
                progress = this.gs.loginCount || 1;
                break;
              case "realm":
                progress = this.gs.realmIndex || 0;
                break;
              case "spirit":
                progress = this.gs.totalSpirit || 0;
                break;
              case "stone":
                progress = this.gs.totalSpiritStones || 0;
                break;
              case "battle":
                progress = this.gs.battleCount || 0;
                break;
              case "quest":
                progress = this.gs.questCount || 0;
                break;
              case "signin":
                progress = this.gs.signinV6 ? this.gs.signinV6.totalCheckins : 0;
                break;
            }
            ach2.progress = progress;
            const target = ach2.requirement.count || ach2.requirement.amount || ach2.requirement.level || 1;
            if (progress >= target) {
              ach2.completed = true;
              ach2.completedAt = now;
              unlockedAny = true;
            }
          }
          const completedCount2 = achV6.achievements.filter((a) => a.completed).length;
          return { success: true, unlockedAny, completedCount: completedCount2 };
        }
        const ach = achV6.achievements.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        if (ach.completed) return { error: "\u6210\u5C31\u5DF2\u5B8C\u6210\uFF0C\u65E0\u9700\u91CD\u590D\u89E3\u9501" };
        ach.completed = true;
        ach.completedAt = now;
        const completedCount = achV6.achievements.filter((a) => a.completed).length;
        return { success: true, achievementId, completedCount };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 领取成就奖励 (V195/V203)
     */
    mcpAchievementRewardV6(achievementId) {
      try {
        const achV6 = this._initAchievementStateV6();
        if (!achievementId) return { error: "\u8BF7\u6307\u5B9A\u6210\u5C31ID" };
        const ach = achV6.achievements.find((a) => a.id === achievementId);
        if (!ach) return { error: "\u6210\u5C31\u4E0D\u5B58\u5728" };
        if (!ach.completed) return { error: "\u6210\u5C31\u672A\u5B8C\u6210\uFF0C\u65E0\u6CD5\u9886\u53D6\u5956\u52B1" };
        if (ach.rewardClaimed) return { error: "\u5956\u52B1\u5DF2\u9886\u53D6" };
        let rewardMessage = "";
        switch (ach.reward.type) {
          case "spiritStone":
            this.gs.spiritStones = (this.gs.spiritStones || 0) + ach.reward.amount;
            rewardMessage = "\u7075\u77F3x" + ach.reward.amount;
            break;
          case "reputation":
            this.gs.reputation = (this.gs.reputation || 0) + ach.reward.amount;
            rewardMessage = "\u58F0\u671Bx" + ach.reward.amount;
            break;
        }
        ach.rewardClaimed = true;
        return { success: true, achievementId, reward: ach.reward, rewardMessage };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取成就统计信息
     */
    getAchievementStats() {
      const achV6 = this._initAchievementStateV6();
      const achievements = achV6.achievements;
      const stats = {
        total: achievements.length,
        completed: achievements.filter((a) => a.completed).length,
        inProgress: achievements.filter((a) => !a.completed && a.progress > 0).length,
        notStarted: achievements.filter((a) => !a.completed && a.progress === 0).length,
        rewardsClaimed: achievements.filter((a) => a.rewardClaimed).length,
        byCategory: {}
      };
      const categories = [...new Set(achievements.map((a) => a.category))];
      for (const cat of categories) {
        const catAchievements = achievements.filter((a) => a.category === cat);
        stats.byCategory[cat] = {
          total: catAchievements.length,
          completed: catAchievements.filter((a) => a.completed).length
        };
      }
      return stats;
    }
  };

  // src/domains/achievement/services/BadgeService.js
  var { Badge: Badge2, BadgeRarity: BadgeRarity2, BadgeType: BadgeType2, BADGE_POOL: BADGE_POOL2, RARITY_ORDER: RARITY_ORDER2 } = (init_Badge(), __toCommonJS(Badge_exports));
  var MAX_EQUIPPED_BADGES2 = 3;
  var BadgeService = class {
    constructor(gameState3) {
      this.gs = gameState3;
    }
    /**
     * 初始化徽章状态 (V114/V137基础版)
     */
    _initBadgeState() {
      if (!this.gs.badge) {
        this.gs.badge = {
          badges: [...BADGE_POOL2].map((b) => ({ ...b, obtained: false, equipped: false, obtainedAt: null })),
          equippedBadges: []
        };
      }
      return this.gs.badge;
    }
    /**
     * 初始化徽章状态V2 (V155)
     */
    _initBadgeStateV2() {
      if (!this.gs.badgeV2) {
        this.gs.badgeV2 = {
          badges: [...BADGE_POOL2].map((b) => ({ ...b, obtained: false, equipped: false, obtainedAt: null })),
          totalBadges: 0,
          equippedBadges: []
        };
        this.gs.badgeV2.totalBadges = this.gs.badgeV2.badges.length;
      }
      return this.gs.badgeV2;
    }
    /**
     * 初始化徽章状态V3 (V165)
     */
    _initBadgeStateV3() {
      if (!this.gs.badgeV3) {
        this.gs.badgeV3 = {
          badges: [...BADGE_POOL2].map((b) => ({
            ...b,
            obtained: false,
            equipped: false,
            obtainedAt: null
          })),
          totalBadges: 0,
          equippedBadges: []
        };
        this.gs.badgeV3.totalBadges = this.gs.badgeV3.badges.length;
      }
      return this.gs.badgeV3;
    }
    /**
     * 初始化徽章状态V6 (V195)
     */
    _initBadgeStateV6() {
      if (!this.gs.badgeV6) {
        this.gs.badgeV6 = {
          badges: [
            { id: "badge_first_login_v6", name: "\u521D\u5165\u4ED9\u9014v6", description: "\u9996\u6B21\u767B\u5F55\u6E38\u620F", rarity: "common", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_realm_qi_v6", name: "\u70BC\u6C14\u671F\u4FEE\u58EBv6", description: "\u5883\u754C\u8FBE\u5230\u70BC\u6C14\u671F", rarity: "common", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_realm_zhu_v6", name: "\u7B51\u57FA\u671F\u4FEE\u58EBv6", description: "\u5883\u754C\u8FBE\u5230\u7B51\u57FA\u671F", rarity: "rare", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_realm_jin_v6", name: "\u91D1\u4E39\u671F\u4FEE\u58EBv6", description: "\u5883\u754C\u8FBE\u5230\u91D1\u4E39\u671F", rarity: "rare", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_realm_yuan_v6", name: "\u5143\u5A74\u671F\u4FEE\u58EBv6", description: "\u5883\u754C\u8FBE\u5230\u5143\u5A74\u671F", rarity: "epic", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_spirit_rich_v6", name: "\u7075\u6C14\u5145\u88D5v6", description: "\u7D2F\u8BA1\u83B7\u5F971000\u7075\u6C14", rarity: "common", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_battle_master_v6", name: "\u6218\u6597\u8FBE\u4EBAv6", description: "\u5B8C\u6210100\u6B21\u6218\u6597", rarity: "rare", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_quest_master_v6", name: "\u4EFB\u52A1\u8FBE\u4EBAv6", description: "\u5B8C\u621050\u4E2A\u4EFB\u52A1", rarity: "rare", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_signin_30_v6", name: "\u7B7E\u5230\u4E4B\u661Fv6", description: "\u7D2F\u8BA1\u7B7E\u523030\u5929", rarity: "epic", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_wealth_v6", name: "\u5BCC\u7532\u4E00\u65B9v6", description: "\u7D2F\u8BA1\u83B7\u5F9710000\u7075\u77F3", rarity: "rare", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_legend_v6", name: "\u4F20\u8BF4\u4FEE\u58EBv6", description: "\u7D2F\u8BA1\u83B7\u5F9750000\u7075\u77F3", rarity: "legendary", obtained: false, equipped: false, obtainedAt: null },
            { id: "badge_rare_collector_v6", name: "\u7A00\u6709\u6536\u85CF\u5BB6v6", description: "\u6536\u96C65\u4E2A\u7A00\u6709\u5FBD\u7AE0", rarity: "epic", obtained: false, equipped: false, obtainedAt: null }
          ],
          totalBadges: 0,
          equippedBadges: []
        };
        this.gs.badgeV6.totalBadges = this.gs.badgeV6.badges.length;
      }
      return this.gs.badgeV6;
    }
    /**
     * 获取徽章列表 (V114/V137基础版)
     */
    mcpBadgeList() {
      try {
        const badge = this._initBadgeState();
        return {
          success: true,
          badges: badge.badges,
          total: badge.badges.length,
          equippedCount: badge.equippedBadges.length
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 装备徽章 (V114/V137基础版)
     */
    mcpBadgeEquip(badgeId) {
      try {
        const badge = this._initBadgeState();
        const b = badge.badges.find((b2) => b2.id === badgeId);
        if (!b) return { error: "\u5FBD\u7AE0\u4E0D\u5B58\u5728" };
        if (!b.obtained) return { error: "\u5FBD\u7AE0\u672A\u83B7\u53D6\uFF0C\u65E0\u6CD5\u88C5\u5907" };
        if (b.equipped) {
          b.equipped = false;
          badge.equippedBadges = badge.equippedBadges.filter((id) => id !== badgeId);
          return { success: true, badgeId, equipped: false };
        }
        if (badge.equippedBadges.length >= MAX_EQUIPPED_BADGES2) {
          return { error: "\u6700\u591A\u53EA\u80FD\u88C5\u5907" + MAX_EQUIPPED_BADGES2 + "\u4E2A\u5FBD\u7AE0" };
        }
        b.equipped = true;
        badge.equippedBadges.push(badgeId);
        return { success: true, badgeId, equipped: true };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 卸下徽章 (V114/V137基础版)
     */
    mcpBadgeUnequip() {
      try {
        const badge = this._initBadgeState();
        const equipped = badge.badges.find((b) => b.equipped);
        if (!equipped) return { error: "\u6CA1\u6709\u88C5\u5907\u7684\u5FBD\u7AE0" };
        equipped.equipped = false;
        badge.equippedBadges = badge.equippedBadges.filter((id) => id !== equipped.id);
        return { success: true, badgeId: equipped.id };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取徽章列表V2 (V155)
     */
    mcpBadgeListV2() {
      try {
        const badgeV2 = this._initBadgeStateV2();
        return {
          success: true,
          badges: badgeV2.badges.map((b) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            rarity: b.rarity,
            effect: b.effect,
            obtained: b.obtained,
            equipped: b.equipped
          })),
          totalBadges: badgeV2.totalBadges,
          equippedCount: badgeV2.equippedBadges.length
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 装备徽章V2 (V155)
     */
    mcpBadgeEquipV2(badgeId) {
      try {
        const badgeV2 = this._initBadgeStateV2();
        const b = badgeV2.badges.find((b2) => b2.id === badgeId);
        if (!b) return { error: "\u5FBD\u7AE0\u4E0D\u5B58\u5728" };
        if (!b.obtained) return { error: "\u5FBD\u7AE0\u672A\u83B7\u53D6\uFF0C\u65E0\u6CD5\u88C5\u5907" };
        if (b.equipped) {
          b.equipped = false;
          badgeV2.equippedBadges = badgeV2.equippedBadges.filter((id) => id !== badgeId);
          return { success: true, badgeId, equipped: false };
        }
        if (badgeV2.equippedBadges.length >= MAX_EQUIPPED_BADGES2) {
          return { error: "\u6700\u591A\u53EA\u80FD\u88C5\u5907" + MAX_EQUIPPED_BADGES2 + "\u4E2A\u5FBD\u7AE0" };
        }
        b.equipped = true;
        badgeV2.equippedBadges.push(badgeId);
        return { success: true, badgeId, equipped: true };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 卸下徽章V2 (V155)
     */
    mcpBadgeUnequipV2(badgeId) {
      try {
        const badgeV2 = this._initBadgeStateV2();
        if (badgeId) {
          const b = badgeV2.badges.find((b2) => b2.id === badgeId);
          if (!b) return { error: "\u5FBD\u7AE0\u4E0D\u5B58\u5728" };
          b.equipped = false;
          badgeV2.equippedBadges = badgeV2.equippedBadges.filter((id) => id !== badgeId);
          return { success: true, badgeId };
        }
        for (const b of badgeV2.badges) {
          if (b.equipped) b.equipped = false;
        }
        badgeV2.equippedBadges = [];
        return { success: true };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取徽章列表V3 (V165)
     */
    mcpBadgeListV3() {
      try {
        const badgeV3 = this._initBadgeStateV3();
        return {
          success: true,
          badges: badgeV3.badges.map((b) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            rarity: b.rarity,
            effect: b.effect,
            obtained: b.obtained,
            equipped: b.equipped,
            obtainedAt: b.obtainedAt
          })),
          totalBadges: badgeV3.totalBadges,
          obtainedCount: badgeV3.badges.filter((b) => b.obtained).length,
          equippedCount: badgeV3.equippedBadges.length
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 装备徽章V3 (V165)
     */
    mcpBadgeEquipV3(badgeId) {
      try {
        const badgeV3 = this._initBadgeStateV3();
        const b = badgeV3.badges.find((b2) => b2.id === badgeId);
        if (!b) return { error: "\u5FBD\u7AE0\u4E0D\u5B58\u5728" };
        if (!b.obtained) return { error: "\u5FBD\u7AE0\u672A\u83B7\u53D6\uFF0C\u65E0\u6CD5\u88C5\u5907" };
        if (b.equipped) {
          b.equipped = false;
          badgeV3.equippedBadges = badgeV3.equippedBadges.filter((id) => id !== badgeId);
          return { success: true, badgeId, equipped: false, equippedBadges: badgeV3.equippedBadges };
        }
        if (badgeV3.equippedBadges.length >= MAX_EQUIPPED_BADGES2) {
          return { error: "\u6700\u591A\u53EA\u80FD\u88C5\u5907" + MAX_EQUIPPED_BADGES2 + "\u4E2A\u5FBD\u7AE0\uFF0C\u8BF7\u5148\u5378\u4E0B\u4E00\u4E2A" };
        }
        b.equipped = true;
        badgeV3.equippedBadges.push(badgeId);
        return { success: true, badgeId, equipped: true, equippedBadges: badgeV3.equippedBadges };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取徽章列表V6 (V195/V203)
     */
    mcpBadgeListV6(filter = "all") {
      try {
        const badgeV6 = this._initBadgeStateV6();
        let badges = badgeV6.badges;
        if (filter === "obtained") {
          badges = badges.filter((b) => b.obtained);
        } else if (filter === "equipped") {
          badges = badges.filter((b) => b.equipped);
        }
        const obtainedCount = badgeV6.badges.filter((b) => b.obtained).length;
        const equippedCount = badgeV6.badges.filter((b) => b.equipped).length;
        return {
          success: true,
          badges: badges.map((b) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            rarity: b.rarity,
            obtained: b.obtained,
            equipped: b.equipped,
            obtainedAt: b.obtainedAt
          })),
          totalBadges: badgeV6.totalBadges,
          obtainedCount,
          equippedCount
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 装备徽章V6 (V195/V203)
     */
    mcpBadgeEquipV6(badgeId) {
      try {
        const badgeV6 = this._initBadgeStateV6();
        if (!badgeId) return { error: "\u8BF7\u6307\u5B9A\u5FBD\u7AE0ID" };
        const badge = badgeV6.badges.find((b) => b.id === badgeId);
        if (!badge) return { error: "\u5FBD\u7AE0\u4E0D\u5B58\u5728" };
        if (!badge.obtained) return { error: "\u5FBD\u7AE0\u672A\u83B7\u53D6\uFF0C\u65E0\u6CD5\u88C5\u5907" };
        if (badge.equipped) {
          badge.equipped = false;
          badgeV6.equippedBadges = badgeV6.equippedBadges.filter((id) => id !== badgeId);
          return { success: true, badgeId, equipped: false, equippedBadges: badgeV6.equippedBadges };
        }
        if (badgeV6.equippedBadges.length >= MAX_EQUIPPED_BADGES2) {
          return { error: "\u6700\u591A\u53EA\u80FD\u88C5\u5907" + MAX_EQUIPPED_BADGES2 + "\u4E2A\u5FBD\u7AE0\uFF0C\u8BF7\u5148\u5378\u4E0B\u4E00\u4E2A" };
        }
        badge.equipped = true;
        badgeV6.equippedBadges.push(badgeId);
        return { success: true, badgeId, equipped: true, equippedBadges: badgeV6.equippedBadges };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 徽章展示V8 (V213)
     */
    mcpBadgeShowV8(badgeId) {
      try {
        const badgeV6 = this._initBadgeStateV6();
        if (!badgeId) return { error: "\u8BF7\u6307\u5B9A\u5FBD\u7AE0ID" };
        const badge = badgeV6.badges.find((b) => b.id === badgeId);
        if (!badge) return { error: "\u5FBD\u7AE0\u4E0D\u5B58\u5728" };
        return {
          success: true,
          badge: {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            rarity: badge.rarity,
            effect: badge.effect,
            obtained: badge.obtained,
            equipped: badge.equipped
          },
          message: badge.obtained ? badge.name + " - " + badge.effect : "\u5FBD\u7AE0\u672A\u83B7\u53D6"
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 授予徽章（内部方法，用于成就奖励等）
     */
    grantBadge(badgeId) {
      const badgeV6 = this._initBadgeStateV6();
      const badge = badgeV6.badges.find((b) => b.id === badgeId);
      if (!badge) return { success: false, message: "\u5FBD\u7AE0\u4E0D\u5B58\u5728" };
      if (badge.obtained) return { success: false, message: "\u5FBD\u7AE0\u5DF2\u83B7\u53D6" };
      badge.obtained = true;
      badge.obtainedAt = (/* @__PURE__ */ new Date()).toISOString();
      return { success: true, badgeId, message: "\u83B7\u5F97\u5FBD\u7AE0: " + badge.name };
    }
    /**
     * 获取已装备徽章的效果加成
     */
    getEquippedBadgeEffects() {
      const badgeV6 = this._initBadgeStateV6();
      const equippedBadges = badgeV6.badges.filter((b) => b.equipped);
      const effects = {
        statBonus: {},
        spiritBonus: 0,
        stoneBonus: 0,
        battleStatBonus: 0,
        critRateBonus: 0,
        cultivationSpeedBonus: 0
      };
      for (const badge of equippedBadges) {
        if (badge.effectType === "stat_bonus" && badge.stats) {
          for (const [stat, value] of Object.entries(badge.stats)) {
            effects.statBonus[stat] = (effects.statBonus[stat] || 0) + value;
          }
        }
        if (badge.effectType === "spirit_rate") effects.spiritBonus += badge.effectValue || 0;
        if (badge.effectType === "stone_rate") effects.stoneBonus += badge.effectValue || 0;
        if (badge.effectType === "battle_stat") effects.battleStatBonus += badge.effectValue || 0;
        if (badge.effectType === "crit_rate") effects.critRateBonus += badge.effectValue || 0;
        if (badge.effectType === "cultivation_speed") effects.cultivationSpeedBonus += badge.effectValue || 0;
      }
      return effects;
    }
    /**
     * 获取徽章统计信息
     */
    getBadgeStats() {
      const badgeV6 = this._initBadgeStateV6();
      const badges = badgeV6.badges;
      const stats = {
        total: badges.length,
        obtained: badges.filter((b) => b.obtained).length,
        equipped: badges.filter((b) => b.equipped).length,
        byRarity: {}
      };
      const rarities = Object.values(BadgeRarity2);
      for (const rarity of rarities) {
        const rarityBadges = badges.filter((b) => b.rarity === rarity);
        stats.byRarity[rarity] = {
          total: rarityBadges.length,
          obtained: rarityBadges.filter((b) => b.obtained).length
        };
      }
      return stats;
    }
    /**
     * 检查是否满足稀有收藏家成就条件
     */
    checkRareCollectorAchievement() {
      const badgeV6 = this._initBadgeStateV6();
      const rareObtained = badgeV6.badges.filter((b) => b.rarity === "rare" && b.obtained).length;
      return rareObtained >= 5;
    }
  };

  // src/domains/achievement/AchievementModule.js
  var ACHIEVEMENT_STATE_INITIALIZERS = {
    V114: "_initAchievementState",
    V124: "_initAchievementState",
    V137: "_initAchievementState",
    V155: "_initAchievementStateV2",
    V165: "_initAchievementStateV3",
    V175: "_initAchievementStateV4",
    V185: "_initAchievementStateV5",
    V195: "_initAchievementStateV6",
    V203: "_initAchievementStateV7"
  };
  var BADGE_STATE_INITIALIZERS = {
    V114: "_initBadgeState",
    V137: "_initBadgeState",
    V155: "_initBadgeStateV2",
    V165: "_initBadgeStateV3",
    V175: "_initBadgeStateV4",
    V185: "_initBadgeStateV5",
    V195: "_initBadgeStateV6",
    V203: "_initBadgeStateV7"
  };
  var ACHIEVEMENT_API_METHODS = [
    "mcpAchievementList",
    "mcpAchievementView",
    "mcpAchievementUnlock",
    "mcpAchievementReward",
    "mcpAchievementListV2",
    "mcpAchievementViewV2",
    "mcpAchievementUnlockV2",
    "mcpAchievementRewardV2",
    "mcpAchievementListV3",
    "mcpAchievementViewV3",
    "mcpAchievementUnlockV3",
    "mcpAchievementRewardV3",
    "mcpAchievementListV4",
    "mcpAchievementViewV4",
    "mcpAchievementUnlockV4",
    "mcpAchievementRewardV4",
    "mcpAchievementListV5",
    "mcpAchievementViewV5",
    "mcpAchievementUnlockV5",
    "mcpAchievementRewardV5",
    "mcpAchievementListV6",
    "mcpAchievementViewV6",
    "mcpAchievementUnlockV6",
    "mcpAchievementRewardV6",
    "mcpAchievementEarnV8",
    "mcpAchievementListV7",
    "mcpAchievementListV8",
    "mcpAchievementRewardV8"
  ];
  var BADGE_API_METHODS = [
    "mcpBadgeList",
    "mcpBadgeEquip",
    "mcpBadgeUnequip",
    "mcpBadgeListV2",
    "mcpBadgeEquipV2",
    "mcpBadgeUnequipV2",
    "mcpBadgeListV3",
    "mcpBadgeEquipV3",
    "mcpBadgeListV4",
    "mcpBadgeEquipV4",
    "mcpBadgeListV5",
    "mcpBadgeEquipV5",
    "mcpBadgeListV6",
    "mcpBadgeEquipV6",
    "mcpBadgeShowV8"
  ];
  function createAchievementModule(gameState3) {
    const achievementService = new AchievementService(gameState3);
    const badgeService = new BadgeService(gameState3);
    return {
      // 实体
      Achievement,
      Badge,
      // 服务
      achievementService,
      badgeService,
      // 配置
      ACHIEVEMENT_STATE_INITIALIZERS,
      BADGE_STATE_INITIALIZERS,
      MAX_EQUIPPED_BADGES,
      // API方法列表
      ACHIEVEMENT_API_METHODS,
      BADGE_API_METHODS,
      // 模块信息
      moduleName: "achievement",
      moduleVersion: "V195",
      moduleDescription: "\u6210\u5C31\u7CFB\u7EDF - \u5305\u542B\u6210\u5C31\u3001\u5FBD\u7AE0\u3001\u5956\u52B1\u7B49\u529F\u80FD"
    };
  }

  // src/domains/inventory/entities/Item.js
  var Item = class _Item {
    constructor(config) {
      this.id = config.id || Date.now().toString();
      this.name = config.name || "\u672A\u77E5\u7269\u54C1";
      this.type = config.type || "material";
      this.quantity = config.quantity || 1;
      this.quality = config.quality || "common";
      this.effect = config.effect || {};
      this.desc = config.desc || "";
      this.icon = config.icon || "\u{1F4E6}";
      this.price = config.price || 10;
      this.stackable = config.stackable !== void 0 ? config.stackable : true;
      this\u661F\u7EA7 = config.\u661F\u7EA7 || 1;
      this.grade = config.grade;
      this.level = config.level;
      this.maxLevel = config.maxLevel;
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
        "common": "#aaaaaa",
        "rare": "#00b894",
        "precious": "#6c5ce7",
        "legendary": "#fd79a8",
        "ultimate": "#fdcb6e"
      };
      return colors[this.quality] || colors.common;
    }
    /**
     * 获取物品出售价格
     */
    getSellPrice() {
      const basePrices = {
        "common": 10,
        "rare": 50,
        "precious": 200,
        "legendary": 1e3,
        "ultimate": 5e3
      };
      return basePrices[this.quality] || 10;
    }
    /**
     * 使用物品
     */
    use(gameState3) {
      switch (this.type) {
        case "pill":
          return this.usePill(gameState3);
        case "treasure":
          return this.equip(gameState3);
        default:
          return { success: false, reason: "\u6B64\u7269\u54C1\u65E0\u6CD5\u4F7F\u7528" };
      }
    }
    /**
     * 使用丹药
     */
    usePill(gameState3) {
      if (this.type !== "pill") {
        return { success: false, reason: "\u4E0D\u662F\u4E39\u836F\u7C7B\u578B" };
      }
      if (!this.effect || !this.effect.type) {
        return { success: false, reason: "\u4E39\u836F\u6548\u679C\u914D\u7F6E\u9519\u8BEF" };
      }
      switch (this.effect.type) {
        case "qi":
          gameState3.qi = Math.min(gameState3.maxQi, gameState3.qi + this.effect.value);
          break;
        case "mindset":
          gameState3.mindset = Math.min(100, gameState3.mindset + this.effect.value);
          break;
        case "breakthrough_boost":
        case "cultivate_speed":
        case "\u6E21\u52AB_mindset_protect":
          gameState3.activeEffects[this.effect.type] += this.effect.value;
          break;
        default:
          return { success: false, reason: "\u672A\u77E5\u7684\u4E39\u836F\u6548\u679C\u7C7B\u578B" };
      }
      return { success: true, effect: this.effect };
    }
    /**
     * 装备宝物
     */
    equip(gameState3) {
      var _a;
      if (this.type !== "treasure") {
        return { success: false, reason: "\u4E0D\u662F\u5B9D\u7269\u7C7B\u578B" };
      }
      const emptySlot = (_a = gameState3.equippedTreasures) == null ? void 0 : _a.findIndex((t) => t === null);
      if (emptySlot === -1) {
        return { success: false, reason: "\u88C5\u5907\u680F\u5DF2\u6EE1" };
      }
      gameState3.equippedTreasures[emptySlot] = {
        name: this.name,
        type: this.type,
        quality: this.quality,
        effect: this.effect,
        desc: this.desc,
        icon: this.icon,
        star: this.\u661F\u7EA7
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
        star: this.\u661F\u7EA7,
        grade: this.grade,
        level: this.level,
        maxLevel: this.maxLevel
      };
    }
    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
      return new _Item(data);
    }
  };
  var ITEM_TYPES = {
    MATERIAL: "material",
    PILL: "pill",
    TREASURE: "treasure",
    TECHNIQUE: "technique",
    CURRENCY: "currency",
    ACCESSORY: "accessory"
  };
  var ITEM_QUALITIES = {
    COMMON: "common",
    RARE: "rare",
    PRECIOUS: "precious",
    LEGENDARY: "legendary",
    ULTIMATE: "ultimate"
  };

  // src/domains/inventory/entities/Equipment.js
  var Equipment = class _Equipment {
    constructor(config) {
      this.id = config.id || Date.now().toString();
      this.name = config.name || "\u672A\u77E5\u88C5\u5907";
      this.type = config.type || "weapon";
      this.quality = config.quality || "common";
      this.slot = config.slot ?? 0;
      this.effect = config.effect || {};
      this.baseEffect = config.baseEffect || {};
      this.lawEffect = config.lawEffect || null;
      this.desc = config.desc || "";
      this.icon = config.icon || "\u2694\uFE0F";
      this.price = config.price || 100;
      this.star = config.star || 1;
      this.enhanced = config.enhanced || false;
      this.enhancementLevel = config.enhancementLevel || 0;
      this.evolutionReq = config.evolutionReq || null;
      this.bound = config.bound || false;
      this.permanent = config.permanent || false;
    }
    /**
     * 获取装备品质颜色
     */
    getQualityColor() {
      const colors = {
        "common": "#aaaaaa",
        "rare": "#00b894",
        "precious": "#6c5ce7",
        "legendary": "#fd79a8",
        "ultimate": "#fdcb6e"
      };
      return colors[this.quality] || colors.common;
    }
    /**
     * 获取装备品质名称
     */
    getQualityName() {
      const names = {
        "common": "\u51E1\u54C1",
        "rare": "\u826F\u54C1",
        "precious": "\u73CD\u54C1",
        "legendary": "\u4F20\u8BF4",
        "ultimate": "\u5929\u9053"
      };
      return names[this.quality] || "\u51E1\u54C1";
    }
    /**
     * 获取装备槽位名称
     */
    getSlotName() {
      const slotNames = {
        0: "\u6B66\u5668",
        1: "\u9632\u5177",
        2: "\u9970\u54C1",
        3: "\u5929\u9053"
      };
      return slotNames[this.slot] || "\u9970\u54C1";
    }
    /**
     * 计算装备基础属性加成
     */
    getBaseStats() {
      const stats = {};
      if (this.effect.type === "attack" || this.effect.type === "attackBonus") {
        stats.attackBonus = this.effect.value || 0;
      }
      if (this.effect.type === "defense" || this.effect.type === "defenseBonus") {
        stats.defenseBonus = this.effect.value || 0;
      }
      if (this.effect.hpBonus) {
        stats.hpBonus = this.effect.hpBonus;
      }
      if (this.effect.critBonus) {
        stats.critBonus = this.effect.critBonus;
      }
      return stats;
    }
    /**
     * 计算星级加成
     */
    getStarBonus() {
      const bonusPercent = (this.star - 1) * 0.1;
      return {
        attack: bonusPercent,
        defense: bonusPercent,
        all: bonusPercent * 0.5
      };
    }
    /**
     * 获取强化加成
     */
    getEnhancementBonus() {
      if (!this.enhanced) return {};
      const bonus = this.enhancementLevel * 0.05;
      return {
        attack: this.type === "weapon" ? bonus : 0,
        defense: this.type === "armor" ? bonus : 0,
        all: this.type === "accessory" ? bonus : 0
      };
    }
    /**
     * 检查是否可以进化
     */
    canEvolve(currentStar, spiritStones) {
      if (!this.evolutionReq) return { can: false, reason: "\u6B64\u88C5\u5907\u65E0\u6CD5\u8FDB\u5316" };
      if (currentStar < this.evolutionReq.star) {
        return { can: false, reason: `\u9700\u8981\u661F\u7EA7${this.evolutionReq.star}\u624D\u80FD\u8FDB\u5316` };
      }
      if (spiritStones < this.evolutionReq.stones) {
        return { can: false, reason: `\u9700\u8981${this.evolutionReq.stones}\u7075\u77F3\u624D\u80FD\u8FDB\u5316` };
      }
      return { can: true };
    }
    /**
     * 强化装备
     */
    enhance() {
      if (this.enhanced) {
        this.enhancementLevel++;
      } else {
        this.enhanced = true;
        this.enhancementLevel = 1;
      }
      return { success: true, level: this.enhancementLevel };
    }
    /**
     * 获取完整描述
     */
    getFullDesc() {
      let desc = this.desc;
      if (this.star > 1) {
        desc += ` (+${this.star - 1}\u7EA7)`;
      }
      if (this.enhanced) {
        desc += ` [\u5F3A\u5316+${this.enhancementLevel}]`;
      }
      if (this.lawEffect) {
        desc += `
\u6CD5\u5219\u6548\u679C: ${this.lawEffect.desc}`;
      }
      return desc;
    }
    /**
     * 检查装备是否有天道法则效果
     */
    hasLawEffect() {
      return this.lawEffect && this.lawEffect.type !== void 0;
    }
    /**
     * 获取天道法则效果类型
     */
    getLawEffectType() {
      var _a;
      return ((_a = this.lawEffect) == null ? void 0 : _a.type) || null;
    }
    /**
     * 序列化装备数据
     */
    serialize() {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        quality: this.quality,
        slot: this.slot,
        effect: this.effect,
        baseEffect: this.baseEffect,
        lawEffect: this.lawEffect,
        desc: this.desc,
        icon: this.icon,
        price: this.price,
        star: this.star,
        enhanced: this.enhanced,
        enhancementLevel: this.enhancementLevel,
        evolutionReq: this.evolutionReq,
        bound: this.bound,
        permanent: this.permanent
      };
    }
    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
      return new _Equipment(data);
    }
  };
  var EQUIPMENT_TYPES = {
    WEAPON: "weapon",
    ARMOR: "armor",
    ACCESSORY: "accessory",
    HEAVENLY: "heavenly"
  };
  var EQUIPMENT_SLOTS = {
    WEAPON: 0,
    ARMOR: 1,
    ACCESSORY: 2,
    HEAVENLY: 3
  };
  var HEAVENLY_DAO_SET_BONUSES = {
    "\u5929\u9053\u5957\u88C5": {
      pieces: ["\u5929\u9053\u5251\xB7\u6C38\u6052", "\u5929\u76FE\xB7\u4E0D\u706D", "\u5929\u547D\u73E0\xB7\u8F6E\u56DE"],
      count: 3,
      stats: { attackPercent: 0.25, defensePercent: 0.25, all_stats: 0.1 },
      twoPiece: "\u653B\u51FB+25%\uFF0C\u9632\u5FA1+25%",
      threePiece: "\u5168\u5C5E\u6027+10%\uFF0C\u89E3\u9501\u3010\u5929\u547D\u3011\u88AB\u52A8\uFF1A\u6BCF\u56DE\u5408\u6062\u590D1%\u6700\u5927\u751F\u547D",
      skill: "\u5929\u547D\uFF1A\u53D7\u5230\u81F4\u547D\u4F24\u5BB3\u65F6\uFF0C\u6D88\u8017\u5929\u9053\u6C14\u606F\u590D\u6D3B\uFF0C\u6062\u590D30%\u751F\u547D\uFF0C\u6BCF\u65E5\u9650\u4E00\u6B21"
    },
    "\u6CD5\u5219\u5957\u88C5": {
      pieces: ["\u5929\u7F5A\u4EE4", "\u9053\u79CD", "\u56E0\u679C\u955C"],
      count: 3,
      stats: { tribulation_power: 0.3, cultivation_speed: 0.25, serendipity_rate: 0.2 },
      twoPiece: "\u6E21\u52AB+30%\uFF0C\u4FEE\u70BC+25%",
      threePiece: "\u5947\u9047+20%\uFF0C\u89E3\u9501\u3010\u9053\u6CD5\u81EA\u7136\u3011\u88AB\u52A8\uFF1A\u6240\u6709\u6982\u7387\u52A0\u6210\u989D\u5916+15%",
      skill: "\u9053\u6CD5\u81EA\u7136\uFF1A\u6240\u6709\u6982\u7387\u89E6\u53D1\u6548\u679C\u63D0\u534715%\uFF0C\u5305\u62EC\u66B4\u51FB\u3001\u95EA\u907F\u3001\u987F\u609F\u7B49"
    },
    "\u7EC8\u6781\u5957\u88C5": {
      pieces: ["\u5929\u9053\u5251\xB7\u6C38\u6052", "\u5929\u76FE\xB7\u4E0D\u706D", "\u5929\u547D\u73E0\xB7\u8F6E\u56DE", "\u5929\u7F5A\u4EE4", "\u9053\u79CD", "\u56E0\u679C\u955C"],
      count: 6,
      stats: { attackPercent: 0.3, defensePercent: 0.3, all_stats: 0.2, critPercent: 0.15 },
      twoPiece: "\u653B\u51FB+30%\uFF0C\u9632\u5FA1+30%",
      threePiece: "\u5168\u5C5E\u6027+20%\uFF0C\u66B4\u51FB+15%",
      sixPiece: "\u89E3\u9501\u3010\u8D85\u8131\u3011\u88AB\u52A8\uFF1A\u6E21\u52AB\u5FC5\u5B9A\u6210\u529F\uFF0C\u4FEE\u70BC\u901F\u5EA6\u7FFB\u500D\uFF0C\u5BFF\u5143\u65E0\u9650\u5236",
      skill: "\u8D85\u8131\uFF1A\u514D\u75AB\u4E00\u5207\u8D1F\u9762\u72B6\u6001\uFF0C\u5BFF\u5143\u8017\u5C3D\u65F6\u81EA\u52A8\u8FDB\u5165\u8F6E\u56DE\u8F6C\u4E16\uFF0C\u4FDD\u7559\u5168\u90E8\u5C5E\u6027\u52A0\u6210"
    }
  };
  var ENHANCE_CONFIG2 = {
    levels: [
      { cost: 100, bonus: 0.05, desc: "\u5F3A\u5316+1: \u57FA\u7840\u5C5E\u6027+5%" },
      { cost: 500, bonus: 0.1, desc: "\u5F3A\u5316+2: \u57FA\u7840\u5C5E\u6027+10%" },
      { cost: 2e3, bonus: 0.15, desc: "\u5F3A\u5316+3: \u57FA\u7840\u5C5E\u6027+15%" },
      { cost: 5e3, bonus: 0.2, desc: "\u5F3A\u5316+4: \u57FA\u7840\u5C5E\u6027+20%" },
      { cost: 1e4, bonus: 0.3, desc: "\u5F3A\u5316+5: \u57FA\u7840\u5C5E\u6027+30%" }
    ],
    maxLevel: 5,
    stoneTypes: { common: 50, rare: 200, precious: 1e3, legendary: 5e3 }
  };

  // src/domains/inventory/services/InventoryService.js
  var InventoryService = class {
    constructor() {
      this.maxSlots = 20;
      this.inventory = [];
    }
    /**
     * 初始化背包
     */
    init(gameState3) {
      if (!gameState3.inventory) {
        gameState3.inventory = [];
      }
      if (!gameState3.maxInventorySlots) {
        gameState3.maxInventorySlots = 20;
      }
      if (!gameState3.equippedTreasures) {
        gameState3.equippedTreasures = [null, null, null, null];
      }
      this.maxSlots = gameState3.maxInventorySlots;
      this.inventory = gameState3.inventory;
      return gameState3;
    }
    /**
     * 添加物品到背包
     */
    addItem(gameState3, type, name, quantity, quality, effect, desc, icon, star, grade, level, maxLevel) {
      const existing = gameState3.inventory.find((item) => item.name === name && item.type === type);
      if (existing) {
        existing.quantity += quantity;
        return { success: true, added: quantity, total: existing.quantity };
      } else {
        if (gameState3.inventory.length >= gameState3.maxInventorySlots) {
          return { success: false, reason: "\u80CC\u5305\u5DF2\u6EE1" };
        }
        const itemObj = {
          id: Date.now().toString(),
          type,
          name,
          quantity,
          quality,
          effect: effect || {},
          desc: desc || "",
          icon: icon || "\u{1F4E6}",
          star: star || 1
        };
        if (type === "technique") {
          itemObj.grade = grade !== void 0 ? grade : 0;
          itemObj.level = level || 1;
          itemObj.maxLevel = maxLevel || 5;
        }
        gameState3.inventory.push(itemObj);
        return { success: true, added: quantity, total: quantity };
      }
    }
    /**
     * 添加物品对象到背包
     */
    addItemObj(gameState3, itemObj) {
      const existing = gameState3.inventory.find((i) => i.name === itemObj.name && i.type === itemObj.type);
      if (existing) {
        existing.quantity += itemObj.quantity;
        return { success: true, added: itemObj.quantity };
      } else {
        if (gameState3.inventory.length >= gameState3.maxInventorySlots) {
          return { success: false, reason: "\u80CC\u5305\u5DF2\u6EE1" };
        }
        gameState3.inventory.push({
          id: Date.now().toString(),
          type: itemObj.type,
          name: itemObj.name,
          quantity: itemObj.quantity,
          quality: itemObj.quality || "common",
          effect: itemObj.effect || {},
          desc: itemObj.desc || "",
          icon: itemObj.icon || "\u{1F4E6}",
          star: itemObj.star || 1
        });
        return { success: true, added: itemObj.quantity };
      }
    }
    /**
     * 移除物品
     */
    removeItem(gameState3, name, quantity) {
      const idx = gameState3.inventory.findIndex((i) => i.name === name);
      if (idx !== -1) {
        gameState3.inventory[idx].quantity -= quantity;
        if (gameState3.inventory[idx].quantity <= 0) {
          gameState3.inventory.splice(idx, 1);
        }
        return { success: true, removed: quantity };
      }
      return { success: false, reason: "\u7269\u54C1\u4E0D\u5B58\u5728" };
    }
    /**
     * 按ID移除物品
     */
    removeItemById(gameState3, itemId, quantity = 1) {
      const idx = gameState3.inventory.findIndex((i) => i.id === itemId);
      if (idx !== -1) {
        const item = gameState3.inventory[idx];
        const removeQty = Math.min(quantity, item.quantity);
        item.quantity -= removeQty;
        if (item.quantity <= 0) {
          gameState3.inventory.splice(idx, 1);
        }
        return { success: true, removed: removeQty };
      }
      return { success: false, reason: "\u7269\u54C1\u4E0D\u5B58\u5728" };
    }
    /**
     * 使用物品
     */
    useItem(gameState3, name) {
      const idx = gameState3.inventory.findIndex((i) => i.name === name);
      if (idx === -1) {
        return { success: false, reason: "\u7269\u54C1\u4E0D\u5B58\u5728" };
      }
      const item = gameState3.inventory[idx];
      if (item.quantity <= 0) {
        return { success: false, reason: "\u7269\u54C1\u6570\u91CF\u4E0D\u8DB3" };
      }
      switch (item.type) {
        case "pill":
          return this.usePill(gameState3, item, idx);
        case "treasure":
          return this.equipTreasure(gameState3, item, idx);
        default:
          return { success: false, reason: "\u6B64\u7269\u54C1\u65E0\u6CD5\u4F7F\u7528" };
      }
    }
    /**
     * 使用丹药
     */
    usePill(gameState3, item, idx) {
      const PILLS = {
        "\u805A\u7075\u4E39": { effect: { type: "qi", value: 50 } },
        "\u5FC3\u9B54\u4E39": { effect: { type: "mindset", value: 30 } },
        "\u91D1\u9AD3\u4E39": { effect: { type: "qi", value: 200 } },
        "\u7B51\u57FA\u4E39": { effect: { type: "breakthrough_boost", value: 0.2 } },
        "\u7834\u5883\u4E39": { effect: { type: "breakthrough_boost", value: 0.3 } },
        "\u6D17\u9AD3\u4E39": { effect: { type: "cultivate_speed", value: 0.1 } },
        "\u5B9A\u795E\u4E39": { effect: { type: "\u6E21\u52AB_mindset_protect", value: 0.5 } }
      };
      const pill = PILLS[item.name];
      if (!pill) {
        return { success: false, reason: "\u672A\u77E5\u4E39\u836F" };
      }
      item.quantity--;
      if (item.quantity <= 0) {
        gameState3.inventory.splice(idx, 1);
      }
      switch (pill.effect.type) {
        case "qi":
          gameState3.qi = Math.min(gameState3.maxQi, gameState3.qi + pill.effect.value);
          break;
        case "mindset":
          gameState3.mindset = Math.min(100, gameState3.mindset + pill.effect.value);
          break;
        case "breakthrough_boost":
        case "cultivate_speed":
        case "\u6E21\u52AB_mindset_protect":
          gameState3.activeEffects[pill.effect.type] += pill.effect.value;
          break;
      }
      return { success: true, pill: item.name, effect: pill.effect };
    }
    /**
     * 装备宝物
     */
    equipTreasure(gameState3, item, idx) {
      const emptySlot = gameState3.equippedTreasures.findIndex((t) => t === null);
      if (emptySlot === -1) {
        return { success: false, reason: "\u88C5\u5907\u680F\u5DF2\u6EE1" };
      }
      const star = item.star || 1;
      item.quantity--;
      if (item.quantity <= 0) {
        gameState3.inventory.splice(idx, 1);
      }
      gameState3.equippedTreasures[emptySlot] = {
        name: item.name,
        type: item.type,
        quality: item.quality,
        effect: item.effect,
        desc: item.desc,
        icon: item.icon,
        star
      };
      return { success: true, slot: emptySlot, treasure: item.name };
    }
    /**
     * 出售物品
     */
    sellItem(gameState3, idx) {
      let items = gameState3.inventory;
      const item = items[idx];
      if (!item) {
        return { success: false, reason: "\u7269\u54C1\u4E0D\u5B58\u5728" };
      }
      const sellPrice = this.getSellPrice(item);
      gameState3.spiritStones = (gameState3.spiritStones || 0) + sellPrice;
      item.quantity--;
      if (item.quantity <= 0) {
        items.splice(idx, 1);
      }
      return { success: true, sold: item.name, price: sellPrice };
    }
    /**
     * 丢弃物品
     */
    discardItem(gameState3, idx) {
      const items = gameState3.inventory;
      if (idx < 0 || idx >= items.length) {
        return { success: false, reason: "\u7269\u54C1\u4E0D\u5B58\u5728" };
      }
      const item = items[idx];
      items.splice(idx, 1);
      return { success: true, discarded: item.name };
    }
    /**
     * 获取物品出售价格
     */
    getSellPrice(item) {
      const basePrices = {
        "common": 10,
        "rare": 50,
        "precious": 200,
        "legendary": 1e3,
        "ultimate": 5e3
      };
      return basePrices[item.quality] || 10;
    }
    /**
     * 获取背包统计信息
     */
    getInventoryStats(gameState3) {
      const items = gameState3.inventory || [];
      const stats = {
        totalItems: items.length,
        totalSlots: gameState3.maxInventorySlots,
        usedSlots: items.length,
        freeSlots: gameState3.maxInventorySlots - items.length,
        byType: {},
        byQuality: {}
      };
      for (const item of items) {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + item.quantity;
        stats.byQuality[item.quality] = (stats.byQuality[item.quality] || 0) + 1;
      }
      return stats;
    }
    /**
     * 获取指定类型的物品
     */
    getItemsByType(gameState3, type) {
      return gameState3.inventory.filter((item) => item.type === type);
    }
    /**
     * 获取指定品质的物品
     */
    getItemsByQuality(gameState3, quality) {
      return gameState3.inventory.filter((item) => item.quality === quality);
    }
    /**
     * 扩展背包容量
     */
    expandSlots(gameState3, additionalSlots, cost) {
      if ((gameState3.spiritStones || 0) < cost) {
        return { success: false, reason: "\u7075\u77F3\u4E0D\u8DB3" };
      }
      gameState3.spiritStones -= cost;
      gameState3.maxInventorySlots += additionalSlots;
      return {
        success: true,
        newSlots: gameState3.maxInventorySlots,
        cost
      };
    }
    /**
     * 整理背包
     */
    organizeInventory(gameState3) {
      const merged = {};
      const result = [];
      for (const item of gameState3.inventory) {
        const key = `${item.name}_${item.type}`;
        if (merged[key]) {
          merged[key].quantity += item.quantity;
        } else {
          merged[key] = { ...item };
          result.push(merged[key]);
        }
      }
      gameState3.inventory = result;
      return { success: true, itemCount: result.length };
    }
    /**
     * 检查物品是否足够
     */
    hasItem(gameState3, name, quantity = 1) {
      const item = gameState3.inventory.find((i) => i.name === name);
      return item && item.quantity >= quantity;
    }
    /**
     * 获取物品数量
     */
    getItemCount(gameState3, name) {
      const item = gameState3.inventory.find((i) => i.name === name);
      return item ? item.quantity : 0;
    }
    /**
     * 清空背包
     */
    clearInventory(gameState3) {
      gameState3.inventory = [];
      return { success: true };
    }
  };
  var inventoryService2 = new InventoryService();

  // src/domains/inventory/services/CraftService.js
  var CraftService = class {
    constructor() {
      this.selectedCraftType = "alchemy";
      this.selectedRecipeName = null;
    }
    /**
     * 初始化制造系统
     */
    init(gameState3) {
      if (!gameState3.crafting) {
        gameState3.crafting = {
          furnace: { level: 1 },
          anvil: { level: 1 }
        };
      }
      return gameState3;
    }
    /**
     * 选择制造类型 (alchemy/forge)
     */
    selectCraftType(type) {
      this.selectedCraftType = type;
      this.selectedRecipeName = null;
      return { success: true, type };
    }
    /**
     * 选择配方
     */
    selectRecipe(name) {
      this.selectedRecipeName = name;
      return { success: true, recipe: name };
    }
    /**
     * 检查配方材料是否足够
     */
    checkMaterialsForRecipe(gameState3, recipe) {
      for (const [mat, qty] of Object.entries(recipe.materials)) {
        if (mat === "\u7075\u77F3") {
          if (gameState3.spiritStones < qty) return false;
        } else {
          const hasItem = gameState3.inventory.some(
            (item) => item.name === mat && item.quantity >= qty
          );
          if (!hasItem) return false;
        }
      }
      return true;
    }
    /**
     * 计算实际成功率
     */
    calculateSuccessRate(recipe, currentLevel) {
      const FURNACES2 = {
        "\u571F\u70BC\u4E39\u7089": { level: 1, successBonus: 0 },
        "\u7384\u94C1\u7194\u7089": { level: 2, successBonus: 0.15 },
        "\u5929\u5DE5\u795E\u7089": { level: 3, successBonus: 0.3 }
      };
      const ANVILS2 = {
        "\u571F\u70BC\u5668\u53F0": { level: 1, successBonus: 0 },
        "\u7384\u94C1\u7194\u7089": { level: 2, successBonus: 0.15 },
        "\u5929\u5DE5\u795E\u7089": { level: 3, successBonus: 0.3 }
      };
      const furnace = this.selectedCraftType === "alchemy" ? FURNACES2 : ANVILS2;
      const furnaceData = Object.values(furnace).find((f) => f.level === currentLevel);
      const furnaceBonus = furnaceData ? furnaceData.successBonus : 0;
      return Math.min(0.95, recipe.successRate + furnaceBonus);
    }
    /**
     * 执行制造
     */
    doCraft(gameState3, recipeName) {
      const recipes = this.selectedCraftType === "alchemy" ? ALCHEMY_RECIPES : FORGE_RECIPES;
      const recipe = recipes[recipeName];
      if (!recipe) {
        return { success: false, reason: "\u914D\u65B9\u4E0D\u5B58\u5728" };
      }
      const canCraft = this.checkMaterialsForRecipe(gameState3, recipe);
      if (!canCraft) {
        return { success: false, reason: "\u6750\u6599\u4E0D\u8DB3" };
      }
      const hasFuel = gameState3.spiritStones >= recipe.fuelCost;
      if (!hasFuel) {
        return { success: false, reason: "\u7075\u77F3\u4E0D\u8DB3(\u71C3\u6599)" };
      }
      for (const [mat, qty] of Object.entries(recipe.materials)) {
        if (mat === "\u7075\u77F3") {
          gameState3.spiritStones -= qty;
        } else {
          this.consumeMaterial(gameState3, mat, qty);
        }
      }
      gameState3.spiritStones -= recipe.fuelCost;
      const currentLevel = gameState3.crafting[this.selectedCraftType === "alchemy" ? "furnace" : "anvil"].level;
      const successRate = this.calculateSuccessRate(recipe, currentLevel);
      const roll = Math.random();
      const success = roll < successRate;
      if (success) {
        const quality = this.getRecipeQuality(recipeName, recipe);
        let resultItem;
        if (this.selectedCraftType === "alchemy") {
          resultItem = {
            type: "pill",
            name: recipeName,
            quality,
            effect: this.getPillEffect(recipeName),
            desc: recipe.desc,
            icon: recipe.icon || "\u{1F48A}"
          };
        } else {
          resultItem = {
            type: "treasure",
            name: recipeName,
            quality,
            effect: recipe.effect || {},
            desc: recipe.desc,
            icon: recipe.icon || "\u2694\uFE0F"
          };
        }
        const addResult = inventoryService.addItemObj(gameState3, { ...resultItem, quantity: 1 });
        return {
          success: true,
          item: resultItem,
          quality,
          addResult
        };
      } else {
        return {
          success: false,
          reason: "\u70BC\u5236\u5931\u8D25",
          materialsConsumed: true
        };
      }
    }
    /**
     * 消费材料
     */
    consumeMaterial(gameState3, matName, qty) {
      let remaining = qty;
      for (let i = gameState3.inventory.length - 1; i >= 0 && remaining > 0; i--) {
        const item = gameState3.inventory[i];
        if (item.name === matName) {
          const consume = Math.min(item.quantity, remaining);
          item.quantity -= consume;
          remaining -= consume;
          if (item.quantity <= 0) {
            gameState3.inventory.splice(i, 1);
          }
        }
      }
    }
    /**
     * 获取配方品质
     */
    getRecipeQuality(name, recipe) {
      const rate = recipe.successRate;
      if (rate >= 0.7) return "common";
      if (rate >= 0.5) return "rare";
      if (rate >= 0.35) return "precious";
      return "legendary";
    }
    /**
     * 获取丹药效果
     */
    getPillEffect(name) {
      const effects = {
        "\u56DE\u6C14\u4E39": { type: "attackBoost", value: 0.2 },
        "\u62A4\u4F53\u4E39": { type: "defenseBoost", value: 0.2 },
        "\u7834\u5984\u4E39": { type: "ignoreDefense", value: 1 },
        "\u56DE\u6625\u4E39": { type: "heal", value: 0.3 }
      };
      return effects[name] || { type: "unknown" };
    }
    /**
     * 选择炉/台
     */
    selectFurnace(name) {
      const furnace = this.selectedCraftType === "alchemy" ? FURNACES : ANVILS;
      if (furnace[name]) {
        return { success: true, level: furnace[name].level };
      }
      return { success: false, reason: "\u7089/\u53F0\u4E0D\u5B58\u5728" };
    }
    /**
     * 升级炉/台
     */
    upgradeFurnace(gameState3, name) {
      const furnace = this.selectedCraftType === "alchemy" ? FURNACES : ANVILS;
      const data = furnace[name];
      if (!data) {
        return { success: false, reason: "\u7089/\u53F0\u4E0D\u5B58\u5728" };
      }
      if (gameState3.spiritStones < data.cost) {
        return { success: false, reason: "\u7075\u77F3\u4E0D\u8DB3" };
      }
      gameState3.spiritStones -= data.cost;
      gameState3.crafting[this.selectedCraftType === "alchemy" ? "furnace" : "anvil"].level = data.level;
      return { success: true, newLevel: data.level, cost: data.cost };
    }
    /**
     * 获取配方列表
     */
    getRecipes() {
      return {
        alchemy: Object.entries(ALCHEMY_RECIPES).map(([name, recipe]) => ({
          name,
          desc: recipe.desc,
          materials: recipe.materials,
          successRate: recipe.successRate,
          fuelCost: recipe.fuelCost,
          icon: recipe.icon
        })),
        forge: Object.entries(FORGE_RECIPES).map(([name, recipe]) => ({
          name,
          desc: recipe.desc,
          materials: recipe.materials,
          successRate: recipe.successRate,
          fuelCost: recipe.fuelCost,
          icon: recipe.icon,
          effect: recipe.effect
        }))
      };
    }
    /**
     * 获取当前炉/台等级
     */
    getCurrentLevel(gameState3) {
      return gameState3.crafting[this.selectedCraftType === "alchemy" ? "furnace" : "anvil"].level;
    }
  };
  var ALCHEMY_RECIPES = {
    "\u56DE\u6C14\u4E39": { materials: { "\u7075\u8349": 3 }, successRate: 0.8, fuelCost: 100, desc: "\u6062\u590D20%\u7075\u529B", icon: "\u{1F48A}" },
    "\u7597\u4F24\u4E39": { materials: { "\u7075\u8349": 2, "\u5996\u517D\u8840": 1 }, successRate: 0.75, fuelCost: 100, desc: "\u6062\u590D30%\u751F\u547D", icon: "\u{1F48A}" },
    "\u805A\u7075\u4E39": { materials: { "\u7075\u77F3": 100, "\u7075\u8349": 5 }, successRate: 0.6, fuelCost: 100, desc: "\u4FEE\u70BC\u901F\u5EA6+20%\uFF0C\u6301\u7EED3\u5929", icon: "\u{1F48A}" },
    "\u7834\u5883\u4E39": { materials: { "\u7075\u77F3": 500, "\u5929\u6750": 2 }, successRate: 0.4, fuelCost: 100, desc: "\u7A81\u7834\u74F6\u9888\u6982\u7387+15%", icon: "\u{1F48A}" },
    "\u6E21\u52AB\u4E39": { materials: { "\u5929\u6750": 5, "\u7075\u77F3": 1e3 }, successRate: 0.3, fuelCost: 100, desc: "\u6E21\u52AB\u6210\u529F\u7387+10%", icon: "\u{1F48A}" },
    "\u6D17\u9AD3\u4E39": { materials: { "\u5929\u6750": 3, "\u7075\u77F3": 500 }, successRate: 0.5, fuelCost: 100, desc: "\u7075\u6839\u5237\u65B0", icon: "\u{1F48A}" },
    "\u6DF7\u6C8C\u4E39": { materials: { "\u6DF7\u6C8C\u77F3": 1, "\u5929\u6750": 10 }, successRate: 0.2, fuelCost: 100, desc: "\u4FDD\u5E95\u6DF7\u6C8C\u7075\u6839", icon: "\u{1F48A}", requireChaos: true }
  };
  var FORGE_RECIPES = {
    "\u51E1\u94C1\u5251": { materials: { "\u7384\u94C1": 5 }, successRate: 0.9, fuelCost: 200, effect: { type: "attack", value: 0.05 }, desc: "\u653B\u51FB+5%", icon: "\u2694\uFE0F" },
    "\u9752\u4E91\u5251": { materials: { "\u7384\u94C1": 10, "\u5929\u6750": 1 }, successRate: 0.6, fuelCost: 200, effect: { type: "attack", value: 0.15 }, desc: "\u653B\u51FB+15%", icon: "\u2694\uFE0F" },
    "\u6DF7\u5143\u73E0": { materials: { "\u5929\u6750": 5, "\u7075\u77F3": 1e3 }, successRate: 0.4, fuelCost: 200, effect: { type: "crit", value: 0.1 }, desc: "\u66B4\u51FB+10%", icon: "\u{1F52E}" },
    "\u91D1\u7F15\u8863": { materials: { "\u5929\u6750": 3, "\u5996\u517D\u76AE": 5 }, successRate: 0.5, fuelCost: 200, effect: { type: "hp", value: 0.1 }, desc: "\u751F\u547D+10%", icon: "\u{1F458}" },
    "\u907F\u706B\u7F69": { materials: { "\u5929\u6750": 2, "\u5996\u517D\u9AA8": 5 }, successRate: 0.45, fuelCost: 200, effect: { type: "fireResist", value: 0.3 }, desc: "\u706B\u6297+30%", icon: "\u{1F525}" },
    "\u5B9A\u795E\u73E0": { materials: { "\u5929\u6750": 5, "\u7075\u77F3": 2e3 }, successRate: 0.35, fuelCost: 200, effect: { type: "mindset", value: 0.2 }, desc: "\u7CBE\u795E\u72B6\u6001+20%", icon: "\u{1F4FF}" }
  };
  var ADVANCED_FORGE_RECIPES = {
    "\u7075\u5B9D\xB7\u82CD\u7A79\u5370": {
      materials: { "\u7384\u94C1": 20, "\u5929\u6750": 5, "\u6DF7\u6C8C\u77F3": 1 },
      fuelCost: 2e3,
      desc: "\u7075\u5B9D\xB7\u653B\u51FB+25%",
      icon: "\u{1F52E}",
      effect: { type: "attack", value: 0.25 }
    },
    "\u7075\u5B9D\xB7\u7384\u6B66\u7532": {
      materials: { "\u7384\u94C1": 20, "\u5929\u6750": 5, "\u6DF7\u6C8C\u77F3": 1 },
      fuelCost: 2e3,
      desc: "\u7075\u5B9D\xB7\u9632\u5FA1+25%",
      icon: "\u{1F6E1}\uFE0F",
      effect: { type: "defense", value: 0.25 }
    },
    "\u5723\u5668\xB7\u5929\u4F7F\u795E\u5251": {
      materials: { "\u5929\u6750": 10, "\u6DF7\u6C8C\u77F3": 3 },
      fuelCost: 8e3,
      desc: "\u5723\u5668\xB7\u653B\u51FB+40%",
      icon: "\u2694\uFE0F",
      effect: { type: "attack", value: 0.4 }
    },
    "\u5723\u5668\xB7\u5929\u4F7F\u795E\u7532": {
      materials: { "\u5929\u6750": 10, "\u6DF7\u6C8C\u77F3": 3 },
      fuelCost: 8e3,
      desc: "\u5723\u5668\xB7\u9632\u5FA1+40%",
      icon: "\u{1F458}",
      effect: { type: "defense", value: 0.4 }
    },
    "\u5723\u5668\xB7\u5929\u4F7F\u795E\u7FFC": {
      materials: { "\u5929\u6750": 10, "\u6DF7\u6C8C\u77F3": 3 },
      fuelCost: 8e3,
      desc: "\u5723\u5668\xB7\u5168\u5C5E\u6027+15%",
      icon: "\u{1F47C}",
      effect: { type: "all_stats", value: 0.15 }
    },
    "\u5929\u795E\u5668\xB7\u5929\u4F7F\u795E\u5251": {
      materials: { "\u5929\u6750": 20, "\u6DF7\u6C8C\u77F3": 8 },
      fuelCost: 2e4,
      desc: "\u5929\u795E\u5668\xB7\u653B\u51FB+60%",
      icon: "\u2694\uFE0F",
      effect: { type: "attack", value: 0.6 }
    },
    "\u5929\u795E\u5668\xB7\u5929\u4F7F\u795E\u7532": {
      materials: { "\u5929\u6750": 20, "\u6DF7\u6C8C\u77F3": 8 },
      fuelCost: 2e4,
      desc: "\u5929\u795E\u5668\xB7\u9632\u5FA1+60%",
      icon: "\u{1F458}",
      effect: { type: "defense", value: 0.6 }
    },
    "\u5929\u795E\u5668\xB7\u5929\u4F7F\u795E\u7FFC": {
      materials: { "\u5929\u6750": 20, "\u6DF7\u6C8C\u77F3": 8 },
      fuelCost: 2e4,
      desc: "\u5929\u795E\u5668\xB7\u5168\u5C5E\u6027+25%",
      icon: "\u{1F47C}",
      effect: { type: "all_stats", value: 0.25 }
    }
  };
  var FURNACES = {
    "\u571F\u70BC\u4E39\u7089": { level: 1, successBonus: 0, cost: 0, unlockCondition: "\u9ED8\u8BA4", desc: "\u57FA\u7840\u70BC\u4E39\u7089" },
    "\u7384\u94C1\u7194\u7089": { level: 2, successBonus: 0.15, cost: 8e4, unlockCondition: "\u5B97\u95E82\u7EA7\u621680000\u7075\u77F3", desc: "\u4E2D\u7EA7\u70BC\u4E39\u7089\uFF0C\u6210\u529F\u7387+15%" },
    "\u5929\u5DE5\u795E\u7089": { level: 3, successBonus: 0.3, cost: 3e5, unlockCondition: "\u5316\u795E\u671F", desc: "\u9AD8\u7EA7\u70BC\u4E39\u7089\uFF0C\u6210\u529F\u7387+30%" }
  };
  var ANVILS = {
    "\u571F\u70BC\u5668\u53F0": { level: 1, successBonus: 0, cost: 0, unlockCondition: "\u9ED8\u8BA4", desc: "\u57FA\u7840\u70BC\u5668\u53F0" },
    "\u7384\u94C1\u7194\u7089": { level: 2, successBonus: 0.15, cost: 8e4, unlockCondition: "\u5B97\u95E82\u7EA7\u621680000\u7075\u77F3", desc: "\u4E2D\u7EA7\u70BC\u5668\u53F0\uFF0C\u6210\u529F\u7387+15%" },
    "\u5929\u5DE5\u795E\u7089": { level: 3, successBonus: 0.3, cost: 3e5, unlockCondition: "\u5316\u795E\u671F", desc: "\u9AD8\u7EA7\u70BC\u5668\u53F0\uFF0C\u6210\u529F\u7387+30%" }
  };
  var MATERIALS = {
    "\u7075\u8349": { type: "herb", basePrice: 100, icon: "\u{1F33F}", desc: "\u666E\u901A\u7075\u8349\uFF0C\u70BC\u4E39\u6750\u6599" },
    "\u5996\u517D\u8840": { type: "beast", basePrice: 200, icon: "\u{1FA78}", desc: "\u5996\u517D\u8840\u6DB2\uFF0C\u70BC\u4E39\u70BC\u5668\u6750\u6599" },
    "\u5929\u6750": { type: "rare", basePrice: 500, icon: "\u2728", desc: "\u7A00\u6709\u5929\u6750\uFF0C\u9AD8\u7EA7\u6750\u6599" },
    "\u6DF7\u6C8C\u77F3": { type: "legendary", basePrice: 1667, icon: "\u{1F48E}", desc: "\u6DF7\u6C8C\u795E\u77F3\uFF0C\u4F20\u8BF4\u6750\u6599", requireChaos: true },
    "\u7384\u94C1": { type: "metal", basePrice: 100, icon: "\u{1F529}", desc: "\u7384\u94C1\u77FF\u7269\uFF0C\u70BC\u5668\u6750\u6599" },
    "\u5996\u517D\u76AE": { type: "beast", basePrice: 180, icon: "\u{1F43E}", desc: "\u5996\u517D\u76AE\u6BDB\uFF0C\u70BC\u5668\u6750\u6599" },
    "\u5996\u517D\u9AA8": { type: "beast", basePrice: 220, icon: "\u{1F9B4}", desc: "\u5996\u517D\u9AA8\u9ABC\uFF0C\u70BC\u5668\u6750\u6599" }
  };
  var craftService = new CraftService();

  // src/domains/inventory/InventoryModule.js
  function createItem(config) {
    return new Item(config);
  }
  function createEquipment(config) {
    return new Equipment(config);
  }
  function initInventory(gameState3) {
    return inventoryService2.init(gameState3);
  }
  function addItemToInventory2(gameState3, type, name, quantity, quality, effect, desc, icon, star, grade, level, maxLevel) {
    return inventoryService2.addItem(gameState3, type, name, quantity, quality, effect, desc, icon, star, grade, level, maxLevel);
  }
  function useItem(gameState3, name) {
    return inventoryService2.useItem(gameState3, name);
  }
  function getInventoryStats(gameState3) {
    return inventoryService2.getInventoryStats(gameState3);
  }
  function doCraft(gameState3, recipeName, craftType = "alchemy") {
    craftService.selectCraftType(craftType);
    return craftService.doCraft(gameState3, recipeName);
  }
  function getAllRecipes() {
    return craftService.getRecipes();
  }
  function equipTreasure(gameState3, item, idx) {
    return inventoryService2.equipTreasure(gameState3, item, idx);
  }
  function expandInventorySlots(gameState3, slots, cost) {
    return inventoryService2.expandSlots(gameState3, slots, cost);
  }
  var InventoryModule_default = {
    // Entities
    Item,
    ITEM_TYPES,
    ITEM_QUALITIES,
    Equipment,
    EQUIPMENT_TYPES,
    EQUIPMENT_SLOTS,
    HEAVENLY_DAO_SET_BONUSES,
    ENHANCE_CONFIG: ENHANCE_CONFIG2,
    // Services
    InventoryService,
    inventoryService: inventoryService2,
    CraftService,
    craftService,
    // Recipes
    ALCHEMY_RECIPES,
    FORGE_RECIPES,
    ADVANCED_FORGE_RECIPES,
    FURNACES,
    ANVILS,
    MATERIALS,
    // Helper functions
    createItem,
    createEquipment,
    initInventory,
    addItemToInventory: addItemToInventory2,
    useItem,
    getInventoryStats,
    doCraft,
    getAllRecipes,
    equipTreasure,
    expandInventorySlots
  };

  // src/domains/pet/PetModule.js
  init_Pet();

  // src/domains/pet/services/PetService.js
  var { Pet: Pet2, PET_TYPES: PET_TYPES2, PET_RARITY: PET_RARITY2, RARITY_COLORS: RARITY_COLORS3 } = (init_Pet(), __toCommonJS(Pet_exports));
  var TIER_POWER = {
    wolf: 15,
    tiger: 20,
    fox: 12,
    dragon: 30,
    phoenix: 25,
    turtle: 10
  };
  var PetService = class {
    constructor(gameState3) {
      this.gs = gameState3;
    }
    /**
     * 初始化宠物状态 (V132)
     */
    _initPetState() {
      if (!this.gs.pets) {
        this.gs.pets = [];
      }
      if (!this.gs.petState) {
        this.gs.petState = {
          pets: [],
          nextId: 1,
          captureCost: 200
        };
      }
      return this.gs.petState;
    }
    /**
     * 初始化进化状态 (V132)
     */
    _initEvolveState() {
      if (!this.gs.evolveState) {
        this.gs.evolveState = {
          preparing: false,
          inProgress: false,
          petId: null,
          startTime: null
        };
      }
      return this.gs.evolveState;
    }
    /**
     * 获取宠物列表 (V78基础版)
     */
    mcpPetList() {
      try {
        const pets = this.gs.pets || [];
        return { total: pets.length, pets };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 喂食宠物 (V78基础版)
     */
    mcpPetFeed(petId, food) {
      try {
        const pets = this.gs.pets || [];
        const pet = pets.find((p) => p.id === petId);
        if (!pet) return { error: "Pet not found: " + petId };
        const FOOD_BONUS = { normal: 5, premium: 15, super: 50 };
        pet.affinity = (pet.affinity || 0) + (FOOD_BONUS[food] || 5);
        return { success: true, petId, affinity: pet.affinity, bonus: FOOD_BONUS[food] || 5 };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 宠物进化 (V78基础版)
     */
    mcpPetEvolve(petId, stones) {
      try {
        const pets = this.gs.pets || [];
        const pet = pets.find((p) => p.id === petId);
        if (!pet) return { error: "Pet not found: " + petId };
        const cost = (stones || 1) * 50;
        if ((this.gs.spiritStones || 0) < cost) return { error: "Not enough spirit stones" };
        this.gs.spiritStones -= cost;
        pet.stage = (pet.stage || 1) + 1;
        pet.evolutionCost = cost;
        return { success: true, petId, newStage: pet.stage, cost, remaining: this.gs.spiritStones };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 宠物技能管理 (V78基础版)
     */
    mcpPetSkill(petId, action, skillId) {
      try {
        const pets = this.gs.pets || [];
        const pet = pets.find((p) => p.id === petId);
        if (!pet) return { error: "Pet not found: " + petId };
        if (!pet.skills) pet.skills = [];
        if (action === "learn") {
          if (pet.skills.length >= 4) return { error: "Pet already has 4 skills" };
          pet.skills.push({ id: skillId || "skill_" + Date.now(), level: 1 });
          return { success: true, skill: pet.skills[pet.skills.length - 1] };
        }
        if (action === "upgrade") {
          const skill = pet.skills.find((s) => s.id === skillId);
          if (!skill) return { error: "Skill not found: " + skillId };
          skill.level = (skill.level || 1) + 1;
          return { success: true, skill };
        }
        if (action === "forget") {
          pet.skills = pet.skills.filter((s) => s.id !== skillId);
          return { success: true, remaining: pet.skills.length };
        }
        return { error: "Invalid action: " + action };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取灵宠列表 (V132)
     */
    mcpPetList() {
      try {
        const petState = this._initPetState();
        return {
          success: true,
          total: petState.pets.length,
          pets: petState.pets,
          captureCost: petState.captureCost
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 捕捉灵宠 (V132)
     */
    mcpPetCapture() {
      try {
        const petState = this._initPetState();
        const cost = petState.captureCost;
        if ((this.gs.spiritStones || 0) < cost) {
          return { error: "\u7075\u77F3\u4E0D\u8DB3\uFF0C\u6355\u6349\u9700\u8981 " + cost + " \u7075\u77F3" };
        }
        this.gs.spiritStones -= cost;
        const species = ["\u7075\u72D0", "\u7384\u9F9F", "\u706B\u9E64", "\u7389\u5154", "\u94F6\u72FC", "\u9752\u86C7", "\u767D\u864E", "\u91D1\u9E4F"];
        const speciesIndex = Math.floor(Math.random() * species.length);
        const baseLevel = Math.floor(Math.random() * 3) + 1;
        const names = ["\u5C0F\u4ED9", "\u7075\u513F", "\u5C0F\u767D", "\u963F\u798F", "\u6735\u6735", "\u5A01\u5A01", "\u5706\u5706", "\u58EE\u58EE"];
        const nameIndex = Math.floor(Math.random() * names.length);
        const pet = new Pet2({
          id: "pet_" + petState.nextId++,
          name: names[nameIndex],
          species: species[speciesIndex],
          level: baseLevel,
          evolutionStage: 1,
          stats: {
            attack: 10 + baseLevel * 5,
            defense: 5 + baseLevel * 3,
            spirit: 8 + baseLevel * 4
          }
        });
        petState.pets.push(pet.toJSON());
        return { success: true, pet: pet.toJSON(), cost, message: "\u6355\u6349\u6210\u529F\uFF01\u83B7\u5F97 " + pet.species + " \u3010" + pet.name + "\u3011" };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 放生灵宠 (V132)
     */
    mcpPetRelease(petId) {
      try {
        const petState = this._initPetState();
        const idx = petState.pets.findIndex((p) => p.id === petId);
        if (idx === -1) return { error: "\u7075\u5BA0\u4E0D\u5B58\u5728: " + petId };
        const pet = petState.pets[idx];
        petState.pets.splice(idx, 1);
        return { success: true, pet, message: "\u653E\u751F\u4E86 " + pet.species + " \u3010" + pet.name + "\u3011" };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 准备进化 (V132)
     */
    mcpEvolvePrepare(petId) {
      try {
        const petState = this._initPetState();
        const evolveState = this._initEvolveState();
        const pet = petState.pets.find((p) => p.id === petId);
        if (!pet) return { error: "\u7075\u5BA0\u4E0D\u5B58\u5728: " + petId };
        if (pet.level < 5) {
          return { success: false, petId, message: pet.name + " \u7B49\u7EA7\u4E0D\u8DB3\uFF0C\u9700\u89815\u7EA7\u624D\u80FD\u8FDB\u5316", levelRequired: 5, currentLevel: pet.level };
        }
        if (pet.evolutionStage >= 3) {
          return { success: false, petId, message: pet.name + " \u5DF2\u8FBE\u6700\u9AD8\u8FDB\u5316\u9636\u6BB5", maxStage: 3 };
        }
        evolveState.preparing = true;
        evolveState.petId = petId;
        return {
          success: true,
          petId,
          petName: pet.name,
          currentStage: pet.evolutionStage,
          nextStage: pet.evolutionStage + 1,
          message: pet.name + " \u5DF2\u51C6\u5907\u597D\u8FDB\u5316\uFF0C\u5F53\u524D\u9636\u6BB5 " + pet.evolutionStage + "\uFF0C\u53EF\u8FDB\u5316\u81F3 " + (pet.evolutionStage + 1)
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 开始进化 (V132)
     */
    mcpEvolveStart() {
      try {
        const petState = this._initPetState();
        const evolveState = this._initEvolveState();
        if (!evolveState.preparing || !evolveState.petId) {
          return { error: "\u6CA1\u6709\u51C6\u5907\u8FDB\u5316\u7684\u7075\u5BA0\uFF0C\u8BF7\u5148\u8C03\u7528 evolve.prepare" };
        }
        const pet = petState.pets.find((p) => p.id === evolveState.petId);
        if (!pet) return { error: "\u7075\u5BA0\u4E0D\u5B58\u5728\uFF0C\u53EF\u80FD\u5DF2\u88AB\u653E\u751F" };
        evolveState.preparing = false;
        evolveState.inProgress = true;
        evolveState.startTime = Date.now();
        return {
          success: true,
          petId: pet.id,
          petName: pet.name,
          message: pet.name + " \u5F00\u59CB\u8FDB\u5316\uFF0C\u8BF7\u7B49\u5F85\u540E\u8C03\u7528 evolve.complete \u5B8C\u6210\u8FDB\u5316"
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 完成进化 (V132)
     */
    mcpEvolveComplete() {
      try {
        const petState = this._initPetState();
        const evolveState = this._initEvolveState();
        if (!evolveState.inProgress || !evolveState.petId) {
          return { error: "\u6CA1\u6709\u6B63\u5728\u8FDB\u5316\u7684\u7075\u5BA0\uFF0C\u8BF7\u5148\u8C03\u7528 evolve.start" };
        }
        const pet = petState.pets.find((p) => p.id === evolveState.petId);
        if (!pet) return { error: "\u7075\u5BA0\u4E0D\u5B58\u5728\uFF0C\u53EF\u80FD\u5DF2\u88AB\u653E\u751F" };
        const oldLevel = pet.level;
        const oldStage = pet.evolutionStage;
        pet.level += 2;
        pet.evolutionStage += 1;
        pet.stats.attack = Math.floor(pet.stats.attack * 1.3);
        pet.stats.defense = Math.floor(pet.stats.defense * 1.3);
        pet.stats.spirit = Math.floor(pet.stats.spirit * 1.3);
        const evolvedPetId = evolveState.petId;
        evolveState.inProgress = false;
        evolveState.petId = null;
        evolveState.startTime = null;
        return {
          success: true,
          petId: evolvedPetId,
          petName: pet.name,
          oldLevel,
          newLevel: pet.level,
          oldStage,
          newStage: pet.evolutionStage,
          statsUpgrade: pet.stats,
          message: pet.name + " \u8FDB\u5316\u6210\u529F\uFF01\u7B49\u7EA7 " + oldLevel + " -> " + pet.level + "\uFF0C\u9636\u6BB5 " + oldStage + " -> " + pet.evolutionStage
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 捕捉灵兽 (V85)
     */
    mcpPetCapture(type, bait) {
      try {
        const VALID_TYPES = ["wolf", "tiger", "fox", "dragon", "phoenix", "turtle"];
        if (!VALID_TYPES.includes(type)) return { error: "Invalid pet type" };
        const BAIT_COST = { low: 50, medium: 150, high: 400, premium: 1e3 };
        const BAIT_SUCCESS = { low: 0.4, medium: 0.65, high: 0.85, premium: 0.95 };
        const b = bait || "medium";
        const cost = BAIT_COST[b];
        this.gs.spiritStones = this.gs.spiritStones || 0;
        if (this.gs.spiritStones < cost) {
          return { error: "Not enough spirit stones", required: cost, available: this.gs.spiritStones };
        }
        const roll = Math.random();
        const successRate = BAIT_SUCCESS[b];
        if (roll > successRate) {
          this.gs.spiritStones -= cost;
          return { success: false, reason: "Pet escaped", cost, remainingStones: this.gs.spiritStones };
        }
        this.gs.spiritStones -= cost;
        this.gs.pets = this.gs.pets || [];
        const petId = "PET_" + Date.now();
        const newPet = {
          id: petId,
          type,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          form: "child",
          level: 1,
          power: TIER_POWER[type] || 10,
          intimacy: 0,
          hunger: 0,
          active: true,
          skills: [],
          equipped: null,
          loyalty: 50,
          potential: Math.floor(Math.random() * 30) + 70,
          captureCost: cost,
          capturedAt: Date.now()
        };
        this.gs.pets.push(newPet);
        return { success: true, pet: newPet, cost, remainingStones: this.gs.spiritStones };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取宠物列表 (V85)
     */
    mcpPetListV85(filter) {
      try {
        const pets = this.gs.pets || [];
        const f = filter || "all";
        let filtered = pets;
        if (f === "active") filtered = pets.filter((p) => p.active);
        else if (f === "released") filtered = pets.filter((p) => !p.active);
        return { pets: filtered, total: filtered.length };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 喂食灵兽 (V85)
     */
    mcpPetFeedV85(petId, food) {
      try {
        this.gs.pets = this.gs.pets || [];
        const pet = this.gs.pets.find((p) => p.id === petId);
        if (!pet) return { error: "Pet not found" };
        if (!pet.active) return { error: "Pet has been released" };
        const FOOD_INTIMACY = { basic: 5, premium: 15, super: 30 };
        const FOOD_COST = { basic: 20, premium: 80, super: 200 };
        const f = food || "basic";
        const cost = FOOD_COST[f];
        this.gs.spiritStones = this.gs.spiritStones || 0;
        if (this.gs.spiritStones < cost) {
          return { error: "Not enough spirit stones", required: cost, available: this.gs.spiritStones };
        }
        this.gs.spiritStones -= cost;
        pet.hunger = Math.max(0, pet.hunger - 20);
        pet.intimacy = Math.min(100, pet.intimacy + FOOD_INTIMACY[f]);
        pet.loyalty = Math.min(100, pet.loyalty + 2);
        return { success: true, petId: pet.id, intimacy: pet.intimacy, loyalty: pet.loyalty, hunger: pet.hunger, cost };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 灵兽进化 (V85)
     */
    mcpPetEvolveV85(petId, targetForm) {
      try {
        this.gs.pets = this.gs.pets || [];
        const pet = this.gs.pets.find((p) => p.id === petId);
        if (!pet) return { error: "Pet not found" };
        if (!pet.active) return { error: "Pet has been released" };
        const VALID_FORMS = ["adult", "mutant", "divine"];
        if (!VALID_FORMS.includes(targetForm)) return { error: "Invalid target form" };
        const FORM_ORDER = ["child", "adult", "mutant", "divine"];
        const currentIdx = FORM_ORDER.indexOf(pet.form);
        const targetIdx = FORM_ORDER.indexOf(targetForm);
        if (targetIdx <= currentIdx) return { error: "Target form must be higher than current" };
        const INTIMACY_REQUIRED = { adult: 30, mutant: 60, divine: 90 };
        if (pet.intimacy < INTIMACY_REQUIRED[targetForm]) {
          return { error: `Intimacy ${pet.intimacy} below required ${INTIMACY_REQUIRED[targetForm]} for ${targetForm}` };
        }
        const EVO_COST = { adult: 500, mutant: 2e3, divine: 8e3 };
        const cost = EVO_COST[targetForm];
        this.gs.spiritStones = this.gs.spiritStones || 0;
        if (this.gs.spiritStones < cost) {
          return { error: "Not enough spirit stones", required: cost, available: this.gs.spiritStones };
        }
        this.gs.spiritStones -= cost;
        pet.form = targetForm;
        pet.power = Math.round(pet.power * (1 + (targetIdx - currentIdx) * 0.3));
        pet.level = Math.min(99, pet.level + 5);
        return { success: true, petId: pet.id, newForm: pet.form, newPower: pet.power, newLevel: pet.level, cost };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 放生灵兽 (V85)
     */
    mcpPetReleaseV85(petId) {
      try {
        this.gs.pets = this.gs.pets || [];
        const pet = this.gs.pets.find((p) => p.id === petId);
        if (!pet) return { error: "Pet not found" };
        if (!pet.active) return { error: "Pet already released" };
        pet.active = false;
        pet.releasedAt = Date.now();
        return { success: true, petId, status: "released" };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取宠物状态 (V85)
     */
    mcpPetStats(petId) {
      try {
        const pets = this.gs.pets || [];
        if (petId) {
          const pet = pets.find((p) => p.id === petId);
          if (!pet) return { error: "Pet not found" };
          return { pet, active: pets.filter((p) => p.active).length, total: pets.length };
        }
        return {
          pets: pets.filter((p) => p.active),
          total: pets.length,
          activeCount: pets.filter((p) => p.active).length,
          releasedCount: pets.filter((p) => !p.active).length,
          byType: {
            wolf: pets.filter((p) => p.type === "wolf").length,
            tiger: pets.filter((p) => p.type === "tiger").length,
            fox: pets.filter((p) => p.type === "fox").length,
            dragon: pets.filter((p) => p.type === "dragon").length,
            phoenix: pets.filter((p) => p.type === "phoenix").length,
            turtle: pets.filter((p) => p.type === "turtle").length
          }
        };
      } catch (e) {
        return { error: e.message };
      }
    }
  };

  // src/domains/pet/services/PetEvolveService.js
  var EVOLVE_INTIMACY_REQUIREMENTS = {
    2: 20,
    // 进化到幼年需要20亲密度
    3: 40,
    // 进化到成熟需要40亲密度
    4: 60,
    // 进化到远古需要60亲密度
    5: 80
    // 进化到神化需要80亲密度
  };
  var EVOLVE_STATS_MULTIPLIER = {
    attack: 1.3,
    defense: 1.25,
    speed: 1.2,
    health: 1.15,
    spirit: 1.3
  };
  var EVOLVE_LEVEL_REQUIREMENTS = {
    2: 5,
    // 进化到幼年需要5级
    3: 10,
    // 进化到成熟需要10级
    4: 20,
    // 进化到远古需要20级
    5: 30
    // 进化到神化需要30级
  };
  var EVOLVE_DURATION = {
    2: 6e4,
    // 进化到幼年 1分钟
    3: 18e4,
    // 进化到成熟 3分钟
    4: 3e5,
    // 进化到远古 5分钟
    5: 6e5
    // 进化到神化 10分钟
  };
  var EVOLVE_MATERIALS = {
    stage2: [{ id: "spirit_grass", count: 5, name: "\u7075\u8349" }],
    stage3: [
      { id: "spirit_grass", count: 10, name: "\u7075\u8349" },
      { id: "evolution_stone", count: 1, name: "\u8FDB\u5316\u77F3" }
    ],
    stage4: [
      { id: "spirit_grass", count: 20, name: "\u7075\u8349" },
      { id: "evolution_stone", count: 3, name: "\u8FDB\u5316\u77F3" },
      { id: "soul_crystal", count: 1, name: "\u9B42\u6676" }
    ],
    stage5: [
      { id: "spirit_grass", count: 50, name: "\u7075\u8349" },
      { id: "evolution_stone", count: 10, name: "\u8FDB\u5316\u77F3" },
      { id: "soul_crystal", count: 5, name: "\u9B42\u6676" },
      { id: "divine_essence", count: 1, name: "\u795E\u5143" }
    ]
  };
  var PetEvolveService = class {
    constructor(gameState3) {
      this.gs = gameState3;
    }
    /**
     * 初始化宠物状态V4 (V171)
     */
    _initPetStateV4() {
      if (!this.gs.petV4) {
        this.gs.petV4 = {
          pets: [],
          maxPets: 5,
          equippedPetId: null
        };
      }
      return this.gs.petV4;
    }
    /**
     * 初始化宠物状态V5 (V181)
     */
    _initPetStateV5() {
      if (!this.gs.petV5) {
        this.gs.petV5 = {
          pets: [],
          petSlots: 3,
          equippedPets: [],
          evolveMaterials: {}
        };
      }
      return this.gs.petV5;
    }
    /**
     * 初始化宠物状态V6 (V191)
     */
    _initPetStateV6() {
      if (!this.gs.petV6) {
        this.gs.petV6 = {
          pets: [],
          equippedPet: null,
          totalPets: 0
        };
      }
      return this.gs.petV6;
    }
    /**
     * 计算进化消耗
     * @param {number} currentStage - 当前阶段
     * @param {string} configVersion - 配置版本 V4/V5/V6
     */
    calculateEvolveCost(currentStage, configVersion = "V5") {
      const configs = {
        V4: { base: 500, multiplier: 1 },
        V5: { base: 500, multiplier: 1.5 },
        V6: { base: 800, multiplier: 1.8 }
      };
      const config = configs[configVersion] || configs.V5;
      return Math.floor(config.base * Math.pow(config.multiplier, currentStage - 1));
    }
    /**
     * 检查宠物是否可以进化
     * @param {Object} pet - 宠物对象
     * @param {number} targetStage - 目标阶段
     */
    checkCanEvolve(pet, targetStage = null) {
      const nextStage = targetStage || (pet.evolveStage || pet.evolutionStage || 1) + 1;
      if ((pet.evolveStage || 1) >= 4) {
        return { canEvolve: false, reason: "\u5DF2\u8FBE\u6700\u9AD8\u8FDB\u5316\u9636\u6BB5" };
      }
      const levelRequired = EVOLVE_LEVEL_REQUIREMENTS[nextStage] || 5;
      if ((pet.level || 1) < levelRequired) {
        return {
          canEvolve: false,
          reason: "\u7B49\u7EA7\u4E0D\u8DB3",
          levelRequired,
          currentLevel: pet.level
        };
      }
      const intimacyRequired = EVOLVE_INTIMACY_REQUIREMENTS[nextStage] || 20;
      if ((pet.intimacy || 0) < intimacyRequired) {
        return {
          canEvolve: false,
          reason: "\u4EB2\u5BC6\u5EA6\u4E0D\u8DB3",
          intimacyRequired,
          currentIntimacy: pet.intimacy
        };
      }
      const cost = this.calculateEvolveCost(nextStage - 1, "V6");
      if ((this.gs.spiritStones || 0) < cost) {
        return {
          canEvolve: false,
          reason: "\u7075\u77F3\u4E0D\u8DB3",
          costRequired: cost,
          currentStones: this.gs.spiritStones
        };
      }
      return { canEvolve: true, nextStage, cost };
    }
    /**
     * 执行宠物进化 V4 (V171)
     */
    mcpPetEvolveV4(petId) {
      try {
        if (!petId) return { error: "\u8BF7\u6307\u5B9A\u5BA0\u7269ID" };
        const petV4 = this._initPetStateV4();
        const petIdx = petV4.pets.findIndex((p) => p.id === petId);
        if (petIdx === -1) return { error: "\u5BA0\u7269\u4E0D\u5B58\u5728: " + petId };
        const pet = petV4.pets[petIdx];
        const evolveCost = 500;
        if ((this.gs.spiritStones || 0) < evolveCost) {
          return { error: "\u7075\u77F3\u4E0D\u8DB3\uFF0C\u8FDB\u5316\u9700\u8981 " + evolveCost + " \u7075\u77F3" };
        }
        this.gs.spiritStones -= evolveCost;
        pet.level = (pet.level || 1) + 1;
        pet.evolveStage = (pet.evolveStage || 1) + 1;
        petV4.pets[petIdx] = pet;
        return {
          success: true,
          petId,
          name: pet.name,
          newLevel: pet.level,
          newEvolveStage: pet.evolveStage,
          message: pet.name + " \u8FDB\u5316\u6210\u529F\uFF01\u7B49\u7EA7\u63D0\u5347\u81F3 " + pet.level
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 执行宠物进化 V5 (V181)
     */
    mcpPetEvolveV5(petId) {
      try {
        if (!petId) return { error: "\u8BF7\u6307\u5B9A\u5BA0\u7269ID" };
        const petV5 = this._initPetStateV5();
        const petIdx = petV5.pets.findIndex((p) => p.id === petId);
        if (petIdx === -1) return { error: "\u5BA0\u7269\u4E0D\u5B58\u5728: " + petId };
        const pet = petV5.pets[petIdx];
        const evolveStage = pet.evolveStage || 1;
        const evolveCost = Math.floor(500 * Math.pow(1.5, evolveStage - 1));
        if ((this.gs.spiritStones || 0) < evolveCost) {
          return { error: "\u7075\u77F3\u4E0D\u8DB3\uFF0C\u8FDB\u5316\u9700\u8981 " + evolveCost + " \u7075\u77F3" };
        }
        this.gs.spiritStones -= evolveCost;
        pet.level = (pet.level || 1) + 1;
        pet.evolveStage = evolveStage + 1;
        petV5.pets[petIdx] = pet;
        return {
          success: true,
          petId,
          name: pet.name,
          newLevel: pet.level,
          newEvolveStage: pet.evolveStage,
          cost: evolveCost,
          message: pet.name + " \u8FDB\u5316\u6210\u529F\uFF01\u7B49\u7EA7\u63D0\u5347\u81F3 " + pet.level + "\uFF0C\u6D88\u8017 " + evolveCost + " \u7075\u77F3"
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 执行宠物进化 V6 (V191)
     */
    mcpPetEvolveV6(petId) {
      try {
        if (!petId) return { error: "\u8BF7\u6307\u5B9A\u5BA0\u7269ID" };
        const petV6 = this._initPetStateV6();
        const petIdx = petV6.pets.findIndex((p) => p.id === petId);
        if (petIdx === -1) return { error: "\u5BA0\u7269\u4E0D\u5B58\u5728: " + petId };
        const pet = petV6.pets[petIdx];
        const evolveStage = pet.evolveStage || 1;
        const evolveCost = Math.floor(800 * Math.pow(1.8, evolveStage - 1));
        if ((this.gs.spiritStones || 0) < evolveCost) {
          return { error: "\u7075\u77F3\u4E0D\u8DB3\uFF0C\u8FDB\u5316\u9700\u8981 " + evolveCost + " \u7075\u77F3" };
        }
        this.gs.spiritStones -= evolveCost;
        pet.level = (pet.level || 1) + 1;
        pet.evolveStage = evolveStage + 1;
        petV6.pets[petIdx] = pet;
        return {
          success: true,
          petId,
          name: pet.name,
          newLevel: pet.level,
          newEvolveStage: pet.evolveStage,
          cost: evolveCost,
          message: pet.name + " \u8FDB\u5316\u6210\u529F\uFF01\u7B49\u7EA7\u63D0\u5347\u81F3 " + pet.level + "\uFF0C\u6D88\u8017 " + evolveCost + " \u7075\u77F3"
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 快速进化（消耗道具，直接完成）
     */
    quickEvolve(petId, targetStage = null) {
      try {
        const petState = this._initPetStateV6();
        const pet = petState.pets.find((p) => p.id === petId);
        if (!pet) return { error: "\u5BA0\u7269\u4E0D\u5B58\u5728: " + petId };
        const check = this.checkCanEvolve(pet, targetStage);
        if (!check.canEvolve) {
          return { success: false, ...check };
        }
        const oldLevel = pet.level;
        const oldStage = pet.evolveStage || 1;
        this.gs.spiritStones -= check.cost;
        pet.level += 2;
        pet.evolveStage = (pet.evolveStage || 1) + 1;
        pet.attack = Math.floor((pet.attack || 10) * EVOLVE_STATS_MULTIPLIER.attack);
        pet.defense = Math.floor((pet.defense || 5) * EVOLVE_STATS_MULTIPLIER.defense);
        pet.speed = Math.floor((pet.speed || 10) * EVOLVE_STATS_MULTIPLIER.speed);
        return {
          success: true,
          petId,
          petName: pet.name,
          oldLevel,
          newLevel: pet.level,
          oldStage,
          newStage: pet.evolveStage,
          statsUpgrade: {
            attack: pet.attack,
            defense: pet.defense,
            speed: pet.speed
          },
          cost: check.cost,
          message: pet.name + " \u8FDB\u5316\u6210\u529F\uFF01\u7B49\u7EA7 " + oldLevel + " -> " + pet.level
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 开始进化流程（带冷却时间）
     */
    startEvolution(petId, targetStage = null) {
      try {
        const petState = this._initPetStateV6();
        const pet = petState.pets.find((p) => p.id === petId);
        if (!pet) return { error: "\u5BA0\u7269\u4E0D\u5B58\u5728: " + petId };
        const check = this.checkCanEvolve(pet, targetStage);
        if (!check.canEvolve) {
          return { success: false, ...check };
        }
        const nextStage = check.nextStage;
        const duration = EVOLVE_DURATION[nextStage] || 6e4;
        if (!this.gs.evolveProcess) {
          this.gs.evolveProcess = {};
        }
        this.gs.evolveProcess[petId] = {
          status: "in_progress",
          startTime: Date.now(),
          endTime: Date.now() + duration,
          targetStage: nextStage,
          cost: check.cost
        };
        return {
          success: true,
          petId,
          petName: pet.name,
          status: "evolution_started",
          duration,
          endTime: this.gs.evolveProcess[petId].endTime,
          message: pet.name + " \u5F00\u59CB\u8FDB\u5316\uFF0C\u9884\u8BA1 " + duration / 1e3 + " \u79D2\u540E\u5B8C\u6210"
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 检查进化进度
     */
    checkEvolutionProgress(petId) {
      if (!this.gs.evolveProcess || !this.gs.evolveProcess[petId]) {
        return { error: "\u8BE5\u5BA0\u7269\u6CA1\u6709\u6B63\u5728\u8FDB\u5316" };
      }
      const process = this.gs.evolveProcess[petId];
      const now = Date.now();
      if (now < process.endTime) {
        const remaining = process.endTime - now;
        return {
          petId,
          status: "in_progress",
          progress: Math.floor((now - process.startTime) / (process.endTime - process.startTime) * 100),
          remainingMs: remaining,
          remainingSeconds: Math.ceil(remaining / 1e3)
        };
      }
      return {
        petId,
        status: "ready_to_complete",
        progress: 100
      };
    }
    /**
     * 完成进化
     */
    completeEvolution(petId) {
      try {
        const progress = this.checkEvolutionProgress(petId);
        if (progress.error) return progress;
        if (progress.status !== "ready_to_complete") {
          return { error: "\u8FDB\u5316\u5C1A\u672A\u5B8C\u6210\uFF0C\u8FD8\u9700 " + progress.remainingSeconds + " \u79D2" };
        }
        const petState = this._initPetStateV6();
        const petIdx = petState.pets.findIndex((p) => p.id === petId);
        if (petIdx === -1) return { error: "\u5BA0\u7269\u4E0D\u5B58\u5728" };
        const pet = petState.pets[petIdx];
        const process = this.gs.evolveProcess[petId];
        const oldLevel = pet.level;
        const oldStage = pet.evolveStage || 1;
        this.gs.spiritStones -= process.cost;
        pet.level += 2;
        pet.evolveStage = process.targetStage;
        pet.attack = Math.floor((pet.attack || 10) * EVOLVE_STATS_MULTIPLIER.attack);
        pet.defense = Math.floor((pet.defense || 5) * EVOLVE_STATS_MULTIPLIER.defense);
        pet.speed = Math.floor((pet.speed || 10) * EVOLVE_STATS_MULTIPLIER.speed);
        delete this.gs.evolveProcess[petId];
        return {
          success: true,
          petId,
          petName: pet.name,
          oldLevel,
          newLevel: pet.level,
          oldStage,
          newStage: pet.evolveStage,
          message: pet.name + " \u8FDB\u5316\u5B8C\u6210\uFF01\u7B49\u7EA7\u63D0\u5347\u81F3 " + pet.level
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    /**
     * 获取进化所需的道具
     */
    getEvolveMaterials(targetStage) {
      const stageKey = "stage" + targetStage;
      return EVOLVE_MATERIALS[stageKey] || EVOLVE_MATERIALS.stage2;
    }
    /**
     * 检查进化道具是否足够
     */
    checkEvolveMaterials(petId, targetStage = null) {
      const petState = this._initPetStateV6();
      const pet = petState.pets.find((p) => p.id === petId);
      if (!pet) return { error: "\u5BA0\u7269\u4E0D\u5B58\u5728: " + petId };
      const nextStage = targetStage || (pet.evolveStage || 1) + 1;
      const materials = this.getEvolveMaterials(nextStage);
      const results = materials.map((mat) => {
        const owned = (this.gs.items || []).filter((i) => i.id === mat.id).length;
        const enough = owned >= mat.count;
        return {
          ...mat,
          owned,
          enough
        };
      });
      const allEnough = results.every((r) => r.enough);
      return {
        petId,
        targetStage: nextStage,
        materials: results,
        allEnough,
        message: allEnough ? "\u9053\u5177\u8DB3\u591F\uFF0C\u53EF\u4EE5\u8FDB\u5316" : "\u9053\u5177\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u8FDB\u5316"
      };
    }
  };

  // src/domains/pet/PetModule.js
  var PET_STATE_INITIALIZERS = {
    V78: "_initPetState",
    V85: "_initPetState",
    V132: "_initPetState",
    V171: "_initPetStateV4",
    V181: "_initPetStateV5",
    V191: "_initPetStateV6"
  };
  var PET_CONFIGS = {
    V78: { maxPets: 5, evolveCostBase: 250, evolveCostMultiplier: 1 },
    V85: { maxPets: 10, petSlots: 3, evolveCostBase: 500, evolveCostMultiplier: 1.2 },
    V132: { maxPets: 8, captureCost: 200, evolveCostBase: 400, evolveCostMultiplier: 1.3 },
    V171: { maxPets: 5, petSlots: 1, evolveCostBase: 500, evolveCostMultiplier: 1 },
    V181: { maxPets: 10, petSlots: 3, evolveCostBase: 500, evolveCostMultiplier: 1.5 },
    V191: { maxPets: 15, petSlots: 5, evolveCostBase: 800, evolveCostMultiplier: 1.8 }
  };
  var PET_API_METHODS = [
    "mcpPetList",
    "mcpPetFeed",
    "mcpPetEvolve",
    "mcpPetSkill",
    "mcpPetCapture",
    "mcpPetRelease",
    "mcpPetStats",
    "mcpEvolvePrepare",
    "mcpEvolveStart",
    "mcpEvolveComplete",
    "mcpPetListV85",
    "mcpPetFeedV85",
    "mcpPetEvolveV85",
    "mcpPetReleaseV85",
    "mcpPetEquipV4",
    "mcpPetEvolveV4",
    "mcpPetEquipV5",
    "mcpPetEvolveV5",
    "mcpPetEquipV6",
    "mcpPetEvolveV6"
  ];
  var PetModule_default = {
    // 实体
    Pet,
    // 服务
    PetService,
    PetEvolveService,
    // 配置
    PET_STATE_INITIALIZERS,
    PET_CONFIGS,
    // API方法列表
    PET_API_METHODS,
    // 模块信息
    moduleName: "pet",
    moduleVersion: "V191",
    moduleDescription: "\u5BA0\u7269\u7CFB\u7EDF - \u5305\u542B\u7075\u5BA0\u6355\u6349\u3001\u57F9\u517B\u3001\u8FDB\u5316\u3001\u63A2\u9669\u7B49\u529F\u80FD"
  };

  // src/domains/ranking/RankingModule.js
  function createRankingService(gameStateAccessor) {
    return new RankingService(gameStateAccessor);
  }
  function createArenaService(gameStateAccessor) {
    return new ArenaService(gameStateAccessor);
  }

  // src/domains/signin/SigninModule.js
  function createSigninService(gameStateAccessor) {
    return new SigninService(gameStateAccessor);
  }
  function createWelfareService(gameStateAccessor) {
    return new WelfareService(gameStateAccessor);
  }

  // src/domains/combat/entities/CombatState.js
  var CombatState_exports = {};
  __export(CombatState_exports, {
    combatEnergy: () => combatEnergy2,
    combatState: () => combatState2,
    createCombatState: () => createCombatState2,
    resetCombatState: () => resetCombatState2,
    restoreCombatState: () => restoreCombatState2,
    serializeCombatState: () => serializeCombatState2,
    setCombatEnergy: () => setCombatEnergy,
    setCombatState: () => setCombatState
  });
  var combatState2 = {
    inProgress: false,
    round: 0,
    turn: "player",
    // 'player' | 'opponent'
    player: {
      name: "\u4F60",
      avatar: "\u{1F9D1}\u200D\u{1F393}",
      realm: 0,
      realmName: "\u70BC\u6C14\u671F",
      maxHP: 500,
      hp: 500,
      attack: 80,
      defense: 40,
      speed: 80,
      technique: "\u9752\u4E91\u8BC0",
      techniqueColor: "#00ff88",
      weapon: null,
      weaponData: null,
      armor: null,
      armorData: null,
      critRate: 0.1,
      setBonuses: {},
      skills: [],
      accessories: [],
      counterEnergy: 0,
      inDefenseStance: false,
      skillLevels: {}
    },
    opponent: null,
    log: [],
    effects: {
      player: {
        defending: false,
        attackBoost: 0,
        defenseBoost: 0,
        ignoreDefense: false,
        burning: 0,
        frozen: 0,
        defenseBoostObj: 0,
        critBoostNext: 0,
        healRate: 0,
        damageReduction: 0,
        counterRate: 0,
        speedReduce: 0,
        armorBroken: false,
        fireResist: 0,
        fireDrain: 0,
        reflect: 0,
        maxHpBoost: 0,
        cleanseStacks: 0,
        invincible: 0,
        thunderBonus: 0,
        doubleHit: 0,
        pierce: 0,
        cleave: 0,
        freezeAura: 0,
        burnAura: 0,
        curse: 0
      },
      opponent: {
        defending: false,
        attackBoost: 0,
        defenseBoost: 0,
        burning: 0,
        frozen: 0,
        speedReduce: 0,
        armorBroken: false,
        curse: 0
      }
    }
  };
  var combatEnergy2 = 0;
  function createCombatState2() {
    return {
      inProgress: false,
      round: 0,
      turn: "player",
      player: {
        name: "\u4F60",
        avatar: "\u{1F9D1}\u200D\u{1F393}",
        realm: 0,
        realmName: "\u70BC\u6C14\u671F",
        maxHP: 500,
        hp: 500,
        attack: 80,
        defense: 40,
        speed: 80,
        technique: "\u9752\u4E91\u8BC0",
        techniqueColor: "#00ff88",
        weapon: null,
        weaponData: null,
        armor: null,
        armorData: null,
        critRate: 0.1,
        setBonuses: {},
        skills: [],
        accessories: [],
        counterEnergy: 0,
        inDefenseStance: false,
        skillLevels: {},
        attackPercent: 1,
        critBonus: 0,
        defensePercent: 1,
        qiRegenBonus: 0
      },
      opponent: null,
      log: [],
      effects: {
        player: {
          defending: false,
          attackBoost: 0,
          defenseBoost: 0,
          ignoreDefense: false,
          burning: 0,
          frozen: 0
        },
        opponent: {
          defending: false,
          attackBoost: 0,
          defenseBoost: 0,
          burning: 0,
          frozen: 0
        }
      }
    };
  }
  function serializeCombatState2() {
    return JSON.parse(JSON.stringify(combatState2));
  }
  function restoreCombatState2(saved) {
    if (saved) {
      combatState2 = saved;
    }
  }
  function resetCombatState2() {
    combatState2 = createCombatState2();
    combatEnergy2 = 0;
  }
  function setCombatState(newState) {
    combatState2 = newState;
  }
  function setCombatEnergy(value) {
    combatEnergy2 = value;
  }

  // src/domains/combat/services/CombatService.js
  var { setCombatState: setCombatState2, setCombatEnergy: setCombatEnergy2 } = CombatState_exports;

  // src/domains/combat/CombatModule.js
  var COMBAT_CONFIG = {
    ENERGY_PER_ATTACK: 20,
    COUNTER_ENERGY_COST: 50,
    COUNTER_ENERGY_THRESHOLD: 100,
    CRIT_BASE_RATE: 0.1,
    CRIT_BONUS: 1.5,
    DEFENSE_REDUCTION: 0.5,
    TECHNIQUE_BONUS_MULTIPLIER: 1.5,
    TECHNIQUE_PENALTY_MULTIPLIER: 0.7
  };
  var CombatModule_default = {
    entities: {
      CombatState: { combatState, combatEnergy, createCombatState, serializeCombatState, restoreCombatState, resetCombatState },
      Action: { ACTION_TYPES, ACTION_RESULT_TYPES, STATUS_EFFECTS, createCombatLogEntry, createActionRecord, ACTION_METADATA }
    },
    services: {
      CombatService: {
        initCombat,
        generateOpponent,
        startCombatChallenge,
        executePlayerAttack,
        executePlayerDefend,
        executePlayerEscape,
        executeOpponentTurn,
        endCombat,
        addEnergy,
        getItemCount,
        selectCombatAction
      },
      CombatAIService: {
        mcpBattleArenaList,
        mcpBattleArenaJoin,
        mcpBattleArenaReport,
        mcpBattleCombatLog,
        mcpBattleRankRise,
        mcpBattleRewardClaim,
        getPlayerRankInfo,
        updatePlayerRank,
        getRealmDivision,
        getDailyChallenges,
        generateAIOpponents,
        getRankNameFromRating,
        getOpponentAvatar,
        startRankingPVP,
        calculatePlayerPVPower,
        calculateOpponentPower,
        simulatePVPRound,
        calculateRatingChange
      }
    },
    config: COMBAT_CONFIG
  };

  // src/domains/sect/SectModule.js
  var SectModule_default = {
    entities: {
      Sect: { createSect, SECT_CONFIG, getSectOverview, getSectResources, calculateSectIncome, getSectBuildings, serializeSect, canUpgradeSect },
      Disciple: {
        createDisciple,
        NPC_ROLES,
        NPC_PERSONALITIES,
        NPC_GIFTS,
        NPC_SKILL_CRYSTALS,
        NPC_MEMORY_LAYERS,
        initNpcMemory,
        getDiscipleInfo,
        getPersonalityInfo,
        getNpcRoleIcon,
        getNpcRoleTitle,
        recordNpcMemory,
        checkNpcSkillCrystallization,
        checkNpcEvolution,
        npcAutonomousDecision,
        getNpcMemoryDisplay
      }
    },
    services: {
      SectService: {
        createNewSect,
        addDisciple,
        recruitDisciple,
        weightedRandom,
        trainDisciple,
        dispatchDiscipleToPalace,
        recallDiscipleFromPalace,
        selectDiscipleForDispatch,
        selectDiscipleForRecall,
        collectSectResources,
        buildBuilding,
        upgradeSect,
        assignElder,
        removeElder,
        disbandSect,
        processNpcAutonomousLoop,
        processSectRandomEvent,
        modifyAffection,
        getMasterBonus,
        addItemToInventory
      }
    }
  };

  // src/domains/reincarnation/entities/Reincarnation.js
  var MEMORY_LAYERS = {
    L0_META: {
      name: "L0\u5143\u8BB0\u5FC6",
      desc: "\u6C38\u4E45\u4FDD\u7559\uFF1A\u609F\u9053\u6B21\u6570/\u8F6E\u56DE\u6B21\u6570",
      retention: 1,
      // 100% 保留
      priority: "critical"
    },
    L1_INDEX: {
      name: "L1\u7D22\u5F15",
      desc: "\u4FDD\u7559\u6210\u5C31\u89E3\u9501\u72B6\u6001",
      retention: 1,
      priority: "high"
    },
    L2_GLOBAL: {
      name: "L2\u5168\u5C40",
      desc: "\u4FDD\u7559\u4EBA\u7269\u5C5E\u6027\u8D8B\u52BF",
      retention: 0.8,
      priority: "medium"
    },
    L3_SOP: {
      name: "L3 SOP",
      desc: "\u4FDD\u7559\u987F\u609F\u7ED3\u6676\u6280\u80FD (CULTIVATION_INSIGHT)",
      retention: 0.6,
      priority: "medium"
    },
    L4_SESSION: {
      name: "L4\u4F1A\u8BDD",
      desc: "\u91CD\u7F6E",
      retention: 0,
      priority: "low"
    }
  };
  var CRYSTAL_QUALITY = {
    "\u51E1\u54C1": { multiplier: 1, desc: "\u666E\u901A\u54C1\u8D28" },
    "\u826F\u54C1": { multiplier: 1.5, desc: "\u4F18\u826F\u54C1\u8D28" },
    "\u73CD\u54C1": { multiplier: 2, desc: "\u4F20\u8BF4\u54C1\u8D28" },
    "\u4E0A\u54C1": { multiplier: 3, desc: "\u795E\u8BDD\u54C1\u8D28" },
    "\u6781\u54C1": { multiplier: 5, desc: "\u9006\u5929\u54C1\u8D28" }
  };
  var INSIGHT_SOURCES = {
    "breakthrough": { desc: "\u7A81\u7834\u5883\u754C\u89E6\u53D1", karmaBonus: 50 },
    "alchemy": { desc: "\u70BC\u5236\u4E39\u836F\u89E6\u53D1", karmaBonus: 30 },
    "serendipity": { desc: "\u5947\u9047\u89E6\u53D1", karmaBonus: 40 },
    "meditation": { desc: "\u51A5\u60F3\u89E6\u53D1", karmaBonus: 20 },
    "combat": { desc: "\u6218\u6597\u987F\u609F", karmaBonus: 25 }
  };
  var RemembranceCrystal = class _RemembranceCrystal {
    constructor(config = {}) {
      var _a, _b, _c, _d, _e;
      this.id = config.id || `crystal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.quality = config.quality || "\u51E1\u54C1";
      this.createdAt = config.createdAt || Date.now();
      this.source = config.source || "unknown";
      this.sourceDesc = config.sourceDesc || "";
      this.preservedAttributes = {
        cultivationBase: ((_a = config.preservedAttributes) == null ? void 0 : _a.cultivationBase) || 0,
        karma: ((_b = config.preservedAttributes) == null ? void 0 : _b.karma) || 0,
        skills: ((_c = config.preservedAttributes) == null ? void 0 : _c.skills) || [],
        insights: ((_d = config.preservedAttributes) == null ? void 0 : _d.insights) || [],
        bonuses: ((_e = config.preservedAttributes) == null ? void 0 : _e.bonuses) || []
      };
      this.used = config.used || false;
      this.usedAt = config.usedAt || null;
      this.appliedTo = config.appliedTo || null;
    }
    /**
     * 获取结晶品质信息
     */
    getQualityInfo() {
      return CRYSTAL_QUALITY[this.quality] || CRYSTAL_QUALITY["\u51E1\u54C1"];
    }
    /**
     * 获取结晶效果倍率
     */
    getMultiplier() {
      return this.getQualityInfo().multiplier;
    }
    /**
     * 应用结晶
     */
    apply() {
      if (this.used) {
        return { success: false, reason: "\u7ED3\u6676\u5DF2\u88AB\u4F7F\u7528" };
      }
      this.used = true;
      this.usedAt = Date.now();
      return { success: true, message: "\u7ED3\u6676\u5DF2\u5E94\u7528" };
    }
    /**
     * 序列化
     */
    serialize() {
      return {
        id: this.id,
        quality: this.quality,
        createdAt: this.createdAt,
        source: this.source,
        sourceDesc: this.sourceDesc,
        preservedAttributes: this.preservedAttributes,
        used: this.used,
        usedAt: this.usedAt,
        appliedTo: this.appliedTo
      };
    }
    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
      return new _RemembranceCrystal(data);
    }
  };
  var CultivationInsight = class _CultivationInsight {
    constructor(config = {}) {
      this.id = config.id || `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = config.type || "unknown";
      this.desc = config.desc || "";
      this.source = config.source || "unknown";
      this.awakenedAt = config.awakenedAt || Date.now();
      this.effect = config.effect || {};
      this.layer = config.layer || "L3_SOP";
    }
    /**
     * 获取来源描述
     */
    getSourceDesc() {
      var _a;
      return ((_a = INSIGHT_SOURCES[this.source]) == null ? void 0 : _a.desc) || "\u672A\u77E5\u6765\u6E90";
    }
    /**
     * 序列化
     */
    serialize() {
      return {
        id: this.id,
        type: this.type,
        desc: this.desc,
        source: this.source,
        awakenedAt: this.awakenedAt,
        effect: this.effect,
        layer: this.layer
      };
    }
    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
      return new _CultivationInsight(data);
    }
  };

  // src/domains/reincarnation/services/ReincarnationService.js
  var ReincarnationService = class {
    constructor() {
      this.reincarnation = null;
      this.crystals = [];
      this.insights = [];
    }
    /**
     * 初始化轮回系统
     */
    init(gameState3) {
      if (!gameState3.reincarnation) {
        gameState3.reincarnation = {
          times: 0,
          totalKarma: 0,
          bonuses: [],
          karmaGood: 0,
          karmaBad: 0,
          pastLives: [],
          realmAtDeath: 0,
          ageAtDeath: 0,
          causeOfDeath: "unknown",
          retainedSkills: [],
          retainedItems: [],
          soulAge: 0,
          reincarnationBonus: {}
        };
      }
      this.reincarnation = gameState3.reincarnation;
      return gameState3;
    }
    /**
     * 获取轮回统计
     */
    getStats() {
      var _a, _b;
      return {
        times: this.reincarnation.times,
        totalKarma: this.reincarnation.totalKarma,
        netKarma: (this.reincarnation.karmaGood || 0) - (this.reincarnation.karmaBad || 0),
        karmaGood: this.reincarnation.karmaGood || 0,
        karmaBad: this.reincarnation.karmaBad || 0,
        soulAge: this.reincarnation.soulAge || 0,
        bonusesCount: ((_a = this.reincarnation.bonuses) == null ? void 0 : _a.length) || 0,
        pastLivesCount: ((_b = this.reincarnation.pastLives) == null ? void 0 : _b.length) || 0
      };
    }
    /**
     * 预览下一次轮回的加成
     */
    preview() {
      const karmaRequired = (this.reincarnation.times || 0) * 100;
      const nextRealm = (this.reincarnation.times || 0) + 1;
      return {
        nextRealm,
        karmaRequired,
        potentialBonuses: this.calculatePotentialBonuses()
      };
    }
    /**
     * 计算潜在加成
     */
    calculatePotentialBonuses() {
      const bonuses = [];
      const times = this.reincarnation.times || 0;
      bonuses.push({
        type: "cultivationSpeed",
        value: Math.min(0.5, times * 0.05),
        desc: `\u4FEE\u70BC\u901F\u5EA6+${Math.round(Math.min(50, times * 5))}%`
      });
      const netKarma = (this.reincarnation.karmaGood || 0) - (this.reincarnation.karmaBad || 0);
      if (netKarma > 100) {
        bonuses.push({ type: "attack", value: 0.1, desc: "\u653B\u51FB+10%" });
      }
      if (netKarma > 500) {
        bonuses.push({ type: "defense", value: 0.1, desc: "\u9632\u5FA1+10%" });
      }
      if (netKarma > 1e3) {
        bonuses.push({ type: "serendipityChance", value: 0.05, desc: "\u5947\u9047+5%" });
      }
      if (this.reincarnation.realmAtDeath >= 3) {
        bonuses.push({ type: "spiritStones", value: 0.2, desc: "\u7075\u77F3+20%" });
      }
      return bonuses;
    }
    /**
     * 执行轮回
     */
    doReincarnate(gameState3) {
      const reincarnation = gameState3.reincarnation;
      const record = {
        time: Date.now(),
        times: reincarnation.times,
        causeOfDeath: reincarnation.causeOfDeath || "unknown",
        realmAtDeath: gameState3.realm || 0,
        ageAtDeath: gameState3.age || gameState3.days || 0,
        karmaBalance: (reincarnation.karmaGood || 0) - (reincarnation.karmaBad || 0),
        bonusesGained: []
      };
      reincarnation.pastLives = reincarnation.pastLives || [];
      reincarnation.pastLives.push(record);
      reincarnation.times = (reincarnation.times || 0) + 1;
      const newBonuses = this.calculateNewBonuses(reincarnation);
      reincarnation.bonuses = reincarnation.bonuses || [];
      reincarnation.bonuses.push(...newBonuses);
      gameState3.realm = 1;
      gameState3.stage = 1;
      gameState3.qi = 0;
      gameState3.maxQi = 100;
      gameState3.cultivationProgress = 0;
      gameState3.mindset = 50;
      const retainedItems = (reincarnation.retainedItems || []).filter(
        (item) => item && item.type === "treasure" && item.permanent
      );
      gameState3.inventory = retainedItems;
      const reincRecord = {
        time: Date.now(),
        bonus: "realm_reset",
        times: reincarnation.times
      };
      reincarnation.bonuses.push(reincRecord);
      return {
        success: true,
        times: reincarnation.times,
        bonuses: newBonuses,
        message: `\u8F6E\u56DE\u8F6C\u4E16\u5B8C\u6210\uFF01\u5DF2\u8F6E\u56DE\u6570: ${reincarnation.times}`
      };
    }
    /**
     * 计算新加成
     */
    calculateNewBonuses(reincarnation) {
      const bonuses = [];
      const times = reincarnation.times || 0;
      bonuses.push({
        type: "cultivationSpeed",
        value: Math.min(0.5, times * 0.05),
        desc: `\u4FEE\u70BC\u901F\u5EA6+${Math.round(Math.min(50, times * 5))}%`
      });
      const netKarma = (reincarnation.karmaGood || 0) - (reincarnation.karmaBad || 0);
      if (netKarma > 100) {
        bonuses.push({ type: "attack", value: 0.1, desc: "\u653B\u51FB+10%" });
      }
      if (netKarma > 500) {
        bonuses.push({ type: "defense", value: 0.1, desc: "\u9632\u5FA1+10%" });
      }
      if (netKarma > 1e3) {
        bonuses.push({ type: "serendipityChance", value: 0.05, desc: "\u5947\u9047+5%" });
      }
      if (reincarnation.realmAtDeath >= 3) {
        bonuses.push({ type: "spiritStones", value: 0.2, desc: "\u7075\u77F3+20%" });
      }
      return bonuses;
    }
    /**
     * 记录因果
     */
    recordKarma(type, amount) {
      const reincarnation = this.reincarnation;
      reincarnation.karmaGood = reincarnation.karmaGood || 0;
      reincarnation.karmaBad = reincarnation.karmaBad || 0;
      if (type === "good") {
        reincarnation.karmaGood += amount;
      } else if (type === "bad") {
        reincarnation.karmaBad += amount;
      }
      reincarnation.totalKarma = reincarnation.karmaGood - reincarnation.karmaBad;
      return {
        success: true,
        karmaGood: reincarnation.karmaGood,
        karmaBad: reincarnation.karmaBad,
        netKarma: reincarnation.totalKarma
      };
    }
    /**
     * 应用轮回加成到游戏状态
     */
    applyBonusesToGameState(gameState3) {
      const bonuses = this.reincarnation.bonuses || [];
      for (const bonus of bonuses) {
        switch (bonus.type) {
          case "cultivationSpeed":
            gameState3.activeEffects.cultivate_speed += bonus.value;
            break;
          case "attack":
            gameState3.activeEffects.attack += bonus.value;
            break;
          case "defense":
            gameState3.activeEffects.defense += bonus.value;
            break;
          case "spiritStones":
            gameState3.reincarnationBonus = gameState3.reincarnationBonus || {};
            gameState3.reincarnationBonus.spiritStones = bonus.value;
            break;
          case "serendipityChance":
            gameState3.activeEffects.serendipity_boost += bonus.value;
            break;
        }
      }
      return gameState3;
    }
    /**
     * 获取轮回加成描述
     */
    getBonusDescriptions() {
      const bonuses = this.reincarnation.bonuses || [];
      const descriptions = [];
      for (const bonus of bonuses) {
        if (bonus.desc) {
          descriptions.push(bonus.desc);
        } else {
          switch (bonus.type) {
            case "cultivationSpeed":
              descriptions.push(`\u4FEE\u70BC\u901F\u5EA6+${Math.round(bonus.value * 100)}%`);
              break;
            case "attack":
              descriptions.push(`\u653B\u51FB+${Math.round(bonus.value * 100)}%`);
              break;
            case "defense":
              descriptions.push(`\u9632\u5FA1+${Math.round(bonus.value * 100)}%`);
              break;
            case "spiritStones":
              descriptions.push(`\u7075\u77F3+${Math.round(bonus.value * 100)}%`);
              break;
            case "serendipityChance":
              descriptions.push(`\u5947\u9047+${Math.round(bonus.value * 100)}%`);
              break;
          }
        }
      }
      return descriptions;
    }
    /**
     * 检查轮回条件
     */
    canReincarnate(gameState3) {
      const karmaRequired = this.reincarnation.times * 100;
      const netKarma = (this.reincarnation.karmaGood || 0) - (this.reincarnation.karmaBad || 0);
      if (netKarma < karmaRequired) {
        return {
          can: false,
          reason: `\u56E0\u679C\u4E0D\u8DB3\uFF0C\u9700\u8981 ${karmaRequired} \u70B9\uFF0C\u5F53\u524D ${netKarma} \u70B9`
        };
      }
      return { can: true };
    }
    /**
     * 设置死亡原因
     */
    setCauseOfDeath(cause) {
      this.reincarnation.causeOfDeath = cause;
      return { success: true, cause };
    }
    /**
     * 添加保留技能
     */
    addRetainedSkill(skill) {
      const skills = this.reincarnation.retainedSkills || [];
      if (!skills.find((s) => s.id === skill.id)) {
        skills.push(skill);
      }
      return { success: true, skillsCount: skills.length };
    }
    /**
     * 添加保留物品
     */
    addRetainedItem(item) {
      const items = this.reincarnation.retainedItems || [];
      if (item && item.type === "treasure" && item.permanent) {
        if (!items.find((i) => i.id === item.id)) {
          items.push(item);
        }
      }
      return { success: true, itemsCount: items.length };
    }
    /**
     * 获取过去生世信息
     */
    getPastLives(limit = 10) {
      const pastLives = this.reincarnation.pastLives || [];
      return pastLives.slice(-limit).reverse();
    }
    /**
     * MCP: 轮回统计
     */
    mcpStats() {
      return this.getStats();
    }
    /**
     * MCP: 预览轮回
     */
    mcpPreview() {
      return this.preview();
    }
    /**
     * MCP: 执行轮回
     */
    mcpReincarnate(gameState3) {
      return this.doReincarnate(gameState3);
    }
    // ===== Direction M: 悟道境轮回系统 6个MCP工具 =====
    /**
     * MCP: reincarnation.crystal.create
     * 将当前顿悟化为记忆结晶
     * @param {Object} params - { quality?: string, source?: string }
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 创建的结晶信息
     */
    mcpCrystalCreate(params = {}, gameState3) {
      var _a, _b, _c, _d, _e;
      const quality = (params == null ? void 0 : params.quality) || this.determineCrystalQuality(gameState3);
      const source = (params == null ? void 0 : params.source) || "serendipity";
      const preservedAttributes = {
        cultivationBase: gameState3.realm || 0,
        karma: (((_a = this.reincarnation) == null ? void 0 : _a.karmaGood) || 0) - (((_b = this.reincarnation) == null ? void 0 : _b.karmaBad) || 0),
        skills: this.collectRetainableSkills(gameState3),
        insights: this.insights.slice(-5).map((i) => i.id),
        // 保留最近5个顿悟
        bonuses: ((_d = (_c = this.reincarnation) == null ? void 0 : _c.bonuses) == null ? void 0 : _d.slice(-3)) || []
      };
      const crystal = new RemembranceCrystal({
        quality,
        source,
        sourceDesc: ((_e = INSIGHT_SOURCES[source]) == null ? void 0 : _e.desc) || "\u672A\u77E5\u6765\u6E90",
        preservedAttributes
      });
      this.crystals.push(crystal);
      if (!gameState3.reincarnation) {
        gameState3.reincarnation = {};
      }
      if (!gameState3.reincarnation.crystals) {
        gameState3.reincarnation.crystals = [];
      }
      gameState3.reincarnation.crystals.push(crystal.serialize());
      return {
        success: true,
        crystal: crystal.serialize(),
        message: `\u8BB0\u5FC6\u7ED3\u6676\u300C${quality}\u300D\u521B\u5EFA\u6210\u529F`,
        qualityInfo: CRYSTAL_QUALITY[quality]
      };
    }
    /**
     * 确定结晶品质
     */
    determineCrystalQuality(gameState3) {
      var _a, _b;
      const realm = (gameState3 == null ? void 0 : gameState3.realm) || 0;
      const netKarma = (((_a = this.reincarnation) == null ? void 0 : _a.karmaGood) || 0) - (((_b = this.reincarnation) == null ? void 0 : _b.karmaBad) || 0);
      if (realm >= 5 && netKarma >= 1e3) return "\u6781\u54C1";
      if (realm >= 4 && netKarma >= 600) return "\u4E0A\u54C1";
      if (realm >= 3 && netKarma >= 300) return "\u73CD\u54C1";
      if (realm >= 2 && netKarma >= 100) return "\u826F\u54C1";
      return "\u51E1\u54C1";
    }
    /**
     * 收集可保留的技能
     */
    collectRetainableSkills(gameState3) {
      var _a;
      const skills = [];
      if ((_a = gameState3.cultivation) == null ? void 0 : _a.skills) {
        for (const skill of gameState3.cultivation.skills) {
          if (skill.permanent || skill.retainable) {
            skills.push({ id: skill.id, name: skill.name, level: skill.level });
          }
        }
      }
      return skills;
    }
    /**
     * MCP: reincarnation.crystal.list
     * 查看拥有的记忆结晶
     * @returns {Object} 结晶列表
     */
    mcpCrystalList() {
      const available = this.crystals.filter((c) => !c.used);
      const used = this.crystals.filter((c) => c.used);
      return {
        success: true,
        total: this.crystals.length,
        available: available.length,
        used: used.length,
        crystals: this.crystals.map((c) => ({
          ...c.serialize(),
          qualityInfo: CRYSTAL_QUALITY[c.quality]
        }))
      };
    }
    /**
     * MCP: reincarnation.crystal.apply
     * 转世后应用结晶恢复属性
     * @param {Object} params - { crystalId: string }
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 应用结果
     */
    mcpCrystalApply(params = {}, gameState3) {
      var _a;
      const crystalId = params == null ? void 0 : params.crystalId;
      if (!crystalId) {
        return { success: false, reason: "\u7F3A\u5C11 crystalId \u53C2\u6570" };
      }
      const crystal = this.crystals.find((c) => c.id === crystalId);
      if (!crystal) {
        return { success: false, reason: "\u7ED3\u6676\u4E0D\u5B58\u5728" };
      }
      if (crystal.used) {
        return { success: false, reason: "\u7ED3\u6676\u5DF2\u88AB\u4F7F\u7528" };
      }
      const multiplier = crystal.getMultiplier();
      const preserved = crystal.preservedAttributes;
      const result = {
        success: true,
        message: `\u7ED3\u6676\u300C${crystal.quality}\u300D\u5E94\u7528\u6210\u529F`,
        restored: {
          cultivationBase: preserved.cultivationBase * multiplier,
          karma: preserved.karma * multiplier,
          skillsCount: preserved.skills.length,
          insightsCount: preserved.insights.length,
          bonusesCount: preserved.bonuses.length
        }
      };
      crystal.apply();
      crystal.appliedTo = ((_a = this.reincarnation) == null ? void 0 : _a.times) || 0;
      if (preserved.skills.length > 0 && gameState3.cultivation) {
        if (!gameState3.cultivation.skills) {
          gameState3.cultivation.skills = [];
        }
        gameState3.cultivation.skills.push(...preserved.skills);
      }
      const netKarma = preserved.karma * multiplier;
      if (netKarma > 0) {
        this.reincarnation.karmaGood = (this.reincarnation.karmaGood || 0) + netKarma;
      } else {
        this.reincarnation.karmaBad = (this.reincarnation.karmaBad || 0) - netKarma;
      }
      if (preserved.bonuses.length > 0) {
        this.reincarnation.bonuses = this.reincarnation.bonuses || [];
        this.reincarnation.bonuses.push(...preserved.bonuses.map((b) => ({
          ...b,
          source: "crystal",
          sourceId: crystal.id
        })));
      }
      return result;
    }
    /**
     * MCP: reincarnation.insight.awaken
     * 触发顿悟事件（突破/炼丹/奇遇时）
     * @param {Object} params - { type: string, desc: string }
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 顿悟信息
     */
    mcpInsightAwaken(params = {}, gameState3) {
      var _a, _b;
      const type = (params == null ? void 0 : params.type) || "serendipity";
      const desc = (params == null ? void 0 : params.desc) || ((_a = INSIGHT_SOURCES[type]) == null ? void 0 : _a.desc) || "\u672A\u77E5\u987F\u609F";
      const insight = new CultivationInsight({
        type,
        desc,
        source: type,
        effect: this.calculateInsightEffect(type, gameState3)
      });
      this.insights.push(insight);
      if (!gameState3.reincarnation) {
        gameState3.reincarnation = {};
      }
      if (!gameState3.reincarnation.insights) {
        gameState3.reincarnation.insights = [];
      }
      gameState3.reincarnation.insights.push(insight.serialize());
      const karmaBonus = ((_b = INSIGHT_SOURCES[type]) == null ? void 0 : _b.karmaBonus) || 20;
      this.recordKarma("good", karmaBonus);
      return {
        success: true,
        insight: insight.serialize(),
        message: `\u987F\u609F\u300C${desc}\u300D\u89C9\u9192\u6210\u529F`,
        karmaBonus,
        layer: insight.layer
      };
    }
    /**
     * 计算顿悟效果
     */
    calculateInsightEffect(type, gameState3) {
      const effects = {
        breakthrough: { cultivationSpeed: 0.1, progress: 0.05 },
        alchemy: { spiritStones: 0.1, quality: 0.1 },
        serendipity: { serendipityChance: 0.05, karma: 0.05 },
        meditation: { qiRegen: 0.1, mindset: 0.05 },
        combat: { attack: 0.05, defense: 0.05 }
      };
      return effects[type] || effects.serendipity;
    }
    /**
     * MCP: reincarnation.insight.list
     * 查看已获得的顿悟
     * @returns {Object} 顿悟列表
     */
    mcpInsightList() {
      return {
        success: true,
        total: this.insights.length,
        insights: this.insights.map((i) => {
          var _a;
          return {
            ...i.serialize(),
            sourceDesc: ((_a = INSIGHT_SOURCES[i.source]) == null ? void 0 : _a.desc) || "\u672A\u77E5\u6765\u6E90"
          };
        })
      };
    }
    /**
     * MCP: reincarnation.cycle.status
     * 查看轮回境界与记忆层状态
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 状态信息
     */
    mcpCycleStatus(gameState3) {
      const stats = this.getStats();
      const memoryLayers = this.getMemoryLayerStatus(gameState3);
      return {
        success: true,
        stats: {
          ...stats,
          crystalsTotal: this.crystals.length,
          crystalsAvailable: this.crystals.filter((c) => !c.used).length,
          insightsTotal: this.insights.length
        },
        memoryLayers,
        reincarnationRealm: this.calculateReincarnationRealm(stats.times),
        memoryRetentionRate: this.calculateMemoryRetention(stats.times)
      };
    }
    /**
     * 获取记忆层状态
     */
    getMemoryLayerStatus(gameState3) {
      var _a, _b, _c, _d, _e;
      return {
        L0_META: {
          ...MEMORY_LAYERS.L0_META,
          retained: true,
          // 永远保留
          data: {
            reincarnationTimes: ((_a = this.reincarnation) == null ? void 0 : _a.times) || 0,
            awakeningTimes: this.insights.filter((i) => i.type === "breakthrough").length
          }
        },
        L1_INDEX: {
          ...MEMORY_LAYERS.L1_INDEX,
          retained: true,
          data: {
            achievements: ((_c = (_b = gameState3 == null ? void 0 : gameState3.achievementState) == null ? void 0 : _b.completedAchievements) == null ? void 0 : _c.length) || 0,
            badges: ((_e = (_d = gameState3 == null ? void 0 : gameState3.badgeState) == null ? void 0 : _d.unlockedBadges) == null ? void 0 : _e.length) || 0
          }
        },
        L2_GLOBAL: {
          ...MEMORY_LAYERS.L2_GLOBAL,
          retention: MEMORY_LAYERS.L2_GLOBAL.retention,
          data: {
            realmTrend: (gameState3 == null ? void 0 : gameState3.realm) || 0,
            cultivationProgress: (gameState3 == null ? void 0 : gameState3.cultivationProgress) || 0
          }
        },
        L3_SOP: {
          ...MEMORY_LAYERS.L3_SOP,
          retention: MEMORY_LAYERS.L3_SOP.retention,
          data: {
            insightsCount: this.insights.length,
            crystalsCount: this.crystals.length
          }
        },
        L4_SESSION: {
          ...MEMORY_LAYERS.L4_SESSION,
          retained: false,
          // 重置
          data: null
        }
      };
    }
    /**
     * 计算轮回境界
     */
    calculateReincarnationRealm(times) {
      const realms = ["\u51E1\u80CE", "\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347", "\u609F\u9053", "\u5927\u4E58", "\u5F7C\u5CB8"];
      return realms[Math.min(times, realms.length - 1)] || "\u51E1\u80CE";
    }
    /**
     * 计算记忆保留率
     */
    calculateMemoryRetention(times) {
      const baseRetention = 0.5;
      const retentionPerReincarnation = 0.05;
      return Math.min(0.95, baseRetention + times * retentionPerReincarnation);
    }
  };
  var reincarnationService = new ReincarnationService();

  // src/domains/cultivation/services/TalentTreeService.js
  init_SpiritRootEntity();
  var TALENT_BRANCHES = ["attack", "defense", "cultivation", "perception"];
  var BRANCH_NAMES = {
    attack: "\u653B\u51FB",
    defense: "\u9632\u5FA1",
    cultivation: "\u4FEE\u70BC",
    perception: "\u611F\u77E5"
  };
  var POINTS_PER_LAYER = [1, 2, 3, 4, 5];
  var LAYER_EFFECTS = {
    attack: [
      { attack: 5 },
      // 层1: 攻击+5
      { attack: 10 },
      // 层2: 攻击+10
      { attack: 15 },
      // 层3: 攻击+15
      { attack: 25 },
      // 层4: 攻击+25
      { attack: 40 }
      // 层5: 攻击+40
    ],
    defense: [
      { defense: 5 },
      // 层1: 防御+5
      { defense: 10 },
      // 层2: 防御+10
      { defense: 15 },
      // 层3: 防御+15
      { defense: 25 },
      // 层4: 防御+25
      { defense: 40 }
      // 层5: 防御+40
    ],
    cultivation: [
      { cultivationSpeed: 5 },
      // 层1: 修炼速度+5%
      { cultivationSpeed: 10 },
      // 层2: 修炼速度+10%
      { cultivationSpeed: 15 },
      // 层3: 修炼速度+15%
      { cultivationSpeed: 25 },
      // 层4: 修炼速度+25%
      { cultivationSpeed: 40 }
      // 层5: 修炼速度+40%
    ],
    perception: [
      { critRate: 2 },
      // 层1: 暴击率+2%
      { critRate: 4 },
      // 层2: 暴击率+4%
      { critRate: 6 },
      // 层3: 暴击率+6%
      { critRate: 10 },
      // 层4: 暴击率+10%
      { critRate: 15 }
      // 层5: 暴击率+15%
    ]
  };
  var MASTERY_ELEMENTS = ["metal", "wood", "water", "fire", "earth", "thunder"];
  var ELEMENT_NAMES = {
    metal: "\u91D1",
    wood: "\u6728",
    water: "\u6C34",
    fire: "\u706B",
    earth: "\u571F",
    thunder: "\u96F7"
  };
  var MASTERY_LEVELS = ["novice", "apprentice", "journeyman", "expert", "master", "grandmaster"];
  var MASTERY_LEVEL_NAMES = {
    novice: "\u521D\u7AA5",
    apprentice: "\u5165\u95E8",
    journeyman: "\u719F\u7EC3",
    expert: "\u7CBE\u901A",
    master: "\u5927\u5E08",
    grandmaster: "\u5B97\u5E08"
  };
  var MASTERY_EXP_PER_LEVEL = [0, 100, 300, 600, 1e3, 1500];
  var MASTERY_EFFECT_MULTIPLIERS = {
    novice: 0.5,
    apprentice: 1,
    journeyman: 1.5,
    expert: 2,
    master: 3,
    grandmaster: 5
  };
  var TALENT_RESET_ITEM = "\u6D17\u9AD3\u4E39";
  function createInitialTalentData() {
    const talentTree = {};
    for (const branch of TALENT_BRANCHES) {
      talentTree[branch] = {
        points: 0,
        // 已投入点数
        layers: 0
        // 已解锁层数 (0-5)
      };
    }
    return {
      talentTree,
      talentPoints: 0,
      // 可用天赋点
      totalTalentPointsEarned: 0
      // 累计获得天赋点
    };
  }
  function createInitialMasteryData() {
    const mastery = {};
    for (const element of MASTERY_ELEMENTS) {
      mastery[element] = {
        level: 0,
        // 0-5 (novice-grandmaster)
        exp: 0,
        // 当前经验值
        totalExpEarned: 0
        // 累计获得经验值
      };
    }
    return {
      mastery,
      lastUpdateTime: Date.now()
    };
  }
  var TalentTreeService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.hooks = /* @__PURE__ */ new Map();
      this.hookIdCounter = 0;
      this.initializeData();
    }
    /**
     * 初始化天赋和精通数据
     */
    initializeData() {
      if (!this.gameState.talentData) {
        this.gameState.talentData = createInitialTalentData();
      }
      if (!this.gameState.masteryData) {
        this.gameState.masteryData = createInitialMasteryData();
      }
    }
    /**
     * 获取天赋数据
     */
    getTalentData() {
      return this.gameState.talentData;
    }
    /**
     * 获取精通数据
     */
    getMasteryData() {
      return this.gameState.masteryData;
    }
    // ===== 天赋点获取 =====
    /**
     * 获得天赋点
     * @param {number} amount - 获得数量
     * @param {string} reason - 原因 (levelup/breakthrough/reward)
     */
    gainTalentPoints(amount, reason = "reward") {
      const talentData = this.getTalentData();
      talentData.talentPoints += amount;
      talentData.totalTalentPointsEarned += amount;
      this.triggerHook("talentPointsGained", {
        amount,
        reason,
        totalPoints: talentData.talentPoints,
        totalEarned: talentData.totalTalentPointsEarned
      });
      return {
        success: true,
        gained: amount,
        reason,
        availablePoints: talentData.talentPoints,
        totalEarned: talentData.totalTalentPointsEarned
      };
    }
    /**
     * 消耗天赋点
     * @param {number} amount - 消耗数量
     */
    consumeTalentPoints(amount) {
      const talentData = this.getTalentData();
      if (talentData.talentPoints < amount) {
        return {
          success: false,
          error: "\u5929\u8D4B\u70B9\u4E0D\u8DB3",
          required: amount,
          available: talentData.talentPoints
        };
      }
      talentData.talentPoints -= amount;
      return { success: true, consumed: amount, remaining: talentData.talentPoints };
    }
    // ===== 天赋树操作 =====
    /**
     * 分配天赋点
     * @param {string} branch - 分支 (attack/defense/cultivation/perception)
     * @param {number} layer - 层 (1-5)
     */
    allocateTalent(branch, layer) {
      if (!TALENT_BRANCHES.includes(branch)) {
        return { success: false, error: `\u65E0\u6548\u5206\u652F: ${branch}` };
      }
      if (layer < 1 || layer > 5) {
        return { success: false, error: "\u5C42\u6570\u5FC5\u987B\u57281-5\u4E4B\u95F4" };
      }
      const talentData = this.getTalentData();
      const branchData = talentData.talentTree[branch];
      if (branchData.layers >= layer) {
        return { success: false, error: `\u5206\u652F ${branch} \u7684\u7B2C ${layer} \u5C42\u5DF2\u89E3\u9501` };
      }
      if (layer > 1 && branchData.layers < layer - 1) {
        return { success: false, error: `\u5FC5\u987B\u5148\u89E3\u9501\u7B2C ${layer - 1} \u5C42` };
      }
      const pointsNeeded = POINTS_PER_LAYER[layer - 1];
      if (talentData.talentPoints < pointsNeeded) {
        return {
          success: false,
          error: "\u5929\u8D4B\u70B9\u4E0D\u8DB3",
          required: pointsNeeded,
          available: talentData.talentPoints
        };
      }
      const consumeResult = this.consumeTalentPoints(pointsNeeded);
      if (!consumeResult.success) {
        return consumeResult;
      }
      branchData.points += pointsNeeded;
      branchData.layers = layer;
      const effect = LAYER_EFFECTS[branch][layer - 1];
      this.triggerHook("talentAllocated", {
        branch,
        layer,
        pointsUsed: pointsNeeded,
        effect,
        totalPoints: branchData.points,
        totalLayers: branchData.layers
      });
      return {
        success: true,
        branch,
        layer,
        pointsUsed: pointsNeeded,
        effect,
        remainingPoints: talentData.talentPoints,
        totalPoints: branchData.points,
        totalLayers: branchData.layers
      };
    }
    /**
     * 重置天赋树
     * @param {boolean} hasItem - 是否有洗髓丹
     */
    resetTalentTree(hasItem = false) {
      var _a;
      if (!hasItem) {
        const inventory = ((_a = this.gameState.inventory) == null ? void 0 : _a.items) || [];
        const resetItemIndex = inventory.findIndex((item) => item.name === TALENT_RESET_ITEM);
        if (resetItemIndex === -1) {
          return {
            success: false,
            error: `\u9700\u8981 ${TALENT_RESET_ITEM} \u624D\u80FD\u91CD\u7F6E\u5929\u8D4B\u6811`
          };
        }
        inventory.splice(resetItemIndex, 1);
      }
      const talentData = this.getTalentData();
      const oldTree = JSON.parse(JSON.stringify(talentData.talentTree));
      for (const branch of TALENT_BRANCHES) {
        talentData.talentTree[branch] = {
          points: 0,
          layers: 0
        };
      }
      this.triggerHook("talentReset", {
        oldTree,
        newTree: talentData.talentTree
      });
      return {
        success: true,
        message: "\u5929\u8D4B\u6811\u5DF2\u91CD\u7F6E",
        itemConsumed: hasItem
      };
    }
    /**
     * 查询天赋树状态
     */
    queryTalentTree() {
      const talentData = this.getTalentData();
      const treeStatus = {};
      for (const branch of TALENT_BRANCHES) {
        const branchData = talentData.talentTree[branch];
        const effects = [];
        for (let i = 0; i < branchData.layers; i++) {
          effects.push(LAYER_EFFECTS[branch][i]);
        }
        treeStatus[branch] = {
          name: BRANCH_NAMES[branch],
          points: branchData.points,
          layers: branchData.layers,
          maxLayers: 5,
          effects,
          nextLayerCost: branchData.layers < 5 ? POINTS_PER_LAYER[branchData.layers] : null,
          nextLayerEffect: branchData.layers < 5 ? LAYER_EFFECTS[branch][branchData.layers] : null
        };
      }
      return {
        success: true,
        availablePoints: talentData.talentPoints,
        totalEarnedPoints: talentData.totalTalentPointsEarned,
        tree: treeStatus
      };
    }
    // ===== 元素精通操作 =====
    /**
     * 获得精通经验
     * @param {string} element - 元素类型
     * @param {number} exp - 经验值
     */
    gainMasteryExp(element, exp) {
      if (!MASTERY_ELEMENTS.includes(element)) {
        return { success: false, error: `\u65E0\u6548\u5143\u7D20: ${element}` };
      }
      const masteryData = this.getMasteryData();
      const elementData = masteryData.mastery[element];
      const oldLevel = elementData.level;
      elementData.exp += exp;
      elementData.totalExpEarned += exp;
      let leveledUp = false;
      while (elementData.level < 5 && elementData.exp >= MASTERY_EXP_PER_LEVEL[elementData.level + 1]) {
        elementData.level++;
        leveledUp = true;
      }
      const newLevel = elementData.level;
      if (leveledUp) {
        this.triggerHook("masteryLevelUp", {
          element,
          oldLevel,
          newLevel,
          newLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[newLevel]]
        });
      }
      return {
        success: true,
        element,
        expGained: exp,
        currentExp: elementData.exp,
        currentLevel: newLevel,
        currentLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[newLevel]],
        leveledUp,
        nextLevelExp: newLevel < 5 ? MASTERY_EXP_PER_LEVEL[newLevel + 1] : null
      };
    }
    /**
     * 升级精通等级
     * @param {string} element - 元素类型
     */
    upgradeMastery(element) {
      if (!MASTERY_ELEMENTS.includes(element)) {
        return { success: false, error: `\u65E0\u6548\u5143\u7D20: ${element}` };
      }
      const masteryData = this.getMasteryData();
      const elementData = masteryData.mastery[element];
      if (elementData.level >= 5) {
        return {
          success: false,
          error: "\u5DF2\u8FBE\u5230\u6700\u9AD8\u7CBE\u901A\u7B49\u7EA7",
          currentLevel: elementData.level,
          currentLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]]
        };
      }
      const currentLevelExp = MASTERY_EXP_PER_LEVEL[elementData.level];
      const nextLevelExp = MASTERY_EXP_PER_LEVEL[elementData.level + 1];
      const expNeeded = nextLevelExp - currentLevelExp;
      if (elementData.exp < expNeeded) {
        return {
          success: false,
          error: "\u7ECF\u9A8C\u503C\u4E0D\u8DB3",
          required: expNeeded,
          available: elementData.exp
        };
      }
      const oldLevel = elementData.level;
      elementData.exp -= expNeeded;
      elementData.level++;
      this.triggerHook("masteryUpgraded", {
        element,
        oldLevel,
        newLevel: elementData.level,
        newLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]]
      });
      return {
        success: true,
        element,
        newLevel: elementData.level,
        newLevelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]],
        effectMultiplier: MASTERY_EFFECT_MULTIPLIERS[MASTERY_LEVELS[elementData.level]]
      };
    }
    /**
     * 查询元素精通
     * @param {string} element - 元素类型 (可选，不传则查询全部)
     */
    queryMastery(element = null) {
      const masteryData = this.getMasteryData();
      if (element) {
        if (!MASTERY_ELEMENTS.includes(element)) {
          return { success: false, error: `\u65E0\u6548\u5143\u7D20: ${element}` };
        }
        const elementData = masteryData.mastery[element];
        return {
          success: true,
          element,
          level: elementData.level,
          levelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]],
          exp: elementData.exp,
          totalExpEarned: elementData.totalExpEarned,
          effectMultiplier: MASTERY_EFFECT_MULTIPLIERS[MASTERY_LEVELS[elementData.level]],
          nextLevelExp: elementData.level < 5 ? MASTERY_EXP_PER_LEVEL[elementData.level + 1] : null
        };
      }
      const allMastery = {};
      for (const elem of MASTERY_ELEMENTS) {
        const elementData = masteryData.mastery[elem];
        allMastery[elem] = {
          name: ELEMENT_NAMES[elem],
          level: elementData.level,
          levelName: MASTERY_LEVEL_NAMES[MASTERY_LEVELS[elementData.level]],
          exp: elementData.exp,
          effectMultiplier: MASTERY_EFFECT_MULTIPLIERS[MASTERY_LEVELS[elementData.level]],
          progress: elementData.level < 5 ? (elementData.exp / MASTERY_EXP_PER_LEVEL[elementData.level + 1] * 100).toFixed(1) + "%" : "100%"
        };
      }
      return {
        success: true,
        mastery: allMastery
      };
    }
    // ===== Hook系统 =====
    /**
     * 注册钩子
     * @param {string} type - 钩子类型
     * @param {Function} callback - 回调函数
     */
    registerHook(type, callback) {
      const hookId = ++this.hookIdCounter;
      this.hooks.set(hookId, {
        type,
        callback,
        enabled: true
      });
      return {
        success: true,
        hookId,
        type,
        message: `\u5DF2\u6CE8\u518C\u94A9\u5B50: ${type}`
      };
    }
    /**
     * 注销钩子
     * @param {number} hookId - 钩子ID
     */
    unregisterHook(hookId) {
      if (!this.hooks.has(hookId)) {
        return { success: false, error: `\u94A9\u5B50\u4E0D\u5B58\u5728: ${hookId}` };
      }
      const hook = this.hooks.get(hookId);
      this.hooks.delete(hookId);
      return {
        success: true,
        message: `\u5DF2\u6CE8\u9500\u94A9\u5B50: ${hook.type}`
      };
    }
    /**
     * 触发钩子
     * @param {string} type - 钩子类型
     * @param {object} data - 传递给回调的数据
     */
    triggerHook(type, data) {
      const triggeredHooks = [];
      for (const [hookId, hook] of this.hooks) {
        if (hook.type === type && hook.enabled) {
          try {
            hook.callback(data);
            triggeredHooks.push(hookId);
          } catch (e) {
            console.error(`[TalentTree] Hook error: ${type}`, e);
          }
        }
      }
      return triggeredHooks;
    }
    /**
     * 获取所有已注册的钩子
     */
    listHooks() {
      const hookList = [];
      for (const [hookId, hook] of this.hooks) {
        hookList.push({
          hookId,
          type: hook.type,
          enabled: hook.enabled
        });
      }
      return hookList;
    }
    // ===== 工具方法 =====
    /**
     * 根据灵根类型和品级计算天赋点奖励
     */
    calculateTalentPointsReward() {
      const spiritRoot = this.gameState.spiritRoot || { type: "wood", tier: 1 };
      const tier = spiritRoot.tier || 1;
      const realm = this.gameState.realm || 0;
      return tier * 2 + realm;
    }
    /**
     * 获取当前所有加成效果汇总
     */
    getAllBonuses() {
      const talentData = this.getTalentData();
      const bonuses = {
        attack: 0,
        defense: 0,
        cultivationSpeed: 0,
        critRate: 0
      };
      for (const branch of TALENT_BRANCHES) {
        const branchData = talentData.talentTree[branch];
        for (let i = 0; i < branchData.layers; i++) {
          const effect = LAYER_EFFECTS[branch][i];
          for (const [key, value] of Object.entries(effect)) {
            if (bonuses[key] !== void 0) {
              bonuses[key] += value;
            }
          }
        }
      }
      const spiritRoot = new SpiritRootEntity(this.gameState.spiritRoot);
      const rootBonuses = spiritRoot.getBonuses();
      for (const [key, value] of Object.entries(rootBonuses)) {
        if (bonuses[key] !== void 0) {
          bonuses[key] += value;
        }
      }
      return bonuses;
    }
    /**
     * 获取精通加成倍率
     * @param {string} element - 元素类型
     */
    getMasteryMultiplier(element) {
      if (!MASTERY_ELEMENTS.includes(element)) {
        return 1;
      }
      const masteryData = this.getMasteryData();
      const level = masteryData.mastery[element].level;
      return MASTERY_EFFECT_MULTIPLIERS[MASTERY_LEVELS[level]];
    }
    /**
     * 序列化数据 (用于保存)
     */
    serialize() {
      const hookData = [];
      for (const [hookId, hook] of this.hooks) {
        hookData.push({ hookId, type: hook.type, enabled: hook.enabled });
      }
      return {
        talentData: this.gameState.talentData,
        masteryData: this.gameState.masteryData,
        hookIdCounter: this.hookIdCounter,
        registeredHooks: hookData
      };
    }
    /**
     * 从存档恢复
     */
    deserialize(data) {
      if (data.talentData) {
        this.gameState.talentData = data.talentData;
      }
      if (data.masteryData) {
        this.gameState.masteryData = data.masteryData;
      }
      if (data.hookIdCounter) {
        this.hookIdCounter = data.hookIdCounter;
      }
    }
  };
  function createTalentTreeMCPHandlers(gameState3) {
    const service = new TalentTreeService(gameState3);
    return {
      /**
       * spirit.talent.allocate - 分配天赋点
       */
      "spirit.talent.allocate": (params) => {
        const { branch, layer } = params || {};
        return service.allocateTalent(branch, layer);
      },
      /**
       * spirit.talent.reset - 重置天赋树
       */
      "spirit.talent.reset": (params) => {
        const { hasItem } = params || {};
        return service.resetTalentTree(hasItem);
      },
      /**
       * spirit.talent.query - 查询天赋树状态
       */
      "spirit.talent.query": () => {
        return service.queryTalentTree();
      },
      /**
       * spirit.mastery.query - 查询元素精通
       */
      "spirit.mastery.query": (params) => {
        const { element } = params || {};
        return service.queryMastery(element);
      },
      /**
       * spirit.mastery.upgrade - 提升精通等级
       */
      "spirit.mastery.upgrade": (params) => {
        const { element } = params || {};
        return service.upgradeMastery(element);
      },
      /**
       * spirit.hook.register - 注册灵根变化钩子
       */
      "spirit.hook.register": (params) => {
        const { type, callback } = params || {};
        return service.registerHook(type, callback);
      }
    };
  }

  // src/systems/persistence/SaveManager.js
  var SAVE_CONFIG = {
    storageKey: "cultivationSave",
    autoSaveKey: "cultivation_sim_autosave",
    cloudTokenKey: "cultivationCloudToken",
    cloudGistIdKey: "cultivationCloudGistId",
    cloudAutoSaveKey: "cultivationCloudAutoSave",
    cloudUrl: "https://api.github.com/gists",
    maxSaveHistory: 5,
    compressionThreshold: 1024 * 1024,
    // 1MB
    autoSaveInterval: 6e4
    // 60秒
  };
  function saveGame2() {
    try {
      const data = JSON.stringify(gameState);
      if (data.length > SAVE_CONFIG.compressionThreshold) {
        console.warn(`\u5B58\u6863\u5927\u5C0F: ${(data.length / 1024).toFixed(1)}KB, \u5EFA\u8BAE\u6E05\u7406`);
      }
      localStorage.setItem(SAVE_CONFIG.storageKey, data);
      updateAutoSave();
      return { success: true, size: data.length };
    } catch (e) {
      console.error("\u4FDD\u5B58\u5931\u8D25:", e);
      return { error: e.message };
    }
  }
  function updateAutoSave() {
    try {
      if (!gameState.saveSlots) gameState.saveSlots = {};
      const autoSnapshot = {
        timestamp: Date.now(),
        realm: gameState.realm,
        stage: gameState.stage,
        spiritStones: gameState.spiritStones,
        days: gameState.days,
        level: gameState.level
      };
      gameState.saveSlots.auto = autoSnapshot;
      localStorage.setItem(SAVE_CONFIG.autoSaveKey, JSON.stringify(gameState));
      maintainSaveHistory();
    } catch (e) {
      console.error("\u81EA\u52A8\u5B58\u6863\u66F4\u65B0\u5931\u8D25:", e);
    }
  }
  function maintainSaveHistory() {
    const historyKey = "cultivation_save_history";
    let history = JSON.parse(localStorage.getItem(historyKey) || "[]");
    history.unshift({
      timestamp: Date.now(),
      realm: gameState.realm,
      days: gameState.days,
      spiritStones: gameState.spiritStones
    });
    if (history.length > SAVE_CONFIG.maxSaveHistory) {
      history = history.slice(0, SAVE_CONFIG.maxSaveHistory);
    }
    localStorage.setItem(historyKey, JSON.stringify(history));
  }
  function getSaveHistory() {
    const historyKey = "cultivation_save_history";
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  }
  function doSaveGame() {
    try {
      const result = saveGame2();
      if (result.success) {
        addLog("good", "\u{1F4C1} \u5B58\u6863\u6210\u529F", `\u6E38\u620F\u5DF2\u4FDD\u5B58 (${(result.size / 1024).toFixed(1)}KB)`);
      } else {
        addLog("bad", "\u{1F4C1} \u5B58\u6863\u5931\u8D25", result.error);
      }
      return result;
    } catch (e) {
      addLog("bad", "\u{1F4C1} \u5B58\u6863\u5931\u8D25", e.message);
      return { error: e.message };
    }
  }
  function showSaveLoadModal() {
    const saved = localStorage.getItem(SAVE_CONFIG.storageKey);
    let saveInfo = "\u672A\u627E\u5230\u5B58\u6863";
    if (saved) {
      try {
        const data = JSON.parse(saved);
        saveInfo = `\u7B2C ${data.days || 0} \u5929 | ${data.realm || 1} \u91CD\u5929`;
      } catch (e) {
        saveInfo = "\u5B58\u6863\u635F\u574F";
      }
    }
    let html = '<div style="padding:16px;background:#1a1a2e;border-radius:8px;min-width:280px;">';
    html += '<div style="margin-bottom:16px;text-align:center;">';
    html += '<b style="color:#ffd700;font-size:16px;">\u{1F4C1} \u5B58\u6863\u7BA1\u7406</b>';
    html += `<div style="color:#888;font-size:11px;margin-top:4px;">${saveInfo}</div>`;
    html += "</div>";
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';
    html += `<button onclick="doSaveGame();closeModal();" style="padding:12px;background:#2e7d32;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">\u{1F4BE} \u4FDD\u5B58\u6E38\u620F</button>`;
    html += `<button onclick="doLoadGame();closeModal();" style="padding:12px;background:#1565c0;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">\u{1F4C2} \u52A0\u8F7D\u5B58\u6863</button>`;
    html += `<button onclick="showAutoSaveInfo()" style="padding:12px;background:#333;color:#aaa;border:1px solid #555;border-radius:6px;cursor:pointer;font-size:14px;">\u2139\uFE0F \u81EA\u52A8\u5B58\u6863</button>`;
    html += `<button onclick="doResetGame()" style="padding:12px;background:#c62828;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">\u26A0\uFE0F \u91CD\u7F6E\u6E38\u620F</button>`;
    html += "</div>";
    html += '<button onclick="closeModal()" style="margin-top:16px;width:100%;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">\u5173\u95ED</button>';
    html += "</div>";
    showModal(html);
  }

  // src/systems/persistence/LoadManager.js
  var LOAD_CONFIG = {
    storageKey: "cultivationSave",
    autoSaveKey: "cultivation_sim_autosave",
    versionKey: "cultivation_save_version",
    currentVersion: 95,
    // 当前游戏版本
    migrationStrategies: /* @__PURE__ */ new Map()
    // 版本迁移策略
  };
  function loadGame() {
    const saved = localStorage.getItem(LOAD_CONFIG.storageKey);
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        const migrated = migrateIfNeeded(loaded);
        gameState = applyDefaults(migrated);
        const validation = validateGameState(gameState);
        if (!validation.valid) {
          console.warn("\u5B58\u6863\u9A8C\u8BC1\u8B66\u544A:", validation.issues);
        }
        if (gameState.isGameOver) {
          showGameOverScreen();
        } else {
          showGameUI();
        }
        return { success: true, days: gameState.days, version: gameState.version };
      } catch (e) {
        console.error("\u52A0\u8F7D\u5931\u8D25:", e);
        return { error: e.message };
      }
    } else {
      return { error: "No save found" };
    }
  }
  function applyDefaults(loaded) {
    const defaults = {
      // 基础战斗属性
      activeEffects: {
        breakthrough_boost: 0,
        cultivate_speed: 0,
        "\u6E21\u52AB_mindset_protect": 0,
        attack: 0,
        defense: 0,
        cultivate_qi_rate: 0,
        "\u6E21\u52AB_damage_reduce": 0,
        escape: 0,
        foresee_event: 0,
        all_stats: 0,
        serendipity_boost: 0
      },
      // 装备
      equippedTreasures: [null, null, null],
      // 背包
      inventory: [],
      shopItems: [],
      lastShopDay: 0,
      // 渡劫系统
      tribulation: {
        inProgress: false,
        currentStage: 0,
        totalStages: 9,
        currentType: null,
        preparations: [],
        damageTaken: 0,
        tribKey: null
      },
      // 转生buff
      hasTransmigrationBuff: false,
      // 渡劫记录
      tribulationRecord: [],
      // 战斗统计
      combat: {
        wins: 0,
        losses: 0,
        honor: 0,
        fame: 0,
        battleHistory: [],
        injured: false,
        injuryEndDay: 0
      },
      // V33 战斗AI学习系统
      combatProfile: {
        playerPatterns: [],
        totalBattles: 0,
        winsAgainst: 0,
        currentEnemy: null,
        learningData: {},
        preferredDistance: null,
        spellUsageRate: 0,
        defenseFrequency: 0,
        attackTiming: []
      },
      lastCombatDay: 0,
      // V35 宗门互动
      sectMissions: [],
      sectMissionCooldown: 0,
      lastMissionRefreshDay: 0,
      // V36 装备打造
      equipmentForgeCount: 0,
      lastForgeDay: 0,
      // V37 天道法则
      celestialLaws: {
        comprehended: [],
        active: [],
        comprehending: null,
        comprehendingProgress: 0,
        comprehendDays: 0,
        maxActiveLaws: 3,
        lawBonus: {}
      },
      // V38 仙界社交
      immortalAlly: {
        id: null,
        name: "",
        rank: 1,
        role: "none",
        contribution: 0,
        joinedDay: 0,
        allies: [],
        skillLevel: 0,
        dailyActivity: 0,
        lastActivityDay: 0
      },
      immortalFriends: [],
      allyApplications: [],
      // V39 仙宠
      spiritPets: { pets: [], lastInteractionDay: 0 },
      // V40 拍卖行
      auction: {
        listings: [],
        frozenFunds: 0,
        playerId: null,
        playerName: null,
        sortType: "endingSoon"
      },
      // V41 经济系统
      economy: {
        currentInflation: 0.02,
        totalIncome: 0,
        totalExpense: 0,
        totalTax: 0,
        totalWealth: 0,
        avgDailyIncome: 50,
        avgDailyExpense: 0,
        luxuryPurchases: 0,
        activeEvents: [],
        economyBuffs: {}
      },
      // V42 竞技场
      celestialArena: {
        currentSeason: 1,
        seasonStartTime: Date.now(),
        currentRank: 1,
        highestRank: 1,
        score: 0,
        totalScoreEarned: 0,
        totalWins: 0,
        totalLosses: 0,
        currentStreak: 0,
        longestStreak: 0,
        promotionWins: 0,
        dailyChallengesUsed: 0,
        derankProtection: 2,
        matchHistory: [],
        lastRewardClaimed: 0,
        totalRewardsClaimed: 0,
        bountyPool: 0,
        bountyWins: 0
      },
      // V43 仙宫
      palace: {
        level: 1,
        prosperity: 100,
        buildings: [],
        workers: [],
        styleIndex: 0,
        bonus: {
          incomeBonus: 0,
          cultivationSpeed: 0,
          serendipityChance: 0,
          combatPower: 0
        },
        totalWagesPaid: 0
      },
      // V44 自创仙法
      customSpells: [],
      essences: {},
      // V45 轮回
      karma: {
        points: 0,
        goodKarma: 0,
        evilKarma: 0,
        reincarnationCount: 0,
        pastLifeMemories: []
      },
      // 宗门
      sect: {
        name: null,
        level: 0,
        spiritStones: 0,
        disciples: [],
        elders: [],
        buildings: {
          library: false,
          alchemy: false,
          forge: false,
          archive: false
        },
        techniques: [],
        contributionShop: [],
        lastShopRefresh: 0,
        lastResourceCollection: 0,
        npcDialogueHistory: [],
        npcTasks: [],
        npcLastActions: {},
        tribulationRequest: {
          status: "none",
          elderScore: 0,
          elderComment: "",
          leaderDecision: "",
          leaderComment: "",
          buffApplied: false,
          submitDay: 0
        },
        celestialCycle: {
          day: 0,
          completed: false,
          lastResult: null,
          blessingActive: false,
          cycleInterval: 3
        },
        sectMissions: [],
        sectMissionCooldown: 0
      },
      // 奇遇
      serendipity: {
        lastTriggerDay: 0,
        todayCount: 0,
        lastTriggerType: null,
        cooldownTypes: {},
        badLuck: 0,
        currentEvent: null,
        log: [],
        luckStatus: null,
        luckEndDay: 0,
        serendipityBoostEndDay: 0
      },
      // V7 灵根
      spiritRootAwakening: {
        status: "dormant",
        stage: 0,
        triggerDay: 0,
        tasks: [],
        rewards: null,
        lastEventDay: 0,
        attempts: 0
      },
      constitutions: [],
      // V8 炼器
      crafting: {
        furnace: { level: 1, type: "alchemy" },
        anvil: { level: 1, type: "forge" },
        transactionLog: []
      },
      // V9 世界地图
      worldMap: {
        currentContinent: "\u4E2D\u5DDE",
        currentRegion: "\u4E2D\u5DDE\u57CE",
        exploredContinents: ["\u4E2D\u5DDE"],
        exploredRegions: ["\u4E2D\u5DDE\u57CE", "\u4E2D\u5DDE\u91CE\u5916"],
        actionPower: 10,
        maxActionPower: 10,
        continentUnlocks: {
          "\u4E2D\u5DDE": 0,
          "\u5357\u7586": 1,
          "\u5317\u57DF": 2,
          "\u897F\u57DF": 3,
          "\u4E1C\u6D77": 2,
          "\u4ED9\u754C\u788E\u7247": 4
        },
        bossRefreshDays: {},
        lastTravelDay: 0
      },
      // 成就系统
      achievements: {
        unlocked: [],
        titles: [],
        stats: {
          tribulationsCompleted: 0,
          dungeonBossesKilled: 0,
          sectContributions: 0,
          treasuresRefined: 0,
          serendipitiesEncountered: 0,
          flawlessTribulations: 0
        }
      },
      // NPC记忆
      npcMemory: [],
      // 称号
      title: "\u7B51\u57FA\u4FEE\u58EB",
      // 离线挂机
      offlineEfficiency: 0.8,
      // 保存槽位
      saveSlots: {},
      // 历史日志
      combatLogHistory: [],
      eventLogHistory: []
    };
    const result = { ...defaults, ...loaded };
    result.activeEffects = { ...defaults.activeEffects, ...loaded.activeEffects || {} };
    if (loaded.spiritRoot) {
      result.spiritRoot = {
        ...loaded.spiritRoot,
        awakeningAvailable: loaded.spiritRoot.awakeningAvailable || false,
        hasAwakened: loaded.spiritRoot.hasAwakened || false,
        awakenedQuality: loaded.spiritRoot.awakenedQuality || null
      };
    }
    if (!result.spiritRoot) {
      result.spiritRoot = generateRandomSpiritRoot();
    }
    return result;
  }
  function validateGameState(state) {
    const issues = [];
    if (typeof state.realm !== "number" || state.realm < 1) {
      issues.push("realm invalid");
    }
    if (typeof state.spiritStones !== "number" || state.spiritStones < 0) {
      issues.push("spiritStones invalid");
    }
    if (typeof state.days !== "number" || state.days < 1) {
      issues.push("days invalid");
    }
    if (!Array.isArray(state.inventory)) {
      issues.push("inventory not array");
    }
    if (!Array.isArray(state.techniques)) {
      issues.push("techniques not array");
    }
    if (typeof state.combat !== "object") {
      issues.push("combat not object");
    }
    if (typeof state.serendipity !== "object") {
      issues.push("serendipity not object");
    }
    return {
      valid: issues.length === 0,
      issues
    };
  }
  function registerMigrationStrategy(fromVersion, toVersion, migrationFn) {
    const key = `${fromVersion}->${toVersion}`;
    LOAD_CONFIG.migrationStrategies.set(key, migrationFn);
  }
  function migrateIfNeeded(data) {
    const saveVersion = data.version || 1;
    const currentVersion = LOAD_CONFIG.currentVersion;
    if (saveVersion >= currentVersion) {
      return data;
    }
    let migrated = { ...data };
    for (let v = saveVersion + 1; v <= currentVersion; v++) {
      const key = `${v - 1}->${v}`;
      const strategy = LOAD_CONFIG.migrationStrategies.get(key);
      if (strategy) {
        migrated = strategy(migrated);
        console.log(`Migrated from v${v - 1} to v${v}`);
      }
    }
    migrated.version = currentVersion;
    return migrated;
  }
  var migrateV1ToV2 = (data) => {
    data.activeEffects = {
      breakthrough_boost: 0,
      cultivate_speed: 0,
      "\u6E21\u52AB_mindset_protect": 0,
      attack: 0,
      defense: 0
    };
    data.equippedTreasures = [null, null, null];
    return data;
  };
  var migrateV2ToV3 = (data) => {
    data.inventory = data.inventory || [];
    data.shopItems = data.shopItems || [];
    return data;
  };
  registerMigrationStrategy(1, 2, migrateV1ToV2);
  registerMigrationStrategy(2, 3, migrateV2ToV3);
  function doLoadGame() {
    try {
      const saved = localStorage.getItem(LOAD_CONFIG.storageKey);
      if (!saved) {
        addLog("bad", "\u52A0\u8F7D\u5931\u8D25", "\u6CA1\u6709\u627E\u5230\u5B58\u6863");
        return { error: "No save" };
      }
      const data = JSON.parse(saved);
      if (!data.combatLogHistory) data.combatLogHistory = [];
      if (!data.eventLogHistory) data.eventLogHistory = [];
      const migrated = migrateIfNeeded(data);
      gameState = applyDefaults(migrated);
      addLog("good", "\u52A0\u8F7D\u6210\u529F", `\u5B58\u6863\u5DF2\u52A0\u8F7D (\u7B2C${gameState.days}\u5929)`);
      if (typeof renderGameUI === "function") renderGameUI();
      if (typeof refreshInventoryUI === "function") refreshInventoryUI();
      if (typeof updateDisplay === "function") updateDisplay();
      showGameUI();
      return { success: true, days: gameState.days };
    } catch (e) {
      addLog("bad", "\u52A0\u8F7D\u5931\u8D25", "\u52A0\u8F7D\u5931\u8D25: " + e.message);
      return { error: e.message };
    }
  }

  // src/systems/offline/OfflineManager.js
  var OFFLINE_CONFIG = {
    maxOfflineHours: 24,
    offlineEfficiency: 0.8,
    earningsThreshold: 1e3,
    autoSuspendDays: 7,
    snapshotInterval: 6e4
    // 1分钟保存一次快照
  };
  var SyncState = class {
    constructor() {
      this.pendingWrites = [];
      this.lastSyncedAt = 0;
      this.syncVersion = 0;
      this.dirtyFields = /* @__PURE__ */ new Set();
    }
    markDirty(field) {
      this.dirtyFields.add(field);
      this.syncVersion++;
    }
    clearDirty() {
      this.dirtyFields.clear();
    }
  };
  var OfflineSnapshot = class {
    constructor(gameState3, timestamp) {
      this.timestamp = timestamp;
      this.realm = gameState3.realm;
      this.cultivation = { ...gameState3.cultivation };
      this.spiritStones = gameState3.spiritStones;
      this.level = gameState3.level;
      this.idleTasks = gameState3.idleTasks ? gameState3.idleTasks.map((t) => ({ ...t })) : [];
      this.offlineEfficiency = gameState3.offlineEfficiency || OFFLINE_CONFIG.offlineEfficiency;
      this.activeEffects = gameState3.activeEffects || [];
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
  };
  var PowerSync = class {
    constructor() {
      this.syncState = new SyncState();
      this.workerChannel = null;
      this.mainThread = null;
      this.lastSnapshot = null;
      this.conflictLog = [];
    }
    /**
     * 离线前捕获快照
     */
    captureSnapshot(gameState3) {
      this.lastSnapshot = new OfflineSnapshot(gameState3, Date.now());
      return this.lastSnapshot;
    }
    /**
     * 从快照恢复，计算离线收益
     */
    restoreFromSnapshot(snapshot, gameState3) {
      const now = Date.now();
      const offlineSeconds = (now - snapshot.timestamp) / 1e3;
      const offlineHours = offlineSeconds / 3600;
      const cappedHours = Math.min(offlineHours, OFFLINE_CONFIG.maxOfflineHours);
      let totalEarnings = 0;
      for (const task of snapshot.idleTasks) {
        if (task.status === "active") {
          const taskDuration = (task.endTime - task.startTime) / 1e3;
          if (taskDuration > 0) {
            const completedUnits = Math.floor(cappedHours * 3600 / taskDuration);
            const efficiency = snapshot.offlineEfficiency || OFFLINE_CONFIG.offlineEfficiency;
            const taskEarnings = efficiency * completedUnits * (task.baseEarnings || 10);
            totalEarnings += taskEarnings;
          }
        }
      }
      gameState3.spiritStones += Math.floor(totalEarnings);
      gameState3.offlineEarnings = Math.floor(totalEarnings);
      gameState3.lastActiveTime = snapshot.timestamp;
      this.syncWorkerState(gameState3);
      return {
        offlineSeconds,
        offlineEarnings: Math.floor(totalEarnings),
        offlineHours: cappedHours
      };
    }
    /**
     * 同步到worker (SharedWorker路径)
     */
    syncWorkerState(gameState3) {
      this.syncState.lastSyncedAt = Date.now();
      this.syncState.clearDirty();
    }
    /**
     * 同步到主线程 (localStorage路径)
     */
    syncMainState(gameState3) {
      this.syncState.markDirty("gameState");
      this.syncWorkerState(gameState3);
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
      const merged = { ...mainState };
      for (const field of this.syncState.dirtyFields) {
        if (workerState[field] !== void 0) {
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
  };
  var powerSync = new PowerSync();

  // src/systems/ai/NPCEvolutionEngine.js
  init_NPCCollaboration();
  var NPCLearningEntry = class {
    constructor(npcId, role, initialData = {}) {
      this.npcId = npcId;
      this.role = role;
      this.registeredAt = Date.now();
      this.lastInteraction = null;
      this.adaptationLevel = 1;
      this.interactions = [];
      this.behaviorPattern = {
        friendliness: 0.5,
        // 0-1, 初始友好度
        taskSuccessRate: 0.5,
        // 0-1, 任务成功率
        dialoguePreference: "neutral",
        // neutral/positive/negative
        adaptationScore: 0
        // 适应评分
      };
      this.evolutionCount = 0;
      this.lastEvolutionAt = null;
      if (initialData.dialogueBase) {
        this.dialogueBase = initialData.dialogueBase;
      }
    }
  };
  var InteractionRecord = class {
    constructor(type, playerAction, npcResponse, outcome = {}) {
      this.id = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = type;
      this.playerAction = playerAction;
      this.npcResponse = npcResponse;
      this.timestamp = Date.now();
      this.outcome = {
        success: outcome.success ?? false,
        satisfaction: outcome.satisfaction ?? 0.5,
        // 0-1
        reward: outcome.reward ?? 0,
        feedback: outcome.feedback ?? null
      };
    }
  };
  var DialogueEntry = class {
    constructor(npcId, text, category = "base", metadata = {}) {
      this.id = `dialogue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.npcId = npcId;
      this.text = text;
      this.category = category;
      this.usageCount = 0;
      this.lastUsed = null;
      this.effectiveness = 0.5;
      this.createdAt = Date.now();
      this.metadata = metadata;
    }
  };
  var NPCLearningRegistry = class {
    constructor() {
      this.entries = /* @__PURE__ */ new Map();
      this.dialogueLibrary = /* @__PURE__ */ new Map();
      this.interactionStats = /* @__PURE__ */ new Map();
      this.maxInteractionsPerNPC = 500;
      this.evolveThreshold = 10;
    }
    /**
     * 注册NPC到学习系统
     */
    register(npcId, role, initialData = {}) {
      if (this.entries.has(npcId)) {
        return {
          success: false,
          reason: "NPC already registered",
          entry: this.entries.get(npcId)
        };
      }
      const entry = new NPCLearningEntry(npcId, role, initialData);
      this.entries.set(npcId, entry);
      if (initialData.dialogueBase) {
        this.dialogueLibrary.set(npcId, initialData.dialogueBase.map(
          (d) => new DialogueEntry(npcId, d.text, "base", d.metadata)
        ));
      } else {
        this.dialogueLibrary.set(npcId, []);
      }
      this.interactionStats.set(npcId, {
        totalInteractions: 0,
        successfulInteractions: 0,
        averageSatisfaction: 0,
        lastInteractionType: null
      });
      return { success: true, entry };
    }
    /**
     * 获取NPC学习条目
     */
    getEntry(npcId) {
      return this.entries.get(npcId);
    }
    /**
     * 记录NPC与玩家的交互
     */
    recordInteraction(npcId, type, playerAction, npcResponse, outcome = {}) {
      const entry = this.entries.get(npcId);
      if (!entry) {
        return { success: false, reason: "NPC not registered" };
      }
      const record = new InteractionRecord(type, playerAction, npcResponse, outcome);
      entry.interactions.push(record);
      entry.lastInteraction = Date.now();
      if (entry.interactions.length > this.maxInteractionsPerNPC) {
        entry.interactions = entry.interactions.slice(-this.maxInteractionsPerNPC);
      }
      this.updateStats(npcId, record);
      this.updateBehaviorPattern(npcId, record);
      const shouldEvolve = this.checkEvolutionTrigger(npcId);
      return {
        success: true,
        record,
        shouldEvolve
      };
    }
    /**
     * 更新交互统计
     */
    updateStats(npcId, record) {
      const stats = this.interactionStats.get(npcId) || {
        totalInteractions: 0,
        successfulInteractions: 0,
        averageSatisfaction: 0,
        lastInteractionType: null
      };
      stats.totalInteractions++;
      if (record.outcome.success) {
        stats.successfulInteractions++;
      }
      const totalSatisfaction = stats.averageSatisfaction * (stats.totalInteractions - 1) + record.outcome.satisfaction;
      stats.averageSatisfaction = totalSatisfaction / stats.totalInteractions;
      stats.lastInteractionType = record.type;
      this.interactionStats.set(npcId, stats);
    }
    /**
     * 更新行为模式
     */
    updateBehaviorPattern(npcId, record) {
      const entry = this.entries.get(npcId);
      if (!entry) return;
      const pattern = entry.behaviorPattern;
      if (record.outcome.success) {
        pattern.friendliness = Math.min(1, pattern.friendliness + 0.02);
      } else {
        pattern.friendliness = Math.max(0, pattern.friendliness - 0.02);
      }
      if (record.type === "task") {
        if (record.outcome.success) {
          pattern.taskSuccessRate = Math.min(1, pattern.taskSuccessRate + 0.05);
        }
      }
      pattern.adaptationScore = this.calculateAdaptationScore(npcId);
    }
    /**
     * 计算适应评分
     */
    calculateAdaptationScore(npcId) {
      const entry = this.entries.get(npcId);
      const stats = this.interactionStats.get(npcId);
      if (!entry || !stats) return 0;
      const interactionScore = Math.min(entry.interactions.length / 100, 1) * 0.3;
      const successScore = stats.totalInteractions > 0 ? stats.successfulInteractions / stats.totalInteractions * 0.3 : 0;
      const satisfactionScore = stats.averageSatisfaction * 0.4;
      return interactionScore + successScore + satisfactionScore;
    }
    /**
     * 检查是否触发进化
     */
    checkEvolutionTrigger(npcId) {
      const entry = this.entries.get(npcId);
      if (!entry) return false;
      if (entry.interactions.length >= this.evolveThreshold) {
        return true;
      }
      if (entry.behaviorPattern.adaptationScore > 0.8 && entry.adaptationLevel < 10) {
        return true;
      }
      return false;
    }
    /**
     * 获取NPC学习状态
     */
    getLearningStatus(npcId) {
      const entry = this.entries.get(npcId);
      const stats = this.interactionStats.get(npcId);
      if (!entry) {
        return { error: "NPC not registered" };
      }
      return {
        npcId: entry.npcId,
        role: entry.role,
        adaptationLevel: entry.adaptationLevel,
        behaviorPattern: entry.behaviorPattern,
        stats: {
          totalInteractions: (stats == null ? void 0 : stats.totalInteractions) || 0,
          successfulInteractions: (stats == null ? void 0 : stats.successfulInteractions) || 0,
          averageSatisfaction: (stats == null ? void 0 : stats.averageSatisfaction) || 0,
          lastInteractionType: (stats == null ? void 0 : stats.lastInteractionType) || null,
          successRate: (stats == null ? void 0 : stats.totalInteractions) > 0 ? stats.successfulInteractions / stats.totalInteractions : 0
        },
        evolutionCount: entry.evolutionCount,
        lastEvolutionAt: entry.lastEvolutionAt,
        registeredAt: entry.registeredAt,
        lastInteraction: entry.lastInteraction,
        interactionCount: entry.interactions.length
      };
    }
    /**
     * 获取所有已注册的NPC
     */
    getAllRegisteredNPCs() {
      return Array.from(this.entries.keys());
    }
  };
  var BehaviorEvolutionEngine = class {
    constructor(registry) {
      this.registry = registry;
      this.evolutionRules = this.initEvolutionRules();
    }
    initEvolutionRules() {
      return {
        // 进化维度
        dimensions: {
          friendliness: { min: 0, max: 1, weight: 0.3 },
          taskSuccessRate: { min: 0, max: 1, weight: 0.4 },
          dialoguePreference: {
            values: ["neutral", "positive", "negative"],
            weight: 0.2
          },
          adaptationScore: { min: 0, max: 1, weight: 0.1 }
        },
        // 进化触发阈值
        thresholds: {
          minInteractions: 10,
          minAdaptationScore: 0.5,
          evolutionCooldown: 36e5
          // 1小时冷却
        }
      };
    }
    /**
     * 评估并执行进化
     */
    evaluateEvolution(npcId) {
      const entry = this.registry.getEntry(npcId);
      if (!entry) {
        return { success: false, reason: "NPC not registered" };
      }
      if (entry.lastEvolutionAt) {
        const cooldown = this.evolutionRules.thresholds.evolutionCooldown;
        if (Date.now() - entry.lastEvolutionAt < cooldown) {
          return {
            success: false,
            reason: "Evolution on cooldown",
            remainingCooldown: cooldown - (Date.now() - entry.lastEvolutionAt)
          };
        }
      }
      const evaluation = this.evaluateEvolutionConditions(npcId);
      if (evaluation.canEvolve) {
        return this.executeEvolution(npcId, evaluation);
      }
      return {
        success: true,
        evolved: false,
        evaluation
      };
    }
    /**
     * 评估进化条件
     */
    evaluateEvolutionConditions(npcId) {
      const entry = this.registry.getEntry(npcId);
      const stats = this.registry.interactionStats.get(npcId);
      const conditions = {
        meetsMinInteractions: entry.interactions.length >= this.evolutionRules.thresholds.minInteractions,
        meetsMinAdaptation: entry.behaviorPattern.adaptationScore >= this.evolutionRules.thresholds.minAdaptationScore,
        hasPositiveTrend: this.checkPositiveTrend(npcId)
      };
      const canEvolve = conditions.meetsMinInteractions && (conditions.meetsMinAdaptation || conditions.hasPositiveTrend);
      return {
        canEvolve,
        conditions,
        currentLevel: entry.adaptationLevel,
        maxLevel: 10,
        gapToNextLevel: this.calculateGapToNextLevel(entry.adaptationLevel)
      };
    }
    /**
     * 检查是否有正向趋势
     */
    checkPositiveTrend(npcId) {
      const entry = this.registry.getEntry(npcId);
      if (!entry || entry.interactions.length < 5) return false;
      const recent = entry.interactions.slice(-5);
      const older = entry.interactions.slice(-10, -5);
      if (older.length === 0) return true;
      const recentAvgSatisfaction = recent.reduce((sum, r) => sum + r.outcome.satisfaction, 0) / recent.length;
      const olderAvgSatisfaction = older.reduce((sum, r) => sum + r.outcome.satisfaction, 0) / older.length;
      return recentAvgSatisfaction > olderAvgSatisfaction;
    }
    /**
     * 计算到下一级的差距
     */
    calculateGapToNextLevel(currentLevel) {
      const pointsNeeded = (currentLevel + 1) * 100;
      return pointsNeeded;
    }
    /**
     * 执行进化
     */
    executeEvolution(npcId, evaluation) {
      const entry = this.registry.getEntry(npcId);
      const evolutionVector = this.calculateEvolutionVector(npcId);
      entry.adaptationLevel = Math.min(10, entry.adaptationLevel + 1);
      entry.evolutionCount++;
      entry.lastEvolutionAt = Date.now();
      entry.behaviorPattern.friendliness = Math.min(
        1,
        entry.behaviorPattern.friendliness + evolutionVector.friendliness * 0.1
      );
      entry.behaviorPattern.taskSuccessRate = Math.min(
        1,
        entry.behaviorPattern.taskSuccessRate + evolutionVector.taskSuccessRate * 0.1
      );
      if (evolutionVector.dialoguePreferenceShift) {
        const prefs = this.evolutionRules.dimensions.dialoguePreference.values;
        const currentIdx = prefs.indexOf(entry.behaviorPattern.dialoguePreference);
        if (currentIdx < prefs.length - 1) {
          entry.behaviorPattern.dialoguePreference = prefs[currentIdx + 1];
        }
      }
      return {
        success: true,
        evolved: true,
        newLevel: entry.adaptationLevel,
        evolutionVector,
        changes: {
          friendliness: evolutionVector.friendliness * 0.1,
          taskSuccessRate: evolutionVector.taskSuccessRate * 0.1,
          dialoguePreference: entry.behaviorPattern.dialoguePreference
        }
      };
    }
    /**
     * 计算进化向量
     */
    calculateEvolutionVector(npcId) {
      const entry = this.registry.getEntry(npcId);
      const stats = this.registry.interactionStats.get(npcId);
      const successRate = stats.totalInteractions > 0 ? stats.successfulInteractions / stats.totalInteractions : 0.5;
      return {
        friendliness: successRate > 0.6 ? 1 : successRate < 0.4 ? -1 : 0,
        taskSuccessRate: entry.behaviorPattern.taskSuccessRate < 0.7 ? 1 : 0,
        dialoguePreferenceShift: entry.behaviorPattern.dialoguePreference === "negative" && successRate > 0.5
      };
    }
    /**
     * 手动触发进化评估
     */
    triggerEvolution(npcId) {
      return this.evaluateEvolution(npcId);
    }
  };
  var AdaptiveDialogueSystem = class {
    constructor(registry) {
      this.registry = registry;
      this.maxExtendedDialogues = 50;
    }
    /**
     * 添加扩展对话
     */
    addDialogue(npcId, text, category = "extended", metadata = {}) {
      const entry = this.registry.getEntry(npcId);
      if (!entry) {
        return { success: false, reason: "NPC not registered" };
      }
      const dialogues = this.registry.dialogueLibrary.get(npcId) || [];
      const extendedCount = dialogues.filter((d) => d.category === "extended").length;
      if (category === "extended" && extendedCount >= this.maxExtendedDialogues) {
        return {
          success: false,
          reason: "Maximum extended dialogues reached",
          maxExtendedDialogues: this.maxExtendedDialogues
        };
      }
      const exists = dialogues.some((d) => d.text === text && d.npcId === npcId);
      if (exists) {
        return { success: false, reason: "Dialogue already exists" };
      }
      const dialogue = new DialogueEntry(npcId, text, category, metadata);
      dialogues.push(dialogue);
      this.registry.dialogueLibrary.set(npcId, dialogues);
      return { success: true, dialogue };
    }
    /**
     * 列出NPC的对话库
     */
    listDialogues(npcId, filter = {}) {
      const dialogues = this.registry.dialogueLibrary.get(npcId) || [];
      let filtered = dialogues;
      if (filter.category) {
        filtered = filtered.filter((d) => d.category === filter.category);
      }
      if (filter.minEffectiveness) {
        filtered = filtered.filter((d) => d.effectiveness >= filter.minEffectiveness);
      }
      if (filter.sortBy === "usage") {
        filtered.sort((a, b) => b.usageCount - a.usageCount);
      } else if (filter.sortBy === "effectiveness") {
        filtered.sort((a, b) => b.effectiveness - a.effectiveness);
      } else {
        filtered.sort((a, b) => a.createdAt - b.createdAt);
      }
      return {
        success: true,
        npcId,
        total: dialogues.length,
        filtered: filtered.length,
        breakdown: {
          base: dialogues.filter((d) => d.category === "base").length,
          extended: dialogues.filter((d) => d.category === "extended").length,
          adaptive: dialogues.filter((d) => d.category === "adaptive").length
        },
        dialogues: filtered
      };
    }
    /**
     * 选择最佳对话
     */
    selectDialogue(npcId, context = {}) {
      const entry = this.registry.getEntry(npcId);
      if (!entry) return null;
      const dialogues = this.registry.dialogueLibrary.get(npcId) || [];
      if (dialogues.length === 0) return null;
      const preference = entry.behaviorPattern.dialoguePreference;
      const effectiveDialogues = dialogues.filter((d) => d.effectiveness > 0.3);
      const candidates = effectiveDialogues.length > 0 ? effectiveDialogues : dialogues;
      if (preference === "positive") {
        const positive = candidates.filter((d) => d.effectiveness > 0.6);
        if (positive.length > 0) return positive[Math.floor(Math.random() * positive.length)];
      }
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      selected.usageCount++;
      selected.lastUsed = Date.now();
      return selected;
    }
    /**
     * 更新对话有效性（基于反馈）
     */
    updateDialogueEffectiveness(npcId, dialogueId, feedback) {
      const dialogues = this.registry.dialogueLibrary.get(npcId) || [];
      const dialogue = dialogues.find((d) => d.id === dialogueId);
      if (!dialogue) return { success: false, reason: "Dialogue not found" };
      const currentEffectiveness = dialogue.effectiveness;
      dialogue.effectiveness = currentEffectiveness * 0.7 + feedback * 0.3;
      return { success: true, newEffectiveness: dialogue.effectiveness };
    }
  };
  var NPCEvolutionEngine = class {
    constructor() {
      this.registry = new NPCLearningRegistry();
      this.evolutionEngine = new BehaviorEvolutionEngine(this.registry);
      this.dialogueSystem = new AdaptiveDialogueSystem(this.registry);
      this.initialized = false;
    }
    /**
     * 初始化引擎
     */
    init(gameState3) {
      this.initialized = true;
      if (gameState3.npcEvolution) {
        this.restoreFromState(gameState3.npcEvolution);
      }
      console.log("[NPCEvolutionEngine] NPC\u81EA\u4E3B\u8FDB\u5316\u5F15\u64CE\u521D\u59CB\u5316\u5B8C\u6210");
      return { success: true };
    }
    /**
     * 保存状态到gameState
     */
    saveToState() {
      const state = {
        entries: Array.from(this.registry.entries.entries()),
        dialogueLibrary: Array.from(this.registry.dialogueLibrary.entries()),
        stats: Array.from(this.registry.interactionStats.entries())
      };
      return state;
    }
    /**
     * 从状态恢复
     */
    restoreFromState(state) {
      if (state.entries) {
        this.registry.entries = new Map(state.entries);
      }
      if (state.dialogueLibrary) {
        this.registry.dialogueLibrary = new Map(state.dialogueLibrary.map(([k, v]) => {
          const mappedDialogues = v.map((d) => {
            const entry = new DialogueEntry(d.npcId, d.text, d.category, d.metadata);
            return Object.assign(entry, d);
          });
          return [k, mappedDialogues];
        }));
      }
      if (state.stats) {
        this.registry.interactionStats = new Map(state.stats);
      }
    }
    // ===== MCP工具实现 =====
    /**
     * MCP: npc.evolution.register
     * 注册NPC到学习系统
     */
    mcpRegister(params = {}) {
      const { npcId, role, dialogueBase } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      let actualRole = role;
      if (!actualRole) {
        const lowerNpcId = npcId.toLowerCase();
        if (NPC_ROLE_REGISTRY[lowerNpcId]) {
          actualRole = lowerNpcId;
        } else {
          for (const registryRole2 of Object.keys(NPC_ROLE_REGISTRY)) {
            if (lowerNpcId.startsWith(registryRole2) || lowerNpcId.includes(registryRole2)) {
              actualRole = registryRole2;
              break;
            }
          }
        }
      }
      const registryRole = actualRole ? NPC_ROLE_REGISTRY[actualRole] : null;
      const initialData = {};
      if (dialogueBase) {
        initialData.dialogueBase = dialogueBase;
      }
      const result = this.registry.register(npcId, registryRole ? actualRole : "unknown", initialData);
      return {
        tool: "npc.evolution.register",
        ...result
      };
    }
    /**
     * MCP: npc.evolution.record
     * 记录NPC与玩家交互
     */
    mcpRecord(params = {}) {
      const { npcId, type, playerAction, npcResponse, outcome } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      if (!type) {
        return { success: false, reason: "Missing type parameter" };
      }
      const result = this.registry.recordInteraction(
        npcId,
        type,
        playerAction || "",
        npcResponse || "",
        outcome || {}
      );
      return {
        tool: "npc.evolution.record",
        ...result
      };
    }
    /**
     * MCP: npc.evolution.get
     * 获取NPC当前学习状态
     */
    mcpGet(params = {}) {
      const { npcId } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      const status = this.registry.getLearningStatus(npcId);
      return {
        tool: "npc.evolution.get",
        ...status
      };
    }
    /**
     * MCP: npc.dialogue.add
     * 为NPC添加扩展对话
     */
    mcpAddDialogue(params = {}) {
      const { npcId, text, category, metadata } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      if (!text) {
        return { success: false, reason: "Missing text parameter" };
      }
      const result = this.dialogueSystem.addDialogue(npcId, text, category || "extended", metadata || {});
      return {
        tool: "npc.dialogue.add",
        ...result
      };
    }
    /**
     * MCP: npc.dialogue.list
     * 查看NPC的对话库
     */
    mcpListDialogues(params = {}) {
      const { npcId, filter } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      const entry = this.registry.getEntry(npcId);
      if (!entry) {
        return { success: false, reason: "NPC not registered" };
      }
      const result = this.dialogueSystem.listDialogues(npcId, filter || {});
      return {
        tool: "npc.dialogue.list",
        ...result
      };
    }
    /**
     * MCP: npc.evolution.trigger
     * 手动触发NPC行为进化评估
     */
    mcpTriggerEvolution(params = {}) {
      const { npcId } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      const result = this.evolutionEngine.triggerEvolution(npcId);
      return {
        tool: "npc.evolution.trigger",
        ...result
      };
    }
    /**
     * 获取引擎状态摘要
     */
    getStatus() {
      return {
        initialized: this.initialized,
        registeredNPCs: this.registry.entries.size,
        evolutionEngine: {
          evolutionRules: this.evolutionEngine.evolutionRules.dimensions
        }
      };
    }
  };
  var npcEvolutionEngine = new NPCEvolutionEngine();

  // src/main.js
  init_RealmEventBus();
  var gameState2 = null;
  var isGameInitialized = false;
  var gameLoopTimer = null;
  var lastUpdateTime = Date.now();
  var isGameRunning = false;
  var domainModules = {};
  var GAME_LOOP_CONFIG = {
    tickInterval: 1e3,
    // 主循环间隔 (ms)
    autoSaveInterval: 6e4,
    // 自动保存间隔 (ms)
    uiUpdateInterval: 100,
    // UI更新间隔 (ms)
    saveDebounceTime: 5e3
    // 保存防抖时间 (ms)
  };
  function createInitialGameState() {
    return {
      // 玩家基础信息
      player: {
        name: "\u4FEE\u58EB",
        level: 1,
        experience: 0,
        spiritStones: 100,
        qi: 0,
        reputation: 0,
        karmaPoints: 0,
        titles: [],
        achievements: [],
        badges: []
      },
      // 修为系统
      realm: 0,
      // 0-5: 炼气、筑基、金丹、元婴、化神、飞升
      stage: 0,
      // 0-2: 初期、中期、后期
      cultivationProgress: 0,
      cultivationXP: 0,
      // 灵根系统
      spiritRoot: {
        type: "wood",
        tier: 1,
        attributes: {
          wood: 10,
          fire: 0,
          earth: 0,
          metal: 0,
          water: 0
        }
      },
      // 天劫系统
      tribulation: {
        inProgress: false,
        targetRealm: null,
        lightningCount: 0,
        progress: 0
      },
      // 祝福系统
      blessings: [],
      activeEffects: [],
      // 背包系统
      inventory: {
        items: [],
        equipment: {},
        maxSlots: 50,
        expandedSlots: 0
      },
      // 宗门系统
      sect: null,
      disciples: [],
      // 宠物系统
      pets: [],
      activePet: null,
      maxPets: 5,
      // 战斗系统
      combat: {
        inCombat: false,
        currentOpponent: null,
        combatLog: [],
        energy: 100,
        maxEnergy: 100
      },
      // 排行榜系统
      ranking: {
        rating: 1e3,
        rank: "\u9752\u94DC",
        wins: 0,
        losses: 0,
        arenaHistory: []
      },
      // 成就系统
      achievementState: {
        completedAchievements: [],
        progress: {},
        totalPoints: 0
      },
      badgeState: {
        equippedBadges: [],
        unlockedBadges: []
      },
      // 奇遇系统
      serendipity: {
        triggeredEvents: [],
        dagStatus: null,
        karmaHistory: []
      },
      // 签到系统
      signin: {
        lastSigninDate: null,
        consecutiveDays: 0,
        totalSignins: 0,
        rewardsClaimed: []
      },
      // 投资系统
      investment: {
        monthCard: null,
        investments: [],
        dailyReturns: []
      },
      // 邮件系统
      mail: {
        unreadCount: 0,
        letters: []
      },
      // 离线系统
      idleTasks: [],
      offlineEfficiency: OFFLINE_CONFIG.offlineEfficiency,
      lastActiveTime: Date.now(),
      offlineEarnings: 0,
      // 游戏进度
      days: 1,
      totalPlayTime: 0,
      gameVersion: "V210",
      // 设置
      settings: {
        soundEnabled: true,
        notificationsEnabled: true,
        autoSaveEnabled: true
      },
      // 元数据
      meta: {
        createdAt: Date.now(),
        lastSavedAt: null,
        lastLoadedAt: null,
        saveSlots: {}
      }
    };
  }
  function initializeDomainModules() {
    console.log("[Main] \u521D\u59CB\u5316\u9886\u57DF\u6A21\u5757...");
    domainModules.player = createPlayerModule(() => gameState2);
    domainModules.cultivation = createCultivationModule(() => gameState2);
    domainModules.inventory = InventoryModule_default;
    domainModules.inventory.initInventory(gameState2);
    domainModules.pet = PetModule_default;
    domainModules.achievement = createAchievementModule();
    domainModules.combat = CombatModule_default;
    domainModules.sect = SectModule_default;
    domainModules.ranking = { createRankingService, createArenaService };
    domainModules.signin = { createSigninService, createWelfareService };
    domainModules.reincarnation = reincarnationService;
    reincarnationService.init(gameState2);
    domainModules.talentTree = new TalentTreeService(gameState2);
    npcEvolutionEngine.init(gameState2);
    console.log("[Main] \u9886\u57DF\u6A21\u5757\u521D\u59CB\u5316\u5B8C\u6210");
  }
  function getDomainModule(name) {
    return domainModules[name];
  }
  var MCPRegistry = class {
    constructor() {
      this.tools = /* @__PURE__ */ new Map();
      this.handlers = /* @__PURE__ */ new Map();
    }
    /**
     * 注册 MCP 工具
     */
    registerTool(toolName, toolDefinition, handler) {
      this.tools.set(toolName, toolDefinition);
      this.handlers.set(toolName, handler);
      console.log(`[MCP] \u6CE8\u518C\u5DE5\u5177: ${toolName}`);
    }
    /**
     * 注册多个工具
     */
    registerTools(tools) {
      for (const [name, def] of Object.entries(tools)) {
        this.registerTool(name, def, null);
      }
    }
    /**
     * 执行工具
     */
    async executeTool(toolName, params) {
      const handler = this.handlers.get(toolName);
      if (!handler) {
        return { error: `Unknown tool: ${toolName}` };
      }
      try {
        return await handler(params);
      } catch (e) {
        console.error(`[MCP] Tool execution error: ${toolName}`, e);
        return { error: e.message };
      }
    }
    /**
     * 获取所有工具
     */
    getAllTools() {
      return Object.fromEntries(this.tools);
    }
    /**
     * 获取工具定义
     */
    getTool(toolName) {
      return this.tools.get(toolName);
    }
  };
  var mcpRegistry = new MCPRegistry();
  function registerMCPTools() {
    console.log("[MCP] \u6CE8\u518C MCP \u5DE5\u5177...");
    const coreTools = {
      "gameState.query": {
        name: "gameState.query",
        description: "Query current game state",
        inputSchema: {
          type: "object",
          properties: {
            field: { type: "string", description: "Field to query" }
          }
        }
      },
      "player.info": {
        name: "player.info",
        description: "Get player information",
        inputSchema: { type: "object", properties: {} }
      },
      "cultivation.advance": {
        name: "cultivation.advance",
        description: "Advance cultivation",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["meditate", "breakthrough", "tribulation"] }
          }
        }
      }
    };
    mcpRegistry.registerTools(coreTools);
    registerDomainMCPTools();
    console.log(`[MCP] \u5DF2\u6CE8\u518C ${mcpRegistry.tools.size} \u4E2A\u5DE5\u5177`);
  }
  function registerDomainMCPTools() {
    mcpRegistry.registerTool("cultivation.meditate", {
      name: "cultivation.meditate",
      description: "Meditate to gain qi",
      inputSchema: { type: "object", properties: { amount: { type: "number" } } }
    }, (params) => {
      const amount = (params == null ? void 0 : params.amount) || 10;
      return domainModules.cultivation.meditate(amount);
    });
    mcpRegistry.registerTool("cultivation.breakthrough", {
      name: "cultivation.breakthrough",
      description: "Attempt realm breakthrough",
      inputSchema: { type: "object", properties: {} }
    }, () => domainModules.cultivation.breakthrough());
    mcpRegistry.registerTool("inventory.addItem", {
      name: "inventory.addItem",
      description: "Add item to inventory",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string" },
          name: { type: "string" },
          quantity: { type: "number" },
          quality: { type: "string" }
        }
      }
    }, (params) => {
      const { type, name, quantity, quality } = params;
      return domainModules.inventory.addItemToInventory(gameState2, type, name, quantity, quality);
    });
    mcpRegistry.registerTool("inventory.useItem", {
      name: "inventory.useItem",
      description: "Use an item",
      inputSchema: { type: "object", properties: { name: { type: "string" } } }
    }, (params) => domainModules.inventory.useItem(gameState2, params == null ? void 0 : params.name));
    mcpRegistry.registerTool("pet.list", {
      name: "pet.list",
      description: "List all pets",
      inputSchema: { type: "object", properties: {} }
    }, () => {
      var _a, _b;
      return ((_b = (_a = domainModules.pet) == null ? void 0 : _a.getPets) == null ? void 0 : _b.call(_a)) || { pets: gameState2.pets };
    });
    mcpRegistry.registerTool("achievement.list", {
      name: "achievement.list",
      description: "List achievements",
      inputSchema: { type: "object", properties: {} }
    }, () => {
      var _a;
      return { achievements: ((_a = gameState2.achievementState) == null ? void 0 : _a.completedAchievements) || [] };
    });
    mcpRegistry.registerTool("reincarnation.crystal.create", {
      name: "reincarnation.crystal.create",
      description: "Create a remembrance crystal from current insights",
      inputSchema: {
        type: "object",
        properties: {
          quality: { type: "string", description: "Crystal quality (\u51E1\u54C1/\u826F\u54C1/\u73CD\u54C1/\u4E0A\u54C1/\u6781\u54C1)" },
          source: { type: "string", description: "Source type (breakthrough/alchemy/serendipity/meditation/combat)" }
        }
      }
    }, (params) => reincarnationService.mcpCrystalCreate(params || {}, gameState2));
    mcpRegistry.registerTool("reincarnation.crystal.list", {
      name: "reincarnation.crystal.list",
      description: "List all remembrance crystals",
      inputSchema: { type: "object", properties: {} }
    }, () => reincarnationService.mcpCrystalList());
    mcpRegistry.registerTool("reincarnation.crystal.apply", {
      name: "reincarnation.crystal.apply",
      description: "Apply a crystal to restore attributes after reincarnation",
      inputSchema: {
        type: "object",
        properties: {
          crystalId: { type: "string", description: "ID of the crystal to apply" }
        },
        required: ["crystalId"]
      }
    }, (params) => reincarnationService.mcpCrystalApply(params || {}, gameState2));
    mcpRegistry.registerTool("reincarnation.insight.awaken", {
      name: "reincarnation.insight.awaken",
      description: "Trigger an insight awakening event",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "Insight type" },
          desc: { type: "string", description: "Insight description" }
        }
      }
    }, (params) => reincarnationService.mcpInsightAwaken(params || {}, gameState2));
    mcpRegistry.registerTool("reincarnation.insight.list", {
      name: "reincarnation.insight.list",
      description: "List all cultivation insights",
      inputSchema: { type: "object", properties: {} }
    }, () => reincarnationService.mcpInsightList());
    mcpRegistry.registerTool("reincarnation.cycle.status", {
      name: "reincarnation.cycle.status",
      description: "Get reincarnation cycle status and memory layer info",
      inputSchema: { type: "object", properties: {} }
    }, () => reincarnationService.mcpCycleStatus(gameState2));
    const talentTreeHandlers = createTalentTreeMCPHandlers(gameState2);
    mcpRegistry.registerTool("spirit.talent.allocate", {
      name: "spirit.talent.allocate",
      description: "Allocate talent points to a branch layer",
      inputSchema: {
        type: "object",
        properties: {
          branch: { type: "string", enum: ["attack", "defense", "cultivation", "perception"] },
          layer: { type: "number", minimum: 1, maximum: 5 }
        },
        required: ["branch", "layer"]
      }
    }, (params) => talentTreeHandlers["spirit.talent.allocate"](params));
    mcpRegistry.registerTool("spirit.talent.reset", {
      name: "spirit.talent.reset",
      description: "Reset talent tree (requires \u6D17\u9AD3\u4E39)",
      inputSchema: {
        type: "object",
        properties: {
          hasItem: { type: "boolean", description: "Whether player has \u6D17\u9AD3\u4E39" }
        }
      }
    }, (params) => talentTreeHandlers["spirit.talent.reset"](params));
    mcpRegistry.registerTool("spirit.talent.query", {
      name: "spirit.talent.query",
      description: "Query talent tree status",
      inputSchema: { type: "object", properties: {} }
    }, () => talentTreeHandlers["spirit.talent.query"]());
    mcpRegistry.registerTool("spirit.mastery.query", {
      name: "spirit.mastery.query",
      description: "Query elemental mastery",
      inputSchema: {
        type: "object",
        properties: {
          element: { type: "string", enum: ["metal", "wood", "water", "fire", "earth", "thunder"] }
        }
      }
    }, (params) => talentTreeHandlers["spirit.mastery.query"](params));
    mcpRegistry.registerTool("spirit.mastery.upgrade", {
      name: "spirit.mastery.upgrade",
      description: "Upgrade elemental mastery level",
      inputSchema: {
        type: "object",
        properties: {
          element: { type: "string", enum: ["metal", "wood", "water", "fire", "earth", "thunder"] },
          required: ["element"]
        }
      }
    }, (params) => talentTreeHandlers["spirit.mastery.upgrade"](params));
    mcpRegistry.registerTool("spirit.hook.register", {
      name: "spirit.hook.register",
      description: "Register a spirit root change hook",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "Hook type" },
          callback: { type: "function", description: "Callback function" }
        },
        required: ["type"]
      }
    }, (params) => talentTreeHandlers["spirit.hook.register"](params));
    mcpRegistry.registerTool("npc.evolution.register", {
      name: "npc.evolution.register",
      description: "Register NPC to learning system",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "Unique NPC identifier" },
          role: { type: "string", description: "NPC role (master/monster/merchant/fellow)" },
          dialogueBase: { type: "array", description: "Base dialogue entries" }
        },
        required: ["npcId"]
      }
    }, (params) => npcEvolutionEngine.mcpRegister(params || {}));
    mcpRegistry.registerTool("npc.evolution.record", {
      name: "npc.evolution.record",
      description: "Record NPC-player interaction",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" },
          type: { type: "string", description: "Interaction type (trade/task/chat/combat/social)" },
          playerAction: { type: "string", description: "Player action description" },
          npcResponse: { type: "string", description: "NPC response description" },
          outcome: { type: "object", description: "Interaction outcome" }
        },
        required: ["npcId", "type"]
      }
    }, (params) => npcEvolutionEngine.mcpRecord(params || {}));
    mcpRegistry.registerTool("npc.evolution.get", {
      name: "npc.evolution.get",
      description: "Get NPC current learning status",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" }
        },
        required: ["npcId"]
      }
    }, (params) => npcEvolutionEngine.mcpGet(params || {}));
    mcpRegistry.registerTool("npc.dialogue.add", {
      name: "npc.dialogue.add",
      description: "Add extended dialogue for NPC",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" },
          text: { type: "string", description: "Dialogue text" },
          category: { type: "string", description: "Dialogue category (base/extended/adaptive)" },
          metadata: { type: "object", description: "Additional metadata" }
        },
        required: ["npcId", "text"]
      }
    }, (params) => npcEvolutionEngine.mcpAddDialogue(params || {}));
    mcpRegistry.registerTool("npc.dialogue.list", {
      name: "npc.dialogue.list",
      description: "View NPC dialogue library",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" },
          filter: { type: "object", description: "Filter options" }
        },
        required: ["npcId"]
      }
    }, (params) => npcEvolutionEngine.mcpListDialogues(params || {}));
    mcpRegistry.registerTool("npc.evolution.trigger", {
      name: "npc.evolution.trigger",
      description: "Manually trigger NPC behavior evolution evaluation",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" }
        },
        required: ["npcId"]
      }
    }, (params) => npcEvolutionEngine.mcpTriggerEvolution(params || {}));
    mcpRegistry.registerTool("event.bus.publish", {
      name: "event.bus.publish",
      description: "Publish an event to the realm event bus",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "Event type" },
          data: { type: "object", description: "Event data payload" },
          source: { type: "string", description: "Event source" },
          target: { type: "string", description: "Event target" },
          priority: { type: "string", enum: ["high", "medium", "low"] }
        },
        required: ["type"]
      }
    }, (params) => {
      const { mcpPublish: mcpPublish2 } = (init_RealmEventBus(), __toCommonJS(RealmEventBus_exports));
      return mcpPublish2(params);
    });
    mcpRegistry.registerTool("event.bus.subscribe", {
      name: "event.bus.subscribe",
      description: "Subscribe to events matching a pattern",
      inputSchema: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Event pattern (glob supported)" },
          subscriberId: { type: "string", description: "Subscriber ID" },
          priority: { type: "string", enum: ["high", "medium", "low"] }
        },
        required: ["pattern"]
      }
    }, (params) => {
      const { mcpSubscribe: mcpSubscribe2 } = (init_RealmEventBus(), __toCommonJS(RealmEventBus_exports));
      return mcpSubscribe2(params);
    });
    mcpRegistry.registerTool("event.bus.unsubscribe", {
      name: "event.bus.unsubscribe",
      description: "Unsubscribe from an event",
      inputSchema: {
        type: "object",
        properties: {
          subscriberId: { type: "string", description: "Subscriber ID to remove" }
        },
        required: ["subscriberId"]
      }
    }, (params) => {
      const { mcpUnsubscribe: mcpUnsubscribe2 } = (init_RealmEventBus(), __toCommonJS(RealmEventBus_exports));
      return mcpUnsubscribe2(params);
    });
    mcpRegistry.registerTool("event.bus.history", {
      name: "event.bus.history",
      description: "View event history",
      inputSchema: {
        type: "object",
        properties: {
          eventType: { type: "string", description: "Filter by event type" },
          source: { type: "string", description: "Filter by source" },
          since: { type: "number", description: "Filter events since timestamp" },
          limit: { type: "number", description: "Max events to return" }
        }
      }
    }, (params) => {
      const { mcpHistory: mcpHistory2 } = (init_RealmEventBus(), __toCommonJS(RealmEventBus_exports));
      return mcpHistory2(params);
    });
    mcpRegistry.registerTool("event.cascade.trigger", {
      name: "event.cascade.trigger",
      description: "Manually trigger a cascade of events",
      inputSchema: {
        type: "object",
        properties: {
          initialEvent: {
            type: "object",
            properties: {
              type: { type: "string" },
              data: { type: "object" },
              source: { type: "string" }
            },
            required: ["type"]
          },
          followUpEvents: { type: "array" },
          maxDepth: { type: "number" }
        },
        required: ["initialEvent"]
      }
    }, (params) => {
      const { mcpCascadeTrigger: mcpCascadeTrigger2 } = (init_RealmEventBus(), __toCommonJS(RealmEventBus_exports));
      return mcpCascadeTrigger2(params);
    });
    mcpRegistry.registerTool("event.subscriber.list", {
      name: "event.subscriber.list",
      description: "List all event subscribers",
      inputSchema: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Filter by pattern" },
          subscriberId: { type: "string", description: "Filter by subscriber ID" }
        }
      }
    }, (params) => {
      const { mcpSubscriberList: mcpSubscriberList2 } = (init_RealmEventBus(), __toCommonJS(RealmEventBus_exports));
      return mcpSubscriberList2(params);
    });
  }
  function doSaveGameWithFeedback() {
    const result = doSaveGame();
    if (result.success) {
      addLog2("good", "\u{1F4BE} \u5B58\u6863\u6210\u529F", `\u6E38\u620F\u5DF2\u4FDD\u5B58 (${(result.size / 1024).toFixed(1)}KB)`);
    } else {
      addLog2("bad", "\u{1F4BE} \u5B58\u6863\u5931\u8D25", result.error);
    }
    return result;
  }
  function doLoadGameWithFeedback() {
    const result = doLoadGame();
    if (result.success) {
      gameState2 = result.data;
      isGameInitialized = true;
      addLog2("good", "\u{1F4C2} \u8BFB\u6863\u6210\u529F", "\u6E38\u620F\u5DF2\u4ECE\u5B58\u6863\u6062\u590D");
      updateDisplay2();
    } else {
      addLog2("bad", "\u{1F4C2} \u8BFB\u6863\u5931\u8D25", result.error);
    }
    return result;
  }
  function doResetGame() {
    if (confirm("\u786E\u5B9A\u8981\u91CD\u7F6E\u6E38\u620F\u5417\uFF1F\u6240\u6709\u8FDB\u5EA6\u5C06\u4E22\u5931\uFF01")) {
      localStorage.removeItem("cultivationSave");
      localStorage.removeItem("cultivation_sim_autosave");
      localStorage.removeItem("cultivation_save_history");
      startNewGame();
      addLog2("warn", "\u26A0\uFE0F \u6E38\u620F\u91CD\u7F6E", "\u6240\u6709\u6570\u636E\u5DF2\u6E05\u9664");
    }
  }
  function autoSave() {
    var _a;
    if (((_a = gameState2 == null ? void 0 : gameState2.settings) == null ? void 0 : _a.autoSaveEnabled) !== false) {
      saveGame2();
    }
  }
  function initializeOfflineManager() {
    console.log("[Main] \u79BB\u7EBF\u7BA1\u7406\u5668\u521D\u59CB\u5316\u5B8C\u6210");
  }
  function processOfflineEarnings() {
    if (!isGameInitialized) return;
    const snapshot = powerSync.captureSnapshot(gameState2);
    const result = powerSync.restoreFromSnapshot(snapshot, gameState2);
    if (result.offlineEarnings > 0) {
      console.log(`[Offline] \u79BB\u7EBF\u6536\u76CA: ${result.offlineEarnings} \u7075\u77F3 (${result.offlineHours.toFixed(1)}\u5C0F\u65F6)`);
    }
  }
  var gameLogs = [];
  function addLog2(type, title, message) {
    const entry = {
      id: Date.now() + Math.random(),
      type,
      // 'good' | 'bad' | 'info' | 'warn'
      title,
      message,
      timestamp: Date.now()
    };
    gameLogs.unshift(entry);
    if (gameLogs.length > 100) {
      gameLogs = gameLogs.slice(0, 100);
    }
    const color = type === "good" ? "#4CAF50" : type === "bad" ? "#F44336" : type === "warn" ? "#FF9800" : "#2196F3";
    console.log(`%c[${title}] ${message}`, `color:${color}`);
    return entry;
  }
  function getLogs(limit = 50) {
    return gameLogs.slice(0, limit);
  }
  function clearLogs() {
    gameLogs = [];
  }
  function gameLoop() {
    if (!isGameRunning) return;
    const now = Date.now();
    const deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;
    if (gameState2) {
      gameState2.totalPlayTime += deltaTime;
    }
    updateDomainModules(deltaTime);
    if (deltaTime > 6e4) {
      processOfflineEarnings();
    }
    updateDisplayIfNeeded();
  }
  function updateDomainModules(deltaTime) {
    var _a;
    if (((_a = gameState2 == null ? void 0 : gameState2.player) == null ? void 0 : _a.qi) !== void 0) {
      const qiRegenRate = 1 + (gameState2.realm || 0) * 0.5;
      gameState2.player.qi = Math.min(
        gameState2.player.qi + qiRegenRate * (deltaTime / 1e3),
        getMaxQi()
      );
    }
  }
  function getMaxQi() {
    const baseMax = 100;
    const realmBonus = ((gameState2 == null ? void 0 : gameState2.realm) || 0) * 50;
    return baseMax + realmBonus;
  }
  var lastUIUpdate = 0;
  function updateDisplayIfNeeded() {
    const now = Date.now();
    if (now - lastUIUpdate > GAME_LOOP_CONFIG.uiUpdateInterval) {
      lastUIUpdate = now;
    }
  }
  var eventQueue = [];
  function scheduleEvent(eventName, callback, delay = 0) {
    const event2 = {
      id: Date.now() + Math.random(),
      eventName,
      callback,
      executeAt: Date.now() + delay,
      delay
    };
    eventQueue.push(event2);
    return event2.id;
  }
  function processEventQueue() {
    const now = Date.now();
    const dueEvents = eventQueue.filter((e) => e.executeAt <= now);
    for (const event2 of dueEvents) {
      try {
        event2.callback();
      } catch (e) {
        console.error(`[Event] Event ${event2.eventName} error:`, e);
      }
    }
    eventQueue.splice(0, dueEvents.length);
  }
  function clearEvents(eventName) {
    const index = eventQueue.findIndex((e) => e.eventName === eventName);
    if (index !== -1) {
      eventQueue.splice(index, 1);
    }
  }
  async function init() {
    console.log("[Main] \u6E38\u620F\u521D\u59CB\u5316\u4E2D...");
    gameState2 = createInitialGameState();
    initializeDomainModules();
    initializeOfflineManager();
    registerMCPTools();
    const savedGame = localStorage.getItem("cultivationSave");
    if (savedGame) {
      try {
        gameState2 = JSON.parse(savedGame);
        addLog2("info", "\u{1F4C2} \u5B58\u6863\u52A0\u8F7D", "\u68C0\u6D4B\u5230\u5B58\u6863\uFF0C\u6570\u636E\u5DF2\u6062\u590D");
        processOfflineEarnings();
      } catch (e) {
        console.error("[Main] \u5B58\u6863\u89E3\u6790\u5931\u8D25:", e);
        addLog2("warn", "\u26A0\uFE0F \u5B58\u6863\u635F\u574F", "\u4F7F\u7528\u65B0\u6E38\u620F");
      }
    }
    isGameInitialized = true;
    startGameLoop();
    console.log("[Main] \u6E38\u620F\u521D\u59CB\u5316\u5B8C\u6210");
    addLog2("good", "\u{1F3AE} \u6E38\u620F\u5C31\u7EEA", "\u6B22\u8FCE\u6765\u5230\u4FEE\u4ED9\u4E16\u754C");
    return gameState2;
  }
  function startNewGame() {
    console.log("[Main] \u5F00\u59CB\u65B0\u6E38\u620F...");
    gameState2 = createInitialGameState();
    gameLogs = [];
    initializeDomainModules();
    isGameInitialized = true;
    autoSave();
    addLog2("good", "\u{1F195} \u65B0\u6E38\u620F", "\u7B2C1\u5929 | \u70BC\u6C14\u671F\u521D\u671F");
    updateDisplay2();
    return gameState2;
  }
  function startGameLoop() {
    if (gameLoopTimer) {
      clearInterval(gameLoopTimer);
    }
    isGameRunning = true;
    lastUpdateTime = Date.now();
    gameLoopTimer = setInterval(gameLoop, GAME_LOOP_CONFIG.tickInterval);
    console.log(`[Main] \u6E38\u620F\u5FAA\u73AF\u542F\u52A8 (\u95F4\u9694: ${GAME_LOOP_CONFIG.tickInterval}ms)`);
  }
  function stopGameLoop() {
    isGameRunning = false;
    if (gameLoopTimer) {
      clearInterval(gameLoopTimer);
      gameLoopTimer = null;
    }
    console.log("[Main] \u6E38\u620F\u5FAA\u73AF\u5DF2\u505C\u6B62");
  }
  function updateDisplay2() {
    if (!gameState2) return;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gameStateUpdated", { detail: gameState2 }));
    }
    lastUIUpdate = Date.now();
  }
  function getGameState() {
    return gameState2;
  }
  function setGameStateField(path, value) {
    const keys = path.split(".");
    let current = gameState2;
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] === void 0) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
  function getGameStateField(path) {
    const keys = path.split(".");
    let current = gameState2;
    for (const key of keys) {
      if (current === void 0) return void 0;
      current = current[key];
    }
    return current;
  }
  function getPlayerInfo() {
    var _a, _b, _c, _d;
    if (!gameState2) return null;
    return {
      name: (_a = gameState2.player) == null ? void 0 : _a.name,
      level: (_b = gameState2.player) == null ? void 0 : _b.level,
      realm: gameState2.realm,
      stage: gameState2.stage,
      spiritStones: (_c = gameState2.player) == null ? void 0 : _c.spiritStones,
      qi: (_d = gameState2.player) == null ? void 0 : _d.qi
    };
  }
  function getRealmInfo() {
    if (!gameState2) return null;
    const realms = ["\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347"];
    const stages = ["\u521D\u671F", "\u4E2D\u671F", "\u540E\u671F"];
    return {
      realm: gameState2.realm,
      realmName: realms[gameState2.realm] || "\u672A\u77E5",
      stage: gameState2.stage,
      stageName: stages[gameState2.stage] || "\u672A\u77E5",
      cultivationProgress: gameState2.cultivationProgress
    };
  }
  function advanceDay(days = 1) {
    if (!gameState2) return;
    gameState2.days += days;
    addLog2("info", "\u{1F4C5} \u65F6\u95F4\u63A8\u8FDB", `\u7B2C ${gameState2.days} \u5929`);
    updateDisplay2();
  }
  function saveAndExit() {
    autoSave();
    stopGameLoop();
    addLog2("info", "\u{1F44B} \u6E38\u620F\u5DF2\u4FDD\u5B58", "\u4E0B\u6B21\u89C1\uFF0C\u4FEE\u4ED9\u8005\uFF01");
  }
  function getGameStats() {
    var _a, _b, _c;
    if (!gameState2) return null;
    return {
      days: gameState2.days,
      totalPlayTime: gameState2.totalPlayTime,
      realm: getRealmInfo(),
      achievements: ((_b = (_a = gameState2.achievementState) == null ? void 0 : _a.completedAchievements) == null ? void 0 : _b.length) || 0,
      pets: ((_c = gameState2.pets) == null ? void 0 : _c.length) || 0,
      sect: gameState2.sect ? "\u5DF2\u52A0\u5165\u5B97\u95E8" : "\u65E0"
    };
  }
  if (typeof window !== "undefined") {
    window.init = init;
    window.startNewGame = startNewGame;
    window.getGameState = getGameState;
    window.setGameStateField = setGameStateField;
    window.getGameStateField = getGameStateField;
    window.updateDisplay = updateDisplay2;
    window.saveGame = saveGame2;
    window.doSaveGame = doSaveGameWithFeedback;
    window.loadGame = loadGame;
    window.doLoadGame = doLoadGameWithFeedback;
    window.doResetGame = doResetGame;
    window.showSaveLoadModal = showSaveLoadModal;
    window.addLog = addLog2;
    window.getLogs = getLogs;
    window.clearLogs = clearLogs;
    window.mcpRegistry = mcpRegistry;
    window.getPlayerInfo = getPlayerInfo;
    window.getRealmInfo = getRealmInfo;
    window.advanceDay = advanceDay;
    window.getGameStats = getGameStats;
    window.gameState = gameState2;
    window.saveAndExit = saveAndExit;
  }
  console.log("[Main] main.js \u6A21\u5757\u52A0\u8F7D\u5B8C\u6210");
  return __toCommonJS(main_exports);
})();

;window.__GAME_VERSION__="DDD-v1.0.0-9dffcad-2026-05-30T15-17-09-916Z";
