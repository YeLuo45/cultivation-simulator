// domains/shared/constants/world.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: World Domain Constants
// ============================================================================

export const CONTINENTS = {
            '中州': {
                icon: '🏯',
                requiredRealm: 0, // 筑基
                dangerLevel: 1,
                description: '新手大陆，安全区域，宗门林立',
                color: '#4caf50',
                regions: ['中州城', '中州野外', '青云山']
            },
            '南疆': {
                icon: '🌴',
                requiredRealm: 1, // 金丹
                dangerLevel: 2,
                description: '妖兽聚集之地，材料丰富',
                color: '#ff9800',
                regions: ['南疆密林', '妖兽谷', '毒瘴沼泽']
            },
            '北域': {
                icon: '❄️',
                requiredRealm: 2, // 元婴
                dangerLevel: 3,
                description: '宗门林立，功法交易盛行',
                color: '#2196f3',
                regions: ['北域雪山', '冰魄宫', '寒冰洞府']
            },
            '西域': {
                icon: '🏜️',
                requiredRealm: 3, // 化神
                dangerLevel: 4,
                description: '秘境众多，机缘深厚',
                color: '#ff5722',
                regions: ['西域沙漠', '火焰山', '风沙遗迹']
            },
            '东海': {
                icon: '🌊',
                requiredRealm: 2, // 元婴
                dangerLevel: 3,
                description: '海族领地，神兽出没',
                color: '#00bcd4',
                regions: ['东海渔村', '深海礁石', '龙宫入口']
            },
            '仙界碎片': {
                icon: '✨',
                requiredRealm: 4, // 渡劫
                dangerLevel: 5,
                description: '飞升前最终试炼，蕴含成仙之秘',
                color: '#9c27b0',
                regions: ['仙府遗迹', '天劫之渊', '飞升祭坛']
            },
            '天外天': {
                icon: '🌌',
                requiredRealm: 5, // 飞升后
                dangerLevel: 5,
                description: '诸天万界交汇之地，超脱轮回之所',
                color: '#ffd700',
                regions: ['天道碎片', '命运长河', '轮回之地', '大道之树', '永恒星域']
            }
        };


export const THIRTY_THREE_HEAVENS = [
            { id: 1, name: '第一重天·太皇天', desc: '凡界飞升者初至此地', lore: '传闻太皇天是凡界与仙界的中转站，凡是通过飞升的修士都会在此接受天道法则的洗礼...' },
            { id: 2, name: '第二重天·太明天', desc: '日月交替之光', lore: '太明天的光芒由上古神龙掌控，据说这里的阳光能照见修士的前世今生...' },
            { id: 3, name: '第三重天·玉明天', desc: '美玉无瑕之境', lore: '玉明天遍地产灵玉，修士在此可净化身心，祛除心魔...' },
            { id: 4, name: '第四重天·宝明天', desc: '万宝归宗之所', lore: '宝明天藏有上古仙府遗迹，无数宝物等待有缘人...' },
            { id: 5, name: '第五重天·望天', desc: '登高望远之地', lore: '望天之上可远眺诸天万界，是观测仙界动向的最佳位置...' },
            { id: 6, name: '第六重天·弧天', desc: '天弧环绕之界', lore: '弧天被神秘天弧环绕，传说弧心处藏有天道残卷...' },
            { id: 7, name: '第七重天·咸天', desc: '仙凡交汇之处', lore: '咸天是仙界与凡间的连接点，无数位面在此交汇...' },
            { id: 8, name: '第八重天·太极天', desc: '阴阳初分之地', lore: '太极天蕴含阴阳法则，修士可在此领悟生死轮回之秘...' },
            { id: 9, name: '第九重天·皓天', desc: '纯净无瑕之天', lore: '皓天终年洁白无瑕，是洗涤罪孽的圣地...' },
            { id: 10, name: '第十重天·元天', desc: '万物元始之地', lore: '元天是诸天万界的起源，所有法则的起点...' },
            { id: 11, name: '第十一重天·贞天', desc: '坚定不渝之心', lore: '贞天考验修士的道心，唯有信念坚定者方可通过...' },
            { id: 12, name: '第十二重天·是天', desc: '天命所归之处', lore: '是天承载天命，是非成败皆由天定...' },
            { id: 13, name: '第十三重天·遁天', desc: '隐世修行之所', lore: '遁天藏于诸天之外，是隐世大能的道场...' },
            { id: 14, name: '第十四重天·信天', desc: '信念凝聚之地', lore: '信天能让修士的道心化作实质，信念越强力量越强...' },
            { id: 15, name: '第十五重天·午天', desc: '天之正中', lore: '午天位于三十三天的正中，是天地交泰之地...' },
            { id: 16, name: '第十六重天·上升天', desc: '飞升者的圣地', lore: '上升天是历代飞升成功的修士最终归宿...' },
            { id: 17, name: '第十七重天·释罗天', desc: '佛法东渐之地', lore: '释罗天融汇佛道两家之学，是佛道双修者的圣地...' },
            { id: 18, name: '第十八重天·牟工天', desc: '天工匠造之所', lore: '牟工天是上古天工匠的遗迹，藏有失传的炼器秘术...' },
            { id: 19, name: '第十九重天·目 Junction 天', desc: '诸天枢纽', lore: '目 Junction 天连接三十三天，是诸天之间的交通要道...' },
            { id: 20, name: '第二十重天·静天', desc: '万籁俱寂之地', lore: '静天无声无息，是参悟天道寂灭之法的圣地...' },
            { id: 21, name: '第二十一重天·冀天', desc: '希望与期盼', lore: '冀天承载着无数修士的希望，是愿望之力的汇聚之地...' },
            { id: 22, name: '第二十二重天·郡天', desc: '天之疆域', lore: '郡天划分三十三天的疆域，各路势力在此角力...' },
            { id: 23, name: '第二十三重天·祥天', desc: '瑞气千条之所', lore: '祥天遍布祥瑞之气，是福缘深厚者的洞府...' },
            { id: 24, name: '第二十四重天·温天', desc: '温和如玉之境', lore: '温天气候宜人，是修身养性的绝佳去处...' },
            { id: 25, name: '第二十五重天·江天', desc: '大江东去之境', lore: '江天有一条天河支流，传说能洗净世间一切烦恼...' },
            { id: 26, name: '第二十六重天·辅天', desc: '辅弼天地之所', lore: '辅天辅助天道运转，是天道的左膀右臂...' },
            { id: 27, name: '第二十七重天·弼天', desc: '天道之臂膀', lore: '弼天与辅天相辅相成，共同维护天道秩序...' },
            { id: 28, name: '第二十八重天·邪天', desc: '天之暗面', lore: '邪天与诸天对立，是天道的阴暗面，藏有禁忌之力...' },
            { id: 29, name: '第二十九重天·真天', desc: '返璞归真之地', lore: '真天能让修士返璞归真，回归最纯粹的自我...' },
            { id: 30, name: '第三十重天·天中天', desc: '天外有天', lore: '天中天是三十三天的中心，天道法则在此汇聚...' },
            { id: 31, name: '第三十一重天·定天', desc: '永恒不动之地', lore: '定天是三十三天最稳定之地，时间在此静止...' },
            { id: 32, name: '第三十二重天·镜天', desc: '映照万界之镜', lore: '镜天有一面天道镜，能映照诸天万界的过去与未来...' },
            { id: 33, name: '第三十三重天·道天', desc: '天道最终奥秘', lore: '道天是三十三天的尽头，也是天道最终奥秘的所在。传闻只有超脱者方能踏入此地，领悟天道最终奥义...' },
            { id: 34, name: '第三十四重天·天外天', desc: '诸天之外之地', lore: '天外天藏于诸天之上，是超脱者方能触及的禁忌领域。此地蕴含打破天道枷锁的秘密...' },
            { id: 35, name: '第三十五重天·虚道天', desc: '虚空证道之所', lore: '虚道天无天无地，唯有一片混沌虚空。传说在此地可以剥离一切后天之道，回归先天本源...' },
            { id: 36, name: '第三十六重天·本源天', desc: '天道本源之地', lore: '本源天是天道法则的起源，是一切道法的根源。传闻踏入此地者将与天道合真，成为新的天道化身...' },
            { id: 37, name: '第三十七重天·超脱天', desc: '混沌虚无之地', lore: '超脱天藏于天道之外，是一片永恒的混沌虚无。只有集齐三十六枚法则印记的超脱者，方能触及此地...' },
            { id: 38, name: '第三十八重天·天命天', desc: '最终归宿之地', lore: '天命天是所有超脱者的最终归宿，在此地将面临天道最终的选择：超脱、回归或永恒...' }
        ];


export const MAIN_PLOT = {
            act1: {
                title: '第一幕：迷惘者',
                description: '你从沉睡中醒来，发现自己身处天外天，却不记得自己的过去...',
                trigger: '进入天外天且未触发过剧情',
                rewards: []
            },
            act2: {
                title: '第二幕：三十三天',
                description: '一位神秘老者告诉你，天外天之上还有三十三天，而你或许是解开天道奥秘的关键...',
                trigger: '探索天外天区域达到3次',
                rewards: []
            },
            act3: {
                title: '第三幕：仙界之谜',
                description: '你在探索中发现，天外天与仙界之间有着不为人知的秘密...',
                trigger: '探索完10重三十三天',
                rewards: []
            },
            act4: {
                title: '第四幕：真相大白',
                description: '当你踏足第三十三重天道天时，一切真相终于揭晓...',
                trigger: '探索完33重三十三天',
                rewards: []
            },
            act5: {
                title: '第五幕：超脱永恒',
                description: '道祖遗迹中隐藏着终极奥秘，天道印记指引着你找到通往超脱之路...',
                trigger: '获得天道印记并探索道祖遗迹',
                rewards: []
            }
        };


export const REGIONS = {
            '中州城': {
                type: 'safe', // 安全区
                monsters: [],
                resources: ['灵草', '普通矿石'],
                description: '繁华的修仙者聚落，可休息和交易'
            },
            '中州野外': {
                type: 'wild', // 野外区
                monsters: ['野兔精', '狐狸精'],
                monsterLevel: [1, 5],
                resources: ['灵草', '妖兽血'],
                description: '中州边缘的野外区域，有低级妖兽出没'
            },
            '青云山': {
                type: 'secret', // 秘境
                secretRealm: '青云洞府',
                difficulty: 'low',
                description: '上古修士洞府，藏有入门功法'
            },
            '南疆密林': {
                type: 'wild',
                monsters: ['妖兽狼', '巨蟒'],
                monsterLevel: [10, 20],
                resources: ['妖兽皮', '妖兽骨', '南疆蛊虫'],
                description: '密林深处，妖兽横行'
            },
            '妖兽谷': {
                type: 'boss', // 有首领
                monsters: ['妖兽狼王'],
                monsterLevel: [25],
                bossName: '妖兽谷主',
                resources: ['妖兽皮', '兽王胆'],
                description: '妖兽聚集之地，首领，每7天刷新'
            },
            '毒瘴沼泽': {
                type: 'wild',
                monsters: ['毒蛙', '沼蟒'],
                monsterLevel: [15, 25],
                resources: ['毒囊', '沼泽精华'],
                description: '充满毒气的沼泽区域'
            },
            '北域雪山': {
                type: 'wild',
                monsters: ['冰魄熊', '雪怪'],
                monsterLevel: [25, 35],
                resources: ['冰魄精', '寒冰髓'],
                description: '终年积雪，寒冷刺骨'
            },
            '冰魄宫': {
                type: 'boss',
                monsters: ['冰魄熊王'],
                monsterLevel: [40],
                bossName: '冰魄宫主',
                resources: ['冰魄精', '万年寒冰'],
                description: '冰系修士的圣地，首领，每7天刷新'
            },
            '寒冰洞府': {
                type: 'secret',
                secretRealm: '上古冰宫',
                difficulty: 'medium',
                description: '上古遗迹，藏有冰系高阶功法'
            },
            '西域沙漠': {
                type: 'wild',
                monsters: ['沙虫', '蝎王'],
                monsterLevel: [40, 50],
                resources: ['沙之心', '蝎王毒'],
                description: '茫茫沙漠，危机四伏'
            },
            '火焰山': {
                type: 'boss',
                monsters: ['火焰狮王'],
                monsterLevel: [55],
                bossName: '火焰山主',
                resources: ['火精', '熔岩核心'],
                description: '火焰肆虐之地，首领，每7天刷新'
            },
            '风沙遗迹': {
                type: 'secret',
                secretRealm: '古修士遗迹',
                difficulty: 'high',
                description: '上古遗迹，藏有混沌石'
            },
            '东海渔村': {
                type: 'safe',
                monsters: [],
                resources: ['珍珠', '海藻'],
                description: '东海之滨的小渔村，可休整'
            },
            '深海礁石': {
                type: 'wild',
                monsters: ['海妖', '巨型章鱼'],
                monsterLevel: [35, 45],
                resources: ['海妖珠', '深海珍珠'],
                description: '深海区域，海族妖兽出没'
            },
            '龙宫入口': {
                type: 'secret',
                secretRealm: '东海龙宫',
                difficulty: 'high',
                description: '传说中龙族的宫殿，藏有龙族秘宝'
            },
            '仙府遗迹': {
                type: 'secret',
                secretRealm: '仙府',
                difficulty: 'extreme',
                description: '仙界碎片中的遗迹，有飞升道具'
            },
            '天劫之渊': {
                type: 'boss',
                monsters: ['天劫守护兽'],
                monsterLevel: [70],
                bossName: '天劫化身',
                resources: ['天劫雷晶', '渡劫丹方'],
                description: '天劫之力凝聚，首领，每7天刷新'
            },
            '飞升祭坛': {
                type: 'secret',
                secretRealm: '飞升台',
                difficulty: 'extreme',
                description: '最终飞升之地，需要渡劫期才能进入'
            },
            // 天外天区域
            '天道碎片': {
                type: 'secret',
                secretRealm: '天道遗迹',
                difficulty: 'beyond',
                description: '天道意志碎片，蕴含宇宙本源之力'
            },
            '命运长河': {
                type: 'wild',
                monsters: ['命运守护者', '时间长河之灵'],
                monsterLevel: [80, 90],
                resources: ['命运之水', '时间法则碎片'],
                description: '过去未来交汇之处，窥探天机'
            },
            '轮回之地': {
                type: 'boss',
                monsters: ['轮回之主'],
                monsterLevel: [85],
                bossName: '六道轮回神',
                resources: ['轮回法则', '转世金丹'],
                description: '轮回法则凝聚之地，每7天刷新'
            },
            '大道之树': {
                type: 'secret',
                secretRealm: '道果秘境',
                difficulty: 'beyond',
                description: '万道之根源，藏有证道之机'
            },
            '永恒星域': {
                type: 'wild',
                monsters: ['星辰守护兽', '虚空邪神'],
                monsterLevel: [90, 100],
                resources: ['永恒星核', '虚空法则'],
                description: '永恒不朽的星海，超脱生死之地'
            }
        };


export const SECRET_REALMS = {
            '青云洞府': {
                duration: 30,
                reward: '入门功法',
                successRate: 0.8
            },
            '上古冰宫': {
                duration: 40,
                reward: '冰系功法',
                successRate: 0.6
            },
            '古修士遗迹': {
                duration: 50,
                reward: '混沌石',
                successRate: 0.4
            },
            '东海龙宫': {
                duration: 50,
                reward: '龙族材料',
                successRate: 0.35
            },
            '仙府': {
                duration: 60,
                reward: '飞升道具',
                successRate: 0.25
            },
            '飞升台': {
                duration: 60,
                reward: '飞升丹',
                successRate: 0.2
            },
            // 天外天秘境
            '天道遗迹': {
                duration: 90,
                reward: '天道法则',
                successRate: 0.15
            },
            '道果秘境': {
                duration: 120,
                reward: '大道之果',
                successRate: 0.1
            }
        };


