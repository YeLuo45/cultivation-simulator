// domains/cultivation/services/SectService.js
// Sect domain service - extracted from game.js
// Phase 3 DDD refactoring

import { SECT_CONFIG, SECT_TECHNIQUES } from '../../shared/constants/cultivation.js';

/**
 * SectService - handles sect join, contribute and buy operations
 */
export class SectService {
  /**
   * Join a sect
   * @param {Object} gameState - Game state
   * @param {string} sectName - Name of sect to join
   * @returns {Object} Result { success, message }
   */
  join(gameState, sectName) {
    if (gameState.sect && gameState.sect.name && gameState.sect.name.length > 0) {
      return { success: false, message: '你已经在宗门中了！' };
    }
    
    // Initialize sect if not exists
    if (!gameState.sect) {
      gameState.sect = {
        name: sectName,
        level: 1,
        disciples: [],
        spiritStones: 0,
        reputation: 0,
        elders: [],
        contributionShop: []
      };
    } else {
      gameState.sect.name = sectName;
    }
    
    // Add player as disciple
    const playerDisciple = {
      uid: 'player',
      name: '你',
      realm: gameState.realm,
      stage: gameState.stage,
      contribution: 0,
      status: 'idle'
    };
    
    // Remove existing player record if any
    gameState.sect.disciples = gameState.sect.disciples.filter(d => d.uid !== 'player');
    gameState.sect.disciples.push(playerDisciple);
    
    return { success: true, message: `成功加入${sectName}！` };
  }

  /**
   * Contribute resources to sect
   * @param {Object} gameState - Game state
   * @param {number} amount - Amount to contribute
   * @returns {Object} Result { success, message, contributed }
   */
  contribute(gameState, amount) {
    if (!gameState.sect || !gameState.sect.name) {
      return { success: false, message: '你还没有加入宗门！' };
    }
    
    if (amount <= 0) {
      return { success: false, message: '贡献数量必须大于0！' };
    }
    
    if (gameState.spiritStones < amount) {
      return { success: false, message: '灵石不足！' };
    }
    
    gameState.spiritStones -= amount;
    gameState.sect.spiritStones = (gameState.sect.spiritStones || 0) + amount;
    
    // Update player contribution
    const myDisciple = gameState.sect.disciples?.find(d => d.uid === 'player');
    if (myDisciple) {
      myDisciple.contribution = (myDisciple.contribution || 0) + amount;
    }
    
    return { 
      success: true, 
      message: `向宗门贡献了${amount}灵石！`,
      contributed: amount
    };
  }

  /**
   * Buy item from contribution shop
   * @param {Object} gameState - Game state
   * @param {number} idx - Shop item index
   * @returns {Object} Result { success, message }
   */
  buyContributionItem(gameState, idx) {
    const sect = gameState.sect;
    if (!sect || !sect.name) {
      return { success: false, message: '你还没有加入宗门！' };
    }
    
    const item = sect.contributionShop?.[idx];
    if (!item) {
      return { success: false, message: '物品不存在！' };
    }
    
    const myDisciple = sect.disciples?.find(d => d.uid === 'player');
    const contribution = myDisciple?.contribution || 0;
    
    if (contribution < item.cost) {
      return { success: false, message: '贡献点不足！' };
    }
    
    // Deduct contribution
    myDisciple.contribution -= item.cost;
    
    // Grant item
    let grantedItem = null;
    if (item.type === 'technique') {
      const tech = SECT_TECHNIQUES[item.data];
      if (tech && !gameState.techniques?.find(t => t.name === item.data)) {
        gameState.techniques = gameState.techniques || [];
        gameState.techniques.push({
          name: item.data,
          grade: tech.grade,
          level: 1,
          maxLevel: 5,
          icon: tech.icon,
          desc: tech.desc,
          effect: tech.effect
        });
        grantedItem = item.data;
      }
    } else if (item.type === 'pill') {
      grantedItem = this.addItemToInventory(gameState, item.data, item.quantity || 1);
    } else if (item.type === 'buff') {
      grantedItem = item.name;
    }
    
    return { 
      success: true, 
      message: grantedItem ? `获得 ${grantedItem}！` : `获得 ${item.name}！`
    };
  }

  /**
   * Add item to inventory
   * @param {Object} gameState - Game state
   * @param {string} name - Item name
   * @param {number} quantity - Quantity
   * @returns {string} Item name
   */
  addItemToInventory(gameState, name, quantity) {
    const existing = gameState.inventory?.find(i => i.name === name);
    if (existing) {
      existing.quantity += quantity;
    } else {
      gameState.inventory = gameState.inventory || [];
      gameState.inventory.push({ name, quantity });
    }
    return name;
  }

  /**
   * Get player contribution points
   * @param {Object} gameState - Game state
   * @returns {number} Contribution points
   */
  getPlayerContribution(gameState) {
    if (!gameState.sect) return 0;
    const myDisciple = gameState.sect.disciples?.find(d => d.uid === 'player');
    return myDisciple?.contribution || 0;
  }

  /**
   * Check if player is in a sect
   * @param {Object} gameState - Game state
   * @returns {boolean}
   */
  isInSect(gameState) {
    return gameState.sect?.name && gameState.sect.name.length > 0;
  }

  /**
   * Get sect config
   * @returns {Object} SECT_CONFIG
   */
  getConfig() {
    return SECT_CONFIG;
  }
}

export const sectService = new SectService();
export default sectService;
