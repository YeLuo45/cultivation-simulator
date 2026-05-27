const { readFileSync } = require('fs');

// Read the game.js
const gameCode = readFileSync('dist/game.js', 'utf8');

// Create mock window
global.window = {
    gameState: {
        playerId: 'player_1',
        playerName: '测试玩家',
        alliances: null
    }
};

// Try running specific checks directly on file content
const checks = [
    ['alliance.create', gameCode.includes("'alliance.create'")],
    ['alliance.join', gameCode.includes("'alliance.join'")],
    ['alliance.contribute', gameCode.includes("'alliance.contribute'")],
    ['alliance.territory.claim', gameCode.includes("'alliance.territory.claim'")],
    ['alliance.skill.unlock', gameCode.includes("'alliance.skill.unlock'")],
    ['alliance.members.list', gameCode.includes("'alliance.members.list'")],
    ['mcpAllianceCreate', gameCode.includes('mcpAllianceCreate')],
    ['mcpAllianceJoin', gameCode.includes('mcpAllianceJoin')],
    ['mcpAllianceContribute', gameCode.includes('mcpAllianceContribute')],
    ['mcpAllianceTerritoryClaim', gameCode.includes('mcpAllianceTerritoryClaim')],
    ['mcpAllianceSkillUnlock', gameCode.includes('mcpAllianceSkillUnlock')],
    ['mcpAllianceMembersList', gameCode.includes('mcpAllianceMembersList')],
    ['_initAllianceState', gameCode.includes('_initAllianceState')],
    ['_getPlayerAlliance', gameCode.includes('_getPlayerAlliance')],
    ['MCP_TOOLS_V101', gameCode.includes('MCP_TOOLS_V101')]
];

let passed = 0;
checks.forEach(([name, result]) => {
    console.log(`${result ? '✓' : '✗'} ${name}`);
    if (result) passed++;
});

console.log(`\n${passed}/${checks.length} checks passed`);
process.exit(passed === checks.length ? 0 : 1);