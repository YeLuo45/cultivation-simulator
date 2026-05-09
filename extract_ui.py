#!/usr/bin/env python3
"""Extract UI/render functions from modules into proper ui.js and init.js."""
import re

def extract_functions_from_file(filepath, function_names):
    """Extract specific function definitions from a file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    extracted = {}
    
    for fname in function_names:
        pattern = rf'^        function {fname}\s*\('
        for i, line in enumerate(lines):
            if re.match(pattern, line):
                # Find function start
                start = i
                # Count braces to find end
                brace_count = 0
                found_open = False
                end = start
                for j in range(start, len(lines)):
                    for ch in lines[j]:
                        if ch == '{':
                            found_open = True
                            brace_count += 1
                        elif ch == '}':
                            brace_count -= 1
                            if found_open and brace_count == 0:
                                end = j
                                break
                    if brace_count == 0 and found_open:
                        break
                extracted[fname] = lines[start:end+1]
                break
    
    return extracted

def remove_functions_from_content(content, function_names):
    """Remove specific functions from content."""
    lines = content.split('\n')
    remove_ranges = []
    
    for fname in function_names:
        pattern = rf'^        function {fname}\s*\('
        for i, line in enumerate(lines):
            if re.match(pattern, line):
                start = i
                brace_count = 0
                found_open = False
                end = start
                for j in range(start, len(lines)):
                    for ch in lines[j]:
                        if ch == '{':
                            found_open = True
                            brace_count += 1
                        elif ch == '}':
                            brace_count -= 1
                            if found_open and brace_count == 0:
                                end = j
                                break
                    if brace_count == 0 and found_open:
                        break
                remove_ranges.append((start, end))
                break
    
    # Remove in reverse order
    for start, end in reversed(remove_ranges):
        lines[start:end+1] = []
    
    return '\n'.join(lines)

# UI functions that should be in ui.js
UI_FUNCTIONS = [
    'showModal', 'closeModal', 'openModal', 'closeEquipSlotMenu',
    'renderLog', 'renderSetStatus', 'renderInventoryGrid',
    'renderShopItems', 'renderCraftingRecipes', 'renderMarketItems',
    'renderCombatHome', 'renderCombatArena', 'renderPlayerActions',
    'renderCombatResult', 'renderSectHome', 'renderCreateSectForm',
    'renderDisciplesTab', 'renderBuildingsTab', 'renderTechniquesTab',
    'renderManageTab', 'renderWorldMap', 'renderRegionDetail',
    'showSaveLoadModal', 'closeSerendipityModal',
    'renderUltimateEnergyBar', 'renderCounterEnergyBar',
    'renderSpiritRootContent', 'renderAchievements',
    'renderAlchemyFurnace', 'renderForgeAnvil',
    'openAchievements', 'closeAchievements',
    'openSect', 'closeSect', 'switchSectTab',
    'openWorldMap', 'closeWorldMap',
    'openEnhanceFromInventory', 'openEnhanceModal', 'closeEnhanceModal',
    'openTreasureFromInventory', 'openTreasureEquipModal', 'closeTreasureEquipModal',
    'openMarket', 'closeMarket', 'openCrafting', 'closeCrafting',
    'openCombat', 'closeCombat',
    'openInventory', 'closeInventory',
]

# Init functions that should be in init.js
INIT_FUNCTIONS = [
    'startNewGame', 'loadGame', 'showGameUI', 'updateDisplay', 'init',
]

# Read all module files
modules = {}
for mod in ['data.js', 'achievements.js', 'core.js', 'crafting.js', 'cultivation.js', 'combat.js', 'sect.js', 'serendipity.js', 'worldmap.js']:
    try:
        with open(f'js/{mod}', 'r', encoding='utf-8') as f:
            modules[mod] = f.read()
    except:
        pass

# Extract UI functions
extracted_ui = {}
for fname in UI_FUNCTIONS:
    for mod, content in modules.items():
        if f'function {fname}(' in content:
            funcs = extract_functions_from_file(f'js/{mod}', [fname])
            if fname in funcs:
                extracted_ui[fname] = funcs[fname]
                modules[mod] = remove_functions_from_content(content, [fname])
                print(f"Extracted {fname} from {mod}")
            break

# Extract Init functions
extracted_init = {}
for fname in INIT_FUNCTIONS:
    for mod, content in modules.items():
        if f'function {fname}(' in content:
            funcs = extract_functions_from_file(f'js/{mod}', [fname])
            if fname in funcs:
                extracted_init[fname] = funcs[fname]
                modules[mod] = remove_functions_from_content(content, [fname])
                print(f"Extracted {fname} from {mod}")
            break

# Write updated modules
for mod, content in modules.items():
    with open(f'js/{mod}', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated js/{mod}")

# Write ui.js
ui_content = "// Auto-generated: UI/Render functions\n'use strict';\n\n"
for fname, lines in sorted(extracted_ui.items(), key=lambda x: x[0]):
    ui_content += "        // ===== " + fname + " =====\n"
    ui_content += '\n'.join(lines) + '\n\n'

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_content)
print(f"Wrote js/ui.js with {len(extracted_ui)} functions")

# Write init.js
init_content = "// Auto-generated: Init functions\n'use strict';\n\n"
for fname, lines in sorted(extracted_init.items(), key=lambda x: x[0]):
    init_content += "        // ===== " + fname + " =====\n"
    init_content += '\n'.join(lines) + '\n\n'

with open('js/init.js', 'w', encoding='utf-8') as f:
    f.write(init_content)
print(f"Wrote js/init.js with {len(extracted_init)} functions")
