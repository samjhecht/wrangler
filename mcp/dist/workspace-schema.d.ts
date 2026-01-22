/**
 * Workspace Schema Loader
 *
 * Loads and provides access to the canonical workspace-schema.json
 * that defines all wrangler directory and file paths.
 */
export interface WorkspaceDirectory {
    path: string;
    description: string;
    gitTracked: boolean;
    subdirectories?: Record<string, {
        path: string;
        description: string;
    }>;
}
export interface GovernanceFile {
    path: string;
    description: string;
    required: boolean;
    template?: string;
}
export interface ArtifactTypeConfig {
    directory: string;
    description: string;
}
export interface MCPConfiguration {
    issuesDirectory: string;
    specificationsDirectory: string;
    ideasDirectory: string;
}
export interface WorkspaceSchema {
    $schema?: string;
    version: string;
    description: string;
    workspace: {
        root: string;
        description: string;
    };
    directories: Record<string, WorkspaceDirectory>;
    governanceFiles: Record<string, GovernanceFile>;
    readmeFiles: Record<string, {
        path: string;
        description: string;
        template?: string;
    }>;
    gitignorePatterns: string[];
    artifactTypes: Record<string, ArtifactTypeConfig>;
    mcpConfiguration: MCPConfiguration;
}
/**
 * Find the workspace schema file by looking for .wrangler/config/workspace-schema.json
 * starting from the given directory and walking up to find git root.
 */
export declare function findSchemaPath(startDir?: string): string | null;
/**
 * Load the workspace schema from the canonical location.
 * Caches the result for subsequent calls.
 */
export declare function loadWorkspaceSchema(basePath?: string): WorkspaceSchema;
/**
 * Get the default schema (used when workspace-schema.json doesn't exist)
 */
export declare function getDefaultSchema(): WorkspaceSchema;
/**
 * Clear the cached schema (useful for testing)
 */
export declare function clearSchemaCache(): void;
/**
 * Get MCP directory configuration from schema
 */
export declare function getMCPDirectories(basePath?: string): MCPConfiguration;
/**
 * Get all directories that should be created on workspace initialization
 */
export declare function getInitializationDirectories(basePath?: string): string[];
/**
 * Get directories that should be git-tracked (need .gitkeep)
 */
export declare function getGitTrackedDirectories(basePath?: string): string[];
/**
 * Get gitignore patterns for .wrangler/.gitignore
 */
export declare function getGitignorePatterns(basePath?: string): string[];
/**
 * Get governance file paths
 */
export declare function getGovernanceFilePaths(basePath?: string): Record<string, string>;
//# sourceMappingURL=workspace-schema.d.ts.map