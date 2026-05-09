#!/usr/bin/env python3
"""Split cultivation-simulator into 11 modules using explicit function/module mapping."""
import re, os

# Read original
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
script = m.group(1)
lines = script.split('\n')

# Every function and its target module
# Format: 'function_name': 'module.js'
FUNCTION_MAP = {
    # === data.js: reference data + game logic helpers ===
    'getStarDisplay': 'data.js',
    'getStarColor': 'data.js',
    'getEnhanceCost': 'data.js',
    'checkEnhanceMaterials': 'data.js',
    'openEnhanceFromInventory': 'data.js',
    'openEnhanceFromEquip': 'data.js',
    'openEnhancePanel': 'data.js',
    'closeEnhancePanel': 'data.js',
    'getBaseEffectValue': 'data.js',
    'doEnhance': 'data.js',
    'showUltimateSkillPanel': 'data.js',
    'getSkillUpgradeCost': 'data.js',
    'upgradeUltimateSkill': 'data.js',
    'selectUltimateSkill': 'data.js',
    'addEnergy': 'data.js',
    'getQualityColor': 'data.js',
    'openSettings': 'data.js',
    'closeSettings': 'data.js',
    'switchSettingsTab': 'data.js',
    'saveSettings': 'data.js',
    'resetSettings': 'data.js',
    'callMiniMaxAPI': 'data.js',
    'showGameOverScreen': 'data.js',
    'generateRandomSpiritRoot': 'data.js',
    'getSpiritRootSpeedBonus': 'data.js',
    'getSpiritRootBottleneckBonus': 'data.js',
    'getSpiritRootTribulationBonus': 'data.js',
    'getFiveElementBonus': 'data.js',
    'getHighestElementBonus': 'data.js',
    'refreshSpiritRoot': 'data.js',
    'initializeConstitutionEffects': 'data.js',
    'findWeakestConstitution': 'data.js',
    'recalculateConstitutionEffects': 'data.js',
    'updateSpiritRootDisplay': 'data.js',
    'openSpiritRootModal': 'data.js',
    'closeSpiritRootModal': 'data.js',
    'getAchievementProgress': 'data.js',
    'getAchievementProgressText': 'data.js',
    'getRewardText': 'data.js',
    'getAchievementRewardText': 'data.js',
    'acquireConstitutionFromSerendipity': 'data.js',
    'addLog': 'data.js',

    # === cultivation.js ===
    'renderLog': 'cultivation.js',
    'doCultivate': 'cultivation.js',
    'doMorningExercise': 'cultivation.js',
    'getLocalRandomEvent': 'cultivation.js',
    'displayEventModal': 'cultivation.js',
    'getTribulationKey': 'cultivation.js',
    'localBreakthrough': 'cultivation.js',
    'displayBreakthroughResult': 'cultivation.js',
    'showTribulationUI': 'cultivation.js',
    'updatePrepList': 'cultivation.js',
    'addPreparation': 'cultivation.js',
    'calculateTribulationSuccess': 'cultivation.js',
    'generateTribulationScene': 'cultulation.js',  # will fix typo
    'getDefaultTribulationScene': 'cultivation.js',
    'executeTribulation': 'cultivation.js',
    'handleGreatSuccess': 'cultivation.js',
    'handleSuccess': 'cultivation.js',
    'handleInjury': 'cultivation.js',
    'handleDeath': 'cultivation.js',
    'closeTribulationModal': 'cultivation.js',
    'cancelTribulation': 'cultivation.js',
    'getPlayerTechnique': 'cultivation.js',

    # === combat.js ===
    'calculateSetBonuses': 'combat.js',
    'recalculatePlayerStats': 'combat.js',
    'getCurrentUltimateSkills': 'combat.js',
    'getEnergyBar': 'combat.js',
    'executeUltimateSkill': 'combat.js',
    'generateOpponent': 'combat.js',
    'openCombat': 'combat.js',
    'closeCombat': 'combat.js',
    'renderCombatHome': 'combat.js',
    'getItemCount': 'combat.js',
    'startCombatChallenge': 'combat.js',
    'initCombat': 'combat.js',
    'renderUltimateEnergyBar': 'combat.js',
    'renderCounterEnergyBar': 'combat.js',
    'addCombatLog': 'combat.js',
    'addEventLog': 'combat.js',
    'showCombatLogHistory': 'combat.js',
    'clearCombatLogHistory': 'combat.js',
    'showEventLogHistory': 'combat.js',
    'clearEventLogHistory': 'combat.js',
    'renderCombatArena': 'combat.js',
    'renderPlayerActions': 'combat.js',
    'selectCombatAction': 'combat.js',
    'showTreasureMenu': 'combat.js',
    'useCombatTreasure': 'combat.js',
    'showPillMenu': 'combat.js',
    'useCombatPill': 'combat.js',
    'showTechniqueInfo': 'combat.js',
    'executePlayerAttack': 'combat.js',
    'executePlayerDefend': 'combat.js',
    'executePlayerEscape': 'combat.js',
    'executeOpponentTurn': 'combat.js',
    'endCombat': 'combat.js',
    'renderCombatResult': 'combat.js',

    # === sect.js ===
    'openSect': 'sect.js',
    'closeSect': 'sect.js',
    'renderSectHome': 'sect.js',
    'switchSectTab': 'sect.js',
    'renderCreateSectForm': 'sect.js',
    'createSect': 'sect.js',
    'renderDisciplesTab': 'sect.js',
    'renderBuildingsTab': 'sect.js',
    'renderTechniquesTab': 'sect.js',
    'renderContributionShop': 'sect.js',
    'renderManageTab': 'sect.js',
    'recruitDisciple': 'sect.js',
    'addDisciple': 'sect.js',
    'weightedRandom': 'sect.js',
    'collectSectResources': 'sect.js',
    'calculateSectIncome': 'sect.js',
    'buildBuilding': 'sect.js',
    'upgradeSect': 'sect.js',
    'donateTechnique': 'sect.js',
    'learnSectTechnique': 'sect.js',
    'refreshContributionShop': 'sect.js',
    'getPlayerContribution': 'sect.js',
    'buyContributionItem': 'sect.js',
    'addItemToInventory': 'sect.js',
    'assignElder': 'sect.js',
    'removeElder': 'sect.js',
    'disbandSect': 'sect.js',
    'checkSectCreation': 'sect.js',

    # === serendipity.js ===
    'calculateSerendipityChance': 'serendipity.js',
    'checkSerendipity': 'serendipity.js',
    'triggerRandomSerendipity': 'serendipity.js',
    'generateAiSerendipity': 'serendipity.js',
    'getDefaultSerendipityText': 'serendipity.js',
    'executeSerendipity': 'serendipity.js',
    'showSerendipityModal': 'serendipity.js',
    'handleSerendipityChoice': 'serendipity.js',
    'startSecretRealmBattle': 'serendipity.js',
    'generateRealmName': 'serendipity.js',
    'getDefaultRealmName': 'serendipity.js',
    'generateRealmEnemies': 'serendipity.js',
    'showSecretRealmBattleUI': 'serendipity.js',
    'attackRealmEnemy': 'serendipity.js',
    'defendRealmAttack': 'serendipity.js',
    'completeSecretRealm': 'serendipity.js',
    'failSecretRealm': 'serendipity.js',
    'skipRealmBattle': 'serendipity.js',
    'closeSerendipityModal': 'serendipity.js',
    'openSerendipityLog': 'serendipity.js',
    'useExploreTalisman': 'serendipity.js',
    'processEndOfDaySerendipity': 'serendipity.js',
    'buySerendipityItem': 'serendipity.js',

    # === worldmap.js ===
    'initWorldMap': 'worldmap.js',
    'openWorldMap': 'worldmap.js',
    'closeWorldMap': 'worldmap.js',
    'renderWorldMap': 'worldmap.js',
    'renderRegionDetail': 'worldmap.js',
    'selectContinent': 'worldmap.js',
    'selectRegion': 'worldmap.js',
    'travelToContinent': 'worldmap.js',
    'enterRegion': 'worldmap.js',
    'triggerWildEncounter': 'worldmap.js',
    'triggerBossEncounter': 'worldmap.js',
    'startMonsterBattle': 'worldmap.js',
    'startBossBattle': 'worldmap.js',
    'triggerSecretRealm': 'worldmap.js',
    'calculatePlayerPower': 'worldmap.js',
    'removeFromInventory': 'worldmap.js',
    'updateMinimapDisplay': 'worldmap.js',

    # === crafting.js ===
    'openShop': 'crafting.js',
    'closeShop': 'crafting.js',
    'generateShopItems': 'crafting.js',
    'renderShopItems': 'crafting.js',
    'buyItem': 'crafting.js',
    'refreshShop': 'crafting.js',
    'openCrafting': 'crafting.js',
    'openAlchemy': 'crafting.js',
    'openForge': 'crafting.js',
    'closeAlchemy': 'crafting.js',
    'renderCraftingRecipes': 'crafting.js',
    'getRecipeQuality': 'crafting.js',
    'selectFurnace': 'crafting.js',
    'upgradeFurnace': 'crafting.js',
    'selectCraftRecipe': 'crafting.js',
    'checkMaterialsForRecipe': 'crafting.js',
    'getPillEffect': 'crafting.js',
    'returnCraftMaterials': 'crafting.js',
    'openMarket': 'crafting.js',
    'renderMarketItems': 'crafting.js',
    'listItem': 'crafting.js',
    'buyFromMarket': 'crafting.js',
    'selectRecipe': 'crafting.js',
    'craftPill': 'crafting.js',
    'checkMaterials': 'crafting.js',
    'consumeMaterials': 'crafting.js',
    'returnMaterials': 'crafting.js',

    # === achievements.js ===
    'checkAchievements': 'achievements.js',
    'getTitleBonus': 'achievements.js',
    'equipTitle': 'achievements.js',
    'openAchievements': 'achievements.js',
    'closeAchievements': 'achievements.js',
    'renderAchievements': 'achievements.js',
    'renderSpiritRootContent': 'achievements.js',

    # === core.js ===
    'showModal': 'core.js',
    'closeModal': 'core.js',
    'openModal': 'core.js',
    'manualSave': 'core.js',
    'saveGame': 'core.js',
    'showSaveLoadModal': 'core.js',
    'doSaveGame': 'core.js',
    'doLoadGame': 'core.js',
    'doResetGame': 'core.js',
    'showAutoSaveInfo': 'core.js',
    'recalculateAllEffects': 'core.js',
    'updateEquipmentBar': 'core.js',
    'renderSetStatus': 'core.js',
    'openEquipSlotMenu': 'core.js',
    'closeEquipSlotMenu': 'core.js',
    'unequipTreasure': 'core.js',
    'addToInventory': 'core.js',
    'addToInventoryObj': 'core.js',
    'openInventory': 'core.js',
    'closeInventory': 'core.js',
    'switchInvTab': 'core.js',
    'renderInventoryGrid': 'core.js',
    'selectInvItem': 'core.js',
    'usePill': 'core.js',
    'equipTreasure': 'core.js',
    'sellItem': 'core.js',
    'discardItem': 'core.js',

    # === init.js ===
    'init': 'init.js',
    'loadMiniMaxConfig': 'init.js',
    'startNewGame': 'init.js',
    'loadGame': 'init.js',
    'showGameUI': 'init.js',
    'updateDisplay': 'init.js',
}

# Fix typo
FUNCTION_MAP['generateTribulationScene'] = 'cultivation.js'

def extract_function(lines, start_line):
    """Extract a function definition starting at start_line (0-indexed)."""
    # Find opening brace
    start = start_line
    while start < len(lines) and '{' not in lines[start]:
        start += 1
    if start >= len(lines):
        return None, None
    
    brace_count = 0
    for i in range(start, len(lines)):
        for ch in lines[i]:
            if ch == '{':
                brace_count += 1
            elif ch == '}':
                brace_count -= 1
                if brace_count == 0:
                    return lines[start_line:i+1], i
    return None, None

# Parse all functions from script lines
func_starts = {}  # name -> line_index (0-indexed)
for i, line in enumerate(lines):
    m = re.match(r'^        function (\w+)\s*\(', line)
    if m:
        func_starts[m.group(1)] = i

print(f"Found {len(func_starts)} functions")

# Extract each function
extracted = {}  # name -> list_of_lines
remaining_lines = list(range(len(lines)))  # track which lines are consumed

for fname, mod in FUNCTION_MAP.items():
    if fname not in func_starts:
        print(f"WARNING: {fname} not found in script")
        continue
    start = func_starts[fname]
    func_lines, end = extract_function(lines, start)
    if func_lines:
        extracted[fname] = (mod, func_lines)
        for i in range(start, end+1):
            remaining_lines[i] = -1
    else:
        print(f"WARNING: Could not extract {fname}")

# Group by module
modules = {}
for fname, (mod, func_lines) in extracted.items():
    if mod not in modules:
        modules[mod] = []
    modules[mod].append((fname, func_lines))

# Data constants (lines before first function) go to data.js
first_func_line = min(func_starts.values())

# Explicit data block ranges for modules that need specific const/let declarations
# Each entry: (module, start_line_1indexed, end_line_1indexed, declaration_name)
DATA_BLOCK_RANGES = {
    'config.js': [
        (3, 11, 'CONFIG'),
        (15, 23, 'PILLS'),
        (27, 35, 'TREASURES'),
        (39, 49, 'COMBAT_TREASURES'),
        (53, 58, 'COMBAT_PILLS'),
        (61, 86, 'ENHANCE_CONFIG'),
        (888, 934, 'TRIBULATIONS'),
        (939, 943, 'FURNACES'),
        (947, 951, 'ANVILS'),
        (954, 962, 'ALCHEMY_RECIPES'),
        (965, 972, 'FORGE_RECIPES'),
        (976, 984, 'MATERIALS'),
        (988, 1037, 'ADVANCED_FORGE_RECIPES'),
        (1041, 1265, 'SERENDIPITY_EVENTS'),
        (1268, 1273, 'SERENDIPITY_TALISMANS'),
        (1278, 1285, 'SPIRIT_ROOT_QUALITIES'),
        (1288, 1294, 'FIVE_ELEMENT_TECHNIQUES'),
        (1297, 1360, 'CONSTITUTIONS'),
        (1483, 1489, 'REALM_REQUIREMENTS'),
        (1505, 1515, 'DEFAULT_MINIMAX_CONFIG'),
        (5014, 5019, 'TECHNIQUE_BONUS'),
        (5020, 5025, 'TECHNIQUE_COLORS'),
        (6086, 6101, 'SECT_CONFIG'),
        (6104, 6111, 'SECT_TECHNIQUES'),
    ],
    'state.js': [
        (1366, 1480, 'gameState'),
        (1492, 1502, 'miniMaxConfig'),
        (5037, 5051, 'combatState'),
        (7391, 7398, 'secretRealmState'),
    ],
    'ui.js': [
        (7877, 7926, 'CONTINENTS'),
        (7929, 8052, 'REGIONS'),
        (8055, 8086, 'SECRET_REALMS'),
    ],
}

# Build set of lines that are consumed by explicit data block ranges
explicit_data_lines = set()
for mod, ranges in DATA_BLOCK_RANGES.items():
    for start, end, name in ranges:
        for i in range(start - 1, end):  # convert to 0-indexed
            explicit_data_lines.add(i)

# Build set of lines consumed by function extraction
func_lines_consumed = set()
for fname, (mod, func_lines) in extracted.items():
    start_idx = func_starts[fname]
    _, end_idx = extract_function(lines, start_idx)
    for i in range(start_idx, end_idx + 1):
        func_lines_consumed.add(i)

# Remaining lines = not consumed by functions, not in explicit data blocks, not comments
remaining_lines_set = set()
for i in range(len(lines)):
    if i not in func_lines_consumed and i not in explicit_data_lines:
        stripped = lines[i].strip()
        if stripped and not stripped.startswith('//'):
            remaining_lines_set.add(i)

print(f"\nFirst function at line {first_func_line + 1}")
print(f"Explicit data block lines: {len(explicit_data_lines)}")
print(f"Function lines consumed: {len(func_lines_consumed)}")
print(f"Remaining unassigned lines: {len(remaining_lines_set)}")
print(f"\nModule distribution:")
for mod in sorted(modules.keys()):
    total = sum(len(f[1]) for f in modules[mod])
    print(f"  {mod}: {len(modules[mod])} functions, {total} lines")

# Write modules
os.makedirs('js', exist_ok=True)

# Write data.js first (with remaining unassigned lines + data functions)
data_content = "// Auto-generated module: data.js\n'use strict';\n\n"
# Add remaining unassigned lines first
remaining_sorted = sorted(remaining_lines_set)
for i in remaining_sorted:
    data_content += lines[i] + '\n'
# Add data.js functions
for fname, func_lines in sorted(modules.get('data.js', []), key=lambda x: func_starts[x[0]]):
    data_content += f"        // ===== {fname} =====\n"
    data_content += '\n'.join(func_lines) + '\n\n'
with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(data_content)
print(f"Wrote js/data.js: {len(data_content)} chars")

# Write config.js, state.js, ui.js with their data blocks
for mod_name in ['config.js', 'state.js', 'ui.js']:
    content = f"// Auto-generated module: {mod_name}\n'use strict';\n\n"
    if mod_name in DATA_BLOCK_RANGES:
        for start, end, name in DATA_BLOCK_RANGES[mod_name]:
            content += f"        // --- {name} ({start}-{end}) ---\n"
            for i in range(start - 1, end):  # 0-indexed
                content += lines[i] + '\n'
            content += '\n'
    with open(f'js/{mod_name}', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Wrote js/{mod_name}")

# Write other modules (skip config.js/state.js/ui.js - already written with data blocks)
for mod_name in ['cultivation.js', 'combat.js', 'sect.js',
                  'serendipity.js', 'worldmap.js', 'crafting.js', 'achievements.js',
                  'core.js', 'init.js']:
    if mod_name == 'data.js':
        continue
    if mod_name not in modules:
        # Create empty module
        with open(f'js/{mod_name}', 'w') as f:
            f.write(f"// Auto-generated module: {mod_name}\n'use strict';\n\n")
        print(f"Created empty js/{mod_name}")
        continue
    content = f"// Auto-generated module: {mod_name}\n'use strict';\n\n"
    for fname, func_lines in sorted(modules[mod_name], key=lambda x: func_starts[x[0]]):
        content += f"        // ===== {fname} =====\n"
        content += '\n'.join(func_lines) + '\n\n'
    with open(f'js/{mod_name}', 'w', encoding='utf-8') as f:
        f.write(content)
    total = sum(len(f[1]) for f in modules[mod_name])
    print(f"Wrote js/{mod_name}: {len(modules[mod_name])} functions")

print("\nDone!")
