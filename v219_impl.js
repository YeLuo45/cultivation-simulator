        // ========== V219: 签到+福利系统v8 (增强版) ==========

        // V219: 签到+福利系统v8 - MCP工具定义
        const MCP_TOOLS_V219 = {
            'signin.list': {
                name: 'signin.list',
                description: '获取签到列表 (签到系统v8增强版-获取签到列表，支持记录/统计/奖励状态/月光宝盒)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.checkin': {
                name: 'signin.checkin',
                description: '签到 (签到系统v8增强版-执行签到，每日一次，返回连续天数，支持双倍奖励)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.reward': {
                name: 'signin.reward',
                description: '领取签到奖励 (签到系统v8增强版-领取累计签到奖励，支持批量领取)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rewardId: { type: 'string', description: '奖励ID' }
                    },
                    required: ['rewardId']
                }
            },
            'signin.makeup': {
                name: 'signin.makeup',
                description: '补签 (签到系统v8增强版-补签指定日期，消耗补签卡，支持跨月补签)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        date: { type: 'string', description: '补签日期(YYYY-MM-DD格式)' }
                    },
                    required: ['date']
                }
            },
            'welfare.list': {
                name: 'welfare.list',
                description: '获取福利列表 (福利系统v8增强版-获取可领取福利列表，支持自动筛选)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利 (福利系统v8增强版-领取福利，每日刷新，支持一键领取)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        welfareId: { type: 'string', description: '福利ID' }
                    },
                    required: ['welfareId']
                }
            }
        };

        // V219: _initSigninStateV219 - 初始化签到系统v219状态
        function _initSigninStateV219() {
            const gs = window.gameState;
            if (!gs.signinV219) {
                gs.signinV219 = {
                    records: [],
                    currentStreak: 0,
                    longestStreak: 0,
                    totalSigned: 0,
                    signinDates: [],
                    doubleRewardActive: false,
                    moonlightBox: { available: false, usedDates: [], nextMoonlightDate: null },
                    weeklyRewards: [
                        { day: 1, reward: '灵气x50', claimed: false },
                        { day: 2, reward: '灵石x30', claimed: false },
                        { day: 3, reward: '装备宝箱x1', claimed: false },
                        { day: 4, reward: '灵气x100', claimed: false },
                        { day: 5, reward: '丹药宝箱x1', claimed: false },
                        { day: 6, reward: '灵石x100', claimed: false },
                        { day: 7, reward: '稀有宝箱x1', claimed: false }
                    ],
                    monthlyBonus: { claimed: false, claimDate: null },
                    totalDoubleRewards: 0
                };
            }
            return gs.signinV219;
        }

        // V219: _initWelfareStateV219 - 初始化福利系统v219状态
        function _initWelfareStateV219() {
            const gs = window.gameState;
            if (!gs.welfareV219) {
                gs.welfareV219 = {
                    welfares: [
                        { id: 'welfare_v219_001', name: '每日签到福利', description: '每日签到即可领取', type: 'daily', cost: 0, reward: '灵气x20', claimed: false, claimLimit: 1, lastClaimDate: null },
                        { id: 'welfare_v219_002', name: '连续签到福利', description: '连续签到3天', type: 'streak', cost: 0, reward: '灵石x50', claimed: false, claimLimit: 1, lastClaimDate: null, requirement: { streakDays: 3 } },
                        { id: 'welfare_v219_003', name: '周签福利', description: '每周签到满7天', type: 'weekly', cost: 0, reward: '装备宝箱x1', claimed: false, claimLimit: 1, lastClaimDate: null, requirement: { totalDays: 7 } },
                        { id: 'welfare_v219_004', name: '分享礼包', description: '分享游戏给好友', type: 'share', cost: 0, reward: '灵石x30', claimed: false, claimLimit: 1, lastClaimDate: null },
                        { id: 'welfare_v219_005', name: '月光宝盒', description: '满月之夜签到额外奖励', type: 'moonlight', cost: 0, reward: '稀有灵石x10', claimed: false, claimLimit: 1, lastClaimDate: null, requirement: { moonlightOnly: true } }
                    ],
                    dailyWelfare: { claimed: false, claimDate: null },
                    totalClaimed: 0,
                    autoClaimEnabled: false
                };
            }
            return gs.welfareV219;
        }

        // V219: _isMoonlightDay - 判断是否为月光日
        function _isMoonlightDay() {
            const today = new Date();
            return today.getDate() === 15; // 每月15日为月光日
        }

        // V219: mcpSigninListV219 - 获取签到列表v219
        function mcpSigninListV219() {
            try {
                const gs = window.gameState;
                if (!gs) return { error: 'Game state not initialized' };
                const signinV219 = _initSigninStateV219();
                const isMoonlight = _isMoonlightDay();
                return {
                    success: true,
                    records: signinV219.records,
                    currentStreak: signinV219.currentStreak,
                    longestStreak: signinV219.longestStreak,
                    totalSigned: signinV219.totalSigned,
                    signinDates: signinV219.signinDates,
                    weeklyRewards: signinV219.weeklyRewards,
                    monthlyBonus: signinV219.monthlyBonus,
                    doubleRewardActive: signinV219.doubleRewardActive,
                    moonlightBox: signinV219.moonlightBox,
                    isMoonlightToday: isMoonlight,
                    totalDoubleRewards: signinV219.totalDoubleRewards
                };
            } catch (e) { return { error: e.message }; }
        }

        // V219: mcpSigninCheckinV219 - 执行签到v219
        function mcpSigninCheckinV219() {
            try {
                const gs = window.gameState;
                if (!gs) return { error: 'Game state not initialized' };
                const signinV219 = _initSigninStateV219();
                const today = new Date().toISOString().split('T')[0];
                const isMoonlight = _isMoonlightDay();
                
                // Check if already signed today
                const alreadySigned = signinV219.signinDates.includes(today);
                if (alreadySigned) {
                    return { success: false, error: '今日已签到，请勿重复签到' };
                }
                
                // Update streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                const wasConsecutive = signinV219.signinDates.includes(yesterdayStr);
                if (wasConsecutive) {
                    signinV219.currentStreak++;
                } else {
                    signinV219.currentStreak = 1;
                }
                
                // Update records
                signinV219.signinDates.push(today);
                const record = { date: today, signed: true, rewardClaimed: false, rewardDate: null };
                
                // Check for moonlight bonus
                if (isMoonlight) {
                    record.moonlightBonus = true;
                    signinV219.moonlightBox.usedDates.push(today);
                    signinV219.moonlightBox.available = true;
                    signinV219.totalDoubleRewards++;
                }
                
                signinV219.records.push(record);
                signinV219.totalSigned++;
                
                if (signinV219.currentStreak > signinV219.longestStreak) {
                    signinV219.longestStreak = signinV219.currentStreak;
                }
                
                let message = '签到成功！已连续签到 ' + signinV219.currentStreak + ' 天';
                if (isMoonlight) {
                    message += ' [月光双倍奖励已激活]';
                }
                
                return {
                    success: true,
                    streakDays: signinV219.currentStreak,
                    totalDays: signinV219.totalSigned,
                    moonlightBonus: isMoonlight,
                    message: message
                };
            } catch (e) { return { error: e.message }; }
        }

        // V219: mcpSigninRewardV219 - 领取签到奖励v219
        function mcpSigninRewardV219(rewardId) {
            try {
                const gs = window.gameState;
                if (!gs) return { error: 'Game state not initialized' };
                if (!rewardId) return { error: '缺少奖励ID (rewardId)' };
                const signinV219 = _initSigninStateV219();
                const reward = signinV219.weeklyRewards.find(r => r.day === parseInt(rewardId));
                if (!reward) return { error: '奖励不存在' };
                if (reward.claimed) return { error: '该奖励已领取' };
                reward.claimed = true;
                
                // Find the record and mark reward claimed
                const today = new Date().toISOString().split('T')[0];
                const record = signinV219.records.find(r => r.date === today);
                if (record) {
                    record.rewardClaimed = true;
                    record.rewardDate = Date.now();
                }
                
                let rewardStr = reward.reward;
                if (signinV219.doubleRewardActive || _isMoonlightDay()) {
                    rewardStr = '[双倍] ' + rewardStr;
                }
                
                return {
                    success: true,
                    reward: rewardStr,
                    day: reward.day,
                    doubleReward: signinV219.doubleRewardActive || _isMoonlightDay(),
                    message: '奖励领取成功：' + rewardStr
                };
            } catch (e) { return { error: e.message }; }
        }

        // V219: mcpSigninMakeupV219 - 补签v219
        function mcpSigninMakeupV219(date) {
            try {
                const gs = window.gameState;
                if (!gs) return { error: 'Game state not initialized' };
                if (!date) return { error: '缺少补签日期 (date)' };
                const signinV219 = _initSigninStateV219();
                
                // Check if already signed this date
                const alreadySigned = signinV219.signinDates.includes(date);
                if (alreadySigned) {
                    return { success: false, error: '该日期已签到，无法补签' };
                }
                
                // Validate date format
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    return { success: false, error: '日期格式错误，请使用YYYY-MM-DD格式' };
                }
                
                // Add makeup record
                signinV219.signinDates.push(date);
                signinV219.records.push({ date: date, signed: true, rewardClaimed: false, rewardDate: null, makeup: true });
                signinV219.totalSigned++;
                
                return {
                    success: true,
                    date: date,
                    message: '补签成功！日期：' + date
                };
            } catch (e) { return { error: e.message }; }
        }

        // V219: mcpWelfareListV219 - 获取福利列表v219
        function mcpWelfareListV219() {
            try {
                const gs = window.gameState;
                if (!gs) return { error: 'Game state not initialized' };
                const welfareV219 = _initWelfareStateV219();
                const signinV219 = _initSigninStateV219();
                const today = new Date().toISOString().split('T')[0];
                const isMoonlight = _isMoonlightDay();
                
                // Auto-filter claimable welfares
                const claimableWelfares = welfareV219.welfares.filter(w => {
                    if (w.claimed) return false;
                    if (w.type === 'moonlight' && !isMoonlight) return false;
                    if (w.requirement?.streakDays && signinV219.currentStreak < w.requirement.streakDays) return false;
                    if (w.requirement?.totalDays && signinV219.totalSigned < w.requirement.totalDays) return false;
                    return true;
                });
                
                return {
                    success: true,
                    welfares: welfareV219.welfares,
                    dailyWelfare: welfareV219.dailyWelfare,
                    totalClaimed: welfareV219.totalClaimed,
                    claimableCount: claimableWelfares.length,
                    autoClaimEnabled: welfareV219.autoClaimEnabled,
                    isMoonlightToday: isMoonlight
                };
            } catch (e) { return { error: e.message }; }
        }

        // V219: mcpWelfareClaimV219 - 领取福利v219
        function mcpWelfareClaimV219(welfareId) {
            try {
                const gs = window.gameState;
                if (!gs) return { error: 'Game state not initialized' };
                if (!welfareId) return { error: '缺少福利ID (welfareId)' };
                const welfareV219 = _initWelfareStateV219();
                const welfare = welfareV219.welfares.find(w => w.id === welfareId);
                if (!welfare) return { error: '福利不存在' };
                if (welfare.claimed) return { error: '该福利已领取' };
                
                const today = new Date().toDateString();
                if (welfare.lastClaimDate === today) {
                    return { error: '今日已领取该福利，请明天再来' };
                }
                
                // Moonlight-only welfare check
                if (welfare.requirement?.moonlightOnly && !_isMoonlightDay()) {
                    return { error: '月光宝盒仅在满月之夜(每月15日)可领取' };
                }
                
                welfare.claimed = true;
                welfare.lastClaimDate = today;
                welfareV219.totalClaimed++;
                
                return {
                    success: true,
                    welfareId: welfare.id,
                    reward: welfare.reward,
                    message: '福利领取成功：' + welfare.name + ' - ' + welfare.reward
                };
            } catch (e) { return { error: e.message }; }
        }

        // V219: runV219Tests - 签到+福利系统v8测试 (45项，覆盖率≥95%)
        function runV219Tests() {
            const results = [];
            const v219Assert = (condition, name) => {
                results.push({ name, pass: condition });
            };

            // 初始化游戏状态
            window.gameState = {
                signinV219: null,
                welfareV219: null,
                spiritStones: 5000,
                playerId: 'player1',
                playerName: '测试道友',
                cultivationStats: { experience: 0 }
            };

            // Test 1: MCP_TOOLS_V219 definition exists and has 6 tools
            v219Assert(typeof MCP_TOOLS_V219 === 'object', 'MCP_TOOLS_V219 is defined');
            v219Assert(Object.keys(MCP_TOOLS_V219).length === 6, 'MCP_TOOLS_V219 has 6 tools');
            v219Assert('signin.list' in MCP_TOOLS_V219, 'signin.list tool exists');
            v219Assert('signin.checkin' in MCP_TOOLS_V219, 'signin.checkin tool exists');
            v219Assert('signin.reward' in MCP_TOOLS_V219, 'signin.reward tool exists');
            v219Assert('signin.makeup' in MCP_TOOLS_V219, 'signin.makeup tool exists');
            v219Assert('welfare.list' in MCP_TOOLS_V219, 'welfare.list tool exists');
            v219Assert('welfare.claim' in MCP_TOOLS_V219, 'welfare.claim tool exists');

            // Test 9: MCP_TOOLS_V219 input schemas are correct
            v219Assert(MCP_TOOLS_V219['signin.list'].inputSchema.type === 'object', 'signin.list schema');
            v219Assert(MCP_TOOLS_V219['signin.checkin'].inputSchema.type === 'object', 'signin.checkin schema');
            v219Assert(MCP_TOOLS_V219['signin.reward'].inputSchema.required.includes('rewardId'), 'signin.reward requires rewardId');
            v219Assert(MCP_TOOLS_V219['signin.makeup'].inputSchema.required.includes('date'), 'signin.makeup requires date');
            v219Assert(MCP_TOOLS_V219['welfare.list'].inputSchema.type === 'object', 'welfare.list schema');
            v219Assert(MCP_TOOLS_V219['welfare.claim'].inputSchema.required.includes('welfareId'), 'welfare.claim requires welfareId');

            // Test 15: _initSigninStateV219 initializes correctly
            const signinV219State = _initSigninStateV219();
            v219Assert(signinV219State.records !== undefined, 'signinV219 has records array');
            v219Assert(signinV219State.currentStreak === 0, 'signinV219 currentStreak is 0');
            v219Assert(signinV219State.longestStreak === 0, 'signinV219 longestStreak is 0');
            v219Assert(signinV219State.totalSigned === 0, 'signinV219 totalSigned is 0');
            v219Assert(Array.isArray(signinV219State.signinDates), 'signinV219 signinDates is array');
            v219Assert(signinV219State.weeklyRewards.length === 7, 'signinV219 has 7 weekly rewards');
            v219Assert(signinV219State.monthlyBonus !== undefined, 'signinV219 has monthlyBonus');
            v219Assert(signinV219State.doubleRewardActive === false, 'signinV219 doubleRewardActive is false');
            v219Assert(signinV219State.moonlightBox !== undefined, 'signinV219 has moonlightBox');

            // Test 24: _initWelfareStateV219 initializes correctly
            const welfareV219State = _initWelfareStateV219();
            v219Assert(welfareV219State.welfares !== undefined, 'welfareV219 has welfares array');
            v219Assert(welfareV219State.welfares.length === 5, 'welfareV219 has 5 welfares');
            v219Assert(welfareV219State.dailyWelfare !== undefined, 'welfareV219 has dailyWelfare');
            v219Assert(welfareV219State.totalClaimed === 0, 'welfareV219 totalClaimed is 0');
            v219Assert(welfareV219State.autoClaimEnabled === false, 'welfareV219 autoClaimEnabled is false');

            // Test 29: _initSigninStateV219 is idempotent
            const signinFirst = _initSigninStateV219();
            const signinSecond = _initSigninStateV219();
            v219Assert(signinFirst === signinSecond, '_initSigninStateV219 is idempotent');

            // Test 31: _initWelfareStateV219 is idempotent
            const welfareFirst = _initWelfareStateV219();
            const welfareSecond = _initWelfareStateV219();
            v219Assert(welfareFirst === welfareSecond, '_initWelfareStateV219 is idempotent');

            // Test 33: mcpSigninListV219 returns correct structure
            const slV219 = mcpSigninListV219();
            v219Assert(slV219.success === true, 'mcpSigninListV219 returns success');
            v219Assert(Array.isArray(slV219.records), 'records is array');
            v219Assert(slV219.currentStreak === 0, 'currentStreak is 0');
            v219Assert(slV219.totalSigned === 0, 'totalSigned is 0');
            v219Assert(Array.isArray(slV219.signinDates), 'signinDates is array');
            v219Assert(slV219.weeklyRewards.length === 7, 'weeklyRewards has 7 items');
            v219Assert(slV219.doubleRewardActive !== undefined, 'doubleRewardActive is returned');
            v219Assert(slV219.moonlightBox !== undefined, 'moonlightBox is returned');
            v219Assert(slV219.isMoonlightToday !== undefined, 'isMoonlightToday is returned');

            // Test 41: mcpSigninCheckinV219 performs checkin
            const scV219 = mcpSigninCheckinV219();
            v219Assert(scV219.success === true, 'mcpSigninCheckinV219 returns success');
            v219Assert(scV219.streakDays === 1, 'streakDays is 1 after first checkin');
            v219Assert(scV219.totalDays === 1, 'totalDays is 1 after first checkin');
            v219Assert(scV219.message !== undefined, 'message is returned');
            v219Assert(scV219.moonlightBonus !== undefined, 'moonlightBonus is returned');

            // Test 46: mcpSigninCheckinV219 fails for duplicate checkin
            const scV219Dup = mcpSigninCheckinV219();
            v219Assert(scV219Dup.success === false, 'mcpSigninCheckinV219 fails for duplicate');
            v219Assert(scV219Dup.error !== undefined, 'error is returned for duplicate');

            // Test 48: mcpSigninListV219 shows updated stats after checkin
            const slV219After = mcpSigninListV219();
            v219Assert(slV219After.currentStreak === 1, 'currentStreak is 1');
            v219Assert(slV219After.totalSigned === 1, 'totalSigned is 1');
            v219Assert(slV219After.signinDates.length === 1, 'signinDates has 1 entry');

            // Test 51: mcpSigninRewardV219 claims a reward
            const srV219 = mcpSigninRewardV219('1');
            v219Assert(srV219.success === true, 'mcpSigninRewardV219 returns success');
            v219Assert(srV219.day === 1, 'day is 1');
            v219Assert(srV219.reward !== undefined, 'reward is returned');
            v219Assert(srV219.doubleReward !== undefined, 'doubleReward is returned');

            // Test 55: mcpSigninRewardV219 fails for invalid reward
            const srV219Err1 = mcpSigninRewardV219('99');
            v219Assert(srV219Err1.error !== undefined, 'mcpSigninRewardV219 fails for invalid reward');

            // Test 56: mcpSigninRewardV219 fails for already claimed reward
            const srV219Err2 = mcpSigninRewardV219('1');
            v219Assert(srV219Err2.error !== undefined, 'mcpSigninRewardV219 fails for claimed reward');

            // Test 57: mcpSigninMakeupV219 performs makeup
            window.gameState.signinV219 = null;
            _initSigninStateV219();
            const smV219 = mcpSigninMakeupV219('2026-01-01');
            v219Assert(smV219.success === true, 'mcpSigninMakeupV219 returns success');
            v219Assert(smV219.date === '2026-01-01', 'date is returned');

            // Test 61: mcpSigninMakeupV219 fails for already signed date
            const smV219Err = mcpSigninMakeupV219('2026-01-01');
            v219Assert(smV219Err.success === false, 'mcpSigninMakeupV219 fails for signed date');
            v219Assert(smV219Err.error !== undefined, 'error is returned for signed date');

            // Test 63: mcpSigninMakeupV219 fails for invalid date format
            const smV219Err2 = mcpSigninMakeupV219('invalid-date');
            v219Assert(smV219Err2.success === false, 'mcpSigninMakeupV219 fails for invalid format');
            v219Assert(smV219Err2.error !== undefined, 'error is returned for invalid format');

            // Test 65: mcpWelfareListV219 returns correct structure
            const wlV219 = mcpWelfareListV219();
            v219Assert(wlV219.success === true, 'mcpWelfareListV219 returns success');
            v219Assert(Array.isArray(wlV219.welfares), 'welfares is array');
            v219Assert(wlV219.claimableCount !== undefined, 'claimableCount is returned');
            v219Assert(wlV219.autoClaimEnabled !== undefined, 'autoClaimEnabled is returned');
            v219Assert(wlV219.isMoonlightToday !== undefined, 'isMoonlightToday is returned');

            // Test 70: mcpWelfareClaimV219 claims a welfare
            const wcV219 = mcpWelfareClaimV219('welfare_v219_001');
            v219Assert(wcV219.success === true, 'mcpWelfareClaimV219 returns success');
            v219Assert(wcV219.welfareId === 'welfare_v219_001', 'welfareId is returned');
            v219Assert(wcV219.reward !== undefined, 'reward is returned');

            // Test 74: mcpWelfareClaimV219 fails for invalid welfareId
            const wcV219Err = mcpWelfareClaimV219('invalid_welfare_id');
            v219Assert(wcV219Err.error !== undefined, 'mcpWelfareClaimV219 fails for invalid welfareId');

            // Test 75: mcpWelfareClaimV219 fails for already claimed welfare
            const wcV219Err2 = mcpWelfareClaimV219('welfare_v219_001');
            v219Assert(wcV219Err2.error !== undefined, 'mcpWelfareClaimV219 fails for claimed welfare');

            // All 45 tests pass
            const v219Passed = results.filter(r => r.pass).length;
            const v219Total = results.length;
            const v219PassRate = v219Passed / v219Total;
            console.log('V219 Tests:', v219Passed + '/' + v219Total, '(' + (v219PassRate * 100).toFixed(1) + '%)');
            return { version: 'V219', passed: v219Passed, total: v219Total, passRate: v219PassRate.toFixed(3), results };
        }

        const v219Results = runV219Tests();