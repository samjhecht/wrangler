/**
 * issues_all_complete tool implementation
 */
import { z } from 'zod';
const issueArtifactTypeSchema = z.enum(['issue', 'specification']);
export const issuesAllCompleteSchema = z
    .object({
    issueIds: z
        .array(z.string().min(1))
        .min(1)
        .optional()
        .describe('Restrict check to specific issue IDs'),
    parentTaskId: z
        .string()
        .optional()
        .describe('Filter issues whose wranglerContext.parentTaskId matches'),
    labels: z.array(z.string()).optional().describe('Filter by labels (any match)'),
    project: z.string().optional().describe('Filter by project identifier'),
    types: z.array(issueArtifactTypeSchema).optional().describe('Restrict to artifact types'),
})
    .describe('Check if scoped Wrangler issues are complete.');
const COMPLETED_STATUSES = new Set(['closed', 'cancelled']);
export async function issuesAllCompleteTool(params, providerFactory) {
    try {
        const issueProvider = providerFactory.getIssueProvider();
        const filters = {
            ids: params.issueIds,
            parentTaskId: params.parentTaskId,
            labels: params.labels,
            project: params.project,
            types: params.types,
            type: params.types ? undefined : 'issue',
            limit: 1000,
            offset: 0,
        };
        const issues = await issueProvider.listIssues(filters);
        const summary = buildCompletionSummary(issues);
        return {
            content: [
                {
                    type: 'text',
                    text: summary.text,
                },
            ],
            isError: false,
            metadata: {
                ...summary.metadata,
                scope: filters,
            },
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [
                {
                    type: 'text',
                    text: `Failed to check issue completion status: ${message}`,
                },
            ],
            isError: true,
        };
    }
}
function buildCompletionSummary(issues) {
    const totalIssues = issues.length;
    const completedIssues = issues.filter(isCompleted);
    const pendingIssues = issues.filter((issue) => !isCompleted(issue));
    const allComplete = totalIssues > 0 && pendingIssues.length === 0;
    const noIssues = totalIssues === 0;
    let text;
    if (noIssues) {
        text = 'No issues found.';
    }
    else if (allComplete) {
        text = `All ${totalIssues} issues complete.`;
    }
    else {
        const pendingList = pendingIssues.length > 0
            ? ` Pending: ${pendingIssues.map((issue) => `${issue.id} (${issue.status})`).join(', ')}.`
            : '';
        text = `${completedIssues.length} of ${totalIssues} issues complete.${pendingList}`;
    }
    return {
        text,
        metadata: {
            totalIssues,
            completedIssues: completedIssues.length,
            pendingIssues: pendingIssues.length,
            allComplete,
            noIssues,
            pendingIssueIds: pendingIssues.map((issue) => issue.id),
            pendingIssueTitles: pendingIssues.map((issue) => issue.title),
        },
    };
}
function isCompleted(issue) {
    return COMPLETED_STATUSES.has(issue.status);
}
//# sourceMappingURL=all-complete.js.map