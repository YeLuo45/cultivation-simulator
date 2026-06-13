import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/tools/CultivationIceArtTool.test.js'],
    coverage: {
      include: ['src/systems/tools/CultivationIceArtTool.js'],
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 88 }
    }
  }
});
