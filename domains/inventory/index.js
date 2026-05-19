// domains/inventory/index.js
// Inventory domain exports
// Phase 2 DDD refactoring

// Entities
export { ITEM_TYPES, ITEM_QUALITIES, createItem, createTreasure, createPill, createMaterial } from './entities/Item.js';

// Services
export { InventoryService, inventoryService } from './services/InventoryService.js';
