// domains/cultivation/index.js
// Cultivation domain entry point
// Phase 3 DDD refactoring

// Entities
export { Player } from './entities/Player.js';
export { SpiritRoot } from './entities/SpiritRoot.js';
export { Sect } from './entities/Sect.js';
export { Tribulation } from './entities/Tribulation.js';

// Services
export { cultivationService } from './services/CultivationService.js';
export { tribulationService } from './services/TribulationService.js';
export { spiritRootService } from './services/SpiritRootService.js';
export { sectService } from './services/SectService.js';
