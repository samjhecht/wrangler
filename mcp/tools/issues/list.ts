/**
 * List issues tool implementation
 */

import { z } from 'zod';
import { ProviderFactory } from '../../providers/factory.js';
import { IssueFilters, Issue } from '../../types/issues.js';

export const listIssuesSchema = z.object({
  status: z.array(z.enum(['open', 'in_progress', 'closed', 'cancelled'])).optional().describe('Filter by status'),
  priority: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional().describe('Filter by priority'),
  labels: z.array(z.string()).optional().describe('Filter by labels'),
  assignee: z.string().optional().describe('Filter by assignee'),
  project: z.string().optional().describe('Filter by project'),
  parentTaskId: z.string().optional().describe('Filter issues whose wranglerContext.parentTaskId matches'),
  types: z.array(z.enum(['issue', 'specification'])).optional().describe('Filter by artifact types'),
  type: z.enum(['issue', 'specification']).optional().describe('Filter by a single artifact type'),
  limit: z.number().int().positive().max(1000).optional().describe('Maximum number of issues to return'),
  offset: z.number().int().min(0).optional().describe('Number of issues to skip for pagination')
});

export type ListIssuesParams = z.infer<typeof listIssuesSchema>;

export async function listIssuesTool(
  params: ListIssuesParams,
  providerFactory: ProviderFactory
) {
  try {
    const issueProvider = providerFactory.getIssueProvider();

    const filters: IssueFilters = {
      status: params.status,
      priority: params.priority,
      labels: params.labels,
      assignee: params.assignee,
      project: params.project,
      parentTaskId: params.parentTaskId,
      types: params.types,
      type: params.type,
      limit: params.limit || 100,
      offset: params.offset || 0
    };

    const issues = await issueProvider.listIssues(filters);
    const structuredIssues = issues.map(serializeIssue);

    const table = formatIssuesAsTable(issues);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${issues.length} issue(s):\n\n${table}`
        }
      ],
      isError: false,
      metadata: {
        totalIssues: issues.length,
        provider: providerFactory.getConfig().issues?.provider || 'markdown',
        filters: filters,
        issues: structuredIssues
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Failed to list issues: ${message}`
        }
      ],
      isError: true
    };
  }
}

function serializeIssue(issue: Issue) {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    priority: issue.priority,
    labels: issue.labels,
    assignee: issue.assignee,
    project: issue.project,
    createdAt: issue.createdAt?.toISOString?.() ?? issue.createdAt,
    updatedAt: issue.updatedAt?.toISOString?.() ?? issue.updatedAt,
    closedAt: issue.closedAt?.toISOString?.() ?? issue.closedAt,
    wranglerContext: issue.wranglerContext || null
  };
}

function formatIssuesAsTable(issues: Issue[]): string {
  if (issues.length === 0) {
    return 'No issues found.';
  }

  const headers = ['ID', 'Title', 'Type', 'Status', 'Priority', 'Labels'];
  const rows = issues.map(issue => [
    issue.id,
    issue.title.length > 50 ? issue.title.substring(0, 47) + '...' : issue.title,
    issue.type,
    issue.status,
    issue.priority,
    issue.labels.join(', ')
  ]);

  const widths = headers.map((header, i) =>
    Math.max(header.length, Math.max(...rows.map(row => (row[i] || '').toString().length)))
  );

  const separator = '| ' + widths.map(w => '-'.repeat(w)).join(' | ') + ' |';
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(widths[i])).join(' | ') + ' |';
  const dataRows = rows.map(row =>
    '| ' + row.map((cell, i) => (cell || '').toString().padEnd(widths[i])).join(' | ') + ' |'
  );

  return [headerRow, separator, ...dataRows].join('\n');
}
