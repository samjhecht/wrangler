#!/usr/bin/env node
/**
 * Wrangler MCP Server Entry Point
 *
 * Starts the MCP server with stdio transport for communication with Claude Desktop
 * or other MCP clients.
 */
import { WranglerMCPServer } from './server.js';
/**
 * Parse configuration from environment variables
 */
function parseConfig() {
    const config = {
        name: process.env.WRANGLER_MCP_NAME || 'wrangler-tools',
        version: process.env.WRANGLER_MCP_VERSION || '1.0.0',
        workspaceRoot: process.env.WRANGLER_WORKSPACE_ROOT || process.cwd(),
        debug: process.env.WRANGLER_MCP_DEBUG === 'true',
    };
    // Parse issue provider configuration
    const issueProvider = process.env.WRANGLER_ISSUE_PROVIDER || 'markdown';
    const issueBasePath = process.env.WRANGLER_ISSUE_BASE_PATH || config.workspaceRoot || process.cwd();
    const issuesDirectory = process.env.WRANGLER_ISSUES_DIRECTORY || '.wrangler/issues';
    config.issues = {
        provider: issueProvider,
        settings: {
            basePath: issueBasePath,
            issuesDirectory: issuesDirectory,
        },
    };
    return config;
}
/**
 * Main entry point
 */
async function main() {
    try {
        const config = parseConfig();
        if (config.debug) {
            console.error('[Wrangler MCP] Starting server with config:', JSON.stringify(config, null, 2));
        }
        const server = new WranglerMCPServer(config);
        // Setup graceful shutdown handlers
        const shutdown = async (signal) => {
            if (config.debug) {
                console.error(`[Wrangler MCP] Received ${signal}, shutting down gracefully...`);
            }
            try {
                await server.stop();
                if (config.debug) {
                    console.error('[Wrangler MCP] Server stopped successfully');
                }
                process.exit(0);
            }
            catch (error) {
                console.error('[Wrangler MCP] Error during shutdown:', error);
                process.exit(1);
            }
        };
        // Register shutdown handlers
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            console.error('[Wrangler MCP] Uncaught exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('[Wrangler MCP] Unhandled rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
        // Start the server
        await server.start();
        if (config.debug) {
            console.error('[Wrangler MCP] Server started successfully, waiting for connections...');
        }
    }
    catch (error) {
        console.error('[Wrangler MCP] Failed to start server:', error);
        process.exit(1);
    }
}
// Run the server
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
export { WranglerMCPServer } from './server.js';
export * from './types/config.js';
export * from './types/errors.js';
export * from './observability/metrics.js';
//# sourceMappingURL=index.js.map