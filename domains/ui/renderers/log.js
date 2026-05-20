// ===== UI Renderer: log.js =====
// Phase 5 extraction - UI layer

        // ===== renderLog =====
        function renderLog() {
            const container = document.getElementById('logEntries');
            const recentLogs = gameState.eventLog.slice(0, 5);
            container.innerHTML = recentLogs.map(log => `
                <div class="log-entry ${log.type}">
                    <div class="log-entry-title">第${log.day}天 - ${log.title}</div>
                    <div class="log-entry-text">${log.text}</div>
                </div>
            `).join('');
        }

