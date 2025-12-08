/**
 * session_get tool implementation
 *
 * Retrieves session state for recovery or status check.
 */

import { z } from 'zod';
import { SessionGetParamsSchema } from '../../types/session.js';
import { SessionStorageProvider } from '../../providers/session-storage.js';
import { createSuccessResponse, createErrorResponse, MCPErrorCode } from '../../types/errors.js';

export const sessionGetSchema = SessionGetParamsSchema;

export type SessionGetParams = z.infer<typeof sessionGetSchema>;

export async function sessionGetTool(
  params: SessionGetParams,
  storageProvider: SessionStorageProvider
) {
  try {
    let session;

    if (params.sessionId) {
      // Get specific session
      session = await storageProvider.getSession(params.sessionId);

      if (!session) {
        return createErrorResponse(
          MCPErrorCode.RESOURCE_NOT_FOUND,
          `Session not found: ${params.sessionId}`,
          { details: { sessionId: params.sessionId } }
        );
      }
    } else {
      // Find most recent incomplete session
      session = await storageProvider.findIncompleteSession();

      if (!session) {
        return createSuccessResponse(
          'No incomplete sessions found',
          {
            session: null,
            checkpoint: null,
            recentEvents: [],
            canResume: false,
          }
        );
      }
    }

    // Get checkpoint if available
    const checkpoint = await storageProvider.getCheckpoint(session.id);

    // Get recent audit events
    const recentEvents = await storageProvider.getAuditEntries(session.id, 20);

    // Determine if session can be resumed
    const canResume = session.status === 'running' || session.status === 'paused';

    // Build response text
    let text = `Session: ${session.id}`;
    text += `\nStatus: ${session.status}`;
    text += `\nCurrent Phase: ${session.currentPhase}`;
    text += `\nSpec: ${session.specFile}`;
    text += `\nTasks: ${session.tasksCompleted.length} completed, ${session.tasksPending.length} pending`;

    if (canResume && checkpoint) {
      text += `\n\nResume Instructions:`;
      text += `\n${checkpoint.resumeInstructions}`;
      text += `\n\nLast Action: ${checkpoint.lastAction}`;
    }

    return createSuccessResponse(text, {
      session,
      checkpoint,
      recentEvents,
      canResume,
      resumeInstructions: checkpoint?.resumeInstructions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(
      MCPErrorCode.TOOL_EXECUTION_ERROR,
      `Failed to get session: ${message}`,
      { details: { sessionId: params.sessionId } }
    );
  }
}
