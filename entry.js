// entry.js - Vite entry point for cultivation-simulator
// Loads shim globals, then the game, then calls init()

import './shim.js';

// The game.js uses global function declarations that become window properties
// after the script runs. We need to ensure window.init() is called after load.
import './game.js';

// Call init if available (game.js defines it as a global function)
if (typeof window.init === 'function') {
  // Delay slightly to ensure all globals are set up
  setTimeout(() => {
    try {
      window.init();
    } catch (e) {
      console.error('init() failed:', e);
    }
  }, 0);
}
