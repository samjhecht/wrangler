/**
 * issues_all_complete tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
import { IssueFilters } from '../../types/issues.js';
export declare const issuesAllCompleteSchema: z.ZodObject<{
    issueIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    parentTaskId: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    project: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodArray<z.ZodEnum<["issue", "specification", "idea"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    labels?: string[] | undefined;
    parentTaskId?: string | undefined;
    project?: string | undefined;
    types?: ("issue" | "specification" | "idea")[] | undefined;
    issueIds?: string[] | undefined;
}, {
    labels?: string[] | undefined;
    parentTaskId?: string | undefined;
    project?: string | undefined;
    types?: ("issue" | "specification" | "idea")[] | undefined;
    issueIds?: string[] | undefined;
}>;
export type IssuesAllCompleteParams = z.infer<typeof issuesAllCompleteSchema>;
export declare function issuesAllCompleteTool(params: IssuesAllCompleteParams, providerFactory: ProviderFactory): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        scope: IssueFilters;
        totalIssues: number;
        completedIssues: number;
        pendingIssues: number;
        allComplete: boolean;
        noIssues: boolean;
        pendingIssueIds: string[];
        pendingIssueTitles: string[];
    };
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata?: undefined;
}>;
//# sourceMappingURL=all-complete.d.ts.map