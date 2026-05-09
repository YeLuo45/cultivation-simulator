#!/usr/bin/env python3
"""Properly split cultivation-simulator index.html into modules."""
import re, os

# Read original
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract script content
m = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
script = m.group(1)

# Line number mapping (script starts at line 2829 in HTML)
SCRIPT_START_HTML_LINE = 2829

lines = script.split('\n')

# Section markers
SECTION_RE = re.compile(r'^        // =+\s*(.+?)\s*=+$')

# Parse sections
sections = []
current_section = None
current_lines = []
current_start = 1

# Lines before first section marker go to config.js
pre_section_lines = []

for i, line in enumerate(lines, 1):
    match = SECTION_RE.match(line)
    if match:
        # Save pre-section lines
        if not current_section:
            pre_section_lines = current_lines[:]
        if current_section:
            sections.append((current_section, current_lines[:], current_start, i-1))
        current_section = match.group(1).strip()
        current_lines = [line]
        current_start = i
    else:
        current_lines.append(line)

if current_section:
    sections.append((current_section, current_lines[:], current_start, len(lines)))

# Add pre-section lines to config.js
if pre_section_lines:
    sections.insert(0, ('游戏配置', pre_section_lines, 1, len(pre_section_lines)))

print(f"Found {len(sections)} sections:")
for s, _, start, end in sections:
    print(f"  [{start}-{end}] {s}")

EXPLICIT_MAP = {
    '游戏配置': 'config.js',
    'V11 装备强化系统': 'data.js',
    'V12 必杀技系统 (A6多分支升级版)': 'data.js',
    'A4 套装共鸣系统': 'data.js',
    'A5 成就/称号系统': 'data.js',
    '套装共鸣系统 (已在上方定义)': 'data.js',
    'V8 丹药炼器系统数据': 'data.js',
    'V13 经济平衡：高级装备打造配方': 'data.js',
    'V6 奇遇系统数据': 'data.js',
    'V7 灵根/体质系统数据': 'data.js',
    'V7 灵根/体质系统函数': 'cultivation.js',
    'A5 成就/称号系统函数': 'achievements.js',
    'V2 新增功能': 'core.js',
    '商店功能': 'crafting.js',
    'V8 丹药炼器功能': 'crafting.js',
    '交易系统': 'crafting.js',
    '渡劫系统': 'cultivation.js',
    'V4 斗法战斗系统': 'combat.js',
    'V5 宗门系统': 'sect.js',
    'V6 奇遇系统核心功能': 'serendipity.js',
    'V9 世界地图系统': 'worldmap.js',
}

def classify_section(name):
    return EXPLICIT_MAP.get(name, 'data.js')

module_contents = {}
module_sections = {}

for name, lines_list, start, end in sections:
    mod = classify_section(name)
    if mod not in module_contents:
        module_contents[mod] = []
        module_sections[mod] = []
    module_contents[mod].append(f"        // ===== {name} =====")
    module_contents[mod].extend(lines_list)
    module_sections[mod].append(name)

print("\nModule assignment:")
for mod in sorted(module_contents.keys()):
    print(f"  {mod}: {len(module_contents[mod])} lines from {module_sections[mod]}")

os.makedirs('js', exist_ok=True)
for mod, lines_list in module_contents.items():
    content_out = f"// Auto-generated module: {mod}\n'use strict';\n\n" + "\n".join(lines_list) + "\n"
    with open(f'js/{mod}', 'w', encoding='utf-8') as f:
        f.write(content_out)
    print(f"Wrote js/{mod}: {len(lines_list)} lines")
