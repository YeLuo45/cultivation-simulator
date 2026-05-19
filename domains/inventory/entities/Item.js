// domains/inventory/entities/Item.js
// Item types and interfaces extracted from game.js
// Phase 2 DDD refactoring

export const ITEM_TYPES = {
  PILLS: 'pills',
  TREASURE: 'treasure',
  MATERIAL: 'material',
  COMBAT_ITEM: 'combat_item'
};

export const ITEM_QUALITIES = {
  COMMON: 'common',
  RARE: 'rare',
  PRECIOUS: 'precious',
  LEGENDARY: 'legendary',
  ULTIMATE: 'ultimate'
};

/**
 * Creates an Item object
 * @param {string} name - Item name
 * @param {string} type - Item type (pills, treasure, material, combat_item)
 * @param {number} quantity - Item quantity
 * @param {Object} options - Additional item properties
 * @returns {Object} Item object
 */
export function createItem(name, type, quantity = 1, options = {}) {
  return {
    name,
    type,
    quantity,
    id: `${name}_${Date.now()}`,
    quality: options.quality || 'common',
    effect: options.effect || {},
    desc: options.desc || '',
    icon: options.icon || '📦',
    star: options.star || 1,
    ...options
  };
}

/**
 * Creates a treasure item
 */
export function createTreasure(name, quality, effect, desc, icon, star = 1) {
  return createItem(name, ITEM_TYPES.TREASURE, 1, {
    quality,
    effect,
    desc,
    icon,
    star
  });
}

/**
 * Creates a pill item
 */
export function createPill(name, quality, effect, desc, icon) {
  return createItem(name, ITEM_TYPES.PILLS, 1, {
    quality,
    effect,
    desc,
    icon
  });
}

/**
 * Creates a material item
 */
export function createMaterial(name, basePrice, icon, desc) {
  return createItem(name, ITEM_TYPES.MATERIAL, 1, {
    basePrice,
    icon,
    desc
  });
}
