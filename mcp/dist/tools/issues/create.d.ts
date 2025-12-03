/**
 * Create issue tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
import { IssueArtifactType } from '../../types/issues.js';
export declare const createIssueSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodOptional<z.ZodEnum<["issue", "specification", "idea"]>>;
    status: z.ZodOptional<z.ZodEnum<["open", "in_progress", "closed", "cancelled"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignee: z.ZodOptional<z.ZodString>;
    project: z.ZodOptional<z.ZodString>;
    wranglerContext: z.ZodOptional<z.ZodObject<{
        agentId: z.ZodOptional<z.ZodString>;
        parentTaskId: z.ZodOptional<z.ZodString>;
        estimatedEffort: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        agentId?: string | undefined;
        parentTaskId?: string | undefined;
        estimatedEffort?: string | undefined;
    }, {
        agentId?: string | undefined;
        parentTaskId?: string | undefined;
        estimatedEffort?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    labels?: string[] | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    status?: "open" | "in_progress" | "closed" | "cancelled" | undefined;
    type?: "issue" | "specification" | "idea" | undefined;
    assignee?: string | undefined;
    project?: string | undefined;
    wranglerContext?: {
        agentId?: string | undefined;
        parentTaskId?: string | undefined;
        estimatedEffort?: string | undefined;
    } | undefined;
}, {
    title: string;
    description: string;
    labels?: string[] | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    status?: "open" | "in_progress" | "closed" | "cancelled" | undefined;
    type?: "issue" | "specification" | "idea" | undefined;
    assignee?: string | undefined;
    project?: string | undefined;
    wranglerContext?: {
        agentId?: string | undefined;
        parentTaskId?: string | undefined;
        estimatedEffort?: string | undefined;
    } | undefined;
}>;
export type CreateIssueParams = z.infer<typeof createIssueSchema>;
export declare function createIssueTool(params: CreateIssueParams, providerFactory: ProviderFactory): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        issueId: string;
        type: IssueArtifactType;
        provider: "markdown" | "mock";
        createdAt: string;
    };
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata?: undefined;
}>;
//# sourceMappingURL=create.d.ts.map