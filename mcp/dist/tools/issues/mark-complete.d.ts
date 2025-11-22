/**
 * Mark complete tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
export declare const markCompleteSchema: z.ZodObject<{
    id: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    note?: string | undefined;
}, {
    id: string;
    note?: string | undefined;
}>;
export type MarkCompleteParams = z.infer<typeof markCompleteSchema>;
export declare function markCompleteIssueTool(params: MarkCompleteParams, providerFactory: ProviderFactory): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        issueId: string;
        status: import("../../types/issues.js").IssueStatus;
        closedAt: string | Date;
    };
}>;
//# sourceMappingURL=mark-complete.d.ts.map