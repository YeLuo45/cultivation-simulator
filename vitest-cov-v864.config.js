import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        include: ['src/tests/systems/ai/CultivationDreamDaoInsight.test.js'],
        coverage: {
            include: ['src/systems/ai/CultivationDreamDaoInsight.js'],
            thresholds: { lines: 99, functions: 99, statements: 99, branches: 99 }
        }
    }
});
