// Shim file - defines globals that game.js depends on before loading
// This allows Vite to bundle the game without ReferenceError

'use strict';

// CONFIG is referenced by game.js before its own definition
// We define a minimal version; game.js will overwrite it
const CONFIG = {
  realms: [],
  stages: [],
  stageNames: [],
  apiUrl: '',
  storageKey: 'cultivationSave',
  apiConfigKey: 'cultivationApiConfig',
  miniMaxConfigKey: 'cultivationMiniMaxConfig',
};

// DEFAULT_MINIMAX_CONFIG is referenced by game.js init
const DEFAULT_MINIMAX_CONFIG = {
  apiKey: '',
  model: 'MiniMax-M2.7',
  features: {
    npcDialogue: false,
    tribulationScene: false,
    serendipityDesc: false,
    sectTaskGen: false,
  },
};

// gameState is referenced before init
let gameState = {};

// miniMaxConfig is set by game.js
let miniMaxConfig = {};

// These are referenced by functions in game.js
let combatState = null;
let currentEvent = null;

// Expose init to window (game.js uses global init())
window.init = function() {};
