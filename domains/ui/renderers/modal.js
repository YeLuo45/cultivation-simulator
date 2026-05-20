// ===== UI Renderer: modal.js =====
// Phase 5 extraction - UI layer

        // ===== closeModal =====
        function closeModal() {
            document.getElementById('eventModal').classList.remove('active');
        }

        // ===== closeSettings =====
        function closeSettings() {
            document.getElementById('settingsModal').classList.remove('active');
        }

        // ===== openModal =====
        function openModal(title, description, options) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDescription').innerHTML = description;
            document.getElementById('modalOptions').innerHTML = options;
            document.getElementById('modalOptions').classList.remove('hidden');
            document.getElementById('modalResult').classList.add('hidden');
            document.getElementById('eventModal').classList.add('active');
        }

        // ===== openSettings =====
        function openSettings() {
            // 填充当前配置
            document.getElementById('settingsApiKey').value = miniMaxConfig.apiKey || '';
            document.getElementById('settingsBaseUrl').value = miniMaxConfig.baseUrl || 'https://api.minimaxi.com/v1';
            document.getElementById('settingsModel').value = miniMaxConfig.model || 'MiniMax-M2.7';
            document.getElementById('featureAiDialogue').checked = miniMaxConfig.features.aiDialogue || false;
            document.getElementById('featureAiSerendipity').checked = miniMaxConfig.features.aiSerendipity || false;
            document.getElementById('featureAiTechnique').checked = miniMaxConfig.features.aiTechnique || false;
            
            // 清除测试结果
            document.querySelectorAll('.test-result').forEach(el => {
                el.className = 'test-result';
                el.style.display = 'none';
            });
            
            // 显示面板
            document.getElementById('settingsModal').classList.add('active');
        }

