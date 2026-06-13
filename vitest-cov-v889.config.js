import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        include: ['src/tests/systems/ai/CultivationL1AchievementIndex.test.js'],
        coverage: {
            include: ['src/systems/ai/CultivationL1AchievementIndex.js'],
            thresholds: { lines: 99, functions: 99, statements: 99, branches: 99 }
        }
    }
});