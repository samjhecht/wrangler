/**
 * Wrangler MCP Server
 *
 * Main MCP server providing Wrangler-specific tools for issue management,
 * file operations, and workflow coordination.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { createIssueSchema, createIssueTool } from './tools/issues/create.js';
import { listIssuesSchema, listIssuesTool } from './tools/issues/list.js';
import { searchIssuesSchema, searchIssuesTool } from './tools/issues/search.js';
import { updateIssueSchema, updateIssueTool } from './tools/issues/update.js';
import { getIssueSchema, getIssueTool } from './tools/issues/get.js';
import { deleteIssueSchema, deleteIssueTool } from './tools/issues/delete.js';
import { issueLabelsSchema, issueLabelsTool } from './tools/issues/labels.js';
import { issueMetadataSchema, issueMetadataTool } from './tools/issues/metadata.js';
import { issueProjectsSchema, issueProjectsTool } from './tools/issues/projects.js';
import { ProviderFactory } from './providers/factory.js';
import { createErrorResponse, MCPErrorCode, getRemediation } from './types/errors.js';
import { globalMetrics } from './observability/metrics.js';
import { WranglerMCPConfig } from './types/config.js';
import { issuesAllCompleteSchema, issuesAllCompleteTool } from './tools/issues/all-complete.js';
import { markCompleteSchema, markCompleteIssueTool } from './tools/issues/mark-complete.js';

export class WranglerMCPServer {
  private server: Server;
  private config: WranglerMCPConfig;
  private providerFactory: ProviderFactory;
  private transport: StdioServerTransport;
  private debug: boolean;

  constructor(config: WranglerMCPConfig = {}) {
    this.config = {
      name: 'wrangler-tools',
      version: '1.0.0',
      workspaceRoot: process.cwd(),
      ...config
    };

    this.debug = process.env.WRANGLER_MCP_DEBUG === 'true' || config.debug === true;

    if (this.debug) {
      console.error(`[MCP Debug] Initializing Wrangler MCP Server`);
      console.error(`[MCP Debug] Config:`, JSON.stringify(this.config, null, 2));
    }

    this.server = new Server(
      {
        name: this.config.name || 'wrangler-tools',
        version: this.config.version || '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize stdio transport
    this.transport = new StdioServerTransport();

    if (this.debug) {
      console.error(`[MCP Debug] Stdio transport initialized`);
    }

    // Initialize provider factory with proper configuration
    const providerConfig: WranglerMCPConfig = {
      ...this.config,
      issues: this.config.issues || {
        provider: 'markdown',
        settings: {
          basePath: this.config.workspaceRoot || process.cwd(),
          issuesDirectory: '.wrangler/issues',
        },
      },
    };

    this.providerFactory = new ProviderFactory(providerConfig);
    this.setupTools();
  }

  private setupTools(): void {
    if (this.debug) {
      console.error(`[MCP Debug] Setting up tools...`);
    }

    // Issue Management Tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (this.debug) {
        console.error(`[MCP Debug] Tool call: ${name}`, JSON.stringify(args, null, 2));
      }

      // Start metrics tracking
      const invocationId = globalMetrics.startInvocation(name, this.config.name || 'wrangler-tools');

      try {
        let result;

        switch (name) {
          case 'issues_create':
            result = await createIssueTool(
              createIssueSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_list':
            result = await listIssuesTool(
              listIssuesSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_search':
            result = await searchIssuesTool(
              searchIssuesSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_update':
            result = await updateIssueTool(
              updateIssueSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_get':
            result = await getIssueTool(
              getIssueSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_delete':
            result = await deleteIssueTool(
              deleteIssueSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_labels':
            result = await issueLabelsTool(
              issueLabelsSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_metadata':
            result = await issueMetadataTool(
              issueMetadataSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_projects':
            result = await issueProjectsTool(
              issueProjectsSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_all_complete':
            result = await issuesAllCompleteTool(
              issuesAllCompleteSchema.parse(args),
              this.providerFactory
            );
            break;

          case 'issues_mark_complete':
            result = await markCompleteIssueTool(
              markCompleteSchema.parse(args),
              this.providerFactory
            );
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        if (this.debug) {
          console.error(`[MCP Debug] Tool ${name} result:`, JSON.stringify(result, null, 2));
        }

        // Complete metrics tracking - success
        globalMetrics.completeInvocation(invocationId, !result.isError);

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';

        if (this.debug) {
          console.error(`[MCP Debug] Tool ${name} error:`, error);
        }

        // Determine error code based on error type
        let errorCode = MCPErrorCode.TOOL_EXECUTION_ERROR;

        if (error instanceof z.ZodError) {
          errorCode = MCPErrorCode.VALIDATION_ERROR;
        } else if (message.includes('not found')) {
          errorCode = MCPErrorCode.RESOURCE_NOT_FOUND;
        } else if (message.includes('permission') || message.includes('denied')) {
          errorCode = MCPErrorCode.PERMISSION_DENIED;
        } else if (message.includes('Rate limit')) {
          errorCode = MCPErrorCode.RATE_LIMIT_EXCEEDED;
        } else if (message.includes('traversal')) {
          errorCode = MCPErrorCode.PATH_TRAVERSAL_DENIED;
        }

        const errorResponse = createErrorResponse(
          errorCode,
          `Error executing tool ${name}: ${message}`,
          {
            context: { tool: name },
            remediation: getRemediation(errorCode),
            includeStack: this.debug,
            error: error instanceof Error ? error : undefined,
            details: error instanceof z.ZodError ? error.errors : undefined,
          }
        );

        // Complete metrics tracking - error
        globalMetrics.completeInvocation(invocationId, false, errorCode, message);

        // Return as CallToolResult (MCP SDK compatible)
        return {
          content: errorResponse.content,
          isError: errorResponse.isError,
          ...(errorResponse.metadata && { _meta: errorResponse.metadata }),
        } as CallToolResult;
      }
    });

    // Add tools/list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      if (this.debug) {
        console.error(`[MCP Debug] Tools/list request received`);
      }

      const tools = this.getAvailableTools().map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));

      const result = {
        tools
      };

      if (this.debug) {
        console.error(`[MCP Debug] Tools/list response:`, JSON.stringify(result, null, 2));
      }

      return result;
    });

    if (this.debug) {
      console.error(`[MCP Debug] Tools setup complete`);
    }
  }

  /**
   * Get the list of available tools
   */
  getAvailableTools() {
    return [
      {
        name: 'issues_create',
        description:
          'Create a new Wrangler issue (Markdown under .wrangler/issues) with optional status, priority, assignee, and labels for local project tracking.',
        inputSchema: zodToJsonSchema(createIssueSchema),
      },
      {
        name: 'issues_list',
        description:
          'List Wrangler issues in the workspace with filters for status, priority, labels, assignee, or project to review current local work items.',
        inputSchema: zodToJsonSchema(listIssuesSchema),
      },
      {
        name: 'issues_search',
        description:
          'Search across Wrangler issue titles, descriptions, and labels to locate tasks by keyword while honoring the same filtering options as issues_list.',
        inputSchema: zodToJsonSchema(searchIssuesSchema),
      },
      {
        name: 'issues_update',
        description:
          'Modify an existing Wrangler issue\'s frontmatter (status, priority, labels, assignee, etc.) after work progresses or context changes.',
        inputSchema: zodToJsonSchema(updateIssueSchema),
      },
      {
        name: 'issues_get',
        description:
          'Retrieve the full Markdown content and metadata for a single Wrangler issue when you need complete local context before taking action.',
        inputSchema: zodToJsonSchema(getIssueSchema),
      },
      {
        name: 'issues_delete',
        description:
          'Remove a Wrangler issue file; requires `confirm: true` and should be used only when local issue history can be safely discarded.',
        inputSchema: zodToJsonSchema(deleteIssueSchema),
      },
      {
        name: 'issues_labels',
        description:
          'List, add, or remove labels across Wrangler issues to keep local tagging consistent with project conventions.',
        inputSchema: zodToJsonSchema(issueLabelsSchema),
      },
      {
        name: 'issues_metadata',
        description:
          'Read or update the Wrangler-specific metadata block (`wranglerContext`) on an issue for workflow IDs, parent tasks, or other structured context.',
        inputSchema: zodToJsonSchema(issueMetadataSchema),
      },
      {
        name: 'issues_projects',
        description:
          'List Wrangler issue projects or assign/clear a project on a local issue to keep work grouped by initiative.',
        inputSchema: zodToJsonSchema(issueProjectsSchema),
      },
      {
        name: 'issues_all_complete',
        description:
          'Check whether all Wrangler issues are complete and receive a summary of pending vs. finished work.',
        inputSchema: zodToJsonSchema(issuesAllCompleteSchema),
      },
      {
        name: 'issues_mark_complete',
        description:
          'Mark a Wrangler issue as closed and (optionally) append a completion note once the work is finished.',
        inputSchema: zodToJsonSchema(markCompleteSchema),
      },
    ];
  }

  /**
   * Get current metrics for all tools
   */
  getMetrics() {
    return globalMetrics.exportJSON();
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    return globalMetrics.exportPrometheus();
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    if (this.debug) {
      console.error(`[MCP Debug] Starting MCP server with stdio transport...`);
    }

    // Add error handlers
    this.transport.onerror = (error) => {
      console.error(`[MCP Debug] Transport error:`, error);
    };

    this.transport.onclose = () => {
      if (this.debug) {
        console.error(`[MCP Debug] Transport closed`);
      }
    };

    this.server.onerror = (error) => {
      console.error(`[MCP Debug] Server error:`, error);
    };

    // Connect server to stdio transport (this automatically starts the transport)
    await this.server.connect(this.transport);

    if (this.debug) {
      console.error(`[MCP Debug] Server connected and transport started, ready for requests`);
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (this.debug) {
      console.error(`[MCP Debug] Stopping MCP server...`);
    }

    await this.transport.close();
    await this.server.close();

    if (this.debug) {
      console.error(`[MCP Debug] MCP server stopped`);
    }
  }

  /**
   * Get server instance for testing
   */
  getServer(): Server {
    return this.server;
  }
}

// Export for use in other modules
export * from './types/config.js';
export * from './providers/factory.js';
