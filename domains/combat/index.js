// domains/combat/index.js
// Combat domain exports - Phase 4 DDD refactoring

// Entities
export { CombatState } from './entities/CombatState.js';
export { Action, ACTION_TYPES } from './entities/Action.js';

// Services
export { CombatService, combatService } from './services/CombatService.js';
export { CombatAIService, combatAIService } from './services/CombatAIService.js';
export { CombatPVPService, combatPVPService } from './services/CombatPVPService.js';
