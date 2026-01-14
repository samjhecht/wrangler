/**
 * session_complete tool implementation
 *
 * Finalizes a session after workflow completion.
 */
import { z } from 'zod';
import { SessionStorageProvider } from '../../providers/session-storage.js';
export declare const sessionCompleteSchema: z.ZodObject<{
    sessionId: z.ZodString;
    status: z.ZodEnum<["completed", "failed"]>;
    prUrl: z.ZodOptional<z.ZodString>;
    prNumber: z.ZodOptional<z.ZodNumber>;
    summary: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "failed";
    sessionId: string;
    prUrl?: string | undefined;
    prNumber?: number | undefined;
    summary?: string | undefined;
}, {
    status: "completed" | "failed";
    sessionId: string;
    prUrl?: string | undefined;
    prNumber?: number | undefined;
    summary?: string | undefined;
}>;
export type SessionCompleteParams = z.infer<typeof sessionCompleteSchema>;
export declare function sessionCompleteTool(params: SessionCompleteParams, storageProvider: SessionStorageProvider): Promise<import("../../types/errors.js").MCPErrorResponse | import("../../types/errors.js").MCPSuccessResponse<{
    sessionId: string;
    status: "completed" | "failed";
    durationMs: number;
    tasksCompleted: number;
    prUrl: string | undefined;
    prNumber: number | undefined;
}>>;
//# sourceMappingURL=complete.d.ts.map