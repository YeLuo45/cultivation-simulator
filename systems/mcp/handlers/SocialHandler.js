// ============================================================
// SocialHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 31338-32284
// Auto-generated - Do not edit manually
// ============================================================

            // V122: 红包+社交系统 - 状态初始化
            _initRedpackState() {
                const gs = window.gameState;
                if (!gs.redpack) {
                    gs.redpack = {
                        redpacks: [],
                        nextRefresh: null
                    };
                }
                return gs.redpack;
            }
            _initFriendState() {
                const gs = window.gameState;
                if (!gs.friend) {
                    gs.friend = {
                        friends: [],
                        applications: [],
                        blocked: []
                    };
                }
                return gs.friend;
            }

            // V122: mcpRedpackList - 获取红包列表
            mcpRedpackList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const rp = this._initRedpackState();
                    // Filter out expired (older than 24h) and fully grabbed
                    const now = Date.now();
                    const active = rp.redpacks.filter(r => {
                        if (r.grabList && r.grabList.length >= r.totalCount) return false;
                        if (r.expireTime && r.expireTime < now) return false;
                        return true;
                    });
                    return { success: true, redpacks: active };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpRedpackSend - 发送红包
            mcpRedpackSend(amount, type) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!amount || amount <= 0) return { error: '红包金额必须大于0' };
                    if (type !== 'regular' && type !== 'lucky') return { error: '红包类型无效，需要 regular 或 lucky' };
                    if ((gs.spiritStones || 0) < amount) return { error: '灵石不足' };
                    const rp = this._initRedpackState();
                    gs.spiritStones -= amount;
                    const redpack = {
                        id: 'rp_' + Date.now(),
                        sender: gs.playerName || '道友',
                        amount,
                        type,
                        remaining: amount,
                        totalCount: type === 'regular' ? Math.min(Math.floor(amount / 10), 20) : Math.min(Math.floor(amount / 20), 10),
                        grabList: [],
                        expireTime: Date.now() + 24 * 3600 * 1000,
                        createdAt: Date.now()
                    };
                    rp.redpacks.push(redpack);
                    return { success: true, message: '红包已发出', redpackId: redpack.id, balance: gs.spiritStones };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpRedpackGrab - 领取红包
            mcpRedpackGrab(redpackId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!redpackId) return { error: 'redpackId不能为空' };
                    const rp = this._initRedpackState();
                    const idx = rp.redpacks.findIndex(r => r.id === redpackId);
                    if (idx === -1) return { error: '红包不存在' };
                    const rp_item = rp.redpacks[idx];
                    // Check expiration
                    if (rp_item.expireTime && rp_item.expireTime < Date.now()) {
                        return { error: '红包已过期' };
                    }
                    // Check if already grabbed by this player
                    const playerId = gs.playerName || 'anonymous';
                    if (rp_item.grabList && rp_item.grabList.some(g => g.player === playerId)) {
                        return { error: '您已领取过该红包' };
                    }
                    // Check if fully grabbed
                    if (rp_item.grabList && rp_item.grabList.length >= rp_item.totalCount) {
                        return { error: '红包已被抢完' };
                    }
                    // Compute grab amount
                    let grabAmount;
                    if (rp_item.type === 'lucky') {
                        const maxGrab = Math.floor(rp_item.amount * 0.3);
                        grabAmount = Math.floor(Math.random() * maxGrab) + 1;
                    } else {
                        // regular: equal split
                        const remaining = rp_item.remaining;
                        const remainingSlots = rp_item.totalCount - (rp_item.grabList ? rp_item.grabList.length : 0);
                        grabAmount = Math.floor(remaining / remainingSlots);
                    }
                    grabAmount = Math.max(grabAmount, 1);
                    gs.spiritStones = (gs.spiritStones || 0) + grabAmount;
                    if (!rp_item.grabList) rp_item.grabList = [];
                    rp_item.grabList.push({ player: playerId, amount: grabAmount, time: Date.now() });
                    rp_item.remaining -= grabAmount;
                    return { success: true, message: '领取成功', amount: grabAmount, balance: gs.spiritStones };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpFriendList - 获取好友列表
            mcpFriendList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const friend = this._initFriendState();
                    return { success: true, friends: friend.friends, applications: friend.applications };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpFriendApply - 发送好友申请
            mcpFriendApply(playerName) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!playerName) return { error: '玩家名称不能为空' };
                    const friend = this._initFriendState();
                    // Check if already friends
                    if (friend.friends.some(f => f.name === playerName)) {
                        return { error: '已是好友' };
                    }
                    // Check if already applied
                    if (friend.applications.some(a => a.from === playerName)) {
                        return { error: '已发送过申请' };
                    }
                    const apply = {
                        id: 'apply_' + Date.now(),
                        from: playerName,
                        time: Date.now()
                    };
                    friend.applications.push(apply);
                    return { success: true, message: '好友申请已发送', applyId: apply.id };
                } catch (e) { return { error: e.message }; }
            }

            // V122: mcpFriendAccept - 通过好友申请
            mcpFriendAccept(applyId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!applyId) return { error: 'applyId不能为空' };
                    const friend = this._initFriendState();
                    const idx = friend.applications.findIndex(a => a.id === applyId);
                    if (idx === -1) return { error: '好友申请不存在' };
                    const apply = friend.applications[idx];
                    friend.applications.splice(idx, 1);
                    friend.friends.push({ id: 'friend_' + Date.now(), name: apply.from, since: Date.now() });
                    return { success: true, message: '已添加好友 ' + apply.from };
                } catch (e) { return { error: e.message }; }
            }

            // V123: 投票+问卷系统
            _initVoteState() {
                const gs = window.gameState;
                if (!gs.vote) {
                    gs.vote = { votes: [], nextVoteId: 1 };
                }
                return gs.vote;
            }
            _initSurveyState() {
                const gs = window.gameState;
                if (!gs.survey) {
                    gs.survey = {
                        surveys: [
                            { id: 'survey_1', title: '修仙境界问卷', questions: [{ q: '你最向往哪个境界?', options: ['筑基', '金丹', '元婴', '化神'] }], reward: { spiritStones: 200 }, status: 'available', answers: null },
                            { id: 'survey_2', title: '功法偏好调查', questions: [{ q: '你喜欢哪种功法?', options: ['剑修', '体修', '法修', '杂修'] }], reward: { spiritStones: 150 }, status: 'available', answers: null }
                        ],
                        nextSurveyId: 3
                    };
                }
                return gs.survey;
            }
            mcpVoteList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const vote = this._initVoteState();
                    return { success: true, votes: vote.votes.filter(v => Date.now() < v.endTime) };
                } catch (e) { return { error: e.message }; }
            }
            mcpVoteCreate(title, options, duration) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!title || !options || options.length < 2) return { error: '标题和至少2个选项不能为空' };
                    const vote = this._initVoteState();
                    const voteId = 'vote_' + (vote.nextVoteId++);
                    vote.votes.push({ id: voteId, title, options: options.map((text, i) => ({ text, count: 0 })), creator: gs.playerName || '玩家', endTime: Date.now() + (duration || 3600000), participants: [] });
                    return { success: true, voteId, endTime: Date.now() + (duration || 3600000) };
                } catch (e) { return { error: e.message }; }
            }
            mcpVoteJoin(voteId, optionIndex) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const vote = this._initVoteState();
                    const v = vote.votes.find(v => v.id === voteId);
                    if (!v) return { error: '投票不存在' };
                    if (Date.now() >= v.endTime) return { error: '投票已结束' };
                    if (v.participants.includes(gs.playerName || '玩家')) return { error: '已投过票' };
                    if (optionIndex < 0 || optionIndex >= v.options.length) return { error: '无效的选项索引' };
                    v.options[optionIndex].count++;
                    v.participants.push(gs.playerName || '玩家');
                    return { success: true, message: '投票成功', option: v.options[optionIndex].text };
                } catch (e) { return { error: e.message }; }
            }
            mcpSurveyList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const survey = this._initSurveyState();
                    return { success: true, surveys: survey.surveys.filter(s => s.status === 'available') };
                } catch (e) { return { error: e.message }; }
            }
            mcpSurveyAnswer(surveyId, answers) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const survey = this._initSurveyState();
                    const s = survey.surveys.find(s => s.id === surveyId);
                    if (!s) return { error: '问卷不存在' };
                    if (s.status !== 'available') return { error: '问卷不可作答' };
                    s.answers = answers;
                    return { success: true, message: '答案已提交' };
                } catch (e) { return { error: e.message }; }
            }
            mcpSurveyComplete(surveyId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const survey = this._initSurveyState();
                    const s = survey.surveys.find(s => s.id === surveyId);
                    if (!s) return { error: '问卷不存在' };
                    if (!s.answers) return { error: '请先提交答案' };
                    if (s.status !== 'available') return { error: '问卷已完成' };
                    s.status = 'completed';
                    gs.spiritStones = (gs.spiritStones || 0) + s.reward.spiritStones;
                    return { success: true, message: '问卷完成', reward: s.reward, balance: gs.spiritStones };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpCheckinQuery - 查询签到状态
            mcpCheckinQuery() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const checkin = this._initCheckinState();
                    return {
                        success: true,
                        signedToday: checkin.signedToday,
                        currentStreak: checkin.currentStreak,
                        lastSignDate: checkin.lastSignDate,
                        totalDays: checkin.totalDays,
                        streakRewards: checkin.streakRewards
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpCheckinSign - 执行签到
            mcpCheckinSign() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const checkin = this._initCheckinState();

                    if (checkin.signedToday) {
                        return { error: '今日已签到，请明天再来' };
                    }

                    // Update streak and last sign date
                    const now = new Date();
                    if (checkin.lastSignDate) {
                        const last = new Date(checkin.lastSignDate);
                        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                        if (diffDays === 1) {
                            checkin.currentStreak += 1;
                        } else if (diffDays > 1) {
                            checkin.currentStreak = 1;
                        }
                    } else {
                        checkin.currentStreak = 1;
                    }

                    checkin.lastSignDate = now.toISOString();
                    checkin.signedToday = true;
                    checkin.totalDays += 1;

                    // Base reward for signing in
                    const baseReward = 100 + checkin.currentStreak * 10;
                    gs.spiritStones = (gs.spiritStones || 0) + baseReward;

                    return {
                        success: true,
                        message: '签到成功，连续签到' + checkin.currentStreak + '天',
                        streak: checkin.currentStreak,
                        totalDays: checkin.totalDays,
                        reward: { spiritStones: baseReward }
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpCheckinReward - 领取连续签到奖励
            mcpCheckinReward(day) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!day) return { error: '连续签到天数不能为空' };

                    const dayKey = 'day' + day;
                    if (!CHECKIN_STREAK_REWARDS[dayKey]) {
                        return { error: '无效的连续签到天数: ' + day + '，可选: 3, 7, 30' };
                    }

                    const checkin = this._initCheckinState();
                    const streakData = checkin.streakRewards[dayKey];

                    if (!streakData) return { error: '连续签到奖励数据不存在' };
                    if (streakData.claimed) return { error: '该奖励已领取' };
                    if (checkin.currentStreak < day) {
                        return { error: '连续签到天数不足，需要连续签到' + day + '天，当前连续' + checkin.currentStreak + '天' };
                    }

                    streakData.claimed = true;
                    gs.spiritStones = (gs.spiritStones || 0) + streakData.reward.spiritStones;

                    return {
                        success: true,
                        message: '领取连续签到' + day + '天奖励成功',
                        reward: streakData.reward
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpWelfareQuery - 查询可领取福利
            mcpWelfareQuery() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const welfare = this._initWelfareState();

                    return {
                        success: true,
                        daily: {
                            available: !welfare.dailyClaimed,
                            claimed: welfare.dailyClaimed,
                            reward: welfare.rewards.daily.reward
                        },
                        weekly: {
                            available: !welfare.weeklyClaimed,
                            claimed: welfare.weeklyClaimed,
                            reward: welfare.rewards.weekly.reward
                        },
                        monthly: {
                            available: !welfare.monthlyClaimed,
                            claimed: welfare.monthlyClaimed,
                            reward: welfare.rewards.monthly.reward
                        }
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpWelfareClaim - 领取福利
            mcpWelfareClaim(welfareId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!welfareId) return { error: '福利ID不能为空' };

                    const validIds = ['daily', 'weekly', 'monthly'];
                    if (!validIds.includes(welfareId)) {
                        return { error: '无效的福利ID: ' + welfareId + '，可选: daily, weekly, monthly' };
                    }

                    const welfare = this._initWelfareState();
                    const welfareData = welfare.rewards[welfareId];

                    if (!welfareData) return { error: '福利数据不存在' };

                    const claimMap = {
                        daily: 'dailyClaimed',
                        weekly: 'weeklyClaimed',
                        monthly: 'monthlyClaimed'
                    };
                    const claimedFlag = claimMap[welfareId];

                    if (welfare[claimedFlag]) {
                        return { error: welfareId + '福利已领取，请下次再来' };
                    }

                    welfare[claimedFlag] = true;
                    welfare.lastClaimDate = new Date().toISOString();
                    gs.spiritStones = (gs.spiritStones || 0) + welfareData.reward.spiritStones;

                    return {
                        success: true,
                        message: '领取' + welfareId + '福利成功',
                        welfareId,
                        reward: welfareData.reward
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V117: mcpWelfareStatus - 查询福利状态
            mcpWelfareStatus() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const welfare = this._initWelfareState();

                    return {
                        success: true,
                        dailyClaimed: welfare.dailyClaimed,
                        weeklyClaimed: welfare.weeklyClaimed,
                        monthlyClaimed: welfare.monthlyClaimed,
                        lastClaimDate: welfare.lastClaimDate
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpQuestList - 获取可接任务列表
            mcpQuestList(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const quest = this._initQuestState();
                    const { filter = 'available' } = args || {};
                    let quests = [];
                    switch (filter) {
                        case 'available':
                            quests = quest.available || [];
                            break;
                        case 'active':
                            quests = quest.active || [];
                            break;
                        case 'completed':
                            quests = quest.completed || [];
                            break;
                        case 'all':
                            quests = [...(quest.available || []), ...(quest.active || []), ...(quest.completed || [])];
                            break;
                        default:
                            quests = quest.available || [];
                    }
                    return {
                        success: true,
                        filter,
                        total: quests.length,
                        quests: quests.map(q => ({
                            id: q.id,
                            name: q.name,
                            description: q.description,
                            type: q.type,
                            difficulty: q.difficulty,
                            realmRequired: q.realmRequired,
                            reward: q.reward
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpQuestAccept - 接受任务
            mcpQuestAccept(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const { questId } = args || {};
                    if (!questId) return { error: '任务ID不能为空' };
                    const quest = this._initQuestState();
                    // Check if active quest limit reached (max 5)
                    if (quest.active.length >= 5) {
                        return { error: '进行中的任务已达上限(5)' };
                    }
                    // Find quest in available pool
                    const questIndex = quest.available.findIndex(q => q.id === questId);
                    if (questIndex === -1) {
                        return { error: '任务不存在或已不可接取: ' + questId };
                    }
                    const questData = quest.available[questIndex];
                    // Check realm requirement
                    if (questData.realmRequired && (gs.realm || 0) < questData.realmRequired) {
                        return { error: '境界不足，需要炼气' + (questData.realmRequired + 1) + '期' };
                    }
                    // Move from available to active
                    quest.available.splice(questIndex, 1);
                    quest.active.push({
                        id: questData.id,
                        name: questData.name,
                        progress: 0,
                        startTime: Date.now()
                    });
                    return {
                        success: true,
                        questId,
                        message: '任务已接受: ' + questData.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpQuestSubmit - 提交已完成任务
            mcpQuestSubmit(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const { questId } = args || {};
                    if (!questId) return { error: '任务ID不能为空' };
                    const quest = this._initQuestState();
                    // Find quest in active
                    const activeIndex = quest.active.findIndex(q => q.id === questId);
                    if (activeIndex === -1) {
                        return { error: '任务不在进行中: ' + questId };
                    }
                    const activeQuest = quest.active[activeIndex];
                    // Find quest reward from pool
                    const questPoolData = QUEST_POOL.find(q => q.id === questId) || {};
                    const reward = questPoolData.reward || { spiritStones: 100, exp: 10 };
                    // Move from active to completed
                    quest.active.splice(activeIndex, 1);
                    quest.completed.push({
                        id: activeQuest.id,
                        name: activeQuest.name,
                        completedAt: Date.now()
                    });
                    // Give reward
                    gs.spiritStones = (gs.spiritStones || 0) + (reward.spiritStones || 0);
                    gs.totalQuestCompleted = (gs.totalQuestCompleted || 0) + 1;
                    return {
                        success: true,
                        questId,
                        reward,
                        message: '任务已完成: ' + activeQuest.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpAchievementQuery - 查询玩家成就
            mcpAchievementQuery(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const achievement = this._initAchievementState();
                    const { filter = 'all' } = args || {};
                    const allAchievements = ACHIEVEMENT_POOL;
                    let achievements = [];
                    switch (filter) {
                        case 'all':
                            achievements = allAchievements;
                            break;
                        case 'unlocked':
                            achievements = allAchievements.filter(a => achievement.unlocked.includes(a.id));
                            break;
                        case 'locked':
                            achievements = allAchievements.filter(a => !achievement.unlocked.includes(a.id));
                            break;
                        default:
                            achievements = allAchievements;
                    }
                    return {
                        success: true,
                        filter,
                        total: achievements.length,
                        achievements: achievements.map(a => ({
                            id: a.id,
                            name: a.name,
                            description: a.description,
                            unlocked: achievement.unlocked.includes(a.id),
                            rewardClaimed: achievement.rewardsClaimed.includes(a.id)
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: _checkAchievementCondition - 检查成就条件是否满足
            _checkAchievementCondition(condition) {
                const gs = window.gameState;
                if (!condition || !condition.type) return false;
                switch (condition.type) {
                    case 'questCompleted':
                        return (gs.totalQuestCompleted || 0) >= condition.amount;
                    case 'totalStone':
                        return (gs.totalStone || 0) >= condition.amount;
                    case 'realm':
                        return (gs.realm || 0) >= condition.level;
                    case 'rank':
                        return (gs.rank || 999999) <= condition.position;
                    case 'pillCrafted':
                        return (gs.pillCrafted || 0) >= condition.amount;
                    case 'skillLearned':
                        return (gs.skillLearned || 0) >= condition.amount;
                    case 'equipmentEnhanced':
                        return (gs.equipmentEnhanced || 0) >= condition.amount;
                    case 'serendipity':
                        return (gs.serendipity || 0) >= condition.amount;
                    case 'inSect':
                        return gs.sect && gs.sect.name;
                    case 'sectContribution':
                        return (gs.sect?.contribution || 0) >= condition.amount;
                    default:
                        return false;
                }
            }

            // V114: mcpAchievementUnlock - 解锁成就
            mcpAchievementUnlock(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const { achievementId } = args || {};
                    if (!achievementId) return { error: '成就ID不能为空' };
                    const achievement = this._initAchievementState();
                    // Find achievement in pool
                    const achData = ACHIEVEMENT_POOL.find(a => a.id === achievementId);
                    if (!achData) {
                        return { error: '成就不存在: ' + achievementId };
                    }
                    // Check if already unlocked
                    if (achievement.unlocked.includes(achievementId)) {
                        return { success: true, message: '成就已解锁: ' + achData.name };
                    }
                    // Check condition
                    if (!this._checkAchievementCondition(achData.condition)) {
                        return { error: '成就条件未满足: ' + achData.name };
                    }
                    // Unlock
                    achievement.unlocked.push(achievementId);
                    return {
                        success: true,
                        achievementId,
                        message: '成就已解锁: ' + achData.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V114: mcpAchievementReward - 领取成就奖励
            mcpAchievementReward(args) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const { achievementId } = args || {};
                    if (!achievementId) return { error: '成就ID不能为空' };
                    const achievement = this._initAchievementState();
                    // Find achievement in pool
                    const achData = ACHIEVEMENT_POOL.find(a => a.id === achievementId);
                    if (!achData) {
                        return { error: '成就不存在: ' + achievementId };
                    }
                    // Check if unlocked
                    if (!achievement.unlocked.includes(achievementId)) {
                        return { error: '成就未解锁: ' + achData.name };
                    }
                    // Check if already claimed
                    if (achievement.rewardsClaimed.includes(achievementId)) {
                        return { error: '奖励已领取: ' + achData.name };
                    }
                    // Claim reward
                    achievement.rewardsClaimed.push(achievementId);
                    const reward = achData.reward || { spiritStones: 100, exp: 10 };
                    gs.spiritStones = (gs.spiritStones || 0) + (reward.spiritStones || 0);
                    return {
                        success: true,
                        achievementId,
                        reward,
                        message: '奖励已领取: ' + achData.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V124: _initTitleState - 初始化称号系统状态
            _initTitleState() {
                const gs = window.gameState;
                if (!gs.title) {
                    gs.title = {
                        titles: TITLE_POOL.map(t => ({ ...t })),
                        activeTitle: null
                    };
                }
                return gs.title;
            }

            // V124: mcpAchievementList - 获取成就列表
            mcpAchievementList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const achievement = this._initAchievementState();
                    const allAchievements = ACHIEVEMENT_POOL;
                    return {
                        success: true,
                        total: allAchievements.length,
                        achievements: allAchievements.map(a => ({
                            id: a.id,
                            name: a.name,
                            description: a.description,
                            progress: this._getAchievementProgress(a),
                            target: this._getAchievementTarget(a),
                            reward: a.reward,
                            claimed: achievement.rewardsClaimed.includes(a.id)
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V124: _getAchievementProgress - 获取成就当前进度
            _getAchievementProgress(achData) {
                const gs = window.gameState;
                const cond = achData.condition;
                switch (cond.type) {
                    case 'questCompleted': return gs.totalQuestCompleted || 0;
                    case 'totalStone': return gs.totalStone || 0;
                    case 'realm': return gs.realm || 0;
                    case 'rank': return gs.rank || 999999;
                    case 'pillCrafted': return gs.pillCrafted || 0;
                    case 'skillLearned': return gs.skillLearned || 0;
                    case 'equipmentEnhanced': return gs.equipmentEnhanced || 0;
                    case 'serendipity': return gs.serendipity || 0;
                    case 'inSect': return gs.sect && gs.sect.name ? 1 : 0;
                    case 'sectContribution': return gs.sect?.contribution || 0;
                    default: return 0;
                }
            }

            // V124: _getAchievementTarget - 获取成就目标值
            _getAchievementTarget(achData) {
                const cond = achData.condition;
                if (cond.type === 'realm' || cond.type === 'rank' || cond.type === 'sectLeader') return cond.level || cond.position || cond.amount;
                return cond.amount || 0;
            }

            // V124: mcpAchievementClaim - 领取成就奖励
            mcpAchievementClaim(achievementId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!achievementId) return { error: '成就ID不能为空' };
                    const achievement = this._initAchievementState();
                    const achData = ACHIEVEMENT_POOL.find(a => a.id === achievementId);
                    if (!achData) return { error: '成就不存在: ' + achievementId };
                    if (!achievement.unlocked.includes(achievementId)) return { error: '成就未解锁' };
                    if (achievement.rewardsClaimed.includes(achievementId)) return { error: '奖励已领取' };
                    achievement.rewardsClaimed.push(achievementId);
                    const reward = achData.reward || { spiritStones: 100, exp: 10 };
                    gs.spiritStones = (gs.spiritStones || 0) + (reward.spiritStones || 0);
                    return { success: true, achievementId, reward, message: '奖励已领取' };
                } catch (e) { return { error: e.message }; }
            }

            // V124: mcpAchievementProgress - 查看成就进度
            mcpAchievementProgress(achievementId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!achievementId) return { error: '成就ID不能为空' };
                    const achData = ACHIEVEMENT_POOL.find(a => a.id === achievementId);
                    if (!achData) return { error: '成就不存在: ' + achievementId };
                    const progress = this._getAchievementProgress(achData);
                    const target = this._getAchievementTarget(achData);
                    const complete = progress >= target;
                    return {
                        success: true,
                        achievementId,
                        name: achData.name,
                        progress,
                        target,
                        complete
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V124: mcpTitleList - 获取称号列表
            mcpTitleList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const title = this._initTitleState();
                    const unlockedTitles = title.titles.filter(t => t.unlocked);
                    return {
                        success: true,
                        total: unlockedTitles.length,
                        titles: unlockedTitles.map(t => ({
                            id: t.id,
                            name: t.name,
                            description: t.description
                        })),
                        activeTitle: title.activeTitle
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V124: mcpTitleActivate - 激活称号
            mcpTitleActivate(titleId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!titleId) return { error: '称号ID不能为空' };
                    const title = this._initTitleState();
                    const titleData = title.titles.find(t => t.id === titleId);
                    if (!titleData) return { error: '称号不存在: ' + titleId };
                    if (!titleData.unlocked) return { error: '称号未解锁' };
                    title.activeTitle = titleId;
                    return { success: true, titleId, name: titleData.name, message: '称号已激活' };
                } catch (e) { return { error: e.message }; }
            }

            // V124: mcpTitleRemove - 卸下称号
            mcpTitleRemove() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const title = this._initTitleState();
                    if (!title.activeTitle) return { success: true, message: '当前未佩戴称号' };
                    title.activeTitle = null;
                    return { success: true, message: '称号已卸下' };
                } catch (e) { return { error: e.message }; }
            }

            // V125: _initMailState - 初始化邮件状态
            _initMailState() {
                const gs = window.gameState;
                if (!gs.mail) {
                    gs.mail = {
                        mails: [],
                        nextMailId: 1
                    };
                }
                return gs.mail;
            }

            // V125: _initMessageState - 初始化消息状态
            _initMessageState() {
                const gs = window.gameState;
                if (!gs.message) {
                    gs.message = {
                        messages: [],
                        nextMessageId: 1
                    };
                }
                return gs.message;
            }

            // V125: mcpMailList - 获取邮件列表
            mcpMailList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mail = this._initMailState();
                    const unreadCount = mail.mails.filter(m => !m.read).length;
                    return {
                        success: true,
                        total: mail.mails.length,
                        unreadCount,
                        mails: mail.mails.map(m => ({
                            id: m.id,
                            from: m.from,
                            to: m.to,
                            title: m.title,
                            content: m.content,
                            time: m.time,
                            read: m.read,
                            attachments: m.attachments || []
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMailSend - 发送邮件
            mcpMailSend(to, title, content) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!to) return { error: '收件人不能为空' };
                    if (!title) return { error: '标题不能为空' };
                    if (!content) return { error: '内容不能为空' };
                    const mail = this._initMailState();
                    const newMail = {
                        id: 'mail_' + mail.nextMailId++,
                        from: gs.playerName || gs.name || 'player',
                        to: to,
                        title: title,
                        content: content,
                        time: Date.now(),
                        read: false,
                        attachments: []
                    };
                    mail.mails.push(newMail);
                    return { success: true, mailId: newMail.id, message: '邮件已发送' };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMailDelete - 删除邮件
            mcpMailDelete(mailId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mailId) return { error: '邮件ID不能为空' };
                    const mail = this._initMailState();
                    const index = mail.mails.findIndex(m => m.id === mailId);
                    if (index === -1) return { error: '邮件不存在: ' + mailId };
                    mail.mails.splice(index, 1);
                    return { success: true, message: '邮件已删除' };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMessageList - 获取消息列表
            mcpMessageList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const message = this._initMessageState();
                    const unreadCount = message.messages.filter(m => !m.read).length;
                    return {
                        success: true,
                        total: message.messages.length,
                        unreadCount,
                        messages: message.messages.map(m => ({
                            id: m.id,
                            type: m.type,
                            content: m.content,
                            time: m.time,
                            read: m.read
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMessageMarkRead - 标记消息已读
            mcpMessageMarkRead(messageId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!messageId) return { error: '消息ID不能为空' };
                    const message = this._initMessageState();
                    const msg = message.messages.find(m => m.id === messageId);
                    if (!msg) return { error: '消息不存在: ' + messageId };
                    msg.read = true;
                    return { success: true, message: '消息已标记为已读' };
                } catch (e) { return { error: e.message }; }
            }

            // V125: mcpMessageClear - 清空所有消息