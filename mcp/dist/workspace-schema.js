/**
 * Workspace Schema Loader
 *
 * Loads and provides access to the canonical workspace-schema.json
 * that defines all wrangler directory and file paths.
 */
import * as path from 'path';
import * as fs from 'fs';
let cachedSchema = null;
let schemaPath = null;
/**
 * Find the workspace schema file by looking for .wrangler/workspace-schema.json
 * starting from the given directory and walking up to find git root.
 */
export function findSchemaPath(startDir = process.cwd()) {
    let currentDir = path.resolve(startDir);
    while (currentDir !== path.dirname(currentDir)) {
        const candidatePath = path.join(currentDir, '.wrangler', 'workspace-schema.json');
        if (fs.existsSync(candidatePath)) {
            return candidatePath;
        }
        // Also check if we've hit the git root
        const gitDir = path.join(currentDir, '.git');
        if (fs.existsSync(gitDir)) {
            // We're at git root, check for schema here
            const schemaAtGitRoot = path.join(currentDir, '.wrangler', 'workspace-schema.json');
            if (fs.existsSync(schemaAtGitRoot)) {
                return schemaAtGitRoot;
            }
            // Git root found but no schema - stop searching
            return null;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}
/**
 * Load the workspace schema from the canonical location.
 * Caches the result for subsequent calls.
 */
export function loadWorkspaceSchema(basePath) {
    if (cachedSchema && schemaPath) {
        return cachedSchema;
    }
    const foundPath = findSchemaPath(basePath);
    if (!foundPath) {
        // Return default schema if not found
        return getDefaultSchema();
    }
    try {
        const content = fs.readFileSync(foundPath, 'utf-8');
        cachedSchema = JSON.parse(content);
        schemaPath = foundPath;
        return cachedSchema;
    }
    catch (error) {
        // Return default schema on error
        return getDefaultSchema();
    }
}
/**
 * Get the default schema (used when workspace-schema.json doesn't exist)
 */
export function getDefaultSchema() {
    return {
        version: '1.2.0',
        description: 'Default wrangler workspace schema',
        workspace: {
            root: '.wrangler',
            description: 'Central wrangler workspace directory'
        },
        directories: {
            issues: {
                path: '.wrangler/issues',
                description: 'Issue tracking files',
                gitTracked: true,
                subdirectories: {
                    completed: {
                        path: '.wrangler/issues/completed',
                        description: 'Archived completed issues'
                    }
                }
            },
            specifications: {
                path: '.wrangler/specifications',
                description: 'Feature specifications',
                gitTracked: true
            },
            ideas: {
                path: '.wrangler/ideas',
                description: 'Ideas and proposals',
                gitTracked: true
            },
            memos: {
                path: '.wrangler/memos',
                description: 'Reference material',
                gitTracked: true
            },
            plans: {
                path: '.wrangler/plans',
                description: 'Implementation plans',
                gitTracked: true
            },
            docs: {
                path: '.wrangler/docs',
                description: 'Generated documentation',
                gitTracked: true
            },
            templates: {
                path: '.wrangler/templates',
                description: 'Issue and spec templates',
                gitTracked: true
            },
            cache: {
                path: '.wrangler/cache',
                description: 'Runtime cache',
                gitTracked: false
            },
            config: {
                path: '.wrangler/config',
                description: 'Runtime configuration',
                gitTracked: false
            },
            logs: {
                path: '.wrangler/logs',
                description: 'Runtime logs',
                gitTracked: false
            }
        },
        governanceFiles: {
            constitution: {
                path: '.wrangler/CONSTITUTION.md',
                description: 'Project constitution',
                required: false
            },
            roadmap: {
                path: '.wrangler/ROADMAP.md',
                description: 'Strategic roadmap',
                required: false
            },
            nextSteps: {
                path: '.wrangler/ROADMAP_NEXT_STEPS.md',
                description: 'Tactical execution tracker',
                required: false
            }
        },
        readmeFiles: {
            issues: {
                path: '.wrangler/issues/README.md',
                description: 'Issues README'
            },
            specifications: {
                path: '.wrangler/specifications/README.md',
                description: 'Specifications README'
            }
        },
        templateFiles: {
            issue: {
                path: '.wrangler/templates/issue.md',
                description: 'Issue template'
            },
            specification: {
                path: '.wrangler/templates/specification.md',
                description: 'Specification template'
            }
        },
        gitignorePatterns: ['cache/', 'config/', 'logs/', 'metrics/'],
        artifactTypes: {
            issue: {
                directory: 'issues',
                description: 'Work items'
            },
            specification: {
                directory: 'specifications',
                description: 'Feature specs'
            },
            idea: {
                directory: 'ideas',
                description: 'Ideas and proposals'
            }
        },
        mcpConfiguration: {
            issuesDirectory: '.wrangler/issues',
            specificationsDirectory: '.wrangler/specifications',
            ideasDirectory: '.wrangler/ideas'
        }
    };
}
/**
 * Clear the cached schema (useful for testing)
 */
export function clearSchemaCache() {
    cachedSchema = null;
    schemaPath = null;
}
/**
 * Get MCP directory configuration from schema
 */
export function getMCPDirectories(basePath) {
    const schema = loadWorkspaceSchema(basePath);
    return schema.mcpConfiguration;
}
/**
 * Get all directories that should be created on workspace initialization
 */
export function getInitializationDirectories(basePath) {
    const schema = loadWorkspaceSchema(basePath);
    const dirs = [];
    for (const dir of Object.values(schema.directories)) {
        dirs.push(dir.path);
        if (dir.subdirectories) {
            for (const subdir of Object.values(dir.subdirectories)) {
                dirs.push(subdir.path);
            }
        }
    }
    return dirs;
}
/**
 * Get directories that should be git-tracked (need .gitkeep)
 */
export function getGitTrackedDirectories(basePath) {
    const schema = loadWorkspaceSchema(basePath);
    return Object.values(schema.directories)
        .filter(dir => dir.gitTracked)
        .map(dir => dir.path);
}
/**
 * Get gitignore patterns for .wrangler/.gitignore
 */
export function getGitignorePatterns(basePath) {
    const schema = loadWorkspaceSchema(basePath);
    return schema.gitignorePatterns;
}
/**
 * Get governance file paths
 */
export function getGovernanceFilePaths(basePath) {
    const schema = loadWorkspaceSchema(basePath);
    const paths = {};
    for (const [key, file] of Object.entries(schema.governanceFiles)) {
        paths[key] = file.path;
    }
    return paths;
}
//# sourceMappingURL=workspace-schema.js.map