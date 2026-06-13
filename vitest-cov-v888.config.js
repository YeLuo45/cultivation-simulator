import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        include: ['src/tests/systems/ai/CultivationL0MetaMemory.test.js'],
        coverage: {
            include: ['src/systems/ai/CultivationL0MetaMemory.js'],
            thresholds: { lines: 99, functions: 99, statements: 99, branches: 99 }
        }
    }
});