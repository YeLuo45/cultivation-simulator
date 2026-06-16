'use strict';
"use strict";
var CultivationSimulator = (() => {
  // shim.js
  var CONFIG = {
    realms: [],
    stages: [],
    stageNames: [],
    apiUrl: "",
    storageKey: "cultivationSave",
    apiConfigKey: "cultivationApiConfig",
    miniMaxConfigKey: "cultivationMiniMaxConfig"
  };
  var DEFAULT_MINIMAX_CONFIG = {
    apiKey: "",
    model: "MiniMax-M2.7",
    features: {
      npcDialogue: false,
      tribulationScene: false,
      serendipityDesc: false,
      sectTaskGen: false
    }
  };
  var gameState = {};
  var miniMaxConfig = {};
  var combatState = null;
  var currentEvent = null;
  window.init = function() {
  };
})();
