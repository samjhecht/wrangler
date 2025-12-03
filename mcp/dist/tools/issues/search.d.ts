/**
 * Search issues tool implementation
 */
import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
export declare const searchIssuesSchema: z.ZodObject<{
    query: z.ZodString;
    fields: z.ZodOptional<z.ZodArray<z.ZodEnum<["title", "description", "labels"]>, "many">>;
    filters: z.ZodOptional<z.ZodObject<{
        ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodOptional<z.ZodArray<z.ZodEnum<["open", "in_progress", "closed", "cancelled"]>, "many">>;
        priority: z.ZodOptional<z.ZodArray<z.ZodEnum<["low", "medium", "high", "critical"]>, "many">>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        assignee: z.ZodOptional<z.ZodString>;
        project: z.ZodOptional<z.ZodString>;
        parentTaskId: z.ZodOptional<z.ZodString>;
        types: z.ZodOptional<z.ZodArray<z.ZodEnum<["issue", "specification", "idea"]>, "many">>;
        type: z.ZodOptional<z.ZodEnum<["issue", "specification", "idea"]>>;
        createdAfter: z.ZodOptional<z.ZodDate>;
        createdBefore: z.ZodOptional<z.ZodDate>;
        limit: z.ZodOptional<z.ZodNumber>;
        offset: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        labels?: string[] | undefined;
        priority?: ("low" | "medium" | "high" | "critical")[] | undefined;
        status?: ("open" | "in_progress" | "closed" | "cancelled")[] | undefined;
        parentTaskId?: string | undefined;
        type?: "issue" | "specification" | "idea" | undefined;
        assignee?: string | undefined;
        project?: string | undefined;
        ids?: string[] | undefined;
        types?: ("issue" | "specification" | "idea")[] | undefined;
        createdAfter?: Date | undefined;
        createdBefore?: Date | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }, {
        labels?: string[] | undefined;
        priority?: ("low" | "medium" | "high" | "critical")[] | undefined;
        status?: ("open" | "in_progress" | "closed" | "cancelled")[] | undefined;
        parentTaskId?: string | undefined;
        type?: "issue" | "specification" | "idea" | undefined;
        assignee?: string | undefined;
        project?: string | undefined;
        ids?: string[] | undefined;
        types?: ("issue" | "specification" | "idea")[] | undefined;
        createdAfter?: Date | undefined;
        createdBefore?: Date | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }>>;
    sortBy: z.ZodOptional<z.ZodEnum<["created", "updated", "priority", "status"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit?: number | undefined;
    fields?: ("title" | "description" | "labels")[] | undefined;
    filters?: {
        labels?: string[] | undefined;
        priority?: ("low" | "medium" | "high" | "critical")[] | undefined;
        status?: ("open" | "in_progress" | "closed" | "cancelled")[] | undefined;
        parentTaskId?: string | undefined;
        type?: "issue" | "specification" | "idea" | undefined;
        assignee?: string | undefined;
        project?: string | undefined;
        ids?: string[] | undefined;
        types?: ("issue" | "specification" | "idea")[] | undefined;
        createdAfter?: Date | undefined;
        createdBefore?: Date | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    } | undefined;
    sortBy?: "created" | "updated" | "priority" | "status" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    query: string;
    limit?: number | undefined;
    fields?: ("title" | "description" | "labels")[] | undefined;
    filters?: {
        labels?: string[] | undefined;
        priority?: ("low" | "medium" | "high" | "critical")[] | undefined;
        status?: ("open" | "in_progress" | "closed" | "cancelled")[] | undefined;
        parentTaskId?: string | undefined;
        type?: "issue" | "specification" | "idea" | undefined;
        assignee?: string | undefined;
        project?: string | undefined;
        ids?: string[] | undefined;
        types?: ("issue" | "specification" | "idea")[] | undefined;
        createdAfter?: Date | undefined;
        createdBefore?: Date | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    } | undefined;
    sortBy?: "created" | "updated" | "priority" | "status" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type SearchIssuesParams = z.infer<typeof searchIssuesSchema>;
export declare function searchIssuesTool(params: SearchIssuesParams, providerFactory: ProviderFactory): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        totalResults: number;
        displayedResults: number;
        query: string;
        provider: "markdown" | "mock";
        issues: {
            id: any;
            title: any;
            type: any;
            status: any;
            priority: any;
        }[];
    };
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata?: undefined;
}>;
//# sourceMappingURL=search.d.ts.map