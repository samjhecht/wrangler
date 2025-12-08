/**
 * session_checkpoint tool implementation
 *
 * Saves resumable state for session recovery.
 */
import { z } from 'zod';
import { SessionStorageProvider } from '../../providers/session-storage.js';
export declare const sessionCheckpointSchema: z.ZodObject<{
    sessionId: z.ZodString;
    tasksCompleted: z.ZodArray<z.ZodString, "many">;
    tasksPending: z.ZodArray<z.ZodString, "many">;
    lastAction: z.ZodString;
    resumeInstructions: z.ZodString;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    tasksCompleted: string[];
    tasksPending: string[];
    sessionId: string;
    lastAction: string;
    resumeInstructions: string;
    variables?: Record<string, unknown> | undefined;
}, {
    tasksCompleted: string[];
    tasksPending: string[];
    sessionId: string;
    lastAction: string;
    resumeInstructions: string;
    variables?: Record<string, unknown> | undefined;
}>;
export type SessionCheckpointParams = z.infer<typeof sessionCheckpointSchema>;
export declare function sessionCheckpointTool(params: SessionCheckpointParams, storageProvider: SessionStorageProvider): Promise<import("../../types/errors.js").MCPErrorResponse | import("../../types/errors.js").MCPSuccessResponse<{
    checkpointId: string;
    savedAt: string;
    canResume: boolean;
    tasksCompleted: number;
    tasksPending: number;
}>>;
//# sourceMappingURL=checkpoint.d.ts.map