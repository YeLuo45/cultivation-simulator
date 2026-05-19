// domains/inventory/services/InventoryService.js
// Inventory domain service - extracted from game.js
// Phase 2 DDD refactoring

import { PILLS, TREASURES, HEAVENLY_DAO_EQUIPMENTS, MATERIALS, COMBAT_TREASURES, COMBAT_PILLS } from '../shared/constants/inventory.js';

export class InventoryService {
  /**
   * Get item count in inventory
   * @param {Array} inventory - Player inventory array
   * @param {string} name - Item name to find
   * @returns {number} Item quantity
   */
  getItemCount(inventory, name) {
    const item = inventory.find(i => i.name === name);
    return item ? item.quantity : 0;
  }

  /**
   * Add item to inventory (simple version without full details)
   * @param {Array} inventory - Player inventory array
   * @param {string} name - Item name
   * @param {number} quantity - Quantity to add
   */
  addItem(inventory, name, quantity) {
    const existing = inventory.find(i => i.name === name);
    if (existing) {
      existing.quantity += quantity;
    } else {
      inventory.push({ name, quantity });
    }
  }

  /**
   * Remove item from inventory
   * @param {Array} inventory - Player inventory array
   * @param {string} name - Item name to remove
   * @param {number} quantity - Quantity to remove
   */
  removeItem(inventory, name, quantity) {
    const idx = inventory.findIndex(i => i.name === name);
    if (idx !== -1) {
      inventory[idx].quantity -= quantity;
      if (inventory[idx].quantity <= 0) {
        inventory.splice(idx, 1);
      }
    }
  }

  /**
   * Check if player has item with specified quantity
   * @param {Array} inventory - Player inventory array
   * @param {string} name - Item name
   * @param {number} quantity - Required quantity
   * @returns {boolean} True if player has enough
   */
  hasItem(inventory, name, quantity) {
    return this.getItemCount(inventory, name) >= quantity;
  }

  /**
   * Find item in inventory
   * @param {Array} inventory - Player inventory array
   * @param {string} name - Item name
   * @returns {Object|null} Found item or null
   */
  findItem(inventory, name) {
    return inventory.find(i => i.name === name) || null;
  }

  /**
   * Find item index in inventory
   * @param {Array} inventory - Player inventory array
   * @param {string} name - Item name
   * @param {string} type - Item type (optional)
   * @returns {number} Index or -1
   */
  findItemIndex(inventory, name, type = null) {
    if (type) {
      return inventory.findIndex(i => i.name === name && i.type === type);
    }
    return inventory.findIndex(i => i.name === name);
  }

  /**
   * Equip a treasure from inventory
   * @param {Array} inventory - Player inventory
   * @param {Array} equippedTreasures - Equipped treasures array (4 slots)
   * @param {string} name - Treasure name
   * @param {number} idx - Inventory slot index
   * @returns {Object} Result { success, message }
   */
  equipTreasure(inventory, equippedTreasures, name, idx) {
    const treasure = TREASURES[name];
    if (!treasure) {
      return { success: false, message: '无效的灵宝' };
    }

    // Find empty slot
    const emptySlot = equippedTreasures.findIndex(t => t === null);
    if (emptySlot === -1) {
      return { success: false, message: '装备栏已满' };
    }

    // Find item in inventory
    const itemIdx = inventory.findIndex(i => i.name === name && i.type === 'treasure');
    if (itemIdx === -1) {
      return { success: false, message: '背包中没有该灵宝' };
    }

    const item = inventory[itemIdx];
    const star = item.star || 1;
    item.quantity--;
    if (item.quantity <= 0) {
      inventory.splice(itemIdx, 1);
    }

    // Equip
    equippedTreasures[emptySlot] = {
      name: item.name,
      type: item.type,
      quality: item.quality,
      effect: item.effect,
      desc: item.desc,
      icon: item.icon,
      star
    };

    return { success: true, message: `装备了${name}` };
  }

  /**
   * Unequip a treasure to inventory
   * @param {Array} inventory - Player inventory
   * @param {Array} equippedTreasures - Equipped treasures array
   * @param {number} slotIndex - Slot index to unequip
   * @returns {Object} Result { success, message, item }
   */
  unequipTreasure(inventory, equippedTreasures, slotIndex) {
    const treasure = equippedTreasures[slotIndex];
    if (!treasure) {
      return { success: false, message: '该槽位没有装备' };
    }

    const invItem = {
      type: treasure.type,
      name: treasure.name,
      quantity: 1,
      quality: treasure.quality,
      effect: treasure.effect,
      desc: treasure.desc,
      icon: treasure.icon,
      star: treasure.star || 1
    };
    
    // Add back to inventory
    const existing = inventory.find(i => i.name === invItem.name && i.type === invItem.type);
    if (existing) {
      existing.quantity += 1;
    } else {
      inventory.push(invItem);
    }
    
    equippedTreasures[slotIndex] = null;
    
    return { success: true, message: `卸下了${treasure.name}`, item: invItem };
  }

  /**
   * Equip a heavenly dao equipment
   * @param {Array} inventory - Player inventory
   * @param {Array} equippedHeavenlyDao - Heavenly dao slot (slot 3)
   * @param {string} name - Heavenly dao equipment name
   * @returns {Object} Result { success, message }
   */
  equipHeavenlyDao(inventory, equippedHeavenlyDao, name) {
    const hdEquip = HEAVENLY_DAO_EQUIPMENTS[name];
    if (!hdEquip) {
      return { success: false, message: '无效的天道法则装备' };
    }

    // Find item in inventory
    const itemIdx = inventory.findIndex(i => i.name === name);
    if (itemIdx === -1) {
      return { success: false, message: '背包中没有该装备' };
    }

    const item = inventory[itemIdx];
    item.quantity--;
    if (item.quantity <= 0) {
      inventory.splice(itemIdx, 1);
    }

    // Equip heavenly dao
    equippedHeavenlyDao[3] = {
      name: item.name,
      type: 'heavenly',
      quality: 'ultimate',
      desc: item.desc,
      icon: item.icon || hdEquip.icon,
      baseEffect: hdEquip.baseEffect,
      lawEffect: hdEquip.lawEffect,
      star: item.star || 1
    };

    return { success: true, message: `装备了天道法则装备【${name}】` };
  }

  /**
   * Unequip heavenly dao equipment
   * @param {Array} inventory - Player inventory
   * @param {Array} equippedHeavenlyDao - Heavenly dao slot (slot 3)
   * @returns {Object} Result { success, message, item }
   */
  unequipHeavenlyDao(inventory, equippedHeavenlyDao) {
    const heavenlyDao = equippedHeavenlyDao[3];
    if (!heavenlyDao) {
      return { success: false, message: '没有装备天道法则装备' };
    }

    const invItem = {
      type: 'heavenly',
      name: heavenlyDao.name,
      quantity: 1,
      quality: 'ultimate',
      effect: heavenlyDao.baseEffect,
      desc: heavenlyDao.desc,
      icon: heavenlyDao.icon,
      star: heavenlyDao.star || 1,
      lawEffect: heavenlyDao.lawEffect
    };

    // Add back to inventory
    const existing = inventory.find(i => i.name === invItem.name && i.type === invItem.type);
    if (existing) {
      existing.quantity += 1;
    } else {
      inventory.push(invItem);
    }

    equippedHeavenlyDao[3] = null;

    return { success: true, message: `卸下了${heavenlyDao.name}`, item: invItem };
  }

  /**
   * Generate shop items (random selection)
   * @param {Object} gameState - Game state
   */
  generateShopItems(gameState) {
    const allItems = [];

    // Collect all pills and treasures
    for (const [name, pill] of Object.entries(PILLS)) {
      allItems.push({ type: 'pill', name, ...pill });
    }
    for (const [name, treasure] of Object.entries(TREASURES)) {
      allItems.push({ type: 'treasure', name, ...treasure });
    }
    // Combat items
    for (const [name, treasure] of Object.entries(COMBAT_TREASURES)) {
      allItems.push({ type: 'treasure', name, ...treasure });
    }
    // Challenge scroll
    allItems.push({ type: 'special', name: '挑战状', quality: 'common', price: 500, desc: '用于发起斗法挑战', icon: '📜' });
    // Combat pills
    for (const [name, pill] of Object.entries(COMBAT_PILLS)) {
      allItems.push({ type: 'pill', name, ...pill, price: pill.price || 1000 });
    }

    // Random select 8-12 items
    const count = 8 + Math.floor(Math.random() * 5);
    const shuffled = allItems.sort(() => Math.random() - 0.5);
    gameState.shopItems = shuffled.slice(0, Math.min(count, allItems.length));
    gameState.lastShopDay = gameState.days;
  }

  /**
   * Buy item from shop
   * @param {Array} inventory - Player inventory
   * @param {Object} gameState - Game state
   * @param {Array} shopItems - Shop items array
   * @param {number} idx - Shop item index
   * @returns {Object} Result { success, message }
   */
  buyItem(inventory, gameState, shopItems, idx) {
    const item = shopItems[idx];
    if (!item) {
      return { success: false, message: '物品不存在' };
    }
    
    if (gameState.spiritStones < item.price) {
      return { success: false, message: '灵石不足' };
    }
    
    if (inventory.length >= gameState.maxInventorySlots) {
      return { success: false, message: '背包已满' };
    }
    
    gameState.spiritStones -= item.price;
    
    // Add to inventory
    const existing = inventory.find(i => i.name === item.name && i.type === item.type);
    if (existing) {
      existing.quantity += 1;
    } else {
      inventory.push({
        type: item.type,
        name: item.name,
        quantity: 1,
        quality: item.quality,
        effect: item.effect || {},
        desc: item.desc,
        icon: item.icon,
        star: 1
      });
    }
    
    return { success: true, message: `购买了${item.name}` };
  }

  /**
   * Sell item from inventory
   * @param {Array} inventory - Player inventory
   * @param {Object} gameState - Game state
   * @param {number} idx - Inventory item index
   * @param {string} currentInvTab - Current inventory tab filter
   * @returns {Object} Result { success, message, price }
   */
  sellItem(inventory, gameState, idx, currentInvTab = 'all') {
    let items = inventory;
    if (currentInvTab !== 'all') {
      items = items.filter(item => item.type === currentInvTab);
    }
    const item = items[idx];
    if (!item) {
      return { success: false, message: '物品不存在' };
    }
    
    // Calculate sell price
    let price = 10;
    if (item.type === 'material' && MATERIALS[item.name]) {
      price = Math.floor(MATERIALS[item.name].basePrice * 0.3);
    } else {
      const prices = { common: 8, rare: 40, precious: 150, legendary: 800 };
      price = prices[item.quality] || 10;
    }
    
    item.quantity--;
    if (item.quantity <= 0) {
      const actualIdx = inventory.findIndex(i => i === item);
      if (actualIdx !== -1) {
        inventory.splice(actualIdx, 1);
      }
    }
    
    gameState.spiritStones += price;
    
    return { success: true, message: `出售了${item.name}，获得${price}灵石`, price };
  }

  /**
   * Discard item from inventory
   * @param {Array} inventory - Player inventory
   * @param {number} idx - Inventory item index
   * @param {string} currentInvTab - Current inventory tab filter
   * @returns {Object} Result { success, message }
   */
  discardItem(inventory, idx, currentInvTab = 'all') {
    let items = inventory;
    if (currentInvTab !== 'all') {
      items = items.filter(item => item.type === currentInvTab);
    }
    const item = items[idx];
    if (!item) {
      return { success: false, message: '物品不存在' };
    }
    
    item.quantity--;
    if (item.quantity <= 0) {
      const actualIdx = inventory.findIndex(i => i === item);
      if (actualIdx !== -1) {
        inventory.splice(actualIdx, 1);
      }
    }
    
    return { success: true, message: `丢弃了${item.name}` };
  }

  /**
   * List item on market
   * @param {Array} marketListings - Market listings array
   * @param {Array} inventory - Player inventory
   * @param {string} name - Item name
   * @param {number} basePrice - Base price for listing
   * @param {Object} gameState - Game state (for spiritStones and days)
   * @returns {Object} Result { success, message }
   */
  listItem(marketListings, inventory, name, basePrice, gameState) {
    // Find item in inventory
    const item = inventory.find(i => i.name === name);
    if (!item) {
      return { success: false, message: '背包中没有该物品' };
    }

    // Calculate fee (5%)
    const fee = Math.floor(basePrice * 0.05);
    if (gameState.spiritStones < fee) {
      return { success: false, message: `上架费${fee}灵石不足` };
    }

    gameState.spiritStones -= fee;

    // Consume item
    item.quantity -= 1;
    if (item.quantity <= 0) {
      const idx = inventory.findIndex(i => i === item);
      if (idx !== -1) {
        inventory.splice(idx, 1);
      }
    }

    // Add to market
    marketListings.push({
      name,
      price: basePrice,
      seller: '玩家',
      day: gameState.days
    });

    return { success: true, message: `${name}已上架，售价${basePrice}灵石(手续费${fee})` };
  }

  /**
   * Buy contribution item from sect shop
   * @param {Object} gameState - Game state
   * @param {number} idx - Shop item index
   * @param {Object} sect - Sect state
   * @param {Function} getPlayerContribution - Function to get player contribution
   * @returns {Object} Result { success, message }
   */
  buyContributionItem(gameState, idx, sect, getPlayerContribution) {
    const item = sect.contributionShop[idx];
    
    if (!item) {
      return { success: false, message: '物品不存在' };
    }
    
    const contribution = getPlayerContribution();
    if (contribution < item.cost) {
      return { success: false, message: '贡献点不足' };
    }
    
    // Deduct contribution
    const myDisciple = sect.disciples.find(d => d.uid === 'player');
    if (myDisciple) {
      myDisciple.contribution -= item.cost;
    }
    
    // Give item based on type
    if (item.type === 'technique') {
      // Technique handling - return info for caller to process
      return { success: true, message: `获得 ${item.data}！`, item };
    } else if (item.type === 'pill') {
      this.addItem(gameState.inventory, item.data, item.quantity || 1);
      return { success: true, message: `获得 ${item.name}！`, item };
    } else if (item.type === 'buff') {
      return { success: true, message: `获得 ${item.name}！`, item };
    }
    
    return { success: true, message: '购买成功' };
  }
}

export const inventoryService = new InventoryService();
