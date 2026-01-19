/**
 * session_start tool implementation
 *
 * Initializes a new orchestration session for spec implementation.
 */
import { z } from 'zod';
import { SessionStorageProvider } from '../../providers/session-storage.js';
export declare const sessionStartSchema: z.ZodObject<{
    specFile: z.ZodString;
    workingDirectory: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    specFile: string;
    workingDirectory?: string | undefined;
}, {
    specFile: string;
    workingDirectory?: string | undefined;
}>;
export type SessionStartParams = z.infer<typeof sessionStartSchema>;
export declare function sessionStartTool(params: SessionStartParams, storageProvider: SessionStorageProvider): Promise<import("../../types/errors.js").MCPErrorResponse | import("../../types/errors.js").MCPSuccessResponse<{
    sessionId: string;
    status: string;
    currentPhase: string;
    auditPath: string;
    worktreePath: string;
    branchName: string;
    worktreeCreated: boolean;
}>>;
//# sourceMappingURL=start.d.ts.map