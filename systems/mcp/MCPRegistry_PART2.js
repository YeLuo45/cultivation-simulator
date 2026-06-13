// ============================================================
// MCPRegistry_PART2.js
// MCP Tool Definition Registry - Part of cultivation-simulator
// Auto-generated - Do not edit manually
// ============================================================

// ------------------------------------------------------------
// const MCP_TOOLS_V165 (lines 44121-44176, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V165 = {
            'achievement.list': {
                name: 'achievement.list',
                description: '获取成就列表 (成就系统v3-获取所有成就列表及解锁状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'achievement.view': {
                name: 'achievement.view',
                description: '查看成就详情 (成就系统v3-查看指定成就的详细信息和进度)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.unlock': {
                name: 'achievement.unlock',
                description: '解锁成就 (成就系统v3-解锁指定成就(自动或手动)，触发奖励发放)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.reward': {
                name: 'achievement.reward',
                description: '领取成就奖励 (成就系统v3-领取已完成成就的奖励(灵石、声誉、称号))',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'badge.list': {
                name: 'badge.list',
                description: '获取徽章列表 (徽章系统v3-获取所有徽章列表及装备状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'badge.equip': {
                name: 'badge.equip',
                description: '装备徽章 (徽章系统v3-装备指定徽章获得属性加成，最多装备3个)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        badgeId: { type: 'string', description: '徽章ID' }
                    },
                    required: ['badgeId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V166 (lines 44179-44236, 58 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V166 = {
            'rank.list': {
                name: 'rank.list',
                description: '获取排行榜列表 (排行榜+竞技系统v3-获取所有类型排行榜概览)',
                inputSchema: { type: 'object', properties: {} }
            },
            'rank.view': {
                name: 'rank.view',
                description: '查看排行详情 (排行榜+竞技系统v3-查看指定排行详情及玩家排名)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rankType: { type: 'string', description: '排行榜类型: power/level/realm/wealth' },
                        period: { type: 'string', description: '周期: weekly/monthly/all' }
                    },
                    required: ['rankType']
                }
            },
            'rank.reward': {
                name: 'rank.reward',
                description: '领取排行奖励 (排行榜+竞技系统v3-领取指定周期排行榜奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rankType: { type: 'string', description: '排行榜类型: power/level/realm/wealth' },
                        period: { type: 'string', description: '周期: weekly/monthly/all' }
                    },
                    required: ['rankType', 'period']
                }
            },
            'arena.match': {
                name: 'arena.match',
                description: '开始匹配 (排行榜+竞技系统v3-开始匹配对手进行竞技)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.fight': {
                name: 'arena.fight',
                description: '发起战斗 (排行榜+竞技系统v3-发起战斗并自动结算)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        matchId: { type: 'string', description: '匹配ID' }
                    },
                    required: ['matchId']
                }
            },
            'arena.reward': {
                name: 'arena.reward',
                description: '领取竞技奖励 (排行榜+竞技系统v3-领取赛季段位奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: '周期: weekly/monthly' }
                    },
                    required: ['period']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V167 (lines 44239-44294, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V167 = {
            'serendipityV3.list': {
                name: 'serendipityV3.list',
                description: '获取奇遇列表 (奇遇+事件系统v3-获取所有可触发奇遇)',
                inputSchema: { type: 'object', properties: {} }
            },
            'serendipityV3.start': {
                name: 'serendipityV3.start',
                description: '开始奇遇 (奇遇+事件系统v3-开始指定奇遇)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serendipityId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['serendipityId']
                }
            },
            'serendipityV3.complete': {
                name: 'serendipityV3.complete',
                description: '完成奇遇 (奇遇+事件系统v3-完成奇遇领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serendipityId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['serendipityId']
                }
            },
            'eventV3.list': {
                name: 'eventV3.list',
                description: '获取事件列表 (奇遇+事件系统v3-获取所有进行中事件)',
                inputSchema: { type: 'object', properties: {} }
            },
            'eventV3.join': {
                name: 'eventV3.join',
                description: '参与事件 (奇遇+事件系统v3-参与指定事件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' }
                    },
                    required: ['eventId']
                }
            },
            'eventV3.reward': {
                name: 'eventV3.reward',
                description: '领取事件奖励 (奇遇+事件系统v3-领取完成事件奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' }
                    },
                    required: ['eventId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V168 (lines 44297-44352, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V168 = {
            'questV3.list': {
                name: 'questV3.list',
                description: '获取悬赏列表 (悬赏系统v3-获取所有可接悬赏任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'questV3.accept': {
                name: 'questV3.accept',
                description: '接受悬赏任务 (悬赏系统v3-接受指定悬赏任务)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '悬赏任务ID' }
                    },
                    required: ['questId']
                }
            },
            'questV3.complete': {
                name: 'questV3.complete',
                description: '完成悬赏任务 (悬赏系统v3-完成悬赏任务领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '悬赏任务ID' }
                    },
                    required: ['questId']
                }
            },
            'chainV3.list': {
                name: 'chainV3.list',
                description: '获取任务链列表 (任务链系统v3-获取所有任务链)',
                inputSchema: { type: 'object', properties: {} }
            },
            'chainV3.progress': {
                name: 'chainV3.progress',
                description: '查看任务链进度 (任务链系统v3-查看指定任务链进度)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: '任务链ID' }
                    },
                    required: ['chainId']
                }
            },
            'chainV3.claim': {
                name: 'chainV3.claim',
                description: '领取任务链奖励 (任务链系统v3-领取完成所有步骤的任务链奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: '任务链ID' }
                    },
                    required: ['chainId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V169 (lines 44355-44386, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V169 = {
            'investment.list': {
                name: 'investment.list',
                description: '获取投资项目列表 (投资系统v4-获取所有投资项目，含每日限量状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'investment.buy': {
                name: 'investment.buy',
                description: '购买投资份额 (投资系统v4-购买指定投资产品，每日限量)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' }, amount: { type: 'number', description: '购买金额（默认最低投资额）' } }, required: ['investmentId'] }
            },
            'investment.profit': {
                name: 'investment.profit',
                description: '查看投资收益 (投资系统v4-查看每日结算收益详情)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' } }, required: ['investmentId'] }
            },
            'investment.redeem': {
                name: 'investment.redeem',
                description: '赎回投资本金 (投资系统v4-到期后赎回本金和收益)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' } }, required: ['investmentId'] }
            },
            'monthcard.status': {
                name: 'monthcard.status',
                description: '获取月卡状态 (月卡系统v4-查看月卡状态、剩余天数和等级)',
                inputSchema: { type: 'object', properties: {} }
            },
            'monthcard.buy': {
                name: 'monthcard.buy',
                description: '购买月卡 (月卡系统v4-购买月卡，支持普通/黄金/钻石等级)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V170 (lines 44389-44445, 57 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V170 = {
            'redpacket.list': {
                name: 'redpacket.list',
                description: '获取红包列表 (红包系统v3-获取所有可领取红包列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'redpacket.receive': {
                name: 'redpacket.receive',
                description: '领取红包 (红包系统v3-领取指定红包，随机金额，每人限领一次)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        redpacketId: { type: 'string', description: '红包ID' }
                    },
                    required: ['redpacketId']
                }
            },
            'redpacket.send': {
                name: 'redpacket.send',
                description: '发送红包 (红包系统v3-发送红包，消耗灵石，设定金额和个数)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        redpacketId: { type: 'string', description: '红包ID(可选)' },
                        amount: { type: 'number', description: '红包总金额(灵石)' }
                    },
                    required: ['amount']
                }
            },
            'friend.list': {
                name: 'friend.list',
                description: '获取好友列表 (社交系统v3-获取好友列表及申请状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'friend.apply': {
                name: 'friend.apply',
                description: '申请添加好友 (社交系统v3-申请添加好友)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerName: { type: 'string', description: '玩家名称' }
                    },
                    required: ['playerName']
                }
            },
            'friend.accept': {
                name: 'friend.accept',
                description: '接受好友申请 (社交系统v3-接受好友申请，建立双向好友关系)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        applyId: { type: 'string', description: '申请ID' }
                    },
                    required: ['applyId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V171 (lines 44448-44503, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V171 = {
            'pet.list': {
                name: 'pet.list',
                description: '获取宠物列表 (宠物系统v4-获取所有宠物列表及装备状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'pet.equip': {
                name: 'pet.equip',
                description: '装备宠物 (宠物系统v4-装备指定宠物获得属性加成)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['petId']
                }
            },
            'pet.evolve': {
                name: 'pet.evolve',
                description: '宠物进化 (宠物系统v4-进化宠物提升属性，消耗道具和灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['petId']
                }
            },
            'explore.list': {
                name: 'explore.list',
                description: '获取探险列表 (探险系统v4-获取所有探险区域及状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'explore.start': {
                name: 'explore.start',
                description: '开始探险 (探险系统v4-开始指定探险，需宠物支援)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' }
                    },
                    required: ['exploreId']
                }
            },
            'explore.complete': {
                name: 'explore.complete',
                description: '完成探险 (探险系统v4-完成探险获得奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' }
                    },
                    required: ['exploreId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V172 (lines 44506-44555, 50 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V172 = {
            'codex.list': {
                name: 'codex.list',
                description: '获取图鉴列表 (图鉴系统v4-获取所有图鉴类别和条目)',
                inputSchema: { type: 'object', properties: {} }
            },
            'codex.view': {
                name: 'codex.view',
                description: '查看图鉴详情 (图鉴系统v4-查看指定图鉴条目详情)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        codexId: { type: 'string', description: '图鉴ID' }
                    },
                    required: ['codexId']
                }
            },
            'codex.unlock': {
                name: 'codex.unlock',
                description: '解锁图鉴条目 (图鉴系统v4-解锁图鉴条目，消耗灵石或完成成就)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        codexId: { type: 'string', description: '图鉴ID' }
                    },
                    required: ['codexId']
                }
            },
            'collection.stats': {
                name: 'collection.stats',
                description: '获取收集统计数据 (收集系统v4-获取所有收集项及完成度)',
                inputSchema: { type: 'object', properties: {} }
            },
            'collection.reward': {
                name: 'collection.reward',
                description: '领取收集奖励 (收集系统v4-领取完成收集的奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        collectionId: { type: 'string', description: '收集ID' }
                    },
                    required: ['collectionId']
                }
            },
            'collection.reset': {
                name: 'collection.reset',
                description: '重置收集进度 (收集系统v4-重置收集进度，需消耗道具)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V173 (lines 44558-44615, 58 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V173 = {
            'mail.list': {
                name: 'mail.list',
                description: '获取邮件列表 (邮件系统v4-获取收件箱和已发送邮件列表，支持星标和更多邮件状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'mail.send': {
                name: 'mail.send',
                description: '发送邮件 (邮件系统v4-发送邮件，消耗15灵石，支持附件标记)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        to: { type: 'string', description: '收件人ID' },
                        title: { type: 'string', description: '邮件标题' },
                        content: { type: 'string', description: '邮件内容' }
                    },
                    required: ['to', 'title', 'content']
                }
            },
            'mail.read': {
                name: 'mail.read',
                description: '读取邮件内容 (邮件系统v4-读取邮件并标记为已读，支持星标邮件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mailId: { type: 'string', description: '邮件ID' }
                    },
                    required: ['mailId']
                }
            },
            'mail.delete': {
                name: 'mail.delete',
                description: '删除邮件 (邮件系统v4-删除指定邮件，支持批量删除收件箱邮件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mailId: { type: 'string', description: '邮件ID' }
                    },
                    required: ['mailId']
                }
            },
            'announce.list': {
                name: 'announce.list',
                description: '获取公告列表 (公告系统v4-获取未过期的公告列表，支持置顶公告)',
                inputSchema: { type: 'object', properties: {} }
            },
            'announce.view': {
                name: 'announce.view',
                description: '查看公告详情 (公告系统v4-查看公告详情并标记为已查看，支持置顶功能)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        announceId: { type: 'string', description: '公告ID' }
                    },
                    required: ['announceId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V174 (lines 44618-44661, 44 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V174 = {
            'signin.list': {
                name: 'signin.list',
                description: '获取签到列表 (签到系统v4-获取本月签到记录和补签机会)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.checkin': {
                name: 'signin.checkin',
                description: '执行签到 (签到系统v4-执行签到，连续签到奖励加成)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.reward': {
                name: 'signin.reward',
                description: '领取签到奖励 (签到系统v4-领取指定天数的签到奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        day: { type: 'number', description: '奖励天数(1-7)' }
                    },
                    required: ['day']
                }
            },
            'signin.makeup': {
                name: 'signin.makeup',
                description: '补签前一天 (签到系统v4-补签前一天，消耗灵石，每天最多补签1次)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.list': {
                name: 'welfare.list',
                description: '获取福利列表 (福利系统v4-获取可用福利列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利 (福利系统v4-领取福利，消耗积分或完成成就)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        welfareId: { type: 'string', description: '福利ID' }
                    },
                    required: ['welfareId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V184 (lines 44664-44713, 50 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V184 = {
            'signin.list': {
                name: 'signin.list',
                description: '获取签到列表 (签到系统v5-获取本月签到状态和奖励阈值信息)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.checkin': {
                name: 'signin.checkin',
                description: '执行签到 (签到系统v5-执行签到，自动累加连续签到天数)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.reward': {
                name: 'signin.reward',
                description: '领取签到奖励 (签到系统v5-按连续天数阈值领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rewardType: { type: 'string', description: '奖励类型 (bronze/silver/gold)' }
                    },
                    required: ['rewardType']
                }
            },
            'signin.makeup': {
                name: 'signin.makeup',
                description: '补签 (签到系统v5-补签指定日期，消耗灵石，需开启补签功能)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        date: { type: 'string', description: '补签日期 YYYY-MM-DD' }
                    },
                    required: ['date']
                }
            },
            'welfare.list': {
                name: 'welfare.list',
                description: '获取福利列表 (福利系统v5-获取可领取福利列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利 (福利系统v5-领取福利，消耗灵石或免费，扣除库存)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        welfareId: { type: 'string', description: '福利ID' }
                    },
                    required: ['welfareId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V175 (lines 44716-44771, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V175 = {
            'achievement.list': {
                name: 'achievement.list',
                description: '获取成就列表 (成就系统v4-获取所有成就列表及解锁状态，包含进度追踪)',
                inputSchema: { type: 'object', properties: {} }
            },
            'achievement.view': {
                name: 'achievement.view',
                description: '查看成就详情 (成就系统v4-查看指定成就的详细信息、进度和奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.unlock': {
                name: 'achievement.unlock',
                description: '解锁成就 (成就系统v4-解锁成就(自动或手动)，触发奖励发放，记录解锁时间)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.reward': {
                name: 'achievement.reward',
                description: '领取成就奖励 (成就系统v4-领取已完成成就的奖励(灵石、声誉、称号))',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'badge.list': {
                name: 'badge.list',
                description: '获取徽章列表 (徽章系统v4-获取所有徽章列表及装备状态，支持稀有度筛选)',
                inputSchema: { type: 'object', properties: {} }
            },
            'badge.equip': {
                name: 'badge.equip',
                description: '装备徽章 (徽章系统v4-装备指定徽章获得属性加成，最多装备3个，支持属性叠加)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        badgeId: { type: 'string', description: '徽章ID' }
                    },
                    required: ['badgeId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V185 (lines 44774-44839, 66 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V185 = {
            'achievement.list': {
                name: 'achievement.list',
                description: '获取成就列表 (成就系统v5-获取所有成就列表及解锁状态，按分类筛选，支持进度追踪)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: '成就分类: combat/cultivation/social/collection' }
                    }
                }
            },
            'achievement.view': {
                name: 'achievement.view',
                description: '查看成就详情 (成就系统v5-查看指定成就的详细信息、进度和奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.unlock': {
                name: 'achievement.unlock',
                description: '解锁成就 (成就系统v5-解锁成就(自动或手动)，触发奖励发放，记录解锁时间)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.reward': {
                name: 'achievement.reward',
                description: '领取成就奖励 (成就系统v5-领取已完成成就的奖励(灵石、声誉、特殊奖励))',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'badge.list': {
                name: 'badge.list',
                description: '获取徽章列表 (徽章系统v5-获取所有徽章列表及装备状态，按稀有度分级)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rarity: { type: 'string', description: '稀有度: common/rare/epic/legendary' }
                    }
                }
            },
            'badge.equip': {
                name: 'badge.equip',
                description: '装备徽章 (徽章系统v5-装备指定徽章获得属性加成，最多装备3个，支持属性叠加)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        badgeId: { type: 'string', description: '徽章ID' }
                    },
                    required: ['badgeId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V187 (lines 44842-44904, 63 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V187 = {
            'serendipity.list': {
                name: 'serendipity.list',
                description: '获取奇遇列表 (奇遇+事件系统v5-获取所有可用奇遇按类型/难度筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: '奇遇类型筛选: exploration/combat/cultivation/legendary' },
                        difficulty: { type: 'string', description: '难度筛选: easy/medium/hard/legendary' }
                    }
                }
            },
            'serendipity.start': {
                name: 'serendipity.start',
                description: '开始奇遇 (奇遇+事件系统v5-开始奇遇进入多选择事件流程)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serendipityId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['serendipityId']
                }
            },
            'serendipity.complete': {
                name: 'serendipity.complete',
                description: '完成奇遇 (奇遇+事件系统v5-根据选择的分支获得奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serendipityId: { type: 'string', description: '奇遇ID' },
                        choiceId: { type: 'string', description: '选择的分支ID' }
                    },
                    required: ['serendipityId', 'choiceId']
                }
            },
            'event.list': {
                name: 'event.list',
                description: '获取事件列表 (奇遇+事件系统v5-获取当前可用事件列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'event.join': {
                name: 'event.join',
                description: '参与事件 (奇遇+事件系统v5-参与事件消耗报名费或免费)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' }
                    },
                    required: ['eventId']
                }
            },
            'event.reward': {
                name: 'event.reward',
                description: '领取事件奖励 (奇遇+事件系统v5-根据名次获得奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' }
                    },
                    required: ['eventId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V188 (lines 44907-44967, 61 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V188 = {
            'quest.list': {
                name: 'quest.list',
                description: '获取悬赏列表 (悬赏+任务链系统v5-获取所有可接悬赏任务,按难度分级)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        difficulty: { type: 'number', description: '难度筛选: 1/2/3' }
                    }
                }
            },
            'quest.accept': {
                name: 'quest.accept',
                description: '接受悬赏任务 (悬赏+任务链系统v5-接受指定悬赏任务,加入activeQuests)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '悬赏任务ID' }
                    },
                    required: ['questId']
                }
            },
            'quest.complete': {
                name: 'quest.complete',
                description: '完成悬赏任务 (悬赏+任务链系统v5-完成悬赏任务,验证条件并发放奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '悬赏任务ID' }
                    },
                    required: ['questId']
                }
            },
            'chain.list': {
                name: 'chain.list',
                description: '获取任务链列表 (悬赏+任务链系统v5-获取所有任务链概览)',
                inputSchema: { type: 'object', properties: {} }
            },
            'chain.progress': {
                name: 'chain.progress',
                description: '查看任务链进度 (悬赏+任务链系统v5-查看指定任务链详细进度,每个步骤状态)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: '任务链ID' }
                    },
                    required: ['chainId']
                }
            },
            'chain.reward': {
                name: 'chain.reward',
                description: '领取任务链奖励 (悬赏+任务链系统v5-完成所有步骤后按阶段领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: '任务链ID' }
                    },
                    required: ['chainId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V189 (lines 44970-45025, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V189 = {
            'investment.list': {
                name: 'investment.list',
                description: '获取投资产品列表 (投资+月卡系统v6-获取所有可投资产品,按类型分级:灵石/功法/法宝)',
                inputSchema: { type: 'object', properties: {} }
            },
            'investment.buy': {
                name: 'investment.buy',
                description: '购买投资产品 (投资+月卡系统v6-购买投资产品,扣灵石并设置起息日)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' },
                        amount: { type: 'number', description: '投资金额(可选,默认使用产品默认价格)' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.profit': {
                name: 'investment.profit',
                description: '领取投资收益 (投资+月卡系统v6-领取每日投资收益,验证是否到账期)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.redeem': {
                name: 'investment.redeem',
                description: '赎回投资 (投资+月卡系统v6-赎回投资,验证是否到期,返还本金+收益)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' }
                    },
                    required: ['investmentId']
                }
            },
            'monthcard.status': {
                name: 'monthcard.status',
                description: '获取月卡状态 (投资+月卡系统v6-获取所有月卡状态,包括各种档次)',
                inputSchema: { type: 'object', properties: {} }
            },
            'monthcard.buy': {
                name: 'monthcard.buy',
                description: '购买月卡 (投资+月卡系统v6-购买月卡,激活后每日可领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        monthcardType: { type: 'string', description: '月卡类型: monthly/quarterly/annual (默认monthly)' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V190 (lines 45028-45086, 59 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V190 = {
            'redpack.list': {
                name: 'redpack.list',
                description: '获取红包列表 (红包系统v5-获取所有可领取红包列表,包括金额/有效期/剩余数量)',
                inputSchema: { type: 'object', properties: {} }
            },
            'redpack.receive': {
                name: 'redpack.receive',
                description: '领取红包 (红包系统v5-领取红包(先到先得),返回随机金额)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        redpackId: { type: 'string', description: '红包ID' }
                    },
                    required: ['redpackId']
                }
            },
            'redpack.send': {
                name: 'redpack.send',
                description: '发送红包 (红包系统v5-发送红包,消耗灵石,可设置红包数量)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', description: '红包总金额' },
                        count: { type: 'number', description: '红包数量(默认1)' }
                    },
                    required: ['amount']
                }
            },
            'social.list': {
                name: 'social.list',
                description: '获取社交列表 (社交系统v5-获取好友列表/黑名单/互动记录)',
                inputSchema: { type: 'object', properties: {} }
            },
            'social.interact': {
                name: 'social.interact',
                description: '进行社交互动 (社交系统v5-与好友进行社交互动:拜访/切磋/送礼/留言)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerId: { type: 'string', description: '玩家ID' },
                        type: { type: 'string', description: '互动类型: visit/spar/gift/message' }
                    },
                    required: ['playerId', 'type']
                }
            },
            'social.gift': {
                name: 'social.gift',
                description: '赠送社交礼物 (社交系统v5-向好友赠送社交礼物(灵石购买的社交礼物))',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerId: { type: 'string', description: '玩家ID' },
                        giftId: { type: 'string', description: '礼物ID' }
                    },
                    required: ['playerId', 'giftId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V200 (lines 45108-45165, 58 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V200 = {
            'redpack.list': {
                name: 'redpack.list',
                description: '获取红包列表 (红包系统v6-获取所有可领取红包列表，包括金额/有效期/剩余数量)',
                inputSchema: { type: 'object', properties: {} }
            },
            'redpack.send': {
                name: 'redpack.send',
                description: '发送红包 (红包系统v6-发送红包，消耗灵石，可设置金额/数量/留言)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', description: '红包总金额' },
                        count: { type: 'number', description: '红包数量(默认1)' },
                        message: { type: 'string', description: '红包留言(可选，最大50字)' }
                    },
                    required: ['amount']
                }
            },
            'redpack.receive': {
                name: 'redpack.receive',
                description: '领取红包 (红包系统v6-领取红包(先到先得)，返回随机金额)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        redpackId: { type: 'string', description: '红包ID' }
                    },
                    required: ['redpackId']
                }
            },
            'redpack.history': {
                name: 'redpack.history',
                description: '查看红包记录 (红包系统v6-查看红包收发记录，包括发送和领取历史)',
                inputSchema: { type: 'object', properties: {} }
            },
            'social.friends': {
                name: 'social.friends',
                description: '获取好友列表 (社交系统v6-获取好友列表，支持亲密度排序)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sortBy: { type: 'string', description: '排序方式: intimacy/time/name (默认intimacy)' }
                    }
                }
            },
            'social.interact': {
                name: 'social.interact',
                description: '执行社交互动 (社交系统v6-与好友执行社交互动：聊天/送礼/组队/拜访)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        friendId: { type: 'string', description: '好友ID' },
                        action: { type: 'string', description: '互动类型: chat/gift/team/visit' }
                    },
                    required: ['friendId', 'action']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V201 (lines 45193-45254, 62 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V201 = {
            'explore.list': {
                name: 'explore.list',
                description: '获取探险列表 (宠物探险v7-获取所有探险列表，支持状态筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', description: '筛选状态: active/completed/全部 (默认全部)' }
                    }
                }
            },
            'explore.start': {
                name: 'explore.start',
                description: '开始探险 (宠物探险v7-选择宠物和地点开始探险，自动计算时长)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: '宠物ID' },
                        location: { type: 'string', description: '地点ID' }
                    },
                    required: ['petId', 'location']
                }
            },
            'explore.settle': {
                name: 'explore.settle',
                description: '探险结算 (宠物探险v7-结算探险，发放发现物和奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' }
                    },
                    required: ['exploreId']
                }
            },
            'explore.speedup': {
                name: 'explore.speedup',
                description: '加速探险 (宠物探险v7-消耗灵石加速完成探险)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' }
                    },
                    required: ['exploreId']
                }
            },
            'dispatch.list': {
                name: 'dispatch.list',
                description: '获取派遣任务列表 (派遣系统v7-获取所有可执行派遣任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'dispatch.execute': {
                name: 'dispatch.execute',
                description: '执行派遣任务 (派遣系统v7-自动匹配宠物并执行派遣任务)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        dispatchId: { type: 'string', description: '派遣任务ID' }
                    },
                    required: ['dispatchId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V202 (lines 45281-45330, 50 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V202 = {
            'signin.list': {
                name: 'signin.list',
                description: '获取签到配置列表 (签到系统v7-获取签到配置列表，支持当月/累充奖励)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.checkin': {
                name: 'signin.checkin',
                description: '执行签到 (签到系统v7-执行签到，验证是否重复+更新连签天数)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.reward': {
                name: 'signin.reward',
                description: '领取签到奖励 (签到系统v7-领取签到奖励，验证是否可领)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        day: { type: 'number', description: '奖励天数(1-7)' }
                    },
                    required: ['day']
                }
            },
            'signin.makeup': {
                name: 'signin.makeup',
                description: '补签某日 (签到系统v7-补签，消耗补签卡，每期限制3次)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        day: { type: 'number', description: '补签日期' }
                    },
                    required: ['day']
                }
            },
            'welfare.list': {
                name: 'welfare.list',
                description: '获取福利列表 (福利系统v7-获取可领取福利列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利 (福利系统v7-领取福利，每日/每周/活动福利)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        welfareId: { type: 'string', description: '福利ID' }
                    },
                    required: ['welfareId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V203 (lines 45333-45396, 64 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V203 = {
            'achievement.list': {
                name: 'achievement.list',
                description: '获取成就列表 (成就系统v7-获取成就列表，支持分类筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: '分类筛选(all/beginner/realm/resource/battle/quest/activity)' }
                    }
                }
            },
            'achievement.earn': {
                name: 'achievement.earn',
                description: '领取成就奖励 (成就系统v7-领取成就奖励，验证条件+发放奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.reward': {
                name: 'achievement.reward',
                description: '查看成就奖励详情 (成就系统v7-查看成就奖励详情)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'badge.list': {
                name: 'badge.list',
                description: '获取徽章列表 (徽章系统v7-获取徽章列表)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'badge.equip': {
                name: 'badge.equip',
                description: '装备徽章 (徽章系统v7-装备徽章，最多装备3个)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        badgeId: { type: 'string', description: '徽章ID' }
                    },
                    required: ['badgeId']
                }
            },
            'badge.show': {
                name: 'badge.show',
                description: '展示徽章 (徽章系统v7-战斗时显示徽章)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        badgeId: { type: 'string', description: '徽章ID' }
                    },
                    required: ['badgeId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V186 (lines 45423-45478, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V186 = {
            'rank.list': {
                name: 'rank.list',
                description: '获取排行榜列表 (排行榜+竞技系统v5-获取所有排行榜类型)',
                inputSchema: { type: 'object', properties: {} }
            },
            'rank.view': {
                name: 'rank.view',
                description: '查看排行榜详情 (排行榜+竞技系统v5-查看指定排行榜详情(top100+玩家排名))',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rankType: { type: 'string', description: '排行榜类型: cultivation/arena/wealth/social' }
                    },
                    required: ['rankType']
                }
            },
            'rank.challenge': {
                name: 'rank.challenge',
                description: '挑战排行榜 (排行榜+竞技系统v5-挑战排行榜，消耗挑战次数，获胜获得排名上升)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        targetId: { type: 'string', description: '目标玩家ID' }
                    },
                    required: ['targetId']
                }
            },
            'arena.match': {
                name: 'arena.match',
                description: '开始匹配 (排行榜+竞技系统v5-开始匹配对手进行竞技(消耗灵石或免费次数))',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.fight': {
                name: 'arena.fight',
                description: '执行战斗 (排行榜+竞技系统v5-执行战斗(基于属性计算胜负))',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opponentId: { type: 'string', description: '对手ID' }
                    },
                    required: ['opponentId']
                }
            },
            'arena.reward': {
                name: 'arena.reward',
                description: '领取竞技奖励 (排行榜+竞技系统v5-领取赛季奖励(按排名领取))',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rewardType: { type: 'string', description: '奖励类型: weekly/monthly/season' }
                    },
                    required: ['rewardType']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V176 (lines 45481-45537, 57 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V176 = {
            'rank.list': {
                name: 'rank.list',
                description: '获取排行榜列表 (排行榜+竞技系统v4-获取所有类型排行榜概览)',
                inputSchema: { type: 'object', properties: {} }
            },
            'rank.view': {
                name: 'rank.view',
                description: '查看排行详情 (排行榜+竞技系统v4-查看指定排行详情及玩家排名)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rankType: { type: 'string', description: '排行榜类型: cultivation/arena/wealth' }
                    },
                    required: ['rankType']
                }
            },
            'rank.reward': {
                name: 'rank.reward',
                description: '领取排行奖励 (排行榜+竞技系统v4-领取指定周期排行榜奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rankType: { type: 'string', description: '排行榜类型: cultivation/arena/wealth' },
                        period: { type: 'string', description: '周期: weekly/monthly/all' }
                    },
                    required: ['rankType', 'period']
                }
            },
            'arena.match': {
                name: 'arena.match',
                description: '开始匹配 (排行榜+竞技系统v4-开始匹配对手进行竞技)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.fight': {
                name: 'arena.fight',
                description: '发起战斗 (排行榜+竞技系统v4-发起战斗并自动结算)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fightId: { type: 'string', description: '战斗ID' }
                    },
                    required: ['fightId']
                }
            },
            'arena.reward': {
                name: 'arena.reward',
                description: '领取竞技奖励 (排行榜+竞技系统v4-领取段位奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rewardType: { type: 'string', description: '奖励类型: weekly/monthly/season' }
                    },
                    required: ['rewardType']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V177 (lines 45540-45596, 57 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V177 = {
            'serendipity.list': {
                name: 'serendipity.list',
                description: '获取奇遇列表 (奇遇+事件系统v4-获取所有可触发奇遇)',
                inputSchema: { type: 'object', properties: {} }
            },
            'serendipity.start': {
                name: 'serendipity.start',
                description: '开始奇遇 (奇遇+事件系统v4-开始指定奇遇)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serendipityId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['serendipityId']
                }
            },
            'serendipity.complete': {
                name: 'serendipity.complete',
                description: '完成奇遇 (奇遇+事件系统v4-完成进行中的奇遇)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serendipityId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['serendipityId']
                }
            },
            'event.list': {
                name: 'event.list',
                description: '获取事件列表 (奇遇+事件系统v4-获取所有进行中事件)',
                inputSchema: { type: 'object', properties: {} }
            },
            'event.join': {
                name: 'event.join',
                description: '参与事件 (奇遇+事件系统v4-参与指定事件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' }
                    },
                    required: ['eventId']
                }
            },
            'event.reward': {
                name: 'event.reward',
                description: '领取事件奖励 (奇遇+事件系统v4-领取事件奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' },
                        rewardType: { type: 'string', description: '奖励类型: ranking/participation' }
                    },
                    required: ['eventId', 'rewardType']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V178 (lines 45599-45654, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V178 = {
            'quest.list': {
                name: 'quest.list',
                description: '获取悬赏列表 (悬赏+任务链系统v4-获取所有可接悬赏任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'quest.accept': {
                name: 'quest.accept',
                description: '接受悬赏任务 (悬赏+任务链系统v4-接受指定悬赏任务)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '悬赏任务ID' }
                    },
                    required: ['questId']
                }
            },
            'quest.complete': {
                name: 'quest.complete',
                description: '完成悬赏任务 (悬赏+任务链系统v4-完成指定悬赏任务)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '悬赏任务ID' }
                    },
                    required: ['questId']
                }
            },
            'chain.list': {
                name: 'chain.list',
                description: '获取任务链列表 (悬赏+任务链系统v4-获取所有任务链)',
                inputSchema: { type: 'object', properties: {} }
            },
            'chain.progress': {
                name: 'chain.progress',
                description: '查看任务链进度 (悬赏+任务链系统v4-查看指定任务链详细进度)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: '任务链ID' }
                    },
                    required: ['chainId']
                }
            },
            'chain.claim': {
                name: 'chain.claim',
                description: '领取任务链奖励 (悬赏+任务链系统v4-领取指定任务链完成奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: '任务链ID' }
                    },
                    required: ['chainId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V179 (lines 45657-45712, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V179 = {
            'investment.list': {
                name: 'investment.list',
                description: '获取投资项目列表 (投资系统v5-获取所有投资项目，含分类：灵石/功法/法宝)',
                inputSchema: { type: 'object', properties: {} }
            },
            'investment.buy': {
                name: 'investment.buy',
                description: '购买投资份额 (投资系统v5-购买指定投资产品，支持多品类)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' },
                        amount: { type: 'number', description: '购买金额（默认最低投资额）' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.profit': {
                name: 'investment.profit',
                description: '领取投资收益 (投资系统v5-领取每日结算收益)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.redeem': {
                name: 'investment.redeem',
                description: '赎回投资本金 (投资系统v5-赎回投资，提前赎回可能有惩罚)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' }
                    },
                    required: ['investmentId']
                }
            },
            'monthcard.status': {
                name: 'monthcard.status',
                description: '获取月卡状态 (月卡系统v5-查看月卡状态、剩余天数和权益)',
                inputSchema: { type: 'object', properties: {} }
            },
            'monthcard.buy': {
                name: 'monthcard.buy',
                description: '购买月卡 (月卡系统v5-购买月卡，支持月卡/季卡/年卡)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        monthcardType: { type: 'string', description: '月卡类型: monthly/quarterly/annual' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V180 (lines 45765-45821, 57 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V180 = {
            'redpacket.list': {
                name: 'redpacket.list',
                description: '获取红包列表 (红包系统v4-获取所有可领取红包列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'redpacket.send': {
                name: 'redpacket.send',
                description: '发送红包 (红包系统v4-发送红包，消耗灵石，可设置金额和数量)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        redpacketId: { type: 'string', description: '红包ID' },
                        amount: { type: 'number', description: '红包总金额' }
                    },
                    required: ['redpacketId']
                }
            },
            'redpacket.receive': {
                name: 'redpacket.receive',
                description: '领取红包 (红包系统v4-随机分配金额)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        redpacketId: { type: 'string', description: '红包ID' }
                    },
                    required: ['redpacketId']
                }
            },
            'redpacket.redeem': {
                name: 'redpacket.redeem',
                description: '兑换红包 (红包系统v4-兑换红包，需达到最低金额)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        redpacketId: { type: 'string', description: '红包ID' }
                    },
                    required: ['redpacketId']
                }
            },
            'social.list': {
                name: 'social.list',
                description: '获取社交列表 (社交系统v4-获取好友列表和社交状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'social.invite': {
                name: 'social.invite',
                description: '邀请好友 (社交系统v4-邀请玩家成为好友)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerName: { type: 'string', description: '玩家名称' }
                    },
                    required: ['playerName']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V181 (lines 45854-45910, 57 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V181 = {
            'pet.list': {
                name: 'pet.list',
                description: '获取宠物列表 (宠物系统v5-获取所有宠物及进化材料)',
                inputSchema: { type: 'object', properties: {} }
            },
            'pet.equip': {
                name: 'pet.equip',
                description: '装备宠物 (宠物系统v5-装备宠物到角色，最多3个槽位)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['petId']
                }
            },
            'pet.evolve': {
                name: 'pet.evolve',
                description: '宠物进化 (宠物系统v5-进化宠物提升属性，消耗材料和灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['petId']
                }
            },
            'explore.list': {
                name: 'explore.list',
                description: '获取探险列表 (探险系统v5-获取所有探险区域)',
                inputSchema: { type: 'object', properties: {} }
            },
            'explore.start': {
                name: 'explore.start',
                description: '开始探险 (探险系统v5-开始探险，需派宠物支援)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' },
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['exploreId', 'petId']
                }
            },
            'explore.complete': {
                name: 'explore.complete',
                description: '完成探险 (探险系统v5-完成探险并领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' }
                    },
                    required: ['exploreId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V191 (lines 45929-45984, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V191 = {
            'pet.list': {
                name: 'pet.list',
                description: '获取宠物列表 (宠物系统v6-获取所有宠物及进化材料)',
                inputSchema: { type: 'object', properties: {} }
            },
            'pet.equip': {
                name: 'pet.equip',
                description: '装备宠物 (宠物系统v6-装备宠物到角色，最多5个槽位)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['petId']
                }
            },
            'pet.evolve': {
                name: 'pet.evolve',
                description: '宠物进化 (宠物系统v6-进化宠物提升属性，消耗材料和灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['petId']
                }
            },
            'explore.list': {
                name: 'explore.list',
                description: '获取派遣任务列表 (派遣系统v6-获取所有可派遣区域)',
                inputSchema: { type: 'object', properties: {} }
            },
            'explore.start': {
                name: 'explore.start',
                description: '开始派遣任务 (派遣系统v6-开始派遣任务，消耗时间和指定宠物)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '派遣区域ID' }
                    },
                    required: ['exploreId']
                }
            },
            'explore.complete': {
                name: 'explore.complete',
                description: '完成派遣任务 (派遣系统v6-完成派遣任务并领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '派遣任务ID' }
                    },
                    required: ['exploreId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V182 (lines 45987-46041, 55 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V182 = {
            'codex.list': {
                name: 'codex.list',
                description: '获取图鉴列表 (图鉴系统v5-获取所有图鉴分类及解锁进度)',
                inputSchema: { type: 'object', properties: {} }
            },
            'codex.view': {
                name: 'codex.view',
                description: '查看图鉴详情 (图鉴系统v5-查看指定图鉴详情)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        codexId: { type: 'string', description: '图鉴ID' }
                    },
                    required: ['codexId']
                }
            },
            'codex.unlock': {
                name: 'codex.unlock',
                description: '解锁图鉴 (图鉴系统v5-解锁图鉴条目，消耗灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        codexId: { type: 'string', description: '图鉴ID' }
                    },
                    required: ['codexId']
                }
            },
            'collection.stats': {
                name: 'collection.stats',
                description: '获取收集统计 (收集系统v5-获取收集统计和完成率)',
                inputSchema: { type: 'object', properties: {} }
            },
            'collection.reward': {
                name: 'collection.reward',
                description: '领取收集奖励 (收集系统v5-领取达成指定完成率的奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rewardType: { type: 'string', description: '奖励类型 (bronze/silver/gold)' }
                    },
                    required: ['rewardType']
                }
            },
            'collection.reset': {
                name: 'collection.reset',
                description: '重置收集进度 (收集系统v5-重置收集进度，可用于周期性重置的收集活动)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        collectionType: { type: 'string', description: '收集类型 (可选，默认重置所有)' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V192 (lines 46044-46105, 62 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V192 = {
            'codex.list': {
                name: 'codex.list',
                description: '获取图鉴列表 (图鉴系统v6-获取所有图鉴条目，支持类型/稀有度筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: '图鉴类型筛选 (可选)' },
                        rarity: { type: 'string', description: '稀有度筛选: common|rare|epic|legend (可选)' },
                        page: { type: 'number', description: '页码 (默认1)' }
                    }
                }
            },
            'codex.view': {
                name: 'codex.view',
                description: '查看图鉴详情 (图鉴系统v6-查看指定图鉴条目的完整信息)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        codexId: { type: 'string', description: '图鉴ID' }
                    },
                    required: ['codexId']
                }
            },
            'codex.unlock': {
                name: 'codex.unlock',
                description: '解锁图鉴 (图鉴系统v6-解锁图鉴条目，消耗灵石或达成条件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        codexId: { type: 'string', description: '图鉴ID' }
                    },
                    required: ['codexId']
                }
            },
            'collection.stats': {
                name: 'collection.stats',
                description: '获取收集统计 (收集系统v6-获取收集统计和已领取奖励)',
                inputSchema: { type: 'object', properties: {} }
            },
            'collection.reward': {
                name: 'collection.reward',
                description: '领取收集奖励 (收集系统v6-达到指定完成度领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        collectionId: { type: 'string', description: '收集奖励ID' }
                    },
                    required: ['collectionId']
                }
            },
            'collection.reset': {
                name: 'collection.reset',
                description: '重置收集进度 (收集系统v6-重置收集进度，返还部分资源)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        collectionType: { type: 'string', description: '收集类型 (可选，默认重置所有)' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V193 (lines 46108-46176, 69 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V193 = {
            'mail.list': {
                name: 'mail.list',
                description: '获取邮件列表 (邮件系统v6-获取收件箱/已发送/草稿/系统邮件列表，支持folder筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        folder: { type: 'string', description: '邮件夹类型: inbox|sent|draft|system (默认inbox)' }
                    }
                }
            },
            'mail.send': {
                name: 'mail.send',
                description: '发送邮件 (邮件系统v6-发送邮件，可附加灵石或道具，支持批量发送)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        recipientId: { type: 'string', description: '收件人ID' },
                        subject: { type: 'string', description: '邮件标题' },
                        content: { type: 'string', description: '邮件内容' },
                        attachment: { type: 'object', description: '附件 (可选): {type: spirit_stones|item, itemId?: string, quantity?: number}' }
                    },
                    required: ['recipientId', 'subject', 'content']
                }
            },
            'mail.read': {
                name: 'mail.read',
                description: '读取邮件 (邮件系统v6-读取邮件内容并标记为已读，自动回复功能)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mailId: { type: 'string', description: '邮件ID' }
                    },
                    required: ['mailId']
                }
            },
            'mail.delete': {
                name: 'mail.delete',
                description: '删除邮件 (邮件系统v6-删除邮件，支持批量删除和垃圾箱)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mailId: { type: 'string', description: '邮件ID (单个删除)' },
                        mailIds: { type: 'array', items: { type: 'string' }, description: '邮件ID数组 (批量删除)' }
                    }
                }
            },
            'announce.list': {
                name: 'announce.list',
                description: '获取公告列表 (公告系统v6-获取公告列表，支持优先级过滤)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        priority: { type: 'string', description: '优先级过滤: high|medium|low (可选)' }
                    }
                }
            },
            'announce.view': {
                name: 'announce.view',
                description: '查看公告详情 (公告系统v6-查看公告详情，自动标记为已读，显示时效状态)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        announceId: { type: 'string', description: '公告ID' }
                    },
                    required: ['announceId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V195 (lines 46179-46243, 65 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V195 = {
            'achievement.list': {
                name: 'achievement.list',
                description: '获取成就列表 (成就系统v6-获取成就列表，支持分类筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: '分类筛选: all|beginner|realm|resource|battle|quest|activity (默认all)' }
                    }
                }
            },
            'achievement.view': {
                name: 'achievement.view',
                description: '查看成就详情 (成就系统v6-查看成就详情，显示进度和完成状态)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.unlock': {
                name: 'achievement.unlock',
                description: '解锁成就 (成就系统v6-解锁成就，支持自动解锁和手动解锁)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID (可选，不填则自动检查所有成就)' }
                    }
                }
            },
            'achievement.reward': {
                name: 'achievement.reward',
                description: '领取成就奖励 (成就系统v6-领取成就奖励，需先解锁成就)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'badge.list': {
                name: 'badge.list',
                description: '获取徽章列表 (徽章系统v6-获取徽章列表，显示稀有度和获取状态)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: '筛选: all|obtained|equipped (默认all)' }
                    }
                }
            },
            'badge.equip': {
                name: 'badge.equip',
                description: '装备徽章 (徽章系统v6-装备徽章，最多装备3个)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        badgeId: { type: 'string', description: '徽章ID' }
                    },
                    required: ['badgeId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V194 (lines 46246-46289, 44 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V194 = {
            'signin.list': {
                name: 'signin.list',
                description: '获取签到列表 (签到系统v6-获取签到历史和统计)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.checkin': {
                name: 'signin.checkin',
                description: '执行签到 (签到系统v6-每日签到一次，返回连击奖励)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.makeup': {
                name: 'signin.makeup',
                description: '补签漏签日期 (签到系统v6-消耗道具补回漏签日期)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        date: { type: 'string', description: '补签日期 (YYYY-MM-DD格式)' }
                    },
                    required: ['date']
                }
            },
            'welfare.list': {
                name: 'welfare.list',
                description: '获取福利列表 (福利系统v6-获取可领取福利列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利奖励 (福利系统v6-领取福利，需满足条件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        welfareId: { type: 'string', description: '福利ID' }
                    },
                    required: ['welfareId']
                }
            },
            'welfare.status': {
                name: 'welfare.status',
                description: '获取福利状态 (福利系统v6-获取福利总体状态)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V183 (lines 46292-46360, 69 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V183 = {
            'mail.list': {
                name: 'mail.list',
                description: '获取邮件列表 (邮件系统v5-获取收件箱/已发送/草稿/系统邮件列表)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        folder: { type: 'string', description: '邮件夹类型: inbox|sent|draft|system (默认inbox)' }
                    }
                }
            },
            'mail.send': {
                name: 'mail.send',
                description: '发送邮件 (邮件系统v5-发送邮件，可附加灵石或道具)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        recipientId: { type: 'string', description: '收件人ID' },
                        subject: { type: 'string', description: '邮件标题' },
                        content: { type: 'string', description: '邮件内容' },
                        attachment: { type: 'object', description: '附件 (可选): {type: spirit_stones|item, itemId?: string, quantity?: number}' }
                    },
                    required: ['recipientId', 'subject', 'content']
                }
            },
            'mail.read': {
                name: 'mail.read',
                description: '读取邮件 (邮件系统v5-读取邮件内容并标记为已读)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mailId: { type: 'string', description: '邮件ID' }
                    },
                    required: ['mailId']
                }
            },
            'mail.delete': {
                name: 'mail.delete',
                description: '删除邮件 (邮件系统v5-删除邮件，支持批量删除)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mailId: { type: 'string', description: '邮件ID (单个删除)' },
                        mailIds: { type: 'array', items: { type: 'string' }, description: '邮件ID数组 (批量删除)' }
                    }
                }
            },
            'announce.list': {
                name: 'announce.list',
                description: '获取公告列表 (公告系统v5-获取公告列表，支持优先级过滤)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        priority: { type: 'string', description: '优先级过滤: high|medium|low (可选)' }
                    }
                }
            },
            'announce.view': {
                name: 'announce.view',
                description: '查看公告详情 (公告系统v5-查看公告详情，自动标记为已读)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        announceId: { type: 'string', description: '公告ID' }
                    },
                    required: ['announceId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V148 (lines 46363-46418, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V148 = {
            'serendipity.list': {
                name: 'serendipity.list',
                description: '获取奇遇区域 (奇遇系统-列出所有奇遇区域)',
                inputSchema: { type: 'object', properties: {} }
            },
            'serendipity.start': {
                name: 'serendipity.start',
                description: '开始奇遇 (奇遇系统-在指定区域开始奇遇)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        areaId: { type: 'string', description: '奇遇区域ID' }
                    },
                    required: ['areaId']
                }
            },
            'serendipity.complete': {
                name: 'serendipity.complete',
                description: '完成奇遇 (奇遇系统-完成进行中的奇遇并获得奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serendipityId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['serendipityId']
                }
            },
            'event.list': {
                name: 'event.list',
                description: '获取当前事件 (事件系统-列出所有进行中的事件)',
                inputSchema: { type: 'object', properties: {} }
            },
            'event.join': {
                name: 'event.join',
                description: '参与事件 (事件系统-参与指定事件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' }
                    },
                    required: ['eventId']
                }
            },
            'event.reward': {
                name: 'event.reward',
                description: '领取事件奖励 (事件系统-领取完成事件的奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' }
                    },
                    required: ['eventId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V196 (lines 46421-46469, 49 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V196 = {
            'rank.list': {
                name: 'rank.list',
                description: '获取排行榜列表 (排行榜+竞技系统v6-获取所有排行榜概览)',
                inputSchema: { type: 'object', properties: {} }
            },
            'rank.view': {
                name: 'rank.view',
                description: '查看指定排行详情 (排行榜+竞技系统v6-查看指定排行榜详细信息)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rankType: { type: 'string', description: '排行榜类型: cultivation/arena/wealth/achievement/wins' }
                    },
                    required: ['rankType']
                }
            },
            'rank.challenge': {
                name: 'rank.challenge',
                description: '挑战排行对手 (排行榜+竞技系统v6-挑战排行榜对手，消耗精力，获胜获得积分)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opponentId: { type: 'string', description: '对手ID' }
                    },
                    required: ['opponentId']
                }
            },
            'arena.match': {
                name: 'arena.match',
                description: '开始竞技匹配 (排行榜+竞技系统v6-开始竞技匹配，消耗入场费)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.fight': {
                name: 'arena.fight',
                description: '执行竞技战斗 (排行榜+竞技系统v6-执行竞技战斗，自动匹配或手动选择)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        arenaId: { type: 'string', description: '竞技ID (可选，不填则使用当前匹配)' }
                    }
                }
            },
            'arena.reward': {
                name: 'arena.reward',
                description: '领取竞技奖励 (排行榜+竞技系统v6-根据排名发放奖励)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V197 (lines 46472-46534, 63 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V197 = {
            'encounter.list': {
                name: 'encounter.list',
                description: '获取奇遇列表 (奇遇+事件系统v6-获取所有奇遇，可按类型/稀有度筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: '奇遇类型: adventure/treasure/cultivation/npc (可选)' },
                        rarity: { type: 'string', description: '稀有度: common/rare/epic/legendary (可选)' }
                    }
                }
            },
            'encounter.trigger': {
                name: 'encounter.trigger',
                description: '触发奇遇事件 (奇遇+事件系统v6-触发奇遇事件，消耗精力，触发随机事件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        encounterId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['encounterId']
                }
            },
            'encounter.complete': {
                name: 'encounter.complete',
                description: '完成奇遇获得奖励 (奇遇+事件系统v6-完成奇遇，根据选项发放奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        encounterId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['encounterId']
                }
            },
            'event.list': {
                name: 'event.list',
                description: '获取事件列表 (奇遇+事件系统v6-获取所有事件)',
                inputSchema: { type: 'object', properties: {} }
            },
            'event.select': {
                name: 'event.select',
                description: '选择事件选项 (奇遇+事件系统v6-选择事件选项)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' },
                        optionId: { type: 'string', description: '选项ID' }
                    },
                    required: ['eventId', 'optionId']
                }
            },
            'event.resolve': {
                name: 'event.resolve',
                description: '事件结果结算 (奇遇+事件系统v6-结算事件结果，发放奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: '事件ID' }
                    },
                    required: ['eventId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V198 (lines 46537-46598, 62 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V198 = {
            'quest.list': {
                name: 'quest.list',
                description: '获取悬赏列表 (悬赏+任务链系统v6-获取可接悬赏，支持难度筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        difficulty: { type: 'number', description: '难度筛选 (1-5可选)' }
                    }
                }
            },
            'quest.accept': {
                name: 'quest.accept',
                description: '接受悬赏任务 (悬赏+任务链系统v6-接受悬赏任务，设置截止时间)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '悬赏任务ID' }
                    },
                    required: ['questId']
                }
            },
            'quest.submit': {
                name: 'quest.submit',
                description: '提交完成悬赏 (悬赏+任务链系统v6-提交完成悬赏，验证条件并发放奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '悬赏任务ID' }
                    },
                    required: ['questId']
                }
            },
            'quest.refresh': {
                name: 'quest.refresh',
                description: '刷新悬赏列表 (悬赏+任务链系统v6-消耗灵石刷新悬赏列表)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'chain.list': {
                name: 'chain.list',
                description: '获取任务链列表 (悬赏+任务链系统v6-获取所有任务链)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'chain.execute': {
                name: 'chain.execute',
                description: '执行任务链步骤 (悬赏+任务链系统v6-执行任务链中的步骤，更新进度)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: '任务链ID' },
                        stepId: { type: 'string', description: '步骤ID' }
                    },
                    required: ['chainId', 'stepId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V199 (lines 46616-46676, 61 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V199 = {
            'investment.list': {
                name: 'investment.list',
                description: '获取投资项目列表 (投资系统v7-获取所有投资项目，支持风险等级筛选)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        riskLevel: { type: 'number', description: '风险等级筛选 (1-4可选)' }
                    }
                }
            },
            'investment.buy': {
                name: 'investment.buy',
                description: '购买投资份额 (投资系统v7-购买投资份额，验证金额+更新份额)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' },
                        shares: { type: 'number', description: '购买份额数' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.profit': {
                name: 'investment.profit',
                description: '领取投资收益 (投资系统v7-按年化计算领取投资收益)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.redeem': {
                name: 'investment.redeem',
                description: '赎回投资本金 (投资系统v7-验证锁定期后赎回本金)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' }
                    },
                    required: ['investmentId']
                }
            },
            'monthcard.status': {
                name: 'monthcard.status',
                description: '获取月卡状态 (月卡系统v7-获取月卡状态，支持多种月卡)',
                inputSchema: { type: 'object', properties: {} }
            },
            'monthcard.buy': {
                name: 'monthcard.buy',
                description: '购买月卡 (月卡系统v7-购买月卡，支持月/季/年)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        monthcardType: { type: 'string', description: '月卡类型：monthly/quarterly/annual' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V207 (lines 46695-46744, 50 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V207 = {
            'investment.list': {
                name: 'investment.list',
                description: '获取投资项目列表 (投资系统v8-获取所有可投资项目)',
                inputSchema: { type: 'object', properties: {} }
            },
            'investment.buy': {
                name: 'investment.buy',
                description: '购买投资项目 (投资系统v8-购买投资，消耗灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资项目ID' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.profit': {
                name: 'investment.profit',
                description: '领取投资收益 (投资系统v8-领取每日投资收益)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资项目ID' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.redeem': {
                name: 'investment.redeem',
                description: '赎回投资 (投资系统v8-赎回投资，返回本金+收益)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资项目ID' }
                    },
                    required: ['investmentId']
                }
            },
            'monthcard.status': {
                name: 'monthcard.status',
                description: '获取月卡状态 (月卡系统v8-获取月卡状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'monthcard.buy': {
                name: 'monthcard.buy',
                description: '购买月卡 (月卡系统v8-购买30天月卡，每日100灵石)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V208 (lines 46747-46798, 52 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V208 = {
            'redpack.list': {
                name: 'redpack.list',
                description: '获取红包列表 (红包系统v7-获取可抢红包列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'redpack.send': {
                name: 'redpack.send',
                description: '发送红包 (红包系统v7-发送红包，消耗灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', description: '红包总金额(灵石)' },
                        type: { type: 'string', description: '红包类型: random/fixed' }
                    },
                    required: ['amount', 'type']
                }
            },
            'redpack.receive': {
                name: 'redpack.receive',
                description: '领取红包 (红包系统v7-领取红包，随机分配金额)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        redpackId: { type: 'string', description: '红包ID' }
                    },
                    required: ['redpackId']
                }
            },
            'redpack.history': {
                name: 'redpack.history',
                description: '获取红包记录 (红包系统v7-获取收发记录)',
                inputSchema: { type: 'object', properties: {} }
            },
            'social.friends': {
                name: 'social.friends',
                description: '获取好友列表 (社交系统v7-获取好友列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'social.interact': {
                name: 'social.interact',
                description: '好友互动 (社交系统v7-送礼/聊天/切磋，提升亲密度)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        friendId: { type: 'string', description: '好友ID' },
                        action: { type: 'string', description: '互动类型: gift/chat/spar' }
                    },
                    required: ['friendId', 'action']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V209 (lines 46801-46856, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V209 = {
            'explore.list': {
                name: 'explore.list',
                description: '获取探险列表 (宠物探险v8-获取探险列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'explore.start': {
                name: 'explore.start',
                description: '开始探险 (宠物探险v8-开始探险，消耗灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' }
                    },
                    required: ['exploreId']
                }
            },
            'explore.settle': {
                name: 'explore.settle',
                description: '结算探险 (宠物探险v8-结算探险，返回奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' }
                    },
                    required: ['exploreId']
                }
            },
            'explore.speedup': {
                name: 'explore.speedup',
                description: '加速探险 (宠物探险v8-加速探险，消耗加速卡)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        exploreId: { type: 'string', description: '探险ID' }
                    },
                    required: ['exploreId']
                }
            },
            'dispatch.list': {
                name: 'dispatch.list',
                description: '获取派遣列表 (派遣系统v8-获取派遣任务列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'dispatch.execute': {
                name: 'dispatch.execute',
                description: '执行派遣 (派遣系统v8-执行派遣任务)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        dispatchId: { type: 'string', description: '派遣任务ID' }
                    },
                    required: ['dispatchId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V147 (lines 46859-46890, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V147 = {
            'rank.list': {
                name: 'rank.list',
                description: '获取排行榜 (排行榜系统-列出各境界排行榜)',
                inputSchema: { type: 'object', properties: {} }
            },
            'rank.view': {
                name: 'rank.view',
                description: '查看排行详情 (排行榜系统-查看指定境界排行详情)',
                inputSchema: { type: 'object', properties: { rankType: { type: 'string', description: '排行榜类型：realm/power/level' } }, required: ['rankType'] }
            },
            'rank.reward': {
                name: 'rank.reward',
                description: '领取排行奖励 (排行榜系统-领取上周排行奖励)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.match': {
                name: 'arena.match',
                description: '开始匹配 (竞技系统-开始匹配对手)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.fight': {
                name: 'arena.fight',
                description: '执行战斗 (竞技系统-执行战斗)',
                inputSchema: { type: 'object', properties: { matchId: { type: 'string', description: '匹配ID' } }, required: ['matchId'] }
            },
            'arena.reward': {
                name: 'arena.reward',
                description: '领取竞技奖励 (竞技系统-领取每周竞技奖励)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V142 (lines 46893-46924, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V142 = {
            'signin.list': {
                name: 'signin.list',
                description: '获取签到日历 (签到系统-列出本月签到状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.checkin': {
                name: 'signin.checkin',
                description: '执行签到 (签到系统-执行每日签到)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.reward': {
                name: 'signin.reward',
                description: '领取连续签到奖励 (签到系统-领取连续签到奖励)',
                inputSchema: { type: 'object', properties: { dayCount: { type: 'number', description: '连续签到天数要求' } }, required: ['dayCount'] }
            },
            'signin.makeup': {
                name: 'signin.makeup',
                description: '补签漏签日期 (签到系统-补签指定日期，消耗灵石)',
                inputSchema: { type: 'object', properties: { date: { type: 'string', description: '补签日期 YYYY-MM-DD' } }, required: ['date'] }
            },
            'welfare.list': {
                name: 'welfare.list',
                description: '获取福利列表 (福利系统-列出可用福利)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利奖励 (福利系统-领取指定福利奖励)',
                inputSchema: { type: 'object', properties: { welfareId: { type: 'string', description: '福利ID' } }, required: ['welfareId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V123 (lines 46927-46934, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V123 = {
            'vote.list': { name: 'vote.list', description: '获取投票列表', inputSchema: { type: 'object', properties: {} } },
            'vote.create': { name: 'vote.create', description: '创建投票', inputSchema: { type: 'object', properties: { title: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, duration: { type: 'number' } }, required: ['title', 'options'] } },
            'vote.join': { name: 'vote.join', description: '参与投票', inputSchema: { type: 'object', properties: { voteId: { type: 'string' }, optionIndex: { type: 'number' } }, required: ['voteId', 'optionIndex'] } },
            'survey.list': { name: 'survey.list', description: '获取问卷列表', inputSchema: { type: 'object', properties: {} } },
            'survey.answer': { name: 'survey.answer', description: '提交问卷答案', inputSchema: { type: 'object', properties: { surveyId: { type: 'string' }, answers: { type: 'array' } }, required: ['surveyId', 'answers'] } },
            'survey.complete': { name: 'survey.complete', description: '完成问卷领取奖励', inputSchema: { type: 'object', properties: { surveyId: { type: 'string' } }, required: ['surveyId'] } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V114 (lines 46952-47017, 66 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V114 = {
            'quest.list': {
                name: 'quest.list',
                description: '获取可接任务列表 (仙界任务系统-列表)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: '筛选条件 (available/active/completed)', default: 'available' }
                    }
                }
            },
            'quest.accept': {
                name: 'quest.accept',
                description: '接受任务 (仙界任务系统-接受, 从available移到active)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '任务ID' }
                    },
                    required: ['questId']
                }
            },
            'quest.submit': {
                name: 'quest.submit',
                description: '提交已完成任务 (仙界任务系统-提交, 从active移到completed，发放奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: '任务ID' }
                    },
                    required: ['questId']
                }
            },
            'achievement.query': {
                name: 'achievement.query',
                description: '查询玩家成就 (成就系统-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: '筛选条件 (all/unlocked/locked)', default: 'all' }
                    }
                }
            },
            'achievement.unlock': {
                name: 'achievement.unlock',
                description: '解锁成就 (成就系统-解锁, 需满足条件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'achievement.reward': {
                name: 'achievement.reward',
                description: '领取成就奖励 (成就系统-领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            }
        };
