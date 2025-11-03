# Wrangler - Project Context for AI Agents

This document provides essential context for AI agents (Claude Code, etc.) working on the wrangler project.

---

## Project Overview

**Wrangler** is a comprehensive skills library for AI coding assistants, providing:
- **Skills System**: Proven techniques, patterns, and workflows
- **Built-in MCP Server**: Systematic issue and specification management
- **Slash Commands**: Quick access to common workflows
- **Automatic Integration**: Skills and tools activate when relevant

---

## Architecture

### Directory Structure

```
wrangler/
├── skills/                        # Skills library (main value proposition)
│   ├── testing/                   # TDD, async testing, anti-patterns
│   ├── debugging/                 # Systematic debugging workflows
│   ├── collaboration/             # Planning, code review, parallel work
│   └── meta/                      # Meta skills (creating/testing skills)
│
├── mcp/                           # Built-in MCP server (NEW)
│   ├── types/                     # TypeScript type definitions
│   │   ├── config.ts              # MCP configuration types
│   │   ├── issues.ts              # Issue types + Zod schemas
│   │   └── errors.ts              # Error handling types
│   ├── providers/                 # Storage providers
│   │   ├── base.ts                # Abstract provider interface
│   │   ├── factory.ts             # Provider factory
│   │   └── markdown.ts            # Markdown-based storage (540 lines)
│   ├── tools/issues/              # 11 MCP tools for issue management
│   │   ├── create.ts              # issues_create
│   │   ├── list.ts                # issues_list
│   │   ├── search.ts              # issues_search
│   │   ├── update.ts              # issues_update
│   │   ├── get.ts                 # issues_get
│   │   ├── delete.ts              # issues_delete
│   │   ├── labels.ts              # issues_labels
│   │   ├── metadata.ts            # issues_metadata
│   │   ├── projects.ts            # issues_projects
│   │   ├── mark-complete.ts       # issues_mark_complete
│   │   └── all-complete.ts        # issues_all_complete
│   ├── observability/             # Metrics collection
│   │   └── metrics.ts             # Tool invocation metrics
│   ├── server.ts                  # WranglerMCPServer main class
│   ├── index.ts                   # Server entry point
│   ├── tsconfig.json              # TypeScript config
│   ├── dist/                      # Compiled output (gitignored)
│   └── __tests__/                 # Comprehensive test suite (233 tests)
│
├── .wrangler/                     # Workspace for issue tracking
│   ├── issues/                    # Issue tracking (git-tracked)
│   └── specifications/            # Feature specs (git-tracked)
│
├── commands/                      # Slash commands
│   ├── brainstorm.md              # /wrangler:brainstorm
│   ├── write-plan.md              # /wrangler:write-plan
│   └── execute-plan.md            # /wrangler:execute-plan
│
├── hooks/                         # Session hooks
│   ├── session-start.sh           # Auto-initializes .wrangler/
│   └── hooks.json                 # Hook configuration
│
├── .claude-plugin/                # Plugin configuration
│   └── plugin.json                # Includes MCP server config
│
└── docs/                          # Documentation
    └── MCP-USAGE.md               # MCP server user guide
```

---

## MCP Server - Critical Information

### What It Does

The built-in MCP server provides **systematic issue and specification tracking** using markdown files stored in `.wrangler/issues/` and `.wrangler/specifications/`.

### Automatic Initialization

On session start, the `hooks/session-start.sh` script automatically:
1. Detects git repository root
2. Creates `.wrangler/issues/` directory
3. Creates `.wrangler/specifications/` directory
4. Adds `.gitkeep` files to track empty directories
5. Updates `.gitignore` appropriately

**This happens automatically - no manual setup required.**

### Issue Storage Format

Issues are stored as **Markdown files with YAML frontmatter**:

**File naming**: `{counter}-{slug}.md` (e.g., `000001-add-authentication.md`)

**Example issue**:
```markdown
---
id: "000001"
title: "Implement authentication system"
type: "issue"                      # "issue" or "specification"
status: "open"                     # "open", "in_progress", "closed", "cancelled"
priority: "high"                   # "low", "medium", "high", "critical"
labels: ["backend", "security"]
assignee: "claude-code"
project: "Auth Refactor"
createdAt: "2024-10-29T10:00:00.000Z"
updatedAt: "2024-10-29T10:00:00.000Z"
wranglerContext:
  agentId: "claude-code"
  parentTaskId: "000000"
  estimatedEffort: "2 days"
---

## Description

Implement a secure authentication system using OAuth2...

### Requirements
- Support JWT tokens
- Rate limiting
```

### Available MCP Tools

When working with issues, you have access to these 11 tools:

1. **issues_create** - Create new issues or specifications
2. **issues_list** - List issues with filtering (status, priority, labels, etc.)
3. **issues_search** - Full-text search across title, description, labels
4. **issues_get** - Retrieve single issue by ID
5. **issues_update** - Update issue fields
6. **issues_delete** - Delete issues (requires confirmation)
7. **issues_labels** - Manage labels (list/add/remove)
8. **issues_metadata** - Manage wranglerContext metadata
9. **issues_projects** - Manage project assignments
10. **issues_mark_complete** - Mark issues as closed
11. **issues_all_complete** - Check completion status across issues

### When to Use Issues

**CREATE ISSUES WHEN:**
- Planning multi-step implementations
- Tracking bugs or technical debt
- Coordinating work across subagents
- Managing feature specifications
- Breaking down complex tasks

**DON'T CREATE ISSUES FOR:**
- Single, simple tasks
- Trivial changes
- Informational queries

---

## Development Workflow

### Test-Driven Development (MANDATORY)

**All code MUST follow TDD**:
1. **RED**: Write failing test first
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Improve code quality

**Testing commands**:
```bash
npm run test:mcp              # Run all MCP tests
npm run build:mcp             # Build MCP server
npm run watch:mcp             # Watch mode for development
```

**Current test status**: 233 tests, all passing, 87.11% coverage

### Working with MCP Code

**Location**: All MCP code is in `mcp/` directory

**TypeScript compilation**:
- Source: `mcp/**/*.ts`
- Output: `mcp/dist/**/*.js`
- Config: `mcp/tsconfig.json`

**Adding new tools**:
1. Create tool file in `mcp/tools/issues/{name}.ts`
2. Write comprehensive tests FIRST in `mcp/__tests__/tools/issues/{name}.test.ts`
3. Implement Zod schema for validation
4. Implement tool function returning MCP-compliant response
5. Register in `mcp/server.ts` switch statement
6. Add to `getAvailableTools()` list
7. Export from `mcp/tools/issues/index.ts`

**Tool implementation pattern**:
```typescript
// 1. Zod schema
export const myToolSchema = z.object({
  param: z.string().min(1)
});

// 2. Type
export type MyToolParams = z.infer<typeof myToolSchema>;

// 3. Tool function
export async function myTool(
  params: MyToolParams,
  providerFactory: ProviderFactory
): Promise<CallToolResult> {
  try {
    const provider = providerFactory.getIssueProvider();
    // ... implementation
    return createSuccessResponse(message, metadata);
  } catch (error) {
    return createErrorResponse(MCPErrorCode.TOOL_EXECUTION_ERROR, error.message);
  }
}
```

### Working with Skills

**Location**: All skills are in `skills/` directory

**Skill structure**:
```
skills/{category}/{skill-name}/
├── SKILL.md                   # Skill content (markdown)
└── example.ts                 # Optional usage example
```

**Creating new skills**: Follow the `skills/meta/writing-skills/SKILL.md` guide

---

## Code Standards

### TypeScript

- **Strict mode**: Enabled
- **Target**: ES2022
- **Module**: Node16 (ESM)
- **All types must be explicit**
- **Use Zod for runtime validation**

### Testing

- **Framework**: Jest with ts-jest
- **Coverage requirement**: 80%+ (currently at 87%)
- **Test location**: `mcp/__tests__/`
- **Pattern**: `**/*.test.ts`

### Error Handling

**Always use MCPErrorCode enum**:
- `VALIDATION_ERROR` - Zod validation failures
- `RESOURCE_NOT_FOUND` - Missing issues/files
- `PERMISSION_DENIED` - Access denied
- `TOOL_EXECUTION_ERROR` - General tool errors
- `PATH_TRAVERSAL_DENIED` - Security violation

**Error response format**:
```typescript
return createErrorResponse(
  MCPErrorCode.VALIDATION_ERROR,
  "Clear error message",
  { context: additionalInfo }
);
```

### Security

**Path traversal prevention is MANDATORY**:
```typescript
private assertWithinWorkspace(targetPath: string, action: string): void {
  const resolvedTarget = path.resolve(targetPath);
  const relative = path.relative(this.basePath, resolvedTarget);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Attempted to ${action} outside of workspace`);
  }
}
```

**Always validate paths before file operations.**

---

## Common Tasks

### Running Tests

```bash
# All tests
npm run test:mcp

# Watch mode
npm run test:mcp -- --watch

# Coverage report
npm run test:mcp -- --coverage

# Specific test file
npm run test:mcp -- mcp/__tests__/server.test.ts
```

### Building

```bash
# Build MCP server
npm run build:mcp

# Watch mode (auto-rebuild on changes)
npm run watch:mcp

# Clean build
rm -rf mcp/dist && npm run build:mcp
```

### Debugging MCP Server

```bash
# Enable debug mode
WRANGLER_MCP_DEBUG=true npm run mcp:dev

# Debug output will show:
# - Tool invocations with parameters
# - Execution results
# - Error stack traces
# - Server lifecycle events
```

### Creating Issues Programmatically

```typescript
// Example: Create issue via MCP tool
const result = await createIssueTool({
  title: "Implement new feature",
  description: "Detailed description...",
  type: "issue",
  status: "open",
  priority: "high",
  labels: ["backend", "api"],
  project: "Q4 Roadmap",
  wranglerContext: {
    agentId: "implementation-agent",
    estimatedEffort: "2 days"
  }
}, providerFactory);
```

---

## Project Philosophy

### Core Principles

1. **Test-Driven Development** - Write tests first, always
2. **Systematic over ad-hoc** - Follow documented processes
3. **Complexity reduction** - Simplicity as primary goal
4. **Evidence over claims** - Verify before declaring success
5. **Domain over implementation** - Work at problem level

### Skills Philosophy

- **Skills are mandatory when available** - If a skill exists for your task, you MUST use it
- **Skills activate automatically** - Claude Code discovers and uses relevant skills
- **Skills are proven patterns** - Battle-tested, not experimental

### MCP Philosophy

- **Issues track work, not ideas** - Create issues for actionable work items
- **Markdown is the source of truth** - Files in `.wrangler/` are authoritative
- **Git tracks everything** - All issues/specs are version controlled
- **Counter-based IDs** - Sequential numbering (000001, 000002...)

---

## Known Limitations

### MCP Server

1. **Concurrent ID Generation**: Race conditions possible when creating issues in parallel
   - **Workaround**: Use sequential creation
   - **Future fix**: Implement file-based locking

2. **Branch Coverage**: 71.37% (below 80% target for some error paths)
   - **Impact**: Main paths thoroughly tested, some edge cases not
   - **Future fix**: Add tests for remaining error branches

3. **Large Workspace Performance**: Slows down with >1,000 issues
   - **Workaround**: Archive old issues periodically
   - **Future fix**: Implement indexing/caching

### General

- **No workflow engine** - Unlike wingman, wrangler doesn't have workflow automation
- **Markdown-only provider** - GitHub/Linear backends not yet implemented
- **No issue templates** - Future enhancement

---

## Quick Reference

### File Locations

- **MCP Server Entry**: `mcp/index.ts`
- **Server Class**: `mcp/server.ts`
- **Provider**: `mcp/providers/markdown.ts`
- **Tools**: `mcp/tools/issues/*.ts`
- **Tests**: `mcp/__tests__/**/*.test.ts`
- **Config**: `.claude-plugin/plugin.json`
- **Issues**: `.wrangler/issues/*.md`
- **Specs**: `.wrangler/specifications/*.md`

### Important Commands

```bash
npm run build:mcp              # Build MCP server
npm run test:mcp               # Run all tests
npm run watch:mcp              # Watch mode
npm run mcp:dev                # Debug mode
```

### Environment Variables

- `WRANGLER_MCP_DEBUG` - Enable verbose logging (true/false)
- `WRANGLER_MCP_NAME` - Server name (default: "wrangler-mcp")
- `WRANGLER_MCP_VERSION` - Server version (default: "1.0.0")
- `WRANGLER_WORKSPACE_ROOT` - Workspace root (default: process.cwd())

### Coverage Targets

- **Statements**: 80%+ (currently 84.68%)
- **Branches**: 80%+ (currently 71.37% - needs improvement)
- **Functions**: 80%+ (currently 93.5%)
- **Lines**: 80%+ (currently 86.02%)

---

## Dependencies

### Production

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `gray-matter` - YAML frontmatter parsing
- `fast-glob` - Efficient file scanning
- `fs-extra` - Enhanced file operations
- `zod` - Runtime schema validation
- `zod-to-json-schema` - Convert Zod to JSON Schema

### Development

- `typescript` - TypeScript compiler
- `jest` - Testing framework
- `ts-jest` - TypeScript preprocessor for Jest
- `@types/node` - Node.js type definitions
- `@types/fs-extra` - fs-extra type definitions
- `@types/jest` - Jest type definitions

---

## Documentation Resources

### For Users

- **[README.md](README.md)** - Quick start and overview
- **[docs/MCP-USAGE.md](docs/MCP-USAGE.md)** - Comprehensive MCP usage guide
  - Getting started
  - All 11 tools with examples
  - Workflows and best practices
  - Troubleshooting

### For Developers

- **[mcp/README.md](mcp/README.md)** - Technical implementation guide
  - Architecture overview
  - Component descriptions
  - TDD development guide
  - Testing guide
  - API reference

### Implementation Documentation

- **[SPEC-WRANGLER-MCP-INTEGRATION.md](SPEC-WRANGLER-MCP-INTEGRATION.md)** - Original specification
- **[IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)** - Detailed implementation report
- **[mcp/__tests__/INTEGRATION_TEST_REPORT.md](mcp/__tests__/INTEGRATION_TEST_REPORT.md)** - Test results

---

## Contact & Support

**Project Owner**: Sam Hecht (samjhecht@gmail.com)
**License**: MIT
**Repository**: wrangler-marketplace/wrangler

---

## Version History

### v1.0.0 (October 29, 2024)

**Initial Release**:
- ✅ Skills library (testing, debugging, collaboration, meta)
- ✅ Built-in MCP server with 11 issue management tools
- ✅ Automatic workspace initialization
- ✅ Markdown-based issue storage
- ✅ 233 comprehensive tests (87.11% coverage)
- ✅ Complete documentation suite

---

## Quick Start for New Agents

1. **Understand the dual nature**: Wrangler is both a skills library AND an MCP server
2. **Check if .wrangler/ exists**: If not, it will be created automatically on session start
3. **Use issues for planning**: Create issues for complex, multi-step work
4. **Follow TDD strictly**: Write tests first, always
5. **Consult skills**: Check `skills/` directory for relevant workflows
6. **Read the docs**: Start with `docs/MCP-USAGE.md` for MCP features

---

**Last Updated**: October 29, 2024
**Document Version**: 1.0.0
