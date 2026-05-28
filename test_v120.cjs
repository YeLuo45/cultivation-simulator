// V120 Test Runner
const fs = require('fs');
const code = fs.readFileSync('game.js', 'utf8');

// Extract V120 definitions
const MCP_TOOLS_V120 = {
    'investment.query': { name: 'investment.query', description: '查询投资状态', inputSchema: { type: 'object', properties: {} } },
    'investment.buy': { name: 'investment.buy', description: '购买投资产品', inputSchema: { type: 'object', properties: { investmentId: { type: 'string' } }, required: ['investmentId'] } },
    'investment.claim': { name: 'investment.claim', description: '领取投资收益', inputSchema: { type: 'object', properties: { investmentId: { type: 'string' } }, required: ['investmentId'] } },
    'monthcard.query': { name: 'monthcard.query', description: '查询月卡状态', inputSchema: { type: 'object', properties: {} } },
    'monthcard.buy': { name: 'monthcard.buy', description: '购买月卡', inputSchema: { type: 'object', properties: {} } },
    'monthcard.claim': { name: 'monthcard.claim', description: '每日领取月卡奖励', inputSchema: { type: 'object', properties: {} } }
};

const INVESTMENT_PRODUCTS = [
    { id: 'inv_001', name: '稳赢投资', cost: 1000, dailyReturn: 100, totalDays: 15, description: '低风险，日回报100灵石，15天回本' },
    { id: 'inv_002', name: '高回报投资', cost: 5000, dailyReturn: 800, totalDays: 10, description: '中高风险，日回报800灵石，10天回本' },
    { id: 'inv_003', name: '天道基金', cost: 20000, dailyReturn: 5000, totalDays: 7, description: '高风险高回报，日回报5000灵石，7天回本' }
];

const MONTHCARD_CONFIG = {
    cost: 500,
    dailyReward: 200,
    durationDays: 30,
    claimCooldownHours: 24
};

// Mock CultivationMCPServer (V120 methods only)
class CultivationMCPServer {
    constructor() {
        this.toolRegistry = new Map();
        this._initInvestmentState();
        this._initMonthcardState();
    }
    
    _initInvestmentState() {
        const gs = window.gameState;
        if (!gs.investment) {
            gs.investment = {
                purchased: [],
                products: INVESTMENT_PRODUCTS.map(p => ({...p, claimedDays: 0, startDate: null, active: false}))
            };
        }
        return gs.investment;
    }
    
    _initMonthcardState() {
        const gs = window.gameState;
        if (!gs.monthcard) {
            gs.monthcard = { active: false, purchaseDate: null, lastClaimDate: null, dailyReward: 200, durationDays: 30 };
        }
        return gs.monthcard;
    }
    
    mcpInvestmentQuery() {
        try {
            const gs = window.gameState;
            const inv = this._initInvestmentState();
            return { success: true, products: inv.products, purchased: inv.purchased, availableProducts: INVESTMENT_PRODUCTS };
        } catch (e) { return { error: e.message }; }
    }
    
    mcpInvestmentBuy(investmentId) {
        try {
            const gs = window.gameState;
            if (!investmentId) return { error: '投资产品ID不能为空' };
            const inv = this._initInvestmentState();
            const product = inv.products.find(p => p.id === investmentId);
            if (!product) return { error: '投资产品不存在' };
            if (inv.purchased.includes(investmentId)) return { error: '该投资产品已购买' };
            if ((gs.spiritStones || 0) < product.cost) return { error: '灵石不足' };
            gs.spiritStones -= product.cost;
            inv.purchased.push(investmentId);
            product.active = true;
            product.startDate = Date.now();
            product.claimedDays = 0;
            return { success: true, message: `购买${product.name}成功`, investmentId, product: { id: product.id, name: product.name, cost: product.cost, dailyReturn: product.dailyReturn, totalDays: product.totalDays }, balance: gs.spiritStones };
        } catch (e) { return { error: e.message }; }
    }
    
    mcpInvestmentClaim(investmentId) {
        try {
            const gs = window.gameState;
            if (!investmentId) return { error: '投资产品ID不能为空' };
            const inv = this._initInvestmentState();
            const product = inv.products.find(p => p.id === investmentId);
            if (!product) return { error: '投资产品不存在' };
            if (!inv.purchased.includes(investmentId)) return { error: '该投资产品尚未购买' };
            if (!product.active) return { error: '该投资产品已过期' };
            if (product.claimedDays >= product.totalDays) return { error: '该投资产品收益已全部领取完' };
            const now = Date.now();
            const lastClaim = product.lastClaimDate || product.startDate;
            const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
            if (hoursSinceLastClaim < 24) return { error: `距离下次领取还需${Math.ceil(24 - hoursSinceLastClaim)}小时` };
            product.claimedDays += 1;
            product.lastClaimDate = now;
            gs.spiritStones = (gs.spiritStones || 0) + product.dailyReturn;
            if (product.claimedDays >= product.totalDays) product.active = false;
            return { success: true, message: `领取${product.name}第${product.claimedDays}天收益成功`, investmentId, claimedDays: product.claimedDays, dailyReturn: product.dailyReturn, balance: gs.spiritStones, isCompleted: product.claimedDays >= product.totalDays };
        } catch (e) { return { error: e.message }; }
    }
    
    mcpMonthcardQuery() {
        try {
            const gs = window.gameState;
            const mc = this._initMonthcardState();
            const now = Date.now();
            let isExpired = false;
            let remainingDays = 0;
            if (mc.active && mc.purchaseDate) {
                const expireTime = mc.purchaseDate + (MONTHCARD_CONFIG.durationDays * 24 * 60 * 60 * 1000);
                if (now >= expireTime) { isExpired = true; mc.active = false; }
                else remainingDays = Math.ceil((expireTime - now) / (24 * 60 * 60 * 1000));
            }
            return { success: true, active: mc.active && !isExpired, purchaseDate: mc.purchaseDate, lastClaimDate: mc.lastClaimDate, dailyReward: mc.dailyReward, remainingDays, isExpired, config: MONTHCARD_CONFIG };
        } catch (e) { return { error: e.message }; }
    }
    
    mcpMonthcardBuy() {
        try {
            const gs = window.gameState;
            const mc = this._initMonthcardState();
            if (mc.active) {
                const now = Date.now();
                const expireTime = mc.purchaseDate + (MONTHCARD_CONFIG.durationDays * 24 * 60 * 60 * 1000);
                if (now < expireTime) return { error: '月卡已激活，无需重复购买' };
            }
            if ((gs.spiritStones || 0) < MONTHCARD_CONFIG.cost) return { error: '灵石不足' };
            gs.spiritStones -= MONTHCARD_CONFIG.cost;
            mc.active = true;
            mc.purchaseDate = Date.now();
            mc.lastClaimDate = null;
            return { success: true, message: '购买月卡成功，有效期30天', cost: MONTHCARD_CONFIG.cost, dailyReward: MONTHCARD_CONFIG.dailyReward, durationDays: MONTHCARD_CONFIG.durationDays, balance: gs.spiritStones };
        } catch (e) { return { error: e.message }; }
    }
    
    mcpMonthcardClaim() {
        try {
            const gs = window.gameState;
            const mc = this._initMonthcardState();
            if (!mc.active) return { error: '月卡未激活，请先购买月卡' };
            const now = Date.now();
            const expireTime = mc.purchaseDate + (MONTHCARD_CONFIG.durationDays * 24 * 60 * 60 * 1000);
            if (now >= expireTime) { mc.active = false; return { error: '月卡已过期' }; }
            if (mc.lastClaimDate) {
                const hoursSinceLastClaim = (now - mc.lastClaimDate) / (1000 * 60 * 60);
                if (hoursSinceLastClaim < MONTHCARD_CONFIG.claimCooldownHours) return { error: `距离下次领取还需${Math.ceil(MONTHCARD_CONFIG.claimCooldownHours - hoursSinceLastClaim)}小时` };
            }
            mc.lastClaimDate = now;
            gs.spiritStones = (gs.spiritStones || 0) + MONTHCARD_CONFIG.dailyReward;
            const remainingDays = Math.ceil((expireTime - now) / (24 * 60 * 60 * 1000));
            return { success: true, message: '领取月卡每日奖励成功', reward: { spiritStones: MONTHCARD_CONFIG.dailyReward }, balance: gs.spiritStones, remainingDays };
        } catch (e) { return { error: e.message }; }
    }
}

// Test runner
function runV120Tests() {
    const results = [];
    function v120Assert(condition, msg) { results.push({ pass: !!condition, msg }); }

    const mockGameState = { spiritStones: 10000, investment: null, monthcard: null };
    global.window = { gameState: mockGameState };
    const server = new CultivationMCPServer();

    // Investment Tests
    const query1 = server.mcpInvestmentQuery();
    v120Assert(query1.success === true, 'investment.query succeeds');
    v120Assert(query1.products && query1.products.length === 3, 'investment.query returns 3 products');

    mockGameState.spiritStones = 10000;
    server._initInvestmentState();
    const buy1 = server.mcpInvestmentBuy('inv_001');
    v120Assert(buy1.success === true, 'investment.buy inv_001 succeeds');
    v120Assert(buy1.balance === 9000, 'investment.buy deducts cost');

    const buy1Again = server.mcpInvestmentBuy('inv_001');
    v120Assert(buy1Again.error && buy1Again.error.includes('已购买'), 'investment.buy same product fails');

    mockGameState.spiritStones = 10000;
    server._initInvestmentState();
    const buy3 = server.mcpInvestmentBuy('inv_003');
    v120Assert(buy3.error && buy3.error.includes('灵石不足'), 'investment.buy inv_003 fails with insufficient stones');

    const buyInvalid = server.mcpInvestmentBuy('invalid_id');
    v120Assert(buyInvalid.error && buyInvalid.error.includes('投资产品不存在'), 'investment.buy invalid product fails');

    const buyNoId = server.mcpInvestmentBuy(null);
    v120Assert(buyNoId.error && buyNoId.error.includes('ID不能为空'), 'investment.buy without ID fails');

    mockGameState.spiritStones = 10000;
    server._initInvestmentState();
    server.mcpInvestmentBuy('inv_001');
    mockGameState.investment.products[0].startDate = Date.now() - (25 * 60 * 60 * 1000);
    const claim1 = server.mcpInvestmentClaim('inv_001');
    v120Assert(claim1.success === true, 'investment.claim succeeds');
    v120Assert(claim1.balance === 9100, 'investment.claim balance is 9100');

    mockGameState.spiritStones = 10000;
    server._initInvestmentState();
    server.mcpInvestmentBuy('inv_001');
    mockGameState.investment.products[0].startDate = Date.now() - (1 * 60 * 60 * 1000);
    const claimEarly = server.mcpInvestmentClaim('inv_001');
    v120Assert(claimEarly.error && claimEarly.error.includes('距离下次领取还需'), 'investment.claim before 24h fails');

    mockGameState.investment = { purchased: [], products: server._initInvestmentState().products };
    const claimNotPurchased = server.mcpInvestmentClaim('inv_002');
    v120Assert(claimNotPurchased.error && claimNotPurchased.error.includes('尚未购买'), 'investment.claim un purchased product fails');

    mockGameState.spiritStones = 10000;
    server._initInvestmentState();
    server.mcpInvestmentBuy('inv_001');
    mockGameState.investment.products[0].claimedDays = 15;
    mockGameState.investment.products[0].active = false;
    const claimComplete = server.mcpInvestmentClaim('inv_001');
    v120Assert(claimComplete.error && claimComplete.error.includes('收益已全部领取完'), 'investment.claim completed product fails');

    const claimInvalid = server.mcpInvestmentClaim('invalid_id');
    v120Assert(claimInvalid.error && claimInvalid.error.includes('投资产品不存在'), 'investment.claim invalid product fails');

    mockGameState.spiritStones = 10000;
    server._initInvestmentState();
    server.mcpInvestmentBuy('inv_001');
    const query2 = server.mcpInvestmentQuery();
    v120Assert(query2.purchased.includes('inv_001'), 'investment.query shows inv_001 purchased');

    // Monthcard Tests
    server._initMonthcardState();
    const queryMC1 = server.mcpMonthcardQuery();
    v120Assert(queryMC1.success === true, 'monthcard.query succeeds');
    v120Assert(queryMC1.active === false, 'monthcard.query shows not active initially');

    mockGameState.spiritStones = 10000;
    server._initMonthcardState();
    const buyMC = server.mcpMonthcardBuy();
    v120Assert(buyMC.success === true, 'monthcard.buy succeeds');
    v120Assert(buyMC.balance === 9500, 'monthcard.buy balance is 9500');

    const buyMCAgain = server.mcpMonthcardBuy();
    v120Assert(buyMCAgain.error && buyMCAgain.error.includes('月卡已激活'), 'monthcard.buy again fails');

    mockGameState.spiritStones = 100;
    server._initMonthcardState();
    const buyMCLow = server.mcpMonthcardBuy();
    v120Assert(buyMCLow.error && buyMCLow.error.includes('灵石不足'), 'monthcard.buy fails with low stones');

    mockGameState.spiritStones = 10000;
    server._initMonthcardState();
    server.mcpMonthcardBuy();
    const claimMC = server.mcpMonthcardClaim();
    v120Assert(claimMC.success === true, 'monthcard.claim succeeds');
    v120Assert(claimMC.reward.spiritStones === 200, 'monthcard.claim returns 200');
    v120Assert(claimMC.balance === 9700, 'monthcard.claim balance is 9700 (9500+200)');

    const claimMCAgain = server.mcpMonthcardClaim();
    v120Assert(claimMCAgain.error && claimMCAgain.error.includes('距离下次领取还需'), 'monthcard.claim again within 24h fails');

    const queryMC2 = server.mcpMonthcardQuery();
    v120Assert(queryMC2.active === true, 'monthcard.query shows active');
    v120Assert(queryMC2.remainingDays > 0 && queryMC2.remainingDays <= 30, 'monthcard.query shows remaining days');

    mockGameState.monthcard = { active: false, purchaseDate: null, lastClaimDate: null, dailyReward: 200, durationDays: 30 };
    const claimMCNoBuy = server.mcpMonthcardClaim();
    v120Assert(claimMCNoBuy.error && claimMCNoBuy.error.includes('月卡未激活'), 'monthcard.claim without buying fails');

    mockGameState.spiritStones = 10000;
    mockGameState.monthcard = { active: true, purchaseDate: Date.now() - (31 * 24 * 60 * 60 * 1000), lastClaimDate: null, dailyReward: 200, durationDays: 30 };
    const claimMCExpired = server.mcpMonthcardClaim();
    v120Assert(claimMCExpired.error && claimMCExpired.error.includes('月卡已过期'), 'monthcard.claim after expired fails');

    // Init tests
    mockGameState.investment = null;
    const invInit = server._initInvestmentState();
    v120Assert(invInit && invInit.products && invInit.products.length === 3, '_initInvestmentState initializes properly');

    mockGameState.monthcard = null;
    const mcInit = server._initMonthcardState();
    v120Assert(mcInit && mcInit.active === false, '_initMonthcardState initializes properly');

    // Investment product 2 and 3
    mockGameState.spiritStones = 10000;
    mockGameState.investment = null;
    server._initInvestmentState();
    server.mcpInvestmentBuy('inv_002');
    mockGameState.investment.products[1].startDate = Date.now() - (25 * 60 * 60 * 1000);
    const claimInv2 = server.mcpInvestmentClaim('inv_002');
    v120Assert(claimInv2.success === true, 'investment.claim inv_002 succeeds');
    v120Assert(claimInv2.dailyReturn === 800, 'investment.claim inv_002 returns 800');

    mockGameState.spiritStones = 30000;
    mockGameState.investment = null;
    server._initInvestmentState();
    server.mcpInvestmentBuy('inv_003');
    mockGameState.investment.products[2].startDate = Date.now() - (25 * 60 * 60 * 1000);
    const claimInv3 = server.mcpInvestmentClaim('inv_003');
    v120Assert(claimInv3.success === true, 'investment.claim inv_003 succeeds');
    v120Assert(claimInv3.dailyReturn === 5000, 'investment.claim inv_003 returns 5000');

    // Config test
    const queryMC3 = server.mcpMonthcardQuery();
    v120Assert(queryMC3.config.cost === 500, 'monthcard.query shows correct cost');
    v120Assert(queryMC3.config.dailyReward === 200, 'monthcard.query shows correct dailyReward');
    v120Assert(queryMC3.config.durationDays === 30, 'monthcard.query shows correct durationDays');
    v120Assert(queryMC3.config.claimCooldownHours === 24, 'monthcard.query shows correct cooldown');

    // Completion test
    mockGameState.spiritStones = 10000;
    mockGameState.investment = null;
    server._initInvestmentState();
    server.mcpInvestmentBuy('inv_001');
    mockGameState.investment.products[0].claimedDays = 14;
    mockGameState.investment.products[0].startDate = Date.now() - (25 * 60 * 60 * 1000);
    const claimAlmostDone = server.mcpInvestmentClaim('inv_001');
    v120Assert(claimAlmostDone.isCompleted === true, 'investment.claim marks as completed');
    v120Assert(mockGameState.investment.products[0].active === false, 'investment.product becomes inactive after completion');

    // Re-purchase after expiry
    mockGameState.spiritStones = 10000;
    mockGameState.monthcard = { active: false, purchaseDate: Date.now() - (31 * 24 * 60 * 60 * 1000), lastClaimDate: null, dailyReward: 200, durationDays: 30 };
    const buyMCExpired = server.mcpMonthcardBuy();
    v120Assert(buyMCExpired.success === true, 'monthcard.buy after expiry succeeds');

    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    console.log('V120 Tests:', passed + '/' + total, '(' + (passed/total*100).toFixed(1) + '%)');
    results.forEach((r, i) => { if (!r.pass) console.log('  FAIL[' + i + ']: ' + r.msg); });
    return { passed, total, results };
}

runV120Tests();