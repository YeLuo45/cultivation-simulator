import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/tools/CultivationFireArtTool.test.js'],
    coverage: {
      include: ['src/systems/tools/CultivationFireArtTool.js'],
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 88 }
    }
  }
});