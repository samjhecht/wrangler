/**
 * Update issue tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
export declare const updateIssueSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
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
    id: string;
    title?: string | undefined;
    description?: string | undefined;
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
    id: string;
    title?: string | undefined;
    description?: string | undefined;
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
export type UpdateIssueParams = z.infer<typeof updateIssueSchema>;
export declare function updateIssueTool(params: UpdateIssueParams, providerFactory: ProviderFactory): Promise<{
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
        updatedAt: string;
        changes: string[];
    };
}>;
//# sourceMappingURL=update.d.ts.map