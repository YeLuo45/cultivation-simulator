// ============================================================
// ToolRouter.js - MCP Tool Router and Version Management
// Extracted from game.js - cultivation-simulator
// Auto-generated - Do not edit manually
// ============================================================

// initToolRegistry (lines 3304-3848)

            initToolRegistry() {
                for (const [name, tool] of Object.entries(MCP_TOOLS)) {
                    this.toolRegistry.set(name, tool);
                }
                // V74: Register new tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V74)) {
                    this.toolRegistry.set(name, tool);
                }
                // V80: Register arena tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V80)) {
                    this.toolRegistry.set(name, tool);
                }
                // V81: Register sect tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V81)) {
                    this.toolRegistry.set(name, tool);
                }
                // V82: Register technique & skill DAG tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V82)) {
                    this.toolRegistry.set(name, tool);
                }
                // V83: Register tribulation tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V83)) {
                    this.toolRegistry.set(name, tool);
                }
                // V84: Register artifact tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V84)) {
                    this.toolRegistry.set(name, tool);
                }
                // V85: Register pet tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V85)) {
                    this.toolRegistry.set(name, tool);
                }
                // V86: Register alchemy tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V86)) {
                    this.toolRegistry.set(name, tool);
                }
                // V87: Register economy and karma tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V87)) {
                    this.toolRegistry.set(name, tool);
                }
                // V88: Register celestial market and serendipity tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V88)) {
                    this.toolRegistry.set(name, tool);
                }
                // V89: Register leaderboard, war report, and ladder tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V89)) {
                    this.toolRegistry.set(name, tool);
                }
                // V90: Register star map, spirit root, and explore tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V90)) {
                    this.toolRegistry.set(name, tool);
                }
                // V91: Register budget control tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V91)) {
                    this.toolRegistry.set(name, tool);
                }
                // V92: Register secret realm exploration tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V92)) {
                    this.toolRegistry.set(name, tool);
                }
                // V93: Register MCP Agent Bridge tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V93)) {
                    this.toolRegistry.set(name, tool);
                }
                // V94: Register AI Budget Control tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V94)) {
                    this.toolRegistry.set(name, tool);
                }
                // V95: Register Multi-Agent Quest Orchestration tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V95)) {
                    this.toolRegistry.set(name, tool);
                }
                // V96: Register Quest Deepening + NPC Collaboration + Five-Layer Memory Crystallization tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V96)) {
                    this.toolRegistry.set(name, tool);
                }
                // V97: Register NPC Skill Market + Crystallized SOP Trading + Cross-Server Sect War tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V97)) {
                    this.toolRegistry.set(name, tool);
                }
                // V98: Register Cross-Server Sect War + Multi-Agent Coordination + Skill Combo tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V98)) {
                    this.toolRegistry.set(name, tool);
                }
                // V99: Register 天道编辑器 DAG任务链 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V99)) {
                    this.toolRegistry.set(name, tool);
                }
                // V100: Register 仙界纪元系统 多纪元轮回 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V100)) {
                    this.toolRegistry.set(name, tool);
                }
                // V101: Register 仙盟系统 仙盟创建+领地争夺 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V101)) {
                    this.toolRegistry.set(name, tool);
                }
                // V102: Register 天命轮回增强+仙界仲裁庭系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V102)) {
                    this.toolRegistry.set(name, tool);
                }
                // V103: Register 仙界天机阁+命格系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V103)) {
                    this.toolRegistry.set(name, tool);
                }
                // V104: Register 轮回池+因果簿系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V104)) {
                    this.toolRegistry.set(name, tool);
                }
                // V105: Register 秘境争夺+混沌灵宝系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V105)) {
                    this.toolRegistry.set(name, tool);
                }
                // V106: Register 天道轮回+因果律系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V106)) {
                    this.toolRegistry.set(name, tool);
                }
                // V107: Register 仙界天榜+封神系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V107)) {
                    this.toolRegistry.set(name, tool);
                }
                // V108: Register 仙界遗迹+混沌法则系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V108)) {
                    this.toolRegistry.set(name, tool);
                }
                // V109: Register 仙界试炼+飞升系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V109)) {
                    this.toolRegistry.set(name, tool);
                }
                // V110: Register 天道誓言+因果誓约系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V110)) {
                    this.toolRegistry.set(name, tool);
                }
                // V111: Register 仙界奇遇+机缘系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V111)) {
                    this.toolRegistry.set(name, tool);
                }
                // V112: Register 仙界联盟+气运系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V112)) {
                    this.toolRegistry.set(name, tool);
                }
                // V113: Register 仙界商城+兑换系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V113)) {
                    this.toolRegistry.set(name, tool);
                }
                // GM: Register GM工具系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_GM)) {
                    this.toolRegistry.set(name, tool);
                }
                // V114: Register 仙界任务+成就系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V114)) {
                    this.toolRegistry.set(name, tool);
                }
                // V115: Register 仙界图鉴+收集系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V115)) {
                    this.toolRegistry.set(name, tool);
                }
                // V116: Register 仙界排行榜+荣耀系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V116)) {
                    this.toolRegistry.set(name, tool);
                }
                // V117: Register 仙界签到+福利系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V117)) {
                    this.toolRegistry.set(name, tool);
                }
                // V118: Register 仙界公告+邮件系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V118)) {
                    this.toolRegistry.set(name, tool);
                }
                // V119: Register 七日特惠+限时商店系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V119)) {
                    this.toolRegistry.set(name, tool);
                }
                // V120: Register 仙界投资+月卡系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V120)) {
                    this.toolRegistry.set(name, tool);
                }
                // V121: Register 宠物探险+派遣系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V121)) {
                    this.toolRegistry.set(name, tool);
                }
                // V122: Register 红包+社交系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V122)) {
                    this.toolRegistry.set(name, tool);
                }
                // V123: Register 投票+问卷系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V123)) {
                    this.toolRegistry.set(name, tool);
                }
                // V124: Register 成就+称号系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V124)) {
                    this.toolRegistry.set(name, tool);
                }
                // V125: Register 邮件+消息系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V125)) {
                    this.toolRegistry.set(name, tool);
                }
                // V126: Register 地图+探索系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V126)) {
                    this.toolRegistry.set(name, tool);
                }
                // V127: Register 商店+背包系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V127)) {
                    this.toolRegistry.set(name, tool);
                }
                // V128: Register 任务+日常系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V128)) {
                    this.toolRegistry.set(name, tool);
                }
                // V129: Register 境界+突破系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V129)) {
                    this.toolRegistry.set(name, tool);
                }
                // V130: Register 宗门+弟子系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V130)) {
                    this.toolRegistry.set(name, tool);
                }
                // V131: Register 秘宝+装备系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V131)) {
                    this.toolRegistry.set(name, tool);
                }
                // V132: Register 灵宠+进化系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V132)) {
                    this.toolRegistry.set(name, tool);
                }
                // V133: Register 丹药+炼药系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V133)) {
                    this.toolRegistry.set(name, tool);
                }
                // V134: Register 阵法+符箓系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V134)) {
                    this.toolRegistry.set(name, tool);
                }
                // V135: Register 奇遇+事件系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V135)) {
                    this.toolRegistry.set(name, tool);
                }
                // V136: Register 悬赏+任务链系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V136)) {
                    this.toolRegistry.set(name, tool);
                }
                // V137: Register 成就+徽章系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V137)) {
                    this.toolRegistry.set(name, tool);
                }
                // V138: Register 排行榜+竞技系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V138)) {
                    this.toolRegistry.set(name, tool);
                }
                // V140: Register 图鉴+收集系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V140)) {
                    this.toolRegistry.set(name, tool);
                }
                // V141: Register 邮件+公告系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V141)) {
                    this.toolRegistry.set(name, tool);
                }
                // V142: Register 签到+福利系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V142)) {
                    this.toolRegistry.set(name, tool);
                }
                // V143: Register 投资+月卡系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V143)) {
                    this.toolRegistry.set(name, tool);
                }
                // V144: Register 红包+社交系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V144)) {
                    this.toolRegistry.set(name, tool);
                }
                // V145: Register 宠物探险+派遣系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V145)) {
                    this.toolRegistry.set(name, tool);
                }
                // V146: Register 成就+徽章系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V146)) {
                    this.toolRegistry.set(name, tool);
                }
                // V147: Register 排行榜+竞技系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V147)) {
                    this.toolRegistry.set(name, tool);
                }
                // V148: Register 奇遇+事件系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V148)) {
                    this.toolRegistry.set(name, tool);
                }
                // V149: Register 悬赏+任务链系统 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V149)) {
                    this.toolRegistry.set(name, tool);
                }
                // V150: Register 投资+月卡系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V150)) {
                    this.toolRegistry.set(name, tool);
                }
                // V151: Register 宠物探险+派遣系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V151)) {
                    this.toolRegistry.set(name, tool);
                }
                // V152: Register 图鉴+收集系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V152)) {
                    this.toolRegistry.set(name, tool);
                }
                // V153: Register 邮件+公告系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V153)) {
                    this.toolRegistry.set(name, tool);
                }
                // V154: Register 签到+福利系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V154)) {
                    this.toolRegistry.set(name, tool);
                }
                // V155: Register 成就+徽章系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V155)) {
                    this.toolRegistry.set(name, tool);
                }
                // V156: Register 排行榜+竞技系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V156)) {
                    this.toolRegistry.set(name, tool);
                }
                // V157: Register 奇遇+事件系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V157)) {
                    this.toolRegistry.set(name, tool);
                }
                // V158: Register 悬赏+任务链系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V158)) {
                    this.toolRegistry.set(name, tool);
                }
                // V159: Register 投资+月卡系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V159)) {
                    this.toolRegistry.set(name, tool);
                }
                // V160: Register 红包+社交系统v2 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V160)) {
                    this.toolRegistry.set(name, tool);
                }
                // V161: Register 宠物探险+派遣系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V161)) {
                    this.toolRegistry.set(name, tool);
                }
                // V162: Register 图鉴+收集系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V162)) {
                    this.toolRegistry.set(name, tool);
                }
                // V163: Register 邮件+公告系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V163)) {
                    this.toolRegistry.set(name, tool);
                }
                // V164: Register 签到+福利系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V164)) {
                    this.toolRegistry.set(name, tool);
                }
                // V165: Register 成就+徽章系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V165)) {
                    this.toolRegistry.set(name, tool);
                }
                // V166: Register 排行榜+竞技系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V166)) {
                    this.toolRegistry.set(name, tool);
                }
                // V167: Register 奇遇+事件系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V167)) {
                    this.toolRegistry.set(name, tool);
                }
                // V168: Register 悬赏+任务链系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V168)) {
                    this.toolRegistry.set(name, tool);
                }
                // V169: Register 投资+月卡系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V169)) {
                    this.toolRegistry.set(name, tool);
                }
                // V170: Register 红包+社交系统v3 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V170)) {
                    this.toolRegistry.set(name, tool);
                }
                // V171: Register 宠物探险+派遣系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V171)) {
                    this.toolRegistry.set(name, tool);
                }
                // V172: Register 图鉴+收集系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V172)) {
                    this.toolRegistry.set(name, tool);
                }
                // V173: Register 邮件+公告系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V173)) {
                    this.toolRegistry.set(name, tool);
                }
                // V174: Register 签到+福利系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V174)) {
                    this.toolRegistry.set(name, tool);
                }
                // V175: Register 成就+徽章系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V175)) {
                    this.toolRegistry.set(name, tool);
                }
                // V176: Register 排行榜+竞技系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V176)) {
                    this.toolRegistry.set(name, tool);
                }
                // V177: Register 奇遇+事件系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V177)) {
                    this.toolRegistry.set(name, tool);
                }
                // V178: Register 悬赏+任务链系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V178)) {
                    this.toolRegistry.set(name, tool);
                }
                // V179: Register 投资+月卡系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V179)) {
                    this.toolRegistry.set(name, tool);
                }
                // V180: Register 红包+社交系统v4 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V180)) {
                    this.toolRegistry.set(name, tool);
                }
                // V181: Register 宠物探险+派遣系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V181)) {
                    this.toolRegistry.set(name, tool);
                }
                // V182: Register 图鉴+收集系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V182)) {
                    this.toolRegistry.set(name, tool);
                }
                // V183: Register 邮件+公告系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V183)) {
                    this.toolRegistry.set(name, tool);
                }
                // V184: Register 签到+福利系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V184)) {
                    this.toolRegistry.set(name, tool);
                }
                // V185: Register 成就+徽章系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V185)) {
                    this.toolRegistry.set(name, tool);
                }
                // V186: Register 排行榜+竞技系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V186)) {
                    this.toolRegistry.set(name, tool);
                }
                // V187: Register 奇遇+事件系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V187)) {
                    this.toolRegistry.set(name, tool);
                }
                // V188: Register 悬赏+任务链系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V188)) {
                    this.toolRegistry.set(name, tool);
                }
                // V189: Register 投资+月卡系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V189)) {
                    this.toolRegistry.set(name, tool);
                }
                // V190: Register 红包+社交系统v5 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V190)) {
                    this.toolRegistry.set(name, tool);
                }
                // V191: Register 宠物探险+派遣系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V191)) {
                    this.toolRegistry.set(name, tool);
                }
                // V192: Register 图鉴+收集系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V192)) {
                    this.toolRegistry.set(name, tool);
                }
                // V193: Register 邮件+公告系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V193)) {
                    this.toolRegistry.set(name, tool);
                }
                // V195: Register 成就+徽章系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V195)) {
                    this.toolRegistry.set(name, tool);
                }
                // V194: Register 签到+福利系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V194)) {
                    this.toolRegistry.set(name, tool);
                }
                // V196: Register 排行榜+竞技系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V196)) {
                    this.toolRegistry.set(name, tool);
                }
                // V197: Register 奇遇+事件系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V197)) {
                    this.toolRegistry.set(name, tool);
                }
                // V198: Register 悬赏+任务链系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V198)) {
                    this.toolRegistry.set(name, tool);
                }
                // V199: Register 投资+月卡系统v7 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V199)) {
                    this.toolRegistry.set(name, tool);
                }
                // V200: Register 红包+社交系统v6 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V200)) {
                    this.toolRegistry.set(name, tool);
                }
                // V201: Register 宠物探险+派遣系统v7 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V201)) {
                    this.toolRegistry.set(name, tool);
                }
                // V202: Register 签到+福利系统v7 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V202)) {
                    this.toolRegistry.set(name, tool);
                }
                // V203: Register 成就+徽章系统v7 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V203)) {
                    this.toolRegistry.set(name, tool);
                }
                // V204: Register 排行榜+竞技系统v7 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V204)) {
                    this.toolRegistry.set(name, tool);
                }
                // V205: Register 奇遇+事件系统v7 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V205)) {
                    this.toolRegistry.set(name, tool);
                }
                // V206: Register 悬赏+任务链系统v7 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V206)) {
                    this.toolRegistry.set(name, tool);
                }
                // V207: Register 投资+月卡系统v8 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V207)) {
                    this.toolRegistry.set(name, tool);
                }
                // V208: Register 红包+社交系统v7 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V208)) {
                    this.toolRegistry.set(name, tool);
                }
                // V209: Register 宠物探险+派遣系统v8 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V209)) {
                    this.toolRegistry.set(name, tool);
                }
                // V210: Register 图鉴+收集系统v8 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V210)) {
                    this.toolRegistry.set(name, tool);
                }
                // V211: Register 邮件+公告系统v8 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V211)) {
                    this.toolRegistry.set(name, tool);
                }
                // V212: Register 签到+福利系统v8 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V212)) {
                    this.toolRegistry.set(name, tool);
                }
                // V213: Register 成就+徽章系统v8 tools
                for (const [name, tool] of Object.entries(MCP_TOOLS_V213)) {
                    this.toolRegistry.set(name, tool);
                }
            }

// listTools (lines 3857-3861)

                        return this.listTools();
                    case 'tools.call':
                        return this.callTool(params.name, params.arguments);
                    default:
                        return { error: { code: -32601, message: `Method not found: ${method}` }, id };

// callTool (lines 3874-3874)

            callTool(name, args) {
