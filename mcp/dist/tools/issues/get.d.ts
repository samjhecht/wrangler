/**
 * Get issue tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
export declare const getIssueSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type GetIssueParams = z.infer<typeof getIssueSchema>;
export declare function getIssueTool(params: GetIssueParams, providerFactory: ProviderFactory): Promise<{
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
        type: import("../../types/issues.js").IssueArtifactType;
        status: import("../../types/issues.js").IssueStatus;
        priority: import("../../types/issues.js").IssuePriority;
        provider: "markdown" | "mock";
        issue: {
            createdAt: string;
            updatedAt: string;
            closedAt: string | Date | undefined;
            id: string;
            title: string;
            description: string;
            type: import("../../types/issues.js").IssueArtifactType;
            status: import("../../types/issues.js").IssueStatus;
            priority: import("../../types/issues.js").IssuePriority;
            labels: string[];
            assignee?: string;
            project?: string;
            metadata?: Record<string, any>;
            wranglerContext?: import("../../types/issues.js").WranglerIssueContext;
        };
    };
}>;
//# sourceMappingURL=get.d.ts.map