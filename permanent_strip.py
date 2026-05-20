#!/usr/bin/env python3
"""
Permanently strip extracted code from game.js.
This simulates what build_vite.js does during build, but modifies game.js on disk.
Phase 5: cultivation-simulator game.js reduction
"""
import re
import os

def find_function_end(content, start_pos):
    """Find the end of a function given its start position."""
    brace_count = 0
    in_string = False
    string_char = ''
    found_open = False
    
    for i in range(start_pos, len(content)):
        c = content[i]
        prev_c = content[i-1] if i > 0 else ''
        
        if in_string:
            if c == string_char and prev_c != '\\':
                in_string = False
            continue
        
        if c in ('"', "'", '`'):
            in_string = True
            string_char = c
        elif c == '{':
            found_open = True
            brace_count += 1
        elif c == '}':
            brace_count -= 1
            if found_open and brace_count == 0:
                return i + 1
    return start_pos

def remove_function(content, func_name):
    """Remove a function from content."""
    # Find the function declaration
    patterns = [
        rf'\n        function {re.escape(func_name)}\s*\(',
        rf'\n\s+function {re.escape(func_name)}\s*\(',
    ]
    
    start_pos = -1
    for pattern in patterns:
        match = re.search(pattern, content)
        if match:
            start_pos = match.start()
            break
    
    if start_pos == -1:
        print(f"  Warning: function {func_name} not found")
        return content
    
    # Find line start
    line_start = content.rfind('\n', 0, start_pos) + 1
    
    # Find function start
    func_start_str = f'function {func_name}'
    func_start = content.index(func_start_str, line_start)
    
    # Find function end
    end_pos = find_function_end(content, func_start)
    
    return content[:line_start] + content[end_pos:]

def main():
    print("Permanently stripping extracted functions from game.js...")
    
    # Read game.js
    with open('game.js', 'r', encoding='utf-8') as f:
        game = f.read()
    
    original_len = len(game)
    print(f"Original game.js: {original_len} chars")
    
    # UI functions to remove (matching build_vite.js)
    UI_FUNCTIONS = [
        # render functions
        'renderAchievements', 'renderSpiritRootContent', 'renderLog',
        'renderRankingPVP', 'renderRankingTab', 'renderChallengeTab', 
        'renderHistoryTab', 'renderSeasonTab', 'renderCombatHome',
        'renderUltimateEnergyBar', 'renderCounterEnergyBar', 'renderCombatArena',
        'renderPlayerActions', 'renderCombatResult', 'renderHeavenlyDaoSetStatus',
        'renderSetStatus', 'renderInventoryGrid', 'renderShopItems',
        'renderCraftingRecipes', 'renderMarketItems', 'renderPetHome',
        'renderMyPets', 'renderSummonPet', 'renderPetMarket', 'renderPetBreeding',
        'renderPetIncubation', 'renderPetFusion', 'renderSectHome',
        'renderCreateSectForm', 'renderDisciplesTab', 'renderBuildingsTab',
        'renderTechniquesTab', 'renderContributionShop', 'renderManageTab',
        'renderSectPalaceDualTrack', 'renderPalaceHome', 'renderPalaceTasksTab',
        'renderCreatePalaceForm', 'renderRoomsTab', 'renderPalaceDisciplesTab',
        'renderPalaceManageTab', 'renderPalaceSectDualTrack', 'renderBeyondHeaven',
        'renderThirtyThreeHeavens', 'renderDaoAncestor', 'renderWorldMap',
        'renderRegionDetail', 'renderCelestialEconomy', 'renderCelestialMarketTab',
        'renderCelestialInvestTab',
        # open/close functions
        'openAchievements', 'closeAchievements', 'openCombat', 'closeCombat',
        'openRankingPVP', 'closeRankingPVP', 'openModal', 'closeModal',
        'openEquipSlotMenu', 'closeEquipSlotMenu', 'openHeavenlyDaoSlotMenu',
        'closeHeavenlyDaoSlotMenu', 'openEvolutionUI', 'closeEvolutionUI',
        'openInventory', 'closeInventory', 'openTechniqueUpgrade',
        'closeTechniqueUpgradeModal', 'openShop', 'closeShop',
        'openCrafting', 'openAlchemy', 'openForge', 'closeAlchemy',
        'openMarket', 'closeDiscipleSelectionModal', 'openNpcDialogue',
        'closeNpcDialogue', 'closeGiftMenu', 'openPalace', 'closePalace',
        'closeSerendipityModal', 'openSerendipityLog', 'openWorldMap',
        'closeWorldMap', 'openBeyondHeaven', 'closeBeyondHeaven',
        'closeBeyondResult', 'openCelestialEconomy', 'closeCelestialEconomy',
        'openSettings', 'closeSettings', 'openSpiritRootModal',
        'closeSpiritRootModal', 'openPet', 'closePet',
        'openEnhanceFromInventory', 'openEnhanceFromEquip', 'openEnhancePanel',
        'closeEnhancePanel', 'openSect', 'closeSect',
    ]
    
    print(f"\nRemoving {len(UI_FUNCTIONS)} UI functions...")
    for func_name in UI_FUNCTIONS:
        game = remove_function(game, func_name)
    
    after_ui_len = len(game)
    print(f"After UI removal: {after_ui_len} chars (removed {original_len - after_ui_len})")
    
    # Write modified game.js
    with open('game.js', 'w', encoding='utf-8') as f:
        f.write(game)
    
    lines = len(game.split('\n'))
    print(f"\nModified game.js: {lines} lines")
    
    # Verify syntax
    import subprocess
    try:
        result = subprocess.run(['node', '--check', 'game.js'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Syntax check passed")
        else:
            print(f"✗ Syntax check failed: {result.stderr}")
    except Exception as e:
        print(f"Could not run syntax check: {e}")

if __name__ == '__main__':
    main()