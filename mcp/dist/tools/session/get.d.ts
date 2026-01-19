/**
 * session_get tool implementation
 *
 * Retrieves session state for recovery or status check.
 */
import { z } from 'zod';
import { SessionStorageProvider } from '../../providers/session-storage.js';
export declare const sessionGetSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string | undefined;
}, {
    sessionId?: string | undefined;
}>;
export type SessionGetParams = z.infer<typeof sessionGetSchema>;
export declare function sessionGetTool(params: SessionGetParams, storageProvider: SessionStorageProvider): Promise<import("../../types/errors.js").MCPErrorResponse | import("../../types/errors.js").MCPSuccessResponse<{
    found: boolean;
}>>;
//# sourceMappingURL=get.d.ts.map