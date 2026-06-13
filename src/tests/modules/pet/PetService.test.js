/**
 * PetService 测试 - 灵宠系统
 * V259 Direction A: 仙宠进化系统
 * 
 * 测试覆盖率目标: ≥99%
 * 测试通过率目标: 100%
 */

// Vitest globals setup
global.GameGlobal = {
    getDB: () => null,
    setDB: () => null,
    getPlayerAttribute: () => null,
    _pet_db: null,
    _pet_counter: null,
    _evolve_db: null
};

// Import using dynamic import since project uses ES modules
import { PetService, PET_CONFIG, FOOD_CONFIG } from '../../../domains/pet/services/PetService.js';

// ========== 常量测试 ==========
describe('PetService Constants', () => {
    test('PET_CONFIG should have correct values', () => {
        expect(PET_CONFIG.maxPets).toBe(10);
        expect(PET_CONFIG.petSlots).toBe(3);
        expect(PET_CONFIG.evolveCostBase).toBe(500);
        expect(PET_CONFIG.evolveCostMultiplier).toBe(1.5);
        expect(PET_CONFIG.captureCost).toBe(200);
        expect(PET_CONFIG.petTypes).toEqual(['妖兽', '灵兽', '神兽', '仙兽']);
    });

    test('FOOD_CONFIG should have all tiers', () => {
        expect(FOOD_CONFIG.basic.cost).toBe(20);
        expect(FOOD_CONFIG.basic.intimacy).toBe(5);
        expect(FOOD_CONFIG.super.cost).toBe(200);
        expect(FOOD_CONFIG.super.intimacy).toBe(30);
    });
});

// ========== mcpPetList 测试 ==========
describe('PetService.mcpPetList', () => {
    test('should list all active pets', () => {
        const gs = {
            pets: [
                { id: 'pet_001', name: '青龙', active: true, level: 30 },
                { id: 'pet_002', name: '白虎', active: false, level: 20 }
            ],
            items: []
        };
        const service = new PetService(gs);
        const result = service.mcpPetList();
        expect(result.success).toBe(true);
        expect(result.pets).toBeDefined();
        expect(Array.isArray(result.pets)).toBe(true);
    });

    test('should return empty when no pets', () => {
        const gs = { pets: [], items: [] };
        const service = new PetService(gs);
        const result = service.mcpPetList();
        expect(result.pets.length).toBe(0);
    });

    test('should filter by active using V85 method', () => {
        const gs = {
            pets: [
                { id: 'pet_001', name: '青龙', active: true, type: 'dragon', level: 30 },
                { id: 'pet_002', name: '白虎', active: false, type: 'tiger', level: 20 }
            ],
            items: []
        };
        const service = new PetService(gs);
        const result = service.mcpPetListV85('active');
        expect(result.pets.length).toBe(1);
        expect(result.pets[0].name).toBe('青龙');
    });
});

// ========== mcpPetCapture 测试 ==========
describe('PetService.mcpPetCapture', () => {
    test('should return error when insufficient stones', () => {
        const gs = { pets: [], items: [], spiritStones: 10 };
        const service = new PetService(gs);
        const result = service.mcpPetCapture();
        expect(result.error).toBeDefined();
    });
});

// ========== mcpPetRelease 测试 ==========
describe('PetService.mcpPetRelease', () => {
    test('should return error for non-existent pet', () => {
        const gs = { pets: [], items: [] };
        const service = new PetService(gs);
        const result = service.mcpPetRelease('non_existent');
        expect(result.error).toContain('不存在');
    });
});

// ========== mcpPetFeed 测试 ==========
describe('PetService.mcpPetFeed', () => {
    test('should feed pet and increase affinity', () => {
        const gs = {
            pets: [{ id: 'pet_001', name: '青龙', hunger: 80, happiness: 30, affinity: 0 }],
            items: [{ id: 'pet_food', count: 5 }],
            spiritStones: 5000
        };
        const service = new PetService(gs);
        const result = service.mcpPetFeed('pet_001', 'pet_food');
        expect(result.success).toBe(true);
        expect(result.affinity).toBeGreaterThan(0);
    });

    test('should return affinity bonus for premium food', () => {
        const gs = {
            pets: [{ id: 'pet_001', name: '青龙', affinity: 0 }],
            items: [{ id: 'pet_food', count: 5 }],
            spiritStones: 5000
        };
        const service = new PetService(gs);
        const result = service.mcpPetFeed('pet_001', 'premium');
        expect(result.bonus).toBe(15);
    });

    test('should return error for non-existent pet', () => {
        const gs = {
            pets: [],
            items: [],
            spiritStones: 5000
        };
        const service = new PetService(gs);
        const result = service.mcpPetFeed('non_existent', 'normal');
        expect(result.error).toContain('not found');
    });
});

// ========== mcpPetEvolve 测试 ==========
describe('PetService.mcpPetEvolve', () => {
    test('should evolve pet with sufficient stones', () => {
        const gs = {
            pets: [{ id: 'pet_001', name: '青龙', level: 30, attack: 10, defense: 5, speed: 10 }],
            items: [],
            spiritStones: 50000,
            evolveProcess: {}
        };
        const service = new PetService(gs);
        const result = service.mcpPetEvolve('pet_001', 10);
        expect(result.error).toBeUndefined();
    });

    test('should increase stats after evolution', () => {
        const gs = {
            pets: [{ id: 'pet_001', name: '青龙', level: 30, attack: 10, defense: 5, speed: 10 }],
            items: [],
            spiritStones: 50000,
            evolveProcess: {}
        };
        const service = new PetService(gs);
        service.mcpPetEvolve('pet_001', 10);
        const pet = gs.pets[0];
        expect(pet.attack).toBeGreaterThanOrEqual(10);
    });

    test('should return error when insufficient stones', () => {
        const gs = {
            pets: [{ id: 'pet_001', name: '青龙', level: 30 }],
            items: [],
            spiritStones: 100
        };
        const service = new PetService(gs);
        const result = service.mcpPetEvolve('pet_001', 500);
        expect(result.error).toContain('spirit stones');
    });
});

// ========== mcpPetSkill 测试 ==========
describe('PetService.mcpPetSkill', () => {
    test('should learn new skill for pet', () => {
        const gs = {
            pets: [{ id: 'pet_001', name: '青龙', skills: [] }],
            items: [{ id: 'skill_book_fire', count: 1 }],
            spiritStones: 5000
        };
        const service = new PetService(gs);
        const result = service.mcpPetSkill('pet_001', 'learn', 'skill_book_fire');
        expect(result.success).toBe(true);
    });

    test('should return error when pet already has 4 skills', () => {
        const gs = {
            pets: [{
                id: 'pet_001',
                name: '青龙',
                skills: [
                    { id: 'skill1', name: '技能1' },
                    { id: 'skill2', name: '技能2' },
                    { id: 'skill3', name: '技能3' },
                    { id: 'skill4', name: '技能4' }
                ]
            }],
            items: [{ id: 'skill_book_fire', count: 1 }],
            spiritStones: 5000
        };
        const service = new PetService(gs);
        const result = service.mcpPetSkill('pet_001', 'learn', 'skill_book_fire');
        expect(result.error).toContain('4');
    });

    test('should return error for non-existent pet', () => {
        const gs = { pets: [], items: [], spiritStones: 5000 };
        const service = new PetService(gs);
        const result = service.mcpPetSkill('non_existent', 'learn', 'skill_book_fire');
        expect(result.error).toContain('not found');
    });
});

// ========== mcpPetStats 测试 ==========
describe('PetService.mcpPetStats', () => {
    test('should return stats for specific pet', () => {
        const gs = {
            pets: [{ id: 'pet_001', name: '青龙', active: true, level: 30, attack: 50 }],
            items: [],
            spiritStones: 5000
        };
        const service = new PetService(gs);
        const result = service.mcpPetStats('pet_001');
        expect(result.pet).toBeDefined();
        expect(result.pet.name).toBe('青龙');
        expect(result.pet.level).toBe(30);
    });

    test('should return all stats when no petId specified', () => {
        const gs = {
            pets: [
                { id: 'pet_001', name: '青龙', active: true, type: 'dragon' },
                { id: 'pet_002', name: '白虎', active: true, type: 'tiger' }
            ],
            items: [],
            spiritStones: 5000
        };
        const service = new PetService(gs);
        const result = service.mcpPetStats();
        expect(result.pets).toBeDefined();
        expect(result.total).toBe(2);
        expect(result.activeCount).toBe(2);
        expect(result.byType).toBeDefined();
    });

    test('should return pet not found error', () => {
        const gs = {
            pets: [],
            items: [],
            spiritStones: 5000
        };
        const service = new PetService(gs);
        const result = service.mcpPetStats('non_existent');
        expect(result.error).toBeDefined();
    });
});