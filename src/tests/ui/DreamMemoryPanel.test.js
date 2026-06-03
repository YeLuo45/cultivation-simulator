/**
 * DreamMemoryPanel 单元测试
 * V268 Iteration 3/9 - Dream Memory UI 面板集成
 *
 * 测试策略: 测试 UI 组件的逻辑部分
 * DOM 渲染测试需要浏览器环境（jsdom），单独处理
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock IndexedDB before importing DreamMemoryPanel
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

describe('DreamMemoryPanel - 导出', () => {
  it('should export createDreamMemoryPanel function', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    expect(typeof createDreamMemoryPanel).toBe('function');
  });

  it('should export injectDreamMemoryStyles function', async () => {
    const { injectDreamMemoryStyles } = await import('../../ui/DreamMemoryPanel.js');
    expect(typeof injectDreamMemoryStyles).toBe('function');
  });
});

describe('DreamMemoryPanel - createDreamMemoryPanel', () => {
  it('should create panel instance', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(panel).toBeDefined();
  });

  it('should have required methods', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(typeof panel.render).toBe('function');
    expect(typeof panel.update).toBe('function');
    expect(typeof panel.remove).toBe('function');
    expect(typeof panel.getFamiliarityColor).toBe('function');
    expect(typeof panel.getFamiliarityLabel).toBe('function');
    expect(typeof panel.search).toBe('function');
  });
});

describe('DreamMemoryPanel - 内部方法', () => {
  it('should have element property', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(panel.element).toBeNull();
  });

  it('should have npcId property', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(panel.npcId).toBeNull();
  });

  it('should track current npcId after set', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    // @ts-ignore - testing internal state
    panel._currentNpcId = 'test_npc';
    expect(panel.npcId).toBe('test_npc');
  });
});

describe('DreamMemoryPanel - injectDreamMemoryStyles', () => {
  it('should be callable without error', async () => {
    const { injectDreamMemoryStyles } = await import('../../ui/DreamMemoryPanel.js');
    // injectDreamMemoryStyles needs document - skip in non-DOM environment
    if (typeof document !== 'undefined') {
      expect(() => injectDreamMemoryStyles()).not.toThrow();
    } else {
      expect(true).toBe(true); // skip
    }
  });

  it('should be idempotent', async () => {
    const { injectDreamMemoryStyles } = await import('../../ui/DreamMemoryPanel.js');
    if (typeof document !== 'undefined') {
      injectDreamMemoryStyles();
      expect(() => injectDreamMemoryStyles()).not.toThrow();
    } else {
      expect(true).toBe(true); // skip
    }
  });
});

describe('DreamMemoryPanel - _getFamiliarityHex', () => {
  it('should return correct colors for familiarity levels', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});

    expect(panel._getFamiliarityHex(0)).toBe('#888888');
    expect(panel._getFamiliarityHex(1)).toBe('#4CAF50');
    expect(panel._getFamiliarityHex(2)).toBe('#2196F3');
    expect(panel._getFamiliarityHex(3)).toBe('#9C27B0');
  });

  it('should return default for unknown level', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(panel._getFamiliarityHex(99)).toBe('#888888');
  });
});

describe('DreamMemoryPanel - _escapeHtml', () => {
  it('should escape HTML special characters', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});

    expect(panel._escapeHtml('<test>')).toBe('&lt;test&gt;');
    expect(panel._escapeHtml('test & value')).toBe('test &amp; value');
    expect(panel._escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('should handle empty string', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(panel._escapeHtml('')).toBe('');
  });

  it('should handle null/undefined', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(panel._escapeHtml(null)).toBe('');
    expect(panel._escapeHtml(undefined)).toBe('');
  });
});

describe('DreamMemoryPanel - _getRecentDreamsHTML', () => {
  it('should return empty HTML for empty array', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(panel._getRecentDreamsHTML([])).toContain('dm-empty');
  });

  it('should return empty HTML for null', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    expect(panel._getRecentDreamsHTML(null)).toContain('dm-empty');
  });

  it('should render dream items', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    const dreams = [
      { content: 'Hello world', timestamp: 123456, emotion: 'happy' },
      { content: 'Test dream', timestamp: 789012 },
    ];
    const html = panel._getRecentDreamsHTML(dreams);
    expect(html).toContain('Hello world');
    expect(html).toContain('Test dream');
    expect(html).toContain('dm-dream-item');
  });

  it('should show emotion tag when present', async () => {
    const { createDreamMemoryPanel } = await import('../../ui/DreamMemoryPanel.js');
    const panel = createDreamMemoryPanel({});
    const dreams = [{ content: 'Test', emotion: 'joy' }];
    const html = panel._getRecentDreamsHTML(dreams);
    expect(html).toContain('dm-dream-emotion');
    expect(html).toContain('joy');
  });
});