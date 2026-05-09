// Auto-generated module: ui.js
'use strict';

        // --- CONTINENTS (7877-7926) ---
        const CONTINENTS = {
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
            }
        };

        // --- REGIONS (7929-8052) ---
        const REGIONS = {
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
            }
        };

        // --- SECRET_REALMS (8055-8086) ---
        const SECRET_REALMS = {
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
            }
        };

