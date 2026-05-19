// domains/shared/constants/achievement.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Achievement Domain Constants
// ============================================================================

export const ACHIEVEMENTS = [
            // === 修炼类 (cultivation) ===
            {
                id: 'tribulation_master',
                name: '渡劫宗师',
                desc: '渡过10次天劫',
                category: 'cultivation',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'tribulationsCompleted', value: 10 },
                reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.05 },
                title: '渡劫宗师'
            },
            {
                id: 'cultivation_path',
                name: '修炼之路',
                desc: '累计修炼1000次',
                category: 'cultivation',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 100, reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.02 } },
                    { value: 500, reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.03 } },
                    { value: 1000, reward: { type: 'title', title: '修炼狂人' } }
                ]
            },
            {
                id: 'serendipity_finder',
                name: '天选之人',
                desc: '触发20次奇遇',
                category: 'cultivation',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'serendipitiesEncountered', value: 20 },
                reward: { type: 'attribute', target: 'serendipityRate', bonus: 0.05 },
                title: '天选之人'
            },
            {
                id: 'realm_ascension',
                name: '境界突破',
                desc: '突破到更高境界',
                category: 'cultivation',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 2, reward: { type: 'attribute', target: 'cultivationBase', bonus: 0.05 } },
                    { value: 4, reward: { type: 'attribute', target: 'cultivationBase', bonus: 0.10 } },
                    { value: 6, reward: { type: 'frame', item: '头像框·筑基' } }
                ]
            },
            {
                id: 'spirit_energy_master',
                name: '灵气大师',
                desc: '灵气上限达到10000',
                category: 'cultivation',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 5000, reward: { type: 'attribute', target: 'maxQi', bonus: 0.10 } },
                    { value: 10000, reward: { type: 'bubble', item: '气泡·灵气充沛' } }
                ]
            },
            // === 战斗类 (combat) ===
            {
                id: 'dungeon_slayer',
                name: '秘境杀手',
                desc: '击杀10个秘境首领',
                category: 'combat',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'dungeonBossesKilled', value: 10 },
                reward: { type: 'attribute', target: 'attack', bonus: 0.03 },
                title: '秘境杀手'
            },
            {
                id: 'pvp_champion',
                name: ' PVP之王',
                desc: '在排行榜PVP中获得100场胜利',
                category: 'combat',
                rarity: 'legendary',
                secret: false,
                stages: [
                    { value: 10, reward: { type: 'attribute', target: 'pvpBonus', bonus: 0.05 } },
                    { value: 50, reward: { type: 'attribute', target: 'pvpBonus', bonus: 0.10 } },
                    { value: 100, reward: { type: 'title', title: 'PVP之王' } }
                ]
            },
            {
                id: 'combat_veteran',
                name: '战斗老兵',
                desc: '参与100场战斗',
                category: 'combat',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 20, reward: { type: 'attribute', target: 'attack', bonus: 0.02 } },
                    { value: 50, reward: { type: 'attribute', target: 'defense', bonus: 0.02 } },
                    { value: 100, reward: { type: 'attribute', target: 'attack', bonus: 0.05 } }
                ]
            },
            {
                id: 'arena_master',
                name: '斗法场霸主',
                desc: '在斗法场中获得50次胜利',
                category: 'combat',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'arenaWins', value: 50 },
                reward: { type: 'attribute', target: 'critPercent', bonus: 0.05 },
                title: '斗法霸主'
            },
            {
                id: 'boss_hunter',
                name: 'BOSS猎人',
                desc: '击杀各路BOSS',
                category: 'combat',
                rarity: 'legendary',
                secret: true,
                stages: [
                    { value: 1, reward: { type: 'attribute', target: 'attack', bonus: 0.05 } },
                    { value: 5, reward: { type: 'item', item: '天材', quantity: 10 } },
                    { value: 10, reward: { type: 'title', title: 'BOSS克星' } }
                ]
            },
            // === 剧情类 (story) ===
            {
                id: 'sect_founder',
                name: '宗门创始人',
                desc: '创建宗门',
                category: 'story',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'sectContributions', value: 1 },
                reward: { type: 'attribute', target: 'sectContribution', bonus: 0.10 },
                title: '宗门创始人'
            },
            {
                id: 'first_ascension',
                name: '飞升者',
                desc: '首次突破化神',
                category: 'story',
                rarity: 'legendary',
                secret: false,
                requirement: { type: 'realm', value: 4 },
                reward: { type: 'attribute', target: 'realmSuppression', bonus: 0.10 },
                title: '飞升者'
            },
            {
                id: 'story_chapter',
                name: '剧情探索者',
                desc: '完成剧情章节',
                category: 'story',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 3, reward: { type: 'attribute', target: 'storyBonus', bonus: 0.05 } },
                    { value: 10, reward: { type: 'bubble', item: '气泡·剧情达人' } },
                    { value: 20, reward: { type: 'title', title: '剧情大师' } }
                ]
            },
            {
                id: 'reincarnation_sage',
                name: '轮回仙人',
                desc: '转世重生3次',
                category: 'story',
                rarity: 'legendary',
                secret: false,
                stages: [
                    { value: 1, reward: { type: 'attribute', target: 'soulAgeBonus', bonus: 0.10 } },
                    { value: 2, reward: { type: 'frame', item: '头像框·轮回' } },
                    { value: 3, reward: { type: 'title', title: '轮回仙人' } }
                ]
            },
            // === 收藏类 (collection) ===
            {
                id: 'treasure_master',
                name: '炼器宗师',
                desc: '强化9星装备1件',
                category: 'collection',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'stat', key: 'treasuresRefined', value: 1 },
                reward: { type: 'attribute', target: 'craftingSuccess', bonus: 0.05 },
                title: '炼器宗师'
            },
            {
                id: 'equipment_collector',
                name: '套装收藏家',
                desc: '收集全套青云套装',
                category: 'collection',
                rarity: 'rare',
                secret: false,
                requirement: { type: 'set', setName: '青云套装' },
                reward: { type: 'attribute', target: 'setBonus', bonus: 0.15 },
                title: '套装收藏家'
            },
            {
                id: 'inventory_expand',
                name: '收藏家',
                desc: '背包物品达到上限',
                category: 'collection',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 50, reward: { type: 'attribute', target: 'inventorySize', bonus: 0.10 } },
                    { value: 100, reward: { type: 'attribute', target: 'inventorySize', bonus: 0.15 } },
                    { value: 200, reward: { type: 'frame', item: '头像框·收藏家' } }
                ]
            },
            {
                id: 'constitution_collector',
                name: '体质收集者',
                desc: '收集各种体质',
                category: 'collection',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 3, reward: { type: 'attribute', target: 'constitutionBonus', bonus: 0.05 } },
                    { value: 6, reward: { type: 'attribute', target: 'constitutionBonus', bonus: 0.10 } },
                    { value: 10, reward: { type: 'title', title: '体质大师' } }
                ]
            },
            {
                id: 'pet_collector',
                name: '灵兽收藏家',
                desc: '收集5种不同宠物',
                category: 'collection',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 3, reward: { type: 'attribute', target: 'petBonus', bonus: 0.05 } },
                    { value: 5, reward: { type: 'bubble', item: '气泡·灵兽相伴' } },
                    { value: 10, reward: { type: 'title', title: '灵兽宗师' } }
                ]
            },
            // === 探索类 (exploration) ===
            {
                id: 'world_explorer',
                name: '世界探索者',
                desc: '探索世界地图50次',
                category: 'exploration',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 10, reward: { type: 'attribute', target: 'explorationBonus', bonus: 0.03 } },
                    { value: 30, reward: { type: 'item', item: '天材', quantity: 5 } },
                    { value: 50, reward: { type: 'frame', item: '头像框·探索者' } }
                ]
            },
            {
                id: 'dungeon_explorer',
                name: '秘境探索者',
                desc: '通关秘境20次',
                category: 'exploration',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 5, reward: { type: 'attribute', target: 'dungeonBonus', bonus: 0.05 } },
                    { value: 10, reward: { type: 'item', item: '混沌石', quantity: 1 } },
                    { value: 20, reward: { type: 'title', title: '秘境探索者' } }
                ]
            },
            {
                id: 'map_revealer',
                name: '地图测绘师',
                desc: '解锁地图上50个地点',
                category: 'exploration',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 20, reward: { type: 'attribute', target: 'mapBonus', bonus: 0.05 } },
                    { value: 35, reward: { type: 'attribute', target: 'serendipityRate', bonus: 0.05 } },
                    { value: 50, reward: { type: 'bubble', item: '气泡·测绘师' } }
                ]
            },
            // === 社交类 (social) ===
            {
                id: 'social_butterfly',
                name: '社交达人',
                desc: '与其他玩家互动100次',
                category: 'social',
                rarity: 'common',
                secret: false,
                stages: [
                    { value: 20, reward: { type: 'attribute', target: 'socialBonus', bonus: 0.03 } },
                    { value: 50, reward: { type: 'attribute', target: 'socialBonus', bonus: 0.05 } },
                    { value: 100, reward: { type: 'frame', item: '头像框·社交达人' } }
                ]
            },
            {
                id: 'sect_builder',
                name: '宗门建设者',
                desc: '为宗门贡献10000资源',
                category: 'social',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 1000, reward: { type: 'attribute', target: 'sectBonus', bonus: 0.05 } },
                    { value: 5000, reward: { type: 'attribute', target: 'sectBonus', bonus: 0.10 } },
                    { value: 10000, reward: { type: 'title', title: '宗门功臣' } }
                ]
            },
            // === 特殊类 (special) ===
            {
                id: 'flawless_tribulation',
                name: '完美渡劫',
                desc: '零消耗渡劫成功',
                category: 'special',
                rarity: 'legendary',
                secret: true,
                requirement: { type: 'stat', key: 'flawlessTribulations', value: 1 },
                reward: { type: 'attribute', target: 'tribulationCost', bonus: -0.10 },
                title: '完美渡劫'
            },
            {
                id: 'dedicated_player',
                name: '坚持不懈',
                desc: '连续登录游戏30天',
                category: 'special',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 7, reward: { type: 'item', item: '天材', quantity: 3 } },
                    { value: 14, reward: { type: 'item', item: '混沌石', quantity: 1 } },
                    { value: 30, reward: { type: 'title', title: '修仙楷模' } }
                ]
            },
            {
                id: 'wealthy_cultivator',
                name: '富甲一方',
                desc: '累计拥有100000灵石',
                category: 'special',
                rarity: 'rare',
                secret: false,
                stages: [
                    { value: 10000, reward: { type: 'attribute', target: 'tradeBonus', bonus: 0.05 } },
                    { value: 50000, reward: { type: 'bubble', item: '气泡·财大气粗' } },
                    { value: 100000, reward: { type: 'title', title: '灵石富翁' } }
                ]
            },
            {
                id: 'mythic_realm',
                name: '神话境界',
                desc: '突破到神话境界',
                category: 'special',
                rarity: 'mythic',
                secret: true,
                requirement: { type: 'realm', value: 10 },
                reward: { type: 'frame', item: '头像框·神话' },
                title: '神话仙人'
            },
            {
                id: 'perfectionist',
                name: '完美主义者',
                desc: '收集所有普通成就',
                category: 'special',
                rarity: 'mythic',
                secret: true,
                requirement: { type: 'allCommon', value: 1 },
                reward: { type: 'title', title: '完美主义者' }
            },
            // === 赛季专属成就 (s1) ===
            {
                id: 's1_cultivation',
                name: '赛季修炼者',
                desc: '第一赛季修炼500次',
                category: 'special',
                rarity: 'legendary',
                secret: true,
                season: 's1',
                stages: [
                    { value: 200, reward: { type: 'item', item: '天材', quantity: 5 } },
                    { value: 500, reward: { type: 'attribute', target: 'cultivationSpeed', bonus: 0.10 } }
                ]
            },
            {
                id: 's1_pvp_mvp',
                name: '赛季MVP',
                desc: '第一赛季获得50场PVP胜利',
                category: 'special',
                rarity: 'legendary',
                secret: true,
                season: 's1',
                stages: [
                    { value: 20, reward: { type: 'item', item: '混沌石', quantity: 1 } },
                    { value: 50, reward: { type: 'title', title: '赛季MVP' } }
                ]
            },
            {
                id: 's1_explorer',
                name: '赛季探索家',
                desc: '第一赛季探索30次',
                category: 'special',
                rarity: 'rare',
                secret: true,
                season: 's1',
                stages: [
                    { value: 15, reward: { type: 'item', item: '天材', quantity: 3 } },
                    { value: 30, reward: { type: 'frame', item: '赛季头像框·探索' } }
                ]
            },
            {
                id: 's1_collector',
                name: '赛季收藏家',
                desc: '第一赛季收集10件套装',
                category: 'special',
                rarity: 'rare',
                secret: true,
                season: 's1',
                stages: [
                    { value: 5, reward: { type: 'attribute', target: 'collectionBonus', bonus: 0.05 } },
                    { value: 10, reward: { type: 'bubble', item: '赛季气泡·收藏' } }
                ]
            },
            {
                id: 's1_dedicated',
                name: '赛季坚持者',
                desc: '第一赛季登录20天',
                category: 'special',
                rarity: 'rare',
                secret: true,
                season: 's1',
                stages: [
                    { value: 10, reward: { type: 'item', item: '天材', quantity: 2 } },
                    { value: 20, reward: { type: 'attribute', target: 'loginBonus', bonus: 0.05 } }
                ]
            },
            {
                id: 's1_legendary',
                name: '赛季传奇',
                desc: '第一赛季获得5000赛季积分',
                category: 'special',
                rarity: 'mythic',
                secret: true,
                season: 's1',
                stages: [
                    { value: 2000, reward: { type: 'item', item: '混沌石', quantity: 2 } },
                    { value: 5000, reward: { type: 'title', title: '第一赛季·传奇' } }
                ]
            }
        ];


export const ACHIEVEMENT_ID_MAP = {
            'tribulation_master': 'tribulation_master',
            'dungeon_slayer': 'dungeon_slayer',
            'sect_founder': 'sect_founder',
            'treasure_master': 'treasure_master',
            'serendipity_finder': 'serendipity_finder',
            'first_ascension': 'first_ascension',
            'equipment_collector': 'equipment_collector',
            'flawless_tribulation': 'flawless_tribulation'
        };


