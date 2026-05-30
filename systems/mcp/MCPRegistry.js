// ============================================================
// MCPRegistry.js
// MCP Tool Definition Registry - Part of cultivation-simulator
// Auto-generated - Do not edit manually
// ============================================================

// ------------------------------------------------------------
// const MCP_TOOLS (lines 229-315, 87 lines)
// ------------------------------------------------------------
        const MCP_TOOLS = {
            'npc.query': {
                name: 'npc.query',
                description: 'Query NPC information, memory, relationship, current task',
                inputSchema: {
                    type: 'object',
                    properties: {
                        npcId: { type: 'string', description: 'NPC ID or name' },
                        query: { type: 'string', description: 'Query type: info|memory|relationship|task' }
                    },
                    required: ['npcId', 'query']
                }
            },
            'serendipity.trigger': {
                name: 'serendipity.trigger',
                description: 'Manually trigger a serendipity event by node ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: { type: 'string', description: 'Serendipity node ID to trigger' }
                    },
                    required: ['nodeId']
                }
            },
            'cultivation.advance': {
                name: 'cultivation.advance',
                description: 'Advance cultivation manually (meditate, breakthrough, etc.)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', enum: ['meditate', 'breakthrough', 'tribulation'], description: 'Cultivation action' }
                    },
                    required: ['action']
                }
            },
            'item.exchange': {
                name: 'item.exchange',
                description: 'Exchange items for spirit stones or other items',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: 'Item ID to exchange' },
                        target: { type: 'string', description: 'Target: spirit_stones|item' }
                    },
                    required: ['itemId', 'target']
                }
            },
            'gameState.query': {
                name: 'gameState.query',
                description: 'Query current game state (realm, spiritStones, items, etc.)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        field: { type: 'string', description: 'Field to query: realm|spiritStones|items|cultivation|combat|npc|all' }
                    },
                    required: ['field']
                }
            },
            'battle.start': {
                name: 'battle.start',
                description: 'Start a battle against opponent',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opponentId: { type: 'string', description: 'Opponent NPC ID or type' },
                        auto: { type: 'boolean', description: 'Auto-battle mode (AI controlled)' }
                    },
                    required: ['opponentId']
                }
            },
            'mcp.providers': {
                name: 'mcp.providers',
                description: 'Get available LLM providers and their status',
                inputSchema: { type: 'object', properties: {} }
            },
            'mcp.switch_provider': {
                name: 'mcp.switch_provider',
                description: 'Switch active LLM provider',
                inputSchema: {
                    type: 'object',
                    properties: {
                        providerId: { type: 'string', description: 'Provider ID: minimax|openai|anthropic|groq|mistral|deepseek|local' }
                    },
                    required: ['providerId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V74 (lines 318-712, 395 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V74 = {
            'realm.list': {
                name: 'realm.list',
                description: 'List all cultivation realms and current realm info',
                inputSchema: {
                    type: 'object',
                    properties: {
                        detail: { type: 'boolean', description: 'Include stage and progress details' }
                    }
                }
            },
            'item.craft': {
                name: 'item.craft',
                description: 'Craft an item using recipes (alchemy/forge)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        recipeId: { type: 'string', description: 'Recipe ID from craftable items' },
                        quantity: { type: 'number', description: 'Quantity to craft (default 1)' }
                    },
                    required: ['recipeId']
                }
            },
            'skill.learn': {
                name: 'skill.learn',
                description: 'Learn or upgrade a cultivation skill/technique',
                inputSchema: {
                    type: 'object',
                    properties: {
                        skillId: { type: 'string', description: 'Skill ID to learn' },
                        upgrade: { type: 'boolean', description: 'Upgrade existing skill instead of learning new' }
                    },
                    required: ['skillId']
                }
            },
            'sect.query': {
                name: 'sect.query',
                description: 'Query sect information, members, resources, level',
                inputSchema: {
                    type: 'object',
                    properties: {
                        info: { type: 'string', description: 'Info type: overview|members|resources|level|all' }
                    },
                    required: ['info']
                }
            },
            'player.achievements': {
                name: 'player.achievements',
                description: 'Query player achievements, titles, completed goals',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|completed|in-progress|rare' }
                    }
                }
            },
            'celestial.battlefield': {
                name: 'celestial.battlefield',
                description: 'Access celestial battlefield (Tian Ting) for celestial realm PVP',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', enum: ['list', 'join', 'status', 'leave'], description: 'Battlefield action' },
                        tier: { type: 'number', description: 'Battlefield tier (1-5)' }
                    }
                }
            },
            'mcp.dashboard': {
                name: 'mcp.dashboard',
                description: 'Get MCP dashboard overview with all tool categories and game state summary',
                inputSchema: { type: 'object', properties: {} }
            },
            // V75: NPC生态深化 + 装备系统
            'equipment.query': {
                name: 'equipment.query',
                description: 'Query equipment information by slot or all equipment',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slot: { type: 'string', description: 'Equipment slot: weapon|armor|boots|ring|amulet or "all"' }
                    }
                }
            },
            'equipment.enhance': {
                name: 'equipment.enhance',
                description: 'Enhance an equipment piece with spirit stones',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slot: { type: 'string', description: 'Equipment slot to enhance' },
                        stones: { type: 'number', description: 'Number of spirit stones to invest' }
                    },
                    required: ['slot', 'stones']
                }
            },
            'npc.dialogue_history': {
                name: 'npc.dialogue_history',
                description: 'Get NPC dialogue history with player',
                inputSchema: {
                    type: 'object',
                    properties: {
                        npcId: { type: 'string', description: 'NPC ID or name' },
                        limit: { type: 'number', description: 'Max number of recent dialogues (default 20)' }
                    },
                    required: ['npcId']
                }
            },
            'npc.interaction_log': {
                name: 'npc.interaction_log',
                description: 'Get NPC interaction event log',
                inputSchema: {
                    type: 'object',
                    properties: {
                        npcId: { type: 'string', description: 'NPC ID or name' },
                        eventType: { type: 'string', description: 'Event type filter: trade|combat|dialogue|task|all (default all)' }
                    },
                    required: ['npcId']
                }
            },
            'npc.relationship_tree': {
                name: 'npc.relationship_tree',
                description: 'Get NPC relationship network tree with player and other NPCs',
                inputSchema: {
                    type: 'object',
                    properties: {
                        npcId: { type: 'string', description: 'Root NPC ID or name' },
                        depth: { type: 'number', description: 'Max depth of relationship tree (default 2)' }
                    },
                    required: ['npcId']
                }
            },
            'item.list': {
                name: 'item.list',
                description: 'List all items in player inventory with filtering',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|consumable|equipment|material|quest' },
                        quality: { type: 'string', description: 'Quality filter: N|R|SR|SSR|all' }
                    }
                }
            },
            'celestial.status': {
                name: 'celestial.status',
                description: 'Get full celestial realm status including battlefield and sect info',
                inputSchema: { type: 'object', properties: {} }
            },
            // V76: 装备打造系统增强 — 随机属性/精炼/装备评分
            'equipment.forge': {
                name: 'equipment.forge',
                description: 'Forge a new equipment piece with random attributes',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slot: { type: 'string', description: 'Slot: weapon|armor|boots|ring|amulet' },
                        quality: { type: 'string', description: 'Base quality: N|R|SR|SSR (default random)' }
                    },
                    required: ['slot']
                }
            },
            'equipment.refine': {
                name: 'equipment.refine',
                description: 'Refine equipment to add random bonus attributes',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slot: { type: 'string', description: 'Equipment slot to refine' },
                        stones: { type: 'number', description: 'Spirit stones to invest (cost = stones * 20)' }
                    },
                    required: ['slot', 'stones']
                }
            },
            'equipment.score': {
                name: 'equipment.score',
                description: 'Calculate equipment score (combat power rating)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slot: { type: 'string', description: 'Equipment slot or "all"' }
                    }
                }
            },
            'equipment.gem_embed': {
                name: 'equipment.gem_embed',
                description: 'Embed or remove gems from equipment',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slot: { type: 'string', description: 'Equipment slot' },
                        gemId: { type: 'string', description: 'Gem ID to embed (or "remove")' },
                        slotIndex: { type: 'number', description: 'Gem socket index (0-3)' }
                    },
                    required: ['slot', 'gemId']
                }
            },
            'item.generate': {
                name: 'item.generate',
                description: 'Generate a random item with quality and type',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Item type: consumable|equipment|material|quest' },
                        quality: { type: 'string', description: 'Quality: N|R|SR|SSR' },
                        level: { type: 'number', description: 'Item level (default based on player realm)' }
                    }
                }
            },
            'battle.power': {
                name: 'battle.power',
                description: 'Calculate total player combat power',
                inputSchema: { type: 'object', properties: {} }
            },
            // V77: 天道轮回增强 + 奇遇DAG深化
            'serendipity.karma': {
                name: 'serendipity.karma',
                description: 'Record and query karma/causal effects',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', description: 'Action: record|query|list' },
                        type: { type: 'string', description: 'Karma type: good|bad|neutral' },
                        amount: { type: 'number', description: 'Karma amount to record' }
                    }
                }
            },
            'serendipity.fate': {
                name: 'serendipity.fate',
                description: 'Query fate/destiny system',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Query: status|traits|connections' }
                    }
                }
            },
            'serendipity.branch': {
                name: 'serendipity.branch',
                description: 'Select branch in multi-choice serendipity event',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: { type: 'string', description: 'Serendipity node ID' },
                        choice: { type: 'string', description: 'Choice: A|B|C' }
                    }
                }
            },
            'serendipity.progress': {
                name: 'serendipity.progress',
                description: 'Get full serendipity DAG progress',
                inputSchema: { type: 'object', properties: {} }
            },
            'celestial.reincarnation': {
                name: 'celestial.reincarnation',
                description: 'Reincarnate or query reincarnation stats',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', description: 'Action: stats|reincarnate|preview' }
                    }
                }
            },
            'world.cycle': {
                name: 'world.cycle',
                description: 'Query world cycle (天地轮回) status',
                inputSchema: { type: 'object', properties: {} }
            },
            // V78: 仙界经济系统 + 灵宠进化树
            'market.list': {
                name: 'market.list',
                description: 'List items on the celestial market',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: 'Category: equipment|consumable|material|all' }
                    }
                }
            },
            'market.buy': {
                name: 'market.buy',
                description: 'Buy item from celestial market',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: 'Market item ID' },
                        quantity: { type: 'number', description: 'Quantity to buy' }
                    },
                    required: ['itemId']
                }
            },
            'market.sell': {
                name: 'market.sell',
                description: 'Sell item to celestial market',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: 'Inventory item ID to sell' },
                        price: { type: 'number', description: 'Price per unit in spirit stones' }
                    },
                    required: ['itemId', 'price']
                }
            },
            'pet.list': {
                name: 'pet.list',
                description: 'List all pets and their status',
                inputSchema: { type: 'object', properties: {} }
            },
            'pet.feed': {
                name: 'pet.feed',
                description: 'Feed a pet to increase affinity',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: 'Pet ID' },
                        food: { type: 'string', description: 'Food type: normal|premium|super' }
                    },
                    required: ['petId', 'food']
                }
            },
            'pet.evolve': {
                name: 'pet.evolve',
                description: 'Evolve a pet to next stage',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: 'Pet ID to evolve' },
                        stones: { type: 'number', description: 'Spirit stones to invest' }
                    },
                    required: ['petId', 'stones']
                }
            },
            'pet.skill': {
                name: 'pet.skill',
                description: 'Teach or upgrade pet skill',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: 'Pet ID' },
                        action: { type: 'string', description: 'Action: learn|upgrade|forget' },
                        skillId: { type: 'string', description: 'Skill ID' }
                    },
                    required: ['petId', 'action']
                }
            },
            'economy.stats': {
                name: 'economy.stats',
                description: 'Get celestial economy statistics',
                inputSchema: { type: 'object', properties: {} }
            },
            // V79: 离线持久化增强 + PowerSync
            'save.export': {
                name: 'save.export',
                description: 'Export game save data to JSON string',
                inputSchema: {
                    type: 'object',
                    properties: {
                        include: { type: 'string', description: 'What to include: all|state|items|equipment' }
                    }
                }
            },
            'save.import': {
                name: 'save.import',
                description: 'Import game save data from JSON string',
                inputSchema: {
                    type: 'object',
                    properties: {
                        data: { type: 'string', description: 'JSON string from save.export' }
                    },
                    required: ['data']
                }
            },
            'save.sync': {
                name: 'save.sync',
                description: 'Sync save to cloud/remote storage',
                inputSchema: { type: 'object', properties: {} }
            },
            'save.backup': {
                name: 'save.backup',
                description: 'Create local backup with timestamp',
                inputSchema: { type: 'object', properties: {} }
            },
            'save.slots': {
                name: 'save.slots',
                description: 'List all save slots',
                inputSchema: { type: 'object', properties: {} }
            },
            'save.delete': {
                name: 'save.delete',
                description: 'Delete a save slot',
                inputSchema: {
                    type: 'object',
                    properties: { slot: { type: 'string', description: 'Slot name: auto|backup|slot1|slot2' } },
                    required: ['slot']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V80 (lines 714-779, 66 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V80 = {
            'battle.arena.list': {
                name: 'battle.arena.list',
                description: 'Query arena leaderboard and available matches',
                inputSchema: {
                    type: 'object',
                    properties: {
                        season: { type: 'string', description: 'Season ID (default current)' },
                        page: { type: 'number', description: 'Page number (default 1)' }
                    }
                }
            },
            'battle.arena.join': {
                name: 'battle.arena.join',
                description: 'Join arena matchmaking for ranked battle',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rankTier: { type: 'string', description: 'Preferred tier: bronze|silver|gold|platinum|diamond|immortal' }
                    }
                }
            },
            'battle.arena.report': {
                name: 'battle.arena.report',
                description: 'Get detailed battle replay by report ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reportId: { type: 'string', description: 'Battle report ID' }
                    },
                    required: ['reportId']
                }
            },
            'battle.combat.log': {
                name: 'battle.combat.log',
                description: 'Query historical combat logs',
                inputSchema: {
                    type: 'object',
                    properties: {
                        count: { type: 'number', description: 'Number of logs to return (default 20)' },
                        filter: { type: 'string', description: 'Filter: all|arena|pve|pvp' }
                    }
                }
            },
            'battle.rank.rise': {
                name: 'battle.rank.rise',
                description: 'Get ranking rise history and progress',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: 'Period: daily|weekly|seasonal' }
                    }
                }
            },
            'battle.reward.claim': {
                name: 'battle.reward.claim',
                description: 'Claim arena season rewards by tier',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tier: { type: 'string', description: 'Reward tier: participation|bronze|silver|gold|platinum|diamond|immortal' }
                    },
                    required: ['tier']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V81 (lines 781-848, 68 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V81 = {
            'sect.info': {
                name: 'sect.info',
                description: 'Query detailed sect information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        view: { type: 'string', description: 'View: overview|disciples|resources|missions' }
                    }
                }
            },
            'sect.disciple.list': {
                name: 'sect.disciple.list',
                description: 'List all sect disciples with their status',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|available|dispatched|training' }
                    }
                }
            },
            'sect.disciple.recruit': {
                name: 'sect.disciple.recruit',
                description: 'Recruit a new disciple into the sect',
                inputSchema: {
                    type: 'object',
                    properties: {
                        talent: { type: 'string', description: 'Talent tier: normal|good|genius|immortal' },
                        name: { type: 'string', description: 'Disciple name (optional, auto-generated if empty)' }
                    }
                }
            },
            'sect.disciple.train': {
                name: 'sect.disciple.train',
                description: 'Train a disciple to increase their stats',
                inputSchema: {
                    type: 'object',
                    properties: {
                        discipleId: { type: 'string', description: 'Disciple UID' },
                        type: { type: 'string', description: 'Training type: combat|cultivation|alchemy' }
                    },
                    required: ['discipleId', 'type']
                }
            },
            'sect.cultivation.assign': {
                name: 'sect.cultivation.assign',
                description: 'Assign a cultivation technique to a disciple',
                inputSchema: {
                    type: 'object',
                    properties: {
                        discipleId: { type: 'string', description: 'Disciple UID' },
                        techniqueId: { type: 'string', description: 'Technique ID' }
                    },
                    required: ['discipleId', 'techniqueId']
                }
            },
            'sect.mission.accept': {
                name: 'sect.mission.accept',
                description: 'Accept a sect mission for rewards',
                inputSchema: {
                    type: 'object',
                    properties: {
                        missionId: { type: 'string', description: 'Mission ID' }
                    },
                    required: ['missionId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V82 (lines 850-917, 68 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V82 = {
            'technique.library': {
                name: 'technique.library',
                description: 'Query technique library with all available techniques',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|learned|available|combat|cultivation' },
                        realm: { type: 'number', description: 'Player realm level to filter by' }
                    }
                }
            },
            'technique.learn': {
                name: 'technique.learn',
                description: 'Learn a new cultivation technique',
                inputSchema: {
                    type: 'object',
                    properties: {
                        techniqueId: { type: 'string', description: 'Technique ID to learn' },
                        autoAssign: { type: 'boolean', description: 'Auto-assign to equipped slot (default true)' }
                    },
                    required: ['techniqueId']
                }
            },
            'technique.forget': {
                name: 'technique.forget',
                description: 'Forget a learned technique to free slot',
                inputSchema: {
                    type: 'object',
                    properties: {
                        techniqueId: { type: 'string', description: 'Technique ID to forget' }
                    },
                    required: ['techniqueId']
                }
            },
            'technique.combo': {
                name: 'technique.combo',
                description: 'Query technique combo effects based on active techniques',
                inputSchema: {
                    type: 'object',
                    properties: {
                        comboType: { type: 'string', description: 'Combo type: attack|defense|buff|hybrid' }
                    }
                }
            },
            'skill.graph': {
                name: 'skill.graph',
                description: 'Get skill DAG graph structure with nodes and edges',
                inputSchema: {
                    type: 'object',
                    properties: {
                        viewMode: { type: 'string', description: 'View: full|active|locked|unlocked' }
                    }
                }
            },
            'skill.unlock': {
                name: 'skill.unlock',
                description: 'Unlock a skill node in the DAG',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: { type: 'string', description: 'Skill node ID to unlock' },
                        cost: { type: 'number', description: 'Spirit stones cost (auto-calculated if omitted)' }
                    },
                    required: ['nodeId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V83 (lines 919-981, 63 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V83 = {
            'tribulation.start': {
                name: 'tribulation.start',
                description: 'Start a tribulation based on current realm',
                inputSchema: {
                    type: 'object',
                    properties: {
                        realm: { type: 'number', description: 'Target realm for tribulation' }
                    }
                }
            },
            'tribulation.progress': {
                name: 'tribulation.progress',
                description: 'Get current tribulation progress',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'tribulation.lightning': {
                name: 'tribulation.lightning',
                description: 'Record a lightning strike during tribulation',
                inputSchema: {
                    type: 'object',
                    properties: {
                        damage: { type: 'number', description: 'Lightning damage taken' },
                        resisted: { type: 'boolean', description: 'Whether damage was resisted' }
                    },
                    required: ['damage']
                }
            },
            'tribulation.blessing': {
                name: 'tribulation.blessing',
                description: 'Receive tribulation blessing reward',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Blessing type: strength|spirit|cultivation|random' }
                    }
                }
            },
            'tribulation.record': {
                name: 'tribulation.record',
                description: 'Query tribulation history records',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|success|failed|latest' }
                    }
                }
            },
            'tribulation.talent_modify': {
                name: 'tribulation.talent_modify',
                description: 'Modify player talent after tribulation',
                inputSchema: {
                    type: 'object',
                    properties: {
                        talent: { type: 'string', description: 'New talent: normal|good|genius|immortal' }
                    },
                    required: ['talent']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V84 (lines 983-1052, 70 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V84 = {
            'artifact.forge': {
                name: 'artifact.forge',
                description: 'Forge a new artifact with materials',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tier: { type: 'string', description: 'Artifact tier: common|rare|epic|legendary' },
                        material: { type: 'string', description: 'Primary material used' }
                    },
                    required: ['tier']
                }
            },
            'artifact.upgrade': {
                name: 'artifact.upgrade',
                description: 'Upgrade an artifact to higher level',
                inputSchema: {
                    type: 'object',
                    properties: {
                        artifactId: { type: 'string', description: 'Artifact instance ID' },
                        targetLevel: { type: 'number', description: 'Target upgrade level (1-15)' }
                    },
                    required: ['artifactId']
                }
            },
            'artifact.attune': {
                name: 'artifact.attune',
                description: 'Check artifact attunement/affinity level',
                inputSchema: {
                    type: 'object',
                    properties: {
                        artifactId: { type: 'string', description: 'Artifact instance ID' }
                    },
                    required: ['artifactId']
                }
            },
            'artifact.bind': {
                name: 'artifact.bind',
                description: 'Bind artifact to player (ownership)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        artifactId: { type: 'string', description: 'Artifact instance ID' }
                    },
                    required: ['artifactId']
                }
            },
            'artifact.stats': {
                name: 'artifact.stats',
                description: 'Query detailed artifact statistics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|equipped|inventory|bound|unbound' }
                    }
                }
            },
            'artifact.transform': {
                name: 'artifact.transform',
                description: 'Transform artifact into higher tier form',
                inputSchema: {
                    type: 'object',
                    properties: {
                        artifactId: { type: 'string', description: 'Artifact instance ID' },
                        targetTier: { type: 'string', description: 'Target tier: common|rare|epic|legendary|mythic' }
                    },
                    required: ['artifactId', 'targetTier']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V85 (lines 1054-1122, 69 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V85 = {
            'pet.capture': {
                name: 'pet.capture',
                description: 'Capture a spirit beast with bait and trap',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Pet type: wolf/tiger/fox dragon phoenix turtle' },
                        bait: { type: 'string', description: 'Bait quality: low|medium|high|premium' }
                    },
                    required: ['type']
                }
            },
            'pet.list': {
                name: 'pet.list',
                description: 'List all captured spirit beasts',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|active|released' }
                    }
                }
            },
            'pet.feed': {
                name: 'pet.feed',
                description: 'Feed a spirit beast to increase intimacy',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: 'Pet instance ID' },
                        food: { type: 'string', description: 'Food type: basic|premium|super' }
                    },
                    required: ['petId']
                }
            },
            'pet.evolve': {
                name: 'pet.evolve',
                description: 'Evolve a spirit beast to higher form',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: 'Pet instance ID' },
                        targetForm: { type: 'string', description: 'Target form: adult|mutant|divine' }
                    },
                    required: ['petId']
                }
            },
            'pet.release': {
                name: 'pet.release',
                description: 'Release a spirit beast back to the wild',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: 'Pet instance ID' }
                    },
                    required: ['petId']
                }
            },
            'pet.stats': {
                name: 'pet.stats',
                description: 'Query detailed pet statistics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        petId: { type: 'string', description: 'Pet instance ID (omit for all stats)' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V86 (lines 1124-1191, 68 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V86 = {
            'alchemy.list_formulas': {
                name: 'alchemy.list_formulas',
                description: 'List all alchemy formulas by tier',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tier: { type: 'string', description: 'Filter by tier: all|basic|intermediate|advanced|rare' }
                    }
                }
            },
            'alchemy.collect_herbs': {
                name: 'alchemy.collect_herbs',
                description: 'Collect spirit herbs for alchemy',
                inputSchema: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', description: 'Location: forest|mountain|cave|swamp' },
                        quality: { type: 'string', description: 'Quality: low|medium|high|premium' }
                    },
                    required: ['location']
                }
            },
            'alchemy.refine': {
                name: 'alchemy.refine',
                description: 'Refine a pill using collected herbs',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formulaId: { type: 'string', description: 'Formula ID (e.g., qi_pill_basic)' },
                        herbSlot: { type: 'string', description: 'Herb slot: slot1|slot2|slot3' }
                    },
                    required: ['formulaId', 'herbSlot']
                }
            },
            'alchemy.consume': {
                name: 'alchemy.consume',
                description: 'Consume a pill for its effect',
                inputSchema: {
                    type: 'object',
                    properties: {
                        pillId: { type: 'string', description: 'Pill instance ID' }
                    },
                    required: ['pillId']
                }
            },
            'alchemy.pill_stats': {
                name: 'alchemy.pill_stats',
                description: 'Query pill inventory statistics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|consumed|inventory' }
                    }
                }
            },
            'alchemy.forget_formula': {
                name: 'alchemy.forget_formula',
                description: 'Forget a learned formula to free a formula slot',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formulaId: { type: 'string', description: 'Formula ID to forget' }
                    },
                    required: ['formulaId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V87 (lines 1194-1258, 65 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V87 = {
            'economy.income_stats': {
                name: 'economy.income_stats',
                description: 'Query player income statistics over time period',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: 'Period: day|week|month|all' }
                    }
                }
            },
            'economy.expense_stats': {
                name: 'economy.expense_stats',
                description: 'Query player expense statistics over time period',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', description: 'Period: day|week|month|all' }
                    }
                }
            },
            'economy.transfer': {
                name: 'economy.transfer',
                description: 'Transfer spirit stones to another player',
                inputSchema: {
                    type: 'object',
                    properties: {
                        targetName: { type: 'string', description: 'Target player name' },
                        amount: { type: 'number', description: 'Amount of spirit stones' }
                    },
                    required: ['targetName', 'amount']
                }
            },
            'realm.tribute': {
                name: 'realm.tribute',
                description: 'Pay tribute to the celestial realm for buffs',
                inputSchema: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', description: 'Amount of spirit stones to offer' }
                    },
                    required: ['amount']
                }
            },
            'heavenly_blessing': {
                name: 'heavenly_blessing',
                description: 'Receive heavenly blessing based on accumulated karma',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Blessing type: cultivation|combat|luck|realm' }
                    }
                }
            },
            'karma_point_query': {
                name: 'karma_point_query',
                description: 'Query karma points and recent karma history',
                inputSchema: {
                    type: 'object',
                    properties: {
                        limit: { type: 'number', description: 'Number of recent records to return' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V88 (lines 1261-1330, 70 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V88 = {
            'celestial.market.list': {
                name: 'celestial.market.list',
                description: 'List items available in the celestial market',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: 'Category: pills|artifacts|techniques|materials|all' }
                    }
                }
            },
            'celestial.market.buy': {
                name: 'celestial.market.buy',
                description: 'Purchase an item from the celestial market',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: 'Market item ID to purchase' },
                        quantity: { type: 'number', description: 'Quantity to buy' }
                    },
                    required: ['itemId']
                }
            },
            'celestial.market.sell': {
                name: 'celestial.market.sell',
                description: 'Sell an item to the celestial market',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: 'Player inventory item ID to sell' },
                        price: { type: 'number', description: 'Price per unit in spirit stones' }
                    },
                    required: ['itemId', 'price']
                }
            },
            'celestial.market.search': {
                name: 'celestial.market.search',
                description: 'Search celestial market for items by name keyword',
                inputSchema: {
                    type: 'object',
                    properties: {
                        keyword: { type: 'string', description: 'Search keyword' }
                    },
                    required: ['keyword']
                }
            },
            'serendipity.trigger': {
                name: 'serendipity.trigger',
                description: 'Manually trigger a serendipity event for the player',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Serendipity type: treasure|encounter|blessing|danger|all' }
                    }
                }
            },
            'serendipity.karma_update': {
                name: 'serendipity.karma_update',
                description: 'Record karma changes from serendipity events',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: 'Serendipity event ID' },
                        karmaDelta: { type: 'number', description: 'Karma change amount (+/-)' },
                        reason: { type: 'string', description: 'Reason for karma change' }
                    },
                    required: ['eventId', 'karmaDelta']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V89 (lines 1333-1400, 68 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V89 = {
            'arena.leaderboard': {
                name: 'arena.leaderboard',
                description: 'Get the celestial arena leaderboard ranking',
                inputSchema: {
                    type: 'object',
                    properties: {
                        season: { type: 'string', description: 'Season ID or current season' },
                        limit: { type: 'number', description: 'Number of top players to return' }
                    }
                }
            },
            'arena.match_history': {
                name: 'arena.match_history',
                description: 'Query player arena match history',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerId: { type: 'string', description: 'Player ID to query (default: current player)' },
                        season: { type: 'string', description: 'Season ID' },
                        limit: { type: 'number', description: 'Number of recent matches' }
                    }
                }
            },
            'sect.war_report': {
                name: 'sect.war_report',
                description: 'Get detailed war report for sect battles',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reportId: { type: 'string', description: 'War report ID' },
                        sectId: { type: 'string', description: 'Sect ID' }
                    }
                }
            },
            'sect.battle_stats': {
                name: 'sect.battle_stats',
                description: 'Query overall sect battle statistics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sectId: { type: 'string', description: 'Sect ID (default: player sect)' },
                        statType: { type: 'string', description: 'Stat type: wins|losses|draws|all' }
                    }
                }
            },
            'celestial.ladder_rank': {
                name: 'celestial.ladder_rank',
                description: 'Get player celestial ladder ranking and rating',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerId: { type: 'string', description: 'Player ID (default: current player)' }
                    }
                }
            },
            'celestial.ladder_fight': {
                name: 'celestial.ladder_fight',
                description: 'Challenge a rival on the celestial ladder',
                inputSchema: {
                    type: 'object',
                    properties: {
                        targetPlayerId: { type: 'string', description: 'Target player ID to challenge' },
                        stake: { type: 'number', description: 'Spirit stone stake for the fight' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V90 (lines 1403-1465, 63 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V90 = {
            'star.map': {
                name: 'star.map',
                description: 'Get the celestial star map showing constellation positions',
                inputSchema: {
                    type: 'object',
                    properties: {
                        region: { type: 'string', description: 'Region: east|west|north|south|all' }
                    }
                }
            },
            'star.resonance': {
                name: 'star.resonance',
                description: 'Calculate star constellation resonance bonus for the player',
                inputSchema: {
                    type: 'object',
                    properties: {
                        constellation: { type: 'string', description: 'Constellation name' }
                    }
                }
            },
            'spirit_root.evolve': {
                name: 'spirit.root.evolve',
                description: 'Evolve the player spirit root to a higher tier',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rootType: { type: 'string', description: 'Spirit root type: metal|wood|water|fire|earth|all' }
                    }
                }
            },
            'spirit.root.query': {
                name: 'spirit.root.query',
                description: 'Query current spirit root status and evolution progress',
                inputSchema: {
                    type: 'object',
                    properties: {
                        detail: { type: 'boolean', description: 'Include detailed attributes' }
                    }
                }
            },
            'explore.location': {
                name: 'explore.location',
                description: 'Explore a location for resources and encounters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', description: 'Location: mountain|forest|cave|abyss|celestial' },
                        depth: { type: 'number', description: 'Exploration depth level (1-5)' }
                    }
                }
            },
            'explore.survey': {
                name: 'explore.survey',
                description: 'Survey a region for exploration opportunities',
                inputSchema: {
                    type: 'object',
                    properties: {
                        region: { type: 'string', description: 'Region: east|west|north|south' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V91 (lines 1470-1542, 73 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V91 = {
            'budget.query': {
                name: 'budget.query',
                description: 'Query current budget status for a provider or all providers',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID (e.g. minimax). Omit for all providers.' }
                    }
                }
            },
            'budget.configure': {
                name: 'budget.configure',
                description: 'Update budget limits and warning thresholds for a provider',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID (e.g. minimax)' },
                        dailyLimit: { type: 'number', description: 'Daily token budget limit (points)' },
                        monthlyLimit: { type: 'number', description: 'Monthly token budget limit (points)' },
                        warningThreshold: { type: 'number', description: 'Warning threshold (0.0-1.0, e.g. 0.8 for 80%)' },
                        fallbackToLocal: { type: 'boolean', description: 'Fallback to local rules when budget exceeded' }
                    },
                    required: ['provider']
                }
            },
            'budget.reset': {
                name: 'budget.reset',
                description: 'Reset daily/monthly budget counters for a provider',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID (e.g. minimax)' },
                        scope: { type: 'string', description: 'Reset scope: daily|monthly|both' }
                    },
                    required: ['provider', 'scope']
                }
            },
            'budget.stats': {
                name: 'budget.stats',
                description: 'Get detailed budget statistics and call history',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID (e.g. minimax). Omit for all.' },
                        days: { type: 'number', description: 'Number of days of history (default 7, max 30)' }
                    }
                }
            },
            'budget.alerts': {
                name: 'budget.alerts',
                description: 'Get active budget warnings and alerts',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID. Omit for all.' }
                    }
                }
            },
            'budget.rate_limit': {
                name: 'budget.rate_limit',
                description: 'Get or set rate limiting configuration for a provider',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID (e.g. minimax)' },
                        maxCallsPerMinute: { type: 'number', description: 'Max API calls per minute (0 = unlimited)' },
                        maxTokensPerDay: { type: 'number', description: 'Max tokens per day (0 = unlimited)' }
                    },
                    required: ['provider']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V92 (lines 1545-1607, 63 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V92 = {
            'secret_realm.list': {
                name: 'secret_realm.list',
                description: 'List all secret realms available in the current cycle',
                inputSchema: {
                    type: 'object',
                    properties: {
                        region: { type: 'string', description: 'Filter by region: east|west|north|south|all (default: all)' }
                    }
                }
            },
            'secret_realm.enter': {
                name: 'secret_realm.enter',
                description: 'Enter and explore a secret realm using a dungeon token',
                inputSchema: {
                    type: 'object',
                    properties: {
                        realmId: { type: 'string', description: 'Secret realm ID (e.g. jade_palace, dragon_tomb)' }
                    },
                    required: ['realmId']
                }
            },
            'secret_realm.progress': {
                name: 'secret_realm.progress',
                description: 'Get current exploration progress in active secret realm',
                inputSchema: {
                    type: 'object',
                    properties: {
                        realmId: { type: 'string', description: 'Secret realm ID (omit for active realm)' }
                    }
                }
            },
            'secret_realm.encounter': {
                name: 'secret_realm.encounter',
                description: 'Resolve a random encounter within a secret realm',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', description: 'Action: engage|avoid|investigate|retreat' }
                    },
                    required: ['action']
                }
            },
            'secret_realm.claim': {
                name: 'secret_realm.claim',
                description: 'Claim exploration rewards from a completed secret realm',
                inputSchema: {
                    type: 'object',
                    properties: {
                        realmId: { type: 'string', description: 'Secret realm ID to claim' }
                    },
                    required: ['realmId']
                }
            },
            'dungeon_token.status': {
                name: 'dungeon_token.status',
                description: 'Query dungeon token count and next reset timer',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V93 (lines 1611-1685, 75 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V93 = {
            'mcp_bridge.status': {
                name: 'mcp_bridge.status',
                description: 'Query MCP Agent Bridge status, registered agents, active sessions, and server health',
                inputSchema: {
                    type: 'object',
                    properties: {
                        detail: { type: 'string', description: 'Detail level: summary|full|agents (default: summary)' }
                    }
                }
            },
            'mcp_bridge.send_message': {
                name: 'mcp_bridge.send_message',
                description: 'Send message to NPC via external agent bridge (nanobot-style async routing)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        agentId: { type: 'string', description: 'External agent ID sending the message' },
                        npcRole: { type: 'string', description: 'NPC role: master|monster|merchant|fellow' },
                        message: { type: 'string', description: 'Message content to send' },
                        context: { type: 'string', description: 'Optional context: cultivation|battle|trade|social' }
                    },
                    required: ['agentId', 'npcRole', 'message']
                }
            },
            'mcp_bridge.trigger_encounter': {
                name: 'mcp_bridge.trigger_encounter',
                description: 'Trigger a random cultivation encounter from external agent signal (serendipity/ruflo hook system)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        agentId: { type: 'string', description: 'External agent triggering the encounter' },
                        intensity: { type: 'string', description: 'Encounter intensity: low|medium|high|catastrophic (default: medium)' },
                        type: { type: 'string', description: 'Encounter type: serendipity|tribulation|monster|treasure|all (default: all)' }
                    },
                    required: ['agentId']
                }
            },
            'mcp_bridge.query_realm': {
                name: 'mcp_bridge.query_realm',
                description: 'Query current realm, stage, cultivation progress, and cultivation path (generic-agent L2 memory)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fields: { type: 'array', description: 'Fields to query: realm|stage|cultivation|progress|all (default: all)', items: { type: 'string' } }
                    }
                }
            },
            'mcp_bridge.register_agent': {
                name: 'mcp_bridge.register_agent',
                description: 'Register external agent identity with MCP bridge (nanobot-style channel auto-discovery)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        agentId: { type: 'string', description: 'Unique agent identifier' },
                        agentName: { type: 'string', description: 'Human-readable agent name' },
                        capabilities: { type: 'array', description: 'Agent capabilities: tool_call|memory|reasoning|execution', items: { type: 'string' } },
                        trustLevel: { type: 'string', description: 'Trust level: L1(local)|L2(team)|L3(org)|L4(public) (default: L2)' }
                    },
                    required: ['agentId', 'agentName']
                }
            },
            'mcp_bridge.sync_state': {
                name: 'mcp_bridge.sync_state',
                description: 'Bidirectional state sync — thunderbolt-style dual path: full dump or delta stream',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mode: { type: 'string', description: 'Sync mode: full|delta (default: full)' },
                        since: { type: 'number', description: 'Timestamp for delta sync (Unix ms)' },
                        include: { type: 'array', description: 'State sections to include: cultivation|npc|inventory|achievements|all', items: { type: 'string' } }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V94 (lines 1699-1773, 75 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V94 = {
            'ai_budget.query': {
                name: 'ai_budget.query',
                description: 'Query current AI API key budget and usage stats for LLM providers (minimax/openai/anthropic/etc.)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID: minimax|openai|anthropic|all (default: all)' }
                    }
                }
            },
            'ai_budget.configure': {
                name: 'ai_budget.configure',
                description: 'Configure budget limits per AI provider (daily/monthly limits, warning thresholds, rate limits)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID: minimax|openai|anthropic|grok (required)' },
                        dailyLimit: { type: 'number', description: 'Daily spend limit in credits (0 = unlimited)' },
                        monthlyLimit: { type: 'number', description: 'Monthly spend limit in credits (0 = unlimited)' },
                        warningThreshold: { type: 'number', description: 'Warning threshold 0-1 (default: 0.8)' },
                        fallbackToLocal: { type: 'boolean', description: 'Fallback to local model when budget exhausted' },
                        maxCallsPerMinute: { type: 'number', description: 'Rate limit: max calls per minute' },
                        maxTokensPerDay: { type: 'number', description: 'Rate limit: max tokens per day' }
                    },
                    required: ['provider']
                }
            },
            'ai_budget.reset': {
                name: 'ai_budget.reset',
                description: 'Reset usage counters for a specific AI provider (daily/monthly/both)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID (required)' },
                        scope: { type: 'string', description: 'Reset scope: daily|monthly|both (default: both)' }
                    },
                    required: ['provider']
                }
            },
            'ai_budget.stats': {
                name: 'ai_budget.stats',
                description: 'Get detailed usage statistics per AI model/endpoint (calls, tokens, cost breakdown)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID: minimax|openai|all (default: all)' },
                        days: { type: 'number', description: 'Number of days to analyze: 1-30 (default: 7)' }
                    }
                }
            },
            'ai_budget.alerts': {
                name: 'ai_budget.alerts',
                description: 'Query or set budget alert thresholds for AI providers',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID: minimax|openai|all (default: all)' },
                        threshold: { type: 'number', description: 'Set warning threshold (0-1)' }
                    }
                }
            },
            'ai_budget.rate_limit': {
                name: 'ai_budget.rate_limit',
                description: 'Query and configure rate limits per AI provider (calls/minute, tokens/day)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        provider: { type: 'string', description: 'Provider ID: minimax|openai|anthropic|all (default: all)' },
                        maxCallsPerMinute: { type: 'number', description: 'Set max calls per minute' },
                        maxTokensPerDay: { type: 'number', description: 'Set max tokens per day' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V95 (lines 1777-1894, 118 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V95 = {
            'quest.create': {
                name: 'quest.create',
                description: 'Create a DAG-based quest with parallel nodes, hooks and budget allocation',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: 'Unique quest identifier' },
                        name: { type: 'string', description: 'Quest name' },
                        nodes: {
                            type: 'array',
                            description: 'DAG nodes with id, type, requires[], npcAssignment[]',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    type: { type: 'string' },
                                    requires: { type: 'array', items: { type: 'string' } },
                                    npcAssignment: { type: 'array', items: { type: 'string' } },
                                    budget: { type: 'number' }
                                },
                                required: ['id', 'type']
                            }
                        },
                        budget: { type: 'number', description: 'Total budget allocation' },
                        hooks: {
                            type: 'array',
                            description: 'Hook configurations: [{event, script}]',
                            items: {
                                type: 'object',
                                properties: {
                                    event: { type: 'string' },
                                    script: { type: 'string' }
                                }
                            }
                        }
                    },
                    required: ['questId', 'nodes']
                }
            },
            'quest.execute': {
                name: 'quest.execute',
                description: 'Execute a quest DAG with maxConcurrent concurrency limit. Returns: running/completed/paused/budget_exceeded',
                inputSchema: {
                    type: 'object',
                    properties: {
                        questId: { type: 'string', description: 'Quest to execute' },
                        context: { type: 'object', description: 'Execution context variables' },
                        maxConcurrent: { type: 'number', description: 'Max parallel nodes (default: 3)' }
                    },
                    required: ['questId']
                }
            },
            'npc.spawn': {
                name: 'npc.spawn',
                description: 'Spawn an NPC with five-layer memory system (L0-L4)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        npcId: { type: 'string', description: 'NPC unique identifier' },
                        template: { type: 'string', description: 'NPC template: guard/explorer/combat/support' },
                        mission: { type: 'object', description: 'Initial mission parameters' },
                        memoryLayers: {
                            type: 'object',
                            description: 'Pre-configured L0-L4 memory',
                            properties: {
                                L0: { type: 'array', description: 'Meta rules' },
                                L1: { type: 'array', description: 'Insight index' },
                                L2: { type: 'array', description: 'Global facts' },
                                L3: { type: 'array', description: 'Task skills' },
                                L4: { type: 'array', description: 'Session archive' }
                            }
                        }
                    },
                    required: ['npcId', 'template']
                }
            },
            'npc.memory_update': {
                name: 'npc.memory_update',
                description: 'Update NPC five-layer memory. Supports crystallize to convert execution path to reusable SOP',
                inputSchema: {
                    type: 'object',
                    properties: {
                        npcId: { type: 'string', description: 'NPC identifier' },
                        layer: { type: 'string', description: 'Layer: L0|L1|L2|L3|L4' },
                        content: { type: 'string', description: 'Memory content to add' },
                        tags: { type: 'array', description: 'Index tags for L1', items: { type: 'string' } },
                        crystallize: { type: 'boolean', description: 'Convert to SOP skill' }
                    },
                    required: ['npcId', 'layer', 'content']
                }
            },
            'hook.register': {
                name: 'hook.register',
                description: 'Register a quest event hook (pre_quest/post_quest/npc_spawn/npc_despawn/loop_detected/budget_exceeded)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        hookName: { type: 'string', description: 'Hook event name' },
                        callback: { type: 'string', description: 'Callback function name or script' },
                        priority: { type: 'number', description: 'Execution priority (higher first, default: 50)' },
                        async: { type: 'boolean', description: 'Async execution (default: true)' }
                    },
                    required: ['hookName', 'callback']
                }
            },
            'budget.query': {
                name: 'budget.query',
                description: 'Query quest execution budget status (total/used/available/rateLimited)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        scope: { type: 'string', description: 'Scope: quest|npc|global' },
                        entityId: { type: 'string', description: 'Entity ID for entity-specific budget' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V96 (lines 1897-2018, 122 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V96 = {
            'quest.chain.create': {
                name: 'quest.chain.create',
                description: 'Create NPC collaboration quest chain with parallel DAG execution and multi-NPC coordination',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: 'Unique chain identifier' },
                        name: { type: 'string', description: 'Chain name' },
                        npcs: {
                            type: 'array',
                            description: 'NPC participants with roles',
                            items: {
                                type: 'object',
                                properties: {
                                    npcId: { type: 'string' },
                                    role: { type: 'string' },
                                    skills: { type: 'array', items: { type: 'string' } }
                                },
                                required: ['npcId', 'role']
                            }
                        },
                        nodes: {
                            type: 'array',
                            description: 'DAG nodes with parallel execution support',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    type: { type: 'string' },
                                    requires: { type: 'array', items: { type: 'string' } },
                                    assignedNpcs: { type: 'array', items: { type: 'string' } },
                                    budget: { type: 'number' }
                                },
                                required: ['id', 'type']
                            }
                        },
                        hooks: {
                            type: 'array',
                            description: 'Hook configurations: [{event, script}]',
                            items: {
                                type: 'object',
                                properties: {
                                    event: { type: 'string' },
                                    script: { type: 'string' }
                                }
                            }
                        }
                    },
                    required: ['chainId', 'npcs', 'nodes']
                }
            },
            'quest.chain.execute': {
                name: 'quest.chain.execute',
                description: 'Execute NPC collaboration quest chain with state synchronization and budget awareness',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: 'Chain to execute' },
                        context: { type: 'object', description: 'Execution context variables' },
                        maxConcurrent: { type: 'number', description: 'Max parallel nodes (default: 3)' },
                        syncMode: { type: 'string', description: 'Sync mode: strict|relaxed (default: relaxed)' }
                    },
                    required: ['chainId']
                }
            },
            'npc.skill.crystallize': {
                name: 'npc.skill.crystallize',
                description: 'Crystallize NPC execution experience into reusable SOP skill that other NPCs can learn',
                inputSchema: {
                    type: 'object',
                    properties: {
                        npcId: { type: 'string', description: 'NPC source' },
                        experienceData: { type: 'object', description: 'Experience to crystallize' },
                        layer: { type: 'string', description: 'Memory layer: L3 (task skills)' },
                        tags: { type: 'array', description: 'Index tags for L1 retrieval', items: { type: 'string' } },
                        skillName: { type: 'string', description: 'Name for the crystallized skill' }
                    },
                    required: ['npcId', 'experienceData', 'layer', 'skillName']
                }
            },
            'npc.skill.invoke': {
                name: 'npc.skill.invoke',
                description: 'Invoke crystallized NPC SOP skill for execution',
                inputSchema: {
                    type: 'object',
                    properties: {
                        npcId: { type: 'string', description: 'NPC invoking the skill' },
                        skillId: { type: 'string', description: 'Skill ID to invoke' },
                        params: { type: 'object', description: 'Skill parameters' },
                        budget: { type: 'number', description: 'Budget allocation for skill execution' }
                    },
                    required: ['npcId', 'skillId']
                }
            },
            'hook.trigger': {
                name: 'hook.trigger',
                description: 'Manually trigger a quest event hook with context',
                inputSchema: {
                    type: 'object',
                    properties: {
                        event: { type: 'string', description: 'Hook event name' },
                        context: { type: 'object', description: 'Hook context data' },
                        source: { type: 'string', description: 'Source identifier' }
                    },
                    required: ['event']
                }
            },
            'quest.state.query': {
                name: 'quest.state.query',
                description: 'Query quest chain execution state with budget information and NPC collaboration status',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: 'Chain to query' },
                        includeNpcs: { type: 'boolean', description: 'Include NPC collaboration status' },
                        includeBudget: { type: 'boolean', description: 'Include budget details' }
                    },
                    required: ['chainId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V97 (lines 2021-2095, 75 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V97 = {
            'market.skills.list': {
                name: 'market.skills.list',
                description: 'List all crystallized SOP skills available for purchase in the NPC Skill Market',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter by tag or rarity: common|uncommon|rare|epic|legendary' },
                        sortBy: { type: 'string', description: 'Sort order: price_asc|price_desc|rarity|recent' }
                    }
                }
            },
            'market.skills.buy': {
                name: 'market.skills.buy',
                description: 'Purchase a crystallized SOP skill from the market into player skill library',
                inputSchema: {
                    type: 'object',
                    properties: {
                        skillId: { type: 'string', description: 'Skill ID to purchase' },
                        buyerNpcId: { type: 'string', description: 'NPC acting as buyer (optional, defaults to player)' }
                    },
                    required: ['skillId']
                }
            },
            'market.skills.sell': {
                name: 'market.skills.sell',
                description: 'List a crystallized NPC skill on the market for sale',
                inputSchema: {
                    type: 'object',
                    properties: {
                        skillId: { type: 'string', description: 'Crystallized skill ID to sell' },
                        price: { type: 'number', description: 'Listing price in spirit stones' },
                        sellerNpcId: { type: 'string', description: 'NPC selling the skill' }
                    },
                    required: ['skillId', 'price']
                }
            },
            'skill.learn': {
                name: 'skill.learn',
                description: 'Player learns a purchased SOP skill, gaining the ability to invoke it',
                inputSchema: {
                    type: 'object',
                    properties: {
                        skillId: { type: 'string', description: 'Purchased skill ID to learn' },
                        playerId: { type: 'string', description: 'Player learning the skill' }
                    },
                    required: ['skillId']
                }
            },
            'skill.invoke': {
                name: 'skill.invoke',
                description: 'Player invokes a learned SOP skill for execution (player-side, different from npc.skill.invoke)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        skillId: { type: 'string', description: 'Learned skill ID to invoke' },
                        playerId: { type: 'string', description: 'Player invoking the skill' },
                        params: { type: 'object', description: 'Skill execution parameters' }
                    },
                    required: ['skillId', 'playerId']
                }
            },
            'sect.war.preview': {
                name: 'sect.war.preview',
                description: 'Preview cross-server sect war opponent info and skill synergies',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sectId: { type: 'string', description: 'Sect to preview' },
                        warType: { type: 'string', description: 'War type: skirmish|territory|elimination' }
                    },
                    required: ['sectId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V98 (lines 2098-2172, 75 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V98 = {
            'sect.war.register': {
                name: 'sect.war.register',
                description: 'Register a team (3-5 players) for cross-server sect war',
                inputSchema: {
                    type: 'object',
                    properties: {
                        teamName: { type: 'string', description: 'Team name' },
                        playerIds: { type: 'array', items: { type: 'string' }, description: 'Player IDs (3-5 players)', minItems: 3, maxItems: 5 },
                        sectId: { type: 'string', description: 'Player sect ID' },
                        warType: { type: 'string', description: 'War type: skirmish|territory|elimination' }
                    },
                    required: ['teamName', 'playerIds', 'sectId']
                }
            },
            'sect.war.start': {
                name: 'sect.war.start',
                description: 'Start cross-server sect war, DAG-based multi-agent action execution',
                inputSchema: {
                    type: 'object',
                    properties: {
                        matchId: { type: 'string', description: 'Match ID from registration' },
                        actions: { type: 'array', description: 'Array of {playerId, skillId, target} actions in DAG order' }
                    },
                    required: ['matchId']
                }
            },
            'sect.war.skill.combo': {
                name: 'sect.war.skill.combo',
                description: 'Detect and trigger skill combo effects based on adjacent positions and element properties',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerId: { type: 'string', description: 'Player triggering combo' },
                        skillId: { type: 'string', description: 'Skill being invoked' },
                        adjacentPlayerIds: { type: 'array', items: { type: 'string' }, description: 'Adjacent team members for combo' }
                    },
                    required: ['playerId', 'skillId']
                }
            },
            'sect.war.status': {
                name: 'sect.war.status',
                description: 'Real-time query of battle status including action queues for both teams',
                inputSchema: {
                    type: 'object',
                    properties: {
                        matchId: { type: 'string', description: 'Match ID' }
                    },
                    required: ['matchId']
                }
            },
            'sect.war.result': {
                name: 'sect.war.result',
                description: 'Get battle result, winner, and damage statistics after match ends',
                inputSchema: {
                    type: 'object',
                    properties: {
                        matchId: { type: 'string', description: 'Match ID' }
                    },
                    required: ['matchId']
                }
            },
            'sect.war.reward': {
                name: 'sect.war.reward',
                description: 'Distribute war loot based on contribution scores after battle ends',
                inputSchema: {
                    type: 'object',
                    properties: {
                        matchId: { type: 'string', description: 'Match ID' },
                        contributionMode: { type: 'string', description: 'Distribution mode: equal|contribution|rank' }
                    },
                    required: ['matchId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V99 (lines 2175-2255, 81 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V99 = {
            'task.chain.create': {
                name: 'task.chain.create',
                description: 'Create a new DAG task chain (天道编辑器-创建任务链)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Task chain name' },
                        description: { type: 'string', description: 'Chain description' },
                        priority: { type: 'string', description: 'Priority: low|normal|high|critical', default: 'normal' }
                    },
                    required: ['name']
                }
            },
            'task.chain.add': {
                name: 'task.chain.add',
                description: 'Add task nodes to an existing DAG chain (天道编辑器-添加节点)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: 'Chain ID' },
                        taskId: { type: 'string', description: 'Unique task ID' },
                        taskType: { type: 'string', description: 'Task type: action|condition|transform|merge' },
                        payload: { type: 'object', description: 'Task payload data' },
                        position: { type: 'object', description: 'Visual position {x, y}' }
                    },
                    required: ['chainId', 'taskId', 'taskType']
                }
            },
            'task.chain.link': {
                name: 'task.chain.link',
                description: 'Create dependencies between tasks in a DAG chain (天道编辑器-链接依赖)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: 'Chain ID' },
                        fromTaskId: { type: 'string', description: 'Source task ID' },
                        toTaskId: { type: 'string', description: 'Target task ID (dependent on source)' },
                        condition: { type: 'string', description: 'Link condition: always|success|failure', default: 'success' }
                    },
                    required: ['chainId', 'fromTaskId', 'toTaskId']
                }
            },
            'task.chain.execute': {
                name: 'task.chain.execute',
                description: 'Execute a DAG task chain with topological sort (天道编辑器-执行链)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: 'Chain ID to execute' },
                        context: { type: 'object', description: 'Execution context data' },
                        parallelMode: { type: 'boolean', description: 'Enable parallel execution for independent tasks', default: true }
                    },
                    required: ['chainId']
                }
            },
            'task.chain.status': {
                name: 'task.chain.status',
                description: 'Query real-time execution status of a DAG chain (天道编辑器-状态监控)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: 'Chain ID' },
                        includeSubtasks: { type: 'boolean', description: 'Include detailed subtask status', default: true }
                    },
                    required: ['chainId']
                }
            },
            'task.chain.result': {
                name: 'task.chain.result',
                description: 'Get execution results after chain completion (天道编辑器-结果收集)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'string', description: 'Chain ID' },
                        format: { type: 'string', description: 'Result format: summary|detailed|json', default: 'summary' }
                    },
                    required: ['chainId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V100 (lines 2258-2326, 69 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V100 = {
            'era.info': {
                name: 'era.info',
                description: 'Get current celestial era information (仙界纪元-当前纪元信息)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        detail: { type: 'boolean', description: 'Include detailed phase effects', default: false }
                    }
                }
            },
            'era.enter': {
                name: 'era.enter',
                description: 'Enter/focus on a specific era (仙界纪元-进入纪元)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eraId: { type: 'number', description: 'Era ID to enter (1-based)' },
                        mode: { type: 'string', description: 'Entry mode: observe|participate|dominate', default: 'observe' }
                    },
                    required: ['eraId']
                }
            },
            'era.event.trigger': {
                name: 'era.event.trigger',
                description: 'Trigger a celestial era event (仙界纪元-触发纪元事件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventType: { type: 'string', description: 'Event type: heaven_shake|dragon_rise|spirit_storm|blood_moon|star_fall' },
                        intensity: { type: 'number', description: 'Event intensity 1-10', default: 5 }
                    },
                    required: ['eventType']
                }
            },
            'era.cycle.advance': {
                name: 'era.cycle.advance',
                description: 'Advance world cycle to next phase (仙界纪元-推进纪元周期)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        steps: { type: 'number', description: 'Number of cycle steps to advance', default: 1 }
                    }
                }
            },
            'era.rankings': {
                name: 'era.rankings',
                description: 'Get current era rankings (仙界纪元-纪元排行榜)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: 'Ranking category: power|cultivation|combat|wealth', default: 'power' },
                        limit: { type: 'number', description: 'Number of entries to return', default: 10 }
                    }
                }
            },
            'era.reward.claim': {
                name: 'era.reward.claim',
                description: 'Claim rewards from era milestones (仙界纪元-领取纪元奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        milestoneId: { type: 'string', description: 'Milestone ID to claim' },
                        eraId: { type: 'number', description: 'Era ID for milestone' }
                    },
                    required: ['milestoneId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V101 (lines 2329-2403, 75 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V101 = {
            'alliance.create': {
                name: 'alliance.create',
                description: 'Create a new alliance/guild (仙盟-创建仙盟)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Alliance name' },
                        tag: { type: 'string', description: 'Alliance tag (3-5 characters)', maxLength: 5 },
                        level: { type: 'number', description: 'Alliance level', default: 1 }
                    },
                    required: ['name']
                }
            },
            'alliance.join': {
                name: 'alliance.join',
                description: 'Join an existing alliance (仙盟-加入仙盟)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        allianceId: { type: 'string', description: 'Alliance ID to join' },
                        autoApprove: { type: 'boolean', description: 'Auto-approve if requirements met', default: false }
                    },
                    required: ['allianceId']
                }
            },
            'alliance.contribute': {
                name: 'alliance.contribute',
                description: 'Contribute resources to alliance (仙盟-贡献资源)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Contribution type: spirit_stones|resources|cultivation', enum: ['spirit_stones', 'resources', 'cultivation'] },
                        amount: { type: 'number', description: 'Amount to contribute' }
                    },
                    required: ['type', 'amount']
                }
            },
            'alliance.territory.claim': {
                name: 'alliance.territory.claim',
                description: 'Claim or battle for territory (仙盟-争夺领地)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        territoryId: { type: 'string', description: 'Territory ID to claim' },
                        battleMode: { type: 'boolean', description: 'Use battle to claim', default: false }
                    },
                    required: ['territoryId']
                }
            },
            'alliance.skill.unlock': {
                name: 'alliance.skill.unlock',
                description: 'Unlock alliance skills (仙盟-解锁仙盟技能)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        skillId: { type: 'string', description: 'Skill ID to unlock' },
                        useContributionPoints: { type: 'boolean', description: 'Use contribution points', default: true }
                    },
                    required: ['skillId']
                }
            },
            'alliance.members.list': {
                name: 'alliance.members.list',
                description: 'List alliance members (仙盟-成员列表)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        allianceId: { type: 'string', description: 'Alliance ID (current player if not specified)' },
                        role: { type: 'string', description: 'Filter by role: leader|elder|member', enum: ['leader', 'elder', 'member'] },
                        limit: { type: 'number', description: 'Number of members to return', default: 50 }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V102 (lines 2406-2475, 70 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V102 = {
            'destiny.trail': {
                name: 'destiny.trail',
                description: 'Query character destiny trail across past lives (天命轮回-查询命运轨迹)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        detail: { type: 'boolean', description: 'Include detailed karmic records', default: false }
                    }
                }
            },
            'reincarnation.mark': {
                name: 'reincarnation.mark',
                description: 'Record karma imprint for current life affecting talents (天命轮回-记录轮回印记)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: 'Karma type: good|neutral|bad', enum: ['good', 'neutral', 'bad'] },
                        cause: { type: 'string', description: 'Cause description' },
                        effect: { type: 'string', description: 'Effect on talent' }
                    },
                    required: ['type', 'cause']
                }
            },
            'karma.settle': {
                name: 'karma.settle',
                description: 'Settle current life karma upon ascension, convert to next life talents (天命轮回-因果结算)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        preview: { type: 'boolean', description: 'Preview settlement without committing', default: false }
                    }
                }
            },
            'court.open': {
                name: 'court.open',
                description: 'Open celestial arbitration court for cross-server disputes (仙界仲裁庭-开启仲裁庭)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        courtType: { type: 'string', description: 'Court type: karmic|territorial|trade|alliance', default: 'karmic' }
                    }
                }
            },
            'court.appeal': {
                name: 'court.appeal',
                description: 'Submit arbitration appeal, costs spirit stones (仙界仲裁庭-提交仲裁申请)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        defendantId: { type: 'string', description: 'Defendant player ID' },
                        reason: { type: 'string', description: 'Appeal reason' },
                        evidence: { type: 'array', description: 'Evidence items', items: { type: 'string' } }
                    },
                    required: ['defendantId', 'reason']
                }
            },
            'court.judge': {
                name: 'court.judge',
                description: 'Court judges based on evidence and karma (仙界仲裁庭-仲裁裁决)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        caseId: { type: 'string', description: 'Case ID to judge' },
                        verdict: { type: 'string', description: 'Verdict: plaintiff|defendant|dismiss', enum: ['plaintiff', 'defendant', 'dismiss'] }
                    },
                    required: ['caseId', 'verdict']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V103 (lines 2478-2542, 65 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V103 = {
            'heaven.archive.open': {
                name: 'heaven.archive.open',
                description: 'Open the Celestial Archive (天机阁) to access fate knowledge, costs spirit stones (仙界天机阁-开启天机阁)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tier: { type: 'integer', description: 'Archive tier (1-3), higher tier reveals more fate secrets', minimum: 1, maximum: 3, default: 1 }
                    }
                }
            },
            'fate.query': {
                name: 'fate.query',
                description: 'Query character fate information including fate types, levels, and effects (命格系统-查询命格信息)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fateType: { type: 'string', description: 'Specific fate type to query, or "all" for all fates', default: 'all' }
                    }
                }
            },
            'fate.activate': {
                name: 'fate.activate',
                description: 'Activate a fate slot, consuming resources and granting passive effects (命格系统-激活命格)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fateType: { type: 'string', description: 'Fate type to activate: phoenix|dragon|tortoise|grimlock|celestial|shadow' },
                        slot: { type: 'integer', description: 'Fate slot index (0-2), if not specified, auto-selects first empty slot', minimum: 0, maximum: 2 }
                    },
                    required: ['fateType']
                }
            },
            'heaven.augur': {
                name: 'heaven.augur',
                description: 'Consume spirit energy to divine heavenly secrets, gaining random event hints (天机阁-天机推演)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        intensity: { type: 'string', description: 'Augury intensity: low|medium|high', default: 'medium' }
                    }
                }
            },
            'fate.upgrade': {
                name: 'fate.upgrade',
                description: 'Upgrade an already activated fate to enhance its effects (命格系统-命格升级)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slot: { type: 'integer', description: 'Fate slot index to upgrade (0-2)', minimum: 0, maximum: 2 }
                    },
                    required: ['slot']
                }
            },
            'fate.resonance': {
                name: 'fate.resonance',
                description: 'Trigger resonance between multiple fates to activate combination effects (命格系统-命格共鸣)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        force: { type: 'boolean', description: 'Force resonance even if combination requirements not met', default: false }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V104 (lines 2545-2606, 62 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V104 = {
            'reincarnation.pool.open': {
                name: 'reincarnation.pool.open',
                description: 'Open the Celestial Reincarnation Pool (仙界轮回池), costs spirit stones (轮回池系统-开启轮回池)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tier: { type: 'integer', description: 'Pool tier (1-3), higher tier provides better purification effects', minimum: 1, maximum: 3, default: 1 }
                    }
                }
            },
            'reincarnation.pool.bathe': {
                name: 'reincarnation.pool.bathe',
                description: 'Bathe in the reincarnation pool to purify karma and gain attribute bonuses (轮回池系统-浸泡轮回池)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        duration: { type: 'integer', description: 'Bathing duration in hours (1-24)', minimum: 1, maximum: 24, default: 1 }
                    }
                }
            },
            'reincarnation.fruit.query': {
                name: 'reincarnation.fruit.query',
                description: 'Query reincarnation fruit inventory and effects (轮回果系统-查询轮回果)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fruitId: { type: 'string', description: 'Specific fruit ID to query, or "all" for all fruits' }
                    }
                }
            },
            'reincarnation.fruit.consume': {
                name: 'reincarnation.fruit.consume',
                description: 'Consume a reincarnation fruit to gain random talent (轮回果系统-服用轮回果)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fruitId: { type: 'string', description: 'Fruit ID to consume' },
                        fruitType: { type: 'string', description: 'Fruit type: small|medium|large (auto-selected if fruitId provided)' }
                    },
                    required: ['fruitId']
                }
            },
            'karma.book.open': {
                name: 'karma.book.open',
                description: 'Open the Karma Book to record good and evil karma deeds (因果簿系统-开启因果簿)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'karma.book.query': {
                name: 'karma.book.query',
                description: 'Query character karma records and statistics (因果簿系统-查询因果记录)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter: all|good|evil (default all)' }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V105 (lines 2609-2678, 70 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V105 = {
            'realm.war.list': {
                name: 'realm.war.list',
                description: 'List all controllable secret realms for war declaration (秘境争夺系统-查看秘境列表)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: 'Filter by realm tier: all|lower|middle|upper|celestial (default all)' }
                    }
                }
            },
            'realm.war.declare': {
                name: 'realm.war.declare',
                description: 'Declare war on a secret realm, costs spirit stones (秘境争夺系统-宣战)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        realmId: { type: 'string', description: 'Target realm ID to declare war on' },
                        betting: { type: 'integer', description: 'Spirit stone bet amount (min 1000, higher = better rewards)', minimum: 1000 }
                    },
                    required: ['realmId']
                }
            },
            'realm.war.occupy': {
                name: 'realm.war.occupy',
                description: 'Occupy a secret realm after winning the war (秘境争夺系统-占领秘境)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        realmId: { type: 'string', description: 'Realm ID to occupy' },
                        autoDistribute: { type: 'boolean', description: 'Auto-distribute rewards to sect members (default true)' }
                    },
                    required: ['realmId']
                }
            },
            'artifact.chaos.query': {
                name: 'artifact.chaos.query',
                description: 'Query chaos artifact information (混沌灵宝系统-查询灵宝)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        artifactId: { type: 'string', description: 'Specific artifact ID or "all" for all artifacts' }
                    }
                }
            },
            'artifact.chaos.enhance': {
                name: 'artifact.chaos.enhance',
                description: 'Enhance a chaos artifact using materials (混沌灵宝系统-强化灵宝)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        artifactId: { type: 'string', description: 'Artifact ID to enhance' },
                        materialType: { type: 'string', description: 'Material type: common|rare|legendary (higher = better success rate)' }
                    },
                    required: ['artifactId', 'materialType']
                }
            },
            'artifact.chaos.resonance': {
                name: 'artifact.chaos.resonance',
                description: 'Activate resonance effect between chaos artifacts (混沌灵宝系统-灵宝共鸣)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        artifactIds: { type: 'array', items: { type: 'string' }, description: 'Array of 2-3 artifact IDs to resonate', minItems: 2, maxItems: 3 },
                        force: { type: 'boolean', description: 'Force activation even if not optimal combination (default false)' }
                    },
                    required: ['artifactIds']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V106 (lines 2681-2747, 67 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V106 = {
            'heaven.cycle.open': {
                name: 'heaven.cycle.open',
                description: '开启天道轮回，消耗大量灵石开启一个纪元的轮回 (天道轮回系统-开启轮回)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        cycleType: { type: 'string', description: '轮回类型: small|medium|large (default medium)', default: 'medium' }
                    }
                }
            },
            'heaven.cycle.settle': {
                name: 'heaven.cycle.settle',
                description: '结算当前天道轮回的因果，评估善恶因果并给予奖励或惩罚 (天道轮回系统-结算因果)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        force: { type: 'boolean', description: '强制结算当前因果 (default false)' }
                    }
                }
            },
            'heaven.cycle.reset': {
                name: 'heaven.cycle.reset',
                description: '重置天道轮回，清除当前纪元记录，重新开始新纪元 (天道轮回系统-重置轮回)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        confirm: { type: 'boolean', description: '确认重置 (required true)' }
                    }
                }
            },
            'karma.law.query': {
                name: 'karma.law.query',
                description: '查询因果律记录，查看善恶因果和业力值 (因果律系统-查询因果)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: '过滤类型: all|good|evil|neutral (default all)' }
                    }
                }
            },
            'karma.law.attribute': {
                name: 'karma.law.attribute',
                description: '为行为添加因果 Attribution，记录善行或恶行 (因果律系统-添加因果)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', description: '行为类型: good|evil|neutral' },
                        desc: { type: 'string', description: '行为描述' },
                        weight: { type: 'number', description: '因果权重: 1-10 (default 5)' }
                    },
                    required: ['action', 'desc']
                }
            },
            'karma.law.reverse': {
                name: 'karma.law.reverse',
                description: '逆转因果，消耗大量资源改变因果记录 (因果律系统-逆转因果)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        karmaId: { type: 'string', description: '因果记录ID' },
                        cost: { type: 'integer', description: '消耗灵石数量 (min 5000)' }
                    },
                    required: ['karmaId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V107 (lines 2750-2813, 64 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V107 = {
            'heaven.rank.query': {
                name: 'heaven.rank.query',
                description: '查询天榜排名信息 (仙界天榜系统-查询天榜)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', description: '页码 (default 1)', default: 1 }
                    }
                }
            },
            'heaven.rank.challenge': {
                name: 'heaven.rank.challenge',
                description: '挑战天榜上的玩家 (仙界天榜系统-挑战玩家)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        targetRank: { type: 'integer', description: '目标排名' }
                    },
                    required: ['targetRank']
                }
            },
            'heaven.rank.reward': {
                name: 'heaven.rank.reward',
                description: '领取天榜排名奖励 (仙界天榜系统-领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rank: { type: 'integer', description: '排名' }
                    },
                    required: ['rank']
                }
            },
            'deification.open': {
                name: 'deification.open',
                description: '开启封神系统 (封神系统-开启封神)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'deification.certify': {
                name: 'deification.certify',
                description: '申请成为真神 (封神系统-申请封神)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        deityTitle: { type: 'string', description: '神位称号' }
                    }
                }
            },
            'deification.legacy': {
                name: 'deification.legacy',
                description: '传承神位 (封神系统-传承神位)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        deityId: { type: 'string', description: '神位ID' },
                        heirId: { type: 'string', description: '继承者ID' }
                    },
                    required: ['deityId', 'heirId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V108 (lines 2816-2882, 67 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V108 = {
            'ruins.explore': {
                name: 'ruins.explore',
                description: '探索仙界遗迹，消耗体力 (仙界遗迹系统-探索遗迹)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        ruinsId: { type: 'string', description: '遗迹ID (可选，默认随机)' }
                    }
                }
            },
            'ruins.battle': {
                name: 'ruins.battle',
                description: '遗迹中的战斗，击败守护者获得奖励 (仙界遗迹系统-遗迹战斗)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        ruinsId: { type: 'string', description: '遗迹ID' },
                        auto: { type: 'boolean', description: '是否自动战斗 (default false)', default: false }
                    },
                    required: ['ruinsId']
                }
            },
            'ruins.reward': {
                name: 'ruins.reward',
                description: '领取遗迹探索奖励 (仙界遗迹系统-领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        ruinsId: { type: 'string', description: '遗迹ID' }
                    },
                    required: ['ruinsId']
                }
            },
            'chaos.law.understand': {
                name: 'chaos.law.understand',
                description: '领悟混沌法则 (混沌法则系统-法则领悟)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        lawType: { type: 'string', description: '法则类型 (time/space/fate/karma/creation/destruction)' }
                    }
                }
            },
            'chaos.law.resonance': {
                name: 'chaos.law.resonance',
                description: '多法则共鸣产生更强效果 (混沌法则系统-法则共鸣)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        lawIds: { type: 'array', description: '法则ID数组', items: { type: 'string' } }
                    },
                    required: ['lawIds']
                }
            },
            'chaos.law.decompose': {
                name: 'chaos.law.decompose',
                description: '分解低等级法则 (混沌法则系统-法则分解)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        lawId: { type: 'string', description: '法则ID' }
                    },
                    required: ['lawId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V111 (lines 2885-2948, 64 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V111 = {
            'serendipity.trigger': {
                name: 'serendipity.trigger',
                description: '触发随机奇遇事件 (仙界奇遇系统-触发)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        intensity: { type: 'string', description: '奇遇强度 (low/mid/high)', default: 'low' }
                    }
                }
            },
            'serendipity.query': {
                name: 'serendipity.query',
                description: '查询当前奇遇状态 (仙界奇遇系统-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'serendipity.complete': {
                name: 'serendipity.complete',
                description: '完成奇遇获得奖励 (仙界奇遇系统-完成)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serendipityId: { type: 'string', description: '奇遇ID' }
                    },
                    required: ['serendipityId']
                }
            },
            'fortune.query': {
                name: 'fortune.query',
                description: '查询玩家的机缘记录 (机缘系统-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: '筛选条件 (all/active/claimed)', default: 'all' }
                    }
                }
            },
            'fortune.activate': {
                name: 'fortune.activate',
                description: '激活某个机缘 (机缘系统-激活)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fortuneId: { type: 'string', description: '机缘ID' }
                    },
                    required: ['fortuneId']
                }
            },
            'fortune.transform': {
                name: 'fortune.transform',
                description: '将机缘转化为实际收益 (机缘系统-转化)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fortuneId: { type: 'string', description: '机缘ID' },
                        targetType: { type: 'string', description: '转化目标类型 (spiritStones/reputation/realm)' }
                    },
                    required: ['fortuneId', 'targetType']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V112 (lines 2951-3014, 64 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V112 = {
            'alliance.query': {
                name: 'alliance.query',
                description: '查询联盟信息 (仙界联盟系统-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        allianceId: { type: 'string', description: '联盟ID (不填则查自己的)' }
                    }
                }
            },
            'alliance.create': {
                name: 'alliance.create',
                description: '创建联盟 (仙界联盟系统-创建, 需要灵力>=10000, 境界>=3)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: '联盟名称' },
                        tag: { type: 'string', description: '联盟标签 (3-5字符)' }
                    },
                    required: ['name']
                }
            },
            'alliance.upgrade': {
                name: 'alliance.upgrade',
                description: '升级联盟 (仙界联盟系统-升级, 需要成员>=3, 联盟资金>=50000灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        allianceId: { type: 'string', description: '联盟ID (不填则用自己的)' }
                    }
                }
            },
            'luck.query': {
                name: 'luck.query',
                description: '查询玩家气运 (气运系统-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'luck.bless': {
                name: 'luck.bless',
                description: '祈福提升气运 (气运系统-祈福, low=+5, mid=+15, high=+30, 消耗灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        intensity: { type: 'string', description: '祈福强度 (low/mid/high)', default: 'low' }
                    }
                }
            },
            'luck.transform': {
                name: 'luck.transform',
                description: '将气运转化为实际收益 (气运系统-转化, 点数*10=灵石, *1=声望, *100=境界经验)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        targetType: { type: 'string', description: '转化目标类型 (spiritStones/reputation/realm)' },
                        amount: { type: 'number', description: '气运点数' }
                    },
                    required: ['targetType', 'amount']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_GM (lines 3017-3082, 66 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_GM = {
            'gm.toggle': {
                name: 'gm.toggle',
                description: '开启/关闭GM模式 (GM工具系统-开关)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        enabled: { type: 'boolean', description: '是否启用GM模式' }
                    },
                    required: ['enabled']
                }
            },
            'gm.addSpirit': {
                name: 'gm.addSpirit',
                description: '添加灵石 (GM工具系统-灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', description: '灵石数量' }
                    },
                    required: ['amount']
                }
            },
            'gm.setRealm': {
                name: 'gm.setRealm',
                description: '设置境界 (GM工具系统-境界)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        realmId: { type: 'number', description: '境界ID (1-8)' }
                    },
                    required: ['realmId']
                }
            },
            'gm.addItem': {
                name: 'gm.addItem',
                description: '添加物品到背包 (GM工具系统-物品)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemType: { type: 'string', description: '物品类型 (spiritStone/pill/technique/equipment/material)' },
                        quantity: { type: 'number', description: '数量', default: 1 }
                    },
                    required: ['itemType']
                }
            },
            'gm.unlockAchievement': {
                name: 'gm.unlockAchievement',
                description: '解锁成就 (GM工具系统-成就)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        achievementId: { type: 'string', description: '成就ID' }
                    },
                    required: ['achievementId']
                }
            },
            'gm.reset': {
                name: 'gm.reset',
                description: '重置玩家数据 (GM工具系统-重置)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V113 (lines 3085-3151, 67 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V113 = {
            'mall.browse': {
                name: 'mall.browse',
                description: '浏览商城商品 (仙界商城系统-浏览)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: '商品分类 (all/weapon/pill/sect/pet)', default: 'all' },
                        page: { type: 'number', description: '页码 (默认1)', default: 1 }
                    }
                }
            },
            'mall.buy': {
                name: 'mall.buy',
                description: '购买商品 (仙界商城系统-购买, 扣灵石，更新库存)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: '商品ID' },
                        quantity: { type: 'number', description: '购买数量', default: 1 }
                    },
                    required: ['itemId']
                }
            },
            'mall.sell': {
                name: 'mall.sell',
                description: '上架商品到集市 (仙界商城系统-上架, 收取上架费100灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: '商品ID' },
                        price: { type: 'number', description: '上架价格 (灵石)' }
                    },
                    required: ['itemId', 'price']
                }
            },
            'exchange.query': {
                name: 'exchange.query',
                description: '查询兑换积分 (兑换系统-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'exchange.redeem': {
                name: 'exchange.redeem',
                description: '使用积分兑换道具 (兑换系统-兑换, 扣积分发道具)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: '兑换商品ID' }
                    },
                    required: ['itemId']
                }
            },
            'exchange.charge': {
                name: 'exchange.charge',
                description: '充值兑换积分 (兑换系统-充值, 1灵石=1积分)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', description: '充值灵石数量' }
                    },
                    required: ['amount']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V110 (lines 3154-3222, 69 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V110 = {
            'heaven.oath.take': {
                name: 'heaven.oath.take',
                description: '向天道立下誓言 (天道誓言系统-立誓)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        oathText: { type: 'string', description: '誓言内容' },
                        severity: { type: 'string', description: '誓言严重程度 (minor/major/critical)', default: 'minor' }
                    },
                    required: ['oathText']
                }
            },
            'heaven.oath.pledge': {
                name: 'heaven.oath.pledge',
                description: '查询/遵守誓言 (天道誓言系统-遵守)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        oathId: { type: 'string', description: '誓言ID' }
                    },
                    required: ['oathId']
                }
            },
            'heaven.oath.break': {
                name: 'heaven.oath.break',
                description: '违背誓言承受惩罚 (天道誓言系统-违背)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        oathId: { type: 'string', description: '誓言ID' }
                    },
                    required: ['oathId']
                }
            },
            'karma.oath.query': {
                name: 'karma.oath.query',
                description: '查询因果誓约 (因果誓约系统-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: '筛选条件 (all/active/broken)', default: 'all' }
                    }
                }
            },
            'karma.oath.bind': {
                name: 'karma.oath.bind',
                description: '绑定誓约与因果 (因果誓约系统-绑定)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        oathId: { type: 'string', description: '誓言ID' },
                        karmaRecordId: { type: 'string', description: '因果记录ID' }
                    },
                    required: ['oathId', 'karmaRecordId']
                }
            },
            'karma.oath.release': {
                name: 'karma.oath.release',
                description: '解除誓约 (因果誓约系统-解除)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        oathId: { type: 'string', description: '誓言ID' }
                    },
                    required: ['oathId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V109 (lines 3225-3285, 61 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V109 = {
            'trial.open': {
                name: 'trial.open',
                description: '开启仙界试炼 (仙界试炼系统-开启试炼)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        trialType: { type: 'string', description: '试炼类型 (primary/advanced/supreme)', default: 'primary' }
                    }
                }
            },
            'trial.challenge': {
                name: 'trial.challenge',
                description: '挑战试炼关卡 (仙界试炼系统-挑战关卡)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        level: { type: 'integer', description: '关卡等级 (1-10)', default: 1 }
                    }
                }
            },
            'trial.reward': {
                name: 'trial.reward',
                description: '领取试炼奖励 (仙界试炼系统-领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        level: { type: 'integer', description: '关卡等级 (1-10)' }
                    },
                    required: ['level']
                }
            },
            'ascend.condition': {
                name: 'ascend.condition',
                description: '查询飞升条件 (飞升系统-查询条件)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'ascend.apply': {
                name: 'ascend.apply',
                description: '申请飞升 (飞升系统-申请飞升)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        force: { type: 'boolean', description: '强制飞升 (无视部分条件)', default: false }
                    }
                }
            },
            'ascend.channel': {
                name: 'ascend.channel',
                description: '开启飞升通道 (飞升系统-开启通道)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        confirm: { type: 'boolean', description: '确认开启通道', default: false }
                    }
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V115 (lines 42347-42410, 64 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V115 = {
            'codex.browse': {
                name: 'codex.browse',
                description: '浏览图鉴条目 (仙界图鉴系统-浏览)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: '分类 (all/recipe/pet/item/realm)', default: 'all' },
                        page: { type: 'number', description: '页码', default: 1 }
                    }
                }
            },
            'codex.unlock': {
                name: 'codex.unlock',
                description: '解锁图鉴条目 (仙界图鉴系统-解锁, 扣灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        codexId: { type: 'string', description: '图鉴ID' }
                    },
                    required: ['codexId']
                }
            },
            'codex.detail': {
                name: 'codex.detail',
                description: '查看图鉴详情 (仙界图鉴系统-详情)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        codexId: { type: 'string', description: '图鉴ID' }
                    },
                    required: ['codexId']
                }
            },
            'collection.progress': {
                name: 'collection.progress',
                description: '查询收集进度 (收集系统-进度)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: '分类 (all/recipe/pet/item/realm)', default: 'all' }
                    }
                }
            },
            'collection.reward': {
                name: 'collection.reward',
                description: '领取收集奖励 (收集系统-奖励, 需达到条件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tierId: { type: 'string', description: '奖励档位ID' }
                    },
                    required: ['tierId']
                }
            },
            'collection.share': {
                name: 'collection.share',
                description: '分享收集进度 (收集系统-分享)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V116 (lines 42414-42475, 62 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V116 = {
            'rank.query': {
                name: 'rank.query',
                description: '查询排行榜 (仙界排行榜-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: '排行榜类型 (spiritStones/realm/reputation/pvp)', default: 'spiritStones' },
                        page: { type: 'number', description: '页码', default: 1 },
                        pageSize: { type: 'number', description: '每页数量', default: 10 }
                    }
                }
            },
            'rank.refresh': {
                name: 'rank.refresh',
                description: '刷新排行数据 (仙界排行榜-刷新)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', description: '排行榜类型 (spiritStones/realm/reputation/pvp)' }
                    },
                    required: ['type']
                }
            },
            'rank.detail': {
                name: 'rank.detail',
                description: '查看玩家排行详情 (仙界排行榜-详情)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerId: { type: 'string', description: '玩家ID', default: 'player' }
                    }
                }
            },
            'glory.query': {
                name: 'glory.query',
                description: '查询玩家荣耀值 (荣耀系统-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'glory.level': {
                name: 'glory.level',
                description: '查询荣耀等级信息 (荣耀系统-等级)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'glory.claim': {
                name: 'glory.claim',
                description: '领取荣耀等级奖励 (荣耀系统-领取奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        levelId: { type: 'string', description: '等级ID (bronze/silver/gold/diamond)' }
                    },
                    required: ['levelId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V118 (lines 42545-42611, 67 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V118 = {
            'announce.list': {
                name: 'announce.list',
                description: '获取公告列表 (仙界公告-列表)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', description: '页码 (默认1)', default: 1 },
                        pageSize: { type: 'number', description: '每页数量 (默认10)', default: 10 }
                    }
                }
            },
            'announce.detail': {
                name: 'announce.detail',
                description: '查看公告详情 (仙界公告-详情)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        announceId: { type: 'string', description: '公告ID' }
                    },
                    required: ['announceId']
                }
            },
            'announce.read': {
                name: 'announce.read',
                description: '标记公告为已读 (仙界公告-已读)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        announceId: { type: 'string', description: '公告ID' }
                    },
                    required: ['announceId']
                }
            },
            'mail.list': {
                name: 'mail.list',
                description: '获取邮件列表 (仙界邮件-列表)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filter: { type: 'string', description: '筛选条件 (all/unread/attachment)', default: 'all' }
                    }
                }
            },
            'mail.read': {
                name: 'mail.read',
                description: '读取邮件 (仙界邮件-读取)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mailId: { type: 'string', description: '邮件ID' }
                    },
                    required: ['mailId']
                }
            },
            'mail.attachment': {
                name: 'mail.attachment',
                description: '领取邮件附件 (仙界邮件-附件)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        mailId: { type: 'string', description: '邮件ID' }
                    },
                    required: ['mailId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V119 (lines 42615-42670, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V119 = {
            'sevenshop.query': {
                name: 'sevenshop.query',
                description: '查询七日特惠商品 (七日特惠-列表)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'sevenshop.buy': {
                name: 'sevenshop.buy',
                description: '购买特惠商品 (七日特惠-购买)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        day: { type: 'number', description: '天数 (1-7)' }
                    },
                    required: ['day']
                }
            },
            'sevenshop.reset': {
                name: 'sevenshop.reset',
                description: '重置特惠进度 (七日特惠-重置) - 需1000灵石',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'limitedshop.list': {
                name: 'limitedshop.list',
                description: '获取限时商店商品 (限时商店-列表)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'limitedshop.refresh': {
                name: 'limitedshop.refresh',
                description: '刷新商店商品 (限时商店-刷新)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'limitedshop.buy': {
                name: 'limitedshop.buy',
                description: '购买限时商品 (限时商店-购买)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemId: { type: 'string', description: '商品ID' }
                    },
                    required: ['itemId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V117 (lines 42722-42777, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V117 = {
            'checkin.query': {
                name: 'checkin.query',
                description: '查询签到状态 (仙界签到-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'checkin.sign': {
                name: 'checkin.sign',
                description: '执行签到 (仙界签到-签到)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'checkin.reward': {
                name: 'checkin.reward',
                description: '领取连续签到奖励 (仙界签到-连续奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        day: { type: 'number', description: '连续签到天数 (3/7/30)' }
                    },
                    required: ['day']
                }
            },
            'welfare.query': {
                name: 'welfare.query',
                description: '查询可领取福利 (仙界福利-查询)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利 (仙界福利-领取)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        welfareId: { type: 'string', description: '福利ID (daily/weekly/monthly)' }
                    },
                    required: ['welfareId']
                }
            },
            'welfare.status': {
                name: 'welfare.status',
                description: '查询福利状态 (仙界福利-状态)',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V120 (lines 42780-42787, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V120 = {
            'investment.query': { name: 'investment.query', description: '查询投资状态', inputSchema: { type: 'object', properties: {} } },
            'investment.buy': { name: 'investment.buy', description: '购买投资产品', inputSchema: { type: 'object', properties: { investmentId: { type: 'string' } }, required: ['investmentId'] } },
            'investment.claim': { name: 'investment.claim', description: '领取投资收益', inputSchema: { type: 'object', properties: { investmentId: { type: 'string' } }, required: ['investmentId'] } },
            'monthcard.query': { name: 'monthcard.query', description: '查询月卡状态', inputSchema: { type: 'object', properties: {} } },
            'monthcard.buy': { name: 'monthcard.buy', description: '购买月卡', inputSchema: { type: 'object', properties: {} } },
            'monthcard.claim': { name: 'monthcard.claim', description: '每日领取月卡奖励', inputSchema: { type: 'object', properties: {} } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V121 (lines 42796-42803, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V121 = {
            'petexplore.list': { name: 'petexplore.list', description: '获取探险列表', inputSchema: { type: 'object', properties: {} } },
            'petexplore.start': { name: 'petexplore.start', description: '开始探险', inputSchema: { type: 'object', properties: { petId: { type: 'string' }, exploreId: { type: 'string' } }, required: ['petId', 'exploreId'] } },
            'petexplore.harvest': { name: 'petexplore.harvest', description: '收获探险奖励', inputSchema: { type: 'object', properties: { exploreId: { type: 'string' } }, required: ['exploreId'] } },
            'dispatch.list': { name: 'dispatch.list', description: '获取派遣任务列表', inputSchema: { type: 'object', properties: {} } },
            'dispatch.execute': { name: 'dispatch.execute', description: '执行派遣任务', inputSchema: { type: 'object', properties: { taskId: { type: 'string' } }, required: ['taskId'] } },
            'dispatch.complete': { name: 'dispatch.complete', description: '完成派遣领取奖励', inputSchema: { type: 'object', properties: { taskId: { type: 'string' } }, required: ['taskId'] } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V122 (lines 42806-42813, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V122 = {
            'redpack.list': { name: 'redpack.list', description: '获取可领取的红包列表', inputSchema: { type: 'object', properties: {} } },
            'redpack.send': { name: 'redpack.send', description: '发送红包', inputSchema: { type: 'object', properties: { amount: { type: 'number' }, type: { type: 'string', enum: ['regular', 'lucky'] } }, required: ['amount', 'type'] } },
            'redpack.grab': { name: 'redpack.grab', description: '领取红包', inputSchema: { type: 'object', properties: { redpackId: { type: 'string' } }, required: ['redpackId'] } },
            'friend.list': { name: 'friend.list', description: '获取好友列表', inputSchema: { type: 'object', properties: {} } },
            'friend.apply': { name: 'friend.apply', description: '发送好友申请', inputSchema: { type: 'object', properties: { playerName: { type: 'string' } }, required: ['playerName'] } },
            'friend.accept': { name: 'friend.accept', description: '通过好友申请', inputSchema: { type: 'object', properties: { applyId: { type: 'string' } }, required: ['applyId'] } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V124 (lines 42816-42823, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V124 = {
            'achievement.list': { name: 'achievement.list', description: '获取成就列表', inputSchema: { type: 'object', properties: {} } },
            'achievement.claim': { name: 'achievement.claim', description: '领取成就奖励', inputSchema: { type: 'object', properties: { achievementId: { type: 'string' } }, required: ['achievementId'] } },
            'achievement.progress': { name: 'achievement.progress', description: '查看成就进度', inputSchema: { type: 'object', properties: { achievementId: { type: 'string' } }, required: ['achievementId'] } },
            'title.list': { name: 'title.list', description: '获取称号列表', inputSchema: { type: 'object', properties: {} } },
            'title.activate': { name: 'title.activate', description: '激活称号', inputSchema: { type: 'object', properties: { titleId: { type: 'string' } }, required: ['titleId'] } },
            'title.remove': { name: 'title.remove', description: '卸下称号', inputSchema: { type: 'object', properties: {} } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V125 (lines 42826-42833, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V125 = {
            'mail.list': { name: 'mail.list', description: '获取邮件列表', inputSchema: { type: 'object', properties: {} } },
            'mail.send': { name: 'mail.send', description: '发送邮件', inputSchema: { type: 'object', properties: { to: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['to', 'title', 'content'] } },
            'mail.delete': { name: 'mail.delete', description: '删除邮件', inputSchema: { type: 'object', properties: { mailId: { type: 'string' } }, required: ['mailId'] } },
            'message.list': { name: 'message.list', description: '获取消息列表', inputSchema: { type: 'object', properties: {} } },
            'message.markRead': { name: 'message.markRead', description: '标记消息已读', inputSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] } },
            'message.clear': { name: 'message.clear', description: '清空所有消息', inputSchema: { type: 'object', properties: {} } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V126 (lines 42845-42852, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V126 = {
            'map.list': { name: 'map.list', description: '获取地图区域列表', inputSchema: { type: 'object', properties: {} } },
            'map.detail': { name: 'map.detail', description: '获取地图详情', inputSchema: { type: 'object', properties: { mapId: { type: 'string' } }, required: ['mapId'] } },
            'map.unlock': { name: 'map.unlock', description: '解锁地图区域', inputSchema: { type: 'object', properties: { mapId: { type: 'string' } }, required: ['mapId'] } },
            'explore.start': { name: 'explore.start', description: '开始探索', inputSchema: { type: 'object', properties: { mapId: { type: 'string' } }, required: ['mapId'] } },
            'explore.status': { name: 'explore.status', description: '查看探索状态', inputSchema: { type: 'object', properties: {} } },
            'explore.complete': { name: 'explore.complete', description: '领取探索奖励', inputSchema: { type: 'object', properties: {} } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V127 (lines 42855-42862, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V127 = {
            'shop.list': { name: 'shop.list', description: '获取商店列表', inputSchema: { type: 'object', properties: {} } },
            'shop.buy': { name: 'shop.buy', description: '购买商品', inputSchema: { type: 'object', properties: { shopId: { type: 'string' }, itemId: { type: 'string' } }, required: ['shopId', 'itemId'] } },
            'shop.refresh': { name: 'shop.refresh', description: '刷新商店商品', inputSchema: { type: 'object', properties: { shopId: { type: 'string' } }, required: ['shopId'] } },
            'bag.list': { name: 'bag.list', description: '获取背包物品', inputSchema: { type: 'object', properties: {} } },
            'bag.use': { name: 'bag.use', description: '使用物品', inputSchema: { type: 'object', properties: { itemId: { type: 'string' } }, required: ['itemId'] } },
            'bag.sell': { name: 'bag.sell', description: '出售物品', inputSchema: { type: 'object', properties: { itemId: { type: 'string' } }, required: ['itemId'] } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V128 (lines 42865-42872, 8 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V128 = {
            'quest.list': { name: 'quest.list', description: '获取任务列表', inputSchema: { type: 'object', properties: { filter: { type: 'string', description: '筛选条件 (available/active/completed)', default: 'available' } } } },
            'quest.accept': { name: 'quest.accept', description: '接受任务', inputSchema: { type: 'object', properties: { questId: { type: 'string', description: '任务ID' } }, required: ['questId'] } },
            'quest.complete': { name: 'quest.complete', description: '完成任务', inputSchema: { type: 'object', properties: { questId: { type: 'string', description: '任务ID' } }, required: ['questId'] } },
            'daily.list': { name: 'daily.list', description: '获取日常任务', inputSchema: { type: 'object', properties: {} } },
            'daily.claim': { name: 'daily.claim', description: '领取日常奖励', inputSchema: { type: 'object', properties: { dailyId: { type: 'string', description: '日常任务ID' } }, required: ['dailyId'] } },
            'daily.reset': { name: 'daily.reset', description: '重置日常任务', inputSchema: { type: 'object', properties: {} } }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V129 (lines 42875-42906, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V129 = {
            'realm.list': {
                name: 'realm.list',
                description: '获取境界列表 (境界系统-列表所有境界)',
                inputSchema: { type: 'object', properties: {} }
            },
            'realm.detail': {
                name: 'realm.detail',
                description: '获取境界详情 (境界系统-查看特定境界信息)',
                inputSchema: { type: 'object', properties: { realmId: { type: 'number', description: '境界ID (0-12)' } }, required: ['realmId'] }
            },
            'realm.breakthrough': {
                name: 'realm.breakthrough',
                description: '突破到下一境界 (境界系统-尝试突破)',
                inputSchema: { type: 'object', properties: {} }
            },
            'breakthrough.prepare': {
                name: 'breakthrough.prepare',
                description: '准备突破 (突破系统-开始准备突破)',
                inputSchema: { type: 'object', properties: {} }
            },
            'breakthrough.start': {
                name: 'breakthrough.start',
                description: '开始突破 (突破系统-正式开始突破)',
                inputSchema: { type: 'object', properties: {} }
            },
            'breakthrough.result': {
                name: 'breakthrough.result',
                description: '获取突破结果 (突破系统-查看突破结果)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V130 (lines 42909-42940, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V130 = {
            'sect.list': {
                name: 'sect.list',
                description: '获取宗门列表 (宗门系统-列表所有宗门)',
                inputSchema: { type: 'object', properties: {} }
            },
            'sect.create': {
                name: 'sect.create',
                description: '创建宗门 (宗门系统-消耗灵石创建宗门)',
                inputSchema: { type: 'object', properties: { sectName: { type: 'string', description: '宗门名称' } }, required: ['sectName'] }
            },
            'sect.upgrade': {
                name: 'sect.upgrade',
                description: '升级宗门 (宗门系统-提升宗门等级上限)',
                inputSchema: { type: 'object', properties: {} }
            },
            'disciple.list': {
                name: 'disciple.list',
                description: '获取弟子列表 (弟子系统-列表所有弟子)',
                inputSchema: { type: 'object', properties: {} }
            },
            'disciple.recruit': {
                name: 'disciple.recruit',
                description: '招募弟子 (弟子系统-消耗灵石招募弟子)',
                inputSchema: { type: 'object', properties: {} }
            },
            'disciple.assign': {
                name: 'disciple.assign',
                description: '派遣弟子任务 (弟子系统-派遣弟子执行任务)',
                inputSchema: { type: 'object', properties: { discipleId: { type: 'string', description: '弟子ID' }, taskId: { type: 'string', description: '任务ID' } }, required: ['discipleId', 'taskId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V131 (lines 42943-42974, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V131 = {
            'treasure.list': {
                name: 'treasure.list',
                description: '获取秘宝列表 (秘宝系统-列表所有秘宝)',
                inputSchema: { type: 'object', properties: {} }
            },
            'treasure.enhance': {
                name: 'treasure.enhance',
                description: '强化秘宝 (秘宝系统-消耗材料提升秘宝等级)',
                inputSchema: { type: 'object', properties: { treasureId: { type: 'string', description: '秘宝ID' } }, required: ['treasureId'] }
            },
            'treasure.disassemble': {
                name: 'treasure.disassemble',
                description: '分解秘宝 (秘宝系统-分解秘宝获得材料)',
                inputSchema: { type: 'object', properties: { treasureId: { type: 'string', description: '秘宝ID' } }, required: ['treasureId'] }
            },
            'equip.list': {
                name: 'equip.list',
                description: '获取装备列表 (装备系统-列表已穿戴装备)',
                inputSchema: { type: 'object', properties: {} }
            },
            'equip.equip': {
                name: 'equip.equip',
                description: '穿戴装备 (装备系统-穿戴装备到对应槽位)',
                inputSchema: { type: 'object', properties: { equipId: { type: 'string', description: '装备ID' } }, required: ['equipId'] }
            },
            'equip.unequip': {
                name: 'equip.unequip',
                description: '卸下装备 (装备系统-卸下装备到背包)',
                inputSchema: { type: 'object', properties: { slot: { type: 'string', description: '装备槽位 (weapon/armor/accessory)' } }, required: ['slot'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V132 (lines 42977-43008, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V132 = {
            'pet.list': {
                name: 'pet.list',
                description: '获取灵宠列表 (灵宠系统-列表所有灵宠)',
                inputSchema: { type: 'object', properties: {} }
            },
            'pet.capture': {
                name: 'pet.capture',
                description: '捕捉灵宠 (灵宠系统-消耗灵石捕捉灵宠)',
                inputSchema: { type: 'object', properties: {} }
            },
            'pet.release': {
                name: 'pet.release',
                description: '放生灵宠 (灵宠系统-放生指定灵宠)',
                inputSchema: { type: 'object', properties: { petId: { type: 'string', description: '灵宠ID' } }, required: ['petId'] }
            },
            'evolve.prepare': {
                name: 'evolve.prepare',
                description: '准备进化 (进化系统-检查灵宠是否可进化)',
                inputSchema: { type: 'object', properties: { petId: { type: 'string', description: '灵宠ID' } }, required: ['petId'] }
            },
            'evolve.start': {
                name: 'evolve.start',
                description: '开始进化 (进化系统-开始进化计时)',
                inputSchema: { type: 'object', properties: {} }
            },
            'evolve.complete': {
                name: 'evolve.complete',
                description: '完成进化 (进化系统-完成进化，提升属性)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V133 (lines 43011-43042, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V133 = {
            'pill.list': {
                name: 'pill.list',
                description: '获取丹药列表 (丹药系统-列表所有丹药)',
                inputSchema: { type: 'object', properties: {} }
            },
            'pill.refine': {
                name: 'pill.refine',
                description: '炼制丹药 (丹药系统-消耗材料炼制丹药)',
                inputSchema: { type: 'object', properties: { recipeId: { type: 'string', description: '配方ID' } }, required: ['recipeId'] }
            },
            'pill.consume': {
                name: 'pill.consume',
                description: '服用丹药 (丹药系统-服用丹药获得属性加成)',
                inputSchema: { type: 'object', properties: { pillId: { type: 'string', description: '丹药ID' } }, required: ['pillId'] }
            },
            'alchemy.list': {
                name: 'alchemy.list',
                description: '获取炼药配方 (炼药系统-列表所有配方)',
                inputSchema: { type: 'object', properties: {} }
            },
            'alchemy.start': {
                name: 'alchemy.start',
                description: '开始炼药 (炼药系统-开始炼药计时)',
                inputSchema: { type: 'object', properties: { recipeId: { type: 'string', description: '配方ID' } }, required: ['recipeId'] }
            },
            'alchemy.complete': {
                name: 'alchemy.complete',
                description: '完成炼药 (炼药系统-完成炼药，获得丹药)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V134 (lines 43045-43076, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V134 = {
            'formation.list': {
                name: 'formation.list',
                description: '获取阵法列表 (阵法系统-列表所有阵法)',
                inputSchema: { type: 'object', properties: {} }
            },
            'formation.place': {
                name: 'formation.place',
                description: '布置阵法 (阵法系统-在指定位置布置阵法)',
                inputSchema: { type: 'object', properties: { formationId: { type: 'string', description: '阵法ID' }, x: { type: 'number', description: 'X坐标' }, y: { type: 'number', description: 'Y坐标' } }, required: ['formationId', 'x', 'y'] }
            },
            'formation.activate': {
                name: 'formation.activate',
                description: '激活阵法 (阵法系统-激活阵法获得效果)',
                inputSchema: { type: 'object', properties: { formationId: { type: 'string', description: '阵法ID' } }, required: ['formationId'] }
            },
            'talisman.list': {
                name: 'talisman.list',
                description: '获取符箓列表 (符箓系统-列表背包中的符箓)',
                inputSchema: { type: 'object', properties: {} }
            },
            'talisman.draw': {
                name: 'talisman.draw',
                description: '绘制符箓 (符箓系统-消耗材料绘制符箓)',
                inputSchema: { type: 'object', properties: { talismanId: { type: 'string', description: '符箓ID' } }, required: ['talismanId'] }
            },
            'talisman.use': {
                name: 'talisman.use',
                description: '使用符箓 (符箓系统-使用符箓获得效果)',
                inputSchema: { type: 'object', properties: { talismanId: { type: 'string', description: '符箓ID' } }, required: ['talismanId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V135 (lines 43079-43110, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V135 = {
            'encounter.list': {
                name: 'encounter.list',
                description: '获取奇遇列表 (奇遇系统-列出可用奇遇事件)',
                inputSchema: { type: 'object', properties: {} }
            },
            'encounter.trigger': {
                name: 'encounter.trigger',
                description: '触发奇遇 (奇遇系统-触发奇遇开始)',
                inputSchema: { type: 'object', properties: { encounterId: { type: 'string', description: '奇遇ID' } }, required: ['encounterId'] }
            },
            'encounter.complete': {
                name: 'encounter.complete',
                description: '完成奇遇 (奇遇系统-完成奇遇选择结果)',
                inputSchema: { type: 'object', properties: { encounterId: { type: 'string', description: '奇遇ID' }, choice: { type: 'string', description: '选择结果' } }, required: ['encounterId', 'choice'] }
            },
            'event.list': {
                name: 'event.list',
                description: '获取事件列表 (事件系统-获取随机事件池)',
                inputSchema: { type: 'object', properties: {} }
            },
            'event.choice': {
                name: 'event.choice',
                description: '选择事件选项 (事件系统-对事件做选择)',
                inputSchema: { type: 'object', properties: { eventId: { type: 'string', description: '事件ID' }, choiceIndex: { type: 'number', description: '选项索引' } }, required: ['eventId', 'choiceIndex'] }
            },
            'event.resolve': {
                name: 'event.resolve',
                description: '事件结算 (事件系统-结算选择结果)',
                inputSchema: { type: 'object', properties: { eventId: { type: 'string', description: '事件ID' } }, required: ['eventId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V136 (lines 43113-43144, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V136 = {
            'bounty.list': {
                name: 'bounty.list',
                description: '获取悬赏列表 (悬赏系统-列出可用悬赏任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'bounty.accept': {
                name: 'bounty.accept',
                description: '接取悬赏 (悬赏系统-接受悬赏任务)',
                inputSchema: { type: 'object', properties: { bountyId: { type: 'string', description: '悬赏ID' } }, required: ['bountyId'] }
            },
            'bounty.complete': {
                name: 'bounty.complete',
                description: '完成悬赏 (悬赏系统-提交完成悬赏任务获得奖励)',
                inputSchema: { type: 'object', properties: { bountyId: { type: 'string', description: '悬赏ID' } }, required: ['bountyId'] }
            },
            'questline.list': {
                name: 'questline.list',
                description: '获取任务链列表 (任务链系统-列出可用任务链)',
                inputSchema: { type: 'object', properties: {} }
            },
            'questline.activate': {
                name: 'questline.activate',
                description: '激活任务链 (任务链系统-激活任务链开始第一阶段)',
                inputSchema: { type: 'object', properties: { questlineId: { type: 'string', description: '任务链ID' } }, required: ['questlineId'] }
            },
            'questline.advance': {
                name: 'questline.advance',
                description: '推进任务链 (任务链系统-推进任务链到下一阶段)',
                inputSchema: { type: 'object', properties: { questlineId: { type: 'string', description: '任务链ID' } }, required: ['questlineId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V137 (lines 43147-43178, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V137 = {
            'achievement.list': {
                name: 'achievement.list',
                description: '获取成就列表 (成就系统-列出所有成就及状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'achievement.unlock': {
                name: 'achievement.unlock',
                description: '解锁成就 (成就系统-解锁成就，需要满足条件)',
                inputSchema: { type: 'object', properties: { achievementId: { type: 'string', description: '成就ID' } }, required: ['achievementId'] }
            },
            'achievement.claim': {
                name: 'achievement.claim',
                description: '领取成就奖励 (成就系统-领取已解锁成就的奖励)',
                inputSchema: { type: 'object', properties: { achievementId: { type: 'string', description: '成就ID' } }, required: ['achievementId'] }
            },
            'badge.list': {
                name: 'badge.list',
                description: '获取徽章列表 (徽章系统-列出所有徽章)',
                inputSchema: { type: 'object', properties: {} }
            },
            'badge.equip': {
                name: 'badge.equip',
                description: '佩戴徽章 (徽章系统-佩戴徽章，最多3个)',
                inputSchema: { type: 'object', properties: { badgeId: { type: 'string', description: '徽章ID' } }, required: ['badgeId'] }
            },
            'badge.unequip': {
                name: 'badge.unequip',
                description: '卸下徽章 (徽章系统-卸下所有已佩戴徽章)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V138 (lines 43181-43212, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V138 = {
            'rank.list': {
                name: 'rank.list',
                description: '获取排行榜列表 (排行榜-列出各榜前10名)',
                inputSchema: { type: 'object', properties: {} }
            },
            'rank.query': {
                name: 'rank.query',
                description: '查询排名 (排行榜-查询玩家在指定榜的排名)',
                inputSchema: { type: 'object', properties: { rankType: { type: 'string', description: '排行榜类型: realm|wealth|badge' } }, required: ['rankType'] }
            },
            'rank.reward': {
                name: 'rank.reward',
                description: '领取排名奖励 (排行榜-领取指定榜的排名奖励)',
                inputSchema: { type: 'object', properties: { rankType: { type: 'string', description: '排行榜类型: realm|wealth|badge' } }, required: ['rankType'] }
            },
            'arena.match': {
                name: 'arena.match',
                description: '开始匹配 (竞技场-开始匹配对手)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.fight': {
                name: 'arena.fight',
                description: '进行战斗 (竞技场-与已匹配对手进行对战)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.reward': {
                name: 'arena.reward',
                description: '领取竞技奖励 (竞技场-领取胜利奖励)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V140 (lines 43215-43246, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V140 = {
            'codex.list': {
                name: 'codex.list',
                description: '获取图鉴分类列表 (图鉴-列出所有分类及条目)',
                inputSchema: { type: 'object', properties: {} }
            },
            'codex.view': {
                name: 'codex.view',
                description: '查看图鉴条目详情 (图鉴-查看指定分类的指定条目详情)',
                inputSchema: { type: 'object', properties: { categoryId: { type: 'string', description: '分类ID' }, entryId: { type: 'string', description: '条目ID' } }, required: ['categoryId', 'entryId'] }
            },
            'codex.unlock': {
                name: 'codex.unlock',
                description: '解锁图鉴条目 (图鉴-解锁指定条目)',
                inputSchema: { type: 'object', properties: { entryId: { type: 'string', description: '条目ID' } }, required: ['entryId'] }
            },
            'collection.stats': {
                name: 'collection.stats',
                description: '获取收集进度统计 (收集-获取所有收集进度统计)',
                inputSchema: { type: 'object', properties: {} }
            },
            'collection.reward': {
                name: 'collection.reward',
                description: '领取收集奖励 (收集-领取指定收集奖励)',
                inputSchema: { type: 'object', properties: { collectionId: { type: 'string', description: '收集ID' } }, required: ['collectionId'] }
            },
            'collection.reset': {
                name: 'collection.reset',
                description: '重置收集进度 (收集-重置所有收集进度)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V141 (lines 43249-43280, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V141 = {
            'mail.list': {
                name: 'mail.list',
                description: '获取邮件列表 (邮件系统-列出收件箱邮件)',
                inputSchema: { type: 'object', properties: {} }
            },
            'mail.send': {
                name: 'mail.send',
                description: '发送邮件 (邮件系统-发送邮件给指定玩家)',
                inputSchema: { type: 'object', properties: { to: { type: 'string', description: '收件人玩家名' }, title: { type: 'string', description: '邮件标题' }, content: { type: 'string', description: '邮件内容' } }, required: ['to', 'title', 'content'] }
            },
            'mail.read': {
                name: 'mail.read',
                description: '读取邮件 (邮件系统-读取邮件内容并标记为已读)',
                inputSchema: { type: 'object', properties: { mailId: { type: 'string', description: '邮件ID' } }, required: ['mailId'] }
            },
            'mail.delete': {
                name: 'mail.delete',
                description: '删除邮件 (邮件系统-删除指定邮件)',
                inputSchema: { type: 'object', properties: { mailId: { type: 'string', description: '邮件ID' } }, required: ['mailId'] }
            },
            'announce.list': {
                name: 'announce.list',
                description: '获取公告列表 (公告系统-列出所有公告)',
                inputSchema: { type: 'object', properties: {} }
            },
            'announce.view': {
                name: 'announce.view',
                description: '查看公告详情 (公告系统-查看指定公告详情)',
                inputSchema: { type: 'object', properties: { announceId: { type: 'string', description: '公告ID' } }, required: ['announceId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V143 (lines 43283-43314, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V143 = {
            'investment.list': {
                name: 'investment.list',
                description: '获取投资产品列表 (投资系统-列出可用投资产品)',
                inputSchema: { type: 'object', properties: {} }
            },
            'investment.buy': {
                name: 'investment.buy',
                description: '购买投资产品 (投资系统-购买指定投资产品，消耗灵石)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' } }, required: ['investmentId'] }
            },
            'investment.profit': {
                name: 'investment.profit',
                description: '领取投资收益 (投资系统-领取指定投资的每日收益)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' } }, required: ['investmentId'] }
            },
            'investment.redeem': {
                name: 'investment.redeem',
                description: '赎回投资 (投资系统-提前赎回投资，可能有惩罚)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' } }, required: ['investmentId'] }
            },
            'monthcard.status': {
                name: 'monthcard.status',
                description: '获取月卡状态 (月卡系统-查看月卡激活状态和剩余天数)',
                inputSchema: { type: 'object', properties: {} }
            },
            'monthcard.buy': {
                name: 'monthcard.buy',
                description: '购买月卡 (月卡系统-购买月卡，30天有效期)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V144 (lines 43317-43348, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V144 = {
            'redpack.list': {
                name: 'redpack.list',
                description: '获取红包列表 (红包系统-列出可抢的红包)',
                inputSchema: { type: 'object', properties: {} }
            },
            'redpack.send': {
                name: 'redpack.send',
                description: '发送红包 (红包系统-发送红包，消耗灵石，随机分配给count人)',
                inputSchema: { type: 'object', properties: { amount: { type: 'number', description: '红包总金额(灵石)' }, count: { type: 'number', description: '红包个数' }, message: { type: 'string', description: '红包留言' } }, required: ['amount', 'count'] }
            },
            'redpack.grab': {
                name: 'redpack.grab',
                description: '抢红包 (红包系统-抢指定红包)',
                inputSchema: { type: 'object', properties: { redpackId: { type: 'string', description: '红包ID' } }, required: ['redpackId'] }
            },
            'redpack.detail': {
                name: 'redpack.detail',
                description: '查看红包详情 (红包系统-查看红包详情和领取记录)',
                inputSchema: { type: 'object', properties: { redpackId: { type: 'string', description: '红包ID' } }, required: ['redpackId'] }
            },
            'friend.list': {
                name: 'friend.list',
                description: '获取好友列表 (社交系统-列出好友列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'friend.add': {
                name: 'friend.add',
                description: '添加好友 (社交系统-添加好友，AI模拟，不需要对方同意)',
                inputSchema: { type: 'object', properties: { playerName: { type: 'string', description: '玩家名称' } }, required: ['playerName'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V145 (lines 43351-43382, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V145 = {
            'explore.list': {
                name: 'explore.list',
                description: '获取探险区域列表 (宠物探险-列出可探险区域)',
                inputSchema: { type: 'object', properties: {} }
            },
            'explore.start': {
                name: 'explore.start',
                description: '开始探险 (宠物探险-派宠物去探险区域探险)',
                inputSchema: { type: 'object', properties: { areaId: { type: 'string', description: '探险区域ID' }, petId: { type: 'string', description: '宠物ID' } }, required: ['areaId', 'petId'] }
            },
            'explore.complete': {
                name: 'explore.complete',
                description: '完成探险 (宠物探险-完成探险并领取奖励)',
                inputSchema: { type: 'object', properties: { exploreId: { type: 'string', description: '探险ID' } }, required: ['exploreId'] }
            },
            'dispatch.list': {
                name: 'dispatch.list',
                description: '获取派遣任务列表 (派遣系统-列出可接受的派遣任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'dispatch.accept': {
                name: 'dispatch.accept',
                description: '接受派遣任务 (派遣系统-接受派遣任务)',
                inputSchema: { type: 'object', properties: { taskId: { type: 'string', description: '任务ID' } }, required: ['taskId'] }
            },
            'dispatch.complete': {
                name: 'dispatch.complete',
                description: '完成派遣任务 (派遣系统-完成派遣任务并领取奖励)',
                inputSchema: { type: 'object', properties: { taskId: { type: 'string', description: '任务ID' } }, required: ['taskId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V146 (lines 43385-43416, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V146 = {
            'achievement.list': {
                name: 'achievement.list',
                description: '获取成就列表 (成就系统-列出所有成就)',
                inputSchema: { type: 'object', properties: {} }
            },
            'achievement.view': {
                name: 'achievement.view',
                description: '查看成就详情 (成就系统-查看指定成就详情)',
                inputSchema: { type: 'object', properties: { achievementId: { type: 'string', description: '成就ID' } }, required: ['achievementId'] }
            },
            'achievement.unlock': {
                name: 'achievement.unlock',
                description: '解锁成就 (成就系统-解锁成就)',
                inputSchema: { type: 'object', properties: { achievementId: { type: 'string', description: '成就ID' } }, required: ['achievementId'] }
            },
            'badge.list': {
                name: 'badge.list',
                description: '获取徽章列表 (徽章系统-列出所有徽章)',
                inputSchema: { type: 'object', properties: {} }
            },
            'badge.equip': {
                name: 'badge.equip',
                description: '装备徽章 (徽章系统-装备徽章)',
                inputSchema: { type: 'object', properties: { badgeId: { type: 'string', description: '徽章ID' } }, required: ['badgeId'] }
            },
            'badge.unequip': {
                name: 'badge.unequip',
                description: '卸下徽章 (徽章系统-卸下徽章)',
                inputSchema: { type: 'object', properties: { badgeId: { type: 'string', description: '徽章ID' } }, required: ['badgeId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V149 (lines 43419-43474, 56 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V149 = {
            'quest.list': {
                name: 'quest.list',
                description: '获取悬赏任务列表 (悬赏系统-列出所有可接悬赏任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'quest.accept': {
                name: 'quest.accept',
                description: '接受悬赏任务 (悬赏系统-接受指定的悬赏任务)',
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
                description: '完成任务领取奖励 (悬赏系统-完成悬赏任务并领取奖励)',
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
                description: '获取任务链 (任务链系统-列出所有任务链)',
                inputSchema: { type: 'object', properties: {} }
            },
            'chain.progress': {
                name: 'chain.progress',
                description: '查看任务链进度 (任务链系统-查看指定任务链进度)',
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
                description: '领取任务链奖励 (任务链系统-领取任务链全部完成的奖励)',
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
// const MCP_TOOLS_V150 (lines 43477-43527, 51 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V150 = {
            'investment.list': {
                name: 'investment.list',
                description: '获取投资产品列表 (投资系统v2-列出可用投资产品)',
                inputSchema: { type: 'object', properties: {} }
            },
            'investment.buy': {
                name: 'investment.buy',
                description: '购买投资产品 (投资系统v2-购买指定投资产品，消耗灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        investmentId: { type: 'string', description: '投资产品ID' },
                        amount: { type: 'number', description: '投资金额(灵石)' }
                    },
                    required: ['investmentId']
                }
            },
            'investment.profit': {
                name: 'investment.profit',
                description: '查看投资收益 (投资系统v2-查看指定投资的累计收益)',
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
                description: '赎回投资 (投资系统v2-赎回投资，返回本金+收益)',
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
                description: '获取月卡状态 (月卡系统v2-查看月卡激活状态和剩余天数)',
                inputSchema: { type: 'object', properties: {} }
            },
            'monthcard.buy': {
                name: 'monthcard.buy',
                description: '购买月卡 (月卡系统v2-购买月卡，30天有效期，每日领取100灵石)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V151 (lines 43530-43561, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V151 = {
            'explore.list': {
                name: 'explore.list',
                description: '获取探险区域列表 (探险系统v2-获取所有探险区域)',
                inputSchema: { type: 'object', properties: {} }
            },
            'explore.start': {
                name: 'explore.start',
                description: '开始探险 (探险系统v2-开始探险)',
                inputSchema: { type: 'object', properties: { areaId: { type: 'string', description: '探险区域ID' } }, required: ['areaId'] }
            },
            'explore.complete': {
                name: 'explore.complete',
                description: '完成探险 (探险系统v2-完成探险并获得奖励)',
                inputSchema: { type: 'object', properties: { exploreId: { type: 'string', description: '探险ID' } }, required: ['exploreId'] }
            },
            'dispatch.list': {
                name: 'dispatch.list',
                description: '获取派遣任务列表 (派遣系统v2-获取所有可接受派遣任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'dispatch.accept': {
                name: 'dispatch.accept',
                description: '接受派遣任务 (派遣系统v2-接受派遣任务)',
                inputSchema: { type: 'object', properties: { taskId: { type: 'string', description: '任务ID' } }, required: ['taskId'] }
            },
            'dispatch.complete': {
                name: 'dispatch.complete',
                description: '完成派遣任务 (派遣系统v2-完成派遣任务并领取奖励)',
                inputSchema: { type: 'object', properties: { taskId: { type: 'string', description: '任务ID' } }, required: ['taskId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V152 (lines 43564-43595, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V152 = {
            'codex.list': {
                name: 'codex.list',
                description: '获取图鉴分类列表 (图鉴系统v2-获取所有图鉴分类)',
                inputSchema: { type: 'object', properties: {} }
            },
            'codex.view': {
                name: 'codex.view',
                description: '查看指定分类的图鉴详情 (图鉴系统v2-查看分类内所有条目)',
                inputSchema: { type: 'object', properties: { categoryId: { type: 'string', description: '分类ID' } }, required: ['categoryId'] }
            },
            'codex.unlock': {
                name: 'codex.unlock',
                description: '解锁图鉴条目 (图鉴系统v2-解锁条目，消耗灵石)',
                inputSchema: { type: 'object', properties: { entryId: { type: 'string', description: '条目ID' } }, required: ['entryId'] }
            },
            'collection.stats': {
                name: 'collection.stats',
                description: '获取收集进度统计 (收集系统v2-获取各分类收集进度)',
                inputSchema: { type: 'object', properties: {} }
            },
            'collection.reward': {
                name: 'collection.reward',
                description: '领取收集奖励 (收集系统v2-领取达成100%分类的奖励)',
                inputSchema: { type: 'object', properties: { rewardId: { type: 'string', description: '奖励ID' } }, required: ['rewardId'] }
            },
            'collection.reset': {
                name: 'collection.reset',
                description: '重置收集进度 (收集系统v2-重置所有收集进度)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V153 (lines 43598-43637, 40 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V153 = {
            'mail.list': {
                name: 'mail.list',
                description: '获取邮件列表 (邮件系统v2-获取收件箱邮件列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'mail.send': {
                name: 'mail.send',
                description: '发送邮件 (邮件系统v2-发送邮件，消耗灵石)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        recipientId: { type: 'string', description: '收件人ID' },
                        title: { type: 'string', description: '邮件标题' },
                        content: { type: 'string', description: '邮件内容' }
                    },
                    required: ['recipientId', 'title', 'content']
                }
            },
            'mail.read': {
                name: 'mail.read',
                description: '读取邮件内容 (邮件系统v2-读取邮件内容并标记已读)',
                inputSchema: { type: 'object', properties: { mailId: { type: 'string', description: '邮件ID' } }, required: ['mailId'] }
            },
            'mail.delete': {
                name: 'mail.delete',
                description: '删除邮件 (邮件系统v2-删除邮件，永久删除)',
                inputSchema: { type: 'object', properties: { mailId: { type: 'string', description: '邮件ID' } }, required: ['mailId'] }
            },
            'announce.list': {
                name: 'announce.list',
                description: '获取公告列表 (公告系统v2-获取所有公告)',
                inputSchema: { type: 'object', properties: {} }
            },
            'announce.view': {
                name: 'announce.view',
                description: '查看公告详情 (公告系统v2-查看公告详细内容)',
                inputSchema: { type: 'object', properties: { announceId: { type: 'string', description: '公告ID' } }, required: ['announceId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V154 (lines 43640-43671, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V154 = {
            'signin.list': {
                name: 'signin.list',
                description: '获取签到记录 (签到系统v2-获取签到记录和连续签到天数)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.checkin': {
                name: 'signin.checkin',
                description: '执行签到 (签到系统v2-执行每日签到)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.reward': {
                name: 'signin.reward',
                description: '领取签到奖励 (签到系统v2-领取连续签到奖励)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.makeup': {
                name: 'signin.makeup',
                description: '补签漏签日期 (签到系统v2-补签漏签日期，消耗灵石)',
                inputSchema: { type: 'object', properties: { date: { type: 'string', description: '补签日期 YYYY-MM-DD' } }, required: ['date'] }
            },
            'welfare.list': {
                name: 'welfare.list',
                description: '获取福利列表 (福利系统v2-获取可领取的福利列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利 (福利系统v2-领取指定福利)',
                inputSchema: { type: 'object', properties: { welfareId: { type: 'string', description: '福利ID' } }, required: ['welfareId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V155 (lines 43674-43705, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V155 = {
            'achievement.list': {
                name: 'achievement.list',
                description: '获取成就列表 (成就系统v2-获取所有成就及解锁状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'achievement.view': {
                name: 'achievement.view',
                description: '查看成就详情 (成就系统v2-查看指定成就的详细信息)',
                inputSchema: { type: 'object', properties: { achievementId: { type: 'string', description: '成就ID' } }, required: ['achievementId'] }
            },
            'achievement.unlock': {
                name: 'achievement.unlock',
                description: '解锁成就 (成就系统v2-手动解锁成就，需要满足条件)',
                inputSchema: { type: 'object', properties: { achievementId: { type: 'string', description: '成就ID' } }, required: ['achievementId'] }
            },
            'badge.list': {
                name: 'badge.list',
                description: '获取徽章列表 (徽章系统v2-获取所有徽章及装备状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'badge.equip': {
                name: 'badge.equip',
                description: '装备徽章 (徽章系统v2-装备指定徽章，最多装备3个)',
                inputSchema: { type: 'object', properties: { badgeId: { type: 'string', description: '徽章ID' } }, required: ['badgeId'] }
            },
            'badge.unequip': {
                name: 'badge.unequip',
                description: '卸下徽章 (徽章系统v2-卸下指定徽章)',
                inputSchema: { type: 'object', properties: { badgeId: { type: 'string', description: '徽章ID' } }, required: ['badgeId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V156 (lines 43708-43739, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V156 = {
            'rank.list': {
                name: 'rank.list',
                description: '获取各境界排行榜 (排行榜系统v2-获取各境界排行榜概览)',
                inputSchema: { type: 'object', properties: {} }
            },
            'rank.view': {
                name: 'rank.view',
                description: '查看指定排行榜详情 (排行榜系统v2-查看指定境界排名的详细信息)',
                inputSchema: { type: 'object', properties: { rankType: { type: 'string', description: '排行榜类型(foundation/essence/core/nascent/immortal)' } }, required: ['rankType'] }
            },
            'rank.reward': {
                name: 'rank.reward',
                description: '领取排行榜奖励 (排行榜系统v2-领取上周排名奖励)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.match': {
                name: 'arena.match',
                description: '开始竞技匹配 (竞技系统v2-匹配对手，消耗精力)',
                inputSchema: { type: 'object', properties: {} }
            },
            'arena.fight': {
                name: 'arena.fight',
                description: '发起战斗 (竞技系统v2-发起战斗，根据战力计算胜负)',
                inputSchema: { type: 'object', properties: { matchId: { type: 'string', description: '匹配ID' } }, required: ['matchId'] }
            },
            'arena.reward': {
                name: 'arena.reward',
                description: '领取竞技奖励 (竞技系统v2-领取每周奖励)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V157 (lines 43742-43773, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V157 = {
            'serendipity.list': {
                name: 'serendipity.list',
                description: '获取奇遇区域列表 (奇遇系统v2-获取所有奇遇区域，含冷却状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'serendipity.start': {
                name: 'serendipity.start',
                description: '开始奇遇探险 (奇遇系统v2-在指定区域开始奇遇探险，消耗精力)',
                inputSchema: { type: 'object', properties: { areaId: { type: 'string', description: '奇遇区域ID' } }, required: ['areaId'] }
            },
            'serendipity.complete': {
                name: 'serendipity.complete',
                description: '完成奇遇获得奖励 (奇遇系统v2-完成进行中的奇遇并获得灵石和特殊奖励)',
                inputSchema: { type: 'object', properties: { serendipityId: { type: 'string', description: '奇遇ID' } }, required: ['serendipityId'] }
            },
            'event.list': {
                name: 'event.list',
                description: '获取当前进行中的事件 (事件系统v2-获取当前进行中的事件，按时间过滤)',
                inputSchema: { type: 'object', properties: {} }
            },
            'event.join': {
                name: 'event.join',
                description: '参与事件 (事件系统v2-参与指定事件)',
                inputSchema: { type: 'object', properties: { eventId: { type: 'string', description: '事件ID' } }, required: ['eventId'] }
            },
            'event.reward': {
                name: 'event.reward',
                description: '领取事件奖励 (事件系统v2-领取事件完成的奖励)',
                inputSchema: { type: 'object', properties: { eventId: { type: 'string', description: '事件ID' } }, required: ['eventId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V158 (lines 43776-43807, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V158 = {
            'quest.list': {
                name: 'quest.list',
                description: '获取悬赏任务列表 (悬赏系统v2-获取所有可接取的悬赏任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'quest.accept': {
                name: 'quest.accept',
                description: '接受悬赏任务 (悬赏系统v2-接受指定的悬赏任务)',
                inputSchema: { type: 'object', properties: { questId: { type: 'string', description: '任务ID' } }, required: ['questId'] }
            },
            'quest.complete': {
                name: 'quest.complete',
                description: '完成任务领取奖励 (悬赏系统v2-完成任务并领取灵石奖励)',
                inputSchema: { type: 'object', properties: { questId: { type: 'string', description: '任务ID' } }, required: ['questId'] }
            },
            'chain.list': {
                name: 'chain.list',
                description: '获取任务链列表 (任务链系统v2-获取所有任务链概览)',
                inputSchema: { type: 'object', properties: {} }
            },
            'chain.progress': {
                name: 'chain.progress',
                description: '查看任务链进度 (任务链系统v2-查看指定任务链的详细进度)',
                inputSchema: { type: 'object', properties: { chainId: { type: 'string', description: '任务链ID' } }, required: ['chainId'] }
            },
            'chain.claim': {
                name: 'chain.claim',
                description: '领取任务链奖励 (任务链系统v2-领取完成所有步骤的任务链奖励)',
                inputSchema: { type: 'object', properties: { chainId: { type: 'string', description: '任务链ID' } }, required: ['chainId'] }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V159 (lines 43810-43841, 32 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V159 = {
            'investment.list': {
                name: 'investment.list',
                description: '获取投资项目列表 (投资系统v3-获取所有投资项目)',
                inputSchema: { type: 'object', properties: {} }
            },
            'investment.buy': {
                name: 'investment.buy',
                description: '购买投资份额 (投资系统v3-购买指定投资产品)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' }, amount: { type: 'number', description: '购买金额（默认最低投资额）' } }, required: ['investmentId'] }
            },
            'investment.profit': {
                name: 'investment.profit',
                description: '查看投资收益 (投资系统v3-查看每日结算收益)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' } }, required: ['investmentId'] }
            },
            'investment.redeem': {
                name: 'investment.redeem',
                description: '赎回投资本金 (投资系统v3-到期后赎回本金和收益)',
                inputSchema: { type: 'object', properties: { investmentId: { type: 'string', description: '投资产品ID' } }, required: ['investmentId'] }
            },
            'monthcard.status': {
                name: 'monthcard.status',
                description: '获取月卡状态 (月卡系统v3-查看月卡状态和剩余天数)',
                inputSchema: { type: 'object', properties: {} }
            },
            'monthcard.buy': {
                name: 'monthcard.buy',
                description: '购买月卡 (月卡系统v3-购买30天有效月卡)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V160 (lines 43844-43900, 57 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V160 = {
            'redpacket.list': {
                name: 'redpacket.list',
                description: '获取红包列表 (红包系统v2-获取所有可领取红包)',
                inputSchema: { type: 'object', properties: {} }
            },
            'redpacket.receive': {
                name: 'redpacket.receive',
                description: '领取红包 (红包系统v2-领取指定红包)',
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
                description: '发送红包 (红包系统v2-发送红包)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', description: '红包总金额' },
                        message: { type: 'string', description: '红包留言' }
                    },
                    required: ['amount']
                }
            },
            'friend.list': {
                name: 'friend.list',
                description: '获取好友列表 (社交系统v2-获取好友和申请列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'friend.apply': {
                name: 'friend.apply',
                description: '发送好友申请 (社交系统v2-申请添加好友)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        playerId: { type: 'string', description: '玩家ID' }
                    },
                    required: ['playerId']
                }
            },
            'friend.accept': {
                name: 'friend.accept',
                description: '接受好友申请 (社交系统v2-接受好友申请)',
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
// const MCP_TOOLS_V161 (lines 43903-43960, 58 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V161 = {
            'explore.list': {
                name: 'explore.list',
                description: '获取探险区域列表 (宠物探险系统v3-获取所有探险区域及冷却状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'explore.start': {
                name: 'explore.start',
                description: '开始探险 (宠物探险系统v3-消耗精力开始探险)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        areaId: { type: 'string', description: '探险区域ID' },
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['areaId', 'petId']
                }
            },
            'explore.complete': {
                name: 'explore.complete',
                description: '完成探险领取奖励 (宠物探险系统v3-完成探险获得灵石和宠物经验)',
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
                description: '获取派遣任务列表 (派遣系统v3-获取所有可接受的派遣任务)',
                inputSchema: { type: 'object', properties: {} }
            },
            'dispatch.accept': {
                name: 'dispatch.accept',
                description: '接受派遣任务 (派遣系统v3-接受派遣任务，需宠物空闲)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        taskId: { type: 'string', description: '任务ID' },
                        petId: { type: 'string', description: '宠物ID' }
                    },
                    required: ['taskId', 'petId']
                }
            },
            'dispatch.complete': {
                name: 'dispatch.complete',
                description: '完成派遣任务 (派遣系统v3-完成派遣任务获得奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        taskId: { type: 'string', description: '任务ID' }
                    },
                    required: ['taskId']
                }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V162 (lines 43963-44012, 50 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V162 = {
            'codex.list': {
                name: 'codex.list',
                description: '获取图鉴列表 (图鉴系统v3-获取所有分类及解锁进度)',
                inputSchema: { type: 'object', properties: {} }
            },
            'codex.view': {
                name: 'codex.view',
                description: '查看图鉴详情 (图鉴系统v3-查看指定图鉴详情)',
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
                description: '解锁图鉴 (图鉴系统v3-消耗灵石解锁图鉴)',
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
                description: '获取收集统计 (收集系统v3-获取收集完成度和奖励状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'collection.reward': {
                name: 'collection.reward',
                description: '领取收集奖励 (收集系统v3-领取指定档位的收集奖励)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tier: { type: 'number', description: '奖励档位(1-5)' }
                    },
                    required: ['tier']
                }
            },
            'collection.reset': {
                name: 'collection.reset',
                description: '重置收集进度 (收集系统v3-重置所有收集进度，需消耗灵石)',
                inputSchema: { type: 'object', properties: {} }
            }
        };

// ------------------------------------------------------------
// const MCP_TOOLS_V163 (lines 44015-44072, 58 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V163 = {
            'mail.list': {
                name: 'mail.list',
                description: '获取邮件列表 (邮件系统v3-获取收件箱和已发送邮件列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'mail.send': {
                name: 'mail.send',
                description: '发送邮件 (邮件系统v3-发送邮件，消耗10灵石)',
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
                description: '读取邮件内容 (邮件系统v3-读取邮件并标记为已读)',
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
                description: '删除邮件 (邮件系统v3-删除指定邮件)',
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
                description: '获取公告列表 (公告系统v3-获取未过期的公告列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'announce.view': {
                name: 'announce.view',
                description: '查看公告详情 (公告系统v3-查看公告详情并标记为已查看)',
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
// const MCP_TOOLS_V164 (lines 44075-44118, 44 lines)
// ------------------------------------------------------------
        const MCP_TOOLS_V164 = {
            'signin.list': {
                name: 'signin.list',
                description: '获取签到列表 (签到系统v3-获取本月签到记录和奖励状态)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.checkin': {
                name: 'signin.checkin',
                description: '执行签到 (签到系统v3-执行今日签到，连续签到获得加成)',
                inputSchema: { type: 'object', properties: {} }
            },
            'signin.reward': {
                name: 'signin.reward',
                description: '领取签到奖励 (签到系统v3-领取指定天数的签到奖励)',
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
                description: '补签前一天 (签到系统v3-补签前一天，消耗50灵石，每天限1次)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.list': {
                name: 'welfare.list',
                description: '获取福利列表 (福利系统v3-获取可用福利列表)',
                inputSchema: { type: 'object', properties: {} }
            },
            'welfare.claim': {
                name: 'welfare.claim',
                description: '领取福利 (福利系统v3-领取指定福利，消耗积分或完成任务)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        welfareId: { type: 'string', description: '福利ID' }
                    },
                    required: ['welfareId']
                }
            }
        };
