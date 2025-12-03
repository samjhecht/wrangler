/**
 * Issue management types
 */
import { z } from 'zod';
export type IssueArtifactType = 'issue' | 'specification' | 'idea';
export interface Issue {
    /** Unique issue identifier */
    id: string;
    /** Issue title */
    title: string;
    /** Issue description/content */
    description: string;
    /** Artifact type (issue, specification, etc.) */
    type: IssueArtifactType;
    /** Current status */
    status: IssueStatus;
    /** Priority level */
    priority: IssuePriority;
    /** Associated labels */
    labels: string[];
    /** Assigned user */
    assignee?: string;
    /** Project or epic association */
    project?: string;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    /** Completion timestamp */
    closedAt?: Date;
    /** Provider-specific metadata */
    metadata?: Record<string, any>;
    /** Wrangler-specific context */
    wranglerContext?: WranglerIssueContext;
}
export type IssueStatus = 'open' | 'in_progress' | 'closed' | 'cancelled';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export interface WranglerIssueContext {
    /** Responsible agent */
    agentId?: string;
    /** Parent task ID */
    parentTaskId?: string;
    /** Estimated effort */
    estimatedEffort?: string;
}
export interface IssueCreateRequest {
    /** Issue title */
    title: string;
    /** Issue description */
    description: string;
    /** Artifact type */
    type?: IssueArtifactType;
    /** Initial status */
    status?: IssueStatus;
    /** Priority level */
    priority?: IssuePriority;
    /** Labels to apply */
    labels?: string[];
    /** Assigned user */
    assignee?: string;
    /** Project association */
    project?: string;
    /** Wrangler context */
    wranglerContext?: WranglerIssueContext;
}
export interface IssueUpdateRequest {
    /** Issue ID to update */
    id: string;
    /** New title */
    title?: string;
    /** New description */
    description?: string;
    /** Updated artifact type */
    type?: IssueArtifactType;
    /** New status */
    status?: IssueStatus;
    /** New priority */
    priority?: IssuePriority;
    /** New labels */
    labels?: string[];
    /** New assignee */
    assignee?: string;
    /** New project */
    project?: string | null;
    /** Updated Wrangler context */
    wranglerContext?: WranglerIssueContext;
}
export interface IssueFilters {
    /** Filter by explicit issue IDs */
    ids?: string[];
    /** Filter by status */
    status?: IssueStatus[];
    /** Filter by priority */
    priority?: IssuePriority[];
    /** Filter by labels */
    labels?: string[];
    /** Filter by assignee */
    assignee?: string;
    /** Filter by project */
    project?: string;
    /** Filter by parent task identifier stored in wranglerContext.parentTaskId */
    parentTaskId?: string;
    /** Filter by artifact types */
    types?: IssueArtifactType[];
    /** Filter by artifact type (deprecated, use types) */
    type?: IssueArtifactType;
    /** Date range filter */
    createdAfter?: Date;
    /** Date range filter */
    createdBefore?: Date;
    /** Limit number of results */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
}
export interface IssueSearchOptions {
    /** Search query */
    query: string;
    /** Fields to search in */
    fields?: ('title' | 'description' | 'labels')[];
    /** Additional filters */
    filters?: IssueFilters;
    /** Sort field */
    sortBy?: 'created' | 'updated' | 'priority' | 'status';
    /** Sort direction */
    sortOrder?: 'asc' | 'desc';
}
export declare const IssueArtifactTypeSchema: z.ZodEnum<["issue", "specification", "idea"]>;
export declare const IssueStatusSchema: z.ZodEnum<["open", "in_progress", "closed", "cancelled"]>;
export declare const IssuePrioritySchema: z.ZodEnum<["low", "medium", "high", "critical"]>;
export declare const WranglerIssueContextSchema: z.ZodObject<{
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
}>;
export declare const IssueCreateRequestSchema: z.ZodObject<{
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
export declare const IssueUpdateRequestSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["issue", "specification", "idea"]>>;
    status: z.ZodOptional<z.ZodEnum<["open", "in_progress", "closed", "cancelled"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignee: z.ZodOptional<z.ZodString>;
    project: z.ZodOptional<z.ZodNullable<z.ZodString>>;
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
    project?: string | null | undefined;
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
    project?: string | null | undefined;
    wranglerContext?: {
        agentId?: string | undefined;
        parentTaskId?: string | undefined;
        estimatedEffort?: string | undefined;
    } | undefined;
}>;
export declare const IssueFiltersSchema: z.ZodObject<{
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
}>;
export declare const IssueSearchOptionsSchema: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    query: string;
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
//# sourceMappingURL=issues.d.ts.map