// ============================================================
// PetHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 7850-8424
// Auto-generated - Do not edit manually
// ============================================================

            // V85: Pet Spirit Beast System
            mcpPetCapture(type, bait) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const VALID_TYPES = ['wolf', 'tiger', 'fox', 'dragon', 'phoenix', 'turtle'];
                    if (!VALID_TYPES.includes(type)) return { error: 'Invalid pet type' };
                    const BAIT_COST = { low: 50, medium: 150, high: 400, premium: 1000 };
                    const BAIT_SUCCESS = { low: 0.4, medium: 0.65, high: 0.85, premium: 0.95 };
                    const b = bait || 'medium';
                    const cost = BAIT_COST[b];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    const roll = Math.random();
                    const successRate = BAIT_SUCCESS[b];
                    if (roll > successRate) {
                        gs.spiritStones -= cost;
                        return { success: false, reason: 'Pet escaped', cost, remainingStones: gs.spiritStones };
                    }
                    gs.spiritStones -= cost;
                    gs.pets = gs.pets || [];
                    const petId = 'PET_' + Date.now();
                    const TIER_POWER = { wolf: 15, tiger: 20, fox: 12, dragon: 30, phoenix: 25, turtle: 10 };
                    const INTIMACY_THRESHOLDS = [0, 20, 40, 60, 80, 100];
                    const newPet = {
                        id: petId, type, name: type.charAt(0).toUpperCase() + type.slice(1),
                        form: 'child', level: 1, power: TIER_POWER[type] || 10,
                        intimacy: 0, hunger: 0, active: true, skills: [], equipped: null,
                        loyalty: 50, potential: Math.floor(Math.random() * 30) + 70,
                        captureCost: cost, capturedAt: Date.now()
                    };
                    gs.pets.push(newPet);
                    return { success: true, pet: newPet, cost, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetList(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pets = gs.pets || [];
                    const f = filter || 'all';
                    let filtered = pets;
                    if (f === 'active') filtered = pets.filter(p => p.active);
                    else if (f === 'released') filtered = pets.filter(p => !p.active);
                    return { pets: filtered, total: filtered.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetFeed(petId, food) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pets = gs.pets || [];
                    const pet = gs.pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found' };
                    if (!pet.active) return { error: 'Pet has been released' };
                    const FOOD_INTIMACY = { basic: 5, premium: 15, super: 30 };
                    const FOOD_COST = { basic: 20, premium: 80, super: 200 };
                    const f = food || 'basic';
                    const cost = FOOD_COST[f];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    gs.spiritStones -= cost;
                    pet.hunger = Math.max(0, pet.hunger - 20);
                    pet.intimacy = Math.min(100, pet.intimacy + FOOD_INTIMACY[f]);
                    pet.loyalty = Math.min(100, pet.loyalty + 2);
                    return { success: true, petId: pet.id, intimacy: pet.intimacy, loyalty: pet.loyalty, hunger: pet.hunger, cost };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetEvolve(petId, targetForm) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pets = gs.pets || [];
                    const pet = gs.pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found' };
                    if (!pet.active) return { error: 'Pet has been released' };
                    const VALID_FORMS = ['adult', 'mutant', 'divine'];
                    if (!VALID_FORMS.includes(targetForm)) return { error: 'Invalid target form' };
                    const FORM_ORDER = ['child', 'adult', 'mutant', 'divine'];
                    const currentIdx = FORM_ORDER.indexOf(pet.form);
                    const targetIdx = FORM_ORDER.indexOf(targetForm);
                    if (targetIdx <= currentIdx) return { error: 'Target form must be higher than current' };
                    const INTIMACY_REQUIRED = { adult: 30, mutant: 60, divine: 90 };
                    if (pet.intimacy < INTIMACY_REQUIRED[targetForm]) return { error: `Intimacy ${pet.intimacy} below required ${INTIMACY_REQUIRED[targetForm]} for ${targetForm}` };
                    const EVO_COST = { adult: 500, mutant: 2000, divine: 8000 };
                    const cost = EVO_COST[targetForm];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    gs.spiritStones -= cost;
                    pet.form = targetForm;
                    pet.power = Math.round(pet.power * (1 + (targetIdx - currentIdx) * 0.3));
                    pet.level = Math.min(99, pet.level + 5);
                    return { success: true, petId: pet.id, newForm: pet.form, newPower: pet.power, newLevel: pet.level, cost };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetRelease(petId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pets = gs.pets || [];
                    const pet = gs.pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found' };
                    if (!pet.active) return { error: 'Pet already released' };
                    pet.active = false;
                    pet.releasedAt = Date.now();
                    return { success: true, petId, status: 'released' };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetStats(petId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pets = gs.pets || [];
                    if (petId) {
                        const pet = pets.find(p => p.id === petId);
                        if (!pet) return { error: 'Pet not found' };
                        return { pet, active: pets.filter(p => p.active).length, total: pets.length };
                    }
                    return {
                        pets: pets.filter(p => p.active),
                        total: pets.length,
                        activeCount: pets.filter(p => p.active).length,
                        releasedCount: pets.filter(p => !p.active).length,
                        byType: {
                            wolf: pets.filter(p => p.type === 'wolf').length,
                            tiger: pets.filter(p => p.type === 'tiger').length,
                            fox: pets.filter(p => p.type === 'fox').length,
                            dragon: pets.filter(p => p.type === 'dragon').length,
                            phoenix: pets.filter(p => p.type === 'phoenix').length,
                            turtle: pets.filter(p => p.type === 'turtle').length
                        }
                    };
                } catch(e) { return { error: e.message }; }
            }

            // V86: Alchemy System
            mcpAlchemyListFormulas(tier) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const FORMULAS = [
                        { id: 'qi_pill_basic', name: '灵气丹(初)', tier: 'basic', effect: { cultivationXP: 50 }, learnCost: 0 },
                        { id: 'strength_pill_basic', name: '力量丹(初)', tier: 'basic', effect: { strength: 5 }, learnCost: 0 },
                        { id: 'spirit_pill_basic', name: '灵力丹(初)', tier: 'basic', effect: { maxSpirit: 20 }, learnCost: 0 },
                        { id: 'qi_pill_intermediate', name: '灵气丹(中)', tier: 'intermediate', effect: { cultivationXP: 200 }, learnCost: 200 },
                        { id: 'strength_pill_intermediate', name: '力量丹(中)', tier: 'intermediate', effect: { strength: 20 }, learnCost: 200 },
                        { id: 'spirit_pill_intermediate', name: '灵力丹(中)', tier: 'intermediate', effect: { maxSpirit: 80 }, learnCost: 200 },
                        { id: 'qi_pill_advanced', name: '灵气丹(高)', tier: 'advanced', effect: { cultivationXP: 800 }, learnCost: 800 },
                        { id: 'strength_pill_advanced', name: '力量丹(高)', tier: 'advanced', effect: { strength: 60 }, learnCost: 800 },
                        { id: 'spirit_pill_advanced', name: '灵力丹(高)', tier: 'advanced', effect: { maxSpirit: 200 }, learnCost: 800 },
                        { id: 'qi_pill_rare', name: '灵气丹(极)', tier: 'rare', effect: { cultivationXP: 3000 }, learnCost: 3000 },
                        { id: 'strength_pill_rare', name: '力量丹(极)', tier: 'rare', effect: { strength: 150 }, learnCost: 3000 },
                        { id: 'spirit_pill_rare', name: '灵力丹(极)', tier: 'rare', effect: { maxSpirit: 500 }, learnCost: 3000 }
                    ];
                    gs.learnedFormulas = gs.learnedFormulas || [];
                    const f = tier || 'all';
                    let filtered = FORMULAS;
                    if (f !== 'all') filtered = FORMULAS.filter(formula => formula.tier === f);
                    return { formulas: filtered, total: filtered.length, learnedCount: gs.learnedFormulas.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyCollectHerbs(location, quality) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const VALID_LOCATIONS = ['forest', 'mountain', 'cave', 'swamp'];
                    if (!VALID_LOCATIONS.includes(location)) return { error: 'Invalid location' };
                    const QUALITY_COST = { low: 30, medium: 100, high: 300, premium: 800 };
                    const QUALITY_YIELD = { low: 1, medium: 2, high: 3, premium: 5 };
                    const q = quality || 'medium';
                    const cost = QUALITY_COST[q];
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < cost) return { error: 'Not enough spirit stones', required: cost, available: gs.spiritStones };
                    gs.spiritStones -= cost;
                    gs.herbSlots = gs.herbSlots || { slot1: null, slot2: null, slot3: null };
                    const herbId = 'HERB_' + Date.now();
                    const HERB_POWER = { forest: 8, mountain: 12, cave: 15, swamp: 10 };
                    const herb = { id: herbId, location, quality: q, power: HERB_POWER[location] * QUALITY_YIELD[q], slot: null };
                    let placed = false;
                    for (const slot of ['slot1', 'slot2', 'slot3']) {
                        if (!gs.herbSlots[slot]) { gs.herbSlots[slot] = herb; herb.slot = slot; placed = true; break; }
                    }
                    if (!placed) return { success: false, reason: 'No herb slot available', cost, remainingStones: gs.spiritStones };
                    return { success: true, herb, cost, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyRefine(formulaId, herbSlot) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.herbSlots = gs.herbSlots || { slot1: null, slot2: null, slot3: null };
                    if (!gs.herbSlots[herbSlot]) return { error: 'Herb slot is empty' };
                    gs.learnedFormulas = gs.learnedFormulas || [];
                    if (!gs.learnedFormulas.includes(formulaId)) {
                        const FORMULA_LEARN_COST = { basic: 0, intermediate: 200, advanced: 800, rare: 3000 };
                        const allFormulas = [
                            { id: 'qi_pill_basic', tier: 'basic' }, { id: 'strength_pill_basic', tier: 'basic' }, { id: 'spirit_pill_basic', tier: 'basic' },
                            { id: 'qi_pill_intermediate', tier: 'intermediate' }, { id: 'strength_pill_intermediate', tier: 'intermediate' }, { id: 'spirit_pill_intermediate', tier: 'intermediate' },
                            { id: 'qi_pill_advanced', tier: 'advanced' }, { id: 'strength_pill_advanced', tier: 'advanced' }, { id: 'spirit_pill_advanced', tier: 'advanced' },
                            { id: 'qi_pill_rare', tier: 'rare' }, { id: 'strength_pill_rare', tier: 'rare' }, { id: 'spirit_pill_rare', tier: 'rare' }
                        ];
                        const formula = allFormulas.find(f => f.id === formulaId);
                        if (!formula) return { error: 'Unknown formula ID' };
                        const learnCost = FORMULA_LEARN_COST[formula.tier];
                        if (gs.spiritStones < learnCost) return { error: 'Not enough spirit stones to learn formula', required: learnCost };
                        gs.spiritStones -= learnCost;
                        gs.learnedFormulas.push(formulaId);
                    }
                    gs.pills = gs.pills || [];
                    const herb = gs.herbSlots[herbSlot];
                    gs.herbSlots[herbSlot] = null;
                    const basePower = herb ? herb.power : 5;
                    const craftSkill = gs.craftingSkill || 1;
                    const successRate = Math.min(0.95, 0.5 + craftSkill * 0.05);
                    const roll = Math.random();
                    if (roll > successRate) return { success: false, reason: 'Refinement failed', herbUsed: !!herb, cost: 0 };
                    const pillId = 'PILL_' + Date.now();
                    const qualityRoll = Math.random();
                    const pillQuality = qualityRoll > 0.9 ? 'high' : qualityRoll > 0.7 ? 'medium' : 'low';
                    const QUALITY_MULT = { low: 1.0, medium: 1.3, high: 1.8 };
                    const allFormulas = [
                        { id: 'qi_pill_basic', name: '灵气丹(初)', effect: { cultivationXP: 50 } },
                        { id: 'strength_pill_basic', name: '力量丹(初)', effect: { strength: 5 } },
                        { id: 'spirit_pill_basic', name: '灵力丹(初)', effect: { maxSpirit: 20 } },
                        { id: 'qi_pill_intermediate', name: '灵气丹(中)', effect: { cultivationXP: 200 } },
                        { id: 'strength_pill_intermediate', name: '力量丹(中)', effect: { strength: 20 } },
                        { id: 'spirit_pill_intermediate', name: '灵力丹(中)', effect: { maxSpirit: 80 } },
                        { id: 'qi_pill_advanced', name: '灵气丹(高)', effect: { cultivationXP: 800 } },
                        { id: 'strength_pill_advanced', name: '力量丹(高)', effect: { strength: 60 } },
                        { id: 'spirit_pill_advanced', name: '灵力丹(高)', effect: { maxSpirit: 200 } },
                        { id: 'qi_pill_rare', name: '灵气丹(极)', effect: { cultivationXP: 3000 } },
                        { id: 'strength_pill_rare', name: '力量丹(极)', effect: { strength: 150 } },
                        { id: 'spirit_pill_rare', name: '灵力丹(极)', effect: { maxSpirit: 500 } }
                    ];
                    const formula = allFormulas.find(frm => frm.id === formulaId);
                    const pill = {
                        id: pillId, formulaId, name: formula ? formula.name : formulaId,
                        quality: pillQuality, power: Math.round(basePower * QUALITY_MULT[pillQuality]),
                        effect: formula ? formula.effect : { cultivationXP: 50 }, consumed: false, createdAt: Date.now()
                    };
                    gs.pills.push(pill);
                    return { success: true, pill, successRate: Math.round(successRate * 100) + '%' };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyConsume(pillId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pills = gs.pills || [];
                    const pill = gs.pills.find(p => p.id === pillId);
                    if (!pill) return { error: 'Pill not found' };
                    if (pill.consumed) return { error: 'Pill already consumed' };
                    pill.consumed = true;
                    pill.consumedAt = Date.now();
                    if (pill.effect.cultivationXP) gs.cultivationXP = (gs.cultivationXP || 0) + pill.effect.cultivationXP;
                    if (pill.effect.strength) gs.strength = (gs.strength || 0) + pill.effect.strength;
                    if (pill.effect.maxSpirit) gs.maxSpirit = (gs.maxSpirit || 0) + pill.effect.maxSpirit;
                    return { success: true, pillId, effect: pill.effect, cultivationXP: gs.cultivationXP };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyPillStats(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.pills = gs.pills || [];
                    const f = filter || 'all';
                    let pills = gs.pills;
                    if (f === 'consumed') pills = gs.pills.filter(p => p.consumed);
                    else if (f === 'inventory') pills = gs.pills.filter(p => !p.consumed);
                    return { pills, total: pills.length, byQuality: { low: pills.filter(p => p.quality === 'low').length, medium: pills.filter(p => p.quality === 'medium').length, high: pills.filter(p => p.quality === 'high').length } };
                } catch(e) { return { error: e.message }; }
            }

            mcpAlchemyForgetFormula(formulaId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.learnedFormulas = gs.learnedFormulas || [];
                    const idx = gs.learnedFormulas.indexOf(formulaId);
                    if (idx === -1) return { error: 'Formula not learned' };
                    gs.learnedFormulas.splice(idx, 1);
                    return { success: true, formulaId, remainingFormulas: gs.learnedFormulas.length };
                } catch(e) { return { error: e.message }; }
            }

            // V87: Economy and Karma System
            mcpEconomyIncomeStats(period) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.economyLog = gs.economyLog || [];
                    const now = Date.now();
                    const PERIOD_MS = { day: 86400000, week: 604800000, month: 2592000000, all: Infinity };
                    const ms = PERIOD_MS[period] || PERIOD_MS['all'];
                    const since = now - ms;
                    const incomeEntries = gs.economyLog.filter(e => e.type === 'income' && e.time > since);
                    const total = incomeEntries.reduce((s, e) => s + (e.amount || 0), 0);
                    return { period, totalIncome: total, count: incomeEntries.length, entries: incomeEntries.slice(-20) };
                } catch(e) { return { error: e.message }; }
            }

            mcpEconomyExpenseStats(period) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.economyLog = gs.economyLog || [];
                    const now = Date.now();
                    const PERIOD_MS = { day: 86400000, week: 604800000, month: 2592000000, all: Infinity };
                    const ms = PERIOD_MS[period] || PERIOD_MS['all'];
                    const since = now - ms;
                    const expenseEntries = gs.economyLog.filter(e => e.type === 'expense' && e.time > since);
                    const total = expenseEntries.reduce((s, e) => s + (e.amount || 0), 0);
                    return { period, totalExpense: total, count: expenseEntries.length, entries: expenseEntries.slice(-20) };
                } catch(e) { return { error: e.message }; }
            }

            mcpEconomyTransfer(targetName, amount) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!targetName || amount <= 0) return { error: 'Invalid target or amount' };
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < amount) return { error: 'Not enough spirit stones', required: amount, available: gs.spiritStones };
                    gs.spiritStones -= amount;
                    gs.economyLog = gs.economyLog || [];
                    gs.economyLog.push({ type: 'expense', category: 'transfer', amount, target: targetName, time: Date.now() });
                    return { success: true, amount, target: targetName, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpRealmTribute(amount) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!amount || amount <= 0) return { error: 'Invalid tribute amount' };
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < amount) return { error: 'Not enough spirit stones', required: amount, available: gs.spiritStones };
                    gs.spiritStones -= amount;
                    gs.realmTributeTotal = (gs.realmTributeTotal || 0) + amount;
                    gs.economyLog = gs.economyLog || [];
                    gs.economyLog.push({ type: 'expense', category: 'tribute', amount, time: Date.now() });
                    // Tribute buffs scale with amount
                    const BUFF_MULT = 0.001;
                    const buffPower = amount * BUFF_MULT;
                    gs.realmTributeBuff = (gs.realmTributeBuff || 0) + buffPower;
                    return { success: true, amount, tributeTotal: gs.realmTributeTotal, buffPower: Math.round(buffPower * 100) / 100 };
                } catch(e) { return { error: e.message }; }
            }

            mcpHeavenlyBlessing(type) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const karma = gs.karmaPoints || 0;
                    if (karma < 100) return { error: 'Insufficient karma points (need 100)', current: karma };
                    const BLESSING_COST = { cultivation: 100, combat: 150, luck: 200, realm: 300 };
                    const cost = BLESSING_COST[type] || 100;
                    if (karma < cost) return { error: `Not enough karma for ${type} blessing (need ${cost})`, current: karma };
                    gs.karmaPoints -= cost;
                    const BLESSING_EFFECTS = {
                        cultivation: { cultivationSpeed: 1.2, expBonus: 0.1 },
                        combat: { attackBonus: 0.15, defenseBonus: 0.1 },
                        luck: { dropRateBonus: 0.2, serendipityChance: 0.1 },
                        realm: { breakthroughBonus: 0.15, tribulationResistance: 0.1 }
                    };
                    const effect = BLESSING_EFFECTS[type] || BLESSING_EFFECTS.cultivation;
                    gs.heavenlyBlessingActive = gs.heavenlyBlessingActive || {};
                    gs.heavenlyBlessingActive[type] = { effect, expiresAt: Date.now() + 3600000, cost };
                    return { success: true, type, cost, effect, expiresIn: '1 hour' };
                } catch(e) { return { error: e.message }; }
            }

            mcpKarmaPointQuery(limit) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const karma = gs.karmaPoints || 0;
                    const history = (gs.karmaHistory || []).slice(-(limit || 20));
                    return { currentKarma: karma, totalEvents: (gs.karmaHistory || []).length, history };
                } catch(e) { return { error: e.message }; }
            }

            // V88: Celestial Market and Serendipity
            mcpCelestialMarketList(category) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.celestialMarket = gs.celestialMarket || [];
                    const VALID_CATS = ['pills', 'artifacts', 'techniques', 'materials', 'all'];
                    const cat = category || 'all';
                    if (!VALID_CATS.includes(cat)) return { error: 'Invalid category' };
                    const items = cat === 'all' ? gs.celestialMarket : gs.celestialMarket.filter(i => i.category === cat);
                    return { items, total: items.length, category: cat };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialMarketBuy(itemId, quantity) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.celestialMarket = gs.celestialMarket || [];
                    const item = gs.celestialMarket.find(i => i.id === itemId);
                    if (!item) return { error: 'Item not found in market' };
                    const qty = quantity || 1;
                    const totalCost = item.price * qty;
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < totalCost) return { error: 'Not enough spirit stones', required: totalCost, available: gs.spiritStones };
                    gs.spiritStones -= totalCost;
                    gs.inventory = gs.inventory || [];
                    for (let i = 0; i < qty; i++) gs.inventory.push({ ...item, id: item.id + '_' + Date.now() + i });
                    gs.economyLog = gs.economyLog || [];
                    gs.economyLog.push({ type: 'expense', category: 'market_buy', amount: totalCost, itemId, time: Date.now() });
                    return { success: true, item: item.name, quantity: qty, totalCost, remainingStones: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialMarketSell(itemId, price) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.inventory = gs.inventory || [];
                    const idx = gs.inventory.findIndex(i => i.id === itemId);
                    if (idx === -1) return { error: 'Item not found in inventory' };
                    if (!price || price <= 0) return { error: 'Invalid price' };
                    const item = gs.inventory[idx];
                    gs.inventory.splice(idx, 1);
                    gs.celestialMarket = gs.celestialMarket || [];
                    gs.celestialMarket.push({ id: 'MKT_' + Date.now(), name: item.name, category: item.category || 'materials', price, seller: gs.name || 'Player', listedAt: Date.now() });
                    return { success: true, item: item.name, price, marketFee: Math.round(price * 0.05) };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialMarketSearch(keyword) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    gs.celestialMarket = gs.celestialMarket || [];
                    const kw = (keyword || '').toLowerCase();
                    const results = gs.celestialMarket.filter(i => (i.name || '').toLowerCase().includes(kw));
                    return { results, count: results.length, keyword };
                } catch(e) { return { error: e.message }; }
            }

            mcpSerendipityTrigger(type) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const TYPES = ['treasure', 'encounter', 'blessing', 'danger', 'all'];
                    const t = type || 'all';
                    const SERENDIPITY_POOL = [
                        { type: 'treasure', name: '发现古修士洞府', karma: 10, reward: { spiritStones: 500 } },
                        { type: 'encounter', name: '遇见散仙论道', karma: 15, reward: { cultivationXP: 200 } },
                        { type: 'blessing', name: '天降祥瑞', karma: 20, reward: { maxSpirit: 50 } },
                        { type: 'danger', name: '遭遇妖兽袭击', karma: -10, reward: { combatXP: 100 } }
                    ];
                    const pool = t === 'all' ? SERENDIPITY_POOL : SERENDIPITY_POOL.filter(e => e.type === t);
                    if (pool.length === 0) return { error: 'No serendipity events of this type' };
                    const event = pool[Math.floor(Math.random() * pool.length)];
                    const eventId = 'SER_' + Date.now();
                    gs.karmaPoints = (gs.karmaPoints || 0) + event.karma;
                    gs.karmaHistory = gs.karmaHistory || [];
                    gs.karmaHistory.push({ eventId, type: event.type, karma: event.karma, reason: event.name, time: Date.now() });
                    return { eventId, type: event.type, name: event.name, karmaDelta: event.karma, reward: event.reward };
                } catch(e) { return { error: e.message }; }
            }

            mcpSerendipityKarmaUpdate(eventId, karmaDelta, reason) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (karmaDelta === undefined) return { error: 'karmaDelta required' };
                    gs.karmaPoints = (gs.karmaPoints || 0) + (karmaDelta || 0);
                    gs.karmaHistory = gs.karmaHistory || [];
                    gs.karmaHistory.push({ eventId, karma: karmaDelta, reason: reason || 'serendipity', time: Date.now() });
                    return { success: true, eventId, newKarma: gs.karmaPoints, karmaDelta };
                } catch(e) { return { error: e.message }; }
            }

            // V89: Arena Leaderboard and Ladder
            mcpArenaLeaderboard(season, limit) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const seasonId = season || gs.currentSeason || 'S1';
                    const max = limit || 10;
                    const leaderboard = gs.arenaLeaderboard || [];
                    const top = leaderboard.slice(0, max).map((e, i) => ({
                        rank: i + 1, playerId: e.playerId, name: e.name || '修士', rating: e.rating || 1500, wins: e.wins || 0
                    }));
                    return { season: seasonId, leaderboard: top, total: leaderboard.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpArenaMatchHistory(playerId, season, limit) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pid = playerId || gs.playerId || gs.name || 'Player';
                    const seasonId = season || gs.currentSeason || 'S1';
                    const max = limit || 20;
                    const history = gs.arenaMatchHistory || [];
                    const filtered = history.filter(m => m.playerId === pid && m.season === seasonId);
                    return { playerId: pid, season: seasonId, matches: filtered.slice(-max), total: filtered.length };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectWarReport(reportId, sectId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const sid = sectId || (gs.sect && gs.sect.id) || 'SECT_001';
                    const reports = gs.sectWarReports || [];
                    const report = reports.find(r => r.id === reportId && (r.sectId === sid || !reportId));
                    if (!report) return { error: 'War report not found', reportId, sectId: sid };
                    return { reportId: report.id, sectId: report.sectId, date: report.date, outcome: report.outcome, details: report.details };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectBattleStats(sectId, statType) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const sid = sectId || (gs.sect && gs.sect.id) || 'SECT_001';
                    const stats = gs.sectBattleStats || {};
                    const sectStats = stats[sid] || { wins: 0, losses: 0, draws: 0 };
                    if (statType && statType !== 'all') return { [statType]: sectStats[statType] || 0 };
                    return { sectId: sid, ...sectStats };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialLadderRank(playerId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pid = playerId || gs.playerId || gs.name || 'Player';
                    const ladder = gs.celestialLadder || [];
                    const entry = ladder.find(e => e.playerId === pid);
                    if (!entry) return { playerId: pid, rank: 0, rating: 1500, message: 'Not on ladder' };
                    return { playerId: pid, rank: entry.rank || 0, rating: entry.rating || 1500, wins: entry.wins || 0, losses: entry.losses || 0 };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialLadderFight(targetPlayerId, stake) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const target = targetPlayerId || 'RIVAL_001';
                    const stakeAmount = stake || 100;
                    gs.spiritStones = gs.spiritStones || 0;
                    if (gs.spiritStones < stakeAmount) return { error: 'Not enough spirit stones for stake', required: stakeAmount, available: gs.spiritStones };
                    const myRating = 1500;
                    const targetEntry = gs.celestialLadder ? gs.celestialLadder.find(e => e.playerId === target) : null;
                    const targetRating = targetEntry ? targetEntry.rating : 1500;
                    const myChance = 1 / (1 + Math.pow(10, (targetRating - myRating) / 400));
                    const roll = Math.random();
                    const won = roll < myChance;
                    gs.spiritStones = won ? gs.spiritStones + stakeAmount : gs.spiritStones - stakeAmount;
                    const ratingDelta = Math.round(20 * (won ? 1 - myChance : myChance));
                    return {
                        success: true, won, ratingDelta, newRating: myRating + ratingDelta,
                        opponent: target, stake: stakeAmount, newBalance: gs.spiritStones,
                        message: won ? `挑战成功！rating +${ratingDelta}` : `挑战失败，损失${stakeAmount}灵石`
                    };
                } catch(e) { return { error: e.message }; }
            }
