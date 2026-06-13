import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/ai/CultivationL4SessionContext.test.js'],
    coverage: {
      include: ['src/systems/ai/CultivationL4SessionContext.js'],
      thresholds: { lines: 99, functions: 99, statements: 99, branches: 99 }
    }
  }
});
