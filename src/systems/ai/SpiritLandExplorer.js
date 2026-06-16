/**
 * SpiritLandExplorer.js - 灵地探索系统
 * V297 Iteration 3/9 - Spirit Land Exploration Engine
 * 
 * 融合6大设计系统:
 * - nanobot: Mesh network (exploration nodes)
 * - claude-code: Tool system (exploration techniques)
 * - generic-agent: Self-evolution (discovery-based growth)
 * - chatdev: Role specialization (explorer types)
 * - thunderbolt: Offline-first state persistence
 * - ruflo: Hook event system (discovery events)
 */

export class SpiritLandExplorer {
    constructor(config = {}) {
        this.locations = new Map();
        this.explorers = new Map();
        this.expeditions = new Map();
        this.discoveredTreasures = new Map();
        this.hooks = {};
        this.autoSave = config.autoSave !== false;
        this.evolutionEnabled = config.evolutionEnabled !== false;
        
        this.config = {
            maxLocations: config.maxLocations || 50,
            maxExplorersPerExpedition: config.maxExplorersPerExpedition || 5,
            discoveryChanceBonus: config.discoveryChanceBonus || 0.1,
        };
        
        this._registerDefaultHooks();
    }

    // ========== 灵地管理 ==========
    
    registerLocation(locationId, locationData = {}) {
        if (this.locations.has(locationId)) {
            return { success: false, error: 'LOCATION_EXISTS' };
        }
        
        const location = {
            locationId,
            name: locationData.name || locationId,
            level: locationData.level || 1,
            type: locationData.type || 'cave', // cave, forest, mountain, lake, ruins
            spiritDensity: locationData.spiritDensity || 1.0,
            dangerLevel: locationData.dangerLevel || 1,
            exploredPercentage: 0,
            discoveredAreas: [],
            treasures: locationData.treasures || [],
            enterCondition: locationData.enterCondition || null,
            cooldowns: {},
            meshConnections: [],
            discoveredAt: null,
            lastExploreAt: null,
        };
        
        this.locations.set(locationId, location);
        this._triggerHook('locationRegistered', { locationId, name: location.name, type: location.type });
        return { success: true, location };
    }
    
    getLocation(locationId) {
        return this.locations.get(locationId) || null;
    }
    
    removeLocation(locationId) {
        if (!this.locations.has(locationId)) {
            return { success: false, error: 'LOCATION_NOT_FOUND' };
        }
        this.locations.delete(locationId);
        this._triggerHook('locationRemoved', { locationId });
        return { success: true };
    }

    // ========== 探索者管理 ==========
    
    registerExplorer(explorerId, explorerData = {}) {
        if (this.explorers.has(explorerId)) {
            return { success: false, error: 'EXPLORER_EXISTS' };
        }
        
        const explorer = {
            explorerId,
            name: explorerData.name || explorerId,
            level: explorerData.level || 1,
            explorationSkill: explorerData.explorationSkill || 1.0,
            luck: explorerData.luck || 1.0,
            stamina: explorerData.stamina || 100,
            maxStamina: explorerData.maxStamina || 100,
            specializations: explorerData.specializations || [], // treasure_hunter, mapper, survivalist
            discoveries: explorerData.discoveries || [],
            successRate: explorerData.successRate || 0.8,
            evolutionLevel: 0,
        };
        
        this.explorers.set(explorerId, explorer);
        this._triggerHook('explorerRegistered', { explorerId, name: explorer.name });
        return { success: true, explorer };
    }
    
    getExplorer(explorerId) {
        return this.explorers.get(explorerId) || null;
    }

    // ========== 探索任务 ==========
    
    startExpedition(expeditionId, locationId, explorerIds, config = {}) {
        if (this.expeditions.has(expeditionId)) {
            return { success: false, error: 'EXPEDITION_EXISTS' };
        }
        
        const location = this.locations.get(locationId);
        if (!location) return { success: false, error: 'LOCATION_NOT_FOUND' };
        
        if (explorerIds.length > this.config.maxExplorersPerExpedition) {
            return { success: false, error: 'TOO_MANY_EXPLORERS' };
        }
        
        const explorers = [];
        for (const eid of explorerIds) {
            const explorer = this.explorers.get(eid);
            if (!explorer) return { success: false, error: 'EXPLORER_NOT_FOUND' };
            if (explorer.stamina < 20) {
                return { success: false, error: 'EXPLORER_EXHAUSTED' };
            }
            explorers.push(explorer);
        }
        
        const expedition = {
            expeditionId,
            locationId,
            explorers: explorerIds,
            status: 'active', // active, success, failed, aborted
            startTime: Date.now(),
            duration: config.duration || 60,
            discoveries: [],
            treasuresFound: [],
            dangerLevel: location.dangerLevel,
            successProbability: this._calculateSuccessRate(explorers, location),
            meshConnected: config.meshConnected || false,
        };
        
        // Consume stamina
        for (const explorer of explorers) {
            explorer.stamina = Math.max(0, explorer.stamina - 20);
        }
        
        this.expeditions.set(expeditionId, expedition);
        this._triggerHook('expeditionStarted', { expeditionId, locationId, explorerCount: explorerIds.length });
        return { success: true, expedition };
    }
    
    _calculateSuccessRate(explorers, location) {
        let rate = 0.5;
        
        // Average exploration skill
        for (const e of explorers) {
            rate += e.explorationSkill * 0.1;
            rate += e.luck * 0.05;
        }
        
        // Adjust for location danger
        rate -= location.dangerLevel * 0.1;
        
        // Apply discovery bonus
        rate += this.config.discoveryChanceBonus;
        
        return Math.max(0.1, Math.min(0.95, rate));
    }
    
    completeExpedition(expeditionId) {
        const expedition = this.expeditions.get(expeditionId);
        if (!expedition) return { success: false, error: 'EXPEDITION_NOT_FOUND' };
        if (expedition.status !== 'active') return { success: false, error: 'EXPEDITION_NOT_ACTIVE' };
        
        const location = this.locations.get(expedition.locationId);
        
        // Roll for success
        const roll = Math.random();
        if (roll < expedition.successProbability) {
            expedition.status = 'success';
            
            // Generate discoveries
            const numDiscoveries = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numDiscoveries; i++) {
                const discovery = this._generateDiscovery(expedition, location);
                expedition.discoveries.push(discovery);
                
                if (discovery.type === 'treasure') {
                    expedition.treasuresFound.push(discovery.treasure);
                }
            }
            
            // Update location explored percentage
            if (location) {
                location.exploredPercentage = Math.min(100, location.exploredPercentage + 10);
                location.discoveredAt = location.discoveredAt || Date.now();
            }
            
            this._triggerHook('expeditionSuccess', { expeditionId, discoveries: expedition.discoveries });
        } else {
            expedition.status = 'failed';
            this._triggerHook('expeditionFailed', { expeditionId });
        }
        
        expedition.endTime = Date.now();
        return {
            success: true,
            status: expedition.status,
            discoveries: expedition.discoveries,
            treasures: expedition.treasuresFound,
        };
    }
    
    _generateDiscovery(expedition, location) {
        const roll = Math.random();
        
        if (roll < 0.4) {
            return { type: 'area', name: this._randomAreaName(), spiritBonus: Math.random() * 0.5 };
        } else if (roll < 0.7) {
            return { type: 'resource', name: this._randomResourceName(), amount: Math.floor(Math.random() * 50) + 10 };
        } else {
            const treasure = this._generateTreasure(location?.level || 1);
            return { type: 'treasure', treasure };
        }
    }
    
    _randomAreaName() {
        const prefixes = ['Ancient', 'Mysterious', 'Hidden', 'Sealed', 'Forgotten'];
        const suffixes = ['Chamber', 'Garden', 'Shrine', 'Vault', 'Cave'];
        return prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + suffixes[Math.floor(Math.random() * suffixes.length)];
    }
    
    _randomResourceName() {
        const resources = ['Spirit Herbs', 'Soul Crystals', 'Ethereal Dust', 'Phoenix Feather', 'Dragon Scale'];
        return resources[Math.floor(Math.random() * resources.length)];
    }
    
    _generateTreasure(level) {
        const treasures = [
            { name: 'Spirit Stone', rarity: 'common', value: 100 * level },
            { name: 'Ancient Artifact', rarity: 'rare', value: 500 * level },
            { name: 'Immortal Herb', rarity: 'epic', value: 1000 * level },
            { name: 'Realm Fragment', rarity: 'legendary', value: 5000 * level },
        ];
        const roll = Math.random();
        if (roll < 0.6) return treasures[0];
        if (roll < 0.85) return treasures[1];
        if (roll < 0.97) return treasures[2];
        return treasures[3];
    }
    
    // ========== 宝藏管理 ==========
    
    registerTreasure(treasureId, treasureData) {
        if (this.discoveredTreasures.has(treasureId)) {
            return { success: false, error: 'TREASURE_EXISTS' };
        }
        
        const treasure = {
            treasureId,
            ...treasureData,
            discoveredAt: treasureData.discoveredAt || Date.now(),
            ownerId: null,
        };
        
        this.discoveredTreasures.set(treasureId, treasure);
        return { success: true, treasure };
    }
    
    // ========== Hook 系统 ==========
    
    _registerDefaultHooks() {
        const hooks = [
            'locationRegistered', 'locationRemoved', 'explorerRegistered',
            'expeditionStarted', 'expeditionSuccess', 'expeditionFailed',
            'treasureDiscovered',
        ];
        for (const h of hooks) this.hooks[h] = [];
    }
    
    registerHook(event, callback) {
        if (!this.hooks[event]) this.hooks[event] = [];
        this.hooks[event].push(callback);
        return () => { this.hooks[event] = this.hooks[event].filter(c => c !== callback); };
    }
    
    _triggerHook(event, data) {
        if (!this.hooks[event]) return;
        for (const cb of this.hooks[event]) {
            try { cb(data); } catch (e) { /* silent */ }
        }
    }

    // ========== 状态查询 ==========
    
    getOverview() {
        return {
            totalLocations: this.locations.size,
            totalExplorers: this.explorers.size,
            activeExpeditions: Array.from(this.expeditions.values()).filter(e => e.status === 'active').length,
            totalTreasures: this.discoveredTreasures.size,
            evolutionEnabled: this.evolutionEnabled,
        };
    }

    // ========== 数据持久化 ==========
    
    toJSON() {
        return {
            locations: Array.from(this.locations.entries()),
            explorers: Array.from(this.explorers.entries()),
            expeditions: Array.from(this.expeditions.entries()),
            discoveredTreasures: Array.from(this.discoveredTreasures.entries()),
            config: this.config,
        };
    }
    
    fromJSON(data) {
        this.locations = new Map(data.locations || []);
        this.explorers = new Map(data.explorers || []);
        this.expeditions = new Map(data.expeditions || []);
        this.discoveredTreasures = new Map(data.discoveredTreasures || []);
        if (data.config) this.config = { ...this.config, ...data.config };
    }
}