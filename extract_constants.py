#!/usr/bin/env python3
"""Extract constants from game.js for DDD Phase 1"""

import os
import re

# Read game.js
with open('game.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_lines(start, end):
    """Get lines from start to end (1-indexed)"""
    return ''.join(lines[start-1:end])

def extract_block(start, end, const_name):
    """Extract a single constant block and convert to export format"""
    block = get_lines(start, end)
    # Remove leading spaces and original const declaration
    block = re.sub(r'^\s*const\s+' + const_name + r'\s*=\s*', '', block, flags=re.MULTILINE)
    return f'export const {const_name} = {block}'

def extract_file(filename, const_blocks, header_comment):
    """Extract constant blocks into a file"""
    content = header_comment + '\n\n'
    for const_name, start, end in const_blocks:
        content += extract_block(start, end, const_name) + '\n\n'
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {filename}")

# Create directories
os.makedirs('domains/shared/constants', exist_ok=True)

# cultivation.js: CONFIG, SERENDIPITY_EVENTS, SERENDIPITY_TALISMANS, SPIRIT_ROOT_QUALITIES,
# FIVE_ELEMENT_TECHNIQUES, CONSTITUTIONS, REALM_REQUIREMENTS, DEFAULT_MINIMAX_CONFIG,
# TECHNIQUE_BONUS, TECHNIQUE_COLORS, SECT_CONFIG, PALACE_CONFIG, SECT_TECHNIQUES,
# TECHNIQUE_UPGRADE_MATERIALS, TECHNIQUE_UPGRADE_EFFECTS
cultivation_blocks = [
    ('CONFIG', 5, 18),
    ('SERENDIPITY_EVENTS', 525, 749),
    ('SERENDIPITY_TALISMANS', 752, 757),
    ('SPIRIT_ROOT_QUALITIES', 760, 767),
    ('FIVE_ELEMENT_TECHNIQUES', 770, 776),
    ('CONSTITUTIONS', 779, 842),
    ('REALM_REQUIREMENTS', 845, 852),
    ('DEFAULT_MINIMAX_CONFIG', 855, 865),
    ('TECHNIQUE_BONUS', 868, 873),
    ('TECHNIQUE_COLORS', 876, 881),
    ('SECT_CONFIG', 884, 899),
    ('PALACE_CONFIG', 902, 949),
    ('SECT_TECHNIQUES', 952, 959),
    ('TECHNIQUE_UPGRADE_MATERIALS', 963, 970),
    ('TECHNIQUE_UPGRADE_EFFECTS', 974, 996),
]

cultivation_header = '''// domains/shared/constants/cultivation.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Cultivation Domain Constants
// ============================================================================'''

extract_file('domains/shared/constants/cultivation.js', cultivation_blocks, cultivation_header)

# world.js: CONTINENTS, THIRTY_THREE_HEAVENS, MAIN_PLOT, REGIONS, SECRET_REALMS
world_blocks = [
    ('CONTINENTS', 1244, 1301),
    ('THIRTY_THREE_HEAVENS', 1304, 1343),
    ('MAIN_PLOT', 1346, 1377),
    ('REGIONS', 1380, 1538),
    ('SECRET_REALMS', 1541, 1583),
]

world_header = '''// domains/shared/constants/world.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: World Domain Constants
// ============================================================================'''

extract_file('domains/shared/constants/world.js', world_blocks, world_header)

# pet.js: All PET_* constants
pet_blocks = [
    ('PET_TYPES', 21, 34),
    ('PET_QUALITY_MULTIPLIERS', 36, 41),
    ('PET_FOOD_COST', 43, 43),
    ('PET_SUMMON_COST', 44, 44),
    ('PET_MAX_LEVEL', 45, 50),
    ('PET_EXP_NEEDED_PER_LEVEL', 51, 51),
    ('PET_LOYALTY_DECAY_RATE', 52, 52),
    ('PET_HUNGER_DECAY_RATE', 53, 53),
    ('PET_MAX_LOYALTY', 54, 54),
    ('PET_MAX_HUNGER', 55, 55),
    ('PET_BREEDING_COST', 58, 58),
    ('PET_BREEDING_MIN_LOYALTY', 59, 59),
    ('PET_BREEDING_COOLDOWN', 60, 60),
    ('PET_INCUBATION_DAYS_BASE', 61, 61),
    ('PET_INCUBATION_DAYS_VAR', 62, 62),
    ('PET_MAX_EGGS', 63, 63),
    ('PET_EGG_TYPES', 66, 71),
    ('PET_EGG_ICONS', 74, 79),
    ('PET_ADVANCEMENT_COSTS', 82, 88),
    ('PET_ADVANCEMENT_BONUS_PER_LEVEL', 89, 89),
    ('PET_MAX_ADVANCEMENT', 90, 90),
    ('PET_TRANSFORMATION_STAGES', 93, 100),
    ('PET_TRANSFORMATION_COSTS', 101, 107),
    ('PET_AWAKENING_SKILLS', 147, 176),
    ('PET_AWAKENING_COST', 177, 177),
    ('PET_AWAKENING_EXP_COST', 178, 178),
    ('PET_MAX_AWAKENED_SKILLS', 179, 179),
    ('PET_FUSION_COST', 182, 182),
    ('PET_FUSION_MIN_LOYALTY', 183, 183),
    ('PET_FUSION_COOLDOWN', 184, 184),
    ('PET_MUTATION_COST', 187, 187),
    ('PET_MUTATION_COOLDOWN', 188, 188),
    ('PET_MUTATION_BASE_CHANCE', 189, 189),
    ('PET_GENE_TYPES', 192, 199),
    ('PET_MUTATION_EFFECTS', 202, 215),
    ('PET_FUSION_COMBINATIONS', 218, 229),
]

pet_header = '''// domains/shared/constants/pet.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Pet Domain Constants
// ============================================================================'''

extract_file('domains/shared/constants/pet.js', pet_blocks, pet_header)

# inventory.js: PILLS, TREASURES, HEAVENLY_DAO_EQUIPMENTS, HEAVENLY_DAO_SET_BONUSES,
# COMBAT_TREASURES, COMBAT_PILLS, ENHANCE_CONFIG, FURNACES, ANVILS, ALCHEMY_RECIPES,
# FORGE_RECIPES, MATERIALS, ADVANCED_FORGE_RECIPES, CELESTIAL_ITEMS, EXCHANGE_TIERS,
# CELESTIAL_REPUTATION_LEVELS
inventory_blocks = [
    ('PILLS', 232, 240),
    ('TREASURES', 243, 251),
    ('HEAVENLY_DAO_EQUIPMENTS', 254, 297),
    ('HEAVENLY_DAO_SET_BONUSES', 300, 326),
    ('COMBAT_TREASURES', 329, 339),
    ('COMBAT_PILLS', 342, 347),
    ('ENHANCE_CONFIG', 350, 375),
    ('FURNACES', 427, 431),
    ('ANVILS', 434, 438),
    ('ALCHEMY_RECIPES', 441, 449),
    ('FORGE_RECIPES', 452, 459),
    ('MATERIALS', 462, 470),
    ('ADVANCED_FORGE_RECIPES', 473, 522),
    ('CELESTIAL_ITEMS', 110, 127),
    ('EXCHANGE_TIERS', 129, 135),
    ('CELESTIAL_REPUTATION_LEVELS', 137, 144),
]

inventory_header = '''// domains/shared/constants/inventory.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Inventory Domain Constants
// ============================================================================'''

extract_file('domains/shared/constants/inventory.js', inventory_blocks, inventory_header)

# combat.js: TRIBULATIONS, ULTIMATE_SKILLS, SET_BONUSES
combat_blocks = [
    ('TRIBULATIONS', 378, 424),
    ('ULTIMATE_SKILLS', 6949, 7060),
    ('SET_BONUSES', 7061, 7070),
]

combat_header = '''// domains/shared/constants/combat.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Combat Domain Constants
// ============================================================================'''

extract_file('domains/shared/constants/combat.js', combat_blocks, combat_header)

# achievement.js: ACHIEVEMENTS, ACHIEVEMENT_ID_MAP
achievement_blocks = [
    ('ACHIEVEMENTS', 7072, 7512),
    ('ACHIEVEMENT_ID_MAP', 7515, 7524),
]

achievement_header = '''// domains/shared/constants/achievement.js
// Extracted from game.js - DDD Phase 1
// ============================================================================
// AREA: Achievement Domain Constants
// ============================================================================'''

extract_file('domains/shared/constants/achievement.js', achievement_blocks, achievement_header)

print("\nAll constant files created!")
print("Files: cultivation.js, world.js, pet.js, inventory.js, combat.js, achievement.js")