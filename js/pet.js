// Auto-generated module: pet.js
'use strict';

// ===== PET CONSTANTS (V39) =====
const PET_CONFIG = {
    maxPets: 5,           // 最多5只仙宠
    eggHatchDays: 3,      // 孵化所需天数
    evolveMinLevel: 10,   // 进化最低等级
    skillSlotBase: 1,     // 基础技能槽
    skillSlotPerEvo: 1,   // 每次进化解锁1个技能槽
    feedCostBase: 50,     // 基础喂养灵石
    bondMax: 100          // 羁绊最大值
};

const PET_QUALITIES = {
    '凡品': { multiplier: 0.8, color: '#9e9e9e', hatchRate: 0.7, growthBonus: 0.5 },
    '良品': { multiplier: 1.0, color: '#4caf50', hatchRate: 0.2, growthBonus: 1.0 },
    '上品': { multiplier: 1.2, color: '#2196f3', hatchRate: 0.08, growthBonus: 1.5 },
    '精品': { multiplier: 1.5, color: '#9c27b0', hatchRate: 0.015, growthBonus: 2.0 },
    '仙品': { multiplier: 2.0, color: '#ff9800', hatchRate: 0.004, growthBonus: 3.0 },
    '神品': { multiplier: 2.5, color: '#ffd700', hatchRate: 0.001, growthBonus: 5.0 }
};

const PET_TYPES = {
    '仙鹤': {
        icon: '🦅', element: '风',
        baseStats: { attack: 15, defense: 10, speed: 40, luck: 20 },
        skills: ['御空加速', '仙羽护体'],
        growthRate: 1.0, maturityMax: 80, eggIcon: '🥚'
    },
    '凤凰': {
        icon: '🦅', element: '火',
        baseStats: { attack: 35, defense: 20, speed: 25, luck: 30 },
        skills: ['涅槃之火', '羽翼灼烧'],
        growthRate: 1.3, maturityMax: 120, eggIcon: '🥚'
    },
    '麒麟': {
        icon: '🦄', element: '土',
        baseStats: { attack: 30, defense: 35, speed: 20, luck: 25 },
        skills: ['祥云笼罩', '踏火祥瑞'],
        growthRate: 1.1, maturityMax: 100, eggIcon: '🥚'
    },
    '白虎': {
        icon: '🐯', element: '金',
        baseStats: { attack: 45, defense: 15, speed: 25, luck: 10 },
        skills: ['白虎战魂', '金之神力'],
        growthRate: 1.15, maturityMax: 90, eggIcon: '🥚'
    },
    '青龙': {
        icon: '🐉', element: '木',
        baseStats: { attack: 25, defense: 20, speed: 35, luck: 30 },
        skills: ['青龙之怒', '行云布雨'],
        growthRate: 1.2, maturityMax: 110, eggIcon: '🥚'
    },
    '玄武': {
        icon: '🐢', element: '水',
        baseStats: { attack: 15, defense: 45, speed: 15, luck: 20 },
        skills: ['玄冰护甲', '龟息大法'],
        growthRate: 0.9, maturityMax: 130, eggIcon: '🥚'
    },
    '九尾狐': {
        icon: '🦊', element: '魅',
        baseStats: { attack: 30, defense: 15, speed: 35, luck: 45 },
        skills: ['九尾魅惑', '狐火之术'],
        growthRate: 1.4, maturityMax: 85, eggIcon: '🥚'
    },
    '鲲鹏': {
        icon: '🐋', element: '雷',
        baseStats: { attack: 35, defense: 15, speed: 50, luck: 25 },
        skills: ['鲲鹏展翅', '雷霆万钧'],
        growthRate: 1.5, maturityMax: 140, eggIcon: '🥚'
    },
    '独角兽': {
        icon: '🦄', element: '光',
        baseStats: { attack: 25, defense: 25, speed: 30, luck: 40 },
        skills: ['圣光治愈', '独角突刺'],
        growthRate: 1.25, maturityMax: 95, eggIcon: '🥚'
    },
    '白泽': {
        icon: '🦌', element: '智',
        baseStats: { attack: 20, defense: 30, speed: 25, luck: 50 },
        skills: ['神兽智慧', '白泽之鉴'],
        growthRate: 1.35, maturityMax: 105, eggIcon: '🥚'
    }
};

const PET_SKILLS = {
    '御空加速': { type: 'passive', effect: { speed: 0.2 }, desc: '速度+20%' },
    '仙羽护体': { type: 'active', effect: { defense: 0.15 }, desc: '防御+15%', cost: 10 },
    '涅槃之火': { type: 'active', effect: { attack: 0.25, revive: 0.3 }, desc: '攻击+25%，30%概率复活', cost: 20 },
    '羽翼灼烧': { type: 'active', effect: { attack: 0.2, burn: true }, desc: '攻击+20%，灼烧效果', cost: 15 },
    '祥云笼罩': { type: 'passive', effect: { luck: 0.3 }, desc: '幸运+30%' },
    '踏火祥瑞': { type: 'active', effect: { attack: 0.2, defense: 0.1 }, desc: '攻击+20%，防御+10%', cost: 15 },
    '白虎战魂': { type: 'active', effect: { attack: 0.35 }, desc: '攻击+35%', cost: 25 },
    '金之神力': { type: 'passive', effect: { attack: 0.15, defense: 0.1 }, desc: '攻击+15%，防御+10%' },
    '青龙之怒': { type: 'active', effect: { attack: 0.3, speed: 0.1 }, desc: '攻击+30%，速度+10%', cost: 20 },
    '行云布雨': { type: 'active', effect: { attack: 0.15, heal: 0.1 }, desc: '攻击+15%，治疗+10%', cost: 15 },
    '玄冰护甲': { type: 'passive', effect: { defense: 0.25 }, desc: '防御+25%' },
    '龟息大法': { type: 'passive', effect: { defense: 0.15, revive: 0.15 }, desc: '防御+15%，15%概率复活' },
    '九尾魅惑': { type: 'active', effect: { control: true, attack: 0.2 }, desc: '控制敌人，攻击+20%', cost: 25 },
    '狐火之术': { type: 'active', effect: { attack: 0.25, burn: true }, desc: '攻击+25%，灼烧效果', cost: 20 },
    '鲲鹏展翅': { type: 'passive', effect: { speed: 0.4, attack: 0.1 }, desc: '速度+40%，攻击+10%' },
    '雷霆万钧': { type: 'active', effect: { attack: 0.4, stun: true }, desc: '攻击+40%，眩晕效果', cost: 30 },
    '圣光治愈': { type: 'active', effect: { heal: 0.25 }, desc: '治疗+25%', cost: 20 },
    '独角突刺': { type: 'active', effect: { attack: 0.3 }, desc: '攻击+30%', cost: 20 },
    '神兽智慧': { type: 'passive', effect: { luck: 0.25, serendipity: 0.2 }, desc: '幸运+25%，奇遇+20%' },
    '白泽之鉴': { type: 'active', effect: { foresee: true, defense: 0.2 }, desc: '预知敌人行动，防御+20%', cost: 25 }
};

const PET_EVOLUTION_MAP = {
    '仙鹤': '金羽仙鹤',
    '凤凰': '九天凤凰',
    '麒麟': '圣金麒麟',
    '白虎': '战伐白虎',
    '青龙': '苍青神龙',
    '玄武': '冥水玄武',
    '九尾狐': '九天真狐',
    '鲲鹏': '太古鲲鹏',
    '独角兽': '星辉独角兽',
    '白泽': '祥瑞白泽'
};

const PET_FOOD = {
    '灵果': { cost: 50, exp: 20, happiness: 5 },
    '仙露': { cost: 100, exp: 50, happiness: 10 },
    '仙丹': { cost: 300, exp: 150, happiness: 15 },
    '神兽肉': { cost: 500, exp: 300, happiness: 25 }
};

// ===== PET FUNCTIONS =====

function showPetPanel() {
    const sp = gameState.spiritPets;
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:900px;max-height:90vh;overflow-y:auto;">
            <h2 style="color:#ff9800;text-align:center;margin-bottom:15px;">🐉 仙宠培养</h2>`;

    // 仙宠列表
    html += `<div style="margin-bottom:20px;">
        <h3 style="color:#ffd700;margin-bottom:10px;">我的仙宠（${sp.pets.length}/${PET_CONFIG.maxPets}）</h3>`;

    if (sp.pets.length === 0) {
        html += `<p style="color:#aaa;text-align:center;">暂无仙宠，去获取仙兽蛋吧！</p>`;
    } else {
        sp.pets.forEach((pet, idx) => {
            const template = PET_TYPES[pet.type] || PET_QUALITIES[pet.quality];
            const qualityColor = PET_QUALITIES[pet.quality]?.color || '#fff';
            const evoStage = Math.floor(pet.level / PET_CONFIG.evolveMinLevel);
            const evoName = evoStage > 0 ? PET_EVOLUTION_MAP[pet.type] || pet.type : pet.type;
            const skillSlots = PET_CONFIG.skillSlotBase + evoStage * PET_CONFIG.skillSlotPerEvo;

            html += `<div style="background:rgba(255,152,0,0.1);border:1px solid ${qualityColor};border-radius:8px;padding:12px;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <span style="font-size:2em;">${template.icon}</span>
                    <div style="flex:1;">
                        <div style="color:${qualityColor};font-weight:bold;">${evoName} ${pet.nickname ? `"${pet.nickname}"` : ''}</div>
                        <div style="color:#aaa;font-size:0.9em;">等级 Lv.${pet.level} | ${pet.quality} | ${template.element}属性 | 成长${pet.growth.toFixed(2)}x</div>
                    </div>
                    <div style="color:#ffd700;">❤️ ${pet.bond}/${PET_CONFIG.bondMax}</div>
                </div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">
                    <span style="color:#aaa;font-size:0.85em;">攻击:${Math.round(pet.stats.attack)}</span>
                    <span style="color:#aaa;font-size:0.85em;">防御:${Math.round(pet.stats.defense)}</span>
                    <span style="color:#aaa;font-size:0.85em;">速度:${Math.round(pet.stats.speed)}</span>
                    <span style="color:#aaa;font-size:0.85em;">幸运:${Math.round(pet.stats.luck)}</span>
                    <span style="color:#aaa;font-size:0.85em;">经验:${pet.exp}/${pet.nextLevelExp}</span>
                </div>
                <div style="color:#aaa;font-size:0.85em;margin-bottom:8px;">
                    技能槽(${pet.skills.length}/${skillSlots}): ${pet.skills.map(s => `${s}(${PET_SKILLS[s]?.desc || '?'})`).join(' | ') || '暂无'}
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">`;

            if (!pet.isHatched) {
                html += `<button class="btn" style="background:#4caf50;color:white;" onclick="hatchPetEgg(${idx})">🥚 孵化（剩余${pet.hatchDays}天）</button>`;
            } else {
                html += `<button class="btn" style="background:#ff9800;color:white;" onclick="feedPet(${idx})">🍖 喂养</button>`;
                if (evoStage < 3 && pet.level >= PET_CONFIG.evolveMinLevel * (evoStage + 1)) {
                    html += `<button class="btn" style="background:#9c27b0;color:white;" onclick="evolvePet(${idx})">✨ 进化（需${PET_CONFIG.evolveMinLevel * (evoStage + 1)}级）</button>`;
                }
                if (pet.skills.length < skillSlots) {
                    html += `<button class="btn" style="background:#2196f3;color:white;" onclick="teachPetSkill(${idx})">📖 传授技能</button>`;
                }
                html += `<button class="btn" style="background:#f44336;color:white;" onclick="releasePet(${idx})">🗑️ 放生</button>`;
            }
            html += `</div></div>`;
        });
    }
    html += `</div>`;

    // 仙兽蛋市场
    html += `<div style="margin-top:20px;">
        <h3 style="color:#ffd700;margin-bottom:10px;">🥚 仙兽蛋市场</h3>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">`;

    const eggTypes = ['凡品蛋', '良品蛋', '上品蛋', '精品蛋', '仙品蛋'];
    const eggCosts = [500, 2000, 8000, 30000, 100000];
    const eggRates = [0.7, 0.2, 0.08, 0.015, 0.004];

    eggTypes.forEach((egg, i) => {
        html += `<div style="background:rgba(0,0,0,0.3);border:1px solid #555;border-radius:8px;padding:10px;text-align:center;">
            <div style="color:#aaa;">${egg}</div>
            <div style="color:#ffd700;">💎 ${eggCosts[i]}</div>
            <div style="color:#aaa;font-size:0.8em;">孵化成功:凡品${eggTypes.length-i}品</div>
            <button class="btn" style="background:#ff9800;color:white;margin-top:5px;" onclick="buyPetEgg(${i})"
                ${gameState.spiritStones < eggCosts[i] ? 'disabled' : ''}>购买</button>
        </div>`;
    });

    html += `</div></div>`;

    // 每日互动
    html += `<div style="margin-top:20px;text-align:center;">
        <button class="btn" style="background:#4caf50;color:white;" onclick="interactWithPets()">🤝 与所有仙宠互动（+羁绊）</button>
    </div>`;

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="closeModal()">关闭</button>
    </div></div></div>`;

    openModal('仙宠培养', html, []);
}

function buyPetEgg(qualityIndex) {
    const eggCosts = [500, 2000, 8000, 30000, 100000];
    const cost = eggCosts[qualityIndex];

    if (gameState.spiritStones < cost) {
        addLog('灵石不足！', '#f44336');
        return;
    }

    const sp = gameState.spiritPets;
    if (sp.pets.length >= PET_CONFIG.maxPets) {
        addLog('仙宠栏已满！', '#f44336');
        return;
    }

    gameState.spiritStones -= cost;
    const qualities = ['凡品', '良品', '上品', '精品', '仙品'];
    const quality = qualities[qualityIndex];
    const types = Object.keys(PET_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const growthTypes = ['普通', '普通', '普通', '优秀', '优秀', '稀有', '稀有', '神话'];

    const egg = {
        type: type,
        quality: quality,
        growth: PET_QUALITIES[quality].growthBonus * (0.8 + Math.random() * 0.4),
        nickname: '',
        level: 1,
        exp: 0,
        nextLevelExp: 100,
        stats: { attack: 0, defense: 0, speed: 0, luck: 0 },
        skills: [],
        isHatched: false,
        hatchDays: PET_CONFIG.eggHatchDays,
        bond: 20,
        element: PET_TYPES[type].element
    };

    sp.pets.push(egg);
    addLog(`获得${quality}${type}蛋！`, '#ff9800');
    updateDisplay();
    showPetPanel();
}

function hatchPetEgg(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];

    if (pet.isHatched) {
        addLog('这只仙兽已经孵化了！', '#f44336');
        return;
    }

    pet.hatchDays--;
    if (pet.hatchDays <= 0) {
        pet.isHatched = true;
        // 根据品质决定是否变异
        const qualityData = PET_QUALITIES[pet.quality];
        if (Math.random() < qualityData.hatchRate * 0.1) {
            // 变异
            const allTypes = Object.keys(PET_TYPES);
            pet.type = allTypes[Math.floor(Math.random() * allTypes.length)];
            pet.quality = '精品';
            addLog(`🐣 孵化成功！仙兽发生变异，成为${pet.quality}${pet.type}！`, '#ffd700');
        } else {
            addLog(`🐣 孵化成功！获得${pet.quality}${pet.type}！`, '#ff9800');
        }

        // 初始化属性
        const template = PET_TYPES[pet.type];
        const multiplier = PET_QUALITIES[pet.quality].multiplier * pet.growth;
        pet.stats.attack = Math.round(template.baseStats.attack * multiplier);
        pet.stats.defense = Math.round(template.baseStats.defense * multiplier);
        pet.stats.speed = Math.round(template.baseStats.speed * multiplier);
        pet.stats.luck = Math.round(template.baseStats.luck * multiplier);

        // 遗传技能
        if (Math.random() < 0.5) {
            const inheritedSkills = template.skills.filter(() => Math.random() < 0.3);
            pet.skills = inheritedSkills.slice(0, 1);
        }
        updateDisplay();
    } else {
        addLog(`仙兽蛋还需要${pet.hatchDays}天孵化...`, '#aaa');
    }
    showPetPanel();
}

function feedPet(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];

    if (!pet.isHatched) {
        addLog('仙兽蛋无法喂养！', '#f44336');
        return;
    }

    // 弹出喂养选择
    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #ff9800;border-radius:12px;padding:20px;max-width:500px;">
            <h3 style="color:#ff9800;text-align:center;">🍖 喂养${pet.type}</h3>
            <p style="color:#aaa;text-align:center;">选择食物（当前灵石: ${gameState.spiritStones}）</p>`;

    Object.keys(PET_FOOD).forEach((food, i) => {
        const f = PET_FOOD[food];
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #333;">
            <div>
                <span style="color:#ffd700;">${food}</span>
                <span style="color:#aaa;font-size:0.9em;"> +经验${f.exp} +好感${f.happiness}</span>
            </div>
            <button class="btn" style="background:#4caf50;color:white;" onclick="confirmFeedPet(${idx},${i})"
                ${gameState.spiritStones < f.cost ? 'disabled' : ''}>💎${f.cost}</button>
        </div>`;
    });

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showPetPanel()">返回</button>
    </div></div></div>`;
    openModal('喂养', html, []);
}

function confirmFeedPet(idx, foodIdx) {
    const foods = Object.keys(PET_FOOD);
    const food = foods[foodIdx];
    const f = PET_FOOD[food];

    if (gameState.spiritStones < f.cost) {
        addLog('灵石不足！', '#f44336');
        return;
    }

    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];

    gameState.spiritStones -= f.cost;
    pet.exp += f.exp;
    pet.bond = Math.min(PET_CONFIG.bondMax, pet.bond + f.happiness);

    // 检查升级
    while (pet.exp >= pet.nextLevelExp) {
        pet.exp -= pet.nextLevelExp;
        pet.level++;
        pet.nextLevelExp = Math.floor(pet.nextLevelExp * 1.5);
        // 属性成长
        const template = PET_TYPES[pet.type];
        const multiplier = PET_QUALITIES[pet.quality].multiplier * pet.growth;
        const growthPerLevel = template.growthRate * multiplier;
        pet.stats.attack += Math.round(template.baseStats.attack * growthPerLevel * 0.1);
        pet.stats.defense += Math.round(template.baseStats.defense * growthPerLevel * 0.1);
        pet.stats.speed += Math.round(template.baseStats.speed * growthPerLevel * 0.1);
        pet.stats.luck += Math.round(template.baseStats.luck * growthPerLevel * 0.1);
        addLog(`🐉 ${pet.type}升级到Lv.${pet.level}！`, '#ffd700');
    }

    addLog(`喂养${pet.type}成功！`, '#4caf50');
    updateDisplay();
    showPetPanel();
}

function evolvePet(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];
    const evoStage = Math.floor(pet.level / PET_CONFIG.evolveMinLevel);

    if (evoStage >= 3) {
        addLog('已达到最大进化阶段！', '#f44336');
        return;
    }

    const evoCost = 5000 * (evoStage + 1);
    if (gameState.spiritStones < evoCost) {
        addLog(`进化需要${evoCost}灵石！`, '#f44336');
        return;
    }

    gameState.spiritStones -= evoCost;
    const newType = PET_EVOLUTION_MAP[pet.type] || pet.type;
    pet.type = newType;

    // 进化加成
    const multiplier = PET_QUALITIES[pet.quality].multiplier * pet.growth;
    const template = PET_TYPES[pet.type] || PET_TYPES[Object.keys(PET_TYPES)[0]];
    pet.stats.attack += Math.round(template.baseStats.attack * multiplier * 0.3);
    pet.stats.defense += Math.round(template.baseStats.defense * multiplier * 0.3);
    pet.stats.speed += Math.round(template.baseStats.speed * multiplier * 0.3);
    pet.stats.luck += Math.round(template.baseStats.luck * multiplier * 0.3);

    // 解锁进化天赋
    const evoTalents = {
        '金羽仙鹤': '御空加速',
        '九天凤凰': '涅槃之火',
        '圣金麒麟': '祥云笼罩',
        '战伐白虎': '白虎战魂',
        '苍青神龙': '青龙之怒',
        '冥水玄武': '玄冰护甲',
        '九天真狐': '九尾魅惑',
        '太古鲲鹏': '鲲鹏展翅',
        '星辉独角兽': '圣光治愈',
        '祥瑞白泽': '神兽智慧'
    };

    if (evoTalents[newType] && !pet.skills.includes(evoTalents[newType])) {
        pet.skills.push(evoTalents[newType]);
        addLog(`✨ 进化成功！领悟天赋【${evoTalents[newType]}】！`, '#ffd700');
    } else {
        addLog(`✨ 进化成功！${pet.type}！`, '#ff9800');
    }

    updateDisplay();
    showPetPanel();
}

function teachPetSkill(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];
    const template = PET_TYPES[pet.type];
    const allSkills = Object.keys(PET_SKILLS);

    let html = `<div class="modal" style="display:block;background:rgba(0,0,0,0.8);">
        <div style="background:#1a1a2e;border:2px solid #2196f3;border-radius:12px;padding:20px;max-width:500px;">
            <h3 style="color:#2196f3;text-align:center;">📖 传授技能给${pet.type}</h3>`;

    // 可学习的技能
    const learnableSkills = allSkills.filter(s => !pet.skills.includes(s) && PET_SKILLS[s]);
    learnableSkills.forEach(skill => {
        const sk = PET_SKILLS[skill];
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #333;">
            <div>
                <span style="color:#ffd700;">${skill}</span>
                <span style="color:#aaa;font-size:0.85em;">${sk.desc}</span>
            </div>
            <button class="btn" style="background:#2196f3;color:white;" onclick="confirmTeachSkill(${idx},'${skill}')">学习</button>
        </div>`;
    });

    html += `<div style="text-align:center;margin-top:15px;">
        <button class="btn" style="background:#555;color:white;" onclick="showPetPanel()">返回</button>
    </div></div></div>`;
    openModal('传授技能', html, []);
}

function confirmTeachSkill(idx, skill) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];
    const sk = PET_SKILLS[skill];

    if (pet.skills.length >= PET_CONFIG.skillSlotBase + Math.floor(pet.level / PET_CONFIG.evolveMinLevel)) {
        addLog('技能槽已满！', '#f44336');
        return;
    }

    pet.skills.push(skill);
    addLog(`🐉 ${pet.type}学会【${skill}】！`, '#2196f3');
    showPetPanel();
}

function releasePet(idx) {
    const sp = gameState.spiritPets;
    const pet = sp.pets[idx];

    if (confirm(`确定放生${pet.type}吗？放生后无法恢复！`)) {
        sp.pets.splice(idx, 1);
        addLog(`${pet.type}已被放生...`, '#aaa');
        updateDisplay();
        showPetPanel();
    }
}

function interactWithPets() {
    const sp = gameState.spiritPets;
    if (sp.pets.length === 0) {
        addLog('还没有仙宠！', '#f44336');
        return;
    }

    sp.pets.forEach(pet => {
        if (pet.isHatched) {
            pet.bond = Math.min(PET_CONFIG.bondMax, pet.bond + 5);
            // 互动增加少量经验
            pet.exp += 5;
            if (pet.exp >= pet.nextLevelExp) {
                pet.exp -= pet.nextLevelExp;
                pet.level++;
                pet.nextLevelExp = Math.floor(pet.nextLevelExp * 1.5);
                addLog(`🐉 ${pet.type}升级到Lv.${pet.level}！`, '#ffd700');
            }
        }
    });

    addLog('与所有仙宠互动，好感度提升！', '#4caf50');
    updateDisplay();
    showPetPanel();
}

// Alias for existing button handler
function openPet() {
    showPetPanel();
}

function processDailyPets() {
    const sp = gameState.spiritPets;
    if (sp.pets.length === 0) return;

    sp.pets.forEach(pet => {
        if (!pet.isHatched) {
            // 未孵化仙兽蛋自然孵化
            // 已在hatchPetEgg中处理
        } else {
            // 羁绊每日衰减
            pet.bond = Math.max(0, pet.bond - 2);

            // 羁绊加成：战斗时仙宠助战
            if (pet.bond >= 80) {
                const bonus = 0.1 + (pet.bond - 80) * 0.005;
                if (!gameState.activeEffects.petBond) {
                    gameState.activeEffects.petBond = 0;
                }
                gameState.activeEffects.petBond += bonus;
            }
        }
    });

    // 每日喂养提醒
    if (sp.pets.some(p => p.isHatched)) {
        addLog('🐉 你的仙宠饿了，记得去喂养哦！', '#ff9800');
    }
}

// 输出宠物战斗助战效果
function getPetCombatBonus() {
    const sp = gameState.spiritPets;
    let bonus = { attack: 0, defense: 0, speed: 0, luck: 0, revive: 0 };

    sp.pets.forEach(pet => {
        if (!pet.isHatched || pet.bond < 50) return;

        const bondFactor = pet.bond / PET_CONFIG.bondMax;
        const levelFactor = pet.level / 100 + 0.5;

        bonus.attack += pet.stats.attack * bondFactor * levelFactor * 0.3;
        bonus.defense += pet.stats.defense * bondFactor * levelFactor * 0.3;
        bonus.speed += pet.stats.speed * bondFactor * levelFactor * 0.2;
        bonus.luck += pet.stats.luck * bondFactor * levelFactor * 0.2;

        // 复活概率
        if (pet.skills.some(s => PET_SKILLS[s]?.effect?.revive)) {
            bonus.revive += 0.1 * bondFactor;
        }
    });

    return bonus;
}