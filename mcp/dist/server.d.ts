/**
 * Wrangler MCP Server
 *
 * Main MCP server providing Wrangler-specific tools for issue management,
 * file operations, and workflow coordination.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { WranglerMCPConfig } from './types/config.js';
export declare class WranglerMCPServer {
    private server;
    private config;
    private providerFactory;
    private transport;
    constructor(config?: WranglerMCPConfig);
    private setupTools;
    /**
     * Get the list of available tools
     */
    getAvailableTools(): {
        name: string;
        description: string;
        inputSchema: import("zod-to-json-schema").JsonSchema7Type & {
            $schema?: string | undefined;
            definitions?: {
                [key: string]: import("zod-to-json-schema").JsonSchema7Type;
            } | undefined;
        };
    }[];
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
    /**
     * Stop the MCP server
     */
    stop(): Promise<void>;
    /**
     * Get server instance for testing
     */
    getServer(): Server;
}
export * from './types/config.js';
export * from './providers/factory.js';
//# sourceMappingURL=server.d.ts.map