// Auto-generated module: mount.js
'use strict';

// ===== MOUNT_TYPES =====
const MOUNT_TYPES = {
    '仙鹤': {
        icon: '🦅',
        baseStats: { speed: 30, attack: 10, defense: 5, luck: 15 },
        skills: ['御空加速'],
        growthRate: 1.0,
        maturityMax: 100,
        price: 1000
    },
    '凤凰': {
        icon: '🦅',
        baseStats: { speed: 25, attack: 20, defense: 15, luck: 25 },
        skills: ['御空加速', '仙兽护主'],
        growthRate: 1.2,
        maturityMax: 120,
        price: 5000
    },
    '麒麟': {
        icon: '🦄',
        baseStats: { speed: 20, attack: 25, defense: 20, luck: 20 },
        skills: ['御空加速', '仙兽护主'],
        growthRate: 1.1,
        maturityMax: 110,
        price: 8000
    },
    '白虎': {
        icon: '🐯',
        baseStats: { speed: 25, attack: 30, defense: 10, luck: 10 },
        skills: ['御空加速', '坐骑融合'],
        growthRate: 1.15,
        maturityMax: 105,
        price: 6000
    },
    '青龙': {
        icon: '🐉',
        baseStats: { speed: 35, attack: 15, defense: 15, luck: 20 },
        skills: ['御空加速', '仙缘感应'],
        growthRate: 1.25,
        maturityMax: 130,
        price: 10000
    },
    '玄武': {
        icon: '🐢',
        baseStats: { speed: 15, attack: 10, defense: 35, luck: 15 },
        skills: ['御空加速', '仙兽护主'],
        growthRate: 1.0,
        maturityMax: 140,
        price: 7000
    },
    '九尾狐': {
        icon: '🦊',
        baseStats: { speed: 30, attack: 20, defense: 10, luck: 30 },
        skills: ['御空加速', '仙缘感应'],
        growthRate: 1.3,
        maturityMax: 100,
        price: 12000
    },
    '鲲鹏': {
        icon: '🐋',
        baseStats: { speed: 40, attack: 15, defense: 10, luck: 20 },
        skills: ['御空加速', '坐骑融合', '仙缘感应'],
        growthRate: 1.4,
        maturityMax: 150,
        price: 20000
    }
};

// ===== MOUNT_GROWTH_TYPES =====
const MOUNT_GROWTH_TYPES = {
    '普通': { multiplier: 0.8, color: '#aaaaaa', price: 0 },
    '优秀': { multiplier: 1.0, color: '#4caf50', price: 1000 },
    '稀有': { multiplier: 1.2, color: '#2196f3', price: 5000 },
    '神话': { multiplier: 1.5, color: '#9c27b0', price: 20000 }
};

// ===== getRandomMountType =====
function getRandomMountType() {
    const types = Object.keys(MOUNT_TYPES);
    return types[Math.floor(Math.random() * types.length)];
}

// ===== getRandomGrowthType =====
function getRandomGrowthType() {
    const rand = Math.random();
    if (rand < 0.5) return '普通';
    if (rand < 0.8) return '优秀';
    if (rand < 0.95) return '稀有';
    return '神话';
}

// ===== createMount =====
function createMount(type, growth) {
    const template = MOUNT_TYPES[type];
    const growthData = MOUNT_GROWTH_TYPES[growth];
    
    return {
        uid: 'mount_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: type,
        type: type,
        level: 1,
        growth: growth,
        stats: {
            speed: Math.floor(template.baseStats.speed * growthData.multiplier),
            attack: Math.floor(template.baseStats.attack * growthData.multiplier),
            defense: Math.floor(template.baseStats.defense * growthData.multiplier),
            luck: Math.floor(template.baseStats.luck * growthData.multiplier)
        },
        skills: [...template.skills],
        maturity: 0,
        matureMax: template.maturityMax,
        exp: 0,
        expToLevel: 100
    };
}

// ===== acquireMount =====
function acquireMount(mount) {
    if (gameState.mounts.length >= 3) {
        showToast('仙兽栏已满（最多3只）');
        return false;
    }
    
    gameState.mounts.push(mount);
    addLog('good', '获得仙兽', `获得${mount.growth}级仙兽【${mount.name}】！`);
    saveGame();
    return true;
}

// ===== tryCaptureMount =====
function tryCaptureMount() {
    if (gameState.currentRealm !== 'immortal') {
        showToast('仙兽只可在仙界捕捉');
        return;
    }
    
    const mountType = getRandomMountType();
    const growth = getRandomGrowthType();
    const mount = createMount(mountType, growth);
    
    // 稀有度影响成功率
    const successRates = { '普通': 0.8, '优秀': 0.5, '稀有': 0.3, '神话': 0.1 };
    const luckBonus = gameState.currentMount ? gameState.currentMount.stats.luck / 200 : 0;
    
    if (Math.random() < successRates[growth] + luckBonus) {
        acquireMount(mount);
        showToast(`捕捉成功！获得${growth}仙兽【${mountType}】`);
    } else {
        showToast('捕捉失败，仙兽逃走了...');
    }
    
    saveGame();
}

// ===== feedMount =====
function feedMount(mountIndex, herbCount) {
    if (gameState.mounts.length <= mountIndex) return;
    
    const mount = gameState.mounts[mountIndex];
    if (mount.maturity >= mount.matureMax) {
        showToast('仙兽已完全成熟');
        return;
    }
    
    // 仙草喂养，每个仙草+5成熟度
    const gain = Math.min(herbCount * 5, mount.matureMax - mount.maturity);
    mount.maturity += gain;
    
    // 检查是否成熟
    if (mount.maturity >= mount.matureMax) {
        mount.level = Math.min(10, mount.level + 1);
        mount.maturity = mount.matureMax;
        showToast(`${mount.name}已完全成熟，等级提升！`);
    }
    
    saveGame();
    updateDisplay();
}

// ===== rideMount =====
function rideMount(mountIndex) {
    if (gameState.mounts.length <= mountIndex) return;
    
    gameState.currentMount = gameState.mounts[mountIndex];
    addLog('good', '骑乘仙兽', `骑乘【${gameState.currentMount.name}】飞行`);
    saveGame();
    updateDisplay();
}

// ===== dismountMount =====
function dismountMount() {
    if (!gameState.currentMount) return;
    addLog('neutral', '解除骑乘', `解除【${gameState.currentMount.name}】骑乘状态`);
    gameState.currentMount = null;
    saveGame();
    updateDisplay();
}

// ===== showMountPanel =====
function showMountPanel() {
    let html = '<div style="padding:16px;">';
    html += '<h3 style="color:#ffd700;text-align:center;margin-bottom:16px;">🐎 仙兽面板</h3>';
    
    // 当前骑乘
    if (gameState.currentMount) {
        const m = gameState.currentMount;
        html += `<div style="background:#1a1a2e;padding:12px;border-radius:8px;margin-bottom:12px;border:1px solid #ffd700;">`;
        html += `<div style="display:flex;align-items:center;gap:10px;">`;
        html += `<span style="font-size:32px;">${MOUNT_TYPES[m.type].icon}</span>`;
        html += `<div><div style="color:#ffd700;font-weight:bold;">${m.name}</div>`;
        html += `<div style="color:#aaa;font-size:12px;">${m.growth}级 | Lv.${m.level}</div></div>`;
        html += `<button onclick="dismountMount();closeModal();" style="margin-left:auto;padding:6px 12px;background:#c62828;color:white;border:none;border-radius:4px;cursor:pointer;">解除骑乘</button>`;
        html += '</div>';
        
        // 成熟度条
        const progress = (m.maturity / m.matureMax * 100).toFixed(0);
        html += `<div style="margin-top:8px;"><div style="display:flex;justify-content:space-between;color:#aaa;font-size:11px;"><span>成熟度</span><span>${progress}%</span></div>`;
        html += `<div style="height:6px;background:#333;border-radius:3px;margin-top:4px;"><div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#4caf50,#81c784);border-radius:3px;"></div></div></div>`;
        
        // 属性
        html += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px;text-align:center;">`;
        html += `<div><div style="color:#4caf50;font-size:14px;">${m.stats.speed}</div><div style="color:#666;font-size:10px;">速度</div></div>`;
        html += `<div><div style="color:#f44336;font-size:14px;">${m.stats.attack}</div><div style="color:#666;font-size:10px;">攻击</div></div>`;
        html += `<div><div style="color:#2196f3;font-size:14px;">${m.stats.defense}</div><div style="color:#666;font-size:10px;">防御</div></div>`;
        html += `<div><div style="color:#ff9800;font-size:14px;">${m.stats.luck}</div><div style="color:#666;font-size:10px;">幸运</div></div>`;
        html += '</div></div>';
    }
    
    // 仙兽列表
    html += '<div style="margin-bottom:12px;"><div style="color:#aaa;font-size:12px;margin-bottom:8px;">仙兽栏 (' + gameState.mounts.length + '/3)</div>';
    
    if (gameState.mounts.length === 0) {
        html += '<div style="text-align:center;color:#666;padding:20px;">暂无仙兽</div>';
    } else {
        for (let i = 0; i < gameState.mounts.length; i++) {
            const m = gameState.mounts[i];
            const isRiding = gameState.currentMount && gameState.currentMount.uid === m.uid;
            const growthColor = MOUNT_GROWTH_TYPES[m.growth].color;
            
            html += `<div style="background:#252540;padding:10px;border-radius:6px;margin-bottom:8px;cursor:pointer;" onclick="toggleMountDetails(${i})">`;
            html += `<div style="display:flex;align-items:center;gap:10px;">`;
            html += `<span style="font-size:24px;">${MOUNT_TYPES[m.type].icon}</span>`;
            html += `<div style="flex:1;">`;
            html += `<div style="color:${growthColor};font-weight:bold;">${m.name} <span style="color:#666;font-size:11px;">(${m.growth})</span></div>`;
            html += `<div style="color:#888;font-size:11px;">Lv.${m.level} | 成熟度${(m.maturity/m.matureMax*100).toFixed(0)}%</div>`;
            html += '</div>';
            if (!isRiding) {
                html += `<button onclick="event.stopPropagation();rideMount(${i});closeModal();" style="padding:4px 8px;background:#2e7d32;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">骑乘</button>`;
            } else {
                html += `<span style="color:#ffd700;font-size:11px;">已骑乘</span>`;
            }
            html += '</div></div>';
        }
    }
    html += '</div>';
    
    // 捕捉按钮
    html += `<button onclick="tryCaptureMount();closeModal();" style="width:100%;padding:12px;background:#1565c0;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">🔍 捕捉仙兽</button>`;
    
    html += `<button onclick="closeModal()" style="width:100%;margin-top:8px;padding:10px;background:#444;color:#ccc;border:none;border-radius:6px;cursor:pointer;">关闭</button>`;
    html += '</div>';
    
    openModal('仙兽', html, '');
}

// ===== MOUNT_SKILLS =====
const MOUNT_SKILLS = {
    '御空加速': {
        icon: '💨',
        effect: '移动冷却-50%',
        description: '骑乘时御空术冷却时间减半'
    },
    '仙兽护主': {
        icon: '🛡️',
        effect: '战斗加成',
        description: '战斗时仙兽协助攻击，伤害+20%'
    },
    '仙缘感应': {
        icon: '✨',
        effect: '仙缘任务+20%',
        description: '仙缘任务刷新概率+20%'
    },
    '坐骑融合': {
        icon: '🔗',
        effect: '属性翻倍',
        description: '骑乘时仙兽属性加成翻倍'
    }
};
