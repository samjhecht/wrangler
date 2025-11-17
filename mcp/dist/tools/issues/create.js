/**
 * Create issue tool implementation
 */
import { z } from 'zod';
export const createIssueSchema = z.object({
    title: z.string().min(1).max(200).describe('Issue title'),
    description: z.string().min(1).describe('Issue description or content'),
    type: z.enum(['issue', 'specification']).optional().describe('Artifact type to create'),
    status: z.enum(['open', 'in_progress', 'closed', 'cancelled']).optional().describe('Initial issue status'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Issue priority level'),
    labels: z.array(z.string()).optional().describe('Labels to apply to the issue'),
    assignee: z.string().optional().describe('User to assign the issue to'),
    project: z.string().optional().describe('Project or epic to associate with'),
    wranglerContext: z
        .object({
        agentId: z.string().optional(),
        parentTaskId: z.string().optional(),
        estimatedEffort: z.string().optional(),
    })
        .optional()
        .describe('Wrangler-specific context information'),
});
export async function createIssueTool(params, providerFactory) {
    try {
        const issueProvider = providerFactory.getIssueProvider();
        const request = {
            title: params.title,
            description: params.description,
            type: params.type ?? 'issue',
            status: params.status || 'open',
            priority: params.priority || 'medium',
            labels: params.labels || [],
            ...(params.assignee && { assignee: params.assignee }),
            ...(params.project && { project: params.project }),
            ...(params.wranglerContext && { wranglerContext: params.wranglerContext }),
        };
        const issue = await issueProvider.createIssue(request);
        return {
            content: [
                {
                    type: 'text',
                    text: `Created issue "${issue.title}" with ID: ${issue.id}`,
                },
            ],
            isError: false,
            metadata: {
                issueId: issue.id,
                type: issue.type,
                provider: providerFactory.getConfig().issues?.provider || 'markdown',
                createdAt: issue.createdAt.toISOString(),
            },
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [
                {
                    type: 'text',
                    text: `Failed to create issue: ${message}`,
                },
            ],
            isError: true,
        };
    }
}
//# sourceMappingURL=create.js.map