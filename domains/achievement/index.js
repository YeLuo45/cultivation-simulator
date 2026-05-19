// domains/achievement/index.js
// Achievement domain exports
// Phase 2 DDD refactoring

// Entities
export { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITIES, REWARD_TYPES, REQUIREMENT_TYPES, getAchievementStatus, canClaimStage, isAchievementUnlocked } from './entities/Achievement.js';

// Services
export { AchievementService, achievementService } from './services/AchievementService.js';
