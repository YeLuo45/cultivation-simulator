/* Cultivation Simulator DDD-v1.0.0-2b7b4ff-2026-06-06T13-07-55-693Z */
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

  // src/systems/event/EventAnalyticsService.js
  var EventAnalyticsService_exports = {};
  __export(EventAnalyticsService_exports, {
    ANALYTICS_CONFIG: () => ANALYTICS_CONFIG,
    EVENT_ANALYTICS_TOOLS: () => EVENT_ANALYTICS_TOOLS,
    EVENT_TYPE_CATEGORIES: () => EVENT_TYPE_CATEGORIES,
    EventAnalyticsService: () => EventAnalyticsService,
    EventIndex: () => EventIndex,
    default: () => EventAnalyticsService_default,
    eventAnalyticsService: () => eventAnalyticsService,
    mcpAnalyticsAnomaly: () => mcpAnalyticsAnomaly,
    mcpAnalyticsForecast: () => mcpAnalyticsForecast,
    mcpAnalyticsPattern: () => mcpAnalyticsPattern,
    mcpAnalyticsStats: () => mcpAnalyticsStats,
    mcpAnalyticsTrend: () => mcpAnalyticsTrend,
    mcpHistoryQuery: () => mcpHistoryQuery
  });
  function mcpAnalyticsStats(params = {}) {
    const { eventType, source, timeRange } = params;
    try {
      const stats = eventAnalyticsService.getStats({ eventType, source, timeRange });
      return {
        success: true,
        ...stats
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  function mcpAnalyticsTrend(params = {}) {
    const { windowSize, eventType, granularity } = params;
    try {
      const trend = eventAnalyticsService.getTrend({ windowSize, eventType, granularity });
      return {
        success: true,
        ...trend
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  function mcpAnalyticsPattern(params = {}) {
    const { sequenceLength, minOccurrences, eventType } = params;
    try {
      const pattern = eventAnalyticsService.detectPattern({
        sequenceLength: sequenceLength || 5,
        minOccurrences: minOccurrences || 2,
        eventType
      });
      return {
        success: true,
        ...pattern
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  function mcpAnalyticsAnomaly(params = {}) {
    const { threshold, windowSize, source } = params;
    try {
      const anomaly = eventAnalyticsService.detectAnomaly({
        threshold: threshold || ANALYTICS_CONFIG.anomalyThreshold,
        windowSize: windowSize || 50,
        source
      });
      return {
        success: true,
        ...anomaly
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  function mcpHistoryQuery(params = {}) {
    const {
      eventType,
      source,
      since,
      until,
      priority,
      dataFilter,
      limit,
      offset
    } = params;
    try {
      const result = eventAnalyticsService.queryHistory({
        eventType,
        source,
        since,
        until,
        priority,
        dataFilter,
        limit: limit || 100,
        offset: offset || 0
      });
      return result;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  function mcpAnalyticsForecast(params = {}) {
    const { horizonHours, eventType } = params;
    try {
      const forecast = eventAnalyticsService.forecast({
        horizonHours: horizonHours || ANALYTICS_CONFIG.forecastHorizonHours,
        eventType
      });
      return {
        success: true,
        ...forecast
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  var ANALYTICS_CONFIG, EVENT_TYPE_CATEGORIES, EventIndex, EventAnalyticsService, eventAnalyticsService, EVENT_ANALYTICS_TOOLS, EventAnalyticsService_default;
  var init_EventAnalyticsService = __esm({
    "src/systems/event/EventAnalyticsService.js"() {
      init_RealmEventBus();
      ANALYTICS_CONFIG = {
        maxHistoryLength: 1e3,
        maxIndexedEvents: 2e3,
        trendWindowSize: 100,
        // 趋势分析窗口大小
        anomalyThreshold: 2,
        // 异常检测标准差倍数
        forecastHorizonHours: 24,
        // 预测时间范围
        minSampleSize: 10
        // 最小样本量
      };
      EVENT_TYPE_CATEGORIES = {
        PLAYER: "player",
        NPC: "npc",
        REALM: "realm",
        SECT: "sect",
        TREASURE: "treasure",
        SYSTEM: "system",
        COMBAT: "combat",
        CULTIVATION: "cultivation"
      };
      EventIndex = class {
        constructor() {
          this.byType = /* @__PURE__ */ new Map();
          this.bySource = /* @__PURE__ */ new Map();
          this.byTime = /* @__PURE__ */ new Map();
          this.typeCounts = /* @__PURE__ */ new Map();
          this.sourceCounts = /* @__PURE__ */ new Map();
          this.hourlyCounts = /* @__PURE__ */ new Map();
        }
        /**
         * 索引事件
         */
        index(event2) {
          if (!this.byType.has(event2.type)) {
            this.byType.set(event2.type, []);
          }
          this.byType.get(event2.type).push(event2);
          if (!this.bySource.has(event2.source)) {
            this.bySource.set(event2.source, []);
          }
          this.bySource.get(event2.source).push(event2);
          const timeBucket = Math.floor(event2.timestamp / (5 * 60 * 1e3)) * (5 * 60 * 1e3);
          if (!this.byTime.has(timeBucket)) {
            this.byTime.set(timeBucket, []);
          }
          this.byTime.get(timeBucket).push(event2);
          this.typeCounts.set(event2.type, (this.typeCounts.get(event2.type) || 0) + 1);
          this.sourceCounts.set(event2.source, (this.sourceCounts.get(event2.source) || 0) + 1);
          const hourBucket = Math.floor(event2.timestamp / (60 * 60 * 1e3)) * (60 * 60 * 1e3);
          this.hourlyCounts.set(hourBucket, (this.hourlyCounts.get(hourBucket) || 0) + 1);
        }
        /**
         * 清除索引
         */
        clear() {
          this.byType.clear();
          this.bySource.clear();
          this.byTime.clear();
          this.typeCounts.clear();
          this.sourceCounts.clear();
          this.hourlyCounts.clear();
        }
      };
      EventAnalyticsService = class {
        constructor() {
          this.eventIndex = new EventIndex();
          this.isInitialized = false;
          this.listeners = [];
        }
        /**
         * 初始化服务
         */
        init(gameState3) {
          if (this.isInitialized) {
            return { success: false, error: "Already initialized" };
          }
          this.subscribeToEventBus();
          this.rebuildIndex();
          this.isInitialized = true;
          console.log("[EventAnalyticsService] Initialized successfully");
          return { success: true };
        }
        /**
         * 订阅事件总线
         */
        subscribeToEventBus() {
          this.eventBusSubscription = realmEventBus.subscribe("*", (event2) => {
            this.indexEvent(event2);
          }, {
            subscriberId: "event-analytics",
            priority: "low"
          });
        }
        /**
         * 索引事件
         */
        indexEvent(event2) {
          this.eventIndex.index(event2);
        }
        /**
         * 重建索引
         */
        rebuildIndex() {
          this.eventIndex.clear();
          const history = realmEventBus.history({ limit: ANALYTICS_CONFIG.maxIndexedEvents });
          for (const event2 of history) {
            this.eventIndex.index(event2);
          }
        }
        /**
         * 获取事件统计
         */
        getStats(options = {}) {
          const { eventType = null, source = null, timeRange = null } = options;
          let events = realmEventBus.history({
            eventType,
            source,
            since: (timeRange == null ? void 0 : timeRange.since) || 0,
            limit: ANALYTICS_CONFIG.maxHistoryLength
          });
          const typeStats = {};
          const sourceStats = {};
          const priorityStats = { high: 0, medium: 0, low: 0 };
          let totalEvents = events.length;
          for (const event2 of events) {
            if (!typeStats[event2.type]) {
              typeStats[event2.type] = { count: 0, percentage: 0 };
            }
            typeStats[event2.type].count++;
            if (!sourceStats[event2.source]) {
              sourceStats[event2.source] = { count: 0, percentage: 0 };
            }
            sourceStats[event2.source].count++;
            if (priorityStats[event2.priority] !== void 0) {
              priorityStats[event2.priority]++;
            }
          }
          for (const type in typeStats) {
            typeStats[type].percentage = totalEvents > 0 ? Math.round(typeStats[type].count / totalEvents * 1e4) / 100 : 0;
          }
          for (const src in sourceStats) {
            sourceStats[src].percentage = totalEvents > 0 ? Math.round(sourceStats[src].count / totalEvents * 1e4) / 100 : 0;
          }
          const topTypes = Object.entries(typeStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([type, stats]) => ({ type, count: stats.count, percentage: stats.percentage }));
          const topSources = Object.entries(sourceStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([source2, stats]) => ({ source: source2, count: stats.count, percentage: stats.percentage }));
          return {
            totalEvents,
            typeStats,
            sourceStats,
            priorityStats,
            topTypes,
            topSources,
            timeRange: timeRange ? {
              since: timeRange.since,
              until: timeRange.until || Date.now()
            } : null
          };
        }
        /**
         * 获取事件趋势
         */
        getTrend(options = {}) {
          const {
            windowSize = ANALYTICS_CONFIG.trendWindowSize,
            eventType = null,
            granularity = "hour"
            // 'hour', 'day', 'minute'
          } = options;
          const now = Date.now();
          const intervals = [];
          let intervalMs;
          switch (granularity) {
            case "minute":
              intervalMs = 60 * 1e3;
              break;
            case "day":
              intervalMs = 24 * 60 * 60 * 1e3;
              break;
            case "hour":
            default:
              intervalMs = 60 * 60 * 1e3;
          }
          const numWindows = Math.min(windowSize, 100);
          for (let i = numWindows - 1; i >= 0; i--) {
            const start = Math.floor((now - i * intervalMs) / intervalMs) * intervalMs;
            const end = start + intervalMs;
            intervals.push({ start, end, count: 0, types: {} });
          }
          const history = realmEventBus.history({
            eventType,
            since: intervals[0].start - intervalMs,
            limit: ANALYTICS_CONFIG.maxHistoryLength
          });
          for (const event2 of history) {
            const bucketIndex = intervals.findIndex(
              (i) => event2.timestamp >= i.start && event2.timestamp < i.end
            );
            if (bucketIndex >= 0) {
              intervals[bucketIndex].count++;
              if (!intervals[bucketIndex].types[event2.type]) {
                intervals[bucketIndex].types[event2.type] = 0;
              }
              intervals[bucketIndex].types[event2.type]++;
            }
          }
          const counts = intervals.map((i) => i.count);
          const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length || 0;
          const movingAvg = [];
          for (let i = 0; i < counts.length; i++) {
            const window2 = counts.slice(Math.max(0, i - 4), i + 1);
            movingAvg.push(window2.reduce((a, b) => a + b, 0) / window2.length);
          }
          let trendDirection = "stable";
          if (counts.length >= 3) {
            const recentAvg = (counts[counts.length - 1] + counts[counts.length - 2]) / 2;
            const olderAvg = (counts[0] + counts[1]) / 2;
            const change = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
            if (change > 0.15) {
              trendDirection = "increasing";
            } else if (change < -0.15) {
              trendDirection = "decreasing";
            }
          }
          return {
            granularity,
            windowSize: numWindows,
            intervals,
            averageCount: Math.round(avgCount * 100) / 100,
            movingAverage: movingAvg.map((v) => Math.round(v * 100) / 100),
            trendDirection,
            peakTime: {
              ...intervals.reduce((max, i) => i.count > max.count ? i : max, intervals[0]),
              hour: intervals.reduce((max, i) => i.count > max.count ? i : max, intervals[0]).start
            },
            eventTypeFilter: eventType
          };
        }
        /**
         * 检测事件模式
         */
        detectPattern(options = {}) {
          const {
            sequenceLength = 5,
            minOccurrences = 2,
            eventType = null
          } = options;
          const history = realmEventBus.history({
            eventType,
            limit: ANALYTICS_CONFIG.maxHistoryLength
          });
          const eventSequence = history.map((e) => e.type);
          const patterns = /* @__PURE__ */ new Map();
          for (let len = 2; len <= sequenceLength; len++) {
            for (let i = 0; i <= eventSequence.length - len; i++) {
              const pattern = eventSequence.slice(i, i + len).join("->");
              if (!patterns.has(pattern)) {
                patterns.set(pattern, {
                  sequence: eventSequence.slice(i, i + len),
                  count: 0,
                  positions: []
                });
              }
              patterns.get(pattern).count++;
              patterns.get(pattern).positions.push(i);
            }
          }
          const significantPatterns = [];
          for (const [pattern, data] of patterns) {
            if (data.count >= minOccurrences) {
              significantPatterns.push({
                pattern,
                sequence: data.sequence,
                occurrences: data.count,
                positions: data.positions,
                confidence: Math.min(data.count / 10, 1)
              });
            }
          }
          significantPatterns.sort((a, b) => b.occurrences - a.occurrences);
          return {
            totalPatternsFound: significantPatterns.length,
            patterns: significantPatterns.slice(0, 10),
            sequenceLength,
            minOccurrences,
            eventTypeFilter: eventType
          };
        }
        /**
         * 检测异常事件
         */
        detectAnomaly(options = {}) {
          const {
            threshold = ANALYTICS_CONFIG.anomalyThreshold,
            windowSize = 50,
            source = null
          } = options;
          const history = realmEventBus.history({
            source,
            limit: ANALYTICS_CONFIG.maxHistoryLength
          });
          if (history.length < ANALYTICS_CONFIG.minSampleSize) {
            return {
              success: false,
              error: "Insufficient data for anomaly detection",
              minRequired: ANALYTICS_CONFIG.minSampleSize,
              currentCount: history.length
            };
          }
          const anomalies = [];
          const hourlyStats = [];
          const hourBuckets = /* @__PURE__ */ new Map();
          for (const event2 of history) {
            const hour = Math.floor(event2.timestamp / (60 * 60 * 1e3)) * (60 * 60 * 1e3);
            if (!hourBuckets.has(hour)) {
              hourBuckets.set(hour, { count: 0, types: /* @__PURE__ */ new Set() });
            }
            hourBuckets.get(hour).count++;
            hourBuckets.get(hour).types.add(event2.type);
          }
          const sortedHours = Array.from(hourBuckets.entries()).sort((a, b) => a[0] - b[0]).map(([hour, data]) => ({
            hour,
            count: data.count,
            uniqueTypes: data.types.size
          }));
          const counts = sortedHours.map((h) => h.count);
          const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
          const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
          const stdDev = Math.sqrt(variance);
          for (const hourData of sortedHours) {
            const zScore = stdDev > 0 ? (hourData.count - mean) / stdDev : 0;
            if (Math.abs(zScore) > threshold) {
              anomalies.push({
                hour: hourData.hour,
                count: hourData.count,
                zScore: Math.round(zScore * 100) / 100,
                severity: Math.abs(zScore) > threshold * 2 ? "high" : "medium",
                uniqueTypes: hourData.uniqueTypes
              });
            }
          }
          const typeCounts = /* @__PURE__ */ new Map();
          for (const event2 of history) {
            typeCounts.set(event2.type, (typeCounts.get(event2.type) || 0) + 1);
          }
          const avgTypeFreq = history.length / typeCounts.size;
          const rareTypes = [];
          for (const [type, count] of typeCounts) {
            if (count <= avgTypeFreq * 0.2) {
              rareTypes.push({ type, count, rarity: "rare" });
            }
          }
          return {
            success: true,
            anomalies,
            rareEventTypes: rareTypes,
            statistics: {
              mean: Math.round(mean * 100) / 100,
              stdDev: Math.round(stdDev * 100) / 100,
              threshold,
              totalHoursAnalyzed: sortedHours.length,
              totalEventsAnalyzed: history.length
            }
          };
        }
        /**
         * 查询历史事件
         */
        queryHistory(options = {}) {
          const {
            eventType = null,
            source = null,
            since = null,
            until = null,
            priority = null,
            dataFilter = null,
            limit = 100,
            offset = 0
          } = options;
          let events = realmEventBus.history({
            eventType,
            source,
            since: since || 0,
            limit: ANALYTICS_CONFIG.maxHistoryLength
          });
          if (until) {
            events = events.filter((e) => e.timestamp <= until);
          }
          if (priority) {
            events = events.filter((e) => e.priority === priority);
          }
          if (dataFilter) {
            events = events.filter((e) => {
              if (typeof dataFilter === "object") {
                for (const key in dataFilter) {
                  if (e.data[key] !== dataFilter[key]) {
                    return false;
                  }
                }
              }
              return true;
            });
          }
          events.sort((a, b) => b.timestamp - a.timestamp);
          const totalCount = events.length;
          const paginatedEvents = events.slice(offset, offset + limit);
          return {
            success: true,
            totalCount,
            offset,
            limit,
            hasMore: offset + limit < totalCount,
            events: paginatedEvents.map((e) => ({
              id: e.id,
              type: e.type,
              source: e.source,
              target: e.target,
              timestamp: e.timestamp,
              priority: e.priority,
              cascadeLevel: e.cascadeLevel,
              data: e.data
            }))
          };
        }
        /**
         * 预测未来事件
         */
        forecast(options = {}) {
          const {
            horizonHours = ANALYTICS_CONFIG.forecastHorizonHours,
            eventType = null
          } = options;
          const history = realmEventBus.history({
            eventType,
            limit: ANALYTICS_CONFIG.maxHistoryLength
          });
          if (history.length < ANALYTICS_CONFIG.minSampleSize) {
            return {
              success: false,
              error: "Insufficient data for forecasting",
              minRequired: ANALYTICS_CONFIG.minSampleSize,
              currentCount: history.length
            };
          }
          const hourCounts = /* @__PURE__ */ new Map();
          let totalEvents = 0;
          for (const event2 of history) {
            const hour = Math.floor(event2.timestamp / (60 * 60 * 1e3)) * (60 * 60 * 1e3);
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            totalEvents++;
          }
          const avgEventsPerHour = totalEvents / (history.length > 0 ? history.length / (60 * 60 * 1e3) : 1);
          const sortedHours = Array.from(hourCounts.keys()).sort();
          let periodicity = "none";
          if (sortedHours.length >= 4) {
            const intervals = [];
            for (let i = 1; i < sortedHours.length; i++) {
              intervals.push(sortedHours[i] - sortedHours[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            if (avgInterval > 20 * 60 * 60 * 1e3) {
              periodicity = "daily";
            } else if (avgInterval > 3 * 60 * 60 * 1e3) {
              periodicity = "hourly";
            }
          }
          const typeCounts = /* @__PURE__ */ new Map();
          for (const event2 of history) {
            typeCounts.set(event2.type, (typeCounts.get(event2.type) || 0) + 1);
          }
          const topTypes = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([type, count]) => ({
            type,
            probability: Math.round(count / totalEvents * 1e4) / 100,
            expectedCount: Math.round(count / totalEvents * (horizonHours * avgEventsPerHour))
          }));
          const now = Date.now();
          const futureSlots = [];
          for (let i = 1; i <= horizonHours; i++) {
            const slotTime = now + i * 60 * 60 * 1e3;
            const hourBucket = Math.floor(slotTime / (60 * 60 * 1e3)) * (60 * 60 * 1e3);
            const predictedCount = Math.round(avgEventsPerHour * 100) / 100;
            futureSlots.push({
              hour: i,
              timestamp: slotTime,
              predictedEvents: predictedCount,
              confidence: totalEvents > 50 ? "high" : "medium"
            });
          }
          return {
            success: true,
            horizonHours,
            periodicity,
            avgEventsPerHour: Math.round(avgEventsPerHour * 100) / 100,
            totalHistoricalEvents: totalEvents,
            topPredictedTypes: topTypes,
            forecastSlots: futureSlots,
            confidence: totalEvents > 100 ? "high" : totalEvents > 30 ? "medium" : "low",
            basedOnEvents: history.length
          };
        }
        /**
         * 获取服务状态
         */
        getStatus() {
          const busStats = realmEventBus.getStats();
          return {
            isInitialized: this.isInitialized,
            totalIndexedEvents: busStats.totalEvents,
            isSubscribedToEventBus: !!this.eventBusSubscription,
            config: ANALYTICS_CONFIG
          };
        }
        /**
         * 重置服务
         */
        reset() {
          this.eventIndex.clear();
          this.rebuildIndex();
          return { success: true };
        }
      };
      eventAnalyticsService = new EventAnalyticsService();
      EVENT_ANALYTICS_TOOLS = {
        "event.analytics.stats": {
          name: "event.analytics.stats",
          description: "Get event statistics including counts by type, source, and priority",
          inputSchema: {
            type: "object",
            properties: {
              eventType: { type: "string", description: "Filter by event type" },
              source: { type: "string", description: "Filter by source" },
              timeRange: {
                type: "object",
                description: "Time range filter",
                properties: {
                  since: { type: "number", description: "Start timestamp" },
                  until: { type: "number", description: "End timestamp" }
                }
              }
            }
          }
        },
        "event.analytics.trend": {
          name: "event.analytics.trend",
          description: "Get event trends over time with moving averages",
          inputSchema: {
            type: "object",
            properties: {
              windowSize: { type: "number", description: "Number of time windows (default: 100)" },
              eventType: { type: "string", description: "Filter by event type" },
              granularity: {
                type: "string",
                enum: ["minute", "hour", "day"],
                description: "Time granularity (default: hour)"
              }
            }
          }
        },
        "event.analytics.pattern": {
          name: "event.analytics.pattern",
          description: "Detect recurring event patterns and sequences",
          inputSchema: {
            type: "object",
            properties: {
              sequenceLength: { type: "number", description: "Max sequence length to detect (default: 5)" },
              minOccurrences: { type: "number", description: "Minimum occurrences (default: 2)" },
              eventType: { type: "string", description: "Filter by event type" }
            }
          }
        },
        "event.analytics.anomaly": {
          name: "event.analytics.anomaly",
          description: "Detect anomalous events using statistical analysis",
          inputSchema: {
            type: "object",
            properties: {
              threshold: { type: "number", description: "Z-score threshold for anomaly (default: 2.0)" },
              windowSize: { type: "number", description: "Window size for analysis (default: 50)" },
              source: { type: "string", description: "Filter by source" }
            }
          }
        },
        "event.history.query": {
          name: "event.history.query",
          description: "Query historical events with filtering and pagination",
          inputSchema: {
            type: "object",
            properties: {
              eventType: { type: "string", description: "Filter by event type" },
              source: { type: "string", description: "Filter by source" },
              since: { type: "number", description: "Start timestamp" },
              until: { type: "number", description: "End timestamp" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
              dataFilter: { type: "object", description: "Filter by event data" },
              limit: { type: "number", description: "Max results (default: 100)" },
              offset: { type: "number", description: "Offset for pagination (default: 0)" }
            }
          }
        },
        "event.analytics.forecast": {
          name: "event.analytics.forecast",
          description: "Predict future events based on historical patterns",
          inputSchema: {
            type: "object",
            properties: {
              horizonHours: { type: "number", description: "Forecast horizon in hours (default: 24)" },
              eventType: { type: "string", description: "Filter by event type" }
            }
          }
        }
      };
      EventAnalyticsService_default = eventAnalyticsService;
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

  // src/domains/pet/entities/Pet.js
  var PetBattleStats = {
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
  var EvolutionStages = {
    INFANT: 1,
    // 幼生期
    MATURE: 2,
    // 成熟期
    ANCIENT: 3,
    // 远古期
    DIVINE: 4
    // 神化期
  };
  var PetForms = {
    CHILD: "child",
    // 幼体
    ADULT: "adult",
    // 成体
    MUTANT: "mutant",
    // 变异体
    DIVINE: "divine"
    // 神体
  };
  var Pet = class _Pet {
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

  // src/domains/pet/services/PetService.js
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
        const pet = new Pet({
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

  // src/domains/inventory/services/AlchemyKBService.js
  var AlchemyKBService = class {
    constructor() {
      this.initialized = false;
      this.gameState = null;
      this.knowledgeGraph = {
        nodes: [],
        edges: [],
        recipes: {},
        // 已发现的丹方
        herbEfficacies: {}
        // 药材属性映射
      };
      this.herbEfficacyDatabase = {
        "\u7075\u8349": ["qi_restoration", "cultivation_boost"],
        "\u5996\u517D\u8840": ["attack_boost", "beast_summon"],
        "\u5929\u6750": ["all_attributes", "breakthrough_help"],
        "\u6DF7\u6C8C\u77F3": ["chaos_attribute", "legendary_boost"],
        "\u7384\u94C1": ["defense_boost", "weapon_material"],
        "\u5996\u517D\u76AE": ["defense_boost", "armor_material"],
        "\u5996\u517D\u9AA8": ["attack_boost", "tool_material"],
        "\u7075\u77F3": ["energy_source", "universal"]
      };
      this.initialRecipes = {
        "\u56DE\u6C14\u4E39": {
          materials: ["\u7075\u8349"],
          efficacies: ["qi_restoration"],
          discovered: true,
          discoverProbability: 0
        },
        "\u7597\u4F24\u4E39": {
          materials: ["\u7075\u8349", "\u5996\u517D\u8840"],
          efficacies: ["healing", "attack_boost"],
          discovered: true,
          discoverProbability: 0
        },
        "\u805A\u7075\u4E39": {
          materials: ["\u7075\u77F3", "\u7075\u8349"],
          efficacies: ["cultivation_boost", "qi_restoration"],
          discovered: true,
          discoverProbability: 0
        },
        "\u7834\u5883\u4E39": {
          materials: ["\u7075\u77F3", "\u5929\u6750"],
          efficacies: ["breakthrough_help", "realm_barrier"],
          discovered: true,
          discoverProbability: 0
        },
        "\u6E21\u52AB\u4E39": {
          materials: ["\u5929\u6750", "\u7075\u77F3"],
          efficacies: ["tribulation_help", "mindset_boost"],
          discovered: true,
          discoverProbability: 0
        },
        "\u6D17\u9AD3\u4E39": {
          materials: ["\u5929\u6750", "\u7075\u77F3"],
          efficacies: ["spirit_root_refresh", "all_attributes"],
          discovered: true,
          discoverProbability: 0
        }
      };
      this.synergyEffects = {
        "qi_restoration+cultivation_boost": "enhanced_cultivation",
        "attack_boost+defense_boost": "balanced_combat",
        "all_attributes+legendary_boost": "ultimate_pill",
        "breakthrough_help+mindset_boost": "smooth_breakthrough",
        "healing+qi_restoration": "full_recovery"
      };
      this.discoveryCost = 500;
    }
    /**
     * 初始化丹方知识图谱
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.alchemyKB) {
        gameState3.alchemyKB = {
          recipes: { ...this.initialRecipes },
          herbEfficacies: { ...this.herbEfficacyDatabase },
          totalDiscoveries: 0,
          lastDiscoveryDate: null
        };
      }
      this.knowledgeGraph.recipes = gameState3.alchemyKB.recipes;
      this.knowledgeGraph.herbEfficacies = gameState3.alchemyKB.herbEfficacies;
      this.buildKnowledgeGraph();
      this.initialized = true;
      return gameState3;
    }
    /**
     * 构建知识图谱
     */
    buildKnowledgeGraph() {
      const nodes = [];
      const edges = [];
      for (const herb of Object.keys(this.knowledgeGraph.herbEfficacies)) {
        nodes.push({
          id: `herb_${herb}`,
          type: "herb",
          name: herb,
          properties: {
            efficacies: this.knowledgeGraph.herbEfficacies[herb]
          }
        });
      }
      const efficacySet = /* @__PURE__ */ new Set();
      for (const herbEfficacies of Object.values(this.knowledgeGraph.herbEfficacies)) {
        for (const eff of herbEfficacies) {
          efficacySet.add(eff);
        }
      }
      for (const eff of efficacySet) {
        nodes.push({
          id: `efficacy_${eff}`,
          type: "efficacy",
          name: eff,
          properties: {}
        });
      }
      for (const [recipeName, recipe] of Object.entries(this.knowledgeGraph.recipes)) {
        if (recipe.discovered) {
          nodes.push({
            id: `recipe_${recipeName}`,
            type: "recipe",
            name: recipeName,
            properties: {
              materials: recipe.materials,
              efficacies: recipe.efficacies
            }
          });
          for (const mat of recipe.materials) {
            edges.push({
              source: `herb_${mat}`,
              target: `recipe_${recipeName}`,
              relation: "material_for"
            });
          }
          for (const eff of recipe.efficacies) {
            edges.push({
              source: `efficacy_${eff}`,
              target: `recipe_${recipeName}`,
              relation: "contributes_to"
            });
          }
        }
      }
      this.knowledgeGraph.nodes = nodes;
      this.knowledgeGraph.edges = edges;
    }
    // ===== MCP 工具实现 =====
    /**
     * alchemy.kb.query - 查询丹方知识库
     */
    query(params) {
      if (!this.initialized) {
        return { success: false, error: "\u77E5\u8BC6\u5E93\u672A\u521D\u59CB\u5316" };
      }
      const { type, name } = params || {};
      if (!type && !name) {
        return {
          success: true,
          data: {
            totalNodes: this.knowledgeGraph.nodes.length,
            totalEdges: this.knowledgeGraph.edges.length,
            discoveredRecipes: Object.values(this.knowledgeGraph.recipes).filter((r) => r.discovered).length,
            totalRecipes: Object.keys(this.knowledgeGraph.recipes).length,
            herbCount: Object.keys(this.knowledgeGraph.herbEfficacies).length
          }
        };
      }
      if (type === "recipe" && name) {
        const recipe = this.knowledgeGraph.recipes[name];
        if (!recipe) {
          return { success: false, error: `\u4E39\u65B9 ${name} \u4E0D\u5B58\u5728` };
        }
        const recipeNode = this.knowledgeGraph.nodes.find((n) => n.id === `recipe_${name}`);
        const incomingEdges = this.knowledgeGraph.edges.filter((e) => e.target === `recipe_${name}`);
        return {
          success: true,
          data: {
            name,
            discovered: recipe.discovered,
            materials: recipe.materials,
            efficacies: recipe.efficacies,
            relatedHerbs: incomingEdges.filter((e) => e.relation === "material_for").map((e) => e.source.replace("herb_", "")),
            relatedEfficacies: incomingEdges.filter((e) => e.relation === "contributes_to").map((e) => e.source.replace("efficacy_", ""))
          }
        };
      }
      if (type === "herb" && name) {
        const efficacies = this.knowledgeGraph.herbEfficacies[name];
        if (!efficacies) {
          return { success: false, error: `\u836F\u6750 ${name} \u4E0D\u5B58\u5728` };
        }
        const relatedRecipes = Object.entries(this.knowledgeGraph.recipes).filter(([, recipe]) => recipe.discovered && recipe.materials.includes(name)).map(([name2]) => name2);
        return {
          success: true,
          data: {
            name,
            efficacies,
            relatedRecipes
          }
        };
      }
      if (type === "efficacy" && name) {
        const efficacyNode = this.knowledgeGraph.nodes.find((n) => n.id === `efficacy_${name}`);
        if (!efficacyNode) {
          return { success: false, error: `\u5C5E\u6027 ${name} \u4E0D\u5B58\u5728` };
        }
        const relatedEdges = this.knowledgeGraph.edges.filter((e) => e.source === `efficacy_${name}`);
        const relatedRecipes = relatedEdges.map((e) => e.target.replace("recipe_", ""));
        return {
          success: true,
          data: {
            name,
            relatedRecipes
          }
        };
      }
      return { success: false, error: "\u65E0\u6548\u7684\u67E5\u8BE2\u53C2\u6570" };
    }
    /**
     * alchemy.recipe.discover - 手动研究新丹方（消耗灵气）
     */
    discover(params) {
      var _a, _b;
      if (!this.initialized) {
        return { success: false, error: "\u77E5\u8BC6\u5E93\u672A\u521D\u59CB\u5316" };
      }
      const { herbs, qiCost } = params || {};
      const cost = qiCost || this.discoveryCost;
      if (this.gameState.player.qi < cost) {
        return { success: false, error: `\u7075\u6C14\u4E0D\u8DB3\uFF0C\u9700\u8981 ${cost} \u70B9` };
      }
      this.gameState.player.qi -= cost;
      const elementMastery = ((_b = (_a = this.gameState.spiritRoot) == null ? void 0 : _a.attributes) == null ? void 0 : _b.wood) || 0;
      const baseProbability = 0.1 + elementMastery / 100;
      const allRecipesKnown = Object.values(this.knowledgeGraph.recipes).every((r) => r.discovered);
      if (allRecipesKnown) {
        return { success: false, error: "\u6240\u6709\u4E39\u65B9\u5DF2\u53D1\u73B0", qiSpent: cost, discoveryChance: 0 };
      }
      const unknownRecipes = Object.entries(this.knowledgeGraph.recipes).filter(([, recipe]) => !recipe.discovered);
      if (unknownRecipes.length === 0) {
        return { success: false, error: "\u6CA1\u6709\u53EF\u53D1\u73B0\u7684\u4E39\u65B9", qiSpent: cost };
      }
      let discoveryChance = baseProbability;
      if (herbs && herbs.length > 0) {
        for (const [recipeName, recipe] of unknownRecipes) {
          const matchedMaterials = recipe.materials.filter((m) => herbs.includes(m));
          if (matchedMaterials.length > 0) {
            discoveryChance += matchedMaterials.length / recipe.materials.length * 0.3;
          }
        }
      }
      const roll = Math.random();
      const discovered = roll < discoveryChance;
      if (discovered) {
        const [discoveredName, discoveredRecipe] = unknownRecipes[Math.floor(Math.random() * unknownRecipes.length)];
        this.knowledgeGraph.recipes[discoveredName].discovered = true;
        this.gameState.alchemyKB.recipes[discoveredName].discovered = true;
        this.gameState.alchemyKB.totalDiscoveries++;
        this.gameState.alchemyKB.lastDiscoveryDate = Date.now();
        this.buildKnowledgeGraph();
        return {
          success: true,
          discovered: discoveredName,
          materials: discoveredRecipe.materials,
          efficacies: discoveredRecipe.efficacies,
          qiSpent: cost,
          discoveryChance
        };
      }
      return {
        success: false,
        reason: "\u7814\u7A76\u5931\u8D25\uFF0C\u672A\u53D1\u73B0\u65B0\u4E39\u65B9",
        qiSpent: cost,
        discoveryChance,
        roll
      };
    }
    /**
     * alchemy.recipe.list - 列出已发现的丹方
     */
    listRecipes(params) {
      if (!this.initialized) {
        return { success: false, error: "\u77E5\u8BC6\u5E93\u672A\u521D\u59CB\u5316" };
      }
      const { filter } = params || {};
      let recipes = Object.entries(this.knowledgeGraph.recipes).filter(([, recipe]) => recipe.discovered).map(([name, recipe]) => ({
        name,
        materials: recipe.materials,
        efficacies: recipe.efficacies
      }));
      if (filter) {
        recipes = recipes.filter(
          (r) => r.name.includes(filter) || r.materials.some((m) => m.includes(filter)) || r.efficacies.some((e) => e.includes(filter))
        );
      }
      return {
        success: true,
        count: recipes.length,
        totalKnown: Object.keys(this.knowledgeGraph.recipes).length,
        recipes
      };
    }
    /**
     * alchemy.efficacy.map - 查看药材属性映射
     */
    getEfficacyMap(params) {
      if (!this.initialized) {
        return { success: false, error: "\u77E5\u8BC6\u5E93\u672A\u521D\u59CB\u5316" };
      }
      const { herb } = params || {};
      if (herb) {
        const efficacies = this.knowledgeGraph.herbEfficacies[herb];
        if (!efficacies) {
          return { success: false, error: `\u836F\u6750 ${herb} \u4E0D\u5B58\u5728` };
        }
        const synergyInfo = {};
        for (const eff of efficacies) {
          for (const [combo, result] of Object.entries(this.synergyEffects)) {
            if (combo.includes(eff)) {
              synergyInfo[combo] = result;
            }
          }
        }
        return {
          success: true,
          herb,
          efficacies,
          synergies: synergyInfo
        };
      }
      return {
        success: true,
        totalHerbs: Object.keys(this.knowledgeGraph.herbEfficacies).length,
        herbEfficacyMap: { ...this.knowledgeGraph.herbEfficacies },
        synergyEffects: { ...this.synergyEffects }
      };
    }
    /**
     * alchemy.craft.calculate - 计算炼丹结果预览
     */
    calculateCraft(params) {
      var _a, _b;
      if (!this.initialized) {
        return { success: false, error: "\u77E5\u8BC6\u5E93\u672A\u521D\u59CB\u5316" };
      }
      const { materials } = params || {};
      if (!materials || !Array.isArray(materials) || materials.length === 0) {
        return { success: false, error: "\u8BF7\u63D0\u4F9B\u6750\u6599\u5217\u8868" };
      }
      const materialCheck = this.checkMaterials(materials);
      if (!materialCheck.available) {
        return {
          success: false,
          error: "\u6750\u6599\u4E0D\u8DB3",
          missing: materialCheck.missing
        };
      }
      const matchedRecipes = [];
      for (const [recipeName, recipe] of Object.entries(this.knowledgeGraph.recipes)) {
        if (!recipe.discovered) continue;
        const matchedMaterials = recipe.materials.filter((m) => materials.includes(m));
        const matchRatio = matchedMaterials.length / recipe.materials.length;
        if (matchRatio > 0) {
          matchedRecipes.push({
            name: recipeName,
            matchRatio,
            matchDetails: {
              matched: matchedMaterials,
              required: recipe.materials,
              missing: recipe.materials.filter((m) => !materials.includes(m))
            },
            expectedEfficacies: recipe.efficacies
          });
        }
      }
      matchedRecipes.sort((a, b) => b.matchRatio - a.matchRatio);
      const materialEfficacies = [];
      for (const mat of materials) {
        const effs = this.knowledgeGraph.herbEfficacies[mat];
        if (effs) {
          materialEfficacies.push(...effs);
        }
      }
      const activeSynergies = [];
      for (const [combo, result] of Object.entries(this.synergyEffects)) {
        const comboEffs = combo.split("+");
        if (comboEffs.every((e) => materialEfficacies.includes(e))) {
          activeSynergies.push({ combo, result });
        }
      }
      let estimatedQuality = "common";
      if (activeSynergies.length >= 2) {
        estimatedQuality = "rare";
      }
      if (activeSynergies.length >= 3 || ((_a = matchedRecipes[0]) == null ? void 0 : _a.matchRatio) === 1) {
        estimatedQuality = "precious";
      }
      if (activeSynergies.length >= 4 && ((_b = matchedRecipes[0]) == null ? void 0 : _b.matchRatio) === 1) {
        estimatedQuality = "legendary";
      }
      return {
        success: true,
        inputMaterials: materials,
        matchedRecipes: matchedRecipes.slice(0, 5),
        activeSynergies,
        estimatedQuality,
        materialEfficacies: [...new Set(materialEfficacies)]
      };
    }
    /**
     * alchemy.kb.export - 导出知识图谱
     */
    exportKB(params) {
      var _a;
      if (!this.initialized) {
        return { success: false, error: "\u77E5\u8BC6\u5E93\u672A\u521D\u59CB\u5316" };
      }
      const { format, includeHidden } = params || {};
      const exportData = {
        meta: {
          exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
          totalNodes: this.knowledgeGraph.nodes.length,
          totalEdges: this.knowledgeGraph.edges.length,
          discoveredRecipes: Object.values(this.knowledgeGraph.recipes).filter((r) => r.discovered).length,
          totalDiscoveries: ((_a = this.gameState.alchemyKB) == null ? void 0 : _a.totalDiscoveries) || 0
        },
        nodes: this.knowledgeGraph.nodes,
        edges: this.knowledgeGraph.edges,
        recipes: includeHidden ? this.knowledgeGraph.recipes : Object.fromEntries(
          Object.entries(this.knowledgeGraph.recipes).map(([k, v]) => [k, { ...v, discoverProbability: void 0 }])
        ),
        herbEfficacies: this.knowledgeGraph.herbEfficacies,
        synergyEffects: this.synergyEffects
      };
      if (format === "json") {
        return {
          success: true,
          data: JSON.stringify(exportData, null, 2),
          mimeType: "application/json"
        };
      }
      return {
        success: true,
        data: exportData
      };
    }
    // ===== 辅助方法 =====
    /**
     * 检查材料是否足够
     */
    checkMaterials(materials) {
      const missing = [];
      for (const mat of materials) {
        if (mat === "\u7075\u77F3") {
          continue;
        }
        const hasItem = this.gameState.inventory.some(
          (item) => item.name === mat && item.quantity >= 1
        );
        if (!hasItem) {
          missing.push(mat);
        }
      }
      return {
        available: missing.length === 0,
        missing
      };
    }
    /**
     * 根据炼丹结果发现新丹方
     */
    onCraftResult(craftResult) {
      var _a, _b;
      if (!this.initialized || !(craftResult == null ? void 0 : craftResult.success)) return;
      const { materials, recipeName } = craftResult;
      const unknownRecipes = Object.entries(this.knowledgeGraph.recipes).filter(([, recipe]) => !recipe.discovered);
      if (unknownRecipes.length === 0) return;
      const elementMastery = ((_b = (_a = this.gameState.spiritRoot) == null ? void 0 : _a.attributes) == null ? void 0 : _b.wood) || 0;
      let discoveryChance = 0.05 + elementMastery / 200;
      for (const [name, recipe] of unknownRecipes) {
        const matchedMaterials = recipe.materials.filter((m) => materials.includes(m));
        discoveryChance += matchedMaterials.length / recipe.materials.length * 0.1;
      }
      const roll = Math.random();
      if (roll < discoveryChance) {
        const [discoveredName, discoveredRecipe] = unknownRecipes[Math.floor(Math.random() * unknownRecipes.length)];
        this.knowledgeGraph.recipes[discoveredName].discovered = true;
        this.gameState.alchemyKB.recipes[discoveredName].discovered = true;
        this.gameState.alchemyKB.totalDiscoveries++;
        this.gameState.alchemyKB.lastDiscoveryDate = Date.now();
        this.buildKnowledgeGraph();
        return {
          discovered: true,
          recipeName: discoveredName,
          materials: discoveredRecipe.materials,
          efficacies: discoveredRecipe.efficacies
        };
      }
      return { discovered: false };
    }
    /**
     * 获取统计信息
     */
    getStats() {
      var _a, _b;
      return {
        totalNodes: this.knowledgeGraph.nodes.length,
        totalEdges: this.knowledgeGraph.edges.length,
        discoveredRecipes: Object.values(this.knowledgeGraph.recipes).filter((r) => r.discovered).length,
        totalRecipes: Object.keys(this.knowledgeGraph.recipes).length,
        herbCount: Object.keys(this.knowledgeGraph.herbEfficacies).length,
        totalDiscoveries: ((_a = this.gameState.alchemyKB) == null ? void 0 : _a.totalDiscoveries) || 0,
        lastDiscovery: ((_b = this.gameState.alchemyKB) == null ? void 0 : _b.lastDiscoveryDate) || null
      };
    }
  };
  var alchemyKBService = new AlchemyKBService();

  // src/domains/inventory/services/HerbDiscoveryService.js
  var HerbDiscoveryService = class {
    constructor() {
      this.initialized = false;
      this.gameState = null;
      this.regionHerbs = {
        "\u5E73\u539F": {
          common: ["\u7518\u8349", "\u9EC4\u82AA", "\u4EBA\u53C2\u53F6", "\u91CE\u83CA\u82B1"],
          uncommon: ["\u7075\u829D", "\u4F55\u9996\u4E4C", "\u67B8\u675E\u5B50"],
          rare: ["\u5929\u9EBB", "\u9EC4\u7CBE"],
          legendary: []
        },
        "\u5C71\u6797": {
          common: ["\u91D1\u94F6\u82B1", "\u8FDE\u7FD8", "\u677F\u84DD\u6839", "\u84B2\u516C\u82F1"],
          uncommon: ["\u5929\u51AC", "\u9EA6\u51AC", "\u832F\u82D3"],
          rare: ["\u866B\u8349", "\u677E\u8338"],
          legendary: ["\u5343\u5E74\u7075\u829D"]
        },
        "\u6E56\u6CCA": {
          common: ["\u8377\u53F6", "\u83B2\u5B50", "\u82A6\u82C7", "\u9999\u84B2"],
          uncommon: ["\u73CD\u73E0\u7C89", "\u8D1D\u6BCD", "\u83B2\u82B1\u854A"],
          rare: ["\u4E5D\u773C\u77F3", "\u83B2\u5FC3\u8349"],
          legendary: ["\u51B0\u83B2"]
        },
        "\u6C99\u6F20": {
          common: ["\u8089\u82C1\u84C9", "\u9501\u9633", "\u6C99\u53C2"],
          uncommon: ["\u7EA2\u666F\u5929", "\u9EBB\u9EC4"],
          rare: ["\u8089\u6842", "\u6A80\u9999"],
          legendary: ["\u6C99\u4E4B\u773C"]
        },
        "\u96EA\u5C71": {
          common: ["\u96EA\u83B2", "\u7EA2\u82B1", "\u827E\u53F6"],
          uncommon: ["\u96EA\u8336", "\u51B0\u8349"],
          rare: ["\u96EA\u86E4", "\u51B0\u87FE"],
          legendary: ["\u51B0\u9B44\u5BD2\u83B2"]
        },
        "\u79D8\u5883": {
          common: ["\u4E03\u5F69\u8349", "\u5E7B\u5F71\u82B1", "\u5E7D\u51A5\u85E4"],
          uncommon: ["\u8840\u7CBE\u8349", "\u9B42\u82B1"],
          rare: ["\u865A\u7A7A\u5170", "\u547D\u8FD0\u82B1"],
          legendary: ["\u9053\u97F5\u82B1", "\u5929\u547D\u679C"]
        }
      };
      this.seasonalHerbs = {
        "\u6625": {
          available: ["\u4EBA\u53C2\u53F6", "\u91CE\u83CA\u82B1", "\u91D1\u94F6\u82B1", "\u8FDE\u7FD8", "\u84B2\u516C\u82F1", "\u5929\u51AC", "\u9EA6\u51AC", "\u832F\u82D3"],
          bonus: ["\u7075\u829D", "\u866B\u8349"],
          spawnRate: 1.2
        },
        "\u590F": {
          available: ["\u7518\u8349", "\u9EC4\u82AA", "\u677F\u84DD\u6839", "\u8377\u53F6", "\u83B2\u5B50", "\u82A6\u82C7", "\u9999\u84B2", "\u73CD\u73E0\u7C89"],
          bonus: ["\u677E\u8338", "\u51B0\u8349"],
          spawnRate: 1
        },
        "\u79CB": {
          available: ["\u67B8\u675E\u5B50", "\u5929\u9EBB", "\u9EC4\u7CBE", "\u866B\u8349", "\u677E\u8338", "\u8089\u82C1\u84C9", "\u9501\u9633", "\u6C99\u53C2"],
          bonus: ["\u96EA\u83B2", "\u7EA2\u666F\u5929"],
          spawnRate: 1.1
        },
        "\u51AC": {
          available: ["\u96EA\u83B2", "\u7EA2\u82B1", "\u827E\u53F6", "\u96EA\u8336", "\u51B0\u8349", "\u96EA\u86E4", "\u51B0\u87FE", "\u51B0\u83B2"],
          bonus: ["\u5343\u5E74\u7075\u829D", "\u51B0\u9B44\u5BD2\u83B2"],
          spawnRate: 0.9
        }
      };
      this.rarityLevels = {
        "common": { name: "\u666E\u901A", color: "#9E9E9E", discoveryChance: 0.8, masteryBonus: 1 },
        "uncommon": { name: "\u7A00\u6709", color: "#4CAF50", discoveryChance: 0.5, masteryBonus: 2 },
        "rare": { name: "\u73CD\u7A00", color: "#2196F3", discoveryChance: 0.25, masteryBonus: 3 },
        "legendary": { name: "\u4F20\u8BF4", color: "#FF9800", discoveryChance: 0.1, masteryBonus: 5 }
      };
      this.herbSynergies = {
        "\u7075\u829D+\u866B\u8349": { result: "\u5F3A\u5316\u7075\u529B", efficiency: 1.5 },
        "\u4EBA\u53C2\u53F6+\u67B8\u675E\u5B50": { result: "\u8865\u6C14\u517B\u8840", efficiency: 1.3 },
        "\u96EA\u83B2+\u51B0\u8349": { result: "\u5BD2\u51B0\u6DEC\u4F53", efficiency: 1.4 },
        "\u5929\u9EBB+\u9EC4\u7CBE": { result: "\u5B89\u795E\u76CA\u667A", efficiency: 1.2 },
        "\u832F\u82D3+\u83B2\u5B50": { result: "\u5065\u813E\u5B81\u5FC3", efficiency: 1.3 },
        "\u91D1\u94F6\u82B1+\u8FDE\u7FD8": { result: "\u6E05\u70ED\u89E3\u6BD2", efficiency: 1.4 },
        "\u8089\u82C1\u84C9+\u9501\u9633": { result: "\u58EE\u9633\u8865\u80BE", efficiency: 1.5 },
        "\u73CD\u73E0\u7C89+\u8D1D\u6BCD": { result: "\u6DA6\u80BA\u517B\u989C", efficiency: 1.3 },
        "\u5343\u5E74\u7075\u829D+\u866B\u8349": { result: "\u5EF6\u5E74\u76CA\u5BFF", efficiency: 2 },
        "\u51B0\u9B44\u5BD2\u83B2+\u96EA\u86E4": { result: "\u51B0\u808C\u7389\u9AA8", efficiency: 1.8 },
        "\u9053\u97F5\u82B1+\u5929\u547D\u679C": { result: "\u9006\u5929\u6539\u547D", efficiency: 2.5 },
        "\u8840\u7CBE\u8349+\u9B42\u82B1": { result: "\u8840\u796D\u7075\u9B42", efficiency: 1.6 },
        "\u865A\u7A7A\u5170+\u5E7B\u5F71\u82B1": { result: "\u865A\u5B9E\u76F8\u751F", efficiency: 1.7 },
        "\u4E03\u5F69\u8349+\u5E7D\u51A5\u85E4": { result: "\u9634\u9633\u8C03\u548C", efficiency: 1.5 }
      };
      this.discoveredHerbs = /* @__PURE__ */ new Set();
      this.herbKnowledge = {
        metal: 0,
        // 金
        wood: 0,
        // 木
        water: 0,
        // 水
        fire: 0,
        // 火
        earth: 0
        // 土
      };
      this.exploreCooldown = 0;
      this.cooldownDuration = 5e3;
    }
    /**
     * 初始化药材探索服务
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.herbDiscovery) {
        gameState3.herbDiscovery = {
          discoveredHerbs: [],
          herbKnowledge: { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 },
          totalExplorations: 0,
          successfulDiscoveries: 0,
          regionVisits: {},
          seasonHarvests: {}
        };
      }
      this.discoveredHerbs = new Set(gameState3.herbDiscovery.discoveredHerbs || []);
      this.herbKnowledge = { ...this.herbKnowledge, ...gameState3.herbDiscovery.herbKnowledge || {} };
      this.initialized = true;
      return gameState3;
    }
    /**
     * 获取当前季节
     */
    getCurrentSeason() {
      var _a;
      const days = ((_a = this.gameState) == null ? void 0 : _a.days) || 1;
      const seasonIndex = Math.floor(days % 365 / 91);
      const seasons = ["\u6625", "\u590F", "\u79CB", "\u51AC"];
      return seasons[seasonIndex] || "\u6625";
    }
    /**
     * 计算发现概率
     */
    calculateDiscoveryChance(rarity, elementBonus = 0) {
      const rarityData = this.rarityLevels[rarity] || this.rarityLevels["common"];
      const baseChance = rarityData.discoveryChance;
      const masteryBonus = rarityData.masteryBonus;
      const elementMultiplier = 1 + elementBonus * 0.1;
      return Math.min(0.95, baseChance * elementMultiplier);
    }
    /**
     * 计算协同效应
     */
    calculateSynergy(herbs) {
      const synergies = [];
      const sortedHerbs = [...herbs].sort();
      for (const [combo, effect] of Object.entries(this.herbSynergies)) {
        const [herb1, herb2] = combo.split("+");
        if (sortedHerbs.includes(herb1) && sortedHerbs.includes(herb2)) {
          synergies.push({
            herbs: [herb1, herb2],
            effect: effect.result,
            efficiency: effect.efficiency
          });
        }
      }
      synergies.sort((a, b) => b.efficiency - a.efficiency);
      return synergies;
    }
    // ===== MCP 工具实现 =====
    /**
     * herb.explore.region - 在指定地域探索药材
     */
    exploreRegion(params) {
      var _a, _b;
      if (!this.initialized) {
        return { success: false, error: "\u836F\u6750\u63A2\u7D22\u670D\u52A1\u672A\u521D\u59CB\u5316" };
      }
      const { region, useMastery = true } = params || {};
      if (this.exploreCooldown > Date.now()) {
        const remaining = Math.ceil((this.exploreCooldown - Date.now()) / 1e3);
        return { success: false, error: `\u63A2\u7D22\u51B7\u5374\u4E2D\uFF0C\u8BF7\u7B49\u5F85 ${remaining} \u79D2` };
      }
      if (!region || !this.regionHerbs[region]) {
        return {
          success: false,
          error: "\u65E0\u6548\u7684\u5730\u57DF",
          validRegions: Object.keys(this.regionHerbs)
        };
      }
      let elementBonus = 0;
      if (useMastery && ((_b = (_a = this.gameState) == null ? void 0 : _a.spiritRoot) == null ? void 0 : _b.attributes)) {
        const attrs = this.gameState.spiritRoot.attributes;
        elementBonus = (attrs.metal || 0) + (attrs.wood || 0) + (attrs.water || 0) + (attrs.fire || 0) + (attrs.earth || 0);
      }
      const regionData = this.regionHerbs[region];
      const season = this.getCurrentSeason();
      const seasonData = this.seasonalHerbs[season];
      const availableHerbs = [...regionData.common];
      if (seasonData.bonus.some((h) => regionData.uncommon.includes(h))) {
        availableHerbs.push(...regionData.uncommon.filter((h) => seasonData.bonus.includes(h)));
      }
      const rarityRoll = Math.random();
      let selectedRarity;
      let herbs;
      if (rarityRoll < 0.6) {
        selectedRarity = "common";
        herbs = regionData.common;
      } else if (rarityRoll < 0.85) {
        selectedRarity = "uncommon";
        herbs = regionData.uncommon;
      } else if (rarityRoll < 0.97) {
        selectedRarity = "rare";
        herbs = regionData.rare;
      } else {
        selectedRarity = "legendary";
        herbs = regionData.legendary;
      }
      while (herbs.length === 0 && selectedRarity !== "common") {
        if (selectedRarity === "legendary") selectedRarity = "rare";
        else if (selectedRarity === "rare") selectedRarity = "uncommon";
        else if (selectedRarity === "uncommon") selectedRarity = "common";
        herbs = regionData[selectedRarity];
      }
      const discoveryChance = this.calculateDiscoveryChance(selectedRarity, elementBonus);
      const seasonMultiplier = seasonData.spawnRate;
      const finalChance = discoveryChance * seasonMultiplier;
      const roll = Math.random();
      const discovered = roll < finalChance;
      this.exploreCooldown = Date.now() + this.cooldownDuration;
      this.gameState.herbDiscovery.totalExplorations++;
      this.gameState.herbDiscovery.regionVisits[region] = (this.gameState.herbDiscovery.regionVisits[region] || 0) + 1;
      if (discovered && herbs.length > 0) {
        const herb = herbs[Math.floor(Math.random() * herbs.length)];
        const isNew = !this.discoveredHerbs.has(herb);
        if (isNew) {
          this.discoveredHerbs.add(herb);
          this.gameState.herbDiscovery.discoveredHerbs.push(herb);
          this.gameState.herbDiscovery.successfulDiscoveries++;
        }
        return {
          success: true,
          region,
          season,
          herb,
          rarity: selectedRarity,
          rarityName: this.rarityLevels[selectedRarity].name,
          isNew,
          discoveryChance: finalChance,
          roll,
          seasonBonus: seasonMultiplier > 1 ? "good" : seasonMultiplier < 1 ? "bad" : "normal"
        };
      }
      return {
        success: false,
        reason: "\u672A\u53D1\u73B0\u836F\u6750",
        region,
        season,
        discoveryChance: finalChance,
        roll,
        regionHerbs: regionData.common.slice(0, 3)
      };
    }
    /**
     * herb.season.query - 查询当前季节的药材
     */
    querySeasonalHerbs(params) {
      if (!this.initialized) {
        return { success: false, error: "\u836F\u6750\u63A2\u7D22\u670D\u52A1\u672A\u521D\u59CB\u5316" };
      }
      const { season } = params || {};
      const targetSeason = season || this.getCurrentSeason();
      const seasonData = this.seasonalHerbs[targetSeason];
      if (!seasonData) {
        return { success: false, error: `\u65E0\u6548\u7684\u5B63\u8282: ${season}` };
      }
      const rarityCounts = {
        common: seasonData.available.filter(
          (h) => Object.values(this.regionHerbs).some((r) => r.common.includes(h))
        ).length,
        uncommon: seasonData.bonus.filter(
          (h) => Object.values(this.regionHerbs).some((r) => r.uncommon.includes(h))
        ).length
      };
      return {
        success: true,
        season: targetSeason,
        availableHerbs: seasonData.available,
        bonusHerbs: seasonData.bonus,
        spawnRate: seasonData.spawnRate,
        rarityCounts,
        description: this.getSeasonDescription(targetSeason)
      };
    }
    /**
     * 获取季节描述
     */
    getSeasonDescription(season) {
      const descriptions = {
        "\u6625": "\u6625\u5B63\u4E07\u7269\u590D\u82CF\uFF0C\u8349\u6728\u751F\u957F\u65FA\u76DB\uFF0C\u662F\u91C7\u96C6\u7075\u8349\u7684\u597D\u65F6\u8282\u3002",
        "\u590F": "\u590F\u5B63\u9633\u5149\u5145\u8DB3\uFF0C\u6E56\u6CCA\u836F\u6750\u751F\u957F\u8FC5\u901F\uFF0C\u4F46\u5C71\u6797\u836F\u6750\u8F83\u5C11\u3002",
        "\u79CB": "\u79CB\u5B63\u662F\u6536\u83B7\u7684\u5B63\u8282\uFF0C\u5927\u90E8\u5206\u836F\u6750\u90FD\u5728\u6B64\u65F6\u6210\u719F\u3002",
        "\u51AC": "\u51AC\u5B63\u5BD2\u51B7\uFF0C\u51B0\u96EA\u836F\u6750\u54C1\u8D28\u6700\u4F73\uFF0C\u4F46\u6570\u91CF\u8F83\u5C11\u3002"
      };
      return descriptions[season] || "";
    }
    /**
     * herb.discovery.list - 查看已发现药材
     */
    listDiscoveredHerbs(params) {
      if (!this.initialized) {
        return { success: false, error: "\u836F\u6750\u63A2\u7D22\u670D\u52A1\u672A\u521D\u59CB\u5316" };
      }
      const { filter, rarity } = params || {};
      let herbs = Array.from(this.discoveredHerbs);
      if (rarity) {
        herbs = herbs.filter(
          (h) => Object.entries(this.regionHerbs).some(
            ([, data]) => {
              var _a;
              return (_a = data[rarity]) == null ? void 0 : _a.includes(h);
            }
          )
        );
      }
      if (filter) {
        herbs = herbs.filter((h) => h.includes(filter));
      }
      const classifiedHerbs = {
        common: [],
        uncommon: [],
        rare: [],
        legendary: []
      };
      for (const herb of herbs) {
        for (const [rarity2, data] of Object.entries(this.regionHerbs)) {
          if (data.legendary.includes(herb)) {
            classifiedHerbs.legendary.push(herb);
          } else if (data.rare.includes(herb)) {
            classifiedHerbs.rare.push(herb);
          } else if (data.uncommon.includes(herb)) {
            classifiedHerbs.uncommon.push(herb);
          } else if (data.common.includes(herb)) {
            classifiedHerbs.common.push(herb);
          }
        }
      }
      return {
        success: true,
        totalCount: herbs.length,
        herbs: herbs.sort(),
        classified: classifiedHerbs,
        stats: {
          totalExplorations: this.gameState.herbDiscovery.totalExplorations,
          successfulDiscoveries: this.gameState.herbDiscovery.successfulDiscoveries,
          discoveryRate: this.gameState.herbDiscovery.totalExplorations > 0 ? (this.gameState.herbDiscovery.successfulDiscoveries / this.gameState.herbDiscovery.totalExplorations * 100).toFixed(1) + "%" : "0%"
        }
      };
    }
    /**
     * herb.rarity.classify - 药材稀有度分类
     */
    classifyHerbsByRarity(params) {
      if (!this.initialized) {
        return { success: false, error: "\u836F\u6750\u63A2\u7D22\u670D\u52A1\u672A\u521D\u59CB\u5316" };
      }
      const { herb } = params || {};
      if (herb) {
        for (const [rarity, data] of Object.entries(this.regionHerbs)) {
          for (const [rarityType, herbs] of Object.entries(data)) {
            if (herbs.includes(herb)) {
              const rarityData = this.rarityLevels[rarityType];
              return {
                success: true,
                herb,
                rarity: rarityType,
                rarityName: rarityData.name,
                color: rarityData.color,
                discoveryChance: rarityData.discoveryChance,
                masteryBonus: rarityData.masteryBonus,
                regions: this.findHerbRegions(herb)
              };
            }
          }
        }
        return { success: false, error: `\u672A\u627E\u5230\u836F\u6750: ${herb}` };
      }
      const classification = {};
      for (const [regionName, data] of Object.entries(this.regionHerbs)) {
        for (const [rarityType, herbs] of Object.entries(data)) {
          if (!classification[rarityType]) {
            classification[rarityType] = {
              name: this.rarityLevels[rarityType].name,
              color: this.rarityLevels[rarityType].color,
              herbs: []
            };
          }
          classification[rarityType].herbs.push(...herbs);
        }
      }
      for (const rarity of Object.keys(classification)) {
        classification[rarity].herbs = [...new Set(classification[rarity].herbs)];
        classification[rarity].count = classification[rarity].herbs.length;
      }
      return {
        success: true,
        classification,
        totalHerbs: Object.values(classification).reduce((sum, c) => sum + c.count, 0)
      };
    }
    /**
     * 查找药材存在的地域
     */
    findHerbRegions(herb) {
      const regions = [];
      for (const [regionName, data] of Object.entries(this.regionHerbs)) {
        for (const [rarity, herbs] of Object.entries(data)) {
          if (herbs.includes(herb)) {
            regions.push({
              region: regionName,
              rarity
            });
          }
        }
      }
      return regions;
    }
    /**
     * herb.synergy.analyze - 分析药材协同效应
     */
    analyzeSynergy(params) {
      if (!this.initialized) {
        return { success: false, error: "\u836F\u6750\u63A2\u7D22\u670D\u52A1\u672A\u521D\u59CB\u5316" };
      }
      const { herbs } = params || {};
      if (!herbs || !Array.isArray(herbs) || herbs.length < 2) {
        return {
          success: false,
          error: "\u8BF7\u63D0\u4F9B\u81F3\u5C112\u79CD\u836F\u6750\u8FDB\u884C\u5206\u6790",
          availableSynergies: Object.keys(this.herbSynergies).slice(0, 5)
        };
      }
      const synergies = this.calculateSynergy(herbs);
      const totalEfficiency = synergies.reduce((sum, s) => sum + s.efficiency, 0);
      const discoveredCount = herbs.filter((h) => this.discoveredHerbs.has(h)).length;
      const possibleCombos = [];
      for (const [combo, effect] of Object.entries(this.herbSynergies)) {
        const [h1, h2] = combo.split("+");
        if (herbs.includes(h1) || herbs.includes(h2)) {
          const hasBoth = herbs.includes(h1) && herbs.includes(h2);
          const hasOne = herbs.includes(h1) || herbs.includes(h2);
          if (!hasBoth) {
            possibleCombos.push({
              existing: herbs.includes(h1) ? h1 : h2,
              missing: herbs.includes(h1) ? h2 : h1,
              effect: effect.result,
              efficiency: effect.efficiency
            });
          }
        }
      }
      return {
        success: true,
        inputHerbs: herbs,
        synergies,
        totalEfficiency,
        hasSynergy: synergies.length > 0,
        discoveredCount,
        missingCount: herbs.length - discoveredCount,
        possibleCombos: possibleCombos.slice(0, 5)
      };
    }
    /**
     * herb.knowledge.gain - 获取药材知识（升级精通）
     */
    gainHerbKnowledge(params) {
      if (!this.initialized) {
        return { success: false, error: "\u836F\u6750\u63A2\u7D22\u670D\u52A1\u672A\u521D\u59CB\u5316" };
      }
      const { element, amount } = params || {};
      const knowledgeGain = amount || 1;
      const validElements = ["metal", "wood", "water", "fire", "earth"];
      if (element && !validElements.includes(element)) {
        return {
          success: false,
          error: "\u65E0\u6548\u7684\u5143\u7D20",
          validElements
        };
      }
      if (element) {
        const oldLevel = this.herbKnowledge[element];
        this.herbKnowledge[element] += knowledgeGain;
        const newLevel = this.herbKnowledge[element];
        this.gameState.herbDiscovery.herbKnowledge[element] = newLevel;
        return {
          success: true,
          element,
          knowledgeGain,
          oldLevel,
          newLevel,
          levelUp: Math.floor(newLevel / 10) > Math.floor(oldLevel / 10),
          bonusMultiplier: 1 + newLevel * 0.1
        };
      }
      const totalKnowledge = Object.values(this.herbKnowledge).reduce((sum, v) => sum + v, 0);
      const elementDescriptions = {
        metal: "\u91D1 - \u63A7\u5236\u77FF\u7269\u548C\u91D1\u5C5E\u7C7B\u836F\u6750",
        wood: "\u6728 - \u63A7\u5236\u8349\u672C\u548C\u690D\u7269\u7C7B\u836F\u6750",
        water: "\u6C34 - \u63A7\u5236\u6C34\u7CFB\u548C\u5BD2\u6027\u836F\u6750",
        fire: "\u706B - \u63A7\u5236\u706B\u7CFB\u548C\u70ED\u6027\u836F\u6750",
        earth: "\u571F - \u63A7\u5236\u571F\u7CFB\u548C\u77FF\u7269\u7C7B\u836F\u6750"
      };
      return {
        success: true,
        herbKnowledge: this.herbKnowledge,
        totalKnowledge,
        elementDescriptions,
        overallBonus: 1 + totalKnowledge * 0.05,
        levelSummary: Object.fromEntries(
          Object.entries(this.herbKnowledge).map(([el, val]) => [el, Math.floor(val / 10)])
        )
      };
    }
    /**
     * 获取服务状态
     */
    getStatus() {
      var _a, _b, _c, _d;
      return {
        initialized: this.initialized,
        discoveredCount: this.discoveredHerbs.size,
        totalKnowledge: Object.values(this.herbKnowledge).reduce((sum, v) => sum + v, 0),
        cooldownActive: this.exploreCooldown > Date.now(),
        cooldownRemaining: Math.max(0, this.exploreCooldown - Date.now()),
        currentSeason: this.getCurrentSeason(),
        stats: {
          totalExplorations: ((_b = (_a = this.gameState) == null ? void 0 : _a.herbDiscovery) == null ? void 0 : _b.totalExplorations) || 0,
          successfulDiscoveries: ((_d = (_c = this.gameState) == null ? void 0 : _c.herbDiscovery) == null ? void 0 : _d.successfulDiscoveries) || 0
        }
      };
    }
  };
  var herbDiscoveryService = new HerbDiscoveryService();

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

  // src/domains/reincarnation/services/ReincarnationBookService.js
  var ReincarnationBookService = class {
    constructor() {
      this.gameState = null;
      this.karmaRecords = [];
      this.tiandaoRecords = [];
      this.blessings = [];
    }
    /**
     * 初始化轮回簿系统
     */
    init(gameState3) {
      var _a;
      this.gameState = gameState3;
      gameState3.reincarnationBook = {
        karmaRecords: [],
        tiandaoRecords: [],
        tiandaoMerit: 0,
        blessings: [],
        reincarnationHistory: []
      };
      if ((_a = gameState3.reincarnation) == null ? void 0 : _a.pastLives) {
        gameState3.reincarnationBook.reincarnationHistory = gameState3.reincarnation.pastLives;
      }
      this.karmaRecords = gameState3.reincarnationBook.karmaRecords;
      this.tiandaoRecords = gameState3.reincarnationBook.tiandaoRecords;
      this.blessings = gameState3.reincarnationBook.blessings;
      return gameState3;
    }
    /**
     * 获取轮回簿统计
     */
    getBookStats() {
      var _a, _b, _c, _d, _e, _f;
      const book = ((_a = this.gameState) == null ? void 0 : _a.reincarnationBook) || {};
      const reincarnation = ((_b = this.gameState) == null ? void 0 : _b.reincarnation) || {};
      return {
        totalKarmaRecords: ((_c = book.karmaRecords) == null ? void 0 : _c.length) || 0,
        totalTiandaoRecords: ((_d = book.tiandaoRecords) == null ? void 0 : _d.length) || 0,
        tiandaoMerit: book.tiandaoMerit || 0,
        blessingsCount: ((_e = book.blessings) == null ? void 0 : _e.length) || 0,
        reincarnationTimes: reincarnation.times || 0,
        netKarma: (reincarnation.karmaGood || 0) - (reincarnation.karmaBad || 0),
        karmaGood: reincarnation.karmaGood || 0,
        karmaBad: reincarnation.karmaBad || 0,
        pastLivesCount: ((_f = reincarnation.pastLives) == null ? void 0 : _f.length) || 0
      };
    }
    // ===== MCP工具实现 =====
    /**
     * MCP: reincarnation.book.list
     * 查看转世历史（轮回簿）
     */
    mcpBookList(params = {}) {
      var _a, _b;
      const limit = (params == null ? void 0 : params.limit) || 20;
      const offset = (params == null ? void 0 : params.offset) || 0;
      const filter = (params == null ? void 0 : params.filter) || "all";
      const history = ((_b = (_a = this.gameState) == null ? void 0 : _a.reincarnation) == null ? void 0 : _b.pastLives) || [];
      let filtered = history;
      if (filter === "good") {
        filtered = history.filter((h) => (h.karmaBalance || 0) >= 0);
      } else if (filter === "bad") {
        filtered = history.filter((h) => (h.karmaBalance || 0) < 0);
      }
      const paginated = filtered.slice(offset, offset + limit);
      return {
        success: true,
        total: filtered.length,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        records: paginated.map((record) => ({
          ...record,
          realmName: this.getRealmName(record.realmAtDeath),
          karmaEvaluation: this.evaluateKarma(record.karmaBalance),
          ageDesc: record.ageAtDeath ? `\u4EAB\u5E74${record.ageAtDeath}\u5C81` : "\u5E74\u9F84\u672A\u77E5"
        })),
        message: `\u8F6E\u56DE\u7C3F\u5171 ${filtered.length} \u6761\u8BB0\u5F55`
      };
    }
    /**
     * MCP: reincarnation.karma.record
     * 记录因果行为
     */
    mcpKarmaRecord(params = {}) {
      var _a, _b, _c;
      const { type, action, amount, description } = params;
      if (!type || !action) {
        return {
          success: false,
          reason: "\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570\uFF1Atype\uFF08\u884C\u4E3A\u7C7B\u578B\uFF09\u548C action\uFF08\u5584\u6076\uFF09"
        };
      }
      const karmaAmount = Math.abs(amount || 1);
      const isGood = action === "good";
      const adjustedAmount = isGood ? karmaAmount : -karmaAmount;
      const record = {
        id: `karma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        // 行为类型
        action,
        // good/bad
        amount: adjustedAmount,
        description: description || this.getDefaultKarmaDesc(type, action),
        timestamp: Date.now(),
        day: ((_a = this.gameState) == null ? void 0 : _a.days) || 0
      };
      this.karmaRecords.push(record);
      if ((_b = this.gameState) == null ? void 0 : _b.reincarnationBook) {
      }
      const reincarnation = (_c = this.gameState) == null ? void 0 : _c.reincarnation;
      if (reincarnation) {
        if (isGood) {
          reincarnation.karmaGood = (reincarnation.karmaGood || 0) + karmaAmount;
        } else {
          reincarnation.karmaBad = (reincarnation.karmaBad || 0) + karmaAmount;
        }
      }
      return {
        success: true,
        record,
        karmaChange: adjustedAmount,
        currentKarma: {
          good: (reincarnation == null ? void 0 : reincarnation.karmaGood) || 0,
          bad: (reincarnation == null ? void 0 : reincarnation.karmaBad) || 0,
          net: ((reincarnation == null ? void 0 : reincarnation.karmaGood) || 0) - ((reincarnation == null ? void 0 : reincarnation.karmaBad) || 0)
        },
        message: `\u56E0\u679C\u8BB0\u5F55\uFF1A${record.description} (${isGood ? "+" : "-"}${karmaAmount})`
      };
    }
    /**
     * MCP: reincarnation.karma.query
     * 查询当前因果状态
     */
    mcpKarmaQuery(params = {}) {
      var _a;
      const reincarnation = ((_a = this.gameState) == null ? void 0 : _a.reincarnation) || {};
      const karmaGood = reincarnation.karmaGood || 0;
      const karmaBad = reincarnation.karmaBad || 0;
      const netKarma = karmaGood - karmaBad;
      const recentRecords = (this.karmaRecords || []).slice(-10);
      const evaluation = this.evaluateOverallKarma(netKarma);
      const karmaLevel = this.getKarmaLevel(netKarma);
      return {
        success: true,
        karma: {
          good: karmaGood,
          bad: karmaBad,
          net: netKarma,
          level: karmaLevel,
          evaluation
        },
        recentRecords: recentRecords.map((r) => ({
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
        message: `\u5F53\u524D\u56E0\u679C\uFF1A${evaluation} (${netKarma})`
      };
    }
    /**
     * MCP: reincarnation.tiandao.record
     * 记录天道功德
     */
    mcpTiandaoRecord(params = {}) {
      var _a, _b, _c, _d, _e;
      const { eventType, merit, description } = params;
      if (!eventType) {
        return { success: false, reason: "\u7F3A\u5C11 eventType \u53C2\u6570" };
      }
      const meritValue = Math.abs(merit || 0);
      const record = {
        id: `tiandao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType,
        merit: meritValue,
        description: description || this.getDefaultTiandaoDesc(eventType),
        timestamp: Date.now(),
        day: ((_a = this.gameState) == null ? void 0 : _a.days) || 0,
        realm: ((_b = this.gameState) == null ? void 0 : _b.realm) || 0
      };
      this.tiandaoRecords.push(record);
      if ((_c = this.gameState) == null ? void 0 : _c.reincarnationBook) {
        this.gameState.reincarnationBook.tiandaoMerit = (this.gameState.reincarnationBook.tiandaoMerit || 0) + meritValue;
      }
      return {
        success: true,
        record,
        totalMerit: ((_e = (_d = this.gameState) == null ? void 0 : _d.reincarnationBook) == null ? void 0 : _e.tiandaoMerit) || 0,
        message: `\u5929\u9053\u8BB0\u5F55\uFF1A${record.description} (+${meritValue}\u529F\u5FB7)`
      };
    }
    /**
     * MCP: reincarnation.tiandao.bless
     * 天道赐福（获得奖励）
     */
    mcpTiandaoBless(params = {}) {
      var _a, _b, _c, _d, _e, _f;
      const { level, reason } = params;
      const merit = ((_b = (_a = this.gameState) == null ? void 0 : _a.reincarnationBook) == null ? void 0 : _b.tiandaoMerit) || 0;
      const blessLevel = level || this.determineBlessLevel(merit);
      const blessConfig = {
        "SSS": { meritRequired: 1e3, effects: ["\u5929\u9009\u4E4B\u8D44", "\u609F\u6027+50%", "\u4FEE\u70BC\u901F\u5EA6+30%", "\u5947\u9047+20%"] },
        "SS": { meritRequired: 500, effects: ["\u5929\u547D\u4E4B\u4EBA", "\u609F\u6027+30%", "\u4FEE\u70BC\u901F\u5EA6+20%"] },
        "S": { meritRequired: 200, effects: ["\u798F\u7F18\u6DF1\u539A", "\u609F\u6027+20%", "\u4FEE\u70BC\u901F\u5EA6+10%"] },
        "A": { meritRequired: 100, effects: ["\u5409\u661F\u9AD8\u7167", "\u609F\u6027+10%"] },
        "B": { meritRequired: 50, effects: ["\u5C0F\u6709\u798F\u7F18"] },
        "C": { meritRequired: 0, effects: ["\u666E\u901A"] }
      };
      const config = blessConfig[blessLevel] || blessConfig["C"];
      if (merit < config.meritRequired) {
        return {
          success: false,
          reason: `\u529F\u5FB7\u4E0D\u8DB3\uFF0C\u9700\u8981 ${config.meritRequired} \u70B9\uFF0C\u5F53\u524D ${merit} \u70B9`,
          currentMerit: merit,
          requiredMerit: config.meritRequired
        };
      }
      const blessing = {
        id: `bless_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level: blessLevel,
        effects: config.effects,
        reason: reason || "\u5929\u9053\u8DEF\u5F84\u4E0A\u7684\u5584\u884C",
        timestamp: Date.now(),
        day: ((_c = this.gameState) == null ? void 0 : _c.days) || 0,
        meritCost: config.meritRequired
      };
      this.blessings.push(blessing);
      if ((_d = this.gameState) == null ? void 0 : _d.reincarnationBook) {
        this.gameState.reincarnationBook.tiandaoMerit -= config.meritRequired;
      }
      this.applyBlessingEffects(blessing);
      return {
        success: true,
        blessing,
        remainingMerit: ((_f = (_e = this.gameState) == null ? void 0 : _e.reincarnationBook) == null ? void 0 : _f.tiandaoMerit) || 0,
        message: `\u5929\u9053\u8D50\u798F\u300C${blessLevel}\u7EA7\u300D\uFF1A${config.effects.join("\u3001")}`
      };
    }
    /**
     * MCP: reincarnation.history.export
     * 导出轮回历史
     */
    mcpHistoryExport(params = {}) {
      var _a, _b, _c, _d, _e, _f, _g;
      const format = (params == null ? void 0 : params.format) || "json";
      const includeDetails = (params == null ? void 0 : params.includeDetails) !== false;
      const reincarnation = ((_a = this.gameState) == null ? void 0 : _a.reincarnation) || {};
      const book = ((_b = this.gameState) == null ? void 0 : _b.reincarnationBook) || {};
      const exportData = {
        meta: {
          exportTime: (/* @__PURE__ */ new Date()).toISOString(),
          gameVersion: ((_c = this.gameState) == null ? void 0 : _c.gameVersion) || "V226",
          playerName: ((_e = (_d = this.gameState) == null ? void 0 : _d.player) == null ? void 0 : _e.name) || "\u4FEE\u58EB"
        },
        summary: {
          reincarnationTimes: reincarnation.times || 0,
          totalKarma: (reincarnation.karmaGood || 0) - (reincarnation.karmaBad || 0),
          karmaGood: reincarnation.karmaGood || 0,
          karmaBad: reincarnation.karmaBad || 0,
          tiandaoMerit: book.tiandaoMerit || 0,
          pastLivesCount: ((_f = reincarnation.pastLives) == null ? void 0 : _f.length) || 0
        },
        reincarnationHistory: reincarnation.pastLives || [],
        karmaRecords: includeDetails ? book.karmaRecords || [] : [],
        tiandaoRecords: includeDetails ? book.tiandaoRecords || [] : [],
        blessings: includeDetails ? book.blessings || [] : []
      };
      if (format === "json") {
        return {
          success: true,
          data: exportData,
          dataSize: JSON.stringify(exportData).length,
          message: `\u8F6E\u56DE\u5386\u53F2\u5BFC\u51FA\u6210\u529F\uFF0C\u5171 ${((_g = reincarnation.pastLives) == null ? void 0 : _g.length) || 0} \u6761\u8F6C\u4E16\u8BB0\u5F55`
        };
      } else if (format === "text") {
        const textReport = this.generateTextReport(exportData);
        return {
          success: true,
          data: textReport,
          message: "\u6587\u672C\u683C\u5F0F\u8F6E\u56DE\u5386\u53F2"
        };
      }
      return {
        success: false,
        reason: `\u4E0D\u652F\u6301\u7684\u683C\u5F0F\uFF1A${format}`
      };
    }
    // ===== 辅助方法 =====
    /**
     * 获取境界名称
     */
    getRealmName(realm) {
      const realms = ["\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347"];
      return realms[realm] || "\u672A\u77E5";
    }
    /**
     * 评估单次因果
     */
    evaluateKarma(karmaBalance) {
      if (karmaBalance >= 500) return "\u5927\u5584";
      if (karmaBalance >= 100) return "\u5584";
      if (karmaBalance >= 0) return "\u5E73";
      if (karmaBalance >= -100) return "\u6076";
      return "\u5927\u6076";
    }
    /**
     * 评估整体因果
     */
    evaluateOverallKarma(netKarma) {
      if (netKarma >= 1e3) return "\u529F\u5FB7\u5706\u6EE1";
      if (netKarma >= 500) return "\u529F\u5FB7\u6DF1\u539A";
      if (netKarma >= 100) return "\u5C0F\u6709\u529F\u5FB7";
      if (netKarma >= 0) return "\u65E0\u529F\u65E0\u8FC7";
      if (netKarma >= -100) return "\u6709\u4E9B\u5B7D\u503A";
      if (netKarma >= -500) return "\u7F6A\u5B7D\u6DF1\u91CD";
      return "\u6076\u8D2F\u6EE1\u76C8";
    }
    /**
     * 获取因果等级
     */
    getKarmaLevel(netKarma) {
      if (netKarma >= 1e3) return "SS";
      if (netKarma >= 500) return "S";
      if (netKarma >= 200) return "A";
      if (netKarma >= 50) return "B";
      if (netKarma >= 0) return "C";
      return "D";
    }
    /**
     * 获取因果行为默认描述
     */
    getDefaultKarmaDesc(type, action) {
      const goodDesc = {
        "rescue": "\u6551\u52A9\u751F\u7075",
        "charity": "\u65BD\u820D\u52A9\u4EBA",
        "honest": "\u8BDA\u5B9E\u5B88\u4FE1",
        "medicine": "\u884C\u533B\u6551\u4EBA",
        "protect": "\u4FDD\u62A4\u5F31\u8005"
      };
      const badDesc = {
        "kill": "\u6740\u5BB3\u751F\u7075",
        "steal": "\u5077\u76D7\u62A2\u52AB",
        "lie": "\u6B3A\u9A97\u8C0E\u8A00",
        "harm": "\u4F24\u5BB3\u4ED6\u4EBA",
        "betray": "\u80CC\u4FE1\u5F03\u4E49"
      };
      const desc = action === "good" ? goodDesc : badDesc;
      return desc[type] || (action === "good" ? "\u5584\u884C" : "\u6076\u884C");
    }
    /**
     * 获取天道事件默认描述
     */
    getDefaultTiandaoDesc(eventType) {
      const tiandaoEvents = {
        "breakthrough": "\u7A81\u7834\u5883\u754C",
        "fly": "\u98DE\u5347",
        "tribulation": "\u6E21\u52AB\u6210\u529F",
        "merit": "\u79EF\u7D2F\u529F\u5FB7",
        "serendipity": "\u5947\u9047",
        "alchemy": "\u70BC\u4E39\u6210\u529F"
      };
      return tiandaoEvents[eventType] || "\u5929\u9053\u8FD0\u884C";
    }
    /**
     * 计算因果加成
     */
    calculateKarmaBonus(netKarma) {
      if (netKarma >= 1e3) return { type: "cultivationSpeed", value: 0.3 };
      if (netKarma >= 500) return { type: "cultivationSpeed", value: 0.2 };
      if (netKarma >= 100) return { type: "cultivationSpeed", value: 0.1 };
      return { type: "cultivationSpeed", value: 0 };
    }
    /**
     * 计算天劫难度修正
     */
    calculateTribulationModifier(netKarma) {
      if (netKarma >= 1e3) return -0.3;
      if (netKarma >= 500) return -0.2;
      if (netKarma >= 100) return -0.1;
      if (netKarma < 0) return Math.min(0.5, Math.abs(netKarma) / 1e3);
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
      if (merit >= 1e3) return "SSS";
      if (merit >= 500) return "SS";
      if (merit >= 200) return "S";
      if (merit >= 100) return "A";
      if (merit >= 50) return "B";
      return "C";
    }
    /**
     * 应用赐福效果
     */
    applyBlessingEffects(blessing) {
      return blessing;
    }
    /**
     * 生成文本报告
     */
    generateTextReport(data) {
      const lines = [
        "========== \u8F6E\u56DE\u7C3F\u5929\u9053\u8BB0\u5F55 ==========",
        `\u5BFC\u51FA\u65F6\u95F4\uFF1A${data.meta.exportTime}`,
        `\u73A9\u5BB6\uFF1A${data.meta.playerName}`,
        `\u7248\u672C\uFF1A${data.meta.gameVersion}`,
        "",
        "---------- \u8F6C\u4E16\u7EDF\u8BA1 ----------",
        `\u8F6E\u56DE\u6570\uFF1A${data.summary.reincarnationTimes}`,
        `\u56E0\u679C\u503C\uFF1A${data.summary.totalKarma} (\u5584${data.summary.karmaGood} / \u6076${data.summary.karmaBad})`,
        `\u5929\u9053\u529F\u5FB7\uFF1A${data.summary.tiandaoMerit}`,
        "",
        "---------- \u8F6C\u4E16\u5386\u53F2 ----------"
      ];
      for (const life of data.reincarnationHistory || []) {
        lines.push(`\u7B2C${life.times || "?"}\u4E16\uFF1A\u5883\u754C${this.getRealmName(life.realmAtDeath)}\uFF0C\u56E0\u679C${life.karmaBalance || 0}\uFF0C${life.causeOfDeath || "\u6B7B\u56E0\u4E0D\u660E"}`);
      }
      lines.push("");
      lines.push("================================");
      return lines.join("\n");
    }
  };
  var reincarnationBookService = new ReincarnationBookService();

  // src/domains/reincarnation/services/DharmaFruitService.js
  var DHARMA_TYPES = {
    \u6CD5: "\u6CD5",
    // 法之道果
    \u9053: "\u9053",
    // 道之道果
    \u4F53: "\u4F53",
    // 体之道果
    \u795E: "\u795E",
    // 神之道果
    \u5FC3: "\u5FC3"
    // 心之道果
  };
  var DHARMA_LEVELS = {
    \u521D: "\u521D",
    // 初级
    \u4E2D: "\u4E2D",
    // 中级
    \u9AD8: "\u9AD8",
    // 高级
    \u5706\u6EE1: "\u5706\u6EE1"
    // 圆满级
  };
  var DHARMA_FRUITS = {
    \u6CD5: {
      name: "\u6CD5\u4E4B\u9053\u679C",
      description: "\u8574\u542B\u65E0\u4E0A\u6CD5\u95E8\uFF0C\u4FEE\u70BC\u901F\u5EA6\u5927\u5E45\u63D0\u5347",
      baseEffect: { cultivationSpeed: 0.1 },
      levelEffects: [
        { cultivationSpeed: 0.1 },
        { cultivationSpeed: 0.2 },
        { cultivationSpeed: 0.35 },
        { cultivationSpeed: 0.5 }
      ]
    },
    \u9053: {
      name: "\u9053\u4E4B\u9053\u679C",
      description: "\u8574\u542B\u5929\u5730\u5927\u9053\uFF0C\u5BF9\u5929\u9053\u611F\u609F\u52A0\u6DF1",
      baseEffect: { tiandaoMerit: 1 },
      levelEffects: [
        { tiandaoMerit: 1 },
        { tiandaoMerit: 3 },
        { tiandaoMerit: 6 },
        { tiandaoMerit: 10 }
      ]
    },
    \u4F53: {
      name: "\u4F53\u4E4B\u9053\u679C",
      description: "\u5F3A\u5316\u8089\u8EAB\uFF0C\u4F53\u529B\u4E0E\u9632\u5FA1\u63D0\u5347",
      baseEffect: { defense: 0.1, maxEnergy: 10 },
      levelEffects: [
        { defense: 0.1, maxEnergy: 10 },
        { defense: 0.2, maxEnergy: 25 },
        { defense: 0.35, maxEnergy: 50 },
        { defense: 0.5, maxEnergy: 100 }
      ]
    },
    \u795E: {
      name: "\u795E\u4E4B\u9053\u679C",
      description: "\u6ECB\u517B\u795E\u9B42\uFF0C\u795E\u8BC6\u4E0E\u611F\u77E5\u63D0\u5347",
      baseEffect: { perception: 0.1, spiritDamage: 0.1 },
      levelEffects: [
        { perception: 0.1, spiritDamage: 0.1 },
        { perception: 0.2, spiritDamage: 0.2 },
        { perception: 0.35, spiritDamage: 0.35 },
        { perception: 0.5, spiritDamage: 0.5 }
      ]
    },
    \u5FC3: {
      name: "\u5FC3\u4E4B\u9053\u679C",
      description: "\u6DEC\u70BC\u9053\u5FC3\uFF0C\u5FC3\u5883\u4E0E\u5947\u9047\u63D0\u5347",
      baseEffect: { serendipityChance: 0.05, karmaGood: 1 },
      levelEffects: [
        { serendipityChance: 0.05, karmaGood: 1 },
        { serendipityChance: 0.1, karmaGood: 3 },
        { serendipityChance: 0.2, karmaGood: 6 },
        { serendipityChance: 0.35, karmaGood: 10 }
      ]
    }
  };
  var FUSION_RECIPES = {
    "\u6CD5+\u9053": { result: "\u9053", bonus: { cultivationSpeed: 0.15 } },
    "\u6CD5+\u4F53": { result: "\u4F53", bonus: { defense: 0.15 } },
    "\u6CD5+\u795E": { result: "\u795E", bonus: { spiritDamage: 0.15 } },
    "\u6CD5+\u5FC3": { result: "\u5FC3", bonus: { serendipityChance: 0.1 } },
    "\u9053+\u4F53": { result: "\u4F53", bonus: { maxEnergy: 20 } },
    "\u9053+\u795E": { result: "\u795E", bonus: { perception: 0.15 } },
    "\u9053+\u5FC3": { result: "\u5FC3", bonus: { tiandaoMerit: 2 } },
    "\u4F53+\u795E": { result: "\u795E", bonus: { defense: 0.1, spiritDamage: 0.1 } },
    "\u4F53+\u5FC3": { result: "\u5FC3", bonus: { maxEnergy: 15, serendipityChance: 0.05 } },
    "\u795E+\u5FC3": { result: "\u795E", bonus: { perception: 0.1, spiritDamage: 0.1 } }
  };
  var DharmaFruitService = class {
    constructor() {
      this.gameState = null;
      this.dharmaFruits = [];
      this.maxFruits = 10;
      this.ultimateUnlocked = false;
    }
    /**
     * 初始化道果系统
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.dharmaFruit) {
        gameState3.dharmaFruit = {
          fruits: [],
          inheritedFruits: [],
          ultimateUnlocked: false,
          totalFruitsClaimed: 0,
          fruitsCombined: 0,
          lastReincarnationAt: null
        };
      }
      this.dharmaFruits = gameState3.dharmaFruit.fruits;
      this.ultimateUnlocked = gameState3.dharmaFruit.ultimateUnlocked;
      return gameState3;
    }
    /**
     * 生成唯一ID
     */
    generateId() {
      return `df_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 获取道果等级索引
     */
    getLevelIndex(level) {
      const levelMap = { "\u521D": 0, "\u4E2D": 1, "\u9AD8": 2, "\u5706\u6EE1": 3 };
      return levelMap[level] ?? 0;
    }
    /**
     * 获取道果定义
     */
    getDharmaDefinition(type) {
      return DHARMA_FRUITS[type];
    }
    /**
     * 计算道果效果
     */
    calculateFruitEffects() {
      const effects = {
        cultivationSpeed: 0,
        tiandaoMerit: 0,
        defense: 0,
        maxEnergy: 0,
        perception: 0,
        spiritDamage: 0,
        serendipityChance: 0,
        karmaGood: 0
      };
      for (const fruit of this.dharmaFruits) {
        const def = DHARMA_FRUITS[fruit.type];
        if (def) {
          const levelIdx = this.getLevelIndex(fruit.level);
          const levelEffect = def.levelEffects[levelIdx];
          if (levelEffect) {
            for (const [key, value] of Object.entries(levelEffect)) {
              if (effects.hasOwnProperty(key)) {
                effects[key] += value;
              }
            }
          }
        }
      }
      return effects;
    }
    /**
     * 检查是否满足终极蜕变条件
     */
    checkUltimateCondition() {
      if (this.ultimateUnlocked) {
        return { canTrigger: false, reason: "\u7EC8\u6781\u8715\u53D8\u5DF2\u89E3\u9501" };
      }
      const typeCount = {};
      for (const fruit of this.dharmaFruits) {
        if (!typeCount[fruit.type]) {
          typeCount[fruit.type] = { count: 0, maxLevel: false };
        }
        typeCount[fruit.type].count++;
        if (fruit.level === "\u5706\u6EE1") {
          typeCount[fruit.type].maxLevel = true;
        }
      }
      const allTypes = Object.keys(DHARMA_TYPES);
      const hasAllTypes = allTypes.every((type) => {
        var _a;
        return ((_a = typeCount[type]) == null ? void 0 : _a.count) > 0;
      });
      const allMaxLevel = allTypes.every((type) => {
        var _a;
        return (_a = typeCount[type]) == null ? void 0 : _a.maxLevel;
      });
      if (hasAllTypes && allMaxLevel) {
        return { canTrigger: true, reason: "\u6240\u6709\u9053\u679C\u5DF2\u8FBE\u5706\u6EE1\uFF0C\u53EF\u89E6\u53D1\u7EC8\u6781\u8715\u53D8" };
      }
      const missingTypes = allTypes.filter((type) => {
        var _a;
        return !((_a = typeCount[type]) == null ? void 0 : _a.count);
      });
      const nonMaxTypes = allTypes.filter((type) => {
        var _a;
        return !((_a = typeCount[type]) == null ? void 0 : _a.maxLevel);
      });
      return {
        canTrigger: false,
        reason: missingTypes.length > 0 ? `\u7F3A\u5C11\u9053\u679C\u7C7B\u578B: ${missingTypes.join(", ")}` : nonMaxTypes.length > 0 ? `\u4EE5\u4E0B\u9053\u679C\u672A\u8FBE\u5706\u6EE1: ${nonMaxTypes.join(", ")}` : "\u6761\u4EF6\u672A\u6EE1\u8DB3"
      };
    }
    // ==================== MCP 工具实现 ====================
    /**
     * dharma.fruit.claim - 领取道果
     * 轮回后可以领取新的道果
     */
    mcpFruitClaim(params = {}) {
      const { type, level = "\u521D" } = params;
      if (!type || !DHARMA_TYPES[type]) {
        return {
          success: false,
          error: `\u65E0\u6548\u7684\u9053\u679C\u7C7B\u578B\uFF0C\u6709\u6548\u503C: ${Object.keys(DHARMA_TYPES).join(", ")}`
        };
      }
      if (!DHARMA_LEVELS[level]) {
        return {
          success: false,
          error: `\u65E0\u6548\u7684\u9053\u679C\u7B49\u7EA7\uFF0C\u6709\u6548\u503C: ${Object.keys(DHARMA_LEVELS).join(", ")}`
        };
      }
      const existingType = this.dharmaFruits.find((f) => f.type === type);
      if (existingType) {
        return {
          success: false,
          error: `\u5DF2\u62E5\u6709${DHARMA_FRUITS[type].name}\uFF0C\u9053\u679C\u6570\u91CF\u4E0A\u9650\u4E3A${this.maxFruits}\u4E2A`
        };
      }
      if (this.dharmaFruits.length >= this.maxFruits) {
        return {
          success: false,
          error: `\u9053\u679C\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650(${this.maxFruits}\u4E2A)\uFF0C\u8BF7\u5148\u878D\u5408\u6216\u4F20\u627F\u65E7\u9053\u679C`
        };
      }
      const fruit = {
        id: this.generateId(),
        type,
        level,
        acquiredAt: Date.now(),
        effects: DHARMA_FRUITS[type].levelEffects[this.getLevelIndex(level)]
      };
      this.dharmaFruits.push(fruit);
      this.gameState.dharmaFruit.totalFruitsClaimed++;
      return {
        success: true,
        message: `\u6210\u529F\u9886\u53D6${DHARMA_FRUITS[type].name}[${level}]`,
        fruit: {
          id: fruit.id,
          type: fruit.type,
          level: fruit.level,
          name: DHARMA_FRUITS[type].name,
          description: DHARMA_FRUITS[type].description,
          effects: fruit.effects
        },
        currentFruits: this.dharmaFruits.map((f) => ({
          id: f.id,
          type: f.type,
          level: f.level,
          name: DHARMA_FRUITS[f.type].name
        })),
        totalClaimed: this.gameState.dharmaFruit.totalFruitsClaimed
      };
    }
    /**
     * dharma.fruit.inherit - 传承道果
     * 轮回时可以选择传承道果
     */
    mcpFruitInherit(params = {}) {
      const { fruitId, inheritLevel = "\u4E2D" } = params;
      const fruit = this.dharmaFruits.find((f) => f.id === fruitId);
      if (!fruit) {
        return {
          success: false,
          error: "\u672A\u627E\u5230\u6307\u5B9A\u9053\u679C"
        };
      }
      if (!DHARMA_LEVELS[inheritLevel]) {
        return {
          success: false,
          error: `\u65E0\u6548\u7684\u4F20\u627F\u7B49\u7EA7\uFF0C\u6709\u6548\u503C: ${Object.keys(DHARMA_LEVELS).join(", ")}`
        };
      }
      const currentLevelIdx = this.getLevelIndex(fruit.level);
      const inheritLevelIdx = this.getLevelIndex(inheritLevel);
      if (inheritLevelIdx < currentLevelIdx) {
        return {
          success: false,
          error: `\u4F20\u627F\u7B49\u7EA7(${inheritLevel})\u4E0D\u80FD\u4F4E\u4E8E\u5F53\u524D\u7B49\u7EA7(${fruit.level})`
        };
      }
      const inheritedFruit = {
        id: this.generateId(),
        type: fruit.type,
        level: inheritLevel,
        inheritedFrom: fruit.id,
        inheritedAt: Date.now(),
        effects: DHARMA_FRUITS[fruit.type].levelEffects[inheritLevelIdx]
      };
      this.gameState.dharmaFruit.inheritedFruits.push(inheritedFruit);
      this.dharmaFruits = this.dharmaFruits.filter((f) => f.id !== fruitId);
      return {
        success: true,
        message: `${DHARMA_FRUITS[fruit.type].name}\u5DF2\u4F20\u627F\u4E3A[${inheritLevel}]\u7EA7`,
        inheritedFruit: {
          id: inheritedFruit.id,
          type: inheritedFruit.type,
          level: inheritedFruit.level,
          name: DHARMA_FRUITS[inheritedFruit.type].name,
          effects: inheritedFruit.effects
        },
        remainingFruits: this.dharmaFruits.map((f) => ({
          id: f.id,
          type: f.type,
          level: f.level,
          name: DHARMA_FRUITS[f.type].name
        }))
      };
    }
    /**
     * dharma.fruit.upgrade - 升级道果
     * 将道果从当前等级提升到下一等级
     */
    mcpFruitUpgrade(params = {}) {
      var _a;
      const { fruitId, useMerit = false } = params;
      const fruit = this.dharmaFruits.find((f) => f.id === fruitId);
      if (!fruit) {
        return {
          success: false,
          error: "\u672A\u627E\u5230\u6307\u5B9A\u9053\u679C"
        };
      }
      if (fruit.level === "\u5706\u6EE1") {
        return {
          success: false,
          error: `${DHARMA_FRUITS[fruit.type].name}\u5DF2\u8FBE\u5706\u6EE1\u7B49\u7EA7\uFF0C\u65E0\u6CD5\u7EE7\u7EED\u5347\u7EA7`
        };
      }
      const levelCosts = { "\u521D": 10, "\u4E2D": 30, "\u9AD8": 60 };
      const currentLevelIdx = this.getLevelIndex(fruit.level);
      const cost = levelCosts[fruit.level];
      if (useMerit) {
        const currentMerit = ((_a = this.gameState.player) == null ? void 0 : _a.karmaPoints) || 0;
        if (currentMerit < cost) {
          return {
            success: false,
            error: `\u5929\u9053\u529F\u5FB7\u4E0D\u8DB3\uFF0C\u9700\u8981${cost}\u70B9\uFF0C\u5F53\u524D${currentMerit}\u70B9`
          };
        }
        this.gameState.player.karmaPoints -= cost;
      }
      const levels = ["\u521D", "\u4E2D", "\u9AD8", "\u5706\u6EE1"];
      fruit.level = levels[currentLevelIdx + 1];
      fruit.effects = DHARMA_FRUITS[fruit.type].levelEffects[currentLevelIdx + 1];
      fruit.upgradedAt = Date.now();
      return {
        success: true,
        message: `${DHARMA_FRUITS[fruit.type].name}\u5DF2\u5347\u7EA7\u81F3[${fruit.level}]`,
        fruit: {
          id: fruit.id,
          type: fruit.type,
          level: fruit.level,
          name: DHARMA_FRUITS[fruit.type].name,
          effects: fruit.effects
        },
        totalEffects: this.calculateFruitEffects()
      };
    }
    /**
     * dharma.fruit.query - 查询道果状态
     * 查看当前所有道果及效果
     */
    mcpFruitQuery(params = {}) {
      const { fruitId, includeEffects = true } = params;
      if (fruitId) {
        const fruit = this.dharmaFruits.find((f) => f.id === fruitId);
        if (!fruit) {
          return {
            success: false,
            error: "\u672A\u627E\u5230\u6307\u5B9A\u9053\u679C"
          };
        }
        return {
          success: true,
          fruit: {
            id: fruit.id,
            type: fruit.type,
            level: fruit.level,
            name: DHARMA_FRUITS[fruit.type].name,
            description: DHARMA_FRUITS[fruit.type].description,
            effects: fruit.effects,
            acquiredAt: fruit.acquiredAt,
            upgradedAt: fruit.upgradedAt
          },
          totalEffects: includeEffects ? this.calculateFruitEffects() : null,
          ultimateCondition: this.checkUltimateCondition()
        };
      }
      return {
        success: true,
        fruits: this.dharmaFruits.map((f) => ({
          id: f.id,
          type: f.type,
          level: f.level,
          name: DHARMA_FRUITS[f.type].name,
          description: DHARMA_FRUITS[f.type].description,
          effects: includeEffects ? f.effects : null,
          acquiredAt: f.acquiredAt,
          upgradedAt: f.upgradedAt
        })),
        totalEffects: includeEffects ? this.calculateFruitEffects() : null,
        stats: {
          totalFruits: this.dharmaFruits.length,
          maxFruits: this.maxFruits,
          totalClaimed: this.gameState.dharmaFruit.totalFruitsClaimed,
          totalCombined: this.gameState.dharmaFruit.fruitsCombined,
          inheritedCount: this.gameState.dharmaFruit.inheritedFruits.length,
          ultimateUnlocked: this.ultimateUnlocked
        },
        ultimateCondition: this.checkUltimateCondition(),
        availableTypes: Object.keys(DHARMA_TYPES).filter(
          (type) => !this.dharmaFruits.some((f) => f.type === type)
        )
      };
    }
    /**
     * dharma.transformation.trigger - 触发终极蜕变
     * 当所有道果都达到圆满时触发
     */
    mcpTransformationTrigger(params = {}) {
      var _a;
      const { force = false } = params;
      const condition = this.checkUltimateCondition();
      if (!condition.canTrigger) {
        if (!force) {
          return {
            success: false,
            error: `\u65E0\u6CD5\u89E6\u53D1\u7EC8\u6781\u8715\u53D8: ${condition.reason}`
          };
        }
        const meritCost = 500;
        const currentMerit = ((_a = this.gameState.player) == null ? void 0 : _a.karmaPoints) || 0;
        if (currentMerit < meritCost) {
          return {
            success: false,
            error: `\u5F3A\u5236\u89E6\u53D1\u9700\u8981${meritCost}\u70B9\u5929\u9053\u529F\u5FB7\uFF0C\u5F53\u524D${currentMerit}\u70B9`
          };
        }
        this.gameState.player.karmaPoints -= meritCost;
      }
      this.ultimateUnlocked = true;
      this.gameState.dharmaFruit.ultimateUnlocked = true;
      const ultimateBonus = {
        cultivationSpeed: 1,
        // 修炼速度翻倍
        allAttributes: 0.5,
        // 全属性+50%
        serendipityChance: 0.5,
        // 奇遇率+50%
        tiandaoMerit: 20,
        // 天道功德+20
        maxEnergy: 200,
        // 体力上限+200
        perception: 1,
        // 感知翻倍
        spiritDamage: 1
        // 神识伤害翻倍
      };
      if (this.gameState.player) {
        this.gameState.player.cultivationSpeedBonus = (this.gameState.player.cultivationSpeedBonus || 0) + ultimateBonus.cultivationSpeed;
        this.gameState.player.serendipityChanceBonus = (this.gameState.player.serendipityChanceBonus || 0) + ultimateBonus.serendipityChance;
        this.gameState.player.karmaPoints = (this.gameState.player.karmaPoints || 0) + ultimateBonus.tiandaoMerit;
        this.gameState.player.maxEnergy = (this.gameState.player.maxEnergy || 100) + ultimateBonus.maxEnergy;
      }
      return {
        success: true,
        message: "\u606D\u559C\uFF01\u7EC8\u6781\u8715\u53D8\u5DF2\u89E6\u53D1\uFF01\u60A8\u5DF2\u5316\u8EAB\u4E3A\u7EC8\u6781\u5B58\u5728\uFF01",
        ultimateForm: {
          name: "\u7EC8\u6781\u5F62\u6001",
          description: "\u6240\u6709\u9053\u679C\u5706\u6EE1\uFF0C\u5316\u8EAB\u7EC8\u6781\u5B58\u5728",
          bonus: ultimateBonus,
          unlockedAt: Date.now()
        },
        playerBonuses: {
          cultivationSpeedBonus: ultimateBonus.cultivationSpeed,
          serendipityChanceBonus: ultimateBonus.serendipityChance,
          karmaPointsBonus: ultimateBonus.tiandaoMerit,
          maxEnergyBonus: ultimateBonus.maxEnergy,
          perceptionBonus: ultimateBonus.perception,
          spiritDamageBonus: ultimateBonus.spiritDamage
        },
        totalEffects: this.calculateFruitEffects()
      };
    }
    /**
     * dharma.fruit.combine - 融合道果
     * 将两个道果融合，产生新的道果或加成效果
     */
    mcpFruitCombine(params = {}) {
      const { fruitId1, fruitId2 } = params;
      if (!fruitId1 || !fruitId2) {
        return {
          success: false,
          error: "\u8BF7\u63D0\u4F9B\u4E24\u4E2A\u9053\u679C\u7684ID"
        };
      }
      if (fruitId1 === fruitId2) {
        return {
          success: false,
          error: "\u8BF7\u9009\u62E9\u4E24\u4E2A\u4E0D\u540C\u7684\u9053\u679C\u8FDB\u884C\u878D\u5408"
        };
      }
      const fruit1 = this.dharmaFruits.find((f) => f.id === fruitId1);
      const fruit2 = this.dharmaFruits.find((f) => f.id === fruitId2);
      if (!fruit1) {
        return {
          success: false,
          error: `\u672A\u627E\u5230ID\u4E3A${fruitId1}\u7684\u9053\u679C`
        };
      }
      if (!fruit2) {
        return {
          success: false,
          error: `\u672A\u627E\u5230ID\u4E3A${fruitId2}\u7684\u9053\u679C`
        };
      }
      const key1 = `${fruit1.type}+${fruit2.type}`;
      const key2 = `${fruit2.type}+${fruit1.type}`;
      const recipe = FUSION_RECIPES[key1] || FUSION_RECIPES[key2];
      if (!recipe) {
        return {
          success: false,
          error: `${DHARMA_FRUITS[fruit1.type].name}\u548C${DHARMA_FRUITS[fruit2.type].name}\u65E0\u6CD5\u878D\u5408`
        };
      }
      const newFruit = {
        id: this.generateId(),
        type: recipe.result,
        level: "\u521D",
        combinedFrom: [fruit1.id, fruit2.id],
        combinedAt: Date.now(),
        effects: DHARMA_FRUITS[recipe.result].levelEffects[0],
        bonusEffects: recipe.bonus
      };
      this.dharmaFruits = this.dharmaFruits.filter(
        (f) => f.id !== fruitId1 && f.id !== fruitId2
      );
      this.dharmaFruits.push(newFruit);
      this.gameState.dharmaFruit.fruitsCombined++;
      return {
        success: true,
        message: `${DHARMA_FRUITS[fruit1.type].name}\u548C${DHARMA_FRUITS[fruit2.type].name}\u878D\u5408\u6210\u529F\uFF01`,
        newFruit: {
          id: newFruit.id,
          type: newFruit.type,
          level: newFruit.level,
          name: DHARMA_FRUITS[newFruit.type].name,
          description: DHARMA_FRUITS[newFruit.type].description,
          effects: newFruit.effects,
          bonusEffects: newFruit.bonusEffects
        },
        remainingFruits: this.dharmaFruits.map((f) => ({
          id: f.id,
          type: f.type,
          level: f.level,
          name: DHARMA_FRUITS[f.type].name
        })),
        totalEffects: this.calculateFruitEffects()
      };
    }
    /**
     * 获取道果统计信息
     */
    getStats() {
      var _a, _b, _c, _d;
      return {
        totalFruits: this.dharmaFruits.length,
        maxFruits: this.maxFruits,
        totalClaimed: ((_a = this.gameState.dharmaFruit) == null ? void 0 : _a.totalFruitsClaimed) || 0,
        totalCombined: ((_b = this.gameState.dharmaFruit) == null ? void 0 : _b.fruitsCombined) || 0,
        inheritedCount: ((_d = (_c = this.gameState.dharmaFruit) == null ? void 0 : _c.inheritedFruits) == null ? void 0 : _d.length) || 0,
        ultimateUnlocked: this.ultimateUnlocked,
        fruitsByType: this.dharmaFruits.reduce((acc, f) => {
          acc[f.type] = (acc[f.type] || 0) + 1;
          return acc;
        }, {}),
        fruitsByLevel: this.dharmaFruits.reduce((acc, f) => {
          acc[f.level] = (acc[f.level] || 0) + 1;
          return acc;
        }, {})
      };
    }
  };
  var dharmaFruitService = new DharmaFruitService();
  function createDharmaFruitMCPHandlers(gameState3) {
    const service = new DharmaFruitService();
    service.init(gameState3);
    return {
      "dharma.fruit.claim": (params) => service.mcpFruitClaim(params),
      "dharma.fruit.inherit": (params) => service.mcpFruitInherit(params),
      "dharma.fruit.upgrade": (params) => service.mcpFruitUpgrade(params),
      "dharma.fruit.query": (params) => service.mcpFruitQuery(params),
      "dharma.transformation.trigger": (params) => service.mcpTransformationTrigger(params),
      "dharma.fruit.combine": (params) => service.mcpFruitCombine(params)
    };
  }
  var DHARMA_FRUITS_TOOLS = {
    "dharma.fruit.claim": {
      name: "dharma.fruit.claim",
      description: "Claim a dharma fruit after reincarnation",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["\u6CD5", "\u9053", "\u4F53", "\u795E", "\u5FC3"],
            description: "Dharma fruit type"
          },
          level: {
            type: "string",
            enum: ["\u521D", "\u4E2D", "\u9AD8", "\u5706\u6EE1"],
            description: "Dharma fruit level",
            default: "\u521D"
          }
        },
        required: ["type"]
      }
    },
    "dharma.fruit.inherit": {
      name: "dharma.fruit.inherit",
      description: "Inherit a dharma fruit during reincarnation",
      inputSchema: {
        type: "object",
        properties: {
          fruitId: { type: "string", description: "ID of the fruit to inherit" },
          inheritLevel: {
            type: "string",
            enum: ["\u521D", "\u4E2D", "\u9AD8", "\u5706\u6EE1"],
            description: "Inheritance level",
            default: "\u4E2D"
          }
        },
        required: ["fruitId"]
      }
    },
    "dharma.fruit.upgrade": {
      name: "dharma.fruit.upgrade",
      description: "Upgrade a dharma fruit to the next level",
      inputSchema: {
        type: "object",
        properties: {
          fruitId: { type: "string", description: "ID of the fruit to upgrade" },
          useMerit: { type: "boolean", description: "Use tiandao merit for upgrade" }
        },
        required: ["fruitId"]
      }
    },
    "dharma.fruit.query": {
      name: "dharma.fruit.query",
      description: "Query dharma fruit status and effects",
      inputSchema: {
        type: "object",
        properties: {
          fruitId: { type: "string", description: "Specific fruit ID to query" },
          includeEffects: { type: "boolean", description: "Include effects in response", default: true }
        }
      }
    },
    "dharma.transformation.trigger": {
      name: "dharma.transformation.trigger",
      description: "Trigger ultimate transformation when all fruits reach max level",
      inputSchema: {
        type: "object",
        properties: {
          force: { type: "boolean", description: "Force trigger (requires 500 merit)" }
        }
      }
    },
    "dharma.fruit.combine": {
      name: "dharma.fruit.combine",
      description: "Combine two dharma fruits to create a new one",
      inputSchema: {
        type: "object",
        properties: {
          fruitId1: { type: "string", description: "ID of first fruit" },
          fruitId2: { type: "string", description: "ID of second fruit" }
        },
        required: ["fruitId1", "fruitId2"]
      }
    }
  };

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

  // src/domains/cultivation/services/AscensionService.js
  init_CultivationService();

  // src/domains/cultivation/services/YuanInfantService.js
  init_CultivationService();
  var YUAN_INFANT_REQUIREMENTS = {
    minRealm: 5,
    // 化神境 (realm=5)
    minSpiritEnergy: 500,
    // 最低灵力要求
    formCost: 1e3,
    // 凝聚元婴消耗
    separationDuration: 36e5,
    // 分离持续时间 (1小时)
    projectionRange: 1e3,
    // 投射范围 (里)
    projectionCost: 200
    // 投射消耗灵力
  };
  var YUAN_INFANT_STATES = {
    NONE: "none",
    // 未形成
    FORMING: "forming",
    // 凝聚中
    FORMED: "formed",
    // 已形成
    SEPARATED: "separated",
    // 已分离
    PROJECTING: "projecting",
    // 星体投射中
    SYNCHRONIZING: "synchronizing"
    // 同步中
  };
  var YUAN_INFANT_ATTRIBUTES = {
    spiritualPower: { name: "\u7CBE\u795E\u529B", base: 100, growth: 20 },
    perceptionRange: { name: "\u611F\u77E5\u8303\u56F4", base: 50, growth: 10 },
    syncRate: { name: "\u540C\u6B65\u7387", base: 100, growth: 0 }
  };
  var YuanInfantService = class _YuanInfantService {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.yuanInfantState = null;
    }
    /**
     * 初始化元婴系统
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 初始化后的游戏状态
     */
    init(gameState3) {
      if (!gameState3.yuanInfant) {
        gameState3.yuanInfant = {
          state: YUAN_INFANT_STATES.NONE,
          spiritualPower: 0,
          perceptionRange: 0,
          syncRate: 100,
          formationTime: null,
          separationTime: null,
          separationEndTime: null,
          projectionTarget: null,
          projectionInfo: [],
          lastSyncTime: null,
          history: []
        };
      }
      this.yuanInfantState = gameState3.yuanInfant;
      return gameState3;
    }
    /**
     * 记录历史事件
     */
    recordHistory(action, details) {
      if (!this.yuanInfantState.history) {
        this.yuanInfantState.history = [];
      }
      this.yuanInfantState.history.push({
        action,
        details,
        timestamp: Date.now()
      });
      if (this.yuanInfantState.history.length > 50) {
        this.yuanInfantState.history = this.yuanInfantState.history.slice(-50);
      }
    }
    /**
     * 检查是否满足凝聚元婴条件
     * @returns {Object} 条件检查结果
     */
    checkFormationRequirements() {
      const gs = this.gameState;
      const requirements = [];
      const realmMet = (gs.realm || 0) >= YUAN_INFANT_REQUIREMENTS.minRealm;
      requirements.push({
        type: "realm",
        desc: `\u5883\u754C\u8FBE\u5230\u5316\u795E\u5883 (realm\u2265${YUAN_INFANT_REQUIREMENTS.minRealm})`,
        met: realmMet,
        current: gs.realm || 0,
        required: YUAN_INFANT_REQUIREMENTS.minRealm
      });
      const spiritEnergyMet = (gs.spiritEnergy || 0) >= YUAN_INFANT_REQUIREMENTS.minSpiritEnergy;
      requirements.push({
        type: "spiritEnergy",
        desc: `\u7075\u529B\u8FBE\u5230${YUAN_INFANT_REQUIREMENTS.minSpiritEnergy}`,
        met: spiritEnergyMet,
        current: gs.spiritEnergy || 0,
        required: YUAN_INFANT_REQUIREMENTS.minSpiritEnergy
      });
      const spiritStonesMet = (gs.spiritStones || 0) >= YUAN_INFANT_REQUIREMENTS.formCost;
      requirements.push({
        type: "spiritStones",
        desc: `\u62E5\u6709\u81F3\u5C11${YUAN_INFANT_REQUIREMENTS.formCost}\u7075\u77F3`,
        met: spiritStonesMet,
        current: gs.spiritStones || 0,
        required: YUAN_INFANT_REQUIREMENTS.formCost
      });
      const notFormed = this.yuanInfantState.state === YUAN_INFANT_STATES.NONE;
      requirements.push({
        type: "notFormed",
        desc: "\u5143\u5A74\u5C1A\u672A\u5F62\u6210",
        met: notFormed,
        current: this.yuanInfantState.state,
        required: YUAN_INFANT_STATES.NONE
      });
      const metCount = requirements.filter((r) => r.met).length;
      const allMet = metCount === requirements.length;
      return {
        success: true,
        canForm: allMet,
        requirementsMet: metCount,
        requirementsTotal: requirements.length,
        requirements
      };
    }
    /**
     * 凝聚元婴 (yuaninfant.form)
     * @param {Object} params - 可选参数
     * @returns {Object} 凝聚结果
     */
    formYuanInfant(params = {}) {
      var _a;
      if (this.yuanInfantState.state !== YUAN_INFANT_STATES.NONE) {
        return {
          success: false,
          error: "\u5143\u5A74\u5DF2\u7ECF\u5F62\u6210\uFF0C\u65E0\u6CD5\u518D\u6B21\u51DD\u805A",
          currentState: this.yuanInfantState.state
        };
      }
      const reqCheck = this.checkFormationRequirements();
      if (!reqCheck.canForm) {
        const unmet = reqCheck.requirements.filter((r) => !r.met).map((r) => r.desc);
        return {
          success: false,
          error: "\u51DD\u805A\u5143\u5A74\u6761\u4EF6\u672A\u6EE1\u8DB3",
          unmetRequirements: unmet,
          requirementsCheck: reqCheck
        };
      }
      const cost = YUAN_INFANT_REQUIREMENTS.formCost;
      this.gameState.spiritStones -= cost;
      this.yuanInfantState.state = YUAN_INFANT_STATES.FORMING;
      const realm = this.gameState.realm || 5;
      const spiritRootTier = ((_a = this.gameState.spiritRoot) == null ? void 0 : _a.tier) || 1;
      const baseSp = YUAN_INFANT_ATTRIBUTES.spiritualPower.base + realm * YUAN_INFANT_ATTRIBUTES.spiritualPower.growth;
      const basePr = YUAN_INFANT_ATTRIBUTES.perceptionRange.base + realm * YUAN_INFANT_ATTRIBUTES.perceptionRange.growth;
      this.yuanInfantState.spiritualPower = Math.floor(baseSp * (1 + spiritRootTier * 0.1));
      this.yuanInfantState.perceptionRange = Math.floor(basePr * (1 + spiritRootTier * 0.1));
      this.yuanInfantState.syncRate = YUAN_INFANT_ATTRIBUTES.syncRate.base;
      this.yuanInfantState.formationTime = Date.now();
      this.gameState.spiritEnergy = Math.max(0, (this.gameState.spiritEnergy || 0) - YUAN_INFANT_REQUIREMENTS.minSpiritEnergy);
      this.recordHistory("form", {
        spiritualPower: this.yuanInfantState.spiritualPower,
        perceptionRange: this.yuanInfantState.perceptionRange,
        cost
      });
      return {
        success: true,
        message: "\u5143\u5A74\u51DD\u805A\u6210\u529F\uFF01\u606D\u559C\u8E0F\u5165\u5143\u5A74\u5883\uFF01",
        yuanInfant: {
          state: YUAN_INFANT_STATES.FORMED,
          spiritualPower: this.yuanInfantState.spiritualPower,
          perceptionRange: this.yuanInfantState.perceptionRange,
          syncRate: this.yuanInfantState.syncRate,
          formationTime: this.yuanInfantState.formationTime
        },
        costDeducted: cost
      };
    }
    /**
     * 灵魂分离 (yuaninfant.separate)
     * @param {Object} params - { duration?: number } 分离持续时间(ms)
     * @returns {Object} 分离结果
     */
    separateSoul(params = {}) {
      if (this.yuanInfantState.state === YUAN_INFANT_STATES.NONE) {
        return {
          success: false,
          error: "\u5143\u5A74\u5C1A\u672A\u5F62\u6210\uFF0C\u65E0\u6CD5\u8FDB\u884C\u7075\u9B42\u5206\u79BB"
        };
      }
      if (this.yuanInfantState.state === YUAN_INFANT_STATES.SEPARATED) {
        return {
          success: false,
          error: "\u5143\u5A74\u5DF2\u7ECF\u5206\u79BB\uFF0C\u8BF7\u5148\u53EC\u56DE"
        };
      }
      if (this.yuanInfantState.state === YUAN_INFANT_STATES.PROJECTING) {
        return {
          success: false,
          error: "\u6B63\u5728\u8FDB\u884C\u661F\u4F53\u6295\u5C04\uFF0C\u8BF7\u5148\u7ED3\u675F\u6295\u5C04"
        };
      }
      const duration = params.duration || YUAN_INFANT_REQUIREMENTS.separationDuration;
      const now = Date.now();
      const spiritualPower = this.yuanInfantState.spiritualPower || 100;
      const baseSuccessRate = 0.7 + spiritualPower / 1e3;
      const syncRate = (this.yuanInfantState.syncRate || 100) / 100;
      const successRate = Math.min(0.95, baseSuccessRate * syncRate);
      const roll = Math.random();
      const success = roll < successRate;
      if (!success) {
        this.recordHistory("separate_failed", {
          successRate: (successRate * 100).toFixed(1) + "%",
          roll: (roll * 100).toFixed(1) + "%"
        });
        return {
          success: true,
          result: "failed",
          message: "\u7075\u9B42\u5206\u79BB\u5931\u8D25\uFF01\u7CBE\u795E\u529B\u4E0D\u8DB3\u4EE5\u652F\u6491\u5206\u79BB",
          successRate: (successRate * 100).toFixed(1) + "%",
          tip: "\u63D0\u5347\u7CBE\u795E\u529B\u6216\u540C\u6B65\u7387\u540E\u53EF\u518D\u6B21\u5C1D\u8BD5"
        };
      }
      this.yuanInfantState.state = YUAN_INFANT_STATES.SEPARATED;
      this.yuanInfantState.separationTime = now;
      this.yuanInfantState.separationEndTime = now + duration;
      this.gameState.playerStatus = this.gameState.playerStatus || {};
      this.gameState.playerStatus.dormant = true;
      this.gameState.playerStatus.dormantUntil = now + duration;
      this.recordHistory("separate", {
        duration,
        spiritualPower,
        syncRate: this.yuanInfantState.syncRate
      });
      return {
        success: true,
        result: "success",
        message: "\u7075\u9B42\u5206\u79BB\u6210\u529F\uFF01\u5143\u5A74\u5DF2\u51FA\u7A8D",
        separation: {
          startTime: now,
          endTime: now + duration,
          duration,
          spiritualPower,
          syncRate: this.yuanInfantState.syncRate
        },
        warning: "\u672C\u4F53\u8FDB\u5165\u4F11\u7720\u72B6\u6001\uFF0C\u8BF7\u53CA\u65F6\u53EC\u56DE\u5143\u5A74"
      };
    }
    /**
     * 星体投射 (yuaninfant.project)
     * @param {Object} params - { target?: string, range?: number }
     * @returns {Object} 投射结果
     */
    projectAstral(params = {}) {
      if (this.yuanInfantState.state === YUAN_INFANT_STATES.NONE) {
        return {
          success: false,
          error: "\u5143\u5A74\u5C1A\u672A\u5F62\u6210\uFF0C\u65E0\u6CD5\u8FDB\u884C\u661F\u4F53\u6295\u5C04"
        };
      }
      if (this.yuanInfantState.state === YUAN_INFANT_STATES.PROJECTING) {
        return {
          success: false,
          error: "\u661F\u4F53\u6295\u5C04\u5DF2\u5728\u8FDB\u884C\u4E2D"
        };
      }
      if (this.yuanInfantState.state !== YUAN_INFANT_STATES.SEPARATED) {
        return {
          success: false,
          error: "\u9700\u8981\u5148\u8FDB\u884C\u7075\u9B42\u5206\u79BB\u624D\u80FD\u8FDB\u884C\u661F\u4F53\u6295\u5C04"
        };
      }
      const cost = YUAN_INFANT_REQUIREMENTS.projectionCost;
      if ((this.gameState.spiritEnergy || 0) < cost) {
        return {
          success: false,
          error: "\u7075\u529B\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u8FDB\u884C\u661F\u4F53\u6295\u5C04"
        };
      }
      const target = params.target || "unknown";
      const range = params.range || YUAN_INFANT_REQUIREMENTS.projectionRange;
      const spiritualPower = this.yuanInfantState.spiritualPower || 100;
      const actualRange = Math.floor(range * (spiritualPower / 100));
      this.gameState.spiritEnergy = Math.max(0, (this.gameState.spiritEnergy || 0) - cost);
      const projectionInfo = {
        target,
        range: actualRange,
        spiritualPower,
        timestamp: Date.now()
      };
      this.yuanInfantState.projectionTarget = target;
      this.yuanInfantState.projectionInfo.push(projectionInfo);
      if (this.yuanInfantState.projectionInfo.length > 20) {
        this.yuanInfantState.projectionInfo = this.yuanInfantState.projectionInfo.slice(-20);
      }
      this.recordHistory("project", projectionInfo);
      const infoTypes = this.getProjectionInfoTypes(actualRange);
      return {
        success: true,
        message: `\u661F\u4F53\u6295\u5C04\u6210\u529F\uFF01\u611F\u77E5\u8303\u56F4${actualRange}\u91CC`,
        projection: {
          target,
          range: actualRange,
          spiritualPower,
          infoTypes,
          timestamp: projectionInfo.timestamp
        },
        infoTypes
      };
    }
    /**
     * 根据投射范围获取可感知的信息类型
     */
    getProjectionInfoTypes(range) {
      const types = [];
      if (range >= 100) types.push({ type: "basic", desc: "\u57FA\u7840\u73AF\u5883\u611F\u77E5" });
      if (range >= 300) types.push({ type: "spiritual", desc: "\u7075\u529B\u6CE2\u52A8\u611F\u77E5" });
      if (range >= 500) types.push({ type: "creatures", desc: "\u751F\u7269\u6C14\u606F\u611F\u77E5" });
      if (range >= 800) types.push({ type: "treasures", desc: "\u7075\u5B9D\u836F\u6750\u611F\u77E5" });
      if (range >= 1e3) types.push({ type: "secrets", desc: "\u9690\u85CF\u4FE1\u606F\u611F\u77E5" });
      return types;
    }
    /**
     * 同步元婴 (yuaninfant.sync)
     * @param {Object} params - { force?: boolean }
     * @returns {Object} 同步结果
     */
    syncYuanInfant(params = {}) {
      if (this.yuanInfantState.state === YUAN_INFANT_STATES.NONE) {
        return {
          success: false,
          error: "\u5143\u5A74\u5C1A\u672A\u5F62\u6210\uFF0C\u65E0\u6CD5\u8FDB\u884C\u540C\u6B65"
        };
      }
      const force = params.force || false;
      const currentSyncRate = this.yuanInfantState.syncRate || 100;
      const spiritualPower = this.yuanInfantState.spiritualPower || 100;
      const baseGain = 5 + Math.floor(spiritualPower / 50);
      const newSyncRate = force ? 100 : Math.min(100, currentSyncRate + baseGain);
      const oldSyncRate = this.yuanInfantState.syncRate;
      this.yuanInfantState.syncRate = newSyncRate;
      this.yuanInfantState.lastSyncTime = Date.now();
      this.recordHistory("sync", {
        oldSyncRate,
        newSyncRate,
        force,
        spiritualPower
      });
      return {
        success: true,
        message: force ? "\u5F3A\u5236\u540C\u6B65\u5B8C\u6210\uFF0C\u5143\u5A74\u4E0E\u672C\u4F53\u5B8C\u5168\u540C\u6B65" : "\u540C\u6B65\u5B8C\u6210\uFF0C\u540C\u6B65\u7387\u63D0\u5347",
        sync: {
          oldSyncRate,
          newSyncRate,
          gain: newSyncRate - oldSyncRate,
          force,
          spiritualPower
        }
      };
    }
    /**
     * 召回元婴 (yuaninfant.recall)
     * @param {Object} params - { emergency?: boolean }
     * @returns {Object} 召回结果
     */
    recallYuanInfant(params = {}) {
      if (this.yuanInfantState.state === YUAN_INFANT_STATES.NONE) {
        return {
          success: false,
          error: "\u5143\u5A74\u5C1A\u672A\u5F62\u6210\uFF0C\u65E0\u6CD5\u53EC\u56DE"
        };
      }
      if (this.yuanInfantState.state === YUAN_INFANT_STATES.FORMED) {
        return {
          success: false,
          error: "\u5143\u5A74\u5DF2\u5728\u672C\u4F53\u4E2D\uFF0C\u65E0\u9700\u53EC\u56DE"
        };
      }
      const emergency = params.emergency || false;
      const previousState = this.yuanInfantState.state;
      const syncRate = this.yuanInfantState.syncRate || 100;
      const spiritualPower = this.yuanInfantState.spiritualPower || 100;
      const recallCost = emergency ? Math.floor(spiritualPower * 0.3) : Math.floor(spiritualPower * 0.1);
      if ((this.gameState.spiritEnergy || 0) < recallCost) {
        return {
          success: false,
          error: "\u7075\u529B\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u53EC\u56DE\u5143\u5A74",
          required: recallCost,
          current: this.gameState.spiritEnergy || 0
        };
      }
      this.gameState.spiritEnergy = Math.max(0, (this.gameState.spiritEnergy || 0) - recallCost);
      if (this.gameState.playerStatus) {
        this.gameState.playerStatus.dormant = false;
        this.gameState.playerStatus.dormantUntil = null;
      }
      this.yuanInfantState.state = YUAN_INFANT_STATES.FORMED;
      this.yuanInfantState.separationTime = null;
      this.yuanInfantState.separationEndTime = null;
      this.yuanInfantState.projectionTarget = null;
      if (emergency) {
        const penalty = Math.floor(syncRate * 0.1);
        this.yuanInfantState.syncRate = Math.max(50, this.yuanInfantState.syncRate - penalty);
      }
      this.recordHistory("recall", {
        previousState,
        emergency,
        cost: recallCost,
        syncRateAfter: this.yuanInfantState.syncRate
      });
      return {
        success: true,
        message: emergency ? "\u7D27\u6025\u53EC\u56DE\u5B8C\u6210\uFF01\u5143\u5A74\u5DF2\u8FD4\u56DE\u672C\u4F53" : "\u5143\u5A74\u53EC\u56DE\u6210\u529F\uFF0C\u5DF2\u8FD4\u56DE\u672C\u4F53",
        recall: {
          previousState,
          emergency,
          cost: recallCost,
          syncRate: this.yuanInfantState.syncRate,
          penalty: emergency ? "\u540C\u6B65\u7387\u4E0B\u964D" : "\u65E0"
        }
      };
    }
    /**
     * 查询元婴状态 (yuaninfant.status)
     * @param {Object} params - { detailed?: boolean }
     * @returns {Object} 状态信息
     */
    getYuanInfantStatus(params = {}) {
      var _a, _b;
      const detailed = params.detailed || false;
      const state = this.yuanInfantState;
      const result = {
        success: true,
        state: state.state,
        stateName: this.getStateName(state.state),
        spiritualPower: state.spiritualPower || 0,
        perceptionRange: state.perceptionRange || 0,
        syncRate: state.syncRate || 100,
        isSeparated: state.state === YUAN_INFANT_STATES.SEPARATED,
        isProjecting: state.state === YUAN_INFANT_STATES.PROJECTING,
        isFormed: state.state !== YUAN_INFANT_STATES.NONE
      };
      if (detailed) {
        result.detailed = {
          formationTime: state.formationTime,
          separationTime: state.separationTime,
          separationEndTime: state.separationEndTime,
          lastSyncTime: state.lastSyncTime,
          projectionTarget: state.projectionTarget,
          projectionInfoCount: (state.projectionInfo || []).length,
          historyCount: (state.history || []).length,
          history: ((_a = state.history) == null ? void 0 : _a.slice(-10)) || []
        };
      }
      if (state.state === YUAN_INFANT_STATES.SEPARATED && state.separationEndTime) {
        const remaining = Math.max(0, state.separationEndTime - Date.now());
        result.separationRemaining = remaining;
        result.separationRemainingStr = this.formatDuration(remaining);
      }
      if ((_b = this.gameState.playerStatus) == null ? void 0 : _b.dormant) {
        result.bodyStatus = "dormant";
        result.bodyDormantUntil = this.gameState.playerStatus.dormantUntil;
      } else {
        result.bodyStatus = "normal";
      }
      return result;
    }
    /**
     * 获取状态名称
     */
    getStateName(state) {
      const names = {
        [YUAN_INFANT_STATES.NONE]: "\u672A\u5F62\u6210",
        [YUAN_INFANT_STATES.FORMING]: "\u51DD\u805A\u4E2D",
        [YUAN_INFANT_STATES.FORMED]: "\u5DF2\u5F62\u6210",
        [YUAN_INFANT_STATES.SEPARATED]: "\u5DF2\u5206\u79BB",
        [YUAN_INFANT_STATES.PROJECTING]: "\u6295\u5C04\u4E2D",
        [YUAN_INFANT_STATES.SYNCHRONIZING]: "\u540C\u6B65\u4E2D"
      };
      return names[state] || "\u672A\u77E5";
    }
    /**
     * 格式化时长
     */
    formatDuration(ms) {
      if (ms <= 0) return "\u5DF2\u7ED3\u675F";
      const seconds = Math.floor(ms / 1e3);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) {
        return `${hours}\u5C0F\u65F6${minutes % 60}\u5206\u949F`;
      }
      if (minutes > 0) {
        return `${minutes}\u5206\u949F${seconds % 60}\u79D2`;
      }
      return `${seconds}\u79D2`;
    }
    /**
     * 获取MCP工具处理器
     * @param {Object} gameState - 游戏状态
     * @returns {Object} MCP工具处理器映射
     */
    static getMCPHandlers(gameState3) {
      const service = new _YuanInfantService(gameState3);
      service.init(gameState3);
      return {
        "yuaninfant.form": (params) => service.formYuanInfant(params),
        "yuaninfant.separate": (params) => service.separateSoul(params),
        "yuaninfant.project": (params) => service.projectAstral(params),
        "yuaninfant.sync": (params) => service.syncYuanInfant(params),
        "yuaninfant.recall": (params) => service.recallYuanInfant(params),
        "yuaninfant.status": (params) => service.getYuanInfantStatus(params)
      };
    }
  };
  var YUAN_INFANT_TOOLS = {
    "yuaninfant.form": {
      name: "yuaninfant.form",
      description: "\u51DD\u805A\u5143\u5A74 - \u5C06\u7075\u9B42\u51DD\u805A\u6210\u5143\u5A74\u5F62\u6001 (\u9700\u8981\u8FBE\u5230\u5316\u795E\u5883)",
      inputSchema: {
        type: "object",
        properties: {},
        description: "\u65E0\u53C2\u6570"
      }
    },
    "yuaninfant.separate": {
      name: "yuaninfant.separate",
      description: "\u7075\u9B42\u5206\u79BB - \u5C06\u5143\u5A74\u4ECE\u672C\u4F53\u4E2D\u5206\u79BB\u51FA\u53BB\u8FDB\u884C\u63A2\u7D22",
      inputSchema: {
        type: "object",
        properties: {
          duration: {
            type: "number",
            description: "\u5206\u79BB\u6301\u7EED\u65F6\u95F4(\u6BEB\u79D2)\uFF0C\u9ED8\u8BA41\u5C0F\u65F6"
          }
        }
      }
    },
    "yuaninfant.project": {
      name: "yuaninfant.project",
      description: "\u661F\u4F53\u6295\u5C04 - \u5143\u5A74\u51FA\u7A8D\u540E\u8FDB\u884C\u8FDC\u7A0B\u611F\u77E5\u6295\u5C04",
      inputSchema: {
        type: "object",
        properties: {
          target: {
            type: "string",
            description: "\u6295\u5C04\u76EE\u6807\u533A\u57DF\u63CF\u8FF0"
          },
          range: {
            type: "number",
            description: "\u6295\u5C04\u8303\u56F4(\u91CC)\uFF0C\u9ED8\u8BA41000"
          }
        }
      }
    },
    "yuaninfant.sync": {
      name: "yuaninfant.sync",
      description: "\u540C\u6B65\u5143\u5A74 - \u63D0\u5347\u5143\u5A74\u4E0E\u672C\u4F53\u7684\u540C\u6B65\u7387",
      inputSchema: {
        type: "object",
        properties: {
          force: {
            type: "boolean",
            description: "\u5F3A\u5236\u540C\u6B65\u5230100%"
          }
        }
      }
    },
    "yuaninfant.recall": {
      name: "yuaninfant.recall",
      description: "\u53EC\u56DE\u5143\u5A74 - \u5C06\u5206\u79BB\u7684\u5143\u5A74\u53EC\u56DE\u672C\u4F53",
      inputSchema: {
        type: "object",
        properties: {
          emergency: {
            type: "boolean",
            description: "\u7D27\u6025\u53EC\u56DE(\u6D88\u8017\u66F4\u591A\u7075\u529B\u4F46\u66F4\u5FEB)"
          }
        }
      }
    },
    "yuaninfant.status": {
      name: "yuaninfant.status",
      description: "\u67E5\u8BE2\u5143\u5A74\u72B6\u6001 - \u83B7\u53D6\u5143\u5A74\u5F53\u524D\u72B6\u6001\u8BE6\u60C5",
      inputSchema: {
        type: "object",
        properties: {
          detailed: {
            type: "boolean",
            description: "\u8FD4\u56DE\u8BE6\u7EC6\u4FE1\u606F"
          }
        }
      }
    }
  };
  var _yuanInfantServiceInstance = null;
  function getYuanInfantService(gameState3) {
    if (!_yuanInfantServiceInstance) {
      _yuanInfantServiceInstance = new YuanInfantService(gameState3);
    } else {
      _yuanInfantServiceInstance.gameState = gameState3;
    }
    return _yuanInfantServiceInstance;
  }

  // src/domains/cultivation/services/YinYangWuXingService.js
  init_CultivationService();
  var FIVE_ELEMENTS = {
    METAL: "metal",
    // 金
    WOOD: "wood",
    // 木
    WATER: "water",
    // 水
    FIRE: "fire",
    // 火
    EARTH: "earth"
    // 土
  };
  var WUXING_GENERATION = {
    [FIVE_ELEMENTS.METAL]: FIVE_ELEMENTS.WATER,
    [FIVE_ELEMENTS.WATER]: FIVE_ELEMENTS.WOOD,
    [FIVE_ELEMENTS.WOOD]: FIVE_ELEMENTS.FIRE,
    [FIVE_ELEMENTS.FIRE]: FIVE_ELEMENTS.EARTH,
    [FIVE_ELEMENTS.EARTH]: FIVE_ELEMENTS.METAL
  };
  var WUXING_CONQUEST = {
    [FIVE_ELEMENTS.METAL]: FIVE_ELEMENTS.WOOD,
    [FIVE_ELEMENTS.WOOD]: FIVE_ELEMENTS.EARTH,
    [FIVE_ELEMENTS.EARTH]: FIVE_ELEMENTS.WATER,
    [FIVE_ELEMENTS.WATER]: FIVE_ELEMENTS.FIRE,
    [FIVE_ELEMENTS.FIRE]: FIVE_ELEMENTS.METAL
  };
  var YIN_YANG_STATES = {
    BALANCED: "balanced",
    // 平衡
    YIN_EXCESS: "yin_excess",
    // 阴盛
    YANG_EXCESS: "yang_excess",
    // 阳盛
    DISORDERED: "disordered"
    // 紊乱
  };
  var YIN_YANG_WUXING_CONFIG = {
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
  var YIN_YANG_WUXING_TOOLS = {
    "wuxing.analyze": {
      name: "wuxing.analyze",
      description: "\u5206\u6790\u4E94\u884C\u5C5E\u6027\uFF0C\u8FD4\u56DE\u9634\u9633\u4E94\u884C\u72B6\u6001\u3001\u4E94\u884C\u5F3A\u5EA6\u5BF9\u6BD4\u3001\u76F8\u751F\u76F8\u514B\u5206\u6790",
      parameters: {
        type: "object",
        properties: {
          detail: {
            type: "boolean",
            description: "\u662F\u5426\u663E\u793A\u8BE6\u7EC6\u4FE1\u606F"
          }
        }
      }
    },
    "wuxing.balance": {
      name: "wuxing.balance",
      description: "\u8C03\u548C\u9634\u9633\uFF0C\u5E73\u8861\u4F53\u5185\u9634\u9633\u4E4B\u6C14\uFF0C\u4FEE\u590D\u9634\u9633\u5931\u8861\u72B6\u6001",
      parameters: {
        type: "object",
        properties: {
          intensity: {
            type: "number",
            description: "\u8C03\u548C\u5F3A\u5EA6 (1-10)",
            minimum: 1,
            maximum: 10
          }
        }
      }
    },
    "wuxing.imbue": {
      name: "wuxing.imbue",
      description: "\u704C\u6CE8\u5143\u7D20\uFF0C\u5C06\u7075\u529B\u8F6C\u5316\u4E3A\u7279\u5B9A\u4E94\u884C\u5143\u7D20",
      parameters: {
        type: "object",
        properties: {
          element: {
            type: "string",
            enum: ["metal", "wood", "water", "fire", "earth"],
            description: "\u8981\u704C\u6CE8\u7684\u5143\u7D20\u7C7B\u578B"
          },
          amount: {
            type: "number",
            description: "\u704C\u6CE8\u7684\u91CF"
          }
        },
        required: ["element"]
      }
    },
    "wuxing.resonate": {
      name: "wuxing.resonate",
      description: "\u4E94\u884C\u5171\u9E23\uFF0C\u6FC0\u53D1\u4E94\u884C\u76F8\u751F\u94FE\uFF0C\u589E\u5F3A\u4FEE\u70BC\u6548\u7387",
      parameters: {
        type: "object",
        properties: {
          element: {
            type: "string",
            enum: ["metal", "wood", "water", "fire", "earth"],
            description: "\u5171\u9E23\u8D77\u59CB\u5143\u7D20"
          }
        },
        required: ["element"]
      }
    },
    "wuxing.cycle": {
      name: "wuxing.cycle",
      description: "\u9A71\u52A8\u4E94\u884C\u8F6E\u8F6C\uFF0C\u5F15\u5BFC\u4E94\u884C\u76F8\u751F\u5FAA\u73AF\uFF0C\u51DD\u805A\u7075\u6C14",
      parameters: {
        type: "object",
        properties: {
          rounds: {
            type: "number",
            description: "\u8F6E\u8F6C\u5468\u6570 (1-5)",
            minimum: 1,
            maximum: 5
          }
        }
      }
    },
    "wuxing.affinity": {
      name: "wuxing.affinity",
      description: "\u63D0\u5347\u5143\u7D20\u4EB2\u548C\uFF0C\u63D0\u9AD8\u5BF9\u7279\u5B9A\u4E94\u884C\u5143\u7D20\u7684\u611F\u5E94\u548C\u64CD\u63A7\u80FD\u529B",
      parameters: {
        type: "object",
        properties: {
          element: {
            type: "string",
            enum: ["metal", "wood", "water", "fire", "earth"],
            description: "\u8981\u63D0\u5347\u4EB2\u548C\u7684\u5143\u7D20"
          },
          level: {
            type: "number",
            description: "\u63D0\u5347\u7B49\u7EA7\u6570 (1-3)",
            minimum: 1,
            maximum: 3
          }
        },
        required: ["element"]
      }
    }
  };
  var YinYangWuXingService = class _YinYangWuXingService {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.yinYangState = null;
    }
    /**
     * 初始化阴阳五行系统
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 初始化后的游戏状态
     */
    init(gameState3) {
      if (!gameState3.yinYangWuXing) {
        gameState3.yinYangWuXing = {
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
      this.yinYangState = gameState3.yinYangWuXing;
      if (!gameState3.spiritRoot) {
        gameState3.spiritRoot = {
          type: "wood",
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
      return gameState3;
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
        [YIN_YANG_STATES.BALANCED]: "\u9634\u9633\u5E73\u8861",
        [YIN_YANG_STATES.YIN_EXCESS]: "\u9634\u76DB\u9633\u8870",
        [YIN_YANG_STATES.YANG_EXCESS]: "\u9633\u76DB\u9634\u8870",
        [YIN_YANG_STATES.DISORDERED]: "\u9634\u9633\u7D0A\u4E71"
      };
      return descMap[state] || "\u672A\u77E5\u72B6\u6001";
    }
    /**
     * 获取五行状态
     */
    getFiveElementsStatus() {
      const elements = this.yinYangState.fiveElements;
      const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
      const avg = total / 5;
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
      if (stdDev <= 5) return "balanced";
      if (stdDev <= 15) return "slight_imbalance";
      if (stdDev <= 30) return "imbalance";
      return "severe_imbalance";
    }
    /**
     * 分析五行属性 (wuxing.analyze)
     * @param {Object} params - 参数 { detail: boolean }
     * @returns {Object} 五行分析结果
     */
    analyze(params = {}) {
      const yinYangStatus = this.getYinYangStatus();
      const fiveElementsStatus = this.getFiveElementsStatus();
      const generationAnalysis = this.analyzeGeneration(fiveElementsStatus.elements);
      const conquestAnalysis = this.analyzeConquest(fiveElementsStatus.elements);
      const result = {
        success: true,
        action: "wuxing.analyze",
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
      this.recordHistory("analyze", { yinYang: yinYangStatus.state, fiveElementsBalance: fiveElementsStatus.balance });
      return result;
    }
    /**
     * 分析相生关系
     */
    analyzeGeneration(elements) {
      const chains = [];
      for (const [element, value] of Object.entries(elements)) {
        const generated = WUXING_GENERATION[element];
        if (generated) {
          const generatedValue = elements[generated] || 0;
          const ratio = value > 0 ? (generatedValue / value).toFixed(2) : "0";
          chains.push({
            from: element,
            to: generated,
            fromValue: value,
            toValue: generatedValue,
            ratio,
            healthy: ratio >= 0.5 && ratio <= 2
          });
        }
      }
      return {
        chains,
        healthyChainCount: chains.filter((c) => c.healthy).length,
        totalChainCount: chains.length
      };
    }
    /**
     * 分析相克关系
     */
    analyzeConquest(elements) {
      const conflicts = [];
      for (const [element, value] of Object.entries(elements)) {
        const conquered = WUXING_CONQUEST[element];
        if (conquered) {
          const conqueredValue = elements[conquered] || 0;
          const ratio = conqueredValue > 0 ? (value / conqueredValue).toFixed(2) : "inf";
          conflicts.push({
            from: element,
            to: conquered,
            fromValue: value,
            toValue: conqueredValue,
            ratio,
            overwhelming: parseFloat(ratio) > 2,
            suppressed: parseFloat(ratio) < 0.5
          });
        }
      }
      return {
        conflicts,
        conflictCount: conflicts.filter((c) => c.overwhelming || c.suppressed).length,
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
      if (yinYangStatus.state === YIN_YANG_STATES.BALANCED) {
        bonus += 20;
      } else if (yinYangStatus.diff > 50) {
        bonus -= 10;
      }
      if (fiveElementsStatus.balance === "balanced") {
        bonus += 15;
      }
      const totalAffinity = Object.values(this.yinYangState.affinity).reduce((a, b) => a + b, 0);
      bonus += totalAffinity * 2;
      return {
        value: bonus,
        description: bonus > 10 ? "\u5927\u5409" : bonus > 0 ? "\u5409" : bonus > -5 ? "\u5E73" : "\u51F6"
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
      const recommendations = [];
      for (const element of Object.keys(fiveElements)) {
        const currentStrength = fiveElements[element];
        const affinityLevel = affinity[element];
        if (affinityLevel >= 5) {
          recommendations.push({ element, reason: "\u9AD8\u4EB2\u548C", priority: "high" });
        } else if (currentStrength < 15) {
          recommendations.push({ element, reason: "\u5C5E\u6027\u504F\u5F31", priority: "medium" });
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
        warnings.push("\u9634\u9633\u4E25\u91CD\u5931\u8861\uFF0C\u5EFA\u8BAE\u7ACB\u5373\u8C03\u548C");
      }
      const fiveElementsStatus = this.getFiveElementsStatus();
      if (fiveElementsStatus.balance === "severe_imbalance") {
        warnings.push("\u4E94\u884C\u4E25\u91CD\u5931\u8861\uFF0C\u4FEE\u70BC\u6548\u7387\u5927\u5E45\u4E0B\u964D");
      }
      const conquest = this.analyzeConquest(fiveElementsStatus.elements);
      const suppressed = conquest.conflicts.filter((c) => c.suppressed);
      if (suppressed.length > 0) {
        const elements = suppressed.map((c) => c.to);
        warnings.push(`${elements.join(", ")}\u5C5E\u6027\u88AB\u4E25\u91CD\u538B\u5236`);
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
      if ((this.gameState.spiritEnergy || 0) < cost) {
        return {
          success: false,
          error: "\u7075\u529B\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u8C03\u548C\u9634\u9633",
          required: cost,
          available: this.gameState.spiritEnergy || 0
        };
      }
      const yin = this.yinYangState.yin;
      const yang = this.yinYangState.yang;
      const diff = Math.abs(yin - yang);
      const adjustment = Math.min(diff, intensity * 5);
      let newYin, newYang;
      if (yin > yang) {
        newYin = Math.max(50, yin - adjustment / 2);
        newYang = Math.min(100, yang + adjustment / 2);
      } else {
        newYang = Math.max(50, yang - adjustment / 2);
        newYin = Math.min(100, yin + adjustment / 2);
      }
      this.gameState.spiritEnergy -= cost;
      this.yinYangState.yin = Math.round(newYin);
      this.yinYangState.yang = Math.round(newYang);
      const newStatus = this.getYinYangStatus();
      this.recordHistory("balance", {
        before: { yin, yang },
        after: { yin: this.yinYangState.yin, yang: this.yinYangState.yang },
        cost
      });
      return {
        success: true,
        action: "wuxing.balance",
        result: "balance_restored",
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
        return "\u9634\u9633\u8C03\u548C\u5B8C\u6210\uFF0C\u72B6\u6001\u5927\u5409";
      } else if (status.diff < 20) {
        return "\u9634\u9633\u8D8B\u4E8E\u5E73\u8861\uFF0C\u72B6\u6001\u6539\u5584";
      } else {
        return "\u9634\u9633\u4ECD\u6709\u4E00\u5B9A\u504F\u5DEE\uFF0C\u5EFA\u8BAE\u7EE7\u7EED\u8C03\u548C";
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
      if (!Object.values(FIVE_ELEMENTS).includes(element)) {
        return {
          success: false,
          error: "\u65E0\u6548\u7684\u5143\u7D20\u7C7B\u578B",
          validElements: Object.values(FIVE_ELEMENTS)
        };
      }
      const affinityLevel = this.yinYangState.affinity[element] || 0;
      const costMultiplier = 1 - affinityLevel * 0.05;
      const cost = Math.floor(YIN_YANG_WUXING_CONFIG.imbueBaseCost * amount * costMultiplier);
      if ((this.gameState.spiritEnergy || 0) < cost) {
        return {
          success: false,
          error: "\u7075\u529B\u4E0D\u8DB3",
          required: cost,
          available: this.gameState.spiritEnergy || 0
        };
      }
      this.gameState.spiritEnergy -= cost;
      const oldValue = this.yinYangState.fiveElements[element];
      this.yinYangState.fiveElements[element] = Math.min(100, oldValue + amount);
      const generatedElement = WUXING_GENERATION[element];
      if (generatedElement && Math.random() > 0.3) {
        const generatedAmount = Math.floor(amount * 0.3);
        this.yinYangState.fiveElements[generatedElement] = Math.min(
          100,
          this.yinYangState.fiveElements[generatedElement] + generatedAmount
        );
      }
      this.recordHistory("imbue", { element, amount, cost, generated: generatedElement ? { element: generatedElement, amount: Math.floor(amount * 0.3) } : null });
      return {
        success: true,
        action: "wuxing.imbue",
        element,
        amount,
        cost,
        oldValue,
        newValue: this.yinYangState.fiveElements[element],
        affinityBonus: affinityLevel > 0 ? `\u4EB2\u548C\u7B49\u7EA7${affinityLevel}\uFF0C\u6D88\u8017\u51CF\u5C11${affinityLevel * 5}%` : null,
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
      if (!Object.values(FIVE_ELEMENTS).includes(element)) {
        return {
          success: false,
          error: "\u65E0\u6548\u7684\u5143\u7D20\u7C7B\u578B",
          validElements: Object.values(FIVE_ELEMENTS)
        };
      }
      const cost = YIN_YANG_WUXING_CONFIG.resonateCost;
      if ((this.gameState.spiritEnergy || 0) < cost) {
        return {
          success: false,
          error: "\u7075\u529B\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u6FC0\u53D1\u5171\u9E23",
          required: cost,
          available: this.gameState.spiritEnergy || 0
        };
      }
      const chain = this.calculateResonanceChain(element);
      this.gameState.spiritEnergy -= cost;
      let totalBonus = 0;
      for (const ele of chain) {
        const strength = this.yinYangState.fiveElements[ele];
        totalBonus += strength * (1 + this.yinYangState.affinity[ele] * 0.1);
      }
      const averageBonus = Math.round(totalBonus / chain.length);
      const cultivationBonus = Math.floor(averageBonus * 0.5);
      this.gameState.cultivationProgress = (this.gameState.cultivationProgress || 0) + cultivationBonus;
      this.yinYangState.resonateState = {
        active: true,
        chain,
        bonus: cultivationBonus,
        startTime: Date.now()
      };
      this.recordHistory("resonate", { element, chain, bonus: cultivationBonus });
      return {
        success: true,
        action: "wuxing.resonate",
        element,
        chain,
        chainDescription: this.getChainDescription(chain),
        bonus: cultivationBonus,
        cost,
        spiritEnergy: this.gameState.spiritEnergy,
        cultivationProgress: this.gameState.cultivationProgress,
        message: `\u4E94\u884C\u5171\u9E23\u6FC0\u53D1\uFF0C${chain.join("\u2192")}\uFF0C\u4FEE\u70BC\u6548\u7387\u63D0\u5347${cultivationBonus}`
      };
    }
    /**
     * 计算共鸣链
     */
    calculateResonanceChain(startElement) {
      const chain = [startElement];
      let current = startElement;
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
        metal: "\u91D1",
        wood: "\u6728",
        water: "\u6C34",
        fire: "\u706B",
        earth: "\u571F"
      };
      return chain.map((e) => elementNames[e]).join(" \u2192 ");
    }
    /**
     * 驱动五行轮转 (wuxing.cycle)
     * @param {Object} params - 参数 { rounds: 1-5 }
     * @returns {Object} 轮转结果
     */
    cycle(params = {}) {
      const rounds = params.rounds || 1;
      if (rounds < 1 || rounds > 5) {
        return {
          success: false,
          error: "\u8F6E\u8F6C\u5468\u6570\u5FC5\u987B\u57281-5\u4E4B\u95F4"
        };
      }
      const cost = YIN_YANG_WUXING_CONFIG.cycleCost * rounds;
      if ((this.gameState.spiritEnergy || 0) < cost) {
        return {
          success: false,
          error: "\u7075\u529B\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u9A71\u52A8\u8F6E\u8F6C",
          required: cost,
          available: this.gameState.spiritEnergy || 0
        };
      }
      const elements = this.yinYangState.fiveElements;
      let startElement = Object.entries(elements).reduce(
        (min, [ele, val]) => val < min.value ? { element: ele, value: val } : min,
        { element: "wood", value: Infinity }
      ).element;
      const cycleResults = [];
      const chain = [];
      let currentElement = startElement;
      for (let i = 0; i < rounds; i++) {
        const strength = elements[currentElement];
        const consumed = Math.floor(strength * 0.1);
        const generated = Math.floor(consumed * 1.5);
        elements[currentElement] = Math.max(1, strength - consumed);
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
      this.gameState.spiritEnergy -= cost;
      const totalConsumed = cycleResults.reduce((sum, r) => sum + r.consumed, 0);
      const totalGenerated = cycleResults.reduce((sum, r) => sum + r.generated, 0);
      const qiGained = Math.floor(totalGenerated * 0.8);
      this.gameState.qi = (this.gameState.qi || 0) + qiGained;
      this.yinYangState.cycleState = {
        active: true,
        currentElement: startElement,
        rounds,
        lastCycleTime: Date.now()
      };
      this.recordHistory("cycle", { startElement, rounds, qiGained, chain });
      return {
        success: true,
        action: "wuxing.cycle",
        startElement,
        rounds,
        chain: chain.map((c) => `${c.from}\u2192${c.to}`),
        cycleResults,
        totalConsumed,
        totalGenerated,
        qiGained,
        cost,
        spiritEnergy: this.gameState.spiritEnergy,
        qi: this.gameState.qi,
        message: `\u4E94\u884C\u8F6E\u8F6C\u5B8C\u6210\uFF0C\u51DD\u805A\u7075\u6C14+${qiGained}`
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
      if (!Object.values(FIVE_ELEMENTS).includes(element)) {
        return {
          success: false,
          error: "\u65E0\u6548\u7684\u5143\u7D20\u7C7B\u578B",
          validElements: Object.values(FIVE_ELEMENTS)
        };
      }
      if (level < 1 || level > 3) {
        return {
          success: false,
          error: "\u63D0\u5347\u7B49\u7EA7\u5FC5\u987B\u57281-3\u4E4B\u95F4"
        };
      }
      const currentAffinity = this.yinYangState.affinity[element] || 0;
      if (currentAffinity >= YIN_YANG_WUXING_CONFIG.affinityRange.max) {
        return {
          success: false,
          error: `${element}\u4EB2\u548C\u5DF2\u8FBE\u4E0A\u9650`,
          currentAffinity,
          maxAffinity: YIN_YANG_WUXING_CONFIG.affinityRange.max
        };
      }
      const cost = level * 200 * (1 + currentAffinity * 0.2);
      if ((this.gameState.spiritEnergy || 0) < cost) {
        return {
          success: false,
          error: "\u7075\u529B\u4E0D\u8DB3",
          required: Math.floor(cost),
          available: this.gameState.spiritEnergy || 0
        };
      }
      const stoneCost = level * 100;
      if ((this.gameState.spiritStones || 0) < stoneCost) {
        return {
          success: false,
          error: "\u7075\u77F3\u4E0D\u8DB3",
          required: stoneCost,
          available: this.gameState.spiritStones || 0
        };
      }
      this.gameState.spiritEnergy -= Math.floor(cost);
      this.gameState.spiritStones -= stoneCost;
      const oldAffinity = this.yinYangState.affinity[element];
      this.yinYangState.affinity[element] = Math.min(
        YIN_YANG_WUXING_CONFIG.affinityRange.max,
        currentAffinity + level
      );
      const newAffinity = this.yinYangState.affinity[element];
      this.recordHistory("affinity", { element, level, oldAffinity, newAffinity });
      return {
        success: true,
        action: "wuxing.affinity",
        element,
        level,
        oldAffinity,
        newAffinity,
        spiritEnergyCost: Math.floor(cost),
        stoneCost,
        spiritStones: this.gameState.spiritStones,
        spiritEnergy: this.gameState.spiritEnergy,
        message: `${element}\u4EB2\u548C\u63D0\u5347\u81F3${newAffinity}\u7EA7\uFF0C\u7075\u529B\u6D88\u8017${Math.floor(cost)}\uFF0C\u7075\u77F3\u6D88\u8017${stoneCost}`
      };
    }
    /**
     * 获取MCP工具处理器
     * @param {Object} gameState - 游戏状态
     * @returns {Object} MCP工具处理器映射
     */
    static getMCPHandlers(gameState3) {
      const service = new _YinYangWuXingService(gameState3);
      service.init(gameState3);
      return {
        "wuxing.analyze": (params) => service.analyze(params || {}),
        "wuxing.balance": (params) => service.balance(params || {}),
        "wuxing.imbue": (params) => service.imbue(params || {}),
        "wuxing.resonate": (params) => service.resonate(params || {}),
        "wuxing.cycle": (params) => service.cycle(params || {}),
        "wuxing.affinity": (params) => service.affinity(params || {})
      };
    }
  };

  // src/domains/cultivation/services/ThunderTribulationService.js
  init_CultivationService();
  var TRIBULATION_STATES = {
    NONE: "none",
    // 未渡劫
    PREPARING: "preparing",
    // 准备中
    IN_PROGRESS: "in_progress",
    // 渡劫中
    SUCCESS: "success",
    // 渡劫成功
    FAILED: "failed",
    // 渡劫失败
    BLESSED: "blessed"
    // 已获赐福
  };
  var THUNDER_TRIBULATION_CONFIG = {
    // 劫数等级与境界对应关系
    realmToTribulationLevel: {
      0: 1,
      // 炼气→筑基需要1重劫
      1: 2,
      // 筑基→金丹需要2重劫
      2: 3,
      // 金丹→元婴需要3重劫
      3: 4,
      // 元婴→化神需要4重劫
      4: 5,
      // 化神→飞升需要5重劫
      5: 9
      // 飞升后大圆满需要9重劫
    },
    // 渡劫基础成功率
    baseSuccessRate: 0.5,
    // 每重劫数增加的基础强度
    baseIntensityPerLevel: 100,
    // 功德抵消天罚系数
    meritOffsetFactor: 0.1,
    // 天雷赐福基础增益
    blessingBaseBonus: 0.1,
    // 雷法精通最大等级
    maxMasteryLevel: 9,
    // 吸收雷劫恢复比例
    absorbRecoveryRate: 0.3,
    // 渡劫消耗灵石基数
    tribulationStoneCost: 500
  };
  var THUNDER_TRIBULATION_TOOLS = {
    "thunder.prepare": {
      name: "thunder.prepare",
      description: "\u51C6\u5907\u6E21\u52AB\uFF0C\u68C0\u6D4B\u6E21\u52AB\u6761\u4EF6\u5E76\u8BBE\u7F6E\u6E21\u52AB\u76EE\u6807",
      parameters: {
        type: "object",
        properties: {
          targetRealm: {
            type: "number",
            description: "\u76EE\u6807\u5883\u754C (0-5: \u70BC\u6C14\u3001\u7B51\u57FA\u3001\u91D1\u4E39\u3001\u5143\u5A74\u3001\u5316\u795E\u3001\u98DE\u5347)"
          }
        }
      }
    },
    "thunder.execute": {
      name: "thunder.execute",
      description: "\u6267\u884C\u6E21\u52AB\uFF0C\u8FDB\u884C\u5929\u96F7\u6D17\u793C",
      parameters: {
        type: "object",
        properties: {
          useItems: {
            type: "boolean",
            description: "\u662F\u5426\u4F7F\u7528\u9053\u5177\u8F85\u52A9\u6E21\u52AB"
          }
        }
      }
    },
    "thunder.bless": {
      name: "thunder.bless",
      description: "\u5929\u96F7\u8D50\u798F\uFF0C\u5C06\u96F7\u52AB\u4E4B\u529B\u8F6C\u5316\u4E3A\u4FEE\u70BC\u589E\u76CA",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["cultivation", "attribute", "skill"],
            description: "\u8D50\u798F\u7C7B\u578B"
          }
        }
      }
    },
    "thunder.mastery": {
      name: "thunder.mastery",
      description: "\u96F7\u6CD5\u7CBE\u901A\uFF0C\u63D0\u5347\u96F7\u6CD5\u795E\u901A\u7B49\u7EA7",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["query", "upgrade", "use"],
            description: "\u96F7\u6CD5\u64CD\u4F5C\u7C7B\u578B"
          }
        }
      }
    },
    "thunder.absorb": {
      name: "thunder.absorb",
      description: "\u5438\u6536\u96F7\u52AB\uFF0C\u5C06\u5929\u96F7\u4E4B\u529B\u8F6C\u5316\u4E3A\u81EA\u8EAB\u7075\u529B",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "\u5438\u6536\u91CF (1-100)"
          }
        }
      }
    },
    "thunder.journal": {
      name: "thunder.journal",
      description: "\u6E21\u52AB\u65E5\u5FD7\uFF0C\u67E5\u770B\u5386\u53F2\u6E21\u52AB\u8BB0\u5F55",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "\u8FD4\u56DE\u8BB0\u5F55\u6570\u91CF"
          }
        }
      }
    }
  };
  var ThunderTribulationService = class _ThunderTribulationService {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.tribulationState = null;
    }
    /**
     * 初始化天雷劫数系统
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 初始化后的游戏状态
     */
    init(gameState3) {
      if (!gameState3.thunderTribulation) {
        gameState3.thunderTribulation = {
          // 渡劫状态
          state: TRIBULATION_STATES.NONE,
          // 当前劫数等级 (1-9)
          currentLevel: 0,
          // 目标境界
          targetRealm: null,
          // 天雷强度
          lightningIntensity: 0,
          // 雷击次数
          lightningCount: 0,
          // 渡劫进度 (0-100)
          progress: 0,
          // 历史记录
          history: [],
          // 雷法精通等级 (0-9)
          lightningMastery: 0,
          // 雷法神通列表
          lightningSkills: [],
          // 天雷赐福效果
          blessingEffects: [],
          // 累积天罚值
          divinePunishment: 0,
          // 功德值
          meritPoints: 0,
          // 最后渡劫时间
          lastTribulationTime: null,
          // 渡劫成功率加成
          successRateBonus: 0,
          // 已吸收雷劫能量
          absorbedEnergy: 0
        };
      }
      this.tribulationState = gameState3.thunderTribulation;
      if (this.gameState.player && this.gameState.player.karmaPoints === void 0) {
        this.gameState.player.karmaPoints = 0;
      }
      return gameState3;
    }
    /**
     * 记录历史事件
     */
    recordHistory(action, details) {
      if (!this.tribulationState.history) {
        this.tribulationState.history = [];
      }
      this.tribulationState.history.push({
        action,
        details,
        timestamp: Date.now()
      });
      if (this.tribulationState.history.length > 50) {
        this.tribulationState.history = this.tribulationState.history.slice(-50);
      }
    }
    /**
     * 获取当前境界所需劫数等级
     */
    getRequiredTribulationLevel(targetRealm) {
      const realm = targetRealm !== void 0 ? targetRealm : this.gameState.realm || 0;
      return THUNDER_TRIBULATION_CONFIG.realmToTribulationLevel[realm] || 1;
    }
    /**
     * 计算渡劫成功率
     * 成功率 = (实力 + 功德) / (劫数 × 20)
     */
    calculateSuccessRate(params = {}) {
      var _a;
      const gs = this.gameState;
      const level = this.tribulationState.currentLevel || this.getRequiredTribulationLevel();
      const realmPower = (gs.realm || 0) * 100;
      const cultivationPower = gs.cultivationProgress || 0;
      const basePower = realmPower + cultivationPower;
      const merit = this.tribulationState.meritPoints || (((_a = gs.player) == null ? void 0 : _a.karmaPoints) || 0);
      const divinePunishment = this.tribulationState.divinePunishment || 0;
      const effectiveMerit = Math.max(0, merit - divinePunishment * THUNDER_TRIBULATION_CONFIG.meritOffsetFactor);
      const successRate = (basePower + effectiveMerit) / (level * 20);
      return {
        basePower,
        merit: effectiveMerit,
        level,
        rawRate: successRate,
        finalRate: Math.min(0.95, Math.max(0.05, successRate + (this.tribulationState.successRateBonus || 0)))
      };
    }
    /**
     * 准备渡劫 (thunder.prepare)
     * @param {Object} params - 参数 { targetRealm: number }
     * @returns {Object} 准备结果
     */
    prepare(params = {}) {
      var _a, _b;
      const gs = this.gameState;
      if (this.tribulationState.state === TRIBULATION_STATES.IN_PROGRESS) {
        return {
          success: false,
          error: "\u6E21\u52AB\u6B63\u5728\u8FDB\u884C\u4E2D\uFF0C\u65E0\u6CD5\u518D\u6B21\u51C6\u5907",
          currentState: this.tribulationState.state
        };
      }
      if (this.tribulationState.state === TRIBULATION_STATES.PREPARING) {
        return {
          success: false,
          error: "\u6E21\u52AB\u5DF2\u51C6\u5907\u597D\uFF0C\u8BF7\u6267\u884C\u6E21\u52AB",
          currentState: this.tribulationState.state
        };
      }
      const targetRealm = params.targetRealm !== void 0 ? params.targetRealm : (gs.realm || 0) + 1;
      if (targetRealm < 0 || targetRealm > 5) {
        return {
          success: false,
          error: "\u65E0\u6548\u7684\u76EE\u6807\u5883\u754C"
        };
      }
      if (targetRealm <= (gs.realm || 0)) {
        return {
          success: false,
          error: "\u76EE\u6807\u5883\u754C\u5FC5\u987B\u9AD8\u4E8E\u5F53\u524D\u5883\u754C"
        };
      }
      const requiredLevel = this.getRequiredTribulationLevel(targetRealm);
      const stoneCost = THUNDER_TRIBULATION_CONFIG.tribulationStoneCost * requiredLevel;
      if ((((_a = gs.player) == null ? void 0 : _a.spiritStones) || 0) < stoneCost) {
        return {
          success: false,
          error: `\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981${stoneCost}\u7075\u77F3\u51C6\u5907\u6E21\u52AB`,
          shortage: stoneCost - (((_b = gs.player) == null ? void 0 : _b.spiritStones) || 0)
        };
      }
      this.tribulationState.state = TRIBULATION_STATES.PREPARING;
      this.tribulationState.targetRealm = targetRealm;
      this.tribulationState.currentLevel = requiredLevel;
      this.tribulationState.lightningIntensity = THUNDER_TRIBULATION_CONFIG.baseIntensityPerLevel * requiredLevel;
      const successRateInfo = this.calculateSuccessRate({ targetRealm });
      this.recordHistory("prepare", {
        targetRealm,
        requiredLevel,
        stoneCost,
        successRate: successRateInfo.finalRate
      });
      return {
        success: true,
        action: "thunder.prepare",
        state: TRIBULATION_STATES.PREPARING,
        targetRealm,
        requiredLevel,
        lightningIntensity: this.tribulationState.lightningIntensity,
        stoneCost,
        successRate: successRateInfo.finalRate,
        message: `\u51C6\u5907\u6E21\u52AB\uFF0C\u76EE\u6807\uFF1A${this.getRealmName(targetRealm)}\uFF0C\u9700\u8981${requiredLevel}\u91CD\u96F7\u52AB`
      };
    }
    /**
     * 执行渡劫 (thunder.execute)
     * @param {Object} params - 参数 { useItems: boolean }
     * @returns {Object} 渡劫结果
     */
    execute(params = {}) {
      var _a, _b;
      const gs = this.gameState;
      if (this.tribulationState.state !== TRIBULATION_STATES.PREPARING) {
        if (this.tribulationState.state === TRIBULATION_STATES.NONE) {
          const prepResult = this.prepare(params);
          if (!prepResult.success) {
            return prepResult;
          }
        } else {
          return {
            success: false,
            error: "\u8BF7\u5148\u51C6\u5907\u6E21\u52AB",
            currentState: this.tribulationState.state
          };
        }
      }
      const stoneCost = THUNDER_TRIBULATION_CONFIG.tribulationStoneCost * this.tribulationState.currentLevel;
      if ((((_a = gs.player) == null ? void 0 : _a.spiritStones) || 0) < stoneCost) {
        return {
          success: false,
          error: "\u7075\u77F3\u4E0D\u8DB3\uFF0C\u6E21\u52AB\u5931\u8D25",
          shortage: stoneCost - (((_b = gs.player) == null ? void 0 : _b.spiritStones) || 0)
        };
      }
      gs.player.spiritStones -= stoneCost;
      this.tribulationState.state = TRIBULATION_STATES.IN_PROGRESS;
      this.tribulationState.lightningCount = 0;
      this.tribulationState.progress = 0;
      const successRateInfo = this.calculateSuccessRate();
      const maxLightning = this.tribulationState.currentLevel * 3;
      const passedLightning = [];
      for (let i = 0; i < maxLightning; i++) {
        const lightningSuccess = Math.random() < successRateInfo.finalRate;
        this.tribulationState.lightningCount++;
        this.tribulationState.progress = (i + 1) / maxLightning * 100;
        passedLightning.push({
          index: i + 1,
          intensity: this.tribulationState.lightningIntensity * (1 + i * 0.1),
          passed: lightningSuccess
        });
        if (!lightningSuccess) {
          this.tribulationState.state = TRIBULATION_STATES.FAILED;
          this.tribulationState.lastTribulationTime = Date.now();
          this.recordHistory("execute", {
            targetRealm: this.tribulationState.targetRealm,
            level: this.tribulationState.currentLevel,
            lightningCount: this.tribulationState.lightningCount,
            passedLightning: passedLightning.length,
            result: "failed"
          });
          return {
            success: false,
            action: "thunder.execute",
            state: TRIBULATION_STATES.FAILED,
            message: `\u6E21\u52AB\u5931\u8D25\uFF01\u7B2C${i + 1}\u9053\u5929\u96F7\u672A\u80FD\u6E21\u8FC7`,
            lightningCount: this.tribulationState.lightningCount,
            progress: this.tribulationState.progress,
            targetRealm: this.tribulationState.targetRealm,
            failureReason: "\u5929\u96F7\u6D17\u793C\u5931\u8D25"
          };
        }
      }
      this.tribulationState.state = TRIBULATION_STATES.SUCCESS;
      this.tribulationState.lastTribulationTime = Date.now();
      const oldRealm = gs.realm || 0;
      gs.realm = this.tribulationState.targetRealm;
      gs.stage = 0;
      gs.cultivationProgress = 0;
      this.tribulationState.lightningMastery = Math.min(
        this.tribulationState.lightningMastery + 1,
        THUNDER_TRIBULATION_CONFIG.maxMasteryLevel
      );
      this.recordHistory("execute", {
        targetRealm: this.tribulationState.targetRealm,
        level: this.tribulationState.currentLevel,
        lightningCount: this.tribulationState.lightningCount,
        passedLightning: passedLightning.length,
        result: "success"
      });
      return {
        success: true,
        action: "thunder.execute",
        state: TRIBULATION_STATES.SUCCESS,
        message: `\u6E21\u52AB\u6210\u529F\uFF01\u6210\u529F\u7A81\u7834\u81F3${this.getRealmName(gs.realm)}`,
        realmProgress: {
          from: oldRealm,
          to: gs.realm,
          realmName: this.getRealmName(gs.realm)
        },
        lightningMastery: this.tribulationState.lightningMastery,
        lightningCount: this.tribulationState.lightningCount,
        progress: this.tribulationState.progress
      };
    }
    /**
     * 天雷赐福 (thunder.bless)
     * @param {Object} params - 参数 { type: 'cultivation'|'attribute'|'skill' }
     * @returns {Object} 赐福结果
     */
    bless(params = {}) {
      const gs = this.gameState;
      if (this.tribulationState.state !== TRIBULATION_STATES.SUCCESS) {
        return {
          success: false,
          error: "\u9700\u8981\u5148\u6210\u529F\u6E21\u52AB\u624D\u80FD\u83B7\u5F97\u8D50\u798F"
        };
      }
      if (this.tribulationState.state === TRIBULATION_STATES.BLESSED) {
        return {
          success: false,
          error: "\u672C\u6B21\u6E21\u52AB\u8D50\u798F\u5DF2\u9886\u53D6"
        };
      }
      const type = params.type || "cultivation";
      let blessingEffect;
      const baseBonus = THUNDER_TRIBULATION_CONFIG.blessingBaseBonus;
      const levelBonus = (this.tribulationState.currentLevel || 1) * 0.05;
      switch (type) {
        case "cultivation":
          gs.cultivationProgress = (gs.cultivationProgress || 0) + 20 * (baseBonus + levelBonus);
          blessingEffect = {
            type: "cultivation",
            name: "\u5929\u96F7\u6DEC\u4F53",
            bonus: (baseBonus + levelBonus) * 100,
            description: `\u4FEE\u70BC\u901F\u5EA6\u63D0\u5347${((baseBonus + levelBonus) * 100).toFixed(0)}%`
          };
          break;
        case "attribute":
          if (gs.player) {
            gs.player.level = (gs.player.level || 1) + Math.floor(this.tribulationState.currentLevel || 1);
          }
          blessingEffect = {
            type: "attribute",
            name: "\u5929\u96F7\u953B\u4F53",
            bonus: (baseBonus + levelBonus) * 100,
            description: `\u7B49\u7EA7\u63D0\u5347${Math.floor(this.tribulationState.currentLevel || 1)}\u7EA7`
          };
          break;
        case "skill":
          const skillBonus = baseBonus + levelBonus;
          blessingEffect = {
            type: "skill",
            name: "\u96F7\u6CD5\u795E\u901A",
            bonus: skillBonus * 100,
            description: `\u96F7\u6CD5\u5A01\u529B\u63D0\u5347${(skillBonus * 100).toFixed(0)}%`
          };
          break;
        default:
          return {
            success: false,
            error: "\u65E0\u6548\u7684\u8D50\u798F\u7C7B\u578B"
          };
      }
      this.tribulationState.state = TRIBULATION_STATES.BLESSED;
      this.tribulationState.blessingEffects.push(blessingEffect);
      this.recordHistory("bless", {
        type,
        blessingEffect
      });
      return {
        success: true,
        action: "thunder.bless",
        blessingEffect,
        message: `\u83B7\u5F97${blessingEffect.name}\u6548\u679C\uFF1A${blessingEffect.description}`
      };
    }
    /**
     * 雷法精通 (thunder.mastery)
     * @param {Object} params - 参数 { action: 'query'|'upgrade'|'use' }
     * @returns {Object} 结果
     */
    mastery(params = {}) {
      var _a, _b, _c, _d;
      const gs = this.gameState;
      const action = params.action || "query";
      switch (action) {
        case "query":
          return {
            success: true,
            action: "thunder.mastery",
            currentLevel: this.tribulationState.lightningMastery,
            maxLevel: THUNDER_TRIBULATION_CONFIG.maxMasteryLevel,
            skills: this.tribulationState.lightningSkills,
            experienceProgress: this.getMasteryProgress()
          };
        case "upgrade":
          if (this.tribulationState.state !== TRIBULATION_STATES.SUCCESS && this.tribulationState.state !== TRIBULATION_STATES.BLESSED) {
            return {
              success: false,
              error: "\u9700\u8981\u5148\u6210\u529F\u6E21\u52AB\u624D\u80FD\u63D0\u5347\u96F7\u6CD5\u7CBE\u901A"
            };
          }
          if (this.tribulationState.lightningMastery >= THUNDER_TRIBULATION_CONFIG.maxMasteryLevel) {
            return {
              success: false,
              error: "\u96F7\u6CD5\u7CBE\u901A\u5DF2\u8FBE\u5230\u6700\u5927\u7B49\u7EA7"
            };
          }
          const upgradeCost = 1e3 * (this.tribulationState.lightningMastery + 1);
          if ((((_a = gs.player) == null ? void 0 : _a.spiritStones) || 0) < upgradeCost) {
            return {
              success: false,
              error: `\u5347\u7EA7\u9700\u8981${upgradeCost}\u7075\u77F3`,
              shortage: upgradeCost - (((_b = gs.player) == null ? void 0 : _b.spiritStones) || 0)
            };
          }
          gs.player.spiritStones -= upgradeCost;
          this.tribulationState.lightningMastery++;
          this.recordHistory("mastery_upgrade", {
            newLevel: this.tribulationState.lightningMastery,
            cost: upgradeCost
          });
          return {
            success: true,
            action: "thunder.mastery",
            newLevel: this.tribulationState.lightningMastery,
            message: `\u96F7\u6CD5\u7CBE\u901A\u63D0\u5347\u81F3${this.tribulationState.lightningMastery}\u7EA7`
          };
        case "use":
          if (this.tribulationState.lightningMastery < 1) {
            return {
              success: false,
              error: "\u96F7\u6CD5\u7CBE\u901A\u7B49\u7EA7\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u4F7F\u7528\u96F7\u6CD5"
            };
          }
          const useCost = 50 * this.tribulationState.lightningMastery;
          if ((((_c = gs.player) == null ? void 0 : _c.qi) || 0) < useCost) {
            return {
              success: false,
              error: `\u4F7F\u7528\u96F7\u6CD5\u9700\u8981${useCost}\u7075\u529B`,
              shortage: useCost - (((_d = gs.player) == null ? void 0 : _d.qi) || 0)
            };
          }
          gs.player.qi -= useCost;
          const damage = 100 * this.tribulationState.lightningMastery;
          this.recordHistory("mastery_use", {
            damage,
            qiCost: useCost
          });
          return {
            success: true,
            action: "thunder.mastery",
            message: `\u65BD\u5C55\u96F7\u6CD5\uFF0C\u9020\u6210${damage}\u4F24\u5BB3`,
            damage,
            qiSpent: useCost,
            masteryLevel: this.tribulationState.lightningMastery
          };
        default:
          return {
            success: false,
            error: "\u65E0\u6548\u7684\u64CD\u4F5C\u7C7B\u578B"
          };
      }
    }
    /**
     * 获取雷法精通进度
     */
    getMasteryProgress() {
      const current = this.tribulationState.lightningMastery;
      const max = THUNDER_TRIBULATION_CONFIG.maxMasteryLevel;
      return {
        current,
        max,
        percentage: current / max * 100
      };
    }
    /**
     * 吸收雷劫 (thunder.absorb)
     * @param {Object} params - 参数 { amount: number }
     * @returns {Object} 吸收结果
     */
    absorb(params = {}) {
      var _a;
      const gs = this.gameState;
      if (this.tribulationState.absorbedEnergy <= 0 && this.tribulationState.state !== TRIBULATION_STATES.SUCCESS) {
        return {
          success: false,
          error: "\u5F53\u524D\u6CA1\u6709\u53EF\u5438\u6536\u7684\u96F7\u52AB\u80FD\u91CF"
        };
      }
      const amount = Math.min(params.amount || 50, 100);
      const maxAbsorb = this.tribulationState.absorbedEnergy || THUNDER_TRIBULATION_CONFIG.absorbRecoveryRate * this.tribulationState.lightningIntensity;
      const actualAbsorb = Math.min(amount, maxAbsorb);
      const currentQi = ((_a = gs.player) == null ? void 0 : _a.qi) || 0;
      const maxQi = 100 + (gs.realm || 0) * 50;
      const qiRecovery = actualAbsorb * THUNDER_TRIBULATION_CONFIG.absorbRecoveryRate;
      gs.player.qi = Math.min(currentQi + qiRecovery, maxQi);
      this.tribulationState.absorbedEnergy = Math.max(0, (this.tribulationState.absorbedEnergy || 0) - actualAbsorb);
      this.recordHistory("absorb", {
        amount: actualAbsorb,
        qiRecovered: qiRecovery
      });
      return {
        success: true,
        action: "thunder.absorb",
        amount: actualAbsorb,
        qiRecovered: qiRecovery,
        currentQi: gs.player.qi,
        maxQi,
        message: `\u5438\u6536${actualAbsorb}\u96F7\u52AB\u80FD\u91CF\uFF0C\u56DE\u590D${qiRecovery.toFixed(1)}\u7075\u529B`
      };
    }
    /**
     * 渡劫日志 (thunder.journal)
     * @param {Object} params - 参数 { limit: number }
     * @returns {Object} 日志结果
     */
    journal(params = {}) {
      const limit = params.limit || 10;
      const history = this.tribulationState.history || [];
      const recentHistory = history.slice(-limit).reverse();
      const stats = {
        totalTribulations: history.filter((h) => h.action === "execute").length,
        successfulTribulations: history.filter((h) => {
          var _a;
          return h.action === "execute" && ((_a = h.details) == null ? void 0 : _a.result) === "success";
        }).length,
        failedTribulations: history.filter((h) => {
          var _a;
          return h.action === "execute" && ((_a = h.details) == null ? void 0 : _a.result) === "failed";
        }).length,
        totalLightningAbsorbed: history.filter((h) => h.action === "absorb").reduce((sum, h) => {
          var _a;
          return sum + (((_a = h.details) == null ? void 0 : _a.amount) || 0);
        }, 0),
        currentMastery: this.tribulationState.lightningMastery,
        highestLevel: this.getHighestTribulationLevel(history)
      };
      return {
        success: true,
        action: "thunder.journal",
        stats,
        history: recentHistory.map((h) => ({
          action: h.action,
          details: h.details,
          timestamp: h.timestamp,
          timeDesc: this.formatTimestamp(h.timestamp)
        }))
      };
    }
    /**
     * 获取最高渡劫等级
     */
    getHighestTribulationLevel(history) {
      if (!history || history.length === 0) return 0;
      return Math.max(...history.filter((h) => {
        var _a;
        return (_a = h.details) == null ? void 0 : _a.level;
      }).map((h) => h.details.level));
    }
    /**
     * 格式化时间戳
     */
    formatTimestamp(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 6e4) return "\u521A\u521A";
      if (diff < 36e5) return `${Math.floor(diff / 6e4)}\u5206\u949F\u524D`;
      if (diff < 864e5) return `${Math.floor(diff / 36e5)}\u5C0F\u65F6\u524D`;
      return date.toLocaleDateString();
    }
    /**
     * 获取境界名称
     */
    getRealmName(realm) {
      const realms = ["\u70BC\u6C14", "\u7B51\u57FA", "\u91D1\u4E39", "\u5143\u5A74", "\u5316\u795E", "\u98DE\u5347"];
      return realms[realm] || "\u672A\u77E5";
    }
    /**
     * 获取MCP工具处理器
     * @param {Object} gameState - 游戏状态
     * @returns {Object} MCP处理器映射
     */
    static getMCPHandlers(gameState3) {
      const service = new _ThunderTribulationService(gameState3);
      return {
        "thunder.prepare": (params) => service.prepare(params || {}),
        "thunder.execute": (params) => service.execute(params || {}),
        "thunder.bless": (params) => service.bless(params || {}),
        "thunder.mastery": (params) => service.mastery(params || {}),
        "thunder.absorb": (params) => service.absorb(params || {}),
        "thunder.journal": (params) => service.journal(params || {})
      };
    }
  };

  // src/domains/cultivation/services/LawUnificationService.js
  var LAWS = {
    METAL: { id: "metal", name: "\u91D1\u4E4B\u6CD5\u5219", element: "metal", power: 10 },
    WOOD: { id: "wood", name: "\u6728\u4E4B\u6CD5\u5219", element: "wood", power: 10 },
    WATER: { id: "water", name: "\u6C34\u4E4B\u6CD5\u5219", element: "water", power: 10 },
    FIRE: { id: "fire", name: "\u706B\u4E4B\u6CD5\u5219", element: "fire", power: 10 },
    EARTH: { id: "earth", name: "\u571F\u4E4B\u6CD5\u5219", element: "earth", power: 10 },
    YIN: { id: "yin", name: "\u9634\u4E4B\u9053", element: "yin", power: 12 },
    YANG: { id: "yang", name: "\u9633\u4E4B\u9053", element: "yang", power: 12 },
    SWORD: { id: "sword", name: "\u5251\u9053", element: "sword", power: 15 },
    FORMATION: { id: "formation", name: "\u9635\u6CD5\u4E4B\u9053", element: "formation", power: 14 },
    ALCHEMY: { id: "alchemy", name: "\u4E39\u9053", element: "alchemy", power: 13 },
    SEAL: { id: "seal", name: "\u5C01\u5370\u4E4B\u9053", element: "seal", power: 11 },
    SPACE: { id: "space", name: "\u7A7A\u95F4\u6CD5\u5219", element: "space", power: 16 },
    TIME: { id: "time", name: "\u65F6\u95F4\u6CD5\u5219", element: "time", power: 18 },
    DESTINY: { id: "destiny", name: "\u547D\u8FD0\u6CD5\u5219", element: "destiny", power: 17 },
    KARMA: { id: "karma", name: "\u56E0\u679C\u6CD5\u5219", element: "karma", power: 15 },
    THUNDER: { id: "thunder", name: "\u96F7\u6CD5", element: "thunder", power: 14 },
    WIND: { id: "wind", name: "\u98CE\u4E4B\u9053", element: "wind", power: 11 },
    ICE: { id: "ice", name: "\u51B0\u4E4B\u9053", element: "ice", power: 12 },
    POISON: { id: "poison", name: "\u6BD2\u4E4B\u9053", element: "poison", power: 10 },
    BODY: { id: "body", name: "\u8089\u8EAB\u6CD5\u5219", element: "body", power: 13 }
  };
  var LAW_FUSION_RECIPES = {
    "metal+wood+water+fire+earth": { id: "wuxing", name: "\u4E94\u884C\u5F52\u4E00", power: 50, effect: "\u4E94\u884C\u8F6E\u8F6C\uFF0C\u4E07\u6CD5\u76F8\u751F" },
    "yin+yang": { id: "yinyang", name: "\u9634\u9633\u8C03\u548C", power: 35, effect: "\u9634\u9633\u5E73\u8861\uFF0C\u5927\u9053\u521D\u6210" },
    "sword+thunder": { id: "thundersword", name: "\u96F7\u5251\u5408\u4E00", power: 40, effect: "\u96F7\u9E23\u5251\u5578\uFF0C\u65A9\u65AD\u82CD\u7A79" },
    "space+time": { id: "spacetime", name: "\u65F6\u7A7A\u6CD5\u5219", power: 60, effect: "\u65F6\u7A7A\u5728\u624B\uFF0C\u9006\u8F6C\u4E7E\u5764" },
    "destiny+karma": { id: "destinykarma", name: "\u547D\u56E0\u679C\u62A5", power: 45, effect: "\u547D\u8FD0\u56E0\u679C\uFF0C\u65E0\u4EBA\u80FD\u9003" },
    "formation+seal": { id: "formationseal", name: "\u9635\u5C01\u5408\u4E00", power: 38, effect: "\u9635\u6CD5\u5C01\u5370\uFF0C\u56F0\u9501\u5929\u5730" },
    "alchemy+body": { id: "alchemybody", name: "\u8089\u8EAB\u70BC\u4E39", power: 42, effect: "\u4EE5\u8EAB\u4E3A\u7089\uFF0C\u70BC\u4F53\u6210\u4E39" },
    "wind+ice+thunder": { id: "trinity", name: "\u4E09\u5143\u5F52\u4E00", power: 48, effect: "\u98CE\u51B0\u96F7\u4E09\u7EDD\uFF0C\u878D\u5408\u5F52\u4E00" },
    "metal+space": { id: "metalspace", name: "\u91D1\u7A7A\u95F4\u65A9", power: 44, effect: "\u91D1\u5C5E\u6027\u7A7A\u95F4\uFF0C\u65A9\u88C2\u865A\u7A7A" },
    "water+poison": { id: "waterpoison", name: "\u6BD2\u6C34\u4EA4\u878D", power: 36, effect: "\u6BD2\u6C34\u76F8\u878D\uFF0C\u4FB5\u8680\u4E07\u7269" }
  };
  var MIN_LAWS_FOR_UNIFICATION = 3;
  var BASE_FUSION_SUCCESS_RATE = 0.6;
  var COMPREHENSION_BONUS_RATE = 0.05;
  var _serviceInstance = null;
  function createLawUnificationService(gameState3) {
    if (_serviceInstance) return _serviceInstance;
    _serviceInstance = {
      // 玩家已领悟的法则
      playerLaws: [],
      // 融合记录
      fusionRecords: [],
      // 归一状态
      unification: null,
      // 终极神通列表
      ultimateTechniques: [],
      // 归一日志
      journal: []
    };
    return _serviceInstance;
  }
  function getLawUnificationService(gameState3) {
    return createLawUnificationService(gameState3);
  }
  function listLaws(gameState3) {
    const service = getLawUnificationService(gameState3);
    const playerLaws = service.playerLaws || [];
    const allLaws = Object.values(LAWS);
    const unlockedIds = new Set(playerLaws.map((l) => l.id));
    return {
      all_laws: allLaws,
      unlocked_laws: playerLaws,
      count: playerLaws.length,
      unlocked_ids: Array.from(unlockedIds)
    };
  }
  function comprehendLaw(gameState3, lawId) {
    const law = LAWS[lawId == null ? void 0 : lawId.toUpperCase()];
    if (!law) {
      throw new Error(`\u672A\u77E5\u6CD5\u5219: ${lawId}`);
    }
    const service = getLawUnificationService(gameState3);
    if (!service.playerLaws) service.playerLaws = [];
    const exists = service.playerLaws.find((l) => l.id === law.id);
    if (exists) {
      return { success: false, message: `\u5DF2\u9886\u609F${law.name}`, law };
    }
    service.playerLaws.push({ ...law, comprehendedAt: Date.now() });
    return {
      success: true,
      message: `\u6210\u529F\u9886\u609F${law.name}`,
      law,
      totalLaws: service.playerLaws.length
    };
  }
  function fuseLaws(gameState3, lawIds, targetTechnique = null) {
    var _a;
    if (!lawIds || lawIds.length < 2) {
      throw new Error("\u878D\u5408\u9700\u8981\u81F3\u5C112\u79CD\u6CD5\u5219");
    }
    const service = getLawUnificationService(gameState3);
    if (!service.playerLaws) service.playerLaws = [];
    const playerLawIds = new Set(service.playerLaws.map((l) => l.id));
    const invalidLaws = lawIds.filter((id) => !playerLawIds.has(id));
    if (invalidLaws.length > 0) {
      throw new Error(`\u672A\u9886\u609F\u7684\u6CD5\u5219: ${invalidLaws.join(", ")}`);
    }
    const sortedKey = [...lawIds].sort().join("+");
    const recipe = LAW_FUSION_RECIPES[sortedKey];
    const comprehension = ((_a = gameState3.player) == null ? void 0 : _a.comprehension) || 50;
    let successRate = BASE_FUSION_SUCCESS_RATE + (lawIds.length - 2) * LAW_BONUS_SUCCESS_SUCCESS_RATE + comprehension * COMPREHENSION_BONUS_RATE / 100;
    successRate = Math.min(successRate, 0.95);
    const roll = Math.random();
    const success = roll < successRate;
    if (!service.fusionRecords) service.fusionRecords = [];
    const record = {
      laws: [...lawIds],
      recipe,
      success,
      successRate,
      roll,
      timestamp: Date.now(),
      technique: targetTechnique
    };
    service.fusionRecords.push(record);
    if (success) {
      const technique = {
        id: recipe.id,
        name: recipe.name,
        power: recipe.power,
        effect: recipe.effect,
        laws: [...lawIds],
        masteredAt: Date.now()
      };
      if (!service.ultimateTechniques) service.ultimateTechniques = [];
      service.ultimateTechniques.push(technique);
      return {
        success: true,
        message: `\u878D\u5408\u6210\u529F! \u83B7\u5F97${recipe.name}`,
        recipe,
        technique,
        successRate
      };
    } else {
      return {
        success: false,
        message: `\u878D\u5408\u5931\u8D25(${Math.round(successRate * 100)}%\u6210\u529F\u7387)`,
        recipe,
        successRate
      };
    }
  }
  function unifyLaws(gameState3) {
    const service = getLawUnificationService(gameState3);
    if (!service.playerLaws) service.playerLaws = [];
    if (service.unification) {
      return {
        success: false,
        message: "\u5DF2\u5B8C\u6210\u4E07\u6CD5\u5F52\u4E00\uFF0C\u65E0\u6CD5\u518D\u6B21\u5F52\u4E00",
        unification: service.unification
      };
    }
    if (service.playerLaws.length < MIN_LAWS_FOR_UNIFICATION) {
      return {
        success: false,
        message: `\u9700\u8981\u81F3\u5C11${MIN_LAWS_FOR_UNIFICATION}\u79CD\u6CD5\u5219\u624D\u80FD\u5F52\u4E00\uFF0C\u5F53\u524D\u53EA\u6709${service.playerLaws.length}\u79CD`,
        required: MIN_LAWS_FOR_UNIFICATION,
        current: service.playerLaws.length
      };
    }
    const totalPower = service.playerLaws.reduce((sum, law) => sum + law.power, 0);
    const unifiedPower = totalPower + service.playerLaws.length * 5;
    service.unification = {
      achieved: true,
      achievedAt: Date.now(),
      lawsCount: service.playerLaws.length,
      totalPower,
      unifiedPower,
      bonuses: {
        cultivationSpeed: service.playerLaws.length * 10,
        breakthroughChance: service.playerLaws.length * 5,
        spiritualPower: service.playerLaws.length * 8
      }
    };
    if (!service.journal) service.journal = [];
    service.journal.push({
      type: "unification",
      message: `\u4E07\u6CD5\u5F52\u4E00\u5B8C\u6210\uFF0C\u878D\u5408${service.playerLaws.length}\u79CD\u6CD5\u5219`,
      timestamp: Date.now()
    });
    return {
      success: true,
      message: `\u4E07\u6CD5\u5F52\u4E00\u5B8C\u6210! \u878D\u5408${service.playerLaws.length}\u79CD\u6CD5\u5219`,
      unification: service.unification,
      bonuses: service.unification.bonuses
    };
  }
  function listUltimateTechniques(gameState3) {
    var _a;
    const service = getLawUnificationService(gameState3);
    const techniques = service.ultimateTechniques || [];
    return {
      techniques,
      count: techniques.length,
      hasUnification: !!service.unification,
      unificationPower: ((_a = service.unification) == null ? void 0 : _a.unifiedPower) || 0
    };
  }
  function evolveTechnique(gameState3, techniqueId) {
    var _a;
    const service = getLawUnificationService(gameState3);
    if (!service.ultimateTechniques) service.ultimateTechniques = [];
    const technique = service.ultimateTechniques.find((t) => t.id === techniqueId);
    if (!technique) {
      throw new Error(`\u672A\u627E\u5230\u795E\u901A: ${techniqueId}`);
    }
    const comprehension = ((_a = gameState3.player) == null ? void 0 : _a.comprehension) || 50;
    const evolveChance = 0.3 + comprehension * 2e-3;
    const success = Math.random() < evolveChance;
    if (!service.journal) service.journal = [];
    if (success) {
      const powerGain = Math.round(technique.power * 0.1);
      technique.power += powerGain;
      technique.evolvedAt = Date.now();
      service.journal.push({
        type: "evolve",
        message: `${technique.name}\u7CBE\u8FDB\u6210\u529F\uFF0C\u5A01\u529B+${powerGain}`,
        timestamp: Date.now()
      });
      return {
        success: true,
        message: `${technique.name}\u7CBE\u8FDB\u6210\u529F\uFF0C\u5A01\u529B+${powerGain}`,
        technique,
        newPower: technique.power
      };
    } else {
      service.journal.push({
        type: "evolve_fail",
        message: `${technique.name}\u7CBE\u8FDB\u5931\u8D25`,
        timestamp: Date.now()
      });
      return {
        success: false,
        message: `${technique.name}\u7CBE\u8FDB\u5931\u8D25`,
        technique
      };
    }
  }
  function verifyUnification(gameState3) {
    var _a, _b, _c, _d;
    const service = getLawUnificationService(gameState3);
    const status = {
      hasUnification: !!service.unification,
      lawsCount: ((_a = service.playerLaws) == null ? void 0 : _a.length) || 0,
      techniquesCount: ((_b = service.ultimateTechniques) == null ? void 0 : _b.length) || 0,
      fusionRecordsCount: ((_c = service.fusionRecords) == null ? void 0 : _c.length) || 0,
      journalCount: ((_d = service.journal) == null ? void 0 : _d.length) || 0
    };
    if (service.unification) {
      status.unification = service.unification;
      status.canEvolve = service.ultimateTechniques.length > 0;
      status.totalPower = service.unification.unifiedPower;
    }
    return status;
  }
  LawUnificationService.getMCPHandlers = function(gameState3) {
    return {
      "law.list": () => listLaws(gameState3),
      "law.comprehend": (params) => comprehendLaw(gameState3, params.lawId),
      "law.fuse": (params) => fuseLaws(gameState3, params.lawIds, params.targetTechnique),
      "law.unify": () => unifyLaws(gameState3),
      "law.technique": () => listUltimateTechniques(gameState3),
      "law.evolve": (params) => evolveTechnique(gameState3, params.techniqueId),
      "law.verify": () => verifyUnification(gameState3)
    };
  };
  var LAW_UNIFICATION_TOOLS = [
    { name: "law.list", description: "\u67E5\u770B\u6240\u6709\u53EF\u7528\u6CD5\u5219\u548C\u5DF2\u9886\u609F\u6CD5\u5219" },
    { name: "law.comprehend", description: "\u9886\u609F\u6307\u5B9A\u6CD5\u5219", params: ["lawId"] },
    { name: "law.fuse", description: "\u878D\u5408\u591A\u79CD\u6CD5\u5219\u521B\u9020\u7EC8\u6781\u795E\u901A", params: ["lawIds", "targetTechnique?"] },
    { name: "law.unify", description: "\u4E07\u6CD5\u5F52\u4E00\uFF08\u9700\u8981\u81F3\u5C113\u79CD\u6CD5\u5219\uFF09", params: [] },
    { name: "law.technique", description: "\u67E5\u770B\u7EC8\u6781\u795E\u901A\u5217\u8868", params: [] },
    { name: "law.evolve", description: "\u7CBE\u8FDB\u7EC8\u6781\u795E\u901A", params: ["techniqueId"] },
    { name: "law.verify", description: "\u9A8C\u8BC1\u4E07\u6CD5\u5F52\u4E00\u72B6\u6001", params: [] }
  ];
  var LAW_BONUS_SUCCESS_SUCCESS_RATE = 0.08;

  // src/domains/cultivation/services/MagicUnificationService.js
  var MAGIC_TYPES = {
    ELEMENTAL: "ELEMENTAL",
    // 元素系
    SPIRITUAL: "SPIRITUAL",
    // 灵魂系
    PHYSICAL: "PHYSICAL",
    // 肉体系
    CELESTIAL: "CELESTIAL",
    // 天系
    DEMONIC: "DEMONIC"
    // 魔系
  };
  var MAGIC_DB_KEY = "_magic_db";
  var _magicDB = null;
  function _initDB() {
    const existing = GameGlobal.getDB ? GameGlobal.getDB(MAGIC_DB_KEY) : null;
    if (existing) {
      _magicDB = existing;
    } else {
      _magicDB = {
        unifiedLevel: 0,
        masteredMagics: [],
        magicPower: 100,
        balanceScore: 50,
        fusionHistory: []
      };
      if (GameGlobal.setDB) GameGlobal.setDB(MAGIC_DB_KEY, _magicDB);
    }
  }
  function _saveDB() {
    if (GameGlobal.setDB) GameGlobal.setDB(MAGIC_DB_KEY, _magicDB);
  }
  var MAGIC_LIST = {
    "fireball": { name: "\u706B\u7403\u672F", type: "ELEMENTAL", power: 20, cost: 10 },
    "iceLance": { name: "\u51B0\u523A\u672F", type: "ELEMENTAL", power: 18, cost: 10 },
    "lightning": { name: "\u96F7\u51FB\u672F", type: "ELEMENTAL", power: 25, cost: 15 },
    "earthShield": { name: "\u571F\u76FE\u672F", type: "ELEMENTAL", power: 15, cost: 8 },
    "water Healing": { name: "\u6C34\u7597\u672F", type: "SPIRITUAL", power: 30, cost: 20 },
    "soulStrike": { name: "\u9B42\u51FB\u672F", type: "SPIRITUAL", power: 35, cost: 25 },
    "bodyHardening": { name: "\u91D1\u8EAB\u672F", type: "PHYSICAL", power: 20, cost: 12 },
    "tigerFist": { name: "\u864E\u62F3\u672F", type: "PHYSICAL", power: 28, cost: 18 },
    "starArrow": { name: "\u661F\u7BAD\u672F", type: "CELESTIAL", power: 40, cost: 30 },
    "moonBeam": { name: "\u6708\u5149\u672F", type: "CELESTIAL", power: 35, cost: 25 },
    "demonFire": { name: "\u9B54\u7130\u672F", type: "DEMONIC", power: 45, cost: 35 },
    "darkBlade": { name: "\u6697\u5203\u672F", type: "DEMONIC", power: 42, cost: 32 }
  };
  function _calcFusionPower(m1, m2) {
    const p1 = m1.power * (1 + _magicDB.unifiedLevel * 0.1);
    const p2 = m2.power * (1 + _magicDB.unifiedLevel * 0.1);
    const synergy = m1.type === m2.type ? 1.5 : 1;
    return Math.floor((p1 + p2) * synergy);
  }
  function _updateBalance(type) {
    const typeWeights = { ELEMENTAL: 20, SPIRITUAL: 20, PHYSICAL: 20, CELESTIAL: 20, DEMONIC: 20 };
    const weight = typeWeights[type] || 10;
    _magicDB.balanceScore = Math.min(100, Math.max(0, _magicDB.balanceScore + (Math.random() > 0.5 ? weight : -weight)));
  }
  function queryMagicStatus() {
    _initDB();
    const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute("level") : 1;
    return {
      success: true,
      status: { unifiedLevel: _magicDB.unifiedLevel, magicPower: _magicDB.magicPower, balanceScore: _magicDB.balanceScore, masteredCount: _magicDB.masteredMagics.length },
      masteredMagics: _magicDB.masteredMagics.map((m) => ({ ...m, currentPower: Math.floor(m.basePower * (1 + _magicDB.unifiedLevel * 0.1)) })),
      availableMagics: Object.entries(MAGIC_LIST).map(([id, cfg]) => ({ id, ...cfg })),
      typeDistribution: Object.keys(MAGIC_TYPES).map((t) => ({ type: t, count: _magicDB.masteredMagics.filter((m) => m.type === t).length }))
    };
  }
  function analyzeEntityMagic(entityId) {
    _initDB();
    const entity = entityId === "player" ? GameGlobal.getPlayerAttribute ? { level: GameGlobal.getPlayerAttribute("level"), spiritRoot: GameGlobal.getPlayerAttribute("spiritRoot") || 1 } : { level: 1, spiritRoot: 1 } : null;
    if (!entity) return { success: false, error: `\u5B9E\u4F53 ${entityId} \u4E0D\u5B58\u5728` };
    const potential = Math.floor(entity.level * 5 + entity.spiritRoot * 10);
    const affinity = Object.keys(MAGIC_TYPES).map((t) => ({ type: t, score: Math.floor(Math.random() * 40 + 60) }));
    return { success: true, entity: { id: entityId, level: entity.level, spiritRoot: entity.spiritRoot, potential, affinity } };
  }
  function balanceMagic() {
    _initDB();
    if (_magicDB.magicPower < 50) return { success: false, error: "\u6CD5\u529B\u4E0D\u8DB3\uFF08\u9700\u898150\uFF09" };
    _magicDB.magicPower -= 50;
    const before = _magicDB.balanceScore;
    _magicDB.balanceScore = 50;
    const magicsToBoost = _magicDB.masteredMagics.filter((m) => m.type === Object.keys(MAGIC_TYPES)[Math.floor(Math.random() * 5)]);
    magicsToBoost.forEach((m) => m.basePower = Math.floor(m.basePower * 1.1));
    _saveDB();
    return { success: true, message: "\u6CD5\u529B\u5E73\u8861\u5B8C\u6210", balanceScore: 50, magicPower: _magicDB.magicPower, boosted: magicsToBoost.length };
  }
  function unifyMagics(sourceMagicId, targetMagicId) {
    _initDB();
    const source = MAGIC_LIST[sourceMagicId];
    const target = MAGIC_LIST[targetMagicId];
    if (!source) return { success: false, error: `\u6CD5\u672F ${sourceMagicId} \u4E0D\u5B58\u5728` };
    if (!target) return { success: false, error: `\u6CD5\u672F ${targetMagicId} \u4E0D\u5B58\u5728` };
    if (_magicDB.magicPower < source.cost + target.cost) return { success: false, error: "\u6CD5\u529B\u4E0D\u8DB3" };
    if (_magicDB.masteredMagics.length >= 10 && !_magicDB.masteredMagics.find((m) => m.id === sourceMagicId)) return { success: false, error: "\u5DF2\u8FBE\u4E0A\u9650\uFF0810\u4E2A\u6CD5\u672F\uFF09\uFF0C\u9700\u9057\u5FD8\u65E7\u6CD5\u672F" };
    _magicDB.magicPower -= source.cost + target.cost;
    const newPower = _calcFusionPower(source, target);
    const resultId = `${sourceMagicId}_${targetMagicId}`;
    const resultName = `${source.name}+${target.name}`;
    const existing = _magicDB.masteredMagics.find((m) => m.id === resultId);
    if (existing) {
      existing.basePower = newPower;
      existing.fusionCount++;
    } else {
      _magicDB.masteredMagics.push({ id: resultId, name: resultName, type: source.type, basePower: newPower, cost: Math.floor((source.cost + target.cost) * 0.7), fusionCount: 1, masteredAt: Date.now() });
    }
    _magicDB.unifiedLevel++;
    _updateBalance(source.type);
    _magicDB.fusionHistory.push({ source: sourceMagicId, target: targetMagicId, power: newPower, at: Date.now() });
    _saveDB();
    return { success: true, message: `\u878D\u5408\u6210\u529F\uFF1A${resultName}\uFF0C\u5A01\u529B ${newPower}`, unifiedLevel: _magicDB.unifiedLevel, newMagic: { id: resultId, name: resultName, power: newPower, type: source.type } };
  }
  function forgetMagic(magicId) {
    _initDB();
    const idx = _magicDB.masteredMagics.findIndex((m) => m.id === magicId);
    if (idx === -1) return { success: false, error: `\u672A\u5B66\u4F1A\u6B64\u6CD5\u672F ${magicId}` };
    _magicDB.masteredMagics.splice(idx, 1);
    _saveDB();
    return { success: true, message: `\u5DF2\u9057\u5FD8 ${magicId}` };
  }
  var MAGIC_MCP_TOOLS = [
    { name: "magic.query", description: "\u67E5\u8BE2\u6CD5\u529B\u72B6\u6001", params: {} },
    { name: "magic.analyze", description: "\u5206\u6790\u5B9E\u4F53\u6CD5\u529B", params: { entityId: "string" } },
    { name: "magic.unify", description: "\u878D\u5408\u4E24\u4E2A\u6CD5\u672F", params: { sourceMagicId: "string", targetMagicId: "string" } },
    { name: "magic.balance", description: "\u5E73\u8861\u6CD5\u529B", params: {} },
    { name: "magic.forget", description: "\u9057\u5FD8\u6CD5\u672F", params: { magicId: "string" } }
  ];

  // src/domains/cultivation/services/CaveHeavenService.js
  var CAVE_HEAVEN_LEVELS = {
    "\u5C0F\u6D1E\u5929": { minLevel: 1, \u7075\u6C14\u52A0\u6210: 1, \u5EFA\u8BBE\u5EA6\u4E0A\u9650: 100, tierIndex: 0 },
    "\u4E2D\u6D1E\u5929": { minLevel: 10, \u7075\u6C14\u52A0\u6210: 1.5, \u5EFA\u8BBE\u5EA6\u4E0A\u9650: 500, tierIndex: 1 },
    "\u5927\u6D1E\u5929": { minLevel: 30, \u7075\u6C14\u52A0\u6210: 2, \u5EFA\u8BBE\u5EA6\u4E0A\u9650: 2e3, tierIndex: 2 },
    "\u6D1E\u5929\u798F\u5730": { minLevel: 60, \u7075\u6C14\u52A0\u6210: 3, \u5EFA\u8BBE\u5EA6\u4E0A\u9650: 1e4, tierIndex: 3 },
    "\u5929\u5E9C": { minLevel: 100, \u7075\u6C14\u52A0\u6210: 5, \u5EFA\u8BBE\u5EA6\u4E0A\u9650: 99999, tierIndex: 4 }
  };
  var CAVE_LEVEL_ORDER = ["\u5C0F\u6D1E\u5929", "\u4E2D\u6D1E\u5929", "\u5927\u6D1E\u5929", "\u6D1E\u5929\u798F\u5730", "\u5929\u5E9C"];
  var CAVE_BUILDINGS = {
    "\u4FEE\u70BC\u5BA4": { cost: 50, \u8D44\u6E90\u7C7B\u578B: "\u7075\u6C14", \u4EA7\u51FA\u91CF: 10, \u5EFA\u8BBE\u65F6\u95F4: 60 },
    "\u4E39\u623F": { cost: 100, \u8D44\u6E90\u7C7B\u578B: "\u4E39\u836F", \u4EA7\u51FA\u91CF: 5, \u5EFA\u8BBE\u65F6\u95F4: 120 },
    "\u70BC\u5668\u5BA4": { cost: 100, \u8D44\u6E90\u7C7B\u578B: "\u6CD5\u5668", \u4EA7\u51FA\u91CF: 3, \u5EFA\u8BBE\u65F6\u95F4: 120 },
    "\u7075\u8349\u56ED": { cost: 80, \u8D44\u6E90\u7C7B\u578B: "\u7075\u8349", \u4EA7\u51FA\u91CF: 15, \u5EFA\u8BBE\u65F6\u95F4: 90 },
    "\u85CF\u7ECF\u9601": { cost: 200, \u8D44\u6E90\u7C7B\u578B: "\u529F\u6CD5", \u4EA7\u51FA\u91CF: 2, \u5EFA\u8BBE\u65F6\u95F4: 180 }
  };
  var BUILDING_LEVEL_MULTIPLIERS = {
    1: 1,
    2: 1.5,
    3: 2,
    4: 3,
    5: 5
  };
  var CAVE_FACILITIES = {
    "\u7075\u6C60": {
      cost: 200,
      resourceType: "\u7075\u6C14",
      output: 50,
      buildTime: 180,
      description: "\u805A\u96C6\u5929\u5730\u7075\u6C14\uFF0C\u63D0\u5347\u4FEE\u70BC\u6548\u7387"
    },
    "\u836F\u56ED": {
      cost: 150,
      resourceType: "\u7075\u8349",
      output: 30,
      buildTime: 120,
      description: "\u79CD\u690D\u7075\u8349\uFF0C\u53EF\u4EA7\u51FA\u70BC\u4E39\u6750\u6599"
    },
    "\u77FF\u8109": {
      cost: 300,
      resourceType: "\u77FF\u77F3",
      output: 20,
      buildTime: 240,
      description: "\u5F00\u91C7\u7075\u77FF\uFF0C\u4EA7\u51FA\u70BC\u5668\u6750\u6599"
    },
    "\u9635\u6CD5": {
      cost: 250,
      resourceType: "\u9635\u6CD5\u7ECF\u9A8C",
      output: 15,
      buildTime: 200,
      description: "\u5E03\u7F6E\u9635\u6CD5\uFF0C\u53EF\u63D0\u5347\u6D1E\u5E9C\u9632\u62A4\u548C\u4EA7\u51FA"
    }
  };
  var CAVE_UPGRADE_COSTS = {
    "\u5C0F\u6D1E\u5929": 0,
    "\u4E2D\u6D1E\u5929": 100,
    "\u5927\u6D1E\u5929": 500,
    "\u6D1E\u5929\u798F\u5730": 2e3,
    "\u5929\u5E9C": 1e4
  };
  var _caveHeavenDatabase = /* @__PURE__ */ new Map();
  var _caveIdCounter = 0;
  function createCaveHeavenService(gameState3) {
    return new CaveHeavenService(gameState3);
  }
  var CaveHeavenService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this._ensureCaveData();
    }
    _ensureCaveData() {
      if (!this.gameState.caveHeaven) {
        this.gameState.caveHeaven = {
          \u7B49\u7EA7: "\u5C0F\u6D1E\u5929",
          \u5EFA\u8BBE\u5EA6: 0,
          \u7075\u6C14\u6D53\u5EA6: 1,
          \u5EFA\u7B51: {},
          \u5347\u7EA7\u5386\u53F2: []
        };
      }
      if (!this.gameState.caveHeaven.\u5EFA\u7B51) {
        this.gameState.caveHeaven.\u5EFA\u7B51 = {};
      }
    }
    // ===== 洞天等级系统 =====
    /**
     * 获取当前洞天等级
     */
    getCaveLevel() {
      return this.gameState.caveHeaven.\u7B49\u7EA7;
    }
    /**
     * 获取洞天信息
     */
    getCaveInfo() {
      const cave = this.gameState.caveHeaven;
      const levelInfo = CAVE_HEAVEN_LEVELS[cave.\u7B49\u7EA7];
      return {
        \u7B49\u7EA7: cave.\u7B49\u7EA7,
        \u5EFA\u8BBE\u5EA6: cave.\u5EFA\u8BBE\u5EA6,
        \u7075\u6C14\u6D53\u5EA6: cave.\u7075\u6C14\u6D53\u5EA6,
        \u5EFA\u8BBE\u5EA6\u4E0A\u9650: levelInfo.\u5EFA\u8BBE\u5EA6\u4E0A\u9650,
        \u7075\u6C14\u52A0\u6210: levelInfo.\u7075\u6C14\u52A0\u6210,
        \u5EFA\u7B51\u6570\u91CF: Object.keys(cave.\u5EFA\u7B51).length
      };
    }
    /**
     * 升级洞天
     */
    upgradeCaveHeaven() {
      const cave = this.gameState.caveHeaven;
      const currentLevel = cave.\u7B49\u7EA7;
      const currentIndex = CAVE_LEVEL_ORDER.indexOf(currentLevel);
      if (currentIndex >= CAVE_LEVEL_ORDER.length - 1) {
        return { success: false, message: "\u5DF2\u8FBE\u6700\u9AD8\u6D1E\u5929\u7B49\u7EA7" };
      }
      const nextLevel = CAVE_LEVEL_ORDER[currentIndex + 1];
      const requiredConstruction = CAVE_UPGRADE_COSTS[nextLevel];
      if (cave.\u5EFA\u8BBE\u5EA6 < requiredConstruction) {
        return {
          success: false,
          message: `\u5EFA\u8BBE\u5EA6\u4E0D\u8DB3\uFF0C\u9700\u8981${requiredConstruction}\u70B9\uFF0C\u5F53\u524D${cave.\u5EFA\u8BBE\u5EA6}\u70B9`
        };
      }
      cave.\u7B49\u7EA7 = nextLevel;
      cave.\u7075\u6C14\u6D53\u5EA6 = CAVE_HEAVEN_LEVELS[nextLevel].\u7075\u6C14\u52A0\u6210;
      this.gameState.caveHeaven.\u5347\u7EA7\u5386\u53F2.push({
        from: currentLevel,
        to: nextLevel,
        timestamp: Date.now()
      });
      return {
        success: true,
        message: `\u6D1E\u5929\u5347\u7EA7\u6210\u529F\uFF1A${currentLevel} \u2192 ${nextLevel}`,
        newLevel: nextLevel,
        \u7075\u6C14\u52A0\u6210: cave.\u7075\u6C14\u6D53\u5EA6
      };
    }
    /**
     * 检查洞天升级条件
     */
    canUpgradeCaveHeaven() {
      const cave = this.gameState.caveHeaven;
      const currentLevel = cave.\u7B49\u7EA7;
      const currentIndex = CAVE_LEVEL_ORDER.indexOf(currentLevel);
      if (currentIndex >= CAVE_LEVEL_ORDER.length - 1) {
        return { canUpgrade: false, reason: "\u5DF2\u8FBE\u6700\u9AD8\u7B49\u7EA7" };
      }
      const nextLevel = CAVE_LEVEL_ORDER[currentIndex + 1];
      const requiredConstruction = CAVE_UPGRADE_COSTS[nextLevel];
      if (cave.\u5EFA\u8BBE\u5EA6 < requiredConstruction) {
        return {
          canUpgrade: false,
          required: requiredConstruction,
          current: cave.\u5EFA\u8BBE\u5EA6,
          reason: `\u5EFA\u8BBE\u5EA6\u4E0D\u8DB3`
        };
      }
      return { canUpgrade: true, nextLevel };
    }
    // ===== 建筑系统 =====
    /**
     * 建造建筑
     */
    buildBuilding(buildingType, position = null) {
      var _a;
      if (!CAVE_BUILDINGS[buildingType]) {
        throw new Error(`\u672A\u77E5\u5EFA\u7B51\u7C7B\u578B: ${buildingType}`);
      }
      const cave = this.gameState.caveHeaven;
      const buildingDef = CAVE_BUILDINGS[buildingType];
      if ((((_a = this.gameState.player) == null ? void 0 : _a.spiritStones) || 0) < buildingDef.cost) {
        return { success: false, message: "\u7075\u77F3\u4E0D\u8DB3" };
      }
      this.gameState.player.spiritStones = (this.gameState.player.spiritStones || 0) - buildingDef.cost;
      const buildingId = `${buildingType}_${Date.now()}`;
      cave.\u5EFA\u7B51[buildingId] = {
        \u7C7B\u578B: buildingType,
        \u7B49\u7EA7: 1,
        \u4F4D\u7F6E: position,
        \u5EFA\u9020\u65F6\u95F4: Date.now(),
        \u603B\u4EA7\u51FA: 0
      };
      return {
        success: true,
        message: `${buildingType}\u5EFA\u9020\u6210\u529F`,
        buildingId,
        \u5269\u4F59\u7075\u77F3: this.gameState.player.spiritStones
      };
    }
    /**
     * 升级建筑
     */
    upgradeBuilding(buildingId) {
      var _a;
      const cave = this.gameState.caveHeaven;
      const building = cave.\u5EFA\u7B51[buildingId];
      if (!building) {
        return { success: false, message: "\u5EFA\u7B51\u4E0D\u5B58\u5728" };
      }
      const buildingDef = CAVE_BUILDINGS[building.\u7C7B\u578B];
      const upgradeCost = buildingDef.cost * building.\u7B49\u7EA7;
      if ((((_a = this.gameState.player) == null ? void 0 : _a.spiritStones) || 0) < upgradeCost) {
        return { success: false, message: "\u7075\u77F3\u4E0D\u8DB3" };
      }
      if (building.\u7B49\u7EA7 >= 5) {
        return { success: false, message: "\u5DF2\u8FBE\u5EFA\u7B51\u6700\u9AD8\u7B49\u7EA7" };
      }
      this.gameState.player.spiritStones = (this.gameState.player.spiritStones || 0) - upgradeCost;
      building.\u7B49\u7EA7 += 1;
      building.\u4E0A\u6B21\u5347\u7EA7\u65F6\u95F4 = Date.now();
      return {
        success: true,
        message: `${building.\u7C7B\u578B}\u5347\u7EA7\u81F3${building.\u7B49\u7EA7}\u7EA7`,
        newLevel: building.\u7B49\u7EA7,
        \u5269\u4F59\u7075\u77F3: this.gameState.player.spiritStones
      };
    }
    /**
     * 获取建筑列表
     */
    listBuildings() {
      const cave = this.gameState.caveHeaven;
      return Object.entries(cave.\u5EFA\u7B51).map(([id, b]) => ({
        id,
        \u7C7B\u578B: b.\u7C7B\u578B,
        \u7B49\u7EA7: b.\u7B49\u7EA7,
        \u4F4D\u7F6E: b.\u4F4D\u7F6E,
        \u4EA7\u51FA\u91CF: CAVE_BUILDINGS[b.\u7C7B\u578B].\u4EA7\u51FA\u91CF * (BUILDING_LEVEL_MULTIPLIERS[b.\u7B49\u7EA7] || 1)
      }));
    }
    /**
     * 计算总产出
     */
    calculateTotalOutput() {
      const buildings = this.listBuildings();
      const output = {};
      for (const b of buildings) {
        const def = CAVE_BUILDINGS[b.\u7C7B\u578B];
        if (!output[def.\u8D44\u6E90\u7C7B\u578B]) {
          output[def.\u8D44\u6E90\u7C7B\u578B] = 0;
        }
        output[def.\u8D44\u6E90\u7C7B\u578B] += b.\u4EA7\u51FA\u91CF;
      }
      return output;
    }
    /**
     * 添加建设度
     */
    addConstruction(points) {
      const cave = this.gameState.caveHeaven;
      cave.\u5EFA\u8BBE\u5EA6 += points;
      const levelInfo = CAVE_HEAVEN_LEVELS[cave.\u7B49\u7EA7];
      if (cave.\u5EFA\u8BBE\u5EA6 > levelInfo.\u5EFA\u8BBE\u5EA6\u4E0A\u9650) {
        cave.\u5EFA\u8BBE\u5EA6 = levelInfo.\u5EFA\u8BBE\u5EA6\u4E0A\u9650;
      }
      return {
        success: true,
        \u5EFA\u8BBE\u5EA6: cave.\u5EFA\u8BBE\u5EA6,
        \u5EFA\u8BBE\u5EA6\u4E0A\u9650: levelInfo.\u5EFA\u8BBE\u5EA6\u4E0A\u9650
      };
    }
    // ===== 灵界洞府系统 (MCP工具) =====
    /**
     * 创建灵界洞府
     * @param {string} name - 洞府名称
     */
    createCaveHeaven(name) {
      const id = `cave_${++_caveIdCounter}_${Date.now()}`;
      const caveData = {
        id,
        name,
        level: "\u5C0F\u6D1E\u5929",
        constructionPoints: 0,
        spiritConcentration: 1,
        facilities: {},
        facilityHistory: [],
        createdAt: Date.now(),
        lastCollectedAt: Date.now()
      };
      _caveHeavenDatabase.set(id, caveData);
      return {
        success: true,
        message: `\u7075\u754C\u6D1E\u5E9C\u300C${name}\u300D\u521B\u5EFA\u6210\u529F`,
        id,
        name,
        level: "\u5C0F\u6D1E\u5929"
      };
    }
    /**
     * 升级洞府等级 (按ID)
     * @param {string} id - 洞府ID
     * @param {number} targetLevel - 目标等级
     */
    upgradeCaveHeavenById(id, targetLevel) {
      const cave = _caveHeavenDatabase.get(id);
      if (!cave) {
        return { success: false, message: "\u6D1E\u5E9C\u4E0D\u5B58\u5728" };
      }
      const currentIndex = CAVE_LEVEL_ORDER.indexOf(cave.level);
      const levelNum = typeof targetLevel === "string" ? CAVE_LEVEL_ORDER.indexOf(targetLevel) + 1 : targetLevel;
      if (levelNum <= currentIndex) {
        return { success: false, message: "\u76EE\u6807\u7B49\u7EA7\u4E0D\u80FD\u4F4E\u4E8E\u5F53\u524D\u7B49\u7EA7" };
      }
      const nextLevelName = CAVE_LEVEL_ORDER[levelNum - 1];
      const upgradeCost = CAVE_UPGRADE_COSTS[nextLevelName] || 0;
      if (cave.constructionPoints < upgradeCost) {
        return {
          success: false,
          message: `\u5EFA\u8BBE\u5EA6\u4E0D\u8DB3\uFF0C\u9700\u8981${upgradeCost}\u70B9\uFF0C\u5F53\u524D${cave.constructionPoints}\u70B9`
        };
      }
      cave.level = nextLevelName;
      cave.spiritConcentration = CAVE_HEAVEN_LEVELS[nextLevelName].\u7075\u6C14\u52A0\u6210;
      cave.constructionPoints -= upgradeCost;
      return {
        success: true,
        message: `\u6D1E\u5E9C\u5347\u7EA7\u6210\u529F\uFF1A${cave.level} \u2192 ${nextLevelName}`,
        newLevel: nextLevelName,
        spiritConcentration: cave.spiritConcentration,
        remainingConstructionPoints: cave.constructionPoints
      };
    }
    /**
     * 采集洞府产出
     * @param {string} id - 洞府ID
     */
    collectFromCave(id) {
      const cave = _caveHeavenDatabase.get(id);
      if (!cave) {
        return { success: false, message: "\u6D1E\u5E9C\u4E0D\u5B58\u5728" };
      }
      const now = Date.now();
      const timePassed = (now - cave.lastCollectedAt) / 1e3;
      const facilities = Object.values(cave.facilities);
      if (facilities.length === 0) {
        return { success: false, message: "\u6D1E\u5E9C\u5185\u6CA1\u6709\u8BBE\u65BD\uFF0C\u8BF7\u5148\u5EFA\u9020\u8BBE\u65BD" };
      }
      const output = {};
      let totalOutputValue = 0;
      for (const facility of facilities) {
        const def = CAVE_FACILITIES[facility.type];
        if (def) {
          const timeMultiplier = Math.max(1, Math.floor(timePassed / 60));
          const levelMultiplier = BUILDING_LEVEL_MULTIPLIERS[facility.level] || 1;
          const amount = Math.floor(def.output * levelMultiplier * timeMultiplier);
          if (!output[def.resourceType]) {
            output[def.resourceType] = 0;
          }
          output[def.resourceType] += amount;
          totalOutputValue += amount;
          facility.totalOutput = (facility.totalOutput || 0) + amount;
        }
      }
      cave.lastCollectedAt = now;
      return {
        success: true,
        message: `\u91C7\u96C6\u6210\u529F\uFF0C\u83B7\u5F97${totalOutputValue}\u70B9\u8D44\u6E90`,
        output,
        totalOutput: totalOutputValue,
        timePassed,
        facilitiesCount: facilities.length
      };
    }
    /**
     * 建造设施
     * @param {string} id - 洞府ID
     * @param {string} facilityType - 设施类型
     */
    buildFacility(id, facilityType) {
      var _a;
      const cave = _caveHeavenDatabase.get(id);
      if (!cave) {
        return { success: false, message: "\u6D1E\u5E9C\u4E0D\u5B58\u5728" };
      }
      if (!CAVE_FACILITIES[facilityType]) {
        return { success: false, message: `\u672A\u77E5\u8BBE\u65BD\u7C7B\u578B: ${facilityType}` };
      }
      const def = CAVE_FACILITIES[facilityType];
      if ((((_a = this.gameState.player) == null ? void 0 : _a.spiritStones) || 0) < def.cost) {
        return { success: false, message: "\u7075\u77F3\u4E0D\u8DB3" };
      }
      this.gameState.player.spiritStones -= def.cost;
      const facilityId = `facility_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      cave.facilities[facilityId] = {
        id: facilityId,
        type: facilityType,
        level: 1,
        builtAt: Date.now(),
        totalOutput: 0
      };
      cave.constructionPoints += Math.floor(def.cost / 2);
      return {
        success: true,
        message: `${facilityType}\u5EFA\u9020\u6210\u529F`,
        facilityId,
        remainingSpiritStones: this.gameState.player.spiritStones,
        constructionPointsGained: Math.floor(def.cost / 2)
      };
    }
    /**
     * 查询洞府状态
     * @param {string} id - 洞府ID
     */
    queryCaveHeaven(id) {
      const cave = _caveHeavenDatabase.get(id);
      if (!cave) {
        return { success: false, message: "\u6D1E\u5E9C\u4E0D\u5B58\u5728" };
      }
      const levelInfo = CAVE_HEAVEN_LEVELS[cave.level];
      const facilities = Object.values(cave.facilities).map((f) => {
        var _a;
        return {
          id: f.id,
          type: f.type,
          level: f.level,
          totalOutput: f.totalOutput,
          outputPerMinute: (((_a = CAVE_FACILITIES[f.type]) == null ? void 0 : _a.output) || 0) * (BUILDING_LEVEL_MULTIPLIERS[f.level] || 1)
        };
      });
      const now = Date.now();
      const timeSinceLastCollect = Math.floor((now - cave.lastCollectedAt) / 1e3);
      return {
        success: true,
        id: cave.id,
        name: cave.name,
        level: cave.level,
        levelInfo: {
          constructionLimit: levelInfo.\u5EFA\u8BBE\u5EA6\u4E0A\u9650,
          spiritBonus: levelInfo.\u7075\u6C14\u52A0\u6210
        },
        constructionPoints: cave.constructionPoints,
        spiritConcentration: cave.spiritConcentration,
        facilities,
        totalFacilities: facilities.length,
        createdAt: cave.createdAt,
        lastCollectedAt: cave.lastCollectedAt,
        timeSinceLastCollect
      };
    }
    /**
     * 获取玩家所有洞府列表
     */
    listAllCaves() {
      return Array.from(_caveHeavenDatabase.values()).map((cave) => ({
        id: cave.id,
        name: cave.name,
        level: cave.level,
        facilitiesCount: Object.keys(cave.facilities).length,
        constructionPoints: cave.constructionPoints
      }));
    }
    /**
     * 升级设施
     * @param {string} caveId - 洞府ID
     * @param {string} facilityId - 设施ID
     */
    upgradeFacility(caveId, facilityId) {
      var _a;
      const cave = _caveHeavenDatabase.get(caveId);
      if (!cave) {
        return { success: false, message: "\u6D1E\u5E9C\u4E0D\u5B58\u5728" };
      }
      const facility = cave.facilities[facilityId];
      if (!facility) {
        return { success: false, message: "\u8BBE\u65BD\u4E0D\u5B58\u5728" };
      }
      if (facility.level >= 5) {
        return { success: false, message: "\u8BBE\u65BD\u5DF2\u8FBE\u6700\u9AD8\u7B49\u7EA7" };
      }
      const def = CAVE_FACILITIES[facility.type];
      const upgradeCost = def.cost * facility.level;
      if ((((_a = this.gameState.player) == null ? void 0 : _a.spiritStones) || 0) < upgradeCost) {
        return { success: false, message: "\u7075\u77F3\u4E0D\u8DB3" };
      }
      this.gameState.player.spiritStones -= upgradeCost;
      facility.level += 1;
      facility.upgradedAt = Date.now();
      return {
        success: true,
        message: `${facility.type}\u5347\u7EA7\u81F3${facility.level}\u7EA7`,
        facilityId,
        newLevel: facility.level,
        remainingSpiritStones: this.gameState.player.spiritStones
      };
    }
    /**
     * 销毁设施
     * @param {string} caveId - 洞府ID
     * @param {string} facilityId - 设施ID
     */
    demolishFacility(caveId, facilityId) {
      const cave = _caveHeavenDatabase.get(caveId);
      if (!cave) {
        return { success: false, message: "\u6D1E\u5E9C\u4E0D\u5B58\u5728" };
      }
      if (!cave.facilities[facilityId]) {
        return { success: false, message: "\u8BBE\u65BD\u4E0D\u5B58\u5728" };
      }
      const facility = cave.facilities[facilityId];
      delete cave.facilities[facilityId];
      return {
        success: true,
        message: `${facility.type}\u5DF2\u62C6\u9664`,
        demolitionRefund: Math.floor(CAVE_FACILITIES[facility.type].cost * 0.3)
      };
    }
  };
  function createCaveHeaven(gameState3, name) {
    const service = createCaveHeavenService(gameState3);
    return service.createCaveHeaven(name);
  }
  function upgradeCaveHeavenById(gameState3, id, targetLevel) {
    const service = createCaveHeavenService(gameState3);
    return service.upgradeCaveHeavenById(id, targetLevel);
  }
  function collectFromCave(gameState3, id) {
    const service = createCaveHeavenService(gameState3);
    return service.collectFromCave(id);
  }
  function buildCaveFacility(gameState3, id, facility) {
    const service = createCaveHeavenService(gameState3);
    return service.buildFacility(id, facility);
  }
  function queryCaveHeaven(gameState3, id) {
    const service = createCaveHeavenService(gameState3);
    return service.queryCaveHeaven(id);
  }
  var CAVE_HEAVEN_MCP_TOOLS = [
    { name: "caveheaven.create", description: "\u521B\u5EFA\u7075\u754C\u6D1E\u5E9C", params: ["name"] },
    { name: "caveheaven.upgrade", description: "\u5347\u7EA7\u6D1E\u5E9C\u7B49\u7EA7", params: ["id", "targetLevel"] },
    { name: "caveheaven.collect", description: "\u91C7\u96C6\u6D1E\u5E9C\u4EA7\u51FA", params: ["id"] },
    { name: "caveheaven.build", description: "\u5EFA\u9020\u8BBE\u65BD", params: ["id", "facility"] },
    { name: "caveheaven.query", description: "\u67E5\u8BE2\u6D1E\u5E9C\u72B6\u6001", params: ["id"] }
  ];

  // src/domains/cultivation/services/SpiritBeastService.js
  var SPIRIT_BEAST_TIERS = {
    "\u5E7C\u5E74\u671F": { minLevel: 1, maxLevel: 10, evolutionItems: ["\u7075\u517D\u86CB"], tierIndex: 0 },
    "\u6210\u957F\u671F": { minLevel: 11, maxLevel: 30, evolutionItems: ["\u8FDB\u5316\u4E39", "\u7075\u8349"], tierIndex: 1 },
    "\u6210\u719F\u671F": { minLevel: 31, maxLevel: 60, evolutionItems: ["\u4ED9\u9732", "\u795E\u8BC6\u679C"], tierIndex: 2 },
    "\u5316\u5F62\u671F": { minLevel: 61, maxLevel: 90, evolutionItems: ["\u5316\u5F62\u8349", "\u5929\u96F7\u73E0"], tierIndex: 3 },
    "\u795E\u517D\u671F": { minLevel: 91, maxLevel: 999, evolutionItems: ["\u795E\u517D\u7CBE\u8840", "\u5929\u9053\u6CD5\u5219"], tierIndex: 4 }
  };
  var TIER_ORDER = ["\u5E7C\u5E74\u671F", "\u6210\u957F\u671F", "\u6210\u719F\u671F", "\u5316\u5F62\u671F", "\u795E\u517D\u671F"];
  var TIER_SKILLS = {
    "\u5E7C\u5E74\u671F": [],
    "\u6210\u957F\u671F": ["\u7075\u89C6", "\u611F\u77E5"],
    "\u6210\u719F\u671F": ["\u7075\u89C6", "\u611F\u77E5", "\u7075\u98CE"],
    "\u5316\u5F62\u671F": ["\u7075\u89C6", "\u611F\u77E5", "\u7075\u98CE", "\u4ED9\u98CE"],
    "\u795E\u517D\u671F": ["\u7075\u89C6", "\u611F\u77E5", "\u7075\u98CE", "\u4ED9\u98CE", "\u795E\u4F51"]
  };
  var EVOLUTION_BRANCHES = {
    "\u5E7C\u5E74\u671F": [
      { id: "beast_type_a", name: "\u7075\u72D0", description: "\u7075\u5DE7\u578B\u4ED9\u5BA0", statBonus: { agility: 10 } },
      { id: "beast_type_b", name: "\u7075\u718A", description: "\u529B\u91CF\u578B\u4ED9\u5BA0", statBonus: { strength: 10 } },
      { id: "beast_type_c", name: "\u7075\u9E64", description: "\u667A\u6167\u578B\u4ED9\u5BA0", statBonus: { wisdom: 10 } }
    ],
    "\u6210\u957F\u671F": [
      { id: "fierce", name: "\u731B\u517D\u7CFB", description: "\u5F3A\u5316\u653B\u51FB", statBonus: { attack: 15 } },
      { id: "guard", name: "\u5B88\u62A4\u7CFB", description: "\u5F3A\u5316\u9632\u5FA1", statBonus: { defense: 15 } }
    ],
    "\u6210\u719F\u671F": [
      { id: "celestial", name: "\u4ED9\u9053\u7CFB", description: "\u589E\u52A0\u7075\u529B", statBonus: { spiritual: 20 } },
      { id: "demon", name: "\u5996\u9053\u7CFB", description: "\u589E\u52A0\u66B4\u51FB", statBonus: { critRate: 5 } },
      { id: "balance", name: "\u5E73\u8861\u7CFB", description: "\u5C5E\u6027\u5747\u8861", statBonus: { attack: 10, defense: 10 } }
    ],
    "\u5316\u5F62\u671F": [
      { id: "divine", name: "\u795E\u9053\u7CFB", description: "\u589E\u52A0\u795E\u8BC6", statBonus: { divine: 25 } },
      { id: "dragon", name: "\u9F99\u7CFB", description: "\u589E\u52A0\u751F\u547D", statBonus: { health: 30 } }
    ],
    "\u795E\u517D\u671F": [
      { id: "phoenix", name: "\u51E4\u51F0\u7CFB", description: "\u6D85\u69C3\u91CD\u751F", statBonus: { rebirth: 1 } },
      { id: "titan", name: "\u6CF0\u5766\u7CFB", description: "\u7EDD\u5BF9\u529B\u91CF", statBonus: { power: 50 } }
    ]
  };
  var EVOLUTION_ITEM_COSTS = {
    "\u5E7C\u5E74\u671F": { "\u7075\u517D\u86CB": 1 },
    "\u6210\u957F\u671F": { "\u8FDB\u5316\u4E39": 1, "\u7075\u8349": 2 },
    "\u6210\u719F\u671F": { "\u4ED9\u9732": 1, "\u795E\u8BC6\u679C": 1 },
    "\u5316\u5F62\u671F": { "\u5316\u5F62\u8349": 1, "\u5929\u96F7\u73E0": 1 },
    "\u795E\u517D\u671F": { "\u795E\u517D\u7CBE\u8840": 1, "\u5929\u9053\u6CD5\u5219": 1 }
  };
  var SPIRIT_BEAST_BASE_STATS = {
    attack: 5,
    defense: 5,
    health: 50,
    spiritual: 10,
    agility: 8,
    critRate: 1
  };
  function createInitialSpiritBeastData() {
    return {
      beasts: [],
      // 拥有的仙宠列表
      selectedBeastId: null,
      // 当前选中的仙宠ID
      totalBeastsOwned: 0
      // 累计拥有的仙宠数量
    };
  }
  function createSpiritBeast(name, type = "beast_type_a", tier = "\u5E7C\u5E74\u671F") {
    const id = `beast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id,
      name,
      type,
      tier,
      level: 1,
      exp: 0,
      expToNextLevel: 100,
      skills: [],
      bloodlineRank: "\u51E1\u517D",
      bloodlineAwakened: false,
      bloodlineProgress: 0,
      stats: { ...SPIRIT_BEAST_BASE_STATS },
      evolutionBranch: null,
      isSelected: false,
      createdAt: Date.now()
    };
  }
  var SpiritBeastService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.hooks = /* @__PURE__ */ new Map();
      this.hookIdCounter = 0;
      this.initializeData();
    }
    /**
     * 初始化仙宠数据
     */
    initializeData() {
      if (!this.gameState.spiritBeastData) {
        this.gameState.spiritBeastData = createInitialSpiritBeastData();
      }
    }
    /**
     * 获取仙宠数据
     */
    getSpiritBeastData() {
      return this.gameState.spiritBeastData;
    }
    /**
     * 获取所有仙宠
     */
    getAllBeasts() {
      return this.gameState.spiritBeastData.beasts;
    }
    /**
     * 获取选中的仙宠
     */
    getSelectedBeast() {
      const data = this.getSpiritBeastData();
      if (!data.selectedBeastId) return null;
      return data.beasts.find((b) => b.id === data.selectedBeastId) || null;
    }
    /**
     * 选择仙宠
     * @param {string} beastId - 仙宠ID
     */
    selectBeast(beastId) {
      const data = this.getSpiritBeastData();
      const beast = data.beasts.find((b) => b.id === beastId);
      if (!beast) {
        return { success: false, error: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      }
      if (data.selectedBeastId) {
        const prevBeast = data.beasts.find((b) => b.id === data.selectedBeastId);
        if (prevBeast) prevBeast.isSelected = false;
      }
      data.selectedBeastId = beastId;
      beast.isSelected = true;
      return { success: true, beast };
    }
    /**
     * 获得新仙宠
     * @param {string} name - 仙宠名称
     * @param {string} type - 仙宠类型
     */
    acquireBeast(name, type = "beast_type_a") {
      const data = this.getSpiritBeastData();
      const beast = createSpiritBeast(name, type, "\u5E7C\u5E74\u671F");
      if (data.beasts.length === 0) {
        data.selectedBeastId = beast.id;
        beast.isSelected = true;
      }
      data.beasts.push(beast);
      data.totalBeastsOwned++;
      this.triggerHook("beastAcquired", { beast });
      return { success: true, beast };
    }
    /**
     * 检查是否可以进化
     * @param {string} beastId - 仙宠ID
     * @param {string} branchId - 进化分支ID (可选)
     */
    canEvolve(beastId, branchId = null) {
      var _a;
      const beast = this.getBeastById(beastId);
      if (!beast) {
        return { success: false, error: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      }
      const currentTierIndex = TIER_ORDER.indexOf(beast.tier);
      if (currentTierIndex >= TIER_ORDER.length - 1) {
        return { success: false, error: "\u5DF2\u8FBE\u6700\u9AD8\u8FDB\u5316\u9636\u6BB5" };
      }
      const tierConfig = SPIRIT_BEAST_TIERS[beast.tier];
      if (beast.level < tierConfig.maxLevel) {
        return {
          success: false,
          error: `\u7B49\u7EA7\u4E0D\u8DB3\uFF0C\u9700\u8981\u7B49\u7EA7 ${tierConfig.maxLevel}`,
          currentLevel: beast.level,
          requiredLevel: tierConfig.maxLevel
        };
      }
      const requiredItems = EVOLUTION_ITEM_COSTS[beast.tier];
      const inventory = ((_a = this.gameState.inventory) == null ? void 0 : _a.items) || [];
      for (const [itemName, requiredCount] of Object.entries(requiredItems)) {
        const ownedCount = inventory.filter((item) => item.name === itemName).length;
        if (ownedCount < requiredCount) {
          return {
            success: false,
            error: `\u6750\u6599\u4E0D\u8DB3: \u9700\u8981 ${itemName} x${requiredCount}`,
            currentItem: itemName,
            required: requiredCount,
            owned: ownedCount
          };
        }
      }
      if (currentTierIndex >= 1 && !beast.evolutionBranch && !branchId) {
        return {
          success: false,
          error: "\u9700\u8981\u9009\u62E9\u8FDB\u5316\u5206\u652F",
          requiresBranch: true,
          availableBranches: EVOLUTION_BRANCHES[beast.tier]
        };
      }
      return { success: true };
    }
    /**
     * 进化仙宠
     * @param {string} beastId - 仙宠ID
     * @param {string} branchId - 进化分支ID
     */
    evolveBeast(beastId, branchId = null) {
      const canEvolveResult = this.canEvolve(beastId, branchId);
      if (!canEvolveResult.success) {
        return canEvolveResult;
      }
      const beast = this.getBeastById(beastId);
      const currentTierIndex = TIER_ORDER.indexOf(beast.tier);
      const nextTier = TIER_ORDER[currentTierIndex + 1];
      const tierConfig = SPIRIT_BEAST_TIERS[beast.tier];
      const requiredItems = EVOLUTION_ITEM_COSTS[beast.tier];
      const inventory = this.gameState.inventory.items;
      for (const [itemName, requiredCount] of Object.entries(requiredItems)) {
        let remaining = requiredCount;
        for (let i = inventory.length - 1; i >= 0 && remaining > 0; i--) {
          if (inventory[i].name === itemName) {
            inventory.splice(i, 1);
            remaining--;
          }
        }
      }
      if (branchId) {
        beast.evolutionBranch = branchId;
        const branch = EVOLUTION_BRANCHES[beast.tier].find((b) => b.id === branchId);
        if (branch) {
          Object.assign(beast.stats, branch.statBonus);
        }
      }
      const oldTier = beast.tier;
      beast.tier = nextTier;
      const newSkills = TIER_SKILLS[nextTier];
      const unlockedSkills = newSkills.filter((skill) => !beast.skills.includes(skill));
      beast.skills.push(...unlockedSkills);
      const nextTierConfig = SPIRIT_BEAST_TIERS[nextTier];
      beast.level = nextTierConfig.minLevel;
      beast.exp = 0;
      beast.expToNextLevel = nextTierConfig.minLevel * 10;
      this.triggerHook("beastEvolved", {
        beast,
        oldTier,
        newTier: nextTier,
        unlockedSkills,
        branchId
      });
      return {
        success: true,
        beast,
        oldTier,
        newTier: nextTier,
        unlockedSkills,
        newStats: beast.stats
      };
    }
    /**
     * 获取仙宠信息
     * @param {string} beastId - 仙宠ID
     */
    getBeastById(beastId) {
      return this.getSpiritBeastData().beasts.find((b) => b.id === beastId) || null;
    }
    /**
     * 获取进化信息
     * @param {string} beastId - 仙宠ID
     */
    getEvolutionInfo(beastId) {
      const beast = this.getBeastById(beastId);
      if (!beast) return { success: false, error: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      const currentTierIndex = TIER_ORDER.indexOf(beast.tier);
      const tierConfig = SPIRIT_BEAST_TIERS[beast.tier];
      return {
        success: true,
        currentTier: beast.tier,
        currentTierIndex,
        nextTier: currentTierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentTierIndex + 1] : null,
        levelProgress: {
          current: beast.level,
          max: tierConfig.maxLevel,
          percentage: Math.round(beast.level / tierConfig.maxLevel * 100)
        },
        evolutionItems: tierConfig.evolutionItems,
        itemCosts: EVOLUTION_ITEM_COSTS[beast.tier],
        availableBranches: currentTierIndex >= 1 ? EVOLUTION_BRANCHES[beast.tier] : null,
        currentBranch: beast.evolutionBranch,
        potentialSkills: currentTierIndex < TIER_ORDER.length - 1 ? TIER_SKILLS[TIER_ORDER[currentTierIndex + 1]] : []
      };
    }
    /**
     * 获取所有进化阶段
     */
    getAllTiers() {
      return TIER_ORDER.map((tier) => ({
        name: tier,
        ...SPIRIT_BEAST_TIERS[tier]
      }));
    }
    /**
     * 仙宠获得经验
     * @param {string} beastId - 仙宠ID
     * @param {number} amount - 经验值
     */
    gainExp(beastId, amount) {
      const beast = this.getBeastById(beastId);
      if (!beast) return { success: false, error: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      beast.exp += amount;
      let leveledUp = false;
      let totalLevelsGained = 0;
      while (beast.exp >= beast.expToNextLevel) {
        beast.exp -= beast.expToNextLevel;
        beast.level++;
        beast.expToNextLevel = Math.floor(beast.expToNextLevel * 1.2);
        leveledUp = true;
        totalLevelsGained++;
        this.triggerHook("beastLevelUp", { beast, level: beast.level });
      }
      return {
        success: true,
        expGained: amount,
        currentExp: beast.exp,
        leveledUp,
        totalLevelsGained,
        currentLevel: beast.level
      };
    }
    /**
     * 获取仙宠战斗力
     * @param {string} beastId - 仙宠ID
     */
    getBeastPower(beastId) {
      const beast = this.getBeastById(beastId);
      if (!beast) return 0;
      const stats = beast.stats;
      const tierMultiplier = SPIRIT_BEAST_TIERS[beast.tier].tierIndex + 1;
      const levelBonus = beast.level * 0.5;
      return Math.floor(
        (stats.attack + stats.defense + stats.health * 0.1 + stats.spiritual * 0.5) * tierMultiplier + levelBonus
      );
    }
    /**
     * 获取所有仙宠战力排行榜
     */
    getBeastPowerRanking() {
      return this.getAllBeasts().map((beast) => ({
        beast,
        power: this.getBeastPower(beast.id)
      })).sort((a, b) => b.power - a.power);
    }
    // ===== Hook系统 =====
    /**
     * 注册钩子
     * @param {string} type - 钩子类型
     * @param {function} callback - 回调函数
     */
    registerHook(type, callback) {
      const hookId = ++this.hookIdCounter;
      this.hooks.set(hookId, { type, callback, enabled: true });
      return { success: true, hookId, type };
    }
    /**
     * 注销钩子
     * @param {number} hookId - 钩子ID
     */
    unregisterHook(hookId) {
      if (!this.hooks.has(hookId)) {
        return { success: false, error: "\u94A9\u5B50\u4E0D\u5B58\u5728" };
      }
      this.hooks.delete(hookId);
      return { success: true };
    }
    /**
     * 触发钩子
     * @param {string} type - 钩子类型
     * @param {object} data - 数据
     */
    triggerHook(type, data) {
      const triggeredIds = [];
      for (const [hookId, hook] of this.hooks) {
        if (hook.type === type && hook.enabled) {
          hook.callback(data);
          triggeredIds.push(hookId);
        }
      }
      return triggeredIds;
    }
    /**
     * 列出所有钩子
     */
    listHooks() {
      return Array.from(this.hooks.entries()).map(([id, h]) => ({
        id,
        type: h.type,
        enabled: h.enabled
      }));
    }
    // ===== 序列化 =====
    /**
     * 序列化数据
     */
    serialize() {
      return {
        spiritBeastData: this.gameState.spiritBeastData
      };
    }
    /**
     * 反序列化数据
     * @param {object} data - 序列化数据
     */
    deserialize(data) {
      if (data.spiritBeastData) {
        this.gameState.spiritBeastData = data.spiritBeastData;
      }
    }
  };
  var SPIRIT_BEAST_MCP_TOOLS = [
    { name: "spiritbeast.acquire", description: "\u83B7\u5F97\u65B0\u4ED9\u5BA0", params: ["name", "type"] },
    { name: "spiritbeast.list", description: "\u5217\u51FA\u6240\u6709\u4ED9\u5BA0", params: [] },
    { name: "spiritbeast.select", description: "\u9009\u62E9\u4ED9\u5BA0", params: ["beastId"] },
    { name: "spiritbeast.evolve", description: "\u8FDB\u5316\u4ED9\u5BA0", params: ["beastId", "branchId"] },
    { name: "spiritbeast.info", description: "\u83B7\u53D6\u4ED9\u5BA0\u4FE1\u606F", params: ["beastId"] },
    { name: "spiritbeast.evolution_info", description: "\u83B7\u53D6\u8FDB\u5316\u4FE1\u606F", params: ["beastId"] },
    { name: "spiritbeast.power", description: "\u83B7\u53D6\u4ED9\u5BA0\u6218\u529B", params: ["beastId"] },
    { name: "spiritbeast.tiers", description: "\u83B7\u53D6\u6240\u6709\u8FDB\u5316\u9636\u6BB5", params: [] }
  ];
  function createSpiritBeastServiceInstance(gameState3) {
    return new SpiritBeastService(gameState3);
  }
  function acquireSpiritBeast(gameState3, name, type = "beast_type_a") {
    const service = createSpiritBeastServiceInstance(gameState3);
    return service.acquireBeast(name, type);
  }
  function listSpiritBeasts(gameState3) {
    const service = createSpiritBeastServiceInstance(gameState3);
    return service.getAllBeasts();
  }
  function selectSpiritBeast(gameState3, beastId) {
    const service = createSpiritBeastServiceInstance(gameState3);
    return service.selectBeast(beastId);
  }
  function evolveSpiritBeast(gameState3, beastId, branchId = null) {
    const service = createSpiritBeastServiceInstance(gameState3);
    return service.evolveBeast(beastId, branchId);
  }
  function getSpiritBeastInfo(gameState3, beastId) {
    const service = createSpiritBeastServiceInstance(gameState3);
    return service.getBeastById(beastId);
  }
  function getSpiritBeastEvolutionInfo(gameState3, beastId) {
    const service = createSpiritBeastServiceInstance(gameState3);
    return service.getEvolutionInfo(beastId);
  }
  function getSpiritBeastPower(gameState3, beastId) {
    const service = createSpiritBeastServiceInstance(gameState3);
    const power = service.getBeastPower(beastId);
    return { success: true, beastId, power };
  }
  function getAllSpiritBeastTiers() {
    return SpiritBeastService.getAllTiers ? SpiritBeastService.getAllTiers() : [];
  }

  // src/domains/cultivation/services/BloodlineService.js
  var BLOODLINE_RANKS = {
    "\u51E1\u517D": {
      multiplier: 1,
      bonusSkills: [],
      awakeningCost: 0,
      requiredProgress: 0,
      rankIndex: 0
    },
    "\u7075\u517D": {
      multiplier: 1.5,
      bonusSkills: ["\u7075\u89C6"],
      awakeningCost: 50,
      requiredProgress: 100,
      rankIndex: 1
    },
    "\u4ED9\u517D": {
      multiplier: 2,
      bonusSkills: ["\u7075\u89C6", "\u4ED9\u98CE"],
      awakeningCost: 200,
      requiredProgress: 500,
      rankIndex: 2
    },
    "\u795E\u517D": {
      multiplier: 3,
      bonusSkills: ["\u7075\u89C6", "\u4ED9\u98CE", "\u795E\u4F51"],
      awakeningCost: 1e3,
      requiredProgress: 2e3,
      rankIndex: 3
    }
  };
  var BLOODLINE_ORDER = ["\u51E1\u517D", "\u7075\u517D", "\u4ED9\u517D", "\u795E\u517D"];
  var BLOODLINE_TYPES = {
    "\u706B\u7130\u8840\u8109": { element: "fire", bonus: { attack: 15, critRate: 2 } },
    "\u5BD2\u51B0\u8840\u8109": { element: "water", bonus: { defense: 15, health: 20 } },
    "\u96F7\u9706\u8840\u8109": { element: "thunder", bonus: { attack: 10, agility: 10 } },
    "\u5927\u5730\u8840\u8109": { element: "earth", bonus: { health: 30, defense: 10 } },
    "\u98CE\u7075\u8840\u8109": { element: "wind", bonus: { agility: 15, critRate: 3 } },
    "\u81EA\u7136\u8840\u8109": { element: "wood", bonus: { spiritual: 20, health: 15 } }
  };
  var BloodlineService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.hooks = /* @__PURE__ */ new Map();
      this.hookIdCounter = 0;
      this.initializeData();
    }
    /**
     * 初始化血脉数据
     */
    initializeData() {
      if (!this.gameState.bloodlineData) {
        this.gameState.bloodlineData = {
          bloodlineEssence: 0,
          // 血脉精华数量
          totalEssenceEarned: 0,
          // 累计获得血脉精华
          resonancePairs: []
          // 共鸣配对
        };
      }
    }
    /**
     * 获取血脉数据
     */
    getBloodlineData() {
      return this.gameState.bloodlineData;
    }
    /**
     * 获得血脉精华
     * @param {number} amount - 数量
     * @param {string} reason - 原因
     */
    gainBloodlineEssence(amount, reason = "reward") {
      const data = this.getBloodlineData();
      data.bloodlineEssence += amount;
      data.totalEssenceEarned += amount;
      this.triggerHook("bloodlineEssenceGained", {
        amount,
        reason,
        totalEssence: data.bloodlineEssence,
        totalEarned: data.totalEssenceEarned
      });
      return {
        success: true,
        gained: amount,
        reason,
        totalEssence: data.bloodlineEssence,
        totalEarned: data.totalEssenceEarned
      };
    }
    /**
     * 消耗血脉精华
     * @param {number} amount - 数量
     */
    consumeBloodlineEssence(amount) {
      const data = this.getBloodlineData();
      if (data.bloodlineEssence < amount) {
        return {
          success: false,
          error: "\u8840\u8109\u7CBE\u534E\u4E0D\u8DB3",
          required: amount,
          available: data.bloodlineEssence
        };
      }
      data.bloodlineEssence -= amount;
      return { success: true, consumed: amount, remaining: data.bloodlineEssence };
    }
    /**
     * 检查仙宠是否可以觉醒
     * @param {string} beastId - 仙宠ID
     */
    canAwaken(beastId) {
      const beast = this.getBeastById(beastId);
      if (!beast) {
        return { success: false, error: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      }
      if (beast.bloodlineAwakened) {
        return { success: false, error: "\u8840\u8109\u5DF2\u89C9\u9192" };
      }
      const currentRank = BLOODLINE_RANKS[beast.bloodlineRank];
      if (currentRank.rankIndex >= BLOODLINE_ORDER.length - 1) {
        return { success: false, error: "\u5DF2\u8FBE\u6700\u9AD8\u8840\u8109\u7B49\u7EA7" };
      }
      if (beast.bloodlineProgress < currentRank.requiredProgress) {
        return {
          success: false,
          error: "\u8840\u8109\u8FDB\u5EA6\u4E0D\u8DB3",
          required: currentRank.requiredProgress,
          current: beast.bloodlineProgress
        };
      }
      const data = this.getBloodlineData();
      if (data.bloodlineEssence < currentRank.awakeningCost) {
        return {
          success: false,
          error: "\u8840\u8109\u7CBE\u534E\u4E0D\u8DB3",
          required: currentRank.awakeningCost,
          available: data.bloodlineEssence
        };
      }
      return { success: true };
    }
    /**
     * 觉醒仙宠血脉
     * @param {string} beastId - 仙宠ID
     * @param {string} bloodlineType - 血脉类型 (可选)
     */
    awakenBloodline(beastId, bloodlineType = null) {
      const canResult = this.canAwaken(beastId);
      if (!canResult.success) {
        return canResult;
      }
      const beast = this.getBeastById(beastId);
      const currentRank = BLOODLINE_RANKS[beast.bloodlineRank];
      const nextRankName = BLOODLINE_ORDER[currentRank.rankIndex + 1];
      const nextRank = BLOODLINE_RANKS[nextRankName];
      const consumeResult = this.consumeBloodlineEssence(currentRank.awakeningCost);
      if (!consumeResult.success) {
        return consumeResult;
      }
      const oldRank = beast.bloodlineRank;
      beast.bloodlineRank = nextRankName;
      beast.bloodlineAwakened = true;
      beast.bloodlineProgress = 0;
      if (bloodlineType && BLOODLINE_TYPES[bloodlineType]) {
        beast.bloodlineType = bloodlineType;
        Object.assign(beast.stats, BLOODLINE_TYPES[bloodlineType].bonus);
      } else if (!beast.bloodlineType) {
        beast.bloodlineType = Object.keys(BLOODLINE_TYPES)[0];
        Object.assign(beast.stats, BLOODLINE_TYPES[beast.bloodlineType].bonus);
      }
      const newSkills = nextRank.bonusSkills;
      const unlockedSkills = newSkills.filter((skill) => !beast.skills.includes(skill));
      beast.skills.push(...unlockedSkills);
      this.triggerHook("bloodlineAwakened", {
        beast,
        oldRank,
        newRank: nextRankName,
        unlockedSkills,
        bloodlineType: beast.bloodlineType
      });
      return {
        success: true,
        beast,
        oldRank,
        newRank: nextRankName,
        unlockedSkills,
        bloodlineType: beast.bloodlineType,
        newMultiplier: nextRank.multiplier
      };
    }
    /**
     * 增加血脉进度
     * @param {string} beastId - 仙宠ID
     * @param {number} amount - 进度值
     */
    addBloodlineProgress(beastId, amount) {
      const beast = this.getBeastById(beastId);
      if (!beast) return { success: false, error: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      const currentRank = BLOODLINE_RANKS[beast.bloodlineRank];
      const maxProgress = currentRank.requiredProgress;
      const oldProgress = beast.bloodlineProgress;
      beast.bloodlineProgress = Math.min(beast.bloodlineProgress + amount, maxProgress);
      const actualAdded = beast.bloodlineProgress - oldProgress;
      return {
        success: true,
        added: actualAdded,
        currentProgress: beast.bloodlineProgress,
        maxProgress,
        percentage: Math.round(beast.bloodlineProgress / maxProgress * 100)
      };
    }
    /**
     * 获取仙宠血脉信息
     * @param {string} beastId - 仙宠ID
     */
    getBeastBloodlineInfo(beastId) {
      const beast = this.getBeastById(beastId);
      if (!beast) return { success: false, error: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      const currentRank = BLOODLINE_RANKS[beast.bloodlineRank];
      const currentRankIndex = currentRank.rankIndex;
      const nextRankName = currentRankIndex < BLOODLINE_ORDER.length - 1 ? BLOODLINE_ORDER[currentRankIndex + 1] : null;
      return {
        success: true,
        beastId,
        bloodlineRank: beast.bloodlineRank,
        bloodlineType: beast.bloodlineType || null,
        bloodlineAwakened: beast.bloodlineAwakened,
        bloodlineProgress: beast.bloodlineProgress,
        maxProgress: currentRank.requiredProgress,
        progressPercentage: Math.round(beast.bloodlineProgress / currentRank.requiredProgress * 100),
        multiplier: currentRank.multiplier,
        bonusSkills: currentRank.bonusSkills,
        nextRank: nextRankName,
        nextRankMultiplier: nextRankName ? BLOODLINE_RANKS[nextRankName].multiplier : null,
        nextRankSkills: nextRankName ? BLOODLINE_RANKS[nextRankName].bonusSkills : [],
        awakeningCost: nextRankName ? BLOODLINE_RANKS[nextRankName].awakeningCost : null,
        availableBloodlineTypes: Object.keys(BLOODLINE_TYPES)
      };
    }
    /**
     * 检查血脉共鸣
     * @param {string} beastId1 - 仙宠ID1
     * @param {string} beastId2 - 仙宠ID2
     */
    checkResonance(beastId1, beastId2) {
      const beast1 = this.getBeastById(beastId1);
      const beast2 = this.getBeastById(beastId2);
      if (!beast1 || !beast2) {
        return { success: false, error: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      }
      if (beast1.bloodlineType !== beast2.bloodlineType) {
        return {
          success: true,
          hasResonance: false,
          reason: "\u8840\u8109\u7C7B\u578B\u4E0D\u540C"
        };
      }
      if (!beast1.bloodlineAwakened || !beast2.bloodlineAwakened) {
        return {
          success: true,
          hasResonance: false,
          reason: "\u6709\u4ED9\u5BA0\u8840\u8109\u672A\u89C9\u9192"
        };
      }
      const rank1 = BLOODLINE_RANKS[beast1.bloodlineRank].rankIndex;
      const rank2 = BLOODLINE_RANKS[beast2.bloodlineRank].rankIndex;
      const resonanceBonus = (rank1 + 1) * (rank2 + 1) * 0.1;
      return {
        success: true,
        hasResonance: true,
        bloodlineType: beast1.bloodlineType,
        resonanceBonus,
        resonanceDescription: `${beast1.bloodlineType}\u5171\u9E23: \u5168\u5C5E\u6027+${Math.round(resonanceBonus * 100)}%`
      };
    }
    /**
     * 建立血脉共鸣配对
     * @param {string} beastId1 - 仙宠ID1
     * @param {string} beastId2 - 仙宠ID2
     */
    createResonancePair(beastId1, beastId2) {
      const checkResult = this.checkResonance(beastId1, beastId2);
      if (!checkResult.success) {
        return checkResult;
      }
      if (!checkResult.hasResonance) {
        return {
          success: false,
          error: checkResult.reason
        };
      }
      const data = this.getBloodlineData();
      const existingPair = data.resonancePairs.find(
        (p) => p.beastId1 === beastId1 && p.beastId2 === beastId2 || p.beastId1 === beastId2 && p.beastId2 === beastId1
      );
      if (existingPair) {
        return { success: false, error: "\u5171\u9E23\u914D\u5BF9\u5DF2\u5B58\u5728" };
      }
      const pairId = `resonance_${Date.now()}`;
      data.resonancePairs.push({
        pairId,
        beastId1,
        beastId2,
        bloodlineType: checkResult.bloodlineType,
        bonus: checkResult.resonanceBonus,
        createdAt: Date.now()
      });
      this.triggerHook("resonanceCreated", {
        pairId,
        beastId1,
        beastId2,
        bloodlineType: checkResult.bloodlineType,
        bonus: checkResult.resonanceBonus
      });
      return {
        success: true,
        pairId,
        bonus: checkResult.resonanceBonus,
        description: checkResult.resonanceDescription
      };
    }
    /**
     * 移除血脉共鸣配对
     * @param {string} pairId - 配对ID
     */
    removeResonancePair(pairId) {
      const data = this.getBloodlineData();
      const pairIndex = data.resonancePairs.findIndex((p) => p.pairId === pairId);
      if (pairIndex === -1) {
        return { success: false, error: "\u5171\u9E23\u914D\u5BF9\u4E0D\u5B58\u5728" };
      }
      const removedPair = data.resonancePairs.splice(pairIndex, 1)[0];
      this.triggerHook("resonanceRemoved", removedPair);
      return { success: true, removedPair };
    }
    /**
     * 获取所有共鸣配对
     */
    getAllResonancePairs() {
      return this.getBloodlineData().resonancePairs;
    }
    /**
     * 计算共鸣总加成
     */
    calculateTotalResonanceBonus() {
      const pairs = this.getAllResonancePairs();
      return pairs.reduce((total, pair) => total + pair.bonus, 0);
    }
    /**
     * 获取仙宠属性 (带血脉加成)
     * @param {string} beastId - 仙宠ID
     */
    getBeastStatsWithBloodline(beastId) {
      const beast = this.getBeastById(beastId);
      if (!beast) return null;
      const baseStats = { ...beast.stats };
      const rank = BLOODLINE_RANKS[beast.bloodlineRank];
      const resonanceBonus = this.calculateTotalResonanceBonus();
      const multiplier = rank.multiplier * (1 + resonanceBonus);
      const enhancedStats = {};
      for (const [stat, value] of Object.entries(baseStats)) {
        enhancedStats[stat] = Math.floor(value * multiplier);
      }
      enhancedStats._multiplier = multiplier;
      enhancedStats._bloodlineRank = beast.bloodlineRank;
      enhancedStats._resonanceBonus = resonanceBonus;
      return enhancedStats;
    }
    /**
     * 辅助方法：获取仙宠
     * @param {string} beastId - 仙宠ID
     */
    getBeastById(beastId) {
      var _a;
      return ((_a = this.gameState.spiritBeastData) == null ? void 0 : _a.beasts.find((b) => b.id === beastId)) || null;
    }
    // ===== Hook系统 =====
    /**
     * 注册钩子
     * @param {string} type - 钩子类型
     * @param {function} callback - 回调函数
     */
    registerHook(type, callback) {
      const hookId = ++this.hookIdCounter;
      this.hooks.set(hookId, { type, callback, enabled: true });
      return { success: true, hookId, type };
    }
    /**
     * 注销钩子
     * @param {number} hookId - 钩子ID
     */
    unregisterHook(hookId) {
      if (!this.hooks.has(hookId)) {
        return { success: false, error: "\u94A9\u5B50\u4E0D\u5B58\u5728" };
      }
      this.hooks.delete(hookId);
      return { success: true };
    }
    /**
     * 触发钩子
     * @param {string} type - 钩子类型
     * @param {object} data - 数据
     */
    triggerHook(type, data) {
      const triggeredIds = [];
      for (const [hookId, hook] of this.hooks) {
        if (hook.type === type && hook.enabled) {
          hook.callback(data);
          triggeredIds.push(hookId);
        }
      }
      return triggeredIds;
    }
    /**
     * 列出所有钩子
     */
    listHooks() {
      return Array.from(this.hooks.entries()).map(([id, h]) => ({
        id,
        type: h.type,
        enabled: h.enabled
      }));
    }
    // ===== 序列化 =====
    /**
     * 序列化数据
     */
    serialize() {
      return {
        bloodlineData: this.gameState.bloodlineData
      };
    }
    /**
     * 反序列化数据
     * 反序列化数据
     */
    deserialize(data) {
      if (data.bloodlineData) {
        this.gameState.bloodlineData = data.bloodlineData;
      }
    }
  };
  var BLOODLINE_MCP_TOOLS = [
    { name: "bloodline.essence.gain", description: "\u83B7\u5F97\u8840\u8109\u7CBE\u534E", params: ["amount", "reason"] },
    { name: "bloodline.awaken", description: "\u89C9\u9192\u4ED9\u5BA0\u8840\u8109", params: ["beastId", "bloodlineType"] },
    { name: "bloodline.progress", description: "\u589E\u52A0\u8840\u8109\u8FDB\u5EA6", params: ["beastId", "amount"] },
    { name: "bloodline.info", description: "\u83B7\u53D6\u8840\u8109\u4FE1\u606F", params: ["beastId"] },
    { name: "bloodline.resonance.check", description: "\u68C0\u67E5\u8840\u8109\u5171\u9E23", params: ["beastId1", "beastId2"] },
    { name: "bloodline.resonance.create", description: "\u5EFA\u7ACB\u8840\u8109\u5171\u9E23\u914D\u5BF9", params: ["beastId1", "beastId2"] },
    { name: "bloodline.resonance.remove", description: "\u79FB\u9664\u8840\u8109\u5171\u9E23\u914D\u5BF9", params: ["pairId"] }
  ];
  function createBloodlineServiceInstance(gameState3) {
    return new BloodlineService(gameState3);
  }
  function gainBloodlineEssence(gameState3, amount, reason = "reward") {
    const service = createBloodlineServiceInstance(gameState3);
    return service.gainBloodlineEssence(amount, reason);
  }
  function awakenBloodline(gameState3, beastId, bloodlineType = null) {
    const service = createBloodlineServiceInstance(gameState3);
    return service.awakenBloodline(beastId, bloodlineType);
  }
  function addBloodlineProgress(gameState3, beastId, amount) {
    const service = createBloodlineServiceInstance(gameState3);
    return service.addBloodlineProgress(beastId, amount);
  }
  function getBeastBloodlineInfo(gameState3, beastId) {
    const service = createBloodlineServiceInstance(gameState3);
    return service.getBeastBloodlineInfo(beastId);
  }
  function checkBloodlineResonance(gameState3, beastId1, beastId2) {
    const service = createBloodlineServiceInstance(gameState3);
    return service.checkResonance(beastId1, beastId2);
  }
  function createBloodlineResonancePair(gameState3, beastId1, beastId2) {
    const service = createBloodlineServiceInstance(gameState3);
    return service.createResonancePair(beastId1, beastId2);
  }
  function removeBloodlineResonancePair(gameState3, pairId) {
    const service = createBloodlineServiceInstance(gameState3);
    return service.removeResonancePair(pairId);
  }

  // src/domains/cultivation/services/TradeService.js
  var TRADE_STATES = {
    IDLE: "IDLE",
    TRADING: "TRADING",
    TRANSPORTING: "TRANSPORTING"
  };
  var TRADE_DB_KEY = "_trade_db";
  var _tradeDB = null;
  function _initDB2() {
    const existing = GameGlobal.getDB ? GameGlobal.getDB(TRADE_DB_KEY) : null;
    if (existing) {
      _tradeDB = existing;
    } else {
      _tradeDB = {
        state: TRADE_STATES.IDLE,
        playerMoney: 1e4,
        inventory: [],
        transactions: [],
        routes: [],
        transportInProgress: null
      };
      if (GameGlobal.setDB) GameGlobal.setDB(TRADE_DB_KEY, _tradeDB);
    }
  }
  function _saveDB2() {
    if (GameGlobal.setDB) GameGlobal.setDB(TRADE_DB_KEY, _tradeDB);
  }
  var GOODS = {
    SPIRIT_STONE: { name: "\u7075\u77F3", basePrice: 1, volatility: 0.1 },
    ELIXIR: { name: "\u4E39\u836F", basePrice: 50, volatility: 0.3 },
    MANUAL: { name: "\u529F\u6CD5", basePrice: 200, volatility: 0.2 },
    WEAPON: { name: "\u6CD5\u5B9D", basePrice: 500, volatility: 0.4 },
    MATERIAL: { name: "\u7075\u6750", basePrice: 30, volatility: 0.25 },
    BEAST_CORE: { name: "\u517D\u6838", basePrice: 100, volatility: 0.35 }
  };
  var MARKETS = {
    "\u51E1\u754C\u5E02\u573A": { level: 1, fee: 0.05, location: "\u51E1\u754C" },
    "\u7075\u754C\u5E02\u573A": { level: 10, fee: 0.08, location: "\u7075\u754C" },
    "\u4ED9\u754C\u5E02\u573A": { level: 30, fee: 0.1, location: "\u4ED9\u754C" },
    "\u795E\u754C\u5E02\u573A": { level: 60, fee: 0.12, location: "\u795E\u754C" }
  };
  var ROUTES = {
    "\u51E1\u754C-\u7075\u754C": { markets: ["\u51E1\u754C\u5E02\u573A", "\u7075\u754C\u5E02\u573A"], cost: 100, risk: 0.1 },
    "\u7075\u754C-\u4ED9\u754C": { markets: ["\u7075\u754C\u5E02\u573A", "\u4ED9\u754C\u5E02\u573A"], cost: 500, risk: 0.2 },
    "\u4ED9\u754C-\u795E\u754C": { markets: ["\u4ED9\u754C\u5E02\u573A", "\u795E\u754C\u5E02\u573A"], cost: 2e3, risk: 0.35 }
  };
  function _calculatePrice(goodId, marketId) {
    const good = GOODS[goodId];
    if (!good) return null;
    const market = MARKETS[marketId];
    if (!market) return null;
    const levelMultiplier = 1 + market.level * 0.05;
    const volatility = good.volatility * (Math.random() * 2 - 1);
    const price = Math.floor(good.basePrice * levelMultiplier * (1 + volatility));
    return Math.max(1, price);
  }
  function listMarketGoods(marketId) {
    _initDB2();
    if (!MARKETS[marketId]) {
      return { success: false, error: `\u5E02\u573A ${marketId} \u4E0D\u5B58\u5728` };
    }
    const market = MARKETS[marketId];
    const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute("level") : 1;
    if (playerLevel < market.level) {
      return { success: false, error: `\u9700\u8981\u8FBE\u5230 ${market.level} \u7EA7\u624D\u80FD\u8FDB\u5165\u6B64\u5E02\u573A` };
    }
    const goodsList = Object.entries(GOODS).map(([id, config]) => {
      const price = _calculatePrice(id, marketId);
      const trend = Math.random() > 0.5 ? "\u6DA8" : "\u8DCC";
      return {
        id,
        name: config.name,
        price,
        trend,
        marketFee: (market.fee * 100).toFixed(0) + "%",
        stock: Math.floor(Math.random() * 100) + 10
      };
    });
    return {
      success: true,
      market: { id: marketId, name: marketId, fee: market.fee, location: market.location },
      goods: goodsList
    };
  }
  function buyGoods(marketId, goodId, quantity) {
    _initDB2();
    if (!MARKETS[marketId]) {
      return { success: false, error: `\u5E02\u573A ${marketId} \u4E0D\u5B58\u5728` };
    }
    if (!GOODS[goodId]) {
      return { success: false, error: `\u5546\u54C1 ${goodId} \u4E0D\u5B58\u5728` };
    }
    if (!quantity || quantity <= 0) {
      return { success: false, error: "\u8D2D\u4E70\u6570\u91CF\u5FC5\u987B\u5927\u4E8E0" };
    }
    const price = _calculatePrice(goodId, marketId);
    const market = MARKETS[marketId];
    const totalCost = price * quantity * (1 + market.fee);
    if (_tradeDB.playerMoney < totalCost) {
      return { success: false, error: `\u7075\u77F3\u4E0D\u8DB3\uFF08\u9700\u8981 ${totalCost}\uFF0C\u62E5\u6709 ${_tradeDB.playerMoney}\uFF09` };
    }
    _tradeDB.playerMoney -= totalCost;
    const existingItem = _tradeDB.inventory.find((i) => i.goodId === goodId);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.avgPrice = (existingItem.avgPrice * (existingItem.quantity - quantity) + price * quantity) / existingItem.quantity;
    } else {
      _tradeDB.inventory.push({
        goodId,
        name: GOODS[goodId].name,
        quantity,
        avgPrice: price,
        purchasedAt: Date.now()
      });
    }
    _tradeDB.transactions.push({
      type: "BUY",
      goodId,
      quantity,
      price,
      totalCost,
      marketId,
      timestamp: Date.now()
    });
    _saveDB2();
    return {
      success: true,
      message: `\u8D2D\u4E70\u6210\u529F\uFF1A${GOODS[goodId].name} x${quantity}\uFF0C\u82B1\u8D39 ${totalCost} \u7075\u77F3`,
      purchase: { goodId, name: GOODS[goodId].name, quantity, unitPrice: price, totalCost, marketFee: market.fee },
      remainingMoney: _tradeDB.playerMoney
    };
  }
  function sellGoods(marketId, goodId, quantity) {
    _initDB2();
    if (!MARKETS[marketId]) {
      return { success: false, error: `\u5E02\u573A ${marketId} \u4E0D\u5B58\u5728` };
    }
    if (!GOODS[goodId]) {
      return { success: false, error: `\u5546\u54C1 ${goodId} \u4E0D\u5B58\u5728` };
    }
    const item = _tradeDB.inventory.find((i) => i.goodId === goodId);
    if (!item || item.quantity < quantity) {
      return { success: false, error: `\u5E93\u5B58\u4E0D\u8DB3\uFF08\u62E5\u6709 ${item ? item.quantity : 0}\uFF0C\u9700\u8981 ${quantity}\uFF09` };
    }
    const price = _calculatePrice(goodId, marketId);
    const market = MARKETS[marketId];
    const revenue = Math.floor(price * quantity * (1 - market.fee));
    _tradeDB.playerMoney += revenue;
    item.quantity -= quantity;
    if (item.quantity <= 0) {
      _tradeDB.inventory.splice(_tradeDB.inventory.indexOf(item), 1);
    }
    _tradeDB.transactions.push({
      type: "SELL",
      goodId,
      quantity,
      price,
      revenue,
      marketId,
      timestamp: Date.now()
    });
    _saveDB2();
    return {
      success: true,
      message: `\u51FA\u552E\u6210\u529F\uFF1A${GOODS[goodId].name} x${quantity}\uFF0C\u83B7\u5F97 ${revenue} \u7075\u77F3`,
      sale: { goodId, name: GOODS[goodId].name, quantity, unitPrice: price, revenue, marketFee: market.fee },
      totalMoney: _tradeDB.playerMoney
    };
  }
  function transportGoods(routeId, goodId, quantity) {
    _initDB2();
    if (!ROUTES[routeId]) {
      return { success: false, error: `\u8DEF\u7EBF ${routeId} \u4E0D\u5B58\u5728` };
    }
    const item = _tradeDB.inventory.find((i) => i.goodId === goodId);
    if (!item || item.quantity < quantity) {
      return { success: false, error: `\u5E93\u5B58\u4E0D\u8DB3` };
    }
    const route = ROUTES[routeId];
    if (_tradeDB.playerMoney < route.cost) {
      return { success: false, error: `\u8FD0\u8F93\u8D39\u7528\u4E0D\u8DB3\uFF08\u9700\u8981 ${route.cost}\uFF0C\u62E5\u6709 ${_tradeDB.playerMoney}\uFF09` };
    }
    _tradeDB.playerMoney -= route.cost;
    _tradeDB.transportInProgress = {
      routeId,
      goodId,
      quantity,
      startTime: Date.now(),
      cost: route.cost
    };
    _tradeDB.state = TRADE_STATES.TRANSPORTING;
    _saveDB2();
    return {
      success: true,
      message: `\u8FD0\u8F93\u5F00\u59CB\uFF1A${GOODS[goodId].name} x${quantity}\uFF0C${routeId}\uFF0C\u8D39\u7528 ${route.cost} \u7075\u77F3`,
      transport: { routeId, goodId, name: GOODS[goodId].name, quantity, cost: route.cost, risk: (route.risk * 100).toFixed(0) + "%" },
      estimatedArrival: "\u4E0B\u6B21\u67E5\u8BE2\u65F6\u81EA\u52A8\u5230\u8FBE"
    };
  }
  function queryTradeStatus() {
    _initDB2();
    const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute("level") : 1;
    const playerResources = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute("spiritStones") : 0;
    return {
      success: true,
      status: {
        state: _tradeDB.state,
        totalMoney: _tradeDB.playerMoney + playerResources,
        transactionCount: _tradeDB.transactions.length,
        inventoryCount: _tradeDB.inventory.length
      },
      inventory: _tradeDB.inventory.map((i) => ({
        ...i,
        currentValue: Math.floor(i.avgPrice * (1 + Math.random() * 0.4 - 0.2))
      })),
      markets: Object.entries(MARKETS).map(([id, config]) => ({
        id,
        name: id,
        level: config.level,
        location: config.location,
        fee: (config.fee * 100).toFixed(0) + "%"
      })),
      routes: Object.entries(ROUTES).map(([id, config]) => ({
        id,
        name: id,
        markets: config.markets,
        cost: config.cost,
        risk: (config.risk * 100).toFixed(0) + "%"
      })),
      recentTransactions: _tradeDB.transactions.slice(-10).reverse()
    };
  }
  var TRADE_MCP_TOOLS = [
    { name: "trade.list", description: "\u67E5\u770B\u5E02\u573A\u5546\u54C1", params: { marketId: "string" } },
    { name: "trade.buy", description: "\u8D2D\u4E70\u5546\u54C1", params: { marketId: "string", goodId: "string", quantity: "number" } },
    { name: "trade.sell", description: "\u51FA\u552E\u5546\u54C1", params: { marketId: "string", goodId: "string", quantity: "number" } },
    { name: "trade.transport", description: "\u8FD0\u8F93\u5546\u54C1\u5230\u5176\u4ED6\u5E02\u573A", params: { routeId: "string", goodId: "string", quantity: "number" } },
    { name: "trade.query", description: "\u67E5\u8BE2\u8D38\u6613\u72B6\u6001", params: {} }
  ];

  // src/domains/cultivation/services/BeastBondService.js
  var BOND_TYPES = {
    "\u5FC3\u7075\u611F\u5E94": { bonus: { luck: 5 }, skill: "\u5FC3\u6709\u7075\u7280" },
    "\u5E76\u80A9\u4F5C\u6218": { bonus: { attack: 30 }, skill: "\u53CC\u5BA0\u51FA\u51FB" },
    "\u751F\u6B7B\u4E0E\u5171": { bonus: { defense: 30 }, skill: "\u5171\u8D74\u751F\u6B7B" },
    "\u5FC3\u610F\u76F8\u901A": { bonus: { cultivation: 0.1 }, skill: "\u5FC3\u610F\u76F8\u901A" }
  };
  var _instance = null;
  function createBeastBondService(gameState3) {
    if (_instance) return _instance;
    _instance = new BeastBondService(gameState3);
    return _instance;
  }
  var BeastBondService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this._ensure();
    }
    _ensure() {
      if (!this.gameState.beastBonds) {
        this.gameState.beastBonds = {
          bonds: {},
          fusionSkills: {},
          totalBonds: 0
        };
      }
    }
    /**
     * 建立羁绊
     */
    createBond(beastId1, beastId2, bondType) {
      var _a;
      if (!BOND_TYPES[bondType]) return { success: false, message: "\u65E0\u6548\u7F81\u7ECA\u7C7B\u578B" };
      const catalogue = (_a = this.gameState.beastCatalogue) == null ? void 0 : _a.owned;
      if (!(catalogue == null ? void 0 : catalogue[beastId1]) || !(catalogue == null ? void 0 : catalogue[beastId2])) {
        return { success: false, message: "\u4ED9\u5BA0\u4E0D\u5B58\u5728" };
      }
      if (beastId1 === beastId2) return { success: false, message: "\u4E0D\u80FD\u4E0E\u81EA\u8EAB\u5EFA\u7ACB\u7F81\u7ECA" };
      const bondKey = [beastId1, beastId2].sort().join("_");
      if (this.gameState.beastBonds.bonds[bondKey]) {
        return { success: false, message: "\u5DF2\u6709\u7F81\u7ECA" };
      }
      const bondData = BOND_TYPES[bondType];
      this.gameState.beastBonds.bonds[bondKey] = {
        beasts: [beastId1, beastId2],
        type: bondType,
        level: 1,
        exp: 0,
        skill: bondData.skill,
        bonus: { ...bondData.bonus },
        createdAt: Date.now()
      };
      this.gameState.beastBonds.totalBonds++;
      return {
        success: true,
        message: `\u300C${catalogue[beastId1].name}\u300D\u4E0E\u300C${catalogue[beastId2].name}\u300D\u5EFA\u7ACB${bondType}\u7F81\u7ECA`,
        bondKey,
        skill: bondData.skill
      };
    }
    /**
     * 触发合体技能
     */
    triggerFusionSkill(beastId1, beastId2) {
      const bondKey = [beastId1, beastId2].sort().join("_");
      const bond = this.gameState.beastBonds.bonds[bondKey];
      if (!bond) return { success: false, message: "\u65E0\u7F81\u7ECA\u5173\u7CFB" };
      const player = this.gameState.player;
      const luckBonus = (bond.bonus.luck || 0) * bond.level;
      const attackBonus = (bond.bonus.attack || 0) * bond.level;
      const defenseBonus = (bond.bonus.defense || 0) * bond.level;
      const cultivationBonus = (bond.bonus.cultivation || 0) * bond.level;
      player.luck = (player.luck || 0) + luckBonus;
      player.attack = (player.attack || 0) + attackBonus;
      player.defense = (player.defense || 0) + defenseBonus;
      player.cultivationSpeed = (player.cultivationSpeed || 1) + cultivationBonus;
      bond.exp += 10;
      if (bond.exp >= bond.level * 100) {
        bond.level++;
        bond.exp = 0;
      }
      return {
        success: true,
        message: `\u89E6\u53D1\u5408\u4F53\u6280\u80FD\u300C${bond.skill}\u300D\uFF01`,
        level: bond.level,
        bonuses: { luck: luckBonus, attack: attackBonus, defense: defenseBonus, cultivation: cultivationBonus }
      };
    }
    /**
     * 获取所有羁绊
     */
    listBonds() {
      const bonds = Object.entries(this.gameState.beastBonds.bonds).map(([key, data]) => {
        var _a, _b, _c;
        const cat = (_a = this.gameState.beastCatalogue) == null ? void 0 : _a.owned;
        return {
          bondKey: key,
          beast1: ((_b = cat == null ? void 0 : cat[data.beasts[0]]) == null ? void 0 : _b.name) || data.beasts[0],
          beast2: ((_c = cat == null ? void 0 : cat[data.beasts[1]]) == null ? void 0 : _c.name) || data.beasts[1],
          type: data.type,
          level: data.level,
          skill: data.skill
        };
      });
      return { success: true, bonds, total: this.gameState.beastBonds.totalBonds };
    }
    /**
     * 解散羁绊
     */
    dissolveBond(beastId1, beastId2) {
      const bondKey = [beastId1, beastId2].sort().join("_");
      if (!this.gameState.beastBonds.bonds[bondKey]) {
        return { success: false, message: "\u65E0\u7F81\u7ECA\u5173\u7CFB" };
      }
      delete this.gameState.beastBonds.bonds[bondKey];
      this.gameState.beastBonds.totalBonds--;
      return { success: true, message: "\u7F81\u7ECA\u5DF2\u89E3\u9664" };
    }
  };
  var BEAST_BOND_TOOLS = [
    { name: "bond.create", description: "\u5EFA\u7ACB\u7F81\u7ECA", params: ["beastId1", "beastId2", "bondType"] },
    { name: "bond.trigger", description: "\u89E6\u53D1\u5408\u4F53", params: ["beastId1", "beastId2"] },
    { name: "bond.list", description: "\u7F81\u7ECA\u5217\u8868", params: [] },
    { name: "bond.dissolve", description: "\u89E3\u6563\u7F81\u7ECA", params: ["beastId1", "beastId2"] }
  ];

  // src/domains/cultivation/services/AuctionHouseService.js
  var ITEM_QUALITIES2 = { \u767D\u677F: 1, \u4F18\u79C0: 2, \u7CBE\u826F: 3, \u53F2\u8BD7: 4, \u4F20\u8BF4: 5, \u795E\u5668: 6 };
  var AUCTION_DURATIONS = { "1h": 36e5, "6h": 216e5, "12h": 432e5, "24h": 864e5 };
  var _instance2 = null;
  function createAuctionHouseService(gameState3) {
    if (_instance2) return _instance2;
    _instance2 = new AuctionHouseService(gameState3);
    return _instance2;
  }
  var AuctionHouseService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this._ensure();
    }
    _ensure() {
      if (!this.gameState.auctionHouse) {
        this.gameState.auctionHouse = {
          listings: {},
          bidHistory: [],
          myListings: {},
          totalSales: 0
        };
      }
    }
    /**
     * 挂售物品
     */
    listItem(itemId, itemName, quality, startingPrice, duration) {
      if (!ITEM_QUALITIES2[quality]) return { success: false, message: "\u65E0\u6548\u54C1\u8D28" };
      if (!AUCTION_DURATIONS[duration]) return { success: false, message: "\u65E0\u6548\u65F6\u957F" };
      const listingId = `listing_${Date.now()}`;
      const endTime = Date.now() + AUCTION_DURATIONS[duration];
      this.gameState.auctionHouse.listings[listingId] = {
        listingId,
        itemId,
        itemName,
        quality,
        startingPrice,
        currentBid: startingPrice,
        currentBidder: null,
        bids: [],
        endTime,
        seller: this.gameState.player.id || this.gameState.player.name,
        createdAt: Date.now()
      };
      return { success: true, listingId, endTime, message: `\u300C${itemName}\u300D\u5DF2\u6302\u552E` };
    }
    /**
     * 出价
     */
    placeBid(listingId, amount) {
      const listing = this.gameState.auctionHouse.listings[listingId];
      if (!listing) return { success: false, message: "\u62CD\u5356\u4E0D\u5B58\u5728" };
      if (Date.now() >= listing.endTime) return { success: false, message: "\u62CD\u5356\u5DF2\u7ED3\u675F" };
      const minBid = Math.floor(listing.currentBid * 1.1);
      if (amount < minBid) return { success: false, message: `\u6700\u4F4E\u51FA\u4EF7${minBid}` };
      if (listing.currentBidder) {
        const prev = listing.currentBidder;
      }
      listing.currentBid = amount;
      listing.currentBidder = this.gameState.player.id || this.gameState.player.name;
      listing.bids.push({ bidder: listing.currentBidder, amount, time: Date.now() });
      this.gameState.auctionHouse.bidHistory.push({ listingId, bidder: listing.currentBidder, amount });
      return {
        success: true,
        message: `\u51FA\u4EF7${amount}\u7075\u77F3\u6210\u529F`,
        currentBid: listing.currentBid
      };
    }
    /**
     * 领取拍卖结算
     */
    claimSale(listingId) {
      const listing = this.gameState.auctionHouse.listings[listingId];
      if (!listing) return { success: false, message: "\u62CD\u5356\u4E0D\u5B58\u5728" };
      if (Date.now() < listing.endTime) return { success: false, message: "\u62CD\u5356\u8FDB\u884C\u4E2D" };
      if (listing.seller !== (this.gameState.player.id || this.gameState.player.name)) {
        return { success: false, message: "\u65E0\u6743\u64CD\u4F5C" };
      }
      const seller = this.gameState.player;
      const fee = Math.floor(listing.currentBid * 0.05);
      const net = listing.currentBid - fee;
      seller.spiritStones = (seller.spiritStones || 0) + net;
      this.gameState.auctionHouse.totalSales += listing.currentBid;
      delete this.gameState.auctionHouse.listings[listingId];
      return {
        success: true,
        message: `\u62CD\u5356\u5B8C\u6210\uFF0C\u83B7\u5F97${net}\u7075\u77F3\uFF08\u6263\u9664${fee}\u624B\u7EED\u8D39\uFF09`,
        net,
        fee
      };
    }
    /**
     * 领取拍品
     */
    claimAuctionWin(listingId) {
      const listing = this.gameState.auctionHouse.listings[listingId];
      if (!listing) return { success: false, message: "\u62CD\u5356\u4E0D\u5B58\u5728" };
      if (Date.now() < listing.endTime) return { success: false, message: "\u62CD\u5356\u8FDB\u884C\u4E2D" };
      if (listing.currentBidder !== (this.gameState.player.id || this.gameState.player.name)) {
        return { success: false, message: "\u4E0D\u662F\u6700\u9AD8\u51FA\u4EF7\u8005" };
      }
      const player = this.gameState.player;
      if ((player.spiritStones || 0) < listing.currentBid) {
        return { success: false, message: "\u7075\u77F3\u4E0D\u8DB3" };
      }
      player.spiritStones -= listing.currentBid;
      delete this.gameState.auctionHouse.listings[listingId];
      return {
        success: true,
        message: `\u62CD\u5F97\u300C${listing.itemName}\u300D\uFF0C\u82B1\u8D39${listing.currentBid}\u7075\u77F3`
      };
    }
    /**
     * 获取活跃拍卖
     */
    getActiveListings(filter = {}) {
      const now = Date.now();
      let listings = Object.values(this.gameState.auctionHouse.listings).filter((l) => l.endTime > now);
      if (filter.quality) {
        listings = listings.filter((l) => l.quality === filter.quality);
      }
      return {
        success: true,
        listings: listings.sort((a, b) => a.endTime - b.endTime),
        count: listings.length
      };
    }
    /**
     * 获取我的拍卖
     */
    getMyListings() {
      const playerId = this.gameState.player.id || this.gameState.player.name;
      const mine = Object.values(this.gameState.auctionHouse.listings).filter((l) => l.seller === playerId);
      return { success: true, listings: mine };
    }
  };
  var AUCTION_TOOLS = [
    { name: "auction.list", description: "\u6302\u552E\u7269\u54C1", params: ["itemId", "itemName", "quality", "startingPrice", "duration"] },
    { name: "auction.bid", description: "\u51FA\u4EF7", params: ["listingId", "amount"] },
    { name: "auction.claimSale", description: "\u9886\u53D6\u62CD\u5356\u6B3E", params: ["listingId"] },
    { name: "auction.claimWin", description: "\u9886\u53D6\u62CD\u54C1", params: ["listingId"] },
    { name: "auction.active", description: "\u6D3B\u8DC3\u62CD\u5356", params: ["filter"] },
    { name: "auction.mine", description: "\u6211\u7684\u62CD\u5356", params: [] }
  ];

  // src/domains/cultivation/services/TournamentService.js
  var TOURNAMENT_TIERS = { \u51E1: 1, \u7075: 2, \u4ED9: 3, \u795E: 4, \u5929: 5 };
  var MATCH_RESULT = { WIN: "win", LOSE: "lose", DRAW: "draw" };
  var _instance3 = null;
  function createTournamentService(gameState3) {
    if (_instance3) return _instance3;
    _instance3 = new TournamentService(gameState3);
    return _instance3;
  }
  var TournamentService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this._ensure();
    }
    _ensure() {
      if (!this.gameState.tournaments) {
        this.gameState.tournaments = {
          history: [],
          registered: {},
          currentSeason: 1,
          rankings: {}
        };
      }
    }
    /**
     * 报名参赛
     */
    register(tier = "\u51E1") {
      if (!TOURNAMENT_TIERS[tier]) return { success: false, message: "\u65E0\u6548\u7EA7\u522B" };
      const playerId = this.gameState.player.id || this.gameState.player.name;
      if (this.gameState.tournaments.registered[playerId]) {
        return { success: false, message: "\u5DF2\u62A5\u540D" };
      }
      const entryFee = TOURNAMENT_TIERS[tier] * 500;
      const player = this.gameState.player;
      if ((player.spiritStones || 0) < entryFee) {
        return { success: false, message: "\u7075\u77F3\u4E0D\u8DB3" };
      }
      player.spiritStones -= entryFee;
      const matchId = `match_${Date.now()}`;
      this.gameState.tournaments.registered[playerId] = {
        tier,
        matchId,
        registeredAt: Date.now(),
        wins: 0,
        losses: 0,
        draws: 0
      };
      return { success: true, message: `\u62A5\u540D${tier}\u7EA7\u4ED9\u9053\u5927\u4F1A`, entryFee, matchId };
    }
    /**
     * 开始匹配
     */
    startMatch() {
      const playerId = this.gameState.player.id || this.gameState.player.name;
      const reg = this.gameState.tournaments.registered[playerId];
      if (!reg) return { success: false, message: "\u672A\u62A5\u540D" };
      const playerPower = (this.gameState.player.attack || 0) + (this.gameState.player.defense || 0) + (this.gameState.player.cultivationLevel || 1) * 100;
      const enemyPower = Math.floor(playerPower * (0.8 + Math.random() * 0.4));
      const playerScore = playerPower + Math.random() * 100;
      const enemyScore = enemyPower + Math.random() * 100;
      let result, rewards;
      if (playerScore > enemyScore * 1.1) {
        result = MATCH_RESULT.WIN;
        const tierMult = TOURNAMENT_TIERS[reg.tier];
        rewards = { exp: 1e3 * tierMult, spiritStones: 500 * tierMult, fame: 10 * tierMult };
      } else if (playerScore < enemyScore * 0.9) {
        result = MATCH_RESULT.LOSE;
        rewards = { exp: 100, spiritStones: 50 };
      } else {
        result = MATCH_RESULT.DRAW;
        rewards = { exp: 300, spiritStones: 150, fame: 2 };
      }
      if (result === MATCH_RESULT.WIN) reg.wins++;
      else if (result === MATCH_RESULT.LOSE) reg.losses++;
      else reg.draws++;
      const player = this.gameState.player;
      player.exp = (player.exp || 0) + rewards.exp;
      player.spiritStones = (player.spiritStones || 0) + rewards.spiritStones;
      if (rewards.fame) {
        player.fame = (player.fame || 0) + rewards.fame;
      }
      this.gameState.tournaments.history.push({
        playerId,
        tier: reg.tier,
        result,
        enemyPower,
        playerPower,
        rewards,
        timestamp: Date.now()
      });
      return { success: true, result, enemyPower, playerPower, rewards };
    }
    /**
     * 取消报名
     */
    unregister() {
      const playerId = this.gameState.player.id || this.gameState.player.name;
      if (!this.gameState.tournaments.registered[playerId]) {
        return { success: false, message: "\u672A\u62A5\u540D" };
      }
      delete this.gameState.tournaments.registered[playerId];
      return { success: true, message: "\u5DF2\u53D6\u6D88\u62A5\u540D" };
    }
    /**
     * 获取排名
     */
    getRankings(tier = "\u51E1") {
      const history = this.gameState.tournaments.history;
      const scores = {};
      for (const h of history) {
        if (h.tier !== tier) continue;
        if (!scores[h.playerId]) scores[h.playerId] = { wins: 0, losses: 0, draws: 0, score: 0 };
        const s = scores[h.playerId];
        if (h.result === MATCH_RESULT.WIN) {
          s.wins++;
          s.score += 3;
        } else if (h.result === MATCH_RESULT.LOSE) {
          s.losses++;
        } else {
          s.draws++;
          s.score += 1;
        }
      }
      const rankings = Object.entries(scores).map(([playerId, data]) => ({ playerId, ...data })).sort((a, b) => b.score - a.score);
      return { success: true, tier, rankings };
    }
    /**
     * 获取赛事历史
     */
    getHistory(limit = 20) {
      return {
        success: true,
        history: this.gameState.tournaments.history.slice(-limit)
      };
    }
  };
  var TOURNAMENT_TOOLS = [
    { name: "tournament.register", description: "\u62A5\u540D\u53C2\u8D5B", params: ["tier"] },
    { name: "tournament.match", description: "\u5F00\u59CB\u5339\u914D", params: [] },
    { name: "tournament.unregister", description: "\u53D6\u6D88\u62A5\u540D", params: [] },
    { name: "tournament.rankings", description: "\u6392\u884C\u699C", params: ["tier"] },
    { name: "tournament.history", description: "\u8D5B\u4E8B\u5386\u53F2", params: ["limit"] }
  ];

  // src/domains/sect/services/ImmortalSectService.js
  var IMMORTAL_SECT_CONFIG = {
    createCost: 5e4,
    // 创建仙界宗门消耗灵石
    joinCost: 1e4,
    // 加入仙界宗门消耗灵石
    maxSectLevel: 5,
    // 最高5星宗门
    resourceTypes: ["spiritStones", "pills", "techniques", "merit"],
    // 资源类型
    tradeTaxRate: 0.05,
    // 交易税率5%
    eliteDiscipleLimit: 10,
    // 每宗门最多10名精英弟子
    allianceMaxSects: 5
    // 联盟最多5个宗门
  };
  function createImmortalSect(name, founderId) {
    return {
      uid: "ims_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      name,
      founder: founderId,
      sectLevel: 1,
      // 1-5星
      members: [{
        uid: founderId,
        role: "founder",
        joinedAt: Date.now(),
        contribution: 0,
        isElite: false
      }],
      resources: {
        spiritStones: 0,
        pills: 0,
        techniques: 0,
        merit: 0
      },
      eliteDisciples: [],
      // 精英弟子UID列表
      alliances: [],
      // 结盟宗门UID列表
      enemies: [],
      // 敌对宗门UID列表
      createdAt: Date.now(),
      reputation: 100,
      activeTrades: []
      // 进行中的交易
    };
  }
  function createEliteDisciple(discipleInfo) {
    return {
      uid: "eld_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      originalUid: discipleInfo.uid,
      name: discipleInfo.name,
      realm: discipleInfo.realm || 6,
      // 默认地仙境界
      talentIndex: discipleInfo.talentIndex || 3,
      specialSkills: [],
      // 特殊技能
      cultivationSpeed: 1,
      combatPower: 0,
      promotedAt: Date.now(),
      contribution: 0
    };
  }
  function createImmortalSectService(gameState3) {
    return new ImmortalSectService(gameState3);
  }
  var ImmortalSectService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.immortalSects = /* @__PURE__ */ new Map();
      this.playerSectId = null;
    }
    /**
     * 初始化仙界宗门系统
     */
    init(gameState3) {
      if (!gameState3.immortalSects) {
        gameState3.immortalSects = {
          sects: [],
          // 所有仙界宗门列表
          playerSectId: null,
          // 玩家所在的仙界宗门ID
          tradeHistory: [],
          // 交易历史
          allianceRecords: []
          // 结盟记录
        };
      }
      this.immortalSects = gameState3.immortalSects;
      return gameState3;
    }
    /**
     * 检查玩家是否已飞升
     */
    isPlayerAscended() {
      var _a;
      return ((_a = this.gameState.ascension) == null ? void 0 : _a.ascended) === true;
    }
    /**
     * 获取玩家当前仙界宗门
     */
    getPlayerSect() {
      if (!this.immortalSects.playerSectId) return null;
      return this.immortalSects.sects.find((s) => s.uid === this.immortalSects.playerSectId);
    }
    // ========== MCP 工具实现 ==========
    /**
     * sect.immortal.create - 创建仙界宗门
     * @param {Object} params - { name: string }
     */
    mcpCreate(params = {}) {
      var _a, _b;
      const { name } = params;
      if (!this.isPlayerAscended()) {
        return {
          success: false,
          error: "\u5C1A\u672A\u98DE\u5347\uFF0C\u65E0\u6CD5\u521B\u5EFA\u4ED9\u754C\u5B97\u95E8"
        };
      }
      if (this.immortalSects.playerSectId) {
        return {
          success: false,
          error: "\u4F60\u5DF2\u52A0\u5165\u4ED9\u754C\u5B97\u95E8\uFF0C\u65E0\u6CD5\u518D\u6B21\u521B\u5EFA"
        };
      }
      if (!name || name.trim().length < 2) {
        return {
          success: false,
          error: "\u5B97\u95E8\u540D\u79F0\u81F3\u5C11\u9700\u89812\u4E2A\u5B57\u7B26"
        };
      }
      if (name.length > 20) {
        return {
          success: false,
          error: "\u5B97\u95E8\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC720\u4E2A\u5B57\u7B26"
        };
      }
      const cost = IMMORTAL_SECT_CONFIG.createCost;
      if ((this.gameState.spiritStones || 0) < cost) {
        return {
          success: false,
          error: `\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981 ${cost} \u7075\u77F3\u6765\u521B\u5EFA\u4ED9\u754C\u5B97\u95E8`
        };
      }
      this.gameState.spiritStones -= cost;
      const sect = createImmortalSect(name, ((_a = this.gameState.player) == null ? void 0 : _a.uid) || "player");
      sect.founder = ((_b = this.gameState.player) == null ? void 0 : _b.name) || "\u5B97\u4E3B";
      this.immortalSects.sects.push(sect);
      this.immortalSects.playerSectId = sect.uid;
      return {
        success: true,
        message: `\u4ED9\u754C\u5B97\u95E8\u300C${name}\u300D\u521B\u5EFA\u6210\u529F\uFF01`,
        sect: {
          uid: sect.uid,
          name: sect.name,
          sectLevel: sect.sectLevel,
          founder: sect.founder,
          memberCount: sect.members.length,
          resources: sect.resources
        },
        costDeducted: cost
      };
    }
    /**
     * sect.immortal.join - 加入仙界宗门
     * @param {Object} params - { sectId: string }
     */
    mcpJoin(params = {}) {
      var _a;
      const { sectId } = params;
      if (!this.isPlayerAscended()) {
        return {
          success: false,
          error: "\u5C1A\u672A\u98DE\u5347\uFF0C\u65E0\u6CD5\u52A0\u5165\u4ED9\u754C\u5B97\u95E8"
        };
      }
      if (this.immortalSects.playerSectId) {
        return {
          success: false,
          error: "\u4F60\u5DF2\u52A0\u5165\u4ED9\u754C\u5B97\u95E8"
        };
      }
      const targetSect = this.immortalSects.sects.find((s) => s.uid === sectId);
      if (!targetSect) {
        return {
          success: false,
          error: "\u4ED9\u754C\u5B97\u95E8\u4E0D\u5B58\u5728"
        };
      }
      const maxMembers = IMMORTAL_SECT_CONFIG.maxSectLevel * 10;
      if (targetSect.members.length >= maxMembers) {
        return {
          success: false,
          error: "\u8BE5\u5B97\u95E8\u4EBA\u6570\u5DF2\u6EE1"
        };
      }
      const cost = IMMORTAL_SECT_CONFIG.joinCost;
      if ((this.gameState.spiritStones || 0) < cost) {
        return {
          success: false,
          error: `\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981 ${cost} \u7075\u77F3\u52A0\u5165\u5B97\u95E8`
        };
      }
      this.gameState.spiritStones -= cost;
      const playerInfo = {
        uid: ((_a = this.gameState.player) == null ? void 0 : _a.uid) || "player",
        role: "member",
        joinedAt: Date.now(),
        contribution: 0,
        isElite: false
      };
      targetSect.members.push(playerInfo);
      this.immortalSects.playerSectId = sectId;
      return {
        success: true,
        message: `\u6210\u529F\u52A0\u5165\u4ED9\u754C\u5B97\u95E8\u300C${targetSect.name}\u300D\uFF01`,
        sect: {
          uid: targetSect.uid,
          name: targetSect.name,
          sectLevel: targetSect.sectLevel,
          memberCount: targetSect.members.length,
          resources: targetSect.resources
        },
        costDeducted: cost
      };
    }
    /**
     * sect.immortal.resource.list - 查看宗门资源
     * @param {Object} params - { sectId?: string }
     */
    mcpResourceList(params = {}) {
      const { sectId } = params;
      let sect;
      if (sectId) {
        sect = this.immortalSects.sects.find((s) => s.uid === sectId);
      } else {
        sect = this.getPlayerSect();
      }
      if (!sect) {
        return {
          success: false,
          error: "\u672A\u627E\u5230\u4ED9\u754C\u5B97\u95E8"
        };
      }
      const dailyIncome = this.calculateDailyIncome(sect);
      const recentTrades = this.immortalSects.tradeHistory.filter((t) => t.sectId === sect.uid).slice(-10);
      return {
        success: true,
        sect: {
          uid: sect.uid,
          name: sect.name,
          sectLevel: sect.sectLevel,
          resources: sect.resources,
          dailyIncome,
          memberCount: sect.members.length,
          eliteDiscipleCount: sect.eliteDisciples.length,
          allianceCount: sect.alliances.length,
          reputation: sect.reputation
        },
        recentTrades
      };
    }
    /**
     * 计算宗门每日产出
     */
    calculateDailyIncome(sect) {
      const memberCount = sect.members.length;
      const eliteCount = sect.eliteDisciples.length;
      const levelBonus = sect.sectLevel * 0.2 + 1;
      return {
        spiritStones: Math.floor(100 * memberCount * levelBonus),
        pills: Math.floor(5 * eliteCount * levelBonus),
        techniques: Math.floor(1 * memberCount * levelBonus),
        merit: Math.floor(10 * memberCount * levelBonus)
      };
    }
    /**
     * sect.immortal.trade.execute - 执行宗门间交易
     * @param {Object} params - { targetSectId, resourceType, amount, price }
     */
    mcpTradeExecute(params = {}) {
      const { targetSectId, resourceType, amount, price } = params;
      const playerSect = this.getPlayerSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      if (!targetSectId) {
        return {
          success: false,
          error: "\u8BF7\u6307\u5B9A\u76EE\u6807\u5B97\u95E8ID"
        };
      }
      if (!IMMORTAL_SECT_CONFIG.resourceTypes.includes(resourceType)) {
        return {
          success: false,
          error: `\u65E0\u6548\u7684\u8D44\u6E90\u7C7B\u578B\uFF0C\u53EF\u9009: ${IMMORTAL_SECT_CONFIG.resourceTypes.join(", ")}`
        };
      }
      if (!amount || amount <= 0) {
        return {
          success: false,
          error: "\u4EA4\u6613\u6570\u91CF\u5FC5\u987B\u5927\u4E8E0"
        };
      }
      if (!price || price <= 0) {
        return {
          success: false,
          error: "\u4EA4\u6613\u4EF7\u683C\u5FC5\u987B\u5927\u4E8E0"
        };
      }
      const targetSect = this.immortalSects.sects.find((s) => s.uid === targetSectId);
      if (!targetSect) {
        return {
          success: false,
          error: "\u76EE\u6807\u4ED9\u754C\u5B97\u95E8\u4E0D\u5B58\u5728"
        };
      }
      if (playerSect.enemies.includes(targetSectId)) {
        return {
          success: false,
          error: "\u4E0E\u8BE5\u5B97\u95E8\u5904\u4E8E\u654C\u5BF9\u72B6\u6001\uFF0C\u65E0\u6CD5\u4EA4\u6613"
        };
      }
      const playerResource = playerSect.resources[resourceType] || 0;
      if (playerResource < amount) {
        return {
          success: false,
          error: `${resourceType} \u4E0D\u8DB3\uFF0C\u5F53\u524D\u62E5\u6709 ${playerResource}`
        };
      }
      const tax = Math.floor(price * IMMORTAL_SECT_CONFIG.tradeTaxRate);
      const totalCost = price + tax;
      playerSect.resources[resourceType] -= amount;
      const tradeRecord = {
        id: "trd_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        sectId: playerSect.uid,
        targetSectId,
        resourceType,
        amount,
        price,
        tax,
        timestamp: Date.now(),
        status: "pending"
      };
      this.immortalSects.tradeHistory.push(tradeRecord);
      return {
        success: true,
        message: `\u5411\u300C${targetSect.name}\u300D\u53D1\u8D77${resourceType}\u4EA4\u6613\u8BF7\u6C42`,
        trade: {
          id: tradeRecord.id,
          resourceType,
          amount,
          price,
          tax,
          totalCost,
          status: "pending"
        },
        remainingResource: playerSect.resources[resourceType]
      };
    }
    /**
     * sect.immortal.disciple.promote - 晋升精英弟子
     * @param {Object} params - { discipleUid: string }
     */
    mcpDisciplePromote(params = {}) {
      const { discipleUid } = params;
      const playerSect = this.getPlayerSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      if (playerSect.eliteDisciples.length >= IMMORTAL_SECT_CONFIG.eliteDiscipleLimit) {
        return {
          success: false,
          error: `\u7CBE\u82F1\u5F1F\u5B50\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\uFF08${IMMORTAL_SECT_CONFIG.eliteDiscipleLimit}\u540D\uFF09`
        };
      }
      const mortalSect = this.gameState.sect;
      if (!mortalSect || !mortalSect.disciples) {
        return {
          success: false,
          error: "\u51E1\u754C\u5B97\u95E8\u4E0D\u5B58\u5728\u6216\u65E0\u5F1F\u5B50"
        };
      }
      const disciple = mortalSect.disciples.find((d) => d.uid === discipleUid);
      if (!disciple) {
        return {
          success: false,
          error: "\u672A\u627E\u5230\u8BE5\u5F1F\u5B50"
        };
      }
      if (playerSect.eliteDisciples.find((e) => e.originalUid === discipleUid)) {
        return {
          success: false,
          error: "\u8BE5\u5F1F\u5B50\u5DF2\u7ECF\u662F\u7CBE\u82F1\u5F1F\u5B50"
        };
      }
      if ((disciple.realm || 0) < 2) {
        return {
          success: false,
          error: "\u5F1F\u5B50\u5883\u754C\u8FC7\u4F4E\uFF0C\u9700\u8981\u91D1\u4E39\u671F\u4EE5\u4E0A\u624D\u80FD\u664B\u5347\u7CBE\u82F1"
        };
      }
      const eliteDisciple = createEliteDisciple({
        uid: disciple.uid,
        name: disciple.name,
        realm: disciple.realm,
        talentIndex: disciple.talentIndex || 1
      });
      eliteDisciple.specialSkills = this.assignSpecialSkills(eliteDisciple);
      playerSect.eliteDisciples.push(eliteDisciple);
      return {
        success: true,
        message: `${disciple.name}\u664B\u5347\u4E3A\u7CBE\u82F1\u5F1F\u5B50\uFF01`,
        eliteDisciple: {
          uid: eliteDisciple.uid,
          name: eliteDisciple.name,
          realm: eliteDisciple.realm,
          specialSkills: eliteDisciple.specialSkills,
          promotedAt: eliteDisciple.promotedAt
        },
        eliteDiscipleCount: playerSect.eliteDisciples.length
      };
    }
    /**
     * 分配特殊技能
     */
    assignSpecialSkills(disciple) {
      const skillPool = [
        { id: "spiritShield", name: "\u7075\u529B\u62A4\u76FE", effect: "defense +30%" },
        { id: "quickStrike", name: "\u75BE\u98CE\u65A9", effect: "attack +25%" },
        { id: "meditation", name: "\u5165\u5B9A", effect: "cultivationSpeed +20%" },
        { id: "eyeOfTruth", name: "\u6D1E\u5BDF\u4E4B\u773C", effect: "perception +35%" },
        { id: "swiftFoot", name: "\u7F29\u5730\u672F", effect: "evasion +30%" },
        { id: "alchemyTalent", name: "\u70BC\u4E39\u5929\u8D4B", effect: "pillQuality +25%" }
      ];
      const skillCount = Math.min(3, Math.floor((disciple.talentIndex || 1) / 2) + 1);
      const selected = [];
      const shuffled = skillPool.sort(() => Math.random() - 0.5);
      for (let i = 0; i < skillCount; i++) {
        selected.push(shuffled[i]);
      }
      return selected;
    }
    /**
     * sect.immortal.alliance.form - 形成宗门联盟
     * @param {Object} params - { targetSectId: string }
     */
    mcpAllianceForm(params = {}) {
      const { targetSectId } = params;
      const playerSect = this.getPlayerSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      const targetSect = this.immortalSects.sects.find((s) => s.uid === targetSectId);
      if (!targetSect) {
        return {
          success: false,
          error: "\u76EE\u6807\u4ED9\u754C\u5B97\u95E8\u4E0D\u5B58\u5728"
        };
      }
      if (targetSectId === playerSect.uid) {
        return {
          success: false,
          error: "\u65E0\u6CD5\u4E0E\u81EA\u5DF1\u7ED3\u76DF"
        };
      }
      if (playerSect.alliances.includes(targetSectId)) {
        return {
          success: false,
          error: "\u5DF2\u662F\u76DF\u53CB"
        };
      }
      if (playerSect.enemies.includes(targetSectId)) {
        return {
          success: false,
          error: "\u4E0E\u8BE5\u5B97\u95E8\u5904\u4E8E\u654C\u5BF9\u72B6\u6001\uFF0C\u65E0\u6CD5\u7ED3\u76DF"
        };
      }
      if (playerSect.alliances.length >= IMMORTAL_SECT_CONFIG.allianceMaxSects) {
        return {
          success: false,
          error: `\u76DF\u53CB\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\uFF08${IMMORTAL_SECT_CONFIG.allianceMaxSects}\u4E2A\u5B97\u95E8\uFF09`
        };
      }
      if (targetSect.alliances.length >= IMMORTAL_SECT_CONFIG.allianceMaxSects) {
        return {
          success: false,
          error: "\u5BF9\u65B9\u5B97\u95E8\u76DF\u53CB\u6570\u5DF2\u8FBE\u4E0A\u9650"
        };
      }
      playerSect.alliances.push(targetSectId);
      targetSect.alliances.push(playerSect.uid);
      const allianceRecord = {
        id: "al_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        sectId: playerSect.uid,
        targetSectId,
        formedAt: Date.now(),
        type: "mutual"
      };
      this.immortalSects.allianceRecords.push(allianceRecord);
      playerSect.reputation += 50;
      targetSect.reputation += 50;
      return {
        success: true,
        message: `\u4E0E\u300C${targetSect.name}\u300D\u6210\u529F\u7ED3\u76DF\uFF01`,
        alliance: {
          id: allianceRecord.id,
          sectName: playerSect.name,
          targetSectName: targetSect.name,
          formedAt: allianceRecord.formedAt
        },
        playerAllianceCount: playerSect.alliances.length,
        targetAllianceCount: targetSect.alliances.length
      };
    }
    /**
     * 获取所有仙界宗门列表（用于MCP工具注册）
     */
    getAllSects() {
      return this.immortalSects.sects.map((s) => ({
        uid: s.uid,
        name: s.name,
        sectLevel: s.sectLevel,
        memberCount: s.members.length,
        reputation: s.reputation
      }));
    }
    /**
     * 获取玩家的精英弟子列表
     */
    getEliteDisciples() {
      const playerSect = this.getPlayerSect();
      if (!playerSect) return [];
      return playerSect.eliteDisciples;
    }
    /**
     * 列出所有可用的MCP工具处理器
     */
    getMCPHandlers() {
      return {
        "sect.immortal.create": (params) => this.mcpCreate(params),
        "sect.immortal.join": (params) => this.mcpJoin(params),
        "sect.immortal.resource.list": (params) => this.mcpResourceList(params),
        "sect.immortal.trade.execute": (params) => this.mcpTradeExecute(params),
        "sect.immortal.disciple.promote": (params) => this.mcpDisciplePromote(params),
        "sect.immortal.alliance.form": (params) => this.mcpAllianceForm(params)
      };
    }
  };

  // src/domains/player/services/CaveDwellingService.js
  var CAVE_LOCATIONS = ["\u79D8\u5883", "\u4ED9\u5C71", "\u6D77\u5E95", "\u6DF1\u6E0A", "\u4E91\u7AEF"];
  var CAVE_SCALES = ["\u5C0F\u578B", "\u4E2D\u578B", "\u5927\u578B", "\u6D1E\u5929"];
  var CAVE_LEVEL_CONFIG = {
    1: { name: "\u521D\u6210", cultivationBonus: 5, spiritStoneCost: 500, materials: ["\u7075\u77F3x100", "\u7075\u6728x20"] },
    2: { name: "\u5C0F\u6210", cultivationBonus: 10, spiritStoneCost: 1500, materials: ["\u7075\u77F3x300", "\u7075\u6728x50", "\u7075\u7389x10"] },
    3: { name: "\u5927\u6210", cultivationBonus: 20, spiritStoneCost: 5e3, materials: ["\u7075\u77F3x1000", "\u7075\u6728x150", "\u7075\u7389x30", "\u5929\u6750x5"] },
    4: { name: "\u5706\u6EE1", cultivationBonus: 35, spiritStoneCost: 15e3, materials: ["\u7075\u77F3x3000", "\u7075\u6728x400", "\u7075\u7389x80", "\u5929\u6750x15"] },
    5: { name: "\u6D1E\u5929", cultivationBonus: 50, spiritStoneCost: 5e4, materials: ["\u7075\u77F3x10000", "\u7075\u6728x1000", "\u7075\u7389x200", "\u5929\u6750x50"] }
  };
  var LOCATION_BLESSING_CONFIG = {
    "\u79D8\u5883": { primaryBonus: "serendipity", secondaryBonus: "cultivation", cultivationBonus: 1.5, serendipityBonus: 2, description: "\u79D8\u5883\u6D1E\u5E9C - \u5947\u9047\u52A0\u6210" },
    "\u4ED9\u5C71": { primaryBonus: "cultivation", secondaryBonus: "qi", cultivationBonus: 2, qiBonus: 1.5, description: "\u4ED9\u5C71\u6D1E\u5E9C - \u4FEE\u70BC\u52A0\u6210" },
    "\u6D77\u5E95": { primaryBonus: "qi", secondaryBonus: "spiritStones", cultivationBonus: 1.3, qiBonus: 2, spiritStoneBonus: 1.5, description: "\u6D77\u5E95\u6D1E\u5E9C - \u7075\u6C14\u52A0\u6210" },
    "\u6DF1\u6E0A": { primaryBonus: "combat", secondaryBonus: "cultivation", cultivationBonus: 1.5, combatBonus: 2, description: "\u6DF1\u6E0A\u6D1E\u5E9C - \u6218\u6597\u52A0\u6210" },
    "\u4E91\u7AEF": { primaryBonus: "reputation", secondaryBonus: "cultivation", cultivationBonus: 1.8, reputationBonus: 2, description: "\u4E91\u7AEF\u6D1E\u5E9C - \u540D\u671B\u52A0\u6210" }
  };
  var CaveDwellingService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.residences = /* @__PURE__ */ new Map();
      this.visitHistory = [];
      this.tradeHistory = [];
    }
    /**
     * 初始化洞府服务
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.residence) {
        gameState3.residence = {
          hasResidence: false,
          residence: null,
          upgradeLevel: 0,
          location: null,
          scale: null,
          builtAt: null,
          lastVisitAt: null,
          totalBlessings: 0,
          visitors: [],
          tradeOffers: []
        };
      }
      if (!gameState3.residence.residences) {
        gameState3.residence.residences = [];
      }
      console.log("[CaveDwelling] \u7075\u754C\u6D1E\u5E9C\u7CFB\u7EDF\u521D\u59CB\u5316\u5B8C\u6210");
      return this;
    }
    /**
     * 获取MCP工具处理器
     */
    getMCPHandlers() {
      return {
        "residence.build": (params) => this.mcpBuild(params),
        "residence.upgrade": (params) => this.mcpUpgrade(params),
        "residence.query": (params) => this.mcpQuery(params),
        "residence.blessing": (params) => this.mcpBlessing(params),
        "residence.visit": (params) => this.mcpVisit(params),
        "residence.trade": (params) => this.mcpTrade(params)
      };
    }
    // ===== residence.build - 建造洞府 =====
    /**
     * MCP工具: 建造洞府
     */
    mcpBuild(params = {}) {
      const { location: location2, scale, customName } = params;
      if (!location2 || !CAVE_LOCATIONS.includes(location2)) {
        return { success: false, error: "\u65E0\u6548\u7684\u6D1E\u5E9C\u4F4D\u7F6E", validLocations: CAVE_LOCATIONS };
      }
      if (!scale || !CAVE_SCALES.includes(scale)) {
        return { success: false, error: "\u65E0\u6548\u7684\u6D1E\u5E9C\u89C4\u6A21", validScales: CAVE_SCALES };
      }
      const levelConfig = CAVE_LEVEL_CONFIG[1];
      const cost = levelConfig.spiritStoneCost;
      const currentStones = this.gameState.spiritStones || 0;
      if (currentStones < cost) {
        return { success: false, error: "\u7075\u77F3\u4E0D\u8DB3", required: cost, available: currentStones };
      }
      this.gameState.spiritStones -= cost;
      const residence = {
        id: `residence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: customName || `${location2}${scale}\u6D1E\u5E9C`,
        location: location2,
        scale,
        level: 1,
        builtAt: Date.now(),
        lastUpgradeAt: Date.now(),
        cultivationProgress: 0,
        totalVisits: 0,
        blessings: this.calculateBlessing(location2, scale, 1)
      };
      this.gameState.residence.hasResidence = true;
      this.gameState.residence.residence = residence;
      this.gameState.residence.upgradeLevel = 1;
      this.gameState.residence.location = location2;
      this.gameState.residence.scale = scale;
      this.gameState.residence.builtAt = residence.builtAt;
      this.residences.set(residence.id, residence);
      return {
        success: true,
        message: `\u6D1E\u5E9C\u3010${residence.name}\u3011\u5EFA\u9020\u6210\u529F\uFF01`,
        residence: {
          id: residence.id,
          name: residence.name,
          location: residence.location,
          scale: residence.scale,
          level: residence.level,
          cost
        },
        remainingStones: this.gameState.spiritStones
      };
    }
    // ===== residence.upgrade - 升级洞府 =====
    /**
     * MCP工具: 升级洞府
     */
    mcpUpgrade(params = {}) {
      const { confirm: confirm2 } = params;
      if (!this.gameState.residence.hasResidence) {
        return { success: false, error: "\u5C1A\u672A\u5EFA\u9020\u6D1E\u5E9C" };
      }
      const residence = this.gameState.residence.residence;
      const currentLevel = residence.level;
      if (currentLevel >= 5) {
        return { success: false, error: "\u6D1E\u5E9C\u5DF2\u8FBE\u5230\u6700\u9AD8\u7B49\u7EA7(5\u7EA7)" };
      }
      const nextLevelConfig = CAVE_LEVEL_CONFIG[currentLevel + 1];
      const cost = nextLevelConfig.spiritStoneCost;
      const currentStones = this.gameState.spiritStones || 0;
      if (currentStones < cost) {
        return {
          success: false,
          error: "\u7075\u77F3\u4E0D\u8DB3",
          required: cost,
          available: currentStones,
          shortfall: cost - currentStones
        };
      }
      this.gameState.spiritStones -= cost;
      const oldLevel = residence.level;
      residence.level = currentLevel + 1;
      residence.lastUpgradeAt = Date.now();
      residence.blessings = this.calculateBlessing(residence.location, residence.scale, residence.level);
      this.gameState.residence.upgradeLevel = residence.level;
      return {
        success: true,
        message: `\u6D1E\u5E9C\u5347\u7EA7\u6210\u529F\uFF01${CAVE_LEVEL_CONFIG[oldLevel].name} \u2192 ${CAVE_LEVEL_CONFIG[residence.level].name}`,
        upgrade: {
          fromLevel: oldLevel,
          toLevel: residence.level,
          newBonus: residence.blessings.cultivationBonus,
          cost
        },
        remainingStones: this.gameState.spiritStones
      };
    }
    // ===== residence.query - 查询洞府状态 =====
    /**
     * MCP工具: 查询洞府状态
     */
    mcpQuery(params = {}) {
      const { detailed } = params;
      if (!this.gameState.residence.hasResidence) {
        return {
          hasResidence: false,
          message: "\u5C1A\u672A\u5EFA\u9020\u6D1E\u5E9C\uFF0C\u8BF7\u4F7F\u7528 residence.build \u5EFA\u9020"
        };
      }
      const residence = this.gameState.residence.residence;
      const levelConfig = CAVE_LEVEL_CONFIG[residence.level];
      const locationConfig = LOCATION_BLESSING_CONFIG[residence.location];
      const result = {
        hasResidence: true,
        residence: {
          id: residence.id,
          name: residence.name,
          location: residence.location,
          scale: residence.scale,
          level: residence.level,
          levelName: levelConfig.name,
          builtAt: residence.builtAt,
          lastUpgradeAt: residence.lastUpgradeAt,
          totalVisits: residence.totalVisits
        },
        blessings: {
          cultivationBonus: residence.blessings.cultivationBonus,
          primaryBonus: locationConfig.primaryBonus,
          description: locationConfig.description
        }
      };
      if (detailed) {
        result.detailed = {
          scaleName: residence.scale,
          locationBonus: locationConfig,
          nextLevelUpgrade: residence.level < 5 ? {
            level: residence.level + 1,
            name: CAVE_LEVEL_CONFIG[residence.level + 1].name,
            cost: CAVE_LEVEL_CONFIG[residence.level + 1].spiritStoneCost,
            bonus: CAVE_LEVEL_CONFIG[residence.level + 1].cultivationBonus
          } : null,
          age: Date.now() - residence.builtAt,
          visitors: residence.totalVisits
        };
      }
      return result;
    }
    // ===== residence.blessing - 获取洞府加成 =====
    /**
     * MCP工具: 获取洞府加成
     */
    mcpBlessing(params = {}) {
      const { type } = params;
      if (!this.gameState.residence.hasResidence) {
        return { success: false, error: "\u5C1A\u672A\u5EFA\u9020\u6D1E\u5E9C" };
      }
      const residence = this.gameState.residence.residence;
      const locationConfig = LOCATION_BLESSING_CONFIG[residence.location];
      const levelConfig = CAVE_LEVEL_CONFIG[residence.level];
      const blessings = {
        cultivation: {
          bonus: residence.blessings.cultivationBonus,
          description: `\u4FEE\u70BC\u901F\u5EA6\u63D0\u5347${residence.blessings.cultivationBonus}%`
        },
        location: {
          bonus: locationConfig,
          description: locationConfig.description
        },
        total: {
          combinedBonus: this.calculateCombinedBonus(residence, locationConfig),
          description: "\u6D1E\u5E9C\u7EFC\u5408\u52A0\u6210"
        }
      };
      if (type && blessings[type]) {
        return { success: true, blessing: blessings[type] };
      }
      return {
        success: true,
        residenceId: residence.id,
        residenceName: residence.name,
        currentLevel: residence.level,
        levelName: levelConfig.name,
        blessings
      };
    }
    // ===== residence.visit - 拜访他人洞府 =====
    /**
     * MCP工具: 拜访他人洞府
     */
    mcpVisit(params = {}) {
      var _a;
      const { hostId, hostName } = params;
      const visitResult = {
        success: true,
        visitedAt: Date.now(),
        hostId: hostId || "npc_001",
        hostName: hostName || "\u795E\u79D8\u4FEE\u58EB",
        duration: 36e5,
        // 1小时
        rewards: {}
      };
      const baseReward = 10;
      const levelMultiplier = (((_a = this.gameState.residence.residence) == null ? void 0 : _a.level) || 1) * 0.5;
      visitResult.rewards.spiritStones = Math.floor(baseReward * levelMultiplier);
      visitResult.rewards.cultivationProgress = Math.floor(baseReward * levelMultiplier * 2);
      this.visitHistory.push({
        visitedAt: visitResult.visitedAt,
        hostId: visitResult.hostId,
        hostName: visitResult.hostName
      });
      if (this.gameState.residence.hasResidence) {
        this.gameState.residence.residence.totalVisits = (this.gameState.residence.residence.totalVisits || 0) + 1;
      }
      return {
        success: true,
        message: `\u62DC\u8BBF\u3010${visitResult.hostName}\u3011\u7684\u6D1E\u5E9C\u6210\u529F\uFF01`,
        visit: visitResult,
        rewards: visitResult.rewards
      };
    }
    // ===== residence.trade - 洞府资源交易 =====
    /**
     * MCP工具: 洞府资源交易
     */
    mcpTrade(params = {}) {
      var _a;
      const { resourceType, amount, price, action } = params;
      if (!this.gameState.residence.hasResidence) {
        return { success: false, error: "\u5C1A\u672A\u5EFA\u9020\u6D1E\u5E9C\uFF0C\u65E0\u6CD5\u8FDB\u884C\u4EA4\u6613" };
      }
      if (action === "list") {
        const currentOffers = this.gameState.residence.tradeOffers || [];
        return {
          success: true,
          action: "list",
          offers: currentOffers,
          count: currentOffers.length
        };
      }
      const validResources = ["spiritStones", "materials", "pills", "herbs"];
      if (!resourceType || !validResources.includes(resourceType)) {
        return { success: false, error: "\u65E0\u6548\u7684\u4EA4\u6613\u8D44\u6E90\u7C7B\u578B", validTypes: validResources };
      }
      if (!amount || amount <= 0) {
        return { success: false, error: "\u4EA4\u6613\u6570\u91CF\u5FC5\u987B\u5927\u4E8E0" };
      }
      if (!price || price <= 0) {
        return { success: false, error: "\u4EA4\u6613\u4EF7\u683C\u5FC5\u987B\u5927\u4E8E0" };
      }
      if (action === "execute") {
        const totalCost = amount * price;
        const currentStones = this.gameState.spiritStones || 0;
        if (currentStones < totalCost) {
          return { success: false, error: "\u7075\u77F3\u4E0D\u8DB3", required: totalCost, available: currentStones };
        }
        this.gameState.spiritStones -= totalCost;
        const tradeResult = {
          id: `trade_${Date.now()}`,
          resourceType,
          amount,
          price,
          totalCost,
          executedAt: Date.now(),
          seller: "system"
        };
        this.tradeHistory.push(tradeResult);
        return {
          success: true,
          message: `\u4EA4\u6613\u6210\u529F\uFF01\u82B1\u8D39${totalCost}\u7075\u77F3\u8D2D\u4E70${amount}\u4E2A${resourceType}`,
          trade: tradeResult,
          remainingStones: this.gameState.spiritStones
        };
      }
      const offer = {
        id: `offer_${Date.now()}`,
        resourceType,
        amount,
        price,
        createdAt: Date.now(),
        seller: ((_a = this.gameState.player) == null ? void 0 : _a.name) || "\u533F\u540D\u4FEE\u58EB"
      };
      if (!this.gameState.residence.tradeOffers) {
        this.gameState.residence.tradeOffers = [];
      }
      this.gameState.residence.tradeOffers.push(offer);
      return {
        success: true,
        message: `\u4EA4\u6613\u6302\u5355\u521B\u5EFA\u6210\u529F\uFF01`,
        offer
      };
    }
    // ===== 私有辅助方法 =====
    /**
     * 计算洞府加成
     */
    calculateBlessing(location2, scale, level) {
      const locationConfig = LOCATION_BLESSING_CONFIG[location2];
      const levelConfig = CAVE_LEVEL_CONFIG[level];
      const scaleBonus = {
        "\u5C0F\u578B": 1,
        "\u4E2D\u578B": 1.3,
        "\u5927\u578B": 1.6,
        "\u6D1E\u5929": 2
      };
      return {
        cultivationBonus: Math.floor(locationConfig.cultivationBonus * levelConfig.cultivationBonus * scaleBonus[scale]),
        serendipityBonus: locationConfig.serendipityBonus || 1,
        qiBonus: locationConfig.qiBonus || 1,
        spiritStoneBonus: locationConfig.spiritStoneBonus || 1,
        combatBonus: locationConfig.combatBonus || 1,
        reputationBonus: locationConfig.reputationBonus || 1
      };
    }
    /**
     * 计算综合加成
     */
    calculateCombinedBonus(residence, locationConfig) {
      const baseBonus = residence.blessings.cultivationBonus;
      const locationBonus = locationConfig.cultivationBonus;
      return Math.floor(baseBonus * locationBonus);
    }
  };
  function createCaveDwellingService(gameState3) {
    const service = new CaveDwellingService(gameState3);
    service.init(gameState3);
    return service;
  }

  // src/domains/player/services/CaveRealmService.js
  var CAVE_TIERS = ["\u5C0F\u578B", "\u4E2D\u578B", "\u5927\u578B", "\u5DE8\u578B"];
  var CAVE_TIER_CONFIG = {
    "\u5C0F\u578B": {
      capacity: 2,
      resourceSlots: 3,
      spiritBonus: 1,
      expandCost: 500,
      createCost: 200
    },
    "\u4E2D\u578B": {
      capacity: 5,
      resourceSlots: 6,
      spiritBonus: 1.3,
      expandCost: 1500,
      createCost: 0
    },
    "\u5927\u578B": {
      capacity: 10,
      resourceSlots: 10,
      spiritBonus: 1.6,
      expandCost: 5e3,
      createCost: 0
    },
    "\u5DE8\u578B": {
      capacity: 20,
      resourceSlots: 20,
      spiritBonus: 2,
      expandCost: 2e4,
      createCost: 0
    }
  };
  var BLESSED_LAND_CONFIG = {
    1: { name: "\u798F\u5730\u521D\u6210", qiRegenBonus: 1.2, cultivationBonus: 5, expandCost: 300 },
    2: { name: "\u798F\u5730\u5C0F\u6210", qiRegenBonus: 1.5, cultivationBonus: 10, expandCost: 800 },
    3: { name: "\u798F\u5730\u5927\u6210", qiRegenBonus: 1.8, cultivationBonus: 20, expandCost: 2e3 },
    4: { name: "\u798F\u5730\u5706\u6EE1", qiRegenBonus: 2.2, cultivationBonus: 35, expandCost: 6e3 },
    5: { name: "\u6D1E\u5929\u798F\u5730", qiRegenBonus: 3, cultivationBonus: 50, expandCost: 15e3 }
  };
  var RESOURCE_TYPES = {
    "spiritStone": { name: "\u7075\u77F3", baseYield: 10, regenTime: 36e5 },
    "qiCrystal": { name: "\u7075\u6C14\u7ED3\u6676", baseYield: 5, regenTime: 72e5 },
    "essence": { name: "\u7CBE\u534E", baseYield: 2, regenTime: 108e5 },
    "mysticHerb": { name: "\u7075\u8349", baseYield: 3, regenTime: 54e5 }
  };
  var CaveRealmService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.realms = /* @__PURE__ */ new Map();
      this.blessedLands = /* @__PURE__ */ new Map();
      this.resourceTimers = /* @__PURE__ */ new Map();
      this.harvestHistory = [];
    }
    /**
     * 初始化洞天福地服务
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.caveRealm) {
        gameState3.caveRealm = {
          hasCave: false,
          cave: null,
          blessedLands: [],
          resources: [],
          totalHarvests: 0,
          spiritBalance: 0,
          lastSpiritUpdate: Date.now()
        };
      }
      if (!gameState3.caveRealm.realms) {
        gameState3.caveRealm.realms = [];
      }
      if (!gameState3.caveRealm.blessedLands) {
        gameState3.caveRealm.blessedLands = [];
      }
      if (!gameState3.caveRealm.resources) {
        gameState3.caveRealm.resources = [];
      }
      console.log("[CaveRealm] \u6D1E\u5929\u798F\u5730\u7CFB\u7EDF\u521D\u59CB\u5316\u5B8C\u6210");
      return this;
    }
    /**
     * 获取MCP工具处理器
     */
    getMCPHandlers() {
      return {
        "cave.create": (params) => this.mcpCreate(params),
        "cave.expand": (params) => this.mcpExpand(params),
        "cave.resource": (params) => this.mcpResource(params),
        "cave.blessed": (params) => this.mcpBlessed(params),
        "cave.spirit": (params) => this.mcpSpirit(params),
        "cave.harvest": (params) => this.mcpHarvest(params)
      };
    }
    /**
     * 获取所有工具定义
     */
    static get TOOLS() {
      return {
        "cave.create": {
          name: "cave.create",
          description: "\u521B\u5EFA\u6D1E\u5929 - \u5F00\u8F9F\u5C5E\u4E8E\u81EA\u5DF1\u7684\u79D8\u5883\u7A7A\u95F4",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "\u6D1E\u5929\u540D\u79F0" },
              tier: { type: "string", enum: ["\u5C0F\u578B", "\u4E2D\u578B", "\u5927\u578B", "\u5DE8\u578B"], description: "\u6D1E\u5929\u89C4\u6A21" }
            }
          }
        },
        "cave.expand": {
          name: "cave.expand",
          description: "\u6269\u5C55\u6D1E\u5929 - \u63D0\u5347\u6D1E\u5929\u7B49\u7EA7\u548C\u5BB9\u91CF",
          inputSchema: {
            type: "object",
            properties: {
              targetTier: { type: "string", enum: ["\u5C0F\u578B", "\u4E2D\u578B", "\u5927\u578B", "\u5DE8\u578B"], description: "\u76EE\u6807\u89C4\u6A21" }
            }
          }
        },
        "cave.resource": {
          name: "cave.resource",
          description: "\u6D1E\u5929\u8D44\u6E90 - \u67E5\u770B\u6D1E\u5929\u5185\u8D44\u6E90\u72B6\u6001",
          inputSchema: {
            type: "object",
            properties: {
              resourceType: { type: "string", description: "\u8D44\u6E90\u7C7B\u578B\uFF08\u53EF\u9009\uFF09" }
            }
          }
        },
        "cave.blessed": {
          name: "cave.blessed",
          description: "\u798F\u5730\u589E\u76CA - \u83B7\u53D6\u798F\u5730\u63D0\u4F9B\u7684\u52A0\u6210",
          inputSchema: {
            type: "object",
            properties: {
              blessedLandId: { type: "string", description: "\u798F\u5730ID\uFF08\u53EF\u9009\uFF09" }
            }
          }
        },
        "cave.spirit": {
          name: "cave.spirit",
          description: "\u7075\u6C14\u5145\u76C8 - \u5145\u76C8\u6D1E\u5929\u7075\u6C14",
          inputSchema: {
            type: "object",
            properties: {
              amount: { type: "number", description: "\u7075\u6C14\u6570\u91CF" }
            }
          }
        },
        "cave.harvest": {
          name: "cave.harvest",
          description: "\u6536\u83B7\u8D44\u6E90 - \u6536\u83B7\u6D1E\u5929\u5185\u5DF2\u6210\u719F\u7684\u8D44\u6E90",
          inputSchema: {
            type: "object",
            properties: {
              resourceId: { type: "string", description: "\u8D44\u6E90ID\uFF08\u53EF\u9009\uFF0C\u6536\u83B7\u5168\u90E8\uFF09" }
            }
          }
        }
      };
    }
    // ===== cave.create - 创建洞天 =====
    /**
     * MCP工具: 创建洞天
     */
    mcpCreate(params = {}) {
      const { name, tier = "\u5C0F\u578B" } = params;
      if (!CAVE_TIERS.includes(tier)) {
        return {
          success: false,
          error: "\u65E0\u6548\u7684\u6D1E\u5929\u89C4\u6A21",
          validTiers: CAVE_TIERS
        };
      }
      if (this.gameState.caveRealm.hasCave) {
        return {
          success: false,
          error: "\u5DF2\u5B58\u5728\u6D1E\u5929\uFF0C\u8BF7\u4F7F\u7528 cave.expand \u6269\u5C55"
        };
      }
      const tierConfig = CAVE_TIER_CONFIG[tier];
      const cost = tierConfig.createCost || CAVE_TIER_CONFIG["\u5C0F\u578B"].expandCost;
      const currentStones = this.gameState.spiritStones || 0;
      if (currentStones < cost) {
        return {
          success: false,
          error: "\u7075\u77F3\u4E0D\u8DB3",
          required: cost,
          available: currentStones
        };
      }
      this.gameState.spiritStones -= cost;
      const cave = {
        id: `cave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name || `${tier}\u6D1E\u5929`,
        tier,
        capacity: tierConfig.capacity,
        resourceSlots: tierConfig.resourceSlots,
        spiritBonus: tierConfig.spiritBonus,
        createdAt: Date.now(),
        lastExpandAt: Date.now(),
        resourceSlotsUsed: 0,
        totalResourcesProduced: 0
      };
      this.gameState.caveRealm.hasCave = true;
      this.gameState.caveRealm.cave = cave;
      this.gameState.caveRealm.realms.push(cave);
      this.realms.set(cave.id, cave);
      return {
        success: true,
        message: `\u6D1E\u5929\u3010${cave.name}\u3011\u521B\u5EFA\u6210\u529F\uFF01`,
        cave: {
          id: cave.id,
          name: cave.name,
          tier: cave.tier,
          capacity: cave.capacity,
          resourceSlots: cave.resourceSlots,
          cost
        },
        remainingStones: this.gameState.spiritStones
      };
    }
    // ===== cave.expand - 扩展洞天 =====
    /**
     * MCP工具: 扩展洞天
     */
    mcpExpand(params = {}) {
      const { targetTier } = params;
      if (!this.gameState.caveRealm.hasCave) {
        return {
          success: false,
          error: "\u5C1A\u672A\u521B\u5EFA\u6D1E\u5929\uFF0C\u8BF7\u5148\u4F7F\u7528 cave.create"
        };
      }
      const cave = this.gameState.caveRealm.cave;
      const currentTierIndex = CAVE_TIERS.indexOf(cave.tier);
      if (!targetTier || !CAVE_TIERS.includes(targetTier)) {
        return {
          success: false,
          error: "\u65E0\u6548\u7684\u76EE\u6807\u89C4\u6A21",
          validTiers: CAVE_TIERS
        };
      }
      const targetTierIndex = CAVE_TIERS.indexOf(targetTier);
      if (targetTierIndex <= currentTierIndex) {
        return {
          success: false,
          error: "\u76EE\u6807\u89C4\u6A21\u5FC5\u987B\u5927\u4E8E\u5F53\u524D\u89C4\u6A21",
          currentTier: cave.tier
        };
      }
      const tierConfig = CAVE_TIER_CONFIG[targetTier];
      const cost = tierConfig.expandCost;
      const currentStones = this.gameState.spiritStones || 0;
      if (currentStones < cost) {
        return {
          success: false,
          error: "\u7075\u77F3\u4E0D\u8DB3",
          required: cost,
          available: currentStones,
          shortfall: cost - currentStones
        };
      }
      this.gameState.spiritStones -= cost;
      const oldTier = cave.tier;
      cave.tier = targetTier;
      cave.capacity = tierConfig.capacity;
      cave.resourceSlots = tierConfig.resourceSlots;
      cave.spiritBonus = tierConfig.spiritBonus;
      cave.lastExpandAt = Date.now();
      return {
        success: true,
        message: `\u6D1E\u5929\u6269\u5C55\u6210\u529F\uFF01${oldTier} \u2192 ${targetTier}`,
        expand: {
          fromTier: oldTier,
          toTier: targetTier,
          newCapacity: cave.capacity,
          newResourceSlots: cave.resourceSlots,
          cost
        },
        remainingStones: this.gameState.spiritStones
      };
    }
    // ===== cave.resource - 洞天资源 =====
    /**
     * MCP工具: 洞天资源
     */
    mcpResource(params = {}) {
      const { resourceType } = params;
      if (!this.gameState.caveRealm.hasCave) {
        return {
          success: false,
          error: "\u5C1A\u672A\u521B\u5EFA\u6D1E\u5929"
        };
      }
      const cave = this.gameState.caveRealm.cave;
      const resources = this.gameState.caveRealm.resources;
      if (resourceType) {
        if (!RESOURCE_TYPES[resourceType]) {
          return {
            success: false,
            error: "\u65E0\u6548\u7684\u8D44\u6E90\u7C7B\u578B",
            validTypes: Object.keys(RESOURCE_TYPES)
          };
        }
        const filtered = resources.filter((r) => r.type === resourceType);
        return {
          success: true,
          resourceType,
          resources: filtered,
          count: filtered.length
        };
      }
      return {
        success: true,
        cave: {
          id: cave.id,
          name: cave.name,
          tier: cave.tier,
          capacity: cave.capacity,
          resourceSlots: cave.resourceSlots,
          resourceSlotsUsed: resources.length,
          resourceSlotsAvailable: cave.resourceSlots - resources.length
        },
        resources: resources.map((r) => {
          var _a;
          return {
            id: r.id,
            type: r.type,
            name: ((_a = RESOURCE_TYPES[r.type]) == null ? void 0 : _a.name) || r.type,
            amount: r.amount,
            readyAt: r.readyAt,
            isReady: Date.now() >= r.readyAt
          };
        }),
        totalResources: resources.length,
        availableTypes: Object.keys(RESOURCE_TYPES)
      };
    }
    // ===== cave.blessed - 福地增益 =====
    /**
     * MCP工具: 福地增益
     */
    mcpBlessed(params = {}) {
      const { blessedLandId } = params;
      if (!this.gameState.caveRealm.hasCave) {
        return {
          success: false,
          error: "\u5C1A\u672A\u521B\u5EFA\u6D1E\u5929"
        };
      }
      const blessedLands = this.gameState.caveRealm.blessedLands;
      if (blessedLandId) {
        const land = blessedLands.find((l) => l.id === blessedLandId);
        if (!land) {
          return {
            success: false,
            error: "\u798F\u5730\u4E0D\u5B58\u5728",
            validIds: blessedLands.map((l) => l.id)
          };
        }
        const config = BLESSED_LAND_CONFIG[land.level];
        return {
          success: true,
          blessedLand: {
            id: land.id,
            name: land.name,
            level: land.level,
            levelName: config.name,
            qiRegenBonus: land.qiRegenBonus,
            cultivationBonus: land.cultivationBonus,
            createdAt: land.createdAt
          }
        };
      }
      let totalQiRegenBonus = 1;
      let totalCultivationBonus = 0;
      for (const land of blessedLands) {
        totalQiRegenBonus *= land.qiRegenBonus;
        totalCultivationBonus += land.cultivationBonus;
      }
      return {
        success: true,
        blessedLands: blessedLands.map((land) => {
          const config = BLESSED_LAND_CONFIG[land.level];
          return {
            id: land.id,
            name: land.name,
            level: land.level,
            levelName: config.name,
            qiRegenBonus: land.qiRegenBonus,
            cultivationBonus: land.cultivationBonus
          };
        }),
        totalBlessedLands: blessedLands.length,
        totalQiRegenBonus,
        totalCultivationBonus
      };
    }
    // ===== cave.spirit - 灵气充盈 =====
    /**
     * MCP工具: 灵气充盈
     */
    mcpSpirit(params = {}) {
      const { amount = 100 } = params;
      if (!this.gameState.caveRealm.hasCave) {
        return {
          success: false,
          error: "\u5C1A\u672A\u521B\u5EFA\u6D1E\u5929"
        };
      }
      if (amount <= 0) {
        return {
          success: false,
          error: "\u7075\u6C14\u6570\u91CF\u5FC5\u987B\u5927\u4E8E0"
        };
      }
      const currentQi = this.gameState.qi || 0;
      const cave = this.gameState.caveRealm.cave;
      const bonusMultiplier = cave.spiritBonus;
      const actualAdded = Math.floor(amount * bonusMultiplier);
      this.gameState.caveRealm.spiritBalance = (this.gameState.caveRealm.spiritBalance || 0) + actualAdded;
      this.gameState.caveRealm.lastSpiritUpdate = Date.now();
      return {
        success: true,
        message: `\u7075\u6C14\u5145\u76C8\u6210\u529F\uFF01+${actualAdded}\u7075\u6C14\uFF08\u500D\u7387${bonusMultiplier}\uFF09`,
        spirit: {
          added: actualAdded,
          bonusMultiplier,
          totalBalance: this.gameState.caveRealm.spiritBalance,
          currentQi
        }
      };
    }
    // ===== cave.harvest - 收获资源 =====
    /**
     * MCP工具: 收获资源
     */
    mcpHarvest(params = {}) {
      const { resourceId } = params;
      if (!this.gameState.caveRealm.hasCave) {
        return {
          success: false,
          error: "\u5C1A\u672A\u521B\u5EFA\u6D1E\u5929"
        };
      }
      const resources = this.gameState.caveRealm.resources;
      const now = Date.now();
      let toHarvest;
      if (resourceId) {
        toHarvest = resources.find((r) => r.id === resourceId);
        if (!toHarvest) {
          return {
            success: false,
            error: "\u8D44\u6E90\u4E0D\u5B58\u5728"
          };
        }
        if (now < toHarvest.readyAt) {
          return {
            success: false,
            error: "\u8D44\u6E90\u5C1A\u672A\u6210\u719F",
            readyAt: toHarvest.readyAt,
            remainingMs: toHarvest.readyAt - now
          };
        }
        toHarvest = [toHarvest];
      } else {
        toHarvest = resources.filter((r) => now >= r.readyAt);
      }
      if (toHarvest.length === 0) {
        return {
          success: true,
          message: "\u6682\u65E0\u53EF\u6536\u83B7\u7684\u8D44\u6E90",
          harvested: [],
          totalHarvested: 0
        };
      }
      const harvested = toHarvest.map((r) => {
        const resourceConfig = RESOURCE_TYPES[r.type];
        return {
          id: r.id,
          type: r.type,
          name: (resourceConfig == null ? void 0 : resourceConfig.name) || r.type,
          amount: r.amount,
          harvestedAt: now
        };
      });
      this.gameState.caveRealm.totalHarvests += harvested.length;
      this.harvestHistory.push(...harvested);
      const harvestedIds = harvested.map((h) => h.id);
      this.gameState.caveRealm.resources = resources.filter((r) => !harvestedIds.includes(r.id));
      let totalSpiritStones = 0;
      let totalQi = 0;
      for (const h of harvested) {
        if (h.type === "spiritStone") {
          totalSpiritStones += h.amount;
        } else if (h.type === "qiCrystal") {
          totalQi += h.amount * 10;
        }
      }
      if (totalSpiritStones > 0) {
        this.gameState.spiritStones = (this.gameState.spiritStones || 0) + totalSpiritStones;
      }
      if (totalQi > 0) {
        this.gameState.qi = (this.gameState.qi || 0) + totalQi;
      }
      return {
        success: true,
        message: `\u6536\u83B7\u6210\u529F\uFF01\u83B7\u5F97${harvested.length}\u4E2A\u8D44\u6E90`,
        harvested,
        rewards: {
          spiritStones: totalSpiritStones,
          qi: totalQi
        },
        totalHarvests: this.gameState.caveRealm.totalHarvests,
        remainingResources: this.gameState.caveRealm.resources.length
      };
    }
    // ===== 私有辅助方法 =====
    /**
     * 生成资源ID
     */
    generateResourceId() {
      return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 计算资源再生时间
     */
    calculateRegenTime(resourceType, tierMultiplier = 1) {
      const config = RESOURCE_TYPES[resourceType];
      if (!config) return 0;
      return Math.floor(config.regenTime / tierMultiplier);
    }
  };
  function createCaveRealmService(gameState3) {
    return new CaveRealmService(gameState3);
  }

  // src/domains/combat/services/RealmWarfareService.js
  var REALM_WARFARE_CONFIG = {
    declareCost: 1e5,
    // 宣战消耗灵石
    preparePhaseDuration: 36e5,
    // 准备期1小时 (ms)
    warPhaseDuration: 72e5,
    // 战争进行期2小时 (ms)
    executePhaseDuration: 18e5,
    // 执行期30分钟 (ms)
    maxArmySize: 1e3,
    // 最大军队规模
    maxSoldiersPerType: 400,
    // 每种兵种最大数量
    victoryRewardMultiplier: 1.5,
    // 战胜奖励倍率
    defeatPenaltyMultiplier: 0.5,
    // 战败惩罚倍率
    allianceSupportCost: 5e4,
    // 请求联盟支援消耗
    armyTypes: ["infantry", "cavalry", "archer", "mage", "guardian"],
    // 兵种类型
    strategyTypes: ["aggressive", "defensive", "balanced", "guerrilla", "siege"],
    // 战略类型
    unitStats: {
      infantry: { attack: 10, defense: 15, speed: 5, cost: 100 },
      cavalry: { attack: 20, defense: 10, speed: 25, cost: 300 },
      archer: { attack: 15, defense: 5, speed: 10, cost: 200 },
      mage: { attack: 30, defense: 5, speed: 8, cost: 500 },
      guardian: { attack: 5, defense: 30, speed: 3, cost: 400 }
    }
  };
  var UNIT_COUNTER_TABLE = {
    infantry: { beats: "cavalry", weakTo: "archer", multiplier: 1.5 },
    cavalry: { beats: "archer", weakTo: "infantry", multiplier: 1.3 },
    archer: { beats: "mage", weakTo: "cavalry", multiplier: 1.4 },
    mage: { beats: "guardian", weakTo: "infantry", multiplier: 1.2 },
    guardian: { beats: "archer", weakTo: "mage", multiplier: 1.3 }
  };
  var WAR_STATES = {
    NONE: "none",
    PREPARING: "preparing",
    // 准备期
    EXECUTING: "executing",
    // 执行期
    ENDED: "ended"
    // 已结束
  };
  function createWarRecord(attackerId, defenderId, attackerName, defenderName) {
    return {
      uid: "war_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      attacker: {
        sectId: attackerId,
        name: attackerName,
        troops: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 },
        strategy: null,
        morale: 100,
        casualties: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 }
      },
      defender: {
        sectId: defenderId,
        name: defenderName,
        troops: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 },
        strategy: null,
        morale: 100,
        casualties: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 }
      },
      state: WAR_STATES.PREPARING,
      declareTime: Date.now(),
      prepareEndTime: Date.now() + REALM_WARFARE_CONFIG.preparePhaseDuration,
      executeStartTime: null,
      executeEndTime: null,
      winner: null,
      rewards: {
        spiritStones: 0,
        pills: 0,
        techniques: 0,
        territory: null
      },
      battleLog: []
    };
  }
  function createRealmWarfareService(gameState3) {
    return new RealmWarfareService(gameState3);
  }
  var RealmWarfareService = class {
    constructor(gameState3) {
      this.gameState = gameState3;
      this.wars = /* @__PURE__ */ new Map();
      this.playerWarId = null;
    }
    /**
     * 初始化万界战争系统
     */
    init(gameState3) {
      if (!gameState3.realmWarfare) {
        gameState3.realmWarfare = {
          wars: [],
          // 所有战争记录
          playerWarId: null,
          // 玩家当前参与的战争ID
          totalWarsDeclared: 0,
          // 总宣战次数
          totalVictories: 0,
          // 总胜利次数
          totalDefeats: 0,
          // 总失败次数
          claimedRewards: []
          // 已领取的奖励记录
        };
      }
      this.wars = gameState3.realmWarfare;
      return gameState3;
    }
    /**
     * 检查玩家是否已飞升
     */
    isPlayerAscended() {
      var _a;
      return ((_a = this.gameState.ascension) == null ? void 0 : _a.ascended) === true;
    }
    /**
     * 获取玩家当前仙界宗门
     */
    getPlayerSect() {
      var _a, _b;
      if (!this.wars.playerSectId) return null;
      return (_b = (_a = this.gameState.immortalSects) == null ? void 0 : _a.sects) == null ? void 0 : _b.find(
        (s) => s.uid === this.gameState.immortalSects.playerSectId
      );
    }
    /**
     * 获取玩家所在仙界宗门
     */
    getPlayerImmortalSect() {
      var _a;
      if (!((_a = this.gameState.immortalSects) == null ? void 0 : _a.playerSectId)) return null;
      return this.gameState.immortalSects.sects.find(
        (s) => s.uid === this.gameState.immortalSects.playerSectId
      );
    }
    /**
     * 获取玩家当前参与的战争
     */
    getPlayerWar() {
      if (!this.wars.playerWarId) return null;
      return this.wars.wars.find((w) => w.uid === this.wars.playerWarId);
    }
    /**
     * 计算军队总战力
     * @param {Object} troops - 军队编制 {infantry, cavalry, archer, mage, guardian}
     */
    calculateArmyPower(troops) {
      let totalPower = 0;
      for (const [type, count] of Object.entries(troops)) {
        const stats = REALM_WARFARE_CONFIG.unitStats[type];
        if (stats) {
          totalPower += stats.attack * count + stats.defense * count * 0.5;
        }
      }
      return Math.floor(totalPower);
    }
    /**
     * 获取战略对战斗力的影响
     * @param {string} strategy - 战略类型
     * @param {boolean} isAttacker - 是否为攻方
     */
    getStrategyBonus(strategy, isAttacker) {
      const bonuses = {
        aggressive: { attackBonus: 1.3, defenseBonus: 0.8, speedBonus: 1.2 },
        defensive: { attackBonus: 0.8, defenseBonus: 1.4, speedBonus: 0.9 },
        balanced: { attackBonus: 1, defenseBonus: 1, speedBonus: 1 },
        guerrilla: { attackBonus: 1.1, defenseBonus: 0.7, speedBonus: 1.5 },
        siege: { attackBonus: 1.5, defenseBonus: 0.6, speedBonus: 0.5 }
      };
      const bonus = bonuses[strategy] || bonuses.balanced;
      return bonus;
    }
    /**
     * 计算兵种相克效果
     * @param {string} attackerType - 攻击方兵种
     * @param {string} defenderType - 防守方兵种
     * @param {number} baseDamage - 基础伤害
     */
    calculateCounterBonus(attackerType, defenderType, baseDamage) {
      const counter = UNIT_COUNTER_TABLE[attackerType];
      if (counter && counter.beats === defenderType) {
        return baseDamage * counter.multiplier;
      }
      if (counter && counter.weakTo === defenderType) {
        return baseDamage / counter.multiplier;
      }
      return baseDamage;
    }
    // ========== MCP 工具实现 ==========
    /**
     * war.declare - 宣战
     * @param {Object} params - { targetSectId: string }
     */
    mcpWarDeclare(params = {}) {
      var _a, _b, _c, _d;
      const { targetSectId } = params;
      if (!this.isPlayerAscended()) {
        return {
          success: false,
          error: "\u5C1A\u672A\u98DE\u5347\uFF0C\u65E0\u6CD5\u53C2\u4E0E\u4E07\u754C\u6218\u4E89"
        };
      }
      const playerSect = this.getPlayerImmortalSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      if (this.wars.playerWarId) {
        const existingWar = this.getPlayerWar();
        if (existingWar && existingWar.state !== WAR_STATES.ENDED) {
          return {
            success: false,
            error: "\u4F60\u5DF2\u53C2\u4E0E\u4E00\u573A\u6218\u4E89\uFF0C\u8BF7\u7B49\u5F85\u5F53\u524D\u6218\u4E89\u7ED3\u675F"
          };
        }
      }
      if (!targetSectId) {
        return {
          success: false,
          error: "\u8BF7\u6307\u5B9A\u76EE\u6807\u5B97\u95E8ID"
        };
      }
      const targetSect = (_b = (_a = this.gameState.immortalSects) == null ? void 0 : _a.sects) == null ? void 0 : _b.find(
        (s) => s.uid === targetSectId
      );
      if (!targetSect) {
        return {
          success: false,
          error: "\u76EE\u6807\u4ED9\u754C\u5B97\u95E8\u4E0D\u5B58\u5728"
        };
      }
      if (targetSectId === playerSect.uid) {
        return {
          success: false,
          error: "\u4E0D\u80FD\u5BF9\u81EA\u5DF1\u7684\u5B97\u95E8\u5BA3\u6218"
        };
      }
      if ((_c = playerSect.enemies) == null ? void 0 : _c.includes(targetSectId)) {
        return {
          success: false,
          error: "\u8BE5\u5B97\u95E8\u5DF2\u5728\u654C\u5BF9\u540D\u5355\u4E2D\uFF0C\u8BF7\u5148\u89E3\u9664\u654C\u5BF9\u5173\u7CFB"
        };
      }
      const cost = REALM_WARFARE_CONFIG.declareCost;
      if ((this.gameState.spiritStones || 0) < cost) {
        return {
          success: false,
          error: `\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981 ${cost} \u7075\u77F3\u6765\u5BA3\u6218`
        };
      }
      const sectResources = ((_d = playerSect.resources) == null ? void 0 : _d.spiritStones) || 0;
      if (sectResources < cost * 0.5) {
        return {
          success: false,
          error: "\u5B97\u95E8\u8D44\u6E90\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u652F\u6491\u6218\u4E89"
        };
      }
      this.gameState.spiritStones -= cost;
      const war = createWarRecord(
        playerSect.uid,
        targetSectId,
        playerSect.name,
        targetSect.name
      );
      const defenderScale = targetSect.sectLevel * 0.3 + 0.5;
      war.defender.troops = {
        infantry: Math.floor(100 * defenderScale),
        cavalry: Math.floor(50 * defenderScale),
        archer: Math.floor(30 * defenderScale),
        mage: Math.floor(20 * defenderScale),
        guardian: Math.floor(25 * defenderScale)
      };
      this.wars.wars.push(war);
      this.wars.playerWarId = war.uid;
      this.wars.totalWarsDeclared++;
      if (!playerSect.enemies) playerSect.enemies = [];
      playerSect.enemies.push(targetSectId);
      if (!targetSect.enemies) targetSect.enemies = [];
      targetSect.enemies.push(playerSect.uid);
      war.battleLog.push({
        timestamp: Date.now(),
        type: "system",
        message: `${playerSect.name} \u5411 ${targetSect.name} \u5BA3\u6218\uFF01`
      });
      return {
        success: true,
        message: `\u5411\u300C${targetSect.name}\u300D\u5BA3\u6218\u6210\u529F\uFF01`,
        war: {
          uid: war.uid,
          attacker: war.attacker.name,
          defender: war.defender.name,
          state: war.state,
          prepareEndTime: war.prepareEndTime,
          costDeducted: cost
        }
      };
    }
    /**
     * war.army.recruit - 招募军队
     * @param {Object} params - { unitType: string, count: number }
     */
    mcpArmyRecruit(params = {}) {
      const { unitType, count } = params;
      const war = this.getPlayerWar();
      if (!war) {
        return {
          success: false,
          error: "\u4F60\u5F53\u524D\u6CA1\u6709\u53C2\u4E0E\u4EFB\u4F55\u6218\u4E89"
        };
      }
      if (war.state !== WAR_STATES.PREPARING) {
        return {
          success: false,
          error: `\u6218\u4E89\u5DF2\u8FDB\u5165${war.state}\u9636\u6BB5\uFF0C\u65E0\u6CD5\u62DB\u52DF\u519B\u961F`
        };
      }
      if (!REALM_WARFARE_CONFIG.armyTypes.includes(unitType)) {
        return {
          success: false,
          error: `\u65E0\u6548\u7684\u5175\u79CD\u7C7B\u578B\uFF0C\u53EF\u9009: ${REALM_WARFARE_CONFIG.armyTypes.join(", ")}`
        };
      }
      if (!count || count <= 0) {
        return {
          success: false,
          error: "\u62DB\u52DF\u6570\u91CF\u5FC5\u987B\u5927\u4E8E0"
        };
      }
      const maxPerType = REALM_WARFARE_CONFIG.maxSoldiersPerType;
      if (count > maxPerType) {
        return {
          success: false,
          error: `\u5355\u79CD\u5175\u79CD\u6700\u591A\u62DB\u52DF ${maxPerType} \u540D`
        };
      }
      const playerSect = this.getPlayerImmortalSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      const currentTotal = Object.values(war.attacker.troops).reduce((a, b) => a + b, 0);
      if (currentTotal + count > REALM_WARFARE_CONFIG.maxArmySize) {
        return {
          success: false,
          error: `\u519B\u961F\u603B\u89C4\u6A21\u4E0D\u80FD\u8D85\u8FC7 ${REALM_WARFARE_CONFIG.maxArmySize} \u4EBA\uFF0C\u5F53\u524D: ${currentTotal}`
        };
      }
      const unitStats = REALM_WARFARE_CONFIG.unitStats[unitType];
      const totalCost = unitStats.cost * count;
      if ((this.gameState.spiritStones || 0) < totalCost) {
        return {
          success: false,
          error: `\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981 ${totalCost} \u7075\u77F3\u62DB\u52DF ${count} \u540D${unitType}`
        };
      }
      this.gameState.spiritStones -= totalCost;
      war.attacker.troops[unitType] = (war.attacker.troops[unitType] || 0) + count;
      war.battleLog.push({
        timestamp: Date.now(),
        type: "recruit",
        message: `\u62DB\u52DF ${count} \u540D${unitType}\uFF0C\u6D88\u8017 ${totalCost} \u7075\u77F3`
      });
      const totalArmy = Object.values(war.attacker.troops).reduce((a, b) => a + b, 0);
      const armyPower = this.calculateArmyPower(war.attacker.troops);
      return {
        success: true,
        message: `\u6210\u529F\u62DB\u52DF ${count} \u540D${unitType}\uFF01`,
        recruitment: {
          unitType,
          count,
          cost: totalCost,
          totalTroops: war.attacker.troops
        },
        armyStatus: {
          totalSize: totalArmy,
          power: armyPower,
          troops: war.attacker.troops
        }
      };
    }
    /**
     * war.strategy.set - 设置战略
     * @param {Object} params - { strategyType: string }
     */
    mcpStrategySet(params = {}) {
      const { strategyType } = params;
      const war = this.getPlayerWar();
      if (!war) {
        return {
          success: false,
          error: "\u4F60\u5F53\u524D\u6CA1\u6709\u53C2\u4E0E\u4EFB\u4F55\u6218\u4E89"
        };
      }
      if (war.state !== WAR_STATES.PREPARING) {
        return {
          success: false,
          error: `\u6218\u4E89\u5DF2\u8FDB\u5165${war.state}\u9636\u6BB5\uFF0C\u65E0\u6CD5\u8BBE\u7F6E\u6218\u7565`
        };
      }
      if (!REALM_WARFARE_CONFIG.strategyTypes.includes(strategyType)) {
        return {
          success: false,
          error: `\u65E0\u6548\u7684\u6218\u7565\u7C7B\u578B\uFF0C\u53EF\u9009: ${REALM_WARFARE_CONFIG.strategyTypes.join(", ")}`
        };
      }
      const playerSect = this.getPlayerImmortalSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      const isAttacker = war.attacker.sectId === playerSect.uid;
      const targetSide = isAttacker ? war.attacker : war.defender;
      targetSide.strategy = strategyType;
      war.battleLog.push({
        timestamp: Date.now(),
        type: "strategy",
        message: `${targetSide.name} \u8BBE\u7F6E\u6218\u7565: ${strategyType}`
      });
      const bonus = this.getStrategyBonus(strategyType, isAttacker);
      return {
        success: true,
        message: `\u6218\u7565\u5DF2\u8BBE\u7F6E\u4E3A\u300C${strategyType}\u300D`,
        strategy: {
          type: strategyType,
          side: isAttacker ? "attacker" : "defender",
          bonuses: {
            attackBonus: bonus.attackBonus,
            defenseBonus: bonus.defenseBonus,
            speedBonus: bonus.speedBonus
          }
        }
      };
    }
    /**
     * war.execute - 执行战斗
     * @param {Object} params - { warId?: string }
     */
    mcpWarExecute(params = {}) {
      const { warId } = params;
      let war;
      if (warId) {
        war = this.wars.wars.find((w) => w.uid === warId);
      } else {
        war = this.getPlayerWar();
      }
      if (!war) {
        return {
          success: false,
          error: "\u672A\u627E\u5230\u6218\u4E89\u8BB0\u5F55"
        };
      }
      const playerSect = this.getPlayerImmortalSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      const isParticipant = war.attacker.sectId === playerSect.uid || war.defender.sectId === playerSect.uid;
      if (!isParticipant) {
        return {
          success: false,
          error: "\u4F60\u4E0D\u662F\u8FD9\u573A\u6218\u4E89\u7684\u53C2\u4E0E\u65B9"
        };
      }
      if (war.state === WAR_STATES.ENDED) {
        return {
          success: false,
          error: "\u6218\u4E89\u5DF2\u7ED3\u675F"
        };
      }
      if (war.state === WAR_STATES.EXECUTING) {
        return {
          success: false,
          error: "\u6218\u6597\u6B63\u5728\u6267\u884C\u4E2D"
        };
      }
      if (war.state === WAR_STATES.PREPARING && Date.now() < war.prepareEndTime) {
        const remaining = Math.ceil((war.prepareEndTime - Date.now()) / 6e4);
        return {
          success: false,
          error: `\u51C6\u5907\u671F\u8FD8\u672A\u7ED3\u675F\uFF0C\u8FD8\u9700 ${remaining} \u5206\u949F`
        };
      }
      war.state = WAR_STATES.EXECUTING;
      war.executeStartTime = Date.now();
      war.executeEndTime = Date.now() + REALM_WARFARE_CONFIG.executePhaseDuration;
      const attackerPower = this.calculateArmyPower(war.attacker.troops);
      const defenderPower = this.calculateArmyPower(war.defender.troops);
      let attackerBonus = 1;
      let defenderBonus = 1;
      if (war.attacker.strategy) {
        attackerBonus = this.getStrategyBonus(war.attacker.strategy, true);
      }
      if (war.defender.strategy) {
        defenderBonus = this.getStrategyBonus(war.defender.strategy, false);
      }
      const effectiveAttackerPower = Math.floor(attackerPower * attackerBonus);
      const effectiveDefenderPower = Math.floor(defenderPower * defenderBonus);
      const totalPower = effectiveAttackerPower + effectiveDefenderPower;
      const attackerRatio = effectiveAttackerPower / totalPower;
      const defenderRatio = effectiveDefenderPower / totalPower;
      const baseLossRate = 0.2;
      let attackerLosses = {};
      let defenderLosses = {};
      for (const type of REALM_WARFARE_CONFIG.armyTypes) {
        const attackerCount = war.attacker.troops[type] || 0;
        const defenderCount = war.defender.troops[type] || 0;
        attackerLosses[type] = Math.floor(attackerCount * baseLossRate * defenderRatio);
        war.attacker.casualties[type] = attackerLosses[type];
        war.attacker.troops[type] = Math.max(0, attackerCount - attackerLosses[type]);
        defenderLosses[type] = Math.floor(defenderCount * baseLossRate * attackerRatio);
        war.defender.casualties[type] = defenderLosses[type];
        war.defender.troops[type] = Math.max(0, defenderCount - defenderLosses[type]);
      }
      war.attacker.morale = Math.max(20, 100 - attackerRatio * 100);
      war.defender.morale = Math.max(20, 100 - defenderRatio * 100);
      war.battleLog.push({
        timestamp: Date.now(),
        type: "battle",
        message: `\u6218\u6597\u5F00\u59CB\uFF01\u653B\u65B9\u6218\u529B: ${effectiveAttackerPower}\uFF0C\u5B88\u65B9\u6218\u529B: ${effectiveDefenderPower}`
      });
      war.battleLog.push({
        timestamp: Date.now(),
        type: "casualties",
        message: `\u653B\u51FB\u65B9\u635F\u5931: ${Object.values(attackerLosses).reduce((a, b) => a + b, 0)} \u4EBA`
      });
      war.battleLog.push({
        timestamp: Date.now(),
        type: "casualties",
        message: `\u9632\u5B88\u65B9\u635F\u5931: ${Object.values(defenderLosses).reduce((a, b) => a + b, 0)} \u4EBA`
      });
      const isAttacker = war.attacker.sectId === playerSect.uid;
      let winner;
      let reward;
      if (effectiveAttackerPower > effectiveDefenderPower * 1.2) {
        winner = "attacker";
        war.winner = war.attacker.sectId;
        war.attacker.morale = 100;
        war.defender.morale = 30;
        reward = this.calculateRewards(war, "attacker");
        war.rewards = reward;
        if (isAttacker) {
          this.wars.totalVictories++;
        } else {
          this.wars.totalDefeats++;
        }
      } else if (effectiveDefenderPower > effectiveAttackerPower * 1.2) {
        winner = "defender";
        war.winner = war.defender.sectId;
        war.defender.morale = 100;
        war.attacker.morale = 30;
        reward = this.calculateRewards(war, "defender");
        war.rewards = reward;
        if (isAttacker) {
          this.wars.totalDefeats++;
        } else {
          this.wars.totalVictories++;
        }
      } else {
        winner = "draw";
        war.battleLog.push({
          timestamp: Date.now(),
          type: "system",
          message: "\u53CC\u65B9\u52BF\u5747\u529B\u654C\uFF0C\u6218\u6597\u9677\u5165\u50F5\u5C40\uFF01"
        });
      }
      return {
        success: true,
        message: winner === "draw" ? "\u6218\u6597\u9677\u5165\u50F5\u5C40\uFF01" : `\u6218\u6597\u7ED3\u675F\uFF0C${winner === "attacker" ? war.attacker.name : war.defender.name}\u83B7\u80DC\uFF01`,
        battleResult: {
          warId: war.uid,
          winner,
          attackerPower: effectiveAttackerPower,
          defenderPower: effectiveDefenderPower,
          attackerLosses,
          defenderLosses,
          attackerMorale: war.attacker.morale,
          defenderMorale: war.defender.morale,
          remainingTroops: {
            attacker: war.attacker.troops,
            defender: war.defender.troops
          },
          rewards: war.rewards
        }
      };
    }
    /**
     * 计算战争奖励
     * @param {Object} war - 战争记录
     * @param {string} winnerSide - 获胜方 'attacker' or 'defender'
     */
    calculateRewards(war, winnerSide) {
      const loserSide = winnerSide === "attacker" ? "defender" : "attacker";
      const loserTroops = war[loserSide].troops;
      const loserPower = this.calculateArmyPower(loserTroops);
      const baseReward = Math.floor(loserPower * 0.5);
      const multiplier = REALM_WARFARE_CONFIG.victoryRewardMultiplier;
      return {
        spiritStones: Math.floor(baseReward * multiplier * 0.6),
        pills: Math.floor(baseReward * multiplier * 0.2),
        techniques: Math.floor(baseReward * multiplier * 0.1),
        territory: null
      };
    }
    /**
     * war.result.claim - 领取战利品
     * @param {Object} params - { warId?: string }
     */
    mcpResultClaim(params = {}) {
      var _a;
      const { warId } = params;
      let war;
      if (warId) {
        war = this.wars.wars.find((w) => w.uid === warId);
      } else {
        war = this.getPlayerWar();
      }
      if (!war) {
        return {
          success: false,
          error: "\u672A\u627E\u5230\u6218\u4E89\u8BB0\u5F55"
        };
      }
      if (war.state !== WAR_STATES.ENDED) {
        return {
          success: false,
          error: "\u6218\u4E89\u5C1A\u672A\u7ED3\u675F\uFF0C\u65E0\u6CD5\u9886\u53D6\u6218\u5229\u54C1"
        };
      }
      const playerSect = this.getPlayerImmortalSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      const isParticipant = war.attacker.sectId === playerSect.uid || war.defender.sectId === playerSect.uid;
      if (!isParticipant) {
        return {
          success: false,
          error: "\u4F60\u4E0D\u662F\u8FD9\u573A\u6218\u4E89\u7684\u53C2\u4E0E\u65B9"
        };
      }
      const isWinner = war.winner === playerSect.uid;
      if (!isWinner) {
        return {
          success: false,
          error: "\u4F60\u8F93\u6389\u4E86\u8FD9\u573A\u6218\u4E89\uFF0C\u65E0\u6CD5\u9886\u53D6\u6218\u5229\u54C1"
        };
      }
      if ((_a = this.wars.claimedRewards) == null ? void 0 : _a.includes(war.uid)) {
        return {
          success: false,
          error: "\u4F60\u5DF2\u7ECF\u9886\u53D6\u8FC7\u8FD9\u573A\u6218\u4E89\u7684\u6218\u5229\u54C1"
        };
      }
      if (!war.rewards || war.rewards.spiritStones === 0 && war.rewards.pills === 0) {
        return {
          success: false,
          error: "\u8FD9\u573A\u6218\u4E89\u6CA1\u6709\u53EF\u9886\u53D6\u7684\u6218\u5229\u54C1"
        };
      }
      const claimed = {
        spiritStones: war.rewards.spiritStones || 0,
        pills: war.rewards.pills || 0,
        techniques: war.rewards.techniques || 0
      };
      playerSect.resources.spiritStones = (playerSect.resources.spiritStones || 0) + claimed.spiritStones;
      playerSect.resources.pills = (playerSect.resources.pills || 0) + claimed.pills;
      playerSect.resources.techniques = (playerSect.resources.techniques || 0) + claimed.techniques;
      this.gameState.spiritStones = (this.gameState.spiritStones || 0) + Math.floor(claimed.spiritStones * 0.3);
      if (!this.wars.claimedRewards) this.wars.claimedRewards = [];
      this.wars.claimedRewards.push(war.uid);
      war.battleLog.push({
        timestamp: Date.now(),
        type: "claim",
        message: `${playerSect.name} \u9886\u53D6\u6218\u5229\u54C1: \u7075\u77F3${claimed.spiritStones}\uFF0C\u4E39\u836F${claimed.pills}\uFF0C\u529F\u6CD5${claimed.techniques}`
      });
      return {
        success: true,
        message: "\u6210\u529F\u9886\u53D6\u6218\u5229\u54C1\uFF01",
        claimed: {
          warId: war.uid,
          spiritStones: claimed.spiritStones,
          pills: claimed.pills,
          techniques: claimed.techniques,
          personalBonus: Math.floor(claimed.spiritStones * 0.3)
        },
        sectResources: playerSect.resources
      };
    }
    /**
     * war.alliance.support - 请求联盟支援
     * @param {Object} params - { warId?: string }
     */
    mcpAllianceSupport(params = {}) {
      var _a, _b;
      const { warId } = params;
      if (!this.isPlayerAscended()) {
        return {
          success: false,
          error: "\u5C1A\u672A\u98DE\u5347\uFF0C\u65E0\u6CD5\u8BF7\u6C42\u8054\u76DF\u652F\u63F4"
        };
      }
      const playerSect = this.getPlayerImmortalSect();
      if (!playerSect) {
        return {
          success: false,
          error: "\u4F60\u672A\u52A0\u5165\u4EFB\u4F55\u4ED9\u754C\u5B97\u95E8"
        };
      }
      if (!playerSect.alliances || playerSect.alliances.length === 0) {
        return {
          success: false,
          error: "\u4F60\u7684\u5B97\u95E8\u6CA1\u6709\u7ED3\u76DF\uFF0C\u65E0\u6CD5\u8BF7\u6C42\u652F\u63F4"
        };
      }
      let war;
      if (warId) {
        war = this.wars.wars.find((w) => w.uid === warId);
      } else {
        war = this.getPlayerWar();
      }
      if (!war) {
        return {
          success: false,
          error: "\u672A\u627E\u5230\u6218\u4E89\u8BB0\u5F55"
        };
      }
      const isParticipant = war.attacker.sectId === playerSect.uid || war.defender.sectId === playerSect.uid;
      if (!isParticipant) {
        return {
          success: false,
          error: "\u4F60\u4E0D\u662F\u8FD9\u573A\u6218\u4E89\u7684\u53C2\u4E0E\u65B9"
        };
      }
      if (war.state !== WAR_STATES.PREPARING) {
        return {
          success: false,
          error: `\u6218\u4E89\u5DF2\u8FDB\u5165${war.state}\u9636\u6BB5\uFF0C\u65E0\u6CD5\u8BF7\u6C42\u652F\u63F4`
        };
      }
      const cost = REALM_WARFARE_CONFIG.allianceSupportCost;
      if ((this.gameState.spiritStones || 0) < cost) {
        return {
          success: false,
          error: `\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981 ${cost} \u7075\u77F3\u8BF7\u6C42\u8054\u76DF\u652F\u63F4`
        };
      }
      const alliedSects = [];
      for (const allianceId of playerSect.alliances) {
        const alliedSect = (_b = (_a = this.gameState.immortalSects) == null ? void 0 : _a.sects) == null ? void 0 : _b.find((s) => s.uid === allianceId);
        if (alliedSect) {
          const isInWar = war.attacker.sectId === allianceId || war.defender.sectId === allianceId;
          if (isInWar) {
            const playerSide = war.attacker.sectId === playerSect.uid ? "attacker" : "defender";
            const allySide = war.attacker.sectId === allianceId ? "attacker" : "defender";
            if (playerSide === allySide) {
              alliedSects.push({
                uid: alliedSect.uid,
                name: alliedSect.name,
                troops: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 },
                supportPower: 0
              });
            }
          }
        }
      }
      if (alliedSects.length === 0) {
        return {
          success: false,
          error: "\u6CA1\u6709\u76DF\u519B\u53C2\u4E0E\u8FD9\u573A\u6218\u4E89"
        };
      }
      this.gameState.spiritStones -= cost;
      const isAttacker = war.attacker.sectId === playerSect.uid;
      const targetSide = isAttacker ? war.attacker : war.defender;
      for (const allied of alliedSects) {
        const supportScale = 0.2;
        const baseTroops = {
          infantry: 50,
          cavalry: 30,
          archer: 20,
          mage: 10,
          guardian: 15
        };
        for (const type of REALM_WARFARE_CONFIG.armyTypes) {
          const contributed = Math.floor(baseTroops[type] * supportScale);
          allied.troops[type] = contributed;
          allied.supportPower += this.calculateArmyPower({ [type]: contributed });
          targetSide.troops[type] = (targetSide.troops[type] || 0) + contributed;
        }
      }
      war.battleLog.push({
        timestamp: Date.now(),
        type: "alliance",
        message: `${playerSect.name} \u8BF7\u6C42\u8054\u76DF\u652F\u63F4\uFF0C\u83B7\u5F97 ${alliedSects.length} \u4E2A\u76DF\u519B\u652F\u63F4`
      });
      return {
        success: true,
        message: `\u6210\u529F\u8BF7\u6C42 ${alliedSects.length} \u4E2A\u76DF\u519B\u652F\u63F4\uFF01`,
        support: {
          cost,
          alliedSects: alliedSects.map((a) => ({
            name: a.name,
            troops: a.troops,
            supportPower: a.supportPower
          })),
          totalSupportPower: alliedSects.reduce((sum, a) => sum + a.supportPower, 0)
        }
      };
    }
    /**
     * 获取战争列表
     * @param {Object} params - { state?: string, limit?: number }
     */
    mcpWarList(params = {}) {
      const { state, limit = 50 } = params;
      let wars = this.wars.wars;
      if (state) {
        wars = wars.filter((w) => w.state === state);
      }
      wars = wars.sort((a, b) => b.declareTime - a.declareTime).slice(0, limit);
      return {
        success: true,
        wars: wars.map((w) => ({
          uid: w.uid,
          attacker: w.attacker.name,
          defender: w.defender.name,
          state: w.state,
          declareTime: w.declareTime,
          winner: w.winner,
          attackerPower: this.calculateArmyPower(w.attacker.troops),
          defenderPower: this.calculateArmyPower(w.defender.troops)
        })),
        totalCount: this.wars.wars.length
      };
    }
    /**
     * 获取战争详情
     * @param {Object} params - { warId: string }
     */
    mcpWarDetail(params = {}) {
      const { warId } = params;
      const war = this.wars.wars.find((w) => w.uid === warId);
      if (!war) {
        return {
          success: false,
          error: "\u672A\u627E\u5230\u6218\u4E89\u8BB0\u5F55"
        };
      }
      return {
        success: true,
        war: {
          uid: war.uid,
          attacker: {
            sectId: war.attacker.sectId,
            name: war.attacker.name,
            troops: war.attacker.troops,
            strategy: war.attacker.strategy,
            morale: war.attacker.morale,
            casualties: war.attacker.casualties,
            power: this.calculateArmyPower(war.attacker.troops)
          },
          defender: {
            sectId: war.defender.sectId,
            name: war.defender.name,
            troops: war.defender.troops,
            strategy: war.defender.strategy,
            morale: war.defender.morale,
            casualties: war.defender.casualties,
            power: this.calculateArmyPower(war.defender.troops)
          },
          state: war.state,
          declareTime: war.declareTime,
          prepareEndTime: war.prepareEndTime,
          executeStartTime: war.executeStartTime,
          executeEndTime: war.executeEndTime,
          winner: war.winner,
          rewards: war.rewards,
          battleLog: war.battleLog
        }
      };
    }
  };

  // src/domains/inventory/services/ChaosTreasureService.js
  var ChaosTreasureService = class {
    constructor() {
      this.gameState = null;
      this.treasures = [];
      this.equippedTreasures = {};
      this.resonancePairs = [];
      this.maxTreasures = 50;
    }
    /**
     * 初始化灵宝系统
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.chaosTreasure) {
        gameState3.chaosTreasure = {
          treasures: [],
          equippedTreasures: {},
          resonancePairs: [],
          totalRefined: 0,
          totalAwakened: 0,
          totalResonated: 0,
          totalStrengthened: 0
        };
      }
      this.treasures = gameState3.chaosTreasure.treasures;
      this.equippedTreasures = gameState3.chaosTreasure.equippedTreasures;
      this.resonancePairs = gameState3.chaosTreasure.resonancePairs;
      return gameState3;
    }
    /**
     * 生成唯一ID
     */
    generateId() {
      return `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 获取灵宝类型枚举
     */
    getTreasureTypes() {
      return { ...TREASURE_TYPES };
    }
    /**
     * 获取灵宝等级枚举
     */
    getTreasureLevels() {
      return { ...TREASURE_LEVELS };
    }
    /**
     * 获取灵宝属性枚举
     */
    getTreasureAttributes() {
      return { ...TREASURE_ATTRIBUTES };
    }
    /**
     * 获取灵宝类型定义
     */
    getTreasureDefinition(type) {
      return TREASURE_DEFINITIONS[type];
    }
    /**
     * 获取灵宝等级定义
     */
    getLevelDefinition(level) {
      return LEVEL_DEFINITIONS[level];
    }
    /**
     * 计算灵宝基础属性
     */
    calculateBaseAttributes(treasure) {
      const def = TREASURE_DEFINITIONS[treasure.type];
      const levelIdx = this.getLevelIndex(treasure.level);
      const levelDef = LEVEL_DEFINITIONS[treasure.level];
      const baseMultiplier = (levelDef == null ? void 0 : levelDef.multiplier) || 1;
      const attrs = {};
      for (const attr of Object.keys(def.baseAttributes)) {
        attrs[attr] = Math.floor(def.baseAttributes[attr] * baseMultiplier * (1 + treasure.enhanceLevel * 0.1));
      }
      return attrs;
    }
    /**
     * 获取等级索引
     */
    getLevelIndex(level) {
      const levelMap = { "\u51E1": 0, "\u7075": 1, "\u4ED9": 2, "\u795E": 3, "\u9053": 4 };
      return levelMap[level] ?? 0;
    }
    /**
     * 获取共鸣效果
     */
    getResonanceEffect(pair) {
      const def1 = TREASURE_DEFINITIONS[pair[0].type];
      const def2 = TREASURE_DEFINITIONS[pair[1].type];
      return RESONANCE_EFFECTS[`${def1.resonanceTag}+${def2.resonanceTag}`] || RESONANCE_EFFECTS[`${def2.resonanceTag}+${def1.resonanceTag}`] || { bonusAttribute: "attack", bonusPercent: 0.05 };
    }
    /**
     * 计算总共鸣加成
     */
    calculateResonanceBonus() {
      let bonus = {
        attack: 0,
        defense: 0,
        life: 0,
        speed: 0
      };
      for (const pair of this.resonancePairs) {
        const effect = this.getResonanceEffect(pair);
        bonus[effect.bonusAttribute] += effect.bonusPercent;
      }
      return bonus;
    }
    /**
     * 炼制灵宝 (treasure.refine)
     */
    mcpRefine(params) {
      const { type, level = "\u51E1", useStones = true } = params;
      if (!TREASURE_DEFINITIONS[type]) {
        return { success: false, error: `\u65E0\u6548\u7684\u7075\u5B9D\u7C7B\u578B: ${type}` };
      }
      if (!LEVEL_DEFINITIONS[level]) {
        return { success: false, error: `\u65E0\u6548\u7684\u7075\u5B9D\u7B49\u7EA7: ${level}` };
      }
      const cost = this.getRefineCost(level);
      if (useStones) {
        if (this.gameState.player.spiritStones < cost) {
          return { success: false, error: `\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981${cost}\u7075\u77F3` };
        }
        this.gameState.player.spiritStones -= cost;
      }
      const successRate = this.getRefineSuccessRate(level);
      const success = Math.random() < successRate;
      if (!success) {
        this.gameState.chaosTreasure.totalRefined++;
        return {
          success: false,
          error: "\u70BC\u5236\u5931\u8D25\uFF0C\u7075\u5B9D\u7834\u788E",
          materialsConsumed: true
        };
      }
      const treasure = {
        id: this.generateId(),
        type,
        level,
        name: TREASURE_DEFINITIONS[type].name,
        description: TREASURE_DEFINITIONS[type].description,
        baseAttributes: TREASURE_DEFINITIONS[type].baseAttributes,
        enhanceLevel: 0,
        awakenLevel: 0,
        skills: [],
        resonanceSlots: TREASURE_DEFINITIONS[type].resonanceSlots,
        refineAt: Date.now()
      };
      this.treasures.push(treasure);
      this.gameState.chaosTreasure.totalRefined++;
      return {
        success: true,
        message: `\u70BC\u5236\u6210\u529F\uFF01\u83B7\u5F97${TREASURE_DEFINITIONS[type].name}`,
        treasure: this.formatTreasure(treasure),
        remainingTreasures: this.treasures.length
      };
    }
    /**
     * 灵宝觉醒 (treasure.awaken)
     */
    mcpAwaken(params) {
      const { treasureId } = params;
      const treasure = this.treasures.find((t) => t.id === treasureId);
      if (!treasure) {
        return { success: false, error: `\u672A\u627E\u5230ID\u4E3A${treasureId}\u7684\u7075\u5B9D` };
      }
      if (treasure.awakenLevel >= 3) {
        return { success: false, error: "\u7075\u5B9D\u5DF2\u8FBE\u6700\u5927\u89C9\u9192\u7B49\u7EA7" };
      }
      const cost = this.getAwakenCost(treasure.level, treasure.awakenLevel);
      if (this.gameState.player.spiritStones < cost) {
        return { success: false, error: `\u89C9\u9192\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981${cost}\u7075\u77F3` };
      }
      const karmaCost = this.getAwakenKarmaCost(treasure.awakenLevel);
      if (this.gameState.player.karmaPoints < karmaCost) {
        return { success: false, error: `\u4E1A\u529B\u4E0D\u8DB3\uFF0C\u9700\u8981${karmaCost}\u4E1A\u529B` };
      }
      this.gameState.player.spiritStones -= cost;
      this.gameState.player.karmaPoints -= karmaCost;
      treasure.awakenLevel++;
      const skill = this.awakenSkill(treasure);
      if (skill) {
        treasure.skills.push(skill);
      }
      this.gameState.chaosTreasure.totalAwakened++;
      return {
        success: true,
        message: `\u89C9\u9192\u6210\u529F\uFF01\u7075\u5B9D\u89E3\u9501\u65B0\u6280\u80FD`,
        treasure: this.formatTreasure(treasure),
        newSkill: skill,
        awakenLevel: treasure.awakenLevel
      };
    }
    /**
     * 查询灵宝 (treasure.query)
     */
    mcpQuery(params) {
      const { treasureId, listAll = false, filterType, filterLevel } = params;
      if (listAll) {
        let filtered = [...this.treasures];
        if (filterType) {
          filtered = filtered.filter((t) => t.type === filterType);
        }
        if (filterLevel) {
          filtered = filtered.filter((t) => t.level === filterLevel);
        }
        return {
          treasures: filtered.map((t) => this.formatTreasure(t)),
          total: filtered.length,
          equipped: this.getEquippedList()
        };
      }
      if (treasureId) {
        const treasure = this.treasures.find((t) => t.id === treasureId);
        if (!treasure) {
          return { success: false, error: `\u672A\u627E\u5230ID\u4E3A${treasureId}\u7684\u7075\u5B9D` };
        }
        const attributes = this.calculateTreasureAttributes(treasure);
        const resonanceBonus = this.calculateResonanceBonus();
        return {
          treasure: this.formatTreasure(treasure),
          calculatedAttributes: attributes,
          resonanceBonus,
          isEquipped: this.isEquipped(treasureId)
        };
      }
      return {
        treasures: this.treasures.map((t) => this.formatTreasure(t)),
        total: this.treasures.length,
        stats: this.getStats()
      };
    }
    /**
     * 装备灵宝 (treasure.equip)
     */
    mcpEquip(params) {
      const { treasureId, slot, unequip = false } = params;
      if (unequip) {
        return this.unequipTreasure(treasureId);
      }
      const treasure = this.treasures.find((t) => t.id === treasureId);
      if (!treasure) {
        return { success: false, error: `\u672A\u627E\u5230ID\u4E3A${treasureId}\u7684\u7075\u5B9D` };
      }
      const validSlots = TREASURE_DEFINITIONS[treasure.type].slots;
      if (slot && !validSlots.includes(slot)) {
        return { success: false, error: `\u8BE5\u7075\u5B9D\u65E0\u6CD5\u88C5\u5907\u5230${slot}\u69FD\u4F4D` };
      }
      const targetSlot = slot || validSlots[0];
      if (this.equippedTreasures[targetSlot]) {
        const oldTreasure = this.equippedTreasures[targetSlot];
        oldTreasure.equipped = false;
      }
      this.equippedTreasures[targetSlot] = treasure;
      treasure.equippedSlot = targetSlot;
      return {
        success: true,
        message: `\u7075\u5B9D\u5DF2\u88C5\u5907\u5230${targetSlot}`,
        treasure: this.formatTreasure(treasure),
        slot: targetSlot
      };
    }
    /**
     * 灵宝共鸣 (treasure.resonance)
     */
    mcpResonance(params) {
      const { treasureId1, treasureId2, removeResonance = false } = params;
      if (removeResonance) {
        return this.removeResonance(treasureId1, treasureId2);
      }
      const treasure1 = this.treasures.find((t) => t.id === treasureId1);
      const treasure2 = this.treasures.find((t) => t.id === treasureId2);
      if (!treasure1) {
        return { success: false, error: `\u672A\u627E\u5230ID\u4E3A${treasureId1}\u7684\u7075\u5B9D` };
      }
      if (!treasure2) {
        return { success: false, error: `\u672A\u627E\u5230ID\u4E3A${treasureId2}\u7684\u7075\u5B9D` };
      }
      if (treasureId1 === treasureId2) {
        return { success: false, error: "\u65E0\u6CD5\u4E0E\u81EA\u5DF1\u5171\u9E23" };
      }
      const existing = this.resonancePairs.find(
        (p) => p[0].id === treasureId1 && p[1].id === treasureId2 || p[0].id === treasureId2 && p[1].id === treasureId1
      );
      if (existing) {
        return { success: false, error: "\u8FD9\u4E24\u4EF6\u7075\u5B9D\u5DF2\u5728\u5171\u9E23\u72B6\u6001" };
      }
      const cost = this.getResonanceCost();
      if (this.gameState.player.spiritStones < cost) {
        return { success: false, error: `\u5171\u9E23\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981${cost}\u7075\u77F3` };
      }
      this.gameState.player.spiritStones -= cost;
      this.resonancePairs.push([treasure1, treasure2]);
      treasure1.inResonance = true;
      treasure2.inResonance = true;
      const effect = this.getResonanceEffect([treasure1, treasure2]);
      this.gameState.chaosTreasure.totalResonated++;
      return {
        success: true,
        message: `\u5171\u9E23\u5EFA\u7ACB\u6210\u529F\uFF01${effect.bonusAttribute}\u5C5E\u6027+${(effect.bonusPercent * 100).toFixed(0)}%`,
        pair: [
          this.formatTreasure(treasure1),
          this.formatTreasure(treasure2)
        ],
        effect,
        resonancePairs: this.resonancePairs.length
      };
    }
    /**
     * 灵宝强化 (treasure.strengthen)
     */
    mcpStrengthen(params) {
      const { treasureId, autoIncrement = false } = params;
      const treasure = this.treasures.find((t) => t.id === treasureId);
      if (!treasure) {
        return { success: false, error: `\u672A\u627E\u5230ID\u4E3A${treasureId}\u7684\u7075\u5B9D` };
      }
      const maxLevel = 20;
      if (treasure.enhanceLevel >= maxLevel) {
        return { success: false, error: "\u7075\u5B9D\u5DF2\u8FBE\u6700\u5927\u5F3A\u5316\u7B49\u7EA7" };
      }
      const successRate = this.getStrengthenSuccessRate(treasure.enhanceLevel);
      const cost = this.getStrengthenCost(treasure.level, treasure.enhanceLevel);
      if (this.gameState.player.spiritStones < cost) {
        return { success: false, error: `\u5F3A\u5316\u7075\u77F3\u4E0D\u8DB3\uFF0C\u9700\u8981${cost}\u7075\u77F3` };
      }
      this.gameState.player.spiritStones -= cost;
      this.gameState.chaosTreasure.totalStrengthened++;
      const success = Math.random() < successRate;
      if (!success) {
        return {
          success: false,
          error: "\u5F3A\u5316\u5931\u8D25\uFF0C\u7075\u5B9D\u6CA1\u6709\u53D8\u5316",
          enhanceLevel: treasure.enhanceLevel,
          costConsumed: cost
        };
      }
      if (autoIncrement) {
        treasure.enhanceLevel++;
      }
      const newAttributes = this.calculateTreasureAttributes(treasure);
      return {
        success: true,
        message: autoIncrement ? `\u5F3A\u5316\u6210\u529F\uFF01\u7075\u5B9D\u5F3A\u5316\u7B49\u7EA7\u63D0\u5347\u81F3${treasure.enhanceLevel}` : "\u5F3A\u5316\u6210\u529F\uFF01",
        treasure: this.formatTreasure(treasure),
        newAttributes,
        enhanceLevel: treasure.enhanceLevel
      };
    }
    // ==================== 内部方法 ====================
    /**
     * 获取炼制消耗
     */
    getRefineCost(level) {
      const costs = { "\u51E1": 50, "\u7075": 200, "\u4ED9": 1e3, "\u795E": 5e3, "\u9053": 25e3 };
      return costs[level] || 50;
    }
    /**
     * 获取炼制成功率
     */
    getRefineSuccessRate(level) {
      const rates = { "\u51E1": 0.9, "\u7075": 0.7, "\u4ED9": 0.5, "\u795E": 0.3, "\u9053": 0.15 };
      return rates[level] || 0.9;
    }
    /**
     * 获取觉醒消耗
     */
    getAwakenCost(level, awakenLevel) {
      const baseCosts = { "\u51E1": 100, "\u7075": 500, "\u4ED9": 2500, "\u795E": 12500, "\u9053": 62500 };
      return (baseCosts[level] || 100) * (awakenLevel + 1);
    }
    /**
     * 获取觉醒业力消耗
     */
    getAwakenKarmaCost(awakenLevel) {
      return (awakenLevel + 1) * 10;
    }
    /**
     * 获取共鸣消耗
     */
    getResonanceCost() {
      return 500;
    }
    /**
     * 获取强化消耗
     */
    getStrengthenCost(level, enhanceLevel) {
      const baseCosts = { "\u51E1": 30, "\u7075": 150, "\u4ED9": 750, "\u795E": 3750, "\u9053": 18750 };
      return (baseCosts[level] || 30) * (enhanceLevel + 1);
    }
    /**
     * 获取强化成功率
     */
    getStrengthenSuccessRate(enhanceLevel) {
      if (enhanceLevel < 5) return 0.8;
      if (enhanceLevel < 10) return 0.6;
      if (enhanceLevel < 15) return 0.4;
      return 0.2;
    }
    /**
     * 觉醒技能
     */
    awakenSkill(treasure) {
      var _a;
      const skillTree = (_a = TREASURE_DEFINITIONS[treasure.type]) == null ? void 0 : _a.skillTree;
      if (!skillTree || !skillTree[treasure.awakenLevel]) {
        return null;
      }
      return {
        id: this.generateId(),
        name: skillTree[treasure.awakenLevel].name,
        description: skillTree[treasure.awakenLevel].description,
        awakenLevel: treasure.awakenLevel,
        acquiredAt: Date.now()
      };
    }
    /**
     * 计算灵宝总属性
     */
    calculateTreasureAttributes(treasure) {
      const base = this.calculateBaseAttributes(treasure);
      const resonanceBonus = this.calculateResonanceBonus();
      const awakenBonus = treasure.awakenLevel * 0.15;
      const result = {};
      for (const attr of Object.keys(base)) {
        const bonus = resonanceBonus[attr] || 0;
        result[attr] = Math.floor(base[attr] * (1 + bonus + awakenBonus));
      }
      return result;
    }
    /**
     * 格式化灵宝输出
     */
    formatTreasure(treasure) {
      return {
        id: treasure.id,
        type: treasure.type,
        level: treasure.level,
        name: treasure.name,
        description: treasure.description,
        enhanceLevel: treasure.enhanceLevel,
        awakenLevel: treasure.awakenLevel,
        skills: treasure.skills || [],
        resonanceSlots: treasure.resonanceSlots,
        baseAttributes: treasure.baseAttributes,
        equippedSlot: treasure.equippedSlot || null,
        inResonance: treasure.inResonance || false,
        refineAt: treasure.refineAt
      };
    }
    /**
     * 获取已装备列表
     */
    getEquippedList() {
      return Object.entries(this.equippedTreasures).map(([slot, treasure]) => ({
        slot,
        treasure: this.formatTreasure(treasure)
      }));
    }
    /**
     * 检查灵宝是否已装备
     */
    isEquipped(treasureId) {
      return Object.values(this.equippedTreasures).some((t) => t.id === treasureId);
    }
    /**
     * 卸下灵宝
     */
    unequipTreasure(treasureId) {
      for (const [slot, treasure] of Object.entries(this.equippedTreasures)) {
        if (treasure.id === treasureId) {
          delete this.equippedTreasures[slot];
          treasure.equippedSlot = null;
          return {
            success: true,
            message: `\u7075\u5B9D\u5DF2\u4ECE${slot}\u69FD\u4F4D\u5378\u4E0B`,
            treasure: this.formatTreasure(treasure)
          };
        }
      }
      return { success: false, error: "\u8BE5\u7075\u5B9D\u672A\u88C5\u5907" };
    }
    /**
     * 移除共鸣
     */
    removeResonance(treasureId1, treasureId2) {
      const idx = this.resonancePairs.findIndex(
        (p) => p[0].id === treasureId1 && p[1].id === treasureId2 || p[0].id === treasureId2 && p[1].id === treasureId1
      );
      if (idx === -1) {
        return { success: false, error: "\u672A\u627E\u5230\u5171\u9E23\u5173\u7CFB" };
      }
      const pair = this.resonancePairs.splice(idx, 1)[0];
      pair[0].inResonance = false;
      pair[1].inResonance = false;
      return {
        success: true,
        message: "\u5171\u9E23\u5DF2\u89E3\u9664",
        remainingPairs: this.resonancePairs.length
      };
    }
    /**
     * 获取统计数据
     */
    getStats() {
      var _a, _b, _c, _d;
      return {
        totalTreasures: this.treasures.length,
        maxTreasures: this.maxTreasures,
        totalRefined: ((_a = this.gameState.chaosTreasure) == null ? void 0 : _a.totalRefined) || 0,
        totalAwakened: ((_b = this.gameState.chaosTreasure) == null ? void 0 : _b.totalAwakened) || 0,
        totalResonated: ((_c = this.gameState.chaosTreasure) == null ? void 0 : _c.totalResonated) || 0,
        totalStrengthened: ((_d = this.gameState.chaosTreasure) == null ? void 0 : _d.totalStrengthened) || 0,
        resonancePairs: this.resonancePairs.length,
        equippedCount: Object.keys(this.equippedTreasures).length,
        treasuresByLevel: this.treasures.reduce((acc, t) => {
          acc[t.level] = (acc[t.level] || 0) + 1;
          return acc;
        }, {}),
        treasuresByType: this.treasures.reduce((acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + 1;
          return acc;
        }, {})
      };
    }
  };
  var TREASURE_TYPES = {
    \u6B66\u5668: "\u6B66\u5668",
    \u9632\u5177: "\u9632\u5177",
    \u9970\u54C1: "\u9970\u54C1",
    \u79D8\u5B9D: "\u79D8\u5B9D"
  };
  var TREASURE_LEVELS = {
    \u51E1: "\u51E1",
    \u7075: "\u7075",
    \u4ED9: "\u4ED9",
    \u795E: "\u795E",
    \u9053: "\u9053"
  };
  var TREASURE_ATTRIBUTES = {
    \u653B\u51FB: "attack",
    \u9632\u5FA1: "defense",
    \u751F\u547D: "life",
    \u901F\u5EA6: "speed"
  };
  var TREASURE_DEFINITIONS = {
    \u6B66\u5668: {
      name: "\u6DF7\u6C8C\u795E\u5175",
      description: "\u8574\u542B\u6DF7\u6C8C\u4E4B\u529B\u7684\u795E\u5175\u5229\u5668",
      slots: ["\u4E3B\u624B", "\u526F\u624B"],
      resonanceTag: "attack",
      baseAttributes: { attack: 100, speed: 20 },
      resonanceSlots: 2,
      skillTree: {
        1: { name: "\u6DF7\u6C8C\u65A9", description: "\u653B\u51FB\u65F6\u6709\u51E0\u7387\u89E6\u53D1\u6DF7\u6C8C\u65A9\u51FB" },
        2: { name: "\u66B4\u6012\u4E4B\u950B", description: "\u653B\u51FB\u4F24\u5BB3\u63D0\u534715%" },
        3: { name: "\u7EC8\u6781\u6DF7\u6C8C", description: "\u91CA\u653E\u7EC8\u6781\u6DF7\u6C8C\u65A9" }
      }
    },
    \u9632\u5177: {
      name: "\u6DF7\u6C8C\u62A4\u7532",
      description: "\u8574\u542B\u6DF7\u6C8C\u4E4B\u529B\u7684\u9632\u5FA1\u94E0\u7532",
      slots: ["\u62A4\u7532", "\u62A4\u80A9"],
      resonanceTag: "defense",
      baseAttributes: { defense: 100, life: 200 },
      resonanceSlots: 2,
      skillTree: {
        1: { name: "\u6DF7\u6C8C\u62A4\u76FE", description: "\u53D7\u5230\u4F24\u5BB3\u65F6\u6709\u51E0\u7387\u751F\u6210\u62A4\u76FE" },
        2: { name: "\u53CD\u5C04\u4E4B\u58C1", description: "\u5C0610%\u4F24\u5BB3\u53CD\u5C04\u7ED9\u653B\u51FB\u8005" },
        3: { name: "\u7EC8\u6781\u4E0D\u706D", description: "\u53D7\u5230\u81F4\u547D\u4F24\u5BB3\u65F6\u514D\u75AB\u4E00\u6B21" }
      }
    },
    \u9970\u54C1: {
      name: "\u6DF7\u6C8C\u7075\u9970",
      description: "\u8574\u542B\u6DF7\u6C8C\u4E4B\u529B\u7684\u7075\u6027\u9970\u54C1",
      slots: ["\u9879\u94FE", "\u6212\u6307", "\u624B\u956F"],
      resonanceTag: "life",
      baseAttributes: { life: 300, defense: 30 },
      resonanceSlots: 2,
      skillTree: {
        1: { name: "\u751F\u547D\u6C72\u53D6", description: "\u653B\u51FB\u65F6\u5438\u53D6\u751F\u547D" },
        2: { name: "\u7075\u529B\u6D8C\u52A8", description: "\u751F\u547D\u4E0A\u9650\u63D0\u534720%" },
        3: { name: "\u7EC8\u6781\u5171\u751F", description: "\u751F\u547D\u4E0E\u7075\u529B\u4E92\u76F8\u8F6C\u5316" }
      }
    },
    \u79D8\u5B9D: {
      name: "\u6DF7\u6C8C\u79D8\u5B9D",
      description: "\u8574\u542B\u6DF7\u6C8C\u4E4B\u529B\u7684\u795E\u79D8\u5B9D\u7269",
      slots: ["\u79D8\u5B9D"],
      resonanceTag: "speed",
      baseAttributes: { speed: 50, attack: 30 },
      resonanceSlots: 2,
      skillTree: {
        1: { name: "\u77AC\u79FB", description: "\u901F\u5EA6\u4E34\u65F6\u63D0\u5347" },
        2: { name: "\u65F6\u95F4\u626D\u66F2", description: "\u884C\u52A8\u987A\u5E8F\u63D0\u524D" },
        3: { name: "\u7EC8\u6781\u65F6\u505C", description: "\u4F7F\u76EE\u6807\u884C\u52A8\u8FDF\u7F13" }
      }
    }
  };
  var LEVEL_DEFINITIONS = {
    \u51E1: { name: "\u51E1\u54C1", multiplier: 1 },
    \u7075: { name: "\u7075\u54C1", multiplier: 1.5 },
    \u4ED9: { name: "\u4ED9\u54C1", multiplier: 2.5 },
    \u795E: { name: "\u795E\u54C1", multiplier: 4 },
    \u9053: { name: "\u9053\u54C1", multiplier: 7 }
  };
  var RESONANCE_EFFECTS = {
    "attack+defense": { bonusAttribute: "defense", bonusPercent: 0.1 },
    "attack+life": { bonusAttribute: "attack", bonusPercent: 0.08 },
    "attack+speed": { bonusAttribute: "attack", bonusPercent: 0.12 },
    "defense+life": { bonusAttribute: "defense", bonusPercent: 0.1 },
    "defense+speed": { bonusAttribute: "defense", bonusPercent: 0.08 },
    "life+speed": { bonusAttribute: "life", bonusPercent: 0.1 },
    "attack+attack": { bonusAttribute: "attack", bonusPercent: 0.15 },
    "defense+defense": { bonusAttribute: "defense", bonusPercent: 0.15 },
    "life+life": { bonusAttribute: "life", bonusPercent: 0.15 },
    "speed+speed": { bonusAttribute: "speed", bonusPercent: 0.15 }
  };
  var chaosTreasureService = new ChaosTreasureService();
  function createChaosTreasureMCPHandlers(gameState3) {
    const service = new ChaosTreasureService();
    service.init(gameState3);
    return {
      "treasure.refine": (params) => service.mcpRefine(params),
      "treasure.awaken": (params) => service.mcpAwaken(params),
      "treasure.query": (params) => service.mcpQuery(params),
      "treasure.equip": (params) => service.mcpEquip(params),
      "treasure.resonance": (params) => service.mcpResonance(params),
      "treasure.strengthen": (params) => service.mcpStrengthen(params)
    };
  }
  var CHAOS_TREASURE_TOOLS = {
    "treasure.refine": {
      name: "treasure.refine",
      description: "\u70BC\u5236\u6DF7\u6C8C\u7075\u5B9D",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["\u6B66\u5668", "\u9632\u5177", "\u9970\u54C1", "\u79D8\u5B9D"],
            description: "\u7075\u5B9D\u7C7B\u578B"
          },
          level: {
            type: "string",
            enum: ["\u51E1", "\u7075", "\u4ED9", "\u795E", "\u9053"],
            description: "\u7075\u5B9D\u7B49\u7EA7",
            default: "\u51E1"
          },
          useStones: { type: "boolean", description: "\u662F\u5426\u6D88\u8017\u7075\u77F3", default: true }
        },
        required: ["type"]
      }
    },
    "treasure.awaken": {
      name: "treasure.awaken",
      description: "\u7075\u5B9D\u89C9\u9192\uFF0C\u63D0\u5347\u7075\u5B9D\u80FD\u529B",
      inputSchema: {
        type: "object",
        properties: {
          treasureId: { type: "string", description: "\u7075\u5B9DID" }
        },
        required: ["treasureId"]
      }
    },
    "treasure.query": {
      name: "treasure.query",
      description: "\u67E5\u8BE2\u7075\u5B9D\u4FE1\u606F",
      inputSchema: {
        type: "object",
        properties: {
          treasureId: { type: "string", description: "\u7075\u5B9DID" },
          listAll: { type: "boolean", description: "\u5217\u51FA\u6240\u6709\u7075\u5B9D" },
          filterType: { type: "string", enum: ["\u6B66\u5668", "\u9632\u5177", "\u9970\u54C1", "\u79D8\u5B9D"], description: "\u6309\u7C7B\u578B\u7B5B\u9009" },
          filterLevel: { type: "string", enum: ["\u51E1", "\u7075", "\u4ED9", "\u795E", "\u9053"], description: "\u6309\u7B49\u7EA7\u7B5B\u9009" }
        }
      }
    },
    "treasure.equip": {
      name: "treasure.equip",
      description: "\u88C5\u5907\u7075\u5B9D\u5230\u89D2\u8272",
      inputSchema: {
        type: "object",
        properties: {
          treasureId: { type: "string", description: "\u7075\u5B9DID" },
          slot: { type: "string", description: "\u88C5\u5907\u69FD\u4F4D" },
          unequip: { type: "boolean", description: "\u662F\u5426\u5378\u4E0B", default: false }
        },
        required: ["treasureId"]
      }
    },
    "treasure.resonance": {
      name: "treasure.resonance",
      description: "\u7075\u5B9D\u5171\u9E23\uFF0C\u4E24\u4EF6\u7075\u5B9D\u4EA7\u751F\u5171\u9E23\u6548\u679C",
      inputSchema: {
        type: "object",
        properties: {
          treasureId1: { type: "string", description: "\u7B2C\u4E00\u4EF6\u7075\u5B9DID" },
          treasureId2: { type: "string", description: "\u7B2C\u4E8C\u4EF6\u7075\u5B9DID" },
          removeResonance: { type: "boolean", description: "\u662F\u5426\u89E3\u9664\u5171\u9E23", default: false }
        }
      }
    },
    "treasure.strengthen": {
      name: "treasure.strengthen",
      description: "\u5F3A\u5316\u7075\u5B9D\uFF0C\u63D0\u5347\u57FA\u7840\u5C5E\u6027",
      inputSchema: {
        type: "object",
        properties: {
          treasureId: { type: "string", description: "\u7075\u5B9DID" },
          autoIncrement: { type: "boolean", description: "\u662F\u5426\u81EA\u52A8\u63D0\u5347\u5F3A\u5316\u7B49\u7EA7", default: false }
        },
        required: ["treasureId"]
      }
    }
  };

  // src/systems/cosmic/CosmicCycleService.js
  var COSMIC_CONFIG = {
    // 轮回周期 (ms) - 一个宇宙轮回
    CYCLE_DURATION: 1e3 * 60 * 60 * 24 * 365,
    // 1年虚拟时间
    // 世界等级范围
    WORLD_LEVEL_RANGE: { min: 1, max: 100 },
    // 裁决阈值
    JUDGMENT_THRESHOLD: {
      BLESSED: 1e4,
      // 大善人
      RIGHTEOUS: 5e3,
      // 正道
      NEUTRAL: 0,
      // 中立
      EVIL: -5e3,
      // 邪道
      DAMNED: -1e4
      // 大恶人
    },
    // 传承保留比例
    LEGACY_RETENTION_RATIO: 0.5,
    // 最大遗产数量
    MAX_LEGACY_ITEMS: 10,
    // 赐福最大数量
    MAX_COSMIC_BLESSINGS: 5,
    // 重置冷却 (ms)
    RESET_COOLDOWN: 1e3 * 60 * 60 * 24 * 30
    // 30天
  };
  var CYCLE_PHASES = {
    CREATION: "creation",
    // 创世期
    EVOLUTION: "evolution",
    // 演化期
    FLORAGE: "florage",
    // 繁荣期
    DECAY: "decay",
    // 衰败期
    RENEWAL: "renewal"
    // 新生期
  };
  var WORLD_EVOLUTION_STAGES = {
    PRIMORDIAL: "primordial",
    // 混沌
    FORMING: "forming",
    // 成形
    STABLE: "stable",
    // 稳定
    FLOURISHING: "flourishing",
    // 繁荣
    TRANSENDING: "transending",
    // 飞升
    CELESTIAL: "celestial"
    // 天界
  };
  var JUDGMENT_TYPES = {
    BLESSING: "blessing",
    // 天道赐福裁决
    PUNISHMENT: "punishment",
    // 天道惩罚裁决
    TRIAL: "trial",
    // 天道考验
    ASCENSION: "ascension"
    // 飞升裁决
  };
  var LEGACY_TYPES = {
    CULTIVATION: "cultivation",
    // 修为传承
    MERIT: "merit",
    // 功德传承
    TREASURE: "treasure",
    // 灵宝传承
    WISDOM: "wisdom"
    // 智慧传承
  };
  var CosmicCycle = class {
    constructor(options = {}) {
      this.id = `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.cycleNumber = options.cycleNumber || 1;
      this.startTime = options.startTime || Date.now();
      this.endTime = options.endTime || this.startTime + COSMIC_CONFIG.CYCLE_DURATION;
      this.currentPhase = options.currentPhase || CYCLE_PHASES.CREATION;
      this.worldLevel = options.worldLevel || 1;
      this.completed = false;
      this.completedAt = null;
      this.events = [];
    }
    /**
     * 获取已过时间 (ms)
     */
    getElapsedTime() {
      return Date.now() - this.startTime;
    }
    /**
     * 获取剩余时间 (ms)
     */
    getRemainingTime() {
      return Math.max(0, this.endTime - Date.now());
    }
    /**
     * 获取进度 (0-1)
     */
    getProgress() {
      const elapsed = this.getElapsedTime();
      const total = COSMIC_CONFIG.CYCLE_DURATION;
      return Math.min(1, elapsed / total);
    }
    /**
     * 更新阶段
     */
    updatePhase() {
      const progress = this.getProgress();
      if (progress < 0.2) {
        this.currentPhase = CYCLE_PHASES.CREATION;
      } else if (progress < 0.4) {
        this.currentPhase = CYCLE_PHASES.EVOLUTION;
      } else if (progress < 0.7) {
        this.currentPhase = CYCLE_PHASES.FLORAGE;
      } else if (progress < 0.9) {
        this.currentPhase = CYCLE_PHASES.DECAY;
      } else {
        this.currentPhase = CYCLE_PHASES.RENEWAL;
      }
      return this.currentPhase;
    }
    /**
     * 完成轮回
     */
    complete() {
      this.completed = true;
      this.completedAt = Date.now();
      return { success: true, cycleNumber: this.cycleNumber };
    }
    /**
     * 添加事件
     */
    addEvent(type, description, data = {}) {
      this.events.push({
        type,
        description,
        data,
        timestamp: Date.now()
      });
    }
  };
  var WorldEvolution = class {
    constructor(options = {}) {
      this.id = `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.stage = options.stage || WORLD_EVOLUTION_STAGES.PRIMORDIAL;
      this.level = options.level || 1;
      this.experience = options.experience || 0;
      this.requiredExperience = options.requiredExperience || 1e3;
      this.meritBonus = options.meritBonus || 1;
      this.cultivationSpeedBonus = options.cultivationSpeedBonus || 1;
      this.blessingPower = options.blessingPower || 1;
      this.lastEvolutionAt = options.lastEvolutionAt || Date.now();
      this.evolved = false;
    }
    /**
     * 增加经验
     */
    addExperience(amount) {
      this.experience += amount;
      this.lastEvolutionAt = Date.now();
      if (this.experience >= this.requiredExperience && this.level < COSMIC_CONFIG.WORLD_LEVEL_RANGE.max) {
        return this.evolve();
      }
      return { evolved: false, experience: this.experience };
    }
    /**
     * 进化
     */
    evolve() {
      this.level++;
      this.experience = 0;
      this.requiredExperience = Math.floor(this.requiredExperience * 1.5);
      this.evolved = true;
      const stages = Object.values(WORLD_EVOLUTION_STAGES);
      const currentIndex = stages.indexOf(this.stage);
      if (currentIndex < stages.length - 1) {
        this.stage = stages[currentIndex + 1];
      }
      this.meritBonus = 1 + this.level * 0.1;
      this.cultivationSpeedBonus = 1 + this.level * 0.05;
      this.blessingPower = 1 + this.level * 0.2;
      return {
        evolved: true,
        level: this.level,
        stage: this.stage,
        bonuses: {
          meritBonus: this.meritBonus,
          cultivationSpeedBonus: this.cultivationSpeedBonus,
          blessingPower: this.blessingPower
        }
      };
    }
    /**
     * 获取升级进度 (0-1)
     */
    getUpgradeProgress() {
      return Math.min(1, this.experience / this.requiredExperience);
    }
  };
  var HeavenJudgment = class {
    constructor(type, description, options = {}) {
      this.id = `judgment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = type;
      this.description = description;
      this.targetPlayerId = options.targetPlayerId || null;
      this.karmaValue = options.karmaValue || 0;
      this.meritValue = options.meritValue || 0;
      this.result = options.result || null;
      this.executed = false;
      this.executedAt = null;
      this.effects = options.effects || {};
      this.createdAt = Date.now();
    }
    /**
     * 执行裁决
     */
    execute() {
      if (this.executed) {
        return { success: false, error: "Judgment already executed" };
      }
      this.executed = true;
      this.executedAt = Date.now();
      const karma = this.karmaValue;
      if (karma >= COSMIC_CONFIG.JUDGMENT_THRESHOLD.BLESSED) {
        this.result = JUDGMENT_TYPES.BLESSING;
      } else if (karma <= COSMIC_CONFIG.JUDGMENT_THRESHOLD.DAMNED) {
        this.result = JUDGMENT_TYPES.PUNISHMENT;
      } else if (karma >= COSMIC_CONFIG.JUDGMENT_THRESHOLD.RIGHTEOUS) {
        this.result = JUDGMENT_TYPES.ASCENSION;
      } else if (karma <= COSMIC_CONFIG.JUDGMENT_THRESHOLD.EVIL) {
        this.result = JUDGMENT_TYPES.TRIAL;
      } else {
        this.result = Math.random() > 0.5 ? JUDGMENT_TYPES.BLESSING : JUDGMENT_TYPES.TRIAL;
      }
      return {
        success: true,
        result: this.result,
        effects: this.effects
      };
    }
  };
  var CosmicBlessing = class {
    constructor(type, title, description, options = {}) {
      this.id = `cosmic_blessing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = type;
      this.title = title;
      this.description = description;
      this.power = options.power || 1;
      this.duration = options.duration || COSMIC_CONFIG.CYCLE_DURATION;
      this.grantedAt = Date.now();
      this.grantedBy = options.grantedBy || "\u5929\u9053";
      this.targetPlayerId = options.targetPlayerId || null;
      this.claimed = false;
      this.claimedAt = null;
      this.effects = options.effects || {};
    }
    /**
     * 是否已过期
     */
    isExpired() {
      return Date.now() > this.grantedAt + this.duration;
    }
    /**
     * 领取赐福
     */
    claim() {
      if (this.claimed) {
        return { success: false, error: "Blessing already claimed" };
      }
      if (this.isExpired()) {
        return { success: false, error: "Blessing has expired" };
      }
      this.claimed = true;
      this.claimedAt = Date.now();
      return { success: true, effects: this.effects };
    }
  };
  var LegacyInheritance = class {
    constructor(type, name, description, options = {}) {
      this.id = `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = type;
      this.name = name;
      this.description = description;
      this.value = options.value || 1;
      this.quality = options.quality || "\u666E\u901A";
      this.rarity = options.rarity || "common";
      this.retentionRatio = options.retentionRatio || COSMIC_CONFIG.LEGACY_RETENTION_RATIO;
      this.preserved = options.preserved || false;
      this.sourceCycle = options.sourceCycle || 1;
      this.createdAt = Date.now();
    }
    /**
     * 获取传承值
     */
    getInheritedValue() {
      return Math.floor(this.value * this.retentionRatio);
    }
    /**
     * 激活传承
     */
    activate() {
      this.preserved = true;
      return {
        success: true,
        inheritedValue: this.getInheritedValue()
      };
    }
  };
  var CosmicCycleService = class {
    constructor() {
      this.gameState = null;
      this.currentCycle = null;
      this.worldEvolution = null;
      this.judgments = [];
      this.cosmicBlessings = [];
      this.legacies = [];
      this.lastResetTime = null;
      this.totalCycles = 0;
    }
    /**
     * 初始化服务
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.cosmic) {
        gameState3.cosmic = {
          currentCycle: null,
          worldEvolution: null,
          judgments: [],
          cosmicBlessings: [],
          legacies: [],
          lastResetTime: null,
          totalCycles: 0
        };
      }
      this.currentCycle = gameState3.cosmic.currentCycle;
      this.worldEvolution = gameState3.cosmic.worldEvolution;
      this.judgments = gameState3.cosmic.judgments || [];
      this.cosmicBlessings = gameState3.cosmic.cosmicBlessings || [];
      this.legacies = gameState3.cosmic.legacies || [];
      this.lastResetTime = gameState3.cosmic.lastResetTime;
      this.totalCycles = gameState3.cosmic.totalCycles || 0;
      if (!this.currentCycle || this.currentCycle.completed) {
        this.startNewCycle();
      }
      if (!this.worldEvolution) {
        this.worldEvolution = new WorldEvolution();
        this.saveState();
      }
      console.log("[CosmicCycle] \u5929\u9053\u610F\u5FD7\u7EC8\u6781\u7CFB\u7EDF\u521D\u59CB\u5316\u5B8C\u6210");
      return { success: true };
    }
    /**
     * 保存状态到游戏状态
     */
    saveState() {
      if (!this.gameState) return;
      this.gameState.cosmic = {
        currentCycle: this.currentCycle,
        worldEvolution: this.worldEvolution,
        judgments: this.judgments,
        cosmicBlessings: this.cosmicBlessings,
        legacies: this.legacies,
        lastResetTime: this.lastResetTime,
        totalCycles: this.totalCycles
      };
    }
    // ===== 轮回管理 =====
    /**
     * 开始新轮回
     */
    startNewCycle() {
      if (this.currentCycle && !this.currentCycle.completed) {
        this.currentCycle.complete();
      }
      this.totalCycles++;
      this.currentCycle = new CosmicCycle({
        cycleNumber: this.totalCycles,
        startTime: Date.now()
      });
      this.saveState();
      console.log(`[CosmicCycle] \u5B87\u5B99\u8F6E\u56DE #${this.totalCycles} \u5F00\u59CB`);
      return {
        success: true,
        cycle: this.getCycleInfo()
      };
    }
    /**
     * 获取轮回信息
     */
    getCycleInfo() {
      if (!this.currentCycle) return null;
      return {
        id: this.currentCycle.id,
        cycleNumber: this.currentCycle.cycleNumber,
        startTime: this.currentCycle.startTime,
        endTime: this.currentCycle.endTime,
        currentPhase: this.currentCycle.currentPhase,
        worldLevel: this.currentCycle.worldLevel,
        progress: this.currentCycle.getProgress(),
        elapsedTime: this.currentCycle.getElapsedTime(),
        remainingTime: this.currentCycle.getRemainingTime(),
        completed: this.currentCycle.completed,
        events: this.currentCycle.events.slice(-10)
        // 最近10个事件
      };
    }
    /**
     * 更新轮回阶段
     */
    updateCyclePhase() {
      if (!this.currentCycle || this.currentCycle.completed) {
        return { success: false, error: "No active cycle" };
      }
      const oldPhase = this.currentCycle.currentPhase;
      const newPhase = this.currentCycle.updatePhase();
      if (oldPhase !== newPhase) {
        this.currentCycle.addEvent("phase_change", `\u8F6E\u56DE\u9636\u6BB5\u4ECE ${oldPhase} \u53D8\u4E3A ${newPhase}`);
        this.saveState();
      }
      return {
        success: true,
        oldPhase,
        newPhase,
        progress: this.currentCycle.getProgress()
      };
    }
    // ===== 世界演化管理 =====
    /**
     * 获取世界演化信息
     */
    getWorldEvolutionInfo() {
      if (!this.worldEvolution) {
        this.worldEvolution = new WorldEvolution();
      }
      return {
        id: this.worldEvolution.id,
        stage: this.worldEvolution.stage,
        level: this.worldEvolution.level,
        experience: this.worldEvolution.experience,
        requiredExperience: this.worldEvolution.requiredExperience,
        upgradeProgress: this.worldEvolution.getUpgradeProgress(),
        bonuses: {
          meritBonus: this.worldEvolution.meritBonus,
          cultivationSpeedBonus: this.worldEvolution.cultivationSpeedBonus,
          blessingPower: this.worldEvolution.blessingPower
        },
        lastEvolutionAt: this.worldEvolution.lastEvolutionAt
      };
    }
    /**
     * 触发世界演化
     */
    triggerWorldEvolution(options = {}) {
      var _a;
      if (!this.worldEvolution) {
        this.worldEvolution = new WorldEvolution();
      }
      const experienceAmount = options.experience || 100;
      const result = this.worldEvolution.addExperience(experienceAmount);
      (_a = this.currentCycle) == null ? void 0 : _a.addEvent("world_evolution", `\u4E16\u754C\u6F14\u5316\u89E6\u53D1\uFF0C\u83B7\u5F97 ${experienceAmount} \u7ECF\u9A8C`, result);
      this.saveState();
      return {
        success: true,
        evolution: this.getWorldEvolutionInfo(),
        result
      };
    }
    // ===== 天道裁决 =====
    /**
     * 执行天道裁决
     */
    executeJudgment(options = {}) {
      var _a, _b, _c;
      const karmaValue = options.karmaValue || ((_b = (_a = this.gameState) == null ? void 0 : _a.player) == null ? void 0 : _b.karmaPoints) || 0;
      const meritValue = options.meritValue || 0;
      const judgment = new HeavenJudgment(
        options.type || JUDGMENT_TYPES.TRIAL,
        options.description || "\u5929\u9053\u5BF9\u73A9\u5BB6\u7684\u88C1\u51B3",
        {
          targetPlayerId: options.targetPlayerId,
          karmaValue,
          meritValue,
          effects: options.effects || {}
        }
      );
      const executeResult = judgment.execute();
      this.judgments.push(judgment);
      if (executeResult.success) {
        this.applyJudgmentEffect(judgment);
      }
      (_c = this.currentCycle) == null ? void 0 : _c.addEvent("judgment", `\u5929\u9053\u88C1\u51B3: ${judgment.result}`, executeResult);
      this.saveState();
      return {
        success: true,
        judgment: {
          id: judgment.id,
          type: judgment.type,
          result: judgment.result,
          karmaValue: judgment.karmaValue,
          executed: judgment.executed
        },
        executeResult
      };
    }
    /**
     * 应用裁决效果
     */
    applyJudgmentEffect(judgment) {
      if (!this.gameState) return;
      const result = judgment.result;
      const effects = judgment.effects;
      switch (result) {
        case JUDGMENT_TYPES.BLESSING:
          this.gameState.player.qi = (this.gameState.player.qi || 0) + (effects.qiBonus || 100);
          this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + (effects.cultivationBonus || 500);
          this.grantCosmicBlessing({
            type: "judgment_blessing",
            title: "\u5929\u9053\u6069\u8D50",
            description: "\u56E0\u4F60\u7684\u5584\u884C\uFF0C\u5929\u9053\u8D50\u4E88\u4F60\u65E0\u4E0A\u6069\u5178",
            power: effects.power || 2,
            effects
          });
          break;
        case JUDGMENT_TYPES.PUNISHMENT:
          this.gameState.player.qi = Math.max(0, (this.gameState.player.qi || 0) - (effects.qiPenalty || 50));
          this.gameState.cultivationXP = Math.max(0, (this.gameState.cultivationXP || 0) - (effects.cultivationPenalty || 200));
          break;
        case JUDGMENT_TYPES.TRIAL:
          this.grantCosmicBlessing({
            type: "trial",
            title: "\u5929\u9053\u8003\u9A8C",
            description: "\u5929\u9053\u5BF9\u4F60\u8FDB\u884C\u8003\u9A8C\uFF0C\u5B8C\u6210\u540E\u53EF\u83B7\u5F97\u4E30\u539A\u5956\u52B1",
            power: 1.5,
            effects
          });
          break;
        case JUDGMENT_TYPES.ASCENSION:
          this.gameState.blessings = this.gameState.blessings || [];
          this.gameState.blessings.push({
            name: "\u98DE\u5347\u673A\u7F18",
            description: "\u5929\u9053\u8BA4\u53EF\u4F60\u7684\u4FEE\u884C",
            duration: COSMIC_CONFIG.CYCLE_DURATION,
            effect: { cultivationSpeed: 2 }
          });
          break;
      }
    }
    /**
     * 获取裁决列表
     */
    listJudgments(options = {}) {
      let result = [...this.judgments];
      if (options.type) {
        result = result.filter((j) => j.type === options.type);
      }
      if (options.result) {
        result = result.filter((j) => j.result === options.result);
      }
      if (options.executed !== void 0) {
        result = result.filter((j) => j.executed === options.executed);
      }
      return {
        success: true,
        judgments: result.map((j) => ({
          id: j.id,
          type: j.type,
          description: j.description,
          result: j.result,
          karmaValue: j.karmaValue,
          executed: j.executed,
          executedAt: j.executedAt,
          createdAt: j.createdAt
        })),
        total: result.length
      };
    }
    // ===== 宇宙赐福 =====
    /**
     * 授予宇宙赐福
     */
    grantCosmicBlessing(options = {}) {
      var _a;
      if (this.cosmicBlessings.length >= COSMIC_CONFIG.MAX_COSMIC_BLESSINGS) {
        this.cosmicBlessings = this.cosmicBlessings.filter((b) => !b.isExpired());
        if (this.cosmicBlessings.length >= COSMIC_CONFIG.MAX_COSMIC_BLESSINGS) {
          this.cosmicBlessings.shift();
        }
      }
      const blessing = new CosmicBlessing(
        options.type || "general",
        options.title || "\u5929\u9053\u8D50\u798F",
        options.description || "\u5929\u9053\u7684\u6069\u8D50",
        {
          power: options.power || 1,
          duration: options.duration,
          grantedBy: options.grantedBy || "\u5929\u9053",
          targetPlayerId: options.targetPlayerId,
          effects: options.effects || {}
        }
      );
      this.cosmicBlessings.push(blessing);
      (_a = this.currentCycle) == null ? void 0 : _a.addEvent("blessing", `\u6388\u4E88\u5B87\u5B99\u8D50\u798F: ${blessing.title}`);
      this.saveState();
      return {
        success: true,
        blessing: {
          id: blessing.id,
          type: blessing.type,
          title: blessing.title,
          power: blessing.power,
          grantedAt: blessing.grantedAt
        }
      };
    }
    /**
     * 领取宇宙赐福
     */
    claimCosmicBlessing(blessingId) {
      const blessing = this.cosmicBlessings.find((b) => b.id === blessingId);
      if (!blessing) {
        return { success: false, error: "Blessing not found" };
      }
      const claimResult = blessing.claim();
      if (claimResult.success) {
        if (this.gameState && blessing.effects) {
          if (blessing.effects.qiBonus) {
            this.gameState.player.qi = (this.gameState.player.qi || 0) + blessing.effects.qiBonus;
          }
          if (blessing.effects.cultivationBonus) {
            this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + blessing.effects.cultivationBonus;
          }
          if (blessing.effects.meritBonus) {
            this.gameState.player.karmaPoints = (this.gameState.player.karmaPoints || 0) + blessing.effects.meritBonus;
          }
        }
        this.saveState();
      }
      return claimResult;
    }
    /**
     * 获取宇宙赐福列表
     */
    listCosmicBlessings(options = {}) {
      let result = [...this.cosmicBlessings];
      if (!options.includeExpired) {
        result = result.filter((b) => !b.isExpired());
      }
      if (!options.includeClaimed) {
        result = result.filter((b) => !b.claimed);
      }
      if (options.type) {
        result = result.filter((b) => b.type === options.type);
      }
      return {
        success: true,
        blessings: result.map((b) => ({
          id: b.id,
          type: b.type,
          title: b.title,
          description: b.description,
          power: b.power,
          duration: b.duration,
          grantedAt: b.grantedAt,
          grantedBy: b.grantedBy,
          claimed: b.claimed,
          claimedAt: b.claimedAt,
          effects: b.effects,
          isExpired: b.isExpired()
        })),
        total: result.length
      };
    }
    // ===== 宇宙重置 =====
    /**
     * 执行宇宙重置
     */
    executeReset(options = {}) {
      if (this.lastResetTime) {
        const timeSinceReset = Date.now() - this.lastResetTime;
        if (timeSinceReset < COSMIC_CONFIG.RESET_COOLDOWN) {
          const remainingCooldown = COSMIC_CONFIG.RESET_COOLDOWN - timeSinceReset;
          return {
            success: false,
            error: "Reset cooldown active",
            remainingCooldown
          };
        }
      }
      const forceReset = options.force || false;
      const preserveLegacy = options.preserveLegacy !== false;
      if (preserveLegacy) {
        this.preserveLegacy();
      }
      if (this.currentCycle) {
        this.currentCycle.complete();
      }
      const resetResult = {
        previousCycle: this.totalCycles,
        legaciesPreserved: preserveLegacy ? this.legacies.length : 0,
        blessingsReset: this.cosmicBlessings.length,
        judgmentsReset: this.judgments.length
      };
      this.startNewCycle();
      this.lastResetTime = Date.now();
      this.cosmicBlessings = [];
      this.judgments = [];
      this.saveState();
      return {
        success: true,
        reset: resetResult,
        newCycle: this.getCycleInfo()
      };
    }
    /**
     * 获取重置冷却时间
     */
    getResetCooldown() {
      if (!this.lastResetTime) {
        return { onCooldown: false, remainingTime: 0 };
      }
      const timeSinceReset = Date.now() - this.lastResetTime;
      const remaining = Math.max(0, COSMIC_CONFIG.RESET_COOLDOWN - timeSinceReset);
      return {
        onCooldown: remaining > 0,
        remainingTime: remaining,
        lastResetTime: this.lastResetTime
      };
    }
    // ===== 传承遗产 =====
    /**
     * 保留遗产
     */
    preserveLegacy() {
      var _a, _b;
      if (!this.gameState) return { success: false, error: "No game state" };
      const legacyItems = [];
      const cultivationXP = this.gameState.cultivationXP || 0;
      if (cultivationXP > 0) {
        const legacy = new LegacyInheritance(
          LEGACY_TYPES.CULTIVATION,
          "\u4FEE\u4E3A\u4F20\u627F",
          "\u524D\u4E16\u4FEE\u884C\u6240\u79EF\u7D2F\u7684\u4FEE\u4E3A",
          {
            value: cultivationXP,
            quality: cultivationXP > 1e4 ? "\u6781\u54C1" : "\u4E0A\u54C1",
            rarity: cultivationXP > 1e4 ? "legendary" : "rare",
            sourceCycle: this.totalCycles
          }
        );
        legacy.activate();
        this.legacies.push(legacy);
        legacyItems.push(legacy);
      }
      const merit = ((_a = this.gameState.player) == null ? void 0 : _a.karmaPoints) || 0;
      if (merit > 0) {
        const legacy = new LegacyInheritance(
          LEGACY_TYPES.MERIT,
          "\u529F\u5FB7\u4F20\u627F",
          "\u524D\u4E16\u884C\u5584\u79EF\u6512\u7684\u529F\u5FB7",
          {
            value: merit,
            quality: merit > 5e3 ? "\u6781\u54C1" : "\u4E0A\u54C1",
            rarity: merit > 5e3 ? "legendary" : "rare",
            sourceCycle: this.totalCycles
          }
        );
        legacy.activate();
        this.legacies.push(legacy);
        legacyItems.push(legacy);
      }
      const inventory = ((_b = this.gameState.inventory) == null ? void 0 : _b.items) || [];
      const valuableItems = inventory.filter((item) => item.quality === "\u6781\u54C1" || item.quality === "\u4E0A\u54C1");
      for (const item of valuableItems.slice(0, COSMIC_CONFIG.MAX_LEGACY_ITEMS - this.legacies.length)) {
        const legacy = new LegacyInheritance(
          LEGACY_TYPES.TREASURE,
          item.name,
          item.description || "\u73CD\u8D35\u5B9D\u7269",
          {
            value: 1,
            quality: item.quality,
            rarity: item.quality === "\u6781\u54C1" ? "legendary" : "rare",
            sourceCycle: this.totalCycles
          }
        );
        legacy.activate();
        this.legacies.push(legacy);
        legacyItems.push(legacy);
      }
      if (this.legacies.length > COSMIC_CONFIG.MAX_LEGACY_ITEMS) {
        this.legacies = this.legacies.slice(-COSMIC_CONFIG.MAX_LEGACY_ITEMS);
      }
      this.saveState();
      return {
        success: true,
        preservedCount: legacyItems.length,
        legacies: legacyItems.map((l) => ({
          id: l.id,
          type: l.type,
          name: l.name,
          inheritedValue: l.getInheritedValue()
        }))
      };
    }
    /**
     * 继承遗产
     */
    inheritLegacy(legacyId) {
      const legacy = this.legacies.find((l) => l.id === legacyId);
      if (!legacy) {
        return { success: false, error: "Legacy not found" };
      }
      if (!legacy.preserved) {
        return { success: false, error: "Legacy not preserved" };
      }
      if (!this.gameState) {
        return { success: false, error: "No game state" };
      }
      const inheritedValue = legacy.getInheritedValue();
      switch (legacy.type) {
        case LEGACY_TYPES.CULTIVATION:
          this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + inheritedValue;
          break;
        case LEGACY_TYPES.MERIT:
          this.gameState.player.karmaPoints = (this.gameState.player.karmaPoints || 0) + inheritedValue;
          break;
        case LEGACY_TYPES.TREASURE:
          this.gameState.inventory = this.gameState.inventory || { items: [] };
          this.gameState.inventory.items.push({
            name: legacy.name,
            type: "equipment",
            quantity: 1,
            quality: legacy.quality,
            description: legacy.description
          });
          break;
        case LEGACY_TYPES.WISDOM:
          this.gameState.player.level = (this.gameState.player.level || 1) + 1;
          break;
      }
      this.legacies = this.legacies.filter((l) => l.id !== legacyId);
      this.saveState();
      return {
        success: true,
        inherited: {
          type: legacy.type,
          name: legacy.name,
          inheritedValue
        }
      };
    }
    /**
     * 获取遗产列表
     */
    listLegacies(options = {}) {
      let result = [...this.legacies];
      if (options.type) {
        result = result.filter((l) => l.type === options.type);
      }
      if (options.preserved !== void 0) {
        result = result.filter((l) => l.preserved === options.preserved);
      }
      return {
        success: true,
        legacies: result.map((l) => ({
          id: l.id,
          type: l.type,
          name: l.name,
          description: l.description,
          value: l.value,
          quality: l.quality,
          rarity: l.rarity,
          retentionRatio: l.retentionRatio,
          inheritedValue: l.getInheritedValue(),
          preserved: l.preserved,
          sourceCycle: l.sourceCycle,
          createdAt: l.createdAt
        })),
        total: result.length
      };
    }
    // ===== MCP工具实现 =====
    /**
     * cosmic.cycle.query - 查询宇宙轮回状态
     */
    mcpCycleQuery(params = {}) {
      const cycleInfo = this.getCycleInfo();
      const evolutionInfo = this.getWorldEvolutionInfo();
      const cooldown = this.getResetCooldown();
      return {
        success: true,
        cycle: cycleInfo,
        worldEvolution: evolutionInfo,
        resetCooldown: cooldown,
        totalCycles: this.totalCycles
      };
    }
    /**
     * cosmic.world.evolve - 触发世界演化
     */
    mcpWorldEvolve(params = {}) {
      return this.triggerWorldEvolution({
        experience: (params == null ? void 0 : params.experience) || 100
      });
    }
    /**
     * cosmic.heaven.judge - 天道裁决
     */
    mcpHeavenJudge(params = {}) {
      return this.executeJudgment({
        type: params == null ? void 0 : params.type,
        description: params == null ? void 0 : params.description,
        karmaValue: params == null ? void 0 : params.karmaValue,
        meritValue: params == null ? void 0 : params.meritValue,
        effects: params == null ? void 0 : params.effects
      });
    }
    /**
     * cosmic.blessing.grant - 天道赐福
     */
    mcpBlessingGrant(params = {}) {
      return this.grantCosmicBlessing({
        type: (params == null ? void 0 : params.type) || "general",
        title: (params == null ? void 0 : params.title) || "\u5929\u9053\u8D50\u798F",
        description: params == null ? void 0 : params.description,
        power: (params == null ? void 0 : params.power) || 1,
        duration: params == null ? void 0 : params.duration,
        effects: params == null ? void 0 : params.effects
      });
    }
    /**
     * cosmic.reset.execute - 执行宇宙重置
     */
    mcpResetExecute(params = {}) {
      return this.executeReset({
        force: (params == null ? void 0 : params.force) || false,
        preserveLegacy: (params == null ? void 0 : params.preserveLegacy) !== false
      });
    }
    /**
     * cosmic.legacy.inherit - 传承遗产
     */
    mcpLegacyInherit(params = {}) {
      if (!(params == null ? void 0 : params.legacyId)) {
        const legacies = this.listLegacies({ preserved: true });
        return {
          success: true,
          available: legacies.legacies,
          total: legacies.total
        };
      }
      return this.inheritLegacy(params.legacyId);
    }
  };
  var COSMIC_CYCLE_TOOLS = {
    "cosmic.cycle.query": {
      name: "cosmic.cycle.query",
      description: "Query the current cosmic cycle status, world evolution state, and reset cooldown",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    "cosmic.world.evolve": {
      name: "cosmic.world.evolve",
      description: "Trigger world evolution to gain experience and potentially level up the world",
      inputSchema: {
        type: "object",
        properties: {
          experience: { type: "number", description: "Experience amount to add", default: 100 }
        },
        required: []
      }
    },
    "cosmic.heaven.judge": {
      name: "cosmic.heaven.judge",
      description: "Execute heaven judgment on a player based on their karma",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "Judgment type" },
          description: { type: "string", description: "Judgment description" },
          karmaValue: { type: "number", description: "Karma value for judgment" },
          meritValue: { type: "number", description: "Merit value for judgment" },
          effects: { type: "object", description: "Effects to apply" }
        },
        required: []
      }
    },
    "cosmic.blessing.grant": {
      name: "cosmic.blessing.grant",
      description: "Grant a cosmic blessing to the player",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "Blessing type" },
          title: { type: "string", description: "Blessing title" },
          description: { type: "string", description: "Blessing description" },
          power: { type: "number", description: "Blessing power multiplier", default: 1 },
          duration: { type: "number", description: "Blessing duration in ms" },
          effects: { type: "object", description: "Blessing effects" }
        },
        required: []
      }
    },
    "cosmic.reset.execute": {
      name: "cosmic.reset.execute",
      description: "Execute a cosmic reset to start a new cycle (requires cooldown)",
      inputSchema: {
        type: "object",
        properties: {
          force: { type: "boolean", description: "Force reset even with penalties", default: false },
          preserveLegacy: { type: "boolean", description: "Preserve legacies for next cycle", default: true }
        },
        required: []
      }
    },
    "cosmic.legacy.inherit": {
      name: "cosmic.legacy.inherit",
      description: "Inherit a preserved legacy from previous cycles",
      inputSchema: {
        type: "object",
        properties: {
          legacyId: { type: "string", description: "Legacy ID to inherit (omit to list available legacies)" }
        },
        required: []
      }
    }
  };
  function createCosmicCycleMCPHandlers(gameState3) {
    const service = new CosmicCycleService();
    service.init(gameState3);
    return {
      "cosmic.cycle.query": (params) => service.mcpCycleQuery(params),
      "cosmic.world.evolve": (params) => service.mcpWorldEvolve(params),
      "cosmic.heaven.judge": (params) => service.mcpHeavenJudge(params),
      "cosmic.blessing.grant": (params) => service.mcpBlessingGrant(params),
      "cosmic.reset.execute": (params) => service.mcpResetExecute(params),
      "cosmic.legacy.inherit": (params) => service.mcpLegacyInherit(params)
    };
  }
  var cosmicCycleService = new CosmicCycleService();

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

  // src/systems/ai/NPCDialogueService.js
  init_NPCCollaboration();
  var DIALOGUE_TEMPLATES = {
    master: {
      formal: [
        { template: "\u5F92\u513F\uFF0C{topic}\uFF0C\u4E3A\u5E08\u751A\u611F\u6B23\u6170\u3002", variables: ["topic"] },
        { template: "\u4FEE\u4ED9\u4E4B\u8DEF\u8270\u96BE\uFF0C{topic}\uFF0C\u4F60\u9700\u52E4\u52A0\u4FEE\u70BC\u3002", variables: ["topic"] },
        { template: "\u4E3A\u5E08\u89C2\u4F60\u6839\u9AA8\uFF0C{topic}\uFF0C\u65E5\u540E\u5FC5\u6210\u5927\u5668\u3002", variables: ["topic"] }
      ],
      casual: [
        { template: "\u5F92\u513F\u554A\uFF0C{topic}\uFF0C\u8FD9\u4E8B\u4E3A\u5E08\u4E5F\u4E0D\u597D\u591A\u8BF4\u3002", variables: ["topic"] },
        { template: "\u8BF4\u8D77\u6765\uFF0C{topic}\uFF0C\u4F60\u81EA\u5DF1\u597D\u597D\u7422\u78E8\u7422\u78E8\u3002", variables: ["topic"] }
      ],
      mysterious: [
        { template: "\u5929\u673A\u4E0D\u53EF\u6CC4\u9732\uFF0C{topic}\uFF0C\u4F60\u4E14\u8BB0\u4F4F\u4FBF\u662F\u3002", variables: ["topic"] },
        { template: "\u51A5\u51A5\u4E4B\u4E2D\u81EA\u6709\u5B9A\u6570\uFF0C{topic}\uFF0C\u65E0\u9700\u591A\u95EE\u3002", variables: ["topic"] }
      ]
    },
    merchant: {
      formal: [
        { template: "\u8FD9\u4F4D\u9053\u53CB\uFF0C{topic}\uFF0C\u672C\u5E97\u5E94\u6709\u5C3D\u6709\u3002", variables: ["topic"] },
        { template: "\u5BA2\u5B98\uFF0C{topic}\uFF0C\u60A8\u773C\u5149\u771F\u662F\u72EC\u5230\u3002", variables: ["topic"] }
      ],
      casual: [
        { template: "\u54DF\uFF0C{topic}\uFF0C\u6765\u770B\u770B\u8FD9\u4E2A\uFF0C\u4FDD\u8BC1\u4FBF\u5B9C\uFF01", variables: ["topic"] },
        { template: "\u563F\uFF0C{topic}\uFF0C\u6211\u8FD9\u513F\u53EF\u662F\u8D27\u771F\u4EF7\u5B9E\uFF01", variables: ["topic"] }
      ],
      mysterious: [
        { template: "\u8FD9\u4E9B\u4E1C\u897F\u561B\uFF0C{topic}\uFF0C\u6765\u5386\u53EF\u4E0D\u7B80\u5355\u3002", variables: ["topic"] },
        { template: "\u4F60\u6211\u6709\u7F18\uFF0C{topic}\uFF0C\u4FBF\u8D60\u4F60\u4E00\u53E5\uFF1A\u83AB\u8D2A\u4FBF\u5B9C\u3002", variables: ["topic"] }
      ]
    },
    fellow: {
      formal: [
        { template: "\u9053\u5144\uFF0C{topic}\uFF0C\u4E0D\u77E5\u6709\u4F55\u89C1\u6559\uFF1F", variables: ["topic"] },
        { template: "\u8FD9\u4F4D\u9053\u53CB\uFF0C{topic}\uFF0C\u543E\u7B49\u5F53\u5171\u52C9\u4E4B\u3002", variables: ["topic"] }
      ],
      casual: [
        { template: "\u563F\uFF0C{topic}\uFF0C\u6700\u8FD1\u4FEE\u70BC\u5F97\u600E\u4E48\u6837\uFF1F", variables: ["topic"] },
        { template: "\u8BF4\u8D77\u6765\uFF0C{topic}\uFF0C\u54B1\u4EEC\u4E00\u5757\u513F\u53BB\u63A2\u9669\u5982\u4F55\uFF1F", variables: ["topic"] }
      ],
      mysterious: [
        { template: "\u6211\u6628\u591C\u5360\u4E86\u4E00\u5366\uFF0C{topic}\uFF0C\u4F60\u4E14\u542C\u597D\u3002", variables: ["topic"] },
        { template: "\u5929\u673A\u793A\u73B0\uFF0C{topic}\uFF0C\u6050\u6709\u5927\u4E8B\u53D1\u751F\u3002", variables: ["topic"] }
      ]
    },
    monster: {
      formal: [
        { template: "\u5351\u5FAE\u7684\u4EBA\u7C7B\uFF0C{topic}\uFF0C\u901F\u901F\u79BB\u53BB\uFF01", variables: ["topic"] },
        { template: "\u54FC\uFF0C{topic}\uFF0C\u672C\u5EA7\u4E0D\u5C51\u4E0E\u4F60\u8BA1\u8F83\u3002", variables: ["topic"] }
      ],
      casual: [
        { template: "\u54DF\uFF0C{topic}\uFF0C\u53C8\u6765\u9001\u6B7B\u4E86\uFF1F", variables: ["topic"] },
        { template: "\u54C8\u54C8\u54C8\uFF0C{topic}\uFF0C\u6B63\u597D\u997F\u4E86\uFF01", variables: ["topic"] }
      ],
      mysterious: [
        { template: "\u5343\u5E74\u6C89\u7761\u4E2D\uFF0C{topic}\uFF0C\u543E\u5DF2\u7B49\u5F85\u591A\u65F6\u3002", variables: ["topic"] },
        { template: "\u547D\u8FD0\u7684\u9F7F\u8F6E\u8F6C\u52A8\uFF0C{topic}\uFF0C\u4E00\u5207\u7686\u6709\u5B9A\u6570\u3002", variables: ["topic"] }
      ]
    }
  };
  var DEFAULT_TEMPLATES = {
    formal: [
      { template: "\u8FD9\u4F4D\u4FEE\u58EB\uFF0C{topic}\uFF0C\u6709\u4F55\u8D35\u5E72\uFF1F", variables: ["topic"] }
    ],
    casual: [
      { template: "\u563F\uFF0C{topic}\uFF0C\u6709\u4EC0\u4E48\u4E8B\u5417\uFF1F", variables: ["topic"] }
    ],
    mysterious: [
      { template: "\u5929\u673A\u7384\u5999\uFF0C{topic}\uFF0C\u543E\u96BE\u4EE5\u53C2\u900F\u3002", variables: ["topic"] }
    ]
  };
  var DialogueContext = class {
    constructor(npcId) {
      this.npcId = npcId;
      this.conversationHistory = [];
      this.currentTopic = null;
      this.emotion = "neutral";
      this.goal = null;
      this.turnCount = 0;
      this.lastPlayerMessage = null;
      this.lastGeneratedDialogue = null;
      this.tone = "formal";
      this.createdAt = Date.now();
      this.updatedAt = Date.now();
    }
    /**
     * 添加对话到历史
     */
    addToHistory(playerMessage, npcResponse) {
      this.conversationHistory.push({
        playerMessage,
        npcResponse,
        timestamp: Date.now(),
        turn: this.turnCount
      });
      this.lastPlayerMessage = playerMessage;
      this.lastGeneratedDialogue = npcResponse;
      this.turnCount++;
      this.updatedAt = Date.now();
    }
    /**
     * 重置上下文
     */
    reset() {
      this.conversationHistory = [];
      this.currentTopic = null;
      this.emotion = "neutral";
      this.goal = null;
      this.turnCount = 0;
      this.lastPlayerMessage = null;
      this.lastGeneratedDialogue = null;
      this.updatedAt = Date.now();
    }
  };
  var NPCMemoryEntry = class {
    constructor(type, content, metadata = {}) {
      this.id = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = type;
      this.content = content;
      this.metadata = metadata;
      this.importance = metadata.importance || 0.5;
      this.createdAt = Date.now();
      this.lastAccessedAt = Date.now();
      this.accessCount = 0;
    }
    /**
     * 访问记忆
     */
    access() {
      this.lastAccessedAt = Date.now();
      this.accessCount++;
    }
  };
  var NPCDialogueService = class {
    constructor() {
      this.contexts = /* @__PURE__ */ new Map();
      this.memories = /* @__PURE__ */ new Map();
      this.toneSettings = /* @__PURE__ */ new Map();
      this.gameState = null;
      this.initialized = false;
      this.templateCache = /* @__PURE__ */ new Map();
      this.maxMemoriesPerNPC = 100;
      this.maxContextHistory = 50;
    }
    /**
     * 初始化服务
     */
    init(gameState3) {
      this.gameState = gameState3;
      this.initialized = true;
      console.log("[NPCDialogueService] NPC\u5BF9\u8BDD\u751F\u6210\u670D\u52A1\u521D\u59CB\u5316\u5B8C\u6210");
      return { success: true };
    }
    /**
     * 获取或创建NPC上下文
     */
    getOrCreateContext(npcId) {
      if (!this.contexts.has(npcId)) {
        this.contexts.set(npcId, new DialogueContext(npcId));
      }
      return this.contexts.get(npcId);
    }
    /**
     * 获取玩家上下文信息
     */
    getPlayerContext() {
      var _a, _b, _c;
      if (!this.gameState) return null;
      return {
        name: ((_a = this.gameState.player) == null ? void 0 : _a.name) || "\u672A\u77E5\u4FEE\u58EB",
        level: ((_b = this.gameState.player) == null ? void 0 : _b.level) || 1,
        realm: this.gameState.realm || 0,
        stage: this.gameState.stage || 0,
        reputation: ((_c = this.gameState.player) == null ? void 0 : _c.reputation) || 0
      };
    }
    /**
     * 从NPCEvolutionEngine获取NPC学习状态
     */
    getNPCLearningStatus(npcId) {
      try {
        const status = npcEvolutionEngine.registry.getLearningStatus(npcId);
        return status;
      } catch (e) {
        return null;
      }
    }
    // ===== MCP工具实现 =====
    /**
     * MCP: npc.dialogue.generate
     * 生成NPC对话回复
     */
    mcpGenerateDialogue(params = {}) {
      const { npcId, playerMessage, context: customContext } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      if (!playerMessage) {
        return { success: false, reason: "Missing playerMessage parameter" };
      }
      const role = this.extractRole(npcId);
      const ctx = this.getOrCreateContext(npcId);
      const memories = this.getMemories(npcId);
      const relevantMemories = this.findRelevantMemories(memories, playerMessage);
      const generated = this.generateDialogue(npcId, role, playerMessage, ctx, relevantMemories);
      ctx.addToHistory(playerMessage, generated.text);
      if (ctx.turnCount === 1) {
        ctx.currentTopic = this.extractTopic(playerMessage);
      }
      this.recordMemory(npcId, "interaction", {
        playerMessage,
        npcResponse: generated.text
      }, { importance: 0.5 });
      return {
        tool: "npc.dialogue.generate",
        success: true,
        npcId,
        dialogue: generated,
        context: {
          turnCount: ctx.turnCount,
          currentTopic: ctx.currentTopic,
          emotion: ctx.emotion,
          tone: ctx.tone
        }
      };
    }
    /**
     * 提取NPC角色
     */
    extractRole(npcId) {
      const lowerNpcId = npcId.toLowerCase();
      if (NPC_ROLE_REGISTRY[lowerNpcId]) {
        return lowerNpcId;
      }
      for (const role of Object.keys(NPC_ROLE_REGISTRY)) {
        if (lowerNpcId.startsWith(role) || lowerNpcId.includes(role)) {
          return role;
        }
      }
      return "fellow";
    }
    /**
     * 提取话题
     */
    extractTopic(message) {
      const keywords = {
        "\u4FEE\u70BC": "cultivation",
        "\u7A81\u7834": "breakthrough",
        "\u7075\u6839": "spirit_root",
        "\u4E39\u836F": "pill",
        "\u529F\u6CD5": "technique",
        "\u4EFB\u52A1": "task",
        "\u6218\u6597": "combat",
        "\u4EA4\u6613": "trade",
        "\u5207\u78CB": "sparring"
      };
      for (const [keyword, topic] of Object.entries(keywords)) {
        if (message.includes(keyword)) {
          return topic;
        }
      }
      return "general";
    }
    /**
     * 生成对话
     */
    generateDialogue(npcId, role, playerMessage, context, memories) {
      const tone = this.toneSettings.get(npcId) || context.tone || "formal";
      const templates = DIALOGUE_TEMPLATES[role] || DEFAULT_TEMPLATES;
      const toneTemplates = templates[tone] || templates.formal;
      if (toneTemplates.length === 0) {
        return { text: "...", tone, source: "default" };
      }
      let selectedTemplate = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
      if (memories.length > 0) {
        const recentMemory = memories[0];
        if (recentMemory.content.npcResponse) {
          const variantIndex = Math.floor(Math.random() * toneTemplates.length);
          selectedTemplate = toneTemplates[variantIndex];
        }
      }
      let text = selectedTemplate.template;
      const topic = this.extractTopic(playerMessage);
      const topicMap = {
        "cultivation": "\u4FEE\u70BC\u4E4B\u4E8B",
        "breakthrough": "\u7A81\u7834\u4E4B\u673A",
        "spirit_root": "\u7075\u6839\u4E4B\u9053",
        "pill": "\u4E39\u836F\u4E4B\u7406",
        "technique": "\u529F\u6CD5\u4E4B\u5999",
        "task": "\u4EFB\u52A1\u4E4B\u7EA6",
        "combat": "\u6218\u6597\u4E4B\u9053",
        "trade": "\u4EA4\u6613\u4E4B\u9053",
        "sparring": "\u5207\u78CB\u4E4B\u8C0A",
        "general": "\u4FEE\u884C\u4E4B\u8DEF"
      };
      text = text.replace("{topic}", topicMap[topic] || topicMap.general);
      return {
        text,
        tone,
        template: selectedTemplate.template,
        source: "template"
      };
    }
    /**
     * MCP: npc.dialogue.context
     * 获取当前对话上下文
     */
    mcpGetContext(params = {}) {
      const { npcId } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      const ctx = this.contexts.get(npcId);
      if (!ctx) {
        return {
          success: true,
          npcId,
          exists: false,
          message: "No active dialogue context"
        };
      }
      return {
        tool: "npc.dialogue.context",
        success: true,
        npcId,
        exists: true,
        context: {
          conversationHistory: ctx.conversationHistory.slice(-10),
          // 最近10条
          currentTopic: ctx.currentTopic,
          emotion: ctx.emotion,
          goal: ctx.goal,
          turnCount: ctx.turnCount,
          lastPlayerMessage: ctx.lastPlayerMessage,
          lastGeneratedDialogue: ctx.lastGeneratedDialogue,
          tone: ctx.tone,
          createdAt: ctx.createdAt,
          updatedAt: ctx.updatedAt
        }
      };
    }
    /**
     * MCP: npc.memory.retrieve
     * 检索NPC记忆
     */
    mcpRetrieveMemory(params = {}) {
      const { npcId, type, limit = 10 } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      const learningStatus = this.getNPCLearningStatus(npcId);
      const memories = this.getMemories(npcId);
      let filtered = memories;
      if (type) {
        filtered = memories.filter((m) => m.type === type);
      }
      filtered.sort((a, b) => b.importance - a.importance);
      filtered = filtered.slice(0, limit);
      for (const memory of filtered) {
        memory.access();
      }
      return {
        tool: "npc.memory.retrieve",
        success: true,
        npcId,
        memories: filtered,
        totalMemories: memories.length,
        learningStatus: learningStatus ? {
          adaptationLevel: learningStatus.adaptationLevel,
          behaviorPattern: learningStatus.behaviorPattern,
          stats: learningStatus.stats
        } : null
      };
    }
    /**
     * 获取NPC记忆
     */
    getMemories(npcId) {
      if (!this.memories.has(npcId)) {
        this.memories.set(npcId, []);
      }
      return this.memories.get(npcId);
    }
    /**
     * 记录记忆
     */
    recordMemory(npcId, type, content, metadata = {}) {
      const memories = this.getMemories(npcId);
      const entry = new NPCMemoryEntry(type, content, metadata);
      memories.push(entry);
      if (memories.length > this.maxMemoriesPerNPC) {
        memories.sort((a, b) => a.importance - b.importance);
        memories.shift();
      }
      return entry;
    }
    /**
     * 查找相关记忆
     */
    findRelevantMemories(memories, query) {
      if (memories.length === 0) return [];
      const queryWords = query.toLowerCase().split(/\s+/);
      return memories.map((memory) => {
        let relevance = 0;
        const contentStr = JSON.stringify(memory.content).toLowerCase();
        for (const word of queryWords) {
          if (contentStr.includes(word)) {
            relevance += 0.3;
          }
        }
        relevance += Math.min(memory.accessCount * 0.05, 0.3);
        relevance += memory.importance * 0.2;
        return { memory, relevance };
      }).filter((item) => item.relevance > 0.1).sort((a, b) => b.relevance - a.relevance).slice(0, 5).map((item) => item.memory);
    }
    /**
     * MCP: npc.context.update
     * 更新对话上下文
     */
    mcpUpdateContext(params = {}) {
      const { npcId, updates } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      if (!updates) {
        return { success: false, reason: "Missing updates parameter" };
      }
      const ctx = this.getOrCreateContext(npcId);
      if (updates.currentTopic !== void 0) {
        ctx.currentTopic = updates.currentTopic;
      }
      if (updates.emotion !== void 0) {
        ctx.emotion = updates.emotion;
      }
      if (updates.goal !== void 0) {
        ctx.goal = updates.goal;
      }
      if (updates.tone !== void 0) {
        ctx.tone = updates.tone;
        this.toneSettings.set(npcId, updates.tone);
      }
      ctx.updatedAt = Date.now();
      return {
        tool: "npc.context.update",
        success: true,
        npcId,
        updatedFields: Object.keys(updates),
        context: {
          currentTopic: ctx.currentTopic,
          emotion: ctx.emotion,
          goal: ctx.goal,
          tone: ctx.tone,
          turnCount: ctx.turnCount
        }
      };
    }
    /**
     * MCP: npc.dialogue.reset
     * 重置NPC对话状态
     */
    mcpResetDialogue(params = {}) {
      const { npcId, clearMemories = false } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      const ctx = this.contexts.get(npcId);
      const hadContext = !!ctx;
      if (ctx) {
        ctx.reset();
      }
      if (clearMemories) {
        this.memories.delete(npcId);
      }
      this.toneSettings.delete(npcId);
      return {
        tool: "npc.dialogue.reset",
        success: true,
        npcId,
        hadContext,
        memoriesCleared: clearMemories
      };
    }
    /**
     * MCP: npc.tone.set
     * 设置NPC对话语气
     */
    mcpSetTone(params = {}) {
      const { npcId, tone } = params;
      if (!npcId) {
        return { success: false, reason: "Missing npcId parameter" };
      }
      if (!tone) {
        return { success: false, reason: "Missing tone parameter" };
      }
      const validTones = ["formal", "casual", "mysterious"];
      if (!validTones.includes(tone)) {
        return {
          success: false,
          reason: `Invalid tone. Must be one of: ${validTones.join(", ")}`
        };
      }
      this.toneSettings.set(npcId, tone);
      const ctx = this.getOrCreateContext(npcId);
      ctx.tone = tone;
      ctx.updatedAt = Date.now();
      return {
        tool: "npc.tone.set",
        success: true,
        npcId,
        tone,
        message: `NPC ${npcId} tone set to ${tone}`
      };
    }
    /**
     * 获取服务状态
     */
    getStatus() {
      return {
        initialized: this.initialized,
        activeContexts: this.contexts.size,
        totalMemories: Array.from(this.memories.values()).reduce((sum, arr) => sum + arr.length, 0),
        toneSettings: this.toneSettings.size
      };
    }
  };
  var npcDialogueService = new NPCDialogueService();

  // src/main.js
  init_RealmEventBus();
  init_EventAnalyticsService();

  // src/systems/world/CelestialDecreeService.js
  var CELESTIAL_CONFIG = {
    // 恩宠立场范围
    FAVOR_RANGE: { min: -100, max: 100 },
    // 法旨过期时间 (ms)
    DECREE_EXPIRE_TIME: 24 * 60 * 60 * 1e3,
    // 24小时
    // 世界觉醒阈值 (功德)
    AWAKENING_MERIT_THRESHOLD: 1e4,
    // 最大法旨数量
    MAX_DECREES: 5,
    // 赐福最大数量
    MAX_BLESSINGS: 3,
    // 赐福过期时间 (ms)
    BLESSING_EXPIRE_TIME: 7 * 24 * 60 * 60 * 1e3
    // 7天
  };
  var DECREE_TYPES = {
    REWARD: "reward",
    // 奖励型
    PUNISHMENT: "punishment",
    // 惩罚型
    QUEST: "quest"
    // 任务型
  };
  var DECREE_STATUS = {
    ACTIVE: "active",
    ACCEPTED: "accepted",
    COMPLETED: "completed",
    EXPIRED: "expired",
    REJECTED: "rejected"
  };
  var AWAKENING_TYPES = {
    QI_TIDE: "qi_tide",
    // 灵气潮汐
    BEAST_RAMPAGE: "beast_rampage",
    // 妖兽暴动
    REALM_UNSEAL: "realm_unseal"
    // 秘境开启
  };
  var BLESSING_TYPES3 = {
    CULTIVATION: "cultivation",
    // 修为加成
    MERIT: "merit",
    // 功德加成
    PROTECTION: "protection",
    // 护体
    REVELATION: "revelation"
    // 天机启示
  };
  var CelestialDecree = class {
    constructor(type, title, description, options = {}) {
      this.id = `decree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = type;
      this.title = title;
      this.description = description;
      this.status = options.status || DECREE_STATUS.ACTIVE;
      this.favorImpact = options.favorImpact || 0;
      this.reward = options.reward || null;
      this.penalty = options.penalty || null;
      this.expiresAt = options.expiresAt || Date.now() + CELESTIAL_CONFIG.DECREE_EXPIRE_TIME;
      this.createdAt = Date.now();
      this.acceptedAt = options.acceptedAt || null;
      this.completedAt = options.completedAt || null;
      this.questTarget = options.questTarget || null;
      this.questProgress = 0;
    }
    /**
     * 是否已过期
     */
    isExpired() {
      return Date.now() > this.expiresAt;
    }
    /**
     * 获取剩余时间 (ms)
     */
    getRemainingTime() {
      return Math.max(0, this.expiresAt - Date.now());
    }
    /**
     * 接受法旨
     */
    accept() {
      if (this.status !== DECREE_STATUS.ACTIVE) {
        return { success: false, error: "Decree is not active" };
      }
      this.status = DECREE_STATUS.ACCEPTED;
      this.acceptedAt = Date.now();
      return { success: true };
    }
    /**
     * 完成法旨
     */
    complete() {
      if (this.status !== DECREE_STATUS.ACCEPTED) {
        return { success: false, error: "Decree is not accepted" };
      }
      this.status = DECREE_STATUS.COMPLETED;
      this.completedAt = Date.now();
      return { success: true };
    }
    /**
     * 更新任务进度
     */
    updateProgress(progress) {
      this.questProgress = Math.min(progress, this.questTarget || progress);
      return { success: true, progress: this.questProgress };
    }
  };
  var CelestialBlessing = class {
    constructor(type, title, description, options = {}) {
      this.id = `blessing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = type;
      this.title = title;
      this.description = description;
      this.claimed = false;
      this.claimedAt = null;
      this.effect = options.effect || null;
      this.expiresAt = options.expiresAt || Date.now() + CELESTIAL_CONFIG.BLESSING_EXPIRE_TIME;
      this.createdAt = Date.now();
      this.favorRequired = options.favorRequired || 0;
    }
    /**
     * 是否已过期
     */
    isExpired() {
      return Date.now() > this.expiresAt;
    }
    /**
     * 领取赐福
     */
    claim() {
      if (this.claimed) {
        return { success: false, error: "Blessing already claimed" };
      }
      if (this.isExpired()) {
        return { success: false, error: "Blessing has expired" };
      }
      this.claimed = true;
      this.claimedAt = Date.now();
      return { success: true };
    }
  };
  var WorldAwakening = class {
    constructor(type, title, description, options = {}) {
      this.id = `awakening_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.type = type;
      this.title = title;
      this.description = description;
      this.triggeredAt = null;
      this.meritRequired = options.meritRequired || CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD;
      this.rewards = options.rewards || null;
      this.duration = options.duration || 36e5;
      this.active = false;
      this.endsAt = null;
    }
    /**
     * 触发觉醒
     */
    trigger() {
      if (this.active) {
        return { success: false, error: "Awakening already active" };
      }
      this.active = true;
      this.triggeredAt = Date.now();
      this.endsAt = Date.now() + this.duration;
      return { success: true };
    }
    /**
     * 是否已结束
     */
    isEnded() {
      return this.active && Date.now() > this.endsAt;
    }
    /**
     * 获取剩余时间
     */
    getRemainingTime() {
      if (!this.active) return 0;
      return Math.max(0, this.endsAt - Date.now());
    }
  };
  var CelestialDecreeService = class {
    constructor() {
      this.decrees = [];
      this.blessings = [];
      this.awakenings = [];
      this.favor = 0;
      this.totalMerit = 0;
      this.gameState = null;
      this.lastDecreeTime = 0;
      this.decreeInterval = 36e5;
    }
    /**
     * 初始化服务
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.celestial) {
        gameState3.celestial = {
          decrees: [],
          blessings: [],
          awakenings: [],
          favor: 0,
          totalMerit: 0
        };
      }
      this.decrees = gameState3.celestial.decrees || [];
      this.blessings = gameState3.celestial.blessings || [];
      this.awakenings = gameState3.celestial.awakenings || [];
      this.favor = gameState3.celestial.favor || 0;
      this.totalMerit = gameState3.celestial.totalMerit || 0;
      console.log("[CelestialDecree] \u5929\u9053\u610F\u5FD7\u7CFB\u7EDF\u521D\u59CB\u5316\u5B8C\u6210");
      return { success: true };
    }
    /**
     * 保存状态到游戏状态
     */
    saveState() {
      if (!this.gameState) return;
      this.gameState.celestial = {
        decrees: this.decrees,
        blessings: this.blessings,
        awakenings: this.awakenings,
        favor: this.favor,
        totalMerit: this.totalMerit
      };
    }
    // ===== 法旨管理 =====
    /**
     * 生成随机法旨
     */
    generateDecree() {
      const types = [DECREE_TYPES.REWARD, DECREE_TYPES.PUNISHMENT, DECREE_TYPES.QUEST];
      const type = types[Math.floor(Math.random() * types.length)];
      const decrees = {
        [DECREE_TYPES.REWARD]: [
          { title: "\u5929\u8D50\u7075\u6839", description: "\u5929\u9053\u8D50\u4E88\u4F60\u4E00\u682A\u4E0A\u54C1\u7075\u8349", favorImpact: 10, reward: { type: "herb", name: "\u4E0A\u54C1\u7075\u8349", quantity: 1 } },
          { title: "\u798F\u6CFD\u6DF1\u539A", description: "\u4F60\u7684\u5584\u884C\u611F\u52A8\u5929\u9053\uFF0C\u83B7\u5F97\u529F\u5FB7\u52A0\u6301", favorImpact: 15, reward: { type: "merit", amount: 500 } },
          { title: "\u987F\u609F\u5951\u673A", description: "\u5929\u673A\u663E\u73B0\uFF0C\u4F60\u83B7\u5F97\u4FEE\u70BC\u9886\u609F", favorImpact: 20, reward: { type: "cultivation", amount: 1e3 } }
        ],
        [DECREE_TYPES.PUNISHMENT]: [
          { title: "\u5929\u8C34\u9884\u8B66", description: "\u4F60\u7684\u884C\u4E3A\u5F15\u8D77\u5929\u9053\u6CE8\u610F\uFF0C\u9700\u8981\u5FCF\u6094", favorImpact: -15, penalty: { type: "cultivation", amount: 500 } },
          { title: "\u4E1A\u706B\u964D\u4E34", description: "\u5929\u52AB\u4E1A\u706B\u711A\u8EAB\uFF0C\u4FEE\u4E3A\u53D7\u635F", favorImpact: -20, penalty: { type: "cultivation", amount: 1e3 } },
          { title: "\u6C14\u8FD0\u6D41\u5931", description: "\u5929\u9053\u6536\u56DE\u90E8\u5206\u6C14\u8FD0", favorImpact: -10, penalty: { type: "qi", amount: 300 } }
        ],
        [DECREE_TYPES.QUEST]: [
          { title: "\u9664\u9B54\u536B\u9053", description: "\u65A9\u6740\u4E00\u5934\u5996\u517D\uFF0C\u8BC1\u660E\u4F60\u7684\u5B9E\u529B", favorImpact: 25, questTarget: 1, reward: { type: "merit", amount: 1e3 } },
          { title: "\u6D4E\u4E16\u6551\u4EBA", description: "\u6551\u6CBB10\u4F4D\u82E6\u96BE\u51E1\u4EBA", favorImpact: 30, questTarget: 10, reward: { type: "merit", amount: 2e3 } },
          { title: "\u62A4\u9053\u9664\u90AA", description: "\u6E05\u9664\u4E00\u4E2A\u90AA\u4FEE\u5DE2\u7A74", favorImpact: 35, questTarget: 1, reward: { type: "equipment", name: "\u5929\u9053\u7B26\u7B93", quantity: 1 } }
        ]
      };
      const options = decrees[type][Math.floor(Math.random() * decrees[type].length)];
      if (this.decrees.length >= CELESTIAL_CONFIG.MAX_DECREES) {
        this.cleanupDecrees();
        if (this.decrees.length >= CELESTIAL_CONFIG.MAX_DECREES) {
          return null;
        }
      }
      const decree = new CelestialDecree(type, options.title, options.description, {
        favorImpact: options.favorImpact,
        reward: options.reward,
        penalty: options.penalty,
        questTarget: options.questTarget
      });
      this.decrees.push(decree);
      this.saveState();
      return decree;
    }
    /**
     * 清理过期法旨
     */
    cleanupDecrees() {
      const before = this.decrees.length;
      this.decrees = this.decrees.filter((d) => !d.isExpired() || d.status === DECREE_STATUS.ACCEPTED);
      return { removed: before - this.decrees.length };
    }
    /**
     * 获取法旨列表
     */
    listDecrees(options = {}) {
      this.cleanupDecrees();
      let result = [...this.decrees];
      if (options.status) {
        result = result.filter((d) => d.status === options.status);
      }
      if (options.type) {
        result = result.filter((d) => d.type === options.type);
      }
      result.sort((a, b) => b.createdAt - a.createdAt);
      return {
        success: true,
        decrees: result.map((d) => ({
          id: d.id,
          type: d.type,
          title: d.title,
          description: d.description,
          status: d.status,
          favorImpact: d.favorImpact,
          reward: d.reward,
          penalty: d.penalty,
          questTarget: d.questTarget,
          questProgress: d.questProgress,
          remainingTime: d.getRemainingTime(),
          createdAt: d.createdAt
        })),
        total: result.length
      };
    }
    /**
     * 接受法旨
     */
    acceptDecree(decreeId) {
      const decree = this.decrees.find((d) => d.id === decreeId);
      if (!decree) {
        return { success: false, error: "Decree not found" };
      }
      if (decree.status !== DECREE_STATUS.ACTIVE) {
        return { success: false, error: `Decree is ${decree.status}, cannot accept` };
      }
      if (decree.isExpired()) {
        decree.status = DECREE_STATUS.EXPIRED;
        this.saveState();
        return { success: false, error: "Decree has expired" };
      }
      const result = decree.accept();
      if (result.success) {
        this.saveState();
      }
      return {
        ...result,
        decree: {
          id: decree.id,
          type: decree.type,
          title: decree.title,
          status: decree.status
        }
      };
    }
    /**
     * 完成法旨任务
     */
    completeDecreeQuest(decreeId, progress) {
      const decree = this.decrees.find((d) => d.id === decreeId);
      if (!decree) {
        return { success: false, error: "Decree not found" };
      }
      if (decree.status !== DECREE_STATUS.ACCEPTED) {
        return { success: false, error: "Decree is not accepted" };
      }
      if (!decree.questTarget) {
        return { success: false, error: "Decree is not a quest type" };
      }
      decree.updateProgress(progress);
      this.saveState();
      if (progress >= decree.questTarget) {
        const completeResult = decree.complete();
        if (completeResult.success) {
          this.applyDecreeEffect(decree);
          this.adjustFavor(decree.favorImpact, `\u6CD5\u65E8\u5B8C\u6210: ${decree.title}`);
        }
      }
      return {
        success: true,
        progress: decree.questProgress,
        target: decree.questTarget,
        completed: progress >= decree.questTarget
      };
    }
    /**
     * 应用法旨效果
     */
    applyDecreeEffect(decree) {
      if (decree.reward) {
        this.applyReward(decree.reward);
      }
      if (decree.penalty) {
        this.applyPenalty(decree.penalty);
      }
    }
    /**
     * 应用奖励
     */
    applyReward(reward) {
      if (!this.gameState) return;
      switch (reward.type) {
        case "herb":
        case "equipment":
          if (!this.gameState.inventory.items) {
            this.gameState.inventory.items = [];
          }
          this.gameState.inventory.items.push({
            name: reward.name,
            type: reward.type,
            quantity: reward.quantity || 1,
            quality: "\u7CBE\u826F"
          });
          break;
        case "merit":
          this.addMerit(reward.amount);
          break;
        case "cultivation":
          this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + reward.amount;
          break;
      }
    }
    /**
     * 应用惩罚
     */
    applyPenalty(penalty) {
      if (!this.gameState) return;
      switch (penalty.type) {
        case "cultivation":
          this.gameState.cultivationXP = Math.max(0, (this.gameState.cultivationXP || 0) - penalty.amount);
          break;
        case "qi":
          this.gameState.player.qi = Math.max(0, (this.gameState.player.qi || 0) - penalty.amount);
          break;
      }
    }
    // ===== 恩宠管理 =====
    /**
     * 查询恩宠值
     */
    queryFavor() {
      const stance = this.getFavorStance();
      return {
        success: true,
        favor: this.favor,
        stance,
        range: CELESTIAL_CONFIG.FAVOR_RANGE
      };
    }
    /**
     * 获取恩宠立场描述
     */
    getFavorStance() {
      if (this.favor >= 80) return "\u5929\u9053\u7737\u987E";
      if (this.favor >= 50) return "\u9887\u53D7\u7737\u987E";
      if (this.favor >= 20) return "\u7565\u6709\u7737\u987E";
      if (this.favor >= -20) return "\u4E2D\u7ACB";
      if (this.favor >= -50) return "\u7565\u6709\u538C\u5F03";
      if (this.favor >= -80) return "\u9887\u53D7\u538C\u5F03";
      return "\u5929\u9053\u538C\u5F03";
    }
    /**
     * 调整恩宠值
     */
    adjustFavor(amount, reason = "") {
      const oldFavor = this.favor;
      this.favor = Math.max(
        CELESTIAL_CONFIG.FAVOR_RANGE.min,
        Math.min(CELESTIAL_CONFIG.FAVOR_RANGE.max, this.favor + amount)
      );
      this.saveState();
      return {
        success: true,
        oldFavor,
        newFavor: this.favor,
        change: amount,
        reason,
        newStance: this.getFavorStance()
      };
    }
    // ===== 世界觉醒 =====
    /**
     * 检查是否可以触发世界觉醒
     */
    canTriggerAwakening() {
      return this.totalMerit >= CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD;
    }
    /**
     * 触发世界觉醒
     */
    triggerAwakening(type) {
      const activeAwakening = this.awakenings.find((a) => a.active && !a.isEnded());
      if (activeAwakening) {
        return {
          success: false,
          error: "A world awakening is already active",
          activeAwakening: {
            id: activeAwakening.id,
            type: activeAwakening.type,
            title: activeAwakening.title,
            remainingTime: activeAwakening.getRemainingTime()
          }
        };
      }
      if (!this.canTriggerAwakening()) {
        return {
          success: false,
          error: "Merit threshold not reached",
          currentMerit: this.totalMerit,
          requiredMerit: CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD
        };
      }
      const awakeningConfigs = {
        [AWAKENING_TYPES.QI_TIDE]: {
          title: "\u7075\u6C14\u6F6E\u6C50",
          description: "\u5929\u5730\u7075\u6C14\u6D8C\u52A8\uFF0C\u4FEE\u70BC\u6548\u7387\u5927\u5E45\u63D0\u5347",
          rewards: { cultivationBonus: 2 },
          duration: 36e5
        },
        [AWAKENING_TYPES.BEAST_RAMPAGE]: {
          title: "\u5996\u517D\u66B4\u52A8",
          description: "\u5996\u517D\u7FA4\u8D77\u66B4\u52A8\uFF0C\u51FB\u6740\u53EF\u83B7\u5927\u91CF\u529F\u5FB7",
          rewards: { meritBonus: 1.5, expBonus: 1.5 },
          duration: 72e5
        },
        [AWAKENING_TYPES.REALM_UNSEAL]: {
          title: "\u79D8\u5883\u5F00\u542F",
          description: "\u4E0A\u53E4\u79D8\u5883\u73B0\u4E16\uFF0C\u5185\u6709\u65E0\u9650\u673A\u7F18",
          rewards: { artifactBonus: 3, treasureChance: 0.5 },
          duration: 36e5
        }
      };
      const config = awakeningConfigs[type];
      if (!config) {
        return { success: false, error: "Invalid awakening type" };
      }
      const awakening = new WorldAwakening(type, config.title, config.description, {
        rewards: config.rewards,
        duration: config.duration
      });
      const result = awakening.trigger();
      if (result.success) {
        this.awakenings.push(awakening);
        this.saveState();
      }
      return {
        ...result,
        awakening: {
          id: awakening.id,
          type: awakening.type,
          title: awakening.title,
          description: awakening.description,
          remainingTime: awakening.getRemainingTime()
        }
      };
    }
    /**
     * 获取世界觉醒状态
     */
    getAwakeningStatus() {
      const activeAwakening = this.awakenings.find((a) => a.active && !a.isEnded());
      return {
        success: true,
        activeAwakening: activeAwakening ? {
          id: activeAwakening.id,
          type: activeAwakening.type,
          title: activeAwakening.title,
          description: activeAwakening.description,
          rewards: activeAwakening.rewards,
          remainingTime: activeAwakening.getRemainingTime(),
          endsAt: activeAwakening.endsAt
        } : null,
        currentMerit: this.totalMerit,
        meritThreshold: CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD,
        canAwakening: this.canTriggerAwakening() ? true : false,
        availableTypes: Object.keys(AWAKENING_TYPES)
      };
    }
    /**
     * 更新世界觉醒状态
     */
    updateAwakenings() {
      for (const awakening of this.awakenings) {
        if (awakening.active && awakening.isEnded()) {
          awakening.active = false;
        }
      }
      this.saveState();
    }
    // ===== 天道赐福 =====
    /**
     * 生成赐福
     */
    generateBlessing() {
      if (this.blessings.length >= CELESTIAL_CONFIG.MAX_BLESSINGS) {
        return null;
      }
      const blessingTemplates = [
        { type: BLESSING_TYPES3.CULTIVATION, title: "\u5929\u9053\u52A0\u6301", description: "\u4FEE\u70BC\u901F\u5EA6\u63D0\u534750%", favorRequired: 30, effect: { cultivationSpeed: 1.5 } },
        { type: BLESSING_TYPES3.MERIT, title: "\u529F\u5FB7\u704C\u9876", description: "\u83B7\u53D6\u529F\u5FB7\u65F6\u83B7\u5F97\u989D\u591620%\u52A0\u6210", favorRequired: 50, effect: { meritBonus: 1.2 } },
        { type: BLESSING_TYPES3.PROTECTION, title: "\u5929\u9053\u62A4\u4F53", description: "\u53D7\u5230\u81F4\u547D\u4F24\u5BB3\u65F6\u514D\u9664\u4E00\u6B21", favorRequired: 40, effect: { surviveFatal: true } },
        { type: BLESSING_TYPES3.REVELATION, title: "\u5929\u673A\u542F\u793A", description: "\u4E0B\u4E00\u6B21\u7A81\u7834\u6210\u529F\u7387\u63D0\u534730%", favorRequired: 20, effect: { breakthroughBonus: 0.3 } }
      ];
      const available = blessingTemplates.filter((b) => this.favor >= b.favorRequired);
      if (available.length === 0) return null;
      const template = available[Math.floor(Math.random() * available.length)];
      const blessing = new CelestialBlessing(template.type, template.title, template.description, {
        effect: template.effect,
        favorRequired: template.favorRequired
      });
      this.blessings.push(blessing);
      this.saveState();
      return blessing;
    }
    /**
     * 领取赐福
     */
    claimBlessing(blessingId) {
      const blessing = this.blessings.find((b) => b.id === blessingId);
      if (!blessing) {
        return { success: false, error: "Blessing not found" };
      }
      if (this.favor < blessing.favorRequired) {
        return {
          success: false,
          error: "Favor level too low",
          required: blessing.favorRequired,
          current: this.favor
        };
      }
      const result = blessing.claim();
      if (result.success) {
        this.applyBlessingEffect(blessing);
        this.saveState();
      }
      return {
        ...result,
        blessing: {
          id: blessing.id,
          type: blessing.type,
          title: blessing.title
        }
      };
    }
    /**
     * 应用赐福效果
     */
    applyBlessingEffect(blessing) {
      if (!this.gameState) return;
      if (!this.gameState.blessings) {
        this.gameState.blessings = [];
      }
      this.gameState.blessings.push({
        id: blessing.id,
        type: blessing.type,
        title: blessing.title,
        effect: blessing.effect,
        expiresAt: blessing.expiresAt
      });
    }
    /**
     * 获取可用赐福列表
     */
    listBlessings(options = {}) {
      const validBlessings = this.blessings.filter((b) => !b.claimed && !b.isExpired());
      let result = [...validBlessings];
      if (options.unclaimedOnly) {
        result = result.filter((b) => !b.claimed);
      }
      result.sort((a, b) => b.favorRequired - a.favorRequired);
      return {
        success: true,
        blessings: result.map((b) => ({
          id: b.id,
          type: b.type,
          title: b.title,
          description: b.description,
          effect: b.effect,
          favorRequired: b.favorRequired,
          claimed: b.claimed,
          remainingTime: typeof b.getRemainingTime === "function" ? b.getRemainingTime() : 0,
          createdAt: b.createdAt
        })),
        total: result.length
      };
    }
    // ===== 功德管理 =====
    /**
     * 添加功德
     */
    addMerit(amount) {
      this.totalMerit += amount;
      this.saveState();
      return { success: true, totalMerit: this.totalMerit };
    }
    /**
     * 消耗功德
     */
    consumeMerit(amount) {
      if (this.totalMerit < amount) {
        return { success: false, error: "Insufficient merit" };
      }
      this.totalMerit -= amount;
      this.saveState();
      return { success: true, totalMerit: this.totalMerit };
    }
    /**
     * 获取功德状态
     */
    getMeritStatus() {
      return {
        success: true,
        totalMerit: this.totalMerit,
        awakeningThreshold: CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD,
        canAwakening: this.canTriggerAwakening()
      };
    }
    // ===== 定期生成 =====
    /**
     * 尝试生成新的法旨
     */
    tryGenerateDecree() {
      const now = Date.now();
      if (now - this.lastDecreeTime < this.decreeInterval) {
        return { success: false, error: "Too soon to generate new decree" };
      }
      const decree = this.generateDecree();
      if (decree) {
        this.lastDecreeTime = now;
        return {
          success: true,
          decree: {
            id: decree.id,
            type: decree.type,
            title: decree.title,
            description: decree.description
          }
        };
      }
      return { success: false, error: "Could not generate decree" };
    }
    /**
     * 尝试生成赐福
     */
    tryGenerateBlessing() {
      const blessing = this.generateBlessing();
      if (blessing) {
        return {
          success: true,
          blessing: {
            id: blessing.id,
            type: blessing.type,
            title: blessing.title,
            description: blessing.description
          }
        };
      }
      return { success: false, error: "Could not generate blessing" };
    }
    /**
     * 重置服务
     */
    reset() {
      this.decrees = [];
      this.blessings = [];
      this.awakenings = [];
      this.favor = 0;
      this.totalMerit = 0;
      this.lastDecreeTime = 0;
      this.saveState();
      return { success: true };
    }
    /**
     * 获取统计信息
     */
    getStats() {
      this.updateAwakenings();
      return {
        success: true,
        favor: this.favor,
        stance: this.getFavorStance(),
        totalMerit: this.totalMerit,
        decreeCount: this.decrees.length,
        activeDecreeCount: this.decrees.filter((d) => d.status === DECREE_STATUS.ACTIVE || d.status === DECREE_STATUS.ACCEPTED).length,
        blessingCount: this.blessings.length,
        unclaimedBlessingCount: this.blessings.filter((b) => !b.claimed).length,
        awakeningActive: this.awakenings.some((a) => a.active && !a.isEnded()),
        canAwakening: this.canTriggerAwakening()
      };
    }
  };
  var celestialDecreeService = new CelestialDecreeService();

  // src/systems/ranking/HeavenRankService.js
  var HEAVEN_RANK_CONFIG = {
    // 榜单类型
    RANK_TYPES: {
      POWER: "power",
      // 战力榜
      WEALTH: "wealth",
      // 财富榜
      KARMA: "karma",
      // 功德榜
      REALM: "realm"
      // 境界榜
    },
    // 榜单容量
    MAX_RANK_SIZE: 100,
    // 历史记录数量
    MAX_HISTORY_RECORDS: 50,
    // 排名变化通知阈值
    RANK_CHANGE_THRESHOLD: 5,
    // 排名变化超过5位时通知
    // 挑战冷却时间 (ms)
    CHALLENGE_COOLDOWN: 60 * 60 * 1e3,
    // 1小时
    // 奖励结算周期 (ms) - 每周
    REWARD_CYCLE: 7 * 24 * 60 * 60 * 1e3,
    // 连续上榜加成阈值
    CONSECUTIVE_BONUS_THRESHOLD: 4
    // 连续上榜4周以上获得加成
  };
  var RANK_REWARD_TIERS = [
    { minRank: 1, maxRank: 1, baseReward: 1e4, title: "\u5929\u673A\u699C\u9996" },
    { minRank: 2, maxRank: 2, baseReward: 5e3, title: "\u5929\u673A\u699C\u699C\u773C" },
    { minRank: 3, maxRank: 3, baseReward: 3e3, title: "\u5929\u673A\u699C\u63A2\u82B1" },
    { minRank: 4, maxRank: 10, baseReward: 1e3, title: "\u5929\u673A\u699C\u9AD8\u624B" },
    { minRank: 11, maxRank: 50, baseReward: 500, title: "\u5929\u673A\u699C\u4FEE\u58EB" },
    { minRank: 51, maxRank: 100, baseReward: 100, title: "\u5929\u673A\u699C\u65B0\u4EBA" }
  ];
  var HeavenRankEntry = class {
    constructor(playerId, playerName, rankType, value) {
      this.id = `rank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.playerId = playerId;
      this.playerName = playerName;
      this.rankType = rankType;
      this.value = value;
      this.rank = 0;
      this.previousRank = 0;
      this.changeAmount = 0;
      this.consecutiveWeeks = 1;
      this.highestRank = 0;
      this.lastUpdated = Date.now();
    }
    /**
     * 更新排名
     */
    updateRank(newRank, newValue) {
      this.previousRank = this.rank || newRank;
      this.rank = newRank;
      this.value = newValue;
      this.changeAmount = this.previousRank - newRank;
      this.lastUpdated = Date.now();
      if (newRank > 0 && (this.highestRank === 0 || newRank < this.highestRank)) {
        this.highestRank = newRank;
      }
    }
    /**
     * 增加连续上榜周数
     */
    incrementConsecutiveWeeks() {
      this.consecutiveWeeks++;
    }
    /**
     * 重置连续上榜周数
     */
    resetConsecutiveWeeks() {
      this.consecutiveWeeks = 1;
    }
    /**
     * 获取变化描述
     */
    getChangeDescription() {
      if (this.changeAmount > 0) {
        return `\u2191${this.changeAmount}`;
      } else if (this.changeAmount < 0) {
        return `\u2193${Math.abs(this.changeAmount)}`;
      }
      return "\u2014";
    }
  };
  var HeavenRankHistory = class {
    constructor(playerId, rankType) {
      this.id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.playerId = playerId;
      this.rankType = rankType;
      this.records = [];
    }
    /**
     * 添加历史记录
     */
    addRecord(rank, value) {
      const week = this.getWeekNumber();
      this.records.push({
        week,
        rank,
        value,
        timestamp: Date.now()
      });
      if (this.records.length > HEAVEN_RANK_CONFIG.MAX_HISTORY_RECORDS) {
        this.records.shift();
      }
    }
    /**
     * 获取周数
     */
    getWeekNumber() {
      const now = /* @__PURE__ */ new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(((now - startOfYear) / 864e5 + startOfYear.getDay() + 1) / 7);
      return weekNumber;
    }
    /**
     * 获取排名趋势
     */
    getTrend() {
      if (this.records.length < 2) return "stable";
      const recent = this.records.slice(-5);
      const firstRank = recent[0].rank;
      const lastRank = recent[recent.length - 1].rank;
      if (lastRank < firstRank) return "rising";
      if (lastRank > firstRank) return "falling";
      return "stable";
    }
  };
  var HeavenRankReward = class {
    constructor(week, rankType, tier) {
      this.id = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.week = week;
      this.rankType = rankType;
      this.tier = tier;
      this.claimed = false;
      this.claimedAt = null;
      this.createdAt = Date.now();
    }
    /**
     * 领取奖励
     */
    claim() {
      if (this.claimed) {
        return { success: false, error: "Reward already claimed" };
      }
      this.claimed = true;
      this.claimedAt = Date.now();
      return { success: true };
    }
    /**
     * 计算实际奖励（含连续上榜加成）
     */
    calculateActualReward(consecutiveWeeks) {
      let multiplier = 1;
      if (consecutiveWeeks >= HEAVEN_RANK_CONFIG.CONSECUTIVE_BONUS_THRESHOLD) {
        multiplier = 1 + (consecutiveWeeks - HEAVEN_RANK_CONFIG.CONSECUTIVE_BONUS_THRESHOLD + 1) * 0.1;
        multiplier = Math.min(multiplier, 2);
      }
      return Math.floor(this.tier.baseReward * multiplier);
    }
  };
  var HeavenRankService = class {
    constructor() {
      this.gameState = null;
      this.initialized = false;
      this.powerRank = [];
      this.wealthRank = [];
      this.karmaRank = [];
      this.realmRank = [];
      this.history = {};
      this.pendingRewards = [];
      this.challengeRecords = {};
      this.lastSettlementTime = Date.now();
    }
    /**
     * 初始化服务
     */
    init(gameState3) {
      this.gameState = gameState3;
      if (!gameState3.heavenRank) {
        gameState3.heavenRank = {
          powerRank: [],
          wealthRank: [],
          karmaRank: [],
          realmRank: [],
          history: {},
          pendingRewards: [],
          challengeRecords: {},
          lastSettlementTime: Date.now(),
          lastRankUpdateTime: Date.now()
        };
      }
      this.powerRank = gameState3.heavenRank.powerRank.map((e) => Object.assign(new HeavenRankEntry(e.playerId, e.playerName, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, e.value), e));
      this.wealthRank = gameState3.heavenRank.wealthRank.map((e) => Object.assign(new HeavenRankEntry(e.playerId, e.playerName, HEAVEN_RANK_CONFIG.RANK_TYPES.WEALTH, e.value), e));
      this.karmaRank = gameState3.heavenRank.karmaRank.map((e) => Object.assign(new HeavenRankEntry(e.playerId, e.playerName, HEAVEN_RANK_CONFIG.RANK_TYPES.KARMA, e.value), e));
      this.realmRank = gameState3.heavenRank.realmRank.map((e) => Object.assign(new HeavenRankEntry(e.playerId, e.playerName, HEAVEN_RANK_CONFIG.RANK_TYPES.REALM, e.value), e));
      this.history = {};
      for (const [key, h] of Object.entries(gameState3.heavenRank.history || {})) {
        this.history[key] = Object.assign(new HeavenRankHistory(h.playerId, h.rankType), h);
      }
      this.pendingRewards = (gameState3.heavenRank.pendingRewards || []).map((r) => Object.assign(new HeavenRankReward(r.week, r.rankType, RANK_REWARD_TIERS.find((t) => t.minRank <= r.rank && r.rank <= t.maxRank) || RANK_REWARD_TIERS[5]), r));
      this.challengeRecords = gameState3.heavenRank.challengeRecords || {};
      this.lastSettlementTime = gameState3.heavenRank.lastSettlementTime || Date.now();
      this.initialized = true;
      return { success: true };
    }
    /**
     * 保存状态
     */
    saveState() {
      if (!this.gameState || !this.gameState.heavenRank) return;
      this.gameState.heavenRank.powerRank = this.powerRank;
      this.gameState.heavenRank.wealthRank = this.wealthRank;
      this.gameState.heavenRank.karmaRank = this.realmRank;
      this.gameState.heavenRank.realmRank = this.realmRank;
      this.gameState.heavenRank.history = this.history;
      this.gameState.heavenRank.pendingRewards = this.pendingRewards;
      this.gameState.heavenRank.challengeRecords = this.challengeRecords;
      this.gameState.heavenRank.lastSettlementTime = this.lastSettlementTime;
      this.gameState.heavenRank.lastRankUpdateTime = Date.now();
    }
    /**
     * 获取榜单
     */
    getRank(rankType) {
      switch (rankType) {
        case HEAVEN_RANK_CONFIG.RANK_TYPES.POWER:
          return this.powerRank;
        case HEAVEN_RANK_CONFIG.RANK_TYPES.WEALTH:
          return this.wealthRank;
        case HEAVEN_RANK_CONFIG.RANK_TYPES.KARMA:
          return this.karmaRank;
        case HEAVEN_RANK_CONFIG.RANK_TYPES.REALM:
          return this.realmRank;
        default:
          return [];
      }
    }
    /**
     * 获取玩家排名
     */
    getPlayerRank(playerId, rankType) {
      const rank = this.getRank(rankType);
      return rank.findIndex((e) => e.playerId === playerId) + 1;
    }
    /**
     * 更新玩家排名
     */
    updatePlayerRank(playerId, playerName, rankType, value) {
      const rank = this.getRank(rankType);
      const existingEntry = rank.find((e) => e.playerId === playerId);
      if (existingEntry) {
        const newRank = this.calculateNewRank(rank, playerId, value);
        existingEntry.updateRank(newRank, value);
      } else {
        const newEntry = new HeavenRankEntry(playerId, playerName, rankType, value);
        this.addToRank(rank, newEntry);
      }
      this.saveState();
    }
    /**
     * 计算新排名
     */
    calculateNewRank(rank, playerId, newValue) {
      let newRank = 1;
      for (const entry of rank) {
        if (entry.playerId === playerId) continue;
        if (entry.value >= newValue) {
          newRank++;
        }
      }
      return newRank;
    }
    /**
     * 添加到榜单
     */
    addToRank(rank, entry) {
      const insertIndex = rank.findIndex((e) => e.value < entry.value);
      if (insertIndex >= 0) {
        rank.splice(insertIndex, 0, entry);
      } else {
        rank.push(entry);
      }
      rank.forEach((e, i) => {
        e.rank = i + 1;
      });
      while (rank.length > HEAVEN_RANK_CONFIG.MAX_RANK_SIZE) {
        rank.pop();
      }
    }
    /**
     * 获取玩家历史
     */
    getPlayerHistory(playerId, rankType) {
      const key = `${playerId}_${rankType}`;
      return this.history[key] || null;
    }
    /**
     * 记录玩家历史
     */
    recordPlayerHistory(playerId, rankType, rank, value) {
      const key = `${playerId}_${rankType}`;
      if (!this.history[key]) {
        this.history[key] = new HeavenRankHistory(playerId, rankType);
      }
      this.history[key].addRecord(rank, value);
      this.saveState();
    }
    /**
     * 获取排名奖励
     */
    getRewardForRank(rank) {
      return RANK_REWARD_TIERS.find((t) => rank >= t.minRank && rank <= t.maxRank) || RANK_REWARD_TIERS[RANK_REWARD_TIERS.length - 1];
    }
    /**
     * 生成待领取奖励
     */
    generatePendingRewards() {
      const currentWeek = this.getWeekNumber();
      for (const rankType of Object.values(HEAVEN_RANK_CONFIG.RANK_TYPES)) {
        const rank = this.getRank(rankType);
        for (let i = 0; i < rank.length; i++) {
          const entry = rank[i];
          const tier = this.getRewardForRank(entry.rank);
          const existingReward = this.pendingRewards.find(
            (r) => r.week === currentWeek && r.rankType === rankType && r.tier.minRank === tier.minRank
          );
          if (!existingReward) {
            const reward = new HeavenRankReward(currentWeek, rankType, tier);
            this.pendingRewards.push(reward);
          }
        }
      }
      this.saveState();
    }
    /**
     * 获取周数
     */
    getWeekNumber() {
      const now = /* @__PURE__ */ new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return Math.ceil(((now - startOfYear) / 864e5 + startOfYear.getDay() + 1) / 7);
    }
    /**
     * 检查挑战冷却
     */
    isChallengeOnCooldown(playerId, targetPlayerId) {
      const key = `${playerId}_${targetPlayerId}`;
      const lastChallenge = this.challengeRecords[key];
      if (!lastChallenge) return false;
      const cooldownRemaining = HEAVEN_RANK_CONFIG.CHALLENGE_COOLDOWN - (Date.now() - lastChallenge);
      return cooldownRemaining > 0;
    }
    /**
     * 获取挑战冷却剩余时间
     */
    getChallengeCooldown(playerId, targetPlayerId) {
      const key = `${playerId}_${targetPlayerId}`;
      const lastChallenge = this.challengeRecords[key];
      if (!lastChallenge) return 0;
      const cooldownRemaining = HEAVEN_RANK_CONFIG.CHALLENGE_COOLDOWN - (Date.now() - lastChallenge);
      return Math.max(0, cooldownRemaining);
    }
    /**
     * 记录挑战
     */
    recordChallenge(playerId, targetPlayerId) {
      const key = `${playerId}_${targetPlayerId}`;
      this.challengeRecords[key] = Date.now();
      this.saveState();
    }
    /**
     * 检测排名剧烈变化
     */
    detectRankVolatility(playerId, rankType) {
      const history = this.getPlayerHistory(playerId, rankType);
      if (!history || history.records.length < 3) {
        return { volatile: false, changes: [] };
      }
      const recent = history.records.slice(-5);
      const changes = [];
      for (let i = 1; i < recent.length; i++) {
        const change = recent[i - 1].rank - recent[i].rank;
        if (Math.abs(change) >= HEAVEN_RANK_CONFIG.RANK_CHANGE_THRESHOLD) {
          changes.push({
            from: recent[i - 1].rank,
            to: recent[i].rank,
            change,
            week: recent[i].week
          });
        }
      }
      return {
        volatile: changes.length >= 2,
        changes
      };
    }
  };
  var heavenRankService = new HeavenRankService();

  // src/main.js
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
      gameVersion: "V250",
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
    domainModules.reincarnationBook = reincarnationBookService;
    reincarnationBookService.init(gameState2);
    dharmaFruitService.init(gameState2);
    domainModules.dharmaFruit = dharmaFruitService;
    domainModules.talentTree = new TalentTreeService(gameState2);
    alchemyKBService.init(gameState2);
    domainModules.alchemyKB = alchemyKBService;
    herbDiscoveryService.init(gameState2);
    domainModules.herbDiscovery = herbDiscoveryService;
    ascensionService.init(gameState2);
    domainModules.ascension = ascensionService;
    const yuanInfantService = getYuanInfantService(gameState2);
    yuanInfantService.init(gameState2);
    domainModules.yuanInfant = yuanInfantService;
    const immortalSectService = createImmortalSectService(gameState2);
    immortalSectService.init(gameState2);
    domainModules.immortalSect = immortalSectService;
    const caveDwellingService = createCaveDwellingService(gameState2);
    caveDwellingService.init(gameState2);
    domainModules.caveDwelling = caveDwellingService;
    const caveRealmService = createCaveRealmService(gameState2);
    caveRealmService.init(gameState2);
    domainModules.caveRealm = caveRealmService;
    const realmWarfareService = createRealmWarfareService(gameState2);
    realmWarfareService.init(gameState2);
    domainModules.realmWarfare = realmWarfareService;
    npcEvolutionEngine.init(gameState2);
    npcDialogueService.init(gameState2);
    eventAnalyticsService.init(gameState2);
    celestialDecreeService.init(gameState2);
    domainModules.celestialDecree = celestialDecreeService;
    heavenRankService.init(gameState2);
    domainModules.heavenRank = heavenRankService;
    const dharmaFruitHandlers = createDharmaFruitMCPHandlers(gameState2);
    mcpRegistry.registerTool(
      "dharma.fruit.claim",
      DHARMA_FRUITS_TOOLS["dharma.fruit.claim"],
      (params) => dharmaFruitHandlers["dharma.fruit.claim"](params)
    );
    mcpRegistry.registerTool(
      "dharma.fruit.inherit",
      DHARMA_FRUITS_TOOLS["dharma.fruit.inherit"],
      (params) => dharmaFruitHandlers["dharma.fruit.inherit"](params)
    );
    mcpRegistry.registerTool(
      "dharma.fruit.upgrade",
      DHARMA_FRUITS_TOOLS["dharma.fruit.upgrade"],
      (params) => dharmaFruitHandlers["dharma.fruit.upgrade"](params)
    );
    mcpRegistry.registerTool(
      "dharma.fruit.query",
      DHARMA_FRUITS_TOOLS["dharma.fruit.query"],
      (params) => dharmaFruitHandlers["dharma.fruit.query"](params)
    );
    mcpRegistry.registerTool(
      "dharma.transformation.trigger",
      DHARMA_FRUITS_TOOLS["dharma.transformation.trigger"],
      (params) => dharmaFruitHandlers["dharma.transformation.trigger"](params)
    );
    mcpRegistry.registerTool(
      "dharma.fruit.combine",
      DHARMA_FRUITS_TOOLS["dharma.fruit.combine"],
      (params) => dharmaFruitHandlers["dharma.fruit.combine"](params)
    );
    const chaosTreasureHandlers = createChaosTreasureMCPHandlers(gameState2);
    mcpRegistry.registerTool(
      "treasure.refine",
      CHAOS_TREASURE_TOOLS["treasure.refine"],
      (params) => chaosTreasureHandlers["treasure.refine"](params)
    );
    mcpRegistry.registerTool(
      "treasure.awaken",
      CHAOS_TREASURE_TOOLS["treasure.awaken"],
      (params) => chaosTreasureHandlers["treasure.awaken"](params)
    );
    mcpRegistry.registerTool(
      "treasure.query",
      CHAOS_TREASURE_TOOLS["treasure.query"],
      (params) => chaosTreasureHandlers["treasure.query"](params)
    );
    mcpRegistry.registerTool(
      "treasure.equip",
      CHAOS_TREASURE_TOOLS["treasure.equip"],
      (params) => chaosTreasureHandlers["treasure.equip"](params)
    );
    mcpRegistry.registerTool(
      "treasure.resonance",
      CHAOS_TREASURE_TOOLS["treasure.resonance"],
      (params) => chaosTreasureHandlers["treasure.resonance"](params)
    );
    mcpRegistry.registerTool(
      "treasure.strengthen",
      CHAOS_TREASURE_TOOLS["treasure.strengthen"],
      (params) => chaosTreasureHandlers["treasure.strengthen"](params)
    );
    const cosmicCycleHandlers = createCosmicCycleMCPHandlers(gameState2);
    mcpRegistry.registerTool(
      "cosmic.cycle.query",
      COSMIC_CYCLE_TOOLS["cosmic.cycle.query"],
      (params) => cosmicCycleHandlers["cosmic.cycle.query"](params)
    );
    mcpRegistry.registerTool(
      "cosmic.world.evolve",
      COSMIC_CYCLE_TOOLS["cosmic.world.evolve"],
      (params) => cosmicCycleHandlers["cosmic.world.evolve"](params)
    );
    mcpRegistry.registerTool(
      "cosmic.heaven.judge",
      COSMIC_CYCLE_TOOLS["cosmic.heaven.judge"],
      (params) => cosmicCycleHandlers["cosmic.heaven.judge"](params)
    );
    mcpRegistry.registerTool(
      "cosmic.blessing.grant",
      COSMIC_CYCLE_TOOLS["cosmic.blessing.grant"],
      (params) => cosmicCycleHandlers["cosmic.blessing.grant"](params)
    );
    mcpRegistry.registerTool(
      "cosmic.reset.execute",
      COSMIC_CYCLE_TOOLS["cosmic.reset.execute"],
      (params) => cosmicCycleHandlers["cosmic.reset.execute"](params)
    );
    mcpRegistry.registerTool(
      "cosmic.legacy.inherit",
      COSMIC_CYCLE_TOOLS["cosmic.legacy.inherit"],
      (params) => cosmicCycleHandlers["cosmic.legacy.inherit"](params)
    );
    const yuanInfantHandlers = YuanInfantService.getMCPHandlers(gameState2);
    mcpRegistry.registerTool(
      "yuaninfant.form",
      YUAN_INFANT_TOOLS["yuaninfant.form"],
      (params) => yuanInfantHandlers["yuaninfant.form"](params)
    );
    mcpRegistry.registerTool(
      "yuaninfant.separate",
      YUAN_INFANT_TOOLS["yuaninfant.separate"],
      (params) => yuanInfantHandlers["yuaninfant.separate"](params)
    );
    mcpRegistry.registerTool(
      "yuaninfant.project",
      YUAN_INFANT_TOOLS["yuaninfant.project"],
      (params) => yuanInfantHandlers["yuaninfant.project"](params)
    );
    mcpRegistry.registerTool(
      "yuaninfant.sync",
      YUAN_INFANT_TOOLS["yuaninfant.sync"],
      (params) => yuanInfantHandlers["yuaninfant.sync"](params)
    );
    mcpRegistry.registerTool(
      "yuaninfant.recall",
      YUAN_INFANT_TOOLS["yuaninfant.recall"],
      (params) => yuanInfantHandlers["yuaninfant.recall"](params)
    );
    mcpRegistry.registerTool(
      "yuaninfant.status",
      YUAN_INFANT_TOOLS["yuaninfant.status"],
      (params) => yuanInfantHandlers["yuaninfant.status"](params)
    );
    const yinYangWuXingHandlers = YinYangWuXingService.getMCPHandlers(gameState2);
    mcpRegistry.registerTool(
      "wuxing.analyze",
      YIN_YANG_WUXING_TOOLS["wuxing.analyze"],
      (params) => yinYangWuXingHandlers["wuxing.analyze"](params)
    );
    mcpRegistry.registerTool(
      "wuxing.balance",
      YIN_YANG_WUXING_TOOLS["wuxing.balance"],
      (params) => yinYangWuXingHandlers["wuxing.balance"](params)
    );
    mcpRegistry.registerTool(
      "wuxing.imbue",
      YIN_YANG_WUXING_TOOLS["wuxing.imbue"],
      (params) => yinYangWuXingHandlers["wuxing.imbue"](params)
    );
    mcpRegistry.registerTool(
      "wuxing.resonate",
      YIN_YANG_WUXING_TOOLS["wuxing.resonate"],
      (params) => yinYangWuXingHandlers["wuxing.resonate"](params)
    );
    mcpRegistry.registerTool(
      "wuxing.cycle",
      YIN_YANG_WUXING_TOOLS["wuxing.cycle"],
      (params) => yinYangWuXingHandlers["wuxing.cycle"](params)
    );
    mcpRegistry.registerTool(
      "wuxing.affinity",
      YIN_YANG_WUXING_TOOLS["wuxing.affinity"],
      (params) => yinYangWuXingHandlers["wuxing.affinity"](params)
    );
    const thunderTribulationHandlers = ThunderTribulationService.getMCPHandlers(gameState2);
    mcpRegistry.registerTool(
      "thunder.prepare",
      THUNDER_TRIBULATION_TOOLS["thunder.prepare"],
      (params) => thunderTribulationHandlers["thunder.prepare"](params)
    );
    mcpRegistry.registerTool(
      "thunder.execute",
      THUNDER_TRIBULATION_TOOLS["thunder.execute"],
      (params) => thunderTribulationHandlers["thunder.execute"](params)
    );
    mcpRegistry.registerTool(
      "thunder.bless",
      THUNDER_TRIBULATION_TOOLS["thunder.bless"],
      (params) => thunderTribulationHandlers["thunder.bless"](params)
    );
    mcpRegistry.registerTool(
      "thunder.mastery",
      THUNDER_TRIBULATION_TOOLS["thunder.mastery"],
      (params) => thunderTribulationHandlers["thunder.mastery"](params)
    );
    mcpRegistry.registerTool(
      "thunder.absorb",
      THUNDER_TRIBULATION_TOOLS["thunder.absorb"],
      (params) => thunderTribulationHandlers["thunder.absorb"](params)
    );
    mcpRegistry.registerTool(
      "thunder.journal",
      THUNDER_TRIBULATION_TOOLS["thunder.journal"],
      (params) => thunderTribulationHandlers["thunder.journal"](params)
    );
    const caveRealmHandlers = caveRealmService.getMCPHandlers();
    mcpRegistry.registerTool(
      "cave.create",
      CaveRealmService.TOOLS["cave.create"],
      (params) => caveRealmHandlers["cave.create"](params)
    );
    mcpRegistry.registerTool(
      "cave.expand",
      CaveRealmService.TOOLS["cave.expand"],
      (params) => caveRealmHandlers["cave.expand"](params)
    );
    mcpRegistry.registerTool(
      "cave.resource",
      CaveRealmService.TOOLS["cave.resource"],
      (params) => caveRealmHandlers["cave.resource"](params)
    );
    mcpRegistry.registerTool(
      "cave.blessed",
      CaveRealmService.TOOLS["cave.blessed"],
      (params) => caveRealmHandlers["cave.blessed"](params)
    );
    mcpRegistry.registerTool(
      "cave.spirit",
      CaveRealmService.TOOLS["cave.spirit"],
      (params) => caveRealmHandlers["cave.spirit"](params)
    );
    mcpRegistry.registerTool(
      "cave.harvest",
      CaveRealmService.TOOLS["cave.harvest"],
      (params) => caveRealmHandlers["cave.harvest"](params)
    );
    mcpRegistry.registerTool(
      "law.list",
      LAW_UNIFICATION_TOOLS[0],
      () => listLaws(gameState2)
    );
    mcpRegistry.registerTool(
      "law.comprehend",
      LAW_UNIFICATION_TOOLS[1],
      (params) => comprehendLaw(gameState2, params.lawId)
    );
    mcpRegistry.registerTool(
      "law.fuse",
      LAW_UNIFICATION_TOOLS[2],
      (params) => fuseLaws(gameState2, params.lawIds, params.targetTechnique)
    );
    mcpRegistry.registerTool(
      "law.unify",
      LAW_UNIFICATION_TOOLS[3],
      () => unifyLaws(gameState2)
    );
    mcpRegistry.registerTool(
      "law.technique",
      LAW_UNIFICATION_TOOLS[4],
      () => listUltimateTechniques(gameState2)
    );
    mcpRegistry.registerTool(
      "law.evolve",
      LAW_UNIFICATION_TOOLS[5],
      (params) => evolveTechnique(gameState2, params.techniqueId)
    );
    mcpRegistry.registerTool(
      "law.verify",
      LAW_UNIFICATION_TOOLS[6],
      () => verifyUnification(gameState2)
    );
    mcpRegistry.registerTool(
      "magic.query",
      MAGIC_MCP_TOOLS[0],
      () => queryMagicStatus()
    );
    mcpRegistry.registerTool(
      "magic.analyze",
      MAGIC_MCP_TOOLS[1],
      (params) => analyzeEntityMagic(params.entityId)
    );
    mcpRegistry.registerTool(
      "magic.unify",
      MAGIC_MCP_TOOLS[2],
      (params) => unifyMagics(params.sourceMagicId, params.targetMagicId)
    );
    mcpRegistry.registerTool(
      "magic.balance",
      MAGIC_MCP_TOOLS[3],
      () => balanceMagic()
    );
    mcpRegistry.registerTool(
      "magic.forget",
      MAGIC_MCP_TOOLS[4],
      (params) => forgetMagic(params.magicId)
    );
    mcpRegistry.registerTool(
      "caveheaven.create",
      CAVE_HEAVEN_MCP_TOOLS[0],
      (params) => createCaveHeaven(gameState2, params.name)
    );
    mcpRegistry.registerTool(
      "caveheaven.upgrade",
      CAVE_HEAVEN_MCP_TOOLS[1],
      (params) => upgradeCaveHeavenById(gameState2, params.id, params.targetLevel)
    );
    mcpRegistry.registerTool(
      "caveheaven.collect",
      CAVE_HEAVEN_MCP_TOOLS[2],
      (params) => collectFromCave(gameState2, params.id)
    );
    mcpRegistry.registerTool(
      "caveheaven.build",
      CAVE_HEAVEN_MCP_TOOLS[3],
      (params) => buildCaveFacility(gameState2, params.id, params.facility)
    );
    mcpRegistry.registerTool(
      "caveheaven.query",
      CAVE_HEAVEN_MCP_TOOLS[4],
      (params) => queryCaveHeaven(gameState2, params.id)
    );
    mcpRegistry.registerTool(
      "spiritbeast.acquire",
      SPIRIT_BEAST_MCP_TOOLS[0],
      (params) => acquireSpiritBeast(gameState2, params.name, params.type)
    );
    mcpRegistry.registerTool(
      "spiritbeast.list",
      SPIRIT_BEAST_MCP_TOOLS[1],
      () => listSpiritBeasts(gameState2)
    );
    mcpRegistry.registerTool(
      "spiritbeast.select",
      SPIRIT_BEAST_MCP_TOOLS[2],
      (params) => selectSpiritBeast(gameState2, params.beastId)
    );
    mcpRegistry.registerTool(
      "spiritbeast.evolve",
      SPIRIT_BEAST_MCP_TOOLS[3],
      (params) => evolveSpiritBeast(gameState2, params.beastId, params.branchId)
    );
    mcpRegistry.registerTool(
      "spiritbeast.info",
      SPIRIT_BEAST_MCP_TOOLS[4],
      (params) => getSpiritBeastInfo(gameState2, params.beastId)
    );
    mcpRegistry.registerTool(
      "spiritbeast.evolution_info",
      SPIRIT_BEAST_MCP_TOOLS[5],
      (params) => getSpiritBeastEvolutionInfo(gameState2, params.beastId)
    );
    mcpRegistry.registerTool(
      "spiritbeast.power",
      SPIRIT_BEAST_MCP_TOOLS[6],
      (params) => getSpiritBeastPower(gameState2, params.beastId)
    );
    mcpRegistry.registerTool(
      "spiritbeast.tiers",
      SPIRIT_BEAST_MCP_TOOLS[7],
      () => getAllSpiritBeastTiers()
    );
    mcpRegistry.registerTool(
      "bloodline.essence.gain",
      BLOODLINE_MCP_TOOLS[0],
      (params) => gainBloodlineEssence(gameState2, params.amount, params.reason)
    );
    mcpRegistry.registerTool(
      "bloodline.awaken",
      BLOODLINE_MCP_TOOLS[1],
      (params) => awakenBloodline(gameState2, params.beastId, params.bloodlineType)
    );
    mcpRegistry.registerTool(
      "bloodline.progress",
      BLOODLINE_MCP_TOOLS[2],
      (params) => addBloodlineProgress(gameState2, params.beastId, params.amount)
    );
    mcpRegistry.registerTool(
      "bloodline.info",
      BLOODLINE_MCP_TOOLS[3],
      (params) => getBeastBloodlineInfo(gameState2, params.beastId)
    );
    mcpRegistry.registerTool(
      "bloodline.resonance.check",
      BLOODLINE_MCP_TOOLS[4],
      (params) => checkBloodlineResonance(gameState2, params.beastId1, params.beastId2)
    );
    mcpRegistry.registerTool(
      "bloodline.resonance.create",
      BLOODLINE_MCP_TOOLS[5],
      (params) => createBloodlineResonancePair(gameState2, params.beastId1, params.beastId2)
    );
    mcpRegistry.registerTool(
      "bloodline.resonance.remove",
      BLOODLINE_MCP_TOOLS[6],
      (params) => removeBloodlineResonancePair(gameState2, params.pairId)
    );
    mcpRegistry.registerTool(
      "bond.create",
      BEAST_BOND_TOOLS[0],
      (params) => {
        const svc = createBeastBondService(gameState2);
        return svc.createBond(params.beastId1, params.beastId2, params.bondType);
      }
    );
    mcpRegistry.registerTool(
      "bond.trigger",
      BEAST_BOND_TOOLS[1],
      (params) => {
        const svc = createBeastBondService(gameState2);
        return svc.triggerFusionSkill(params.beastId1, params.beastId2);
      }
    );
    mcpRegistry.registerTool(
      "bond.list",
      BEAST_BOND_TOOLS[2],
      () => {
        const svc = createBeastBondService(gameState2);
        return svc.listBonds();
      }
    );
    mcpRegistry.registerTool(
      "bond.dissolve",
      BEAST_BOND_TOOLS[3],
      (params) => {
        const svc = createBeastBondService(gameState2);
        return svc.dissolveBond(params.beastId1, params.beastId2);
      }
    );
    mcpRegistry.registerTool(
      "auction.list",
      AUCTION_TOOLS[0],
      (params) => {
        const svc = createAuctionHouseService(gameState2);
        return svc.listItem(params.itemId, params.itemName, params.quality, params.startingPrice, params.duration);
      }
    );
    mcpRegistry.registerTool(
      "auction.bid",
      AUCTION_TOOLS[1],
      (params) => {
        const svc = createAuctionHouseService(gameState2);
        return svc.placeBid(params.listingId, params.amount);
      }
    );
    mcpRegistry.registerTool(
      "auction.claimSale",
      AUCTION_TOOLS[2],
      (params) => {
        const svc = createAuctionHouseService(gameState2);
        return svc.claimSale(params.listingId);
      }
    );
    mcpRegistry.registerTool(
      "auction.claimWin",
      AUCTION_TOOLS[3],
      (params) => {
        const svc = createAuctionHouseService(gameState2);
        return svc.claimAuctionWin(params.listingId);
      }
    );
    mcpRegistry.registerTool(
      "auction.active",
      AUCTION_TOOLS[4],
      (params) => {
        const svc = createAuctionHouseService(gameState2);
        return svc.getActiveListings(params.filter);
      }
    );
    mcpRegistry.registerTool(
      "auction.mine",
      AUCTION_TOOLS[5],
      () => {
        const svc = createAuctionHouseService(gameState2);
        return svc.getMyListings();
      }
    );
    mcpRegistry.registerTool(
      "tournament.register",
      TOURNAMENT_TOOLS[0],
      (params) => {
        const svc = createTournamentService(gameState2);
        return svc.register(params.tier);
      }
    );
    mcpRegistry.registerTool(
      "tournament.match",
      TOURNAMENT_TOOLS[1],
      () => {
        const svc = createTournamentService(gameState2);
        return svc.startMatch();
      }
    );
    mcpRegistry.registerTool(
      "tournament.unregister",
      TOURNAMENT_TOOLS[2],
      () => {
        const svc = createTournamentService(gameState2);
        return svc.unregister();
      }
    );
    mcpRegistry.registerTool(
      "tournament.rankings",
      TOURNAMENT_TOOLS[3],
      (params) => {
        const svc = createTournamentService(gameState2);
        return svc.getRankings(params.tier);
      }
    );
    mcpRegistry.registerTool(
      "tournament.history",
      TOURNAMENT_TOOLS[4],
      (params) => {
        const svc = createTournamentService(gameState2);
        return svc.getHistory(params.limit);
      }
    );
    mcpRegistry.registerTool(
      "trade.list",
      TRADE_MCP_TOOLS[0],
      (params) => listMarketGoods(params.marketId)
    );
    mcpRegistry.registerTool(
      "trade.buy",
      TRADE_MCP_TOOLS[1],
      (params) => buyGoods(params.marketId, params.goodId, params.quantity)
    );
    mcpRegistry.registerTool(
      "trade.sell",
      TRADE_MCP_TOOLS[2],
      (params) => sellGoods(params.marketId, params.goodId, params.quantity)
    );
    mcpRegistry.registerTool(
      "trade.transport",
      TRADE_MCP_TOOLS[3],
      (params) => transportGoods(params.routeId, params.goodId, params.quantity)
    );
    mcpRegistry.registerTool(
      "trade.query",
      TRADE_MCP_TOOLS[4],
      () => queryTradeStatus()
    );
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
    mcpRegistry.registerTool("reincarnation.book.list", {
      name: "reincarnation.book.list",
      description: "View reincarnation history (reincarnation book)",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of records to return", default: 20 },
          offset: { type: "number", description: "Offset for pagination", default: 0 },
          filter: { type: "string", enum: ["all", "good", "bad"], description: "Filter by karma", default: "all" }
        }
      }
    }, (params) => reincarnationBookService.mcpBookList(params || {}));
    mcpRegistry.registerTool("reincarnation.karma.record", {
      name: "reincarnation.karma.record",
      description: "Record karma behavior",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "Behavior type (rescue/charity/honest/medicine/protect/kill/steal/lie/harm/betray)" },
          action: { type: "string", enum: ["good", "bad"], description: "Good or bad action" },
          amount: { type: "number", description: "Karma amount" },
          description: { type: "string", description: "Custom description" }
        },
        required: ["type", "action"]
      }
    }, (params) => reincarnationBookService.mcpKarmaRecord(params || {}));
    mcpRegistry.registerTool("reincarnation.karma.query", {
      name: "reincarnation.karma.query",
      description: "Query current karma status",
      inputSchema: { type: "object", properties: {} }
    }, () => reincarnationBookService.mcpKarmaQuery());
    mcpRegistry.registerTool("reincarnation.tiandao.record", {
      name: "reincarnation.tiandao.record",
      description: "Record tiandao merit event",
      inputSchema: {
        type: "object",
        properties: {
          eventType: { type: "string", description: "Event type (breakthrough/fly/tribulation/merit/serendipity/alchemy)" },
          merit: { type: "number", description: "Merit amount to record" },
          description: { type: "string", description: "Custom description" }
        },
        required: ["eventType"]
      }
    }, (params) => reincarnationBookService.mcpTiandaoRecord(params || {}));
    mcpRegistry.registerTool("reincarnation.tiandao.bless", {
      name: "reincarnation.tiandao.bless",
      description: "Receive tiandao blessing (consumes merit)",
      inputSchema: {
        type: "object",
        properties: {
          level: { type: "string", enum: ["SSS", "SS", "S", "A", "B", "C"], description: "Blessing level" },
          reason: { type: "string", description: "Reason for blessing" }
        }
      }
    }, (params) => reincarnationBookService.mcpTiandaoBless(params || {}));
    mcpRegistry.registerTool("reincarnation.history.export", {
      name: "reincarnation.history.export",
      description: "Export reincarnation history",
      inputSchema: {
        type: "object",
        properties: {
          format: { type: "string", enum: ["json", "text"], description: "Export format", default: "json" },
          includeDetails: { type: "boolean", description: "Include karma and tiandao records", default: true }
        }
      }
    }, (params) => reincarnationBookService.mcpHistoryExport(params || {}));
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
    mcpRegistry.registerTool("alchemy.kb.query", {
      name: "alchemy.kb.query",
      description: "Query the alchemy knowledge base",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["recipe", "herb", "efficacy"], description: "Query type" },
          name: { type: "string", description: "Name to query" }
        }
      }
    }, (params) => alchemyKBService.query(params));
    mcpRegistry.registerTool("alchemy.recipe.discover", {
      name: "alchemy.recipe.discover",
      description: "Manually research to discover new alchemy recipes (consumes qi)",
      inputSchema: {
        type: "object",
        properties: {
          herbs: { type: "array", items: { type: "string" }, description: "Herbs to use for research" },
          qiCost: { type: "number", description: "Qi cost for discovery" }
        }
      }
    }, (params) => alchemyKBService.discover(params));
    mcpRegistry.registerTool("alchemy.recipe.list", {
      name: "alchemy.recipe.list",
      description: "List all discovered alchemy recipes",
      inputSchema: {
        type: "object",
        properties: {
          filter: { type: "string", description: "Filter recipes by name, material, or efficacy" }
        }
      }
    }, (params) => alchemyKBService.listRecipes(params));
    mcpRegistry.registerTool("alchemy.efficacy.map", {
      name: "alchemy.efficacy.map",
      description: "View herb efficacy mapping and synergy effects",
      inputSchema: {
        type: "object",
        properties: {
          herb: { type: "string", description: "Specific herb to query" }
        }
      }
    }, (params) => alchemyKBService.getEfficacyMap(params));
    mcpRegistry.registerTool("alchemy.craft.calculate", {
      name: "alchemy.craft.calculate",
      description: "Calculate crafting result preview with given materials",
      inputSchema: {
        type: "object",
        properties: {
          materials: { type: "array", items: { type: "string" }, description: "Materials to use", required: ["materials"] }
        },
        required: ["materials"]
      }
    }, (params) => alchemyKBService.calculateCraft(params));
    mcpRegistry.registerTool("alchemy.kb.export", {
      name: "alchemy.kb.export",
      description: "Export the knowledge graph",
      inputSchema: {
        type: "object",
        properties: {
          format: { type: "string", enum: ["json"], description: "Export format" },
          includeHidden: { type: "boolean", description: "Include undiscovered recipes" }
        }
      }
    }, (params) => alchemyKBService.exportKB(params));
    mcpRegistry.registerTool("herb.explore.region", {
      name: "herb.explore.region",
      description: "Explore a region to discover herbs",
      inputSchema: {
        type: "object",
        properties: {
          region: {
            type: "string",
            enum: ["\u5E73\u539F", "\u5C71\u6797", "\u6E56\u6CCA", "\u6C99\u6F20", "\u96EA\u5C71", "\u79D8\u5883"],
            description: "Region to explore"
          },
          useMastery: { type: "boolean", description: "Use elemental mastery bonus", default: true }
        },
        required: ["region"]
      }
    }, (params) => herbDiscoveryService.exploreRegion(params));
    mcpRegistry.registerTool("herb.season.query", {
      name: "herb.season.query",
      description: "Query herbs available in current or specified season",
      inputSchema: {
        type: "object",
        properties: {
          season: {
            type: "string",
            enum: ["\u6625", "\u590F", "\u79CB", "\u51AC"],
            description: "Season to query"
          }
        }
      }
    }, (params) => herbDiscoveryService.querySeasonalHerbs(params));
    mcpRegistry.registerTool("herb.discovery.list", {
      name: "herb.discovery.list",
      description: "List all discovered herbs",
      inputSchema: {
        type: "object",
        properties: {
          filter: { type: "string", description: "Filter by herb name" },
          rarity: {
            type: "string",
            enum: ["common", "uncommon", "rare", "legendary"],
            description: "Filter by rarity"
          }
        }
      }
    }, (params) => herbDiscoveryService.listDiscoveredHerbs(params));
    mcpRegistry.registerTool("herb.rarity.classify", {
      name: "herb.rarity.classify",
      description: "Classify herbs by rarity or query specific herb rarity",
      inputSchema: {
        type: "object",
        properties: {
          herb: { type: "string", description: "Specific herb to query" }
        }
      }
    }, (params) => herbDiscoveryService.classifyHerbsByRarity(params));
    mcpRegistry.registerTool("herb.synergy.analyze", {
      name: "herb.synergy.analyze",
      description: "Analyze synergy effects between herbs",
      inputSchema: {
        type: "object",
        properties: {
          herbs: {
            type: "array",
            items: { type: "string" },
            description: "List of herbs to analyze",
            required: ["herbs"]
          }
        },
        required: ["herbs"]
      }
    }, (params) => herbDiscoveryService.analyzeSynergy(params));
    mcpRegistry.registerTool("herb.knowledge.gain", {
      name: "herb.knowledge.gain",
      description: "Gain herb knowledge and upgrade elemental mastery",
      inputSchema: {
        type: "object",
        properties: {
          element: {
            type: "string",
            enum: ["metal", "wood", "water", "fire", "earth"],
            description: "Element to gain knowledge in"
          },
          amount: { type: "number", description: "Knowledge amount to gain", default: 1 }
        }
      }
    }, (params) => herbDiscoveryService.gainHerbKnowledge(params));
    mcpRegistry.registerTool("ascension.requirements.check", {
      name: "ascension.requirements.check",
      description: "Check if player meets ascension requirements",
      inputSchema: {
        type: "object",
        properties: {
          detailed: { type: "boolean", description: "Include detailed requirement info" }
        }
      }
    }, (params) => ascensionService.mcpRequirementsCheck(params));
    mcpRegistry.registerTool("ascension.initiate", {
      name: "ascension.initiate",
      description: "Initiate the ascension process",
      inputSchema: {
        type: "object",
        properties: {
          confirm: { type: "boolean", description: "Confirm ascension" }
        }
      }
    }, (params) => ascensionService.mcpInitiate(params));
    mcpRegistry.registerTool("ascension.tribulation.execute", {
      name: "ascension.tribulation.execute",
      description: "Execute the divine tribulation",
      inputSchema: {
        type: "object",
        properties: {
          strikeNumber: { type: "number", description: "Current strike number" },
          resisted: { type: "boolean", description: "Whether the strike was resisted" }
        }
      }
    }, (params) => ascensionService.mcpTribulationExecute(params));
    mcpRegistry.registerTool("ascension.reward.claim", {
      name: "ascension.reward.claim",
      description: "Claim ascension rewards",
      inputSchema: {
        type: "object",
        properties: {
          rewardIndex: { type: "number", description: "Specific reward index to claim (0-3), all if undefined" }
        }
      }
    }, (params) => ascensionService.mcpRewardClaim(params));
    mcpRegistry.registerTool("ascension.realm.query", {
      name: "ascension.realm.query",
      description: "Query current immortal realm status",
      inputSchema: {
        type: "object",
        properties: {
          detailed: { type: "boolean", description: "Include detailed info" }
        }
      }
    }, (params) => ascensionService.mcpRealmQuery(params));
    mcpRegistry.registerTool("ascension.blessing.list", {
      name: "ascension.blessing.list",
      description: "List all divine blessings",
      inputSchema: {
        type: "object",
        properties: {
          filter: { type: "string", description: "Filter by name or description" },
          showAll: { type: "boolean", description: "Show all blessings including acquired ones" }
        }
      }
    }, (params) => ascensionService.mcpBlessingList(params));
    mcpRegistry.registerTool("sect.immortal.create", {
      name: "sect.immortal.create",
      description: "Create an immortal sect in the immortal realm",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the immortal sect" }
        },
        required: ["name"]
      }
    }, (params) => domainModules.immortalSect.mcpCreate(params));
    mcpRegistry.registerTool("sect.immortal.join", {
      name: "sect.immortal.join",
      description: "Join an existing immortal sect",
      inputSchema: {
        type: "object",
        properties: {
          sectId: { type: "string", description: "UID of the sect to join" }
        },
        required: ["sectId"]
      }
    }, (params) => domainModules.immortalSect.mcpJoin(params));
    mcpRegistry.registerTool("sect.immortal.resource.list", {
      name: "sect.immortal.resource.list",
      description: "List resources of an immortal sect",
      inputSchema: {
        type: "object",
        properties: {
          sectId: { type: "string", description: "UID of the sect (optional, defaults to player sect)" }
        }
      }
    }, (params) => domainModules.immortalSect.mcpResourceList(params));
    mcpRegistry.registerTool("sect.immortal.trade.execute", {
      name: "sect.immortal.trade.execute",
      description: "Execute a trade between immortal sects",
      inputSchema: {
        type: "object",
        properties: {
          targetSectId: { type: "string", description: "Target sect ID" },
          resourceType: { type: "string", enum: ["spiritStones", "pills", "techniques", "merit"] },
          amount: { type: "number" },
          price: { type: "number" }
        },
        required: ["targetSectId", "resourceType", "amount", "price"]
      }
    }, (params) => domainModules.immortalSect.mcpTradeExecute(params));
    mcpRegistry.registerTool("sect.immortal.disciple.promote", {
      name: "sect.immortal.disciple.promote",
      description: "Promote a mortal sect disciple to elite disciple",
      inputSchema: {
        type: "object",
        properties: {
          discipleUid: { type: "string", description: "UID of the disciple to promote" }
        },
        required: ["discipleUid"]
      }
    }, (params) => domainModules.immortalSect.mcpDisciplePromote(params));
    mcpRegistry.registerTool("sect.immortal.alliance.form", {
      name: "sect.immortal.alliance.form",
      description: "Form an alliance with another immortal sect",
      inputSchema: {
        type: "object",
        properties: {
          targetSectId: { type: "string", description: "Target sect ID to ally with" }
        },
        required: ["targetSectId"]
      }
    }, (params) => domainModules.immortalSect.mcpAllianceForm(params));
    mcpRegistry.registerTool("residence.build", {
      name: "residence.build",
      description: "Build a cave dwelling in the spirit realm",
      inputSchema: {
        type: "object",
        properties: {
          location: { type: "string", enum: ["\u79D8\u5883", "\u4ED9\u5C71", "\u6D77\u5E95", "\u6DF1\u6E0A", "\u4E91\u7AEF"], description: "Location of the dwelling" },
          scale: { type: "string", enum: ["\u5C0F\u578B", "\u4E2D\u578B", "\u5927\u578B", "\u6D1E\u5929"], description: "Scale of the dwelling" },
          customName: { type: "string", description: "Custom name for the dwelling" }
        },
        required: ["location", "scale"]
      }
    }, (params) => domainModules.caveDwelling.mcpBuild(params));
    mcpRegistry.registerTool("residence.upgrade", {
      name: "residence.upgrade",
      description: "Upgrade the cave dwelling",
      inputSchema: {
        type: "object",
        properties: {
          confirm: { type: "boolean", description: "Confirm upgrade" }
        }
      }
    }, (params) => domainModules.caveDwelling.mcpUpgrade(params));
    mcpRegistry.registerTool("residence.query", {
      name: "residence.query",
      description: "Query cave dwelling status",
      inputSchema: {
        type: "object",
        properties: {
          detailed: { type: "boolean", description: "Include detailed info" }
        }
      }
    }, (params) => domainModules.caveDwelling.mcpQuery(params));
    mcpRegistry.registerTool("residence.blessing", {
      name: "residence.blessing",
      description: "Get cave dwelling blessing bonuses",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["cultivation", "location", "total"], description: "Blessing type to query" }
        }
      }
    }, (params) => domainModules.caveDwelling.mcpBlessing(params));
    mcpRegistry.registerTool("residence.visit", {
      name: "residence.visit",
      description: "Visit another player's cave dwelling",
      inputSchema: {
        type: "object",
        properties: {
          hostId: { type: "string", description: "Host player ID" },
          hostName: { type: "string", description: "Host player name" }
        }
      }
    }, (params) => domainModules.caveDwelling.mcpVisit(params));
    mcpRegistry.registerTool("residence.trade", {
      name: "residence.trade",
      description: "Trade resources at the cave dwelling",
      inputSchema: {
        type: "object",
        properties: {
          resourceType: { type: "string", enum: ["spiritStones", "materials", "pills", "herbs"], description: "Resource type" },
          amount: { type: "number", description: "Amount to trade" },
          price: { type: "number", description: "Price per unit" },
          action: { type: "string", enum: ["list", "execute"], description: "Trade action" }
        },
        required: ["resourceType", "amount", "price"]
      }
    }, (params) => domainModules.caveDwelling.mcpTrade(params));
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
    mcpRegistry.registerTool("npc.dialogue.generate", {
      name: "npc.dialogue.generate",
      description: "Generate NPC dialogue response based on player input and context",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" },
          playerMessage: { type: "string", description: "Player message to respond to" }
        },
        required: ["npcId", "playerMessage"]
      }
    }, (params) => npcDialogueService.mcpGenerateDialogue(params || {}));
    mcpRegistry.registerTool("npc.dialogue.context", {
      name: "npc.dialogue.context",
      description: "Get current dialogue context for NPC",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" }
        },
        required: ["npcId"]
      }
    }, (params) => npcDialogueService.mcpGetContext(params || {}));
    mcpRegistry.registerTool("npc.memory.retrieve", {
      name: "npc.memory.retrieve",
      description: "Retrieve NPC memories and learning status",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" },
          type: { type: "string", description: "Memory type filter (interaction/preference/event/relationship)" },
          limit: { type: "number", description: "Maximum memories to retrieve" }
        },
        required: ["npcId"]
      }
    }, (params) => npcDialogueService.mcpRetrieveMemory(params || {}));
    mcpRegistry.registerTool("npc.context.update", {
      name: "npc.context.update",
      description: "Update dialogue context fields for NPC",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" },
          updates: {
            type: "object",
            description: "Fields to update (currentTopic, emotion, goal, tone)",
            properties: {
              currentTopic: { type: "string" },
              emotion: { type: "string" },
              goal: { type: "string" },
              tone: { type: "string" }
            }
          }
        },
        required: ["npcId", "updates"]
      }
    }, (params) => npcDialogueService.mcpUpdateContext(params || {}));
    mcpRegistry.registerTool("npc.dialogue.reset", {
      name: "npc.dialogue.reset",
      description: "Reset NPC dialogue state",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" },
          clearMemories: { type: "boolean", description: "Also clear NPC memories" }
        },
        required: ["npcId"]
      }
    }, (params) => npcDialogueService.mcpResetDialogue(params || {}));
    mcpRegistry.registerTool("npc.tone.set", {
      name: "npc.tone.set",
      description: "Set NPC dialogue tone",
      inputSchema: {
        type: "object",
        properties: {
          npcId: { type: "string", description: "NPC identifier" },
          tone: { type: "string", description: "Tone to set (formal/casual/mysterious)" }
        },
        required: ["npcId", "tone"]
      }
    }, (params) => npcDialogueService.mcpSetTone(params || {}));
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
    mcpRegistry.registerTool("event.analytics.stats", {
      name: "event.analytics.stats",
      description: "Get event statistics including counts by type, source, and priority",
      inputSchema: {
        type: "object",
        properties: {
          eventType: { type: "string", description: "Filter by event type" },
          source: { type: "string", description: "Filter by source" },
          timeRange: {
            type: "object",
            description: "Time range filter",
            properties: {
              since: { type: "number" },
              until: { type: "number" }
            }
          }
        }
      }
    }, (params) => {
      const { mcpAnalyticsStats: mcpAnalyticsStats2 } = (init_EventAnalyticsService(), __toCommonJS(EventAnalyticsService_exports));
      return mcpAnalyticsStats2(params);
    });
    mcpRegistry.registerTool("event.analytics.trend", {
      name: "event.analytics.trend",
      description: "Get event trends over time with moving averages",
      inputSchema: {
        type: "object",
        properties: {
          windowSize: { type: "number", description: "Number of time windows" },
          eventType: { type: "string", description: "Filter by event type" },
          granularity: { type: "string", enum: ["minute", "hour", "day"] }
        }
      }
    }, (params) => {
      const { mcpAnalyticsTrend: mcpAnalyticsTrend2 } = (init_EventAnalyticsService(), __toCommonJS(EventAnalyticsService_exports));
      return mcpAnalyticsTrend2(params);
    });
    mcpRegistry.registerTool("event.analytics.pattern", {
      name: "event.analytics.pattern",
      description: "Detect recurring event patterns and sequences",
      inputSchema: {
        type: "object",
        properties: {
          sequenceLength: { type: "number", description: "Max sequence length" },
          minOccurrences: { type: "number", description: "Minimum occurrences" },
          eventType: { type: "string", description: "Filter by event type" }
        }
      }
    }, (params) => {
      const { mcpAnalyticsPattern: mcpAnalyticsPattern2 } = (init_EventAnalyticsService(), __toCommonJS(EventAnalyticsService_exports));
      return mcpAnalyticsPattern2(params);
    });
    mcpRegistry.registerTool("event.analytics.anomaly", {
      name: "event.analytics.anomaly",
      description: "Detect anomalous events using statistical analysis",
      inputSchema: {
        type: "object",
        properties: {
          threshold: { type: "number", description: "Z-score threshold" },
          windowSize: { type: "number", description: "Window size for analysis" },
          source: { type: "string", description: "Filter by source" }
        }
      }
    }, (params) => {
      const { mcpAnalyticsAnomaly: mcpAnalyticsAnomaly2 } = (init_EventAnalyticsService(), __toCommonJS(EventAnalyticsService_exports));
      return mcpAnalyticsAnomaly2(params);
    });
    mcpRegistry.registerTool("event.history.query", {
      name: "event.history.query",
      description: "Query historical events with filtering and pagination",
      inputSchema: {
        type: "object",
        properties: {
          eventType: { type: "string", description: "Filter by event type" },
          source: { type: "string", description: "Filter by source" },
          since: { type: "number", description: "Start timestamp" },
          until: { type: "number", description: "End timestamp" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
          dataFilter: { type: "object", description: "Filter by event data" },
          limit: { type: "number", description: "Max results" },
          offset: { type: "number", description: "Offset for pagination" }
        }
      }
    }, (params) => {
      const { mcpHistoryQuery: mcpHistoryQuery2 } = (init_EventAnalyticsService(), __toCommonJS(EventAnalyticsService_exports));
      return mcpHistoryQuery2(params);
    });
    mcpRegistry.registerTool("event.analytics.forecast", {
      name: "event.analytics.forecast",
      description: "Predict future events based on historical patterns",
      inputSchema: {
        type: "object",
        properties: {
          horizonHours: { type: "number", description: "Forecast horizon in hours" },
          eventType: { type: "string", description: "Filter by event type" }
        }
      }
    }, (params) => {
      const { mcpAnalyticsForecast: mcpAnalyticsForecast2 } = (init_EventAnalyticsService(), __toCommonJS(EventAnalyticsService_exports));
      return mcpAnalyticsForecast2(params);
    });
    mcpRegistry.registerTool("world.decree.list", {
      name: "world.decree.list",
      description: "\u67E5\u770B\u5F53\u524D\u5929\u9053\u6CD5\u65E8\u5217\u8868",
      inputSchema: {
        type: "object",
        properties: {
          status: { type: "string", description: "\u8FC7\u6EE4\u72B6\u6001 (active/accepted/completed/expired)" },
          type: { type: "string", description: "\u8FC7\u6EE4\u7C7B\u578B (reward/punishment/quest)" }
        }
      }
    }, (params) => celestialDecreeService.listDecrees(params || {}));
    mcpRegistry.registerTool("world.decree.accept", {
      name: "world.decree.accept",
      description: "\u63A5\u53D7\u4E00\u4E2A\u5929\u9053\u6CD5\u65E8\u4EFB\u52A1",
      inputSchema: {
        type: "object",
        properties: {
          decreeId: { type: "string", description: "\u6CD5\u65E8ID" }
        },
        required: ["decreeId"]
      }
    }, (params) => celestialDecreeService.acceptDecree(params == null ? void 0 : params.decreeId));
    mcpRegistry.registerTool("world.favor.query", {
      name: "world.favor.query",
      description: "\u67E5\u8BE2\u5F53\u524D\u6069\u5BA0\u7ACB\u573A",
      inputSchema: { type: "object", properties: {} }
    }, () => celestialDecreeService.queryFavor());
    mcpRegistry.registerTool("world.favor.adjust", {
      name: "world.favor.adjust",
      description: "\u8C03\u6574\u6069\u5BA0\u503C\uFF08\u901A\u8FC7\u884C\u4E3A\u89E6\u53D1\uFF09",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "number", description: "\u8C03\u6574\u6570\u503C\uFF08\u6B63\u8D1F\uFF09" },
          reason: { type: "string", description: "\u8C03\u6574\u539F\u56E0" }
        },
        required: ["amount"]
      }
    }, (params) => celestialDecreeService.adjustFavor((params == null ? void 0 : params.amount) || 0, (params == null ? void 0 : params.reason) || ""));
    mcpRegistry.registerTool("world.awakening.trigger", {
      name: "world.awakening.trigger",
      description: "\u89E6\u53D1\u4E16\u754C\u89C9\u9192\u4E8B\u4EF6",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "\u89C9\u9192\u7C7B\u578B (qi_tide/beast_rampage/realm_unseal)" }
        },
        required: ["type"]
      }
    }, (params) => celestialDecreeService.triggerAwakening(params == null ? void 0 : params.type));
    mcpRegistry.registerTool("world.blessing.claim", {
      name: "world.blessing.claim",
      description: "\u9886\u53D6\u5929\u9053\u8D50\u798F",
      inputSchema: {
        type: "object",
        properties: {
          blessingId: { type: "string", description: "\u8D50\u798FID" }
        },
        required: ["blessingId"]
      }
    }, (params) => celestialDecreeService.claimBlessing(params == null ? void 0 : params.blessingId));
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
  function getVersionInfo() {
    const versionStr = typeof window !== "undefined" && window.__GAME_VERSION__ ? window.__GAME_VERSION__ : "V242-dev";
    const parts = versionStr.split("-");
    const version = parts[1] || "unknown";
    const commitId = parts[2] || "unknown";
    const buildTime = parts.slice(3).join("-") || "unknown";
    const deployBranch = "gh-pages";
    return {
      version,
      // e.g., V242
      commitId,
      // e.g., 69f8864
      deployBranch,
      buildTime,
      // e.g., 2026-05-31T06-59-45-881Z
      fullVersion: versionStr
    };
  }
  function showVersionModal() {
    const info = getVersionInfo();
    const existing = document.getElementById("version-modal");
    if (existing) existing.remove();
    const modal = document.createElement("div");
    modal.id = "version-modal";
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
    `;
    modal.innerHTML = `
    <div style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid #4a9eff;
        border-radius: 16px;
        padding: 32px 40px;
        color: #e0e0e0;
        font-family: 'Courier New', monospace;
        min-width: 400px;
        box-shadow: 0 0 60px rgba(74,158,255,0.3);
    ">
        <div style="text-align:center; margin-bottom:24px;">
            <div style="font-size:28px; color:#4a9eff; margin-bottom:8px;">\u{1F31F} \u4FEE\u4ED9\u6A21\u62DF\u5668</div>
            <div style="font-size:14px; color:#888;">${info.version}</div>
        </div>
        <div style="display:grid; grid-template-columns:120px 1fr; gap:12px 16px; font-size:14px;">
            <span style="color:#888;">\u7248\u672C</span><span style="color:#4a9eff;">${info.version}</span>
            <span style="color:#888;">Commit</span><span style="color:#fff;">${info.commitId}</span>
            <span style="color:#888;">\u90E8\u7F72\u5206\u652F</span><span style="color:#fff;">${info.deployBranch}</span>
            <span style="color:#888;">\u6784\u5EFA\u65F6\u95F4</span><span style="color:#888;">${info.buildTime.replace("T", " ").replace(/-/g, "/")}</span>
        </div>
        <div style="margin-top:24px; text-align:center;">
            <button onclick="document.getElementById('version-modal').remove()" style="
                background: #4a9eff; color: #000; border: none;
                padding: 8px 24px; border-radius: 8px; cursor: pointer;
                font-size: 14px;
            ">\u5173\u95ED</button>
        </div>
    </div>
    `;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
    return modal;
  }
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if (e.shiftKey && e.ctrlKey && e.key === "V") {
        e.preventDefault();
        showVersionModal();
      }
    });
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
    window.getVersionInfo = getVersionInfo;
    window.showVersionModal = showVersionModal;
  }
  console.log("[Main] main.js \u6A21\u5757\u52A0\u8F7D\u5B8C\u6210");
  return __toCommonJS(main_exports);
})();

;window.__GAME_VERSION__="DDD-v1.0.0-2b7b4ff-2026-06-06T13-07-55-693Z";
