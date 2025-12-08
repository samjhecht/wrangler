/**
 * session_complete tool implementation
 *
 * Finalizes a session after workflow completion.
 */
import { SessionCompleteParamsSchema } from '../../types/session.js';
import { createSuccessResponse, createErrorResponse, MCPErrorCode } from '../../types/errors.js';
export const sessionCompleteSchema = SessionCompleteParamsSchema;
export async function sessionCompleteTool(params, storageProvider) {
    try {
        // Load session
        const session = await storageProvider.getSession(params.sessionId);
        if (!session) {
            return createErrorResponse(MCPErrorCode.RESOURCE_NOT_FOUND, `Session not found: ${params.sessionId}`, { details: { sessionId: params.sessionId } });
        }
        const now = new Date().toISOString();
        // Calculate duration
        const startTime = new Date(session.startedAt).getTime();
        const endTime = new Date(now).getTime();
        const durationMs = endTime - startTime;
        // Update session status
        session.status = params.status;
        session.currentPhase = 'complete';
        session.completedAt = now;
        session.updatedAt = now;
        if (params.prUrl) {
            session.prUrl = params.prUrl;
        }
        if (params.prNumber) {
            session.prNumber = params.prNumber;
        }
        // Add 'complete' to phases if not already there
        if (!session.phasesCompleted.includes('complete')) {
            session.phasesCompleted.push('complete');
        }
        // Create complete audit entry
        const auditEntry = {
            phase: 'complete',
            timestamp: now,
            status: 'complete',
            session_id: session.id,
            duration_ms: durationMs,
            tasks_completed: session.tasksCompleted.length,
            ...(params.prUrl && { pr_url: params.prUrl }),
        };
        // Save session and audit entry
        await storageProvider.updateSession(session);
        await storageProvider.appendAuditEntry(params.sessionId, auditEntry);
        // Format duration for human readability
        const durationSec = Math.round(durationMs / 1000);
        const durationMin = Math.round(durationSec / 60);
        const durationStr = durationMin > 0 ? `${durationMin}m ${durationSec % 60}s` : `${durationSec}s`;
        let summaryText = `Session ${params.sessionId} ${params.status}`;
        summaryText += `\nDuration: ${durationStr}`;
        summaryText += `\nTasks completed: ${session.tasksCompleted.length}`;
        if (params.prUrl) {
            summaryText += `\nPR: ${params.prUrl}`;
        }
        if (params.summary) {
            summaryText += `\n\n${params.summary}`;
        }
        return createSuccessResponse(summaryText, {
            sessionId: session.id,
            status: params.status,
            startedAt: session.startedAt,
            completedAt: now,
            durationMs,
            phasesCompleted: session.phasesCompleted,
            tasksCompleted: session.tasksCompleted.length,
            prUrl: params.prUrl,
            prNumber: params.prNumber,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return createErrorResponse(MCPErrorCode.TOOL_EXECUTION_ERROR, `Failed to complete session: ${message}`, { details: { sessionId: params.sessionId } });
    }
}
//# sourceMappingURL=complete.js.map