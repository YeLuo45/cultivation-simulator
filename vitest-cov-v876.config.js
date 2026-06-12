import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/ai/CultivationDreamSymbolDecoder.test.js'],
    coverage: {
      include: ['src/systems/ai/CultivationDreamSymbolDecoder.js'],
      thresholds: { lines: 99, functions: 99, statements: 99, branches: 99 }
    }
  }
});
