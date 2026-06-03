/**
 * DreamMemoryMCPService 单元测试
 * V268 Iteration 5/9 - Dream Memory MCP Server 集成
 *
 * 测试策略: 测试 MCP 工具存在性和基本响应结构
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock IndexedDB
vi.stubGlobal('indexedDB', {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(() => ({ onsuccess: null })),
          put: vi.fn(() => ({ onsuccess: null })),
          delete: vi.fn(() => ({ onsuccess: null })),
          get: vi.fn(() => ({ onsuccess: null, result: undefined })),
          openCursor: vi.fn(() => ({ onsuccess: null, result: null })),
          index: vi.fn(() => ({
            openCursor: vi.fn(() => ({ onsuccess: null, result: null })),
          })),
        })),
        oncomplete: null,
        onerror: null,
      })),
      close: vi.fn(),
      objectStoreNames: { contains: vi.fn(() => true) },
    },
  })),
  deleteDatabase: vi.fn(() => ({ onsuccess: null })),
});

vi.stubGlobal('IDBKeyRange', {
  bound: vi.fn(() => ({})),
  only: vi.fn(() => ({})),
  lowerBound: vi.fn(() => ({})),
  upperBound: vi.fn(() => ({})),
});

describe('DreamMemoryMCPService - 导出', () => {
  it('should export createDreamMemoryMCPService function', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    expect(typeof createDreamMemoryMCPService).toBe('function');
  });

  it('should export DREAM_MEMORY_MCP_TOOLS constant', async () => {
    const { DREAM_MEMORY_MCP_TOOLS } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    expect(DREAM_MEMORY_MCP_TOOLS).toBeDefined();
    expect(typeof DREAM_MEMORY_MCP_TOOLS).toBe('object');
  });
});

describe('DreamMemoryMCPService - 工具定义', () => {
  it('should have all required tool definitions', async () => {
    const { DREAM_MEMORY_MCP_TOOLS } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    expect(DREAM_MEMORY_MCP_TOOLS['dream.save']).toBeDefined();
    expect(DREAM_MEMORY_MCP_TOOLS['dream.query']).toBeDefined();
    expect(DREAM_MEMORY_MCP_TOOLS['dream.getOverview']).toBeDefined();
    expect(DREAM_MEMORY_MCP_TOOLS['dream.search']).toBeDefined();
    expect(DREAM_MEMORY_MCP_TOOLS['dream.getFamiliarity']).toBeDefined();
    expect(DREAM_MEMORY_MCP_TOOLS['dream.listRecent']).toBeDefined();
  });

  it('should have description for each tool', async () => {
    const { DREAM_MEMORY_MCP_TOOLS } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    for (const [name, tool] of Object.entries(DREAM_MEMORY_MCP_TOOLS)) {
      expect(tool.description).toBeDefined();
      expect(typeof tool.description).toBe('string');
    }
  });

  it('should have parameters for each tool', async () => {
    const { DREAM_MEMORY_MCP_TOOLS } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    for (const [name, tool] of Object.entries(DREAM_MEMORY_MCP_TOOLS)) {
      expect(tool.parameters).toBeDefined();
      expect(tool.parameters.type).toBe('object');
      expect(tool.parameters.properties).toBeDefined();
    }
  });

  it('dream.save should require npcId and content', async () => {
    const { DREAM_MEMORY_MCP_TOOLS } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const required = DREAM_MEMORY_MCP_TOOLS['dream.save'].parameters.required;
    expect(required).toContain('npcId');
    expect(required).toContain('content');
  });

  it('dream.query should require npcId', async () => {
    const { DREAM_MEMORY_MCP_TOOLS } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const required = DREAM_MEMORY_MCP_TOOLS['dream.query'].parameters.required;
    expect(required).toContain('npcId');
  });
});

describe('DreamMemoryMCPService - 实例方法', () => {
  it('should create service instance', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(service).toBeDefined();
  });

  it('should have dreamSave method', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(typeof service.dreamSave).toBe('function');
  });

  it('should have dreamQuery method', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(typeof service.dreamQuery).toBe('function');
  });

  it('should have dreamGetOverview method', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(typeof service.dreamGetOverview).toBe('function');
  });

  it('should have dreamSearch method', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(typeof service.dreamSearch).toBe('function');
  });

  it('should have dreamGetFamiliarity method', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(typeof service.dreamGetFamiliarity).toBe('function');
  });

  it('should have dreamListRecent method', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(typeof service.dreamListRecent).toBe('function');
  });

  it('should have init method', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(typeof service.init).toBe('function');
  });

  it('should have getToolDefinitions method', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(typeof service.getToolDefinitions).toBe('function');
  });

  it('getToolDefinitions should return same tools', async () => {
    const { createDreamMemoryMCPService, DREAM_MEMORY_MCP_TOOLS } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    const defs = service.getToolDefinitions();
    expect(defs).toEqual(DREAM_MEMORY_MCP_TOOLS);
  });
});

describe('DreamMemoryMCPService - dreamSave', () => {
  it('should be async', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(service.dreamSave({ npcId: 'npc1', content: 'test' })).toBeInstanceOf(Promise);
  });
});

describe('DreamMemoryMCPService - dreamQuery', () => {
  it('should be async', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(service.dreamQuery({ npcId: 'npc1' })).toBeInstanceOf(Promise);
  });
});

describe('DreamMemoryMCPService - dreamGetOverview', () => {
  it('should be async', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(service.dreamGetOverview({ npcId: 'npc1' })).toBeInstanceOf(Promise);
  });
});

describe('DreamMemoryMCPService - dreamSearch', () => {
  it('should be async', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(service.dreamSearch({ npcId: 'npc1', keyword: 'test' })).toBeInstanceOf(Promise);
  });
});

describe('DreamMemoryMCPService - dreamGetFamiliarity', () => {
  it('should be async', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(service.dreamGetFamiliarity({ npcId: 'npc1' })).toBeInstanceOf(Promise);
  });
});

describe('DreamMemoryMCPService - dreamListRecent', () => {
  it('should be async', async () => {
    const { createDreamMemoryMCPService } = await import('../../../systems/ai/DreamMemoryMCPService.js');
    const service = createDreamMemoryMCPService({});
    expect(service.dreamListRecent({ npcId: 'npc1' })).toBeInstanceOf(Promise);
  });
});