// Auto-generated module: evoTree.js
'use strict';

// ===== PET EVOLUTION TREE CONSTANTS (V47) =====

// 进化树配置 - 每个宠物类型有多个进化路径
const EVO_TREE_CONFIG = {
    maxEvoBranches: 3,       // 最多3个进化分支
    branchUnlockLevel: 20,   // 分支解锁等级
    rareFormChance: 0.05,    // 稀有形态概率
    superRareChance: 0.01    // 超稀有形态概率
};

// 宠物进化树 - 定义每个类型的进化路径
const PET_EVO_TREES = {
    '仙鹤': {
        baseIcon: '🦅',
        branches: {
            '风灵鹤': {
                icon: '🦢',
                element: '风',
                color: '#81d4fa',
                unlockLevel: 20,
                stats: { attack: 20, defense: 12, speed: 50, luck: 25 },
                skills: ['御空加速', '风之屏障', '旋风斩'],
                evolutionCost: { stones: 20000, herbs: 100 },
                desc: '风系仙鹤进化路线，速度见长',
                requirements: { level: 20, element: '风' }
            },
            '天羽鹤': {
                icon: '🦋',
                element: '光',
                color: '#ffd54f',
                unlockLevel: 30,
                stats: { attack: 25, defense: 15, speed: 40, luck: 35 },
                skills: ['天羽之光', '羽化登仙', '圣光普照'],
                evolutionCost: { stones: 35000, herbs: 200 },
                desc: '光系仙鹤进化路线，辅助能力突出',
                requirements: { level: 30, element: '光' }
            },
            '暗黑鹤': {
                icon: '🦅',
                element: '暗',
                color: '#7e57c2',
                unlockLevel: 40,
                stats: { attack: 35, defense: 10, speed: 45, luck: 20 },
                skills: ['暗影突袭', '幽冥之气', '暗黑涅槃'],
                evolutionCost: { stones: 50000, herbs: 300 },
                desc: '暗系仙鹤进化路线，攻击能力最强',
                requirements: { level: 40, element: '暗' }
            }
        }
    },
    '凤凰': {
        baseIcon: '🔥',
        branches: {
            '烈焰凤凰': {
                icon: '🔥',
                element: '火',
                color: '#ff5722',
                unlockLevel: 20,
                stats: { attack: 45, defense: 25, speed: 30, luck: 35 },
                skills: ['涅槃之火', '烈焰灼烧', '火凤燎原'],
                evolutionCost: { stones: 25000, herbs: 150 },
                desc: '火系凤凰进化路线，输出爆炸',
                requirements: { level: 20, element: '火' }
            },
            '紫焰凤凰': {
                icon: '💜',
                element: '火+暗',
                color: '#9c27b0',
                unlockLevel: 30,
                stats: { attack: 50, defense: 20, speed: 25, luck: 40 },
                skills: ['紫焰焚天', '幽冥之火', '涅槃重生'],
                evolutionCost: { stones: 40000, herbs: 250 },
                desc: '火暗双系凤凰，攻防兼备',
                requirements: { level: 30, element: '火' }
            },
            '圣光凤凰': {
                icon: '✨',
                element: '火+光',
                color: '#ffd700',
                unlockLevel: 40,
                stats: { attack: 40, defense: 30, speed: 35, luck: 50 },
                skills: ['圣光之焰', '净化之炎', '凤凰天舞'],
                evolutionCost: { stones: 60000, herbs: 400 },
                desc: '火光双系凤凰，幸运与治疗',
                requirements: { level: 40, element: '光' }
            }
        }
    },
    '麒麟': {
        baseIcon: '🦄',
        branches: {
            '祥瑞麒麟': {
                icon: '🦄',
                element: '土',
                color: '#8bc34a',
                unlockLevel: 20,
                stats: { attack: 35, defense: 45, speed: 25, luck: 30 },
                skills: ['祥云笼罩', '地动山摇', '祥瑞之光'],
                evolutionCost: { stones: 20000, herbs: 120 },
                desc: '土系麒麟进化路线，防御见长',
                requirements: { level: 20, element: '土' }
            },
            '紫金麒麟': {
                icon: '💠',
                element: '土+金',
                color: '#9c27b0',
                unlockLevel: 30,
                stats: { attack: 40, defense: 50, speed: 20, luck: 35 },
                skills: ['紫金护体', '金属性强化', '麒麟之怒'],
                evolutionCost: { stones: 38000, herbs: 220 },
                desc: '土金双系麒麟，综合最强',
                requirements: { level: 30, element: '金' }
            },
            '玄冰麒麟': {
                icon: '❄️',
                element: '水',
                color: '#00bcd4',
                unlockLevel: 40,
                stats: { attack: 30, defense: 40, speed: 30, luck: 40 },
                skills: ['玄冰护甲', '寒冰之力', '冰封千里'],
                evolutionCost: { stones: 45000, herbs: 280 },
                desc: '水系麒麟进化路线，控制能力强',
                requirements: { level: 40, element: '水' }
            }
        }
    },
    '白虎': {
        baseIcon: '🐯',
        branches: {
            '战魂白虎': {
                icon: '🐅',
                element: '金',
                color: '#ffc107',
                unlockLevel: 20,
                stats: { attack: 55, defense: 20, speed: 30, luck: 15 },
                skills: ['白虎战魂', '金之神力', '战神之力'],
                evolutionCost: { stones: 22000, herbs: 130 },
                desc: '金系白虎进化路线，极致输出',
                requirements: { level: 20, element: '金' }
            },
            '铁甲白虎': {
                icon: '🛡️',
                element: '金+土',
                color: '#795548',
                unlockLevel: 30,
                stats: { attack: 50, defense: 35, speed: 25, luck: 20 },
                skills: ['铁甲护体', '金甲防御', '不动如山'],
                evolutionCost: { stones: 36000, herbs: 200 },
                desc: '金土双系白虎，攻防均衡',
                requirements: { level: 30, element: '土' }
            },
            '暗影白虎': {
                icon: '🌑',
                element: '金+暗',
                color: '#37474f',
                unlockLevel: 40,
                stats: { attack: 60, defense: 15, speed: 40, luck: 25 },
                skills: ['暗影突击', '夜战八方', '影之分身'],
                evolutionCost: { stones: 55000, herbs: 350 },
                desc: '金暗双系白虎，速度与暴击',
                requirements: { level: 40, element: '暗' }
            }
        }
    },
    '青龙': {
        baseIcon: '🐉',
        branches: {
            '雷龙': {
                icon: '⚡',
                element: '雷',
                color: '#2196f3',
                unlockLevel: 20,
                stats: { attack: 40, defense: 25, speed: 45, luck: 30 },
                skills: ['雷龙出海', '九天雷罚', '雷霆万钧'],
                evolutionCost: { stones: 23000, herbs: 140 },
                desc: '雷系青龙进化路线，速度与攻击兼备',
                requirements: { level: 20, element: '雷' }
            },
            '水龙': {
                icon: '🌊',
                element: '水',
                color: '#03a9f4',
                unlockLevel: 30,
                stats: { attack: 35, defense: 30, speed: 40, luck: 35 },
                skills: ['水龙卷', '海纳百川', '水之守护'],
                evolutionCost: { stones: 37000, herbs: 230 },
                desc: '水系青龙进化路线，持续作战能力强',
                requirements: { level: 30, element: '水' }
            },
            '青龙': {
                icon: '🐲',
                element: '木',
                color: '#4caf50',
                unlockLevel: 40,
                stats: { attack: 45, defense: 35, speed: 35, luck: 40 },
                skills: ['青龙之怒', '木灵之力', '生生不息'],
                evolutionCost: { stones: 48000, herbs: 300 },
                desc: '木系青龙进化路线，攻守平衡',
                requirements: { level: 40, element: '木' }
            }
        }
    }
};

// 稀有形态配置
const RARE_FORMS = {
    '黄金圣兽': {
        icon: '👑',
        color: '#ffd700',
        statsMultiplier: 1.5,
        skills: ['金色战魂', '王者之气'],
        desc: '金光闪闪，属性大幅提升',
        chance: 0.05
    },
    '暗黑魔兽': {
        icon: '💀',
        color: '#37474f',
        statsMultiplier: 1.3,
        skills: ['魔化', '暗影腐蚀'],
        desc: '魔化形态，攻击附带腐蚀效果',
        chance: 0.03
    },
    '天使翼兽': {
        icon: '😇',
        color: '#ffffff',
        statsMultiplier: 1.4,
        skills: ['神圣之光', '天使庇护'],
        desc: '圣光护体，防御大幅提升',
        chance: 0.02
    },
    '混沌古兽': {
        icon: '🌪️',
        color: '#9e9e9e',
        statsMultiplier: 1.6,
        skills: ['混沌之力', '时空扭曲'],
        desc: '远古混沌之力，所有属性大幅提升',
        chance: 0.01
    }
};

// ===== EVOLUTION TREE FUNCTIONS =====

function openEvoTreePanel() {
    const pets = gameState.spiritPets?.pets || [];
    if (pets.length === 0) {
        addLog('还没有仙宠！', '#ff9800');
        return;
    }

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff9800;text-align:center;margin-bottom:10px;">🌳 灵宠进化树</h2>

            <div style="display:grid;grid-template-columns:repeat(${pets.length},1fr);gap:10px;margin-bottom:15px;">`;
    pets.forEach((pet, idx) => {
        const evoTree = PET_EVO_TREES[pet.type] || {};
        const branches = Object.keys(evoTree.branches || {});
        const canEvo = pet.level >= 20 && branches.length > 0;

        html += `<div style="background:rgba(255,152,0,0.1);border:1px solid #ff9800;border-radius:8px;padding:10px;text-align:center;cursor:pointer;"
                     onclick="selectEvoTreePet(${idx})">
            <div style="font-size:2em;">${pet.evoForm?.icon || getPetTypeIcon(pet.type)}</div>
            <div style="color:#ffd700;font-weight:bold;">${pet.name}</div>
            <div style="color:#aaa;font-size:0.85em;">Lv.${pet.level} ${pet.type}</div>
            <div style="color:${canEvo ? '#4caf50' : '#aaa'};font-size:0.85em;margin-top:5px;">
                ${canEvo ? '✓ 可进化' : `需 Lv.20`}
            </div>
        </div>`;
    });
    html += `</div>`;

    // 显示当前选中的宠物进化树
    const selectedIdx = evoTreeSelectedIdx || 0;
    const selectedPet = pets[selectedIdx] || pets[0];
    if (selectedPet) {
        const evoTree = PET_EVO_TREES[selectedPet.type];
        if (evoTree) {
            html += renderEvoTree(selectedPet, evoTree);
        } else {
            html += `<p style="color:#aaa;text-align:center;">该宠物暂无进化树</p>`;
        }
    }

    html += `</div></div>`;
    openModal('灵宠进化树', html, []);
}

let evoTreeSelectedIdx = 0;

function selectEvoTreePet(idx) {
    evoTreeSelectedIdx = idx;
    openEvoTreePanel();
}

function renderEvoTree(pet, evoTree) {
    const branches = evoTree.branches || {};
    const currentForm = pet.evoForm?.formId || 'base';
    const petLevel = pet.level;

    let html = `<div style="margin-top:15px;">
        <h3 style="color:#ffd700;margin-bottom:10px;">📊 ${pet.type} 进化树</h3>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">`;

    // 基础形态
    html += `<div style="background:rgba(0,0,0,0.3);border:2px solid ${evoTree.color || '#888'};border-radius:8px;padding:15px;text-align:center;${currentForm === 'base' ? 'box-shadow:0 0 15px rgba(255,215,0,0.5);' : ''}">
        <div style="font-size:2.5em;margin-bottom:5px;">${evoTree.baseIcon}</div>
        <div style="color:#ffd700;font-weight:bold;">${pet.type}</div>
        <div style="color:#aaa;font-size:0.85em;">基础形态</div>
        <div style="color:#4caf50;font-size:0.9em;margin-top:5px;">当前形态</div>
    </div>`;

    // 进化分支
    Object.entries(branches).forEach(([branchId, branch]) => {
        const isUnlocked = petLevel >= branch.unlockLevel;
        const isSelected = currentForm === branchId;
        const reqs = branch.requirements || {};
        const canEvo = isUnlocked && (!reqs.element || pet.element === reqs.element);

        html += `<div style="background:rgba(0,0,0,0.3);border:2px solid ${isUnlocked ? branch.color : '#555'};border-radius:8px;padding:15px;text-align:center;${isSelected ? 'box-shadow:0 0 15px rgba(255,215,0,0.5);' : ''}">
            <div style="font-size:2.5em;margin-bottom:5px;${!isUnlocked ? 'filter:grayscale(100%);opacity:0.5;' : ''}">${branch.icon}</div>
            <div style="color:${branch.color};font-weight:bold;">${branchId}</div>
            <div style="color:#aaa;font-size:0.85em;">${branch.element}系</div>
            ${!isUnlocked
                ? `<div style="color:#f44336;font-size:0.85em;margin-top:5px;">需 Lv.${branch.unlockLevel}</div>`
                : canEvo
                    ? `<div style="color:#4caf50;font-size:0.85em;margin-top:5px;">✓ 可进化</div>
                       <button class="btn" style="background:#ff9800;color:white;font-size:0.85em;margin-top:8px;width:100%;"
                           onclick="evolvePetToBranch(${pets.indexOf(pet)},'${branchId}')">进化</button>`
                    : `<div style="color:#ff9800;font-size:0.85em;margin-top:5px;">需 ${reqs.element}系</div>`
            }
            <div style="color:#aaa;font-size:0.75em;margin-top:5px;">💎 ${(branch.evolutionCost?.stones || 0).toLocaleString()}</div>
        </div>`;
    });

    html += `</div>`;

    // 当前宠物详细属性
    if (currentForm !== 'base') {
        const formData = branches[currentForm];
        if (formData) {
            html += `<div style="background:rgba(${hexToRgb(formData.color)},0.1);border:1px solid ${formData.color};border-radius:8px;padding:15px;margin-top:15px;">
                <h4 style="color:${formData.color};margin-bottom:10px;">📋 ${currentForm} 属性</h4>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;font-size:0.9em;">
                    <div><span style="color:#aaa;">攻击</span><br><span style="color:#f44336;">${formData.stats.attack}</span></div>
                    <div><span style="color:#aaa;">防御</span><br><span style="color:#2196f3;">${formData.stats.defense}</span></div>
                    <div><span style="color:#aaa;">速度</span><br><span style="color:#ff9800;">${formData.stats.speed}</span></div>
                    <div><span style="color:#aaa;">幸运</span><br><span style="color:#9c27b0;">${formData.stats.luck}</span></div>
                </div>
                <div style="margin-top:10px;">
                    <span style="color:#aaa;font-size:0.85em;">技能：</span>
                    <span style="color:#ffd700;font-size:0.85em;">${formData.skills.join(' / ')}</span>
                </div>
            </div>`;
        }
    }

    html += `</div>`;
    return html;
}

function getPetTypeIcon(type) {
    const trees = Object.values(PET_EVO_TREES);
    for (const tree of trees) {
        if (tree.branches) {
            for (const branch of Object.values(tree.branches)) {
                return branch.icon;
            }
        }
    }
    return '🐾';
}

function evolvePetToBranch(petIdx, branchId) {
    const pets = gameState.spiritPets?.pets || [];
    const pet = pets[petIdx];
    if (!pet) return;

    const evoTree = PET_EVO_TREES[pet.type];
    if (!evoTree || !evoTree.branches) return;

    const branch = evoTree.branches[branchId];
    if (!branch) return;

    if (pet.level < branch.unlockLevel) {
        addLog('等级不足！', '#f44336');
        return;
    }

    const reqs = branch.requirements || {};
    if (reqs.element && pet.element !== reqs.element) {
        addLog(`需要 ${reqs.element}系宠物！`, '#f44336');
        return;
    }

    const cost = branch.evolutionCost || {};
    if (gameState.spiritStones < (cost.stones || 0)) {
        addLog('灵石不足！', '#f44336');
        return;
    }

    gameState.spiritStones -= cost.stones || 0;

    // 检查稀有形态
    let rareForm = null;
    const roll = Math.random();
    if (roll < EVO_TREE_CONFIG.superRareChance) {
        const superRare = Object.values(RARE_FORMS).find(f => f.chance === EVO_TREE_CONFIG.superRareChance);
        rareForm = superRare;
    } else if (roll < EVO_TREE_CONFIG.rareFormChance) {
        const rare = Object.values(RARE_FORMS).filter(f => f.chance > EVO_TREE_CONFIG.superRareChance);
        rareForm = rare[Math.floor(Math.random() * rare.length)];
    }

    // 应用进化
    pet.evoForm = {
        formId: branchId,
        icon: branch.icon,
        element: branch.element,
        stats: { ...branch.stats },
        skills: [...branch.skills],
        color: branch.color,
        isRare: !!rareForm,
        rareForm: rareForm?.icon
    };

    // 应用稀有形态
    if (rareForm) {
        Object.keys(pet.evoForm.stats).forEach(key => {
            pet.evoForm.stats[key] = Math.floor(pet.evoForm.stats[key] * rareForm.statsMultiplier);
        });
        pet.evoForm.skills = [...pet.evoForm.skills, ...rareForm.skills];
        addLog(`🌟 触发稀有形态「${rareForm.icon} ${Object.keys(RARE_FORMS).find(k => RARE_FORMS[k] === rareForm)}」！`, '#ffd700');
    }

    addLog(`✨ 进化成功！${pet.name} 进化为「${branchId}」！`, '#ff9800');
    saveGame();
    updateDisplay();
    openEvoTreePanel();
}

function getEvoTreeStats(pet) {
    if (!pet.evoForm || !pet.evoForm.stats) {
        const baseStats = PET_TYPES[pet.type]?.baseStats || { attack: 10, defense: 10, speed: 10, luck: 10 };
        return baseStats;
    }
    return pet.evoForm.stats;
}

