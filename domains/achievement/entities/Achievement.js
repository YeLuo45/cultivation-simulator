// domains/achievement/entities/Achievement.js
// Achievement types and interfaces extracted from game.js
// Phase 2 DDD refactoring

export const ACHIEVEMENT_CATEGORIES = {
  CULTIVATION: 'cultivation',
  COMBAT: 'combat',
  STORY: 'story',
  COLLECTION: 'collection',
  EXPLORATION: 'exploration',
  SOCIAL: 'social',
  SPECIAL: 'special'
};

export const ACHIEVEMENT_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic'
};

export const REWARD_TYPES = {
  ATTRIBUTE: 'attribute',
  TITLE: 'title',
  FRAME: 'frame',
  BUBBLE: 'bubble',
  ITEM: 'item',
  PET: 'pet'
};

/**
 * Achievement requirement types
 */
export const REQUIREMENT_TYPES = {
  STAT: 'stat',
  REALM: 'realm',
  SET: 'set',
  ALL_COMMON: 'allCommon'
};

/**
 * Creates an achievement progress tracker
 * @param {Object} achievement - The achievement definition
 * @param {Object} achState - Current achievement state
 * @returns {Object} Progress info
 */
export function getAchievementStatus(achievement, achState) {
  const progress = achState.progress?.[achievement.id] || 0;
  const claimed = achState.claimedStages?.[achievement.id] || [];
  const unlocked = achState.unlocked?.includes(achievement.id) || false;
  
  let targetValue = 100;
  if (achievement.stages) {
    targetValue = achievement.stages[achievement.stages.length - 1].value;
  } else if (achievement.requirement?.value) {
    targetValue = achievement.requirement.value;
  }
  
  return {
    progress,
    targetValue,
    percentage: Math.min(100, Math.round((progress / targetValue) * 100)),
    claimed,
    unlocked
  };
}

/**
 * Checks if a stage reward can be claimed
 */
export function canClaimStage(achievement, achState, stageIdx) {
  if (!achievement.stages) return false;
  const stage = achievement.stages[stageIdx];
  if (!stage) return false;
  
  const claimed = achState.claimedStages?.[achievement.id] || [];
  if (claimed.includes(stageIdx)) return false;
  
  const progress = achState.progress?.[achievement.id] || 0;
  return progress >= stage.value;
}

/**
 * Checks if an achievement is fully unlocked
 */
export function isAchievementUnlocked(achievement, achState) {
  return achState.unlocked?.includes(achievement.id) || false;
}
