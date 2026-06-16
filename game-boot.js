/**
 * 游戏启动补丁：在 game.js 因加载期自测中断时，保证「开始新游戏」可用。
 * 在 index.html 中于 game.js 之后加载。
 */
(function () {
  'use strict';

  const SPIRIT_ROOT_QUALITIES = {
    '伪灵根': { grade: 0, icon: '🌱', speedBonus: 0.6, bottleneckBonus: 0.4, tribulationBonus: -0.2, weight: 35 },
    '下品灵根': { grade: 1, icon: '🌿', speedBonus: 0.8, bottleneckBonus: 0.2, tribulationBonus: -0.1, weight: 25 },
    '中品灵根': { grade: 2, icon: '🌳', speedBonus: 1.0, bottleneckBonus: 0, tribulationBonus: 0, weight: 20 },
    '上品灵根': { grade: 3, icon: '🌲', speedBonus: 1.3, bottleneckBonus: -0.15, tribulationBonus: 0.1, weight: 12 },
    '天灵根': { grade: 4, icon: '✨', speedBonus: 1.6, bottleneckBonus: -0.25, tribulationBonus: 0.2, weight: 6 },
    '混沌灵根': { grade: 5, icon: '🌈', speedBonus: 2.0, bottleneckBonus: -0.4, tribulationBonus: 0.3, weight: 2 },
  };

  window.__SPIRIT_ROOT_QUALITIES__ = SPIRIT_ROOT_QUALITIES;

  function generateRandomSpiritRoot() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedQuality = '中品灵根';
    for (const [quality, data] of Object.entries(SPIRIT_ROOT_QUALITIES)) {
      cumulative += data.weight;
      if (rand < cumulative) {
        selectedQuality = quality;
        break;
      }
    }
    const affinity = {
      metal: Math.floor(Math.random() * 40) + 10,
      wood: Math.floor(Math.random() * 40) + 10,
      water: Math.floor(Math.random() * 40) + 10,
      fire: Math.floor(Math.random() * 40) + 10,
      earth: Math.floor(Math.random() * 40) + 10,
    };
    const total = affinity.metal + affinity.wood + affinity.water + affinity.fire + affinity.earth;
    const scale = 100 / total;
    for (const el in affinity) {
      affinity[el] = Math.floor(affinity[el] * scale);
    }
    return {
      quality: selectedQuality,
      affinity,
      resonance: Math.floor(Math.random() * 11),
      lastRefreshDay: 0,
    };
  }

  function renderLog() {
    const container = document.getElementById('logEntries');
    const gs = window.gameState;
    if (!container || !gs?.eventLog) return;
    const recentLogs = gs.eventLog.slice(0, 5);
    container.innerHTML = recentLogs
      .map(
        (log) => `
                <div class="log-entry ${log.type}">
                    <div class="log-entry-title">第${log.day}天 - ${log.title}</div>
                    <div class="log-entry-text">${log.text}</div>
                </div>
            `
      )
      .join('');
  }

  function updateDisplayBoot() {
    const gs = window.gameState;
    if (!gs) return;
    const realms = ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'];
    const stages = ['初期', '中期', '后期'];
    const realmName = realms[gs.realm] || '炼气';
    const stageName = stages[gs.stage] || '初期';
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set('realmDisplay', `${realmName}期`);
    set('qiDisplay', `${gs.qi}/${gs.maxQi}`);
    set('stonesDisplay', String(gs.spiritStones));
    set('mindsetDisplay', String(gs.mindset));
    set('daysDisplay', String(gs.days));
    set('realmName', `${realmName}期`);
    set('realmStage', stageName);
    const bar = document.getElementById('cultivationBar');
    if (bar) {
      bar.style.width = '0%';
      bar.textContent = '0%';
    }
  }

  function showGameUI() {
    const hide = (id) => document.getElementById(id)?.classList.add('hidden');
    const show = (id) => document.getElementById(id)?.classList.remove('hidden');
    hide('startScreen');
    hide('apiConfig');
    show('gameStats');
    show('cultivationProgress');
    show('equipmentBar');
    show('gameButtons');
    show('eventLog');
    updateDisplayBoot();
    renderLog();
  }

  function startNewGame(fromReincarnation = false) {
    window.gameState = {
      realm: 0,
      stage: 0,
      qi: 20,
      maxQi: 100,
      spiritStones: 50,
      mindset: 50,
      days: 1,
      cultivationProgress: 0,
      eventLog: [],
      isGameOver: false,
      isVictory: false,
      inventory: [],
      equippedTreasures: [null, null, null, null],
      maxInventorySlots: 20,
      shopItems: [],
      lastShopDay: 0,
      activeEffects: {},
      spiritRoot: generateRandomSpiritRoot(),
      constitutions: [],
      worldMap: {
        currentContinent: '中州',
        currentRegion: '中州城',
        actionPower: 10,
        maxActionPower: 10,
      },
      title: '筑基修士',
    };

    try {
      localStorage.setItem('cultivationSave', JSON.stringify(window.gameState));
    } catch (_) {
      /* ignore */
    }

    showGameUI();

    if (!fromReincarnation) {
      window.gameState.eventLog.unshift({
        type: 'welcome',
        title: '欢迎',
        text: '你踏入修仙之路，成为一名炼气期修士。吸收天地灵气，开启你的修仙之旅！',
        day: 1,
      });
      renderLog();
    }
  }

  window.renderLog = renderLog;
  window.showGameUI = showGameUI;
  window.startNewGame = startNewGame;
})();
