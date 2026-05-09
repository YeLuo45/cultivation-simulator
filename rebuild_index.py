#!/usr/bin/env python3
"""Rebuild index.html from modular js/ files."""
import re, os

# Read js modules
def read_module(name):
    with open(f'js/{name}', 'r', encoding='utf-8') as f:
        content = f.read()
    # Strip the header comment
    lines = content.split('\n')
    # Remove first 2 lines (header comment and 'use strict')
    if len(lines) > 2 and "'use strict';" in lines[1]:
        lines = lines[2:]
    else:
        lines = lines[1:]
    return '\n'.join(lines).rstrip() + '\n'

# Module load order (config/state/ui first for data globals, then others)
module_order = [
    'config.js',   # CONFIG, PILLS, TREASURES, etc.
    'state.js',    # gameState, miniMaxConfig
    'ui.js',       # CONTINENTS, REGIONS, SECRET_REALMS
    'achievements.js',
    'cultivation.js',
    'combat.js',
    'core.js',
    'crafting.js',
    'data.js',     # mixed helpers + remaining data
    'sect.js',
    'serendipity.js',
    'worldmap.js',
    'init.js',
]

# Read original index.html to get header and footer
with open('index.html', 'r', encoding='utf-8') as f:
    original = f.read()

# Extract script tag boundaries
m = re.search(r'(<script>)(.*?)(</script>)', original, re.DOTALL)
if not m:
    print("ERROR: Could not find <script> tag")
    exit(1)

header = original[:m.start(1)]
footer = original[m.end(2):]

# Build new script content
new_script = '// Auto-generated from modules\n'
for mod in module_order:
    if os.path.exists(f'js/{mod}'):
        new_script += f'\n// ===== {mod} =====\n'
        new_script += read_module(mod)
        print(f"Added {mod}")

new_html = header + new_script + footer

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f"\nRebuilt index.html: {len(new_html)} chars")
