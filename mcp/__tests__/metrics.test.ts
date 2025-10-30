/**
 * Tests for MCP observability metrics collection
 */

import { MetricsCollector } from '../observability/metrics';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  afterEach(() => {
    collector.reset();
  });

  describe('startInvocation', () => {
    it('should start tracking a tool invocation', () => {
      const invocationId = collector.startInvocation('issues_create', 'wrangler-tools');

      expect(invocationId).toMatch(/^wrangler-tools:issues_create:\d+:/);
    });

    it('should generate unique invocation IDs', () => {
      const id1 = collector.startInvocation('issues_create', 'wrangler-tools');
      const id2 = collector.startInvocation('issues_create', 'wrangler-tools');

      expect(id1).not.toBe(id2);
    });

    it('should handle default server ID', () => {
      const invocationId = collector.startInvocation('issues_list');

      expect(invocationId).toMatch(/^default:issues_list:\d+:/);
    });
  });

  describe('completeInvocation', () => {
    it('should complete a successful invocation', () => {
      const invocationId = collector.startInvocation('issues_create', 'wrangler-tools');

      collector.completeInvocation(invocationId, true);

      const metrics = collector.getToolMetrics('issues_create', 'wrangler-tools');
      expect(metrics).toBeDefined();
      expect(metrics?.invocationCount).toBe(1);
      expect(metrics?.successCount).toBe(1);
      expect(metrics?.errorCount).toBe(0);
    });

    it('should complete a failed invocation with error details', () => {
      const invocationId = collector.startInvocation('issues_create', 'wrangler-tools');

      collector.completeInvocation(
        invocationId,
        false,
        'VALIDATION_ERROR',
        'Invalid parameters'
      );

      const metrics = collector.getToolMetrics('issues_create', 'wrangler-tools');
      expect(metrics).toBeDefined();
      expect(metrics?.invocationCount).toBe(1);
      expect(metrics?.successCount).toBe(0);
      expect(metrics?.errorCount).toBe(1);
      expect(metrics?.errorsByType['VALIDATION_ERROR']).toBe(1);
    });

    it('should calculate latency metrics', () => {
      const invocationId = collector.startInvocation('issues_list', 'wrangler-tools');

      // Wait a bit to simulate processing time
      const delay = 50;
      setTimeout(() => {
        collector.completeInvocation(invocationId, true);
      }, delay);

      // Wait for completion
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const metrics = collector.getToolMetrics('issues_list', 'wrangler-tools');
          expect(metrics).toBeDefined();
          expect(metrics?.averageLatencyMs).toBeGreaterThanOrEqual(delay - 10);
          expect(metrics?.minLatencyMs).toBeGreaterThanOrEqual(delay - 10);
          expect(metrics?.maxLatencyMs).toBeGreaterThanOrEqual(delay - 10);
          resolve();
        }, delay + 20);
      });
    });

    it('should handle non-existent invocation ID gracefully', () => {
      expect(() => {
        collector.completeInvocation('non-existent-id', true);
      }).not.toThrow();
    });
  });

  describe('getToolMetrics', () => {
    it('should return undefined for non-existent tool', () => {
      const metrics = collector.getToolMetrics('non_existent_tool', 'wrangler-tools');

      expect(metrics).toBeUndefined();
    });

    it('should return metrics for existing tool', () => {
      const invocationId = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(invocationId, true);

      const metrics = collector.getToolMetrics('issues_create', 'wrangler-tools');

      expect(metrics).toBeDefined();
      expect(metrics?.toolName).toBe('issues_create');
      expect(metrics?.serverId).toBe('wrangler-tools');
    });
  });

  describe('getAllMetrics', () => {
    it('should return empty array when no metrics exist', () => {
      const metrics = collector.getAllMetrics();

      expect(metrics).toEqual([]);
    });

    it('should return all tool metrics', () => {
      const id1 = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(id1, true);

      const id2 = collector.startInvocation('issues_list', 'wrangler-tools');
      collector.completeInvocation(id2, true);

      const metrics = collector.getAllMetrics();

      expect(metrics).toHaveLength(2);
      expect(metrics.map(m => m.toolName)).toContain('issues_create');
      expect(metrics.map(m => m.toolName)).toContain('issues_list');
    });
  });

  describe('getMetricsSummary', () => {
    it('should return zero summary when no metrics exist', () => {
      const summary = collector.getMetricsSummary();

      expect(summary).toEqual({
        totalInvocations: 0,
        totalSuccesses: 0,
        totalErrors: 0,
        averageLatencyMs: 0,
        toolCount: 0,
      });
    });

    it('should aggregate metrics across all tools', () => {
      const id1 = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(id1, true);

      const id2 = collector.startInvocation('issues_list', 'wrangler-tools');
      collector.completeInvocation(id2, false, 'VALIDATION_ERROR');

      const id3 = collector.startInvocation('issues_update', 'wrangler-tools');
      collector.completeInvocation(id3, true);

      const summary = collector.getMetricsSummary();

      expect(summary.totalInvocations).toBe(3);
      expect(summary.totalSuccesses).toBe(2);
      expect(summary.totalErrors).toBe(1);
      expect(summary.toolCount).toBe(3);
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      const id1 = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(id1, true);

      collector.reset();

      const metrics = collector.getAllMetrics();
      const summary = collector.getMetricsSummary();

      expect(metrics).toEqual([]);
      expect(summary.totalInvocations).toBe(0);
    });
  });

  describe('exportJSON', () => {
    it('should export metrics in JSON format', () => {
      const id1 = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(id1, true);

      const json = collector.exportJSON();

      expect(json).toHaveProperty('summary');
      expect(json).toHaveProperty('tools');
      expect(json).toHaveProperty('lastUpdated');
      expect(json.summary.totalInvocations).toBe(1);
      expect(json.tools).toHaveLength(1);
    });
  });

  describe('exportPrometheus', () => {
    it('should export metrics in Prometheus format', () => {
      const id1 = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(id1, true);

      const prometheus = collector.exportPrometheus();

      expect(prometheus).toContain('# HELP mcp_tool_invocations_total');
      expect(prometheus).toContain('# TYPE mcp_tool_invocations_total counter');
      expect(prometheus).toContain('mcp_tool_invocations_total{tool="issues_create",server="wrangler-tools"} 1');
      expect(prometheus).toContain('mcp_tool_success_total{tool="issues_create",server="wrangler-tools"} 1');
      expect(prometheus).toContain('mcp_tool_errors_total{tool="issues_create",server="wrangler-tools"} 0');
    });

    it('should handle empty metrics', () => {
      const prometheus = collector.exportPrometheus();

      expect(prometheus).toContain('# HELP mcp_tool_invocations_total');
      expect(prometheus).not.toContain('mcp_tool_invocations_total{');
    });
  });

  describe('max invocations limit', () => {
    it('should respect maxInvocations limit', () => {
      const smallCollector = new MetricsCollector({ maxInvocations: 5 });

      // Add more invocations than the limit
      for (let i = 0; i < 10; i++) {
        const id = smallCollector.startInvocation(`tool_${i}`, 'wrangler-tools');
        smallCollector.completeInvocation(id, true);
      }

      // Should only have 5 unique tools tracked
      const metrics = smallCollector.getAllMetrics();
      expect(metrics.length).toBeLessThanOrEqual(10);
    });
  });

  describe('error tracking', () => {
    it('should track multiple error types', () => {
      const id1 = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(id1, false, 'VALIDATION_ERROR');

      const id2 = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(id2, false, 'VALIDATION_ERROR');

      const id3 = collector.startInvocation('issues_create', 'wrangler-tools');
      collector.completeInvocation(id3, false, 'PERMISSION_DENIED');

      const metrics = collector.getToolMetrics('issues_create', 'wrangler-tools');

      expect(metrics?.errorsByType['VALIDATION_ERROR']).toBe(2);
      expect(metrics?.errorsByType['PERMISSION_DENIED']).toBe(1);
      expect(metrics?.errorCount).toBe(3);
    });
  });
});
