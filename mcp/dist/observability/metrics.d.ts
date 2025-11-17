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
export declare class MetricsCollector {
    private invocations;
    private metricsCache;
    private maxInvocations;
    constructor(options?: {
        maxInvocations?: number;
    });
    /**
     * Start tracking a tool invocation
     */
    startInvocation(toolName: string, serverId?: string): string;
    /**
     * Complete a tool invocation
     */
    completeInvocation(invocationId: string, success: boolean, errorCode?: string, errorMessage?: string): void;
    /**
     * Update aggregated metrics for a tool
     */
    private updateMetrics;
    /**
     * Get metrics for a specific tool
     */
    getToolMetrics(toolName: string, serverId?: string): ToolMetrics | undefined;
    /**
     * Get all metrics
     */
    getAllMetrics(): ToolMetrics[];
    /**
     * Get metrics summary
     */
    getMetricsSummary(): {
        totalInvocations: number;
        totalSuccesses: number;
        totalErrors: number;
        averageLatencyMs: number;
        toolCount: number;
    };
    /**
     * Reset all metrics
     */
    reset(): void;
    /**
     * Export metrics in Prometheus format
     */
    exportPrometheus(): string;
    /**
     * Export metrics in JSON format
     */
    exportJSON(): any;
}
export declare const globalMetrics: MetricsCollector;
//# sourceMappingURL=metrics.d.ts.map