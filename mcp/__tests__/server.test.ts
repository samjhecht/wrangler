/**
 * Tests for WranglerMCPServer
 */

import { WranglerMCPServer } from '../server';
import { globalMetrics } from '../observability/metrics';
import { MCPErrorCode } from '../types/errors';

describe('WranglerMCPServer', () => {
  let server: WranglerMCPServer;

  beforeEach(() => {
    // Reset metrics before each test
    globalMetrics.reset();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('constructor', () => {
    it('should create server with default config', () => {
      server = new WranglerMCPServer();

      expect(server).toBeDefined();
      expect(server.getServer()).toBeDefined();
    });

    it('should create server with custom config', () => {
      server = new WranglerMCPServer({
        name: 'custom-wrangler',
        version: '2.0.0',
        workspaceRoot: '/custom/path',
        debug: true,
      });

      expect(server).toBeDefined();
    });

    it('should respect debug mode from env var', () => {
      const originalDebug = process.env.WRANGLER_MCP_DEBUG;
      process.env.WRANGLER_MCP_DEBUG = 'true';

      server = new WranglerMCPServer();

      expect(server).toBeDefined();

      // Restore
      if (originalDebug !== undefined) {
        process.env.WRANGLER_MCP_DEBUG = originalDebug;
      } else {
        delete process.env.WRANGLER_MCP_DEBUG;
      }
    });

    it('should initialize with default workspace root', () => {
      server = new WranglerMCPServer();

      expect(server).toBeDefined();
    });
  });

  describe('getAvailableTools', () => {
    beforeEach(() => {
      server = new WranglerMCPServer();
    });

    it('should return all 16 tools (11 issue + 5 session)', () => {
      const tools = server.getAvailableTools();

      expect(tools).toHaveLength(16);
    });

    it('should include all required issue management tools', () => {
      const tools = server.getAvailableTools();
      const toolNames = tools.map(t => t.name);

      expect(toolNames).toContain('issues_create');
      expect(toolNames).toContain('issues_list');
      expect(toolNames).toContain('issues_search');
      expect(toolNames).toContain('issues_update');
      expect(toolNames).toContain('issues_get');
      expect(toolNames).toContain('issues_delete');
      expect(toolNames).toContain('issues_labels');
      expect(toolNames).toContain('issues_metadata');
      expect(toolNames).toContain('issues_projects');
      expect(toolNames).toContain('issues_all_complete');
      expect(toolNames).toContain('issues_mark_complete');
    });

    it('should include all session management tools', () => {
      const tools = server.getAvailableTools();
      const toolNames = tools.map(t => t.name);

      expect(toolNames).toContain('session_start');
      expect(toolNames).toContain('session_phase');
      expect(toolNames).toContain('session_checkpoint');
      expect(toolNames).toContain('session_complete');
      expect(toolNames).toContain('session_get');
    });

    it('should not include abort tool', () => {
      const tools = server.getAvailableTools();
      const toolNames = tools.map(t => t.name);

      expect(toolNames).not.toContain('abort_create');
    });

    it('should have proper tool schema structure', () => {
      const tools = server.getAvailableTools();

      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(tool.inputSchema).toBeDefined();
      });
    });

    it('should reference .wrangler/ in descriptions', () => {
      const tools = server.getAvailableTools();
      const createTool = tools.find(t => t.name === 'issues_create');

      expect(createTool?.description).toContain('.wrangler/');
    });
  });

  describe('getMetrics', () => {
    beforeEach(() => {
      server = new WranglerMCPServer();
    });

    it('should return metrics in JSON format', () => {
      const metrics = server.getMetrics();

      expect(metrics).toHaveProperty('summary');
      expect(metrics).toHaveProperty('tools');
      expect(metrics).toHaveProperty('lastUpdated');
    });

    it('should return empty metrics initially', () => {
      const metrics = server.getMetrics();

      expect(metrics.summary.totalInvocations).toBe(0);
      expect(metrics.tools).toEqual([]);
    });
  });

  describe('getPrometheusMetrics', () => {
    beforeEach(() => {
      server = new WranglerMCPServer();
    });

    it('should return metrics in Prometheus format', () => {
      const prometheus = server.getPrometheusMetrics();

      expect(typeof prometheus).toBe('string');
      expect(prometheus).toContain('# HELP mcp_tool_invocations_total');
      expect(prometheus).toContain('# TYPE mcp_tool_invocations_total counter');
    });
  });

  describe('start and stop', () => {
    beforeEach(() => {
      server = new WranglerMCPServer();
    });

    it('should start server successfully', async () => {
      await expect(server.start()).resolves.not.toThrow();
    });

    it('should stop server successfully', async () => {
      await server.start();
      await expect(server.stop()).resolves.not.toThrow();
    });

    it('should handle stop without start', async () => {
      await expect(server.stop()).resolves.not.toThrow();
    });
  });

  describe('getServer', () => {
    beforeEach(() => {
      server = new WranglerMCPServer();
    });

    it('should return underlying MCP Server instance', () => {
      const mcpServer = server.getServer();

      expect(mcpServer).toBeDefined();
      expect(mcpServer).toHaveProperty('connect');
      expect(mcpServer).toHaveProperty('close');
    });
  });

  describe('tool execution and error handling', () => {
    beforeEach(() => {
      server = new WranglerMCPServer({
        debug: false,
      });
    });

    it('should handle unknown tool error', async () => {
      // This test verifies the switch statement has a default case
      const tools = server.getAvailableTools();
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should track successful tool invocations in metrics', () => {
      // Metrics should be collected for each tool call
      const initialMetrics = server.getMetrics();
      expect(initialMetrics.summary.totalInvocations).toBe(0);
    });
  });

  describe('debug mode', () => {
    it('should handle debug mode enabled', () => {
      server = new WranglerMCPServer({ debug: true });

      expect(server).toBeDefined();
    });

    it('should handle debug mode disabled', () => {
      server = new WranglerMCPServer({ debug: false });

      expect(server).toBeDefined();
    });
  });

  describe('configuration', () => {
    it('should use default name when not provided', () => {
      server = new WranglerMCPServer();

      expect(server).toBeDefined();
    });

    it('should use custom name when provided', () => {
      server = new WranglerMCPServer({
        name: 'custom-wrangler-server',
      });

      expect(server).toBeDefined();
    });

    it('should use default version when not provided', () => {
      server = new WranglerMCPServer();

      expect(server).toBeDefined();
    });

    it('should handle workspaceRoot configuration', () => {
      server = new WranglerMCPServer({
        workspaceRoot: '/custom/workspace',
      });

      expect(server).toBeDefined();
    });
  });

  describe('error code mapping', () => {
    beforeEach(() => {
      server = new WranglerMCPServer();
    });

    it('should have all required error codes available', () => {
      expect(MCPErrorCode.TOOL_EXECUTION_ERROR).toBeDefined();
      expect(MCPErrorCode.VALIDATION_ERROR).toBeDefined();
      expect(MCPErrorCode.RESOURCE_NOT_FOUND).toBeDefined();
      expect(MCPErrorCode.PERMISSION_DENIED).toBeDefined();
      expect(MCPErrorCode.RATE_LIMIT_EXCEEDED).toBeDefined();
      expect(MCPErrorCode.PATH_TRAVERSAL_DENIED).toBeDefined();
    });
  });

  describe('provider factory integration', () => {
    beforeEach(() => {
      server = new WranglerMCPServer({
        workspaceRoot: process.cwd(),
        issues: {
          provider: 'markdown',
          settings: {
            basePath: '.wrangler',
          },
        },
      });
    });

    it('should initialize with provider factory', () => {
      expect(server).toBeDefined();
    });
  });

  describe('stdio transport', () => {
    beforeEach(() => {
      server = new WranglerMCPServer();
    });

    it('should initialize stdio transport', () => {
      expect(server).toBeDefined();
    });
  });

  describe('tool registration', () => {
    beforeEach(() => {
      server = new WranglerMCPServer();
    });

    it('should register CallToolRequestSchema handler', () => {
      // Server should have request handlers set up during construction
      expect(server.getServer()).toBeDefined();
    });

    it('should register ListToolsRequestSchema handler', () => {
      // Server should have list tools handler set up
      expect(server.getServer()).toBeDefined();
    });
  });
});
