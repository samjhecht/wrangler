/**
 * session_checkpoint tool implementation
 *
 * Saves resumable state for session recovery.
 */

import * as crypto from 'crypto';
import { z } from 'zod';
import { SessionCheckpointParamsSchema, SessionCheckpoint } from '../../types/session.js';
import { SessionStorageProvider } from '../../providers/session-storage.js';
import { createSuccessResponse, createErrorResponse, MCPErrorCode } from '../../types/errors.js';

export const sessionCheckpointSchema = SessionCheckpointParamsSchema;

export type SessionCheckpointParams = z.infer<typeof sessionCheckpointSchema>;

/**
 * Generate a checkpoint ID (simplified ULID-like format)
 */
function generateCheckpointId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${random}`;
}

export async function sessionCheckpointTool(
  params: SessionCheckpointParams,
  storageProvider: SessionStorageProvider
) {
  try {
    // Verify session exists
    const session = await storageProvider.getSession(params.sessionId);

    if (!session) {
      return createErrorResponse(
        MCPErrorCode.RESOURCE_NOT_FOUND,
        `Session not found: ${params.sessionId}`,
        { details: { sessionId: params.sessionId } }
      );
    }

    const now = new Date().toISOString();
    const checkpointId = generateCheckpointId();

    // Create checkpoint
    const checkpoint: SessionCheckpoint = {
      sessionId: params.sessionId,
      checkpointId,
      createdAt: now,
      currentPhase: session.currentPhase,
      tasksCompleted: params.tasksCompleted,
      tasksPending: params.tasksPending,
      variables: params.variables || {},
      lastAction: params.lastAction,
      resumeInstructions: params.resumeInstructions,
    };

    // Update session with task tracking
    session.tasksCompleted = params.tasksCompleted;
    session.tasksPending = params.tasksPending;
    session.updatedAt = now;

    // Save checkpoint and update session
    await storageProvider.saveCheckpoint(checkpoint);
    await storageProvider.updateSession(session);

    return createSuccessResponse(
      `Checkpoint saved: ${checkpointId}`,
      {
        checkpointId,
        savedAt: now,
        canResume: true,
        tasksCompleted: params.tasksCompleted.length,
        tasksPending: params.tasksPending.length,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(
      MCPErrorCode.TOOL_EXECUTION_ERROR,
      `Failed to save checkpoint: ${message}`,
      { details: { sessionId: params.sessionId } }
    );
  }
}
