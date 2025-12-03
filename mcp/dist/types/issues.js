/**
 * Issue management types
 */
import { z } from 'zod';
// Zod Schemas
export const IssueArtifactTypeSchema = z.enum(['issue', 'specification', 'idea']);
export const IssueStatusSchema = z.enum(['open', 'in_progress', 'closed', 'cancelled']);
export const IssuePrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const WranglerIssueContextSchema = z.object({
    agentId: z.string().optional(),
    parentTaskId: z.string().optional(),
    estimatedEffort: z.string().optional(),
});
export const IssueCreateRequestSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    type: IssueArtifactTypeSchema.optional(),
    status: IssueStatusSchema.optional(),
    priority: IssuePrioritySchema.optional(),
    labels: z.array(z.string()).optional(),
    assignee: z.string().optional(),
    project: z.string().optional(),
    wranglerContext: WranglerIssueContextSchema.optional(),
});
export const IssueUpdateRequestSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    type: IssueArtifactTypeSchema.optional(),
    status: IssueStatusSchema.optional(),
    priority: IssuePrioritySchema.optional(),
    labels: z.array(z.string()).optional(),
    assignee: z.string().optional(),
    project: z.string().nullable().optional(),
    wranglerContext: WranglerIssueContextSchema.optional(),
});
export const IssueFiltersSchema = z.object({
    ids: z.array(z.string()).optional(),
    status: z.array(IssueStatusSchema).optional(),
    priority: z.array(IssuePrioritySchema).optional(),
    labels: z.array(z.string()).optional(),
    assignee: z.string().optional(),
    project: z.string().optional(),
    parentTaskId: z.string().optional(),
    types: z.array(IssueArtifactTypeSchema).optional(),
    type: IssueArtifactTypeSchema.optional(),
    createdAfter: z.date().optional(),
    createdBefore: z.date().optional(),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
});
export const IssueSearchOptionsSchema = z.object({
    query: z.string().min(1),
    fields: z.array(z.enum(['title', 'description', 'labels'])).optional(),
    filters: IssueFiltersSchema.optional(),
    sortBy: z.enum(['created', 'updated', 'priority', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});
//# sourceMappingURL=issues.js.map