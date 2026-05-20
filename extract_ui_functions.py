#!/usr/bin/env python3
"""
Extract UI functions (render*/open*/close*) from game.js into domains/ui/.
Phase 5: UI layer extraction for cultivation-simulator
"""
import re
import os

def find_function_end(lines, start_idx):
    """Find the end line of a function given its start index."""
    brace_count = 0
    found_open = False
    for j in range(start_idx, len(lines)):
        for ch in lines[j]:
            if ch == '{':
                found_open = True
                brace_count += 1
            elif ch == '}':
                brace_count -= 1
                if found_open and brace_count == 0:
                    return j
    return start_idx

def extract_functions(content, function_names, comment_pattern=None):
    """Extract function definitions from content."""
    lines = content.split('\n')
    extracted = {}
    removed_ranges = []
    
    for fname in function_names:
        # Match function definition - note game.js uses 8 spaces indent inside IIFE
        pattern = rf'^\s+function {re.escape(fname)}\s*\('
        for i, line in enumerate(lines):
            if re.match(pattern, line):
                start = i
                end = find_function_end(lines, i)
                extracted[fname] = lines[start:end+1]
                removed_ranges.append((start, end))
                print(f"  Extracted: {fname} (lines {start+1}-{end+1})")
                break
    
    # Remove in reverse order to maintain line numbers
    for start, end in reversed(removed_ranges):
        lines[start:end+1] = []
    
    return extracted, '\n'.join(lines)

def create_ui_renderer_file(functions, filename, domain_path):
    """Create a domains/ui/renderers/xxx.js file."""
    os.makedirs(domain_path, exist_ok=True)
    filepath = os.path.join(domain_path, filename)
    
    content = "// ===== UI Renderer: " + filename + " =====\n"
    content += "// Phase 5 extraction - UI layer\n\n"
    
    for fname in sorted(functions.keys()):
        content += "        // ===== " + fname + " =====\n"
        content += '\n'.join(functions[fname]) + '\n\n'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  Created: {filepath}")
    return filepath

# UI functions to extract (render*, open*, close*)
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

def main():
    print("Phase 5: Extracting UI functions from game.js...")
    
    # Read game.js
    with open('game.js', 'r', encoding='utf-8') as f:
        game_content = f.read()
    
    print(f"\nOriginal game.js: {len(game_content)} chars, {len(game_content.split(chr(10)))} lines")
    
    # Extract UI functions
    print("\nExtracting UI functions...")
    extracted, game_content = extract_functions(game_content, UI_FUNCTIONS)
    print(f"\nExtracted {len(extracted)} UI functions")
    
    # Write extracted functions to domains/ui/renderers/
    renderer_path = 'domains/ui/renderers'
    os.makedirs(renderer_path, exist_ok=True)
    
    # Group by category for organization
    categories = {
        'achievement.js': ['renderAchievements', 'openAchievements', 'closeAchievements', 
                          'renderSpiritRootContent', 'openSpiritRootModal', 'closeSpiritRootModal'],
        'combat.js': ['renderCombatHome', 'renderCombatArena', 'renderPlayerActions', 
                      'renderCombatResult', 'openCombat', 'closeCombat', 
                      'renderUltimateEnergyBar', 'renderCounterEnergyBar',
                      'renderRankingPVP', 'renderRankingTab', 'renderChallengeTab',
                      'renderHistoryTab', 'renderSeasonTab', 'openRankingPVP', 'closeRankingPVP'],
        'inventory.js': ['renderInventoryGrid', 'openInventory', 'closeInventory',
                         'openEquipSlotMenu', 'closeEquipSlotMenu',
                         'openHeavenlyDaoSlotMenu', 'closeHeavenlyDaoSlotMenu',
                         'renderHeavenlyDaoSetStatus', 'renderSetStatus',
                         'openTechniqueUpgrade', 'closeTechniqueUpgradeModal',
                         'openEnhanceFromInventory', 'openEnhanceFromEquip', 
                         'openEnhancePanel', 'closeEnhancePanel',
                         'openEvolutionUI', 'closeEvolutionUI'],
        'shop.js': ['renderShopItems', 'renderCraftingRecipes', 'renderMarketItems',
                    'openShop', 'closeShop', 'openCrafting', 'openAlchemy', 
                    'openForge', 'closeAlchemy', 'openMarket'],
        'pet.js': ['renderPetHome', 'renderMyPets', 'renderSummonPet', 
                   'renderPetMarket', 'renderPetBreeding', 'renderPetIncubation',
                   'renderPetFusion', 'openPet', 'closePet'],
        'sect.js': ['renderSectHome', 'renderCreateSectForm', 'renderDisciplesTab',
                    'renderBuildingsTab', 'renderTechniquesTab', 'renderContributionShop',
                    'renderManageTab', 'renderSectPalaceDualTrack',
                    'openSect', 'closeSect', 'openPalace', 'closePalace',
                    'renderPalaceHome', 'renderPalaceTasksTab', 'renderCreatePalaceForm',
                    'renderRoomsTab', 'renderPalaceDisciplesTab', 'renderPalaceManageTab',
                    'renderPalaceSectDualTrack', 'openNpcDialogue', 'closeNpcDialogue',
                    'closeDiscipleSelectionModal', 'closeGiftMenu'],
        'world.js': ['renderBeyondHeaven', 'renderThirtyThreeHeavens', 'renderDaoAncestor',
                     'renderWorldMap', 'renderRegionDetail', 'openWorldMap', 'closeWorldMap',
                     'openBeyondHeaven', 'closeBeyondHeaven', 'closeBeyondResult',
                     'openSerendipityLog', 'closeSerendipityModal'],
        'celestial.js': ['renderCelestialEconomy', 'renderCelestialMarketTab', 
                         'renderCelestialInvestTab', 'openCelestialEconomy', 'closeCelestialEconomy'],
        'modal.js': ['openModal', 'closeModal', 'openSettings', 'closeSettings'],
        'log.js': ['renderLog'],
    }
    
    created_files = []
    for filename, funcs in categories.items():
        category_funcs = {k: v for k, v in extracted.items() if k in funcs}
        if category_funcs:
            filepath = create_ui_renderer_file(category_funcs, filename, renderer_path)
            created_files.append(filepath)
    
    # Write modified game.js
    with open('game.js', 'w', encoding='utf-8') as f:
        f.write(game_content)
    
    lines_after = len(game_content.split('\n'))
    print(f"\nModified game.js: {len(game_content)} chars, {lines_after} lines")
    print(f"Removed approximately {17717 - lines_after} lines")
    
    # Create domains/ui/index.js to export all renderers
    ui_index = """// domains/ui/index.js
// Phase 5: UI layer exports

export const UIRenderers = {
""" + '\n'.join(f"    {fname}," for fname in sorted(extracted.keys())) + """
};

// Re-export all renderer modules
export * from './renderers/achievement.js';
export * from './renderers/combat.js';
export * from './renderers/inventory.js';
export * from './renderers/shop.js';
export * from './renderers/pet.js';
export * from './renderers/sect.js';
export * from './renderers/world.js';
export * from './renderers/celestial.js';
export * from './renderers/modal.js';
export * from './renderers/log.js';
"""
    
    with open('domains/ui/index.js', 'w', encoding='utf-8') as f:
        f.write(ui_index)
    print(f"\nCreated: domains/ui/index.js")
    
    print("\n" + "="*60)
    print("EXTRACTION COMPLETE")
    print("="*60)
    print(f"Files created: {len(created_files) + 1}")
    print("\nCreated files:")
    for f in created_files:
        print(f"  - {f}")
    print(f"  - domains/ui/index.js")
    print("\nNext: Update build_vite.js to include domains/ui/renderers/*.js")

if __name__ == '__main__':
    main()