import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/tools/CultivationArtifactInventory.test.js'],
    coverage: {
      include: ['src/systems/tools/CultivationArtifactInventory.js'],
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 88 }
    }
  }
});
