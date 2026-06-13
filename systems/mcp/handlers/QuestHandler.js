// ============================================================
// QuestHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 31413-34927
// Auto-generated - Do not edit manually
// ============================================================

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
            mcpMessageClear() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const message = this._initMessageState();
                    const count = message.messages.length;
                    message.messages = [];
                    return { success: true, cleared: count, message: '已清空所有消息' };
                } catch (e) { return { error: e.message }; }
            }

            // V126: _initMapState - 初始化地图状态
            _initMapState() {
                const gs = window.gameState;
                if (!gs.map) {
                    gs.map = {
                        areas: MAP_AREAS.map(a => ({ ...a, unlocked: a.level === 1 })),
                        currentArea: null
                    };
                }
                return gs.map;
            }

            // V126: _initExploreState - 初始化探索状态
            _initExploreState() {
                const gs = window.gameState;
                if (!gs.explore) {
                    gs.explore = {
                        active: null,
                        history: []
                    };
                }
                return gs.explore;
            }

            // V126: mcpMapList - 获取地图区域列表
            mcpMapList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mapState = this._initMapState();
                    return {
                        success: true,
                        areas: mapState.areas.map(a => ({
                            id: a.id,
                            name: a.name,
                            level: a.level,
                            unlocked: a.unlocked,
                            description: a.description
                        })),
                        currentArea: mapState.currentArea
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpMapDetail - 获取地图详情
            mcpMapDetail(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    return {
                        success: true,
                        id: area.id,
                        name: area.name,
                        description: area.description,
                        level: area.level,
                        unlocked: area.unlocked,
                        unlockCost: area.unlockCost,
                        reward: area.reward,
                        duration: area.duration
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpMapUnlock - 解锁地图区域
            mcpMapUnlock(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    if (area.unlocked) return { error: '该区域已解锁' };
                    if (gs.spiritStones < area.unlockCost) return { error: '灵石不足，需要 ' + area.unlockCost + ' 灵石' };
                    gs.spiritStones -= area.unlockCost;
                    area.unlocked = true;
                    return { success: true, message: '区域已解锁: ' + area.name, cost: area.unlockCost };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreStart - 开始探索
            mcpExploreStart(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const exploreState = this._initExploreState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    if (!area.unlocked) return { error: '该区域未解锁，请先解锁' };
                    if (exploreState.active) return { error: '已有正在进行的探索，请先完成' };
                    exploreState.active = {
                        areaId: mapId,
                        areaName: area.name,
                        startTime: Date.now(),
                        duration: area.duration * 1000
                    };
                    return { success: true, message: '开始探索: ' + area.name, duration: area.duration };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreStatus - 查看探索状态
            mcpExploreStatus() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const exploreState = this._initExploreState();
                    if (!exploreState.active) return { active: false, message: '当前没有正在进行的探索' };
                    const elapsed = Date.now() - exploreState.active.startTime;
                    const remaining = Math.max(0, exploreState.active.duration - elapsed);
                    const completed = remaining === 0;
                    return {
                        active: true,
                        areaId: exploreState.active.areaId,
                        areaName: exploreState.active.areaName,
                        elapsed: Math.floor(elapsed / 1000),
                        remaining: Math.floor(remaining / 1000),
                        completed,
                        message: completed ? '探索已完成，可以领取奖励' : '探索进行中'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreComplete - 领取探索奖励
            mcpExploreComplete() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const exploreState = this._initExploreState();
                    if (!exploreState.active) return { error: '当前没有正在进行的探索' };
                    const elapsed = Date.now() - exploreState.active.startTime;
                    if (elapsed < exploreState.active.duration) return { error: '探索尚未完成' };
                    const mapState = this._initMapState();
                    const area = mapState.areas.find(a => a.id === exploreState.active.areaId);
                    if (!area) return { error: '地图区域不存在' };
                    gs.spiritStones = (gs.spiritStones || 0) + area.reward.spiritStones;
                    gs.exp = (gs.exp || 0) + area.reward.exp;
                    const historyEntry = {
                        areaId: exploreState.active.areaId,
                        areaName: exploreState.active.areaName,
                        reward: area.reward,
                        completedAt: Date.now()
                    };
                    exploreState.history.push(historyEntry);
                    exploreState.active = null;
                    return {
                        success: true,
                        message: '探索完成: ' + area.name,
                        reward: area.reward,
                        totalHistory: exploreState.history.length
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V127: _initShopState - 初始化商店状态
            _initShopState() {
                const gs = window.gameState;
                if (!gs.shop) {
                    gs.shop = {
                        shops: [
                            {
                                id: 'shop_general',
                                name: '杂货铺',
                                items: [
                                    { id: 'item_pill_health', name: '疗伤丹', price: 100, quantity: 10, type: 'potion', effect: { hp: 200 } },
                                    { id: 'item_pill_spirit', name: '灵气丹', price: 200, quantity: 10, type: 'potion', effect: { spirit: 100 } },
                                    { id: 'item_weapon_iron', name: '铁剑', price: 500, quantity: 5, type: 'weapon', effect: { attack: 10 } },
                                    { id: 'item_armor_leather', name: '皮甲', price: 300, quantity: 5, type: 'armor', effect: { defense: 5 } },
                                    { id: 'item_material_herb', name: '灵草', price: 50, quantity: 20, type: 'material', effect: {} }
                                ],
                                refreshCost: 50
                            },
                            {
                                id: 'shop_elite',
                                name: '珍宝阁',
                                items: [
                                    { id: 'item_pill_gold', name: '金身丹', price: 2000, quantity: 3, type: 'potion', effect: { defense: 50 } },
                                    { id: 'item_weapon_silver', name: '银剑', price: 5000, quantity: 2, type: 'weapon', effect: { attack: 30 } },
                                    { id: 'item_artifacts_pendant', name: '灵玉佩', price: 3000, quantity: 3, type: 'accessory', effect: { spirit: 200 } }
                                ],
                                refreshCost: 200
                            }
                        ],
                        nextShopId: 3
                    };
                }
                return gs.shop;
            }

            // V127: _initBagState - 初始化背包状态
            _initBagState() {
                const gs = window.gameState;
                if (!gs.bag) {
                    gs.bag = {
                        items: [],
                        capacity: 50
                    };
                }
                return gs.bag;
            }

            // V127: mcpShopList - 获取商店列表
            mcpShopList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const shopState = this._initShopState();
                    return {
                        success: true,
                        shops: shopState.shops.map(s => ({
                            id: s.id,
                            name: s.name,
                            itemCount: s.items.length,
                            refreshCost: s.refreshCost
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpShopBuy - 购买商品
            mcpShopBuy(shopId, itemId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!shopId) return { error: 'shopId不能为空' };
                    if (!itemId) return { error: 'itemId不能为空' };
                    const shopState = this._initShopState();
                    const shop = shopState.shops.find(s => s.id === shopId);
                    if (!shop) return { error: '商店不存在: ' + shopId };
                    const item = shop.items.find(i => i.id === itemId);
                    if (!item) return { error: '商品不存在: ' + itemId };
                    if (item.quantity <= 0) return { error: '商品已售罄' };
                    if ((gs.spiritStones || 0) < item.price) return { error: '灵石不足' };
                    gs.spiritStones -= item.price;
                    item.quantity -= 1;
                    const bagState = this._initBagState();
                    const existingItem = bagState.items.find(i => i.id === itemId);
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        bagState.items.push({
                            id: item.id,
                            name: item.name,
                            type: item.type,
                            effect: item.effect,
                            quantity: 1
                        });
                    }
                    return { success: true, message: '购买成功: ' + item.name, cost: item.price, itemId: item.id };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpShopRefresh - 刷新商店商品
            mcpShopRefresh(shopId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!shopId) return { error: 'shopId不能为空' };
                    const shopState = this._initShopState();
                    const shop = shopState.shops.find(s => s.id === shopId);
                    if (!shop) return { error: '商店不存在: ' + shopId };
                    if ((gs.spiritStones || 0) < shop.refreshCost) return { error: '灵石不足，无法刷新' };
                    gs.spiritStones -= shop.refreshCost;
                    // Refresh item quantities
                    shop.items.forEach(item => {
                        item.quantity = Math.floor(Math.random() * 10) + 1;
                    });
                    return { success: true, message: '刷新成功: ' + shop.name, cost: shop.refreshCost };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpBagList - 获取背包物品
            mcpBagList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const bagState = this._initBagState();
                    return {
                        success: true,
                        items: bagState.items,
                        count: bagState.items.length,
                        capacity: bagState.capacity
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpBagUse - 使用物品
            mcpBagUse(itemId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!itemId) return { error: 'itemId不能为空' };
                    const bagState = this._initBagState();
                    const item = bagState.items.find(i => i.id === itemId);
                    if (!item) return { error: '物品不存在: ' + itemId };
                    if (item.quantity <= 0) return { error: '物品数量不足' };
                    let message = '使用成功: ' + item.name;
                    let effectApplied = {};
                    if (item.type === 'potion' || item.type === 'material') {
                        // Apply effect from potion
                        if (item.effect.hp) {
                            gs.hp = (gs.hp || 0) + item.effect.hp;
                            effectApplied.hp = item.effect.hp;
                        }
                        if (item.effect.spirit) {
                            gs.spirit = (gs.spirit || 0) + item.effect.spirit;
                            effectApplied.spirit = item.effect.spirit;
                        }
                        if (item.effect.attack) {
                            gs.attack = (gs.attack || 0) + item.effect.attack;
                            effectApplied.attack = item.effect.attack;
                        }
                        if (item.effect.defense) {
                            gs.defense = (gs.defense || 0) + item.effect.defense;
                            effectApplied.defense = item.effect.defense;
                        }
                    } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
                        // Equipment applies permanent bonus (tracked separately)
                        effectApplied = item.effect;
                        message += ' (装备效果已生效)';
                    }
                    item.quantity -= 1;
                    if (item.quantity <= 0) {
                        const idx = bagState.items.findIndex(i => i.id === itemId);
                        if (idx !== -1) bagState.items.splice(idx, 1);
                    }
                    return { success: true, message, effect: effectApplied, remaining: item.quantity };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpBagSell - 出售物品
            mcpBagSell(itemId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!itemId) return { error: 'itemId不能为空' };
                    const bagState = this._initBagState();
                    const item = bagState.items.find(i => i.id === itemId);
                    if (!item) return { error: '物品不存在: ' + itemId };
                    if (item.quantity <= 0) return { error: '物品数量不足' };
                    // Calculate sell price (50% of purchase price)
                    const sellPrice = Math.floor((item.price || 0) * 0.5);
                    gs.spiritStones = (gs.spiritStones || 0) + sellPrice;
                    item.quantity -= 1;
                    if (item.quantity <= 0) {
                        const idx = bagState.items.findIndex(i => i.id === itemId);
                        if (idx !== -1) bagState.items.splice(idx, 1);
                    }
                    return { success: true, message: '出售成功: ' + item.name, revenue: sellPrice, remaining: item.quantity };
                } catch (e) { return { error: e.message }; }
            }

            // V128: _initQuestState - 初始化任务状态
            _initQuestState() {
                const gs = window.gameState;
                if (!gs.quest) {
                    gs.quest = {
                        available: [
                            { id: 'quest_1', title: '收集灵草', description: '在仙界采集10株灵草', reward: { spiritStones: 100 }, requirement: { type: 'collect', itemId: 'herb', count: 10 }, progress: 0 },
                            { id: 'quest_2', title: '击败妖兽', description: '在秘境中击败5只妖兽', reward: { spiritStones: 200 }, requirement: { type: 'combat', count: 5 }, progress: 0 },
                            { id: 'quest_3', title: '炼制丹药', description: '炼制3颗灵气丹', reward: { spiritStones: 150 }, requirement: { type: 'craft', itemId: 'pill_spirit', count: 3 }, progress: 0 }
                        ],
                        active: [],
                        completed: []
                    };
                }
                return gs.quest;
            }

            // V128: _initDailyState - 初始化日常任务状态
            _initDailyState() {
                const gs = window.gameState;
                const now = Date.now();
                if (!gs.daily) {
                    gs.daily = {
                        tasks: [
                            { id: 'daily_1', title: '每日修炼', description: '完成灵气修炼', progress: 0, target: 1, reward: { spiritStones: 50 }, claimed: false },
                            { id: 'daily_2', title: '采集灵石', description: '采集5块灵石', progress: 0, target: 5, reward: { spiritStones: 30 }, claimed: false },
                            { id: 'daily_3', title: '击败怪物', description: '击败3只怪物', progress: 0, target: 3, reward: { spiritStones: 80 }, claimed: false }
                        ],
                        lastReset: now
                    };
                }
                return gs.daily;
            }

            // V128: mcpQuestList - 获取任务列表
            mcpQuestList(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const questState = this._initQuestState();
                    const f = filter || 'available';
                    switch (f) {
                        case 'available': return { success: true, available: questState.available };
                        case 'active': return { success: true, active: questState.active };
                        case 'completed': return { success: true, completed: questState.completed };
                        case 'all': return { success: true, available: questState.available, active: questState.active, completed: questState.completed };
                        default: return { error: 'Unknown filter: ' + f };
                    }
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpQuestAccept - 接受任务
            mcpQuestAccept(questId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!questId) return { error: 'questId不能为空' };
                    const questState = this._initQuestState();
                    const idx = questState.available.findIndex(q => q.id === questId);
                    if (idx === -1) return { error: '任务不存在: ' + questId };
                    const quest = questState.available.splice(idx, 1)[0];
                    quest.progress = 0;
                    questState.active.push(quest);
                    return { success: true, message: '接受任务成功: ' + quest.title, questId: quest.id };
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpQuestComplete - 完成任务
            mcpQuestComplete(questId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!questId) return { error: 'questId不能为空' };
                    const questState = this._initQuestState();
                    const idx = questState.active.findIndex(q => q.id === questId);
                    if (idx === -1) return { error: '任务不存在或未接取: ' + questId };
                    const quest = questState.active[idx];
                    const req = quest.requirement;
                    if (quest.progress < req.count) return { error: '任务进度不足: ' + quest.progress + '/' + req.count };
                    // Award reward
                    if (quest.reward.spiritStones) gs.spiritStones = (gs.spiritStones || 0) + quest.reward.spiritStones;
                    // Move to completed
                    questState.active.splice(idx, 1);
                    questState.completed.push({ ...quest, completedAt: Date.now() });
                    return { success: true, message: '完成任务: ' + quest.title, reward: quest.reward };
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpDailyList - 获取日常任务
            mcpDailyList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const dailyState = this._initDailyState();
                    return { success: true, tasks: dailyState.tasks };
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpDailyClaim - 领取日常奖励
            mcpDailyClaim(dailyId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!dailyId) return { error: 'dailyId不能为空' };
                    const dailyState = this._initDailyState();
                    const task = dailyState.tasks.find(t => t.id === dailyId);
                    if (!task) return { error: '日常任务不存在: ' + dailyId };
                    if (task.claimed) return { error: '奖励已领取' };
                    if (task.progress < task.target) return { error: '任务未完成: ' + task.progress + '/' + task.target };
                    if (task.reward.spiritStones) gs.spiritStones = (gs.spiritStones || 0) + task.reward.spiritStones;
                    task.claimed = true;
                    return { success: true, message: '领取奖励成功: ' + task.title, reward: task.reward };
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpDailyReset - 重置日常任务
            mcpDailyReset() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const dailyState = this._initDailyState();
                    dailyState.tasks.forEach(t => {
                        t.progress = 0;
                        t.claimed = false;
                    });
                    dailyState.lastReset = Date.now();
                    return { success: true, message: '日常任务已重置' };
                } catch (e) { return { error: e.message }; }
            }

            // V129: 境界+突破系统 - 境界定义
            // V129使用扩展境界列表: 炼气、筑基、金丹、元婴、化神、炼虚、合道、大乘、真仙、金仙、太乙、大罗、道祖
            _getRealmList() {
                return ['炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合道', '大乘', '真仙', '金仙', '太乙', '大罗', '道祖'];
            }

            _getRealmDetail(realmIndex) {
                const realms = this._getRealmList();
                if (realmIndex < 0 || realmIndex >= realms.length) return null;
                const realmNames = realms[realmIndex];
                // 每个境界的突破条件: 需要灵气值和完成度
                const conditions = {
                    炼气: { minSpirit: 0, description: '初入修炼之路' },
                    筑基: { minSpirit: 1000, description: '凝聚根基，踏入修炼' },
                    金丹: { minSpirit: 5000, description: '金丹成型，灵力凝聚' },
                    元婴: { minSpirit: 20000, description: '元婴出窍，神识已成' },
                    化神: { minSpirit: 50000, description: '化神入虚，天人合一' },
                    炼虚: { minSpirit: 100000, description: '炼虚合道，返璞归真' },
                    合道: { minSpirit: 300000, description: '合道天地，万法归一' },
                    大乘: { minSpirit: 800000, description: '大乘境界，神通无量' },
                    真仙: { minSpirit: 2000000, description: '超凡入圣，真仙之境' },
                    金仙: { minSpirit: 5000000, description: '金仙不朽，万劫不灭' },
                    太乙: { minSpirit: 10000000, description: '太乙无量，大道独尊' },
                    大罗: { minSpirit: 30000000, description: '大罗混元，诸天至高' },
                    道祖: { minSpirit: 100000000, description: '道祖之境，天地同寿' }
                };
                return {
                    index: realmIndex,
                    name: realmNames,
                    condition: conditions[realmNames] || { minSpirit: 0, description: '未知境界' }
                };
            }

            // V129: _initRealmState - 初始化境界系统状态
            _initRealmState() {
                const gs = window.gameState;
                if (!gs.realm) {
                    gs.realm = {
                        currentRealm: 0,  // 炼气期 (index 0)
                        realmHistory: [],
                        realmProgress: 0  // 当前境界进度 0-100
                    };
                }
                return gs.realm;
            }

            // V129: _initBreakthroughState - 初始化突破系统状态
            _initBreakthroughState() {
                const gs = window.gameState;
                if (!gs.breakthrough) {
                    gs.breakthrough = {
                        preparing: false,
                        inProgress: false,
                        startTime: null,
                        duration: 0,        // 突破持续时间(ms)
                        result: null,       // 'success' | 'failed' | null
                        success: false
                    };
                }
                return gs.breakthrough;
            }

            // V130: _initSectState - 初始化宗门系统状态
            _initSectState() {
                const gs = window.gameState;
                if (!gs.sect) {
                    gs.sect = {
                        sects: [],              // 所有宗门列表
                        playerSect: null        // 玩家所属宗门
                    };
                }
                return gs.sect;
            }

            // V130: _initDiscipleState - 初始化弟子系统状态
            _initDiscipleState() {
                const gs = window.gameState;
                if (!gs.disciple) {
                    gs.disciple = {
                        disciples: [],          // 所有弟子列表
                        recruitCost: 500        // 招募消耗灵石
                    };
                }
                return gs.disciple;
            }

            // V131: _initTreasureState - 初始化秘宝系统状态
            _initTreasureState() {
                const gs = window.gameState;
                if (!gs.treasure) {
                    gs.treasure = {
                        treasures: [],         // 所有秘宝列表
                        nextId: 1              // 下一个秘宝ID
                    };
                }
                return gs.treasure;
            }

            // V131: _initEquipState - 初始化装备系统状态
            _initEquipState() {
                const gs = window.gameState;
                if (!gs.equip) {
                    gs.equip = {
                        equipped: {
                            weapon: null,
                            armor: null,
                            accessory: null
                        },
                        inventory: []          // 背包中的装备
                    };
                }
                return gs.equip;
            }

            // V131: mcpTreasureList - 获取秘宝列表
            mcpTreasureList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const treasureState = this._initTreasureState();
                    return {
                        success: true,
                        total: treasureState.treasures.length,
                        treasures: treasureState.treasures
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpTreasureEnhance - 强化秘宝
            mcpTreasureEnhance(treasureId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const treasureState = this._initTreasureState();
                    const treasure = treasureState.treasures.find(t => t.id === treasureId);
                    if (!treasure) return { error: '秘宝不存在: ' + treasureId };
                    // 消耗材料: 每级需要 level * 100 灵气
                    const cost = treasure.level * 100;
                    if ((gs.spiritStones || 0) < cost) return { error: '灵气不足，强化需要 ' + cost + ' 灵气' };
                    gs.spiritStones -= cost;
                    treasure.level += 1;
                    return { success: true, treasure, cost };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpTreasureDisassemble - 分解秘宝
            mcpTreasureDisassemble(treasureId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const treasureState = this._initTreasureState();
                    const idx = treasureState.treasures.findIndex(t => t.id === treasureId);
                    if (idx === -1) return { error: '秘宝不存在: ' + treasureId };
                    const treasure = treasureState.treasures[idx];
                    // 分解获得材料: level * 50 灵气
                    const reward = treasure.level * 50;
                    gs.spiritStones = (gs.spiritStones || 0) + reward;
                    treasureState.treasures.splice(idx, 1);
                    return { success: true, reward, message: '分解获得 ' + reward + ' 灵气' };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpEquipList - 获取装备列表
            mcpEquipList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const equipState = this._initEquipState();
                    return {
                        success: true,
                        equipped: equipState.equipped,
                        inventoryCount: equipState.inventory.length
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpEquipEquip - 穿戴装备
            mcpEquipEquip(equipId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const equipState = this._initEquipState();
                    const equip = equipState.inventory.find(e => e.id === equipId);
                    if (!equip) return { error: '装备不存在: ' + equipId };
                    const slot = equip.slot;
                    const prevEquip = equipState.equipped[slot];
                    if (prevEquip) {
                        equipState.inventory.push(prevEquip);
                    }
                    equipState.equipped[slot] = equip;
                    equipState.inventory = equipState.inventory.filter(e => e.id !== equipId);
                    return { success: true, slot, equip, previousEquip: prevEquip };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpEquipUnequip - 卸下装备
            mcpEquipUnequip(slot) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const equipState = this._initEquipState();
                    const validSlots = ['weapon', 'armor', 'accessory'];
                    if (!validSlots.includes(slot)) return { error: '无效的装备槽位: ' + slot };
                    const equip = equipState.equipped[slot];
                    if (!equip) return { error: '该槽位没有装备: ' + slot };
                    equipState.inventory.push(equip);
                    equipState.equipped[slot] = null;
                    return { success: true, slot, equip };
                } catch (e) { return { error: e.message }; }
            }

            // V132: _initPetState - 初始化灵宠系统状态
            _initPetState() {
                const gs = window.gameState;
                if (!gs.pet) {
                    gs.pet = {
                        pets: [],            // 所有灵宠列表
                        nextId: 1,           // 下一个灵宠ID
                        captureCost: 500     // 捕捉消耗灵石
                    };
                }
                return gs.pet;
            }

            // V132: _initEvolveState - 初始化进化系统状态
            _initEvolveState() {
                const gs = window.gameState;
                if (!gs.evolve) {
                    gs.evolve = {
                        preparing: false,    // 是否准备中
                        inProgress: false,   // 是否进化中
                        petId: null,          // 进化中的灵宠ID
                        startTime: null      // 进化开始时间
                    };
                }
                return gs.evolve;
            }

            // V133: _initPillState - 初始化丹药系统状态
            _initPillState() {
                const gs = window.gameState;
                if (!gs.pill) {
                    gs.pill = {
                        inventory: [],       // 丹药背包
                        nextId: 1,           // 下一个丹药ID
                        consumeBonus: { attack: 0, defense: 0, spirit: 0, maxHp: 0 }  // 丹药加成
                    };
                }
                return gs.pill;
            }

            // V133: _initAlchemyState - 初始化炼药系统状态
            _initAlchemyState() {
                const gs = window.gameState;
                if (!gs.alchemy) {
                    gs.alchemy = {
                        recipes: [           // 炼药配方
                            { id: 'qi_spirit', name: '灵气丹', materials: { herb: 2, crystal: 1 }, result: { type: 'qi', effect: { spirit: 50 }, grade: 1 }, time: 5 },
                            { id: 'body_strengthening', name: '强体丹', materials: { herb: 3, beastCore: 1 }, result: { type: 'body', effect: { attack: 30, defense: 30 }, grade: 1 }, time: 8 },
                            { id: 'spirit_boost', name: '神识丹', materials: { herb: 5, soulDust: 2 }, result: { type: 'spirit', effect: { spirit: 100 }, grade: 2 }, time: 15 },
                            { id: 'health_restore', name: '回春丹', materials: { herb: 2, lifeRoot: 1 }, result: { type: 'health', effect: { maxHp: 200 }, grade: 1 }, time: 5 },
                            { id: 'comprehensive', name: '综合丹', materials: { herb: 4, crystal: 2, beastCore: 1 }, result: { type: 'all', effect: { attack: 20, defense: 20, spirit: 20, maxHp: 100 }, grade: 2 }, time: 20 }
                        ],
                        currentAlchemy: null  // 当前炼药状态
                    };
                }
                return gs.alchemy;
            }

            // V132: mcpPetList - 获取灵宠列表
            mcpPetList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    return {
                        success: true,
                        total: petState.pets.length,
                        pets: petState.pets,
                        captureCost: petState.captureCost
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpPetCapture - 捕捉灵宠
            mcpPetCapture() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const cost = petState.captureCost;
                    if ((gs.spiritStones || 0) < cost) return { error: '灵石不足，捕捉需要 ' + cost + ' 灵石' };
                    gs.spiritStones -= cost;
                    // 随机生成灵宠
                    const species = ['灵狐', '玄龟', '火鹤', '玉兔', '银狼', '青蛇', '白虎', '金鹏'];
                    const speciesIndex = Math.floor(Math.random() * species.length);
                    const baseLevel = Math.floor(Math.random() * 3) + 1;
                    const names = ['小仙', '灵儿', '小白', '阿福', '朵朵', '威威', '圆圆', '壮壮'];
                    const nameIndex = Math.floor(Math.random() * names.length);
                    const pet = {
                        id: 'pet_' + (petState.nextId++),
                        name: names[nameIndex],
                        species: species[speciesIndex],
                        level: baseLevel,
                        evolutionStage: 1,
                        stats: {
                            attack: 10 + baseLevel * 5,
                            defense: 5 + baseLevel * 3,
                            spirit: 8 + baseLevel * 4
                        }
                    };
                    petState.pets.push(pet);
                    return { success: true, pet, cost, message: '捕捉成功！获得 ' + pet.species + ' 【' + pet.name + '】' };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpPetRelease - 放生灵宠
            mcpPetRelease(petId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const idx = petState.pets.findIndex(p => p.id === petId);
                    if (idx === -1) return { error: '灵宠不存在: ' + petId };
                    const pet = petState.pets[idx];
                    petState.pets.splice(idx, 1);
                    return { success: true, pet, message: '放生了 ' + pet.species + ' 【' + pet.name + '】' };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpEvolvePrepare - 准备进化
            mcpEvolvePrepare(petId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const evolveState = this._initEvolveState();
                    const pet = petState.pets.find(p => p.id === petId);
                    if (!pet) return { error: '灵宠不存在: ' + petId };
                    // 检查是否可进化（等级>=5可进化）
                    if (pet.level < 5) {
                        return { success: false, petId, message: pet.name + ' 等级不足，需要5级才能进化', levelRequired: 5, currentLevel: pet.level };
                    }
                    if (pet.evolutionStage >= 3) {
                        return { success: false, petId, message: pet.name + ' 已达最高进化阶段', maxStage: 3 };
                    }
                    evolveState.preparing = true;
                    evolveState.petId = petId;
                    return {
                        success: true,
                        petId,
                        petName: pet.name,
                        currentStage: pet.evolutionStage,
                        nextStage: pet.evolutionStage + 1,
                        message: pet.name + ' 已准备好进化，当前阶段 ' + pet.evolutionStage + '，可进化至 ' + (pet.evolutionStage + 1)
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpEvolveStart - 开始进化
            mcpEvolveStart() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const evolveState = this._initEvolveState();
                    if (!evolveState.preparing || !evolveState.petId) {
                        return { error: '没有准备进化的灵宠，请先调用 evolve.prepare' };
                    }
                    const pet = petState.pets.find(p => p.id === evolveState.petId);
                    if (!pet) return { error: '灵宠不存在，可能已被放生' };
                    evolveState.preparing = false;
                    evolveState.inProgress = true;
                    evolveState.startTime = Date.now();
                    return {
                        success: true,
                        petId: pet.id,
                        petName: pet.name,
                        message: pet.name + ' 开始进化，请等待后调用 evolve.complete 完成进化'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpEvolveComplete - 完成进化
            mcpEvolveComplete() {
                try {
                    const gs = window.gameState;