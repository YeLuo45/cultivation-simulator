// domains/achievement/services/AchievementService.js
// Achievement domain service - extracted from game.js
// Phase 2 DDD refactoring

import { ACHIEVEMENTS, ACHIEVEMENT_ID_MAP } from '../shared/constants/achievement.js';
import { SET_BONUSES } from '../shared/constants/inventory.js';

export class AchievementService {
  /**
   * Get achievement points for a rarity
   * @param {string} rarity - Achievement rarity
   * @returns {number} Points value
   */
  getPoints(rarity) {
    const basePoints = { common: 10, rare: 25, legendary: 50, mythic: 100 };
    const base = basePoints[rarity] || 10;
    // These functions should be provided via gameState or external
    return base;
  }

  /**
   * Check and update all achievements
   * @param {Object} gameState - Game state
   * @returns {Array} Newly unlocked achievements
   */
  check(gameState) {
    const newlyUnlocked = [];
    
    if (!gameState.achievements) {
      gameState.achievements = {
        unlocked: [],
        titles: [],
        stats: {
          tribulationsCompleted: 0,
          dungeonBossesKilled: 0,
          sectContributions: 0,
          treasuresRefined: 0,
          serendipitiesEncountered: 0,
          flawlessTribulations: 0
        },
        progress: {},
        claimedStages: {},
        seasonPoints: 0,
        seasonRewards: []
      };
    }

    const ach = gameState.achievements;
    if (!ach.progress) ach.progress = {};
    if (!ach.claimedStages) ach.claimedStages = {};

    for (const achievement of ACHIEVEMENTS) {
      // Skip non-current season achievements
      if (achievement.season && achievement.season !== gameState.currentSeason) continue;

      const req = achievement.requirement;
      const progressKey = achievement.id;
      let currentProgress = ach.progress[progressKey] || 0;
      let newProgress = currentProgress;

      // Calculate progress
      if (req) {
        if (req.type === 'stat') {
          const statValue = ach.stats[req.key] || 0;
          newProgress = Math.max(currentProgress, statValue);
          ach.progress[progressKey] = newProgress;
        } else if (req.type === 'realm') {
          newProgress = Math.max(currentProgress, gameState.realm);
          ach.progress[progressKey] = newProgress;
        } else if (req.type === 'set') {
          const set = SET_BONUSES[req.setName];
          if (set) {
            const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
            const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
            const allPieces = [...new Set([...equipped, ...owned])];
            const collectedCount = set.pieces.filter(p => allPieces.includes(p)).length;
            newProgress = Math.max(currentProgress, collectedCount);
            ach.progress[progressKey] = newProgress;
          }
        } else if (req.type === 'allCommon') {
          const commonAchs = ACHIEVEMENTS.filter(a => a.rarity === 'common');
          const allUnlocked = commonAchs.every(a => ach.unlocked.includes(a.id));
          newProgress = allUnlocked ? 1 : 0;
          ach.progress[progressKey] = newProgress;
        }
      } else if (achievement.stages) {
        newProgress = currentProgress;
      }

      // Handle stage rewards
      if (achievement.stages) {
        const claimed = ach.claimedStages[progressKey] || [];
        for (let i = 0; i < achievement.stages.length; i++) {
          if (claimed.includes(i)) continue;
          const stage = achievement.stages[i];
          if (newProgress >= stage.value) {
            claimed.push(i);
          }
        }
        ach.claimedStages[progressKey] = claimed;
      }

      // Check if achievement is fully unlocked
      const alreadyUnlocked = ach.unlocked.includes(achievement.id);
      if (!alreadyUnlocked) {
        let unlocked = false;

        if (req) {
          if (req.type === 'stat') {
            if ((ach.stats[req.key] || 0) >= req.value) unlocked = true;
          } else if (req.type === 'realm') {
            if (gameState.realm >= req.value) unlocked = true;
          } else if (req.type === 'set') {
            const set = SET_BONUSES[req.setName];
            if (set) {
              const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
              const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
              const allPieces = [...new Set([...equipped, ...owned])];
              unlocked = set.pieces.every(p => allPieces.includes(p));
            }
          } else if (req.type === 'allCommon') {
            unlocked = newProgress >= 1;
          }
        } else if (achievement.stages) {
          const lastStage = achievement.stages[achievement.stages.length - 1];
          if (newProgress >= lastStage.value) unlocked = true;
        }

        if (unlocked) {
          ach.unlocked.push(achievement.id);
          
          // Apply reward
          if (achievement.reward) {
            this.applyReward(gameState, achievement.reward);
          }
          
          // Grant title
          if (achievement.title && !ach.titles.includes(achievement.title)) {
            ach.titles.push(achievement.title);
            if (!gameState.title || gameState.title === '筑基修士') {
              gameState.title = achievement.title;
            }
          }

          // Calculate season points
          const points = this.getPoints(achievement.rarity);
          ach.seasonPoints += points;

          newlyUnlocked.push(achievement);
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * Apply achievement reward to game state
   * @param {Object} gameState - Game state
   * @param {Object} reward - Reward object
   */
  applyReward(gameState, reward) {
    if (!reward) return;
    switch (reward.type) {
      case 'attribute':
        // Attribute bonus recorded to corresponding field
        break;
      case 'title':
        if (reward.title && gameState.achievements && !gameState.achievements.titles.includes(reward.title)) {
          gameState.achievements.titles.push(reward.title);
        }
        break;
      case 'frame':
        gameState.equippedFrame = reward.item;
        break;
      case 'bubble':
        gameState.equippedBubble = reward.item;
        break;
      case 'item':
        if (reward.item && reward.quantity) {
          // Add to inventory via addItemToInventory
          gameState.inventory = gameState.inventory || [];
          const existing = gameState.inventory.find(i => i.name === reward.item);
          if (existing) {
            existing.quantity += reward.quantity;
          } else {
            gameState.inventory.push({ name: reward.item, quantity: reward.quantity });
          }
        }
        break;
      case 'pet':
        // Pet unlock logic
        break;
    }
  }

  /**
   * Claim achievement stage reward
   * @param {Object} gameState - Game state
   * @param {string} achId - Achievement ID
   * @param {number} stageIdx - Stage index
   * @returns {Object} Result { success, message }
   */
  claimStage(gameState, achId, stageIdx) {
    const ach = ACHIEVEMENTS.find(a => a.id === achId);
    if (!ach || !ach.stages) {
      return { success: false, message: '成就或阶段不存在' };
    }
    const stage = ach.stages[stageIdx];
    if (!stage) {
      return { success: false, message: '阶段不存在' };
    }
    
    const claimed = gameState.achievements.claimedStages[achId] || [];
    if (claimed.includes(stageIdx)) {
      return { success: false, message: '已领取过该阶段' };
    }
    
    const progress = gameState.achievements.progress[achId] || 0;
    if (progress < stage.value) {
      return { success: false, message: '进度不足' };
    }
    
    claimed.push(stageIdx);
    gameState.achievements.claimedStages[achId] = claimed;
    
    // Apply reward
    this.applyReward(gameState, stage.reward);
    
    return { success: true, message: `领取了【${ach.name}】阶段${stageIdx + 1}奖励` };
  }

  /**
   * Claim season reward
   * @param {Object} gameState - Game state
   * @param {number} rewardIdx - Reward index
   * @param {Array} SEASONS - Seasons array
   * @returns {Object} Result { success, message }
   */
  claimSeasonReward(gameState, rewardIdx, SEASONS) {
    const season = SEASONS.find(s => s.id === gameState.currentSeason);
    if (!season) {
      return { success: false, message: '当前没有活动赛季' };
    }
    const reward = season.rewards[rewardIdx];
    if (!reward) {
      return { success: false, message: '奖励不存在' };
    }
    
    if (gameState.achievements.seasonRewards.includes(rewardIdx)) {
      return { success: false, message: '已领取过该奖励' };
    }
    
    if (gameState.achievements.seasonPoints < reward.points) {
      return { success: false, message: `积分不足，需要 ${reward.points} 积分，当前 ${gameState.achievements.seasonPoints}` };
    }
    
    gameState.achievements.seasonPoints -= reward.points;
    gameState.achievements.seasonRewards.push(rewardIdx);
    
    if (reward.type === 'frame') gameState.equippedFrame = reward.item;
    if (reward.type === 'bubble') gameState.equippedBubble = reward.item;
    if (reward.type === 'title' && reward.item) {
      if (!gameState.achievements.titles.includes(reward.item)) {
        gameState.achievements.titles.push(reward.item);
      }
    }
    
    return { success: true, message: `已兑换：${reward.item}` };
  }

  /**
   * Filter achievements by category
   * @param {string} category - Category to filter
   * @returns {Array} Filtered achievements
   */
  filter(category) {
    if (category === 'all') {
      return ACHIEVEMENTS;
    }
    return ACHIEVEMENTS.filter(a => a.category === category);
  }

  /**
   * Get achievement progress percentage
   * @param {Object} achievement - Achievement definition
   * @param {Object} ach - Achievement state
   * @returns {number} Progress percentage (0-100)
   */
  getProgress(achievement, ach) {
    const req = achievement.requirement;
    if (!req) return 0;
    
    if (req.type === 'stat') {
      const current = ach.stats[req.key] || 0;
      return Math.min(100, (current / req.value) * 100);
    } else if (req.type === 'realm') {
      return gameState => gameState.realm >= req.value ? 100 : 0;
    } else if (req.type === 'set') {
      const set = SET_BONUSES[req.setName];
      if (!set) return 0;
      const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
      const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
      const allPieces = [...new Set([...equipped.filter(p => p), ...owned])];
      return Math.min(100, (allPieces.length / set.pieces.length) * 100);
    }
    return 0;
  }

  /**
   * Get achievement progress text
   * @param {Object} achievement - Achievement definition
   * @param {Object} ach - Achievement state
   * @returns {string} Progress text
   */
  getProgressText(achievement, ach) {
    const req = achievement.requirement;
    if (!req) return '';
    
    if (req.type === 'stat') {
      const current = ach.stats[req.key] || 0;
      return `${current}/${req.value}`;
    } else if (req.type === 'realm') {
      return `当前：${gameState?.realm || 0}`;
    } else if (req.type === 'set') {
      const set = SET_BONUSES[req.setName];
      if (!set) return '0/2';
      const equipped = gameState.equippedTreasures.map(t => t ? t.name : null);
      const owned = gameState.inventory.filter(i => set.pieces.includes(i.name)).map(i => i.name);
      const allPieces = [...new Set([...equipped.filter(p => p), ...owned])];
      return `${allPieces.length}/${set.pieces.length}`;
    }
    return '';
  }

  /**
   * Get reward text for an achievement
   * @param {Object} achievement - Achievement definition
   * @returns {string} Reward description
   */
  getRewardText(achievement) {
    const r = achievement.reward;
    if (!r) return '';
    
    if (r.type === 'attribute') {
      const bonusText = r.bonus >= 0 ? `+${Math.round(r.bonus * 100)}%` : `${Math.round(r.bonus * 100)}%`;
      const targetNames = {
        cultivationSpeed: '修炼速度',
        attack: '攻击',
        defense: '防御',
        craftingSuccess: '炼器成功率',
        serendipityRate: '奇遇触发率',
        realmSuppression: '境界压制',
        setBonus: '套装效果',
        tribulationCost: '渡劫消耗',
        sectContribution: '宗门贡献'
      };
      return `${targetNames[r.target] || r.target}${bonusText}`;
    }
    return '';
  }

  /**
   * Get season countdown text
   * @param {Object} gameState - Game state
   * @param {Array} SEASONS - Seasons array
   * @returns {string} Countdown text
   */
  getSeasonCountdown(gameState, SEASONS) {
    const season = SEASONS.find(s => s.id === gameState.currentSeason);
    if (!season) return '无活动赛季';
    const end = new Date(season.endDate).getTime();
    const now = Date.now();
    const days = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60)) % 24);
    return `剩余 ${days} 天 ${hours} 小时`;
  }

  /**
   * Get title bonuses from all unlocked achievements
   * @param {Object} gameState - Game state
   * @returns {Object} Bonuses object
   */
  getTitleBonus(gameState) {
    const bonuses = {
      cultivationSpeed: 0,
      attack: 0,
      defense: 0,
      craftingSuccess: 0,
      serendipityRate: 0,
      realmSuppression: 0,
      setBonus: 0,
      tribulationCost: 0,
      sectContribution: 0
    };

    if (!gameState.title || !gameState.achievements) return bonuses;

    const ach = gameState.achievements;
    for (const achievement of ACHIEVEMENTS) {
      if (ach.unlocked.includes(achievement.id)) {
        const reward = achievement.reward;
        if (reward && reward.type === 'attribute') {
          if (bonuses.hasOwnProperty(reward.target)) {
            bonuses[reward.target] += reward.bonus;
          }
        }
      }
    }

    return bonuses;
  }

  /**
   * Equip a title
   * @param {Object} gameState - Game state
   * @param {string} titleName - Title to equip
   * @returns {Object} Result { success, message }
   */
  equipTitle(gameState, titleName) {
    if (!gameState.achievements || !gameState.achievements.titles.includes(titleName)) {
      return { success: false, message: '你还没有获得这个称号' };
    }
    gameState.title = titleName;
    return { success: true, message: `已装备称号：【${titleName}】` };
  }

  /**
   * Get achievement by ID
   * @param {string} id - Achievement ID
   * @returns {Object|null} Achievement or null
   */
  getById(id) {
    return ACHIEVEMENTS.find(a => a.id === id) || null;
  }

  /**
   * Get all unlocked achievement IDs
   * @param {Object} gameState - Game state
   * @returns {Array} Unlocked achievement IDs
   */
  getUnlocked(gameState) {
    return gameState.achievements?.unlocked || [];
  }

  /**
   * Get all owned titles
   * @param {Object} gameState - Game state
   * @returns {Array} Owned titles
   */
  getOwnedTitles(gameState) {
    return gameState.achievements?.titles || [];
  }

  /**
   * Check if a specific achievement is unlocked
   * @param {Object} gameState - Game state
   * @param {string} achId - Achievement ID
   * @returns {boolean}
   */
  isUnlocked(gameState, achId) {
    return gameState.achievements?.unlocked?.includes(achId) || false;
  }
}

export const achievementService = new AchievementService();
