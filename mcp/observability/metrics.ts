/**
 * MCP Tool Metrics Collection and Reporting
 */

export interface ToolInvocation {
  toolName: string;
  serverId: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface ToolMetrics {
  toolName: string;
  serverId: string;
  invocationCount: number;
  successCount: number;
  errorCount: number;
  totalDurationMs: number;
  averageLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  lastInvokedAt: Date;
  errorsByType: Record<string, number>;
}

export class MetricsCollector {
  private invocations: ToolInvocation[] = [];
  private metricsCache: Map<string, ToolMetrics> = new Map();
  private maxInvocations: number = 10000; // Keep last 10k invocations

  constructor(options: { maxInvocations?: number } = {}) {
    if (options.maxInvocations) {
      this.maxInvocations = options.maxInvocations;
    }
  }

  /**
   * Start tracking a tool invocation
   */
  startInvocation(toolName: string, serverId: string = 'default'): string {
    const invocationId = `${serverId}:${toolName}:${Date.now()}:${Math.random()}`;
    const invocation: ToolInvocation = {
      toolName,
      serverId,
      startTime: Date.now(),
      success: false,
    };

    this.invocations.push(invocation);

    // Trim old invocations if needed
    if (this.invocations.length > this.maxInvocations) {
      this.invocations.shift();
    }

    // Store temporarily for completion
    (invocation as any)._id = invocationId;

    return invocationId;
  }

  /**
   * Complete a tool invocation
   */
  completeInvocation(
    invocationId: string,
    success: boolean,
    errorCode?: string,
    errorMessage?: string
  ): void {
    const invocation = this.invocations.find((i) => (i as any)._id === invocationId);

    if (!invocation) {
      return;
    }

    invocation.endTime = Date.now();
    invocation.durationMs = invocation.endTime - invocation.startTime;
    invocation.success = success;
    invocation.errorCode = errorCode;
    invocation.errorMessage = errorMessage;

    // Update metrics cache
    this.updateMetrics(invocation);
  }

  /**
   * Update aggregated metrics for a tool
   */
  private updateMetrics(invocation: ToolInvocation): void {
    const key = `${invocation.serverId}:${invocation.toolName}`;
    let metrics = this.metricsCache.get(key);

    if (!metrics) {
      metrics = {
        toolName: invocation.toolName,
        serverId: invocation.serverId,
        invocationCount: 0,
        successCount: 0,
        errorCount: 0,
        totalDurationMs: 0,
        averageLatencyMs: 0,
        minLatencyMs: Infinity,
        maxLatencyMs: 0,
        lastInvokedAt: new Date(),
        errorsByType: {},
      };
      this.metricsCache.set(key, metrics);
    }

    metrics.invocationCount++;
    metrics.lastInvokedAt = new Date();

    if (invocation.success) {
      metrics.successCount++;
    } else {
      metrics.errorCount++;
      if (invocation.errorCode) {
        metrics.errorsByType[invocation.errorCode] =
          (metrics.errorsByType[invocation.errorCode] || 0) + 1;
      }
    }

    if (invocation.durationMs !== undefined) {
      metrics.totalDurationMs += invocation.durationMs;
      metrics.averageLatencyMs = metrics.totalDurationMs / metrics.invocationCount;
      metrics.minLatencyMs = Math.min(metrics.minLatencyMs, invocation.durationMs);
      metrics.maxLatencyMs = Math.max(metrics.maxLatencyMs, invocation.durationMs);
    }
  }

  /**
   * Get metrics for a specific tool
   */
  getToolMetrics(toolName: string, serverId: string = 'default'): ToolMetrics | undefined {
    return this.metricsCache.get(`${serverId}:${toolName}`);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): ToolMetrics[] {
    return Array.from(this.metricsCache.values());
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    totalInvocations: number;
    totalSuccesses: number;
    totalErrors: number;
    averageLatencyMs: number;
    toolCount: number;
  } {
    const allMetrics = this.getAllMetrics();

    const totalInvocations = allMetrics.reduce((sum, m) => sum + m.invocationCount, 0);
    const totalSuccesses = allMetrics.reduce((sum, m) => sum + m.successCount, 0);
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const totalDuration = allMetrics.reduce((sum, m) => sum + m.totalDurationMs, 0);

    return {
      totalInvocations,
      totalSuccesses,
      totalErrors,
      averageLatencyMs: totalInvocations > 0 ? totalDuration / totalInvocations : 0,
      toolCount: allMetrics.length,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.invocations = [];
    this.metricsCache.clear();
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    // Summary metrics
    lines.push('# HELP mcp_tool_invocations_total Total number of tool invocations');
    lines.push('# TYPE mcp_tool_invocations_total counter');

    for (const metrics of this.getAllMetrics()) {
      lines.push(
        `mcp_tool_invocations_total{tool="${metrics.toolName}",server="${metrics.serverId}"} ${metrics.invocationCount}`
      );
    }

    lines.push('');
    lines.push('# HELP mcp_tool_success_total Total number of successful tool invocations');
    lines.push('# TYPE mcp_tool_success_total counter');

    for (const metrics of this.getAllMetrics()) {
      lines.push(
        `mcp_tool_success_total{tool="${metrics.toolName}",server="${metrics.serverId}"} ${metrics.successCount}`
      );
    }

    lines.push('');
    lines.push('# HELP mcp_tool_errors_total Total number of failed tool invocations');
    lines.push('# TYPE mcp_tool_errors_total counter');

    for (const metrics of this.getAllMetrics()) {
      lines.push(
        `mcp_tool_errors_total{tool="${metrics.toolName}",server="${metrics.serverId}"} ${metrics.errorCount}`
      );
    }

    lines.push('');
    lines.push('# HELP mcp_tool_latency_ms Tool invocation latency in milliseconds');
    lines.push('# TYPE mcp_tool_latency_ms gauge');

    for (const metrics of this.getAllMetrics()) {
      lines.push(
        `mcp_tool_latency_ms{tool="${metrics.toolName}",server="${metrics.serverId}",quantile="avg"} ${metrics.averageLatencyMs.toFixed(2)}`
      );
      lines.push(
        `mcp_tool_latency_ms{tool="${metrics.toolName}",server="${metrics.serverId}",quantile="min"} ${metrics.minLatencyMs === Infinity ? 0 : metrics.minLatencyMs}`
      );
      lines.push(
        `mcp_tool_latency_ms{tool="${metrics.toolName}",server="${metrics.serverId}",quantile="max"} ${metrics.maxLatencyMs}`
      );
    }

    return lines.join('\n');
  }

  /**
   * Export metrics in JSON format
   */
  exportJSON(): any {
    return {
      summary: this.getMetricsSummary(),
      tools: this.getAllMetrics(),
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Global metrics collector instance
export const globalMetrics = new MetricsCollector();
