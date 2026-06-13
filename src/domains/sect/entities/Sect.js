/**
 * Sect Entity - 宗门实体
 * Main sect data structure and sect-related state
 */

/**
 * Create a new sect object
 */
function createSect(name) {
    return {
        name: name,
        level: 1,
        spiritStones: 0,
        disciples: [],
        elders: [],
        buildings: {
            library: false,
            alchemy: false,
            forge: false,
            archive: false
        },
        techniques: [],
        contributionShop: [],
        lastShopRefresh: 0,
        lastResourceCollection: 0,
        // Dual track system fields
        dualTrackEnabled: false,
        syncResources: false,
        syncInterval: 1,
        dispatchedToPalace: 0,
        // NPC autonomous system fields
        npcTasks: [],
        npcLeaderId: null,
        npcLastActionDay: 0,
        // Sect atmosphere
        sectMood: 70,
        // Resources
        resources: {},
        // Reputation
        reputation: 100,
        maxDisciples: 5,
        missions: []
    };
}

/**
 * Sect configuration constants
 */
const SECT_CONFIG = {
    createCost: 10000,
    maxDisciples: {
        1: 5,
        2: 10,
        3: 20,
        4: 35,
        5: 50
    },
    upgradeCost: {
        2: 5000,
        3: 15000,
        4: 50000,
        5: 150000
    },
    upgradeDisciples: {
        2: 3,
        3: 8,
        4: 15,
        5: 25
    },
    talents: ['普通', '优良', '天才', '天生神人'],
    talentWeights: [50, 30, 15, 5],
    buildings: {
        library: { name: '藏书阁', cost: 2000, desc: '存放宗门功法典籍' },
        alchemy: { name: '炼丹房', cost: 3000, desc: '炼制各种丹药' },
        forge: { name: '锻造坊', cost: 4000, desc: '打造灵宝武器' },
        archive: { name: '藏经阁', cost: 5000, desc: '存放高级功法' }
    },
    recruitCost: 100
};

/**
 * Get sect overview data
 */
function getSectOverview(sect) {
    return {
        name: sect.name || '无宗门',
        level: sect.level || 1,
        reputation: sect.reputation || 0,
        memberCount: sect.disciples ? sect.disciples.length : 0,
        maxDisciples: sect.maxDisciples || 5,
        spiritStones: sect.spiritStones || 0,
        sectMood: sect.sectMood || 70
    };
}

/**
 * Get sect resources data
 */
function getSectResources(sect) {
    return {
        spiritStones: sect.spiritStones || 0,
        resources: sect.resources || {},
        income: calculateSectIncome.call({ sect })
    };
}

/**
 * Calculate sect income
 */
function calculateSectIncome() {
    const sect = this.sect;
    let income = 0;
    sect.disciples.forEach(d => {
        const realmMultiplier = (d.realm + 1) * 10;
        const talentMultiplier = 1 + (d.talentIndex || 1) * 0.2;
        income += Math.floor(realmMultiplier * talentMultiplier);
    });
    sect.elders.forEach(elderUid => {
        const elder = sect.disciples.find(d => d.uid === elderUid);
        if (elder) {
            income += 500;
        }
    });
    return income;
}

/**
 * Get building status
 */
function getSectBuildings(sect) {
    return {
        library: sect.buildings?.library || false,
        alchemy: sect.buildings?.alchemy || false,
        forge: sect.buildings?.forge || false,
        archive: sect.buildings?.archive || false
    };
}

/**
 * Serialize sect state
 */
function serializeSect(sect) {
    return JSON.parse(JSON.stringify(sect));
}

/**
 * Check if sect can upgrade
 */
function canUpgradeSect(sect) {
    const nextLevel = sect.level + 1;
    const cost = SECT_CONFIG.upgradeCost[nextLevel];
    const requiredDisciples = SECT_CONFIG.upgradeDisciples[nextLevel];
    
    if (sect.spiritStones < cost) return { can: false, reason: '灵石不足' };
    if (sect.disciples.length < requiredDisciples) return { can: false, reason: `需要${requiredDisciples}名弟子` };
    
    if (nextLevel === 3) {
        if (!sect.buildings.library || !sect.buildings.alchemy || !sect.buildings.forge) {
            return { can: false, reason: '需要全部1级建筑' };
        }
    }
    
    return { can: true };
}

export {
    createSect,
    SECT_CONFIG,
    getSectOverview,
    getSectResources,
    calculateSectIncome,
    getSectBuildings,
    serializeSect,
    canUpgradeSect
};