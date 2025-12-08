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
        // Load session
        const session = await storageProvider.getSession(params.sessionId);
        if (!session) {
            return createErrorResponse(MCPErrorCode.RESOURCE_NOT_FOUND, `Session not found: ${params.sessionId}`, { details: { sessionId: params.sessionId } });
        }
        // Update session state
        session.currentPhase = params.phase;
        // If phase is complete, add to phasesCompleted
        if (params.status === 'complete' && !session.phasesCompleted.includes(params.phase)) {
            session.phasesCompleted.push(params.phase);
        }
        // If phase failed, update session status
        if (params.status === 'failed') {
            session.status = 'paused';
        }
        const now = new Date().toISOString();
        session.updatedAt = now;
        // Create audit entry based on phase type
        let auditEntry;
        const baseEntry = {
            phase: params.phase, // Type will be validated by specific phase
            timestamp: now,
            status: params.status,
        };
        // Create phase-specific audit entries
        switch (params.phase) {
            case 'plan':
                auditEntry = {
                    ...baseEntry,
                    phase: 'plan',
                    issues_created: params.metadata?.issues_created || [],
                    total_tasks: params.metadata?.total_tasks || 0,
                };
                // Update session tasks if provided
                if (params.metadata?.issues_created) {
                    session.tasksPending = params.metadata.issues_created;
                }
                break;
            case 'execute':
                const executeEntry = {
                    ...baseEntry,
                    phase: 'execute',
                    // Execute phase uses checkpoint audit entries for task details
                    issues_created: [],
                    total_tasks: params.metadata?.tasks_completed || session.tasksCompleted.length,
                };
                auditEntry = executeEntry;
                break;
            case 'verify':
                auditEntry = {
                    ...baseEntry,
                    phase: 'verify',
                    tests_exit_code: params.metadata?.tests_exit_code ?? -1,
                    tests_total: params.metadata?.tests_total || 0,
                    tests_passed: params.metadata?.tests_passed || 0,
                    git_clean: params.metadata?.git_clean ?? false,
                };
                break;
            case 'publish':
                auditEntry = {
                    ...baseEntry,
                    phase: 'publish',
                    pr_url: params.metadata?.pr_url || '',
                    pr_number: params.metadata?.pr_number || 0,
                    branch_pushed: params.metadata?.branch_pushed ?? false,
                };
                // Update session with PR info
                if (params.metadata?.pr_url) {
                    session.prUrl = params.metadata.pr_url;
                }
                if (params.metadata?.pr_number) {
                    session.prNumber = params.metadata.pr_number;
                }
                break;
            case 'task':
                auditEntry = {
                    ...baseEntry,
                    phase: 'task',
                    task_id: params.metadata?.task_id || '',
                    tests_passed: params.metadata?.tests_passed ?? false,
                    commit: params.metadata?.commit || '',
                    tdd_certified: params.metadata?.tdd_certified ?? false,
                    code_review: params.metadata?.code_review || 'approved',
                    files_changed: params.metadata?.files_changed || [],
                };
                // Update task tracking
                if (params.status === 'complete' && params.metadata?.task_id) {
                    const taskId = params.metadata.task_id;
                    if (!session.tasksCompleted.includes(taskId)) {
                        session.tasksCompleted.push(taskId);
                    }
                    session.tasksPending = session.tasksPending.filter(id => id !== taskId);
                }
                break;
            case 'error':
                auditEntry = {
                    ...baseEntry,
                    phase: 'error',
                    error_message: params.metadata?.error_message || 'Unknown error',
                    error_code: params.metadata?.error_code,
                    recoverable: params.metadata?.recoverable ?? true,
                };
                break;
            default:
                // Generic entry for init, complete, or custom phases
                auditEntry = {
                    ...baseEntry,
                    phase: 'init', // Default fallback
                    session_id: session.id,
                    worktree: session.worktreePath,
                    branch: session.branchName,
                    spec_file: session.specFile,
                };
        }
        // Save updated session
        await storageProvider.updateSession(session);
        // Append audit entry
        await storageProvider.appendAuditEntry(params.sessionId, auditEntry);
        return createSuccessResponse(`Phase ${params.phase} ${params.status}`, {
            phase: params.phase,
            status: params.status,
            timestamp: now,
            eventLogged: true,
            phasesCompleted: session.phasesCompleted,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return createErrorResponse(MCPErrorCode.TOOL_EXECUTION_ERROR, `Failed to record phase: ${message}`, { details: { sessionId: params.sessionId, phase: params.phase } });
    }
}
//# sourceMappingURL=phase.js.map