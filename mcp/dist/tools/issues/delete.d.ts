/**
 * Delete issue tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
export declare const deleteIssueSchema: z.ZodObject<{
    id: z.ZodString;
    confirm: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    confirm: boolean;
}, {
    id: string;
    confirm: boolean;
}>;
export type DeleteIssueParams = z.infer<typeof deleteIssueSchema>;
export declare function deleteIssueTool(params: DeleteIssueParams, providerFactory: ProviderFactory): Promise<{
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
        provider: "markdown" | "mock";
        deletedAt: string;
    };
}>;
//# sourceMappingURL=delete.d.ts.map