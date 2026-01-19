/**
 * session_phase tool implementation
 *
 * Records phase transitions in the orchestration workflow.
 */
import { SessionPhaseParamsSchema } from '../../types/session.js';
import { createSuccessResponse, createErrorResponse, MCPErrorCode } from '../../types/errors.js';
export const sessionPhaseSchema = SessionPhaseParamsSchema;
export async function sessionPhaseTool(params, storageProvider) {
    try {
        const session = await storageProvider.getSession(params.sessionId);
        if (!session) {
            return createErrorResponse(MCPErrorCode.RESOURCE_NOT_FOUND, `Session not found: ${params.sessionId}`);
        }
        const now = new Date().toISOString();
        // Create audit entry based on phase type
        const auditEntry = {
            phase: params.phase,
            timestamp: now,
            status: params.status,
            ...params.metadata,
        };
        // Append audit entry
        await storageProvider.appendAuditEntry(params.sessionId, auditEntry);
        // Update session state
        const updates = {
            currentPhase: params.phase,
        };
        if (params.status === 'complete') {
            updates.phasesCompleted = [...session.phasesCompleted, params.phase];
        }
        await storageProvider.updateSession(params.sessionId, updates);
        return createSuccessResponse(`Phase ${params.phase} ${params.status}`, {
            sessionId: params.sessionId,
            phase: params.phase,
            status: params.status,
            timestamp: now,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return createErrorResponse(MCPErrorCode.TOOL_EXECUTION_ERROR, `Failed to record phase: ${message}`, { details: { sessionId: params.sessionId, phase: params.phase } });
    }
}
//# sourceMappingURL=phase.js.map