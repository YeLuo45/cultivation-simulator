// domains/shared/constants/combat.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Combat Domain Constants
// ============================================================================

export const TRIBULATIONS = {
            '金丹初期雷劫': {
                type: 'thunder',
                realm: 3,
                stage: '初期',
                baseRate: 0.6,
                stages: 3,
                damage: 30,
                desc: '九天神雷，淬体锻魂'
            },
            '金丹中期阴火': {
                type: 'fire',
                realm: 3,
                stage: '中期',
                baseRate: 0.5,
                stages: 5,
                damage: 40,
                desc: '琉璃阴火，焚心烧魄'
            },
            '金丹后期风劫': {
                type: 'wind',
                realm: 3,
                stage: '后期',
                baseRate: 0.4,
                stages: 7,
                damage: 50,
                desc: '九幽阴风，刮骨伐髓'
            },
            '元婴心魔': {
                type: 'demon',
                realm: 4,
                stage: '任意',
                baseRate: 0.4,
                stages: 9,
                damage: 0,
                desc: '心魔滋生，最难渡'
            },
            '化神飞升': {
                type: 'all',
                realm: 5,
                stage: '后期',
                baseRate: 0.2,
                stages: 9,
                damage: 60,
                desc: '飞升之劫，成败在此一举'
            }
        };


export const ULTIMATE_SKILLS = {
            '凡铁剑': [
                { id:'basic_heavy', name:'重击', cost:50, damage:2.0, effects:{}, maxLevel:5 },
                { id:'basic_quick', name:'连击', cost:40, damage:1.2, effects:{doubleHit:0.3}, maxLevel:5 },
                { id:'basic_crash', name:'碎甲', cost:60, damage:1.8, effects:{armorBreak:0.25}, maxLevel:5 }
            ],
            '青云剑': [
                { id:'qy_heavy', name:'青云重击', cost:50, damage:2.0, effects:{}, maxLevel:5 },
                { id:'qy_slash', name:'剑气纵横', cost:65, damage:2.5, effects:{cleave:0.2}, maxLevel:5 },
                { id:'qy_fly', name:'御剑术', cost:80, damage:3.2, effects:{pierce:0.15}, maxLevel:5 }
            ],
            '雷霆铛': [
                { id:'thunder_1', name:'神雷', cost:70, damage:3.0, effects:{thunder:0.5}, maxLevel:5 },
                { id:'thunder_chain', name:'雷链', cost:75, damage:2.5, effects:{chain:0.25}, maxLevel:5 },
                { id:'thunder_storm', name:'雷罚', cost:90, damage:4.0, effects:{stun:0.15}, maxLevel:5 }
            ],
            '赤炎刀': [
                { id:'fire_slash', name:'焚天斩', cost:70, damage:3.0, effects:{burn:0.5}, maxLevel:5 },
                { id:'fire_inferno', name:'烈焰焚天', cost:85, damage:3.5, effects:{burn:0.35,defBoost:0.2}, maxLevel:5 },
                { id:'fire_immortal', name:'焚尽苍穹', cost:100, damage:4.5, effects:{burn:0.5,burnTurns:5}, maxLevel:5 }
            ],
            '寒冰剑': [
                { id:'ice_slash', name:'寒冰斩', cost:70, damage:3.0, effects:{freeze:0.4}, maxLevel:5 },
                { id:'ice_prison', name:'寒冰牢笼', cost:80, damage:2.0, effects:{freeze:0.3,freezeTurns:2}, maxLevel:5 },
                { id:'ice_shatter', name:'玄冰碎裂', cost:90, damage:3.8, effects:{freeze:0.45,freezeTurns:3}, maxLevel:5 }
            ],
            '金刚杵': [
                { id:'vajra_hit', name:'金刚杵击', cost:70, damage:3.0, effects:{armorBreak:0.3}, maxLevel:5 },
                { id:'vajra_beast', name:'伏魔金身', cost:75, damage:2.2, effects:{counterRate:0.4,defBoost:0.3}, maxLevel:5 },
                { id:'vajra_smash', name:'金刚碎岳', cost:95, damage:4.2, effects:{stun:0.2,armorBreak:0.3}, maxLevel:5 }
            ],
            '混元珠': [
                { id:'hunyuan_boom', name:'混元爆发', cost:50, damage:1.5, effects:{critBonus:0.30}, maxLevel:5 },
                { id:'hunyuan_shield', name:'混元护盾', cost:60, damage:0, effects:{defBoost:0.5,dmgReduce:0.2}, maxLevel:5 },
                { id:'hunyuan_orbit', name:'混元流转', cost:70, damage:2.2, effects:{drain:0.2,healRate:0.1}, maxLevel:5 }
            ],
            '金缕衣': [
                { id:'jinroo_guard', name:'金身护体', cost:50, damage:0, effects:{defBoost:0.5,dmgReduce:0.2}, maxLevel:5 },
                { id:'jinroo_reflect', name:'金缕反伤', cost:55, damage:0.8, effects:{reflect:0.3}, maxLevel:5 },
                { id:'jinroo_blessing', name:'金仙祝福', cost:70, damage:0, effects:{healRate:0.15,maxHpBoost:0.2}, maxLevel:5 }
            ],
            '避火罩': [
                { id:'fireproof_shield', name:'烈焰护盾', cost:50, damage:0, effects:{fireResist:1.0}, maxLevel:5 },
                { id:'fireproof_counter', name:'火抗反击', cost:60, damage:1.5, effects:{counterRate:0.35,fireResist:0.5}, maxLevel:5 },
                { id:'fireproof_absorb', name:'烈焰吸收', cost:75, damage:0, effects:{fireDrain:0.4,healRate:0.12}, maxLevel:5 }
            ],
            '玄冰甲': [
                { id:'icearmor_counter', name:'玄冰反击', cost:55, damage:1.2, effects:{counterRate:0.50,freeze:0.2}, maxLevel:5 },
                { id:'icearmor_wall', name:'玄冰冰墙', cost:65, damage:0, effects:{dmgReduce:0.4,freezeAura:0.25}, maxLevel:5 },
                { id:'icearmor_shatter', name:'冰霜爆裂', cost:80, damage:2.8, effects:{freeze:0.35,freezeTurns:2}, maxLevel:5 }
            ],
            '灵玉镯': [
                { id:'jade_shield', name:'灵玉护盾', cost:60, damage:0, effects:{defBoost:0.6,dmgReduce:0.25}, maxLevel:5 },
                { id:'jade_heal', name:'灵玉治愈', cost:55, damage:0, effects:{healRate:0.2,cleanse:1}, maxLevel:5 },
                { id:'jade_curse', name:'灵玉诅咒', cost:70, damage:2.2, effects:{curse:0.3,dmgReduce:0.2}, maxLevel:5 }
            ],
            '赤炎剑': [
                { id:'redfire_slash', name:'烈焰斩', cost:60, damage:2.8, effects:{burn:0.25}, maxLevel:5 },
                { id:'redfire_storm', name:'烈焰风暴', cost:80, damage:3.5, effects:{burn:0.35,cleave:0.25}, maxLevel:5 },
                { id:'redfire_immortal', name:'焚天灭世', cost:100, damage:4.5, effects:{burn:0.5,burnTurns:4}, maxLevel:5 }
            ],
            '风灵扇': [
                { id:'wind_fan', name:'风暴降临', cost:65, damage:2.2, effects:{speedReduce:0.30}, maxLevel:5 },
                { id:'wind_blade', name:'风刃连斩', cost:75, damage:2.8, effects:{doubleHit:0.25,speedReduce:0.15}, maxLevel:5 },
                { id:'wind_tornado', name:'龙卷风暴', cost:90, damage:3.8, effects:{speedReduce:0.45,cleave:0.2}, maxLevel:5 }
            ],
            '玄铁重甲': [
                { id:'iron_guard', name:'玄铁金身', cost:65, damage:0, effects:{defBoost:0.8,dmgReduce:0.25}, maxLevel:5 },
                { id:'iron_crash', name:'玄铁冲击', cost:70, damage:2.2, effects:{armorBreak:0.3,stun:0.15}, maxLevel:5 },
                { id:'iron_ultimate', name:'金铁合鸣', cost:85, damage:3.0, effects:{counterRate:0.45,dmgReduce:0.3}, maxLevel:5 }
            ],
            '紫电锤': [
                { id:'purple_thunder', name:'雷霆万钧', cost:75, damage:3.5, effects:{thunder:0.6}, maxLevel:5 },
                { id:'purple_chain', name:'紫电神链', cost:80, damage:3.0, effects:{chain:0.35,stun:0.15}, maxLevel:5 },
                { id:'purple_divine', name:'神雷灭世', cost:100, damage:5.0, effects:{thunder:0.7,stun:0.25}, maxLevel:5 }
            ],
            '天火扇': [
                { id:'divine_fire', name:'焚天之怒', cost:70, damage:3.0, effects:{burn:0.35,burnTurns:4}, maxLevel:5 },
                { id:'divine_inferno', name:'天火灭世', cost:90, damage:4.0, effects:{burn:0.5,burnTurns:5,dmgReduce:0.2}, maxLevel:5 },
                { id:'divine_meteor', name:'流星火雨', cost:95, damage:4.2, effects:{burn:0.45,cleave:0.3}, maxLevel:5 }
            ],
            '玄冰剑': [
                { id:'ice_crystal', name:'玄冰碎裂', cost:70, damage:2.8, effects:{freeze:0.35,freezeTurns:2}, maxLevel:5 },
                { id:'ice_domain', name:'玄冰领域', cost:85, damage:3.5, effects:{freeze:0.45,freezeTurns:3,freezeAura:0.2}, maxLevel:5 },
                { id:'ice_shatter', name:'万冰穿心', cost:100, damage:4.5, effects:{freeze:0.55,freezeTurns:4}, maxLevel:5 }
            ],
            '玄武甲': [
                { id:'blackturtle_guard', name:'玄武真身', cost:70, damage:0, effects:{defBoost:1.0,dmgReduce:0.35,healRate:0.10}, maxLevel:5 },
                { id:'blackturtle_counter', name:'玄武反击', cost:75, damage:1.8, effects:{counterRate:0.5,healRate:0.12}, maxLevel:5 },
                { id:'blackturtle_immortal', name:'玄武永固', cost:90, damage:0, effects:{invincible:1,dmgReduce:0.5,healRate:0.15}, maxLevel:5 }
            ],
            '天使神剑': [
                { id:'angel_slash', name:'天使裁决', cost:80, damage:4.5, effects:{trueDamage:0.30}, maxLevel:5 },
                { id:'angel_justice', name:'神圣审判', cost:90, damage:5.0, effects:{trueDamage:0.40,healRate:0.15}, maxLevel:5 },
                { id:'angel_divine', name:'神圣灭魔斩', cost:110, damage:6.0, effects:{trueDamage:0.5,burn:0.3}, maxLevel:5 }
            ],
            '天使神甲': [
                { id:'angel_armor_guard', name:'天使守护', cost:80, damage:0, effects:{invincible:1,dmgReduce:0.50,healRate:0.15}, maxLevel:5 },
                { id:'angel_armor_holy', name:'圣光护盾', cost:70, damage:0, effects:{defBoost:0.8,healRate:0.2,cleanse:2}, maxLevel:5 },
                { id:'angel_armor_final', name:'神盾永固', cost:95, damage:0, effects:{invincible:2,dmgReduce:0.6,healRate:0.25}, maxLevel:5 }
            ],
            '天使神翼': [
                { id:'angel_wing_strike', name:'天使制裁', cost:80, damage:3.0, effects:{drain:0.30}, maxLevel:5 },
                { id:'angel_wing_judgment', name:'天堂之拳', cost:90, damage:4.5, effects:{drain:0.35,stun:0.2}, maxLevel:5 },
                { id:'angel_wing_divine', name:'神圣审判之翼', cost:105, damage:5.5, effects:{drain:0.45,trueDamage:0.25}, maxLevel:5 }
            ],
            '空手': [
                { id:'empty_qigong', name:'气功波', cost:45, damage:1.8, effects:{}, maxLevel:5 },
                { id:'empty_chi', name:'气吞天下', cost:60, damage:2.5, effects:{drain:0.15}, maxLevel:5 },
                { id:'empty_ultimate', name:'混沌元气', cost:80, damage:3.5, effects:{drain:0.25,healRate:0.1}, maxLevel:5 }
            ]
        };


export const SET_BONUSES = {
            '青云套装': {
                pieces: ['青云剑', '青云甲'],
                count: 2,
                stats: { attackPercent: 0.15, critPercent: 0.10 },
                twoPiece: '攻击+15%，暴击+10%',
                threePiece: null,
                skill: null
            }
        };


