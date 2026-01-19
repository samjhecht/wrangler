/**
 * session_phase tool implementation
 *
 * Records phase transitions in the orchestration workflow.
 */
import { z } from 'zod';
import { SessionStorageProvider } from '../../providers/session-storage.js';
export declare const sessionPhaseSchema: z.ZodObject<{
    sessionId: z.ZodString;
    phase: z.ZodString;
    status: z.ZodEnum<["started", "complete", "failed"]>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: "failed" | "complete" | "started";
    sessionId: string;
    phase: string;
    metadata?: Record<string, unknown> | undefined;
}, {
    status: "failed" | "complete" | "started";
    sessionId: string;
    phase: string;
    metadata?: Record<string, unknown> | undefined;
}>;
export type SessionPhaseParams = z.infer<typeof sessionPhaseSchema>;
export declare function sessionPhaseTool(params: SessionPhaseParams, storageProvider: SessionStorageProvider): Promise<import("../../types/errors.js").MCPErrorResponse | import("../../types/errors.js").MCPSuccessResponse<{
    sessionId: string;
    phase: string;
    status: "failed" | "complete" | "started";
    timestamp: string;
}>>;
//# sourceMappingURL=phase.d.ts.map