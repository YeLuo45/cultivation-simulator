// ===== UI Renderer: pet.js =====
// Phase 5 extraction - UI layer

        // ===== closePet =====
        function closePet() {
            document.getElementById('petModal').classList.remove('active');
        }

        // ===== openPet =====
        function openPet() {
            document.getElementById('petModal').classList.add('active');
            renderPetHome('myPets');
        }

        // ===== renderMyPets =====
        function renderMyPets() {
            const pets = gameState.pets;
            
            if (pets.length === 0) {
                return `
                    <div class="pet-empty">
                        <div class="pet-empty-icon">🥚</div>
                        <p>你还没有灵兽</p>
                        <p style="font-size:0.85em;color:#888;">前往「召唤灵兽」或「灵兽商店」获得你的第一只灵兽吧！</p>
                    </div>
                `;
            }

            let petsHtml = pets.map((pet, index) => {
                const typeData = PET_TYPES[pet.type];
                const qualityClass = `quality-${pet.quality}`;
                const maxLevel = PET_MAX_LEVEL[pet.quality];
                const expPercent = Math.floor((pet.exp / (maxLevel * PET_EXP_NEEDED_PER_LEVEL)) * 100);
                const loyaltyPercent = Math.floor((pet.loyalty / PET_MAX_LOYALTY) * 100);
                const hungerPercent = Math.floor((pet.hunger / PET_MAX_HUNGER) * 100);
                const isHungry = pet.hunger < 30;
                const isSummoned = gameState.summonedPet === index;

                return `
                    <div class="pet-card ${isSummoned ? 'selected' : ''}" onclick="selectPet(${index})">
                        <div class="pet-info">
                            <div class="pet-avatar">${PET_TRANSFORMATION_STAGES[pet.transformation || 0].icon}</div>
                            <div>
                                <div class="pet-name">${pet.name} <span class="pet-quality ${qualityClass}">Lv.${pet.level}</span></div>
                                <div class="pet-realm">${pet.quality === 'legendary' ? '神兽' : pet.quality === 'precious' ? '珍兽' : pet.quality === 'rare' ? '灵兽' : '凡兽'} · ${PET_TRANSFORMATION_STAGES[pet.transformation || 0].name}</div>
                                <div class="pet-stats">
                                    <span class="pet-stat">⚔️ ${calculatePetStat(pet, 'attack')}</span>
                                    <span class="pet-stat">🛡️ ${calculatePetStat(pet, 'defense')}</span>
                                    <span class="pet-stat">❤️ ${calculatePetStat(pet, 'hp')}</span>
                                </div>
                                ${(pet.advancement || 0) > 0 ? '<div class="pet-advancement-badge">⬆️' + pet.advancement + '阶</div>' : ''}
                                ${(pet.awakenedSkills && pet.awakenedSkills.length > 0) ? '<div class="pet-awakening-badge">🌟' + pet.awakenedSkills.length + '技</div>' : ''}
                                ${(pet.mutations && pet.mutations.length > 0) ? '<div class="pet-mutation-badge">🧬' + pet.mutations.length + '</div>' : ''}
                            </div>
                        </div>
                        <div class="pet-actions">
                            ${isSummoned 
                                ? '<button class="pet-action-btn btn-release" onclick="event.stopPropagation(); dismissPet()">遣散</button>'
                                : '<button class="pet-action-btn btn-feed" onclick="event.stopPropagation(); summonPetByIndex(' + index + ')">召唤</button>'
                            }
                        </div>
                    </div>
                `;
            }).join('');

            // 详情区
            let detailHtml = '';
            if (gameState.selectedPetIndex !== undefined && pets[gameState.selectedPetIndex]) {
                const pet = pets[gameState.selectedPetIndex];
                const typeData = PET_TYPES[pet.type];
                const maxLevel = PET_MAX_LEVEL[pet.quality];
                const expPercent = Math.floor((pet.exp / (maxLevel * PET_EXP_NEEDED_PER_LEVEL)) * 100);
                const loyaltyPercent = Math.floor((pet.loyalty / PET_MAX_LOYALTY) * 100);
                const hungerPercent = Math.floor((pet.hunger / PET_MAX_HUNGER) * 100);
                const isHungry = pet.hunger < 30;

                detailHtml = `
                    <div class="pet-detail">
                        <div class="pet-detail-header">
                            <div class="pet-detail-avatar">${PET_TRANSFORMATION_STAGES[pet.transformation || 0].icon}</div>
                            <div>
                                <div class="pet-detail-name">
                                    ${pet.name}
                                    <span class="pet-detail-quality quality-${pet.quality}">${pet.quality === 'legendary' ? '神兽' : pet.quality === 'precious' ? '珍兽' : pet.quality === 'rare' ? '灵兽' : '凡兽'}</span>
                                </div>
                                <div class="pet-detail-realm">等级 ${pet.level}/${maxLevel} · ${PET_TRANSFORMATION_STAGES[pet.transformation || 0].name}</div>
                            </div>
                        </div>
                        <div class="pet-exp-bar">
                            <div class="pet-exp-fill" style="width:${expPercent}%">经验 ${pet.exp}/${maxLevel * PET_EXP_NEEDED_PER_LEVEL}</div>
                        </div>
                        <div style="margin-top:15px;">
                            <div style="color:#aaa;font-size:0.85em;margin-bottom:5px;">忠诚度</div>
                            <div class="pet-loyalty-bar">
                                <div class="pet-loyalty-fill" style="width:${loyaltyPercent}%"></div>
                            </div>
                        </div>
                        <div style="margin-top:10px;">
                            <div style="color:#aaa;font-size:0.85em;margin-bottom:5px;">饱食度 ${pet.hunger}/${PET_MAX_HUNGER}</div>
                            <div class="pet-hunger-bar">
                                <div class="pet-hunger-fill" style="width:${hungerPercent}%"></div>
                            </div>
                        </div>
                        <div class="pet-status-tags">
                            ${isHungry ? '<span class="pet-status-tag status-hungry">饥饿</span>' : ''}
                            ${pet.loyalty >= 80 ? '<span class="pet-status-tag status-loyal">忠诚</span>' : ''}
                        </div>
                        <div class="pet-abilities">
                            <div class="pet-ability">
                                <div class="pet-ability-name">${typeData.ability}</div>
                                <div class="pet-ability-desc">${typeData.abilityDesc}</div>
                            </div>
                            <div class="pet-ability">
                                <div class="pet-ability-name">基础属性</div>
                                <div class="pet-ability-desc">攻击:${typeData.baseStats.attack} 防御:${typeData.baseStats.defense} 生命:${typeData.baseStats.hp}</div>
                            </div>
                        </div>
                        <div class="pet-battle-stats">
                            <div class="pet-battle-stat">
                                <div class="pet-battle-stat-value">${calculatePetStat(pet, 'attack')}</div>
                                <div class="pet-battle-stat-label">攻击</div>
                            </div>
                            <div class="pet-battle-stat">
                                <div class="pet-battle-stat-value">${calculatePetStat(pet, 'defense')}</div>
                                <div class="pet-battle-stat-label">防御</div>
                            </div>
                            <div class="pet-battle-stat">
                                <div class="pet-battle-stat-value">${calculatePetStat(pet, 'hp')}</div>
                                <div class="pet-battle-stat-label">生命</div>
                            </div>
                        </div>
                        <div class="pet-advancement-info" style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span style="color:#ffd700;">⬆️ 进阶</span>
                                <span style="color:#aaa;">${pet.advancement || 0}/${PET_MAX_ADVANCEMENT}级</span>
                            </div>
                            <div style="margin-top:5px;font-size:0.85em;color:#888;">属性加成: +${(pet.advancement || 0) * PET_ADVANCEMENT_BONUS_PER_LEVEL * 100}%</div>
                        </div>
                        <div class="pet-transformation-info" style="margin-top:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span style="color:#ffd700;">✨ 化形</span>
                                <span style="color:#aaa;">${PET_TRANSFORMATION_STAGES[pet.transformation || 0].icon} ${PET_TRANSFORMATION_STAGES[pet.transformation || 0].name}</span>
                            </div>
                            <div style="margin-top:5px;font-size:0.85em;color:#888;">属性加成: +${PET_TRANSFORMATION_STAGES[pet.transformation || 0].statBonus * 100}%</div>
                        </div>
                        ${(pet.awakenedSkills && pet.awakenedSkills.length > 0) ? `
                        <div class="pet-awakening-info" style="margin-top:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span style="color:#ff69b4;">🌟 觉醒技能</span>
                                <span style="color:#aaa;">${pet.awakenedSkills.length}/${PET_MAX_AWAKENED_SKILLS}</span>
                            </div>
                            <div style="margin-top:8px;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
                                ${pet.awakenedSkills.map(skill => `
                                    <div style="background:rgba(255,105,180,0.15);padding:8px;border-radius:6px;text-align:center;">
                                        <div style="font-size:1.2em;">${skill.icon}</div>
                                        <div style="color:#ff69b4;font-size:0.8em;font-weight:bold;">${skill.name}</div>
                                        <div style="color:#888;font-size:0.7em;">${skill.desc}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : `
                        <div class="pet-awakening-info" style="margin-top:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span style="color:#ff69b4;">🌟 觉醒技能</span>
                                <span style="color:#aaa;">0/${PET_MAX_AWAKENED_SKILLS}</span>
                            </div>
                            <div style="margin-top:5px;font-size:0.85em;color:#888;">通过技能觉醒解锁强大技能</div>
                        </div>
                        `}
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <button class="pet-action-btn btn-feed" onclick="feedPet()" ${gameState.spiritStones < PET_FOOD_COST ? 'disabled' : ''}>🍖 喂养 (${PET_FOOD_COST}灵石)</button>
                        <button class="pet-action-btn btn-evolve" onclick="evolvePet()" ${!canEvolvePet(pet) ? 'disabled' : ''}>⬆️ 进化</button>
                        <button class="pet-action-btn btn-advancement" onclick="advancePet()" ${!canAdvancePet(pet) ? 'disabled' : ''}>📈 进阶</button>
                        <button class="pet-action-btn btn-transform" onclick="transformPet()" ${!canTransformPet(pet) ? 'disabled' : ''}>🧑 化形</button>
                        <button class="pet-action-btn btn-awaken" onclick="awakenPetSkill()" ${!canAwakenPetSkill(pet) ? 'disabled' : ''}>🌟 觉醒 (${PET_AWAKENING_COST}灵石)</button>
                        <button class="pet-action-btn btn-release" onclick="releasePet()">释放灵兽</button>
                    </div>
                `;
            }

            return petsHtml + detailHtml;
        }

        // ===== renderPetBreeding =====
        function renderPetBreeding() {
            const pets = gameState.pets;
            const pet1Index = gameState.selectedBreedingPet1;
            const pet2Index = gameState.selectedBreedingPet2;
            const pet1 = pet1Index !== null ? pets[pet1Index] : null;
            const pet2 = pet2Index !== null ? pets[pet2Index] : null;
            const breedingCooldowns = gameState.petBreedingCooldowns || {};
            
            // 检查繁殖条件
            const canBreed = (pet) => {
                if (!pet) return false;
                const cooldown = breedingCooldowns[pet.type + pet.name] || 0;
                return pet.loyalty >= PET_BREEDING_MIN_LOYALTY && cooldown <= 0;
            };
            
            // 渲染父母选择
            let parentsHtml = `
                <div class="pet-breeding-section">
                    <div class="pet-breeding-info">
                        <h4 style="color:#ffd700;margin-bottom:10px;">💕 灵兽繁殖</h4>
                        <p style="color:#aaa;font-size:0.85em;">选择两只灵兽进行繁殖，需要双方忠诚度≥${PET_BREEDING_MIN_LOYALTY}，繁殖冷却${PET_BREEDING_COOLDOWN}天</p>
                    </div>
                    <div class="pet-breeding-parents">
                        <div class="pet-breeding-parent ${pet1 ? 'selected' : ''}" onclick="selectBreedingPet(1)">
                            ${pet1 ? `
                                <div class="pet-icon">${PET_TYPES[pet1.type].icon}</div>
                                <div class="pet-name">${pet1.name}</div>
                                <div style="font-size:0.8em;color:#aaa;">忠诚度: ${pet1.loyalty}</div>
                                ${(breedingCooldowns[pet1.type + pet1.name] || 0) > 0 ? `<div style="color:#f44336;font-size:0.8em;">冷却中</div>` : '<div style="color:#4caf50;font-size:0.8em;">可繁殖</div>'}
                            ` : `
                                <div class="pet-icon">❓</div>
                                <div class="pet-name">选择灵兽</div>
                                <div style="font-size:0.8em;color:#888;">点击选择</div>
                            `}
                        </div>
                        <div class="pet-breeding-arrow">❤️</div>
                        <div class="pet-breeding-parent ${pet2 ? 'selected' : ''}" onclick="selectBreedingPet(2)">
                            ${pet2 ? `
                                <div class="pet-icon">${PET_TYPES[pet2.type].icon}</div>
                                <div class="pet-name">${pet2.name}</div>
                                <div style="font-size:0.8em;color:#aaa;">忠诚度: ${pet2.loyalty}</div>
                                ${(breedingCooldowns[pet2.type + pet2.name] || 0) > 0 ? `<div style="color:#f44336;font-size:0.8em;">冷却中</div>` : '<div style="color:#4caf50;font-size:0.8em;">可繁殖</div>'}
                            ` : `
                                <div class="pet-icon">❓</div>
                                <div class="pet-name">选择灵兽</div>
                                <div style="font-size:0.8em;color:#888;">点击选择</div>
                            `}
                        </div>
                    </div>
            `;
            
            // 宠物选择列表
            let petSelectHtml = '<div style="margin-top:20px;"><h4 style="color:#ffd700;margin-bottom:10px;">选择繁殖灵兽</h4><div class="pet-list">';
            pets.forEach((pet, index) => {
                const cooldown = breedingCooldowns[pet.type + pet.name] || 0;
                const onCooldown = cooldown > 0;
                const lowLoyalty = pet.loyalty < PET_BREEDING_MIN_LOYALTY;
                const isDisabled = onCooldown || lowLoyalty;
                const isSelected = pet1Index === index || pet2Index === index;
                petSelectHtml += `
                    <div class="pet-card ${isSelected ? 'selected' : ''}" onclick="${isDisabled ? '' : `selectBreedingPetFromList(${index})`}" style="${isDisabled ? 'opacity:0.5;' : ''}">
                        <div class="pet-info">
                            <div class="pet-avatar">${PET_TYPES[pet.type].icon}</div>
                            <div>
                                <div class="pet-name">${pet.name}</div>
                                <div class="pet-realm">忠诚度: ${pet.loyalty} ${onCooldown ? `| 冷却${cooldown}天` : ''}</div>
                            </div>
                        </div>
                        <div style="font-size:0.85em;color:${isDisabled ? '#f44336' : '#4caf50'};">
                            ${onCooldown ? '冷却中' : lowLoyalty ? '忠诚度不足' : (isSelected ? '已选择' : '可繁殖')}
                        </div>
                    </div>
                `;
            });
            petSelectHtml += '</div></div>';
            
            // 繁殖按钮
            const canStartBreeding = pet1 && pet2 && canBreed(pet1) && canBreed(pet2) && pet1Index !== pet2Index;
            let breedingBtnHtml = `
                <div class="pet-breeding-cost">
                    繁殖消耗: <span class="pet-breeding-cost-value">💎 ${PET_BREEDING_COST} 灵石</span>
                </div>
                <button class="pet-incubate-btn" onclick="startBreeding()" ${!canStartBreeding || gameState.spiritStones < PET_BREEDING_COST ? 'disabled' : ''} style="width:100%;padding:15px;font-size:1em;">
                    开始繁殖
                </button>
            `;
            
            // 繁殖结果
            let resultHtml = '';
            if (gameState.breedingResult) {
                const result = gameState.breedingResult;
                resultHtml = `
                    <div class="pet-breeding-result">
                        <div class="pet-breeding-result-icon">${PET_EGG_ICONS[result.quality]}</div>
                        <div class="pet-breeding-result-name">${PET_EGG_TYPES[result.quality].name}</div>
                        <div class="pet-breeding-result-quality">品质: ${result.quality === 'legendary' ? '神兽' : result.quality === 'precious' ? '珍兽' : result.quality === 'rare' ? '灵兽' : '凡兽'}</div>
                        <div style="margin-top:10px;color:#aaa;font-size:0.9em;">孵化需要 ${result.hatchDays} 天</div>
                    </div>
                `;
            }
            
            return parentsHtml + petSelectHtml + breedingBtnHtml + resultHtml + '</div>';
        }

        // ===== renderPetFusion =====
        function renderPetFusion() {
            const pets = gameState.pets;
            const pet1Index = gameState.selectedFusionPet1;
            const pet2Index = gameState.selectedFusionPet2;
            const pet1 = pet1Index !== null ? pets[pet1Index] : null;
            const pet2 = pet2Index !== null ? pets[pet2Index] : null;
            const fusionCooldowns = gameState.fusionCooldowns || {};
            const mutationCooldowns = gameState.mutationCooldowns || {};

            // 检查融合条件
            const canFuse = (pet) => {
                if (!pet) return false;
                const cooldown = fusionCooldowns[pet.type + pet.name + pet.id] || 0;
                return pet.loyalty >= PET_FUSION_MIN_LOYALTY && cooldown <= 0;
            };

            // 检查变异条件
            const canMutate = (pet) => {
                if (!pet) return false;
                const cooldown = mutationCooldowns[pet.type + pet.name + pet.id] || 0;
                return cooldown <= 0;
            };

            // 渲染融合父母选择
            let fusionHtml = `
                <div class="pet-fusion-section">
                    <div class="pet-fusion-info">
                        <h4 style="color:#e91e63;margin-bottom:10px;">🔮 灵兽融合</h4>
                        <p style="color:#aaa;font-size:0.85em;">
                            选择两只灵兽进行融合，融合后生成全新的灵兽个体，保留部分父母基因。<br>
                            融合需要双方忠诚度≥${PET_FUSION_MIN_LOYALTY}，融合冷却${PET_FUSION_COOLDOWN}天。
                        </p>
                    </div>
                    <div class="pet-fusion-parents">
                        <div class="pet-fusion-parent ${pet1 ? 'selected' : ''}" onclick="selectFusionPet(1)">
                            ${pet1 ? `
                                <div class="pet-icon">${PET_TYPES[pet1.type].icon}</div>
                                <div class="pet-name">${pet1.name}</div>
                                <div style="font-size:0.8em;color:#aaa;">忠诚度: ${pet1.loyalty}</div>
                                ${(fusionCooldowns[pet1.type + pet1.name + pet1.id] || 0) > 0 ? `<div style="color:#f44336;font-size:0.8em;">冷却中</div>` : '<div style="color:#4caf50;font-size:0.8em;">可融合</div>'}
                            ` : `
                                <div class="pet-icon">❓</div>
                                <div class="pet-name">选择灵兽</div>
                                <div style="font-size:0.8em;color:#888;">点击选择</div>
                            `}
                        </div>
                        <div class="pet-fusion-arrow">⚗️</div>
                        <div class="pet-fusion-parent ${pet2 ? 'selected' : ''}" onclick="selectFusionPet(2)">
                            ${pet2 ? `
                                <div class="pet-icon">${PET_TYPES[pet2.type].icon}</div>
                                <div class="pet-name">${pet2.name}</div>
                                <div style="font-size:0.8em;color:#aaa;">忠诚度: ${pet2.loyalty}</div>
                                ${(fusionCooldowns[pet2.type + pet2.name + pet2.id] || 0) > 0 ? `<div style="color:#f44336;font-size:0.8em;">冷却中</div>` : '<div style="color:#4caf50;font-size:0.8em;">可融合</div>'}
                            ` : `
                                <div class="pet-icon">❓</div>
                                <div class="pet-name">选择灵兽</div>
                                <div style="font-size:0.8em;color:#888;">点击选择</div>
                            `}
                        </div>
                    </div>
            `;

            // 宠物选择列表
            let petSelectHtml = '<div style="margin-top:20px;"><h4 style="color:#ffd700;margin-bottom:10px;">选择融合灵兽</h4><div class="pet-list">';
            pets.forEach((pet, index) => {
                const cooldown = fusionCooldowns[pet.type + pet.name + pet.id] || 0;
                const onCooldown = cooldown > 0;
                const lowLoyalty = pet.loyalty < PET_FUSION_MIN_LOYALTY;
                const isDisabled = onCooldown || lowLoyalty;
                const isSelected = pet1Index === index || pet2Index === index;
                petSelectHtml += `
                    <div class="pet-card ${isSelected ? 'selected' : ''}" onclick="${isDisabled ? '' : `selectFusionPetFromList(${index})`}" style="${isDisabled ? 'opacity:0.5;' : ''}">
                        <div class="pet-info">
                            <div class="pet-avatar">${PET_TYPES[pet.type].icon}</div>
                            <div>
                                <div class="pet-name">${pet.name} <span class="pet-quality quality-${pet.quality}">Lv.${pet.level}</span></div>
                                <div class="pet-realm">忠诚度: ${pet.loyalty} ${onCooldown ? `| 冷却${cooldown}天` : ''}</div>
                                <div class="pet-stats">
                                    <span class="pet-stat">⚔️ ${calculatePetStat(pet, 'attack')}</span>
                                    <span class="pet-stat">🛡️ ${calculatePetStat(pet, 'defense')}</span>
                                    <span class="pet-stat">❤️ ${calculatePetStat(pet, 'hp')}</span>
                                </div>
                                ${(pet.mutations && pet.mutations.length > 0) ? `<div class="pet-mutation-badge">🧬${pet.mutations.length}</div>` : ''}
                            </div>
                        </div>
                        <div style="font-size:0.85em;color:${isDisabled ? '#f44336' : '#4caf50'};">
                            ${onCooldown ? '冷却中' : lowLoyalty ? '忠诚度不足' : (isSelected ? '已选择' : '可融合')}
                        </div>
                    </div>
                `;
            });
            petSelectHtml += '</div></div>';

            // 融合预览
            let previewHtml = '';
            if (pet1 && pet2 && pet1Index !== pet2Index) {
                const previewStats = calculateFusionPreview(pet1, pet2);
                previewHtml = `
                    <div class="fusion-preview">
                        <div class="fusion-preview-title">⚗️ 融合预览</div>
                        <div style="color:#aaa;font-size:0.85em;">融合后预计属性：</div>
                        <div class="fusion-preview-stats">
                            <div class="fusion-preview-stat">
                                <div class="fusion-preview-stat-value">⚔️ ${previewStats.attack}</div>
                                <div class="fusion-preview-stat-label">攻击</div>
                            </div>
                            <div class="fusion-preview-stat">
                                <div class="fusion-preview-stat-value">🛡️ ${previewStats.defense}</div>
                                <div class="fusion-preview-stat-label">防御</div>
                            </div>
                            <div class="fusion-preview-stat">
                                <div class="fusion-preview-stat-value">❤️ ${previewStats.hp}</div>
                                <div class="fusion-preview-stat-label">生命</div>
                            </div>
                        </div>
                        ${previewStats.specialCombo ? `<div style="color:#e91e63;font-size:0.85em;margin-top:10px;">🌟 特殊组合: ${previewStats.specialCombo}</div>` : ''}
                    </div>
                `;
            }

            // 融合按钮
            const canStartFusion = pet1 && pet2 && canFuse(pet1) && canFuse(pet2) && pet1Index !== pet2Index;
            let fusionBtnHtml = `
                <div class="pet-fusion-cost">
                    融合消耗: <span class="pet-fusion-cost-value">💎 ${PET_FUSION_COST} 灵石</span>
                </div>
                <button class="pet-action-btn btn-fusion" onclick="startFusion()" ${!canStartFusion || gameState.spiritStones < PET_FUSION_COST ? 'disabled' : ''} style="width:100%;padding:15px;font-size:1em;">
                    开始融合 ⚗️
                </button>
            `;

            // 融合结果
            let resultHtml = '';
            if (gameState.fusionResult) {
                const result = gameState.fusionResult;
                resultHtml = `
                    <div class="pet-fusion-result">
                        <div class="pet-fusion-result-icon">${result.icon}</div>
                        <div class="pet-fusion-result-name">${result.name}</div>
                        <div class="pet-fusion-result-quality">
                            <span class="pet-quality quality-${result.quality}">${result.quality === 'legendary' ? '神兽' : result.quality === 'precious' ? '珍兽' : result.quality === 'rare' ? '灵兽' : '凡兽'}</span>
                            ${result.isSpecialCombo ? '<span class="pet-mutation-badge">特殊融合</span>' : ''}
                        </div>
                        <div class="pet-fusion-result-stats">
                            攻击: ${result.attack} | 防御: ${result.defense} | 生命: ${result.hp}
                        </div>
                        ${result.combinationAbility ? `<div style="color:#e91e63;font-size:0.85em;margin-top:5px;">🌟 组合技能: ${result.combinationAbility}</div>` : ''}
                        <div style="margin-top:10px;font-size:0.85em;color:#aaa;">融合消耗了两只灵兽，获得了全新的个体！</div>
                    </div>
                `;
            }

            // 基因变异区域
            let mutationHtml = `
                <div style="margin-top:30px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);">
                    <div class="pet-fusion-info">
                        <h4 style="color:#00bcd4;margin-bottom:10px;">🧬 基因变异</h4>
                        <p style="color:#aaa;font-size:0.85em;">
                            对单个灵兽进行基因变异，有概率获得新的变异效果。<br>
                            基因变异冷却${PET_MUTATION_COOLDOWN}天，变异成功率为${Math.round(PET_MUTATION_BASE_CHANCE * 100)}%+（受灵兽品质影响）。
                        </p>
                    </div>
            `;

            // 变异选择列表
            let mutationSelectHtml = '<div class="pet-list">';
            pets.forEach((pet, index) => {
                const cooldown = mutationCooldowns[pet.type + pet.name + pet.id] || 0;
                const onCooldown = cooldown > 0;
                const isDisabled = onCooldown;
                const currentMutations = pet.mutations || [];

                mutationSelectHtml += `
                    <div class="pet-card ${isDisabled ? '' : ''}" style="${isDisabled ? 'opacity:0.5;' : ''}">
                        <div class="pet-info">
                            <div class="pet-avatar">${PET_TYPES[pet.type].icon}</div>
                            <div>
                                <div class="pet-name">${pet.name} <span class="pet-quality quality-${pet.quality}">Lv.${pet.level}</span></div>
                                <div class="pet-realm">${onCooldown ? `冷却中 (${cooldown}天)` : '可变异'}</div>
                                <div class="pet-gene-list">
                                    ${Object.keys(PET_GENE_TYPES).map(geneType => {
                                        const gene = PET_GENE_TYPES[geneType];
                                        const geneLevel = getPetGeneLevel(pet, geneType);
                                        return `<div class="pet-gene-item ${geneLevel > 0 ? 'active' : 'inactive'}">${gene.icon} ${gene.name} ${geneLevel > 0 ? 'Lv.' + geneLevel : ''}</div>`;
                                    }).join('')}
                                </div>
                                ${currentMutations.length > 0 ? `
                                    <div style="margin-top:8px;">
                                        ${currentMutations.map(m => `<span class="pet-mutation-badge">${m.name}</span>`).join(' ')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <button class="pet-action-btn btn-mutate" onclick="startMutation(${index})" ${isDisabled || gameState.spiritStones < PET_MUTATION_COST ? 'disabled' : ''} style="padding:8px 15px;">
                            变异 ${PET_MUTATION_COST}💎
                        </button>
                    </div>
                `;
            });
            mutationSelectHtml += '</div>';

            mutationHtml += mutationSelectHtml + '</div>';

            return fusionHtml + petSelectHtml + previewHtml + fusionBtnHtml + resultHtml + '</div>' + mutationHtml;
        }

        // ===== renderPetHome =====
        function renderPetHome(tab) {
            const content = document.getElementById('petContent');
            const petCount = gameState.pets.length;
            const maxPets = 5;
            const eggCount = gameState.petEggs ? gameState.petEggs.length : 0;

            let tabsHtml = `
                <div class="pet-tabs">
                    <div class="pet-tab ${tab === 'myPets' ? 'active' : ''}" onclick="renderPetHome('myPets')">🐉 我的灵兽 (${petCount}/${maxPets})</div>
                    <div class="pet-tab ${tab === 'breeding' ? 'active' : ''}" onclick="renderPetHome('breeding')">💕 繁殖</div>
                    <div class="pet-tab ${tab === 'incubation' ? 'active' : ''}" onclick="renderPetHome('incubation')">🥚 孵化 (${eggCount})</div>
                    <div class="pet-tab ${tab === 'fusion' ? 'active' : ''}" onclick="renderPetHome('fusion')">🔮 融合变异</div>
                    <div class="pet-tab ${tab === 'summon' ? 'active' : ''}" onclick="renderPetHome('summon')">✨ 召唤灵兽</div>
                    <div class="pet-tab ${tab === 'market' ? 'active' : ''}" onclick="renderPetHome('market')">🏪 灵兽商店</div>
                </div>
            `;

            let bodyHtml = '';
            switch(tab) {
                case 'myPets':
                    bodyHtml = renderMyPets();
                    break;
                case 'breeding':
                    bodyHtml = renderPetBreeding();
                    break;
                case 'incubation':
                    bodyHtml = renderPetIncubation();
                    break;
                case 'fusion':
                    bodyHtml = renderPetFusion();
                    break;
                case 'summon':
                    bodyHtml = renderSummonPet();
                    break;
                case 'market':
                    bodyHtml = renderPetMarket();
                    break;
            }

            content.innerHTML = `
                <div class="pet-header">
                    <div class="pet-title">🐉 仙宠灵兽</div>
                    <div class="pet-count">${petCount}/${maxPets}</div>
                </div>
                ${tabsHtml}
                <div class="pet-content">
                    ${bodyHtml}
                </div>
            `;
        }

        // ===== renderPetIncubation =====
        function renderPetIncubation() {
            const eggs = gameState.petEggs || [];
            const maxEggs = PET_MAX_EGGS;
            
            if (eggs.length === 0) {
                return `
                    <div class="pet-egg-section">
                        <div class="incubation-nest">
                            <div class="incubation-nest-header">
                                <div class="incubation-nest-title">🥚 孵化巢穴</div>
                                <div class="incubation-nest-count">${eggs.length}/${maxEggs}</div>
                            </div>
                            <div style="text-align:center;padding:30px;color:#888;">
                                <div style="font-size:3em;">🥚</div>
                                <p style="margin-top:10px;">暂无灵兽蛋</p>
                                <p style="font-size:0.85em;">前往「繁殖」获得灵兽蛋吧！</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            let eggsHtml = eggs.map((egg, index) => {
                const eggData = PET_EGG_TYPES[egg.quality];
                const progress = ((egg.totalDays - egg.daysLeft) / egg.totalDays) * 100;
                const isReady = egg.daysLeft <= 0;
                
                return `
                    <div class="pet-egg-card">
                        <div class="pet-egg-icon">${PET_EGG_ICONS[egg.quality]}</div>
                        <div class="pet-egg-info">
                            <div class="pet-egg-name">${eggData.name}</div>
                            <div class="pet-egg-progress-bar">
                                <div class="pet-egg-progress-fill" style="width:${isReady ? 100 : progress}%"></div>
                            </div>
                            <div class="pet-egg-status">
                                ${isReady ? '<span style="color:#4caf50;">✨ 可孵化！</span>' : `孵化进度: ${egg.totalDays - egg.daysLeft}/${egg.totalDays}天`}
                            </div>
                        </div>
                        <div class="pet-egg-actions">
                            ${isReady ? `
                                <button class="pet-incubate-btn" onclick="hatchEgg(${index})" ${gameState.pets.length >= 5 ? 'disabled' : ''}>
                                    孵化
                                </button>
                            ` : egg.isHatching ? `
                                <button class="pet-incubate-btn" onclick="cancelIncubation(${index})" style="background:linear-gradient(135deg,#666,#888);">取消</button>
                            ` : `
                                <button class="pet-incubate-btn" onclick="startIncubation(${index})" ${gameState.pets.length >= 5 ? 'disabled' : ''}>催熟</button>
                            `}
                            <button class="pet-incubate-btn" onclick="discardEgg(${index})" style="background:linear-gradient(135deg,#c62828,#e53935);">丢弃</button>
                        </div>
                    </div>
                `;
            }).join('');
            
            return `
                <div class="pet-egg-section">
                    <div class="incubation-nest">
                        <div class="incubation-nest-header">
                            <div class="incubation-nest-title">🥚 孵化巢穴</div>
                            <div class="incubation-nest-count">${eggs.length}/${maxEggs}</div>
                        </div>
                        <div class="pet-egg-list">
                            ${eggsHtml}
                        </div>
                    </div>
                    <div style="margin-top:15px;padding:15px;background:rgba(0,0,0,0.3);border-radius:10px;">
                        <h4 style="color:#ffd700;margin-bottom:10px;">孵化说明</h4>
                        <p style="color:#aaa;font-size:0.85em;line-height:1.6;">
                            • 灵兽蛋会随时间自动孵化<br>
                            • 点击「催熟」可加速1天孵化进度<br>
                            • 催熟消耗50灵石<br>
                            • 孵化后的灵兽需要手动领取到灵兽栏
                        </p>
                    </div>
                </div>
            `;
        }

        // ===== renderPetMarket =====
        function renderPetMarket() {
            // 商店出售一些固定的灵兽
            const marketPets = [
                { type: '灵狐', price: 200, desc: '基础灵兽，适合新手' },
                { type: '玄蛇', price: 300, desc: '攻击型灵兽，有毒系技能' },
                { type: '青鸾', price: 800, desc: '稀有灵兽，鸣音技能强大' },
                { type: '白虎', price: 1200, desc: '强力战斗灵兽' },
                { type: '玄武', price: 1500, desc: '防御型神兽，护盾技能' },
                { type: '白泽', price: 2000, desc: '珍稀灵兽，增加奇遇触发率' }
            ];

            const itemsHtml = marketPets.map(item => {
                const typeData = PET_TYPES[item.type];
                return `
                    <div class="pet-market-item">
                        <div class="pet-market-info">
                            <div class="pet-market-name">${typeData.icon} ${item.type}</div>
                            <div style="color:#888;font-size:0.85em;">${item.desc}</div>
                            <div style="color:#aaa;font-size:0.8em;margin-top:5px;">技能: ${typeData.ability}</div>
                        </div>
                        <div class="pet-market-price">💎 ${item.price}</div>
                        <button class="pet-action-btn btn-feed" onclick="buyPetFromMarket('${item.type}', ${item.price})" 
                            ${gameState.spiritStones < item.price || gameState.pets.length >= 5 ? 'disabled' : ''}
                            style="margin-left:10px;">
                            购买
                        </button>
                    </div>
                `;
            }).join('');

            return `<div class="pet-market-list">${itemsHtml}</div>`;
        }

        // ===== renderSummonPet =====
        function renderSummonPet() {
            return `
                <div class="pet-summon-cost">
                    <div class="summon-cost-label">召唤消耗</div>
                    <div class="summon-cost-value">💎 ${PET_SUMMON_COST} 灵石</div>
                </div>
                <div style="text-align:center;padding:20px;">
                    <p style="color:#aaa;margin-bottom:20px;">使用灵石召唤一只随机灵兽</p>
                    <button class="pet-action-btn btn-feed" onclick="summonRandomPet()" ${gameState.spiritStones < PET_SUMMON_COST ? 'disabled' : ''} style="padding:15px 30px;font-size:1em;">
                        ✨ 开始召唤
                    </button>
                </div>
                <div style="margin-top:20px;padding:15px;background:rgba(0,0,0,0.3);border-radius:10px;">
                    <h4 style="color:#ffd700;margin-bottom:10px;">召唤说明</h4>
                    <p style="color:#aaa;font-size:0.85em;line-height:1.6;">
                        召唤可能获得：凡兽、灵兽、珍兽或神兽<br>
                        召唤结果与缘分有关，境界越高越容易获得珍兽
                    </p>
                </div>
            `;
        }

