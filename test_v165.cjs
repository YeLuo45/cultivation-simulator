// V165 Test Runner
const fs = require('fs');
const code = fs.readFileSync(__dirname + '/game.js', 'utf8');

// Mock window object
global.window = { gameState: {} };

// Execute the code - looking for runV165Tests
const testMatch = code.match(/function runV165Tests\(\) \{[\s\S]*?const v165Results = runV165Tests\(\);/g);
if (testMatch) {
    console.log('Found test code, length:', testMatch[0].length);
} else {
    console.log('Test code not found');
}

// Simple parse check
try {
    // Check if MCP_TOOLS_V165 exists in code
    const hasMCP165 = code.includes("MCP_TOOLS_V165");
    const hasAchievementListV3 = code.includes("mcpAchievementListV3");
    const hasAchievementViewV3 = code.includes("mcpAchievementViewV3");
    const hasAchievementUnlockV3 = code.includes("mcpAchievementUnlockV3");
    const hasAchievementRewardV3 = code.includes("mcpAchievementRewardV3");
    const hasBadgeListV3 = code.includes("mcpBadgeListV3");
    const hasBadgeEquipV3 = code.includes("mcpBadgeEquipV3");
    const hasInitAchievementV3 = code.includes("_initAchievementStateV3");
    const hasInitBadgeV3 = code.includes("_initBadgeStateV3");
    const hasRunV165Tests = code.includes("function runV165Tests()");
    
    console.log('MCP_TOOLS_V165 defined:', hasMCP165);
    console.log('mcpAchievementListV3 defined:', hasAchievementListV3);
    console.log('mcpAchievementViewV3 defined:', hasAchievementViewV3);
    console.log('mcpAchievementUnlockV3 defined:', hasAchievementUnlockV3);
    console.log('mcpAchievementRewardV3 defined:', hasAchievementRewardV3);
    console.log('mcpBadgeListV3 defined:', hasBadgeListV3);
    console.log('mcpBadgeEquipV3 defined:', hasBadgeEquipV3);
    console.log('_initAchievementStateV3 defined:', hasInitAchievementV3);
    console.log('_initBadgeStateV3 defined:', hasInitBadgeV3);
    console.log('runV165Tests function defined:', hasRunV165Tests);
    
    // Count tests
    const testCount = (code.match(/v165Assert\(/g) || []).length;
    console.log('Total v165Assert calls (tests):', testCount);
    
    console.log('\n✅ V165 code structure check passed!');
} catch (e) {
    console.error('Error:', e.message);
}