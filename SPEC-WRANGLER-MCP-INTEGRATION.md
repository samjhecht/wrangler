# Wrangler Built-in MCP Server - Integration Specification

## Executive Summary

This specification details the integration of wingman's MCP (Model Context Protocol) server into wrangler as a built-in, first-party MCP server. The integration will provide deterministic issue and specification management capabilities directly within wrangler, enabling AI agents (Claude Code, etc.) to manage project structure and track work items systematically.

## Goals

1. **Extract and integrate wingman's MCP server** as a built-in component of wrangler
2. **Provide automatic workspace initialization** when Claude Code starts in a project
3. **Enable systematic issue tracking** with markdown-based storage under `.wrangler/`
4. **Maintain compatibility** with Claude Code's existing plugin system
5. **Support both issues and specifications** as distinct artifact types

## Non-Goals

- Replicating wingman's full workflow engine or agent orchestration
- Supporting other backends beyond markdown (GitHub Issues, Linear, etc.)
- Terminal UI or interactive CLI components
- Workflow state machine execution

## Architecture Overview

### High-Level Structure

```
wrangler/
├── mcp/                           # New: MCP server implementation
│   ├── index.ts                   # Server entry point
│   ├── server.ts                  # WranglerMCPServer class
│   ├── types/                     # Type definitions
│   │   ├── config.ts              # MCP configuration types
│   │   ├── issues.ts              # Issue management types
│   │   └── errors.ts              # Error handling types
│   ├── tools/                     # MCP tool implementations
│   │   ├── issues/                # Issue management tools
│   │   │   ├── create.ts          # issues_create
│   │   │   ├── list.ts            # issues_list
│   │   │   ├── search.ts          # issues_search
│   │   │   ├── update.ts          # issues_update
│   │   │   ├── get.ts             # issues_get
│   │   │   ├── delete.ts          # issues_delete
│   │   │   ├── labels.ts          # issues_labels
│   │   │   ├── metadata.ts        # issues_metadata
│   │   │   ├── projects.ts        # issues_projects
│   │   │   ├── mark-complete.ts   # issues_mark_complete
│   │   │   └── all-complete.ts    # issues_all_complete
│   │   └── constants.ts           # Shared constants
│   ├── providers/                 # Storage providers
│   │   ├── factory.ts             # Provider factory
│   │   └── markdown.ts            # Markdown-based storage
│   └── observability/             # Metrics and monitoring
│       └── metrics.ts             # Tool invocation metrics
├── lib/                           # Existing lib directory
│   ├── initialize-skills.sh       # Existing skills init
│   └── initialize-workspace.ts    # New: Workspace initialization
├── hooks/                         # Existing hooks directory
│   ├── hooks.json                 # Existing hooks config
│   └── session-start.sh           # New: Auto-init workspace
├── skills/                        # Existing skills
├── commands/                      # Existing slash commands
└── .claude-plugin/                # Existing plugin config
    ├── plugin.json                # Updated: Add MCP server
    └── marketplace.json           # Existing marketplace config
```

## Component Details

### 1. MCP Server Core (`mcp/`)

#### `mcp/index.ts` - Server Entry Point

```typescript
#!/usr/bin/env node
import { WranglerMCPServer } from './server.js';

async function main() {
  const config = {
    name: 'wrangler-mcp',
    version: '1.0.0',
    workspaceRoot: process.cwd(),
    debug: process.env.WRANGLER_MCP_DEBUG === 'true'
  };

  const server = new WranglerMCPServer(config);
  await server.start();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });
}

main().catch(console.error);
```

**Responsibilities:**
- Initialize MCP server with configuration
- Handle process lifecycle (startup, shutdown)
- Export server for programmatic use

#### `mcp/server.ts` - Main Server Class

**Source:** Extracted from `wingman-main/src/core/mcp/server.ts`

**Key modifications:**
- Remove `abort` tool (not needed in wrangler context)
- Simplify configuration to focus on workspace root
- Update tool descriptions to reference `.wrangler/` instead of `.wingman/`
- Add wrangler-specific branding in tool metadata

**Core capabilities:**
- Tool registration and request handling
- Zod-based schema validation
- Error handling with detailed remediation
- Metrics collection for tool invocations
- Stdio transport for agent communication

### 2. Workspace Directory Structure

#### Automatic `.wrangler/` Directory Creation

When Claude Code starts in a project (via session-start hook), automatically create:

```
project-root/
├── .git/                          # Required: Must be a git repo
├── .wrangler/                     # New: Wrangler workspace root
│   ├── issues/                    # Issue tracking artifacts
│   │   └── .gitkeep               # Keep directory in git
│   └── specifications/            # Feature specifications
│       └── .gitkeep               # Keep directory in git
├── src/
└── package.json
```

**Directory Guarantees:**
- `.wrangler/issues/` - Always created for issue tracking
- `.wrangler/specifications/` - Always created for specs
- Both directories are tracked in git (with .gitkeep if empty)
- No `.wrangler/runs/` or other runtime state directories (not needed)

#### `.gitignore` Management

Update `.gitignore` automatically to:
- Track `.wrangler/issues/` and `.wrangler/specifications/` (user-facing artifacts)
- Ignore any temporary files (if added later)

Example `.gitignore` additions:
```gitignore
# Wrangler - track issues and specifications
!.wrangler/
!.wrangler/issues/
!.wrangler/specifications/
```

### 3. Issue Storage Format

Issues are stored as **Markdown files with YAML frontmatter**:

#### File Naming Convention

Format: `{counter}-{slug}.md`

Examples:
- `000001-add-authentication.md`
- `000002-fix-memory-leak.md`
- `000003-api-design-spec.md`

**Counter:**
- 6-digit zero-padded number
- Increments globally across both issues and specifications
- Scans all existing files to find next available number

**Slug:**
- Lowercase, hyphenated version of title
- Max 50 characters
- Alphanumeric and hyphens only

#### Frontmatter Schema

```yaml
---
id: "000001"
title: "Implement authentication system"
type: "issue"                      # "issue" or "specification"
status: "open"                     # "open", "in_progress", "closed", "cancelled"
priority: "high"                   # "low", "medium", "high", "critical"
labels: ["backend", "security"]
assignee: "claude-code"            # Optional: Assigned person/agent
project: "Auth Refactor"           # Optional: Epic/initiative grouping
createdAt: "2024-10-29T10:00:00.000Z"
updatedAt: "2024-10-29T10:00:00.000Z"
closedAt: null                     # Set when status changes to "closed"
wranglerContext:                   # Optional: Wrangler-specific metadata
  agentId: "claude-code"           # Agent responsible
  parentTaskId: "000000"           # Parent issue for subtasks
  estimatedEffort: "2 days"        # Time estimate
---

## Description

Implement a secure authentication system using OAuth2...

### Requirements

- Support JWT tokens
- Rate limiting on login attempts
- Secure password hashing with bcrypt

### Acceptance Criteria

- [ ] User can register with email/password
- [ ] User can login and receive JWT token
- [ ] Token expires after 24 hours
- [ ] Rate limiting prevents brute force attacks
```

### 4. MCP Tools

#### Tool Inventory

All 11 tools from wingman's issue management system:

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `issues_create` | Create issue/spec | title, description, metadata | issueId, createdAt |
| `issues_list` | List issues with filters | status, priority, labels, etc. | Array of issues |
| `issues_search` | Full-text search | query, fields, filters | Matching issues |
| `issues_update` | Modify issue | id, fields to update | Updated issue |
| `issues_get` | Retrieve single issue | id | Full issue content |
| `issues_delete` | Remove issue | id, confirm | Success message |
| `issues_labels` | Manage labels | operation (list/add/remove) | Labels array |
| `issues_metadata` | Manage wranglerContext | operation, key, value | Updated metadata |
| `issues_projects` | Manage projects | operation (list/add/remove) | Projects array |
| `issues_mark_complete` | Mark issue as closed | id, optional note | Updated issue |
| `issues_all_complete` | Check completion status | filters | Summary of completion |

#### Tool Implementation Pattern

Each tool follows this structure:

```typescript
// 1. Zod schema for validation
export const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum(['issue', 'specification']).optional(),
  status: z.enum(['open', 'in_progress', 'closed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  labels: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  project: z.string().optional(),
  wranglerContext: z.object({
    agentId: z.string().optional(),
    parentTaskId: z.string().optional(),
    estimatedEffort: z.string().optional()
  }).optional()
});

// 2. TypeScript type from schema
export type CreateIssueParams = z.infer<typeof createIssueSchema>;

// 3. Tool implementation
export async function createIssueTool(
  params: CreateIssueParams,
  providerFactory: ProviderFactory
) {
  try {
    const issueProvider = providerFactory.getIssueProvider();
    const issue = await issueProvider.createIssue(params);

    return {
      content: [{
        type: 'text',
        text: `Created ${issue.type} "${issue.title}" with ID: ${issue.id}`
      }],
      isError: false,
      metadata: {
        issueId: issue.id,
        type: issue.type,
        createdAt: issue.createdAt.toISOString()
      }
    };
  } catch (error) {
    return createErrorResponse(error, 'issues_create');
  }
}
```

### 5. Provider Architecture

#### Markdown Issue Provider

**Source:** Extracted from `wingman-main/src/core/mcp/providers/issues/markdown.ts`

**Key features:**
- File-based storage under `.wrangler/issues/` and `.wrangler/specifications/`
- YAML frontmatter parsing with `gray-matter`
- Counter-based ID generation
- Full-text search across title, description, labels
- Path traversal prevention (security)
- Filtering by status, priority, labels, assignee, project

**Configuration:**
```typescript
interface MarkdownProviderSettings {
  basePath: string;                    // Workspace root (process.cwd())
  issuesDirectory: string;             // ".wrangler/issues"
  specificationsDirectory: string;     // ".wrangler/specifications"
  fileNaming: 'counter';               // Always use counter-based naming
}
```

### 6. Automatic Workspace Initialization

#### Session Start Hook

**File:** `hooks/session-start.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# Find git repository root
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")

if [ -z "$GIT_ROOT" ]; then
  # Not in a git repository - skip initialization
  exit 0
fi

WRANGLER_DIR="${GIT_ROOT}/.wrangler"

# Check if .wrangler already exists
if [ -d "$WRANGLER_DIR" ]; then
  # Already initialized
  exit 0
fi

# Initialize workspace
echo "Initializing Wrangler workspace..."
mkdir -p "${WRANGLER_DIR}/issues"
mkdir -p "${WRANGLER_DIR}/specifications"

# Create .gitkeep files to track empty directories
touch "${WRANGLER_DIR}/issues/.gitkeep"
touch "${WRANGLER_DIR}/specifications/.gitkeep"

# Update .gitignore if needed
GITIGNORE="${GIT_ROOT}/.gitignore"
if [ -f "$GITIGNORE" ] && ! grep -q ".wrangler" "$GITIGNORE"; then
  cat >> "$GITIGNORE" <<EOF

# Wrangler - track issues and specifications
!.wrangler/
!.wrangler/issues/
!.wrangler/specifications/
EOF
fi

echo "✓ Wrangler workspace initialized at ${WRANGLER_DIR}"
```

**Registration in `hooks/hooks.json`:**

```json
{
  "sessionStart": {
    "type": "bash",
    "command": "bash",
    "args": ["hooks/session-start.sh"]
  }
}
```

### 7. Claude Code Plugin Integration

#### Update `.claude-plugin/plugin.json`

Add MCP server configuration:

```json
{
  "name": "wrangler",
  "version": "1.0.0",
  "description": "Core skills library with built-in issue management",
  "mcpServers": [
    {
      "id": "wrangler-mcp",
      "name": "Wrangler Issue Management",
      "description": "Built-in MCP server for systematic issue and specification tracking",
      "command": "node",
      "args": ["mcp/index.js"],
      "env": {
        "WRANGLER_MCP_DEBUG": "false"
      },
      "autoStart": true,
      "workingDirectory": ".",
      "trust": "allow"
    }
  ],
  "skills": {
    "directory": "skills"
  },
  "commands": {
    "directory": "commands"
  },
  "hooks": {
    "configPath": "hooks/hooks.json"
  }
}
```

## Implementation Plan

### Phase 1: Core MCP Server (Priority 1)

**Deliverables:**
1. Create `mcp/` directory structure
2. Extract and adapt `server.ts` from wingman
3. Extract and adapt `providers/markdown.ts` from wingman
4. Implement all 11 issue management tools
5. Add comprehensive error handling and validation

**Files to create:**
- `mcp/index.ts` (120 lines)
- `mcp/server.ts` (420 lines)
- `mcp/types/config.ts` (80 lines)
- `mcp/types/issues.ts` (150 lines)
- `mcp/types/errors.ts` (100 lines)
- `mcp/providers/factory.ts` (60 lines)
- `mcp/providers/markdown.ts` (540 lines)
- `mcp/observability/metrics.ts` (200 lines)

**Dependencies to add:**
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",
  "gray-matter": "^4.0.3",
  "fast-glob": "^3.3.0",
  "fs-extra": "^11.2.0",
  "zod": "^3.22.0",
  "zod-to-json-schema": "^3.22.0"
}
```

### Phase 2: MCP Tools (Priority 1)

**Deliverables:**
1. Implement all 11 issue management tools
2. Add Zod schemas for validation
3. Consistent error handling across tools
4. Tool metadata and descriptions

**Files to create:**
- `mcp/tools/issues/create.ts` (85 lines)
- `mcp/tools/issues/list.ts` (95 lines)
- `mcp/tools/issues/search.ts` (80 lines)
- `mcp/tools/issues/update.ts` (90 lines)
- `mcp/tools/issues/get.ts` (60 lines)
- `mcp/tools/issues/delete.ts` (65 lines)
- `mcp/tools/issues/labels.ts` (100 lines)
- `mcp/tools/issues/metadata.ts` (110 lines)
- `mcp/tools/issues/projects.ts` (100 lines)
- `mcp/tools/issues/mark-complete.ts` (75 lines)
- `mcp/tools/issues/all-complete.ts` (95 lines)
- `mcp/tools/constants.ts` (20 lines)

### Phase 3: Workspace Initialization (Priority 2)

**Deliverables:**
1. Create session-start hook for automatic initialization
2. Implement `.wrangler/` directory creation
3. Add .gitignore management
4. Create .gitkeep files for empty directories

**Files to create:**
- `hooks/session-start.sh` (50 lines)
- Update `hooks/hooks.json` (5 lines)

### Phase 4: Plugin Integration (Priority 2)

**Deliverables:**
1. Update `.claude-plugin/plugin.json` with MCP server config
2. Add build scripts for TypeScript compilation
3. Create package.json scripts for development
4. Documentation updates

**Files to modify:**
- `.claude-plugin/plugin.json`
- `package.json` (add build scripts)
- `README.md` (add MCP documentation)

### Phase 5: Testing & Documentation (Priority 3)

**Deliverables:**
1. Integration tests for MCP tools
2. End-to-end workflow tests
3. Documentation for issue management workflow
4. Example usage in README

**Files to create:**
- `mcp/__tests__/server.test.ts`
- `mcp/__tests__/tools/issues.test.ts`
- `mcp/__tests__/providers/markdown.test.ts`
- `docs/ISSUE-MANAGEMENT.md`

## Build Configuration

### TypeScript Configuration

Create `mcp/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

### Build Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build:mcp": "tsc -p mcp/tsconfig.json",
    "watch:mcp": "tsc -p mcp/tsconfig.json --watch",
    "mcp:dev": "npm run build:mcp && WRANGLER_MCP_DEBUG=true node mcp/dist/index.js",
    "test:mcp": "jest mcp/__tests__"
  }
}
```

## Security Considerations

### Path Traversal Prevention

The markdown provider MUST validate all file paths to prevent traversal attacks:

```typescript
private assertWithinWorkspace(targetPath: string, action: string): void {
  const resolvedTarget = path.resolve(targetPath);
  const relative = path.relative(this.basePath, resolvedTarget);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(
      `Attempted to ${action} outside of workspace: ${resolvedTarget}`
    );
  }
}
```

All file operations MUST call this validation before reading/writing.

### Input Validation

All MCP tool inputs MUST be validated with Zod schemas before execution. Example:

```typescript
// Schema definition
export const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  // ... other fields
});

// Usage in tool
const params = createIssueSchema.parse(rawInput); // Throws on validation failure
```

## Error Handling

### Error Response Format

All tools return consistent error responses:

```typescript
interface ErrorResponse {
  content: Array<{
    type: 'text';
    text: string;  // Human-readable error message
  }>;
  isError: true;
  metadata: {
    errorCode: MCPErrorCode;
    errorType: string;
    remediation?: string;
    details?: any;
    stack?: string;  // Only in debug mode
  };
}
```

### Error Codes

```typescript
enum MCPErrorCode {
  VALIDATION_ERROR = 'validation_error',
  RESOURCE_NOT_FOUND = 'resource_not_found',
  PERMISSION_DENIED = 'permission_denied',
  TOOL_EXECUTION_ERROR = 'tool_execution_error',
  PATH_TRAVERSAL_DENIED = 'path_traversal_denied'
}
```

## Observability

### Metrics Collection

Track the following metrics for all tool invocations:

```typescript
interface ToolMetrics {
  toolName: string;
  invocationCount: number;
  successCount: number;
  errorCount: number;
  averageDuration: number;
  lastInvocation: Date;
  errorsByType: Map<MCPErrorCode, number>;
}
```

### Debug Mode

Enable verbose logging via environment variable:

```bash
WRANGLER_MCP_DEBUG=true
```

When enabled, log:
- All tool invocations with parameters
- Tool execution results
- Error stack traces
- Server lifecycle events

## Usage Examples

### Creating an Issue

```typescript
// Agent calls issues_create
{
  "title": "Add authentication to API",
  "description": "Implement JWT-based authentication for all API endpoints",
  "type": "issue",
  "status": "open",
  "priority": "high",
  "labels": ["backend", "security"],
  "assignee": "claude-code",
  "project": "API Hardening"
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Created issue \"Add authentication to API\" with ID: 000001"
  }],
  "isError": false,
  "metadata": {
    "issueId": "000001",
    "type": "issue",
    "createdAt": "2024-10-29T10:00:00.000Z"
  }
}
```

### Listing Issues

```typescript
// Agent calls issues_list
{
  "status": ["open", "in_progress"],
  "priority": ["high", "critical"],
  "labels": ["backend"]
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Found 3 issues:\n\n| ID | Title | Status | Priority |\n|---|---|---|---|\n| 000001 | Add authentication to API | open | high |\n| 000002 | Fix memory leak in handler | in_progress | critical |\n| 000003 | Optimize database queries | open | high |"
  }],
  "isError": false,
  "metadata": {
    "total": 3,
    "filters": { "status": ["open", "in_progress"], "priority": ["high", "critical"] }
  }
}
```

### Checking Completion

```typescript
// Agent calls issues_all_complete
{
  "project": "API Hardening"
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Project progress:\n- Total issues: 5\n- Completed: 3 (60%)\n- In progress: 2 (40%)\n- Open: 0\n\nRemaining issues:\n- 000004: Add rate limiting (in_progress)\n- 000005: Add API key rotation (in_progress)"
  }],
  "isError": false,
  "metadata": {
    "allComplete": false,
    "total": 5,
    "completed": 3,
    "pending": 2
  }
}
```

## Migration from Wingman

For users who already have `.wingman/cockpit/issues/` directories, provide a migration script:

```bash
#!/usr/bin/env bash
# migrate-from-wingman.sh

GIT_ROOT=$(git rev-parse --show-toplevel)
WINGMAN_ISSUES="${GIT_ROOT}/.wingman/cockpit/issues"
WRANGLER_ISSUES="${GIT_ROOT}/.wrangler/issues"

if [ -d "$WINGMAN_ISSUES" ]; then
  echo "Found wingman issues directory, migrating..."
  mkdir -p "$WRANGLER_ISSUES"
  cp -r "${WINGMAN_ISSUES}"/* "${WRANGLER_ISSUES}/"
  echo "✓ Migrated $(find "${WRANGLER_ISSUES}" -name "*.md" | wc -l) issues"
fi

WINGMAN_SPECS="${GIT_ROOT}/.wingman/cockpit/specifications"
WRANGLER_SPECS="${GIT_ROOT}/.wrangler/specifications"

if [ -d "$WINGMAN_SPECS" ]; then
  echo "Found wingman specifications directory, migrating..."
  mkdir -p "$WRANGLER_SPECS"
  cp -r "${WINGMAN_SPECS}"/* "${WRANGLER_SPECS}/"
  echo "✓ Migrated $(find "${WRANGLER_SPECS}" -name "*.md" | wc -l) specifications"
fi
```

## Success Criteria

The integration is complete when:

1. **Automatic Initialization**: `.wrangler/` directory is created automatically when Claude Code starts in a git repository
2. **MCP Server Running**: The wrangler MCP server starts automatically and is discoverable by Claude Code
3. **All Tools Working**: All 11 issue management tools function correctly with validation and error handling
4. **File Storage**: Issues and specifications are stored as markdown files with YAML frontmatter
5. **Git Integration**: `.wrangler/issues/` and `.wrangler/specifications/` are tracked in git
6. **Security**: Path traversal prevention is enforced on all file operations
7. **Observability**: Metrics are collected for all tool invocations
8. **Documentation**: Complete usage documentation with examples

## Future Enhancements (Out of Scope)

These features are NOT included in the initial integration but could be added later:

1. **GitHub Issues Backend**: Optional provider to sync with GitHub Issues API
2. **Linear Backend**: Optional provider to sync with Linear workspace
3. **Issue Templates**: Pre-defined templates for common issue types
4. **Automated Status Transitions**: Workflow-based status changes
5. **Issue Dependencies**: Track blocking relationships between issues
6. **Time Tracking**: Record actual time spent on issues
7. **Commenting**: Add comments to issues (stored in markdown)
8. **Issue Attachments**: Link files/screenshots to issues

## Appendix: Key Differences from Wingman

| Aspect | Wingman | Wrangler Integration |
|--------|---------|---------------------|
| Directory | `.wingman/cockpit/issues/` | `.wrangler/issues/` |
| Workflow Engine | Yes (Mermaid state machines) | No |
| Agent Orchestration | Yes (multi-agent support) | No |
| Terminal UI | Yes (React/Ink) | No |
| MCP Server | Part of larger system | Standalone built-in |
| Configuration | `config.json` with many options | Minimal, just workspace root |
| Workflow State | SQLite database | Not applicable |
| Runtime State | `.wingman/runs/` | Not needed |
| Abort Mechanism | Yes (`abort_create` tool) | No |
| Provider Backends | Extensible (GitHub, Linear) | Markdown only initially |

## Appendix: File Size Estimates

Total estimated lines of code: **~2,900 lines**

Breakdown:
- MCP Server Core: ~1,100 lines
- MCP Tools (11 tools): ~975 lines
- Provider Implementation: ~600 lines
- Type Definitions: ~330 lines
- Observability: ~200 lines
- Scripts & Config: ~100 lines
- Tests: ~600 lines (not counted in integration)

## Appendix: Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "gray-matter": "^4.0.3",
    "fast-glob": "^3.3.0",
    "fs-extra": "^11.2.0",
    "zod": "^3.22.0",
    "zod-to-json-schema": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/fs-extra": "^11.0.0",
    "typescript": "^5.3.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```
