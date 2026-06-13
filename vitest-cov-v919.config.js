import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/tools/CultivationPillRefiningTool.test.js'],
    coverage: {
      include: ['src/systems/tools/CultivationPillRefiningTool.js'],
      thresholds: { lines: 99, functions: 99, statements: 99, branches: 99 }
    }
  }
});
